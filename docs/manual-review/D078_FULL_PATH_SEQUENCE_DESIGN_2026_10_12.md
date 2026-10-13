# D078 full-path sequence design — 12 October 2026

**Purpose:** define the student learning route and separate true learning order
from navigation, workflow, safeguards, conditions, alternatives and complements.

**State:** sequence design approved; content and student-visibility release
gates remain independent. Student visibility is decided per item,
relationship and route—not by hiding or promoting the graph as one indivisible
package. This document alone is not a canonical promotion. Do not reopen the
completed role-fit decisions or the separate subject-matcher lane.

## The learner's route

The experience has a clear route through its layers, but it is not one
universal, linear syllabus:

1. **Sociology programme context:** the 14 themes group the fixed programme
   curriculum. They explain what the university teaches; they are not extra
   selections and their presentation order does not claim a prerequisite order
   among themes.
2. **Programme-to-D078 bridge:** explain why this programme connects to the
   Social Sciences domain, what transfers, and what remains additional. This
   is an orientation transition, not a learning prerequisite or a claim that
   Sociology teaches every D078 area.
3. **D078 overview and learning choices:** explain the domain, then show only
   individually approved learning items. Separate the genuinely shared
   foundation from useful, conditional and specialist options. The current
   graph contains 53 domain records; inventory membership alone does not make
   an item a required course or a student-visible item.
4. **One or more selected Areas of Specialization/practice:** each chosen area
   opens its own branch, inherits only relevant domain items once, and adds
   its own supported task set. The seven areas are sibling choices, not seven
   sequential lessons. Multi-area selections remain parallel, separately
   labelled stacks.
5. **Optional role branch:** only after an area route is inspected may the
   learner add one or more roles. Role additions appear only for selected
   roles; the role route remains distinct from qualification or job-readiness
   claims. The existing 173-item role handoff is consumed as-is, not
   re-adjudicated here.
6. **Focused plan:** selections from each layer are deduplicated by item
   identity while retaining every route that supports the item. The learner
   can compare alternatives, deliberately add complements, remove optional
   focus items, and arrange selected items subject to verified dependencies.
   A missing prerequisite is explained and can be inspected; it is never
   silently added.

In compact form:

```text
fixed Sociology curriculum and themes
  → explanatory Sociology–D078 connection
  → D078 overview and approved shared/optional learning choices
  → selected area branch(es), with inherited items deduplicated
  → optional selected role branch(es)
  → separate, editable route stacks → save/reopen/report
```

The arrows above describe navigation and inheritance. They do **not** assert
that every item in one layer is a prerequisite for every item in the next.

## Strict learning order versus other relationship types

Only an evidenced, resolved, route-scoped learning dependency can constrain
the learner's item order. The source checks cover 19 sequencing-critical
relationship references. They support three conditional learning orders:

| Prerequisite → later item | When it applies | Learner-facing effect |
|---|---|---|
| Quantitative/statistical foundations → applied econometrics | Economics route, only if the learner has not already acquired introductory statistics/regression foundations | Offer the foundation first and check prior learning; do not require a named software package. Evidence appraisal remains explained within the econometrics work; it is not silently dropped or asserted as a separate hard gate. |
| Applied econometrics/causal-inference reasoning → causal machine learning | Only the advanced causal-estimation route | Keep separate from predictive machine learning and from general economics routes. |
| Agent-based economic modelling → CASEVO implementation | Only when the learner selects the CASEVO implementation route | Explain CASEVO's model/agent relationship; do not require ABM for every simulation or LLM route. |

These are the three locally accepted and approved sequencing decisions,
represented as route-scoped dependency edges. They remain **not student-visible**
until the separate content and runtime release gates pass. Do not reopen their
sequence review absent new evidence, changed scope, or regression. Promote an
item or relationship when its own evidence, content, route scope, learner
explanation and display behavior are adequate; do not hold otherwise-ready
content back merely because another item or the whole graph still has open
work. Their source-check evidence is in
`D078_SEQUENCE_SOURCE_CHECK_A01_A02_2026_10_12.md`.

The remaining relationship declarations must not be misrepresented as
universal learning prerequisites:

