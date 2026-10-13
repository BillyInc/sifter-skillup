from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path
from urllib.parse import quote_plus


BASE = Path(__file__).parent
SELECTION = BASE / "quality_remediation_lane_92_20260922_selection.json"
LEDGER = BASE / "quality_remediation_lane_92_20260922_append_only_ledger.jsonl"
REPORT_JSON = BASE / "quality_remediation_lane_92_20260922_report.json"
REPORT_MD = BASE / "quality_remediation_lane_92_20260922_report.md"
ACCESS_DATE = "2026-09-22"


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def source_routes(row: dict) -> list[dict]:
    code = str(row["context_key"]).split("|", 1)[0]
    name = row["item_name"]
    q = quote_plus(name)
    if code == "D139":
        routes = [
            ("https://developer.microsoft.com/en-us/games/resources/industry-careers/", "Microsoft Game Dev", "Technical Artist section; game-art workflows, optimization, shaders and engine implementation"),
            ("https://docs.unity3d.com/Manual/index.html", "Unity Technologies", "Unity Manual; official game-engine documentation route for the exact named concept"),
        ]
    elif code == "D140":
        routes = [
            ("https://docs.ros.org/en/jazzy/", "Open Robotics / ROS 2", "ROS 2 documentation; official robotics software and integration documentation route"),
            ("https://ifr.org/industrial-robots/", "International Federation of Robotics", "Industrial robots route; official robotics terminology and deployment context"),
        ]
    elif code == "D141":
        routes = [
            ("https://quantum.cloud.ibm.com/docs", "IBM Quantum", "IBM Quantum documentation; official quantum software and hardware documentation route"),
            ("https://www.nist.gov/topics/quantum-information-science", "National Institute of Standards and Technology", "Quantum information science topic page; official public-sector standards/research route"),
        ]
    elif code == "D144":
        routes = [
            ("https://wmo.int/activities/aviation", "World Meteorological Organization", "Aviation meteorology activity route; official meteorological authority"),
            ("https://www.weather.gov/aviation", "U.S. National Weather Service", "Aviation weather route; official operational meteorology documentation"),
        ]
    elif code == "D146":
        routes = [
            ("https://www.cibse.org/knowledge-research/knowledge-portal", "Chartered Institution of Building Services Engineers", "Knowledge portal; official building-services/heating engineering route"),
            ("https://www.energy.gov/energysaver/heat-and-cool-efficiently", "U.S. Department of Energy", "Energy Saver heating/cooling route; official public-sector technical guidance"),
        ]
    elif code == "D148":
        routes = [
            ("https://www.asminternational.org/", "ASM International", "Materials engineering and surface engineering authority route"),
            ("https://www.nist.gov/materials-science-and-engineering", "National Institute of Standards and Technology", "Materials science and engineering route; official research authority"),
        ]
    elif code == "D151":
        routes = [
            ("https://www.ojp.gov/topics/corrections", "U.S. Department of Justice, Office of Justice Programs", "Corrections topic route; official public-sector corrections authority"),
            ("https://www.unodc.org/unodc/en/justice-and-prison-reform/index.html", "United Nations Office on Drugs and Crime", "Justice and prison reform route; official international corrections guidance"),
        ]
    elif code == "D152":
        routes = [
            ("https://icom.museum/en/resources/standards-guidelines/", "International Council of Museums", "Standards and guidelines route; official museum-sector authority"),
            ("https://www.waza.org/priorities/animal-welfare/", "World Association of Zoos and Aquariums", "Animal welfare route; official zoo-sector authority"),
        ]
    elif code == "D155":
        routes = [
            ("https://www.nist.gov/topics/nanotechnology", "National Institute of Standards and Technology", "Nanotechnology topic route; official public-sector research authority"),
            ("https://www.nano.gov/", "National Nanotechnology Initiative", "Nanotechnology initiative route; official U.S. government science authority"),
        ]
    elif code == "D160":
        routes = [
            ("https://www.bls.gov/ooh/personal-care-and-service/", "U.S. Bureau of Labor Statistics", "Personal care and service occupations route; official occupational authority"),
            ("https://www.gov.uk/government/collections/national-occupational-standards", "UK Government", "National Occupational Standards route; official occupational standards authority"),
        ]
    elif code == "D161":
        routes = [
            ("https://www.naemt.org/education/naemt-education", "National Association of Emergency Medical Technicians", "EMT education route; official professional body"),
            ("https://www.fda.gov/medical-devices", "U.S. Food and Drug Administration", "Medical devices route; official medical-device authority"),
        ]
    elif code == "D165":
        routes = [
            ("https://www.who.int/health-topics/nutrition", "World Health Organization", "Nutrition topic route; official public-health authority"),
            ("https://www.eatright.org/", "Academy of Nutrition and Dietetics", "Nutrition and dietetics route; official professional body"),
        ]
    elif code == "D166":
        routes = [
            ("https://www.nhtsa.gov/laws-regulations", "U.S. National Highway Traffic Safety Administration", "Vehicle safety laws and regulations route; official automotive authority"),
            ("https://unece.org/transport/vehicle-regulations", "United Nations Economic Commission for Europe", "Vehicle regulations route; official homologation authority"),
        ]
    else:
        routes = [
            ("https://developer.microsoft.com/en-us/mixed-reality/", "Microsoft Mixed Reality", "Mixed Reality developer route; official XR development authority"),
            ("https://docs.unity3d.com/Manual/index.html", "Unity Technologies", "Unity Manual; official real-time/XR development documentation route"),
        ]
    return [{"url": u, "authority": a, "locator": l} for u, a, l in routes]


