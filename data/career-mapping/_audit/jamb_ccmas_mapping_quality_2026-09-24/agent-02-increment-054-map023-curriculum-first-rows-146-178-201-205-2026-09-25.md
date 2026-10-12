# MAP-023 — curriculum-first scope checkpoint for rows 146, 178, 201 and 205

**Date:** 2026-09-25  
**Mode:** research/checkpoint only. No shared mapping, scope, canonical/derived/active map, seed, SQL, labels, roles, or taxonomy files changed.  
**Sequence:** settle JAMB identity/source context and bounded CCMAS course scope first. Domain/subgroup/role remapping is deferred. Row 135 is out of scope.

## Current artifact inspection

The current `programme_mapping.json`, `jamb_curriculum_scopes_2026-08-17.json`, canonical inheritance bridge, and active `jamb_domain_map.json` all parse as valid JSON. Their rows 146, 178, 201 and 205 align by one-based `mappings`/`rows` order. The active map is derived from the canonical bridge; no separate row-level derived JSON was found. Current saved states are reviewed partial scopes, which overstate approval because source awarder/course schedules are not equivalently verified.

| Row | Exact canonical identity; parsed source context | Current primary CCMAS scope | Existing active links (review deferred) |
|---:|---|---|---|
| 146 | `COMPUTER SCIENCE AND MATHEMATICS`; Sciences; `Sciences.pdf`, parser row 53; institution tokens ADSU, NOVENA, PHC. Offering row and cells are still not marked visually verified in the local inventory. Official JAMB’s indexed Sciences table extract reproduces this exact label and three names; the live PDF still needs a recorded visual/table locator. | `Computing::Computer Science`; 11 selected courses: MTH 101, MTH 102, COS 101, MTH 201, COS 201, COS 202, IFT 212, SEN 201, CSC 322, CSC 401, CSC 402. The three MTH courses are real Mathematics outcomes, but are not a full Mathematics CCMAS path. | D001 Software Engineering; D003 AI; D005 Cloud Computing; D056 Blockchain; D140 Robotics Engineering/Systems Design. |
| 178 | `COMPUTER SCIENCE WITH MATHEMATICS`; Sciences; `Sciences.pdf`, parser row 99; OAU. Local occurrence remains without a verified PDF locator. Official OAU admissions and department/faculty sources independently confirm this exact combined award; JAMB’s Sciences catalogue separately lists the title. | Same 11-course partial Computing scope as row 146. OAU’s official undergraduate handbook confirms the programme exists, but the accessible handbook text calls itself a general guide and directs students to the current programme handbook for exact course details. | Same five links as row 146. |
| 201 | `Industrial Mathematics and Computer Science`; Sciences; `Sciences.pdf`, parser row 133; REDEEMERS. JAMB’s official indexed Sciences brochure extract lists “Industrial Mathematics and Computer Science — Redeemer’s” (printed p.493); local inventory still lacks a visual PDF table locator. Redeemer’s official admissions material confirms its award under the variant title “Industrial Mathematics with Computer Science,” but not a detailed course plan. | `Sciences::Industrial Mathematics`; 16 selected courses. Industrial Mathematics is substantive; CS appears through COS 101 and COS 201 only, plus IMT 303 Mathematical Computing. `IMT 320` is in the scope but its extracted outcomes are missing. | D003 AI; D014 Actuarial Science. |
| 205 | `Industral Mathematics/Computer` (retain source spelling); Sciences; `Sciences.pdf`, parser row 137; EBSU. The local row has EBSU, but no official JAMB visual locator. An older third-party brochure extraction gives the longer malformed title and EBSU (printed p.493); the official indexed JAMB extract shows the truncated fragment `INDUSTRAL` near EBSU, insufficient alone to resolve the full title. EBSU’s official current pages list Industrial Mathematics and Computer Science separately; no current combined award/course schedule was located. | `Sciences::Industrial Mathematics`; 15 selected courses: math/IMT content plus COS 101, COS 201 and IMT 303. This establishes computing-adjacent course content, not that the title means a full Computer Science programme. | D003 AI; D014 Actuarial Science. |

## NUC CCMAS course/outcome evidence and bounded recommendations

The following are **candidate scope recommendations**, not approved university course schedules and not changes to the shared scope. CCMAS is national curriculum evidence; it cannot by itself establish which optional/local courses a particular awarder places in a JAMB programme.

