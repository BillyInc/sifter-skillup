"""Build a read-only, incremental D085-D168 role coverage-gap inventory."""
import json
from collections import Counter
from datetime import date
from pathlib import Path

# File is <repo>/data/career-mapping/_audit/role_coverage_lanes_2026_10_05/D085_D168/<script>.
# parents[5] is the repository root (parents[4] resolves to <repo>/data).
ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
STRUCTURE = ROOT / "data/career-mapping/domain_structure.json"
META = ROOT / "data/career-mapping/domain_meta.json"
ROLE_QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/D085_D168/D085_D168_role_fit_queue_2026_10_05.json"
D119_ROLE_INVENTORY = ROOT / "data/career-mapping/_audit/domains/D119.json"

SOURCES = {
    "ILO_ISCO08": {
        "publisher": "International Labour Organization (ILO)",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "International occupational classification; global statistical standard.",
        "supports": "Task-defined occupational groups for retail and wholesale trade managers (ISCO-08 1420), restaurant managers (1412), buyers (3323), hairdressers/beauticians (5141/5142), and funeral/embalming work (5163).",
        "limit": "Classification supports occupational-family existence and task boundaries, not domain assignment or proof of a missing link by itself.",
    },
    "BLS_CREMATORY_OPERATORS": {
        "publisher": "U.S. Bureau of Labor Statistics (BLS), Occupational Employment and Wage Statistics",
        "url": "https://www.bls.gov/oes/2023/may/oes394012.htm",
        "source_scope": "United States only.",
        "supports": "A separately classified Crematory Operator occupation and task profile in the U.S. SOC/OEWS, including operating crematory equipment and preparing remains.",
        "limit": "Does not establish that the same title, employment scale, training route or separate occupation exists globally or in Nigeria.",
    },
    "BLS_FUNERAL_WORKERS": {
        "publisher": "U.S. Bureau of Labor Statistics (BLS), Occupational Outlook Handbook",
        "url": "https://www.bls.gov/ooh/personal-care-and-service/funeral-service-occupations.htm",
        "source_scope": "United States only.",
        "supports": "Distinguishes funeral-service coordination from the technical work of crematory operators and embalmers in U.S. occupational reporting.",
        "limit": "U.S. occupational categories and regulation are not generalized to other jurisdictions.",
    },
    "ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS": {
        "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "International occupational classification; global statistical standard.",
        "supports": "Unit groups 3113 electrical engineering technicians, 3117 mining and metallurgical technicians, 3434 chefs, 5164 pet groomers and animal care workers, 5165 driving instructors, 6111 field crop and vegetable growers, 6130 mixed crop and animal producers, 2132 farming/forestry/fisheries advisers, 7112 bricklayers, 7122 floor layers and tile setters, 7123 plasterers, 7126 plumbers and pipe fitters, 7131 painters and related workers, 7211 metal moulders and coremakers, 7313 jewellery and precious-metal workers, 7314 potters, 7315 glass makers/cutters/grinders/finishers, 7316 signwriters/decorative painters/engravers, 7317 wood/basketry handicrafts, 7318 textile/leather handicrafts, 7321 pre-press technicians, 7322 printers, 7323 print finishing/binding workers, 7512 bakers/pastry-cooks, 7522 cabinet-makers, 7523 woodworking machine operators, 7532 garment patternmakers/cutters, 7533 sewing/embroidery, 7534 upholsterers, and 7536 shoemakers/leather-goods workers, with task definitions and occupational boundaries.",
        "limit": "ISCO establishes classification/task families, not whether a role belongs in this product's particular domain or should be active; inspect task overlap and domain scope separately.",
    },
    "ONET_CHEFS_HEAD_COOKS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/35-1011.00",
        "source_scope": "United States occupational taxonomy and task evidence.",
        "supports": "Chef/head-cook tasks include preparing food, menu planning/pricing, ordering supplies and supervising food-preparation work.",
        "limit": "U.S.-specific occupational taxonomy; corroborative only, not proof of global or Nigeria-specific title prevalence or regulation.",
    },
    "ESCO_ICT_INSTALLERS_SERVICERS": {
        "publisher": "European Commission, European Skills, Competences, Qualifications and Occupations (ESCO)",
        "url": "https://esco.ec.europa.eu/en/classification/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Fisco%2FC7422",
        "source_scope": "European occupational classification; internationally useful comparator, not a universal legal taxonomy.",
        "supports": "ISCO/ESCO 7422 ICT installers and servicers and narrower families including computer hardware repair, fibre-optic installation, radio, security-alarm, mobile-device and telecommunications service occupations.",
        "limit": "A taxonomy category does not establish this product's domain assignment; compare task records and avoid duplicates.",
    },
    "ONET_AUTOMOTIVE_BODY_REPAIRERS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/49-3021.00",
        "source_scope": "United States occupational taxonomy and task evidence.",
        "supports": "Automotive body repair tasks include removing damaged body sections, fitting/welding replacement parts, smoothing and refinishing panels, and inspecting completed body repairs.",
        "limit": "U.S.-specific task taxonomy; use to distinguish body repair from mechanical service, not to infer global/Nigerian title prevalence or credentials.",
    },
    "ONET_CROP_FARMWORKERS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/details/45-2092.00",
        "source_scope": "United States occupational taxonomy and task evidence.",
        "supports": "Manual crop, nursery and greenhouse production work, including planting, cultivation, harvest, crop records, packing and loading.",
        "limit": "U.S.-specific occupational taxonomy; corroborative task evidence only, not Nigerian role prevalence or a basis for assigning a role to D096.",
    },
    "ONET_MACHINISTS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/details/51-4041.00",
        "source_scope": "United States occupational taxonomy and task evidence.",
        "supports": "Machinists set up/program/operate machine tools, produce precision parts to specifications, inspect tolerances and maintain tooling; includes CNC machinist titles.",
        "limit": "U.S.-specific taxonomy; corroborative task evidence only, and its tasks overlap machine-tool operators and tool-and-die makers that must be checked for duplicates.",
    },
    "VTC_HONG_KONG_PRINT_PRODUCTION": {
        "publisher": "Hong Kong Vocational Training Council, Printing and Publishing Training Board",
        "url": "https://www.ive.edu.hk/uploads/files/publications/printing_and_publishing_training_board/en/SpecificationsforPrincipalJobsPrintingIndustry.pdf",
        "source_scope": "Hong Kong sector occupational profile; jurisdiction-specific evidence.",
        "supports": "Defines a print-industry Production Manager who plans and executes print production systems, directs production staff, and manages quality, productivity, cost control and delivery.",
        "limit": "Supports the role in this jurisdiction and industry framework; does not establish a globally standardized occupation title or Nigerian-specific title/credential.",
    },
    "AMS_AUSTRIAN_PRINT_TECHNICIAN": {
        "publisher": "Public Employment Service Austria (AMS), Berufsinformationssystem",
        "url": "https://bis.ams.or.at/bis/beruf/396-DrucktechnikerIn?language=en",
        "source_scope": "Austria-specific occupation profile with ISCO/ESCO cross-reference.",
        "supports": "Printing-technician roles and specializations including digital printing; the profile cross-references ISCO-08 7322 Printers and lists Austrian print/media-technology qualifications and occupational titles.",
        "limit": "The Austrian title/profile does not prove that 'printing engineer' is a globally standardized occupation or an ESCO concept; do not treat the existing library note as verified without exact ESCO URI evidence.",
    },
    "ONET_FOUNDRY_MOLD_COREMAKERS": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/51-4071.00",
        "source_scope": "United States occupational taxonomy and task evidence.",
        "supports": "Foundry mold/coremaking work includes preparing molds and cores, pouring molten metal, and shaping castings; O*NET distinguishes this from machine-based molding/casting operators.",
        "limit": "U.S.-specific task taxonomy; corroborates distinction but does not establish global or Nigerian title prevalence.",
    },
    "ILO_ISCO08_MANUFACTURING_FAMILIES": {
        "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "Global occupational classification adopted by the ILO; source gives group task definitions and examples, not product taxonomy ownership.",
        "supports": "ISCO-08 3116 chemical engineering technicians; 7531 tailors, dressmakers and hatters; 8114 cement, stone and other mineral products machine operators; 8141-8143 rubber, plastic and paper products machine operators; 8171 pulp and papermaking plant operators; 8181 glass and ceramics plant operators; and 8183 packing, bottling and labelling machine operators. These distinguish professional/technical, craft and plant-operation tiers and describe their characteristic tasks.",
        "limit": "ISCO establishes internationally recognized occupational families and task boundaries. It does not decide whether a family belongs in a particular product domain or whether a candidate is distinct from an existing active role; parent scope and exact role tasks still require reconciliation.",
    },
    "ILO_ISCO08_TRANSPORT_AGRICULTURE": {
        "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "Global occupational classification adopted by the ILO; task definitions and examples are used as family-boundary references.",
        "supports": "ISCO-08 unit groups 6111-6113 crop and horticultural growers; 6121 livestock and dairy producers, 6122 poultry producers, 6123 apiary/sericulture workers and 6129 animal producers not elsewhere classified; 1312 aquaculture/fisheries production managers; 2132 farming/forestry/fisheries advisers; 6210 forestry and related workers; 8311 locomotive-engine drivers, 8312 railway-brake/signal/switch operators, 8331 bus/tram drivers, 8332 heavy-truck drivers, and 8342-8343 earthmoving/crane operators.",
        "limit": "International family definitions support coverage checks, not automatic domain ownership. Local vehicle licensing, employer titles, regulatory work and overlapping production/transport tasks are not inferred.",
    },
    "ILO_ISCO08_HEALTH_OCCUPATIONS": {
        "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "Global occupational classification; medical-laboratory, medical-imaging and community-health task groups.",
        "supports": "ISCO-08 provides task-defined occupations including medical imaging and therapeutic equipment technicians (3211), medical and pathology laboratory technicians (3212), and community health workers (3253). The 3253 definition covers education, referral/follow-up, basic preventive care and home visiting.",
        "limit": "Task family definitions support coverage checks but do not establish exact titles, credentials, national scope of practice or product-domain ownership.",
    },
    "WHO_GLOBAL_CHW_GUIDANCE": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications/i/item/9789240118065",
        "source_scope": "Global curriculum guidance for community health workers; explicitly recognizes cross-country and system variation.",
        "supports": "WHO says CHW competencies and role scope vary by country, health system, programme and context, so global occupational coverage should not infer national cadre equivalence.",
        "limit": "Global guidance only; it is not a source for any specific country's title, curriculum, regulatory status or entry credential.",
    },
    "WHO_HEALTH_LAB_SYSTEM": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications/i/item/9789290232872",
        "source_scope": "WHO normative guidance for integrated health laboratory systems across countries.",
        "supports": "Clinical laboratory networks perform diagnostic and surveillance services with defined personnel, quality and coordination functions across health-system levels.",
        "limit": "System guidance supports the work context, not a globally standardized separate occupational title such as biomedical scientist or blood-bank technologist.",
    },
    "WHO_GLOBAL_BLOOD_SAFETY": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications/b/82618",
        "source_scope": "Global report on blood collection, testing, processing and clinical transfusion services.",
        "supports": "Blood safety and transfusion require distinct service processes including collection, laboratory testing, processing and clinical use; these functions can be undertaken by laboratory staff without proving a separate occupation.",
        "limit": "Service-function evidence does not define a separate occupational family or a national credential; classify as a role only if task-boundary sources justify it.",
    },
    "ILO_ISCO08_ADMIN_SOCIAL": {
        "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "Global occupational classification for medical administration and social-welfare occupations.",
        "supports": "ISCO-08 3344 defines medical secretaries using medical terminology and healthcare procedures; 2635 describes professional social workers; 3412 describes social-work associate professionals who administer/implement social assistance and community services and assist people with personal/social problems.",
        "limit": "Supports task-defined global occupational families; it does not decide whether current specialized role paths already cover these tasks, nor establish a separate global youth-worker title or product-domain placement.",
    },
    "ILO_ISCO08_EARLY_CHILDHOOD_ARMED_FORCES": {
        "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
        "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
        "source_scope": "Global occupation classification for early-childhood teaching and armed-forces occupation groupings.",
        "supports": "ISCO-08 includes early-childhood educators (2342) and an armed-forces occupations major group, supporting task-family and classification boundaries for those role areas.",
        "limit": "The classification does not establish national service ranks, licensing, nor whether each domain's active title list adequately represents a locally specific institutional structure.",
    },
    "WHO_GLOBAL_TCIM_STRATEGY": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications/i/item/9789240113176",
        "source_scope": "WHO Global Traditional Medicine Strategy 2025-2034, adopted by the World Health Assembly.",
        "supports": "WHO recognizes traditional, complementary and integrative medicine as a global policy/workforce area while prioritizing evidence, safety, regulation and context-appropriate integration; it does not assert that every modality is equally evidence-supported or regulated everywhere.",
        "limit": "This is a global policy framework, not proof of universal acceptance, licensure, efficacy or identical scope for individual modalities.",
    },
    "WHO_NATUROPATHY_TRAINING_BENCHMARK": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://www.who.int/publications/i/item/9789241599658",
        "source_scope": "WHO benchmark for naturopathy training; global reference intended to inform national authorities and safety/regulation.",
        "supports": "Defines training models, competencies and practice responsibilities for naturopathic practitioners, demonstrating an established modality-specific practitioner pathway while acknowledging need for training/examination/licensing systems.",
        "limit": "A training benchmark does not mean naturopathy is accepted, regulated or licensed identically in all countries.",
    },
    "WHO_CHIROPRACTIC_TRAINING_GUIDELINE": {
        "publisher": "World Health Organization (WHO)",
        "url": "https://iris.who.int/bitstream/handle/10665/43352/9241593717_eng.pdf?sequence=1",
        "source_scope": "WHO guideline on basic training and safety in chiropractic; identifies training models and safety considerations for national authorities.",
        "supports": "A distinct chiropractic practitioner pathway and training/safety model; the guideline explicitly notes variation in practitioner training and national regulation.",
        "limit": "Does not establish uniform global licensure, identical legal scope or evidence that every chiropractic technique is effective.",
    },
}

# A disposition is a coverage question, never a role-fit decision or a proposed
# subgroup. Titles are compared to task families only; canonical records remain read-only.
BATCH_085_089 = {
    "D085": {
        "coverage_disposition": "two source-backed candidate families identified; one partly overlaps the existing shop-supervisor record and requires duplicate/scope reconciliation before recommending any net-new title",
        "candidates": [
            {
                "candidate_key": "D085|retail_trade_manager_family",
                "title_or_family": "Retail/shop trade manager",
                "tasks": "Plans, organizes and controls a retail shop or retail unit, including staffing, product mix, purchasing/marketing policy, pricing, budgets and service standards.",
                "candidate_gap_basis": "ILO's global ISCO-08 1420 defines an established retail/wholesale trade-manager family. D085 already contains a shop supervisor, but its task record may be narrower: staffing performance, budgets, inventory and customer service. The manager's product-mix, purchasing-policy, pricing and establishment-level responsibilities are not clearly represented as a distinct task profile.",
                "title_status": "Established global occupational group (ISCO-08 1420; examples include retail/shop manager). Candidate may be an enrichment/expanded scope for existing shop supervisor rather than a distinct new role.",
                "source_refs": ["ILO_ISCO08"],
                "jurisdiction_note": "Global classification evidence; no Nigeria-specific variant assessed in this batch.",
                "recommendation_status": "candidate_for_exact-task-overlap-review; do not add duplicate until shop-supervisor scope is reconciled",
            },
            {
                "candidate_key": "D085|retail_buyer_merchandise_buyer",
                "title_or_family": "Retail merchandise buyer / buyer for resale",
                "tasks": "Selects merchandise for retail resale, studies demand and sales/price/quality information, negotiates supplier terms, places orders and manages stock availability/distribution.",
                "candidate_gap_basis": "This procurement/assortment function is distinct from customer-facing sales and rental roles. ISCO-08 3323 explicitly includes buying merchandise for resale by retail or wholesale establishments; the checked D085 active role-title list has no buyer/purchaser title.",
                "title_status": "Established global occupational group (ISCO-08 3323 Buyers); employer titles vary (retail buyer, merchandise buyer, category buyer).",
                "source_refs": ["ILO_ISCO08"],
                "jurisdiction_note": "Global classification evidence; buyer title variants and employer structures vary by market; no Nigeria-specific variant assessed in this batch.",
                "recommendation_status": "candidate_for_exact-key and overlap review",
            },
        ],
    },
    "D086": {
        "coverage_disposition": "domain is explicitly excluded from the student-facing catalogue by domain_meta; preserve its 13 stored links for audit, but do not propose student-facing role additions while exclusion stands",
        "candidates": [],
    },
    "D087": {
        "coverage_disposition": "sparse count (5), but the checked tasks cover the core barbering, hairdressing, assistance and performance-hair functions; no additional globally distinct occupational family is established by this source pass",
        "candidates": [],
    },
    "D088": {
        "coverage_disposition": "12 active roles cover the listed beauty/aesthetic/spa service functions; count alone does not prove a gap, and no net-new global occupational family is established in this batch",
        "candidates": [],
    },
    "D089": {
        "coverage_disposition": "sparse count (4); global ILO funeral/embalming tasks broadly overlap the existing funeral-services director, embalmer and attendant records. A separate crematory-operator family is evidenced only in the U.S. source pass and must not be generalized globally",
        "candidates": [
            {
                "candidate_key": "D089|crematory_operator_regional_candidate",
                "title_or_family": "Crematory operator / cremator",
                "tasks": "Operates cremation equipment, verifies identity and documentation, prepares remains, manages the cremation process and maintains equipment/facilities.",
                "candidate_gap_basis": "BLS separates operation of crematory equipment from funeral arrangements and embalming. The global ILO group describes funeral/embalming work and cremation arrangements, but this pass did not find evidence that crematory equipment operation is a distinct global occupation across jurisdictions.",
                "title_status": "Established as a separate occupation in the U.S. SOC/OEWS; global occupational-family status remains unverified. Keep as a jurisdiction-labelled candidate, not a global role recommendation.",
                "source_refs": ["BLS_CREMATORY_OPERATORS", "BLS_FUNERAL_WORKERS", "ILO_ISCO08"],
                "jurisdiction_note": "U.S.-specific evidence only. No Nigerian or global equivalent title has been verified; do not infer a Nigerian role or licensing route.",
                "recommendation_status": "regional_candidate_only; require evidence from additional jurisdictions before treating as a global family",
            },
        ],
    },
}

BATCH_090_094 = {
    "D090": {
        "coverage_disposition": "15 active roles span animal care, grooming, training, breeding, shelter, boarding and zoo functions; ILO ISCO-08 5164 substantially matches that scope. This source pass establishes no clear omitted global occupational family; veterinary-clinical roles remain outside this non-clinical parent unless its boundary is deliberately revised.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D091": {
        "coverage_disposition": "7 active roles cover car, bus, truck, motorcycle, vessel and occupational driving instruction. ILO ISCO-08 5165 recognizes driving instructors; no distinct global instructional family omitted from this parent was established. Licensing/exam authority roles are jurisdiction-dependent and not inferred as generic instructors.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D092": {
        "coverage_disposition": "21 active role links cover cooking, food service, beverage service and quick-service operations. D092 chef and pastry-cook records exist in the role library but are not active in the exact role queue; reconcile those existing records and cross-domain duplicates rather than inventing titles.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_CHEFS_HEAD_COOKS"],
        "candidates": [
            {
                "candidate_key": "D092|existing_library_chef_not_active",
                "title_or_family": "Chef / head chef",
                "tasks": "Prepares and presents food; may plan menus, order supplies, maintain production standards and coordinate or supervise kitchen work.",
                "candidate_gap_basis": "The exact role library contains D092 chef, while the active D092 role queue does not. Culinary food preparation and kitchen coordination fit the named parent scope, but reconcile the D053 chef records and D092 cook/industrial-cook tasks before deciding active ownership.",
                "title_status": "Established occupational family in ILO ISCO-08 3434; O*NET 35-1011.00 provides corroborative U.S. task/title evidence.",
                "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_CHEFS_HEAD_COOKS"],
                "jurisdiction_note": "Global classification family with U.S.-specific O*NET corroboration; no Nigeria-specific title, prevalence or credential claim made.",
                "recommendation_status": "existing_role_library_record_inactive; exact-scope and duplicate reconciliation required before activation",
            },
            {
                "candidate_key": "D092|existing_library_pastry_cook_not_active",
                "title_or_family": "Pastry cook / pastry chef",
                "tasks": "Prepares baked goods, pastries and desserts using specialized ingredient, mixing, baking, finishing and food-safety processes.",
                "candidate_gap_basis": "The exact role library contains D092 pastry cook but it is absent from active D092 role links. ILO ISCO-08 7512 recognizes bakers, pastry-cooks and confectionery makers; D048/D053 have related titles, so verify intended parent ownership and avoid duplicates.",
                "title_status": "Established occupational family in ILO ISCO-08 7512; exact employer title varies.",
                "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
                "jurisdiction_note": "Global classification family; no Nigerian-specific title or credential claim made.",
                "recommendation_status": "existing_role_library_record_inactive; exact-scope and duplicate reconciliation required before activation",
            },
        ],
    },
    "D093": {
        "coverage_disposition": "21 active roles cover electrical installation, distribution, equipment maintenance and specialized settings. The exact role library also has an inactive D093 electrical engineering technician record. ILO ISCO-08 3113 recognizes a distinct technician-level family, but this trade/install/maintenance parent requires task-level review before activation.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [
            {
                "candidate_key": "D093|existing_library_electrical_engineering_technician_not_active",
                "title_or_family": "Electrical engineering technician",
                "tasks": "Supports electrical engineering design, construction, operation, testing, maintenance and repair through technical work; precise duties vary by setting and level.",
                "candidate_gap_basis": "The exact role library includes a D093 electrical engineering technician record, but it is absent from active D093 role links. Determine whether this record describes installation/maintenance technician work in D093 or broader engineering support better owned elsewhere.",
                "title_status": "Established global occupational group in ILO ISCO-08 3113; this is an existing library record, not a net-new role recommendation.",
                "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
                "jurisdiction_note": "Global classification evidence; no country-specific scope or credential inferred.",
                "recommendation_status": "existing_role_library_record_inactive; compare exact tasks with D093 scope and cross-domain duplicates before activation",
            },
        ],
    },
    "D094": {
        "coverage_disposition": "26 active roles cover electronics/ICT installation, repair and maintenance across telecommunications, computing hardware, consumer devices, instrumentation, smart systems, alarms, fibre and transport electronics. ESCO/ISCO 7422 families substantially overlap this active set; no source-supported missing global family was established here.",
        "source_refs": ["ESCO_ICT_INSTALLERS_SERVICERS"],
        "candidates": [],
    },
}

