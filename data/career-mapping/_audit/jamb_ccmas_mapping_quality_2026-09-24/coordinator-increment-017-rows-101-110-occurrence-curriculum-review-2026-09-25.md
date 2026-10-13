# Partition 01 — increment 017: JAMB/CCMAS rows 101–110

Audit date: 2026-09-25. **Individual append-only checkpoint** for rows 101–110. No canonical map, rollback snapshot, seed, SQL, API, UI, or other agent artifact changed. Row numbering is the 1-based order in the existing scope/inventory artifacts.

## Coverage and state reconciliation

- Identities reviewed: **10/10**. All source-offering occurrences in the coordinator inventory are marked `offering_row_verified_against_pdf: false`, with `pdf_table_locator: null`. The large parsed institution-token arrays are retained only as discovery leads; they are not accepted as institution/programme associations.
- Total source occurrences: **13** across two brochure faculties. Computer Science has Engineering and Sciences occurrences; Statistics has Engineering and Sciences occurrences; Software Engineering has Engineering and Sciences occurrences. Remaining identities have one Sciences occurrence each.
- Local scope: nine full-parent CCMAS scopes have **0 expanded selected-course rows** (this does not mean those CCMAS curricula lack courses). Cyber Security has **10 selected course rows**. All 10 selected course codes resolve to the local Computing CCMAS course corpus and all have populated learning-outcome arrays.
- Current active map compared with preserved pre-fail-closed snapshot:

| Row | Identity | Current state / active links | Prior candidate links | Overlay conflict |
|---:|---|---|---:|---|
| 101 | Computer Science | `review_required`, 0 | 8 | Yes |
| 102 | Chemistry | `ready`, 8 | 8 | No |
| 103 | Microbiology | `review_required`, 0 | 9 | Yes |
| 104 | Mathematics | `review_required`, 0 | 3 | Yes |
| 105 | PHYSICS | `ready`, 7 | 7 | No |
| 106 | BIOLOGY | `review_required`, 0 | 11 | Yes |
| 107 | CYBER SECURITY | `ready_partial`, 6 | 9 | No |
| 108 | Statistics | `review_required`, 0 | 4 | Yes |
| 109 | Software Engineering | `review_required`, 0 | 13 | Yes |
| 110 | PHYSICS WITH ELECTRONICS | `review_required`, 0 | 10 | Yes |

Seven overlay conflicts are quarantined. For example, the Computer Science overlay claims D002/D009/D033, while the canonical candidate set contains D001/D003/D005/D056/D140. This difference is a reconciliation question, **not by itself proof that either side is wrong**. The current status/counts are from `jamb_domain_map.json`; the old link counts are from the preserved before-fail-closed snapshot and remain candidates, not truth.

## Offering-source locators and occurrence context

Official JAMB primary sources accessed 2026-09-25: [Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf) and [Engineering/Environmental/Technology degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf). Searchable title-index locators are Sciences printed p. **452** and Engineering printed p. **336**. The Engineering brochure’s extracted Computer Science table passage names BELLS, CRAWFORD, FEDPOADO-D, MINNA, OFFA-DEG and RENAISSANCE, followed by Cyber Security Science at MINNA; this is useful row discovery, but table geometry and exact page/association still need PDF verification. The indexes are not awarder rows.

| Row | JAMB identity | Inventory occurrence(s) | What remains unverified |
|---:|---|---|---|
| 101 | Computer Science | Engineering `engineering.txt` parsed row 8; Sciences `sciences.txt` row 1 | Both source-faculty rows and every parsed institution token; distinct occurrence IDs must be retained. |
| 102 | Chemistry | Sciences row 2 | Awarder cell(s), exact page and boundaries. |
| 103 | Microbiology | Sciences row 3 | Awarder cell(s), exact page and boundaries. |
| 104 | Mathematics | Sciences row 4 | Awarder cell(s), exact page and boundaries. |
| 105 | PHYSICS | Sciences row 5 | Awarder cell(s), exact page and boundaries. |
| 106 | BIOLOGY | Sciences row 6 | Awarder cell(s), exact page and boundaries. |
| 107 | CYBER SECURITY | Sciences row 7 | Awarder cell(s), exact page and boundaries; do not merge with Computer Science’s separate “Cyber Security Science” text without verification. |
| 108 | Statistics | Engineering row 15; Sciences row 8 | Both source-faculty rows, awarder cell(s), exact pages and boundaries. |
| 109 | Software Engineering | Engineering row 21; Sciences row 9 | Both source-faculty rows, awarder cell(s), exact pages and boundaries. |
| 110 | PHYSICS WITH ELECTRONICS | Sciences row 10 | Awarder cell(s), exact page and boundaries; index entries “Physics/Electronics” are not proof of an exact title equivalence. |

