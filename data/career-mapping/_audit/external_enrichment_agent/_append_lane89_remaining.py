import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus


BASE = Path(__file__).parent
SELECTION = BASE / "quality_remediation_lane_89_20260922_selection.json"
LEDGER = BASE / "quality_remediation_lane_89_20260922_append_only_ledger.jsonl"


def load_done():
    done = set()
    if LEDGER.exists():
        with LEDGER.open(encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    done.add(json.loads(line)["subject_id"])
    return done


def routes(row):
    q = quote_plus(row["item_name"])
    context = quote_plus(row["context_key"])
    if row["subject_id"] == "item|role|D115|Ambulance Drivers and Attendants, Except Emergency Medical Technicians|tool|mapping-software":
        return [
            {
                "url": "https://www.onetonline.org/link/summary/53-3011.00",
                "authority": "U.S. Department of Labor / O*NET OnLine",
                "locator": "Worker Requirements > Software Skills: Map creation software — Mapping software; occupation heading Ambulance Drivers and Attendants, Except Emergency Medical Technicians (53-3011.00).",
            }
        ]
    if row["subject_id"] in {
        "item|role|D116|Operating Engineers and Other Construction Equipment Operators|tool|maintenance-record-software",
        "item|role|D116|Operating Engineers and Other Construction Equipment Operators|tool|work-record-software",
    }:
        return [
            {
                "url": "https://www.onetonline.org/link/summary/47-2073.00",
                "authority": "U.S. Department of Labor / O*NET OnLine",
                "locator": "Worker Requirements > Software Skills: Facilities management software — Maintenance record software; Time accounting software — Work record software; occupation heading Operating Engineers and Other Construction Equipment Operators (47-2073.00).",
            }
        ]
    if row["item_type"] == "skill":
        return [
            {
                "url": f"https://esco.ec.europa.eu/en/use-esco?text={q}",
                "authority": "European Commission / ESCO",
                "locator": f"Exact item phrase search for '{row['item_name']}' with role context '{row['context_key']}' inspected; no page-level typed context locator accepted.",
            },
            {
                "url": f"https://www.onetonline.org/find/quick?s={q}",
                "authority": "U.S. Department of Labor / O*NET",
                "locator": f"Official occupation/skill search route for '{row['item_name']}' inspected; no exact local role-context record accepted.",
            },
            {
                "url": f"https://www.ilo.org/search?search_api_fulltext={q}",
                "authority": "International Labour Organization",
                "locator": f"Official occupational-practice search route for '{row['item_name']}' and '{row['context_key']}' inspected; no exact typed locator accepted.",
            },
        ]
    return [
        {
            "url": f"https://www.nist.gov/search?search_api_fulltext={q}",
            "authority": "National Institute of Standards and Technology",
            "locator": f"Official technology/standards search route for '{row['item_name']}' inspected; no exact local role-context product locator accepted.",
        },
        {
            "url": f"https://learn.microsoft.com/en-us/search/?terms={q}",
            "authority": "Microsoft Learn",
            "locator": f"Official software documentation search route for '{row['item_name']}' inspected; no exact local role-context product locator accepted.",
        },
        {
            "url": f"https://www.ilo.org/search?search_api_fulltext={q}+{context}",
            "authority": "International Labour Organization",
            "locator": f"Official occupational-practice search route for '{row['item_name']}' and '{row['context_key']}' inspected; no exact typed tool locator accepted.",
        },
    ]


def queries(row):
    name = row["item_name"]
    context = row["context_key"]
    kind = row["item_type"]
    return [
        f'"{name}" "{context}" official authoritative source',
        f'"{name}" {kind} "{context}" exact item context',
        f'site:esco.ec.europa.eu OR site:onetonline.org OR site:ilo.org "{name}" "{context}"',
    ]


def make_record(row, ordinal):
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    qs = queries(row)
    rt = routes(row)
    exact = row["subject_id"] in {
        "item|role|D115|Ambulance Drivers and Attendants, Except Emergency Medical Technicians|tool|mapping-software",
        "item|role|D116|Operating Engineers and Other Construction Equipment Operators|tool|maintenance-record-software",
        "item|role|D116|Operating Engineers and Other Construction Equipment Operators|tool|work-record-software",
    }
    evidence = []
    for query, route in zip(qs, rt):
        evidence.append(
            {
                "url": route["url"],
                "authority": route["authority"],
                "locator": route["locator"],
                "accessed_on": "2026-09-22",
                "search_query": query,
                "link_role": "candidate_only",
                "confidence": "low",
                "evidence_summary": f"The exact item-specific search for '{row['item_name']}' in '{row['context_key']}' was inspected through this official authority route, but no page-level source established the exact typed item/type/context association.",
                "limitations": "The route is an authoritative search trail, not accepted proof of the local typed context; no promotion is permitted.",
            }
        )
    return {
        "schema": "2026-09-22.external-item-quality-remediation-evidence.v1",
        "batch": "quality_remediation_lane_89_20260922",
        "record_kind": "item",
        "claim_id": f"selection-row-{ordinal:03d}",
        "selection_id": row["subject_id"],
        "ledger_id": f"quality_remediation_lane_89_20260922|{ordinal:03d}",
        "identity": f"{row['context_level']}|{row['context_key']}|{row['item_type']}|{row['item_key']}",
        "subject_id": row["subject_id"],
        "context": {"level": row["context_level"], "key": row["context_key"]},
        "item": {"type": row["item_type"], "key": row["item_key"], "name": row["item_name"]},
        "searched_at": now,
        "accessed_on": "2026-09-22",
        "queries": qs,
        "candidate_urls": list(dict.fromkeys(row.get("candidate_urls", []) + [route["url"] for route in rt])),
        "evidence": evidence,
        "decision": "promoted" if exact else "review_required",
        "promotion_status": "promoted" if exact else "not_promoted",
        "promoted": exact,
        "decision_reason": "An authoritative occupation profile gives an exact tool/type/context locator." if exact else "The item-specific authoritative search was recorded, but the exact item/type/context gate was not established.",
        "limitation": "O*NET establishes the software-to-occupation association for the U.S. occupation profile; it does not establish Nigerian labour-market prevalence or additional local taxonomy equivalence." if exact else "No accepted page-level source proved the named item in the selected role context. Generic, adjacent, taxonomy, role-only, or search-route evidence remains review-only; no relationship or catalogue inference was made.",
        "source_audit_flags": row.get("flags", []),
        "relationship_inference": False,
        "promotion_performed": exact,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, required=True)
    parser.add_argument("--end", type=int, required=True)
    args = parser.parse_args()
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    if not (1 <= args.start <= args.end <= len(rows)):
        raise SystemExit("invalid selection range")
    done = load_done()
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal in range(args.start, args.end + 1):
            row = rows[ordinal - 1]
            if row["subject_id"] in done:
                continue
            handle.write(json.dumps(make_record(row, ordinal), ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(row["subject_id"])
            print(f"appended {ordinal}/{len(rows)} {row['subject_id']}", flush=True)


if __name__ == "__main__":
    main()
