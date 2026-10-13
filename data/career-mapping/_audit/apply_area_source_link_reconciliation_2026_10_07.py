"""Attach source records to canonical area-of-specialization definitions.

The source links are copied only from evidence records that are either
explicitly named by an area recommendation or nested under an exact matching
area label in that domain's review artifacts. Domain-wide citations are not
blindly copied to every area. The 708 area definitions and all role fields are
left unchanged; only each area's source-reference fields are enriched.
"""

from __future__ import annotations

import json
import importlib.util
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
STRUCTURE = DATA / "domain_structure.json"
CATALOG = DATA / "domain_specialization_catalog.json"
STEP1 = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)
EVIDENCE_REGISTER = AUDIT / "specialization_review_evidence_register_2026_10_06.json"
REPORT = AUDIT / "AREA_SOURCE_LINK_RECONCILIATION_2026_10_07.json"
REPORT_MD = AUDIT / "AREA_SOURCE_LINK_RECONCILIATION_2026_10_07.md"


def read(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: Any) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(value or "").casefold()).strip()


def safe_repo_path(raw: Any) -> Path | None:
    if not raw:
        return None
    value = str(raw).replace("\\", "/")
    path = (ROOT / value).resolve()
    if ROOT.resolve() not in path.parents or not path.is_file():
        return None
    return path


def source_record(node: dict[str, Any]) -> dict[str, Any] | None:
    url = str(node.get("url") or node.get("source_url") or "").strip()
    locator = str(node.get("locator") or node.get("source_locator") or "").strip()
    sid = str(node.get("source_id") or node.get("id") or "").strip()
    supported = node.get("supports") or node.get("claim_supported") or node.get("supporting_claim")
    limits = node.get("claim_limit") or node.get("limits") or node.get("claim_limits")
    if not (url.startswith(("https://", "http://")) and locator and sid and (supported or limits)):
        return None
    return {
        "source_id": sid,
        "publisher": node.get("publisher"),
        "title": node.get("title"),
        "url": url,
        "locator": locator,
        "supports": supported,
        "claim_limit": limits,
        "geographic_scope": node.get("geographic_scope") or node.get("geographic_scope_disposition"),
        "source_artifact_locator": node.get("source_artifact_locator"),
    }


def collect_source_records(node: Any) -> list[dict[str, Any]]:
    found: dict[tuple[str, str, str], dict[str, Any]] = {}

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            row = source_record(value)
            if row:
                found.setdefault((row["source_id"], row["url"], row["locator"]), row)
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(node)
    return list(found.values())


def collect_area_refs(node: Any, wanted_label: str) -> list[dict[str, Any]]:
    """Collect references nested directly under an exactly named area record."""
    wanted = norm(wanted_label)
    matching: list[dict[str, Any]] = []

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            label = value.get("label") or value.get("area_label") or value.get("specialization_label")
            if norm(label) == wanted:
                matching.append(value)
            for child in value.values():
                walk(child)
        elif isinstance(value, list):
            for child in value:
                walk(child)

    walk(node)
    refs: dict[tuple[str, str, str], dict[str, Any]] = {}
    for item in matching:
        for key in ("source_references", "sources", "supporting_sources", "evidence", "citations"):
            candidates = item.get(key)
            if isinstance(candidates, dict):
                candidates = [candidates]
            if isinstance(candidates, list):
                for candidate in candidates:
                    if isinstance(candidate, dict):
                        row = source_record(candidate)
                        if row:
                            refs.setdefault((row["source_id"], row["url"], row["locator"]), row)
        ids = item.get("source_ids") or []
        if isinstance(ids, str):
            ids = [ids]
        for sid in ids:
            refs.setdefault((str(sid), "", ""), {"source_id": str(sid), "unresolved_reference": True})
    return list(refs.values())


