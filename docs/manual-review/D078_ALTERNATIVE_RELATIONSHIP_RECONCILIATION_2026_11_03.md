# D078 Alternative Relationship Reconciliation

**Date:** 2026-11-04 (updated)  
**Scope:** Domain methods and tools, area learning items, and role-task tool alternatives in the current D078 graph. This follows the role prerequisite audit and precedes the remaining rendered progression acceptance and end-to-end packs.

## 2026-11-04 update (supersedes older counts and tool-group inventory below)

The role-prerequisite stage was completed first: all 19 current roles and 173 role items were reviewed, all 405 preparation notes were retained as context, and no source-backed role-learning prerequisite edge was supported. Alternatives are the next stage; UI progression remains after this reconciliation.

The regenerated graph now contains **164 typed alternative relationships**: **164 approved/selectable** and **0 unresolved or unapproved typed edges**. Two candidates were correctly excluded as false, broad comparisons and are retained in the graph's audit disposition, not as learner edges. The graph still contains 419 prose alternative/boundary notes, which cannot create selectable items by themselves.

The existing area groups remain: the Computational and Digital Social Science R/Python workflow, Psychology R/Python/SPSS/Stata and NVivo/Taguette groups. This update adds area-scoped NVivo/Taguette comparisons for Sociology and Social Research and Evaluation, using the canonical domain tool nodes rather than duplicate tool records. The Sociology group’s two separate tool notes and the Social Research and Evaluation group’s one combined note are explicitly covered by these typed edges. Each comparison is optional, non-exclusive, and filtered to its selected area; it does not appear on the domain page or an unrelated area.

## Decision

An item’s alternative wording is explanatory text, not automatically a selectable item. A learner may compare or select another option only when the graph names two distinct canonical nodes, the relationship is reviewed for the relevant route, and the relationship has a bounded explanation and evidence. An alternative does not mean “mutually exclusive”: the graph sets `alternative_is_exclusive=false`, `blocking_policy=never`, and `sequence_policy=none`. Learners may choose more than one method when an exact combined design supports that choice.

## Current inventory and disposition

- The rebuilt graph contains **164 typed alternative relationships**: **164 approved/selectable** and **0 unresolved/unapproved typed edges**.
- All three former unapproved records have final dispositions. The emerging synthetic-respondent-to-scenario-analysis comparison is approved with an exact canonical target, a bounded student explanation, evidence attached to both endpoints, and a non-blocking/non-exclusive choice. The computational-versus-non-computational placeholder is excluded from selectable alternatives because its proposed target bundles several distinct, overlapping methods rather than one canonical node. The agent-based-model-versus-empirical-methods placeholder is also excluded: it falsely frames a simulation and several empirical approaches as either/or, although empirical evidence may inform and evaluate agent-based models. Both excluded candidates remain documented in `non_pairwise_candidate_dispositions`; their original explanatory cautions remain on their source records.
- The graph contains **419 prose alternative/boundary notes** across area and role items. None exactly names a canonical graph-node label. All 419 are preserved and dispositioned as prose-only; none can hide or add a learning card by itself.
- A further **42 structured alternative relationship notes** were reviewed. The R/Python area workflow is a typed, optional, non-blocking graph edge; three inherited source-record mismatches remain unapproved and have no selection effect.
- Two source-contract notes name selectable tool groups. The Psychology area now has six pairwise comparison edges among R, Python, SPSS and Stata, and one NVivo–Taguette comparison edge. Both tools can be selected independently; the comparison explains their different workflows so a learner can choose by project needs. These are optional tools, not prerequisites. The group notes are marked as covered by those typed edges, but the prose itself cannot trigger a selection.
- The former placeholder edges for quantitative/qualitative methods, survey, document analysis, and observation now point to actual canonical method nodes. This yields 10 reviewed, route-relevant comparison edges. Their text explicitly says they are comparison choices, not exclusive branches; supported mixed-method routes remain available.
- Existing role-task tool comparisons remain attached to their role-task context. They are not promoted into role learning prerequisites.

The older projection count of 140 typed alternatives and 408 prose notes is stale. The current reconciled counts above come from the regenerated v10 graph and its compact UI projection.

## Selection guard

`isD078SelectableAlternativeEdge` now rejects an edge unless it is `resolved_ready_for_use`, has the expected evidence basis and source role, resolves both endpoints, is explicitly approved/selectable when those fields are present, and is not marked unavailable in the active route. The projection contains 164 alternative edges, and each passes that same guard. Area-scoped edges must also match the learner's selected area. A resolved label alone is insufficient.

The 419 notes are still available as item explanations and boundaries. Promoting any of them later requires a canonical target, a reviewed relationship statement, route scope, and evidence; fuzzy label matching or a “valid alternatives” string cannot create a node or edge.

## Evidence used for method-choice correction

- [NIH Office of Behavioral and Social Sciences Research, Best Practices for Mixed Methods Research](https://obssr.od.nih.gov/sites/g/files/mnhszr296/files/Best_Practices_for_Mixed_Methods_Research.pdf) — describes choosing evidence in relation to the question and intentionally integrating quantitative and qualitative evidence in mixed-methods studies.
- [UK Data Service, Qualitative mixed methods](https://ukdataservice.ac.uk/help/data-types/qualitative-mixed-methods/) — defines mixed methods as combining qualitative and quantitative data in one project; this supports treating the approaches as comparable but not mutually exclusive.
- The method-specific official and teaching resources already attached to the exact survey, interview, observation, document-analysis and secondary-data nodes provide their item-level context. The graph carries their caveat that a combination must be justified by the question/design.

## Final disposition of the three former unapproved records

- **Synthetic respondents versus scenario analysis — approved.** These are distinct optional approaches: scenario analysis compares plausible future conditions, while synthetic respondents generate model-produced responses or agents. The [PNAS study of synthetic respondents](https://www.pnas.org/doi/10.1073/pnas.2518075122) supports the synthetic-method endpoint and its evidence limits; the existing [UK Government Futures Toolkit](https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts) supports the scenario-analysis endpoint. The graph comparison tells learners what differs and does not claim the approaches are interchangeable or exclusive.
- **Computational social research versus a “non-computational” umbrella — excluded from selectable alternatives.** The target is not a single graph item and collapses qualitative, survey and secondary-data routes into one false opposite. Computational techniques can also be used with those data/methods. The source note remains explanatory; no concept placeholder is selectable.
- **Agent-based modelling versus empirical approaches — excluded from selectable alternatives.** The target combines observation, surveys, interviews and statistical methods. [Bruch, “Agent-Based Models in Empirical Social Research”](https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/) describes empirical data being used to ground, assess and improve agent-based models. Therefore the graph retains the student-facing caution that simulation does not replace empirical evidence, but does not present these as mutually exclusive alternative cards.

## Verification required before progression closes

The local graph generator passed; the focused graph contract suite passed 20 tests. The final 164/164/0 edge and 419-note audit passed. The alternative-specific projection, relationship-panel and journey tests passed (2, 8 and 2 tests respectively). This reconciliation does not claim rendered browser acceptance or complete every selection combination.
