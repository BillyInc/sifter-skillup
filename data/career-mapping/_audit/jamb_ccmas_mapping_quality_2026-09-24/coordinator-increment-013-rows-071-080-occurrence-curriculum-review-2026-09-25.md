# Partition 01 — increment 013: rows 71–80 occurrence and curriculum review

Audit date: 2026-09-25. Append-only checkpoint; no shared map, seed, SQL, API or UI edited. This captures partial evidence and exact open gates; no row is treated as fully accepted.

## Coverage and source access

- Rows **71–80 (10/10)** reviewed in canonical order.
- Inventory has **11 parsed source occurrences** (row 72 Accounting and Finance occurs in Administration and Social/Management Sciences; all others once). All 11 remain `offering_row_verified_against_pdf=false` with no exact table-cell locator. Official JAMB source access is available; the exact visual association is open, not blocked.
- Partial scopes contain **115 selected course rows**. Exact local package/code/title joins: 115/115. Parsed outcomes are nonempty for **113/115**; missing in source extraction: CRD 307 Field Administration for Cooperatives, CRD 409 Research Project, and IRM 429 Economics of Information (note row73 two missing + row78 one missing; total three). Correction: 115−3 = **112/115** outcomes, not 113; the outcome total is 112 with three empty fields.
- Current active links: **79**; old fail-closed snapshot: **115**; 44 removed / 8 added. Row-by-row deltas below.
- One identity intersects the overlay conflict ledger: Logistics and Supply Chain Management, missing candidates D012, D013, D014, D060, D061. Quarantine is a review state, not proof those links are wrong.

## JAMB source-offering context

Official JAMB [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf) and [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), accessed 2026-09-25. The Administration programme index is printed p. 44; it includes Local Government Studies, Cooperative/Rural Development, Logistics/Supply Chain, Finance and Investment, Insurance and Actuarial Science, Office/Information titles, and related subjects. The index does not establish table awarders. Row 72’s two source-faculty occurrences are separately preserved; parser correction identifies BCU in Administration and FEDOTUOKE in Social/Management. Neither institution cell has been visually verified in this pass. All other institution tokens remain parser-only.

| Row | Identity | Source / parsed context | Specific source/curriculum concern |
|---:|---|---|---|
| 71 | Local Government Studies | Administration; OAU, ABU, UMYUK, UNN, UDU | 13-course Local Government and Development Studies scope; exact course/role fit open. |
| 72 | Accounting and Finance | Administration (BCU) + Social/Management Sciences (FEDOTUOKE) | Distinct source offerings; do not merge institutional curriculum. The current name-keyed map holds the identity at 0 links. |
| 73 | Cooperative and Rural Development | Administration; BOUEDST, EKSU, UAGRIC-IMO, UNIOSUN | 29 courses; two outcome fields empty; agricultural/cooperative facets need separate paths. |
| 74 | Logistics and Supply Chain Management | Administration; CANADIAN-UNI, PHOENIX, LASU, NILE | Full-parent CCMAS, 0 expanded rows; overlay-conflict quarantine. |
| 75 | Development and Communication Studies | Administration; ABUJA, BSU, IMSU, RSU | Scope maps Development Studies (23 courses); communication facet needs its own source/component/outcomes. |
| 76 | Transport and Logistics Management | Administration; CUST, BOUEDST, UNI-ILESA | 32-course Transport Management scope; verify precise transport vs logistics course fit. |
| 77 | Insurance and Actuarial Science | Administration; BAZE, IMSU, WESLEYUNI | 19-course Insurance slice; separate actuarial outcomes/professional exam pathway are not yet shown. |
| 78 | Office and Information Technology / Information Resource Management | Administration; LASUSTECH, BABCOCK, LCITY | 21-course Information Resource Management scope; title’s “Information Technology” facet is not evidently covered by a broad IT curriculum. |
| 79 | Accountancy and Forensic Studies | Administration; BCU, LUX-MUNDI | Only 2 Accounting courses selected; forensic-studies component absent from scope. |
| 80 | Finance and Investment | Administration; PRIME-UNI, WESLEYUNI | 20 Finance/Banking courses; same list as row 72 despite distinct programme/occurrence context. Investment-specific fit needs direct outcome check. |

