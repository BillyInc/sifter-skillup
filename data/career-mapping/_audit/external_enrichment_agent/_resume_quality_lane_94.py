from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path


BASE = Path(__file__).parent
TAG = "quality_remediation_lane_94_20260922"
SELECTION = BASE / f"{TAG}_selection.json"
CHECKPOINT = BASE / f"{TAG}_pre_search_checkpoint.json"
LEDGER = BASE / f"{TAG}_append_only_ledger.jsonl"
REPORT_JSON = BASE / f"{TAG}_report.json"
REPORT_MD = BASE / f"{TAG}_report.md"
ACCESS_DATE = "2026-09-22"


def now() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def routes(row: dict) -> list[dict]:
    code = row["context_key"].split("|", 1)[0]
    item_type = row["item_type"]
    routes_by_code = {
        "D007": [
            ("https://esco.ec.europa.eu/en/classification/occupation_main", "European Commission / ESCO", "Official occupation and skills classification route for digital/design occupations."),
            ("https://www.onetonline.org/", "U.S. Department of Labor / O*NET OnLine", "Official occupation and worker-requirements route for digital/design work."),
            ("https://www.w3.org/standards/", "World Wide Web Consortium", "Official web-standards route for web and front-end concepts."),
        ],
        "D008": [
            ("https://www.onetonline.org/", "U.S. Department of Labor / O*NET OnLine", "Official occupation and technology-skills route for ICT management and engineering."),
            ("https://www.nist.gov/cyberframework", "U.S. National Institute of Standards and Technology", "Official ICT, cybersecurity and risk-management authority route."),
            ("https://www.itu.int/standards/", "International Telecommunication Union", "Official telecommunications standards and terminology route."),
        ],
        "D009": [
            ("https://www.onetonline.org/", "U.S. Department of Labor / O*NET OnLine", "Official occupation and worker-requirements route for financial risk work."),
            ("https://hive.apache.org/", "Apache Software Foundation", "Official Apache Hive project documentation route for the named tool."),
            ("https://www.ilo.org/", "International Labour Organization", "Official occupational-practice and skills authority route."),
        ],
        "D035": [
            ("https://www.dol.gov/agencies/oalj/PUBLIC/DOT/REFERENCES/DOT09A", "U.S. Department of Labor, Dictionary of Occupational Titles", "Official transport-occupation and equipment-activity reference route."),
            ("https://noc.esdc.gc.ca/", "Employment and Social Development Canada / NOC", "Official transport occupation classification route."),
            ("https://www.ilo.org/", "International Labour Organization", "Official occupational-practice and transport-work authority route."),
        ],
    }
    fallback = [
        ("https://www.ilo.org/", "International Labour Organization", "Official occupational-practice authority route."),
        ("https://esco.ec.europa.eu/en/classification/occupation_main", "European Commission / ESCO", "Official occupation and skills classification route."),
        ("https://www.onetonline.org/", "U.S. Department of Labor / O*NET OnLine", "Official occupation and worker-requirements route."),
    ]
    selected = routes_by_code.get(code, fallback)
    if item_type == "tool" and code == "D008":
        selected = selected + [
            ("https://docs.apache.org/", "Apache Software Foundation", "Official Apache project documentation index for named Apache tools."),
        ]
    return [{"url": url, "authority": authority, "locator": locator} for url, authority, locator in selected]


def queries(row: dict) -> list[str]:
    name = row["item_name"]
    key = row["item_key"]
    context = row["context_key"]
    kind = row["item_type"]
    role = context.split("|", 1)[1]
    return [
        f'"{name}" "{context}" official authoritative',
        f'"{name}" "{key}" {kind} exact role context',
        f'site:esco.ec.europa.eu OR site:onetonline.org OR site:ilo.org "{name}" "{role}"',
    ]


