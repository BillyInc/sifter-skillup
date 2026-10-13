# Sociology top-down box-flow audit and closure plan

Date: 2026-09-17  
Status: **Open — implementation in progress**  
Scope: Sociology programme preview → university selection/comparison → selected-university programme → Social Sciences domain → subgroup → role

This document is the current gap audit and execution plan. It is grounded in
`docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`, the reviewed Sociology corrections,
the cleaned Sociology curriculum contract, and the current implementation in
`src/screens/careerIntelligence` and `backend/routes/career_routes.py`.

## 2026-09-17 implementation addendum

The earlier audit was not fully thorough. It covered the intended presentation
but missed two implementation defects: selecting a university was silently
adding it to the comparison set, and a contextual item could fall back to a
broad source URL that was not an item-specific learning link. Both are now
corrected. University selection and comparison are independent, and a student
link is rendered only when the exact item has a verified resource attached.

The relationship audit is now a real data contract. The additive
`career_item_relationships` table stores typed, same-context `builds_on` and
`works_with` edges only when the source-backed target resolves to another
typed item. Every contextual tool and certification row without an established
edge receives a `not_established` coverage row. This prevents the interface
from guessing that a tool is required for a skill or that a certification
depends on a tool. The current local generated catalogue contains 423,199
relationship rows: 420,902 source-backed edges and 2,297 explicit
not-established coverage states. This is local generation evidence, not proof
that Supabase has been seeded.

The student UI consumes source-backed normalized edges first and falls back to
the existing explicit contextual arrays only for compatibility with an older
database. It never renders `not_established` as a relationship. The domain
Build tab now keeps the Overview/Build switch visible while Build is open, so
the user can return without relying on browser history.

Comparison remains bounded. Universities compare offerings of the same JAMB
programme. Tools compare only same-purpose alternatives when the required
purpose, access and evidence fields exist. Skills and competencies remain
distinct, and certifications compare only equivalent routes with scope, type
and eligibility evidence. There is no default “best tool”, “best certification”
or mixed skill/tool/certification comparison table. Any relationship currently
marked `not_established` requires external source review before it can become a
student-facing connection.

## What the agreed experience is

```text
Programme preview
  → dedicated university grid
  → optional comparison of the same JAMB programme
  → selected-university programme overview
  → relationship-grouped domain cards
  → domain overview / separate Build in this domain tab
  → subgroup cards
  → role cards
  → one inherited-to-added preparation path
  → review, then print/download/share
```

The student must never see a downstream domain, subgroup or role as if it were
independent of the selected programme and university context. The student can
select several downstream items during one guidance session; selection is a
single tick/checkpoint action, not a Save button on every card.

## Top-down audit

### 1. Programme preview

Required result:

- `Programme preview` is concise and appears before a university is selected.
- It explains what Sociology is, what the student may study, qualification and
  duration only when trusted, and why university choice matters.
- It has one clear action: `View universities offering Sociology`.
- It does not expose requirements, domains, subgroups, roles, market data, or a
  raw curriculum wall.

Current result: **Partial**.

The route distinguishes an early-secondary preview and suppresses downstream
guidance before selection, but `ProgrammeDetailRefinedScreen.tsx` still renders
`DegreeSkills` as a teaser and relies on the older programme `overview` field.
The preview contract has not yet been made a bounded, source-derived preview
object. A missing overview can therefore make the preview too thin, while a
present overview can bypass the intended synthesis.

Blocker: a preview must not invent a summary, and the current API does not
return a dedicated preview contract with source state and trusted duration.

### 2. University selection and comparison

Required result:

- university offerings open on their own focused screen, never as a long list
  below the programme preview;
- every card shows full university name, abbreviation when an actual source
  value exists, address, and the same JAMB programme identity;
- `Select university` is the primary tick/action;
- `Select for comparison` is optional and `Compare selected universities` is
  retained;
- no extra `View details` or `Add to compare` actions duplicate those actions;
- comparison says exactly that it compares the same JAMB programme across
  universities, including address, offering, UTME/O-level rules, verified
  subject pools, exceptions and data status;
- requirements are not shown as a detached selector detail page before the
  student has selected a university.

Current result: **Not closed**.

`ProgrammeDetailRefinedScreen.tsx` still renders `View details` and uses an
older modal/preview path in addition to the select and comparison actions.
The current `JambProgrammeSchool` contract does not expose a distinct
abbreviation field, and the university card cannot prove that all source
identity fields are present. The comparison panel is requirement-text based,
not yet a complete, labelled comparison of subject pools, exceptions and data
state. The route changes are present, but no automated interaction test proves
that browser Back and visible Back preserve the programme preview and the
selected JAMB identity.

Blocker: missing fields must remain honest; the UI cannot manufacture an
abbreviation, subject pool or qualification. The API contract must expose the
available source-backed fields and explicit unavailable states.

### 3. Selected-university programme overview

Required result:

- the selected university is visible with full name, abbreviation when known,
  address and programme identity;
- national guidance is explained as the general JAMB starting point;
- that university's rule is explained as the rule recorded for this exact
  programme at that university;
- subject pools are expanded when a rule says “any relevant”, “any Arts or
  Social Sciences”, or equivalent;
