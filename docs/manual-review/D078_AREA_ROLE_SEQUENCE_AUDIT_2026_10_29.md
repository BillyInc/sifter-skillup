# D078 Area and Role Sequence Audit

**Date:** 2026-10-29  
**Scope:** All seven canonical D078 areas and all 19 graph roles. This is the method-aware Social Sciences route, not the legacy subgroup taxonomy.

## Decision

The student journey is a sequence of contexts, not a claim that every item at a level is a compulsory course:

```text
Sociology programme and university context
  → Social Sciences domain overview and three compulsory foundations
  → Society and the social world orientation
  → selected method(s) and, for multiple methods, an exact named design
  → only the domain items/tools linked to that selected route
  → area(s) supported by that route, ordered by matched task families
  → selected area's own needed/useful/conditional items and its route tools
  → roles linked to that selected area and route
  → role-owned items and tools attached to the recorded role task
```

The selected domain/method/design context must remain visible in the area and role explanation. It filters and explains the downstream choices; it does not turn optional work into a prerequisite. Within each `Needed` or `Useful / Optional` lane, cards are not a learning sequence unless a reviewed graph relationship explicitly says one item builds on or must precede another. Current area/role items must not be presented as a ranked curriculum merely because a JSON array or insertion order happens to put one first.

## Task-family and item-grouping finding

The UI graph has 47 task-family records across the seven areas: Computational and Digital Social Science (3), Economics and Applied Economic Analysis (8), Human Geography and Population Studies (3), Politics, Governance and Public Policy (10), Social Behaviour and Interaction (10), Social Research and Evaluation (3), and Sociology and Social Anthropology (10). Individual method-to-area routes reference between one and five of an area's task families.

The canonical graph now stores explicit typed links for the selected context: method/design → area task family, selected domain item → area task family, and area task family → area-owned learning item. A task-family focus is an optional, multi-select lens after the method or named design and area are known. The learner can select none and keep the general area route, or select one or more families; linked items are deduplicated by canonical item identity while ownership and requirement lane remain unchanged. These family choices are parallel work contexts, not a sequence or progression gate.

The safe presentation is: show the selected domain foundations and only the selected domain items linked to the chosen area work context; show the task families supported by the exact method/design route; then let the learner optionally focus on one or more of those families and inspect their linked area-owned items in the existing requirement lanes. Skipping family focus preserves the general route. Selecting a family never auto-selects its items, changes their `needed`/`useful`/conditional status, or blocks downstream navigation.

The graph now adds 19 source-backed role-task context nodes, one for each current D078 role, and 44 bounded area-family → role-task links. Each link is restricted to an area already present on that role's route, carries its own rationale, condition, evidence references and claim limit, and is non-blocking. The role screen should show a role-task context only when it is linked to a selected family and the role is already available on the chosen area/design route. Role-owned learning items remain role-owned; this pass does not claim they are family- or method-specific without a separate explicit edge. The role screen carries the learner's selected domain and area learning forward before role-owned items/tools.

## Recommended learner flow and graph contract

Do not make the learner choose a task family as a new mandatory gate today. A task family is a clear description of work in an area, not yet a validated learning-route choice: the graph has no explicit item-to-family or family-to-role mapping to determine what selecting one would include or omit. Showing all area task families as an unfiltered choice would also weaken the method-aware filtering the journey is meant to provide.

Use this flow instead:

1. Carry the selected programme context into Social Sciences, then show the three shared domain foundations and the Society and the social world orientation.
2. Let the learner choose one method or multiple methods plus the exact named design. Show the domain learning choices relevant to that route; keep optional items skippable.
3. Recommend areas from that selected route. On opening an area, carry forward the selected methods/design, foundations, and only the domain items the learner actually selected that the route links to this area.
4. Show only the task families reached by that method/design in the selected area, with a plain-language note connecting the selected method and inherited domain learning to that kind of area work.
5. Offer optional task-family focus only from the exact method/design-and-area route. A selected family exposes its graph-linked area items, while zero selected families preserves the general area route. Preserve original ownership and requirement lanes; do not make a task-family selection or relationship a progression blocker.
6. Show roles only within the selected area and selected route. For a selected task-family focus, show a role-task context only when the graph contains the resolved family → role-task → role links. Carry selected domain and area learning into the role view before role-owned additions/tools. Do not present role-task context as a universal duty list or imply that the family itself makes role-owned items mandatory.

