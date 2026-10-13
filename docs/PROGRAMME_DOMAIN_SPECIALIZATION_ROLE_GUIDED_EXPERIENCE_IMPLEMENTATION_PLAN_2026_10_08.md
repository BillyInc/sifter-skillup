# Guided Experience Enrichment: Implementation Plan

Date: 2026-10-08  
Status: local evidence/link contracts and fail-closed display gates exist across programme, domain, area and role item paths. The Sociology programme-theme work and D078 domain-learning work are progressing as separate implementation layers. Do not repeatedly restart the programme review while domain enrichment is underway: maintain layer-specific findings and complete one integrated programme-to-role verification after all intended layers are implemented. Canonical promotion, the complete route/report flow and SQL deployment remain incomplete.

## Purpose

Upgrade the programme exploration mockup and the Sociology worked example into the experience defined by `PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`. The goal is not simply to display more items. Every displayed capability and every relationship should be understandable to a learner who may be encountering the term for the first time, and should explain how it contributes to a selected learning route.

The guided-experience specification is the current target contract. The programme/box mockup and Sociology example are earlier design inputs: retain their useful interaction and teaching examples, then reconcile them against the newer contract rather than treating the earlier documents as competing specifications.

## Stage completion, approval and anti-loop contract

This contract governs local implementation and every agent handoff for the
Programme → Domain → Area of Specialization/practice → optional Role guided
experience. The specification defines the intended product; this plan defines
how work is staged, evidenced, approved and resumed. A checkpoint is the
authoritative handoff for the current stage and must be updated when a stage
closes—not left to contradict a newer decision or verified artifact.

### Close a stage once; do not silently reopen it

1. **Name the stage and its deliverables before work starts.** Record the
   owner, exact in-scope artifacts/records, acceptance gates, and work that is
   explicitly out of scope. Use a bounded stage such as programme overview,
   pre-domain entry, domain overview, content enrichment/disposition, sequence
   design, UI/state wiring, integrated rendering/report verification, or
   student-facing release. Do not use a broad label such as “QA” without
   stating what is being checked.
2. **Close against evidence, not intention.** At completion, record the
   artifact paths and versions, item/edge counts or exact ID set, checks and
   test commands with results, rendered/runtime evidence where required, date,
   disposition, and approver. State separately what is complete, what remains
   deferred, and what is blocked. A generated file, an existing URL, a green
   structural test, or a status flag alone proves only the scope it actually
   checks.
3. **Synchronize the contract in the same task.** When the user approves a
   decision or the stated acceptance evidence passes, update the authoritative
   plan/contract, stage ledger/checkpoint, and any downstream status field or
   release report that represents that same decision. Do not leave a completed
   decision labelled pending in a downstream artifact. If a downstream field
   cannot be changed in the current task, record the exact mismatch as a
   metadata/integration defect and assign it as the next action; do not send
   the completed stage back for another review.
4. **Freeze completed stages.** A stage marked complete/approved is closed.
   Do not repeat its research, audit, reconciliation, design, or approval pass
   merely because a later checkpoint is opened, an agent changes, a new
   account/session begins, or a flag still says `false`. Reopen only when one
   of these is recorded: (a) new contradictory evidence that materially
   changes a claim, (b) changed scope or requirements, (c) a demonstrated
   regression, or (d) the user explicitly reopens the stage. Identify the new
   evidence/change and the smallest affected portion; preserve the prior
   completion record and append a scoped correction rather than restarting
   unrelated work.
5. **Diagnose stale flags instead of trusting or ignoring them.** A false,
   missing, or stale field is a signal to trace its source of truth: compare
   the approved decision, evidence artifact, generator/source record, runtime
   contract and gate calculation. Classify the mismatch as either substantive
   missing work or a status/integration defect. Never infer that completed
   work is incomplete from a flag alone; never mark a gate complete by editing
   a flag without confirming its underlying acceptance evidence.
6. **Keep decisions distinct.** Sequence design/approval, content claim and
   item approval, implementation wiring, automated tests, rendered UI/report
   verification, and explicit student-facing release approval are separate
   states. Approval of sequencing does not imply that content is approved,
   UI tests pass, rendered behavior is verified, or content is student-visible.
   Conversely, a content or rendered-UI gate must not cause approved sequence
   decisions to be repeated. Student visibility is enabled only by its own
   applicable content, implementation, rendered-verification and release
   gates.
7. **Make every handoff resumable.** Every checkpoint and agent handoff must
   state: current stage; closed/frozen stages; exact next action; owner; inputs
   and output artifact; tests/acceptance evidence expected; unresolved
   blockers; explicitly deferred work; and work prohibited in that lane.
   “Continue from where you stopped” must point to a concrete unchecked item
   or failed gate, not trigger a new general audit.
8. **Record deferrals as deferrals.** Preserve the reason, owner/trigger for
   resumption, and scope. Do not turn a deferred task into an unresolved defect
   or silently restart it. Deferred work is not part of the active stage unless
   the user explicitly brings it back into scope.
9. **Maintain disjoint lane ownership.** For the current pilot, local work is
   the D078 guided implementation and its specified evidence/content/UI
   integration—not a new role-fit audit. The separately assigned agent owns
   the JAMB subject-matcher lane; local and other agents must not duplicate,
   redirect, or make matcher changes. The role-fit audit remains closed unless
   the user explicitly reopens it.

### Required stage-completion ledger

Maintain one row per stage in the controlling checkpoint (or link to a
versioned machine-readable ledger). Do not mark a stage complete without all
required evidence for that stage. Use `not applicable` with a reason rather
than leaving a field ambiguous.

| Stage / scope | Owner | Deliverables and exact IDs/version | Acceptance gates | Evidence, tests and result (with date) | Decision / approver | Downstream contract/status synchronized? | State | Deferred items / trigger | Next stage and exact action |
|---|---|---|---|---|---|---|---|---|---|
| Example: sequence design | Local | Link sequence design and approved route/edge IDs | All in-scope relationship dispositions and route ordering reviewed | Link review, test/report names and dated results | Approved by user / named reviewer, date | Yes/no; identify exact mismatch and owner | Complete / approved / in progress / blocked / deferred | Exact scope and resume trigger | Exact next stage/action |

Use the following status meanings consistently:

- **Complete**: stated deliverables and acceptance evidence exist and pass.
- **Approved**: the authorized reviewer/user accepted the decision; identify
  who and when. Approval does not silently approve another gate.
- **Implemented**: behavior is wired in the relevant code/data path; this is
  not proof of tests or rendered behavior.
- **Verified**: named tests or observed behavior passed at their stated scope.
- **Student-visible/released**: the separate release gate is explicitly
  approved and the deployed/runtime route is confirmed; local preparation is
  not deployment proof.
- **Deferred**: intentionally out of the active stage, with a reason and
  resumption trigger.
- **Blocked**: a concrete unmet dependency prevents the active deliverable;
  name the dependency and evidence. “Needs another audit” is not a blocker.

## Decisions to make the work coherent

### What to audit first

Create a read-only inventory of the existing canonical and student-visible records before writing the pilot. Inventory all item types and relationships together:

- knowledge, skills, tools, competencies, methods, certifications and learning resources;
- each item’s current owner: programme, domain, area of specialization (the existing subgroup/area-of-practice layer), or role;
- identifiers, labels, definitions, descriptions, source/provenance, evidence state, global/Nigeria scope, learning links, and duplicates;
- whether each externally described capability is already represented, missing, mis-scoped, duplicated, or unsupported, with the exact checkpoint affected;
- relationship edges, their typed endpoints, direction, evidence, scope, and whether they describe a prerequisite, complement, alternative, use case, or learning progression;
- what appears in the API/student view versus what exists only in canonical or audit data.

The inventory is a baseline and gap analysis. Do not promote an item because it co-occurs with a role or appears in a large legacy array. The evidence and the layer’s ownership rule determine whether it belongs in the shared foundation or a narrower branch.

### Required category-rationale gate before promotion — all domains, areas and roles

