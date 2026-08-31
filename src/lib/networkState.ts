import NetInfo from "@react-native-community/netinfo";

/** Guard external links and other online-only actions before attempting them. */
export async function hasInternetConnection(): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    const state = await NetInfo.fetch();
    return state.isConnected !== false && state.isInternetReachable !== false;
  } catch {
    // Unknown connectivity should not prevent a normal destination attempt.
    return true;
  }
}

export const OFFLINE_LINK_NOTICE = "Connect to the internet to open this link.";
