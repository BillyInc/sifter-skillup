# Agent 2 prompt — close the remaining D166 area evidence tracks

You own the second four D166 areas already assigned in `D166_AGENT2_SOURCE_WORKPACK_2026_10_24.json`:

1. Automated Driving Planning
2. Vehicle Control and Dynamics
3. Vehicle Interface and System Integration
4. ADS Safety, Verification and Validation

Your task is to **finish the source research and give every cell and task track a defensible terminal disposition**. The latest workpack reports 27 candidate mapped claims, 69 open cells, and 24 open task tracks. Recount the current JSON at the start and use its actual current state; do not rely on older summaries (including the earlier 74-cell count).

## Required work

1. Read the complete current Agent 2 JSON and Markdown, all task scopes/next actions, source cards, query packs, counter-searches, and `D166_AGENT2_REVIEWER_RECONCILIATION_2026_10_24.md`. Preserve the prior records and append dated updates.
2. Review all 96 cells (six item families × four maturity horizons × four areas). Verify each existing candidate claim against its source, correct misclassification/overreach, and research every open cell. Do not copy one generic claim across horizons or areas without evidence that supports each placement.
3. Work through all 24 task tracks (six per area) and resolve every sub-question in the declared bounded scope: alternatives and prerequisites, methods/designs, techniques/estimators, tools/software/data and access, standards/credentials/learning resources, outputs/downstream role context, regional/regulatory applicability, and maturity limits as relevant. Include missing prerequisites; do not restrict the search to items already named in the workpack.
4. Search official and primary sources first, then credible grey sources: maintained project/vendor technical documentation, public standards/regulators, benchmark and dataset documentation, engineering organizations, transparent specialist education, and relevant practitioner material. Search webpages, manuals, code repositories, standards summaries, and papers/PDFs. Record exact queries, dates, opened sources, supported claims, counter-evidence, and access limits. An inaccessible source is not evidence of absence; seek an alternate source or leave that narrow point explicitly unresolved with the precise blocker.
5. For every claim, document what the item is, its context in autonomous driving and the area, its inputs/outputs or learning result where supported, what it depends on, plausible alternatives/complements, maturity, and downstream relevance. Relationships are contextual evidence, not approved graph edges or learner blockers. Only assert a required order or computational handoff when the source/design explicitly supports it.
6. Include relevant role-task context for the nine canonical roles only where the source actually supports the task and area relationship. Preserve canonical role ownership, fit and routes. Keep conditional role evidence conditional; do not add/remove/reclassify roles or approve cross-area candidates.

## Closure rules

- A cell is **evidence mapped** only with a specific claim that matches the family and horizon, a resolvable source/query reference, locator, context, maturity reasoning, and explicit limitations.
- A cell is **bounded no-hit** only after a reproducible search across relevant source families and an independent counter-search, with exact queries, dates, inspected results, boundaries and reasons no defensible claim exists. Do not use no-hit for “not searched enough,” source access failure, absence of an official source, or abstract-only access.
- Use **not applicable** only if the cell genuinely does not apply to that area/horizon, backed by a technical explanation and a counter-search. Otherwise continue searching or report the narrowly defined unresolved blocker.
- A task track is terminal only after every sub-question in its stated scope is independently disposed and linked to evidence or a valid bounded no-hit/not-applicable rationale. One source or one mapped cell does not close a track.
- An area is complete only when all 24 cells and six task tracks are terminal, all materially relevant candidate alternatives/prerequisites have been checked, and no known contradiction remains in the bounded scope. State the scope and residual limits; never claim absolute completeness.
- Do not optimize for a source-count target. Use enough high-quality, varied sources to support each bounded claim and its counter-search; explain why the source mix is adequate and where it is weak.

## Files and boundaries

Edit only Agent 2’s current workpack JSON/Markdown, a dated Agent 2 audit note, and a focused Agent 2 validator if needed. Do not edit Agent 1’s files, the canonical D011/D166 index, graph JSON/generator, taxonomy, role fit/routes, contracts, UI, SQL or migrations. Do not overwrite the historical reviewer reconciliation.

## Deliverables

- Updated Agent 2 JSON and Markdown workpack with all cell and task dispositions, plus source/query/counter-search records.
- A dated audit note listing all 24 task outcomes, any terminal no-hit/not-applicable rationale, remaining true blockers, before/after counts by area/cell family/horizon/task state, research additions, and role-context records.
- Run a validator and focused reference/uniqueness/completeness checks. Report exact commands and results. Do not claim browser/rendered validation unless performed.

Do not touch Agent 1’s four areas. The coordinator will reconcile agent workpacks into the canonical index and graph after both assignments finish.
