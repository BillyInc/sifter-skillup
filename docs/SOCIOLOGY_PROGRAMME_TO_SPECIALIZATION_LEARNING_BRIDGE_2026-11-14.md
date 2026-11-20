# Sociology Programme-to-Specialization Learning Bridge

**Date:** 2026-11-14  
**Status:** Product/data design proposal; not a claim that every Sociology course-to-area connection is already mapped or student-approved.  
**Scope:** Begin with the Nigerian Sociology programme (D078), then apply the contract to every programme, domain, specialization area and downstream learning item.

## Recommendation

The NUC suggestion to deprioritize Sociology at BSc level is an external policy position, not a platform recommendation. The platform should not encode that recommendation by hiding or diminishing Sociology. The observation does identify a learner problem: students can complete a broad Sociology degree without seeing how a specific course outcome connects to applied work, what they can do with it, which methods/tools support that work, or what evidence they can show an employer. Address that visibility and learning-design gap without making an institutional policy judgment for the NUC.

Make the programme-to-specialization-to-practice chain visible, evidence-backed, and usable during the undergraduate degree. Keep Sociology’s broad disciplinary foundations, but expose legitimate applied routes alongside them. Do not imply that a student must wait until a PhD to explore demography, criminology, organizational/industrial sociology, social psychology, evaluation, or other specializations. Conversely, do not promise that a bachelor’s course alone confers expert status, professional authority, or a high-paying job. Show the specific capability, practice and portfolio evidence that can be developed at BSc level, with its limits and any further preparation clearly named.

## What exists now—and what is still missing

The repository already has important building blocks:

- A source-backed Sociology programme curriculum contract with **34 courses, 243 course-outcome rows and 7 separately stored programme abilities**; these must remain distinct from legacy profile skills arrays.
- A Sociology course/theme presentation contract with **14 themes**, student-facing abilities and programme reading/resource work.
- D078 Social and Behavioural Sciences has **seven specialization areas**, including Sociology and Social Anthropology, Economics and Applied Economic Analysis, Politics/Governance/Public Policy, Social Behaviour and Interaction, Human Geography and Population, Social Research and Evaluation, and Computational/Digital Social Science.
- Programme-to-domain evidence stores audited course anchors, transferable evidence, mapping source and review flags for a programme/domain relationship. The relationship label remains separate; missing course evidence must not be invented.
- D078 area/task/method/tool/role routes and Sociology role/course data exist in separate contracts and projections.

There is already a partial bridge in the current integrated method/area/role graph: `programme_transition` records the Sociology programme, 14 themes, 236 outcomes, matched transfer outcome IDs and a policy for carrying only source-matched context into D078. `programme_method_context` also has course-specific grounding for method choices (for example, Sociology research-method courses contextualize quantitative, qualitative and mixed-method options). Extend the existing programme → domain → area/task → method/tool/role route; do not create a competing Sociology learning path.

The mapping is not blanket coverage. The graph audit reports 19 course-anchor and 46 transferable-evidence records in aggregate, but only **12 individually resolved course-anchor rows and 12 individually resolved transferable-evidence rows**. Its learner-display policy says to use resolved evidence and not display aggregate counts. Treat those 12+12 matches as the verified transition context until reconciled. Also, structural `student_visible: true` is not release approval: `student_ui_gate` is `closed_pending_acceptance`, `enabled: false`, and `student_facing_approved: false`; rendered route acceptance, route-matrix review and explicit student release approval remain required.

Show programme-wide curriculum/themes at the **programme level**, then enter the D078 domain before presenting specialization areas. Do not preview area cards on the programme page. Carry the exact supported Sociology course/outcome context into D078; when an area is reached/selected within the domain flow, show its relevant course/outcome rationale and competence-building items on that **specific area route**. The programme card remains curriculum, not area discovery; the selected area route is where students add methods, tools, practice and outputs relevant to competence. Neither surface should imply every listed item is taught in Sociology.

## Learner promise

For each displayed connection, help a student answer:

1. **What did I learn in my programme?** Show the source-backed course and the exact or faithfully summarized programme outcome.
2. **Which specialization does it connect to, and why?** Name the D078 area and explain the supported conceptual or practical relationship.
3. **What can I do with it?** State a bounded task and tangible output—not just a skill adjective.
4. **What methods and tools might support the task?** Offer evidence-backed options, with prerequisites, tool access/cost and ethics/data caveats.
5. **How can I practise and demonstrate it?** Suggest a feasible undergraduate project or work sample and identify the evidence it can demonstrate.
6. **What does this not qualify me to do?** Distinguish introductory application from professional licensing, specialist authority, causal certainty or job readiness.

