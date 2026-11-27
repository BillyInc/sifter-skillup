import { clearLocalAccountType } from "./accountType";
import { clearEducatorProfile } from "./educatorProfile";
import { clearStartingPoint } from "./startingPoint";
import { clearOnboardingDraft } from "./onboardingDraft";
import { clearAdminResume } from "./adminResume";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OfflineQueue, clearOfflineData, clearReadCache } from "./offlineQueue";
import { DEVICE_OWNER_KEY, clearDeviceOwner, getDeviceOwner, recordDeviceOwner } from "./deviceOwner";
import { getSavedSessionProfile } from "./sessionProfile";

export async function clearLocalUserState(userId?: string | null): Promise<void> {
  await Promise.all([
    clearLocalAccountType(userId),
    clearEducatorProfile(userId),
    clearStartingPoint(userId),
    clearOnboardingDraft(userId),
  ]);
}

/**
 * AsyncStorage keys that hold one learner's data but are not scoped by user id.
 * Each is verified against the module that owns it.
 */
export const DEVICE_USER_DATA_KEYS = [
  "@levelup_recent_searches_v1", // recentSearches.ts
  "@sifter_notifications_v1", // notificationEngine(V2).ts
  "@sifter_xp_v1", // XPEngine.ts
  "@sifter_feed_bookmarks_v1", // useFeed.ts
  "@sifter_feed_reactions_v1", // useFeed.ts
  "@sifter_monitored_tracks_v1", // useFeed.ts
  "@sifter_streak_v1", // StreakEngine.ts
  "@sifter_coach_explore_v1", // CoachMark usage
  "sifter_notes_v1", // LessonScreen.tsx notes
  "sifter_bookmarks_v1", // LessonScreen.tsx bookmarks
  "sifter_bookmarks", // diaryEngine.ts bookmarks
  "sifter_diary_index", // diaryEngine.ts
  "sifter_last_position", // gameStore.ts
  "pending_rewards", // rewardsEngine.ts: unsent reward results, each tagged with a userId
] as const;

/** Key families (prefix match): per-item or per-user suffixes. */
export const DEVICE_USER_DATA_PREFIXES = [
  "@sifter_feed_comments_v1:", // useFeed.ts, one key per post
  "sifter_diary_", // diaryEngine.ts, one key per user's notes
  "levelup:admin-explore:saved-searches:", // AdminExplorePage.tsx
  "sifter_track_setup_v1_", // TrackSetupScreen.tsx, one key per track
] as const;

async function clearUnscopedUserKeys(): Promise<void> {
  try {
    const all = await AsyncStorage.getAllKeys();
    const doomed = new Set<string>(DEVICE_USER_DATA_KEYS);
    for (const key of all) {
      if (DEVICE_USER_DATA_PREFIXES.some((p) => key.startsWith(p))) doomed.add(key);
    }
    await AsyncStorage.multiRemove([...doomed]);
  } catch {
    // Best effort: sign-out must still complete.
  }
}

export { DEVICE_OWNER_KEY };

/**
 * Call when an account signs in (BEFORE its profile is saved: the saved
 * profile is still the previous account's). Cached reads and admin drafts
 * survive a "continue later" sign-out, but they are not all scoped by account,
 * so if a different account (or an unknown previous owner) now signs in they
 * are removed. The same user returning keeps them. When the previous owner is
 * known and different, their device learner data (DEVICE_USER_DATA_KEYS and
 * prefixes) is removed too.
 *
 * The previous owner is the recorded device owner or, for a session that
 * predates the owner key, the id in the still-saved session profile.
 *
 * Queued writes: they carry their own ownerId and are only ever sent with that
 * account's token, so they are never visible to the incoming account. A normal
 * account that replaces the previous owner drops the previous owner's unsent
 * writes (they must not carry over). A GUEST session is the exception: it
 * clears the shared, unscoped data above (guest data must not mix with the
 * previous learner's) but keeps the previous owner's queued writes, so trying
 * the app as a guest after "continue later" cannot destroy that learner's
 * unsent work. Those writes still expire after FOREIGN_OWNER_MAX_AGE_MS, and
 * are dropped when a different non-guest account signs in.
 */
export async function reconcileDeviceOwner(
  userId: string,
  options: { guest?: boolean } = {},
): Promise<void> {
  let previous: string | null = await getDeviceOwner();
  if (!previous) {
    try {
      const saved = await getSavedSessionProfile<{ id?: string | number }>();
      previous = saved?.id != null && saved.id !== "" ? String(saved.id) : null;
    } catch {
      previous = null;
    }
  }
  if (previous !== userId) {
    await clearReadCache();
    if (previous) await clearAdminResume(previous);
    await clearAdminResume();
    if (previous) {
      // A different account signed in after a "continue later" sign-out: the
      // previous learner's unscoped data must not carry over.
      await clearUnscopedUserKeys();
      if (!options.guest) await OfflineQueue.dropOwner(previous);
    }
  }
  await recordDeviceOwner(userId);
}

/**
 * Everything a previous user left on this device. Clears:
 *  - the per-user state above (account type, educator profile, starting
 *    point, onboarding draft);
 *  - admin resume/task and roster drafts (student names, guardian details),
 *    scoped and legacy unscoped;
 *  - the offline write queue and cached reads (`sifter_cache_*`);
 *  - the unscoped learner keys in DEVICE_USER_DATA_KEYS and the key families
 *    in DEVICE_USER_DATA_PREFIXES;
 *  - the recorded device owner.
 * It does NOT clear the auth token/session profile (the caller does), theme,
 * legal acceptance, intro-seen flags, the device id, offline progress (see
 * switchLocalUser) or career-cache data (see setCareerCacheIdentity).
 * Call on sign-out, account deletion and forced logout only; never while the
 * same user is still signed in, because queued writes are that user's unsent data.
 */
export async function clearAllDeviceUserData(userId?: string | null): Promise<void> {
  await Promise.all([
    clearLocalUserState(userId),
    clearAdminResume(userId),
    // Unscoped legacy keys, in case the user id is unknown.
    userId ? clearAdminResume() : Promise.resolve(),
    clearOfflineData(),
    clearUnscopedUserKeys(),
    clearDeviceOwner(userId),
  ]);
}
