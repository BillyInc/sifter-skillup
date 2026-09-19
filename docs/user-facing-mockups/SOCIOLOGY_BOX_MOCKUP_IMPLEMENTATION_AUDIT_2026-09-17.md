# Sociology box-mockup implementation audit

Date: 2026-09-17  
Scope: Sociology programme → university offering → domain → subgroup → role  
Authority: `docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md` and the cleaned Sociology
contract

This is an implementation audit, not a declaration of completion. It records
what was verified from the current repository and what still has to be closed
before the Sociology slice can be approved or scaled.

## Evidence inspected

- `data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json`
- `data/career-mapping/_audit/PROGRAMME_CURRICULUM_DATA_QUALITY_2026-09-17.md`
- `backend/routes/career_routes.py`
- `src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx`
- `src/screens/careerIntelligence/DomainDetailScreen.tsx`
- `src/screens/careerIntelligence/SubgroupDetailScreen.tsx`
- `src/screens/careerIntelligence/RoleDetailScreen.tsx`
- `src/components/careerIntelligence/DegreeSkills.tsx`
- `src/components/careerIntelligence/ContextualItemList.tsx`
- `src/components/careerIntelligence/ToolGroupsBlock.tsx`

## Data gate result

The local Sociology contract currently contains 34 courses, 243 course-outcome
rows, 234 unique normalised outcomes and 7 separately stored programme
abilities. The contract quality gates passed:

- student outcome text contains no parser annotation;
- the LIS exception is excluded from student output;
- every outcome has a course/source locator;
- abilities remain separate from course outcomes; and
- role-aggregated foundation rows are not included.

The Sociology mapping currently has 6 approved student-facing programme-domain
edges and 1 review-only edge. The review-only edge remains excluded from the
student route.

The exhaustive subject matcher audit also passed with zero oracle mismatches:

```text
active options: 165 O-level, 377 UTME
catalogue subjects: 46
options: 542
typed rules: 1260
false-positive oracle mismatches: 0
negative mutation cases: 192
```

These results prove local contract and matcher integrity. They do not prove that
the corresponding SQL has been applied to Supabase.

## Screen contract audit

| Surface | Current result | Evidence / remaining gap |
| --- | --- | --- |
| SS1/SS2 preview boundary | Partial | The guided route hides requirements, domains and downstream content before a university. The preview is still dependent on the older `overview` field and a teaser, so a JAMB identity without a trusted overview can be too thin. It needs a contract-derived short preview or an honest unavailable state. |
| Preview → university selection | Corrected locally | Guided selection now uses the `university_offerings` route stage. The route is kept in browser history, and visible Back returns to the preview. |
| University offering identity | Partial | Full university name, programme name and address are rendered where present. The current school contract has no separate abbreviation field, and qualification is not shown on every offering card. Do not invent abbreviations; add/display them only when source data provides them. |
| University comparison | Partial | Comparison is optional and states that the programme remains the same. It shows address and requirements, but the card must be checked to ensure qualification, verified subject pools and additional notes are present whenever the source provides them. |
| Selected-university overview | Mostly aligned | Guided requirements are inline after selection and the separate requirements tab is hidden. National guidance and the university-specific rule are distinguished. The full route still needs an interaction test proving that a selected offering carries its university context into domain navigation. |
| Curriculum presentation | Not yet approved | `DegreeSkills` groups courses and progressively reveals outcomes, but the student still sees source-shaped outcome sentences and course counts. It does not yet provide the small number of synthesized, explanatory learning cards required by the box contract. Programme resources are currently shown in a summary block rather than beside the learning explanation they support. |
| Programme abilities | Partial | The cleaned contract separates abilities and uses student text, but the component still introduces them as recorded curriculum metadata. They need to be rendered as concise actions under `How you will use what you learn`, with unrelated/shared material excluded by the contract. |
| Programme → domain transition | Partial | Cards are grouped and clickable with no extra Continue button. The domain endpoint carries a programme-specific connection when the evidence row is approved. The programme screen’s card copy is still generic and should use the returned relationship evidence rather than only generic direct/functional/adjacent wording. |
| Domain overview | Partial | Roles are not rendered as a flat domain list and the separate Build tab exists. The domain currently repeats foundation content in `Your learning path` and `FoundationSkillsBlock`; this must be consolidated. Legacy context inventory components remain available elsewhere but are not the intended main domain presentation. |
| Domain item relationships | Not yet approved | Context items can explain meaning, use, priority and related items, but the live screen does not yet consistently present the complete foundation → skill → tool option → competency → qualification chain as one connected explanation. |
| Subgroup grid and continuation | Partial | Subgroups and roles use grids, and programme context is now passed into subgroup requests. Inherited foundations are currently limited to a few chips and the subgroup tools/resources are still separate blocks. The continuation needs explicit inherited-versus-added presentation and item-level links. |
| Role route and continuation | Partial | Roles are entered from a subgroup and programme context is passed to the role endpoint. The role page has separate skills, tools, methods and credentials sections, but it does not yet consistently synthesise their relationship into the ordered practical sequence in the contract. |
| Resource links | Partial | Ownership and approval filters are enforced in the API, and links can be attached to contextual items/tools. The UI still falls back to source-category wording such as `Recorded in source evidence for ...` when a specific resource is absent. Each displayed item must have either its own verified link or an explicit no-link state. |
| Report gate | Not yet signed off | Detail surfaces do not expose report actions before completion. The Review route and generated report still require a focused end-to-end check proving that only completed, selected guidance is printable/downloadable/shareable. |

