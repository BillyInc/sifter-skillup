# Partition 01 comprehensive re-review checkpoint 028 — rows 011–020

Audit date: 2026-09-25. Append-only checkpoint. No canonical map, scope, seed, SQL, API, or UI edits. Row numbers are the one-based mapping order in `programme_mapping.json`.

## Sources, occurrence IDs, and remaining source uncertainty

The occurrence-preserving inventory is `data/career-mapping/_audit/jamb_offering_context_inventory_2026-09-25.json`. The token arrays listed below are **parsed leads only**: the coordinator flags every occurrence `offering_row_verified_against_pdf=false`, with no table locator. They do not establish award institutions or table-cell membership. The JAMB Social Sciences brochure’s catalogue/index includes the names, but the institution cells for these ten occurrences have not been visually confirmed. Keep faculty/title occurrence provenance separate and do not promote the token arrays as official school lists.

| Row | JAMB identity | Context ID and parsed source occurrence | Parsed institution token(s), not PDF-verified |
|---:|---|---|---|
| 11 | Demography and Statistics | `379c09cfe9db4fbc` — Social/Management Sciences, `Social Management Science.pdf` | GOUU |
| 12 | Demography and Social Studies | `d783d9c7083f38cf` — Social/Management Sciences, same file | UDU |
| 13 | Population Studies | `182417fed54d45a1` — Social/Management Sciences, same file | JABU |
| 14 | Economics and Statistics | `197ce7c291a751df` — Social/Management Sciences, same file | BENIN |
| 15 | Economics and Development Studies | `774dfb0b353bfc6c` — Social/Management Sciences, same file | EL-AMIN, HAVILLA |
| 16 | Economics with/and Operation Research | `f5cff793fe2ef68e` — Social/Management Sciences, same file | CUAB |
| 17 | Peace and Development Studies | `31d51312912e52ba` — Social/Management Sciences, same file | SALEM, NOUN |
| 18 | Industrial Relations / Industrial and Labour Relations | `54d882d6854e33d6` — Social/Management Sciences, same file | COVENANT, AAUA, OOU |
| 19 | Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management | `8f8cbbeedbf4c406` — Social/Management Sciences, same file | AJAYI, BENIN, DOU, KOMU, RITMAN, UNI-AFRICA |
| 20 | Intelligence and Security Studies | `d02b97218b9fca3f` — Social/Management Sciences, same file | ABUAD, EKSU, NDA, NOVENA |

The full parsed arrays, stable IDs and source filenames are retained in the inventory JSON. For all ten, the exact JAMB programme table row/institution cells remain evidence-needed.

## Current-map reconciliation

Compared the live `data/career-mapping/jamb_domain_map.json` with `data/career-mapping/_audit/jamb_domain_map_before_fail_closed_2026-09-25.json`; the latter is only a before-snapshot. No row 11–20 entry intersects the current Nigerian overlay conflict list.

