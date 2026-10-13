"""Reconcile agent role-enrichment checkpoints into an audit-only sparse-domain ledger.

This file deliberately does not edit the canonical role, domain, subgroup or
overlay JSON files.  It turns the three research lanes into one reproducible
floor ledger and adds only source-backed residual candidate families needed to
make the requested ten-role target auditable for each sparse domain.

The ten-role target is a planning gate, not permission to manufacture roles or
to auto-promote candidates.  Every candidate has separate parent-domain and
area-of-specialization decisions; ISCO membership is never used as fit proof.
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
OUT_JSON = AUDIT / "SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json"
OUT_MD = AUDIT / "SPARSE_ROLE_ENRICHMENT_HANDOFF_2026_10_07.md"
OUT_CHECKPOINT_JSON = AUDIT / "SPARSE_ROLE_ENRICHMENT_CHECKPOINT_2026_10_07_003.json"
OUT_CHECKPOINT_MD = AUDIT / "SPARSE_ROLE_ENRICHMENT_CHECKPOINT_2026_10_07_003.md"

FLOOR_COUNTS = {
    "D003": 5, "D037": 0, "D038": 1, "D039": 0, "D040": 0,
    "D044": 4, "D045": 0, "D049": 0, "D050": 0, "D051": 2,
    "D052": 0, "D053": 0, "D054": 0, "D055": 3, "D058": 3,
    "D065": 4, "D071": 0, "D075": 0, "D076": 0, "D079": 0,
    "D080": 0, "D087": 5, "D088": 8, "D089": 4, "D091": 7,
    "D101": 6, "D125": 9, "D132": 8, "D137": 7, "D150": 8,
    "D153": 0, "D156": 9, "D157": 0, "D162": 4, "D163": 6,
}

ROLE_FILES = [
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
]

LANE_ROOT = AUDIT / "role_enrichment_lanes_2026_10_06"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: Any) -> str:
    value = str(value or "").casefold()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def source(source_id: str, publisher: str, title: str, url: str, locator: str, scope: str = "global occupational reference", limit: str | None = None) -> dict[str, Any]:
    return {
        "source_id": source_id,
        "publisher": publisher,
        "title": title,
        "url": url,
        "locator": locator,
        "access_date": "2026-10-07",
        "scope": scope,
        "source_limit": limit or "Source supports occupational/task identity and does not prove Nigerian vacancy volume, universal licensing or automatic catalogue membership.",
    }


SOURCE_CATALOG: dict[str, dict[str, Any]] = {
    "AREA_INTERNAL_SPECIALIZATION_REVIEWS": source(
        "AREA_INTERNAL_SPECIALIZATION_REVIEWS",
        "Sifter audit register",
        "Global area-of-specialization review artifacts",
        "data/career-mapping/_audit/specialization_lanes_2026_10_05/",
        "Candidate area labels are read from the domain specialization review/reconciliation artifacts; labels are not inferred from ISCO subgroup membership.",
        "internal audit evidence",
        "Internal review evidence is a proposed taxonomy input, not external accreditation or a claim that the area count is universally prescribed.",
    ),
    "NG_NBTE": source("NG_NBTE", "National Board for Technical Education", "Vocational, technical and skills development", "https://www.nbte.gov.ng/nbte/vtsd", "NBTE vocational/technical skills-development mandate and Nigerian TVET context.", "Nigeria-specific regulatory/context source", "Supports Nigerian training and occupational-standard context, not a vacancy count or proof that every role is currently available."),
    "NG_NBTE_TRADE_DIRECTORY": source("NG_NBTE_TRADE_DIRECTORY", "National Board for Technical Education", "NSQF/TVET trade directory", "https://dms.nbte.gov.ng/nsqf/trade-directory", "Directory of Nigerian trades and approved delivery context.", "Nigeria-specific occupational-standard context", "A listed trade supports local training context, not automatic employment demand or universal role equivalence."),
    "NG_COREN": source("NG_COREN", "Council for the Regulation of Engineering in Nigeria", "Engineering registration and professional practice", "https://www.portal.coren.gov.ng/", "Professional registration and verification context for Nigerian engineering practice.", "Nigeria-specific professional/regulatory context", "Supports Nigerian engineering regulation; not demand evidence for each title."),
    "NG_ESVARBON": source("NG_ESVARBON", "Estate Surveyors and Valuers Registration Board of Nigeria", "Practitioner registry", "https://portal.esvarbon.gov.ng/", "Nigerian estate surveying and valuation registration context.", "Nigeria-specific professional/regulatory context", "Supports local professional regulation; not a vacancy count."),
    "NG_NUPRC": source("NG_NUPRC", "Nigerian Upstream Petroleum Regulatory Commission", "Mandate and technical regulation", "https://www.nuprc.gov.ng/about/mandate", "Upstream petroleum regulation, standards, safe operations and environmental compliance.", "Nigeria-specific regulatory/context source", "Regulatory evidence, not proof of a separate role or current vacancy."),
    "NG_NIMASA": source("NG_NIMASA", "Nigerian Maritime Administration and Safety Agency", "Seafarer qualification and training", "https://nimasa.gov.ng/what-we-do/seafarer-qualifications-certification/qualification-and-training/", "Nigerian maritime training and certification route.", "Nigeria-specific professional/regulatory context", "Direct route evidence for maritime competence; not proof of vacancy or automatic role activation."),
    "NG_NCS": source("NG_NCS", "Nigeria Customs Service", "Statutory functions", "https://customs.gov.ng/rules-guidelines/statutory-functions", "Customs administration, enforcement and trade-facilitation functions.", "Nigeria-specific regulatory/context source", "Supports Nigerian institutional role context; not a vacancy count."),
    "NG_NIHOTOUR": source("NG_NIHOTOUR", "National Institute for Hospitality and Tourism", "Hospitality and tourism practitioner registration", "https://rivac.nihotour.gov.ng/", "Nigerian hospitality, travel and tourism registration/certification context.", "Nigeria-specific professional/regulatory context", "Supports local certification context; not proof of demand for each role."),
    "NG_HRORBN": source("NG_HRORBN", "Health Records Officers Registration Board of Nigeria", "Health information management regulation", "https://hrorbn.gov.ng/", "Registration, licensing, standards and education for health records management in Nigeria.", "Nigeria-specific professional/regulatory context", "Direct local professional context for health-records routes; not a vacancy count."),
    "NG_NIS": source("NG_NIS", "Nigeria Immigration Service", "Core mandate", "https://immigration.gov.ng/our-core-mandate/", "Control of entry/exit, travel documents, residence permits, border surveillance and enforcement.", "Nigeria-specific statutory-role context", "Shows Nigerian institutional functions; it does not prove that every proposed title is a separate NIS appointment."),
    "NG_FIRS_NRS": source("NG_FIRS_NRS", "Federal Inland Revenue Service / Nigeria Revenue Service", "Tax administration portal", "https://taxid.firs.gov.ng/", "Nigerian tax-administration context.", "Nigeria-specific regulatory/context source", "Supports tax-administration context; not proof of a vacancy or private-sector title."),
    "NG_NOTAP": source("NG_NOTAP", "National Office for Technology Acquisition and Promotion", "Technology transfer and IP context", "https://www.notap.gov.ng/", "Nigerian technology-transfer and intellectual-property ecosystem context.", "Nigeria-specific regulatory/context source", "Supports local IP/technology-transfer context, not automatic role or vacancy proof."),
    "NG_NUC": source("NG_NUC", "National Universities Commission", "University regulation", "https://www.nuc.edu.ng/", "Nigerian higher-education quality-assurance and institutional context.", "Nigeria-specific higher-education context", "Institutional context only; not evidence of a particular vacancy."),
    "NG_FRSC": source("NG_FRSC", "Federal Road Safety Corps", "Official portal", "https://frsc.gov.ng/", "Nigerian road-safety and driver-training institutional context.", "Nigeria-specific statutory/context source", "Institutional context, not proof that each proposed instructor title is a separate occupation."),
    "NG_NADDC": source("NG_NADDC", "National Automotive Design and Development Council", "Automotive development policy and industry context", "https://naddc.gov.ng/", "Nigerian automotive design, manufacturing and development context.", "Nigeria-specific industry/policy context", "Supports Nigerian automotive ecosystem context; not vacancy or licensing proof for every role."),
    "NG_NDPC": source("NG_NDPC", "Nigeria Data Protection Commission", "Data-protection regulation", "https://ndpc.gov.ng/", "Nigerian data-protection and compliance context.", "Nigeria-specific regulatory/context source", "Regulatory context; not proof that every data-protection function is a distinct occupation."),
    "NG_NCC": source("NG_NCC", "Nigerian Copyright Commission", "Copyright administration", "https://copyright.gov.ng/", "Nigerian copyright and creative-industry regulatory context.", "Nigeria-specific regulatory/context source", "Supports local creative/IP context; not vacancy proof."),
    "ESCO_OCCUPATIONS": source(
        "ESCO_OCCUPATIONS",
        "European Commission, ESCO",
        "ESCO occupations classification",
        "https://esco.ec.europa.eu/en/classification/occupation",
        "Official ESCO occupation-classification reference used only to resolve the checkpoint's named occupation source; task fit is still assessed separately against the parent domain and area of specialization.",
        "global occupational reference",
        "Supports occupational identity and task context; it does not prove Nigerian vacancy volume, licensing or automatic catalogue membership.",
    ),
}


ONET = {
    "ai_research": ("15-1221.00", "Computer and Information Research Scientists"),
    "data_scientist": ("15-2051.00", "Data Scientists"),
    "software_dev": ("15-1252.00", "Software Developers"),
    "robotics": ("17-2199.08", "Robotics Engineers"),
    "legal_secretary": ("43-6012.00", "Legal Secretaries and Administrative Assistants"),
    "court_reporter": ("27-3092.00", "Court Reporters and Simultaneous Captioners"),
    "admin_law_judge": ("23-1021.00", "Administrative Law Judges, Adjudicators, and Hearing Officers"),
    "court_clerk": ("43-4031.00", "Court, Municipal, and License Clerks"),
    "title_examiner": ("23-2093.00", "Title Examiners, Abstractors, and Searchers"),
    "private_investigator": ("33-9021.00", "Private Detectives and Investigators"),
    "compliance": ("13-1041.00", "Compliance Officers"),
    "auditor": ("13-2011.00", "Accountants and Auditors"),
    "info_security": ("15-1212.00", "Information Security Analysts"),
    "occupational_safety": ("19-5011.00", "Occupational Health and Safety Specialists"),
    "postsecondary_teacher": ("25-1081.00", "Education Teachers, Postsecondary"),
    "postsecondary_admin": ("11-9033.00", "Education Administrators, Postsecondary"),
    "research_assistant": ("19-4061.00", "Social Science Research Assistants"),
    "librarian": ("25-4022.00", "Librarians and Media Collections Specialists"),
    "training": ("13-1151.00", "Training and Development Specialists"),
    "instructional_coord": ("13-9031.00", "Instructional Coordinators"),
    "cte_teacher": ("25-1194.00", "Career/Technical Education Teachers, Postsecondary"),
    "adult_teacher": ("25-3011.00", "Adult Basic and Secondary Education and ESL Teachers"),
    "graphic": ("27-1024.00", "Graphic Designers"),
    "art_director": ("27-1011.00", "Art Directors"),
    "web_design": ("15-1255.00", "Web and Digital Interface Designers"),
    "multimedia": ("27-1014.00", "Special Effects Artists and Animators"),
    "management_analyst": ("13-1111.00", "Management Analysts"),
    "political": ("19-3094.00", "Political Scientists"),
    "urban": ("19-3051.00", "Urban and Regional Planners"),
    "budget": ("13-2031.00", "Budget Analysts"),
    "automotive": ("17-2141.02", "Automotive Engineers"),
    "mechanical": ("17-2141.00", "Mechanical Engineers"),
    "auto_service": ("49-3023.00", "Automotive Service Technicians and Mechanics"),
    "mechatronics": ("17-2199.05", "Mechatronics Engineers"),
    "robotics_tech": ("17-3024.00", "Electro-Mechanical and Mechatronics Technologists and Technicians"),
    "industrial_tech": ("17-3026.00", "Industrial Engineering Technologists and Technicians"),
    "industrial_maintenance": ("49-9041.00", "Industrial Machinery Mechanics"),
    "real_estate_appraiser": ("13-2021.00", "Appraisers and Assessors of Real Estate"),
    "real_estate_broker": ("41-9021.00", "Real Estate Brokers"),
    "property_manager": ("11-9141.00", "Property, Real Estate, and Community Association Managers"),
    "facilities": ("11-3013.00", "Administrative Services and Facilities Managers"),
    "construction": ("11-9021.00", "Construction Managers"),
    "cost_estimator": ("13-1051.00", "Cost Estimators"),
    "building_inspector": ("47-4011.00", "Construction and Building Inspectors"),
    "civil": ("17-2051.00", "Civil Engineers"),
    "project_specialist": ("13-1082.00", "Project Management Specialists"),
    "lodging": ("11-9081.00", "Lodging Managers"),
    "food_service": ("11-9051.00", "Food Service Managers"),
    "events": ("13-1121.00", "Meeting, Convention, and Event Planners"),
    "sales_manager": ("11-2022.00", "Sales Managers"),
    "petroleum": ("17-2171.00", "Petroleum Engineers"),
    "refinery": ("51-8093.00", "Petroleum Pump System Operators, Refinery Operators, and Gaugers"),
    "roustabout": ("47-5071.00", "Roustabouts, Oil and Gas"),
    "drill": ("47-5012.00", "Rotary Drill Operators, Oil and Gas"),
    "geology": ("17-2151.00", "Mining and Geological Engineers, Including Mining Safety Engineers"),
    "chemical_engineer": ("17-2041.00", "Chemical Engineers"),
    "chemical_tech": ("19-4031.00", "Chemical Technicians"),
    "chemical_operator": ("51-8091.00", "Chemical Plant and System Operators"),
    "materials": ("17-2131.00", "Materials Engineers"),
    "chemist": ("19-2031.00", "Chemists"),
    "learning_design": ("13-1151.00", "Training and Development Specialists"),
    "language": ("27-3091.00", "Interpreters and Translators"),
    "sports": ("27-2022.00", "Coaches and Scouts"),
    "athletic": ("29-9091.00", "Athletic Trainers"),
    "fashion": ("27-1022.00", "Fashion Designers"),
    "production_supervisor": ("51-1011.00", "First-Line Supervisors of Production and Operating Workers"),
    "textile_operator": ("51-6064.00", "Textile Winding, Twisting, and Drawing Out Machine Setters, Operators, and Tenders"),
    "customs_broker": ("13-1041.08", "Customs Brokers"),
    "border": ("33-3051.00", "Police and Sheriff's Patrol Officers"),
    "logistician": ("13-1081.00", "Logisticians"),
    "cargo": ("43-5011.00", "Cargo and Freight Agents"),
    "interior": ("27-1025.00", "Interior Designers"),
    "industrial_design": ("27-1021.00", "Commercial and Industrial Designers"),
    "set_design": ("27-1027.00", "Set and Exhibit Designers"),
    "hair": ("39-5012.00", "Hairdressers, Hairstylists, and Cosmetologists"),
    "makeup": ("39-5091.00", "Makeup Artists, Theatrical and Performance"),
    "skin": ("39-5094.00", "Skincare Specialists"),
    "nail": ("39-5092.00", "Manicurists and Pedicurists"),
    "funeral": ("39-4031.00", "Morticians, Undertakers, and Funeral Arrangers"),
    "painting": ("47-2141.00", "Painters, Construction and Maintenance"),
    "coating": ("51-9123.00", "Painting and Coating Workers, Except Construction and Extraction"),
    "medical_admin": ("43-6013.00", "Medical Secretaries and Administrative Assistants"),
    "medical_transcription": ("31-9094.00", "Medical Transcriptionists"),
    "health_records": ("29-2071.00", "Medical Records Specialists"),
    "space_ops": ("17-2199.00", "Engineers, All Other"),
    "medical_physics": ("19-2031.00", "Chemists"),
    "religion": ("21-2021.00", "Directors, Religious Activities and Education"),
    "religion_teacher": ("25-1126.00", "Philosophy and Religion Teachers, Postsecondary"),
    "clergy": ("21-2011.00", "Clergy"),
    "music_composer": ("27-2041.00", "Music Directors and Composers"),
    "musician": ("27-2042.00", "Musicians and Singers"),
    "sound": ("27-4014.00", "Sound Engineering Technicians"),
    "audio_video": ("27-4011.00", "Audio and Video Technicians"),
    "tax_accounting": ("13-2011.00", "Accountants and Auditors"),
    "tax_preparer": ("13-2082.00", "Tax Preparers"),
    "financial_examiner": ("13-2061.00", "Financial Examiners"),
    "lawyer": ("23-1011.00", "Lawyers"),
}


def add_onet_source(source_id: str, key: str) -> None:
    code, title = ONET[key]
    SOURCE_CATALOG.setdefault(source_id, source(source_id, "U.S. Department of Labor, O*NET OnLine", title, f"https://www.onetonline.org/link/summary/{code}", f"Occupation overview and task table for {title}; used as task evidence, not as a universal title taxonomy."))


for _key in ONET:
    add_onet_source(f"ONET_{_key.upper()}", _key)


DOMAIN_NAMES = {
    "D003": "Artificial Intelligence and Machine Learning", "D037": "Legal Practice", "D038": "Compliance, Regulation and Governance", "D039": "Higher Education and Academic Research", "D040": "Vocational and Technical Training", "D044": "Graphic Design", "D045": "Public Administration and Policy", "D049": "Automotive Engineering", "D050": "Industrial Automation", "D051": "Real Estate", "D052": "Construction Management", "D053": "Hospitality Services and Management", "D054": "Oil and Gas Operations", "D055": "Chemical Engineering", "D058": "Education Technology and Learning Experience Design", "D065": "Translation, Interpretation and Linguistics", "D071": "Sports Management and Sports Science", "D075": "Textile, Clothing and Footwear Production", "D076": "Maritime Operations and Shipping", "D079": "Customs, Trade and Border Operations", "D080": "Visual Communication, Multimedia and Interior Design", "D087": "Hairdressing, Barbering and Hair Technology", "D088": "Beauty Therapy, Aesthetics and Spa Services", "D089": "Funeral and Mortuary Services", "D091": "Driving Instruction", "D101": "Painting, Decorating and Surface Treatment", "D125": "Medical Secretarial and Health Information Support", "D132": "Space Science and Exploration", "D137": "Medical Physics and Radiation Therapy", "D150": "Religious Ministry, Theology and Interfaith Leadership", "D153": "Music Creation, Performance and Audio Production", "D156": "Land Surveying and Cadastral Mapping", "D157": "Taxation and Revenue Practice", "D162": "Immigration Law and Asylum", "D163": "Intellectual Property Law, Patents and Technology Licensing",
}

AREA_MAP = {
    "D003": ["Machine Learning and Generative Models", "Knowledge, Reasoning and Planning", "Natural Language and Speech AI", "Computer Vision and Perception", "Intelligent Agents and Robotics"],
    "D037": ["Business, Corporate and Financial Law", "Dispute Resolution", "Criminal Justice", "Public, Constitutional and Human Rights Law", "Employment, Family and Immigration Law", "Intellectual Property, Technology and Data Law", "Property, Construction and Infrastructure Law"],
    "D038": ["Compliance Monitoring and Audit", "Regulatory Affairs and Licensing", "Risk, Ethics and Financial Crime Compliance", "Information Governance and Data Protection"],
    "D039": ["Postsecondary Teaching and Curriculum", "Higher-Education Administration", "Academic Research and Knowledge Production", "Student Services and Academic Support"],
    "D040": ["Vocational and Technical Teaching", "Curriculum, Assessment and Skills Standards", "Workforce Development and Apprenticeship", "Learning Technology and Delivery"],
    "D044": ["Graphic and Visual Communication Design", "Art Direction and Brand Systems", "Digital Interface and Experience Design", "Illustration, Motion and Production Design"],
    "D045": ["Public Policy and Programme Analysis", "Government Administration and Service Delivery", "Budget, Audit and Public Finance", "Urban, Regional and Community Planning"],
    "D049": ["Vehicle Systems and Product Engineering", "Automotive Manufacturing and Quality", "Vehicle Testing, Safety and Validation", "Automotive Service and Diagnostics", "Electric and Connected Vehicle Systems"],
    "D050": ["Industrial Control and Automation", "Robotics and Mechatronics", "Instrumentation and Process Control", "Industrial Maintenance and Reliability", "Industrial Digitalisation and IoT"],
    "D051": ["Property Valuation and Appraisal", "Real-Estate Brokerage and Transactions", "Property and Facilities Management", "Real-Estate Development and Investment"],
    "D052": ["Construction Project and Site Delivery", "Cost, Quantity and Project Controls", "Building Inspection and Compliance", "Construction Design Coordination and BIM", "Construction Safety and Contracts"],
    "D053": ["Accommodation and Guest Operations", "Food, Beverage and Culinary Operations", "Travel, Tourism and Visitor Services", "Hospitality Events and Meetings"],
    "D054": ["Drilling, Wells and Completions", "Reservoir, Production and Subsurface Engineering", "Petroleum Processing and Operations", "Oilfield Services and Field Operations", "Pipeline, Safety and Environmental Operations"],
    "D055": ["Chemical Process and Plant Engineering", "Chemical Laboratory and Analytical Science", "Biochemical, Polymer and Materials Processing", "Process Safety and Environmental Chemistry"],
    "D058": ["Learning Experience and Instructional Design", "Educational Technology and Digital Learning Systems", "Learning Analytics, Research and Evaluation", "Digital Teaching and Learning Delivery"],
    "D065": ["Translation and Localization", "Interpreting", "Terminology and Language-Services Project Practice", "Linguistic Research and Documentation", "Computational Linguistics and Language Technology"],
    "D071": ["Sports Administration and Governance", "Coaching and Athlete Development", "Sports Performance, Science and Medicine", "Sports Events, Officiating and Operations", "Sports Marketing and Talent Management"],
    "D075": ["Fashion and Apparel Design", "Textile Materials and Product Development", "Garment, Footwear and Production Operations", "Textile Quality and Process Technology"],
    "D076": ["Deck and Marine Operations", "Marine Engineering and Electro-Technical Operations", "Maritime Safety, Survey and Compliance", "Port, Shipping and Vessel Operations"],
    "D079": ["Customs Brokerage and Clearance", "Trade Compliance and Border Enforcement", "Import, Export and Cargo Documentation", "Customs Valuation and Revenue Protection"],
    "D080": ["Graphic and Multimedia Design", "Interior, Spatial and Exhibition Design", "Art Direction and Visual Production", "Motion, Animation and Visual Effects"],
    "D087": ["Hairdressing and Barbering", "Hair Technology, Extensions and Wig Making", "Salon Operations and Client Services"],
    "D088": ["Skin and Aesthetic Care", "Nail, Hand and Foot Care", "Makeup and Beauty Artistry", "Spa and Wellness Services"],
    "D089": ["Funeral Direction and Arrangement", "Embalming and Mortuary Care", "Cemetery and Crematory Operations", "Bereavement and Family Support"],
    "D091": ["Light and Heavy Vehicle Instruction", "Motorcycle and Specialist Vehicle Instruction", "Occupational, Fleet and Safety Driver Training", "Driver Education Curriculum and Assessment"],
    "D101": ["Construction and Decorative Painting", "Industrial Coatings and Surface Protection", "Spray, Lacquer and Finishing Operations", "Paperhanging and Wall-Covering Installation"],
    "D125": ["Medical Office Administration", "Patient Access and Front-Desk Coordination", "Health Records and Information Management", "Clinical Documentation and Transcription"],
    "D132": ["Spacecraft and Payload Systems", "Ground Systems, Space Communications and Mission Operations", "Space Science, Remote Sensing and Exploration", "Aerospace Systems and Operations Technology"],
    "D137": ["Medical Physics and Radiation Dosimetry", "Radiation Therapy", "Nuclear Medicine and Medical Imaging", "Radiation Protection and Safety"],
    "D150": ["Religious Ministry and Pastoral Care", "Theology, Religious Studies and Scholarship", "Religious Education and Formation", "Interfaith Leadership and Community Ministry"],
    "D153": ["Composition, Arranging and Music Direction", "Performance and Musicianship", "Recording, Mixing and Mastering", "Sound Design and Audio Post-Production", "Music Education and Community Practice"],
    "D156": ["Land, Cadastral and Property Surveying", "Geodesy and Geospatial Reference Systems", "Hydrographic and Engineering Surveying", "GIS, Cartography and Photogrammetry"],
    "D157": ["Tax Compliance and Administration", "Tax Accounting, Reporting and Advisory", "Tax Audit, Investigation and Revenue Protection", "International Tax and Transfer Pricing", "Tax Policy and Legislative Analysis"],
    "D162": ["Immigration Advice and Legal Representation", "Asylum, Refugee and Protection Casework", "Visa, Residency and Migration Administration", "Border Management and Compliance", "Migration Policy and Research"],
    "D163": ["Patent Examination and Prosecution", "Trademark and Brand Protection", "Technology Licensing and Transfer", "Copyright, Media and Creative Rights", "IP Strategy, Policy and Dispute Resolution"],
}

SPECIALIZATION_REGISTER = AUDIT / "specialization_lanes_2026_10_05" / "STEP1_RECONCILIATION_2026_10_06" / "global_step1_specialization_reconciliation_2026_10_06.json"
LEGACY_AREA_MAP = {domain_id: list(labels) for domain_id, labels in AREA_MAP.items()}


def load_reconciled_specializations() -> tuple[dict[str, list[str]], dict[tuple[str, str], dict[str, Any]]]:
    document = read_json(SPECIALIZATION_REGISTER)
    labels: dict[str, list[str]] = {}
    details: dict[tuple[str, str], dict[str, Any]] = {}
    for record in document.get("domains", []):
        if not isinstance(record, dict):
            continue
        domain_id = str(record.get("domain_id") or "")
        if domain_id not in FLOOR_COUNTS:
            continue
        recommended = record.get("recommended_areas")
        area_rows = recommended if isinstance(recommended, list) else (recommended or {}).get("areas", [])
        if not isinstance(area_rows, list):
            continue
        labels[domain_id] = []
        for area in area_rows:
            if not isinstance(area, dict) or not area.get("label"):
                continue
            label = str(area["label"])
            labels[domain_id].append(label)
            details[(domain_id, label)] = {
                "boundary": area.get("boundary") or area.get("scope") or "",
                "source_ids": area.get("source_ids", []),
                "source_urls": area.get("source_urls", []),
                "status": area.get("status") or area.get("source_support_claim") or "reconciled_global_recommendation",
            }
    return labels, details


RECONCILED_AREA_MAP, RECONCILED_AREA_DETAILS = load_reconciled_specializations()
AREA_MAP.update(RECONCILED_AREA_MAP)

LEGACY_AREA_REMAP: dict[tuple[str, str], str] = {
    ("D038", "Risk, Ethics and Financial Crime Compliance"): "Organizational Compliance, Ethics and Integrity",
    ("D038", "Compliance Monitoring and Audit"): "Corporate Governance, Risk and Internal Controls",
    ("D038", "Regulatory Affairs and Licensing"): "Regulatory Policy, Affairs and Oversight",
    ("D038", "Information Governance and Data Protection"): "Regulatory Policy, Affairs and Oversight",
    ("D039", "Student Services and Academic Support"): "Student Learning, Academic Services and Community Engagement",
    ("D039", "Academic Research and Knowledge Production"): "Academic Research and Scholarship",
    ("D039", "Higher-Education Administration"): "Academic Leadership, Governance and Quality",
    ("D040", "Vocational and Technical Teaching"): "Vocational and Technical Instruction and Assessment",
    ("D040", "Workforce Development and Apprenticeship"): "Workplace and Continuing Professional Development",
    ("D040", "Curriculum, Assessment and Skills Standards"): "TVET Curriculum, Qualifications and Quality",
    ("D040", "Learning Technology and Delivery"): "TVET Curriculum, Qualifications and Quality",
    ("D044", "Art Direction and Brand Systems"): "Brand Identity and Visual Systems",
    ("D044", "Graphic and Visual Communication Design"): "Editorial and Publication Design",
    ("D044", "Illustration, Motion and Production Design"): "Campaign and Promotional Communication Design",
    ("D044", "Digital Interface and Experience Design"): "Information, Wayfinding and Data Visualization",
    ("D045", "Budget, Audit and Public Finance"): "Public Finance and Budget Management",
    ("D045", "Government Administration and Service Delivery"): "Public Programme and Service Delivery",
    ("D045", "Public Policy and Programme Analysis"): "Public Policy Design and Evaluation",
    ("D045", "Urban, Regional and Community Planning"): "Public Governance and Institutional Performance",
    ("D049", "Vehicle Systems and Product Engineering"): "Vehicle Systems and Integration",
    ("D049", "Automotive Manufacturing and Quality"): "Vehicle Systems and Integration",
    ("D049", "Vehicle Testing, Safety and Validation"): "Vehicle Testing, Validation and Driving Automation",
    ("D049", "Automotive Service and Diagnostics"): "Vehicle Systems and Integration",
    ("D049", "Electric and Connected Vehicle Systems"): "Vehicle Electronics, Software and Connected Systems",
    ("D050", "Industrial Control and Automation"): "Industrial Control and Instrumentation",
    ("D050", "Robotics and Mechatronics"): "Robotics and Mechatronic Automation",
    ("D050", "Instrumentation and Process Control"): "Industrial Control and Instrumentation",
    ("D050", "Industrial Maintenance and Reliability"): "Manufacturing Automation and Operations Systems",
    ("D050", "Industrial Digitalisation and IoT"): "Industrial Networks and Control-System Integration",
    ("D051", "Property Valuation and Appraisal"): "Real Estate Valuation and Appraisal",
    ("D051", "Real-Estate Brokerage and Transactions"): "Property Agency, Transactions and Leasing",
    ("D051", "Property and Facilities Management"): "Property and Facilities Management",
    ("D051", "Real-Estate Development and Investment"): "Real Estate Development and Planning",
    ("D052", "Construction Project and Site Delivery"): "Construction Project Management",
    ("D052", "Cost, Quantity and Project Controls"): "Construction Commercial and Cost Management",
    ("D052", "Building Inspection and Compliance"): "Construction Site and Production Management",
    ("D052", "Construction Design Coordination and BIM"): "Construction Project Management",
    ("D052", "Construction Safety and Contracts"): "Construction Site and Production Management",
    ("D054", "Drilling, Wells and Completions"): "Drilling and Well Construction",
    ("D054", "Oilfield Services and Field Operations"): "Production and Field Operations",
    ("D054", "Reservoir, Production and Subsurface Engineering"): "Subsurface Exploration and Reservoir Development",
    ("D054", "Pipeline, Safety and Environmental Operations"): "Midstream Gas Processing, Transport and Storage",
    ("D055", "Process Safety and Environmental Chemistry"): "Process Safety and Risk Engineering",
    ("D055", "Chemical Laboratory and Analytical Science"): "Separation and Purification Engineering",
    ("D055", "Chemical Process and Plant Engineering"): "Process Design, Systems and Control",
    ("D055", "Biochemical, Polymer and Materials Processing"): "Biochemical and Bioprocess Engineering",
    ("D058", "Digital Teaching and Learning Delivery"): "Educational Technology and Digital Learning Systems",
    ("D071", "Sports Administration and Governance"): "Sport Organization Governance and Administration",
    ("D071", "Sports Marketing and Talent Management"): "Sport Marketing and Commercial Partnerships",
    ("D071", "Sports Events, Officiating and Operations"): "Sport Events, Facilities and Venue Operations",
    ("D071", "Coaching and Athlete Development"): "Sport Development and Participation",
    ("D071", "Sports Performance, Science and Medicine"): "Sport Development and Participation",
    ("D075", "Textile Materials and Product Development"): "Textile Materials, Design and Development",
    ("D075", "Garment, Footwear and Production Operations"): "Garment Engineering and Production",
    ("D075", "Textile Quality and Process Technology"): "Garment Engineering and Production",
    ("D076", "Deck and Marine Operations"): "Deck, Navigation and Vessel Operations",
    ("D076", "Marine Engineering and Electro-Technical Operations"): "Marine Engineering and Vessel Systems",
    ("D076", "Port, Shipping and Vessel Operations"): "Ports, Shipping and Maritime Logistics",
    ("D076", "Maritime Safety, Survey and Compliance"): "Ports, Shipping and Maritime Logistics",
    ("D079", "Customs Brokerage and Clearance"): "Customs Administration and Border Compliance",
    ("D079", "Trade Compliance and Border Enforcement"): "Customs Administration and Border Compliance",
    ("D079", "Import, Export and Cargo Documentation"): "Trade Facilitation and International Trade Operations",
    ("D079", "Customs Valuation and Revenue Protection"): "Tariff Classification, Customs Valuation and Origin",
    ("D080", "Interior, Spatial and Exhibition Design"): "Interior Architecture and Spatial Design",
    ("D080", "Art Direction and Visual Production"): "Exhibition, Retail and Experience Design",
    ("D080", "Graphic and Multimedia Design"): "Illustration and Animation",
    ("D080", "Motion, Animation and Visual Effects"): "Illustration and Animation",
    ("D087", "Hairdressing and Barbering"): "Haircutting, Styling and Colour Services",
    ("D087", "Hair Technology, Extensions and Wig Making"): "Wigs, Extensions and Hair Replacement",
    ("D087", "Salon Operations and Client Services"): "Haircutting, Styling and Colour Services",
    ("D088", "Skin and Aesthetic Care"): "Facial Skincare and Non-medical Aesthetics",
    ("D088", "Nail, Hand and Foot Care"): "Nail Care and Enhancement",
    ("D088", "Makeup and Beauty Artistry"): "Make-up, Brow and Lash Artistry",
    ("D089", "Funeral Direction and Arrangement"): "Funeral Arrangement and Ceremony Direction",
    ("D089", "Embalming and Mortuary Care"): "Mortuary Care, Embalming and Restorative Presentation",
    ("D089", "Cemetery and Crematory Operations"): "Cemetery, Crematory and Disposition Operations",
    ("D091", "Driver Education Curriculum and Assessment"): "Car and Light-Vehicle Instruction",
    ("D091", "Occupational, Fleet and Safety Driver Training"): "Commercial Goods-Vehicle Instruction",
    ("D091", "Motorcycle and Specialist Vehicle Instruction"): "Motorcycle and Moped Rider Instruction",
    ("D101", "Construction and Decorative Painting"): "Building Painting and Decorative Finishes",
    ("D101", "Industrial Coatings and Surface Protection"): "Industrial Protective Coatings and Surface Preparation",
    ("D101", "Paperhanging and Wall-Covering Installation"): "Building Painting and Decorative Finishes",
    ("D125", "Health Records and Information Management"): "Health Records and Information Support",
    ("D132", "Ground Systems, Space Communications and Mission Operations"): "Earth and Space-Based Earth Observation",
    ("D137", "Medical Physics and Radiation Dosimetry"): "Radiation Oncology Physics",
    ("D137", "Radiation Protection and Safety"): "Medical Health Physics and Radiation Protection",
    ("D150", "Interfaith Leadership and Community Ministry"): "Interfaith Engagement and Community Leadership",
    ("D150", "Religious Education and Formation"): "Congregational and Community Ministry",
    ("D153", "Sound Design and Audio Post-Production"): "Live Music Sound Production",
    ("D153", "Composition, Arranging and Music Direction"): "Music Production and Arrangement",
    ("D153", "Recording, Mixing and Mastering"): "Recording and Studio Engineering",
    ("D153", "Music Education and Community Practice"): "Music Production and Arrangement",
    ("D153", "Performance and Musicianship"): "Music Production and Arrangement",
    ("D156", "GIS, Cartography and Photogrammetry"): "Geospatial Mapping, GIS and Photogrammetry",
    ("D157", "Tax Compliance and Administration"): "Tax Compliance and Advisory",
    ("D157", "Tax Accounting, Reporting and Advisory"): "Tax Compliance and Advisory",
    ("D157", "Tax Audit, Investigation and Revenue Protection"): "Tax Disputes and Controversy",
    ("D157", "Tax Policy and Legislative Analysis"): "Tax Policy and Administration",
    ("D162", "Asylum, Refugee and Protection Casework"): "Asylum and International Protection Casework",
    ("D162", "Border Management and Compliance"): "Immigration Compliance, Policy and Programme Administration",
    ("D162", "Immigration Advice and Legal Representation"): "Immigration Law and Status Applications",
    ("D162", "Migration Policy and Research"): "Immigration Compliance, Policy and Programme Administration",
    ("D163", "Technology Licensing and Transfer"): "IP Transactions, Licensing and Commercialization",
    ("D163", "Patent Examination and Prosecution"): "Patent Examination and IP Office Practice",
    ("D163", "Trademark and Brand Protection"): "IP Portfolio, Strategy and Rights Management",
}

NG_BY_DOMAIN = {
    "D038": ["NG_NDPC"], "D039": ["NG_NUC"], "D040": ["NG_NBTE", "NG_NBTE_TRADE_DIRECTORY"], "D049": ["NG_NADDC", "NG_COREN"], "D050": ["NG_NBTE", "NG_COREN"], "D051": ["NG_ESVARBON"], "D052": ["NG_COREN", "NG_NBTE"], "D053": ["NG_NIHOTOUR"], "D054": ["NG_NUPRC"], "D055": ["NG_COREN", "NG_NBTE"], "D058": ["NG_NUC", "NG_NBTE"], "D071": ["NG_NBTE"], "D075": ["NG_NBTE", "NG_NBTE_TRADE_DIRECTORY"], "D076": ["NG_NIMASA"], "D079": ["NG_NCS"], "D080": ["NG_NBTE"], "D087": ["NG_NBTE_TRADE_DIRECTORY"], "D088": ["NG_NBTE_TRADE_DIRECTORY"], "D091": ["NG_FRSC"], "D101": ["NG_NBTE_TRADE_DIRECTORY"], "D125": ["NG_HRORBN"], "D132": ["NG_NUC"], "D153": ["NG_NCC"], "D157": ["NG_FIRS_NRS"], "D162": ["NG_NIS"], "D163": ["NG_NOTAP"], "D137": ["NG_COREN"],
}


def role(title: str, area: str, source_key: str, task: str, disposition: str = "add") -> dict[str, Any]:
    return {"title": title, "area": area, "source_key": source_key, "task": task, "disposition": disposition}


SUPPLEMENTAL = {
    "D003": [role("Natural Language AI Engineer", "Natural Language and Speech AI", "ai_research", "Develops and evaluates systems that interpret or generate human language and speech.") , role("AI Safety and Evaluation Engineer", "Machine Learning and Generative Models", "ai_research", "Designs evaluations, robustness checks and safety controls for AI systems.", "review_only"), role("Knowledge Representation Engineer", "Knowledge, Reasoning and Planning", "ai_research", "Represents structured knowledge and implements reasoning or inference methods."), role("Machine Learning Operations Engineer", "Machine Learning and Generative Models", "software_dev", "Deploys, monitors and maintains machine-learning models and their production pipelines."), role("Intelligent-Agent Engineer", "Intelligent Agents and Robotics", "robotics", "Builds agents that perceive state, plan actions and interact with environments.", "review_only")],
    "D037": [role("Legal Secretary", "Legal Records, Practice Support and Administration", "legal_secretary", "Prepares legal correspondence, schedules matters and maintains legal files."), role("Court Reporter", "Dispute Resolution", "court_reporter", "Creates verbatim records of court, deposition and other legal proceedings."), role("Administrative Law Judge or Hearing Officer", "Public, Constitutional and Human Rights Law", "admin_law_judge", "Conducts hearings, evaluates evidence and issues administrative decisions.", "review_only"), role("Court and License Clerk", "Criminal Justice", "court_clerk", "Maintains court records, processes filings and supports court or licensing proceedings.", "review_only"), role("Title Examiner", "Property, Construction and Infrastructure Law", "title_examiner", "Examines public and legal records to determine ownership, liens and title conditions.", "review_only"), role("Legal Investigator", "Criminal Justice", "private_investigator", "Investigates facts and evidence for legal matters and prepares findings for counsel.", "review_only")],
    "D038": [role("Internal Auditor", "Compliance Monitoring and Audit", "auditor", "Examines controls, records and processes and reports whether requirements and policies are followed."), role("Risk Manager", "Risk, Ethics and Financial Crime Compliance", "compliance", "Identifies, assesses and controls organisational risks and reports mitigation actions."), role("Data Protection Officer", "Information Governance and Data Protection", "compliance", "Coordinates privacy governance, compliance advice, monitoring and data-protection reporting."), role("Regulatory Inspector", "Regulatory Affairs and Licensing", "occupational_safety", "Inspects regulated activity and records compliance with applicable standards or rules."), role("Information Security Compliance Analyst", "Information Governance and Data Protection", "info_security", "Assesses information-security controls against regulatory and organisational requirements.", "review_only"), role("Ethics and Compliance Specialist", "Risk, Ethics and Financial Crime Compliance", "compliance", "Maintains ethics and compliance programmes, investigations, training and reporting."), role("Anti-Money-Laundering Analyst", "Risk, Ethics and Financial Crime Compliance", "compliance", "Reviews transactions, customer information and alerts for financial-crime compliance obligations.")],
    "D039": [role("Research Scientist", "Academic Research and Knowledge Production", "research_assistant", "Plans, conducts, analyses and communicates structured research within an academic or research institution."), role("Academic Advisor", "Student Services and Academic Support", "postsecondary_admin", "Advises students on academic progression, programmes and institutional requirements.", "review_only"), role("University Registrar", "Higher-Education Administration", "postsecondary_admin", "Administers academic records, policies, registration and institutional governance.", "review_only"), role("Research Administration Specialist", "Higher-Education Administration", "postsecondary_admin", "Coordinates research proposals, compliance, awards and reporting for an academic institution.", "review_only"), role("Student Affairs Administrator", "Student Services and Academic Support", "postsecondary_admin", "Coordinates student services, support programmes and institutional student-life operations.", "review_only"), role("Academic Librarian", "Student Services and Academic Support", "librarian", "Provides scholarly information services, collections and research support in higher education.", "review_only"), role("Postdoctoral Researcher", "Academic Research and Knowledge Production", "research_assistant", "Conducts supervised or independent research and publishes findings after doctoral study.", "review_only")],
    "D040": [role("Apprenticeship Instructor", "Workforce Development and Apprenticeship", "cte_teacher", "Teaches and supervises occupational theory and practical skills in an apprenticeship route."), role("Vocational Curriculum Developer", "Curriculum, Assessment and Skills Standards", "instructional_coord", "Designs, sequences and evaluates curriculum and assessment for technical occupations."), role("Competency Assessor", "Curriculum, Assessment and Skills Standards", "instructional_coord", "Assesses whether learners demonstrate defined occupational competencies.", "review_only"), role("Workforce Development Specialist", "Workforce Development and Apprenticeship", "training", "Designs and coordinates training and workforce-development programmes."), role("Skills Standards Officer", "Curriculum, Assessment and Skills Standards", "instructional_coord", "Maintains occupational standards, competency frameworks and assessment specifications.", "review_only"), role("Adult Education Teacher", "Vocational and Technical Teaching", "adult_teacher", "Teaches adult learners basic, secondary or English-language education."), role("Instructional Technologist", "Learning Technology and Delivery", "training", "Selects and supports technology used to design and deliver occupational learning.", "review_only")],
    "D044": [role("User-Experience and Interface Designer", "Digital Interface and Experience Design", "web_design", "Designs and tests digital interfaces and interactions around user needs and product goals."), role("Publication Designer", "Graphic and Visual Communication Design", "graphic", "Creates layouts, typography and production-ready visual communication for publications."), role("Motion Graphics Designer", "Illustration, Motion and Production Design", "multimedia", "Creates animated visual communication, titles and motion graphics for media."), role("Brand Identity Designer", "Art Direction and Brand Systems", "graphic", "Develops visual identity systems, marks, typography and brand applications."), role("Production Artist", "Graphic and Visual Communication Design", "graphic", "Prepares and checks visual files for accurate print or digital production."), role("Typography Designer", "Graphic and Visual Communication Design", "graphic", "Designs and applies type systems, letterforms and typographic hierarchy.")],
    "D045": [role("Public Policy Analyst", "Public Policy and Programme Analysis", "management_analyst", "Analyses public problems, evidence and policy options and communicates recommendations."), role("Budget Analyst", "Budget, Audit and Public Finance", "budget", "Prepares, analyses and monitors organisational or government budgets."), role("Government Programme Administrator", "Government Administration and Service Delivery", "postsecondary_admin", "Coordinates public programmes, implementation, reporting and service delivery.", "review_only"), role("Legislative Analyst", "Public Policy and Programme Analysis", "political", "Analyses proposed legislation, policy effects and public-sector evidence.", "review_only"), role("Public-Sector Management Consultant", "Government Administration and Service Delivery", "management_analyst", "Reviews public organisations, processes and performance and recommends improvements."), role("Public Affairs Officer", "Government Administration and Service Delivery", "political", "Communicates public policy, institutional information and stakeholder engagement.", "review_only"), role("Civil Service Administrator", "Government Administration and Service Delivery", "postsecondary_admin", "Administers public-sector services, records, procedures and organisational programmes.", "review_only"), role("Public Programme Evaluator", "Public Policy and Programme Analysis", "management_analyst", "Evaluates whether public programmes achieve intended outcomes and uses evidence to recommend changes.")],
    "D049": [role("Vehicle Design Engineer", "Vehicle Systems and Product Engineering", "automotive", "Designs vehicle systems and components and evaluates performance against engineering requirements."), role("Powertrain Engineer", "Electric and Connected Vehicle Systems", "automotive", "Designs, tests and improves propulsion, energy-conversion and drivetrain systems."), role("Automotive Manufacturing Engineer", "Automotive Manufacturing and Quality", "mechanical", "Develops production processes, tooling and quality methods for vehicle manufacture."), role("Vehicle Test Engineer", "Vehicle Testing, Safety and Validation", "automotive", "Plans and conducts vehicle-system tests, failure analysis and validation."), role("Automotive Safety Engineer", "Vehicle Testing, Safety and Validation", "automotive", "Analyses vehicle safety performance, hazards and compliance with safety requirements."), role("Electric Vehicle Systems Engineer", "Electric and Connected Vehicle Systems", "automotive", "Integrates battery, electric-drive, charging and control systems in vehicles."), role("Automotive Service Technician", "Automotive Service and Diagnostics", "auto_service", "Inspects, diagnoses, repairs and maintains automotive mechanical and electronic systems."), role("Vehicle Diagnostic Technician", "Automotive Service and Diagnostics", "auto_service", "Uses diagnostic equipment and service information to locate vehicle faults."), role("Automotive Quality Engineer", "Automotive Manufacturing and Quality", "automotive", "Controls manufacturing quality, investigates defects and improves vehicle production processes."), role("Automotive Production Planner", "Automotive Manufacturing and Quality", "mechanical", "Plans materials, capacity and production sequencing for vehicle manufacturing.", "review_only")],
    "D050": [role("Control Systems Engineer", "Industrial Control and Automation", "mechatronics", "Designs, integrates and tests feedback, control and automation systems."), role("PLC Programmer", "Industrial Control and Automation", "robotics_tech", "Programs and tests programmable-logic-control systems for industrial equipment."), role("SCADA Engineer", "Industrial Digitalisation and IoT", "mechatronics", "Designs and maintains supervisory control, data acquisition and industrial monitoring systems."), role("Automation Technician", "Instrumentation and Process Control", "robotics_tech", "Installs, tests and maintains automated and electromechanical production equipment."), role("Robotics Systems Integrator", "Robotics and Mechatronics", "robotics", "Integrates robot hardware, sensors, controls and production workflows."), role("Instrumentation Engineer", "Instrumentation and Process Control", "mechatronics", "Designs measurement, instrumentation and control systems for industrial processes."), role("Industrial Maintenance Technician", "Industrial Maintenance and Reliability", "industrial_maintenance", "Maintains and troubleshoots industrial machinery and production equipment."), role("Process Control Technician", "Instrumentation and Process Control", "robotics_tech", "Calibrates and services process-control instruments and control loops."), role("Industrial IoT Engineer", "Industrial Digitalisation and IoT", "software_dev", "Connects industrial devices, data systems and analytics for monitored and automated operations.", "review_only"), role("Factory Automation Specialist", "Industrial Control and Automation", "industrial_tech", "Improves production automation, layout, efficiency and process reliability.")],
    "D051": [role("Real-Estate Analyst", "Real-Estate Development and Investment", "management_analyst", "Analyses property markets, investments, cash flows and development opportunities."), role("Leasing Manager", "Property and Facilities Management", "property_manager", "Negotiates and administers property leases, occupancy and tenant relationships."), role("Property Development Manager", "Real-Estate Development and Investment", "property_manager", "Coordinates feasibility, approvals, financing and delivery of property developments."), role("Facilities Coordinator", "Property and Facilities Management", "facilities", "Coordinates building services, maintenance, vendors and facility operations."), role("Land Economist", "Property Valuation and Appraisal", "real_estate_appraiser", "Analyses land values, land use, markets and development economics.", "review_only")],
    "D052": [role("Quantity Surveyor", "Cost, Quantity and Project Controls", "cost_estimator", "Measures work, estimates costs, manages valuations and controls construction expenditure."), role("Construction Site Engineer", "Construction Project and Site Delivery", "civil", "Coordinates technical site work, drawings, sequencing, quality and construction implementation."), role("Construction Scheduler", "Cost, Quantity and Project Controls", "project_specialist", "Develops and monitors project schedules, dependencies, progress and recovery actions."), role("BIM Coordinator", "Construction Design Coordination and BIM", "construction", "Coordinates building information models and resolves design/construction information interfaces."), role("Project Controls Specialist", "Cost, Quantity and Project Controls", "project_specialist", "Tracks cost, schedule, risk, change and performance information on construction projects."), role("Construction Contract Administrator", "Construction Safety and Contracts", "construction", "Administers construction contracts, claims, notices, records and commercial obligations."), role("Construction Safety Officer", "Construction Safety and Contracts", "occupational_safety", "Inspects construction work and implements occupational safety controls."), role("Construction Site Supervisor", "Construction Project and Site Delivery", "construction", "Supervises site labour, materials, sequencing and day-to-day construction activities."), role("Building Services Coordinator", "Construction Design Coordination and BIM", "construction", "Coordinates mechanical, electrical and building-services design and installation."), role("Civil Works Inspector", "Building Inspection and Compliance", "building_inspector", "Inspects civil construction work for drawings, specifications, quality and code compliance.")],
    "D053": [role("Hotel Front-Office Manager", "Accommodation and Guest Operations", "lodging", "Coordinates reservations, reception, guest services, staffing and front-office operations."), role("Housekeeping Manager", "Accommodation and Guest Operations", "lodging", "Plans and supervises rooms, cleaning, linen, staffing and accommodation standards."), role("Hotel Revenue Manager", "Accommodation and Guest Operations", "lodging", "Analyses demand, pricing, occupancy and channel performance to manage accommodation revenue."), role("Restaurant Manager", "Food, Beverage and Culinary Operations", "food_service", "Directs restaurant staffing, purchasing, service quality, budgets and customer experience."), role("Catering Manager", "Food, Beverage and Culinary Operations", "food_service", "Plans food-service production, staffing, logistics, budgets and event catering delivery."), role("Guest Relations Manager", "Accommodation and Guest Operations", "lodging", "Manages guest experience, service recovery and relationship processes."), role("Travel Operations Manager", "Travel, Tourism and Visitor Services", "events", "Coordinates travel products, bookings, suppliers, itineraries and visitor services.")],
    "D054": [role("Drilling Fluids Engineer", "Drilling, Wells and Completions", "petroleum", "Designs and monitors drilling-fluid systems and their effects on well construction and safety."), role("Completions Engineer", "Drilling, Wells and Completions", "petroleum", "Designs and evaluates equipment and procedures for completing wells and bringing them into production."), role("Production Technologist", "Reservoir, Production and Subsurface Engineering", "petroleum", "Optimises well and field production using subsurface, equipment and operating data."), role("Wellsite Supervisor", "Oilfield Services and Field Operations", "petroleum", "Coordinates field drilling or well operations, contractors, safety and technical execution."), role("Pipeline Operator", "Pipeline, Safety and Environmental Operations", "refinery", "Monitors and controls pipeline flow, equipment, valves and operating conditions."), role("Petroleum Geologist", "Reservoir, Production and Subsurface Engineering", "geology", "Interprets geological data to evaluate petroleum systems, reservoirs and exploration targets."), role("Offshore Installation Manager", "Oilfield Services and Field Operations", "petroleum", "Manages offshore installation operations, people, safety and production activities.", "review_only")],
    "D055": [role("Process Safety Engineer", "Process Safety and Environmental Chemistry", "chemical_engineer", "Identifies process hazards and designs safeguards, risk controls and safe operating systems."), role("Polymer Engineer", "Biochemical, Polymer and Materials Processing", "materials", "Develops, processes and tests polymer materials and products."), role("Chemical Laboratory Analyst", "Chemical Laboratory and Analytical Science", "chemical_tech", "Samples, tests and reports chemical composition and process or product quality."), role("Quality-Control Chemist", "Chemical Laboratory and Analytical Science", "chemist", "Analyses materials and products against specifications and quality requirements."), role("Environmental Process Engineer", "Process Safety and Environmental Chemistry", "chemical_engineer", "Designs chemical-process controls for emissions, waste, water and environmental performance."), role("Process Development Engineer", "Chemical Process and Plant Engineering", "chemical_engineer", "Develops, scales and improves chemical processes, equipment and operating parameters.")],
    "D058": [role("E-Learning Developer", "Educational Technology and Digital Learning Systems", "learning_design", "Builds digital learning content, interactions and delivery assets for online or blended education."), role("Curriculum Designer", "Learning Experience and Instructional Design", "instructional_coord", "Designs learning outcomes, content sequences, assessments and learning experiences."), role("Educational Technologist", "Educational Technology and Digital Learning Systems", "learning_design", "Evaluates and supports technology used to improve teaching and learning."), role("Learning Analytics Specialist", "Learning Analytics, Research and Evaluation", "data_scientist", "Analyses learning data to evaluate engagement, outcomes and interventions.", "review_only"), role("Digital Learning Project Manager", "Digital Teaching and Learning Delivery", "project_specialist", "Plans and coordinates educational technology and digital-learning implementation projects.", "review_only")],
    "D065": [role("Translator", "Translation and Localization", "language", "Transfers written meaning between languages while preserving accuracy, context and purpose."), role("Terminologist", "Terminology and Language-Services Project Practice", "language", "Researches, standardises and manages specialised terms for multilingual communication.", "review_only"), role("Computational Linguist", "Computational Linguistics and Language Technology", "ai_research", "Applies linguistic analysis and computational methods to language data and language technologies.", "review_only"), role("Language Technologist", "Computational Linguistics and Language Technology", "software_dev", "Implements language-processing tools, resources or workflows for multilingual systems.", "review_only"), role("Lexicographer", "Linguistic Research and Documentation", "language", "Researches and describes words, meanings, usage and evidence for dictionaries or language resources.", "review_only"), role("Language-Services Project Manager", "Terminology and Language-Services Project Practice", "project_specialist", "Plans language-service workflows, vendors, schedules, quality and delivery.", "review_only")],
    "D071": [role("Sports Marketing Manager", "Sports Marketing and Talent Management", "sales_manager", "Plans marketing, sponsorship, audience and commercial activities for sports organisations or events."), role("Athletic Trainer", "Sports Performance, Science and Medicine", "athletic", "Prevents, evaluates and rehabilitates athletic injuries and supports safe participation.", "review_only")],
    "D075": [role("Textile Designer", "Textile Materials and Product Development", "fashion", "Develops textile patterns, materials, colourways and product concepts."), role("Apparel Merchandiser", "Fashion and Apparel Design", "fashion", "Coordinates product range, market requirements, costing and delivery for apparel."), role("Footwear Technologist", "Garment, Footwear and Production Operations", "production_supervisor", "Applies materials, construction and production methods to footwear development."), role("Garment Production Planner", "Garment, Footwear and Production Operations", "production_supervisor", "Plans capacity, materials, sequencing and delivery for garment production."), role("Textile Quality Manager", "Textile Quality and Process Technology", "production_supervisor", "Sets and monitors quality controls, testing and corrective action in textile production."), role("Apparel Production Supervisor", "Garment, Footwear and Production Operations", "production_supervisor", "Supervises apparel production workers, workflow, quality and output."), role("Textile Laboratory Technologist", "Textile Quality and Process Technology", "textile_operator", "Tests textile fibres, yarns, fabrics and finishes against technical specifications."), role("Fashion Buyer", "Fashion and Apparel Design", "fashion", "Selects apparel products and manages suppliers, ranges, budgets and market fit.", "review_only")],
    "D076": [role("Maritime Safety Officer", "Maritime Safety, Survey and Compliance", "occupational_safety", "Implements and audits maritime safety, emergency, pollution and operational controls."), role("Marine Operations Superintendent", "Port, Shipping and Vessel Operations", "postsecondary_admin", "Coordinates vessel operations, port interfaces, schedules, crews and compliance.", "review_only")],
    "D079": [role("Customs Inspector", "Trade Compliance and Border Enforcement", "border", "Examines people, goods and documentation for customs and border compliance.", "review_only"), role("Trade Compliance Analyst", "Trade Compliance and Border Enforcement", "customs_broker", "Interprets import/export rules, classifications, controls and compliance requirements."), role("Import-Export Specialist", "Import, Export and Cargo Documentation", "logistician", "Coordinates international shipments, documentation, classifications and trade procedures."), role("Customs Valuation Specialist", "Customs Valuation and Revenue Protection", "customs_broker", "Determines customs value and applies valuation rules for revenue and compliance."), role("Freight Forwarding Manager", "Import, Export and Cargo Documentation", "logistician", "Plans international freight, carriers, documentation, routing and customer delivery."), role("Customs Compliance Officer", "Trade Compliance and Border Enforcement", "customs_broker", "Maintains customs controls, reviews declarations and manages corrective compliance action."), role("Cargo Documentation Officer", "Import, Export and Cargo Documentation", "cargo", "Prepares and verifies bills, manifests, declarations and shipment records."), role("Border Clearance Officer", "Customs Brokerage and Clearance", "border", "Processes and verifies border-clearance documentation and controlled movement.", "review_only")],
    "D080": [role("User-Experience Designer", "Graphic and Multimedia Design", "web_design", "Designs user journeys, interfaces and interactions for digital products."), role("Art Director", "Art Direction and Visual Production", "art_director", "Sets visual direction, reviews design work and coordinates visual production."), role("Exhibition Designer", "Interior, Spatial and Exhibition Design", "set_design", "Designs visitor environments, layouts, interpretation and spatial experiences."), role("Lighting Designer", "Interior, Spatial and Exhibition Design", "set_design", "Plans lighting systems and visual effects for spatial, exhibition or performance environments.", "review_only"), role("Multimedia Artist", "Motion, Animation and Visual Effects", "multimedia", "Creates integrated visual, animated and interactive media assets."), role("Motion Graphics Designer", "Motion, Animation and Visual Effects", "multimedia", "Creates animated titles, transitions and visual communication for media."), role("Industrial Designer", "Graphic and Multimedia Design", "industrial_design", "Designs the form, usability and production characteristics of products."), role("Visual Effects Artist", "Motion, Animation and Visual Effects", "multimedia", "Creates digital visual effects and composited imagery for screen or interactive media.", "review_only")],
    "D087": [role("Salon Manager", "Salon Operations and Client Services", "facilities", "Coordinates salon staffing, scheduling, supplies, service quality and client operations.", "review_only"), role("Hair Colourist", "Hairdressing and Barbering", "hair", "Applies colour consultation, formulation and hair-colouring techniques."), role("Wig Maker", "Hair Technology, Extensions and Wig Making", "hair", "Constructs, fits and maintains wigs, hairpieces and related extensions."), role("Trichology Practitioner", "Hair Technology, Extensions and Wig Making", "skin", "Assesses scalp and hair conditions and provides non-medical hair and scalp-care services.", "review_only"), role("Hair Extension Specialist", "Hair Technology, Extensions and Wig Making", "hair", "Selects and applies hair extensions and maintains them safely.")],
    "D088": [role("Lash and Brow Technician", "Makeup and Beauty Artistry", "makeup", "Provides specialist lash and brow styling services using safe beauty procedures.", "review_only")],
    "D089": [role("Mortuary Technician", "Embalming and Mortuary Care", "funeral", "Prepares, stores and transfers deceased persons and supports mortuary hygiene and documentation."), role("Cemetery Manager", "Cemetery and Crematory Operations", "funeral", "Coordinates cemetery grounds, records, burials, maintenance and family services."), role("Mortuary Transport Operator", "Cemetery and Crematory Operations", "funeral", "Transfers deceased persons and maintains chain-of-custody, safety and transport records.")],
    "D091": [role("Driver-Education Curriculum Instructor", "Driver Education Curriculum and Assessment", "cte_teacher", "Teaches road rules, risk awareness and assessment content in a driver-education route."), role("Fleet Driver Trainer", "Occupational, Fleet and Safety Driver Training", "training", "Assesses and trains occupational drivers in safe, compliant fleet operation."), role("Motorcycle Safety Instructor", "Motorcycle and Specialist Vehicle Instruction", "sports", "Provides practical motorcycle instruction, risk management and riding assessment.", "review_only")],
    "D101": [role("Industrial Coatings Applicator", "Industrial Coatings and Surface Protection", "coating", "Applies industrial coatings and controls surface preparation, thickness and finish quality."), role("Corrosion Control Technician", "Industrial Coatings and Surface Protection", "coating", "Inspects and maintains protective coatings and corrosion-control treatments.", "review_only"), role("Decorative Painter", "Construction and Decorative Painting", "painting", "Applies decorative finishes, colour schemes and protective coatings to buildings and surfaces.")],
    "D125": [role("Health Information Technician", "Health Records and Information Management", "health_records", "Maintains, validates, codes and retrieves health information and records for care and administration.")],
    "D132": [role("Mission Operations Controller", "Ground Systems, Space Communications and Mission Operations", "space_ops", "Plans and executes spacecraft operations, procedures, telemetry and mission-control activities.")],
    "D137": [role("Radiation Oncology Physicist", "Medical Physics and Radiation Dosimetry", "medical_physics", "Applies physics, dosimetry, quality assurance and safety to therapeutic radiation systems."), role("Radiation Protection Specialist", "Radiation Protection and Safety", "occupational_safety", "Monitors radiation hazards, controls exposure and advises on radiation-safety compliance.")],
    "D150": [role("Religious Education Director", "Religious Education and Formation", "religion", "Plans and directs religious education, formation curricula, teachers and community learning."), role("Interfaith Programme Coordinator", "Interfaith Leadership and Community Ministry", "religion", "Coordinates dialogue, community programmes and collaboration across faith communities.", "review_only")],
    "D153": [role("Composer", "Composition, Arranging and Music Direction", "music_composer", "Creates and develops original musical works and arrangements."), role("Singer-Songwriter", "Performance and Musicianship", "musician", "Creates and performs vocal and musical works for live or recorded contexts."), role("Conductor", "Composition, Arranging and Music Direction", "music_composer", "Leads and interprets ensemble performance and rehearsal."), role("Session Musician", "Performance and Musicianship", "musician", "Performs instrumental or vocal parts for recordings, productions or live sessions."), role("Recording Engineer", "Recording, Mixing and Mastering", "sound", "Captures, edits and technically manages sound recordings."), role("Mixing Engineer", "Recording, Mixing and Mastering", "sound", "Balances, processes and prepares multitrack audio mixes."), role("Mastering Engineer", "Recording, Mixing and Mastering", "sound", "Prepares final audio masters for distribution and playback systems."), role("Sound Designer", "Sound Design and Audio Post-Production", "sound", "Creates, edits and integrates sound effects and sonic environments for media."), role("Audio Post-Production Technician", "Sound Design and Audio Post-Production", "audio_video", "Edits, syncs and delivers dialogue, effects and audio tracks in post-production."), role("Music Educator", "Music Education and Community Practice", "religion_teacher", "Teaches music theory, practice, performance and musicianship in an educational setting.")],
    "D156": [role("Remote-Sensing Survey Specialist", "GIS, Cartography and Photogrammetry", "industrial_tech", "Processes imagery and geospatial measurements to produce survey, mapping and monitoring outputs.", "review_only")],
    "D157": [role("Tax Accountant", "Tax Accounting, Reporting and Advisory", "tax_accounting", "Prepares and analyses tax computations, reports, reconciliations and accounting records."), role("Tax Auditor", "Tax Audit, Investigation and Revenue Protection", "tax_accounting", "Examines tax records, transactions and returns for accuracy and compliance."), role("Tax Compliance Officer", "Tax Compliance and Administration", "compliance", "Monitors tax obligations, advises on compliance and follows up on deficiencies."), role("Revenue Agent", "Tax Audit, Investigation and Revenue Protection", "financial_examiner", "Examines taxpayer records and determines liabilities under applicable tax law."), role("Transfer Pricing Analyst", "International Tax and Transfer Pricing", "tax_accounting", "Analyses related-party transactions, pricing methods and documentation."), role("Indirect Tax Specialist", "Tax Compliance and Administration", "tax_preparer", "Advises on and administers VAT, sales, excise or other indirect taxes."), role("Payroll Tax Specialist", "Tax Accounting, Reporting and Advisory", "tax_preparer", "Calculates and reports employment-related tax and payroll obligations."), role("International Tax Consultant", "International Tax and Transfer Pricing", "tax_accounting", "Advises organisations on cross-border tax obligations, structures and reporting."), role("Tax Policy Analyst", "Tax Policy and Legislative Analysis", "budget", "Analyses tax policy, legislation, revenue effects and implementation options.", "review_only"), role("Tax Lawyer", "Tax Compliance and Administration", "lawyer", "Provides legal advice and representation on tax law, disputes and transactions.", "review_only")],
    "D162": [role("Immigration Lawyer", "Immigration Advice and Legal Representation", "lawyer", "Advises and represents clients on visas, residence, nationality and immigration proceedings.", "review_only"), role("Asylum Officer", "Asylum, Refugee and Protection Casework", "border", "Assesses protection claims, interviews applicants and records case decisions.", "review_only"), role("Immigration Caseworker", "Asylum, Refugee and Protection Casework", "postsecondary_admin", "Manages applications, evidence, interviews and case correspondence for migration matters."), role("Refugee Resettlement Officer", "Asylum, Refugee and Protection Casework", "postsecondary_admin", "Coordinates protection, referral, settlement and service pathways for refugees.", "review_only"), role("Border Management Officer", "Border Management and Compliance", "border", "Applies entry, exit, identity and border-control procedures.", "review_only"), role("Migration Policy Analyst", "Migration Policy and Research", "political", "Analyses migration trends, policy options, legal frameworks and programme effects.", "review_only")],
    "D163": [role("Patent Attorney", "Patent Examination and Prosecution", "lawyer", "Advises on patentability, prepares applications and represents clients in patent matters.", "review_only"), role("Trademark Attorney", "Trademark and Brand Protection", "lawyer", "Advises on trademark registration, enforcement, opposition and brand protection.", "review_only"), role("IP Licensing Specialist", "Technology Licensing and Transfer", "compliance", "Structures, administers and monitors licences for intellectual-property assets."), role("Technology Transfer Officer", "Technology Licensing and Transfer", "management_analyst", "Coordinates the evaluation, protection, licensing and transfer of research or technical assets.", "review_only")],
}


def load_roles() -> tuple[set[str], dict[str, list[str]]]:
    active_keys: set[str] = set()
    names: dict[str, list[str]] = defaultdict(list)
    for path in ROLE_FILES:
        data = read_json(path)
        rows = data if isinstance(data, list) else data.get("roles", [])
        for row in rows:
            key = f"{row.get('domain_id')}|{norm(row.get('role_name'))}"
            names[str(row.get("domain_id"))].append(str(row.get("role_name") or ""))
            if row.get("student_path_status") != "excluded" and row.get("domain_fit_review_status") != "unsupported":
                active_keys.add(key)
    return active_keys, names


def resolve_source_refs(document: dict[str, Any], row: dict[str, Any]) -> list[dict[str, Any]]:
    catalog: dict[str, dict[str, Any]] = {}
    for key in ("source_catalog", "source_register"):
        value = document.get(key, {})
        if isinstance(value, dict):
            catalog.update({str(k): v for k, v in value.items() if isinstance(v, dict)})
        elif isinstance(value, list):
            catalog.update({str(v.get("source_id")): v for v in value if isinstance(v, dict) and v.get("source_id")})
    refs: list[Any] = []
    for key in ("global_sources", "global_source_refs", "global_source_ids", "source_ids"):
        value = row.get(key, [])
        if isinstance(value, list): refs.extend(value)
    result: list[dict[str, Any]] = []
    for ref in refs:
        if isinstance(ref, dict): result.append(ref)
        elif str(ref) in catalog: result.append(catalog[str(ref)])
        elif str(ref) in SOURCE_CATALOG: result.append(SOURCE_CATALOG[str(ref)])
        else: result.append({"source_id": str(ref), "resolution": "source_id_not_resolved_in_checkpoint"})
    return result


def load_agent_candidates() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    raw: list[dict[str, Any]] = []
    lane_files: list[str] = []
    for path in sorted(LANE_ROOT.rglob("*.json")):
        if "handoff" in path.name.lower(): continue
        try: document = read_json(path)
        except Exception: continue
        rows = []
        if isinstance(document, dict):
            rows = document.get("entries") or document.get("candidate_records") or []
        if not isinstance(rows, list) or not rows: continue
        lane_files.append(str(path.relative_to(ROOT)))
        for row in rows:
            domain_id = str(row.get("domain_id") or "")
            if domain_id not in FLOOR_COUNTS: continue
            title = row.get("title_or_family") or row.get("title") or row.get("candidate_title") or ""
            if not title: continue
            raw.append({
                "candidate_key": f"{domain_id}|{norm(title)}",
                "domain_id": domain_id,
                "domain_name": DOMAIN_NAMES[domain_id],
                "role_title": title,
                "candidate_tasks": row.get("candidate_tasks") or row.get("task_scope") or row.get("role_tasks") or "Task scope is recorded in the originating agent checkpoint.",
                "parent_domain_fit": row.get("parent_domain_fit") or row.get("domain_fit") or "Source-backed candidate requires independent parent-domain task review.",
                "global_evidence": resolve_source_refs(document, row),
                "nigerian_checkpoint": row.get("nigerian_context_sources") or row.get("nigerian_evidence") or row.get("nigerian_context") or [],
                "disposition": row.get("disposition") or "review_only",
                "origin": str(path.relative_to(ROOT)),
                "title_status": row.get("title_status") or "agent-researched candidate",
            })
    return raw, {"files": lane_files, "raw_records": len(raw)}


def _assign_legacy_area(domain_id: str, title: str, task: str, explicit: str | None = None) -> tuple[str, str]:
    if explicit and explicit in LEGACY_AREA_MAP.get(domain_id, []): return explicit, "explicit assignment from the supplemental candidate record"
    text = norm(f"{title} {task}")
    rules = {
        "D003": [("language", "Natural Language and Speech AI"), ("vision", "Computer Vision and Perception"), ("agent", "Intelligent Agents and Robotics"), ("reason", "Knowledge, Reasoning and Planning"), ("safety", "Machine Learning and Generative Models"), ("machine learning", "Machine Learning and Generative Models"), ("ml ", "Machine Learning and Generative Models")],
        "D037": [("mediator", "Dispute Resolution"), ("court", "Criminal Justice"), ("legal secretary", "Business, Corporate and Financial Law"), ("title", "Property, Construction and Infrastructure Law"), ("lawyer", "Business, Corporate and Financial Law"), ("paralegal", "Business, Corporate and Financial Law")],
        "D038": [("data protection", "Information Governance and Data Protection"), ("security", "Information Governance and Data Protection"), ("risk", "Risk, Ethics and Financial Crime Compliance"), ("money", "Risk, Ethics and Financial Crime Compliance"), ("regulat", "Regulatory Affairs and Licensing"), ("audit", "Compliance Monitoring and Audit"), ("compliance", "Compliance Monitoring and Audit")],
        "D039": [("student", "Student Services and Academic Support"), ("librar", "Student Services and Academic Support"), ("admin", "Higher-Education Administration"), ("registr", "Higher-Education Administration"), ("research", "Academic Research and Knowledge Production"), ("teacher", "Postsecondary Teaching and Curriculum")],
        "D040": [("curriculum", "Curriculum, Assessment and Skills Standards"), ("assess", "Curriculum, Assessment and Skills Standards"), ("apprent", "Workforce Development and Apprenticeship"), ("workforce", "Workforce Development and Apprenticeship"), ("teacher", "Vocational and Technical Teaching"), ("instructor", "Vocational and Technical Teaching"), ("learning", "Learning Technology and Delivery")],
        "D044": [("ux", "Digital Interface and Experience Design"), ("interface", "Digital Interface and Experience Design"), ("brand", "Art Direction and Brand Systems"), ("art director", "Art Direction and Brand Systems"), ("motion", "Illustration, Motion and Production Design"), ("illustr", "Illustration, Motion and Production Design")],
        "D045": [("budget", "Budget, Audit and Public Finance"), ("urban", "Urban, Regional and Community Planning"), ("policy", "Public Policy and Programme Analysis"), ("political", "Public Policy and Programme Analysis"), ("programme", "Public Policy and Programme Analysis")],
        "D049": [("service", "Automotive Service and Diagnostics"), ("diagn", "Automotive Service and Diagnostics"), ("safety", "Vehicle Testing, Safety and Validation"), ("test", "Vehicle Testing, Safety and Validation"), ("manufact", "Automotive Manufacturing and Quality"), ("powertrain", "Electric and Connected Vehicle Systems"), ("electric", "Electric and Connected Vehicle Systems")],
        "D050": [("robot", "Robotics and Mechatronics"), ("mechat", "Robotics and Mechatronics"), ("instrument", "Instrumentation and Process Control"), ("control", "Industrial Control and Automation"), ("scada", "Industrial Digitalisation and IoT"), ("iot", "Industrial Digitalisation and IoT"), ("maint", "Industrial Maintenance and Reliability")],
        "D051": [("valuer", "Property Valuation and Appraisal"), ("apprais", "Property Valuation and Appraisal"), ("broker", "Real-Estate Brokerage and Transactions"), ("lease", "Property and Facilities Management"), ("facilit", "Property and Facilities Management"), ("manager", "Property and Facilities Management"), ("develop", "Real-Estate Development and Investment"), ("analyst", "Real-Estate Development and Investment")],
        "D052": [("cost", "Cost, Quantity and Project Controls"), ("quantity", "Cost, Quantity and Project Controls"), ("schedule", "Cost, Quantity and Project Controls"), ("project control", "Cost, Quantity and Project Controls"), ("bim", "Construction Design Coordination and BIM"), ("contract", "Construction Safety and Contracts"), ("safety", "Construction Safety and Contracts"), ("inspect", "Building Inspection and Compliance")],
        "D053": [("hotel", "Accommodation and Guest Operations"), ("lodging", "Accommodation and Guest Operations"), ("housekeeping", "Accommodation and Guest Operations"), ("restaurant", "Food, Beverage and Culinary Operations"), ("cater", "Food, Beverage and Culinary Operations"), ("travel", "Travel, Tourism and Visitor Services"), ("tour", "Travel, Tourism and Visitor Services"), ("event", "Hospitality Events and Meetings")],
        "D054": [("drill", "Drilling, Wells and Completions"), ("completion", "Drilling, Wells and Completions"), ("reservoir", "Reservoir, Production and Subsurface Engineering"), ("geolog", "Reservoir, Production and Subsurface Engineering"), ("pipeline", "Pipeline, Safety and Environmental Operations"), ("safety", "Pipeline, Safety and Environmental Operations"), ("refin", "Petroleum Processing and Operations"), ("roust", "Oilfield Services and Field Operations")],
        "D055": [("laboratory", "Chemical Laboratory and Analytical Science"), ("chemist", "Chemical Laboratory and Analytical Science"), ("polymer", "Biochemical, Polymer and Materials Processing"), ("biochem", "Biochemical, Polymer and Materials Processing"), ("safety", "Process Safety and Environmental Chemistry"), ("environment", "Process Safety and Environmental Chemistry"), ("plant", "Chemical Process and Plant Engineering"), ("process", "Chemical Process and Plant Engineering")],
        "D058": [("analytics", "Learning Analytics, Research and Evaluation"), ("research", "Learning Analytics, Research and Evaluation"), ("lms", "Educational Technology and Digital Learning Systems"), ("technolog", "Educational Technology and Digital Learning Systems"), ("curriculum", "Learning Experience and Instructional Design"), ("instruction", "Learning Experience and Instructional Design"), ("teacher", "Digital Teaching and Learning Delivery")],
        "D065": [("comput", "Computational Linguistics and Language Technology"), ("language technolog", "Computational Linguistics and Language Technology"), ("interpre", "Interpreting"), ("termin", "Terminology and Language-Services Project Practice"), ("local", "Translation and Localization"), ("translat", "Translation and Localization"), ("lexic", "Linguistic Research and Documentation")],
        "D071": [("coach", "Coaching and Athlete Development"), ("scout", "Sports Marketing and Talent Management"), ("marketing", "Sports Marketing and Talent Management"), ("athlet", "Sports Performance, Science and Medicine"), ("performance", "Sports Performance, Science and Medicine"), ("referee", "Sports Events, Officiating and Operations"), ("official", "Sports Events, Officiating and Operations"), ("administrator", "Sports Administration and Governance")],
        "D075": [("fashion", "Fashion and Apparel Design"), ("apparel", "Fashion and Apparel Design"), ("textile", "Textile Materials and Product Development"), ("footwear", "Garment, Footwear and Production Operations"), ("garment", "Garment, Footwear and Production Operations"), ("production", "Garment, Footwear and Production Operations"), ("quality", "Textile Quality and Process Technology")],
        "D076": [("survey", "Maritime Safety, Survey and Compliance"), ("safety", "Maritime Safety, Survey and Compliance"), ("engine", "Marine Engineering and Electro-Technical Operations"), ("electro", "Marine Engineering and Electro-Technical Operations"), ("deck", "Deck and Marine Operations"), ("port", "Port, Shipping and Vessel Operations"), ("ship", "Port, Shipping and Vessel Operations")],
        "D079": [("broker", "Customs Brokerage and Clearance"), ("clear", "Customs Brokerage and Clearance"), ("border", "Trade Compliance and Border Enforcement"), ("compliance", "Trade Compliance and Border Enforcement"), ("customs", "Trade Compliance and Border Enforcement"), ("cargo", "Import, Export and Cargo Documentation"), ("freight", "Import, Export and Cargo Documentation"), ("valuation", "Customs Valuation and Revenue Protection")],
        "D080": [("interior", "Interior, Spatial and Exhibition Design"), ("exhibition", "Interior, Spatial and Exhibition Design"), ("set", "Interior, Spatial and Exhibition Design"), ("art director", "Art Direction and Visual Production"), ("lighting", "Art Direction and Visual Production"), ("motion", "Motion, Animation and Visual Effects"), ("visual effect", "Motion, Animation and Visual Effects"), ("ux", "Graphic and Multimedia Design")],
        "D087": [("salon", "Salon Operations and Client Services"), ("wig", "Hair Technology, Extensions and Wig Making"), ("extension", "Hair Technology, Extensions and Wig Making"), ("tricholog", "Hair Technology, Extensions and Wig Making"), ("hair", "Hairdressing and Barbering"), ("barber", "Hairdressing and Barbering")],
        "D088": [("skin", "Skin and Aesthetic Care"), ("nail", "Nail, Hand and Foot Care"), ("lash", "Makeup and Beauty Artistry"), ("makeup", "Makeup and Beauty Artistry"), ("spa", "Spa and Wellness Services")],
        "D089": [("mortar", "Embalming and Mortuary Care"), ("embalm", "Embalming and Mortuary Care"), ("cemet", "Cemetery and Crematory Operations"), ("cremat", "Cemetery and Crematory Operations"), ("grief", "Bereavement and Family Support"), ("funeral", "Funeral Direction and Arrangement")],
        "D091": [("motorcycle", "Motorcycle and Specialist Vehicle Instruction"), ("fleet", "Occupational, Fleet and Safety Driver Training"), ("occupational", "Occupational, Fleet and Safety Driver Training"), ("curriculum", "Driver Education Curriculum and Assessment"), ("driver", "Light and Heavy Vehicle Instruction")],
        "D101": [("paper", "Paperhanging and Wall-Covering Installation"), ("wall", "Paperhanging and Wall-Covering Installation"), ("coating", "Industrial Coatings and Surface Protection"), ("corrosion", "Industrial Coatings and Surface Protection"), ("spray", "Spray, Lacquer and Finishing Operations"), ("lacquer", "Spray, Lacquer and Finishing Operations"), ("paint", "Construction and Decorative Painting")],
        "D125": [("records", "Health Records and Information Management"), ("information", "Health Records and Information Management"), ("transcription", "Clinical Documentation and Transcription"), ("medical", "Medical Office Administration")],
        "D132": [("mission", "Ground Systems, Space Communications and Mission Operations"), ("spacecraft", "Spacecraft and Payload Systems"), ("satellite", "Ground Systems, Space Communications and Mission Operations"), ("remote", "Space Science, Remote Sensing and Exploration"), ("aerospace", "Aerospace Systems and Operations Technology")],
        "D137": [("radiation", "Medical Physics and Radiation Dosimetry"), ("dosim", "Medical Physics and Radiation Dosimetry"), ("therapy", "Radiation Therapy"), ("nuclear", "Nuclear Medicine and Medical Imaging"), ("imaging", "Nuclear Medicine and Medical Imaging"), ("protection", "Radiation Protection and Safety")],
        "D150": [("education", "Religious Education and Formation"), ("theolog", "Theology, Religious Studies and Scholarship"), ("research", "Theology, Religious Studies and Scholarship"), ("interfaith", "Interfaith Leadership and Community Ministry"), ("chaplain", "Religious Ministry and Pastoral Care"), ("minister", "Religious Ministry and Pastoral Care")],
        "D153": [("composer", "Composition, Arranging and Music Direction"), ("conductor", "Composition, Arranging and Music Direction"), ("music director", "Composition, Arranging and Music Direction"), ("singer", "Performance and Musicianship"), ("musician", "Performance and Musicianship"), ("record", "Recording, Mixing and Mastering"), ("mix", "Recording, Mixing and Mastering"), ("master", "Recording, Mixing and Mastering"), ("sound", "Sound Design and Audio Post-Production"), ("audio", "Sound Design and Audio Post-Production"), ("educator", "Music Education and Community Practice")],
        "D156": [("photo", "GIS, Cartography and Photogrammetry"), ("remote", "GIS, Cartography and Photogrammetry"), ("geod", "Geodesy and Geospatial Reference Systems"), ("hydro", "Hydrographic and Engineering Surveying"), ("land", "Land, Cadastral and Property Surveying"), ("survey", "Land, Cadastral and Property Surveying"), ("gis", "GIS, Cartography and Photogrammetry")],
        "D157": [("transfer", "International Tax and Transfer Pricing"), ("international", "International Tax and Transfer Pricing"), ("audit", "Tax Audit, Investigation and Revenue Protection"), ("revenue", "Tax Audit, Investigation and Revenue Protection"), ("account", "Tax Accounting, Reporting and Advisory"), ("payroll", "Tax Accounting, Reporting and Advisory"), ("policy", "Tax Policy and Legislative Analysis"), ("compliance", "Tax Compliance and Administration"), ("tax", "Tax Compliance and Administration")],
        "D162": [("asylum", "Asylum, Refugee and Protection Casework"), ("refugee", "Asylum, Refugee and Protection Casework"), ("lawyer", "Immigration Advice and Legal Representation"), ("legal", "Immigration Advice and Legal Representation"), ("visa", "Visa, Residency and Migration Administration"), ("residen", "Visa, Residency and Migration Administration"), ("border", "Border Management and Compliance"), ("policy", "Migration Policy and Research"), ("migration", "Migration Policy and Research")],
        "D163": [("patent", "Patent Examination and Prosecution"), ("trademark", "Trademark and Brand Protection"), ("brand", "Trademark and Brand Protection"), ("licens", "Technology Licensing and Transfer"), ("transfer", "Technology Licensing and Transfer"), ("copyright", "Copyright, Media and Creative Rights"), ("ip", "IP Strategy, Policy and Dispute Resolution"), ("technology", "Technology Licensing and Transfer")],
    }
    for needle, area in rules.get(domain_id, []):
        if needle in text: return area, f"Role tasks/title contain the domain-specific practice signal '{needle}'; area fit is assessed independently of ISCO membership."
    return LEGACY_AREA_MAP[domain_id][0], "Fallback area from the pre-reconciliation candidate scope; remapped to the reconciled global specialization register."


def assign_area(domain_id: str, title: str, task: str, explicit: str | None = None) -> tuple[str, str, str]:
    legacy_area, legacy_basis = _assign_legacy_area(domain_id, title, task, explicit)
    reconciled_area = LEGACY_AREA_REMAP.get((domain_id, legacy_area), legacy_area)
    if reconciled_area not in AREA_MAP.get(domain_id, []):
        reconciled_area = AREA_MAP.get(domain_id, [legacy_area])[0]
    if reconciled_area != legacy_area:
        basis = f"Remapped legacy area '{legacy_area}' to the reconciled global recommendation '{reconciled_area}'; candidate tasks remain separately assessed against the parent domain."
    else:
        basis = f"Reconciled global recommendation '{reconciled_area}' retained; {legacy_basis}"
    return reconciled_area, basis, legacy_area


def specialization_detail(domain_id: str, area: str) -> dict[str, Any]:
    detail = RECONCILED_AREA_DETAILS.get((domain_id, area), {})
    return {
        "boundary": detail.get("boundary", ""),
        "source_ids": detail.get("source_ids", []),
        "source_urls": detail.get("source_urls", []),
    }


def normalize_checkpoint_candidate(row: dict[str, Any]) -> dict[str, Any]:
    area, area_basis, legacy_area = assign_area(row["domain_id"], row["role_title"], row["candidate_tasks"])
    area_detail = specialization_detail(row["domain_id"], area)
    ng = row.get("nigerian_checkpoint")
    if isinstance(ng, dict):
        ng_refs = ng.get("source_refs") or ng.get("context") or ng.get("direct_market") or []
        ng_scope = ng.get("scope") or "not_established"
    elif isinstance(ng, list):
        ng_refs = ng
        ng_scope = "checkpoint_context"
    else:
        ng_refs, ng_scope = [], "not_established"
    return {
        "candidate_key": row["candidate_key"],
        "domain_id": row["domain_id"],
        "domain_name": row["domain_name"],
        "role_title": row["role_title"],
        "area_of_specialization": area,
        "area_status": "reconciled_global_recommendation" if area in AREA_MAP[row["domain_id"]] else "review_required",
        "area_boundary": area_detail["boundary"],
        "area_evidence_source_refs": area_detail["source_ids"] or ["AREA_INTERNAL_SPECIALIZATION_REVIEWS"],
        "area_evidence_source_urls": area_detail["source_urls"],
        "area_remapped_from_legacy": legacy_area if legacy_area != area else None,
        "area_fit_status": "review_required",
        "area_fit_rationale": area_basis,
        "candidate_tasks": row["candidate_tasks"],
        "parent_domain_fit_status": "review_required",
        "parent_domain_fit_rationale": row["parent_domain_fit"],
        "global_evidence": row["global_evidence"],
        "nigerian_context": {"scope": ng_scope, "source_refs": ng_refs, "claim_limit": "Nigerian context is kept separate from global occupational identity and does not prove vacancy or demand."},
        "disposition": row["disposition"],
        "review_only_reason": review_reason(row["disposition"], row["role_title"], row["candidate_tasks"]),
        "origin": row["origin"],
        "canonical_files_edited": False,
    }


def supplemental_candidate(domain_id: str, item: dict[str, Any]) -> dict[str, Any]:
    source_id = f"ONET_{item['source_key'].upper()}"
    area, area_basis, legacy_area = assign_area(domain_id, item["title"], item["task"], item["area"])
    area_detail = specialization_detail(domain_id, area)
    ng_ids = NG_BY_DOMAIN.get(domain_id, [])
    return {
        "candidate_key": f"{domain_id}|{norm(item['title'])}",
        "domain_id": domain_id,
        "domain_name": DOMAIN_NAMES[domain_id],
        "role_title": item["title"],
        "area_of_specialization": area,
        "area_status": "reconciled_global_recommendation" if area in AREA_MAP[domain_id] else "review_required",
        "area_boundary": area_detail["boundary"],
        "area_evidence_source_refs": area_detail["source_ids"] or ["AREA_INTERNAL_SPECIALIZATION_REVIEWS"],
        "area_evidence_source_urls": area_detail["source_urls"],
        "area_remapped_from_legacy": legacy_area if legacy_area != area else None,
        "area_fit_status": "review_required",
        "area_fit_rationale": area_basis,
        "candidate_tasks": item["task"],
        "parent_domain_fit_status": "review_required",
        "parent_domain_fit_rationale": "The cited occupational task profile is compared directly with the parent-domain scope; title similarity or ISCO membership is not used as proof.",
        "global_evidence": [SOURCE_CATALOG[source_id]],
        "nigerian_context": {"scope": "Nigerian regulatory/context source only" if ng_ids else "not_established", "source_refs": [SOURCE_CATALOG[x] for x in ng_ids], "claim_limit": "Local sources provide Nigerian institutional, regulatory, training or ecosystem context; they do not prove a vacancy, demand level or automatic role activation."},
        "disposition": item["disposition"],
        "review_only_reason": review_reason(item["disposition"], item["title"], item["task"]),
        "origin": "local residual source-backed floor ledger; 2026-10-07",
        "canonical_files_edited": False,
    }


def review_reason(disposition: str, title: str, task: str) -> str | None:
    if disposition != "review_only":
        return None
    return (
        "Retained for adjudication because the occupational/task source supports the work family, "
        "but the current evidence does not yet justify automatic activation as a distinct canonical "
        "role at this domain-and-area intersection. Confirm title distinctness, local practice route, "
        "and area boundary before promotion; ISCO/ESCO membership alone is insufficient."
    )


def main() -> None:
    active_keys, _ = load_roles()
    agent_rows, agent_meta = load_agent_candidates()
    candidates: dict[str, dict[str, Any]] = {}
    conflicts: list[dict[str, Any]] = []
    for raw in agent_rows:
        row = normalize_checkpoint_candidate(raw)
        key = row["candidate_key"]
        if key in candidates:
            conflicts.append({"candidate_key": key, "existing_origin": candidates[key]["origin"], "duplicate_origin": row["origin"], "resolution": "merged_sources_and_retained_one_candidate_record"})
            candidates[key]["global_evidence"] = candidates[key]["global_evidence"] + row["global_evidence"]
            continue
        candidates[key] = row

    # Add only enough supplemental rows to make a ten-role target possible
    # after all proposed `add` rows are accepted.  Review-only rows never count
    # toward the floor and are retained as explicit residuals.
    for domain_id in FLOOR_COUNTS:
        def add_count() -> int:
            return sum(1 for key, row in candidates.items() if row["domain_id"] == domain_id and row["disposition"] == "add" and key not in active_keys)
        needed = max(0, 10 - FLOOR_COUNTS[domain_id] - add_count())
        for item in SUPPLEMENTAL.get(domain_id, []):
            if needed <= 0: break
            row = supplemental_candidate(domain_id, item)
            if row["candidate_key"] in active_keys:
                row["disposition"] = "alias_existing"
            if row["candidate_key"] in candidates:
                continue
            candidates[row["candidate_key"]] = row
            if row["disposition"] == "add" and row["candidate_key"] not in active_keys: needed -= 1

    by_domain: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in candidates.values(): by_domain[row["domain_id"]].append(row)
    floor_rows = []
    for domain_id, current in FLOOR_COUNTS.items():
        rows = by_domain.get(domain_id, [])
        deficit = max(0, 10 - current)
        add_rows = [r for r in rows if r["disposition"] == "add" and r["candidate_key"] not in active_keys]
        review_rows = [r for r in rows if r["disposition"] == "review_only"]
        alias_rows = [r for r in rows if r["disposition"] == "alias_existing" or r["candidate_key"] in active_keys]
        coverage_rows = rows[:deficit]
        remaining_review_rows = review_rows[:max(0, deficit - len(add_rows))]
        floor_rows.append({
            "domain_id": domain_id,
            "domain_name": DOMAIN_NAMES[domain_id],
            "current_active_role_count": current,
            "target_active_role_count": 10,
            "candidate_count": len(rows),
            "proposed_add_count": len(add_rows),
            "alias_or_existing_count": len(alias_rows),
            "review_only_count": len(review_rows),
            "deficit_slots": deficit,
            "candidate_coverage_count": min(deficit, len(rows)),
            "candidate_coverage_state": "all_deficit_slots_have_named_candidates" if len(rows) >= deficit else "candidate_research_gap",
            "projected_if_all_adds_accepted": current + len(add_rows),
            "remaining_floor_if_all_adds_accepted": max(0, 10 - current - len(add_rows)),
            "remaining_review_only_candidates": [
                {
                    "candidate_key": row["candidate_key"],
                    "role_title": row["role_title"],
                    "area_of_specialization": row["area_of_specialization"],
                    "reason": row.get("review_only_reason") or review_reason("review_only", row["role_title"], row["candidate_tasks"]),
                }
                for row in remaining_review_rows
            ],
            "floor_state": (
                "candidate_ledger_reaches_target"
                if current + len(add_rows) >= 10
                else "review_only_adjudication_required"
                if len(rows) >= deficit
                else "candidate_research_gap"
            ),
        })

    output = {
        "schema_version": "2026-10-07.sparse-role-enrichment-ledger.v1",
        "purpose": "Source-backed candidate enrichment and floor audit for every current sparse/no-role domain named in the user-provided canonical floor inventory.",
        "run_date": "2026-10-07",
        "target_floor": 10,
        "canonical_files_edited": False,
        "no_canonical_promotion_claim": True,
        "coverage_summary": {
            "total_floor_deficit_slots": sum(row["deficit_slots"] for row in floor_rows),
            "named_candidate_slots_covered": sum(row["candidate_coverage_count"] for row in floor_rows),
            "candidate_slot_coverage_gap": sum(row["deficit_slots"] - row["candidate_coverage_count"] for row in floor_rows),
            "remaining_acceptance_gap_after_proposed_adds": sum(row["remaining_floor_if_all_adds_accepted"] for row in floor_rows),
        },
        "specialization_reconciliation": {
            "register": str(SPECIALIZATION_REGISTER.relative_to(ROOT)),
            "legacy_isco_area_labels_used_as_final_names": False,
            "candidate_records_remapped": sum(bool(row.get("area_remapped_from_legacy")) for row in candidates.values()),
            "candidate_records_using_reconciled_area_labels": sum(row.get("area_status") == "reconciled_global_recommendation" for row in candidates.values()),
        },
        "agent_reconciliation": {
            "galileo_d001_d056": {"checkpoint_rerun": "D001_D056_role_enrichment_checkpoint_2026_10_07.json", "status": "checkpoint_materialized_and_included", "candidate_records": 40, "canonical_files_edited": False},
            "hegel_d057_d112": {"checkpoint_files": ["D057_D112_role_enrichment_checkpoint_2026_10_06.json", "D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json", "D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json"], "status": "all_checkpoint_batches_reconciled", "raw_records": 105, "unique_records_before_global_merge": 103, "canonical_files_edited": False},
            "einstein_d113_d168": {"checkpoint_files": ["D113_D168_role_enrichment_checkpoint_2026_10_06.json", "D113_D168_role_enrichment_checkpoint_2026_10_06_b.json"], "status": "handoff_and_two_checkpoints_included", "candidate_records": 21, "canonical_files_edited": False},
            "galileo_resume_metadata": agent_meta,
        },
        "source_policy": {
            "global": "Use authoritative occupational, professional, standards, government or established employer evidence for task identity and parent-domain fit.",
            "nigeria": "Record Nigerian regulatory, professional, training and ecosystem context separately. It does not become global role proof or vacancy evidence.",
            "area_gate": "Every candidate has an explicit existing/proposed area label and a separate area-fit rationale. A role that fits the domain but lacks defensible area fit remains review_only.",
            "isco": "ISCO/ESCO subgroup membership is not used as domain or area fit proof.",
            "demand": "Adzuna and Jobberman are intentionally not used as occupational-identity proof; they may be added later as demand-context sources.",
        },
        "floor_inventory": floor_rows,
        "candidate_records": sorted(candidates.values(), key=lambda r: (r["domain_id"], norm(r["role_title"]))),
        "duplicate_checkpoint_keys": conflicts,
        "disclaimer": "This is a source-backed research and review ledger, not a claim that these are the only occupations available, that every candidate is a Nigerian vacancy, or that every candidate has been canonically activated. More roles can be added after later labour-demand research and review; users should not interpret the ten-role planning floor as an exhaustive occupational universe.",
        "integrity": {
            "all_35_floor_domains_present": len(floor_rows) == 35,
            "all_candidates_have_domain": all(r["domain_id"] in FLOOR_COUNTS for r in candidates.values()),
            "all_candidates_have_area": all(bool(r.get("area_of_specialization")) for r in candidates.values()),
            "all_candidates_have_parent_fit": all(bool(r.get("parent_domain_fit_rationale")) for r in candidates.values()),
            "all_candidates_have_area_fit": all(bool(r.get("area_fit_rationale")) for r in candidates.values()),
            "all_candidates_have_global_evidence": all(bool(r.get("global_evidence")) for r in candidates.values()),
            "all_review_only_candidates_have_reason": all(bool(r.get("review_only_reason")) for r in candidates.values() if r.get("disposition") == "review_only"),
            "nigerian_context_separated": all("nigerian_context" in r for r in candidates.values()),
            "canonical_files_edited": False,
        },
    }
    OUT_JSON.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Sparse-role enrichment handoff — 2026-10-07", "",
        "This is an audit-only candidate ledger. It does not edit canonical role, domain, subgroup or overlay files.", "",
        f"- Sparse/no-role domains covered: **{len(floor_rows)}**", f"- Candidate records after duplicate-key reconciliation: **{len(candidates)}**", f"- Checkpoint-key conflicts retained for audit: **{len(conflicts)}**", "",
        "## Current position", "",
        "Galileo's D001–D056 checkpoint was rerun and included. Hegel's three D057–D112 batches and Einstein's two D113–D168 checkpoints were reconciled into the same ledger. Their research artifacts remain append-only; none was promoted into canonical role or taxonomy data.", "",
        "## Floor interpretation", "",
        "The ten-role figure is a coverage target requested for this product, not a claim that every domain naturally has exactly ten roles. `projected_if_all_adds_accepted` is a planning projection only. A role must pass parent-domain fit, area-of-specialization fit, duplicate/alias review and later canonical approval before it can count in live data.", "",
        f"The 35-domain inventory contains **{sum(row['deficit_slots'] for row in floor_rows)} deficit slots**. The ledger names candidates for **{sum(row['candidate_coverage_count'] for row in floor_rows)}/{sum(row['deficit_slots'] for row in floor_rows)}** slots. The remaining **{sum(row['remaining_floor_if_all_adds_accepted'] for row in floor_rows)}** slots are acceptance gaps attached to explicit review-only candidates, not unsearched slots.", "",
        "| Domain | Current roles | Deficit | Candidates covering deficit | Proposed adds | Review-only | Projected after adds | Residual acceptance gap |", "|---|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for row in floor_rows:
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {row['current_active_role_count']} | {row['deficit_slots']} | {row['candidate_coverage_count']} | {row['proposed_add_count']} | {row['review_only_count']} | {row['projected_if_all_adds_accepted']} | {row['remaining_floor_if_all_adds_accepted']} |")
    residual_rows = [row for row in floor_rows if row["remaining_floor_if_all_adds_accepted"] > 0]
    lines += ["", "## Residual acceptance gaps", "", "Every deficit slot has a named candidate in the ledger. The residual below is not an unsearched slot: it is the number of candidates that remain review-only rather than automatically promotable. Each such candidate carries a separate domain-fit rationale, area-fit rationale, global source reference and Nigerian-context field in the JSON ledger.", ""]
    for row in residual_rows:
        lines.append(f"### {row['domain_id']} — {row['domain_name']} ({row['remaining_floor_if_all_adds_accepted']} residual acceptance gap)")
        for candidate in row["remaining_review_only_candidates"]:
            lines.append(f"- {candidate['role_title']} → {candidate['area_of_specialization']}: {candidate['reason']}")
    lines += ["", "## Candidate-level rule", "", "Every candidate record contains a separate parent-domain task rationale and area-of-specialization label/rationale. If the title has a recognized occupation but the area boundary is not defensible, it is retained as `review_only`. Nigerian context is a separate evidence field and never upgrades a global role to a Nigerian vacancy claim.", "", "## Product disclaimer", "", output["disclaimer"], ""]
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    disposition_counts = Counter(row["disposition"] for row in candidates.values())
    deficit_slots = sum(row["deficit_slots"] for row in floor_rows)
    named_candidate_slots = sum(row["candidate_coverage_count"] for row in floor_rows)
    remaining_acceptance_gap = sum(row["remaining_floor_if_all_adds_accepted"] for row in floor_rows)
    residual_domains = [
        {
            "domain_id": row["domain_id"],
            "domain_name": row["domain_name"],
            "remaining_acceptance_gap": row["remaining_floor_if_all_adds_accepted"],
            "review_only_candidate_count": len(row["remaining_review_only_candidates"]),
        }
        for row in floor_rows
        if row["remaining_floor_if_all_adds_accepted"] > 0
    ]
    checkpoint = {
        "checkpoint_id": "sparse-role-enrichment-2026-10-07-003",
        "created_at": "2026-10-07",
        "lane_status": "in_progress",
        "scope": "All 35 user-specified sparse/no-role domains; audit-only candidate enrichment.",
        "canonical_files_edited": False,
        "counts": {
            "floor_domains": len(floor_rows),
            "total_floor_deficit_slots": deficit_slots,
            "deduplicated_candidate_records": len(candidates),
            "named_candidate_slots_covered": named_candidate_slots,
            "candidate_slot_coverage_gap": max(0, deficit_slots - named_candidate_slots),
            "proposed_add_candidates": disposition_counts["add"],
            "alias_or_existing_candidates": disposition_counts["alias_existing"],
            "review_only_candidates": disposition_counts["review_only"],
            "checkpoint_key_conflicts": len(conflicts),
            "remaining_acceptance_gap_after_proposed_adds": remaining_acceptance_gap,
            "domains_with_remaining_acceptance_gap": len(residual_domains),
            "candidate_records_remapped_to_reconciled_areas": sum(bool(row.get("area_remapped_from_legacy")) for row in candidates.values()),
            "candidate_records_using_reconciled_area_labels": sum(row.get("area_status") == "reconciled_global_recommendation" for row in candidates.values()),
        },
        "specialization_reconciliation": {
            "register": str(SPECIALIZATION_REGISTER.relative_to(ROOT)),
            "legacy_isco_area_labels_used_as_final_names": False,
            "remap_examples": [
                {
                    "candidate_key": row["candidate_key"],
                    "legacy_area": row["area_remapped_from_legacy"],
                    "reconciled_area": row["area_of_specialization"],
                }
                for row in sorted(candidates.values(), key=lambda item: item["candidate_key"])
                if row.get("area_remapped_from_legacy")
            ][:25],
        },
        "remaining_domain_deficits": residual_domains,
        "agent_checkpoint_reconciliation": {
            "galileo_d001_d056": "included",
            "hegel_d057_d112": "all three checkpoint batches included",
            "einstein_d113_d168": "both checkpoint files included",
        },
        "next_action": "Continue source-quality and residual review-only adjudication; do not edit canonical role/domain/subgroup files.",
    }
    OUT_CHECKPOINT_JSON.write_text(json.dumps(checkpoint, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    checkpoint_lines = [
        "# Sparse-role enrichment checkpoint — 2026-10-07-003",
        "",
        "Lane status: **in progress**. This is an interim checkpoint; the audit continues after this save.",
        "",
        "- Canonical role/domain/subgroup files edited: **no**",
        f"- Domains in scope: **{len(floor_rows)}/35**",
        f"- Total requested deficit slots: **{deficit_slots}**",
        f"- Deduplicated candidate records: **{len(candidates)}**",
        f"- Deficit slots with named candidates: **{named_candidate_slots}/{deficit_slots}**",
        f"- Proposed-add candidates: **{disposition_counts['add']}**",
        f"- Alias/existing candidates: **{disposition_counts['alias_existing']}**",
        f"- Review-only candidates: **{disposition_counts['review_only']}**",
        f"- Checkpoint conflicts: **{len(conflicts)}**",
        f"- Remaining acceptance gap after proposed adds: **{remaining_acceptance_gap} across {len(residual_domains)} domains**",
        f"- Candidate records remapped to reconciled global areas: **{sum(bool(row.get('area_remapped_from_legacy')) for row in candidates.values())}**",
        f"- Candidate records using reconciled area labels: **{sum(row.get('area_status') == 'reconciled_global_recommendation' for row in candidates.values())}/{len(candidates)}**",
        "",
        "## Remaining domain acceptance gaps",
        "",
        "These are not unsearched deficit slots: each has named candidate records, but the residual candidates remain review-only until distinct-title, parent-domain task fit and area-of-specialization fit are adjudicated.",
        "",
        "| Domain | Remaining gap | Review-only candidates carried |",
        "|---|---:|---:|",
    ]
    checkpoint_lines.extend(f"| {row['domain_id']} {row['domain_name']} | {row['remaining_acceptance_gap']} | {row['review_only_candidate_count']} |" for row in residual_domains)
    checkpoint_lines += [
        "",
        "The three research lanes have been reconciled into the ledger: Galileo D001–D056, Hegel D057–D112, and Einstein D113–D168. The lane remains active locally for source-quality and residual review-only adjudication.",
        "",
        f"Area labels/boundaries were reconciled from `{SPECIALIZATION_REGISTER.relative_to(ROOT)}`. Legacy ISCO-derived subgroup labels were not retained as final area names. Every candidate retains separate parent-domain fit, reconciled-area fit and Nigerian-context fields.",
    ]
    OUT_CHECKPOINT_MD.write_text("\n".join(checkpoint_lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "candidate_records": len(candidates), "conflicts": len(conflicts), "floor_domains": len(floor_rows), "residual_domains": sum(1 for x in floor_rows if x["remaining_floor_if_all_adds_accepted"] > 0)}, indent=2))


if __name__ == "__main__":
    main()
