# D078 UI and learning-path complaint audit — 15 October 2026

**Design baseline:** `docs/manual-review/D078_LEARNING_PATH_UI_ARCHITECTURE_2026_10_15.md` now consolidates the required flow, wireframes, graph projection, item/relationship interactions, selection behavior, tray states, typography and release checks. Implement G1–G12 against that architecture; do not reopen closed findings or repeat evidence research without a demonstrated regression.

## Purpose and no-loop rule

This is a complaint-by-complaint audit of the current Sociology → D078 → area
of specialization → role experience, not a new content review. It distinguishes
local source/data readiness from live database state and rendered acceptance.
Passing evidence below is closed unless a regression or new evidence appears;
do not reopen it because a stale artifact says `false`, an old screen showed an
empty response, or a prior gate has a different denominator.

Statuses mean:

- **PASS (local/static):** current checked-in code or canonical local artifact
  meets the stated requirement. This is not proof that Supabase has the data.
- **PARTIAL:** the underlying capability exists, but one specified presentation
  or integration detail remains.
- **OPEN:** a concrete behavior or artifact is still missing.
- **UNVERIFIED:** source inspection cannot establish the result; a live DB or
  rendered/authenticated check is required. It is not automatically a defect.

## Findings

| # | Complaint / requirement | Status | Evidence and exact remaining work |
|---|---|---|---|
| 1 | Logo/name must be separated from the supplied background; place brand variants strategically. | **OUT OF SCOPE / UNVERIFIED** | This was assigned to the logo agent, not this D078 pass. No logo acceptance is claimed here. Verify that task separately; do not treat it as a D078 data or migration blocker. |
| 2 | Undergraduate students should go straight to their selected programme; university choice belongs to secondary-school routes. | **PASS (static), UNVERIFIED (rendered)** | `ProgrammeDetailRefinedScreen.tsx` has undergraduate journey/user-type branches that bypass institution selection. No authenticated visual acceptance was performed in this audit. |
| 3 | Sociology programme overview must show student-friendly themes, not an empty “not loaded” panel. | **PASS (local), OPEN (deployment)** | The reviewed Sociology contract and graph contain **14 themes**; the local development preview has a Sociology fallback. Three research-theme claim records are not the theme count. The live screen remains dependent on the curriculum/theme migrations and seeds in the apply order below. Confirm post-seed API response and rendered programme screen. |
| 4 | Domain preview should remain as currently accepted by the user. | **PASS / CLOSED** | The user reported that domain preview met expectations. Keep this passed checkpoint closed unless a regression is observed. |
| 5 | Shared foundations must not be a raw inline list. | **PASS (component contract), UNVERIFIED (visual)** | `ContextualItemList.tsx` renders separate item cards with item type, order, expandable explanation, programme/domain/area context, use, limits, relationships, links and selection. Rendering quality still needs visual acceptance. |
| 6 | “Understand Social Sciences before choosing an area” should explain the actual field. | **PASS (content structure), UNVERIFIED (source-backed live rendering)** | `DomainDetailScreen.tsx` has separately sectioned study scope, questions, outputs, work process, global and Nigerian context, entry expectations, opportunities/constraints and programme connection, with evidence links where supplied. Check the actual API payload after seed; do not substitute a generic description if fields are absent. |
| 7 | Explain why a learning resource is attached to an item. | **PASS (component contract), PARTIAL (record coverage/live)** | `ContextualItemList.tsx` renders “Why this resource is here”, locators and verified links when present. The D078 overlay carries item-specific `why_this_resource` data. Post-seed audit must still verify no displayed resource lacks a rationale/locator appropriate to its resource type. |
| 8 | Distinguish the compulsory learning path from optional useful edges, while keeping a clear handoff from programme learning through domain, area and role. | **PARTIAL — G1, G8, G10, G11** | The active D078 domain and area cards already mix item types within their lists; they are not supposed to split into skills, tools, methods, and so on. The remaining issue is that domain/area list scope is currently determined by presence/absence of a use-case key, not consistently by compulsory-versus-optional requirement status. This can mislabel a non-compulsory item as a shared starting point. The full route sequence/handoff is also not yet one coherent, verified presentation. |
| 9 | Item cards must be clear, professional, student-facing; include purpose, use, route, limits, prerequisites, alternatives, relationships and resources without audit jargon. | **PASS (local component contract), UNVERIFIED (rendered)** | `ContextualItemList` and the tray render discrete labeled sections for meaning, programme/domain/area/role context, route fit, use, output, preparation, limits, relationships and resource rationale. The adapter and saved snapshot preserve those reviewed explanation fields. Rendered wording and layout remain for the later acceptance pass; do not reopen source identity or dispositions. |
| 10 | “Rethinking Political Science” must not look like a general Sociology/social-science learning resource. | **PASS (scope documented), UNVERIFIED (rendered placement)** | The current runbook explicitly bounds the APSA report to a political-science education claim and says it is not a general D078 learning resource. Verify that it appears only as an audit/reference source for the supported item/area and not as a generic domain guide. |
| 11 | Domain foundations must follow the programme connection, then flow into areas and roles without competing labels. | **PARTIAL — G1, G10; carry-forward implemented locally** | The active domain page now shows reviewed programme themes and theme-specific matched course/outcome evidence before the domain learning sections. Themes with no exact transfer are identified as programme learning, not field capability. Area and role pages carry connected programme outcomes as inherited context. The remaining flow work is the unified compulsory-versus-optional sequence and rendered verification; do not reopen the programme evidence review. |
| 12 | Selecting “Include in my focus” should visibly open/show the learning tray. | **PASS (wired), UNVERIFIED (rendered)** | `ContextualItemList.tsx` supplies `onOpenPlan` to `GuidanceReportButton`; successful selection navigates to the guided screen with `openTray: true`. The saved item remains removable. Confirm in authenticated rendered UI that the tray actually opens, not merely that navigation occurs. |
| 13 | Shared and optional groupings should be clickable and contain expandable item details. | **PASS (static)** | Both are rendered as `ContextualItemList` cards; item-level “What this means and how it connects” opens details. Verify touch targets and sheet behavior in visual acceptance. |
| 14 | Show methods and knowledge as well as skills/competencies at domain level. | **PASS (static), UNVERIFIED (DB payload)** | Active D078 domain lists request skills, competencies, methods, knowledge, tools and certifications through the same item component. No separate empty tool-only panel is used for D078, avoiding duplicate rendering. Verify named records are returned by the live API after seed. |
| 15 | Tools must appear at domain, area and role level with explanations, selection and comparison. | **PARTIAL — G2** | Domain and area D078 routes include tool records in item cards; area-tool options have task/route linkage in the graph. Role-route tools are supplied as area-owned options when that area is selected, not mislabelled as role-owned requirements. Static code exists; the full role payload, comparison sheet, selection and tray flow still require authenticated rendered acceptance. If a named tool is absent after seeding, inspect owner/scope/eligibility and seed order—not legacy aggregates. |
| 16 | Relationship details must be visible at domain and downstream levels. | **PASS (component/graph contract), UNVERIFIED (rendered)** | Item cards mount `ContextRelationshipChips` and route-target relationships; the graph includes the area/tool and role route relations. Confirm the sheet opens and presents relationship meaning rather than raw edge labels in the rendered app. |
| 17 | Every resource needs a visible justification. | **PASS (field renderer), PARTIAL (coverage audit)** | Renderer displays an item-specific rationale when the record carries it. The remaining audit is to count displayed approved resources without `why_this_resource` or equivalent rationale and repair those records; do not infer rationale from a source title alone. |
| 18 | Area page must be properly sectioned, explain the area, show additions, tools, credentials and roles. | **PARTIAL — G3; duplicate area summary removed locally** | `SubgroupDetailScreen.tsx` presents carried-forward domain learning, the wider-field explanation, a single dedicated area overview, area additions/options, and roles inside the area. The area breadcrumb no longer repeats the area title and summary immediately before `HierarchyOrientationCard`. The inherited-versus-added flow and actual visual spacing/section hierarchy still need rendered acceptance. |
| 19 | Each area and role must show the appropriate tools, methods, knowledge and complete task-set detail. | **PARTIAL / UNVERIFIED — G2, G4** | Area D078 content includes all item types and 14 newly integrated area-tool options; role contract seed has 173 dispositions, 166 individually eligible cards, and 224 supported role-owner links. Current local eligibility is not proof of a live payload or that every rendered role has the expected cards. Run the post-seed role-by-role API matrix in the runbook. |
| 20 | Do not expose internal “route note / task / guardrail” blobs or jumbled duplicate text. | **PARTIAL — G5** | The renderer has separate “Why it may help”, “Example of the work”, “What to keep in mind”, prerequisite, complement, alternative and resource sections and strips common internal prefixes. Exact rendered copy is unverified; remaining work is one visual/content acceptance pass and targeted repairs only where internal or duplicated prose actually appears. |
| 21 | A learner must be able to remove an item after adding it. | **PASS (static), UNVERIFIED (persisted interaction)** | Button label toggles to “Remove from my focus”; the component explicitly says a saved preference can be removed. Verify add → tray opens → remove → item absent after reopen. |
| 22 | Sociology/Sociology and Social Anthropology area must show its relevant roles. | **PASS (local route data), OPEN (live proof)** | The canonical D078 graph contains the seven current areas, 19 role routes and 26 area-role links; the route seed separates current areas from retired legacy subgroups. After seed, confirm the endpoint returns the Sociology and Social Anthropology area and its role list. |
| 23 | Every canonical area must have its correctly related roles; roles may belong to multiple areas. | **PASS (local graph), OPEN (live proof)** | Seven canonical areas and 26 supported/conditional area-role routes are in the local graph; 7 roles have multiple area routes. Legacy two subgroup buckets are not current areas. Verify post-seed route counts and cross-area role contexts. |
| 24 | Display fonts, details/explanation sectioning, letter size and visual hierarchy must be readable and distinct. | **PASS (local styles/tests), UNVERIFIED (rendered) — G7** | `DegreeSkills.tsx` uses 16 px body/theme narration and outcomes, 18–20 px theme/course/section headings, and smaller supporting metadata. Item-detail and relationship explanations use separate sections; the tray and relationship sheet use 18 px section headings and at least 16 px explanatory text, with focused regression assertions. Desktop/mobile text scaling, contrast and spacing remain for visual acceptance. |
| 25 | Separate the compulsory route from optional useful edges; sequence each by its own supported relationships and explain transitions across domain → area → role. | **PARTIAL — G8, G11; tray lane display implemented locally** | The intended design is not one mixed checklist and not lists split by skills/tools/methods. It is (1) a compulsory, requirement-led path and (2) a distinct optional useful-edge branch. Learners may select useful edges in addition to compulsory items at the domain, area or role level; selecting an edge must neither replace a required item nor make the edge compulsory. The selected tray now displays a numbered compulsory path separately from “Optional useful edges you chose”; optional items are additive/skippable and reorder controls remain within their lane. Each branch can contain all item types and must have its own internal ordering where evidence supports it. Approved hard prerequisites must appear before the item they support; alternatives/complements/“works with” remain non-blocking. Whole-route graph projection, transitions and rendered acceptance remain unverified. |
| 26 | Explain programme outcomes within student-friendly themes and show how courses/outcomes in each theme fit together. | **PASS (local structure/styles), RENDERED UNVERIFIED** | `DegreeSkills.tsx` groups courses into themes, provides theme narration, expands into course-level learner-friendly outcomes, and can show theme relationships and learning materials while preserving source outcome wording where it differs. Current theme/course/outcome styles use readable heading/body hierarchy in code; no authenticated visual fidelity pass has confirmed device scaling and spacing. This is a presentation acceptance item, not a reason to reopen curriculum research. |
| 27 | Carry the programme’s relevant outcomes into the domain and area so students see why the next learning follows. | **PASS (local implementation and focused tests); LIVE/RENDERED UNVERIFIED** | The active domain screen renders `ProgrammeCurriculumCarryForward` with each reviewed theme, its specific transfer status, matched course/outcome evidence where recorded, and independently expandable outcomes for each theme. Themes without an exact course-outcome transfer explicitly remain programme learning and are not presented as proof of a field capability. Area and role screens render `ProgrammeOutcomeBridge` with the programme-to-field narrative and connected learner-friendly outcomes. `ProgrammeCurriculumCarryForward.test.tsx` verifies matched and unmatched themes, theme-level expansion, and suppression of course codes. Confirm seeded API payload and authenticated rendered behavior; do not reopen curriculum research for this already implemented handoff. |
| 28 | Group learning by compulsory path versus optional useful edges—not by skill/tool/method/credential type—and preserve mixed item sequence within each. | **PARTIAL — G11; local lane split implemented** | The active D078 domain and area lists keep mixed item types together. `matchesItemScope` places only `requirementLevel === needed` in the compulsory branch and non-needed records in optional choices; it does not infer requirement from `useCaseKey`. The saved-plan stack keeps lanes disjoint: a downstream useful edge is selectable alongside compulsory foundations/additions but is not duplicated into compulsory area/role additions. The tray presents these selected lanes in separate sections and does not number optional edges as compulsory steps. Regression coverage passes in the learning-plan, adapter and tray suites (42 tests). Whole-route graph sequencing and rendered verification remain; do not repeat the completed local requirement-filter or tray-separation fixes. |
| 29 | Make relationships, alternatives, comparison, selection, return navigation and route transitions work as one understandable interaction. | **PARTIAL — G12** | Relationship chips open an explanatory sheet and the saved tray has an alternative-comparison sheet; item details support add/remove. But the relationship sheet currently explains a related target without an action to open/focus that target, card-level alternatives are text rather than a direct compare/choose interaction, and the item-to-tray action does not visibly preserve the full domain/area/role return context in its navigation arguments. Design and verify one continuous path: inspect relationship → open the nearest related item or return to the same card; compare true substitutes without stacking both by accident; select/deselect; preserve the selected route and scroll/expansion state; go back/close without losing selections; and explain the next layer transition. |