| Relationship family | Correct treatment |
|---|---|
| Ethics, privacy, permissions, data access, source provenance, construct definition, baselines, inclusion criteria and evaluation plans | Conditional project safeguards or design gates. Show them when the learner chooses the relevant task/data/claim; do not block learning the topic itself. |
| Draft → cognitive pretest → revise → field; protocol → systematic screening; design → analysis choice; data preparation → model fitting | Task/workflow order. Present within the use case, not as a rule that the learner must complete a separate course first. |
| Alternatives | Compare and choose; never stack as cumulative requirements. |
| Complements | Explain how they work together; add only by learner choice. |
| Broad area/task links, inherited capabilities, role prerequisites written as free text, and unresolved relationship targets | Context or review records until exact item identity, owner, route and evidence establish a typed link. They do not enter the hard-order graph. |

In particular, the 402 role-item prerequisite-note edges, 64 domain-contract
candidate edges, 24 emerging-item candidate edges, and 21 area task-entry
condition edges are not approved learning-order edges. They preserve useful
context but lack the complete relationship-level approval needed to block or
reorder a learner's selections. The three exact source-checked dependencies
above are the only hard-order edges in this design. Other graph relationships
remain available for their own display/relationship review; this decision does
not discard their source records or turn them into unsupported claims.

## Disposition of the 27 direct area-order declarations

These are distinct from the 19 unresolved-target relationship references
already dispositioned in the sequence-direction review. The decisions below
prevent raw `requires`/`builds_on` labels from becoming hard sequencing rules.

| Declared source → target | Local disposition |
|---|---|
| Social theory and concepts → question framing/research design | Helpful conceptual context; not a hard prerequisite. Explain theory and question design together or in learner-appropriate order. |
| Survey design → survey-data analysis | A project workflow dependency when analysing a survey: inspect its design and sampling before interpreting results. Not a universal course prerequisite; existing datasets can be analysed without the learner designing the survey. |
| Survey-data analysis → labour-market measurement | No dependency established. Shared data skills do not make one area item a prerequisite for the other. |
| Computational social-research methods → policy text-as-data | Area/context relation; the latter is one selected specialist application, not required for learning the broader computational approach. |
| Programme monitoring/evaluation task → AI-intervention impact evaluation | Scope/context relation. The AI evaluation is a specialized example, not a prerequisite or a universal task. |
| Computational social-research methods → digital-trace inquiry | Contextual route relation; digital-trace inquiry can use non-computational methods. No hard dependency. |
| Research-data stewardship → digital-data provenance assessment | Related capabilities that can be taught together; no separately evidenced hard dependency. Apply the safeguard during the actual data task. |
| Qualitative group inquiry → human-in-the-loop LLM analysis | Qualitative concepts help contextualize the optional AI workflow; no hard prerequisite. AI assistance is not required for qualitative inquiry. |
| Human-in-the-loop LLM analysis → audit AI suggestions | Ongoing quality-control practice within the workflow, not a separate prerequisite course. Keep source-level checking visible as a safeguard. |
| Cognitive pretesting → large-scale fielding/group comparison | Split the workflow: pretest → revise → field; separately require measurement-equivalence evidence before group-score comparison. Pretesting alone does not prove equivalence. |
| Spatial concepts/place/scale → spatial-data provenance | Related foundations; teach together or in a suitable introductory order, without a hard block. |
| Spatial provenance/geographic units/scale → spatial analysis | Project gate: inspect source, geographic unit and scale before interpreting the selected spatial analysis. It is not a universal prerequisite to learn spatial-analysis concepts. |
| Spatial analysis → explain spatial patterns | Project workflow: interpretation/communication follows a completed analysis, but communication can be learned alongside analysis. No hard course prerequisite. |
| Population measures → census/survey/administrative data appraisal | No hard dependency in this direction. Appraise the source before making measures from it; teach appraisal and measurement as paired steps. |
| Population measures → migration/urbanisation interpretation | Measures inform interpretation; explain the measures in the interpretation task. No separate hard prerequisite. |
| Population measures → demographic estimation/projection | Conditional conceptual preparation for a projection task; keep measures, assumptions and uncertainty together. Do not block introductory projection learning without stronger evidence. |
| Study-question design → sampling/measurement/representativeness | Research-design workflow: question informs population, sampling and measurement choices. Teach as an integrated design activity, not a universal prior course. |
| Sampling/measurement → research ethics/data stewardship | Direction is unsafe as a general rule. Ethical and data-stewardship checks begin during design and before relevant collection/use; do not defer them until after sampling. |
| Programme theory/logic → evaluation design/evidence | Useful evaluation workflow: clarify the expected change before choosing evaluation questions where a theory/logic model is used. Not required for every descriptive or formative evaluation. |
| Evaluation design/evidence → quantitative analysis choice | Conditional workflow: choose analysis to match the design and evidence; quantitative analysis is not always appropriate or required. |
| Computational question formulation → provenance/permissions/digital risk | Project planning order: identify question and intended evidence, then assess the proposed data's provenance, permissions and risks before access/use. Safeguard, not a learner prerequisite. |
| Provenance/ethics → reproducible cleaning | Data stewardship applies throughout. Explain provenance before and during cleaning; no separate course gate is established. |
| Reproducible cleaning → interpretable statistical modelling | Data workflow order for a selected dataset; cleaning and modelling can be taught together. Not a universal prerequisite for learning model interpretation. |
| Digital-trace construct/scope/sampling → text classification | Conditional project gate: define the construct, platform/data scope and sampling before making text-classification claims. Do not force predictive/classification work on non-computational routes. |
| Digital-trace construct/scope/sampling → network analysis | Conditional project gate: define what counts as a node/tie and the scope of the source before analysing a network. No requirement when relationship data are not the evidence. |
| Digital-trace construct/scope/sampling → predictive text modelling | Conditional project gate: define the construct and sampling, then validate predictions against suitable evidence. Keep explanation/lived-experience methods as alternatives where they better answer the question. |

