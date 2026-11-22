# D078 requirement-lane repair summary — 2026-10-20

The 2026-10-20 contract uses the current method-aware graph for route context. The graph and its dependency ordering were read only.

- In-scope items: **490**
- Needed/core: **3**
- Useful edge: **132**
- Optional/conditional: **355**
- Out-of-scope audit rows: **11**
- Residual genuinely unresolved in-scope items: **0**

## Domain

| Disposition | Records |
|---|---:|
| needed_core | 3 |
| optional_conditional | 33 |
| useful_edge | 16 |
| out_of_scope | 1 |

## Seven canonical areas

| Area | Needed/core | Useful edge | Optional/conditional | Out of scope | Total |
|---|---:|---:|---:|---:|---:|
| Computational and Digital Social Science | 0 | 6 | 14 | 0 | 20 |
| Economics and Applied Economic Analysis | 0 | 17 | 16 | 0 | 33 |
| Human Geography and Population Studies | 0 | 2 | 12 | 0 | 14 |
| Politics, Governance and Public Policy | 0 | 0 | 31 | 0 | 31 |
| Social Behaviour and Interaction | 0 | 0 | 28 | 0 | 28 |
| Social Research and Evaluation | 0 | 5 | 12 | 0 | 17 |
| Sociology and Social Anthropology | 0 | 15 | 22 | 0 | 37 |

## Current roles

| Role | Needed/core | Useful edge | Optional/conditional | Out of scope | Total |
|---|---:|---:|---:|---:|---:|
| anthropologist | 0 | 5 | 8 | 0 | 13 |
| archaeologist | 0 | 6 | 11 | 0 | 17 |
| behavioural-scientist | 0 | 1 | 10 | 0 | 11 |
| business-economics-researcher | 0 | 4 | 15 | 0 | 19 |
| criminologist | 0 | 0 | 10 | 0 | 10 |
| demographer | 0 | 2 | 10 | 0 | 12 |
| economic-adviser | 0 | 15 | 19 | 0 | 34 |
| economic-development-coordinator | 0 | 7 | 13 | 0 | 20 |
| economic-policy-officer | 0 | 5 | 13 | 0 | 18 |
| economist | 0 | 4 | 10 | 0 | 14 |
| genealogist | 0 | 14 | 19 | 0 | 33 |
| geographer | 0 | 2 | 10 | 0 | 12 |
| media-scientist | 0 | 6 | 8 | 0 | 14 |
| political-scientist | 0 | 4 | 11 | 0 | 15 |
| social-work-researcher | 0 | 2 | 12 | 0 | 14 |
| sociologist | 0 | 3 | 12 | 0 | 15 |
| statistician | 0 | 2 | 11 | 0 | 13 |
| tax-policy-analyst | 0 | 8 | 13 | 0 | 21 |
| thanatology-researcher | 0 | 0 | 9 | 0 | 9 |

## Out-of-scope evidence notes

- `d078-certification-boundaries` (domain): This record is a universal negative claim about certification availability, not an affirmative learning item or credential requirement. The attached education/training and programme sources do not establish that no D078 professional certification exists. Keep the claim out of the item lane set. Checked: Current D078 domain inventory and contract; ESRC postgraduate training guidance; NUC Social Sciences CCMAS 2023; NHREC training guidance; Kobo Essentials training reference.
- `55:advertising techniques|optional` (role_item): This queue row is assigned only to communication scientist, which has no current role route in the 2026-10-19 D078 method-aware graph. The graph supports media scientist as a separate role; this item is not reassigned across those roles without reviewed evidence. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `81:communication|essential` (role_item): This queue row is assigned only to communication scientist, which has no current D078 role route. The current graph lists media scientist separately; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `83:conduct psychological research|optional` (role_item): This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `116:communication|essential` (role_item): This queue row is assigned only to communication scientist, which has no current D078 role route. The current graph lists media scientist separately; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `117:ethics|optional` (role_item): This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `127:forensic anthropology|optional` (role_item): This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `141:history of literature|optional` (role_item): This queue row is assigned only to media researcher, which has no current D078 role route. The current graph lists media scientist separately; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `143:human physiology|optional` (role_item): This queue row is assigned only to death and dying researcher, which has no current D078 role route. The similar thanatology researcher label is a separate graph role; no cross-role reassignment is supported. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and method-area-role routes.
- `142:history of philosophy|essential` (role_item): The source queue row belongs to philosopher, which the current D078 method-aware graph excludes from its 19 supported roles. Preserve the source record for audit; do not assign it to a D078 area or another role. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and role routes.
- `160:logic|essential` (role_item): The source queue row belongs to philosopher, which the current D078 method-aware graph excludes from its 19 supported roles. Preserve the source record for audit; do not assign it to a D078 area or another role. Checked: D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json: supported roles and role routes.

## Aggregate repair

The 10/17 detail rows contain four needed records and 261 conditional records, while its summary reports three and 262. The current graph identifies three shared foundations. Responsible research is conditional when a task involves people or identifiable/sensitive data. The Sociology/Economics 10/12 pending_count of 56 is stale (56 individually decided, validation.pending_cases=0); the 10/12 tranche remainder counts (105 area, 50 domain) are historical, not current pending state. Counts here are recomputed from individual rows.

## Files and boundaries

- Contract: `/home/williams/Documents/sifter-repo/sifter-skillup/data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json`
- Current route context: `/home/williams/Documents/sifter-repo/sifter-skillup/data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`
- Current handoff: `/home/williams/Documents/sifter-repo/sifter-skillup/docs/manual-review/D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`
- No graph, route ordering, taxonomy, role-fit/ownership, explanation/UI, SQL, or migration changes.
