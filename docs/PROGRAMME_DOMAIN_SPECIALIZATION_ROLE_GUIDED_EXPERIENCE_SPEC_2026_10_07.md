# Programme → Domain → Area of Specialization → Role: Guided Experience Specification

**Status:** Product decision and implementation contract for review  
**Date:** 2026-10-07  
**Terminology:** In this product, **subgroup = area of specialization = area of practice**. They are one intermediate layer between a domain and its roles. “Subgroup” is the current internal/schema term; student-facing copy should say “Area of specialization” (or “Area of practice” where that reads more naturally), not present these as separate levels.

## Purpose and source boundary

This specification translates the user-provided guided-experience brief in `C:\Users\USER\.codex\attachments\a7d7534e-b118-4bf9-a220-780ff282984b\Pasted text.txt` into product and data decisions. The pasted brief is design input, not independent evidence for occupational, curriculum, market, or regulatory claims. Career and curriculum facts shown to students still need their own source records and review status.

The flow is:

```text
JAMB programme → linked CCMAS/external curriculum → domain(s) → area(s) of specialization/practice → role(s)
```

The curriculum is the learner’s starting context, not proof that the learner already has every downstream skill. A programme can link to multiple domains using `direct`, `functional`, or `adjacent` relationship labels; every relationship needs a concise explanation grounded in the programme’s actual courses/outcomes and the domain’s scope.

## Product decisions

1. **Domain foundation means broadly transferable entry-level preparation, not universal job qualification.** Show only requirements supported as shared across the domain’s entry routes. Rank “highly versatile foundation” separately from “useful advantage”; do not imply either guarantees employment.
2. **Branch-specific learning is additive.** Each area of specialization explains its work and boundaries, then shows what it adds to the domain foundation. Each role adds its task-specific requirements. A role with no justified area route is shown as `Domain → Role`, not forced under an unrelated area.
3. **Use-case groupings are the primary way to organize tools.** For example, show a use case and the tools that can serve it; label alternatives and meaningful complements. Use themes only when a comparison set would be misleading.
4. **Separate item type from relationship.** Skills, tools, competencies, certifications, methods, and learning resources are distinct typed items. Their connections are explicit typed relationships—not prose-only inferred associations.
5. **Keep global and Nigerian context visible but distinct.** Global practice is the baseline. Nigeria-specific licensing, institutions, regulation, availability, or local practice is explicitly labelled “Nigeria context”; it must not replace or narrow the global view. Every contextual claim has its own source and date.
6. **Make uncertainty legible.** Every item/edge has evidence and a state such as `verified`, `supported`, `conditional`, `review_required`, or `not_established`. Do not expose review-only candidates as confirmed requirements.

## Student journey and information hierarchy

### 1. Programme and curriculum

Show the programme’s actual curriculum and stated learning outcomes, organized into readable themes without changing their meaning. Identify CCMAS versus external components and retain source locators. Explain that the curriculum is the learner’s starting context; distinguish “covered by this curriculum” from “additional learning to pursue.” Any learning theme or item shown as a student learning step must have at least one relevant, accessible, source-checked external learning link. Label global and Nigerian resources accurately and do not imply that an evidence/reference source itself teaches the topic unless it does.

### 2. Programme-to-domain choice

Each domain card should include:

- a compact, plain-language description of what the domain does;
- the relationship label (`Direct`, `Functional`, or `Adjacent`);
- a short “Why this programme connects” explanation citing the relevant course/outcome evidence;
- what the programme appears to transfer, what it does not establish, and any material limitations;
- a clear route to inspect the domain before selecting it.

Do not make the label alone carry the explanation. A relationship label is a mapping classification, not a promise of eligibility or employment.

### 3. Domain overview and foundation

The domain page should be substantial enough to orient a student: the domain’s scope and outputs, typical work settings and collaborators, common entry expectations, benefits/opportunities, constraints and limitations, and how the selected programme’s curriculum may transfer. Include source-backed global context and a separately labelled Nigerian context.

The foundation is the set of genuinely shared, versatile entry-level learning requirements across the domain’s relevant areas and roles. Display two explicit bands:

- **Most versatile foundation:** items supported across the broadest set of routes.
- **Useful additional edge:** important items that strengthen one or more routes but are not shared across the whole domain.

