# Role→domain task-fit audit — D029–D056

Checkpoint 003 | 2026-10-05 | Append-only continuation; D032–D033

## Scope, method, and source rule

This checkpoint continues the in-scope 915 current role mappings deduplicated by `(domain_id, role_name)` from `role_library_v3_cleaned.json` plus the thin/emerging role overlays. It reviews **every role in D032 and D033** against its own task description and the parent-domain scope in `domain_meta.json`. Neither ISCO grouping nor subgroup membership is used as fit evidence. A “revise/reassign” disposition means the checked role description does not establish fit to this parent domain; it does not by itself authorize deletion or assert a final destination mapping.

Role task evidence/locators: `data/career-mapping/role_library_v3_cleaned.json`, each table row's ESCO occupation code; crosswalk/URI locator in `data/career-mapping/taxonomies/occupation_graph.json`; the locally checked ESCO occupation descriptions/skills in `data/career-mapping/taxonomies/esco_occupations.json`, matched by the same code. The European Commission describes ESCO occupation concepts as having descriptions/scope notes and profiles listing relevant knowledge, skills and competences; see [ESCO occupations](https://esco.ec.europa.eu/en/classification/occupation_main) and [ESCO descriptions](https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/descriptions). ESCO provides concept URIs/API for exact occupation records: [ESCO web-service API](https://esco.ec.europa.eu/en/use-esco/use-esco-services-api/esco-web-service-api). ESCO is a European occupational taxonomy; its role-task profile is evidence of task content, not evidence of local demand or universal prevalence.

Specialization relation remains **provisional for all 89 mappings in this checkpoint**. No current subgroup or specialization membership has been used to establish parent-domain fit. Do not count any role→specialization disposition as final until the parent specialization-set decisions exist; then reconcile independently.

## D032 — Project and Programme Management (38 mappings)

Parent-scope basis from `domain_meta.json`: planning and coordination of work/projects to time and budget; project, procurement and office operations; programme leadership, departmental strategy, process analysis, and agile/lean improvement.

