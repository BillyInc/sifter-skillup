# CCMAS programme → domain mapping audit

Audit date: 2026-08-17  
Scope: CCMAS programme-level mapping only. No mapping files, seed SQL, subgroup definitions, or JAMB inheritance were changed.

## Sources audited

- `programme_domain_final.json` — current runtime/seed mapping.
- `programme_domain_scores.json` — scorer output used as supporting evidence, not runtime truth.
- `domain_meta.json` — current domain descriptions and institution context.
- `domain_structure.json` — current foundation skills and subgroup structure.
- `ccmas/*.json` — CCMAS programme curricula, course titles, learning outcomes, and skills.

## Executive finding

The current mapping is not yet reliable enough to expose as authoritative programme guidance. It contains three different problems:

1. Some programme/domain pairs are clearly wrong.
2. Some pairs are directionally reasonable but have the wrong tier: Direct is being used where Functional or Adjacent is appropriate.
3. Many Functional links are supported only by generic words such as management, research, statistics, communication, public, computer, or engineering. Those words do not establish a domain mapping by themselves.

The current final mapping contains 236 programme records and 2,528 links:

| Current tier | Links |
|---|---:|
| Direct | 349 |
| Functional | 2,040 |
| Adjacent | 139 |

There are 168 domain definitions. 160 domain IDs currently receive programme links; seven trade domains have no feeder and D086 is excluded. This is a coverage observation, not evidence that all 160 populated domains are correctly mapped.

## Audit rule used

- **Direct:** the programme’s main purpose, core curriculum, and normal professional destination are the domain. A single related course is not enough. A degree is not Direct to a technician or trade domain merely because it contains introductory technical content.
- **Functional:** the curriculum teaches substantial capabilities used in the target domain, but the programme is not the target professional training. The explanation must identify actual course or learning-outcome evidence and the specialist gap.
- **Adjacent:** the curriculum supplies a defensible bridge into the target domain, but it does not provide the target domain’s core practice. Generic employability skills are insufficient; there must be a named, target-relevant bridge capability.
- **No link:** a shared generic word, a broad subject family, or a distant institutional setting is not enough.

## Confirmed incorrect or wrong-tier links

These are high-confidence findings from the CCMAS curriculum and the stored domain definition. They should be removed, demoted, or remapped after review rather than silently retained.