## CCMAS course and outcome review

Primary local records: `data/career-mapping/ccmas/administration_management.json`, plus cited programme/source cross-links in the official NUC [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf) and [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), accessed 2026-09-25. Individual printed page/table locators for the listed outcome rows still need to be captured to meet citation closure.

- **71 Local Government Studies:** 13 selected LGD courses (LGD 101, 102, 202, 203, 205, 301, 302, 304, 306, 307, 404, 406, 408), all outcome fields populated. Current D045 Public Administration direct and D128 social/welfare administration functional are the strongest candidates. D063 economics, D062 trading, D013 investment, D158 finance, D061 insurance, D159 credit, D015 accounting, D028 management and D037 legal practice require bounded task-specific evidence; general local-government curriculum does not prove trading, investment or professional legal/accounting work. Active 11 vs prior 10; additions D013, D015, D062, while D033 and D060 are no longer active.
- **72 Accounting and Finance:** 20 selected Finance/Banking rows, all outcomes populated. Course IDs: FIN 101, 209, 210, 215, 216, 217, 303, 304, 305, 313, 315, 317, 404, 409, 410, 411, 413, 414, 416; ENT 312. This excludes FIN 308 Bank Lending and Credit Administration compared with the Banking and Finance identity and needs specific evidence for BCU/FEDOTUOKE contexts. Active map is zero after source-context quarantine; 15 old domain candidates must not be restored to both contexts automatically. Need two context-specific curriculum/course unions and context-aware mapping before acceptance.
- **73 Cooperative and Rural Development:** 29 selected CRD courses plus AMS 101; all resolve exactly, but CRD 307 and CRD 409 have no parsed outcome text. Course scope spans cooperative organization, rural development, agricultural/cooperative finance, management and research. D047 Agriculture, D128 rural/welfare/community development, D078 research and bounded D063/D015 finance/accounting candidates deserve course-level validation. Current thirteen domains include many unrelated private finance, trading, insurance and actuarial paths; existing domain presence does not support every listed role. Active 13 vs 16 prior; removed D012, D051, D060.
- **74 Logistics and Supply Chain Management:** exact full-parent Logistics and Supply Chain Management component; zero expanded courses. Prior 14 links, current 0. D034 Logistics and D035 Supply Chain are direct subject candidates; D036 procurement is a possible bounded interface; finance, trading, insurance, actuarial, data/software, tourism, management and banking links require separate course/task support. Overlay candidate conflict for D012/D013/D014/D060/D061 remains open, not auto-resolved.
- **75 Development and Communication Studies:** 23 selected courses, all with outcome fields: GST 111, DES 101/103/104, MGS 101, DES 201/202, ACC 202, ECO 206, DES 207, ENT 312, SSC 302, BUS 326, DES 303/305/306/308, DES 402–405, POL 401, SOC 409. Development studies outcomes support development research/policy, NGO/social-development, project/M&E and economic-development facets; D063/D078/D128/D028/D032 are candidates with scope limits. JAMB title additionally says **Communication Studies**, but the declared scope has no Communication/Media component; assess as a confirmed named-facet coverage gap, not a proof that no source exists. D060 banking, D130 recruitment and broad routes need evidence. Active 7; D149 removed, D032 added (old 7).
- **76 Transport and Logistics Management:** 32 selected TPM rows; all have outcomes. Course coverage includes transport systems/modes, logistics and operations, planning, safety/regulation, transport economics and management, and internship. D035 Supply Chain/Logistics direct, D034 logistics functional, D083 tourism/transport context and D028 management may be narrow candidates; D061 insurance, D063 economics and D158 finance need item-specific subgroup fit. D008 telecom, D009 data, D013 investment, D033 generic logistics, D062 trading removed from active. Active 7 vs 12 prior.
- **77 Insurance and Actuarial Science:** 19 selected INS/ACS courses, all outcome fields present. Scope is overwhelmingly Insurance; course-code list includes INS 101/102, 202, 204/205, 301, 303–307, 401/402/404/405 and ACS 207/306/308/402. This can support insurance subject matter (D061 direct) and is a lead for actuarial/statistical risk (D014), but the actual actuarial sequence/exams and actuarial role prerequisites need evidence; no quant-finance link is assumed. Current 10 vs 12 prior; D011 and D060 removed.
- **78 Office and Information Technology / Information Resource Management:** 21 selected IRM/IRMA courses, 20 with outcome fields; IRM 429 Economics of Information is empty. The course list has repeated IRM 202, and no obvious software/network/IT-engineering progression. D073 Library/Information Resources direct may fit information organization/records; D061/D062/D014/D011/D013/D063 financial/market domains are not established by the listed office/information curriculum. Current 7 vs 9 prior; D010/D033 removed. “Information Technology” in the slash title must not be represented as confirmed computing without a distinct supported scope.
- **79 Accountancy and Forensic Studies:** only ACC 311 and ACC 401 are selected, both with outcomes. This is insufficient to claim a complete Accounting curriculum and omits a forensic-science component. D015 Accountancy direct is a candidate, but two courses cannot establish full accounting, forensic accounting/audit investigation, tax advisory, investment, bank/credit, trading or finance roles. Current 8 vs prior 5, additions D013/D028/D062 need explicit proof and should not be considered confirmed student paths.
- **80 Finance and Investment:** 20 courses and all outcome fields present, but the list duplicates row 72’s Banking/Finance-derived selection. It needs a separate Finance-and-Investment title/course anchor, especially for investment analysis/portfolio management. D013/D158/D159 direct and D011/D012/D014/D015/D028/D030/D051/D060/D061/D062/D063/D157/D009 functional/adjacent are candidates, not a blanket path; the same course list cannot be presumed to support every specialty or both offering contexts. Active 16 vs 15 prior, D014 added.

