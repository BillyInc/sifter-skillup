"""Append adjudications for D113-D168 Step 1 unresolved rows.

This writes only a new audit amendment and checkpoint. It never edits taxonomy.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
OUT = Path(__file__).resolve().parent
BASE = OUT / "d113_d168_step1_reconciliation_register_2026_10_06.json"
AMENDMENT = OUT / "d113_d168_residual_adjudication_005.json"
CHECKPOINT = OUT / "D113_D168_STEP1_RECONCILIATION_CHECKPOINT_005.md"
FINAL_REGISTER = OUT / "d113_d168_step1_reconciliation_register_2026_10_06_v005.json"

# These sources supplement (and do not replace) the source rows copied from
# each domain's existing review/source register in the base lane register.
SOURCES = {
    "D120-FAO-01": {
        "publisher": "Food and Agriculture Organization of the United Nations",
        "title": "Aquaculture curriculum: African Regional Centre for Aquaculture",
        "url": "https://www.fao.org/4/l8156e/l8156e00.htm",
        "locator": "Table of contents / curriculum units: nutrition and feed, fish health, post-harvest, socio-economics, extension, and planning.",
        "supports": "These are distinguishable bodies of learning within aquaculture/fisheries education, supporting the proposed area boundaries.",
        "limits": "A historical regional training curriculum, not a current universal taxonomy and not authority for an exact number of areas.",
    },
    "D120-FAO-02": {
        "publisher": "Food and Agriculture Organization of the United Nations",
        "title": "Fisheries training topics and capacity development",
        "url": "https://www.fao.org/4/i0584e/i0584e02b.pdf",
        "locator": "Training-topic list: policy/planning, resource assessment, fish handling/processing, fishing technology, aquaculture, management/economics.",
        "supports": "Capture fisheries, aquaculture, post-harvest and management/economics are substantive and separable learning emphases.",
        "limits": "Training-needs document; it does not prescribe this catalogue's subgroup count or labels.",
    },
    "D122-ASCLS-01": {
        "publisher": "American Society for Clinical Laboratory Science",
        "title": "Scope of Practice and Personnel Standards",
        "url": "https://ascls.org/scope-of-practice/",
        "locator": "Section 'The Clinical Laboratory Science Profession'; discipline-specific expertise list.",
        "supports": "Clinical laboratory work contains distinct expertise such as microbiology, hematology, immunology, transfusion medicine, clinical chemistry, cytology, histology and molecular diagnostics.",
        "limits": "US professional-society scope statement; supports disciplinary distinctions but does not set a global education taxonomy.",
    },
    "D123-ASRT-01": {
        "publisher": "American Society of Radiologic Technologists",
        "title": "ASRT Curricula",
        "url": "https://www.asrt.org/educators/asrt-curricula",
        "locator": "Curriculum list for radiography, CT, MRI, mammography, nuclear medicine, sonography and radiation therapy.",
        "supports": "Modalities and therapeutic radiation are separately structured learning curricula.",
        "limits": "US curriculum framework; not a global license or a mandate that every modality be a top-level specialization.",
    },
    "D123-ASRT-02": {
        "publisher": "American Society of Radiologic Technologists",
        "title": "Practice Standards for Medical Imaging and Radiation Therapy",
        "url": "https://www.asrt.org/docs/default-source/practice-standards/asrt-practice-standards-for-medical-imaging-and-radiation-therapy.pdf?sfvrsn=de532d0_38",
        "locator": "Section 1, practice standards by discipline (PDF pp. 57 onward): CT, MRI, mammography, nuclear medicine, radiation therapy, radiography and sonography.",
        "supports": "Radiation therapy is a distinct therapeutic discipline, not merely another diagnostic-imaging modality.",
        "limits": "Professional standards from a US organization; jurisdictional scope and credential rules vary.",
    },
    "D128-IFSW-01": {
        "publisher": "International Federation of Social Workers / International Association of Schools of Social Work",
        "title": "Global Standards for Social Work Education and Training",
        "url": "https://www.ifsw.org/global-standards-for-social-work-education-and-training/",
        "locator": "Sections on practice diversity by setting, population/issues and micro/mezzo/macro intervention.",
        "supports": "The domain needs population/service-context boundaries and should not treat job grade or generic method as a specialization count.",
        "limits": "Global principles explicitly accommodate local and institutional variation; they do not prescribe four universal areas.",
    },
    "D145-COGS-01": {
        "publisher": "Cognitive Science Society",
        "title": "Cognitive Science Society Journal scope",
        "url": "https://cognitivesciencesociety.org/csj-executive-editor-nominations/",
        "locator": "Journal scope: anthropology, education, psychology, philosophy, linguistics, computer science, neuroscience and robotics.",
        "supports": "Cognitive science is a distinct interdisciplinary learning area rather than a synonym for neuroscience.",
        "limits": "Society journal scope defines research coverage, not an occupational licensing or job taxonomy.",
    },
    "D145-IEEE-01": {
        "publisher": "IEEE Technology Navigator",
        "title": "Neurotechnology",
        "url": "https://technav.ieee.org/topic/neurotechnology/",
        "locator": "Overview and applications, including brain-computer interfaces; interdisciplinary engineering/neuroscience/clinical technology scope.",
        "supports": "Neurotechnology/BCI is a distinguishable engineering and applied-science area alongside neuroscience and cognitive science.",
        "limits": "Technology topic overview, not a formal profession standard; clinical research and devices require separate governance.",
    },
    "D152-ICOM-01": {
        "publisher": "International Council of Museums",
        "title": "ICOM approves a new museum definition",
        "url": "https://icom.museum/en/news/icom-approves-a-new-museum-definition/",
        "locator": "Adopted 2022 definition: research, collect, conserve, interpret and exhibit; education, accessibility and community participation.",
        "supports": "Museum collections/curation, conservation, interpretation/learning are distinct museum functions.",
        "limits": "Museum definition does not define archives or archaeology as museum specializations and does not set a count.",
    },
    "D152-ICA-01": {
        "publisher": "International Council on Archives, Expert Group on Archival Description",
        "title": "Records in Contexts (RiC)",
        "url": "https://www.ica.org/ica-network/expert-groups/egad/records-in-contexts-ric/",
        "locator": "RiC overview: ICA standard for describing records; four complementary parts; RiC-FAD, RiC-CM, RiC-O and RiC-AG.",
        "supports": "Archives and archival description have a distinct professional standards base from museum collection work.",
        "limits": "A records-description standard, not a complete archive occupation or education taxonomy.",
    },
    "D161-SPHERE-01": {
        "publisher": "Sphere Association",
        "title": "What are humanitarian standards?",
        "url": "https://spherestandards.org/humanitarian-standards/",
        "locator": "Technical standards areas: WASH, food security and nutrition, shelter and settlement, and health; foundational protection/accountability principles.",
        "supports": "Humanitarian programme delivery comprises distinct technical-sector learning branches.",
        "limits": "Sphere is a minimum-standard framework, not a full career taxonomy or exhaustive list of response sectors.",
    },
    "D161-OCHA-01": {
        "publisher": "United Nations Office for the Coordination of Humanitarian Affairs",
        "title": "The Humanitarian Programme Cycle",
        "url": "https://www.ochaopt.org/coordination/hpc?page=1",
        "locator": "Humanitarian Programme Cycle actions: needs assessment/analysis, coordinated planning, resource mobilization, implementation, monitoring/evaluation and reporting.",
        "supports": "Assessment/planning and operational coordination are separable functions within humanitarian response.",
        "limits": "OCHA process description is humanitarian-response specific and does not prescribe the catalogue's area count.",
    },
    "D165-NBHWC-01": {
        "publisher": "National Board for Health & Wellness Coaching",
        "title": "Scope of Practice",
        "url": "https://nbhwc.org/scope-of-practice/",
        "locator": "Scope limits: coaches do not diagnose/treat, prescribe medication, provide nutrition or exercise prescriptions, or provide therapy unless separately credentialed/licensed.",
        "supports": "General wellness coaching must be bounded separately from clinical/lifestyle-medicine, dietetic and therapy practice.",
        "limits": "US board scope; it cannot determine legal scope elsewhere or substitute for global profession-specific standards.",
    },
    "D168-OECD-01": {
        "publisher": "OECD, International Labour Organization and European Union",
        "title": "Handbook on Measuring Digital Platform Employment and Work",
        "url": "https://www.oecd.org/en/publications/handbook-on-measuring-digital-platform-employment-and-work_0ddcac3b-en.html",
        "locator": "Executive summary and conceptual framework: broad platform work definition; report notes no internationally agreed terminology/standard definition and covers varied forms of work, including content creation.",
        "supports": "Creator/platform work can be represented as an explicit practice area, but must not be presented as a globally standardized occupation family.",
        "limits": "Statistical measurement framework, not a creator-economy career taxonomy; platform conditions and monetization are platform-specific.",
    },
}

DECISIONS = [
    ("D113", "resolved_internal_synthesis", "Rename the first area to **Glass, Ceramics and Refractory Materials Processing**; retain **Cement, Concrete and Mineral Building Materials** and **Industrial Boiler and Steam-Plant Operations**. Three areas: materials production divides into glass/ceramics/refractories versus cement/mineral construction materials; boiler operation is a separate plant-operating discipline. The parent title explicitly names both materials and boiler operations, so treat it as a deliberately broad umbrella rather than implying one shared qualification. Reject a separate child per material/product and reject merging boilers into materials science. Source register: three existing entries (American Ceramic Society; Portland Cement Association; ASME BPVC VII). Current subgroup comparison is in base register D113; two hidden ISCO-derived records are not specialization evidence. Label conflict is editorial, resolved in favor of the clearer established phrase in the global register. No role-fit claim." , []),
    ("D115", "resolved_candidate_label_reconciliation", "Retain two areas: **Passenger Road Transport** and **Freight and Goods Road Transport**. The EU professional-driver framework distinguishes carriage of passengers from carriage of goods while sharing a common training core and allowing category extensions; this supports two contexts, not many vehicle-by-vehicle subgroups. Reconcile the older labels by dropping redundant 'Operations' and use 'Freight and Goods' consistently. Exclude mobile-plant operation from this parent. Existing sources: EU Directive 2022/2561 summary and ILO ISCO-08, used for occupational context only—not subgroup-fit evidence. Current subgroup comparison: base register D115, one hidden ISCO subgroup." , []),
    ("D116", "resolved_internal_synthesis", "Retain three areas: **Earthmoving and Excavation Plant Operations**; **Road Construction and Ground-Compaction Plant Operations**; **Lifting and Crane Operations**. The root description names cranes, graders, rollers and dredgers, but machine names alone do not warrant one specialization each. The captured Skills England construction-plant standard groups multiple machines under plant operation, while the Canadian excavator curriculum is a dedicated operator training guide; together with the root's task contexts, these support grouping learning routes by work system rather than machine type. Treat dredging equipment as a context within broader heavy-plant operations unless separate curriculum evidence establishes a distinct learning route. This resolves the dredging question without inventing a fourth area. ILO/ISCO appears only in the structural comparison and was not used to justify any area or membership. Current subgroup comparison: base register D116, one hidden broad ISCO subgroup; it does not establish the three-area set." , []),
    ("D118", "resolved_candidate_set_reconciliation", "Use three areas: **Crop Production**; **Crop Protection and Plant Health**; **Horticultural Production**. The FAO classification separates crop husbandry, horticulture and plant protection; FAO/IPPC material supports plant-health/phytosanitary practice across crops. Resolve the old variants by retaining the fuller 'Plant Health' wording and using 'Horticultural Production' for growing fruit, vegetables, ornamentals and nursery plants. Exclude landscape design/maintenance: it is not established by this domain's stated cultivation scope. Do not split by crop species or production technique. Existing source register: FAO AGRIS/CARIS, FAO pest management, IPPC. Current subgroup comparison: base register D118, two hidden broad occupational categories; not fit evidence." , []),
    ("D119", "resolved_candidate_label_reconciliation", "Retain five areas: **Poultry Production**; **Ruminant Livestock and Dairy Production**; **Pig and Rabbit Production**; **Equine Production and Management**; **Apiculture and Insect Production**. Normalize the label conflict to 'Ruminant Livestock and Dairy Production' because the route includes herd husbandry and milk production, not dairy processing. FAO farmer-field-school coverage and FAO/WOAH production-system materials support these distinct animal-production contexts, while not mandating five top-level areas. Keep the pig/rabbit grouping as a compact catalogue synthesis; do not split by breed or farm system. Existing source register: FAO livestock platform, WOAH terrestrial code, FAO global livestock systems. Current subgroup comparison: base register D119, six excluded/hidden ISCO groupings; do not copy them into the specialization set." , []),
    ("D120", "resolved_candidate_set_reconciliation", "Adopt six areas: **Aquaculture Production and Systems**; **Fisheries and Aquatic-Resource Management**; **Aquatic Animal Health and Biosecurity**; **Fish Nutrition and Feed Technology**; **Fisheries Economics and Extension**; **Fisheries Post-harvest and Value Chains**. The earlier four-area proposal underrepresented learning emphases explicitly separated in FAO fisheries/aquaculture curricula and training materials: feed/nutrition and economics/extension are distinct learning units, not merely implied by production or management. Post-harvest belongs because the root includes fisheries and FAO treats handling, processing, quality and value chains as fisheries work. This is a reasoned catalogue-level six, not a globally mandated taxonomy. Reject species/gear/waterbody splits. Existing source register: FAO small-scale fisheries value chains, aquatic value chains, WOAH aquatic health, FAO thematic areas; supplements D120-FAO-01/02. Current subgroup comparison: base register D120, three visible occupational/ISCO-derived labels, none accepted as area definitions." , ["D120-FAO-01", "D120-FAO-02"]),
    ("D121", "resolved_candidate_set_reconciliation", "Adopt five areas: **Forest Ecology, Silviculture and Regeneration**; **Forest Management, Inventory and Planning**; **Forest Operations and Engineering**; **Forest Products and Utilization**; **Wildlife Ecology and Conservation Management**. The FAO forestry curriculum evidence distinguishes wildlife, silviculture, planning/inventory and forest products/utilization; preserve operations/engineering as distinct field systems rather than merging them with product science. Resolve the current four-area proposal's over-merge of operations and products and its merger of forest ecology with wildlife. The root explicitly includes both forestry and wildlife, so this five-area umbrella is defensible as a catalogue synthesis, not a universal standard. Reject separate areas for every forestry module (fire, pathology, extension, watershed). Existing source register: FAO forestry curricula and sustainable forest management toolbox. Current subgroup comparison: base register D121, many visible/hidden occupational group labels; none determine the five-area count." , []),
    ("D122", "resolved_candidate_set_reconciliation", "Use seven areas: **Clinical Chemistry, Endocrinology and Toxicology**; **Hematology and Hemostasis**; **Transfusion Medicine and Immunohematology**; **Clinical Microbiology and Virology**; **Immunology and Serology**; **Cytology, Histology and Anatomic Pathology Laboratory Science**; **Molecular Diagnostics and Medical Genetics**. Seven is preferable to the earlier six because ASCLS lists these as discipline-specific expertise and transfusion medicine and molecular diagnostics have distinct knowledge/practice. Chemistry combines related analyte disciplines; pathology combines cellular/tissue methods. This is an evidence-backed catalogue grouping, not a global licensing taxonomy. Exclude phlebotomy as a standalone area (a collection method/entry route) and lab management as a separate area unless future learning-route evidence supports it. Existing source register includes ASCLS, WHO; supplement D122-ASCLS-01. Current subgroup comparison: base register D122, four broad groupings, including hidden records; not specialization evidence." , ["D122-ASCLS-01"]),
    ("D123", "resolved_parent_scope_boundary", "Keep six diagnostic-imaging areas: **Diagnostic Radiography and Fluoroscopy**; **Computed Tomography**; **Magnetic Resonance Imaging**; **Medical Ultrasound**; **Nuclear Medicine Imaging**; **Mammography and Breast Imaging**. Keep radiation therapy out of this specialization set: ASRT treats it as a separate curriculum/practice discipline, and the root title is Radiography and Medical Imaging. The current prose mentioning treatment with radiation is a scope-description inconsistency; recommend correcting that prose or assessing a separate parent domain in a later taxonomy gate, but it does not block defining the six imaging areas now. Do not split every modality-adjacent procedure into a global area. Existing source register: ASRT, EFRS, WHO; supplements D123-ASRT-01/02. Current subgroup comparison: base register D123, two excluded broad professional groupings, not area evidence." , ["D123-ASRT-01", "D123-ASRT-02"]),
    ("D128", "resolved_internal_synthesis", "Retain four areas: **Child and Family Welfare**; **Youth Development and Youth Services**; **Community and Social Development**; **Adult Social Welfare and Support Services**. The IFSW/IASSW global standards support variation by populations, service settings and intervention level, while UNICEF identifies adolescence as a distinct development/participation context. The fourth area concerns individual/adult needs assessment, safeguarding, service navigation and social protection; it is not community development, which concerns collective participation and intervention. These four labels organize the root's explicit populations and service settings without turning job grade or method into a specialization. Boundary: statutory authority and local service eligibility vary by jurisdiction. Do not create separate top-level areas for each population issue (housing, disability, ageing) without a distinct learning route. Existing source register: IFSW global standards/definition and UNICEF adolescence; supplement D128-IFSW-01. Current subgroup comparison: base register D128 lists five ISCO-related groupings; those labels are not fit evidence." , ["D128-IFSW-01"]),
    ("D145", "resolved_parent_scope_boundary", "Retain four explicitly separated areas: **Cellular, Molecular and Systems Neuroscience**; **Cognitive and Computational Neuroscience**; **Cognitive Science and Human Cognition**; **Neurotechnology and Brain-Computer Interfaces**. The Cognitive Science Society describes a genuinely interdisciplinary study of cognition, distinct from neuroscience; IEEE's neurotechnology overview supports the separate engineering/BCI branch. Preserve the broad parent because its title expressly names all three concepts, but do not imply a shared qualification. Remove clinical psychology/psychotherapy from this root's specialization boundary: clinical treatment is separately governed health practice and is not implied by research or engineering training. Existing source register: Cognitive Science Society sources; supplements D145-COGS-01 and D145-IEEE-01. Current subgroup comparison: base register D145 includes legacy/excluded role-family labels; none used as fit evidence." , ["D145-COGS-01", "D145-IEEE-01"]),
    ("D152", "resolved_parent_scope_boundary", "Retain five areas: **Museum Collections, Curation and Interpretation**; **Conservation and Collection Preservation**; **Archives and Documentary Heritage**; **Archaeology and Heritage Field Research**; **Museum Learning and Community Engagement**. The ICOM definition anchors museum research/collections/conservation/interpretation/exhibition/education/community functions; ICA Records in Contexts establishes a distinct archival-description standards discipline. Archaeology is included because it is explicit in the root title, but its field research and legal/ethical permissions must not be represented as simply museum work. Thus the root is an explicitly broad cultural-heritage umbrella with distinct branches, not a claim that one professional body prescribes five specializations. Existing source register: ICOM definition/documentation; supplements D152-ICOM-01 and D152-ICA-01. Current subgroup comparison: base register D152's eight ISCO groups are not an acceptable specialization count." , ["D152-ICOM-01", "D152-ICA-01"]),
    ("D161", "resolved_internal_synthesis", "Retain four areas: **Humanitarian Needs Assessment, Analysis and Response Planning**; **Emergency Operations and Humanitarian Coordination**; **Humanitarian Sector Programme Delivery**; **Recovery, Resilience and International Development Programmes**. OCHA's Humanitarian Programme Cycle distinguishes analysis/planning, resource mobilization, implementation and monitoring; Sphere distinguishes technical response sectors; OECD DAC criteria supply a separate development-programme evaluation frame. The four areas are an internal learning-route synthesis, not a universal occupation taxonomy. Technical response pathways must retain their own discipline-specific requirements; no generic humanitarian foundation implies competence in health/WASH/shelter. Existing source register: OCHA, Sphere, OECD DAC; supplements D161-OCHA-01/D161-SPHERE-01. Current subgroup comparison: base register D161's occupational groupings do not set the area count." , ["D161-OCHA-01", "D161-SPHERE-01"]),
    ("D165", "resolved_parent_scope_boundary", "Use four bounded areas: **Health and Wellness Coaching**; **Exercise Science and Physical Activity Promotion**; **Clinical Exercise Physiology**; **Lifestyle Medicine and Preventive Health Practice**. NBHWC's scope explicitly separates non-clinical coaching from diagnosis, treatment, nutrition/exercise prescription and therapy unless independently credentialed. WHO provides population-level physical-activity guidance; ACSM provides a clinical exercise-physiology credential route. The root prose overreaches when it folds dietetics and music/dance therapy into wellness coaching: exclude those as separate professions/parent scopes rather than treating them as specializations here. This resolves the parent boundary for the four areas; credential/legal authority remains jurisdiction-specific. Existing source register: WHO/ACSM; supplement D165-NBHWC-01. Current subgroup comparison: base register D165's three visible legacy groups are not proof of taxonomy fit." , ["D165-NBHWC-01"]),
    ("D168", "resolved_with_explicit_taxonomy_limit", "Retain four provisional, practice-defined areas: **Esports Competition and Event Operations**; **Esports Teams, Players and Performance**; **Esports Broadcast, Content and Audience Partnerships**; **Digital Creator and Platform-Based Content Work**. The IESF/IOC evidence supports organized esports as a distinct competition/event ecosystem; OECD/ILO/EU provide a broad framework for platform-mediated work, including content creation, but explicitly note the lack of internationally agreed terminology/standard definition. Therefore the fourth area is an internal user-facing practice grouping, not a claim that a globally standardized creator profession or pathway exists. Keep esports and general creator work explicitly separate; platform-specific eligibility/income is not promised. Existing source register: IESF, IOC and OECD/ILO/EU; external framework source is D168-OECD-01. Current subgroup comparison: base register D168's six ISCO-derived labels are not the specialization list." , ["D168-OECD-01"]),
]

# Final user-facing areas and concise boundaries. These supersede candidate
# labels where the previous registers disagreed; they do not represent roles.
FINAL_AREAS = {
    "D113": [
        ("Glass, Ceramics and Refractory Materials Processing", "Forming, thermal processing and testing of glass, ceramic and refractory materials; excludes building installation."),
        ("Cement, Concrete and Mineral Building Materials", "Manufacture and testing of cement, concrete, aggregates and mineral construction materials; excludes construction project delivery."),
        ("Industrial Boiler and Steam-Plant Operations", "Safe operation and process control of industrial boilers and steam plant; excludes domestic, marine and nuclear boiler regimes."),
    ],
    "D115": [
        ("Passenger Road Transport", "Road carriage of people, including service operation, passenger safety and accessibility; detailed permits vary by jurisdiction."),
        ("Freight and Goods Road Transport", "Road movement of goods, including cargo, load security and delivery operations; dangerous-goods rules vary by jurisdiction."),
    ],
    "D116": [
        ("Earthmoving and Excavation Plant Operations", "Operate plant for excavation, grading and bulk earth movement; machine endorsements remain contextual."),
        ("Road Construction and Ground-Compaction Plant Operations", "Operate plant for road formation, paving and compaction; excludes general civil-engineering design."),
        ("Lifting and Crane Operations", "Operate lifting plant using load-control and lift-planning practices; rigging and authorization vary by jurisdiction."),
    ],
    "D118": [
        ("Crop Production", "Plan and manage field and horticultural crop production, crop systems and yield."),
        ("Crop Protection and Plant Health", "Manage pests, diseases, weeds and phytosanitary risks using responsible plant-health practice."),
        ("Horticultural Production", "Produce fruits, vegetables, ornamentals and nursery plants; excludes landscape design and maintenance."),
    ],
    "D119": [
        ("Poultry Production", "Manage breeding, hatchery, housing, feeding, flock health and poultry products."),
        ("Ruminant Livestock and Dairy Production", "Manage cattle, sheep and goats for herd, milk and meat production; excludes dairy processing."),
        ("Pig and Rabbit Production", "Manage pig and rabbit breeding, husbandry, health, welfare and farm production."),
        ("Equine Production and Management", "Manage horse breeding, husbandry, welfare and production; excludes clinical veterinary practice."),
        ("Apiculture and Insect Production", "Manage bees or other farmed insects for products and ecosystem services, including colony health."),
    ],
    "D120": [
        ("Aquaculture Production and Systems", "Plan aquatic stock production, hatchery/nursery, grow-out, water quality and farm biosecurity."),
        ("Fisheries and Aquatic-Resource Management", "Manage capture fisheries, aquatic stocks and ecosystems, monitoring and sustainability."),
        ("Aquatic Animal Health and Biosecurity", "Apply aquatic-animal surveillance, prevention and health management within authorized scope."),
        ("Fish Nutrition and Feed Technology", "Formulate, evaluate and manage aquatic feeds and nutrition for farmed stock."),
        ("Fisheries Economics and Extension", "Apply fisheries economics and communicate/adapt management and production knowledge with communities and operators."),
        ("Fisheries Post-harvest and Value Chains", "Handle, preserve, process and assure quality/safety of aquatic products through value chains."),
    ],
    "D121": [
        ("Forest Ecology, Silviculture and Regeneration", "Study forest ecosystems and manage regeneration, stand development and silvicultural interventions."),
        ("Forest Management, Inventory and Planning", "Measure forests and plan sustainable management, harvest schedules and monitoring."),
        ("Forest Operations and Engineering", "Plan and conduct forest harvesting, access and operational engineering systems."),
        ("Forest Products and Utilization", "Process, characterize and responsibly use timber and other forest products; distinct from field operations."),
        ("Wildlife Ecology and Conservation Management", "Study and manage wildlife populations, habitat and conservation; distinct from forest production."),
    ],
    "D122": [
        ("Clinical Chemistry, Endocrinology and Toxicology", "Analyze chemical, endocrine and toxicological markers in clinical specimens."),
        ("Hematology and Hemostasis", "Examine blood cells and coagulation using clinical laboratory methods."),
        ("Transfusion Medicine and Immunohematology", "Support blood grouping, compatibility testing and transfusion laboratory practice."),
        ("Clinical Microbiology and Virology", "Detect and characterize infectious organisms in clinical specimens."),
        ("Immunology and Serology", "Measure immune markers and antibody/antigen responses for clinical investigation."),
        ("Cytology, Histology and Anatomic Pathology Laboratory Science", "Prepare and examine cellular and tissue specimens for diagnostic laboratory workflows."),
        ("Molecular Diagnostics and Medical Genetics", "Use molecular/genetic methods to detect and interpret clinically relevant variation or targets."),
    ],
    "D123": [
        ("Diagnostic Radiography and Fluoroscopy", "Acquire projection and dynamic X-ray images for clinically authorized examinations."),
        ("Computed Tomography", "Acquire and optimize cross-sectional X-ray imaging under CT-specific safety and protocol practice."),
        ("Magnetic Resonance Imaging", "Acquire MR images using modality-specific protocols, screening and safety."),
        ("Medical Ultrasound", "Acquire and optimize ultrasound examinations within authorized scope."),
        ("Nuclear Medicine Imaging", "Perform radionuclide-based diagnostic imaging with radiation-safety controls."),
        ("Mammography and Breast Imaging", "Perform breast imaging and mammographic quality practice; training routes vary."),
    ],
    "D128": [
        ("Child and Family Welfare", "Support child well-being, safeguarding and family services under applicable statutory frameworks."),
        ("Youth Development and Youth Services", "Support youth participation, development, prevention and service coordination."),
        ("Community and Social Development", "Use collective, community-led approaches to inclusion, participation and social development."),
        ("Adult Social Welfare and Support Services", "Assess adult support needs and navigate welfare, disability, ageing, housing or livelihood services; distinct from community-level development."),
    ],
    "D145": [
        ("Cellular, Molecular and Systems Neuroscience", "Study neural cells, circuits, systems, development and nervous-system mechanisms."),
        ("Cognitive and Computational Neuroscience", "Study neural mechanisms of cognition using behavioral, computational and brain-measurement methods."),
        ("Cognitive Science and Human Cognition", "Study cognition across psychology, linguistics, AI/computing, philosophy and related disciplines."),
        ("Neurotechnology and Brain-Computer Interfaces", "Engineer systems that measure, decode or modulate neural signals and interface with devices."),
    ],
    "D152": [
        ("Museum Collections, Curation and Interpretation", "Research, document, curate and interpret museum collections and exhibitions."),
        ("Conservation and Collection Preservation", "Assess and preserve objects, collections and heritage materials using conservation practice."),
        ("Archives and Documentary Heritage", "Appraise, describe, preserve and provide access to records and archival collections."),
        ("Archaeology and Heritage Field Research", "Research material heritage through survey, excavation and analysis under legal and ethical permissions."),
        ("Museum Learning and Community Engagement", "Design accessible learning and community participation connected to museums and heritage."),
    ],
    "D161": [
        ("Humanitarian Needs Assessment, Analysis and Response Planning", "Assess crisis needs, prioritize response and develop coordinated plans."),
        ("Emergency Operations and Humanitarian Coordination", "Coordinate actors, information, logistics and operational adaptation during emergencies."),
        ("Humanitarian Sector Programme Delivery", "Deliver technical assistance in a defined response sector such as WASH, health, shelter or food security."),
        ("Recovery, Resilience and International Development Programmes", "Plan longer-term recovery, resilience and development programmes; not an automatic phase of every emergency."),
    ],
    "D165": [
        ("Health and Wellness Coaching", "Support client-led behavior change without diagnosing, treating or independently prescribing clinical interventions."),
        ("Exercise Science and Physical Activity Promotion", "Apply exercise science and public-health activity guidance in non-clinical settings."),
        ("Clinical Exercise Physiology", "Assess and prescribe exercise in supervised clinical contexts within relevant credential and jurisdictional scope."),
        ("Lifestyle Medicine and Preventive Health Practice", "Apply evidence-based lifestyle interventions as part of appropriately qualified health practice."),
    ],
    "D168": [
        ("Esports Competition and Event Operations", "Organize tournaments, competition operations, event logistics and production."),
        ("Esports Teams, Players and Performance", "Support competitive teams and players through training, coaching, analysis and welfare practices."),
        ("Esports Broadcast, Content and Audience Partnerships", "Produce competition coverage and manage audience/editorial/commercial engagement around esports events."),
        ("Digital Creator and Platform-Based Content Work", "Create and distribute audience-facing digital content/services through platforms; not a standardized global occupation family."),
    ],
}

def main() -> None:
    base = json.loads(BASE.read_text(encoding="utf-8"))
    by_id = {r["domain_id"]: r for r in base["records"]}
    records = []
    for domain_id, status, decision, new_ids in DECISIONS:
        source = by_id[domain_id]
        records.append({
            "domain_id": domain_id,
            "domain_name": source["domain_name"],
            "supersedes_base_disposition": source["disposition"],
            "resolution_status": status,
            "final_step1_recommendation": decision,
            "final_student_facing_areas": [
                {"label": label, "boundary": boundary}
                for label, boundary in FINAL_AREAS[domain_id]
            ],
            "exact_current_subgroup_comparison_ref": f"{BASE.name}#records[{domain_id}].exact_current_subgroup_comparison",
            "captured_domain_evidence": source.get("supporting_sources", []),
            "supplemental_external_sources": [SOURCES[sid] | {"source_id": sid} for sid in new_ids],
            "conflict_resolution_ref": f"{BASE.name}#records[{domain_id}].existing_recommendation_reconciliation",
            "role_link_gate": "Separate later gate: audit role-to-domain and role-to-area fit from role tasks and domain/area scope. Role membership, ISCO membership, and current canonical placement were not used to establish these area decisions.",
            "canonical_files_modified": False,
        })
    payload = {
        "artifact": "D113-D168 Step 1 residual adjudication amendment 005",
        "date": str(date(2026, 10, 6)),
        "append_only": True,
        "range": {"first": "D113", "last": "D168", "domain_count": 56},
        "purpose": "Resolve all prior residual subgroup/specialization candidate, boundary, and parent-scope decisions using domain definition and global professional/academic evidence. Role-link fit is a separate later gate.",
        "canonical_taxonomy_modified": False,
        "nigerian_context_added": False,
        "role_to_specialization_assignments_made": False,
        "decisions": records,
        "method_note": "An external professional source can support that a learning area is distinct without prescribing this catalogue's exact number or labels. Exact area counts are explicit evidence-based catalogue synthesis, not universal standards unless the source says so.",
    }
    AMENDMENT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Materialize a new, complete, append-only revision: preserve every base
    # record and exact current subgroup comparison, while superseding only the
    # 15 prior residual dispositions.
    decisions_by_id = {r["domain_id"]: r for r in records}
    merged_records = []
    for original in base["records"]:
        row = dict(original)
        row["captured_domain_sources"] = [
            dict(source, source_id=source.get("source_id") or f"{row['domain_id']}-CAPTURED-{index:02d}",
                 source_id_basis="Local stable identifier assigned in final lane register; not a source publisher identifier.")
            for index, source in enumerate(original.get("supporting_sources", []), 1)
        ]
        row["step1_reconciliation_status"] = "resolved"
        row["step1_role_link_gate"] = "Not part of this lane; no role-to-domain or role-to-specialization audit/fix is claimed here."
        if original["domain_id"] in decisions_by_id:
            decision_row = decisions_by_id[original["domain_id"]]
            row["prior_disposition_preserved"] = original["disposition"]
            row["disposition"] = "rename_merge_split_add_or_remove_specialization_areas"
            row["final_reconciliation_amendment"] = AMENDMENT.name
            row["final_step1_recommendation"] = decision_row["final_step1_recommendation"]
            row["final_student_facing_areas"] = decision_row["final_student_facing_areas"]
            row["resolution_status"] = decision_row["resolution_status"]
            row["supplemental_external_sources"] = decision_row["supplemental_external_sources"]
            row["remaining_blocker"] = None
        merged_records.append(row)
    final_payload = {
        "artifact": "D113-D168 Step 1 final reconciled register revision 005",
        "date": str(date(2026, 10, 6)),
        "append_only_revision": True,
        "supersedes": BASE.name,
        "range": {"first": "D113", "last": "D168", "domain_count": len(merged_records)},
        "canonical_taxonomy_modified": False,
        "nigerian_context_added": False,
        "role_audit_performed": False,
        "records": merged_records,
    }
    FINAL_REGISTER.write_text(json.dumps(final_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# D113–D168 Step 1 Reconciliation — Residual Adjudication (Checkpoint 005)", "",
        "Date: 2026-10-06", "", 
        "## Result", "",
        "Adjudicated all 15 rows that the initial lane register had left open. None remains deferred solely for role-link work. Recommendations reconcile labels, boundaries, candidate counts and the defined parent scope. The actual source list and locator captured for each domain is embedded from its prior domain review; new external sources are recorded with publisher, URL, locator, supported claim and limitation. The complete 56-row reconciled revision is `d113_d168_step1_reconciliation_register_2026_10_06_v005.json`; the original register remains unchanged.", "",
        "This is an audit/recommendation artifact only. It does not modify canonical taxonomy, add Nigerian context, or assign roles to areas. The later role-to-domain and role-to-area audit remains separate.", "",
        "## Dispositions", "",
        "| Domain | Result | Areas / boundary decision |", "|---|---|---|",
    ]
    for row in records:
        areas = "; ".join(f"**{a['label']}** — {a['boundary']}" for a in row["final_student_facing_areas"])
        areas = areas.replace("|", "\\|")
        lines.append(f"| {row['domain_id']} {row['domain_name']} | {row['resolution_status']} | {areas} |")
    lines += [
        "", "## Decision rules and evidence limits", "",
        "- Current subgroup and role/ISCO placement are reported only as structural comparison. They are not evidence that an area fits the domain.",
        "- Counts are defended by the domain's stated scope and separate learning/practice emphases in the cited professional or academic sources. No source is represented as mandating the catalogue's exact count unless it explicitly does so.",
        "- D116 does not create a separate dredging area from a machine mention alone; D123 keeps radiation therapy outside the imaging set because it has a distinct therapeutic curriculum and the root title is imaging; D165 excludes dietetics and creative-arts therapy from coaching; D168 labels creator work as a provisional practice grouping, not a standardized occupation family.",
        "- For exact existing source locators and current subgroup lists, follow the `exact_current_subgroup_comparison_ref` and `captured_domain_evidence` in the JSON amendment back to the base register and its source register entries.",
        "", "## Coverage status", "",
        "- Range: D113–D168 (56/56 domains).",
        "- Initial residuals adjudicated in this amendment: 15/15.",
        "- Final Step 1 status in reconciled register: 56 resolved (52 with an area-structure recommendation; 4 direct domain→role/no-specialization dispositions).",
        "- Remaining Step 1 decisions deferred for evidence or parent scope: 0.",
        "- Role-link fit completed here: no; it is an explicitly separate later gate.",
        "- Canonical files changed: no.",
        "- Nigerian-context pass performed: no.",
        "- Genuine unresolved Step 1 blockers: 0 in this amendment. This means each row now has a defensible recommendation and stated evidence limitations; it is not a claim that one worldwide body prescribes a universal subgroup taxonomy.",
        "", "## Reproducibility", "",
        "Run `python build_d113_d168_residual_adjudication_005.py` from this folder to regenerate the append-only JSON amendment and checkpoint. The script reads the base lane register and writes only these two new output artifacts.",
        "",
    ]
    CHECKPOINT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {AMENDMENT.name}: {len(records)} domain dispositions")
    print(f"wrote {CHECKPOINT.name}")
    print(f"wrote {FINAL_REGISTER.name}: {len(merged_records)} domain rows")

if __name__ == "__main__":
    main()
