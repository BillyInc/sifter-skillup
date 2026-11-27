import { clearLocalAccountType } from "./accountType";
import { clearEducatorProfile } from "./educatorProfile";
import { clearStartingPoint } from "./startingPoint";
import { clearOnboardingDraft } from "./onboardingDraft";
import { clearAdminResume } from "./adminResume";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearOfflineData, clearReadCache } from "./offlineQueue";

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
] as const;

/** Key families (prefix match): per-item or per-user suffixes. */
export const DEVICE_USER_DATA_PREFIXES = [
  "@sifter_feed_comments_v1:", // useFeed.ts, one key per post
  "sifter_diary_", // diaryEngine.ts, one key per user's notes
  "levelup:admin-explore:saved-searches:", // AdminExplorePage.tsx
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

const DEVICE_OWNER_KEY = "@levelup_device_owner_v1";

/**
 * Call when an account signs in. Cached reads and admin drafts survive a
 * "continue later" sign-out, but they are not all scoped by account, so if a
 * different account (or an unknown previous owner) now signs in they are
 * removed. The same user returning keeps them.
 */
export async function reconcileDeviceOwner(userId: string): Promise<void> {
  let previous: string | null = null;
  try {
    previous = await AsyncStorage.getItem(DEVICE_OWNER_KEY);
  } catch {
    previous = null;
  }
  if (previous !== userId) {
    await clearReadCache();
    if (previous) await clearAdminResume(previous);
    await clearAdminResume();
  }
  try {
    await AsyncStorage.setItem(DEVICE_OWNER_KEY, userId);
  } catch {
    // ignore
  }
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
    AsyncStorage.removeItem(DEVICE_OWNER_KEY).catch(() => undefined),
  ]);
}
