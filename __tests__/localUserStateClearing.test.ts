/** What sign-out clears, and what a different account signing in must not inherit. */
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  DEVICE_USER_DATA_KEYS,
  clearAllDeviceUserData,
  reconcileDeviceOwner,
} from "../src/lib/localUserState";
import { saveAdminResume, getAdminResume } from "../src/lib/adminResume";

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: { fetch: jest.fn(), addEventListener: jest.fn(() => () => undefined) },
}));

const LISTED_KEYS = [
  "@levelup_recent_searches_v1",
  "@sifter_notifications_v1",
  "@sifter_xp_v1",
  "@sifter_feed_bookmarks_v1",
  "@sifter_feed_reactions_v1",
  "sifter_notes_v1",
  "@sifter_monitored_tracks_v1",
  "@sifter_streak_v1",
  "@sifter_coach_explore_v1",
];
const WILDCARD_KEYS = ["@sifter_feed_comments_v1:post-1", "@sifter_feed_comments_v1:post-2", "sifter_diary_u1_local_only"];
const KEPT_KEYS = ["@sifter_theme_mode_v3", "@levelup_explicit_logout_v1", "sifter_device_id_v2", "@sifter_legal_acceptance_v2"];

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("clearAllDeviceUserData", () => {
  it("covers every learner key the review listed", () => {
    for (const key of LISTED_KEYS) expect(DEVICE_USER_DATA_KEYS).toContain(key);
  });

  it("removes unscoped learner keys, including the wildcard families", async () => {
    for (const key of [...LISTED_KEYS, ...WILDCARD_KEYS, ...KEPT_KEYS]) {
      await AsyncStorage.setItem(key, "x");
    }
    await clearAllDeviceUserData("u1");

    for (const key of [...LISTED_KEYS, ...WILDCARD_KEYS]) {
      expect(await AsyncStorage.getItem(key)).toBeNull();
    }
    for (const key of KEPT_KEYS) expect(await AsyncStorage.getItem(key)).toBe("x");
  });

  it("removes every extra key it declares", async () => {
    for (const key of DEVICE_USER_DATA_KEYS) await AsyncStorage.setItem(key, "x");
    await clearAllDeviceUserData("u1");
    for (const key of DEVICE_USER_DATA_KEYS) expect(await AsyncStorage.getItem(key)).toBeNull();
  });
});

describe("reconcileDeviceOwner", () => {
  async function seedForUserA() {
    await AsyncStorage.setItem("sifter_cache_referral_stats", "{}");
    await saveAdminResume({ href: "/(admin)/home", label: "Home" } as any, "user-a");
  }

  it("keeps the read cache and admin state when the same user returns", async () => {
    await reconcileDeviceOwner("user-a");
    await seedForUserA();
    await reconcileDeviceOwner("user-a");
    expect(await AsyncStorage.getItem("sifter_cache_referral_stats")).toBe("{}");
    expect(await getAdminResume("user-a")).not.toBeNull();
  });

  it("clears the read cache and admin drafts when a different user signs in", async () => {
    await reconcileDeviceOwner("user-a");
    await seedForUserA();
    await reconcileDeviceOwner("user-b");
    expect(await AsyncStorage.getItem("sifter_cache_referral_stats")).toBeNull();
    expect(await getAdminResume("user-a")).toBeNull();
  });

  it("clears the cache when the previous owner is unknown", async () => {
    await seedForUserA();
    await reconcileDeviceOwner("user-b");
    expect(await AsyncStorage.getItem("sifter_cache_referral_stats")).toBeNull();
  });

  it("forgets the owner on sign-out", async () => {
    await reconcileDeviceOwner("user-a");
    await clearAllDeviceUserData("user-a");
    await AsyncStorage.setItem("sifter_cache_x", "1");
    await reconcileDeviceOwner("user-a"); // owner unknown again => cache dropped
    expect(await AsyncStorage.getItem("sifter_cache_x")).toBeNull();
  });
});
