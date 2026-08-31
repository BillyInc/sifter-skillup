# Career guidance: programme to domain, subgroup, and role

## Purpose

This document is the implementation contract for the student-facing career and
admission guidance flow. It consolidates the decisions made during product
review and is the hand-off reference for future implementation or account
transfers.

The governing rule is:

> Show enough information to make an informed choice, then guide the user to
> the next useful decision without hiding the complete inventory.

## Scope

In scope:

- SS1 and SS2 students;
- SS3 students and JAMB candidates;
- current undergraduates;
- programme meaning and Skills taught;
- canonical JAMB programme identity and university offering selection;
- programme → domain → subgroup → role guidance;
- domain, subgroup, and role skills, competencies, tools, certifications,
  resources, evidence, and progression;
- mobile and web behavior, including resume, save, feedback, source links,
  online paid report export, and offline access controls.

Explicitly out of scope for this implementation:

- graduate users;
- professionals, skilled workers, and artisans;
- salary presentation;
- Opportunities as a live inventory until its source-backed data is available;
- a separate programme course/topic/capability taxonomy;
- a university comparison feature for JAMB or early-secondary users.

## Cross-cutting interaction contract

Every screen and reusable component in this flow must be specified and tested
through the complete product-behavior chain:

```text
UX purpose
  -> UI structure
  -> reusable components
  -> interaction states
  -> state source and callbacks
  -> network and persistence boundary
  -> permissions and consent
  -> navigation entry and exit
  -> persistence and resume
  -> feedback and recovery
  -> motion and reduced motion
  -> accessibility semantics
  -> real-product acceptance criteria
```

The implementation must not treat a visual card as complete when its loading,
empty, error, unavailable, saving, saved, selected, view-only, back, resume,
print, or reduced-motion behavior is undefined. A component-level panel such as
an evidence summary, tools list, or admin metric remains a component unless its
route and persistence make it a standalone page.

For subject matching, an unavailable or incomplete check does not hide a
university offering. The offering can be inspected in a view-only state, while
the route is not saved or treated as confirmed until the relevant requirement
check succeeds.

## Canonical terminology

- **Programme**: the JAMB programme identity. CCMAS-derived content belongs to
  this identity and is shared across universities offering that JAMB name.
- **University offering**: a university that offers the canonical JAMB
  programme. It adds address, requirements, and university-specific notes; it
  does not create a different programme version.
- **Skills taught**: the programme's source-backed technical and transferable
  learning profile derived from the existing CCMAS/JAMB data.
- **Domain**: a broad area of work.
- **Subgroup**: a specialization or work family inside a domain.
- **Role**: a specific occupation or route inside a subgroup.
- **Opportunities**: the canonical future employment/opportunity name. It stays
  separate from role guidance until live data is available.

## User flows

### SS1 and SS2

```text
Subjects/interests
  → programme preview
  → see universities offering the programme
  → optionally open a university offering
  → programme overview and Skills taught
  → domain guidance
  → subgroup guidance
  → entry-level roles
```

SS1/SS2 users must not be forced to select a university. Their university
choice is exploratory: “View this programme at this university.” They can
return to the university list, open another offering, or continue to domains.
Admission requirements are available when a university is opened, but do not
block programme or domain understanding.

### SS3 and JAMB

```text
JAMB programme preview
  → universities offering that JAMB name, with address
  → tap a university
  → canonical programme overview + university-specific requirements
  → domain guidance
  → subgroup guidance
  → entry-level roles
```

There is no comparison feature. The user taps the university they want to
inspect. The programme content remains the same; only the university context
and requirements change.

### Undergraduate

```text
University
  → choose the programme from that university's list
  → canonical programme overview + the student's university context
  → domain guidance
  → subgroup guidance
  → entry-level roles
```

Undergraduates are the users for whom a university is an actual selected
context. The school-first flow remains separate from the national JAMB flow.

## Programme detail contract

The programme preview must help the user understand the programme before a
university choice. It should not mention which domains the programme may lead
to.