BATCH_095_099 = {
    "D095": {
        "coverage_disposition": "20 active links cover powertrain, general vehicle service, tires/brakes, restoration, assembly and related mechanics. An exact D095 motor vehicle body repairer record exists in the role library but is inactive. O*NET task evidence distinguishes panel/body repair and refinishing from mechanical servicing; check overlap with coachbuilder and body assembler before deciding activation.",
        "source_refs": ["ONET_AUTOMOTIVE_BODY_REPAIRERS"],
        "candidates": [{
            "candidate_key": "D095|existing_library_motor_vehicle_body_repairer_not_active",
            "title_or_family": "Motor vehicle body repairer / automotive body repairer",
            "tasks": "Repairs collision or other body damage by removing or reshaping damaged panels, fitting/welding replacement body parts, smoothing surfaces and refinishing paint, then inspecting repair quality.",
            "candidate_gap_basis": "This exact D095 role-library record is absent from active D095 links. The body-panel repair task family is not obviously represented by coachbuilder (body/frame construction) or motor vehicle body assembler (manufacturing assembly); confirm exact role descriptions and duplicate ownership.",
            "title_status": "Established occupation in O*NET-SOC 49-3021.00; global prevalence/title equivalence not established by that U.S. source alone.",
            "source_refs": ["ONET_AUTOMOTIVE_BODY_REPAIRERS"],
            "jurisdiction_note": "U.S.-specific source evidence; no Nigerian-specific title, scale, regulation or credential inferred.",
            "recommendation_status": "existing_role_library_record_inactive; task-overlap review required before activation",
        }],
    },
    "D096": {
        "coverage_disposition": "15 active links are concentrated in agricultural/forestry/mining machinery and heavy-equipment work. The role library also contains inactive D096 records for crop farmer, mixed crop-and-livestock farmer, agronomist and farmworker/agricultural labourer. Because the parent explicitly says 'Farm Operations' as well as machinery, these are material coverage/scope-boundary candidates; do not activate them until the parent definition and each exact task profile establish fit or justify separating/relocating the scope.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_CROP_FARMWORKERS"],
        "candidates": [
            {"candidate_key": "D096|existing_library_crop_farmer_not_active", "title_or_family": "Crop farmer / field-crop grower", "tasks": "Plans or performs crop production such as land preparation, sowing, cultivation, crop care, harvesting, storage and marketing; mechanization may be one means, not the defining occupation.", "candidate_gap_basis": "The exact D096 library contains crop farmer but the active links are machinery-heavy. ILO ISCO-08 6111 describes crop-grower work; determine whether 'Farm Operations' intentionally includes production occupations or only equipment operations.", "title_status": "Established occupational family in ILO ISCO-08 6111; U.S. task comparators vary by crop/workforce classification.", "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_CROP_FARMWORKERS"], "jurisdiction_note": "Global ILO family with U.S.-specific O*NET task corroboration; no Nigeria-specific employment/credential claim made.", "recommendation_status": "existing_role_library_record_inactive; parent-scope decision and exact task-fit review required"},
            {"candidate_key": "D096|existing_library_mixed_crop_livestock_farmer_not_active", "title_or_family": "Mixed crop and livestock farmer", "tasks": "Operates a farm with both crop production and animal production as material market activities; incidental secondary production alone does not make a farm mixed.", "candidate_gap_basis": "The exact D096 library contains this inactive record. ILO ISCO-08 6130 explicitly distinguishes genuinely mixed crop-and-animal production from farms primarily specialized in crops or livestock; clarify whether this belongs in D096 or in the primary production domains.", "title_status": "Established global occupational group in ILO ISCO-08 6130.", "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"], "jurisdiction_note": "Global classification; no country-specific variant inferred.", "recommendation_status": "existing_role_library_record_inactive; parent-scope and cross-domain ownership decision required"},
            {"candidate_key": "D096|existing_library_agronomist_not_active", "title_or_family": "Agronomist / farming adviser", "tasks": "Applies crop and soil science to advise on crop production, farm practices, productivity and related resource decisions.", "candidate_gap_basis": "The exact D096 library contains an inactive agronomist record. ILO ISCO-08 2132 recognizes farming, forestry and fisheries advisers and names agronomist among the examples; professional advisory work may be more appropriate to an agricultural science/advisory domain than machinery operations.", "title_status": "Established occupational family/example in ILO ISCO-08 2132.", "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"], "jurisdiction_note": "Global classification evidence; no Nigerian credential or licensing route inferred.", "recommendation_status": "existing_role_library_record_inactive; domain-boundary and task-fit review required"},
            {"candidate_key": "D096|existing_library_farmworker_not_active", "title_or_family": "Farmworker / agricultural labourer", "tasks": "Performs routine crop or animal production tasks such as planting, cultivating, harvesting, feeding, cleaning, sorting and packing under instruction.", "candidate_gap_basis": "The exact D096 library contains this inactive record, while no active D096 role family describes routine farm labour. ILO ISCO-08 classifies elementary agricultural labour separately from machinery technicians/operators. Resolve whether 'Farm Operations' covers this workforce or whether the role belongs under crop/livestock production domains.", "title_status": "Established occupational family in ILO ISCO-08 9211; O*NET 45-2092.00 is a U.S.-specific crop/nursery/greenhouse comparator.", "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_CROP_FARMWORKERS"], "jurisdiction_note": "Global ILO family with U.S.-specific task comparator; no Nigeria-specific prevalence or employment claim made.", "recommendation_status": "existing_role_library_record_inactive; parent-scope and cross-domain ownership decision required"},
        ],
    },
    "D097": {
        "coverage_disposition": "63 active roles cover a broad range of joining, forging, casting, cutting, forming, fitting, welding, sheet-metal, blacksmithing, tool-and-die and related fabrication tasks. The current exact library comparison in this batch establishes no additional distinct global family absent from both active roles and same-domain library records; the high count is not itself a completeness proof.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D098": {
        "coverage_disposition": "23 active links cover precision inspection, instruments, tool/die making, repair and quality control. An exact D098 machinist/CNC machinist record exists in the library but is inactive. O*NET documents precision machining tasks that may differ from general CNC machine tending; reconcile with D097 machine operators and D098 tool-and-die maker before deciding activation.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_MACHINISTS"],
        "candidates": [{
            "candidate_key": "D098|existing_library_machinist_cnc_not_active",
            "title_or_family": "Machinist / CNC machinist",
            "tasks": "Sets up, programs and operates machine tools to make precision parts to drawings/tolerances; measures finished parts, adjusts tooling and maintains machine operation.",
            "candidate_gap_basis": "The exact D098 library contains an inactive machinist/CNC machinist record. O*NET 51-4041.00 describes setup, programming, precision machining and tolerance inspection; compare against D097's general CNC machine operator and D098's tool-and-die maker to avoid duplicate task coverage.",
            "title_status": "Established occupation in O*NET-SOC 51-4041.00; U.S.-specific classification and task details.",
            "source_refs": ["ONET_MACHINISTS"],
            "jurisdiction_note": "U.S.-specific source evidence; role family is recognizable internationally, but no Nigerian credential or title prevalence is asserted.",
            "recommendation_status": "existing_role_library_record_inactive; exact-task and duplicate reconciliation required before activation",
        }],
    },
    "D099": {
        "coverage_disposition": "20 active roles span bricklaying, masonry, plaster/stucco, tile/floor laying, ceilings, insulation, glass and concrete finishing. No clear, source-supported global occupational family missing from this parent was established in this batch; further review should target any exact source-defined task family not already represented, not inflate the catalogue with material or title variants.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
}

BATCH_100_104 = {
    "D100": {
        "coverage_disposition": "15 active roles cover plumbing, drainage/sewerage networks, gas service, water systems and building climate-system installation/maintenance. The exact library contains an inactive D100 pipefitter/steamfitter record, and ISCO-08 7126 explicitly covers plumbing and pipe fitting. Reconcile industrial/process pipe fitting against building plumbing and pipeline maintenance before activation; do not treat the title as an approved link.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [{
            "candidate_key": "D100|existing_library_pipefitter_not_active",
            "title_or_family": "Pipefitter / steamfitter",
            "tasks": "Measures, cuts, threads, assembles, installs, tests and maintains piping systems for water, steam, gas, chemicals or other fluids from technical drawings and system specifications.",
            "candidate_gap_basis": "An exact D100 role-library record is absent from active D100 links, while the parent title includes pipefitting. Distinguish building-services pipe fitting from pipeline network maintenance and industrial process/steam fitting; consolidate or keep separate only when task scope justifies it.",
            "title_status": "Established occupational family in ILO ISCO-08 7126 (plumbers and pipe fitters); exact title boundaries vary by trade context.",
            "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
            "jurisdiction_note": "Global occupational classification; no Nigeria-specific credential, licensing or title claim made.",
            "recommendation_status": "existing_role_library_record_inactive; exact-task overlap review required before activation",
        }],
    },
    "D101": {
        "coverage_disposition": "6 active roles are sparse but span construction painting, paperhanging, marine/transport coatings and surface treatment. ISCO-08 7131 is broader than the parent and includes painter work; the current active set appears to cover the main named work contexts. No distinct omitted global family is established by this pass; count alone is not evidence for adding variants.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D102": {
        "coverage_disposition": "36 active roles cover construction carpentry/installation, joinery, cabinetry, furniture manufacture/restoration, wood machining/treatment/drying and wood/basketry crafts. ILO-08 groups 7522-7523 and 7317 provide a suitable international family cross-check; no additional distinct global family is evident in this pass.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D103": {
        "coverage_disposition": "20 active links cover jewellery design, fabrication, assembly, precious-metal work, stone cutting/setting, engraving, polishing, repair, retail and trade. ILO-08 7313 explicitly covers jewellery/precious-metal making, repair, stone cutting/setting and engraving; this pass identifies no additional distinct family absent from active roles.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D104": {
        "coverage_disposition": "24 active links span pottery/ceramic forming and casting, ceramic/glass painting, glass blowing, cutting, bevelling, engraving, grinding and finishing, and related surface decoration. ILO-08 7314-7316 describe these craft families; no further distinct global occupational family absent from this role set was established in this pass.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
}

BATCH_105_109 = {
    "D105": {
        "coverage_disposition": "15 active links span basketry, weaving/knitting, carpet and fishing-net craft, papermaking, brush/toy/candle making, woodcraft and wicker furniture. These tasks align with relevant ISCO-08 handicraft families; no additional distinct global family absent from the exact active/library set was established in this pass.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D106": {
        "coverage_disposition": "28 active links cover garment construction, sewing, tailoring/dressmaking, cutting, grading, patternmaking/CAD, embroidery, millinery, and upholstery applications. ISCO-08 7532-7534 aligns to core families; no distinct global missing family identified from the checked role inventory.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D107": {
        "coverage_disposition": "68 active links span footwear and leather-goods design, patternmaking, cutting, stitching, lasting, tanning/finishing, repair, production, quality, warehousing and trade. The exact library includes a generic 'specialised seller' extra; it is not a well-defined missing occupational family, and existing product-specialist seller roles already cover that function. No additional distinct global family established here.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"],
        "candidates": [],
    },
    "D108": {
        "coverage_disposition": "20 active roles map closely to ISCO-08 printing trades 7321-7323 (pre-press, press operation, and print finishing/binding). Two inactive exact-domain role-library records claim higher-level coverage: print production manager has jurisdiction-specific institutional support; 'printing engineer' is not substantiated here as a globally standardized ESCO role. Treat both as evidence-review candidates, not confirmed omissions or approved links.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "VTC_HONG_KONG_PRINT_PRODUCTION", "AMS_AUSTRIAN_PRINT_TECHNICIAN"],
        "candidates": [
            {"candidate_key": "D108|existing_library_print_production_manager_not_active", "title_or_family": "Print production manager", "tasks": "Plans and schedules print production, coordinates people/equipment/materials, and manages output quality, cost and delivery.", "candidate_gap_basis": "An exact D108 library record is inactive, but task prevalence and boundaries vary. Hong Kong VTC documents the production-manager function; ISCO provides general manufacturing-manager/supervisor categories rather than a globally distinct print-manager unit group. Compare scope with active print-studio supervisor and manufacturing-management pathways before deciding.", "title_status": "Employer/sector role documented in a Hong Kong industry training-board profile; global standardized occupational-title status remains unconfirmed.", "source_refs": ["VTC_HONG_KONG_PRINT_PRODUCTION", "ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"], "jurisdiction_note": "Hong Kong sector evidence only for the exact role profile; no Nigerian title, credential or regulatory claim made.", "recommendation_status": "existing_role_library_record_inactive; regional evidence only; global coverage claim requires additional jurisdiction evidence"},
            {"candidate_key": "D108|existing_library_printing_engineer_not_active", "title_or_family": "Printing engineer / print technology engineer", "tasks": "Could include technical optimization, process/equipment selection, production workflow and print-quality engineering; exact role scope requires a verified source profile.", "candidate_gap_basis": "An exact D108 library note calls this a standard ESCO role, but this pass did not find the claimed ESCO record/URI. The Austrian AMS source documents printing technicians and references ISCO 7322, not proof of a global 'printing engineer' occupation. Keep the global claim unsupported pending direct ESCO and multi-jurisdiction sources.", "title_status": "Global standardized title not verified. Austrian print-technician roles provide regional adjacent evidence only.", "source_refs": ["AMS_AUSTRIAN_PRINT_TECHNICIAN", "ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"], "jurisdiction_note": "Austrian comparator only; do not generalize to Nigeria or globally.", "recommendation_status": "existing_role_library_record_inactive; source claim unresolved; do not promote as a global role without authoritative corroboration"},
        ],
    },
    "D109": {
        "coverage_disposition": "19 active roles cover metal-processing machinery and finishing operations. Exact D109 library extras identify two plausible missing skill-level families: foundry moulder/coremaker (ISCO-08 7211, distinct from active machine-caster/metal-processing operators) and metallurgical technician (ISCO-08 3117, technical support tier). Both require exact-task, overlap and parent-scope reconciliation before activation.",
        "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_FOUNDRY_MOLD_COREMAKERS"],
        "candidates": [
            {"candidate_key": "D109|existing_library_foundry_moulder_not_active", "title_or_family": "Foundry moulder / metal moulder and coremaker", "tasks": "Makes and repairs foundry molds and cores from patterns and specified materials so molten metal can be cast to shape; may work by hand or with molding equipment.", "candidate_gap_basis": "The exact D109 library contains an inactive foundry-moulder record. ILO ISCO-08 7211 classifies metal moulders/coremakers separately from 8121 metal-processing plant operators; O*NET also separates foundry mold/coremaking from machine-based molding/casting. The active D109 links are mainly machine/plant operators, so the distinct craft task family appears unrepresented.", "title_status": "Established global occupational group in ILO ISCO-08 7211; U.S. O*NET evidence corroborates task distinction.", "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS", "ONET_FOUNDRY_MOLD_COREMAKERS"], "jurisdiction_note": "Global ILO classification with U.S.-specific corroboration; no Nigeria-specific training route asserted.", "recommendation_status": "existing_role_library_record_inactive; strong global coverage candidate, exact record/duplicate check before activation"},
            {"candidate_key": "D109|existing_library_metallurgical_technician_not_active", "title_or_family": "Metallurgical technician / metallurgical production technician", "tasks": "Supports metallurgical production or processing through technical work such as sampling/testing materials, monitoring processes, assisting with process control and quality/safety checks.", "candidate_gap_basis": "An exact D109 library record is inactive. ILO occupational classification recognizes a technical metallurgical family (ISCO-08 3117); current active D109 roles are operator/trade roles. Reconcile this role's exact duties with metallurgical engineers and quality/laboratory technicians in neighboring domains before activation.", "title_status": "Recognized technical occupational family in international ISCO classification; confirm current 3117 definition and title variants against the source before final promotion.", "source_refs": ["ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS"], "jurisdiction_note": "Global family claim requires exact current ISCO 3117 task citation; no Nigeria-specific credential inferred.", "recommendation_status": "existing_role_library_record_inactive; exact-scope/source confirmation required before activation"},
        ],
    },
}

BATCH_110_114 = {
    "D110": {
        "coverage_disposition": "56 active links cover chemical and rubber process operators across mixing, distillation, compounding, moulding, soap, coatings and tyre production. One inactive exact-domain library record describes the distinct chemical-engineering technician tier; review its actual duties and overlap before any recommendation.",
        "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"],
        "candidates": [
            {"candidate_key": "D110|chemical_engineering_technician_inactive", "title_or_family": "Chemical engineering technician", "tasks": "Performs technical support for chemical-engineering work such as process testing, sampling, measurement, calculations, technical documentation and monitoring under engineering direction; exact active-library duties must be inspected.", "candidate_gap_basis": "The exact D110 role-library record is inactive. The current 56 active links are overwhelmingly plant/machine-operation titles; ISCO-08 3116 identifies a separate chemical-engineering technician family, so this may fill a genuinely distinct technical tier if the stored record tasks align with D110's process-industry scope and are not already covered by chemical-process technician roles elsewhere.", "title_status": "ISCO-08 international occupational family (3116); task-fit and exact-record reconciliation remain required.", "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"], "jurisdiction_note": "Global classification evidence only; no country-specific variant assessed.", "recommendation_status": "existing_role_library_record_inactive; verify exact task profile and neighboring-domain duplicates before disposition"},
        ],
    },
    "D111": {
        "coverage_disposition": "43 active links cover textile machinery and garment production from spinning/knitting through finishing, pattern making and quality. The exact library contains an inactive tailor and textile-industrial-engineer record. ILO recognizes tailoring as a separate craft family (7531); the engineering title maps only to a broader industrial-engineering group here and remains unverified as a globally distinct textile occupation.",
        "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"],
        "candidates": [
            {"candidate_key": "D111|tailor_inactive", "title_or_family": "Tailor / dressmaker", "tasks": "Measures, cuts, fits, alters and constructs garments, including custom or made-to-measure clothing; differs from operating industrial sewing or textile machinery by garment-specific fitting and construction work.", "candidate_gap_basis": "The exact D111 library has an inactive tailor record, while the active list covers sewing-machine operation and industrial garment/textile production but no explicit tailor/dressmaker role. ISCO-08 7531 defines the craft family. Check for equivalent tailoring tasks under active garment roles before treating it as a missing family.", "title_status": "Established global occupational family in ISCO-08 7531; title variants include tailor and dressmaker.", "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"], "jurisdiction_note": "Global classification evidence only; no country-specific tailoring variant or credential assessed.", "recommendation_status": "existing_role_library_record_inactive; task-overlap and exact-domain review required"},
            {"candidate_key": "D111|textile_industrial_engineer_inactive", "title_or_family": "Clothing/textile industrial engineer", "tasks": "Potentially designs or improves manufacturing systems, capacity, workflow, quality and production efficiency in textile or apparel manufacturing; exact library record must be checked.", "candidate_gap_basis": "The exact library record is inactive, but ISCO-08 2141 describes industrial and production engineers broadly rather than establishing a globally distinct clothing/textile-engineer occupation. Keep as a low-confidence title/possible specialization candidate until authoritative global task evidence and exact record content justify a separate occupational role.", "title_status": "A sector-specific title not established as a separate global occupation in the source checked; do not promote based on the broad ISCO 2141 family alone.", "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"], "jurisdiction_note": "Global-only pass; no Nigeria-specific or other national variant assessed.", "recommendation_status": "existing_role_library_record_inactive; evidence insufficient for global role recommendation; retain for later exact review"},
        ],
    },
    "D112": {
        "coverage_disposition": "22 active links cover wood conversion, sawing, debarking, planning, engineered boards, veneer, pellets, pulp digestion/bleaching and paper-machine operation/supervision. These align with the ILO wood-processing and pulp/papermaking families; no distinct global family absent from the exact active role set was established in this pass.",
        "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"],
        "candidates": [],
    },
    "D113": {
        "coverage_disposition": "41 active links cover glass/ceramic forming and finishing, kiln work, refractory repair and some building-material processing. A potential cement/stone/mineral plant-operator family (ISCO-08 8114) is not explicitly identifiable in the active titles; crushing/grinding, kiln and brick/tile roles may overlap parts of it, so exact task comparison is required before calling it a gap. Packaging/filling-machine roles are also active here despite D114 explicitly naming packaging; preserve that cross-domain ownership conflict for reconciliation.",
        "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"],
        "candidates": [
            {"candidate_key": "D113|cement_stone_mineral_plant_operator_scope_candidate", "title_or_family": "Cement, stone and other mineral-products plant operator", "tasks": "Operates or monitors industrial equipment that crushes, grinds, mixes, heats, kiln-processes or otherwise converts cement, stone and mineral inputs into building products; specific duties vary by production process.", "candidate_gap_basis": "The domain name includes building materials and ILO-08 group 8114 defines cement, stone and other mineral-products machine operators. Active D113 titles include crushing/grinding and kiln/brick roles, but this audit cannot yet determine whether their task records collectively cover a cement-production line or only adjacent equipment stages. Candidate for exact task coverage analysis; do not add a generic duplicate if active roles already cover the process.", "title_status": "Established global occupational family in ISCO-08 8114; exact product role title depends on process and material.", "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"], "jurisdiction_note": "Global classification evidence only; no national industry variant assessed.", "recommendation_status": "source-backed candidate; inspect active role tasks and cross-domain assignments before deciding whether a distinct family is missing"},
        ],
    },
    "D114": {
        "coverage_disposition": "43 active links strongly cover component assembly across mechanical, electrical, vehicle, aircraft, medical-device and electronics products. Packaging is explicitly part of parent scope but no packaging or labelling roles are active here. The exact library contains packaging/filling, labelling and cartoning operator records; packaging/filling operators currently appear under D113, creating a real cross-domain ownership overlap that must be reconciled before any activation or relocation.",
        "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"],
        "candidates": [
            {"candidate_key": "D114|packaging_line_operator_overlap", "title_or_family": "Packaging-line operator (filling, cartoning and labelling operations)", "tasks": "Operates and monitors machinery that packs, bottles/fills, labels or cartons products for distribution; distinguishes product-assembly work from packaging-line preparation, though some factories combine them.", "candidate_gap_basis": "D114 parent scope explicitly includes packaging and its exact role library has inactive packaging/filling, labelling and cartoning records. However, D113 currently has active `Packaging and Filling Machine Operators and Tenders` and `packaging and filling machine operator` records despite its glass/ceramics/building-material scope. ISCO-08 8183 establishes packing, bottling and labelling machine operators as a family. This is therefore an overlap/ownership reconciliation, not a clean net-new addition: compare exact task records, decide whether D113 links are misowned, and avoid duplicate role paths.", "title_status": "Established global occupational family in ISCO-08 8183; line-specific names can be aliases or task specializations rather than distinct roles.", "source_refs": ["ILO_ISCO08_MANUFACTURING_FAMILIES"], "jurisdiction_note": "Global classification evidence only; no country-specific variant assessed.", "recommendation_status": "cross-domain overlap found; reconcile D113 active role ownership and merge aliases before any canonical edit"},
        ],
    },
}