## Explicit icon and link audit

The box mock-up is not complete unless the visual language and resource
behaviour are implemented with the cards. The approved existing icon registry
must be used for programme/book, university/location, check/select, compare,
Back, domain, Build, subgroup, role, skill, tool, competency, certification,
curriculum, source and external-link meanings. Icons must be paired with the
item label or an accessible label; the Sifter brand mark must not be reused as
an item icon, and no black or white lightning/zap square may appear anywhere
in the route.

The audit must inspect the actual programme preview, university grid and
comparison, selected-university overview, domain, subgroup, role, curriculum
cards and final report actions. It must verify that selection uses a tick,
comparison uses a distinct compare control, every detail screen has a visible
Back action, and Build is represented as a separate domain tab/action rather
than being mixed into the learning path.

Every student-visible learning resource, programme book/material, curriculum
reading, foundation, skill, tool, competency, method, certification,
qualification, subgroup item and role item must have its own item-level
verified link beside the item. A link must resolve to the exact HTTPS learning,
documentation or official-information destination for that item and must open
through `ExternalLinkGuard`. Generic provider homepages, search URLs, category
labels, unrelated links and one shared footer link do not satisfy this gate.
The card must explain what the item does in the current programme/domain,
subgroup or role context and, where relevant, how it works with related skills,
tools, competencies or qualifications. Missing links must be shown honestly as
`No verified link is available yet`; unowned, unreviewed, role-aggregated and
generic source-category rows remain staff-audit-only.

The closure report must include a per-surface icon/link result, the exact
component responsible for each link, and a static check that no student career
component directly calls `Linking.openURL`. A Sociology flow cannot be marked
complete while any one of these icon or per-item-link checks remains partial.

## Capability relationships and comparison checks

### Purpose-first tool pathway

The D078 domain tool problem is now resolved as a data-boundary issue rather
than by exposing the old aggregate list. The additive
`migration_sociology_domain_tool_path_2026-09-18.sql` promotes only named tools
repeated across at least five reviewed D078 role records into an optional
domain pathway: Excel, SPSS, Python, R, SAS, SQL, Power BI, Tableau, ArcGIS
and Access. This does not call them required, current-demand ranked or equally
useful for every route. The source category remains attached so the UI can
start with the student's purpose—collect, organise/query, analyse, compute,
map, or communicate—then show the tools as options for that purpose.

The student sees one starting purpose and a bounded set of options, followed
by the alternatives/complements that the explicit relationship data supports.
The migration stores `purpose_key`, `purpose_label`, `purpose_description` and
`purpose_source` on the named D078 domain-tool rows so the purpose grouping is
data-backed when the live response contains those fields; the UI fallback is
only for older subgroup/role rows. The collapsed view keeps every purpose
visible and limits the number of options inside each purpose, rather than
cutting the global list at an arbitrary position and accidentally hiding a
whole purpose.
The same tool can reappear at subgroup or role level with a narrower use. A
tool link is attached to that tool card; it is not replaced by one generic
resource footer. The promotion migration also creates `not_established`
relationship coverage for promoted tools where the reviewed source does not
prove a specific skill, competency or certification dependency.

The student-facing cards must show the relationship, not just place skills,
tools, competencies and certifications beside one another. The expected chain
is:

```text
programme learning → domain foundation → skill/method → competency outcome
  → tool options → applicable qualification/certification/training route
```

Each item must state what it does in the current context, what it builds on,
what it works with, whether it is a foundation/addition/role-specific item,
and whether the tools are alternatives, complements or examples. A competency
is an outcome produced by combining knowledge, skills, methods and judgement;
it is not a synonym for a skill, tool or certification. A certification must
state whether it is Nigerian, global or shared, and whether it is a licence,
examination, qualification, training route or reference body. No relationship
may be invented from a name, proximity in a list or a generic source category.

The audit must also verify comparison boundaries:

