/**
 * Backoff / Retry-After, 401 skip-ahead and persisted hold, expiry and
 * eviction, device-owner reconcile, and the post-clear() re-sync.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { reconcileDeviceOwner } from "../src/lib/localUserState";
import {
  OfflineQueue,
  OfflineQueueManager,
  offlineWrite,
  retryDelayMs,
  tokenFingerprint,
  BACKOFF_BASE_MS,
  BACKOFF_MAX_MS,
  FOREIGN_OWNER_MAX_AGE_MS,
  type QueueItem,
} from "../src/lib/offlineQueue";

let mockProfile: { id: string } | null = { id: "user-a" };
let mockToken: string | null = "token-a";

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
    addEventListener: jest.fn(() => () => undefined),
  },
}));
jest.mock("../src/lib/sessionProfile", () => ({
  getSavedSessionProfile: jest.fn(async () => mockProfile),
}));
jest.mock("../src/lib/deviceId", () => ({
  getOrCreateDeviceId: jest.fn(async () => "device-123"),
}));
jest.mock("../src/lib/api", () => ({
  API_BASE: "http://api.test",
  API: { getToken: jest.fn(async () => mockToken) },
}));

const netFetch = NetInfo.fetch as jest.Mock;
const fetchMock = jest.fn();
const flush = () => new Promise((r) => setTimeout(r, 0));
const pending = () => OfflineQueue.pendingCount;

function goOffline() {
  netFetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
}
function goOnline() {
  netFetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
}
async function enqueueOffline(body: unknown, priority: "normal" | "high" | "critical" = "normal") {
  goOffline();
  const result = await offlineWrite("/api/flags", "POST", body, priority);
  await flush();
  goOnline();
  return result;
}
const bodies = () => fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).n);

function stored(over: Partial<QueueItem>): QueueItem {
  return {
    id: `q_${Math.random()}`,
    priority: "normal",
    endpoint: "/api/flags",
    method: "POST",
    body: { n: 0 },
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxAttempts: 5,
    ownerId: "user-a",
    ...over,
  };
}

beforeEach(async () => {
  mockProfile = { id: "user-a" };
  mockToken = "token-a";
  fetchMock.mockReset();
  goOnline();
  (global as any).fetch = fetchMock;
  await AsyncStorage.clear();
  await OfflineQueue.clear();
});

describe("retryDelayMs", () => {
  it("backs off exponentially and caps at 15 minutes", () => {
    expect(retryDelayMs(1)).toBe(BACKOFF_BASE_MS);
    expect(retryDelayMs(2)).toBe(BACKOFF_BASE_MS * 2);
    expect(retryDelayMs(30)).toBe(BACKOFF_MAX_MS);
  });
  it("honours Retry-After seconds and HTTP-dates, capped", () => {
    expect(retryDelayMs(1, "120")).toBe(120_000);
    expect(retryDelayMs(1, "999999")).toBe(BACKOFF_MAX_MS);
    const now = Date.parse("2026-01-01T00:00:00Z");
    expect(retryDelayMs(1, "Thu, 01 Jan 2026 00:05:00 GMT", now)).toBe(300_000);
    expect(retryDelayMs(1, "Wed, 31 Dec 2025 00:00:00 GMT", now)).toBe(0);
    expect(retryDelayMs(1, "garbage")).toBe(BACKOFF_BASE_MS);
  });
});

describe("retryable statuses back off", () => {
  it.each([408, 425, 429, 503])("%s is not re-sent until nextAttemptAt, and the wait costs no attempt", async (status) => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status });
    await OfflineQueue.sync();
    await OfflineQueue.sync();
    await OfflineQueue.sync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [item] = OfflineQueue.getItems();
    expect(item.attempts).toBe(1);
    expect(Date.parse(item.nextAttemptAt!)).toBeGreaterThan(Date.now());
  });

  it("uses Retry-After and persists nextAttemptAt", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 429, headers: { get: () => "120" } });
    const before = Date.now();
    await OfflineQueue.sync();
    const [item] = OfflineQueue.getItems();
    const wait = Date.parse(item.nextAttemptAt!) - before;
    expect(wait).toBeGreaterThanOrEqual(119_000);
    expect(wait).toBeLessThanOrEqual(121_000);

    const persisted = JSON.parse((await AsyncStorage.getItem("sifter_offline_queue"))!);
    expect(persisted[0].nextAttemptAt).toBe(item.nextAttemptAt);

    const restarted = new OfflineQueueManager();
    await restarted.init();
    await flush();
    fetchMock.mockClear();
    await restarted.sync();
    expect(fetchMock).not.toHaveBeenCalled(); // still backing off after restart
    restarted.destroy();
  });

  it("sends again once the wait has passed", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429 });
    await OfflineQueue.sync();
    const realNow = Date.now;
    Date.now = () => realNow() + BACKOFF_MAX_MS + 1000;
    try {
      fetchMock.mockResolvedValue({ ok: true, status: 200 });
      await OfflineQueue.sync();
    } finally {
      Date.now = realNow;
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(pending()).toBe(0);
  });
});

describe("401 handling", () => {
  it("skips an item rejected with 401 for this token and sends the ones behind it", async () => {
    await enqueueOffline({ n: 1 });
    await enqueueOffline({ n: 2 });
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    await OfflineQueue.sync();

    expect(bodies()).toEqual([1, 2]);
    expect(pending()).toBe(1);
    // The skipped item is not re-sent with the same token.
    await OfflineQueue.sync();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // A fresh token retries it.
    mockToken = "token-a2";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await OfflineQueue.sync();
    expect(pending()).toBe(0);
  });

  it("stops after two consecutive 401s and keeps that hold across a restart", async () => {
    for (const n of [1, 2, 3, 4]) await enqueueOffline({ n });
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await OfflineQueue.sync();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const restarted = new OfflineQueueManager();
    await restarted.init();
    await flush(); // init() starts its own drain
    await restarted.sync();
    expect(fetchMock).toHaveBeenCalledTimes(2); // no extra request, no extra attempt
    expect(restarted.getItems().map((i) => i.attempts)).toEqual([1, 1, 0, 0]);

    mockToken = "token-a-fresh";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await restarted.sync();
    expect(restarted.pendingCount).toBe(0);
    restarted.destroy();
  });

  it("does not store the token itself", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await OfflineQueue.sync();
    const raw = (await AsyncStorage.getItem("sifter_offline_queue"))!;
    expect(raw).not.toContain("token-a\"");
    expect(raw).toContain(tokenFingerprint("token-a"));
  });
});

describe("foreign-owner items and the size cap", () => {
  it("expires another account's items after 30 days, keeps recent ones and the owner's", async () => {
    const old = new Date(Date.now() - FOREIGN_OWNER_MAX_AGE_MS - 60_000).toISOString();
    await AsyncStorage.setItem(
      "sifter_offline_queue",
      JSON.stringify([
        stored({ id: "old-b", ownerId: "user-b", createdAt: old }),
        stored({ id: "new-b", ownerId: "user-b" }),
        stored({ id: "old-a", ownerId: "user-a", createdAt: old }),
      ]),
    );
    const q = new OfflineQueueManager();
    await q.init();
    expect(q.getItems().map((i) => i.id).sort()).toEqual(["new-b", "old-a"]);
    q.destroy();
  });

  it("evicts the oldest item of any priority when no normal item exists at the cap", async () => {
    const base = Date.parse("2026-01-01T00:00:00Z");
    const items = Array.from({ length: 2000 }, (_, i) =>
      stored({
        id: `c${i}`,
        priority: i % 2 ? "high" : "critical",
        createdAt: new Date(base + i * 1000).toISOString(),
      }),
    );
    await AsyncStorage.setItem("sifter_offline_queue", JSON.stringify(items));
    const q = new OfflineQueueManager();
    goOffline();
    await q.init();
    const res = await q.enqueue({
      endpoint: "/api/flags", method: "POST", body: {}, priority: "critical", maxAttempts: 10,
    });
    expect(res.queued).toBe(true);
    expect(q.pendingCount).toBe(2000);
    expect(q.getItems().some((i) => i.id === "c0")).toBe(false);
    expect(q.getItems().some((i) => i.id === "c1")).toBe(true);
    q.destroy();
  });

  it("still evicts a normal item first when one exists", async () => {
    const items = [
      ...Array.from({ length: 1999 }, (_, i) => stored({ id: `h${i}`, priority: "high" })),
      stored({ id: "n0", priority: "normal" }),
    ];
    await AsyncStorage.setItem("sifter_offline_queue", JSON.stringify(items));
    const q = new OfflineQueueManager();
    goOffline();
    await q.init();
    await q.enqueue({ endpoint: "/x", method: "POST", body: {}, priority: "high", maxAttempts: 10 });
    expect(q.getItems().some((i) => i.id === "n0")).toBe(false);
    expect(q.getItems().some((i) => i.id === "h0")).toBe(true);
    q.destroy();
  });
});

describe("reconcileDeviceOwner with a different account", () => {
  it("clears learner device data and the previous owner's queued items", async () => {
    await enqueueOffline({ n: 1 }); // user-a
    await AsyncStorage.setItem("@levelup_device_owner_v1", "user-a");
    for (const k of ["@sifter_xp_v1", "@sifter_streak_v1", "sifter_notes_v1", "sifter_diary_index", "sifter_bookmarks", "@sifter_notifications_v1", "sifter_diary_u1_x"]) {
      await AsyncStorage.setItem(k, "x");
    }
    await AsyncStorage.setItem("@sifter_theme_mode_v3", "dark");

    await reconcileDeviceOwner("user-b");

    expect(pending()).toBe(0);
    expect(await AsyncStorage.getItem("sifter_offline_queue")).toBe("[]");
    for (const k of ["@sifter_xp_v1", "@sifter_streak_v1", "sifter_notes_v1", "sifter_diary_index", "sifter_bookmarks", "@sifter_notifications_v1", "sifter_diary_u1_x"]) {
      expect(await AsyncStorage.getItem(k)).toBeNull();
    }
    expect(await AsyncStorage.getItem("@sifter_theme_mode_v3")).toBe("dark");
    expect(await AsyncStorage.getItem("@levelup_device_owner_v1")).toBe("user-b");
  });

  it("keeps everything when the same account returns", async () => {
    await enqueueOffline({ n: 1 });
    await AsyncStorage.setItem("@levelup_device_owner_v1", "user-a");
    await AsyncStorage.setItem("@sifter_xp_v1", "x");
    await reconcileDeviceOwner("user-a");
    expect(pending()).toBe(1);
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBe("x");
  });

  it("leaves learner data alone when the previous owner is unknown", async () => {
    mockProfile = null; // no owner key and no saved profile
    await AsyncStorage.setItem("@sifter_xp_v1", "x");
    await reconcileDeviceOwner("user-b");
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBe("x");
  });
});

describe("clear() during a drain", () => {
  it("syncs the next user's first write once the stale drain ends", async () => {
    await enqueueOffline({ n: 1 });
    let release!: (v: unknown) => void;
    fetchMock.mockImplementationOnce(() => new Promise((r) => { release = r; }));
    const stale = OfflineQueue.sync();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await OfflineQueue.clear(); // sign-out mid-request
    mockProfile = { id: "user-b" };
    mockToken = "token-b";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await offlineWrite("/api/flags", "POST", { n: 2 }); // skipped: still "syncing"
    expect(fetchMock).toHaveBeenCalledTimes(1);

    release({ ok: true, status: 200 });
    await stale;
    await flush();
    await flush();

    expect(bodies()).toEqual([1, 2]);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer token-b");
    expect(pending()).toBe(0);
  });
});

describe("403 with a zero or past Retry-After", () => {
  it.each([
    ["Retry-After: 0", () => "0"],
    ["a past HTTP date", () => new Date(Date.now() - 3_600_000).toUTCString()],
  ])("sends exactly once per pass and backs off by at least the base delay (%s)", async (_label, header) => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 403, headers: { get: () => header() } });
    const before = Date.now();
    await OfflineQueue.sync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [item] = OfflineQueue.getItems();
    expect(Date.parse(item.nextAttemptAt!) - before).toBeGreaterThanOrEqual(BACKOFF_BASE_MS - 1000);

    fetchMock.mockClear();
    await OfflineQueue.sync(); // still backing off: nothing is sent
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
