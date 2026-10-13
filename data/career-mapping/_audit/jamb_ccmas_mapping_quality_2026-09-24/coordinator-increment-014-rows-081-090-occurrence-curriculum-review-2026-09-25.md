# Partition 01 — increment 014: rows 81–90 occurrence and curriculum review

Audit date: 2026-09-25. Append-only checkpoint; no shared map, seed, SQL, API or UI edited. Audit notes below are not canonical edits or student-facing approvals.

## Coverage / access status

- Rows **81–90 (10/10)** reviewed in the recorded canonical scope order.
- Occurrence inventory: 10 rows, 10 Administration source occurrences, all PDF-unverified with no exact table-cell locator. Official JAMB brochures are accessible; exact visual institution-row verification remains open, not blocked.
- There are **178 selected course rows** among partial scopes. Exact local CCMAS joins succeed for all 178; nonempty parsed outcomes are **176/178**. CRD 307 Field Administration for Cooperatives and CRD 409 Research Project (row 90) have empty outcome arrays. Full-parent rows 84 and 86 have zero expanded selected rows and still require full source-package course/outcome review.
- Current active links **86**, prior map **131**, delta **46 removed / 1 added**. One row, Logistics and Supply Chain Management, has a conflict-ledger intersection (that was row 74, not these rows); there is no overlay conflict in rows 81–90.
- Full acceptance closure: **0/10**. No source access blockage; exact source table, full course locators and role-level evidence remain open.

## JAMB source context

Official JAMB [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf), accessed 2026-09-25. Its programme index is printed p. 44 and includes Securities and Investment, Management Studies, Transport Management, Tourism Studies, Employment/HR, Accounting/Data Analytics, Finance/Financial Technology, Agribusiness and Economics, and Cooperative Management. Exact programme row/awarder cells were not visually verified; parsed tokens remain unconfirmed leads.

| Row | Canonical JAMB identity | Parsed context (unverified) | Course-scope concern |
|---:|---|---|---|
| 81 | Securities and Investment | Administration; MOUNTAIN TOP, NASARAWA | 15-course Securities/Investments Management slice. |
| 82 | Management Studies | Administration; IMSU, PLASU | 31 Business Administration courses. |
| 83 | Entrepreneurship and Innovation | Administration; PHOENIX, UDU | 21 Entrepreneurship courses. |
| 84 | Transport Management | Administration; JEWEL, FUTIA | Full Transport Management component; no expanded row list. |
| 85 | Tourism Studies | Administration; EKSU, NOUN | 26 Hospitality and Tourism Management courses. |
| 86 | Employment and Human Resource Management | Administration; IAUED, RSU | Full EHR parent; no expanded row list. |
| 87 | Accounting and Data Analytics | Administration; WIGWE | 16 Accounting courses; separate data-analytics facet requires evidence. |
| 88 | Finance and Financial Technology | Administration; WIGWE | 20 Finance/Banking courses; fintech facet is named but must be distinguished from software engineering. |
| 89 | Agribusiness and Economics | Administration; HUSTECH | 25 Economics courses; Agribusiness component/course union is not recorded in refs. |
| 90 | Cooperative Management | Administration; NOUN | 24 Co-operative and Rural Development courses; two course outcomes absent. |

The official title index is evidence for programme identity only. Parsed awarding institutions are not certified in this checkpoint.

## Course/outcome and destination review

Authoritative curriculum: NUC [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), and Social Sciences CCMAS where referenced; checked-in course/outcome records in `data/career-mapping/ccmas/administration_management.json` and `social_sciences.json`, accessed 2026-09-25. Printed NUC page locators for selected outcomes/full-parent courses still need to be attached before acceptance closure.