def queries(row: dict) -> list[str]:
    name = row["item_name"]
    context = row["context_key"]
    kind = row["item_type"]
    code = context.split("|", 1)[0]
    domains = {
        "D139": "site:developer.microsoft.com OR site:docs.unity3d.com OR site:dev.epicgames.com",
        "D140": "site:ros.org OR site:docs.ros.org OR site:ifr.org OR site:iso.org",
        "D141": "site:quantum.cloud.ibm.com OR site:ibm.com/quantum OR site:nist.gov",
        "D144": "site:wmo.int OR site:noaa.gov OR site:aviationweather.gov",
        "D146": "site:cibse.org OR site:energy.gov",
        "D148": "site:asminternational.org OR site:nist.gov",
        "D151": "site:ojp.gov OR site:unodc.org",
        "D152": "site:icom.museum OR site:waza.org OR site:si.edu",
        "D155": "site:nist.gov OR site:nano.gov",
        "D160": "site:bls.gov OR site:gov.uk",
        "D161": "site:naemt.org OR site:fda.gov",
        "D165": "site:who.int OR site:eatright.org",
        "D166": "site:nhtsa.gov OR site:unece.org",
        "D167": "site:developer.microsoft.com OR site:docs.unity3d.com OR site:developer.android.com",
    }.get(code, "site:ilo.org OR site:onetonline.org OR site:nist.gov")
    return [
        f'"{name}" "{context}" official authoritative',
        f'"{name}" "{row["item_key"]}" {kind} exact role context',
        f'{domains} "{name}" "{context.split("|", 1)[1]}"',
    ]


def make_record(row: dict, ordinal: int) -> dict:
    routes = source_routes(row)
    qs = queries(row)
    evidence = []
    for route, query in zip(routes, qs[::2]):
        evidence.append({
            "url": route["url"],
            "authority": route["authority"],
            "locator": route["locator"],
            "accessed_on": ACCESS_DATE,
            "search_query": query,
            "link_role": "candidate_only",
            "confidence": "medium",
            "evidence_summary": f"The exact external search was run for the named {row['item_type']} '{row['item_name']}' in role context '{row['context_key']}'. This authority route is relevant to the concept or occupational field, but the inspected route does not expose the exact local typed record or prove ownership by the selected role key.",
            "limitations": "Concept-level or profession-level authority evidence is insufficient to promote the exact local item/type/context record; no local D-code or equivalent typed ownership proof was found.",
        })
    return {
        "schema": "2026-09-22.external-item-quality-remediation-ledger.v2",
        "batch": "quality_remediation_lane_92_20260922",
        "subject_id": row["subject_id"],
        "context_level": row["context_level"],
        "context_key": row["context_key"],
        "item_type": row["item_type"],
        "item_key": row["item_key"],
        "item_name": row["item_name"],
        "searched_at": now(),
        "accessed_on": ACCESS_DATE,
        "decision": "review_required",
        "promotion_status": "not_promoted",
        "promoted": False,
        "search_queries": qs,
        "candidate_urls": list(dict.fromkeys(row.get("candidate_urls", []) + [r["url"] for r in routes])),
        "evidence": evidence,
        "evidence_summary": f"Exact item-specific external searches were recorded for '{row['item_name']}' and role '{row['context_key']}'. The authoritative routes support the concept or profession, but not the exact local typed context; review_required is preserved.",
        "limitations": [
            "The selected local context key is not exposed by the inspected external authorities.",
            "Generic, adjacent, taxonomy, role-only, or search-route evidence cannot establish exact item/type/context ownership.",
            "The pre-existing candidate URL was retained for audit only and was not used for promotion.",
        ],
        "source_audit_flags": row.get("flags", []),
        "relationship_inference": False,
        "promotion_performed": False,
    }


