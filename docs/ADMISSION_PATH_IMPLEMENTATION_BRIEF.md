# Admission Path / Admission Intelligence — Implementation Brief

Status: Product decision, correction log, and implementation specification
Scope: Student admission discovery, onboarding integration, programme selection, and expert/admin surfaces

This file is now the shared correction/specification file for the related pre-auth,
authentication, onboarding, admission-intelligence, and admin-flow decisions. New
implementation work should update this document when it changes an agreed product
behavior.

## Pre-auth and authentication correction

The refined reference is the three composite boards supplied by the product owner:

- `WhatsApp Image 2026-08-10 at 2.19.59 PM (1).jpeg` — design system, intro carousel,
  auth flow, terms/privacy, and interaction states;
- `WhatsApp Image 2026-08-10 at 2.19.59 PM.jpeg` — the same refined auth and carousel
  sequence at a more legible scale;
- `WhatsApp Image 2026-08-10 at 2.20.00 PM.jpeg` — the later student Explore,
  programme, domain, and schools/admission reference.

These images are functional references at this stage, not permission to perform a
massive visual upgrade. Preserve the current component system and implement the
behavioral sequence first.

### Required first-visit sequence

```text
Website/app entry
  → Intro carousel (three slides)
  → Auth landing
  → Create account / Log in / optional Guest mode
  → Terms and Privacy consent where account creation requires it
  → onboarding or the appropriate resumed destination
```

The intro carousel must precede auth on the root website entry for a first-time
visitor. It remains skippable, and the seen state may be persisted so returning
users do not repeatedly see it. Direct auth routes may retain a safe intro fallback,
but the root route is the canonical first-visit entry.

The carousel copy must describe Sifter LevelUp as career/programme intelligence for
Nigerian students and institutions. Do not call it a `skill platform`. Do not claim
that it is a generic learning platform. The three functional messages are:

1. Sifter LevelUp — career intelligence for Nigerian starting points.
2. Your programme, fully mapped — programme → domains, roles, skills, and resulting
   opportunities.
3. Real opportunities, tailored to you — the practical destination after mapping.

### Auth landing

The auth landing screen offers:

- Create account;
- Log in;
- Continue as Guest / browse before setup.

Remove the misleading `SKILL PLATFORM` heading and the old feature claims about
track-first onboarding and saved progress as the product identity. Progress and
resume behavior still exist as capabilities, but they should be explained in the
correct onboarding/home context.

### Create-account fields

The account form must use:

- First name;
- Middle name (optional);
- Last name;
- Date of birth;
- Email;
- Password;
- Confirm password;
- required acceptance of Terms & Conditions and Privacy Policy.

The user should not be asked to invent a username. The legacy `username` column may
remain as a compatibility/display field, populated from the person's name for old
features until those consumers are migrated.

Date of birth must support both direct typing and an easy picker. The picker should
provide day/month/year choices and a searchable year list; the stored value must be
validated and sent in a consistent date format.

Password confirmation must be checked before the request is sent. Password rules
must be consistent between client and backend.

### Information inputs and suggestions

All onboarding and profile inputs that collect real-world information should use
typeahead suggestions when the platform already has matching data.

This applies to:

- universities;
- programmes;
- programme-name variants;
- secondary schools;
- subjects;
- domains;
- roles;
- locations where relevant.

Secondary-school students should be able to enter their current school name.
School names should show suggestions as the user types if the school is already
stored in the database. If the school is not found, the user may still enter it
as free text, subject to later normalization/admin review.

The UI should prefer a searchable input over a long dropdown for large datasets.
For small bounded lists, such as day/month values, dropdown or picker controls
are acceptable. For large or growing datasets, use search-as-you-type,
debouncing, empty states, and clear labels that distinguish an existing saved
record from a new user-entered value.

### Legal consent

Terms and Privacy must be separately readable before consent. Their content must
include:

- globally understandable terms, user rights, account responsibilities, data use,
  security, retention, and deletion language;
- Nigeria-specific treatment, including NDPA 2023/NDPR principles, lawful basis,
  data minimisation, data-subject rights, Nigerian governing-law language, and
  guardian/minor handling where relevant.

