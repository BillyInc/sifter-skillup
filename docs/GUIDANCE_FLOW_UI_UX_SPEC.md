# Guidance flow UI/UX specification

Status: implementation handoff for the post-seed guidance refinement

This specification is grounded in the current repository behavior, the
`docs/PRODUCT_BEHAVIOR_CONTRACT.md`, `docs/CAREER_GUIDANCE_PRIORITY_CONTRACT.md`,
and the current career seed. It is the
screen-level contract for the first guidance slice and is portable to another
Codex account.

## Canonical route

```text
Admission Intelligence / Programme
  -> connected domains
  -> choose one primary domain and optional secondary domains
  -> understand the core domain foundation
  -> choose subgroups inside the selected domain
  -> choose roles inside the selected subgroups
  -> review the route and generate/print the guidance report
  -> save resources and continue learning in My World
```

Subgroups are content inside a domain, not a fourth primary navigation tab.
`Opportunities` is the canonical employment/opportunity surface. A role is a
career-intelligence destination; it must not be presented as a live opportunity
unless a verified opportunity row exists.

## Exact guidance copy

Use these sentences verbatim where their condition applies:

- Primary route: **“You already have partial preparation from your programme and primary domain. These are the additional skills you need.”**
- Functional or adjacent route: **“This is a possible pivot. Your current foundation helps, but you need this bridge before specializing.”**
- Insufficient evidence: replace **“need”** with **“may need”** and show the evidence limitation.
- Domain selection: **“Start with the domains connected to your programme. Choose one primary route; add a secondary domain only when you want to compare or plan a pivot.”**
- Subgroup selection: **“Your core domain foundation remains useful across related paths. These are the additional capabilities to build as you narrow into a subgroup.”**
- Role selection: **“Choose a role to see the skills, tools, credentials and proof that matter for that route.”**

Do not use `field`, `smaller area`, `jobs`, or `admission path` in this flow.
Use `domain`, `subgroup`, `role`, `Opportunities`, and `Admission Intelligence`.

## Cross-cutting screen contract

Every composed screen must document:

```text
UX purpose
-> UI structure
-> reusable components
-> interaction states
-> data source and verification metadata
-> navigation entry and exit
-> persistence and resume
-> feedback and recovery
-> motion and reduced motion
-> accessibility
-> real-product acceptance criteria
```

## Screen contracts

### Programme detail — career hand-off

- UX purpose: explain how the selected programme connects to domains before the
  user chooses a career route.
- UI: programme identity, requirements context, relationship badges (`Direct`,
  `Functional`, `Adjacent`), a domain preview list, and one primary CTA:
  **Explore domain guidance**.
- Components: `DetailScaffold`, `TextTabs`, `DataSourceBadge`, relationship card,
  `RouteLine`, `GuidanceReportButton` where applicable.
- States: loading, real, fallback, unavailable domain mapping, save pending,
  save failed, guest/locked persistence.
- Data: programme/JAMB mapping from `careerData`; relationship type is mapping
  metadata, not a readiness or demand score.
- Entry/exit: Admission Intelligence or Explore programme -> guided domain
  selection; back returns to programme context.
- Persistence: selected university/programme remains in the guidance path;
  selecting a domain is a separate route decision.
- Acceptance: no domain is described as equally prepared when it is functional
  or adjacent; the copy explains the bridge before navigation.

### Domain route selection

- UX purpose: let the learner see the complete connected-domain inventory while
  making the next route obvious.
- UI: route-line stepper (`Domains -> Subgroups -> Roles -> Review`), domain cards
  with relationship badge, description, evidence state, `View domain`, `Add
  secondary`, and `Make primary` actions.
- Components: `RouteLine`, domain card, `DataSourceBadge`, `DataStateView`, save
  feedback banner, responsive action row.
- States: loading, no mapped domains, loaded, selected, primary, secondary,
  removal with dependent-selection cleanup, save pending, save failure, guest
  held draft, authenticated saved draft, resume.
- Data: linked domains from the selected programme/JAMB programme; no invented
  “curiosity” prompts or extra categories.
- Persistence: `GuidanceReportPath.path.domains`, `intent`, and `sequence`;
  resume stage is `domains`.
- Acceptance: one primary domain is always explicit; secondary domains remain
  available without duplicating shared foundations.

