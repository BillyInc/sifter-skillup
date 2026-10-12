# D001–D084 Role-to-Domain Audit — Checkpoint

Date: 2026-10-05  
Status: in progress; D001 completed and persisted, D002–D084 remain.

## Scope and lane accounting

This is Aquinas's D001–D084 lane only. The other lane covers D085–D168 except D119. No SQL was applied. No D085–D168 or D119 source review was repeated.

The authoritative whole-catalogue snapshot reconciled by the lane queue is **3,919** unique canonical mappings. Before this D001 slice, **3,899** mappings were assigned to the two unresolved lanes (2,206 D001–D084 plus 1,693 D085–D168 excluding D119), and **20 D119 mappings** already had a separate role-fit ledger. The D119 ledger still resolves all 20 exact keys to canonical records and all 20 contain both parent-domain and specialization dispositions; key mismatches: 0. These D119 source decisions were not redone.

The generated explicit-status count means **3,914 canonical rows lacked an explicit semantic status field, while five had an explicit `not_supported` status** (3,914 + 5 = 3,919). It is a field-presence count, not a count of reviewed work: D119's 20 dispositions live in a separate ledger. After this D001 work, the current canonical status-field counts are 3,877 without a field, 25 `supported`, 5 `conditional`, 5 `unsupported`, 2 `unresolved`, and 5 pre-existing `not_supported` (total 3,919).

Current reconciliation: **37 D001 decisions persisted + 2,169 remaining D001–D084 mappings + 1,693 D085–D168 mappings outside D119 + 20 previously reviewed D119 ledger rows = 3,919**.

## D001 completed slice

The D001 canonical source had 37 role mappings and was byte-compared by role key and description against the inventory before edits. Every decision compares task evidence to the parent-domain scope and separately to the candidate specialization boundary, “Build, test and maintain software systems and applications.” The subgroup membership, ISCO/ESCO group, title similarity and frequency were not used as fit evidence. The specialization remains a candidate only; `domain_structure.json` and subgroup visibility were not changed.

| D001 disposition | Count |
|---|---:|
| Parent-domain fit supported | 25 |
| Parent-domain fit conditional | 5 |
| Parent-domain fit unresolved | 2 |
| Parent-domain path unsupported and excluded from student paths | 5 |
| Specialization fit supported / conditional / unresolved / not applicable | 23 / 7 / 2 / 5 |

The five D001-only excluded paths are `cloud identity manager`, `ICT disaster recovery analyst`, `Information Technology Project Managers`, `Video Game Designers`, and `web content manager`. Their occupation records remain in the catalogue. The two WEF-only family rows (`Software and Applications Developers`, `Full Stack Engineers`) remain unresolved: the WEF report gives job-category/trend information, not task profiles. Conditional rows retain their scope qualification in canonical rationale fields; they have not been relabelled as confirmed.

Each reviewed role now has domain and specialization status, separate rationale, source URLs, and review date in its canonical D001 record. Role-specific ESCO URIs and O*NET profile URLs are retained. O*NET profiles are US occupational task sources, not evidence of global licensing or demand. The official WEF source is [Future of Jobs Report 2025, jobs outlook](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/); it does not resolve the WEF-only task gap.

## Artifacts and deterministic checks

- `D001_role_fit_decisions.json` — D001 role-by-role task-based decision register.
- `D001_reviewed_decisions.json` and `.md` — refreshed canonical values, source task profiles/links, separate domain/specialization decisions, and D119/global-count reconciliation.
- `D001_D084_inventory_and_triage.json` and `.md` — lane-wide reproducible source joins, duplicate-pattern triage and refreshed canonical statuses.
- `build_lane_inventory.py` — reproducible D001–D084 inventory/source-profile joins; no semantic inference from repeated patterns.
- `apply_d001_review.py` — dry-run by default, checks exact D001 keys and descriptions, then applies only the recorded D001 decisions and unsupported-path exclusions.
- `compact_d001_role_records.py` — restores the original D001 object formatting from the verified pre-edit HEAD objects while retaining only scoped review fields; unrelated catalogue bytes are preserved.
- `build_d001_review_report.py` — checks all D119 keys/dispositions against canonical roles without repeating the source reviews and emits the completed D001 checkpoint.
- `test_d001_role_fit_lane.py` — exact-key coverage, separate statuses/rationales/source references, five exclusions, D119 reconciliation, and 3,919-count arithmetic.

Commands passed:

```powershell
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/D001_D084/apply_d001_review.py
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/D001_D084/apply_d001_review.py --apply
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/D001_D084/compact_d001_role_records.py
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/D001_D084/build_lane_inventory.py
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/D001_D084/build_d001_review_report.py
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.D001_D084.test_d001_role_fit_lane -v
```

Result: **4 tests passed**. No generated seed was rebuilt and no shared global audit output or SQL was edited.

## D002 completed parent-domain fit slice

Reviewed all **25 exact D002 canonical role-mapping keys** against the D002 parent scope only. No role-to-specialization fit was assessed, assigned, or counted as completed. The earlier D002 specialization recommendation remains historical/provisional and was not used as evidence for these role-domain decisions. No subgroup taxonomy or canonical role/domain JSON was changed.

| D002 parent-domain disposition | Count |
|---|---:|
| Supported | 9 |
| Conditional | 6 |
| Unsupported | 8 |
| Unresolved (task identity/evidence insufficient) | 2 |
| Total reviewed | 25 |

