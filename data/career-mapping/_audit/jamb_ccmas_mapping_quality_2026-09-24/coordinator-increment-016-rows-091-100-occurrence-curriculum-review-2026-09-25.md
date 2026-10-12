# Partition 01 — increment 016: rows 91–100 occurrence and curriculum review

Audit date: 2026-09-25. Append-only checkpoint. No shared maps, seeds, SQL, APIs, or UI edited. This records findings and evidence still required; it does not promote any links.

## Coverage and source access

- Rows **91–100 (10/10)** checked in canonical order.
- Ten JAMB source occurrences, all Administration or Social Sciences brochure records in the occurrence inventory; all remain PDF-unverified with no precise table-cell locator. Official brochure access is available; visual awarder-row verification is still open.
- Partial scopes contain **206 selected CCMAS course rows**, exact local code/title joins for 206/206. Parsed outcome fields are present for **204/206**. CRD 307 Field Administration for Cooperatives and CRD 409 Research Project (row 91) have empty outcomes. Full-parent row 95 Aviation Management has zero expanded course rows.
- Current active links **70** vs preserved pre-fail-closed snapshot **113**: 44 removed and 1 added. Row 95 Aviation Management intersects the overlay-conflict ledger (D008, D014, D031, D060, D083, D164); treat as unresolved, not as automatic validation or error.
- Source access is not blocked. Full closure is **0/10** because the acceptance standard requires exact printed locators, full course/role semantics and resolved offering contexts.

## JAMB offering context

Official sources accessed 2026-09-25: JAMB [Administration degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf) and [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf). Administration title index at printed p. 44 provides identity discovery for these offerings. Search-indexed official passages also locate Tourism Studies—EKSU/NOUN on printed p. 71. The index/parsed university arrays are not visual proof of table cells.

| Row | Identity | Occurrence and parsed institution lead | Evidence note |
|---:|---|---|---|
| 91 | Cooperative Economics and Management | Administration; UNIZIK | 27-course Co-operative/Rural Development slice; two outcomes absent. |
| 92 | Social Innovation and Entrepreneurship | Administration; WIGWE | 22 Entrepreneurship courses; distinguish social-innovation outcome from generic entrepreneurship. |
| 93 | Entrepreneurship and Business Management | Administration; NOUN | 21 Entrepreneurship courses; management facet needs evidence. |
| 94 | Transport and Tourism | Administration; REDEEMERS | 32 Transport Management courses; tourism facet needs separate evidence. |
| 95 | Aviation Management | Administration; AZMAN | Full CCMAS Aviation Management component, no expanded course list; overlay conflict quarantined. |
| 96 | Aviation Security | Administration; AZMAN | 15 AVM courses from Aviation Management CCMAS; prove security facet rather than assume the parent component covers it. |
| 97 | Personnel Management | Administration; GREGORY | 14 EHR courses; verify personnel facet and source-specific course selection. |
| 98 | Industrial Relations and Human Resources Management | Administration; COVENANT | 23 EHR courses; named industrial-relations and HR facets need both outcome coverage. |
| 99 | International Relations and Strategic Studies | Administration; NOVENA | 26 IR courses; distinguish Strategic Studies from generic IR. |
| 100 | Marketing and Consumer Studies | Administration; IBADAN | 26 Marketing courses; consumer studies needs explicit consumer-research/behaviour outcomes. |

## CCMAS selected outcomes and downstream fit

Primary local course records: `data/career-mapping/ccmas/administration_management.json` and `social_sciences.json`. Official sources: NUC [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf) and [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), accessed 2026-09-25. Per-course printed PDF page/section locators remain open for all 206 rows; exact internal joins are not a substitute for externally traceable locators.