- **81 Securities and Investment:** 15 selected CCMAS Securities and Investments Management courses, all with parsed outcomes. Current D062 Trading and D013 Investment direct; D011 quantitative finance and D063 economics, D060 banking, D158 corporate finance, D159 credit, D028 management, D015 accounting, D030 marketing and D157 tax are functional candidates. D009 data engineering and D010 computing were removed; D033 logistics was removed. Direct market/investment curriculum does not by itself qualify learners for regulated trading/advisory roles; audit each sub-group’s regulatory/professional prerequisites. Current 11 vs 14 prior.
- **82 Management Studies:** 31 Business Administration course outcomes all present (same detailed course set as the prior Management/Business Management partial scopes). D028 General Management is direct; D013/D014/D029/D032/D045/D060/D061/D062/D063/D130/D158/D159 functional and D030 adjacent. Most are specialty domains rather than mandatory outcomes of general management; only bounded management subgroups should be considered without specialty sequences. D009/D010/D033 removed from prior 17; current 14.
- **83 Entrepreneurship and Innovation:** 21 Entrepreneurship course rows all have outcomes. Current seven links: D030 marketing, D061 insurance, D063 economics, D078 social-science research, D130 employment, D158 corporate finance, D159 credit. Outcomes can support venture creation, opportunity/innovation and business planning; they do not automatically demonstrate insurance/actuarial, fintech, telecom, logistics, corporate-credit or investment occupations. Prior D014/D012/D008/D033/D031 were removed; current 7 vs 12 prior.
- **84 Transport Management:** exact full-parent Transport Management CCMAS; zero expanded rows. Prior 12 links now fail-closed to 0. D035 transport and D034 logistics are direct subject candidates; transport economics, safety, planning and operations may support specific groups. Finance, investment, ICT, analytics, hospitality and supply chain roles need distinct evidence. No role is certified from the domain title.
- **85 Tourism Studies:** 26 selected Tourism/Hospitality CCMAS rows all with outcomes. Current D053 Tourism/Hospitality and D083 Hospitality direct, with D028 management, D030 marketing, D062 trading, D063 economics functional. Tourism planning/operations, destinations and hotel/service studies support the named field; foreign-exchange trading (D062) lacks demonstrated task fit and should not be a confirmed student pathway without an explicit finance outcome. D013/D033/D061 removed; current 6 vs 9 prior.
- **86 Employment and Human Resource Management:** exact full EHR CCMAS parent, zero expanded rows. Current fail-closed map 0 vs 11 prior candidates. HR planning, employment relations, personnel, labour law, compensation, negotiation, occupational well-being and HR systems should be evaluated from the actual full package; recruitment and HR (D130/D029) are obvious academic candidates but still need specific course/subgroup links. Do not infer actuarial, data, credit, logistics or every general-management role.
- **87 Accounting and Data Analytics:** 16 selected Accounting courses, all with outcomes. D015 Accounting is direct; current eleven also include D013 investment, D028 management, D045 public administration, D060 banking, D061 insurance, D062 trading, D063 economics, D157 tax, D158 corporate finance and D159 credit. No data-analytics/quantitative computing course union is apparent in the selected CCMAS Accounting scope; accounting-domain learning is supported, but the named data-analytics facet needs a mapped analytics curriculum or course-by-course external evidence. D009 Data Science was removed from prior set. Current 11 vs 12 prior.
- **88 Finance and Financial Technology:** 20 Finance/Banking course outcomes all present. They include FIN 409 Financial Technology, but a course titled fintech alone does not prove software engineering/network/fintech platform-build competencies. Current 16 links include D013/D060/D158/D159 direct and D009 adjacent; remaining finance, insurance, actuarial, trading, management, marketing, tax and data destinations require narrow course/outcome and descendant checks. D014 was added, active 16 vs 15 prior.
- **89 Agribusiness and Economics:** 25 selected Economics CCMAS courses, all with parsed outcomes. D063 Economics direct and D009/D015/D030/D045/D078/D158/D159 functional. The name explicitly includes Agribusiness, but component refs only name Social Sciences::Economics; no Agriculture/Agribusiness course union is selected. This is a confirmed scope reconciliation gap requiring the relevant Administration/Agriculture/CCMAS Agribusiness outcomes or external item-specific evidence. Do not show agricultural-business roles as supported by economics-only scope. D013/D014/D028/D061/D062 removed; current 8 vs 13 prior.
- **90 Cooperative Management:** 24 selected Co-operative and Rural Development courses; 22 have outcomes, with CRD 307 and CRD 409 empty in the source parse. Current 13 domains: D062, D013, D063, D158, D061, D015, D159, D014, D078, D028, D030, D047, D128. Cooperative membership/organization, management, finance, rural development and research are relevant course themes; agriculture, welfare, economics and research need bounded child-group evidence. Banking/credit (D060), fintech (D012) and sales (D051) were removed. Current 13 vs 16 prior.

## Exact active-vs-prior map reconciliation

| Row | Prior links | Current | Removed IDs | Added |
|---:|---:|---:|---|---|
| 81 | 14 | 11 | D009, D010, D033 | — |
| 82 | 17 | 14 | D009, D010, D033 | — |
| 83 | 12 | 7 | D008, D012, D014, D031, D033 | — |
| 84 | 12 | 0 | all prior IDs | — |
| 85 | 9 | 6 | D013, D033, D061 | — |
| 86 | 11 | 0 | all prior IDs | — |
| 87 | 12 | 11 | D009 | — |
| 88 | 15 | 16 | — | D014 |
| 89 | 13 | 8 | D013, D014, D028, D061, D062 | — |
| 90 | 16 | 13 | D012, D051, D060 | — |
| **Total** | **131** | **86** | **46** | **1** |

## Defects and outstanding evidence

**Confirmed findings:** row89’s title contains an Agribusiness facet not represented in its saved component refs or selected Economics courses; row87’s Data Analytics facet lacks a demonstrated data-analytics curriculum in the selected Accounting scope; rows84 and 86 are full-parent fail-closed states, not confirmed unavailable; three selected course rows in row90 lack parsed learning outcomes. Row72 in the previous increment is the distinct multi-faculty Accounting and Finance case and remains quarantined; none of those context claims should be applied to row88.

**Evidence-needed:** PDF table-cell verification for all ten rows and parsed awarders; exact CCMAS print locators for 178 course rows/full parents; source-component/course union for row89 Agribusiness and row87 analytics; full parent courses for 84/86; determine if row88 FIN 409 contains implementation or only finance-service content; item/descendant-role qualification evidence for every domain; recover alternate authoritative outcome sources for CRD 307/409. No “unavailable” status is asserted.

Coverage: **10/10 identities checkpointed, 0/10 closed**. Next sequential batch: rows **91–100**.
