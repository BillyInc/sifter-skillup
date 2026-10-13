# Domain–Area Parent-Overlap Audit

Date: 2026-10-08  
Status: complete; canonical repairs applied locally  
Machine-readable register: `data/career-mapping/_audit/domain_area_parent_overlap_scan_2026_10_08.json`

## Scope and result

The scan checked all **168 canonical domains** and all **708 area-of-specialization records** in:

- `data/career-mapping/domain_meta.json`
- `data/career-mapping/domain_structure.json`

It found **13 candidate cross-domain parent-boundary relationships affecting 15 area records**. Two relationships are exact duplicate-label pairs:

- `D154:clinical-exercise-physiology` and `D165:clinical-exercise-physiology`
- `D046:community-and-social-development` and `D128:community-and-social-development`

Original audit dispositions (retained for traceability):

| Disposition | Candidate relationships | Area records | Meaning |
|---|---:|---:|---|
| Rename | 4 | 4 | The current label can mislead learners because the area reads like the dedicated parent domain or duplicates another area label. |
| Refine | 6 | 6 | The area may remain, but its definition must state the application boundary and what belongs to the dedicated parent domain. |
| Needs review | 3 | 5 | The original audit classification before the locally applied resolution. |

Final implementation count: **4 renames applied, 6 boundaries refined, 3 compatibility redirects applied, and 0 candidates left for review**. The machine-readable register retains both the original disposition and the applied disposition for audit traceability.

## Applied canonical repairs

All 13 candidate relationships were resolved locally, including the three cases originally marked `needs_review`. The repairs changed only area labels/boundaries in `domain_structure.json` and `domain_specialization_catalog.json`; stable area IDs were preserved so existing role references remain resolvable.

- D078 `psychology-social-behaviour` is now **Social Behaviour and Interaction**, explicitly bounded away from clinical psychology and counselling in D064.
- D068 laboratory and imaging entries are explicit compatibility redirects to D122 and D123, respectively, rather than duplicate allied-health learning paths.
- D165 `clinical-exercise-physiology` is an explicit compatibility redirect to D154; the D154 record remains the canonical owner.
- D046 retains **Community and Social Development** with a community-development boundary, while D128 is **Community Welfare Outreach and Participation**.
- The remaining candidates were renamed or boundary-refined as listed below.

The deterministic application is recorded in `data/career-mapping/_audit/apply_domain_area_parent_overlap_repairs_2026_10_08.py`. Roles, matcher files, SQL and UI were intentionally not changed, and no review-only item was promoted to student visibility merely by this repair.

## Candidate register

### OV-001 — D078 psychology label versus D064 psychology domain