- the national and university rules are shown together in the overview, not as
  a separate Requirements tab in the guided flow;
- the programme learning path appears after the university context is known;
- domains appear only after that overview and are entered by clicking cards;
- going back returns to the preceding guidance surface.

Current result: **Partial**.

The inline guided requirements exist, but the legacy `requirements` tab and
the `View this university's requirements` action remain available in other
states. The selected offering is not yet guaranteed to carry every source
field into the comparison and domain route. The programme learning component
still contains separate metadata/resource blocks and does not yet consistently
place each source-backed learning link beside the explanation it supports.

### 4. Programme curriculum and abilities

Required result:

- the student sees a short explanation of what Sociology studies;
- curriculum themes become explanatory cards, not raw source lists;
- cards use “You will learn to …” language and explain the kind of work or
  output supported;
- `How you will use what you learn` replaces the raw `Ways of working ...`
  block;
- shared/supporting courses are shown only when the cleaned contract explicitly
  owns them for Sociology, and are visibly grouped without relabelling them;
- raw source wording, parser annotations, LIS exceptions and `Search this
  theme` are staff-audit content, not student content;
- every displayed programme book, open text or course resource is item-specific
  and labelled honestly as free, open, publisher reference or prescribed only
  when the source proves that label.

Current result: **Partial / not approved**.

`DegreeSkills.tsx` groups courses and progressively reveals outcomes, but it
still exposes source-shaped sentences and course counts as the main reading
experience. The ability cards are closer to the contract, but the component
still describes them as recorded metadata. The student surface needs a bounded
set of synthesized cards derived from the clean contract; no hardcoded
Sociology prose may be added as a substitute.

### 5. Domain overview

Required result for Social Sciences:

- the opening card says why **Sociology** connects to **Social Sciences** and
  names the relationship type for that exact edge;
- it explains Social Sciences in student language: what it studies, the kinds
  of questions it asks, what people do, where Sociology fits, and what the
  student can explore next;
- the foundation is domain-owned, not a role-frequency aggregate;
- domain foundation flows into domain skills, competencies, optional tools and
  qualification/reference routes;
- each item explains what it does in Social Sciences, why it appears, what it
  works with, and has its own verified link or an honest no-link state;
- subgroup cards are a responsive grid and are the final section;
- roles do not appear on the domain overview;
- the second peer tab is labelled `Build in this domain` and is a separate
  product, not part of learning guidance;
- old `Local context`, `Context that supports this guidance`, `Sources checked`,
  repeated source names, generic tool categories and `Locked` wording do not
  appear in the student domain view.

Current result: **Not closed**.

`DomainDetailScreen.tsx` still presents the older hero/route/stat blocks,
`FoundationSkillsBlock`, `ContextualItemList`, `ToolGroupsBlock` and credential
blocks as separate inventories. It still labels the tab `Build`, renders a
`NotesWidget`, and does not make the complete programme → domain → item chain
readable. The subgroup cards are clickable, but the domain card copy is not
consistently sourced from the programme-specific connection. The clean domain
foundation is withheld when its additive table is absent, which is correct,
but the student view needs a bounded explanation rather than legacy fallback
content.

### 6. Subgroup screen

Required result for Computational Social Science & Quantitative Methods:

- the header shows the domain/subgroup breadcrumb and a clear Back action;
- it explains what the subgroup studies and how it differs from Social Sciences;
- it explicitly shows what Sociology contributes, what the domain shares, and
  what this subgroup adds;
- the sequence is shown before the item cards;
- skills, competencies, tools, methods and qualifications are distinct but
  connected cards, not unexplained lists;
- tool names are options, grouped by purpose, with alternatives and individual
  links; source categories are hidden;
- roles are cards in a grid inside the subgroup, with a useful short work/output
  explanation.

Current result: **Not closed**.

`SubgroupDetailScreen.tsx` renders raw `clusterSkills` chips, limits inherited
foundation to three names, and places context items, tools, methods and
certifications in separate blocks. It does not show a reliable inherited vs
added continuation, and role cards use the same generic sentence regardless of
the role record. The attached output’s “domain foundation is not available”
message is also a symptom of the API/UI contract being incomplete, not a valid
student explanation.

Blocker: subgroup-owned context rows and their explicit parent relationship
must be present and reviewed. Unowned legacy arrays must not be promoted to the
student surface merely to fill the gap.

### 7. Role screen

Required result:

- the role is clearly inside the selected subgroup and domain;
- the opening explanation says what the role does, what problem it helps solve,
  what it produces, and where the work can be used;
- the continuation is explicit:
  `what Sociology contributes → what Social Sciences shares → what the
  subgroup adds → what this role requires/produces`;
- role preparation is an ordered path, not “essential chips” followed by an
  unrelated tool list;
- competencies explain their component skills and optional tool alternatives;
- each displayed skill, tool, competency and certification has an item-specific
  verified link or says that one is unavailable;
- certifications distinguish Nigerian, global and Nigeria+global scope and
  distinguish licence, examination, qualification, training and reference body;
- raw O*NET/ESCO activity dumps are secondary evidence, not the main student
  narrative;
- methods are shown only when evidence names this exact role;
- notes, mapping-debug blocks and irrelevant cross-role evidence are absent
  from the focused student route.