Required legal acceptance must be tied to the account-creation action. Optional
anonymous analytics consent must remain separate and opt-in; it must never be
bundled into the required legal checkbox.

### Conflict and Unauthorized correction

The signup API must distinguish these cases:

- An email row exists with no password credentials: treat it as a recoverable
  partial signup, complete the profile/password fields, and issue a normal session.
- An email row exists with a password: return a clear conflict telling the user to
  log in rather than presenting an opaque `Conflict` banner.
- A login failure must clearly distinguish invalid credentials from an expired,
  invalid, or device-mismatched session. Auth success must register/refresh the
  current device session before subsequent authenticated calls.

Never silently create a second account for the same email. Never expose password
  hashes in any response. Existing accounts and legacy username consumers must keep
  working while the new name fields are introduced.

The current implementation surfaces this through:

- `app/index.tsx` owning the first-visit intro gate;
- `src/components/brand/IntroCarousel.tsx` holding the three functional slides;
- `src/screens/AuthScreen.tsx` using corrected product language;
- `src/screens/SignUpScreen.tsx` collecting the revised profile fields and date
  picker;
- `src/lib/api.ts` and `src/hooks/useAuth.tsx` sending the revised signup payload;
- `backend/main.py` completing recoverable partial email rows;
- `backend/migration_auth_profile.sql` adding the name/date columns;
- `supabase-schema.sql` documenting those columns for fresh environments.

This correction is functional and incremental. A later visual pass may use the
refined boards for spacing, typography, cards, animation, and responsive layouts,
but must preserve this sequence and these data rules.

## Non-negotiable implementation rule

Before changing any code, the implementer MUST read the relevant existing codebase first.

At minimum, inspect:

- the onboarding routes and state model;
- the student Home and Explore screens;
- the admin workspace Home/Explore routes;
- the existing programme, domain, subgroup, and role flows;
- the current admission browse and insight screens;
- the frontend data client and TypeScript types;
- the backend admission and student-pipeline routes;
- the admission database migrations, seed data, and import scripts;
- the existing navigation helpers and access-policy documentation.

Do not create a parallel admission flow until the existing flow and its route/state dependencies have been understood. Reuse existing screens, components, navigation helpers, data envelopes, and design tokens where appropriate.

Relevant current surfaces include:

- `src/screens/ExploreScreen.tsx`
- `src/screens/CareerHomeScreen.tsx`
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx`
- `src/screens/careerIntelligence/AdmissionInsightScreen.tsx`
- `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx`
- `src/components/onboarding/JambSetupForm.tsx`
- `src/lib/careerData.ts`
- `src/lib/exploreNav.ts`
- `src/types/career.ts`
- `backend/routes/admission_routes.py`
- `backend/routes/student_pipeline_routes.py`
- `backend/migration_admission_intelligence.sql`
- `backend/seed_phase8_9_enrichment.sql`
- `backend/scripts/import_admission.py`
- `src/screens/admin/AdminExploreIntro.tsx`
- `docs/CAREER_INTELLIGENCE_ACCESS_POLICY.md`

## Product decision

Admission Intelligence is a good feature. It should remain capable of showing:

- programmes;
- programme-name variants;
- universities offering each programme;
- subject-to-programme matching;
- JAMB subject requirements;
- O'Level requirements;
- Direct Entry requirements where relevant;
- the universal JAMB cut-off;
- the selected academic route before career mapping.

However, Admission Intelligence must not be a second onboarding flow or a duplicate career-discovery flow.

The correct order is:

```text
Onboarding context
  → programme / university / subject discovery
  → student confirms a programme and university
  → career mapping
  → domains → subgroups → roles → skills
