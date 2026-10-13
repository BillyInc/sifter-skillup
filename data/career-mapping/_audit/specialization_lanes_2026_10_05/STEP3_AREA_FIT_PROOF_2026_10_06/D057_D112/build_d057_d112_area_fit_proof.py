"""Build direct area-of-specialization fit proof for D057-D112.

This is an append-only proof artifact.  It reads the finalized global Step 1
recommendations and the lane-owned source registers, then writes one proof
record per recommended area in small domain batches.  It deliberately does
not write canonical taxonomy, subgroup, role, or Nigerian-context data.

The source records prove the bounded practice/learning claim recorded for an
area.  They do not, by themselves, prove that the displayed area count is a
universal taxonomy or an accreditation decision.
"""

from __future__ import annotations

import argparse
import json
from collections import OrderedDict
from pathlib import Path
from typing import Any, Iterable


HERE = Path(__file__).resolve().parent
LANE_ROOT = HERE.parents[1]
RECON_ROOT = LANE_ROOT / "STEP1_RECONCILIATION_2026_10_06"
AGENT_REGISTER = (
    RECON_ROOT
    / "AGENT_D057_D112"
    / "step1_d057_d112_reconciliation_register_2026_10_06_012.json"
)
GLOBAL_REGISTER = (
    RECON_ROOT / "global_step1_specialization_reconciliation_2026_10_06.json"
)
D068_SOURCE = (
    RECON_ROOT
    / "D068_PARENT_SCOPE_RESOLUTION_2026_10_06"
    / "d068_step1_parent_scope_adjudication_2026_10_06.json"
)
CANDIDATE_ROOT = LANE_ROOT / "D057_D168"
DOMAIN_RECON_ROOT = LANE_ROOT / "D001_D112_GLOBAL_RECONCILIATION"

SCHEMA_VERSION = "2026-10-06.d057-d112.direct-area-fit-proof.v1"

BATCHES = OrderedDict(
    [
        ("batch_01_D057_D068", list(range(57, 69))),
        ("batch_02_D069_D080", list(range(69, 81))),
        ("batch_03_D081_D092", list(range(81, 93))),
        ("batch_04_D093_D104", list(range(93, 105))),
        ("batch_05_D105_D112", list(range(105, 113))),
    ]
)


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def text(value: Any) -> str:
    return str(value).strip() if value is not None else ""


def normalise_source(raw: dict[str, Any], fallback_id: str | None = None) -> dict[str, Any] | None:
    source_id = text(raw.get("source_id")) or text(fallback_id)
    url = text(raw.get("url"))
    if not source_id or not url:
        return None
    return {
        "source_id": source_id,
        "publisher": text(raw.get("publisher")) or "Not recorded",
        "source_type": text(raw.get("source_type")) or "Not recorded",
        "title": text(raw.get("title")) or "Not recorded",
        "url": url,
        "access_date": text(raw.get("access_date")) or "2026-10-06",
        "locator": text(raw.get("locator")) or "Not recorded",
        "supported_claim": (
            text(raw.get("supported_claim"))
            or text(raw.get("claim_supported"))
            or text(raw.get("supports"))
            or "Not recorded"
        ),
        "limitation": (
            text(raw.get("limitation"))
            or text(raw.get("claim_limit"))
            or text(raw.get("limits"))
            or "Not recorded"
        ),
        "geographic_scope": (
            text(raw.get("geographic_scope"))
            or text(raw.get("geographic_scope_disposition"))
            or "Not recorded"
        ),
    }


def source_quality(source: dict[str, Any]) -> int:
    fields = ("publisher", "source_type", "title", "locator", "supported_claim", "limitation")
    bad = {"", "Not recorded", "title not captured in shared evidence register", "not captured in shared evidence register", "See originating review artifact; no new claim inferred by this reconciler."}
    return sum(bool(text(source.get(field))) and text(source.get(field)) not in bad for field in fields)


def merge_source(index: dict[str, dict[str, Any]], raw: dict[str, Any]) -> None:
    source = normalise_source(raw)
    if not source:
        return
    previous = index.get(source["source_id"])
    if previous is None or source_quality(source) > source_quality(previous):
        index[source["source_id"]] = source


