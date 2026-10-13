# D078 guided-experience flow and state plan — 2026-10-09

**Status:** implementation plan and audit contract; local only. This document
does not approve student display, promote canonical data, change route fit, or
apply SQL.

## What this plan covers

This plan turns the controlling guided-experience specification and
implementation plan into one testable journey:

`programme overview → programme-to-domain entry → domain overview → domain foundation → area of specialization → role → focused learning report`

In this product, **subgroup, area of specialization and area of practice are
the same layer**. The student-facing label is “Area of specialization” or
“Area of practice”; the internal `subgroup` field is not shown as a second
level.

The current evidence-resolution gate is closed for the 206 in-scope D078
records: 37 Nigerian-context records have bounded source-backed context and 17
have an exhaustive-search/no-established-local-claim disposition. The 17 are
student-hidden. This does not mean that all 58 domain-learning candidates are
student-ready: the candidate contract, programme/pre-domain/domain approval
gates and the complete rendered transition test remain open.

## Controlling inputs and current audit result

The implementation must be checked against:

- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`
- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`
- `docs/manual-review/D078_DOMAIN_OVERVIEW_AND_LEARNING_PATH_REVIEW_2026_10_08.md`
- `docs/manual-review/D078_GUIDED_LEARNING_IMPLEMENTATION_AUDIT_2026_10_08.md`
- `docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md`
- `docs/manual-review/D078_FULL_DOMAIN_ITEM_INVENTORY_REVIEW_2026_10_08.md`
- `docs/manual-review/D078_SKILLS_METHODS_DEEP_SEARCH_CHECKPOINT_2026_10_08.md`
- `docs/manual-review/D078_FINAL_ENRICHMENT_LANE_MERGE_2026_10_09.md`
- `docs/manual-review/D078_EVIDENCE_RESOLUTION_BEFORE_LEARNING_PATH_2026_10_09.md`

The audit baseline is:

| Surface | Current state | Consequence |
| --- | --- | --- |
| Evidence envelope | 206/206 records resolved or explicitly dispositioned | Safe to design the flow around explicit states |
| Role-task references | 271/271 matched to source-backed role-work profiles | Do not infer new role placement from this pass |
| Learning-access residuals | 0 in the evidence envelope | A candidate link is not automatically a verified student link |
| Domain-learning contract | 58 records remain review-only; 1 domain item is approved | Student route must render review-only items as hidden/empty, not confirmed learning |
| Selection layer | Contract and predicates exist | Full populated route, stacking and report tests remain required |
| Programme/pre-domain/domain gates | Not all approved | Do not claim the complete guided experience is live |

## Visibility and state model

Keep these states separate. A single boolean such as `visible` is not enough.

### Evidence state

`evidence_state` describes the research result:

- `verified`: the exact claim, source locator and scope were checked;
- `supported`: evidence supports the bounded claim but not a universal one;
- `conditional`: valid only for the stated question, data, setting or route;
- `not_established`: the search did not establish the claim;
- `exhausted_no_local_claim`: local Nigerian evidence was searched but no
  item-specific local claim could be defended;
- `review_required`: work remains before the claim can be used.

### Display state

`display_state` is derived at the current checkpoint:

- `student_confirmed`: all claim, checkpoint, explanation, relationship,
  limitation and verified-learning-link checks pass;
- `student_guided_conditional`: shown with a clear condition and route scope;
- `student_hidden_review`: retained for admin/research review only;
- `student_hidden_no_local_claim`: no Nigerian claim is shown, while global
  evidence may still be used where independently approved;
- `admin_only`: provenance or quality information not suitable for the learner
  card.

No item may become `student_confirmed` merely because it has a URL, appears in
an inventory, occurs in a role record, or has been selected by a learner.

### Selection state

Selection is a learner’s chosen focus, not a test of knowledge. Use only:

- `unselected`;
- `selected`;
- `included_in_report`;
- `removed_from_report`.

Do not add “I know this”, “I want to learn this” or “completed” to this
selection flow. Progress tracking, if added later, is a different product
state and must not be inferred from selection.

### Route state

The route state records the learner’s current navigation and supported path:

- `programme_selected`;
- `domain_preview`;
- `domain_selected`;
- `area_selected`;
- `role_selected`;
- `comparison_open`;
- `report_preview`;
- `saved_snapshot`.

A route may be `domain → role` when no justified area exists. If a role has
more than one supported area, show separate route branches rather than merging
them into one claim.

## Screen and transition contract

### 1. Programme overview

The programme page explains the fixed university curriculum:

- a short narrative of what the programme studies;
- curriculum themes derived from the full curriculum, not a fixed number of
  themes;
- learner-friendly outcome narration that preserves the source meaning;
- theme-scoped books, courseware and learning resources;
- an expandable evidence panel with course title, source wording and locator;
- a clear distinction between “your programme teaches this” and “additional
  learning you may choose downstream”.

There is no supplemental-item selection control on fixed curriculum themes.
The primary action is **Explore related domains**. Theme resource actions use
**Open material**, with the destination type and access terms visible.

Programme details also contain the admission-requirement surface: JAMB/UTME
and O’level requirements, including national and institution-specific context.
That surface is intentionally a separate later workstream. The guided-learning
flow must preserve the selected programme/institution context and provide a
clear handoff to those requirements, but must not mix admission rules into
curriculum themes, domain foundations or supplemental learning selection.
Subject-matcher corrections and the detailed JAMB/O’level display audit remain
outside this D078 learning-path implementation pass.

### 2. Programme-to-domain entry

Each domain card explains why it appears for this programme. The card must
show:

- the full student-facing domain name;
- a plain-language description of what the domain is about;
- the course/outcome evidence that connects the programme to it;
- what transfers and what does not;
- the limits of the connection;
- separately labelled global and Nigerian context where applicable.

The internal mapping values Direct, Functional and Adjacent remain technical
values. Student copy explains them in ordinary language, for example:

- **Close curriculum connection:** the programme teaches several parts that
  are directly useful for understanding this field;
- **Useful connection:** the programme teaches learning that can transfer, but
  additional field learning is needed;
- **Related starting point:** the programme gives a relevant idea or skill,
  but the learner will need a larger bridge into the field.

Actions are **Open domain**, **Compare connection**, and **Back to programme**.
Unsupported or review-only cards are not shown as confirmed options; an admin
may see them in the provenance view.

### 3. Domain overview

The domain page begins with orientation before learning items:

- what the domain studies and the questions it addresses;
- what practitioners do and produce;
- typical settings and collaborators;
- common entry expectations, opportunities and limitations;
- global context and separately labelled Nigerian context;
- how the selected programme connects to the domain.

The page has **Continue to learning path**, **Compare routes**, and **Back**.
The overview does not imply that domain foundations alone qualify a learner
for every area or role.

### 4. Domain foundation

Show only approved shared or explicitly scoped items. Group cards by use case,
not by an unexplained raw list. Every card carries:

- item type and plain-language meaning;
- what it helps the learner do in this domain;
- an example output;
- where it supports downstream routes;
- prerequisite, complement and alternative relationships;
- limits and what it cannot prove or replace;
- evidence scope and a verified task-specific learning action.

Use **Add to learning focus**, **Compare**, **Open evidence**, and **Open
material**. Selecting a domain item does not automatically select every related
item. Alternatives remain separate choices; complements may be suggested but
are not silently added.

### 5. Area of specialization / practice

The area page inherits the relevant selected domain foundation and then shows
only the additions justified for that area. It must explain:

- what the area focuses on;
- how it differs from neighbouring areas;
- which domain items it reuses;
- what it adds and why;
- which methods/tools are conditional rather than universal;
- Nigerian context and limits separately from global claims.

The page offers **Choose this area**, **Compare areas**, **View supported roles**
and **Back to domain**. A hidden or review-only area is not represented as an
empty confirmed path; it uses a clear unavailable/review state.

### 6. Role

The role page inherits the selected domain and area items, then adds only
role-specific requirements. It explains the role’s work and outputs, the
selected area connection, prerequisites, alternatives, limitations and
evidence. A role may be attached to multiple areas or domains when each route
has its own evidence and explanation.

Actions are **Add role focus**, **Compare route**, **Open evidence**, **Open
learning material**, and **Back**. A role card never claims that the domain or
area foundation alone makes the learner job-ready.

### 7. Comparison layer

Comparison is opened as a modal on desktop and a full-screen sheet on small
screens. It must be closable with **Close**, dismissible by the platform back
action, and return the learner to the unchanged route state.

Compare only items or routes that share a meaningful use case. Show columns or
sections for:

- what each option is;
- the task/output it supports;
- prerequisites;
- what it complements;
- valid alternatives and trade-offs;
- limitations and non-replacement warnings;
- access/cost and jurisdiction where relevant;
- learning destination and source evidence.

The comparison action does not select anything. The learner explicitly chooses
**Select this option**, **Keep comparing**, or **Close**.