| Programme | Current link | Finding | Why |
|---|---|---|---|
| Administration and Management :: Business Administration | D045 Public Administration — Direct | Wrong tier/domain emphasis | The curriculum is organisational/business management. It is not primarily the running of government ministries, councils, or public programmes. At most this is Functional through governance, policy, and public-sector management content. |
| Administration and Management :: Business Administration | D081 Office Administration, Secretarial — Direct | Incorrect | Business administration is not clerical/secretarial training. The domain definition centres filing, mail, typing, records, and data entry; those are not the programme’s professional core. |
| Administration and Management :: Transport Management | D115 Road Transport Operations (Drivers) — Direct | Incorrect tier | The curriculum teaches transport policy, logistics, passenger/freight management, planning, and systems. It does not train people to drive, maintain, or operate vehicles. This should not be Direct. |
| Administration and Management :: Public Administration | D081 Office Administration, Secretarial — Direct | Incorrect | Public administration is government/public-institution management, not secretarial work. Remove or demote only if a specific clerical track is evidenced. |
| Communication and Media Studies :: Public Relations | D045 Public Administration — Direct | Incorrect | The CCMAS curriculum is communication, media relations, campaigns, branding, crisis communication, and PR law/ethics. “Public” is not evidence of public administration. Remove. |
| Allied Health Sciences :: Health Care Administration and Hospital Management | D045 Public Administration — Direct | Wrong tier | The curriculum is healthcare operations, hospital finance, HR, logistics, patient rights, and healthcare administration. It is not government administration. At most Functional to public-sector administration. |
| Allied Health Sciences :: Public Health | D045 Public Administration — Direct | Wrong tier | Public-health policy and health-system management can support a Functional link, but the programme’s core is epidemiology, community health, environmental health, and prevention—not general government administration. |
| Medicine and Dentistry :: MBBS/MBChB | D165 Wellness Coaching, Lifestyle Medicine — Direct | Incorrect | Medical diagnosis and treatment training is not wellness coaching, dietetics, fitness instruction, or lifestyle practice. Remove. |
| Allied Health Sciences :: Complementary and Alternative Medicine | D023 Medicine — Direct | Incorrect tier | The curriculum is osteopathy, chiropractic, naturopathy, homeopathy, traditional Chinese medicine, and CAM ethics. It does not train medical doctors under the Medicine definition. Remove or retain only a carefully worded Adjacent relationship if product policy requires it. |
| Allied Health Sciences :: Pharmacology | D025 Pharmacy — Direct | Incorrect tier | Pharmacology studies drug action, toxicology, pharmacokinetics, and discovery. Pharmacy includes preparation, dispensing, prescriptions, pharmacy law, and licensed practice. Demote to Functional or remove depending on the intended guidance boundary. |
| Sciences :: Biochemistry | D122 Medical Laboratory Technology — Direct | Incorrect tier | Biochemistry provides laboratory and biological foundations, but not the clinical chemistry, haematology, specimen handling, patient records, and professional laboratory practice required by the target domain. Demote to Functional/Adjacent, not Direct. |
| Sciences :: Medical Physics | D122 Medical Laboratory Technology — Direct | Incorrect | Medical physics is physics, radiation, imaging, and clinical-technology oriented. It is not medical laboratory training. Remove. |
| Sciences :: Microbiology | D122 Medical Laboratory Technology — Direct | Incorrect tier | Microbiology has laboratory overlap, but the programme is not the clinical laboratory profession. Demote to Functional if the evidence is retained. |
| Sciences :: Science Laboratory Technology | D122 Medical Laboratory Technology — Direct | Incorrect tier | General laboratory technology and clinical medical laboratory technology are not interchangeable professional identities. Demote to Functional or remove clinical-profession guidance. |
| Education :: Biology | D142 Bioinformatics, Computational Biology — Direct | Incorrect tier | Biology Education is designed around biology teaching and teaching practice. The curriculum shown does not establish bioinformatics/computational biology as its core. Demote or remove. |
| Education :: Mathematics | D127 Early Childhood Education, Nursery — Direct | Incorrect | The curriculum is algebra, calculus, differential equations, linear/real analysis, numerical analysis, programming, and mathematics teaching. It has no early-childhood core. Remove. |
| Allied Health Sciences :: Environmental Health Science | D020 Environmental Engineering — Direct | Incorrect tier | The curriculum covers epidemiology, sanitation, environmental health, inspection, toxicology, and public health. It does not train engineers to design environmental systems. Demote to Functional only where the environmental-health inspector pathway is intended. |
| Allied Health Sciences :: Medical Laboratory Science | D138 Biomedical Engineering — Direct | Incorrect tier | One course named Biomedical Engineering appears in a curriculum dominated by clinical chemistry, haematology, microbiology, histopathology, laboratory posting, and instrumentation. One course cannot make the programme biomedical engineering. Remove or demote. |
| Sciences :: Industrial Chemistry | D050 Industrial Automation — Direct | Incorrect | The curriculum is chemistry and chemical processes; it does not establish automation, controls, robotics, or industrial instrumentation as the programme’s core. Remove or demote only with specific automation evidence. |
| Sciences :: Industrial Mathematics | D050 Industrial Automation — Direct | Incorrect | Industrial mathematics is mathematical modelling/quantitative work, not automation engineering. Remove. |
| Sciences :: Physics | D016 Electrical — Direct | Incorrect tier | Physics includes electricity, magnetism, and introductory circuits, but not electrical engineering design and professional electrical practice. Demote to Functional/Adjacent. |
| Sciences :: Physics with Electronics | D094 Electronics Servicing, ICT Equipment — Direct | Incorrect tier | The degree has physics/electronics foundations, but the target domain is repair and maintenance of phones, computers, alarms, and telecoms equipment. Demote; do not present it as a servicing qualification. |
| Engineering :: Electrical and Electronic Engineering | D093 Electrical Installation, Wiring — Direct | Incorrect tier | An engineering degree is not the same as an installation/wiring trade pathway. Remove the Direct label; retain only if the product explicitly models a downstream trade bridge. |
| Engineering :: Mechanical Engineering | D146 Building Services Engineering — Direct | Wrong tier | Mechanical engineering is broader than building services. Unless the CCMAS curriculum contains HVAC, fire protection, building automation, and building-systems design, this is Functional at most. |
| Environmental Sciences :: Building | D021 Architecture — Direct | Wrong tier | Building teaches construction, materials, graphics, strength of materials, and building/architectural science. It is closer to construction management/building technology than the architect profession. Demote or remap. |
| Education :: Home Economics | D063 Economics — Direct | Incorrect | The curriculum is foods, clothing, textiles, home economics, entrepreneurship, and teaching practice. “Economics” in Home Economics does not establish the Economics domain. Remove. |
| Social Sciences :: Political Science | D063 Economics — Direct | Wrong tier | Political economy is one course area; the programme is political institutions, government, constitutional development, political analysis, and international relations. Demote to Functional only if economic-policy content is evidenced. |
| Engineering :: Chemical Engineering | D110 Chemical, Rubber — Direct | Wrong tier | Chemical engineering is process/system engineering. The D110 definition is plant operation in chemical/rubber processing. The degree may be Functional to process industries, but the current Direct tier must not imply direct operator training. |