Before any reconciled or newly researched item is promoted into a learner-facing candidate set, canonical layer, seed, or enrichment package, audit its proposed category and attach an item-specific rationale. This rule applies to every domain, area of specialization/practice (the subgroup layer), and role; it also applies to existing inventory items, merged recommendations, external-search additions, and items carried forward from prior audits. Do not accept a category merely because an earlier report, script, agent, or source ledger assigned it.

For every item, the auditable record must state:

- the concrete tasks, outputs, or decisions the item supports, with exact source locators;
- the checkpoint owner and why the item belongs there rather than at a broader or narrower layer;
- whether it is a **shared/versatile foundation** (genuinely reused across the relevant supported routes), a **useful additional edge** (valuable across some routes or when a condition applies, but not needed by every route), a **conditional method/tool choice**, a **specialist area or role addition**, an **alternative**, a **complement**, **deferred**, or **not established after documented search**;
- the evidence for its breadth and applicability, including which routes/tasks it supports and the important routes or conditions where it does not apply;
- the reason a learner should see it at that level, and the evidence that rules out plausible neighboring-layer placements or false matches;
- global evidence and Nigerian context as separate claims. Nigerian examples, curriculum or regulatory details must be explicitly labelled as such and must not narrow a globally applicable category.

Use “shared/versatile foundation” only when evidence supports it as a common starting capability across the relevant downstream paths—not because it is broadly useful, appears frequently in role data, or can technically be applied there. If it benefits several but not all paths, or is only relevant for a particular research design, data type, instrument, sector or tool workflow, classify it as a useful additional edge or conditional route choice and explain that condition. If evidence supports the item but does not establish its breadth or checkpoint, keep the classification unresolved and continue research; do not force it into the nearest available bucket. “Not established” and exclusion are allowed only after the exhaustive-search record required below.

Review the full reconciled set together before promotion. Re-check merged/duplicate concepts, inherited items, and every addition against the same criteria so that one item is not omitted, double-counted, promoted too broadly, or silently treated as cumulative with an alternative. Record category totals and unresolved decisions, and ensure the written rationale agrees with the machine-readable layer/disposition. This category gate is separate from final student-display approval: even a well-categorized candidate remains hidden until its item claim, checkpoint fit, explanation, relationships, limitations and learning link pass their own evidence checks.

### What unit to build and scale by

Use both a vertical programme slice and domain-owned scaling:

1. Build the pilot as one complete programme journey: programme curriculum and outcomes → every supported domain route → each supported area of specialization → supported roles. This tests the actual student entry point and whether the downstream explanation survives each transition.
2. Store reusable domain, area and role knowledge at its proper owner. Do not copy the same domain foundation into every programme record. Programme-specific curriculum transfer and rationale remain attached to that programme’s link to the domain.
3. Implement enrichment by reusable domain/area batches, because those records are shared. Run one complete programme-to-role integration audit after the planned layers are in place; fix any concrete defect found in an active batch immediately, and queue unrelated cross-layer findings for that final audit.

**Orientation checkpoints and final integration gates:**

1. **Programme overview:** validate the programme's scope and purpose; fixed curriculum grouped into accurate, source-supported themes; student-friendly narration of outcomes that preserves professional concepts and meaning; course titles and source/page locators; theme readings and learning links; and the distinction between what the university teaches and optional downstream learning.
2. **Pre-domain entry:** validate the purpose of the browse categories and the student-facing explanation for each programme-to-domain relationship. Keep Direct / Functional / Adjacent as internal values; explain in plain language why a domain appears, show its evidence-backed programme/course connection, what transfers, what does not, and the limits. The card must orient the learner to what the domain covers and let them inspect the fuller overview before choosing.
3. **Domain overview:** validate a source-backed, learner-readable explanation of the field itself—scope and boundaries, typical work and outputs, settings and collaborators, common entry expectations, opportunities and constraints, and clearly separated global and Nigerian context. Show programme-specific inherited evidence as such; do not present it as a universal domain claim or imply that curriculum exposure equals job readiness.

Implement and source-check the programme overview, pre-domain entry, domain overview, domain learning path, area additions and role additions at their respective checkpoints. The layers are dependent in meaning, but their work does not need to stop for a complete end-to-end rendered approval of the preceding layer. Keep checkpoint-specific findings and unresolved integration items in a final verification queue; do not repeatedly redo an upstream pass unless a concrete source or data defect blocks the active downstream claim. Before canonical promotion, SQL generation/application or declaring the guided experience complete, run one integrated verification of the entire programme → domain → area of specialization → role path, including selection, relationships, sources, learning links and rendered display.

Only after all three orientation gates pass should we begin curating the **domain learning path** for student display; while those gates are being closed, domain-learning research may continue as explicitly marked review-only work.

The current Sociology domain-owned research-design item is still a local candidate, not an approved student-facing item. That display/approval status is separate from permission to continue building the remaining D078 domain learning path. Fix any source/data defect that directly affects the domain claim being authored; record unrelated programme-layer issues for the final integrated verification instead of reopening the programme work now.

**Final programme-layer verification queue:** `data/career-mapping/ccmas/social_sciences.json` and the generated Sociology curriculum contract contain GST 212 outcomes following an explicit exception note that says the environmental-sustainability outcomes belong to a distinct LIS-programme version. At the final programme pass, compare the course record with the original Social Sciences CCMAS pages and parser/provenance, then decide whether those outcomes are valid Sociology GST 212 outcomes or cross-programme contamination. Do not resolve this by inference or use the disputed outcomes as downstream learning evidence before that source check.

### Current Sociology orientation-gate audit

| Gate | Current evidence in code/data | Status and remaining check |
|---|---|---|
| Programme overview | `DegreeSkills` groups course records into themes, narrates outcomes, keeps the university curriculum fixed (not selectable extras), shows supporting course titles/source locators when expanded, and attaches only theme-matched approved readings. The Sociology pilot and focused UI tests cover the Research and evidence theme sample. | **Partial.** This verifies the sample behavior, not every Sociology theme/outcome/resource nor the rendered complete programme page. Finish a source-to-theme/outcome/resource audit and render the full overview before declaring the gate passed. |
| Pre-domain entry | `ProgrammeDomainTransition` uses narrative group headings and explanations rather than exposing Direct / Functional / Adjacent as bare labels; cards can show the domain description, reason for the connection, and course-title anchors. The D078 pilot records the selected direct Sociology connection and its scope limits. | **Partial.** Confirm the actual D078 card against its exact approved programme-domain evidence and rendered state, including that unavailable/held claims remain hidden. Do not assume the current code path proves all programme cards. |
| Domain overview | D078 has a full-name, source-backed description with NUC and ILO citation locators, plus orientation copy in `student_orientation`. The refined domain page renders the overview before its domain-foundation section. | **Not passed for final student/API approval.** Only the exact domain description has a field-specific approved evidence record and visible source links. The additional overview fields are not yet individually traceable to claim-specific evidence in the API contract; `decisionGuide` and `relatedProgrammes` are explicitly unsupported by the pilot review and must stay hidden until sourced. Global and Nigerian context, entry expectations, work settings/collaborators, opportunities and constraints still need final claim-level review. This does not block local domain learning-path implementation; it blocks final promotion/display until the integrated check closes. |

The final integration gate is about the complete learner-facing experience and its evidence—not reopening the completed taxonomy or role-fit audit. Implementation of enrichment content must remain within the currently assigned layer; this plan does not authorize new role-mapping work.

The inventory and Sociology pilot are already established. Continue the current D078 domain-learning implementation against the domain-specific inventory and the explanatory/selection/source requirements below. Record any specific evidence defect in the active layer; defer whole-route rendered acceptance until the final integrated programme-to-role verification rather than restarting the programme pass.

### Domain pre-entry card and connection categories

Before a learner enters a domain, its card must orient them rather than ask them to choose from an unexplained label. Include a concise, plain-language account of what the domain covers, the kind of work and outputs it involves, and why the selected programme connects to it; show the direct, functional, or adjacent relationship and its evidence-backed limits. Give the learner a clear way to inspect the fuller domain overview before committing to that route.

