# D078 sequence and relationship-direction review — 12 October 2026

## Scope and status

This is the local pedagogical review of the 19 area-relationship references
whose wording could affect learning order. It is not a role-fit audit, a new
area-of-specialization reconciliation, or a student-facing approval. The
192 relationship dispositions are already complete; this document reviews
whether their wording implies an actual learning dependency, an activity
condition, a safeguard, or merely explanatory context.

The graph remains hidden. Nothing here authorizes canonical promotion or
student visibility. Independent source checks for Sociology/Economics and
Politics/Psychology are complete and reconciled against this local direction
review. The full route sequence has been designed and approved; the three
source-supported, route-specific learning orders are approved sequence rules
but remain hidden until the independent content and runtime release gates pass.

## Decision rule

- A learning prerequisite means a learner needs the prior concept or capability
  to understand or safely perform the later learning task. It should point
  **from prerequisite to the item that builds on it**, be scoped to the route,
  and be supported by evidence.
- A workflow-order relation describes the order of work (for example, draft,
  pretest, revise, then field). It is not automatically a curriculum
  prerequisite.
- A safeguard or task gate applies when a particular activity, data type,
  jurisdiction, or population is involved. It must not be presented as a
  universal prerequisite for learning the topic.
- A task condition, limitation, or explanation belongs with the item’s use
  case. It does not create a dependency edge unless a separate learning item
  is identified and the dependency is evidenced.
- `requires` and `builds_on` point from the dependent item to what it requires;
  the learner sequence, if approved, normally runs in the opposite direction.
  `precedes` already describes forward workflow order.
- Alternatives stay alternatives; complements do not become cumulative
  requirements. A valid route must not imply that learners need every method,
  platform, or design.

## Local disposition of the 19 critical references