BATCH_115_119 = {
    "D115": {
        "coverage_disposition": "28 active links cover passenger and freight road transport, including buses, heavy/light delivery, taxis, motorcycles, refuse, emergency, dangerous-goods and specialist vehicle transport. ILO groups 8331-8332 align with bus/tram and heavy-truck work; no materially distinct global road-driving family absent from the active titles was established. Some exact role-library variants remain alias-level rather than separate occupations.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"],
        "candidates": [],
    },
    "D116": {
        "coverage_disposition": "20 active roles cover cranes, excavators, bulldozers, graders, rollers, dredging, pile-driving, forklifts and related earthmoving/construction equipment. ILO groups 8342-8343 identify earthmoving and crane operators; the exact library roles are represented in the active set. No distinct global equipment-operator family absent from this scope was established.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"],
        "candidates": [],
    },
    "D117": {
        "coverage_disposition": "20 active roles cover train driving, dispatch, signalling, switching, level crossings, shunting, train preparation, rolling-stock engineering and conductors. ILO groups 8311-8312 align with locomotive and rail signal/switch tasks. An inactive exact-library `railway conductor` title is likely covered by the active `Railroad Conductors and Yardmasters` family but requires task-level alias reconciliation; no separate global family is established here.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"],
        "candidates": [],
    },
    "D118": {
        "coverage_disposition": "23 active roles cover crop and horticulture production, field work, farm management, fruit/vegetable harvesting, horticulture, vineyards, arboriculture and inspection/crop protection. The two exact library extras (`agricultural inspector`, `crop protection / pesticide applicator`) have active counterparts (`Agricultural Inspectors`, `Pesticide Handlers, Sprayers, and Applicators, Vegetation`), so they are title/task reconciliation items, not evidence of missing families. ILO 611x grower families are represented; no additional global family was established in this pass.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"],
        "candidates": [],
    },
    "D119": {
        "coverage_disposition": "Coverage cannot be signed off because source counts disagree: `domain_structure.json` declares 20 links, while the exact D119 audit inventory lists 17 roles; the fit queue excludes D119 and the role library contains 14 corresponding active-title records plus two inactive candidates. The inventory does not explicitly list a dairy farmer although dairy is in the parent scope; the inactive exact-domain dairy-farmer record and ILO livestock/dairy producer family make it a source-backed candidate. Reconcile the exact active-role source and tasks before deciding whether the family is missing or represented under another title.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"],
        "candidates": [
            {"candidate_key": "D119|dairy_farmer_inactive_and_source_count_conflict", "title_or_family": "Dairy farmer / dairy producer", "tasks": "Manages or performs dairy-animal production for milk, including animal care and feeding, breeding/herd records, milking routines, milk hygiene and production monitoring; distinguish dairy production from cattle breeding and downstream dairy processing.", "candidate_gap_basis": "Dairy production is explicitly within D119's name/scope and ILO-08 includes livestock and dairy producers in group 6121. An exact D119 role-library `dairy farmer` record exists but is not in the cleaned active role list; the separate D119 source inventory contains 17 roles and does not name a dairy farmer, while domain_structure declares 20. This is a plausible occupational-family gap, but the unresolved 20/17/14 active-source discrepancy means coverage and aliases cannot yet be conclusively evaluated.", "title_status": "Dairy production is within the global ILO livestock/dairy producer family; exact title and task split must be checked against the role record and active source list.", "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"], "jurisdiction_note": "Global classification evidence only; no national variant assessed.", "recommendation_status": "source-backed candidate plus active-source count blocker; reconcile canonical role source and exact dairy tasks before disposition"},
        ],
    },
}

BATCH_120_124 = {
    "D120": {
        "coverage_disposition": "20 active links cover aquaculture hatcheries, husbandry, rearing, cage/mooring, harvest and fishery-vessel work. A distinct farm-level production-management function is not represented by hatchery management alone: the inactive exact-domain aquaculture production manager record matches ILO-08 1312 and FAO farm-management tasks. This is a strong global candidate for exact-task/duplicate review.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE", "FAO_AQUACULTURE_FARM_MANAGEMENT"],
        "candidates": [
            {"candidate_key": "D120|aquaculture_production_manager_inactive", "title_or_family": "Aquaculture production manager", "tasks": "Plans and coordinates production across an aquaculture/fishery operation: production targets, stock/hatchery/grow-out cycles, health and water conditions, equipment, workers, costs, records and harvest/marketing.", "candidate_gap_basis": "The exact D120 role library contains an inactive aquaculture production manager. Active D120 has a hatchery manager and multiple production technicians/workers, but not an evident whole-farm/production-system manager. ILO-08 1312 separately defines aquaculture and fisheries production managers; FAO describes farm-level planning/stock/water/feed/harvest and business management. Compare exact task scope with hatchery manager and any farm-manager records before final disposition.", "title_status": "Established international occupational family in ISCO-08 1312; employer title may vary (aquaculture production/farm manager).", "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE", "FAO_AQUACULTURE_FARM_MANAGEMENT"], "jurisdiction_note": "Global sources only; no national aquaculture variant assessed.", "recommendation_status": "existing_role_library_record_inactive; strong source-backed coverage candidate; exact-task and cross-domain review required"},
        ],
    },
    "D121": {
        "coverage_disposition": "20 active links include forest workers, equipment operators, forestry technicians/advisers, forest rangers, inspectors and conservation roles. Two exact library extras may represent missing task families: logging/tree-felling and professional forester/forestry manager. ILO global groups distinguish forestry work from forestry advice/management; exact overlap with active forest worker, ranger, forestry adviser and conservation-scientist records needs review. Wildlife/conservation officer appears substantially covered by active conservation/ranger roles; no separate global family established here.",
        "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"],
        "candidates": [
            {"candidate_key": "D121|logger_tree_feller_inactive", "title_or_family": "Logger / tree feller", "tasks": "Selects or marks trees for harvesting, fells trees, limbs and bucks stems into logs, and may operate harvesting equipment or prepare timber for extraction.", "candidate_gap_basis": "The exact D121 library contains an inactive logger/tree-feller record. Current active roles include generic forest worker and forestry equipment operator but do not explicitly identify tree felling/log production. ILO-08 6210 recognizes forestry and related workers; review the active forest-worker task record to see whether felling and logging are already included before treating this as an additional family.", "title_status": "Globally recognized forestry work family; exact ISCO unit grouping and role-title granularity should be validated against the ILO task definition before canonization.", "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"], "jurisdiction_note": "Global classification basis only; no national logging variant assessed.", "recommendation_status": "existing_role_library_record_inactive; compare active forest-worker tasks and avoid duplicate aliases"},
            {"candidate_key": "D121|forester_inactive", "title_or_family": "Forester / forestry production manager", "tasks": "Plans or advises on forest establishment, silviculture, sustainable harvesting, conservation and operational management; responsibilities may be professional advisory or production-management work depending on the role.", "candidate_gap_basis": "An exact inactive D121 forester record exists. Active D121 includes forestry adviser, forestry technician, inspector and conservation scientist, but their task profiles may not cover responsibility for planning/directing forestry production or professional forest management. ILO-08 identifies forestry advisers (2132) and forestry managers (1311) as distinct task families; compare those exact roles with the active adviser/manager records before deciding whether a net-new role is needed.", "title_status": "Global occupational functions are recognized in ISCO-08; 'forester' is a broad title that may be an alias, professional specialization or manager depending on tasks.", "source_refs": ["ILO_ISCO08_TRANSPORT_AGRICULTURE"], "jurisdiction_note": "Global-only role coverage; no national credential or variant assessed.", "recommendation_status": "existing_role_library_record_inactive; likely overlap/level distinction; exact-task reconciliation required"},
        ],
    },
    "D122": {
        "coverage_disposition": "20 active links span clinical chemistry, microbiology, cytology, histology, molecular diagnostics, phlebotomy, lab support and management. Inactive `biomedical scientist` is a title/task-boundary candidate that may be an umbrella clinical-laboratory professional role already covered by medical laboratory technologist and specialist testing roles; `blood bank technologist` is best treated as a transfusion-medicine specialization unless evidence shows a distinct occupational role beyond laboratory technologist tasks. No net-new global occupation is established from titles alone.",
        "source_refs": ["ILO_ISCO08_HEALTH_OCCUPATIONS", "WHO_HEALTH_LAB_SYSTEM"],
        "candidates": [
            {"candidate_key": "D122|biomedical_scientist_inactive", "title_or_family": "Biomedical scientist / clinical laboratory scientist", "tasks": "Performs and validates diagnostic analysis of clinical specimens, interprets laboratory results within scope, maintains quality systems and supports clinical diagnosis; exact duties and professional title differ across systems.", "candidate_gap_basis": "An exact inactive library record exists, but the active D122 set already contains medical laboratory technologist, clinical chemistry technologist, molecular diagnostic technologist and other specialist lab roles. In this global-only pass, evidence supports clinical-laboratory work as an established function but not a globally distinct role family separate from those current roles; reconcile the record's tasks and title jurisdiction before any gap finding.", "title_status": "Title varies by jurisdiction; retain as an alias/task-overlap candidate, not a confirmed global missing role.", "source_refs": ["ILO_ISCO08_HEALTH_OCCUPATIONS", "WHO_HEALTH_LAB_SYSTEM"], "jurisdiction_note": "Global task framing only; country-specific protected titles and licensure deferred.", "recommendation_status": "existing_role_library_record_inactive; likely umbrella/alias or professional-level distinction; no global gap sign-off until exact task review"},
            {"candidate_key": "D122|blood_bank_technologist_specialization_candidate", "title_or_family": "Blood bank / transfusion laboratory technologist", "tasks": "Performs blood-group and compatibility testing, donor/product testing and quality-control work in transfusion services; these may be duties or a specialization within clinical laboratory practice.", "candidate_gap_basis": "The inactive exact-domain library record points to a material transfusion-testing function. WHO recognizes blood collection, testing, processing and transfusion as an essential global service, but functional importance does not prove a separate global occupation. Treat as a candidate specialization/role-path within medical laboratory technology, and do not count it as a missing role unless authoritative occupational evidence establishes distinct job tasks and boundaries.", "title_status": "Specialization candidate; separate global occupational status not established in this pass.", "source_refs": ["ILO_ISCO08_HEALTH_OCCUPATIONS", "WHO_HEALTH_LAB_SYSTEM", "WHO_GLOBAL_BLOOD_SAFETY"], "jurisdiction_note": "Global service evidence only; no national title or credential claims made.", "recommendation_status": "specialization_not_role_pending_task-boundary_review"},
        ],
    },
    "D123": {
        "coverage_disposition": "13 active links represent diagnostic radiography and major modalities (CT, MRI, mammography, fluoroscopy, nuclear medicine), sonography and radiotherapy. The inactive generic radiology-technician record is explicitly optional and likely duplicates modality-specific/diagnostic-radiographer paths; no distinct global family absent from active titles is established.",
        "source_refs": ["ILO_ISCO08_HEALTH_OCCUPATIONS"],
        "candidates": [],
    },
    "D124": {
        "coverage_disposition": "17 active links include a generic community health worker plus community-health and frontline support roles. ILO-08 3253 and WHO's global CHW guidance establish community-health work globally while emphasizing that role scope varies across countries and health systems. The inactive CHEW/JCHEW records are national cadre labels and are deferred from this global-only lane; no separate global occupational family is missing from the active coverage based on current evidence.",
        "source_refs": ["ILO_ISCO08_HEALTH_OCCUPATIONS", "WHO_GLOBAL_CHW_GUIDANCE"],
        "candidates": [],
    },
}

SOURCES["FAO_AQUACULTURE_FARM_MANAGEMENT"] = {
    "publisher": "Food and Agriculture Organization of the United Nations (FAO)",
    "url": "https://www.fao.org/fishery/docs/CDrom/FAO_Training/FAO_Training/General/x6709e/x6709e01.htm",
    "source_scope": "FAO technical training material describing fish-farm management tasks; globally relevant technical guidance, not an occupational licensing standard.",
    "supports": "Farm-level management includes stocking, water quality, feeding, harvest and marketing; larger aquaculture farms require coordination of production factors, records and operating performance.",
    "limit": "Technical task evidence supports the distinct farm-management function but does not by itself establish a title in every labour market or determine domain placement.",
}

SOURCES["FIA_GLOBAL_MOTORSPORT_ENGINEERING"] = {
    "publisher": "Fédération Internationale de l'Automobile (FIA)",
    "url": "https://www.fia.com/sites/default/files/web_ang_v8_pao_brochure_a5_wims_engineering_careers16_0.pdf",
    "source_scope": "International motorsport federation career guidance; engineering examples are globally relevant, though team titles vary.",
    "supports": "Describes engineering career routes in motorsport and identifies vehicle dynamics, aerodynamics, mechanics, electronics and simulation as engineering specialisms needed in motorsport.",
    "limit": "Supports technical disciplines and motorsport work context, not each discipline as a distinct occupation or a mandatory global job title.",
}
SOURCES["ESA_SPACE_MISSION_CONTROL_ROLES"] = {
    "publisher": "European Space Agency (ESA)",
    "url": "https://www.esa.int/Enabling_Support/Operations/Who_does_what_at_ESA_Mission_Control",
    "source_scope": "ESA mission operations examples across international space-science missions; employer-specific organizational titles are labelled as such.",
    "supports": "ESA describes spacecraft operations engineers, spacecraft controllers, spacecraft operations managers and flight dynamics coordinators, with tasks spanning mission planning, telemetry monitoring, spacecraft command/control, orbit and attitude determination, and mission procedures.",
    "limit": "ESA job-family evidence establishes real mission-operations work but not one universal global title or a separate occupation for every team function.",
}
SOURCES["NASA_MISSION_OPERATIONS"] = {
    "publisher": "National Aeronautics and Space Administration (NASA)",
    "url": "https://www.nasa.gov/reference/jsc-spaceflight-operations/",
    "source_scope": "NASA/U.S. spaceflight operations organization; corroborative task evidence, not global title standardization.",
    "supports": "NASA describes flight controllers and mission operations work in monitoring spacecraft systems, planning and executing operations, and supporting crewed missions.",
    "limit": "U.S. agency organization and titles are not assumed universal; use only to corroborate spacecraft-operations task families also evidenced by ESA.",
}
SOURCES["IMO_STCW_ELECTROTECHNICAL_OFFICER"] = {
    "publisher": "International Maritime Organization (IMO), STCW Convention and Code",
    "url": "https://wwwcdn.imo.org/localresources/en/OurWork/HumanElement/Documents/34.pdf",
    "source_scope": "International convention standard for seafarer training, certification and watchkeeping.",
    "supports": "STCW Regulation III/6 and Section A-III/6 define mandatory minimum training, onboard experience and competence requirements for electro-technical officers; the IMO compendium lists III/6 as the ETO certificate category.",
    "limit": "The international certification standard establishes a distinct seagoing role but does not decide product taxonomy ownership; implementation and certificate issuance occur through flag-state systems.",
}
SOURCES["ILO_RECRUITMENT_EMPLOYMENT_SERVICES"] = {
    "publisher": "International Labour Organization (ILO), ISCO-08 Volume I",
    "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
    "source_scope": "Global occupational classification and task-family definitions.",
    "supports": "ISCO-08 includes employment agents and contractors (3333) and human-resource professionals (2423), whose task families include matching applicants to vacancies, recruiting, and advising on personnel policy and staffing.",
    "limit": "Classification supports family coverage, not the completeness or domain assignment of this catalogue's active links by itself.",
}
SOURCES["IMAREST_MARINE_SURVEYOR_TASKS"] = {
    "publisher": "Institute of Marine Engineering, Science and Technology (IMarEST), Marine Jobs / maritime employers",
    "url": "https://jobs.imarest.org/job/marine-surveyor-27718",
    "source_scope": "International maritime professional-network job evidence, including classification-society surveying across regions.",
    "supports": "Marine surveyor postings describe inspecting ships and mobile offshore units, applying technical rules and quality requirements, documenting findings and reporting vessel condition.",
    "limit": "Job advertisements establish a recurring professional work family, not a single global statutory licence or identical scope in every jurisdiction; distinguish vessel/class survey from cargo inspection.",
}
SOURCES["EASA_FLIGHT_TEST_ENGINEER"] = {
    "publisher": "European Union Aviation Safety Agency (EASA)",
    "url": "https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-initial-airworthiness-and?page=34",
    "source_scope": "European Union aviation airworthiness rules; formal task and crew qualification definitions for aircraft flight testing.",
    "supports": "EASA defines flight test engineer and lead flight test engineer functions in ground or onboard flight-test operations, including test-system operation and support to pilots; it specifies competence and experience conditions for lead roles.",
    "limit": "This is a real specialized engineering role, but qualification and authorization rules cited are EASA-specific; do not present it as a universally licensed occupation.",
}
SOURCES["IAEA_MEDICAL_DOSIMETRY"] = {
    "publisher": "International Atomic Energy Agency (IAEA), Human Health Series",
    "url": "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1610_web.pdf",
    "source_scope": "International radiation-medicine technical guidance; the detailed recommended medical-dosimetrist profile is explicitly based on a North American professional source and should be localized cautiously.",
    "supports": "IAEA describes medical dosimetrists as radiation-therapy team members who calculate and design dose distributions/treatment plans in collaboration with medical physicists and radiation oncologists, under appropriate supervision.",
    "limit": "The function is distinct, but the IAEA notes that its detailed job description was obtained from the American Association of Medical Dosimetrists; title, scope and independent recognition vary internationally.",
}
SOURCES["IAEA_MEDICAL_RADIATION_TEAM"] = {
    "publisher": "International Atomic Energy Agency (IAEA), Safety Standards SSG-46",
    "url": "https://nucleus.iaea.org/sites/nss-oui/Published%20Chunks/m_60b8e698-4f59-4c24-809a-dfb819ac5050/c_4616a381-7a46-4b09-a811-5e170b311e9e__1_0.Html",
    "source_scope": "International safety guidance for medical uses of ionizing radiation.",
    "supports": "Defines medical physicist responsibilities and distinguishes them from radiation protection officer and medical radiation technologist functions; notes globally variable names for radiographers, nuclear-medicine technologists and radiation therapists.",
    "limit": "Role/function guidance does not establish one uniform international title, licence or local staffing model.",
}
SOURCES["IFMBE_CLINICAL_ENGINEERING"] = {
    "publisher": "International Federation for Medical and Biological Engineering (IFMBE), Clinical Engineering Division",
    "url": "https://ced.ifmbe.org/resources/clinical-engineering-definitions/",
    "source_scope": "International professional federation reference; terminology varies by region (clinical engineering, biomedical engineering, health technology management).",
    "supports": "Defines clinical engineering work around healthcare-technology planning, evaluation, management, analysis, education, support and regulatory compliance, and notes WHO terminology variation with biomedical engineering/health-care technology management.",
    "limit": "The source emphasizes regional terminology overlap; this supports a possible specialization/alias within biomedical engineering, not necessarily a separate role record.",
}
SOURCES["IGDA_GAME_DISCIPLINES"] = {
    "publisher": "International Game Developers Association (IGDA)",
    "url": "https://igda.org/global-industry-game-awards/",
    "source_scope": "International professional association and global games-industry discipline examples.",
    "supports": "IGDA recognizes discipline areas such as narrative design, level design, systems/gameplay design, UI/UX, engineering, audio and accessibility in game development.",
    "limit": "Discipline and award categories demonstrate established specialisms, not that each is a distinct occupation or a missing role where related active records already exist.",
}
SOURCES["SCREENSKILLS_GAME_ROLE_PROFILES"] = {
    "publisher": "ScreenSkills, UK screen-industries skills body",
    "url": "https://www.screenskills.com/job-profiles/browse/games/",
    "source_scope": "UK games-industry job profiles used for role/task comparison, not a global occupational classification.",
    "supports": "ScreenSkills separately profiles Gameplay Programmer, Technical Artist and Environment Artist in games, including aliases and profile-specific tasks.",
    "limit": "Supports exact role/task distinctions in the UK games industry; does not establish global title prevalence or legal/credential standardization.",
}
SOURCES["FAA_CABIN_INTERIOR_SAFETY"] = {
    "publisher": "U.S. Federal Aviation Administration (FAA)",
    "url": "https://www.faa.gov/aircraft/air_cert/step/disciplines/advanced_cabin_safety",
    "source_scope": "United States aviation safety engineering discipline; corroborative context only.",
    "supports": "FAA describes aircraft cabin interior design as involving furniture, seating, materials and arrangements, balanced with occupant safety, and engagement in vehicle design.",
    "limit": "This is an engineering/safety discipline description, not a global occupational title or proof of a missing D133 role.",
}
SOURCES["CANADA_AIRCRAFT_INTERIOR_DESIGN"] = {
    "publisher": "Government of Canada, TERMIUM Plus",
    "url": "https://www.btb.termiumplus.gc.ca/tpv2alpha/alpha-eng.html?i=&index=frr&lang=eng&srchtxt=DESIGNER+AMENAGEMENT+INTERIEUR+AVIONS",
    "source_scope": "Canadian occupational terminology and NOC cross-reference.",
    "supports": "Records aircraft interior designer/business-airplane interior designer as occupational titles classified within Canada's interior-design group.",
    "limit": "Country-specific classification evidence; it corroborates a specialization/title but is not generalized into a distinct global occupation.",
}
SOURCES["ICAO_CABIN_MODIFICATION"] = {
    "publisher": "International Civil Aviation Organization (ICAO)",
    "url": "https://igat.icao.int/ated/trainingcatalogue/Course/6019",
    "source_scope": "International civil-aviation training material for airworthiness approval of aircraft cabin modifications.",
    "supports": "ICAO training addresses cabin-interior modifications and identifies engineers, maintenance/inspection personnel, technicians, operators and regulators involved in design and implementation.",
    "limit": "The course establishes a technical work context and stakeholder functions, not a singular job title or occupational family.",
}
SOURCES["IAEA_NUCLEAR_OPERATIONS_ROLES"] = {
    "publisher": "International Atomic Energy Agency (IAEA), Nuclear Energy Series",
    "url": "https://nucleus.iaea.org/sites/connect/MSNpublic/Pages/nct/downloads/Pub1659_web.pdf",
    "source_scope": "IAEA guidance on staffing and qualification for research-reactor operation; applicable as international safety/operations evidence, with licensing dependent on national rules.",
    "supports": "Identifies typical functions such as reactor manager, shift supervisor, reactor operator, radiation protection manager/officer, maintenance engineer/staff, nuclear safety officer and quality-assurance officer; required staffing depends on facility and national regulations.",
    "limit": "Facility guidance does not prove uniform global job titles or establish that every function needs a separate catalogue role; compare active D135 tasks first.",
}
SOURCES["EMBL_EBI_BIOINFORMATICS_ROLE_PROFILE"] = {
    "publisher": "European Bioinformatics Institute (EMBL-EBI), European Molecular Biology Laboratory",
    "url": "https://www.ebi.ac.uk/training/online/courses/bioinformatics-for-principal-investigators-collection/what-is-a-bioinformatician/",
    "source_scope": "International research-institute training resource describing bioinformatics practice; not an occupational regulator.",
    "supports": "Bioinformatician is described as a broad term involving biological-domain knowledge plus informatics, programming and statistics, including data management, analysis, visualization and pipeline development.",
    "limit": "The source describes a broad role family and task patterns, not a distinct title boundary between bioinformatician and computational biologist.",
}
SOURCES["ENFSI_FORENSIC_PRACTITIONER_ROLES"] = {
    "publisher": "European Network of Forensic Science Institutes (ENFSI), Quality and Competence Committee",
    "url": "https://enfsi.eu/wp-content/uploads/2017/11/QCC-CAP-006-001.pdf",
    "source_scope": "Professional forensic-science practice framework developed by a multi-institute European network; internationally useful task model, not a global licensing taxonomy.",
    "supports": "Distinguishes scene-of-crime examiner, analyst/assistant, reporting analyst and reporting scientist functions across the forensic process; scene investigators focus on initial scene assessment and collection, while reporting scientists examine items, interpret findings and report evidence.",
    "limit": "ENFSI states that organizations define recognized roles; these are functional role families, not necessarily identical job titles across jurisdictions.",
}
SOURCES["WMO_METEOROLOGICAL_OBSERVER_FRAMEWORK"] = {
    "publisher": "World Meteorological Organization (WMO)",
    "url": "https://etrp.wmo.int/pluginfile.php/69555/mod_resource/content/1/1209_en.pdf",
    "source_scope": "WMO competency frameworks for meteorological and aeronautical meteorological personnel; competency requirements are applied through member-state services.",
    "supports": "WMO defines observer functions distinct from forecaster functions, including observing and recording weather parameters, monitoring conditions, quality control and communicating observations; meteorological technician pathways can also maintain observing instruments.",
    "limit": "Frameworks define competency functions, but exact job titles, service assignments and qualification routes vary by national meteorological service and job.",
}
SOURCES["IFR_ROBOT_SYSTEM_INTEGRATION"] = {
    "publisher": "International Federation of Robotics (IFR), World Robotics",
    "url": "https://ifr.org/img/worldrobotics/WR_Industrial_Robots_2023_Sources_and_Methods.pdf",
    "source_scope": "Global industrial-robotics market and industry-structure definitions.",
    "supports": "IFR distinguishes robot producers, distributors, system integrators and end users; integrators combine robots and automation equipment into standard or customized operational systems.",
    "limit": "Industry-structure evidence validates a work function, not a universally standardized employee title; D140 already contains robotics integrator and related engineering roles.",
}
SOURCES["OECD_QUANTUM_WORKFORCE"] = {
    "publisher": "Organisation for Economic Co-operation and Development (OECD) and European Patent Office (EPO)",
    "url": "https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/12/mapping-the-global-quantum-ecosystem_47891dd2/20251217-0001.pdf",
    "source_scope": "Cross-country quantum ecosystem and job-posting analysis; occupational evidence is specifically based on postings from Canada, the United Kingdom and the United States.",
    "supports": "Finds quantum-related postings distributed across established occupation families including IT/computer science, science/research, education/training, engineering and finance, cautioning against treating every quantum skill/title as a separate standardized occupation.",
    "limit": "Job-posting data cover three named labour markets and does not constitute a global occupational census; domain-specific job titles remain emergent.",
}

