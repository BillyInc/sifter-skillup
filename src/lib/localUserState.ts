import { clearLocalAccountType } from "./accountType";
import { clearEducatorProfile } from "./educatorProfile";
import { clearStartingPoint } from "./startingPoint";
import { clearOnboardingDraft } from "./onboardingDraft";
import { clearAdminResume } from "./adminResume";
import { clearOfflineData } from "./offlineQueue";

export async function clearLocalUserState(userId?: string | null): Promise<void> {
  await Promise.all([
    clearLocalAccountType(userId),
    clearEducatorProfile(userId),
    clearStartingPoint(userId),
    clearOnboardingDraft(userId),
  ]);
}

/**
 * Everything a previous user left on this device: the per-user state above,
 * admin roster drafts/resume (student names, guardian details), the offline
 * write queue and cached reads. Call on sign-out and account deletion only;
 * never while the same user is still signed in, because queued writes are
 * that user's unsent data.
 */
export async function clearAllDeviceUserData(userId?: string | null): Promise<void> {
  await Promise.all([
    clearLocalUserState(userId),
    clearAdminResume(userId),
    // Unscoped legacy keys, in case the user id is unknown.
    userId ? clearAdminResume() : Promise.resolve(),
    clearOfflineData(),
  ]);
}
