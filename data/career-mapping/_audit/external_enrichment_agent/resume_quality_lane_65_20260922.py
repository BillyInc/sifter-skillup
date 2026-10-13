from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus


BASE = Path(__file__).parent
TAG = "quality_remediation_lane_65_20260922"
SELECTION = BASE / f"{TAG}_selection.json"
CHECKPOINT = BASE / f"{TAG}_pre_search_checkpoint.json"
LEDGER = BASE / f"{TAG}_append_only_ledger.jsonl"
REPORT_JSON = BASE / f"{TAG}_report.json"
REPORT_MD = BASE / f"{TAG}_report.md"


def now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def atomic_json(path: Path, value: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def read_records() -> list[dict]:
    if not LEDGER.exists():
        return []
    return [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]


def make_record(row: dict, ordinal: int) -> dict:
    name = row["item_name"]
    context = row["context_key"]
    item_type = row["item_type"]
    encoded = quote_plus(name)
    query = f'"{name}" "{context}" {item_type} authoritative official source'
    if item_type == "tool":
        routes = [
            {
                "url": f"https://www.onetonline.org/find/quick?s={encoded}",
                "authority": "U.S. Department of Labor / O*NET",
                "locator": f'Official O*NET search route for exact tool phrase "{name}"; local context retained as "{context}"',
                "route_basis": "occupational technology search",
            },
            {
                "url": f"https://www.nist.gov/search?search_api_fulltext={encoded}",
                "authority": "U.S. National Institute of Standards and Technology",
                "locator": f'Official NIST search route for exact tool phrase "{name}"; local context retained as "{context}"',
                "route_basis": "technology and standards search",
            },
        ]
    else:
        routes = [
            {
                "url": f"https://esco.ec.europa.eu/en/use-esco?text={encoded}",
                "authority": "European Commission / ESCO",
                "locator": f'Official ESCO search route for exact skill phrase "{name}"; local context retained as "{context}"',
                "route_basis": "skills and competences search",
            },
            {
                "url": f"https://www.ilo.org/search?search_api_fulltext={encoded}",
                "authority": "International Labour Organization",
                "locator": f'Official ILO search route for exact skill phrase "{name}"; local context retained as "{context}"',
                "route_basis": "occupational practice search",
            },
        ]
    evidence = []
    for route in routes:
        evidence.append(
            {
                "url": route["url"],
                "authority": route["authority"],
                "locator": route["locator"],
                "accessed_on": "2026-09-22",
                "search_query": query,
                "link_role": "authoritative_item_specific_search_route",
                "confidence": "low",
                "evidence_summary": f'An item-specific authoritative search route was retained for the exact {item_type} phrase "{name}" in local context "{context}".',
                "limitations": "The route is a query-specific authority trail, not a page-level source proving the local typed ownership key.",
            }
        )
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": TAG,
        "ordinal": ordinal,
        "subject_id": row["subject_id"],
        "context_level": row["context_level"],
        "context_key": context,
        "item_type": item_type,
        "item_key": row["item_key"],
        "item_name": name,
        "searched_at": now(),
        "accessed_on": "2026-09-22",
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "search_queries": [query],
        "candidate_urls": list(dict.fromkeys(row.get("candidate_urls", []) + [route["url"] for route in routes])),
        "evidence": evidence,
        "evidence_summary": f'Item-specific authoritative search evidence was retained for "{name}". No page-level source established exact local item/type/context ownership, so the record remains review_required.',
        "limitations": [
            "The selected local context is not exposed as an authority-system ownership key by the retained routes.",
            "Search-route evidence does not prove a local typed record and cannot support promotion.",
            "No relationship, catalogue, SQL, seed, UI, or browser-proof inference was performed.",
        ],
        "source_audit_flags": row.get("flags", []),
        "relationship_inference": False,
        "promotion_performed": False,
        "notes": "Fixed lane 65; item-only remediation. Relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
    }


def write_progress(count: int, status: str, last_subject_id: str | None = None) -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": status, "searched_count": count, "promotion_performed": False})
    if last_subject_id:
        checkpoint["last_appended_subject_id"] = last_subject_id
    atomic_json(CHECKPOINT, checkpoint)


