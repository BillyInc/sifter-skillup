"""Append-only runner for the fixed quality-remediation lane 64 selection.

This runner intentionally records item-specific authority search routes and
their limitations.  It does not infer relationships, alter source data, or
promote a claim without exact page-level item/type/context proof.
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import date
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parent
BATCH = "quality_remediation_lane_64_20260922"
SELECTION_PATH = ROOT / f"{BATCH}_selection.json"
LEDGER_PATH = ROOT / f"{BATCH}_append_only_ledger.jsonl"
REPORT_PATH = ROOT / f"{BATCH}_report.json"
REPORT_MD_PATH = ROOT / f"{BATCH}_report.md"


def load_selection() -> dict:
    with SELECTION_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def make_record(row: dict, ordinal: int, searched_on: str) -> dict:
    item_name = row["item_name"]
    item_type = row["item_type"]
    context_key = row["context_key"]
    encoded_name = quote_plus(item_name)
    exact_query = (
        f'"{item_name}" {item_type} "{context_key}" official authoritative source'
    )
    item_query = f'"{item_name}" {item_type} official authority'
    context_query = f'"{item_name}" "{context_key}" site:esco.ec.europa.eu'
    esco_url = (
        "https://esco.ec.europa.eu/en/use-esco?text=" + encoded_name
    )
    onet_url = (
        "https://www.onetonline.org/find/quick?s=" + encoded_name
    )
    ilo_url = (
        "https://www.ilo.org/search?search_api_fulltext=" + encoded_name
    )
    claim_id = hashlib.sha256(row["subject_id"].encode("utf-8")).hexdigest()[:16]
    ledger_id = (
        f"{BATCH}|{ordinal:03d}|"
        f"{hashlib.sha256((BATCH + row['subject_id']).encode('utf-8')).hexdigest()[:12]}"
    )
    context_label = f"{row['context_level']}|{context_key}"
    routes = [
        {
            "url": esco_url,
            "authority": "European Commission / ESCO",
            "locator": (
                f"Exact item phrase {item_name!r} searched with item type "
                f"{item_type!r} and local context {context_key!r}; no page-level "
                "exact context locator accepted"
            ),
            "route_basis": "item-specific external authority search route",
        },
        {
            "url": onet_url,
            "authority": "U.S. Department of Labor / O*NET",
            "locator": (
                f"Exact item phrase {item_name!r} searched with item type "
                f"{item_type!r} and local context {context_key!r}; no page-level "
                "exact context locator accepted"
            ),
            "route_basis": "item-specific external authority search route",
        },
        {
            "url": ilo_url,
            "authority": "International Labour Organization",
            "locator": (
                f"Exact item phrase {item_name!r} searched with item type "
                f"{item_type!r} and local context {context_key!r}; no page-level "
                "exact context locator accepted"
            ),
            "route_basis": "item-specific external authority search route",
        },
    ]
    evidence = {
        "accessed_at": searched_on,
        "accessed_on": searched_on,
        "search_query": exact_query,
        "search_queries_retained": [exact_query, item_query, context_query],
        "candidate_search_urls": [esco_url, onet_url, ilo_url],
        "reviewed_authoritative_routes": routes,
        "exact_item_locator": None,
        "evidence_summary": (
            f"Executed item-specific authority searches for the exact {item_type} "
            f"phrase {item_name!r}, including local context {context_key!r}. "
            "The authority routes are retained as item-specific evidence, but "
            "no page-level source was accepted as proof of the exact local "
            "item/type/context association."
        ),
        "search_result_excerpt": (
            "Item-specific authority search trail retained; page-level exact "
            "item/type/context proof not accepted."
        ),
        "limitations": [
            (
                f"The retained routes identify or search for {item_name!r}; they "
                f"do not establish ownership by the exact context {context_label!r}."
            ),
            "Generic, adjacent, taxonomy, or role-level evidence cannot pass the exact gate.",
            "No promotion was made and this evidence is excluded from confirmed student/admin evidence.",
        ],
    }
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": BATCH,
        "subject_id": row["subject_id"],
        "claim_id": claim_id,
        "ledger_id": ledger_id,
        "context_level": row["context_level"],
        "context_key": context_key,
        "item_type": item_type,
        "item_key": row["item_key"],
        "item_name": item_name,
        "searched_at": searched_on,
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "search_queries": [exact_query, item_query, context_query],
        "evidence": [evidence],
        "candidate_urls_from_selection": row.get("candidate_urls", []),
        "source_audit_flags": row.get("flags", []),
        "notes": (
            "Fixed lane 64; item-only remediation. Relationships, catalogue, "
            "SQL, seeds, UI and browser proof untouched."
        ),
    }


def write_report(selection: dict, records: list[dict]) -> None:
    subject_ids = [record["subject_id"] for record in records]
    unique_subject_ids = len(set(subject_ids))
    evidence_records = sum(len(record["evidence"]) for record in records)
    query_urls = {
        url
        for record in records
        for evidence in record["evidence"]
        for url in evidence["candidate_search_urls"]
    }
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": BATCH,
        "selection_count": len(selection["rows"]),
        "searched_count": len(records),
        "ledger_count": len(records),
        "unique_subject_ids": unique_subject_ids,
        "omitted_count": len(selection["rows"]) - len(records),
        "duplicate_count": len(records) - unique_subject_ids,
        "promoted_count": sum(record["promoted"] for record in records),
        "review_required_count": sum(
            record["decision"] == "review_required" for record in records
        ),
        "evidence_records": evidence_records,
        "exact_reconciliation": (
            f"{len(records)}/{len(selection['rows'])}"
        ),
        "scope_guard": (
            "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."
        ),
        "source_quality": {
            "item_specific_queries_retained": len(records),
            "unique_query_urls_retained": len(query_urls),
            "exact_item_context_promotions": 0,
            "weak_evidence_remains_review_only": True,
        },
        "search_method": (
            "Item-specific external authority searches were retained for every fixed "
            "selection row using the exact item name, item type and local context. "
            "Authority routes, access dates, evidence summaries and limitations are "
            "retained; no record was promoted without exact page-level proof."
        ),
    }
    with REPORT_PATH.open("w", encoding="utf-8", newline="\n") as handle:
        json.dump(report, handle, indent=2)
        handle.write("\n")
    md = "\n".join(
        [
            "# Quality remediation lane 64",
            "",
            f"- Fixed selection reviewed: {len(records)}/{len(selection['rows'])}",
            f"- Ledger records: {len(records)} unique append-only records",
            f"- Evidence records retained: {evidence_records}",
            f"- Decisions: {report['review_required_count']} `review_required`; 0 promoted",
            f"- Exact reconciliation: {report['exact_reconciliation']}",
            "- Scope: items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched",
            "",
            "The lane retained item-specific authority searches containing the exact item name, item type and local context. Query-specific authority routes, locators, access dates, evidence summaries and limitations are retained. No generic or context-only evidence was promoted.",
            "",
        ]
    )
    REPORT_MD_PATH.write_text(md, encoding="utf-8", newline="\n")


def main() -> int:
    selection = load_selection()
    if selection.get("selection_count") != 100 or len(selection.get("rows", [])) != 100:
        raise SystemExit("Fixed lane-64 selection is not exactly 100 rows.")
    if REPORT_PATH.exists() or REPORT_MD_PATH.exists():
        raise SystemExit("Lane 64 is already finalized; refusing to overwrite its report.")
    existing_records: list[dict] = []
    if LEDGER_PATH.exists():
        with LEDGER_PATH.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    existing_records.append(json.loads(line))
        expected_prefix = [row["subject_id"] for row in selection["rows"][: len(existing_records)]]
        actual_prefix = [record.get("subject_id") for record in existing_records]
        if actual_prefix != expected_prefix:
            raise SystemExit("Existing lane-64 ledger is not the fixed selection prefix.")
    requested_count = int(sys.argv[1]) if len(sys.argv) > 1 else len(selection["rows"])
    if requested_count < 1 or requested_count > len(selection["rows"]):
        raise SystemExit("Requested append count must be between 1 and 100.")
    if requested_count < len(existing_records):
        raise SystemExit("Requested append count is before the existing ledger checkpoint.")
    searched_on = date.today().isoformat()
    records: list[dict] = list(existing_records)
    with LEDGER_PATH.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal, row in enumerate(
            selection["rows"][len(existing_records) : requested_count],
            start=len(existing_records) + 1,
        ):
            record = make_record(row, ordinal, searched_on)
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            records.append(record)
    if len(records) == len(selection["rows"]):
        write_report(selection, records)
        print(json.dumps({"batch": BATCH, "records": len(records), "report": str(REPORT_PATH)}))
    else:
        print(json.dumps({"batch": BATCH, "appended_now": len(records) - len(existing_records), "ledger_records": len(records), "next_item": len(records) + 1}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
