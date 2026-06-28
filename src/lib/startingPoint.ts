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

const KEY = "@levelup_starting_point_v1";

export async function getStartingPoint(): Promise<StartingPointProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StartingPointProfile) : null;
  } catch {
    return null;
  }
}

export async function saveStartingPoint(
  profile: StartingPointProfile,
): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Non-fatal: onboarding still completes even if local persistence fails.
  }
}

export async function clearStartingPoint(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