### Preview

- canonical JAMB programme name;
- one or two plain-language sentences explaining what the programme is about;
- a small preview of **Skills taught**, using representative technical and/or
  transferable items;
- a “See all skills taught” action or a clear action to open programme details;

### University options after the preview

University availability appears after the programme preview, as the next
decision step. It is not part of the programme explanation itself.

This is a progressive section on the same journey, not a vague mandatory
“Continue” action. The preview remains visible above it so the user remembers
what they are choosing.

- JAMB/SS3: show the universities offering that JAMB name, including address,
  under a clear action such as “See universities offering this programme”,
  then let the user tap one to open its details;
- SS1/SS2: show all available university offerings with an “Explore
  universities” action; opening one is exploratory and does not commit the
  student to that university.

There is no comparison feature. The list is a set of offerings for the same
canonical JAMB programme. The user chooses one to inspect its requirements and
notes.

The interaction states are:

```text
programme preview visible
  → university section collapsed with count
  → user opens the section
  → university cards load
  → user taps a card
  → selected/viewing state shows address and requirement status
  → “View programme details” opens the canonical programme overview with the
    selected university's requirements
```

The section must also define loading skeletons, no-offering empty state, retry
on error, source-limited rows, and a clear “Change university”/“Back to
universities” action. Returning from programme details restores the selected
programme, university list, and scroll position where possible. For JAMB/SS3,
the selected university becomes the context for the details and guidance path.
For SS1/SS2, it is a viewing choice rather than a commitment; they may return,
open another university, or continue to domain guidance without selecting one.

Undergraduates remain in the school-first flow: their university is already
the active context, so selecting a programme from that university's list opens
the programme detail directly without showing the national university-options
step.

### Full programme overview

- what the programme is about;
- **Skills taught**, grouped into technical skills and transferable skills;
- plain-language interpretation of the source-backed skills;
- a concise “By the end of the programme” summary derived only from the
  existing CCMAS outcomes;
- “See all skills taught” for the complete list;
- a source/freshness indicator identifying CCMAS/JAMB-derived content;
- a transition into domains, without duplicating domain-level detail.

The implementation must not create a separate course/topic/capability model.
The existing technical and transferable Skills taught arrays are the canonical
curriculum representation. The explanatory copy is a presentation layer over
those facts and must not invent outcomes.

### Programme-to-domain transition

The initial programme search card must stay focused on the programme itself:
its JAMB name, meaning, a small Skills taught preview, and university
availability. It must not show domain recommendations before the student has
understood the programme.

After the programme meaning and Skills taught section, the full programme view
introduces the next step as a guided transition:

> **How this programme connects to areas of work**

The transition groups all related domains into three categories:

- **Direct domains** — “These are the closest matches to what this programme
  teaches.”
- **Functional domains** — “You can apply some of what you learn here, but the
  work is different.”
- **Adjacent domains** — “These are possible pivots. Your foundation helps,
  but you may need a larger bridge before specialising.”

When a category contains several domains, show two or three representative
cards first, the total count, and a contextual action such as “See all direct
domains”, “See all functional domains”, or “See all adjacent domains”. If a
category contains only one domain, show it directly without an unnecessary
expansion step.

Each domain card identifies its relationship category, gives one sentence
explaining why it appears, and offers “View domain” plus “Choose as primary” or
“Add secondary”. Selecting a domain continues the story:

```text
Programme
  → explain the domain connection
  → choose primary domain
  → understand domain foundation
  → choose subgroup
  → understand specialization bridge
  → see entry-level roles
```

Secondary domains remain available for comparison and future pivots. The
transition must explain the relationship without implying that every domain
is equally prepared for by the programme.

### University-specific programme view

The university-specific view adds only:

- university name and address;
- confirmation that it offers the selected JAMB programme;
- UTME and O-Level requirements;
- university-specific admission notes or exceptions;
- source and review state for those requirements.

