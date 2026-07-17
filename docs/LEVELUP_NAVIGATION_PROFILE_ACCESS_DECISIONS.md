# LevelUp navigation, profile and admin-access decisions

## Back behaviour scope

Primary destinations do not need visible back controls:

- Landing
- Student Home
- Explore root
- My World root
- Profile root
- University admin dashboard
- School/tutorial guidance dashboard

Screens that deserve visible back/dismiss behaviour:

- Auth, signup and reset flows.
- Onboarding steps.
- Explore detail screens: programme, school/admission, domain, subgroup, role,
  pathway, scholarship/window and organisation/opportunity detail.
- Modal or sheet surfaces: use `X`, `Close`, backdrop tap, or native
  `onRequestClose`.
- Admin subpages: verification, affiliation, profile/team, domain lens, role
  value, skills gaps, trends, peer benchmarks, students/provisioning/session.

Implemented in this pass:

- `DetailScaffold` now has a safer back fallback to Explore when no history
  exists.
- `AdminShell` now shows a visible Back control on non-home admin pages.
- New entrepreneurship pathway has its own Back control.

## Profile decision

There are two different profile objects:

- Personal Profile: the user's own account, learning state, saves, portfolio,
  settings and sign-out.
- Organisation Profile: the school/university/tutorial centre workspace, team
  seats, verification and access scope.

Therefore:

- Student/guest profile stays in the normal Profile tab.
- Educators and institution admins get an "Admin workspace" shortcut from the
  personal Profile.
- Organisation profile lives inside admin as `Profile + team`.

## Multi-official access model

No school owner, counsellor, university official or tutorial centre owner should
share one login.

Access model:

1. One organisation record is represented by `schools` plus `institution_members`.
2. The owner/admin is a member with an admin-capable role.
3. The owner/admin invites another official by email.
4. The invite creates a pending `institution_member_invites` row.
5. The invited official signs in with their own account and accepts/gets linked
   to the same organisation.
6. Their role determines what they can do.

Roles:

- `owner`
- `institution_admin`
- `admin`
- `educator`
- `counsellor`
- `course_advisor`
- `hod`
- `dean`
- `admissions_officer`
- `provisioning_manager`
- `data_viewer`

This applies to universities, secondary schools, tutorial centres and JAMB
cafes. Student-level data is not unlocked by membership alone; it still requires
the provisioning/claim/consent model.

## Market intelligence by audience

Universities:

- Inward programme-mix intelligence.
- Domain lens, role value, skills gaps and trends.
- Peer benchmarks against other institutions.

Secondary schools and tutorial centres:

- Guidance market intelligence.
- Compare programmes, universities, domains and roles to advise students.
- Domain lens, role value, learning gaps and trends are available in guidance
  context.
- No institution peer benchmark for their own school against universities.

## Schema additions to run

After the existing live-routing migrations, run:

`backend/migration_institution_team_access.sql`

It adds:

- `institution_members.seat_status`
- `institution_members.title`
- `institution_members.invited_by`
- `institution_members.accepted_at`
- `institution_members.updated_at`
- Expanded `institution_members.role` constraint
- New `institution_member_invites` table

This is separate from the market-intelligence migration:

`backend/migration_market_intelligence_v1.sql`

That file adds source registry, market provenance, posting windows, value/demand
bands and volume x value quadrants.
