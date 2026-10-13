"""Build the append-only global area-of-specialization/subgroup lane.

This lane is deliberately non-canonical.  It reads the current audit inputs,
normalizes global source records, and records candidate subgroup implications
without editing the domain taxonomy, role libraries, or seeds.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
MAPPING = ROOT / "data" / "career-mapping"

SEMANTIC_REGISTER = AUDIT / "role_to_subgroup_semantic_register_2026_10_06_009.json"
ROUTE_GATES = AUDIT / "reclassified_role_route_gates_2026_10_06.json"
COVERAGE = AUDIT / "specialization_review_artifact_coverage_2026_10_06.json"
DOMAIN_REVIEW = AUDIT / "domain_specialization_review_2026_10_03.json"
DOMAIN_STRUCTURE = MAPPING / "domain_structure.json"
ROLE_FILES = (
    MAPPING / "role_library_v3_cleaned.json",
    MAPPING / "emerging_role_overlays.json",
    MAPPING / "thin_domain_role_overlays.json",
)


DOMAIN_CASES: list[dict[str, Any]] = [
    {
        "domain_id": "D016",
        "areas": [
            ("Power and Energy Systems", "Generation, transmission, distribution, power conversion and energy-system engineering."),
            ("Electronics and Semiconductor Devices", "Analog/digital electronics, semiconductor devices, integrated circuits and microelectronics."),
            ("Communications and Signal Processing", "Communications systems, electromagnetic applications, signals and information transmission."),
            ("Control, Instrumentation and Measurement", "Control systems, instrumentation, sensing, calibration and measurement."),
            ("Embedded and Computer Hardware Systems", "Embedded computing, computer hardware, sensors and hardware-software interfaces."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "These are engineering practice or curriculum areas. Batteries, RFID, medical devices and smart homes are application contexts; they are not separate areas without distinct learning-route evidence. Electronics, automation and computing overlaps require task-level review.",
    },
    {
        "domain_id": "D017",
        "areas": [
            ("Mechanical Design and Applied Mechanics", "Mechanical design, machine elements, mechanics, CAD and physical-system realization."),
            ("Thermal, Fluid and Energy Systems", "Thermal science, fluid systems, engines, rotating equipment and energy conversion."),
            ("Manufacturing and Production Engineering", "Manufacturing processes, production systems, tooling, assembly and industrial realization."),
            ("Materials, Integrity and Reliability", "Materials behavior, failure, integrity, maintenance and reliability of mechanical systems."),
            ("Building Services and HVAC", "Heating, ventilation, air-conditioning and refrigeration systems in the built environment."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Automotive engineering and industrial automation remain separate parent domains. Manufacturing processes and building services are areas of engineering practice, while individual equipment types and job titles remain roles or application contexts.",
    },
    {
        "domain_id": "D018",
        "areas": [
            ("Structural Engineering", "Structural analysis and design of buildings, bridges and other civil structures."),
            ("Geotechnical Engineering", "Soil, rock, foundations, earth structures and ground risk."),
            ("Transportation Engineering", "Transport infrastructure, traffic, mobility systems and network design."),
            ("Water Resources Engineering", "Hydrology, hydraulics, water supply, drainage and water-resource systems."),
            ("Environmental and Public Health Infrastructure", "Water, sanitation, pollution and infrastructure systems affecting environmental and public health."),
            ("Construction Engineering", "Construction methods, project delivery, site systems and realization of civil works."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "These are civil-engineering practice areas. A project manager, site supervisor or quantity surveyor is a role/function and is not assigned merely because construction appears in the title. Architecture, environmental science and logistics remain adjacent domains unless task evidence supports the civil parent.",
    },
    {
        "domain_id": "D019",
        "areas": [
            ("Solar Energy Systems", "Photovoltaic and solar-thermal energy systems, design, operation and integration."),
            ("Wind Energy Systems", "Wind-resource systems, turbines, farms, operation and integration."),
            ("Hydropower Systems", "Hydropower generation, hydraulic systems, plants and operation."),
            ("Bioenergy Systems", "Energy from biomass, biogas and biofuels, including conversion systems."),
            ("Geothermal Energy Systems", "Geothermal resources, wells, heat systems and power applications."),
            ("Ocean Energy Systems", "Tidal, wave and other ocean-energy conversion systems."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Generation technology families are the candidate areas. Storage, hybrid systems, grid connection, finance, resource assessment and policy are cross-cutting themes; they do not become separate areas from this evidence alone.",
    },
    {
        "domain_id": "D020",
        "areas": [
            ("Air Quality and Pollution Control", "Air emissions, atmospheric pollutants, monitoring and control systems."),
            ("Water, Wastewater and Stormwater Systems", "Water treatment, wastewater, drainage and stormwater engineering."),
            ("Solid Waste and Resource Recovery", "Waste collection, treatment, recovery, recycling and resource-circulation systems."),
            ("Hazardous Waste and Site Remediation", "Contaminated sites, hazardous materials, remediation and risk control."),
            ("Environmental Health and Exposure Control", "Environmental exposures, risk assessment and controls protecting human health."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "The areas describe environmental-engineering problem families. Environmental policy, auditing, laboratory analysis and occupational hygiene can be functions or adjacent domains; their titles do not prove membership in an engineering subgroup.",
    },
    {
        "domain_id": "D071",
        "areas": [
            ("Sport Organization Governance and Administration", "Governance, administration, policy and organizational operation of sport bodies."),
            ("Sport Marketing and Commercial Partnerships", "Marketing, sponsorship, commercial development and stakeholder relationships in sport."),
            ("Sport Events, Facilities and Venue Operations", "Planning and operating sport events, facilities and venues."),
            ("Sport Development and Participation", "Participation, community development, inclusion and sport-development programmes."),
        ],
        "disposition": "supported_candidate_set_role_enrichment_hold",
        "boundary": "The four areas are a provisional sport-management learning synthesis. Coaching, officiating, sports medicine, performance science and athlete representation are role or adjacent-domain functions and require separate parent-domain fit evidence.",
    },
    {
        "domain_id": "D085",
        "areas": [
            ("Retail Sales and Customer Experience", "Customer-facing retail selling, service, product explanation and experience management."),
            ("Retail Merchandising and Category Management", "Assortment, pricing, presentation, category decisions and retail demand management."),
            ("Retail Store and Omnichannel Operations", "Store operations, inventory flow, fulfilment and coordination across physical and digital channels."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "E-commerce and omnichannel are channel contexts across retail areas. Buyer, seller, cashier, visual-merchandising and store-manager titles are functions; each requires task evidence before area assignment.",
    },
    {
        "domain_id": "D087",
        "areas": [
            ("Barbering and Facial-Hair Grooming", "Cutting, shaping and maintaining hair and facial hair using barbering practice."),
            ("Haircutting, Styling and Colour Services", "Hair cutting, styling, colouring and related salon services."),
            ("Wigs, Extensions and Hair Replacement", "Preparation, application, maintenance and styling of wigs, extensions and hair-replacement systems."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "These are service/practice areas supported by vocational standards. A hairdresser, stylist or assistant is a role/function; medical hair-loss treatment and clinical aesthetics are outside this domain without regulated scope evidence.",
    },
    {
        "domain_id": "D088",
        "areas": [
            ("Facial Skincare and Non-medical Aesthetics", "Non-medical facial skincare, skin treatments and aesthetics within authorized practice scope."),
            ("Body Therapy and Massage", "Body massage and non-medical body-treatment practice."),
            ("Spa Therapy and Wellness Services", "Spa-based treatments, client wellbeing and service operations."),
            ("Nail Care and Enhancement", "Manicure, pedicure and nail-care/enhancement services."),
            ("Hair Removal and Epilation", "Non-medical hair-removal and epilation services."),
            ("Make-up, Brow and Lash Artistry", "Make-up, brow and lash services for personal presentation and beauty practice."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Medical aesthetics, clinical skincare, injectables and weight-loss treatment are regulated clinical functions and are not implied. Tools, products and client-service titles do not create separate specializations.",
    },
    {
        "domain_id": "D089",
        "areas": [
            ("Funeral Arrangement and Ceremony Direction", "Plan and coordinate funeral services, ceremonies, families, suppliers and disposition arrangements."),
            ("Mortuary Care, Embalming and Restorative Presentation", "Care, preparation, embalming and restorative presentation of the deceased within applicable authority."),
            ("Cemetery, Crematory and Disposition Operations", "Operate cemetery, crematory and other final-disposition services and facilities."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Funeral director, embalmer and cemetery attendant are roles/functions. Burial, cremation, embalming and funeral law are strongly jurisdiction-specific and must not be presented as globally portable permissions.",
    },
    {
        "domain_id": "D090",
        "areas": [
            ("Companion Animal Care, Boarding and Shelter Services", "Routine non-clinical care, welfare and safe handling in home-care, boarding and shelter settings."),
            ("Animal Grooming and Coat Care", "Species-appropriate grooming, coat care, hygiene and safe handling."),
            ("Animal Training and Behaviour", "Humane, evidence-informed training and behaviour-support practice."),
            ("Zoological, Wildlife and Sanctuary Care", "Species-specific husbandry, welfare, enrichment and safe care in zoo, wildlife and sanctuary settings."),
        ],
        "disposition": "supported_candidate_set_parent_scope_hold",
        "boundary": "The domain has a blank/broad parent scope. Veterinary treatment, livestock production, breeding and wildlife biology are adjacent professional fields. Animal attendant, groomer, trainer and keeper are roles/functions, not evidence for a new card by title.",
    },
    {
        "domain_id": "D091",
        "areas": [
            ("Car and Light-Vehicle Instruction", "Instruction for passenger cars and light vans, including road-user awareness and vehicle control."),
            ("Motorcycle and Moped Rider Instruction", "Practical riding and safety instruction specific to motorcycles and mopeds."),
            ("Commercial Goods-Vehicle Instruction", "Instruction for heavy goods vehicles and commercial truck operation."),
            ("Bus, Coach and Passenger-Vehicle Instruction", "Instruction for buses, coaches and larger passenger vehicles."),
        ],
        "disposition": "supported_candidate_set_parent_scope_hold",
        "boundary": "The stored parent description includes vessels, while the evidence supports road-driver/rider routes. Vessel instruction belongs to maritime competency practice and cannot be placed into a road subgroup. Instructor titles require task and jurisdiction review.",
    },
    {
        "domain_id": "D093",
        "areas": [
            ("Building and Commercial Electrical Installation", "Electrical installation, testing and maintenance in buildings and commercial environments."),
            ("Electrical Power Networks and Distribution", "Transmission, distribution, cables, overhead lines, substations and network maintenance."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Industrial automation, electronics, vehicle, marine and rail electrical work remain separate or contextual unless exact tasks establish D093 fit. Electrician and cable-jointer are functions; occupational code membership is not fit proof.",
    },
    {
        "domain_id": "D094",
        "areas": [
            ("Electronic Hardware Design, Assembly and Embedded Systems", "Electronic hardware, embedded devices, assembly and hardware-software interfaces."),
            ("Electronics Installation, Testing and Maintenance", "Install, test, diagnose and maintain electronic systems and equipment."),
            ("ICT and Communications Equipment Servicing", "Install, service, repair and maintain ICT and communications equipment."),
            ("Smart-Building and Connected-Systems Integration", "Integrate connected building, automation and smart-system components."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "The parent must be clarified around hardware/equipment integration. Repair technician, installer and systems integrator are roles/functions; a tool, protocol or product brand is not a specialization.",
    },
    {
        "domain_id": "D095",
        "areas": [
            ("Passenger and Light-Commercial Vehicle Service and Repair", "Service and repair for passenger cars and light commercial vehicles."),
            ("Heavy-Vehicle Service and Repair", "Service and repair for heavy vehicles, trucks, buses and related systems."),
            ("Vehicle Body Repair and Refinishing", "Repair, restore and refinish vehicle bodies and exterior structures."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Brakes, tyres, engines, electrical systems and refinishing processes are competencies within the relevant route unless separate learning evidence exists. Bicycle and rail repair are outside the stated motor-vehicle parent.",
    },
    {
        "domain_id": "D097",
        "areas": [
            ("Welding and Joining", "Controlled welding, brazing and other joining processes for metal products and structures."),
            ("Metal Fabrication and Structural Assembly", "Prepare, fit, assemble and fabricate metal products and structures."),
            ("Forging and Blacksmithing", "Hot-forging and hand or machine shaping of metal components and craft products."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Welding processes and materials are competencies within the joining route. Foundry/casting, chemical processing and general metal plant operation are separate parent contexts. Welder, fabricator and blacksmith are roles/functions.",
    },
    {
        "domain_id": "D113",
        "areas": [
            ("Glass, Ceramic and Refractory Materials Processing", "Process glass, ceramic and refractory materials through forming, drying, firing, finishing and quality control."),
            ("Cement, Concrete and Mineral Building Materials", "Produce and control cement, concrete and other mineral construction materials."),
            ("Industrial Boiler and Steam-Plant Operations", "Operate, maintain and control industrial boilers, fired equipment and steam systems."),
        ],
        "disposition": "supported_candidate_set_mixed_parent_scope_hold",
        "boundary": "The three areas are technically distinct but the parent mixes materials manufacturing with boiler operations. Plant operator, maintenance worker and quality technician are functions; a role is not assigned until the root scope and tasks are reconciled.",
    },
    {
        "domain_id": "D114",
        "areas": [
            ("Assembly Systems and Product Integration", "Integrate components into products through assembly planning, mechanisms, tolerancing and production systems."),
            ("Packaging Engineering and Production", "Design, evaluate, manufacture and operate packaging systems for product protection and distribution."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Line operator, assembler and packaging supervisor are roles/functions. Packaging materials, machines, automation and quality are route competencies or contexts unless separate learning evidence supports a new area.",
    },
    {
        "domain_id": "D115",
        "areas": [
            ("Passenger Road Transport Operations", "Operate and coordinate services that carry passengers by road."),
            ("Goods and Freight Road Transport Operations", "Operate and coordinate road movement of goods and freight."),
        ],
        "disposition": "supported_specialization_layer_candidate_not_canonical",
        "boundary": "Bus, school transport, hazardous goods and vehicle classes are jurisdiction-specific contexts and qualifications. Driver, dispatcher and transport manager are roles/functions; do not create a card for every licence or vehicle subclass.",
    },
    {
        "domain_id": "D118",
        "areas": [
            ("Crop Production", "Establish, cultivate, harvest and evaluate field, plantation and other crops."),
            ("Crop Protection and Plant Health", "Prevent, monitor and control pests, diseases, weeds and other plant-health threats."),
            ("Horticulture", "Produce and manage fruit, vegetable, nursery, ornamental and landscape plants."),
        ],
        "disposition": "supported_candidate_set_pending_role_fit",
        "boundary": "Individual crops and techniques remain topics. Agronomist, adviser, inspector, curator and vineyard roles are functions; assign only from actual plant-production or plant-health tasks.",
    },
    {
        "domain_id": "D119",
        "areas": [
            ("Poultry Production", "Manage poultry enterprises, hatchery systems, broilers, layers and related production practices."),
            ("Ruminant Livestock and Dairy Production", "Manage cattle, sheep and goat production, including dairy and beef systems."),
            ("Pig and Rabbit Production", "Manage pig and rabbit husbandry and production enterprises."),
            ("Equine Production and Management", "Manage horse production, welfare, handling and enterprise operations."),
            ("Apiculture and Insect Production", "Manage bees and other insect-production systems, colony care and relevant products."),
        ],
        "disposition": "supported_candidate_set_pending_role_fit",
        "boundary": "Feed nutrition, animal health, breeding and production supervision are functions or cross-cutting competencies unless their task and learning route is independently established. Dairy-product processing and distribution are outside animal production.",
    },
    {
        "domain_id": "D123",
        "areas": [
            ("General Diagnostic Radiography and Fluoroscopy", "Produce and interpret diagnostic radiographic examinations within authorized professional scope."),
            ("Computed Tomography (CT)", "Operate and manage CT imaging workflows, patient care, protocols and image quality."),
            ("Magnetic Resonance Imaging (MRI)", "Operate and manage MRI workflows, safety, protocols and image quality."),
            ("Medical Ultrasound", "Perform sonographic examinations and ultrasound imaging workflows."),
            ("Nuclear Medicine Imaging", "Use radiopharmaceutical and nuclear-imaging workflows within authorized scope."),
            ("Mammography and Breast Imaging", "Perform breast-imaging workflows and related quality and patient-care practice."),
        ],
        "disposition": "supported_candidate_set_pending_role_fit",
        "boundary": "Modality areas are not proof of a role's qualification or authorization. Radiation therapy is therapeutic and remains outside this six-card diagnostic-imaging set; radiographer, sonographer and technologist are roles/functions.",
    },
]


ROUTE_CASES: dict[str, dict[str, Any]] = {
    "D032|Information Technology Project Managers": {
        "area": "Project Delivery and Lifecycle Management",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "The source task is IT project planning, initiation, leadership and delivery. Project delivery is an established practice area; the role title is a function within it, not a new specialization.",
    },
    "D030|search engine optimisation expert": {
        "area": "Digital Marketing and Channel Activation",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "SEO is a recognized digital-marketing channel practice. It should not become an SEO-only subgroup from a title; the role routes to digital/channel practice if its tasks remain marketing-owned.",
    },
    "D062|investment clerk": {
        "area": "Brokerage and Market Intermediation",
        "classification": "role_function_area_boundary_unresolved",
        "disposition": "hold_role_task_boundary_before_route",
        "reason": "The source description is clerical administration of securities investments. It may support transaction/intermediation operations, but the evidence does not establish trading, dealing or brokerage responsibility by title alone.",
    },
    "D035|logistics engineer": {
        "area": "Fleet, Network and Transport Operations",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "The source task designs and implements systems that optimize transportation time, effort, tracking and communication. That is a transport-operations engineering function within the candidate area; it is not a new specialization named logistics engineering.",
    },
    "D098|Ophthalmic Laboratory Technicians": {
        "area": "Precision Instruments and Optical Devices",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "Cutting, grinding, polishing and mounting optical elements directly matches the optical-device practice area. The role is a technician function and does not imply clinical eye-care or an independent subgroup.",
    },
    "D119|animal feed nutritionist": {
        "area": None,
        "classification": "cross_cutting_function_not_top_level_area",
        "disposition": "hold_no_new_specialization_route",
        "reason": "Feed formulation and nutrition apply across poultry, ruminant, pig, rabbit, equine and insect production. The reviewed area set does not establish nutrition as a separate top-level route; retain it as a cross-cutting function pending stronger route evidence.",
    },
    "D120|aquaculture environmental analyst": {
        "area": "Aquaculture Production and Systems",
        "classification": "cross_cutting_function_within_established_area",
        "disposition": "hold_role_function_boundary_before_route",
        "reason": "Environmental monitoring and pollution control support aquaculture systems and aquatic health, but the role is an environmental function spanning production and health rather than proof of a separate specialization.",
    },
    "D120|aquaculture quality supervisor": {
        "area": None,
        "classification": "cross_cutting_function_not_top_level_area",
        "disposition": "hold_no_new_specialization_route",
        "reason": "Quality supervision is a control function across production, health and post-harvest work. No source establishes it as a standalone Fisheries and Aquaculture specialization.",
    },
    "D120|aquaculture site supervisor": {
        "area": "Aquaculture Production and Systems",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "Site supervision is an operational function in aquaculture production systems. It should route to that area only after the exact task record confirms production-system responsibility.",
    },
    "D118|curator of horticulture": {
        "area": "Horticulture",
        "classification": "role_function_area_boundary_unresolved",
        "disposition": "hold_role_task_boundary_before_route",
        "reason": "Horticultural curation can involve plant collections, gardens, conservation or public display rather than crop production. Horticulture is the plausible area candidate, but the title does not establish the exact route.",
    },
    "D118|viticulture adviser": {
        "area": "Horticulture",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "Viticulture is a plant-production practice that fits the horticulture candidate area. Adviser is the role/function; it does not require a separate viticulture subgroup without a distinct learner route.",
    },
    "D060|bank treasurer": {
        "area": "Treasury Operations",
        "classification": "role_function_candidate_area_not_established",
        "disposition": "hold_candidate_area_before_route",
        "reason": "Bank treasury is a plausible functional area, but the current global review explicitly keeps treasury provisional and does not establish it as a supported student subgroup under the parent.",
    },
    "D158|corporate treasurer": {
        "area": "Corporate Financial Planning and Treasury",
        "classification": "role_function_parent_scope_boundary_unresolved",
        "disposition": "hold_parent_scope_before_route",
        "reason": "Corporate treasury is a candidate branch in a parent that combines corporate finance and investment banking. The role is a treasury function, but the parent must be split or clarified before a subgroup route is exposed.",
    },
    "D036|procurement department manager": {
        "area": "Procurement Strategy and Category Management",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "The task record is buyer-side procurement management and policy execution. It fits procurement strategy/category practice if the exact duties remain buyer-side; the manager title is not itself a specialization.",
    },
    "D036|bid manager": {
        "area": "Contract and Commercial Management",
        "classification": "role_function_parent_scope_boundary_unresolved",
        "disposition": "hold_role_function_boundary_before_route",
        "reason": "Bid preparation, tender analysis, costing and risk can be buyer-side procurement or seller-side commercial bidding. The role function is clear, but the current parent boundary does not establish which specialization route is correct.",
    },
    "D042|costume buyer": {
        "area": "Audiovisual Production Design and Craft",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_parent_scope_and_subgroup_signoff",
        "reason": "The source task buys or rents wardrobe materials for a production. It is a production-design/craft function; it is not retail buying or a standalone costume-buying specialization.",
    },
    "D083|destination manager": {
        "area": "Destination Development and Tourism Management",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "The task record covers destination strategy, development, marketing and promotion. Destination management is an established practice area; the managerial title does not create a separate subgroup.",
    },
    "D042|set buyer": {
        "area": "Audiovisual Production Design and Craft",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_parent_scope_and_subgroup_signoff",
        "reason": "The source task procures props and set dressing from scripts for a production. It is a production-design procurement function, not general procurement or a separate buyer specialization.",
    },
    "D083|tourism product manager": {
        "area": "Destination Development and Tourism Management",
        "classification": "role_function_in_established_area",
        "disposition": "supported_area_candidate_route_pending_subgroup_semantic_signoff",
        "reason": "The task record develops tourism offers and coordinates distribution and marketing. Tourism product development is a function within destination/tourism management, not a new top-level specialization.",
    },
}


GAP_CASES = [
    {
        "candidate_key": "D111|textile_industrial_engineer_inactive",
        "domain_id": "D111",
        "candidate_title": "Clothing/textile industrial engineer",
        "classification": "role_function_candidate_not_area_proof",
        "area_implication": {
            "label": "Garment-Machine Production",
            "status": "conditional_candidate",
            "reason": "The existing global lane supports three textile machine-process areas. Garment-machine production remains conditional because machinery standardization and sector guidance do not establish a distinct learner route under D111 by themselves.",
        },
        "role_implication": "The exact library record is inactive and the title describes a possible production-engineering function. Do not add a role, reactivate a role, or use the title as evidence for a subgroup.",
        "disposition": "retain_as_open_role_function_and_parent_boundary_case",
        "source_ids": ["ISO_TC72_TEXTILE_MACHINERY", "UKFT_TEXTILE_MANUFACTURING_NOS", "ILO_TEXTILE_CLOTHING_LEATHER_FOOTWEAR_OSH"],
        "limit": "The sources support textile production-stage distinctions and operational context, not a universal garment-machine specialization or this inactive role's fit.",
    },
    {
        "candidate_key": "D122|blood_bank_technologist_specialization_candidate",
        "domain_id": "D122",
        "candidate_title": "Blood bank / transfusion laboratory technologist",
        "classification": "established_area_candidate_role_not_approved",
        "area_implication": {
            "label": "Hematology, Hemostasis and Transfusion Science",
            "status": "recognized_discipline_area_internal_synthesis",
            "reason": "Clinical-laboratory professional scope sources independently identify hematology, hemostasis/immunohematology and transfusion medicine as a coherent discipline family.",
        },
        "role_implication": "The candidate can inform a future D122 area route, but it does not justify adding or activating a role. Blood-bank technologist tasks, reporting authority and transfusion practice remain qualification- and jurisdiction-specific.",
        "disposition": "area_supported_role_route_pending_task_and_authorization_review",
        "source_ids": ["D122_ASCLS_SCOPE", "D122_ASCLS_LABORATORY_DISCIPLINES", "WHO_GLOBAL_BLOOD_SAFETY"],
        "limit": "Professional-society and WHO sources support discipline boundaries and service importance, not a global subgroup count, universal credential, or role authorization.",
    },
]


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def walk(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def local_only(record: dict[str, Any]) -> bool:
    text = " ".join(str(record.get(k, "")) for k in ("publisher", "title", "url", "locator", "geographic_scope", "claim_limit", "limitation"))
    lowered = text.casefold()
    return any(token in lowered for token in (
        "nigeria", "nigerian", "nuc.edu.ng", "rrbn.gov.ng", "unilorin.edu.ng", "unimed.edu.ng", "unn.edu.ng", "oaustech.edu.ng",
    ))


def normalize_source(record: dict[str, Any]) -> dict[str, Any] | None:
    url = record.get("url")
    if not isinstance(url, str) or not url.startswith("https://"):
        return None
    if local_only(record):
        return None
    source_id = record.get("source_id") or record.get("source_key") or record.get("id")
    title = record.get("title") or record.get("name") or source_id or url
    publisher = record.get("publisher") or record.get("organization") or "Source publisher not captured"
    locator = record.get("locator") or record.get("section") or "Locator retained in originating review artifact"
    claim = record.get("claim_supported") or record.get("supports") or record.get("claim") or "See originating review artifact; no new claim inferred by this lane."
    limit = record.get("claim_limit") or record.get("limitation") or record.get("does_not_support") or "The source supports context or practice boundaries, not a universal subgroup count or role fit."
    return {
        "source_id": str(source_id or hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]),
        "publisher": str(publisher),
        "title": str(title),
        "url": url,
        "locator": str(locator),
        "claim_supported": str(claim),
        "claim_limit": str(limit),
        "geographic_scope": str(record.get("geographic_scope") or record.get("geographic_scope_disposition") or "global_or_international_or_comparative"),
    }


def source_records_for_domain(domain_id: str, semantic: dict[str, Any], coverage: dict[str, Any], central: dict[str, Any]) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []
    for row in semantic.get("domain_route_assessments", []):
        if row.get("domain_id") == domain_id:
            candidates.extend(row.get("authoritative_global_source_evidence", []))
    for row in central.get("domain_reviews", []):
        if row.get("domain_id") == domain_id:
            candidates.extend(row.get("evidence", []))
            candidates.extend(row.get("sources", []))
            candidates.extend(row.get("source_register", []))
    for relative in coverage.get("artifact_paths_by_domain", {}).get(domain_id, []):
        path = ROOT / Path(relative)
        if not path.is_file():
            continue
        # Shared inventory/checkpoint files contain records for many domains.
        # The route assessment and the domain-specific artifacts above are the
        # authoritative inputs for this lane; do not duplicate unrelated
        # source records into every domain row.
        if domain_id.casefold() not in path.name.casefold():
            continue
        try:
            payload = read_json(path)
        except (OSError, json.JSONDecodeError):
            continue
        candidates.extend(item for item in walk(payload) if isinstance(item, dict) and "url" in item)
    by_url: dict[str, dict[str, Any]] = {}
    for raw in candidates:
        normalized = normalize_source(raw)
        if normalized and normalized["url"] not in by_url:
            by_url[normalized["url"]] = normalized
    return sorted(by_url.values(), key=lambda item: (item["source_id"], item["url"]))


def role_rows() -> dict[str, dict[str, Any]]:
    rows: dict[str, dict[str, Any]] = {}
    for path in ROLE_FILES:
        if not path.is_file():
            continue
        document = read_json(path)
        values = document if isinstance(document, list) else document.get("roles") or []
        for row in values:
            key = f"{row.get('domain_id')}|{row.get('role_name')}"
            rows.setdefault(key, row)
    return rows


def domain_structure_record(domain_id: str, structure: dict[str, Any]) -> dict[str, Any]:
    value = structure.get(domain_id, {}) if isinstance(structure, dict) else {}
    if not isinstance(value, dict):
        return {}
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return {
        "record_keys": sorted(value),
        "record_sha256": hashlib.sha256(raw).hexdigest(),
        "subgroup_record_count": len(value.get("subgroups") or value.get("subgroup_records") or []),
        "role_record_count": len(value.get("roles") or value.get("role_records") or []),
    }


def route_gate_by_key(gates: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {item["role_key"]: item for item in gates.get("changes", [])}


def build_register() -> dict[str, Any]:
    semantic = read_json(SEMANTIC_REGISTER)
    gates = read_json(ROUTE_GATES)
    coverage = read_json(COVERAGE)
    central = read_json(DOMAIN_REVIEW)
    structure = read_json(DOMAIN_STRUCTURE)
    roles = role_rows()
    gate_rows = route_gate_by_key(gates)
    route_assessments = {row["domain_id"]: row for row in semantic["domain_route_assessments"]}

    domain_rows: list[dict[str, Any]] = []
    for case in DOMAIN_CASES:
        did = case["domain_id"]
        assessment = route_assessments[did]
        source_records = source_records_for_domain(did, semantic, coverage, central)
        if not source_records:
            raise AssertionError(f"no eligible global source records for {did}")
        domain_rows.append({
            "domain_id": did,
            "domain_name": assessment["domain_name"],
            "source_route_disposition": assessment["route_disposition"],
            "active_role_count": assessment["active_role_count"],
            "active_role_keys": sorted(assessment["active_role_keys"]),
            "visible_subgroup_count": assessment["visible_subgroup_count"],
            "current_subgroup_records": copy.deepcopy(assessment["current_subgroup_records"]),
            "domain_scope": assessment["domain_scope"],
            "candidate_areas": [
                {
                    "label": label,
                    "scope": scope,
                    "area_status": "recognized_practice_or_curricular_area_internal_synthesis",
                    "is_role_or_function": False,
                }
                for label, scope in case["areas"]
            ],
            "role_function_boundary": case["boundary"],
            "disposition": case["disposition"],
            "source_records": source_records,
            "source_limit": "Global or comparative professional/curriculum sources support recognizable practice or learning boundaries. They do not prescribe this exact count, create canonical identifiers, prove role fit, or provide universal credentials/licensing.",
            "role_assignments": [],
            "canonical_change_recommended": False,
            "nigerian_context_used": False,
            "isco_membership_used_as_fit_proof": False,
            "domain_structure_snapshot": domain_structure_record(did, structure),
        })

    route_rows: list[dict[str, Any]] = []
    for key, decision in ROUTE_CASES.items():
        if key not in gate_rows:
            raise AssertionError(f"route gate missing {key}")
        gate = gate_rows[key]
        role = roles.get(key, {})
        did = key.split("|", 1)[0]
        target = route_assessments.get(did, {})
        sources = source_records_for_domain(did, semantic, coverage, central)
        role_source_refs = [ref for ref in role.get("domain_fit_review_source_refs", []) if isinstance(ref, str) and ref.startswith("http")]
        if not role_source_refs:
            role_source_refs = [ref for ref in role.get("specialization_fit_review_source_refs", []) if isinstance(ref, str) and ref.startswith("http")]
        route_rows.append({
            "role_key": key,
            "domain_id": did,
            "target_domain_name": role.get("domain_name") or target.get("domain_name"),
            "role_name": role.get("role_name") or key.split("|", 1)[1],
            "source_role": role.get("source"),
            "role_description": role.get("description"),
            "role_task_source_refs": role_source_refs,
            "gate_error": copy.deepcopy(gate.get("error", {})),
            "target_domain_current_visible_subgroup_count": target.get("visible_subgroup_count"),
            "target_domain_current_subgroup_records": copy.deepcopy(target.get("current_subgroup_records", [])),
            "proposed_area": decision["area"],
            "area_or_function_classification": decision["classification"],
            "disposition": decision["disposition"],
            "reason": decision["reason"],
            "area_status": "recognized_area_candidate" if decision["area"] else "no_top_level_area_proposed",
            "area_is_role_or_function": decision["area"] is None,
            "source_records": sources,
            "source_limit": "Role task descriptions support the parent-domain context or a possible area route; they do not prove subgroup membership by title, ISCO code or a single task phrase. The route remains non-canonical until subgroup semantics and exact task evidence are separately signed off.",
            "role_assignments": [],
            "nigerian_context_used": False,
            "isco_membership_used_as_fit_proof": False,
            "canonical_change_recommended": False,
        })

    gap_rows: list[dict[str, Any]] = []
    for gap in GAP_CASES:
        sources = source_records_for_domain(gap["domain_id"], semantic, coverage, central)
        # The current gap artifacts retain source IDs and URLs even when their
        # source objects are not in the central route assessment.
        by_id = {item["source_id"]: item for item in sources}
        for source_id in gap["source_ids"]:
            if source_id not in by_id:
                for relative in coverage.get("artifact_paths_by_domain", {}).get(gap["domain_id"], []):
                    path = ROOT / Path(relative)
                    if not path.is_file():
                        continue
                    try:
                        payload = read_json(path)
                    except (OSError, json.JSONDecodeError):
                        continue
                    for item in walk(payload):
                        if isinstance(item, dict) and item.get("source_id") == source_id:
                            normalized = normalize_source(item)
                            if normalized:
                                by_id[source_id] = normalized
                                break
                    if source_id in by_id:
                        break
        if not by_id:
            raise AssertionError(f"no eligible gap sources for {gap['candidate_key']}")
        row = copy.deepcopy(gap)
        row["domain_name"] = route_assessments.get(gap["domain_id"], {}).get("domain_name") or gap["domain_id"]
        row["source_records"] = [by_id[key] for key in sorted(by_id) if key in gap["source_ids"]] or sorted(by_id.values(), key=lambda item: item["source_id"])
        row["canonical_change_recommended"] = False
        row["nigerian_context_used"] = False
        row["isco_membership_used_as_fit_proof"] = False
        gap_rows.append(row)

    domain_ids = [row["domain_id"] for row in domain_rows]
    supported_domain_ids = [row["domain_id"] for row in domain_rows if row["disposition"] != "supported_candidate_set_role_enrichment_hold"]
    route_counts: dict[str, int] = {}
    for row in route_rows:
        route_counts[row["disposition"]] = route_counts.get(row["disposition"], 0) + 1
    return {
        "schema_version": "2026-10-06.global-area-subgroup-reconciliation.v1",
        "register_kind": "append_only_audit_register",
        "scope": "Global authoritative/professional evidence reconciliation only. No Nigerian-only evidence is used as fit proof; no ISCO membership is used as area or role fit proof; no canonical taxonomy, role library or seed file is edited.",
        "authoritative_inputs": {
            "domain_specialization_review": str(DOMAIN_REVIEW.relative_to(ROOT)),
            "role_to_subgroup_semantic_checkpoint": str((AUDIT / "role_to_subgroup_semantic_checkpoint_2026_10_06_009.md").relative_to(ROOT)),
            "domain_structure": str(DOMAIN_STRUCTURE.relative_to(ROOT)),
            "route_gate_report": str(ROUTE_GATES.relative_to(ROOT)),
            "specialization_review_artifact_coverage": str(COVERAGE.relative_to(ROOT)),
        },
        "accounting": {
            "requested_domain_case_count": 22,
            "domain_case_count": len(domain_rows),
            "needs_supported_specialization_layer_from_checkpoint": 23,
            "prior_global_layer_completed_domain_ids": ["D001", "D002"],
            "new_domain_layer_case_ids": domain_ids,
            "new_domain_layer_case_count": len(domain_rows),
            "adjacent_D071_included_because": "D071 is the single needs_role_enrichment_before_subgroup_decision case; its specialization layer is recorded, but role enrichment remains an explicit gate.",
            "d085_d168_gap_count": len(gap_rows),
            "reclassified_route_gate_count": len(route_rows),
            "supported_candidate_layer_domain_ids": supported_domain_ids,
        },
        "domain_cases": domain_rows,
        "d085_d168_specialization_subgroup_gaps": gap_rows,
        "reclassified_target_route_cases": route_rows,
        "policy": {
            "area_vs_role": "An area of specialization is a recognizable discipline, practice or learning route supported by authoritative/professional evidence. A role/function is a task-bearing occupation or cross-cutting responsibility and does not create a subgroup by title, role count or ISCO membership.",
            "source_boundary": "International/global sources are preferred. Comparative country or institution sources may corroborate practice boundaries but do not create universal credentials, legal permissions or counts. Nigerian-only records are excluded from the source register used by this lane.",
            "canonical_boundary": "All domain areas, subgroup implications and route recommendations remain review-layer records. Canonical identifiers, role-to-subgroup links and student visibility require a later controlled correction set.",
        },
        "canonical_files_changed": [],
        "nigerian_research_performed": False,
        "isco_membership_used_as_fit_proof": False,
    }


def render_markdown(register: dict[str, Any], json_name: str, sha256: str) -> str:
    counts: dict[str, int] = {}
    for row in register["reclassified_target_route_cases"]:
        counts[row["disposition"]] = counts.get(row["disposition"], 0) + 1
    lines = [
        "# Global area-of-specialization/subgroup reconciliation checkpoint — 2026-10-06",
        "",
        "Global evidence lane only. This checkpoint records review-layer recommendations and route implications; it does not edit canonical taxonomy, role libraries or seeds.",
        "",
        "## Exact scope",
        "",
        "- Domain cases: **22**. The checkpoint had 23 `needs_supported_specialization_layer` domains; D001 and D002 were already covered by the prior global lane, and D071 is included as the adjacent role-enrichment case.",
        f"- Domain IDs: `{', '.join(register['accounting']['new_domain_layer_case_ids'])}`.",
        "- D085–D168 specialization/subgroup gaps: **2** — D111 textile industrial engineering and D122 blood-bank/transfusion practice.",
        "- Reclassified target route gates: **19**.",
        "- Canonical files changed: **none**.",
        "- Nigerian-only evidence used as fit proof: **no**. ISCO membership used as fit proof: **no**.",
        "",
        "## Domain specialization layers",
        "",
        "Each candidate below is an area/practice or learning route supported by global or comparative professional/curriculum evidence. The exact count and labels remain an internal synthesis until a later canonical review. Roles remain unassigned.",
        "",
        "| Domain | Areas | Current visible subgroups | Disposition |",
        "|---|---:|---:|---|",
    ]
    for row in register["domain_cases"]:
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {len(row['candidate_areas'])} | {row['visible_subgroup_count']} | `{row['disposition']}` |")
    lines += ["", "### Boundary rules", ""]
    for row in register["domain_cases"]:
        lines += [f"#### {row['domain_id']} — {row['domain_name']}", "", f"**Disposition:** `{row['disposition']}`.", "", "**Candidate areas:**", ""]
        for area in row["candidate_areas"]:
            lines.append(f"- **{area['label']}** — {area['scope']} (`{area['area_status']}`; role/function: no).")
        lines += ["", f"**Role/function and parent boundary:** {row['role_function_boundary']}", "", f"**Exact role implication:** {len(row['active_role_keys'])} active role keys remain unassigned to these areas; the current student route remains gated until a later semantic correction.", ""]
        lines.append(f"**Global evidence records:** {len(row['source_records'])}; limits: {row['source_limit']}")
        lines.append("")

    lines += ["## D085–D168 specialization/subgroup gaps", "", "| Candidate | Area decision | Role decision | Disposition |", "|---|---|---|---|"]
    for row in register["d085_d168_specialization_subgroup_gaps"]:
        lines.append(f"| `{row['candidate_key']}` | {row['area_implication']['label']} — `{row['area_implication']['status']}` | {row['role_implication']} | `{row['disposition']}` |")
    lines += ["", "The D111 case remains an inactive role/function and conditional parent-boundary issue. The D122 case establishes a supported discipline area candidate, while the role itself still needs task and authorization review.", ""]

    lines += ["## Reclassified target route gates", "", "The following 19 exact role keys are evaluated independently of the target domain's candidate area set. A supported area candidate does not automatically sign off the role.", "", "| Role key | Proposed area | Classification | Disposition |", "|---|---|---|---|"]
    for row in register["reclassified_target_route_cases"]:
        lines.append(f"| `{row['role_key']}` | {row['proposed_area'] or 'none'} | `{row['area_or_function_classification']}` | `{row['disposition']}` |")
    lines += ["", "### Route findings", ""]
    for row in register["reclassified_target_route_cases"]:
        lines += [f"#### {row['role_key']}", "", f"**Target:** {row['target_domain_name']} · gate `{row['gate_error'].get('error')}` for ISCO `{row['gate_error'].get('isco_group')}`.", "", f"**Assessment:** {row['reason']}", "", f"**Role description:** {row['role_description'] or 'Not captured in the protected role record.'}", "", f"**Evidence limit:** {row['source_limit']}", ""]
    lines += ["## Route disposition counts", ""]
    for key, value in sorted(counts.items()):
        lines.append(f"- `{key}`: **{value}**")
    lines += [
        "",
        "## Evidence and limits",
        "",
        "- The builder reads the named authoritative checkpoints, current domain structure, current route-gate report and existing review artifacts. It filters source records containing Nigeria/Nigerian or known Nigerian-only hosts from this global register.",
        "- Global professional standards, curriculum frameworks and international technical sources establish recognizable practice boundaries. They do not establish a universal subgroup count, licensing rule or role fit.",
        "- O*NET/ESCO task descriptions may support what a role does; they are role evidence, not specialization evidence. ISCO codes are retained only as gate metadata.",
        "- No route was promoted to student-visible output and no role-to-specialization assignment was made.",
        "",
        "## Reproduction",
        "",
        "```powershell",
        "python data/career-mapping/_audit/specialization_lanes_2026_10_05/GLOBAL_AREA_SUBGROUP_RECONCILIATION_2026_10_06/build_global_area_subgroup_reconciliation_2026_10_06.py",
        "python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/GLOBAL_AREA_SUBGROUP_RECONCILIATION_2026_10_06/test_global_area_subgroup_reconciliation_2026_10_06.py",
        "```",
        "",
        f"Register: `{json_name}` · SHA-256: `{sha256}`",
    ]
    return "\n".join(lines) + "\n"


def write_outputs(register: dict[str, Any]) -> dict[str, str]:
    run_number = 1
    while True:
        suffix = "" if run_number == 1 else f"_{run_number:03d}"
        json_path = HERE / f"global_area_subgroup_reconciliation_register_2026_10_06{suffix}.json"
        md_path = HERE / f"GLOBAL_AREA_SUBGROUP_RECONCILIATION_CHECKPOINT_2026_10_06{suffix}.md"
        if not json_path.exists() and not md_path.exists():
            break
        run_number += 1
    json_bytes = (json.dumps(register, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    digest = hashlib.sha256(json_bytes).hexdigest()
    json_path.write_bytes(json_bytes)
    md_path.write_text(render_markdown(register, json_path.name, digest), encoding="utf-8")
    return {"json": json_path.as_posix(), "markdown": md_path.as_posix(), "sha256": digest}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="rebuild in memory and compare existing outputs")
    args = parser.parse_args()
    register = build_register()
    if args.check:
        json_files = sorted(HERE.glob("global_area_subgroup_reconciliation_register_2026_10_06*.json"), key=lambda path: path.stat().st_mtime_ns)
        if not json_files:
            raise FileNotFoundError("no append-only subgroup reconciliation snapshot exists")
        json_path = json_files[-1]
        suffix = json_path.name.removeprefix("global_area_subgroup_reconciliation_register_2026_10_06").removesuffix(".json")
        md_path = HERE / f"GLOBAL_AREA_SUBGROUP_RECONCILIATION_CHECKPOINT_2026_10_06{suffix}.md"
        expected_json = json.dumps(register, ensure_ascii=False, indent=2) + "\n"
        digest = hashlib.sha256(expected_json.encode("utf-8")).hexdigest()
        expected_md = render_markdown(register, json_path.name, digest)
        assert json_path.read_text(encoding="utf-8") == expected_json
        assert md_path.read_text(encoding="utf-8") == expected_md
        print(json.dumps({"check": "passed", "sha256": digest}, indent=2))
        return
    print(json.dumps(write_outputs(register), indent=2))


if __name__ == "__main__":
    main()
