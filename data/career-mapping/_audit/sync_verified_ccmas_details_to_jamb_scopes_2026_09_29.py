"""Propagate verified CCMAS course details into JAMB selected-course snapshots.

This does not change component selection, JAMB identities, or domain links. It
only synchronizes a selected course's descriptive fields when the corresponding
CCMAS course has one exact (or exact-equivalent) structured PDF candidate.
"""

from __future__ import annotations

import argparse
import copy
import json
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
DETAILS = AUDIT / "jamb_ccmas_course_detail_candidates_2026-09-29.json"
OUT_BASE = AUDIT / "jamb_scope_verified_ccmas_detail_sync_2026-09-29"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    return " ".join(str(value or "").split()).casefold()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    suffix = "_dry_run" if args.dry_run else "_applied"
    out_json = OUT_BASE.with_name(OUT_BASE.name + suffix + ".json")
    out_md = OUT_BASE.with_name(OUT_BASE.name + suffix + ".md")

    details = load(DETAILS)
    scopes_doc = load(SCOPES)
    ccmas_by_key: dict[str, dict[str, Any]] = {}
    for path in sorted((ROOT / "ccmas").glob("*.json")):
        doc = load(path)
        for programme in doc.get("programmes", []):
            ccmas_by_key[f"{path.name}::{programme.get('name')}"] = programme

    verified: set[tuple[str, str]] = set()
    for record in details["course_record_queue"]:
        state = record.get("automated_detail_candidates", {}).get("state")
        if state in {"one_exact_detail_candidate", "one_exact_equivalent_detail_candidate"}:
            candidate = (record.get("automated_detail_candidates", {}).get("candidates") or [None])[0]
            workload = candidate.get("workload") if candidate else None
            if candidate and workload and workload.get("units") is not None and candidate.get("outcomes_text"):
                verified.add((record["source_key"], " ".join(record["course_code"].upper().split())))

    fields = ("title", "units", "status", "lecture_hours", "practical_hours", "content_summary", "learning_outcomes")
    counts = Counter(records_seen=len(scopes_doc.get("rows", [])), verified_course_keys=len(verified))
    changes: list[dict[str, Any]] = []
    for row in scopes_doc.get("rows", []):
        for selected in row.get("selected_courses", []):
            source_file = selected.get("source_ccmas_file")
            source_programme = selected.get("source_ccmas_programme")
            code = " ".join(str(selected.get("code") or "").upper().split())
            source_key = f"{source_file}::{source_programme}" if source_file and source_programme else ""
            if (source_key, code) not in verified:
                continue
            programme = ccmas_by_key.get(source_key)
            source_course = next((course for course in (programme or {}).get("courses", []) if " ".join(str(course.get("code") or "").upper().split()) == code), None)
            if not source_course:
                counts["verified_source_course_missing"] += 1
                continue
            field_changes = []
            for field in fields:
                source_field = "lh" if field == "lecture_hours" else "ph" if field == "practical_hours" else field
                before = copy.deepcopy(selected.get(field))
                if field == "learning_outcomes":
                    # CCMAS source packages use ``skills_learned`` for the
                    # same source-derived outcome list stored as
                    # ``learning_outcomes`` in the JAMB scope contract.
                    after = copy.deepcopy(
                        source_course.get("learning_outcomes")
                        or source_course.get("skills_learned")
                        or source_course.get("outcomes")
                    )
                else:
                    after = copy.deepcopy(source_course.get(source_field))
                # Never erase a selected snapshot with an absent source field.
                # A verified course candidate proves the course identity, but a
                # sparse source record does not prove that a missing detail is
                # correct.  Leave such fields for the targeted source queue.
                if after is None or after == "" or after == []:
                    continue
                if norm(before) == norm(after):
                    continue
                field_changes.append({"field": field, "before": before, "after": after})
                if not args.dry_run:
                    selected[field] = after
            if field_changes:
                counts["selected_course_records_changed"] += 1
                counts["field_changes"] += len(field_changes)
                changes.append({
                    "jamb_name": row.get("jamb_name"),
                    "source_key": source_key,
                    "course_code": code,
                    "official_source_url": CCMAS_SOURCE_URLS.get(source_file),
                    "fields": field_changes,
                    "guard": "one exact or exact-equivalent structured CCMAS PDF candidate; component and course selection unchanged",
                })

    if not args.dry_run:
        SCOPES.write_text(json.dumps(scopes_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "2026-09-29.jamb-scope-verified-ccmas-detail-sync.v1",
        "generated_on": date.today().isoformat(),
        "status": "dry_run_ready" if args.dry_run else "applied",
        "dry_run": args.dry_run,
        "counts": dict(counts),
        "changes": changes,
        "limits": [
            "This synchronizes descriptive course fields only; it does not approve a JAMB component or domain link.",
            "Records without a unique structured source candidate remain unchanged.",
        ],
    }
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = ["# JAMB selected-scope CCMAS detail sync — 2026-09-29", "", f"Status: `{report['status']}`", "", "## Counts", ""]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["counts"].items())
    lines += ["", "Only descriptive selected-course fields were synchronized; component and domain selection were not changed.", ""]
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": report["status"], "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
