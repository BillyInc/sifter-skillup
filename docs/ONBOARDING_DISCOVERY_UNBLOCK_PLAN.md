# Onboarding to Discovery Unblock Plan

Status: implementation checkpoint
Date: 2026-08-11

## Product rules

- First signed-out visit: root page -> intro carousel -> auth landing -> login/signup/guest.
- Explicit logout from Settings: next website open goes to login/signup, not the intro carousel and not onboarding.
- Guest: creates a backend guest session and lands in Explore preview. Guest never enters onboarding.
- Signed-in user with incomplete onboarding: goes to the actual onboarding flow, resumed at the last saved onboarding step when possible.
- Browser/device back during incomplete onboarding: warn before leaving. The user can continue onboarding, continue later by signing out, or delete the newly created account.
- Signed-in user with completed onboarding: lands on the correct product surface for their role and journey state.
- Lesson/track resume is not the default post-auth return path. Learning routes live behind My World. Home should resume onboarding, admission selection, programme mapping, or the normal Home state.
- Browser close/reopen is not logout. If the session is still valid, the app resumes from the current URL or the correct Home/resume surface. Only explicit logout sets the login redirect.
- Single-device enforcement is required: two devices cannot actively use the same account at the same time.
- PDFs generated for student-facing output must be watermarked with `Sifter LevelUp` and the student's school name when available from self-onboarding or admin-created/provisioned student records.
- Educator guidance must include student account creation/provisioning, but educators also need a way to skip that workflow and open other admin surfaces or the catalogue.
- Admission guidance must keep O-level and UTME separate:
  - O-level/WAEC/NECO subjects qualify the actual programme requirement;
  - UTME/JAMB subjects gate the JAMB application route;
  - a programme should not be presented as eligible unless both available layers are satisfied or clearly marked for review.

## Updated staged scope

This is the controlling scope for the onboarding/discovery unblock. Do not jump into broad visual redesign before the flow is stable and source-backed.

### 1. Finish onboarding first

- Account type gate current focus:
  - SS1/SS2 secondary student;
  - SS3/JAMB candidate;
  - undergraduate/current student;
  - graduate;
  - educator/institution.
- Hide artisan, skilled worker, professional, and career changer from normal onboarding for now.
- If a professional-style path appears later, frame it as expert review, not a normal student onboarding type.
- SS1/SS2 must capture class, school, stream, and O-level subjects for early advisory.
- SS3 must capture school, stream, O-level subjects, and UTME subjects when the student discovers from subjects.
- JAMB candidates must capture tutorial centre or self-taught status, stream, O-level subjects, and UTME subjects when the student discovers from subjects.
- Subject matching must require enough selected subjects to be meaningful.
- Choice switching must clear stale answers from the old branch while preserving common eligibility data such as O-level subjects when the new branch still needs it.
- All `Start onboarding`, `Continue onboarding`, and `Resume onboarding` entry points must route to the account-type gate or last saved onboarding checkpoint, not a loading/logo screen or Explore.
- Guest mode must never enter onboarding. Guest CTAs should say `Create account` and route to signup/auth, not Explore.
- Sign-out must ask for confirmation before ending the session.

### 2. Then admission/discovery flow

- Replace the three separate Admission Intelligence tabs with one guided discovery surface.
- Support these guided variants:
  - user knows programme and university;
  - user knows programme, not university;
  - user knows subjects, not programme;
  - undergraduate knows university, then picks programme from that university's own offering names.
- Programme variants should display as school-specific offerings, not bundled aliases.
- SS1/SS2 should use O-level subjects for early programme advisory, then preview UTME requirements as the next gate, especially for SS2.
- SS3/JAMB should use combined UTME + O-level matching where both are available.
- The sequence remains:
  - subjects/programme/university discovery;
  - programme plus university confirmation;
  - programme-to-domain mapping;
  - domains;
  - sub-groups;
  - career roles;
  - skills, tools, certifications, opportunities.

### 3. Then model-first redesign audit

- Before redesigning detail pages, map the actual codebase hierarchy and data relationships.
- The expected product model is:
  - Programme / school offering;
  - direct, functional, and adjacent domain mappings;
  - domain;
  - sub-group;
  - career role.