| # | Relationship reference | Local interpretation | Sequence consequence |
|---:|---|---|---|
| 1 | `area_relationship_reference:d078-soc-ethics-reflexivity:requires:fieldwork-or-human-participant-data-collection` | Activity/applicability condition. Ethics learning is relevant before a learner undertakes fieldwork or human-participant collection, but fieldwork is not a prerequisite for learning research ethics. | Do not sequence fieldwork before ethics. Show the safeguard when the learner chooses participant research; do not make a universal edge to a nonexistent “fieldwork” item. |
| 2 | `area_relationship_reference:d078-soc-llm-assisted-coding:requires:ai-data-governance-and-validation` | Safeguard and quality-control condition for using AI on qualitative material. Governance, privacy, source-level checking, and validation are distinct from the coding tool itself. | Keep as a contextual safety/validation note. Link only to separately verified domain items; do not represent it as one prerequisite item or as proof that AI coding is valid. |
| 3 | `area_relationship_reference:d078-soc-secondary-qual-analysis:requires:data-provenance-and-context-review` | Substantive interpretive foundation for secondary qualitative analysis: learners need to understand who created the material, for what purpose, under what conditions, and what context is missing. | Candidate prerequisite relationship to evidence appraisal/data stewardship only if the source check confirms a precise existing learning item. Otherwise keep as an explicit task condition on the secondary-analysis item. |
| 4 | `area_relationship_reference:d078-soc-ai-survey-question-drafting:requires:cognitive-pretesting-with-intended-respondents` | The declared direction is reversed for workflow. AI-assisted drafting produces a draft; cognitive pretesting checks how intended respondents understand it; findings inform revision before fielding. | Do not make pretesting a prerequisite to drafting. Record the workflow as draft → pretest → revise → field. Cognitive pretesting is a later validation activity, not evidence that an AI-generated question is sound. |
| 5 | `area_relationship_reference:d078-soc-digital-trace-ethics:requires:digital-trace-collection-or-reuse` | Activity/applicability condition and ethical safeguard. It applies when digital trace data will be collected or reused; the ethical review must precede that activity. | Keep as a conditional safeguard attached to the data-use route. The ethics learning may precede collection/reuse, but the data activity is not a learning prerequisite for ethics. |
| 6 | `area_relationship_reference:d078-econ-measurement:requires:economic-indicator-interpretation` | The target describes the work performed by the measurement item and risks a self-dependency. | No sequence edge. Explain indicator construction, interpretation, and caveats inside the measurement item. |
| 7 | `area_relationship_reference:d078-econ-applied-econometrics:requires:statistical-foundations-and-data-appraisal` | Genuine foundation, but the wording bundles two learnable capabilities. Quantitative reasoning/statistical foundations and evidence/data appraisal should be visible before advanced applied econometrics when the learner lacks them. | Candidate route-scoped prerequisite edges from the relevant domain foundations to applied econometrics; retain alternatives and do not require a particular software package. Verify exact item matches and scope before graph integration. |
| 8 | `area_relationship_reference:d078-econ-causal-evaluation:requires:counterfactual-and-identification-reasoning` | Conceptual foundation for causal evaluation: what comparison estimates the counterfactual and under what identification assumptions. This is distinct from merely reporting a before/after change. | Candidate prerequisite from applied econometrics/causal-inference foundation to causal evaluation, route-scoped. Verify the matching item and avoid implying every evaluation must make causal claims. |
| 9 | `area_relationship_reference:d078-econ-causal-ml:builds-on:applied-econometrics-and-causal-inference` | Advanced learning dependency is plausible: causal ML builds on causal inference and applied econometric reasoning. It is not a universal prerequisite for all economics roles. | Candidate sequence: applied econometrics/causal inference → causal ML, only in the selected computational/causal route and after source confirmation. |
| 10 | `area_relationship_reference:d078-econ-casevo-llm-sim:builds-on:agent-based-economic-modeling` | Source-specific learning dependency for the CASEVO implementation: its paper describes an LLM-agent simulator built on Mesa/agent-based modelling. That does not establish a universal gate for every LLM simulation or every introductory use. | Candidate order within the CASEVO implementation route: ABM/Mesa model concepts → CASEVO implementation. Keep route-specific; do not force an economics ABM course on every learner exploring LLM simulations. |
| 11 | `area_relationship_reference:d078-a03-method-ai-assisted-evidence-synthesis:requires:written-inclusion-exclusion-protocol` | Conditional task gate for systematic evidence screening/synthesis: scope and eligibility rules must be stated before automated or human screening so decisions can be checked. It is not a general learner prerequisite and does not apply to every informal literature scan or policy analysis. | Within a selected systematic-review workflow: define the question/scope and eligibility protocol → screen/synthesize. Keep the condition tied to systematic review work, not generic policy reading. |
| 12 | `area_relationship_reference:d078-a03-competency-review-auditability:requires:access-to-original-records-full-texts` | Evidence-access condition, not a learnable prerequisite. A model-generated summary cannot substitute for inspecting the original source when auditing inclusion, extraction, or claims. | No curriculum dependency edge. Show as a limitation/quality gate on review auditability and source verification. |
| 13 | `area_relationship_reference:d078-a03-skill-validate-text-measures:requires:a-defined-construct-and-reference-sample` | Design condition. A construct must be operationally defined; a reference sample is needed only for the chosen validation design and claim. | Do not require a universal reference-sample node. Add conditional guidance: define the construct first; select a defensible benchmark/reference set when the evaluation question requires one. |
| 14 | `area_relationship_reference:d078-a03-method-evaluate-ai-public-intervention:requires:baseline-and-defined-comparison` | Evaluation-design condition for claims of change/effect. A baseline and credible comparison are not required for every descriptive or formative review. | Keep as a route-scoped design condition. For impact claims, evaluation question/design and baseline/comparator precede interpretation; do not imply this is required for process learning. |
| 15 | `area_relationship_reference:d078-a03-method-task-specific-ai-survey-workflow:requires:survey-protocol-and-task-specific-evaluation-plan` | Task-specific design and evaluation condition: define the survey task, protocol, acceptable output, and checks before judging AI assistance. Not a universal prerequisite to learning about AI and surveys. | Keep as a conditional workflow guardrail; link to survey design only after confirming an exact existing item and avoid adding a hard edge for every survey use. |
| 16 | `area_relationship_reference:d078-a04-method-digital-trace-inquiry:requires:contextual-ethical-and-legal-assessment` | Genuine safety gate before collecting or reusing digital traces, but scoped to jurisdiction, platform, data type, expectations, and intended use. | Candidate order: responsible-research / digital-data ethics → digital-trace collection or reuse. Present as conditional to the actual project, not universal legal advice. |
| 17 | `area_relationship_reference:d078-a04-method-human-in-loop-llm-qualitative-analysis:requires:human-source-level-verification-and-privacy-review` | Two distinct controls were correctly resolved to two domain items: evidence/claim checking and responsible handling of AI/digital data. Privacy review applies before processing; human source-level verification continues during and after model-assisted analysis. | Keep both controls distinct. Candidate order places privacy/governance before data processing; evidence appraisal before interpreting outputs. Do not collapse into one edge or imply human review makes all outputs valid. |
| 18 | `area_relationship_reference:d078-a04-method-contextual-measure-adaptation:requires:construct-definition-and-source-instrument-permission-provenance` | Bundled design condition: define what is being measured; establish the instrument’s provenance and permissions before adapting it. Permission/provenance are not the same as a generic learning prerequisite. | Candidate order: construct definition and instrument/source review → adaptation. Keep permission and provenance as task gates; do not use adaptation when it is not defensible. |
| 19 | `area_relationship_reference:d078-a04-skill-cognitive-pretesting-and-equivalence:precedes:large-scale-fielding-and-group-score-comparison` | The target bundles two distinct later actions. Cognitive pretesting can precede revision and full fielding; it does not by itself establish measurement equivalence for group-score comparisons. | Preserve workflow: draft/adapt → cognitive pretest → revise → field. Require separate measurement-equivalence evidence before comparing group scores; do not create a single “pretesting proves equivalence” edge. |

## Evidence anchors reviewed locally