For each item, show type, purpose/use case, importance, evidence/coverage (for example “used across 6 of 8 areas”), whether it is required or optional, prerequisite/relationship information, contexts where it applies, and at least one verified external learning link. Never place a niche item in the shared foundation merely because it appears in some role records. If a relevant learning link has not been verified, retain the item in inventory/admin review but do not present it as a student learning step.

### 4. Area of specialization / practice

An area page explains what work belongs in that area, its boundaries, how it differs from sibling areas, typical outputs/settings, and its global and Nigerian context. It then shows what the area adds to the domain foundation, including area-specific tools, skills, competencies, methods, certifications, and learning links. Make inherited foundation items and new area additions visually distinct; do not duplicate inherited content as if newly required.

### 5. Role

The role page describes the work in task terms, the domain context, its area route (or direct domain route), typical outputs and collaboration, role-specific requirements, prerequisites, global/Nigerian context, and learning links. Clearly distinguish an established occupational title from a specialization or emerging title. Do not create a role title merely to satisfy a minimum count.

## Item model and relationship matrix

Each item should have a stable identifier, preferred label, item type, concise explanation, scope/level, evidence references, confidence/state, context tags (`global`, `Nigeria`, or other explicitly named jurisdiction), access/availability notes, and learning/information resources. Categories are explicit: `skill`, `tool`, `competency`, `certification`, `method`, `knowledge`, or `resource`.

### Claim-level evidence at every display checkpoint

An item in the inventory is not automatically valid to display at every level. For each programme, domain, area-of-specialization, and role checkpoint, retain the exact source passage/locator that supports the item's presence there and separately supports the explanation of what it does or how it is used. Trace each student-facing statement through **item → source passage/locator → owning checkpoint → displayed wording → downstream route/relationship**. Review the displayed wording against that evidence. A source-backed label alone does not establish the example, use case, importance, prerequisite, or employment outcome written beside it. Record a separate verified external learning link for every displayed item; the link must actually teach or guide the learner on that item and must resolve to a relevant destination. Narrow claims to the evidence; if checkpoint fit, use, or a suitable learning link is not established, keep the item review-only and out of confirmed student guidance.

Keep internal taxonomy separate from learner language. Labels such as **“task family,” “task set,”** and their internal IDs are for research, data management, and staff review; never show them as learner-facing concepts. Describe the concrete activity instead, under a plain-language heading such as **“What you might do”** or **“What this helps you do.”** The description must remain specific to the selected programme/domain/area/role and evidence-backed; do not replace technical data labels with vague marketing copy.

When an external roadmap or user-supplied text is compared with the inventory, treat it as a discovery checklist rather than an authority. Record each candidate gap, verify whether it belongs at the proposed checkpoint using authoritative or maintained external sources appropriate to the claim, then accept, narrow, relocate, or reject it. A candidate's presence in a popular roadmap is not enough to make it required or to establish its learning sequence.

### Catalogue-wide, context-specific enrichment search

Apply this search to **every domain and every downstream area of specialization/practice and role**, and to every item category: knowledge, skills, tools and their software ecosystems, methods, competencies, certifications/qualifications, and learning resources. An existing inventory is a starting point, not proof that it is complete. For each checkpoint, search for both omitted items and incorrect ownership; assess each candidate against that checkpoint's actual scope, tasks, outputs, and boundaries. Do not transfer a plausible item from one domain or area to another without evidence for the new context.

For software, programming languages, platforms, and technical methods, do not stop at the parent label. Where a use case relies on libraries, packages, frameworks, modules, plugins, datasets, or companion tools, identify and validate the relevant components and their relationships. Trace **language/platform → library or tool → task/method → output → owning domain/area/role**. Explain what a component does in that workflow, what it depends on, what it complements or can replace, and what learner output demonstrates the use. For example, a Python-based social-research path may need a task-specific comparison of tabular-data, plotting, network-analysis, text-analysis, or simulation libraries; this does not make every library a domain-wide requirement. A library name alone is not evidence of a method, skill, competency, or mastery.

For every candidate—including candidates found through a gap search—record its exact evidence locator, identity/version where relevant, checkpoint fit, learner-facing explanation and example/output, scope, status (shared, useful, optional, conditional, specialization-owned, unsupported, or not established), prerequisites and typed relationships, limitations, and a separately verified learning resource when it is proposed for student display. Search direct authoritative/maintained documentation for what a tool actually does; use professional, academic, standards, or practice sources to establish why that task belongs in the field; use suitable instructional sources for learning links. Preserve alternatives and distinguish them from tools that must be used together. Label jurisdiction-specific evidence (including Nigerian context) without presenting it as global practice.