def collect_source_index() -> dict[str, dict[str, Any]]:
    index: dict[str, dict[str, Any]] = {}

    def collect_domain_sources(domains: Iterable[dict[str, Any]]) -> None:
        for domain in domains:
            for raw in domain.get("evidence", {}).get("sources", []) or []:
                if isinstance(raw, dict):
                    merge_source(index, raw)
            for raw in domain.get("source_register", []) or []:
                if isinstance(raw, dict):
                    merge_source(index, raw)

    collect_domain_sources(load_json(AGENT_REGISTER).get("domains", []))
    collect_domain_sources([load_json(D068_SOURCE)])

    # Candidate-review and per-domain reconciliation artifacts contain the
    # fuller metadata for some late-lane records whose shared projection kept
    # only a URL or a placeholder title.
    for root in (CANDIDATE_ROOT, DOMAIN_RECON_ROOT):
        for path in root.rglob("*.json"):
            try:
                payload = load_json(path)
            except (OSError, json.JSONDecodeError):
                continue
            if not isinstance(payload, dict):
                continue
            for key in ("evidence", "source_register", "source_records", "proposed_evidence_rows", "supplemental_evidence"):
                values = payload.get(key, [])
                if isinstance(values, list):
                    for raw in values:
                        if isinstance(raw, dict):
                            merge_source(index, raw)
            reconciliation = payload.get("evidence_reconciliation", {})
            if isinstance(reconciliation, dict):
                for raw in reconciliation.get("source_records", []) or []:
                    if isinstance(raw, dict):
                        merge_source(index, raw)

    # Exact official documents that close known source-record gaps. These are
    # sidecar proof sources only; the source registers and canonical files stay
    # untouched.
    merge_source(
        index,
        {
            "source_id": "AKC_NATIONAL_DOG_GROOMING_EDUCATIONAL_STANDARDS_PDF",
            "publisher": "American Kennel Club",
            "source_type": "national vocational education competency standard",
            "title": "National Core Professional Dog Grooming Educational Standards",
            "url": "https://www.akc.org/wp-content/uploads/2024/06/AKC-National-Core-Professional-Dog-Grooming-Educational-Standards.pdf",
            "access_date": "2026-10-06",
            "locator": "PDF pp. 1-2, 7-8: six educational domains and eight core standards, including pet safety/humane handling, sanitation, dog physical characteristics, and professional grooming practices.",
            "supported_claim": "Professional dog grooming is a defined technical learning practice with safety, humane handling, sanitation, anatomy/coat knowledge and grooming-method competencies.",
            "limitation": "U.S. dog-specific standards; they support the grooming-area boundary, not a global animal-care taxonomy, all-species grooming scope, or a universal D090 count.",
            "geographic_scope": "United States; comparative corroboration only",
        },
    )
    merge_source(
        index,
        {
            "source_id": "BCU_HOROLOGY_BA_COURSE_SPECIFICATION",
            "publisher": "Birmingham City University",
            "source_type": "official university course specification",
            "title": "BA (Hons) Horology Course Specification",
            "url": "https://bcuassets.blob.core.windows.net/docs/us0634-ba-hons-horology-v2-133071152451347876.pdf",
            "access_date": "2026-10-06",
            "locator": "PDF sections 7a and 11, pp. 1 and 7: Horology is the named BA award; learning outcomes cover horological practice, watch/clock servicing, component making, technical drawing and specialist manufacture/finishing/restoration.",
            "supported_claim": "Horology/clock-and-watchmaking is an explicitly named academic practice and learning route with its own technical, making, servicing and restoration content.",
            "limitation": "One UK university course; it proves an established route and boundary, not a universal taxonomy/count or global licensing equivalence.",
            "geographic_scope": "United Kingdom; comparative corroboration only",
        },
    )
    return index


