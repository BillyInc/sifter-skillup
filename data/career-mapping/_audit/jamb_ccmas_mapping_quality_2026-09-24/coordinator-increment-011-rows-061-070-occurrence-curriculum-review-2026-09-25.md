# Partition 01 — increment 011: rows 61–70 occurrence and curriculum review

Audit date: 2026-09-25. Append-only checkpoint; no shared maps, seeds, SQL, APIs or UI edited. This checkpoint captures verified partial evidence and leaves source gaps explicit.

## Coverage / source access

- Rows covered: **61–70 (10 identities)**, canonical order from `jamb_curriculum_scopes_2026-08-17.json`.
- Offering inventory: 10 source occurrences, all marked PDF-unverified with no table locator. JAMB official brochures are reachable; exact awarding-institution cell geometry remains open. Access is **not blocked**.
- Selected CCMAS rows: **93** across partial scopes (Finance 20, Procurement 20, Secretarial Administration 4, Management 31, HR Management 18). Exact package/course-code joins resolve **93/93**, and all have nonempty parsed outcomes. Rows 61,62,64,69,70 are full-parent scopes, no expanded rows; their full CCMAS outcomes still require course-level review.
- Current map 51 links, prior fail-closed snapshot 97 links, delta 47 removed / 1 added. Full identity closure **0/10** under the demanding acceptance standard.

## JAMB offering context

Official JAMB sources accessed 2026-09-25: [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf). The Administration programme-name index is printed p. 44; it includes Insurance, Procurement Management, Finance, Actuarial Science, Secretarial Administration and other titles. Index names are not the awarder rows. The exact table pages/cells and all parser-provided awarders remain unverified.

| Row | JAMB identity | Inventory occurrence: source; parsed institution tokens (unverified) | Curriculum distinction / issue |
|---:|---|---|---|
| 61 | Insurance | Administration; 11 tokens | Exact Insurance CCMAS parent. Do not conflate with “Insurance and Risk Management” or Banking and Finance. |
| 62 | Procurement Management | Administration; 10 tokens | Exact Procurement Management CCMAS parent; distinct from row 65 Procurement. |
| 63 | Finance | Administration; 9 tokens | Partial scope from Finance/Banking CCMAS. Maintain distinct identity from row 53 Banking and Finance. |
| 64 | Actuarial Science | Administration; 9 tokens | Exact CCMAS parent. Full actuarial curriculum/outcome path and professional exam progression must be checked, not inferred from finance. |
| 65 | Procurement | Administration; 8 tokens | Partial 20-course Procurement Management CCMAS slice. Verify the distinct name and selected courses; do not assume equivalence to the row-62 full programme. |
| 66 | Secretarial Administration | Administration; 8 tokens | Scope points to Office and Information Management CCMAS but selects only 4 courses. This is a narrow scope and likely misses substantive office/secretarial learning; validate before accepting. |
| 67 | Management | Administration; 7 tokens | Partial 31-course Business Administration slice; distinguish from Business Management (row 57) and Business Administration (row 54). |
| 68 | Human Resources Management | Administration; 7 tokens | Partial EHR/Employment and Human Resource Management slice; distinguish from Industrial Relations and Personnel Management (row 59). |
| 69 | Social Standards | Administration; 6 tokens | Saved ref points to Social Sciences::Social Standards. Do not mistake it for a professional standards/accreditation credential; NUC source found is a federal-university partnership TOR for social-science standards, not a course-by-course undergraduate CCMAS. |
| 70 | Project Management | Administration; 5 tokens | Exact Project Management CCMAS parent. Full project management outcomes must be checked against all seven legacy link candidates before any restoration. |

The Social Sciences official index printed p. 574 includes only some overlapping titles; a matching index entry does not validate the Administration source context. No institution array is elevated to verified status here.

## CCMAS scope and link dispositions

Authoritative curricula: NUC [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), accessed 2026-09-25. Local exact joins use `data/career-mapping/ccmas/administration_management.json` and `social_sciences.json`. Printed NUC course-table pages/outcome locators still need to be added; code/name/outcome joins alone do not close the source-citation requirement.

