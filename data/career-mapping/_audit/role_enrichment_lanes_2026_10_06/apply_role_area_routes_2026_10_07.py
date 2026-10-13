"""Apply only evidence-gated role -> area-of-practice routes from lane reviews.

This applicator intentionally does not edit parent-domain fit/conditionality,
domain_structure.json, the specialization catalog, or legacy ISCO subgroup
membership.  Run without --apply for a read-only preview.
"""
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
DATA = ROOT / "data" / "career-mapping"
HERE = Path(__file__).resolve().parent
CATALOG = DATA / "domain_specialization_catalog.json"
ROLE_FILES = {
    "role_library_v3_cleaned.json": DATA / "role_library_v3_cleaned.json",
    "thin_domain_role_overlays.json": DATA / "thin_domain_role_overlays.json",
    "emerging_role_overlays.json": DATA / "emerging_role_overlays.json",
}
LANES = [
    ("D001_D056", "D001_D056_existing_role_area_fit_review_2026_10_07.json", "records"),
    ("D057_D112", "D057_D112_existing_role_area_fit_deterministic_2026_10_07.json", "roles"),
    ("D113_D168", "D113_D168_existing_role_area_fit_review_2026_10_07.json", "records"),
]
OUT_JSON = HERE / "ROLE_AREA_ROUTE_APPLY_2026_10_07.json"
OUT_MD = HERE / "ROLE_AREA_ROUTE_APPLY_2026_10_07.md"
ROUTE_FIELDS = {
    "specialization_fit_status",
    "specialization_fit_candidate",
    "specialization_fit_area_key",
    "specialization_fit_review_basis",
    "specialization_fit_review_source_refs",
    "specialization_fit_review_date",
}
NO_AREA_DOMAIN_IDS = {"D124", "D126", "D129", "D133"}


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: Any) -> str:
    return " ".join(re.findall(r"[a-z0-9+#]+", str(value or "").casefold()))


def key(domain_id: str, title: str) -> str:
    return f"{domain_id}|{norm(title)}"