# These are explicit evidence assignments for areas whose upstream register
# did not carry source IDs. They are provenance links, not keyword matches.
AREA_SOURCE_OVERRIDES: dict[tuple[str, str], list[str]] = {
    ("D058", "learning-experience-and-instructional-design"): ["HARVARD_LDIT_PROGRAM", "STANFORD_LDT_PROGRAM"],
    ("D058", "educational-technology-and-digital-learning-systems"): ["USF_MS_LDT_PROGRAM", "UNM_IDT_CONCENTRATION", "AECT_EDTECH_DEFINITION_2023"],
    ("D058", "learning-analytics-research-and-evaluation"): ["USF_MS_LDT_PROGRAM", "HARVARD_LDIT_PROGRAM"],
    ("D059", "spacecraft-and-payload-systems-engineering"): ["NASA_SMALLSAT_SPACECRAFT_SYSTEMS", "ESA_EARTH_OBSERVATION_SYSTEMS_DESIGN_TRAINING"],
    ("D059", "ground-systems-space-communications-and-mission-operations"): ["NASA_GROUND_DATA_MISSION_OPERATIONS", "ISO_21076_SPACE_COMMUNICATIONS_ARCHITECTURE", "ESA_EARTH_OBSERVATION_SYSTEMS_DESIGN_TRAINING"],
    ("D060", "retail-and-personal-banking"): ["ABA_RETAIL_BANKING_CERTIFICATES", "CBI_BANKING_QUALIFICATIONS"],
    ("D060", "business-and-commercial-banking"): ["ABA_COMMERCIAL_LENDING_CERTIFICATES", "CBI_BANKING_QUALIFICATIONS"],
    ("D060", "bank-treasury-and-financial-markets"): ["MONASH_BANK_TREASURY_UNIT_2023", "ABA_STONIER_BANKING_CURRICULUM"],
    ("D068", "rehabilitation-and-functional-health-services"): ["WHO_REHABILITATION_WORKFORCE", "WHO_REHABILITATION_COMPETENCY_FRAMEWORK"],
    ("D068", "biomedical-laboratory-diagnostics"): ["IFBLS_BIOMEDICAL_LAB_CORE_COMPETENCE"],
    ("D068", "medical-imaging-and-radiography"): ["IAEA_MEDICAL_RADIATION_TECHNOLOGIST_SCOPE"],
    ("D092", "culinary-production-and-kitchen-operations"): ["WORLDSKILLS_COOKING_WS_OS_2024"],
    ("D092", "baking-pastry-and-confectionery"): ["WORLDSKILLS_BAKERY_WS_OS_2024", "WORLDSKILLS_PATISSERIE_CONFECTIONERY_WS_OS_2024"],
    ("D092", "food-and-beverage-service"): ["WORLDSKILLS_RESTAURANT_SERVICE_WS_OS_2024"],
    ("D092", "catering-and-foodservice-operations-management"): ["PORTO_FOOD_SERVICE_MANAGEMENT_PROGRAMME", "UAB_CATERING_MANAGEMENT_CURRICULUM", "UPM_INSTITUTIONAL_FOOD_SERVICE_MANAGEMENT_CURRICULUM"],
    ("D093", "building-and-commercial-electrical-installation"): ["WORLDSKILLS_ELECTRICAL_INSTALLATIONS_WS_OS_2024", "SKILLS_ENGLAND_INSTALLATION_MAINTENANCE_ELECTRICIAN_ST0152"],
    ("D093", "electrical-power-networks-and-distribution"): ["CIGRE_TRANSMISSION_DISTRIBUTION_GLOBAL_STUDY_COMMITTEES", "SKILLS_ENGLAND_ELECTRICAL_POWER_NETWORK_ENGINEER_ST0475", "SKILLS_ENGLAND_POWER_DISTRIBUTION_CABLE_JOINTER_ST1332", "SKILLS_ENGLAND_POWER_OVERHEAD_LINESPERSON_ST1330"],
    ("D094", "electronic-hardware-design-assembly-and-embedded-systems"): ["WORLDSKILLS_ELECTRONICS_WS_OS_2024"],
    ("D094", "electronics-installation-testing-and-maintenance"): ["WORLDSKILLS_ELECTRONICS_WS_OS_2024"],
    ("D094", "ict-and-communications-equipment-servicing"): ["ESCO_ISCO_7422_ICT_INSTALLERS_SERVICERS", "ESCO_TELECOMMUNICATIONS_TECHNICIAN_TASKS"],
    ("D094", "smart-building-and-connected-systems-integration"): ["KNX_SMART_TECH_INSTALLER_SCOPE", "CEDIA_INTEGRATED_SYSTEMS_TECHNICIAN"],
    ("D095", "passenger-and-light-commercial-vehicle-service-and-repair"): ["WORLDSKILLS_AUTOMOBILE_TECHNOLOGY_WS_OS_2024", "ASE_AUTOMOTIVE_CERTIFICATION_TEST_SERIES"],
    ("D095", "heavy-vehicle-service-and-repair"): ["WORLDSKILLS_HEAVY_VEHICLE_TECHNOLOGY_WS_OS_2024", "ASE_AUTOMOTIVE_CERTIFICATION_TEST_SERIES"],
    ("D095", "vehicle-body-repair-and-refinishing"): ["WORLDSKILLS_AUTOBODY_REPAIR_WS_OS_2024", "WORLDSKILLS_CAR_PAINTING_WS_OS_2024", "ASE_AUTOMOTIVE_CERTIFICATION_TEST_SERIES"],
    ("D096", "agricultural-machinery-operation-and-mechanization-services"): ["FAO_FARM_MACHINERY_OPERATION_MAINTENANCE_REPAIR_MANUAL_2022", "FAO_MECHANIZATION_EQUIPMENT_HIRE_SERVICES", "FAO_OPERATION_MAINTENANCE_AGRICULTURAL_EQUIPMENT_COURSE"],
    ("D096", "agricultural-machinery-maintenance-and-repair"): ["FAO_FARM_MACHINERY_OPERATION_MAINTENANCE_REPAIR_MANUAL_2022", "FAO_OPERATION_MAINTENANCE_AGRICULTURAL_EQUIPMENT_COURSE"],
    ("D097", "welding-and-joining"): ["WORLDSKILLS_WELDING_WS_OS_2024", "IIW_INTERNATIONAL_WELDING_PERSONNEL_QUALIFICATIONS"],
    ("D097", "metal-fabrication-and-structural-assembly"): ["WORLDSKILLS_WELDING_WS_OS_2024", "IIW_ISO3834_WELDING_FABRICATION_QUALITY"],
    ("D097", "forging-and-blacksmithing"): ["SKILLS_ENGLAND_BLACKSMITH_ST0378", "AUSTRIA_BLACKSMITH_FORGING_APPRENTICESHIP", "ONTARIO_BLACKSMITH_TRADE_STANDARD"],
    ("D098", "precision-machining-and-toolmaking"): ["WSI_CNC_TURNING_2024", "WSI_CNC_MILLING_2024", "INDIA_DGT_TOOL_DIE_CURRICULUM_2024", "UK_TOOLMAKER_APPRENTICESHIP_STANDARD"],
    ("D098", "precision-instruments-and-optical-devices"): ["TSINGHUA_PRECISION_INSTRUMENT_EDUCATION", "TOKYO_PRECISION_ENGINEERING_CURRICULUM", "UK_SPECTACLE_MAKER_STANDARD"],
    ("D098", "dimensional-metrology-and-measurement-systems"): ["NIST_DIMENSIONAL_METROLOGY", "TOKYO_PRECISION_ENGINEERING_CURRICULUM", "TSINGHUA_PRECISION_INSTRUMENT_EDUCATION"],
    ("D098", "horology-clock-and-watchmaking"): ["BCU_HOROLOGY_BA_COURSE_SPECIFICATION"],
}