The two unresolved WEF-labelled records (`Big Data Specialists`, `Database and Network Professionals`) have trend-category evidence, not role-task evidence. Broad ICT/system/analysis roles were not accepted merely because they can work with data in some assignments. Direct data engineering, warehouse, database design/operation, database integration and data-sharing tasks were assessed against the stated D002 scope. Conditional dispositions are bounded by the actual task profile and are not affirmative universal role matches.

Lane-only decision artifact: `D002_role_domain_fit_2026_10_05.json`. Each row records the exact role key, task evidence, parent-domain disposition, rationale, source URLs and source limitations; it contains no specialization decision fields.

Sources include role-specific ESCO occupation profiles and linked O*NET task profiles stored in the source-join inventory, plus DAMA International's overview of data-management knowledge areas: https://dama.org/dmbok2r-infographics/. ESCO and O*NET support task identity/comparison, not global licensure or demand; WEF is trend evidence only.

Validation: exact D002 inventory-key equality passed (25/25); status arithmetic passed (9 + 6 + 8 + 2 = 25); every decision has task evidence, basis and source references; no specialization/subgroup fields were emitted. Remaining D001-D084 lane work after completed D001 and D002: **2,144 mappings**.

## D003 completed parent-domain fit slice

Reviewed all **5 exact D003 canonical role-mapping keys** against the D003 parent scope only. No role-to-specialization fit was assessed, assigned, or counted as completed; no subgroup taxonomy or canonical role/domain JSON was changed.

| D003 parent-domain disposition | Count |
|---|---:|
| Supported | 2 |
| Conditional | 2 |
| Unsupported | 0 |
| Unresolved (task evidence insufficient) | 1 |
| Total reviewed | 5 |

`AI and Machine Learning Specialists` remains unresolved because its WEF citation establishes growth classification, not role tasks. Generic `computer scientist` and `data scientist` records are conditional: their broad task profiles do not mean every role in those occupations performs AI/ML work. The AI engineer and computer-vision engineer records directly describe AI system/model development or training and are supported for D003.

Lane-only decision artifact: `D003_role_domain_fit_2026_10_05.json`. Rows contain parent-domain task evidence, disposition, rationale, sources and source limitations only; no specialization fields.

Validation: exact D003 inventory-key equality passed (5/5); status arithmetic passed (2 + 2 + 0 + 1 = 5); all five decisions have task evidence, basis and source references. O*NET is used only as a US task crosswalk; WEF trend data is not treated as occupational task evidence.

## D004 completed parent-domain fit slice

Reviewed all **17 exact D004 canonical role-mapping keys** against the D004 parent scope only. No role-to-specialization fit was assessed, assigned, or counted as completed; no subgroup taxonomy or canonical role/domain JSON was changed.

| D004 parent-domain disposition | Count |
|---|---:|
| Supported | 12 |
| Conditional | 4 |
| Unsupported | 1 |
| Unresolved | 0 |
| Total reviewed | 17 |

The unsupported path is `Forensic Science Technicians`: the linked O*NET task profile concerns physical evidence (e.g. fibres, hair, tissue), not cyber/digital evidence. The four conditional paths are the two compliance/security directors, ICT disaster recovery analyst and Security Management Specialists because their task scopes mix or may refer to non-cyber work. NIST NICE was used as an authoritative task-based cybersecurity work boundary; it does not make local job titles or legal requirements universal.

Lane-only decision artifact: `D004_role_domain_fit_2026_10_05.json`. Each row records parent-domain task evidence, disposition, rationale, sources and source limitations only; no specialization fields.

Validation: exact D004 inventory-key equality passed (17/17); status arithmetic passed (12 + 4 + 1 + 0 = 17); all decisions have task evidence, basis and source references. No canonical data was edited.

## D005 completed parent-domain fit slice

Reviewed all **17 exact D005 canonical role-mapping keys** against the D005 parent scope only. No role-to-specialization fit was assessed, assigned, or counted as completed; no subgroup taxonomy or canonical role/domain JSON was changed.

| D005 parent-domain disposition | Count |
|---|---:|
| Supported | 4 |
| Conditional | 10 |
| Unsupported | 2 |
| Unresolved (task evidence insufficient) | 1 |
| Total reviewed | 17 |

Cloud architect, cloud DevOps engineer, cloud engineer and cloud software developer have direct cloud-workload tasks. Generic network/system administration and architecture paths remain conditional because their source profiles also describe non-cloud work. Communication infrastructure maintainer and IoT developer are unsupported for this D005 mapping because their task evidence does not establish cloud/DevOps work. The WEF-only `DevOps Engineers` entry is unresolved; its growth label cannot substitute for a task profile.

Lane-only decision artifact: `D005_role_domain_fit_2026_10_05.json`. Its rows contain parent-domain task evidence, disposition, rationale, sources and source limitations only. NIST SP 800-145 was used to bound cloud computing as shared, configurable computing resources accessed over networks; it does not classify all network or data-centre roles as cloud work.

Validation: exact D005 inventory-key equality passed (17/17); status arithmetic passed (4 + 10 + 2 + 1 = 17); every row has task evidence, basis, source references and limitations. The new lane test validates exact keys and the parent-only evidence shape for D002-D005. No canonical data was edited.

## D006 completed parent-domain fit slice

Reviewed all **17 exact D006 canonical role-mapping keys** against the D006 parent scope only. No role-to-specialization fit was assessed or assigned; no subgroup taxonomy or canonical role/domain JSON was changed.

