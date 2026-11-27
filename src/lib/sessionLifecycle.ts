/**
 * Sign-in / sign-out device-state steps shared by BOTH auth providers: the
 * native/Expo one (src/hooks/useAuth.tsx) and the Vite web shell's adapter
 * (web/src/webAuth.tsx, which aliases `@/hooks/useAuth`). They used to
 * duplicate this logic and the web copy had none of it, so the primary web
 * build never cleared a previous learner's data and could not queue writes.
 *
 * Order matters:
 *  - sign-in: prepareSignIn (reconcile owner, save profile) -> the caller saves
 *    the token -> completeSignIn. The profile is saved BEFORE the token because
 *    queued writes are owned by the saved profile's id; the new token must not
 *    be live while the previous account's profile is still stored.
 *  - sign-out / delete / forced logout: the caller clears the token ->
 *    completeSignOut.
 */
import { clearAllDeviceUserData, clearLocalUserState, reconcileDeviceOwner } from './localUserState';
import { clearSessionProfile, saveSessionProfile } from './sessionProfile';
import { clearExplicitLogout, markExplicitLogout } from './logoutState';
import { switchLocalUser } from './offlineStorage';
import { setCareerCacheIdentity } from './careerCache';

export type SessionProfileLike = { id: string; auth_provider?: string | null };

/** Before the token is stored: reconcile the device owner and save the profile. */
export async function prepareSignIn(profile: SessionProfileLike): Promise<void> {
  await clearLocalUserState();
  await reconcileDeviceOwner(profile.id, { guest: profile.auth_provider === 'guest' });
  await saveSessionProfile(profile);
}

/** After the token is stored. */
export async function completeSignIn(profile: SessionProfileLike): Promise<void> {
  await clearExplicitLogout();
  await switchLocalUser(profile.id);
  await setCareerCacheIdentity(profile.id);
}

/**
 * After the token has been cleared. `preserveLocalUserState` is the
 * "continue later" sign-out: the same account returning keeps its unsent
 * writes, drafts and cached reads (a different account signing in later
 * clears them, see reconcileDeviceOwner), and so does the offline-storage
 * progress queue, which is only replaced when a different account signs in
 * (switchLocalUser(profile.id) at the next sign-in compares the stored owner).
 */
export async function completeSignOut(options: {
  userId?: string | null;
  preserveLocalUserState?: boolean;
}): Promise<void> {
  await clearSessionProfile();
  await markExplicitLogout();
  if (!options.preserveLocalUserState) {
    await clearAllDeviceUserData(options.userId);
  }
  await setCareerCacheIdentity(null);
  if (!options.preserveLocalUserState) {
    await switchLocalUser('__signed_out__');
  }
}