SOURCES["BCI_SOCIETY_NEURAL_ENGINEERING"] = {
    "publisher": "International BCI Society",
    "url": "https://bcisociety.org/trainee-collaboration-projects/",
    "source_scope": "International interdisciplinary brain-computer-interface research and training community.",
    "supports": "Identifies neural engineering as a skill/research area and documents a distinct technical BCI workforce context.",
    "limit": "Does not establish neural engineer or BCI engineer as a globally standardized occupational title; candidate remains emerging and task-defined.",
}
SOURCES["ASHRAE_BUILDING_SYSTEMS"] = {
    "publisher": "ASHRAE, international building-services engineering society",
    "url": "https://www.ashrae.org/professional-development/ashrae-certification/certification-types",
    "source_scope": "International building-services and HVAC professional standards/certification scope.",
    "supports": "Defines commissioning, HVAC design and building-performance competency scopes that may be delivered by specialized building-services professionals.",
    "limit": "Competence/certification scope does not prove a separate globally standardized job title; functions may be performed by existing engineers.",
}
SOURCES["ISA_AUTOMATION_PROFESSIONS"] = {
    "publisher": "International Society of Automation (ISA)",
    "url": "https://www.isa.org/about-isa/what-is-automation",
    "source_scope": "International cross-industry automation professional society.",
    "supports": "Describes automation design, application engineering, integration, implementation, maintenance and management functions across sectors.",
    "limit": "Broad field description; it does not establish one missing title in D147 or imply each technology is a distinct occupation.",
}
SOURCES["IMCA_OFFSHORE_SURVEY_AND_ROV"] = {
    "publisher": "International Marine Contractors Association (IMCA)",
    "url": "https://www.imca-int.com/skills/freelance-portfolios/",
    "source_scope": "International offshore marine-contractor competence frameworks and role portfolios.",
    "supports": "Maintains distinct offshore-survey and remote-systems/ROV competence portfolios, including ROV pilot/technician functions.",
    "limit": "Competence frameworks support task-family existence, not exclusive domain ownership or globally uniform employment titles.",
}
SOURCES["UN_CAREERS_POLITICAL_AFFAIRS"] = {
    "publisher": "United Nations Careers",
    "url": "https://careers.un.org/talentpipeline/description/67efa8cb80ebc3000b4d1817",
    "source_scope": "Official international-organization job profile for Political Affairs Officer.",
    "supports": "Documents political-affairs analysis, monitoring, advice and coordination responsibilities in international relations work.",
    "limit": "An employer-specific role profile; it does not define a universal diplomatic-service taxonomy.",
}
SOURCES["UNODC_CRIMINAL_JUSTICE_PERSONNEL"] = {
    "publisher": "United Nations Office on Drugs and Crime (UNODC)",
    "url": "https://data.unodc.org/datasearch?f%5B0%5D=dataportal%3A98&search_api_fulltext=data+on+the+issue+",
    "source_scope": "United Nations criminal-justice personnel data categories across reporting jurisdictions.",
    "supports": "Separately tracks police, prosecution personnel, professional judges or magistrates, and prison personnel by function, confirming distinct criminal-justice work families.",
    "limit": "Statistical categories establish distinct functions, not automatic ownership by this product's D151 domain; law-domain duplication and exact tasks must be reconciled.",
}
SOURCES["ILO_ISCO08_RELIGIOUS_PROFESSIONALS"] = {
    "publisher": "International Labour Organization (ILO), ISCO-08",
    "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
    "source_scope": "Global ISCO-08 Unit Group 2636, Religious Professionals.",
    "supports": "Defines religious-professional tasks including religious rites/services, spiritual and moral guidance, missions, sermons, religious-education programmes and counselling.",
    "limit": "Global occupational group; faith-specific titles, practice structures and legal recognition vary and are not inferred here.",
}
SOURCES["ILO_ISCO08_MUSIC_OCCUPATIONS"] = {
    "publisher": "International Labour Organization (ILO), ISCO-08",
    "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
    "source_scope": "Global ISCO-08 occupational groups for musicians, singers and composers (2652), and broadcasting/audio-visual technicians (3521).",
    "supports": "Establishes broad music-creation/performance and technical audiovisual occupational groups; it does not define all modern studio, live-sound or post-production specialties.",
    "limit": "Global classification at group level; role titles, production workflows and specialization boundaries vary by employer and medium.",
}
SOURCES["ILO_ISCO08_JUDGES"] = {
    "publisher": "International Labour Organization (ILO), ISCO-08",
    "url": "https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf",
    "source_scope": "Global ISCO-08 Unit Group 2612, Judges.",
    "supports": "Recognizes judges as a distinct legal-professional occupational group; UNODC separately identifies professional judges or magistrates in criminal-justice personnel data.",
    "limit": "Judicial functions, title, court structure and authority are defined by legal systems; this supports a coverage question, not automatic D151 ownership.",
}
SOURCES["ICOM_MUSEUM_PROFESSIONS"] = {
    "publisher": "International Council of Museums (ICOM), International Committee for Museology (ICOFOM)",
    "url": "https://icom.museum/wp-content/uploads/2018/07/Museologie_Anglais_BD.pdf",
    "source_scope": "International museum-profession reference discussing museum task families and role differentiation.",
    "supports": "Distinguishes curatorial, conservation and registrar work, including scientific exhibition planning, specialized conservation treatment, collections movement, insurance and reserve management.",
    "limit": "Museum staffing and role titles vary by institution and country; this supports task distinction, not a mandatory organizational chart or universal title standard.",
}
SOURCES["ICOMOS_ARCHAEOLOGY_AND_SITE_MANAGEMENT"] = {
    "publisher": "ICOMOS International Scientific Committee on Archaeological Heritage Management (ICAHM)",
    "url": "https://icahm.icomos.org/about-icahm/",
    "source_scope": "International archaeological heritage and site-management professional network.",
    "supports": "Explicitly identifies professional archaeologists and archaeological site managers and describes archaeological research, site/resource management and cultural-resource-management practice.",
    "limit": "Professional-network and standards evidence; national title, legal authority and heritage-service structures vary.",
}
SOURCES["AES_AUDIO_PRODUCTION_ROLE_FAMILIES"] = {
    "publisher": "Audio Engineering Society (AES), international professional society and technical committees",
    "url": "https://aes.org/community/technical-council/aes-technical-committee-audio-production/",
    "source_scope": "International professional-audio engineering community and production-practice resources.",
    "supports": "AES audio-production materials distinguish recording engineers, mixers, sound designers and related production functions; paired with ILO ISCO-08 music and audiovisual technician groups, this supports separate creative-music and technical-audio work families.",
    "limit": "AES role labels and education examples do not constitute a global occupational classification; studio/live/post-production titles and role boundaries vary, and emerging interactive/spatial roles need separate validation.",
}
SOURCES["FIMS_SPORT_SCIENCE_TEAM"] = {
    "publisher": "International Federation of Sports Medicine (FIMS)",
    "url": "https://www.fims.org/about/code-ethics/",
    "source_scope": "International sports-medicine professional federation guidance.",
    "supports": "Describes interdisciplinary sports-medicine collaboration with physical therapists and sport scientists, including biochemists, biomechanists and physiologists; supports sport-science functions distinct from clinical treatment alone.",
    "limit": "The source defines team functions, not a universally standardized sports-scientist title, credential, or exclusive domain placement; compare exact active exercise-science roles first.",
}

BATCH_125_129 = {
    "D125": {
        "coverage_disposition": "10 active links cover medical reception, records, transcription, practice management and health administration. The exact library has an inactive medical-secretary record; ILO-08 3344 defines medical secretaries as a distinct occupational group using medical terminology and healthcare procedures. Current reception/transcription/records roles may cover parts, but the exact medical-secretary task cluster is not explicitly represented, so retain as a source-backed candidate for task comparison.",
        "source_refs": ["ILO_RECRUITMENT_EMPLOYMENT_SERVICES"],
        "candidates": [
            {"candidate_key": "D125|medical_secretary_inactive", "title_or_family": "Medical secretary", "tasks": "Uses medical terminology and healthcare-delivery procedures to support clinicians and health services with correspondence, records, appointments, documents and administrative coordination.", "candidate_gap_basis": "The exact D125 library contains an inactive medical-secretary record. Active roles include general medical reception, medical administration, records and transcription but do not name the specialized secretarial family. ILO-08 3344 explicitly distinguishes medical secretaries from general secretaries, receptionists and medical transcriptionists. Compare the exact role tasks and determine whether existing D125 records already cover the work before recommending a separate path.", "title_status": "Established global occupational group in ISCO-08 3344; employer titles may vary.", "source_refs": ["ILO_ISCO08_ADMIN_SOCIAL"], "jurisdiction_note": "Global classification evidence only; no national credential or title variation assessed.", "recommendation_status": "existing_role_library_record_inactive; source-backed candidate; task-overlap review required"},
        ],
    },
    "D126": {
        "coverage_disposition": "11 active links cover several complementary-practice modalities, including acupuncture, herbal practice, homeopathy, osteopathy and traditional Chinese medicine. Exact-domain inactive library records identify chiropractor and naturopath. WHO has modality-specific training/safety references for both, but also emphasizes evidence, safety and national regulation; retain as global pathway candidates with explicit scope/regulatory caveats, not as universally licensed or equally evidence-backed professions.",
        "source_refs": ["WHO_GLOBAL_TCIM_STRATEGY", "WHO_NATUROPATHY_TRAINING_BENCHMARK", "WHO_CHIROPRACTIC_TRAINING_GUIDELINE"],
        "candidates": [
            {"candidate_key": "D126|chiropractor_inactive", "title_or_family": "Chiropractor", "tasks": "Assesses and provides chiropractic care focused on neuromusculoskeletal conditions and manual procedures within an applicable safety, referral and practice framework.", "candidate_gap_basis": "The exact D126 library contains an inactive chiropractor record, while active D126 includes a chiropractic assistant but no chiropractor. WHO's training/safety guideline recognizes a distinct chiropractor pathway. Since practitioner regulation and training vary among jurisdictions, this is evidence for a global occupational-family candidate, not for universal legal recognition or a specific technique's efficacy.", "title_status": "Distinct practitioner pathway documented by WHO training/safety guidance; national status and scope vary.", "source_refs": ["WHO_GLOBAL_TCIM_STRATEGY", "WHO_CHIROPRACTIC_TRAINING_GUIDELINE"], "jurisdiction_note": "Global sources; no country-specific license or scope asserted.", "recommendation_status": "existing_role_library_record_inactive; source-backed global candidate; safety, scope and cross-domain task review required"},
            {"candidate_key": "D126|naturopath_inactive", "title_or_family": "Naturopath / naturopathic practitioner", "tasks": "Assesses clients and provides naturopathic care using the modalities and scope for which the practitioner is trained and authorized; specific practice models vary.", "candidate_gap_basis": "The exact D126 library contains a naturopath record currently represented only as an alias under `complementary therapist`. WHO publishes a modality-specific naturopathy training benchmark. This supports reviewing whether the existing generic complementary-therapist role sufficiently distinguishes the practitioner pathway; do not infer equal regulatory recognition or clinical effectiveness across jurisdictions/modalities.", "title_status": "WHO-recognized training pathway; separate occupational title and legal status vary across countries.", "source_refs": ["WHO_GLOBAL_TCIM_STRATEGY", "WHO_NATUROPATHY_TRAINING_BENCHMARK"], "jurisdiction_note": "Global source coverage only; national regulatory/credential context deferred.", "recommendation_status": "existing_role_library_record_inactive; distinguish role from alias/specialization after exact-task and safety-scope review"},
        ],
    },
    "D127": {
        "coverage_disposition": "20 active links cover childcare, nursery management, preschool/early-years teaching, assistants, special educational needs and residential care. ILO's early-childhood educator family is represented by active preschool/early-years teacher records; the 20-role list also spans the care side of the parent. No distinct global family absent from the exact active roles was established in this pass.",
        "source_refs": ["ILO_ISCO08_EARLY_CHILDHOOD_ARMED_FORCES"],
        "candidates": [],
    },
    "D128": {
        "coverage_disposition": "20 active links include multiple specialized social-worker roles, community development/social-service roles, housing and service managers, and youth-centre/programme leadership. Exact library extras point to a generic social worker, youth worker and social-work assistant. ILO-08 recognizes professional social workers (2635) and social-work associate professionals (3412); the professional family appears represented by the active specialisms, while associate/frontline youth-service work is less explicit and remains a task-level candidate. Do not treat a manager/director as coverage of frontline work.",
        "source_refs": ["ILO_ISCO08_ADMIN_SOCIAL"],
        "candidates": [
            {"candidate_key": "D128|generic_social_worker_inactive", "title_or_family": "Social worker (generalist)", "tasks": "Assesses needs, plans and delivers social-work interventions, supports individuals/families, coordinates services and advocates for access to social resources.", "candidate_gap_basis": "An exact generic social-worker library record is inactive, but active D128 includes numerous task-specialized social workers (community, child-care, mental-health, hospital, migrant, criminal-justice and others). ILO-08 2635 establishes the global professional family; evidence points more strongly to an umbrella alias/generalist presentation than a missing occupational family. Reconcile whether a generalist pathway is useful without duplicating specialties.", "title_status": "Established global occupational family in ISCO-08 2635; generalist vs specialist pathways depend on practice context.", "source_refs": ["ILO_ISCO08_ADMIN_SOCIAL"], "jurisdiction_note": "Global classification evidence only; no national registration route assessed.", "recommendation_status": "existing_role_library_record_inactive; likely umbrella/alias of active specialties; do not count as a confirmed gap"},
            {"candidate_key": "D128|youth_worker_inactive", "title_or_family": "Youth worker / youth-services practitioner", "tasks": "Works directly with young people through structured support, development, engagement, safeguarding, referrals and community or programme activities; distinguish direct-service work from centre/programme management.", "candidate_gap_basis": "The exact library contains an inactive youth-worker record. Active D128 has a youth-centre manager and youth-programme director but no clearly titled frontline youth worker. ISCO-08 3412 supports an associate-level social/community-services task family, but does not alone establish youth worker as a separate standardized global occupation. Review task profiles and global evidence before deciding if this should be a distinct role or an area-specific route within social work/community practice.", "title_status": "Recognizable practice family, but title and occupational boundary are not established as globally uniform by the source checked.", "source_refs": ["ILO_ISCO08_ADMIN_SOCIAL"], "jurisdiction_note": "Global-only review; no country-specific title or credential inferred.", "recommendation_status": "existing_role_library_record_inactive; plausible frontline coverage gap, global role-boundary evidence remains open"},
            {"candidate_key": "D128|social_work_assistant_inactive", "title_or_family": "Social-work assistant / associate social-services practitioner", "tasks": "Supports qualified social workers and community-service teams with client intake, information gathering, referrals, programme delivery and follow-up within a delegated scope.", "candidate_gap_basis": "The exact library has an inactive social-work-assistant record. ILO-08 3412 recognizes a separate social-work associate-professional tier, while D128 active roles lean toward professional specialties and service managers. Compare these tasks against foster-care support, community-development and other assistant roles; a distinct associate-level pathway may be missing, but avoid duplicating the same task family under several titles.", "title_status": "Associate-level global task family recognized in ISCO-08 3412; exact title varies by system.", "source_refs": ["ILO_ISCO08_ADMIN_SOCIAL"], "jurisdiction_note": "Global occupational family only; national role titles and credentials deferred.", "recommendation_status": "existing_role_library_record_inactive; source-backed associate-tier candidate; exact-task and duplicate reconciliation required"},
        ],
    },
    "D129": {
        "coverage_disposition": "21 active links cover officer/enlisted ranks, military piloting, combat/special-forces, engineering, intelligence and ordnance disposal. ISCO's armed-forces occupation group offers a global classification frame, but military rank names and service structures are nationally specific and no cross-country rank inventory was undertaken in this global lane. No materially distinct internationally portable role family absent from the current broad set was established here; national service variants remain deferred.",
        "source_refs": ["ILO_ISCO08_EARLY_CHILDHOOD_ARMED_FORCES"],
        "candidates": [],
    },
}

