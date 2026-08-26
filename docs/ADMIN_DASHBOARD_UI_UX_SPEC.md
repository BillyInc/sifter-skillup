# Admin dashboard and guidance workspace UI/UX specification

Status: implementation handoff for the missing admin Figma coverage

This contract is grounded in `docs/PRODUCT_BEHAVIOR_CONTRACT.md`, the existing
admin routes and screens, the admin data clients, and the current mockup
references. It is deliberately separate from the student Explore information
architecture.

## Canonical admin route

```text
Admin onboarding
  -> organisation, role and verification state
  -> admin dashboard
  -> provision or select a student (when permitted)
  -> start a guidance session or open workspace Explore
  -> inspect programme -> domain -> subgroup -> role guidance
  -> review/print the student's report
  -> return to cohort or aggregate intelligence
```

The admin shell never becomes the student shell. Student records are visible
only when the organisation, role, claim/affiliate state and consent rules
permit it. A provider session may guide a learner without creating a persistent
roster record.

## Dashboard contract

### UX purpose

Help an authorised educator choose one operational task and understand the
organisation's aggregate guidance state without implying access to individual
student choices.

### UI structure

- persistent admin sidebar on web; labelled drawer on mobile;
- organisation name, role, verification/access status and current workspace;
- aggregate stat cards: students or sessions, unclaimed codes, domains
  represented;
- optional aggregate guidance alerts;
- two primary action panels: `Advising a student?` and `Guidance market
  intelligence`;
- cohort interests panel with aggregate, k-anonymised domain mix;
- clear links to Students, Session mode, Workspace Explore, and intelligence.

### State and data rules

Every metric and panel uses the backend `DataState` envelope:

```text
pending -> real | empty | coming_soon | locked | error
```

The UI must never replace a missing market signal with a taxonomy rank or
invented number. Permission, verification, consent and stale/error notices are
visible at the panel that is affected. Aggregate data must not expose which
student selected a programme, domain, subgroup or role.

### Navigation and persistence

- dashboard -> students/provisioning, provider session, workspace Explore,
  market intelligence, feedback or verification;
- the admin resume route preserves the operational task and organisation
  context, not a student's private path;
- a target student is carried explicitly as `guidance_student_id` into shared
  programme/domain/subgroup/role screens;
- leaving and returning must restore the target context or explain why access
  has expired;
- report actions use the target student's authenticated report endpoint.

## Student guidance inside admin context

The shared catalogue keeps the student route:

```text
Admission Intelligence / programme
  -> connected domains
  -> primary and secondary domain decision
  -> subgroups inside the selected domain
  -> roles
  -> route review and report
```

The admin context banner must remain visible and identify the target student,
student class/type and consent/access state. Admins can guide and review a
student path only through the permitted target context; opening a detail page
must not silently mutate the student's selection. Explicit selection and save
actions are separate from simply viewing a detail page.

## Cross-cutting interaction contract

For every admin screen and composed panel:

```text
UX purpose
-> UI structure
-> reusable components
-> interaction states
-> data source and verification metadata
-> navigation entry and exit
-> persistence and resume
-> permission/consent rule
-> feedback and recovery
-> motion and reduced motion
-> accessibility
-> real-product acceptance criteria
```

## Mobile and web composition

### Mobile (390px reference)

- drawer navigation with the current route announced;
- one-column stat and action cards;
- target-student context banner stays above catalogue content;
- tables become labelled cards or scoped horizontal regions;
- primary action is reachable without desktop hover or pointer-only behavior;
- permission and consent notices appear inline and are announced as live status.

### Web (1440px reference)

- persistent sidebar and organisation/context header;
- two-column dashboard panels with a clear content rail;
- tables, filters and aggregate charts may use the wider canvas;
- shared catalogue details use the student visual language inside the admin
  shell, with the target context rail still visible;
- admin metrics show source/date/status metadata beside the value.

## First implementation slice

1. Reconcile the dashboard visual hierarchy with the existing
   `SchoolGuidanceDashboardScreen` and `AdminShell`.
2. Add an explicit target-student context banner to admin guidance entry and
   shared detail routes where it is currently absent.
3. Verify loading, permission, consent, empty, coming-soon, error and resume
   states against the route contracts.
4. Add large web and 390px mobile frames to the Figma handoff when the editable
   design workspace is available; do not shrink the working frames to thumbnails.

## Acceptance criteria

- Admin and student navigation are visually and behaviorally distinct.
- No admin metric claims to be real without a real backend state and source
  scope.
- Target-student context and permission state are visible throughout guidance.
- Student report printing uses the selected target, not the administrator's
  personal report.
- Mobile and web preserve the same admin permissions, persistence and recovery
  behavior.
- No visible dormant user types are introduced; professional, skilled-worker
  and graduate remain hidden until explicitly released.
