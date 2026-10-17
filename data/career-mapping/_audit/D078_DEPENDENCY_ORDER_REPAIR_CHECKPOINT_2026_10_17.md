# D078 sequence and pathway repair checkpoint ? 17 October 2026

## Scope and user direction

The initial repair corrected per-edge sequence semantics and route/task links. After the user's explicit direction to verify research/evidence usefulness across the full D078 domain and require the shared foundations, the current local artifacts now mark exactly these three shared items **needed** across every D078 route:

1. Frame a researchable social question and choose a fitting design.
2. Evaluate evidence and explain what it can and cannot show.
3. Communicate findings for the intended audience.

No other requirement dispositions, item inventory, role fit, UI, SQL or migrations were changed. The graph remains behind its separate student-facing release gate.

## Cross-route verification

The task-record coverage audit found **63 area task-family records across all 7 canonical areas** and **19 role task contexts across all 19 routed roles**. These records consistently involve inquiry, analysis, evaluation, interpretation or communication of evidence. That supports a required shared evidence-literacy baseline across the domain. It does not mean every occupation conducts formal standalone research, or that every method or tool is universal.

Evidence artifact: `data/career-mapping/_audit/D078_SHARED_FOUNDATION_CROSS_ROUTE_COVERAGE_2026_10_17.json`.

## What was already correct

- All 7 area routes and 19 role routes existed in the graph.
- **177** resolved domain-item-to-area links, **34** conditional emerging-item-to-area links and **277** domain-item-to-area-task links retained source ownership and conditions.
- The 30 area items whose records named a task family already had their task links; all 136 dispositioned area enrichment items are associated with a task family.
- Useful/optional methods, tools and credentials were already represented as skippable choices, not universal requirements.
- No active blocking dependency was needed between useful items; candidate `builds_on` relationships were nonblocking.

## What changed

- The runtime requirement reconciliation and graph now mark the three shared foundations **needed**, with ordered teaching positions 1?3. Their internal teaching order is advisory; they are not hard prerequisites of one another.
- Each selected-area and role path inherits the required domain foundation. The other domain, area and role items retain their existing lanes and source-layer ownership.
- The local content builder now emits `needed` for these three exact domain items and gives them a compulsory-lane reason. All other domain-item classifications remain governed by existing rules.
- The graph and report cards now organize post-foundation learning by **selectable items**. Task records explain why an item is useful; students do not have to select a task to enter the path. Three examples show the next item and conditions for methods/tools.
- Runtime reconciliation lane counts are now **3 needed, 316 useful, 181 optional** (500 records). Among the 54 domain learning-item routes: **3 needed, 35 useful, 16 optional**.

## Graph and sequence counts

- Graph: **2,690 nodes, 4,482 edges**.
- Sequence policy: **4,463 none, 19 advisory, 0 conditional prerequisites**.
- Blocking edges: **0**.
- Skippable edges: **2,753**. The three shared-foundation domain membership edges are needed and not skippable; useful/optional items remain skippable and nonblocking.
- The graph's advisory item order is not a live completion gate until the student-facing consumer renders and enforces the required lane. No app release or SQL application is claimed.
- Gzip mirror is decompression-parity checked.

## Post-foundation report examples

Saved report card: `data/career-mapping/_audit/D078_THREE_STUDENT_PATHWAY_REPORT_CARDS_2026_10_17.md`.

It follows programme context ? required foundation items ? selectable domain items ? selected-area items ? optional role items. Its three strands are programme evaluation, political-opinion survey, and population change. Each item shows owner, lane, reason, when to choose it, and what follows. The method/tool branches are conditional and skippable.

## Validation

- Local cross-route coverage audit: 7/7 areas, 63 area task-family records, 19/19 roles, 19 role task contexts.
- Focused graph assertions and runtime-content verification are recorded in the completion summary after execution.
- No Supabase SQL or migration was changed or applied.

## Changed artifacts

- `backend/d078_guided_content.py`
- `data/career-mapping/_audit/D078_MASTER_GUIDED_EXPERIENCE_RECONCILIATION_2026_10_12.json`
- `data/career-mapping/_audit/D078_REQUIREMENT_LANE_AND_SEQUENCE_RECONCILIATION_2026_10_17.json`
- `data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json`
- `data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json` and `.json.gz`
- `data/career-mapping/_audit/D078_SHARED_FOUNDATION_CROSS_ROUTE_COVERAGE_2026_10_17.json`
- `data/career-mapping/_audit/D078_LEARNING_PATH_RECOMMENDATION_2026_10_17.md`
- `data/career-mapping/_audit/D078_THREE_STUDENT_PATHWAY_REPORT_CARDS_2026_10_17.md`
- This checkpoint.
