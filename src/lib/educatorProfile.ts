/**
 * educatorProfile — local persistence for the educator's onboarding profile.
 *
 * There is no backend field for the educator/institution claim yet, so we store
 * it on-device. This mirrors src/lib/startingPoint.ts exactly: it is the single
 * seam to swap for a real endpoint later. When the institutional backend lands,
 * change the bodies of get/save to call the API and everything upstream keeps
 * working.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { EducatorProfile } from "../types/institution";

const KEY = "@levelup_educator_profile_v1";

function keyFor(userId?: string | null): string {
  return userId ? `${KEY}:${userId}` : KEY;
}

export async function getEducatorProfile(userId?: string | null): Promise<EducatorProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as EducatorProfile) : null;
  } catch {
    return null;
  }
}

export async function saveEducatorProfile(
  profile: EducatorProfile,
  userId?: string | null,
): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(profile));
  } catch {
    // Non-fatal: onboarding still completes even if local persistence fails.
  }
}

export async function clearEducatorProfile(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyFor(userId));
    if (userId) {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {
    // ignore
  }
}