## Confirmed bad Adjacent links

The Adjacent tier is currently being used as a loose escape hatch. The following links do not have a defensible named bridge in the CCMAS curriculum:

| Programme | Current link | Why it fails |
|---|---|---|
| Arts :: Archaeology | D053 Hospitality | Archaeology, field archaeology, museum archaeology, and cultural heritage do not provide hospitality operations training. |
| Arts :: Chinese Studies | D053 Hospitality | Language, translation, Chinese culture/history, and research do not establish hospitality operations. |
| Arts :: Christian Theology | D153 Music Production | Christian Music is not sound recording, mixing, editing, mastering, or music-production technology. |
| Arts :: Linguistics | D068 Allied Health | Language pathology is not enough to establish allied-health clinical training. A speech/language pathway would require explicit clinical speech-language curriculum. |
| Sciences :: Science Laboratory Technology | D104 Pottery, Ceramics, Glass | Glass-blowing technology is one practical course; the programme is laboratory science and instrumentation, not ceramics/glass craft training. |
| Arts :: English Language and Literature | D168 Esports & Creator Economy | English/media/creative writing does not by itself establish esports operations, audience monetisation, gaming, or creator production. |
| Arts :: Classics | D030 Marketing, D130 Recruitment, D149 Diplomacy, D063 Economics, D073 Library/Archive | The curriculum is Greek/Roman language, history, civilisation, and research. Generic communication/research does not create these domain-specific bridges. |
| Arts :: Theatre Arts | D044 Graphic Design | Theatre design and production overlap with visual work, but the curriculum shown does not establish graphic-design tools, visual communication, or a graphic-design portfolio. |

## Functional false-positive clusters

These are not all individually marked “confirmed wrong” without a programme-by-programme evidence note, but the cluster behaviour is demonstrably unsafe and must be re-audited before release:

- **D057 Digital Health:** Pharmacology, Physiotherapy, Audiology, Complementary and Alternative Medicine, Dental Therapy, Medical Laboratory Science, Human Nutrition, and Prosthetics/Orthotics are being linked without a health-records, clinical-coding, medical-informatics, database, or health-information-systems curriculum. Health-related does not mean digital health.
- **D016 Electrical and D017 Mechanical:** architecture, food, materials, chemical, petroleum, physics, and other engineering programmes are receiving links through generic engineering/electricity/mechanics tokens. The audit must require actual electrical circuits/power/electronics or mechanical design/CAD/machine-system evidence.
- **D045 Public Administration:** accounting, law, criminology, economics, political science, petroleum economics, sociology, and communication programmes are being linked because of generic public/policy/government language. A public-sector context is not the same as public administration.
- **D030 Marketing, Brand:** film, languages, sociology, political science, and other programmes receive links from isolated marketing/communication terms without market research, campaigns, brand, customer, sales-channel, or advertising curriculum.
- **D037 Legal Practice:** procurement, healthcare administration, estate management, political science, sociology, social work, and other programmes are linked because they contain law, policy, courts, or ethics. A law module is not legal practice.
- **D125 Medical Secretarial:** Nursing and healthcare administration are linked through records/informatics terms, but the target domain requires appointment booking, reception, transcription, clinic records, and medical office administration.
- **D145 Neuroscience, Cognitive Science:** many allied-health and life-science programmes are linked without neuroscience, cognition, psychology, or brain/behaviour research as a substantive curriculum component.
- **D166 Autonomous Vehicles:** Statistics is linked functionally without automotive, embedded systems, vehicle controls, sensors, or machine-learning-for-vehicles curriculum. Remove.
- **D066 Veterinary Science:** Microbiology is linked functionally without animal health, veterinary diagnostics, animal welfare, or veterinary practice. Remove unless a programme has an explicit animal/veterinary track.
- **D009 Data Science:** Entrepreneurship is linked despite no substantive statistics, data engineering, modelling, or scientific data curriculum. Remove.
- **D140 Robotics:** Computer Science, ICT, IT, and Industrial Physics may be bridge candidates, but Functional is too strong without robotics, controls, embedded systems, mechatronics, automation, or robot software evidence. Review each separately.
- **D158 Corporate Finance and D159 Credit Analysis:** the domains are receiving broad links from hospitality, HR, logistics, marketing, public administration, and entrepreneurship. A finance course or budget responsibility is not enough; require financial statements, corporate finance, lending, credit risk, securities, or investment analysis evidence.

## Business Administration decision

The current Business Administration row is a clear example of the faulty logic. It has 24 links, but no Adjacent link and no direct link to the domain that most closely describes its core.