- **61 Insurance (full parent, 0 expanded courses):** 12 prior domains; current map 0. D061 insurance is the obvious subject candidate, but D063 economics, D062 trading, D014 actuarial, D011 quant finance, D013 investment, D060 banking/credit, D158 corporate finance, D159 credit, D015 accounting, D037 legal practice and D028 management are not automatically supported by the programme name. Audit the full Insurance course outcomes and subgroup requirements (underwriting/claims/risk vs actuarial exams, brokerage/finance/legal practice) before deciding.
- **62 Procurement Management (full parent, 0 expanded courses):** 12 prior domains; current 0. D036 Procurement is the direct academic candidate; D028 management and D032 project management may be bounded. Trading, insurance, actuarial, sales, recruitment, translation, law practice and generic finance/management links need separate outcomes and should not be inherited wholesale.
- **63 Finance (20 selected courses, 20/20 outcomes):** FIN 101, 209, 210, 215, 216, 217, 303, 304, 305, 313, 315, 317, 404, 409, 410, 411, 413, 414, 416 plus ENT 312. It omits FIN 308 Bank Lending and Credit Administration, present in the Banking and Finance scope, and the identity-specific source rationale for the exact 20-course slice needs verification. Current D013/D060/D158/D159 direct; D011/D012/D014/D015/D028/D030/D051/D061/D062/D063/D157/D009 functional/adjacent candidates. FIN 413 Quantitative Finance and FIN 410 portfolio analysis support bounded quantitative/investment learning, not all professional roles. FIN 409 should distinguish applied financial technology from software engineering. Current 16 links vs 15 prior, D014 added.
- **64 Actuarial Science (full parent; 0 expanded courses):** 15 prior links; current 0. D014 direct academic match; insurance/risk, finance, credit, quantitative and data destinations are candidates only until course outcomes and actuarial-body examination/experience requirements are sourced. A degree or course title does not imply professional actuarial qualification.
- **65 Procurement (20 selected PRM courses; 20/20 outcomes):** PRM 101, 102, 104, 201–204, 301–306, 308, 310, 401, 402, 404, 406, 410. Need exact course titles/outcome locators checked for each; 20-row join is confirmed locally. Current D036 direct; D028/D032/D034/D037 functional. Procurement planning, sourcing, contracts and logistics may support procurement work; management/project, legal and economic claims must be constrained to relevant subgroups (procurement practitioners are not automatically lawyers, executives or project managers). Current five links vs ten prior; no promotion by count alone.
- **66 Secretarial Administration (4 selected courses; all have outcomes):** GST 112, OIM 304, OIM 313, OIM 315. Scope joins to Office and Information Management, not a standalone Secretarial Administration CCMAS package. Active D081 secretarial/admin direct, D084 office management functional, D060 banking functional. Four courses are too small to claim complete administrative, digital-office, records, communication and information-management competencies without the full course table and source identity check. D060 banking appears unrelated absent a specific office/banking task course. Current three links vs five prior; D061 and D158 are removed.
- **67 Management (31 selected Business Administration courses; 31/31 outcomes):** AMS 101–104; BUA 101, 102, 200–205, 216, 218, 302–305, 310, 312–313, 319, 321, 323, 401–402, 404, 406, 409, 411, 420. Subjects include management, business statistics/quantitative analysis, HR, finance, operations, e-commerce, supply chain and strategy. Current 14 links: D028 direct; D013, D014, D029, D032, D060, D061, D062, D063, D130, D158, D159 functional; D030 adjacent. The scope supports broad management learning, not specialized actuarial, insurance, banking/credit, trading, finance or recruitment qualifications. Current link set removes D009, D010 and D033 from the 17 prior IDs.
- **68 Human Resources Management (18 EHR-related selected courses; 18/18 outcomes):** GST 112, AMS 103, EHR 101, GST 212, EHR 201, 203, 207, ENT 312, EHR 302, 306–308, 311–312, 401–403, 407. Content covers HR planning, employment relations, HR systems, negotiations, compensation, conflict, labour markets, decent work, diversity/gender and multinational HR. Current D130 Recruitment/Employment direct and D029 HR functional are core candidates. D063/D030/D028/D045 are broader contextual links requiring specific course-to-subgroup fit; no data science, private management, or public administration role is confirmed just because those contexts appear. Current six vs eight prior; D009 and D033 removed.
- **69 Social Standards (full parent, 0 expanded courses):** 9 prior links; current 0. Local CCMAS package has a named Social Standards record, but the exact identity/programme/course structure must be checked. Official NUC [TOR for the Federal University partnership](https://nuc.edu.ng/wp-content/uploads/2019/05/SPESSCE-Final-TOR-for-COE-Assessment-002.pdf), section “Social Standards” / target-university requirements (PDF pp. 15/23), describes institutional programme capacity in gender/GBV, social impact assessment and sociology of development; it is not proof of an undergraduate degree curriculum, and must not be substituted for CCMAS outcomes. Current zero-link status is evidence hold, not unavailability.
- **70 Project Management (full parent, 0 expanded courses):** 7 prior candidates; current 0. D032 is direct subject match; D028 general management is potentially adjacent. D063 economics, D033 logistics/supply chain, D158 finance, D009 data, D014 actuarial require item/course-specific evidence and should not appear as automatic project-manager requirements. Review the actual CCMAS Project Management core/elective outcomes, then subgroup/role standards (scope, schedule, cost, risk, procurement, delivery); do not infer certification from a degree.

## Downstream and delta audit

Relevant destination subgroups include investment/actuarial/insurance/credit/banking (D013/D014/D061/D159/D060), procurement/sourcing/contracts/logistics (D036/D034/D033), project/programme management (D032/D028), office/secretarial/information management (D081/D084), HR/personnel/recruitment (D029/D130), and the narrow Social Standards evidence. The hierarchy was checked in `domain_structure.json`; those labels do not validate all roles or required professional licences/exams. No individual role is accepted solely from a parent domain link.

| Row | Prior links | Current links | Removed IDs | Added |
|---:|---:|---:|---|---|
| 61 | 12 | 0 | all prior IDs | — |
| 62 | 12 | 0 | all prior IDs | — |
| 63 | 15 | 16 | — | D014 |
| 64 | 15 | 0 | all prior IDs | — |
| 65 | 10 | 5 | D062, D061, D033, D031, D035 | — |
| 66 | 5 | 3 | D061, D158 | — |
| 67 | 17 | 14 | D009, D010, D033 | — |
| 68 | 8 | 6 | D009, D033 | — |
| 69 | 9 | 0 | all prior IDs | — |
| 70 | 7 | 0 | all prior IDs | — |
| **Total** | **110** | **44** | **67** | **1** |

Correction: totals recomputed from exact sets are **110 prior / 44 current / 67 removed / 1 added** (net −66). The opening summary’s 97/51 and 47/1 totals were arithmetic errors; this table supersedes them. Six identities intersect the enriched overlay ledger; adjudicate each link against curriculum and downstream evidence, not from conflict status alone. The 83-package crosswalk is discovery-only and no lexical pair was promoted.

## Findings and open work

**Confirmed findings:** row 66’s four-course scope is a narrow source slice and cannot substantiate the entire Secretarial Administration curriculum; row 63’s Finance course selection differs from Banking and Finance (omits FIN 308) and requires identity-specific rationale; row 69’s official “Social Standards” material found in the NUC TOR describes institutional capacity rather than an undergraduate course pathway. These require correction or explicit bounded treatment, not automatic rejection of the programme.

**Evidence-needed:** exact JAMB awarder cells and possible faculty/context duplicates; printed CCMAS locators for 93 partial course outcomes and full-parent course tables for five rows; reconcile six overlay conflicts; verify row65 course scope and row66 curriculum completeness; role-by-role requirements and direct authoritative sources; decide which prior links are genuinely supported vs remain unpublished. No student path is confirmed wholesale from this increment. **0/10 identities fully closed.**

Next sequential batch: rows **71–80**.