The JAMB search result also states that programmes advertised in the brochure were received from institutions and deemed approved. That general statement does not validate any parser-token association. Source access is not blocked; PDF row-cell verification is open.

## Curriculum and link evidence

Primary NUC curriculum sources accessed 2026-09-25: [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf) and [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf). The local extracted curriculum files are `data/career-mapping/ccmas/computing.json` and `data/career-mapping/ccmas/sciences.json`.

- Rows 101, 102, 103, 104, 105, 106, 108, 109 and 110 resolve respectively to full-parent Computer Science, Chemistry, Microbiology, Mathematics, Physics, Biology, Statistics, Software Engineering and Physics with Electronics CCMAS references. The local source corpus has 39 Computer Science courses, 42 Chemistry, 35 Microbiology, 39 Mathematics, 35 Physics, 37 Biology, 29 Statistics, 38 Software Engineering and 25 Physics-with-Electronics courses; most have learning-outcome arrays (Mathematics has 37/39). Since these are full-parent scopes, the scope file expands none of those courses row-by-row. **This tranche has not yet reconciled each full course/outcome or an identity-specific JAMB offering to destination subgroups/roles; these nine identities are not closed.**
- Row 107 `CYBER SECURITY` selects CYB 201, 203, 302, 303, 304, 322, 403, 404, 406 and 498; all 10 resolve, and all have local outcomes. The official Computing CCMAS search extraction provides the exact course locator `Cyber Security → CYB 201: Introduction to Cybersecurity and Strategy` and outcomes covering cyber threats, detection/defence, incident countermeasures, privacy/business/government effects and professional ethics. Treat those outcomes as programme-learning evidence, not proof of a particular job path.
- Row 107 current links are D004 Cybersecurity (direct), D002 Data Engineering (functional), D003 Artificial Intelligence (functional), D005 Cloud Computing (functional), D077 Security Services (adjacent), and D151 Criminology/Criminal Justice (functional). Scope anchors are thin for some: D002 is tied only to Cloud Computing Security; D003 to biometrics, big-data security and the final project; D005 only to Cloud Computing Security; D151 only to Cybersecurity Risks Analysis. These anchors require course-outcome-to-subgroup/role review before any student-facing path is accepted. In particular, an adjacent security-services link does not establish policing or operational-security roles, and a biometrics course alone does not establish an AI career route.
- Current Chemistry links span Scientific Research, Nanotechnology/Advanced Materials, Quantum Computing, Environmental Engineering, Biomedical, Chemical Engineering, Pharmacy and Medical Laboratory Technology. Current Physics links span Electrical Engineering, Renewable Energy Engineering, Electrical Installation/Wiring, Mechanical Engineering, Scientific Research, Space Technology and Nanotechnology/Advanced Materials. Their current `ready` labels do not replace item/course-specific descendant checks. Retain none as newly verified student routes in this tranche; assess each against exact CCMAS outcomes and active child taxonomy.
- Six overlay-held rows (Computer Science, Microbiology, Mathematics, Biology, Statistics, Software Engineering, Physics with Electronics—**seven** in total) remain at zero active links. Each exact conflict must be reconciled using course outcomes and relevant descendants; no IDs are restored merely from overlay claims. The conflict ledger records missing-vs-canonical IDs and must be read row-wise.

## Confirmed findings vs evidence-needed

**Confirmed:** three identities (Computer Science, Statistics, Software Engineering) have distinct Engineering and Sciences occurrences that must not be collapsed; the inventory preserves both, but none is yet PDF-verified. The nine full-parent rows have no row-expanded course/outcome evidence in the scope ledger, despite full curricula existing locally. Cyber Security’s six current domain links rely on course anchors of uneven breadth as itemized above; domain IDs alone do not prove student-appropriate subgroup/role fit.

**Evidence-needed, not established defect:** whether parsed institutional arrays match actual JAMB table cells; whether the dual-faculty occurrences represent overlapping or distinct institutional offerings; the relevance/strength of each disputed link; all role-level fit; full-course domain link boundaries for the nine parent scopes; and whether the seven overlay link conflicts should amend canonical candidates or be removed/downgraded. None is classified defective solely because link IDs differ.

**Acceptance status:** 0/10 identities fully closed under source-offering + course/outcome + every-link + descendant-fit criteria. No student path from this tranche is newly confirmed. Next concrete step: visually inspect the official JAMB PDF table pages for the 13 occurrences, then audit the Cyber Security links (D004, D002, D003, D005, D077, D151) against their actual subgroups/roles and reconcile seven overlay rows. Continue with rows 111–120 only after this checkpoint is saved.
