# D078 method graph context and route checkpoint

Date: 2026-10-20

## Scope completed

The D078 method/area/role graph was rebuilt from the route builder, enriched
with the method-technique and relationship-resolution ledgers, contextualized,
and exported to the compact UI contract. This phase did not edit SQL,
migrations, requirement dispositions, ownership, approval, visibility, or role
fit. The later relationship-panel UI work remains a separate phase.

## Current graph and contract

- 1,603 canonical nodes and 13,420 canonical edges.
- 22 independently selectable methods, 9 named combination designs, and 7
  areas.
- 116 method-to-area routes and 421 method-to-area-role routes.
- 53 combination-to-area routes and 195 combination-to-area-role routes.
- The compact export contains 1,549 nodes, 22 methods, 9 combinations, 116
  area routes, 421 role routes, and 581 resolved, visible relationship edges.
- All 130 relationship-annotation records are explicitly resolved: 126 ready
  for use, 4 explanatory only, 0 unresolved. The 126 ready records resolve to
  canonical graph targets and remain skippable and nonblocking.
- The technique ledger contains 98 selectable records and 12 explanatory-only
  records; all 98 selectable records are reachable through their declared
  method/area route.

## Context coverage

The graph context ledger records 460 contextualized nodes, including:

- 110/110 new method/technique ledger items;
- 168 role learning-item candidates;
- all 21 area task-family summaries, with 20 connected to existing canonical
  area/domain items for explanation;
- all 14 area tool options;
- all 9 combination designs, each with its integration order/contract;
- all 8 emerging candidate items, with 36 source-registry references attached.

The emerging candidates remain hidden under their existing dispositions.
Their prose alternatives/complements are retained as explanatory context and
do not become clickable edges. Context enrichment does not approve them.

The only route repair in this pass is the existing, source-backed pandas to
Excel alternative: Excel is included on quantitative and computational social
research method routes where it had been absent. No blanket route expansion
was applied.

## Exhaustive route verification

`data/career-mapping/_audit/audit_d078_method_route_closure_2026_10_20.py`
enumerated every subset of the 22 independent methods, including the empty
selection: **4,194,304 method-selection states**. It also checked all **24
optional component states** across the nine combination designs (the four
selectable components in the participatory frame account for its 16 states).
All role routes have a matching selected-area route; all selectable technique
records are reachable; all ready relationship-ledger targets resolve and have
matching canonical graph edges. The structural audit passed with zero errors.

Among 581 ready visible relationship edges, 521 have endpoints available
together at a method, area, or role stop. The remaining 60 connect to existing
hidden or nonselectable items, including the eight hidden emerging candidates
and hidden foundation/data-care targets. They remain unavailable as selectable
destinations and must use the approved hidden/unavailable explanation in the
relationship UI. They do not justify widening ownership or visibility.

The graph supports unions of any set of independently selected methods. Its
nine named mixed-method designs are the explicit, reviewed combinations; the
graph does not claim that every mathematical pair of methods is itself a
validated mixed-method design or a computational dependency.

## Validation run

- `C:\Python314\python.exe data/career-mapping/_audit/build_d078_method_area_role_routes_2026_10_19.py` — passed: 1,549 base nodes, 12,827 base edges, 22 methods, 116 method/area routes, 9 combinations, 53 combination/area routes, 7 areas, 19 roles.
- `C:\Python314\python.exe data/career-mapping/_audit/apply_d078_method_technique_resolution_2026_10_20.py` — passed: 36 domain techniques, 14 technique alternatives, 16 verified tools, 2 area methods, 1 area specialist method; 1,603 nodes and 13,281 edges before the relationship-resolution merge.
- `C:\Python314\python.exe data/career-mapping/_audit/enrich_d078_method_graph_context_2026_10_20.py` — passed; output counts above.
- `C:\Python314\python.exe data/career-mapping/_audit/export_d078_method_aware_ui_data_2026_10_19.py` — passed: `src/data/d078MethodAwareUiData.json`, 11,885,279 bytes, 1,549 nodes.
- `C:\Python314\python.exe data/career-mapping/_audit/test_d078_method_area_role_routes_2026_10_19.py` — **14 tests passed**.
- `C:\Python314\python.exe data/career-mapping/_audit/audit_d078_method_route_closure_2026_10_20.py` — passed: 4,194,304 method states, 24 component states, 98/98 selectable techniques reachable, 521/581 relationship edges co-projectable, zero structural errors.
- `npm.cmd test -- --runInBand src/lib/d078RouteProjection.test.ts` — could not run because the local `jest` executable is missing (`'jest' is not recognized`). This is not a passing UI projection test.

No browser-rendered acceptance is claimed. The route audit validates graph
contract closure, not the student-facing visual interaction. The separate UI
panel must filter current projection targets and render the approved hidden
target explanation for unavailable destinations.

## Routeability repair update — 2026-10-20

This update supersedes the earlier paragraph above that treated all 60
relationship endpoints as unavailable. The 60 count mixed stale route labels,
useful selectable tools, invalid cross-class comparisons, explanatory
practices, and genuinely unavailable candidate endpoints. The graph now routes
the source-backed items on the methods and areas where they fit, and keeps
non-item practices as explanatory-only records.

- Power BI, Tableau, and Excel are separate optional reporting/visualisation
  tools on structured-output routes. Power BI and Tableau are alternatives;
  Excel and Python have scoped comparison links where a static/code-based
  report can serve the task.
- Taguette and NVivo are separate selectable domain-owned tools on
  text-analysis routes. The combined “Taguette / NVivo” area prompt remains
  explanatory. Mesa and Casevo are scoped to agent-based modelling; Casevo is
  presented as experimental and does not replace empirical methods.
- Source-supported research-data care, secondary-data, ethics, graph/network,
  evaluation, and communication items are projected at relevant method stops.
  Existing requirement lanes and ownership are preserved; needed items retain
  their existing lane, while optional edges remain skippable and nonblocking.
- The relationship ledger now has 113 ready item-to-item records, 17
  explanatory-only records, and zero unresolved records. All 566 ready,
  student-visible canonical edges share a route. The 17 explanatory-only
  records include practices or comparisons without a selectable canonical
  destination; they do not hide a separate usable item.
- The exhaustive audit passes all 4,194,304 method selections and 24 named
  combination component states, with 98/98 selectable technique records
  reachable and zero route-closure errors. Requirement dispositions, item
  ownership, role fit, SQL, and migrations were not changed.

The relationship panel is separate work. This graph/contract update does not
claim rendered UI acceptance.