| Row | Current active map | Before-snapshot links no longer active | Current semantic decision |
|---:|---|---|---|
| 11 | D009, D063, D072, D078, D130 — all functional | D014, D045, D041 | Keep D078; keep D072 with restricted geospatial subgroup; keep D009 only for statistical/computational-analysis subgroup(s); downgrade D063 to adjacent economic-data context; remove D130 as a recruitment/HR path. D014 is not supported as actuarial training; D045 is not supported as broad public administration. D041 is at most a restricted quantitative-research candidate; no broad scientific/lab route. |
| 12 | Same five as row 11 | D014, D045, D041 | Same as row 11; the Demography and Social Studies course slice is broader because it adds sociology/social-science methods and health-related outcomes, but does not establish HR, actuarial or general PA roles. |
| 13 | Same five as row 11 | D014, D045, D041 | Same as row 11; population studies remains distinct from the Demography-and-Statistics / Demography-and-Social-Studies identities. |
| 14 | **0**; `review_required` | 19 broad prior links: D063, D062, D013, D078, D158, D157, D060, D159, D061, D014, D015, D030, D028, D045, D009, D012, D001, D002, D003 | No link is restored: combined CCMAS refs Economics + Statistics have **zero selected courses**. Neither direct D063 nor quantitative/data/finance/software claims can be decided from component names alone. This is a confirmed incomplete-scope/closure gate, not proof the combined degree lacks those subjects. |
| 15 | **0**; `review_required` | 21 broad prior links: D063, D062, D013, D078, D158, D157, D060, D159, D061, D014, D015, D030, D028, D045, D009, D149, D130, D128, D161, D038, D032 | No link is restored: Economics + Development Studies refs have zero selected courses. The candidate unions do not substantiate international relations, fintech, banking, marketing, tax, HR, or the other links. Course/outcome bridge must be made explicit before any tier decision. |
| 16 | **0**; `review_required` | 18 broad prior links: D063, D062, D013, D078, D158, D157, D060, D159, D061, D014, D015, D030, D028, D045, D009, D001, D012, D003 | No link is restored: Economics + Industrial Mathematics refs have zero selected courses. The NUC Industrial Mathematics package does include IMT 306 Introduction to Operations Research, whose outcomes require formulating/expanding models and choosing/evaluating solution methods; that is a strong component-level lead for the named OR facet, **not evidence that this JAMB offering inherits that course or the whole package**. Add an explicitly scoped course/outcome bridge only after JAMB offering/curriculum context is confirmed. |
| 17 | **0**; `review_required` | 14 broad prior links: D063, D149, D078, D060, D130, D128, D161, D028, D038, D032, D151, D037, D045, D064 | No link is restored: Development Studies + Peace Studies/Conflict Resolution refs have zero selected courses. NUC contains relevant Development and Peace curricula, but the map has no row-specific course union/tier anchors. No police, legal, diplomatic, public-administration, or other role path is confirmed by the component names. |
| 18 | D130 direct; D063/D029/D030/D028/D045 functional | D009 and D033 | Keep D130 direct. Upgrade D029 Human Resources from functional to a **direct candidate** because the scoped HR/Employment Relations courses are core to the identity; EHR 101/102, 301/303/305, 309, 311, 401/402/403/407 cover HR, employment relations, bargaining, compensation, labour-market analysis, HRIS and strategy. D063 is at most adjacent labour-market context; D030 marketing, D009 data science and D033 product management have no matching outcome and remain excluded. D028 is adjacent organization/management context only. D045 is at most adjacent here; this 14-course slice has no Public Sector HRM course. |
| 19 | D130 direct; D063/D029/D030/D028/D045 functional | D009 and D033 | Keep D130 direct; D029 should be a **direct candidate** as the named curriculum covers HR planning/administration, public-sector HR, unions, HR development, compensation, HRIS and strategic HR. D063 remains adjacent labour-market/economic context; D030 marketing, D009 data science and D033 product management remain excluded. D028 is adjacent organization/management context. D045 may be considered only as a narrow public-sector HR interface due EHR 207, not a broad PA career path. |
| 20 | D151/D077 direct; D063/D078/D037/D028 functional; status `ready_external` | D045 | Keep D151 direct (criminology/criminal justice courses) and D077 direct (security/intelligence/investigation courses). D078 is functional only for social research/quantitative subgroups. D063 should be adjacent only; the external-scope selection has no economics course/outcome. D037 should be adjacent justice-system context, not legal practice. D028 lacks general management outcomes and should be removed from confirmed links. D045 is a candidate restore only for policy/programme subgroup review, based on CSS 402/406 security governance/policy—not a broad Public Administration path. The custom course union itself is not yet externally validated as a degree curriculum. |

Current map status labels (`ready_partial`, `review_required`, `ready_external`) do not replace this evidence review. Row 14–17 zero-link `review_required` is appropriate fail-closed behavior while the named combined scopes lack a selected course union.

## Curriculum/outcome review and descendant subgroup limits

### Rows 11–13 — Demography/Population variants

All three point to `Social Sciences::Demography and Social Statistics`, with 20, 26 and 18 selected courses respectively. Representative source outcomes include DSS 101/103 population concepts and quantitative basics; DSS 203 sources/uses of social and economic statistics; DSS 301 population rates; DSS 303 demographic statistics; DSS 304 software-supported demographic analysis; DSS 305/306 social investigation and data collection/analysis; DSS 307/308 labour-force measures/projections; DSS 309 population/cartography/GIS; DSS 404 population policies; DSS 405/406 advanced social statistics. Row 12 adds social-science/sociology/research-method and sexual/reproductive-health courses; row 13 has its own narrower set. These are not interchangeable identity aliases.

