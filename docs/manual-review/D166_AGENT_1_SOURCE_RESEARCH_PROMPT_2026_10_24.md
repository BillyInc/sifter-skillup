# Copy/paste research assignment — D166 Agent 1

## Objective

Research and document the D166 autonomous-vehicle source base for the four upstream canonical areas below. Produce an evidence-rich, integration-ready workpack so the coordinator can review learning design, sequencing, dependencies and area/role mappings. This is research and provenance work only; do not alter the graph or taxonomy.

## Your exclusive area scope

Use the current local repository to verify names and IDs. Your four areas are:

1. `D166:vehicle-sensing-and-sensor-calibration`
2. `D166:perception-and-scene-understanding`
3. `D166:high-definition-mapping`
4. `D166:localization-and-vehicle-state-estimation`

Cover all current canonical roles whose actual tasks are supported by these areas. Determine the role roster from current canonical data; do not trust a stale summary count. A role can be conditionally relevant when its sourced tasks concern these areas. Explain the condition and boundary. If a role is shared with Agent 2’s areas, include only your four-area task evidence and note the cross-area candidate; do not duplicate or claim the other agent’s evidence.

## Read current state before searching

Inspect these current files and follow references to the canonical role library:

- `data/career-mapping/_audit/D011_D166_IN_DEPTH_SOURCE_INDEX_2026_10_23.json`
- `data/career-mapping/_audit/index_D011_D166_in_depth_sources_2026_10_23.py`
- `data/career-mapping/domain_specialization_catalog.json`
- `docs/manual-review/DOMAIN_FIRST_ENRICHMENT_SCALING_PLAN_2026_10_12.md`

Deduplicate all sources and claims against the current index before proposing additions. The index currently uses a fixed 24-cell matrix per area: six families × four horizons. Use the generator’s exact family/task IDs:

- families: `foundations_knowledge_and_competencies`, `methods_and_designs`, `techniques_estimators_and_algorithms`, `tools_software_and_data`, `standards_credentials_and_learning_resources`, `outputs_and_downstream_role_context`;
- horizons: `established/traditional`, `current`, `emerging`, `future/futuristic`.

The six bounded task families are foundations/prerequisites; methods/techniques/alternatives; tools/data/implementation; emerging/future frontier; standards/credentials/learning resources; outputs/downstream role context. Read actual `task_id` values from the generator.

## Required breadth and depth

Search both web pages and documents from relevant buckets:

- official standards, regulators and technical agencies (ISO/SAE, UNECE, NHTSA, NIST, IEEE, ASAM, AUTOSAR, ROS and relevant public authorities); check edition, status, date and exact scope;
- peer-reviewed primary research, foundational papers, independent surveys and handbooks;
- maintained AV/robotics software, APIs, simulators, open datasets and reproducible benchmarks;
- professional curricula, textbooks, credentials and credible open learning materials;
- credible grey/practitioner sources and attributable employer job descriptions;
- emerging and future work, roadmaps and proposals, clearly labelled as such;
- Nigerian/regional evidence when it changes roads, infrastructure, sensor/vehicle use, regulation, data or role tasks.

Cover the actual technical continuum: coordinate frames, sensor clocks and calibration; perception and multimodal fusion; map representation, creation, update and validation; localization, state estimation, GNSS-denied and cooperative methods; data, test and evaluation. Search traditional, current, emerging and plausible future items, including prerequisites and counterevidence. These are search themes, not a list to dump into the graph; include an item only when a source ties it to the area’s task/output.

Keep boundaries exact: onboard vehicle sensors versus roadside/ITS sensors; intrinsic/extrinsic/temporal calibration versus perception algorithms; mapping versus localization; sensor-level tests versus vehicle-level safety validation. Explain when sensor inputs, calibration transforms, map data or pose estimates feed a downstream system. Do not invent dependencies from adjacency.

## Source-card and claim-mapping standard

For every source, record a unique `D166-` ID (check for duplicates first), publisher/author, exact title, direct URL, source family/type, evidence layer, access date, publication/version/status, precise locator, supported claim, area-specific context, claim limits and relationships. For grey sources, include an explicit credibility assessment. Record full text versus abstract/snippet access honestly; note paywalls, blocked pages and dated versions. Do not convert search snippets into fully reviewed source claims.

Every matrix claim mapping must include:

`claim`, `locator`, `source_ids`, `area_context`, `claim_limit`, `relationship_context`.

Classify relationships as `alternative`, `complement`, `prerequisite`, `output_dependency`, or `context_only` and explain why. A real output dependency requires a source-backed technical design in which one output is consumed by the next method. Don’t call two tools “alternatives” to a method; keep methods, techniques, tools, datasets and standards distinct.

For each relevant role, map only actual sourced tasks/skills/activities to one of your four areas. Include canonical role ID/title, source, locator, task evidence, conditional applicability and the boundary of what the evidence does not establish. A job title alone does not prove area fit.

## Closure gate

A task is terminal only as `complete`, `not_applicable`, or `bounded_no_hit`. Existing or newly found sources without full scoped assessment and counter-search remain `evidence_added_gap_open`. A matrix cell is terminal only as `mapped`, `not_applicable`, or `bounded_no_hit`. Do not mark an area complete unless its six tasks and all 24 cells are terminal and a dated, targeted counter-search finds no material missing item, method, prerequisite, alternative, relationship or role context. No source quota or broad search can close a task.

Counter-search each area’s empty/weak cells and challenge likely omissions: alternate calibration strategies, clock/frame conventions, non-camera/LiDAR sensors, changing maps, sensor degradation, weather/ODD limits, cross-modal failure, benchmark bias, data rights/coverage, deployment constraints, and role-task context. These are prompts to test, not assumptions that those items belong. Record no-hit/access outcomes and queries; do not leave a topic silently hidden.

## Do not edit

Do not edit the canonical generator or generated JSON/Markdown, graph JSON/generation, taxonomy, area definitions, role fit/ownership, sequence/selection logic, SQL/migrations, frontend or UI. Do not overwrite existing records. Add no speculative graph edge as approved.

## Deliverables

Write only these new, separate files:

- `data/career-mapping/_audit/agent_workpacks/D166_AGENT1_SOURCE_WORKPACK_2026_10_24.json`
- `data/career-mapping/_audit/agent_workpacks/D166_AGENT1_SOURCE_WORKPACK_2026_10_24.md`

The JSON must be valid UTF-8 and contain:

```json
{
  "schema_version": 1,
  "domain_id": "D166",
  "agent_lane": "sensing_perception_mapping_localization",
  "review_date": "YYYY-MM-DD",
  "areas_reviewed": [],
  "canonical_roles_reviewed": [],
  "source_additions": [],
  "query_log": [],
  "matrix_claim_mappings": [],
  "gap_task_updates": [],
  "role_task_evidence": [],
  "cross_area_candidates": [],
  "counter_searches": [],
  "unresolved_access_or_scope_limits": []
}
```

Use unique query IDs prefixed `D166-A-QPACK-`. Each query record must include the query/topic, target sites/source families, actual search date, what pages/papers were opened, findings, limits and whether it changed the area map. Keep all IDs stable and unique. The Markdown should summarize every area, the 24 cell states, role coverage, confirmed links, counter-search results and remaining gaps. Include format/validation checks actually run. Do not claim graph, UI or rendered verification.

Before handoff, check that all four areas and every relevant canonical role have an explicit disposition; claims have locators/limits; no source is duplicated; only your lane was edited; open tasks remain open where evidence is incomplete; JSON parses; and no relation is stated more strongly than its sources allow.