- university comparison is only between offerings of the same JAMB programme
  and includes identity, full name/address, requirements, expanded subject
  pools, exceptions and data status;
- programme comparison, when explicitly requested, keeps curriculum,
  offerings and downstream connections separate and never merges requirements;
- tool comparison is only between tools serving the same evidenced purpose and
  shows context, alternatives, access/cost and supported skills or
  competencies without an unsupported “best” ranking;
- skill/competency comparison preserves the distinction between an ability and
  the broader outcome it helps produce;
- certification comparison states scope, credential type, issuing body,
  eligibility and whether it is required, useful or reference-only; and
- domain, subgroup and role cards are progressive guidance cards, not default
  comparison tables unless equivalent data and a real user decision exist.

The tick for guidance selection, compare control and external-link control must
remain distinct in icon, label, state and behaviour. The Sociology closure
report must include a relationship and comparison result for programme,
university, domain, subgroup and role surfaces, not only a link inventory.

## Required closure before Sociology approval

1. Add a route-level regression test for:

   `preview → university_offerings → selected university overview → domain → subgroup → role`.

   It must assert that Back returns to the immediately preceding guidance
   surface and that the programme, JAMB identity and university context are
   preserved.

2. Replace the current course/outcome wall with the approved synthesized
   Sociology learning cards. Use only the cleaned contract and its locators;
   do not add hardcoded Sociology summaries or borrow legacy arrays.

3. Move programme reading links beside the learning explanation they support,
   and make every displayed skill, tool, competency, certification and reading
   item resolve to its own verified target or show an honest missing-link
   state.

4. Consolidate the domain foundation presentation so the student sees one
   ordered foundation path, followed by connected domain items and then the
   subgroup grid. Remove the duplicate foundation block.

5. Make the domain, subgroup and role continuation explicitly distinguish:

   - what the Sociology programme contributes;
   - what the domain contributes;
   - what the subgroup adds; and
   - what is specific to the selected role.

6. Add the missing offering display fields only from source-backed records:
   abbreviation, qualification and verified subject pools where available.
   Missing values remain omitted or clearly unavailable; they are not inferred.

7. Run the final browser/UI regression and report review after the above
   changes. Only then can this audit be changed from partial/not approved to
   passed and used as the template for other programmes.

## 2026-09-18 local closure addendum

The local implementation has now closed the main presentation gaps identified
above. The programme screen uses a short contract-derived preview before a
university is chosen, then shows the full learning view only after the
selected-university context is known. The full learning view is made of
bounded explanatory cards derived from the cleaned curriculum contract, with
course titles and summaries progressively disclosed instead of a raw outcome
wall. Programme reading links are placed beside the learning card they match.

The active domain, subgroup and role routes now use the box contract locally:
programme-specific connection context, domain-owned foundations, purpose-first
tool options, typed item relationships, subgroup grids, role grids, separate
Build-in-domain navigation, and item-level verified-link or honest no-link
states. Roles remain downstream of subgroups and are not rendered as a flat
domain list. Print/download/share controls remain gated until the review step;
detail screens expose only the guidance selection tick.

Local verification completed after this change:

- TypeScript check passed with no diagnostics.
- Vite production build passed. Existing unrelated duplicate-key and large
  chunk warnings remain.
- Backend Python compilation passed.
- Diff whitespace check passed.
- No student career component directly calls Linking.openURL; only the shared
  external-link guard does.
- Clean Sociology contract audit passed: 34 courses, 243 course-outcome rows,
  234 unique normalized outcomes and 7 abilities.
- Exhaustive subject matcher audit passed with zero oracle mismatches.

Live Supabase remains a separate deployment gate. The current partial live
database does not yet contain the domain-owned guidance and relationship
layers, so its domain page can still show only the shell. The user must apply
the documented migrations and seeds before live domain/subgroup/role content
can be signed off. The missing jest-expo preset also prevents the existing
route interaction test from running.

## 2026-09-18 item-card and information-partition audit

The current renderers do not yet fully meet the refined box contract. The
important distinction is between a parent grouping and an item card:

