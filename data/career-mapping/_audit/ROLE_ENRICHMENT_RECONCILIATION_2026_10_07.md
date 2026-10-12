# Role-enrichment checkpoint reconciliation — 2026-10-07

Status: **complete evidence reconciliation; area-of-specialization gate remains open**.

This report reconciles the D057–D112 and D113–D168 append-only evidence lanes. It does not edit canonical role, overlay, domain, subgroup, or taxonomy files.

## Result

- Raw candidate records: **126**
- Unique candidate keys after deduplication: **124**
- Duplicate groups: **2**
- Conflict groups: **2**
- Accepted additions: **0**
- Alias candidates pending area fit: **38**
- Review-only candidates: **86**
- Source IDs without checkpoint metadata: **0**

The zero accepted-addition count is intentional. The records establish parent-domain fit, but no candidate record contains a specific existing/proposed area-of-specialization label and independent area-fit rationale. Under the requested gate, `add` candidates are therefore review-only rather than promoted.

## Disposition counts

| Stage | Counts |
|---|---:|
| Raw dispositions | `{"add": 51, "alias_existing": 38, "review_only": 37}` |
| Unique original dispositions | `{"add": 50, "alias_existing": 38, "review_only": 36}` |
| Effective dispositions after area gate | `{"alias_pending_area_fit": 38, "review_only": 86}` |

## Evidence policy

- Global occupational/task evidence and Nigerian context are stored separately.
- Nigerian regulatory, institutional, training or ecosystem evidence is not treated as vacancy or demand evidence.
- ISCO/ESCO subgroup membership is not treated as proof of parent-domain fit or area-of-specialization fit.
- Candidate source IDs, URLs, locators, scope and limitations are preserved in the JSON report for exact audit.

## Reconciliation categories

- `accepted_candidate_additions`: empty until each candidate has area assignment plus independent area-fit evidence.
- `aliases`: candidates whose lane disposition is `alias_existing`; they remain pending area-fit assignment and are not canonical edits.
- `review_only_candidates`: original review-only candidates plus all proposed additions blocked by the area gate.
- `conflicts`: duplicate keys whose records differ in meaningful fields or disposition; the latest checkpoint fields are retained for reporting, while source references are unioned.

## Sparse/no-role requirement

The lane evidence identifies sparse and zero-role domains, but this reconciliation does not add roles merely to reach a numeric floor. The separate enrichment pass must assign each candidate to an area of specialization and independently establish domain and area fit before any candidate can count toward a ten-role target.

## Files

- Full machine-readable report: `data/career-mapping/_audit/role_enrichment_reconciliation_2026_10_07.json`
- Resumption checkpoint: `data/career-mapping/_audit/ROLE_ENRICHMENT_RECONCILIATION_CHECKPOINT_2026_10_07.json`
- This summary: `data/career-mapping/_audit/ROLE_ENRICHMENT_RECONCILIATION_2026_10_07.md`

## Candidate ledger