Current result: **Not closed**.

`RoleDetailScreen.tsx` still renders raw essential/optional arrays, raw work
profile activities, a separate methods section, role tools and credentials as
parallel lists, and a generic “what this role means” fallback. It has no
parent-domain/subgroup continuation payload. The earlier attached
`Biometrician` output proves the defect: a role whose ESCO description is
biometrics/life-science work inherited `social network analysis` from a broad
subgroup method query. That method is not evidence for the role and must be
withheld unless `evidence_roles` explicitly names the role. The endpoint filter
now moves in that direction, but the screen still needs the new contract.

### 8. Links and external hand-off

Required result:

- the displayed link label matches the item it belongs to;
- a generic homepage, category label, search URL or unrelated resource cannot
  satisfy an item link;
- clicking a verified item opens a Sifter confirmation showing the destination
  host and why the link is being opened;
- invalid, missing, unreviewed or audit-only URLs are not clickable;
- all student career components use the same guard.

Current result: **Partial**.

`ExternalLinkGuard.tsx` exists and `ContextualItemList` uses it, but foundation,
tool, certification, curriculum, role-work and evidence components still call
`Linking.openURL` directly. The link audit is therefore incomplete.

## Cross-screen icon and per-item resource contract

This is a required part of every screen in the Sociology route, not optional
visual polish. Every card must make its type and next action recognisable at a
glance through the approved existing icon registry/library. Do not introduce a
new lightning/zap logo or use an unapproved black square icon.

The required icon meanings are:

| Surface or item | Icon meaning | Required behaviour |
| --- | --- | --- |
| Programme preview | programme/book | Identifies the programme before university choice. |
| University offering | university/building and location pin | Identifies the institution and its address. |
| Select university | check/tick | Selects the offering as the active university; it is not a Save/bookmark action. |
| Select for comparison | comparison/scale or compare glyph | Adds the same JAMB programme offering to comparison without selecting it as the active route. |
| Compare screen | compare | States that the same JAMB programme is being compared across universities. |
| Back navigation | arrow-left | Appears on every programme, domain, subgroup and role detail surface. |
| Domain | domain/field icon | Identifies the field and stays consistent with its card and detail page. |
| Build in this domain | build/briefcase or approved build icon | Opens the separate Build product; it must not be mixed into learning guidance. |
| Subgroup | area/grid icon | Identifies a focused area inside the domain. Subgroups are grid cards, not plain rows. |
| Role | role/person/work icon | Identifies work inside a subgroup. Roles are grid cards inside that subgroup. |
| Skill | skill/ability icon | Identifies an ability to develop. |
| Tool | tool/code/workflow icon | Identifies an optional tool and its purpose, not a universal requirement. |
| Competency | outcome/connected-capability icon | Identifies an outcome that combines skills, methods, tools and judgement. |
| Certification or qualification | certificate/badge icon | Identifies a qualification, licence, examination, training route or reference body, with its scope stated. |
| Curriculum evidence | book/document icon | Opens a structured explanation of the curriculum evidence, not a raw dump for students. |
| Learning/resource link | external-link icon | Opens the item-specific verified destination through the confirmation guard. |
| Source/reference | source/document icon | Shows the named source/reference only when the student needs it; raw locators remain staff-facing. |
| Guidance selection | check/tick | Selects an item for the final guidance path. It must not force a Save action on every card. |

The icon is part of the information architecture: it must be paired with the
visible item label, never used as decoration alone. Icon-only actions such as
download, print, share, compare and Back require an accessible label or tooltip.
The existing Sifter brand mark is not an item icon and must not be reused to
represent skills, tools, credentials or external links.

### Per-item link requirement

Every student-visible programme resource, curriculum reading, domain
foundation, skill, tool, competency, method, certification, qualification,
subgroup resource and role resource must be resolved independently. The card
must contain the link beside the item it explains; links must not be collected
only in a footer or replaced by one generic `See all resources` link.

Each resolved item link must have:

- the exact item name it supports;
- a specific verified `https` destination, not a generic homepage, search page,
  category page or unrelated provider page;
- provider/source name and an honest access label such as free, open, paid,
  publisher reference or official information;
- a short explanation of what the destination helps the student do;
- the relationship to the current context: programme, Social Sciences domain,
  Computational Social Science subgroup or selected role; and
- the existing external-link confirmation before leaving Sifter.

The card may also show how an item works with other items. For example, a
competency card can name its component skills and list tool alternatives, while
each component still has its own link. A tool card can explain its purpose and
show alternatives, but it must not imply that one tool is the only route. A
certification card must say whether it is Nigerian, global or both and whether
it is a licence, examination, qualification, training route or reference body.

If a specific verified link is not available, the item remains visible only if
its explanation is source-backed and useful; it must show `No verified link is
available yet` and must not become a clickable fake link. If the item is
unowned, unreviewed, a generic source category or role-aggregated evidence, it
must stay out of the student route and remain staff-audit data.

### Implementation audit rows

The implementation must explicitly check all of these surfaces before closing
the Sociology slice:

1. Programme preview cards and curriculum-learning cards have the programme,
   curriculum and resource icons in the approved registry.
2. University cards show institution/location icons, and selection and
   comparison use distinct check/compare actions.
