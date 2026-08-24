# SS1 implementation refinements

This file records the approved SS1 behavior decisions that should guide screen
and component implementation. It is separate from the full text mockup in
`ss1-student-flow.md`.

## Onboarding

- SS1 has two starting choices: `Help me choose subjects` and `I already have a programme in mind`.
- Do not use the SS3 `know where / know what / unsure` doors for SS1.
- Preserve class, school, stream, subjects, programme and draft state when going back or refreshing.
- Require class, school and stream before guidance begins.
- School search must show useful results while typing and display the school address.

## Subjects and programme discovery

- English Language and Mathematics appear first in the O-level subject picker.
- Subject matching becomes available after five O-level subjects.
- Subject search and programme-name search remain separate.
- Programme results show the programme name, university count, address preview and a compact subject signal.
- Full requirements are shown only after the student selects a university.
- Do not say that a student qualifies or is guaranteed admission.

## Programme-first behavior

- Programme search begins as soon as the query is useful enough to search.
- After selecting a programme, the student continues directly into its university
  offerings; after selecting a university, `Continue` opens the university-aware
  programme page and then the field guidance flow.
- Do not route the student to Home or general Explore at that point.
- Use the simple primary action label `Continue`; the current screen and selected
  item provide the context.
- A student may add another programme later through an explicit action.

## Programme detail

- Use Overview, Requirements and Schools/university picker.
- Show what the programme teaches and its real programme skills in plain language.
- Show only the selected university on an institution-specific overview.
- Do not show curriculum classification names or unnecessary department labels.
- Do not show Direct Entry requirements to SS1.

## Guidance hierarchy

- The programme page shows only a short `Where this can lead` preview.
- After the university-aware programme page, `Continue` opens the full domain ->
  subgroup -> role flow.
- Do not create a separate Employment tab; it duplicates the career hierarchy.
- Roles belong under subgroups. Unassigned roles are data-quality issues and should not appear as a flat SS1 list.
- Direct, functional and adjacent describe mapping distance, not student ability.

## Latest flow corrections (2026-08-22)

- Do not show or activate a `Continue` action before the student has selected a
  university. Selecting a programme only opens the university offerings for
  that single JAMB programme.
- Selecting a university moves the student into the programme page, where the
  selected university, programme overview and university-specific requirements
  are shown. It must not open the first domain automatically.
- Keep `What this programme helps you build` on the programme page only when it
  describes the programme itself. Do not use that section to describe a domain.
- Domain guidance owns the domain's build/skills explanation. It should appear
  in the domain detail after the programme-to-domain connection is opened.
  `Build / Entrepreneurship` is a separate domain tab or clearly equivalent
  action, parallel to the programme's build/entrepreneurship surface. It must
  answer the domain-specific question, `What can I build in this domain?`,
  using only real domain-backed data and truthful actions.
- Every domain must expose the Build / Entrepreneurship entry consistently;
  it must not be a hidden or programme-only feature. The domain Overview and
  Skills content explain the field and its foundations, while the Build /
  Entrepreneurship tab explains possible things to create, offer or develop
  within that field.
- A domain detail must not show a flat list of roles. Its order is domain
  overview, domain skills/competencies/resources, then mapped subgroups. Roles
  appear inside the relevant subgroup/roles card because roles belong to
  subgroups.
- Overview and Skills must render different content. Changing between them
  must replace the visible section, not leave the same programme/domain panel
  in place under two labels.
- In guided discovery, the Explore shell is only the route host. The active
  guidance journey is a focused full-screen flow with all global navigation
  hidden until the user exits guidance; only guidance wayfinding and actions
  remain visible.

## Audit goals added during the continuation review (2026-08-24)

- [x] Treat guidance focus as a shell-wide state: hide the sidebar, mobile
  navigation, search, theme/profile actions and Explore floating actions, not
  merely the Explore navigation item.
- [x] Preserve the focused state through nested programme, domain, subgroup and
  role routes by reading global route parameters in the outer shells.
- [x] Keep administrator guidance student-scoped when a university is changed
  or a domain is opened from the programme page.
- [x] Retire the old community route files and repair stale browser entries
  through the route integrity guard.
- [x] Remove the legacy celebratory bolt artwork/fallback from active product
  UI; retained learning content may still contain ordinary instructional
  references to lightning or Starknet.