### D057|health data analyst — Health data analyst / health informatics data analyst

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit when data and analytics are specifically healthcare/health-system data; generic data analyst work is excluded.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Collects, manages and analyses health-related data to improve clinical decisions, care quality, service operations and health-system planning; protects sensitive data and communicates findings to health teams.
- Global sources: WHO_DIGITAL_HEALTH_COMPETENCY_LANDSCAPE, WHO_DIGITAL_HEALTH_WORKFORCE_ROLES, HIMSS_GLOBAL_HEALTH_INFORMATICS_FRAMEWORKS
- Nigerian context sources: WHO_DIGITAL_HEALTH_LOCAL_ROLE_LIMIT
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D057|health information systems implementation specialist — Health information systems implementation / interoperability specialist

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to implementing and maintaining health information systems in healthcare settings; general software implementation without health workflow/interoperability responsibilities is excluded.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Configures, integrates, tests and supports digital health information systems and data exchange with clinical and administrative workflows; trains users and resolves implementation issues.
- Global sources: WHO_DIGITAL_HEALTH_COMPETENCY_LANDSCAPE, HIMSS_HEALTH_IT_JOB_DESCRIPTIONS
- Nigerian context sources: WHO_DIGITAL_HEALTH_LOCAL_ROLE_LIMIT
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D058|instructional designer — Instructional designer / digital learning designer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to designing technology-supported learning experiences; generic classroom teaching or software development alone is not enough.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Analyses learner and instructional needs; designs, develops, implements and evaluates online, hybrid or face-to-face course experiences; aligns objectives, content, learning activities and assessment with subject-matter experts.
- Global sources: EDUCAUSE_TEACHING_LEARNING_PATHWAY, EDUCAUSE_INSTRUCTIONAL_DESIGN_ROLE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D058|learning experience designer — Learning experience designer / learning architect

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to learning experience design; distinguish from instructional designer only when source-backed tasks demonstrate meaningful role differentiation rather than a title variant.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Designs and coordinates learning products or programmes using learning theory, user/learner needs, interaction design and iterative development; collaborates with educators and product teams.
- Global sources: EDUCAUSE_TEACHING_LEARNING_PATHWAY
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D058|learning management system administrator — Learning management system (LMS) administrator / educational technology support specialist

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the domain's explicit LMS administration and educational-technology support scope; generic enterprise system administration is excluded.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Administers learning platforms, user access, course shells, integrations and platform support; enables digital learning delivery and assists educators with effective platform use.
- Global sources: EDUCAUSE_TEACHING_LEARNING_PATHWAY, EDUCAUSE_INSTRUCTIONAL_TECHNOLOGY_ROLES
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D059|flight dynamics engineer — Flight dynamics / orbit-determination engineer

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the physics and operational control of spacecraft missions; not simply generic aerospace design.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Determines and predicts spacecraft orbit and attitude; analyses tracking and navigation data; plans manoeuvres and supports collision avoidance and mission trajectory control.
- Global sources: ESA_MISSION_CONTROL_ROLE_FAMILIES, ESA_SPACECRAFT_OPERATIONS_ENGINEER_VACANCY
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D059|spacecraft operations engineer — Spacecraft / satellite operations engineer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the parent scope's operation of spacecraft and satellites after launch; distinct from design/test engineering tasks.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Prepares and validates operations plans, databases and procedures; monitors and controls spacecraft; plans routine and contingency operations; investigates anomalies and evaluates in-orbit mission performance.
- Global sources: ESA_MISSION_CONTROL_ROLE_FAMILIES, ESA_SPACECRAFT_OPERATIONS_ENGINEER_VACANCY, NASA_MISSION_OPERATIONS_ENGINEER
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D060|bank compliance officer — Bank compliance officer / financial-crime compliance professional

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit when the compliance work concerns banking and credit services, products, customer conduct and financial crime. Generic legal/compliance work outside financial institutions is not included.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Advises on applicable laws, regulations and standards; identifies and assesses compliance risks arising from banking activities and products; monitors compliance controls; investigates potential breaches and supports prevention of money laundering and terrorist financing.
- Global sources: BIS_BANK_COMPLIANCE_FUNCTIONS, BASEL_CORE_PRINCIPLES_FINANCIAL_CRIME_COMPLIANCE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D061|insurance actuary — Insurance actuary (pricing, reserving and capital modelling functions)

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to assessing and pricing insured risk and ensuring capacity to meet claims; not generic actuarial work unrelated to insurance.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Uses probability, statistics and financial methods to price insurance and reinsurance, project claims liabilities/reserves, evaluate capital needs and communicate the financial risk implications to insurer decision-makers.
- Global sources: IFOA_GENERAL_INSURANCE_ACTUARIAL_WORK, IAIS_ACTUARIAL_FUNCTION_IN_INSURANCE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D062|quantitative investment researcher — Quantitative researcher / quantitative investment analyst

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit when quantitative work produces analysis or strategies for financial asset trading/investment; generic data science or academic mathematics is excluded.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Uses statistical, mathematical and computational methods to research securities or markets, build and test investment models/strategies, evaluate evidence and communicate investment implications to portfolio or trading teams.
- Global sources: CFA_QUANTITATIVE_INVESTMENT_CAREER_PATHS, CFA_RESEARCH_ANALYST_TASKS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D063|economist — Economist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct economics and policy-analysis fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Researches economic data, models trends, evaluates policy impacts and prepares recommendations.
- Global sources: ONET_ECONOMISTS
- Nigerian context sources: NG_NBS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D064|counseling psychology specialty not a proposed new role — Counseling psychologist — recognized professional specialty, not yet a distinct role addition

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Directly within psychology and counselling. The cited professional body describes this as a specialty within professional psychology, overlapping tasks with current psychologist, counsellor and psychotherapist records.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Uses culturally responsive assessment, prevention, counselling and psychotherapy to support wellbeing, alleviate distress, resolve crises and improve individual, family or group functioning.
- Global sources: APA_COUNSELING_PSYCHOLOGY_SPECIALTY, EFPA_PSYCHOLOGY_SPECIALIZATION_FRAMEWORK, ILO_ISCO08_PSYCHOLOGISTS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D065|interpreter — Interpreter (spoken-language, conference/public-service and sign-language interpreting contexts)

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the explicit interpretation scope. ILO treats interpreter and translator as examples within one broad unit group but defines distinct spoken/signed interpretation versus written translation tasks; an exact-key split may improve clarity if current combined role profile obscures them.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Interprets spoken or signed communication between languages in meetings, conferences, public services or other contexts, preserving meaning and communicative intent in real time.
- Global sources: ILO_ISCO08_TRANSLATORS_INTERPRETERS, ISO_17100_TRANSLATION_SERVICE_BOUNDARY
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D065|localization specialist — Localization specialist / localization professional

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to language services and language technology when the work adapts language/content for locales; general product marketing or software engineering without language/localization responsibilities is excluded.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Adapts multilingual content, software or digital products to the linguistic and cultural requirements of a target locale; coordinates linguistic, technical and quality processes across translation and localization workflows.
- Global sources: EU_LANGUAGE_INDUSTRY_PROFESSIONAL_PROFILES, EU_LOCALIZATION_IN_TRANSLATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D066|veterinary epidemiology specialty — Veterinary epidemiologist / applied veterinary epidemiology (specialty candidate)

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to animal health, veterinary public service and disease surveillance; public-health-only epidemiology without veterinary/animal-health tasks belongs elsewhere.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Analyses animal-disease patterns, conducts surveillance and field investigations, assesses disease risks, and plans evidence-based prevention, outbreak response and control in animal populations, including zoonotic risks.
- Global sources: FAO_VETERINARY_FIELD_EPIDEMIOLOGY, WOAH_VETERINARY_PUBLIC_HEALTH
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D067|dentist — Dentist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct dentistry fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Examines, diagnoses, prevents and treats dental and oral conditions.
- Global sources: ONET_DENTISTS
- Nigerian context sources: NG_MDCN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D068|prosthetist orthotist — Prosthetist / orthotist (clinical professional, not technician)

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to rehabilitation and assistive-device provision. The existing prosthetic-orthotics technician covers fabrication support but ISPO defines clinical assessment, prescription and treatment planning as professional prosthetist/orthotist work.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Assesses patients and functional needs; prescribes and designs prosthetic or orthotic devices; coordinates fabrication/fitting and rehabilitation plans; measures outcomes and adjusts clinical interventions.
- Global sources: ISPO_PROSTHETIST_ORTHOTIST_OCCUPATIONAL_CLASSIFICATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D068|radiation therapist — Radiation therapist / therapeutic radiographer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to diagnosis/treatment-support health professions and distinct from diagnostic radiography, which produces images rather than administers radiotherapy.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Plans, prepares and delivers prescribed radiotherapy treatment using radiation equipment; positions and monitors patients, verifies treatment parameters and works within the oncology team to ensure safe delivery.
- Global sources: WHO_RADIOTHERAPY_TEAM_ROLES, ILO_ISCO08_MEDICAL_IMAGING_AND_THERAPY
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D069|flight operations officer flight dispatcher — Flight operations officer / flight dispatcher

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to aircraft operations and the systems supporting safe air transport; distinguishes pre-flight/operational-control support from pilot flight execution and air-traffic separation/control.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Supports flight crews and operational control through flight planning (including route and fuel), flight-following, weather/operational information, monitoring flight progress and coordination when events disrupt the plan.
- Global sources: ICAO_ANNEX6_FLIGHT_DISPATCHER, ICAO_FLIGHT_FOLLOWUP_TRAINING
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D070|musician singer composer family — Musicians, singers and composers (creative and performance family)

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit because music is expressly included in the parent domain. This is not a generic audio technician or sound-engineering function, which is already represented separately.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Creates, arranges, conducts and performs music; develops musical structures and notation, adapts compositions for particular performers or occasions, and presents instrumental or vocal performances.
- Global sources: ILO_ISCO08_PERFORMING_ARTISTS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D071|athletic director — Athletic director

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct sports-management fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Oversees an athletic programme, including coaching hires, schedules, budget, promotion, compliance and facilities.
- Global sources: ONET_ATHLETIC_DIRECTOR
- Nigerian context sources: NG_SPORTS_MINISTRY_PLAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D071|sport administrator — Sport administrator / sports organization manager

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the parent scope's sports clubs, academies, venues, competitions and public sports bodies. Generic business administration without sport-specific remit is excluded.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Supports governance and administration of a sport organization; plans and coordinates programmes, people, facilities and competition operations; implements organizational policy and manages resources and stakeholder relationships.
- Global sources: IOC_SPORT_ADMINISTRATION_MANUAL, ILO_ISCO08_SPORTS_MANAGERS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D071|sports coach — Sports coach

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct sports-management and athlete-development fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Plans and conducts practice, trains athletes, evaluates performance, selects teams and manages competition preparation.
- Global sources: ICCE_INTERNATIONAL_SPORT_COACHING_FRAMEWORK, ONET_COACHES_SCOUTS
- Nigerian context sources: NG_SPORTS_MINISTRY_PLAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json, data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D071|sports official — Sports official / referee

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct sports-event governance fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Officiates sporting events, applies rules, inspects compliance and resolves infractions or complaints.
- Global sources: ONET_SPORTS_OFFICIALS
- Nigerian context sources: NG_SPORTS_MINISTRY_PLAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D071|sports performance analyst — Sports performance analyst / performance analyst in sport

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the parent description's performance analysis of matches and athlete development; sports-media commentary and generic business analytics are excluded.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Collects and interprets video and performance data; identifies technical/tactical patterns; prepares feedback and evidence for coaches and athletes to improve performance and inform training or competition decisions.
- Global sources: ASPA_SPORT_PERFORMANCE_ANALYSIS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D071|sports referee match official — Sports referee / match or technical official

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the parent scope's explicit game officiating. This is distinct from coaching and sport administration, though certification and authority are sport-governed.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Applies sport rules, makes and communicates decisions during competition, manages rule infractions and supports fair and safe conduct of events; technical officials may also supervise and validate competition procedures.
- Global sources: WORLD_ATHLETICS_TECHNICAL_OFFICIALS, WORLD_ATHLETICS_REFEREE_EDUCATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D071|sports scout — Sports scout

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct sports talent-identification fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Assesses athletes, prepares scouting reports, recommends recruitment targets and identifies talent for teams or programmes.
- Global sources: ONET_COACHES_SCOUTS
- Nigerian context sources: NG_SPORTS_MINISTRY_PLAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D071|sports talent scout — Sports talent scout / talent identification practitioner

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the parent scope's explicit talent-identification work. General recruitment outside athlete identification is excluded.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Observes and evaluates prospective athletes using defined sport-specific profiles, live/video/data-informed evidence and longitudinal development context; documents assessments and supports selection and recruitment decisions.
- Global sources: FIFA_TALENT_IDENTIFICATION_GUIDE, FIFA_ROLE_OF_THE_SCOUT
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D072|earth observation specialist — Earth-observation / remote-sensing specialist

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit where imagery and remote sensing produce mapped information about land, water, minerals or the environment; do not add a duplicate if the current remote-sensing specialist already covers this task family.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Processes satellite, aerial or other remotely sensed data; derives geospatial information and products; validates imagery-based observations and integrates results with spatial datasets for monitoring and decision support.
- Global sources: UN_GENERIC_GEOSPATIAL_JOB_PROFILES, UN_GEospatial_INFORMATION_OFFICER_ROLE, FIG_GEOMATICS_SCOPE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D072|geospatial analyst — Geospatial information officer / geospatial analyst

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to geographic information systems and geospatial analysis in the parent scope; distinguish this from geologist/hydrologist roles that apply domain science and from generic data analysts without spatial work.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Sources and integrates spatial datasets; performs spatial analysis and visualization; develops geospatial information products and analytical workflows to support operational or policy decisions.
- Global sources: UN_GENERIC_GEOSPATIAL_JOB_PROFILES, UN_GEospatial_INFORMATION_OFFICER_ROLE, FIG_GEOMATICS_SCOPE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D073|digital archivist — Digital archivist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct library, archive and information-management fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Appraises, preserves, describes and provides access to digital records and archives.
- Global sources: ONET_ARCHIVISTS_LIBRARIANS
- Nigerian context sources: NG_NL_NATIONAL_LIBRARY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D074|occupational hygienist — Occupational hygienist / industrial hygienist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to prevention of occupational illness and harmful workplace conditions. This is exposure science and health-risk control, distinct from general safety inspection or incident prevention, while overlapping the broad OSH specialist family.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Anticipates, recognizes, evaluates and controls workplace exposures to chemical, physical, biological and other health hazards; designs exposure-assessment strategies, interprets results, recommends controls and communicates health risks.
- Global sources: IOHA_OCCUPATIONAL_HYGIENE_DEFINITION, IOHA_HYGIENIST_COMPETENCY_REQUIREMENTS, ILO_OSH_PROFESSIONALS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D075|fabric and apparel patternmaker — Fabric and apparel patternmaker

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct apparel-production and textile-design fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Creates and tests garment patterns, grades sizes, lays out fabric and prepares production specifications.
- Global sources: ONET_PATTERNMAKERS
- Nigerian context sources: NG_FASHION_COUNCIL
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D075|fashion designer — Fashion designer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fashion and textile-design fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Develops apparel/accessory concepts, designs collections and translates design concepts into garment specifications.
- Global sources: ONET_FASHION_DESIGNERS
- Nigerian context sources: NG_FASHION_COUNCIL, NG_FADAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D075|garment and product designer — Garment / fashion product designer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit: apparel design is explicit in the domain; the inactive exact-domain library contains fashion and clothing designers, and ISCO-08 recognizes product and garment designers. Candidate family must be compared against exact library tasks and deduplicated before promotion.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Develops garment and product concepts, designs and specifications for clothing and related products; coordinates material, construction and production requirements.
- Global sources: ILO_ISCO08_OCCUPATIONAL_CLASSIFICATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D075|tailor dressmaker custom sewer — Tailor, dressmaker and custom sewer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct apparel production and garment-making fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Measures, designs, makes, alters and repairs made-to-measure garments using patterns and construction techniques.
- Global sources: ONET_TAILORS
- Nigerian context sources: NG_FASHION_COUNCIL, NG_FADAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D075|textile and clothing technologist — Textile / clothing technologist

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to fabrics, clothing and industrial production in the domain description; exact-domain library contains textile and clothing technologist records, but task distinction and duplication need source checks.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Applies material, process and production knowledge to textile or garment development, testing, manufacture and quality; exact task boundary must distinguish professional technologists from machine operators.
- Global sources: ILO_ISCO08_OCCUPATIONAL_CLASSIFICATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D075|textile garment and footwear production trades — Garment, textile and footwear production trades (patternmaking, cutting, sewing, textile processing and shoemaking families)

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to the stated making/manufacturing scope. ILO-08 defines multiple distinct unit groups (including patternmakers/cutters, sewing workers, textile machine operators and shoemakers); these need mapping as separate roles or exact task clusters, not one catch-all title.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Creates patterns, cuts and assembles garments or footwear, operates textile processing equipment, and makes or finishes products by craft or industrial methods.
- Global sources: ILO_ISCO08_OCCUPATIONAL_CLASSIFICATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D076|able seafarer deck — Able seafarer deck

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime deck-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Performs qualified deck-rating duties within the STCW seafarer framework.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|assistant engineer officer — Assistant engineer officer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime engineering and naval-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Person under training to become an engineer officer under national/regulated seafarer arrangements.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|chief engineer officer — Chief engineer officer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime engineering and naval-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Senior engineer officer responsible for mechanical propulsion and ship mechanical/electrical installations.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|chief mate — Chief mate

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime and naval-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Deck officer next in rank to the master, with command succession and deck-operation responsibilities.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|deck officer — Deck officer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime and naval-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Performs qualified deck/navigation functions on a merchant vessel under the STCW framework.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|electro technical officer — Electro-technical officer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime electrical/electronic operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Performs qualified electro-technical functions for ship electrical, electronic and control systems.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|master mariner — Master (mariner)

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime and naval-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Commands a ship and is responsible for safe navigation, ship operations and compliance.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|port state control officer — Port State Control Officer (PSCO) / maritime port inspector

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to maritime safety and regulatory inspection. IMO distinguishes port-state-control ship inspections from customs clearance and general security screening.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Inspects foreign ships in national ports to check ship condition, equipment, certification, manning and operations against international maritime requirements; may require corrective action or detention for serious deficiencies.
- Global sources: IMO_PORT_STATE_CONTROL
- Nigerian context sources: NIMASA_SEAFARER_QUALIFICATIONS_2026_CHECK, NIMASA_MARINE_ENGINEERING_ASSISTANT
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D076|second engineer officer — Second engineer officer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime engineering and naval-operations fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Engineer officer next in rank to the chief engineer officer, supporting responsibility for propulsion and machinery.
- Global sources: IMO_STCW
- Nigerian context sources: NG_NIMASA, NG_NIMASA_MARITIME_LABOUR
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D076|ship surveyor — Ship surveyor / maritime surveyor

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct maritime fit: IMO calls for qualified ship surveys and surveyors; this is distinct from ship design engineering and vessel command, but may overlap general compliance/inspection records.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Surveys ships and relevant equipment at construction and during service to verify safety, seaworthiness and compliance with applicable requirements; authorized flag-state or recognized-organization surveyors may support certification.
- Global sources: IMO_SHIP_SURVEY_AND_CERTIFICATION
- Nigerian context sources: NIMASA_SEAFARER_QUALIFICATIONS_2026_CHECK, NIMASA_MARINE_ENGINEERING_ASSISTANT
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D077|security officer — Security officer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct protective-security fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Guards premises, controls access, patrols sites, monitors security equipment and responds to incidents.
- Global sources: ONET_SECURITY_GUARDS
- Nigerian context sources: NG_NSCDC
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D078|social researcher — Social researcher

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Potential direct social-science research fit, but title boundaries overlap with sociologist, demographer, economist and social-work researcher.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Designs or conducts research about social behaviour, institutions and population patterns and communicates findings.
- Global sources: ONET_SOCIAL_SCIENTISTS
- Nigerian context sources: NG_NBS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D079|customs agent — Customs agent

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct customs and international-trade fit.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Local regulatory title/function associated with customs-agent licensing and representation of traders.
- Global sources: WCO_CUSTOMS_BROKERS
- Nigerian context sources: NG_CUSTOMS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D079|customs broker — Customs broker

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct customs and international-trade compliance fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Acts as an intermediary between traders and Customs, preparing declarations, handling duties/taxes, permits, audits and disputes.
- Global sources: WCO_CUSTOMS_BROKERS
- Nigerian context sources: NG_CUSTOMS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D079|customs broker or clearing agent — Customs broker / customs clearing agent / customs representative

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to cross-border trade and supply-chain movement as the private trader-side counterpart to customs administration. The WCO distinguishes this intermediary work from customs authority duties.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Acts on behalf of traders in customs clearance; prepares and submits documentation, handles clearance formalities and duties/taxes, supports compliance and may advise on post-clearance audits or disputes.
- Global sources: WCO_CUSTOMS_BROKERS_STUDY, WCO_CUSTOMS_BROKERS_FUNCTION_VARIATION
- Nigerian context sources: NCS_STATUTORY_FUNCTIONS_2026_CHECK, NCS_LEGAL_FRAMEWORK_2026_CHECK
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D080|graphic and multimedia designer — Graphic / multimedia designer and illustrator

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The current parent description explicitly includes visual scenes, illustration and animation. ILO-08 recognizes graphic and multimedia designers; exact overlap with illustrators and digital-media designers must be reconciled.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Creates visual communication and digital/illustrative assets using image, typography, layout and multimedia methods for defined audiences and uses.
- Global sources: ILO_ISCO08_OCCUPATIONAL_CLASSIFICATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D080|interior designer — Interior designer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct interior and spatial-design fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Plans, designs and furnishes practical, aesthetic interior environments and layouts.
- Global sources: CIDQ_INTERIOR_DESIGN_SCOPE, ONET_INTERIOR_DESIGNERS
- Nigerian context sources: NG_NIA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json, data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D080|set and exhibit designer — Set and exhibit designer

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Potential spatial-design fit, but boundary with performing arts and exhibition design must be settled.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Designs spatial displays, exhibits and sets, producing layouts, drawings, material specifications and installation coordination.
- Global sources: ONET_SET_EXHIBIT
- Nigerian context sources: NG_NIA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D080|set and scenic designer — Set / scenic designer and set builder

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Potentially direct fit because the parent explicitly includes visual scenes and the exact-domain library includes set design/build and scenic painting; confirm the role is occupationally distinct and not duplicated in performing arts domains.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Designs or constructs stage, screen or display environments and scenic elements to realize a production's visual concept, working with production and technical teams.
- Global sources: ILO_ISCO08_OCCUPATIONAL_CLASSIFICATION
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D081|administrative assistant — Administrative assistant

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct office-administration fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Coordinates schedules, correspondence, records, office information, routine payroll support and administrative services.
- Global sources: ONET_ADMIN_ASSISTANTS
- Nigerian context sources: NG_NBS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D082|customer service representative — Customer service representative

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct customer-service/contact-centre fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Handles customer enquiries, records interactions, provides routine information and resolves general complaints.
- Global sources: ONET_CUSTOMER_SERVICE
- Nigerian context sources: NG_NBS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D083|travel agent — Travel agent

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct travel-services fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Plans and sells transport/accommodation, arranges itineraries and tour packages, makes reservations and assists travellers.
- Global sources: ONET_TRAVEL_AGENTS
- Nigerian context sources: NG_NTDA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D084|payroll clerk — Payroll clerk

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct payroll and bookkeeping fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Maintains payroll/timekeeping records and supports calculation, posting and reconciliation of employee pay information.
- Global sources: ONET_BILLING_PAYROLL
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D085|retail buyer merchandise buyer — Retail merchandise buyer / buyer for resale

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: This procurement/assortment function is distinct from customer-facing sales and rental roles. ISCO-08 3323 explicitly includes buying merchandise for resale by retail or wholesale establishments; the checked D085 active role-title list has no buyer/purchaser title.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Selects merchandise for retail resale, studies demand and sales/price/quality information, negotiates supplier terms, places orders and manages stock availability/distribution.
- Global sources: ILO_ISCO08
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D085|retail trade manager family — Retail/shop trade manager

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: ILO's global ISCO-08 1420 defines an established retail/wholesale trade-manager family. D085 already contains a shop supervisor, but its task record may be narrower: staffing performance, budgets, inventory and customer service. The manager's product-mix, purchasing-policy, pricing and establishment-level responsibilities are not clearly represented as a distinct task profile.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Plans, organizes and controls a retail shop or retail unit, including staffing, product mix, purchasing/marketing policy, pricing, budgets and service standards.
- Global sources: ILO_ISCO08
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D086|gambling games developer — Gambling games developer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct gaming/betting technology fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Develops software/game systems for regulated gambling products.
- Global sources: none recorded
- Nigerian context sources: NG_CUSTOMS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D086|gambling quality assurance engineer — Gambling quality assurance engineer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct gaming/betting technology fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Tests gambling software and systems for correctness, reliability and compliance.
- Global sources: none recorded
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D087|hairdresser — Hairdresser

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct hairdressing and personal-beauty fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Cuts, styles, treats and maintains clients' hair and advises on hair-care services.
- Global sources: ONET_HAIR_AND_BEAUTY
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D088|makeup artist — Makeup artist

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct beauty/aesthetic fit when scoped to client or production makeup.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Applies and maintains makeup for performance or client appearance, including continuity and appearance design.
- Global sources: ONET_MAKEUP
- Nigerian context sources: NG_NBTE_COSMETOLOGY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D088|manicurist pedicurist — Manicurist and pedicurist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct beauty therapy fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Provides nail shaping, decoration or augmentation, maintains client records and follows cosmetic hygiene practices.
- Global sources: ONET_MANICURE
- Nigerian context sources: NG_NBTE_COSMETOLOGY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D088|skincare specialist — Skincare specialist / aesthetician

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct beauty therapy and aesthetics fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Provides skincare treatments, assesses skin condition, maintains hygiene and refers serious conditions to medical personnel.
- Global sources: ONET_SKINCARE
- Nigerian context sources: NG_NBTE_COSMETOLOGY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D089|crematory operator regional candidate — Crematory operator / cremator

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: BLS separates operation of crematory equipment from funeral arrangements and embalming. The global ILO group describes funeral/embalming work and cremation arrangements, but this pass did not find evidence that crematory equipment operation is a distinct global occupation across jurisdictions.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Operates cremation equipment, verifies identity and documentation, prepares remains, manages the cremation process and maintains equipment/facilities.
- Global sources: BLS_CREMATORY_OPERATORS, BLS_FUNERAL_WORKERS, ILO_ISCO08
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D089|funeral director mortician funeral arranger — Funeral director / mortician / funeral arranger

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct funeral and mortuary-services fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Coordinates funeral services, remains care, legal documents, family arrangements, transport and burial/cremation logistics.
- Global sources: ONET_FUNERAL
- Nigerian context sources: NG_HEFAMAA_MORTUARY, NG_FMC_ABUJA_MORTUARY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D089|funeral home manager — Funeral home manager

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct funeral and mortuary-services fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Manages funeral-home operations, staff, records, services and client arrangements.
- Global sources: ONET_FUNERAL
- Nigerian context sources: NG_HEFAMAA_MORTUARY, NG_FMC_ABUJA_MORTUARY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D090|veterinary assistant — Veterinary assistant

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct animal-care and veterinary-support fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Provides supervised animal-care and veterinary support, including restraint, hygiene, records, routine care, sample handling and client support.
- Global sources: ONET_VET_ASSISTANTS
- Nigerian context sources: NG_VCN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D091|driving school instructor — Driving school instructor

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct driving-instruction fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Teaches classroom and practical driving, follows the approved curriculum and is trained/certified by the regulator.
- Global sources: ONET_SELF_ENRICHMENT
- Nigerian context sources: NG_FRSC_DSSP
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D092|existing library chef not active — Chef / head chef

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact role library contains D092 chef, while the active D092 role queue does not. Culinary food preparation and kitchen coordination fit the named parent scope, but reconcile the D053 chef records and D092 cook/industrial-cook tasks before deciding active ownership.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Prepares and presents food; may plan menus, order supplies, maintain production standards and coordinate or supervise kitchen work.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS, ONET_CHEFS_HEAD_COOKS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D092|existing library pastry cook not active — Pastry cook / pastry chef

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact role library contains D092 pastry cook but it is absent from active D092 role links. ILO ISCO-08 7512 recognizes bakers, pastry-cooks and confectionery makers; D048/D053 have related titles, so verify intended parent ownership and avoid duplicates.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Prepares baked goods, pastries and desserts using specialized ingredient, mixing, baking, finishing and food-safety processes.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D093|existing library electrical engineering technician not active — Electrical engineering technician

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact role library includes a D093 electrical engineering technician record, but it is absent from active D093 role links. Determine whether this record describes installation/maintenance technician work in D093 or broader engineering support better owned elsewhere.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Supports electrical engineering design, construction, operation, testing, maintenance and repair through technical work; precise duties vary by setting and level.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D094|electronics repair technician — Electronics repair technician

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct electronics and ICT-equipment repair fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Tests, diagnoses, repairs and maintains electronic equipment using schematics, test instruments and repair records.
- Global sources: ONET_ELECTRONICS_REPAIR
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D095|existing library motor vehicle body repairer not active — Motor vehicle body repairer / automotive body repairer

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: This exact D095 role-library record is absent from active D095 links. The body-panel repair task family is not obviously represented by coachbuilder (body/frame construction) or motor vehicle body assembler (manufacturing assembly); confirm exact role descriptions and duplicate ownership.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Repairs collision or other body damage by removing or reshaping damaged panels, fitting/welding replacement body parts, smoothing surfaces and refinishing paint, then inspecting repair quality.
- Global sources: ONET_AUTOMOTIVE_BODY_REPAIRERS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D096|existing library agronomist not active — Agronomist / farming adviser

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D096 library contains an inactive agronomist record. ILO ISCO-08 2132 recognizes farming, forestry and fisheries advisers and names agronomist among the examples; professional advisory work may be more appropriate to an agricultural science/advisory domain than machinery operations.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Applies crop and soil science to advise on crop production, farm practices, productivity and related resource decisions.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D096|existing library crop farmer not active — Crop farmer / field-crop grower

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D096 library contains crop farmer but the active links are machinery-heavy. ILO ISCO-08 6111 describes crop-grower work; determine whether 'Farm Operations' intentionally includes production occupations or only equipment operations.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Plans or performs crop production such as land preparation, sowing, cultivation, crop care, harvesting, storage and marketing; mechanization may be one means, not the defining occupation.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS, ONET_CROP_FARMWORKERS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D096|existing library farmworker not active — Farmworker / agricultural labourer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D096 library contains this inactive record, while no active D096 role family describes routine farm labour. ILO ISCO-08 classifies elementary agricultural labour separately from machinery technicians/operators. Resolve whether 'Farm Operations' covers this workforce or whether the role belongs under crop/livestock production domains.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Performs routine crop or animal production tasks such as planting, cultivating, harvesting, feeding, cleaning, sorting and packing under instruction.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS, ONET_CROP_FARMWORKERS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D096|existing library mixed crop livestock farmer not active — Mixed crop and livestock farmer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D096 library contains this inactive record. ILO ISCO-08 6130 explicitly distinguishes genuinely mixed crop-and-animal production from farms primarily specialized in crops or livestock; clarify whether this belongs in D096 or in the primary production domains.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Operates a farm with both crop production and animal production as material market activities; incidental secondary production alone does not make a farm mixed.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D097|welding inspector — Welding inspector

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct welding-quality and fabrication-inspection fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Inspects weld quality and conformance, interprets drawings/codes, records findings and supports certification or corrective action.
- Global sources: AWS_WELDING_INSPECTOR, ONET_WELDERS
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D098|existing library machinist cnc not active — Machinist / CNC machinist

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D098 library contains an inactive machinist/CNC machinist record. O*NET 51-4041.00 describes setup, programming, precision machining and tolerance inspection; compare against D097's general CNC machine operator and D098's tool-and-die maker to avoid duplicate task coverage.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Sets up, programs and operates machine tools to make precision parts to drawings/tolerances; measures finished parts, adjusts tooling and maintains machine operation.
- Global sources: ONET_MACHINISTS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D099|bricklayer — Bricklayer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct masonry and bricklaying fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Measures, lays and repairs brick/block and related masonry structures using mortar and construction tools.
- Global sources: ONET_MASONRY
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D100|existing library pipefitter not active — Pipefitter / steamfitter

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: An exact D100 role-library record is absent from active D100 links, while the parent title includes pipefitting. Distinguish building-services pipe fitting from pipeline network maintenance and industrial process/steam fitting; consolidate or keep separate only when task scope justifies it.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Measures, cuts, threads, assembles, installs, tests and maintains piping systems for water, steam, gas, chemicals or other fluids from technical drawings and system specifications.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D101|painter construction maintenance — Painter, construction and maintenance

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct painting and surface-treatment fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Prepares, coats and finishes construction or maintenance surfaces using appropriate paints and finishing methods.
- Global sources: ONET_PAINTERS
- Nigerian context sources: NG_CORBON_PAINTING
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D101|paperhanger wall covering installer — Paperhanger / wall-covering installer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct surface-treatment and interior-finishing fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Prepares interior surfaces and installs wall coverings as a finishing trade.
- Global sources: ONET_PAPERHANGERS
- Nigerian context sources: NG_CORBON_PAINTING
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch2.json

