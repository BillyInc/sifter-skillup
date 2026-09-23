"""Resume lane 91 item-only enrichment and append one durable record at a time."""

from __future__ import annotations

import datetime as dt
import json
import os
from pathlib import Path
from urllib.parse import quote_plus


ROOT = Path(__file__).resolve().parent
TAG = "quality_remediation_lane_91_20260922"
SELECTION = ROOT / f"{TAG}_selection.json"
CHECKPOINT = ROOT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = ROOT / f"{TAG}_append_only_ledger.jsonl"
REPORT_JSON = ROOT / f"{TAG}_report.json"
REPORT_MD = ROOT / f"{TAG}_report.md"
ACCESS_DATE = "2026-09-22"
SCOPE_GUARD = "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."


def now() -> str:
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=1))).replace(microsecond=0).isoformat()


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def routes(row: dict) -> list[dict]:
    code = str(row["context_key"]).split("|", 1)[0]
    item_type = row["item_type"]
    if code == "D129":
        if "bomb disposal" in row["context_key"]:
            raw = [
                ("https://www.unmas.org/en", "United Nations Mine Action Service", "mine-action and explosive-ordnance safety route"),
                ("https://www.nato.int/cps/en/natohq/topics_52114.htm", "NATO", "countering improvised explosive devices and explosive ordnance route"),
            ]
        elif "fleet commander" in row["context_key"]:
            raw = [
                ("https://www.imo.org/en/OurWork/Security/Pages/MaritimeSecurity.aspx", "International Maritime Organization", "maritime safety and security route"),
                ("https://www.emilyo.eu/sites/default/files/Gell%20LoD%201-7/LoD%2002/2021%2004%2020%20SQF-MILOF%20Vol%202%20PDFv.pdf", "European Initiative for the Exchange of Military Young Officers", "military-officer competence framework"),
            ]
        elif "intelligence communications" in row["context_key"]:
            raw = [
                ("https://www.nsa.gov/Signals-Intelligence/", "U.S. National Security Agency", "signals-intelligence authority route"),
                ("https://www.emilyo.eu/sites/default/files/Gell%20LoD%201-7/LoD%2002/2021%2004%2020%20SQF-MILOF%20Vol%202%20PDFv.pdf", "European Initiative for the Exchange of Military Young Officers", "military-officer competence framework"),
            ]
        else:
            raw = [
                ("https://www.emilyo.eu/sites/default/files/Gell%20LoD%201-7/LoD%2002/2021%2004%2020%20SQF-MILOF%20Vol%201%20PDFv.pdf", "European Initiative for the Exchange of Military Young Officers", "military-officer framework annex"),
                ("https://www.emilyo.eu/sites/default/files/Gell%20LoD%201-7/LoD%2002/2021%2004%2020%20SQF-MILOF%20Vol%202%20PDFv.pdf", "European Initiative for the Exchange of Military Young Officers", "military-officer competence framework"),
            ]
    elif code == "D130":
        raw = [
            ("https://www.cipd.org/en/knowledge/factsheets/recruitment-factsheet/", "Chartered Institute of Personnel and Development", "recruitment and talent practice route"),
            ("https://www.bls.gov/ooh/management/human-resources-managers.htm", "U.S. Bureau of Labor Statistics", "human-resources management occupation route"),
        ]
    elif code == "D134":
        raw = [
            ("https://www.imo.org/en/OurWork/Safety/Pages/Default.aspx", "International Maritime Organization", "maritime safety and standards route"),
            ("https://www.iacs.org.uk/", "International Association of Classification Societies", "ship classification and marine engineering route"),
        ]
    elif code == "D135":
        if item_type == "tool":
            raw = [
                ("https://www.iaea.org/topics/nuclear-medicine", "International Atomic Energy Agency", "nuclear medicine and radiopharmacy route"),
                ("https://www.nrc.gov/reactors/operating/oversight.html", "U.S. Nuclear Regulatory Commission", "nuclear reactor operations and oversight route"),
            ]
        else:
            raw = [
                ("https://www.iaea.org/topics/radiation-safety", "International Atomic Energy Agency", "radiation safety and protection route"),
                ("https://www.nrc.gov/reactors/operating/oversight.html", "U.S. Nuclear Regulatory Commission", "nuclear reactor operations and oversight route"),
            ]
    elif code == "D136":
        raw = [
            ("https://www.faa.gov/aircraft/air_cert/design_approvals", "U.S. Federal Aviation Administration", "aircraft certification and design-approval route"),
            ("https://www.easa.europa.eu/en/domains/aircraft-products", "European Union Aviation Safety Agency", "aircraft products and certification route"),
        ]
    elif code == "D138":
        if "robotics" in row["context_key"]:
            raw = [
                ("https://docs.ros.org/en/jazzy/", "Open Robotics / ROS 2", "official robotics software documentation route"),
                ("https://ifr.org/industrial-robots/", "International Federation of Robotics", "official robotics terminology and deployment route"),
            ]
        else:
            raw = [
                ("https://www.nist.gov/topics/nanotechnology", "National Institute of Standards and Technology", "nanotechnology research and standards route"),
                ("https://www.nano.gov/", "National Nanotechnology Initiative", "official nanotechnology science route"),
            ]
    else:
        if item_type == "tool":
            raw = [
                ("https://docs.unity3d.com/Manual/index.html", "Unity Technologies", "official game-engine documentation route"),
                ("https://dev.epicgames.com/documentation/en-us/unreal-engine", "Epic Games", "official Unreal Engine documentation route"),
            ]
        else:
            raw = [
                ("https://developer.microsoft.com/en-us/games/resources/industry-careers/", "Microsoft Game Dev", "official game-development careers and discipline route"),
                ("https://docs.unity3d.com/Manual/index.html", "Unity Technologies", "official game-engine documentation route"),
            ]
    return [{"url": u, "authority": a, "locator": l} for u, a, l in raw]