```

Career mapping is the final interpretation of the academic choice. It must not be presented as preceding university/programme discovery.

Admission Intelligence is therefore a shared admission-exploration capability whose entry point and presentation depend on the user's onboarding route and current journey state.

## Terminology decisions

Use:

- `Admission Intelligence` for the data capability and product area.
- `Admission Explorer` for the searchable student experience.
- `Schools & admission` for the contextual section within Programme Detail.
- `Programme` and `University` for the user's selected academic choices.

Do not introduce these concepts in the current scope:

- admission plan;
- shortlist management;
- verification status as a user-facing workflow;
- school-specific cut-off scoring;
- admission prediction or probability of admission;
- a separate career-development product.

## Admission data rules

1. Post-UTME removal is intentional. Do not reintroduce Post-UTME into the product experience or formula presentation.
2. Cut-off presentation should use the universal JAMB cut-off defined for the applicable cycle. Do not present school-specific cut-offs in the student-facing experience.
3. Do not present a hardcoded programme-specific value as a universal cut-off.
4. Do not show an indicative or fallback number when the relevant admission data is unavailable. Show an honest unavailable/coming-soon state instead.
5. Every displayed admission value must carry the applicable admission cycle. Source/freshness information may be displayed as supporting metadata, but it is not a separate user workflow.
6. All institutions in the current scope are universities. Location should appear naturally in university details; do not add unnecessary institution-type complexity at this stage.
7. Subject matching is guidance, not a guarantee of eligibility. The UI should explain the actual matched requirement rather than rely on a raw match count.

## Admission onboarding completion rule

For the admission route, first signup/onboarding must always resolve both:

- programme;
- university.

If the student starts with programme only, the next step is the contextual
university-selection state for that programme. If the student starts with
subjects only, the flow continues through programme discovery and then university
selection. The journey should not stop after onboarding unless the user exits or
leaves a required part incomplete.

When the admission decision is complete, the next screen should open directly
into the selected programme's mapping context:

```text
Selected programme + selected university
  -> programme-to-domain mapping
  -> domain selection
  -> subgroups
  -> roles
  -> skills / opportunities / pathway layers
```

## Onboarding-dependent journeys

### Route A — User knows programme and university

The user has already selected both programme and university during onboarding.

Admission Intelligence should open in a pre-filled contextual state:

```text
Selected programme + selected university
  → programme name used by that university
  → JAMB subject requirements
  → O'Level requirements
  → Direct Entry requirements, if applicable
  → universal JAMB cut-off
```

The user must not be asked to search for the same programme and university again.

Optional onward actions:

- explore other programmes at the selected university;
- explore other universities offering the selected programme;
- continue to career mapping.

### Route B — User knows programme but not university

The user has already selected a programme.

Admission Intelligence should answer:

```text
Where can I study this programme?
```

Show the programme, its recognised name variants, and universities offering each relevant version. The user can then select a university and continue to the programme detail/career-mapping flow.

### Route C — User does not know yet

The user starts with strongest subjects.

The flow is:

```text
Strongest subjects
  → matching programmes
  → programme-name variants
  → universities offering those programmes
  → student selects programme and university
  → career mapping is last
```

The result set may show all matching programmes and universities, but it must be structured and grouped rather than rendered as an undifferentiated long list.

### Route D — Already enrolled student

The student starts from their university and its programme list. The student should see the programme names used by that institution, then proceed to the career mapping attached to the selected programme.

Admission exploration remains available for intentional alternative actions, such as exploring another programme or university, but it should not dominate the enrolled student's Home experience.

### Route E — Graduate, professional, or skilled worker

Do not force these users through the undergraduate admission flow. They should use the relevant qualification-upgrade, career-change, or other route when those capabilities are available. Admission Intelligence can be surfaced only when their selected route explicitly requires an academic programme/university decision.

## Student Home and Explore must be different

### Student Home

Home is personalised and stateful. It should not be a generic catalogue.

Home should show the user's current onboarding state and the next unfinished action:

```text
No onboarding
  → Start onboarding

Programme not selected
  → Explore programmes / match my subjects

Programme selected, university unresolved
  → Explore universities offering this programme

Programme and university selected
  → Continue to career mapping

Career mapping complete
  → View domains, subgroups, roles, and skills

Already enrolled
  → Continue with the selected programme route
```

If the user has already completed the admission decision, Home must not display a generic Admission Path tile that restarts the same process. It may show a contextual link such as:

> Review this programme's universities and requirements

### Student Explore

Explore is the reusable national discovery catalogue.

It should support:

- general search for programmes, universities, and subjects;
- programme-name variants;
- grouped programme results;
- subject matching;
- university/programme relationships;
- entry into Programme Detail;
- entry into career mapping after the academic selection.

The current screenshot's three equal tabs (`My university`, `Programme`, `Subjects`) should be reviewed. They may be retained as search modes, but they must not feel like three unrelated onboarding flows.

Preferred structure:

```text
Find a programme or university
[Search field]

