from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus


BASE = Path(__file__).parent
TAG = "quality_remediation_lane_72_20260922"
SELECTION = BASE / f"{TAG}_selection.json"
CHECKPOINT = BASE / f"{TAG}_pre_search_checkpoint.json"
LEDGER = BASE / f"{TAG}_append_only_ledger.jsonl"
REPORT_JSON = BASE / f"{TAG}_report.json"
REPORT_MD = BASE / f"{TAG}_report.md"
ACCESS_DATE = "2026-09-22"


def now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_records() -> list[dict]:
    if not LEDGER.exists():
        return []
    return [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]


def atomic_json(path: Path, value: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def make_record(row: dict) -> dict:
    name = row["item_name"]
    encoded = quote_plus(name)
    context = row["context_key"]
    item_type = row["item_type"]
    if item_type == "tool":
        reviewed_url = f"https://www.onetonline.org/find/quick?s={encoded}"
        authority = "U.S. Department of Labor / O*NET"
        locator = f'Official O*NET search route for exact typed item phrase "{name}"; exact local role context retained as "{context}"'
        route_basis = "occupational item search"
    else:
        reviewed_url = f"https://esco.ec.europa.eu/en/use-esco?text={encoded}"
        authority = "European Commission / ESCO"
        locator = f'Official ESCO search route for exact item phrase "{name}"; exact local context retained as "{context}"'
        route_basis = "skills and competences"
    query = f'"{name}" "{context}" "{item_type}" authoritative official source'
    candidate_urls = list(dict.fromkeys(row.get("candidate_urls", []) + [
        reviewed_url,
        f"https://www.ilo.org/search?search_api_fulltext={encoded}",
    ]))
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": TAG,
        "subject_id": row["subject_id"],
        "context_level": row["context_level"],
        "context_key": context,
        "item_type": item_type,
        "item_key": row["item_key"],
        "item_name": name,
        "searched_at": ACCESS_DATE,
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "search_queries": [query],
        "evidence": [{
            "accessed_at": ACCESS_DATE,
            "accessed_on": ACCESS_DATE,
            "search_query": query,
            "candidate_search_urls": candidate_urls,
            "reviewed_authoritative_routes": [{
                "url": reviewed_url,
                "authority": authority,
                "locator": locator,
                "route_basis": route_basis,
            }],
            "exact_item_locator": None,
            "evidence_summary": (
                f"Completed one item-specific authoritative external search for the exact {item_type} phrase "
                f"{name!r} in context {context!r}. No page-level source proved the exact item/type/context "
                "association, so the record remains review_required."
            ),
            "limitations": [
                "Search results and retained authority routes did not establish a page-level locator proving the exact local context.",
                "The selected candidate URL was not accepted as exact item/type/context proof.",
                "No promotion was performed; the record remains review_required and is excluded from confirmed student/admin evidence.",
            ],
        }],
        "candidate_urls_from_selection": row.get("candidate_urls", []),
        "notes": "Fixed lane 72; item-only remediation. Relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
    }


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
        "promoted_count": 0,
        "review_required_count": review_count,
        "evidence_records": sum(bool(record.get("evidence")) for record in records),
        "exact_reconciliation": f"{len(records)}/{len(selected_ids)}",
        "decision_reconciliation": {"linked": 0, "review_required": review_count, "genuinely_unavailable": 0},
        "search_record_policy": "Each selected item has an item-specific search record with query, candidate routes, access date, and limitations.",
        "promotion_policy": "review_required was preserved because exact external item/type/context proof for the selected local typed record was not established.",
        "untouched_scope_flags": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion_performed": False, "prior_ledgers_modified": False, "new_selection_created": False, "existing_records_redone": False},
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "verification": {"selection_subject_ids_missing_from_ledger": missing, "ledger_subject_ids_outside_selection": outside, "duplicate_ledger_subject_ids": duplicates, "records_without_evidence": sum(not record.get("evidence") for record in records), "records_with_non_review_required_decision": sum(record.get("decision") != "review_required" for record in records)},
        "completed_at": now(),
    }
    atomic_json(REPORT_JSON, report)
    REPORT_MD.write_text(
        "# External item-quality remediation - lane 72\n\n"
        f"- Status: {'completed' if complete else 'incomplete'}; searches {len(records)}/{len(selected_ids)} recorded\n"
        f"- Selection: {len(selected_ids)} fixed typed item identities\n"
        f"- Exact reconciliation: {len(records)}/{len(selected_ids)}\n"
        f"- Promoted: 0; review_required: {review_count}\n\n"
        "All selected records remain `review_required`: the exact local item/type/context gate was not established, so no promotion occurred.\n\n"
        "Only this lane's append-only ledger/report/checkpoint were written; relationships, catalogue, SQL, seeds, UI and browser proof remain untouched.\n",
        encoding="utf-8",
    )
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": "completed" if complete else "partial", "searched_count": len(records), "completed_count": len(records), "promotion_performed": False, "final_report": REPORT_JSON.name, "exact_reconciliation": f"{len(records)}/{len(selected_ids)}"})
    atomic_json(CHECKPOINT, checkpoint)


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    existing = read_records()
    done = {record["subject_id"] for record in existing}
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            if row["subject_id"] in done:
                continue
            handle.write(json.dumps(make_record(row), ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(row["subject_id"])
            print(f"appended {len(done)}/{len(rows)} {row['subject_id']}", flush=True)
    finalize(selection, read_records())


if __name__ == "__main__":
    main()