TASK_AREA_RULES = {
    key("D046", "community social worker"): {
        "area_key": "D046:community-and-social-development", "required_task_phrases": ("work with communities and groups", "coordinate with relevant services"),
        "rationale": "The sourced tasks work with communities/groups, coordinate services and represent people in policy settings. The dominant fit is community/social development; this is distinct from a direct-practice casework route and is supported by global social-work standards.",
        "source_ids": ["IFSW_GLOBAL_STANDARDS_2012_BOUNDARY", "IFSW_IASSW_GLOBAL_STANDARDS", "IFSW_GLOBAL_DEFINITION"],
    },
    key("D046", "community development social worker"): {
        "area_key": "D046:community-and-social-development", "required_task_phrases": ("organize and support individuals, families, and groups in disadvantaged areas", "build local leadership"),
        "rationale": "The source tasks organize community groups, build local leadership, address inequality and support locally generated development. These are community/social-development duties, not primarily one-to-one direct social-work practice.",
        "source_ids": ["IFSW_GLOBAL_STANDARDS_2012_BOUNDARY", "IFSW_IASSW_GLOBAL_STANDARDS", "IFSW_GLOBAL_DEFINITION"],
    },
    key("D066", "animal behaviourist"): {
        "area_key": "D066:animal-welfare-behaviour-and-clinical-nutrition", "required_task_phrases": ("study, observe, assess and understand animal behaviour", "problematic behaviours"),
        "rationale": "The sourced work assesses animal behaviour and develops suitable environments/management to prevent or address problematic behaviour. This directly matches animal welfare and behaviour, not farm production merely because the role may work with animals.",
        "source_ids": ["RCVS_RECOGNISED_SPECIALTIES", "WOAH_CORE_CURRICULUM", "WOAH_ANIMAL_WELFARE_EDUCATION"],
    },
    key("D069", "air traffic safety technician"): {
        "area_key": "D069:air-traffic-management-and-air-navigation", "required_task_phrases": ("air traffic control and navigation systems", "operate these systems"),
        "rationale": "The sourced tasks install, maintain and operate air-traffic-control and navigation systems in airports and aircraft. This matches air-traffic management/navigation systems; safety is the purpose but not a separate safety-management role task.",
        "source_ids": ["ICAO_ATM_PANELS", "EASA_AVIATION_RULE_AREAS", "ICAO_OPERATIONAL_SAFETY"],
    },
    key("D069", "flight operations officer"): {
        "area_key": "D069:flight-operations-and-aircrew", "required_task_phrases": ("compile flight information", "aircraft dispatch data", "amount of fuel needed for flight"),
        "rationale": "The sourced tasks compile dispatch/flight information, fuel requirements, schedules and aircraft operating limits to support safe flight planning. This is flight-operations/dispatch work, not passenger/cargo/airport ground handling.",
        "source_ids": ["ICAO_OPERATIONAL_SAFETY", "ICAO_FLIGHT_OPERATIONS", "EASA_AVIATION_RULE_AREAS"],
    },
    key("D067", "oral and maxillofacial surgeons"): {
        "area_key": "D067:oral-maxillofacial-surgery", "required_task_phrases": ("surgery and related procedures", "oral and maxillofacial regions"),
        "rationale": "The sourced tasks surgically manage diseases, injuries and defects of oral/maxillofacial tissues. This exactly matches oral/maxillofacial surgery; the lexical Endodontics match is incidental dental vocabulary and is rejected.",
        "source_ids": ["FDI_SPECIALIZATION_POLICY_2025", "ADA_RECOGNIZED_DENTAL_SPECIALTIES"],
    },
    key("D088", "aesthetician"): {
        "area_key": "D088:facial-skincare-and-nonmedical-aesthetics", "required_task_phrases": ("skin care treatments", "facial treatments"),
        "rationale": "The sourced core tasks assess skin and provide facial skincare/cosmetic treatments. Occasional neck massage or body wraps do not make massage the role's primary area; the face/skin boundary is the best-supported route.",
        "source_ids": ["WORLDSKILLS_BEAUTY_THERAPY_WS2024", "CIDESCO_INTERNATIONAL_QUALIFICATION_PORTFOLIO", "UK_NOS_FACIAL_SKINCARE_SKABBR2"],
    },
    key("D090", "pet sitter"): {
        "area_key": "D090:companion-animal-care-boarding-and-shelter-services", "required_task_phrases": ("dog walking", "home-boarding", "pet/home sitting"),
        "rationale": "The sourced work provides home pet sitting, dog walking, boarding and routine non-clinical welfare monitoring. This matches companion-animal care/boarding, not coat grooming despite incidental safe-handling vocabulary.",
        "source_ids": ["GFAS_SANCTUARY_CARE_STANDARDS", "AKC_NATIONAL_DOG_GROOMING_EDUCATIONAL_STANDARDS"],
    },
    key("D097", "riveter"): {
        "area_key": "D097:metal-fabrication-and-structural-assembly", "required_task_phrases": ("assemble several metal parts together by riveting", "inserting rivets"),
        "rationale": "The sourced task mechanically fastens metal components with rivets/bolts as part of assembly. The current fabrication/structural-assembly boundary expressly includes fitting and assembling metal products with appropriate joining methods; welding is not inferred.",
        "source_ids": ["WORLDSKILLS_WELDING_WS_OS_2024", "IIW_ISO3834_WELDING_FABRICATION_QUALITY"],
    },
    key("D097", "blacksmith"): {
        "area_key": "D097:forging-and-blacksmithing", "required_task_phrases": ("heat metal", "shape it with a hammer", "forge"),
        "rationale": "The sourced work heats and hand-shapes metal in a forge to produce artisanal/ornamental items and horseshoes. This is forging/blacksmithing, not general structural fabrication.",
        "source_ids": ["SKILLS_ENGLAND_BLACKSMITH_ST0378", "AUSTRIA_BLACKSMITH_FORGING_APPRENTICESHIP", "ONTARIO_BLACKSMITH_TRADE_STANDARD"],
    },
    key("D093", "cable jointer"): {
        "area_key": "D093:electrical-power-networks-and-distribution", "required_task_phrases": ("power supply and control cables", "connecting customers to the electricity network"),
        "rationale": "The sourced tasks construct and repair power/control cables in underground routes and connect customers to the electricity network. This is distribution-network infrastructure, not building/commercial wiring installation.",
        "source_ids": ["CIGRE_TRANSMISSION_DISTRIBUTION_GLOBAL_STUDY_COMMITTEES", "SKILLS_ENGLAND_ELECTRICAL_POWER_NETWORK_ENGINEER_ST0475", "SKILLS_ENGLAND_POWER_DISTRIBUTION_CABLE_JOINTER_ST1332"],
    },
    key("D019", "solar energy technician"): {
        "area_key": "D019:solar-energy-systems", "required_task_phrases": ("install solar panels", "inverter", "solar energy systems"),
        "rationale": "The sourced tasks install and maintain solar panels and connect photovoltaic systems through inverters to the electricity network. The solar-systems area is the matching technology practice; the route is based on the tasks, not the technician title.",
        "source_ids": ["IEA_RENEWABLE_ENERGY_TECHNOLOGY_FAMILIES", "IRENA_RENEWABLE_POWER_COSTS_2024_TECHNOLOGY_SCOPE"],
    },
    key("D020", "environmental health inspector"): {
        "area_key": "D020:environmental-health-and-exposure-control", "required_task_phrases": ("environmental and public health legislation", "environmental complaints"),
        "rationale": "The sourced tasks investigate environmental/public-health compliance and environmental complaints. Those are exposure and environmental-health control functions, not air-quality engineering or waste remediation.",
        "source_ids": ["ABET_ENVIRONMENTAL_ENGINEERING_CRITERIA_2026_2027", "AAEES_ENVIRONMENTAL_ENGINEERING_SPECIALTY_CERTIFICATION", "ASCE_ENVIRONMENTAL_ENGINEERING_TECHNICAL_TOPICS"],
    },
    key("D020", "solid waste operator"): {
        "area_key": "D020:solid-waste-and-resource-recovery", "required_task_phrases": ("solid waste treatment", "collection and disposal of solid waste"),
        "rationale": "The sourced tasks operate waste-treatment equipment and support collection/disposal of solid waste. These duties fit the solid-waste treatment/recovery area, not hazardous-site remediation.",
        "source_ids": ["ABET_ENVIRONMENTAL_ENGINEERING_CRITERIA_2026_2027", "AAEES_ENVIRONMENTAL_ENGINEERING_SPECIALTY_CERTIFICATION", "AAEES_ENVIRONMENTAL_ENGINEERING_BODY_OF_KNOWLEDGE_SPECIALTIES"],
    },
    key("D020", "wastewater engineer"): {
        "area_key": "D020:water-wastewater-and-stormwater-systems", "required_task_phrases": ("design sewage systems and networks", "treatment of wastewater"),
        "rationale": "The sourced work designs sewage collection and wastewater treatment systems. This directly matches the water/wastewater systems boundary and is distinct from environmental exposure monitoring.",
        "source_ids": ["ABET_ENVIRONMENTAL_ENGINEERING_CRITERIA_2026_2027", "AAEES_ENVIRONMENTAL_ENGINEERING_SPECIALTY_CERTIFICATION", "ASCE_ENVIRONMENTAL_ENGINEERING_TECHNICAL_TOPICS"],
    },
    key("D020", "wastewater treatment operator"): {
        "area_key": "D020:water-wastewater-and-stormwater-systems", "required_task_phrases": ("water or wastewater plant", "process wastewater to remove harmful substances"),
        "rationale": "The sourced duties operate water/wastewater treatment equipment, clean drinking water and treat wastewater before discharge. These are the operational component of the water/wastewater systems area.",
        "source_ids": ["ABET_ENVIRONMENTAL_ENGINEERING_CRITERIA_2026_2027", "AAEES_ENVIRONMENTAL_ENGINEERING_SPECIALTY_CERTIFICATION", "AAEES_ENVIRONMENTAL_ENGINEERING_BODY_OF_KNOWLEDGE_SPECIALTIES"],
    },
    key("D022", "mine geologist"): {
        "area_key": "D022:geoscience-and-mineral-resource-exploration", "required_task_phrases": ("locate, identify, quantify and classify mineral resources",),
        "rationale": "The sourced tasks locate, characterize and classify mineral resources and advise mine engineers. That is geoscience/mineral-resource evaluation, not mine construction or operations.",
        "source_ids": ["SEG_GLOBAL_ECONOMIC_GEOLOGY_SCOPE"],
    },
    key("D022", "mineral processing engineer"): {
        "area_key": "D022:mineral-processing-and-extractive-metallurgy", "required_task_phrases": ("process and refine valuable minerals from ore",),
        "rationale": "The sourced tasks develop equipment and techniques to process/refine valuable minerals from ore. This matches mineral processing and extractive metallurgy, not exploration geoscience.",
        "source_ids": ["SME_MINERAL_METALLURGICAL_PROCESSING_DIVISION"],
    },
    key("D024", "advanced practice psychiatric nurses"): {
        "area_key": "D024:mental-health-nursing", "required_task_phrases": ("mental health or substance use disorders", "administration of psychotherapy"),
        "rationale": "The sourced nursing tasks assess, diagnose and treat mental-health/substance-use conditions and provide psychotherapy. These match mental-health nursing rather than community/population nursing.",
        "source_ids": ["NMC_UK_NURSING_FIELDS", "WHO_EMRO_NURSING_SPECIALIST_GUIDE", "ICN_GLOBAL_NURSING_DEFINITION"],
    },
    key("D025", "industrial pharmacist"): {
        "area_key": "D025:industrial-pharmacy-and-medicines-manufacturing", "required_task_phrases": ("develop new medicines", "assure quality", "complies with regulations"),
        "rationale": "The source tasks develop medicines, test and assure their quality and regulatory compliance. This is medicines manufacturing/industrial pharmacy rather than clinical or medicines-information practice.",
        "source_ids": ["D025_FIP_GLOBAL_PRACTICE_SECTIONS_2026"],
    },
    key("D026", "biostatistician"): {
        "area_key": "D026:public-health-data-biostatistics-and-evaluation", "required_task_phrases": ("statistical methods to biological and public health research", "analyse health data"),
        "rationale": "The sourced tasks apply statistical methods to biological/public-health research, study design and health-data analysis. Those are the defining biostatistics/data-evaluation duties; generic evidence translation is not the primary task.",
        "source_ids": ["D026_WHO_UNIFIED_EPHF_LIST", "D026_WHO_GLOBAL_EPHF_COMPETENCY_FRAMEWORK_2024", "D026_WHO_PUBLIC_HEALTH_INTELLIGENCE_FRAMEWORK_2025"],
    },
    key("D026", "disease surveillance officer"): {
        "area_key": "D026:epidemiology-surveillance-and-public-health-intelligence", "required_task_phrases": ("disease outbreak data", "collects, analyses, and reports"),
        "rationale": "The sourced role collects, analyzes and reports outbreak data to inform response and prevention. Its defining work is detecting and interpreting population-health threats; response is the use of its intelligence, not a basis to classify it as emergency coordination.",
        "source_ids": ["D026_WHO_UNIFIED_EPHF_LIST", "D026_WHO_GLOBAL_EPHF_COMPETENCY_FRAMEWORK_2024", "D026_WHO_PUBLIC_HEALTH_INTELLIGENCE_FRAMEWORK_2025"],
    },
    key("D026", "health economist"): {
        "area_key": "D026:public-health-policy-systems-and-leadership", "required_task_phrases": ("health care costs, financing", "resource allocation", "health policy"),
        "rationale": "The sourced tasks analyze healthcare costs, financing and resource allocation specifically to inform health policy and investment. This matches health-policy/systems financing rather than community outreach or epidemiological surveillance.",
        "source_ids": ["D026_WHO_UNIFIED_EPHF_LIST", "D026_WHO_GLOBAL_EPHF_COMPETENCY_FRAMEWORK_2024", "D026_WHO_PUBLIC_HEALTH_INTELLIGENCE_FRAMEWORK_2025"],
    },
    key("D026", "health programme officer"): {
        "area_key": "D026:health-promotion-and-disease-prevention", "required_task_phrases": ("programmes targeting disease prevention", "community health improvement"),
        "rationale": "The sourced role plans, implements and monitors public-health programs aimed at disease prevention and community-health improvement. This is a direct population-intervention fit with health promotion/prevention.",
        "source_ids": ["D026_WHO_UNIFIED_EPHF_LIST", "D026_WHO_GLOBAL_EPHF_COMPETENCY_FRAMEWORK_2024", "D026_WHO_PUBLIC_HEALTH_INTELLIGENCE_FRAMEWORK_2025"],
    },
    key("D029", "talent acquisition manager"): {
        "area_key": "D029:resourcing-and-talent-acquisition", "required_task_phrases": ("talent acquisition and recruitment processes", "interview candidates"),
        "rationale": "The sourced tasks oversee sourcing/recruitment, candidate interviews and selection processes. They match resourcing and talent acquisition, not longer-term talent development or succession.",
        "source_ids": ["D029_CIPD_PROFESSION_MAP_SPECIALIST_KNOWLEDGE"],
    },
    key("D030", "market research analyst"): {
        "area_key": "D030:market-research-and-customer-insights", "required_task_phrases": ("market research analysts collect", "potential customers", "target group"),
        "rationale": "The sourced tasks collect and interpret market-research evidence, define customer groups and assess product position. These are market-research/customer-insight duties, not product launch ownership.",
        "source_ids": ["D030_ESOMAR_MARKET_RESEARCH_INSIGHTS"],
    },
    key("D031", "sales manager"): {
        "area_key": "D031:sales-operations-and-enablement", "required_task_phrases": ("manage sales teams", "allocate sales resources", "track all leads and sales"),
        "rationale": "The sourced tasks manage sales teams, allocate sales resources, follow leads and maintain a sales-tracking platform. These match sales-process systems and enablement, not indirect channel/partner selling.",
        "source_ids": ["D031_SALES_MANAGEMENT_ASSOCIATION"],
    },
    key("D033", "chief product officer"): {
        "area_key": "D033:product-strategy-and-portfolio-direction", "required_task_phrases": ("define the product vision", "design the product roadmap", "product strategy"),
        "rationale": "The sourced tasks set product strategy and vision, prioritize customer needs and design the product roadmap. These are product-strategy/portfolio-direction duties, distinct from executing product development.",
        "source_ids": ["D033_PDMA_NPDP", "D033_PDMA_BOK"],
    },
    key("D062", "securities trader"): {
        "area_key": "D062:trading-dealing-and-market-making", "required_task_phrases": ("purchase and sell securities", "financial markets"),
        "rationale": "The sourced task explicitly executes purchases and sales of securities and monitors financial markets. This is trading/dealing work, distinct from brokerage's client-order intermediation.",
        "source_ids": ["CFA_TRADE_STRATEGY_EXECUTION_2026", "ACI_DEALING_CERTIFICATE_SYLLABUS_2024", "FIA_FUTURES_MARKET_BASICS"],
    },
    key("D062", "financial trader"): {
        "area_key": "D062:trading-dealing-and-market-making", "required_task_phrases": ("buy and sell financial products", "monitor the financial markets"),
        "rationale": "The sourced tasks buy and sell financial products and continuously monitor markets. Those are trading/dealing duties rather than brokerage or investment-research tasks.",
        "source_ids": ["CFA_TRADE_STRATEGY_EXECUTION_2026", "ACI_DEALING_CERTIFICATE_SYLLABUS_2024", "FIA_FUTURES_MARKET_BASICS"],
    },
    key("D068", "diagnostic radiographer"): {
        "area_key": "D068:medical-imaging-and-radiography", "required_task_phrases": ("perform diagnostic imaging examinations", "x-rays"),
        "rationale": "The sourced tasks plan and perform diagnostic imaging using X-rays and other modalities. This directly fits medical imaging/radiography rather than rehabilitation or laboratory diagnostics.",
        "source_ids": ["IAEA_MEDICAL_RADIATION_TECHNOLOGIST_SCOPE"],
    },
    key("D069", "aircraft maintenance technician"): {
        "area_key": "D069:aircraft-maintenance-and-continuing-airworthiness", "required_task_phrases": ("preventive maintenance to aircrafts", "aircraft components"),
        "rationale": "The sourced tasks inspect, maintain and repair aircraft, engines and components. These map to aircraft maintenance/continuing airworthiness; aviation safety is an adjacent outcome, not the task's core.",
        "source_ids": ["ICAO_AIRWORTHINESS", "ICAO_OPERATIONAL_SAFETY"],
    },
    key("D069", "aeronautical information specialist"): {
        "area_key": "D069:air-traffic-management-and-air-navigation", "required_task_phrases": ("aeronautical information management services", "aeronautical information specialists"),
        "rationale": "The sourced tasks provide aeronautical information management services supporting air navigation. This fits air-traffic management/navigation information infrastructure, not aviation safety inspection or remote-pilot operations.",
        "source_ids": ["ICAO_ATM_PANELS", "EASA_AVIATION_RULE_AREAS", "ICAO_OPERATIONAL_SAFETY"],
    },
    key("D078", "political scientist"): {
        "area_key": "D078:politics-governance-public-policy", "required_task_phrases": ("study political behaviour, activity and systems",),
        "rationale": "The sourced role studies political behavior, institutions and systems. That is within politics/governance/public policy, not psychology or computational/digital social science by default.",
        "source_ids": ["UNESCO_ISCED_SOCIAL_SCIENCES", "UNESCO_ISCED_FIELD_DESCRIPTIONS"],
    },
    key("D082", "customer service representative"): {
        "area_key": "D082:customer-contact-service-resolution", "required_task_phrases": ("handle complaints", "customers", "customer satisfaction"),
        "rationale": "The sourced work handles customer complaints and service issues and maintains customer goodwill/satisfaction. This matches customer-contact/service resolution rather than managing contact-centre systems and workforce quality.",
        "source_ids": ["ISO_18295_CONTACT_CENTRES", "ISO_10002_COMPLAINTS"],
    },
    key("D086", "bookmaker"): {
        "area_key": "D086:betting-and-wagering-operations", "required_task_phrases": ("take bets on sports games", "calculate odds and pay out winnings"),
        "rationale": "The sourced role accepts wagers, calculates odds and settles winnings for sporting/other events. This is betting/wagering operations, not lottery or table-game operations.",
        "source_ids": ["WLA_SECURITY_CONTROL_STANDARD_2024", "GLI_GLOBAL_GAMING_STANDARDS_CATALOGUE"],
    },
    key("D086", "gaming dealer"): {
        "area_key": "D086:casino-and-venue-gaming-operations", "required_task_phrases": ("operate table games", "dispensing the appropriate number of cards"),
        "rationale": "The sourced tasks operate in-person table games and handle game materials/player play. This matches casino/venue gaming operations, not lottery or gaming-product design.",
        "source_ids": ["GLI_GLOBAL_GAMING_STANDARDS_CATALOGUE", "WLA_SECURITY_CONTROL_STANDARD_2024"],
    },
    key("D090", "animal groomer"): {
        "area_key": "D090:animal-grooming-and-coat-care", "required_task_phrases": ("grooming a range of animals", "safe handling techniques"),
        "rationale": "The sourced tasks groom animal coats using appropriate equipment and safe handling. This directly fits animal grooming/coat care, not animal training or clinical veterinary work.",
        "source_ids": ["AKC_NATIONAL_DOG_GROOMING_EDUCATIONAL_STANDARDS"],
    },
    key("D091", "motorcycle instructor"): {
        "area_key": "D091:motorcycle-and-moped-rider-instruction", "required_task_phrases": ("practice of how to operate a motorcycle safely", "skills needed to ride"),
        "rationale": "The sourced tasks teach motorcycle-specific riding theory, safe operation and practical rider skills. This fits motorcycle/moped instruction, not heavy-goods or bus/coach training.",
        "source_ids": ["DVSA_NATIONAL_DRIVER_RIDER_TRAINING_STANDARD", "UNECE_1968_ROAD_TRAFFIC_VEHICLE_CATEGORIES"],
    },
    key("D097", "welder"): {
        "area_key": "D097:welding-and-joining", "required_task_phrases": ("operate welding equipment", "join metal workpieces together"),
        "rationale": "The sourced tasks use welding processes to join metal workpieces. This directly matches welding/joining, distinct from forging or general fabrication/assembly.",
        "source_ids": ["WORLDSKILLS_WELDING_WS_OS_2024", "IIW_INTERNATIONAL_WELDING_PERSONNEL_QUALIFICATIONS"],
    },
    key("D097", "spot welder"): {
        "area_key": "D097:welding-and-joining", "required_task_phrases": ("spot welding machines", "press and join metal workpieces together"),
        "rationale": "The sourced task operates spot-welding machines that join metal workpieces by resistance welding. This is a direct welding/joining fit, not blacksmithing or broad metal assembly.",
        "source_ids": ["WORLDSKILLS_WELDING_WS_OS_2024", "IIW_INTERNATIONAL_WELDING_PERSONNEL_QUALIFICATIONS"],
    },
    key("D110", "rubber products machine operator"): {
        "area_key": "D110:rubber-and-plastics-processing", "required_task_phrases": ("mould, extrude and cure rubber products",),
        "rationale": "The sourced tasks operate processes that compound, mould, extrude and cure rubber into products. This matches rubber/polymer processing, not chemical-process plant operations generally.",
        "source_ids": ["ILO_ISCO08_CHEMICAL_RUBBER_PLASTICS_OPERATORS", "AUSTRALIA_PMB07_POLYMER_PROCESSING"],
    },
    key("D084", "bookkeeping accounting and auditing clerks"): {
        "area_key": "D084:bookkeeping-financial-recordkeeping", "required_task_phrases": ("record numerical data to keep financial records complete", "verifying duties"),
        "rationale": "The sourced tasks compute, classify and record routine financial data and verify records. They match bookkeeping/financial recordkeeping rather than payroll administration.",
        "source_ids": ["AAT_BOOKKEEPING_FRAMEWORK"],
    },
    key("D084", "payroll and timekeeping clerks"): {
        "area_key": "D084:payroll-benefits-administration", "required_task_phrases": ("record employee time and payroll data", "compute and post wages"),
        "rationale": "The sourced tasks compile employee time/payroll data and calculate wages/deductions. These are payroll/benefits administration duties, distinct from general bookkeeping.",
        "source_ids": ["CIPP_PAYROLL_COMPETENCY"],
    },
    key("D070", "lighting technician"): {
        "area_key": "D070:live-performance-production-and-technical-theatre", "required_task_phrases": ("lighting systems that support the creative and safe delivery of a performance",),
        "rationale": "The sourced task installs, operates and maintains lighting systems specifically for live-performance delivery. This matches live-production/technical-theatre practice, not unrelated performance disciplines.",
        "source_ids": ["OISTAT_INTERNATIONAL_TECHNICAL_THEATRE", "UNESCO_FCS_2025"],
    },
    key("D004", "chief ict security officer"): {
        "area_key": "D004:cybersecurity-governance-risk-and-assurance",
        "required_task_phrases": ("define the information system security policy", "manage security deployment"),
        "rationale": "The sourced tasks explicitly assign security-policy definition and organization-wide security deployment oversight. Those responsibilities match the current governance/risk/assurance boundary; the role is not routed here from its executive title.",
        "source_ids": ["ISC2_CISSP_EXAM_OUTLINE_CURRENT", "NIST_NICE_SP800_181_OVERVIEW", "ENISA_ECSF_ROLE_PROFILES"],
    },
    key("D004", "cyber incident responder"): {
        "area_key": "D004:security-operations-and-incident-response",
        "required_task_phrases": ("incident response plan", "mitigating the impact of cybersecurity incidents"),
        "rationale": "The sourced tasks monitor incident conditions, identify root causes and malicious actors, mitigate incidents, and restore systems under an incident-response plan. This matches the security-operations/incident-response boundary directly.",
        "source_ids": ["ISC2_CISSP_EXAM_OUTLINE_CURRENT", "NIST_NICE_SP800_181_OVERVIEW", "ENISA_ECSF_ROLE_PROFILES"],
    },
    key("D004", "digital forensics analysts"): {
        "area_key": "D004:digital-forensics-and-cyber-investigation",
        "required_task_phrases": ("analyze digital evidence", "preserve and present computer-related evidence"),
        "rationale": "The task description explicitly investigates computer-based incidents and requires preservation, analysis and presentation of digital/computer-related evidence. This matches digital-forensics and cyber-investigation, not merely general security operations.",
        "source_ids": ["ISC2_CISSP_EXAM_OUTLINE_CURRENT", "NIST_NICE_SP800_181_OVERVIEW", "ENISA_ECSF_ROLE_PROFILES"],
    },
    key("D004", "digital forensics expert"): {
        "area_key": "D004:digital-forensics-and-cyber-investigation",
        "required_task_phrases": ("digital forensics experts retrieve", "in a forensic manner"),
        "rationale": "The sourced task is explicitly forensic retrieval, preservation, recovery, analysis and presentation of digital-media evidence. The route follows these tasks and the current cyber-investigation boundary, not the role title alone.",
        "source_ids": ["ISC2_CISSP_EXAM_OUTLINE_CURRENT", "NIST_NICE_SP800_181_OVERVIEW", "ENISA_ECSF_ROLE_PROFILES"],
    },
    key("D005", "cloud devops engineer"): {
        "area_key": "D005:devops-and-software-delivery",
        "required_task_phrases": ("continuous software delivery systems", "automated testing", "deployment mechanisms"),
        "rationale": "The sourced task explicitly builds and manages continuous software-delivery systems, repositories, automated tests and deployment mechanisms. These are the defining practices of the DevOps/software-delivery area; the separate cloud context does not override the task fit.",
        "source_ids": ["NIST_SP500_292_CLOUD_RA", "CNCF_PLATFORM_WHITEPAPER_2023", "CNCF_PLATFORM_ENGINEERING_MATURITY_MODEL", "GOOGLE_SRE_OVERVIEW"],
    },
    key("D006", "edge computing engineer"): {
        "area_key": "D006:iot-edge-computing-systems",
        "required_task_phrases": ("edge computing infrastructure", "processes iot data closer to the source"),
        "rationale": "The sourced task specifically builds edge-computing infrastructure that processes IoT data near its source for low-latency use. This matches the edge-computing boundary, rather than general IoT integration.",
        "source_ids": ["ISO_IEC_30141_2024_IOT_RA", "NIST_SP800_183_NETWORKS_OF_THINGS", "ETSI_IOT_EDGE_WHITEPAPER_2023"],
    },
    key("D006", "embedded systems software developer"): {
        "area_key": "D006:embedded-systems-and-firmware-engineering",
        "required_task_phrases": ("software to be run on an embedded system",),
        "rationale": "The sourced task is to program, implement, document and maintain software specifically for embedded systems. This directly matches the embedded-software/firmware boundary and is distinct from whole-IoT-system integration.",
        "source_ids": ["ISO_IEC_30141_2024_IOT_RA", "NIST_SP800_183_NETWORKS_OF_THINGS", "ARM_EMBEDDED_MDK_GUIDE"],
    },
    key("D009", "data engineer"): {
        "area_key": "D009:data-engineering-and-governance",
        "required_task_phrases": ("maintain data pipelines and warehouses", "process, manage, and store large amounts of data"),
        "rationale": "The source tasks explicitly design infrastructure to process/manage/store data and maintain data pipelines and warehouses. These duties match data engineering and governance; downstream analysis by data scientists is context, not the role's primary route.",
        "source_ids": ["ACM_DSTF_FINAL_REPORT", "ACM_DSTF_BODY_OF_KNOWLEDGE_DRAFT2", "NIST_BIG_DATA_INTEROPERABILITY_FRAMEWORK_V1"],
    },
    key("D015", "accounting analyst"): {
        "area_key": "D015:financial-accounting-and-reporting",
        "required_task_phrases": ("evaluate the financial statements", "statement of cash flows"),
        "rationale": "The sourced role tasks evaluate company financial statements, including income, balance-sheet and cash-flow statements, and implement accounting procedures. That is financial accounting/reporting work; it does not establish a forensic-investigation assignment.",
        "source_ids": ["ACCA_ACCOUNTANCY_CAREER_SECTORS_ROLES", "IAASB_INTERNATIONAL_AUDIT_ASSURANCE_STANDARDS", "IFAC_IPSASB_PUBLIC_SECTOR_REPORTING_FRAMEWORK"],
    },
    key("D015", "audit supervisor"): {
        "area_key": "D015:audit-and-assurance",
        "required_task_phrases": ("oversee audit staff", "automated audit work papers", "communicate findings"),
        "rationale": "The sourced tasks plan and oversee audit staff, review audit workpapers for methodology compliance and communicate findings. These are direct audit-and-assurance duties, rather than general financial reporting.",
        "source_ids": ["ACCA_ACCOUNTANCY_CAREER_SECTORS_ROLES", "IAASB_INTERNATIONAL_AUDIT_ASSURANCE_STANDARDS", "ACCA_ACCOUNTANCY_SPECIALIST_PRACTICE"],
    },
    key("D015", "accountant"): {
        "area_key": "D015:financial-accounting-and-reporting",
        "required_task_phrases": ("analyse financial statements", "financial reports"),
        "rationale": "The sourced task centers on reviewing and analyzing financial statements and reports. The role also mentions adjacent audit/advisory duties, but the selected area is the core accounting/reporting work and is not inferred from the occupation name.",
        "source_ids": ["ACCA_ACCOUNTANCY_CAREER_SECTORS_ROLES", "IAASB_INTERNATIONAL_AUDIT_ASSURANCE_STANDARDS", "IFAC_IPSASB_PUBLIC_SECTOR_REPORTING_FRAMEWORK"],
    },
    key("D059", "Aerospace Engineering and Operations Technologists and Technicians"): {
        "area_key": "D059:ground-systems-space-communications-and-mission-operations",
        "required_task_phrases": ("consoles", "launch", "track", "space vehicles"),
        "rationale": (
            "Role-task/area-boundary reconciliation: the sourced task is to operate, install, adjust and maintain computer/communications systems, consoles, simulators and data-acquisition/test equipment used to launch, track, position and evaluate air and space vehicles. For the space-vehicle assignment, those are ground/mission operations systems, matching the catalog boundary for ground communications, telemetry/command/data systems and mission operations; they are not spacecraft/payload design tasks. Parent-domain support is independently recorded. This route is limited to the space-vehicle assignment described by the task evidence."
        ),
        "source_ids": ["NASA_GROUND_DATA_MISSION_OPERATIONS", "ESA_EARTH_OBSERVATION_SYSTEMS_DESIGN_TRAINING"],
    },
}


