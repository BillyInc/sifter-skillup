# Rows 141–280: increment 003 — source/context and course-outcome audit for rows 145–146

Audit date: 2026-09-24  
Status: incremental evidence checkpoint; no canonical mapping, saved scope, seed, or UI edits.  
Lane: rows 141–280, continued from `agent-02-no-locator-batch-002-rows-246-253.md`.

## Queue boundary and counts

Recomputed directly from the saved scope rows 141–280 and sorted by `(mapping row, numeric domain ID)`:

- The tranche has 946 saved JAMB-to-domain links; 167 have no scope course-title locator.
- Of those 167, 78 are links in five combined scopes with zero selected courses and were handled in the combined-scope review. The remaining missing-locator queue is 89 links.
- Missing-locator batches 1 and 2 cover entries 1–50/89. Batch 1's corrected entry 25 is **246/D026** (not D165); batch 2 correctly starts at 246/D027 and ends at 253/D025.
- **Next batch: entries 51–75/89 (25 links)**, keys in order: 253/D026, D122, D123, D124, D135, D137, D145; 259/D027, D030, D041, D047, D063, D090, D119, D121; 262/D030, D041, D047, D063, D096, D118, D119, D121, D144; 263/D020.
- After entries 51–75, **14 links remain** (entries 76–89), so the missing-locator queue then takes one final partial batch. The overall 141–280 and 420-catalogue counts are not completion claims.

## JAMB source context: what the brochure evidence does and does not establish

The official JAMB Engineering/Environmental/Technology brochure prints one catalogue line, **“Computer Science with (Economics) (Mathematics)”**, on printed p. 336. The official JAMB Sciences brochure separately lists names including **Computer and Economics** and **Computer and Mathematics** on printed p. 452. These are evidence of distinct catalogue labels/faculty contexts, not proof that the two canonical rows are independent degree curricula or that an Engineering entry maps to either row's institution list.

The parsed Sciences offering file associates row 145 **COMPUTER SCIENCE WITH ECONOMICS** with CUAB, LCITY, OAU; it associates row 146 **COMPUTER SCIENCE AND MATHEMATICS** with ADSU, NOVENA, PHC. A later checked-in exhaustive subject audit lists eight row-146 institution names (ABSU, ADSU, CUAB, MAKURDI, MINNA, NDU, NOVENA, PHC), which conflicts with that three-institution parsed array and must be reconciled to the original university/programme table before treating either count as final. Row 146's parsed national requirements are Mathematics + Physics + one of Chemistry/Economics/Biology; O-level text requires English, Mathematics and three from Biology/Chemistry/Physics/Further Mathematics/Technical Drawing; its direct-entry rule and institution-specific exceptions are separate. Row 145's *offering JSON fields* for UTME/O-level/direct-entry are null, but this is not evidence that no rule was researched: checked-in source-rule and subject-audit artifacts record rules inherited/shared from “Sciences.pdf p184 r4” (and the exhaustive audit reports 3 schools). That inherited row-level text is not yet a primary-table, institution-specific confirmation for CUAB/LCITY/OAU. The raw Engineering offering file is a programme-name catalogue and contains no institution list for the parenthesized line. Do not transfer any institution, requirement, or full component union from that Engineering catalogue line into either canonical row without table-level evidence. OAU's official admission-requirements document lists both Computer Science with Mathematics and Computer Science with Economics as separate course names, establishing they coexist as names in OAU's official admission materials, but not resolving the current JAMB table's exact faculty/institution/requirement association.

Primary locators checked on 2026-09-24:

- JAMB Engineering/Environmental/Technology brochure, printed p. 336: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf — catalogue line only; no institution association visible in the parsed local engineering offering record.
- JAMB Sciences brochure, printed p. 452: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf — source catalogue has additional Computer and Economics / Computer and Mathematics variants; verify exact table row and requirements before treating as equivalent to the canonical names.
- Official OAU admission-requirements document, course rows for Computer Science with Mathematics and Computer Science with Economics: https://oauife.edu.ng/wp-content/uploads/2023/05/OAU-ILE-IFE-Admission-Requiremants-into-Part-1-and-DE-for-Faculties-1.pdf — institution-specific admissions evidence, not a substitute for the controlling JAMB table or CCMAS course evidence.
- Cross-checked local requirement artifacts: `docs/manual-review/jamb-brochure-source-rules-2026-08-19.md`, `complete-subject-requirement-classification-2026-08-18.md`, `jamb-subject-matching-exhaustive-audit-2026-09-14.md`, and `jamb-brochure-manual-extraction-handoff-2026-09-14.md`. They demonstrate that row 145 has inherited/shared Sciences rules despite null fields in the parsed offer record, and expose the row-146 three-vs-eight institution discrepancy. They are secondary audit/derived artifacts; exact source table cells and institution joins remain to be checked against the original JAMB brochure version/page.