## The evidence chain

Model this as additions to the existing source-grounded graph—not a parallel hand-written list or route:

```text
Programme identity and version
  -> course (code, title, level/semester when sourced)
  -> source-backed course outcome / programme ability
  -> D078 domain transition (matched preparation, not mastery)
  -> selected specialization-area competency or task
  -> existing method/design route and route-specific learning items
  -> optional tool/data resource
  -> bounded student output / portfolio evidence
  -> optional downstream role-task examples and further preparation
```

Every edge is its own reviewed claim with provenance. Not every course connects to every area; a course can connect to multiple areas only when the actual outcome supports each one. The same area competency can draw on outcomes from multiple courses. Preserve the difference between:

- **direct curriculum link:** the outcome names or clearly teaches the area/method/task;
- **transferable foundation:** the outcome supports a prerequisite capability, but is not itself specialist training;
- **applied extension:** a D078 task/tool/project can apply the curriculum outcome, but the programme does not claim to teach that full application;
- **not established:** the reviewed evidence does not support a connection yet.

Keep the audited programme-to-domain relationship label (`direct`, `functional`, `adjacent`) separate from the student-facing course/outcome bridge. Never turn a broad domain mapping into a course-level claim or use role popularity/frequency as curriculum evidence.

## Where the connection belongs in the current flow

**Programme page — show the programme, not its areas.** Show the selected programme's curriculum themes, courses and outcomes. Do not show or preview D078 areas here. The page may explain that course outcomes can inform later domain learning, but should not introduce specialization cards before the student has entered the Social and Behavioural Sciences domain.

**Programme → D078 transition — carry context, do not restart or overclaim.** Pass the selected programme/version and matched course/outcome references into the existing D078 context. The current graph already defines this policy: keep all programme themes/outcomes visible at programme level, but carry only explicit source-matched context into the domain. Enter the D078 overview/shared foundations/domain learning before showing area choices. Say “your course introduces/provides a foundation for…” rather than “you have mastered…”.

**Area choice and route — attach the evidence and the learning needed for competence.** After the learner has entered D078 and reached the specialization choice in the existing domain/method flow, selecting Human Geography and Population, Social Research and Evaluation or another area should show the relevant course/outcome connection beside that area's task/method route. Then show concrete methods/designs, approved area-owned learning items, optional tool choices, practice, outputs and checks for the selected capability. For example, a verified demography outcome may ground a Human Geography/Population task; the route can then offer population measures and spatial analysis, optional GIS/data tools, and a bounded population profile. If GIS is not taught in the cited course, label GIS as an applied extension and its learning item as additional—not as prior learning.

**Methods and area routes — reuse the existing sequence.** Do not create another learning path. The current D078 contract orders shared foundations and domain learning before method routes, with areas inheriting the domain path and showing area-owned additions; role learning follows explicit area/role context. It distinguishes method alternatives, conditional prerequisites, optional tools and area additions. The curriculum bridge is provenance and personalization metadata on those routes. It can acknowledge prior learning and identify gaps, but must not duplicate method items, create a competing sequence, or silently change a requirement lane.

**Themes/outcomes — connect both, for different jobs.** The course outcome is the evidence-bearing anchor for a curriculum claim. The theme is the programme's learner-friendly grouping/display context. Link outcome IDs to area/task evidence and retain the theme ID to locate the outcome in the programme view. Do not map a theme label alone to an area or skill. If an outcome cannot be matched, show it as curriculum and mark its area relationship `not_established` rather than inventing one.

## How an area route explains the connection

The learner should not see a bare “Course X relates to Human Geography” cross-link. The area route must explain the **bridge and the gap**: what the cited course outcome contributes, how that contribution supports this area's task family, and what additional learning item(s) the learner can add to perform that task with greater competence. Show this in two steps, both after the learner has entered D078; never preview area cards on the programme page.

### Two-step area explanation

**When an area is reached:** show a compact “Why this area connects to your programme” panel only when reviewed course/outcome-to-area evidence exists. Name the verified course/outcome, state whether it is direct curriculum grounding or transferable preparation, and explain the shared concept in plain language. Show only the task families that have an evidenced connection, each with a short “used for” description. Do not imply that the student mastered the outcome, that every task family is curriculum-taught, or that all area items are needed. If no course-to-area evidence is established, omit the personalized claim and retain the normal area route with an explicit review gap in the staff audit.

