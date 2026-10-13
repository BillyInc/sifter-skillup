# Rows 001–140: ordered non-combined link review increment 014

Audit date: 2026-09-25  
Scope: occurrences 174–198 of the ordered rows 1–140 non-combined missing-`scope_course_titles` queue, continuing after `agent-01-links-increment-013.md`. This increment covers Project Management (7 links), Logistics and Supply Chain Management (14), and Transport Management (4). No canonical mapping, curriculum scope, seed, SQL, UI, or checked-in course extraction was edited.

## Rebuilt queue and count

- Rebuilt the queue from `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`, rows 1–140, preserving row order then domain-link order, excluding `combined_scope_evidenced` rows, and selecting links without `scope_course_titles`.
- The queue remains **435** occurrences. Increment 013 ended at 173; this checkpoint assesses **25/25** at positions 174–198. **237/435 remain** in this non-combined queue. The separate combined-scope queue remains 292; it is not part of this count.
- A missing locator is a provenance gap, not proof that a relationship is false. The dispositions below separately assess curriculum support and how narrowly that evidence can be exposed downstream.

## Actuarial Science CCMAS reconciliation follow-up

I reopened the primary NUC-hosted Administration and Management CCMAS rather than treating the local `administration_management.json` extract as authoritative. The NUC course structure at printed pp. 54–56 names ACS 101 Introduction to Actuarial Science, ACS 102 Basic Mathematics for Actuarial Science, ACS 104 Elements of Actuarial Statistics; ACS 201–208 then include calculus, mathematical statistics, probability, introductory actuarial finance, mathematics of demography, economics of insurance and risk management; ACS 301–311 include differential equations, life contingencies, financial mathematics, actuarial modelling, life/health insurance, numerical analysis, pricing, survival models and professional entrepreneurship; ACS 401–405 include life contingencies, pensions/social insurance, mortality analysis, actuarial valuation and advanced risk management. Learning outcomes begin at printed pp. 58 onward.

The checked-in extract materially differs: e.g. ACS 101/102 are labeled Statistical Inference I/II; ACS 104 Introduction to Actuarial Science; ACS 203 Financial Mathematics I; ACS 204 Financial Mathematics II; ACS 205 Probability Theory I; ACS 206 Probability Theory II; ACS 208 Introduction to Statistical Models; ACS 301/302 Survival Models I/II; ACS 303 Financial Reporting; ACS 304 Corporate Finance; ACS 305 Stochastic Modelling; and ACS 307/309 Loss Models. Those code/title pairs do not match the current NUC course table. **Confirmed discrepancy; its cause (transcription error, an older source version, or both) is not established.** Keep all affected local course-level conclusions provisional until the source artifact/version and extraction are reconciled. Do not map the old local labels to domains or use them as evidence. The current NUC source supports actuarial mathematics, insurance, finance/risk modelling and some statistical foundations, but does not by itself support every broad destination-domain link in the row.

## Link-occurrence dispositions

### Row 70 — Project Management (positions 174–180)

The dedicated CCMAS is explicit: PMG 111 Business Analysis covers requirements elicitation, scope, feasibility and SDLC; PMG 112 covers project briefs, risks, costs/benefits and changes; later courses cover methods, project finance/resources, scheduling/cost, quality, planning/control, agile, risk/change, scope, procurement/contracts and portfolio/programme management. NUC printed pp. 487–501 (course structure and outcomes; web PDF pages around 486–500). The seed therefore has a strong named programme anchor, but the links below are not all equivalent career routes.

