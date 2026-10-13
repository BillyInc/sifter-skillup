# Partition 02 — increment 021: rows 237–246 source/curriculum checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only audit artifact; no shared canonical map, scope, seed, or SQL edit.

## Coverage and acceptance status

- Identities checkpointed here: rows 237–246 (10/10); sequential checkpoints 217–246 = 30/140 identities.
- Offering inventory occurrence coverage: 10/10 identities have a parsed occurrence record. Parsed institution tokens remain unverified until exact JAMB brochure table locators/cells are checked.
- Selected course rows: 71 across the partial scopes (rows 237–242, 244); full-inheritance rows 243 and 246 have zero selected rows in this scope file, which does not mean their CCMAS curriculum is empty. Row 245 is a combined two-component scope awaiting reconciliation.
- Scope candidate links: 43; current fail-closed active links: 31; preserved prior snapshot: 78. No link is yet fully closed against every active descendant subgroup/role. Full identity closure: 0/10.
- `review_required` / zero active links: Biochemistry (243), Dentistry and Dental Technology (245), Human Nutrition and Dietetics (246). Those states are not proof of unavailability or a confirmed defect; they need package/link/candidate review.
- Source access: not blocked. NUC Computing, Allied Health, Basic Medical Sciences and Medicine/Dentistry references and JAMB Sciences PDF are reachable. Exact page/table geometry and downstream role-by-role work remain outstanding.
- Next sequential batch is rows 247–256. This checkpoint is not a claim that rows 237–246 are complete under the full standard.

## JAMB occurrence records (parser leads, not offering proof)

The inventory's institution lists are parser output and do not establish an official programme/institution association. One occurrence is recorded for each identity in the inventory snapshot used here.

| Row | Canonical JAMB identity | Occurrence ID / source file / faculty | Parsed institution tokens | Original PDF table/cell verified |
|---:|---|---|---:|---|
| 237 | Computer Science and Informatics | `ce86c517806e18b7`; Sciences / `Sciences.pdf` | 1 | No |
| 238 | Computing and Artificial Intelligence | `588a341dcad0e369`; Sciences / `Sciences.pdf` | 1 | No |
| 239 | Computer with Electronics | `d77b22f6aab0624d`; Sciences / `Sciences.pdf` | 1 | No |
| 240 | Software Engineering and Digital Entrepreneurship | `c608cbd99835522b`; Sciences / `Sciences.pdf` | 1 | No |
| 241 | Robotics (Artificial Intelligence) | `96a1212a7b167a0b`; Sciences / `Sciences.pdf` | 1 | No |
| 242 | Anatomy | `332ea42dd9d264de`; Medical/Pharmaceutical/Health / `medical.txt` | 82 | No; 82 parser tokens are not a list of verified offerings |
| 243 | Biochemistry | `57355f418b682d58`; Medical/Pharmaceutical/Health / `medical.txt` | 7 | No |
| 244 | Medical Biochemistry | `5a082206387f08d3`; Medical/Pharmaceutical/Health / `medical.txt` | 16 | No |
| 245 | Dentistry and Dental Technology | `eaa1a44d6d8be6af`; Medical/Pharmaceutical/Health / `medical.txt` | 33 | No |
| 246 | Human Nutrition and Dietetics | `e4e3825a4c40eb1b`; Medical/Pharmaceutical/Health / `medical.txt` | 34 | No |

Primary source checked (accessed 2026-09-25): [JAMB Degree Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf). Medical parsed text is an inventory lead; the original JAMB medical brochure page and every offering institution row must be separately located and verified before accepting the parser arrays.

## Component/course and domain disposition

### 237 — Computer Science and Informatics

- Component `Computing::Computer Science`; 8 selected courses: COS101, COS201/202, IFT212 Computer Architecture, SEN201 Intro Software Engineering, CSC322 innovation/new technologies, CSC401 Algorithms/Complexity, CSC402 Ethics/Legal Issues.
- NUC Computing CCMAS 2023: SEN201 course outcomes, printed p. 40, explicitly cover lifecycle and requirements/design/development/testing/maintenance; Computer Science course structure begins pp. 29–31, and official document lists learning outcomes by course.
- Links: D001 Software Engineering and D003 AI direct; D005 Cloud, D056 Blockchain, D140 Robotics/Systems Design functional. Active 5; prior 7.
- The scope supports core CS/programming/algorithms, with one software-engineering introductory course; D001 may be a supported learning bridge but not evidence for every software-role subgroup. AI, cloud, blockchain and robotics require their own courses/outcomes; do not equate one general CS program with all these specialisms. Descendants unreviewed.