BATCH_130_134 = {
    "D130": {
        "coverage_disposition": "17 active roles cover recruitment consulting, executive search, employment-agency/public-service delivery, vocational integration, employment support, talent acquisition, HR and employer branding. The domain's task scope is represented; this pass found no distinct global occupational family absent from the active set.",
        "source_refs": ["ILO_ISCO08_ADMIN_SOCIAL"],
        "candidates": [],
    },
    "D131": {
        "coverage_disposition": "26 active role links cover the named engineering disciplines, but the exact role library includes an inactive race engineer. FIA describes motorsport career pathways and engineering specialisms; race engineer is a distinct team-facing operational role, whereas vehicle dynamics and composites engineering are engineering specialisms that should not be counted as separate missing occupations without evidence of distinct task-family boundaries.",
        "source_refs": ["FIA_GLOBAL_MOTORSPORT_ENGINEERING"],
        "candidates": [
            {"candidate_key": "D131|race_engineer_inactive", "title_or_family": "Race engineer", "tasks": "Integrates vehicle-performance data and engineering inputs, supports setup and strategy decisions, communicates technical recommendations to drivers and the team, and coordinates performance decisions during competition.", "candidate_gap_basis": "The library has an exact D131 race-engineer record, but it is not among the 25 active D131 links. FIA career guidance confirms motorsport engineering as a distinct work environment and technical pathways; its brochure supports the engineering role context but does not prescribe one universal team title. Reconcile exact role tasks and check the separate D071 motorsport-race-engineer record before considering active D131 coverage.", "title_status": "Established motorsport team role in industry usage; title/task boundary is team- and series-dependent, not a separate ISCO occupational unit.", "source_refs": ["FIA_GLOBAL_MOTORSPORT_ENGINEERING"], "jurisdiction_note": "Global motorsport source; no jurisdiction-specific licensing claim.", "recommendation_status": "existing_role_library_record_inactive; likely domain-specific operational role; cross-domain D071 duplicate and exact-task reconciliation required"}
        ],
    },
    "D132": {
        "coverage_disposition": "8 active links include aerospace engineers, satellite engineers, technicians, astronaut and physicist, but the parent scope expressly includes mission monitoring/control. ESA documents spacecraft controllers and spacecraft operations engineers as distinct mission-control functions; NASA corroborates flight-control work. Treat spacecraft operations as a source-backed family candidate, not as proof every employer title should become a separate role. Astrophysics and astrobiology are research disciplines/specializations, not established missing occupational families in this pass.",
        "source_refs": ["ESA_SPACE_MISSION_CONTROL_ROLES", "NASA_MISSION_OPERATIONS"],
        "candidates": [
            {"candidate_key": "D132|spacecraft_operations_controller_family", "title_or_family": "Spacecraft operations engineer / spacecraft controller", "tasks": "Plans and executes spacecraft operations; monitors telemetry and spacecraft health; prepares or validates procedures and commands; controls spacecraft during contact windows; supports anomaly response and mission safety.", "candidate_gap_basis": "ESA distinguishes spacecraft operations engineers (technical specialists) from spacecraft controllers (operators executing approved procedures). D132's eight active links include satellite engineering but no clearly named spacecraft controller or operations-engineering role, despite this being stated parent scope. NASA supplies corroborative mission-operations task evidence. Compare active satellite-engineer task definitions before deciding if operations tasks are already covered or if one/two distinct pathways are warranted.", "title_status": "Established mission-team role functions documented by two public space agencies; exact title and team structure vary by agency/employer.", "source_refs": ["ESA_SPACE_MISSION_CONTROL_ROLES", "NASA_MISSION_OPERATIONS"], "jurisdiction_note": "ESA and NASA examples; NASA is U.S.-specific. Do not infer a globally uniform title, credential or employer structure.", "recommendation_status": "source_backed_coverage_candidate; compare engineer/controller task boundaries and existing satellite-engineer scope before recommending net-new records"}
        ],
    },
    "D133": {
        "coverage_disposition": "33 active links include aircraft-interior technician, marine upholsterer, interior designer/planner and relevant fitting/restoration crafts, alongside unrelated craft and fashion records that require a separate role-fit audit. Aviation authorities and occupational frameworks describe cabin-interior design/engineering/technician work, but the evidence checked here is jurisdictional or work-discipline evidence; it does not establish an additional globally distinct occupation beyond the active design and technician roles. No global role-coverage addition is established in this batch.",
        "source_refs": ["FAA_CABIN_INTERIOR_SAFETY", "CANADA_AIRCRAFT_INTERIOR_DESIGN", "ICAO_CABIN_MODIFICATION"],
        "candidates": [],
    },
    "D134": {
        "coverage_disposition": "20 active links cover naval architecture, marine machinery, shipboard engineering, vessel assembly and cargo inspection. IMO/STCW defines a distinct Electro-Technical Officer certification/function not explicitly represented by the active keys. Marine surveyor work is evidenced internationally, but exact D134 active naval-architect and cargo-inspector tasks may overlap parts; retain a task-level candidate. Offshore installation engineer is not established as a distinct global occupational family by this pass; do not add it merely because offshore installations occur in parent prose.",
        "source_refs": ["IMO_STCW_ELECTROTECHNICAL_OFFICER", "IMAREST_MARINE_SURVEYOR_TASKS"],
        "candidates": [
            {"candidate_key": "D134|electro_technical_officer_missing", "title_or_family": "Shipboard Electro-Technical Officer (ETO)", "tasks": "Maintains, tests and troubleshoots shipboard electrical, electronic and control systems; performs designated engineering-watch and safety responsibilities under the ship's operating structure.", "candidate_gap_basis": "IMO STCW Regulation III/6 and Code Section A-III/6 prescribe a distinct ETO competency and onboard-training/certification pathway. D134 has marine electrician and marine electronics technician, but these shore/technical titles do not establish coverage of the certificated shipboard officer function. Compare detailed records and avoid duplicate if the active marine engineer/ship duty engineer explicitly includes these officer tasks.", "title_status": "Internationally standardized seafarer certification/function under STCW III/6; implementation is by flag-state administrations.", "source_refs": ["IMO_STCW_ELECTROTECHNICAL_OFFICER"], "jurisdiction_note": "International convention standard; certificate administration remains state-specific.", "recommendation_status": "strong_global_task-family_candidate; exact overlap with ship duty engineer/marine electrician must be checked"},
            {"candidate_key": "D134|marine_surveyor_task_family", "title_or_family": "Marine / ship surveyor", "tasks": "Inspects ships or offshore units against technical rules and condition criteria, witnesses surveys or commissioning, records defects/findings and prepares technical reports for classification, owners, insurers or other clients.", "candidate_gap_basis": "IMarEST maritime job postings describe survey of ships and mobile offshore units under technical rules, distinct from cargo-only inspection. D134 contains a marine cargo inspector and naval architect, but no clearly named hull/class/condition surveyor. Determine whether naval-architect tasks already include survey work before treating this as an additional role family.", "title_status": "Established maritime professional work family; survey purpose, authorization and title depend on classification society, flag, insurer and service context.", "source_refs": ["IMAREST_MARINE_SURVEYOR_TASKS"], "jurisdiction_note": "International maritime-sector evidence from multiple regions; no universal statutory licence asserted.", "recommendation_status": "source_backed_candidate; exact naval-architect and cargo-inspector task overlap review required"}
        ],
    },
}

BATCH_135_139 = {
    "D135": {
        "coverage_disposition": "15 active roles cover nuclear engineers, reactor operators/technicians, radiation protection, nuclear medicine and therapy. IAEA's global guidance names reactor operators, shift supervisors, radiation-protection staff, maintenance and safety roles; D135 represents these task families. Decommissioning appears in parent scope but is a lifecycle/work assignment that may be covered by nuclear engineer, radiation protection and technician roles; no distinct global decommissioning occupation is established here.",
        "source_refs": ["IAEA_NUCLEAR_OPERATIONS_ROLES"],
        "candidates": [],
    },
    "D136": {
        "coverage_disposition": "20 active roles cover aircraft design, assembly, inspection, propulsion, maintenance and systems. The parent scope explicitly names flight-test engineers, but none is active. EASA defines flight test engineer functions and, separately, lead flight-test engineer duties/competence. This is a source-backed specialized engineering-role candidate, with EASA authorization rules explicitly jurisdictional.",
        "source_refs": ["EASA_FLIGHT_TEST_ENGINEER"],
        "candidates": [
            {"candidate_key": "D136|flight_test_engineer_missing", "title_or_family": "Flight test engineer", "tasks": "Plans, instruments, conducts or analyzes aircraft flight tests; evaluates aircraft performance, handling qualities and systems; supports safe test execution and evidence for design validation or airworthiness compliance.", "candidate_gap_basis": "The parent description explicitly says flight-test engineers prove aircraft in the air, while the 20 active D136 roles do not include a flight-test engineer/test engineer. EASA's formal rules define FTE/LFTE functions and required competence for particular flight-test categories. Check whether active aerospace engineer or aircraft engine tester records cover flight-test tasks; they should not be presumed equivalent based on title alone.", "title_status": "Established specialized engineering role; EASA defines functions and some qualification/authorization requirements, but these are not globally uniform occupational licensing rules.", "source_refs": ["EASA_FLIGHT_TEST_ENGINEER"], "jurisdiction_note": "EASA-specific regulatory evidence; no global licensing equivalence inferred.", "recommendation_status": "source_backed_specialized_role_candidate; task comparison with aerospace engineer, test engineer and aircraft engine tester required"}
        ],
    },
    "D137": {
        "coverage_disposition": "9 active links cover medical physics expertise, radiation therapy, nuclear medicine and radiation-protection work. IAEA distinguishes the medical physicist, medical radiation technologist and dosimetrist functions. No medical dosimetrist title is active. The underlying dose-planning function is materially distinct, but IAEA explicitly says the detailed recommended dosimetrist job profile derives from a North American professional source; retain as a bounded candidate rather than claim a globally uniform occupation.",
        "source_refs": ["IAEA_MEDICAL_DOSIMETRY", "IAEA_MEDICAL_RADIATION_TEAM"],
        "candidates": [
            {"candidate_key": "D137|medical_dosimetrist_function", "title_or_family": "Medical dosimetrist / radiotherapy treatment-planning dosimetrist", "tasks": "Calculates and develops radiotherapy dose distributions and treatment plans in collaboration with a medical physicist and radiation oncologist, considering target volumes and dose-limiting structures, under the scope and supervision applicable locally.", "candidate_gap_basis": "IAEA separates dosimetrist work from medical physicist and radiation therapist responsibilities and describes its distinct planning/calculation function. The nine active D137 links do not name a dosimetrist. However, the detailed IAEA job description is based on a North American professional source, and role autonomy/title vary internationally; verify the function in multiple global practice systems before deciding whether to add a global role record or represent it as a specialization/work function.", "title_status": "Distinct clinical function; separate occupational recognition/title is not uniform globally and cited detailed job profile is North American-derived.", "source_refs": ["IAEA_MEDICAL_DOSIMETRY", "IAEA_MEDICAL_RADIATION_TEAM"], "jurisdiction_note": "International IAEA guidance with explicitly North American-derived detailed job-description input; local scope and supervision must be stated.", "recommendation_status": "bounded_candidate; validate international occupational status and compare medical-physics-expert/radiation-therapist task records"}
        ],
    },
    "D138": {
        "coverage_disposition": "15 active links cover biomedical engineering, device design/assembly, research, robotics, laboratory and prosthetics work. IFMBE notes clinical engineering/biomedical engineering/health-technology-management terminology overlap and defines clinical engineering tasks in healthcare technology planning, evaluation, management and support. This is best treated as a specialty/alias candidate within biomedical engineering rather than a confirmed missing occupation; no role addition is established by this source pass.",
        "source_refs": ["IFMBE_CLINICAL_ENGINEERING"],
        "candidates": [],
    },
    "D139": {
        "coverage_disposition": "D139's ScreenSkills evidence establishes two covered role families and one missing-library-record candidate. Gameplay Programmer is represented by the D139 library record 'Gameplay Engineer / Gameplay Programmer' (role 51); Technical Artist is represented by 'technical artist' (role 46) and 'Technical Artist (Games)' (role 52). Environment Artist appears as a D139 audit-queue role key but has no matching exact-title/alias role-library record in role_library_v3.json; generic 3D modeller/digital artist records do not explicitly cover game-environment work under level-design and engine constraints. Treat Environment Artist as a source-backed candidate for manual reconciliation, not as an approved canonical addition. ScreenSkills is UK industry evidence, not a global taxonomy. The earlier claim that all three were exact D139 library records and no materially distinct family was missing is withdrawn.",
        "source_refs": ["IGDA_GAME_DISCIPLINES", "SCREENSKILLS_GAME_ROLE_PROFILES"],
        "candidates": [
            {"candidate_key": "D139|game_environment_artist_family", "title_or_family": "Environment artist (games); aliases: environment modeller, 3D environment artist", "tasks": "Creates playable 3D game environments from concepts, considers level-design/gameplay requirements, and works within game-engine and performance constraints.", "candidate_gap_basis": "ScreenSkills explicitly profiles this game-specific task family and its aliases. No exact Environment Artist, Environment Modeller or 3D Environment Artist role-library record was found for D139 in role_library_v3.json. The D139 active audit/fit queue contains a 'game environment artist' key, but this key is not backed by a matching D139 role-library record. Generic 3D modeller and digital artist records do not specify game-environment asset creation or gameplay/engine constraints. Reconcile whether the queued key maps to a canonical record before claiming role-library coverage.", "title_status": "Explicit games-industry role profile with stated aliases in ScreenSkills; evidence confirms a distinct task family in the UK games sector, but this single national skills-body source does not establish global title standardization.", "source_refs": ["SCREENSKILLS_GAME_ROLE_PROFILES"], "jurisdiction_note": "UK industry skills-body evidence. Do not infer global title prevalence or a jurisdiction-specific credential requirement.", "recommendation_status": "source_backed_missing_role_library_record_candidate; manually reconcile queue key and canonical identity; do not automatically add or activate a role"}
        ],
    },
}

BATCH_140_144 = {
    "D140": {
        "coverage_disposition": "20 active links explicitly include robotics, automation and controls engineers, robot controllers/integrators, and technician/assembly roles. The named parent tasks are represented across design, integration, control and deployment; no materially distinct global role family absent from active coverage was established.",
        "source_refs": ["IFR_ROBOT_SYSTEM_INTEGRATION"],
        "candidates": [],
    },
    "D141": {
        "coverage_disposition": "19 active links cover quantum software, algorithms, cryptography, error correction, hardware, sensing, simulation, systems, policy, products, training and technical practice. This is unusually broad for an emerging sector, but the lane found no distinct globally established occupational family missing from its active titles; some titles are specialisms or evolving employer labels, not proof of standardized occupations.",
        "source_refs": ["OECD_QUANTUM_WORKFORCE"],
        "candidates": [],
    },
    "D142": {
        "coverage_disposition": "36 active links include bioinformatics scientist, biochemist, biologist, geneticist, microbiologist and adjacent biological-science roles. EMBL-EBI describes bioinformatician as a broad term and does not establish computational biologist as a separate occupational family from bioinformatics; the apparent title gap is an alias/specialization boundary, not a confirmed missing role. The mixed set contains apparent parent-scope outliers that belong to the separate role-fit lane and are not corrected here.",
        "source_refs": ["EMBL_EBI_BIOINFORMATICS_ROLE_PROFILE"],
        "candidates": [],
    },
    "D143": {
        "coverage_disposition": "22 active links include digital-forensics work, criminal investigators/detectives, specialist laboratory technicians and medical/pathology roles, but no clearly named crime-scene examiner or forensic reporting scientist. ENFSI's practitioner framework distinguishes scene collection from laboratory analysis and reporting/evidence interpretation; these are materially distinct task functions. Retain both as exact-task coverage candidates. Other cross-domain fit questions in the mixed active set remain outside this lane.",
        "source_refs": ["ENFSI_FORENSIC_PRACTITIONER_ROLES"],
        "candidates": [
            {"candidate_key": "D143|scene_of_crime_examiner_family", "title_or_family": "Crime-scene examiner / scene-of-crime investigator", "tasks": "Assesses and documents a scene, identifies and collects potential material evidence, maintains continuity and contamination controls, and submits material for detailed examination.", "candidate_gap_basis": "ENFSI distinguishes scene examination and collection from laboratory analysis and reporting. D143 contains detectives/investigators and lab technicians but no clearly named forensic scene examiner. Police investigation is not presumed to include forensic evidence collection; compare exact tasks and avoid duplicating any scene-processing duties already encoded elsewhere.", "title_status": "Established forensic-practice function; job title and organizational placement vary by jurisdiction and agency.", "source_refs": ["ENFSI_FORENSIC_PRACTITIONER_ROLES"], "jurisdiction_note": "Professional framework from a multi-institute European network; used as a task-family source, not a Nigeria-specific or universal title/credential claim.", "recommendation_status": "source_backed_task_family_candidate; distinguish crime investigation from forensic scene examination and check other active-domain duplicates"},
            {"candidate_key": "D143|forensic_reporting_scientist_family", "title_or_family": "Forensic scientist / forensic reporting scientist", "tasks": "Examines submitted evidence or directs its examination, interprets analytical findings, prepares a scientific report and may present factual or expert evidence in court.", "candidate_gap_basis": "ENFSI separates reporting-scientist/analyst work from scene collection and general laboratory technician assistance. D143 has scientific laboratory technicians and technical specialties but no clearly named forensic scientist/reporting scientist. Determine whether biology/bacteriology/biochemistry technician tasks or specialized-doctor records cover only analysis support versus independent interpretation/reporting before deciding if a distinct professional role is missing.", "title_status": "Established professional forensic function in ENFSI practice framework; reporting authority, title and court role vary by jurisdiction and discipline.", "source_refs": ["ENFSI_FORENSIC_PRACTITIONER_ROLES"], "jurisdiction_note": "Task-family evidence from an international professional network; no universal credential or legal testimony authority inferred.", "recommendation_status": "source_backed_task_family_candidate; compare scientist, analyst and technician task boundaries and role duplication before recommendation"}
        ],
    },
    "D144": {
        "coverage_disposition": "14 active links cover meteorologists, weather forecasters, climatologists, hydrologists, oceanographers, technicians and aviation meteorology. WMO defines observing/recording weather conditions as a distinct competency function from forecasting. No active title explicitly identifies a meteorological observer, although some meteorology-technician roles may cover instrument and observation duties; retain as a bounded candidate pending task comparison. Do not imply a universally distinct licence/title.",
        "source_refs": ["WMO_METEOROLOGICAL_OBSERVER_FRAMEWORK"],
        "candidates": [
            {"candidate_key": "D144|meteorological_observer_function", "title_or_family": "Meteorological observer / weather observer", "tasks": "Monitors local atmospheric conditions, operates or reads observing instruments, records and quality-checks meteorological parameters, and communicates observations to forecasters and users.", "candidate_gap_basis": "WMO competency frameworks separate weather observation and reporting from forecast production. D144 contains weather forecaster and meteorology technician but no explicit observer title. Establish whether the technician role already owns the full observation function; if so, use a specialization/alias rather than adding a duplicate role.", "title_status": "Established competency-defined work function; service title and whether it is a separate post vary by country and employer.", "source_refs": ["WMO_METEOROLOGICAL_OBSERVER_FRAMEWORK"], "jurisdiction_note": "Global WMO framework; local service structures and qualification routes vary.", "recommendation_status": "bounded_role-function_candidate; exact overlap with meteorology technician and weather forecaster must be resolved"}
        ],
    },
}

BATCH_145_149 = {
    "D145": {
        "coverage_disposition": "12 active links cover clinical neurology/neuropsychology, psychology, physiology and sensory-science tasks. The parent also names brain-computer interfaces. BCI Society sources establish an interdisciplinary BCI research/engineering field and neural-engineering skills, but do not establish a globally standardized neural-engineer occupation. Retain neural engineer/BCI research engineer as an emerging task-family candidate; do not treat the candidate title as canonical or globally standardized.",
        "source_refs": ["BCI_SOCIETY_NEURAL_ENGINEERING"],
        "candidates": [{"candidate_key": "D145|neural_engineer_bci_research_candidate", "title_or_family": "Neural engineer / BCI research engineer", "tasks": "Designs, integrates or evaluates brain-computer interface systems across neural signal acquisition, hardware/software, signal processing and human-subject or clinical/research applications.", "candidate_gap_basis": "The parent explicitly includes brain-computer interfaces, while the 12 active roles cover related neuroscience and clinical/science tasks but no named BCI engineering function. BCI Society supports an interdisciplinary neural-engineering work area, not a standardized occupation; compare current biomedical/electrical/software engineering tasks and research roles before deciding whether this is a distinct role, specialization or project function.", "title_status": "Emerging task-defined workforce candidate; global title standardization not established by the cited source.", "source_refs": ["BCI_SOCIETY_NEURAL_ENGINEERING"], "jurisdiction_note": "International research/professional community evidence; no country-specific pass.", "recommendation_status": "emerging_task_family_candidate; exact role-vs-specialization and duplicate ownership unresolved; no canonical addition"}],
    },
    "D146": {
        "coverage_disposition": "13 active links cover HVAC/electrical/electromechanical engineering and technician work, fire protection, smart-home systems and relevant equipment. ASHRAE identifies commissioning and building-automation competency scopes, but these functions may be performed by existing engineers or commissioning professionals. Retain them as bounded exact-task overlap candidates rather than new role assertions.",
        "source_refs": ["ASHRAE_BUILDING_SYSTEMS"],
        "candidates": [
            {"candidate_key": "D146|building_commissioning_function", "title_or_family": "Building commissioning professional/authority", "tasks": "Plans, coordinates or verifies that building systems are designed, installed, tested and operated to meet owner requirements and performance criteria.", "candidate_gap_basis": "ASHRAE recognizes commissioning competencies, but this may be a responsibility of mechanical/electrical engineers, controls specialists or project professionals already mapped. Compare active role task descriptions before concluding that a distinct occupational record is absent.", "title_status": "Established professional function; title and whether a separate job post exists vary by employer and jurisdiction.", "source_refs": ["ASHRAE_BUILDING_SYSTEMS"], "jurisdiction_note": "International professional-society competence evidence; no universal certification or title claim.", "recommendation_status": "bounded_function_candidate; task overlap with active engineering roles unresolved; no canonical addition"},
            {"candidate_key": "D146|building_automation_controls_function", "title_or_family": "Building automation / controls engineer", "tasks": "Designs, integrates, commissions or maintains controls and automation systems for building mechanical and electrical services.", "candidate_gap_basis": "ASHRAE documents building-automation systems and controls work, but D146 already includes electrical, HVAC and smart-home engineering. Verify whether those active descriptions explicitly cover building-control system design/integration before treating this as an uncovered role.", "title_status": "Recognized building-controls function; title varies and may be a specialization of controls/electrical/HVAC engineering.", "source_refs": ["ASHRAE_BUILDING_SYSTEMS"], "jurisdiction_note": "International professional-society technical scope; no national credential assumptions.", "recommendation_status": "bounded_specialization_or_role_candidate; resolve exact task overlap; no canonical addition"},
        ],
    },
    "D147": {"coverage_disposition": "15 active links span automation/instrumentation engineering and technician work, control-room operations, robotics controls and process-control programming. ISA describes automation as cross-industry design, integration, implementation, maintenance and management practice. The current set covers these major functions; no distinct globally missing occupational family was established in this pass. Do not turn each control technology or ISA credential into a separate role.", "source_refs": ["ISA_AUTOMATION_PROFESSIONS"], "candidates": []},
    "D148": {
        "coverage_disposition": "18 active links cover drilling, petroleum, production, rotating-equipment, surface and welding engineering plus operations. IMCA maintains distinct offshore-survey and ROV/remote-systems competence portfolios. The D148 set has no explicit ROV pilot/technician or offshore surveyor title. Retain both as task-family candidates; exact parent ownership and duplicate cross-domain role links remain unresolved.",
        "source_refs": ["IMCA_OFFSHORE_SURVEY_AND_ROV"],
        "candidates": [
            {"candidate_key": "D148|rov_pilot_technician_family", "title_or_family": "ROV pilot/technician (offshore remote systems)", "tasks": "Operates and maintains remotely operated underwater vehicles and associated tooling, sensors and launch/recovery systems for subsea inspection, intervention or survey operations.", "candidate_gap_basis": "IMCA maintains a dedicated Remote Systems/ROV competence portfolio; no exact ROV pilot/technician title appears in the 18 active D148 roles. Compare the full tasks of existing subsea technicians and marine/offshore roles, and check other active domains before deciding ownership.", "title_status": "Recognized offshore task/competence family; job title and qualification framework vary by employer and region.", "source_refs": ["IMCA_OFFSHORE_SURVEY_AND_ROV"], "jurisdiction_note": "International offshore-contractor framework; not a universal statutory licence.", "recommendation_status": "source_backed_role_family_candidate; exact parent fit and cross-domain duplication unresolved; no canonical addition"},
            {"candidate_key": "D148|offshore_surveyor_family", "title_or_family": "Offshore surveyor / hydrographic surveyor (offshore construction context)", "tasks": "Plans and conducts offshore positioning, hydrographic or construction surveys; validates survey data and supports installation or subsea operations with spatial measurements.", "candidate_gap_basis": "IMCA maintains a dedicated Offshore Survey competence framework and the active D148 roles do not explicitly include offshore surveyor. D156 has surveying occupations, so ownership may be land/surveying versus offshore engineering; compare exact marine/offshore task profiles and avoid duplicate title-based mapping.", "title_status": "Established offshore survey task family; exact title and scope vary by project and sector.", "source_refs": ["IMCA_OFFSHORE_SURVEY_AND_ROV"], "jurisdiction_note": "International offshore framework; no local licence claim.", "recommendation_status": "source_backed_role_family_candidate; D156/D148 ownership and active-role overlap unresolved; no canonical addition"},
        ],
    },
    "D149": {"coverage_disposition": "12 active links cover ambassador, consul, diplomat, embassy/political-affairs, foreign-affairs, international-relations, humanitarian and trade functions. UN Careers documents Political Affairs Officer tasks in political analysis, monitoring and coordination, and D149 already has political-affairs roles. No additional materially distinct global role family was established in this pass. Consular functions are separately recognized, but active consul coverage exists; no duplicate consular title is proposed.", "source_refs": ["UN_CAREERS_POLITICAL_AFFAIRS"], "candidates": []},
}