def source_record_urls(decision: dict[str, Any]) -> list[str]:
    refs = decision.get("source_refs") or decision.get("source_urls") or []
    citations = decision.get("citations") or []
    urls = [str(x) for x in refs if isinstance(x, str) and x.startswith(("http://", "https://"))]
    urls.extend(str(c.get("url")) for c in citations if isinstance(c, dict) and str(c.get("url", "")).startswith(("http://", "https://")))
    return list(dict.fromkeys(urls))


def get_area_decision(row: dict[str, Any], lane: str) -> tuple[dict[str, Any], dict[str, Any]]:
    if lane == "D057_D112":
        return row.get("decision") or {}, row.get("parent_domain_fit") or {}
    return row.get("area_fit") or {}, row.get("parent_domain_fit") or {}


def load_inputs() -> tuple[dict[str, Any], dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
    catalog = read_json(CATALOG)
    areas: dict[str, set[str]] = {}
    area_records: dict[str, dict[str, dict[str, Any]]] = {}
    for domain in catalog.get("domains", []):
        did = str(domain.get("domain_id", ""))
        areas[did] = {str(a.get("area_key")) for a in domain.get("areas", []) if a.get("area_key")}
        area_records[did] = {str(a.get("area_key")): a for a in domain.get("areas", []) if a.get("area_key")}
    role_data = {name: read_json(path) for name, path in ROLE_FILES.items()}
    role_indexes: dict[str, list[dict[str, Any]]] = {}
    for name, data in role_data.items():
        rows = data if isinstance(data, list) else data.get("roles", [])
        role_indexes[name] = rows
    canonical_by_key: dict[str, list[dict[str, Any]]] = {}
    for rows in role_indexes.values():
        for role in rows:
            rk = key(str(role.get("domain_id", "")), role.get("role_name") or role.get("role_title") or "")
            canonical_by_key.setdefault(rk, []).append(role)
    entries: list[dict[str, Any]] = []
    for lane_dir, filename, row_key in LANES:
        payload = read_json(HERE / lane_dir / filename)
        lane_name = payload.get("lane", lane_dir.replace("_", "-"))
        for row in payload.get(row_key, []):
            domain_id = str(row.get("domain_id", ""))
            role_title = row.get("role_title") or row.get("role_name") or ""
            area_decision, parent = get_area_decision(row, lane_dir)
            area_decision = dict(area_decision)
            status = str(area_decision.get("status", "review_required"))
            decision_kind = None
            area_key = area_decision.get("area_key") or area_decision.get("selected_area_key")
            decision_origin = "current_lane_decision"
            explicit_task_area_rule = False
            # Revalidate earlier explicit human decisions only when the current
            # task-based ranking independently selects the same current catalog
            # area, the parent is supported, and both evidence layers are linked.
            prior = row.get("prior_explicit_disposition_validation") or {}
            candidates = row.get("recommended_area_candidates") or []
            if (lane_dir == "D057_D112" and status == "review_required"
                    and prior.get("original_status") == "supported"
                    and parent.get("status") == "supported"):
                prior_key = prior.get("original_area_key")
                top_key = candidates[0].get("area_key") if candidates else None
                same_candidate = next((c for c in candidates if c.get("area_key") == prior_key), None)
                task_source_urls = ((row.get("role_task_source") or {}).get("source_urls") or []
                                    or source_record_urls(parent) or source_record_urls(area_decision))
                if (prior_key and top_key == prior_key and same_candidate
                        and prior.get("original_rationale")
                        and any(str(u).startswith(("http://", "https://")) for u in task_source_urls)
                        and not same_candidate.get("explicit_parent_area_scope_conflicts")):
                    area_decision.update({
                        "status": "supported_prior_explicit_decision_revalidated",
                        "area_key": prior_key,
                        "reason": prior["original_rationale"],
                        "area_source_ids": same_candidate.get("area_source_ids") or [],
                        "area_source_urls": same_candidate.get("area_source_urls") or [],
                        "area_evidence_locators": same_candidate.get("area_source_records") or [],
                    })
                    status = area_decision["status"]
                    area_key = prior_key
                    decision_kind = "area"
                    decision_origin = "prior_explicit_route_revalidated_against_current_task_and_catalog"
            task_text_for_rule = str(row.get("exact_role_task_evidence") or row.get("role_task_evidence") or "").casefold()
            task_rule = TASK_AREA_RULES.get(key(domain_id, role_title))
            if (task_rule and parent.get("status") == "supported"
                    and all(phrase in task_text_for_rule for phrase in task_rule["required_task_phrases"])):
                rule_area = area_records.get(domain_id, {}).get(task_rule["area_key"])
                task_source_urls = ((row.get("role_task_source") or {}).get("source_urls") or []
                                    or source_record_urls(parent) or source_record_urls(area_decision))
                required_area_sources = set(task_rule.get("source_ids") or [])
                actual_area_sources = set(rule_area.get("source_ids") or []) if rule_area else set()
                if (rule_area and required_area_sources.issubset(actual_area_sources)
                        and (rule_area.get("source_ids") or rule_area.get("evidence")) and task_source_urls):
                    area_decision.update({
                        "status": "supported_manual_task_area_review",
                        "selected_area_key": task_rule["area_key"],
                        "area_key": task_rule["area_key"],
                        "reason": task_rule["rationale"],
                        "rationale": task_rule["rationale"],
                        "area_boundary_source_ids": rule_area.get("source_ids") or [],
                        "area_boundary_citations": rule_area.get("evidence") or [],
                        "source_refs": task_source_urls,
                    })
                    status = area_decision["status"]
                    area_key = task_rule["area_key"]
                    decision_kind = "area"
                    decision_origin = "guarded_task_phrase_and_independent_parent_area_source_rule"
                    explicit_task_area_rule = True
            if lane_dir == "D001_D056" and status == "supported_manual_task_and_area_evidence":
                decision_kind = "area"
            elif lane_dir == "D057_D112" and status == "supported_manual_task_area_review" and explicit_task_area_rule:
                decision_kind = "area"
            elif lane_dir == "D057_D112" and status == "supported" and area_decision.get("automatic_acceptance_rule_passed") is True:
                decision_kind = "area"
            elif lane_dir == "D113_D168" and status == "direct_domain_to_role":
                decision_kind = "direct"
            # Parent-domain fit is a mandatory gate, even when area evidence is strong.
            parent_status = str(parent.get("status", "review_required"))
            rationale = str(area_decision.get("rationale") or area_decision.get("reason") or "").strip()
            task = str(row.get("exact_role_task_evidence") or row.get("role_task_evidence") or "").strip()
            refs = source_record_urls(area_decision)
            boundary_citations = (area_decision.get("area_boundary_citations") or area_decision.get("area_source_records")
                                  or area_decision.get("area_evidence_locators") or [])
            boundary_ids = area_decision.get("area_boundary_source_ids") or area_decision.get("area_source_ids") or []
            area_evidence_ok = bool(boundary_ids or boundary_citations)
            task_source = row.get("role_task_source") or {}
            task_refs = (task_source.get("source_urls") or []) if isinstance(task_source, dict) else []
            canonical_rows = canonical_by_key.get(key(domain_id, role_title), [])
            canonical_task_refs = [ref for canonical in canonical_rows
                                   for ref in (canonical.get("domain_fit_review_source_refs") or [])]
            parent_task_refs = source_record_urls(parent)
            task_evidence_ok = bool(task and (refs or task_refs or canonical_task_refs or area_decision.get("task_evidence_citations")))
            gate_reason = None
            if decision_kind and parent_status != "supported":
                gate_reason = f"Parent domain fit is {parent_status}; route not applied until parent-domain fit is supported."
                decision_kind = None
            if decision_kind == "area":
                if not area_key or area_key not in areas.get(domain_id, set()):
                    gate_reason = "Selected area key does not resolve to a current area in the same domain."
                    decision_kind = None
                elif not task or not rationale:
                    gate_reason = "Role task text or specific role-to-area rationale is missing."
                    decision_kind = None
                elif not area_evidence_ok:
                    gate_reason = "Selected area lacks area-boundary source evidence in the lane decision."
                    decision_kind = None
                elif not task_evidence_ok:
                    gate_reason = "Role task has no linked task-source evidence in the lane decision."
                    decision_kind = None
            if decision_kind == "direct":
                if domain_id not in NO_AREA_DOMAIN_IDS or areas.get(domain_id):
                    gate_reason = "Direct route is allowed only for a domain with a reconciled explicit no-area decision."
                    decision_kind = None
                elif not task or not rationale or not (parent.get("citations") or parent.get("source_ids") or parent.get("source_refs") or task_refs):
                    gate_reason = "Direct route lacks role-task/domain evidence or an explicit direct-route rationale."
                    decision_kind = None

            source_files = row.get("source_files") or row.get("duplicate_exact_key_source_files") or []
            source_file = row.get("role_source_file") or row.get("source_file")
            targets = []
            for source in list(source_files) + ([source_file] if source_file else []):
                basename = Path(str(source).replace("\\", "/")).name
                if basename in ROLE_FILES and basename not in targets:
                    targets.append(basename)
            if not targets:
                targets = ["role_library_v3_cleaned.json"]
            candidate_rows = (row.get("recommended_area_candidates") or
                              area_decision.get("task_only_ranked_area_candidates") or [])
            normalized_candidates: list[dict[str, Any]] = []
            seen_candidate_keys: set[str] = set()
            for candidate in candidate_rows:
                ckey = str(candidate.get("area_key") or "")
                # D001/D113 candidate inventories may have no key; resolve by exact
                # domain-local label only, never by ISCO or subgroup membership.
                base = area_records.get(domain_id, {}).get(ckey)
                if not base and candidate.get("label"):
                    base = next((a for a in area_records.get(domain_id, {}).values()
                                 if str(a.get("label", "")).casefold() == str(candidate["label"]).casefold()), None)
                    ckey = str((base or {}).get("area_key") or "")
                if not base and ckey:
                    base = area_records.get(domain_id, {}).get(ckey)
                if not base and lane_dir == "D113_D168":
                    # This lane did not rank area candidates; expose current same-domain
                    # catalog boundaries to make its source-gap queue actionable.
                    continue
                if not base or ckey in seen_candidate_keys:
                    continue
                seen_candidate_keys.add(ckey)
                ev = base.get("evidence") or candidate.get("area_source_records") or candidate.get("area_evidence_locators") or []
                normalized_candidates.append({
                    "area_key": ckey, "label": base.get("label") or candidate.get("label"),
                    "boundary": base.get("boundary") or candidate.get("boundary"),
                    "rank_score": candidate.get("score"),
                    "matched_task_boundary_phrases": candidate.get("matched_task_boundary_phrases") or candidate.get("phrase_hits") or [],
                    "area_source_ids": base.get("source_ids") or candidate.get("area_source_ids") or candidate.get("source_ids") or [],
                    "area_source_urls": base.get("source_urls") or candidate.get("area_source_urls") or candidate.get("source_urls") or [],
                    "area_source_evidence": ev,
                })
            if not normalized_candidates:
                normalized_candidates = [{
                    "area_key": akey, "label": arec.get("label"), "boundary": arec.get("boundary"),
                    "rank_score": None, "matched_task_boundary_phrases": [],
                    "area_source_ids": arec.get("source_ids") or [],
                    "area_source_urls": arec.get("source_urls") or [],
                    "area_source_evidence": arec.get("evidence") or [],
                } for akey, arec in area_records.get(domain_id, {}).items()]
            if lane_dir == "D113_D168" and area_records.get(domain_id):
                # D113–D168 did not score alternatives; list every current area so the
                # user can add role-specific evidence against the complete local set.
                normalized_candidates = [{
                    "area_key": akey, "label": arec.get("label"), "boundary": arec.get("boundary"),
                    "rank_score": None, "matched_task_boundary_phrases": [],
                    "area_source_ids": arec.get("source_ids") or [],
                    "area_source_urls": arec.get("source_urls") or [],
                    "area_source_evidence": arec.get("evidence") or [],
                } for akey, arec in area_records[domain_id].items()]
            if entry_reason := gate_reason or _residual_reason(row, area_decision, parent):
                candidate_has_sources = any(
                    c.get("area_source_urls") or c.get("area_source_ids") or c.get("area_source_evidence")
                    for c in normalized_candidates
                )
                if parent_status != "supported":
                    gap_code = "parent_domain_fit"
                    targeted_gap = (
                        "Resolve the independent role-to-domain fit first: supply an authoritative source describing the role's actual tasks and the work setting/sector that determines whether this domain applies. "
                        "Do not use title, ISCO/ESCO membership, or subgroup membership as a substitute."
                    )
                elif not task or not (task_refs or canonical_task_refs or refs or parent_task_refs):
                    gap_code = "role_task_source"
                    targeted_gap = (
                        "Add an authoritative occupational/industry task source for this exact role (with a page/section locator); the current task text is not independently source-linked enough to compare against areas."
                    )
                elif not normalized_candidates or not candidate_has_sources:
                    gap_code = "area_boundary_source"
                    targeted_gap = (
                        "Add an authoritative professional/technical source that defines the candidate area's scope and boundaries, then compare the sourced role tasks to it."
                    )
                else:
                    gap_code = "role_to_area_fit"
                    targeted_gap = (
                        "The role-task and area-boundary sources are present, but they do not establish a unique fit. Add a role-specific task/assignment locator or authoritative practice standard that distinguishes the listed candidate areas; otherwise retain unresolved."
                    )
                # This known case is a taxonomy gap, not a request for more
                # evidence about whether astronauts perform crewed spaceflight.
                if key(domain_id, role_title) == key("D059", "astronaut"):
                    gap_code = "area_catalog_scope_gap"
                    targeted_gap = (
                        "The checked-in NASA/ESA task evidence describes crewed spacecraft operations, but D059's current catalog areas cover spacecraft/payload engineering and ground/mission systems—not a distinct human-spaceflight/crew-operations practice area. Do not force an engineering route or use a direct route while D059 has areas. The area catalog is out of scope for this lane; add/reconcile that area in a separately authorized taxonomy pass, or leave this role unresolved."
                    )
            else:
                gap_code = None
                targeted_gap = "No additional source gap is recorded."
            entries.append({
                "role_key": key(domain_id, role_title), "domain_id": domain_id,
                "role_title": role_title, "lane": lane_name,
                "status": status, "parent_status": parent_status,
                "decision_origin": decision_origin,
                "route_kind": decision_kind, "area_key": area_key if decision_kind == "area" else None,
                "area_slug": str(area_key).split(":", 1)[1] if decision_kind == "area" and area_key else None,
                "rationale": rationale, "role_task": task,
                "task_source_refs": list(dict.fromkeys(refs + parent_task_refs + [str(u) for u in task_refs] + [str(u) for u in canonical_task_refs])),
                "area_source_refs": list(dict.fromkeys(
                    [str(c.get("url")) for c in boundary_citations if isinstance(c, dict) and str(c.get("url", "")).startswith(("http://", "https://"))]
                    + refs)),
                "parent_citations": parent.get("citations") or [],
                "candidate_areas": normalized_candidates,
                "targeted_source_gap_code": gap_code,
                "targeted_source_gap": targeted_gap,
                "target_files": targets,
                "residual_reason": entry_reason,
            })
    return catalog, role_indexes, entries


def _residual_reason(row: dict[str, Any], area: dict[str, Any], parent: dict[str, Any]) -> str:
    if str(parent.get("status", "review_required")) != "supported":
        return "Parent domain fit remains " + str(parent.get("status", "review_required")) + ": " + str(parent.get("rationale") or "no specific parent-fit rationale recorded")
    reason = area.get("rationale") or area.get("reason")
    if reason:
        return str(reason)
    return "No source-supported role-task-to-area decision is recorded; title, ISCO/ESCO membership, and subgroup membership are insufficient."


def apply() -> dict[str, Any]:
    catalog, role_indexes, entries = load_inputs()
    unique: dict[str, dict[str, Any]] = {}
    duplicate_conflicts = []
    for entry in entries:
        rk = entry["role_key"]
        if rk in unique and (unique[rk]["route_kind"], unique[rk]["area_key"]) != (entry["route_kind"], entry["area_key"]):
            duplicate_conflicts.append({"role_key": rk, "lane_a": unique[rk], "lane_b": entry})
        unique[rk] = entry
    if duplicate_conflicts:
        raise ValueError(f"Conflicting lane dispositions for {len(duplicate_conflicts)} role keys; refusing to apply.")

    counts = Counter(e["route_kind"] or "review_required" for e in unique.values())
    changes: list[dict[str, Any]] = []
    routes: list[dict[str, Any]] = []
    residuals: list[dict[str, Any]] = []
    for entry in unique.values():
        if not entry["route_kind"]:
            residuals.append({
                "role_key": entry["role_key"], "domain_id": entry["domain_id"],
                "role_title": entry["role_title"], "lane": entry["lane"],
                "status": "review_required", "source_decision_status": entry["status"],
                "parent_status": entry["parent_status"], "role_task_evidence": entry["role_task"],
                "task_source_refs": entry["task_source_refs"], "parent_domain_evidence": entry["parent_citations"],
                "candidate_areas": entry["candidate_areas"], "targeted_source_gap_code": entry["targeted_source_gap_code"],
                "targeted_source_gap": entry["targeted_source_gap"],
                "residual_reason": entry["residual_reason"],
            })

    changed_files: dict[str, int] = Counter()
    not_found: list[str] = []
    # Stage in memory and validate file scope before any write.
    for filename, rows in role_indexes.items():
        for row in rows:
            did, title = str(row.get("domain_id", "")), row.get("role_name") or row.get("role_title") or ""
            entry = unique.get(key(did, title))
            if not entry or filename not in entry["target_files"] or not entry["route_kind"]:
                continue
            route_status = "supported" if entry["route_kind"] == "area" else "direct_domain_role"
            values = {
                "specialization_fit_status": route_status,
                "specialization_fit_candidate": entry["area_slug"] if entry["route_kind"] == "area" else None,
                "specialization_fit_area_key": entry["area_key"],
                "specialization_fit_review_basis": entry["rationale"],
                "specialization_fit_review_source_refs": entry["task_source_refs"] + [u for u in entry["area_source_refs"] if u not in entry["task_source_refs"]],
                "specialization_fit_review_date": date.today().isoformat(),
            }
            before = {f: row.get(f) for f in ROUTE_FIELDS}
            after = {**before, **values}
            route_record = {"role_key": entry["role_key"], "file": filename, "before": before,
                            "after": after, "changed_this_run": before != after,
                            "route_present_in_canonical": True,
                            "lane": entry["lane"], "parent_status": entry["parent_status"],
                            "route_kind": entry["route_kind"], "decision_origin": entry["decision_origin"],
                            "role_task": entry["role_task"]}
            routes.append(route_record)
            if before != after:
                changes.append(route_record)
                row.update(values)
                changed_files[filename] += 1
    matched = {change["role_key"] for change in changes}
    existing_match = set()
    for filename, rows in role_indexes.items():
        for row in rows:
            did, title = str(row.get("domain_id", "")), row.get("role_name") or row.get("role_title") or ""
            rk = key(did, title)
            if rk in unique and filename in unique[rk]["target_files"]:
                existing_match.add(rk)
    for entry in unique.values():
        if entry["route_kind"] and entry["role_key"] not in existing_match:
            not_found.append(entry["role_key"])
    if not_found:
        raise ValueError(f"{len(not_found)} supported role keys do not resolve to an allowed canonical role file; refusing apply: {not_found[:5]}")

    payload = {
        "schema_version": "2026-10-07.role-area-route-apply.v1",
        "status": "applied" if changes else "no_changes",
        "scope": "Role -> area-of-practice routes only. No parent-domain conditionality or domain/catalog records are edited.",
        "policy": {"isco_esco_membership_used_as_fit_evidence": False, "title_alone_used_as_fit_evidence": False,
                   "parent_domain_fit_must_be_supported": True, "direct_route_only_for_explicit_no_area_domains": sorted(NO_AREA_DOMAIN_IDS),
                   "canonical_files_with_applied_routes": sorted({r["file"] for r in routes})},
        "counts": {"lane_rows": len(entries), "unique_role_keys": len(unique), "route_dispositions": dict(counts),
                   "applied_area_routes": counts.get("area", 0), "applied_direct_domain_routes": counts.get("direct", 0),
                   "residual_review_required": len(residuals), "changed_role_records": len(changes),
                   "canonical_route_records": len(routes),
                   "canonical_route_records_by_file": dict(Counter(r["file"] for r in routes)),
                   "changed_records_by_file": dict(changed_files), "residual_reason_counts": dict(Counter(r["residual_reason"] for r in residuals))},
        "applied_routes": routes,
        "residuals": residuals,
        "integrity": {"duplicate_lane_conflicts": len(duplicate_conflicts), "supported_keys_resolved": not not_found,
                      "role_key_count_equals_3_391": len(unique) == 3391,
                      "route_fields_only": all(set(x["after"]).issubset(ROUTE_FIELDS) for x in routes)},
    }
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write guarded routes into role area-route fields.")
    args = parser.parse_args()
    payload = apply()
    if payload["counts"]["unique_role_keys"] != 3391:
        raise SystemExit(f"Expected 3,391 unique lane role keys, found {payload['counts']['unique_role_keys']}; refusing.")
    if not payload["integrity"]["route_fields_only"] or payload["integrity"]["duplicate_lane_conflicts"]:
        raise SystemExit("Integrity gate failed; refusing.")
    if args.apply:
        for name, path in ROLE_FILES.items():
            # Write only files listed as changed; staging mutations in load_inputs are in-memory only.
            if name in payload["counts"]["changed_records_by_file"]:
                data = read_json(path)
                rows = data if isinstance(data, list) else data.get("roles", [])
                index = {(str(r.get("domain_id", "")), norm(r.get("role_name") or r.get("role_title"))): r for r in rows}
                for route in payload["applied_routes"]:
                    if route["file"] != name or not route["changed_this_run"]:
                        continue
                    did, role_norm = route["role_key"].split("|", 1)
                    row = index.get((did, role_norm))
                    if row is None:
                        raise SystemExit(f"Staged row disappeared from {name}: {route['role_key']}")
                    row.update(route["after"])
                write_json(path, data)
    else:
        payload["status"] = "dry_run"
    write_json(OUT_JSON, payload)
    md = ["# Role → area-of-practice route apply — 2026-10-07", "",
          f"Status: **{payload['status']}** (run with `--apply` to write canonical route fields).", "",
          "## Counts", "",
          f"- Unique active role keys: {payload['counts']['unique_role_keys']}",
          f"- Supported area routes: {payload['counts']['applied_area_routes']}",
          f"- Evidence-supported direct Domain → Role routes: {payload['counts']['applied_direct_domain_routes']}",
          f"- Residual review-required: {payload['counts']['residual_review_required']}",
          f"- Role records that would change / changed: {payload['counts']['changed_role_records']}", "",
          "## Residuals", "",
          "Every residual role and its specific reason is in the adjacent JSON `residuals` array. No uncertainty is silently converted to a route.", "",
          "## Scope safeguards", "",
          "Only `specialization_fit_*` area-route fields are written. Legacy `subgroup_fit_*` fields and all parent-domain status/conditionality fields are left untouched. Direct routes are accepted only for explicit no-area domains and only when parent-domain fit is supported.", ""]
    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    summary_counts = {k: v for k, v in payload["counts"].items() if k != "residual_reason_counts"}
    print(json.dumps(summary_counts, indent=2))
    print(f"Report: {OUT_MD.relative_to(ROOT).as_posix()}")


if __name__ == "__main__":
    main()