| Surface | Current renderer | Audit result |
| --- | --- | --- |
| Domain foundation | One large foundation card containing foundation skills, contextual items, tools and qualifications | Needs partition into an ordered foundation path, a domain skills/competencies group, purpose-grouped tool cards and qualification cards. The large wrapper currently makes unrelated data feel like one list. |
| Domain tools | `ToolGroupsBlock` groups tools by purpose but renders each named tool as a chip | Not approved. Each named tool needs its own compact card with purpose, contextual use, relationships, specific link and honest no-link state. The purpose group should remain the parent grouping. |
| Domain skills/competencies | `FoundationSkillsBlock` and `ContextualItemList` are both present | Partial and potentially duplicative. One student-facing item-card renderer must be used; role-aggregated or generic source-category rows remain hidden. |
| Domain qualifications | `CertPlacementList` is a separate block | Directionally correct, but each credential needs its own card with type, Nigerian/global scope, applicability, relationship and official link/source evidence. |
| Subgroup inheritance | A short inherited foundation chip/summary is shown | Directionally correct. It must remain a summary entry into the domain foundation, not a second domain inventory. Subgroup-owned additions must use the same individual item-card anatomy. |
| Subgroup tools | `ToolGroupsBlock` again renders purpose-grouped chips | Not approved. Replace chip-only presentation with individual tool cards inside purpose groups. |
| Subgroup methods | `MethodEvidenceBlock` is a separate method section | Keep as a separate concept, but use compact method cards with use, timing, limitation and source action. |
| Subgroup roles | Role grid cards | Approved as the entry pattern. The card opens the role page and must not duplicate role details inline. |
| Role skills/tools/certifications | Separate item grids already exist, alongside `ContextualItemList` | Partial. Keep the separate conceptual headings, but remove duplicate student-facing item rendering. Feed all three through one item-card anatomy and show relationship/source details inside the relevant card. |
| Relationships | Relationship names are shown in several places | Partial. A relationship is not complete until its status and supporting source references are available inside the expanded relationship block. `not_established` edges must not be shown as student guidance. |
| External sources | Item-level learning links can render through `ExternalLinkGuard` | Partial. The item-specific learning/official link and the supporting evidence source must be visually distinct and both belong inside the item card. A shared source footer is insufficient. |

### Binding display decision

Yes: each named tool gets its own separate compact card. No: each tool does
not need its own page or a giant full-width section. The purpose group is the
section; the tool card is the inspectable unit inside it. The same rule applies
to skills, competencies, methods and certifications. A chip may be used only
as a non-actionable summary label, never as the only representation of an
item that has a meaning, relationship or external link.

The page hierarchy is therefore:

```text
Domain page
  -> ordered foundation path
  -> domain skills and competencies (individual cards)
  -> tools by purpose (purpose sections -> individual tool cards)
  -> qualifications and professional routes (individual cards)
  -> subgroup grid

Subgroup page
  -> inherited domain foundation summary
  -> subgroup skills and competencies (individual cards)
  -> subgroup tools by purpose (individual cards)
  -> subgroup methods (individual cards)
  -> subgroup qualifications (individual cards)
  -> role grid

Role page
  -> work, outputs and application context
  -> programme -> domain -> subgroup -> role continuation
  -> preparation sequence
  -> role skills (individual cards)
  -> role tools by purpose (individual cards)
  -> role qualifications (individual cards)
```

This partition is now specified in the controlling mockup at
`docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`, section `6A. Card partition
refinement`. It must be implemented before the Sociology slice is marked
closed. The live Supabase seed remains a separate gate; rendering a card with
no live record must produce the documented honest empty state, not fabricated
content.

## Current decision

The Sociology data contract and local matching gate are sound enough to support
continued implementation. The Sociology box-mockup implementation is **not yet
closed**. The next work is UI contract closure, followed by the route, payload,
resource-link and report regression checks described above.

## 2026-09-18 domain-introduction correction

The old Social Sciences opening sentence was traced to seeded domain-description
data in `data/career-mapping/domain_meta.json`,
`data/career-mapping/domain_descriptions_draft.json` and the generated career
seed. It was not a React hardcode, although the active screen did use
`domain.description` as its fallback when the structured orientation was not
present. That fallback made an old compressed description look like the final
student experience.

The corrected contract is now explicit:

```text
domain student_orientation
  shortIntro
  whatItStudies
  whatPeopleDo
  questions[]
  outputs[]
  howWorkHappens[]
  whereProgrammeFits
  decisionGuide
  relatedProgrammes[]
  sourceNote
```

The student view presents those fields as a field explanation, question cards,
work-output cards, an ordered work sequence, programme placement and a short
decision prompt. It does not display the old `Local context`, `Context that
supports this guidance` or repeated source-name blocks. Domain-owned reading
links appear in the introduction as individual verified resource cards; they
are not replaced by one generic link at the bottom.

The local implementation includes the additive migration
`backend/migration_domain_student_orientation_2026-09-18.sql`. It has not been
applied to Supabase in this turn. The live domain response will not contain the
new D078 orientation until the user applies that migration, so the live database
remains a deployment gate. The controlling product-wide rendering contract is
in `docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`, section `6B. Domain
introduction: the decision-making explanation`.

## 2026-09-18 relationship review and hierarchy correction

The first seven review-only Adjacent edges identified in the mapping audit were
reviewed against their actual CCMAS course anchors and the target-domain
meaning. None had enough evidence for a student-facing Adjacent connection:

| Programme | Target domain | Finding | Decision |
|---|---|---|---|
| Project Management | Software Engineering | No named software-engineering course anchor; only generic transferable evidence | Remove from active guidance; retain as unverified |
| Securities and Investments Management | Business Intelligence | No named business-intelligence course anchor | Remove from active guidance; retain as unverified |
| Naval Architecture | Architecture | Anchors are naval/ship-design courses; the word `architecture` is a title overlap, not building-architecture evidence | Remove from active guidance; retain as unverified |
| African Languages and Literature Yoruba | Esports & Creator Economy | Linguistics/communication anchors do not establish an esports or creator-economy bridge | Remove from active guidance; retain as unverified |
| Education: Chemistry | Medical Laboratory Technology | No named medical-laboratory course anchor | Remove from active guidance; retain as unverified |
| Medicinal Chemistry | Medical Laboratory Technology | No named medical-laboratory course anchor | Remove from active guidance; retain as unverified |
| Zoology | Medical Laboratory Technology | No named medical-laboratory course anchor | Remove from active guidance; retain as unverified |

The same fail-closed rule was applied to the Product Management review set.
The audit contains 71 omitted D033 candidates; they are not active student
connections. Generic words such as `product`, `venture`, `innovation`,
`e-commerce`, `project management`, `product design` and `product development`
do not establish Product Management. The stricter audit now requires explicit
product strategy, requirements, lifecycle, roadmap, discovery, ownership or
delivery-planning concepts. Two previously active D033 links that only had
product-design/development overlap were moved to `unverified_links`; one
Marketing connection remains active because its CCMAS record explicitly covers
the product lifecycle.

The local authoritative mapping now moves these seven rows from `links` to
`unverified_links` with an exclusion reason. The same fail-closed review was
then applied to every active mapping that failed the numeric course/outcome
gate or passed only through generic anchors. The corresponding additive SQL is
`backend/migration_programme_domain_review_corrections_2026-09-18.sql`; it
targets 715 rows for removal from active database guidance and their evidence
rows, without running a taxonomy rebuild. The evidence seed was regenerated
from the corrected active mapping and now contains 1,343 active evidence
records. The audit reports zero active numeric-gate failures, zero active
semantic-review rows, and no review-only Adjacent records left in the active
evidence set. All excluded rows remain available in the source audit as
unverified review records.

Every remaining active row has an explicit `direct`, `functional` or
`adjacent` relationship type; the local type audit found no active row with a
missing or invalid type. Nursing is therefore not missing a hidden Adjacent
label: its reviewed active set is one Direct Nursing edge plus five reviewed
Functional connections, with no source-backed Adjacent edge.

This decision does not invent an Adjacent domain for Nursing. Nursing's
current reviewed mapping contains Nursing as Direct and its recorded
functional health/social-care connections; it has no source-backed Adjacent
edge in the current mapping. Its review-only functional rows remain hidden
until their source evidence is resolved.

The “what the work does” enrichment now applies to the complete hierarchy:
the domain explains the field, the subgroup explains the focused area and what
it adds to the domain, and the role explains the actual work, outputs,
application context and preparation. A role list or a generic domain paragraph
is not an acceptable substitute.

## 2026-09-18 documentation-only active-route audit pass

### Scope and evidence

This pass read `AGENTS.md`, the controlling render contract in
`docs/LEVELUP_PRODUCT_WIDE_MOCKUP_SPEC.md`, this audit, and the top-down
closure plan. It inspected the currently selected render branches in the
programme, admission, domain, subgroup, role, curriculum, item-card, link,
and report-scaffold components.

No source code or SQL was changed in this pass. The findings below distinguish
what is visible in the active local branch from what still needs a test or live
deployment proof.

### Locally evidenced closures in the active render path

1. **Preview and university hand-off:** `ProgrammeDetailRefinedScreen` uses a
   short preview when an early-secondary student has not selected a university.
   The guided preview does not render a university card list, requirements, or
   domain cards below that preview. `View universities` moves to the dedicated
   `university_offerings` route, and a programme search result is routed into
   the same preview/grid sequence rather than the old side-by-side
   subject/programme explorer.

2. **University-aware continuation:** The university grid keeps the same
   programme identity, displays the full institution label when the source
   payload provides it, shows an address only when one is recorded, and keeps
   `Select university` separate from `Select for comparison`. The selected
   offering returns to an inline university-aware programme overview. The
   active guided header exposes Overview and Universities; the detached
   requirements tab is not exposed by that guided header. The selected
   overview is the branch that can expose the programme-to-domain transition.