### Rows 146 and 178 — Computer Science + Mathematics

Current selected courses already include MTH 101 (sets/algebra/trigonometry), MTH 102 (calculus/functions/limits), and MTH 201 (real-valued functions, Taylor/mean-value methods and integrals). Do not call Mathematics absent. The material gap is that those three are embedded in the Computing parent and do not establish an adequate Mathematics learning path.

**Bounded additional Mathematics candidates** (Sciences CCMAS, standalone Mathematics course structure and outcomes):

| Candidate | CCMAS outcome evidence | Official NUC locator |
|---|---|---|
| MTH 103 — Elementary Mathematics III (Vectors, Geometry and Dynamics) | Vector operations; force/momentum; differentiation/integration of vectors. | Sciences CCMAS, Mathematics programme course structure, printed p.428; course/outcomes, printed p.432. |
| MTH 203 — Sets, Logic and Algebra I | Set problems, algebraic structures and mathematical logic; adds proof/discrete foundations beyond elementary algebra. | Mathematics course structure, printed p.428; course/outcomes around printed pp.433–434. |
| MTH 204 — Linear Algebra I | Vector spaces, linear transformations/matrix representation and matrix algebra. | Mathematics course structure, printed p.428; course/outcomes, printed p.435. |
| MTH 209 — Introduction to Numerical Analysis | Numerical solutions, curve fitting, error analysis, interpolation/approximation and numerical differentiation/integration. | Mathematics course structure, printed p.429; course/outcomes, printed p.436. |
| MTH 202 — Elementary Differential Equations | First/second-order linear and nonlinear differential equations and applications. | Mathematics course structure, printed p.428; course/outcomes around printed pp.432–433. |
| STA 112 — Probability I | Permutations/combinations, random variables, probability/distributions and exploratory data analysis. | Mathematics course structure, printed p.428; course/outcomes, printed p.432. |

**Recommended bounded proposal:** retain existing MTH 101/102/201 and consider MTH 103, MTH 203, MTH 204 and MTH 209 as a core additional math/equivalent-computational subset; treat MTH 202 and STA 112 as conditional extensions, not automatic requirements. This six-course total new candidate set is only a proposal, not a final course prescription. It samples distinct vectors, logic/algebra, linear algebra, numerical methods, differential equations and probability without copying the full 39-course Mathematics programme. Keep the proposed added set **held** until exact offering/course evidence is obtained for ADSU, NOVENA and PHC (row 146), and the current OAU course plan is verified for row 178. OAU’s programme page supports that both fields are taught and names calculus, linear algebra and statistics, but its general summary is not a course-by-course locator.

**CS course evidence already present:** COS 201/202 and SEN 201 substantiate basic programming/software lifecycle learning; CSC 401 substantiates algorithm analysis. The selected row scope does not include CSC 309 AI or course outcomes on cloud deployment/operations, blockchain/distributed ledgers, or robotics controls/integration. NUC Computing CCMAS places CSC 309 Artificial Intelligence and explicitly teaches AI fundamentals, agents, search and knowledge representation (printed pp.78–79); it is not in these rows’ selected scope. General programming does not substitute for those missing outcomes.

**Link disposition is deferred, with a narrow safety recommendation only:** do not remap any destination yet. Preserve D001 Software Engineering as the strongest clearly supported path from COS 201/202 + SEN 201. Recommend an immediate safety hold on D003 AI, D005 Cloud, D056 Blockchain and D140 Robotics for rows 146/178 because the selected course evidence does not establish those specialties. Revisit link tiers, student exposure, subgroup and role descendants only after the curriculum-scope decision. This is a safety disposition, not a completed taxonomy review.

### Row 201 — Industrial Mathematics and Computer Science (assess separately)

Current IMT scope has substantial mathematics: MTH 101/102/103/201/203/209, IMT 206/301/303/306/404/411 and related math. COS 101 and COS 201 show introductory computing and one programming course; IMT 303 Mathematical Computing is a computational-mathematics course, not a substitute for the CS sequence. The named JAMB title and Redeemer’s official offering evidence make a Computer Science learning facet a high-confidence candidate, but no awarder-specific full schedule was established.