It must not imply that universities have different versions of the same JAMB
programme unless the source data identifies a genuinely different JAMB name.

## Domain, subgroup, and role content

Every level uses the same pattern:

```text
Short explanation
  → what the user should understand
  → prioritized starting set
  → See all items in this context
  → sources/evidence and limitations
  → next level of guidance
```

### Domain

The domain must educate the user before asking them to choose a subgroup. It
should explain:

- what the field is, in plain language;
- the problems people solve and the outputs they produce;
- the organisations, industries, and work settings involved;
- why the field matters and how it is changing;
- how the selected programme connects to the domain as direct, functional, or
  adjacent;
- the portable foundation that remains useful if a particular role changes or
  disappears;
- the Nigerian context, including local institutions, regulators, standards,
  professional bodies, and locally relevant practice;
- which competencies are useful in Nigeria, both Nigeria and globally, or
  mainly remote/global.

It then shows, in this order:

1. essential or verified practice requirements, where applicable;
2. recommended portable foundation skills and competencies;
3. tools used across the domain;
4. subgroup-specific preparation;
5. optional, advanced, or future-pivot items;
6. relevant certifications, licences, standards, and regulatory requirements;
7. subgroups and their differences;
8. source-backed learning resources and evidence.

The first set is guidance, not a universal checklist. The full inventory of
skills, competencies, tools, certifications, and resources must remain
available through contextual actions such as “See all domain skills” and “See
all domain tools”. Raw prevalence, ordinal ranks, and internal scores are
never shown to students.

The complete inventory remains discoverable. The first group is guidance, not a
universal checklist. Raw prevalence, ordinal ranks, and internal scores are
never shown to students.

### Subgroup

The subgroup must explain the specialization before presenting its roles. It
should describe:

- what the specialization represents inside the wider domain;
- the work, problems, outputs, industries, and settings it contains;
- what the student already inherits from the domain foundation;
- what additional bridge capabilities are needed before specialising;
- which Nigerian institutions, standards, regulations, or local practices
  affect the specialization;
- what transfers well internationally or remotely;
- what is mainly local, mainly global, or supported in both contexts.

It then shows, in this order:

1. the domain foundation already covered;
2. new subgroup skills and competencies;
3. tools used across the specialization;
4. subgroup-specific tools and methods;
5. relevant certifications, licences, standards, and regulatory context;
6. source-backed learning resources;
7. roles grouped as starting, experienced, advanced/leadership, or seniority
   not yet verified.

The complete subgroup inventory remains available through contextual “See all”
actions. The subgroup must not repeat the entire domain foundation as if it
were new.

The subgroup must not repeat the entire domain foundation as if it were new.

### Role

The role must explain the work before presenting a preparation checklist. It
should describe:

- what the role means in ordinary language;
- typical responsibilities and activities;
- expected outputs or evidence of competence;
- the organisations, industries, and environments where the work appears;
- what someone needs to understand first to begin;
- likely progression from entry to experienced to senior/leadership work;
- related roles and possible pivots if the role changes;
- Nigerian context, including whether the exact role or only a close local
  counterpart is evidenced;
- what transfers internationally or remotely;
- what remains unverified or unsupported.

It then shows, in this order:

1. verified regulated-practice requirements, where applicable;
2. essential skills for this route;
3. evidence-building and employability capabilities;
4. tools to practise early;
5. role-specific or advanced tools;
6. relevant certifications, licences, and standards;
7. Nigerian, shared Nigerian/global, and remote/global evidence separately;
8. optional, advanced, or future-pivot items;
9. source-backed resources and related progression.

The complete role inventory remains available through contextual “See all”
actions. Every item must be labelled as “Needed for this route”, “May
strengthen this route”, or “Priority not yet verified” where appropriate.
The role is a current specialization built on the domain and subgroup
foundation, not an employment guarantee or a permanent career promise.

Role detail must distinguish “needed for this route” from “may strengthen this
route.” Unsupported requirements remain explicitly unverified.