## Exact map delta

| Row | Prior | Current | Removed | Added |
|---:|---:|---:|---|---|
| 71 | 10 | 11 | D033, D060 | D013, D015, D062 |
| 72 | 15 | 0 | all prior links | — |
| 73 | 16 | 13 | D012, D051, D060 | — |
| 74 | 14 | 0 | all prior links | — |
| 75 | 7 | 7 | D149 | D032 |
| 76 | 12 | 7 | D008, D009, D013, D033, D062 | — |
| 77 | 12 | 10 | D011, D060 | — |
| 78 | 9 | 7 | D010, D033 | — |
| 79 | 5 | 8 | — | D013, D028, D062 |
| 80 | 15 | 16 | — | D014 |
| **Total** | **115** | **79** | **44** | **8** |

Count reconciliation: 115 − 44 + 8 = 79. Current active links are the fail-closed map and not endorsements. No shared data changed.

## Confirmed findings vs evidence needed

**Confirmed findings:** row72 has two independent JAMB source-faculty occurrences and must be context-aware (the saved name-keyed course map cannot certify both); row75’s declared Development Studies scope does not cover the named Communication Studies facet; row78 has no demonstrated broad IT curriculum in its selected Information Resource Management slice and contains a duplicate course code plus an empty outcome field; row79’s two-course slice cannot substantiate the named Accountancy + Forensic Studies compound identity. Row73 has two missing parsed outcome fields; row78 has one.

**Evidence-needed:** visually verified awarder cells; distinct row72 institution/course context; exact official CCMAS printed locators for 115 selected rows/full parents; adjudication of Logistics overlay conflicts; correct separate component/curriculum for Communication Studies, forensic studies and IT; unique row78 course set; descendant subgroup/role and credential qualification evidence for every current or candidate link. These gaps do not mean “nothing exists”; no item is declared unavailable.

Coverage: rows 71–80 checkpointed, **0/10 fully closed**. Next batch: rows **81–90**.
