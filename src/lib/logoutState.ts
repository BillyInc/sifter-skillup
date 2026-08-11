import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPLICIT_LOGOUT_KEY = "@levelup_explicit_logout_v1";

export async function markExplicitLogout(): Promise<void> {
  try {
    await AsyncStorage.setItem(EXPLICIT_LOGOUT_KEY, "1");
  } catch {
    // Non-fatal: routing still falls back to the normal signed-out landing.
  }
}

export async function clearExplicitLogout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EXPLICIT_LOGOUT_KEY);
  } catch {
    // ignore
  }
}

export async function hasExplicitLogout(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(EXPLICIT_LOGOUT_KEY)) === "1";
  } catch {
    return false;
  }
}
