# D078 requirement-lane canonical implementation checkpoint

Date: 2026-10-17

## Scope

Implement the reviewed requirement-lane and sequence recommendations in the canonical D078 runtime graph/seed only where the item-context evidence supports them. Preserve all seven canonical areas, all role-to-area branches, and learner-selectable useful edges alongside the compulsory lane. This checkpoint does not authorize changes to UI/explanation content, tool or role inventories, role fit/ownership, or live Supabase.

## Initial state and count reconciliation

- The item-context disposition ledger reports 501 **review records**: 53 domain, 144 area, 36 inherited area-task, 173 role-item, and 95 role-tool records.
- The requirement/sequence runtime merge reports 500 **different runtime rows**: 53 domain, 150 directly-owned area rows, and 297 role rows.
- The canonical D078 domain/area SQL generator emits 203 rows: 53 domain + 150 area. It does not include the 297 role rows, which are stored through separate role/tool contracts.
- Therefore, 501 vs 500 is not evidence of one dropped row. The record sets have different scopes and identities. Exact matches found so far: 52/53 domain item IDs and 136/144 expanded-area IDs. The 36 inherited area-task rows are graph-derived route context; they are not a separate set of direct runtime-owned rows. Role-item/tool rows require their own explicit join keys (queue position/role owner and decision ID/tool ID), not label-only matching.
- Remaining reconciliation: identify the one nonmatching domain ID each way, the 8 area disposition IDs without an exact runtime key, and the 14 runtime area IDs absent from the 144-row disposition set; retain each as a reason-coded unmatched record until an evidence-backed mapping or exclusion is established.
- The recommendation proposes three shared research/evidence foundations as needed only on routes that conduct or interpret social research; the merged runtime data currently labels those items `useful`. This lane change must be represented as a route-scoped requirement, not as a universal domain gate.
- The existing sequence ledger approves three conditional learning-order edges. They remain distinct from requirement lanes; optional/useful choices must not block progression.

## Work status

Implementation is underway. The first reconciliation pass established that the 501 source dispositions join exactly to canonical targets by context-specific keys: 53 domain items, 144 area-owned items, 36 inherited area-task items, 173 role-item queue positions, and 95 role-tool decision IDs. The current student/API runtime is a different population (52 domain items after the unapproved CASEVO domain lane is hidden, 150 directly-owned area rows, and 297 role item/tool rows); it is not supposed to be a one-to-one 501-row copy.

The detailed recommendation supersedes the earlier broad `needed` disposition for the three shared research/evidence foundations. They now remain useful at the unselected domain view and become conditionally needed only when the chosen area/role task calls for their capability. Their suggested 1–3 order is pedagogical only: skippable, nonblocking, not auto-added, and not a prerequisite gate. Other conditional/useful/alternative lanes remain scoped as dispositioned.

Changed so far: additive requirement-scope migration, generated D078 context-item SQL, generated 173-role-item SQL contract, generated 95 role-tool SQL, runtime lane metadata, and canonical graph lane overlay. All 501 review decisions now join the graph exactly; seven Areas of Specialization, 19 roles and 26 area-to-role edges (including seven multi-area role branches) are retained. No UI/explanation components, role ownership/fit decisions, item/tool inventories or live Supabase state have been changed.

Next: run full lane/sequence tests, verify generated graph/SQL parity and migration ordering, refresh the reconciliation report, and record artifact hashes. No live SQL has been applied.
