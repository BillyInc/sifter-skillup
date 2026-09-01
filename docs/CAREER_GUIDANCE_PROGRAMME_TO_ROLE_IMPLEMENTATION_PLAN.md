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

## Refined taxonomy and curriculum-evidence decisions

The programme-to-domain relationship is derived from the source-backed CCMAS
curriculum, not from the programme title alone. The existing **Skills taught**
arrays remain the concise curriculum representation shown in the product. They
do not replace the underlying evidence used for audit and explanation.

The evidence layers are combined according to the relationship being tested:

- **Direct:** P3/P5 purpose, curriculum and outcomes closely match the domain's
  foundation and occupational anchors. The active evidence gate requires at
  least two specific CCMAS course or objective anchors.
- **Functional:** P5/P14 courses and objectives teach capabilities materially
  used in the domain, but do not constitute the domain's complete occupational
  foundation. The active evidence gate also requires at least two specific
  CCMAS course or objective anchors.
- **Adjacent:** P7/P8 transferable competencies are relevant and there is at
  least one domain-relevant conceptual prerequisite in P5/P14. The UI must
  explain the bridge before specialization.

“Strong” has one consistent meaning: the relationship is supported by named,
source-backed curriculum anchors rather than generic word overlap. The two/
one thresholds are minimum evidence gates, not similarity scores or guarantees
of employment. Every active mapping must retain the CCMAS source, page or
section, course/outcome text, matched domain anchor, relationship class, and
review state.

The current domain, subgroup, role, skill, competency, tool and certification
library is preserved. This reconciliation does not rebuild role or skill
scoring. It only re-audits programme-to-domain links against the corrected,
source-traceable domain identity and reattaches downstream records when a
reviewed domain identity genuinely changes.

The source-lineage work must freeze one canonical ISIC revision, preserve every
raw source code, and record crosswalks for historical or alternate revisions.
ISIC anchors industry context; ISCO, ESCO, O*NET, WEF, ILO, specialist and
Nigerian sources support occupational identity, boundaries and enrichment.
Domain labels must be marked as exact source terminology, source-supported
umbrella labels, or curated additions with a documented boundary reason.

## Source-layer review gate

Before a domain identity or programme-to-domain link is promoted, each source
layer must be reviewed for the claim it can actually support. A source's
presence in a registry is not evidence that its records were ingested or that
it proves Nigerian demand.

- **ISIC Rev.5:** review industry sections, divisions, groups, explanatory
  notes, and the official Rev.4-to-Rev.5 correspondence. It anchors the
  economic context and completeness survey; it does not define occupations,
  skills, or programme suitability.
- **ISCO-08:** validate major, sub-major, minor, and unit-group codes and
  occupational descriptions. It anchors the kind of work and occupational
  structure; it does not by itself establish a Sifter domain name.
- **ESCO:** validate preferred occupation labels, alternative labels, stable
  URIs, descriptions, ISCO links, and occupation-skill relations. It supports
  normalized role and skill evidence.
- **O*NET 31.0:** validate tasks, work activities, tools/software, preparation,
  job zone, work context, job titles, and the updated essential/transferable
  skill layers. It is global/US proxy evidence and must not be presented as
  Nigerian demand. The repository records the archive hash and keeps the prior
  30.3 archive for comparison.
- **ILO:** validate international occupational and employment context. It must
  not be converted into a Nigerian market claim without Nigerian evidence.
- **WEF:** validate future-of-work, growing/declining role, and skills signals.
  It is a trend source, not a complete occupation dictionary or local vacancy
  source.
- **Specialist frameworks:** validate emerging or sector-specific vocabulary,
  competencies, and role families where the general taxonomies are too broad.
- **Nigerian sources:** validate Nigerian terminology, institutions,
  regulators, certifications, professional scope, curriculum context, and
  local demand only where the checked source directly shows it.

Current audit status: the eight ISCO values absent from the supplied ISCO-08
workbook now have explicit non-silent dispositions and valid parent/sibling
candidates recorded. No inferred replacement has been promoted into the
taxonomy; source-meaning review remains required for any canonical correction.

An O*NET occupation that has no ESCO or ISCO equivalent is an enrichment
candidate, not an automatic insertion. It may be promoted only when it is
within product scope, is not a duplicate, has a defensible domain placement,
and retains its exact O*NET code and source metadata. O*NET does not supply the
product's subgroup taxonomy; where no defensible subgroup exists, the product
may use a documented domain-to-role path. A candidate that fails these checks
remains in review and is excluded from generated seed data.

The review artifact must retain the source file or URL, version/date, hash when
available, exact source record or page, claim type, affected domain/subgroup/
role, reviewer decision, and any limitation. Existing role and skill decisions
are not reopened merely because a source-layer review is being documented.

For Nigerian students, the programme-fit evidence rule is stricter: a global
domain or occupational source cannot repair a weak programme-to-domain link.
The complement audit is retained as the before-state diagnostic: it joined the
86 canonical JAMB rows to exact Nigerian CCMAS course codes, titles, learning
outcomes, and content summaries and recorded 547 sufficient, 153 insufficient,
and 11 missing-anchor occurrences. The completed Nigerian disposition layer
reviewed all 711 occurrences: 547 are certified, 163 are explicit guided
bridges, and one unsupported candidate was removed. No source-gap disposition
remains. The active JAMB map uses this reviewed overlay; full evidence and
decisions are in
`data/career-mapping/_audit/ccmas_nigerian_reviewed_links_2026-09-01.json`.

The reviewed-link map is materialized by
`data/career-mapping/_materialize_jamb_domain_map_from_canonical.py`; it keeps
the full course/outcome/source evidence in the audit artifact and carries only
compact review metadata into the active map. The downstream impact audit found
no invalid domain references or display-label mismatches after normalization.

