# Figma Redesign Brief - Career Intelligence Platform

Use this brief when asking Figma to redesign the platform from scratch or to refactor existing screens into a stronger design system. The goal is granular product quality, not a new color theme.

## Design Goal

Redesign Sifter SkillUp as a serious career intelligence operating system. It should feel structured, calm, data-rich, and easy to scan. The visual quality target is the attached reference: restrained navigation, clear hierarchy, light surfaces, precise spacing, table/list density, and no decorative noise.

This must be color/theme agnostic. Use semantic tokens, not fixed palette decisions:

- `surface.base`, `surface.raised`, `surface.subtle`
- `text.primary`, `text.secondary`, `text.muted`, `text.placeholder`
- `border.subtle`, `border.strong`
- `accent.status`, `accent.action`, `accent.warning`, `accent.danger`, `accent.success`
- `state.locked`, `state.pending`, `state.verified`, `state.live`

## Visual Grammar

- Use a 4px base grid: 4, 8, 12, 16, 24, 32, 48.
- Prefer two spacing tiers: tight gaps for related elements, loose gaps for separate sections.
- Use one sans family throughout. Default to regular and semibold/bold only.
- Keep tabs text-only with a thin active underline.
- Use outline icons only for top-level navigation and core actions.
- Avoid cards around whole page sections. Use cards only for repeated items, compact summaries, modals, and locked feature tiles.
- Use hairline borders for structural separation. Avoid heavy outlines, gradients, decorative shadows, and ornamental blobs.
- Use one accent meaning per screen. Do not scatter accent color across unrelated elements.
- Main product pages should feel operational: sidebar or tab navigation, breadcrumb, title block, filters/search, then dense list/table/detail content.

## Search Quality

Search must be designed as a premium command surface, not a generic input.

- Use a precise 40-48px search bar with leading icon, clear placeholder, focus state, clear button, and optional scope chip.
- Design global search and scoped search separately.
- Group results by type: programmes, domains, roles, universities, scholarships, opportunities, and admin records.
- Each result row needs an icon or thumbnail, title, short explanation, mono metadata, freshness/source where relevant, and a clear action/chevron.
- Include result previews: programme requirements, domain demand, role salary/demand, university location/type, scholarship deadline/award.
- Include filters: result-type tabs, domain, level, location, school type, deadline, and mobile filter drawer.
- Include states: idle suggestions, recent searches, typing/loading skeleton, too-short query, no results, guest-limited preview, locked result, error, offline, and data-limited notice.
- Guest search must show limited previews and teaser counts without exposing the full database.
- Mobile search should be a full-screen sheet with sticky input and horizontal filter chips.

## Product Structure

Keep the six app users as the core taxonomy. Other labels or document categories are feature contexts, not user types.

Design complete flows for:

- Guest
- Student
- Educator
- Institution
- Tutorial Centre
- Platform Admin

## Required Screen Families

Redesign every screen family, not only the homepage:

- Auth: sign in, sign up, role selection, password reset, admin access-code gate.
- Student: My World, profile, explore, search, programme comparison, programme overview, domain detail, role detail, career path, career changer, entrepreneurship path, scholarships, application windows, PhD/elite pathways, locked upcoming pages.
- Educator: onboarding, request-code flow, verification claim, student provisioning, printable login card, roster, consent visibility states, reports.
- Institution and Tutorial Centre: admin shell, programme overview, programme intelligence, university/programme comparisons, peer/national benchmarks, teams, verification status, locked modules.
- Platform Admin: institution review queue, access-code generation, verification state review, programme/university data oversight, expert dossier, mapping feedback review.
- Profiles: student profile, educator profile, institution profile, tutorial centre profile, admin profile, public preview versions where relevant.
- Search: global search, scoped search, empty states, results groups, filters, pagination or progressive disclosure.
- Explore: programmes, domains, roles, domain clusters, filters, guest preview limits, student full views.

## Important UX Decisions

- Keep admin access code and proof verification separate.
  - Access code means owner-approved admin entry.
  - Verification means the organization proof has been reviewed.
- Show verification state visibly in admin mode: pending, owner-code access, verified, rejected, or needs review.
- For locked or not-yet-live pages, do not show plain "coming soon". Use a locked tile/page with an icon, simple catchy description, and clear locked state.
- Students should get comparison when it helps a decision: programme vs programme, admission fit, domain paths, and career outcomes. Do not expose raw database dumps.
- Guests may preview explore/search, but not bulk-browse the full database. Use teaser counts, limited results, and calls to sign in.
- Admins can see broader programme and university details according to admin type. Scope institution and tutorial-centre admins to their own context unless platform-admin privileges are present.

## Component Inventory

Create Figma components and variants for:

- App shell: desktop sidebar, mobile tabs, workspace switcher, breadcrumb.
- Navigation item: default, hover, active, nested, locked.
- Buttons: primary, secondary, text, icon-only, destructive, loading, disabled.
- Inputs: search, text field, select, segmented control, checkbox, toggle, slider.
- Search system: search bar, command overlay, scoped results panel, result rows by type, result groups, filter chips, empty/loading/locked/guest-limited states.
- Tabs: default, active, disabled, locked.
- Tables/lists: header, row, selected row, empty row, loading row, locked row.
- Metric blocks: default, live, pending, warning, verified.
- Badges: verified, pending, owner-code, locked, beta, data-limited.
- Locked page tile: icon/image, title, short description, lock badge.
- Profile header: avatar/logo, name, role, verification state, quick actions.
- Programme/domain/role cards: compact, detailed, comparison row.
- Empty, loading, error, offline, no-permission, and data-limited states.
- Modals/drawers: verification request, access code entry, invite member, export warning.

## Figma Prompt

Paste this into Figma:

```text
Redesign the Sifter SkillUp career intelligence platform as a complete, theme-agnostic product system, not a landing page. Use the attached visual grammar as the quality target: calm operating-system UI, precise 4px spacing, strong left navigation, text-only tabs, dense readable lists/tables, restrained icons, hairline borders, and no decorative gradients or card-heavy marketing layouts.

Create a full Figma design system and screen set for the six core users: Guest, Student, Educator, Institution, Tutorial Centre, and Platform Admin. Do not create extra user taxonomies from documents; documents are feature contexts only.

Use semantic design tokens instead of fixed colors: surface, text, border, accent, status, warning, danger, success, locked, pending, verified. The design must work with any brand palette.

Design these flows in detail: auth, role selection, admin access-code gate, verification claim, student explore/search, programme comparison, programme overview, domain detail, role detail, My World/profile, career changer, entrepreneurship pathway, PhD/elite pathway, scholarships/application windows, educator student provisioning, printable login card, consent-aware roster, institution admin dashboard, tutorial centre dashboard, programme/university intelligence, expert dossier, mapping feedback review, platform admin verification queue, and locked upcoming pages.

Give special craft attention to search: design global search, Explore search, admin search, and mobile search as metadata-rich grouped result surfaces with filters, previews, loading, empty, locked, guest-limited, and data-limited states.

For every locked/upcoming page, replace "coming soon" with a polished locked state: icon or image, short catchy description, lock badge, and clear next action where appropriate.

Preserve product meaning:
- Admin access code unlocks controlled admin entry.
- Verification is a separate proof-review state.
- Students can compare programmes when it helps decisions.
- Guests get limited previews, not bulk database access.
- Institution/tutorial admins see scoped intelligence; platform admins see full oversight.

Deliver desktop and mobile variants, component variants for all interaction states, and annotations mapping each component to likely React Native/Expo components. Include empty, loading, error, locked, permission-denied, data-limited, and verified/pending states for every relevant feature.
```