| D006 parent-domain disposition | Count |
|---|---:|
| Supported | 4 |
| Conditional | 6 |
| Unsupported | 0 |
| Unresolved (no traceable role-task source) | 7 |
| Total reviewed | 17 |

The four source-backed matches explicitly concern embedded-control design, embedded-system security/software, or software for connected IoT devices. Generic system/software test and sensor roles are conditional on actually working on connected/embedded systems. Seven local/WEF entries lack a traceable role-task source: edge computing engineer, embedded systems engineer, Internet of Things Specialists, IoT data analyst, IoT security specialist, IoT solutions architect and IoT systems integrator. NIST IoT material supports the technology context but is not treated as proof of those exact job descriptions.

Lane-only decision artifact: `D006_role_domain_fit_2026_10_05.json`. It contains parent-domain task evidence, disposition, rationale, sources and limitations only. The lane test now discovers and validates every saved D002+ domain slice against exact inventory keys and rejects specialization/subgroup fields.

Validation: exact D006 inventory-key equality passed (17/17); status arithmetic passed (4 + 6 + 0 + 7 = 17); every row has task evidence, basis, source references and limitations. No canonical data was edited.

## D007 completed parent-domain fit slice

Reviewed all **26 exact D007 role-mapping keys** against the D007 parent-domain scope only. No role-to-specialization fit was assessed or assigned; no subgroup taxonomy or canonical role/domain JSON was changed.

| D007 parent-domain disposition | Count |
|---|---:|
| Supported | 4 |
| Conditional | 16 |
| Unsupported | 4 |
| Unresolved (task identity/evidence insufficient) | 2 |
| Total reviewed | 26 |

The four supported tasks directly design user interfaces/web experiences or evaluate usability/accessibility (`ICT accessibility tester`, `ICT usability tester`, `user interface designer`, `web designer`). Conditional decisions are bounded: visual-art/animation/graphic work counts only when tied to digital products/interfaces; generic testing only when aimed at interface usability/accessibility; and web development only where the documented work implements the interface. General game software development, stage-performance projection design, SEO/search marketing and web-content governance are outside the supplied D007 task boundary. `Designers, All Other` and the WEF-only `UI and UX Designers` trend label remain unresolved because neither record supplies a specific task profile. The performance-video row's O*NET video-game crosswalk was discounted as inconsistent with the exact ESCO task identity.

Lane-only decision artifact: `D007_role_domain_fit_2026_10_05.json`. Each row records the exact key, source-described tasks, decision rationale, evidence URLs and limitations. W3C/WAI material supports the accessibility/usability evaluation boundary; it is not used to infer job identity. O*NET is treated as US task evidence and crosswalks are not allowed to override better-aligned ESCO task definitions.

Validation: exact D007 inventory-key equality passed (26/26); status arithmetic passed (4 + 16 + 4 + 2 = 26); every row has task evidence, basis, sources and source limitations. The lane test also confirmed no specialization/subgroup fields are present. No canonical data was edited.

## D008 completed parent-domain fit slice

Reviewed all **15 exact D008 role-mapping keys** against the telecommunications parent-domain task boundary only. No role-to-specialization fit was assessed or assigned; no subgroup taxonomy or canonical role/domain JSON was changed.

| D008 parent-domain disposition | Count |
|---|---:|
| Supported | 4 |
| Conditional | 9 |
| Unsupported | 2 |
| Unresolved | 0 |
| Total reviewed | 15 |

The supported roles explicitly perform telecommunications system/network analysis, engineering, technical maintenance or management. Broad ICT capacity/network/project/product/operations roles and the aviation data communications manager are conditional because telecom infrastructure/service scope must be present; the cross-cutting O*NET computer/information systems manager is conditional for the same reason. General CTO and information/knowledge-management tasks are unsupported without a telecom remit. ITU recommendations were used to frame telecommunications as signal/data transmission and network work, not to establish individual job duties. The COREN registration clause in the source domain description is Nigeria-specific and was not treated as a global domain-fit criterion.

Lane-only decision artifact: `D008_role_domain_fit_2026_10_05.json`. Every row includes task evidence, rationale, references and evidence limits.

Validation: exact D008 inventory-key equality passed (15/15); status arithmetic passed (4 + 9 + 2 + 0 = 15); all decisions include task evidence, basis, sources and limitations. No canonical data was edited.

## D009–D044 block checkpoint (parent-domain fit only)

Built the block worklist from `D001_D084_inventory_and_triage.json`, treating its role mappings as the exact queue. The block spans 36 domain IDs, 32 with mapped roles; D037–D040 have zero mappings in the saved queue. The worklist has **1,484 distinct role mappings** and **2,538 safely deduplicated task-source payload records**. Deduplication uses ESCO URI or O*NET-SOC identity plus a content fingerprint; conflicting payload versions remain separate. Every mapping retains its own exact role key and its own task/domain review slot. The script performs retrieval, joining and validation only—it does not assign fit.

### D009 completed

Reviewed **38/38** exact D009 role keys against the parent `Data Science` scope. Dispositions: **12 supported, 12 conditional, 12 unsupported, 2 unresolved**. The exact covered keys, per-role task evidence, rationale, source URLs/citations and limitations are persisted in `D009_role_domain_fit_2026_10_05.json`; the generated worklist records the disposition and artifact reference for each of those keys. The two unresolved records lack an occupational task profile (WEF trend category; O*NET residual mathematical-science category). No fit was inferred from a role title or occupational family.

