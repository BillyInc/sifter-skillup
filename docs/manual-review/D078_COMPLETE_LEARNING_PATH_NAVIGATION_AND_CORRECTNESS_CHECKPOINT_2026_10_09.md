# D078 complete learning-path navigation and correctness checkpoint — 2026-10-09

**Domain:** D078 — Social Sciences & Behavioural Research  
**Route:** Sociology programme → D078 domain → area of specialization/practice → role  
**Status:** local design checkpoint and learning-path correctness contract; review-only  
**Student approval:** 0  
**Canonical/UI/code changes:** none

## Decision

This artifact is both:

1. a navigation design for the complete learner journey; and
2. a correctness contract that must verify that the learning path is evidenced,
   correctly layered, non-misleading and honest about uncertainty.

The path must not be implemented as a stack of plausible lists. A learner may
navigate from programme to domain, area and role, but an item enters the learner
path only when its exact checkpoint, purpose, relationship, limitation, source
and learning destination are justified. Inventory presence, role frequency,
technical compatibility, selection, or a URL alone never promotes an item.

The student-facing hierarchy is:

```text
fixed programme curriculum
  → programme-to-domain explanation
  → D078 overview
  → shared foundation / useful edge
  → area of specialization/practice
  → role or domain→role stop
  → route-specific focused learning plan
```

`subgroup`, `area of specialization` and `area of practice` are one layer.
Retired ISCO subgroup labels are provenance, not additional student-facing
levels.

## Scope and non-edit boundary

This pass designs and audits the learning path only. It does not edit live UI,
client wiring, API code, SQL, seeds, canonical taxonomy, subject matching,
role-fit decisions or programme curriculum data. It is independent of the
current tray wiring. The existing local pure stacking model may be used as an
implementation reference, but this document does not connect it to runtime.

## Controlling inputs

The design is reconciled against these exact files:

- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`
- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`
- `docs/manual-review/D078_GUIDED_CONTROL_DOCUMENT_AUDIT_2026_10_08.md`
- `docs/manual-review/D078_GUIDED_EXPERIENCE_FLOW_AND_STATE_PLAN_2026_10_09.md`
- `docs/manual-review/D078_GUIDED_EXPERIENCE_GRANULAR_UX_AUDIT_AND_MOCKUP_2026_10_09.md`
- `docs/manual-review/D078_DOMAIN_OVERVIEW_AND_LEARNING_PATH_REVIEW_2026_10_08.md`
- `docs/manual-review/D078_SKILLS_METHODS_DEEP_SEARCH_CHECKPOINT_2026_10_08.md`
- `docs/manual-review/D078_LEARNING_PATH_RECONCILIATION_2026_10_08.md`
- `docs/manual-review/D078_FINAL_ENRICHMENT_LANE_MERGE_2026_10_09.md`
- `docs/manual-review/D078_FULL_DOMAIN_ITEM_INVENTORY_REVIEW_2026_10_08.md`
- `docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md`
- `docs/manual-review/D078_AREA_ROLE_TASK_SET_RESEARCH_2026_10_09.md`
- `docs/manual-review/D078_EVIDENCE_RESOLUTION_BEFORE_LEARNING_PATH_2026_10_09.md`
- `docs/manual-review/D078_UNSUPPORTED_ROLE_PATH_DISPOSITION_2026_10_09.md`
- `docs/manual-review/D078_SUBGROUP_RECONCILIATION_2026_10_08.md`
- `docs/manual-review/D078_SUBGROUP_ROLE_EXHAUSTIVE_AUDIT_2026_10_08.md`

Machine-readable sources are listed in the inventory below. These are evidence
and review artifacts, not live deployment proof.

## Exact current inventory and gate counts