- [ ] Verify the focused transitions in a running browser session and verify
  account-deletion cooldown behavior after the additive lifecycle migration is
  applied to the target Supabase schema. Local tests cannot prove either live
  deployment state.

## Admission information

- Fold university admission information into Requirements and Schools.
- Do not show an empty or pending Admission tab in SS1.
- Show only real institution-specific admission data.

## Resources

- Show real links beside the domain, subgroup, role, skill, competency, tool or qualification they explain.
- Use truthful actions: `Open resource`, `Open skill reference`, `Open learning link`, `Open tool guide` and `Open qualification information`.
- Do not promise activities, projects or skill exploration unless the linked record actually opens one.
- Allow saving links to My World under an ordered `Saved learning` library.
- Do not create a mandatory standalone resource screen.
- A missing URL must show an accurate missing state, not a hardcoded resource.

## Saving, Home and reports

- Saving shows an inline `Saved to My World` confirmation; there is no separate saved-path screen.
- My World stores the full structured context: school, stream, subjects, programmes, universities, domain, subgroup, role, resources and reports.
- Home's primary action is `Continue`.
- Comparison is optional and only appears after the student saves multiple programmes.
- Reports are SS1 Guidance Summaries, can include multiple programmes, and support print, PDF download, QR/access code and sharing.
- Reports must never show `Under review` unless a real submission exists.

## Supported Home and pathway audit

The selectable account types are SS1, SS2, SS3, JAMB candidate, undergraduate
student and educator/institution. Graduate, professional and skilled-worker
profiles remain hidden from the account-type gate; their internal type names are
legacy compatibility values, not active onboarding routes.

The shared student Home reads the authenticated user's real saved guidance path.
For admission users it shows saved subjects, programme choices, university and
address, then resumes the admission/programme guidance route. For undergraduate
students it shows the saved university and programme. For any supported student
path with field guidance it shows the saved domain, subgroup and roles, then
opens the first saved field or role. An educator's guidance belongs to the
selected student and is resumed from the admin student-guidance screen, not
mixed into the educator's personal Home.

Educators also have their own account-scoped workspace resume. The last admin
route is retained with its student, programme and query context, so returning
after a refresh or sign-in can reopen student account creation, a student
guidance session, Explore/admission, verification, peer comparison or another
permitted admin task. Student guidance state and educator workspace resume are
separate records.

The Explore Pathways and Elite surfaces were audited against
`src/screens/careerIntelligence/PathwaysHubScreen.tsx`. They are already a
single consolidated pathway-selection layer with requirement lenses; they must
remain available in Explore. They are not duplicated as separate Home cards.

The domain detail view renders roles only beneath their mapped subgroup. A role
without a valid subgroup is retained as a data-quality issue and is not shown as
an `Other roles` fallback.

Secondary-school provisioning records guardian consent explicitly when the owner
has confirmed it, including the guardian name. Creating an account alone does
not imply consent; an unchecked row remains valid and can be handled through the
separate auditable consent workflow.

## Data boundary

- Do not use demand data, market statistics, readiness scores or employment forecasts in the SS1 experience.
- SQL files in the repository may be audited as candidate source data, but only active, validated records may be presented as live product data.

## Cross-user implementation baseline

The SS1 decisions are the language and state baseline for the supported routes,
with the academic differences below:

- SS1 and SS2 use O-level subject guidance and select a university before the
  full university-specific requirements and field guidance are saved.
- SS3 and JAMB candidates may see the published programme requirements before
  choosing a university; subject matching uses the combined O-level and UTME
  gates when the student asks for it.
- Undergraduate students start with their university, then choose from that
  university's own programme names and continue to the same programme,
  requirements and field-guidance structure.
- Educators use the same student-facing programme and mapping language inside a
  student-scoped guidance session. Their saved path belongs to the selected
  student, not the educator's personal My World.
- The ordinary supported routes do not show Direct Entry, CCMAS discipline
  names, a separate Employment tab, or a duplicate Admission tab.
- A provisioned student's claim/login card remains the primary QR handoff. A
  compiled report may include the active access code and QR only when the
  backend returns a real, unredeemed code and the viewer is authorised; a
  self-created account must never receive a fabricated code. Reports otherwise
  remain account-scoped and use authenticated print/download/share actions.
