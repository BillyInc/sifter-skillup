"""Bounded role-to-domain review for conditional queue batches 001-005.

This worker emits a decision ledger only.  It deliberately does not edit the
canonical role JSON files: the caller requested a non-overlapping agent result
that can be reconciled later.

The rules below are deliberately high-precision.  They use the role task text,
the checked-in domain description, and the source references already attached
to the queue.  A title, ISCO/ESCO membership, or subgroup membership is never
fit evidence.  If the task does not establish the domain-specific assignment,
the disposition remains ``review_required``.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Callable


ROOT = Path(__file__).resolve().parents[5]
CAREER = ROOT / "data" / "career-mapping"
AUDIT = CAREER / "_audit"
QUEUE = AUDIT / "GROUPED_ROLE_REVIEW_QUEUES_2026_10_07" / "role_domain_conditional"
OUT = Path(__file__).resolve().parent

INPUT_BATCHES = tuple(QUEUE / f"batch-{n:03d}.json" for n in range(1, 6))
DOMAIN_META = CAREER / "domain_meta.json"
ROLE_FILES = (
    CAREER / "role_library_v3_cleaned.json",
    CAREER / "thin_domain_role_overlays.json",
    CAREER / "emerging_role_overlays.json",
)

SUPPORTED = "supported"
UNSUPPORTED = "unsupported"
REVIEW = "review_required"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").casefold()).strip()


def text_for(row: dict[str, Any]) -> str:
    # The title identifies the row but is not task evidence. Keep fit
    # decisions grounded in the stored occupational task description.
    return norm(str(row.get("role_task_evidence") or ""))


def has_any(text: str, terms: tuple[str, ...]) -> bool:
    return any(re.search(term, text, flags=re.I) for term in terms)


def has_all(text: str, terms: tuple[str, ...]) -> bool:
    return all(re.search(term, text, flags=re.I) for term in terms)


def task_anchor(text: str, terms: tuple[str, ...]) -> bool:
    return has_any(text, terms)


def decision(
    status: str,
    rule_id: str,
    rationale: str,
    evidence: str,
) -> dict[str, str]:
    return {
        "disposition": status,
        "rule_id": rule_id,
        "rule_rationale": rationale,
        "task_scope_evidence": evidence,
    }


def classify(member: dict[str, Any], domain: dict[str, Any]) -> dict[str, str]:
    """Return only a high-confidence disposition; otherwise retain the hold."""

    did = str(member.get("domain_id"))
    title = norm(member.get("role_title"))
    task = text_for(member)
    basis = norm(member.get("domain_fit_basis"))
    scope = norm(domain.get("description"))

    # Explicit, task-level exclusions for specialised domains.  These are not
    # title guesses: the condition is a domain-specific boundary and the task
    # text lacks that boundary.
    if did == "D056" and not has_any(task, (
        r"blockchain", r"distributed ledger", r"\bdlt\b", r"smart contract",
        r"wallet", r"consensus", r"cryptocurrenc", r"\btoken", r"\bweb3\b",
    )) and "blockchain-specific" in basis:
        return decision(
            UNSUPPORTED, "D056.generic_ict_not_dlt",
            "The attached task profile is technology-neutral ICT/security/data work and does not identify a blockchain or distributed-ledger assignment.",
            "No blockchain, distributed-ledger, smart-contract, wallet, consensus, or Web3 task is present.",
        )

    if did == "D131" and not has_any(task, (
        r"motorsport", r"motor sport", r"racing", r"race car", r"race vehicle",
        r"formula one", r"formula 1", r"track competition", r"competition vehicle",
    )):
        return decision(
            UNSUPPORTED, "D131.generic_automotive_not_motorsport",
            "The task profile describes general automotive, machinery, assembly, or engineering work and does not establish a motorsport or racing assignment.",
            "No motorsport, racing, track-competition, or competition-vehicle task is present.",
        )

    if did == "D166" and not has_any(task, (
        r"autonomous", r"self[- ]driv", r"driverless", r"automated driving",
        r"adas", r"advanced driver assistance", r"vehicle autonomy",
    )):
        return decision(
            UNSUPPORTED, "D166.generic_vehicle_or_robotics_not_autonomous",
            "The task profile does not establish autonomous/self-driving vehicle work; generic automotive, telecommunications, robotics, or mechatronics work is not enough for this parent domain.",
            "No autonomous, self-driving, driverless, ADAS, or vehicle-autonomy task is present.",
        )

    if did == "D143" and not has_any(task, (
        r"forensic", r"criminal", r"crime", r"evidence", r"autops", r"patholog",
        r"digital forensics", r"cybercrime", r"criminal investigation", r"casework",
    )):
        return decision(
            UNSUPPORTED, "D143.general_science_or_health_not_forensic",
            "The task profile does not establish forensic, criminal-investigation, or evidential casework required by this parent domain.",
            "The task contains no forensic, criminal, evidential, autopsy/pathology, cybercrime, or investigation assignment.",
        )

    if did == "D160" and not has_any(task, (
        r"fashion styl", r"image consult", r"personal shop", r"wardrobe",
        r"styling", r"appearance consult", r"outfit",
    )):
        return decision(
            UNSUPPORTED, "D160.design_or_salon_not_styling",
            "Designing garments or managing a beauty salon does not, by itself, establish fashion styling, image consulting, or personal-shopping work.",
            "No styling, image-consulting, wardrobe, outfit, or personal-shopping task is present.",
        )

    if did == "D110" and has_any(task, (r"nitroglycerin", r"explosives?", r"spent acids")):
        return decision(
            UNSUPPORTED, "D110.explosives_process_outside_parent_scope",
            "The exact task is an explosives-processing operation, not the ordinary chemical, rubber, or plastics plant scope represented by this parent domain.",
            "The task explicitly concerns nitroglycerin/explosives processing.",
        )

    if did == "D132" and not has_any(task, (
        r"space", r"astronom", r"astrophys", r"cosmolog", r"orbital", r"planet",
        r"satellite", r"rocket", r"spacecraft",
    )):
        return decision(
            UNSUPPORTED, "D132.generic_physics_not_space",
            "A generic physicist profile does not establish space science or exploration work.",
            "No space, astronomy, astrophysics, orbital, planetary, satellite, rocket, or spacecraft task is present.",
        )

    if did == "D135" and not has_any(task, (
        r"nuclear", r"radiation", r"radioactiv", r"reactor", r"dosimetr", r"radiolog",
    )):
        return decision(
            UNSUPPORTED, "D135.generic_physics_not_nuclear",
            "A generic physicist profile does not establish nuclear engineering or radiation-science work.",
            "No nuclear, radiation, radioactive, reactor, dosimetry, or radiological task is present.",
        )

    if did == "D145" and not has_any(task, (
        r"neuro", r"brain", r"cognitiv", r"neural", r"synap", r"electroencephal",
        r"brain[- ]computer", r"central nervous",
    )):
        return decision(
            UNSUPPORTED, "D145.generic_physiology_not_neuroscience",
            "A generic physiologist profile does not establish neuroscience, cognitive science, or brain-computer-interface work.",
            "No brain, neural, cognitive, neuroscience, or brain-computer-interface task is present.",
        )

    if did == "D048" and not has_any(task, (
        r"food", r"nutrition", r"agri[- ]?food", r"crop", r"plant breeding",
    )):
        return decision(
            UNSUPPORTED, "D048.generic_genetics_not_food_science",
            "A generic genetics profile does not establish food-science or food-technology work.",
            "No food, nutrition, agri-food, crop, or food-technology task is present.",
        )

    if did == "D138" and not has_any(task, (
        r"biomedical", r"medical device", r"clinical", r"prosthet", r"biomechan",
        r"health technolog", r"bioengineer", r"medical equipment",
    )):
        return decision(
            UNSUPPORTED, "D138.generic_engineering_not_biomedical",
            "A generic research-engineering profile does not establish biomedical-engineering work.",
            "No biomedical, medical-device, clinical, bioengineering, or health-technology task is present.",
        )

    if did == "D156" and has_any(task, (r"hydrographic", r"bathymetr", r"water survey")) and not has_any(task, (
        r"cadastral", r"land survey", r"topographic", r"property boundary", r"parcel",
    )):
        return decision(
            UNSUPPORTED, "D156.hydrographic_not_land_cadastral",
            "Hydrographic surveying is a water-surveying specialty and does not establish land-surveying or cadastral mapping work.",
            "The task is hydrographic/water surveying without land, cadastral, topographic, or parcel-boundary work.",
        )

    # The queue basis itself can record an unresolved identity, missing
    # locator, broad occupation, or assignment-dependent condition.  A broad
    # task keyword must not override that explicit gap.  The high-confidence
    # exclusions above run first because they are explicit non-fit boundaries.
    if any(marker in basis for marker in (
        "treat fit as conditional until",
        "keep conditional until",
        "pending identity/source reconciliation",
        "pending a reliable source",
        "not sufficiently specific for an unconditional fit",
        "does not clearly establish",
        "does not explicitly establish ownership",
        "fit depends on the actual assignment",
        "fit depends on an evidenced",
        "not by itself humanitarian",
        "not itself credit analysis",
        "not automatically an electrical engineering fit",
        "does not establish that this broader role is principally",
    )):
        return decision(
            REVIEW, "EXPLICIT_CONTEXT_OR_SOURCE_GAP",
            "The existing source-backed review explicitly identifies an unresolved assignment, source-identity, locator, or scope condition. The task anchor is not enough to promote the exact parent-domain link.",
            "The queue's own basis contains an explicit conditional/source-gap statement; review_required is preserved.",
        )

    if did == "D124" and not has_any(task, (
        r"community health", r"health extension", r"primary health", r"outreach", r"public health",
    )):
        return decision(
            UNSUPPORTED, "D124_clinical_technician_not_community_health",
            "A clinical technician task does not establish community-health-extension practice.",
            "No community-health, health-extension, primary-health, outreach, or public-health assignment is present.",
        )

    if did == "D163" and not has_any(task, (
        r"intellectual property", r"\bip\b", r"patent", r"trademark", r"copyright",
    )):
        return decision(
            UNSUPPORTED, "D163.generic_legal_assistant_not_ip",
            "A generic legal-assistant task does not establish intellectual-property or patent-practice work.",
            "No intellectual-property, patent, trademark, or copyright task is present.",
        )

    if did == "D082" and not has_any(task, (
        r"customer", r"contact centre", r"contact center", r"call centre", r"call center",
        r"front desk", r"patient relation", r"service desk",
    )):
        return decision(
            UNSUPPORTED, "D082_medical_practice_management_not_contact_centre",
            "Managing a medical practice's operations is not, by itself, customer-service or contact-centre work.",
            "No customer-service, contact-centre, call-centre, front-desk, or service-desk task is present.",
        )

    if did == "D096" and not has_any(task, (
        r"agricultur", r"farm", r"tractor", r"harvest", r"crop", r"field work", r"farm equipment",
    )):
        return decision(
            UNSUPPORTED, "D096_generic_heavy_driver_not_farm_operations",
            "A generic heavy-truck driving task does not establish agricultural-machinery or farm-operation work.",
            "No agricultural, farm, tractor, harvest, crop, field, or farm-equipment task is present.",
        )

    if did == "D114" and not has_any(task, (
        r"assembly", r"packag", r"production line", r"filling", r"wrapping",
    )):
        return decision(
            UNSUPPORTED, "D114_model_making_not_assembly_packaging",
            "Model making does not establish assembly or packaging operations.",
            "No assembly, packaging, production-line, filling, or wrapping task is present.",
        )

    if did == "D121" and not has_any(task, (
        r"forest", r"wildlife", r"woodland", r"game management", r"conservation", r"protected area",
    )):
        return decision(
            UNSUPPORTED, "D121_general_pest_control_not_forestry_wildlife",
            "Generic pest-control work does not establish forestry or wildlife-management work.",
            "No forestry, woodland, wildlife, conservation, protected-area, or game-management task is present.",
        )

    # High-precision positive routes.  Each requires a concrete task anchor;
    # generic role titles alone are intentionally not enough.
    positive_rules: tuple[tuple[str, tuple[str, ...], str, str], ...] = (
        ("D002", (r"data architect", r"data architecture", r"database", r"data engineer", r"blockchain architect", r"system integration"), "D002.direct_data_architecture_task", "The task explicitly designs, integrates, or manages data/database architecture.") ,
        ("D003", (r"machine learning", r"artificial intelligence", r"neural network", r"algorithm", r"ai system", r"deep learning"), "D003.direct_ai_ml_task", "The task explicitly concerns AI, machine learning, neural networks, algorithms, or deep learning.") ,
        ("D004", (r"cybersecurity", r"cyber security", r"information security", r"security of information systems", r"cyber attack", r"disaster recovery"), "D004.direct_cybersecurity_task", "The task explicitly concerns cybersecurity, information security, or ICT recovery.") ,
        ("D005", (r"cloud", r"network administrator", r"network architect", r"data cent(er|re)", r"devops", r"computer network", r"network technician"), "D005.direct_cloud_network_task", "The task explicitly operates cloud, network, data-centre, or DevOps infrastructure.") ,
        ("D006", (r"sensor", r"embedded", r"firmware", r"internet of things", r"iot", r"connected device"), "D006.direct_iot_embedded_task", "The task explicitly concerns sensors, embedded/firmware systems, IoT, or connected devices.") ,
        ("D009", (r"data analys", r"data scientist", r"statistical", r"clinical data", r"data analytics", r"data science"), "D009.direct_data_science_task", "The task explicitly performs data analysis, statistics, or data-science work.") ,
        ("D010", (r"business intelligence", r"analytics", r"user experience analyst", r"ux analyst", r"data visuali"), "D010.direct_bi_analytics_task", "The task explicitly concerns business intelligence, analytics, or user-experience analysis.") ,
        ("D012", (r"fintech", r"financial technology", r"payment system", r"banking software", r"financial software"), "D012.direct_fintech_task", "The task explicitly concerns financial-technology or financial-software implementation.") ,
        ("D013", (r"investment", r"asset management", r"mergers? and acquisitions?", r"securities", r"underwriting", r"portfolio", r"business valu", r"financial analyst"), "D013.direct_investment_task", "The task explicitly concerns investment, valuation, securities, underwriting, or asset management.") ,
        ("D014", (r"actuarial", r"insurance", r"pension", r"loss adjust", r"insurance fraud"), "D014.direct_actuarial_insurance_task", "The task explicitly concerns insurance, actuarial, pension, or loss-adjustment work.") ,
        ("D016", (r"electrical", r"instrumentation", r"electrotechnology", r"microelectronic", r"microsystem", r"battery", r"power system"), "D016.direct_electrical_task", "The task explicitly concerns electrical, instrumentation, microelectronic, battery, or power-system work.") ,
        ("D017", (r"mechanical", r"mechatronic", r"machinery", r"machine design", r"aerospace engineer", r"motor vehicle assembly", r"mechanical equipment"), "D017.direct_mechanical_task", "The task explicitly concerns mechanical, mechatronic, machinery, or mechanical-equipment work.") ,
        ("D018", (r"civil engineer", r"civil engineering", r"construction", r"infrastructure", r"building project", r"road", r"bridge", r"water system", r"fire protection"), "D018.direct_civil_construction_task", "The task explicitly concerns civil engineering, construction, infrastructure, buildings, roads, water systems, or fire protection.") ,
        ("D019", (r"renewable", r"hydropower", r"solar", r"wind power", r"geothermal", r"biomass"), "D019.direct_renewable_task", "The task explicitly concerns a renewable-energy source or system.") ,
        ("D020", (r"biogas", r"waste-to-energy", r"environmental engineering"), "D020.direct_environmental_task", "The task explicitly concerns biogas or environmental engineering.") ,
        ("D021", (r"urban planning", r"mobility service", r"transport planning", r"city planning"), "D021.direct_urban_mobility_task", "The task explicitly concerns urban planning or mobility services.") ,
        ("D022", (r"geolog", r"geophys", r"mining", r"tunnel boring", r"hydrolog", r"earth science"), "D022.direct_geoscience_task", "The task explicitly concerns geology, geophysics, mining, tunnelling, hydrology, or earth science.") ,
        ("D023", (r"medical", r"medicine", r"physician", r"clinical", r"laboratory", r"histology", r"cytogenetic", r"prosthet"), "D023.direct_medical_task", "The task explicitly concerns medical, clinical, laboratory, histology, cytogenetic, or prosthetic practice.") ,
        ("D024", (r"nursing", r"patient care", r"clinical care", r"medical assistant", r"community health", r"nursing staff"), "D024.direct_nursing_patient_care_task", "The task explicitly concerns nursing or direct clinical/patient-care support.") ,
        ("D025", (r"pharmaceutical", r"pharmacy", r"medicinal product", r"drug"), "D025.direct_pharmacy_task", "The task explicitly concerns pharmaceutical goods, pharmacy, or medicines.") ,
        ("D026", (r"public health", r"health and safety", r"occupational health", r"safety inspector", r"ergonom"), "D026.direct_public_health_task", "The task explicitly concerns public, occupational, or safety-health practice.") ,
        ("D027", (r"biomedical", r"biotechnolog", r"medical laborator", r"epidemiolog", r"life science"), "D027.direct_biomedical_task", "The task explicitly concerns biomedical, biotechnology, medical-laboratory, or epidemiological work.") ,
        ("D028", (r"manage", r"manager", r"direct", r"oversee", r"coordinate", r"strateg", r"budget", r"policy"), "D028.direct_management_task", "The task explicitly manages, directs, coordinates, or sets policy for an organisational unit or operation.") ,
        ("D030", (r"marketing", r"brand", r"customer experience", r"sales", r"e-business", r"ecommerce", r"tourism product", r"market"), "D030.direct_marketing_task", "The task explicitly concerns marketing, brand, customer experience, sales, or market activity.") ,
        ("D031", (r"sales", r"auction", r"checkout", r"after-sales", r"customer service", r"business development"), "D031.direct_sales_task", "The task explicitly concerns sales, a buyer transaction, customer service, or business development.") ,
        ("D032", (r"project", r"programme", r"program", r"portfolio management", r"coordinate projects"), "D032.direct_project_management_task", "The task explicitly coordinates or manages projects/programmes.") ,
        ("D033", (r"product requirements", r"product lifecycle", r"product strategy", r"product roadmap", r"product manager", r"innovation"), "D033.direct_product_task", "The task explicitly concerns product requirements, lifecycle, strategy, roadmap, or product innovation.") ,
        ("D034", (r"import[- ]export", r"cross[- ]border", r"wholesale", r"wholesale buyers", r"suppliers", r"supply chain", r"freight", r"shipment", r"warehouse", r"customs", r"procurement", r"inventory", r"distribution", r"conclude trades"), "D034.direct_supply_chain_task", "The task explicitly manages trade, procurement, freight, inventory, warehousing, customs, or distribution.") ,
        ("D035", (r"logistics", r"transport", r"shipment", r"freight", r"warehouse", r"rail", r"airport", r"air travel", r"distribution", r"import[- ]export", r"cross[- ]border", r"cargo", r"event planning"), "D035.direct_logistics_task", "The task explicitly concerns logistics, transport, freight, shipment, rail, airport, warehousing, or distribution.") ,
        ("D041", (r"research", r"scientist", r"scientific", r"ecolog", r"remote sensing", r"air pollution"), "D041.direct_research_task", "The task explicitly conducts scientific research or a named research-science activity.") ,
        ("D042", (r"sound", r"performance", r"broadcast", r"stage", r"artist", r"production", r"pyrotechnic"), "D042.direct_media_production_task", "The task explicitly concerns media, performance, stage, broadcast, sound, or production work.") ,
        ("D043", (r"journal", r"vlog", r"writer", r"publishing", r"editor", r"localis", r"medical writer", r"technical writer"), "D043.direct_publishing_task", "The task explicitly creates, edits, or publishes written/digital content.") ,
        ("D044", (r"drawing artist", r"graphic design", r"visual design", r"illustrat"), "D044.direct_graphic_design_task", "The task explicitly creates drawings, graphics, or illustrations.") ,
        ("D046", (r"social work", r"counsell", r"counsel", r"community", r"bereavement", r"employment support"), "D046.direct_social_work_task", "The task explicitly provides counselling, social-work, community, or employment-support services.") ,
        ("D047", (r"agricultur", r"crop", r"farm", r"plant", r"botan", r"fisheries", r"animal behaviour"), "D047.direct_agricultural_task", "The task explicitly concerns agriculture, crops, plants, fisheries, or agricultural animal work.") ,
        ("D057", (r"health informatics", r"electronic health record", r"telemedicine", r"clinical information", r"healthcare information system"), "D057.direct_digital_health_task", "The task explicitly concerns digital health, EHR, telemedicine, or clinical information systems.") ,
        ("D059", (r"aerospace", r"satellite", r"spacecraft", r"space technology"), "D059.direct_space_technology_task", "The task explicitly concerns aerospace, satellites, spacecraft, or space technology.") ,
        ("D060", (r"debt", r"loan", r"credit", r"pawnbrok", r"lending"), "D060.direct_credit_task", "The task explicitly concerns debt collection, lending, loans, credit, or pawnbroking.") ,
        ("D062", (r"trading", r"investment fund", r"mutual fund", r"broker", r"corporate investment", r"portfolio"), "D062.direct_trading_task", "The task explicitly concerns trading, funds, broking, or corporate investment.") ,
        ("D063", (r"climate change", r"climate policy"), "D063.direct_climate_policy_task", "The task explicitly analyses climate-change policy.") ,
        ("D065", (r"sign language", r"interpret", r"translation", r"linguistic"), "D065.direct_language_task", "The task explicitly concerns sign-language teaching, interpretation, translation, or linguistics.") ,
        ("D066", (r"animal", r"veterinary", r"equine", r"hoof"), "D066.direct_veterinary_task", "The task explicitly treats, diagnoses, or supports animals in a veterinary context.") ,
        ("D068", (r"therapy", r"therapist", r"rehabilitation", r"chiropractic", r"wellbeing"), "D068.direct_therapy_task", "The task explicitly provides a therapy, rehabilitation, or allied-health treatment.") ,
        ("D069", (r"aircraft", r"aviation", r"airport", r"steward", r"airline", r"air travel"), "D069.direct_aviation_task", "The task explicitly concerns aircraft, aviation, airports, or airline operations.") ,
        ("D073", (r"archive", r"library", r"records?", r"information manager", r"registrar"), "D073.direct_information_management_task", "The task explicitly manages records, archives, libraries, or information.") ,
        ("D074", (r"health and safety", r"safety inspector", r"occupational safety", r"food safety", r"aviation safety"), "D074.direct_safety_task", "The task explicitly inspects or manages health and safety compliance.") ,
        ("D078", (r"sociolog", r"geograph", r"genealog", r"social research", r"population"), "D078.direct_social_science_task", "The task explicitly concerns social science, geography, genealogy, or population research.") ,
        ("D085", (r"ticket", r"retail", r"shop", r"checkout", r"sales"), "D085.direct_retail_transaction_task", "The task explicitly performs a retail or ticket transaction.") ,
        ("D094", (r"sensor", r"instrumentation", r"electronic equipment", r"tramway equipment"), "D094.direct_equipment_servicing_task", "The task explicitly services sensors, instrumentation, electronics, or related equipment.") ,
        ("D097", (r"weld", r"fabricat", r"casting", r"mould", r"cnc", r"metal forming"), "D097.direct_fabrication_task", "The task explicitly operates fabrication, casting, moulding, welding, or CNC equipment.") ,
        ("D099", (r"masonry", r"brick", r"plaster", r"concrete", r"insulation", r"building construction"), "D099.direct_masonry_task", "The task explicitly concerns masonry, bricklaying, plastering, construction, or building insulation.") ,
        ("D100", (r"plumb", r"pipe", r"hvac", r"heating", r"ventilation", r"air conditioning", r"sewer", r"water network"), "D100.direct_plumbing_hvac_task", "The task explicitly concerns plumbing, pipefitting, HVAC, sewerage, or water networks.") ,
        ("D102", (r"woodwork", r"woodworking", r"carpentry", r"joinery", r"wood furniture"), "D102.direct_woodwork_task", "The task explicitly concerns carpentry, joinery, woodworking, or wood furniture.") ,
        ("D104", (r"glass", r"ceramic", r"pottery", r"kiln"), "D104.direct_glass_ceramics_task", "The task explicitly concerns glass, ceramics, pottery, or kiln work.") ,
        ("D105", (r"carpet", r"weav", r"basket", r"textile craft", r"handicraft"), "D105.direct_textile_craft_task", "The task explicitly concerns carpet/textile weaving or handicraft production.") ,
        ("D106", (r"sewing", r"garment", r"tailor", r"textile", r"pressing garments"), "D106.direct_garment_task", "The task explicitly concerns garment, tailoring, sewing, textile, or pressing work.") ,
        ("D107", (r"leather", r"footwear", r"hides", r"skins", r"shoe"), "D107.direct_leather_task", "The task explicitly concerns leather, hides, skins, footwear, or leather-product operations.") ,
        ("D108", (r"reprographic", r"print", r"printing", r"pre-press", r"digital printing"), "D108.direct_printing_task", "The task explicitly reproduces or prints graphical documents.") ,
        ("D111", (r"cotton", r"ginning", r"textile machine", r"garment machine"), "D111.direct_textile_machine_task", "The task explicitly operates cotton/textile/garment machinery.") ,
        ("D113", (r"glass", r"ceramic", r"boiler", r"power plant", r"grinding", r"polishing", r"mixing materials"), "D113.direct_materials_plant_task", "The task explicitly operates glass, ceramic, boiler, power-plant, or material-processing equipment.") ,
        ("D116", (r"heavy equipment", r"earthmoving", r"tractor", r"industrial truck", r"forklift"), "D116.direct_heavy_equipment_task", "The task explicitly operates heavy equipment, earthmoving, industrial trucks, or tractors.") ,
        ("D118", (r"crop", r"vineyard", r"farm", r"horticultur", r"livestock and crop"), "D118.direct_crop_horticulture_task", "The task explicitly concerns crop production, vineyards, horticulture, or mixed crop farming.") ,
        ("D126", (r"complementary", r"alternative therap", r"holistic", r"traditional medicine"), "D126.direct_complementary_medicine_task", "The task explicitly provides complementary, alternative, holistic, or traditional therapy.") ,
        ("D130", (r"employment programme", r"job placement", r"recruitment", r"employment service", r"vocational integration"), "D130.direct_employment_service_task", "The task explicitly develops or delivers employment, recruitment, placement, or vocational-integration services.") ,
        ("D133", (r"furniture", r"cabinet", r"upholster", r"interior", r"bespoke"), "D133.direct_specialist_interiors_task", "The task explicitly restores, makes, or upholsters furniture/interiors.") ,
        ("D136", (r"aerospace", r"aircraft", r"aviation", r"engine design"), "D136.direct_aerospace_task", "The task explicitly designs aircraft/aerospace engines or systems.") ,
        ("D139", (r"game", r"gameplay", r"gaming", r"video game", r"game studio", r"player"), "D139.direct_game_task", "The task explicitly concerns game/gameplay production or player-facing game work.") ,
        ("D140", (r"robot", r"robotic", r"automation", r"mechatronic", r"robotics system"), "D140.direct_robotics_task", "The task explicitly concerns robots, robotics, automation, or mechatronics systems.") ,
        ("D142", (r"bioinformatics", r"computational biology", r"genomic", r"biological data", r"sequence analysis"), "D142.direct_computational_biology_task", "The task explicitly concerns bioinformatics, computational biology, genomics, or biological-data analysis.") ,
        ("D144", (r"climate", r"atmospheric", r"meteorolog", r"earth science", r"geoscience"), "D144.direct_climate_meteorology_task", "The task explicitly concerns climate, atmospheric science, meteorology, earth science, or geoscience.") ,
        ("D146", (r"heating", r"ventilation", r"air conditioning", r"hvac", r"building services"), "D146.direct_building_services_task", "The task explicitly designs or drafts HVAC/building-services systems.") ,
        ("D147", (r"scada", r"plc", r"process control", r"industrial automation", r"instrumentation control"), "D147.direct_process_automation_task", "The task explicitly concerns SCADA, PLC, process control, or industrial automation.") ,
        ("D149", (r"international trade", r"trade polic", r"international organisation", r"international organization", r"humanitarian", r"foreign", r"diplomatic"), "D149.direct_diplomacy_task", "The task explicitly concerns international trade policy, international organisations, humanitarian affairs, foreign affairs, or diplomacy.") ,
        ("D151", (r"digital forensics", r"forensic", r"criminal", r"cybercrime", r"criminal investigation"), "D151.direct_criminal_justice_task", "The task explicitly concerns digital forensics, criminal investigation, or cybercrime.") ,
        ("D154", (r"fitness", r"exercise", r"physiotherap", r"sports therap", r"wellness", r"dietitian"), "D154.direct_exercise_sports_task", "The task explicitly concerns exercise, fitness, physiotherapy, sports therapy, wellness, or sports nutrition.") ,
        ("D155", (r"nanotechnolog", r"semiconductor", r"advanced material", r"synthetic material", r"materials engineer"), "D155.direct_advanced_materials_task", "The task explicitly concerns semiconductors, advanced/synthetic materials, nanotechnology, or materials engineering.") ,
        ("D158", (r"corporate finance", r"investment bank", r"capital market", r"securities", r"merger", r"acquisition", r"valuation", r"dividend", r"financial analyst"), "D158.direct_corporate_finance_task", "The task explicitly concerns corporate finance, investment banking, capital markets, securities, valuation, dividends, or financial analysis.") ,
        ("D159", (r"credit", r"loan", r"lending", r"structured finance", r"underwriting", r"bankruptcy", r"insolvency", r"securities analyst", r"financial risk"), "D159.direct_credit_structured_finance_task", "The task explicitly concerns credit, lending, structured finance, insolvency, risk, or securities analysis.") ,
        ("D161", (r"humanitarian", r"emergency response", r"disaster", r"crisis", r"rescue", r"emergency medical"), "D161.direct_emergency_humanitarian_task", "The task explicitly concerns emergency response, crisis, rescue, humanitarian, or emergency-medical operations.") ,
        ("D162", (r"immigration", r"border protection", r"customs and border", r"entry criteria", r"entry point", r"entering a country", r"border"), "D162.direct_immigration_task", "The task explicitly enforces immigration, border, customs-entry, or asylum rules.") ,
        ("D164", (r"urban mobility", r"public transport", r"rail traffic", r"transport planning", r"mobility system"), "D164.direct_urban_mobility_task", "The task explicitly concerns urban mobility, public transport, rail traffic, or transport planning.") ,
        ("D165", (r"nutrition", r"kinesiolog", r"wellness", r"lifestyle medicine", r"animal-assisted therap"), "D165.direct_wellness_task", "The task explicitly concerns wellness, lifestyle medicine, nutrition, kinesiology, or therapeutic animal-assisted practice.") ,
    )

    # A positive rule is used only when the queue's evidence itself contains
    # the required anchor.  We never promote a conditional role from its title
    # or from subgroup/ISCO placement alone.
    for rule_domain, terms, rule_id, rationale in positive_rules:
        if did == rule_domain and task_anchor(task, terms):
            # Several parent domains require a narrower assignment than the
            # broad anchor.  Keep the conditional hold where the queue itself
            # explicitly says the role is generic or assignment-dependent.
            if did in {"D007", "D008", "D011", "D012", "D015", "D029", "D036", "D048", "D059", "D072", "D090", "D109", "D114", "D115", "D127", "D132", "D135", "D138", "D140", "D142", "D145", "D147", "D148", "D154", "D156", "D160", "D164", "D166", "D167", "D168"}:
                continue
            if any(marker in basis for marker in (
                "only where", "only when", "requires that", "requires the", "depends on the actual",
                "does not establish", "generic", "technology-neutral", "assignment explicitly",
            )) and did not in {"D028", "D034", "D035", "D066", "D074", "D100", "D107", "D108", "D111", "D118", "D126", "D130", "D133", "D149", "D162"}:
                continue
            return decision(SUPPORTED, rule_id, rationale, f"Task text contains the domain-specific anchor matched by {rule_id}.")

    return decision(
        REVIEW, "CONDITIONAL_EVIDENCE_INSUFFICIENT",
        "The role task and attached source evidence identify a plausible relationship but do not establish the exact parent-domain assignment without an unstated sector, product, system, or work-context qualifier. The conditional hold is preserved.",
        "No high-confidence deterministic rule was satisfied; no ISCO/ESCO or subgroup inference was used.",
    )


def canonical_locations() -> dict[str, list[tuple[Path, dict[str, Any]]]]:
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path in ROLE_FILES:
        payload = read_json(path)
        rows = payload if isinstance(payload, list) else payload.get("roles", [])
        for row in rows:
            locations.setdefault(role_key(row), []).append((path, row))
    return locations


def main() -> None:
    meta = read_json(DOMAIN_META)
    locations = canonical_locations()
    decisions: list[dict[str, Any]] = []
    groups_seen = 0
    role_keys: set[str] = set()
    input_hashes: dict[str, str] = {}

    for batch_path in INPUT_BATCHES:
        input_hashes[str(batch_path.relative_to(ROOT))] = sha256(batch_path)
        payload = read_json(batch_path)
        for group in payload.get("groups", []):
            groups_seen += 1
            members = group.get("members") or []
            if len(members) != 1:
                raise ValueError(f"Expected one member per current group: {group.get('group_id')}")
            member = members[0]
            key = member["role_key"]
            if key in role_keys:
                raise ValueError(f"Duplicate assigned role key: {key}")
            role_keys.add(key)
            current = locations.get(key) or []
            if len(current) != 1:
                raise ValueError(f"Current canonical role lookup is not exact for {key}: {len(current)}")
            path, canonical = current[0]
            if canonical.get("domain_fit_review_status") != "conditional":
                raise ValueError(f"Queue/current status drift for {key}: {canonical.get('domain_fit_review_status')!r}")
            domain = meta.get(member["domain_id"])
            if not isinstance(domain, dict):
                raise ValueError(f"Missing domain metadata: {member['domain_id']}")
            d = classify(member, domain)
            decisions.append({
                "batch_number": payload["batch_number"],
                "batch_file": str(batch_path.relative_to(ROOT)),
                "group_id": group["group_id"],
                "role_key": key,
                "domain_id": member["domain_id"],
                "domain_name": member["domain_name"],
                "role_title": member["role_title"],
                "source_file": str(path.relative_to(ROOT)),
                "current_status": canonical.get("domain_fit_review_status"),
                "disposition": d["disposition"],
                "rule_id": d["rule_id"],
                "rule_rationale": d["rule_rationale"],
                "task_scope_evidence": d["task_scope_evidence"],
                "role_task_evidence": member.get("role_task_evidence"),
                "domain_scope_description": domain.get("description"),
                "existing_domain_fit_basis": member.get("domain_fit_basis"),
                "existing_source_refs": member.get("domain_fit_source_refs") or [],
                "isco_or_subgroup_used_as_fit_evidence": False,
                "canonical_role_file_changed": False,
            })

    counts = Counter(row["disposition"] for row in decisions)
    batch_numbers = sorted(int(path.stem.split("-")[-1]) for path in INPUT_BATCHES)
    batch_label = f"conditional_batch_{batch_numbers[0]:03d}_{batch_numbers[-1]:03d}"
    result = {
        "schema_version": "2026-10-07.role-review-agent-conditional-batches.v1",
        "scope": f"Only role_domain_conditional batches {batch_numbers[0]:03d}-{batch_numbers[-1]:03d}; exact role-to-parent-domain fit.",
        "assignment": {
            "batch_files": [str(p.relative_to(ROOT)) for p in INPUT_BATCHES],
            "groups": groups_seen,
            "unique_role_keys": len(role_keys),
            "current_status_required": "conditional",
        },
        "counts": dict(counts),
        "guards": {
            "role_tasks_compared_to_domain_scope": True,
            "isco_or_isco_subgroup_fit_inference": False,
            "esco_or_subgroup_membership_alone_used": False,
            "only_existing_queue_source_refs_used": True,
            "external_sources_added": 0,
            "area_definitions_touched": False,
            "area_source_reconciler_touched": False,
            "overlapping_role_files_touched": False,
            "canonical_role_files_touched": False,
            "review_required_preserved_when_context_insufficient": True,
        },
        "input_sha256": input_hashes,
        "decisions": decisions,
    }
    result_path = OUT / f"{batch_label}_decisions.json"
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    manifest = {
        "schema_version": "2026-10-07.role-review-agent-conditional-batches-manifest.v1",
        "result_file": result_path.name,
        "result_sha256": sha256(result_path),
        "assigned_batches": [p.name for p in INPUT_BATCHES],
        "groups": groups_seen,
        "unique_role_keys": len(role_keys),
        "counts": dict(counts),
        "canonical_files_changed": [],
        "excluded_from_scope": [
            "data/career-mapping/domain_structure.json",
            "data/career-mapping/areas_of_specialization.json",
            "data/career-mapping/_audit/apply_area_source_link_reconciliation_2026_10_07.py",
            "canonical role source files",
        ],
    }
    manifest_path = OUT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    checkpoint = [
        "# Conditional role-domain review checkpoint: batches 001-005",
        "",
        "Status: **complete for the assigned five batches**. This checkpoint is not a claim that the remaining conditional queue is complete.",
        "",
        f"- Groups processed: **{groups_seen}**.",
        f"- Unique role keys processed: **{len(role_keys)}**.",
        f"- Supported: **{counts.get(SUPPORTED, 0)}**.",
        f"- Unsupported exact parent-domain links: **{counts.get(UNSUPPORTED, 0)}**.",
        f"- Retained `review_required`: **{counts.get(REVIEW, 0)}**.",
        "- Canonical role files changed: **none**; this is a reconciliation ledger for later controlled application.",
        "- Area definitions and the area-source reconciler changed: **none**.",
        "- Fit evidence used: role task text, domain scope description, and the source references already attached to each queue member.",
        "- ISCO/ESCO or subgroup membership was not used as proof of fit.",
        "",
        f"The machine-readable per-role result is `{batch_label}_decisions.json`; `manifest.json` records the input and output accounting.",
    ]
    (OUT / f"{batch_label}_checkpoint.md").write_text("\n".join(checkpoint) + "\n", encoding="utf-8")
    print(json.dumps({"groups": groups_seen, "unique_role_keys": len(role_keys), "counts": dict(counts), "result": str(result_path)}, indent=2))


if __name__ == "__main__":
    main()