- **91 Cooperative Economics and Management:** 27 course rows in the Co-operative/Rural Development package: CRD 101–106, 203–208, 301–305, 307, 402–404, 406–409, GST 312 and ENT 312. All course identities resolve; CRD 307 and CRD 409 have empty outcome arrays. D047 agriculture, D128 rural/community welfare, D078 research and D063/D015 economics/accounting are candidates for relevant subgroups. Finance, trading, insurance, actuarial and investment links need course-level evidence and role restrictions. Current 13 vs 16 prior; removed D012, D051, D060.
- **92 Social Innovation and Entrepreneurship:** 22 Entrepreneurship courses, all with outcomes (ENP 201–408 subset plus AMS 103/ENT 211/312). Courses include opportunity scouting, social entrepreneurship/community development, innovation/IP, venture creation and research. Current D028, D030, D061, D063, D078, D130, D158 and D159 are broad domains; only bounded enterprise/innovation, social research, marketing and venture-finance facets are plausible. Insurance, credit and recruitment are not automatic outcomes. Current 8 vs 12 prior; removed D008/D012/D014/D031/D033; added D028.
- **93 Entrepreneurship and Business Management:** 21 Entrepreneurship courses, all with outcomes; same component source as row92 but omits ENP 407. Entrepreneurship courses do not establish the full Business Administration/management component. Current D030/D061/D063/D078/D130/D158/D159; narrow each to explicit learning/task fit; D014 actuarial, fintech, telecom, logistics and broad management candidates were removed. Current 7 vs 12 prior.
- **94 Transport and Tourism:** 32 Transport Management course rows, all with outcomes. Transport operations and planning may support D035 transport and D034 logistics; D083 tourism/hospitality and D028 management require course-level tourism/management evidence because the declared component is Transport Management. D061 insurance, D063 economics and D158 finance are not blanket job pathways. Current 7 vs 12 prior; removed D008/D009/D013/D033/D062.
- **95 Aviation Management:** full Aviation Management CCMAS parent, zero expanded courses; current map zero, prior 15 candidate domains. D069 Aviation is direct subject candidate; D164 aircraft/aerospace, D083 hospitality, D008 telecom, D014 actuarial, finance/insurance, security and management need separate outcomes and downstream review. Six overlay-conflict claims are quarantined; none is decided by lexical relevance alone. No active link should be restored absent the full source evidence.
- **96 Aviation Security:** 15 AVM courses, all with outcome fields, selected from Aviation Management. The AVM subject coverage requires exact course content/outcome review: generic aviation management is not synonymous with airport/aviation security operations, screening, threat response, law enforcement or cyber security. D069 Aviation is direct; D063/D062/D013/D061/D158/D028/D030/D159 functional candidates need subgroup restriction. D164 aircraft, D060 banking/credit, D008 telecom, D031 computing/software and D083 hospitality were removed; current 9 vs 14 prior.
- **97 Personnel Management:** 14 EHR courses with outcomes: EHR 101/102/201/204/205/303/305/309/311/312/402/403/405/407. D130 recruitment/employment direct and D029 HR functional are the clearest subject candidates. D063 economics, D030 marketing, D028 general management are contextual only unless tied to specific outcomes; software/data and logistics were removed. Current 5 vs 7 prior.
- **98 Industrial Relations and Human Resources Management:** 23 EHR courses, all with outcomes, spanning employment relations, HR planning, industrial/organizational behaviour, negotiation, workplace conflict, compensation, labour markets, decent work, information systems, multinational HR and diversity. D130/D029 core candidates; D045 government personnel only if a public-sector outcome supports it. D063/D030/D028 need subgroup scope; D009 data engineering and D033 logistics were removed. Current 6 vs 8 prior.
- **99 International Relations and Strategic Studies:** 26 International Relations courses, all with outcomes: GST 112/312 and IRS 101–104, 202/203, 206/207, 301, 303–305, 307/308, 310–312, 401–407. Course anchors include diplomacy, international systems, foreign policy, law of nations, strategic studies and inquiry. D149 direct; D063/D078/D045/D037/D028 functional. Bound research/policy/foreign-affairs learning separately; international law does not establish legal practice, and strategic-studies content does not imply defence or operational security. Link set unchanged (6).
- **100 Marketing and Consumer Studies:** 26 Marketing CCMAS courses, all with outcomes (MKT 111 through 425 selected). Course outcome details must establish consumer behaviour/research, marketing strategy and communication rather than infer Consumer Studies from title. D030 Marketing is direct. D009 data, D028 management, D031 communication, D033 logistics, D060 banking, D061 insurance, D063 economics and D158 finance are not all one student route; confirm each specific task/subgroup. D008 telecom and D012 fintech were removed; current 9 vs 11 prior.

## Exact active-map delta

| Row | Prior | Current | Removed | Added |
|---:|---:|---:|---|---|
| 91 | 16 | 13 | D012, D051, D060 | — |
| 92 | 12 | 8 | D008, D012, D014, D031, D033 | D028 |
| 93 | 12 | 7 | D008, D012, D014, D031, D033 | — |
| 94 | 12 | 7 | D008, D009, D013, D033, D062 | — |
| 95 | 15 | 0 | all prior IDs | — |
| 96 | 14 | 9 | D008, D031, D060, D083, D164 | — |
| 97 | 7 | 5 | D009, D033 | — |
| 98 | 8 | 6 | D009, D033 | — |
| 99 | 6 | 6 | — | — |
| 100 | 11 | 9 | D008, D012 | — |
| **Total** | **113** | **70** | **44** | **1** |

## Confirmed findings and open questions

**Confirmed findings:** rows 91/90 share the same two empty CRD outcomes; row95 is in explicit overlay-candidate conflict review and cannot be treated as approved from its component title; rows 92/93/94/96/99/100 contain named facets that need outcome mapping rather than title-only assumption; row96 maps an Aviation Security title to an Aviation Management package and needs separate security coverage validation.

**Evidence-needed:** visual JAMB table-cell and offering verification; full course/outcome locators; explicit social-innovation, business-management, tourism, aviation-security, transport-tourism, strategic-studies and consumer-studies course facets; role-level qualification requirements; reconcile aviation overlay claims individually. No item/path is declared unavailable based on absence from current map. **0/10 identities closed.** Next sequential tranche: rows **101–110**.