| Surface | Current count | Meaning for this design |
| --- | ---: | --- |
| D078 current areas | 7 | Structural route candidates; runtime review remains open |
| D078 cleaned role rows | 24 | Includes 4 excluded/review-only role rows |
| Supported in-scope role records for task-set research | 21 | Three excluded paths are not enriched as D078 routes |
| D078 area-route rows after local resolution | 26 | 18 supported; 8 conditional/candidate |
| Roles with at least one area route | 19 | 14 have a supported-area route; 5 have no area route |
| Direct domain→role route | 1 | Communication scientist; no justified area route |
| Excluded D078 role paths | 4 | Historian, Mathematician, Biometrician and Philosopher remain hidden/unsupported |
| Existing domain-learning inventory records | 29 | All have provisional item rationales; only one separate domain item is currently approved |
| Workflow-gap additions | 16 | 0 new shared foundations; 5 useful edges; 7 conditional/route-specific; 4 specialist |
| Route alternatives/extensions | 3 | R, Stata and AI/digital-trace ethics; none student-approved |
| Deep-search options | 10 | NVivo, Casevo, Mesa, SPSS, Python, pandas, statsmodels, NetworkX, Jupyter, scikit-learn |
| D078 domain-learning contract records | 58 | 29 existing + 16 additions + 3 alternatives + 10 deep-search options |
| Resolved evidence-envelope records | 206 | Evidence identity/access/relationship envelope; not checkpoint approval |
| Resolved role-task references | 271 | Source-backed task references; not automatic learning-item placement |
| Nigerian context records | 54 | 37 source-backed; 17 exhausted-search/no-local-claim |
| Role-item placement decisions in this checkpoint | 238 of 238 | Every distinct pair has an explicit crosswalk, context-only or hold disposition |
| Role-item occurrences dispositioned in this checkpoint | 420 of 420 | Every occurrence is assigned to one of the three dispositions below |
| Student-approved role-item placements | 0 | No disposition is a student-display approval |
| Student-visible D078 records in task-set ledger | 0 | Research handoff only |

### Count interpretation

The 206-record evidence envelope is not the same as 58 student-ready learning
items. It establishes that claims, identities, links and bounded context were
resolved in the evidence handoff. The separate checkpoint contract still shows
58 records with unadjudicated claims and pending area/role context. The role
item reconciliation reports 0 verified role-task learning relationships, 0
approved checkpoint placements and 0 student-approved records. The placement
repair below resolves the navigation decision for every role-item pair without
changing those approval gates. The design must therefore render honest empty,
conditional or review states until the gates pass.

## Layer responsibilities

### 1. Programme: fixed starting context

The programme layer explains the learner's actual Sociology curriculum and
outcomes. It may show curriculum themes, source wording, course locators and
theme-specific learning materials. It must not turn curriculum content into a
new D078 requirement or imply that the programme proves downstream competence.

Every item shown at this layer needs:

- the exact course/outcome passage and locator;
- a plain-language account of what the programme teaches;
- a separate statement of what it does not establish downstream; and
- a distinction between `covered by programme` and `additional learning`.

Programme items are fixed context. They are not selected as supplemental
learning and cannot be deleted from the programme record.

### 2. Programme → D078: connection explanation

The D078 entry card must state the selected programme, the relevant course or
outcome evidence, what transfers, what does not transfer, and the scope limit.
Internal `Direct`, `Functional` and `Adjacent` values must be translated into
ordinary language; the label cannot stand alone as a promise of readiness,
eligibility or employment.

The learner can inspect the D078 overview before selecting it. A held or
unsupported connection is not shown as a confirmed option.

### 3. D078 domain overview: orientation before learning

The overview explains what the domain studies, the questions it addresses, the
work and outputs it may involve, typical collaborators/settings, entry limits,
global context and separately labelled Nigerian context. It must not become a
raw catalogue of methods or tools, and it must not claim a universal D078
qualification or labour-market outcome.

### 4. D078 foundation: shared only when genuinely shared

The foundation is not “everything useful in the domain”. It is the smallest
set of capabilities evidenced across the relevant downstream routes. Display
two distinct bands:

- **Most versatile foundation:** genuinely shared entry preparation.
- **Useful additional edge:** valuable across several routes or under a clear
  condition, but not shared by all routes.

The current reviewed evidence justifies **no new shared-foundation additions**.
The separate guidance state contains one approved domain item, `research-design`,
with two path targets. It should be treated as a bounded research-route
foundation, not as proof that every D078 role needs formal research design.
The three existing “shared foundation candidate” records and all other
candidate records remain hidden until their route breadth and checkpoint fit
are separately approved.

### 5. Area of specialization/practice: add, do not duplicate

An area explains its boundary and sibling distinction, inherits only relevant
foundation items, and adds the capabilities justified by its own work. An area
must not be created merely because a method, software package or role title
exists. Area additions must be visually distinct from inherited foundation
items and carry their own evidence.

The current seven areas are:

| Area | Route role records | Current route interpretation |
| --- | ---: | --- |
| Sociology and Social Anthropology | 7 | 4 supported; 3 conditional/candidate |
| Economics and Applied Economic Analysis | 6 | 6 supported |
| Politics, Governance and Public Policy | 4 | 4 supported |
| Social Behaviour and Interaction | 3 | 2 supported; 1 conditional/candidate; excludes D064 clinical/counselling scope |
| Human Geography and Population Studies | 3 | 1 supported; 2 conditional/candidate |
| Social Research and Evaluation | 2 | 1 supported; 1 conditional/candidate |
| Computational and Digital Social Science | 1 | 1 conditional/candidate; no supported route yet |

These counts are route records, not unique roles. Criminologist,
Economic-policy, Economic-development, Tax-policy, Genealogist and Thanatology
records demonstrate why separate supported or conditional route branches must
be preserved rather than flattened.

### 6. Role: task-specific addition

The role layer describes actual work, outputs, collaborators, area route(s),
prerequisites, alternatives, limits and evidence. It adds only role-specific
requirements. A role title, ISCO membership, subgroup frequency or shared item
label is not enough to place a role or promote a requirement.

If evidence supports the domain but not an area, use a direct `D078 → Role`
route. If evidence supports no D078 route, stop before the role and keep it
hidden. If evidence supports multiple areas or domains, keep separate route
branches with route-specific additions.

## The item-level correctness contract

Every item at programme, domain, area or role level must carry the following
fields. The fields are required even when the answer is “not established”; an
empty field must not be silently interpreted as “not needed”.

| Required field | Required question |
| --- | --- |
| Stable identity/type | What is the item, and is it a skill, knowledge, method, competency, tool, certification or resource? |
| Plain-language purpose | What is it in ordinary language, and what learner output can demonstrate the described use? |
| Programme meaning | Is it taught by the selected programme, related to it, or additional learning? What exact course/outcome supports that statement? |
| Domain meaning | What D078 question, evidence workflow or output does it support? |
| Area meaning | Which area owns or conditionally uses it, and how is that use different from the domain meaning? |
| Role application | Which role task/output makes it relevant, with exact task evidence? If none is established, say so. |
| Prerequisites | What must precede it? Use `requires` or `builds_on` only when evidenced; otherwise `not_established`. |
| Complements | What is commonly used with it for the same route/output? Do not auto-add complements. |
| Valid alternatives | What can serve a comparable use case, with trade-offs? Alternatives are not cumulative. |
| Limit/non-replacement | What does it not prove, replace or guarantee? Include method/tool/credential boundaries. |
| Evidence/source | Exact publisher, URL, locator, jurisdiction, access/review date and claim scope. |
| Context-specific learning link | A reachable resource that actually teaches the described task at the intended level; a reference or vendor page must not be labelled training. |
| State | `verified`, `supported`, `conditional`, `not_established`, `review_required`, `exhausted_no_local_claim`. |
| Display decision | `student_confirmed`, `student_guided_conditional`, `student_hidden_review`, `student_hidden_no_local_claim` or `admin_only`. |

The same canonical item may have different explanations at programme, domain,
area and role checkpoints. The display must retain the most specific wording
without losing inherited provenance.

## Reviewed item classification

### A. Current shared foundation: one bounded approved item

| Item | Purpose | Correct placement | Status |
| --- | --- | --- | --- |
| `research-design` / Research design | Connect a research question to an appropriate study approach, evidence, analysis and defensible conclusion. | Bounded domain foundation for research-oriented routes; inherited only where the selected route actually conducts or interprets research. | Approved in the existing guidance state; not a universal qualification and not proof of role competence. |

The following existing records are **candidates**, not approved shared items:
`d078-research-question-design`, `d078-evaluate-evidence-and-limits`, and
`d078-communicate-evidence`. Their meaning, programme transfer, D078 breadth,
area use, role application, relationships, limits and learning links remain
subject to the contract below.

### B. Existing 29-item inventory

The reviewed inventory contains 29 unique existing learning items. Their
student-facing classification is:

| Candidate group | Items |
| --- | --- |
| Shared-foundation candidates for research routes | Research question/design; evaluate evidence and limits; communicate evidence |
| Conditional responsibility/data edge | Responsible research; care for research data |
| Useful edge / existing-data support | Find and assess existing social data |
| Conditional method choices | Quantitative methods; qualitative methods; mixed methods; surveys/questionnaire design; interviews; document/content analysis; observation/ethnography |
| Area/specialist method candidates | Computational/digital social research; agent-based modelling; spatial social analysis |
| Tool-choice and optional tools | Statistical-tool choice; KoboToolbox; Taguette; Gephi; Excel; SPSS; NVivo; pandas; Matplotlib; NetworkX; Mesa; Casevo |
| Credential boundary | No universal D078 professional certification established |

All 29 records retain their detailed `meaning`, `output`, `evidence`,
`prerequisites`, `relationships`, `limits`, `scope`, `learning_links`,
`checkpoint` and `display_readiness` fields in
`data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json`.
None may be promoted merely because its record is complete or linked.

### C. Sixteen workflow-gap additions

The 19 workflow-gap findings were reconciled into 16 new concept records. The
correct placement is:

| Category | Items |
| --- | --- |
| Useful additional edge — 5 | Sampling and representativeness; measurement and operationalisation; reliability, validity and uncertainty; open/reproducible research records; reference/literature management |
| Conditional/route-specific — 7 | Pilot/cognitive pretesting; focus groups/workshops; case-study/comparative-case design; archival/historical research; participatory/action research; programme evaluation/theory of change; systematic/scoping evidence synthesis |
| Specialist — 4 | Discourse/conversation analysis; experiments/quasi-experiments/causal inference; psychometrics/scale construction; longitudinal/panel/multilevel data |

**Correctness rule:** the five useful edges are not a shared foundation. The
remaining eleven are route choices or specialist additions. Their sources may
justify what they are, but do not yet justify student display, universal need,
or every area/role placement.

### D. Alternatives and complements

The three reconciled route extensions are:

- `r_statistical_computing`: alternative quantitative-computing route;
- `stata_quantitative_social_science_workflow`: alternative for selected
  survey, panel or multilevel workflows;
- `ai_assisted_and_digital_trace_research_ethics`: conditional edge only when
  AI or digital-trace work is actually selected.

The deep-search checkpoint also identifies explicit tool relationships:

- Python → pandas → tabular cleaning/summaries;
- Python → Jupyter → reproducible notebook;
- Python → statsmodels → advanced statistical models;
- Python → NetworkX → network analysis;
- Python → Mesa → agent-based modelling;
- NVivo ↔ Taguette/manual coding → qualitative coding alternatives;
- SPSS ↔ R/Stata/Python → quantitative tool alternatives;
- Mesa ↔ NetLogo/Repast/MASON → agent-based modelling alternatives;
- NetworkX ↔ Gephi/R network packages → network-analysis alternatives.

These are not a cumulative “learn everything” list. A selected alternative
must replace the relevant option; a complement may be deliberately added but
must not be silently inserted.

### E. Role-specific additions

The role task-set research covers 21 supported in-scope roles, 420 essential or
optional item occurrences and 238 distinct label/priority pairs. The earlier
`65/238` figure was the completed research-lane crosswalk, not the complete
learning-path placement result. This checkpoint now gives all `238/238` pairs
and `420/420` occurrences an explicit design disposition against the existing
D078 inventory:

| Disposition | Pairs | Occurrences | Navigation meaning | Student state |
| --- | ---: | ---: | --- | --- |
| Crosswalk candidate to an existing D078 inventory record | 112 | 232 | Target an existing contract item with exact, partial or conditional relation; retain the most specific role/area explanation | `review_required`; not promoted |
| Role/area context only, not a learning item | 89 | 127 | Keep as bounded subject, setting, legal, disciplinary or role context; do not create a learning card from the label | Not a selectable item |
| Inventory-gap hold | 37 | 61 | The role label describes a method, task, tool or competency not represented by a current D078 contract record | `student_hidden_review` |
| **Total** | **238** | **420** | **Every pair and occurrence dispositioned** | **0 student-approved** |

The crosswalk is a placement decision, not an evidence or readiness claim. A
crosswalk target may still fail identity, checkpoint, relationship, learning-
link or student-display gates. Context-only labels are deliberately not forced
into the learning path. Gap labels are preserved for future review rather than
silently promoted or replaced by a vaguely similar item.

