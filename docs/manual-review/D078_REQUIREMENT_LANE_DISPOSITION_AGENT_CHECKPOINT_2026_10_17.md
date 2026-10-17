# D078 Requirement Lane Disposition Agent Checkpoint

Date: 2026-10-17

## Scope
Classify D078 learning-item requirements as needed/core, useful edge, optional/conditional, choose-one alternatives, or unapproved across the domain, all seven canonical areas, and roles. Do not research or add tools/roles; change role fit/ownership, explanations/UI, or graph sequencing; or edit local explanation files.

## Completed work
Created the item-context ledger at `data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json`. It records each lane, task condition where applicable, rationale, evidence references and source artifact. It is a local recommendation artifact; it does not approve student display or alter runtime data.

Coverage: **501 records** — 53 canonical domain items (six exact search aliases folded into their canonical item rows), 144 expanded area items, 36 inherited area items, 173 role-item records, and 95 current role-tool choices. The 144 expanded records match the exhaustive register exactly. All seven canonical areas and all 19 current role contexts are represented.

| Context | Needed | Conditional | Useful/optional | Choose-one | Unapproved |
|---|---:|---:|---:|---:|---:|
| Domain (53) | 3 | 30 | 16 | 2 | 2 |
| Expanded area (144) | 0 | 98 | 45 | 1 | 0 |
| Inherited area (36) | 0 | 36 | 0 | 0 | 0 |
| Role-item (173) | 0 | 98 | 73 | 0 | 2 |
| Role-tool (95) | 0 | 0 | 0 | 95 | 0 |
| **Total** | **3** | **262** | **134** | **98** | **4** |

The three domain `needed` records are bounded to research-oriented routes; they are not declared mandatory for every D078 learner, area, or role. All 95 current role tools are explicitly optional in the source contract; the ledger records their task-dependent choice conditions and alternatives. Historical `essential/optional` priority snapshots, student/review flags, and graph placement are not used as requirement evidence.

## Unapproved contexts retained with specific gaps
1. Domain `d078-certification-boundaries`: source disposition holds the universal-negative claim that no D078 professional certification exists; absence from inventory does not establish that claim or a credential requirement.
2. Domain `d078-casevo-tool`: contract still holds this as an emerging specialist candidate; requirement lane is not established.
3. Role item queue 142, `history of philosophy|essential` for philosopher: the integrated graph explicitly excludes philosopher from D078; no reassignment is made.
4. Role item queue 160, `logic|essential` for philosopher: same route-boundary exclusion.

## Source and scope handling
- Domain lanes follow the current domain contract’s source-backed categories and item-specific conditions. Six exact tool aliases are preserved in `exact_alias_ids` on canonical rows.
- Area lanes join the 39 existing ledger decisions and the 105 Oct. 12 area handoff decisions, then verify exact coverage against the 144-item expanded-area register. `promote`/`promote_scoped` is not treated as compulsory mastery. The 36 inherited task-family items are conditional on the task question, evidence, and output.
- Role-item lanes use the reconciled graph’s item-specific placement rationale and task/output; the two philosopher records remain unapproved with explicit route-boundary reasons. Existing role-fit decisions are not reopened.
- Role-tool lanes use the current Oct. 16 role-tool contract. No tools or roles were added.

## Validation
Inline Python validation passed: JSON parses; total and per-layer counts match; all 144 expanded area IDs match exactly; six domain aliases are folded; seven area and 19 role contexts are present; item-context keys are unique; every conditional/needed/choose-one record names a condition; and every unapproved record names a specific evidence gap. Evidence reference arrays and source artifact references are present on every row. No sequence or graph fields were written.

Tests not run: this changed only a local review ledger and documentation; no runtime behavior or test code changed. The ledger’s structural validation was executed and passed.

## Files changed in this task
- `data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_17.json`
- `docs/manual-review/D078_REQUIREMENT_LANE_DISPOSITION_AGENT_CHECKPOINT_2026_10_17.md`

No disposition source, explanation file, graph, UI, role fit/ownership, tool inventory, or runtime artifact was modified.
