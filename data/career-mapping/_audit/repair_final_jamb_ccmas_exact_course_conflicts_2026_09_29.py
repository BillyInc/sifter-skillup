"""Repair the remaining exact-key JAMB/CCMAS course conflicts.

The targets are deliberately explicit and source-backed.  This is not a
title-only inference: each selected JAMB row already names the CCMAS file,
programme and course code.  Duplicate codes are resolved by the selected
course title, and only the authoritative NUC CCMAS payload is copied.
"""

from __future__ import annotations

import argparse
import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
SCOPES = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"
OUT_BASE = ROOT / "_audit" / "final_jamb_ccmas_exact_course_repairs_2026-09-29"

TARGETS = {
    ("administration_management.json", "Accounting", "ACC 403"): {},
    ("engineering.json", "ELECTRICAL ENGINEERING", "GET 204"): {},
    ("allied_health.json", "Public Health", "PHS 202"): {},
    ("arts.json", "Modern European Languages (Russian)", "RUS 361"): {
        "title": "Oral Expression and comprehension in Russian",
    },
}

RUSSIAN_ORAL_OUTCOMES = [
    "acquire adequate communication skills",
    "demonstrate oral expression and conversational interaction",
    "communicate fluently in Russian",
]


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def code(value: Any) -> str:
    return " ".join(str(value or "").upper().split())


def source_outcomes(course: dict[str, Any]) -> list[str]:
    return list(course.get("learning_outcomes") or course.get("skills_learned") or [])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    packages = {path.name: load(path) for path in sorted(CCMAS_DIR.glob("*.json"))}
    scopes = load(SCOPES)
    changes: list[dict[str, Any]] = []
    source_repairs: list[dict[str, Any]] = []

    # Clean two known extraction artefacts in the authoritative CCMAS records
    # before propagating their exact course payloads.
    public_health = packages["allied_health.json"]
    for programme in public_health.get("programmes", []):
        if programme.get("name") != "Public Health":
            continue
        for course in programme.get("courses", []):
            if code(course.get("code")) != "PHS 202":
                continue
            clean = [
                "demonstrate knowledge of interval estimation and hypothesis testing",
                "apply the correct statistical method to analyse one or more variables",
                "interpret statistical results effectively and correctly",
                "appreciate the importance of data and demonstrate reasonable statistical skills; and",
                "explain the concept of sampling from a study population in a health study",
            ]
            if course.get("skills_learned") != clean:
                source_repairs.append({"source_key": "allied_health.json::Public Health", "course_code": "PHS 202", "field": "skills_learned", "before": copy.deepcopy(course.get("skills_learned")), "after": clean, "reason": "removed extracted PDF page footer from the fifth outcome"})
                if not args.dry_run:
                    course["skills_learned"] = clean

    arts = packages["arts.json"]
    for programme in arts.get("programmes", []):
        if programme.get("name") != "Modern European Languages (Russian)":
            continue
        for course in programme.get("courses", []):
            if code(course.get("code")) == "RUS 361" and norm(course.get("title")) == norm(RUSSIAN_ORAL_OUTCOMES and "Oral Expression and comprehension in Russian"):
                if course.get("skills_learned") != RUSSIAN_ORAL_OUTCOMES:
                    source_repairs.append({"source_key": "arts.json::Modern European Languages (Russian)", "course_code": "RUS 361", "field": "skills_learned", "before": copy.deepcopy(course.get("skills_learned")), "after": RUSSIAN_ORAL_OUTCOMES, "reason": "split the three numbered outcomes from the NUC course block"})
                    if not args.dry_run:
                        course["skills_learned"] = RUSSIAN_ORAL_OUTCOMES

    for row in scopes.get("rows", []):
        for selected in row.get("selected_courses", []):
            key = (selected.get("source_ccmas_file"), selected.get("source_ccmas_programme"), code(selected.get("code")))
            if key not in TARGETS:
                continue
            target = TARGETS[key]
            if target.get("title") and norm(selected.get("title")) != norm(target["title"]):
                continue
            package = packages.get(key[0])
            programmes = [p for p in (package or {}).get("programmes", []) if p.get("name") == key[1]]
            candidates = [c for p in programmes for c in p.get("courses", []) if code(c.get("code")) == key[2]]
            if target.get("title"):
                candidates = [c for c in candidates if norm(c.get("title")) == norm(target["title"])]
            if len(candidates) > 1:
                clean_candidates = [
                    c for c in candidates
                    if not any("allied health sciences" in norm(item) for item in source_outcomes(c))
                ]
                if len(clean_candidates) == 1:
                    candidates = clean_candidates
                elif clean_candidates and all(
                    source_outcomes(candidate) == source_outcomes(clean_candidates[0])
                    for candidate in clean_candidates[1:]
                ):
                    candidates = [clean_candidates[0]]
            if len(candidates) != 1:
                continue
            source = candidates[0]
            outcomes = source_outcomes(source)
            if not outcomes:
                continue
            field_values = {"learning_outcomes": outcomes}
            if key[2] == "GET 204":
                field_values["content_summary"] = source.get("content_summary")
            for field, after in field_values.items():
                if after in (None, "", []):
                    continue
                before = copy.deepcopy(selected.get(field))
                if norm(before) == norm(after):
                    continue
                changes.append({"jamb_name": row.get("jamb_name"), "source_key": f"{key[0]}::{key[1]}", "course_code": key[2], "field": field, "before": before, "after": copy.deepcopy(after), "basis": "exact CCMAS file/programme/course key; selected title resolves duplicate code where applicable"})
                if not args.dry_run:
                    selected[field] = copy.deepcopy(after)

    if not args.dry_run:
        for filename, package in packages.items():
            if filename in {"allied_health.json", "arts.json"}:
                (CCMAS_DIR / filename).write_text(json.dumps(package, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    status = "dry_run_ready" if args.dry_run else "applied"
    report = {"schema": "2026-09-29.final-jamb-ccmas-exact-course-repairs.v1", "generated_on": date.today().isoformat(), "status": status, "dry_run": args.dry_run, "counts": {"source_repairs": len(source_repairs), "selected_course_repairs": len(changes), "domain_links_changed": 0, "course_selection_changed": 0}, "source_repairs": source_repairs, "selected_course_repairs": changes, "limits": ["Only explicit exact-key targets were changed.", "No JAMB component selection or domain mapping was changed."]}
    suffix = "_dry_run" if args.dry_run else "_applied"
    out_json = OUT_BASE.with_name(OUT_BASE.name + suffix + ".json")
    out_md = OUT_BASE.with_name(OUT_BASE.name + suffix + ".md")
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text("# Final JAMB↔CCMAS exact-course repairs — 2026-09-29\n\n" + f"Status: `{status}`\n\n" + "\n".join(f"- **{k}:** {v}" for k, v in report["counts"].items()) + "\n", encoding="utf-8")
    print(json.dumps({"status": status, "counts": report["counts"], "json": str(out_json)}, indent=2))


if __name__ == "__main__":
    main()