The 37 held labels are: mathematics; legal research; create criminal profiles;
teach in academic or vocational contexts; interact professionally in research
and professional environments; operate open source software; management
consulting; project management; scientific modelling; excavation techniques;
surveying; conservation techniques; create solutions to problems; project
management principles; develop professional identity in social work; deliver
social services in diverse cultural communities; organisational policies;
strategic planning; company policies; develop organisational policies;
investigation research methods; analyse recorded sources; suggest revision of
manuscripts; advertising techniques; content marketing strategy; manage
government-funded programmes; carry out strategic research; fraud detection;
audit techniques; accounting techniques; photogrammetry; cartography;
environmental legislation; and their essential/optional priority variants.
The source ledger remains the authority for the exact label, priority and
occurrence count; this list is a human-readable hold summary.

For every crosswalk candidate, the target inventory contract remains the source
for plain-language purpose, programme meaning, D078 meaning, area meaning,
role application, prerequisites, complements, alternatives, limitations,
evidence and learning link. Where the target relation is only partial or
conditional, the role card must say so and must not relabel the source item as
the role's universal requirement. For every context-only or gap label, the
corresponding learning-item fields are `not_established`; the source role/task
record may explain context, but it cannot supply a learning-path placement by
itself.

The 21-role roster is:

`criminologist`, `sociologist`, `business economics researcher`, `media
scientist`, `archaeologist`, `economic policy officer`, `social work
researcher`, `behavioural scientist`, `political scientist`, `economic
adviser`, `genealogist`, `communication scientist`, `thanatology researcher`,
`economist`, `economic development coordinator`, `statistician`,
`anthropologist`, `tax policy analyst`, `geographer`, `demographer` and the
remaining supported in-scope task-set record retained in the ledger.

The role-item evidence envelope is useful for research, but it does not itself
approve a role learning path. The role reconciliation currently records zero
verified role-task learning relationships, zero approved checkpoint placements
and zero student-approved records.

### Student-facing role names

The route uses these reviewed student-facing labels. This is a design mapping
only; the canonical role library is not edited in this pass. The blank
canonical display value for `statistician` is resolved here as the plain label
**Statistician** for the student route. The four excluded/unsupported paths do
not receive student role cards.

| Source role key | Student-facing name |
| --- | --- |
| criminologist | Criminologist |
| sociologist | Sociologist |
| business economics researcher | Business Economics Researcher |
| media scientist | Media Researcher |
| archaeologist | Archaeologist |
| economic policy officer | Economic Policy Officer |
| social work researcher | Social Work Researcher |
| behavioural scientist | Behavioural Scientist |
| political scientist | Political Scientist |
| economic adviser | Economic Adviser |
| genealogist | Genealogist |
| communication scientist | Communication Researcher |
| thanatology researcher | Death and Dying Researcher |
| economist | Economist |
| economic development coordinator | Economic Development Coordinator |
| statistician | Statistician *(design-only fallback for blank canonical display value)* |
| anthropologist | Anthropologist |
| tax policy analyst | Tax Policy Analyst |
| geographer | Geographer |
| demographer | Demographer |
| remaining supported in-scope ledger role | Use its reviewed `student_display_name`; never fall back to a raw internal key |

Excluded/unsupported role paths remain hidden: Historian, Mathematician,
Biometrician and Philosopher. No raw internal role key, ESCO label or retired
subgroup label may be shown when a reviewed student-facing name is absent.

The reviewed source ledger contains **238 distinct role-item pairs** and **420
occurrences**, not 283 distinct pairs. No 283-pair denominator is present in
the current D078 task-set or reconciliation JSON; the active design denominator
is therefore 238.

## Complete navigation and stop rules

### Normal route

```text
Programme overview
  → inspect D078 connection
  → D078 overview
  → shared foundation / useful edge
  → choose one or more area routes
  → inspect supported or explicitly conditional roles
  → choose role branch, if justified
  → preview focused learning plan
  → save / reopen / print or download / optional privacy-safe share
```

### No-role and domain-only stops

- If the domain is supported but no area is evidenced, stop at `D078 → Role`.
  Do not invent an area to make the navigation look complete.
- If an area has no supported role route, show the area as an area-learning
  route only, with “role route not established” and no fabricated role cards.
- If a role has a conditional route, display the condition before selection and
  keep the route out of unconditional recommendations.
- If the role has no D078 domain fit, stop before the role and keep it hidden.
- If a required item lacks checkpoint evidence, a valid relationship or a
  task-specific learning link, show an empty/review state; do not substitute a
  generic link or plausible prerequisite.