| Position | Current link | Evidence-led disposition and downstream boundary |
|---:|---|---|
| 174 | D063 Economics — functional | PMG 213 project finance/resources and PMG 112 cost-benefit analysis support a narrow project-appraisal interface, not the economics curriculum or broad economist/economic-research roles. Keep only as a bounded interface if that is represented separately from a career route; broad Economics downstream is not established. |
| 175 | D028 General Management — functional | AMS 101 Principles of Management is a shared foundation, and project courses cover team/stakeholder leadership. This is not evidence for the full general-management domain, executive/department management, or its broad consultant roles. Broad downstream route not established. |
| 176 | D033 Product Management — functional | Requirement elicitation, product/project scope distinction, agile delivery and business analysis overlap with product teams. The curriculum does not establish product discovery, market/customer validation, product strategy, roadmap ownership or product analytics. At most a narrow project-delivery interface; no blanket product-manager path. |
| 177 | D158 Corporate Finance, Investment Banking — functional | Project finance, time value/payback and project appraisal are not corporate-finance transaction work, investment banking, M&A or securities underwriting. The broad domain and its banking/investment roles are not established. |
| 178 | D009 Data Science — functional | Research methods or project/business analysis do not establish statistics/programming/data-engineering study. No data-science career route is supported by this project-management curriculum. |
| 179 | D014 Actuarial Science — functional | No actuarial mathematics, probability/statistics sequence, insurance pricing, mortality, life contingencies or actuarial modelling sequence in this curriculum. Unsupported; remove from confirmed student pathways unless separate item-specific evidence is later found. |
| 180 | D001 Software Engineering — adjacent | PMG 111 mentions SDLC and PMG 311 Agile covers software delivery methods, but there is no programming, software design, implementation, testing or deployment curriculum. A software-project coordination interface may be described as such; the Software Engineering domain/engineering-role path is not established. |

### Row 74 — Logistics and Supply Chain Management (positions 181–194)

The NUC course structure at printed pp. 357–359 includes global trade, procurement, forecasting/demand, inventory, operations, physical distribution, ICT, warehousing, freight/intermodality, supply-chain analytics, analytical techniques, customs regulations, public procurement, research and geospatial analytics. Learning outcomes include logistics/supply-chain information integration, analysis and operational decision-making (e.g. LSM 207, printed pp. 367–368); the advanced analytics/research/geospatial courses appear around pp. 374–377. These support important functional intersections but do not make the programme a substitute for every destination discipline.

| Position | Current link | Evidence-led disposition and downstream boundary |
|---:|---|---|
| 181 | D034 Supply Chain Management — direct | Directly supported by the dedicated CCMAS identity and the full supply-chain design, demand, inventory, operations, visibility/analytics, procurement, distribution, sustainability and internship sequence. Keep as primary route; subgroup/role visibility should still be bounded to supply-chain work represented by those courses. |
| 182 | D035 Logistics — direct | Directly supported by the dedicated logistics curriculum: freight, warehousing, inventory, distribution, global logistics, customs, reverse logistics, geospatial decision-making and SIWES. Keep as primary route; do not imply that every transport or customs role has identical preparation. |
| 183 | D063 Economics — functional | LSM 102 transport economics, trade, demand/forecasting and analytical techniques establish a narrow operational/transport-economics interface. They do not establish the broad economics curriculum or economist/research/teaching roles. |
| 184 | D062 Trading — functional | “Trade” in global trade/customs refers to movement and exchange of goods, not securities/financial-market dealing. D062 trading roles are not established; remove from confirmed career pathways. |
| 185 | D013 Investment Analysis — functional | Network design, transport economics, costs and business-case analysis may support logistics investment appraisal in context. They do not establish securities valuation, portfolio analysis or investment-adviser roles. Narrow subject interface only; broad D013 route not established. |
| 186 | D061 Insurance — functional | Risk/resilience and supply-chain disruption are not insurance products, underwriting, claims or insurance operations. No insurance career pathway established. |
| 187 | D012 FinTech Engineering — functional | SCM information systems, ERP, EDI, RFID, barcodes and decision support concern logistics technology. They do not teach financial-product engineering, software development or fintech systems. No D012 route established. |
| 188 | D009 Data Science — functional | LSM 302 supply-chain visibility/analytics, LSM 303 analytical techniques, forecasting and LSM 405 geospatial analytics support **domain-specific operational analytics**. They do not automatically establish broad data science, ML/AI or data-engineering careers. Keep only matching analytics subgroup/roles if their requirements are genuinely evidenced. |
| 189 | D030 Marketing, Brand — functional | Demand management/customer service and an explicit interface between supply chain, product development, marketing and sales support coordination with marketing. They do not establish brand strategy, advertising, market research or marketing-management roles. Narrow cross-functional interface only. |
| 190 | D014 Actuarial Science — functional | No actuarial mathematics, probability/statistics sequence, insurance pricing or actuarial modelling curriculum. Unsupported; remove from confirmed pathways. |
| 191 | D028 General Management — functional | AMS 101 and operations/team/business courses provide management foundations in a logistics context. They do not establish the full general-management domain or executive/department-manager roles. Keep only specifically evidenced operations coordination, not the whole domain downstream. |
| 192 | D060 Banking, Credit — functional | Cost, finance and commercial transactions in a supply chain do not establish banking operations, lending, credit analysis or mortgage/collections roles. Unsupported as a career route. |
| 193 | D036 Procurement — functional | Direct course anchors include LSM 202 Procurement Management and LSM 307 Public Procurement Practices, with sourcing/procurement also in logistics operations. This is a substantive procurement relationship. Reassess at programme level as direct or retain functional with a reason distinguishing the LSCM primary identity from procurement career routes; expose only procurement subgroups/roles supported by procurement lifecycle and sourcing evidence. |
| 194 | D079 Customs, Trade — functional | LSM 201 global trade and LSM 304 global logistics/customs regulations directly cover trade/customs context; the evidence supports a meaningful functional pathway to trade-compliance/logistics roles. It does not automatically support every customs enforcement, legal or tariff-policy role in the full domain. |