3. Domain overview shows the domain icon, foundation item icons and the separate
   Build tab icon; no raw local-context/source-wall icons are used to legitimise
   unstructured text.
4. Subgroup and role grids show their own icons and preserve the visual
   hierarchy `domain → subgroup → role`.
5. Each displayed skill, tool, competency, method, certification and reading
   has its own verified link control or explicit no-link state.
6. Links are opened only through `ExternalLinkGuard`; a static search must find
   no student-career component that directly calls `Linking.openURL`.
7. The final report uses print/download/share icons only after guidance review;
   those icons must not appear as enabled actions earlier in the route.
8. Browser and compact-width checks confirm icons do not create overflow,
   unreadable icon-only controls or accidental square/zap branding.

This icon and link contract applies equally to the direct, functional and
adjacent domain cards. The relationship explanation remains programme-specific,
and the resource explanation remains specific to the programme/domain,
subgroup or role context in which the student is viewing it.

## Connected capability and comparison contract

The audit must not treat skills, tools, competencies and certifications as
four unrelated inventories. They are separate concepts, but the student must
be able to understand how they work together in the current context:

```text
Programme learning
  → domain foundation
  → skill or method to practise
  → competency/outcome produced by combining knowledge, skills, methods and judgement
  → tool options that may support that work
  → qualification, certification, licence, examination or training route when evidence says it applies
```

The relationship must be evidence-backed and specific to the current level.
For example, a Social Sciences domain card may explain that research design,
evidence handling and communication combine into responsible social research;
R, Python, SPSS or Excel may support different parts of that work; and a
qualification or professional route may apply only in a stated Nigerian,
global or shared context. This must not be rendered as “learn this tool to get
this certification” unless the source explicitly establishes that dependency.

Every connected item card must therefore answer, in plain language:

- what the item is;
- what it does in this programme, domain, subgroup or role;
- what it builds on;
- what it works with;
- whether it is foundational, added for the selected subgroup, or specific to
  the selected role;
- whether tools shown are alternatives, complements or merely examples; and
- whether a certification is a local requirement, global option, both, or only
  an information/reference route.

The student must never see a generic “skills and tools” cloud where the
relationship is only implied by proximity. A competency may name its component
skills and possible tool options, while each component retains its own
verified link. A tool may support several skills or competencies, but the UI
must say which use is evidenced in the current context. A certification card
must state its type and scope; it must not be presented as mandatory merely
because a role record mentions it.

### Comparison rules

Comparison is allowed only where it helps a real decision and the compared
items share a stable identity or purpose:

1. University comparison compares offerings of the same JAMB programme. It
   must show full university name and address, the same programme identity,
   qualification/duration when available, national starting-point guidance,
   each university's exact UTME and O-level rules, expanded subject pools,
   exceptions/notes and review/data status. It must not compare different
   programme identities as if they were variants of one course.
2. Programme comparison may compare two programme identities only when the
   student explicitly asks for it. It must label the curriculum, university
   offerings and downstream domain connections as separate fields; it must not
   merge their requirements or claim that their teaching is identical.
3. Tools may be compared only as alternatives serving the same evidenced
   purpose, such as statistical analysis or data organisation. The comparison
   must show purpose, context, strengths/limits recorded by the source,
   prerequisites, access/cost label and the skills or competencies each tool
   supports. It must not rank a tool as “best” without source evidence.
4. Skills and competencies may be compared when their outcomes or use are
   genuinely distinct. The screen must explain that a competency combines
   multiple skills and must not compare it as if it were another tool.
5. Certifications may be compared when they serve the same stated route. The
   screen must show local/global scope, credential type, entry/eligibility
   evidence, issuing body and whether it is required, useful, or reference-only.
   Missing evidence must remain visible as unavailable, not guessed.
6. Domain, subgroup and role comparison is not a default feature. Their cards
   are for progressive selection and understanding; compare them only where
   the data contract supplies equivalent fields and the user has a clear
   decision to make.

The audit must verify that comparison controls are not confused with guidance
selection. A tick selects an active guidance item, a compare control adds an
item to a comparison set, and a resource/external-link icon opens a source.
These actions must remain visually and behaviourally distinct.

## Confirmed data blockers

1. The clean Sociology curriculum contract is local and has not proved a live
   Supabase deployment. Student curriculum must remain unavailable rather than
   falling back to legacy arrays when the contract is absent.
2. The reviewed D078 foundation/context/resource tables are additive. A missing
   table or missing owned row cannot be filled with role aggregates.
3. `Biometrician` is source-backed in D078 but is also present in Data Science;
   its presence alone does not prove that it belongs in the Computational Social
   Science subgroup for the student route. Its subgroup assignment and method
   evidence require an explicit role/subgroup review gate.
4. University abbreviations, qualification, subject pools and exception text
   are not uniformly exposed by the current offering contract. The UI must show
   only fields actually returned by source-backed data.
5. Current test configuration does not yet prove the route. The Jest project
   currently reports `Preset jest-expo not found` despite the package being
   installed; this is a test harness blocker, not evidence that the flow works.

## Ordered implementation plan

### Phase A — contracts and safety gates

1. Add explicit preview and offering-display fields to the TypeScript/API
   contract, preserving null/unavailable state.