Search by / explore with:
[Programme] [University] [Subjects]

Context card when onboarding data exists:
Your current programme / university
Explore alternatives →
```

The interface should be redesigned using clear search/filter controls and grouped results. Avoid forcing users to scroll through a long, unstructured course list.

## Programme Detail and Schools & admission

Programme Detail should be the bridge between admission and career mapping.

Recommended sections/tabs:

- Overview
- Schools & admission
- Requirements
- Career mapping

`Schools & admission` should show universities offering the selected programme, the programme-name variant used by each university, universal JAMB cut-off information for the applicable cycle, and requirements.

The initial programme-search card should not carry cut-off values. Cut-off information belongs after the user has selected a programme and is examining admission options.

## Subject-match presentation

The current `matchedSubjectCount` value means how many of the user's chosen subjects matched the programme's stored subject mapping. It is not a complete eligibility result.

Do not make the raw count the primary card message. Prefer:

```text
Matches your selected subjects
```

On programme detail, show:

- the required UTME subject combination;
- the user's matching subjects;
- any missing or alternative subject requirement;
- the relevant O'Level requirement;
- a clear guidance disclaimer.

## Expert and admin experiences

Student-facing admission exploration and expert/admin workspaces must not have the same Home or Explore shape.

### Expert/reviewer Home

Expert Home should focus on review work, not a student resume. Potential content includes:

- mapping items needing review;
- admission data coverage gaps;
- stale or unverified source records;
- feedback tasks;
- recent programme/university changes.

### Expert/reviewer Explore

Expert Explore should be a national catalogue with review context:

- programme;
- university;
- subject requirements;
- programme-name variants;
- mapping relationships;
- source and freshness metadata;
- feedback/report action.

Experts do not need to be guided through the student admission journey.

### University admin

University admins should see the national catalogue in their Explore workspace, clearly labelled as national rather than their own institutional data.

Their institution-specific surfaces remain separate. Do not turn the student Admission Explorer into a university-management dashboard.

### School owners

School owners should use Admission Explorer as a counselling tool with a student. Their Home should prioritise school/cohort guidance, not personal admission discovery.

Their Explore view may open the same student-facing catalogue inside the admin shell, but navigation must remain in the admin stack and the context should say that the catalogue is national.

### Tutorial centres and JAMB cafés

These users need a guided advisory workflow:

```text
Choose or search programme/subjects with the student
  → inspect universities and requirements
  → help the student choose a route
  → hand off to the student's career mapping
```

They do not need a separate duplicated admission product. They need the student catalogue mounted inside their advisory workspace, with the correct admin navigation and session context.

### Educator guidance workspace

Educators, school owners, tutorial centres, and JAMB cafés should not land only
on Explore as if they are ordinary student users. Explore is useful to them, but
their primary product job is guidance.

Their admin side needs a `Guidance` workspace that can:

- create or invite student accounts;
- resume a student setup that was started but not completed;
- search/admit with the student in session;
- choose programme and university with the student;
- inspect requirements and subject matches;
- hand the student into programme-to-domain mapping;
- view aggregate/cohort progress where consent and access rules allow.

The guidance workspace should not expose private student saves, notes, or pathway
preferences unless the student has explicitly shared the relevant record or the
account was provisioned under a valid school/cohort access rule.

Recommended educator landing logic:

```text
New educator account
  -> educator/admin onboarding
  -> organisation type and verification state
  -> Guidance workspace
  -> create/invite students OR open Admission Explorer in guidance mode

Existing educator with incomplete setup
  -> resume educator/admin onboarding

Existing educator with verified/active organisation
  -> Guidance dashboard / cohort workspace
  -> quick actions: Add student, Continue student setup, Open Admission Explorer,
     Review programme/domain guidance, View aggregate insights

Existing educator with no students yet
  -> Guidance empty state
  -> create first student / invite students / explore catalogue as adviser
