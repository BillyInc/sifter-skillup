# D078 graph and route-contract handoff

**Date:** 2026-10-20  
**Handoff scope:** D078 method/technique graph, route mapping, relationship resolution, contextual records, and compact UI data contract.  
**Owner boundary:** The relationship-panel implementation belongs to the other agent. This handoff records the graph contract and evidence for that integration; it does not claim panel completion or rendered UI acceptance.

## 1. Handoff summary

The D078 method graph and its route contract have been repaired and exhaustively checked. Verified useful learning items now have canonical route placement where the method and evidence support it. Invalid cross-class comparisons and non-item workflow phrases no longer masquerade as clickable destinations. Separate products remain separate choices. Relationship edges are optional and non-blocking, and a relationship is eligible for display only when its canonical endpoints are available together in the active route projection.

The current contract has **22 methods, 9 named combination designs, 7 areas, and 19 roles**. It defines **116 method-to-area routes, 421 method-to-area-role routes, 53 combination-to-area routes, and 195 combination-to-area-role routes**. The compact student projection contains **1,559 nodes and 566 ready visible relationship edges**.

## 2. What changed

### Routeable items and placement

The route repair updated route declarations/mappings for **21 canonical records**. This did not change their ownership or existing visibility/disposition; a route reference alone does not promote a hidden candidate to a student-selectable item.

- **Reporting and visualisation:** Power BI, Tableau, and Excel are separate optional tool items on routes that use structured output. Power BI and Tableau have a scoped alternative relationship. Excel is placed on quantitative and computational social-research routes where it supports the relevant workflow; Excel is not treated as an alternative to quantitative analysis itself.
- **Text analysis:** Taguette and NVivo are separate selectable tools on text-analysis routes. The combined “Taguette / NVivo” area prompt remains explanatory and is not a destination. It does not collapse the products into one item.
- **Agent-based modelling:** Mesa and Casevo are routed only with agent-based modelling. Casevo remains framed as experimental. Neither product is presented as a substitute for quantitative, qualitative, or survey methods; synthetic respondents are not offered as a general participant or survey-method replacement.
- **Other bounded supports:** Existing canonical items for research-data care, secondary data, ethics, graph/network concepts, evidence evaluation, and evidence communication are projected only where the route contract supports them.
- **AI-assisted items:** AI-assisted metadata curation and harmonisation are contextualized with source limits and human-review expectations. The World Bank reference supports a bounded metadata-curation workflow; it does not validate arbitrary AI outputs or make the practice compulsory.

The repair was bounded to source-backed route matches. It did not promote hidden emerging candidates, turn task-family prose into learning items, or infer role fit from area membership.

### Relationship resolution and display contract

The relationship annotation ledger now records **130 resolved annotations**:

| State | Count | Student treatment |
| --- | ---: | --- |
| Resolved, ready for use | 113 | Canonical relationship; eligible only when both endpoints are in the current route projection |
| Resolved, explanatory only | 17 | Retained as explanatory provenance; no student destination |
| Unresolved after exhaustive search | 0 | None remain in this ledger |

The 17 explanatory-only cases include phrases such as manual comparison practices or workflow descriptions that do not resolve to a canonical selectable item. Their usefulness as ideas does not justify inventing a graph node or clickable endpoint. Conversely, the tool itself remains selectable when it is a distinct verified item, as with Taguette and NVivo.

The route repair corrected or retargeted **12 relationship records** and removed **16 false or misleading graph edges**. Examples include Mesa-as-alternative-to-quantitative/qualitative/survey claims, synthetic respondents as a survey destination, NVivo as an alternative to thematic analysis, and workflow comparisons without a canonical learning item. Relationship links never block progression; they do not silently change an item’s requirement lane.

### Context coverage

The current graph/UI data includes contextual application records for **460 items/records**, including:

- 110/110 new method-technique ledger records;
- 168 role item candidates;
- all 21 area task-family summaries;
- all 14 area tool options;
- all 9 named combination designs, each with its integration contract;
- 8 emerging candidates with 36 attached source-registry references, while retaining their prior dispositions.

Typed relationships in the compact contract are copied from resolved graph relationships only. The context pass did not change requirement disposition, ownership, approval, visibility, or role fit.

## 3. Exhaustive validation evidence

The final route-closure audit passed with no errors:

- Enumerated **4,194,304 selections** across all 22 independent methods, including the empty selection.
- Checked **24 component states** for the nine named combination designs.
- Confirmed **98/98 selectable technique records are reachable** through their declared method/area routes.
- Confirmed all **566 ready, student-visible canonical edges** share a declared route; **0** ready visible edges have unavailable route endpoints.
- Confirmed every role route has a corresponding selected-area route.
- Confirmed the 17 explanatory-only records are not student destinations.

The independent method-selection union is not a claim that every pair of methods is itself a validated mixed-method design. The nine named combinations carry their own design and integration logic. Only a documented design/output handoff justifies a computational dependency; arbitrary cross-method pairs are not dependencies.

## 4. Authoritative artifacts

Use these as the current graph and audit sources:

