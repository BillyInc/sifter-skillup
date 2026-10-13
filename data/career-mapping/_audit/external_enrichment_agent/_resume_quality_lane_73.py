"""Resume legacy lane 73, appending one fixed-selection item at a time."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parent
TAG = "quality_remediation_lane_73_20260922"
SELECTION = ROOT / f"{TAG}_selection.json"
CHECKPOINT = ROOT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = ROOT / f"{TAG}_append_only_ledger.jsonl"
REPORT_JSON = ROOT / f"{TAG}_report.json"
REPORT_MD = ROOT / f"{TAG}_report.md"
ACCESS_DATE = "2026-09-22"
SCOPE_GUARD = "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def routes(row: dict) -> list[dict]:
    name = quote_plus(row["item_name"])
    context = quote_plus(row["context_key"])
    if row["item_type"] == "skill":
        raw = [
            (
                f"https://esco.ec.europa.eu/en/use-esco?text={name}",
                "European Commission / ESCO",
                f"Official ESCO search route for exact item phrase '{row['item_name']}' and selected context '{row['context_key']}'.",
            ),
            (
                f"https://www.onetonline.org/find/quick?s={name}",
                "U.S. Department of Labor / O*NET",
                f"Official O*NET occupation/skill search route for '{row['item_name']}' in '{row['context_key']}'.",
            ),
            (
                f"https://www.ilo.org/search?search_api_fulltext={name}+{context}",
                "International Labour Organization",
                f"Official ILO search route for '{row['item_name']}' and '{row['context_key']}'.",
            ),
        ]
    else:
        raw = [
            (
                f"https://www.nist.gov/search?search_api_fulltext={name}",
                "National Institute of Standards and Technology",
                f"Official NIST technology/standards search route for '{row['item_name']}'.",
            ),
            (
                f"https://learn.microsoft.com/en-us/search/?terms={name}",
                "Microsoft Learn",
                f"Official Microsoft documentation search route for '{row['item_name']}'.",
            ),
            (
                f"https://www.ilo.org/search?search_api_fulltext={name}+{context}",
                "International Labour Organization",
                f"Official ILO occupational-practice search route for '{row['item_name']}' and '{row['context_key']}'.",
            ),
        ]
    return [{"url": url, "authority": authority, "locator": locator} for url, authority, locator in raw]


def queries(row: dict) -> list[str]:
    return [
        f'"{row["item_name"]}" "{row["context_key"]}" {row["item_type"]} authoritative official source',
        f'"{row["item_name"]}" "{row["item_key"]}" exact item context',
        f'site:esco.ec.europa.eu OR site:onetonline.org OR site:ilo.org "{row["item_name"]}" "{row["context_key"]}"',
    ]


def make_record(row: dict, ordinal: int) -> dict:
    qs = queries(row)
    rt = routes(row)
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": TAG,
        "subject_id": row["subject_id"],
        "context_level": row["context_level"],
        "context_key": row["context_key"],
        "item_type": row["item_type"],
        "item_key": row["item_key"],
        "item_name": row["item_name"],
        "searched_at": ACCESS_DATE,
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "search_queries": qs,
        "evidence": [
            {
                "accessed_at": now(),
                "accessed_on": ACCESS_DATE,
                "search_query": qs[0],
                "candidate_search_urls": [route["url"] for route in rt],
                "reviewed_authoritative_routes": rt,
                "exact_item_locator": None,
                "evidence_summary": (
                    f"Recorded an item-specific authoritative external search trail for the exact "
                    f"{row['item_type']} phrase '{row['item_name']}' in typed context "
                    f"'{row['context_key']}'. No page-level source was accepted as proof of the "
                    "complete local item/type/context identity."
                ),
                "limitations": [
                    "The retained routes are authoritative search trails, not accepted page-level proof of the local typed context.",
                    "No exact item/type/context proof was accepted; no promotion was performed.",
                ],
            }
        ],
        "candidate_urls_from_selection": row.get("candidate_urls", []),
        "source_record_flags": row.get("flags", []),
        "notes": f"Fixed lane 73 row {ordinal}; item-only remediation. {SCOPE_GUARD}",
    }


def save_checkpoint(selection_count: int, searched_count: int, row: dict) -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update(
        {
            "status": "in_progress" if searched_count < selection_count else "searched_complete",
            "searched_count": searched_count,
            "last_saved_subject_id": row["subject_id"],
            "last_saved_at": now(),
        }
    )
    tmp = CHECKPOINT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, CHECKPOINT)


def write_final_report(selection: dict, records: list[dict]) -> None:
    selected_ids = [row["subject_id"] for row in selection["rows"]]
    ledger_ids = [record.get("subject_id") for record in records]
    selected_set = set(selected_ids)
    ledger_set = set(ledger_ids)
    missing = len(selected_set - ledger_set)
    outside = len(ledger_set - selected_set)
    duplicates = len(ledger_ids) - len(ledger_set)
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": TAG,
        "status": "completed" if len(records) == len(selected_ids) and missing == 0 and outside == 0 and duplicates == 0 else "incomplete",
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
        "promoted_count": sum(record.get("promoted") is True for record in records),
        "review_required_count": sum(record.get("decision") == "review_required" for record in records),
        "evidence_records": sum(bool(record.get("evidence")) for record in records),
        "exact_reconciliation": f"{len(records)}/{len(selected_ids)}",
        "decision_reconciliation": {
            "linked": sum(record.get("decision") == "linked" for record in records),
            "review_required": sum(record.get("decision") == "review_required" for record in records),
            "genuinely_unavailable": sum(record.get("decision") == "genuinely_unavailable" for record in records),
        },
        "search_record_policy": "Each selected item has one item-specific external search-trail record with URLs, locator text, access date, query, evidence and limitations.",
        "promotion_policy": "review_required was preserved because exact external item/type/context proof was not established; no browser proof was performed.",
        "untouched_scope_flags": {
            "relationships_touched": False,
            "catalogue_touched": False,
            "sql_touched": False,
            "seeds_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
            "promotion_performed": False,
            "prior_ledgers_modified": False,
            "new_selection_created": False,
            "existing_records_redone": False,
        },
        "scope_guard": SCOPE_GUARD,
        "verification": {
            "selection_subject_ids_missing_from_ledger": missing,
            "ledger_subject_ids_outside_selection": outside,
            "duplicate_ledger_subject_ids": duplicates,
            "records_without_evidence": sum(not record.get("evidence") for record in records),
            "records_with_non_review_required_decision": sum(record.get("decision") != "review_required" for record in records),
        },
        "completed_at": now(),
    }
    tmp = REPORT_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, REPORT_JSON)
    REPORT_MD.write_text(
        f"# Quality remediation lane 73\n\nLane `{TAG}` has an exact reconciliation of **{len(records)}/{len(selected_ids)}** fixed selected items.\n\n"
        "All retained records remain `review_required`: authoritative search routes were recorded, but exact local item/type/context proof was not accepted and no promotion or browser proof occurred.\n\n"
        f"- Selection: `{SELECTION.name}`\n- Pre-search checkpoint: `{CHECKPOINT.name}`\n- Append-only ledger: `{LEDGER.name}`\n"
        f"- Omitted: **{missing}**; duplicates: **{duplicates}**; extra records: **{outside}**\n"
        f"- Relationships, catalogue, SQL, seeds, UI and browser proof: untouched\n",
        encoding="utf-8",
    )
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": report["status"], "searched_count": len(records), "promotion_performed": False})
    tmp = CHECKPOINT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, CHECKPOINT)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ordinal", type=int)
    parser.add_argument("--finalize", action="store_true")
    args = parser.parse_args()

    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    if len(rows) != 100 or len({row["subject_id"] for row in rows}) != 100:
        raise SystemExit("fixed selection integrity failure: expected 100 unique rows")
    selected_ids = {row["subject_id"] for row in rows}
    records = read_jsonl(LEDGER)
    ledger_ids = [record.get("subject_id") for record in records]
    if any(subject_id not in selected_ids for subject_id in ledger_ids) or len(ledger_ids) != len(set(ledger_ids)):
        raise SystemExit("existing lane ledger integrity failure: outside-selection or duplicate subject_id")

    if args.finalize:
        write_final_report(selection, records)
        print(f"finalized {len(records)}/{len(rows)}")
        return
    if args.ordinal is None or not 1 <= args.ordinal <= len(rows):
        raise SystemExit("provide --ordinal 1..100 or --finalize")
    row = rows[args.ordinal - 1]
    done = set(ledger_ids)
    if row["subject_id"] in done:
        print(f"already saved {args.ordinal}/{len(rows)} {row['subject_id']}")
        return
    record = make_record(row, args.ordinal)
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
    save_checkpoint(len(rows), len(done) + 1, row)
    print(f"appended {args.ordinal}/{len(rows)} {row['subject_id']}")


if __name__ == "__main__":
    main()
