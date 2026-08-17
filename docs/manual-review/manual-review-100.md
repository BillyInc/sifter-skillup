# 100-case manual review pack: student, undergraduate and school-owner flows

Generated from the current repository data on 2026-08-17. This is a manual
verification pack, not proof that the live database is seeded correctly.
Review every case in the running platform and record pass/fail against the
exact IDs, source text and expected behavior below.

## Coverage

| Flow | Cases | What it exercises |
|---|---:|---|
| SS1 student | 15 | O-level discovery, stream context, programme and university detail |
| SS2 student | 15 | O-level/combined guidance, programme choice and report path |
| SS3 student | 15 | O-level + UTME gating before JAMB decisions |
| JAMB candidate | 20 | UTME/combined subject search, programme and university selection |
| Undergraduate | 15 | University-first course list and programme overview |
| Secondary-school owner | 20 | Manual student creation, guided admission path and print/share gate |

## Current source counts used

- `jamb_registry_rows`: **420**
- `school_registry_rows`: **778**
- `school_offering_seed_rows`: **7889**
- `unique_school_offering_pairs`: **7888**
- `requirement_rows`: **420**
- `records_eligible_for_cases`: **416**

## Review rules

- A requirement row marked `needs_review` or `unparsed` must not be presented as a definitive eligibility decision.
- A university address is expected only when the live institution row returns one. The current seed registry does not populate address fields.
- The programme identity is the JAMB name. Do not accept a CCMAS discipline label in the student-facing card or report.
- Domain links are the current JAMB mapping. The selected subgroup and role are resolved from the current domain structure and role registry; verify the branch manually.
- A school-owner account creation is not consent. Verify the claim, consent, guidance-save and report-print gates separately.
- 100 cases are a useful stratified pilot, but they are not full certification of 420 JAMB names, 3,342 JAMB-domain links or every university offering.