BATCH_150_154 = {
    "D150": {
        "coverage_disposition": "9 active links cover religious leadership/ministry, chaplaincy, missionary work, pastoral support, religious education, teaching and research. ILO ISCO-08 group 2636 describes religious professionals' rites, spiritual and moral guidance, missions, religious education and counselling; the recorded D150 roles collectively represent these functions. Faith-specific titles and traditions may vary and should not be converted into separate roles without exact task and community-context evidence.",
        "source_refs": ["ILO_ISCO08_RELIGIOUS_PROFESSIONALS"],
        "candidates": [],
    },
    "D151": {
        "coverage_disposition": "20 active links cover criminology, law-enforcement investigations, police management/training, digital forensics, probation, prison operations, correctional supervision and rehabilitation. UNODC separately identifies prosecution personnel and professional judges/magistrates as criminal-justice personnel; neither task family appears in the active D151 keys. They are globally established professions/functions and are candidates because D151's parent scope includes operation of the justice system, but ownership may belong to the law domain. Keep as bounded coverage candidates pending cross-domain exact-task/ownership reconciliation; subgroup membership is not used.",
        "source_refs": ["UNODC_CRIMINAL_JUSTICE_PERSONNEL", "ILO_ISCO08"],
        "candidates": [
            {"candidate_key": "D151|criminal_prosecutor_family", "title_or_family": "Prosecutor / public prosecutor", "tasks": "Makes or supports decisions to prosecute alleged offences, prepares and presents criminal cases in court, and performs prosecution functions under applicable law.", "candidate_gap_basis": "UNODC distinguishes prosecution personnel from police and prison personnel in criminal-justice data; the D151 active list has no prosecutor role. This is a source-backed coverage candidate because the parent says it covers operation of the justice system, but exact placement may be D044/law or another legal domain. Compare active lawyer/prosecutor tasks across domains before any link or role edit.", "title_status": "Established international criminal-justice function; titles and prosecutorial powers vary by jurisdiction.", "source_refs": ["UNODC_CRIMINAL_JUSTICE_PERSONNEL"], "jurisdiction_note": "International UN function categories; do not infer uniform prosecutorial authority or title.", "recommendation_status": "cross_domain_coverage_candidate; verify exact-task duplication and parent ownership; no canonical addition"},
            {"candidate_key": "D151|criminal_judge_magistrate_family", "title_or_family": "Judge / magistrate (criminal jurisdiction)", "tasks": "Conducts criminal court proceedings, evaluates evidence and legal arguments, and issues judicial decisions or orders within the applicable court's jurisdiction.", "candidate_gap_basis": "UNODC separately counts professional judges or magistrates as criminal-justice personnel. No judge/magistrate task record appears in active D151 keys. This may be intentionally owned by a law/judiciary domain; D151's broad parent scope nevertheless warrants an explicit coverage disposition and cross-domain reconciliation.", "title_status": "Established judicial profession/function; court structure, title and jurisdiction vary by legal system.", "source_refs": ["UNODC_CRIMINAL_JUSTICE_PERSONNEL", "ILO_ISCO08_JUDGES"], "jurisdiction_note": "International criminal-justice category; legal authority is jurisdiction-specific.", "recommendation_status": "cross_domain_coverage_candidate; verify exact-task duplication and parent ownership; no canonical addition"},
        ],
    },
    "D152": {
        "coverage_disposition": "13 active links cover archives, museum/exhibition curation, registrar work, museum leadership and cultural-institution functions. ICOM differentiates curatorial, conservation and registrar tasks; the role library has inactive Museum Curator and Conservator records, while active Exhibition Curator is narrower than collection-wide curation and Art Restorer is not automatically equivalent to preventive/collection conservation. ICOMOS ICAHM identifies professional archaeologists and archaeological site managers; none is an exact active D152 title. Retain these as task and activation candidates, not automatic additions.",
        "source_refs": ["ICOM_MUSEUM_PROFESSIONS", "ICOMOS_ARCHAEOLOGY_AND_SITE_MANAGEMENT"],
        "candidates": [
            {"candidate_key": "D152|museum_curator_inactive", "title_or_family": "Museum curator / collections curator", "tasks": "Develops and interprets collections, conducts or coordinates subject research, selects and contextualizes objects, and plans collection care and exhibitions.", "candidate_gap_basis": "The role library contains an inactive Museum Curator record. Active Exhibition Curator covers exhibition organization/display, but does not necessarily cover collection-wide acquisition, interpretation and research. ICOM discusses curator/exhibition-curator tasks; compare the exact stored tasks before deciding whether the inactive record is needed or active exhibition curation already spans it.", "title_status": "Established museum professional family; title and combination of duties vary with institution size and collections.", "source_refs": ["ICOM_MUSEUM_PROFESSIONS"], "jurisdiction_note": "International museum-sector evidence; not a mandatory museum staffing model.", "recommendation_status": "existing_role_library_record_inactive; task-scope overlap review required; no canonical addition"},
            {"candidate_key": "D152|conservator_inactive", "title_or_family": "Conservator / cultural-heritage conservator", "tasks": "Assesses object condition and deterioration risks and plans or carries out preventive and remedial conservation treatment using specialized material and collection-care knowledge.", "candidate_gap_basis": "The role library contains an inactive Conservator record. Art Restorer may focus on corrective treatment, while conservation includes distinct preventive/scientific collection-care responsibilities; ICOM explicitly distinguishes conservator competence from curator competence. Verify active D152 coverage before recommending reactivation.", "title_status": "Established museum/heritage professional function; specialization and regulated title vary by jurisdiction and material.", "source_refs": ["ICOM_MUSEUM_PROFESSIONS"], "jurisdiction_note": "International museum-sector task evidence; credentials and legal title protections vary.", "recommendation_status": "existing_role_library_record_inactive; compare with art-restorer and conservation-scientist tasks; no canonical addition"},
            {"candidate_key": "D152|archaeologist_and_site_manager_family", "title_or_family": "Archaeologist / archaeological site manager", "tasks": "Conducts archaeological research and assessment and/or manages archaeological sites and resources, including conservation planning and cultural-resource-management practice.", "candidate_gap_basis": "The D152 parent explicitly includes archaeology, but no archaeologist or archaeological site manager appears among its active role keys or exact D152 library titles. ICOMOS ICAHM explicitly identifies professional archaeologists and archaeological site managers as distinct professional-network roles and defines relevant research/management practice. Check cross-domain role duplicates and local library identity before any canonical decision.", "title_status": "Recognized professional task families in international archaeological-heritage practice; job titles and legal authority vary across countries.", "source_refs": ["ICOMOS_ARCHAEOLOGY_AND_SITE_MANAGEMENT"], "jurisdiction_note": "International professional-network evidence; no national licensing claim.", "recommendation_status": "source_backed_coverage_candidate; verify exact role-library identity and cross-domain ownership; no canonical addition"},
        ],
    },
    "D153": {
        "coverage_disposition": "D153 has zero active role links despite an in-scope student catalogue entry. The checked-in D153 library contains 30 role records, and the broader domain audit contains additional curated candidates, but none is active; therefore the student-facing role coverage is genuinely absent, not merely sparse. Existing library records include music producer, composer, arranger, musician, singer, conductor, sound designer/editor, mastering engineer, recording-studio technician and audio-production technician. AES describes professional audio-production role families and ISCO-08 provides global music-occupation groups. Treat activation and exact scope reconciliation as the next work, with interactive/spatial-audio titles still emerging and requiring additional validation; no automatic canonical changes.",
        "source_refs": ["AES_AUDIO_PRODUCTION_ROLE_FAMILIES", "ILO_ISCO08_MUSIC_OCCUPATIONS"],
        "candidates": [
            {"candidate_key": "D153|music_creation_and_performance_library_family", "title_or_family": "Composer, arranger, musician, singer, conductor and music director (existing D153 library records)", "tasks": "Creates, arranges, interprets, performs or leads music for recording, broadcast or live audiences.", "candidate_gap_basis": "Zero active D153 links means none of the existing music-creation/performance library roles is currently available through the domain path. ILO ISCO-08 includes a global musicians/singers/composers group; current library records contain the named tasks. These are existing-record coverage candidates, not new titles.", "title_status": "Established creative and performing occupational families in ISCO-08; specific titles and portfolio employment vary.", "source_refs": ["ILO_ISCO08_MUSIC_OCCUPATIONS"], "jurisdiction_note": "Global classification evidence; no country-specific context assessed.", "recommendation_status": "existing_D153_library_family_inactive; reconcile and activate only after task and domain-fit review; no canonical addition"},
            {"candidate_key": "D153|recording_and_audio_production_library_family", "title_or_family": "Music producer, recording engineer, mixer, mastering engineer, recording-studio technician and audio-production technician (existing D153 records)", "tasks": "Plans and produces recordings; captures, edits, mixes, masters or technically supports recorded/live music and audio delivery.", "candidate_gap_basis": "No active D153 links cover these recorded-audio functions. Existing D153 role-library rows include music producer, sound mastering engineer, recording studio technician and audio production technician; AES materials identify recording engineers and mixers as distinct production roles. Determine whether the library's role scope and production contexts should be represented as separate records or aliases before activating.", "title_status": "Established audio-production work families; exact title boundaries and role combination vary by studio, live venue and production scale.", "source_refs": ["AES_AUDIO_PRODUCTION_ROLE_FAMILIES", "ILO_ISCO08_MUSIC_OCCUPATIONS"], "jurisdiction_note": "AES is an international professional society; ISCO provides global group context. No local labour-market inference.", "recommendation_status": "existing_D153_library_family_inactive; reconcile role boundaries and activate only after exact-task review; no canonical addition"},
            {"candidate_key": "D153|sound_design_and_postproduction_library_family", "title_or_family": "Sound designer, sound editor, dialogue editor, Foley artist and re-recording mixer (existing or curated D153 records)", "tasks": "Designs, edits, creates and mixes sound elements for music, performance and audiovisual media.", "candidate_gap_basis": "Zero active D153 links leave sound design and post-production audio work unrepresented. The D153 library includes sound designer/editor, while the audit-added library candidates identify Foley and dialogue/mix functions. AES identifies sound-design and mixing families, but exact D153 scope includes music plus media; reconcile duplicates with film/broadcast domains before any activation.", "title_status": "Established task families across production media; dedicated titles and whether posts are separate vary by employer and medium.", "source_refs": ["AES_AUDIO_PRODUCTION_ROLE_FAMILIES"], "jurisdiction_note": "International professional-audio context; cross-media ownership must be checked globally, not inferred from title.", "recommendation_status": "existing_or_curated_library_candidates_inactive; cross-domain task and ownership review required; no canonical addition"},
        ],
    },
    "D154": {
        "coverage_disposition": "17 active links cover clinical exercise/rehabilitation, physiotherapy, exercise physiology, fitness instruction/coaching, nutrition and sports medicine. FIMS describes sports-medicine collaboration with sport scientists, including biomechanics, biochemistry and physiology. The active set includes Exercise Physiologist and Kinesiologist, so general exercise-science foundations are covered; a distinct applied sport-science/performance-analysis function is not explicit. The library contains inactive strength-and-conditioning and sports-scientist/performance-analyst records; retain them as bounded candidates because overlap with exercise physiologist/kinesiologist and coaches must be resolved.",
        "source_refs": ["FIMS_SPORT_SCIENCE_TEAM"],
        "candidates": [
            {"candidate_key": "D154|sports_scientist_performance_analyst_inactive", "title_or_family": "Sports scientist / sports performance analyst", "tasks": "Applies exercise and sport science methods, physiological/biomechanical measurement and performance data to evaluate athletes or physical performance and inform training or competition decisions.", "candidate_gap_basis": "The active set contains exercise physiologist and kinesiologist but no exact sports scientist/performance analyst title. FIMS explicitly identifies sport scientists and specialist science functions in an interdisciplinary team; the role library contains an inactive sports-scientist/performance-analyst record. Determine whether that record's task boundary is materially distinct from exercise physiology and coaching before treating it as an uncovered role.", "title_status": "Established sport-science function; exact professional title, qualification and sport-performance-analysis scope vary internationally.", "source_refs": ["FIMS_SPORT_SCIENCE_TEAM"], "jurisdiction_note": "International sports-medicine professional guidance; no universal credential or licensed-title claim.", "recommendation_status": "existing_role_library_record_inactive; bounded overlap candidate; compare exact tasks with exercise physiologist, kinesiologist and coach; no canonical addition"},
            {"candidate_key": "D154|strength_and_conditioning_coach_inactive", "title_or_family": "Strength and conditioning coach", "tasks": "Designs and delivers evidence-informed physical preparation programs to develop strength, power, speed, endurance and movement qualities for sport or performance contexts.", "candidate_gap_basis": "An inactive D154 library record exists, but active personal trainers and exercise physiologists may overlap. FIMS confirms an interdisciplinary sports-performance context but does not itself define this specific job profile. Retain as a task-overlap candidate rather than assert a missing global occupation from this evidence alone.", "title_status": "Common applied sport-performance title, but international scope and credentialing vary; current primary-source support in this batch is insufficient to claim uniform global standardization.", "source_refs": ["FIMS_SPORT_SCIENCE_TEAM"], "jurisdiction_note": "No jurisdiction-specific credentials assessed; further global professional-body evidence required before any canonical decision.", "recommendation_status": "existing_role_library_record_inactive; evidence-bounded overlap candidate; seek role-specific international task source before any activation; no canonical addition"},
        ],
    },
}

SOURCES.update({
    "ISO_TC229_NANOTECHNOLOGY_SCOPE": {
        "publisher": "International Organization for Standardization (ISO), Technical Committee 229",
        "url": "https://www.iso.org/committee/381983.html",
        "source_scope": "International nanotechnology standards committee scope.",
        "supports": "Defines committee work across nanotechnology terminology, metrology and instrumentation, test methods, modelling/simulation, and health, safety and environmental practice; useful for task coverage boundaries in nanomaterials work.",
        "limit": "A standards work programme does not establish job titles or show that any particular candidate occupation is globally standardized.",
    },
    "FIG_SURVEYOR_AND_CADASTRE_FUNCTIONS": {
        "publisher": "International Federation of Surveyors (FIG)",
        "url": "https://www.fig.net/organisation/comm/7/library/reports/cadastre/statement_on_cadastre.html",
        "source_scope": "International surveying and cadastral-function framework; explicitly allows national variation in cadastre systems and professional responsibilities.",
        "supports": "Defines cadastral surveying as identifying, demarcating, measuring and mapping legal parcel boundaries; FIG surveyor functions also include geodetic measurement, spatial information and mapping.",
        "limit": "Does not prescribe a uniform national job title or authorize the product to infer licensure; exact statutory scope varies by jurisdiction.",
    },
    "OECD_TRANSFER_PRICING_FRAMEWORK": {
        "publisher": "Organisation for Economic Co-operation and Development (OECD)",
        "url": "https://www.oecd.org/en/publications/2022/01/oecd-transfer-pricing-guidelines-for-multinational-enterprises-and-tax-administrations-2022_57104b3a.html",
        "source_scope": "International consensus guidance for transfer pricing between multinational associated enterprises and tax administrations.",
        "supports": "Establishes the substantive transfer-pricing practice context, including arm's-length analysis and documentation; supports distinguishing transfer-pricing work from generic bookkeeping or tax compliance.",
        "limit": "This is technical/tax-administration guidance, not an occupational taxonomy. Job titles, admission rules and whether a specialist post exists vary by jurisdiction and employer.",
    },
    "CFA_INVESTMENT_BANKING_AND_CREDIT": {
        "publisher": "CFA Institute",
        "url": "https://www.cfainstitute.org/programs/cfa-program/careers/investment-banker",
        "source_scope": "International investment profession body career guidance, with role examples from financial markets; not a statutory global occupation code.",
        "supports": "Describes investment-banking tasks such as capital raising, securities issuance, M&A, restructuring and debt/equity advisory; CFA career materials distinguish credit-risk analysis from broad securities and investment analysis.",
        "limit": "Career profiles establish task distinctions, not universal title prevalence or exclusive assignment to this product's domain.",
    },
    "AFP_TREASURY_FUNCTIONS": {
        "publisher": "Association for Financial Professionals (AFP)",
        "url": "https://www.afponline.org/topics/treasury/treasury-management-defined",
        "source_scope": "Professional treasury-management body; internationally relevant function descriptions, with credential/employer structures varying across markets.",
        "supports": "Describes treasury work in liquidity, cash, financial risk and funding management, supporting a task distinction from corporate accounting and investment-banking advisory.",
        "limit": "Professional practice evidence does not establish that a dedicated corporate-treasurer post is universal or missing from active roles without task comparison.",
    },
    "STRUCTURED_FINANCE_ANALYST_TASKS": {
        "publisher": "Structured Finance Association (SFA), including published structured-finance role profiles",
        "url": "https://structuredfinance.org/careers/securitized-products-credit-analyst/",
        "source_scope": "Professional association and employer-posted structured-finance roles; examples are market/employer-specific rather than a global occupation classification.",
        "supports": "Documents securitized-credit work analyzing ABS/RMBS, transaction cash flows, collateral and market fundamentals, surveillance, credit opinions and investment recommendations.",
        "limit": "Role postings prove task patterns, not universal title standardization; distinguish this specialization from existing general credit and securities analyst tasks before treating it as a separate role.",
    },
    "AICI_IMAGE_CONSULTING_SCOPE": {
        "publisher": "Association of Image Consultants International (AICI)",
        "url": "https://www.aici.org/page/Helpful_FAQs?page=Discover_the_Career",
        "source_scope": "International professional association for personal and corporate image consultants.",
        "supports": "Describes image consulting services including wardrobe development/management, personal shopping, color/body analysis, communication coaching, etiquette and corporate image work.",
        "limit": "AICI supports the profession and task scope, but personal stylist, fashion stylist and image consultant titles overlap and are not necessarily legally protected or globally uniform.",
    },
    "UNHCR_PROTECTION_AND_RSD_FUNCTIONS": {
        "publisher": "United Nations High Commissioner for Refugees (UNHCR)",
        "url": "https://emergency.unhcr.org/protection/legal-framework/refugee-status-determination-rsd",
        "source_scope": "International refugee-protection framework; implementation may be by governments or UNHCR under distinct mandates and national procedures.",
        "supports": "Defines refugee status determination as a legal/administrative process and documents protection assessment, legal protection and asylum-related functions.",
        "limit": "These functions do not establish one universal job title or confer legal authority; role labels and mandate vary by jurisdiction and organization.",
    },
    "WFP_HUMANITARIAN_LOGISTICS_FUNCTIONS": {
        "publisher": "United Nations World Food Programme (WFP), Logistics Cluster operations guidance",
        "url": "https://www.wfp.org/operations/200685-aviation-services-logistics-augmentation-and-cluster-coordination-response-floods",
        "source_scope": "International humanitarian operations and logistics coordination; operational staffing depends on emergency and country context.",
        "supports": "Documents humanitarian logistics coordination, common services, transport/cargo support and information-management functions in emergency response.",
        "limit": "Operational examples establish work functions but not a universal occupational taxonomy or identical job structure across emergencies.",
    },
    "WIPO_PATENT_AGENT_FUNCTIONS": {
        "publisher": "World Intellectual Property Organization (WIPO)",
        "url": "https://www.wipo.int/edocs/mdocs/scp/en/scp_12/scp_12_3_rev_2.pdf",
        "source_scope": "International IP system analysis comparing patent-professional functions across national legal systems.",
        "supports": "Describes patent-agent/attorney functions such as advising applicants, preparing and prosecuting patent applications, representing clients before patent offices and supporting maintenance/opposition/enforcement.",
        "limit": "WIPO explicitly cautions that patent attorney/agent titles, qualifications and powers differ by country; do not present a single global license or legal scope.",
    },
    "UITP_PUBLIC_TRANSPORT_PLANNING_OPERATIONS": {
        "publisher": "International Association of Public Transport (UITP)",
        "url": "https://www.uitp.org/fr/evenements/diploma-programme-managers-in-public-transport-2026-2027/",
        "source_scope": "International public-transport association practice and management curriculum.",
        "supports": "Distinguishes network/service planning (demand, capacity, accessibility, route/network design and timetables) from execution and operations planning (vehicles, personnel, rostering, reliability and disruption management).",
        "limit": "The source validates functions, not a mandatory role taxonomy; tasks may be combined in agencies/operators and overlap with transport planning/management titles.",
    },
})

