/**
 * Device owner on installs that predate the owner key, and the guest rule.
 * Uses the real session profile, local-state and queue modules.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { OfflineQueue, offlineWrite } from "../src/lib/offlineQueue";
import {
  clearAllDeviceUserData,
  reconcileDeviceOwner,
  DEVICE_OWNER_KEY,
  DEVICE_USER_DATA_KEYS,
  DEVICE_USER_DATA_PREFIXES,
} from "../src/lib/localUserState";
import { clearSessionProfile, saveSessionProfile } from "../src/lib/sessionProfile";
import { recordDeviceOwner, clearDeviceOwner } from "../src/lib/deviceOwner";

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: false, isInternetReachable: false }),
    addEventListener: jest.fn(() => () => undefined),
  },
}));
jest.mock("../src/lib/api", () => ({
  API_BASE: "http://api.test",
  API: { getToken: jest.fn(async () => null) },
}));

const PROFILE_KEY = "@levelup_session_profile_v1";
const flush = () => new Promise((r) => setTimeout(r, 0));

/** What an install from before the owner key looks like: a profile, no owner. */
async function seedPreUpgradeSessionFor(userId: string) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ id: userId }));
  await AsyncStorage.setItem("@sifter_xp_v1", "a-xp");
  await AsyncStorage.setItem("sifter_cache_x", "{}");
  await offlineWrite("/api/flags", "POST", { n: 1 }, "normal");
  await flush();
  expect(OfflineQueue.pendingCount).toBe(1);
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
}

beforeEach(async () => {
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });
  await AsyncStorage.clear();
  await OfflineQueue.clear();
});

describe("owner key on an upgraded install", () => {
  it("is written when the session profile is saved (restore, refresh)", async () => {
    await saveSessionProfile({ id: "user-a" });
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("user-a");
  });

  it("continue-later after a restored session, then a different account: A's data and queue go", async () => {
    await seedPreUpgradeSessionFor("user-a");
    // _tryLoadSavedSession / refreshUser re-save the profile after the upgrade.
    await saveSessionProfile({ id: "user-a" });
    // "Continue later": the profile is cleared, the owner key is kept.
    await clearSessionProfile();
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("user-a");

    await reconcileDeviceOwner("user-b");

    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBeNull();
    expect(await AsyncStorage.getItem("sifter_cache_x")).toBeNull();
    expect(OfflineQueue.pendingCount).toBe(0);
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("user-b");
  });

  it("falls back to the still-saved session profile when the owner key is absent", async () => {
    // Expired token / device_mismatch: the profile was never cleared and the
    // install predates the owner key.
    await seedPreUpgradeSessionFor("user-a");

    await reconcileDeviceOwner("user-b");

    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBeNull();
    expect(OfflineQueue.pendingCount).toBe(0);
  });

  it("the same account returning keeps everything", async () => {
    await seedPreUpgradeSessionFor("user-a");
    await reconcileDeviceOwner("user-a");
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBe("a-xp");
    expect(OfflineQueue.pendingCount).toBe(1);
  });
});

describe("guest sessions (item 8)", () => {
  it("clear the shared unscoped data but keep the previous learner's unsent writes", async () => {
    await seedPreUpgradeSessionFor("user-a");
    await clearSessionProfile();
    await AsyncStorage.setItem(DEVICE_OWNER_KEY, "user-a");

    await reconcileDeviceOwner("guest-1", { guest: true });

    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBeNull(); // would mix
    expect(OfflineQueue.pendingCount).toBe(1); // owner-tagged, never sent as the guest
    expect(OfflineQueue.getItems()[0].ownerId).toBe("user-a");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("guest-1");
  });

  it("a real account replacing the guest drops only the guest's writes, not A's", async () => {
    await seedPreUpgradeSessionFor("user-a");
    await clearSessionProfile();
    await AsyncStorage.setItem(DEVICE_OWNER_KEY, "user-a");
    await reconcileDeviceOwner("guest-1", { guest: true });

    await saveSessionProfile({ id: "guest-1" });
    await offlineWrite("/api/flags", "POST", { n: 2 }, "normal");
    await flush();
    expect(OfflineQueue.pendingCount).toBe(2);

    await reconcileDeviceOwner("user-a"); // A signs back in
    expect(OfflineQueue.getItems().map((i) => i.ownerId)).toEqual(["user-a"]);
  });

  it("a different non-guest account still drops A's writes", async () => {
    await seedPreUpgradeSessionFor("user-a");
    await clearSessionProfile();
    await AsyncStorage.setItem(DEVICE_OWNER_KEY, "user-a");
    await reconcileDeviceOwner("user-b");
    expect(OfflineQueue.pendingCount).toBe(0);
  });
});

describe("guest-then-account chain", () => {
  it("dave queues, signs out with continue-later, a guest signs in, then erin signs in: dave's write is gone", async () => {
    await saveSessionProfile({ id: "dave" });
    await offlineWrite("/api/flags", "POST", { text: "dave's private note" }, "normal");
    await flush();
    await clearSessionProfile(); // continue later: owner key stays
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("dave");

    await reconcileDeviceOwner("guest-1", { guest: true });
    await saveSessionProfile({ id: "guest-1" });
    await offlineWrite("/api/flags", "POST", { n: 2 }, "normal");
    await flush();
    expect(OfflineQueue.getItems().map((i) => i.ownerId).sort()).toEqual(["dave", "guest-1"]);
    await clearSessionProfile(); // the guest session ends with continue later too

    await reconcileDeviceOwner("erin"); // previous owner is only the guest

    expect(OfflineQueue.pendingCount).toBe(0);
    const raw = (await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]";
    expect(raw).not.toContain("dave");
    expect(JSON.parse(raw)).toEqual([]);
  });

  it("erin keeps only her own writes when others are on disk", async () => {
    await saveSessionProfile({ id: "dave" });
    await offlineWrite("/api/flags", "POST", { n: 1 }, "normal");
    await flush();
    await saveSessionProfile({ id: "erin" });
    await offlineWrite("/api/flags", "POST", { n: 2 }, "normal");
    await flush();
    await reconcileDeviceOwner("erin");
    expect(OfflineQueue.getItems().map((i) => i.ownerId)).toEqual(["erin"]);
    expect(JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]")).toHaveLength(1);
  });
});

describe("clearing", () => {
  it("clears pending_rewards and the per-track setup flags", async () => {
    expect(DEVICE_USER_DATA_KEYS).toContain("pending_rewards");
    expect(DEVICE_USER_DATA_PREFIXES).toContain("sifter_track_setup_v1_");
    await AsyncStorage.setItem("pending_rewards", '[{"userId":"user-a"}]');
    await AsyncStorage.setItem("sifter_track_setup_v1_quant", "1");
    await AsyncStorage.setItem("@sifter_theme_mode_v3", "dark");
    await clearAllDeviceUserData("user-a");
    expect(await AsyncStorage.getItem("pending_rewards")).toBeNull();
    expect(await AsyncStorage.getItem("sifter_track_setup_v1_quant")).toBeNull();
    expect(await AsyncStorage.getItem("@sifter_theme_mode_v3")).toBe("dark");
  });

  it("does not remove an owner key another tab has already pointed at someone else", async () => {
    await recordDeviceOwner("user-b");
    await clearDeviceOwner("user-a");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("user-b");
    await clearDeviceOwner("user-b");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
  });
});