- Each level may have its own data and must not be flattened:
  - domain skills, tools, certifications;
  - sub-group skills, tools, certifications;
  - role skills, tools, certifications;
  - technical skills and transferable skills where the data distinguishes them.
- The codebase and source data are the source of truth for hierarchy, labels, filters, mappings, skills, tools, certifications, and admission data.
- Mockups are visual and interaction references only. They must not invent, rename, merge, or substitute the actual product model.
- Search the existing docs/code for how `what the school teaches` is meant to be used before redesigning programme detail.

### 4. Then cleanup/hide incomplete product surfaces

- Remove `Close the gap` from student-facing surfaces until ready.
- Remove demand and in-demand language from student-facing surfaces until data and wording are ready.
- Remove elite/pathways from Home until consolidated according to the relevant pathway docs.
- Remove streak from Career Intelligence and Settings; learning streak belongs behind My World.
- Hide unavailable notification toggles.
- Remove `being populated`, raw parse-state language, and developer-facing copy from student/educator UI.
- Replace terse data dumps with guidance copy that explains what matters, what to do next, and what is unavailable.

### 5. Then test scenario generation

- Generate 100 manual test flows per relevant user type and variation.
- Separate sets for science, commercial, and art.
- Include:
  - subjects;
  - programmes;
  - universities;
  - requirements;
  - domains;
  - sub-groups;
  - roles;
  - skills/tools/certifications where available.
- Test flows must come from source-backed WAEC/JAMB/codebase data, not hand-invented examples.

### 6. Later platform mockup phase

- After onboarding/discovery is stable, scope the whole platform and generate structured mockups/wireframes for each user experience.
- Mockups should improve visual quality, interaction design, hierarchy, density, filters, cards, typography, and responsive behavior.
- Implementation should wait for product-owner refinement of those mockups.

## Mockup comparison and design direction

The supplied mockups are the visual-quality target, not the source of truth for product hierarchy or data.

### What the mockups do better than the current implementation

- They use a clear first-screen hierarchy: brand, page title, one primary action area, and only the fields needed for that step.
- Inputs, selects, chips, helper text, errors, and button states have consistent spacing and visual weight.
- The flow feels guided: each screen asks one decision at a time and uses the answer to reveal the next relevant choice.
- Cards are restrained and scannable instead of looking like raw developer/debug panels.
- Empty/locked states explain why the user cannot continue and what to do next.
- Search and filters are visible, predictable, and designed as controls, not just loose text inputs.
- Mobile and desktop layouts are related but not identical; desktop uses the extra width instead of stretching a mobile form across the page.

### Where the current implementation still falls short

- Onboarding screens are functionally branching, but visually they are still basic stacked forms.
- Some copy still explains implementation details instead of guiding the student.
- The SS1/SS2 form previously asked for subjects before asking what the student wanted help with; this is now being corrected.
- Admission Browse still feels like separate modes instead of one guided discovery surface.
- Programme/domain/sub-group/role detail pages still present too much data as undifferentiated lists.
- Skills, tools, and certifications are not yet presented as prioritized guidance per level.
- `What the school teaches` is not yet surfaced as a clear student-facing explanation in programme detail.
- Current UI still needs proper responsive composition, stronger type scale, cleaner cards, better select/search modals, and less raw metadata.

### Design rules to apply while building

- Build flow logic first, but every new screen/component should move toward the mockup quality rather than extending the current rough UI.
- Do not use the mockup example content as product truth.
- Use the codebase/source data for:
  - account types;
  - programme names and school-specific offerings;
  - subject requirements;
  - direct/functional/adjacent domain mappings;
  - domain, sub-group, and role hierarchy;
  - skills, tools, certifications, and `what the school teaches`.
- Use the mockups for:
  - spacing;
  - typography;
  - input states;
  - search/filter behavior;
  - chip and card polish;
  - guided progression;
  - desktop/mobile layout quality.
- Do not create fake demand, in-demand, market, skill-profile, or readiness sections just to match a mockup.
- If data exists but is incomplete, explain the limitation in user-facing language and avoid raw parser/status wording.

### Student-choice-driven UI rule

The user's selected type and answer path must decide what appears next.

- SS1/SS2:
  - show class, school/tutorial centre, stream, then the chosen guidance path;
  - if they want subject help, ask for UTME-facing subjects and explain that O-level requirements appear later;
  - if they have a programme in mind, search programme first, then show variants/universities/requirements;
  - do not show admin, graduate, professional, artisan, or My World learning setup.
