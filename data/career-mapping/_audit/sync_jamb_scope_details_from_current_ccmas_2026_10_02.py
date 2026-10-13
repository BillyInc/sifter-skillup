"""Guardedly refresh JAMB curriculum snapshots from their declared CCMAS source.

The JAMB scope stores a source package and course code on each selected course.
This script updates only descriptive/workload fields from that exact CCMAS row;
it never changes programme scope, course selection, domain links, or provenance.
Ambiguous duplicate codes and missing source rows are reported, not guessed.
"""

from __future__ import annotations

import argparse
import copy
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import (
    norm as source_norm,
    package_registry,
    resolve_course_source_row,
)


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
OUT_BASE = AUDIT / f"jamb_scope_ccmas_detail_sync_{date.today().isoformat()}"
SYNC_FIELDS = {
    "title": "title",
    "units": "units",
    "status": "status",
    "lecture_hours": "lh",
    "practical_hours": "ph",
    "content_summary": "content_summary",
    "learning_outcomes": "skills_learned",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write uniquely resolved source details into the scope ledger")
    args = parser.parse_args()

    scopes = load(SCOPES)
    _, package_by_key, course_index = package_registry()

    changes: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()
    distinct_changed: set[tuple[str, str, str]] = set()

    for scope in scopes.get("rows", []):
        jamb_name = scope.get("jamb_name")
        for selected in scope.get("selected_courses", []):
            source_file = selected.get("source_ccmas_file")
            programme = selected.get("source_ccmas_programme")
            code = " ".join(str(selected.get("code") or "").upper().split())
            if not source_file or not programme or not code:
                counts["missing_declared_ccmas_identity"] += 1
                continue
            if selected.get("source_kind") == "external_curriculum":
                counts["external_course_untouched"] += 1
                continue
            candidates = [
                course for course in course_index.get((source_file, source_norm(programme), source_norm(code)), [])
                if course.get("code")
            ]
            if not candidates:
                # A code typo can be repaired only when the exact declared
                # package contains one uniquely matching full course title.
                # Do not use fuzzy title similarity or cross-package matching.
                title_key = source_norm(selected.get("title"))
                title_candidates = [
                    course
                    for course in package_by_key.get((source_file, source_norm(programme)), {}).get("courses", [])
                    if title_key and source_norm(course.get("title")) == title_key and course.get("code")
                ]
                if len(title_candidates) == 1:
                    candidates = title_candidates
                    counts["uniquely_corrected_source_course_code"] += 1
                else:
                    counts["exact_ccmas_course_not_found"] += 1
                    unresolved.append({"jamb_name": jamb_name, "source_file": source_file, "programme": programme, "code": code, "reason": "no exact package+course-code row and title did not uniquely resolve", "exact_title_candidate_count": len(title_candidates)})
                    continue
            source = resolve_course_source_row(selected, candidates)
            if source is None:
                counts["duplicate_code_variant_ambiguous"] += 1
                unresolved.append({"jamb_name": jamb_name, "source_file": source_file, "programme": programme, "code": code, "reason": "duplicate course-code rows not uniquely resolved by current identity/details", "candidate_count": len(candidates)})
                continue

            before: dict[str, Any] = {}
            after: dict[str, Any] = {}
            source_code = " ".join(str(source.get("code") or "").upper().split())
            if code != source_code:
                before["code"] = code
                after["code"] = source_code
            for target_field, source_field in SYNC_FIELDS.items():
                source_value = source.get(source_field)
                if target_field == "learning_outcomes":
                    source_value = source_value or []
                    current_value = selected.get(target_field) or []
                else:
                    current_value = selected.get(target_field)
                if norm(current_value) != norm(source_value):
                    before[target_field] = copy.deepcopy(current_value)
                    after[target_field] = copy.deepcopy(source_value)

            if not after:
                counts["already_matches_current_ccmas"] += 1
                continue
            for target_field, source_value in after.items():
                selected[target_field] = copy.deepcopy(source_value)
                counts[f"field_changed:{target_field}"] += 1
            counts["selected_course_rows_changed"] += 1
            distinct_changed.add((source_file, programme, code))
            changes.append({
                "jamb_name": jamb_name,
                "source_file": source_file,
                "source_programme": programme,
                "course_code": code,
                "corrected_course_code": after.get("code", code),
                "changed_fields": sorted(after),
                "before": before,
                "after": after,
                "source_row_identity": {"title": source.get("title"), "units": source.get("units"), "status": source.get("status"), "lh": source.get("lh"), "ph": source.get("ph")},
            })

    if not args.apply:
        # Restore the in-memory scope; the dry run is non-mutating by contract.
        status = "dry_run"
    else:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        status = "applied"

    result = {
        "schema": "2026-10-02.jamb-scope-current-ccmas-detail-sync.v1",
        "status": status,
        "scope_rows": len(scopes.get("rows", [])),
        "ccmas_packages_loaded": len(package_by_key),
        "unique_ccmas_course_keys_changed": len(distinct_changed),
        "counts": dict(sorted(counts.items())),
        "changes": changes,
        "unresolved": unresolved,
        "guardrails": [
            "Only selected-course descriptive/workload snapshots are synchronized.",
            "CCMAS authority is the exact declared source file + package + course code; a code correction is allowed only when the exact existing title resolves once within that same package.",
            "Selected-course membership, component scope, domain links, and all source/provenance fields are preserved.",
            "External/custom curriculum rows and unresolved identities are not overwritten.",
        ],
    }
    out_json = OUT_BASE.with_name(OUT_BASE.name + ("_applied.json" if args.apply else "_dry_run.json"))
    out_md = OUT_BASE.with_name(OUT_BASE.name + ("_applied.md" if args.apply else "_dry_run.md"))
    out_json.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        f"# JAMB scope refresh from current CCMAS — {date.today().isoformat()}",
        "",
        f"Status: `{status}`",
        "",
        f"- JAMB rows scanned: **{result['scope_rows']}**",
        f"- Unique CCMAS course keys with changes: **{result['unique_ccmas_course_keys_changed']}**",
        f"- Selected-course rows changed: **{counts['selected_course_rows_changed']}**",
        f"- Unresolved exact source identities: **{len(unresolved)}**",
        "",
        "## Counts",
        "",
        *[f"- `{key}`: {value}" for key, value in sorted(counts.items())],
        "",
        "The JSON companion lists every before/after field and unresolved source identity. This operation does not alter domain assignments.",
    ]
    out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": status, "unique_ccmas_course_keys_changed": len(distinct_changed), "counts": result["counts"], "unresolved": len(unresolved)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