- Canonical route graph: [`D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`](../../data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json)
- Compact student projection: [`d078MethodAwareUiData.json`](../../src/data/d078MethodAwareUiData.json) — 1,559 projected nodes, 566 ready visible relationship edges, 22 methods, 9 combinations, and the route counts above.
- Exhaustive route audit: [`D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json`](../../data/career-mapping/_audit/D078_METHOD_ROUTE_EXHAUSTIVE_AUDIT_2026_10_20.json)
- Relationship-resolution ledger: [`D078_RELATIONSHIP_RESOLUTION_2026_10_20.json`](../../data/career-mapping/_audit/D078_RELATIONSHIP_RESOLUTION_2026_10_20.json)
- Route-repair decision record: [`D078_RELATIONSHIP_ROUTE_REPAIR_2026_10_20.json`](../../data/career-mapping/_audit/D078_RELATIONSHIP_ROUTE_REPAIR_2026_10_20.json)
- External routeability review: [`D078_ROUTEABILITY_EXTERNAL_SOURCE_REVIEW_2026_10_20.json`](../../data/career-mapping/_audit/D078_ROUTEABILITY_EXTERNAL_SOURCE_REVIEW_2026_10_20.json)
- Context coverage ledger: [`D078_ITEM_CONTEXT_ENRICHMENT_2026_10_20.json`](../../data/career-mapping/_audit/D078_ITEM_CONTEXT_ENRICHMENT_2026_10_20.json)
- Context and route checkpoint: [`D078_METHOD_GRAPH_CONTEXT_AND_ROUTE_CHECKPOINT_2026_10_20.md`](D078_METHOD_GRAPH_CONTEXT_AND_ROUTE_CHECKPOINT_2026_10_20.md)

Relevant reproducible scripts:

- `data/career-mapping/_audit/repair_d078_relationship_routes_2026_10_20.py`
- `data/career-mapping/_audit/reconcile_d078_relationship_ledger_2026_10_20.py`
- `data/career-mapping/_audit/refresh_d078_relationship_route_availability_2026_10_20.py`
- `data/career-mapping/_audit/finalize_d078_relationship_route_contract_2026_10_20.py`
- `data/career-mapping/_audit/audit_d078_method_route_closure_2026_10_20.py`
- `data/career-mapping/_audit/export_d078_method_aware_ui_data_2026_10_19.py`

## 5. Sources recorded for route decisions

The external-source review ledger contains the full source list, claims, limits, and route decisions. Selected references include:

- [World Bank, Practical Guide to Metadata Curation with Language Models](https://worldbank.github.io/ai4data/cookbook/) and [guide introduction](https://worldbank.github.io/ai4data/docs/introduction/) — bounded AI-assisted metadata curation with curator review.
- [ICPSR, Guide to Social Science Data Preparation and Archiving](https://www.icpsr.umich.edu/sites/icpsr/manage-data/prepare-deposit/guide) and [UK Data Service, secondary analysis](https://ukdataservice.ac.uk/learning-hub/new-to-using-data/) — data documentation, preparation, and reuse context.
- [UK Magenta Book analytical methods](https://www.gov.uk/government/publications/the-magenta-book/magenta-book-annex-a-analytical-methods-for-use-within-an-evaluation-html) and [NIH mixed-methods best practices](https://obssr.od.nih.gov/sites/g/files/mnhszr296/files/Best_Practices_for_Mixed_Methods_Research_the_nature_and_design_of_mixed_methods_research.pdf) — design-specific evaluation and mixed-method integration logic.
- [AAPOR standards and ethics](https://aapor.org/standards-and-ethics/) and its [responsible AI in survey research guidance](https://aapor.org/wp-content/uploads/2026/05/Responsible-AI-Integration-In-Survey-Research.pdf) — limits, validity, oversight, and responsible survey use.
- Official product references for the distinct tools and method-specific sources are listed item by item in the external review ledger.

These sources establish that a practice/tool exists and inform appropriate context; route inclusion still requires a canonical item and a defensible match to the method or downstream context.

## 6. Scope protections and exclusions

This graph/contract work did **not** change:

- requirement dispositions or the shared-foundation contract;
- item ownership or layer assignment;
- role fit;
- SQL seeds, SQL files, or migrations;
- the D078 relationship-panel implementation.

**Panel-owner note:** A small panel-file edit was made in an earlier turn before this graph handoff was requested; it was not part of this route repair and was not validated here. The receiving panel owner should inspect/reconcile that pre-existing working-tree edit and run the panel’s focused tests. This handoff does not represent it as complete.

The compact export is the UI data contract, not proof of rendered behavior. No browser-rendered acceptance is claimed by this graph handoff.

## 7. Receiving agent: integration boundary

The other agent owns the relationship panel. It should consume the current compact projection and preserve these contract rules:

1. Only canonical, ready item-to-item edges can become student-facing destinations.
2. Offer an edge only when both endpoint IDs are present in the active method/combination/area/role projection.
3. Keep explanatory-only annotations as prose/provenance, with no click-through destination.
4. Keep distinct tools as distinct destinations; do not render grouped labels as a single tool item.
5. Keep route edges skippable and non-blocking. Do not infer a dependency or auto-select an item from a relationship label.
6. Validate the rendered panel separately; the exhaustive graph audit does not prove panel navigation, accessibility, or visual acceptance.

The prior UI handoff document describes that agent’s acceptance cases: [`D078_UI_REPAIR_HANDOFF_2026_10_20.md`](D078_UI_REPAIR_HANDOFF_2026_10_20.md). Coordinate any shared-file changes with that owner; this document does not assign or claim the panel work.

## 8. Completion status

**Graph and route contract:** complete; exhaustive audit passed.  
**Relationship panel:** separate work owned by the other agent; not part of this handoff’s completion claim.  
**Rendered/manual acceptance:** remains with the panel owner and reviewer.