The search is comprehensive by domain context, not an instruction to list every available product or package. Prefer a bounded, evidence-backed set that covers supported use cases; explicitly record search scope, candidate gaps, exclusions, and unresolved cases so reviewers can see what was checked. Never promote a niche or emerging component into a shared foundation merely because it is technically compatible with a popular language or appears in one specialist workflow.

Relationships should be stored as typed, directional edges, with evidence and a short explanation. Suggested edge vocabulary:

| Relationship | Meaning | Example |
|---|---|---|
| `used_for` | Tool/method supports a use case or task | Python → data analysis |
| `alternative_to` | Either item can serve a similar use case, subject to stated trade-offs | two simulation tools → vehicle simulation |
| `complements` | Items are commonly used together for a task | C++ ↔ ROS 2 |
| `requires` | One item is a prerequisite for another | linear algebra → sensor-fusion study |
| `builds_on` | Later learning extends an earlier capability | area method → domain foundation |
| `supports` | Item contributes to a competency, area, or role task | test automation → software quality role task |
| `recognized_by` | Certification/credential is issued or recognized by an authority | credential → awarding body/jurisdiction |

Do not infer `alternative_to`, prerequisite, or credential recognition from co-occurrence. A relationship is a first-class evidence-bearing record; missing evidence is `not_established`, not an empty implication.

## Selection and downstream/report behavior

### Recommendation: guided, scoped selection with an explicit preview

Do not turn every domain item into a mandatory quiz or allow an unstructured set of clicks to rewrite the curriculum. Use a staged selection model:

1. By default, show the recommended foundation and explain the ranking.
2. Let the learner select one or more items in each category, with category-specific rules. Multiple selection is allowed where it represents genuine alternatives or complementary choices; the UI must label which is which.
3. Selection is preference-setting, not knowledge/progress assessment. Do not ask the learner to mark “I know this,” “I want to learn this,” or “completed.” Selecting an item means “include this in the learning focus/report I am choosing”; it makes no claim about mastery or progress. Recommendations may be shown separately as guidance, with their evidence and rationale.
4. Before continuing downstream, show a route preview: which areas and roles the chosen route and selected items support, what the selected plan will teach at each step, and which choices are alternatives versus cumulative requirements. Do not display an unexplained missing-items or standalone gap list; weave evidenced next-learning steps into the route guide.
5. At an area or role, inherit only relevant selected foundation items and add the requirements for that branch. Do not carry irrelevant selections into every branch.
6. A report records the exact selection snapshot, taxonomy/data version, evidence state, and generated route. Different routes can be shown as separate sections in one report, but the report must not merge mutually exclusive alternatives into one false checklist.

### Selection rules

- **Same category, multiple items:** permitted when the items are complementary; permitted as alternatives only when the user chooses “compare alternatives” or the report clearly shows separate options. Apply no arbitrary maximum without usability evidence.
- **Multiple contexts:** a single report may show global and Nigeria-specific implications in separate labelled panels. A Nigeria-only credential must not appear as globally required.
- **Downstream effects:** an item can influence a branch only through an explicit `supports`/`requires`/`builds_on` relationship to that branch or one of its tasks. The system must not infer downstream fit from category membership or text similarity alone.
- **Conflicts and gaps:** if selected alternatives conflict, require a route choice or show parallel route variants. If coverage is unknown, say “not yet established” rather than silently excluding or asserting.
- **Admin use:** retain selection and route snapshots so school/university administrators can understand what the learner wants to pursue and structure relevant teaching/support. Student selections do not alter canonical curriculum or institutional programme facts.

## Proposed data/API/display contract

The canonical hierarchy should support stable IDs independent of ISCO:

```text
ProgrammeCurriculumTheme
  └─ ProgrammeDomainLink (relationship type + rationale + evidence)
       └─ Domain
            ├─ DomainItem / DomainItemRelationship
            └─ AreaOfSpecialization (the existing subgroup/area-of-practice concept)
                 ├─ AreaItem / inherited foundation references
                 └─ RoleRoute (area or direct-domain route)
                      └─ RoleItem / task and evidence records
```

Recommended API behavior:

- Return provenance, state, context, item type, use case, importance, and relationship explanations with each item/route.
- Return inherited versus newly added items separately, with stable IDs so clients can deduplicate without losing where an item applies.
- Return alternatives as grouped choices, not as a flat “learn all” list.
- Include the selected programme’s curriculum transfer and the domain-link rationale on domain entry.
- Include selected-item route previews and report snapshots with a data version.
- Fail closed for unsupported/under-review edges; return a clear review state rather than inventing an area or role connection.
- Keep internal legacy field names (such as `subgroup`) behind a mapping layer if needed, but expose one student concept and one identifier for the area layer.

### Non-exclusive role routing

Role routing is not an exclusive classification. The same occupational title
may have more than one independently supported domain route, and a role may
belong to more than one area of specialization inside one domain when its
actual tasks materially span those areas. Supply-chain cybersecurity, for
example, is represented as a route to the supply-chain domain and a separate
route to the cybersecurity domain when the role evidence supports both; the
title is not deduplicated into one arbitrary owner.

The canonical route contract should therefore persist arrays of evidence-
bearing route records rather than one area key:

```json
{
  "role_domain_routes": [
    {"domain_id": "D034", "status": "supported", "route_type": "primary", "evidence": []},
    {"domain_id": "D004", "status": "conditional", "route_type": "adjacent", "evidence": []}
  ],
  "role_area_routes": [
    {"area_id": "<canonical-area-id-1>", "status": "supported", "route_type": "primary", "evidence": []},
    {"area_id": "<canonical-area-id-2>", "status": "supported", "route_type": "secondary", "evidence": []}
  ]
}
```

The legacy singular fields remain compatibility fields and point to the
primary route only. They must not overwrite or hide secondary supported
routes. A route is promoted when the role's documented tasks/outputs cover the
area boundary and an independent role source supports that task scope. A
“75% fit” score is useful only when the counted tasks and denominator are
stored; it is not, by itself, evidence. If the evidence supports the domain
but not a particular area, show `Domain → Role` and state that no area-specific
route has yet been established. If the evidence supports two areas, show two
separate branches and label shared versus branch-specific requirements.

Cross-domain overlap is handled the same way: keep separate route records,
route-specific evidence and route-specific learning additions. Do not merge
the requirements of overlapping domains into one universal checklist, and do
not use ISCO membership or a shared title as proof of either route.

The existing seed/API contract currently keys subgroups by ISCO submajor. The reviewed area catalog uses stable `area_key` identifiers. Do not make the 708 catalog student-active by toggling a visibility flag alone: first migrate consumers and seed/API joins to area IDs, map or explicitly disposition role routes, preserve evidence, and verify direct-domain routes for domains whose reviewed structure has no separate area.

## Box mockups

### Domain foundation: use-case grouping and item relationships

```text
┌──────────────────────────────────────────────────────────────────────┐
│ SOFTWARE ENGINEERING · DOMAIN FOUNDATION                             │
│ Shared entry preparation across the supported areas and role routes  │
│                                                                      │
│ MOST VERSATILE FOUNDATION                                            │
│ Use case: Build and maintain software                                │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Skill · Programming fundamentals           Required · Shared 7/8 │ │
│ │ Tool  · Version control                    Recommended · 6/8      │ │
│ │ Method· Code review                        Builds on programming │ │
│ │ [Why this matters] [Evidence] [Free learning] [Select]            │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ USEFUL ADDITIONAL EDGE                                               │
│ Use case: Prototype data-driven behavior                             │
│ Python [Select]  C++ [Select]  Compare as alternatives? [ ]          │
│ ROS 2 [Complements C++] · Simulation [Supports prototyping]          │
│                                                                      │
│ Selected: 2 items · Preview impact across 4 areas and 6 roles         │
│ [Review downstream routes]                                           │
└──────────────────────────────────────────────────────────────────────┘
```

The “2 items” count does not imply mastery. The preview explains exactly which branches are affected and distinguishes alternative tools from complementary requirements.

### Downstream route preview