### Row 84 — Transport Management (positions 195–198)

NUC describes Transport Management as drawing on economics, engineering/technology, accounting, law and management, and explicitly includes transport economics/planning, intelligent transport systems, logistics/supply chain, ports, airports, public transport and rail (printed pp. 582–584). Its course table includes TPM 303 Logistics Management, TPM 317 Transport Economics, TPM 319/322 Intelligent Transport Systems, TPM 314 Traffic Survey Analysis and TPM 324 Transport Finance and Evaluation (printed pp. 585–586; outcomes for TPM 303 around p. 596 and TPM 317 around pp. 599–600).

| Position | Current link | Evidence-led disposition and downstream boundary |
|---:|---|---|
| 195 | D035 Logistics — direct | Directly supported: logistics planning/strategy, freight, logistics management, international logistics, intermodal transport and supply-chain courses. Keep as a primary transport/logistics route, bounded to evidenced transport/logistics subgroups. |
| 196 | D063 Economics — functional | TPM 317 and LSM 102 explicitly teach transport economics, demand/supply, cost, pricing, valuation and transport-project appraisal. This supports a strong transport-economics interface, not general economist/economic-research roles. Preserve it only as a bounded transport-focused relationship. |
| 197 | D062 Trading — functional | Transporting commercial goods and studying trade/modes is not financial securities trading or brokerage. No D062 trading-role preparation established; remove from confirmed student pathways. |
| 198 | D013 Investment Analysis — functional | TPM 317 and TPM 324 support transport investment/project evaluation and transport finance in context. They do not establish market-security analysis, portfolio management or investment-advisory work. Keep only a narrow infrastructure/transport appraisal interface if represented separately; broad D013 career route not established. |

## Sources and locators (accessed 2026-09-25)

- Current NUC Administration and Management CCMAS PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf
  - Actuarial Science course table: printed pp. 54–56; outcomes begin printed p. 59 onward. Use this over conflicting local ACS code/title pairings pending source version reconciliation.
  - Project Management structure and learning outcomes: printed pp. 487–501 (PMG 111 outcomes printed p. 492; PMG 112 printed p. 493; downstream course sequence continues through the programme section).
  - Logistics and Supply Chain Management course structure: printed pp. 357–359; LSM 207 ICT learning outcomes/content printed pp. 367–368; analytics/research/geospatial and remaining outcomes in programme section pp. 374–377.
  - Transport Management overview: printed pp. 582–584; course table pp. 585–586; TPM 303 outcomes/content printed p. 596; TPM 317 outcomes/content printed pp. 599–600.
- Official index for CCMAS: https://www.nuc.edu.ng/ccmas/
- Local source records cross-checked (not treated as authoritative where contradicted by NUC): `data/career-mapping/ccmas/administration_management.json`, saved scope `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`, `data/career-mapping/jamb_domain_map.json`, `data/career-mapping/programme_mapping.json`, and `data/career-mapping/domain_structure.json`.

## Increment outcome and next boundary

- This is **25 link-occurrence assessments**, not a complete row 1–140, 420-identity, source-offering, CCMAS-component or descendant role audit. Role visibility noted above is a curriculum-supported boundary; it is not an exhaustive role-by-role verification.
- The next ordered no-locator occurrence is row 84 Transport Management → D061 Insurance (position 199).
- **237/435** non-combined row 1–140 occurrences remain; the separate combined-scope queue remains **292**. No active data or generated seed changed.