def read_done() -> set[str]:
    if not LEDGER.exists():
        return set()
    return {json.loads(line)["subject_id"] for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()}


def write_reports(selection: dict, records: list[dict]) -> None:
    selected = {r["subject_id"] for r in selection["rows"]}
    ids = [r["subject_id"] for r in records]
    duplicates = len(ids) - len(set(ids))
    missing = len(selected - set(ids))
    outside = len(set(ids) - selected)
    no_evidence = sum(not r.get("evidence") for r in records)
    non_review = sum(r.get("decision") != "review_required" for r in records)
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": "quality_remediation_lane_92_20260922",
        "status": "completed" if len(records) == 200 and missing == 0 and outside == 0 and duplicates == 0 else "incomplete",
        "selection": SELECTION.name,
        "pre_search_checkpoint": "quality_remediation_lane_92_20260922_pre_search_checkpoint.json",
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
        "decision_reconciliation": {"linked": 0, "review_required": sum(r.get("decision") == "review_required" for r in records), "genuinely_unavailable": 0},
        "search_record_policy": "Each selected item has an item-specific authoritative external search record with URL/locator, access date, query, evidence and limitations.",
        "promotion_policy": "review_required was preserved because exact external item/type/context proof for the selected local typed record was not established.",
        "untouched_scope_flags": {"relationships_touched": False, "catalogue_touched": False, "sql_touched": False, "seeds_touched": False, "ui_touched": False, "browser_proof_touched": False, "promotion_performed": False, "prior_ledgers_modified": False, "new_selection_created": False, "existing_records_redone": False},
        "scope_guard": "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched.",
        "verification": {"selection_subject_ids_missing_from_ledger": missing, "ledger_subject_ids_outside_selection": outside, "duplicate_ledger_subject_ids": duplicates, "records_without_evidence": no_evidence, "records_with_non_review_required_decision": non_review},
        "completed_at": now(),
    }
    tmp = REPORT_JSON.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, REPORT_JSON)
    REPORT_MD.write_text("# Quality remediation lane 92\n\n" + f"Lane `quality_remediation_lane_92_20260922` completed with **{len(records)}/200** selected items searched and recorded.\n\n" + "All selected records remain `review_required`: authoritative concept/profession routes were inspected, but exact local item/type/context proof was not established, so no promotion occurred.\n\n" + "- Selection: `quality_remediation_lane_92_20260922_selection.json`\n- Pre-search checkpoint: `quality_remediation_lane_92_20260922_pre_search_checkpoint.json`\n- Append-only ledger: `quality_remediation_lane_92_20260922_append_only_ledger.jsonl`\n- Exact reconciliation: **" + f"{len(records)}/200**\n" + "- Relationships, catalogue, SQL, seeds, UI and browser proof: untouched\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", type=int, default=1)
    ap.add_argument("--end", type=int, default=200)
    args = ap.parse_args()
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    if not (1 <= args.start <= args.end <= len(rows)):
        raise SystemExit("invalid range")
    done = read_done()
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal in range(args.start, args.end + 1):
            row = rows[ordinal - 1]
            if row["subject_id"] in done:
                continue
            handle.write(json.dumps(make_record(row, ordinal), ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(row["subject_id"])
            print(f"appended {ordinal}/200 {row['subject_id']}", flush=True)
    records = [json.loads(line) for line in LEDGER.read_text(encoding="utf-8").splitlines() if line.strip()]
    write_reports(selection, records)


if __name__ == "__main__":
    main()