Explain why programme-to-domain connections are grouped, but use everyday narrative rather than asking students to understand classification terms. Make **Functional** and **Adjacent** clearly different: Functional means the mapped courses teach something used in some part of the field; Adjacent means the evidence shows a related idea and transferable abilities, but not a close match to the field's main work, so the learner faces a bigger step into new learning. Suggested student-facing headings: **“Your course is closely connected to this field”**; **“You learned things used in this field”**; **“This could be a new direction for you.”** Explain each in a short, conversational paragraph. Keep Direct / Functional / Adjacent as internal audit values and in staff-facing provenance, not as unexplained student terminology. Show the actual supporting course/outcome evidence on each programme-domain card. These groups explain how closely the recorded curriculum connects to the field; they do not prove eligibility, readiness, or employment. If a separate browse taxonomy groups domains, explain its own grouping principle too; do not make learners infer a domain's meaning or fit from a category name. The domain overview should then expand the orientation with scope and boundaries, typical settings and collaborators, outputs, common entry expectations, opportunities and constraints, and relevant global and separately labelled Nigerian context. Keep programme-specific transfer claims tied to the actual curriculum evidence for that programme-domain link.

## Minimum explanatory contract for every displayed item

Apply the same standard to skills, tools, certifications, methods, competencies, knowledge and resources. A card or guide entry should answer, in language appropriate to a first-time learner:

1. **What is it?** Give a short definition and expand unfamiliar abbreviations or jargon.
2. **What does it look like in practice?** Give a concrete, domain-relevant example of the activity or output.
3. **Why is it here?** Explain the supported connection to this programme, domain foundation, area of specialization, role task, or use case.
4. **What does it help the learner do?** State the practical capability or result, without claiming that one item guarantees competence or employment.
5. **What should the learner know first?** Name evidenced prerequisites and explain them in the same plain-language style. If no prerequisite is established, do not invent one.
6. **What can the learner do next?** Attach at least one verified external learning resource to every item exposed to students. Prefer a direct, appropriately levelled lesson, tutorial, course, or official getting-started guide. If no suitable resource has been verified, keep the item out of the student-facing learning guide until one is found; do not substitute an unrelated homepage or imply that a reference page is a course.
7. **What is the evidence and scope?** Retain the source, locator, date, global/Nigeria jurisdiction where relevant, and whether the item is required, useful, optional, conditional or not established for this route.

Example: do not show only “Python — useful for data analysis.” Explain data analysis as turning information such as survey answers into counts, comparisons and charts that help answer a question. Then show how Python can help clean, compare or visualize a larger dataset, what a learner can produce, and how that supports the selected route. Keep Python distinct from the skill of analysing data: knowing a programming language does not by itself demonstrate analysis competence.

### Concept expansion and relationship completeness

The explanation must cover the concepts a learner needs in order to
understand the item, not just the item label. If a tool is described as useful
for data analysis, the entry must also explain what data analysis means in
that route, what kind of information is being analysed, what the learner may
produce, and which method or competency determines whether the analysis is
appropriate. Apply the same rule when an entry uses terms such as regression,
qualitative coding, network analysis, simulation, reproducibility,
measurement, or validity: retain the professional term, then explain it with
a short practical example in the same learner-facing context.

Each displayed item must expose its relevant relationship chain rather than
leaving the learner to guess it. At minimum, the evidence-backed chain should
be represented as:

`item -> use case/task -> method or competency -> learner output -> supported domain/area/role route`.

Where applicable, also show:

`item -> prerequisite concept or skill`, `item -> complement`, and
`item -> alternative with trade-off`.

For example, a Python route may be explained as **Python -> cleaning and
summarising survey data -> quantitative data-handling method -> tables/charts
that answer a stated question -> the selected quantitative social-research
route**. The learner must be able to open the explanation for “cleaning data,”
“quantitative,” “survey data,” and “summarising” without encountering another
undefined label. A relationship is not complete merely because two items
share the same category or appear in the same inventory row.

Every relationship shown to a learner therefore needs its own plain-language
meaning, exact evidence, scope/applicability and learning link where the
relationship introduces a concept the learner must learn. Do not silently
expand a tool into a list of libraries, methods or competencies; add each
component only when its task, relationship and checkpoint are evidenced. Do
not present alternatives as cumulative requirements, and do not present a
tool as proof that the learner can perform the method it supports.

Relationship meaning and learning order are separate decisions. A
source-backed `builds_on` or `requires` relationship must remain explanatory
or advisory unless a separate sequence review explicitly marks it as an
approved hard prerequisite. Conditional prerequisites, project safeguards,
workflow steps, complements and alternatives must retain their own policy,
condition and route scope; they must not silently block selection or reorder a
learner's plan. Only an approved hard prerequisite whose route scope matches
the learner's selected programme/domain/area/role may constrain that route's
order. Missing sequence metadata defaults to advisory, not a prerequisite.

### Context must be explained at every ownership level

The same explanatory contract applies to every displayed knowledge item,
skill, tool, method, competency, certification or qualification at every
checkpoint:

1. **What it is:** define the item in learner-facing language, including the
   professional meaning that the learner will encounter in study or work.
2. **What it means in this programme:** explain whether the selected
   programme teaches it directly, develops a related foundation, or does not
   teach it and therefore presents it only as additional learning. Keep the
   curriculum evidence separate from downstream enrichment.
3. **What it means in this domain:** explain the domain problem, evidence,
   work activity or output the item supports. Do not promote a role-specific
   or area-specific item as a shared domain foundation.
4. **What it means in this area of specialization/practice:** explain the
   distinctive use, method, knowledge or output for that area. If the item is
   inherited from the domain, say what the area adds rather than copying it as
   a new requirement.
5. **What it means for this role:** explain the role task or responsibility
   that makes the item relevant, and state any scope condition. A role title,
   subgroup membership or certification name alone is not evidence of fit.
6. **What it does not mean:** state important limits, exclusions and nearby
   interpretations that could mislead a learner. For certifications, include
   the issuing body, jurisdiction, eligibility, assessment scope and whether
   the credential is required, useful or merely recognized in a particular
   context.

An item may therefore have different explanations at programme, domain, area
and role level even when its canonical identity is shared. The display must
make the current context visible, for example: “Your Sociology programme
introduces research methods; in this domain, research design connects a
social question to evidence; in this area, it may support survey evaluation;
for this role, it is used to design and report a specified study.” Do not use
one generic definition to imply that the item has the same importance or use
everywhere.

## Claim-level evidence and checkpoint validation

Translate internal taxonomy and data-model language before it reaches learners. In particular, **“task family” and “task set” are staff/developer terms, not student-facing labels**. Present the actual work in clear language such as “What you might do,” “Work you can explore,” or a short, specific description of the activity and its output. Keep internal IDs and grouping names in staff metadata only; never show them as concepts the learner needs to understand.

Keep professional concepts when they are the accurate terms learners will meet in study or work. Explain an unfamiliar or abstract concept in clear, professional language—preferably in the same sentence—rather than replacing it with a vague substitute. For example, retain “quantitative” and “qualitative” while explaining that quantitative evidence is information expressed as numbers and qualitative evidence is people's words and explanations. Use familiar examples to clarify, not to oversimplify or change the concept.

An item appearing in the inventory is not enough to justify presenting it to a learner. Validate every learner-facing claim at the exact programme, domain, area-of-specialization, or role checkpoint where it appears. For each displayed item, preserve the source and locator that establish (a) what the item is, (b) why it belongs at that level, and (c) the stated use, outcome, or relationship. The use-case explanation must be supported by the role task, curriculum outcome, domain/area boundary, authoritative professional source, or another source appropriate to that claim—not merely by the item's name, category, co-occurrence, or presence elsewhere in the inventory.