**After a task family is selected:** expand the explanation into the actionable chain for that exact family: course/outcome contribution → the task/question and expected work → relevant existing method, technique and tool items → item-linked learning resources → a bounded practice output and quality/ethics checks. Distinguish items inherited from the selected domain/method route from additions owned by this area or task family. Explain what each additional item adds and whether it is needed, a supported alternative, or optional; never promote a tool or resource into a requirement merely because it appears in the list. This keeps the area overview readable while making the selected task's application concrete.

The underlying relationships remain individually evidence-backed and many-to-many: an outcome may support more than one area task family, and a task family may draw on several outcomes, but every displayed connection must resolve to its own reviewed IDs and provenance. A course-to-area relationship alone does not prove a course-to-task, course-to-tool, or course-to-role relationship. If the exact family or item edge is not established, do not fill the gap with inference; show only the strongest supported link and keep the rest as a review item.

Use this consistent explanation sequence:

1. **Your programme evidence:** identify the exact course and outcome (or a short faithful excerpt), the official source locator, and the reviewed evidence type. Use cautious labels such as “introduced in your curriculum” or “provides a foundation” unless the source actually demonstrates applied practice. A curriculum outcome is not proof that this individual student mastered it.
2. **Why this area connection is valid:** state the conceptual/method bridge in ordinary language. Name the shared object or operation—e.g. population measures, social groups, institutional processes, research evidence—and explain what the course outcome contributes to the chosen area. State whether it is direct curriculum grounding, transferable preparation, or an applied extension.
3. **What this area does with it:** name the selected task family and explain the practical question/action it covers. Make the connection explicit from outcome → area task family; do not jump from a course title directly to a job title or tool.
4. **What to add next:** show the existing route's relevant methods, techniques, tools and supporting resources as learning items. For each item say what capability it adds and which task/output it supports. Keep prerequisite/needed/useful/optional lanes exactly as reviewed. A tool is not evidence of competence by itself; a specialist tool not taught in the course is additional learning, not prior learning.
5. **What the learner can make and how to check it:** give a feasible practice output and a short quality/ethics checklist grounded in the area/task contract. Examples include a documented population profile, interview guide plus analytic memo, programme evaluation note, or policy evidence brief—only when that area's evidence supports the task.
6. **Limits and onward options:** state relevant interpretation, data, ethics, jurisdiction and professional boundaries. Show further specialist learning when warranted without making a PhD or credential a universal gate to undergraduate applied practice.

### Illustrative display: population study → geospatial application

Only display this connection if the selected programme's audited curriculum contains an outcome that supports population concepts/measures or population data. Do not assume that every Sociology degree has a demography course or that the student has already learned GIS.

```text
YOUR SOCIOLOGY COURSEWORK
[Verified course title/code] — [matched population/demography outcome]
This outcome introduces [the exact population concept or analysis in the source].

WHY IT CONNECTS
Human Geography and Population examines how population patterns vary across
places and how those patterns relate to settlement, migration or access.
Your course gives you [specific supported foundation]; it does not show that
you have already done spatial analysis or mastered GIS.

APPLY IT IN THIS AREA
Task family: Spatial patterns / population analysis
Question: How does [defined population measure] vary across [defined places
and period], and what can the data support us in saying?

ADD TO BUILD THE CAPABILITY
[Relevant population-measure method] — choose and interpret a suitable
denominator, time period and comparison.
[Spatial analysis method] — use only when the question and data require it.
[GIS tool/resource, such as QGIS] — optional tool learning unless the reviewed
route explicitly makes it needed; it is not represented as taught by Sociology.

PRACTICE OUTPUT
A sourced population map/profile with dates, geographic units, denominators,
data-quality notes and a bounded interpretation.

LIMIT
A map can describe a spatial pattern; it does not by itself establish its
cause, prove service access, or confer authority to make a statutory plan.
```

The `course/outcome → area task family → method/tool item → practice output` links must each resolve to their own reviewed evidence and canonical IDs. The interface can visually group them in one explanation card, but the data contract must not collapse them into one unsupported edge. If the course-to-area edge is missing, do not show the example as personalized fact; show the existing area route without a claimed course connection and retain the mapping gap for review.

## Illustrative Sociology example: demography and geospatial practice

Use this as a pattern to verify—not as an assertion that every Sociology degree teaches GIS or spatial analysis:

```text
Sourced Sociology course and outcome about population, demographic measures,
population change, migration, or population data
  -> D078 Human Geography and Population: the matched population/spatial task
  -> methods chosen for the specific question: rates, comparison across place,
     demographic estimation, mapping or spatial analysis when warranted
  -> optional tools: spreadsheet/statistical package/GIS such as QGIS only where
     the task, learner readiness and resource evidence support the choice
  -> practice: produce a clearly bounded population profile, map or short
     evidence note from appropriate public data, with denominator, dates,
     geographic boundaries, missingness, privacy and interpretation limits
```

The explanation should say, for example: “Your population/demography outcome gives you a foundation for describing population patterns. Human Geography and Population applies that foundation to questions about where people and services are located. GIS can help map suitable data when the question needs a spatial comparison; learning a GIS tool is an optional applied extension unless your actual course record says otherwise.”

Do not write “your Sociology course teaches GIS” unless the official course/outcome source establishes it. A map shows a spatial pattern; it does not by itself explain causation, prove service access, or confer planning authority. The same logic applies to criminology, industrial/organizational sociology, social psychology, policy, research/evaluation and computational social science: anchor each connection to actual course outcomes and explain when advanced specialist training is still needed.

## Student experience

Add a **“Where this appears in your degree” / “Apply it in a specialization”** bridge within the selected Sociology programme view. Keep curriculum themes and outcomes recognizable; add connections rather than replacing the degree curriculum with an unrelated list of “marketable skills.”

Example card:

```text
IN YOUR SOCIOLOGY PROGRAMME
Course: [verified course title/code]
Outcome: [exact or faithful, traceable curriculum outcome]

CONNECTS TO
Human Geography and Population
Why: [specific evidence-backed relationship]

TRY APPLYING IT
Task: [bounded task]
Methods: [relevant choices; not all required]
Tools: [optional tool links, access/cost and prerequisites]
Make: [portfolio-sized output]
Check your work: [data, ethics and interpretation checklist]

This connection is [direct / transferable / applied extension].
It does not by itself establish [relevant professional or evidence limit].
```

Let students explore by **course**, **specialization**, or **applied task**. Show multiple connected courses when that helps explain progression, but do not convert a contextual relationship into a compulsory sequence unless prerequisites are independently evidenced and approved. Links can be saved to My World; distinguish saved resources from curriculum records, selected routes, notes and skills.

## Data contract proposal

Keep source curriculum records immutable and add versioned evidence references to the existing graph/route contract (and, only if persistence needs it, an additive bridge ledger/table). Do not introduce a second canonical route graph. Suggested record shape:

```json
{
  "bridge_id": "sociology-course-outcome-to-area-task-0001",
  "programme_id": "sociology-programme",
  "programme_version": "source-version-or-academic-year",
  "course_id": "canonical-course-id",
  "course_code": "source-course-code",
  "outcome_id": "canonical-outcome-id",
  "outcome_locator": "curriculum source page/section",
  "theme_id": "programme-theme:sociology:research",
  "area_id": "D078:human-geography-population",
  "area_task_id": "canonical-area-task-id",
  "method_route_id": "existing-method-route-id-or-null",
  "relationship_type": "transferable_foundation",
  "connection_claim": "A faithful, bounded explanation of how the outcome supports the task.",
  "methods": ["method-id"],
  "tool_options": ["tool-id"],
  "student_output": "Bounded, demonstrable work sample.",
  "assessment_checks": ["check-id"],
  "prerequisite_ids": [],
  "role_task_ids": [],
  "sources": [{"url": "https://...", "locator": "...", "accessed_on": "YYYY-MM-DD"}],
  "review_state": "review_required",
  "student_visibility": "not_approved",
  "claim_limits": ["..."],
  "reviewed_on": null
}
```

Use stable IDs, exact source locators, separate curriculum evidence from area/task evidence, and explicit review/visibility states. Add evidence references to `programme_transition` and route-specific relevance to existing area/task/method records. Keep `not_established` rows in the audit so gaps are visible, but do not project them as confirmed connections. Store role-task links only when separately supported; area membership does not imply every role/task applies to every student. Avoid duplicating outcome prose or rebuilding method order when canonical IDs can be referenced.

## Rollout across all programmes and domains