```

Explore should still exist inside the admin shell, but as a tool the educator
opens from Guidance, not as the default landing for every educator account.

Suggested educator navigation shape:

```text
Home / Guidance
Students
Explore
Insights
Profile / Organisation
```

For narrow/mobile admin views, the same principle applies: Guidance is the
working start point, while Explore remains a national catalogue/advisory tool.

## Affected code areas

The implementer must assess and update only the necessary surfaces after reading them fully.

### Routes and navigation

- Student Explore routes under `app/(tabs)/explore`.
- Admin Explore routes under `app/(admin)/workspace-explore`.
- `src/lib/exploreNav.ts` for base-aware student/admin navigation.
- Programme and admission dynamic routes.

### Student UI

- `src/screens/CareerHomeScreen.tsx` for state-aware Home prompts.
- `src/screens/ExploreScreen.tsx` for the redesigned Admission Explorer entry.
- `src/screens/careerIntelligence/AdmissionBrowseScreen.tsx` for grouped search, filters, contextual onboarding state, and subject matching.
- `src/screens/careerIntelligence/AdmissionInsightScreen.tsx` for any remaining contextual admission detail; do not expose empty intelligence panels as if they were complete.
- `src/screens/careerIntelligence/ProgrammeOverviewScreen.tsx` for `Schools & admission`, requirements, and final career-mapping hand-off.
- `src/components/onboarding/JambSetupForm.tsx` for route-specific onboarding output and resume state.

### Data contracts

- `src/lib/careerData.ts`.
- `src/types/career.ts`.
- `backend/routes/admission_routes.py`.
- `backend/routes/student_pipeline_routes.py`.
- Backend admission models and response envelopes.

### Data and operations

- `backend/migration_admission_intelligence.sql`.
- Admission seed files.
- `backend/scripts/import_admission.py` and year-specific import scripts.
- Admission snapshot/version handling.

### Admin UI

- `app/(admin)/workspace-explore` routes.
- `src/screens/admin/AdminExploreIntro.tsx`.
- `src/screens/admin/AdminFeedbackScreen.tsx`.
- School guidance and university workspace screens.
- Any expert review or data-quality surfaces.

## Implementation constraints

- Do not implement before completing the required codebase read.
- Do not duplicate onboarding logic inside a new admission route.
- Do not create a second career-mapping engine.
- Do not reintroduce Post-UTME.
- Do not expose school-specific cut-offs in the student experience for this scope.
- Do not use hardcoded promotional admission numbers.
- Do not show fallback scores when real admission data is absent.
- Do not call a subject match a guaranteed eligibility result.
- Preserve the existing DataState patterns (`real`, `fallback`, `coming_soon`) while improving what users see.
- Use existing theme tokens, responsive primitives, navigation helpers, and shared career-intelligence components.
- Ensure student and admin navigation remain inside their respective stacks.

## Acceptance criteria

### Student

- A user who completed onboarding does not repeat the same programme/university discovery flow.
- A user who selected programme and university sees that context pre-filled.
- A user who selected only a programme can explore universities offering it.
- A user who starts with subjects can see grouped programme matches, name variants, and universities.
- Career mapping occurs after programme/university selection.
- Subject-match messaging is understandable and not presented as guaranteed admission.
- Cut-off information is not shown on initial programme result cards.
- Empty admission data does not produce fabricated or misleading numbers.
- Home directs the user to the next unfinished journey step.

### Expert/admin

- Expert/admin Home is work-oriented, not a copy of student Home.
- Expert/admin Explore is a national catalogue/review surface, not a personal admission journey.
- University admins are told when they are viewing national data.
- School owners and tutorial centres can use the catalogue in an advisory/session context.
- Admin navigation remains inside the admin workspace.

### Quality

- Existing onboarding, Explore, programme, domain, subgroup, and role routes remain functional.
- Existing student and admin route wrappers are reused where appropriate.
- TypeScript and backend validation pass.
- Admission source/year labels remain accurate.
- No product copy implies admission certainty or prediction.

## Recommended implementation order

1. Read and document the existing onboarding state transitions and route parameters.
2. Map current student Home, student Explore, Programme Detail, admission routes, and admin Explore flows.
3. Define the shared admission context object: onboarding route, selected programme, selected university, subjects, and completion state.
4. Update the student Home resume logic.
5. Redesign the student Admission Explorer around context, search, filters, grouped results, and programme-name variants.
6. Move admission detail into Programme Detail's contextual `Schools & admission`/requirements experience.
7. Ensure career mapping is the final hand-off after academic selection.
8. Update data contracts and backend responses to match the product rules.
9. Remove misleading fallback/promo numbers and ensure unavailable data is honestly represented.
10. Adapt admin Home/Explore framing for expert review, university admins, school owners, and tutorial centres.
11. Test all onboarding routes, resumed journeys, student/admin navigation bases, and empty-data states.
12. Only after the structural flow is verified, create visual mock-up variants and implement the selected design.

## Pathways and Entrepreneurship correction

This section extends the correction/spec file beyond admission intelligence because
the current Explore surface now mixes admission, career mapping, special pathways,
entrepreneurship, Feed, and legacy Starknet surfaces. The next implementation sweep
must treat these as one information-architecture correction.

Before implementing, read the current codebase first. At minimum, inspect:

- `docs/ENTREPRENEURSHIP_PRODUCT_REFINED.md`;
- the Elite Pathways data-build guide documents supplied by the product owner;
- `src/screens/ExploreScreen.tsx`;
- `src/screens/careerIntelligence/PathwaysHubScreen.tsx`;
- `src/screens/careerIntelligence/EntrepreneurshipPathwayScreen.tsx`;
- `src/lib/exploreNav.ts`;
- `src/components/shell/ReferenceShell.tsx`;
- `src/screens/MyWorldScreen.tsx`;
- `src/screens/SettingsScreen.tsx`;
- `src/screens/ProfileScreen.tsx`;
- `src/screens/WorldScreen.tsx`;
- the student and admin Explore route wrappers.

Do not implement the current static entrepreneurship screen as the final product.
It is only a placeholder.

## Product navigation and access correction

### Feed and My World

Feed must be removed from primary navigation.

Feed should not appear in:

- mobile bottom nav;
- mobile side nav/drawer;
- desktop primary side nav;
- Explore;
- Settings;
- public/guest pre-auth surfaces.

Feed belongs inside `My World`, because it is part of the skill-up, guild,
community, portfolio, streaks, notes, and saved-paths layer.

Recommended `My World` structure:

```text
My World
  -> Skill Up
  -> Guild / community
  -> Feed
  -> Portfolio
  -> Streaks / notes / saved paths
