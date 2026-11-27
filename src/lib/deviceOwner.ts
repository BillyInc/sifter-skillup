/**
 * Which account last signed in on this device. Kept in its own tiny module (no
 * imports from the offline queue or local-state code) so the session profile
 * and the sign-in reconcile can both use it without an import cycle.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DEVICE_OWNER_KEY = "@levelup_device_owner_v1";

export async function getDeviceOwner(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(DEVICE_OWNER_KEY)) || null;
  } catch {
    return null;
  }
}

/**
 * Record the account whose data is on this device. Called whenever a session
 * profile is saved or restored, so an install that predates the owner key (or
 * a session restored without a fresh sign-in) still knows its owner when
 * "continue later" is followed by a different account signing in.
 */
export async function recordDeviceOwner(userId: string | number | null | undefined): Promise<void> {
  if (userId == null || userId === "") return;
  try {
    await AsyncStorage.setItem(DEVICE_OWNER_KEY, String(userId));
  } catch {
    // Best effort.
  }
}

/** Forget the owner, but only if it is still `userId` (or `userId` is unknown). */
export async function clearDeviceOwner(userId?: string | null): Promise<void> {
  try {
    if (userId) {
      const current = await AsyncStorage.getItem(DEVICE_OWNER_KEY);
      // Another tab signed a different account in meanwhile: leave their key.
      if (current && current !== String(userId)) return;
    }
    await AsyncStorage.removeItem(DEVICE_OWNER_KEY);
  } catch {
    // ignore
  }
}