- SS3/JAMB:
  - show the three admission doors: knows programme and university, knows programme only, or knows subjects;
  - require meaningful UTME subject selection before matching;
  - route to admission discovery until programme plus university is resolved.
- Undergraduate/current student:
  - start from university/institution, then show that school's own programme names;
  - route to programme-to-domain mapping, not generic admission onboarding.
- Graduate:
  - avoid undergraduate admission unless the user explicitly chooses a qualification/admission route later;
  - route to discovery/home with relevant graduate context.
- Educator/institution:
  - show organisation onboarding and guidance/admin setup;
  - allow skipping student provisioning to reach other admin surfaces;
  - keep admin access guarded.

Current implementation status: setup-form branching exists, but Home, Explore, Admission Browse, Programme Detail, and admin discovery still need to consistently respect this rule.

## Current blockers found

- Patched: `app/(auth)/_layout.tsx` no longer redirects away from the onboarding route it is already rendering.
- Patched: guest sessions skip onboarding and land in Explore.
- Patched: Home/Profile onboarding entry points send guests to signup, not account onboarding.
- Patched: explicit logout marks a local logout flag so the next root open goes to sign-in instead of intro/onboarding.
- Patched: local starting point, account type, educator profile, and onboarding draft state are user-scoped to avoid same-device account leakage.
- Patched: AccountTypeGate, OnboardingFlow, and EducatorOnboarding hydrate/save user-scoped onboarding drafts.
- Patched: onboarding back/exit guard offers continue onboarding, continue later, or delete account.
- Patched: admin layout blocks signed-out, incomplete, guest, and non-admin direct admin access.
- Patched: educator onboarding does not silently enter admin when backend verification/completion fails.
- Patched: post-auth routing no longer resumes lesson/track routes by default; learning stays behind My World.
- Patched: the SkillUp/lightning loading blocker has been removed from auth/onboarding routing.
- Patched: PDF HTML report output includes a `Sifter LevelUp` watermark plus school name when available.
- Patched schema: `backend/migration_auth_onboarding_security_patch.sql` adds durable auth email codes, onboarding drafts, admin MFA settings, and resume/checkpoint user columns.
- Still to wire fully: frontend onboarding drafts are local-first today. The schema now exists, but backend routes are still needed for cross-device draft save/resume.
- Still to wire fully: signup email verification has a dev/in-memory backend path today. Production should switch it to `auth_email_codes` plus a real email provider.
- Still to wire fully: admin 2FA is prompted/deferable in Settings, but real MFA enforcement requires backend challenge verification against `user_mfa_settings` and `auth_email_codes`.
- Still to audit separately: bulk imported seed SQL contains source-data encoding artifacts. App/source files touched for onboarding are repaired; imported data should be cleaned from source imports or regenerated.
- Replaced: the earlier UTME-only picker assumption is no longer valid. Onboarding and Admission Browse now request `exam_type=olevel` for O-level planning and `exam_type=utme` for UTME gates.
- Patched: O-level and UTME subjects are now separate in onboarding, persistence, and Admission Browse handoff.
- Patched: subject-to-programme matching can run as `utme`, `olevel`, or `combined`; combined results distinguish UTME match, O-level gaps, and O-level review-needed states.
- Patched: SS1/SS2 onboarding uses O-level subjects; SS3/JAMB onboarding collects O-level subjects for every admission door and UTME subjects for subject-first discovery.
- Patched: educator provider sessions open the same Admission Browse guidance flow instead of a disabled stub.

## Implementation plan

1. Replace post-auth lesson/track resume with a discovery-safe route contract:
   - guests -> Explore;
   - incomplete users -> onboarding;
   - admins -> admin home;
   - explicit non-learning deep links may be honored;
   - default students -> Home.
2. Make local user state account-scoped:
   - key `startingPoint`, `educatorProfile`, and `accountType` by user id;
   - clear both current-user and legacy global keys on login/logout/delete;
   - pass `user.id` from screens/hooks.
3. Make onboarding resumable:
   - hydrate `AccountTypeGate` from `onboardingDraft`;
   - persist selected persona/mode;
   - persist student step/profile while editing;
   - persist educator step/profile/access status while editing;
   - clear the draft after successful completion or account deletion.