## Row 145 — COMPUTER SCIENCE WITH ECONOMICS

**Confirmed defect:** current mapping is Computing (`COS`) only. The saved scope contains eight Computer Science courses and no `ECO` component/course. The current domain set has no Economics (`D063`) link. “Reviewed” / `ready_partial` does not cure the missing named Economics facet.

### Selected CCMAS course/outcome review

The eight selected courses were cross-checked against the checked-in NUC Computing CCMAS course records. Their stated outcomes cover: computing concepts and computer applications (COS 101); procedural programming (COS 201); object-oriented programming, APIs and problem-solving (COS 202); computer architecture and assembly-level concepts (IFT 212); software life cycle, requirements, design, testing and maintenance (SEN 201); innovation/business models and IT venture opportunities (CSC 322); algorithm analysis and complexity (CSC 401); and computing ethics/legal issues (CSC 402). This is a coherent CS foundation, but none is an Economics course or Economics learning outcome.

The separate NUC Social Sciences CCMAS Economics curriculum has 38 courses. Candidate—not yet approved—Economics course evidence includes:

- ECO 101 Principles of Economics I: scarcity, choice, supply/demand, elasticity, production and market structures.
- ECO 102 Principles of Economics II: national income, circular flow, consumption/saving/investment, money/foreign exchange and public revenue/expenditure.
- ECO 201 Introduction to Microeconomics I: individual/market demand and supply, consumer behaviour, production and costs.
- ECO 207 Mathematics for Economists: translate economic statements into mathematical form and solve/interpret models.

The minimum candidate slice should be chosen only after validating the exact JAMB offering contexts and course sequencing. It must not blindly attach all 38 Economics courses. The current omission of *any* Economics coursework is nonetheless a confirmed scope-coverage defect.

### Existing domain links and downstream implications

Current links are D140 Robotics Engineering/Systems Design (functional), D001 Software Engineering (direct), D056 Blockchain (functional), D009 Data Science (functional), D005 Cloud Computing (functional), D033 Product Management (functional), and D003 Artificial Intelligence (direct). The seven domain destination descriptions and role catalogues were inspected; their current downstream role populations are broad (respectively 20, 37, 25, 38, 17, 51, and 5 roles in `domain_structure.json`). The raw role count is not evidence that this JAMB offering prepares learners for all of them. The branch implications below are for audit; none changes the map:

| Link | Course-level result | Downstream consequence / disposition |
|---|---|---|
| D001 Software Engineering — direct | COS 201/202 and SEN 201 outcomes directly cover programming and software lifecycle work. | Strongest supported branch: constrain the student route to software-development/testing roles whose tasks are represented; the domain's cloud, SEO and disaster-recovery roles are not thereby implied. |
| D003 Artificial Intelligence — direct | The selected set omits CSC 309 Artificial Intelligence, the CCMAS course whose outcomes explicitly cover AI, intelligent agents, search, knowledge representation and NLP. Algorithms/programming are prerequisites, not proof of AI curriculum. | Direct status is unsupported for this partial scope. Do not display AI roles as a confirmed route absent a scoped AI course/outcome. |
| D005 Cloud Computing — functional | Programming and software concepts alone do not show cloud architecture, deployment, networking, distributed systems or operations outcomes. | Cloud route is not established by current selected courses; review/remove absent cloud-specific evidence. |
| D009 Data Science — functional | Programming/algorithms offer transferable prerequisites, but no selected statistics, data management, inference, modelling or analysis outcome is cited. | Data-science roles are not established. Add a bounded data-analysis facet only if the correct Economics/CS course outcomes support it. |
| D033 Product Management — functional | CSC 322 includes business models and venture opportunities, but that is not product discovery, requirements ownership, roadmap, user research or product delivery. | Existing link is weak; do not infer product-manager roles from an entrepreneurship/innovation course title. |
| D056 Blockchain — functional | General programming does not establish distributed ledgers, cryptography, consensus or smart-contract development. | Unsupported at current curriculum evidence; keep blockchain developer/security roles out of confirmed student paths. |
| D140 Robotics Engineering, Systems Design — functional | The cited SEN 201 course is software lifecycle/UML, not robotics, controls, mechanics, electronics, sensors or integrated robot systems. | Unsupported as a robotics path; role branches in controls/mechatronics/design have no course-level basis here. |
| D063 Economics — absent | No ECO courses are selected, despite Economics in the programme name and a separate Economics CCMAS. | Confirmed missing destination facet. Add only after the offering-specific Economics slice is adjudicated; appropriate Economics subgroup/roles must then be narrowed to evidenced economic analysis, policy, or research tasks. |

