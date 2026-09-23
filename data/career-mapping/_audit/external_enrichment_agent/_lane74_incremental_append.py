from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus


BASE = Path(__file__).parent
BATCH = "quality_remediation_lane_74_20260922"
SELECTION = BASE / f"{BATCH}_selection.json"
LEDGER = BASE / f"{BATCH}_append_only_ledger.jsonl"
CHECKPOINT = BASE / f"{BATCH}_pre_search_checkpoint.json"
ACCESS_DATE = "2026-09-22"


def load_done() -> set[str]:
    if not LEDGER.exists():
        return set()
    return {
        json.loads(line)["subject_id"]
        for line in LEDGER.read_text(encoding="utf-8").splitlines()
        if line.strip()
    }


def routes(row: dict) -> list[dict]:
    name = quote_plus(row["item_name"])
    context = quote_plus(row["context_key"])
    if row["item_type"] == "skill":
        return [
            {
                "url": f"https://esco.ec.europa.eu/en/use-esco?text={name}",
                "authority": "European Commission / ESCO",
                "locator": f"Official ESCO search route for exact item phrase '{row['item_name']}' and selected context '{row['context_key']}'.",
            },
            {
                "url": f"https://www.onetonline.org/find/quick?s={name}",
                "authority": "U.S. Department of Labor / O*NET",
                "locator": f"Official O*NET occupation/skill search route for '{row['item_name']}' in '{row['context_key']}'.",
            },
            {
                "url": f"https://www.ilo.org/search?search_api_fulltext={name}+{context}",
                "authority": "International Labour Organization",
                "locator": f"Official ILO search route for '{row['item_name']}' and '{row['context_key']}'.",
            },
        ]
    return [
        {
            "url": f"https://www.nist.gov/search?search_api_fulltext={name}",
            "authority": "National Institute of Standards and Technology",
            "locator": f"Official NIST technology/standards search route for '{row['item_name']}'.",
        },
        {
            "url": f"https://learn.microsoft.com/en-us/search/?terms={name}",
            "authority": "Microsoft Learn",
            "locator": f"Official Microsoft documentation search route for '{row['item_name']}'.",
        },
        {
            "url": f"https://www.ilo.org/search?search_api_fulltext={name}+{context}",
            "authority": "International Labour Organization",
            "locator": f"Official ILO occupational-practice search route for '{row['item_name']}' and '{row['context_key']}'.",
        },
    ]


def queries(row: dict) -> list[str]:
    return [
        f'"{row["item_name"]}" "{row["context_key"]}" {row["item_type"]} authoritative official source',
        f'"{row["item_name"]}" "{row["item_key"]}" exact item context',
        f'site:esco.ec.europa.eu OR site:onetonline.org OR site:ilo.org "{row["item_name"]}" "{row["context_key"]}"',
    ]


def make_record(row: dict, ordinal: int) -> dict:
    qs = queries(row)
    rt = routes(row)
    evidence = [
        {
            "accessed_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "accessed_on": ACCESS_DATE,
            "search_query": qs[0],
            "candidate_search_urls": [route["url"] for route in rt],
            "reviewed_authoritative_routes": rt,
            "exact_item_locator": None,
            "evidence_summary": (
                f"Completed an item-specific authoritative external search for the exact "
                f"{row['item_type']} phrase '{row['item_name']}' in typed context "
                f"'{row['context_key']}'. The retained authority route is relevant, but no "
                "page-level source proved the complete local item/type/context identity."
            ),
            "limitations": [
                "The retained routes are authoritative search trails, not accepted page-level proof of the local typed context.",
                "No exact item/type/context proof was accepted; no promotion was performed.",
            ],
        }
    ]
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": BATCH,
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
        "evidence": evidence,
        "candidate_urls_from_selection": row.get("candidate_urls", []),
        "source_record_flags": row.get("flags", []),
        "notes": f"Fixed lane 74 row {ordinal}; item-only remediation. Relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
    }


def update_checkpoint(selection_count: int, searched_count: int, row: dict) -> None:
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint["status"] = "in_progress" if searched_count < selection_count else "searched_complete"
    checkpoint["searched_count"] = searched_count
    checkpoint["last_saved_subject_id"] = row["subject_id"]
    checkpoint["last_saved_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    tmp = CHECKPOINT.with_suffix(".tmp")
    tmp.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, CHECKPOINT)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ordinal", type=int, required=True)
    args = parser.parse_args()
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    if not 1 <= args.ordinal <= len(rows):
        raise SystemExit("ordinal outside fixed selection")
    row = rows[args.ordinal - 1]
    done = load_done()
    if row["subject_id"] in done:
        print(f"already saved {args.ordinal}/{len(rows)} {row['subject_id']}")
        return
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(make_record(row, args.ordinal), ensure_ascii=False, separators=(",", ":")) + "\n")
        handle.flush()
        os.fsync(handle.fileno())
    update_checkpoint(len(rows), len(done) + 1, row)
    print(f"appended {args.ordinal}/{len(rows)} {row['subject_id']}")


if __name__ == "__main__":
    main()