Keep the evidence trail granular: item → exact source passage/locator → owning checkpoint → learner-facing wording → any downstream route or relationship supported by that evidence. Review the wording against the source before exposing it. If evidence supports the item but not the specific use claimed, narrow the wording to what is established; if it does not support the checkpoint assignment or use, mark it review-only/not-established and keep it out of confirmed student guidance. A source-backed label must never be expanded into plausible-sounding but unverified examples, prerequisites, importance, or job outcomes.

### Source registry and confidence model

The enrichment workflow must index sources before it expands the inventory. Every
source receives a stable `source_id` and records its publisher or issuer, authority
class, source role, direct URL, exact locator, version/date, jurisdiction, scope,
access date and limitations. Source roles are kept separate: item identity/function,
checkpoint or task fit, plain-language explanation, learning instruction, and Nigerian
context. An authoritative source is evidence appropriate to a claim; it does not by
itself certify the complete dataset.

Store evidence references and separate confidence values for every displayed item and
relationship:

- identity confidence;
- domain/area/role applicability confidence;
- relationship confidence;
- sequence or prerequisite confidence;
- learning-link confidence; and
- Nigerian-context status, separated from global applicability.

Use `high`, `medium` or `low` only with a written rationale. High relationship and
sequence confidence, supported by direct evidence, is required before a relationship
is rendered as a hard prerequisite, a `needed` item or a sequence constraint. Medium
confidence may be shown as useful preparation, a complement or an exploratory route
with that wording. Low-confidence claims remain hidden from confirmed student guidance.
Never infer a relationship from co-occurrence, category membership, text similarity,
frequency or a shared source list. A strong item identity does not prove a strong
prerequisite.

The research agent marks a complete packet `agent_verified`; local marks it
`thoroughly_verified` after one complete evidence pass. Promotion, canonicalization,
graph and UI gates then check ownership, required fields, permitted status, safe
rendering and graph integrity using the verified packet. They do not repeat the same
source search. This prevents a completed evidence stage from being reopened under a
different label.

## Learning links

Use clear action text such as “Start a beginner Python lesson” or “Open the Python tutorial for data tables,” not an unexplained “click here.” Every item that appears in a student-facing checkpoint or printable learning guide must have at least one attached, externally hosted, verified learning link, presented as an accessible action/button. Verify that the destination is reachable, relevant to the item and its described use, and suitable for the learner’s stated level. A link must match what it promises:

- a course or lesson teaches a defined sequence;
- a tutorial/documentation page explains a tool or task;
- a reference supports understanding but is not described as training;
- a credential page explains the issuer, scope, eligibility and assessment, not merely a badge name.

### Video and other visual learning resources

Video learning is encouraged where it improves access, but it follows the
same evidence gate as written resources. Search for reputable free providers
such as freeCodeCamp and equivalent open educational sources, then choose a
video or playlist only when it teaches the evidenced workflow in its actual
context. A generic “learn Python” or “learn SPSS” video is not sufficient when
the learner needs Python for data analysis, Python for social-science text
analysis, SPSS for survey-data management, Mesa for agent-based modelling, or
another specific domain task. The contextual wording here is illustrative; the
selected resource must be verified against the domain's actual task set.

For every video or playlist attached to a student-facing item, record the
provider/creator, exact video or chapter/segment, URL, access/check date,
level, language, cost/access conditions, duration where useful, the concrete
task/output taught, prerequisites, and whether the resource is global or
Nigeria-specific. Verify that the resource is reachable, that it teaches the
claimed workflow rather than merely discussing it, and that its examples are
appropriate to the selected programme, domain, area of specialization/practice
or role. Link the video to the same item-to-task-to-output relationship as the
written resource; do not attach it merely because its title contains the item
name. Record scope limitations, outdated-version risks, platform or software
requirements, and any mismatch between the video and the learner's route.

Use videos as an additional learning route or a validated alternative to a
written resource, not as proof that an item is required or that the learner is
competent. Keep alternatives and complementary resources distinct. A video
may be attached only after the item claim, checkpoint fit, explanation,
relationship and learning destination pass their respective checks; an
unverified or context-mismatched video remains review-only and does not make
the item student-visible. Recheck links before release and preserve a second
accessible resource where a single creator, platform or video is a fragile
dependency.

Where practical, show level, cost/access conditions, language, platform, duration, and whether the resource is global or Nigeria-specific. Prefer a direct, relevant lesson or section over a generic home page. Distinguish evidence that an item is needed/used from a learning link that teaches it: the same source may support both only if it actually does both. Recheck links during enrichment and before release; store the destination, access/check date, level, and what the learner will find there. If an item lacks a suitable verified link, keep researching it and mark its status unresolved—not unsupported. Do not classify a candidate as having no useful evidence or permanently exclude it until an exhaustive, documented search has been completed. Student display still requires the exact claim, checkpoint fit, explanation and learning destination to pass their evidence checks; an in-progress candidate must not be presented as confirmed guidance. Do not fabricate a resource to fill a blank.

For each item shown to a learner, keep these source purposes distinct and record the exact section/locator for each: **(1)** an authoritative source explaining or demonstrating what the item/task does; **(2)** evidence that the task belongs at the selected programme, domain, area-of-specialization or role checkpoint; **(3)** a separate accessible explanation when the authoritative source is too technical for the learner; and **(4)** a free, task-specific learning resource that teaches the relevant use. A single source may fill more than one purpose only when it genuinely supports each claim. A product homepage or API reference is not automatically a learning resource; a general “learn Python” course is not a task-specific resource. If a suitable free resource cannot be verified, continue the documented search. Only after that search is exhausted may the item be dispositioned as unsupported/not established and excluded from student display; do not use a generic link to make the audit look complete.

Before finalizing a domain learning path, complete a source-backed task-set inventory for **every** area of specialization/practice and every role in that domain, at the same depth as the domain-level search. Use task evidence to identify what each downstream route actually does, then reconcile shared foundations, area additions, role-specific additions, complements, alternatives, prerequisites and limits across the whole route. This lets the domain path be structured against its actual downstream branches instead of guessing what is shared. Do not treat this sequence as role-fit adjudication: it is a learning-content and task-context inventory for already established routes. Keep unresolved tasks and items actively in the research queue; do not label them unsupported or close them without the exhaustive-search record. Do not present them as confirmed student guidance before checkpoint evidence and learning links are verified.

### External enrichment and candidate-gap validation

Use externally published roadmaps—including the pasted autonomous-vehicle roadmap—as discovery prompts, not as ground truth. Compare each named skill, method, tool, knowledge area, competency, standard, and suggested sequence against the inventory and the exact programme/domain/area/role checkpoint. Record candidate gaps and possible misplacements; do not add an item merely because the roadmap names it or because it sounds plausible. Validate each candidate with sources appropriate to the claim: standards bodies for standards/definitions, maintained project documentation for actual stack components, professional bodies or recognized curricula for practice boundaries, and credible learning providers for instruction. Prefer primary sources and triangulate important or contested claims. Record source title/URL, exact section or passage, access date, claim supported, scope/limitations, and the checkpoint decision. If evidence supports a concept but not the proposed sequence, use-case, or checkpoint, narrow or reject that part of the roadmap rather than importing it wholesale.

#### Required depth: search every domain and every item category

The omission search must also deliberately check for current, emerging and
experimentally developing task sets—not just established textbook practice.
Record the maturity of each claim (`established`, `emerging`, or
`experimental`) and distinguish an evidenced research use from a plausible
future use. Emerging and experimental methods may be shown as conditional or
exploratory edges when their evidence and limitations support that treatment;
do not present them as routine requirements, substitutes for human evidence,
or guarantees of future employment. For AI-assisted work, specify the task,
human validation, disclosure/reproducibility needs, privacy and bias risks, and
the conditions under which the use is inappropriate. Perform this scan
independently at the domain and each area/role checkpoint; a tool already
present in an inventory does not prove that its task set, workflow or
downstream relationships have been adequately enriched.

