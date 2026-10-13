"""Build the D001-D056 role-enrichment checkpoint.

This is a review-only lane artifact. It intentionally does not edit any
canonical role or taxonomy file. Candidates are limited to sparse/zero-role
domains in D001-D056 and are checked against the complete current role
inventory for exact and alias overlap.
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
OUT_DIR = AUDIT / "role_enrichment_lanes_2026_10_06" / "D001_D056"
OUT_JSON = OUT_DIR / "D001_D056_role_enrichment_checkpoint_2026_10_07.json"
OUT_MD = OUT_DIR / "D001_D056_role_enrichment_checkpoint_2026_10_07.md"

ROLE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]
DOMAIN_META = ROOT / "domain_meta.json"
DOMAIN_STRUCTURE = ROOT / "domain_structure.json"


def norm(value: Any) -> str:
    value = str(value or "").casefold().replace("&", " and ")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def tokens(value: Any) -> set[str]:
    return {token for token in norm(value).split() if len(token) > 2}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def domain_label(domain_meta: dict[str, Any], domain_id: str) -> str:
    value = domain_meta.get(domain_id)
    if isinstance(value, dict):
        return str(value.get("name") or value.get("domain_name") or value.get("label") or value.get("title") or domain_id)
    return str(value or domain_id)


def role_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in ROLE_FILES:
        payload = load(path)
        rows.extend(payload if isinstance(payload, list) else payload.get("roles", []))
    unique: dict[str, dict[str, Any]] = {}
    for row in rows:
        unique[f"{row.get('domain_id')}|{row.get('role_name')}"] = row
    return list(unique.values())


def source(
    source_id: str,
    publisher: str,
    title: str,
    url: str,
    locator: str,
    scope: str = "global occupational reference",
    limit: str = "Official occupational profile; not proof of Nigerian vacancy, demand, licensing or universal title equivalence.",
) -> dict[str, Any]:
    return {
        "source_id": source_id,
        "publisher": publisher,
        "title": title,
        "url": url,
        "locator": locator,
        "access_date": "2026-10-07",
        "scope": scope,
        "source_limit": limit,
    }


GLOBAL_SOURCES: dict[str, dict[str, Any]] = {
    "ONET_LAWYERS": source("ONET_LAWYERS", "U.S. Department of Labor, O*NET OnLine", "Lawyers", "https://www.onetonline.org/link/details/23-1011.00", "Occupation overview, tasks and reported titles for legal advice, representation and legal research."),
    "ONET_PARALEGALS": source("ONET_PARALEGALS", "U.S. Department of Labor, O*NET OnLine", "Paralegals and Legal Assistants", "https://www.onetonline.org/link/details/23-2011.00", "Occupation overview and task table: investigate facts/law, prepare legal documents and support proceedings."),
    "ONET_MEDIATORS": source("ONET_MEDIATORS", "U.S. Department of Labor, O*NET OnLine", "Arbitrators, Mediators, and Conciliators", "https://www.onetonline.org/link/details/23-1022.00", "Occupation profile and tasks for resolving disputes, conducting hearings and preparing settlement agreements."),
    "ONET_JUDICIAL_CLERKS": source("ONET_JUDICIAL_CLERKS", "U.S. Department of Labor, O*NET OnLine", "Judicial Law Clerks", "https://www.onetonline.org/link/details/23-1012.00", "Occupation profile and related legal research/writing tasks; supports a legal-research route, not judicial appointment."),
    "ONET_COMPLIANCE_OFFICERS": source("ONET_COMPLIANCE_OFFICERS", "U.S. Department of Labor, O*NET OnLine", "Compliance Officers", "https://www.onetonline.org/link/details/13-1041.00", "Occupation overview and tasks for examining conformity with laws, licences, permits and regulations."),
    "ONET_REGULATORY_AFFAIRS": source("ONET_REGULATORY_AFFAIRS", "U.S. Department of Labor, O*NET OnLine", "Regulatory Affairs Specialists", "https://www.onetonline.org/link/details/13-1041.07", "Regulatory-affairs occupational profile and task family for regulatory submissions, requirements and compliance."),
    "ONET_COMPLIANCE_MANAGERS": source("ONET_COMPLIANCE_MANAGERS", "U.S. Department of Labor, O*NET OnLine", "Compliance Managers", "https://www.onetonline.org/link/details/11-9199.02", "Occupation profile and tasks for directing compliance systems, investigations, reporting and policy implementation."),
    "ONET_POSTSECONDARY_TEACHERS": source("ONET_POSTSECONDARY_TEACHERS", "U.S. Department of Labor, O*NET OnLine", "Education Teachers, Postsecondary", "https://www.onetonline.org/link/details/25-1081.00", "Occupation profile: teaching, curriculum work, student supervision and research/publication in postsecondary settings."),
    "ONET_POSTSECONDARY_ADMIN": source("ONET_POSTSECONDARY_ADMIN", "U.S. Department of Labor, O*NET OnLine", "Education Administrators, Postsecondary", "https://www.onetonline.org/link/details/11-9033.00", "Occupation profile for planning and coordinating instruction, administration, services and research in postsecondary institutions."),
    "ONET_SOCIAL_RESEARCH_ASSISTANTS": source("ONET_SOCIAL_RESEARCH_ASSISTANTS", "U.S. Department of Labor, O*NET OnLine", "Social Science Research Assistants", "https://www.onetonline.org/link/details/19-4061.00", "Occupation profile and research-support task family; exact discipline may vary by project."),
    "ONET_POSTSECONDARY_CTE": source("ONET_POSTSECONDARY_CTE", "U.S. Department of Labor, O*NET OnLine", "Career/Technical Education Teachers, Postsecondary", "https://www.onetonline.org/link/details/25-1194.00", "Occupation profile for teaching occupational, vocational and technical subjects in postsecondary settings."),
    "ONET_TRAINING_SPECIALISTS": source("ONET_TRAINING_SPECIALISTS", "U.S. Department of Labor, O*NET OnLine", "Training and Development Specialists", "https://www.onetonline.org/link/details/13-1151.00", "Occupation profile and tasks for designing, delivering and evaluating training programmes."),
    "ONET_INSTRUCTIONAL_COORDINATORS": source("ONET_INSTRUCTIONAL_COORDINATORS", "U.S. Department of Labor, O*NET OnLine", "Instructional Coordinators", "https://www.onetonline.org/link/details/13-9031.00", "Occupation profile for developing instructional material, coordinating curricula and evaluating educational programmes."),
    "ONET_GRAPHIC_DESIGNERS": source("ONET_GRAPHIC_DESIGNERS", "U.S. Department of Labor, O*NET OnLine", "Graphic Designers", "https://www.onetonline.org/link/details/27-1024.00", "Occupation profile and tasks for visual concepts, layouts, typography and production-ready design."),
    "ONET_ART_DIRECTORS": source("ONET_ART_DIRECTORS", "U.S. Department of Labor, O*NET OnLine", "Art Directors", "https://www.onetonline.org/link/details/27-1011.00", "Occupation profile and tasks for visual style, design direction, review and coordination of visual work."),
    "ONET_MANAGEMENT_ANALYSTS": source("ONET_MANAGEMENT_ANALYSTS", "U.S. Department of Labor, O*NET OnLine", "Management Analysts", "https://www.onetonline.org/link/details/13-1111.00", "Occupation profile and tasks for analysing organisations, procedures and policy/operational improvements."),
    "ONET_POLITICAL_SCIENTISTS": source("ONET_POLITICAL_SCIENTISTS", "U.S. Department of Labor, O*NET OnLine", "Political Scientists", "https://www.onetonline.org/link/details/19-3094.00", "Occupation profile and tasks for researching political systems, public policy and government institutions."),
    "ONET_URBAN_PLANNERS": source("ONET_URBAN_PLANNERS", "U.S. Department of Labor, O*NET OnLine", "Urban and Regional Planners", "https://www.onetonline.org/link/details/19-3051.00", "Occupation profile and tasks for public plans, land-use policy, development proposals and community needs."),
    "ONET_AUTOMOTIVE_ENGINEERS": source("ONET_AUTOMOTIVE_ENGINEERS", "U.S. Department of Labor, O*NET OnLine", "Automotive Engineers", "https://www.onetonline.org/link/details/17-2141.02", "Occupation profile and tasks for vehicle-system design, testing, failure analysis and control systems."),
    "ONET_MECHATRONICS_TECHNICIANS": source("ONET_MECHATRONICS_TECHNICIANS", "U.S. Department of Labor, O*NET OnLine", "Electro-Mechanical and Mechatronics Technologists and Technicians", "https://www.onetonline.org/link/details/17-3024.00", "Occupation profile and tasks for operating, testing, maintaining and adjusting automated/electromechanical equipment."),
    "ONET_MECHATRONICS_ENGINEERS": source("ONET_MECHATRONICS_ENGINEERS", "U.S. Department of Labor, O*NET OnLine", "Mechatronics Engineers", "https://www.onetonline.org/link/details/17-2199.05", "O*NET engineering occupation profile for integrated mechanical, electrical and control-system design."),
    "ONET_ROBOTICS_ENGINEERS": source("ONET_ROBOTICS_ENGINEERS", "U.S. Department of Labor, O*NET OnLine", "Robotics Engineers", "https://www.onetonline.org/link/details/17-2199.08", "O*NET engineering occupation profile for robotics-system design, integration and testing."),
    "ONET_INDUSTRIAL_TECHNICIANS": source("ONET_INDUSTRIAL_TECHNICIANS", "U.S. Department of Labor, O*NET OnLine", "Industrial Engineering Technologists and Technicians", "https://www.onetonline.org/link/details/17-3026.00", "Occupation profile and tasks for industrial layout, production efficiency, PLC/quality and process improvement."),
    "ONET_REAL_ESTATE_APPRAISERS": source("ONET_REAL_ESTATE_APPRAISERS", "U.S. Department of Labor, O*NET OnLine", "Appraisers and Assessors of Real Estate", "https://www.onetonline.org/link/details/13-2021.00", "Occupation profile for valuing real property, inspecting property and preparing appraisal reports."),
    "ONET_REAL_ESTATE_BROKERS": source("ONET_REAL_ESTATE_BROKERS", "U.S. Department of Labor, O*NET OnLine", "Real Estate Brokers", "https://www.onetonline.org/link/details/41-9021.00", "Occupation profile for arranging real-estate transactions, contracts, listings and negotiation."),
    "ONET_PROPERTY_MANAGERS": source("ONET_PROPERTY_MANAGERS", "U.S. Department of Labor, O*NET OnLine", "Property, Real Estate, and Community Association Managers", "https://www.onetonline.org/link/details/11-9141.00", "Occupation profile for selling, buying, leasing and governing real-estate properties and associations."),
    "ONET_CONSTRUCTION_MANAGERS": source("ONET_CONSTRUCTION_MANAGERS", "U.S. Department of Labor, O*NET OnLine", "Construction Managers", "https://www.onetonline.org/link/details/11-9021.00", "Occupation profile and tasks for construction planning, scheduling, budgets, permits, safety and implementation."),
    "ONET_COST_ESTIMATORS": source("ONET_COST_ESTIMATORS", "U.S. Department of Labor, O*NET OnLine", "Cost Estimators", "https://www.onetonline.org/link/details/13-1051.00", "Occupation profile for estimating labour, materials, time and costs of construction or production work."),
    "ONET_BUILDING_INSPECTORS": source("ONET_BUILDING_INSPECTORS", "U.S. Department of Labor, O*NET OnLine", "Construction and Building Inspectors", "https://www.onetonline.org/link/details/47-4011.00", "Occupation profile for inspecting structures and construction work for code and safety compliance."),
    "ONET_LODGING_MANAGERS": source("ONET_LODGING_MANAGERS", "U.S. Department of Labor, O*NET OnLine", "Lodging Managers", "https://www.onetonline.org/link/details/11-9081.00", "Occupation profile for coordinating accommodation operations, guest services, staffing, budgets and facilities."),
    "ONET_FOOD_SERVICE_MANAGERS": source("ONET_FOOD_SERVICE_MANAGERS", "U.S. Department of Labor, O*NET OnLine", "Food Service Managers", "https://www.onetonline.org/link/details/11-9051.00", "Occupation profile for directing food-service operations, staffing, budgets, purchasing and customer service."),
    "ONET_EVENT_PLANNERS": source("ONET_EVENT_PLANNERS", "U.S. Department of Labor, O*NET OnLine", "Meeting, Convention, and Event Planners", "https://www.onetonline.org/link/details/13-1121.00", "Occupation profile for planning, coordinating and delivering meetings, conventions and events."),
    "ONET_PETROLEUM_ENGINEERS": source("ONET_PETROLEUM_ENGINEERS", "U.S. Department of Labor, O*NET OnLine", "Petroleum Engineers", "https://www.onetonline.org/link/details/17-2171.00", "Occupation profile and tasks for drilling, reservoir/recovery methods, production and oilfield engineering."),
    "ONET_REFINERY_OPERATORS": source("ONET_REFINERY_OPERATORS", "U.S. Department of Labor, O*NET OnLine", "Petroleum Pump System Operators, Refinery Operators, and Gaugers", "https://www.onetonline.org/link/details/51-8093.00", "Occupation profile for controlling petroleum refining/processing units, pumps, valves and gauges."),
    "ONET_ROUSTABOUTS": source("ONET_ROUSTABOUTS", "U.S. Department of Labor, O*NET OnLine", "Roustabouts, Oil and Gas", "https://www.onetonline.org/link/details/47-5071.00", "Occupation profile and tasks for assembling/repairing oilfield equipment, pipes, pumps and flow lines."),
    "ONET_ROTARY_DRILL": source("ONET_ROTARY_DRILL", "U.S. Department of Labor, O*NET OnLine", "Rotary Drill Operators, Oil and Gas", "https://www.onetonline.org/link/details/47-5012.00", "Occupation profile for operating rotary drilling equipment and controlling drilling operations."),
    "ONET_CHEMICAL_ENGINEERS": source("ONET_CHEMICAL_ENGINEERS", "U.S. Department of Labor, O*NET OnLine", "Chemical Engineers", "https://www.onetonline.org/link/details/17-2041.00", "Occupation profile and tasks for chemical-process design, plant equipment, optimisation, safety and control."),
    "ONET_CHEMICAL_TECHNICIANS": source("ONET_CHEMICAL_TECHNICIANS", "U.S. Department of Labor, O*NET OnLine", "Chemical Technicians", "https://www.onetonline.org/link/details/19-4031.00", "Occupation profile and tasks for chemical analysis, sampling, laboratory/field equipment and process quality."),
    "ONET_CHEMICAL_PLANT_OPERATORS": source("ONET_CHEMICAL_PLANT_OPERATORS", "U.S. Department of Labor, O*NET OnLine", "Chemical Plant and System Operators", "https://www.onetonline.org/link/details/51-8091.00", "Occupation profile for controlling chemical plant systems, equipment and production processes."),
}


NIGERIAN_SOURCES: dict[str, dict[str, Any]] = {
    "NG_NBTE_VTSD": source("NG_NBTE_VTSD", "National Board for Technical Education", "Department of Vocational, Technical and Skills Development", "https://www.nbte.gov.ng/nbte/vtsd", "Department mandate and divisions for coordinated development of working skills, apprenticeship and National Skills Qualifications.", "Nigeria-specific TVET regulatory/context source", "Supports Nigerian training/regulatory context only; it does not prove a vacancy or demand for each role.") ,
    "NG_NBTE_TVID": source("NG_NBTE_TVID", "National Board for Technical Education", "NBTE Technical and Vocational Intelligent Dashboard", "https://dms.nbte.gov.ng/nsqf/trade-directory", "Official directory of approved Nigerian occupational standards/trades and delivery centres.", "Nigeria-specific occupational-standard context", "A listed standard/trade supports local training context, not automatic employment demand or a global occupation claim."),
    "NG_ESVARBON": source("NG_ESVARBON", "Estate Surveyors and Valuers Registration Board of Nigeria", "Official practitioner registry and regulatory mandate", "https://portal.esvarbon.gov.ng/", "Registry, licence verification and professional regulation for Estate Surveyors and Valuers in Nigeria.", "Nigeria-specific professional/regulatory context", "Supports local professional regulation and credential context; not a vacancy count."),
    "NG_NUPRC": source("NG_NUPRC", "Nigerian Upstream Petroleum Regulatory Commission", "Key mandate/functions", "https://www.nuprc.gov.ng/about/mandate", "Upstream petroleum regulation, technical standards, safe operations and environmental compliance.", "Nigeria-specific petroleum regulatory context", "Regulatory/institutional evidence; not proof of a separate role or current vacancy."),
    "NG_COREN": source("NG_COREN", "Council for the Regulation of Engineering in Nigeria", "Official practitioner registration portal", "https://www.portal.coren.gov.ng/", "Engineering-category registration, qualification and professional verification workflow.", "Nigeria-specific engineering regulatory context", "Supports Nigerian engineering registration context; does not establish local demand for every engineering title."),
    "NG_NUC": source("NG_NUC", "National Universities Commission", "Official commission portal", "https://www.nuc.edu.ng/", "Nigerian university regulation and quality-assurance context.", "Nigeria-specific higher-education context", "Institutional context only; not proof of a specific academic job or vacancy."),
}


# Each row is deliberately a title/function candidate, not a canonical edit.
CANDIDATES: list[dict[str, Any]] = [
    {"domain_id":"D037","title":"Lawyer","tasks":"Advises and represents clients, researches law, prepares legal arguments and documents, and manages legal proceedings.","fit":"Direct legal-practice occupation.","source_ids":["ONET_LAWYERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D037","title":"Paralegal and Legal Assistant","tasks":"Investigates facts and law, prepares legal documents, organises records and supports lawyers and proceedings.","fit":"Direct legal-support occupation; distinct from a licensed lawyer.","source_ids":["ONET_PARALEGALS"],"ng":[],"disposition":"add"},
    {"domain_id":"D037","title":"Arbitrator, Mediator, and Conciliator","tasks":"Conducts dispute-resolution processes, hears parties, analyses claims and helps parties reach agreements.","fit":"Direct alternative-dispute-resolution practice.","source_ids":["ONET_MEDIATORS"],"ng":[],"disposition":"add"},
    {"domain_id":"D037","title":"Judicial Law Clerk","tasks":"Performs legal research and writing and supports judicial decision-making under a court or judge.","fit":"Legal-research and court-practice route; appointment rules vary by jurisdiction.","source_ids":["ONET_JUDICIAL_CLERKS"],"ng":[],"disposition":"add"},
    {"domain_id":"D038","title":"Compliance Officer","tasks":"Examines conformity with laws, regulations, licences and permits; investigates and reports compliance issues.","fit":"Direct compliance and governance occupation.","source_ids":["ONET_COMPLIANCE_OFFICERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D038","title":"Regulatory Affairs Specialist","tasks":"Interprets regulatory requirements, prepares submissions and maintains organisational compliance with sector rules.","fit":"Direct regulatory-governance occupation.","source_ids":["ONET_REGULATORY_AFFAIRS"],"ng":[],"disposition":"add"},
    {"domain_id":"D038","title":"Compliance Manager","tasks":"Directs compliance systems, investigations, reporting, training, audits and policy implementation.","fit":"Direct management-level compliance occupation.","source_ids":["ONET_COMPLIANCE_MANAGERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D039","title":"Education Teacher, Postsecondary","tasks":"Teaches postsecondary courses, develops curriculum, supervises students and may conduct and publish research.","fit":"Direct higher-education occupation.","source_ids":["ONET_POSTSECONDARY_TEACHERS"],"ng":["NG_NUC"],"disposition":"add"},
    {"domain_id":"D039","title":"Education Administrator, Postsecondary","tasks":"Plans and coordinates instruction, administration, student services and research activities in postsecondary institutions.","fit":"Direct higher-education administration occupation.","source_ids":["ONET_POSTSECONDARY_ADMIN"],"ng":["NG_NUC"],"disposition":"add"},
    {"domain_id":"D039","title":"Social Science Research Assistant","tasks":"Supports research through data collection, coding, literature/document review, analysis and research reporting.","fit":"Direct academic-research support occupation; discipline is project-dependent.","source_ids":["ONET_SOCIAL_RESEARCH_ASSISTANTS"],"ng":["NG_NUC"],"disposition":"add"},
    {"domain_id":"D040","title":"Career/Technical Education Teacher, Postsecondary","tasks":"Teaches occupational, vocational and technical subjects to postsecondary learners and evaluates practical learning.","fit":"Direct technical-training occupation.","source_ids":["ONET_POSTSECONDARY_CTE"],"ng":["NG_NBTE_VTSD","NG_NBTE_TVID"],"disposition":"add"},
    {"domain_id":"D040","title":"Training and Development Specialist","tasks":"Designs, delivers and evaluates training programmes and identifies learning needs for workers or organisations.","fit":"Direct training-and-development occupation.","source_ids":["ONET_TRAINING_SPECIALISTS"],"ng":["NG_NBTE_VTSD"],"disposition":"add"},
    {"domain_id":"D040","title":"Instructional Coordinator","tasks":"Develops instructional materials, coordinates curricula and evaluates educational programmes and teaching methods.","fit":"Direct curriculum and instructional-quality occupation.","source_ids":["ONET_INSTRUCTIONAL_COORDINATORS"],"ng":["NG_NBTE_VTSD"],"disposition":"add"},
    {"domain_id":"D044","title":"Graphic Designer","tasks":"Creates visual concepts, layouts, typography and production-ready graphics for communication and publication.","fit":"Direct graphic-design occupation.","source_ids":["ONET_GRAPHIC_DESIGNERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D044","title":"Art Director","tasks":"Sets visual style, directs design work, reviews visual output and coordinates creative production.","fit":"Direct design-direction occupation; seniority and employer context vary.","source_ids":["ONET_ART_DIRECTORS"],"ng":[],"disposition":"add"},
    {"domain_id":"D045","title":"Management Analyst","tasks":"Studies organisational problems, procedures and performance and recommends operational or policy improvements.","fit":"Direct public-administration and policy-analysis route when applied to public institutions; sector context must be shown.","source_ids":["ONET_MANAGEMENT_ANALYSTS"],"ng":[],"disposition":"add"},
    {"domain_id":"D045","title":"Political Scientist","tasks":"Researches political systems, public policy, government institutions and political behaviour and communicates findings.","fit":"Direct public-policy research occupation.","source_ids":["ONET_POLITICAL_SCIENTISTS"],"ng":[],"disposition":"add"},
    {"domain_id":"D045","title":"Urban and Regional Planner","tasks":"Develops land-use and public-development plans, analyses community needs and advises on policy and infrastructure decisions.","fit":"Public-policy and planning occupation with direct government/community scope.","source_ids":["ONET_URBAN_PLANNERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D049","title":"Automotive Engineer","tasks":"Designs, integrates and tests vehicle systems and components, performs failure analysis and develops control or safety systems.","fit":"Direct automotive-engineering occupation.","source_ids":["ONET_AUTOMOTIVE_ENGINEERS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D049","title":"Automotive Engineering Technician","tasks":"Supports vehicle-system testing, calibration, diagnostics and engineering documentation under engineering direction.","fit":"Potential technical automotive-engineering route; the exact title boundary is not established by the source used.","source_ids":["ONET_AUTOMOTIVE_ENGINEERS"],"ng":["NG_COREN"],"disposition":"review_only"},
    {"domain_id":"D050","title":"Mechatronics Engineer","tasks":"Designs and integrates mechanical, electrical, electronic and control systems for automated equipment.","fit":"Direct industrial-automation engineering occupation.","source_ids":["ONET_MECHATRONICS_ENGINEERS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D050","title":"Robotics Engineer","tasks":"Designs, integrates, programs and tests robotic systems and their control and sensing components.","fit":"Direct automation and robotics occupation.","source_ids":["ONET_ROBOTICS_ENGINEERS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D050","title":"Electro-Mechanical and Mechatronics Technologist/Technician","tasks":"Operates, tests, maintains and adjusts automated, electromechanical and process-control equipment.","fit":"Direct industrial-automation technician occupation.","source_ids":["ONET_MECHATRONICS_TECHNICIANS"],"ng":["NG_COREN","NG_NBTE_TVID"],"disposition":"add"},
    {"domain_id":"D050","title":"Industrial Engineering Technologist/Technician","tasks":"Improves industrial layouts, production efficiency, PLC/quality processes and manufacturing operations under engineering direction.","fit":"Direct manufacturing-automation/process-improvement route.","source_ids":["ONET_INDUSTRIAL_TECHNICIANS"],"ng":["NG_COREN","NG_NBTE_TVID"],"disposition":"add"},
    {"domain_id":"D051","title":"Appraiser and Assessor of Real Estate","tasks":"Inspects and values real property and prepares appraisal reports for transactions, taxation, lending or other decisions.","fit":"Direct real-estate valuation occupation.","source_ids":["ONET_REAL_ESTATE_APPRAISERS"],"ng":["NG_ESVARBON"],"disposition":"add"},
    {"domain_id":"D051","title":"Real Estate Broker","tasks":"Arranges real-estate transactions, listings, contracts, negotiation and client representation.","fit":"Direct real-estate transaction occupation; licensing varies by jurisdiction.","source_ids":["ONET_REAL_ESTATE_BROKERS"],"ng":["NG_ESVARBON"],"disposition":"add"},
    {"domain_id":"D051","title":"Property, Real Estate, and Community Association Manager","tasks":"Coordinates buying, selling, leasing, governance, maintenance and finances of real-estate properties or associations.","fit":"Direct real-estate operations and management occupation.","source_ids":["ONET_PROPERTY_MANAGERS"],"ng":["NG_ESVARBON"],"disposition":"add"},
    {"domain_id":"D052","title":"Construction Manager","tasks":"Plans, schedules, budgets and supervises construction projects, permits, safety, quality and implementation.","fit":"Direct construction-management occupation.","source_ids":["ONET_CONSTRUCTION_MANAGERS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D052","title":"Cost Estimator","tasks":"Estimates labour, materials, time and costs for construction or production projects and prepares cost information.","fit":"Direct construction cost-planning occupation.","source_ids":["ONET_COST_ESTIMATORS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D052","title":"Construction and Building Inspector","tasks":"Inspects construction work and structures for compliance with building, safety and related regulations.","fit":"Direct construction-compliance and inspection occupation.","source_ids":["ONET_BUILDING_INSPECTORS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D053","title":"Lodging Manager","tasks":"Coordinates accommodation operations, guest services, staffing, budgets, facilities and service quality.","fit":"Direct hospitality-operations occupation.","source_ids":["ONET_LODGING_MANAGERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D053","title":"Food Service Manager","tasks":"Directs food-service operations, staffing, budgets, purchasing, safety and customer service.","fit":"Direct hospitality-food-service management occupation.","source_ids":["ONET_FOOD_SERVICE_MANAGERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D053","title":"Meeting, Convention, and Event Planner","tasks":"Plans, coordinates and delivers meetings, conventions and events, including vendors, schedules, facilities and budgets.","fit":"Direct hospitality/events occupation.","source_ids":["ONET_EVENT_PLANNERS"],"ng":[],"disposition":"add"},
    {"domain_id":"D054","title":"Petroleum Engineer","tasks":"Develops drilling, reservoir and recovery methods, monitors production and advises on oil-and-gas operations.","fit":"Direct upstream petroleum-engineering occupation.","source_ids":["ONET_PETROLEUM_ENGINEERS"],"ng":["NG_NUPRC"],"disposition":"add"},
    {"domain_id":"D054","title":"Petroleum Pump System/Refinery Operator","tasks":"Controls petroleum refining or processing units, pumps, valves, gauges and flow into or out of pipelines and tanks.","fit":"Direct petroleum-operations occupation; exact employer title varies.","source_ids":["ONET_REFINERY_OPERATORS"],"ng":["NG_NUPRC"],"disposition":"add"},
    {"domain_id":"D054","title":"Roustabout, Oil and Gas","tasks":"Assembles and repairs oilfield equipment, pipes, casing, pumps and flow lines using hand and power tools.","fit":"Direct oil-and-gas field-operations occupation.","source_ids":["ONET_ROUSTABOUTS"],"ng":["NG_NUPRC","NG_NBTE_TVID"],"disposition":"add"},
    {"domain_id":"D054","title":"Rotary Drill Operator, Oil and Gas","tasks":"Operates rotary drilling equipment and controls drilling operations at oil-and-gas sites.","fit":"Direct drilling-operations occupation.","source_ids":["ONET_ROTARY_DRILL"],"ng":["NG_NUPRC"],"disposition":"add"},
    {"domain_id":"D055","title":"Chemical Engineer","tasks":"Designs chemical-process equipment and processes, optimises production, monitors control variables and develops safety procedures.","fit":"Direct chemical-engineering occupation.","source_ids":["ONET_CHEMICAL_ENGINEERS"],"ng":["NG_COREN"],"disposition":"add"},
    {"domain_id":"D055","title":"Chemical Technician","tasks":"Analyses compounds, collects samples, operates laboratory/field equipment and monitors process quality and standards.","fit":"Direct chemical-technical occupation.","source_ids":["ONET_CHEMICAL_TECHNICIANS"],"ng":["NG_COREN","NG_NBTE_TVID"],"disposition":"add"},
    {"domain_id":"D055","title":"Chemical Plant and System Operator","tasks":"Controls chemical plant systems and equipment and monitors production processes, indicators and safe operating conditions.","fit":"Direct chemical-plant operations occupation.","source_ids":["ONET_CHEMICAL_PLANT_OPERATORS"],"ng":["NG_COREN","NG_NBTE_TVID"],"disposition":"add"},
]


def main() -> None:
    roles = role_rows()
    active = [r for r in roles if str(r.get("student_path_status") or "").casefold() != "excluded"]
    domain_names = load(DOMAIN_META)
    structure = load(DOMAIN_STRUCTURE)
    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in active:
        by_domain[str(row.get("domain_id"))].append(row)

    entries: list[dict[str, Any]] = []
    for candidate in CANDIDATES:
        candidate_norm = norm(candidate["title"])
        exact: list[str] = []
        aliases: list[str] = []
        cross_domain: list[dict[str, str]] = []
        for row in active:
            role_norm = norm(row.get("role_name"))
            alias_values = [x for x in re.split(r"\s*[;,|·]\s*", str(row.get("also_known_as") or "")) if x]
            if role_norm == candidate_norm:
                if str(row.get("domain_id")) == candidate["domain_id"]:
                    exact.append(str(row.get("role_name")))
                else:
                    cross_domain.append({"domain_id": str(row.get("domain_id")), "role_name": str(row.get("role_name"))})
            if candidate_norm in {norm(x) for x in alias_values}:
                if str(row.get("domain_id")) == candidate["domain_id"]:
                    aliases.append(str(row.get("role_name")))
                else:
                    cross_domain.append({"domain_id": str(row.get("domain_id")), "role_name": str(row.get("role_name"))})

        disposition = candidate["disposition"]
        reason = "The title is an established occupation and the cited task scope directly fits the parent domain; no same-domain exact/alias duplicate was found. This is a recommendation, not a canonical edit."
        if exact or aliases:
            disposition = "alias_existing"
            reason = "The same title or an explicit alias already exists in the same domain; retain one canonical identity."
        elif cross_domain and disposition == "add":
            disposition = "review_only"
            reason = "The title exists elsewhere in the catalogue; a cross-domain route may be valid, but it requires parent-domain and route adjudication before reuse."
        elif disposition == "review_only":
            reason = "The task family is plausible, but the exact title or technical boundary is not established strongly enough for a canonical addition."

        entries.append({
            "candidate_key": f"{candidate['domain_id']}|{candidate['title']}",
            "domain_id": candidate["domain_id"],
            "domain_name": domain_label(domain_names, candidate["domain_id"]),
            "title_or_family": candidate["title"],
            "candidate_tasks": candidate["tasks"],
            "parent_domain_fit": candidate["fit"],
            "title_status": "established occupation title" if candidate["disposition"] == "add" else "title/task boundary requires review",
            "existing_active_exact_matches": sorted(set(exact)),
            "existing_active_alias_matches": sorted(set(aliases)),
            "existing_active_cross_domain_matches": sorted({f"{x['domain_id']}|{x['role_name']}" for x in cross_domain}),
            "global_sources": [GLOBAL_SOURCES[sid] for sid in candidate["source_ids"]],
            "nigerian_context_sources": [NIGERIAN_SOURCES[sid] for sid in candidate["ng"]],
            "nigerian_context_claim_limit": "Local regulation, training or institutional context is separate from global role identity and is not treated as proof of Nigerian vacancy or demand.",
            "disposition": disposition,
            "disposition_reason": reason,
            "canonical_role_addition": False,
            "canonical_files_edited": False,
        })

    target_domains = sorted({f"D{i:03d}" for i in range(1, 57) if len(by_domain.get(f"D{i:03d}", [])) <= 8})
    gaps = []
    for domain_id in target_domains:
        gaps.append({
            "domain_id": domain_id,
            "domain_name": domain_label(domain_names, domain_id),
            "active_role_count": len(by_domain.get(domain_id, [])),
            "candidate_count": sum(1 for x in entries if x["domain_id"] == domain_id),
            "has_visible_subgroup": bool((structure.get(domain_id) or {}).get("subgroups")),
            "action": "Review candidate records; do not add merely to reach a numeric floor.",
        })

    counts = Counter(row["disposition"] for row in entries)
    out = {
        "schema_version": "2026-10-07.role-enrichment-lane.v1",
        "lane": "D001-D056",
        "run_date": str(date.today()),
        "access_date": "2026-10-07",
        "status": "checkpoint_complete_for_sparse_zero_role_inventory; canonical_application_not_started",
        "scope": "Internet-backed role enrichment for sparse and zero-role domains in D001-D056, with global occupational evidence separated from Nigerian context.",
        "prior_checkpoint": None,
        "method": [
            "Inspected all active records in role_library_v3_cleaned.json, thin_domain_role_overlays.json and emerging_role_overlays.json before proposing candidates.",
            "Targeted domains with eight or fewer active role records; this is a coverage triage, not a claim that a numeric role floor is required.",
            "Used official O*NET occupational profiles as global role/task evidence and recorded the exact URL and locator for each candidate.",
            "Used Nigerian official regulatory/training sources only as separately labelled context; they do not establish Nigerian demand.",
            "Checked exact titles and aliases across the merged active role inventory, not just within one source file.",
            "Did not infer role fit from ISCO membership, current subgroup membership or a Nigerian policy/training source.",
        ],
        "counts": {
            "merged_role_records": len(roles),
            "active_role_records": len(active),
            "candidate_records": len(entries),
            "candidate_domains": len({x["domain_id"] for x in entries}),
            "dispositions": dict(sorted(counts.items())),
            "domains_with_eight_or_fewer_active_roles": len(target_domains),
            "domains_with_zero_active_roles": sum(1 for x in gaps if x["active_role_count"] == 0),
        },
        "coverage_gaps": gaps,
        "source_catalog": {**GLOBAL_SOURCES, **NIGERIAN_SOURCES},
        "entries": entries,
        "integrity": {
            "all_candidates_have_candidate_key": all(x.get("candidate_key") for x in entries),
            "all_entries_have_disposition": all(x.get("disposition") in {"add", "alias_existing", "review_only", "not_add"} for x in entries),
            "all_global_sources_have_direct_urls": all(x["global_sources"] and all(s.get("url") for s in x["global_sources"]) for x in entries),
            "canonical_files_edited": False,
            "isco_used_as_fit_proof": False,
            "nigerian_context_used_as_role_proof": False,
        },
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D001–D056 role-enrichment checkpoint — 2026-10-07",
        "",
        "This lane is a review-only artifact. It does not edit `role_library_v3_cleaned.json`, `thin_domain_role_overlays.json`, `emerging_role_overlays.json`, or `domain_structure.json`.",
        "",
        f"Candidate records: **{len(entries)}** across **{len({x['domain_id'] for x in entries})}** sparse/zero-role domains.",
        f"Dispositions: **{counts.get('add', 0)} add candidates**, **{counts.get('alias_existing', 0)} alias-existing**, **{counts.get('review_only', 0)} review-only**.",
        "",
        "## Decision boundary",
        "",
        "`add` means an established global occupational candidate for later local canonical review, not an automatic insertion. `alias_existing` means the title or alias is already represented in the same domain. `review_only` marks an adjacent or title-boundary case that should not be promoted without another fit decision. Nigerian sources are context only and never evidence of Nigerian demand.",
        "",
        "## Sparse-domain inventory",
        "",
    ]
    for gap in gaps:
        lines.append(f"- **{gap['domain_id']} {gap['domain_name']}** — {gap['active_role_count']} active roles; {gap['candidate_count']} candidate records; visible area path: `{gap['has_visible_subgroup']}`.")
    lines += [
        "",
        "## Nigerian context sources used",
        "",
        "- [NBTE vocational, technical and skills development](https://www.nbte.gov.ng/nbte/vtsd) and [NBTE TVID trade directory](https://dms.nbte.gov.ng/nsqf/trade-directory): Nigerian TVET and occupational-standard context, not automatic demand evidence.",
        "- [ESVARBON official registry](https://portal.esvarbon.gov.ng/): Nigerian estate-surveying/valuation regulation and credential context.",
        "- [NUPRC mandate](https://www.nuprc.gov.ng/about/mandate): Nigerian upstream petroleum regulatory context, not a vacancy list.",
        "- [COREN registration portal](https://www.portal.coren.gov.ng/): Nigerian engineering registration context, not proof of demand for every engineering title.",
        "- [NUC](https://www.nuc.edu.ng/): Nigerian higher-education regulatory context, not evidence of a particular academic vacancy.",
        "",
        "## Integrity",
        "",
        "The candidate records preserve exact URLs, locators, access dates, task scope, parent-domain fit, duplicate/alias results and evidence limits. No canonical file was edited. A later integration pass must recheck every `add` candidate against the then-current role files before applying anything.",
    ]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": out["counts"]}, indent=2))


if __name__ == "__main__":
    main()