4. Update back/exit handling:
   - modal copy explains that browser back leaves onboarding;
   - `Continue onboarding` closes modal;
   - `Continue later` signs out and preserves server account + user-scoped draft;
   - `Delete account` calls account deletion and clears local user state.
5. Harden admin onboarding:
   - do not silently enter admin when `submitVerification` or `completeOnboarding` fails;
   - surface a concise error and keep the user on the confirm step;
   - use server-persisted `account_type` where possible, with local override as fallback only after successful server completion.
6. Add admin stack guard:
   - signed-out -> sign-in;
   - incomplete non-guest -> onboarding;
   - non-admin completed user -> student Home;
   - admin completed user -> admin stack.
7. Verification:
   - TypeScript check or lint if available;
   - targeted tests where existing tests cover auth/session/admin escalation;
   - run `npx expo start`/project start check and confirm whether the app boots;
   - manual route trace for first visit, explicit logout, browser close/reopen, incomplete student, incomplete admin, complete student, complete admin, guest.
8. Admission implementation audit:
   - compare implemented onboarding, Home, Explore, Programme Detail, admin Explore, and student-pipeline behavior against `docs/ADMISSION_PATH_IMPLEMENTATION_BRIEF.md`;
   - finish narrow blockers found in the admission-to-discovery route if they affect onboarding completion/resume.
9. PDF watermark audit:
   - find current PDF/export code;
   - add or document the required watermark path for Sifter LevelUp + school name.

## Supabase patch sequence

For an existing Supabase project, apply only migrations that have not already been applied. The patch order is:

1. `supabase-schema.sql` for the base `skillup_dev` schema and users table.
2. `backend/migration_auth_profile.sql` for first name, middle name, last name, and date of birth.
3. `backend/migration_v2.sql` for auth/session support, active device sessions, and legacy SkillUp/My World data.
4. `backend/migration_career_base_registry.sql`, then `backend/migration_career_v2.sql`, then `backend/migration_career_intelligence.sql` for programme/domain/role discovery foundations.
5. `backend/migration_admission_intelligence.sql`, then `backend/migration_remove_postutme_from_cutoff_view.sql`, then `backend/migration_student_pipeline_live.sql` for Admission Intelligence and onboarding-to-discovery data.
6. `backend/seed_subject_catalog.sql`, `backend/seed_subject_options.sql`, `backend/seed_phase8_9_enrichment.sql`, and the admission importer/seed files already used by the project.
7. `backend/migration_provisioning.sql` for institution-provisioned student accounts, school codes, claim codes, affiliations, and consent.
8. `backend/migration_admin_access_grant.sql` and `backend/migration_institution_team_access.sql` for guarded admin access and institution team membership.
9. `backend/migration_feedback_storage.sql`, `backend/migration_internal_staff.sql`, and related admin/support migrations if those surfaces are enabled.
10. `backend/migration_auth_onboarding_security_patch.sql` last, because it depends on users, active sessions, admission/student pipeline, and provisioning concepts being present.

## Application sequence

1. First signed-out root visit shows intro carousel, then auth landing.
2. Signup requires legal consent, profile fields, password confirmation, and email code verification before account creation.
3. Successful signup creates an incomplete account and routes to `/(auth)/onboarding`.
4. Account onboarding opens the real `AccountTypeGate`, not a loading/logo screen.
5. Student personas save a user-scoped onboarding draft and continue through student setup.
6. JAMB/senior-secondary users must resolve programme plus university through Admission Intelligence before onboarding is completed.
7. After admission resolution, the user moves into programme mapping, then domains, subgroups, roles, skills/opportunities.
8. Student/graduate/professional/skilled-worker users who do not require admission resolution complete onboarding and land on Home/Explore discovery, not lesson tracks.
9. Educator/institution users complete educator onboarding, then land on the correct admin dashboard/guidance surface.
10. Guest creates a guest session and lands in Explore preview. Guest does not enter onboarding from Home, Profile, or Explore.
11. Explicit logout routes future opens to sign-in/signup. Browser close keeps the saved session and resumes from the current URL or correct post-auth surface.
12. A second active device invalidates the previous active session; the rejected device clears its token and returns to login.