```

Remove product-internal wording such as `Topbar shortcut too` from the Profile
shortcut/mini-card. User-facing copy should describe the actual destination, not
the implementation detail.

### Intro carousel sequencing

The intro carousel must appear before auth, not after the user clicks sign up.

Correct normal first-visit sequence:

```text
First visit
  -> Intro carousel
  -> Auth landing
  -> Sign up / Login / Guest
```

If a user opens a direct `/signup` or `/login` link, the route may show auth
directly or apply a safe first-visit intro rule. But the root website/app entry
must not show the intro carousel after the user has already chosen `Sign up`.
That reverses the user's intent.

### Market intelligence placement

Market Intelligence should not be a standalone main student feature yet.

For students, it should be embedded contextually inside:

- domain cards;
- role cards;
- programme detail;
- opportunities;
- entrepreneurship/build;
- pathway pages.

Student-facing market intelligence should answer practical contextual questions:

- why a domain is growing;
- where a role appears across industries;
- which skills commonly appear in opportunities;
- whether a pathway has limited, moderate, or strong evidence;
- what source/freshness supports the signal.

Do not create a separate student `Market Intelligence` tab while the data layer
is still being attached to domain, role, programme, opportunity, and pathway
surfaces.

For admins, schools, universities, and tutorial centres, market intelligence may
become a larger dashboard because those users need aggregate programme, domain,
role, pathway, and cohort signals.

### Guest access

Guest mode should exist as a preview and trust-building mode, not as the full
product.

Guests may:

- view the intro carousel;
- browse Explore;
- search domains, roles, and programmes;
- preview Admission Intelligence;
- preview Entrepreneurship/Pathways;
- view limited programme, domain, and role summaries.

Guests must not:

- save;
- deep-compare;
- export PDFs;
- complete onboarding permanently;
- receive personalised recommendations;
- access My World;
- access full pathway maps;
- access private notes or progress;
- access school-linked or student-specific features.

Where a guest reaches a locked feature, the UI should explain what account
creation unlocks and return the user to the same context after sign-up or login.

### Product model

`Pathways` is the umbrella concept:

```text
Where the user is now
  -> route or transition they want to make
  -> required academic / professional / capability data
  -> final destination and next action