## Explicit implementation/release gaps (the work that remains)

These are the only gaps carried forward from this complaint audit; the PASS
items above are closed and should not be repeated as fresh enrichment work.

### G1 — Make the inherited learning flow use one student vocabulary

Align domain, area and role labels to this compulsory progression:

`Programme learning already covered → Compulsory domain foundations → Compulsory additions for the chosen area → Compulsory additions for the selected role`

At each level, show optional useful edges in a distinct branch alongside the
compulsory path, never as a required rung. Both branches may contain any mix of
skills, tools, methods, knowledge, competencies and credentials; do not create
one section per item type. Replace competing “Shared domain foundations” /
“Domain foundation” labels with requirement-based student language. Preserve
all eligible items and relationships; this is a presentation/flow repair, not
a disposition reset.

### G2 — Prove the full tool route in rendered UI

After the D078 seeds are applied, verify at least one shared domain tool, one
area-specific tool and one tool available through a selected multi-area role.
For each: expand explanation, open official/reference and learning links, show
its task/route relationship and limitation, select it, open the tray, compare
or inspect alternatives, remove it, and verify that role tools remain labelled
as area-owned options unless independently owned by the role.

### G3 — Remove duplicated area-layer presentation

The area screen renders carried-forward domain foundations and domain options,
then area foundations and area options. The active D078 cards mix item types;
the key problem is that domain/area “shared” versus “options” uses use-case
presence rather than requirement status. Audit one Sociology and one other
area screen; show inherited compulsory items once, area compulsory additions
as additions, and useful edges in a distinct non-compulsory branch. Keep mixed
item types within each branch and preserve their supported order. Do not hide
useful information merely to shorten the page. D078-specific separate tool and
credential panels are currently disabled; do not treat those inactive legacy
blocks as active-screen defects.

