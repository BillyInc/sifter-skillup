/**
 * startingPoint — local persistence for the user's onboarding profile.
 *
 * There is no backend field for the career starting-point yet, so we store it
 * on-device. This is the single seam to swap for a real endpoint later: when
 * the career backend lands, change the bodies of get/save to call the API and
 * everything upstream keeps working.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StartingPointProfile } from "../types/onboarding";
import { careerData } from "./careerData";

const KEY = "@levelup_starting_point_v1";

function keyFor(userId?: string | null): string {
  return userId ? `${KEY}:${userId}` : KEY;
}

export async function getStartingPoint(userId?: string | null): Promise<StartingPointProfile | null> {
  try {
    const server = await careerData.getStartingPoint();
    if (server.status === "real" && server.data) {
      await AsyncStorage.setItem(keyFor(userId), JSON.stringify(server.data));
      return server.data;
    }
  } catch {
    // Fall through to local cache.
  }
  try {
    const raw = await AsyncStorage.getItem(keyFor(userId));
    return raw ? (JSON.parse(raw) as StartingPointProfile) : null;
  } catch {
    return null;
  }
}

export async function saveStartingPoint(
  profile: StartingPointProfile,
  userId?: string | null,
): Promise<void> {
  try {
    await careerData.saveStartingPoint(profile);
  } catch {
    // Local persistence below is the offline fallback.
  }
  try {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(profile));
  } catch {
    // Non-fatal: onboarding still completes even if local persistence fails.
  }
}

export async function clearStartingPoint(userId?: string | null): Promise<void> {
  try {
    await AsyncStorage.removeItem(keyFor(userId));
    if (userId) {
      await AsyncStorage.removeItem(KEY);
    }
  } catch {
    // ignore
  }
}