```

Admission Intelligence is one pathway layer for users whose next decision is an
undergraduate programme/university route.

Elite Pathways is a sourced data layer for high-competition or highly structured
routes. Its documents define user starting points, Nigerian qualification maps,
bridges, timelines, costs, and proof-of-concept requirements. It is not a set of
decorative screens.

Special Pathways is not a separate product with many independent tabs. It is a
hub for route types that depend on the user's current position:

- PhD and research routes;
- qualification upgrades such as OND, HND, Direct Entry, B.Sc., top-up, and ELR;
- chartership and credentials;
- career change;
- entrepreneurship / build a business.

PhD, qualification upgrades, chartership, and credentials are mainly structured
data details inside the pathways product. Career change may become the only
fully distinct interactive feature because it has materially different user
states: job switch, adjacent pivot, significant change, and forced career change.

### Entrepreneurship product decision

Entrepreneurship should remain inside Explore/Pathways. It should have its own
dedicated route/page because it is a substantial pathway, but it should not have
its own primary bottom-nav tab.

Primary bottom navigation remains:

```text
Home | Explore | Opportunities | Saved | Profile
```

The fourth tab is labelled `Saved` while the `myWorldLive` feature flag is off
(the pre-launch default) and reverts to `My World` when the flag is on; the
route, its `myworld` path and its nav id are unchanged either way.

Entrepreneurship belongs under:

```text
Explore
  -> Pathways
  -> Build a business / Entrepreneurship
```

It may also appear as a contextual card/chip in Explore when the user's saved
programme, domain, role, or pathway state makes it relevant.

The refined entrepreneurship product is not a generic business-plan page and not
a startup coaching screen. It is an Entrepreneurial Opportunity Map.

It should start from one of these contexts:

- selected programme;
- selected domain(s);
- existing skill;
- idea;
- market problem.

From there it maps the user into entrepreneurial roles and venture options using:

- entrepreneurial roles as the core object;
- selected/ranked domains;
- venture modes;
- opportunity lenses;
- entry modes;
- operating capabilities;
- partner requirements;
- regulatory cautions;
- Nigerian and global market context;
- evidence and source metadata.

Venture modes are tags, not a forced ladder:

- Independent Operator;
- Firm/Enterprise Builder;
- Scalable Venture Builder;
- Product/IP Creator.

Opportunity lenses are multi-select filters:

- Technology & Automation;
- Process & Operations;
- Business Model & Distribution;
- Market & Contextual Adaptation;
- Social & Systems;
- Cultural & Creative;
- Design & Accessibility;
- Knowledge & Pedagogy.

The entrepreneurship route must support these views:

- Documented Roles;
- Emerging Roles;
- Market Signals.

The UI must always allow `Show all`. Ranking questions may order results and
explain why, but they must not remove eligibility or imply that the platform has
decided the user cannot pursue a path.

### Entrepreneurship implementation requirements

The eventual implementation should replace the static cards with a functional
shell that can later connect to real data:

1. If the user has a saved programme/domain, open with that context and offer
   `Build` as a pathway tab or section.
2. If the user has no context, let them start from idea, skill, programme, or
   market problem without pretending this is onboarding.
3. Let the user select/rank domains before showing the opportunity map.
4. Show entrepreneurial roles grouped by view: documented, emerging, and market
   signals.
5. Add filters for venture mode, lens, domain, capability layer, regulation, and
   evidence confidence.
6. Role detail must show venture modes, lenses, core/supporting domains,
   operating capabilities, partner needs, regulation, context, evidence, and
   save/compare actions.
7. Do not claim that an opportunity is "unbuilt" or guaranteed. Use evidence-led
   language such as "underserved for this segment/location based on available
   evidence."
8. Institution/admin dashboards may use aggregate engagement and demand signals
   only. Do not expose individual student saves, preferences, or private pathway
   choices to admins.
9. Guest users may see a preview. Full maps, saves, comparisons, and subscriptions
   require the appropriate user entitlement.
10. Do not hardcode prices, market sizes, or unsupported claims.

### Explore presentation

The current Explore pathway chips should be rationalised:

- `PhD & Research` opens the Pathways hub or the PhD route inside it.
- `Career Change` can open the career-change feature directly.
- `Credentials` should be labelled more clearly as `Chartership & credentials`.
- `Qualification Upgrades` belongs in the same Pathways hub.
- `Entrepreneurship` opens the Build a business route.

The pathway strip must not imply that all five are equal products. It should make
clear that Pathways is a route-selection layer, while career change and
entrepreneurship may be deeper interactive experiences.

### Mobile navigation and Feed

Mobile must follow the refined reference images: bottom navigation only for the
primary app areas.

Do not show a mobile side drawer as a second primary navigation surface. The
hamburger/drawer pattern currently duplicates Home, Explore, Opportunities, My
World, and Profile and exposes `Open Feed`. That must be removed or restricted
so mobile users rely on the bottom nav.

Feed must remain locked inside `My World`. It may appear as an internal My World
card/action when the user intentionally enters that space, but it must not surface
in:

- mobile drawer;
- top-level bottom navigation;
- Explore;
- Settings;
- public/guest pre-auth surfaces.

This preserves the product hierarchy:

```text
Primary app navigation
  -> My World
  -> Guild / community area
  -> Feed