### D102|carpenter — Carpenter

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct carpentry, joinery and woodwork fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Constructs, installs and repairs wood structures, fixtures, frames, cabinets and related components.
- Global sources: ONET_TAILORS
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D103|jeweller — Jeweller

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct jewellery and precious-material craft fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Designs, fabricates, repairs, polishes or appraises jewellery, precious metals and gems.
- Global sources: ONET_JEWELLERS
- Nigerian context sources: NG_NCAC
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D104|potter — Potter

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct pottery and ceramics fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Shapes, glazes and fires clay or ceramic products using hand tools, wheels, moulds or production equipment.
- Global sources: ONET_POTTERS
- Nigerian context sources: NG_NCAC
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D105|craft artist — Craft artist

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct handicraft and craft-production fit.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Designs and produces functional or decorative handmade objects using textiles, fibres, wood, clay, glass, metal or mixed media.
- Global sources: ONET_LEATHER_WORKERS
- Nigerian context sources: NG_NCAC
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D106|tailor — Tailor

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct garment-making and tailoring fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Measures, cuts, fits, alters, repairs and constructs garments to customer or production specifications.
- Global sources: ONET_TAILORS
- Nigerian context sources: NG_FADAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D107|leatherworker — Leatherworker

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct leatherworking and footwear-production fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Cuts, stitches, finishes, repairs or assembles leather goods and footwear using hand or machine processes.
- Global sources: ONET_LEATHER_WORKERS
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D108|existing library print production manager not active — Print production manager

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: An exact D108 library record is inactive, but task prevalence and boundaries vary. Hong Kong VTC documents the production-manager function; ISCO provides general manufacturing-manager/supervisor categories rather than a globally distinct print-manager unit group. Compare scope with active print-studio supervisor and manufacturing-management pathways before deciding.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Plans and schedules print production, coordinates people/equipment/materials, and manages output quality, cost and delivery.
- Global sources: VTC_HONG_KONG_PRINT_PRODUCTION, ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D108|existing library printing engineer not active — Printing engineer / print technology engineer

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: An exact D108 library note calls this a standard ESCO role, but this pass did not find the claimed ESCO record/URI. The Austrian AMS source documents printing technicians and references ISCO 7322, not proof of a global 'printing engineer' occupation. Keep the global claim unsupported pending direct ESCO and multi-jurisdiction sources.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Could include technical optimization, process/equipment selection, production workflow and print-quality engineering; exact role scope requires a verified source profile.
- Global sources: AMS_AUSTRIAN_PRINT_TECHNICIAN, ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D109|existing library foundry moulder not active — Foundry moulder / metal moulder and coremaker

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D109 library contains an inactive foundry-moulder record. ILO ISCO-08 7211 classifies metal moulders/coremakers separately from 8121 metal-processing plant operators; O*NET also separates foundry mold/coremaking from machine-based molding/casting. The active D109 links are mainly machine/plant operators, so the distinct craft task family appears unrepresented.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Makes and repairs foundry molds and cores from patterns and specified materials so molten metal can be cast to shape; may work by hand or with molding equipment.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS, ONET_FOUNDRY_MOLD_COREMAKERS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D109|existing library metallurgical technician not active — Metallurgical technician / metallurgical production technician

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: An exact D109 library record is inactive. ILO occupational classification recognizes a technical metallurgical family (ISCO-08 3117); current active D109 roles are operator/trade roles. Reconcile this role's exact duties with metallurgical engineers and quality/laboratory technicians in neighboring domains before activation.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Supports metallurgical production or processing through technical work such as sampling/testing materials, monitoring processes, assisting with process control and quality/safety checks.
- Global sources: ILO_ISCO08_ELECTRICAL_AND_SERVICE_GROUPS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D110|chemical engineering technician inactive — Chemical engineering technician

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D110 role-library record is inactive. The current 56 active links are overwhelmingly plant/machine-operation titles; ISCO-08 3116 identifies a separate chemical-engineering technician family, so this may fill a genuinely distinct technical tier if the stored record tasks align with D110's process-industry scope and are not already covered by chemical-process technician roles elsewhere.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Performs technical support for chemical-engineering work such as process testing, sampling, measurement, calculations, technical documentation and monitoring under engineering direction; exact active-library duties must be inspected.
- Global sources: ILO_ISCO08_MANUFACTURING_FAMILIES
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D111|tailor inactive — Tailor / dressmaker

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact D111 library has an inactive tailor record, while the active list covers sewing-machine operation and industrial garment/textile production but no explicit tailor/dressmaker role. ISCO-08 7531 defines the craft family. Check for equivalent tailoring tasks under active garment roles before treating it as a missing family.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Measures, cuts, fits, alters and constructs garments, including custom or made-to-measure clothing; differs from operating industrial sewing or textile machinery by garment-specific fitting and construction work.
- Global sources: ILO_ISCO08_MANUFACTURING_FAMILIES
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D111|textile industrial engineer inactive — Clothing/textile industrial engineer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: The exact library record is inactive, but ISCO-08 2141 describes industrial and production engineers broadly rather than establishing a globally distinct clothing/textile-engineer occupation. Keep as a low-confidence title/possible specialization candidate until authoritative global task evidence and exact record content justify a separate occupational role.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Potentially designs or improves manufacturing systems, capacity, workflow, quality and production efficiency in textile or apparel manufacturing; exact library record must be checked.
- Global sources: ILO_ISCO08_MANUFACTURING_FAMILIES
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06.json

