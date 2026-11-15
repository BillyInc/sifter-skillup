# D078 Domain-to-Role Route Audit

**Date:** 2026-10-31  
**Scope:** Sociology programme context → D078 Social Sciences domain → methods and named designs → all seven canonical areas → task families and area learning → all 19 roles → role learning and tools. This audit includes both the baseline route and the effect of optional choices.

## Required route behaviour

```text
Programme context and carried outcomes
  → Social Sciences domain overview and compulsory domain foundations
  → selected method(s); an exact named design is required for a combined route
  → route-supported area(s), even when no optional domain item is selected
  → area-specific starting point for that exact route:
       either a source-backed area prerequisite, if one is established,
       or the route's task-family choices as the first area-specific step
  → area items/tools linked to that route and selected work context
  → roles supported inside the selected area and route
  → source-backed role work context, role-owned learning and task-linked tools
```

An optional selection may move a matching downstream context forward only when an explicit, evidence-backed relationship supports that effect. It must never remove the valid baseline route, silently add another learning item, or create a blocker. Skipping all optional items must still yield the method/design-supported areas, area work choices, and roles.

## Findings from the current graph

The UI graph is `2026-10-22.d078-method-area-role-route-graph.v6+role-items-2026-10-29`.

- It declares 116 single-method area routes, 31 named-combination area routes, 421 method-area-role routes, and 121 combination-area-role routes across seven areas and 19 roles.
- The source graph has 63 area-task-family candidates, but only 47 are included in method routes. Sixteen remain unapproved and are not projected to students. They are possible omissions to audit, not automatically valid routes; some are broad duplicates of routed families and some are emerging/conditional proposals.
- Each of the 19 roles has one source-backed role-task context. The graph includes 44 area-task-family → role-task connections and 19 role-task → role connections. These are contextual links, not qualifications or universal duties. The family-to-role-task links carry role-profile evidence plus area/task evidence and claim limits.
- The existing domain-item → area-task relationship edges number 264, but have no relationship-level source references, locators, or reviewed synthesis basis. Their generic “resolved” status alone does not prove that selecting each item should change a particular area or role.
- The area-task-family → area-item edge set has 137 rows and no relationship-level source references in the exported UI graph. Area-owned items remain mapped to their route/task records, but this export alone does not establish an item-by-item prerequisite order.
- The seven areas contain 137 area-owned learning records. None is in the `needed` lane. The graph has no approved area-owned prerequisite that must precede every task family, and no reviewed area/role item-order edges. Therefore, for the current graph, a method/design-supported task family is the first area-specific route choice; the three compulsory domain foundations remain upstream. A future area prerequisite is added only when its exact route and evidence are established.
- The 166 role items are approved role-owned cards (70 useful, 96 conditional); none is marked `needed`. They have preparation notes, alternatives and outputs, but there are zero typed role-task → role-item links and zero approved role-item sequence edges. Do not claim that a role item belongs to one particular task family or that its preparation note is an enforced prerequisite.
- Role tools are more granular: 95 role-tool/task support routes and 104 tool-alternative links exist. Show a tool in the task context recorded for it; do not infer that it is required by every role task.

## Corrections made in this pass

1. A selected method or named design now supplies the baseline role-task context for each role already present on that exact area route. The role context no longer disappears merely because the learner skipped optional domain items and task-family focus.
2. Selecting an area item can refine a role context only through a reviewed, source-backed area-item/family link. Selecting a domain item can refine an area and its roles only through a reviewed, source-backed domain-item/family link. The current 264 and 137 relationship records lack that relationship-level evidence, so they are not allowed to produce a personalized “connected” claim yet.
3. The baseline method/design → area → role route is unchanged by optional selections. A selected optional item cannot hide otherwise supported areas or roles.
4. Role-context cards identify whether their context is supported by the selected method/design or by a learner-selected focus. They state that a route connection is not a universal employer duty or proof of job readiness.
5. Area cards now explain when recorded selected-domain links affect their order. With the current source-less relationship rows, the method/design route order remains the only active recommendation basis.

## What is not certified yet

This is not a claim that every conceivable method/item/area/role combination is correct. The route rows certify the combinations explicitly present in the graph; they do not prove that omitted candidates are invalid or that all item-level links are source-backed.

Before declaring the area/role graph complete:

1. Review the 16 unprojected area-task candidates individually. Merge true duplicates; keep unrelated/unsupported candidates out; add only source-supported method/design routes with their area items, role contexts and tools.
2. Reconcile the 264 domain-item → area-task links to item-specific and task-specific evidence. Record a rationale, source locator, condition and claim limit per approved link. Until then, do not let them personalize downstream route ranking.
3. Reconcile the 137 area-task-family → area-item links against the source task-set records. Record whether each item is a route addition, conditional support, or actual prerequisite. Do not infer order from list position.
4. Review role-owned items against the 19 role-task records. Add a typed role-task → role-item edge only when the item contract and evidence establish that particular connection. Keep unlinked role items role-owned and in their existing useful/conditional lane.
5. For every single method and each exact named design, test: no optional selections; each available optional domain item individually; each area work-focus choice individually; and combinations/skips. The route sets must be monotone: added optional context may add a supported explanation or reorder a matching route, but may not erase baseline areas/roles or become a blocker.

## Evidence basis and limits

- The local D078 area/role task-set and role-item contracts provide the internal record of task wording, item context, conditions, alternatives and source locators. Role-task links were checked against these records; unresolved item-to-task relations remain unasserted.
- O*NET's [Sociologists profile](https://www.onetonline.org/link/summary/19-3041.00) lists varied tasks spanning data collection, analysis, reporting and explaining research. Its [Anthropologists and Archeologists profile](https://www.onetonline.org/link/details/19-3091.00) likewise lists distinct field, documentary, analytical and reporting tasks. These support contextual role-task examples, not a universal ordered student syllabus.
- The NIH Office of Behavioral and Social Sciences Research [mixed-methods best-practice guide](https://obssr.od.nih.gov/sites/g/files/mnhszr296/files/Best_Practices_for_Mixed_Methods_Research.pdf) treats sequence, priority and integration as design decisions. It supports exact named-combination routes rather than silently unioning standalone routes.
- The [UK Data Service guidance on managing data during a project](https://ukdataservice.ac.uk/learning-hub/data-producer-support/managing-data-during-the-project/) describes data management across active project work. It supports carrying documentation, quality and security context through relevant research workflows, but does not establish that all areas or roles require the same fixed order.

These sources support the route-design rules above. They do **not** individually validate the 264 domain-item/task links or the 137 task-family/item links; those remain explicit data reconciliation work.

## Verification status

- The full `d078RouteProjection.test.ts` suite passed: 34/34 tests. This includes declared single-method and named-combination area/role route checks, role-item/tool eligibility, baseline role contexts when optional focus is skipped, rejection of source-less links as personalization evidence, and exhaustive add/remove reachability for every route item's selection subset.
- The focused role-task source audit passed: `data/career-mapping/_audit/test_d078_task_family_role_context_2026_10_29.py` (5/5 tests).
- The focused `D078MethodAwareJourney.test.tsx` role-route rendering regression passed (1/1 targeted test). Jest had to force-exit because component effects retry unavailable local API calls; this proves the rendered component assertion, not live-service or browser behavior.
- Rendered browser acceptance, SQL regeneration, Supabase deployment and final student-facing approval are not part of this audit and are not claimed.
