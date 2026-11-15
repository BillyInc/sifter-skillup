# Agent 1 ? D166 Area Gap Closure Assignment

You own the **completion** of your four D166 areas below. This is not a request for another partial source inventory or status report. Continue from the reconciled workpack, conduct the missing external and local source work, resolve every cell and task that the evidence permits, and return a cell-by-cell, task-by-task closure packet.

## Your exclusive areas

1. `D166:vehicle-sensing-and-sensor-calibration`
2. `D166:perception-and-scene-understanding`
3. `D166:high-definition-mapping`
4. `D166:localization-and-vehicle-state-estimation`

The four areas comprise 96 matrix cells and 24 task tracks. Do not take work from Agent 2?s four areas. Cross-area output relationships can be recorded as evidence-backed candidates for coordinator reconciliation.

## Current authoritative starting state

Read these files first:

- `data/career-mapping/_audit/D011_D166_IN_DEPTH_SOURCE_INDEX_2026_10_23.json`
- `data/career-mapping/_audit/index_D011_D166_in_depth_sources_2026_10_23.py`
- `data/career-mapping/_audit/agent_workpacks/D166_AGENT1_SOURCE_WORKPACK_2026_10_24.json`
- `data/career-mapping/_audit/agent_workpacks/D166_AGENT1_REVIEWER_RECONCILIATION_2026_10_24.md`
- `docs/manual-review/D011_D166_GAP_CLOSURE_ASSIGNMENT_2026_10_24.md`

The reconciled pack has **33 distinct candidate mappings, not the original inflated count of 48**. Its areas have 8, 7, 9 and 9 mapped candidate cells respectively, leaving 16, 17, 15 and 15 cells without a reconciled mapping. All 24 task tracks remain open. The canonical index itself still has no D166 cell mappings integrated. Treat every workpack claim as a candidate until you verify it against the named source and exact cell.

Specific prior defects to keep fixed:

- Calibration surveys are evidence about method families, not software/tools or competency standards.
- Datasets are not methods or algorithms.
- A research paper describing a pipeline does not establish a maintained, selectable tool.
- Survey claims and modern documentation must not be copied into multiple families/horizons without cell-specific evidence.
- The NIST and preprint findings are abstract-only where recorded; keep claims inside that limit.
- Current role-task examples are conditional examples only. Do not infer canonical role fit or add routes.

## Objective and completion standard

Complete the full evidence review for your four areas, down through their current canonical roles? supported tasks. Close all assigned work that the evidence supports. Every one of the 96 cells must have a terminal disposition:

- `mapped`: a distinct, source-supported claim with exact locator, area/horizon context, item type, inputs/outputs, assumptions, limitations, and relationship evidence;
- `not_applicable`: a cited area boundary establishes why that family/horizon does not apply;
- `bounded_no_hit`: the specified search was actually performed and logged across relevant source families but yielded no usable claim, with scope and limits recorded.

Every one of the 24 task tracks must end as `complete`, `not_applicable`, or `bounded_no_hit`. `evidence_added_gap_open` is an interim state, not successful completion. If an actual access or external-state blocker prevents a defensible disposition, document it with the exact failed sources/actions and leave only that row explicitly open/escalated. Do not fabricate evidence, infer a no-hit, or submit an open pack as complete.

An area is complete only when all 24 cells and all six task tracks are terminal and a dated counter-search across that area finds no material missing item, method, prerequisite, alternative, relationship, tool/data context, standard/resource, output, or role task. No source quota or source count closes an area.

## Required research and reasoning

For every area, work through all six families and four horizons:

- `foundations_knowledge_and_competencies`
- `methods_and_designs`
- `techniques_estimators_and_algorithms`
- `tools_software_and_data`
- `standards_credentials_and_learning_resources`
- `outputs_and_downstream_role_context`

Horizons: `established/traditional`, `current`, `emerging`, `future/futuristic`.

Search primary/official sources, relevant standards and regulators, peer-reviewed primary papers and independent reviews, maintained project/tool documentation, datasets/benchmarks, professional curricula and credentials, credible grey/practitioner material, employer task sources, learning instruction and Nigerian/regional sources where relevant. Use web pages as well as PDFs. Search engines and bibliographies are discovery only: open and inspect the best supporting source directly. Follow references where they expose a material gap. Record source dates, versions, access, cost/license, geography, credibility and what was not inspected.