The full review queue is inventoried in
`data/career-mapping/_audit/REVIEW_STATE_INVENTORY_2026-09-01.md`. It includes
domain naming, JAMB brochure variants, CCMAS inheritance, WEF normalization,
Nigerian local-counterpart states, subgroup/role source anchors, and explicit
not-established records. Counts in that inventory are visibility controls, not
proof that a queue is complete.

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

## Final audit snapshot — 2026-09-01

The programme-to-career content and transition slice is represented in the
repository, but its source and seed snapshots must not be treated as the same
state:

- The current `domain_meta.json` contains 168 domain records, of which 167 are
  not marked excluded. The companion source audit covers 555 subgroups and
  5,209 merged role records, with source distinctions recorded in the audit
  artifacts below. The visible Nigerian scope contains 542 subgroups and
  5,093 role-context entries.
- The newly generated `seed_career_v2_2026-09-01_parts_gz/` transport contains
  160 visible domains, 542 supported subgroups, 5,093 roles, 48,585 tools,
  240 certifications, 5,090 role work profiles, and 23 ordered gzip parts.
  Its manifest records the source and per-part SHA-256 checksums. The
  2026-08-31 transport remains an earlier snapshot.
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
- The full review-state disposition audit covers 1,538 findings with zero
  follow-up records. Four visible role entries remain intentionally global-only
  because no direct Nigerian counterpart was supported; they are displayed with
  that limitation rather than assigned an invented local counterpart.
- The existing compressed seed transports, including
  `backend/seed_career_v2_2026-08-31_parts_gz/`, are earlier snapshots. The
  2026-09-01 transport is the regenerated candidate; it has not been applied
  to Supabase and must still pass deployment preflight and execution checks.

The population gate and role-completeness audit pass for the repaired source
state. This proves local content and referential readiness; it does not prove
that production has been refreshed. Supabase application, authenticated
offline-library packaging, signed entitlement enforcement, native Android
secure-window behavior and Android end-to-end testing remain deployment work.

## Ordered implementation plan

The following order is authoritative. Content enrichment and product behavior
must be reviewed before deployment or platform integration.

### Evidence packet required before the final freeze

The release packet must include the [academic methodology](CAREER_TAXONOMY_ACADEMIC_METHODOLOGY.md),
the [personal handoff](CAREER_TAXONOMY_PERSONAL_HANDOFF.md), and the
[complete source and behavior inventory](CAREER_TAXONOMY_SOURCE_INVENTORY_2026-09-01.md).
The academic packet is intended for reviewers without repository access: it
names the actual JAMB and CCMAS documents, records page/section examples,
lists every routed global and Nigerian source family, explains the source-fact
to rule to mapping decision, and states whether each source was checked in an
extract, checked in a source document, or retained only as a registry route.
The PDFs are generated from these revised documents after the text and links
are verified; they are not evidence that SQL has been regenerated.

1. Freeze and distribute the authoritative source inventory and audit the
   current source-backed domain, subgroup, and role fields, including
   WEF trend annotations and source-version crosswalks, and reconcile
   conflicting audit snapshots before treating any layer as complete. Review
   every explicit under-review, unresolved, unavailable, partial, and
   not-established record in the full authoritative data set. Reconcile the
   historical 153 CCMAS/JAMB insufficient occurrences and any remaining
   bounded records through explicit source-backed dispositions; do not erase
   them or turn them into unsupported exact matches. WEF signals remain
   explanatory trend evidence, never a Nigerian priority score.
2. Add only source-backed explanatory fields for domains, subgroups, and roles:
   field meaning, work context, outputs, bridge/foundation explanation,
   progression, Nigerian/global evidence, and explicit unknown states. For
   programme-fit gaps, use Nigerian CCMAS/NUC/JAMB, professional-body, or
   Nigerian-university curriculum evidence with exact course/outcome locators;
   global sources remain domain-context evidence only.
3. Verify the academic examples and the JAMB-only, O-level-only, and combined
   matcher behavior against the source documents and current implementation;
   confirm university offerings remain downstream of the canonical programme
   identity.
4. Make the admission programme result show a compact canonical programme
   preview with Skills taught; do not add domains to that preview.
5. Make the programme detail screen distinguish canonical programme content
   from university-specific requirements.
6. Remove the universal university gate for SS1/SS2 career exploration while
   retaining university-specific requirement context.
7. Apply the domain/subgroup/role summary -> prioritized set -> See all pattern,
   including the explanatory language for direct routes and possible pivots.
8. Sort and label subgroup roles by verified entry/mid/senior tier.
9. Implement admin target selection, journey modes, organization scope,
   class/stream filters, consent boundaries, and anonymous sessions.
10. Verify all in-scope user types, direct/functional/adjacent choices, primary
   and secondary routes, and mobile/web rendering.
11. Verify loading, empty, error, unavailable-evidence, saving, saved,
    selected, view-only, back, resume, feedback, accessibility, and reduced
    motion behavior.
12. Finalize the content/schema contract and source-link model. Generate the
    canonical SQL seed once from that frozen state; do not regenerate during
    offline or Android work unless the schema or source data genuinely changes.
13. Reconcile migration order and run-book instructions, then apply and verify
    the frozen SQL in a controlled Supabase environment before packaging
    offline data.
14. Implement paid online report authorization and the offline content policy:
    encrypted account-scoped caching, signed entitlement/session envelopes,
    offline saves/resume, queue idempotency, clock/account/device checks,
    reconnect revocation, and honest partial-cache recovery.
15. Build and test Android against the verified backend, including online
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