## Priority and role ordering

Priority is contextual and type-specific. Skills, competencies, tools, and
certifications must not be merged into one leaderboard.

### Domain ordering

1. Verified statutory or practice requirements, where applicable.
2. Portable foundation skills and competencies.
3. Tools used across the field.
4. Skills/tools needed for a chosen subgroup.
5. Specialized, optional, advanced, or future-pivot items.

### Subgroup ordering

1. What the domain foundation already covers.
2. New subgroup skills and competencies.
3. Tools used across the subgroup.
4. Role-specific proof and credentials.
5. Optional or advanced items.

### Role ordering

1. Verified regulated-practice requirements, where applicable.
2. Role essentials.
3. Evidence-building and employability items.
4. Nigerian, remote, and global signals with their evidence scope.
5. Optional, advanced, or future-pivot items.

Roles surface in this order:

1. **Good starting roles** — entry level.
2. **Roles usually reached after experience** — mid level.
3. **Advanced or leadership roles** — senior level.

Missing seniority is not silently treated as entry level; it is labelled
“Seniority not yet verified.”

## Evidence and language

Every explanatory claim must retain its source provenance, confidence, data
state, and evidence scope. Nigeria, remote, and global signals remain separate.

Use language such as:

- “Start here” — suggested foundation, not a universal requirement.
- “Build next” — broadly useful after the foundation.
- “Needed for this route” — supported by the selected subgroup or role.
- “May strengthen this route” — useful but not universal.
- “Priority not yet verified” — present but not strong enough to classify.
- “You already have partial preparation from your programme and primary
  domain. These are the additional skills you need.”
- “This is a possible pivot. Your current foundation helps, but you need this
  bridge before specializing.”

If evidence is incomplete, use “may need” rather than “need.” A source that
describes an occupation does not create Nigerian demand, licensing, or vacancy
evidence.

## Admin guidance and organization scope

The admin experience must distinguish personal exploration, anonymous walk-in
guidance, and guidance for a real student. An administrator must not silently
inspect an arbitrary student.

### Session target

Before guidance begins, the admin chooses one of:

- **Myself/anonymous exploration**: no student identity and no student path is
  saved;
- **Provisioned student**: a student account created by the administrator's
  institution;
- **Consented student**: a real student whose account has granted the required
  visibility scope;
- **Walk-in session**: a temporary, non-rostered session with no personal
  student record.

### Journey mode

The admin then chooses the purpose of the session:

- **Full guidance flow**: subjects -> programme preview -> universities ->
  university requirements -> domain -> subgroup -> role;
- **Programme to career route**: programme -> universities -> selected
  university context -> domain -> subgroup -> role;
- **UTME-only check**: UTME subjects and matching, explicitly incomplete until
  O-Level requirements are checked;
- **O-Level-only check**: O-Level subjects and matching, explicitly incomplete
  until the other relevant admission layer is checked;
- **University options only**: inspect offerings, addresses, requirements, and
  notes without entering career guidance.

The selected mode must be visible throughout the session, resumable, and
changeable without accidentally discarding saved work.

### Organization and student filtering

- Secondary-school administrators may work with SS1, SS2, and SS3 students;
  class and stream are required context for provisioned secondary students.
- School rosters and guidance sessions must filter by student class and stream
  where those fields exist.
- University administrators work with undergraduate students and university
  programme/curriculum intelligence only; they do not create or guide
  secondary-school or JAMB accounts through the school-provisioning flow.
- Tutorial centres and JAMB cafes work with JAMB candidates in temporary or
  explicitly provisioned sessions; they do not receive a secondary-school
  stream by default.
- A provisioned student's path is separate from the admin's personal path and
  is only visible through server-side authorization and consent rules.

The same student-facing detail screens may be reused inside the admin shell,
but the target student, organization scope, class, stream, consent state, and
save destination must be explicit.

## Persistence and behavior

- Save the selected canonical programme, optional university context, and
  guidance route separately.