```text
┌──────────────────────────────────────────────────────────────────────┐
│ YOUR SELECTED STARTING POINT                                         │
│ Programme: [selected JAMB programme]                                 │
│ Curriculum transfer: [course/outcome evidence and limits]            │
│                                                                      │
│ DOMAIN: Autonomous Vehicle Engineering                               │
│ Why linked: [programme-specific evidence] · Relationship: Functional│
│                                                                      │
│ Your selections support these routes                                 │
│ ┌ Area: Perception & Sensor Fusion ─────────────── [View route] ┐    │
│ │ In this plan: Python, programming foundations                  │    │
│ │ Choose focus: probability, sensor models, evaluation, one tool │    │
│ │ Learning guide: add C++ deployment and real-time practice     │    │
│ └───────────────────────────────────────────────────────────────┘    │
│ ┌ Area: Planning & Control ─────────────────────── [View route] ┐    │
│ │ Shared foundation + route-specific control/math additions      │    │
│ │ Alternative methods shown separately; no claim of job readiness │    │
│ └───────────────────────────────────────────────────────────────┘    │
│                                                                      │
│ [Compare routes] [Build one learning plan] [Save report snapshot]    │
└──────────────────────────────────────────────────────────────────────┘
```

### Item comparison and evidence

```text
┌──────────────────────────────────────────────────────────────────────┐
│ TOOLS FOR VEHICLE SIMULATION · ALTERNATIVES                          │
│ Choose one to start; you can compare or change this later.            │
│                                                                      │
│ Tool A  Purpose · strengths · limits · platform · global/Nigeria     │
│ Tool B  Purpose · strengths · limits · platform · global/Nigeria     │
│                                                                      │
│ Both support: simulation and scenario testing                        │
│ Complement: C++/Python skills · prerequisite: Linux basics            │
│ Evidence: [source] · Learn: [beginner lesson] [official guide]       │
│                                                                      │
│ ( ) Select A   ( ) Select B   [Compare both]                          │
│ “Compare both” creates two route variants; it does not add both as   │
│ mandatory requirements.                                              │
└──────────────────────────────────────────────────────────────────────┘
```

## Quality gates before release

1. Every displayed specialization is the same concept as subgroup/area of practice; no duplicate layer is introduced.
2. Every programme-domain link has a reason tied to curriculum evidence and a clear direct/functional/adjacent label.
3. Every foundation item is evidenced as broadly shared; every branch-specific item is attached to the appropriate area/role task.
4. Every alternative/complement/prerequisite relation is explicit, evidence-backed, and testable.
5. Global and Nigeria-specific claims are distinguishable, source-backed, and not conflated.
6. Selection previews and reports are deterministic for the same data version and selection snapshot.
7. Under-review and unsupported paths are not presented as confirmed student guidance.
8. API and seed contract no longer require an ISCO code to identify an area of specialization; legacy subgroup data has a reviewed migration/compatibility plan.
9. Admin views can inspect source, scope, confidence, and selection impact without changing canonical programme facts.
10. Every displayed item and use-case explanation is verifiable against evidence at the exact checkpoint where it appears; unsupported expansions remain hidden/review-only.
11. Every student-facing learning item has at least one verified external learning link, shown with a clear action label/button; unlinked items remain hidden from the student guide.
12. Gaps suggested by external roadmaps are independently validated and explicitly accepted, narrowed, relocated, or rejected before they enter the student experience.

### Approval states are separate

Record and evaluate these as distinct decisions: (a) learning-path sequence
design/approval, (b) item-level content and checkpoint approval, (c) UI/state
implementation, (d) automated test results, (e) rendered route/report
verification, and (f) explicit student-facing release approval. Passing or
approving one does not imply the others. In particular, approved sequence
design may remain non-visible while content or rendered-release gates are
open; an open display gate must not send the sequence back for redesign.

When a stored status flag conflicts with an approved decision or its evidence,
trace the decision through its source artifact and the code that derives the
flag. Correct a stale status/integration record at the narrowest affected
layer. Do not call the underlying work incomplete or repeat it unless new
contradictory evidence, changed scope, a demonstrated regression, or an
explicit user reopening meets the reopening rule in the implementation plan.

## Open product decisions for a focused design review

- Whether the default chooser starts with “most versatile foundation” only or also shows “useful edge” items collapsed.
- Whether alternative selection is a radio-style choice by default, with an explicit compare mode, or a multi-select with a mandatory alternative label.
- How much evidence detail is visible inline versus in an expandable source panel.
- Which report format presents multiple area/role route variants most clearly without overwhelming the learner.
- Whether item completion is tracked inside this matcher or linked to a separate learning-plan/progress feature.

These are deliberate interaction decisions, not reasons to delay the underlying taxonomy and evidence cleanup. The learner should always be able to understand what is shared, what is route-specific, what they selected, and what remains to learn.