### 238 — Computing and Artificial Intelligence

- Component `Computing::Computer Science`; 2 selected courses, COS101 Introduction to Computing Sciences and CSC309 Artificial Intelligence.
- NUC CSC309 outcomes, printed p. 77, cover AI fundamentals, concepts, techniques, branches, applications/tools and intelligent agents (course continues beyond the cited excerpt). This establishes an AI curriculum facet, not the full extent or all the subfields implied by an AI pathway.
- Link: D003 Artificial Intelligence direct; active 1 / prior 1.
- The exact JAMB offering title has a strong direct AI subject match, but a two-course slice is not evidence for a complete AI engineering/data science career path. Verify the full CCMAS course scope and AI subgroup/role requirements before confirming student guidance.

### 239 — Computer with Electronics

- Component `Computing::Computer Science`; same 8 selected courses as row 237, without electronics-specific course rows in this scope.
- NUC Computing CCMAS supports introductory computing and programming. The exact current component does not evidence the “Electronics” half of the JAMB title. No electronics/electrical-engineering component is selected.
- Links: D001 and D003 direct; D005, D056, D140 functional; active 5 / prior 7.
- **Confirmed named-facet gap in the saved scope:** electronic/electrical course evidence is absent despite the title. This is not yet proof the JAMB programme has no such courses; check its actual institutional curriculum/offering and any appropriate NUC component before changing canonical scope. Current CS courses do not confirm cloud, blockchain, AI specialization, or robotics descendants.

### 240 — Software Engineering and Digital Entrepreneurship

- Component `Computing::Software Engineering`; 9 selected courses: ENT211, SEN201, IFT211, ENT312, SEN304 Testing/QA, SEN306 Software Construction, SEN322 Software Engineering Innovation, SEN401 Configuration Management/Maintenance, SEN410 Software Architecture/Design.
- NUC Computing outcomes: SEN201 printed p. 40; SEN410 course section printed p. 222; courses explicitly cover lifecycle, test/QA, construction, configuration/maintenance and architecture. Entrepreneurship courses establish venture creation, but do not imply digital-product business, market validation, or technology commercialization without their specific outcomes.
- Links: D001 Software Engineering direct; D140 Robotics/Systems Design functional; D167 XR/Immersive adjacent. Active 3 / prior 5.
- Direct software-engineering fit has strong curriculum evidence. Robotics and XR are candidate transfer routes only: no robotics/real-time/control or immersive-development course is apparent in these 9 selected rows. “Digital Entrepreneurship” may warrant external, item-specific learning resources, but no separate digital-business roadmap has been verified here. Descendants remain open.

### 241 — Robotics (Artificial Intelligence)

- Component `Computing::Computer Science`; one selected course, CSC309 Artificial Intelligence.
- NUC CSC309 outcomes at printed p. 77 support AI fundamentals and intelligent-agent concepts, but the reviewed excerpt does not evidence robotics hardware, sensing, control, embedded systems, kinematics or integration.
- Link: D003 Artificial Intelligence direct; active 1 / prior 1.
- The title names Robotics as well as AI; this single AI course cannot substantiate a robotics engineering route. Treat the robotics facet as evidence-needed pending programme offering context and the actual robotics course sequence, not as a confirmed defect or route.

### 242 — Anatomy

- Component `Basic Medical Sciences::Human Anatomy`; 9 course rows: ANA201 limbs, ANA202 tissue histology, ANA204 thorax/abdomen/pelvis/perineum, ANA301 gross anatomy head/neck and a second ANA301 Neuroanatomy, ANA312 radiological anatomy/techniques, ANA307 entrepreneurship, ANA411 surface/living anatomy, ANA422 seminar.
- NUC Allied Health Sciences CCMAS ANA201 outcomes, printed pp. 44–45, address anatomical terminology, musculoskeletal structures, bones, muscles, joints, nerves, vessels and arteries; other courses require their individual outcome pages and code/duplicate reconciliation.
- Links: D027 Biomedical direct; D138 Biomedical Engineering, D142 Bioinformatics, D143 Forensic Science/Digital Forensics functional. Active 4 / prior 5.
- Anatomy directly supports anatomical-science study. It is not by itself a biomedical engineering degree, coding/bioinformatics preparation, or forensic-science qualification. D138/D142/D143 require specific applied course/task and descendant evidence. One selected course code/title collision (`ANA301` appears twice for distinct titles) requires source reconciliation.

### 243 — Biochemistry