```

### Settings and legacy Starknet surfaces

Settings must stop exposing Starknet-specific fields or workspace language.

Remove these from Settings UI:

- Starknet Address;
- Starknet Bridge;
- Fee Mode;
- wallet bridge connection/disconnection actions;
- `waiting-for-user` wallet states;
- Active Field when it surfaces `crypto`;
- Active Track when it surfaces `crypto`;
- workspace panels that say `crypto is active`;
- copy such as `This workspace does not need a Starknet wallet to continue`.

The underlying legacy track implementation may remain in the codebase until it is
intentionally removed, but it must not appear as the user's general account state
or product identity.

Settings should become a quiet account/preferences surface:

- name/display identity;
- email;
- auth provider;
- theme;
- school linking;
- notifications;
- legal/privacy;
- sign out.

If active programme, university, pathway, or onboarding state is shown later, it
must use the LevelUp academic/pathway language, not the old Starknet/crypto
workspace language.

### Profile and My World follow-up

The same Starknet/crypto workspace audit should be applied to Profile, My World,
World, Fields, and legacy learning routes before the visual upgrade. Anything
that still says `Starknet`, `crypto`, wallet, bridge, gas, faucet, or
wallet-gated labs should be hidden unless the user intentionally enters a legacy
learning track that still requires it.

Do not remove legacy learning code casually. First decide whether it is:

- hidden legacy content;
- a My World learning module;
- deleted product surface;
- or an admin/internal test route.

### Interim contact recommendation

Until domain email is ready, do not use a personal email address as the public
business contact if it can be avoided.

Recommended interim setup:

- create a dedicated business Gmail/Outlook account for public contact and early
  accounts;
- use WhatsApp Business on a dedicated business number/SIM/eSIM where possible;
- keep the personal email only for founder-level recovery, legal, or private
  internal correspondence;
- share access through a password manager, not by forwarding passwords in chat;
- record which founder owns each recovery channel;
- migrate public contact, billing, support, and admin ownership to domain email
  once the domain is configured.

Using a business WhatsApp is fine as an interim user-facing channel, especially
in Nigeria, but it should be a business number and not the founder's everyday
personal WhatsApp if the team can avoid it.

### Additional acceptance criteria

- The implementation brief explicitly states that Entrepreneurship is an
  Opportunity Map, not the current static screen.
- Entrepreneurship has a dedicated Explore/Pathways route, but no bottom-nav tab.
- The Explore pathway strip routes users intentionally instead of sending every
  chip to the same hub.
- Mobile primary navigation is bottom-nav only.
- Feed is reachable only from inside My World.
- Settings exposes no Starknet, crypto, wallet, bridge, fee-mode, or old workspace
  state.
- Admin/institution surfaces use aggregate pathway intelligence and do not expose
  individual student pathway choices.
- The later visual upgrade uses the refined images as functional references, but
  the first implementation sweep prioritises corrected structure and behavior.