## Row 146 — COMPUTER SCIENCE AND MATHEMATICS

**Correction to prior imprecise concern:** mathematics is included; it must not be described as absent. The saved scope selects three mathematics courses within the Computing::Computer Science component: MTH 101 Elementary Mathematics I, MTH 102 Elementary Mathematics II, and MTH 201 Mathematical Methods I, plus the same eight CS courses listed for row 145. The selected Mathematics outcomes cover sets/algebra/trigonometry/quadratics, differentiation/integration and real-variable functions, and mathematical methods including functions, Taylor series and integrals. This is real mathematics evidence, not proof that the separate CCMAS Mathematics programme's broader curriculum is represented.

**Open component question:** inspect the standalone CCMAS Mathematics programme and JAMB institution contexts to determine whether those three courses sufficiently represent the named Mathematics component for these offerings, or whether a limited separate-MTH slice is needed. Do not claim a missing Mathematics component as settled, and do not combine the entire Mathematics curriculum by title alone.

The current downstream set is the same seven links as row 145. MTH 101/102/201 strengthen mathematical foundations but do not establish AI, cloud, blockchain or robotics career preparation; the CS-specific reasoning above still applies. D009 Data Science gains some mathematical basis, but no course-level statistical/data-analysis outcomes were cited, so the current functional career path remains unproven. D001 remains the most directly supported destination through programming/software lifecycle courses. There is no Economics link, and none should be inferred for row 146 simply because Economics is an optional subject in row 146's parsed UTME requirements.

## Primary curriculum references and source limits

- NUC Computing CCMAS 2023, official PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf. Cross-check selected course headings/outcomes (COS 101/201/202; IFT 212; SEN 201; CSC 322/401/402) and CSC 309 AI outcomes. Local extracted record: `data/career-mapping/ccmas/computing.json`, programme code COS. The local extraction has duplicated/normalized `skills_learned` strings in places; original CCMAS headings and outcomes govern.
- NUC Social Sciences CCMAS 2023, official PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf. Economics programme/course table at printed pp. 95–96 includes ECO 101/102/201/207; ECO 206 outcomes and ECO 207 outcomes/course content at printed pp. 102–103. These establish candidate Economics learning, not that every such course belongs in each JAMB compound offering.
- The official NUC PDFs and official JAMB brochure listings establish curriculum/course and catalogue facts respectively. They do not settle current university-specific course selections, the exact institution associations for the Engineering catalogue line, or the correctness of the broad downstream taxonomy. Keep those as open source-table checks.

## Remaining work in this assigned lane

1. Continue the next ordered 25-link missing-locator batch (253/D026 through 263/D020), checking full CCMAS outcomes and each destination branch; record source locators and dispositions.
2. Finish the 14-link final partial batch (entries 76–89/89).
3. Separately continue course/outcome and source-context audit across the rest of rows 141–280, including all linked domains for rows 145–146, and reconcile the remaining active-vs-saved type disagreements and 83 unreferenced CCMAS components. A row-specific note is not tranche completion.
4. Do not edit canonical maps/seeds. Keep confirmed defects distinct from candidate fixes and unresolved JAMB institution/table evidence.
