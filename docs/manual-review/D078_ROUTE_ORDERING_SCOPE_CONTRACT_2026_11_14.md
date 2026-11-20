# D078 Route Ordering Scope Contract

**Date:** 2026-11-14  
**Status:** Implemented in the local graph generator and regenerated graph/UI data; live SQL and student-facing release approval are separate.  
**Canonical graph:** `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`  
**Graph schema:** `2026-11-14.d078-method-area-role-route-graph.v12`  
**Progression contract:** `d078-selection-progression-contract-2026-11-14-v9`

## Decision

The learning path is ordered from one selected context to the next. An item does
not need an item-to-item prerequisite edge in order to belong to an ordered
route. Pairwise prerequisites are a narrower claim and are added only when
reviewed evidence establishes the exact items and their order.

This distinction is especially important for roles. The source review covers
all 19 current D078 roles and 173 role-item records, with 405 preparation notes
(382 distinct notes). It found zero approved role-item prerequisite edges and
no separate role-wide foundation supported across these routes. The notes
describe task preparation, work process or safeguards; they do not by
themselves identify an exact learning item that must precede another. The role
path is still ordered by context:

```text
selected domain foundations
  → optional Society and social-world orientation
  → selected method or named design
  → its Layer 2 / Layer 3 knowledge and research-practice choices
  → other items, alternatives and tools attributed to that selected method/design
  → supported area
  → optional area foundation, when present
  → selected area task family or the baseline area route
  → family-specific preparation, when present
  → area-owned items, alternatives and tools linked to that route/family
  → selected role
  → reviewed role-task context
  → role-owned items, alternatives and tools attached to that context
```

The task-family and role-task choices are route contexts, not a universal
numbered syllabus. A learner may skip optional items; skipping does not detach
later learning from its method, area, role or task context and does not block
the supported baseline route.

## What “ordered” means

1. **Route-stage order:** The graph stores nine progressive stages. Stage order
   controls what context is revealed next and which choices are available.
2. **Group order:** Domain Layer 2 and Layer 3 groups follow the reviewed
   `domain_learning_layers.sequence_order`; method-attributed domain items and
   tools are also present in that method-learning stage. The selected area
   then reveals its own optional foundation, task-family choice, selected
   family preparation, and linked area items/tools before roles are offered.
   Only after the learner selects a supported role does its reviewed
   role-task context reveal that context's role-owned items/tools. Each block
   remains attached to its upstream method, area, family or role context.
3. **Within-group order:** A reviewed `conditional_prerequisite` or `workflow`
   edge orders only the exact item pair it names. Other selectable items in
   the same group are parallel choices, not a ranked list and not missing
   route data.
4. **Alternatives and tools:** Alternatives are exact compare choices; tools
   remain attached to their supporting method/task context. Neither becomes a
   sequence step merely because it is listed after another card.
5. **Display arrays:** Array position and alphabetical order are stable
   rendering details only; neither is a learning rank.

Do not use legacy phrases such as “no relative order” or “independent choice”
for a route item. The generated item disposition must state the route stage,
all group memberships, the within-group ordering rule, and applicable reviewed
edge identifiers. “Parallel choice within the selected ordered route group”
means the route is ordered while that exact item has no approved pairwise
prerequisite against its peers.

## Current graph evidence

- 207 route plans: 117 single-method routes, 31 named designs and 59 exact
  participatory component variants, across all seven canonical areas.
- Every route plan stores the nine ordered stages and every projected learning
  item has a route-stage and group disposition.
- 15 unique reviewed ordering edges are currently active: 3 conditional
  prerequisites and 12 recommended workflow edges. The count is current state,
  not a target or completeness threshold.
- Role item-to-item prerequisite edges: 0, following the source review above.
  This does not remove or flatten the ordered area-to-role progression.
- The graph generator removes item-level `sequence_approved=false` flags;
  approval belongs on a reviewed edge, not on an item node. Role nodes instead
  record that their items appear within an ordered role-task context while no
  pairwise order is established.
- The graph remains student-visible with the separate UI/release gate closed.
  This checkpoint does not authorize opening that gate.

## Regression guard

`data/career-mapping/_audit/test_d078_route_sequence_completeness_2026_11_05.py`
must check that:

- each of the 207 routes has stages 1–9 in the declared order;
- every item disposition has a stage, one or more same-stage group memberships,
  and an explicit within-group ordering scope;
- items without reviewed pairwise edges are described as parallel choices
  within the selected route/group, never as independent or unordered routes;
- the role route preserves selected area and reviewed role-task context, and
  role item nodes do not carry stale item-level approval booleans;
- alternatives remain comparison choices, optional skips preserve the route,
  and the exported UI graph carries the same contract;
- the graph output contains no deprecated “no relative order” or “independent
  skippable choice” disposition.

The generator and exporter were run locally for this checkpoint. No SQL was
generated or applied, and no live Supabase or rendered-browser approval is
claimed. The final end-to-end matrix remains downstream of this route-contract
audit. Only after that matrix is complete should the separate release gate be
reconciled: verify all seven programme-to-domain/area links, update stale
linkage wording to reflect the measured result, and open student release only
if that evidence and the controlling UI acceptance checks pass.