2. Add a relationship-aware continuation contract for subgroup and role pages:
   programme contribution, inherited domain foundation, subgroup additions,
   role-specific items and item relationships.
3. Filter student payloads by exact ownership, review state, context level and
   exact role evidence. Keep legacy arrays and unresolved role assignments for
   staff audit only.
4. Keep Direct Entry out of all current student/JAMB/SS responses.

### Phase B — programme and university hand-off

1. Make the early-secondary programme state a concise preview only.
2. Replace the inline/modal university list with one dedicated grid state.
3. Remove duplicate `View details`/`Add to compare` actions.
4. Add full-name/address/abbreviation/source-status display where available.
5. Make comparison explicit and bounded to the same JAMB programme.
6. Make selected-university overview the only guided requirements surface and
   make Back/Change university deterministic.

### Phase C — programme learning

1. Replace the course wall with a small set of contract-derived learning cards.
2. Render `How you will use what you learn` as actionable ability cards.
3. Attach programme books/open materials beside the learning card they support.
4. Keep raw source wording and locators staff-only.

### Phase D — domain and subgroup

1. Rebuild Social Sciences as one narrative: programme connection → field
   explanation → domain foundation → connected item cards → subgroup grid.
2. Use `Overview` and `Build in this domain` as peer tabs; remove inline Build
   from the learning path.
3. Rebuild subgroup cards as a grid and show inherited/added continuation.
4. Replace `clusterSkills` chips and generic blocks with reviewed contextual
   item cards. Do not show an empty legacy fallback as guidance.

### Phase E — role

1. Add parent domain/subgroup context to the role payload.
2. Rebuild the role opening around work, problems, outputs and applications.
3. Render the four-stage continuation and ordered role preparation.
4. Connect competency → skills → tool alternatives → qualification cards.
5. Remove raw O*NET activity prominence, irrelevant method evidence, Notes and
   debug/source inventory from the focused student surface.

### Phase F — links, selection and verification

1. Migrate every student-facing career link to `ExternalLinkGuard`.
2. Validate URL protocol, ownership, review state and target-name match before
   rendering a link.
3. Add route tests, payload contract tests, negative cross-context tests and
   source-link checks.
4. Render the flow in the browser and verify the cards at desktop and compact
   widths.
5. Update the audit row by row. Sociology is not approved until every row above
   is evidenced as complete.

## Latest observation addendum — 2026-09-18

The following observations are now part of the Sociology closure goal. They
must be closed in the Sociology route before the pattern is propagated to the
other programmes and their downstream mappings.

### Programme and university hand-off

- The starting point must render immediately while slower saved-guidance or
  draft requests continue independently.
- Early-secondary users see a short, source-derived programme preview first.
  The preview explains what the programme is about, what a student may study,
  and that universities set their own requirements. It does not show domains,
  subgroups, roles, admission requirements or a university list below the
  preview.
- `View universities` opens a dedicated university grid. Selecting a
  programme search result closes the programme search state and moves to this
  grid; it must not expose university offerings inside the search bar.
- University cards show the same JAMB programme identity, the authoritative
  full institution name and abbreviation when the source provides both, and
  the address when recorded. The system must not expand an abbreviation from
  memory or display an invented address.
- `Select university` is the active route tick. `Select for comparison` is a
  separate comparison control and `Compare selected universities` remains
  available after at least two offerings are selected. Comparison is only for
  the same JAMB programme and must name every field being compared.
- After a university is selected, the programme overview becomes
  university-aware. It explains the general JAMB starting-point requirement,
  the exact rule recorded for that university, any subject pool behind phrases
  such as “three Arts or Social Science subjects”, the address and any
  university exception. There is no detached Requirements tab in the guided
  path.
- Browser Back and the visible Back action from university selection return to
  the programme preview; Back from the selected-university overview returns to
  the university grid. Domains cannot be opened before that overview.

### Programme learning presentation

- Remove developer-facing labels such as “student-friendly view of the
  programme's curriculum records”, “the shape of the programme”, raw outcome
  counts and source-search controls from the student route.
- Curriculum themes are synthesized into explanatory cards. Each card must
  explain what the student will learn, what kind of questions or work it
  supports, and how it fits the programme. `You will learn to ...` language is
  preferred over copied source imperatives.
- “How you will use what you learn” is a bounded set of synthesized ability
  cards. It must exclude shared or unrelated outcomes unless the cleaned
  contract explicitly assigns them to Sociology.
- Course titles and source evidence can be opened as structured supporting
  detail, but the raw outcome wall, parser annotations, LIS exceptions and
  source locators remain staff-facing.
- Programme books and free/open learning materials are embedded beside the
  learning explanation they support. Each link is item-specific, labelled by
  provider and access type, and opened through the external-link confirmation.

### Social Sciences and downstream Sociology path

- Social Sciences must render as a narrative, not as a local-context/source
  inventory: why Sociology connects to the domain, what Social Sciences
  studies, the questions it asks, what people do, where Sociology fits, what
  foundations come first, and which areas can be explored next.
- Domain-owned foundation items appear before specialisation. They flow into
  skills, competencies, optional tools and qualification/reference routes.
  Role-frequency aggregates, generic source categories and Facebook/browser/
  office-app noise stay staff-audit-only.