| Current role | ESCO code | Domain disposition | Task evidence / reason |
|---|---:|---|---|
| administrative assistant | 3343.1 | revise/reassign | Office reception, supplies, facilities and supervisor support; no project/programme task in the role description. |
| advertising sales agent | 3339.1 | revise/reassign | Sells advertising space/time and follows up sales; sales is the primary task. |
| auctioneer | 3339.2 | revise/reassign | Runs bids and declares goods sold; auction/sales task, not project delivery. |
| branch manager | 1213.5.1 | pass | Implements company strategy and manages the affairs of a business branch; fits the stated senior management/strategy portion. |
| building information modelling consultant | 2421.6 | pass | Guides BIM business processes and construction teams; implements BIM strategies/solutions and coordinates clients/staff, a project-delivery/process-improvement function. |
| business analyst | 2421.1 | pass | Analyses business position, structure and internal organization and recommends improvement; fits the domain's strategy/process-analysis scope. |
| business consultant | 2421.2 | pass | Analyses company structure/processes and develops plans to address inefficiencies; explicit process-improvement task. |
| business intelligence manager | 2421.3 | pass | Analyses supply-chain, warehouse, storage and sales operations to improve company processes. |
| business manager | 1213.5 | pass | Sets business-unit objectives, creates operating plans and coordinates implementation with employees/stakeholders. |
| director of compliance and information security | 1213.9 | revise/reassign | Oversees regulatory compliance and IT security; functional compliance/security work, not this domain's project/programme work. |
| editorial assistant | 3343.2 | revise/reassign | Supports editorial publication workflow, rights and information processing; editorial operations, not general project management. |
| education administrator | 3343.1.2 | revise/reassign | Runs a school's administrative/support systems; education administration rather than project/programme management. |
| EU funds manager | 1213.6 | pass | Defines investment priorities, drafts operational programmes and coordinates authorities around programme objectives. |
| executive assistant | 3343.3 | revise/reassign | Organises executive meetings/files/travel and day-to-day office administration; no project/programme ownership established. |
| fundraising assistant | 3343.1.3 | revise/reassign | Processes donations/grants and supports fundraising administration; fundraising operations, not project management. |
| health safety and environmental manager | 1213.7 | revise/reassign | Designs HSE policies, conducts risk assessments and ensures compliance; HSE function is primary. |
| intellectual property consultant | 3339.3 | revise/reassign | Advises on patent/copyright/trademark usage, valuation and protection; IP advisory work. |
| international student exchange coordinator | 3343.1.4 | pass | Leads an exchange programme's applications/admissions, accommodation and administration; explicit end-to-end programme coordination. |
| lean manager | 2421.4 | pass | Plans and manages lean programmes and coordinates continuous-improvement projects across business units. |
| logistics analyst | 2421.5 | pass | Analyses supply-chain problems and directs programmes for economically efficient transport/storage/distribution. |
| management assistant | 3343.4 | revise/reassign | General administrative support to managers/departments; no project-management task stated. |
| manufacturing cost estimator | 2421.1.1 | pass | Estimates manufacturing money/material/labour/time and compares cost-effective technical/process alternatives; directly supports project scope/cost planning. |
| policy manager | 1213.2 | revise/reassign | Develops policy programmes and advocacy positions; public/organizational policy is the primary function. |
| process officer | 2421.7 | pass | Documents, reviews and improves organizational processes with stakeholders and KPIs; explicit process-improvement work. |
| procurement department manager | 1213.3 | pass | Converts organizational procurement goals into actions and leads procurement delivery; explicit procurement operations scope. |
| procurement support officer | 3343.1.5 | pass | Supports procurement processes, documents, compliance and coordination of meetings/contacts. |
| programme manager | 1213.4 | pass | Coordinates several simultaneous projects and their compatibility/overall outcomes; direct programme-management fit. |
| project support officer | 3343.1.6 | pass | Provides PMO services, project documentation, assistance and training for successful project execution. |
| promoter | 3339.4 | revise/reassign | Arranges and promotes live performances, negotiates artist/venue deals and schedules event logistics; entertainment/event promotion is the occupation, not general project/programme management. |
| publishing rights manager | 3339.5 | revise/reassign | Organizes copyright and licensing sales for books; publishing-rights work. |
| relocation officer | 3339.6 | revise/reassign | Plans employee moves and relocation services/real estate advice; specialized employee relocation service, not a general project role. |
| social security administrator | 1213.2.1 | revise/reassign | Directs government social-security programmes and investigates policy; social-protection administration is the primary field. |
| strategic planning manager | 1213.2.2 | pass | Creates organization-wide strategic plans and coordinates departmental implementation. |
| supply chain assistant | 3343.1.7 | pass | Follows purchasing, manufacturing and distribution actions/contracts/orders; explicit operations and procurement support. |
| sustainability manager | 1213.8 | revise/reassign | Develops sustainability policies/measures and regulatory/social-responsibility compliance; sustainability management is primary. |
| talent agent | 3339.7 | revise/reassign | Represents entertainment/media/sports talent and promotes clients to employers; talent representation. |
| tourism contract negotiator | 3339.8 | revise/reassign | Negotiates contracts between tour operators and tourism suppliers; tourism contracting. |
| tourism policy director | 1213.2.3 | revise/reassign | Develops tourism policy/marketing plans and monitors the tourism industry; tourism policy is primary. |

**D032 disposition:** 18 pass; 20 revise/reassign; 0 unresolved; 0 remove-only. Pass mappings establish direct domain→role support at the parent-domain level; no subgroup path is inferred.

## D033 — Product Management (51 mappings)

Parent-scope basis from `domain_meta.json`: guide products from idea to finished offering and set direction; product owners/development managers lead strategy; engineers/architects build underlying technology; analysts scope requirements, costs and processes. A role being in ICT, management or analytics alone is insufficient; the task description must connect to product direction, product development, or underlying product technology/usability.