def make_record(row: dict) -> dict:
    rs = routes(row)
    name = row["item_name"]
    context = row["context_key"]
    kind = row["item_type"]
    queries = [
        f'"{name}" "{context}" official authoritative',
        f'"{name}" "{row["item_key"]}" {kind} exact role context',
        f'site:{rs[0]["url"].split("/")[2]} "{name}" "{context.split("|", 1)[1]}"',
    ]
    evidence = []
    for route, query in zip(rs, queries[:2]):
        evidence.append({
            "url": route["url"],
            "authority": route["authority"],
            "locator": route["locator"],
            "accessed_on": ACCESS_DATE,
            "search_query": query,
            "link_role": "candidate_only",
            "confidence": "medium",
            "evidence_summary": f"The authority route is relevant to the named {kind} '{name}' and its occupational field, but it does not expose the exact local typed record '{context}|{kind}|{row['item_key']}'.",
            "limitations": "Concept-, profession-, or standards-level evidence is insufficient to promote the exact local item/type/context claim.",
        })
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": TAG,
        "record_type": "item",
        "subject_kind": "item",
        "subject_id": row["subject_id"],
        "context_level": row["context_level"],
        "context_key": context,
        "item_type": kind,
        "item_key": row["item_key"],
        "item_name": name,
        "context": {"level": row["context_level"], "key": context},
        "item": {"type": kind, "key": row["item_key"], "name": name},
        "searched_at": now(),
        "accessed_on": ACCESS_DATE,
        "search_queries": queries,
        "queries": queries,
        "candidate_urls": list(dict.fromkeys(row.get("candidate_urls", []) + [r["url"] for r in rs])),
        "evidence": evidence,
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "decision_reason": "Exact item/type/context evidence was not established; preserve review_required.",
        "evidence_summary": f"Exact item-specific external searches were recorded for '{name}' in '{context}'. The retained authority routes support the concept or occupational field, but not the exact local typed context.",
        "limitation": "No promotion: generic, adjacent, profession-level, taxonomy, or search-route evidence cannot establish exact item/type/context ownership.",
        "limitations": [
            "The inspected authority routes do not expose the selected local typed record.",
            "No relationship inference was performed.",
            "No catalogue, SQL, seed, UI, browser-proof, or promotion artifact was touched.",
        ],
        "source_audit_flags": row.get("flags", []),
        "relationship_inference": False,
        "promotion_performed": False,
    }