### G4 — Confirm actual seeded payload coverage

The local contracts are complete enough for controlled verification, but this
checkout cannot prove that Supabase has been reseeded. Confirm the 14 Sociology
themes, 7 canonical areas, 26 area-role routes, 203 approved domain/area items,
166 eligible role-item cards and the expected role ownership in the database
and API. If a count differs, identify the missing migration/seed or owner/scope
filter and repair that cause; do not restart already-final evidence decisions.

### G5 — One visual and student-copy acceptance pass

Authenticated rendered acceptance is still pending. Check the real programme,
domain, area and role screens at desktop and mobile widths, including heading
hierarchy, readable font sizes, separated sections, item expansion, relationship
sheet, alternatives, add/remove, tray opening, save/reopen, report and print.
Record only reproducible defects and fix them once. Do not rerun the source
enrichment or graph disposition gates unless a concrete regression is found.

### G6 — Final public student-facing approval

The current gate correctly reports `student_verification_ready: true` but
`promotion_allowed: false`, because rendered UI acceptance and explicit release
approval are still false. This is not an unresolved content disposition or a
reason to re-audit the 203/173 records. After G1–G12 are accepted, record the
release decision and update the promotion gate from current evidence.

### G7 — Correct typography and reading hierarchy

The stale 9–11 px finding is closed for current local styles: programme theme
narration/outcomes use 16 px body text, headings are 18–20 px, and tray item
explanations use 16 px with 24 px line height and separate sections.
Desktop/mobile rendering, text scaling, contrast and spacing remain for the
later visual acceptance pass; do not repeat the code-style fix absent a
demonstrated regression.

### G8 — Surface the two learning routes and their supported sequence across the full path

Present two distinct learner routes: the compulsory path and optional useful
edges. Each route may mix skills, tools, methods, knowledge, competencies and
credentials. Project the selected programme → domain → area → role compulsory
path from approved hard prerequisites and requirement levels so each required
dependency appears before the item/task it supports. Preserve supported
within-level ordering and explain each transition: what the programme already
supports, what the domain adds, what the area adds, and what the role adds.
Optional edges have their own useful ordering/relationships where supported,
but never block progression or appear as prerequisites unless explicitly
approved as such. Alternatives, complements and “works with” relationships
remain visible context, not blockers. Current dependency sorting is local to
each item list; the missing proof is the whole-path projection and acceptance,
not another source-evidence pass.

### G9 — Accept the programme theme/outcome presentation

Preserve the 14-theme structure and course-to-theme provenance. After G7,
check each theme narration against its grouped courses/outcomes, confirm the
expanded course outcomes remain understandable and faithful, and ensure
materials/relationships explain the theme without looking like extra course
content. Repair only concrete grouping or wording errors found in that pass.