BATCH_155_159 = {
    "D155": {
        "coverage_disposition": "16 active links cover materials research/engineering, chemistry, metrology, semiconductor processing, nanofabrication and nanoelectronics. ISO/TC 229 confirms the parent scope's distinct technical work areas—measurement/characterization, test methods, modelling and safety—but does not validate the library's specialist titles as separate occupations. Four existing inactive D155 library records (materials characterization scientist, computational materials scientist, materials/polymer engineer, metallurgical engineer) warrant exact-task reconciliation; characterization and computational materials work may be specialisms of materials science/engineering rather than separate global job families. No new title is proposed.",
        "source_refs": ["ISO_TC229_NANOTECHNOLOGY_SCOPE"],
        "candidates": [
            {"candidate_key": "D155|materials_characterization_and_computational_science_inactive", "title_or_family": "Materials characterization scientist / computational materials scientist (existing inactive D155 records)", "tasks": "Characterizes composition, structure and properties of materials using measurement/analysis methods; computational materials work models or simulates material structure, behaviour and properties.", "candidate_gap_basis": "ISO/TC 229 identifies metrology, instrumentation, test methodologies, modelling and simulation as distinct technical work areas. D155 active coverage has a metrologist and materials engineers, but those titles alone do not prove dedicated characterization or computational tasks are represented. The exact titles already exist as inactive records; establish whether their task profiles describe separate jobs or specialisms within materials science/engineering before any activation.", "title_status": "Established technical functions; the cited ISO committee scope does not establish these exact titles as globally standardized occupational families.", "source_refs": ["ISO_TC229_NANOTECHNOLOGY_SCOPE"], "jurisdiction_note": "International standards scope only; no country-specific workforce or credential inference.", "recommendation_status": "existing_inactive_library_records; task coverage and role-versus-specialization boundary unresolved; no canonical addition"}
        ],
    },
    "D156": {
        "coverage_disposition": "11 active links cover general/geodetic, land, hydrographic, cadastral, mine and marine surveying plus mapping/GIS. FIG defines cadastral boundary survey and broader surveyor functions, while its framework expressly allows national variation. The checked-in library has inactive geodesist and photogrammetrist records; FIG/ISCO-type task families make both worth reconciliation, but D156's active geodetic surveyor and cartographer may already cover their work. Quantity and real-estate surveyors are present but their task descriptions are cost/valuation-focused, not assumed to satisfy land-boundary work.",
        "source_refs": ["FIG_SURVEYOR_AND_CADASTRE_FUNCTIONS", "ILO_ISCO08"],
        "candidates": [
            {"candidate_key": "D156|geodesist_inactive", "title_or_family": "Geodesist (existing inactive D156 library record)", "tasks": "Determines geodetic reference positions and models the Earth's shape/gravity or spatial reference framework used to position and map land and infrastructure.", "candidate_gap_basis": "FIG's surveyor definition includes determining the Earth's size/shape and measurement of positions; active D156 contains geodetic surveyors. Compare the exact geodesist record tasks against that active role before deciding whether the distinct research/reference-frame function is already covered or only a specialization.", "title_status": "Established surveying/geodesy professional function; whether it is a separate post or surveyor specialization varies.", "source_refs": ["FIG_SURVEYOR_AND_CADASTRE_FUNCTIONS"], "jurisdiction_note": "International professional framework; local licensing and legal authority are not inferred.", "recommendation_status": "existing_inactive_library_record; possible alias/specialization of geodetic surveyor; exact task duplication unresolved; no canonical addition"},
            {"candidate_key": "D156|photogrammetrist_inactive", "title_or_family": "Photogrammetrist (existing inactive D156 library record)", "tasks": "Derives measurements, positions, terrain or feature representations from overlapping aerial, satellite or close-range imagery using photogrammetric methods.", "candidate_gap_basis": "FIG identifies aerial-photography/photogrammetric methods as ways to undertake cadastral surveying; the D156 parent description explicitly includes photogrammetrists, yet no exact photogrammetrist title is active. Compare its record tasks with active cartographer and GIS specialist; image-based measurement and map production may overlap but are not presumed identical.", "title_status": "Recognized technical/professional function; organizational placement and whether it is a separate job vary by employer and country.", "source_refs": ["FIG_SURVEYOR_AND_CADASTRE_FUNCTIONS", "ILO_ISCO08"], "jurisdiction_note": "International surveying framework; no local licence claim.", "recommendation_status": "existing_inactive_library_record; source-backed bounded coverage candidate; compare exact tasks with cartographer/GIS and geodetic surveyor; no canonical addition"}
        ],
    },
    "D157": {
        "coverage_disposition": "0 active role links: the student-facing Tax Advisory and Transfer Pricing domain has no active role path. The exact role library already contains inactive tax advisor, tax inspector, transfer pricing specialist and international tax consultant records, so this is a missing-coverage/reconciliation condition—not a lack of titles to invent. OECD transfer-pricing guidance establishes a substantive practice area but not a standardized occupation. Separate tax advisory/compliance from cross-border transfer-pricing analysis only where existing task records support distinct pathways; titles, legal practice rights and specialist-post prevalence vary by jurisdiction.",
        "source_refs": ["OECD_TRANSFER_PRICING_FRAMEWORK", "ILO_ISCO08"],
        "candidates": [
            {"candidate_key": "D157|tax_advisory_and_compliance_existing_records", "title_or_family": "Tax adviser / tax inspector / international tax consultant (existing inactive D157 records)", "tasks": "Advises on tax obligations and planning, interprets tax law, supports compliance and documentation, or administers/audits tax obligations within applicable authority and legal scope.", "candidate_gap_basis": "There are no active D157 links, while the exact domain library contains existing inactive tax-advisory, inspection and international-tax records. ILO's occupational classification and the parent scope support tax-accounting/advisory functions; however, tax inspector is a public authority function and adviser/consultant titles or reserved legal powers differ by country. Reconcile the existing task records and avoid presenting them as one interchangeable role.", "title_status": "Established tax work functions; title, public/private status, reserved practice and qualifications vary by jurisdiction.", "source_refs": ["ILO_ISCO08"], "jurisdiction_note": "Global occupational-family context only; national tax-law powers and credentials must remain explicitly jurisdiction-specific.", "recommendation_status": "zero_active_domain_with_existing_inactive_records; reconcile each record's task and jurisdiction boundary; no canonical addition"},
            {"candidate_key": "D157|transfer_pricing_specialist_existing_record", "title_or_family": "Transfer pricing specialist (existing inactive D157 record)", "tasks": "Analyzes related-party cross-border transactions, functional and economic facts, pricing methods and comparable evidence; prepares or reviews transfer-pricing documentation and supports tax-risk/dispute processes.", "candidate_gap_basis": "OECD guidelines establish an international technical framework for the arm's-length principle and transfer-pricing documentation. The existing D157 library has an inactive transfer-pricing specialist record, but OECD is not an occupation standard. Determine whether the role is a distinct specialist pathway or a specialization within international tax advisory; do not claim universal standalone employment/title status.", "title_status": "Established specialist practice area; standalone title and role structure are employer- and jurisdiction-dependent.", "source_refs": ["OECD_TRANSFER_PRICING_FRAMEWORK"], "jurisdiction_note": "International framework with local tax-law application; no national variant or universal credential inferred.", "recommendation_status": "existing_inactive_library_record; source-backed practice-area coverage candidate; role-versus-specialization and task scope unresolved; no canonical addition"}
        ],
    },
    "D158": {
        "coverage_disposition": "20 active links cover investment analysis, securities research, M&A, brokerage, banking management, accounting/control, fraud, audit and treasury-adjacent work. CFA Institute defines investment banking tasks including capital raising, securities issuance, M&A, restructuring and debt/equity advisory; the inactive exact-domain investment-banker record should be compared with active M&A/securities analyst records. The library also has an inactive corporate treasurer record; AFP's cash/liquidity/risk scope suggests a distinct corporate treasury function, but active financial controller/middle-office tasks may overlap. Both remain candidates, not approved additions.",
        "source_refs": ["CFA_INVESTMENT_BANKING_AND_CREDIT", "AFP_TREASURY_FUNCTIONS"],
        "candidates": [
            {"candidate_key": "D158|investment_banker_inactive", "title_or_family": "Investment banker (existing inactive D158 library record)", "tasks": "Advises corporate or institutional clients on raising capital, issuing securities, mergers and acquisitions, restructuring, and debt/equity transactions.", "candidate_gap_basis": "CFA Institute describes these advisory and transaction-execution functions; no active D158 role is named investment banker. Active M&A analyst and securities analyst may cover pieces of the work but are not presumed to cover client advisory, capital raising and execution responsibilities. Compare their exact role tasks with the existing inactive record.", "title_status": "Established finance profession; seniority/title structures vary by institution and market.", "source_refs": ["CFA_INVESTMENT_BANKING_AND_CREDIT"], "jurisdiction_note": "International professional-career evidence; no national licensing or universal job-title hierarchy inferred.", "recommendation_status": "existing_inactive_library_record; source-backed coverage candidate; compare M&A/securities analyst tasks before any activation; no canonical addition"},
            {"candidate_key": "D158|corporate_treasurer_inactive", "title_or_family": "Corporate treasurer (existing inactive D158 library record)", "tasks": "Manages organizational cash, liquidity, funding and financial risks, including treasury policy and financing decisions.", "candidate_gap_basis": "AFP distinguishes treasury management's cash, liquidity and financial-risk remit. D158 includes middle-office analyst and financial controller, but their current titles alone do not prove ownership of enterprise treasury strategy. Compare exact task profiles and whether the role belongs to D158 or a treasury/finance domain before any change.", "title_status": "Established senior finance function; a dedicated treasurer post is not universal and title varies by organization.", "source_refs": ["AFP_TREASURY_FUNCTIONS"], "jurisdiction_note": "International professional-body function description; employer structure varies.", "recommendation_status": "existing_inactive_library_record; bounded coverage and parent-ownership candidate; no canonical addition"}
        ],
    },
    "D159": {
        "coverage_disposition": "27 active links include credit analyst, credit-risk analyst, credit manager, loan/mortgage underwriting, securities and investment-analysis functions. Credit-analysis coverage is present. SFA role profiles describe securitized-finance analysts evaluating structured transactions, collateral cash flows, credit enhancement, documentation and surveillance—work more specific than general borrower credit analysis. Existing inactive D159 records for structured finance analyst and fixed-income analyst should be checked against active securities/credit analyst tasks; only the structured-finance task boundary remains a defensible bounded candidate, not an automatic addition.",
        "source_refs": ["STRUCTURED_FINANCE_ANALYST_TASKS", "CFA_INVESTMENT_BANKING_AND_CREDIT"],
        "candidates": [
            {"candidate_key": "D159|structured_finance_analyst_inactive", "title_or_family": "Structured finance analyst (existing inactive D159 library record)", "tasks": "Analyzes structured/securitized transactions, asset pools and transaction documents; models cash flows and credit enhancement; assesses credit risk and monitors deal performance.", "candidate_gap_basis": "SFA role profiles document ABS/RMBS and structured-credit analysis tasks including cashflow modelling, transaction-document analysis, ratings/credit opinions and surveillance. D159 has general credit and securities analysts, but no active exact structured-finance analyst. Compare those active task profiles with the existing inactive record and check overlap with D158 before concluding a distinct domain placement.", "title_status": "Established specialist work family in structured-credit employers; exact standalone title varies and the cited postings are employer-specific examples, not a global occupational standard.", "source_refs": ["STRUCTURED_FINANCE_ANALYST_TASKS"], "jurisdiction_note": "International industry with task evidence from employer postings; no universal credential or licensing claim.", "recommendation_status": "existing_inactive_library_record; bounded source-backed candidate; exact task and D158/D159 ownership reconciliation required; no canonical addition"}
        ],
    },
}

BATCH_160_164 = {
    "D160": {
        "coverage_disposition": "12 active links are concentrated in fashion design/modeling, hair styling and salon functions. The parent explicitly includes fashion styling, image consulting and personal shopping, while the exact library has inactive fashion-stylist and wardrobe/personal-shopper records. AICI describes image consulting and personal-shopping services, but those titles overlap and are not uniformly protected. Retain one bounded existing-record reconciliation candidate; do not mistake fashion designers or hairdressers for wardrobe/image-consulting coverage.",
        "source_refs": ["AICI_IMAGE_CONSULTING_SCOPE"],
        "candidates": [{"candidate_key": "D160|fashion_stylist_and_personal_shopper_inactive", "title_or_family": "Fashion/wardrobe stylist and personal shopper (existing inactive D160 records)", "tasks": "Advises or styles individuals/clients through wardrobe selection, outfit coordination and personal shopping; image consultants may extend into color, presentation, communication and corporate image services.", "candidate_gap_basis": "The parent explicitly includes styling, image consulting and personal shopping, but active D160 links cover designers, models, hair and salon work rather than an exact stylist/shopper. AICI identifies personal shopping and wardrobe/image services. Exact scope overlaps between fashion stylist, personal stylist and image consultant; reconcile existing library tasks rather than creating three presumed occupations.", "title_status": "Established service functions; titles overlap, and AICI notes services vary by practitioner; legal protection/global standardization is not established.", "source_refs": ["AICI_IMAGE_CONSULTING_SCOPE"], "jurisdiction_note": "International professional association evidence; credentials/services are not universal legal requirements.", "recommendation_status": "existing_inactive_library_records; explicit parent-scope coverage gap candidate; reconcile alias/task boundaries; no canonical addition"}],
    },
    "D161": {
        "coverage_disposition": "18 active links cover emergency medical response, disaster management, crisis support, rescue, emergency coordination and monitoring/evaluation. The broad parent also explicitly covers humanitarian aid and international development. UNHCR/WFP sources document protection assessment/legal protection and humanitarian logistics/coordinating functions; exact D161 library records already include humanitarian project officer/aid worker, logistics officer and humanitarian adviser candidates, but no exact active humanitarian-programme or humanitarian-logistics pathway is present. Treat these as cross-domain coverage candidates; emergency response work is not presumed to imply all humanitarian development tasks.",
        "source_refs": ["UNHCR_PROTECTION_AND_RSD_FUNCTIONS", "WFP_HUMANITARIAN_LOGISTICS_FUNCTIONS"],
        "candidates": [
            {"candidate_key": "D161|humanitarian_programme_and_protection_functions", "title_or_family": "Humanitarian project officer / aid worker / protection officer (existing D161 library candidates and source-defined functions)", "tasks": "Assesses crisis-affected populations' protection and assistance needs; plans, coordinates, monitors and reports humanitarian programmes and referrals with affected people and response partners.", "candidate_gap_basis": "UNHCR describes protection assessments, legal protection and asylum/refugee status functions. D161's active set is emergency/disaster-heavy and lacks a named active humanitarian protection/programme role. Existing library candidates include a humanitarian project officer/aid worker. Exact role mandate and overlap with crisis social worker/humanitarian adviser need checking; do not assert a universally standardized title.", "title_status": "Established humanitarian functions; job titles and mandate differ across UN agencies, NGOs and governments.", "source_refs": ["UNHCR_PROTECTION_AND_RSD_FUNCTIONS"], "jurisdiction_note": "International humanitarian framework; actual authority and casework mandates are organization- and jurisdiction-specific.", "recommendation_status": "existing_library_candidate_and_source_backed_function; exact role boundary and overlap unresolved; no canonical addition"},
            {"candidate_key": "D161|humanitarian_logistics_function", "title_or_family": "Humanitarian logistics officer / coordinator (existing D161 library candidate)", "tasks": "Coordinates emergency supply chains, cargo/transport, storage, common logistics services and logistics information/partner coordination for humanitarian response.", "candidate_gap_basis": "WFP documents dedicated logistics officers/coordinators and logistics information-management functions in emergency operations. D161 has procurement and emergency-response roles but no active named humanitarian logistics pathway; the existing exact-domain library includes a humanitarian logistics officer candidate. Check procurement-specialist and general emergency-coordinator task profiles before a placement decision.", "title_status": "Established humanitarian operational function; role title and whether functions are combined vary by response and organization.", "source_refs": ["WFP_HUMANITARIAN_LOGISTICS_FUNCTIONS"], "jurisdiction_note": "International humanitarian operations evidence; no national role structure inferred.", "recommendation_status": "existing_library_candidate; source-backed function; compare procurement/emergency coordination tasks and cross-domain duplicates; no canonical addition"}
        ],
    },
    "D162": {
        "coverage_disposition": "8 active links cover customs/border inspection, immigration advice, policy and passport administration. UNHCR describes refugee-status determination as a legal/administrative process, but national asylum decision-making and representation powers vary. The exact library has an inactive immigration-lawyer/adviser caseworker family. Retain asylum/refugee legal casework as a bounded existing-record candidate; no separate universal asylum officer title is inferred, and national immigration officer coverage is already present.",
        "source_refs": ["UNHCR_PROTECTION_AND_RSD_FUNCTIONS"],
        "candidates": [{"candidate_key": "D162|immigration_lawyer_and_asylum_caseworker_inactive", "title_or_family": "Immigration lawyer / solicitor and immigration adviser / asylum caseworker (existing inactive D162 records)", "tasks": "Advises or represents clients on immigration/asylum law and applications, prepares evidence and submissions, and supports case progression or status-determination procedures within local legal authority.", "candidate_gap_basis": "D162 active links include an immigration adviser but do not clearly distinguish regulated legal representation/asylum casework from general immigration advice. UNHCR establishes the RSD function; the exact D162 library contains inactive lawyer/caseworker records. Compare current adviser task scope and local legal-authority limits before deciding whether a separate pathway is needed.", "title_status": "Established legal/advisory work functions; title, reserved representation and decision authority vary substantially by jurisdiction.", "source_refs": ["UNHCR_PROTECTION_AND_RSD_FUNCTIONS"], "jurisdiction_note": "International refugee-process evidence; do not imply uniform asylum procedure or legal practice rights.", "recommendation_status": "existing_inactive_library_candidate; task and legal-authority boundary unresolved; no canonical addition"}],
    },
    "D163": {
        "coverage_disposition": "6 active links cover IP consulting, legal assistance, licensing and patent-engineering support, but no active patent/trademark representative is named. WIPO describes patent-agent/attorney functions in application preparation/prosecution and representation before patent offices, while explicitly warning that title, qualification and legal powers vary by country. Existing inactive D163 records include patent attorney/agent, trademark attorney and IP paralegal/administrator. These are source-backed candidates for reconciliation; do not treat one title or authority as universal.",
        "source_refs": ["WIPO_PATENT_AGENT_FUNCTIONS"],
        "candidates": [{"candidate_key": "D163|patent_and_trademark_representative_inactive", "title_or_family": "Patent attorney/agent and trademark attorney (existing inactive D163 records)", "tasks": "Advises on, prepares and prosecutes patent/trademark applications, represents applicants before IP offices where authorized, and supports maintenance, opposition, licensing or enforcement matters.", "candidate_gap_basis": "WIPO details patent-agent functions and explains terminology/qualification variation; active D163 patent engineer and licensing/legal-assistance roles do not by themselves establish authority to prosecute or represent before an IP office. Exact inactive records exist for patent/trademark representatives. Reconcile overlap with lawyer/corporate lawyer and jurisdiction-specific authorization before activation.", "title_status": "Established professional functions; exact titles and legal powers vary by jurisdiction and are not globally interchangeable.", "source_refs": ["WIPO_PATENT_AGENT_FUNCTIONS"], "jurisdiction_note": "International IP-system evidence; local authorization must be stated separately.", "recommendation_status": "existing_inactive_library_records; strong functional coverage candidate; title/authority and legal-role overlap require local qualification boundaries; no canonical addition"}],
    },
    "D164": {
        "coverage_disposition": "20 active links cover transport/urban planning, public mobility services, rail and air/water traffic control, engineering, airport planning and smart-city consulting. UITP distinguishes strategic/network planning from service operations planning and execution; active transport planner, mobility services manager and rail/air/water traffic roles provide broad coverage. No materially distinct global role family absent from the checked active titles was established by this source pass. This does not certify each existing role's domain fit, which remains a separate exact-task audit.",
        "source_refs": ["UITP_PUBLIC_TRANSPORT_PLANNING_OPERATIONS"],
        "candidates": [],
    },
}