1. **Reconcile the current graph:** verify the embedded Sociology transition, 12 resolved course anchors and 12 resolved transferable-evidence rows against the curriculum contract; explain the aggregate 19/46 counts without projecting unresolved aggregates as learner evidence.
2. **Pilot Sociology (D078):** extend the existing programme transition and selected area/task/method routes with supported course/outcome links across the seven D078 areas, methods/tools, outputs and resources. Add only source-located mappings; preserve no-match states.
3. **Coverage audit:** enumerate every course/outcome against canonical area/task/method candidates; classify each as supported, not applicable with a reason, or not established. Review cross-area cases and require claim-level evidence for every positive link.
4. **Student copy and projects:** design bounded undergraduate practice tasks and outputs; have a discipline reviewer check fidelity, level, ethics and Nigerian/local relevance. Keep specialist training and further study visible without making them prerequisites for every route.
5. **Interface/API:** expose approved, programme-version-specific context inside the current programme transition and selected D078 route. Return course/outcome, area/task, rationale, existing method/tool options, output and limits together. Preserve current ownership, source, visibility and data-state gates.
6. **Pilot validation:** complete graph/API checks, rendered area/role interaction acceptance, manual route-matrix verification and explicit student-facing release approval. Verify the no-area-preview-before-domain order in the rendered flow. The current graph UI gate is disabled; graph structure alone is not a live learner flow.
7. **Scale in batches:** reuse the evidence contract and audit tooling for each programme/domain pair, but do not copy Sociology mappings to another programme. Source and review each programme's curriculum independently. Publish only when coverage, provenance, admin review and student/API gates pass.

The eventual global target is a traceable map for all supported programmes—not a forced link from every course to every domain. “Not established” and “not applicable” are valid, useful results. Keep the 420 JAMB programme identities distinct from the 237 CCMAS supporting curriculum packages; do not imply that a CCMAS curriculum package exists for every JAMB identity.

## Acceptance and closure gates

- Every active source-backed course/outcome in the pilot is accounted for in the bridge audit; every positive bridge has a precise curriculum locator and independently reviewed area/task evidence.
- Each published student claim resolves to canonical programme, course, outcome, area and task IDs for the selected programme/version; no neighbouring programme or legacy skill-array inference is used.
- Relationship types distinguish direct, transferable and applied-extension evidence; unsupported links remain `not_established` or `not_applicable` with reasons.
- Each displayed application includes a bounded task/output and relevant method/tool options without implying that all tools are required or already taught in the course.
- The bridge is integrated into the existing programme transition and selected area/method route; no duplicate learning graph or parallel sequence is introduced.
- Programme curriculum view contains no area preview; after the learner enters D078 and reaches area choice, the selected route explains the course connection and the additional items/methods that can build competence.
- Learning resources are direct, checked, item-specific and saveable; resource presence does not approve the bridge claim.
- Student copy does not promise employment, salary, professional authorization, causal inference or specialist competence beyond evidence.
- Admin/provenance and student-visibility checks pass; database deployment is separately verified before any live-data claim.
- A counter-review confirms no course was forced into an area just to improve pathway counts. The pilot's complete coverage ledger and exceptions are reviewable before scaling.

## Important source artifacts

- `backend/MIGRATION_RUNBOOK.md` — programme-to-domain evidence and Sociology curriculum contracts, prerequisites, ordering and student-display safeguards.
- `backend/COMPLETE_DATA_MIGRATION_2026-08-17.md` — programme/domain evidence contract and operational caveats.
- `data/career-mapping/_audit/programme_domain_evidence_2026-08-17.json` — audited programme-to-domain evidence; inspect the current authoritative worktree version and generated counts before using.
- `backend/seed_sociology_curriculum_contract_2026-09-17.sql.gz`, `data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json.gz`, and the schema migration — source-backed Sociology course/outcome contract; follow the repository transport instructions, and do not treat local presence as proof of live deployment.
- `docs/manual-review/SOCIOLOGY_THEME_ABILITIES_AND_RESOURCES_2026_10_22.md` — student-facing theme/ability/readings design.
- `docs/manual-review/SOCIOLOGY_PROGRAMME_THEME_RESOURCE_MATRIX_2026_10_08.md` — theme-specific reading coverage and limitations.
- `backend/d078_guided_areas.py` and `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json` — canonical D078 areas and reviewed area/role route context.
- `docs/manual-review/D078_SEQUENCE_CONTRACT_REDESIGN_2026_10_17.md` — existing method/area/role sequence, requirement lanes and UI card contract.
- `data/career-mapping/_audit/build_sociology_e2e_route_inventory_2026_11_07.py` and associated audits/tests — current Sociology route/e2e coverage; verify output freshness and results before treating it as proof.

**No SQL, curriculum source, route graph, learner UI, or programme mapping is changed by this design document.**