### D112|paper machine operator — Paper machine operator

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct pulp, paper and wood-processing fit.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Sets up, monitors and adjusts paper or pulp-processing machinery and records production quality and process conditions.
- Global sources: ONET_SAWMILL_PAPER
- Nigerian context sources: NG_NBTE_DIRECTORY
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_role_enrichment_checkpoint_2026_10_06_batch3.json

### D132|spacecraft operations engineer — Spacecraft Operations Engineer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to spacecraft operations and mission-control work.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Technical spacecraft-subsystem and mission-operations specialist; supports operational preparation, procedures, spacecraft control and in-orbit activity.
- Global sources: ESA_MISSION_CONTROL, NASA_MISSION_OPERATIONS
- Nigerian context sources: NCAIR_NITDA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D134|marine engineer assistant — Marine Engineer Assistant

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Fits the marine-engineering operational route, but should not be conflated with a naval architect or design engineer.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Support ship-engine-room operations and maintenance under the applicable seafarer competency and practical-training route.
- Global sources: BLS_MARINE_ENGINEERS
- Nigerian context sources: NIMASA_QUALIFICATION_TRAINING, NIMASA_MEA_REQUIREMENTS, NIMASA_STANDARDS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D134|marine engineer naval architect — Marine Engineer / Naval Architect

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to naval architecture and marine engineering.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Design, develop, test and evaluate marine vessels, propulsion, ship machinery and related marine systems.
- Global sources: BLS_MARINE_ENGINEERS
- Nigerian context sources: NIMASA_QUALIFICATION_TRAINING, NIMASA_STANDARDS
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D136|flight test engineer — Flight Test Engineer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to aeronautical/aerospace test and evaluation.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Plan and execute flight-test programmes, instrument aircraft, analyse performance data and support test-and-evaluation decisions.
- Global sources: ESA_MISSION_CONTROL
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D137|medical dosimetrist — Medical Dosimetrist

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to radiation-therapy treatment planning; distinct from radiation therapist and medical physicist.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Translate radiation-oncology prescriptions and physicist requirements into an individually planned radiation treatment course and communicate the plan to the oncology team.
- Global sources: AAPM_DOSIMETRIST_RESPONSIBILITIES, AAPM_DOSIMETRIST_WORKFORCE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D139|game developer — Game Developer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to Game Engineering and Technology.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Implement game software and systems, including gameplay, platform and product features.
- Global sources: BLS_GAME_ARTS
- Nigerian context sources: XP_ARENA, CODEBOX_GAMES, NITDA_BOOTCAMP
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D139|game producer — Game Producer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to Game Production and Team Delivery.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Coordinate multidisciplinary game production, schedules, delivery and product development.
- Global sources: BLS_GAME_ARTS
- Nigerian context sources: CODEBOX_GAMES, FMACCE_PLAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D141|quantum algorithm engineer — Quantum Algorithm Engineer

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to Quantum Algorithms and Software.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Develop and test quantum algorithms and software using quantum information, optimization and computational methods.
- Global sources: IBM_QUANTUM_RESEARCH, QEDC_WORKFORCE
- Nigerian context sources: NCAIR_NITDA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D141|quantum algorithm theorist — Quantum Algorithm Theorist

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to Quantum Algorithms and Software and quantum research.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Research and formulate quantum algorithms and theory involving quantum information, optimization and mathematical/computational methods.
- Global sources: IBM_QUANTUM_RESEARCH
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D141|quantum system performance scientist — Quantum System Performance Scientist

