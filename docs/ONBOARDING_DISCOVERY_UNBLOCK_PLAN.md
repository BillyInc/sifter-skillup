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