3. **Programme learning presentation:** `DegreeSkills` no longer renders the
   prior raw outcome wall or raw outcome count as its main surface. It groups
   the checked contract into explanatory learning areas, gives the student a
   bounded practice explanation, reveals course areas progressively, and
   attaches a programme reading only when its target matches the learning area.
   This is a local improvement, not proof that every Sociology learning card
   has a correctly matched book or free learning link.

4. **Active domain shape:** The mounted `DomainBody` is the refined branch. It
   presents the programme-specific connection, structured domain orientation,
   domain-owned resources, foundation sequence, separate skill/competency
   items, purpose-grouped named tools, qualifications, a separate Build tab,
   and a subgroup grid. It stops at subgroups; it does not render a flat role
   list in the active branch. `ToolGroupsBlock` renders named tools as
   individual cards inside purpose groups, not as the old chip-only
   presentation.

5. **Active subgroup shape:** `SubgroupBody` is the mounted branch. It provides
   the programme connection, domain-to-area continuation, inherited foundation
   summary, area orientation, separate skill/competency and tool cards,
   qualification cards, and a role grid. Roles are entered from the selected
   area rather than treated as independent domain entries.

6. **Active role shape:** `RoleBody` is the mounted branch. It provides the
   parent path, programme connection, work narrative, source-backed work
   evidence, a preparation sequence, and separate skill, tool and qualification
   card groups. The cards use the relationship helpers and `ExternalLinkGuard`
   where a source-backed item link is available. The preparation text
   describes methods as part of the ability rather than as a qualification.

7. **Link safety:** The inspected student-facing career components route
   external destinations through `ExternalLinkGuard`; the static search found
   no direct `Linking.openURL` call in the career-intelligence screens or
   components other than the shared guard itself. This proves the link-opening
   boundary, not the correctness or liveness of every stored URL.

8. **Existing local verification retained:** The repository’s recorded local
   evidence still reports a clean Sociology contract (34 courses, 243
   course-outcome rows, 234 unique normalized outcomes and 7 abilities), zero
   local subject-matcher oracle mismatches, zero active programme-domain
   numeric-gate failures and zero active semantic-review rows. The focused
   backend regression run was rerun in this pass: **55 passed**, with existing
   dependency/deprecation and pytest-cache warnings. These are local results
   and are not Supabase deployment proof.

### Remaining code and verification gaps

The active branches are improved, but the Sociology gate must remain open for
the following reasons:

1. **No route-level interaction proof yet.** The required
   `programme_preview -> university_offerings -> selected university overview
   -> domain -> subgroup -> role` test, including immediate Back behaviour and
   context preservation, is not running. A fresh Jest invocation still fails
   during configuration with `Preset jest-expo not found`. The existing pure
   navigation test therefore cannot be treated as browser or component-flow
   evidence.

2. **Preview and offering fields still depend on the payload.** The active
   renderer is source-only for institution name, abbreviation, address,
   qualification, duration, subject pools and exception details. The code
   omits fields that are absent, but this pass does not prove that the live
   offering response contains all source-backed fields for Sociology. The
   university comparison also needs a browser check confirming that every
   available requirement field and expanded subject pool is shown without
   inventing a value.

3. **Curriculum synthesis needs final content review.** `DegreeSkills` is no
   longer a raw wall, but its expanded detail still exposes course titles,
   course metadata and generated practice sentences. A product review must
   confirm that these sentences are genuinely explanatory for Sociology and
   that each programme reading is attached to the correct learning explanation.
   This is a content/contract review gap, not evidence that the old raw wall is
   still the active renderer.

4. **Subgroup methods are described but not fully item-rendered.** The active
   subgroup branch says that method records are folded into skills and
   competencies, but it does not visibly render the subgroup’s method records
   as source-backed detail inside the relevant skill/competency cards. The
   contract decision is correct; the data-to-card presentation is not yet
   evidenced as complete.

5. **Role item partition still needs cleanup.** The active role branch renders
   a `ContextualItemList` under “Competencies this role produces” without an
   explicit competency-only filter, and then renders separate skill, tool and
   certification grids. Depending on returned context items, that can duplicate
   student-visible items or label a broader mixed list as competencies. The
   relationship cards need one final item-type audit before approval. The active
   preparation chain also summarizes names, while the detailed cards carry the
   item links; the final UI must make that distinction clear rather than
   implying that the summary itself is a linked resource.

6. **Legacy branches remain in the source files.** `LegacyDomainBody` and
   `LegacyRoleBody` remain alongside the mounted refined branches. They are not
   the selected render path shown by the current component entry points, but
   they contain older presentation logic and create a maintenance/regression
   risk. Their presence prevents a clean claim that every code path has been
   consolidated, even though the active path uses the refined bodies.

