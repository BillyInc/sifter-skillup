# Agent 1 prompt — verify and repair D166 terminal dispositions

You own the first four D166 areas already assigned in `D166_AGENT1_SOURCE_WORKPACK_2026_10_24.json`:

1. Vehicle Sensing and Sensor Calibration
2. Perception and Scene Understanding
3. High-Definition Mapping and Map Data
4. Localization and Vehicle State Estimation

Your task is to **independently verify the current closure claims and repair any unsupported or premature terminal dispositions**. Do not treat the closure note as proof. It currently reports 58 mapped cells, 38 bounded-no-hit cells, 17 completed task tracks, and 7 bounded-no-hit task tracks. Recount the current JSON before work; these numbers may have changed.

## Required work

1. Review the full JSON and Markdown workpack, its source and query logs, and `D166_AGENT1_REVIEWER_RECONCILIATION_2026_10_24.md`. Preserve the original submitted/reconciliation record; update the current workpack and add a dated audit note rather than erasing history.
2. Audit all 96 area-family-horizon cells (six item families × four maturity horizons × four areas), with special scrutiny of every `bounded_no_hit` cell and all seven `bounded_no_hit` task tracks. Check that searches were actually performed, sources/queries are traceable, and the claimed absence is supported by counter-searches. A search failure, paywall, inaccessible page, abstract-only evidence, or lack of an official source is a limitation, not by itself a no-hit.
3. Verify every mapped claim against the cited source at the claim’s stated scope. Reject duplicated claims, wrong family/horizon placement, abstract-only overreach, dataset-as-method/tool errors, and unverified tool/standard maturity. Keep source limitations and access dates explicit.
4. For any unsupported disposition, reopen it and do the missing research. Search official and primary sources first, then credible grey sources (maintained technical docs/repos, standards-body material, regulators, engineering organizations, and transparent specialist resources). Use web pages, technical documentation and repositories as well as papers/PDFs. Log the actual query, source opened, what it supports, what it does not support, and retrieval/access limitations.
5. Check for missing prerequisites, established alternatives, current practice, emerging approaches and genuinely future-facing research across methods, techniques, tools/data, standards/credentials/resources and downstream outputs. Explain alternatives and dependencies only where sources establish them; do not infer a sequence or computational dependency from co-occurrence.
6. Preserve all nine canonical roles, their existing ownership and route state. Conditional task evidence is contextual only. Do not add/remove/reclassify roles or approve cross-area candidates, routes, graph edges, blockers, or learning items.

## Closure rules

- A cell may be terminal as **evidence mapped** only when it has at least one specific, source-backed claim correctly scoped to that cell, with source locator, context, maturity rationale and limitations. A source title or broad topic mention is not enough.
- A cell may be **bounded no-hit** only after a recorded, reproducible search across the relevant source families and a counter-search, with exact queries, dates, sources/results inspected, scope boundary, and a reason no defensible claim can be made. Do not use it to mean “not found quickly,” inaccessible, or “no official source.” If credible evidence exists, map it.
- Use **not applicable** only when the item family/horizon truly does not apply to the area, with a clear technical reason and a counter-search. Do not use it as a substitute for missing research.
- A task track is terminal only when each sub-question in its bounded scope has a disposition and traceable evidence/search record. Do not close a task because its cell has one claim or because the workpack has many sources.
- An area is complete only when all 24 cells and all six task tracks have defensible terminal dispositions, and no material contradiction or unexamined candidate remains within its declared scope. State the scope and remaining limits; never claim absolute/exhaustive coverage.
- Do not use a fixed source-count quota as a proxy for quality. Use enough independent and appropriate sources to resolve each claim and counter-search; explain source diversity and evidential limits.

## Files and boundaries

Edit only Agent 1’s current workpack JSON/Markdown, the Agent 1 audit note, and a focused Agent 1 validator if necessary. Do not edit Agent 2’s files, the canonical D011/D166 source index, graph JSON/generator, taxonomy, role fit/routes, contracts, UI, SQL or migrations. Do not overwrite the historical reviewer reconciliation.

## Deliverables

- Updated Agent 1 JSON and Markdown workpack with each cell and task disposition traceable to evidence/query IDs.
- A dated audit note listing each retained closure, each reopened item and why, research added, and any true blockers. Give before/after counts by area, cell family/horizon, task state, source/query additions, and role-context records.
- Run the Agent 1 validator and any focused consistency checks. Report exact commands and results. Do not claim browser/rendered validation unless performed.

Do not touch Agent 2’s four areas. The coordinator will reconcile agent workpacks into the canonical index and graph after both assignments finish.
