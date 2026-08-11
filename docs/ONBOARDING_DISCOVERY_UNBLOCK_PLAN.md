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

- `app/(auth)/_layout.tsx` already contains the route-loop guard for onboarding, but onboarding state is not yet persisted through the actual student/admin screens.
- `src/lib/resumeNavigation.ts` still resolves `last_position` and `current_track_id` into lesson/track routes, despite its comment saying that fallback was removed.
- `src/screens/HomeScreen.tsx` still builds the main continue action from `last_position`, which can send users back into `/map/lesson` instead of Home/admission/discovery.
- `src/lib/startingPoint.ts`, `src/lib/educatorProfile.ts`, and `src/lib/accountType.ts` use global AsyncStorage keys. That can leak account A's local onboarding/admin state into account B on the same browser if cleanup misses or server reads fail.
- `OnboardingBackGuard` exists, but only offers logout/continue and does not expose the product decision to delete the just-created account.
- `AccountTypeGate`, `OnboardingFlow`, and `EducatorOnboarding` do not yet hydrate/save the `onboardingDraft` helper, so incomplete users restart at the persona gate instead of resuming.
- `EducatorOnboarding.finish` catches all backend failures and routes into admin from local state. That hides verification/access failures and can make admin onboarding appear complete when the server refused it.
- `app/(admin)/_layout.tsx` does not enforce admin access itself. It depends on upstream redirects and screen-level API gates. Add a stack guard so direct admin URLs cannot render for non-admin or incomplete users.
- The admission implementation brief still has unfinished follow-up tasks. The implementation must audit the current state against that doc before claiming completion.
- Old SkillUp/lightning branding must not appear in onboarding or loading states. If a loading state is unavoidable, it should be neutral or LevelUp-branded and must not trap routing.

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