7. **Per-item link correctness is not closed.** The components have the right
   link boundary and honest no-link states, but there is no completed Sociology
   inventory proving that every displayed skill, tool, competency,
   certification, programme reading and downstream resource has the correct
   item-specific HTTPS target. A source URL is not automatically a learning
   link, and a generic provider homepage must not pass this gate.

8. **Relationship and certification scope still need record-level review.** The
   active card anatomy can show builds-on, works-with, alternatives,
   complements, Nigerian/global/shared scope and credential type. This pass did
   not verify that each Sociology relationship is source-backed, that
   `not_established` coverage remains staff-only, or that each certification is
   correctly classified as a licence, examination, qualification, training
   route or reference body.

9. **Report behaviour still needs end-to-end proof.** Export buttons are gated
   by the guided review step in `DetailScaffold`/`GuidedFieldSelection`, while
   detail screens expose selection rather than export. The report gate still
   needs a browser check proving that an unfinished Sociology route cannot
   print, download or share and that a completed route carries the full
   university/domain/subgroup/role and optional-tool context.

### Supabase and manual-deployment blockers

This pass did not apply SQL, call a write-capable Supabase path, or claim that
the live database is seeded. Under `AGENTS.md`, the following remain manual
deployment gates before the live Sociology route can be approved:

- the canonical career/domain registry and source-backed career layers;
- the programme-domain evidence and review-correction migrations;
- the Sociology curriculum contract and seed;
- the general programme curriculum contract parts;
- the contextual guidance and relationship seed parts;
- the domain orientation and Sociology domain-tool-path migrations; and
- the school identity/offering fields required for authoritative institution
  names, abbreviations, addresses and requirements.

The last recorded live preflight in the closure records showed a partial
career deployment: `domains` and `domain_roles` were empty, while some
subgroup and programme-domain rows existed and the expected domain-path view
was missing. That historical result explains why a live domain page can still
show only a shell even when local code and generated data contain the refined
cards. It must be rechecked after the user applies the documented SQL; it was
not rechecked or changed in this documentation-only pass.

### Sociology gate decision

**Status remains: OPEN — not approved for downstream propagation.**

The local active render path demonstrates the intended box/card direction for
the programme, university, domain, subgroup and role surfaces. It does not yet
satisfy the acceptance gate because the route interaction test is blocked, the
role/subgroup information partition still has the gaps above, the item-level
source-link audit is incomplete, and the live Supabase contract is not proven
deployed. Do not propagate this pattern to all programmes yet.

### Next closure sequence

1. Repair the Jest test environment or provide an equivalent route-level test
   runner, then prove the full Sociology route and Back/context behaviour.
2. Audit the active role context list for exact item-type filtering and finish
   the method-to-skill/competency presentation without creating a separate
   qualification-like method wall.
3. Complete the Sociology record-level audit for learning links, relationships,
   tool alternatives/complements, certification scope and programme readings.
4. Run a browser check against a database with the required migrations and
   seeds applied, recording the actual payload counts and visible cards.
5. Update this document row by row. Only when those results are green may the
   Sociology contract/render pattern be merged into the downstream all-programme
   audit.

## 2026-09-19 local implementation pass

This pass used no agents and made no Supabase writes.

### Changes verified in the active path

- Subgroup methods are now passed into the active capability cards. A method is
  rendered only inside the expanded card whose capability has the same
  source-backed name. This keeps methods explanatory and actionable without
  presenting them as a separate qualification section or attaching a method to
  every skill in the subgroup.
- Relationship lookup uses the full context-item collection, so filtered
  competency sections can still explain the skills and tools they use.
- The active D078 role payload is fail-closed on exact role-owned context
  records, case-insensitively. Legacy flattened role fields cannot promote an
  unreviewed role to a student card.
- The active subgroup and role renderers keep skill/competency/tool/
  certification partitions separate. The legacy unmounted functions remain a
  source-cleanup item and are not accepted as an alternate render path.

### Local evidence

- TypeScript check passed.
- Vite web build passed with the existing unrelated warning set.
- Backend regression suite: **335 passed**.
- Sociology route-helper smoke passed with D078 and programme/university
  context retained.
- Local D078 contract audit: 727 rows; 8 domain-owned, 20 subgroup-owned and
  699 role-owned; all rows include source references and source locators.

### Gate remains open

These results do not close the Sociology gate. Browser-level route proof,
offering payload proof, the final narrative/content review, URL liveness and
relationship/certification record review still require completion. Live
Supabase remains unverified because this pass deliberately did not apply SQL.

## 2026-09-19 local integration checkpoint

- Added `scripts/sociologyRouteSmoke.cjs` and `test:sociology-route`; the local
  route smoke passed five transitions from programme preview through
  university context, domain, subgroup and role while retaining the exact
  programme/JAMB/university context.
