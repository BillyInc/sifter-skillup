"""Reconcile contradictory global specialization candidate artifacts.

This is an audit-only reader. It does not modify canonical taxonomy data.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data/career-mapping/_audit"
COVERAGE = AUDIT / "specialization_review_artifact_coverage_2026_10_06.json"
CENTRAL = AUDIT / "domain_specialization_review_2026_10_03.json"
LOCAL_D053_D056 = (
    AUDIT
    / "specialization_lanes_2026_10_05/D003_D084/"
    "D053_D056_global_specialization_review_2026_10_06.json"
)

CANDIDATE_KEYS = {
    "specializations",
    "candidate_areas",
    "candidate_specializations",
    "proposed_specializations",
}

# These are reconciliations of conflicting names/counts from older and newer
# review artifacts. They remain recommendations, not canonical writes.
DISPOSITIONS: dict[str, dict[str, Any]] = {
    "D098": {
        "decision": "four_area_internal_recommendation; metrology_card_boundary_remains_open",
        "recommendation": [
            "Precision Machining and Toolmaking",
            "Precision Instruments and Optical Devices",
            "Dimensional Metrology and Measurement Systems",
            "Horology (Clock and Watchmaking)",
        ],
        "candidate_boundaries": [
            "Precision part/component manufacture plus production tooling; keep machine types nested.",
            "Precision measuring and optical device design, assembly, testing, calibration or repair.",
            "Measurement systems, calibration, uncertainty and traceability; not generic inspection/QA.",
            "Timepiece making, servicing and repair, explicitly named in the parent description.",
        ],
        "parent_fit": "All four are technical practice/learning areas within the stated precision-components-and-instruments scope; generic product inspection is excluded. The broad inspector role boundary remains separate.",
        "unresolved": ["Whether dimensional metrology warrants its own learner-facing card rather than being a shared method across the other three routes."],
        "source_ids": ["WORLDSKILLS_CNC_TURNING_2024", "WORLDSKILLS_CNC_MILLING_2024", "NIST_DIMENSIONAL_METROLOGY", "TOKYO_PRECISION_ENGINEERING_CURRICULUM"],
    },
    "D118": {
        "decision": "three_area_internal_recommendation; refine_names_and_narrow_landscape_claim",
        "recommendation": ["Crop Production", "Crop Protection and Plant Health", "Horticultural and Nursery Production"],
        "candidate_boundaries": [
            "Food and field crop cultivation and production systems.",
            "Cross-crop pest, disease, plant-health and phytosanitary practice.",
            "Fruit, vegetable, garden-plant and nursery production; exclude landscape-service management unless parent scope expands.",
        ],
        "parent_fit": "Crop growing, plant protection, horticulture and nursery production fit the root description. Landscape design/contracting is not established by the current parent scope and is excluded from the label.",
        "unresolved": [],
        "source_ids": ["FAO_AGRIS_CARIS_PLANT_PRODUCTION", "IPPC_CONVENTION", "FAO_HORTICULTURE_PRODUCTION_AND_AMENITY"],
    },
    "D119": {
        "decision": "five_area_internal_recommendation; correct_ruminant_label_and_limit_bee_scope",
        "recommendation": ["Poultry Production", "Ruminant Livestock and Dairy Production", "Pig and Rabbit Production", "Equine Production and Management", "Apiculture (Beekeeping)"],
        "candidate_boundaries": [
            "Poultry species and production systems.",
            "Cattle, sheep/goats and dairy-animal husbandry; exclude dairy processing.",
            "Pig and rabbit production and husbandry.",
            "Equine breeding and animal management.",
            "Bee keeping and hive/colony production; do not imply all insect farming.",
        ],
        "parent_fit": "The parent description explicitly includes cattle, poultry, sheep, horses, bees and dairies. Keep dairy animal production distinct from dairy processing; do not broaden beekeeping to all insect farming without evidence.",
        "unresolved": [],
        "source_ids": ["FAO_GLOBAL_FARMER_FIELD_SCHOOL_LIVESTOCK", "FAO_GLOBAL_LIVESTOCK_PRODUCTION_SYSTEMS", "WOAH_TERRESTRIAL_ANIMAL_HEALTH_CODE"],
    },
    "D120": {
        "decision": "three_area_internal_recommendation; remove_postharvest_from_this_parent",
        "recommendation": ["Aquaculture Production and Systems", "Capture Fisheries and Aquatic-Resource Management", "Aquatic Animal Health and Biosecurity"],
        "candidate_boundaries": [
            "Farmed aquatic stock, hatchery/rearing systems and production operations.",
            "Wild capture, fisheries governance, stocks, ecosystems and aquatic-resource stewardship.",
            "Disease prevention, surveillance, aquatic veterinary/diagnostic practice and biosecurity across production contexts.",
        ],
        "parent_fit": "The checked parent description covers capture fisheries, aquatic-stock farming, hatcheries, fish health and harvest. Post-harvest processing/value chains are important adjacent work but fall outside this stated parent boundary; extension, economics, feed and nutrition remain topics unless distinct routes are established.",
        "unresolved": [],
        "source_ids": ["FAO_CODE_OF_CONDUCT_RESPONSIBLE_FISHERIES", "FAO_GLOBAL_AQUATIC_VALUE_CHAINS", "WOAH_AQUATIC_ANIMAL_HEALTH"],
    },
    "D121": {
        "decision": "five_area_internal_recommendation; separate_forest_operations_from_products",
        "recommendation": ["Forest Ecology, Wildlife and Conservation", "Silviculture, Regeneration and Restoration", "Forest Management, Inventory and Planning", "Forest Operations and Engineering", "Forest Products and Utilization"],
        "candidate_boundaries": [
            "Forest/wildlife ecology, biodiversity and conservation foundations; whether wildlife warrants its own route remains open.",
            "Stand establishment, regeneration, silvicultural treatment and restoration.",
            "Forest resource measurement, inventory, management planning and allocation.",
            "Forest engineering, harvesting, access and field operations.",
            "Wood/non-wood forest product processing, properties, preservation and utilization.",
        ],
        "parent_fit": "The parent explicitly combines forestry and wildlife. The synthesis preserves their shared ecology/conservation foundation, while separating silvicultural treatment, planning/inventory, field operations/engineering and product utilization because these have distinct learning outputs.",
        "unresolved": ["The five-area count is an internal minimum synthesis, not a universal forestry specialization standard; verify whether wildlife warrants a stand-alone route after role-task boundary work."],
        "source_ids": ["FAO_FORESTRY_CURRICULUM_ANNEX_V", "FAO_FORESTRY_EDUCATION_NEW_TRENDS", "FAO_SILVICULTURE_NATURAL_FORESTS"],
    },
    "D122": {
        "decision": "six_area_internal_recommendation; retain_immunology_as_distinct_candidate",
        "recommendation": ["Clinical Chemistry, Endocrinology and Toxicology", "Hematology, Hemostasis and Transfusion Science", "Medical Microbiology and Infectious Disease Diagnostics", "Immunology and Serology", "Histopathology and Cytology", "Molecular Diagnostics and Medical Genetics"],
        "candidate_boundaries": [
            "Clinical chemistry testing, including endocrine/toxicology assays where the laboratory route shares this base.",
            "Blood-cell/coagulation testing, hematologic disorders and transfusion services.",
            "Microbial, parasitic and infectious-disease testing and identification.",
            "Immune-function and serologic testing; kept separate from microbiology pending cross-region route comparison.",
            "Tissue/cell morphology, histopathology and cytology.",
            "Nucleic-acid and molecular diagnostic methods plus medical genetics.",
        ],
        "parent_fit": "All candidates are laboratory diagnostic disciplines within the medical-laboratory parent. Do not infer identical scope of practice or authorization across jurisdictions.",
        "unresolved": ["IFBLS provides global core competencies but does not prescribe specialty-card counts; six is a learner-facing synthesis. Immunology's distinct route should be checked against cross-region programme curricula before external sign-off."],
        "source_ids": ["IFBLS_CORE_COMPETENCE_2022", "ASCLS_SCOPE_OF_PRACTICE", "ASCLS_DCLS_BODY_OF_KNOWLEDGE"],
    },
    "D123": {
        "decision": "six_diagnostic_imaging_areas; radiation_therapy_parent_scope_conflict_open",
        "recommendation": ["Diagnostic Radiography and Fluoroscopy", "Computed Tomography (CT)", "Magnetic Resonance Imaging (MRI)", "Medical Ultrasound", "Nuclear Medicine Imaging", "Mammography and Breast Imaging"],
        "candidate_boundaries": [
            "Projection radiography and fluoroscopic diagnostic/interventional imaging.",
            "Cross-sectional X-ray computed imaging.",
            "Magnetic-resonance diagnostic imaging.",
            "Diagnostic sonography/ultrasound imaging.",
            "Radionuclide diagnostic imaging; not therapeutic radiopharmaceutical treatment as a generic imaging task.",
            "Breast imaging and mammography; potentially nested under broader diagnostic imaging in some systems.",
        ],
        "parent_fit": "These six are diagnostic-imaging routes. Radiotherapy/dosimetry is therapeutic, not an imaging specialization; the current domain description includes radiation treatment and therefore needs a separate parent-scope reconciliation before canonical mapping.",
        "unresolved": ["Current parent description combines diagnostic imaging with radiation therapy; do not force radiotherapy into one of the six imaging specializations."],
        "source_ids": ["IAEA_MEDICAL_IMAGING_CURRICULUM", "ASRT_IMAGING_PRACTICE_STANDARDS", "WHO_IAEA_MEDICAL_RADIATION_SAFETY"],
    },
}

# Source records used to validate the disputed claims. Geographic limitations
# are explicit; none is presented as a universal accreditation taxonomy.
SOURCES: dict[str, dict[str, str]] = {
    "CS2023_AI_KNOWLEDGE_AREA": {"publisher": "ACM, IEEE Computer Society, and Association for the Advancement of Artificial Intelligence", "title": "Computer Science Curricula 2023: AI Knowledge Area", "url": "https://csed.acm.org/wp-content/uploads/2023/09/Version-Gamma.pdf", "locator": "AI Knowledge Area; knowledge units include machine learning, knowledge representation and reasoning, planning, agents, NLP, robotics, perception and computer vision", "claim": "Joint curriculum guidance recognizes the breadth of AI knowledge areas relevant to the D003 candidate set.", "limit": "Computing curriculum guidance, not a formal subgroup taxonomy, licensure rule, role map or prescribed five-area count."},
    "AAAI26_TECHNICAL_AREAS": {"publisher": "Association for the Advancement of Artificial Intelligence", "title": "AAAI-26 Main Technical Track and Keywords", "url": "https://aaai.org/conference/aaai/aaai-26/keywords/", "locator": "Submission groups and keywords for ML, NLP, computer vision, robotics, knowledge representation, multiagent systems, planning and reasoning", "claim": "Independent AI research-community taxonomy corroborates the candidate areas and that these fields coexist as AI technical areas.", "limit": "Conference submission taxonomy is not a curriculum/accreditation standard and does not set the product's card count or learner-route boundaries."},
    "WORLDSKILLS_CNC_TURNING_2024": {"publisher": "WorldSkills International", "title": "WorldSkills Occupational Standards: CNC Turning (2024)", "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1658/", "locator": "Occupation description and skill standard", "claim": "International benchmark for precision turning tasks and process control.", "limit": "Competition occupational standard; not a universal learner taxonomy."},
    "WORLDSKILLS_CNC_MILLING_2024": {"publisher": "WorldSkills International", "title": "WorldSkills Occupational Standards: CNC Milling (2024)", "url": "https://worldskills.org/what/projects/wsos/2024/events/579/skills/1661/", "locator": "Occupation description and skill standard", "claim": "International benchmark for precision milling, drawings and dimensional verification.", "limit": "Competition occupational standard; not a universal learner taxonomy."},
    "NIST_DIMENSIONAL_METROLOGY": {"publisher": "US National Institute of Standards and Technology", "title": "Dimensional Metrology Group", "url": "https://www.nist.gov/pml/sensor-science/dimensional-metrology", "locator": "Programme description", "claim": "Metrology is a distinct technical practice supporting measurement traceability and precision manufacturing.", "limit": "US national institute; does not set a global career taxonomy."},
    "TOKYO_PRECISION_ENGINEERING_CURRICULUM": {"publisher": "University of Tokyo", "title": "Precision Engineering curriculum", "url": "https://www.pe.t.u-tokyo.ac.jp/en/curriculum.html", "locator": "Published curriculum", "claim": "Comparative evidence for precision engineering and measurement education.", "limit": "Institution-specific curriculum; corroborative only."},
    "FAO_AGRIS_CARIS_PLANT_PRODUCTION": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "AGRIS/CARIS Categorization Scheme", "url": "https://www.fao.org/4/u1808e/U1808E01.htm", "locator": "F. Plant Science and Production; F01 Crop husbandry", "claim": "Separates crop husbandry, horticulture/gardening and plant protection subject areas.", "limit": "Subject classification, not a required student subgroup count."},
    "IPPC_CONVENTION": {"publisher": "International Plant Protection Convention", "title": "About the IPPC", "url": "https://www.ippc.int/en/about/", "locator": "Convention purpose and phytosanitary framework", "claim": "Plant-health and phytosanitary protection are distinct cross-crop functions.", "limit": "International treaty framework; not a curriculum taxonomy."},
    "FAO_HORTICULTURE_PRODUCTION_AND_AMENITY": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Introduction to horticulture", "url": "https://www.fao.org/4/x5642e/x5642e05.htm", "locator": "Horticulture structure table", "claim": "Distinguishes crop-production horticulture from amenity horticulture and landscaping.", "limit": "Technical teaching text; does not establish Sifter's exact subgroup boundaries."},
    "FAO_GLOBAL_FARMER_FIELD_SCHOOL_LIVESTOCK": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Global Farmer Field School Platform: Livestock", "url": "https://www.fao.org/farmer-field-schools/themes/livestock/en", "locator": "Livestock production-system themes", "claim": "Recognizes poultry, dairy, pigs, rabbits, equine and beekeeping systems.", "limit": "Practice overview; not a global specialization taxonomy."},
    "FAO_GLOBAL_LIVESTOCK_PRODUCTION_SYSTEMS": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Global livestock production systems", "url": "https://www.fao.org/4/i2414e/i2414e.pdf", "locator": "Global production-system typology", "claim": "Supports distinct animal production systems including cattle, small ruminants, pigs and chickens.", "limit": "Production typology; does not prescribe subgroup counts."},
    "WOAH_TERRESTRIAL_ANIMAL_HEALTH_CODE": {"publisher": "World Organisation for Animal Health", "title": "Terrestrial Animal Health Code", "url": "https://www.woah.org/fileadmin/Home/eng/Health_standards/tahc/2021/en_index.htm", "locator": "Species/system chapters", "claim": "Recognizes species- and production-system-specific animal-health contexts.", "limit": "Animal-health standards, not a learner taxonomy."},
    "FAO_CODE_OF_CONDUCT_RESPONSIBLE_FISHERIES": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Code of Conduct for Responsible Fisheries", "url": "https://www.fao.org/4/v9878e/v9878e00.htm", "locator": "Articles 7, 9 and 12", "claim": "Differentiates fisheries management, aquaculture development and fisheries research.", "limit": "International policy framework, not specialization count evidence."},
    "FAO_GLOBAL_AQUATIC_VALUE_CHAINS": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "FISH4ACP: Developing sustainable aquatic value chains", "url": "https://www.fao.org/sustainable-food-value-chains/library/detalles/es/c/1759733/", "locator": "Guide scope and value-chain methodology", "claim": "Establishes post-harvest/value-chain practice as a distinct aquatic-food sector stage.", "limit": "Evidence that it is an adjacent practice; current D120 parent scope does not include processing."},
    "WOAH_AQUATIC_ANIMAL_HEALTH": {"publisher": "World Organisation for Animal Health", "title": "Aquatic animals and health standards", "url": "https://www.woah.org/en/what-we-do/animal-health-and-welfare/aquatic-animals/", "locator": "Aquatic animal health and standards overview", "claim": "Supports aquatic animal health, biosecurity and disease surveillance as substantive practice.", "limit": "Health standard scope; not a learner taxonomy."},
    "FAO_FORESTRY_CURRICULUM_ANNEX_V": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Forestry Curriculum Development and Revision", "url": "https://www.fao.org/4/y1842e/y1842e22.htm", "locator": "Annex V and Annex VIII course/subject headings", "claim": "Separately identifies forest/wildlife ecology, silviculture, management planning/inventory, forest engineering and utilization of forest products.", "limit": "Reference curricula with regional examples; supports distinctions, not universal counts."},
    "FAO_FORESTRY_EDUCATION_NEW_TRENDS": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Forestry education: new trends and prospects", "url": "https://www.fao.org/4/ap438e/ap438e00.pdf", "locator": "Curriculum modules and specializations", "claim": "Comparative curricula distinguish silviculture, inventory, operations/products, wildlife and policy themes.", "limit": "Comparative curriculum report, not accreditation standard."},
    "FAO_SILVICULTURE_NATURAL_FORESTS": {"publisher": "Food and Agriculture Organization of the United Nations", "title": "Silviculture in natural forests", "url": "https://www.fao.org/sustainable-forest-management-toolbox/modules/silviculture-in-natural-forests/en", "locator": "Module definitions and practice scope", "claim": "Defines silviculture/regeneration and its distinct forest-management practice.", "limit": "Technical practice guidance; not a subgroup count standard."},
    "IFBLS_CORE_COMPETENCE_2022": {"publisher": "International Federation of Biomedical Laboratory Science", "title": "IFBLS Guidelines for Core Competence", "url": "https://www.ifbls.org/images/IFBLS-Core-Competence---revised-2022.pdf", "locator": "Core competence scope and limits", "claim": "Global professional framework for biomedical laboratory scientists and laboratory diagnostic-service competence.", "limit": "Explicitly non-prescriptive about tests, roles and functions; does not set specialty counts."},
    "ASCLS_SCOPE_OF_PRACTICE": {"publisher": "American Society for Clinical Laboratory Science", "title": "Scope of Practice and Personnel Standards", "url": "https://ascls.org/scope-of-practice/", "locator": "Discipline-specific expertise list", "claim": "Names microbiology, hematology, immunology, transfusion medicine, clinical chemistry, toxicology, cytology, histology and molecular diagnostics as distinct expertise areas.", "limit": "US professional source; regional corroboration only."},
    "ASCLS_DCLS_BODY_OF_KNOWLEDGE": {"publisher": "American Society for Clinical Laboratory Science", "title": "Doctor of Clinical Laboratory Science Body of Knowledge", "url": "https://ascls.org/wp-content/uploads/2022/08/DCLS_BOK_ADOPTED_20220630.pdf", "locator": "Advanced clinical laboratory science chapters", "claim": "Separately treats chemistry, hematopathology/hemostasis, immunology, microbiology, molecular diagnostics/genetics and transfusion services.", "limit": "US professional body of knowledge; corroboration, not global standard."},
    "IAEA_MEDICAL_IMAGING_CURRICULUM": {"publisher": "International Atomic Energy Agency", "title": "Postgraduate Educational Course in Radiation Protection and the Safety of Radiation Sources", "url": "https://www-pub.iaea.org/MTCD/publications/PDF/TCS-56_%28Rev.1%29web.pdf", "locator": "Medical imaging curriculum topics", "claim": "Separates radiography, mammography, CT, fluoroscopy, ultrasound, MRI, nuclear medicine and therapeutic applications in training content.", "limit": "International technical training publication; not a universal specialization taxonomy."},
    "ASRT_IMAGING_PRACTICE_STANDARDS": {"publisher": "American Society of Radiologic Technologists", "title": "Practice Standards for Medical Imaging and Radiation Therapy", "url": "https://www.asrt.org/main/standards-and-regulations/professional-practice/practice-standards-online", "locator": "Profession definition and discipline-specific standards", "claim": "Distinguishes radiography, CT, MRI, mammography, nuclear medicine, sonography and radiation therapy.", "limit": "US professional standard; corroboration only."},
    "WHO_IAEA_MEDICAL_RADIATION_SAFETY": {"publisher": "World Health Organization and International Atomic Energy Agency", "title": "Radiation Protection and Safety in Medical Uses of Ionizing Radiation", "url": "https://www.who.int/publications/m/item/radiation-protection-and-safety-in-medical-uses-of-ionizing-radiation", "locator": "Scope of medical uses", "claim": "Distinguishes diagnostic radiological procedures from therapeutic radiation uses.", "limit": "Safety guidance, not a career taxonomy."},
}

ADDITIONAL_RECONCILIATIONS: dict[str, dict[str, Any]] = {
    "D003": {
        "domain_name": "Artificial Intelligence and Machine Learning",
        "disposition": "candidate_set_reconciled_as_internal_synthesis; parent_scope_alignment_remains_a_prepublication_gate",
        "candidate_count": 5,
        "candidate_labels": [
            "Machine Learning and Generative Models",
            "Knowledge, Reasoning and Planning",
            "Natural Language and Speech AI",
            "Computer Vision and Perception",
            "Intelligent Agents and Robotics",
        ],
        "fit_finding": "The five proposed areas are within broad AI practice and each is corroborated by the joint CS2023 AI knowledge area and AAAI technical topics. The present parent description is materially narrower (learning, images, language and prediction) and omits knowledge representation/reasoning, planning, agents and robotics.",
        "count_finding": "Five is a compact internal display synthesis, not a count prescribed by either source. Cross-cutting ethics, generative model families and application sectors should not become separate top-level cards on this evidence alone.",
        "remaining_gate": "Broaden/reconcile the parent-domain definition before later canonical publication. No role-to-specialization assignments are made in this reconciliation.",
        "source_ids": ["CS2023_AI_KNOWLEDGE_AREA", "AAAI26_TECHNICAL_AREAS"],
    }
}

PROVISIONAL_DISPOSITIONS = [
    {"domain_id": "D057", "candidate_count": 3, "current_recommendation": "Keep flat for now; retain three possible learner routes only as candidates.", "open_issue": "No approved subgroup set; validate distinct learning routes before adding cards."},
    {"domain_id": "D058", "candidate_count": 0, "current_recommendation": "Keep flat.", "open_issue": "The reviewed global frameworks describe the field but do not establish a complete specialization set for this combined parent."},
    {"domain_id": "D060", "candidate_count": 3, "current_recommendation": "Three internal candidate areas.", "open_issue": "Exact count is not internationally prescribed; retain as an internal synthesis."},
    {"domain_id": "D062", "candidate_count": 2, "current_recommendation": "Two internal candidate areas after narrowing the parent boundary.", "open_issue": "Asset classes and trading styles stay nested themes, not top-level groups."},
    {"domain_id": "D063", "candidate_count": 6, "current_recommendation": "Six internal candidate areas.", "open_issue": "JEL classification categories are source evidence, not subgroup counts."},
    {"domain_id": "D064", "candidate_count": 8, "current_recommendation": "Eight broad candidate areas.", "open_issue": "Not exhaustive; cross-region titles and scope variations remain."},
    {"domain_id": "D065", "candidate_count": 6, "current_recommendation": "Six internal candidate areas.", "open_issue": "Service modes and language/content sectors remain nested unless a distinct learning route is substantiated."},
    {"domain_id": "D066", "candidate_count": 8, "current_recommendation": "Eight internal candidate areas.", "open_issue": "WOAH does not prescribe one global veterinary curriculum or specialization count."},
]


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def candidate_records(
    value: Any, domain_id: str, path: str = "", inherited_domain_id: str | None = None
) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(value, dict):
        effective_domain_id = value.get("domain_id") or inherited_domain_id
        if effective_domain_id == domain_id:
            for key, items in value.items():
                if key not in CANDIDATE_KEYS or not isinstance(items, list):
                    continue
                labels = []
                for item in items:
                    if isinstance(item, dict):
                        labels.append(
                            item.get("label")
                            or item.get("name")
                            or item.get("title")
                            or item.get("key")
                            or "<unnamed>"
                        )
                    else:
                        labels.append(str(item))
                found.append(
                    {
                        "record_path": f"{path}/{key}",
                        "labels": labels,
                        "status": value.get("review_status")
                        or value.get("status")
                        or value.get("final_reconciliation_disposition"),
                    }
                )
        for key, child in value.items():
            found.extend(
                candidate_records(
                    child, domain_id, f"{path}/{key}", effective_domain_id
                )
            )
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(
                candidate_records(
                    child, domain_id, f"{path}/{index}", inherited_domain_id
                )
            )
    return found


def discover_conflicts() -> tuple[dict[str, list[dict[str, Any]]], dict[str, Any]]:
    coverage = load_json(COVERAGE)
    all_records: dict[str, list[dict[str, Any]]] = {}
    conflicts: dict[str, list[dict[str, Any]]] = {}
    for domain_id, paths in coverage["artifact_paths_by_domain"].items():
        records = []
        seen = set()
        for raw in paths:
            path = ROOT / Path(raw.replace("\\", "/"))
            if not path.is_file():
                continue
            try:
                document = load_json(path)
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue
            for record in candidate_records(document, domain_id):
                if not record["labels"]:
                    continue
                signature = (str(path), tuple(record["labels"]))
                if signature in seen:
                    continue
                seen.add(signature)
                records.append(
                    {
                        "artifact": path.relative_to(ROOT).as_posix(),
                        **record,
                    }
                )
        all_records[domain_id] = records
        variants = {
            tuple(label.casefold().strip() for label in record["labels"])
            for record in records
        }
        if len(variants) > 1:
            conflicts[domain_id] = records
    return conflicts, {"coverage": coverage, "records": all_records}


def build_report() -> dict[str, Any]:
    conflicts, data = discover_conflicts()
    central = load_json(CENTRAL)
    local = load_json(LOCAL_D053_D056)
    central_count = len(central["domain_reviews"])
    local_domains = local["domains"]
    # Record provisional continuation cases separately from cross-artifact conflicts.
    unresolved_existing = [
        {
            "domain_id": did,
            "disposition": DISPOSITIONS[did]["decision"],
            "open_questions": DISPOSITIONS[did]["unresolved"],
        }
        for did in ("D098", "D121", "D122", "D123")
        if DISPOSITIONS[did]["unresolved"]
    ]
    residuals = discover_domain_residuals(data["coverage"])
    return {
        "schema_version": "2026-10-06.global-specialization-exception-reconciliation.v1",
        "scope": "Global specialization recommendation conflict reconciliation only; no Nigerian-specific research and no canonical writes.",
        "coverage": {
            "catalogue_domains": data["coverage"]["catalogue_domain_count"],
            "domains_with_review_artifact": data["coverage"]["domains_with_review_artifacts"],
            "candidate_artifact_domains_scanned": len(data["records"]),
            "central_register_domain_reviews": central_count,
            "local_d053_d056_records": len(local_domains),
        },
        "candidate_list_conflicts": {
            "count": len(conflicts),
            "domain_ids": sorted(conflicts),
            "domains": {
                did: {
                    "variants": records,
                    "reconciliation": DISPOSITIONS[did],
                }
                for did, records in sorted(conflicts.items())
            },
        },
        "additional_provisional_cases": {
            "d057_d058_d060_d062_d066": ["D057", "D058", "D060", "D062", "D063", "D064", "D065", "D066"],
            "d053_d056": [
                {
                    "domain_id": record["domain_id"],
                    "candidate_count": len(record["candidate_specializations"]),
                    "candidate_labels": [item["label"] for item in record["candidate_specializations"]],
                    "status": record["candidate_count_status"],
                    "next_disposition": record["next_disposition"],
                }
                for record in local_domains
            ],
            "d057_d066_detail": PROVISIONAL_DISPOSITIONS,
            "note": "These are existing provisional or parent-boundary cases, not newly discovered candidate-list conflicts. Keep them open until source and route boundaries are reconciled; do not convert artifact presence into approval.",
        },
        "open_reconciliation_questions": unresolved_existing,
        "additional_reconciliations": ADDITIONAL_RECONCILIATIONS,
        "catalogue_residual_inventory": residuals,
        "source_register": SOURCES,
        "method_and_limits": [
            "All 168 domain IDs were compared using the actual paths in the current artifact-coverage JSON. Candidate lists were extracted from central register, lane review and explicit global reconciliation records.",
            "Seven domain IDs contain materially different candidate names or counts across records. Newer lane/reconciliation records are not assumed automatically correct; each is given an explicit disposition above.",
            "The comparison detects candidate-list conflicts and records existing open decisions. It cannot prove that every undisputed domain's taxonomy is academically correct or that all referenced sources have been live-rechecked.",
            "A separate structured residual scan reads per-domain review_status and explicit remaining_review/open_questions/uncertainties fields. It does not count a recommendation as unresolved merely because it is noncanonical; source/candidate conflicts and explicit review residuals are reported separately.",
            "Where professional/curriculum authorities are regional or institutional, they are labelled corroborative only. Exact global specialization counts are not claimed as standardized.",
            "No canonical domain_structure.json, role_library_v3*.json, subgroup scripts/reports or shared register was edited.",
        ],
    }


def _records_for_domain(value: Any, domain_id: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    if isinstance(value, dict):
        if value.get("domain_id") == domain_id:
            found.append(value)
        for child in value.values():
            found.extend(_records_for_domain(child, domain_id))
    elif isinstance(value, list):
        for child in value:
            found.extend(_records_for_domain(child, domain_id))
    return found


def discover_domain_residuals(coverage: dict[str, Any]) -> dict[str, Any]:
    """Extract explicit per-domain review residuals without keyword-counting prose."""
    residual_tokens = (
        "pending", "open", "required", "need", "needed", "remaining", "remains",
        "provisional", "unresolved", "reconciliation", "refinement", "mismatch",
        "reframe", "conditional", "ambiguous", "inconsistent", "not_standardized", "not_obtained",
    )
    no_set_tokens = ("no_global_specialization_set", "no_universal_specialization_set", "no_universal_set")
    rows: list[dict[str, Any]] = []
    reason_buckets: dict[str, list[str]] = {
        "parent_scope_title_or_boundary": [],
        "role_or_cross_domain_reconciliation_dependency": [],
        "candidate_count_source_or_route_validation": [],
    }
    no_set: list[dict[str, Any]] = []
    no_primary: list[str] = []
    for domain_id, artifacts in sorted(coverage["artifact_paths_by_domain"].items()):
        candidates: list[tuple[int, str, dict[str, Any]]] = []
        for rel in artifacts:
            path = ROOT / Path(rel)
            try:
                payload = load_json(path)
            except (OSError, json.JSONDecodeError):
                continue
            for record in _records_for_domain(payload, domain_id):
                status = record.get("review_status")
                if not status:
                    continue
                if "final_reconciliation_disposition" in record:
                    continue
                name = path.name.lower()
                rank = (
                    0 if "candidate_review" in name else
                    1 if name == f"{domain_id.lower()}_specialization_review.json" else
                    2 if "global_specialization_review" in name else
                    3 if "domain_specialization_review" in name else 4
                )
                candidates.append((rank, path.relative_to(ROOT).as_posix(), record))
        if not candidates:
            no_primary.append(domain_id)
            continue
        candidates.sort(key=lambda item: (item[0], item[1]))
        _, artifact, record = candidates[0]
        status = str(record.get("review_status", ""))
        lowered = status.casefold()
        explicit_fields: dict[str, Any] = {}
        for key in (
            "remaining_review", "open_questions", "uncertainties", "parent_scope_disposition",
            "no_specialization_disposition", "external_academic_signoff",
        ):
            value = record.get(key)
            if value not in (None, "", [], {}):
                explicit_fields[key] = value
        if any(token in lowered for token in no_set_tokens):
            no_set.append({"domain_id": domain_id, "review_status": status, "artifact": artifact,
                           "decision": record.get("decision"),
                           "no_specialization_disposition": record.get("no_specialization_disposition")})
        if (any(token in lowered for token in residual_tokens)
                or record.get("remaining_review") or record.get("open_questions")):
            reconciled_here = domain_id in DISPOSITIONS and not DISPOSITIONS[domain_id]["unresolved"]
            if reconciled_here:
                continue
            if any(token in lowered for token in ("parent", "scope", "boundary", "title", "mismatch", "ambiguous", "inconsistent", "split", "refinement", "reframe")):
                reason_buckets["parent_scope_title_or_boundary"].append(domain_id)
            elif any(token in lowered for token in ("role", "cross_domain", "catalogue")):
                reason_buckets["role_or_cross_domain_reconciliation_dependency"].append(domain_id)
            else:
                reason_buckets["candidate_count_source_or_route_validation"].append(domain_id)
            rows.append({
                "domain_id": domain_id,
                "review_status": status,
                "artifact": artifact,
                "decision": record.get("decision"),
                "explicit_review_fields": explicit_fields,
            })
    # D053-D056 are represented by one grouped local-slice review whose domain
    # records are intentionally keyed differently from the other per-domain files.
    local_review = load_json(LOCAL_D053_D056)
    for record in local_review.get("domains", []):
        domain_id = record.get("domain_id")
        if domain_id and domain_id not in {row["domain_id"] for row in rows}:
            reason_buckets["parent_scope_title_or_boundary"].append(domain_id)
            rows.append({
                "domain_id": domain_id,
                "review_status": local_review.get("review_status", "provisional_review"),
                "artifact": LOCAL_D053_D056.relative_to(ROOT).as_posix(),
                "decision": record.get("next_disposition"),
                "explicit_review_fields": {"remaining_review": record.get("next_disposition")},
            })
    rows.sort(key=lambda row: row["domain_id"])
    no_primary = [did for did in no_primary if did not in {row["domain_id"] for row in rows}]
    return {
        "method": "One best per-domain review artifact, preferring current candidate review, then individual lane review, grouped D053-D056 review, then central register. Only explicit status markers or dedicated residual fields are counted; prose keyword frequency is not used.",
        "domain_records_found": len(coverage["artifact_paths_by_domain"]) - len(no_primary),
        "domains_with_explicit_residual_status_or_fields": len(rows),
        "residual_domain_ids": [row["domain_id"] for row in rows],
        "residual_reason_buckets": {
            key: {"count": len(ids), "domain_ids": sorted(ids)}
            for key, ids in reason_buckets.items()
        },
        "domains_recommending_no_universal_or_global_set": no_set,
        "domains_without_extractable_per_domain_status": no_primary,
        "domains": rows,
        "interpretation": "This is a review-work queue, not a count of confirmed taxonomy errors. Provisional internal recommendations and explicit open boundaries need reconciliation before any later implementation; no-set decisions are recorded separately. Artifact presence alone does not close a domain.",
    }


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        "# Global specialization exception reconciliation — 2026-10-06",
        "",
        "Global-only audit. This reconciles conflicting review recommendations; it does not edit canonical taxonomy or constitute external academic sign-off.",
        "",
        "## Exact coverage and findings",
        "",
        f"- Catalogue: {report['coverage']['catalogue_domains']} domains.",
        f"- Review-artifact presence: {report['coverage']['domains_with_review_artifact']}/{report['coverage']['catalogue_domains']} domains (presence is not correctness).",
        f"- Structured candidate-list conflicts: **{report['candidate_list_conflicts']['count']} domains** — {', '.join(report['candidate_list_conflicts']['domain_ids'])}.",
        f"- Domains with an explicit open/provisional/residual review status or dedicated residual field: **{report['catalogue_residual_inventory']['domains_with_explicit_residual_status_or_fields']}/168**. This is a review queue, not confirmed errors.",
        f"- Domains with a no-universal/global-set recommendation are recorded separately: **{len(report['catalogue_residual_inventory']['domains_recommending_no_universal_or_global_set'])}**.",
        "- The candidate-list scan found no other conflicting candidate arrays among the paths listed by the current 168-domain coverage manifest.",
        "- This finding is not a claim that undisputed proposals are academically approved, source-complete or canonical.",
        "",
        "## Disputed domains and reconciled recommendation",
        "",
    ]
    for did, item in report["candidate_list_conflicts"]["domains"].items():
        recon = item["reconciliation"]
        lines += [f"### {did}", "", "Competing recorded candidate sets:", ""]
        seen = set()
        for variant in item["variants"]:
            labels = tuple(variant["labels"])
            if labels in seen:
                continue
            seen.add(labels)
            lines.append(
                f"- `{variant['artifact']}` ({variant.get('status') or 'status not recorded'}): "
                + ("; ".join(labels) if labels else "0 named areas")
                + "."
            )
        lines += [
            "",
            f"**Reconciliation:** {recon['decision']}.",
            "",
            "Recommended candidate areas:",
            "",
        ]
        lines.extend(f"- {name}" for name in recon["recommendation"])
        lines += ["", f"**Parent-domain fit:** {recon['parent_fit']}", ""]
        lines += ["**Boundary for each candidate:**", ""]
        lines.extend(f"- **{name}:** {boundary}" for name, boundary in zip(recon["recommendation"], recon["candidate_boundaries"]))
        lines.append("")
        if recon["unresolved"]:
            lines += ["**Still open:**", ""]
            lines.extend(f"- {question}" for question in recon["unresolved"])
            lines.append("")
        lines += ["**Evidence used / limits:**", ""]
        for sid in recon["source_ids"]:
            src = report["source_register"][sid]
            lines.append(
                f"- [{src['publisher']} — {src['title']}]({src['url']}) "
                f"({src['locator']}): {src['claim']} Limit: {src['limit']}"
            )
        lines.append("")
    lines += ["## Additional open-domain reconciliation", ""]
    for did, item in report["additional_reconciliations"].items():
        lines += [f"### {did} — {item['domain_name']}", "",
                  f"**Disposition:** {item['disposition']}.", "",
                  f"**Candidate set ({item['candidate_count']}):** " + "; ".join(item["candidate_labels"]) + ".", "",
                  f"**Parent fit:** {item['fit_finding']}", "",
                  f"**Count / boundary:** {item['count_finding']}", "",
                  f"**Remaining gate:** {item['remaining_gate']}", "", "**Evidence:**", ""]
        for sid in item["source_ids"]:
            src = report["source_register"][sid]
            lines.append(f"- [{src['publisher']} — {src['title']}]({src['url']}) ({src['locator']}): {src['claim']} Limit: {src['limit']}")
        lines.append("")
    lines += [
        "## Existing unresolved/provisional cases retained",
        "",
        "These were already documented and are not new candidate-list conflicts. They remain open for the reasons shown; the global phase must not treat a written recommendation as canonical approval.",
        "",
        "- **D053–D056:** locally owned review slice. This lane only reads its current grouped record for catalogue accounting; the local reviewer owns candidate labels, counts and boundary decisions, and those artifacts were not edited here.",
        "- **D057, D058, D060, D062–D066:** eight previously identified provisional decisions:",
    ]
    for row in report["additional_provisional_cases"]["d057_d066_detail"]:
        lines.append(f"  - {row['domain_id']} ({row['candidate_count']} candidates): {row['current_recommendation']} Open: {row['open_issue']}")
    lines += [
        "- **D053–D056:** exact labels/counts are maintained by the local owner; see that review artifact rather than duplicating potentially changing values here.",
    ]
    lines += [
        "- **D098:** four-area recommendation, but standalone metrology remains an explicit boundary question.",
        "- **D121:** five-area synthesis remains internal; whether wildlife needs a separate learning route remains open.",
        "- **D122:** six-area synthesis is internal; IFBLS supplies global core competence, not a prescribed specialty count; compare cross-region curricula before external sign-off.",
        "- **D123:** radiotherapy is outside the six diagnostic-imaging areas, while the current parent description still includes it. Parent scope requires a separate resolution.",
        "",
        "## Catalogue-wide explicit residual queue",
        "",
        "The seven candidate-list conflicts above are not the entire unfinished audit. This structured queue reports the best current per-domain review status and any dedicated residual fields across the 168 IDs. A status such as ‘provisional’ means the recommendation is not treated as final; it does not mean the currently stored taxonomy has been changed.",
        "",
    ]
    for key, bucket in report["catalogue_residual_inventory"]["residual_reason_buckets"].items():
        lines.append(f"- **{key.replace('_', ' ')}:** {bucket['count']} domains — {', '.join(bucket['domain_ids'])}.")
    lines.append("")
    for row in report["catalogue_residual_inventory"]["domains"]:
        lines.append(f"- **{row['domain_id']}** — `{row['review_status']}` ({row['artifact']}).")
        for key in ("remaining_review", "open_questions", "uncertainties", "parent_scope_disposition", "no_specialization_disposition"):
            value = row["explicit_review_fields"].get(key)
            if value:
                rendered = "; ".join(str(item) for item in value) if isinstance(value, list) else str(value)
                lines.append(f"  - {key}: {rendered}")
    lines += [
        "## Method, limits and next checkpoint",
        "",
        "- The script scans the actual per-domain artifact paths in `specialization_review_artifact_coverage_2026_10_06.json`, including central register, lane reviews and explicit reconciliation records. Candidate labels are compared case-insensitively and in order; counts follow list lengths.",
        "- The residual queue is extracted from explicit structured status/residual fields and prioritizes domain-specific reviews over grouped/central records. It is an evidence-backed work queue, not a judgment that every listed domain contains an error.",
        "- D118–D123 claims were checked against primary global or international sources where available. US professional standards and institution-specific curricula are explicitly only corroborative. The rest of the 135 URLs carried forward in the earlier 31-domain checkpoint have not all been live-rechecked.",
        "- No Nigerian-specific search was made. No canonical `domain_structure.json`, `role_library_v3*.json`, subgroup script/report or shared register was edited. No role was assigned to a specialization.",
        "- Next: continue source/parent-boundary adjudication on D053–D056 and the retained provisional set; recheck source locators for carried-forward recommendations; then rerun this extractor and tests. Do not implement before the full global pass and the separately requested Nigerian-context pass.",
        "",
        "## Reproduction",
        "",
        "```powershell",
        "python data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/audit_global_specialization_exception_reconciliation_2026_10_06.py",
        "python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/test_global_specialization_exception_reconciliation_2026_10_06.py",
        "```",
        "",
    ]
    return "\n".join(lines)


if __name__ == "__main__":
    report = build_report()
    json_out = Path(__file__).with_name("GLOBAL_SPECIALIZATION_EXCEPTION_RECONCILIATION_2026_10_06.json")
    md_out = json_out.with_suffix(".md")
    json_out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_out.write_text(render_markdown(report), encoding="utf-8")
    print(json.dumps({"json": str(json_out), "markdown": str(md_out), "conflict_count": report["candidate_list_conflicts"]["count"], "domain_ids": report["candidate_list_conflicts"]["domain_ids"]}, indent=2))