Source evidence includes per-role ESCO occupation identifiers and O*NET occupation/task profiles in the decision artifact. Example primary source links: [ESCO occupation profile—data scientist](http://data.europa.eu/esco/occupation/258e46f9-0075-4a2e-adae-1ff0477e0f30), [O*NET—operations research analysts](https://www.onetonline.org/link/summary/15-2031.00), and [WEF Future of Jobs 2025](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/) (trend evidence only, not role-task evidence).

Validation: exact D009 key coverage, duplicate/omission checks, permitted status/count checks, task-evidence/source-limit fields and parent-only schema tests passed. The D009–D044 queue now has **38 covered / 1,446 remaining**. Across the larger D009–D084 lane, **38 covered / 2,009 remaining**. The next untouched mapped domain is D010.

Block artifacts: `build_review_worklist_d009_d044.py` generates `D009_D044_parent_domain_review_worklist.json`; `test_d009_d044_parent_domain_worklist.py` validates exact queue coverage, source references and any saved semantic decisions. No canonical role/domain mapping was changed. No subgroup or specialization audit was performed.

### D010 completed

Reviewed **39/39** exact D010 keys against `Business Intelligence and Analytics`. Dispositions: **14 supported, 14 conditional, 9 unsupported, 2 unresolved**. Exact keys and per-role rationales, source citations and limitations are in `D010_role_domain_fit_2026_10_05.json`; the generated worklist carries the disposition and decision-file reference per key. The supported roles directly analyze/recommend business-process improvements, generate intelligence from business records, engineer analytics data systems, or build quantitative business models. Generic ICT architecture/testing/management is not promoted merely because it handles information; its disposition remains conditional or unsupported based on the stated tasks. Residual “all other” categories remain unresolved without task statements.

Sources are recorded per decision, including [O*NET Business Intelligence Analysts](https://www.onetonline.org/link/summary/15-2051.01) task evidence and exact ESCO occupation-profile URLs. O*NET supplies occupation/task evidence; this does not assert that every employer uses identical analytics methods.

Validation: exact D010 role-key coverage passed with no duplicate/omitted keys; only the four permitted dispositions appear; task evidence, rationale, source references and source limits are mandatory. Parent-only worklist/schema tests passed. The D009–D044 block now has **77 covered / 1,407 remaining**. Across D009–D084, **77 covered / 1,970 remaining**. Next is D011.

### D011 completed

Reviewed **23/23** exact D011 role keys against the parent `Quantitative Finance and Financial Engineering` scope. Dispositions: **16 supported, 7 conditional, 0 unsupported, 0 unresolved**. The decision artifact contains the exact covered role keys, task-level evidence, rationale, source URLs and limitations; the generated worklist links each key to its decision. Conditional cases require a financial-market, investment-analysis, or financial-risk application; general mathematics/statistics, deal execution, brokerage, or underwriting alone is not enough to claim quantitative-finance fit. No fit was inferred from ISCO/ESCO family or subgroup membership.

Role-level source citations are stored per decision in `D011_role_domain_fit_2026_10_05.json`, principally exact [ESCO occupation profiles](https://esco.ec.europa.eu/en/classification/occupation_main) and [O*NET Credit Analysts](https://www.onetonline.org/link/summary/13-2041.00). ESCO/O*NET describe occupation tasks; O*NET is US-context evidence and neither source establishes universal licensing or demand. The artifact records role-specific ESCO URLs and explicit source limitations.

Validation: exact D011 role-key coverage passed with no duplicate/omitted keys; disposition counts sum to 23; task evidence, rationale, source references and source limitations are present. The worklist exact-queue/source-join checks, completed-slice checks and D001 regression checks passed (**9 tests**). The D009–D044 block now has **100 covered / 1,384 remaining**. Across D009–D084, **100 covered / 1,947 remaining**. Next is D012.

### D012 completed

Reviewed **14/14** exact D012 role keys against the parent `FinTech Engineering` scope. Dispositions: **3 supported, 6 conditional, 4 unsupported, 1 unresolved**. Blockchain architecture/development/engineering is supported where the task profile explicitly covers blockchain systems; sector-neutral software analysis/development/testing and ICT testing are conditional on a financial-services system assignment. Financial analysis, back-office transaction processing, quantitative securities analysis without software-systems engineering, and financial sales/trading are unsupported against this engineering scope. The WEF `FinTech Engineers` trend label remains unresolved because it contains no task profile.

The decision artifact `D012_role_domain_fit_2026_10_05.json` records exact role keys, task evidence, rationale, source URLs and limitations. ESCO occupation profiles and O*NET occupation/task profiles support the task statements; WEF is used only as trend provenance. No decision was inferred from title or occupational/subgroup membership.

Validation: regenerated the exact-key worklist; it now reports **114 reviewed / 1,370 remaining** across D009–D044. The worklist and role-slice tests passed (**5 tests, 1,510 subtests**), including exact D012 inventory-key equality, complete disposition arithmetic, mandatory evidence fields, and exclusion of subgroup/specialization decision fields. No canonical role/domain JSON was edited. Next is D013.

### D013 completed

Reviewed **36/36** exact D013 role keys against the parent `Investment Analysis and Asset Management` scope. Dispositions: **21 supported, 10 conditional, 4 unsupported, 1 unresolved**. Supported cases perform portfolio/fund management, investment advice/research, securities/FX/futures/energy trading, broking, or venture investment. Conditional cases span investment and adjacent corporate/enterprise-risk/insurance/transaction tasks; they require the investment-specific work described in each rationale. Investor-relations communication, public-programme funding advice/administration, and relationship-banking product sales are unsupported under this domain scope. The WEF-only `Financial and Investment Advisers` trend label remains unresolved because it has no task definition.

`D013_role_domain_fit_2026_10_05.json` records all exact keys, source-derived task text, per-role rationale, URLs and evidence limits. `build_d013_decisions.py` deterministically materializes the artifact from the curated role-key rulings plus the exact source/task queue; it refuses generation if the D013 queue changes. Its WEF URL is retained only as trend provenance and is not used as role-task evidence. No canonical role/domain JSON was edited.

Validation: the exact-queue generator reports **150 reviewed / 1,334 remaining** across D009–D044. The role worklist and slice tests pass, covering exact key equality, the 36/36 D013 artifact, decision-count arithmetic, task/source/rationale fields, and parent-only scope (no subgroup/specialization fields). An initial test failure identified the missing WEF trend citation; the source was added with an explicit source-limit note, then tests were rerun successfully. Next is D014.

### D014 completed

Reviewed **16/16** exact D014 role keys against the parent `Actuarial Science` scope. Dispositions: **8 supported, 5 conditional, 2 unsupported, 1 unresolved**. Supported roles perform actuarial premium/liability modeling, insurance-risk/underwriting assessment, rating, or claims processing. Sector-neutral mathematics/statistics, fraud investigation, and loss adjustment are conditional on the stated actuarial/insurance-risk use; insurance product sales/brokering is unsupported without actuarial risk work. The WEF-only `Risk Management Specialists` row remains unresolved because the trend label supplies no task definition.

`D014_role_domain_fit_2026_10_05.json` records exact role keys, task evidence, rationale, source URLs and limitations. The profile evidence comes from the lane's ESCO/O*NET task records; WEF is only trend provenance. No role-to-specialization, subgroup membership, or canonical taxonomy edits were made.

Validation: rebuilt the exact-key D009–D044 queue (**166 reviewed / 1,318 remaining**) and ran both lane test modules: **5 passed, 1,516 subtests passed**. Coverage is per exact role key, not a sum inferred from broad mapping totals. Next is D015.

### D015 completed

Reviewed **22/22** exact D015 role keys against the parent `Accounting` scope. Dispositions: **14 supported, 7 conditional, 1 unsupported, 0 unresolved**. Direct accounting, audit, bookkeeping, billing, budget/cost, tax and public-finance-accounting tasks are supported. Broad financial back-office, insolvency, dividend, forensic-fraud and grant-finance tasks are conditional on substantive accounting/reconciliation/control duties. Investment-clerical administration alone is unsupported. Nigeria-specific credential language in the parent description was explicitly excluded from the global occupational fit test.

`D015_role_domain_fit_2026_10_05.json` and `build_d015_decisions.py` preserve the per-key task evidence, role-specific rationale, source links, source limits and curated disposition. The helper checks all 22 exact role names against the current worklist and fails closed if the queue changes. No canonical role/domain data or role-to-specialization mapping was changed.

Validation: worklist regeneration reports **188 reviewed / 1,296 remaining** in D009–D044. The exact-key/source/evidence tests passed (**5 passed, 1,519 subtests passed**). Next is D016.

### D016 completed

Reviewed **35/35** exact D016 role keys against the parent `Electrical Engineering` scope. Dispositions: **20 supported, 13 conditional, 0 unsupported, 2 unresolved**. Direct electrical/power, circuits/electronics, battery systems, sensor, calibration and electrical distribution tasks are supported. Multidisciplinary electromechanical, manufacturing, instrumentation, hydropower, medical-device, satellite and predictive-maintenance roles are conditional on the electrical/electronic task context specified per row. The two WEF-only labels remain unresolved because they lack task profiles. Nigeria-specific COREN registration text was not used to define global role fit.

`D016_role_domain_fit_2026_10_05.json` records per-key task evidence, rationale, source URLs and source limits. `build_d016_decisions.py` checks the exact current queue and role names before materializing decisions. No canonical taxonomy data or role-to-specialization mapping was changed.

Validation: regenerated the queue at **223 reviewed / 1,261 remaining** for D009–D044; tests passed (**5 passed, 1,522 subtests passed**), including exact-key coverage and evidence/schema gates. Next is D017.

### D017 completed

Reviewed **45/45** exact D017 role keys against the parent `Mechanical Engineering` scope. Dispositions: **23 supported, 17 conditional, 5 unsupported, 0 unresolved**. Direct mechanical design, machinery, engine/powertrain, HVAC, tooling, rotating equipment, rolling stock and mechanical manufacturing tasks are supported. Aerospace, CAD/drafting, electromechanical/mechatronic and broad production-supervision occupations are conditional on the mechanical task context specified per row. Architectural drafting, electrical/electronics drafting/production and PCB layout are unsupported against this parent scope.

`D017_role_domain_fit_2026_10_05.json` contains all exact-key task evidence, role-specific rationale, source URLs and limits. `build_d017_decisions.py` checks the exact queue before creating the slice; it is not a title/ISCO classifier. Nigeria-specific COREN wording was not used as a global fit criterion. No canonical taxonomy data or role-to-specialization mapping was changed.

Validation: worklist rebuilt to **268 reviewed / 1,216 remaining** for D009–D044. The two lane test modules passed (**5 passed, 1,525 subtests passed**), including exact mapping-key coverage, evidence joins, disposition totals and no subgroup/specialization fields. Next is D018.

### D018 completed

Reviewed **67/67** exact D018 role keys against the parent `Civil Engineering` scope. Dispositions: **22 supported, 39 conditional, 6 unsupported, 0 unresolved**. Direct civil/infrastructure roles (roads, bridges, buildings, drainage, water, rail, transport, quantity surveying and construction project engineering) are supported. Generic engineering/drafting, building-safety, energy, fire, geotechnical, pipeline and multidisciplinary jobs are conditional only for the precise civil/built-environment task described per row. Energy-sales advice, landfill/waste operations, logistics systems, mine supervision and patent/IP analysis are unsupported against this parent scope where the cited tasks do not concern civil infrastructure work.

`D018_role_domain_fit_2026_10_05.json` records every exact role key, source-derived task text, rationale, source URL and limitations. `build_d018_decisions.py` checks that its curated decisions still match the exact D018 queue before materializing the slice. The decision boundary excludes Nigeria-specific COREN wording as a global fit test. No canonical taxonomy data or role-to-specialization mapping was changed.

Validation: exact worklist regeneration reports **335/1,484 reviewed / 1,149 remaining** for D009–D044; the role worklist/slice tests pass (**5 passed, 1,528 subtests passed**). Next is D019.

### D019 completed

Reviewed **20/20** exact D019 role keys against `Renewable Energy Engineering`. Dispositions: **6 supported, 14 conditional, 0 unsupported, 0 unresolved**. The supported tasks explicitly operate geothermal, hydroelectric, offshore wind/wave/tidal, onshore wind and solar generation systems. Battery engineering, generic grid/transmission/distribution and source-neutral power-plant work is conditional on an evidenced renewable-generation or renewable-interconnection assignment; generic electricity work was not treated as renewable by default.

`D019_role_domain_fit_2026_10_05.json` records exact task evidence, per-role reasoning, ESCO links and limits. Its deterministic helper checks the 20 exact current role names before materialization. No canonical taxonomy or specialization mapping was edited.

### D020 completed

Reviewed **20/20** exact D020 role keys against `Environmental Engineering`. Dispositions: **18 supported, 2 conditional, 0 unsupported, 0 unresolved**. Environmental problem-solving, mining impact controls, hazardous-material/waste compliance, recycling, solid/liquid waste treatment and water/wastewater treatment tasks directly fit. Biogas plant and general occupational-safety work are conditional on the specific waste/emissions or environmental-compliance tasks described in their rationales.

`D020_role_domain_fit_2026_10_05.json` records the exact task/source/rationale for each mapping; its helper fails if the exact queue changes. Worklist regeneration now reports **375/1,484 reviewed / 1,109 remaining** across D009–D044. Exact-key/evidence tests pass (**5 passed, 1,534 subtests passed**). No canonical data or role-to-specialization assignment was changed. Next is D021.

### D021–D024 completed

D021: Reviewed **22/22** exact role keys against `Architecture and Urban Planning`: **13 supported, 8 conditional, 0 unsupported, 1 unresolved**. Built-environment architecture/planning tasks are supported; cross-sector design/building tasks are conditional on the specific assignment; the WEF trend-only row remains unresolved. See `D021_role_domain_fit_2026_10_05.json`.

D022: Reviewed **60/60** exact role keys against `Mining and Geosciences`: **43 supported, 15 conditional, 0 unsupported, 2 unresolved**. Extraction, exploration, mine/quarry operations, mineral processing, extraction safety and directly relevant geoscience tasks are supported; cross-sector geology, drilling, calibration, pumping and blasting are conditional on the stated extraction context. Two trend/residual rows without verifiable task profiles remain unresolved. See `D022_role_domain_fit_2026_10_05.json`.

D023: Reviewed **49/49** exact role keys against `Medicine`: **31 supported, 15 conditional, 2 unsupported, 1 unresolved**. Diagnosis, prevention, treatment and clinical diagnostic support are supported; allied/technical/operational roles are conditional on patient-care context; chiropractic practice and optical-lens manufacturing are unsupported against this scope. `Surgeons, All Other` remains unresolved because its task payload does not specify the work. See `D023_role_domain_fit_2026_10_05.json`.

D024: Reviewed **38/38** exact role keys against `Nursing`: **19 supported, 18 conditional, 0 unsupported, 1 unresolved**. Direct nursing, midwifery, emergency patient care and hands-on clinical support are supported; administrative, training, technical and broader health-service roles depend on the stated clinical/service assignment; the WEF trend-only row remains unresolved. See `D024_role_domain_fit_2026_10_05.json`.

After D024, the exact-key queue reported **544/1,484 reviewed / 940 remaining** in D009–D044. Both lane test modules passed (**5 passed, 1,546 subtests passed**). No canonical taxonomy or specialization data was edited.

### D025–D027 completed

D025: **20/20** Pharmacy role keys; **11 supported, 8 conditional, 1 unsupported, 0 unresolved**. Medicine dispensing, medication safety, drug research/manufacturing, quality and pharmacy operations were supported where tasks directly established those functions. Pharmaceutical trade/logistics, technical engineering and education are conditional on the medicine-specific scope; sales-only promotion is unsupported. For locally authored task rows without a source URI, authoritative BLS/ASCPT/FDA references were added; these references corroborate the stated function but do not establish a universal licence. See `D025_role_domain_fit_2026_10_05.json`.

D026: **26/26** Public Health role keys; **14 supported, 12 conditional, 0 unsupported, 0 unresolved**. Direct surveillance, prevention, health protection, population-health evidence, risk communication and programme delivery were supported. Workplace/environmental inspection, emergency training and general statistics were conditional on the explicit public/occupational health use. CDC/WHO primary references were attached to locally authored task rows. See `D026_role_domain_fit_2026_10_05.json`.

D027: **46/46** Biomedical Science role keys; **12 supported, 14 conditional, 20 unsupported, 0 unresolved**. Biomedical research, biological laboratory testing, pharmacology, physiology, genetics, immunology and related technician work were supported or conditionally included based on exact task context. Environmental monitoring, conservation, horticulture, aquaculture operations and other non-biomedical tasks were unsupported against this parent scope. See `D027_role_domain_fit_2026_10_05.json`.

After D027, the exact-key queue reported **636/1,484 reviewed / 848 remaining** in D009–D044. Both lane test modules passed (**5 passed, 1,555 subtests passed**). No canonical taxonomy or specialization data was edited.

### D028–D029 completed

D028: **45/45** General Management role keys; **10 supported, 28 conditional, 7 unsupported, 0 unresolved**. Broad enterprise/branch/department leadership and cross-organisational management consulting are supported; functional, facility, or sector managers are conditional on actual unit/people/resource leadership; specialist finance, supply-chain, BIM/construction, estimating and procurement task profiles without general-management duties are unsupported. See `D028_role_domain_fit_2026_10_05.json`.

D029: **16/16** Human Resources role keys; **10 supported, 6 conditional, 0 unsupported, 0 unresolved**. Staffing, HR operations, compensation, employee learning, labour relations and workforce inclusion tasks are supported. Coaching, external career/employment guidance, occupational analysis and volunteer management qualify only when the task is applied within an employer's workforce or employee programme. See `D029_role_domain_fit_2026_10_05.json`.

After D029, the exact-key queue reported **697/1,484 reviewed / 787 remaining** in D009–D044. Both lane test modules passed (**5 passed, 1,561 subtests passed**). No canonical taxonomy or specialization data was edited.

### D030 completed

Reviewed **46/46** exact D030 `Marketing and Brand Management` role keys: **23 supported, 20 conditional, 3 unsupported, 0 unresolved**. Direct market research, brand positioning, promotion, advertising, digital marketing and marketing communications tasks are supported. Commercial growth, customer experience, revenue, fundraising and sales-channel tasks are conditional on actual market-positioning/promotion work. Political/social activism, bid administration and licensing/IP-control task profiles are unsupported against this domain scope. See `D030_role_domain_fit_2026_10_05.json`.

After D030, the exact-key queue reported **743/1,484 reviewed / 741 remaining** in D009–D044. Both lane test modules passed (**5 passed, 1,564 subtests passed**). No canonical taxonomy or specialization data was edited.

### D031 completed

Reviewed **122/122** exact D031 `Sales and Business Development` role keys using the queue's exact task payloads and linked ESCO sources. Dispositions: **92 supported, 12 conditional, 15 unsupported, 3 unresolved**. Retail/wholesale selling, brokerage/trading, technical sales and direct buyer-facing transactions are supported. Purchase-only/procurement roles and marketing-only roles are separated from sales. Car leasing, licensing and renewable-energy consulting remain unresolved because the task profile does not establish a sufficiently explicit sales/trade function. The generation rule is fail-closed: unexplained task text remains unresolved rather than inferred from title.

`D031_role_domain_fit_2026_10_05.json` preserves exact role keys, task text, dispositions, rationale, source URLs and source limits. The worklist/slice tests pass (**5 passed, 1,567 subtests passed**). After D031, the exact-key queue reports **865/1,484 reviewed / 619 remaining** in D009–D044. No canonical taxonomy or specialization data was edited. Next: D032.

### D032 completed

Reviewed **38/38** exact D032 `Project and Programme Management` role keys: **6 supported, 24 conditional, 8 unsupported, 0 unresolved**. Programme/project management, project-office delivery support, lean improvement and process-improvement work are supported. Administrative, functional-management and specialist roles are conditional only for defined project/programme/change assignments; unrelated sales, rights, compliance and specialist tasks are unsupported. See `D032_role_domain_fit_2026_10_05.json`.

The exact worklist reports **903/1,484 reviewed / 581 remaining** in D009–D044. Both lane test modules pass (**5 passed, 1,570 subtests passed**). No canonical taxonomy or specialization data was edited. Next: D033.

### D033 completed

Reviewed **51/51** exact D033 `Product Management` role mappings against product-management work scope: **7 supported, 20 conditional, 24 unsupported, 0 unresolved**. The decision register preserves each role's task text and source references; conditional means the role's described analytical, research, architecture, process or user-insight work connects to product requirements/lifecycle only when that connection is actually part of the assignment. Building or integrating a product, general management, policy, procurement, compliance, or market-adjacent work alone was not counted as product-management ownership. No subgroup or role-to-specialization fit was assessed.

The lane's professional-scope cross-check uses PDMA's [Body of Knowledge](https://www.pdma.org/page/npdp-bok-third-edition), which organizes product innovation around management, strategy, portfolio, process, design/development, market research, and culture/teams; this informs the domain boundary but does not replace role-specific task evidence. The role records use their exact ESCO task profiles and retain source limitations. The seven supported paths include direct product leadership/management and product-development ownership; conditional paths are not blanket claims that every incumbent performs product work.

See `D033_role_domain_fit_2026_10_05.json` and `build_D033_decisions.py`. Exact-key worklist regeneration reports **954/1,484 reviewed / 530 remaining** in D009–D044. Both lane test modules pass (**5 tests**), including exact-key coverage, source/evidence fields, disposition arithmetic, and the prohibition on subgroup/specialization decisions. No canonical taxonomy or role/domain file was changed. Next: D034.

## Final continuation: D034â€“D044 complete

D034 `Supply Chain Management`: **157/157** reviewed — **94 supported, 38 conditional, 25 unsupported, 0 unresolved**. Direct sourcing, procurement, conversion, inventory, warehousing, order fulfilment, and inbound/outbound logistics tasks fit; generic cross-border trade or adjacent finance/administration remains conditional or unsupported unless the task establishes supply-chain work. Scope: [CSCMP supply-chain and logistics definitions](https://cscmp.org/CSCMP/cscmp/educate/scm_definitions_and_glossary_of_terms.aspx).

D035 `Logistics and Transportation Operations`: **143/143** reviewed — **97 supported, 39 conditional, 7 unsupported, 0 unresolved**. Transport modes, passenger/goods movement, routing, freight, fleet, terminals, and logistics operations were assessed against each task; generic import/export or infrastructure roles were not automatically treated as transport operations. Scope references: [CILT International](https://ciltinternational.org/about-cilt/about-cilt-international/), [UNECE Glossary for Transport Statistics](https://unece.org/info/Transport/pub/411667), and mode-specific ICAO/OTIF references only where tasks warranted them.

D036 `Procurement and Contract Management`: **44/44** reviewed — **3 supported, 10 conditional, 31 unsupported, 0 unresolved**. Procurement-cycle and contract-lifecycle tasks fit; logistics, distribution, customs, wholesale trading, and brokerage alone do not. Scope references: [CIPS procurement overview](https://1prd-dxp.cips.org/intelligence-hub/procurement/what-is-procurement) and [WorldCC Contract Management Standard](https://www.worldcc.com/knowledge-insights/contract-management-standard.html).

D041 `Scientific Research`: **11/11** reviewed — **4 supported, 5 conditional, 1 unsupported, 1 unresolved**. Research was distinguished from routine technical work using the [OECD Frascati Manual](https://www.oecd.org/en/publications/frascati-manual-2015_9789264239012-en.html). `Physical Scientists, All Other` remains unresolved because no sufficiently specific task profile is joined.

D042 `Media Production and Broadcasting`: **101/101** reviewed — **89 supported, 6 conditional, 5 unsupported, 1 unresolved**. Stage/screen/radio/TV/recorded-media performance and production were distinguished from journalism and visual-art work using [UNESCO ISCED-F](https://uis.unesco.org/sites/default/files/medias/fichiers/2025/04/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf). A final task-text rule correction captured a dancer's explicit audience performance despite the source describing it as interpreting ideas through movement. `Media and Communication Workers, All Other` remains unresolved because its task text is generic.

D043 `Journalism and Digital Publishing`: **62/62** reviewed — **25 supported, 10 conditional, 26 unsupported, 1 unresolved**. Journalism, verification, editorial work, and evidenced publication tasks are separated from audiovisual production, interpreting, fine arts, and generic writing. Technical/scientific/translated content without an explicit publication workflow is conditional, not presumed to be digital publishing. Scope: [UNESCO ISCED-F](https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf) and [UNESCO journalism/media-literacy guidance](https://www.unesco.org/en/articles/media-and-information-literacy-journalism). `Media and Communication Workers` remains unresolved due to generic task text and no role-specific source URL; UNESCO is cited as a domain boundary only, not as replacement role evidence.

D044 `Graphic Design`: **12/12** reviewed — **2 supported, 2 conditional, 8 unsupported, 0 unresolved**. Visual communication/layout and web-design tasks were distinguished from fine art, restoration, industrial/product design, journalism, and performance production. Scope references: [AIGA/NASAD design-program guidance](https://educators.aiga.org/wp-content/uploads/2010/01/NASAD-Briefing-Paper-Degree-Programs1.pdf) and [UNESCO ISCED-F](https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf).

### Assigned D009-D044 range closed

The exact-key worklist records **1,484/1,484 mappings reviewed; 0 unreviewed**. Aggregate dispositions: **782 supported, 456 conditional, 226 unsupported, 20 unresolved**. D034-D044 contributed **530 mappings**: **314 supported, 110 conditional, 103 unsupported, 3 unresolved**. "Reviewed" means every exact mapping has a task-based disposition and evidence/rationale; it does not mean each old link was affirmed. The unresolved rows are explicitly marked where task evidence is absent or too generic.

Final validation: **5 tests passed**, including exact-key coverage, evidence/source fields, disposition arithmetic, and checks that these artifacts contain no subgroup or role-to-specialization decisions. Next cursor within this assignment: **none (D044 complete)**. No canonical taxonomy, subgroup, role, or specialization files were edited. Role-to-specialization review remains deferred until its catalogue audit is complete.

## Historical status at D033 (superseded by completion below)

- Within this assigned D009–D044 lane, **954/1,484 mappings are reviewed and 530 remain**; the next domain cursor is D034. Role-to-specialization fit remains explicitly out of scope.
- The lane source scan found 58 mappings without a joined ESCO or O*NET task profile, 15 ESCO task-text differences, four ESCO label differences and six ESCO code differences. These are targeted source-identity/evidence queues, not automatic fit errors; each must be reconciled to primary task sources before any change.
- Repeated task descriptions/URIs across domains are retrieval aids only. No cross-domain decision transfer has been applied.
- Next: D034 in the assigned D009–D044 range; preserve exact role keys and continue parent-domain-only, source-backed decisions. Stop only when D044 is covered and every residual is explicitly classified.