- The 17 `exhausted_no_local_claim` records remain hidden from Nigerian claims;
  global evidence may be shown only if independently approved and labelled.

### Multi-route stacking

Multiple programmes, domains, areas or roles are separate route stacks. Each
stack retains its own programme context, inherited foundation, useful edges,
area additions, role additions, alternatives and complements. Shared stable
items may appear once in a visual summary only if every route provenance is
retained. The report must never merge mutually exclusive alternatives or
route-specific additions into a universal checklist.

## Selection, save, reopen and report behavior

Selection means “include this in my current learning focus”; it never means
known, wanted, completed, mastered, approved or job-ready.

- **Programme:** fixed curriculum themes are context only and cannot be
  selected as supplemental items.
- **Domain:** approved foundation items may be added; useful edges are labelled
  separately and remain optional/conditional.
- **Area:** inherited items are shown once with provenance; area additions enter
  only after an area route is selected.
- **Role:** role additions enter only after an explicit role branch is selected.
- **Prerequisite:** show the missing prerequisite and why it matters; never add
  it silently.
- **Complement:** offer “add as related option”; do not auto-add.
- **Alternative:** offer comparison and explicit replacement; do not combine
  alternatives into one checklist.
- **Remove:** removes an item from the personal focus only. It does not erase a
  route requirement or alter canonical data.
- **Reorder:** permitted only within evidence-defined prerequisite order.
- **Save to My World:** immutable versioned snapshot containing route IDs,
  selected item IDs, placements, order, alternatives, removed IDs, evidence/data
  version and timestamps.
- **Reopen:** rehydrate the same stack, then flag changed evidence, display
  state, source or link; never silently rewrite the learner's snapshot.
- **Report:** preserve programme context, foundation, edge, area, role,
  alternatives, complements, limits, learning links, source notes and route
  boundaries. State whether it was generated from the working tray or a saved
  snapshot.
- **Share:** only a revocable privacy-safe summary; exclude identity,
  institution/admin metadata and hidden/review-only records.

## Correctness gates before student display

An item is `student_confirmed` only when all gates pass:

1. **Identity gate:** exact item type and meaning are verified.
2. **Programme gate:** programme transfer is supported or explicitly marked
   additional; no curriculum overclaim is made.
3. **Checkpoint gate:** the item belongs at the displayed domain, area or role
   level, not merely somewhere in the inventory.
4. **Task/output gate:** the learner-facing purpose names a concrete, bounded
   task and output.
5. **Breadth gate:** shared, useful-edge, conditional, specialist and role-only
   classifications match the reviewed evidence.
6. **Relationship gate:** every `requires`, `builds_on`, `complements`,
   `alternative_to` and `supports` edge has its own evidence and explanation.
7. **Non-replacement gate:** the card states what the item cannot prove or
   replace, especially tools versus methods, credentials versus competence, and
   simulation versus observed evidence.
8. **Context gate:** global and Nigerian claims are separate, scoped and dated.
9. **Learning-link gate:** the destination teaches the described task or is
   accurately labelled as reference/documentation; generic homepages do not
   pass as task-specific instruction.
10. **Route gate:** area/role fit is independently supported, including all
    conditions and negative neighbouring-domain checks.
11. **Uncertainty gate:** unresolved or no-local-claim states remain visible in
    provenance and hidden/conditional in student guidance.
12. **Snapshot gate:** selection, save, reopen, report and route changes preserve
    the same evidence/display decision without mutating canonical data.

The current D078 package fails the final promotion gate because all 58 contract
records still have unadjudicated claims and pending area/role context; 42 lack
verified task-specific free learning resources; 39 lack item-definition,
checkpoint-fit or explanatory source roles; and student approval remains 0.
These are open work items, not reasons to invent substitutes.

## Explicit unresolved items

- The D078 overview gate remains open until programme overview, pre-domain
  entry and rendered domain orientation are accepted together.
- The seven areas are locally reconciled but remain pending runtime review; the
  current student/API area layer must not be described as fully promoted.
- Only one domain item is currently approved; the three shared-foundation
  candidates need breadth and route-task verification.
- All 58 contract records need claim, checkpoint, relationship and downstream
  context review before display; the contract currently preserves these gaps.
- Forty-two contract records lack a verified task-specific free learning
  resource even though learning evidence/access records exist in the broader
  evidence envelope.
- Thirty-nine records lack one or more distinct source roles: item definition,
  checkpoint fit or explanatory source.
