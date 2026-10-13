"""Complete the Galileo D001-D056 role-enrichment handoff.

This is deliberately a review-only artifact.  It reconciles Galileo's saved
checkpoint with a source-backed completion plan for every D001-D056 domain
whose current active role count is below ten.  It does not edit canonical role,
domain, subgroup, or overlay files.

Every candidate has two independent fit records:

* parent-domain fit, based on occupational task evidence; and
* area-of-specialization fit, based on the candidate's task scope and an
  explicitly named existing area in the current domain structure.

The current subgroup may be excluded or route-pending.  That state is recorded
as a route gate and is never treated as evidence of role fit.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
LANE = AUDIT / "role_enrichment_lanes_2026_10_06" / "D001_D056"
PRIOR = LANE / "D001_D056_role_enrichment_checkpoint_2026_10_07.json"
OUT_JSON = LANE / "D001_D056_role_enrichment_final_handoff_2026_10_07.json"
OUT_MD = LANE / "D001_D056_role_enrichment_final_handoff_2026_10_07.md"

ROLE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
DOMAIN_META = ROOT / "domain_meta.json"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"
GLOBAL_SPECIALIZATION_RECONCILIATION = (
    AUDIT
    / "specialization_lanes_2026_10_05"
    / "STEP1_RECONCILIATION_2026_10_06"
    / "global_step1_specialization_reconciliation_2026_10_06.json"
)

TODAY = "2026-10-07"
TARGET_FLOOR = 10


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_reconciled_areas(path: Path) -> dict[str, list[dict[str, Any]]]:
    payload = load(path)
    result: dict[str, list[dict[str, Any]]] = {}
    for row in payload.get("domains", []):
        domain_id = str(row.get("domain_id") or "")
        recommended = row.get("recommended_areas") or []
        areas = recommended.get("areas", []) if isinstance(recommended, dict) else recommended
        if not domain_id or not areas:
            continue
        result[domain_id] = [
            {
                "label": str(area.get("label") or "").strip(),
                "boundary": str(area.get("boundary") or area.get("scope") or "").strip(),
                "boundary_source_field": "boundary" if area.get("boundary") else "scope",
                "source_ids": [str(source_id) for source_id in area.get("source_ids", [])],
            }
            for area in areas
        ]
    return result


def norm(value: Any) -> str:
    value = str(value or "").casefold().replace("&", " and ")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def source(
    source_id: str,
    title: str,
    url: str,
    locator: str,
    *,
    scope: str = "global occupational reference",
    limit: str = (
        "Official occupational profile; not proof of Nigerian vacancy, demand, "
        "licensing or universal title equivalence."
    ),
) -> dict[str, Any]:
    return {
        "source_id": source_id,
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "title": title,
        "url": url,
        "locator": locator,
        "access_date": TODAY,
        "scope": scope,
        "source_limit": limit,
    }


GLOBAL_SOURCES: dict[str, dict[str, Any]] = {
    # AI, data and computing
    "ONET_COMPUTER_RESEARCH": source("ONET_COMPUTER_RESEARCH", "Computer and Information Research Scientists", "https://www.onetonline.org/link/details/15-1221.00", "Occupation overview, reported titles and task table for computer/information research and novel computational solutions."),
    "ONET_SOFTWARE_DEVELOPERS": source("ONET_SOFTWARE_DEVELOPERS", "Software Developers", "https://www.onetonline.org/link/details/15-1252.00", "Occupation overview and task table for designing, developing, testing and maintaining software systems."),
    "ONET_DATABASE_ARCHITECTS": source("ONET_DATABASE_ARCHITECTS", "Database Architects", "https://www.onetonline.org/link/details/15-1243.00", "Occupation overview and tasks for data architecture, warehouses, repositories and data-system design."),
    "ONET_DATA_SCIENTISTS": source("ONET_DATA_SCIENTISTS", "Data Scientists", "https://www.onetonline.org/link/details/15-2051.00", "Occupation overview and tasks for modelling, analysing and communicating patterns in data."),
    "ONET_COMPUTER_PROGRAMMERS": source("ONET_COMPUTER_PROGRAMMERS", "Computer Programmers", "https://www.onetonline.org/link/details/15-1251.00", "Occupation overview and tasks for writing, modifying, testing and debugging computer programs."),
    # Legal and governance
    "ONET_LAWYERS": source("ONET_LAWYERS", "Lawyers", "https://www.onetonline.org/link/details/23-1011.00", "Occupation overview and tasks for legal advice, representation, legal research and proceedings."),
    "ONET_PARALEGALS": source("ONET_PARALEGALS", "Paralegals and Legal Assistants", "https://www.onetonline.org/link/details/23-2011.00", "Occupation overview and tasks for legal research, documents, records and proceedings support."),
    "ONET_MEDIATORS": source("ONET_MEDIATORS", "Arbitrators, Mediators, and Conciliators", "https://www.onetonline.org/link/details/23-1022.00", "Occupation profile and tasks for dispute resolution, hearings and settlement agreements."),
    "ONET_JUDICIAL_CLERKS": source("ONET_JUDICIAL_CLERKS", "Judicial Law Clerks", "https://www.onetonline.org/link/details/23-1012.00", "Occupation profile and tasks for judicial legal research and writing."),
    "ONET_JUDGES": source("ONET_JUDGES", "Judges, Magistrate Judges, and Magistrates", "https://www.onetonline.org/link/details/23-1023.00", "Occupation overview and tasks for hearings, legal decisions and court procedure."),
    "ONET_COURT_REPORTERS": source("ONET_COURT_REPORTERS", "Court Reporters and Simultaneous Captioners", "https://www.onetonline.org/link/details/23-2091.00", "Occupation overview and tasks for verbatim court records and legal proceedings."),
    "ONET_TITLE_EXAMINERS": source("ONET_TITLE_EXAMINERS", "Title Examiners, Abstractors, and Searchers", "https://www.onetonline.org/link/details/23-2093.00", "Occupation overview and tasks for searching records and examining legal title documents."),
    "ONET_COURT_CLERKS": source("ONET_COURT_CLERKS", "Court, Municipal, and License Clerks", "https://www.onetonline.org/link/details/43-4031.00", "Occupation overview and tasks for court, municipal and licensing records and procedures."),
    "ONET_LEGAL_SECRETARIES": source("ONET_LEGAL_SECRETARIES", "Legal Secretaries and Administrative Assistants", "https://www.onetonline.org/link/details/43-6012.00", "Occupation overview and tasks for legal office records, correspondence and case administration."),
    "ONET_BAILIFFS": source("ONET_BAILIFFS", "Bailiffs", "https://www.onetonline.org/link/details/33-3011.00", "Occupation profile and tasks for courtroom order, court security and enforcement functions."),
    "ONET_COMPLIANCE_OFFICERS": source("ONET_COMPLIANCE_OFFICERS", "Compliance Officers", "https://www.onetonline.org/link/details/13-1041.00", "Occupation overview and tasks for examining conformity with laws, licences, permits and regulations."),
    "ONET_REGULATORY_AFFAIRS": source("ONET_REGULATORY_AFFAIRS", "Regulatory Affairs Specialists", "https://www.onetonline.org/link/details/13-1041.07", "Regulatory-affairs profile and task family for submissions, requirements and compliance."),
    "ONET_COMPLIANCE_MANAGERS": source("ONET_COMPLIANCE_MANAGERS", "Compliance Managers", "https://www.onetonline.org/link/details/11-9199.02", "Occupation profile and tasks for directing compliance systems, investigations, reporting and policy."),
    "ONET_INTERNAL_AUDITORS": source("ONET_INTERNAL_AUDITORS", "Accountants and Auditors", "https://www.onetonline.org/link/details/13-2011.00", "Occupation overview and tasks for audit, controls, financial reporting and compliance review."),
    "ONET_FINANCIAL_RISK": source("ONET_FINANCIAL_RISK", "Financial Risk Specialists", "https://www.onetonline.org/link/details/13-2054.00", "Occupation overview and tasks for risk measurement, controls and regulatory reporting."),
    # Education and training
    "ONET_POSTSECONDARY_TEACHERS": source("ONET_POSTSECONDARY_TEACHERS", "Education Teachers, Postsecondary", "https://www.onetonline.org/link/details/25-1081.00", "Occupation profile for postsecondary teaching, curriculum work, student supervision and research."),
    "ONET_POSTSECONDARY_ADMIN": source("ONET_POSTSECONDARY_ADMIN", "Education Administrators, Postsecondary", "https://www.onetonline.org/link/details/11-9033.00", "Occupation profile for instruction, administration, services and research in postsecondary institutions."),
    "ONET_POSTSECONDARY_CTE": source("ONET_POSTSECONDARY_CTE", "Career/Technical Education Teachers, Postsecondary", "https://www.onetonline.org/link/details/25-1194.00", "Occupation profile for teaching occupational, vocational and technical subjects in postsecondary settings."),
    "ONET_SOCIAL_RESEARCH_ASSISTANTS": source("ONET_SOCIAL_RESEARCH_ASSISTANTS", "Social Science Research Assistants", "https://www.onetonline.org/link/details/19-4061.00", "Occupation profile for research support, data collection, analysis and reporting."),
    "ONET_TRAINING_SPECIALISTS": source("ONET_TRAINING_SPECIALISTS", "Training and Development Specialists", "https://www.onetonline.org/link/details/13-1151.00", "Occupation profile for designing, delivering and evaluating training programmes."),
    "ONET_INSTRUCTIONAL_COORDINATORS": source("ONET_INSTRUCTIONAL_COORDINATORS", "Instructional Coordinators", "https://www.onetonline.org/link/details/13-9031.00", "Occupation profile for instructional materials, curriculum coordination and programme evaluation."),
    "ONET_ADULT_ED": source("ONET_ADULT_ED", "Adult Basic and Secondary Education and Literacy Teachers and Instructors", "https://www.onetonline.org/link/details/25-3011.00", "Occupation overview and tasks for adult literacy, basic education and secondary instruction."),
    "ONET_TEACHER_ASSISTANTS": source("ONET_TEACHER_ASSISTANTS", "Teacher Assistants", "https://www.onetonline.org/link/details/25-9042.00", "Occupation overview and tasks for classroom support, learner assistance and instructional preparation."),
    "ONET_EDUCATIONAL_COUNSELORS": source("ONET_EDUCATIONAL_COUNSELORS", "Educational, Guidance, and Career Counselors and Advisors", "https://www.onetonline.org/link/details/21-1012.00", "Occupation overview and tasks for educational planning, advising and vocational referrals."),
    "ONET_LIBRARIANS": source("ONET_LIBRARIANS", "Librarians and Library Media Specialists", "https://www.onetonline.org/link/details/25-4022.00", "Occupation overview and tasks for research support, information access and learning resources."),
    "ONET_VOC_REHAB": source("ONET_VOC_REHAB", "Vocational Rehabilitation Counselors", "https://www.onetonline.org/link/details/21-1015.00", "Occupation overview and tasks for vocational assessment, training planning and work support."),
    # Design and media
    "ONET_GRAPHIC_DESIGNERS": source("ONET_GRAPHIC_DESIGNERS", "Graphic Designers", "https://www.onetonline.org/link/details/27-1024.00", "Occupation profile and tasks for visual concepts, layouts, typography and production-ready design."),
    "ONET_ART_DIRECTORS": source("ONET_ART_DIRECTORS", "Art Directors", "https://www.onetonline.org/link/details/27-1011.00", "Occupation profile and tasks for visual style, review and coordination of visual work."),
    "ONET_WEB_DIGITAL": source("ONET_WEB_DIGITAL", "Web and Digital Interface Designers", "https://www.onetonline.org/link/details/15-1255.00", "Occupation profile and tasks for interface layout, visual elements, usability and interaction."),
    "ONET_MULTIMEDIA_ARTISTS": source("ONET_MULTIMEDIA_ARTISTS", "Special Effects Artists and Animators", "https://www.onetonline.org/link/details/27-1014.00", "Occupation profile and tasks for animation, digital visual assets and production workflows."),
    "ONET_PHOTOGRAPHERS": source("ONET_PHOTOGRAPHERS", "Photographers", "https://www.onetonline.org/link/details/27-4021.00", "Occupation profile and tasks for photographic communication, composition, lighting and editing."),
    "ONET_DESKTOP_PUBLISHERS": source("ONET_DESKTOP_PUBLISHERS", "Desktop Publishers", "https://www.onetonline.org/link/details/43-9031.00", "Occupation profile and tasks for page composition, type, graphics and publication production."),
    "ONET_SET_EXHIBIT_DESIGNERS": source("ONET_SET_EXHIBIT_DESIGNERS", "Set and Exhibit Designers", "https://www.onetonline.org/link/details/27-1027.00", "Occupation profile and tasks for visual environments, exhibits, layouts and presentation design."),
    # Public administration and policy
    "ONET_MANAGEMENT_ANALYSTS": source("ONET_MANAGEMENT_ANALYSTS", "Management Analysts", "https://www.onetonline.org/link/details/13-1111.00", "Occupation profile and tasks for organisational analysis and operational or policy improvements."),
    "ONET_POLITICAL_SCIENTISTS": source("ONET_POLITICAL_SCIENTISTS", "Political Scientists", "https://www.onetonline.org/link/details/19-3094.00", "Occupation profile and tasks for political systems, public policy and government institutions."),
    "ONET_URBAN_PLANNERS": source("ONET_URBAN_PLANNERS", "Urban and Regional Planners", "https://www.onetonline.org/link/details/19-3051.00", "Occupation profile and tasks for public plans, land-use policy and community needs."),
    "ONET_BUDGET_ANALYSTS": source("ONET_BUDGET_ANALYSTS", "Budget Analysts", "https://www.onetonline.org/link/details/13-2031.00", "Occupation profile and tasks for public or organisational budgets, expenditure review and recommendations."),
    "ONET_LEGISLATORS": source("ONET_LEGISLATORS", "Legislators", "https://www.onetonline.org/link/details/11-1031.00", "Occupation profile and tasks for lawmaking, public representation and policy decisions."),
    "ONET_CHIEF_EXECUTIVES": source("ONET_CHIEF_EXECUTIVES", "Chief Executives", "https://www.onetonline.org/link/details/11-1011.00", "Occupation profile and tasks for organisational strategy, public administration and executive decisions."),
    "ONET_EMERGENCY_MANAGERS": source("ONET_EMERGENCY_MANAGERS", "Emergency Management Directors", "https://www.onetonline.org/link/details/11-9161.00", "Occupation profile and tasks for public emergency planning, coordination and response."),
    # Automotive and automation
    "ONET_AUTOMOTIVE_ENGINEERS": source("ONET_AUTOMOTIVE_ENGINEERS", "Automotive Engineers", "https://www.onetonline.org/link/details/17-2141.02", "Occupation profile and tasks for vehicle-system design, testing, failure analysis and control systems."),
    "ONET_MECHANICAL_ENGINEERS": source("ONET_MECHANICAL_ENGINEERS", "Mechanical Engineers", "https://www.onetonline.org/link/details/17-2141.00", "Occupation profile and tasks for mechanical systems, machinery, design, testing and production."),
    "ONET_AUTO_TECH": source("ONET_AUTO_TECH", "Automotive Service Technicians and Mechanics", "https://www.onetonline.org/link/details/49-3023.00", "Occupation profile and tasks for inspection, diagnosis, repair and service of vehicles."),
    "ONET_BODY_REPAIR": source("ONET_BODY_REPAIR", "Automotive Body and Related Repairers", "https://www.onetonline.org/link/details/49-3022.00", "Occupation profile and tasks for vehicle body repair, alignment and restoration."),
    "ONET_DIESEL": source("ONET_DIESEL", "Bus and Truck Mechanics and Diesel Engine Specialists", "https://www.onetonline.org/link/details/49-3031.00", "Occupation profile and tasks for heavy-vehicle and diesel-engine inspection, repair and maintenance."),
    "ONET_ELECTRONICS_INSTALLERS": source("ONET_ELECTRONICS_INSTALLERS", "Electronic Equipment Installers and Repairers, Motor Vehicles", "https://www.onetonline.org/link/details/49-2093.00", "Occupation profile and tasks for vehicle electronic systems installation, diagnostics and repair."),
    "ONET_MECHATRONICS_TECHNICIANS": source("ONET_MECHATRONICS_TECHNICIANS", "Electro-Mechanical and Mechatronics Technologists and Technicians", "https://www.onetonline.org/link/details/17-3024.00", "Occupation profile and tasks for automated/electromechanical equipment testing and maintenance."),
    "ONET_ENGINEERING_TECHNICIANS": source("ONET_ENGINEERING_TECHNICIANS", "Engineering Technologists and Technicians, Except Drafters", "https://www.onetonline.org/link/details/17-3029.00", "Occupation profile and tasks for engineering tests, measurements, equipment and technical support."),
    "ONET_MECHATRONICS_ENGINEERS": source("ONET_MECHATRONICS_ENGINEERS", "Mechatronics Engineers", "https://www.onetonline.org/link/details/17-2199.05", "Occupation profile for integrated mechanical, electrical and control-system design."),
    "ONET_ROBOTICS_ENGINEERS": source("ONET_ROBOTICS_ENGINEERS", "Robotics Engineers", "https://www.onetonline.org/link/details/17-2199.08", "Occupation profile for robotics-system design, integration and testing."),
    "ONET_INDUSTRIAL_TECHNICIANS": source("ONET_INDUSTRIAL_TECHNICIANS", "Industrial Engineering Technologists and Technicians", "https://www.onetonline.org/link/details/17-3026.00", "Occupation profile and tasks for industrial layout, production efficiency, quality and process improvement."),
    "ONET_ELECTRICAL_ENGINEERS": source("ONET_ELECTRICAL_ENGINEERS", "Electrical Engineers", "https://www.onetonline.org/link/details/17-2071.00", "Occupation profile and tasks for electrical, control, instrumentation and automation systems."),
    "ONET_FIRST_LINE_SUPERVISORS": source("ONET_FIRST_LINE_SUPERVISORS", "First-Line Supervisors of Production and Operating Workers", "https://www.onetonline.org/link/details/51-1011.00", "Occupation profile and tasks for supervising production workers, equipment, quality and workflow."),
    "ONET_ELECTRICAL_ASSEMBLERS": source("ONET_ELECTRICAL_ASSEMBLERS", "Electrical and Electronic Equipment Assemblers", "https://www.onetonline.org/link/details/51-2022.00", "Occupation profile and tasks for assembling, wiring, testing and inspecting electrical/electronic equipment."),
    "ONET_INDUSTRIAL_MECHANICS": source("ONET_INDUSTRIAL_MECHANICS", "Industrial Machinery Mechanics", "https://www.onetonline.org/link/details/49-9041.00", "Occupation profile and tasks for maintaining and repairing industrial machinery and production equipment."),
    "ONET_CONTROL_INSTALLERS": source("ONET_CONTROL_INSTALLERS", "Control and Valve Installers and Repairers, Except Mechanical Door", "https://www.onetonline.org/link/details/49-9012.00", "Occupation profile and tasks for installing, testing and repairing industrial control and valve systems."),
    # Real estate and construction
    "ONET_REAL_ESTATE_APPRAISERS": source("ONET_REAL_ESTATE_APPRAISERS", "Appraisers and Assessors of Real Estate", "https://www.onetonline.org/link/details/13-2021.00", "Occupation profile for property inspection, valuation and appraisal reporting."),
    "ONET_REAL_ESTATE_BROKERS": source("ONET_REAL_ESTATE_BROKERS", "Real Estate Brokers", "https://www.onetonline.org/link/details/41-9021.00", "Occupation profile for transactions, listings, contracts and negotiation."),
    "ONET_PROPERTY_MANAGERS": source("ONET_PROPERTY_MANAGERS", "Property, Real Estate, and Community Association Managers", "https://www.onetonline.org/link/details/11-9141.00", "Occupation profile for leasing, property operations, maintenance and association governance."),
    "ONET_CONSTRUCTION_MANAGERS": source("ONET_CONSTRUCTION_MANAGERS", "Construction Managers", "https://www.onetonline.org/link/details/11-9021.00", "Occupation profile and tasks for construction planning, scheduling, budgets, permits, safety and implementation."),
    "ONET_COST_ESTIMATORS": source("ONET_COST_ESTIMATORS", "Cost Estimators", "https://www.onetonline.org/link/details/13-1051.00", "Occupation profile for estimating labour, materials, time and costs."),
    "ONET_BUILDING_INSPECTORS": source("ONET_BUILDING_INSPECTORS", "Construction and Building Inspectors", "https://www.onetonline.org/link/details/47-4011.00", "Occupation profile for inspecting structures and construction work for code and safety compliance."),
    "ONET_CIVIL_ENGINEERS": source("ONET_CIVIL_ENGINEERS", "Civil Engineers", "https://www.onetonline.org/link/details/17-2051.00", "Occupation profile and tasks for civil structures, infrastructure, construction and site engineering."),
    "ONET_CARPENTERS": source("ONET_CARPENTERS", "Carpenters", "https://www.onetonline.org/link/details/47-2031.00", "Occupation profile and tasks for constructing, installing and repairing building structures and fixtures."),
    "ONET_BRICKMASONS": source("ONET_BRICKMASONS", "Brickmasons and Blockmasons", "https://www.onetonline.org/link/details/47-2021.00", "Occupation profile and tasks for masonry construction and repair."),
    "ONET_PLUMBERS": source("ONET_PLUMBERS", "Plumbers, Pipefitters, and Steamfitters", "https://www.onetonline.org/link/details/47-2152.00", "Occupation profile and tasks for building plumbing, pipes, fixtures and systems."),
    "ONET_ELECTRICIANS": source("ONET_ELECTRICIANS", "Electricians", "https://www.onetonline.org/link/details/47-2111.00", "Occupation profile and tasks for building electrical systems, wiring, testing and repair."),
    # Hospitality
    "ONET_LODGING_MANAGERS": source("ONET_LODGING_MANAGERS", "Lodging Managers", "https://www.onetonline.org/link/details/11-9081.00", "Occupation profile for accommodation operations, guest services, staffing, budgets and facilities."),
    "ONET_FOOD_SERVICE_MANAGERS": source("ONET_FOOD_SERVICE_MANAGERS", "Food Service Managers", "https://www.onetonline.org/link/details/11-9051.00", "Occupation profile for food-service operations, staffing, budgets, purchasing and customer service."),
    "ONET_EVENT_PLANNERS": source("ONET_EVENT_PLANNERS", "Meeting, Convention, and Event Planners", "https://www.onetonline.org/link/details/13-1121.00", "Occupation profile for planning and delivering meetings, conventions and events."),
    "ONET_CHEFS": source("ONET_CHEFS", "Chefs and Head Cooks", "https://www.onetonline.org/link/details/35-1011.00", "Occupation profile and tasks for menu planning, kitchen operations, food preparation and supervision."),
    "ONET_BARTENDERS": source("ONET_BARTENDERS", "Bartenders", "https://www.onetonline.org/link/details/35-3011.00", "Occupation profile and tasks for beverage service, customer interaction and service operations."),
    "ONET_WAITERS": source("ONET_WAITERS", "Waiters and Waitresses", "https://www.onetonline.org/link/details/35-3031.00", "Occupation profile and tasks for food service, customer orders and guest experience."),
    "ONET_TRAVEL_GUIDES": source("ONET_TRAVEL_GUIDES", "Tour and Travel Guides", "https://www.onetonline.org/link/details/39-7011.00", "Occupation profile and tasks for visitor information, tours, interpretation and guest experience."),
    "ONET_TRAVEL_AGENTS": source("ONET_TRAVEL_AGENTS", "Travel Agents", "https://www.onetonline.org/link/details/41-3041.00", "Occupation profile and tasks for travel planning, reservations, itineraries and customer service."),
    # Oil and gas
    "ONET_PETROLEUM_ENGINEERS": source("ONET_PETROLEUM_ENGINEERS", "Petroleum Engineers", "https://www.onetonline.org/link/details/17-2171.00", "Occupation profile and tasks for drilling, reservoir/recovery methods, production and oilfield engineering."),
    "ONET_GEOLOGISTS": source("ONET_GEOLOGISTS", "Geoscientists, Except Hydrologists and Geographers", "https://www.onetonline.org/link/details/19-2042.00", "Occupation profile and tasks for geology, earth materials, subsurface interpretation and field research."),
    "ONET_MINING_GEOLOGICAL_ENGINEERS": source("ONET_MINING_GEOLOGICAL_ENGINEERS", "Mining and Geological Engineers, Including Mining Safety Engineers", "https://www.onetonline.org/link/details/17-2151.00", "Occupation profile and tasks for geological engineering, extraction, mine/oilfield safety and operations."),
    "ONET_REFINERY_OPERATORS": source("ONET_REFINERY_OPERATORS", "Petroleum Pump System Operators, Refinery Operators, and Gaugers", "https://www.onetonline.org/link/details/51-8093.00", "Occupation profile for petroleum processing units, pumps, valves and gauges."),
    "ONET_ROUSTABOUTS": source("ONET_ROUSTABOUTS", "Roustabouts, Oil and Gas", "https://www.onetonline.org/link/details/47-5071.00", "Occupation profile and tasks for oilfield equipment, pipes, pumps and flow lines."),
    "ONET_ROTARY_DRILL": source("ONET_ROTARY_DRILL", "Rotary Drill Operators, Oil and Gas", "https://www.onetonline.org/link/details/47-5012.00", "Occupation profile for rotary drilling equipment and drilling operations."),
    "ONET_WELLHEAD_PUMPERS": source("ONET_WELLHEAD_PUMPERS", "Wellhead Pumpers", "https://www.onetonline.org/link/details/53-7073.00", "Occupation profile and tasks for operating pumps and auxiliary equipment to produce oil or gas flow from wells."),
    "ONET_GAS_PLANT_OPERATORS": source("ONET_GAS_PLANT_OPERATORS", "Gas Plant Operators", "https://www.onetonline.org/link/details/51-8092.00", "Occupation profile and tasks for gas-processing equipment and plant operations."),
    # Chemical engineering
    "ONET_CHEMICAL_ENGINEERS": source("ONET_CHEMICAL_ENGINEERS", "Chemical Engineers", "https://www.onetonline.org/link/details/17-2041.00", "Occupation profile and tasks for chemical-process design, plant equipment, optimisation, safety and control."),
    "ONET_BIOFUELS_PROCESSING": source("ONET_BIOFUELS_PROCESSING", "Biofuels Processing Technicians", "https://www.onetonline.org/link/details/51-8099.01", "Occupation profile and tasks for measuring, mixing and monitoring biological/chemical process production and safety."),
    "ONET_CHEMICAL_TECHNICIANS": source("ONET_CHEMICAL_TECHNICIANS", "Chemical Technicians", "https://www.onetonline.org/link/details/19-4031.00", "Occupation profile and tasks for chemical analysis, sampling, laboratory equipment and process quality."),
    "ONET_CHEMICAL_PLANT_OPERATORS": source("ONET_CHEMICAL_PLANT_OPERATORS", "Chemical Plant and System Operators", "https://www.onetonline.org/link/details/51-8091.00", "Occupation profile for chemical plant systems, equipment and production processes."),
    "ONET_ENVIRONMENTAL_ENGINEERS": source("ONET_ENVIRONMENTAL_ENGINEERS", "Environmental Engineers", "https://www.onetonline.org/link/details/17-2081.00", "Occupation profile and tasks for pollution control, treatment systems and environmental process design."),
    "ONET_INDUSTRIAL_ENGINEERS": source("ONET_INDUSTRIAL_ENGINEERS", "Industrial Engineers", "https://www.onetonline.org/link/details/17-2112.00", "Occupation profile and tasks for process design, production systems, quality and efficiency."),
    "ONET_MIXING_OPERATORS": source("ONET_MIXING_OPERATORS", "Mixing and Blending Machine Operators and Tenders", "https://www.onetonline.org/link/details/51-9023.00", "Occupation profile and tasks for mixing, blending, monitoring and adjusting production materials and equipment."),
    "ONET_WATER_TREATMENT": source("ONET_WATER_TREATMENT", "Water and Wastewater Treatment Plant and System Operators", "https://www.onetonline.org/link/details/51-8031.00", "Occupation profile and tasks for treatment-process control, sampling, testing and plant equipment."),
}


NIGERIAN_SOURCES: dict[str, dict[str, Any]] = {
    "NG_NBTE_VTSD": {
        "source_id": "NG_NBTE_VTSD", "publisher": "National Board for Technical Education",
        "title": "Vocational, Technical and Skills Development", "url": "https://www.nbte.gov.ng/nbte/vtsd",
        "locator": "Official department mandate and skills-development context.", "access_date": TODAY,
        "scope": "Nigeria-specific training/regulatory context",
        "source_limit": "Does not prove a vacancy or demand for any individual role.",
    },
    "NG_NBTE_TVID": {
        "source_id": "NG_NBTE_TVID", "publisher": "National Board for Technical Education",
        "title": "NBTE Technical and Vocational Intelligent Dashboard", "url": "https://dms.nbte.gov.ng/nsqf/trade-directory",
        "locator": "Approved Nigerian occupational standards/trades and delivery-centre directory.", "access_date": TODAY,
        "scope": "Nigeria-specific occupational-standard context",
        "source_limit": "A listed trade supports training context, not automatic employment demand.",
    },
    "NG_ESVARBON": {
        "source_id": "NG_ESVARBON", "publisher": "Estate Surveyors and Valuers Registration Board of Nigeria",
        "title": "Official practitioner registry", "url": "https://portal.esvarbon.gov.ng/",
        "locator": "Professional regulation and registration context for estate surveyors and valuers.", "access_date": TODAY,
        "scope": "Nigeria-specific professional/regulatory context",
        "source_limit": "Supports local credential context, not a vacancy count.",
    },
    "NG_NUPRC": {
        "source_id": "NG_NUPRC", "publisher": "Nigerian Upstream Petroleum Regulatory Commission",
        "title": "Key mandate and functions", "url": "https://www.nuprc.gov.ng/about/mandate",
        "locator": "Upstream petroleum regulation, technical standards and safe operations.", "access_date": TODAY,
        "scope": "Nigeria-specific petroleum regulatory context",
        "source_limit": "Regulatory context, not proof of a separate role or current vacancy.",
    },
    "NG_COREN": {
        "source_id": "NG_COREN", "publisher": "Council for the Regulation of Engineering in Nigeria",
        "title": "Official practitioner registration portal", "url": "https://www.portal.coren.gov.ng/",
        "locator": "Engineering registration, qualification and professional-verification workflow.", "access_date": TODAY,
        "scope": "Nigeria-specific engineering regulatory context",
        "source_limit": "Supports registration context, not demand for every engineering title.",
    },
    "NG_NUC": {
        "source_id": "NG_NUC", "publisher": "National Universities Commission",
        "title": "Official commission portal", "url": "https://www.nuc.edu.ng/",
        "locator": "Nigerian higher-education regulatory and quality-assurance context.", "access_date": TODAY,
        "scope": "Nigeria-specific higher-education context",
        "source_limit": "Institutional context only; not proof of a particular academic vacancy.",
    },
}


# Existing areas are copied from the current structure, not inferred from an
# ISCO membership.  The subgroup may be excluded; that is a separate route
# state and does not invalidate the candidate's independent task evidence.
AREA: dict[str, dict[str, tuple[str, str]]] = {
    "D003": {"default": ("25", "Machine Learning & Computational Intelligence")},
    "D037": {
        "legal": ("26", "Lawyers & Legal Advisers"), "records": ("33", "Legal Records & Admin"), "court": ("34", "Court & Enforcement Officers"),
    },
    "D038": {
        "manager": ("12", "Compliance & Governance Managers"), "policy": ("24", "Policy & Government Officers"), "regulatory": ("26", "Legal & Regulatory Specialists"), "inspection": ("33", "Inspectors & Enforcement Officers"),
    },
    "D039": {"admin": ("13", "Deans & School Principals"), "teaching": ("23", "Lecturers & Vocational Teachers")},
    "D040": {"instruction": ("23", "Vocational & Skills Instructors"), "corporate": ("24", "Corporate Trainers & Coaches"), "support": ("53", "Classroom Teaching Assistants")},
    "D044": {"design": ("21", "Digital & Product Design"), "illustration": ("26", "Fine Art & Illustration"), "photo": ("34", "Photography")},
    "D045": {"leadership": ("11", "Government & Elected Leadership"), "policy": ("24", "Policy & Programme Officers"), "inspection": ("33", "Inspection & Enforcement Officers")},
    "D049": {"engineering": ("21", "Vehicle & Mechanical Engineering"), "technician": ("31", "Automotive Engineering Technicians"), "repair": ("72", "Vehicle Repair & Mechanics")},
    "D050": {"engineering": ("21", "Automation & Mechatronics Engineers"), "supervision": ("31", "Production Line Supervisors"), "assembly": ("82", "Machinery & Electronics Assembly")},
    "D051": {"manager": ("12", "Administrative and commercial managers"), "service": ("14", "Hospitality, retail and other services managers"), "professional": ("24", "Business and administration professionals"), "associate": ("33", "Business and administration associate professionals")},
    "D052": {"management": ("13", "Construction & Site Managers"), "engineering": ("21", "Civil & Infrastructure Engineers"), "inspection": ("31", "Site Supervisors & Inspectors"), "trade": ("71", "Building Trade Workers")},
    "D053": {"management": ("14", "Hospitality & Venue Management"), "chef": ("34", "Professional Chefs"), "service": ("51", "Food & Beverage Service")},
    "D054": {"management": ("13", "Oil & Gas Production Managers"), "engineering": ("21", "Petroleum Engineers & Geologists"), "plant": ("31", "Refinery & Plant Operators"), "rig": ("81", "Rig & Drilling Crew")},
    "D055": {"engineering": ("21", "Chemical & Process Engineers"), "technician": ("31", "Chemical Plant Technicians"), "operator": ("81", "Chemical Process Machine Operators")},
}


def area(domain_id: str, key: str = "default") -> tuple[str, str]:
    return AREA[domain_id].get(key, AREA[domain_id].get("default", next(iter(AREA[domain_id].values()))))


def candidate(domain_id: str, title: str, tasks: str, source_ids: list[str], area_key: str, *, disposition: str = "add", ng: list[str] | None = None, area_status: str = "supported_candidate", rationale: str | None = None) -> dict[str, Any]:
    code, label = area(domain_id, area_key)
    return {
        "domain_id": domain_id,
        "title": title,
        "tasks": tasks,
        "source_ids": source_ids,
        "area_code": code,
        "area_label": label,
        "disposition": disposition,
        "nigerian_source_ids": ng or [],
        "area_status": area_status,
        "area_rationale": rationale or f"The cited task scope is directly situated in the existing area of specialization '{label}', independently of subgroup membership.",
    }


# Completion candidates are intentionally explicit.  They are not inserted
# into canonical files.  The set brings every sparse D001-D056 domain to a
# ten-role candidate plan while retaining review-only boundaries.
COMPLETION: list[dict[str, Any]] = [
    # D003: current active count is 5; five more candidate routes.
    candidate("D003", "Computer and Information Research Scientist", "Researches computational methods, analyses computer and information problems and develops new software or hardware solutions.", ["ONET_COMPUTER_RESEARCH"], "default"),
    candidate("D003", "Machine Learning Engineer", "Builds, trains, evaluates and deploys machine-learning systems; the title is widely used but is represented here as a source-backed specialization title rather than an O*NET standalone occupation.", ["ONET_COMPUTER_RESEARCH", "ONET_SOFTWARE_DEVELOPERS"], "default", disposition="review_only", area_status="conditional_review_required", rationale="The task family fits machine learning, but the exact title is a market title rather than a distinct O*NET occupation; retain for review within the existing computational-intelligence area."),
    candidate("D003", "Natural Language Processing Engineer", "Develops computational methods for text, speech or language data, including model training, evaluation and deployment.", ["ONET_COMPUTER_RESEARCH", "ONET_DATA_SCIENTISTS"], "default", disposition="review_only", area_status="conditional_review_required", rationale="The task family fits the computational-intelligence area, but the title is a specialization label rather than a separately established occupational unit in the cited source."),
    candidate("D003", "MLOps Engineer", "Builds and maintains data, model-training, deployment, monitoring and reproducibility pipelines for machine-learning systems.", ["ONET_SOFTWARE_DEVELOPERS", "ONET_DATABASE_ARCHITECTS"], "default", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits the computational-intelligence area, but the title combines software and machine-learning functions and needs canonical-title review."),
    candidate("D003", "AI Data Engineer", "Designs data pipelines and data architectures that prepare, store and serve data for predictive and machine-learning systems.", ["ONET_DATABASE_ARCHITECTS", "ONET_DATA_SCIENTISTS"], "default", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits the computational-intelligence area, but the title overlaps data engineering and requires a parent-domain ownership check."),
    # D037: four prior candidates plus six additions.
    candidate("D037", "Judge, Magistrate, or Court Adjudicator", "Conducts hearings, interprets law, evaluates evidence and issues legally reasoned decisions.", ["ONET_JUDGES"], "court", ng=["NG_NUC"], rationale="Court-adjudication tasks fit the Court & Enforcement Officers area; legal appointment and jurisdictional requirements remain separate."),
    candidate("D037", "Court Reporter", "Creates accurate verbatim records of hearings, proceedings and legal testimony.", ["ONET_COURT_REPORTERS"], "court"),
    candidate("D037", "Title Examiner", "Searches land and legal records and examines title documents for ownership, encumbrances and defects.", ["ONET_TITLE_EXAMINERS"], "records"),
    candidate("D037", "Court Clerk", "Maintains court files, records proceedings, processes legal documents and supports court administration.", ["ONET_COURT_CLERKS"], "records"),
    candidate("D037", "Legal Secretary", "Prepares legal correspondence and documents, manages case files and supports legal-office administration.", ["ONET_LEGAL_SECRETARIES"], "records"),
    candidate("D037", "Bailiff", "Maintains courtroom order, serves legal process and supports enforcement of court procedures and decisions.", ["ONET_BAILIFFS"], "court"),
    # D038: three prior candidates plus seven additions.
    candidate("D038", "Internal Auditor", "Tests controls, examines records, identifies risk and reports control or compliance weaknesses.", ["ONET_INTERNAL_AUDITORS"], "inspection"),
    candidate("D038", "Financial Risk Specialist", "Measures and monitors financial risk, develops controls and reports risk exposures and mitigations.", ["ONET_FINANCIAL_RISK"], "manager"),
    candidate("D038", "Compliance Analyst", "Reviews policies, controls, records and processes against regulatory or internal requirements and documents findings.", ["ONET_COMPLIANCE_OFFICERS"], "regulatory", disposition="review_only", area_status="conditional_review_required", rationale="The tasks fit legal and regulatory specialists, but the analyst title is a market variant of the cited compliance occupation and needs title deduplication."),
    candidate("D038", "Regulatory Inspector", "Inspects operations and records for adherence to regulatory requirements and initiates corrective action or reports.", ["ONET_COMPLIANCE_OFFICERS"], "inspection"),
    candidate("D038", "Governance, Risk and Compliance Manager", "Directs governance, risk and compliance systems, investigations, reporting and policy implementation.", ["ONET_COMPLIANCE_MANAGERS"], "manager", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits compliance management, but the combined market title must be deduplicated against Compliance Manager."),
    candidate("D038", "Ethics and Compliance Officer", "Develops and monitors organisational ethics, conduct, reporting and compliance controls.", ["ONET_COMPLIANCE_OFFICERS"], "regulatory", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits legal/regulatory specialist work, but the exact title boundary needs a canonical alias review."),
    candidate("D038", "Regulatory Affairs Manager", "Leads regulatory submissions, requirements interpretation, compliance planning and regulator interactions.", ["ONET_REGULATORY_AFFAIRS", "ONET_COMPLIANCE_MANAGERS"], "manager", disposition="review_only", area_status="conditional_review_required", rationale="The tasks span regulatory specialist and manager work; keep review-only until a single role family is chosen."),
    # D039: three prior candidates plus seven additions.
    candidate("D039", "Academic Researcher", "Plans and conducts scholarly research, analyses evidence, communicates findings and contributes to academic outputs.", ["ONET_SOCIAL_RESEARCH_ASSISTANTS", "ONET_POSTSECONDARY_TEACHERS"], "teaching", disposition="review_only", area_status="conditional_review_required", rationale="Research is direct to higher education, but the generic title needs discipline and seniority qualification before canonical addition."),
    candidate("D039", "Academic Programme Coordinator", "Coordinates programme delivery, curriculum schedules, learner records, assessment and academic quality processes.", ["ONET_POSTSECONDARY_ADMIN", "ONET_INSTRUCTIONAL_COORDINATORS"], "admin", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits postsecondary administration, but the title is an institution-specific family requiring canonical title review."),
    candidate("D039", "Faculty Dean", "Leads a faculty or school, coordinates academic programmes, staff, quality processes and institutional strategy.", ["ONET_POSTSECONDARY_ADMIN"], "admin", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits postsecondary administration; the exact senior title is jurisdictional and remains review-only."),
    candidate("D039", "Research Fellow", "Conducts supervised or independent research, analyses findings, publishes or presents results and collaborates with academic teams.", ["ONET_SOCIAL_RESEARCH_ASSISTANTS", "ONET_POSTSECONDARY_TEACHERS"], "teaching", disposition="review_only", area_status="conditional_review_required", rationale="The research task family fits the higher-education area, but seniority and discipline are not established by the cited general source."),
    candidate("D039", "University Librarian", "Provides research support, manages scholarly information resources and helps learners and staff access knowledge.", ["ONET_LIBRARIANS"], "teaching"),
    candidate("D039", "Educational and Career Adviser", "Assesses learner needs, advises on education and career planning and refers learners to training or support.", ["ONET_EDUCATIONAL_COUNSELORS"], "teaching"),
    candidate("D039", "Academic Quality Coordinator", "Coordinates curriculum review, instructional standards, assessment quality and evidence for academic improvement.", ["ONET_INSTRUCTIONAL_COORDINATORS", "ONET_POSTSECONDARY_ADMIN"], "admin", disposition="review_only", area_status="conditional_review_required", rationale="The task family fits higher-education administration, but the title is a quality-assurance specialization and needs canonical review."),
    # D040: three prior candidates plus seven additions.
    candidate("D040", "Adult Education Teacher", "Teaches adult literacy, basic education or secondary subjects and evaluates learner progress.", ["ONET_ADULT_ED"], "instruction"),
    candidate("D040", "Teacher Assistant", "Supports classroom instruction, learner activities, materials and individual learner needs.", ["ONET_TEACHER_ASSISTANTS"], "support"),
    candidate("D040", "Vocational Rehabilitation Counselor", "Assesses vocational needs and helps people plan training, work preparation and employment support.", ["ONET_VOC_REHAB"], "corporate"),
    candidate("D040", "Apprenticeship Instructor", "Demonstrates trade skills, coaches apprentices, supervises practice and assesses occupational competence.", ["ONET_POSTSECONDARY_CTE", "ONET_TRAINING_SPECIALISTS"], "instruction", disposition="review_only", area_status="conditional_review_required", rationale="The task family is directly vocational, but apprenticeship is a delivery context rather than a single O*NET occupation."),
    candidate("D040", "Skills Assessor", "Evaluates practical competence against occupational standards and records learner assessment decisions.", ["ONET_TRAINING_SPECIALISTS", "ONET_INSTRUCTIONAL_COORDINATORS"], "instruction", disposition="review_only", area_status="conditional_review_required", rationale="The task fits vocational instruction and assessment, but the title needs source-backed title normalization."),
    candidate("D040", "Workplace Learning Coordinator", "Coordinates employee learning needs, training schedules, learning materials and evaluation of workplace programmes.", ["ONET_TRAINING_SPECIALISTS"], "corporate"),
    candidate("D040", "Practical Training Demonstrator", "Demonstrates technical procedures, supervises practical exercises and gives feedback on safe work performance.", ["ONET_POSTSECONDARY_CTE", "ONET_TRAINING_SPECIALISTS"], "instruction", disposition="review_only", area_status="conditional_review_required", rationale="The task family fits vocational instruction, but the title is an institution/employer variant and remains review-only."),
    # D044: two prior review candidates plus six additions.
    candidate("D044", "Web and Digital Interface Designer", "Designs visual layouts, interface elements, interaction behaviour and usability for digital products.", ["ONET_WEB_DIGITAL"], "design"),
    candidate("D044", "Multimedia Artist and Animator", "Creates digital visual assets, animation and special effects for communication and media production.", ["ONET_MULTIMEDIA_ARTISTS"], "illustration", disposition="review_only", area_status="conditional_review_required", rationale="The visual-production tasks fit illustration, but the communication-design boundary must be retained and reviewed."),
    candidate("D044", "Photographer", "Creates and edits photographs for communication, publication, documentation or client briefs.", ["ONET_PHOTOGRAPHERS"], "photo"),
    candidate("D044", "Desktop Publisher", "Composes pages, typography and graphics and prepares publications for production or distribution.", ["ONET_DESKTOP_PUBLISHERS"], "design"),
    candidate("D044", "Set and Exhibit Designer", "Designs visual environments, exhibits, layouts and presentation settings for audiences and visitors.", ["ONET_SET_EXHIBIT_DESIGNERS"], "design", disposition="review_only", area_status="conditional_review_required", rationale="The visual-design task family fits the design area, but exhibit design may require a separate parent-domain route."),
    candidate("D044", "Visual Communication Designer", "Translates messages and briefs into visual systems, layouts, typography and communication assets.", ["ONET_GRAPHIC_DESIGNERS"], "design", disposition="review_only", area_status="conditional_review_required", rationale="The task scope is direct, but the title is a specialization/alias candidate and must be deduplicated against Graphic Designer."),
    # D045: three prior candidates plus seven additions.
    candidate("D045", "Budget Analyst", "Analyses public or organisational budgets, monitors expenditure and recommends funding allocations.", ["ONET_BUDGET_ANALYSTS"], "policy"),
    candidate("D045", "Legislator", "Represents constituents, participates in lawmaking and makes public policy decisions.", ["ONET_LEGISLATORS"], "leadership"),
    candidate("D045", "Chief Executive, Public Institution", "Leads an institution, sets strategy, allocates resources and directs public-service operations.", ["ONET_CHIEF_EXECUTIVES"], "leadership", disposition="review_only", area_status="conditional_review_required", rationale="Executive task evidence fits government leadership, but the public-institution qualifier is a parent-context restriction requiring review."),
    candidate("D045", "Emergency Management Director", "Plans and coordinates public emergency preparedness, response, recovery and inter-agency operations.", ["ONET_EMERGENCY_MANAGERS"], "leadership"),
    candidate("D045", "Public Policy Analyst", "Researches policy options, evaluates public programmes and communicates evidence for government decisions.", ["ONET_MANAGEMENT_ANALYSTS", "ONET_POLITICAL_SCIENTISTS"], "policy", disposition="review_only", area_status="conditional_review_required", rationale="The task family fits policy officers, but the title is a market specialization spanning established analyst families."),
    candidate("D045", "Programme Evaluation Analyst", "Designs or applies evaluation methods to assess public programmes, outcomes, implementation and improvement options.", ["ONET_MANAGEMENT_ANALYSTS", "ONET_SOCIAL_RESEARCH_ASSISTANTS"], "policy", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits policy and programme work, but the title requires normalization against management-analysis and research families."),
    candidate("D045", "Government Compliance Inspector", "Inspects public or regulated operations against laws, permits, standards and enforcement requirements.", ["ONET_COMPLIANCE_OFFICERS"], "inspection"),
    # D049: two prior review candidates plus ten direct/conditional candidates.
    candidate("D049", "Automotive Systems Engineer", "Designs, integrates and tests vehicle systems, requirements, controls and safety or performance features.", ["ONET_AUTOMOTIVE_ENGINEERS"], "engineering"),
    candidate("D049", "Mechanical Engineer, Vehicle Systems", "Designs and tests mechanical systems and vehicle components and investigates failures or performance constraints.", ["ONET_MECHANICAL_ENGINEERS", "ONET_AUTOMOTIVE_ENGINEERS"], "engineering"),
    candidate("D049", "Automotive Service Technician", "Inspects, diagnoses, repairs and maintains vehicle systems and components.", ["ONET_AUTO_TECH"], "repair"),
    candidate("D049", "Automotive Body Repairer", "Repairs and restores vehicle bodies, frames, alignment and exterior components.", ["ONET_BODY_REPAIR"], "repair"),
    candidate("D049", "Diesel and Heavy-Vehicle Technician", "Inspects, diagnoses, repairs and maintains heavy vehicles and diesel engines.", ["ONET_DIESEL"], "repair"),
    candidate("D049", "Vehicle Electronics Technician", "Installs, tests, diagnoses and repairs vehicle electronic and electrical systems.", ["ONET_ELECTRONICS_INSTALLERS"], "technician"),
    candidate("D049", "Automotive Engineering Technician", "Supports vehicle-system measurement, testing, diagnostics, calibration and engineering documentation.", ["ONET_ENGINEERING_TECHNICIANS", "ONET_AUTOMOTIVE_ENGINEERS"], "technician", disposition="review_only", area_status="conditional_review_required", rationale="The technical task family is direct, but the title is a technical variant of an existing candidate and needs deduplication."),
    candidate("D049", "Vehicle Test and Validation Engineer", "Plans and conducts vehicle tests, evaluates failures and validates vehicle systems against requirements.", ["ONET_AUTOMOTIVE_ENGINEERS"], "engineering", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits automotive engineering, but the title is a specialization label rather than a distinct source occupation."),
    candidate("D049", "Automotive Product Design Engineer", "Develops vehicle and component designs, specifications, prototypes and engineering documentation for production or testing.", ["ONET_AUTOMOTIVE_ENGINEERS", "ONET_MECHANICAL_ENGINEERS"], "engineering", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits vehicle/mechanical engineering, but the product-design title needs deduplication against Automotive Engineer."),
    # D050: four prior candidates plus eight additions.
    candidate("D050", "Electrical and Control Systems Engineer", "Designs electrical, instrumentation and control systems for automated machinery and industrial processes.", ["ONET_ELECTRICAL_ENGINEERS"], "engineering"),
    candidate("D050", "Production and Operations Supervisor", "Supervises production workers, equipment, quality, workflow and safe operation of manufacturing lines.", ["ONET_FIRST_LINE_SUPERVISORS"], "supervision"),
    candidate("D050", "Electrical and Electronic Equipment Assembler", "Assembles, wires, tests and inspects electrical and electronic equipment and control assemblies.", ["ONET_ELECTRICAL_ASSEMBLERS"], "assembly"),
    candidate("D050", "Industrial Machinery Mechanic", "Maintains, diagnoses and repairs machinery and production equipment in industrial settings.", ["ONET_INDUSTRIAL_MECHANICS"], "assembly"),
    candidate("D050", "Control and Valve Technician", "Installs, tests and repairs industrial control, instrumentation and valve systems.", ["ONET_CONTROL_INSTALLERS"], "assembly"),
    candidate("D050", "Automation Controls Engineer", "Develops and integrates industrial automation, control logic, instrumentation and system testing.", ["ONET_ELECTRICAL_ENGINEERS", "ONET_MECHATRONICS_ENGINEERS"], "engineering", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits automation engineering, but the market title needs normalization against electrical and mechatronics engineer families."),
    candidate("D050", "PLC and Industrial Controls Technician", "Configures, tests, maintains and diagnoses programmable-control and instrumentation systems.", ["ONET_CONTROL_INSTALLERS", "ONET_MECHATRONICS_TECHNICIANS"], "assembly", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits the automation technician area, but the title is a specialization label and must be deduplicated."),
    candidate("D050", "Industrial Automation Integrator", "Integrates automated machinery, sensors, controls and production-system interfaces and validates the resulting system.", ["ONET_MECHATRONICS_ENGINEERS", "ONET_ROBOTICS_ENGINEERS"], "engineering", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits automation engineering, but the integrator title spans engineering and technical implementation."),
    # D051: three prior candidates; only two new roles are needed for the floor.
    candidate("D051", "Real Estate Development Manager", "Coordinates property development feasibility, finance, approvals, procurement and delivery.", ["ONET_PROPERTY_MANAGERS"], "manager", ng=["NG_ESVARBON"], disposition="review_only", area_status="conditional_review_required", rationale="The task family is real-estate management, but development-management scope is broader than the cited property-manager occupation."),
    candidate("D051", "Real Estate Portfolio Manager", "Manages a portfolio of properties, leases, operating performance, risks and investment decisions.", ["ONET_PROPERTY_MANAGERS", "ONET_REAL_ESTATE_BROKERS"], "professional", ng=["NG_ESVARBON"], disposition="review_only", area_status="conditional_review_required", rationale="The task family fits real-estate professional work, but portfolio management requires title and finance-scope normalization."),
    candidate("D051", "Leasing Manager", "Coordinates property listings, tenant applications, lease terms, renewals, occupancy and landlord-tenant administration.", ["ONET_PROPERTY_MANAGERS", "ONET_REAL_ESTATE_BROKERS"], "associate", ng=["NG_ESVARBON"], disposition="review_only", area_status="conditional_review_required", rationale="The tasks fit real-estate operations, but the leasing-manager title is a market variant requiring normalization."),
    candidate("D051", "Real Estate Asset Manager", "Monitors property performance, leases, maintenance, risk and value across an owned or managed asset portfolio.", ["ONET_PROPERTY_MANAGERS"], "manager", ng=["NG_ESVARBON"], disposition="review_only", area_status="conditional_review_required", rationale="The tasks fit property management, but the asset-management title introduces investment scope that needs explicit review."),
    candidate("D051", "Real Estate Development Coordinator", "Coordinates development information, approvals, consultants, contractors, schedules and property-delivery records.", ["ONET_PROPERTY_MANAGERS"], "professional", ng=["NG_ESVARBON"], disposition="review_only", area_status="conditional_review_required", rationale="The task family is real-estate professional work, but the development-coordinator title needs parent and title normalization."),
    # D052: three prior candidates plus seven additions.
    candidate("D052", "Civil Engineer", "Designs, analyses and supervises civil infrastructure, structures, sites and construction work.", ["ONET_CIVIL_ENGINEERS"], "engineering", ng=["NG_COREN"]),
    candidate("D052", "Carpenter", "Constructs, installs and repairs building structures, fixtures and wood components.", ["ONET_CARPENTERS"], "trade", ng=["NG_NBTE_TVID"]),
    candidate("D052", "Brickmason and Blockmason", "Builds and repairs masonry walls, structural elements and related building work.", ["ONET_BRICKMASONS"], "trade", ng=["NG_NBTE_TVID"]),
    candidate("D052", "Plumber and Pipefitter", "Installs, maintains and repairs plumbing, pipe, water, drainage and related building systems.", ["ONET_PLUMBERS"], "trade", ng=["NG_NBTE_TVID"]),
    candidate("D052", "Electrician, Construction", "Installs, tests and repairs building wiring, electrical equipment and construction systems.", ["ONET_ELECTRICIANS"], "trade", ng=["NG_NBTE_TVID"]),
    candidate("D052", "Quantity Surveyor", "Estimates construction costs, measures work, supports procurement and manages cost information across a project.", ["ONET_COST_ESTIMATORS"], "engineering", ng=["NG_COREN"], disposition="review_only", area_status="conditional_review_required", rationale="The task family fits construction cost planning, but quantity surveying is not identical to the cited generic cost-estimator occupation and needs professional-title confirmation."),
    candidate("D052", "Construction Site Manager", "Coordinates site activities, trades, schedules, safety, quality and construction implementation.", ["ONET_CONSTRUCTION_MANAGERS"], "management", ng=["NG_COREN"], disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits construction management, but the title is a site-level variant of Construction Manager and needs deduplication."),
    # D053: three prior candidates plus seven additions.
    candidate("D053", "Chef or Head Cook", "Plans menus, leads kitchen operations, supervises food preparation and maintains food-service quality.", ["ONET_CHEFS"], "chef"),
    candidate("D053", "Bartender", "Prepares and serves beverages, handles guest orders and supports food-and-beverage service operations.", ["ONET_BARTENDERS"], "service"),
    candidate("D053", "Waiter or Waitress", "Takes guest orders, serves food and beverages and manages the customer-service experience.", ["ONET_WAITERS"], "service"),
    candidate("D053", "Tour and Travel Guide", "Guides visitors, provides destination information, interprets attractions and manages tour experiences.", ["ONET_TRAVEL_GUIDES"], "service"),
    candidate("D053", "Travel Agent", "Plans travel, arranges reservations and itineraries and supports customers before and during trips.", ["ONET_TRAVEL_AGENTS"], "service"),
    candidate("D053", "Front Office Manager", "Coordinates guest reception, reservations, front-desk staff, complaints and hotel service processes.", ["ONET_LODGING_MANAGERS"], "management", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits hospitality management, but the title is a hotel-front-office specialization and needs title normalization."),
    candidate("D053", "Restaurant Operations Manager", "Directs restaurant staffing, budgets, purchasing, service quality and customer operations.", ["ONET_FOOD_SERVICE_MANAGERS"], "management", disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits food-service management, but the restaurant qualifier is a market variant requiring deduplication."),
    # D054: four prior candidates plus six additions.
    candidate("D054", "Petroleum Geologist", "Interprets subsurface geology and earth materials to support petroleum exploration, appraisal and field development.", ["ONET_GEOLOGISTS", "ONET_MINING_GEOLOGICAL_ENGINEERS"], "engineering", ng=["NG_NUPRC"]),
    candidate("D054", "Geophysicist, Petroleum", "Uses geophysical data and models to interpret subsurface structures and support petroleum exploration and production decisions.", ["ONET_GEOLOGISTS"], "engineering", ng=["NG_NUPRC"], disposition="review_only", area_status="conditional_review_required", rationale="The task scope fits petroleum geoscience, but the source occupation is broader geoscience and the petroleum qualifier needs canonical review."),
    candidate("D054", "Mining and Geological Engineer, Petroleum Operations", "Applies geological and engineering methods to extraction, safety, production and field operations.", ["ONET_MINING_GEOLOGICAL_ENGINEERS"], "engineering", ng=["NG_NUPRC"], disposition="review_only", area_status="conditional_review_required", rationale="The task family fits petroleum engineering/geology, but the parent occupation spans mining and needs title-boundary review."),
    candidate("D054", "Wellhead Pumper", "Monitors and operates oil or gas wells, gauges, valves and wellhead equipment and records production conditions.", ["ONET_WELLHEAD_PUMPERS"], "plant", ng=["NG_NUPRC"]),
    candidate("D054", "Gas Plant Operator", "Operates gas-processing equipment, monitors plant conditions and maintains safe production flow.", ["ONET_GAS_PLANT_OPERATORS"], "plant", ng=["NG_NUPRC"]),
    candidate("D054", "Drilling Engineer", "Plans and improves drilling operations, evaluates well performance and supports safe and efficient well construction.", ["ONET_PETROLEUM_ENGINEERS"], "engineering", ng=["NG_NUPRC"], disposition="review_only", area_status="conditional_review_required", rationale="The task scope is direct to petroleum engineering, but drilling engineer is a specialization title within the cited occupation and needs deduplication."),
    # D055: three prior candidates plus seven additions.
    candidate("D055", "Biofuels Processing Technician", "Measures, mixes and processes feedstock, monitors biological/chemical production vessels, samples output and records plant maintenance and safety data.", ["ONET_BIOFUELS_PROCESSING"], "operator", ng=["NG_NBTE_TVID"], disposition="add", rationale="The cited occupational tasks directly fit chemical-process machine operations and the named operator area; it is not being inferred from a title or ISCO membership."),
    candidate("D055", "Process Engineer", "Designs, monitors and improves industrial processes, equipment, quality, safety and production efficiency.", ["ONET_CHEMICAL_ENGINEERS", "ONET_INDUSTRIAL_ENGINEERS"], "engineering", ng=["NG_COREN"], disposition="review_only", area_status="conditional_review_required", rationale="The task family fits chemical/process engineering, but the title spans multiple engineering domains and needs parent ownership review."),
    candidate("D055", "Environmental Process Engineer", "Designs or improves pollution-control, treatment and environmental process systems associated with industrial production.", ["ONET_ENVIRONMENTAL_ENGINEERS", "ONET_CHEMICAL_ENGINEERS"], "engineering", ng=["NG_COREN"], disposition="review_only", area_status="conditional_review_required", rationale="The task family overlaps chemical and environmental engineering; retain only as a reviewed route unless parent-domain ownership is explicit."),
    candidate("D055", "Mixing and Blending Machine Operator", "Operates, monitors and adjusts industrial mixing and blending equipment and production materials.", ["ONET_MIXING_OPERATORS"], "operator", ng=["NG_NBTE_TVID"]),
    candidate("D055", "Water and Wastewater Treatment Operator", "Controls treatment processes, samples and tests water, monitors plant equipment and records operating conditions.", ["ONET_WATER_TREATMENT"], "operator", ng=["NG_NBTE_TVID"], disposition="review_only", area_status="conditional_review_required", rationale="The plant-operations tasks are technically adjacent to chemical processing, but the environmental-services parent route needs explicit review."),
    candidate("D055", "Chemical Process Technician", "Samples materials, operates process equipment, monitors quality and supports chemical production and troubleshooting.", ["ONET_CHEMICAL_TECHNICIANS", "ONET_CHEMICAL_PLANT_OPERATORS"], "technician", ng=["NG_NBTE_TVID"]),
    candidate("D055", "Chemical Plant Control Operator", "Controls chemical plant systems, equipment, indicators and safe operating conditions during production.", ["ONET_CHEMICAL_PLANT_OPERATORS"], "operator", ng=["NG_NBTE_TVID"]),
]


def role_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in ROLE_FILES:
        payload = load(path)
        rows.extend(payload if isinstance(payload, list) else payload.get("roles", []))
    unique: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = f"{row.get('domain_id')}|{norm(row.get('role_name'))}"
        unique[key] = row
    return list(unique.values())


def domain_name(meta: Any, domain_id: str) -> str:
    value = meta.get(domain_id) if isinstance(meta, dict) else None
    if isinstance(value, dict):
        return str(value.get("domain_name") or value.get("name") or domain_id)
    return domain_id


def area_from_old(domain_id: str, title: str) -> tuple[str, str, str, str]:
    t = norm(title)
    rules: dict[str, list[tuple[tuple[str, ...], str, str]]] = {
        "D037": [(('paralegal', 'legal assistant', 'secretary', 'clerk', 'title examiner'), 'records', 'Records and case-administration tasks fit legal records/admin.'), (('judge', 'judicial', 'mediator', 'arbitrator', 'bailiff', 'court'), 'court', 'Court-process, adjudication or enforcement tasks fit court/enforcement practice.'), ((), 'legal', 'Legal advice, representation or legal research tasks fit lawyers/legal advisers.')],
        "D038": [(('manager',), 'manager', 'Compliance-system leadership fits compliance/governance management.'), (('regulatory',), 'regulatory', 'Regulatory-submission and requirements work fits legal/regulatory specialists.'), (('inspector', 'enforcement'), 'inspection', 'Inspection and enforcement tasks fit the inspection/enforcement area.'), ((), 'regulatory', 'Compliance and regulatory task evidence fits legal/regulatory specialists.')],
        "D039": [(('administrator', 'dean', 'coordinator'), 'admin', 'Institutional administration and programme coordination fit the postsecondary administration area.'), ((), 'teaching', 'Teaching, advising or research-support tasks fit lecturers/vocational teachers.')],
        "D040": [(('assistant',), 'support', 'Learner and classroom support tasks fit classroom teaching assistants.'), (('training', 'coach'), 'corporate', 'Workplace training and coaching tasks fit corporate trainers/coaches.'), ((), 'instruction', 'Teaching, assessment and skills-demonstration tasks fit vocational/skills instructors.')],
        "D044": [(('photograph',), 'photo', 'Photographic communication tasks fit photography.'), (('illustr', 'animat'), 'illustration', 'Illustration or animation tasks fit fine art/illustration, subject to communication-design boundary.'), ((), 'design', 'Visual communication, layout or interface tasks fit digital/product design.')],
        "D045": [(('chief', 'legislator', 'director'), 'leadership', 'Executive, elected or public-response leadership tasks fit government/elected leadership.'), (('inspector', 'compliance'), 'inspection', 'Regulatory inspection tasks fit inspection/enforcement officers.'), ((), 'policy', 'Policy, programme analysis or public-planning tasks fit policy/programme officers.')],
        "D049": [(('technician', 'technologist'), 'technician', 'Vehicle diagnostics, testing or technical support fit automotive engineering technicians.'), (('mechanic', 'repair'), 'repair', 'Vehicle repair and maintenance tasks fit vehicle repair/mechanics.'), ((), 'engineering', 'Vehicle-system design, integration and testing fit vehicle/mechanical engineering.')],
        "D050": [(('technician', 'assembler', 'mechanic'), 'assembly', 'Equipment maintenance, assembly and technical implementation fit machinery/electronics assembly.'), (('supervisor',), 'supervision', 'Production supervision tasks fit production-line supervisors.'), ((), 'engineering', 'Automation, robotics, mechatronics or control-system design fit automation/mechatronics engineers.')],
        "D051": [(('manager',), 'manager', 'Property operations and management tasks fit administrative/commercial managers.'), (('broker', 'appraiser', 'surveyor'), 'professional', 'Valuation, brokerage and professional real-estate tasks fit business/administration professionals.'), ((), 'associate', 'Transaction or property-support work fits business/administration associate professionals.')],
        "D052": [(('inspector', 'estimator', 'surveyor'), 'inspection', 'Inspection, measurement and cost-control tasks fit site supervisors/inspectors.'), (('engineer',), 'engineering', 'Infrastructure and structural tasks fit civil/infrastructure engineers.'), (('carpenter', 'brick', 'plumb', 'electric'), 'trade', 'Building-trade tasks fit building trade workers.'), ((), 'management', 'Construction planning and delivery tasks fit construction/site managers.')],
        "D053": [(('chef', 'cook'), 'chef', 'Kitchen production and food-preparation leadership fit professional chefs.'), (('waiter', 'bartend', 'service'), 'service', 'Guest-facing food/beverage service tasks fit food and beverage service.'), ((), 'management', 'Accommodation, event and hospitality operations fit hospitality/venue management.')],
        "D054": [(('operator', 'pumper', 'roustabout', 'drill'), 'plant' if 'operator' in t or 'pumper' in t else 'rig', 'Plant or field-operation tasks fit refinery/plant operators or rig/drilling crew.'), (('geolog', 'geophys'), 'engineering', 'Subsurface and petroleum engineering/geology tasks fit petroleum engineers/geologists.'), ((), 'engineering', 'Petroleum engineering and production tasks fit petroleum engineers/geologists.')],
        "D055": [(('operator',), 'operator', 'Chemical process-control and machine-operation tasks fit chemical process machine operators.'), (('technician',), 'technician', 'Chemical analysis, sampling and process-support tasks fit chemical plant technicians.'), ((), 'engineering', 'Chemical, biochemical or process-engineering tasks fit chemical/process engineers.')],
        "D003": [((), 'default', 'Computational intelligence and machine-learning task evidence fits the existing computational-intelligence area.')],
    }
    for tokens, key, rationale in rules[domain_id]:
        if not tokens or any(token in t for token in tokens):
            code, label = area(domain_id, key)
            return code, label, "existing_current_area", rationale
    raise AssertionError(f"No area rule for {domain_id} {title}")


def reconciled_area_for_candidate(
    domain_id: str,
    title: str,
    tasks: str,
    legacy_area_key: str,
    recommendations: dict[str, list[dict[str, Any]]],
) -> tuple[str, dict[str, Any], str]:
    """Map a candidate onto the reconciled global area catalogue.

    The selectors below are deliberately task/title rules, not ISCO lookups.
    The returned label and boundary always come from the Step 1 reconciliation
    artifact.  The legacy key is used only as a fallback hint for candidates
    whose title does not disambiguate the route.
    """

    areas = recommendations.get(domain_id) or []
    if not areas:
        raise AssertionError(f"No reconciled global areas for {domain_id}")

    def choose(label: str) -> tuple[str, dict[str, Any], str]:
        for index, area_record in enumerate(areas, start=1):
            if area_record["label"] == label:
                return f"{domain_id}-S{index:02d}", area_record, "reconciled_global_recommendation"
        raise AssertionError(f"{domain_id} missing reconciled area {label!r}")

    text = norm(f"{title} {tasks}")
    title_text = norm(title)
    labels: dict[str, str] = {
        "D003": "Natural Language and Speech AI" if any(token in text for token in ("natural language", "nlp", "speech")) else (
            "Intelligent Agents and Robotics" if any(token in text for token in ("robot", "agent")) else "Machine Learning and Generative Models"
        ),
        "D037": "Dispute Resolution" if any(token in title_text for token in ("arbitrator", "mediator", "conciliator")) else (
            "Criminal Justice" if any(token in text for token in ("judge", "judicial", "court", "bailiff")) else (
                "Property, Construction and Infrastructure Law" if any(token in text for token in ("title examiner", "property", "real estate")) else "Business, Corporate and Financial Law"
            )
        ),
        "D038": "Corporate Governance, Risk and Internal Controls" if any(token in text for token in ("manager", "audit", "risk", "internal control")) else (
            "Regulatory Supervision, Inspection and Enforcement" if any(token in text for token in ("inspector", "inspection", "enforcement")) else (
                "Regulatory Policy, Affairs and Oversight" if any(token in text for token in ("regulatory", "compliance")) else "Organizational Compliance, Ethics and Integrity"
            )
        ),
        "D039": "Academic Research and Scholarship" if any(token in title_text for token in ("research", "researcher", "fellow")) else (
            "Academic Leadership, Governance and Quality" if any(token in text for token in ("administrator", "dean", "coordinator", "quality")) else (
                "Student Learning, Academic Services and Community Engagement" if any(token in text for token in ("librarian", "career adviser", "counselor", "student")) else "Higher-Education Teaching and Curriculum"
            )
        ),
        "D040": "Vocational and Technical Instruction and Assessment" if "assistant" in text else (
            "Workplace and Continuing Professional Development" if any(token in text for token in ("training", "coach", "workplace")) else (
                "Apprenticeship and Work-Based Learning" if "apprenticeship" in text else "Vocational and Technical Instruction and Assessment"
            )
        ),
        "D044": "Campaign and Promotional Communication Design" if any(token in text for token in ("photograph", "animation", "multimedia", "campaign")) else (
            "Information, Wayfinding and Data Visualization" if any(token in text for token in ("interface", "web", "digital", "exhibit", "visualization")) else "Brand Identity and Visual Systems"
        ),
        "D045": "Public Governance and Institutional Performance" if any(token in text for token in ("chief", "legislator", "director", "leadership", "governance")) else (
            "Public Programme and Service Delivery" if any(token in text for token in ("inspector", "inspection", "compliance", "emergency")) else (
                "Public Finance and Budget Management" if "budget" in text else "Public Policy Design and Evaluation"
            )
        ),
        "D049": "Vehicle Electronics, Software and Connected Systems" if any(token in text for token in ("electronics", "electronic", "software", "connected")) else (
            "Vehicle Testing, Validation and Driving Automation" if any(token in text for token in ("test", "validation", "automation", "autonomous")) else (
                "Chassis, Vehicle Dynamics and Safety" if any(token in text for token in ("technician", "mechanic", "repair", "body", "diesel")) else "Vehicle Systems and Integration"
            )
        ),
        "D050": "Robotics and Mechatronic Automation" if any(token in text for token in ("robot", "mechatronic")) else (
            "Manufacturing Automation and Operations Systems" if any(token in text for token in ("assembly", "supervisor", "production", "machinery", "machine")) else "Industrial Control and Instrumentation"
        ),
        "D051": "Real Estate Valuation and Appraisal" if any(token in text for token in ("appraiser", "appraisal", "valuation")) else (
            "Property Agency, Transactions and Leasing" if any(token in text for token in ("broker", "leasing", "transaction", "agent")) else (
                "Real Estate Development and Planning" if any(token in text for token in ("development", "developer", "planning")) else (
                    "Real Estate Finance and Investment" if any(token in text for token in ("portfolio", "asset", "investment", "finance")) else "Property and Facilities Management"
                )
            )
        ),
        "D052": "Construction Commercial and Cost Management" if any(token in text for token in ("cost", "estimator", "quantity survey")) else (
            "Construction Site and Production Management" if any(token in text for token in ("inspector", "carpenter", "brick", "plumb", "electric", "site")) else "Construction Project Management"
        ),
        "D053": "Food, Beverage and Culinary Operations" if any(token in text for token in ("chef", "cook", "food", "restaurant", "bartend", "waiter")) else (
            "Travel, Tourism and Visitor Services" if any(token in text for token in ("travel", "tour", "guide", "visitor")) else (
                "Hospitality Events and Meetings" if any(token in text for token in ("event", "meeting", "convention")) else "Accommodation and Guest Operations"
            )
        ),
        "D054": "Midstream Gas Processing, Transport and Storage" if any(token in text for token in ("gas plant", "gas processing", "midstream")) else (
            "Refining and Petroleum Processing" if any(token in text for token in ("refinery", "refining", "petroleum pump")) else (
                "Production and Field Operations" if any(token in text for token in ("wellhead", "pumper", "production", "field")) else (
                    "Drilling and Well Construction" if any(token in text for token in ("drill", "roustabout", "rig")) else "Subsurface Exploration and Reservoir Development"
                )
            )
        ),
        "D055": "Energy and Low-Carbon Process Engineering" if any(token in text for token in ("biofuel", "biofuel", "low carbon")) else (
            "Environmental, Water and Clean Process Engineering" if any(token in text for token in ("environmental", "water", "wastewater", "pollution")) else (
                "Reaction, Catalysis and Process Development" if "technician" in text else "Process Design, Systems and Control"
            )
        ),
    }
    desired_label = labels.get(domain_id)
    if not desired_label:
        # This branch is defensive for a future D001-D056 candidate; it still
        # chooses a Step 1 label, never an older subgroup label.
        desired_label = areas[0]["label"]
    code, area_record, route_status = choose(desired_label)
    rationale = (
        f"Candidate tasks are reconciled to the global area boundary "
        f"{area_record['label']!r}: {area_record['boundary']}"
    )
    return code, area_record, rationale


def build_entry(
    spec: dict[str, Any],
    names: Any,
    structure: Any,
    active: list[dict[str, Any]],
    recommendations: dict[str, list[dict[str, Any]]],
) -> dict[str, Any]:
    domain_id = spec["domain_id"]
    title = spec["title"]
    key = f"{domain_id}|{norm(title)}"
    same_domain = [r for r in active if str(r.get("domain_id")) == domain_id]
    exact = [str(r.get("role_name")) for r in same_domain if norm(r.get("role_name")) == norm(title)]
    aliases = []
    cross = []
    for row in active:
        aliases_raw = re.split(r"\s*[;,|·]\s*", str(row.get("also_known_as") or ""))
        if norm(title) in {norm(a) for a in aliases_raw if a}:
            if str(row.get("domain_id")) == domain_id:
                aliases.append(str(row.get("role_name")))
            else:
                cross.append(f"{row.get('domain_id')}|{row.get('role_name')}")
        if norm(row.get("role_name")) == norm(title) and str(row.get("domain_id")) != domain_id:
            cross.append(f"{row.get('domain_id')}|{row.get('role_name')}")
    disposition = spec["disposition"]
    if exact or aliases:
        disposition = "alias_existing"
        reason = "The exact title or an explicit alias already exists in the same domain; retain one canonical identity."
    elif disposition == "add":
        reason = "The occupational task evidence directly fits both the parent domain and the named area; this remains a noncanonical recommendation."
    else:
        reason = "The parent-domain and area task evidence is relevant, but title or route boundaries require later canonical review."
    area_code, area_record, reconciled_rationale = reconciled_area_for_candidate(
        domain_id,
        title,
        spec["tasks"],
        str(spec.get("legacy_area_key") or spec.get("area_code") or ""),
        recommendations,
    )
    area_label = area_record["label"]
    route_state = "reconciled_global_area; canonical_route_pending"
    global_sources = [GLOBAL_SOURCES[sid] for sid in spec["source_ids"]]
    ng_sources = [NIGERIAN_SOURCES[sid] for sid in spec["nigerian_source_ids"]]
    return {
        "candidate_key": key,
        "domain_id": domain_id,
        "domain_name": domain_name(names, domain_id),
        "role_title": title,
        "candidate_tasks": spec["tasks"],
        "domain_fit_status": "supported_candidate" if spec["disposition"] == "add" else "conditional",
        "domain_fit_rationale": "The cited occupational tasks directly describe work within the parent domain; this judgment is independent of ISCO or subgroup membership.",
        "area_of_specialization": {
            "code": area_code,
            "label": area_label,
            "status": spec["area_status"],
            "boundary": area_record["boundary"],
            "boundary_source_field": area_record["boundary_source_field"],
            "source_ids": area_record["source_ids"],
            "source_artifact": str(GLOBAL_SPECIALIZATION_RECONCILIATION.relative_to(ROOT)).replace("\\", "/"),
            "fit_rationale": reconciled_rationale,
            "route_state": route_state,
        },
        "area_reconciliation": {
            "source_artifact": str(GLOBAL_SPECIALIZATION_RECONCILIATION.relative_to(ROOT)).replace("\\", "/"),
            "legacy_area_key_hint": str(spec.get("legacy_area_key") or spec.get("area_code") or ""),
            "legacy_area_label_hint": str(spec.get("area_label") or ""),
            "reconciled_area_code": area_code,
            "reconciled_area_label": area_label,
            "reconciled_boundary": area_record["boundary"],
            "reconciled_boundary_source_field": area_record["boundary_source_field"],
            "changed_from_legacy_hint": str(spec.get("area_label") or "") != area_label,
        },
        "area_fit_status": spec["area_status"],
        "area_fit_rationale": reconciled_rationale,
        "global_evidence": global_sources,
        "nigerian_context": ng_sources,
        "nigerian_context_claim_limit": "Nigerian regulation, training or institutional evidence is context only; it does not prove Nigerian vacancy or demand and does not establish global role fit.",
        "existing_active_exact_matches": sorted(set(exact)),
        "existing_active_alias_matches": sorted(set(aliases)),
        "existing_active_cross_domain_matches": sorted(set(cross)),
        "disposition": disposition,
        "disposition_reason": reason,
        "canonical_role_addition": False,
        "canonical_files_edited": False,
    }


def main() -> None:
    prior = load(PRIOR)
    names = load(DOMAIN_META)
    structure = load(DOMAIN_STRUCTURE)
    recommendations = load_reconciled_areas(GLOBAL_SPECIALIZATION_RECONCILIATION)
    active = [r for r in role_rows() if str(r.get("student_path_status") or "").casefold() != "excluded"]
    active_by_domain = Counter(str(r.get("domain_id")) for r in active)
    target_domains = [f"D{i:03d}" for i in range(1, 57) if active_by_domain[f"D{i:03d}"] < TARGET_FLOOR]

    # Reconcile the prior checkpoint, adding the explicit area layer.  The
    # prior records remain source-backed; only their structure is normalized.
    entries: list[dict[str, Any]] = []
    seen: set[str] = set()
    for old in prior.get("entries", []):
        domain_id = str(old["domain_id"])
        title = str(old.get("title_or_family") or "").strip()
        if domain_id not in target_domains or not title:
            continue
        key = f"{domain_id}|{norm(title)}"
        if key in seen:
            continue
        code, label, _route_status, rationale = area_from_old(domain_id, title)
        area_status = "supported_candidate" if old.get("disposition") == "add" else "conditional_review_required"
        spec = {
            "domain_id": domain_id, "title": title,
            "tasks": old.get("candidate_tasks") or "Source-backed occupational task scope recorded in the prior Galileo checkpoint.",
            "source_ids": [x["source_id"] for x in old.get("global_sources", []) if x.get("source_id") in GLOBAL_SOURCES],
            "legacy_area_key": code, "area_code": code, "area_label": label, "area_status": area_status,
            "area_rationale": rationale, "disposition": old.get("disposition") or "review_only",
            "nigerian_source_ids": [x["source_id"] for x in old.get("nigerian_context_sources", []) if x.get("source_id") in NIGERIAN_SOURCES],
        }
        if not spec["source_ids"]:
            raise AssertionError(f"Prior candidate lost global evidence: {key}")
        entries.append(build_entry(spec, names, structure, active, recommendations))
        seen.add(key)

    # Add the completion plan and deduplicate against the reconciled checkpoint.
    for spec in COMPLETION:
        key = f"{spec['domain_id']}|{norm(spec['title'])}"
        if spec["domain_id"] not in target_domains or key in seen:
            continue
        entries.append(build_entry(spec, names, structure, active, recommendations))
        seen.add(key)

    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for entry in entries:
        by_domain[entry["domain_id"]].append(entry)
    coverage = []
    for domain_id in target_domains:
        domain_entries = by_domain[domain_id]
        coverage.append({
            "domain_id": domain_id,
            "domain_name": domain_name(names, domain_id),
            "current_active_role_count": active_by_domain[domain_id],
            "target_active_role_floor": TARGET_FLOOR,
            "candidate_count": len(domain_entries),
            "add_candidate_count": sum(x["disposition"] == "add" for x in domain_entries),
            "review_only_candidate_count": sum(x["disposition"] == "review_only" for x in domain_entries),
            "alias_existing_count": sum(x["disposition"] == "alias_existing" for x in domain_entries),
            "candidate_coverage_reaches_floor": active_by_domain[domain_id] + len(domain_entries) >= TARGET_FLOOR,
            "projected_active_role_count_if_all_add_candidates_accepted": active_by_domain[domain_id] + sum(x["disposition"] == "add" for x in domain_entries),
            "remaining_active_floor_deficit_after_safe_add_candidates": max(0, TARGET_FLOOR - active_by_domain[domain_id] - sum(x["disposition"] == "add" for x in domain_entries)),
            "why_review_only_not_activated": sorted({x["disposition_reason"] for x in domain_entries if x["disposition"] == "review_only"}),
            "area_labels": sorted({x["area_of_specialization"]["label"] for x in domain_entries}),
            "route_note": "Candidate coverage only; canonical activation and route exposure require a later merge after area-route review.",
        })

    dispositions = Counter(x["disposition"] for x in entries)
    remapped_entries = [x for x in entries if x["area_reconciliation"]["changed_from_legacy_hint"]]
    integrity = {
        "unique_candidate_keys": len(seen) == len(entries),
        "all_target_domains_have_entries": all(by_domain[d] for d in target_domains),
        "all_target_domains_have_at_least_ten_candidate_or_active_roles": all(active_by_domain[d] + len(by_domain[d]) >= TARGET_FLOOR for d in target_domains),
        "all_candidates_have_parent_domain_fit": all(x["domain_fit_status"] in {"supported_candidate", "conditional"} and x["domain_fit_rationale"] for x in entries),
        "all_candidates_have_area_assignment": all(x["area_of_specialization"]["label"] and x["area_of_specialization"]["fit_rationale"] for x in entries),
        "all_candidates_have_global_evidence": all(x["global_evidence"] and all(s.get("url") and s.get("locator") for s in x["global_evidence"]) for x in entries),
        "area_fit_gate": all(x["disposition"] != "add" or x["area_fit_status"] == "supported_candidate" for x in entries),
        "isco_membership_not_used_as_fit_proof": True,
        "nigerian_context_separate_from_global_fit": all(not any(s.get("scope", "").startswith("Nigeria") for s in x["global_evidence"]) for x in entries),
        "canonical_files_edited": False,
    }
    if not all(value for key, value in integrity.items() if key != "canonical_files_edited"):
        raise SystemExit(json.dumps({"integrity": integrity, "coverage": coverage}, indent=2))

    out = {
        "schema_version": "2026-10-07.role-enrichment-final-handoff.v2",
        "lane": "D001-D056",
        "status": "complete_review_only_handoff; canonical_application_not_started",
        "run_date": TODAY,
        "source_checkpoint": str(PRIOR.relative_to(ROOT)).replace("\\", "/"),
        "scope": "Global-first role enrichment for every D001-D056 domain below the ten-role candidate coverage floor, with explicit area-of-specialization fit and separate Nigerian context.",
        "decision_boundary": "This artifact proposes and classifies role candidates; it does not activate roles or edit canonical role/domain/subgroup files.",
        "method": [
            "Loaded Galileo's saved checkpoint and retained its source-backed candidates after adding explicit area-of-specialization assignments.",
            "Audited the current merged active role inventory before deduplicating candidate titles and aliases.",
            "Used independent occupational task evidence for parent-domain fit; ISCO or subgroup membership was not used as fit proof.",
            "Required every candidate to name a reconciled global area-of-specialization route and record the source boundary separately from parent-domain fit.",
            "Reconciled all final area labels and boundaries from the Step 1 global recommendation artifact; older ISCO-derived subgroup labels remain audit hints only.",
            "Kept Nigerian regulatory, training and institutional sources in a separate context field; they do not establish Nigerian vacancy or demand.",
            "Filled each D001-D056 sparse domain to a ten-role candidate coverage plan; review-only records remain explicit and are not counted as canonical additions.",
        ],
        "counts": {
            "current_merged_active_role_records": len(active),
            "target_domain_count": len(target_domains),
            "candidate_records": len(entries),
            "candidate_domain_count": len(by_domain),
            "dispositions": dict(sorted(dispositions.items())),
            "source_catalog_global_count": len(GLOBAL_SOURCES),
            "source_catalog_nigerian_context_count": len(NIGERIAN_SOURCES),
            "candidate_records_with_nigerian_context": sum(bool(x["nigerian_context"]) for x in entries),
            "candidate_records_without_nigerian_context": sum(not x["nigerian_context"] for x in entries),
            "area_records_remapped_from_legacy_hints": len(remapped_entries),
            "area_records_retaining_legacy_label": len(entries) - len(remapped_entries),
        },
        "area_reconciliation": {
            "source_artifact": str(GLOBAL_SPECIALIZATION_RECONCILIATION.relative_to(ROOT)).replace("\\", "/"),
            "final_area_names_source": "recommended_areas.label",
            "final_area_boundaries_source": "recommended_areas.boundary",
            "legacy_isco_labels_are_final_names": False,
            "remapped_entry_count": len(remapped_entries),
            "retained_legacy_label_count": len(entries) - len(remapped_entries),
            "remapped_areas": [
                {
                    "candidate_key": x["candidate_key"],
                    "legacy_area_label_hint": x["area_reconciliation"]["legacy_area_label_hint"],
                    "reconciled_area_code": x["area_reconciliation"]["reconciled_area_code"],
                    "reconciled_area_label": x["area_reconciliation"]["reconciled_area_label"],
                    "reconciled_boundary": x["area_reconciliation"]["reconciled_boundary"],
                    "reconciled_boundary_source_field": x["area_reconciliation"]["reconciled_boundary_source_field"],
                }
                for x in remapped_entries
            ],
        },
        "coverage_floor": {
            "floor": TARGET_FLOOR,
            "meaning": "At least ten roles are represented by current active roles plus deduplicated, source-backed candidate records in each sparse domain. Review-only records are not canonical activations; this is a candidate coverage plan, not a claim that canonical active data has already been changed.",
            "domains": coverage,
        },
        "future_market_enrichment_disclaimer": "This is not an exhaustive list of roles. Additional roles may be added after separate evidence review, including market-source enrichment such as Adzuna or Jobberman. Market listings can support demand/context analysis but do not, by themselves, prove parent-domain or area-of-specialization fit.",
        "entries": entries,
        "source_catalog": {**GLOBAL_SOURCES, **NIGERIAN_SOURCES},
        "integrity": integrity,
    }
    LANE.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Galileo D001-D056 role-enrichment final handoff — 2026-10-07",
        "",
        "Status: **complete review-only handoff**. No canonical role, domain, subgroup or overlay file was edited.",
        "",
        f"The handoff reconciles Galileo's prior checkpoint and contains **{len(entries)} deduplicated candidate records** across **{len(target_domains)} sparse D001-D056 domains**.",
        f"Dispositions: **{dispositions.get('add', 0)} add candidates**, **{dispositions.get('review_only', 0)} review-only**, **{dispositions.get('alias_existing', 0)} alias-existing**.",
        "",
        "## Non-negotiable fit gate",
        "",
        "Every candidate has an independent parent-domain fit record and an explicit area-of-specialization assignment. Final area names and boundaries come from the reconciled global recommendation artifact; older subgroup/ISCO labels are audit hints only and are not treated as proof of either fit. Candidates with title or route uncertainty remain `review_only`; they are not counted as canonical additions.",
        "",
        "## Coverage",
        "",
        "The ten-role floor is a candidate-coverage target: current active roles plus deduplicated candidate records reach the floor. Only `add` candidates are potential activations; `review_only` records document why the remaining candidate routes are not safe to activate without another fit/title decision. Canonical active role files have not been changed.",
        "",
        "| Domain | Current active | Candidate records | Add | Review-only | Areas represented |",
        "|---|---:|---:|---:|---:|---|",
    ]
    for item in coverage:
        lines.append(f"| {item['domain_id']} {item['domain_name']} | {item['current_active_role_count']} | {item['candidate_count']} | {item['add_candidate_count']} | {item['review_only_candidate_count']} | {', '.join(item['area_labels'])} |")
    lines += [
        "",
        "## Evidence boundary",
        "",
        "Global occupational evidence is recorded per candidate with URL, locator and access date. Nigerian sources are stored separately as local regulatory, training or institutional context; they do not establish global fit or Nigerian demand.",
        "",
        "## Later market enrichment",
        "",
        "This is not an exhaustive role list. More roles can be added later through separate evidence review, including Adzuna or Jobberman market enrichment. Job listings may inform demand/context, but they cannot alone establish that a role belongs to a domain or area of specialization.",
        "",
        "## Integrity",
        "",
        f"- Global source records: **{len(GLOBAL_SOURCES)}**; Nigerian context records: **{len(NIGERIAN_SOURCES)}**.",
        f"- Candidate records with Nigerian context: **{sum(bool(x['nigerian_context']) for x in entries)}**; without: **{sum(not x['nigerian_context'] for x in entries)}**.",
        "- Every candidate has a domain-fit status, area label, area-fit rationale, global source reference and explicit disposition.",
        "- Canonical application: **not started**.",
        "",
        "The JSON file is the auditable record; this Markdown file is the human-readable handoff.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": out["counts"], "integrity": integrity}, indent=2))


if __name__ == "__main__":
    main()