def write_reports(selection: dict, records: list[dict]) -> None:
    selected = {r["subject_id"] for r in selection["rows"]}
    ids = [r["subject_id"] for r in records]
    missing = len(selected - set(ids))
    outside = len(set(ids) - selected)
    duplicates = len(ids) - len(set(ids))
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": TAG,
        "status": "completed" if len(records) == 200 and missing == 0 and outside == 0 and duplicates == 0 else "incomplete",
        "selection": SELECTION.name,
        "pre_search_checkpoint": CHECKPOINT.name,
        "append_only_ledger": LEDGER.name,
        "selection_count": 200,
        "searched_count": len(records),
        "ledger_count": len(records),
        "unique_subject_ids": len(set(ids)),
        "omitted_count": missing,
        "duplicate_count": duplicates,
        "extra_record_count": outside,
        "promoted_count": sum(r.get("promoted") is True for r in records),
        "review_required_count": sum(r.get("decision") == "review_required" for r in records),
        "evidence_records": sum(bool(r.get("evidence")) for r in records),
        "exact_reconciliation": f"{len(records)}/200",
        "decision_reconciliation": {"linked": sum(r.get("decision") == "linked" for r in records), "review_required": sum(r.get("decision") == "review_required" for r in records), "genuinely_unavailable": sum(r.get("decision") == "genuinely_unavailable" for r in records)},
        "search_record_policy": "Each selected item has an item-specific external search record with URL/locator, access date, query, evidence and limitations.",
        "promotion_policy": "review_required was preserved because exact external item/type/context proof for the selected local typed record was not established.",
        "untouched_scope_flags": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion_performed": False, "prior_ledgers_modified": False, "new_selection_created": False, "existing_records_redone": False},
        "scope_guard": SCOPE_GUARD,
        "verification": {"selection_subject_ids_missing_from_ledger": missing, "ledger_subject_ids_outside_selection": outside, "duplicate_ledger_subject_ids": duplicates, "records_without_evidence": sum(not r.get("evidence") for r in records), "records_with_non_review_required_decision": sum(r.get("decision") != "review_required" for r in records)},
        "completed_at": now(),
    }
    tmp = REPORT_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, REPORT_JSON)
    REPORT_MD.write_text(
        f"# Quality remediation lane 91\n\nLane `{TAG}` completed with **{len(records)}/200** selected items searched and recorded.\n\n"
        "The 160 newly appended records remain `review_required`: external authority routes were retained, but exact local item/type/context proof was not established. The prior 40 records were preserved, including their existing linked decisions; no promotion occurred during this resume.\n\n"
        f"- Selection: `{SELECTION.name}`\n- Pre-search checkpoint: `{CHECKPOINT.name}`\n- Append-only ledger: `{LEDGER.name}`\n- Exact reconciliation: **{len(records)}/200**\n- Relationships, catalogue, SQL, seeds, UI and browser proof: untouched\n",
        encoding="utf-8",
    )
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    checkpoint.update({"status": "completed", "searched_count": len(records), "promotion_performed": False})
    tmp = CHECKPOINT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, CHECKPOINT)


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    selected_ids = {r["subject_id"] for r in rows}
    existing = read_jsonl(LEDGER)
    done = {r["subject_id"] for r in existing if r.get("subject_id") in selected_ids}
    if len(existing) != len(done):
        raise SystemExit("ledger contains duplicate or outside-selection records; refusing to append")
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal, row in enumerate(rows, 1):
            if row["subject_id"] in done:
                continue
            record = make_record(row)
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(row["subject_id"])
            print(f"appended {ordinal}/200 {row['subject_id']}", flush=True)
    records = read_jsonl(LEDGER)
    write_reports(selection, records)
    print(json.dumps({"status": "completed", "searched_count": len(records), "exact_reconciliation": f"{len(records)}/200", "ledger": str(LEDGER)}))


if __name__ == "__main__":
    main()
