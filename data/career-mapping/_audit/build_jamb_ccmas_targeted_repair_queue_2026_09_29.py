"""Deduplicate current JAMB->CCMAS reconciliation findings into repair units."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
INPUT = AUDIT / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json"
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
OUT_JSON = AUDIT / "jamb_ccmas_targeted_repair_queue_2026-09-29.json"
OUT_MD = AUDIT / "jamb_ccmas_targeted_repair_queue_2026-09-29.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def action_for(fields: set[str]) -> str:
    if fields == {"learning_outcomes"}:
        return "source_verify_and_fill_or_correct_outcomes"
    if "title" in fields or "units" in fields or "lecture_hours" in fields or "practical_hours" in fields:
        return "source_verify_course_identity_and_workload_then_repair"
    if "content_summary" in fields:
        return "source_verify_and_repair_content_and_outcomes"
    return "source_verify_and_repair_selected_course_details"


def main() -> None:
    report = load(INPUT)
    discovery = load(DISCOVERY)
    course_queue: dict[tuple[str, str], dict[str, Any]] = {}
    other_issues: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in report["rows"]:
        for issue in row.get("issues", []):
            kind = issue["kind"]
            details = issue.get("details", {})
            if kind == "selected_course_details_disagree_with_ccmas":
                key = (details.get("source_key", ""), details.get("code", ""))
                entry = course_queue.setdefault(key, {
                    "source_key": key[0],
                    "course_code": key[1],
                    "jamb_names": set(),
                    "fields": set(),
                    "source_snapshot": details.get("source"),
                    "selected_snapshot": details.get("selected"),
                })
                entry["jamb_names"].add(row["jamb_name"])
                entry["fields"].update(details.get("fields", []))
            else:
                other_issues[kind].append({"jamb_name": row["jamb_name"], "details": details})

    course_rows = []
    for entry in sorted(course_queue.values(), key=lambda item: (item["source_key"], item["course_code"])):
        fields = set(entry.pop("fields"))
        entry["jamb_names"] = sorted(entry["jamb_names"])
        entry["affected_jamb_occurrence_count"] = len(entry["jamb_names"])
        entry["fields"] = sorted(fields)
        entry["action"] = action_for(fields)
        course_rows.append(entry)

    counts = {"distinct_course_records": len(course_rows), "occurrence_level_detail_findings": sum(len(item["jamb_names"]) for item in course_rows)}
    counts.update({f"queue:{action}": sum(item["action"] == action for item in course_rows) for action in sorted({item["action"] for item in course_rows})})
    counts.update({f"other:{kind}": len(items) for kind, items in sorted(other_issues.items())})
    package_sources = {
        item["source_file"]: item.get("official_source_url")
        for item in discovery.get("ccmas_packages", [])
    }
    source_batches: dict[str, dict[str, Any]] = {}
    for item in course_rows:
        source_file = item["source_key"].split("::", 1)[0]
        batch = source_batches.setdefault(source_file, {
            "source_file": source_file,
            "official_source_url": package_sources.get(source_file),
            "affected_package_programmes": set(),
            "unique_course_records": 0,
            "affected_jamb_occurrences": 0,
            "actions": defaultdict(int),
        })
        batch["affected_package_programmes"].add(item["source_key"])
        batch["unique_course_records"] += 1
        batch["affected_jamb_occurrences"] += item["affected_jamb_occurrence_count"]
        batch["actions"][item["action"]] += 1
    source_batch_rows = []
    for source_file, batch in sorted(source_batches.items()):
        batch["affected_package_programmes"] = sorted(batch["affected_package_programmes"])
        batch["affected_package_count"] = len(batch["affected_package_programmes"])
        batch["actions"] = dict(sorted(batch["actions"].items()))
        source_batch_rows.append(batch)
    output = {
        "schema": "2026-09-29.jamb-ccmas-targeted-repair-queue.v1",
        "generated_on": date.today().isoformat(),
        "status": "deduplicated_source_repair_queue_open",
        "counts": counts,
        "course_record_queue": course_rows,
        "source_document_batches": source_batch_rows,
        "other_issue_queue": dict(sorted(other_issues.items())),
        "rule": "Verify and repair one unique CCMAS source record once; rerun the 420-name reconciliation so every dependent JAMB mapping receives the corrected record.",
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Targeted JAMB–CCMAS repair queue — 2026-09-29",
        "",
        "This deduplicates repeated JAMB occurrences into unique CCMAS course repair units.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in counts.items())
    lines += ["", "## Repair rule", "", "Source-check one unique `(source package, course code)` record, apply a guarded correction only when the source supports it, then regenerate the full 420-name reconciliation. Do not copy one JAMB occurrence's data into another without matching the CCMAS source context.", ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": counts}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