### 8. Selection tray and route preview

The persistent selection tray shows the selected domain, area, optional role,
and granular supplemental items. It also shows:

- inherited foundation items;
- area additions;
- role additions;
- selected alternatives as separate route choices;
- complements that the learner may deliberately include;
- items still hidden because evidence or links are not approved.

The preview uses **Already covered by your programme**, **Foundation for this
domain**, **Added for this area**, **Added for this role**, **Choose an
alternative**, and **Optional extension**. Do not use a standalone “gap in
this area” block. Explain what is already covered, what to build on and what
to learn next inside the chosen route.

### 8a. Saved learning box and “My World”

The selection tray is the temporary working plan. The learner can open it as a
small panel or folder-style screen labelled **My learning plan** before saving
it permanently. The panel must show the stacking context, not just a flat list:

1. **Programme starting point** — fixed curriculum themes and what they already
   cover; these are displayed for context and cannot be deleted from the
   programme record.
2. **Shared domain foundation** — approved capabilities that support the
   selected domain route.
3. **Useful additional edge** — an optional item that supports several routes or
   a stated condition; the condition and supported areas are shown beside it.
4. **Area of specialization/practice additions** — items that become relevant
   after an area is selected.
5. **Role additions** — role-specific tasks, tools, methods, competencies,
   knowledge and certifications.
6. **Alternatives and complements** — alternatives remain separate choices;
   complements are shown as related additions and are not silently inserted.

Each saved item shows **why it is here**, **what it enables next**, its source
state, and its relationship to the selected route. The learner may:

- **Add** an approved supplemental item;
- **Remove** an item from the personal plan without changing canonical data;
- **Move back** to compare another area or role;
- **Choose an alternative** and keep the unchosen alternative visible as
  unselected;
- **Reorder focus items** within an allowed route sequence without changing
  evidence-defined prerequisites;
- **Save to My World** as a versioned personal snapshot;
- **Print/Download** the current focused plan;
- **Share** a privacy-safe summary or link.

Removing an inherited item means “do not include this in my current focus”; it
does not erase the domain, area or role requirement. If an item is required for
a selected route, the report marks it as **not included in this plan** rather
than pretending the route no longer depends on it.

“My World” stores the learner’s snapshot, not a new canonical curriculum. A
snapshot contains route IDs, selected item IDs, order, alternative choices,
data/evidence version, timestamps and display-state decisions. Opening it later
must rehydrate the same stack and flag items whose evidence or links have
changed. The learner can duplicate a snapshot to explore another route without
overwriting the original.

Social sharing is opt-in and privacy-safe. The default share payload contains
only a learner-created title, route names and selected learning themes; it must
not expose identity, private notes, institution information, admin metadata or
hidden/review-only records. Provide **Copy share link**, **Share summary**, and
**Keep private**. A shared link must use a revocable snapshot ID, respect access
controls, and never turn a personal selection into evidence of mastery.

### 9. Report preview and saved snapshot

The report records the exact selection snapshot, route, data version, evidence
state and generated time. It contains separate sections for:

1. programme foundations and fixed curriculum themes;
2. chosen domain foundation;
3. chosen area additions;
4. chosen role additions;
5. alternatives not selected;
6. learning links, sources, limits and Nigerian-context notes.

Mutually exclusive alternatives must not be combined into one checklist. The
report action is **Print/Download focused guide**; **Save selection** stores a
snapshot and does not alter canonical curriculum or taxonomy records.

The report may be generated from the current working tray or from a saved “My
World” snapshot. It must identify which one it used. Print/download must
preserve layer labels, route order, alternatives, limits, learning links and
source notes; it must not flatten the route into one undifferentiated checklist.

## Stacking and inheritance rules

For a route `P → D → A → R`, compute the learner guide as:

`fixed programme explanation + approved D foundation + approved A additions + approved R additions + explicitly selected complements`

Then:

1. deduplicate by stable item ID, retaining the most specific explanation;
2. preserve provenance for every inherited item;
3. do not inherit a conditional item unless its condition is true;
4. keep alternatives as separate branches;
5. exclude review-only, unsupported and no-local-claim records from confirmed
   student guidance;
6. recalculate the preview whenever route or granular selections change;
7. leave canonical curriculum, evidence and mapping records unchanged.

The system must not infer an edge from shared labels, role frequency, subgroup
membership, technical compatibility or co-occurrence.

## Tray states and area stop point