- Prepared an additive source-backed award/duration contract patch for the
  JAMB detail and university comparison cards. It is not applied live.
- The Jest preset still fails to resolve in this pnpm checkout; the route smoke
  is the current equivalent local route check.

The Sociology acceptance gate remains open: browser render proof, live offering
payload proof, item/resource audit, certification/relationship review and
completed-review report-gate proof are still missing.

## 2026-09-19 visible report-gate agent checkpoint

Pasteur completed and locally committed the report/Review gate as `187784c`
(no push). Print, download and share remain unavailable until Review is
explicitly complete with programme and university context; changing a
selection reopens the route. The focused test is present, but its Jest run is
blocked by the checkout's missing Jest Expo/circus runner. Browser and live
Supabase report verification remain open.

The bounded browser attempt found no available computer-use browser surface;
the local Vite dev server was also blocked by managed-workspace access while
resolving its config. The successful production build and route smoke are not
browser-render evidence.

## 2026-09-19 admin/institution checkpoint

The local admin boundary now records authoritative organisation identity only
when the live organisation record supplies it, and the SkillsGap surface
separates taught records, curriculum-review gap candidates, and source-review
records. Student subject-match university offerings now retain official name,
short name, and address fields from the school registry. These are local code
and test changes only; no Supabase migration or seed was applied. Browser,
live-payload, item/link/relationship, certification, and report-gate evidence
remain required before Sociology can be approved or scaled.

## 2026-09-19 admin/institution checkpoint

The local admin boundary now records authoritative organisation identity only
when the live organisation record supplies it, and the SkillsGap surface
separates taught records, curriculum-review gap candidates, and source-review
records. Student subject-match university offerings now retain official name,
short name, and address fields from the school registry. These are local code
and test changes only; no Supabase migration or seed was applied. Browser,
live-payload, item/link/relationship, certification, and report-gate evidence
remain required before Sociology can be approved or scaled.
## 2026-09-19 integrated Sociology agent verification

The student hardening pass is integrated in `f57e4da`; the admin/institution
pass is integrated in `e1635fc`. Current local verification passes 336 backend
tests, larger-heap TypeScript, the complete five-transition Sociology route
smoke and the production web build. Live Supabase payload, browser interaction
and report E2E proof remain open; no SQL was applied and scaling remains
paused.

## 2026-09-19 bounded report-gate smoke

`scripts/sociologyReportSmoke.cjs` now provides a bounded non-Jest check of the
real report gate and scaffold. `node scripts/sociologyReportSmoke.cjs` passed:
print/download and share stay locked before completed Review, reopen after
Review, relock after a selection change, and reopen after re-review. This is
local evidence only; browser and live Supabase payload verification remain
open, so the Sociology acceptance gate is not approved.

### 2026-09-19 source-contract checkpoint

The local D078 audit now records 725 source-backed, correctly owned contextual
items and 2,519 resolved source-backed relationships. Generic credential
signals are retained in the audit source but no longer emitted as student-facing
certifications. The reviewed Sociology resource migration contains 51 rows (10
programme, 14 domain, 16 subgroup and 11 role); 27 exact item/resource matches
are available and 698 items correctly show the no-verified-item-link state.
This checks local source shape only; URLs were not fetched and no live payload was
verified.

### 2026-09-19 live deployment boundary

Read-only Supabase preflight passes for the existing matcher, offering and
school-identity surfaces, but the live Sociology guidance contract is not yet
deployed. The current live schema is missing the curriculum-outcome,
programme-domain-evidence and relationship tables, and its contextual/resource
tables lack the current ownership and review columns. No SQL writes were made;
browser and live-payload proof remain open.

### 2026-09-19 broad downstream data checkpoint

The Sociology safeguards are now represented in a product-wide source audit
covering all 420 JAMB identities and 237 canonical programmes. The batch keeps
partial/combined/external/split CCMAS scope, item-resource gaps and unresolved
relationship edges explicit with retained URLs and locators. Every programme
also carries an admin provenance/review-state obligation; no audit-only or
`not_established` row is promoted into student guidance. The focused broad
checkpoint passes **3 tests**. This is local evidence only; browser proof,
live-payload proof and SQL remain deferred.

### 2026-09-19 admin/downstream acceptance checkpoint

The admin evidence ledger now displays an explicit review-queue state and
requires source provenance, stable context identity and matching ownership
before a row can be approved or exposed to students. This closes the local
admin failure mode where a context-free or wrong-owner row could look
reviewable merely because it had a name and URL. The same contract is audited
against all 237 programmes and 420 JAMB identities; the three named route
smokes remain fixtures, not full render proof. `Sciences::Mathematics` and
unresolved relationships remain explicit backlog. No SQL or browser proof was
performed.