- **D078 Social Sciences — functional (retain, subgroup-limited):** its active subgroups are Computational Social Science & Quantitative Methods and Social & Economic Research. The social research/statistics/population curriculum supports these fields, but not every listed sociologist, policy, or public-service role.
- **D009 Data Science — functional only for applied statistics / statistical operations:** DSS 304 and DSS 405/406 support data analysis, statistical methods and computing. They do not teach a data-engineering, machine-learning or AI-engineering route. Do not show D009 Data & AI Engineers as a confirmed student destination.
- **D072 Geospatial Science — functional subgroup candidate:** DSS 309 explicitly covers population mapping, EAD maps and GIS components/operations. This supports Geospatial Data & Spatial Analysis as a domain/subgroup context; no specific GIS specialist or surveyor role is yet verified.
- **D063 Economics — downgrade functional to adjacent:** social/economic statistics and labour-market measures provide economic-data context, not the full economic theory/policy outcomes expected by Economic Policy & Analysis or Economic Research roles.
- **D130 Recruitment, Employment — remove from confirmed student path:** labour-force measurement is population statistics, not recruiting, employment-service operations, HR/talent acquisition or staffing practice.
- Removed D014/D045/D041: D014 lacks insurance mathematics/actuarial valuation; D045 is not established by population statistics alone (DSS 308 labour/pension planning is a narrow policy-adjacent clue); D041 can be reconsidered only for an appropriately scoped quantitative-research subgroup, not lab/field technicians.

### Rows 14–17 — combined scopes with no course union

The actual component CCMAS source programmes exist, but `jamb_curriculum_scopes_2026-08-17.json` has zero selected courses for each combined JAMB row. The component reference list is not proof every candidate course belongs to the JAMB offering. NUC Social Sciences CCMAS confirms separate Economics, Development Studies and Peace Studies/Conflict Resolution programmes. NUC Sciences CCMAS confirms Industrial Mathematics includes IMT 306 Introduction to Operations Research (course table printed p. 326; learning outcomes printed p. 339). These sources make component-level course discovery possible but do not close the JAMB identity-specific union.

All previously active IDs listed in the map-delta table remain **unresolved candidates**, not confirmed defects and not restored. The main concrete correction required is to build row-specific course/outcome unions before deciding direct/functional/adjacent. For row 16, explicitly inspect IMT 306 and relevant Economics mathematics/econometrics courses; for row 17, inspect the Development Studies and Peace Studies/Conflict Resolution courses together, not a lexical title match.

### Rows 18–19 — Industrial Relations / Personnel / HR

CCMAS scope is `Administration and Management::Employment and Human Resource Management`, with 14 and 27 selected courses. NUC course outcomes support actual HR/employment tasks: EHR 301 collective bargaining and negotiation; EHR 309 labour-market analysis; EHR 311 HR information systems/e-recruitment/personnel records; row 19 additionally includes EHR 201 HR planning, EHR 203 unions, EHR 207 Public Sector HRM, EHR 302 HR development, EHR 305 compensation/benefits, EHR 401 strategic HR. This is positive scope evidence for direct HR and recruitment/employment domains.

- D029 subgroups People & Culture Leadership, HR & Talent Advisory, and clerical support are relevant; only the HR/employee-relations subgroups have course fit. Candidate roles include HR officer/specialist, employee-relations/labour-relations roles and compensation/benefits functions; confirm role requirements and avoid broad management roles.
- D130 recruitment/employment is direct at the domain level. EHR 311 specifically includes e-recruitment, but this alone does not establish every employment agent or recruiter role.
- D063 fits labour-market/economic context only. D028 general-management and D045 public-administration domain-level links are too broad; row 19's Public Sector HRM allows only a narrow adjacent public-sector HR interface. The 2026-09-25 map correctly removes D009 and D033: HRIS is not a Data Science or Product Management curriculum.

### Row 20 — Intelligence and Security Studies, custom scope

The 18-course custom scope combines selected CSS, DSS, IRS, POL, PCR and PSY rows. It is not a standalone CCMAS degree curriculum and must not imply that the full component programmes are jointly completed. `data/career-mapping/TYPE_D_SOURCES.md` states that the Nigerian Defence Academy handbook is needed for its itemized course list; ABUAD curriculum was inaccessible to the existing parser; NISS is an executive professional course, not a substitute for an undergraduate course list. These are source leads, not completed external verification.

