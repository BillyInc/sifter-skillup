"""Fill empty JAMB-scope outcomes from the linked canonical CCMAS record.

This is an internal consistency repair, not a new curriculum inference.  It
only fills an empty ``selected_courses[].learning_outcomes`` field when the
selected course resolves to one canonical CCMAS package/programme and that
course already has a non-empty source-backed outcome list.  Existing selected
outcomes, course choices, source components, and domain links are untouched.
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
OUT_BASE = ROOT / "_audit" / "canonical_ccmas_outcome_propagation_2026-09-29"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm_code(value: Any) -> str:
    return " ".join(str(value or "").upper().replace(":", " ").split())


def outcome_list(course: dict[str, Any]) -> list[str]:
    raw = course.get("learning_outcomes") or course.get("skills_learned") or []
    if not isinstance(raw, list):
        return []
    return [str(item).strip() for item in raw if str(item).strip()]


def build_catalogue() -> tuple[
    dict[tuple[str, str, str], dict[str, Any]],
    set[tuple[str, str, str]],
    set[tuple[str, str, str]],
]:
    catalogue: dict[tuple[str, str, str], dict[str, Any]] = {}
    ambiguous: set[tuple[str, str, str]] = set()
    equivalent_duplicates: set[tuple[str, str, str]] = set()
    for path in sorted(CCMAS_DIR.glob("*.json")):
        package = load(path)
        for programme in package.get("programmes", []):
            programme_name = str(programme.get("name") or "")
            for course in programme.get("courses", []):
                key = (path.name, programme_name, norm_code(course.get("code")))
                if key in catalogue:
                    existing = catalogue[key]
                    if outcome_list(existing) and outcome_list(existing) == outcome_list(course):
                        # Some CCMAS package files repeat a course under two
                        # pathway headings.  If the authoritative outcome
                        # payload is identical, it is safe for this
                        # outcome-only propagation to reuse either record.
                        equivalent_duplicates.add(key)
                    else:
                        ambiguous.add(key)
                        catalogue.pop(key, None)
                    continue
                if key in ambiguous:
                    continue
                catalogue[key] = course
    return catalogue, ambiguous, equivalent_duplicates


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    scopes = load(SCOPES)
    catalogue, ambiguous_catalogue_keys, equivalent_duplicate_keys = build_catalogue()
    changes: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []

    for row in scopes.get("rows", []):
        for selected in row.get("selected_courses", []):
            if selected.get("source_kind") == "external_curriculum":
                continue
            source_file = selected.get("source_ccmas_file")
            programme = selected.get("source_ccmas_programme")
            code = norm_code(selected.get("code"))
            if not source_file or not programme or not code:
                continue
            key = (source_file, programme, code)
            if key in ambiguous_catalogue_keys:
                skipped.append({"jamb_name": row.get("jamb_name"), "code": code, "reason": "canonical_course_ambiguous"})
                continue
            source = catalogue.get(key)
            if not source:
                skipped.append({"jamb_name": row.get("jamb_name"), "code": code, "reason": "canonical_course_not_found"})
                continue
            before = selected.get("learning_outcomes")
            if before:
                continue
            outcomes = outcome_list(source)
            if not outcomes:
                skipped.append({"jamb_name": row.get("jamb_name"), "code": code, "reason": "canonical_outcomes_empty"})
                continue
            after = copy.deepcopy(outcomes)
            changes.append({
                "jamb_name": row.get("jamb_name"),
                "source_key": f"{source_file}::{programme}",
                "course_code": code,
                "before": before or [],
                "after": after,
                "source_basis": "canonical CCMAS course record already selected by the JAMB scope",
            })
            if not args.dry_run:
                selected["learning_outcomes"] = after

    suffix = "_dry_run" if args.dry_run else "_applied"
    report = {
        "schema": "2026-09-29.canonical-ccmas-outcome-propagation.v1",
        "generated_on": date.today().isoformat(),
        "status": "dry_run_ready" if args.dry_run else "applied",
        "dry_run": args.dry_run,
        "counts": {
            "selected_outcome_records_filled": len(changes),
            "skipped": len(skipped),
            "ambiguous_canonical_course_keys": len(ambiguous_catalogue_keys),
            "equivalent_duplicate_course_keys": len(equivalent_duplicate_keys),
            "distinct_jamb_names_changed": len({item["jamb_name"] for item in changes}),
            "domain_links_changed": 0,
            "course_selection_changed": 0,
        },
        "changes": changes,
        "skipped": skipped,
        "limits": [
            "Only empty selected outcome arrays are filled.",
            "This does not overwrite non-empty outcomes or adjudicate a source mismatch.",
            "This does not change JAMB components, course selection, or domain links.",
        ],
    }
    if not args.dry_run:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_json = OUT_BASE.with_name(OUT_BASE.name + suffix + ".json")
    out_md = OUT_BASE.with_name(OUT_BASE.name + suffix + ".md")
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text(
        "# Canonical CCMAS outcome propagation — 2026-09-29\n\n"
        f"Status: `{report['status']}`\n\n"
        "## Counts\n\n"
        + "\n".join(f"- **{key}:** {value}" for key, value in report["counts"].items())
        + "\n\n"
        + "\n".join(f"- {item}" for item in report["limits"])
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": report["status"], "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