### G10 — Carry relevant programme outcomes into domain and area

The active refined domain and area views currently do not display the
programme's outcome text, even though the connection contract can provide
`curriculumOutcomes`. Add a relevant, student-friendly “what you have already
learned that connects” section before domain and area additions. Retain course
titles as context, hide course codes in student prose, and never imply that the
programme teaches domain-enrichment items.

### G11 — Make the compulsory/optional split reflect requirement status

The active D078 domain and area lists already mix skill, tool, method,
knowledge, competency and credential items, as required. Preserve that. The
bug is semantic: `matchesItemScope` assigns domain/area items to “shared
foundation” or “learning options” based on `useCaseKey`; only role-level
classification currently checks `requirementLevel === needed`. Replace this
with an explicit reviewed requirement contract so the **Compulsory learning
path** contains only items approved as needed for that domain/selected route,
and **Optional useful edges** contain supported items that can be skipped.
Within each branch, mix item types and order them by approved dependencies and
learning order. Each section should explain why the learner is seeing it and
where it leads. Carry inherited compulsory learning forward without
duplicating it as a new area/role requirement; keep optional edges outside the
compulsory sequence at every downstream transition.

### G12 — Make relationship exploration and route navigation continuous

Use the item card as the stable anchor. Expanding it reveals the item's purpose,
use, limits and its nearest approved relationships. A relationship chip opens a
sheet that says plainly whether the connection is a prerequisite, conditional
step, alternative, complement or non-ordering connection. Where the target is
another learning item, offer **Open this item**; closing/back returns to the
same expanded card and scroll position.

Alternatives that address the same task should be compared together by
appropriate factors (what work they support, output, prerequisites, access or
cost, limits and learning links). Choosing one should not silently add its
substitute as a second requirement. Complements may be selected together when
the relationship says they work alongside each other. Selection is a learner
preference, not a claim of competence; add/remove must be reversible and the
tray must retain route ownership and allow multiple route stacks without
merging their context.

The tray should expose the selected route/layer, distinguish inherited items
from new additions, show compulsory sequence separately from optional useful
edges, and explain the next transition (programme → domain → area → role).
Closing a sheet, backing out of the tray, or returning to a prior layer must
preserve selections and return the learner to the same route context. Validate
all this in the rendered undergraduate Sociology flow; component existence or
unit tests alone do not close the interaction gap.

## Gate interpretation to prevent looping

- Do not begin visual/student acceptance while implementation gaps remain.
  Finish the local implementation sequence first; then run the controlled
  rendered acceptance pass once, recording reproducible defects only.
- The graph artifact remains a staff/audit artifact. Its `student_visible`
  field does not decide whether an individually approved runtime card can be
  returned by the D078 API.
- The current runtime set is 203 approved domain/area items: 53 approved
  domain items and 150 area items after the separately reconciled area-tool
  additions. One domain candidate is unapproved and excluded. The old aggregate
  summary said 52 approved, but the current individual records contain 53
  approved dispositions and the 53 runtime IDs match that approved set. The
  gate now recounts individual records instead of trusting the stale summary.
  Role items are a separate ledger: 171 approved, 2 unapproved, 166
  individually eligible for a role card. Never conflate these totals.
- `student_verification_ready=true` is permission to test the controlled
  student experience, not permission to claim the UI was rendered or to
  publicly release it.
- Once a check passes, it stays passed unless a specific regression is
  demonstrated. Historical `false`, `pending`, stale release snapshots and
  artifact-level hidden flags do not reopen a completed item decision.

## Evidence files