| Current role | ESCO code | Domain disposition | Task evidence / reason |
|---|---:|---|---|
| artificial intelligence engineer | 2511.11 | pass | Designs AI programs/systems, including cognitive/knowledge systems and decision/problem-solving methods; underlying product technology. |
| blockchain architect | 2511.14.1 | pass | Designs architecture/components/interfaces/data for blockchain-based systems against requirements; underlying product technology. |
| branch manager | 1213.5.1 | revise/reassign | Runs a geographic business branch and implements company strategy; no product lifecycle responsibility stated. |
| building information modelling consultant | 2421.6 | revise/reassign | Advises on BIM business processes and construction-team implementation; specialized BIM consulting, not product management or development. |
| business analyst | 2421.1 | revise/reassign | Analyses company strategy/structure and markets broadly; description does not establish product requirements or lifecycle work. |
| business consultant | 2421.2 | revise/reassign | Advises on business structure/process inefficiencies broadly; no product-specific task. |
| business intelligence manager | 2421.3 | revise/reassign | Analyses company supply-chain/warehouse/sales operations; no product direction or product analytics stated. |
| business manager | 1213.5 | revise/reassign | Sets business-unit objectives and operations plans; general business management, not product management. |
| chief product officer | 1223.3 | pass | Defines product vision/strategy/roadmap, prioritizes customer needs and oversees product development lifecycle. |
| clothing development manager | 1223.2.1.1 | pass | Defines clothing product concepts for target consumers and directs seasonal/strategic product concepts and implementation. |
| computer scientist | 2511.1 | revise/reassign | Researches fundamental computing and invents approaches to computing technology; no product development/use context in the task description. |
| computer vision engineer | 2511.2 | pass | Designs, develops and trains computer-vision/ML algorithms for real-world applications; underlying product technology. |
| data analyst | 2511.3 | revise/reassign | Cleans, models and interprets company data generally; the description does not connect analysis to product decisions or a product team. |
| data engineer | 2511.20 | revise/reassign | Builds data-processing/storage architecture and pipelines for data-science use; general data infrastructure, not explicitly product technology. |
| data scientist | 2511.4 | revise/reassign | Interprets datasets, builds statistical models and communicates findings; no product-specific research or product lifecycle is established. |
| director of compliance and information security | 1213.9 | revise/reassign | Oversees regulatory compliance and IT security; security/compliance function, not product management. |
| embedded system designer | 2511.5 | pass | Designs embedded-control-system requirements and architecture; underlying technology used in products. |
| enterprise architect | 2511.6 | revise/reassign | Aligns organization-wide ICT assets/processes and business strategy; enterprise architecture rather than product architecture. |
| EU funds manager | 1213.6 | revise/reassign | Administers public funds and operational programmes; no product work stated. |
| games development manager | 1223.2.1.3 | pass | Coordinates game creation, development, distribution and sale; explicit game-product lifecycle. |
| green ICT consultant | 2511.7 | revise/reassign | Advises on organizational environmental ICT strategy/objectives; not product development. |
| health safety and environmental manager | 1213.7 | revise/reassign | Manages HSE policies, risk and regulatory compliance; HSE function. |
| ICT business analysis manager | 2511.8 | revise/reassign | Identifies organizational information-system changes and change impacts; description is business-system change, not product requirements/lifecycle. |
| ICT business analyst | 2511.9 | revise/reassign | Analyses organizational processes/systems, captures requirements and assesses change impacts; no product context is specified. |
| ICT consultant | 2511.10 | revise/reassign | Advises organizations on existing ICT tools and technology projects broadly; not product-specific. |
| ICT research consultant | 2511.12 | revise/reassign | Conducts client ICT research/surveys and makes recommendations; research consultancy, not product R&D or product lifecycle. |
| ICT research manager | 1223.2.2.1 | revise/reassign | Manages ICT research/trends and training; description does not establish responsibility for a product's development lifecycle. |
| ICT system analyst | 2511.13 | revise/reassign | Specifies end-user system needs and designs IT solutions for business efficiency; system analysis is not shown as product-specific. |
| ICT system architect | 2511.14 | pass | Designs multi-component system architecture, modules, interfaces and data against requirements; underlying product/system technology. |
| ICT system developer | 2511.15 | revise/reassign | Maintains/audits organizational support systems and resolves faults; support-system maintenance, not product development. |
| ICT system integration consultant | 2511.16 | revise/reassign | Integrates organizational systems for interoperability/data sharing; enterprise integration, not product architecture/lifecycle. |
| innovation officer | 1223.2.3 | revise/reassign | Leads industrial innovation strategy and organizational response to market disruption; no explicit ownership of a product lifecycle. |
| insurance product manager | 1223.1.1 | pass | Directs development of insurance products through lifecycle and coordinates their product-specific marketing/sales. |
| integration engineer | 2511.17 | revise/reassign | Integrates applications across enterprise units and evaluates organizational systems; no product context stated. |
| IT auditor | 2511.18 | revise/reassign | Audits information systems, infrastructure and controls; assurance/risk work, not product development. |
| lean manager | 2421.4 | revise/reassign | Runs cross-business lean/continuous-improvement programmes; operational excellence, not product management. |
| logistics analyst | 2421.5 | revise/reassign | Improves product manufacturing/transport/storage/distribution logistics; supply-chain analysis, not product lifecycle. |
| manufacturing cost estimator | 2421.1.1 | revise/reassign | Estimates manufacturing cost/material/labour/time and compares processes; cost estimation is not product management. |
| policy manager | 1213.2 | revise/reassign | Develops policy programmes/positions and advocacy; policy function. |
| process officer | 2421.7 | revise/reassign | Documents and improves organizational processes/KPIs; process management, not product-specific. |
| procurement department manager | 1213.3 | revise/reassign | Leads public procurement objectives/team; procurement function, not product management. |
| product development manager | 1223.2.1 | pass | Coordinates products from concept through development, market research, technical/cost criteria and prototyping. |
| product manager | 1223.1 | pass | Manages product lifecycle, research/development, market research, strategy and product marketing/planning. |
| programme manager | 1213.4 | revise/reassign | Coordinates several projects and programme compatibility/profitability; programme management, not product lifecycle. |
| research and development manager | 1223.2 | pass | Coordinates research/product developers toward new products or improvement of existing products. |
| research manager | 1223.2.2 | revise/reassign | Oversees research facility/programme projects across sectors; not necessarily product R&D. |
| social security administrator | 1213.2.1 | revise/reassign | Directs public social-security programmes and policy; public administration. |
| strategic planning manager | 1213.2.2 | revise/reassign | Develops whole-company and department strategic plans; not product strategy per task description. |
| sustainability manager | 1213.8 | revise/reassign | Ensures process/product regulatory and social-responsibility compliance; product compliance is only a component, not product management/development. |
| tourism policy director | 1213.2.3 | revise/reassign | Develops tourism policies/marketing plans and monitors tourism; tourism policy. |
| user experience analyst | 2511.19 | pass | Studies user behaviour/experience of products, systems and services and recommends usability/interface improvements; direct product experience evidence. |

**D033 disposition:** 13 pass; 38 revise/reassign; 0 unresolved; 0 remove-only. “Pass” includes only task descriptions establishing product direction/development, underlying product technology, or product-use evaluation. Generic ICT, analytics, management and compliance roles are not accepted solely because they can support product teams.

## Checkpoint totals

| Slice | Reviewed | Pass | Revise/reassign | Unresolved | Remove-only |
|---|---:|---:|---:|---:|---:|
| D032 | 38 | 18 | 20 | 0 | 0 |
| D033 | 51 | 13 | 38 | 0 | 0 |
| This checkpoint | **89** | **31** | **58** | **0** | **0** |
| Prior D029–D031 checkpoints | 184 | 140 | 42 | 2 | 0 |
| Cumulative D029–D033 | **273/915** | **171** | **100** | **2** | **0** |

**Remaining in D029–D056:** 642/915 mappings, D034–D056. Specialization reconciliation remains provisional for all 273 reviewed mappings until the parent specialization sets are finalized. No canonical domain, subgroup, role, or mapping files were edited.