**Source-search coverage register:** each enrichment lane must maintain a
search log, not just a list of cited sources. Record the relevant official or
primary body/framework, professional association, occupational/education
framework where relevant, methods/standards guidance, tool/framework official
documentation, research-centre source, and Nigerian academic/professional/
regulatory source where it adds context. For each search, record the body and
exact page/document/locator, the task or claim supported, jurisdiction,
access/date state, limitation, and whether relevant material was found or a
documented no-hit resulted. Search established, emerging and experimental
practice; include AI-assisted workflows where evidenced. A broken, paywalled,
generic, or non-instructional link must be labelled accurately and cannot be
counted as a verified free task-specific learning resource. A missing Nigerian
counterpart never disqualifies a globally relevant task. The checkpoint must
make the coverage and remaining search gaps auditable.

**Lane-owner self-audit before handoff:** the person or agent who enriches a
domain/area lane must check every candidate's cited evidence and learning URL
before marking that lane ready for local reconciliation. Confirm the link is
accessible; the exact locator exists; the source directly supports the stated
task, item and limitation; evidence strength and jurisdiction are labelled
correctly; and any learning link is free/accessibly usable and specific to the
task rather than generic. Include a source-by-source coverage table, duplicate
check and machine-readable schema/count validation. **No unresolved handoff:**
before a lane is handed to local, investigate every record or field marked
`review-only`, `unresolved`, `open`, `hidden`, missing-source, or resource-gap.
Repair and verify it where evidence supports the claim. If exhaustive searching
does not establish the claim or a suitable learning resource, close it with a
final, evidence-backed `not established`/unsupported disposition, keep it
hidden, and state the exact search scope, result, reason and evidence that
would change the disposition. Do not leave placeholders, unexplained hidden
items, open search queues, or unresolved statuses in a completed lane handoff;
do not force visibility merely to empty the queue. A lane is ready only when
every flagged record has a completed, justified disposition. The agent must
continue its assigned lane until this gate passes. Local reconciliation then
checks consistency and ownership across lanes, deduplicates against the current
inventory and other lane outputs, resolves relationships, and rebuilds/verifies
the integrated learning-path graph. This evidence QA does not reopen
role-to-domain or role-to-area fit adjudication; those routes remain as already
reviewed unless a separate task explicitly authorizes that audit.

This is a catalogue-wide requirement, not a D078/Python-only enhancement. For each domain and each area of specialization/practice and role, search for context-relevant omissions across knowledge, skills, tools, methods, competencies, certifications/qualifications, and learning resources. Reconcile candidates against the current inventory and record whether each is already covered, genuinely missing, duplicated, outdated, misclassified, misplaced to another checkpoint, unsupported, or unresolved. The search must be broad enough to uncover established practice and relevant newer tools, but the result must remain bounded by the domain's supported scope; do not manufacture a quota or imply that every plausible item is universal.

For programming, software, data, and other technical workflows, audit the ecosystem beneath a broad label. If the evidence says a language such as Python supports a task, check which libraries/packages/frameworks are actually used for that task and whether other tools are valid alternatives. Map each supported workflow as **language/platform → library/tool → method/task → learner output → domain/area/role checkpoint**. Verify each library's identity and task from maintained or primary documentation; verify why that task belongs at that checkpoint from suitable professional/academic evidence; separately verify an instructional link and its level/access. Record prerequisites, dependencies, complements, alternatives, version/license/access limits, and whether the component is shared, optional, conditional, or specialization-owned. Do not write “learn Python” when the evidenced workflow depends on a more specific stack, and do not list a package simply because it can technically be used.

The D078 social-sciences example illustrates the method, not a universal stack: distinguish tabular data work, plotting, graph/network analysis, text analysis, and simulation; then assess candidates such as pandas, Matplotlib, NetworkX, Mesa, or Casevo for the specific workflow. Their presence must not imply that every social-science learner needs them or that tools replace research design, interpretation, ethics, or method competence. Use the same depth appropriate to each other field—for example, check domain-relevant libraries, standards, equipment, software extensions, methods, credentials, and non-software tools elsewhere. Keep global evidence distinct from explicitly Nigerian requirements/context.

### Required depth for every domain enrichment pass

The D078 deep-search and workflow-gap checkpoints establish the minimum depth
for all domains. This does **not** mean that every domain must contain the same
methods or number of tools. It means that every domain must undergo the same
complete search and reconciliation process, with its breadth determined by the
field's actual scope and practice.

For each domain, the enrichment pass must:

1. **Inventory the complete starting state.** Record every existing knowledge,
   skill, tool, software ecosystem component, method, competency,
   certification/qualification and learning resource, together with its owner
   (domain, area of specialization/practice or role), current label, definition,
   source, locator, date, scope, relationship edges, link status and duplicate
   identities. Legacy role-derived frequency is discovery evidence only; it is
   never proof of domain ownership.
2. **Search the whole practice workflow, not just the current labels.** Use a
   domain-specific coverage matrix for concepts and work stages such as:
   question/problem framing; theory or knowledge base; design and planning;
   measurement or specification; sampling/selection; data or material
   acquisition; field/lab/production practice; analysis/model/testing;
   validation/quality/safety/ethics; documentation and reproducibility;
   communication/reporting; collaboration; and evaluation/implementation where
   the field uses it. For non-research domains, translate these stages into
   the field's real workflow instead of forcing a research template.
3. **Use multiple authoritative source lanes.** Search current professional
   bodies and standards/credentialing organisations for boundaries and
   competencies; recognized curricula or academic centres for established
   methods and specialisms; maintained official project/vendor documentation
   for what tools actually do; occupational/practice sources for tasks and
   outputs; and credible instructional providers for learner resources. Search
   global sources first, then conduct a separately labelled Nigeria-context
   pass for local institutions, regulation, licensing, infrastructure,
   terminology and practice. A single vendor page cannot establish field-wide
   importance, and a Nigerian source cannot narrow global domain scope.
4. **Triangulate candidate gaps.** For every proposed addition, record the
   candidate's exact identity and current status, at least one source for what
   it is/does, a separate source for why it belongs to the domain or checkpoint
   where needed, and a learning source if it will be shown to students. Search
   for alternatives, complements, exclusions, obsolete names, version changes,
   licensing/access conditions and neighbouring-domain false matches. Record
   “not found after the stated search” separately from “not established” and
   never fill a gap with a plausible invention.
5. **Assign the correct layer.** Decide whether an item is shared across the
   domain, useful but conditional, an area-of-specialization/practice addition,
   a role-specific addition, an alternative, a complement, unsupported or
   unresolved. A method, tool, certificate or skill can be real and important
   without belonging in the shared foundation. Preserve multiple valid routes;
   do not turn alternatives into cumulative requirements.
6. **Map the usable context.** For each retained item, write the concrete
   learner use case, what it enables, what it does not enable, expected output,
   evidence-backed prerequisites/dependencies, complementary items,
   alternatives, limitations and route(s) supported. Separate method
   competence from operating a tool; software never substitutes for design,
   ethics, interpretation or observed evidence.
7. **Build a useful resource bundle and verify every destination.** Each item
   proposed for student display must have (a) an official or otherwise
   authoritative page that establishes what the item, method, framework,
   credential or practice is; and (b) a relevant learning destination. Prefer
   a free, task-specific resource when one exists. Search for a suitable video
   lesson too—including YouTube and credible university/professional video
   libraries—when it teaches the actual use case rather than the generic tool.
   If exhaustive searching finds no suitable free learning resource, do not
   leave the learner with an official landing page alone: add a relevant paid
   course/book/resource as an explicitly labelled alternative, with its
   provider and current access/pricing caveat. A paid option complements the
   official reference; it does not replace it. Where both free and paid/video
   options are useful, show them as alternatives, not cumulative requirements.
   For every destination record access/check date, level, cost/access and
   language notes where known, plus the exact section, lesson or video locator.
   A product home page, paper abstract or reference manual may support identity
   but is not automatically instruction. If a suitable resource is not yet
   found, keep searching and mark the work `research_in_progress`; a missing
   link is not evidence that an item is unsupported. Only after exhaustive
   searching may a final `not established` disposition be used, and only when
   the item's usefulness or a safe, usable learning route cannot be established
   with evidence. Confirmed student display still requires all applicable
   claim, checkpoint and resource checks to pass.