- D151 and D077 direct remain strong domain-level candidates from criminal justice, security, investigation/intelligence, governance and internship courses.
- D078 fits social-research/quantitative subgroups only.
- D063 economics and D037 legal-practice labels overstate the selected custom bundle; downgrade to adjacent or remove from confirmed student routes.
- D028 has no general-management course/outcome anchor; remove from confirmed routes.
- D045 Public Administration can be assessed as a narrowly scoped policy/programme candidate from CSS 402/406 (security-sector governance and national-security policy/strategy); no broad PA or government-leadership role is established.
- No analyst/intelligence-officer, investigator, police, diplomat, or public-administration role is individually approved without task/eligibility/practice evidence. Do not present job readiness from the custom CCMAS-derived course collection.

## Reverse component-inventory crosswalk disposition

The 83-package reverse inventory is a discovery aid only. Intersections for this batch include:

- `Education::Social Studies and Civic Education` vs **Demography and Social Studies**: lexical/normalized proximity is not a curriculum match. This JAMB scope is Social Sciences demography/statistics with population, census, survey, data and demographic methods; no teacher-education/pedagogy package is declared. Do not add Education::Social Studies as a component.
- `Education::Sustainable Development Studies` vs **Economics and Development Studies** and **Peace and Development Studies**: words overlap, but NUC Social Sciences curricula cover socio-economic development or peace/conflict, not the Education programme's sustainable-development teacher preparation. Do not map these Education packages by title.
- `Social Sciences::Petroleum Economics and Policy Studies` vs **Economics and Development Studies**: the similar Economics/Policy words are not equivalence. The candidate has oil/gas economics and sector policy, which the JAMB identity does not name; do not attach it absent item-level curriculum evidence.
- `Social Sciences::Politics, Philosophy and Economics (PPE)` vs **Economics and Statistics**: a partial “Economics” lexical hit does not supply Statistics or establish PPE curriculum. No component map from lexical similarity.

No reverse-inventory lexical candidate in this batch is promoted to a course/component mapping.

## Sources and exact locators (accessed 2026-09-25)

- JAMB IBASS, [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 574 programme-name index. It confirms names/catalogue context, not the parsed school cells; the occurrence inventory still has no PDF row locators.
- NUC, [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf): Demography and Social Statistics overview/objectives printed p. 46, course structures pp. 48–50, DSS 304 outcomes p. 60, DSS 309 p. 62, labour force and statistics/policy outcomes pp. 61–65; Development Studies overview/objectives pp. 69–70 and courses/outcomes pp. 71–74; Economics overview/course outcomes pp. 93–107; Peace Studies and Conflict Resolution overview/objectives and employability/course structure pp. 160–164.
- NUC, [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf): Industrial Mathematics course table printed p. 326 and IMT 306 Introduction to Operations Research outcomes printed p. 339.
- NUC, [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf): Employment and Human Resource Management course table printed p. 186; EHR 301 outcome section p. 197; EHR 311 HRIS outcomes p. 201–202; EHR 401 Strategic HR outcomes p. 202.
- Type-D source leads for row 20 are listed in `data/career-mapping/TYPE_D_SOURCES.md`; they are not treated as acceptance evidence because the itemized handbook/curriculum and source locators have not been acquired.

## Confirmed defects vs. evidence-needed; checkpoint counts

**Confirmed audit defects/gates:** rows 14–17 have zero selected courses despite combined component refs; their full CCMAS component names cannot be counted as a reviewed JAMB course union. Row 20's custom Intelligence and Security Studies enrichment lacks the promised itemized authoritative degree-handbook/external curriculum layer; it remains partial and not a confirmed student-facing career path. Current map's fail-closed empty state for rows 14–17 is appropriate.

**Evidence-needed, not defects:** official JAMB table geometry and exact institution association for all ten; semantic/tier validation of every retained row 11–13 and 18–20 link; exact course-specific subgroup/role task mapping; potential D041 and D045 candidate restrictions; and every combined row 14–17 link previously in the rollback snapshot. No role is confirmed solely by a domain link.

**Checkpoint:** rows **011–020** re-reviewed and source/curriculum/map deltas recorded. **0/10 fully closed** under complete acceptance. Partition progress: rows 1–20 checkpointed (20/140), 120 identities not yet re-reviewed (rows 21–140), and the first 20 remain open for their explicit evidence gaps. No canonical map/SQL edited. **Next exact boundary: row 021.**
