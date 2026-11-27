import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPLICIT_LOGOUT_KEY = "@levelup_explicit_logout_v1";
/**
 * Set by a "continue later" sign-out (preserveLocalUserState). Another tab
 * that sees the token disappear reads it to tell that sign-out from a forced
 * one (expiry, another device): with it set, the stored queue, drafts and
 * device owner must NOT be wiped. Cleared by the next sign-in.
 */
const PRESERVE_LOCAL_STATE_KEY = "@levelup_preserve_local_state_v1";

/**
 * Record that the sign-out in progress keeps this learner's local data. Call
 * it BEFORE the token is removed: other tabs react to the token's removal, so
 * the marker has to be visible by then.
 */
export async function markPreserveLocalState(): Promise<void> {
  try {
    await AsyncStorage.setItem(PRESERVE_LOCAL_STATE_KEY, "1");
  } catch {
    // Non-fatal: another tab then treats the sign-out as an ordinary one.
  }
}

export async function hasPreserveLocalState(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PRESERVE_LOCAL_STATE_KEY)) === "1";
  } catch {
    return false;
  }
}

/**
 * `preserveLocalUserState` leaves (or sets) the preserve marker; any other
 * sign-out removes it, so a stale marker cannot protect data that was wiped.
 */
export async function markExplicitLogout(options: { preserveLocalUserState?: boolean } = {}): Promise<void> {
  try {
    await AsyncStorage.setItem(EXPLICIT_LOGOUT_KEY, "1");
    if (options.preserveLocalUserState) await AsyncStorage.setItem(PRESERVE_LOCAL_STATE_KEY, "1");
    else await AsyncStorage.removeItem(PRESERVE_LOCAL_STATE_KEY);
  } catch {
    // Non-fatal: routing still falls back to the normal signed-out landing.
  }
}

export async function clearExplicitLogout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(EXPLICIT_LOGOUT_KEY);
    await AsyncStorage.removeItem(PRESERVE_LOCAL_STATE_KEY);
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