- SS1/SS2 university browsing must not be treated as commitment.
- Preserve the selected university when JAMB or undergraduate users open
  programme details.
- The user can change university, return to the list, and resume the route.
- Primary domain receives active guidance; secondary domains remain available as
  comparison or pivot routes.
- Shared foundation skills are shown once; secondary routes show new bridge
  requirements.
- Save, feedback, loading, empty, error, unavailable, and source-limited states
  remain honest on mobile and web.
- Save is allowed for the user's private plan and resume state. Career content
  must not expose bulk catalogue export or component-level copy/download
  actions. An authorised user may print or download a guidance report online
  only when the applicable paid entitlement is confirmed.
- Offline users may review the authorised, previously synchronised in-app
  catalogue and save privately to their World. Offline report generation,
  printing, downloading, sharing, and component-copy actions are unavailable.
- The protection policy must not be described as absolute copy prevention: web
  content, screenshots, OCR, external cameras, rooted devices, and reverse
  engineering cannot be completely prevented. The product removes convenient
  export paths and applies platform protections where available.

## Offline access, monetisation, and content-protection contract

Offline is an authenticated continuation of an account that was established
online. It is not an offline account-creation or payment-bypass mode.

### Access matrix

| Capability | Online | Offline |
|---|---|---|
| Review synchronised programme/domain/subgroup/role data | Available after normal authorization | Available from the encrypted in-app cache after the offline library is ready |
| Follow guidance, See all, source metadata, and saved World items | Available | Available for synchronised data; external source pages and videos show a connect-to-view state |
| Save a skill, resource, domain, subgroup, role, or route to World | Available and server-synchronised | Allowed locally and queued for authenticated reconnect; never treated as server-confirmed until sync |
| Print or download a guidance report | Paid entitlement plus live server authorization | Unavailable |
| Share, copy, or download component details | No bulk/component export affordance | Unavailable in-app |
| Create an account, switch to an unrecognised account, or buy access | Available | Unavailable; reconnect required |

“Everything is available offline” means all currently supported and
successfully synchronised in-app career data is reviewable without a network.
It does not mean that external websites/videos, a fresh uncached source, a
new account, payment verification, or a server-generated report can work
without connectivity.

### Account and entitlement isolation

- Every offline cache, save, resume record, write queue, and encryption key is
  scoped to the authenticated account and installation/device identifier.
- On account switch, sign-out, account deletion, failed device transfer, or
  suspected token mismatch, decrypted career data and unsynchronised writes
  are isolated or cleared before another account can open the app. A second
  person cannot use the first person's local path to create a report.
- Report creation is server-side. The server verifies the current account,
  authorised guidance-path owner/target, paid report entitlement, consent
  scope, device/session state, and report freshness before returning a report.
- Offline entitlements are signed, short-lived, product-scoped, account-scoped,
  device-scoped where appropriate, and contain issuance/expiry/version data.
  They are an unlock hint, never the source of truth for payment. Reconnect
  revalidates payment, refund, chargeback, cancellation, device limits, and
  account status.
- A configurable offline grace period is required. When it expires, cached
  read access may degrade to a clear reconnect state according to the product
  entitlement; it must never silently grant paid report export.

### Threat and failure cases that must be designed and tested

- airplane mode, captive portals, flaky connections, DNS failure, and a device
  claiming “connected” without usable internet;
- expired access tokens, revoked accounts, refunds, chargebacks, payment
  webhook delay, entitlement version changes, and server clock differences;
- device clock rollback/fast-forward, timezone changes, app suspension, and
  repeated reinstall/restore attempts;
- account switching while offline, shared devices, concurrent devices,
  copied app backups, cloned storage, and stale queues from a previous user;
- duplicate/replayed saves, report requests, and queued mutations; all server
  writes must be idempotent and must not create duplicate paid reports;
- cache corruption, partial sync, interrupted migration, insufficient storage,
  OS cache eviction, app upgrade/downgrade, and incompatible content versions;