SOURCES.update({
    "NBHWC_HEALTH_WELLNESS_COACH_COMPETENCIES": {
        "publisher": "National Board for Health & Wellness Coaching (NBHWC)",
        "url": "https://nbhwc.org/nbhwc-content-outline/",
        "source_scope": "Professional coaching competency framework with international interest but a U.S.-based credentialing board.",
        "supports": "Defines knowledge and competencies assessed for health and wellness coaching and specifies approved training/practice expectations.",
        "limit": "Evidence confirms a distinct coaching practice framework but does not establish universal global credential recognition, protected title status or clinical authority.",
    },
    "SAE_ISO_AUTOMATED_VEHICLE_SAFETY": {
        "publisher": "SAE International and International Organization for Standardization (ISO)",
        "url": "https://www.iso.org/standard/83303.html?browse=tc",
        "source_scope": "International automotive safety standards and industry guidance for automated-driving systems.",
        "supports": "ISO/PAS 8800 addresses AI in safety-related road-vehicle systems; SAE J3206 organizes ADS safety principles for system development/deployment stakeholders.",
        "limit": "Standards describe engineering responsibilities and safety concerns, not a global job taxonomy or named universally standardized safety occupation.",
    },
    "WAYMO_PERCEPTION_ENGINEERING_ROLE_PROFILE": {
        "publisher": "Waymo, autonomous-driving technology company (employer role profile)",
        "url": "https://careers.withwaymo.com/jobs/perception-machine-learning-engineer-mountain-view-california-united-states-san-francisco",
        "source_scope": "Specific employer posting in the United States; task evidence for an emerging autonomous-driving engineering specialization only.",
        "supports": "Defines perception-machine-learning work including multimodal sensor fusion, object detection/tracking, occupancy and semantic segmentation, road understanding and model deployment/optimization.",
        "limit": "One employer posting does not establish a globally standardized occupation or title. Treat as an emerging task-family candidate and reconcile with software, ML, robotics and sensor-engineering records.",
    },
    "XRA_IMMERSIVE_TECH_SCOPE": {
        "publisher": "XR Association (XRA)",
        "url": "https://xra.org/",
        "source_scope": "Industry association representing XR developers, platform/device vendors and enterprise providers.",
        "supports": "Defines the XR ecosystem across AR, VR, mixed reality and immersive technology, and publishes industry best practices and research.",
        "limit": "Association scope validates the field, not distinct occupational titles; role-specific XR interaction-design evidence in this checkpoint is an employer posting, not a global taxonomy.",
    },
    "GOOGLE_XR_INTERACTION_DESIGNER_ROLE": {
        "publisher": "Google Careers (employer role profile)",
        "url": "https://www.google.com/about/careers/applications/jobs/results/139591453595574982-interaction-designer-xr-comms-app",
        "source_scope": "Specific employer posting; task example for XR product interaction design.",
        "supports": "Describes an XR Interaction Designer responsible for UX foundations, interaction flows, wireframes, storyboards, prototypes and user-feedback iteration for XR applications.",
        "limit": "A single employer posting cannot establish a globally standardized XR-design occupation; compare against existing UX/product/digital-media designer task records before suggesting a distinct role.",
    },
    "IGDA_ESPORTS_ECOSYSTEM_ROLES": {
        "publisher": "International Game Developers Association (IGDA), esports Special Interest Group",
        "url": "https://igda.org/sigs/esports-sig/",
        "source_scope": "International game-development professional association describing the esports ecosystem and stakeholder community.",
        "supports": "Identifies players, esports teams/organizations, event organizers, coaches, streamers, content creators and industry partners as parts of the esports ecosystem.",
        "limit": "An ecosystem membership list does not establish each as a standardized occupation; use it to compare function families and avoid assuming every community participant is a separate job.",
    },
})

BATCH_165_168 = {
    "D165": {
        "coverage_disposition": "15 active links cover nutrition, fitness/wellness coordination, personal training, exercise science and several creative/recreational therapies. The parent explicitly includes wellness coaching and lifestyle medicine. NBHWC defines a separate coaching competency framework, while WHO distinguishes lifestyle/health promotion work from clinical treatment; however the cited credential is U.S.-based and coaching scope varies. Treat an existing or potential health-and-wellness-coach function as a bounded coverage candidate, not a clinical or globally licensed role. Exact role-library identity and overlap with fitness/wellness coordinator, weight-loss consultant, dietitian and lifestyle-medicine clinicians must be reconciled.",
        "source_refs": ["NBHWC_HEALTH_WELLNESS_COACH_COMPETENCIES"],
        "candidates": [{"candidate_key": "D165|health_wellness_coach_function", "title_or_family": "Health and wellness coach / lifestyle-change coach", "tasks": "Uses a client-led coaching process to support self-determined health goals, behavior change, accountability and self-management; does not independently diagnose, prescribe or replace regulated clinical care unless separately qualified and authorized.", "candidate_gap_basis": "D165 active roles include fitness and wellness coordinators, weight-loss consultants and health professionals, but not an exact health-and-wellness-coach title. NBHWC outlines a separate coach competency framework; the role may be distinct from exercise instruction and dietetic care. Verify exact D165 library records and clarify non-clinical scope, credential geography and overlap before any decision.", "title_status": "Recognized professional coaching framework, but title/credential recognition and clinical boundaries are not globally uniform; do not imply a universally licensed occupation.", "source_refs": ["NBHWC_HEALTH_WELLNESS_COACH_COMPETENCIES"], "jurisdiction_note": "Internationally relevant coaching practice with a U.S.-based board credential; local clinical and consumer-protection rules must be assessed separately.", "recommendation_status": "bounded_function_candidate; role-versus-specialization and exact-library duplicate check required; no canonical addition"}],
    },
    "D166": {
        "coverage_disposition": "14 active links cover automotive/mechanical/powertrain design, testing, robotics, software development, telecommunications and mechatronics. ISO and SAE establish safety-related AI and ADS system-development responsibilities, while a Waymo role profile documents perception engineering tasks that are not explicit in active titles. Retain autonomous-driving perception/sensor-fusion as an emerging task-family candidate; it may be a specialization of machine-learning/software/robotics engineering rather than a distinct global occupation. No title is canonically added.",
        "source_refs": ["SAE_ISO_AUTOMATED_VEHICLE_SAFETY", "WAYMO_PERCEPTION_ENGINEERING_ROLE_PROFILE"],
        "candidates": [{"candidate_key": "D166|autonomous_vehicle_perception_sensor_fusion_candidate", "title_or_family": "Autonomous-vehicle perception / sensor-fusion engineer", "tasks": "Develops perception models and sensor-fusion systems for object detection/tracking, scene understanding, road interpretation and evaluation/deployment within an automated-driving stack.", "candidate_gap_basis": "The D166 parent explicitly depends on sensing and vehicle control, but its active roles do not name perception or sensor fusion. Waymo's role profile describes this task set; ISO/PAS 8800 and SAE ADS safety material support its safety-critical system context. This is employer-specific evidence for an emerging specialism, not proof of a globally standardized standalone occupation. Compare software developer, robotics engineer and related ML/sensor role tasks and duplicate ownership before recommending anything.", "title_status": "Emerging, source-observed specialization/title; global occupational standardization not established.", "source_refs": ["SAE_ISO_AUTOMATED_VEHICLE_SAFETY", "WAYMO_PERCEPTION_ENGINEERING_ROLE_PROFILE"], "jurisdiction_note": "International technical standards plus a U.S. employer example; no geography-wide job prevalence inferred.", "recommendation_status": "emerging_task_family_candidate; likely specialization versus standalone role unresolved; exact cross-domain duplicates required; no canonical addition"}],
    },
    "D167": {
        "coverage_disposition": "13 active links include XR developers/builders, solution architecture, technical support, 3D/animation and digital-media design. XRA confirms the XR field and its industry ecosystem; a Google Careers posting explicitly describes XR interaction-design work (spatial UX foundations, interaction flows and prototyping). Active digital-media designer and XR developer might cover this work, but their current titles do not prove the UX task boundary. Retain XR interaction designer as a bounded employer-evidence candidate; do not claim a globally standardized title.",
        "source_refs": ["XRA_IMMERSIVE_TECH_SCOPE", "GOOGLE_XR_INTERACTION_DESIGNER_ROLE"],
        "candidates": [{"candidate_key": "D167|xr_interaction_designer_function", "title_or_family": "XR interaction designer / spatial UX designer", "tasks": "Designs interaction models and user experiences for spatial/immersive applications, including user flows, interface behavior, prototypes and iterative user testing across XR devices.", "candidate_gap_basis": "D167 active titles cover XR development, architecture, support and digital-media design but do not name interaction/experience design for spatial interfaces. XRA validates the industry context and a Google employer posting supplies direct task evidence. Compare digital-media designer and XR developer descriptions before deciding whether this is already covered as a task specialization or merits a distinct role record.", "title_status": "Employer-documented XR specialization; not established here as a globally standardized occupation.", "source_refs": ["XRA_IMMERSIVE_TECH_SCOPE", "GOOGLE_XR_INTERACTION_DESIGNER_ROLE"], "jurisdiction_note": "International industry context with one employer example; no claim of worldwide title prevalence.", "recommendation_status": "bounded_employer_evidence_candidate; exact task overlap with digital-media design/XR development unresolved; no canonical addition"}],
    },
    "D168": {
        "coverage_disposition": "15 active links cover esports players, coaching/analysis, team management, event management, administration/refereeing, broadcast/production, journalism/content creation and online communities. IGDA's international esports SIG lists players, teams, event organizers, coaches, streamers and content creators—the major function families named by the parent are represented. Creator-economy work is broad and changing, but this pass found no materially distinct global family clearly absent from active coverage; ecosystem participation alone is not grounds for adding more titles.",
        "source_refs": ["IGDA_ESPORTS_ECOSYSTEM_ROLES"],
        "candidates": [],
    },
}

BATCHES = [BATCH_085_089, BATCH_090_094, BATCH_095_099, BATCH_100_104, BATCH_105_109, BATCH_110_114, BATCH_115_119, BATCH_120_124, BATCH_125_129, BATCH_130_134, BATCH_135_139, BATCH_140_144, BATCH_145_149, BATCH_150_154, BATCH_155_159, BATCH_160_164, BATCH_165_168]
REVIEWED = {domain_id: item for batch in BATCHES for domain_id, item in batch.items()}


def write_prior_batch_checkpoint(register, zero, sparse, batch_index):
    batch = BATCHES[batch_index]
    ids = list(batch)
    first, last = ids[0], ids[-1]
    cumulative = [did for prior in BATCHES[:batch_index + 1] for did in prior]
    by_id = {d["domain_id"]: d for d in register["domains"]}
    lines = [
        f"# {first}-{last} role-coverage checkpoint", "",
        f"Date: {date.today().isoformat()}",
        "Lane: D085-D168; global role coverage, distinct from exact role-to-parent fit.",
        f"Progress: {len(cumulative)}/84 domains dispositioned through this batch. No canonical data changed.",
        "", "## Catalogue baseline", "",
        f"- Active role links in scope: {register['count_method']['canonical_active_role_links']}.",
        f"- Zero-role domains: {len(zero)} ({', '.join(x['domain_id'] for x in zero)}).",
        f"- Sparse domains (1-12 active links): {len(sparse)}; triage only, not proof of omissions.",
        "- Role-domain fit is judged from role tasks and parent scope, never inferred from ISCO/subgroup membership.",
        "", "## This batch", "", "| Domain | Active links | Coverage disposition | Existing-library candidates |",
        "|---|---:|---|---|",
    ]
    for did in ids:
        d = by_id[did]
        candidates = "; ".join(c["title_or_family"] for c in d["candidates"]) or "None established in this pass"
        lines.append(f"| {did} {d['domain_name']} | {d['active_role_count']} | {d['coverage_disposition']} | {candidates} |")
    lines += ["", "## Source limitations", "", "- Candidate titles/functions are not canonical additions. Existing library records must be reconciled by exact tasks and cross-domain duplication.", "- Global/international frameworks support work functions but do not establish uniform national titles, licences or employment structures.", "", "## Sources", ""]
    cited = {ref for did in ids for ref in by_id[did].get("source_refs", [])}
    cited.update(ref for did in ids for c in by_id[did]["candidates"] for ref in c.get("source_refs", []))
    for key in sorted(cited):
        source = SOURCES[key]
        lines.append(f"- **{key}** ([source]({source['url']}), {source['publisher']}). {source['supports']} Limitation: {source['limit']}")
    next_number = int(cumulative[-1][1:]) + 1
    next_last = min(next_number + 4, 168)
    next_range = f"D{next_number:03}-D{next_last:03}" if next_number <= 168 else "complete"
    lines += ["", "## Resume point", "", f"Next exact batch: {next_range}. Continue sequentially; do not repeat completed IDs. No Nigeria-specific sources or canonical additions."]
    (OUT / f"{first}_{last}_coverage_checkpoint.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_incremental_checkpoint(register, zero, sparse):
    latest = BATCHES[-1]
    ids = list(latest)
    first, last = ids[0], ids[-1]
    lines = [
        f"# {first}-{last} role-coverage checkpoint",
        "",
        f"Date: {date.today().isoformat()}",
        "Lane: D085-D168; coverage audit is distinct from completed role-to-parent-fit decisions.",
        f"Progress: {len(REVIEWED)}/84 domains have evidence-based dispositions. No canonical data changed.",
        "",
        "## Catalogue baseline",
        "",
        f"- Active role links in scope: {register['count_method']['canonical_active_role_links']}.",
        f"- Zero-role domains: {len(zero)} ({', '.join(x['domain_id'] for x in zero)}).",
        f"- Sparse domains (1-12 active links): {len(sparse)}; triage only, not proof of omissions.",
        "- D119 remains included in the count baseline and is audited from its exact records; it was excluded from the prior fit queue.",
        "",
        "## This batch",
        "",
        "| Domain | Active links | Coverage disposition | Existing-library candidates |",
        "|---|---:|---|---|",
    ]
    by_id = {d['domain_id']: d for d in register['domains']}
    for did in ids:
        d = by_id[did]
        candidates = "; ".join(c['title_or_family'] for c in d['candidates']) or "None established in this pass"
        lines.append(f"| {did} {d['domain_name']} | {d['active_role_count']} | {d['coverage_disposition']} | {candidates} |")
    lines += [
        "",
        "## Important reconciliation notes",
        "",
        "- Any candidate labelled `existing_role_library_record_inactive` exists in the role library but is absent from active links for that exact domain. These are reconciliation candidates, not newly invented titles or approved links.",
        "- Candidate status does not establish parent fit. Compare the exact role record tasks, boundaries and duplicate assignments before deciding whether to activate, relocate, merge or exclude.",
        "- ILO/ISCO supports occupational-family definitions; O*NET is explicitly U.S.-specific; ESCO is a European classification comparator. None alone determines this product's domain ownership.",
        "",
        "## Sources",
        "",
    ]
    cited_keys = {ref for did in ids for ref in by_id[did].get("source_refs", [])}
    cited_keys.update(ref for did in ids for candidate in by_id[did]["candidates"] for ref in candidate.get("source_refs", []))
    for key in sorted(cited_keys):
        source = SOURCES[key]
        lines.append(f"- **{key} — {source['publisher']}** ([source]({source['url']})). {source['supports']} Limitation: {source['limit']}")
    lines += [
        "",
        "## Resume point",
        "",
        f"Next exact batch: D{max(int(k[1:]) for k in REVIEWED)+1:03}-D{max(int(k[1:]) for k in REVIEWED)+5:03}. Append evidence and exact-domain dispositions without repeating completed IDs. Keep coverage separate from fit; do not infer from ISCO subgroup membership or assign specializations.",
    ]
    (OUT / f"{first}_{last}_coverage_checkpoint.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    if len(BATCHES) > 1:
        write_prior_batch_checkpoint(register, zero, sparse, len(BATCHES) - 2)


def main():
    structure = json.loads(STRUCTURE.read_text(encoding="utf-8"))
    meta = json.loads(META.read_text(encoding="utf-8"))
    queue = json.loads(ROLE_QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
    d119_inventory = json.loads(D119_ROLE_INVENTORY.read_text(encoding="utf-8"))
    queue_by_domain = {}
    for row in queue:
        queue_by_domain.setdefault(row["domain_id"], []).append(row)

    domain_counts = []
    for number in range(85, 169):
        did = f"D{number:03}"
        data = meta[did]
        count = structure[did]["role_count"]
        listed = queue_by_domain.get(did, [])
        # D119 is deliberately excluded from the fit queue, but its canonical
        # count remains in this coverage baseline and it will be independently
        # inventoried from canonical source records in its own batch.
        if did != "D119" and len(listed) != count:
            raise SystemExit(f"{did}: fit-queue role count {len(listed)} != canonical active count {count}")
        domain_counts.append({
            "domain_id": did,
            "domain_name": data["domain_name"],
            "active_role_count": count,
            "source_inventory_role_count": d119_inventory["role_count"] if did == "D119" else count,
            "excluded_from_student_catalogue": bool(data.get("excluded", False)),
            "role_keys": [r["role_key"] for r in listed] if did != "D119" else [f"D119|{r['role']}" for r in d119_inventory["roles"]],
            "coverage_batch_status": "completed" if did in REVIEWED else "pending",
        })

    zero = [x for x in domain_counts if x["active_role_count"] == 0]
    sparse = [x for x in domain_counts if 0 < x["active_role_count"] <= 12]
    register = {
        "schema_version": "1.0",
        "inventory_date": date.today().isoformat(),
        "scope": {
            "first_domain": "D085", "last_domain": "D168",
            "purpose": "identify evidence-backed global occupational families that may be missing from active parent-domain role coverage; distinguish coverage from fit",
            "complementary_lane": "D045-D084 role-coverage work; this register is disjoint by domain ID",
            "active_count_authority": "data/career-mapping/domain_structure.json role_count, with domain names/exclusions from domain_meta.json; D085-D168 role keys cross-checked against the completed exact role-fit queue except separately handled D119",
            "subgroup_or_specialization_assignment": "deferred; no such links inferred or proposed",
            "canonical_edits": False,
        },
        "method": [
            "Coverage asks whether a materially distinct, source-described work family is absent from active role keys; it does not decide whether any current role fits its parent domain.",
            "Compare source-described tasks with parent-domain scope and active role tasks; never infer coverage or fit from ISCO/subgroup membership or title similarity alone.",
            "Separate established global occupational groups from employer-specific titles, specializations and jurisdiction-only occupations.",
            "For a candidate supported only by national evidence, record the country and do not generalize it globally or infer a Nigerian variant.",
            "Role count thresholds are triage signals only; zero/sparse counts are not proof of a taxonomy error.",
        ],
        "count_method": {
            "domains_in_scope": len(domain_counts),
            "canonical_active_role_links": sum(x["active_role_count"] for x in domain_counts),
            "zero_role_domains": [{"domain_id":x["domain_id"],"domain_name":x["domain_name"]} for x in zero],
            "sparse_role_threshold": "1-12 active links inclusive",
            "sparse_role_domains": [{"domain_id":x["domain_id"],"domain_name":x["domain_name"],"active_role_count":x["active_role_count"]} for x in sparse],
            "excluded_domains_with_stored_links": [{"domain_id":x["domain_id"],"domain_name":x["domain_name"],"active_role_count":x["active_role_count"]} for x in domain_counts if x["excluded_from_student_catalogue"]],
        },
        "sources": SOURCES,
        "domains": [],
    }
    for item in domain_counts:
        did = item["domain_id"]
        if did not in REVIEWED:
            continue
        description = meta[did].get("description", "")
        register["domains"].append({**item, "parent_scope": description, "coverage_disposition": REVIEWED[did]["coverage_disposition"], "source_refs": REVIEWED[did].get("source_refs", []), "candidates": REVIEWED[did]["candidates"]})
    (OUT / "role_coverage_candidate_register.json").write_text(json.dumps(register, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = ["# D085–D089 role-coverage checkpoint", "", f"Date: {date.today().isoformat()}", "Lane: D085–D168; distinct from completed role→parent-domain fit decisions.", "State: first five domains assessed; no canonical taxonomy changes.", "", "## Reconciled baseline", "", f"- D085–D168: **84 domains**, **{register['count_method']['canonical_active_role_links']} active role links** in `domain_structure.json`.", f"- Zero-role domains: **{len(zero)}** — " + ", ".join(f"{x['domain_id']} {x['domain_name']}" for x in zero) + ".", f"- Sparse domains (1–12 links): **{len(sparse)}**. This is a triage cohort only, not proof of missing occupations.", "- D086 has stored mappings but is excluded from the student-facing catalogue; no student-facing additions proposed.", "- D119’s 20 stored roles were not in the role-fit queue because that domain was handled separately. It remains included in the active-count baseline and must be reviewed from its own exact source records in its coverage batch.", "", "## D085–D089 dispositions", "", "| Domain | Active links | Coverage finding | Candidate families |", "|---|---:|---|---|"]
    for d in register["domains"]:
        candidates = "; ".join(c["title_or_family"] for c in d["candidates"]) or "None established in this pass"
        lines.append(f"| {d['domain_id']} {d['domain_name']} | {d['active_role_count']} | {d['coverage_disposition']} | {candidates} |")
    lines += ["", "## Candidate findings and boundaries", "", "- **D085 retail/shop trade manager:** global ISCO-08 group 1420 supports an established role family. The existing `shop supervisor` task profile partially overlaps, so first compare actual scope; likely outcome may be expanding/clarifying that record rather than adding a duplicate.", "- **D085 retail merchandise buyer:** global ISCO-08 group 3323 includes buying goods for resale by retail establishments. No buyer/purchaser title appears among D085's 70 active role keys. This is a candidate for exact-key and overlap review, not a canonical addition.", "- **D089 crematory operator:** BLS establishes this as a distinct U.S. occupation. ILO funeral/embalming definitions do not, from this review, establish it as a separate global occupation; it remains U.S.-labelled pending evidence from other jurisdictions.", "- **D087 and D088:** low counts do not justify padding. The current roles already cover the principal globally described barbering, hairdressing, beauty, aesthetics, spa and personal-care service families checked here; no net-new global family is established by this batch.", "- **D086:** gambling/betting domain is explicitly excluded. Coverage is documented, but no student-facing role additions are proposed.", "", "## Source records", ""]
    for key, source in SOURCES.items():
        lines.append(f"- **{key} — {source['publisher']}** ([source]({source['url']})); scope: {source['source_scope']} Supports: {source['supports']} Limit: {source['limit']}")
    lines += ["", "## Resume point", "", "Next disjoint batch: D090–D094. Continue five domains at a time, save the updated register/checkpoint and rerun tests before proceeding. Keep role coverage separate from role fit; no ISCO/subgroup inference and no canonical edits."]
    write_incremental_checkpoint(register, zero, sparse)
    latest_ids = list(BATCHES[-1])
    print(json.dumps({"domains_reviewed": len(register["domains"]), "range_total": register["count_method"]["canonical_active_role_links"], "zero": [x["domain_id"] for x in zero], "sparse": len(sparse), "batch": f"{latest_ids[0]}-{latest_ids[-1]}", "candidate_count": sum(len(REVIEWED[d]["candidates"]) for d in latest_ids)}))

if __name__ == "__main__":
    main()