A future task-family selection can be offered as an optional focus lens only after the graph has explicit, reviewed links for `method/design → task family`, `task family → area learning item`, `task family → role/task`, and any downstream alternatives/tools, each with a rationale, source locator, condition and limitation. It must not erase the general area route or become a progression blocker. A combined design must use its own method contributions and family/item/role links; it must not silently union every standalone method route. This follows mixed-methods guidance that the design specifies sequence, priority and integration, while occupation task profiles describe varied work rather than a universal student syllabus ([NIH mixed-methods best practices](https://obssr.od.nih.gov/research-resources/mixed-methods-research), [O*NET Sociologists](https://www.onetonline.org/link/details/19-3041.00), [O*NET Anthropologists and Archaeologists](https://www.onetonline.org/link/details/19-3091.00)).

## Graph regeneration update — supersedes earlier “future work” statements above

The earlier paragraphs describing task-family-to-item or task-family-to-role links as missing were accurate for the prior graph/UI projection but are now superseded by the regenerated local graph. The graph contains the typed method/design → family, selected-domain-item → family, family → area-item, family → role-task, and role-task → role links. The route-specific focus contract permits zero or multiple family selections, preserves the unfiltered area path when none are selected, and keeps all family links non-blocking. Combined designs use their own contribution routes rather than an automatic union of standalone methods.

The new role-family links are bounded evidence syntheses, not an employer-approved syllabus: each uses the role’s source-backed work profile, the linked area-family evidence, exact role-area membership, a plain-language rationale, a condition, and a claim limit. The canonical graph now has `student_visible: true`, as requested. A separate `student_ui_gate` remains closed (`enabled: false`, `student_facing_approved: false`) until rendered acceptance is complete; graph visibility does not itself approve or release the student UI. The separately rendered screen still needs to consume the new optional-focus contract before a manual click-through can test it.

## What the current graph proves

The current UI graph is `2026-10-22.d078-method-area-role-route-graph.v6+role-items-2026-10-29` in `src/data/d078MethodAwareUiData.json`.

- It contains seven canonical areas, 19 roles, 116 single-method area routes, 31 named-combination area routes, 421 method-area-role routes, 121 combination-area-role routes, and 95 role-tool routes.
- It contains 6,579 typed relationship edges; every edge currently has `sequencePolicy: "none"`. Therefore the graph does **not** currently certify a compulsory or recommended item-by-item sequence within area or role lanes.
- The 116 area-enrichment items, 21 area-learning items, and 166 role-item candidates all have `auto_order: false`. Their lanes distinguish needed, useful/optional, and conditional use; they do not supply an internal priority rank.
- Every method/combination route's `recommendation_rank` is null. The route policy says to rank areas by selected-route task-family fit and retain all seven areas. The previous projection instead sorted by route-row count; that count can overstate fit when route rows repeat.
- Roles are exposed only through selected-area routes. The previous projection sorted them alphabetically, despite the policy requiring route evidence where available. That is a neutral browse order, not a recommendation ranking.
- The area page rendered route tools as plain text. The role page already rendered selectable tool cards, but did not display the tool route's linked task label next to the card.

These facts mean that a strict importance order for every area/role item would be invented. The safe correction is to order the *contexts* by selected-route evidence, preserve the needed/useful lanes, make tool choices actionable in their method/task context, and reserve strict item sequence for evidence-backed dependency edges.

## Changes made in this pass

1. Area ordering now uses the number of distinct task families supported by the selected route, then route count as a tie-breaker, then the area name. All supported areas remain visible. This is a route-match ordering, not a ranking of fields by importance.
2. Role ordering now places roles supported by more of the learner's selected method/design contributions first, then uses the role name as a stable tie-breaker. It does not claim occupational importance, readiness, or employer preference.
3. Area and role items are given a stable alphabetical display order *within each requirement lane*. This prevents selection order or route-array insertion order from masquerading as teaching priority. `Needed` remains before `Useful / Optional`; conditional items retain their condition and lane.
4. Area tools are now rendered as selectable, explanatory cards under the method contribution they support, rather than as a plain-text tool list. They remain optional and do not become area prerequisites.
5. Role tools remain selectable within the role stage and now identify the recorded role task they support when the graph provides that task label.
6. The click-by-click manual matrix must check the area item/tool stage before opening a role, and must check the role-owned item/tool stage only after opening the role from its selected area. A tool's appearance does not mean it was selected; only the learner's explicit Add action puts it in the tray.
7. Area and role screens now expose the learner's selected upstream items as inherited context without duplicating their cards or changing ownership. The area page distinguishes field foundations, selected methods/designs, selected route-linked domain items, and area additions. The role page's expandable route context distinguishes selected domain learning from selected area learning before role-owned items/tools.
8. Regenerated the graph with 47 method-routed optional family-focus nodes, 19 role-task context nodes, 44 bounded family-to-role-task relationships, and 19 role-task-to-role relationships. Updated the UI projection to carry the selection contract, evidence references, rationale, conditions, and claim limits. Preserved the graph-wide student-visibility gate and did not change SQL.

## Evidence basis and limits

External sources support the broad workflow and the need to make method/design context explicit, but they do not justify one universal ordering of all D078 area and role items:

- The [UK Data Service research-data lifecycle guidance](https://ukdataservice.ac.uk/learning-hub/data-producer-support/) places data management across project planning, collection, processing/analysis, sharing, and reuse. This supports a staged research workflow and carrying provenance/documentation through stages; it does not make every method use every stage in the same order.
- The [National Institutes of Health mixed-methods best-practice guide](https://obssr.od.nih.gov/sites/g/files/mnhszr296/files/Best_Practices_for_Mixed_Methods_Research.pdf) says a mixed-method design should specify its purpose, priority, and sequence and describe sampling, collection, and analysis for each method. This supports showing the exact named design and its method contributions before downstream items; it rejects treating combined methods as an unstructured union.
- [O*NET's Sociologists task profile](https://www.onetonline.org/link/details/19-3041.00) includes research planning, collecting evidence through observation/interviews/documents, analysis, and communicating results. [O*NET's Anthropologists and Archaeologists profile](https://www.onetonline.org/link/summary/19-3091.00) likewise describes task-specific observation, interviews, document review, analysis, and reporting. These occupational sources justify contextual role-task connections; they do not establish that every learner must perform every task or that the tasks form a single universal curriculum sequence.
- For data stewardship, the [UK Data Service guidance on managing data during a project](https://ukdataservice.ac.uk/learning-hub/data-producer-support/managing-data-during-the-project/) recommends active organization, security, quality, and documentation during research, rather than treating data management as an unrelated final tool category.

Thus, exact ordering inside an area/role lane remains unapproved wherever the D078 graph has no explicit, reviewed sequence edge. If future evidence establishes a true dependency, encode it as a typed relationship with a resolved target, item-specific explanation, source, and approved `sequencePolicy`; do not infer it from source-list order, role-task importance percentages, or the mere fact that two tools/items are related.

## Verification status and remaining checks

- The new graph integrity test passes: `python.exe data/career-mapping/_audit/test_d078_task_family_role_context_2026_10_29.py` (5 tests, including task-family selection subsets across all single-method and named-combination area routes). The generator and UI projection exporter also complete successfully.
- The older broad graph test still has five failures. Three assert stale pre-role-item counts/behavior, one expects the old schema version, and one reports two pre-existing unresolved Excel tool edges (`runtime-item:domain:d078:d078-excel-data-tool` and `domain-item:d078-statistical-tool-choice → domain-item:d078-excel-data-tool`). No newly added task-family/role edge is unresolved. These failures are recorded, not silently treated as passing.
- The rendered area screen must still be updated/tested to consume the new optional-focus contract; this graph change alone does not make the cards selectable in the browser.
- Check all 34 manual-test packages against the current graph for exact area, role, item, tool, and alternative availability; a package must not tell the tester to choose an item/tool absent from its exact method/design route.
- The graph-wide `student_visible` flag is true, while the separate `student_ui_gate` remains closed. This local graph reconciliation does not grant final student-facing approval or update Supabase. SQL was not regenerated or changed by this audit.

## Current sequence closure checkpoint — 2026-11-06

This checkpoint supersedes the older counts and open sequence statements above
for the regenerated local graph only. It does not approve rendered student
release and does not claim a live SQL deployment.

- Canonical graph artifact: `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`; UI export: `src/data/d078MethodAwareUiData.json`. The current graph schema is `2026-11-02.d078-method-area-role-route-graph.v10`.
- Route-plan coverage is 207 exact routes: 117 single-method routes, 31 named designs, and 59 participatory component variants. The route audit also checks 423 method-to-area-to-role rows, 630 route-local item contexts, 12,331 item-choice occurrences, 95 role-tool routes, all seven canonical areas, and all 19 roles.
- Every item projected in those route plans now has an explicit stage, requirement lane, and ordering disposition. A reviewed edge can establish a conditional prerequisite or a nonblocking recommended workflow. An exact alternative remains a comparison choice; a tool remains a method/task choice; an item without reviewed order evidence is explicitly a skippable choice with no relative-order claim. Stable render position is not a learning rank.
- There are eight route-scoped, evidence-reviewed ordering edges: three conditional prerequisite relationships and five recommended workflow relationships. All are nonblocking and carry route conditions. This is not a target count or a ceiling. The source review found five of the 27 direct area-order declarations suitable as workflows; 13 were explicitly no-order relationships and nine were task safeguards/conditions rather than learnable sequence edges. The other three approved edges are the scoped Economics/causal-ML/CASEVO learning dependencies. Alternatives, complements, and safeguards are not converted into prerequisites.
- The 173 role-item nodes include 164 approved/visible/selectable records and nine unapproved/hidden records. The current graph has zero approved role-item prerequisite edges and no item-level prerequisite prose on those role nodes. Their display remains inside the learner's selected area/role route; absent evidence of an order, they are parallel, skippable choices—not a made-up role syllabus. Role-task context links explain application context but are not prerequisite claims.
- A regression caught and fixed one actual projection leak: an explicitly unapproved, hidden generic Human Geography placeholder was present in a legacy area-item list. The route-plan builder now excludes hidden, unapproved, or explicitly nonselectable nodes even when a legacy route list names them.

### Verification for this checkpoint

- `python -m unittest data.career-mapping._audit.test_d078_route_sequence_completeness_2026_11_05 -v`: six tests passed. Coverage includes all route-stage plans, exact route-local alternatives, per-item dispositions, nonblocking edge semantics, and consistency between the rebuilt graph and UI export.
- `python data/career-mapping/_audit/audit_d078_exhaustive_selection_space_2026_10_26.py`: passed after enumerating 8,388,607 method subsets and symbolically validating all route-local item-selection subsets. The audit is not browser or live-database evidence.
- `src/lib/d078RouteProjection.test.ts`: four selected route-projection tests passed (44 unrelated tests skipped), covering requirement-lane ordering, exact combination downstream, carried role context, and role-owned learning-item projection. The full file was stopped after a long CPU-bound run; it is not reported as a full-suite pass.
- `git diff --check` passed for the sequence generator and its new regression test.

The local graph-ordering gate is therefore closed for the declared, reviewed
routes: every route item has a clear ordering/choice meaning, every currently
approved sequence edge is represented and tested, optional skips preserve the
baseline route, and unsupported dependencies are not inferred. The graph's
separate `student_ui_gate` remains closed pending rendered acceptance; no SQL
was changed or regenerated in this checkpoint.

### Manual-matrix graph reconciliation checkpoint — 2026-11-06

The eight approved ordering edges are eight unique evidence-backed
relationships, not eight total placements: the route plans repeat each edge
only in the routes where its endpoints and conditions apply. Three are
conditional prerequisites:

1. Quantitative approach → applied econometrics, only where the learner lacks
   introductory statistics/regression knowledge; check prior knowledge rather
   than forcing repetition or a software package.
2. Applied econometrics → causal machine learning, only for causal-effect
   estimation/causal machine learning—not predictive machine learning.
3. Agent-based economic modelling → Casevo, only for the Casevo/agent-based
   modelling implementation route—not all language-model simulations.

Five are nonblocking workflow recommendations: social-survey design, sampling
and question pretesting before design-aware analysis; population measures
before interpreting migration/urbanisation patterns; research-question
framing before sampling/measurement; programme theory before evaluation
design/evidence; and reproducible data cleaning before interpretable
statistical modelling. They guide useful work order without turning it into a
progression blocker.

The 34-pack matrix now has an automated static check for exact method/design,
area and role route signatures and for graph availability of named items and
tools. The focused matrix, sequence and task-family/role suites pass (31 tests
total). This caught and corrected stale selections in Packages 4, 15 and 34;
Package 9 explicitly checks that no unsupported role-owned card leaks into the
agent-based-modelling/Statistician route. The matrix also now states that the
exact participatory-observation/Human Geography route has no area-owned item
cards in the current graph, rather than borrowing cards from a different
route. This is a data limitation surfaced by the audit, not proof that the
area has no relevant learning in every route.

This static reconciliation does not yet certify every prose instruction's
select/deselect/alternative transition, a live authenticated browser run, save
restoration, or export/printing. Do not treat the 34-pack document as fully
accepted until those remaining click-by-click expectations are checked and
rendered acceptance is performed. No SQL was changed or regenerated here.

### Current ordering-scope correction — 2026-11-14

The 2026-11-06 edge counts above are historical. The current generated graph is
schema `2026-11-14.d078-method-area-role-route-graph.v12`, with 207 nine-stage
route plans and 15 reviewed order edges (3 conditional prerequisites and 12
workflow recommendations). The role audit still approves zero item-to-item
prerequisites; this means role items are parallel choices inside their
selected, ordered role-task context, not that the role path is unordered.
Current wording and regression requirements are in
`D078_ROUTE_ORDERING_SCOPE_CONTRACT_2026_11_14.md`. It supersedes any older
description here that presents a missing item-pair edge as a missing route
sequence. The separate student UI/release gate remains closed pending the
end-to-end and UI acceptance checks.