- CDC/NCHS explains that question evaluation finds respondent interpretation
  and response problems so questions can be revised before use; its cognitive
  interviewing guidance and CDC-hosted study support pretesting before survey
  fielding: <https://www.cdc.gov/nchs/ccqder/question-evaluation/index.html>,
  <https://www.cdc.gov/nchs/ccqder/question-evaluation/cognitive-interviewing.html>,
  <https://stacks.cdc.gov/view/cdc/200098> (accessed 12 October 2026).
- AAPOR’s Best Practices recommend pretesting with respondents similar to the
  intended survey population, supporting the task-specific nature of the
  survey pretest: <https://aapor.org/standards-and-ethics/best-practices/>
  (accessed 12 October 2026).
- Cochrane Handbook chapter 3 says eligibility criteria and synthesis groups
  should be specified at protocol stage and documented, supporting a written
  protocol before systematic screening/synthesis—not before informal reading:
  <https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-03>
  (accessed 12 October 2026).
- UK Data Service describes secondary qualitative analysis as reuse of
  previously created data for new purposes; context and the original study’s
  purpose therefore constrain interpretation:
  <https://ukdataservice.ac.uk/learning-hub/qualitative-data/>,
  <https://ukdataservice.ac.uk/learning-hub/qualitative-data/reusing-qualitative-data/approaches-to-reusing-qualitative-data/>
  (accessed 12 October 2026).
- The Casevo paper describes an LLM-based multi-agent social simulation
  framework and its relationship to traditional agent-based modelling. This
  supports a conceptual relationship, not a claim that ABM mastery is a
  required gate for all Casevo use:
  <https://arxiv.org/abs/2412.19498> (accessed 12 October 2026).

These anchors do not replace record-level evidence checks. The two completed
parallel reviews verified each reference’s specific claim and recorded
primary sources for causal inference, model evaluation, ethics, privacy,
instrument adaptation, and digital-trace work. Their exact locators and scope
limits are in the source-check artifacts below.

## Reconciled source checks

- Sociology and Economics, 10 records:
  [D078 sequence source check A01–A02](D078_SEQUENCE_SOURCE_CHECK_A01_A02_2026_10_12.md).
- Politics and Psychology, 9 records:
  [D078 sequence source check A03–A04](D078_SEQUENCE_SOURCE_CHECK_A03_A04_2026_10_12.md).

The checks support scoped workflow gates and several advanced-route learning
orders; they do not support making every relationship a universal learner
prerequisite. In particular, CASEVO/ABM is source-specific, statistical
foundations precede advanced applied econometrics, causal-inference methods
precede causal ML in the advanced route, and cognitive pretesting does not
establish group-score equivalence.

## Route sequence now represented in the hidden graph

This section supersedes the preliminary sequence consequences in table rows
7–10 where those rows say “candidate” or “pending exact item match.” The
graph-backed dispositions below are the current local decisions.

- The fixed Sociology curriculum is represented by one programme context node
  and 14 audited theme nodes. The themes group 34 CCMAS courses; they are
  student-facing groupings, not official CCMAS theme labels, selectable extras,
  or claims that every domain item is taught in the programme.
- A hidden direct Sociology → D078 route transition is backed by the
  programme-domain evidence record: strong course-anchor quality, 19 course
  anchors and 48 transferable-evidence rows. This supports contextual
  continuity, not a claim that the curriculum teaches all D078 areas.
- Three hidden, route-scoped learning-order edges are encoded: quantitative
  foundations → applied econometrics when needed; applied econometrics →
  causal ML on the advanced causal route; and agent-based economic modelling
  → CASEVO on that implementation route.
- D078 shared foundation precedes learner choice of one or more of the seven
  current areas as a guided-path layer; optional role detail is attached only
  when a role is selected. This layer progression does not assert that every
  domain item is a prerequisite for every area or role.
- Workflow order, conditional safeguards, source-access requirements,
  alternatives and complements stay separate from learner prerequisites.

Primary sources independently rechecked for the explicit learning orders:
[Penn Econ 224 syllabus](https://economics.sas.upenn.edu/sites/default/files/penncourse/Syllabus_3.pdf)
supports the statistics/econometrics course order;
[Stanford MGTECON 634](https://bulletin.stanford.edu/courses/2177851)
explicitly expects prior empirical causal-inference methods for its advanced
causal-ML course; [CASEVO repository documentation](https://github.com/rgCASS/casevo)
states CASEVO is built on Mesa and describes its model/agent structure. These
are scoped course/implementation examples, not universal admissions rules.

## Required next integration

1. Review the complete route sequence against the controlling spec/plan and
   all 53 domain, 144 area, and integrated role-route items. Identify any
   missing source-backed ordering instead of assuming the three explicit
   edges are the whole path.
2. Keep alternatives, complements, and optional approaches separate from
   prerequisites. Do not turn a recommended foundation into an unconditional
   learner requirement.
3. Rebuild and test the graph with the approved sequence rules represented as
   `sequence_approved=true`, while keeping `student_visible=false` until the
   separate content and rendered-guided-experience release gates pass. Do not
   reopen the sequence review unless new evidence, changed scope, or a
   regression requires it.

No role-fit adjudication was reopened. No subject-matcher work or Supabase SQL
was performed.