def slug(label: str) -> str:
    value = label.lower().replace("&", "and")
    value = "".join(ch if ch.isalnum() else "-" for ch in value)
    return "-".join(part for part in value.split("-") if part)


def area_source_ids(domain_id: str, area: dict[str, Any]) -> list[str]:
    override = AREA_SOURCE_OVERRIDES.get((domain_id, slug(text(area.get("label")))))
    if override:
        return override
    ids = area.get("source_ids") or []
    return [text(value) for value in ids if text(value)]


def source_proof(source: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_id": source["source_id"],
        "publisher": source["publisher"],
        "source_type": source["source_type"],
        "title": source["title"],
        "url": source["url"],
        "access_date": source["access_date"],
        "locator": source["locator"],
        "supported_claim": source["supported_claim"],
        "limitation": source["limitation"],
        "geographic_scope": source["geographic_scope"],
    }


def make_area_record(domain: dict[str, Any], area: dict[str, Any], source_index: dict[str, dict[str, Any]]) -> dict[str, Any]:
    domain_id = text(domain["domain_id"])
    area_key = text(area.get("key")) or slug(text(area.get("label")))
    ids = area_source_ids(domain_id, area)
    resolved = [source_index[source_id] for source_id in ids if source_id in source_index]
    missing = [source_id for source_id in ids if source_id not in source_index]
    complete = [source for source in resolved if source_quality(source) >= 6]
    label = text(area.get("label"))
    special_not_separate = "not a separate area" in label.lower()
    if special_not_separate:
        disposition = "cross_cutting_subarea_not_separate_specialization"
    elif missing or len(complete) == 0:
        disposition = "direct_fit_evidence_gap"
    else:
        disposition = "direct_fit_supported_internal_synthesis"
    direct_claim = text(area.get("source_support_claim")) or text(area.get("why_in_set"))
    if not direct_claim:
        direct_claim = (
            "The cited source records establish the bounded practice or learning route described below; "
            "the area count remains an internal synthesis rather than a universal taxonomy."
        )
    return {
        "domain_id": domain_id,
        "domain_name": text(domain["domain_name"]),
        "area_key": area_key,
        "area_label": label,
        "area_boundary": text(area.get("boundary")) or text(area.get("plain_language_scope")) or text(area.get("description")),
        "direct_fit_claim": direct_claim,
        "source_ids_used": ids,
        "source_ids_missing": missing,
        "source_records": [source_proof(source) for source in resolved],
        "disposition": disposition,
        "disposition_explanation": (
            "At least one complete source record directly supports the bounded practice/learning claim; "
            "the record is an internal, source-backed recommendation and not a universal taxonomy or accreditation decision."
            if disposition == "direct_fit_supported_internal_synthesis"
            else "The upstream recommendation identifies this area, but the current source record set does not yet provide complete direct-fit metadata for every assigned source."
            if disposition == "direct_fit_evidence_gap"
            else "The upstream record explicitly retains this item as a cross-cutting process/topic rather than a separate student-facing specialization."
        ),
        "proof_guard": {
            "role_titles_used_as_area_fit_evidence": False,
            "isco_membership_used_as_area_fit_evidence": False,
            "role_counts_used_as_area_fit_evidence": False,
            "keywords_used_as_area_fit_evidence": False,
            "nigerian_context_used": False,
            "canonical_taxonomy_edited": False,
        },
    }


