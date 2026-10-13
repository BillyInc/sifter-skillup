"""Apply guarded, source-extracted CCMAS course-detail repairs.

Only a unique structured PDF detail candidate is eligible. Every field update
has an append-only before/after ledger and a preimage guard against overwriting
changes made after the reconciliation queue was generated.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

from run_jamb_ccmas_deterministic_discovery_2026_09_28 import CCMAS_SOURCE_URLS


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
QUEUE = AUDIT / "jamb_ccmas_course_detail_candidates_2026-09-29.json"
OUT_JSON_BASE = AUDIT / "ccmas_course_detail_guarded_repairs_2026-09-29"


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().casefold()


def parse_outcomes(text: str | None) -> list[str]:
    if not text:
        return []
    matches = list(re.finditer(r"(?:^|\s)(\d+)\.\s*", text))
    if not matches:
        return []
    values: list[str] = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        value = re.sub(r"\s+", " ", text[match.end() : end]).strip(" ;,\n")
        if value:
            values.append(value)
    return values


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def usable_content(text: Any) -> bool:
    """Reject obvious PDF-boundary fragments from automatic content repair."""
    value = str(text or "").strip()
    if not value or not value[0].isupper():
        return False
    return value[-1] in ".!?;:)"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    out_json = OUT_JSON_BASE.with_name(OUT_JSON_BASE.name + ("_dry_run" if args.dry_run else "_applied") + ".json")
    out_md = OUT_JSON_BASE.with_name(OUT_JSON_BASE.name + ("_dry_run" if args.dry_run else "_applied") + ".md")
    queue = load_json(QUEUE)
    packages_by_source: dict[str, dict[str, Any]] = {}
    for source_path in sorted((ROOT / "ccmas").glob("*.json")):
        packages_by_source[source_path.name] = load_json(source_path)

    counters = Counter()
    changes: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    pending_files: dict[Path, dict[str, Any]] = {}
    for record in queue["course_record_queue"]:
        counters["records_seen"] += 1
        details = record.get("automated_detail_candidates", {})
        eligible_states = {"one_exact_detail_candidate", "one_exact_equivalent_detail_candidate"}
        if details.get("state") not in eligible_states or not details.get("candidates"):
            counters["skipped_non_unique_detail"] += 1
            skipped.append({"source_key": record["source_key"], "course_code": record["course_code"], "reason": details.get("state")})
            continue
        candidate = details["candidates"][0]
        outcomes = parse_outcomes(candidate.get("outcomes_text"))
        workload = candidate.get("workload") or {}
        if not outcomes or workload.get("units") is None or workload.get("lecture_hours") is None:
            counters["skipped_incomplete_structured_candidate"] += 1
            skipped.append({"source_key": record["source_key"], "course_code": record["course_code"], "reason": "structured_candidate_missing_required_fields"})
            continue

        source_file, programme = record["source_key"].split("::", 1)
        source_path = ROOT / "ccmas" / source_file
        package_doc = packages_by_source.get(source_file)
        programmes = [item for item in (package_doc or {}).get("programmes", []) if item.get("name") == programme]
        if len(programmes) != 1:
            counters["skipped_package_context"] += 1
            skipped.append({"source_key": record["source_key"], "course_code": record["course_code"], "reason": "package_context_not_unique"})
            continue
        courses = [item for item in programmes[0].get("courses", []) if norm(item.get("code")) == norm(record["course_code"])]
        if len(courses) != 1:
            counters["skipped_course_context"] += 1
            skipped.append({"source_key": record["source_key"], "course_code": record["course_code"], "reason": "course_context_not_unique"})
            continue
        course = courses[0]
        expected = record.get("source_snapshot") or {}
        proposed = {
            "title": candidate.get("title_candidate"),
            "units": workload.get("units"),
            "status": workload.get("status"),
            "lh": workload.get("lecture_hours"),
            "ph": workload.get("practical_hours"),
            "content_summary": candidate.get("content_text") if usable_content(candidate.get("content_text")) else None,
            "learning_outcomes": outcomes,
        }
        field_map = {
            "title": "title",
            "units": "units",
            "status": "status",
            "lh": "lecture_hours",
            "ph": "practical_hours",
            "content_summary": "content_summary",
            "learning_outcomes": "learning_outcomes",
        }
        field_changes: list[dict[str, Any]] = []
        for target_field, source_field in field_map.items():
            value = proposed.get(target_field)
            if value in (None, "", []):
                continue
            current = course.get(target_field)
            if norm(current) == norm(value):
                continue
            expected_before = expected.get(source_field)
            if norm(current) != norm(expected_before):
                counters["skipped_preimage_changed_fields"] += 1
                continue
            field_changes.append({"field": target_field, "before": copy.deepcopy(current), "after": copy.deepcopy(value)})
        if not field_changes:
            counters["records_with_no_guarded_change"] += 1
            continue

        evidence = {
            "official_source_url": CCMAS_SOURCE_URLS.get(source_file),
            "source_text_file": str((AUDIT / "ccmas_source_text_2026-09-29" / f"{Path(source_file).stem}.txt").relative_to(ROOT)) if (AUDIT / "ccmas_source_text_2026-09-29" / f"{Path(source_file).stem}.txt").exists() else None,
            "extracted_page_ordinal": candidate.get("extracted_page_ordinal"),
            "source_locator_state": details.get("state"),
        }
        change = {
            "source_key": record["source_key"],
            "course_code": record["course_code"],
            "source_file": source_file,
            "programme": programme,
            "evidence": evidence,
            "fields": field_changes,
            "guard": "unique exact-title structured candidate plus per-field reconciliation preimage match",
        }
        changes.append(change)
        counters["records_with_guarded_changes"] += 1
        counters["field_changes"] += len(field_changes)
        if not args.dry_run:
            for field in field_changes:
                course[field["field"]] = field["after"]
            pending_files[source_path] = package_doc

    if not args.dry_run:
        for path, document in pending_files.items():
            path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    report = {
        "schema": "2026-09-29.ccmas-course-detail-guarded-repairs.v1",
        "generated_on": date.today().isoformat(),
        "status": "dry_run_guarded_repairs_ready" if args.dry_run else "guarded_repairs_applied",
        "dry_run": args.dry_run,
        "counts": dict(counters),
        "changes": changes,
        "skipped": skipped,
        "rule": "A course is changed only when one exact structured source detail candidate exists, required fields are present, the package/course context is unique, and the current value matches the reconciliation preimage.",
        "limits": [
            "This repairs source-extracted course details only; it does not decide JAMB component scope or domain match type.",
            "Repeated or context-ambiguous candidates remain for targeted review.",
            "The official URL and extracted page are retained in this audit ledger; the student display need not show item-level citations.",
        ],
    }
    out_json.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# CCMAS course-detail guarded repairs — 2026-09-29",
        "",
        f"Status: `{report['status']}`",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in report["counts"].items())
    lines += ["", "This ledger is the source evidence for every applied field change. Repeated or context-ambiguous records were not changed automatically.", ""]
    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(out_json), "markdown": str(out_md), "status": report["status"], "counts": report["counts"]}, indent=2))


if __name__ == "__main__":
    main()