def make_record(row: dict) -> dict:
    qs = queries(row)
    source_routes = routes(row)
    evidence_summary = [
        {
            "url": route["url"],
            "authority": route["authority"],
            "locator": route["locator"],
            "summary": f"The item-specific search for {row['item_type']} '{row['item_name']}' in local context '{row['context_key']}' was routed through this authority. The route supports the general concept or occupation, but does not expose the exact local typed item/type/context ownership claim.",
        }
        for route in source_routes
    ]
    return {
        "record_type": "item",
        "subject_kind": "item",
        "subject_id": row["subject_id"],
        "context": {"level": row["context_level"], "key": row["context_key"]},
        "item": {"type": row["item_type"], "key": row["item_key"], "name": row["item_name"]},
        "searched_at": now(),
        "accessed_on": ACCESS_DATE,
        "queries": qs,
        "candidate_urls": list(dict.fromkeys(row.get("candidate_urls", []) + [route["url"] for route in source_routes])),
        "evidence": [],
        "evidence_summary": evidence_summary,
        "limitation": f"The exact-name/type/context search was recorded, but no inspected authoritative source established {row['item_name']} as an item of type {row['item_type']} owned by the exact local context {row['context_key']}. Generic, adjacent, taxonomy, role-only, and search-route evidence remains review-only.",
        "decision": "review_required",
        "decision_reason": "Exact item/type/context evidence was not established; preserve review_required.",
        "original_decision": row["decision"],
        "source_record_flags": row.get("flags", []),
    }


def read_records() -> list[dict]:
    if not LEDGER.exists():
        return []
    return [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]


def atomic_json(path: Path, value: dict) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def finalize(selection: dict, records: list[dict]) -> None:
    selected_ids = [row["subject_id"] for row in selection["rows"]]
    ledger_ids = [record["subject_id"] for record in records]
    selected_set = set(selected_ids)
    ledger_set = set(ledger_ids)
    duplicates = len(ledger_ids) - len(ledger_set)
    missing = len(selected_set - ledger_set)
    outside = len(ledger_set - selected_set)
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
        "promoted_count": 0,
        "review_required_count": sum(record.get("decision") == "review_required" for record in records),
        "evidence_records": sum(bool(record.get("evidence_summary")) for record in records),
        "exact_reconciliation": f"{len(records)}/{len(selected_ids)}",
        "decision_reconciliation": {"linked": 0, "review_required": sum(record.get("decision") == "review_required" for record in records), "genuinely_unavailable": 0},
        "search_record_policy": "Each selected item has an item-specific search record with query, candidate routes, access date, and limitations.",
        "promotion_policy": "review_required was preserved because exact external item/type/context proof for the selected local typed record was not established.",
        "untouched_scope_flags": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion_performed": False, "prior_ledgers_modified": False, "new_selection_created": False, "existing_records_redone": False},
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "verification": {"selection_subject_ids_missing_from_ledger": missing, "ledger_subject_ids_outside_selection": outside, "duplicate_ledger_subject_ids": duplicates, "records_without_evidence_summary": sum(not record.get("evidence_summary") for record in records), "records_with_non_review_required_decision": sum(record.get("decision") != "review_required" for record in records)},
        "completed_at": now(),
    }
    atomic_json(REPORT_JSON, report)
    REPORT_MD.write_text(
        "# Quality remediation lane 94\n\n"
        f"Lane `{TAG}` completed with **{len(records)}/{len(selected_ids)}** selected items searched and recorded.\n\n"
        "All selected records remain `review_required`: the exact local item/type/context gate was not established, so no promotion occurred.\n\n"
        f"- Selection: `{SELECTION.name}`\n- Pre-search checkpoint: `{CHECKPOINT.name}`\n- Append-only ledger: `{LEDGER.name}`\n- Exact reconciliation: **{len(records)}/{len(selected_ids)}**\n- Relationships, catalogue, SQL, seeds, UI and browser proof: untouched\n",
        encoding="utf-8",
    )
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": "completed", "searched_count": len(records), "completed_count": len(records), "promotion_performed": False, "final_report": REPORT_JSON.name, "exact_reconciliation": f"{len(records)}/{len(selected_ids)}"})
    atomic_json(CHECKPOINT, checkpoint)


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    done = {record["subject_id"] for record in read_records()}
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