- The domain has two peer tabs: `Overview` and `Build in this domain`.
  Build is a separate product for projects, services and ventures; it is not
  mixed into the learning sequence.
- No flat role list, repeated “Understand this area” hero, raw local-context
  wall, “Some evidence needs review” notice, or “Locked” shell may appear on
  the student domain surface.
- Subgroup cards are a grid. A subgroup explains what carries over from the
  domain, what it adds, the purpose-first skills/tools/competencies and the
  roles belonging inside it. Roles are never presented as independent domain
  roles.
- Role cards and role detail must explain work, problems, outputs and uses,
  then show the ordered continuation from programme learning to domain
  foundation, subgroup additions and role preparation. Raw O*NET/ESCO fields
  are supporting evidence, not the main narrative.
- Methods are folded into the skills/competencies path. They are not shown as
  a separate qualification or as evidence inherited from a broad subgroup
  unless the exact role is named.
- Every skill, tool, competency, certification, qualification, programme
  reading and downstream resource has its own verified link or an explicit
  no-link state. Competencies explain their component skills and tool options;
  tools explain purpose, alternatives and complements; certifications state
  Nigerian, global or shared scope and whether they are a licence,
  examination, qualification, training route or reference body.

### Admin and later scaling

- The student route is concise and synthesized. Admin programme intelligence,
  skills-gap and explore guidance retain granular curriculum, source and
  provenance evidence, but use admin-specific language and must still preserve
  the same programme → domain → subgroup → role ownership rules.
- Skills gap must compare what the institution teaches with what the relevant
  domain, subgroup and role records require or use. It must explain what is
  missing, how it builds on teaching, why it matters and how the items relate;
  it must not call unavailable or unseeded data “market evidence”.
- After Sociology is signed off, apply the same contract and render pattern to
  direct, functional and adjacent mappings, including partial CCMAS,
  programme-split, mixed CCMAS and external, and no-CCMAS programmes. Do not
  scale a fallback or copy Sociology prose into another programme.

### Cross-domain audit obligations captured before scaling

The next implementation pass must not treat the Sociology cleanup as a local
visual patch. Before the pattern is propagated, audit the complete downstream
payload and render path for every visible domain and its focused areas:

- The starting point, programme search and university search must appear as
  soon as their own data is ready. A slow saved-guidance or background request
  must not delay the first useful card or make the route look empty.
- Programme selection must have three tested behaviours: search by programme
  alone goes to the programme preview and then the dedicated university grid;
  programme-plus-university selection opens the same university-aware overview;
  and subject matching opens the same preview using the user-type subject
  gate. No route may expose the old side-by-side programme/subject explorer as
  a completed onboarding result.
- The same upgraded domain, subgroup and role cards must be used from Explore,
  the saved guidance path, programme-to-domain guidance and admin guidance.
  Admin and institution routes may retain granular curriculum, source,
  provenance and review evidence, but they must use their own language and
  must not leak staff audit labels into the student surface.
- Skills-gap views must distinguish: what the institution teaches; what the
  directly connected domain, its focused areas and its roles use; what is not
  present in the curriculum; how the missing item builds on existing teaching;
  why it matters; and how skills, competencies, tools and qualification
  routes relate. A missing or unseeded dataset must be labelled unavailable,
  not described as market evidence.
- Direct, functional and adjacent results must retain their recorded type and
  use the programme-specific explanation. This includes partial CCMAS
  programmes, a JAMB name split from one CCMAS programme, combinations of
  several CCMAS programmes, external-only programmes and programmes with no
  CCMAS curriculum. Each case needs its own curriculum provenance and
  downstream evidence; no generic Sociology copy or fallback mapping is
  allowed.
- A missing address, qualification, abbreviation, requirement or source link
  must be omitted or honestly marked unavailable according to the surface. Do
  not render placeholders such as “Address not recorded”, “Some requirements
  need review”, “Locked” or “No verified link” as if they were product facts
  when the user-facing design can simply omit the field. Staff views may show
  the review state.
- Audit every named skill, tool, competency, certification and resource for
  category correctness, ownership, purpose, relationships, source status and
  an active item-specific link. Generic categories, office-app noise,
  browsers, social platforms, duplicated domain tools, unrelated software and
  source taxonomy labels must not become student recommendations. Each tool
  must explain its purpose, alternatives and complements; each competency must
  name the skills and tool options it combines; each certification must state
  whether its scope is Nigerian, global or shared and whether it is a licence,
  examination, qualification, training route or reference body.
- “See more” must expand the correct card or open the correct detail space.
  It must never dump an unstructured list of all tools, raw source phrases or
  unrelated context items. Report output must show optional tools as optional
  choices and must not imply that every named tool is required.
- Role work labels must be rewritten into student language. Internal labels
  such as “Where this work is reported”, “Contact With Others” and
  “Consequence of Error” are evidence fields, not headings for the student
  narrative. The student should see what the role does, the problems it helps
  solve, the outputs it produces and where that work may be used.
- The final report remains unavailable until the student completes the guided
  selection. Download, print and share actions are icon controls after that
  point, and the report must carry the same programme, university, domain,
  subgroup, role, optional-tool and qualification distinctions as the live
  cards.