- Component `Sciences::Biochemistry`; full CCMAS inheritance in scope file, but no selected rows. Current map is `review_required`, zero active links; prior snapshot had 11.
- NUC Sciences CCMAS contains a Biochemistry programme/course structure. The absence of selected rows here is a scope representation gap, not absence of the curriculum. Before candidate-link decisions, enumerate actual biochemistry courses/outcomes from the official source and reconcile them with stored component records.
- No active links to review in the current map. Previous links are not promoted just because the component exists. Candidate domains and any mapped roles remain unresolved pending full curriculum extraction and descendant semantics.

### 244 — Medical Biochemistry

- Component `Sciences::Biochemistry`; 11 selected courses BCH201/202/203, BCH301 Enzymology, BCH302 Carbohydrate Metabolism, BCH306 Analytical Methods, BCH307 Membrane Biochemistry, BCH309 Inorganic Biochemistry, BCH402 Molecular Biochemistry, BCH405 Plant Biochemistry, BCH408 entrepreneurship.
- This set covers biochemical mechanisms, analytical/practical and molecular facets; course outcomes and exact NUC locator for each row still need full verification.
- Only current link D055 Chemical Engineering functional (active 1 / prior 3).
- Medical naming does not make the degree clinical medicine or medical laboratory certification. D055 is not established by biochemical methods alone; process design/engineering outcomes are needed. Review whether “Medical Biochemistry” is an actual JAMB programme title/variant versus ordinary Biochemistry using the exact JAMB source offering.

### 245 — Dentistry and Dental Technology

- Two components: `Medicine and Dentistry::Bachelor of Dental Surgery (BDS/BChD)` and `Allied Health Sciences::Dental Technology`; `combined_scope_review_required`, zero selected rows.
- NUC Medicine/Dentistry and Allied Health CCMAS are distinct authoritative packages. Allied Health Dental Technology course evidence at printed pp. 107–110 and 124 includes dental materials, dental technology, oral anatomy/physiology, dental laboratory/prosthodontic techniques and professional limits. It supports dental-technologist preparation, not automatically the licensed dentist route. Confirm exact BDS course/outcome facts from NUC Medicine/Dentistry PDF before completing combined-scope matching.
- Current map `review_required`, zero links; prior map had 20. The two-part title makes a composite curriculum plausible, but no combined scope is yet proven. Do not restore 20 links wholesale or declare a defect until JAMB programme identity and components are checked.

### 246 — Human Nutrition and Dietetics

- Component `Allied Health Sciences::Human Nutrition and Dietetics`; full CCMAS inheritance in scope file, no selected rows. Current map `review_required`, zero active; prior snapshot 7.
- NUC Allied Health CCMAS overview/outcomes printed pp. 411–413 identify nutritional assessment, nutrition-programme planning/implementation/monitoring/evaluation, nutrition/dietetics practice, research, and clinical/public-health nutrition pathways. The course structure/outcomes must be extracted to identify exact learning items.
- No active link is confirmed yet. Enriched overlay claims D165 Wellness Coaching/Lifestyle Medicine (functional) from NUT101/201/202/301/302/303/304/305/399/401/402/403, and D048 Food Science (adjacent) using NUT504 Food Chemistry/Toxicology. These are overlay claims, not independently checked curriculum or descendant proof. Nutrition/dietetics directly supports its own professional curriculum; wellness-coaching boundary, independent dietitian practice requirements, and Food Science adjacency each need role-specific evidence. The overlay's claim is not a reason to conclude zero-link mapping is defective.

## Candidate vs confirmed status; map reconciliation

- No domain/subgroup/role path in these rows is accepted as confirmed student guidance at this checkpoint. All active links remain candidates pending every descendant check.
- Current/prior active-link counts: row 237 5/7; 238 1/1; 239 5/7; 240 3/5; 241 1/1; 242 4/5; 243 0/11; 244 1/3; 245 0/20; 246 0/7. The canonical candidates and prior overlay are not changed here.
- Current overlay-conflict ledger intersects rows 243 and 246. The 243 claims add D122 Medical Laboratory Technology and D048 Food Science; 246 claims D165 wellness coaching and D048 food science. The curriculum anchors are stored as file locators, not independent validated outcomes; role requirements and exact destination/source locators are still needed. Keep claims quarantined until that work is complete.
- No canonical edit or SQL/seed operation was made.

## Remaining work

For all ten: verify original JAMB printed page, institution column/row geometry and all distinct source occurrences; independently match every selected CCMAS course and outcome; resolve the named-component gaps/composite scopes (especially 239, 245); review each candidate domain tier plus every active subgroup/role; use external authoritative sources when CCMAS does not support the claimed task, with exact URL, section/page and access date. Continue sequentially at rows 247–256.