8. **Preserve evidence at claim level.** Store the chain
   `item → exact source passage/locator → owner/checkpoint → learner wording →
   use case/output → relationship/route → learning link`. Narrow the displayed
   claim when the source supports less than the proposed wording. Global and
   Nigeria-specific evidence must never be merged into one uncited statement.
9. **Produce an auditable checkpoint.** Each domain batch must save a Markdown
   review and machine-readable ledger containing: search categories; sources
   checked by category; candidate and existing-item counts; retained,
   corrected, relocated, duplicated, deferred, rejected, unsupported and
   unresolved totals; broken/outdated-link totals; Nigerian-context totals;
   the final domain/area/role disposition table; and the remaining queue. Save
   incremental checkpoints during a long pass and a substantive completion
   checkpoint after all search lanes have been attempted. A checkpoint is not a
   reason to stop while work remains.
10. **Run the final domain gate.** Before promotion, independently check that
    the domain overview, foundation, areas and roles do not contradict one
    another; every displayed relationship has evidence; every item has the
    right owner; alternatives and prerequisites are not silently conflated;
    student language is faithful and understandable; every displayed item has
     a verified learning link; unresolved candidates remain explicitly in
     progress and are not misreported as unsupported, while items with no
     supported usefulness after exhaustive search are excluded rather than
     presented as facts. Regenerate downstream only after the evidence ledger,
    learner copy, relationships and resource links pass this gate.

The D078 examples now serving as reference checkpoints are
`D078_SKILLS_METHODS_DEEP_SEARCH_CHECKPOINT_2026_10_08.md` and
`D078_DOMAIN_WORKFLOW_GAP_AUDIT_2026_10_08.md`, with their JSON ledgers in
`data/career-mapping/_audit/`. They demonstrate the required evidence depth,
not a universal Social Sciences tool list. Future domain passes should be
judged against this process and these audit fields, while retaining only the
methods, competencies, tools, qualifications and resources actually supported
by that domain's own evidence.

### Extend the same depth to areas of specialization and roles

**Independent area-enrichment requirement:** a domain enrichment pass does not
count as completion of the area-of-specialization/practice layer. For every
finalized area, perform a separate, area-owned search and evidence pass across
its task families, knowledge, skills, methods, tools and tool ecosystems,
competencies, certifications or qualifications, prerequisites, complements,
alternatives, limitations and task-specific learning resources. Use global
professional and academic evidence as the baseline and add Nigerian sources
where they provide local context; the absence of a Nigerian source must not
disqualify globally established practice. A domain item may be inherited only
when evidence shows that it is genuinely shared; otherwise assign it to the
area or role where its task and output are supported. Do not treat an area
boundary, legacy subgroup record, role occurrence or domain inventory label as
proof that the area has been enriched.

The area pass must preserve the same learner-facing contract as the domain
pass: for each item, explain what it is, what it means in the selected
programme and domain, what it adds in the selected area, how it supports an
evidenced task or output, what it requires or complements, valid alternatives,
what it cannot prove or replace, and a verified explanatory and task-specific
learning link. Area records remain hidden until these claim-level,
checkpoint-fit and resource gates pass. Area-owned records must then be joined
to the typed learning-path graph before route sequencing; they must not be left
only in a prose review or an unconnected candidate ledger.

The contract above applies at **all three downstream layers**, not only to the
domain:

- **Domain:** establish the shared foundation and its boundaries. Show what is
  genuinely useful across the field and what is conditional or specialist.
- **Area of specialization/practice:** independently verify what work belongs
  in that area, how it differs from sibling areas, and what it adds to the
  domain foundation. Audit its own knowledge, skills, tools and ecosystems,
  methods, competencies, certifications/qualifications and learning resources.
  Do not treat an item as area-owned merely because it appears in a role record
  or in the domain inventory. Inherited foundation items and area additions
  must remain visibly distinct.
- **Role:** audit the actual work tasks, outputs, responsibilities, tools,
  methods, competencies and qualification expectations against both the parent
  domain and the area of specialization/practice. A role may have more than one
  justified area or domain route, or a justified direct domain route. Preserve
  each supported route separately and record the evidence and scope for each;
  do not infer fit from an occupational subgroup, a name match, a frequency
  count or an area membership alone. Do not create roles to meet a quota.

At the area and role layers, repeat the same search lanes, candidate
dispositions, source/locator chain, learning-link verification, global/Nigeria
separation, alternatives/complements check and unresolved queue. The required
trace becomes:

`item → exact source passage/locator → domain boundary → area boundary or role task → displayed wording → supported route/relationship → learning link`.

For each area and role batch, the checkpoint must additionally report:

1. inherited domain items versus genuinely new area/role items;
2. sibling-area or neighbouring-role false-match checks;
3. direct, area-mediated and multi-route dispositions;
4. tasks and outputs that justify the role-to-domain and role-to-area link;
5. items rejected because they fit the area label but not the actual domain or
   role work; and
6. roles or areas with sparse evidence, with a documented search scope and a
   fail-closed student-display decision.

“Complete enrichment” therefore means that the domain, every area of
specialization/practice and every role in scope has passed the same evidence
and gap-search process—not that every layer receives every item or that every
possible product, method or job title is listed. A role can be globally
established but locally unavailable; a Nigerian context record can add local
practice without replacing the global role definition. Both statements must be
labelled separately and sourced separately.

Deliver an auditable search record for each domain batch: categories and use cases searched; authoritative and instructional sources consulted; per-candidate disposition and exact locator; missing areas of evidence; and an explicit residual/unresolved count. A blank category is not evidence that the category was searched and found irrelevant. “No established item found” is an acceptable result only when the scope and sources checked are recorded. Student display remains fail-closed: a discovered candidate with unresolved checkpoint fit, explanation, relationship, or learning link stays in review rather than being described as fact.

