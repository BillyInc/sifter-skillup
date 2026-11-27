/**
 * Policy pin: the offline-storage progress/XP queue is NOT owner-tagged and is
 * drained with whichever token is current, so a different account signing in
 * (a guest included) must not inherit it. Unlike the owner-tagged write queue
 * (OfflineQueue), which a guest takeover keeps, the previous learner's unsent
 * progress is dropped. The same account returning keeps it.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { completeSignIn } from "../src/lib/sessionLifecycle";

jest.mock("../src/lib/careerCache", () => ({ setCareerCacheIdentity: jest.fn().mockResolvedValue(undefined) }));

const PROGRESS_KEY = "ss_progress_v2";
const QUEUE_KEY = "ss_sync_queue_v2";

async function seedProgressFor(userId: string) {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify({ userId, xp: 10 }));
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([{ id: "q1", endpoint: "/api/x", method: "POST", body: {}, priority: "normal", createdAt: "", attempts: 0 }]));
}

beforeEach(async () => { await AsyncStorage.clear(); });

describe("progress queue on sign-in after continue-later", () => {
  it("a guest taking over drops the previous learner's unsent progress", async () => {
    await seedProgressFor("dave");
    await completeSignIn({ id: "guest-1", auth_provider: "guest" });
    expect(await AsyncStorage.getItem(QUEUE_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(PROGRESS_KEY)).toBeNull();
  });

  it("a different account drops it too", async () => {
    await seedProgressFor("dave");
    await completeSignIn({ id: "erin" });
    expect(await AsyncStorage.getItem(QUEUE_KEY)).toBeNull();
  });

  it("the same learner returning keeps it", async () => {
    await seedProgressFor("dave");
    await completeSignIn({ id: "dave" });
    expect(await AsyncStorage.getItem(QUEUE_KEY)).not.toBeNull();
  });
});