def get_domains() -> list[dict[str, Any]]:
    global_rows = load_json(GLOBAL_REGISTER)["domains"]
    return [
        row
        for row in global_rows
        if 57 <= int(text(row["domain_id"])[1:]) <= 112
    ]


def get_areas(domain: dict[str, Any]) -> list[dict[str, Any]]:
    recommended = domain.get("recommended_areas", [])
    if isinstance(recommended, dict):
        return [area for area in recommended.get("areas", []) if isinstance(area, dict)]
    return [area for area in recommended if isinstance(area, dict)]


def build_batch(batch_name: str, ids: list[int], domains: list[dict[str, Any]], source_index: dict[str, dict[str, Any]]) -> dict[str, Any]:
    selected = [domain for domain in domains if int(text(domain["domain_id"])[1:]) in ids]
    records: list[dict[str, Any]] = []
    domain_summaries: list[dict[str, Any]] = []
    for domain in selected:
        areas = get_areas(domain)
        domain_records = [make_area_record(domain, area, source_index) for area in areas]
        records.extend(domain_records)
        domain_summaries.append(
            {
                "domain_id": domain["domain_id"],
                "domain_name": domain["domain_name"],
                "areas": [record["area_label"] for record in domain_records],
                "area_count": len(domain_records),
                "source_record_count": len({source["source_id"] for record in domain_records for source in record["source_records"]}),
                "evidence_gap_area_count": sum(record["disposition"] == "direct_fit_evidence_gap" for record in domain_records),
            }
        )
    source_records = {
        source["source_id"]: source
        for record in records
        for source in record["source_records"]
    }
    return {
        "schema_version": SCHEMA_VERSION,
        "artifact": "direct_area_fit_proof_batch",
        "created_on": "2026-10-06",
        "batch": batch_name,
        "domain_id_range": [f"D{ids[0]:03d}", f"D{ids[-1]:03d}"],
        "domains_covered": domain_summaries,
        "area_proof_records": records,
        "source_records": list(source_records.values()),
        "coverage": {
            "domain_count": len(domain_summaries),
            "area_proof_record_count": len(records),
            "source_record_count": len(source_records),
            "complete_direct_fit_count": sum(record["disposition"] == "direct_fit_supported_internal_synthesis" for record in records),
            "cross_cutting_not_separate_count": sum(record["disposition"] == "cross_cutting_subarea_not_separate_specialization" for record in records),
            "evidence_gap_count": sum(record["disposition"] == "direct_fit_evidence_gap" for record in records),
        },
        "scope_guards": {
            "uses_finalized_global_step1_register": True,
            "direct_area_fit_only": True,
            "no_role_audit_or_assignments": True,
            "no_canonical_taxonomy_edits": True,
            "no_nigerian_context": True,
            "source_count_does_not_mean_universal_taxonomy": True,
        },
    }