For example, the supplied AV roadmap is a useful checklist of candidate topics, not a validated curriculum. An initial local spot-check finds some overlap in the existing AV role records (including computer vision, sensor fusion, PyTorch/TensorFlow, C/C++, RTOS, ROS, and sensor integration); this is not yet evidence that the current guided inventory explains or teaches them correctly at the right checkpoint. The current contextual-item builder emits only skills and tools, so methods, knowledge, competencies, certifications, and learning resources still need explicit inventory/contract coverage rather than being assumed present. Official [Autoware architecture documentation](https://autowarefoundation.github.io/autoware-documentation/1.5.0/design/autoware-architecture-v2/roadmap/autonomous-driving-stack-architecture/) describes sensing, perception, localization, planning and control; [CARLA's official ROS bridge documentation](https://carla.readthedocs.io/projects/ros-bridge/en/latest/) documents sensor data and control integration; and [SAE J3016](https://saemobilus.sae.org/standards/j3016_202104-taxonomy-definitions-terms-related-driving-automation-systems-road-motor-vehicles) defines driving-automation levels. These sources validate only those bounded claims; they do not by themselves establish that every listed algorithm, library, standard, hardware platform, or level-by-level learning sequence is mandatory for every AV learner. Compare and validate each candidate separately before presenting it.

## Curriculum inheritance and the selection boundary

University curriculum and outcomes are fixed programme evidence, not selectable
extras. At the programme level, render the source-backed curriculum grouped by
curriculum themes, and render its outcomes separately as learner capabilities or
actions rather than repeating every outcome as another course-content choice.

When the learner opens a domain from a programme, carry forward only the
programme course anchors and outcome evidence that support that specific
programme-to-domain connection. Label this stage **Already covered for this
field**. Do not turn that inherited evidence into a domain claim when the source
only supports the programme, and do not ask the learner to select it again.

Then show what the domain adds, followed by the selected area-of-specialization
additions and, where applicable, role additions. Selection starts at these
additional, approved contextual items—not at what the university already teaches.
The learner can choose the supplemental skills, tools/use-case groups, methods,
competencies, certifications and learning resources to include in a focused
report, with alternatives and complements explained. The preview must make the
sequence visible: **already covered by the programme → domain adds → area adds →
role adds**. If programme evidence for a domain is not established, say so rather
than importing or inventing curriculum coverage.

### Programme reading and theme resources

Reading belongs to the programme checkpoint when it explains the curriculum
the learner is already studying. A theme may therefore have several attached
`programme_reading` resources: for example, an open learning text, a
recommended reference book, a journal or official professional reading. The
resource is attached to the programme and carries an explicit `theme_key` in
its provenance so it appears only under the theme it actually supports. It is
not copied into the domain, area or role inventory merely because the same
subject appears downstream.

Books such as Giddens or Haralambos and Holborn should be recorded here as
bibliographic learning resources, with author, edition/year, ISBN when known,
chapters or theme covered, provider/publisher, access route and the evidence
scope. A book may be labelled **prescribed/required** only when the relevant
university, department or authoritative course reading list explicitly says
so. Otherwise label it **recommended reference**, **open foundation reading**
or **find through a library/publisher**. NUC/CCMAS curriculum evidence proves
what the programme teaches; it does not by itself prove that a particular book
is prescribed by every Nigerian university. Nigerian-specific recommendations
must retain the named institution or source scope rather than being presented
as universally approved.

The student card should distinguish “read this to understand the theme” from
“learn this supplemental item”. Programme readings are not selectable
supplemental learning and do not enter the focused extra-learning report. An
approved URL may point to an open full text, publisher page, library catalogue
or other lawful access route; the interface must describe which one it is and
must not imply that a catalogue or publisher page is a free course. A print
book with no verified access route can remain in the programme/admin inventory
but stays hidden from the student card until a safe destination is recorded.

### Theme narration and material placement

Do not build a student theme around one course code when the curriculum treats
the capability as a progression across courses. Group the relevant source-backed
course records under a clear theme/use case, then narrate the combined outcomes
in student language. Preserve each course, original outcome, display group and
locator separately in the underlying data and in the expanded “course areas
behind this explanation” panel. The concise theme card may hide codes; opening
it must reveal the exact curriculum anchors so the narration can be audited.

Attach reading to the theme whose published contents match it. Show a compact
resource card with a scope badge, title, why it helps for this theme, provider
and access/terms note, followed by a button-style external link such as “Open
material.” Do not make the link look like a Sifter lesson if it opens a book
catalogue, publisher listing or external courseware PDF. Nigeria-specific
materials must name the Nigerian institution/publisher and must not be described
as universally approved or prescribed unless a national or institution-specific
source actually says so. For example, official NOUN courseware can be shown as
NOUN courseware/reference; its scope, age and educational-use terms must remain
visible. A publisher page can establish a textbook’s level and contents, but
does not prove that a Nigerian university prescribes it.

The theme outcome synthesis should read as a coherent capability narrative,
not a raw numbered list or an item-selection checklist. Keep the source-backed
outcome records visible in the expanded evidence view. The theme summary must
not add a requirement, progression order, assessment or learning claim that is
not supported by its grouped curriculum outcomes.

## Selection and comparison

Selection is how the learner chooses both a route and the learning focus within it. After choosing a preferred domain, area of specialization and, if useful, role, the learner can choose among the relevant skills, tools and their use-case groups, methods, competencies, certifications and learning resources. These are meaningful choices only when the learner has enough plain-language context to understand what each item is for, what it helps them do, and how it connects to the other choices. Do not assume learners already know the terminology: explain it before asking them to select it. The result is a focused, printable plan reflecting the learner’s chosen route and content—not every item attached to that route. The same selections give admins a clear view of what the learner wants the programme or support plan to focus on.

This is preference-setting, not a knowledge or progress assessment. Do not ask learners to mark items as “I know this,” “I want to learn this,” or “completed” as part of selection. A selection means “include this in the learning focus/report I am choosing”; it says nothing about the learner’s current knowledge or progress. The experience may present evidence-backed required, useful, optional and alternative relationships as guidance, but must not treat a selection—or a learner’s unfamiliarity with an item—as evidence of mastery or lack of mastery.

Relationships make granular selection understandable and actionable. For each choice, show its use case, what it enables, what it depends on or complements, and whether another item is a valid alternative. Explain how the selected combination contributes to the chosen area or role and what the resulting learning guide will cover. Let learners inspect and deliberately include prerequisite content; do not silently add every related item or turn alternatives into cumulative requirements. If multiple supported combinations lead to the same chosen direction, explain and compare them so the learner can choose what to focus on. Recompute the route preview and printable report whenever domain, area, role or granular selections change. Keep the canonical curriculum and evidence records unchanged by a learner’s selections.

Comparison applies to all item categories, not tools alone. Compare items only where they serve a comparable use case. Explain the difference in purpose, outputs, strengths, limits, prerequisites, access/cost, jurisdiction, and learning route. Mark alternatives as choices and complements as things commonly used together only when evidence supports those relationships. A comparison must not silently turn two alternatives into two mandatory requirements.

### Selection persistence and aggregate learning-interest intelligence

Granular selection is also a structured product signal, but it must remain
separate from mastery, completion and canonical evidence. The current guided
implementation saves the learner's selected item identities, route-separated
snapshot, order and personal removals. The backend must preserve the same
stable item, item type, use-case, programme, domain, area and role context so
an administrator can understand exactly what the learner chose. It must not
trust a client-supplied category or infer demand from a raw display label.

After the D078 route and report flow pass their final verification, add the
consent-aware selection-intent and aggregate-reporting workstream specified in
`docs/manual-review/D078_GRANULAR_SELECTION_ANALYTICS_AND_PRIVACY_PLAN_2026_10_10.md`.
It must support idempotent save/edit/remove, unique-learner counts, explicit
time windows and denominators, learner stage and permitted broad context,
multi-selection rules, role-controlled admin access, audit logs and minimum
cell suppression. External or ministry-facing output must be aggregate-only;
it must not expose names, student IDs, raw snapshots or re-identifiable small
groups. A statement such as “70% of Lagos SS1–SS3 learners selected Python”
is invalid unless the report also states the consenting population, period,
route/item definition and denominator. Saving a personal plan remains
available independently of optional analytics consent.

This is a downstream analytics/privacy phase, not a reason to reopen role-fit
adjudication. Queue the aggregate API, migration, admin dashboard and
deletion/suppression tests until the D078 programme → domain → area → role
implementation is verified.

## Relationship matrix

Every relationship is a first-class, directional, evidence-bearing record with typed endpoints, route/context, explanation, and applicability state. The matrix must support at least:

| Relationship | Learner-facing meaning |
| --- | --- |
| `used_for` / `supports` | This item helps with this task, outcome, use case, area or role. |
| `requires` / `builds_on` | Learn or practise this first because the next item depends on it. |
| `complements` | These items are used together for the stated task. |
| `alternative_to` | Choose between these options; show the practical trade-offs. |
| `assessed_by` | This assessment or evidence demonstrates the stated capability. |
| `recognized_by` | This authority or jurisdiction recognizes/issues the credential under the stated conditions. |

No relationship is inferred from co-occurrence, category membership, text similarity, or a role’s presence in a subgroup. The explanation must say what the edge means for the learner and name the evidence that supports it.

## How learning gaps should appear

Do not display a standalone “Gap in this area” or `Gap:` row. Keep gap detection as an internal comparison if needed, but present the result inside the selected route’s learning guide as a sequenced explanation:

- what the programme already teaches;
- what is partly covered and what needs practice or depth;
- what this selected area or role adds, with the reason and prerequisite order;
- optional extensions and supported alternatives;
- what has not been established by the available evidence.

Use headings such as **Already covered**, **Build on this**, **Learn next for this route**, and **Optional extension**. Each next step must say why it comes next and what it enables downstream. The guide should not imply that every unlisted topic is a deficiency or that completing the list guarantees job readiness.

## Pilot and rollout gates

The pilot is ready to implement only after the inventory and route choice above are complete. It passes when:

1. The actual programme curriculum and outcomes remain faithful to their sources and are clearly distinguished from added learning.
2. Domain foundation items are genuinely shared across supported routes; area and role items explain their additions without duplicating inherited items as new requirements.
3. All six capability/content types (skill, tool, competency, certification, method, knowledge) and learning resources receive the explanatory treatment above where they occur; missing types are reported, not fabricated.
4. Every displayed relationship has typed endpoints, a clear learner explanation and supporting evidence.
5. Selection and comparison correctly distinguish alternatives, complements and cumulative learning, and preserve route-specific effects.
6. Every learning link’s label, level, access and content match the destination.
7. Every student-displayed item has a verified resource bundle: an authoritative reference plus relevant instruction (free where available; otherwise a clearly labelled paid alternative after exhaustive search). A task-specific video may be included as the free or supplementary learning route. Record access, cost, level and locator; never present an official/product page as if it teaches the skill. A missing link means continue enrichment, not hide or reject the item.
8. Candidate gaps found by comparing external roadmaps with the inventory are independently verified and assigned, narrowed, or rejected at the exact checkpoint; a roadmap alone is not authority.
9. Global and Nigeria-specific claims remain separately scoped and sourced.
10. “Gap” findings are woven into the route learning guide, with no standalone specialization-gap row.
11. The rendered student flow and admin provenance view agree with the same versioned records; uncertain claims are not presented as confirmed requirements.
12. The pilot is checked through all programmes linked to its shared domain records before the pattern is scaled.
13. Every student-facing statement is traceable to evidence at the exact checkpoint where it is shown; item presence alone does not validate its explanation or use.
14. Runtime display fails closed unless claim review is approved, each displayed claim has exact source references and locators, and the item has a verified external learning link.

## Local implementation checkpoint

The additive claim-validation migration, contextual-item builder contract, API gate, and student-list gate have been prepared locally. The gate separates `claim_review_state` from source provenance/ownership and requires claim evidence for item identity, checkpoint fit, plain meaning, contextual use, and any displayed expected output or learning priority. It also requires a linked URL with source metadata and an access/check date. Existing and newly generated contextual rows default to `review_required`; no row is approved merely because its source record exists or because a candidate link was found. The UI also supports the planned `method`, `knowledge`, and `resource` item types but will not display them without the same evidence and link gate.

The gate is now enforced on all current API item paths, including programme-owned items returned with JAMB guidance. A shared client-side predicate mirrors the exact checkpoint-evidence and link requirements, and the legacy foundation-skill, tool-group, and certification cards require that predicate before rendering. Thus a raw legacy name, skill URI, tool URL, or certification record cannot bypass the item review. The programme endpoint now includes claim/link review metadata and filters out rows without approved claim evidence and a verified HTTPS learning destination. The domain/area/role API gate is aligned to HTTPS-only links as well; a focused regression test prevents an HTTP URL from passing that checkpoint gate. The new focused TypeScript predicate tests are checked in; the existing backend student-guidance contract tests pass (5/5), and the modified Python route compiles. ESLint reports zero errors (three pre-existing array-style warnings in `ToolGroupsBlock`). Full TypeScript checking previously exhausted the local Node heap, and Jest could not start because this checkout cannot resolve its configured `jest-expo` preset; these environment limitations remain open validation items.

This is a safety contract, not completion of the enrichment. The next local content step is to curate one complete end-to-end programme route with claim-level evidence, plain-language explanations, and working learning links; validate every programme/domain/area/role checkpoint and relationship; then expand in batches. The migration and generated SQL have not been applied to Supabase.

The first content-design sample is documented in `docs/SOCIOLOGY_GUIDED_EXPERIENCE_PILOT_2026_10_08.md`. The programme preview groups the research theme across SSC 302, SOC 301, SSC 401 and SOC 408; gives learners narrated practice paragraphs; and reveals course-by-course learner wording, original CCMAS wording and source locators. Programme readings are theme-scoped and link to verified destinations. Three fixed programme-theme explanations with exact claim locators and learning-resource metadata now have a deterministic SQL generator, additive schema, fail-closed API contract, and expanded programme-theme UI. The focused ledger/API and UI suites pass. They remain local artifacts: no SQL has been applied. The separate downstream contextual-item inventory still has no approved rows, so its supplemental domain/area/role knowledge, method and ethics claims must not be inferred from the programme-owned sample. Domain-owned foundations are not inferred from programme curriculum, and no course item is silently re-owned downstream. Learner focus selection applies only to approved supplemental items; programme curriculum, outcomes and theme readings remain fixed programme evidence, not selectable extras.

## Work sequence

The consolidated D078 screen, state, transition, inheritance, selection,
comparison, report and admin-parity contract is recorded in
`docs/manual-review/D078_GUIDED_EXPERIENCE_FLOW_AND_STATE_PLAN_2026_10_09.md`.
Use it as the implementation-level companion to this plan and the controlling
specification; it does not approve review-only content or replace the evidence
gates.

1. Reconcile the three design inputs and record any remaining product decisions.
2. Produce the full typed-item and relationship inventory and identify student-visible versus audit-only records.
3. Select the representative end-to-end programme pilot using coverage of item types, relationship types, route variety and source quality.
4. Complete and review the pilot's programme overview, then its pre-domain-entry cards, then the domain overview—in that order—with the relevant source, locator and learner-copy checks at each checkpoint.
5. Continue the domain learning path, then area-of-specialization and role layers, using the exact evidence and relationship gates above. Research every candidate to a defensible disposition; do not blanket-close or label unfinished items unsupported. Keep items out of confirmed student guidance until the applicable claim, checkpoint and learning-link checks pass. Close the orientation gates and rerun the full learner-visible route together in one final integrated verification before canonical promotion or SQL deployment.
6. Implement granular selection and printable learning-focus output only for approved supplemental learning items; curriculum and outcomes remain fixed programme content.
7. Scale by shared domain/area batches, rerun all affected programme routes and admin provenance checks, then generate local seed artifacts after validation. Treat them as local until the user applies SQL and confirms live counts.

The subject-matcher workstream is explicitly deferred until the Sociology guided-experience pilot is complete. Its 2026-10-08 checkpoint is `docs/manual-review/JAMB_SUBJECT_MATCHER_RELEVANT_SCOPE_CHECKPOINT_2026-10-08.md`; do not resume matcher implementation during this pilot. Keep matcher changes out of programme-theme and domain-enrichment work.

## Implementation-order clarification after the tray pass (2026-10-09)

The implementation-level companion for current UI/state behavior is
`docs/manual-review/D078_GUIDED_EXPERIENCE_FLOW_AND_STATE_PLAN_2026_10_09.md`.
The granular interaction details are recorded in
`docs/manual-review/D078_GUIDED_EXPERIENCE_GRANULAR_UX_AUDIT_AND_MOCKUP_2026_10_09.md`.
Together, these documents refine this plan; they do not replace its evidence
gates or approve review-only content.

The tray and stop-point pass is now complete at the local model/component
level. The next line of work is **not** another programme review and not role
fit. It is the first populated D078 client fixture: wire the approved/empty
states into the programme overview → pre-domain entry → domain overview →
area-stop route, then test route preview, comparison, save/reopen, print and
privacy-safe sharing. The fixture must keep programme curriculum fixed and
must only allow approved supplemental items into the tray.

The route may be saved at programme/domain without an area or role. In that
case the plan contains the programme context and domain foundation only; the
available areas are shown as advisory options with a disclaimer, and no
area-specific or role-specific details are imported. An area selection adds
the area layer; role details are added only after an explicit role selection.
Alternatives and complements remain attached to the layer where they were
chosen, and multiple route stacks remain separate in the report.

The remaining order is therefore: close the three orientation-gate checks at
the rendered fixture level; populate the D078 domain foundation with approved
source-backed items; validate the area-stop inheritance and item relationships;
then add optional role branches; finally run one integrated programme-to-role
verification before any canonical promotion or SQL generation/application.