### Domain detail

- UX purpose: teach the broad core domain foundation before specialization.
- UI: domain identity, route position, “Skills to build first”, tools used across
  the domain, certifications/regulatory context, subgroup sections, resources,
  notes, save/report actions, and local/remote/global evidence labels.
- Components: `DomainDetailScreen`, `FoundationSkillsBlock`, `ToolGroupsBlock`,
  `CertPlacementList`, `GuidanceEvidenceBlock`, `LearningResourcesBlock`,
  `RouteLine`, `NotesWidget`.
- Acceptance: all available items remain discoverable, but the presentation
  distinguishes foundation, specialization, role-specific, and optional items.
  Missing Nigerian evidence is not silently treated as low priority.

### Subgroup selection and detail

- UX purpose: narrow the route while showing what is newly required beyond the
  domain foundation.
- UI: grouped subgroup cards inside their domain, explicit bridge copy, tools,
  competencies, credentials, resources, and roles. No standalone subgroup tab.
- Components: `SubgroupDetailScreen`, subgroup card, `SkillsBridge`,
  `ToolGroupsBlock`, `MethodEvidenceBlock`, `CertPlacementList`.
- Persistence: `GuidanceReportPath.path.subgroups` with domain ownership;
  removing a subgroup removes its selected roles.
- Acceptance: shared domain foundation is not repeated as a new requirement;
  subgroup gaps are labelled as additional or “may need” when evidence is weak.

### Role selection and role detail

- UX purpose: make a specialization concrete without implying that the role is
  a live Nigerian vacancy.
- UI: role cards under their source-backed subgroup, role identity, skills/tools,
  proof/portfolio guidance, credentials, resources, related roles, save/report,
  and a separate `Opportunities` action only when verified rows exist.
- Components: `RoleDetailScreen`, `SkillsBridge`, `ToolGroupsBlock`,
  `CertPlacementList`, `LearningResourcesBlock`, `GuidanceEvidenceBlock`,
  `SaveButton`, `GuidanceReportButton`.
- States: real, fallback, coming soon, no local counterpart in checked evidence,
  opportunity feed unavailable, save/saving/saved/failed, guest/locked.
- Acceptance: local, remote, and global evidence lenses remain separate; a role
  family match is not automatically a Nigerian vacancy or licence claim.

### Review, report, and continuation

- UX purpose: let the learner confirm the route, understand what comes first,
  and keep the work resumable.
- UI: primary route, secondary/pivot routes, selected subgroups and roles,
  foundation/additional/optional explanation, evidence limitations, print/report
  action, saved resources, and “continue learning” destination.
- Components: summary lists, `RouteLine`, `PdfExportButton`, save feedback,
  `DataSourceBadge`, empty/error/report-state components.
- States: no path, path ready, draft saving, export pending, browser print,
  mobile print limitation, unavailable report, permission denied, incomplete
  source, retry.
- Persistence: guidance path is saved independently from bookmarks; resources
  save by canonical URL; skills are not saved as entities until their data
  contract changes.
- Acceptance: report selection, saved entities, saved resources, and learning
  progress are visibly different states.

## Responsive composition

### Mobile (390px reference)

- one-column cards with full-width tap targets;
- sticky progress/route stepper and bottom action row;
- domain relationship and evidence badges remain visible without horizontal
  scrolling;
- detail actions use a compact action bar or bottom sheet;
- long role/subgroup lists use scoped search or progressive sections;
- no desktop-only hover behavior.

### Web (1440px reference)

- constrained editorial content width with a persistent left route/context rail;
- domain and subgroup cards may use a two- or three-column grid;
- detail pages use a sticky section index and a right evidence/action rail;
- admin guidance uses the separate sidebar shell and student context banner;
- all student behavior and persistence semantics remain identical to mobile.

## Completion gate for this slice

The slice is ready for implementation review when:

- the programme hand-off uses the canonical terminology and relationship copy;
- the guided route has loaded, empty, save, error, resume, and guest states;
- domain, subgroup, and role screens preserve the data ownership boundaries;
- primary/secondary and functional/adjacent behavior is explicit;
- reports, resources, and bookmarks have separate states;
- mobile and web use the same route and data contract;
- reduced-motion and accessibility behavior is specified for the route line,
  cards, progress stepper, focus, selection, and recovery messages.