## MR-001 — ss1 · olevel-gap

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** Mathematics, Economics, Principles of Accounts, Commerce, English Language
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Accountancy and Forensic Studies` (`575f02e4-7559-5afd-a4af-94d9d9e8489f`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — development of technical skills at the expense of generic employability skills as revealed by various curriculum for accounting programmes in the past, the shift from the Traditional 'Desk' to 'Field' and 'Cloud' Accounting will equip graduates from this programme ready for contemporary financial reporting in the public and private sectors of the global economy, a good understanding of basic accounting and strong analytical skills at the end of this programme will prepare the graduates for the Taxation and Auditing jobs currently needing a huge number as on daily advertisements; and
- **UTME requirement text:** Mathematics, Economics plus any Social Science subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics plus any Social Science subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties.
- **Selected university:** `BCU` / `BCU` (`77905473-a408-5270-81d5-1c4148c13af3`)
- **Offering row:** `ffc122f0-5d41-50f7-889f-c6e23342c1dc`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Accounting (`direct`) → Professional Accounting & Audit → financial auditor
- **All current programme-domain links:** Accounting [direct]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Tax Advisory, Transfer Pricing [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `575f02e4-7559-5afd-a4af-94d9d9e8489f`; school `77905473-a408-5270-81d5-1c4148c13af3`; offering `ffc122f0-5d41-50f7-889f-c6e23342c1dc`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-002 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Geography, Biology, Chemistry, Physics, Agricultural Science
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Agriculture` (`234fbf45-219c-5a51-9ecd-3a80e12083b5`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agriculture, and one of Physics or Mathematics
- **O-level requirement text:** Five (5) SSC credit passes to include English Language, Biology/Agricultural Science, Chemistry and any one of Mathematics, Physics, Geography and Economics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology/Agriculture; and one of Physics or Mathematics; olevel: Five (5) SSC credit passes to include English Language, Biology/Agricultural Science, Chemistry and any one of Mathematics, Physics, Geography and Economics.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `c8ffcd01-06f9-588d-be03-27173785fa8f`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural Science (`direct`) → Aquaculture & Forestry Managers → aquaculture harvesting manager
- **All current programme-domain links:** Agricultural Science [direct]; Agricultural [functional]; Crop Production, Horticulture [functional]; Economics [functional]; Marketing, Brand [functional]; Sales [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `234fbf45-219c-5a51-9ecd-3a80e12083b5`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `c8ffcd01-06f9-588d-be03-27173785fa8f`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-003 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `African and Asian Studies` (`80529400-0086-585e-b368-43ba38bac921`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — relate history as a scholarly discipline or profession and its open-ended process of interpretation, identify the different past sources (primary, secondary, literature, visual media, etc.); and, explain basic communication skills in the discipline, including proper citations and academic code of conduct. New Arts 323; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** OF ARTS (Hons.)] International Relations 53. German/Russian 54. 55. Environmental 56. 57. 58. 59. Archaeology 60. Studies 61. 62. Studies 63. Studies 64. Studies 65. 66.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `UNIZIK` / `UNIZIK` (`3a9f0243-a4ff-53cc-aa6f-bc01c43451d7`)
- **Offering row:** `a34e93e4-6923-5bd6-b9e5-2c5b3426928e`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Economics (`functional`) → Teaching professionals → business economics researcher
- **All current programme-domain links:** Economics [functional]; Higher Education [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `80529400-0086-585e-b368-43ba38bac921`; school `3a9f0243-a4ff-53cc-aa6f-bc01c43451d7`; offering `a34e93e4-6923-5bd6-b9e5-2c5b3426928e`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-004 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Chemistry
- **O-level subjects to enter:** English Language, Mathematics, Economics, Principles of Accounts, Commerce
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Business Education` (`24855e23-ce1c-56ee-9e46-ca07bc5b1805`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — state the important roles of teaching as a profession, raise and judge some ethical issues in education, list the intellectual and practical competencies required by the teacher; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Economics, and one (1) of Literature in English, History, Government, Geography, Chemistry and Physics
- **O-level requirement text:** Five (5) TC II merit, 'O' Level or NTC/NBC credit passes including English Language, Mathematics, Economics and two (2) other subjects in the Social Sciences or Arts. For NBC, the other subjects could be from any of the following: Commerce, Office Practice, Principles of Accounts, Secretarial Duties, Typewriting and Shorthand.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Mathematics; Economics; and one (1) of Literature in English, History, Government, Geography, Chemistry and Physics
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `343f8467-08ad-574e-907c-4a8660014a5b`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`direct`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [direct]; Accounting [functional]; Banking, Credit [functional]; Economics [functional]; General Management [functional]; Human Resources [functional]; Insurance [functional]; Marketing, Brand [functional]; Office Administration, Secretarial [functional]; Payroll, Bookkeeping [functional]; Vocational [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `24855e23-ce1c-56ee-9e46-ca07bc5b1805`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `343f8467-08ad-574e-907c-4a8660014a5b`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-005 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Chemistry, Physics, Agricultural Science
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Agricultural Engineering` (`0fab666b-d137-59ae-9601-7247e63645c6`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Chemistry, Physics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any from Introduction to Agricultural Science, Materials and Workshop Process and Machining, and related technical subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Chemistry; Physics; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any from Introduction to Agricultural Science, Materials and Workshop Process and Machining, and related technical subjects.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `b5dc8d16-395e-5521-af01-f809f4d7e736`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural (`functional`) → Production and specialised services managers → land-based machinery technician
- **All current programme-domain links:** Agricultural [functional]; Agricultural Science [functional]; Environmental Engineering [functional]; Industrial Automation [functional]; Renewable Energy Engineering [functional]; Robotics Engineering, Systems Design [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `0fab666b-d137-59ae-9601-7247e63645c6`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `b5dc8d16-395e-5521-af01-f809f4d7e736`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-006 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Literature in English, Civic Education, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Civil Law` (`fabf6801-11dc-5f0f-ae97-f6380e89c6af`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — discuss the aim of studying psychology, discuss and critically evaluate the schools of Psychology, discuss the historical antecedents to modern Psychology; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Any three (3) Arts or Social Science subjects.
- **O-level requirement text:** Five (5)'O' Level credit passes to include English Language, Literature in English and Mathematics.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Any three (3) Arts or Social Science subjects.
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `dd87eeac-3e62-5b50-be7e-edb50ec79ddf`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `fabf6801-11dc-5f0f-ae97-f6380e89c6af`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `dd87eeac-3e62-5b50-be7e-edb50ec79ddf`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-007 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Chemistry, Physics
- **O-level subjects to enter:** English Language, Mathematics, Biology, Chemistry, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Anatomy` (`490fc48c-943a-5139-bea6-88d84a992129`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — define fundamental anatomical terminology and discuss the anatomical position, describe the anatomy of the musculoskeletal system, including the axial skeleton appendicular skeleton, appendicular and axial muscles, and arthrology, describe the general features of the bones of the upper and lower limbs; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Biology, Chemistry, Physics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Biology, Chemistry and Physics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Biology; Chemistry; Physics; olevel: Five (5) SSC credit passes in English Language, Mathematics, Biology, Chemistry and Physics.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `07ec4b1d-d2af-5514-9028-8c2c47f7e3be`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Biomedical (`direct`) → Computational & Life Science Research → pharmacologist
- **All current programme-domain links:** Biomedical [direct]; Bioinformatics, Computational Biology [functional]; Biomedical Engineering [functional]; Forensic Science, Digital Forensics [functional]; Medical Laboratory Technology [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `490fc48c-943a-5139-bea6-88d84a992129`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `07ec4b1d-d2af-5514-9028-8c2c47f7e3be`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-008 — ss1 · olevel-gap

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Mathematics, English Language, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `ANTHROPOLOGY` (`2a08cc49-a673-563a-8f5e-9da4fde91643`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — connect between the two revolutions of the 18th century, discuss the founding fathers and the emergence of sociology as a discipline, relate the basic analysis and description of social structure and dynamics of human society; transferable — ability to demonstrate adequate knowledge and understanding of the essentials in all the subject knowledge / areas identified, ability to apply such knowledge and understanding to the solution of social problems, ability to recognise and analyse new problems and plan strategies for their solutions
- **UTME requirement text:** Biology and two (2) Science subjects
- **O-level requirement text:** Five (5)/six (6) SSCE credit passes at one (1) or two (2) sittings to include Mathematics, English Language and any other Science subjects.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Biology and two (2) Science subjects
- **Selected university:** `IBADAN` / `IBADAN` (`e1c071b0-e046-51f0-9de7-77ac53886688`)
- **Offering row:** `90533478-2577-58b3-b926-e09c15f0f75a`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Social Sciences (`direct`) → no subgroup → criminologist
- **All current programme-domain links:** Social Sciences [direct]; Criminology, Criminal Justice [functional]; Data Science [functional]; Economics [functional]; Legal Practice [functional]; Library, Archive [functional]; Psychology, Counselling [functional]; Public Administration [functional]; Social Work [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `2a08cc49-a673-563a-8f5e-9da4fde91643`; school `e1c071b0-e046-51f0-9de7-77ac53886688`; offering `90533478-2577-58b3-b926-e09c15f0f75a`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-009 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Criminology` (`ffe0164e-e7be-5fb8-b356-397e0e0ab946`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — discuss the culture, value and norms as foundation of society and social order, describe the problem posed to social order by deviance, crime and conflict, identify traditional and informal mechanisms for preventing, controlling and resolving deviance and conflict; transferable — Specialist career in government's law enforcement, security and criminal justice agencies, Employment in corporate security agencies and departments, Establish and operate security services like consultancy, guard and security companies, marketing of security products
- **UTME requirement text:** SALEM for Criminology requires Government and any two (2) of Economics, Geography and Literature in English.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `BAYERO` / `BAYERO` (`a868159d-9676-5217-8e97-e9986cdcad57`)
- **Offering row:** `8555a247-b87e-5244-a22f-d920a0a3f741`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Criminology, Criminal Justice (`direct`) → Chief executives, senior officials and legislators → police commissioner
- **All current programme-domain links:** Criminology, Criminal Justice [direct]; Security Services [direct]; Economics [functional]; General Management [functional]; Legal Practice [functional]; Public Administration [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ffe0164e-e7be-5fb8-b356-397e0e0ab946`; school `a868159d-9676-5217-8e97-e9986cdcad57`; offering `8555a247-b87e-5244-a22f-d920a0a3f741`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-010 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Economics, Principles of Accounts, Commerce
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Accounting and Data Analytics` (`2831bdda-80f0-50f8-9073-3aa6d255707e`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — development of technical skills at the expense of generic employability skills as revealed by various curriculum for accounting programmes in the past, the shift from the Traditional 'Desk' to 'Field' and 'Cloud' Accounting will equip graduates from this programme ready for contemporary financial reporting in the public and private sectors of the global economy, a good understanding of basic accounting and strong analytical skills at the end of this programme will prepare the graduates for the Taxation and Auditing jobs currently needing a huge number as on daily advertisements; and
- **UTME requirement text:** Mathematics, Economics plus any Social Science subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics plus any Social Science subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties.
- **Selected university:** `WIGWE` / `WIGWE` (`c31491d5-607f-5042-ab1c-2f77be7639fd`)
- **Offering row:** `f1dcfa84-d1cc-5084-b35c-28b66f44440b`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Accounting (`direct`) → Professional Accounting & Audit → financial auditor
- **All current programme-domain links:** Accounting [direct]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Economics [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Public Administration [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `2831bdda-80f0-50f8-9073-3aa6d255707e`; school `c31491d5-607f-5042-ab1c-2f77be7639fd`; offering `f1dcfa84-d1cc-5084-b35c-28b66f44440b`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-011 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Geography, Biology, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Agronomy` (`4e00a01c-bd61-5516-b382-8b88f2f68d83`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology or Agriculture, Physics or Mathematics, Use of English
- **O-level requirement text:** Five (5) SSC credit passes in Chemistry, English Language, Mathematics, Biology and Geography or Economics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology or Agriculture; Physics or Mathematics; Use of English; olevel: Five (5) SSC credit passes in Chemistry, English Language, Mathematics, Biology and Geography or Economics.
- **Selected university:** `ADSU` / `ADSU` (`359901ac-970d-5d91-9eb3-dac88ae51d49`)
- **Offering row:** `56040a07-a959-52fd-a2db-9b5d45f0ec41`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Crop Production, Horticulture (`direct`) → no subgroup → horticulture worker
- **All current programme-domain links:** Crop Production, Horticulture [direct]; Agricultural [functional]; Agricultural Science [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `4e00a01c-bd61-5516-b382-8b88f2f68d83`; school `359901ac-970d-5d91-9eb3-dac88ae51d49`; offering `56040a07-a959-52fd-a2db-9b5d45f0ec41`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-012 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Arabic Language and Literature Studies` (`64662062-1a2e-5ed1-ac36-8910ee050087`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — explain types of Arabic sentences and word order therein, distinguish various types of Arabic tenses, analyse types of Mansbt and Marfct; and; transferable — explain the concepts and theories of entrepreneurship, intrapreneurship, opportunity seeking, new value creation, and risk taking, state the characteristics of an entrepreneur, analyze the importance of micro and small businesses in wealth creation, employment, and financial independence
- **UTME requirement text:** Arabic and two (2) subjects from Arts and/or Social Sciences (same as in Arabic Studies)
- **O-level requirement text:** Same as in Arabic Studies (Five (5) SSC credit passes in English Language, Arabic and three (3) other relevant subjects).
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `CAILS` / `CAILS` (`2950873a-3048-5c56-b6dd-203b9156e846`)
- **Offering row:** `3b2bbe8c-1f0e-548b-b698-16c0be05dd86`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Translation, Interpretation (`direct`) → Production and specialised services managers → translator
- **All current programme-domain links:** Translation, Interpretation [direct]; Higher Education [functional]; Journalism [functional]; Recruitment, Employment [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `64662062-1a2e-5ed1-ac36-8910ee050087`; school `2950873a-3048-5c56-b6dd-203b9156e846`; offering `3b2bbe8c-1f0e-548b-b698-16c0be05dd86`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-013 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Education and Business Administration` (`a432c381-4573-5b39-8476-37cf484a486e`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — state the important roles of teaching as a profession, raise and judge some ethical issues in education, list the intellectual and practical competencies required by the teacher; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Mathematics, and any two (2) of Economics, Government, History, Literature in English
- **O-level requirement text:** Five (5) 'O' Level or NTC/NBC credit passes in English Language and Mathematics plus three (3) other subjects.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Mathematics; and any two (2) of Economics, Government, History, Literature in English
- **Selected university:** `EDUCATION AND SOCIOLOGY` / `EDUCATION AND SOCIOLOGY` (`fcf7e6fa-b578-503b-ac46-485c3d84879a`)
- **Offering row:** `f5af9ed9-531b-5f26-a37d-f65523f0b7c4`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`direct`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [direct]; Economics [functional]; General Management [functional]; Insurance [functional]; Vocational [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `a432c381-4573-5b39-8476-37cf484a486e`; school `fcf7e6fa-b578-503b-ac46-485c3d84879a`; offering `f5af9ed9-531b-5f26-a37d-f65523f0b7c4`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-014 — ss1 · valid

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Biology, Chemistry, Physics, Agricultural Science
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Agricultural and Bio-Resources Engineering` (`475e670a-108e-574b-bd2b-e5732bc30235`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Chemistry, Physics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology or one of Agricultural Science, Further Mathematics and Technical Drawing at credit level.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Chemistry; Physics; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology or one of Agricultural Science, Further Mathematics and Technical Drawing at credit level.
- **Selected university:** `MINNA` / `MINNA` (`bbb4456a-842d-5c68-b8df-52431f4f22b8`)
- **Offering row:** `f839df3a-8d9c-50fc-9967-13cd6ca77fda`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural (`functional`) → Production and specialised services managers → land-based machinery technician
- **All current programme-domain links:** Agricultural [functional]; Agricultural Science [functional]; Environmental Engineering [functional]; Industrial Automation [functional]; Renewable Energy Engineering [functional]; Robotics Engineering, Systems Design [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `475e670a-108e-574b-bd2b-e5732bc30235`; school `bbb4456a-842d-5c68-b8df-52431f4f22b8`; offering `f839df3a-8d9c-50fc-9967-13cd6ca77fda`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-015 — ss1 · olevel-gap

- **Student context:** `SS1` / `Science`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Common Law` (`35f1a5c5-9e87-5211-85cc-73bed5f1ccb0`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — discuss the aim of studying psychology, discuss and critically evaluate the schools of Psychology, discuss the historical antecedents to modern Psychology; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Literature in English and any two (2) other Arts/or Social Science subjects.
- **O-level requirement text:** Five (5)SSC credit passes to include English Language, Literature - in - English and any other three (3) Arts/Social Science subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Literature in English and any two (2) other Arts/or Social Science subjects.; olevel: Five (5)SSC credit passes to include English Language, Literature - in - English and any other three (3) Arts/Social Science subjects.
- **Selected university:** `ILORIN` / `ILORIN` (`be4981eb-2b54-5ea1-941d-44e8ca2774db`)
- **Offering row:** `d6b298b4-203d-58e9-8aee-ae8b568bfcaf`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Criminology, Criminal Justice [functional]; Intellectual Property Law, Patents [functional]; Public Administration [functional]; Translation, Interpretation [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `35f1a5c5-9e87-5211-85cc-73bed5f1ccb0`; school `be4981eb-2b54-5ea1-941d-44e8ca2774db`; offering `d6b298b4-203d-58e9-8aee-ae8b568bfcaf`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-016 — ss2 · olevel-gap

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** Mathematics, Economics, English Language, Civic Education, Physics
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Criminology and Penology` (`6434f9f4-0658-5b87-91c7-f5eccbf02cc8`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — discuss the culture, value and norms as foundation of society and social order, describe the problem posed to social order by deviance, crime and conflict, identify traditional and informal mechanisms for preventing, controlling and resolving deviance and conflict; transferable — Specialist career in government's law enforcement, security and criminal justice agencies, Employment in corporate security agencies and departments, Establish and operate security services like consultancy, guard and security companies, marketing of security products
- **UTME requirement text:** Economics, Mathematics and any of Government, History, Geography, Literature in English, French and Christian Religious Studies/Islamic Studies.
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Economics and any two (2) of Arts or Social Science subjects.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `RSU` / `RSU` (`0a012370-5686-58d1-8d4e-296446853862`)
- **Offering row:** `db3a8fb1-5861-543f-8fc4-7c1a39b220d3`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Criminology, Criminal Justice (`direct`) → Chief executives, senior officials and legislators → police commissioner
- **All current programme-domain links:** Criminology, Criminal Justice [direct]; Security Services [direct]; Economics [functional]; General Management [functional]; Legal Practice [functional]; Public Administration [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `6434f9f4-0658-5b87-91c7-f5eccbf02cc8`; school `0a012370-5686-58d1-8d4e-296446853862`; offering `db3a8fb1-5861-543f-8fc4-7c1a39b220d3`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-017 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Principles of Accounts, Commerce
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Accounting and Finance` (`7dc419ab-b6e8-5407-9b63-917f1bc25c7e`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — graduates under this curriculum are equipped with complex problem-solving skills, quick on-the-job learning and comfort with technology in the job market, the cross-boarder mobility will provide opportunity for graduate under this programme in this era of internalisation of financial services globally; and, the people and companies interface skills now transact in two dimensions; online and physical, our graduates will develop skill sets that enable a seamless transition into transacting in both realms making ready for the finance job market
- **UTME requirement text:** Mathematics, Economics plus any Social Science subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics plus any Social Science subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics and any other two (2) subjects. For NBC holders, the other two (2) relevant subjects could be from any of Principles of Accounts, Commerce, Office Practice and Secretarial Duties.
- **Selected university:** `UYO` / `UYO` (`76561787-b77a-53e2-a65c-22d345d89260`)
- **Offering row:** `70611401-66be-50e1-b7bc-2df2a6aef3a6`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Banking, Credit (`direct`) → Bank & Fund Directors → credit union manager
- **All current programme-domain links:** Banking, Credit [direct]; Corporate Finance, Investment Banking [direct]; Credit Analysis, Structured Finance [direct]; Investment Analysis [direct]; Accounting [functional]; Economics [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Marketing, Brand [functional]; Quantitative Finance [functional]; Real Estate [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `7dc419ab-b6e8-5407-9b63-917f1bc25c7e`; school `76561787-b77a-53e2-a65c-22d345d89260`; offering `70611401-66be-50e1-b7bc-2df2a6aef3a6`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-018 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Animal Breeding and Genetics` (`eeb9c83c-7b48-5ee5-99cd-c305da2bf851`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** UTMESUBJECTS SPECIAL Health. English other Chemistry, DIRECTENTRY Biology/Agricultur OAU and OAU Mathematics /Physics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AND GENETICS` / `AND GENETICS` (`2def4971-4738-59bd-9c31-449ee5f8cacf`)
- **Offering row:** `ed544272-6587-5d9c-8ddf-5468df662913`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Livestock, Poultry, Dairy (`direct`) → Production and specialised services managers → bee breeder
- **All current programme-domain links:** Livestock, Poultry, Dairy [direct]; Agricultural Science [functional]; Animal Care, Grooming [functional]; Biomedical [functional]; Economics [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `eeb9c83c-7b48-5ee5-99cd-c305da2bf851`; school `2def4971-4738-59bd-9c31-449ee5f8cacf`; offering `ed544272-6587-5d9c-8ddf-5468df662913`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-019 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Arabic, Fine Art, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Arabic Studies` (`ada49ee2-b09b-514c-95b8-1b0abc52100f`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — explain types of Arabic sentences and word order therein, distinguish various types of Arabic tenses, analyse types of Mansbt and Marfct; and; transferable — explain the concepts and theories of entrepreneurship, intrapreneurship, opportunity seeking, new value creation, and risk taking, state the characteristics of an entrepreneur, analyze the importance of micro and small businesses in wealth creation, employment, and financial independence
- **UTME requirement text:** Arabic and two (2) subjects from Arts and/or Social Sciences
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Arabic and three (3) other relevant subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Arabic and two (2) subjects from Arts and/or Social Sciences; olevel: Five (5) SSC credit passes in English Language, Arabic and three (3) other relevant subjects.
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `5d88c303-a7cd-578f-849f-02dfc0041599`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Translation, Interpretation (`direct`) → Production and specialised services managers → translator
- **All current programme-domain links:** Translation, Interpretation [direct]; Higher Education [functional]; Journalism [functional]; Recruitment, Employment [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ada49ee2-b09b-514c-95b8-1b0abc52100f`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `5d88c303-a7cd-578f-849f-02dfc0041599`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-020 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Biology, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Home Economics and Hotel Management` (`3c95dfd2-0e7a-5429-9c2b-7ee392b980f2`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — list the concepts, philosophy and objectives of Home Economics, state the role of Home Economics in national development, identify the roles of Home Economics teachers and the teacher- student relationship; and; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology or Agricultural Science, and one (1) other subject
- **O-level requirement text:** Five (5) 'O' Level NTC/NBC credit passes or TC II merit including English Language, Mathematics, Home Economics, Biology and Chemistry.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Chemistry; Biology or Agricultural Science; and one (1) other subject
- **Selected university:** `EDUCATION` / `EDUCATION` (`160fe973-6fd1-590c-bd9d-2c44750b493a`)
- **Offering row:** `bd51c9d8-4b3f-528c-9e00-d619f7edb0d6`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Fashion, Textiles (`functional`) → Hospitality, retail and other services managers → textile shop manager
- **All current programme-domain links:** Fashion, Textiles [functional]; Higher Education [functional]; Psychology, Counselling [functional]; Vocational [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `3c95dfd2-0e7a-5429-9c2b-7ee392b980f2`; school `160fe973-6fd1-590c-bd9d-2c44750b493a`; offering `bd51c9d8-4b3f-528c-9e00-d619f7edb0d6`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-021 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Geography, Biology, Chemistry, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Architecture` (`3e390e0b-2452-52e3-90d3-9be42da6b6fc`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — define and explain what architecture is, where it started from and who is an architect, discuss the nature of architecture as a discipline, a profession and a practice, distinguish between the terms; profession, discipline and practice; transferable — Unavailable
- **UTME requirement text:** Physics, Mathematics, and one of Chemistry, Geography, Art, Biology, Economics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any of Fine Art, Geography or Wood Work, Biology, Economics, Technical Drawing, Further Mathematics, Introduction to Building Construction, Bricklaying/Block laying, Concreting, Wall Floors and Ceiling Finishing, Joinery, Carpentry, Decorative Painting, Lining, Sign and Design, Wall Hanging, Colour Mixing/Matching and Glazing, Ceramics, Graphics Design, Graphic Printing, Basic Electricity
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Physics; Mathematics; and one of Chemistry, Geography, Art, Biology, Economics
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `5c5c6edb-e239-55de-93ad-baac963ca8b3`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Architecture (`direct`) → no subgroup → civil engineering technician
- **All current programme-domain links:** Architecture [direct]; Building Services Engineering — Mechanical, Electrical [functional]; Carpentry, Joinery, Wood Technology [functional]; Civil [functional]; Construction Management [functional]; Electrical Installation, Wiring [functional]; Interior Design [functional]; Masonry, Bricklaying, Tiling, Plastering [functional]; Mechanical [functional]; Real Estate [functional]; Urban Mobility, Smart City Systems [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `3e390e0b-2452-52e3-90d3-9be42da6b6fc`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `5c5c6edb-e239-55de-93ad-baac963ca8b3`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-022 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Common and Islamic Law` (`288e06d8-b8e8-5ca0-8398-85a2b54b0183`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — appreciate the various legal rules, methods, processes and reasoning, acquire basic knowledge of the fundamental concepts of law and the various legal systems, gain knowledge of the function of law in society; and; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies
- **O-level requirement text:** Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `ABUJA` / `ABUJA` (`3160c1ef-48e4-50a9-bc6b-358612396197`)
- **Offering row:** `4c235a6b-43a3-5443-90e7-f3208c0f513d`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Compliance, Regulation [functional]; Criminology, Criminal Justice [functional]; Diplomacy, International Relations [functional]; Immigration Law, Asylum [functional]; Intellectual Property Law, Patents [functional]; Religious Ministry, Theology [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `288e06d8-b8e8-5ca0-8398-85a2b54b0183`; school `3160c1ef-48e4-50a9-bc6b-358612396197`; offering `4c235a6b-43a3-5443-90e7-f3208c0f513d`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-023 — ss2 · olevel-gap

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Mathematics, Biology, Chemistry, Physics, English Language
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Dentistry and Dental Technology` (`92805802-fe71-598d-8940-922f3f8d8274`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — classify the basic divisions of anatomy into regional, systemic and applied anatomy, demonstrate knowledge of anatomical terms, anatomical positions, planes, relationships and comparisons, laterality and movement, identify the shape, two ends, bony markings, and relations of surfaces of the clavicle; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Physics, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Physics, Chemistry, Biology and Mathematics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Physics; Biology; olevel: Five (5) SSC credit passes in English Language, Physics, Chemistry, Biology and Mathematics.
- **Selected university:** `SURGERY` / `SURGERY` (`18584ef8-50f0-5b6a-927e-393f42e6f81c`)
- **Offering row:** `22ec9c7a-6a5e-5bd9-9662-8546479f0f07`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Dentistry (`direct`) → Health professionals → dental technician
- **All current programme-domain links:** Dentistry [direct]; Allied Health [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Biomedical Engineering [functional]; Community Health Extension [functional]; Forensic Science, Digital Forensics [functional]; Jewellery Making, Goldsmithing [functional]; Medical Laboratory Technology [functional]; Medicine [functional]; Metal Processing, Foundry [functional]; Nanotechnology, Advanced Materials [functional]; Neuroscience, Cognitive Science [functional]; Nursing [functional]; Occupational Health, Safety [functional]; Pottery, Ceramics, Glass [functional]; Precision Engineering, Toolmaking [functional]; Public Health [functional]; Radiography, Medical Imaging [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `92805802-fe71-598d-8940-922f3f8d8274`; school `18584ef8-50f0-5b6a-927e-393f42e6f81c`; offering `22ec9c7a-6a5e-5bd9-9662-8546479f0f07`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-024 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `APPLIED BIOLOGY AND BIOTECHNOLOGY` (`7cf4a85c-10b8-5c21-9704-6b40990c34ca`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — explain the basic concepts and scope of microbiology, describe layout of a microbiology laboratory, equipment and reagents in a microbiology laboratory; and, discuss the theory behind basic protocols in a microbiology laboratory; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biologyand eitherPhysicsor (a) Mathematics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Chemistry, Biologyand eitherPhysicsor (a) Mathematics.
- **Selected university:** `CLIFFORD` / `CLIFFORD` (`4f7c4462-fc92-5e4d-898e-e719fc70022b`)
- **Offering row:** `755005d9-5801-5e50-ae32-7e70df752b43`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural Science (`functional`) → Aquaculture & Forestry Managers → aquaculture harvesting manager
- **All current programme-domain links:** Agricultural Science [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Biomedical Engineering [functional]; Food Science [functional]; Forensic Science, Digital Forensics [functional]; Medical Laboratory Technology [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `7cf4a85c-10b8-5c21-9704-6b40990c34ca`; school `4f7c4462-fc92-5e4d-898e-e719fc70022b`; offering `755005d9-5801-5e50-ae32-7e70df752b43`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-025 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Economics, Government, Geography, Commerce, History
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Criminology and Security Studies` (`2f24e362-4a88-5921-853a-d32c60d08aae`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — discuss the culture, value and norms as foundation of society and social order, describe the problem posed to social order by deviance, crime and conflict, identify traditional and informal mechanisms for preventing, controlling and resolving deviance and conflict; transferable — Specialist career in government's law enforcement, security and criminal justice agencies, Employment in corporate security agencies and departments, Establish and operate security services like consultancy, guard and security companies, marketing of security products
- **UTME requirement text:** (xxxiii) AAUA requires Economics, Mathematics and any other Social Science subject and for Criminology and Security Studies requires three (3) Arts or Social Science subjects. (xxxiv) FED-DUTSE: For Criminology and Security Studies, FED-DUTSE requires Economics, Government/Geography, Islamic Studies/CRS/Hausa or any other Arts subject.
- **O-level requirement text:** (x) AAUA: for Criminology and Security Studies, requires five (5) `O' Level credit passes to include English Language, Government/History, Mathematics and two other subjects from Social Science/Arts. (xxiv) FED-OYE EKITI: For Criminology and Security Studies FED-OYE EKITI accepts five (5) SSC credit passes including English Language, Mathematics, Government and anyone from(Economics, Commerce, Geography and one Science or Arts subjects at SSC. (xxxviii) FED-DUTSE: For Criminology and Security Studies, FED-DUTSE accepts; five (5) `O' Level credit passes SSC or its equivalent to include English Language, Mathematics with any two (2) Social Science subjects and any one Arts subject at not more than two (2) sittings.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AAUA` / `AAUA` (`89224bf1-f265-5d8d-8994-83b751cf73e5`)
- **Offering row:** `bcda5d8e-6cb9-5094-9729-228522a2de21`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Criminology, Criminal Justice (`direct`) → Chief executives, senior officials and legislators → police commissioner
- **All current programme-domain links:** Criminology, Criminal Justice [direct]; Security Services [direct]; Compliance, Regulation [functional]; Economics [functional]; Forensic Science, Digital Forensics [functional]; General Management [functional]; Legal Practice [functional]; Public Administration [functional]; Recruitment, Employment [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `2f24e362-4a88-5921-853a-d32c60d08aae`; school `89224bf1-f265-5d8d-8994-83b751cf73e5`; offering `bcda5d8e-6cb9-5094-9729-228522a2de21`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-026 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Civic Education, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Actuarial Science` (`7cef5ba5-b16e-5ad6-a2e1-3614a6b3cc74`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — The curriculum provides students with adequate competencies, skills and behavioral attitudes required for maintenance of precision, quality and standard in a work place, Ability to assess financial risks in the insurance and financial industries as well as other sectors of the economy, using mathematical and statistical tools, Unique expertise of handling problems of risks and uncertainty, which is greatly required in a variety of industries and organizations, both private and government
- **UTME requirement text:** Mathematics, Economics and one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes to include English Language, Mathematics and Economics plus any other two (2) relevant subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics and one (1) other subject.; olevel: Five (5) SSC credit passes to include English Language, Mathematics and Economics plus any other two (2) relevant subjects.
- **Selected university:** `CRAWFORD` / `CRAWFORD` (`3d100db0-f83d-5c8c-95aa-39430c981f86`)
- **Offering row:** `889a4f68-232b-56cf-8ba6-b24bb0758c72`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Actuarial Science (`direct`) → Actuarial & Quantitative Modelling → actuarial consultant
- **All current programme-domain links:** Actuarial Science [direct]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Data Science [functional]; Economics [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Product Management [functional]; Project Management [functional]; Quantitative Finance [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `7cef5ba5-b16e-5ad6-a2e1-3614a6b3cc74`; school `3d100db0-f83d-5c8c-95aa-39430c981f86`; offering `889a4f68-232b-56cf-8ba6-b24bb0758c72`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-027 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Geography, Biology, Chemistry, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Animal Physiology` (`2c1ad6fa-5eb5-5e24-bf51-1596d87ab5c7`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agricultural Science, Mathematics/Physics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Biology/Agric Science and one of Physics, Geography or Economics (shares requirements with Animal Science umbrella block).
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology/Agricultural Science; Mathematics/Physics; olevel: Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Biology/Agric Science and one of Physics, Geography or Economics (shares requirements with Animal Science umbrella block).
- **Selected university:** `FUNAAB` / `FUNAAB` (`9462539f-d63e-59e0-84d5-82dfb6184f69`)
- **Offering row:** `d11c1330-3d6a-57ea-9fe3-85c6609b7cdd`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Livestock, Poultry, Dairy (`direct`) → Production and specialised services managers → bee breeder
- **All current programme-domain links:** Livestock, Poultry, Dairy [direct]; Agricultural Science [functional]; Animal Care, Grooming [functional]; Biomedical [functional]; Economics [functional]; Forestry, Wildlife Management [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `2c1ad6fa-5eb5-5e24-bf51-1596d87ab5c7`; school `9462539f-d63e-59e0-84d5-82dfb6184f69`; offering `d11c1330-3d6a-57ea-9fe3-85c6609b7cdd`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-028 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Economics, Geography, History, Mathematics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Archaeology` (`741a0349-529e-56fc-a0a0-476c8beb47d5`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — have knowledge of what archaeology is and its aims, explain the origins of archaeology as a discipline and its eurocentric roots. understand how archaeologists discover sites, recover and handle archaeological evidence; and, identify the different dating methods used in archaeology, the principles behind each of the methods and their limitations in archaeological interpretation; transferable — Unavailable
- **UTME requirement text:** Any two (2) subjects from Arts, Social Sciences and one of History, Religious Studies, Government and Geography
- **O-level requirement text:** Five (5) SSC credit passes to include English Language and one of the following subjects, Religious Studies, Geography, Economics and History.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `ab9f1fd7-4e75-5656-ac4e-839b9ed38db7`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Museum Curation, Cultural Heritage, Archives (`direct`) → Production and specialised services managers → art restorer
- **All current programme-domain links:** Museum Curation, Cultural Heritage, Archives [direct]; Geospatial Science [functional]; Higher Education [functional]; Journalism [functional]; Library, Archive [functional]; Scientific Research [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `741a0349-529e-56fc-a0a0-476c8beb47d5`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `ab9f1fd7-4e75-5656-ac4e-839b9ed38db7`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-029 — ss2 · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Library Science` (`d1b158d7-db2c-5a04-b5b8-a27b3cb99977`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — define the basic concepts in the course, discuss the relationship between library science and information science, explain the philosophical foundations of the course; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Any three (3) subjects
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics and three (3) other relevant Arts/Sciences/Social Sciences subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Any three (3) subjects; olevel: Five (5) SSC credit passes in English Language, Mathematics and three (3) other relevant Arts/Sciences/Social Sciences subjects.
- **Selected university:** `ABSU` / `ABSU` (`0a0013b5-4b5a-5144-a156-8d2db266ce65`)
- **Offering row:** `31e319ea-056c-560b-a4e4-c84bfe946f2a`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Library, Archive (`direct`) → Curators & Archivists → information manager
- **All current programme-domain links:** Library, Archive [direct]; Business Intelligence [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `d1b158d7-db2c-5a04-b5b8-a27b3cb99977`; school `0a0013b5-4b5a-5144-a156-8d2db266ce65`; offering `31e319ea-056c-560b-a4e4-c84bfe946f2a`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-030 — ss2 · olevel-gap

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Mathematics, Biology, Chemistry, Physics, English Language
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Biomedical Engineering` (`435815d0-d421-561f-a0d4-616cae25aff1`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Selected university:** `ABUAD` / `ABUAD` (`4beb9b46-ddaa-5a56-b936-ea60e63b57c9`)
- **Offering row:** `1ad79ff0-872b-5704-b610-d684bf0db788`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Biomedical (`direct`) → Computational & Life Science Research → pharmacologist
- **All current programme-domain links:** Biomedical [direct]; Biomedical Engineering [direct]; Bioinformatics, Computational Biology [functional]; Digital Health [functional]; Electrical [functional]; Public Health [functional]; Robotics Engineering, Systems Design [functional]; Scientific Research [functional]; Software Engineering [functional]; Medical Physics, Radiation Therapy [adjacent]; Radiography, Medical Imaging [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `435815d0-d421-561f-a0d4-616cae25aff1`; school `4beb9b46-ddaa-5a56-b936-ea60e63b57c9`; offering `1ad79ff0-872b-5704-b610-d684bf0db788`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-031 — ss3 · utme-gap

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** not a full UTME match; any fallback must be marked possible/text-based
- **JAMB programme:** `APPLIED BIOLOGY AND GENETICS` (`ccbd560b-b6fb-509d-898d-b19fdb76864f`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — distinguish between heritable and non-heritable characteristics, explain the likelihood of genetic events (Probability) and how well those events (results) fit into a set of observation, (results) fit into a set of observation; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biologyand eitherPhysicsor (a) Mathematics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Chemistry, Biologyand eitherPhysicsor (a) Mathematics.
- **Selected university:** `REDEEMERS` / `REDEEMERS` (`6fbab45b-7864-5444-8af6-ae5a830fb19a`)
- **Offering row:** `5bc73c9f-7e4f-51aa-95e6-2d64bc93c813`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural Science (`functional`) → Aquaculture & Forestry Managers → aquaculture harvesting manager
- **All current programme-domain links:** Agricultural Science [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Crop Production, Horticulture [functional]; Forestry, Wildlife Management [functional]; Livestock, Poultry, Dairy [functional]; Medical Laboratory Technology [functional]; Museum Curation, Cultural Heritage, Archives [functional]; Scientific Research [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ccbd560b-b6fb-509d-898d-b19fdb76864f`; school `6fbab45b-7864-5444-8af6-ae5a830fb19a`; offering `5bc73c9f-7e4f-51aa-95e6-2d64bc93c813`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-032 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Geography, Principles of Accounts
- **O-level subjects to enter:** English Language, Mathematics, Economics, Government, Geography, Biology
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Demography and Social Statistics` (`c7f26eb8-056b-5d5f-841d-228767ebdb4d`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — explain the main concepts of population studies and demography, describe vividly the sources of demographic data, analyse the merits and demerits of de facto and de jure methods of data collection ;and; transferable — Engage in productive, sexual and reproductive health promotion activities, Impart essential knowledge in population studies, demography, social statistics and research methods, Conduct careful, objective and systematic study of the human population at different settings
- **UTME requirement text:** Mathematics, Economics/Geography and any other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics, Government and any one of Geography or Biology
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics/Geography and any other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics, Government and any one of Geography or Biology
- **Selected university:** `COVENANT` / `COVENANT` (`3daac232-0047-5076-9211-791beaabb13b`)
- **Offering row:** `f77432a6-25c9-5153-a191-46ba08f10c6a`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Actuarial Science (`functional`) → Actuarial & Quantitative Modelling → actuarial consultant
- **All current programme-domain links:** Actuarial Science [functional]; Criminology, Criminal Justice [functional]; Data Science [functional]; Economics [functional]; Geospatial Science [functional]; Human Resources [functional]; Public Administration [functional]; Recruitment, Employment [functional]; Scientific Research [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c7f26eb8-056b-5d5f-841d-228767ebdb4d`; school `3daac232-0047-5076-9211-791beaabb13b`; offering `f77432a6-25c9-5153-a191-46ba08f10c6a`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-033 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Principles of Accounts
- **O-level subjects to enter:** English Language, Mathematics, Economics, Government, Geography, Commerce
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Agribusiness and Economics` (`4e4e5155-628e-56e5-b04e-267ca0986fff`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — identify the basic concepts in economics including scarcity, choice and scale of preference; basic laws of demand and supply, explain the nature of elasticity and its applications, as well as short and long run production functions; and, discuss pricing of factors of production and market structure consisting of perfect competitive market and imperfect competitive markets; transferable — ability to create job(s) in a variety of areas of production and services, manage a mix of human and non-human resources to achieve optimum output, ability to survive in work environment of diverse or multifaceted production mix
- **UTME requirement text:** Mathematics, Economics and one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics, plus any two (2) of Accounting, Business Methods, Commerce, Government, Geography, and Statistics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics and one (1) other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics, plus any two (2) of Accounting, Business Methods, Commerce, Government, Geography, and Statistics.
- **Selected university:** `HUSTECH` / `HUSTECH` (`4913ae25-7ae4-5cfc-a549-8bf1e09f6d97`)
- **Offering row:** `dccc82f7-6d73-5f74-9c53-df92be3abc7c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Economics (`direct`) → Teaching professionals → business economics researcher
- **All current programme-domain links:** Economics [direct]; Accounting [functional]; Actuarial Science [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Data Science [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Public Administration [functional]; Social Sciences [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `4e4e5155-628e-56e5-b04e-267ca0986fff`; school `4913ae25-7ae4-5cfc-a549-8bf1e09f6d97`; offering `dccc82f7-6d73-5f74-9c53-df92be3abc7c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-034 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Chemistry, English Language, Biology, Physics
- **O-level subjects to enter:** English Language, Mathematics, Biology, Chemistry, Physics, Agricultural Science
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Animal Production` (`c9007caf-5604-5c6e-a888-7fa30a4fb352`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agricultural Science, Physics/Mathematics, Use of English
- **O-level requirement text:** Five SSC credit passes in Chemistry, Mathematics, Biology/Agricultural Science, Physics and English Language.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology/Agricultural Science; Physics/Mathematics; Use of English; olevel: Five SSC credit passes in Chemistry, Mathematics, Biology/Agricultural Science, Physics and English Language.
- **Selected university:** `AND HEALTH` / `AND HEALTH` (`1dce9a48-5519-5770-80ef-4005a51d7c09`)
- **Offering row:** `1bfecacf-c5c5-5c45-ae3a-ecb11774b2cb`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Livestock, Poultry, Dairy (`direct`) → Production and specialised services managers → bee breeder
- **All current programme-domain links:** Livestock, Poultry, Dairy [direct]; Agricultural Science [functional]; Animal Care, Grooming [functional]; Biomedical [functional]; Economics [functional]; Forestry, Wildlife Management [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c9007caf-5604-5c6e-a888-7fa30a4fb352`; school `1dce9a48-5519-5770-80ef-4005a51d7c09`; offering `1bfecacf-c5c5-5c45-ae3a-ecb11774b2cb`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-035 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Christian Religious Studies, Literature in English, History, Principles of Accounts
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Christian Religious` (`6a979a79-1591-52fd-a2d5-7abe9bad0dfa`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — relevance of the Torah in Jewish scripture - Old Testament, underscore the arguments about the authorship of the first five books of the Old; and, J.E.D.P. sources; transferable — analyse the concepts of peace, conflict and security, list major forms, types and root causes of conflict and violence, differentiate between conflict and terrorism
- **UTME requirement text:** CRS, and any two Arts subjects, and any other subject
- **O-level requirement text:** Five (5) SSC credit passes in English Language, CRS and three (3) other relevant subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: CRS; and any two Arts subjects; and any other subject; olevel: Five (5) SSC credit passes in English Language, CRS and three (3) other relevant subjects.
- **Selected university:** `ANCHOR-UNI` / `ANCHOR-UNI` (`f83bfbaf-9841-5a80-a91e-c5d761105889`)
- **Offering row:** `acfbe13e-be42-518e-943f-71138c4661a4`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Religious Ministry, Theology (`direct`) → Teaching professionals → missionary
- **All current programme-domain links:** Religious Ministry, Theology [direct]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `6a979a79-1591-52fd-a2d5-7abe9bad0dfa`; school `f83bfbaf-9841-5a80-a91e-c5d761105889`; offering `acfbe13e-be42-518e-943f-71138c4661a4`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-036 — ss3 · olevel-gap

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Library and Information Science` (`c5b9b282-1e38-5454-ba42-2fe58f8caf04`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — define the basic concepts in the course, discuss the relationship between library science and information science, explain the philosophical foundations of the course; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** EDUCATION 21 22 23 24 Science Education 25 26 (Visual Handicaps) EDUCATION 1 2 COURSES 3 Education 4 5 6 7 Social Sciences 8 Religious Studies 9 10 Language 11 Applied Arts 12 13 14 15 16 17 18 Arts 19 and French 20 21 22 Studies 23.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `SCIENCE` / `SCIENCE` (`8510efba-c350-5e92-ba3d-dde9e137f5d5`)
- **Offering row:** `5beb6a17-2c32-588d-8b4f-d93ae37d15ec`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Library, Archive (`direct`) → Curators & Archivists → information manager
- **All current programme-domain links:** Library, Archive [direct]; Business Intelligence [functional]; Journalism [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c5b9b282-1e38-5454-ba42-2fe58f8caf04`; school `8510efba-c350-5e92-ba3d-dde9e137f5d5`; offering `5beb6a17-2c32-588d-8b4f-d93ae37d15ec`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-037 — ss3 · utme-gap

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** not a full UTME match; any fallback must be marked possible/text-based
- **JAMB programme:** `Building` (`ee6c4763-c0ae-5a38-90c8-a80b33b7da83`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — define building as a structure, process and discipline, discuss the history of building, explain building profession; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `31a32002-9420-5fd5-9e12-41cb76bca917`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Construction Management (`direct`) → Construction & Site Managers → sewerage systems manager
- **All current programme-domain links:** Construction Management [direct]; Architecture [functional]; Civil [functional]; Economics [functional]; Geospatial Science [functional]; Land Surveying, Cadastral Mapping [functional]; Masonry, Bricklaying, Tiling, Plastering [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ee6c4763-c0ae-5a38-90c8-a80b33b7da83`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `31a32002-9420-5fd5-9e12-41cb76bca917`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-038 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Islamic Law/Sharia Law` (`1c7b609c-1b60-5ab3-a3da-6a4e86d0e0a0`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — appreciate the various legal rules, methods, processes and reasoning, acquire basic knowledge of the fundamental concepts of law and the various legal systems, gain knowledge of the function of law in society; and; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies
- **O-level requirement text:** Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `fe829861-636c-5cdc-aaac-011bb7bff6ab`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Religious Ministry, Theology [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `1c7b609c-1b60-5ab3-a3da-6a4e86d0e0a0`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `fe829861-636c-5cdc-aaac-011bb7bff6ab`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-039 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Medical Biochemistry` (`e1eb9e15-6650-5b9c-9853-f5a122fd3430`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — explain classification and chemistry of carbohydrate, discuss chemistry and biochemistry of the polysaccharide including the amino sugars; mucopolysaccharides, blood group substances, illustrate structure of chemistry and function of normal living cell; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Physics, Chemistry and Biology. 433.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `BENIN` / `BENIN` (`b3b5ba8a-6573-57f7-b4f1-11c42e383729`)
- **Offering row:** `d9ed1adb-946d-5988-b52e-285991cbf219`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Food Science (`functional`) → Food Scientists & Biotechnologists → geneticist
- **All current programme-domain links:** Food Science [functional]; Medical Laboratory Technology [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `e1eb9e15-6650-5b9c-9853-f5a122fd3430`; school `b3b5ba8a-6573-57f7-b4f1-11c42e383729`; offering `d9ed1adb-946d-5988-b52e-285991cbf219`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-040 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `APPLIED BOTANY` (`1edddb95-628f-51ef-a12f-5265b73e1781`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — identify different classes of plants, describe the vascular plants, locate nonvascular plants; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology and eitherPhysics or (Mathematics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `BAUCHI` / `BAUCHI` (`c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`)
- **Offering row:** `7d089bd2-238b-5c98-b10d-b6da6bbfcd9d`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Bioinformatics, Computational Biology (`functional`) → no subgroup → environmental scientist
- **All current programme-domain links:** Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Forestry, Wildlife Management [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `1edddb95-628f-51ef-a12f-5265b73e1781`; school `c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`; offering `7d089bd2-238b-5c98-b10d-b6da6bbfcd9d`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-041 — ss3 · olevel-gap

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Geography, Principles of Accounts
- **O-level subjects to enter:** Mathematics, Economics, Government, Geography, Biology
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Demography and Social Studies` (`bccd652c-5530-5aaa-b64c-1a8a69d435bc`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — explain the main concepts of population studies and demography, describe vividly the sources of demographic data, analyse the merits and demerits of de facto and de jure methods of data collection ;and; transferable — Engage in productive, sexual and reproductive health promotion activities, Impart essential knowledge in population studies, demography, social statistics and research methods, Conduct careful, objective and systematic study of the human population at different settings
- **UTME requirement text:** Mathematics, Economics/Geography and any other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics, Government and any one of Geography or Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics/Geography and any other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics, Government and any one of Geography or Biology.
- **Selected university:** `UDU` / `UDU` (`b142037f-159e-5166-9da1-a41ab005569c`)
- **Offering row:** `d6ad3898-ff9e-553e-842b-897e33227f0b`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Actuarial Science (`functional`) → Actuarial & Quantitative Modelling → actuarial consultant
- **All current programme-domain links:** Actuarial Science [functional]; Data Science [functional]; Economics [functional]; Geospatial Science [functional]; Public Administration [functional]; Recruitment, Employment [functional]; Scientific Research [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `bccd652c-5530-5aaa-b64c-1a8a69d435bc`; school `b142037f-159e-5166-9da1-a41ab005569c`; offering `d6ad3898-ff9e-553e-842b-897e33227f0b`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-042 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Principles of Accounts
- **O-level subjects to enter:** English Language, Mathematics, Economics, Civic Education, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Aviation Management` (`dded0db6-693b-5897-932d-5077b47b7faf`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — airport Operations and Management, airport Ground Handlings, airport Planning
- **UTME requirement text:** Mathematics, Economics and one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics and Economics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics and one (1) other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics and Economics.
- **Selected university:** `AZMAN` / `AZMAN` (`3a200bbe-94fa-5475-8361-76f3dcb91646`)
- **Offering row:** `9d54a5a9-e2db-557e-bbf4-b622d68f9c38`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Aviation (`direct`) → Pilots & Air Traffic Control → air traffic safety technician
- **All current programme-domain links:** Aviation [direct]; Accounting [functional]; Actuarial Science [functional]; Banking, Credit [functional]; Compliance, Regulation [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Economics [functional]; General Management [functional]; Hospitality [functional]; Insurance [functional]; Investment Analysis [functional]; Logistics [functional]; Marketing, Brand [functional]; Occupational Health, Safety [functional]; Sales [functional]; Tax Advisory, Transfer Pricing [functional]; Telecommunications [functional]; Trading [functional]; Travel, Tourism [functional]; Urban Mobility, Smart City Systems [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `dded0db6-693b-5897-932d-5077b47b7faf`; school `3a200bbe-94fa-5475-8361-76f3dcb91646`; offering `9d54a5a9-e2db-557e-bbf4-b622d68f9c38`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-043 — ss3 · utme-gap

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Chemistry, English Language, Biology
- **O-level subjects to enter:** English Language, Mathematics, Economics, Geography, Biology, Chemistry, Physics
- **Subject expectation:** not a full UTME match; any fallback must be marked possible/text-based
- **JAMB programme:** `Animal Science` (`c69b966a-60a9-5a22-b344-9c78910d305f`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agriculture, Mathematics/Physics, Use of English
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Biology/Agric Science and one of Physics, Geography or Economics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology/Agriculture; Mathematics/Physics; Use of English; olevel: Five (5) SSC credit passes in English Language, Chemistry, Mathematics, Biology/Agric Science and one of Physics, Geography or Economics.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `db8ec8d0-d9f3-5387-ab79-fcdc3efb68ab`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Livestock, Poultry, Dairy (`direct`) → Production and specialised services managers → bee breeder
- **All current programme-domain links:** Livestock, Poultry, Dairy [direct]; Agricultural Science [functional]; Animal Care, Grooming [functional]; Biomedical [functional]; Economics [functional]; Forestry, Wildlife Management [functional]; Marketing, Brand [functional]; Occupational Health, Safety [functional]; Scientific Research [functional]; Veterinary Science [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c69b966a-60a9-5a22-b344-9c78910d305f`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `db8ec8d0-d9f3-5387-ab79-fcdc3efb68ab`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-044 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Christian Studies` (`827725e6-f5aa-5689-9903-55f3fedbc137`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — relevance of the Torah in Jewish scripture - Old Testament, underscore the arguments about the authorship of the first five books of the Old; and, J.E.D.P. sources; transferable — analyse the concepts of peace, conflict and security, list major forms, types and root causes of conflict and violence, differentiate between conflict and terrorism
- **UTME requirement text:** OF ARTS (Hons.)] International Relations 53. German/Russian 54. 55. Environmental 56. 57. 58. 59. Archaeology 60. Studies 61. 62. Studies 63. Studies 64. Studies 65. 66.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AJAYI` / `AJAYI` (`7a8822e3-ea27-54fe-a564-9638023073a4`)
- **Offering row:** `056b55ba-a008-51e1-9535-9f44d2bcc18c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Religious Ministry, Theology (`direct`) → Teaching professionals → missionary
- **All current programme-domain links:** Religious Ministry, Theology [direct]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `827725e6-f5aa-5689-9903-55f3fedbc137`; school `7a8822e3-ea27-54fe-a564-9638023073a4`; offering `056b55ba-a008-51e1-9535-9f44d2bcc18c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-045 — ss3 · valid

- **Student context:** `SS3` / `Art`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Mathematics, Economics, Geography
- **O-level subjects to enter:** English Language, Mathematics, Economics, Government, Geography, Biology
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Sport Management (Education)` (`c5a45fcb-f88a-598a-a234-685d6082fded`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — Unavailable; transferable — Unavailable
- **UTME requirement text:** Biology, Mathematics, Economics, Geography
- **O-level requirement text:** Five (5) 'O' Level credit passes to include English Language and any two (2) of Biology, Economics, Geography, Government and Mathematics.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Biology; Mathematics; Economics; Geography
- **Selected university:** `SPORTS-UNI` / `SPORTS-UNI` (`3acfea25-703b-52f0-81af-a95e89e2ee40`)
- **Offering row:** `09160222-e901-5709-b0cc-8f48a289eac9`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Sports Management (`direct`) → Production and specialised services managers → sport administrator
- **All current programme-domain links:** Sports Management [direct]; Higher Education [functional]; Project Management [functional]; Sales [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c5a45fcb-f88a-598a-a234-685d6082fded`; school `3acfea25-703b-52f0-81af-a95e89e2ee40`; offering `09160222-e901-5709-b0cc-8f48a289eac9`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-046 — jamb · utme-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, Mathematics, Economics
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Medical Laboratory Technology/Science` (`dbdf0ff8-0f04-5fb5-a46e-dbcbeb17ae29`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — define safety awareness for Medical Laboratory Personnel, describe steps used as precautionary measures, select the correct means of disposal of waste generated in the Medical Laboratories; transferable — Unavailable
- **UTME requirement text:** Chemistry, Physics, Biology/Zoology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AUE` / `AUE` (`f6af7877-ccd2-5bd5-923d-ffd341d8e795`)
- **Offering row:** `ce1fa41d-a1a7-5701-998c-768866a52500`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Medical Laboratory Technology (`direct`) → Production and specialised services managers → medical laboratory assistant
- **All current programme-domain links:** Medical Laboratory Technology [direct]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Forensic Science, Digital Forensics [functional]; Medicine [functional]; Public Health [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `dbdf0ff8-0f04-5fb5-a46e-dbcbeb17ae29`; school `f6af7877-ccd2-5bd5-923d-ffd341d8e795`; offering `ce1fa41d-a1a7-5701-998c-768866a52500`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-047 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Physics, Chemistry, Biology
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `ARCHEAOLOGY` (`917b97ae-37b8-549a-9024-c97ab86c206d`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — have knowledge of what archaeology is and its aims, explain the origins of archaeology as a discipline and its eurocentric roots. understand how archaeologists discover sites, recover and handle archaeological evidence; and, identify the different dating methods used in archaeology, the principles behind each of the methods and their limitations in archaeological interpretation; transferable — Unavailable
- **UTME requirement text:** Any three (3) relevant Science subject.
- **O-level requirement text:** Five (5) or six (6) SSC credit passes at one (1) or two (2) sittings including English Language, Mathematics and other relevant subjects. Mathematics and two (2) other relevant subjects.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Any three (3) relevant Science subject.
- **Selected university:** `IBADAN` / `IBADAN` (`e1c071b0-e046-51f0-9de7-77ac53886688`)
- **Offering row:** `977303c5-e65b-57ec-b617-d565d7e3a414`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Museum Curation, Cultural Heritage, Archives (`direct`) → Production and specialised services managers → art restorer
- **All current programme-domain links:** Museum Curation, Cultural Heritage, Archives [direct]; Geospatial Science [functional]; Higher Education [functional]; Journalism [functional]; Library, Archive [functional]; Scientific Research [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `917b97ae-37b8-549a-9024-c97ab86c206d`; school `e1c071b0-e046-51f0-9de7-77ac53886688`; offering `977303c5-e65b-57ec-b617-d565d7e3a414`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-048 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Geography, Principles of Accounts
- **O-level subjects to enter:** English Language, Mathematics, Economics, Government, Geography, Biology
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Demography and Statistics` (`15ad2afd-ab3e-5174-a6e6-64960d49bbd2`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — explain the main concepts of population studies and demography, describe vividly the sources of demographic data, analyse the merits and demerits of de facto and de jure methods of data collection ;and; transferable — Engage in productive, sexual and reproductive health promotion activities, Impart essential knowledge in population studies, demography, social statistics and research methods, Conduct careful, objective and systematic study of the human population at different settings
- **UTME requirement text:** Mathematics, Economics/Geography and any other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics, Government and any one of Geography or Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics/Geography and any other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics, Government and any one of Geography or Biology.
- **Selected university:** `GOUU` / `GOUU` (`73700bdc-7a5a-5ba5-887e-0e86a917f1ba`)
- **Offering row:** `24a09a0a-a18f-5238-be2d-60caaf937ce9`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Actuarial Science (`functional`) → Actuarial & Quantitative Modelling → actuarial consultant
- **All current programme-domain links:** Actuarial Science [functional]; Data Science [functional]; Economics [functional]; Geospatial Science [functional]; Public Administration [functional]; Recruitment, Employment [functional]; Scientific Research [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `15ad2afd-ab3e-5174-a6e6-64960d49bbd2`; school `73700bdc-7a5a-5ba5-887e-0e86a917f1ba`; offering `24a09a0a-a18f-5238-be2d-60caaf937ce9`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-049 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Principles of Accounts
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Aviation Security` (`3decea23-0353-5bda-b254-c238bf2466c9`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — airport Operations and Management, airport Ground Handlings, airport Planning
- **UTME requirement text:** Mathematics, Economics plus one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics plus one (1) other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any two (2) subjects listed under the Direct Entry column.
- **Selected university:** `AZMAN` / `AZMAN` (`3a200bbe-94fa-5475-8361-76f3dcb91646`)
- **Offering row:** `a5b91916-b223-5106-ade6-e8f4c83851bb`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Aviation (`direct`) → Pilots & Air Traffic Control → air traffic safety technician
- **All current programme-domain links:** Aviation [direct]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Economics [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Sales [functional]; Telecommunications [functional]; Trading [functional]; Travel, Tourism [functional]; Urban Mobility, Smart City Systems [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `3decea23-0353-5bda-b254-c238bf2466c9`; school `3a200bbe-94fa-5475-8361-76f3dcb91646`; offering `a5b91916-b223-5106-ade6-e8f4c83851bb`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-050 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Chemistry, Biology, Mathematics
- **O-level subjects to enter:** Mathematics, Biology, Chemistry, Physics, Agricultural Science
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Crop Production` (`11c7465e-eecd-5f42-a26a-3288a9b0d6ab`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agriculture, Mathematics or Physics
- **O-level requirement text:** Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology/Agriculture; Mathematics or Physics; olevel: Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics.
- **Selected university:** `ADSU` / `ADSU` (`359901ac-970d-5d91-9eb3-dac88ae51d49`)
- **Offering row:** `8e26d389-cbd1-5cec-9de4-b21b4ebc996c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Crop Production, Horticulture (`direct`) → no subgroup → horticulture worker
- **All current programme-domain links:** Crop Production, Horticulture [direct]; Agricultural [functional]; Agricultural Science [functional]; Economics [functional]; Forestry, Wildlife Management [functional]; Livestock, Poultry, Dairy [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `11c7465e-eecd-5f42-a26a-3288a9b0d6ab`; school `359901ac-970d-5d91-9eb3-dac88ae51d49`; offering `8e26d389-cbd1-5cec-9de4-b21b4ebc996c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-051 — jamb · olevel-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, History, Principles of Accounts, Agricultural Science
- **O-level subjects to enter:** Literature in English, History, English Language, Mathematics, Civic Education
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Classical Studies` (`c6df25d3-d564-5a3a-940c-db9f8fc4270c`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — the world of early greek civilisation, the organisation of greek city states, greek culture, values, and their influence on contemporary society; transferable — analyse the concepts of peace, conflict and security, list major forms, types and root causes of conflict and violence, differentiate between conflict and terrorism
- **UTME requirement text:** Literature in English or History and any other two (2) subjects
- **O-level requirement text:** Five (5) SSC credit passes at one sitting or Six (6) SSC credit passes at two (2) sittings to include English Language, Literature in English or History, one Arts or Social Science subject and any other subject.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Literature in English or History and any other two (2) subjects; olevel: Five (5) SSC credit passes at one sitting or Six (6) SSC credit passes at two (2) sittings to include English Language, Literature in English or History, one Arts or Social Science subject and any other subject.
- **Selected university:** `IBADAN` / `IBADAN` (`e1c071b0-e046-51f0-9de7-77ac53886688`)
- **Offering row:** `78537650-b06c-550a-9646-f83e4f02ced7`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`functional`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c6df25d3-d564-5a3a-940c-db9f8fc4270c`; school `e1c071b0-e046-51f0-9de7-77ac53886688`; offering `78537650-b06c-550a-9646-f83e4f02ced7`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-052 — jamb · utme-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, Mathematics, Physics, Chemistry
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Statistics Education` (`0aaa3ea3-a1bf-5b78-b3f4-573eec035450`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — state the important roles of teaching as a profession, raise and judge some ethical issues in education, list the intellectual and practical competencies required by the teacher; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes to include English Language, Mathematics plus one (1) other Science subject.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes to include English Language, Mathematics plus one (1) other Science subject.
- **Selected university:** `LASUED` / `LASUED` (`6acc7e9b-fb80-52c0-87fd-6f18bc1ae726`)
- **Offering row:** `83c253d9-9d77-5d94-a67c-9ee19afa18da`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Actuarial Science (`functional`) → Actuarial & Quantitative Modelling → actuarial consultant
- **All current programme-domain links:** Actuarial Science [functional]; D003 Artificial Intelligence [functional]; Data Science [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `0aaa3ea3-a1bf-5b78-b3f4-573eec035450`; school `6acc7e9b-fb80-52c0-87fd-6f18bc1ae726`; offering `83c253d9-9d77-5d94-a67c-9ee19afa18da`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-053 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Physics, Chemistry, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Chemistry, Physics, Civic Education
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Civil Engineering` (`afd63dfc-3d69-5259-afee-f6be7749916e`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Physics, Chemistry, Mathematics
- **O-level requirement text:** Five (5) SSC credit passes to include Physics, Chemistry, Mathematics, English Language and one Science subject.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Physics; Chemistry; Mathematics; olevel: Five (5) SSC credit passes to include Physics, Chemistry, Mathematics, English Language and one Science subject.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `a69c9232-1b1d-5e6d-be51-018ae19bb36e`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Civil (`direct`) → no subgroup → dismantling engineer
- **All current programme-domain links:** Civil [direct]; Building Services Engineering — Mechanical, Electrical [functional]; Construction Management [functional]; Data Science [functional]; Geospatial Science [functional]; Project Management [functional]; Robotics Engineering, Systems Design [functional]; Architecture [adjacent]; Land Surveying, Cadastral Mapping [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `afd63dfc-3d69-5259-afee-f6be7749916e`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `a69c9232-1b1d-5e6d-be51-018ae19bb36e`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-054 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Arabic, Fine Art, Commerce
- **O-level subjects to enter:** English Language, Mathematics, Literature in English, Civic Education, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Civil Law` (`fabf6801-11dc-5f0f-ae97-f6380e89c6af`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — discuss the aim of studying psychology, discuss and critically evaluate the schools of Psychology, discuss the historical antecedents to modern Psychology; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Any three (3) Arts or Social Science subjects.
- **O-level requirement text:** Five (5)'O' Level credit passes to include English Language, Literature in English and Mathematics.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Any three (3) Arts or Social Science subjects.
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `dd87eeac-3e62-5b50-be7e-edb50ec79ddf`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `fabf6801-11dc-5f0f-ae97-f6380e89c6af`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `dd87eeac-3e62-5b50-be7e-edb50ec79ddf`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-055 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, Physics, Chemistry, Biology
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Medical Rehabilitation` (`362a787f-ec66-52cf-a53a-3e90e1947117`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — describe basic principles of physics used in electromedical equipment in all rehabilitation specialties, define laws of physics and various aspect of physical phenomena and their interaction with human body as applied to all rehabilitation specialties, describe basic concepts of electricity, its laws, magnetism, electro mechanics and related theories in all rehabilitation specialties; transferable — Unavailable
- **UTME requirement text:** Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Selected university:** `UNIZIK` / `UNIZIK` (`3a9f0243-a4ff-53cc-aa6f-bc01c43451d7`)
- **Offering row:** `54f417b2-07e2-5066-a4a0-03ff67d0da21`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Allied Health (`direct`) → no subgroup → physiotherapist
- **All current programme-domain links:** Allied Health [direct]; Exercise Science, Sports Therapy [direct]; Community Health Extension [functional]; Complementary, Alternative [functional]; Medical Physics, Radiation Therapy [functional]; Medicine [functional]; Neuroscience, Cognitive Science [functional]; Nursing [functional]; Pharmacy [functional]; Psychology, Counselling [functional]; Radiography, Medical Imaging [functional]; Sports Management [functional]; Wellness Coaching, Lifestyle Medicine [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `362a787f-ec66-52cf-a53a-3e90e1947117`; school `3a9f0243-a4ff-53cc-aa6f-bc01c43451d7`; offering `54f417b2-07e2-5066-a4a0-03ff67d0da21`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-056 — jamb · olevel-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Chemistry, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Animal Biology and Environment` (`f3ecef7a-9b5e-598e-9281-8c06b75f586b`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — describe the basic anatomy and physiology of the mammalian body, describe the external features, muscular, digestive, circulatory and other organ systems of a mammalian body, develop introductory knowledge about the role of zoology in human development by understanding relationships between organisms through systematics and cell biology; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Biology and any two (2) of Physics, Chemistry and Mathematics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Biology and any two (2) of Physics, Chemistry and Mathematics.
- **Selected university:** `BENIN` / `BENIN` (`b3b5ba8a-6573-57f7-b4f1-11c42e383729`)
- **Offering row:** `c47fc889-c35b-5917-8670-2820bbfe2b0d`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural Science (`functional`) → Aquaculture & Forestry Managers → aquaculture harvesting manager
- **All current programme-domain links:** Agricultural Science [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Forestry, Wildlife Management [functional]; Livestock, Poultry, Dairy [functional]; Scientific Research [functional]; Medical Laboratory Technology [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `f3ecef7a-9b5e-598e-9281-8c06b75f586b`; school `b3b5ba8a-6573-57f7-b4f1-11c42e383729`; offering `c47fc889-c35b-5917-8670-2820bbfe2b0d`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-057 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Geography, Literature in English, History
- **O-level subjects to enter:** English Language, Mathematics, Geography, Civic Education, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Economics` (`fcd27b2f-7245-53fe-a4f4-75b64fc1b664`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — identify the basic concepts in economics including scarcity, choice and scale of preference; basic laws of demand and supply, explain the nature of elasticity and its applications, as well as short and long run production functions; and, discuss pricing of factors of production and market structure consisting of perfect competitive market and imperfect competitive markets; transferable — ability to create job(s) in a variety of areas of production and services, manage a mix of human and non-human resources to achieve optimum output, ability to survive in work environment of diverse or multifaceted production mix
- **UTME requirement text:** Geography, and any two (2) Arts subjects
- **O-level requirement text:** Five (5) SSC credit passes to include English Language, Mathematics and Geography
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Geography; and any two (2) Arts subjects; olevel: Five (5) SSC credit passes to include English Language, Mathematics and Geography
- **Selected university:** `AUN` / `AUN` (`17b4d24b-dd48-5afd-bdc4-ea29f8111da5`)
- **Offering row:** `e049955f-4719-5655-8dab-69e26b7330f0`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Economics (`direct`) → Teaching professionals → business economics researcher
- **All current programme-domain links:** Economics [direct]; Accounting [functional]; Actuarial Science [functional]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Data Science [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Public Administration [functional]; Social Sciences [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `fcd27b2f-7245-53fe-a4f4-75b64fc1b664`; school `17b4d24b-dd48-5afd-bdc4-ea29f8111da5`; offering `e049955f-4719-5655-8dab-69e26b7330f0`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-058 — jamb · utme-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, Mathematics, Economics
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Banking and Finance` (`b8be6f6c-9426-5b50-bef3-353ea9626f9c`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — graduates under this curriculum are equipped with complex problem-solving skills, quick on-the-job learning and comfort with technology in the job market, the cross-boarder mobility will provide opportunity for graduate under this programme in this era of internalisation of financial services globally; and, the people and companies interface skills now transact in two dimensions; online and physical, our graduates will develop skill sets that enable a seamless transition into transacting in both realms making ready for the finance job market
- **UTME requirement text:** Mathematics, Economics, plus any one (1) of Government and Geography.
- **O-level requirement text:** Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics, plus any one (1) of Government and Geography.; olevel: Five (5) SSC credit passes to include: English Language, Mathematics and any other subjects. For NBC, the other two (2) relevant subjects could be from any of the following; Accounting, Principles of Accounts, Commerce, Office Practice and Economics.
- **Selected university:** `AAUA` / `AAUA` (`89224bf1-f265-5d8d-8994-83b751cf73e5`)
- **Offering row:** `cf4ceec4-2ce0-546c-a00a-ae67d054073e`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Banking, Credit (`direct`) → Bank & Fund Directors → credit union manager
- **All current programme-domain links:** Banking, Credit [direct]; Corporate Finance, Investment Banking [direct]; Credit Analysis, Structured Finance [direct]; Investment Analysis [direct]; Accounting [functional]; Economics [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Marketing, Brand [functional]; Quantitative Finance [functional]; Real Estate [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `b8be6f6c-9426-5b50-bef3-353ea9626f9c`; school `89224bf1-f265-5d8d-8994-83b751cf73e5`; offering `cf4ceec4-2ce0-546c-a00a-ae67d054073e`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-059 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Chemistry, Biology, Mathematics
- **O-level subjects to enter:** Mathematics, Biology, Chemistry, Physics, Agricultural Science
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Crop Protection` (`0c63d140-d9f3-50f9-af3f-1cb40d07ed36`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agricultural Science, Mathematics or Physics
- **O-level requirement text:** Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics (shares requirements with Crop Production umbrella block).
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology/Agricultural Science; Mathematics or Physics; olevel: Five (5) SSC credit passes to include Chemistry, Biology/Agricultural Science, Mathematics and one Science/Social Science subject and at least 'O' Level pass in Physics (shares requirements with Crop Production umbrella block).
- **Selected university:** `FUNAAB` / `FUNAAB` (`9462539f-d63e-59e0-84d5-82dfb6184f69`)
- **Offering row:** `f0559939-884d-5f1b-8c99-82ab412d51d1`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Crop Production, Horticulture (`direct`) → no subgroup → horticulture worker
- **All current programme-domain links:** Crop Production, Horticulture [direct]; Agricultural [functional]; Agricultural Science [functional]; Economics [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `0c63d140-d9f3-50f9-af3f-1cb40d07ed36`; school `9462539f-d63e-59e0-84d5-82dfb6184f69`; offering `f0559939-884d-5f1b-8c99-82ab412d51d1`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-060 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Arabic, Fine Art, Commerce
- **O-level subjects to enter:** English Language, Literature in English, Mathematics, Civic Education, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Communication Arts` (`3aa7533c-a108-5031-8eeb-f77400ae1740`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — explain the different meanings of communication, highlight the various elements of the communication process, distinguish between different types of human communication and their features; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Any three (3) Arts or Social Science subjects
- **O-level requirement text:** Five (5) SSC credit passes or equivalent including English Language, Literature in English, Arts/Music depending on the combination.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Any three (3) Arts or Social Science subjects; olevel: Five (5) SSC credit passes or equivalent including English Language, Literature in English, Arts/Music depending on the combination.
- **Selected university:** `BOWEN` / `BOWEN` (`4d2eede5-c18d-57fa-b36b-8863e6580ae3`)
- **Offering row:** `62ca509f-f6ba-5568-b1d2-19e8891f8f20`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Journalism (`direct`) → no subgroup → medical writer
- **All current programme-domain links:** Journalism [direct]; Media Production [direct]; Marketing, Brand [functional]; Esports & Creator Economy [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `3aa7533c-a108-5031-8eeb-f77400ae1740`; school `4d2eede5-c18d-57fa-b36b-8863e6580ae3`; offering `62ca509f-f6ba-5568-b1d2-19e8891f8f20`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-061 — jamb · olevel-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Teacher Education` (`4bc609a5-a5b9-5dc5-a388-211f4aca0418`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — identify pupils’ special abilities, build on the identified abilities; and, give an account of possible sources of distress in infants and ways of overcoming them; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** As in Educational Management
- **O-level requirement text:** As in Educational Management.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `SACOED B. ED` / `SACOED B. ED` (`3e8d6eb5-a02c-514d-8a54-7dd2f1cd418a`)
- **Offering row:** `c1b4bd3e-9b78-5843-9154-0193249d5030`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`direct`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [direct]; EdTech [functional]; Vocational [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `4bc609a5-a5b9-5dc5-a388-211f4aca0418`; school `3e8d6eb5-a02c-514d-8a54-7dd2f1cd418a`; offering `c1b4bd3e-9b78-5843-9154-0193249d5030`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-062 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Principles of Accounts
- **O-level subjects to enter:** English Language, Mathematics, Economics, Civic Education, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Communication Technology` (`c7871137-5bb0-5580-a7e6-31dd1eebe067`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — solve some vectors in addition and multiplication, calculate force and momentum; and, solve differentiation and integration of vectors; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Economics, Account/Commerce/Government
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Economics and Mathematics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Economics; Account/Commerce/Government; olevel: Five (5) SSC credit passes including English Language, Economics and Mathematics.
- **Selected university:** `BELLS` / `BELLS` (`1f649dd9-1256-5e25-9cde-6fb9c81c80a6`)
- **Offering row:** `4465c605-8b87-5e14-ac52-ee161a5265fc`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Telecommunications (`direct`) → Telecom & IT Leadership → telecommunications manager
- **All current programme-domain links:** Telecommunications [direct]; Electrical [functional]; Space Technology [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c7871137-5bb0-5580-a7e6-31dd1eebe067`; school `1f649dd9-1256-5e25-9cde-6fb9c81c80a6`; offering `4465c605-8b87-5e14-ac52-ee161a5265fc`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-063 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Literature in English, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Common Law` (`35f1a5c5-9e87-5211-85cc-73bed5f1ccb0`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — discuss the aim of studying psychology, discuss and critically evaluate the schools of Psychology, discuss the historical antecedents to modern Psychology; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Literature in English and any two (2) other Arts/or Social Science subjects.
- **O-level requirement text:** Five (5)SSC credit passes to include English Language, Literature - in - English and any other three (3) Arts/Social Science subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Literature in English and any two (2) other Arts/or Social Science subjects.; olevel: Five (5)SSC credit passes to include English Language, Literature - in - English and any other three (3) Arts/Social Science subjects.
- **Selected university:** `ILORIN` / `ILORIN` (`be4981eb-2b54-5ea1-941d-44e8ca2774db`)
- **Offering row:** `d6b298b4-203d-58e9-8aee-ae8b568bfcaf`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Criminology, Criminal Justice [functional]; Intellectual Property Law, Patents [functional]; Public Administration [functional]; Translation, Interpretation [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `35f1a5c5-9e87-5211-85cc-73bed5f1ccb0`; school `be4981eb-2b54-5ea1-941d-44e8ca2774db`; offering `d6b298b4-203d-58e9-8aee-ae8b568bfcaf`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-064 — jamb · utme-gap

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `utme`
- **UTME subjects to enter:** Use of English, English Language, Physics, Chemistry
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** UTME matching only; O-level must not be silently treated as checked
- **JAMB programme:** `Medicine and Surgery (Human Medicine)` (`9d060c3f-cf58-554b-92a6-b317388d21cf`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — classify the basic divisions of anatomy into regional, systemic and applied anatomy, demonstrate knowledge of anatomical terms, anatomical positions, planes, relationships and comparisons, laterality and movement, identify the shape, two ends, bony markings, and relations of surfaces of the clavicle; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** English Language, Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: English Language; Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `d5c4d22e-a396-5e4b-97d5-892008ecb107`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Medicine (`direct`) → no subgroup → medical laboratory assistant
- **All current programme-domain links:** Medicine [direct]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Biomedical Engineering [functional]; Forensic Science, Digital Forensics [functional]; Medical Laboratory Technology [functional]; Neuroscience, Cognitive Science [functional]; Public Health [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `9d060c3f-cf58-554b-92a6-b317388d21cf`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `d5c4d22e-a396-5e4b-97d5-892008ecb107`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-065 — jamb · valid

- **Student context:** `JAMB`
- **Entry route:** `student` → `subjects`
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Chemistry, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Animal and Environmental Biology` (`9cb03905-ba91-5a00-bdc4-ab985f5b78a2`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — describe the basic anatomy and physiology of the mammalian body, describe the external features, muscular, digestive, circulatory and other organ systems of a mammalian body, develop introductory knowledge about the role of zoology in human development by understanding relationships between organisms through systematics and cell biology; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Biology and any two (2) of Physics, Chemistry and Mathematics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Biology and any two (2) of Physics, Chemistry and Mathematics.
- **Selected university:** `BENIN` / `BENIN` (`b3b5ba8a-6573-57f7-b4f1-11c42e383729`)
- **Offering row:** `54ca857d-2ea6-50e1-ad25-14dea4d652d6`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural Science (`functional`) → Aquaculture & Forestry Managers → aquaculture harvesting manager
- **All current programme-domain links:** Agricultural Science [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Forestry, Wildlife Management [functional]; Livestock, Poultry, Dairy [functional]; Scientific Research [functional]; Medical Laboratory Technology [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `9cb03905-ba91-5a00-bdc4-ab985f5b78a2`; school `b3b5ba8a-6573-57f7-b4f1-11c42e383729`; offering `54ca857d-2ea6-50e1-ad25-14dea4d652d6`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-066 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Crop Science` (`126ff232-edab-52dc-a7d4-288d5139e186`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** AGRICULTURE/VET.MEDICINE B.Agric.Tech.) DVM] 35 Fisheries 36 Fisheries 37 Food 38 Food 39 Food 40 Forestry 41 Forestry/Forest 42 Forestry 43 Forestry 44 Forestry, 45 Forestry 46 Home 47 Home 48 Home 49 Horticulture 50 Hotel 51 Livestock 52 Nutrition 53 Pasture & 54 Plant 55 Plant Science 56 Plant Science 57 Plant Science 58 Plant 59 Plant 60 Public & 61 Soil Science 62 Soil Science 63 Soil Science.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `DELSUT` / `DELSUT` (`8ad8b817-0045-5081-8f1d-af80ae4f1e41`)
- **Offering row:** `ee5a74a4-ffb4-50d8-9c98-b6be99d92c14`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Crop Production, Horticulture (`direct`) → no subgroup → horticulture worker
- **All current programme-domain links:** Crop Production, Horticulture [direct]; Agricultural [functional]; Agricultural Science [functional]; Climate Science, Meteorology [functional]; Economics [functional]; Forestry, Wildlife Management [functional]; Livestock, Poultry, Dairy [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `126ff232-edab-52dc-a7d4-288d5139e186`; school `8ad8b817-0045-5081-8f1d-af80ae4f1e41`; offering `ee5a74a4-ffb4-50d8-9c98-b6be99d92c14`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-067 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Creative Arts` (`c86f37a2-3e51-57e2-81ec-a20ff1550352`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — explain the meaning of and differences between communication and information, identify and provide graphic illustrations of the basic models of communication, demonstrate an understanding of traditional modes of communication; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Fine Arts, and two other Arts subjects or Social Science subjects
- **O-level requirement text:** Five (5) SSC credit passes to include English Language and Fine Arts.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Fine Arts; and two other Arts subjects or Social Science subjects; olevel: Five (5) SSC credit passes to include English Language and Fine Arts.
- **Selected university:** `DOU` / `DOU` (`e7c6659e-a0dc-560a-943f-4ec52c0df473`)
- **Offering row:** `2c35bd66-905b-5706-9d82-4153a1465d01`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Media Production (`direct`) → Chief executives, senior officials and legislators → General and Operations Managers
- **All current programme-domain links:** Media Production [direct]; Performing Arts & Entertainment [direct]; D139 Game Design [functional]; D153 Music Production [functional]; Esports & Creator Economy [functional]; Graphic Design [functional]; Higher Education [functional]; Journalism [functional]; Marketing, Brand [functional]; Recruitment, Employment [functional]; Sales [functional]; UI/UX Design [functional]; Vocational [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c86f37a2-3e51-57e2-81ec-a20ff1550352`; school `e7c6659e-a0dc-560a-943f-4ec52c0df473`; offering `2c35bd66-905b-5706-9d82-4153a1465d01`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-068 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Technology Education` (`23fb7c85-4481-5d70-92ca-3009cd261124`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — state the important roles of teaching as a profession, raise and judge some ethical issues in education, list the intellectual and practical competencies required by the teacher; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** EDUCATION 21 22 23 24 Science Education 25 26 (Visual Handicaps) EDUCATION 1 2 COURSES 3 Education 4 5 6 7 Social Sciences 8 Religious Studies 9 10 Language 11 Applied Arts 12 13 14 15 16 17 18 Arts 19 and French 20 21 22 Studies 23.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `FED-GUSAU` / `FED-GUSAU` (`b1fafa11-fd80-5f90-8d8b-e7c1d5f7f763`)
- **Offering row:** `996b5fda-75a3-5f33-8b9f-628f12c4d577`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`direct`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [direct]; Carpentry, Joinery, Wood Technology [functional]; Electrical [functional]; Masonry, Bricklaying, Tiling, Plastering [functional]; Mechanical [functional]; Motor Vehicle Mechanics, Repairs [functional]; Telecommunications [functional]; Vocational [functional]; Welding, Fabrication, Blacksmithing [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `23fb7c85-4481-5d70-92ca-3009cd261124`; school `b1fafa11-fd80-5f90-8d8b-e7c1d5f7f763`; offering `996b5fda-75a3-5f33-8b9f-628f12c4d577`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-069 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Computer and Information Science` (`241389e6-6bb7-5d4e-aefa-62d2e7f87cc7`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — explain the differences between permutation and combination, explain the concept of random variables and relate it to probability and distribution functions, describe the basic distribution functions; and; transferable — creativity, information literacy, media literacy
- **UTME requirement text:** OFENGINEERING/ENVIRONMENTAL/TECHNOLOGY B.Tech.,B.Arc.] Arts Technology/Engineering Engineering Regional Planning Meterology Planning and Tourism and Food Management and Engineering Technology Engineering Production Engineering Material Engineering.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `COMMUNICATION` / `COMMUNICATION` (`52a76b62-5e0c-5bd2-b869-0ab205104789`)
- **Offering row:** `d28592c0-5a55-5943-a7b9-bf5118984579`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** D003 Artificial Intelligence (`direct`) → no subgroup → computer vision engineer
- **All current programme-domain links:** D003 Artificial Intelligence [direct]; Software Engineering [direct]; Blockchain [functional]; Cloud Computing [functional]; Data Engineering [functional]; Data Science [functional]; Product Management [functional]; Robotics Engineering, Systems Design [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `241389e6-6bb7-5d4e-aefa-62d2e7f87cc7`; school `52a76b62-5e0c-5bd2-b869-0ab205104789`; offering `d28592c0-5a55-5943-a7b9-bf5118984579`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-070 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Common and Islamic Law` (`288e06d8-b8e8-5ca0-8398-85a2b54b0183`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — appreciate the various legal rules, methods, processes and reasoning, acquire basic knowledge of the fundamental concepts of law and the various legal systems, gain knowledge of the function of law in society; and; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies
- **O-level requirement text:** Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `ABUJA` / `ABUJA` (`3160c1ef-48e4-50a9-bc6b-358612396197`)
- **Offering row:** `4c235a6b-43a3-5443-90e7-f3208c0f513d`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Compliance, Regulation [functional]; Criminology, Criminal Justice [functional]; Diplomacy, International Relations [functional]; Immigration Law, Asylum [functional]; Intellectual Property Law, Patents [functional]; Religious Ministry, Theology [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `288e06d8-b8e8-5ca0-8398-85a2b54b0183`; school `3160c1ef-48e4-50a9-bc6b-358612396197`; offering `4c235a6b-43a3-5443-90e7-f3208c0f513d`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-071 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Nursing/Nursing Science` (`d2ebe062-bb9b-5f54-89b0-93c3acee9533`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — evaluate of patient's status in rehabilitation, identify of nursing diagnosis and patient's arrangements in rehabilitation, identify and demonstrate Basic and specific assessments in nursing procedure; and; transferable — Unavailable
- **UTME requirement text:** Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in Mathematics, Chemistry, Biology, Physics and English Language.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in Mathematics, Chemistry, Biology, Physics and English Language.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `a5955d48-17ac-5740-ab86-d81c618d641f`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Nursing (`direct`) → no subgroup → paramedic in emergency responses
- **All current programme-domain links:** Nursing [direct]; Allied Health [functional]; Medicine [functional]; Neuroscience, Cognitive Science [functional]; Psychology, Counselling [functional]; Public Health [functional]; Social Welfare, Youth Services [functional]; Wellness Coaching, Lifestyle Medicine [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `d2ebe062-bb9b-5f54-89b0-93c3acee9533`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `a5955d48-17ac-5740-ab86-d81c618d641f`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-072 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Applied Biochemistry` (`a019e508-bd9e-5657-92fd-9ca3c5438230`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — explain classification and chemistry of carbohydrate, discuss chemistry and biochemistry of the polysaccharide including the amino sugars; mucopolysaccharides, blood group substances, illustrate structure of chemistry and function of normal living cell; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Chemistry, and Biology Physics or Mathematics.
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology and Physics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry, and Biology Physics or Mathematics.; olevel: Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology and Physics.
- **Selected university:** `ESUTECH` / `ESUTECH` (`f3bd8dbc-ffcb-5d4b-8e8d-310ce5ef5f55`)
- **Offering row:** `800a5630-608b-5244-bbc1-3f1ab85ed697`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Food Science (`functional`) → Food Scientists & Biotechnologists → geneticist
- **All current programme-domain links:** Food Science [functional]; Medical Laboratory Technology [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `a019e508-bd9e-5657-92fd-9ca3c5438230`; school `f3bd8dbc-ffcb-5d4b-8e8d-310ce5ef5f55`; offering `800a5630-608b-5244-bbc1-3f1ab85ed697`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-073 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Economics and Statistics` (`27c22e14-58a2-5363-b533-f47801bf4027`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — identify the basic concepts in economics including scarcity, choice and scale of preference; basic laws of demand and supply, explain the nature of elasticity and its applications, as well as short and long run production functions; and, discuss pricing of factors of production and market structure consisting of perfect competitive market and imperfect competitive markets; transferable — ability to create job(s) in a variety of areas of production and services, manage a mix of human and non-human resources to achieve optimum output, ability to survive in work environment of diverse or multifaceted production mix
- **UTME requirement text:** Economics, Mathematics and any of Government, History, Geography, Literature in English, French and Christian Religious Studies/Islamic Studies.
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Economics and any two (2) of Arts or Social Science subjects.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `BENIN` / `BENIN` (`b3b5ba8a-6573-57f7-b4f1-11c42e383729`)
- **Offering row:** `dc310681-94d0-57f8-bd08-dce2affea1e7`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Economics (`direct`) → Teaching professionals → business economics researcher
- **All current programme-domain links:** Economics [direct]; Accounting [functional]; Actuarial Science [functional]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; D003 Artificial Intelligence [functional]; Data Engineering [functional]; Data Science [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Public Administration [functional]; Social Sciences [functional]; Software Engineering [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `27c22e14-58a2-5363-b533-f47801bf4027`; school `b3b5ba8a-6573-57f7-b4f1-11c42e383729`; offering `dc310681-94d0-57f8-bd08-dce2affea1e7`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-074 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Business Management` (`d90d594c-a36c-5e87-ac8d-6c73f6484d53`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — communication: Both oral, written communication and listening skills; Business Administration graduates would be clear, concise and focused in their interactions and engagement, teamwork: Graduates of Business Administration should demonstrate the ability to build positive working relationships that assist each team member to achieve business objectives, problem solving: From a variety of courses offered on business decision, graduate should demonstrate the ability to implement logical and analytical approach to solve problems and resolve organizational conflicts and issues
- **UTME requirement text:** Mathematics, Economics and one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics, plus any two (2) of Accounting, Business Methods, Commerce, Government, Geography, and Statistics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics and one (1) other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics, plus any two (2) of Accounting, Business Methods, Commerce, Government, Geography, and Statistics.
- **Selected university:** `AUN` / `AUN` (`17b4d24b-dd48-5afd-bdc4-ea29f8111da5`)
- **Offering row:** `188cfeca-b887-5440-a123-bc2c5881513c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** General Management (`direct`) → Chief Executives & Founders → public employment service manager
- **All current programme-domain links:** General Management [direct]; Actuarial Science [functional]; Banking, Credit [functional]; Business Intelligence [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Data Science [functional]; Economics [functional]; Human Resources [functional]; Insurance [functional]; Investment Analysis [functional]; Project Management [functional]; Public Administration [functional]; Recruitment, Employment [functional]; Trading [functional]; Marketing, Brand [adjacent]; Product Management [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `d90d594c-a36c-5e87-ac8d-6c73f6484d53`; school `17b4d24b-dd48-5afd-bdc4-ea29f8111da5`; offering `188cfeca-b887-5440-a123-bc2c5881513c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-075 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Eco-Tourism and Wildlife Management` (`d74f9882-ed24-59bd-87cd-9bb8782f232f`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** English Language, Biology/Agricultural Science, any two (2) of Chemistry, Geography, Economics, Mathematics and Physics
- **O-level requirement text:** Five (5) SSC credit passes to include English Language, Mathematics, Biology or Agricultural Science, Chemistry and any other relevant subject (shares block with Agribusiness umbrella).
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: English Language; Biology/Agricultural Science; any two (2) of Chemistry, Geography, Economics, Mathematics and Physics; olevel: Five (5) SSC credit passes to include English Language, Mathematics, Biology or Agricultural Science, Chemistry and any other relevant subject (shares block with Agribusiness umbrella).
- **Selected university:** `FUTA` / `FUTA` (`2a117a94-b271-5351-a623-6616184fe452`)
- **Offering row:** `405859fe-c6c7-5acc-a39f-4f88db8cc388`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Forestry, Wildlife Management (`direct`) → Science and engineering professionals → pest management worker
- **All current programme-domain links:** Forestry, Wildlife Management [direct]; Agricultural Science [functional]; Crop Production, Horticulture [functional]; Economics [functional]; Livestock, Poultry, Dairy [functional]; Marketing, Brand [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `d74f9882-ed24-59bd-87cd-9bb8782f232f`; school `2a117a94-b271-5351-a623-6616184fe452`; offering `405859fe-c6c7-5acc-a39f-4f88db8cc388`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-076 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Drama/Dramatic Arts/Performing Arts` (`109066d5-bcec-54c8-a6db-8542a03f14e7`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — explain the meaning of and differences between communication and information, identify and provide graphic illustrations of the basic models of communication, demonstrate an understanding of traditional modes of communication; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Literature in English, and two (2) other relevant subjects
- **O-level requirement text:** Five (5) SSC credit passes to include English Language and Arts subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Literature in English; and two (2) other relevant subjects; olevel: Five (5) SSC credit passes to include English Language and Arts subjects.
- **Selected university:** `ABUJA` / `ABUJA` (`3160c1ef-48e4-50a9-bc6b-358612396197`)
- **Offering row:** `5c7ff96c-d0c4-5617-b473-0cc34a86cbf2`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Performing Arts & Entertainment (`direct`) → Science and engineering professionals → no role returned
- **All current programme-domain links:** Performing Arts & Entertainment [direct]; D153 Music Production [functional]; Esports & Creator Economy [functional]; Media Production [functional]; Marketing, Brand [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `109066d5-bcec-54c8-a6db-8542a03f14e7`; school `3160c1ef-48e4-50a9-bc6b-358612396197`; offering `5c7ff96c-d0c4-5617-b473-0cc34a86cbf2`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-077 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Transport Planning and Management` (`4adc17bd-7c3d-5773-b549-2904a44f3b79`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — Hotel and Tourism Management programme has been designed to offer a comprehensive education to self-reliant, entrepreneurs, consultants' graduates with the capabilities (good understanding and strong analytical skills), Apply the learned principles, theories, processes, techniques and tools to help society and organizations in achieving comparative advantages and to consistently meet the demands of end-users in decision making, Accommodation of skills and competence, behavioural attributes and good understanding of professional ethical considerations that will make graduates of Hotel and Tourism management highly employable, marketable at the various relevant sectors of local, national and international economies
- **UTME requirement text:** Geography, Economics, Government, Mathematics, Chemistry, Biology, Physics, Agricultural Science, Accounting, Commerce
- **O-level requirement text:** Five (5) 'O' Level credit passes at one (1) sitting or six (6) 'O' Level credit passes at two (2) sittings in English Language, Mathematics and any three (3) of Economics, Government, Commerce, Accounting, Biology, Agricultural Science, Geography, Chemistry and Physics.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Geography; Economics; Government; Mathematics; Chemistry; Biology; Physics; Agricultural Science; Accounting; Commerce
- **Selected university:** `TASUED` / `TASUED` (`88ceb89a-3f4c-583f-88da-2a5691321979`)
- **Offering row:** `20ae5fa6-2d3d-51f9-8bdb-ebede7fe650f`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Hospitality (`direct`) → Hospitality & Venue Management → tour operator manager
- **All current programme-domain links:** Hospitality [direct]; Travel, Tourism [direct]; Economics [functional]; Food Science [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Product Management [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `4adc17bd-7c3d-5773-b549-2904a44f3b79`; school `88ceb89a-3f4c-583f-88da-2a5691321979`; offering `20ae5fa6-2d3d-51f9-8bdb-ebede7fe650f`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-078 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Electrical Engineering` (`c42ad1f9-31b4-506d-86f0-5c7c94279f84`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Physics, Chemistry
- **O-level requirement text:** Five (5) SSC credit passes including Mathematics, Physics, Chemistry and English Language.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Physics; Chemistry; olevel: Five (5) SSC credit passes including Mathematics, Physics, Chemistry and English Language.
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `dab33c50-899d-5e9b-bcc0-d173a3d1de3c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Electrical (`direct`) → no subgroup → medical device engineer
- **All current programme-domain links:** Electrical [direct]; Building Services Engineering — Mechanical, Electrical [functional]; Data Science [functional]; Electrical Installation, Wiring [functional]; Electronics Servicing, ICT Equipment [functional]; Industrial Automation [functional]; Internet of Things [functional]; Process Automation, SCADA, PLC [functional]; Renewable Energy Engineering [functional]; Robotics Engineering, Systems Design [functional]; Telecommunications [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `c42ad1f9-31b4-506d-86f0-5c7c94279f84`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `dab33c50-899d-5e9b-bcc0-d173a3d1de3c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-079 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Criminology and Security Studies (printed under Law faculty block)` (`ba5512eb-56af-5b4d-b3cc-4732caed424b`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — discuss the culture, value and norms as foundation of society and social order, describe the problem posed to social order by deviance, crime and conflict, identify traditional and informal mechanisms for preventing, controlling and resolving deviance and conflict; transferable — Specialist career in government's law enforcement, security and criminal justice agencies, Employment in corporate security agencies and departments, Establish and operate security services like consultancy, guard and security companies, marketing of security products
- **UTME requirement text:** Any three (3) subjects
- **O-level requirement text:** Five (5)SSC credit passes to include English Language.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Any three (3) subjects; olevel: Five (5)SSC credit passes to include English Language.
- **Selected university:** `JOS` / `JOS` (`e6c3392c-accc-5515-a9ce-560b9790aede`)
- **Offering row:** `8bcecafd-ec04-5f2e-a421-c4075bd061ea`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Criminology, Criminal Justice (`direct`) → Chief executives, senior officials and legislators → police commissioner
- **All current programme-domain links:** Criminology, Criminal Justice [direct]; Security Services [direct]; Compliance, Regulation [functional]; Economics [functional]; Forensic Science, Digital Forensics [functional]; General Management [functional]; Legal Practice [functional]; Public Administration [functional]; Recruitment, Employment [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ba5512eb-56af-5b4d-b3cc-4732caed424b`; school `e6c3392c-accc-5515-a9ce-560b9790aede`; offering `8bcecafd-ec04-5f2e-a421-c4075bd061ea`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-080 — undergraduate · school-route

- **Student context:** `Undergraduate`
- **Entry route:** `student` → `school_programme`
- **Exam matching mode:** `not_applicable`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Not used on this route
- **Subject expectation:** subject picker is not the entry route; verify the selected university's offering and detail
- **JAMB programme:** `Pharmacology` (`79229f15-fd7e-5841-a0cd-a8f6bca9a937`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — explain the history of pharmacology, demonstrate understanding of drug interaction in the human body system, explain the effects of disease on drug kinetics; transferable — identify sources of drugs, describe various routes of drug administration and how they influence onset of drug action, identify the factors that affect drug absorption, distribution, metabolism and excretion
- **UTME requirement text:** English Language, Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: English Language; Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Selected university:** `ABUAD` / `ABUAD` (`4beb9b46-ddaa-5a56-b936-ea60e63b57c9`)
- **Offering row:** `17cf5b00-8282-5a1d-ad41-6aba8f6c2298`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Allied Health (`functional`) → no subgroup → physiotherapist
- **All current programme-domain links:** Allied Health [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Biomedical Engineering [functional]; Medical Laboratory Technology [functional]; Medicine [functional]; Neuroscience, Cognitive Science [functional]; Occupational Health, Safety [functional]; Pharmacy [functional]; Psychology, Counselling [functional]; Scientific Research [functional]; Wellness Coaching, Lifestyle Medicine [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `79229f15-fd7e-5841-a0cd-a8f6bca9a937`; school `4beb9b46-ddaa-5a56-b936-ea60e63b57c9`; offering `17cf5b00-8282-5a1d-ad41-6aba8f6c2298`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-081 — school_owner · olevel-gap

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Chemistry, Biology, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME match with an O-level gap or unparsed O-level state; never fully eligible
- **JAMB programme:** `Applied Chemistry` (`3c9152a8-5bff-5168-8f5d-9c7c1bb75c32`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — state the kinetic theory of gases and solve problems related to ideal and real gases, derive the formula for molecular velocity of gases and use the derived formula to solve problems, describe and explain the fundamental concepts of physical chemistry including those of statistical mechanics, chemical Kinetics, quantum mechanics and spectroscopy; transferable — explain basic definition of set, subsets, union, intersection, complements and use of Venn diagrams, solve quadratic equations, solve trigonometric functions
- **UTME requirement text:** Chemistry and (2) of Physics, Biology Mathematics.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Chemistry and (2) of Physics, Biology Mathematics.
- **Selected university:** `CALABAR` / `CALABAR` (`dc4f0a5d-b0bd-5a7a-84e2-a4406fe8dfd8`)
- **Offering row:** `c5c04476-387d-5417-86fc-9f69f3891d58`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Chemical Engineering (`functional`) → Chemical & Process Engineers → synthetic materials engineer
- **All current programme-domain links:** Chemical Engineering [functional]; Environmental Engineering [functional]; Nanotechnology, Advanced Materials [functional]; Pharmacy [functional]; Quantum Computing, Quantum Information [functional]; Scientific Research [functional]; Medical Laboratory Technology [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `3c9152a8-5bff-5168-8f5d-9c7c1bb75c32`; school `dc4f0a5d-b0bd-5a7a-84e2-a4406fe8dfd8`; offering `c5c04476-387d-5417-86fc-9f69f3891d58`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-082 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Civic Education, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Economics with/and Operation Research` (`dab16a1a-6223-548a-b436-81a7d4b0518a`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — identify the basic concepts in economics including scarcity, choice and scale of preference; basic laws of demand and supply, explain the nature of elasticity and its applications, as well as short and long run production functions; and, discuss pricing of factors of production and market structure consisting of perfect competitive market and imperfect competitive markets; transferable — ability to create job(s) in a variety of areas of production and services, manage a mix of human and non-human resources to achieve optimum output, ability to survive in work environment of diverse or multifaceted production mix
- **UTME requirement text:** Economics, Mathematics and any of Government, History, Geography, Literature in English, French and Christian Religious Studies/Islamic Studies.
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Economics and any two (2) of Arts or Social Science subjects.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `CUAB` / `CUAB` (`b2c7e8cf-ee09-5ad3-8156-921b71bdcacd`)
- **Offering row:** `7a15e907-5e9f-5f31-9705-fb2e3df3990c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Economics (`direct`) → Teaching professionals → business economics researcher
- **All current programme-domain links:** Economics [direct]; Accounting [functional]; Actuarial Science [functional]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; D003 Artificial Intelligence [functional]; Data Science [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Public Administration [functional]; Social Sciences [functional]; Software Engineering [functional]; Tax Advisory, Transfer Pricing [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `dab16a1a-6223-548a-b436-81a7d4b0518a`; school `b2c7e8cf-ee09-5ad3-8156-921b71bdcacd`; offering `7a15e907-5e9f-5f31-9705-fb2e3df3990c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-083 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Economics, Principles of Accounts, Commerce
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Cooperative Economics and Management` (`79054254-59c7-5701-9d71-092af6d4b565`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — Teaching skills for rural community development, Stakeholder analysis and management, Cooperative formation and administration
- **UTME requirement text:** Mathematics, Economics plus one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language, Mathematics, Economics plus any other two (2) subjects. For NBC Holders, the other subjects could be from the following: Principles of Accounts, Commerce, and Accounts.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics plus one (1) other subject.; olevel: Five (5) SSC credit passes including English Language, Mathematics, Economics plus any other two (2) subjects. For NBC Holders, the other subjects could be from the following: Principles of Accounts, Commerce, and Accounts.
- **Selected university:** `UNIZIK` / `UNIZIK` (`3a9f0243-a4ff-53cc-aa6f-bc01c43451d7`)
- **Offering row:** `76cacd53-6a52-5c2c-8aee-be6458bbdc4e`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Accounting (`functional`) → Professional Accounting & Audit → financial auditor
- **All current programme-domain links:** Accounting [functional]; Actuarial Science [functional]; Agricultural Science [functional]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Economics [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Real Estate [functional]; Social Sciences [functional]; Social Welfare, Youth Services [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `79054254-59c7-5701-9d71-092af6d4b565`; school `3a9f0243-a4ff-53cc-aa6f-bc01c43451d7`; offering `76cacd53-6a52-5c2c-8aee-be6458bbdc4e`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-084 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Chemistry, Biology, Mathematics
- **O-level subjects to enter:** English Language, Mathematics, Biology, Chemistry, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Environmental Management and Technology` (`ee683b39-d76a-5d87-8b1c-3e26be989641`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — identify and deduce the physical quantities and their units, differentiate between vectors and scalars, describe and evaluate motion of systems on the basis of the fundamental laws of mechanics; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology, Mathematics/Physics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Chemistry, Biology Science, Physics and Mathematics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Chemistry; Biology; Mathematics/Physics; olevel: Five (5) SSC credit passes in English Language, Chemistry, Biology Science, Physics and Mathematics.
- **Selected university:** `FUNAAB` / `FUNAAB` (`9462539f-d63e-59e0-84d5-82dfb6184f69`)
- **Offering row:** `ece9be1e-1d88-53ff-b5d1-6a1b3e8447df`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Environmental Engineering (`direct`) → no subgroup → water treatment systems operator
- **All current programme-domain links:** Environmental Engineering [direct]; Climate Science, Meteorology [functional]; Economics [functional]; Geospatial Science [functional]; Occupational Health, Safety [functional]; Real Estate [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ee683b39-d76a-5d87-8b1c-3e26be989641`; school `9462539f-d63e-59e0-84d5-82dfb6184f69`; offering `ece9be1e-1d88-53ff-b5d1-6a1b3e8447df`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-085 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Efik-Ibibio` (`d455b04e-66ce-5018-988d-b74320422bb8`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — explain who the Efik are, explain the origin and migration history of the Efik people, state the relationship between the Efik language and the people's culture; transferable — analyse the historical foundation of the Nigerian arts and culture in pre-colonial times, list and identify the major linguistic groups in Nigeria, explain the gradual evolution of Nigeria as a political entity
- **UTME requirement text:** Literature in English, and two (2) other Arts or Social Science subjects
- **O-level requirement text:** Five (5) SSC credit passes or equivalent including English
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Literature in English; and two (2) other Arts or Social Science subjects; olevel: Five (5) SSC credit passes or equivalent including English
- **Selected university:** `UYO` / `UYO` (`76561787-b77a-53e2-a65c-22d345d89260`)
- **Offering row:** `d4678ee2-6be0-5145-acf1-8937175f329f`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Translation, Interpretation (`direct`) → Production and specialised services managers → translator
- **All current programme-domain links:** Translation, Interpretation [direct]; Higher Education [functional]; Journalism [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `d455b04e-66ce-5018-988d-b74320422bb8`; school `76561787-b77a-53e2-a65c-22d345d89260`; offering `d4678ee2-6be0-5145-acf1-8937175f329f`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-086 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Geography, Chemistry, Physics, Agricultural Science
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Vocational Education` (`75fab7c6-ba39-5972-ac57-11f241524d92`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — state the important roles of teaching as a profession, raise and judge some ethical issues in education, list the intellectual and practical competencies required by the teacher; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Economics, plus one (1) of Literature in English, History, Government, Geography/Physics, Chemistry and Physics
- **O-level requirement text:** Five (5) 'O' Level credit passes to include English, Mathematics, Chemistry, Agricultural Science and Geography/Physics or TC Grade II.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Mathematics; Economics; plus one (1) of Literature in English, History, Government, Geography/Physics, Chemistry and Physics
- **Selected university:** `BAUCHI` / `BAUCHI` (`c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`)
- **Offering row:** `52c15d78-e6b0-5283-becd-999d5f6d4a3c`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`direct`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [direct]; Electrical [functional]; Mechanical [functional]; Motor Vehicle Mechanics, Repairs [functional]; Vocational [functional]; Welding, Fabrication, Blacksmithing [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `75fab7c6-ba39-5972-ac57-11f241524d92`; school `c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`; offering `52c15d78-e6b0-5283-becd-999d5f6d4a3c`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-087 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Physics, Chemistry
- **O-level subjects to enter:** English Language, Mathematics, Chemistry, Physics, Civic Education
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Electrical/Electronic Engineering` (`ad5bcea3-81e3-51e3-ad48-77cd76939863`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Physics, Chemistry
- **O-level requirement text:** Five (5) SSC credit passes to include Mathematics, Physics, Chemistry, English Language and any other Science subject.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Physics; Chemistry; olevel: Five (5) SSC credit passes to include Mathematics, Physics, Chemistry, English Language and any other Science subject.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `9a6b3917-7540-58ae-88ba-208dd5378fff`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Building Services Engineering — Mechanical, Electrical (`direct`) → Production and specialised services managers → smart home engineer
- **All current programme-domain links:** Building Services Engineering — Mechanical, Electrical [direct]; Electrical [direct]; Data Science [functional]; Industrial Automation [functional]; Renewable Energy Engineering [functional]; Software Engineering [functional]; Telecommunications [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `ad5bcea3-81e3-51e3-ad48-77cd76939863`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `9a6b3917-7540-58ae-88ba-208dd5378fff`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-088 — school_owner · olevel-gap

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Islamic Law/Sharia Law` (`1c7b609c-1b60-5ab3-a3da-6a4e86d0e0a0`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — appreciate the various legal rules, methods, processes and reasoning, acquire basic knowledge of the fundamental concepts of law and the various legal systems, gain knowledge of the function of law in society; and; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** Any three (3) Arts or Social Science subjects including Arabic or Islamic Studies
- **O-level requirement text:** Five (5)'O' Level credit passes in Arts or Social Sciences to include English Language and Islamic Studies or Arabic.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `fe829861-636c-5cdc-aaac-011bb7bff6ab`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Religious Ministry, Theology [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `1c7b609c-1b60-5ab3-a3da-6a4e86d0e0a0`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `fe829861-636c-5cdc-aaac-011bb7bff6ab`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-089 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Biology, Chemistry, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Pharmacy` (`e7d23cec-6601-5983-8283-b77a84c3cb6e`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — define the role of Pharmacists in health services, identify opportunities in various practice areas of Pharmacy, identify various disciplines of Pharmacy; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.
- **Selected university:** `ABU` / `ABU` (`d27d7d4c-dcf3-5254-9faa-94e2991a92e3`)
- **Offering row:** `b8eec54d-4e25-5afa-90b8-3498b3874c49`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Pharmacy (`direct`) → Production and specialised services managers → pharmacy manager
- **All current programme-domain links:** Pharmacy [direct]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Biomedical Engineering [functional]; Medicine [functional]; Public Health [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `e7d23cec-6601-5983-8283-b77a84c3cb6e`; school `d27d7d4c-dcf3-5254-9faa-94e2991a92e3`; offering `b8eec54d-4e25-5afa-90b8-3498b3874c49`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-090 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Chemistry, Physics
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Applied Ecology` (`fd362376-690f-543f-a2f4-3af37fba38de`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — distinguish between heritable and non-heritable characteristics, explain the likelihood of genetic events (Probability) and how well those events (results) fit into a set of observation, (results) fit into a set of observation; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Biology, Chemistry and anyother Sciencesubject.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Biology, Chemistry and anyother Sciencesubject.
- **Selected university:** `BAUCHI` / `BAUCHI` (`c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`)
- **Offering row:** `2b62cbf9-82ca-5810-8a4c-0cad1c005068`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Agricultural Science (`functional`) → Aquaculture & Forestry Managers → aquaculture harvesting manager
- **All current programme-domain links:** Agricultural Science [functional]; Animal Care, Grooming [functional]; Bioinformatics, Computational Biology [functional]; Biomedical [functional]; Crop Production, Horticulture [functional]; Forestry, Wildlife Management [functional]; Library, Archive [functional]; Livestock, Poultry, Dairy [functional]; Medical Laboratory Technology [functional]; Museum Curation, Cultural Heritage, Archives [functional]; Public Health [functional]; Scientific Research [functional]; Veterinary Science [functional]; Data Science [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `fd362376-690f-543f-a2f4-3af37fba38de`; school `c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`; offering `2b62cbf9-82ca-5810-8a4c-0cad1c005068`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-091 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Government and Public Administration` (`0a362341-64db-55d8-8d0d-9a94358708ef`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — identify the key conception political science such as politics, power, authority, influence, state, nation and many others, assess the nature, form and character of politics, list the contributions of the founding/leading scholars of political science; transferable — adequate skills and abilities for political analysis, sufficient knowledge for various types of political science research, deep knowledge of the workings of the public/civil service
- **UTME requirement text:** UTME SUBJECTS
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `ABSU` / `ABSU` (`0a0013b5-4b5a-5144-a156-8d2db266ce65`)
- **Offering row:** `709fef0a-b48a-5332-a076-b38db44de322`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Public Administration (`direct`) → Government & Elected Leadership → public administration manager
- **All current programme-domain links:** Public Administration [direct]; Accounting [functional]; Compliance, Regulation [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Criminology, Criminal Justice [functional]; Data Science [functional]; Diplomacy, International Relations [functional]; Economics [functional]; FinTech Engineering [functional]; General Management [functional]; Human Resources [functional]; Immigration Law, Asylum [functional]; Insurance [functional]; Investment Analysis [functional]; Legal Practice [functional]; Recruitment, Employment [functional]; Security Services [functional]; Social Sciences [functional]; Social Welfare, Youth Services [functional]; Tax Advisory, Transfer Pricing [functional]; Telecommunications [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `0a362341-64db-55d8-8d0d-9a94358708ef`; school `0a0013b5-4b5a-5144-a156-8d2db266ce65`; offering `709fef0a-b48a-5332-a076-b38db44de322`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-092 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Economics, Mathematics, Civic Education, Physics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Cooperative Management` (`76c513ab-eed3-5bc2-93b5-1455179f384c`)
- **Faculty / degree type:** Administration / B.Sc/B.A
- **Skills preview:** technical — demonstrate understanding of basic concepts related to management knowledge, exhibit knowledge of the roles, skills and functions of management, appreciate organisational problems and how managerial decisions are arrived at; and; transferable — Teaching skills for rural community development, Stakeholder analysis and management, Cooperative formation and administration
- **UTME requirement text:** Mathematics, Economics plus one (1) other subject.
- **O-level requirement text:** Five (5) SSC credit passes including English Language and Economics.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics, Economics plus one (1) other subject.; olevel: Five (5) SSC credit passes including English Language and Economics.
- **Selected university:** `NOUN` / `NOUN` (`4df9e055-3b05-5de1-925e-17c74753828b`)
- **Offering row:** `946df296-6439-55d1-9557-80f6b7ac8e4e`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Accounting (`functional`) → Professional Accounting & Audit → financial auditor
- **All current programme-domain links:** Accounting [functional]; Actuarial Science [functional]; Agricultural Science [functional]; Banking, Credit [functional]; Corporate Finance, Investment Banking [functional]; Credit Analysis, Structured Finance [functional]; Economics [functional]; FinTech Engineering [functional]; General Management [functional]; Insurance [functional]; Investment Analysis [functional]; Marketing, Brand [functional]; Real Estate [functional]; Social Sciences [functional]; Social Welfare, Youth Services [functional]; Trading [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `76c513ab-eed3-5bc2-93b5-1455179f384c`; school `4df9e055-3b05-5de1-925e-17c74753828b`; offering `946df296-6439-55d1-9557-80f6b7ac8e4e`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-093 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Economics, Government
- **O-level subjects to enter:** English Language, Mathematics, Biology, Chemistry, Physics
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Family, Nutrition and Consumer Sciences` (`2b7b1a52-eab8-5c10-9413-fe0aac2696d1`)
- **Faculty / degree type:** Agriculture / B.Agric
- **Skills preview:** technical — have a broad understanding of the concepts and dimensions of agriculture in modern times with emphasis on Nigeria and the tropics, acquire basic knowledge and understanding of the roles of agriculture and the place of soil, crop and animal resources in the production process as well as the constraints they face, be familiar with the role of technologies in the transformation of agriculture; and; transferable — identify possible sound patterns in English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Chemistry, Biology/Agriculture Science, Mathematics/Physics
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Mathematics, Chemistry, Biology, Physics and any one of the following: Fine Arts, Textile, Construction, Technical Drawing, Home Management, Food and Nutrition.
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AND CONSUMER` / `AND CONSUMER` (`9620f079-791a-57e7-9cd8-7243afbd4e10`)
- **Offering row:** `bd68eab0-0617-52c1-8a6f-f2c92deca126`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Economics (`functional`) → Teaching professionals → business economics researcher
- **All current programme-domain links:** Economics [functional]; Fashion, Textiles [functional]; Food Science [functional]; Marketing, Brand [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `2b7b1a52-eab8-5c10-9413-fe0aac2696d1`; school `9620f079-791a-57e7-9cd8-7243afbd4e10`; offering `bd68eab0-0617-52c1-8a6f-f2c92deca126`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-094 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `English Studies` (`0ab4a9d1-2314-5083-96cc-a504bbefcfef`)
- **Faculty / degree type:** Arts and Humanities / B.A
- **Skills preview:** technical — apply the basic conventions of English grammar to writing, employ the rudiments of grammar in sentence construction, identify tone marks and apply them; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** 67. and 68. Comparative 69. 70. 71. 72. 73. 74. and Yoruba 75. Linguistics 76. Literature OFFICIALLY RECEIVED HAVE BEEN APPROVED.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `needs_review`; structured options: `0`
- **Structured subject options:** None; use the published text state
- **Selected university:** `AAUA` / `AAUA` (`89224bf1-f265-5d8d-8994-83b751cf73e5`)
- **Offering row:** `e47979cf-e8c9-5e3a-ae11-7784e2c883b9`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Translation, Interpretation (`direct`) → Production and specialised services managers → translator
- **All current programme-domain links:** Translation, Interpretation [direct]; Higher Education [functional]; Journalism [functional]; Media Production [functional]; Recruitment, Employment [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `0ab4a9d1-2314-5083-96cc-a504bbefcfef`; school `89224bf1-f265-5d8d-8994-83b751cf73e5`; offering `e47979cf-e8c9-5e3a-ae11-7784e2c883b9`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-095 — school_owner · olevel-gap

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** Mathematics, Economics, Principles of Accounts, Commerce, English Language
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Business Education` (`24855e23-ce1c-56ee-9e46-ca07bc5b1805`)
- **Faculty / degree type:** Education / B.Ed
- **Skills preview:** technical — state the important roles of teaching as a profession, raise and judge some ethical issues in education, list the intellectual and practical competencies required by the teacher; transferable — identify possible sound patterns in the English Language, list notable Language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Economics, and one (1) of Literature in English, History, Government, Geography, Chemistry and Physics
- **O-level requirement text:** Five (5) TC II merit, 'O' Level or NTC/NBC credit passes including English Language, Mathematics, Economics and two (2) other subjects in the Social Sciences or Arts. For NBC, the other subjects could be from any of the following: Commerce, Office Practice, Principles of Accounts, Secretarial Duties, Typewriting and Shorthand.
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: Mathematics; Economics; and one (1) of Literature in English, History, Government, Geography, Chemistry and Physics
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `343f8467-08ad-574e-907c-4a8660014a5b`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Higher Education (`direct`) → Deans & School Principals → head of higher education institutions
- **All current programme-domain links:** Higher Education [direct]; Accounting [functional]; Banking, Credit [functional]; Economics [functional]; General Management [functional]; Human Resources [functional]; Insurance [functional]; Marketing, Brand [functional]; Office Administration, Secretarial [functional]; Payroll, Bookkeeping [functional]; Vocational [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `24855e23-ce1c-56ee-9e46-ca07bc5b1805`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `343f8467-08ad-574e-907c-4a8660014a5b`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-096 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Mathematics, Physics, Chemistry
- **O-level subjects to enter:** English Language, Mathematics, Chemistry, Physics, Civic Education
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Electronics Engineering` (`13c3de5e-8b09-5013-8a2d-95e089661af1`)
- **Faculty / degree type:** Engineering/Environmental/Technology / B.Eng/B.Tech
- **Skills preview:** technical — differentiate between science, engineering and technology, and relate them to innovation, distinguish between the different cadres of engineering – engineers, technologists, technicians and craftsmen and their respective roles and competencies, identify and distinguish between the relevant professional bodies in engineering; transferable — identify possible sound patterns in English Language, list notable language skills, classify word formation processes
- **UTME requirement text:** Mathematics, Physics, Chemistry
- **O-level requirement text:** Five (5) SSC credit passes to include Mathematics, Physics, Chemistry, English Language and any other Science subject.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Mathematics; Physics; Chemistry; olevel: Five (5) SSC credit passes to include Mathematics, Physics, Chemistry, English Language and any other Science subject.
- **Selected university:** `AUN` / `AUN` (`17b4d24b-dd48-5afd-bdc4-ea29f8111da5`)
- **Offering row:** `438e19f2-5441-5a40-b82a-563bf4eb57d0`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Electrical (`direct`) → no subgroup → medical device engineer
- **All current programme-domain links:** Electrical [direct]; Data Science [functional]; Electronics Servicing, ICT Equipment [functional]; Industrial Automation [functional]; Internet of Things [functional]; Renewable Energy Engineering [functional]; Robotics Engineering, Systems Design [functional]; Software Engineering [functional]; Telecommunications [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `13c3de5e-8b09-5013-8a2d-95e089661af1`; school `17b4d24b-dd48-5afd-bdc4-ea29f8111da5`; offering `438e19f2-5441-5a40-b82a-563bf4eb57d0`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-097 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Public and International Law` (`4a558a84-59f7-5496-b78e-59cce7c6d022`)
- **Faculty / degree type:** Law / LLB
- **Skills preview:** technical — discuss the aim of studying psychology, discuss and critically evaluate the schools of Psychology, discuss the historical antecedents to modern Psychology; transferable — Robust legal argument skills, Communication skills, Research and brief writing skills
- **UTME requirement text:** As in Civil Law
- **O-level requirement text:** As in Civil Law
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: As in Civil Law  [resolved: as in Civil Law]
- **Selected university:** `AAUA` / `AAUA` (`89224bf1-f265-5d8d-8994-83b751cf73e5`)
- **Offering row:** `ab439825-22ff-5055-a9a8-82866eccef37`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Legal Practice (`direct`) → Lawyers & Legal Advisers → judge
- **All current programme-domain links:** Legal Practice [direct]; Criminology, Criminal Justice [functional]; Public Administration [functional]; Social Sciences [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `4a558a84-59f7-5496-b78e-59cce7c6d022`; school `89224bf1-f265-5d8d-8994-83b751cf73e5`; offering `ab439825-22ff-5055-a9a8-82866eccef37`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-098 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Biology, Chemistry, Physics, Mathematics
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `Physiology` (`3797ef76-1301-5a1d-aaaf-1ae7d30a5935`)
- **Faculty / degree type:** Medical/Pharmaceutical/Health / Various
- **Skills preview:** technical — describe the composition of a cell membrane, explain how a potential difference across a membrane will influence the distribution of a cation and an anion, describe how transport rates of certain molecules and ions are accelerated by specific membrane transport proteins; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** Physics, Chemistry, Biology
- **O-level requirement text:** Five (5) SSC credit passes in English Language, Maths, Physics, Chemistry and Biology.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Physics; Chemistry; Biology; olevel: Five (5) SSC credit passes in English Language, Maths, Physics, Chemistry and Biology.
- **Selected university:** `AAU` / `AAU` (`929f28a0-ddd3-5a6a-8e8f-90942af20ac0`)
- **Offering row:** `b691e756-a065-5c39-af16-34f83ad67b41`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Biomedical (`direct`) → Computational & Life Science Research → pharmacologist
- **All current programme-domain links:** Biomedical [direct]; Bioinformatics, Computational Biology [functional]; Biomedical Engineering [functional]; Forensic Science, Digital Forensics [functional]; Medical Laboratory Technology [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `3797ef76-1301-5a1d-aaaf-1ae7d30a5935`; school `929f28a0-ddd3-5a6a-8e8f-90942af20ac0`; offering `b691e756-a065-5c39-af16-34f83ad67b41`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-099 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `combined`
- **UTME subjects to enter:** Use of English, Biology, Chemistry, Geography
- **O-level subjects to enter:** English Language, Mathematics, Civic Education, Physics, Chemistry
- **Subject expectation:** UTME and O-level state must be shown separately; eligibility only when both rules are satisfied
- **JAMB programme:** `Applied Geology` (`fdf7044f-eabf-5597-9bee-379cb6d2833d`)
- **Faculty / degree type:** Sciences / B.Sc/B.Tech
- **Skills preview:** technical — describe the structure and composition of the earth, identify the major minerals and rocks; and, recognise and explain driving forces within the earth and the manifestations; transferable — identify possible sound patterns in English language, list notable language skills, classify word formation processes
- **UTME requirement text:** three (3) of Chemistry, Physics, Mathematics, Biology and Geography.
- **O-level requirement text:** Unavailable
- **Requirement parse state:** `parsed`; structured options: `1`
- **Structured subject options:** utme: three (3) of Chemistry, Physics, Mathematics, Biology and Geography.
- **Selected university:** `BAUCHI` / `BAUCHI` (`c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`)
- **Offering row:** `944930ae-6e71-501d-a157-394ae7d80914`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Geospatial Science (`direct`) → no subgroup → mine surveyor
- **All current programme-domain links:** Geospatial Science [direct]; Climate Science, Meteorology [functional]; Land Surveying, Cadastral Mapping [functional]; Mining [functional]; Oil [functional]; Scientific Research [functional]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `fdf7044f-eabf-5597-9bee-379cb6d2833d`; school `c38500f7-3bb8-54e1-9eff-3cfa8cdbf28e`; offering `944930ae-6e71-501d-a157-394ae7d80914`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________

## MR-100 — school_owner · valid

- **Student context:** `SS2` / `Commercial`
- **Entry route:** `educator_institution` → `subjects` → admin guidance
- **Exam matching mode:** `olevel`
- **UTME subjects to enter:** Not used on this route
- **O-level subjects to enter:** English Language, Government, History, Mathematics, Civic Education
- **Subject expectation:** possible text match or no match; never label as fully eligible without a parsed O-level rule
- **JAMB programme:** `History and International Relations` (`4103d200-61b2-50bb-8e61-62bd3d94bdcd`)
- **Faculty / degree type:** Social/Management Sciences / B.Sc
- **Skills preview:** technical — identify the ancient ancestors of the contemporary international systems, list the chain of events and monumental changes that culminated in the emergence of the contemporary international system, trace and link the collapse of ancient political system in Europe, Asia, and Africa to the emergence of the contemporary international political system; transferable — teaching International Relations courses in universities and other tertiary institutions, working in foreign Affairs Ministry as diplomats, working as adviser to heads of states and governments
- **UTME requirement text:** Economics, Literature in English and Geography/Government/History.
- **O-level requirement text:** Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects.
- **Requirement parse state:** `parsed`; structured options: `2`
- **Structured subject options:** utme: Economics, Literature in English and Geography/Government/History.; olevel: Five (5) SSC credit passes to include English Language, Government or History and three (3) relevant subjects.
- **Selected university:** `AL-HIKMA` / `AL-HIKMA` (`54b4ad40-47a9-5b26-aab7-a65e0ba8e6fe`)
- **Offering row:** `90cfe2d3-0094-5653-a690-42e0036cc3e2`; address expectation: live registry address only; the current seed row does not contain address/city/state
- **Selected mapping path:** Diplomacy, International Relations (`direct`) → Ambassadors & Diplomats → ambassador
- **All current programme-domain links:** Diplomacy, International Relations [direct]; Compliance, Regulation [functional]; Criminology, Criminal Justice [functional]; Economics [functional]; General Management [functional]; Higher Education [functional]; Humanitarian Aid, Emergency Response [functional]; Immigration Law, Asylum [functional]; Journalism [functional]; Legal Practice [functional]; Library, Archive [functional]; Museum Curation, Cultural Heritage, Archives [functional]; Public Administration [functional]; Social Sciences [functional]; Translation, Interpretation [adjacent]
- **Manual checks:**
  - [ ] Search result uses the exact JAMB name and does not show a CCMAS discipline label.
  - [ ] Programme overview shows faculty, degree type, teaching/skills preview and the official requirement text without inventing missing data.
  - [ ] The selected university appears because a school-offering row links this school ID to this JAMB programme ID.
  - [ ] University address is shown only if returned by the live school row; otherwise the UI says it is unavailable.
  - [ ] The selected mapping type, subgroup and role match the current mapping and role registry IDs.
  - [ ] The report contains the selected path only and cannot print before programme, university and path are saved.
  - [ ] Manual entry creates a draft first, then a real account and claim code only after final generation.
  - [ ] The school owner sees the student context and never receives private progress merely because the account was created.
- **Report must include:** student name or honest fallback, class/stream when applicable, programme, university, requirements, selected domain/subgroup/role path
- **Report must exclude:** CCMAS discipline label, demand or salary data, unselected mapping branches, private notes without consent, direct entry for secondary-school display unless the route explicitly supports it
- **Source IDs:** JAMB `4103d200-61b2-50bb-8e61-62bd3d94bdcd`; school `54b4ad40-47a9-5b26-aab7-a65e0ba8e6fe`; offering `90cfe2d3-0094-5653-a690-42e0036cc3e2`
- **Review result:** [ ] Pass  [ ] Fail  [ ] Needs source/data correction  — Notes: ____________________
