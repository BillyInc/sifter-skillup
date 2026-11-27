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
import { clearExplicitLogout, markExplicitLogout, markPreserveLocalState } from './logoutState';
import { switchLocalUser } from './offlineStorage';
import { setCareerCacheIdentity } from './careerCache';

export { isNetworkFailure } from './networkFailure';

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
  // Policy for the two unsent-work queues when a DIFFERENT account (guest or
  // not) signs in after a "continue later" sign-out:
  //  - OfflineQueue (writes) is owner-tagged and only ever sent with its own
  //    owner's token, so a guest takeover keeps it (reconcileDeviceOwner);
  //    a non-guest account drops everyone else's.
  //  - The progress/XP queue in offlineStorage (QUEUE_KEY) is NOT owner-tagged
  //    and is drained to /api/sync/drain with whatever token is current, so
  //    keeping it would deliver the previous learner's progress to the new
  //    account. It is therefore dropped for every different account, guest
  //    included (switchLocalUser). The previous learner's unsent progress is
  //    lost in that case; the server copy from their last sync remains.
  await switchLocalUser(profile.id);
  await setCareerCacheIdentity(profile.id);
}

/**
 * First step of a sign-out, BEFORE the token is cleared. For the "continue
 * later" sign-out it writes the preserve marker, because other tabs react to
 * the token's removal and must already be able to see that the stored data is
 * meant to stay.
 */
export async function beginSignOut(options: { preserveLocalUserState?: boolean } = {}): Promise<void> {
  if (options.preserveLocalUserState) await markPreserveLocalState();
}

/**
 * After the token has been cleared. `preserveLocalUserState` is the
 * "continue later" sign-out: the same account returning keeps its unsent
 * writes, drafts and cached reads (a different non-guest account signing in
 * later drops them, see reconcileDeviceOwner), and so does the offline-storage
 * progress queue until ANY different account signs in (switchLocalUser compares
 * the stored owner, guests included: see the policy note on completeSignIn).
 *
 * With `preserveLocalUserState` the caller should call markPreserveLocalState()
 * BEFORE clearing the token so other tabs, which react to the token's removal,
 * see the marker and leave the stored data alone (useBrowserSessionWatch).
 */
export async function completeSignOut(options: {
  userId?: string | null;
  preserveLocalUserState?: boolean;
}): Promise<void> {
  await clearSessionProfile();
  await markExplicitLogout({ preserveLocalUserState: options.preserveLocalUserState });
  if (!options.preserveLocalUserState) {
    await clearAllDeviceUserData(options.userId);
  }
  await setCareerCacheIdentity(null);
  if (!options.preserveLocalUserState) {
    await switchLocalUser('__signed_out__');
  }
}