def markdown(batch: dict[str, Any]) -> str:
    c = batch["coverage"]
    lines = [
        f"# Direct area-of-specialization fit proof — {batch['batch']}",
        "",
        "Date: 2026-10-06.",
        "",
        "This checkpoint records direct practice/learning-area evidence for the finalized global Step 1 recommendations. It does not claim that any source prescribes Sifter's exact area count, and it does not audit roles, edit canonical taxonomy, or add Nigerian context.",
        "",
        "## Exact coverage",
        "",
        f"- Domains: **{c['domain_count']}**",
        f"- Recommended-area proof records: **{c['area_proof_record_count']}**",
        f"- Unique source records: **{c['source_record_count']}**",
        f"- Direct-fit-supported internal recommendations: **{c['complete_direct_fit_count']}**",
        f"- Explicit cross-cutting/not-separate items: **{c['cross_cutting_not_separate_count']}**",
        f"- Evidence gaps: **{c['evidence_gap_count']}**",
        "",
        "## Domains and areas",
        "",
        "| Domain | Areas covered | Sources | Gaps |",
        "|---|---|---:|---:|",
    ]
    for domain in batch["domains_covered"]:
        areas = "; ".join(domain["areas"]) or "No recommended area; parent-scope/no-specialization disposition is recorded upstream."
        lines.append(f"| {domain['domain_id']} {domain['domain_name']} | {areas} | {domain['source_record_count']} | {domain['evidence_gap_area_count']} |")
    lines += [
        "",
        "## Proof-record standard",
        "",
        "Every area record carries its bounded claim and the exact source URL, title, page/section or equivalent locator, source-supported claim and limitation. Sources are evidence for the stated practice/learning boundary only; they are not used to infer role fit, ISCO membership, role counts, a universal taxonomy, or Nigerian demand.",
        "",
        "## Provenance",
        "",
        "- Input: finalized global Step 1 register for D057–D112 and lane-owned source records.",
        "- Output boundary: this batch directory only.",
        "- Canonical taxonomy, subgroup scripts/reports, role mappings and Nigerian-context files were not edited.",
    ]
    return "\n".join(lines) + "\n"


def write_batch(batch_name: str, ids: list[int], domains: list[dict[str, Any]], source_index: dict[str, dict[str, Any]]) -> tuple[Path, Path]:
    batch = build_batch(batch_name, ids, domains, source_index)
    json_path = HERE / f"{batch_name}.json"
    md_path = HERE / f"{batch_name}.md"
    json_path.write_text(json.dumps(batch, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(markdown(batch), encoding="utf-8")
    return json_path, md_path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only-batch", choices=list(BATCHES))
    parser.add_argument("--from-batch", choices=list(BATCHES))
    args = parser.parse_args()
    HERE.mkdir(parents=True, exist_ok=True)
    domains = get_domains()
    source_index = collect_source_index()
    chosen = list(BATCHES)
    if args.only_batch:
        chosen = [args.only_batch]
    elif args.from_batch:
        chosen = chosen[chosen.index(args.from_batch) :]
    outputs = []
    for batch_name in chosen:
        outputs.append(write_batch(batch_name, BATCHES[batch_name], domains, source_index))
    print(json.dumps({"batches_written": [str(p[0]) for p in outputs], "source_index_count": len(source_index)}, indent=2))


if __name__ == "__main__":
    main()