- rooted/jailbroken devices, tampered binaries, debugging/instrumentation,
  memory extraction, local database inspection, TLS interception, and
  reverse-engineering attempts. Hardware-backed keys and integrity signals
  raise the cost but do not prove a device is trustworthy;
- screenshots, screen recording, accessibility extraction, clipboard capture,
  external cameras, OCR, and browser save/print tools. Android secure-window
  protections and app-background redaction should be used where possible, but
  web and physical capture cannot be guaranteed away;
- offline source links and free videos that cannot open without the network;
  preserve the source title, provenance, and an honest “Connect to view” state;
- admin-guided students: an anonymous session, a provisioned student, and a
  consented student must remain separate offline namespaces. No anonymous
  session may resolve into another student's saved route.

### Required offline behavior

- After online sign-in, the app obtains a signed account/session envelope and
  synchronises a versioned career-data manifest. The user sees progress and a
  clear “Offline library ready” state; partial caches never pretend to be
  complete.
- The local store uses account-scoped encryption and hardware-backed key
  storage on Android where available. Web storage is treated as weaker and
  must not be presented as equivalent anti-extraction protection.
- Reads use the local cache when offline; writes update the private local view
  optimistically, show “Saved on this device — waiting to sync,” and reconcile
  on reconnect with idempotency keys, conflict rules, retry limits, and a
  visible recovery state.
- Reconnect performs authentication, entitlement, manifest, account/device,
  and queued-write checks before confirming synchronisation. Failed or
  revoked writes are explained and never silently marked as synced.
- Offline screens remove print/share/download/copy affordances and block report
  endpoints by network and entitlement checks. Online report actions remain
  available only after the paid entitlement and authorization checks pass.
- Android should use secure-window/screen-capture protections where supported,
  redact sensitive content in the app switcher, avoid the clipboard/share
  intents for component details, and re-lock the offline session after an
  inactivity timeout. These are mitigations, not absolute guarantees.

## Final audit snapshot — 2026-08-31

The programme-to-career content and transition slice is now represented in the
current source and generated seed:

- 160 visible domains, 542 source-backed ISCO subgroups, 5,050 roles, 48,188
  tools and 5,050 role work profiles are emitted by the current generator.
- The former 35 structural review cases are resolved by materializing supported
  roles' existing ISCO sub-major ownership and reconciling role counts after
  canonical deduplication. Roles without a supported subgroup mapping retain a
  direct domain-to-role path; no subgroup name or code is invented for them.
- Programme relationships are grouped as Direct, Functional and Adjacent;
  each category has its own preview and See all behavior.
- Domain, subgroup and role surfaces retain the full available inventory while
  showing a prioritized starting set first. Entry-level roles surface before
  mid and senior roles; unknown seniority remains explicitly unverified.
- Source-backed explanations expose provenance and clickable source/resource
  links where the source data supplies a URL. Offline external links remain a
  Connect to view state.
- The current seed transport is
  `backend/seed_career_v2_2026-08-31_parts_gz/` (22 ordered gzip parts, each
  below 41 MB). It has been generated and locally audited, but has not been
  applied to Supabase.

The population gate and role-completeness audit pass for the repaired source
state. This proves local content and referential readiness; it does not prove
that production has been refreshed. Supabase application, authenticated
offline-library packaging, signed entitlement enforcement, native Android
secure-window behavior and Android end-to-end testing remain deployment work.

## Ordered implementation plan

The following order is authoritative. Content enrichment and product behavior
must be reviewed before deployment or platform integration.

1. Audit the current source-backed domain, subgroup, and role fields and
   reconcile conflicting audit snapshots before treating any layer as complete.
2. Add only source-backed explanatory fields for domains, subgroups, and roles:
   field meaning, work context, outputs, bridge/foundation explanation,
   progression, Nigerian/global evidence, and explicit unknown states.
3. Make the admission programme result show a compact canonical programme
   preview with Skills taught; do not add domains to that preview.