- `data/career-mapping/_audit/D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.rebuilt.json`
- `data/career-mapping/_audit/D078_STUDENT_PROMOTION_GATE_2026_10_10.json`
- `docs/manual-review/D078_STUDENT_PROMOTION_GATE_2026_10_10.md`
- `backend/tests/test_d078_guided_content.py`
- `backend/tests/test_d078_guided_areas.py`
- `backend/tests/test_d078_role_item_contract_seed.py`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/GuidanceReportButton.tsx`
- `src/components/careerIntelligence/GuidanceContinuation.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx`
- `src/screens/careerIntelligence/GuidedFieldSelectionScreen.tsx`

## 2026-10-16 local implementation reconciliation (supersedes stale row text)

This dated reconciliation corrects stale claims in the original complaint
matrix. It does not reopen completed content dispositions or evidence research.

| Finding | Current local result | Still open |
|---|---|---|
| Programme learning carried into domain/area (row 27; G10) | Implemented in `ProgrammeCurriculumCarryForward.tsx` and used by the domain screen; the area screen also explains the programme-to-domain transfer. Available themes/outcomes are inherited context, separate from new domain requirements. | Verify populated programme payload and rendered layout; check outcome fidelity and ensure course codes are absent from student-facing prose. |
| Compulsory path vs optional useful edges (rows 25, 28; G8/G11) | `GuidanceContinuation` labels compulsory domain/area/role additions and renders optional useful edges separately. `ContextualItemList` scopes by `requirementLevel`; the learning-plan adapter categorizes non-`needed` records as optional regardless of item type or `useCaseKey`. | Confirm full route ordering/relationship behavior in the rendered application and that optional choices never become compulsory. |
| Area and role inheritance (G1/G3) | The area handoff distinguishes domain learning carried forward from area additions and says optional choices are not auto-selected. The role view shows selected inherited domain/area learning separately from role-owned additions, and avoids D078 legacy domain-foundation fallback. | Verify actual API ownership/scope payload, multi-area roles, and duplicate prevention after seeding. |
| Item details, relationships, and tray continuity (rows 12–21, 29; G12) | Cards retain separate explanatory sections; selection can open the tray; item-to-plan navigation preserves programme and area route identifiers; comparison is offered where reviewed alternatives exist; selection remains removable. | Authenticated rendered check of add/remove, comparison, relationship target/back, route restoration, My World, report and print. Unit tests are not visual proof. |
| Typography and section hierarchy (row 24; G7) | The old claim that essential copy is 9–11 px is stale for current `DegreeSkills` styles; outcomes/main body use the larger design-system scale. New carry-forward copy uses explicit headings and separate sections. | Inspect real desktop/mobile rendering, text scaling, contrast and section spacing against architecture section 5; source sizes alone do not close this. |
| Role tools and area-role attachment (rows 15, 19, 22–23) | Local role-tool options and seven canonical area routes are represented in local graph/seed artifacts; role-tool visibility no longer depends on `useCaseKey`. | Live API/database payload and rendered role cards still require the applicable seed and route verification. |

### Mandatory inheritance rule for the remaining UI pass

The programme's relevant themes/outcomes are carried forward as what the learner
has already studied; explain the evidence-supported connection and what the
domain adds. Domain compulsory foundations continue into an area as inherited
learning, while the area contributes its own supported additions. Optional or
useful edges are not inherited automatically: only a learner-selected edge may
travel downstream as part of the learner's plan, and it must keep its original
owner/context and optional status. An unselected edge may be offered at a later
layer only when reviewed route evidence targets that layer; label it as a
choice, not as carried-forward learning. This applies again at role level and
in the tray, saved route, report and print. A selected optional item is never
converted into a requirement by being carried forward.

Requirement level—not category name, item type, presence/absence of a use-case
key, old `student_display_approved=false`, or stale aggregate summaries—controls
the compulsory/optional split. Keep the main path and optional branch distinct,
order each only by supported relationships, and explain transition context in
professional but student-readable language. Within each branch, mix tools,
skills, methods, knowledge, competencies and certifications as the graph
supports; do not separate them into unrelated type-only lists. Preserve clear
typographic hierarchy and separate item explanations, use cases, rationale,
relationships, alternatives, limitations and resources.

Focused verification completed 2026-10-16: TypeScript project check passed;
seven targeted Jest suites passed (49 tests), covering programme carry-forward,
contextual item display, route continuation, tray/detail rendering, alternative
comparison, candidate adaptation and saved-snapshot preservation. The tray
now retains and separately displays programme/domain/area/role context,
requirement rationale, named learning links, link rationale/locator/access,
and relationship explanations; comparison includes route-fit, prerequisite
and complement explanations. These are local implementation checks only. No
authenticated browser rendering or live Supabase verification is claimed.
Continue with remaining implementation gaps before visual acceptance; do not
repeat source research or disposition work absent a demonstrated regression.

### Additional copy-depth acceptance requirement (2026-10-16)

The rendered UI must not treat a one-sentence definition or brief label as a
complete explanation. For learners with little prior knowledge, all explanatory
narration—from programme overview/themes/outcomes through domain, area, role,
item meaning and use, relationships, prerequisites, alternatives, limits and
learning-resource rationale—must give enough connected context to explain what
the concept does and why it belongs at that point in the route. Use a short
multi-sentence paragraph for unfamiliar or complex concepts; keep headings and
chips concise, and keep each detail in its own labeled section. Explain how
programme learning connects to the domain and what the domain adds, then what
each area/role adds, without claiming unsupported transfer or treating an
unselected optional edge as inherited. This is a display/content acceptance
criterion, not a reason to reopen already-passed evidence dispositions.

### Priority execution checkpoint: explanation depth before remaining UI work (2026-10-16)

This requirement is now the first implementation gate, ahead of the remaining
UI polish/acceptance queue. The route-wide audit scope is programme details,
themes and outcomes; programme-to-domain preview/transition; domain overview
and domain items; all seven canonical areas and their items; supported roles
and their items; item detail; relationship and alternative views; tray; saved
route; report and print. The rule and operational guardrails are in the
implementation plan's “Priority implementation gate: D078 explanation depth,
route-wide”.

Concrete first-pass code finding and fix: the role page repeated role-description,
questions and outputs in a second “What this role does” card after the structured
role orientation already rendered those explanations. That duplicate card is
removed; distinct role description content is retained in the structured
orientation, and repeated summary text is displayed once. Area/role orientation
body and subsection text now use the readable 16 px body scale. A focused test
guards against duplicate summaries while retaining distinct focus, question and
output sections. Internal ESCO identity prefixes are also removed from role
meaning copy while their source provenance remains linked separately. These
changes are local and not yet browser-rendered evidence.

The Sociology/Social Anthropology Casevo card was separately checked at runtime
and strengthened: it now defines an agent, explains an interaction network and
large language model in place, explains its optional hypothetical use in this
area, distinguishes a simulated pattern from evidence about actual people, and
states that it does not replace interviews, surveys or observation. The
conditional-prerequisite sheet now uses ordinary-language route conditions
(for example, “When the advanced causal-estimation route is selected…”), rather
than a raw or grammatically awkward condition string. Focused tests cover both
the Casevo explanation and relationship wording.

**Route-wide content correction (2026-10-16):** the first implementation pass
was too Casevo-centred. The shared area-content adapter was still sending a
generic “D078 area-level addition or route-specific option” sentence to area
cards, even though each reviewed record already held its own route scope, task,
output and limitations. It now builds all 150 area-item explanations from the
named canonical area, the approved route scope, the reviewed task/output and a
source-recorded guardrail. Staff-only display instructions are not copied into
student text. Separate `programmeContext`, `domainContext` and `areaContext`
fields are now populated for the 53 domain items, all 150 area items (including
task-linked tool choices), while role-owned records retain their existing
programme/domain/area/role sections. This is a broad content/data-handoff fix,
not a claim that every sentence across every route has passed semantic review.

The backend gate now tests the entire area set for item-specific context and
guards against a return to the generic placeholder. It also verifies the
separate programme/owning-layer context fields across domain and area records.
Focused result after this correction: 23 D078 guided-content tests passed; the
pytest cache emitted a Windows permission/collision warning, which did not
affect the test result.

Data inspection of the current local runtime payload found 14 approved
Sociology theme narrations, 53 domain item records, 150 area item records,
297 role-owned item records across 19 roles, 95 role-tool route records, and
310 typed relationship records. These are loader/route counts, not all unique
concepts. The prior coverage scan found no missing item definitions, resource
URLs or item-specific resource rationales. Sixteen items lack a
separate `expectedOutput` field; where the contextual task text already names a
source-backed deliverable it must be presented clearly, and where the source
does not establish a distinct output the UI must not invent one. All 310
relationships have learner explanations in the runtime payload. The latest
field-length scan flags 152 meanings, 77 contextual-use texts and 108 output
texts under 18 words. These are review candidates only, not automatic failures
or proof of inadequate meaning. They require semantic review against the source
and route, not automatic rewriting by word count. The 16 absent separate output
fields reflect records where the source does not establish a distinct learner
output; their task/use explanation remains visible, and the UI must not invent
an occupational deliverable.

**Not yet passed:** semantic review of those flagged explanation candidates,
coverage of every visible programme/domain/area/role narration and each
relationship/resource transition, route-level rendered acceptance, and
report/print review. Do not call the explanation gate complete based on the
presence counts above or start unrelated UI acceptance work until the flagged
content is dispositioned and focused code/data tests pass. Do not reopen source
research or already-approved item placement unless a specific evidence defect
is found.

### 2026-10-16 implementation status after UI-flow pass

This checkpoint supersedes earlier G1/G3/G8/G10/G11 descriptions above where
they conflict with the current source. The delegated UI agent exhausted its
usage limit before sending a final handoff, so this status is based on its last
G1-G12 checkpoint plus direct inspection and local verification; no agent
completion is implied.

| Area | Current non-render implementation evidence | Remaining work (not a code defect unless reproduced) |
|---|---|---|
| G1/G3/G10: route order and inherited context | Domain page now presents the field overview before the programme-to-domain carry-forward. Area page presents its own orientation before programme/domain inherited context and area additions. Role page retains its own orientation and selected-area context before role additions. Existing section labels distinguish compulsory foundations/additions from optional choices. | Verify actual populated payload and visual flow in the browser. |
| G8/G11: compulsory path and optional edges | Requirement level—not item type or use-case presence—drives the split. Continuation tests cover the cumulative programme -> domain -> area -> role route; learning-plan tests cover scoped hard prerequisites, selection-order correction, multiple route stacks, and ordered report snapshots. | Manually confirm the actual D078 data appears in that order in the integrated page and tray. No additional sequence-code defect was identified in the current local pass. |
| G2/G12: item selection, relationships, alternatives and tray | Focused tests cover add/open tray/remove, route-scoped selection, relationship target/back navigation, alternatives compare/choose, multiple stacks, save/print/share callbacks, and snapshot context preservation. | Browser/manual check of touch behavior, persistence, My World, report/print and return/scroll restoration. |
| Programme themes and curriculum carry-forward | Current local contract has 14 themes; tests cover matched/unmatched theme transfer, theme-level outcome expansion and course-code suppression. | Confirm post-seed API payload and inspect the rendered Sociology programme/theme pages. |

Latest focused verification on 2026-10-16: 13 Jest suites / 82 tests pass
across the UI, continuation, selection, and learning-plan suites; the guided
sequence TypeScript project check passes. The local D078 backend guided-content
contract suite also passes (23 tests). These are code/contract checks, not
browser rendering or live Supabase evidence.

**Remaining items outside rendered acceptance:** (1) verify the seeded API
payload/counts after the applicable migration/seed is applied (G4); (2) perform
the user's single manual browser pass for layout, copy and interactions (G5/G7
and rendered portions of G2/G9/G12); and (3) record student-facing promotion
only after that acceptance (G6). The agent's final crosswalk was not received.
A subsequent explanation-only pass found and fixed a UI/content-adapter issue:
embedded output text could be repeated with task narration instead of appearing
in its own “What you may produce” section. That pass also replaced generic
role-tool output templates with task-linked learner copy and simplified
Casevo-specific preparation notes. It did not change tool/role inventory,
research, ownership or placement. Do not reopen those records as part of
explanation work. Relationship-sheet wording is now type-aware: alternatives
are choose-one choices, complements are optional companions, task support
explains relevance without implying a requirement, and “Learn first” appears
only for an explicitly approved hard/conditional prerequisite.

**Current explanation-only status (2026-10-16):** focused tests pass after the
above fixes: 24 D078 guided-content tests; 19 `ContextualItemList` tests; 7
relationship-sheet tests; and four programme/domain/area/tray/continuation
suites (15 tests). Still open:
semantic review of flagged short or repetitive explanations across programme,
all themes/outcomes, domain, seven areas, roles, relationships, resources,
tray and report/print; latest seed regeneration and API payload verification;
and the user's rendered acceptance. These are explicit outstanding stages,
not grounds to repeat completed source research or re-adjudicate item records.

**Explanation-only follow-up (2026-10-16):** the role explanation adapter now
translates the internal phrase “task family” into learner-facing work-context
language and rewrites the pedigree-chart audit note in plain language. It
states that interpreting inheritance diagrams is different from tracing
family history, and explains the genetics-task, consent, privacy, uncertainty
and qualified-review boundaries. This changes student copy only: it does not
remove or reclassify the conditional genealogist route. Regression coverage
checks all 19 current D078 role routes for these internal phrases. Verification
is 27/27 backend guided-content tests and 35/35 focused UI tests. Remaining
explanation semantic review, seed/API verification and user-rendered acceptance
remain open; this checkpoint does not claim route-wide completion.

**Flagged-copy review continuation (2026-10-16):** reviewed the 27 runtime
items whose definition and route-use narration were both under 18 words. Five
had an actual use/output duplication or weakly separated practice result; the
remaining short candidates had a distinct output or sufficient explanation
and were not padded just to meet a word-count threshold. A full area scan then
found 45 exact `contextualUse`/`expectedOutput` repeats. All 45 area cards now
have distinct, item-specific work explanations and practice outputs: 18
economics-area records and 27 Sociology/Social Anthropology records. The same
scan now reports zero exact area use/output duplicates. These changes affect
learner explanation fields only, not item inventory, tools or role placement.
Both item-list and tray rendering still suppress any future identical output
instead of displaying it twice. Focused verification is 28/28 backend
guided-content tests, 35/35 UI tests and a successful scoped TypeScript check.
The separately observed exact duplicates among role cards have not yet been
semantically reviewed; wider theme/outcome, role, relationship/resource, seed/API
verification and rendered acceptance also remain open.

**Explanation-depth continuation (2026-10-16):** a follow-up scan reviewed short
learner definitions and use explanations against their paired route context,
not as a word-count acceptance rule. Seven terse domain-use summaries now
explain the task, give a concrete context or example, and state an important
interpretation limit. The digital-trace and SPSS area explanations were expanded
in the same learner-copy layer; the PySAL esda definition now explains spatial
clustering and why it does not establish a cause. Repeated role-tool definitions
for Excel, Gephi, Zotero, Transkribus and OpenSesame now explain the tool in
plain language and include a practical limitation; underlying tool records and
role decisions were not changed.

The scan also found 16 area items whose existing reviewed task-use text already
specified a tangible work product, while the separate output field was empty.
Those products are now rendered as distinct, item-specific output explanations
from that existing text. No output was invented for other items. The current
runtime scan covers 500 domain/area/role items: zero have a blank definition or
use explanation, zero have either field under 12 words, and zero area items
remain without an output where the reviewed task already specified one. This
does not establish semantic acceptance of every narrative. Focused verification
is 32/32 backend guided-content tests and 46/46 tests across seven relevant
programme/domain/area/item/tray/relationship suites. Still open: semantic review
of role-task passages that contain staff-style audit wording, complete
theme/outcome and relationship/resource explanation acceptance, migration/seed
and API-payload verification, and the user's rendered browser acceptance.

**Applied Zoology scope clarification (2026-10-16):** retain the item in the
Behavioural Scientist route as a conditional useful edge—not as a shared
foundation or general role requirement. Its student explanation now states
that zoology is biological work and is relevant
only when a particular study concerns animal behaviour, welfare, ecology or
human–animal interaction and involves appropriate biological expertise. This
clarifies learner-facing scope; it does not change the role inventory or the
underlying placement/approval flags. Verification: 34/34 focused backend
guided-content tests pass. This explanation pass also replaces the internal
"CCMAS" acronym in learner programme-context copy with plain wording about
confirmed programme courses and linked outcomes, and replaces internal
"role-task" wording with ordinary language. The programme source badge uses a
student-readable label. The same sweep replaced remaining internal domain
codes, source-audit phrases and broken text encoding in learner narratives;
expanded the explanations for biometrics, audit techniques, public finance,
local-authority liaison and pedigree charts; and retained the Applied Zoology
useful-edge caveat. A regression test scans all 500 current domain/area/role
items for these specific leaks. Seven focused UI suites pass (46 tests).

**Explanation UI continuation (2026-10-17; current evidence):** the collapsed
item card previously exposed only its name and status until expansion, despite
the reusable-card design requiring an explanatory preview. It now displays the
reviewed item meaning at 16 px / 25 px line height; opening the card replaces
that preview with the separate detail sections, avoiding duplicate display.
The role explanation adapter also corrects exact definition/use duplication
and replaces repeated generic programme/domain/area/role boilerplate with
item- and route-scoped explanations for the 202 approved role-item instances.
No item, tool, role, source, ownership or placement record was changed.

Current focused checks: 40 backend guided-content tests pass; 46 UI tests pass
across six suites; `tsconfig.guided-sequence-check.json` passes. The copy
heuristic reports zero findings across 14 themes, 53 domain items, 150 area
items and 202 role-item instances, while correctly retaining
`human_review_required=true` and `auto_approval=false`. Gap-audit finding 24
continues to track typography, sizing and section separation: code-level sizes
and separation have regression coverage, but desktop/mobile rendered
readability, contrast, spacing and text scaling remain unverified. The full
semantic review of programme/themes/outcomes, overviews, relationships and
resource rationales is not yet closed; do not treat a clean length/phrase scan
as semantic or rendered approval.

**Role-output copy repair (2026-10-17):** a focused review found 41 approved
role-item instances using the same generic output fallback despite having
bounded task context available. Added role/item-specific learner-facing output
examples in the display adapter, with conditionality and scope limits retained.
The backend guided-content suite now passes 41 tests and the copy heuristic
remains at zero flags across the same 419 visible records. This is explanation
copy only; it does not change role/task inventory or evidence disposition.
Semantic and rendered acceptance gates remain open.

**Programme source-wording presentation repair (2026-10-17):** the theme
screen previously rendered long source `courseSummary` and original outcome
wording inline with learner-friendly outcomes. It now shows learner-friendly
outcome copy by default and preserves original CCMAS outline/outcome wording
behind a per-course “View original course outline” disclosure, labelled as
potentially technical or compressed source wording. The focused `DegreeSkills`
suite passes 9/9 and the scoped TypeScript check passes. The source curriculum
record is unchanged; semantic review of every outcome and rendered acceptance
remain open.

**Explanation UI continuation (2026-10-17):** the expanded learning-tray item
now presents the item definition once, keeps a distinct additional explanation
in its own section only when it adds information, and separates route fit,
work example, output, limits, relationships and learning links. Optional useful
edges explicitly remain selectable alongside compulsory learning; choosing
one adds an extra focus and does not replace or block the compulsory path.
Every attached link now receives a cautious learner-facing purpose, including
when its rationale field is empty; the fallback says it supports the work
described above, may cover only part of it, and is not proof of competence.
The same fallback is used in item cards, the tray and alternative comparison.
Relationship explanation and condition text is filtered through the student
copy adapter so staff placement notes do not leak into the sheet. No learning
item, tool, role, evidence decision, ownership, or placement record changed.

Verification: 8 focused UI suites / 67 tests pass across programme themes,
domain, area, item cards, tray, relationships and alternatives; the scoped
TypeScript check passes. This closes those presentation defects only. It does
not prove rendered browser acceptance, exhaustive semantic correctness of all
programme/theme/outcome and route explanations, or post-seed/API content; those
remain separate checks and must not be inferred from these UI tests.

**Explanation-copy regression follow-up (2026-10-17):** the shared student-copy
adapter now removes an internal “useful additional edge” status prefix without
discarding the learner-facing sentence that explains why an optional item may
help. This preserves the distinction the UI must communicate: compulsory
learning remains on the main path; a learner may add a useful edge alongside
it for extra route-specific advantage; the edge does not replace or block the
main path. A focused plan-model regression confirms that adding a useful edge
keeps the compulsory foundation selected in the same route stack while
preserving separate requirement lanes. Item cards and the tray also show an
explicit “not provided yet” explanation when a meaning or route-use field is
unexpectedly blank, rather than rendering an empty section or inventing
content. No item, tool, role, evidence, ownership, placement, or sequencing
record changed.

Verification after these explanation-UI fixes: 9 focused suites / 93 tests pass, including
the learning-plan, item-card, tray, comparison, relationship, programme,
domain and area UI suites; `tsconfig.guided-sequence-check.json` passes. This
does not close the separately recorded semantic-content review, database/API
payload check, or rendered browser acceptance.

**Evidence-context explanation follow-up (2026-10-17):** the existing
`geographicScope` on each contextual learning item is now shown as a separate
“Evidence context” section in item details and the learning tray, and as a
comparison row for alternatives. The plan adapter and saved item summaries
retain that scope so it is not lost when the learner saves the route. Copy
distinguishes Nigerian, international, and Nigeria-to-global evidence while
warning that local rules and conditions can vary; it does not imply that
international evidence is Nigerian regulation or that one local rule applies
everywhere. Verification at that point: 10 focused suites / 103 tests pass;
the scoped TypeScript check passes. Whole-corpus semantic review, database/API
payload verification and rendered browser acceptance remain open.

**Requirement-lane stacking follow-up (2026-10-17):** confirmed that learners
can keep compulsory domain/area selections and add an optional useful edge
from a downstream area for extra advantage. A regression test exposed that
the same area edge was also being counted as an area addition in the saved
stack. The stack now places area and role additions only in their matching
compulsory categories; useful/conditional edges stay in the separate optional
lane and remain skippable. Verification: the learning-plan, adapter and tray
suites pass (3 suites / 42 tests). Full route sequencing and rendered browser
acceptance remain open.

**D078 tool/credential presentation repair (2026-10-17):** the active domain
and area screens contained stale D078-only guards that suppressed their reviewed
tool and credential panels even when the approved contextual records were
already present. Those guards are removed. The existing ownership, source,
claim-review, link and non-actionable-tool filters remain in force, so this
change exposes only records that already pass the student evidence contract;
it does not promote legacy or unreviewed inventory. Area-linked domain tools
retain their explicit area/role route explanation. Focused domain, area,
context-item, tray, programme-theme, relationship, comparison and typography
suites pass (65 tests), and
the guided TypeScript check passes. Role tool visibility still depends on the
populated role/selected-area API payload and the single rendered acceptance
pass; no live database or browser promotion is claimed here.

**Explanation-only closure sweep (2026-10-17):** certification, foundation
skill, role-item, and cross-area route cards were checked for the same student
facing standard as the main contextual-item cards. Raw requirement values,
staff placement notes and truncated three-line explanations are no longer the
display path. Each card now separates meaning, use in this route, output,
preparation, relationships, limits and resource rationale where the reviewed
record provides them. The D078 backend guided-content suites pass (50 tests),
the available focused UI suites pass (61 tests), the scoped TypeScript check
passes, and the explanation audit reports zero heuristic findings. This closes
the local explanation/display-copy defects found in this pass; live API/seed
verification and authenticated rendered acceptance are still deployment-level
checks and are not claimed here.

## 2026-10-17 implementation reconciliation (authoritative local state)

This entry supersedes stale “partial” wording elsewhere in this historical
complaint audit. The following explanation/UI requirements are implemented
locally and must not be sent back into another implementation loop:

| Area | Current local result | Still requiring evidence |
|---|---|---|
| Programme outcomes carried into domain, area and role | **IMPLEMENTED.** `ProgrammeCurriculumCarryForward` shows reviewed themes, transfer status, course context and expandable outcomes; `ProgrammeOutcomeBridge` carries reviewed programme context into area and role screens without presenting it as new domain learning. | Seeded API payload and authenticated rendered acceptance only. |
| Requirement-led learning lanes | **IMPLEMENTED.** Domain, area and role cards keep mixed item types together; `requirementLevel === needed` controls the compulsory lane and all other supported items stay in the optional useful-edge lane. The tray keeps lanes separate and preserves approved prerequisite order. | Authenticated rendered acceptance only. |
| Tool and credential visibility | **IMPLEMENTED locally.** D078-only suppression guards are removed. Ownership, source, claim-review, linked-resource and non-actionable filters remain active. Tool cards expose meaning, route use, requirement lane, output, preparation, relationships, limits and resource rationale. | Seeded payload and rendered acceptance only. |
| Relationship and alternative interaction | **IMPLEMENTED locally.** Relationship sheets explain the connection, open an in-list target or route target, preserve a return anchor, and provide back/close actions. Alternatives open comparison/tray selection; choosing one removes competing alternatives without making both compulsory. | Authenticated rendered acceptance only. |
| Explanation copy | **IMPLEMENTED locally.** Certification, foundation, role, tool and item cards use separated learner-facing sections and remove staff-only placement language. The copy audit reports zero heuristic flags across 14 themes, 53 domain items, 150 area items and 202 role-item instances. | Human semantic judgement and rendered acceptance remain distinct from this heuristic result. |

Do not reopen enrichment, graph disposition, role reconciliation or SQL work
because older G3/G10/G11/G12 text says these local implementations are
missing. The remaining work is deployment/render verification, not another
explanation implementation pass.

### Sequence-handoff reconciliation (2026-10-17)

The local UI now consumes the sequence contract in
`D078_SEQUENCE_CONTRACT_LOCAL_HANDOFF_2026_10_17.md` rather than inventing a
second ordering model. The handoff's three compulsory foundations remain the
only progression gate; the domain spine, safeguards, method routes, advanced
extensions, tools, area additions and role additions remain route-supported
learning lanes. The UI therefore keeps required and useful-edge choices
separate, orders each lane from the approved dependency metadata, and treats
alternatives as choices and complements as co-learning rather than blockers.

The reconciliation also removes the type-based split from the active area and
role route displays. Skills, competencies, methods, knowledge, tools and
credentials appear together within the relevant requirement lane, with each
item card supplying its type badge and separate meaning, use, relationship,
resource and limitation sections. The separate tool-group view remains a
supporting comparison/reference surface, not a second compulsory path.

This is a presentation reconciliation only: it does not change the handoff's
sequence decisions, item ownership, graph dispositions or database state.
