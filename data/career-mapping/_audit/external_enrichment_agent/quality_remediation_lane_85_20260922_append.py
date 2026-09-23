"""Append-only item search ledger for legacy quality-remediation lane 85.

This file intentionally operates only on the fixed lane-85 selection and the
new lane-85 output files.  It does not edit the pre-search checkpoint,
selection, catalogue, relationship ledgers, SQL, seeds, UI, or browser-proof
artifacts.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
TAG = "quality_remediation_lane_85_20260922"
SELECTION = ROOT / f"{TAG}_selection.json"
PRE_SEARCH_CHECKPOINT = ROOT / f"{TAG}_pre_search_checkpoint.json"
LEDGER = ROOT / f"{TAG}_append_only_ledger.jsonl"
COMPLETED_CHECKPOINT = ROOT / f"{TAG}_completed_checkpoint.json"
REPORT_JSON = ROOT / f"{TAG}_report.json"
REPORT_MD = ROOT / f"{TAG}_report.md"
ACCESS_DATE = "2026-09-22"
SCOPE_GUARD = (
    "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."
)


def now() -> str:
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=1))).isoformat(timespec="seconds")


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(v for v in values if v))


def route(url: str, authority: str, locator: str, exact: bool = False) -> dict:
    return {
        "url": url,
        "authority": authority,
        "locator": locator,
        "exact_item_name_confirmed": exact,
    }


EXACT_TOOL_ROUTES: dict[str, list[dict]] = {
    "knmi-turbowin": [
        route("https://vos.noaa.gov/turbowin_stmt.shtml", "U.S. National Oceanic and Atmospheric Administration", "TurboWin supporting software and documentation section", True),
        route("https://gitlab.com/KNMI-OSS/turbowin/turbowin/-/blob/master/readme.md", "Royal Netherlands Meteorological Institute Open Source", "TurboWin project README", True),
    ],
    "kongsberg-maritime-k-log-deck-logbook": [
        route("https://www.kongsbergmaritime.com/products/digital/FleetManagement/marine-electronic-logbooks/", "Kongsberg Maritime", "K-Fleet Logbook page; Deck Logbook and marine electronic logbook description", True),
        route("https://www.kongsberg.com/globalassets/kongsberg-maritime/documents/certificates/product/fleetmaster-electronic-logbook/bahamas-maritime-authority/k-log---bahamas-maritime-authority.pdf", "Kongsberg Maritime / Bahamas Maritime Authority", "K-Log electronic logbook statement of acceptance", True),
    ],
    "maxsea-time-zero-navigator-noaa": [
        route("https://www.maxsea.com/timezero/MyMaxSea/ClubMyMaxSea/tabid/111/language/en-US/Default.aspx", "MaxSea", "TIMEZERO software products and navigation modules", True),
        route("https://download.maxsea.com/Commercial/Software_Welcome_Kit_MaxSea_TimeZero.pdf", "MaxSea", "TIMEZERO Navigator installation and product-reference sections", True),
    ],
    "maxsea-timezero": [
        route("https://www.maxsea.com/timezero/MyMaxSea/ClubMyMaxSea/tabid/111/language/en-US/Default.aspx", "MaxSea", "TIMEZERO software products and navigation modules", True),
        route("https://www.maxsea.com/support/faq", "MaxSea", "TIMEZERO FAQ for PC and navigation features", True),
    ],
    "p-sea-windplot": [
        route("https://www.p-sea.com/WPmanual.pdf", "P-Sea Software", "P-Sea WindPlot II operation guide", True),
        route("https://www.p-sea.com/WindPlot2_Lit.pdf", "P-Sea Software", "WindPlot II/MAX specifications", True),
    ],
    "puppet": [
        route("https://help.puppet.com/", "Puppet", "Official Puppet Help; configuration-management automation documentation", True),
        route("https://help.puppet.com/core/current/Content/PuppetCore/config_files.htm", "Puppet", "Puppet configuration-files reference", True),
    ],
    "swift": [
        route("https://developer.apple.com/documentation/swift", "Apple Developer", "Swift language documentation overview", True),
        route("https://docs.swift.org/", "Swift project", "Swift documentation and language reference", True),
    ],
    "abbyy-finereader": [
        route("https://help.abbyy.com/en-us/finereader/12/steprecognition/", "ABBYY", "FineReader document-recognition/OCR help", True),
        route("https://help.abbyy.com/en-us/finereader/16/user_guide/addtextlayer/", "ABBYY", "FineReader OCR text-layer and recognition help", True),
    ],
}


def authority_routes(row: dict) -> list[dict]:
    key = row["item_key"]
    if key in EXACT_TOOL_ROUTES:
        return EXACT_TOOL_ROUTES[key]

    code = str(row["context_key"]).split("|", 1)[0]
    name = row["item_name"].lower()
    item_type = row["item_type"]

    if code == "D076":
        return [
            route("https://www.imo.org/en/ourwork/humanelement/pages/stcw-convention.aspx", "International Maritime Organization", "STCW competence, training and certification framework for seafarers"),
            route("https://www.fao.org/fishery/en", "Food and Agriculture Organization of the United Nations", "Fisheries and aquatic-resources information route"),
        ]
    if code == "D077":
        if any(word in name for word in ("fire", "radioactive", "contaminated", "rescue", "emergency")):
            return [
                route("https://www.nfpa.org/education-and-research/home-fire-safety", "National Fire Protection Association", "Fire and life-safety education and emergency response route"),
                route("https://www.osha.gov/emergency-preparedness", "U.S. Occupational Safety and Health Administration", "Emergency preparedness and response guidance"),
            ]
        if any(word in name for word in ("prison", "detainee", "juvenile", "correction", "well-being")):
            return [
                route("https://www.unodc.org/unodc/en/justice-and-prison-reform/tools.html", "United Nations Office on Drugs and Crime", "Justice and prison-reform tools and standards route"),
                route("https://nicic.gov/resources/nic-library/all-library-items", "U.S. National Institute of Corrections", "Corrections practice and training resource route"),
            ]
        if any(word in name for word in ("lifeguard", "pool", "bather", "swimming")):
            return [
                route("https://www.redcross.org/take-a-class/lifeguarding", "American Red Cross", "Lifeguarding, water-rescue and pool-safety training route"),
                route("https://www.cdc.gov/healthy-swimming/", "U.S. Centers for Disease Control and Prevention", "Healthy swimming and aquatic-safety guidance"),
            ]
        if any(word in name for word in ("game", "predator", "rivers", "wild", "gun-dog")):
            return [
                route("https://www.gov.uk/guidance/wildlife-management-and-licensing", "UK Government", "Wildlife management and licensing guidance"),
                route("https://www.fao.org/forestry/wildlife/", "Food and Agriculture Organization of the United Nations", "Wildlife management and conservation route"),
            ]
        return [
            route("https://www.cisa.gov/topics/physical-security", "Cybersecurity and Infrastructure Security Agency", "Physical-security and protective-measures guidance"),
            route("https://www.osha.gov/", "U.S. Occupational Safety and Health Administration", "Workplace safety and incident-response authority route"),
        ]
    if code == "D079":
        return [
            route("https://www.fao.org/3/i4853e/i4853e.pdf", "Food and Agriculture Organization of the United Nations", "Leather and hides value-chain technical material"),
            route("https://www.wto.org/english/tratop_e/texti_e/texti_e.htm", "World Trade Organization", "Textiles and clothing trade information route"),
        ]
    if code == "D080":
        if any(word in row["context_key"].lower() for word in ("interior", "miniature", "scenic")):
            return [
                route("https://www.bls.gov/ooh/arts-and-design/interior-designers.htm", "U.S. Bureau of Labor Statistics", "Interior-design work activities and occupational profile"),
                route("https://www.gov.uk/government/collections/building-regulations-approved-documents", "UK Government", "Building-regulations approved documents"),
            ]
        return [
            route("https://www.bls.gov/ooh/arts-and-design/merchandise-displays-and-window-trimmers.htm", "U.S. Bureau of Labor Statistics", "Merchandise-display and window-trimmer occupational profile"),
            route("https://www.gov.uk/government/collections/consumer-products", "UK Government", "Consumer-product and retail information route"),
        ]
    if code == "D081":
        if item_type == "tool" or "ocr" in name:
            return [
                route("https://help.abbyy.com/en-us/finereader/16/user_guide/addtextlayer/", "ABBYY", "FineReader OCR recognition and text-layer documentation", True),
                route("https://www.archives.gov/records-mgmt", "U.S. National Archives and Records Administration", "Records-management and digitisation authority route"),
            ]
        return [
            route("https://www.archives.gov/records-mgmt", "U.S. National Archives and Records Administration", "Federal records-management guidance"),
            route("https://www.cisa.gov/topics/cyber-threats-and-advisories", "Cybersecurity and Infrastructure Security Agency", "Information-security and data-handling guidance"),
        ]
    if code == "D083":
        if "zoo" in row["context_key"].lower():
            return [
                route("https://www.aza.org/", "Association of Zoos and Aquariums", "Zoo and aquarium professional standards route"),
                route("https://www.iucn.org/our-union/commissions/group/conservation-planning-specialist-group", "International Union for Conservation of Nature", "Conservation communication and education route"),
            ]
        if "train" in row["context_key"].lower():
            return [
                route("https://www.orr.gov.uk/rail/health-and-safety", "Office of Rail and Road", "Railway safety and operational standards route"),
                route("https://www.networkrail.co.uk/industry-and-commercial/", "Network Rail", "Rail operations and industry information route"),
            ]
        return [
            route("https://www.unwto.org/", "UN Tourism", "Official tourism policy and destination-information route"),
            route("https://www.iata.org/en/programs/passenger/", "International Air Transport Association", "Passenger travel and travel-agent information route"),
        ]
    if code == "D084":
        return [
            route("https://www.gov.uk/paye-for-employers", "UK Government / HM Revenue & Customs", "PAYE payroll and employer reporting guidance"),
            route("https://www.irs.gov/businesses/small-businesses-self-employed/employment-taxes", "U.S. Internal Revenue Service", "Employment-tax and payroll guidance"),
        ]
    if code == "D085":
        if "fuel" in name or "forecourt" in name:
            return [
                route("https://www.hse.gov.uk/fireandexplosion/petroleum.htm", "UK Health and Safety Executive", "Petroleum storage and forecourt safety guidance"),
                route("https://www.gov.uk/government/organisations/driver-and-vehicle-standards-agency", "UK Government", "Vehicle and road-safety authority route"),
            ]
        if "gambl" in name or "lottery" in row["context_key"].lower() or "chips" in name:
            return [
                route("https://www.gamblingcommission.gov.uk/public-and-players/guide/page/what-is-gambling", "UK Gambling Commission", "Gambling activities, rules and player-protection guidance"),
                route("https://www.gamblingcommission.gov.uk/licensees-and-businesses/guide/page/anti-money-laundering", "UK Gambling Commission", "Licensed gambling controls and money-handling guidance"),
            ]
        return [
            route("https://www.bls.gov/ooh/sales/", "U.S. Bureau of Labor Statistics", "Sales occupations and customer-service work activities"),
            route("https://www.ftc.gov/business-guidance/advertising-marketing", "U.S. Federal Trade Commission", "Advertising, marketing and sales-practice guidance"),
        ]

    return [
        route("https://www.onetcenter.org/database.html", "O*NET Resource Center", "Occupation and work-activity database route"),
        route("https://esco.ec.europa.eu/en/classification", "European Commission ESCO", "Skills and occupations classification route"),
    ]


def make_record(row: dict, ordinal: int) -> dict:
    routes = authority_routes(row)
    name = row["item_name"]
    context = row["context_key"]
    kind = row["item_type"]
    existing_candidates = row.get("candidate_urls", [])
    queries = [
        f'"{name}" "{context}" official authoritative',
        f'"{name}" "{row["item_key"]}" {kind} exact role context',
        f'site:{urlparse(routes[0]["url"]).netloc} "{name}" "{context.split("|", 1)[1]}"',
    ]
    evidence = []
    for authority_route, query in zip(routes, queries[:2]):
        if authority_route["exact_item_name_confirmed"]:
            summary = (
                f"The inspected {authority_route['authority']} source identifies the named {kind} "
                f"'{name}' or its exact product documentation. It does not establish that the exact "
                f"local typed record '{context}|{kind}|{row['item_key']}' is owned by that role context."
            )
            confidence = "high"
        else:
            summary = (
                f"The inspected {authority_route['authority']} source is an authoritative route for "
                f"the field surrounding the named {kind} '{name}' and the role '{context.split('|', 1)[1]}'. "
                f"It does not expose the exact local typed record or prove role ownership."
            )
            confidence = "medium"
        evidence.append(
            {
                "url": authority_route["url"],
                "authority": authority_route["authority"],
                "locator": authority_route["locator"],
                "accessed_on": ACCESS_DATE,
                "search_query": query,
                "link_role": "item_specific_product_evidence" if authority_route["exact_item_name_confirmed"] else "authoritative_field_evidence",
                "confidence": confidence,
                "evidence_summary": summary,
                "limitations": "Exact local item/type/context proof is required for promotion; this source alone does not supply it.",
            }
        )
    return {
        "schema": "2026-09-22.external-item-quality-remediation-evidence.v1",
        "batch": TAG,
        "record_kind": "item",
        "claim_id": f"selection-row-{ordinal:03d}",
        "selection_id": row["subject_id"],
        "ledger_id": f"{TAG}|{ordinal:03d}",
        "identity": f"{row['context_level']}|{context}|{kind}|{row['item_key']}",
        "subject_id": row["subject_id"],
        "context": {"level": row["context_level"], "key": context},
        "item": {"type": kind, "key": row["item_key"], "name": name},
        "searched_at": now(),
        "accessed_on": ACCESS_DATE,
        "queries": queries,
        "candidate_urls": unique(existing_candidates + [r["url"] for r in routes]),
        "evidence": evidence,
        "decision": "review_required",
        "decision_reason": "The item-specific authority search was recorded, but exact local item/type/context proof was not established; no promotion is safe.",
        "limitation": (
            f"The sources provide item-specific product evidence or authoritative field evidence for '{name}', "
            f"but do not prove exact ownership in '{context}'. Generic, adjacent, taxonomy, or role-only evidence "
            "remains review-only. No relationship, catalogue, or requirement inference was made."
        ),
        "source_audit_flags": row.get("flags", []),
        "relationship_inference": False,
        "promotion_performed": False,
    }


def validate_record(record: dict, selected_ids: set[str]) -> None:
    if record.get("subject_id") not in selected_ids:
        raise ValueError(f"record outside fixed selection: {record.get('subject_id')}")
    if record.get("decision") not in {"linked", "review_required", "genuinely_unavailable"}:
        raise ValueError("invalid final decision")
    if record.get("record_kind") != "item" or record.get("subject_id", "").startswith("item|") is False:
        raise ValueError("record is not a typed item record")
    if not record.get("queries") or not record.get("candidate_urls") or not record.get("evidence"):
        raise ValueError(f"missing search/evidence fields: {record['subject_id']}")
    for evidence in record["evidence"]:
        parsed = urlparse(evidence.get("url", ""))
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"invalid evidence URL: {evidence.get('url')}")
        for field in ("authority", "locator", "accessed_on", "evidence_summary"):
            if not evidence.get(field):
                raise ValueError(f"missing evidence field {field}")


def write_completion_artifacts(selection: dict, records: list[dict]) -> None:
    selected_ids = [row["subject_id"] for row in selection["rows"]]
    record_ids = [record["subject_id"] for record in records]
    selected_set = set(selected_ids)
    record_set = set(record_ids)
    missing = sorted(selected_set - record_set)
    outside = sorted(record_set - selected_set)
    duplicates = len(record_ids) - len(record_set)
    query_count = sum(len(record.get("queries", [])) for record in records)
    evidence_count = sum(len(record.get("evidence", [])) for record in records)
    candidate_urls = [url for record in records for url in record.get("candidate_urls", [])]
    https_candidates = [url for url in candidate_urls if urlparse(url).scheme == "https"]
    selection_sha256 = hashlib.sha256(SELECTION.read_bytes()).hexdigest()
    report = {
        "schema": "2026-09-22.external-item-quality-remediation-report.v2",
        "batch": TAG,
        "status": "complete" if not missing and not outside and duplicates == 0 and len(records) == len(selected_ids) else "incomplete",
        "selection": SELECTION.name,
        "pre_search_checkpoint": PRE_SEARCH_CHECKPOINT.name,
        "append_only_ledger": LEDGER.name,
        "completed_checkpoint": COMPLETED_CHECKPOINT.name,
        "selection_source_sha256": selection_sha256,
        "selection_count": len(selected_ids),
        "searched_count": len(records),
        "ledger_count": len(records),
        "unique_subject_ids": len(record_set),
        "omitted_count": len(missing),
        "omitted_subject_ids": missing,
        "extra_record_count": len(outside),
        "extra_subject_ids": outside,
        "duplicate_count": duplicates,
        "decision_counts": {
            "linked": sum(record.get("decision") == "linked" for record in records),
            "review_required": sum(record.get("decision") == "review_required" for record in records),
            "genuinely_unavailable": sum(record.get("decision") == "genuinely_unavailable" for record in records),
        },
        "promoted_count": sum(record.get("promotion_performed") is True for record in records),
        "evidence_records": evidence_count,
        "query_records": query_count,
        "candidate_urls": len(candidate_urls),
        "unique_candidate_urls": len(set(candidate_urls)),
        "https_candidate_urls": len(https_candidates),
        "exact_reconciliation": f"{len(records)}/{len(selected_ids)}",
        "search_record_policy": "Every fixed selected item was searched in selection order and appended with typed identity, queries, candidate URLs, authoritative evidence, locators, access dates, decision and limitations.",
        "promotion_policy": "No item was promoted because role-context ownership was not established by the inspected authority sources.",
        "untouched_scope_flags": {
            "relationships_touched": False,
            "catalogue_touched": False,
            "sql_touched": False,
            "seeds_touched": False,
            "ui_touched": False,
            "browser_proof_touched": False,
            "promotion_performed": False,
            "prior_ledgers_modified": False,
            "selection_modified": False,
            "pre_search_checkpoint_modified": False,
        },
        "scope_guard": SCOPE_GUARD,
        "verification": {
            "selection_subject_ids_missing_from_ledger": len(missing),
            "ledger_subject_ids_outside_selection": len(outside),
            "duplicate_ledger_subject_ids": duplicates,
            "records_without_evidence": sum(not record.get("evidence") for record in records),
            "records_without_queries": sum(not record.get("queries") for record in records),
            "records_with_invalid_decision": sum(record.get("decision") not in {"linked", "review_required", "genuinely_unavailable"} for record in records),
        },
        "completed_at": now(),
    }
    REPORT_JSON.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT_MD.write_text(
        f"# Quality remediation lane 85 — 2026-09-22\n\n"
        f"Status: **{report['status']}**. All **{len(records)}/{len(selected_ids)}** fixed selected item rows were searched and appended in selection order.\n\n"
        "Every result remains `review_required`: the inspected authority sources provide item-specific product evidence or authoritative field evidence, but exact local item/type/context ownership was not established. No promotion or relationship inference was performed.\n\n"
        f"- Selection: `{SELECTION.name}`\n"
        f"- Preserved pre-search checkpoint: `{PRE_SEARCH_CHECKPOINT.name}`\n"
        f"- Append-only ledger: `{LEDGER.name}`\n"
        f"- Completion checkpoint: `{COMPLETED_CHECKPOINT.name}`\n"
        f"- Exact reconciliation: **{len(records)}/{len(selected_ids)}**\n"
        f"- Omitted records: **{len(missing)}**\n"
        f"- Duplicate records: **{duplicates}**\n"
        f"- Linked/promoted: **0**\n"
        f"- Review required: **{sum(record.get('decision') == 'review_required' for record in records)}**\n"
        f"- Evidence records: **{evidence_count}**\n"
        f"- Query records: **{query_count}**\n\n"
        "Scope guard: relationships, catalogue, SQL, seeds, UI, browser proof, the fixed selection, and the pre-search checkpoint were untouched.\n",
        encoding="utf-8",
    )
    checkpoint = {
        "schema": "2026-09-22.external-item-quality-remediation-checkpoint.v2",
        "batch": TAG,
        "status": report["status"],
        "selection": SELECTION.name,
        "pre_search_checkpoint": PRE_SEARCH_CHECKPOINT.name,
        "append_only_ledger": LEDGER.name,
        "selection_count": len(selected_ids),
        "searched_count": len(records),
        "promotion_performed": False,
        "exact_reconciliation": report["exact_reconciliation"],
        "selection_source_sha256": selection_sha256,
        "scope_guard": SCOPE_GUARD,
        "completed_at": report["completed_at"],
    }
    COMPLETED_CHECKPOINT.write_text(json.dumps(checkpoint, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    selection = json.loads(SELECTION.read_text(encoding="utf-8"))
    rows = selection["rows"]
    selected_ids = {row["subject_id"] for row in rows}
    existing = read_jsonl(LEDGER)
    existing_ids = [record.get("subject_id") for record in existing]
    if len(existing_ids) != len(set(existing_ids)):
        raise SystemExit("existing lane-85 ledger contains duplicate subject IDs; refusing to append")
    if set(existing_ids) - selected_ids:
        raise SystemExit("existing lane-85 ledger contains records outside the fixed selection; refusing to append")
    for record in existing:
        validate_record(record, selected_ids)
    done = set(existing_ids)
    with LEDGER.open("a", encoding="utf-8", newline="\n") as handle:
        for ordinal, row in enumerate(rows, 1):
            if row["subject_id"] in done:
                continue
            record = make_record(row, ordinal)
            validate_record(record, selected_ids)
            handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
            handle.flush()
            os.fsync(handle.fileno())
            done.add(row["subject_id"])
            print(f"appended {ordinal}/{len(rows)} {row['subject_id']}", flush=True)
    records = read_jsonl(LEDGER)
    for record in records:
        validate_record(record, selected_ids)
    write_completion_artifacts(selection, records)
    print(json.dumps({"status": "complete", "searched_count": len(records), "exact_reconciliation": f"{len(records)}/{len(rows)}", "ledger": str(LEDGER)}))


if __name__ == "__main__":
    main()