The working tray has four presentation states: `icon`, `compact`, `mid` and
`full`. The icon state is a small folder/count control; compact shows the
current route summary; mid shows route stacks and layer summaries; full shows
all stacks, layer-scoped alternatives/complements and save, print/download and
privacy-safe share actions. Adding an item while the tray is collapsed produces
a brief drop-to-tray motion and text confirmation. Reduced-motion settings
remove the transform but retain the confirmation.

The learner may save at programme/domain without selecting an area or role.
That snapshot contains programme context and approved domain-foundation items
only. The area layer remains visible as an advisory list of options with a
disclaimer that choosing an area is required before its learning items enter
the plan. Area additions enter only after an area route is selected, and role
details enter only after an explicit role route is selected. Alternatives and
complements remain attached to the layer where they were chosen. This makes
the area route the durable stop point while keeping roles optional and
changeable.

## API/data requirements

The route payload should carry versioned, typed records rather than flattened
arrays:

- `route`: programme/domain/area/role IDs and route status;
- `checkpoint`: owner level and exact checkpoint key;
- `item`: stable ID, type, label, meaning, use case and example output;
- `scope`: global/Nigeria/other jurisdiction and limits;
- `evidence`: claim source, locator, access date and review state;
- `learning`: destination URL, destination type, locator, access terms and
  verification date;
- `relationships`: typed, directional, explained edges;
- `visibility`: evidence state, display state and student-hidden reason;
- `selection`: selected item IDs and selection timestamp;
- `preview`: inherited, added, alternative and optional groups;
- `snapshot`: data version, route version, report ID, snapshot ID, saved
  status, order and share status.

Personal plan operations are separate from canonical records:

- `learning_plan_snapshot` — immutable saved version;
- `learning_plan_items` — item placement, layer, order and inclusion state;
- `learning_plan_routes` — programme/domain/area/role route context;
- `learning_plan_share` — revocable share token, visibility and expiry.

The API must reject attempts to write learner selections into canonical
curriculum, domain, area, role, evidence or relationship tables.

The API must fail closed when an item lacks approved claim evidence, exact
checkpoint fit, a suitable explanation, a verified learning destination or an
allowed relationship. The admin response may include the reason and source
ledger; the student response should give a useful empty/review message without
exposing internal uncertainty as a fact.

## Admin parity

Admins receive the same route and selected-item snapshot plus:

- source passages and locators;
- evidence state and display-state reason;
- global/Nigerian scope;
- relationship evidence and exclusions;
- hidden candidates and exhaustive-search dispositions;
- item/version and last-checked dates;
- route-impact preview before approval.

Admin edits to evidence or canonical records are separate from a learner’s
selection. Learner selections are never treated as approval.

## Implementation and verification order

1. Freeze the local evidence envelope and candidate display states.
2. Complete programme overview and pre-domain-entry fixture checks.
3. Complete the domain overview fixture checks, including the seven current
   D078 areas and the psychology boundary.
4. Build one populated Sociology → D078 → area → role fixture using only the
   single approved domain item; verify empty/review-only states for the rest.
5. Implement route stacking and selection-preview computation without changing
   canonical data.
6. Implement comparison modal/sheet, alternative handling, back/close actions
   and report snapshot generation.
7. Add approved domain items only after each item passes the full evidence and
   learning-link contract; repeat the fixture tests after each batch.
8. Run API/client parity, deterministic selection, report, accessibility,
   broken-link, stale-version and fail-closed tests.
9. Run one integrated programme → domain → area → role verification.
10. Only after user approval may local seed/SQL artifacts be prepared for the
    manual deployment workflow. No SQL is applied by this plan.

## Release gates

The guided experience is not ready to promote until all of the following pass:

- fixed programme curriculum is distinct from supplemental learning;
- all four route screens have source-backed, checkpoint-specific narration;
- domain foundation, area additions and role additions stack deterministically;
- alternatives, complements and prerequisites are visibly distinct;
- comparison does not change selection until explicitly confirmed;
- back/close actions preserve route and selection state;
- add/remove/reorder operations update the personal plan without changing
  canonical records;
- saved “My World” snapshots reopen with the same stack and version metadata;
- printing from the working tray and a saved snapshot is deterministic;
- shared summaries exclude private identity, admin data and hidden records;
- selected report output is reproducible from the same snapshot/version;
- every student-facing item has a verified task-specific learning destination;
- global and Nigerian context are separately labelled;
- the 17 no-local-claim records remain hidden;
- review-only candidates never appear as confirmed requirements;
- admin provenance and student display agree on the same versioned records;
- no SQL or canonical promotion occurs before the integrated verification pass.