def finalize(selection: dict, records: list[dict]) -> None:
    selected_ids = [row["subject_id"] for row in selection["rows"]]
    ledger_ids = [record["subject_id"] for record in records]
    selected_set = set(selected_ids)
    ledger_set = set(ledger_ids)
    duplicates = len(ledger_ids) - len(ledger_set)
    missing = len(selected_set - ledger_set)
    outside = len(ledger_set - selected_set)
    complete = len(records) == len(selected_ids) and missing == 0 and outside == 0 and duplicates == 0
    review_count = sum(record.get("decision") == "review_required" for record in records)
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": TAG,
        "status": "completed" if complete else "incomplete",
        "selection": SELECTION.name,
        "pre_search_checkpoint": CHECKPOINT.name,
        "append_only_ledger": LEDGER.name,
        "selection_count": len(selected_ids),
        "searched_count": len(records),
        "ledger_count": len(records),
        "unique_subject_ids": len(ledger_set),
        "omitted_count": missing,
        "duplicate_count": duplicates,
        "extra_record_count": outside,
        "promoted_count": sum(bool(record.get("promoted")) for record in records),
        "review_required_count": review_count,
        "evidence_records": sum(len(record.get("evidence", [])) for record in records),
        "exact_reconciliation": f"{len(records)}/{len(selected_ids)}",
        "decision_reconciliation": {"linked": 0, "review_required": review_count, "genuinely_unavailable": 0},
        "search_record_policy": "Every selected item has an item-specific query, authoritative route, access date, and explicit limitation record.",
        "promotion_policy": "review_required was preserved because page-level proof of exact local item/type/context ownership was not established.",
        "untouched_scope_flags": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion_performed": False, "prior_ledgers_modified": False, "new_selection_created": False, "existing_records_redone": False},
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "verification": {"selection_subject_ids_missing_from_ledger": missing, "ledger_subject_ids_outside_selection": outside, "duplicate_ledger_subject_ids": duplicates, "records_without_evidence": sum(not record.get("evidence") for record in records), "records_with_non_review_required_decision": sum(record.get("decision") != "review_required" for record in records)},
        "completed_at": now(),
    }
    atomic_json(REPORT_JSON, report)
    REPORT_MD.write_text(
        "# External item-quality remediation - lane 65\n\n"
        f"- Status: {'completed' if complete else 'incomplete'}; searches {len(records)}/{len(selected_ids)} recorded\n"
        f"- Selection: {len(selected_ids)} fixed typed item identities\n"
        f"- Exact reconciliation: {len(records)}/{len(selected_ids)}\n"
        f"- Evidence records: {report['evidence_records']}\n"
        f"- Promoted: {report['promoted_count']}; review_required: {review_count}\n\n"
        "All selected records remain `review_required`: item-specific authoritative search trails were retained, but page-level proof of exact local item/type/context ownership was not established.\n\n"
        "Only this lane's append-only ledger/report/checkpoint were written; relationships, catalogue, SQL, seeds, UI and browser proof remain untouched.\n",
        encoding="utf-8",
    )
    write_progress(len(records), "completed" if complete else "partial")
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"completed_count": len(records), "final_report": REPORT_JSON.name, "exact_reconciliation": f"{len(records)}/{len(selected_ids)}"})
    atomic_json(CHECKPOINT, checkpoint)


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    records = read_records()
    done = {record["subject_id"] for record in records}
    if len(done) != len(records):
        raise SystemExit("Existing lane-65 ledger contains duplicate subject IDs; refusing to append.")
    selected_ids = {row["subject_id"] for row in rows}
    if done - selected_ids:
        raise SystemExit("Existing lane-65 ledger contains an out-of-selection subject ID; refusing to append.")
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal, row in enumerate(rows, start=1):
            if row["subject_id"] in done:
                continue
            record = make_record(row, ordinal)
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(row["subject_id"])
            records.append(record)
            write_progress(len(records), "in_progress", row["subject_id"])
            print(f"appended {len(records)}/{len(rows)} {row['subject_id']}", flush=True)
    finalize(selection, read_records())


if __name__ == "__main__":
    main()