- Candidate: `D078:psychology-social-behaviour` — **Psychology and Social Behaviour**
- Parent-domain candidate: `D064` — **Psychology and Counselling**
- Disposition: **rename**
- Recommendation: Use a social-science label such as **Social Behaviour and Interaction**. Retain the area for theory- and evidence-based study of social behaviour, group interaction and social processes. Explicitly exclude clinical assessment, diagnosis, counselling, psychotherapy and psychologist licensure; those belong to the D064 route.
- Why: The current label reads like general psychology, while D064 is the canonical psychology practice domain. The existing D078 definition is narrower than professional psychology, so the risk is primarily the name and student interpretation.
- Catalogue locators: `domain_structure.json:D078.areas_of_specialization[D078:psychology-social-behaviour]`; `domain_structure.json:D064.areas_of_specialization`; `domain_specialization_catalog.json:D078 and D064 area records`.
- Evidence:
  - UNESCO UIS, [ISCED detailed field descriptions](https://www.uis.unesco.org/sites/default/files/medias/fichiers/2025/04/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf), field 0313: psychology is the study of mind and behaviour, within the wider social and behavioural-science classification.
  - UNESCO UIS, [Social Sciences for R&D Data](https://uis.unesco.org/node/3080050): lists psychology/cognitive sciences alongside sociology, economics, political science and social/economic geography.
  - APA, [Recognized Specialties, Subspecialties and Proficiencies](https://www.apa.org/ed/graduate/specialize/recognized): the existing D064 evidence for distinct professional psychology specialties; US-specific, not a universal licensure rule.

### OV-002 — D068 imaging area versus D123 imaging domain

- Candidate: `D068:medical-imaging-and-radiography` — **Medical Imaging and Radiography**
- Parent-domain candidate: `D123` — **Radiography and Medical Imaging**
- Disposition: **compatibility redirect applied**
- Applied result: The stable D068 area now reads **Radiography and Medical Imaging (Dedicated D123 Route)** and is bounded as a retired independent D068 specialization. The full route remains under D123; the compatibility record is not an independent student-facing path.
- Why: The area label is nearly identical to the dedicated D123 domain and its definition describes diagnostic imaging practice.
- Catalogue locators: `domain_structure.json:D068.areas_of_specialization[D068:medical-imaging-and-radiography]`; `domain_structure.json:D123.areas_of_specialization`; `domain_meta.json:D068 and D123`.
- Evidence: ASRT, [Practice Standards for Medical Imaging and Radiation Therapy](https://www.asrt.org/main/standards-and-regulations/professional-practice/practice-standards-online), defines the medical-imaging professions and their discipline-specific practice scopes, including radiography, CT, MRI, mammography, nuclear medicine and sonography.

### OV-003 — D068 laboratory area versus D122 laboratory domain

- Candidate: `D068:biomedical-laboratory-diagnostics` — **Biomedical Laboratory Diagnostics**
- Parent-domain candidate: `D122` — **Medical Laboratory Technology**
- Disposition: **compatibility redirect applied**
- Applied result: The stable D068 area now reads **Medical Laboratory Diagnostics (Dedicated D122 Route)** and is bounded as a retired independent D068 specialization. The full route remains under D122; the compatibility record is not an independent student-facing path.
- Why: The D068 definition is explicitly specimen-based clinical laboratory science, with quality assurance, result validation and clinical interpretation. That is the dedicated D122 subject rather than a distinct rehabilitation/allied-health specialization.
- Catalogue locators: `domain_structure.json:D068.areas_of_specialization[D068:biomedical-laboratory-diagnostics]`; `domain_structure.json:D122.areas_of_specialization`; `domain_meta.json:D068 and D122`.
- Evidence: IFBLS, [Core Competence](https://ifbls.org/index.php/statements/core-competence-core-curriculum), defines biomedical laboratory science around patient-specimen analysis, quality assurance, validation and clinical interpretation.

### OV-004 — D027 computational biomedicine versus D142 bioinformatics

- Candidate: `D027:bioinformatics-and-computational-biomedicine` — **Bioinformatics and Computational Biomedicine**
- Parent-domain candidate: `D142` — **Bioinformatics and Computational Biology**
- Disposition: **refine**
- Recommendation: Keep a D027 branch only where a biomedical-science question and biomedical interpretation are central. Rename or describe it as a biomedical application of computation; exclude general bioinformatics methods, omics pipelines, workflow engineering and computational-biology infrastructure that belong in D142.
- Why: D027 already says it is a candidate cross-disciplinary area, but its label collides with the dedicated D142 field. The correct solution is a clear application boundary, not removal of valid biomedical computation.
- Catalogue locators: `domain_structure.json:D027.areas_of_specialization[D027:bioinformatics-and-computational-biomedicine]`; `domain_structure.json:D142.areas_of_specialization`; `domain_specialization_catalog.json:D027 and D142`.
- Evidence:
  - ISCB, [About ISCB](https://www.iscb.org/about-iscb), describes computational biology and bioinformatics as computation applied to living systems.
  - IUBMB, [Standards for Doctoral Degrees in the Molecular Biosciences](https://iubmb.org/resources/standards-for-the-doctoral-degrees/), places bioinformatics/computational biology among molecular-bioscience fields while distinguishing it from other molecular fields.

### OV-005 — D072 land surveying/cadastre versus D156 land-surveying domain

- Candidate: `D072:land-surveying-cadastre` — **Land Surveying and Cadastre**
- Parent-domain candidate: `D156` — **Land Surveying and Cadastral Mapping**
- Disposition: **refine**
- Recommendation: Keep D156 as the dedicated route for cadastral and boundary-survey practice. Refine D072 toward geospatial information, spatial-data infrastructure or GIS for land administration. Make surveyor-authorized boundary determination a D156 route rather than an implied D072 foundation.
- Why: The D072 area name is almost the same as the dedicated D156 domain. FIG distinguishes spatial information management from cadastral surveying and land administration, so the records need a boundary rather than duplicate learner choices.
- Catalogue locators: `domain_structure.json:D072.areas_of_specialization[D072:land-surveying-cadastre]`; `domain_structure.json:D156.areas_of_specialization`; `domain_meta.json:D072 and D156`.
- Evidence: FIG, [Statement on the Cadastre](https://www.fig.net/organisation/comm/7/library/reports/cadastre/statement_on_cadastre.html), defines a cadastre and cadastral surveying, including parcel boundaries and land interests. FIG, [Commission 3 — Spatial Information Management](https://www.fig.net/organisation/comm/3/), covers spatial information, geospatial data, GIS and land administration.

### OV-006 — D037 IP/data-law area versus D163 IP-law domain

- Candidate: `D037:intellectual-property-technology-and-data-law` — **Intellectual Property, Technology and Data Law**
- Parent-domain candidate: `D163` — **Intellectual Property Law and Patent Practice**
- Disposition: **rename**
- Recommendation: Rename/refine D037 around **Technology, Privacy and Data Legal Practice**. Route dedicated IP rights, patent strategy/prosecution and IP portfolio practice to D163. Keep cross-domain legal links where actual legal tasks are present.
- Why: The current D037 label includes a subject that D163 explicitly owns. The technology, privacy and data-law portion can remain in Legal Practice without presenting IP twice.
- Catalogue locators: `domain_structure.json:D037.areas_of_specialization[D037:intellectual-property-technology-and-data-law]`; `domain_structure.json:D163`; `domain_meta.json:D037 and D163`.
- Evidence: IBA, [Committee Content](https://www.ibanet.org/committee-content), and [Legal Practice Division](https://www.ibanet.org/LPD), list IP, technology, communications and other legal-practice fields as distinguishable practice areas. These are professional indexes, not a universal global area-count rule.

### OV-007 — D037 criminal-justice area versus D151 criminal-justice domain

- Candidate: `D037:criminal-justice` — **Criminal Justice**
- Parent-domain candidate: `D151` — **Criminology, Criminal Justice and Corrections**
- Disposition: **rename**
- Recommendation: Rename the D037 area to **Criminal Law and Legal Advocacy** (or an equivalent source-supported legal-practice label). Keep criminology, policing systems, corrections and re-entry within D151.
- Why: “Criminal Justice” in a Legal Practice domain can be mistaken for D151's full system scope. The IBA evidence supports criminal law as a legal practice; UNODC's scope shows that criminal justice also includes prisons, rehabilitation and reintegration.
- Catalogue locators: `domain_structure.json:D037.areas_of_specialization[D037:criminal-justice]`; `domain_structure.json:D151.areas_of_specialization`; `domain_meta.json:D037 and D151`.
- Evidence: IBA, [Committee Content](https://www.ibanet.org/committee-content), indexes criminal law under legal practice. UNODC, [Criminal Justice and Prison Reform](https://www.unodc.org/unodc/en/justice-and-prison-reform/index.html), covers justice systems, prison reform, rehabilitation, reintegration and human-rights-based criminal justice.

### OV-008 — D003 robotics wording versus D140 robotics domain

- Candidate: `D003:intelligent-agents-and-robotics` — **Intelligent Agents and Robotics**
- Parent-domain candidate: `D140` — **Robotics Engineering and Systems Design**
- Disposition: **refine**
- Recommendation: Refine the D003 area toward **Intelligent Agents, Planning and Robot Learning**. Keep AI models, reasoning, perception and learning methods in D003. Keep robot mechanisms, control hardware, integration and deployment in D140.
- Why: AI curricula legitimately include agents, planning, robot learning and robotics topics, but the current label could duplicate the dedicated robotics-engineering domain. The distinction is methods/intelligence versus complete engineered robotic systems.
- Catalogue locators: `domain_structure.json:D003.areas_of_specialization[D003:intelligent-agents-and-robotics]`; `domain_structure.json:D140.areas_of_specialization`; `domain_meta.json:D003 and D140`.
- Evidence:
  - ACM/IEEE Computer Society/AAAI, [CS2023 AI Knowledge Area](https://csed.acm.org/wp-content/uploads/2023/09/Version-Gamma.pdf), lists agents, reasoning, search, planning, robotics, perception and computer vision as AI knowledge units.
  - IEEE RAS, [Technical Committees](https://www.ieee-ras.org/technical-committees/list-of-technical-committees/), lists robotics system areas including planning/control, manipulation, HRI, manufacturing robotics, verification and mechanisms/design.

### OV-009 — exact duplicate clinical exercise physiology areas

- Candidate areas: `D154:clinical-exercise-physiology` and `D165:clinical-exercise-physiology`, both labelled **Clinical Exercise Physiology**.
- Parent-domain candidate: `D154` — **Exercise Science and Sports Therapy** is the leading candidate; D165 is **Wellness Coaching and Lifestyle Medicine**.
- Disposition: **compatibility redirect applied**
- Applied result: D154 remains the canonical owner. The stable D165 area now reads **Clinical Exercise Physiology (Dedicated D154 Route)** and is bounded as a retired independent D165 specialization, preserving the credential and jurisdiction limits.
- Why: The two definitions both describe clinical exercise assessment/prescription. D165's own coaching evidence says coaching does not include diagnosis, treatment or exercise prescription without separate credentials.
- Catalogue locators: `domain_structure.json:D154.areas_of_specialization[D154:clinical-exercise-physiology]`; `domain_structure.json:D165.areas_of_specialization[D165:clinical-exercise-physiology]`; `domain_specialization_catalog.json:D154 and D165`.
- Evidence:
  - ACSM, [Clinical Exercise Physiologist scope](https://acsm.org/certification/get-certified/clinical-exercise-physiologist/world-clinical-exercise-physiology-day/), describes education, supervised exercise programming and clinical populations.
  - NBHWC, [Scope of Practice](https://nbhwc.org/scope-of-practice/), limits health and wellness coaches from diagnosing, treating or prescribing clinical interventions unless separately qualified.

### OV-010 — exact duplicate community/social-development areas

- Candidate areas: `D046:community-and-social-development` and `D128:community-and-social-development`, both labelled **Community and Social Development**.
- Parent-domain candidates: `D046` — **Social Work and Community Development**; `D128` — **Social Welfare and Youth Services**.
- Disposition: **rename applied**
- Applied result: D046 retains **Community and Social Development** with a clarified community-development/social-work boundary. D128 is now **Community Welfare Outreach and Participation**, so the two routes no longer present the same student-facing specialization label.
- Why: D046 emphasizes community/organizational development, participation and collective change. D128 emphasizes welfare, youth and service coordination. The exact duplicate label hides that difference.
- Catalogue locators: `domain_structure.json:D046.areas_of_specialization[D046:community-and-social-development]`; `domain_structure.json:D128.areas_of_specialization[D128:community-and-social-development]`; `domain_meta.json:D046 and D128`.
- Evidence:
  - IFSW, [Global Definition of Social Work](https://www.ifsw.org/what-is-social-work/global-definition-of-social-work/), supports social change, development, cohesion, empowerment, rights and work with people and structures.
  - IFSW, [Global Standards](https://www.ifsw.org/global-standards/), explains practice-setting/population/level variation and warns against collapsing all welfare/community-worker categories into one professional identity.
  - UNICEF, [Adolescence](https://www.unicef.org/adolescence), supports D128's youth-development/service context, not generic community development.
- Data-quality note: the current D046 area source list contains `D055-AICHE-EXT-2026` / AIChE material. That locator is unrelated to community and social development and should be corrected in a separate evidence-cleanup pass; this audit does not edit it.

### OV-011 — D053 travel/tourism area versus D083 travel/tourism domain

- Candidate: `D053:travel-tourism-and-visitor-services` — **Travel, Tourism and Visitor Services**
- Parent-domain candidate: `D083` — **Travel and Tourism**
- Disposition: **refine**
- Recommendation: Refine D053 toward **Hospitality Visitor and Guest Services**, covering visitor-facing services delivered through accommodation, food-service or hospitality operations. Route travel planning, tour operations and destination management to D083.
- Why: D053 currently includes travel and tour operations, tourism services and visitor guidance, while D083 is a dedicated Travel and Tourism domain with reservations, tours, destination management and passenger travel.
- Catalogue locators: `domain_structure.json:D053.areas_of_specialization[D053:travel-tourism-and-visitor-services]`; `domain_structure.json:D083.areas_of_specialization`; `domain_meta.json:D053 and D083`.

### OV-012 — D049 driving-automation area versus D166 autonomy domain

- Candidate: `D049:vehicle-testing-validation-and-driving-automation` — **Vehicle Testing, Validation and Driving Automation**
- Parent-domain candidate: `D166` — **Autonomous Vehicles and Self-Driving Systems**
- Disposition: **refine**
- Recommendation: Refine D049 toward **Vehicle Testing and Validation**, including conventional vehicle systems and validation methods. Route automated-driving perception, localization, planning, control, operational-design-domain safety and autonomy-specific verification to D166.
- Why: D049 legitimately covers general vehicle testing and validation, but its current label includes the defining scope of D166.
- Catalogue locators: `domain_structure.json:D049.areas_of_specialization[D049:vehicle-testing-validation-and-driving-automation]`; `domain_structure.json:D166.areas_of_specialization`; `domain_meta.json:D049 and D166`.

### OV-013 — D031 retail-sales area versus D085 retail domain

- Candidate: `D031:retail-and-wholesale-sales` — **Retail and Wholesale Sales**
- Parent-domain candidate: `D085` — **Retail Sales and Shop Operations**
- Disposition: **refine**
- Recommendation: Refine D031 toward **Wholesale, B2B and General Sales Practice**, leaving frontline retail, merchandising, shop operations and omnichannel retail learning to D085.
- Why: D031 is a general sales/business-development domain, but its retail label risks presenting a second retail route beside the dedicated D085 domain.
- Catalogue locators: `domain_structure.json:D031.areas_of_specialization[D031:retail-and-wholesale-sales]`; `domain_structure.json:D085.areas_of_specialization`; `domain_meta.json:D031 and D085`.

## Control case: overlap that should not be treated as duplication

`D050:robotics-and-mechatronic-automation` overlaps D140 by subject vocabulary, but its definition is specifically industrial work cells, production systems, commissioning, programming and maintenance. IEC TC65 and ISA-95 evidence supports industrial process measurement, control, automation and enterprise-control integration. It should therefore be **kept with an explicit industrial-automation boundary**, not automatically reparented to D140.

## Checkpoint and handoff

The full scan and repair are complete; there is no unfinished overlap queue. The machine-readable register contains the 13 candidate IDs, evidence locators, original rationale and the applied implementation record. The three former review cases were not left unresolved: they were converted to explicit stable-ID compatibility redirects to their dedicated parent domains.

Stable area IDs were preserved. This pass changed only the two canonical area files and the audit/application records. Role mapping, matcher, SQL and UI files were not changed; a subsequent role-route regression and seed-readiness audit can therefore run against the repaired taxonomy.
