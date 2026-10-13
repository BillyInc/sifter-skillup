"""Fill missing scalar workload fields from an exact CCMAS course record.

This deliberately handles only an exact source-file + programme + course-code
match and only fills a missing JAMB-scope value.  It does not overwrite a
present value, change course selection, or change any domain mapping.
"""

from __future__ import annotations

import argparse
import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CCMAS = ROOT / "ccmas" / "administration_management.json"
SCOPES = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"
OUT_BASE = ROOT / "_audit" / "exact_ccmas_workload_propagation_2026-09-29"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def code(value: Any) -> str:
    return " ".join(str(value or "").upper().split())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    scopes = load(SCOPES)
    package = load(CCMAS)
    source = next(
        course
        for programme in package["programmes"]
        if programme.get("name") == "Accounting"
        for course in programme.get("courses", [])
        if code(course.get("code")) == "ACC 490"
    )
    changes: list[dict[str, Any]] = []
    for row in scopes.get("rows", []):
        for selected in row.get("selected_courses", []):
            if (
                selected.get("source_ccmas_file") == "administration_management.json"
                and selected.get("source_ccmas_programme") == "Accounting"
                and code(selected.get("code")) == "ACC 490"
                and selected.get("lecture_hours") is None
                and source.get("lh") is not None
            ):
                before = copy.deepcopy(selected.get("lecture_hours"))
                after = source["lh"]
                changes.append({
                    "jamb_name": row.get("jamb_name"),
                    "source_key": "administration_management.json::Accounting",
                    "course_code": "ACC 490",
                    "field": "lecture_hours",
                    "before": before,
                    "after": after,
                    "basis": "exact CCMAS source key and course code; missing selected value only",
                })
                if not args.dry_run:
                    selected["lecture_hours"] = after

    status = "dry_run_ready" if args.dry_run else "applied"
    report = {
        "schema": "2026-09-29.exact-ccmas-workload-propagation.v1",
        "generated_on": date.today().isoformat(),
        "status": status,
        "dry_run": args.dry_run,
        "counts": {"selected_course_records_filled": len(changes), "domain_links_changed": 0, "course_selection_changed": 0},
        "changes": changes,
    }
    if not args.dry_run:
        SCOPES.write_text(json.dumps(scopes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    suffix = "_dry_run" if args.dry_run else "_applied"
    out_json = OUT_BASE.with_name(OUT_BASE.name + suffix + ".json")
    out_md = OUT_BASE.with_name(OUT_BASE.name + suffix + ".md")
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out_md.write_text(
        "# Exact CCMAS workload propagation — 2026-09-29\n\n"
        f"Status: `{status}`\n\n"
        + "\n".join(f"- **{key}:** {value}" for key, value in report["counts"].items())
        + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"status": status, "counts": report["counts"], "json": str(out_json)}, indent=2))


if __name__ == "__main__":
    main()
