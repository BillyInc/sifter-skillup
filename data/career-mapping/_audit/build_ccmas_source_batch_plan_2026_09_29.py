"""Build the deterministic CCMAS source-batch reconciliation plan.

This is a planning and accounting artifact, not a source-verification claim.
It reduces repeated JAMB occurrences to one verification unit per unique
``(source package, course code)`` and identifies exact source-block duplicates
that may be reused only after one representative has been source-verified.
"""

from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
QUEUE = AUDIT / "jamb_ccmas_targeted_repair_queue_2026-09-29.json"
DISCOVERY = AUDIT / "jamb_ccmas_deterministic_discovery_2026-09-28.json"
LOCAL_SEARCH = AUDIT / "jamb_ccmas_local_source_text_search_2026-09-28.json"
OUT_JSON = AUDIT / "ccmas_source_batch_reconciliation_plan_2026-09-29.json"
OUT_MD = AUDIT / "ccmas_source_batch_reconciliation_plan_2026-09-29.md"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def fingerprint(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def package_name(source_key: str) -> str:
    return source_key.split("::", 1)[1] if "::" in source_key else source_key


def source_file(source_key: str) -> str:
    return source_key.split("::", 1)[0]


def main() -> None:
    queue = load(QUEUE)
    discovery = load(DISCOVERY)
    local_search = load(LOCAL_SEARCH)

    local_status = {
        item["source_file"]: item
        for item in local_search.get("ccmas_missing_local_text_source_files", [])
    }
    package_index = {
        f"{item['source_file']}::{item['programme']}": item
        for item in discovery.get("ccmas_packages", [])
    }

    records = queue["course_record_queue"]
    reuse_groups: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        source = source_file(record["source_key"])
        reuse_groups[(source, fingerprint(record.get("source_snapshot")))].append(record)

    reusable_group_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    for (source, block_hash), members in reuse_groups.items():
        if len(members) < 2:
            continue
        reusable_group_by_key[(source, block_hash)] = {
            "source_file": source,
            "source_block_fingerprint": block_hash,
            "representative_source_key": members[0]["source_key"],
            "member_source_keys": sorted(item["source_key"] for item in members),
            "course_codes": sorted({item["course_code"] for item in members}),
            "record_count": len(members),
            "reuse_rule": (
                "Reuse only after the representative source block is verified in the "
                "same official source document; this fingerprint is a candidate, not proof."
            ),
        }

    source_batches: list[dict[str, Any]] = []
    for batch in queue["source_document_batches"]:
        source = batch["source_file"]
        batch_records = [item for item in records if source_file(item["source_key"]) == source]
        batch_groups = [
            group
            for (group_source, _), group in reusable_group_by_key.items()
            if group_source == source
        ]
        missing_extract = local_status.get(source)
        package_rows = [
            package_index[key]
            for key in batch["affected_package_programmes"]
            if key in package_index
        ]
        source_batches.append(
            {
                "source_file": source,
                "official_source_url": batch.get("official_source_url"),
                "source_read_unit": "one official source document per source_file",
                "source_text_status": (
                    "retrieve_and_extract_official_pdf_once"
                    if missing_extract
                    else "reuse_existing_local_extract_after_checksum_review"
                ),
                "affected_package_count": batch["affected_package_count"],
                "affected_package_programmes": [
                    package_name(key) for key in batch["affected_package_programmes"]
                ],
                "unique_course_records": batch["unique_course_records"],
                "affected_jamb_occurrences": batch["affected_jamb_occurrences"],
                "actions": batch["actions"],
                "candidate_exact_source_block_groups": len(batch_groups),
                "candidate_reusable_records": sum(
                    group["record_count"] for group in batch_groups
                ),
                "package_source_rows_found_in_discovery": len(package_rows),
                "missing_local_extract": missing_extract,
                "verification_rule": (
                    "Verify each unique (package, course code) record once. If an exact "
                    "source-block fingerprint repeats, verify one representative and "
                    "reuse only for the identical block in the same source document."
                ),
            }
        )

    counts = {
        "source_documents": len(source_batches),
        "affected_packages": sum(item["affected_package_count"] for item in source_batches),
        "unique_course_records": sum(item["unique_course_records"] for item in source_batches),
        "affected_jamb_occurrences": sum(
            item["affected_jamb_occurrences"] for item in source_batches
        ),
        "candidate_exact_source_block_groups": len(reusable_group_by_key),
        "candidate_reusable_records": sum(
            group["record_count"] for group in reusable_group_by_key.values()
        ),
        "source_documents_requiring_retrieval": sum(
            item["missing_local_extract"] is not None for item in source_batches
        ),
        "source_documents_with_existing_extract": sum(
            item["missing_local_extract"] is None for item in source_batches
        ),
    }

    expected = {
        "source_documents": 15,
        "affected_packages": 117,
        "unique_course_records": 2442,
        "affected_jamb_occurrences": 5449,
    }
    invariants = {
        key: {"expected": value, "actual": counts[key], "passed": counts[key] == value}
        for key, value in expected.items()
    }
    status = (
        "deterministic_batch_plan_ready"
        if all(item["passed"] for item in invariants.values())
        else "counts_changed_requires_review"
    )

    output = {
        "schema": "2026-09-29.ccmas-source-batch-reconciliation-plan.v1",
        "generated_on": date.today().isoformat(),
        "status": status,
        "counts": counts,
        "invariants": invariants,
        "source_batches": source_batches,
        "candidate_exact_source_block_groups": sorted(
            reusable_group_by_key.values(),
            key=lambda item: (item["source_file"], item["representative_source_key"]),
        ),
        "workflow": [
            "Retrieve or reuse one official CCMAS PDF per source document after checksum review.",
            "Extract searchable text once and retain page/section locators internally.",
            "Verify each unique (package, course code) record against that source text.",
            "Reuse an exact source block only after its representative is verified.",
            "Apply guarded repairs by source package and course code, never by occurrence count.",
            "Regenerate the full 420-name reconciliation and then reassess domain links.",
        ],
        "limits": [
            "This artifact does not prove that any source block is correct.",
            "Current CCMAS JSON is not treated as an authoritative replacement for missing PDF evidence.",
            "Ambiguous title, combined-programme, missing-component, and domain-semantic cases remain source-review work.",
        ],
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# CCMAS source-batch reconciliation plan — 2026-09-29",
        "",
        "This manifest reduces repeated JAMB occurrences to source-document and unique course-record verification units.",
        "It is a deterministic work plan, not a claim that the source records are already verified.",
        "",
        "## Counts",
        "",
    ]
    lines.extend(f"- **{key.replace('_', ' ')}:** {value}" for key, value in counts.items())
    lines += ["", "## Invariants", ""]
    lines.extend(
        f"- **{key.replace('_', ' ')}:** {value['actual']} / {value['expected']} — {'PASS' if value['passed'] else 'REVIEW'}"
        for key, value in invariants.items()
    )
    lines += ["", "## Safe processing rule", "", "Verify once per `(source package, course code)`. Exact duplicate source-block fingerprints are only reuse candidates; they become reusable after the representative is verified against the same official source document.", "", "## Source batches", ""]
    for batch in source_batches:
        lines += [
            f"### `{batch['source_file']}`",
            "",
            f"- Official source: {batch['official_source_url'] or 'not recorded'}",
            f"- Packages: {batch['affected_package_count']}; unique records: {batch['unique_course_records']}; dependent JAMB occurrences: {batch['affected_jamb_occurrences']}",
            f"- Source text action: `{batch['source_text_status']}`",
            f"- Exact-block reuse candidates: {batch['candidate_exact_source_block_groups']} groups / {batch['candidate_reusable_records']} records",
            "",
        ]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "status": status, "counts": counts}, indent=2))


if __name__ == "__main__":
    main()