- Original disposition: `add`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to quantum-system performance at the hardware/software boundary.
- Area gate: parent-domain evidence exists, but no specific existing/proposed area label and independent area-fit rationale is recorded
- Task scope: Evaluate and improve quantum-computing system performance across hardware, software, benchmarking and experimental results.
- Global sources: IBM_QUANTUM_RESEARCH, QEDC_TECHNICIAN_GUIDE
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D143|digital forensics examiner — Digital Forensics Examiner

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to digital forensics and criminal-investigation evidence work.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Acquire, preserve, examine and report on digital evidence in cyber-incident or investigative contexts.
- Global sources: NIST_D4I, NICE_FORENSICS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D144|hydrometeorological technician — Hydrometeorological Technician / Meteorological Observer

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to operational observation within climate, meteorology and atmospheric services.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Collect, quality-check and report weather and hydrometeorological observations for forecasting and operational services.
- Global sources: NOAA_METEOROLOGY
- Nigerian context sources: NIMET_ABOUT, NIMET_FOI
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D153|music production performance family — Music Producer; Sound Engineer; Composer; Musician/Singer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Directly covers music creation, performance and audio-production practice families.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Create, arrange, perform, record, mix or produce music and sound work.
- Global sources: ONET_MUSICIANS, ONET_SOUND
- Nigerian context sources: NCC_MUSIC, NEXIM_CREATIVE
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D155|materials characterization scientist — Materials Characterization Scientist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to advanced-materials research and measurement.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Characterize the structure, composition and performance of metals, ceramics, polymers, semiconductors or other advanced materials using laboratory analysis and testing.
- Global sources: BLS_MATERIALS_SCIENTISTS
- Nigerian context sources: NOTAP_TECH_TRANSFER
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D156|photogrammetrist — Photogrammetrist

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Potential direct fit to cadastral mapping and geospatial measurement.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Derive measurements, maps or 3D information from overlapping imagery and geospatial data.
- Global sources: ESCO_OCCUPATIONS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D157|tax advisory compliance family — Tax Adviser; Tax Compliance Officer; Tax Examiner/Revenue Agent; Transfer Pricing Specialist

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to Tax Advisory and Compliance; separate advisory, enforcement and transfer-pricing routes.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Advise on tax obligations, prepare/review tax records, administer compliance, audit returns or handle transfer pricing.
- Global sources: BLS_ACCOUNTANTS, BLS_TAX
- Nigerian context sources: CITN_CAREERS, CITN_MEMBERSHIP
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D162|asylum caseworker — Asylum Caseworker

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Potential direct fit, but strongly jurisdiction-specific.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Assess asylum/immigration cases, gather evidence, apply the relevant framework and communicate decisions or recommendations.
- Global sources: ESCO_OCCUPATIONS
- Nigerian context sources: none recorded
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D163|patent examiner — Patent Examiner

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to patent examination, but institution-specific to patent offices and distinct from patent attorney/agent representation.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Search prior art, review patent applications for formal and substantive requirements, and communicate patentability findings through official examination actions.
- Global sources: USPTO_PATENT_EXAMINER
- Nigerian context sources: NOTAP_TECH_TRANSFER, NOTAP_EO5
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06_b.json

