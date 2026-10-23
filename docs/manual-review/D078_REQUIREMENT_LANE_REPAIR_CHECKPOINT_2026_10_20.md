# D078 requirement-lane repair checkpoint

Date: 2026-10-20

## Assignment and boundaries

Repair the D078 requirement-lane disposition contract at domain level, all seven canonical areas, and role level. Classify each in-scope item as needed/core, useful edge, or optional/conditional; preserve reviewed task and route conditions; write item-specific rationale/context; reconcile stale aggregate flags from individual decisions.

No method-aware graph, dependency ordering, taxonomy, role fit/ownership, UI/explanations, SQL, or migrations were changed. The current method-aware graph was read only as route/context evidence. This contract does not promote student visibility or change runtime data.

## Authority and method-aware alignment

- Current route and method context: `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`.
- Current display/route instructions: `docs/manual-review/D078_METHOD_AWARE_UI_HANDOFF_2026_10_19.md`.
- The current graph identifies exactly three shared foundation IDs; the handoff says these are above method choice. They are the only needed/core items.
- After those foundations, chosen methods and named combinations bound visible area, role, task, item, and tool routes. Selecting a method does not make it a job requirement. Existing route/task conditions remain on each record.
- The 2026-10-15 integrated graph cited by the old ledger remains historical input only; no older graph determines current route semantics.

## Repaired artifact

- Contract: `data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json` (501 auditable source rows; 490 in scope).
- Gzip mirror: `data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json.gz`.
- Reproducible repair/check script: `data/career-mapping/_audit/repair_d078_requirement_lanes_2026_10_20.py`.
- Derived machine summary: `data/career-mapping/_audit/D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.json`.
- Derived human summary: `docs/manual-review/D078_REQUIREMENT_LANE_REPAIR_SUMMARY_2026_10_20.md`.

Each in-scope row has a normalized disposition, context, item-specific rationale, prior lane for traceability, and original condition retained where present. Role tool rationales use their reviewed contextual use, expected output, and recorded alternatives. Area labels are readable names derived from their canonical item IDs because the current route graph stores these expanded area records under task/item route IDs.

## Final counts

| Scope | Needed/core | Useful edge | Optional/conditional | Out of scope | In-scope total |
|---|---:|---:|---:|---:|---:|
| Domain rows | 3 | 16 | 33 | 1 | 52 |
| All seven canonical area rows (area + inherited task-family) | 0 | 45 | 135 | 0 | 180 |
| Role item/tool rows | 0 | 71 | 187 | 10 | 258 |
| **Total** | **3** | **132** | **355** | **11** | **490** |

The 7-area and 19-role item-by-item counts are in the derived summary. Area rows are item occurrences by area; role rows can intentionally apply to more than one role, so per-role counts overlap and should not be summed as unique source records.

Eleven source rows are out of scope, not unresolved D078 requirement items:

- `d078-certification-boundaries`: a universal negative claim, not an affirmative learning item. The checked domain contract, ESRC training guidance, NUC Social Sciences CCMAS, NHREC training guidance, and Kobo Essentials reference do not prove that no professional certification exists. A separate certification inventory review would be needed before asserting that boundary claim; it receives no requirement lane here.
- `142:history of philosophy|essential` and `160:logic|essential`: retained for audit but excluded because their philosopher role is not among the current graph’s 19 supported D078 roles. They are not reassigned.
- `55:advertising techniques|optional`: its only source context is communication scientist, which has no current D078 method-area-role route. The graph contains media scientist as a separate role; this row is not reassigned between them.
- Seven additional role rows are retained outside the current contract because their only source contexts are communication scientist (`81:communication|essential`, `116:communication|essential`), death and dying researcher (`83:conduct psychological research|optional`, `117:ethics|optional`, `127:forensic anthropology|optional`, `143:human physiology|optional`), or media researcher (`141:history of literature|optional`). These labels are not current graph roles; they are not silently mapped to similar current roles.

Casevo was not left unresolved: the current graph’s Mesa-or-Casevo path and the existing Casevo README/tutorial and paper support a bounded optional tool choice for an agent-based social-simulation task. It is optional/conditional; Mesa is recorded as an alternative.

Residual genuinely unresolved in-scope count: **0**. The unsupported historical role contexts remain out of scope until a reviewed route places those exact roles in D078; the current assignment does not add roles or revise the graph.

## Reconciled stale aggregates

- The 10/17 ledger details contain 4 needed and 261 conditional rows, while the ledger summary says 3 and 262. The current method-aware contract yields 3 shared needed/core foundations; responsible research is conditional on the task involving people or identifiable/sensitive data.
- `D078_AREA_DISPOSITIONS_SOCI_ECON_2026_10_12.json` says `scope.pending_count=56`, but its 56 individual rows comprise 28 promote, 22 promote_scoped, and 6 exclude; `validation.pending_cases=0`, with no unresolved source identities or explicit contract gaps. The pending aggregate is stale.
- `D078_ITEM_PROMOTION_DISPOSITIONS_2026_10_12.json` carries historical remainder counts of 105 area items and 50 domain items. The current ledger contains and dispositions all 144 expanded area rows and 53 domain rows. Those historical tranche counts are not current pending flags.

## Validation run

- `python.exe -X utf8 data/career-mapping/_audit/repair_d078_requirement_lanes_2026_10_20.py --write` — regenerated the contract, gzip, and summaries; passed internal assertions for all 501 rows, 498 in-scope items, 7 areas, 19 roles, current foundation IDs, and zero in-scope evidence gaps.
- `python.exe -X utf8 data/career-mapping/_audit/repair_d078_requirement_lanes_2026_10_20.py` — deterministic check passed; JSON, summaries, and gzip mirror match regenerated reviewed rows.
- Condition preservation audit: every source task/route condition is byte-for-byte retained except the new Casevo condition that resolves its prior hold to the narrow optional simulation route.
- `python.exe -X utf8 -m pytest -p no:cacheprovider backend/tests/test_d078_requirement_lane_repair_2026_10_20.py -q` — **5 passed**.

An earlier test iteration exposed area-key and role-ID normalization mismatches in the derived summary; both were fixed before the passing run. The initial pytest invocation also encountered a permission warning while attempting to write the ignored cache; final run disabled the cache provider.