The 27 dispositions are **not** an endorsement to show each relationship as a
student-facing chip. Their evidence and learner explanation still pass the
item/relationship display gates separately. Workflow notes appear inside the
relevant item/use case; they do not become order constraints in the selection
engine.

## Runtime contract

- Keep the fixed curriculum and all route transitions distinct from learning
  dependencies.
- Use only explicit, source-backed, resolved, in-route dependency edges to
  topologically order selected items. The existing adapter's hard-edge guard
  must continue to reject plain-text prerequisite arrays and review-only links.
- Keep selected area and role branches separate; inherit and deduplicate only
  exact item identities while retaining all route provenance.
- Preserve the learner's requested order when it does not violate an approved
  dependency. If it does, explain the exact relation and offer the earlier
  item for deliberate inclusion; never silently add it.
- Do not claim that a complete audit graph or acyclic raw graph proves a
  correct learning path. The sequence test must inspect edge semantics, exact
  endpoint resolution, scope/condition, source check and branch ownership.
- Decide visibility per item, relationship and route. Show an item once its
  own content, evidence, learning link, ownership/scope and rendered-display
  requirements pass; keep only the specific item or relationship that fails a
  gate hidden, with a reason. Do not make whole-graph completion a prerequisite
  for promoting independently ready content. Internal sequence approval is
  distinct from student-facing approval, and neither should become an
  indefinite blanket hold.

## Current implementation/release decision

The route-layer inventory exists (53 domain items, 7 areas with 144 area
items, and the existing 173-item role handoff), and the UI implements route
stacks, selection, relationship/comparison surfaces, persistence, reports and
the reviewed-prerequisite guard. This document closes the local semantic
disposition pass: it identifies only three source-checked, route-scoped
relationships as candidates to constrain learning order and explicitly keeps
the other relationships from imposing a false linear curriculum.

**Implementation status update — 2026-10-12:** the sequence dispositions are
now embedded in the rebuilt audit graph under
`area_reconciliation.relationship_graph.full_path_sequence_design`. The graph
builder and static audit agree on all 27 direct area-order dispositions, 19
source-checked critical references and three route-scoped dependency
rules. The three route-scoped dependency edges are `sequence_approved=true`
and `student_visible=false`: sequence approval is complete, while content
promotion and student visibility remain independent gates. This status does
not approve every relationship reference or every D078 item for display.
Assess and promote each otherwise-ready item/relationship independently;
retain only its unresolved content or edge as hidden while its specific
evidence, learning-link, route or display gate is pending.

The remaining work includes the authenticated rendered undergraduate Sociology
journey and its route/selection/report behavior. That verification informs
promotion of the affected runtime surfaces; it does not require unrelated,
already-qualified content to remain hidden. Per the user's latest order,
account activation, route walkthrough and PDF generation occur only after the
implementation is complete. No role-fit adjudication, subject-matcher work or
SQL is part of this sequence-design update.