### D166|autonomous vehicle design engineer — Autonomous Vehicle Design Engineer

- Original disposition: `alias_existing`; effective disposition: `alias_pending_area_fit`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Direct fit to autonomous-vehicle engineering and vehicle integration/perception-control interfaces.
- Area gate: alias target may already exist, but the candidate still lacks a specific area-of-specialization assignment
- Task scope: Design vehicle/robotic systems involving automatic vehicle control, autonomous vehicles, sensing, computer vision or telematics.
- Global sources: ONET_ROBOTICS
- Nigerian context sources: NCAIR_NITDA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D167|xr technical artist — XR Technical Artist

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Potential fit to XR Experience, Interaction and Content Design.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Bridge visual-content production and real-time technical implementation for immersive experiences.
- Global sources: BLS_GAME_ARTS
- Nigerian context sources: NCAIR_NITDA
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

### D168|esports operations content lead — Esports Operations and Content Lead

- Original disposition: `review_only`; effective disposition: `review_only`
- Area-fit status: `review_only_missing_area_assignment`; assignment: `none recorded`
- Parent-domain fit: Spans competition operations and broadcast/content; should branch into existing specialist routes.
- Area gate: candidate remains review-only and has no specific area-of-specialization assignment
- Task scope: Coordinate tournament/product operations and audience-facing content/community work.
- Global sources: BLS_GAME_ARTS
- Nigerian context sources: XP_ARENA, FMACCE_PLAN
- Source files: data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_role_enrichment_checkpoint_2026_10_06.json