- Role-item placement decisions are complete for design purposes: 238 of 238
  pairs and 420 of 420 occurrences have a crosswalk, context-only or hold
  disposition. The 37 inventory-gap pairs remain explicitly held and are not
  student placements.
- No role-item learning relationship or checkpoint placement is approved in the
  role-item reconciliation.
- The computational route has no supported area-route role yet; its methods,
  tools, Python ecosystem and AI options must remain conditional/specialist.
- Casevo remains emerging/niche; scikit-learn is deferred from the first
  student-facing set; commercial tool access and version-specific tutorials
  require renewed checks at display time.
- Observation/ethnography and the computational-method umbrella have unresolved
  direct beginner-learning-link coverage in the domain review.
- No universal D078 professional certification or Nigerian labour-market,
  licensing, salary or demand claim is established.
- The programme-layer Sociology GST 212 source check remains in the final
  integration queue; disputed cross-programme outcomes must not be used as
  downstream learning evidence before that check.

## Verification fixture required next

The first correctness fixture should be a deliberately narrow route:

```text
Sociology
  → Social Sciences & Behavioural Research
  → Social Research and Evaluation
  → Social work researcher (supported route)
```

It must include one populated approved `research-design` item and one honest
empty/review-only state for the remaining candidate items. A second fixture
must exercise a conditional route, for example:

```text
Sociology
  → D078
  → Computational and Digital Social Science
  → Statistician (conditional social-data scope)
```

The second fixture must show the condition, preserve alternatives and prevent
Python, SPSS, R, Stata, NetworkX or simulation tools from appearing as
universal requirements.

The fixture must test: back/close, compare without selection, prerequisite
guards, alternative replacement, complement add, area stop, direct domain→role
stop, multi-route separation, add/remove/reorder, save/reopen, print/download,
privacy-safe share, stale evidence/link warning and fail-closed hidden states.

## Source-of-truth artifact map

| Artifact | Exact role in this checkpoint |
| --- | --- |
| `data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json` | Full 58-record item contract with meaning, output, evidence, relationships, limits, scope, links and states |
| `data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json` | 137 legacy labels, 30 summary labels, 29 existing items, 30 candidate items, source and gap dispositions |
| `data/career-mapping/_audit/d078_learning_path_reconciliation_2026_10_08.json` | 29 existing records, 16 new concepts, 3 route extensions and reconciliation counts |
| `data/career-mapping/_audit/d078_candidate_category_audit_2026_10_09.json` | 19 workflow-gap category decisions; confirms 0 new shared-foundation additions |
| `data/career-mapping/_audit/d078_skills_methods_deep_search_checkpoint_2026_10_08.json` | 10 deep-search options, 14 checked source records and tool/alternative boundaries |
| `data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json` | Seven areas, 21 roles, 56 task-set records, 119 baseline sources and unresolved role-item coverage |
| `data/career-mapping/role_library_v3_cleaned.json` | Reviewed role keys and existing student-facing role-name fields; no canonical edits made |
| This checkpoint, role-item disposition table above | Local design repair covering 238/238 pairs and 420/420 occurrences; 112 crosswalk candidates, 89 context-only, 37 held gaps |
| `data/career-mapping/_audit/d078_evidence_resolved_before_learning_path_2026_10_09.json` | 206 evidence records, 271 role references, 206 learning records, 54 Nigerian-context records |
| `data/career-mapping/_audit/d078_area_role_resolution_2026_10_08.json` | Seven areas and 26 route records, including supported, conditional and direct-domain outcomes |
| `data/career-mapping/_audit/d078_guided_control_document_audit_2026_10_08.json` | Current gate result: selection layer passes; learning contract and domain student readiness fail |
| `data/career-mapping/_audit/d078_final_enrichment_lane_merge_2026_10_09.json` | 215 merged enrichment entries; 206 in scope and nine excluded philosopher entries |

## Final handoff state

The D078 design is now specified as a connected navigation model **and** a
learning-path correctness contract. The full role-item placement decision is
now covered locally: no pair is left without a disposition, while 37 gaps and
all approval gates remain explicitly held. It is ready for a local
fixture/audit pass, not for broad student promotion. The next implementation
work may build the fixture and local state behavior, but must preserve the
evidence gates and must not promote the 58 contract records, held role-item
gaps, conditional routes or hidden local-context records by convenience.