Use the source index?s per-area `topic_focus`, six gap tracks, cell `remaining_scope`, prior evidence IDs and query IDs. Counter-search likely omissions and alternatives, including but not limited to: target-based/targetless/online and temporal calibration; camera, LiDAR, radar, IMU/GNSS and other relevant modalities; frames, timing and sensor health; weather/ODD and degradation; perception detection/tracking/occupancy/uncertainty and benchmark limits; survey/map/automated map generation/change detection and map validation; GNSS-denied, inertial, visual/LiDAR, map-based and cooperative localization; deployment/data access/licensing; and cross-area consumers. These are search prompts, not presumed items.

Correctly distinguish method, algorithm, tool, dataset, standard, credential, output and role task. Traditional/current/emerging/future labels describe the evidence and maturity, not a forced popularity ranking. A survey is not a tool. A benchmark is not an algorithm. One implementation does not prove a method is universal. Do not infer prerequisites or route links from co-occurrence.

## Role task evidence

Inspect current canonical role records and existing area routes. For any relevant role, cite actual task/skill/activity evidence and explain the condition under which the task belongs to your area. Include canonical role ID/title, exact source and locator, task evidence, boundary and non-inference. A role posting can support a conditional task example but cannot by itself establish canonical role equivalence or change role fit. Preserve source-layer ownership and all current routes.

## Relationships and sequence

Record source-backed `prerequisite`, `alternative`, `complement`, `output_dependency`, or `context_only` relationships with the specific source and explanation. Alternatives must solve a comparable task/output and state assumptions. For mixed/component designs, identify the actual output consumed by the next component. Separate technical dependencies from learner-sequence claims: do not declare a student blocker unless a source and learning rationale support the order. Candidate cross-area relationships remain unapproved for the coordinator.

## Required workpack updates

Continue the existing Agent 1 JSON and Markdown workpack; preserve sound work and correct only material errors. Update/add:

1. All 24 cell records per area, each with family, horizon, terminal disposition, claim mappings (or cited reason), source IDs, query IDs, exact locator, area context, limits, relationships and any remaining blocker.
2. All six task records per area with terminal disposition, evidence IDs, query IDs, scope reviewed, counter-search tests/results and closure rationale.
3. Query log entries containing actual query text, source families/sites, date, pages actually opened, findings, limits and disposition effect. Add unique IDs with prefix `D166-A-QPACK-CLOSE-`.
4. Source cards only for genuinely new sources, with unique IDs. Reuse and enrich existing source cards where appropriate; do not duplicate them.
5. A role evidence ledger and cross-area candidates with explicit conditions/limits. Do not alter taxonomy or route data.
6. A reconciled Markdown report whose counts exactly match the JSON, with an area-by-area cell table, six task dispositions, source/counter-search coverage, role evidence, limitations, and validation output.

Use distinct claims for distinct cells. Do not keep a mapping merely to preserve a higher count. Do not edit the canonical generator or generated source index; the coordinator will merge validated closure packets. Do not edit graph data/generation, taxonomy, area definitions, role fit/routes, SQL/migrations, UI or reports.

## Mandatory validation before handoff

- JSON parses as UTF-8; required IDs are unique and all source/query references resolve.
- Exactly four assigned areas ? 24 unique cells; all 24 cells per area are terminal unless an explicitly evidenced external blocker is listed.
- Exactly six unique task tracks per area; all terminal unless a blocker is evidenced.
- Cell state, claim mappings and per-area counts reconcile bidirectionally; no duplicate mapping key or unsupported horizon/family claim.
- All four areas have an actual dated counter-search that tests their open/weak cell and task claims; a general search is insufficient.
- All role/task records use canonical role IDs and preserve route/fit status.
- Markdown totals match JSON; source licenses/access limits and abstract-only claims remain accurate; no trailing whitespace.
- Report commands and actual output. Do not claim graph, sequence, UI, browser rendering or deployment verification.

## Handoff rule

A pack with open tracks/cells is **interim and incomplete**, never ?done.? If one exact external blocker remains after exhaustive attempts, return the completed work around it plus a concise blocker record naming the affected row, attempts, source failures and why no safe terminal status is possible. Otherwise continue research until the assigned area gates pass. The coordinator will not infer closure from a green structural validator.