4. Make the programme detail screen distinguish canonical programme content
   from university-specific requirements.
5. Remove the universal university gate for SS1/SS2 career exploration while
   retaining university-specific requirement context.
6. Apply the domain/subgroup/role summary -> prioritized set -> See all pattern,
   including the explanatory language for direct routes and possible pivots.
7. Sort and label subgroup roles by verified entry/mid/senior tier.
8. Implement admin target selection, journey modes, organization scope,
   class/stream filters, consent boundaries, and anonymous sessions.
9. Verify all in-scope user types, direct/functional/adjacent choices, primary
   and secondary routes, and mobile/web rendering.
10. Verify loading, empty, error, unavailable-evidence, saving, saved,
    selected, view-only, back, resume, feedback, accessibility, and reduced
    motion behavior.
11. Finalize the content/schema contract and source-link model. Generate the
    canonical SQL seed once from that frozen state; do not regenerate during
    offline or Android work unless the schema or source data genuinely changes.
12. Reconcile migration order and run-book instructions, then apply and verify
    the frozen SQL in a controlled Supabase environment before packaging
    offline data.
13. Implement paid online report authorization and the offline content policy:
    encrypted account-scoped caching, signed entitlement/session envelopes,
    offline saves/resume, queue idempotency, clock/account/device checks,
    reconnect revocation, and honest partial-cache recovery.
14. Build and test Android against the verified backend, including online
    sign-in, offline access to the synchronised catalogue, World saves,
    account switching, entitlement expiry, reconnect, secure-window behavior,
    and unavailable offline report/export actions.

## Historical implementation checklist

The checklist below is retained for traceability. The ordered implementation
plan above supersedes its ordering.

1. Add this document as the hand-off contract.
2. Make the admission programme result show a compact canonical programme
   preview with Skills taught; do not add domains to that preview.
3. Make the programme detail screen distinguish canonical programme content
   from university-specific requirements.
4. Remove the universal university gate for SS1/SS2 career exploration while
   retaining university-specific requirement context.
5. Apply the domain/subgroup/role summary → prioritized set → See all pattern.
6. Sort and label subgroup roles by verified entry/mid/senior tier.
7. Add missing explanatory fields only where they are source-backed; do not
   fill gaps with invented narratives.
8. Verify all in-scope user types, direct/functional/adjacent choices, primary
   and secondary routes, and mobile/web rendering.

## Acceptance criteria

- SS1/SS2 can understand a programme and explore domains without selecting a
  university.
- SS3/JAMB see the programme first, then university offerings, then the
  selected university's requirements and programme details.
- Undergraduates retain the university-first flow.
- The programme preview contains a concise Skills taught preview but no domain
  recommendations.
- The full programme view exposes all source-backed Skills taught without
  requiring a separate course/topic taxonomy.
- University differences are represented as requirements, notes, and location,
  not different programme versions.
- Every domain, subgroup, and role retains its complete inventory while making
  the next useful action clear.
- Domains explain the portable foundation before specialization; subgroups
  explain the bridge beyond that foundation; roles explain real work, outputs,
  preparation, progression, and limitations.
- Entry-level roles surface first; mid and senior roles remain discoverable.
- Nigeria, remote, and global evidence remain visibly distinct.
- No salary, demand score, raw rank, or unsupported requirement is presented as
  fact.
- Admins can explicitly select a target and journey mode, and cannot inspect a
  random real student without the required account relationship or consent.
- School, JAMB-provider, and university-admin scopes enforce the correct
  student types and stream rules.
- The catalogue has no bulk/component copy or export action. Authorised report
  printing/download is online-only and paid; offline report/export actions are
  unavailable. Private World saves and resume state remain available offline.
- An offline user cannot create or claim another person's report through a
  shared device, copied cache, anonymous session, or stale account token.
- The behavior works for both mobile and web and remains resumable.
- SQL is frozen and verified in Supabase before offline packaging; offline and
  Android integration are performed against that verified contract.