The order is deliberate: finish and verify Sociology first, merge its approved
contract/render pattern into the shared downstream path, then run the
all-programme audit and only afterward correct domain-specific outliers such
as duplicate tools or missing adjacent links. Agents may assist with isolated
read-only audits, but no parallel change may bypass the shared ownership,
source-link, user-type and review-state contracts.

## Acceptance gates

Sociology can only be marked complete when all of these are true:

- no university cards appear under preview;
- no requirements/domain content appears before university selection;
- comparison contains only the same JAMB programme identity;
- selected-university overview contains labelled national and university rules;
- domain cards are relationship-grouped and open directly;
- the domain has no flat role list, legacy local-context wall or locked state;
- subgroup roles are grid cards and belong to that subgroup;
- role methods never appear from subgroup evidence unless the exact role is named;
- each student-visible item has a verified item-specific link or honest no-link
  text;
- the continuation labels inherited and added items at every downstream level;
- print/download/share remain unavailable until guidance review is complete;
- local checks, API contract checks and browser smoke checks pass; and
- all live-data-dependent gates are explicitly marked blocked until the user
  confirms the required SQL has been applied to Supabase.

Until these gates pass, the implementation status remains **open**.

## 2026-09-19 local implementation update

The active Sociology implementation now follows the method and ownership rules
above in the local code path. Methods are embedded only in the expanded skill
or competency card with the exact matching capability name; unmatched method
records are not shown as a separate student section. Competency relationships
are resolved against all context items, including filtered skill and tool
targets. D078 roles require an exact case-insensitive role-owned context record
before they can appear to students.

Verification: TypeScript passed, the Vite web build passed, the backend suite
reported 335 passed, and a direct D078 route smoke passed. The local D078
contract currently contains 727 source-referenced/source-located rows across
domain, subgroup and reviewed role ownership. This does not prove that the
same records are deployed in Supabase.

The Sociology gate remains open for browser interaction proof, live offering
payload proof, item-specific URL and relationship review, final content review,
legacy source-branch cleanup and report-gate verification. Do not scale the
pattern to all programmes until these gates are evidenced.

## 2026-09-19 visible report-gate agent checkpoint

Pasteur's local commit `187784c` adds the completed-Review gate for report
print/download/share actions and reopens the route when a selected item
changes. It is local evidence only: the focused Jest test cannot run because
the checkout lacks the Jest Expo/circus runner, and browser/live report
verification remains outstanding. Avicenna and Huygens remain open.

The browser gate remains explicitly open: no browser surface was available to
computer-use, and the local Vite dev server hit the managed-workspace access
restriction while resolving its config. No browser result is inferred from
the successful build.

## 2026-09-18 documentation-only pass cross-reference

The detailed active-route audit is recorded in
`SOCIOLOGY_BOX_MOCKUP_IMPLEMENTATION_AUDIT_2026-09-17.md`, under
`2026-09-18 documentation-only active-route audit pass`. It confirms that the
local mounted branches now use the intended programme preview/university grid,
selected-university overview, domain orientation/Build split, subgroup grid and
role card path, but it does **not** approve Sociology for propagation.

The remaining closure blockers are the missing route-level interaction proof,
the subgroup method-to-item presentation, the role context-item type/duplicate
audit, the record-level verification of every item-specific link and
relationship, and the manual Supabase migrations/seeds required for the live
payload. The detailed audit preserves the distinction between local code
evidence and live deployment evidence. Downstream all-programme propagation
must wait for the Sociology status to change from **OPEN — not approved**.
 
## 2026-09-19 local integration checkpoint

The local Sociology route smoke passed five focused transitions: programme
preview, university context, D078 domain, subgroup and role. This is
route-helper evidence only; browser, live-payload, item-link, relationship,
certification and completed-review report gates remain open. Do not scale yet.

### 2026-09-19 admin/institution checkpoint

Verified local changes now cover the remaining admin/institution acceptance
surfaces: authoritative organisation identity presentation, registry-backed
university identity propagation in subject-match offerings, and explicit
SkillsGap partitions for taught, bridge/gap-review, and source-review records.
The focused backend suite (92 tests), TypeScript check, Sociology route smoke,
and production build passed. Live SQL remains unapplied; browser and live
payload proof remain open, so the scaling boundary is unchanged.

### 2026-09-19 admin/institution checkpoint

Verified local changes now cover the remaining admin/institution acceptance
surfaces: authoritative organisation identity presentation, registry-backed
university identity propagation in subject-match offerings, and explicit
SkillsGap partitions for taught, bridge/gap-review, and source-review records.
The focused backend suite (92 tests), TypeScript check, Sociology route smoke,
and production build passed. Live SQL remains unapplied; browser and live
payload proof remain open, so the scaling boundary is unchanged.
## 2026-09-19 integrated Sociology agent verification

`f57e4da` integrates the student ownership, relationship, resource, method,
certification and role-continuation hardening. `e1635fc` integrates the
admin/institution context and teaching-record language fixes. Local checks
pass: 336 backend tests, larger-heap TypeScript, five route-smoke transitions
and the production web build. Browser/live-payload/report E2E evidence is
still unavailable; no Supabase SQL was applied and Sociology is not approved
for scaling.

### 2026-09-19 bounded report-gate smoke