### Recommended disposition

| Domain | Current | Audit recommendation | Evidence |
|---|---|---|---|
| D028 General Management | Missing as Direct | Add Direct | Principles of Management, Principles of Business Administration I/II, Management Theory, Leadership and Governance, Human Resources Management, Financial Management, Production and Operations, strategy, and organisational decision-making are central. |
| D032 Project Management | Functional | Retain Functional | Principles of Project Management, project/strategy content, and planning/coordination skills are substantive but not the whole degree. |
| D030 Marketing, Brand | Functional | Retain Functional if evidence copy names the actual business/marketing courses | Entrepreneurship, business, e-commerce, and market/value-proposition content support a business-use pathway, but marketing is not the whole degree. |
| D029 Human Resources | Functional | Retain Functional | Human Resources Management and Human Behaviour in Organisations are explicit courses. |
| D031 Sales | Functional | Retain Functional with evidence review | Business, entrepreneurship, e-commerce, and customer/value-proposition content support commercial work, but the programme is not sales training. |
| D038 Compliance, Regulation | Functional | Retain only with narrowed explanation | Leadership/governance, business law/ethics, procurement/policy, and organisational controls can support compliance work; do not imply legal/regulatory qualification. |
| D063 Economics | Functional | Review/retain cautiously | Business statistics, finance, and market/business decision analysis support economic reasoning, but this is not an economics degree. |
| D158 Corporate Finance, Investment Banking | Functional | Review/retain cautiously | Financial management, financing, financial statements, investments, ratios, capital budgeting, and financial risk are real anchors, but specialist investment-banking training is absent. |
| D159 Credit Analysis, Structured Finance | Functional | Review/retain cautiously | Financial statements, ratios, lending/risk and financial management provide a bridge, but credit analysis is not the programme’s core. |
| D033 Product Management | Functional | Demote to Adjacent | Innovation, venture creation, e-commerce, business models, value propositions, and strategic management create a genuine bridge. The curriculum does not show product discovery, requirements, prioritisation, roadmap/backlog, product analytics, or technical product delivery as a core. |
| D012 FinTech Engineering | Functional | Remove or demote to Adjacent only if product wants a bridge | Introduction to Computing, MIS, e-commerce, and business finance do not establish backend engineering, data engineering, software testing, or financial-systems development. |
| D045 Public Administration | Direct | Demote to Functional or remove | Governance/public-sector management is a possible application, not the core identity. |
| D081 Office Administration, Secretarial | Direct | Remove | Business administration is not clerical/secretarial training. |
| D014 Actuarial Science | Functional | Review; do not call it Adjacent without actuarial evidence | Statistics and quantitative analysis support risk work, but the curriculum lacks actuarial mathematics, insurance pricing, claims, and actuarial professional practice. |

The strongest genuine Adjacent mapping for Business Administration is therefore **D033 Product Management**, not because of the word “management,” but because the CCMAS curriculum contains innovation, venture creation, e-commerce, value propositions, business models, and strategic/product-adjacent work while lacking product-specific practice.

## What should be fixed in the mapping method

1. Stop using generic token overlap as sufficient evidence.
2. Store evidence anchors per link: CCMAS course/learning-outcome IDs, domain foundation-skill IDs, and the missing specialist capabilities.
3. Make domain identity stronger than generic transferability. “Management,” “research,” “statistics,” “communication,” and “computer” should not create a link without a domain-specific anchor.
4. Treat technician/trade domains separately from university-profession domains. A degree may be a bridge to installation, servicing, driving, or craft work, but it is not Direct merely because the degree includes introductory technical material.
5. Cap the number of links per programme only after evidence filtering. A numerical cap alone does not correct wrong links.
6. Preserve the CCMAS → domain evidence before implementing JAMB-name inheritance. JAMB names must inherit the audited curriculum slice, not copy an unverified broad programme fan-out.

## Implementation record

The approved recommendation set has now been applied to `programme_domain_final.json` using `_apply_programme_domain_recommendations.py`:

- 24 unsupported links removed.
- 16 tier corrections applied.
- Corrected links carry `audit_ref: programme_domain_mapping_audit_2026-08-17` and `evidence_status: curriculum_reviewed`.
- The first approved pass reduced the mapping to 236 programme records and 2,504 links: 322 Direct, 2,048 Functional, and 134 Adjacent.
- A subsequent high-confidence sweep applied a further 8 removals and 90 tier corrections; the current mapping has 236 programme records and 2,496 links: 226 Direct, 2,136 Functional, and 134 Adjacent.

The mapping is now the authoritative current mapping for the next audit stage. It has not yet been reseeded into SQL; subgroup and JAMB inheritance review must happen before reseeding.
