"""Guarded sync for uniquely source-backed selected CCMAS outcomes."""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
DETAILS = AUDIT / "ccmas_full_course_detail_candidates_original_2026-09-29-pass3.json"
OUT_BASE = AUDIT / "jamb_ccmas_unique_outcome_sync_2026-09-29"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def compact_outcome(value: Any) -> str:
    return " ".join(re.sub(r"[^a-z0-9 ]", "", str(value or "").casefold()).split())


def code_key(value: Any) -> str:
    return " ".join(str(value or "").upper().split())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    suffix = "_dry_run" if args.dry_run else "_applied"
    out_json = OUT_BASE.with_name(OUT_BASE.name + suffix + ".json")
    out_md = OUT_BASE.with_name(OUT_BASE.name + suffix + ".md")
    scopes = load(SCOPES)
    details = load(DETAILS)
    detail_state: dict[tuple[str, str, str], dict[str, Any]] = {}
    package_cache: dict[str, dict[str, Any]] = {}
    for record in details.get("course_record_queue", []):
        source_key = record.get("source_key", "")
        source_file, _, programme = source_key.partition("::")
        code = code_key(record.get("course_code"))
        candidate_data = record.get("automated_detail_candidates") or {}
        candidates = candidate_data.get("candidates") or []
        detail_state[(source_file, programme, code)] = {
            "state": candidate_data.get("state"),
            "candidate_count": len(candidates),
            "candidate_pages": sorted({item.get("extracted_page_ordinal") for item in candidates if item.get("extracted_page_ordinal") is not None}),
        }

    changes: list[dict[str, Any]] = []
    skipped = Counter()
    for row in scopes.get("rows", []):
        for selected in row.get("selected_courses", []):
            key = (
                selected.get("source_ccmas_file"),
                selected.get("source_ccmas_programme"),
                code_key(selected.get("code")),
            )
            detail = detail_state.get(key)
            if not detail or detail["state"] not in {"one_exact_detail_candidate", "one_exact_equivalent_detail_candidate"} or detail["candidate_count"] != 1:
                skipped["not_unique_source_candidate"] += 1
                continue
            source_outcomes = selected.get("learning_outcomes")
            # The current selected snapshot is the pre-repair value.  The
            # canonical CCMAS package is already updated by the guarded
            # original-PDF pass; use its source-backed outcome list.
            package_path = ROOT / "ccmas" / str(selected.get("source_ccmas_file"))
            if not package_path.exists():
                skipped["package_missing"] += 1
                continue
            package_name = package_path.name
            if package_name not in package_cache:
                package_cache[package_name] = load(package_path)
            package = package_cache[package_name]
            programmes = [p for p in package.get("programmes", []) if p.get("name") == selected.get("source_ccmas_programme")]
            courses = [c for p in programmes for c in p.get("courses", []) if code_key(c.get("code")) == key[2]]
            if len(programmes) != 1 or len(courses) != 1:
                skipped["package_course_not_unique"] += 1
                continue
            source_course = courses[0]
            target_outcomes = source_course.get("skills_learned") or []
            if not target_outcomes or not source_outcomes:
                skipped["missing_outcome_list"] += 1
                continue
            selected_norm = [compact_outcome(item) for item in source_outcomes]
            target_norm = [compact_outcome(item) for item in target_outcomes]
            if selected_norm == target_norm:
                skipped["already_equivalent"] += 1
                continue
            if not all(item in target_norm for item in selected_norm):
                skipped["selected_not_subset_of_source"] += 1
                continue
            before = copy.deepcopy(source_outcomes)
            if not args.dry_run:
                selected["learning_outcomes"] = copy.deepcopy(target_outcomes)
            changes.append({
                "jamb_name": row.get("jamb_name"),
                "source_file": key[0],
                "programme": key[1],
                "course_code": key[2],
                "before": before,
                "after": copy.deepcopy(target_outcomes),
                "source_candidate_state": detail["state"],
                "source_candidate_pages": detail["candidate_pages"],
                "guard": "one exact/or exact-equivalent original-PDF candidate; unique package/course key; selected outcomes are a subset after punctuation normalization",
            })
    if not args.dry_run:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output = {
        "schema": "2026-09-29.jamb-ccmas-unique-outcome-sync.v1",
        "generated_on": date.today().isoformat(),
        "status": "dry_run_ready" if args.dry_run else "applied",
        "dry_run": args.dry_run,
        "counts": {"scope_rows_seen": len(scopes.get("rows", [])), "changes": len(changes), "skipped": dict(skipped)},
        "changes": changes,
        "limits": [
            "Only selected JAMB learning-outcome snapshots were synchronized.",
            "Component scope, source offering rows and downstream mappings were not changed.",
            "Context-conflicted, multi-candidate and non-subset cases remain in the residual queue.",
        ],
    }
    out_json.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text("\n".join([
        "# JAMB↔CCMAS unique outcome sync — 2026-09-29",
        "",
        f"Status: `{output['status']}`",
        "",
        f"- Changes: **{len(changes)}**",
        f"- Scope rows scanned: **{len(scopes.get('rows', []))}**",
        "",
        "Only uniquely source-backed, subset-safe outcomes were synchronized. Residual conflicts remain queued.",
        "",
    ]), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), **output["counts"]}, indent=2))


if __name__ == "__main__":
    main()