**Bounded CS candidates for a later, held scope proposal:** COS 102 Problem Solving (algorithm development); COS 202 Computer Programming II (object-oriented solutions/modules/APIs); CSC 203 Discrete Structures (logic/proofs); CSC 301 Data Structures (implementation and algorithm use); CSC 401 Algorithms and Complexity Analysis (asymptotic time/space). These extend existing COS 101/COS 201 without adding the full Computing CCMAS package. Compare course codes and prerequisites with Redeemer’s current official course schedule before calling them programme-specific. Recover the original NUC source/outcome for IMT 320 before counting it as experiential learning.

Do not alter the current D003/D014 links in this curriculum-first pass. D003 AI lacks the dedicated CSC 309 AI outcome in the selected scope; flag it for a later safety/remapping decision. D014 Actuarial Science has a quantitative lead via IMT 301 Financial Mathematics, but calculus/financial mathematics alone does not prove actuarial probability, loss modelling, insurance valuation, or the destination roles; retain as unresolved rather than confirmed.

### Row 205 — EBSU “Industral Mathematics/Computer”

Do not normalize the spelling, insert “Science,” or merge with row 201. The EBSU official programme/department evidence currently presents Industrial Mathematics and Computer Science separately; an old JAMB extraction and current official JAMB search snippet preserve a malformed/truncated identity but do not settle whether it is a combined degree, an option, or an OCR/table continuation. The existing COS 101/COS 201/IMT 303 evidence supports only a bounded computing-adjacent facet within Industrial Mathematics. Keep any additional CS candidates held until the original JAMB table and current EBSU awarder schedule resolve the exact offering.

## Downstream link record: no remapping in this checkpoint

Rows 146/178 each currently have five links (D001, D003, D005, D056, D140); row 201/205 each have D003 and D014. The links and their subgroups/roles remain as-is in all shared artifacts. The four links D003/D005/D056/D140 on rows 146/178 are flagged for temporary student-safety hold because their selected-course anchors do not substantiate the named specialty. D001 is retained as the strongest supported Software Engineering path. Row 201/205 links are marked **later review**, not decided here; row 201’s D003 is a strong candidate for hold, while D014 requires a more specific actuarial course/task check.

## Exact unresolved evidence requests

1. Record a visual/table locator and accessed date from the official JAMB Sciences PDF for rows 146, 178, 201 and 205, including exact awarder cells; the local occurrence inventory currently has no verified institution codes or PDF locators for these four rows.
2. Obtain awarder-specific current course structure for ADSU, NOVENA and PHC for row 146; for OAU row 178 verify the current programme handbook (not just programme overview); for Redeemer’s row 201 compare its actual course schedule; and for EBSU row 205 establish whether the malformed JAMB name corresponds to an active combined programme or an extraction defect.
3. Keep proposed course additions as audit candidates until that context exists. No source here proves that every CCMAS candidate course is required by each university’s combined degree.

## Primary sources

- Official JAMB [Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf): indexed JAMB extract for row 146 names ADSU/NOVENA/PHC; row 201 appears as Industrial Mathematics and Computer Science — Redeemer’s in the Sciences table (printed p.493). Row 205’s full malformed wording remains unverified against the rendered official page.
- Official NUC [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf): COS 102 printed p.36; COS 201 around p.67; CSC 203 around p.39; CSC 309 pp.78–79. Course outcome claims above are checked against the official PDF and local course records.
- Official NUC [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf): Mathematics sequence and listed outcomes, printed pp.428–436; exact sections noted in the tables above.
- Official OAU [undergraduate programme handbook](https://cse.oauife.edu.ng/wp-content/uploads/2023/03/undergradute_handbook.pdf), [programme overview](https://cse.oauife.edu.ng/academics-2/), and [admissions list](https://oauife.edu.ng/admission-undergraduate-studies/).
- Official Redeemer’s [Post-UTME criteria](https://run.edu.ng/post-utme-criteria/) confirms its Industrial Mathematics with Computer Science award; no detailed course schedule was validated here.
- Official EBSU [Industrial Mathematics and Applied Statistics department](https://ebsu.edu.ng/department-of-industrial-mathematics-and-applied-statistics/) and [2026/27 screening list](https://ebsu.edu.ng/2026-2027-post-utme-application-screening/) show Industrial Mathematics and Computer Science separately; this is evidence of uncertainty, not proof that a historical/alternate combined JAMB offering never existed.

**Checkpoint status:** curriculum-first evidence and held candidate scopes recorded for four identities. No shared files changed; domain/subgroup/role remapping remains deferred.