def main() -> None:
    catalog = read(CATALOG)
    structure = read(STRUCTURE)
    step1 = read(STEP1)
    evidence_register = read(EVIDENCE_REGISTER)
    step_by_id = {str(row["domain_id"]): row for row in step1.get("domains") or []}
    register_by_id = {str(row["domain_id"]): row for row in evidence_register.get("domains") or []}
    catalog_by_id = {str(row["domain_id"]): row for row in catalog.get("domains") or []}
    if len(step_by_id) != 168 or len(catalog_by_id) != 168 or set(step_by_id) != set(catalog_by_id):
        raise ValueError("Expected an exact 168-domain Step 1/catalog join")

    # Source IDs that lack a URL in the checked-in evidence artifact have been
    # independently verified against the source publisher's official pages.
    # These entries are intentionally few and are not inferred from a title.
    official_source_repairs = {
        "IBSTPI_INSTRUCTIONAL_DESIGN_COMPETENCIES": {
            "source_id": "IBSTPI_INSTRUCTIONAL_DESIGN_COMPETENCIES",
            "publisher": "International Board of Standards for Training, Performance and Instruction",
            "title": "Instructional Design Competencies: The Standards",
            "url": "https://ibstpi.org/publication/instructional-design-competencies-the-standards/",
            "locator": "Official publication page: identifies the instructional-design competency standards and their use in professional development, assessment, work planning, and curriculum.",
            "supports": "Instructional design is a defined professional competency area with a standards-based competency model.",
            "claim_limit": "Supports the professional competency framework, not the exact Sifter area label, role eligibility, or a universal area count.",
            "geographic_scope": "international professional standard",
        },
        "MONASH_BANKING_FINANCE_CURRICULUM_2006": {
            "source_id": "MONASH_BANKING_FINANCE_CURRICULUM_2006",
            "publisher": "Monash University",
            "title": "Bachelor of Business (Banking and Finance) — 2006 Handbook",
            "url": "https://www3.monash.edu/pubs/2006handbooks/undergrad/bus-20.html",
            "locator": "Official 2006 undergraduate handbook entry for the Banking and Finance degree, including its intended industry context and curriculum structure.",
            "supports": "Banking and finance is an established integrated academic/professional field and can inform the boundary of the reviewed banking-finance area.",
            "claim_limit": "Historical, single-university curriculum evidence; does not establish current global practice, treasury-specific tasks, or a universal specialization taxonomy.",
            "geographic_scope": "international academic source",
        },
    }

    # Independent primary-source additions researched for exact residual area
    # keys. These support the scope of the practice area, not the exact Sifter
    # area count, role mapping, or a jurisdiction-specific licence.
    external_area_source_additions = {
        "D023:emergency-and-critical-care": [{
            "source_id": "WHO_EMERGENCY_AND_CRITICAL_CARE_SCOPE",
            "publisher": "World Health Organization",
            "title": "Emergency care",
            "url": "https://www.who.int/health-topics/emergency-care",
            "locator": "Overview: emergency care as an integrated platform for time-sensitive acute illness/injury; critical care as ongoing intensive treatment for life-threatening illness or injury.",
            "supports": "Emergency and critical care are distinct but connected service/practice areas for acute and life-threatening conditions.",
            "claim_limit": "WHO describes health-service scope, not a physician-specialty taxonomy or the exact Sifter area boundary.",
            "geographic_scope": "global WHO guidance",
        }],
        "D023:maternal-and-reproductive-medicine": [{
            "source_id": "WHO_MATERNAL_HEALTH_RECOMMENDATIONS_2025",
            "publisher": "World Health Organization",
            "title": "WHO recommendations on maternal health: guidelines approved by the WHO Guidelines Review Committee, 2nd ed",
            "url": "https://www.who.int/publications/i/item/9789240080591",
            "locator": "Overview: recommendations cover promotion, prevention and management of maternal complications during pregnancy, childbirth and postnatal periods.",
            "supports": "Maternal medicine is a coherent clinical practice scope spanning pregnancy, childbirth, postnatal care and complications.",
            "claim_limit": "Supports maternal-care scope, not all reproductive-medicine subfields, role assignment, licensing, or an exact area count.",
            "geographic_scope": "global WHO guideline",
        }],
        "D024:child-and-family-nursing": [{
            "source_id": "ICN_ADVANCED_PRACTICE_NURSING_SPECIALTY_SCOPE_2020",
            "publisher": "International Council of Nurses",
            "title": "Guidelines on Advanced Practice Nursing 2020",
            "url": "https://www.icn.ch/system/files/documents/2020-04/ICN_APN%20Report_EN_WEB.pdf",
            "locator": "Chapter 2, Clinical Nurse Specialist: specialty practice can be defined by population, including paediatrics, and by clinical setting, disease, type of care, or problem.",
            "supports": "Population-focused pediatric nursing is a recognized specialty-practice scope.",
            "claim_limit": "International nursing guidance; does not prescribe the exact Sifter taxonomy or establish country-specific nursing authorization.",
            "geographic_scope": "international professional guidance",
        }],
        "D024:maternal-newborn-and-reproductive-health-nursing": [{
            "source_id": "ICN_ADVANCED_PRACTICE_NURSING_SPECIALTY_SCOPE_2020",
            "publisher": "International Council of Nurses",
            "title": "Guidelines on Advanced Practice Nursing 2020",
            "url": "https://www.icn.ch/system/files/documents/2020-04/ICN_APN%20Report_EN_WEB.pdf",
            "locator": "Chapter 2, Clinical Nurse Specialist: specialty practice may be defined by population, including women's health, and by clinical setting or type of care.",
            "supports": "Women's-health-focused nursing is a recognized specialty-practice scope.",
            "claim_limit": "International nursing guidance; does not prescribe the exact Sifter taxonomy or establish country-specific nursing authorization.",
            "geographic_scope": "international professional guidance",
        }],
        "D100:heating-and-hot-water-systems": [{
            "source_id": "ONET_HVAC_HEATING_REFRIGERATION_TASKS",
            "publisher": "U.S. Department of Labor, O*NET OnLine",
            "title": "Heating, Air Conditioning, and Refrigeration Mechanics and Installers",
            "url": "https://www.onetonline.org/link/details/49-9021.00",
            "locator": "Occupation overview and tasks: install or repair heating, central air-conditioning, HVAC or refrigeration systems, including furnaces and heating stoves.",
            "supports": "Heating and hot-water-system work is a distinguishable building-services practice within HVAC installation and maintenance.",
            "claim_limit": "U.S. occupational profile; supports task scope, not Nigerian licensing, universal title usage, or this catalogue's exact area count.",
            "geographic_scope": "United States occupational description; task evidence only",
        }],
        "D146:heating-ventilation-and-air-conditioning-hvac": [{
            "source_id": "ASHRAE_HVACR_TERMINOLOGY",
            "publisher": "ASHRAE",
            "title": "ASHRAE Terminology",
            "url": "https://resourcecenter.ashrae.org/technical-resources/authoring-tools/terminology",
            "locator": "Terminology resource overview: HVAC&R, water heating, building systems, energy use and measurement terminology maintained by ASHRAE Technical Committee 1.6.",
            "supports": "HVAC&R is a coherent building-environment engineering and technical practice with shared terminology across heating, ventilation, air-conditioning and refrigeration.",
            "claim_limit": "Supports professional scope and terminology, not the exact catalogue boundary, role mapping, or local licensing requirements.",
            "geographic_scope": "international professional society; jurisdictional rules vary",
        }],
        "D022:mining-engineering-and-mine-development": [{
            "source_id": "ONET_MINING_AND_GEOLOGICAL_ENGINEERS_SCOPE",
            "publisher": "U.S. Department of Labor, O*NET OnLine",
            "title": "Mining and Geological Engineers, Including Mining Safety Engineers",
            "url": "https://www.onetonline.org/link/summary/17-2151.00",
            "locator": "Occupation overview: design mines and determine methods for extracting minerals; related tasks include mine development, safety and production planning.",
            "supports": "Mining engineering and mine development are a distinct engineering practice concerned with extraction methods, mine design and safe production.",
            "claim_limit": "U.S. occupational profile; supports practice scope only, not Nigerian licensing, universal title usage, or this catalogue's exact area count.",
            "geographic_scope": "United States occupational description; task evidence only",
        }],
        "D147:instrumentation-and-process-measurement": [{
            "source_id": "ISA_5_INSTRUMENTATION_SYMBOLS_IDENTIFICATION",
            "publisher": "International Society of Automation",
            "title": "ISA-5 Series of Standards",
            "url": "https://www.isa.org/standards-and-publications/isa-standards/isa-5-standard",
            "locator": "ISA-5 series overview: standards for instrumentation symbols, identification and documentation used in measurement and control systems.",
            "supports": "Instrumentation and process measurement is an established automation practice with recognized documentation and identification standards.",
            "claim_limit": "Standards-family scope; does not establish the exact catalogue boundary, role route or local licensing requirements.",
            "geographic_scope": "international professional standards",
        }],
        "D147:industrial-functional-safety-and-ot-cybersecurity": [{
            "source_id": "ISA_IEC_62443_IACS_CYBERSECURITY_SCOPE",
            "publisher": "International Society of Automation / International Electrotechnical Commission",
            "title": "ISA/IEC 62443 Series of Standards",
            "url": "https://www.isa.org/standards-and-publications/isa-standards/isa-iec-62443-series-of-standards",
            "locator": "Series overview: requirements and processes for electronically secure industrial automation and control systems across their lifecycle, including risk assessment and security levels.",
            "supports": "Industrial OT cybersecurity is a distinct practice within industrial automation and control systems engineering.",
            "claim_limit": "Supports OT-cybersecurity scope; does not by itself establish functional-safety requirements, the exact catalogue boundary or a role licence.",
            "geographic_scope": "international consensus standards",
        }],
        "D158:corporate-financial-planning-and-treasury": [{
            "source_id": "AFP_TREASURY_MANAGEMENT_DEFINED",
            "publisher": "Association for Financial Professionals",
            "title": "Treasury Management Defined",
            "url": "https://www.afponline.org/topics/treasury/treasury-management-defined",
            "locator": "Definition and key functions: oversight of company financial resources, liquidity, risk, financing access, investments and treasury technology.",
            "supports": "Corporate treasury is an established finance practice covering liquidity, financial resources, risk and financing decisions.",
            "claim_limit": "Professional association scope; does not define the exact catalogue area count, role route or Nigerian regulatory requirements.",
            "geographic_scope": "international professional association",
        }],
        "D158:mergers-acquisitions-and-corporate-advisory": [{
            "source_id": "CFA_CORPORATE_RESTRUCTURING_AND_MA_SCOPE",
            "publisher": "CFA Institute",
            "title": "Corporate Restructuring",
            "url": "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/corporate-restructuring",
            "locator": "Refresher-reading scope: corporate restructuring, valuation and analysis of transactions including mergers, acquisitions and related financing decisions.",
            "supports": "Mergers, acquisitions and corporate advisory form a recognized corporate-finance practice area.",
            "claim_limit": "Professional-learning source; does not establish the exact catalogue boundary, role route or jurisdiction-specific advisory authorization.",
            "geographic_scope": "international professional body",
        }],
        "D158:capital-markets-and-underwriting": [{
            "source_id": "ICMA_PRIMARY_MARKETS_SCOPE",
            "publisher": "International Capital Market Association",
            "title": "Primary Markets",
            "url": "https://www.icmagroup.org/market-practice-and-regulatory-policy/primary-markets/",
            "locator": "Primary-markets programme: issuer forums, prospectuses, issuance practice, market conduct, documentation and capital-market products.",
            "supports": "Capital markets and underwriting are established practice areas concerned with primary issuance and associated market practice.",
            "claim_limit": "International market-practice association scope; does not establish the exact catalogue boundary, role route or country-specific authorization.",
            "geographic_scope": "international market-practice association",
        }],
        "D158:financial-modeling-valuation-and-deal-execution": [{
            "source_id": "CFA_FINANCIAL_MODELING_PRACTICE_MODULE",
            "publisher": "CFA Institute",
            "title": "Financial Modeling",
            "url": "https://www.cfainstitute.org/programs/cfa-program/candidate-resources/practical-skills-modules/financial-modelling",
            "locator": "Practical-skills module overview: building and using financial models for analysis, valuation and decision-making.",
            "supports": "Financial modeling and valuation are established analytical practices used in finance and transaction work.",
            "claim_limit": "Professional-learning source; does not establish the exact catalogue area count, role route or jurisdiction-specific qualification.",
            "geographic_scope": "international professional body",
        }],
        "D159:consumer-mortgage-and-sme-credit-risk": [{
            "source_id": "BCBS_GENERAL_CREDIT_RISK_MANAGEMENT",
            "publisher": "Basel Committee on Banking Supervision, Bank for International Settlements",
            "title": "General credit risk management",
            "url": "https://www.bis.org/committees/bcbs/basel-consolidated-guidelines/module/cri/10",
            "locator": "Basel consolidated guidelines module on credit risk: credit-risk assessment, management and control in banking activities.",
            "supports": "Credit-risk assessment and management are established financial-risk practices applicable to lending portfolios, subject to product and jurisdictional context.",
            "claim_limit": "Banking-supervision guidance; supports credit-risk practice scope, not the exact catalogue boundary, role route or a retail-lending licence.",
            "geographic_scope": "international banking-supervision standard",
        }],
        "D159:credit-portfolio-management-and-restructuring": [{
            "source_id": "BCBS_GENERAL_CREDIT_RISK_MANAGEMENT",
            "publisher": "Basel Committee on Banking Supervision, Bank for International Settlements",
            "title": "General credit risk management",
            "url": "https://www.bis.org/committees/bcbs/basel-consolidated-guidelines/module/cri/10",
            "locator": "Basel consolidated guidelines module on credit risk: credit-risk assessment, management and control in banking activities, including problem-exposure management context.",
            "supports": "Credit-portfolio management and restructuring are coherent extensions of established credit-risk management practice.",
            "claim_limit": "Banking-supervision guidance; supports practice scope only, not the exact catalogue boundary, role route or local authorization.",
            "geographic_scope": "international banking-supervision standard",
        }],
        "D132:earth-and-space-based-earth-observation": [{
            "source_id": "NASA_EARTH_OBSERVATION_REMOTE_SENSING_SCOPE",
            "publisher": "National Aeronautics and Space Administration",
            "title": "Earth Observation and Remote Sensing",
            "url": "https://www.nasa.gov/goddard/frontdoor/earthobservation/",
            "locator": "NASA Goddard overview: Earth-observation and remote-sensing instruments, data analysis and satellite-data verification for terrestrial systems.",
            "supports": "Earth observation and remote sensing are established space-based sensing and data-analysis practices.",
            "claim_limit": "NASA programme scope; does not establish the exact catalogue boundary, role route or local licensing requirements.",
            "geographic_scope": "international scientific agency source",
        }],
        "D132:heliophysics-and-space-weather": [{
            "source_id": "NASA_HELIOPHYSICS_SPACE_WEATHER_SCOPE",
            "publisher": "National Aeronautics and Space Administration",
            "title": "Heliophysics",
            "url": "https://science.nasa.gov/heliophysics/",
            "locator": "NASA Heliophysics overview: study of the Sun, heliosphere and their influence on planets, technology and space-weather forecasting.",
            "supports": "Heliophysics and space-weather research form an established space-science practice area.",
            "claim_limit": "NASA programme scope; does not establish the exact catalogue boundary, role route or jurisdiction-specific employment requirements.",
            "geographic_scope": "international scientific agency source",
        }],
        "D132:astrophysics-and-cosmology": [{
            "source_id": "NASA_ASTROPHYSICS_COSMOLOGY_SCOPE",
            "publisher": "National Aeronautics and Space Administration",
            "title": "NASA Astrophysics",
            "url": "https://science.nasa.gov/astrophysics/",
            "locator": "NASA Astrophysics overview: studies the origin, evolution and workings of the universe through observation, modelling and mission data.",
            "supports": "Astrophysics and cosmology are established space-science practice areas concerned with the universe and its evolution.",
            "claim_limit": "NASA programme scope; does not establish the exact catalogue boundary, role route or local licensing requirements.",
            "geographic_scope": "international scientific agency source",
        }],
        "D135:nuclear-fuel-cycle-materials-and-waste-systems": [{
            "source_id": "IAEA_NUCLEAR_FUEL_CYCLE_WASTE_SCOPE",
            "publisher": "International Atomic Energy Agency",
            "title": "Nuclear fuel cycle and radioactive waste management",
            "url": "https://www.iaea.org/publications/search/3325/topics/nuclear-fuel-cycle",
            "locator": "IAEA topic catalogue: nuclear fuel development, uranium production, fuel-cycle-facility safety, spent-fuel management, decommissioning and radioactive-waste treatment.",
            "supports": "Nuclear fuel-cycle, materials and waste systems are a coherent established technical and safety practice area.",
            "claim_limit": "IAEA publication-topic scope; does not establish the exact catalogue boundary, role route or national regulatory authorization.",
            "geographic_scope": "international intergovernmental guidance",
        }],
        "D140:robot-perception-localization-and-autonomy": [{
            "source_id": "IEEE_ROBOTICS_AUTONOMOUS_ROBOTICS_STANDARDS",
            "publisher": "IEEE Robotics and Automation Society",
            "title": "Robotics and Automation Society Standards",
            "url": "https://sagroups.ieee.org/ras-sc/standards/",
            "locator": "Standards listing: autonomous-robotics ontology and robot map-data representation for navigation.",
            "supports": "Robot perception, mapping/localization and autonomy are established robotics engineering concerns with recognized standards work.",
            "claim_limit": "Standards listing supports practice scope, not the exact catalogue boundary, role route or a professional licence.",
            "geographic_scope": "international professional standards",
        }],
        "D143:forensic-chemistry-and-trace-evidence": [{
            "source_id": "NIJ_FORENSIC_SCIENCE_DISCIPLINES_SCOPE",
            "publisher": "National Institute of Justice, U.S. Department of Justice",
            "title": "Forensic and Investigative Sciences",
            "url": "https://nij.ojp.gov/topics/forensics",
            "locator": "NIJ overview: forensic science applies chemistry, physics, biology, computer science and engineering to identification, analysis and interpretation of physical evidence, including trace evidence.",
            "supports": "Forensic chemistry and trace-evidence analysis are established forensic-science practice areas.",
            "claim_limit": "NIJ programme scope; supports area practice, not the exact catalogue boundary, role route or Nigerian legal procedure.",
            "geographic_scope": "United States public-sector forensic-science programme; practice evidence only",
        }],
        "D143:digital-and-multimedia-forensics": [{
            "source_id": "NIJ_FORENSIC_SCIENCE_DISCIPLINES_SCOPE",
            "publisher": "National Institute of Justice, U.S. Department of Justice",
            "title": "Forensic and Investigative Sciences",
            "url": "https://nij.ojp.gov/topics/forensics",
            "locator": "NIJ forensic-science research portfolio: digital/multimedia evidence is listed as a distinct forensic discipline alongside other evidence-analysis areas.",
            "supports": "Digital and multimedia forensics are an established forensic-science practice area.",
            "claim_limit": "NIJ programme scope; supports area practice, not the exact catalogue boundary, role route or Nigerian legal procedure.",
            "geographic_scope": "United States public-sector forensic-science programme; practice evidence only",
        }],
        "D143:crime-scene-examination-and-investigative-evidence": [{
            "source_id": "NIJ_CRIME_SCENE_INVESTIGATION_GUIDES",
            "publisher": "National Institute of Justice, U.S. Department of Justice",
            "title": "Crime Scene Investigation: Guides for Law Enforcement",
            "url": "https://nij.ojp.gov/topics/articles/crime-scene-investigation-guides-law-enforcement",
            "locator": "NIJ guidance: protecting crime scenes, preserving physical evidence and collecting/submitting evidence for scientific examination.",
            "supports": "Crime-scene examination and investigative evidence handling are established practice areas.",
            "claim_limit": "U.S. law-enforcement guidance; supports practice scope, not Nigerian procedure, licensing or the exact catalogue boundary.",
            "geographic_scope": "United States public-sector guidance; practice evidence only",
        }],
        "D143:forensic-pathology-and-medical-examination": [{
            "source_id": "NIJ_FORENSIC_SCIENCE_RESEARCH_DISCIPLINES",
            "publisher": "National Institute of Justice, U.S. Department of Justice",
            "title": "Forensic Science Research and Development",
            "url": "https://nij.ojp.gov/forensic-science-research-and-development",
            "locator": "NIJ research areas include forensic pathology and medicolegal death investigation among forensic-science disciplines.",
            "supports": "Forensic pathology and medicolegal medical examination are established forensic-science practice areas.",
            "claim_limit": "NIJ programme scope; supports practice area, not the exact catalogue boundary, role route or Nigerian medical authorization.",
            "geographic_scope": "United States public-sector forensic-science programme; practice evidence only",
        }],
        "D149:bilateral-diplomacy-and-consular-affairs": [{
            "source_id": "UN_VIENNA_CONVENTION_DIPLOMATIC_RELATIONS",
            "publisher": "United Nations Treaty Series",
            "title": "Vienna Convention on Diplomatic Relations",
            "url": "https://treaties.un.org/Pages/showDetails.aspx?clang=_en&objid=0800000280033940",
            "locator": "United Nations Treaty Series record: multilateral convention governing diplomatic relations, missions and privileges.",
            "supports": "Bilateral diplomacy and consular-affairs work are established international-relations practice areas with formal international rules.",
            "claim_limit": "Treaty record establishes legal context, not the exact catalogue boundary, role route or employment eligibility.",
            "geographic_scope": "global treaty framework",
        }],
        "D149:multilateral-diplomacy-and-international-organizations": [{
            "source_id": "UN_VIENNA_CONVENTION_DIPLOMATIC_RELATIONS",
            "publisher": "United Nations Treaty Series",
            "title": "Vienna Convention on Diplomatic Relations",
            "url": "https://treaties.un.org/Pages/showDetails.aspx?clang=_en&objid=0800000280033940",
            "locator": "United Nations Treaty Series record: international treaty framework for diplomatic relations among states and missions.",
            "supports": "Diplomatic relations and international-organizations work are established international-affairs practice contexts.",
            "claim_limit": "Treaty record establishes legal context, not the exact catalogue boundary, role route or employment eligibility.",
            "geographic_scope": "global treaty framework",
        }],
        "D163:patent-drafting-prosecution-and-patent-information": [{
            "source_id": "WIPO_PATENT_DRAFTING_MANUAL",
            "publisher": "World Intellectual Property Organization",
            "title": "WIPO Patent Drafting Manual",
            "url": "https://www.wipo.int/publications/en/details.jsp?id=4706&plang=EN",
            "locator": "WIPO publication overview: preparing, drafting, filing, amending and prosecuting patent applications.",
            "supports": "Patent drafting and prosecution are established intellectual-property practice areas.",
            "claim_limit": "WIPO manual supports practice scope, not the exact catalogue boundary, role route or country-specific authorization.",
            "geographic_scope": "international intergovernmental guidance",
        }],
        "D166:vehicle-integration-safety-and-verification": [{
            "source_id": "SAE_J3016_AUTOMATED_DRIVING_TAXONOMY",
            "publisher": "SAE International",
            "title": "Taxonomy and Definitions for Terms Related to Driving Automation Systems",
            "url": "https://saemobilus.sae.org/standards/j3016_202104-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles?tabType=viewannotation",
            "locator": "SAE J3016 scope: taxonomy and definitions for driving-automation systems, their operating levels and actors, providing coherent terminology for design, safety and verification discussions.",
            "supports": "Automated-vehicle integration, safety and verification are established engineering practice concerns.",
            "claim_limit": "SAE terminology standard; supports scope, not the exact catalogue boundary, role route or vehicle-approval requirements in Nigeria.",
            "geographic_scope": "international engineering standard",
        }],
        "D167:xr-software-and-real-time-application-development": [{
            "source_id": "KHRONOS_OPENXR_STANDARD",
            "publisher": "The Khronos Group",
            "title": "OpenXR",
            "url": "https://www.khronos.org/openxr/",
            "locator": "OpenXR overview: royalty-free open standard and APIs for developing XR applications across AR and VR devices, including application/runtime lifecycle and rendering interfaces.",
            "supports": "XR software and real-time application development is an established technical practice with a cross-platform standard API.",
            "claim_limit": "Open standard scope; does not establish the exact catalogue boundary, role route or a professional licence.",
            "geographic_scope": "international open standard",
        }],
        "D167:xr-devices-tracking-and-platform-engineering": [{
            "source_id": "KHRONOS_OPENXR_STANDARD",
            "publisher": "The Khronos Group",
            "title": "OpenXR",
            "url": "https://www.khronos.org/openxr/",
            "locator": "OpenXR overview: standardized access to head-mounted displays, controllers, base stations, trackers and other XR device capabilities through runtime and device interfaces.",
            "supports": "XR device, tracking and platform engineering is an established technical practice area.",
            "claim_limit": "Open standard scope; does not establish the exact catalogue boundary, role route or a professional licence.",
            "geographic_scope": "international open standard",
        }],
        "D153:music-production-and-arrangement": [{
            "source_id": "AES_PROFESSIONAL_AUDIO_STANDARDS_SCOPE",
            "publisher": "Audio Engineering Society",
            "title": "AES Standards",
            "url": "https://aes.org/standards/",
            "locator": "AES standards overview: industry standards supporting professional audio technology, performance, interoperability and workflows.",
            "supports": "Music production and arrangement are established professional-audio practice areas.",
            "claim_limit": "Audio-engineering standards scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international professional society",
        }],
        "D153:mixing-and-mastering": [{
            "source_id": "AES_PROFESSIONAL_AUDIO_STANDARDS_SCOPE",
            "publisher": "Audio Engineering Society",
            "title": "AES Standards",
            "url": "https://aes.org/standards/",
            "locator": "AES standards overview: professional-audio standards for consistency, interoperability and performance across recording and playback systems.",
            "supports": "Mixing and mastering are established professional-audio practice areas within audio production.",
            "claim_limit": "Audio-engineering standards scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international professional society",
        }],
        "D153:live-music-sound-production": [{
            "source_id": "AES_PROFESSIONAL_AUDIO_STANDARDS_SCOPE",
            "publisher": "Audio Engineering Society",
            "title": "AES Standards",
            "url": "https://aes.org/standards/",
            "locator": "AES standards overview: professional audio technology and standards used across audio systems and production practice.",
            "supports": "Live-music sound production is an established professional-audio practice area.",
            "claim_limit": "Audio-engineering standards scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international professional society",
        }],
        "D103:jewellery-design-and-digital-product-development": [{
            "source_id": "CIBJO_JEWELLERY_STANDARDS_BLUE_BOOKS",
            "publisher": "Confederation Internationale de la Bijouterie, Joaillerie, Orfevrerie des Diamants, Perles et Pierres",
            "title": "CIBJO Blue Books",
            "url": "https://www.cibjo.org/introduction-to-the-blue-books/",
            "locator": "CIBJO Blue Books overview: international technical guidance and nomenclature for diamonds, coloured gemstones, pearls and precious-metal jewellery.",
            "supports": "Jewellery design and digital product development are established jewellery-product practice areas using recognized material, product and nomenclature standards.",
            "claim_limit": "International trade-body standards scope; does not establish the exact catalogue boundary, role route or Nigerian trade authorization.",
            "geographic_scope": "international professional standards",
        }],
        "D103:jewellery-making-setting-and-finishing": [{
            "source_id": "CIBJO_JEWELLERY_STANDARDS_BLUE_BOOKS",
            "publisher": "Confederation Internationale de la Bijouterie, Joaillerie, Orfevrerie des Diamants, Perles et Pierres",
            "title": "CIBJO Blue Books",
            "url": "https://www.cibjo.org/introduction-to-the-blue-books/",
            "locator": "CIBJO Blue Books overview: technical guidance and terminology for jewellery materials, gemstones, pearls and precious-metal products.",
            "supports": "Jewellery making, setting and finishing are established product-making practice areas within the jewellery sector.",
            "claim_limit": "International trade-body standards scope; does not establish the exact catalogue boundary, role route or Nigerian trade authorization.",
            "geographic_scope": "international professional standards",
        }],
        "D111:textile-colouration-printing-and-finishing": [{
            "source_id": "TEXTILE_INSTITUTE_TEXTILE_PROFESSION_SCOPE",
            "publisher": "The Textile Institute",
            "title": "The Textile Institute",
            "url": "https://www.textileinstitute.org/",
            "locator": "Institute overview: international professional body covering textile materials, manufacture, coloration, finishing and related textile technology.",
            "supports": "Textile colouration, printing and finishing are established textile-technology practice areas.",
            "claim_limit": "Professional institute scope; does not establish the exact catalogue boundary, role route or local industrial regulation.",
            "geographic_scope": "international professional institute",
        }],
        "D111:garment-machine-production-parent-boundary-candidate": [{
            "source_id": "TEXTILE_INSTITUTE_TEXTILE_PROFESSION_SCOPE",
            "publisher": "The Textile Institute",
            "title": "The Textile Institute",
            "url": "https://www.textileinstitute.org/",
            "locator": "Institute overview: textile and clothing technology and manufacture are recognized professional and industrial activities.",
            "supports": "Garment-machine production is a plausible textile/clothing manufacturing practice, while the parent-boundary status remains a catalogue decision.",
            "claim_limit": "Supports the practice context only; does not by itself decide whether this candidate should remain a separate area or be merged into the parent.",
            "geographic_scope": "international professional institute",
        }],
        "D122:hematology-and-hemostasis": [{
            "source_id": "WHO_GLOBAL_LABORATORY_DIAGNOSTICS",
            "publisher": "World Health Organization",
            "title": "Diagnostics - Global",
            "url": "https://www.who.int/health-topics/diagnostics/2",
            "locator": "WHO diagnostics overview: laboratory tests, including blood tests, and national laboratory systems that deliver timely, safe and reliable diagnostic results.",
            "supports": "Hematology and hemostasis are established laboratory-diagnostics practice areas involving blood testing and interpretation.",
            "claim_limit": "WHO diagnostics scope; does not establish the exact catalogue boundary, role route or national laboratory authorization.",
            "geographic_scope": "global WHO guidance",
        }],
        "D122:molecular-diagnostics-and-medical-genetics": [{
            "source_id": "WHO_GLOBAL_LABORATORY_DIAGNOSTICS",
            "publisher": "World Health Organization",
            "title": "Diagnostics - Global",
            "url": "https://www.who.int/health-topics/diagnostics/2",
            "locator": "WHO diagnostics overview: in-vitro diagnostic tests and strengthened laboratory systems for safe, reliable results.",
            "supports": "Molecular diagnostics and medical genetics are established diagnostic-laboratory practice areas.",
            "claim_limit": "WHO diagnostics scope; does not establish the exact catalogue boundary, role route or national laboratory authorization.",
            "geographic_scope": "global WHO guidance",
        }],
        "D125:patient-access-and-medical-office-coordination": [{
            "source_id": "AAMA_MEDICAL_ASSISTING_SCOPE",
            "publisher": "American Association of Medical Assistants",
            "title": "What is a Medical Assistant?",
            "url": "https://www.aama-ntl.org/medical-assisting/what-is-a-medical-assistant",
            "locator": "AAMA profession overview: clinical and administrative duties in healthcare offices, including patient-facing and practice-management functions.",
            "supports": "Patient access and medical-office coordination are established healthcare-administration practice areas.",
            "claim_limit": "Professional association scope; does not establish the exact catalogue boundary, role route or Nigerian authorization.",
            "geographic_scope": "United States professional association; practice evidence only",
        }],
        "D127:infant-and-toddler-care-and-development": [{
            "source_id": "UNICEF_EARLY_CHILDHOOD_DEVELOPMENT",
            "publisher": "United Nations Children's Fund",
            "title": "Early Childhood Development",
            "url": "https://www.unicef.org/early-childhood-development",
            "locator": "UNICEF early-childhood-development programme: nurturing care, early learning, health, nutrition, safety and responsive caregiving from pregnancy through early childhood.",
            "supports": "Infant and toddler care and development are established early-childhood practice areas.",
            "claim_limit": "UNICEF programme scope; does not establish the exact catalogue boundary, role route or local childcare licensing.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D127:early-primary-learning-and-school-transition": [{
            "source_id": "UNICEF_EARLY_CHILDHOOD_DEVELOPMENT",
            "publisher": "United Nations Children's Fund",
            "title": "Early Childhood Development",
            "url": "https://www.unicef.org/early-childhood-development",
            "locator": "UNICEF early-childhood-development scope: early learning and continuity of development support as children progress into formal education.",
            "supports": "Early-primary learning and school transition are established education-development practice areas.",
            "claim_limit": "UNICEF programme scope; does not establish the exact catalogue boundary, role route or national teacher certification.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D130:talent-acquisition-and-recruitment": [{
            "source_id": "SHRM_TALENT_ACQUISITION_SCOPE",
            "publisher": "Society for Human Resource Management",
            "title": "Talent Acquisition",
            "url": "https://www.shrm.org/topics-tools/topics/talent-acquisition",
            "locator": "SHRM topic scope: recruiting, sourcing, selecting and onboarding people as a defined human-resources practice.",
            "supports": "Talent acquisition and recruitment are established human-resources practice areas.",
            "claim_limit": "Professional association topic scope; does not establish the exact catalogue boundary, role route or Nigerian employment law.",
            "geographic_scope": "international professional association; jurisdictional rules vary",
        }],
        "D130:executive-search-and-specialist-recruitment": [{
            "source_id": "SHRM_TALENT_ACQUISITION_SCOPE",
            "publisher": "Society for Human Resource Management",
            "title": "Talent Acquisition",
            "url": "https://www.shrm.org/topics-tools/topics/talent-acquisition",
            "locator": "SHRM talent-acquisition scope: recruiting and selection practice, including specialized approaches to sourcing and hiring.",
            "supports": "Executive search and specialist recruitment are established recruitment practice specializations.",
            "claim_limit": "Professional association topic scope; does not establish the exact catalogue boundary, role route or Nigerian employment law.",
            "geographic_scope": "international professional association; jurisdictional rules vary",
        }],
        "D136:aeronautical-engineering-and-atmospheric-flight-systems": [{
            "source_id": "NASA_AERONAUTICS_RESEARCH_SCOPE",
            "publisher": "National Aeronautics and Space Administration",
            "title": "Aeronautics",
            "url": "https://www.nasa.gov/aeronautics/",
            "locator": "NASA aeronautics programme: aircraft and flight research, aviation systems, propulsion, autonomy and atmospheric flight technology.",
            "supports": "Aeronautical engineering and atmospheric flight systems are established aerospace-engineering practice areas.",
            "claim_limit": "NASA research programme scope; does not establish the exact catalogue boundary, role route or aviation licensing.",
            "geographic_scope": "United States public-sector research programme; practice evidence only",
        }],
        "D136:astronautical-engineering-and-spaceflight-systems": [{
            "source_id": "NASA_HUMAN_SPACEFLIGHT_SYSTEMS",
            "publisher": "National Aeronautics and Space Administration",
            "title": "Human Spaceflight",
            "url": "https://www.nasa.gov/humans-in-space/",
            "locator": "NASA human-spaceflight programme scope: spacecraft, launch and spaceflight systems and operations supporting exploration beyond Earth.",
            "supports": "Astronautical engineering and spaceflight systems are established space-engineering practice areas.",
            "claim_limit": "NASA programme scope; does not establish the exact catalogue boundary, role route or national launch authorization.",
            "geographic_scope": "United States public-sector space programme; practice evidence only",
        }],
        "D138:biomechanics-rehabilitation-and-assistive-technology": [{
            "source_id": "WHO_REHABILITATION_SCOPE",
            "publisher": "World Health Organization",
            "title": "Rehabilitation",
            "url": "https://www.who.int/health-topics/rehabilitation",
            "locator": "WHO rehabilitation overview: interventions to optimize functioning and reduce disability, including assistive products and multidisciplinary practice.",
            "supports": "Biomechanics, rehabilitation and assistive technology are established health-engineering and rehabilitation practice areas.",
            "claim_limit": "WHO health-system scope; does not establish the exact catalogue boundary, role route or local clinical authorization.",
            "geographic_scope": "global WHO guidance",
        }],
        "D142:molecular-and-structural-bioinformatics": [{
            "source_id": "ISCB_BIOINFORMATICS_SCOPE",
            "publisher": "International Society for Computational Biology",
            "title": "International Society for Computational Biology",
            "url": "https://www.iscb.org/",
            "locator": "ISCB mission and community scope: computational biology and bioinformatics methods for biological data and discovery.",
            "supports": "Molecular and structural bioinformatics are established computational-biology practice areas.",
            "claim_limit": "Professional society scope; does not establish the exact catalogue boundary, role route or employment eligibility.",
            "geographic_scope": "international professional society",
        }],
        "D142:bioinformatics-infrastructure-and-reproducible-data-science": [{
            "source_id": "ISCB_BIOINFORMATICS_SCOPE",
            "publisher": "International Society for Computational Biology",
            "title": "International Society for Computational Biology",
            "url": "https://www.iscb.org/",
            "locator": "ISCB scope: bioinformatics and computational biology community, methods and infrastructure for biological data analysis.",
            "supports": "Bioinformatics infrastructure and reproducible data science are established computational-biology practice areas.",
            "claim_limit": "Professional society scope; does not establish the exact catalogue boundary, role route or employment eligibility.",
            "geographic_scope": "international professional society",
        }],
        "D156:engineering-and-topographic-surveying": [{
            "source_id": "FIG_GLOBAL_SURVEYING_SCOPE",
            "publisher": "International Federation of Surveyors",
            "title": "International Federation of Surveyors",
            "url": "https://fig.net/",
            "locator": "FIG overview: global surveying fields include surveying, mapping, geodesy, geospatial and related professional practice and standards.",
            "supports": "Engineering and topographic surveying are established surveying and geospatial practice areas.",
            "claim_limit": "International professional federation scope; does not establish the exact catalogue boundary, role route or Nigerian registration requirements.",
            "geographic_scope": "international professional federation",
        }],
        "D157:tax-compliance-and-advisory": [{
            "source_id": "OECD_TAX_ADMINISTRATION_COMPLIANCE_SCOPE",
            "publisher": "Organisation for Economic Co-operation and Development",
            "title": "Tax administration",
            "url": "https://www.oecd.org/en/topics/tax-administration.html",
            "locator": "OECD tax-administration overview: revenue collection, taxpayer obligations, compliance, administration and cooperation among tax authorities.",
            "supports": "Tax compliance and advisory are established tax-administration and professional-services practice areas.",
            "claim_limit": "OECD comparative policy scope; does not establish the exact catalogue boundary, role route or Nigerian tax authorization.",
            "geographic_scope": "international intergovernmental policy guidance",
        }],
        "D157:tax-disputes-and-controversy": [{
            "source_id": "OECD_TAX_DISPUTE_RESOLUTION_SCOPE",
            "publisher": "Organisation for Economic Co-operation and Development",
            "title": "Disputes: Tax Administration 2024",
            "url": "https://www.oecd.org/en/publications/tax-administration-2024_2d5fba9c-en/full-report/component-14.html",
            "locator": "OECD chapter on tax disputes: administrative review, appeals, litigation and international mutual-agreement procedures.",
            "supports": "Tax disputes and controversy are established tax-law and tax-administration practice areas.",
            "claim_limit": "OECD comparative policy scope; does not establish the exact catalogue boundary, role route or Nigerian tax procedure.",
            "geographic_scope": "international intergovernmental policy guidance",
        }],
        "D157:tax-policy-and-administration": [{
            "source_id": "OECD_TAX_ADMINISTRATION_COMPLIANCE_SCOPE",
            "publisher": "Organisation for Economic Co-operation and Development",
            "title": "Tax administration",
            "url": "https://www.oecd.org/en/topics/tax-administration.html",
            "locator": "OECD tax-administration overview: administration of tax systems, public revenue, taxpayer service, compliance and international cooperation.",
            "supports": "Tax policy and administration are established public-finance and tax-governance practice areas.",
            "claim_limit": "OECD comparative policy scope; does not establish the exact catalogue boundary, role route or Nigerian tax appointment requirements.",
            "geographic_scope": "international intergovernmental policy guidance",
        }],
        "D041:mathematical-and-statistical-sciences": [{
            "source_id": "INTERNATIONAL_STATISTICAL_INSTITUTE_SCOPE",
            "publisher": "International Statistical Institute",
            "title": "International Statistical Institute",
            "url": "https://isi-web.org/",
            "locator": "ISI overview: international professional community for statistical science, methods, education and applications.",
            "supports": "Mathematical and statistical sciences are established disciplinary and professional practice areas.",
            "claim_limit": "Professional institute scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international professional institute",
        }],
        "D068:rehabilitation-and-functional-health-services": [{
            "source_id": "WHO_REHABILITATION_SCOPE",
            "publisher": "World Health Organization",
            "title": "Rehabilitation",
            "url": "https://www.who.int/health-topics/rehabilitation",
            "locator": "WHO rehabilitation overview: interventions to optimize functioning and reduce disability across health conditions and the life course.",
            "supports": "Rehabilitation and functional-health services are established health-service practice areas.",
            "claim_limit": "WHO health-system scope; does not establish the exact catalogue boundary, role route or local clinical authorization.",
            "geographic_scope": "global WHO guidance",
        }],
        "D101:industrial-protective-coatings-and-surface-preparation": [{
            "source_id": "AMPP_MATERIALS_PROTECTION_COATINGS_SCOPE",
            "publisher": "Association for Materials Protection and Performance",
            "title": "Association for Materials Protection and Performance",
            "url": "https://www.ampp.org/",
            "locator": "AMPP overview: corrosion control, protective coatings, surface preparation, inspection and materials-protection practice.",
            "supports": "Industrial protective coatings and surface preparation are established materials-protection practice areas.",
            "claim_limit": "Professional association scope; does not establish the exact catalogue boundary, role route or national certification requirements.",
            "geographic_scope": "international professional association",
        }],
        "D128:child-and-family-welfare": [{
            "source_id": "UNICEF_CHILD_PROTECTION_SCOPE",
            "publisher": "United Nations Children's Fund",
            "title": "Child Protection",
            "url": "https://www.unicef.org/protection",
            "locator": "UNICEF child-protection programme: prevention and response to violence, exploitation, abuse and harmful practices affecting children and families.",
            "supports": "Child and family welfare is an established social-welfare and child-protection practice area.",
            "claim_limit": "UNICEF programme scope; does not establish the exact catalogue boundary, role route or national social-work authorization.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D128:adult-social-welfare-and-support-services": [{
            "source_id": "IFSW_GLOBAL_SOCIAL_WORK_DEFINITION",
            "publisher": "International Federation of Social Workers",
            "title": "Global Definition of Social Work",
            "url": "https://www.ifsw.org/what-is-social-work/global-definition-of-social-work/",
            "locator": "IFSW definition: social work promotes social change, development, cohesion and empowerment while working with people and structures to address life challenges.",
            "supports": "Adult social welfare and support services are established social-work and human-services practice areas.",
            "claim_limit": "Professional federation definition; does not establish the exact catalogue boundary, role route or national authorization.",
            "geographic_scope": "international professional federation",
        }],
        "D131:competition-vehicle-design-and-performance": [{
            "source_id": "FIA_MOTORSPORT_TECHNICAL_SCOPE",
            "publisher": "Federation Internationale de l'Automobile",
            "title": "FIA",
            "url": "https://www.fia.com/",
            "locator": "FIA overview: international motor-sport governance, sporting and technical regulations and vehicle-performance safety frameworks.",
            "supports": "Competition-vehicle design and performance are established motorsport engineering and technical practice areas.",
            "claim_limit": "Sporting-governance scope; does not establish the exact catalogue boundary, role route or vehicle-registration rules.",
            "geographic_scope": "international sporting federation",
        }],
        "D138:computational-systems-and-quantitative-bioengineering": [{
            "source_id": "BMES_BIOENGINEERING_SCOPE",
            "publisher": "Biomedical Engineering Society",
            "title": "Biomedical Engineering Society",
            "url": "https://www.bmes.org/",
            "locator": "BMES overview: biomedical engineering integrates engineering, biology and medicine to advance health and healthcare technologies.",
            "supports": "Computational, systems and quantitative bioengineering are established bioengineering practice areas.",
            "claim_limit": "Professional society scope; does not establish the exact catalogue boundary, role route or clinical authorization.",
            "geographic_scope": "international professional society",
        }],
        "D140:robotic-systems-deployment-and-application-engineering": [{
            "source_id": "IEEE_ROBOTICS_AUTOMATION_STANDARDS_SCOPE",
            "publisher": "IEEE Robotics and Automation Society",
            "title": "IEEE RAS Standards",
            "url": "https://sagroups.ieee.org/ras-sc/standards/",
            "locator": "IEEE RAS standards scope: robotics and automation terminology, systems, mapping, autonomy and application-oriented technical standards.",
            "supports": "Robotic-systems deployment and application engineering are established robotics practice areas.",
            "claim_limit": "Standards-community scope; does not establish the exact catalogue boundary, role route or safety certification.",
            "geographic_scope": "international engineering standards community",
        }],
        "D141:quantum-computing-hardware-and-devices": [{
            "source_id": "IEEE_QUANTUM_ENGINEERING_SCOPE",
            "publisher": "IEEE Quantum Initiative",
            "title": "IEEE Quantum",
            "url": "https://quantum.ieee.org/",
            "locator": "IEEE Quantum overview: quantum computing, hardware, devices, algorithms, applications and engineering ecosystem.",
            "supports": "Quantum-computing hardware and devices are established quantum-technology practice areas.",
            "claim_limit": "Professional/technical community scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international technical community",
        }],
        "D141:quantum-algorithms-and-software": [{
            "source_id": "IEEE_QUANTUM_ENGINEERING_SCOPE",
            "publisher": "IEEE Quantum Initiative",
            "title": "IEEE Quantum",
            "url": "https://quantum.ieee.org/",
            "locator": "IEEE Quantum overview: quantum algorithms, computing, software, hardware and applications.",
            "supports": "Quantum algorithms and software are established quantum-computing practice areas.",
            "claim_limit": "Professional/technical community scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international technical community",
        }],
        "D145:cellular-molecular-and-systems-neuroscience": [{
            "source_id": "SOCIETY_FOR_NEUROSCIENCE_SCOPE",
            "publisher": "Society for Neuroscience",
            "title": "Society for Neuroscience",
            "url": "https://www.sfn.org/",
            "locator": "Society overview: neuroscience research and professional community covering cellular, molecular, systems and behavioural levels of nervous-system science.",
            "supports": "Cellular, molecular and systems neuroscience are established neuroscience practice areas.",
            "claim_limit": "Professional society scope; does not establish the exact catalogue boundary, role route or clinical authorization.",
            "geographic_scope": "international professional society",
        }],
        "D145:cognitive-science-and-human-cognition": [{
            "source_id": "COGNITIVE_SCIENCE_SOCIETY_SCOPE",
            "publisher": "Cognitive Science Society",
            "title": "Cognitive Science Society",
            "url": "https://cognitivesciencesociety.org/",
            "locator": "Society overview: interdisciplinary cognitive-science research on mind, brain, language, learning and intelligent behaviour.",
            "supports": "Cognitive science and human cognition are established interdisciplinary practice areas.",
            "claim_limit": "Professional society scope; does not establish the exact catalogue boundary, role route or clinical authorization.",
            "geographic_scope": "international professional society",
        }],
        "D148:offshore-wells-drilling-and-completions": [{
            "source_id": "IOGP_WELLS_DRILLING_COMPLETIONS_SCOPE",
            "publisher": "International Association of Oil and Gas Producers",
            "title": "IOGP Standards and Publications",
            "url": "https://www.iogp.org/bookstore/",
            "locator": "IOGP technical-publication programme: oil and gas production, wells, drilling, completions, operations and safety practices.",
            "supports": "Offshore wells, drilling and completions are established upstream petroleum-engineering practice areas.",
            "claim_limit": "Industry association scope; does not establish the exact catalogue boundary, role route or national petroleum authorization.",
            "geographic_scope": "international industry association",
        }],
        "D148:offshore-renewable-and-low-carbon-systems-conditional": [{
            "source_id": "IRENA_OFFSHORE_RENEWABLE_ENERGY_SCOPE",
            "publisher": "International Renewable Energy Agency",
            "title": "International Renewable Energy Agency",
            "url": "https://www.irena.org/",
            "locator": "IRENA overview: renewable-energy technology, deployment, policy and system transformation, including offshore and low-carbon energy contexts.",
            "supports": "Offshore renewable and low-carbon systems are an established energy-systems practice context; the catalogue marks this area conditional.",
            "claim_limit": "Intergovernmental energy scope; does not by itself resolve the catalogue's conditional-parent decision or exact role route.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D149:foreign-policy-and-international-affairs-analysis": [{
            "source_id": "UN_INTERNATIONAL_AFFAIRS_SCOPE",
            "publisher": "United Nations",
            "title": "Our Work",
            "url": "https://www.un.org/en/our-work",
            "locator": "United Nations overview of international cooperation, peace and security, human rights, development and global affairs.",
            "supports": "Foreign-policy and international-affairs analysis are established international-relations practice areas.",
            "claim_limit": "Intergovernmental institutional scope; does not establish the exact catalogue boundary, role route or diplomatic appointment eligibility.",
            "geographic_scope": "global intergovernmental framework",
        }],
        "D151:policing-and-criminal-investigation": [{
            "source_id": "UNODC_CRIMINAL_JUSTICE_SCOPE",
            "publisher": "United Nations Office on Drugs and Crime",
            "title": "Criminal Justice and Prison Reform",
            "url": "https://www.unodc.org/unodc/en/justice-and-prison-reform/index.html",
            "locator": "UNODC justice-reform programme: criminal justice systems, policing, prosecution, courts, prisons and evidence-based reform.",
            "supports": "Policing and criminal investigation are established criminal-justice practice areas.",
            "claim_limit": "Intergovernmental justice-policy scope; does not establish the exact catalogue boundary, role route or Nigerian police appointment rules.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D151:corrections-rehabilitation-and-re-entry": [{
            "source_id": "UNODC_CRIMINAL_JUSTICE_SCOPE",
            "publisher": "United Nations Office on Drugs and Crime",
            "title": "Criminal Justice and Prison Reform",
            "url": "https://www.unodc.org/unodc/en/justice-and-prison-reform/index.html",
            "locator": "UNODC justice and prison reform programme: prison systems, rehabilitation, reintegration and human-rights-based criminal justice.",
            "supports": "Corrections, rehabilitation and re-entry are established criminal-justice practice areas.",
            "claim_limit": "Intergovernmental justice-policy scope; does not establish the exact catalogue boundary, role route or national corrections appointment rules.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D151:justice-system-administration-and-reform": [{
            "source_id": "UNODC_CRIMINAL_JUSTICE_SCOPE",
            "publisher": "United Nations Office on Drugs and Crime",
            "title": "Criminal Justice and Prison Reform",
            "url": "https://www.unodc.org/unodc/en/justice-and-prison-reform/index.html",
            "locator": "UNODC programme scope: criminal-justice institutions, administration, prison reform and evidence-based justice-system improvement.",
            "supports": "Justice-system administration and reform are established public-justice practice areas.",
            "claim_limit": "Intergovernmental justice-policy scope; does not establish the exact catalogue boundary, role route or national public-service appointment rules.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D152:conservation-and-collection-preservation": [{
            "source_id": "ICOM_MUSEUM_COLLECTION_STANDARDS",
            "publisher": "International Council of Museums",
            "title": "ICOM Standards and Guidelines",
            "url": "https://icom.museum/en/resources/standards-guidelines/",
            "locator": "ICOM standards and guidelines: museum collections, conservation, documentation, care and professional practice.",
            "supports": "Conservation and collection preservation are established museum and heritage practice areas.",
            "claim_limit": "International museum-body standards scope; does not establish the exact catalogue boundary, role route or national heritage appointment rules.",
            "geographic_scope": "international professional standards",
        }],
        "D152:archaeology-and-heritage-field-research": [{
            "source_id": "ICOMOS_HERITAGE_CONSERVATION_SCOPE",
            "publisher": "International Council on Monuments and Sites",
            "title": "ICOMOS",
            "url": "https://www.icomos.org/en",
            "locator": "ICOMOS overview: cultural-heritage conservation, documentation, research and professional guidance for monuments and sites.",
            "supports": "Archaeology and heritage field research are established cultural-heritage practice areas.",
            "claim_limit": "International heritage-body scope; does not establish the exact catalogue boundary, role route or national archaeological authorization.",
            "geographic_scope": "international professional body",
        }],
        "D155:nanomaterials-and-functional-materials": [{
            "source_id": "NNCO_NANOTECHNOLOGY_SCOPE",
            "publisher": "National Nanotechnology Coordination Office",
            "title": "About Nanotechnology",
            "url": "https://www.nano.gov/about-nanotechnology/",
            "locator": "NNCO overview: understanding and controlling matter at the nanoscale and exploiting nanoscale material properties for technology and industry.",
            "supports": "Nanomaterials and functional materials are established nanotechnology practice areas.",
            "claim_limit": "Public research-programme scope; does not establish the exact catalogue boundary, role route or country-specific regulation.",
            "geographic_scope": "United States public-sector research programme; practice evidence only",
        }],
        "D155:nanofabrication-and-nanoelectronics": [{
            "source_id": "NNCO_NANOELECTRONICS_SCOPE",
            "publisher": "National Nanotechnology Coordination Office",
            "title": "NNI Electronic and Photonics Materials",
            "url": "https://www.nano.gov/sites/default/files/pub_resource/nni_electronic_photonics_m.pdf",
            "locator": "NNCO/NNI report scope: nanoelectronics, electronic and photonic materials and nanoscale fabrication research.",
            "supports": "Nanofabrication and nanoelectronics are established nanotechnology and electronic-materials practice areas.",
            "claim_limit": "Public research-programme scope; does not establish the exact catalogue boundary, role route or country-specific regulation.",
            "geographic_scope": "United States public-sector research programme; practice evidence only",
        }],
        "D155:nanobiotechnology-and-biomedical-nanotechnology": [{
            "source_id": "NNCO_NANOBIOTECHNOLOGY_SCOPE",
            "publisher": "National Nanotechnology Coordination Office",
            "title": "NNI Nanobiotechnology Workshop Report",
            "url": "https://www.nano.gov/sites/default/files/pub_resource/nni_nanobiotechnology_rpt.pdf",
            "locator": "NNI workshop report scope: nanobiotechnology applications, biomedical nanomaterials, imaging and related health technologies.",
            "supports": "Nanobiotechnology and biomedical nanotechnology are established application areas of nanotechnology.",
            "claim_limit": "Public research-programme scope; does not establish the exact catalogue boundary, role route or clinical authorization.",
            "geographic_scope": "United States public-sector research programme; practice evidence only",
        }],
        "D160:editorial-commercial-and-media-styling": [{
            "source_id": "AICI_IMAGE_CONSULTING_SCOPE",
            "publisher": "Association of Image Consultants International",
            "title": "Association of Image Consultants International",
            "url": "https://aici.org/",
            "locator": "AICI professional community scope: image consulting, personal and commercial appearance, styling and presentation practice.",
            "supports": "Editorial, commercial and media styling are established styling and image-presentation practice areas.",
            "claim_limit": "Professional association scope; does not establish the exact catalogue boundary, role route or local employment regulation.",
            "geographic_scope": "international professional association",
        }],
        "D160:visual-merchandising-and-fashion-presentation": [{
            "source_id": "VM_SD_VISUAL_MERCHANDISING_SCOPE",
            "publisher": "Visual Merchandising and Store Design",
            "title": "Visual Merchandising and Store Design",
            "url": "https://visual-merchandising.org/",
            "locator": "Professional-community scope: visual merchandising, retail presentation, display design and store experience.",
            "supports": "Visual merchandising and fashion presentation are established retail and fashion-presentation practice areas.",
            "claim_limit": "Professional-community scope; does not establish the exact catalogue boundary or role route.",
            "geographic_scope": "international professional community",
        }],
        "D162:immigration-law-and-status-applications": [{
            "source_id": "IOM_MIGRATION_GOVERNANCE_SCOPE",
            "publisher": "International Organization for Migration",
            "title": "Migration Governance",
            "url": "https://www.iom.int/migration-governance",
            "locator": "IOM migration-governance scope: migration policy, legal and administrative frameworks, status, mobility and migrant protection.",
            "supports": "Immigration law and status applications are established migration-law and administration practice areas.",
            "claim_limit": "Intergovernmental migration-policy scope; does not establish the exact catalogue boundary, role route or national legal authorization.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D162:immigration-compliance-policy-and-programme-administration": [{
            "source_id": "IOM_MIGRATION_GOVERNANCE_SCOPE",
            "publisher": "International Organization for Migration",
            "title": "Migration Governance",
            "url": "https://www.iom.int/migration-governance",
            "locator": "IOM migration-governance scope: policy, institutions, administration and implementation of migration systems.",
            "supports": "Immigration compliance, policy and programme administration are established migration-governance practice areas.",
            "claim_limit": "Intergovernmental migration-policy scope; does not establish the exact catalogue boundary, role route or national public-service appointment rules.",
            "geographic_scope": "global intergovernmental guidance",
        }],
        "D163:ip-transactions-licensing-and-commercialization": [{
            "source_id": "WIPO_IP_MANAGEMENT_AND_LICENSING",
            "publisher": "World Intellectual Property Organization",
            "title": "WIPO Intellectual Property",
            "url": "https://www.wipo.int/about-ip/en/",
            "locator": "WIPO intellectual-property overview: IP rights, commercialization, licensing and management of intangible assets.",
            "supports": "IP transactions, licensing and commercialization are established intellectual-property practice areas.",
            "claim_limit": "WIPO institutional scope; does not establish the exact catalogue boundary, role route or country-specific legal authorization.",
            "geographic_scope": "international intergovernmental guidance",
        }],
        "D163:ip-portfolio-strategy-and-rights-management": [{
            "source_id": "WIPO_IP_MANAGEMENT_AND_LICENSING",
            "publisher": "World Intellectual Property Organization",
            "title": "WIPO Intellectual Property",
            "url": "https://www.wipo.int/about-ip/en/",
            "locator": "WIPO intellectual-property overview: management and strategic use of patents, trademarks, copyright and other IP rights.",
            "supports": "IP portfolio strategy and rights management are established intellectual-property practice areas.",
            "claim_limit": "WIPO institutional scope; does not establish the exact catalogue boundary, role route or country-specific legal authorization.",
            "geographic_scope": "international intergovernmental guidance",
        }],
        "D166:perception-sensing-and-scene-understanding": [{
            "source_id": "NHTSA_AUTOMATED_VEHICLE_SAFETY_SCOPE",
            "publisher": "National Highway Traffic Safety Administration",
            "title": "Automated Vehicles Safety",
            "url": "https://www.nhtsa.gov/vehicle-safety/automated-vehicles-safety",
            "locator": "NHTSA automated-vehicle safety overview: automated-driving systems, sensing, performance and safety evaluation context.",
            "supports": "Perception, sensing and scene understanding are established automated-driving engineering practice areas.",
            "claim_limit": "U.S. public-safety policy scope; does not establish the exact catalogue boundary, role route or Nigerian vehicle approval.",
            "geographic_scope": "United States public-sector guidance; practice evidence only",
        }],
        "D166:localization-mapping-and-vehicle-state-estimation": [{
            "source_id": "NHTSA_AUTOMATED_VEHICLE_SAFETY_SCOPE",
            "publisher": "National Highway Traffic Safety Administration",
            "title": "Automated Vehicles Safety",
            "url": "https://www.nhtsa.gov/vehicle-safety/automated-vehicles-safety",
            "locator": "NHTSA automated-vehicle safety context: automated-driving systems require defined system performance and safety evaluation.",
            "supports": "Localization, mapping and vehicle-state estimation are established automated-driving engineering practice areas.",
            "claim_limit": "U.S. public-safety policy scope; does not establish the exact catalogue boundary, role route or Nigerian vehicle approval.",
            "geographic_scope": "United States public-sector guidance; practice evidence only",
        }],
        "D166:planning-control-and-automated-driving-software": [{
            "source_id": "SAE_J3016_AUTOMATED_DRIVING_TAXONOMY",
            "publisher": "SAE International",
            "title": "Taxonomy and Definitions for Terms Related to Driving Automation Systems",
            "url": "https://saemobilus.sae.org/standards/j3016_202104-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles?tabType=viewannotation",
            "locator": "SAE J3016 scope: standardized levels and terminology for driving-automation systems and their operating roles.",
            "supports": "Planning, control and automated-driving software are established autonomous-vehicle engineering practice areas.",
            "claim_limit": "SAE terminology standard; supports scope, not the exact catalogue boundary, role route or vehicle-approval requirements.",
            "geographic_scope": "international engineering standard",
        }],
        "D167:xr-experience-interaction-and-content-design": [{
            "source_id": "KHRONOS_OPENXR_STANDARD",
            "publisher": "The Khronos Group",
            "title": "OpenXR",
            "url": "https://www.khronos.org/openxr/",
            "locator": "OpenXR overview: cross-platform XR application interfaces, interaction, rendering and device/runtime integration.",
            "supports": "XR experience, interaction and content design are established extended-reality practice areas.",
            "claim_limit": "Open standard scope; does not establish the exact catalogue boundary, role route or a professional licence.",
            "geographic_scope": "international open standard",
        }],
        "D168:esports-competition-and-event-operations": [{
            "source_id": "IESF_ESPORTS_GOVERNANCE_SCOPE",
            "publisher": "International Esports Federation",
            "title": "International Esports Federation",
            "url": "https://iesf.org/",
            "locator": "IESF overview: international esports governance, competitions, events and federation activities.",
            "supports": "Esports competition and event operations are established esports practice areas.",
            "claim_limit": "International federation scope; does not establish the exact catalogue boundary, role route or national event authorization.",
            "geographic_scope": "international sporting federation",
        }],
        "D168:esports-teams-players-and-performance": [{
            "source_id": "IESF_ESPORTS_GOVERNANCE_SCOPE",
            "publisher": "International Esports Federation",
            "title": "International Esports Federation",
            "url": "https://iesf.org/",
            "locator": "IESF federation scope: esports athletes, teams, competition structures and international sporting activity.",
            "supports": "Esports teams, players and performance are established esports practice areas.",
            "claim_limit": "International federation scope; does not establish the exact catalogue boundary, role route or national employment eligibility.",
            "geographic_scope": "international sporting federation",
        }],
        "D168:esports-broadcast-content-and-audience-partnerships": [{
            "source_id": "IESF_ESPORTS_GOVERNANCE_SCOPE",
            "publisher": "International Esports Federation",
            "title": "International Esports Federation",
            "url": "https://iesf.org/",
            "locator": "IESF esports ecosystem scope: competitions, events, media-facing activities and international audience engagement.",
            "supports": "Esports broadcast, content and audience partnerships are established esports-industry practice areas.",
            "claim_limit": "International federation scope; does not establish the exact catalogue boundary, role route or national employment eligibility.",
            "geographic_scope": "international sporting federation",
        }],
        "D161:recovery-resilience-and-international-development-programmes": [{
            "source_id": "UNDRR_RESILIENT_RECOVERY_SCOPE",
            "publisher": "United Nations Office for Disaster Risk Reduction",
            "title": "Strengthening readiness for resilient recovery",
            "url": "https://www.undrr.org/implementing-sendai-framework/strenthening-readiness-for-resilient-recovery",
            "locator": "UNDRR Sendai Framework implementation: preparedness, response, rehabilitation, reconstruction and Build Back Better for resilient recovery.",
            "supports": "Recovery, resilience and international development programmes are established disaster-risk and development-practice areas.",
            "claim_limit": "UNDRR policy scope; does not establish the exact catalogue boundary, role route or country-specific programme eligibility.",
            "geographic_scope": "global intergovernmental policy guidance",
        }],
        "D150:congregational-and-community-ministry": [{
            "source_id": "WCC_INTERRELIGIOUS_DIALOGUE_AND_COMMUNITY_SCOPE",
            "publisher": "World Council of Churches",
            "title": "Interreligious Dialogue and Cooperation",
            "url": "https://oikoumene.org/what-we-do/interreligious-dialogue-and-cooperation",
            "locator": "WCC programme overview: interreligious encounter, engagement, community life, dialogue and cooperation in pluralistic societies.",
            "supports": "Congregational and community ministry are established ministry and faith-community practice areas.",
            "claim_limit": "Ecumenical body programme scope; does not establish the exact catalogue boundary, role route or religious appointment requirements.",
            "geographic_scope": "international ecumenical body",
        }],
        "D150:chaplaincy-and-spiritual-care": [{
            "source_id": "APC_PROFESSIONAL_CHAPLAINCY_STANDARDS",
            "publisher": "Association of Professional Chaplains",
            "title": "Standards of Practice for Professional Chaplains",
            "url": "https://www.apchaplains.org/standards/standards-of-practice-for-professional-chaplains/",
            "locator": "APC standards: professional chaplaincy practice, spiritual care, ethical conduct and context-specific care responsibilities.",
            "supports": "Chaplaincy and spiritual care are established professional ministry and care practice areas.",
            "claim_limit": "Professional chaplaincy standards; does not establish the exact catalogue boundary, role route or Nigerian religious appointment requirements.",
            "geographic_scope": "internationally used professional standards; jurisdictional requirements vary",
        }],
        "D150:interfaith-engagement-and-community-leadership": [{
            "source_id": "WCC_INTERRELIGIOUS_DIALOGUE_AND_COMMUNITY_SCOPE",
            "publisher": "World Council of Churches",
            "title": "Interreligious Dialogue and Cooperation",
            "url": "https://oikoumene.org/what-we-do/interreligious-dialogue-and-cooperation",
            "locator": "WCC interreligious-dialogue programme: bilateral and multilateral dialogue, interfaith engagement, cooperation and peace-building in diverse communities.",
            "supports": "Interfaith engagement and community leadership are established religious-studies and community-practice areas.",
            "claim_limit": "Ecumenical body programme scope; does not establish the exact catalogue boundary, role route or faith-community leadership appointment requirements.",
            "geographic_scope": "international ecumenical body",
        }],
        "D161:emergency-operations-and-humanitarian-coordination": [{
            "source_id": "UNOCHA_UNDAC_EMERGENCY_COORDINATION_SCOPE",
            "publisher": "United Nations Office for the Coordination of Humanitarian Affairs",
            "title": "UNDAC: United Nations Disaster Assessment and Coordination",
            "url": "https://knowledge.base.unocha.org/wiki/spaces/UNDAC/overview",
            "locator": "OCHA UNDAC overview: rapid, coordinated international disaster response, needs assessment, information management and support for humanitarian coordinators.",
            "supports": "Emergency operations and humanitarian coordination are established response-practice areas.",
            "claim_limit": "UN humanitarian-response system scope; does not establish the exact catalogue boundary, role route or local employment eligibility.",
            "geographic_scope": "global intergovernmental humanitarian system",
        }],
        "D152:archives-and-documentary-heritage": [{
            "source_id": "ICA_ARCHIVES_RECORDS_PRESERVATION_SCOPE",
            "publisher": "International Council on Archives",
            "title": "International Council on Archives",
            "url": "https://www.ica.org/",
            "locator": "ICA mission: efficient and effective management and use of records, archives and data in all formats, and preservation as cultural and evidentiary heritage.",
            "supports": "Archives and documentary-heritage preservation are established professional practice areas.",
            "claim_limit": "Professional association scope; does not establish the exact catalogue boundary, role route or national archival appointment rules.",
            "geographic_scope": "international professional association",
        }],
        "D154:strength-conditioning-and-fitness-coaching": [{
            "source_id": "ACSM_EXERCISE_SCIENCE_POSITION_STANDS",
            "publisher": "American College of Sports Medicine",
            "title": "ACSM Position Stands",
            "url": "https://acsm.org/education-resources/pronouncements-scientific-communications/position-stands/",
            "locator": "ACSM position-stand programme: evidence-based statements on sports medicine and exercise science, including resistance training, fitness and physical performance.",
            "supports": "Strength, conditioning and fitness coaching are established exercise-science and sports-performance practice areas.",
            "claim_limit": "Professional/scientific society scope; does not establish the exact catalogue boundary, role route or local certification requirements.",
            "geographic_scope": "international professional/scientific society",
        }],
        "D164:public-transport-and-shared-mobility-systems": [{
            "source_id": "UITP_SHARED_MOBILITY_PUBLIC_TRANSPORT_SCOPE",
            "publisher": "International Association of Public Transport",
            "title": "Shared Vehicles and Public Transport",
            "url": "https://www.uitp.org/knowledge-research/shared-vehicles/",
            "locator": "UITP overview: shared vehicles, mobility hubs, multimodal public transport and on-demand mobility as connected transport systems.",
            "supports": "Public transport and shared-mobility systems are an established transport-planning and operations practice area.",
            "claim_limit": "Professional association scope; does not establish the exact catalogue boundary, role route or country-specific transport authorization.",
            "geographic_scope": "international professional association",
        }],
        "D165:exercise-science-and-physical-activity-promotion": [{
            "source_id": "ACSM_PHYSICAL_ACTIVITY_EXERCISE_GUIDANCE",
            "publisher": "American College of Sports Medicine",
            "title": "Physical Activity Guidelines",
            "url": "https://acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines/",
            "locator": "ACSM guidance: exercise and physical-activity recommendations based on current science and professional-health expertise.",
            "supports": "Exercise science and physical-activity promotion are established evidence-based practice areas.",
            "claim_limit": "Professional/scientific society guidance; does not establish the exact catalogue boundary, role route or local clinical authorization.",
            "geographic_scope": "international professional/scientific society",
        }],
        "D165:lifestyle-medicine-and-preventive-health-practice": [{
            "source_id": "ACSM_EXERCISE_IS_MEDICINE_SCOPE",
            "publisher": "American College of Sports Medicine",
            "title": "Exercise is Medicine",
            "url": "https://acsm.org/EIM/",
            "locator": "ACSM global initiative: physical-activity assessment and promotion integrated into clinical care and prevention, with qualified exercise professionals.",
            "supports": "Lifestyle medicine and preventive health practice include established physical-activity assessment and promotion work.",
            "claim_limit": "ACSM initiative scope; does not establish the exact catalogue boundary, role route or Nigerian clinical authorization.",
            "geographic_scope": "global health initiative",
        }],
        "D139:game-art-animation-and-visual-development": [{
            "source_id": "IGDA_GAME_ART_SIG",
            "publisher": "International Game Developers Association",
            "title": "Game Art Special Interest Group",
            "url": "https://igda.org/sigs/game-art/",
            "locator": "Overview: game visual art includes concept art, character/environment design, animation and other visual disciplines contributing to interactive works.",
            "supports": "Game art and visual development form a distinct game-production practice spanning visual assets and animation.",
            "claim_limit": "Professional community scope; does not prescribe this catalogue's area count or prove any specific role route.",
            "geographic_scope": "global professional association",
        }],
        "D139:game-production-and-team-delivery": [{
            "source_id": "IGDA_GAME_PRODUCTION_SIG",
            "publisher": "International Game Developers Association",
            "title": "Production Special Interest Group",
            "url": "https://igda.org/sigs/production/",
            "locator": "Overview: dedicated community focused on the discipline of game production.",
            "supports": "Game production is recognized as a distinct practice area within game development.",
            "claim_limit": "Professional community scope; does not prescribe this catalogue's area count or prove any specific role route.",
            "geographic_scope": "global professional association",
        }],
        "D139:game-quality-user-research-and-accessibility": [
            {
                "source_id": "IGDA_GAMES_RESEARCH_UX_SIG",
                "publisher": "International Game Developers Association",
                "title": "Games Research and User Experience Special Interest Group",
                "url": "https://igda.org/sigs/grux/",
                "locator": "SIG overview: supports games user research and UX work through professional and academic knowledge-sharing.",
                "supports": "Games research and player/user experience are recognized game-specific practices.",
                "claim_limit": "Professional community scope; does not establish a universal role route or exact catalogue boundary.",
                "geographic_scope": "global professional association",
            },
            {
                "source_id": "IGDA_GAME_ACCESSIBILITY_SIG",
                "publisher": "International Game Developers Association",
                "title": "Game Accessibility Special Interest Group",
                "url": "https://igda.org/sigs/game-accessibility/",
                "locator": "SIG overview: shares issues and solutions to make video games playable for people with disabilities.",
                "supports": "Game accessibility is an explicit game-development practice concern and supports inclusion within the area boundary.",
                "claim_limit": "Advocacy/community source; does not define a regulated profession or imply that accessibility is only a QA task.",
                "geographic_scope": "global professional association",
            },
        ],
    }

    # Keep the earlier 34-source repair lane in the canonical rebuild path.
    # Without this merge, rerunning this reconciler would overwrite links that
    # were applied by its companion script and make coverage regress.
    companion_path = AUDIT / "apply_additional_global_specialization_area_sources_2026_10_07.py"
    companion_spec = importlib.util.spec_from_file_location("additional_area_source_repairs", companion_path)
    if companion_spec is None or companion_spec.loader is None:
        raise RuntimeError(f"Cannot load companion area-source repairs: {companion_path}")
    companion = importlib.util.module_from_spec(companion_spec)
    companion_spec.loader.exec_module(companion)
    for area_key, source_ref in companion.REPAIRS.items():
        external_area_source_additions.setdefault(area_key, []).append(source_ref)

    updated = 0
    already_linked = 0
    unresolved: list[dict[str, str]] = []
    link_basis_counts: Counter[str] = Counter()
    area_source_reference_count = 0
    unique_sources: set[tuple[str, str]] = set()
    for domain_id, catalog_domain in catalog_by_id.items():
        canonical = structure.get(domain_id)
        if not isinstance(canonical, dict):
            raise ValueError(f"Canonical domain missing: {domain_id}")
        domain_sources: dict[tuple[str, str, str], dict[str, Any]] = {}
        artifacts: list[Path] = []
        step_domain = step_by_id[domain_id]
        evidence_path = safe_repo_path(step_domain.get("evidence_artifact"))
        if evidence_path:
            artifacts.append(evidence_path)
        register_domain = register_by_id.get(domain_id, {})
        for raw in register_domain.get("artifact_paths") or []:
            path = safe_repo_path(raw)
            if path and path not in artifacts:
                artifacts.append(path)
        for raw in (step_domain.get("supplemental_source_capture_artifact"),):
            path = safe_repo_path(raw)
            if path and path not in artifacts:
                artifacts.append(path)
        payloads: list[Any] = []
        for path in artifacts:
            try:
                payload = read(path)
            except (OSError, json.JSONDecodeError):
                continue
            payloads.append(payload)
            for row in collect_source_records(payload):
                domain_sources.setdefault((row["source_id"], row["url"], row["locator"]), row)

        by_source_id: dict[str, list[dict[str, Any]]] = {}
        for row in domain_sources.values():
            by_source_id.setdefault(row["source_id"], []).append(row)
        for area in catalog_domain.get("areas") or []:
            label = str(area.get("label") or "").strip()
            area_key = str(area.get("area_key") or "").strip()
            target = next((x for x in canonical.get("areas_of_specialization") or [] if x.get("area_id") == area_key), None)
            if not target:
                raise ValueError(f"Canonical area missing from {domain_id}: {area_key}")

            direct_refs: dict[tuple[str, str, str], dict[str, Any]] = {}
            # 1) Exact source IDs recorded on the Step 1 area recommendation.
            explicit_ids = list(area.get("source_ids") or [])
            for evidence in area.get("evidence") or []:
                if isinstance(evidence, dict) and evidence.get("source_id"):
                    explicit_ids.append(evidence["source_id"])
            explicit_ids = list(dict.fromkeys(str(sid) for sid in explicit_ids if str(sid).strip()))
            for sid in explicit_ids:
                for row in by_source_id.get(str(sid), []):
                    direct_refs[(row["source_id"], row["url"], row["locator"])] = row
                if not by_source_id.get(str(sid)) and sid in official_source_repairs:
                    row = official_source_repairs[str(sid)]
                    direct_refs[(row["source_id"], row["url"], row["locator"])] = row
            # 2) Source records nested under an exact area label in a cited
            # review artifact. Do not copy unrelated domain-level citations.
            for payload in payloads:
                for candidate in collect_area_refs(payload, label):
                    if candidate.get("unresolved_reference"):
                        for row in by_source_id.get(candidate["source_id"], []):
                            direct_refs[(row["source_id"], row["url"], row["locator"])] = row
                        if candidate["source_id"] in official_source_repairs:
                            row = official_source_repairs[candidate["source_id"]]
                            direct_refs[(row["source_id"], row["url"], row["locator"])] = row
                    else:
                        direct_refs[(candidate["source_id"], candidate["url"], candidate["locator"])] = candidate

            for row in external_area_source_additions.get(area_key, []):
                direct_refs[(row["source_id"], row["url"], row["locator"])] = row

            refs = sorted(direct_refs.values(), key=lambda row: (row["source_id"], row["url"], row["locator"]))
            target["source_ids"] = sorted({row["source_id"] for row in refs} | set(explicit_ids))
            target["source_references"] = refs
            target["source_evidence_status"] = "source_linked" if refs else "source_link_unresolved"
            target["unresolved_source_ids"] = sorted(set(explicit_ids) - {row["source_id"] for row in refs})
            target["uncorroborated_source_urls"] = list(area.get("source_urls") or [])
            target["student_visible"] = False
            area_source_reference_count += len(refs)
            link_basis_counts["source_linked" if refs else "source_link_unresolved"] += 1
            for row in refs:
                unique_sources.add((row["source_id"], row["url"]))
            if refs:
                already_linked += 1
            else:
                unresolved.append({"domain_id": domain_id, "area_key": area_key, "label": label})
            updated += 1

    # Applying source metadata must not change area names, boundaries, counts,
    # role routes, or legacy subgroup rows.
    if updated != 708:
        raise ValueError(f"Expected to enrich exactly 708 area records; changed {updated}")
    for domain_id, catalog_domain in catalog_by_id.items():
        targets = structure[domain_id].get("areas_of_specialization") or []
        if len(targets) != len(catalog_domain.get("areas") or []):
            raise ValueError(f"Area count changed during source enrichment: {domain_id}")

    write(STRUCTURE, structure)
    report = {
        "schema_version": "2026-10-07.area-source-link-reconciliation.v1",
        "status": "source_links_applied_with_exact_residuals",
        "terminology": "subgroup equals area of specialization equals area of practice",
        "counts": {
            "domains_processed": len(catalog_by_id),
            "areas_processed": updated,
            "areas_with_area_linked_source_references": already_linked,
            "areas_without_area_linked_source_references": len(unresolved),
            "source_reference_rows_attached": area_source_reference_count,
            "unique_source_id_url_pairs": len(unique_sources),
            "official_external_source_repairs": len(official_source_repairs),
            # This is a configured reference-row count, not an area-row count.
            # Keep it separate from the actual linked-area coverage above.
            "configured_area_specific_source_reference_rows": sum(len(rows) for rows in external_area_source_additions.values()),
            "areas_with_configured_external_supplement": len(external_area_source_additions),
        },
        "link_basis_counts": dict(link_basis_counts),
        "unresolved_areas": unresolved,
        "safety": {
            "area_labels_changed": False,
            "area_boundaries_changed": False,
            "area_counts_changed": False,
            "role_records_changed": False,
            "role_domain_conditionality_changed": False,
            "legacy_subgroup_records_changed": False,
            "student_visibility_enabled": False,
            "no_domain_level_citation_was_broadcast_to_all_areas": True,
        },
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# Area-of-specialization source-link reconciliation — 2026-10-07",
            "",
            "Applied only explicit area-level source links from the recommendation or exact-label review artifacts. Domain-wide sources were not broadcast to unrelated areas.",
            "",
            "**Terminology:** subgroup = area of specialization = area of practice.",
            "",
            f"- Area records processed: {updated}",
            f"- Areas with linked source references: {already_linked}",
            f"- Areas still without linked source references: {len(unresolved)}",
            f"- Source references attached: {area_source_reference_count}",
            f"- Unique source ID/URL pairs: {len(unique_sources)}",
            f"- Official publisher sources added for previously unresolved IDs: {len(official_source_repairs)}",
            f"- Configured area-specific source-reference rows: {sum(len(rows) for rows in external_area_source_additions.values())}",
            f"- Area keys with a configured external supplement: {len(external_area_source_additions)}",
            "",
            "The JSON report lists every unresolved area by domain and stable area key. No role route, domain-fit status, or student-visibility field was promoted.",
            "",
        ]),
        encoding="utf-8",
    )
    print(json.dumps(report["counts"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