The non-Jest `scripts/sociologyReportSmoke.cjs` harness passed locally. It
exercises the real readiness/selection transitions and scaffold action guards:
print/download/share are locked before Review, reopen after completion, relock
after a selection change, and reopen after re-review. This does not replace
browser or live Supabase verification; the scaling boundary is unchanged.

### 2026-09-19 Sociology source audit boundary

The new local audit separates approved reviewed resources from the broad
catalogue and reports review-only/audit-only/not-established states explicitly.
For D078 it found no unsafe relationship rows: all 2,519 normalized edges are
source-backed and resolve to typed items. All 725 source-backed/owned items are
metadata-ready; generic credential signals remain audit-only and are not emitted
as student-facing certifications. It also found 51 reviewed resource rows, 27
item-specific matches and 698 honest missing-link states. Live Supabase application, URL
reachability and browser verification remain open.

### 2026-09-19 live deployment boundary

The read-only live preflight is ready for existing base surfaces, but Sociology
cannot be approved: the current project lacks the curriculum-outcome,
programme-domain-evidence and relationship tables and exposes an older shape
for contextual ownership/resource metadata. Manual migration and seed apply,
followed by post-apply counts and browser verification, is still required.

### 2026-09-19 admin/downstream acceptance checkpoint

The local admin/institution pass checks the Sociology failure modes across the
complete 237-programme and 420-JAMB boundary: provenance, explicit review
queues, context/owner alignment, student-exposure blocking, route-bound report
actions and authoritative institution identity. The one unmapped programme
(`Sciences::Mathematics`) and unresolved relationship rows remain explicit
backlog entries. Full admin rendering, browser proof and SQL remain deferred.

### 2026-09-21 full-population downstream/admin audit checkpoint

The local top-down contract audit is complete across 237 programmes and 420
JAMB identities. All 237 programme routes have domain-to-subgroup-to-role
continuity; 1,344 domain, 3,580 subgroup and 46,941 role routes resolve across
5,668 contexts. The checkpoint records card summaries/friendly titles, bounded
role learning-needed skills, source/link state, relationship grouping,
admin provenance/review queues and student-safe filtering. Local checks pass,
but scaling remains unapproved while review queues, 2,305
not-established/unresolved contextual edges, full rendered admin acceptance,
browser proof and manual Supabase verification remain open. No UI or SQL was
changed.

### 2026-09-21 role work-profile continuation

Role work-profile tranche 003 audited queue positions 41-60 without overlap
with tranches 001-002. The evidence ledger preserves authoritative ESCO
identity data and local source locators, while the unavailable public API
transport leaves the online identity state unconfirmed. All 20 decisions are
`review_required`; no profile, role mapping or student-facing preparation
content was invented. The role-work-profile contract therefore remains open
for the remaining 59 missing profiles and any later authoritative review.

### 2026-09-21 role work-profile tranche 005

The next non-overlapping missing-role slice, queue positions 81-100, was
audited read-only. Fifteen O*NET identities were verified through official
summary URLs; five ESCO identities retain exact local authority records and
skill-relation locators. Every row remains `review_required`, with no invented
work-profile fields, Nigerian mapping or student-facing role preparation.
Nineteen missing profiles remain. This is evidence for the downstream audit,
not approval of the role route or live deployment; browser, live payload and
manual SQL gates remain open.

### 2026-09-21 item-enrichment tranche 007

The next 32 canonical item identities outside D078 and prior item tranches
were searched read-only. The tranche closed with 21 linked records and 11
`review_required` records; no broad or ambiguous source was promoted as an
exact contextual match. Selection/ledger parity and non-overlap checks passed,
and each evidence row retains an item-specific URL, locator, source summary and
access date. This changes the external-search audit inventory only; the
2,305 unresolved relationships, remaining item/role review queues, browser
proof, live payload checks and manual SQL remain open.

### 2026-09-21 item-enrichment tranche 008

The next 32 canonical item identities after tranche 007 were searched
read-only, excluding D078. Twenty-one were linked to authoritative
item-specific evidence and eleven remain `review_required` because the evidence
is retired, broad, combined or context-ambiguous. The append-only ledger passed
selection/ledger parity, non-overlap, HTTPS and required-field checks. This
updates the external-search inventory only; no relationship was promoted and
the 2,305 unresolved relationships, remaining review queues, browser proof,
live-payload checks and manual SQL remain open.

### 2026-09-21 item-enrichment tranche 010

The next 16 non-overlapping item identities were searched read-only outside
D078. Fourteen carry authoritative item-specific evidence and two remain
`review_required` because the available source did not name the exact combined
catalogue competency. The append-only ledger passed parity, non-overlap,
required-field and HTTPS checks. No relationship was promoted and no UI,
catalogue, seed, SQL or browser-proof file was changed.

### 2026-09-23 current execution-order clarification

The dated closure notes above are historical checkpoints. For the current
scaling phase, local subject/JAMB audits, the corrected all-420 JAMB resource
check and the full 420-JAMB/237-CCMAS downstream/admin checks occur before any
SQL. SQL remains the final manual deployment phase, with contextual migrations
and curriculum seeds applied in dependency order and the 35 compressed
contextual parts loaded last in numeric order. No local result in this document
is a live Supabase deployment claim.
