# D078 sequence dispositions and ordering validation — 2026-10-17

**Status:** validated_local_sequence_reconciliation_not_sql_or_student_promotion. This is local sequencing reconciliation, not SQL application or student-promotion approval.

## Coverage

- Current graph: 2,649 nodes and 4,072 edges; all edge endpoints resolve.
- Area relationship dispositions: 192; all 19 critical references join to these source records.
- Direct area-order declarations: 27; all remain non-hard-order dispositions.
- Approved, route-scoped learner-order edges: 3.
- Additional ordering/choice/complement graph records individually catalogued: 2,154.
- Route structure: 19 roles, 7 canonical areas, 19 domain-role edges, 26 area-role edges; 7 roles have multiple area branches.
- Programme/domain/area/role route transitions are separately catalogued as navigation/membership, not learning prerequisites: {'area_to_role': 26, 'domain_to_area': 7, 'domain_to_role': 19, 'programme_to_domain_context': 1}.

## Sequence decisions

The only currently approved learning-order edges are conditional and apply only on their named route:

- `domain-item:d078-quantitative-approach` → `area_enrichment_item:d078-econ-applied-econometrics` — Economics and Applied Economic Analysis; only where the learner has not already acquired introductory statistics/regression foundations. Condition: Check existing knowledge; do not force repetition or require a particular software package. Evidence: `area_relationship_reference:d078-econ-applied-econometrics:requires:statistical-foundations-and-data-appraisal`; `docs/manual-review/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.md` area_relationship_reference:d078-econ-applied-econometrics:requires:statistical-foundations-and-data-appraisal; `docs/manual-review/D078_SEQUENCE_SOURCE_CHECK_A01_A02_2026_10_12.md` ; [University of Pennsylvania Economics, Econ 224 syllabus](https://economics.sas.upenn.edu/system/files/2018-09/Econ224syllabus.pdf) — Prerequisite section: prior Statistics for Economists or comparable statistics coursework; course-design example, not a universal admissions rule.
- `area_enrichment_item:d078-econ-applied-econometrics` → `area_enrichment_item:d078-econ-causal-ml` — Advanced causal machine-learning route within Economics and Applied Economic Analysis. Condition: Apply only when the learner chooses causal-effect estimation/causal ML; this is not a general prerequisite for predictive machine learning. Evidence: `area_relationship_reference:d078-econ-causal-ml:builds-on:applied-econometrics-and-causal-inference`; `docs/manual-review/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.md` area_relationship_reference:d078-econ-causal-ml:builds-on:applied-econometrics-and-causal-inference; `docs/manual-review/D078_SEQUENCE_SOURCE_CHECK_A01_A02_2026_10_12.md` ; [Stanford GSB Bulletin, MGTECON 634 Machine Learning and Causal Inference](https://bulletin.stanford.edu/courses/2177851) — Course description and prerequisite: prior empirical causal-inference methods; advanced-route example, not a universal ML prerequisite.
- `area_enrichment_item:d078-econ-agent-based-modeling` → `area_enrichment_item:d078-econ-casevo-llm-sim` — CASEVO implementation route within Economics and Applied Economic Analysis. Condition: Apply only to the CASEVO/ABM route; do not treat agent-based modelling as a prerequisite for every LLM simulation. Evidence: `area_relationship_reference:d078-econ-casevo-llm-sim:builds-on:agent-based-economic-modeling`; `docs/manual-review/D078_SEQUENCE_DIRECTION_REVIEW_2026_10_12.md` area_relationship_reference:d078-econ-casevo-llm-sim:builds-on:agent-based-economic-modeling; `docs/manual-review/D078_SEQUENCE_SOURCE_CHECK_A01_A02_2026_10_12.md` ; [Jiang et al., CASEVO paper](https://arxiv.org/abs/2412.19498) — Abstract and Introduction: CASEVO's LLM-agent simulator and its relationship to Mesa/agent-based modelling; [CASEVO project repository](https://github.com/rgCASS/casevo) — Background and ModelBase documentation: Mesa model/agent structure and LLM interface integration.

The 19 critical references were inspected against their direction-review records and the two source-check artifacts. Only the three above have sequence approval. Other declarations are individually retained in the JSON as workflow, conditional safeguard, alternative, complement, advisory, untyped text, or not-approved/no-order records; none is silently promoted to a prerequisite.

## Structural and branch checks

- Missing graph endpoints: **0**.
- Cycle in all `prerequisite_for` graph edges: **none** (531 edges checked).
- Cycle in approved sequence edges: **none**.
- All approved edge endpoints exist and match graph: **yes**.
- Each of the 19 roles has a domain route plus one or more area routes: **yes**.
- No approved learning prerequisite attaches a role to another role or orders sibling areas.
- Multi-area roles remain separate area branches; role-area relationships are routing/fit links, not sequential learning constraints.

## Planner behavior and repair

- Only source-backed, explicitly sequence-approved builds_on links become hard prerequisites in the contextual-item adapter.
- Approved conditional prerequisites order only when the route scope matches and both items are selected; they do not block adding the dependent item.
- Unapproved/plain-text prerequisite notes do not enter the typed prerequisiteIds emitted by the adapter.
- Alternatives remain explicit choices; complements and works_with do not impose order.
- Reordering now validates every selected dependent after the proposed move, so neither moving the dependent before its prerequisite nor moving its prerequisite behind the dependent can violate the edge.
- The seven areas are parallel route branches; domain/area/role navigation edges are not prerequisite edges.

## Reproduce

```powershell
& 'C:\Python314\python.exe' data/career-mapping/_audit/reconcile_d078_sequence_dispositions_2026_10_17.py
node.exe .\node_modules\jest\bin\jest.js --runInBand src/lib/guidedLearningPlan.test.ts src/lib/guidedLearningPlanAdapter.test.ts
```

The generator exits nonzero if coverage, graph integrity, role-route coverage, or sequence-edge consistency fails. It writes only this JSON and this Markdown report.

## Boundaries

No requirement-lane decisions were edited. No UI/explanation files, shared graph artifact, seed, SQL, migration, tool/role inventory, or legacy subgroup data were changed. Sequence approval and student visibility remain separate.
