/**
 * The offline write queue must never send one account's writes with another
 * account's token, must survive an app restart, must keep writes when the
 * session has expired (but not forever), must not let one rejected write block
 * the ones behind it, and must be emptied on sign-out / deletion.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { clearAllDeviceUserData } from "../src/lib/localUserState";
import {
  OfflineQueue,
  OfflineQueueManager,
  offlineWrite,
  clearOfflineData,
  tokenSubject,
  AUTH_HOLD_MAX_AGE_MS,
  BACKOFF_MAX_MS,
  FORBIDDEN_MAX_AGE_MS,
  NEVER_RETRY_REFUSAL_PREFIXES,
} from "../src/lib/offlineQueue";
import {
  saveAdminProvisioningDrafts,
  getAdminProvisioningDrafts,
  saveAdminResume,
  getAdminResume,
} from "../src/lib/adminResume";

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
const jwt = (sub: string) => `h.${btoa(JSON.stringify({ sub }))}.s`;

function goOffline() {
  netFetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
}
function goOnline() {
  netFetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
}

/** Queue a write without draining it. */
async function enqueueOffline(
  body: unknown,
  priority: "normal" | "high" | "critical" = "normal",
  options: { retryForbidden?: boolean; retryNotFound?: boolean } = {},
  endpoint = "/api/flags",
) {
  goOffline();
  const result = await offlineWrite(endpoint, "POST", body, priority, options);
  await flush();
  goOnline();
  return result;
}

async function drain() {
  await OfflineQueue.sync();
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

describe("offline queue ownership", () => {
  it("does not drain user A's writes with user B's token", async () => {
    await enqueueOffline({ n: 1 });
    expect(pending()).toBe(1);

    mockProfile = { id: "user-b" };
    mockToken = "token-b";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(pending()).toBe(1);
  });

  it("does not send A's writes while the token still belongs to another account", async () => {
    await enqueueOffline({ n: 1 });
    mockToken = jwt("user-b"); // profile is still user-a
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();
    expect(fetchMock).not.toHaveBeenCalled();

    mockToken = jwt("user-a");
    await drain();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(pending()).toBe(0);
  });

  it("drains the owner's writes with the owner's token and the device id", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer token-a");
    expect(headers["X-Device-Id"]).toBe("device-123");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(pending()).toBe(0);
  });

  it("keeps user A's queued writes across a same-user sign-out and sign-in", async () => {
    await enqueueOffline({ n: 1 });
    mockProfile = null;
    mockToken = null;
    await drain();
    expect(pending()).toBe(1);

    mockProfile = { id: "user-a" };
    mockToken = "token-a2";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-a2");
    expect(pending()).toBe(0);
  });
});

describe("enqueue result", () => {
  it("reports success with the queued id", async () => {
    const result = await enqueueOffline({ n: 1 });
    expect(result).toEqual({ queued: true, id: expect.any(String) });
  });

  it("reports failure instead of silently dropping when no profile is loaded", async () => {
    mockProfile = null;
    const result = await enqueueOffline({ n: 1 });
    expect(result).toEqual({ queued: false, reason: "no_profile" });
    expect(pending()).toBe(0);
  });
});

describe("restart and hydration", () => {
  it("a new instance keeps the previous session's items after init", async () => {
    await enqueueOffline({ n: 1 });
    const restarted = new OfflineQueueManager();
    await restarted.init();
    expect(restarted.getItems().map((i) => i.body)).toEqual([{ n: 1 }]);
    restarted.destroy();
  });

  it("the first enqueue after a restart does not overwrite the persisted queue", async () => {
    await enqueueOffline({ n: 1 });
    const restarted = new OfflineQueueManager(); // no init() call
    goOffline();
    await restarted.enqueue({ endpoint: "/api/flags", method: "POST", body: { n: 2 }, priority: "normal", maxAttempts: 5 });
    expect(restarted.getItems().map((i) => i.body)).toEqual([{ n: 1 }, { n: 2 }]);
    const stored = JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) as string);
    expect(stored).toHaveLength(2);
  });

  it("init is idempotent: one network watcher", async () => {
    const q = new OfflineQueueManager();
    (NetInfo.addEventListener as jest.Mock).mockClear();
    await q.init();
    await q.init();
    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
    q.destroy();
  });

  it("ignores stored entries that have no owner", async () => {
    await AsyncStorage.setItem(
      "sifter_offline_queue",
      JSON.stringify([{ id: "old", endpoint: "/x", method: "POST", body: {}, priority: "normal", attempts: 0, maxAttempts: 5 }]),
    );
    const q = new OfflineQueueManager();
    await q.init();
    expect(q.pendingCount).toBe(0);
    q.destroy();
  });
});

describe("offline queue error handling", () => {
  it("holds a 401 item for the next sign-in and does not retry the same token", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await drain();
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(1); // same token is not retried
    expect(pending()).toBe(1);

    mockToken = "token-a-fresh";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();
    expect(pending()).toBe(0);
  });

  it("eventually drops a write that keeps getting 401", async () => {
    await enqueueOffline({ n: 1 }); // normal => maxAttempts 5
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    for (let i = 0; i < 5; i++) {
      mockToken = `token-${i}`;
      await drain();
    }
    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(pending()).toBe(0);
  });

  it("drops a 401-held write after the maximum age", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await drain();
    expect(pending()).toBe(1);

    const realNow = Date.now;
    Date.now = () => realNow() + AUTH_HOLD_MAX_AGE_MS + 1000;
    try {
      mockToken = "token-next";
      await drain();
    } finally {
      Date.now = realNow;
    }
    expect(pending()).toBe(0);
  });

  it("retries an opted-in 403 (consent guards answer it temporarily) with backoff instead of dropping it", async () => {
    await enqueueOffline({ n: 1 }, "normal", { retryForbidden: true });
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 });
    await drain();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(pending()).toBe(1);
    const [item] = JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]");
    expect(item.forbiddenAttempts).toBe(1);
    expect(item.nextAttemptAt).toBeDefined();

    // Consent granted later: the same write goes through.
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    const realNow = Date.now;
    Date.now = () => realNow() + BACKOFF_MAX_MS;
    try {
      await drain();
    } finally {
      Date.now = realNow;
    }
    expect(pending()).toBe(0);
  });

  /** Run `drain` with the clock moved `ms` past real time. */
  async function drainAt(ms: number) {
    const realNow = Date.now;
    Date.now = () => realNow() + ms;
    try {
      await drain();
    } finally {
      Date.now = realNow;
    }
  }

  it("keeps retrying a 403 well past five attempts, until the write is a day old (normal)", async () => {
    await enqueueOffline({ n: 1 }, "normal", { retryForbidden: true });
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    // Every 16 minutes for 23 hours: far more than the old five attempts.
    for (let t = 0; t <= 23 * 60; t += 16) await drainAt(t * 60 * 1000);
    expect(fetchMock.mock.calls.length).toBeGreaterThan(20);
    expect(pending()).toBe(1);
    const [item] = JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]");
    expect(item.attempts).toBe(0); // a 403 does not use the attempt cap

    await drainAt(FORBIDDEN_MAX_AGE_MS.normal + 60 * 1000);
    expect(pending()).toBe(0);
  });

  it("a high-priority 403 outlives the normal horizon and is dropped after seven days", async () => {
    await enqueueOffline({ n: 1 }, "high", { retryForbidden: true });
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    await drainAt(0);
    await drainAt(3 * 24 * 60 * 60 * 1000);
    expect(pending()).toBe(1);
    await drainAt(FORBIDDEN_MAX_AGE_MS.high + 60 * 1000);
    expect(pending()).toBe(0);
  });

  it("a backed-off 403 does not block a later write to another endpoint, but keeps order for its own", async () => {
    goOffline();
    await offlineWrite("/api/consent-gated", "POST", { n: 1 }, "normal", { retryForbidden: true });
    await offlineWrite("/api/consent-gated", "POST", { n: 2 }, "normal", { retryForbidden: true });
    await offlineWrite("/api/other", "POST", { n: 3 });
    await flush();
    goOnline();
    fetchMock.mockImplementation(async (url: string) =>
      String(url).endsWith("/api/consent-gated") ? { ok: false, status: 403 } : { ok: true, status: 200 },
    );
    await drain();
    // The gated head 403'd once, then /api/other went through; the second
    // gated write was not sent ahead of the first.
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.filter((u) => u.endsWith("/api/consent-gated"))).toHaveLength(1);
    expect(urls.filter((u) => u.endsWith("/api/other"))).toHaveLength(1);
    expect(pending()).toBe(2);
  });

  describe("403/404 are permanent refusals unless a write opts in", () => {
    it("drops a DM send 403 on the first drain: one fetch, queue empty, later items to other endpoints still go", async () => {
      goOffline();
      await offlineWrite("/api/dms/send", "POST", { n: 1 }, "high");
      await offlineWrite("/api/other", "POST", { n: 2 });
      await flush();
      goOnline();
      fetchMock.mockImplementation(async (url: string) =>
        String(url).endsWith("/api/dms/send") ? { ok: false, status: 403 } : { ok: true, status: 200 },
      );
      await drain();
      const urls = fetchMock.mock.calls.map((c) => String(c[0]));
      expect(urls.filter((u) => u.endsWith("/api/dms/send"))).toHaveLength(1);
      expect(urls.filter((u) => u.endsWith("/api/other"))).toHaveLength(1);
      expect(pending()).toBe(0);
      fetchMock.mockClear();
      await drainAt(FORBIDDEN_MAX_AGE_MS.high);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("drops a 404 on follow at once", async () => {
      await enqueueOffline({ n: 1 }, "normal", {}, "/api/users/follow");
      fetchMock.mockResolvedValue({ ok: false, status: 404 });
      await drain();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(pending()).toBe(0);
    });

    it("drops a default (not opted in) 403 and 404 on an ordinary endpoint", async () => {
      for (const status of [403, 404]) {
        await enqueueOffline({ n: status });
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({ ok: false, status });
        await drain();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(pending()).toBe(0);
      }
    });

    it("retries an opted-in 404 with backoff", async () => {
      await enqueueOffline({ n: 1 }, "normal", { retryNotFound: true });
      fetchMock.mockResolvedValue({ ok: false, status: 404 });
      await drain();
      expect(pending()).toBe(1);
      expect(OfflineQueue.getItems()[0].attempts).toBe(1);
      expect(OfflineQueue.getItems()[0].nextAttemptAt).toBeDefined();
    });

    it.each(NEVER_RETRY_REFUSAL_PREFIXES.map((p) => [p === "/api/dms/" ? "/api/dms/send" : p === "/api/users/follow" ? "/api/users/follow-request/respond" : p]))(
      "the denylist wins over the opt-in: %s",
      async (endpoint) => {
        for (const status of [403, 404]) {
          await enqueueOffline({ n: status }, "high", { retryForbidden: true, retryNotFound: true }, endpoint);
          fetchMock.mockReset();
          fetchMock.mockResolvedValue({ ok: false, status });
          await drain();
          expect(fetchMock).toHaveBeenCalledTimes(1);
          expect(pending()).toBe(0);
        }
      },
    );

    it("ignores a query string when matching the denylist", async () => {
      await enqueueOffline({ n: 1 }, "normal", { retryForbidden: true }, "/api/dms/send?x=1");
      fetchMock.mockResolvedValue({ ok: false, status: 403 });
      await drain();
      expect(pending()).toBe(0);
    });

    it("keeps backing off 401 / 429 / 5xx regardless of the opt-in", async () => {
      for (const status of [429, 500, 503]) {
        await enqueueOffline({ n: status });
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({ ok: false, status });
        await drain();
        expect(pending()).toBe(1);
        expect(OfflineQueue.getItems()[0].nextAttemptAt).toBeDefined();
        await OfflineQueue.clear();
        await AsyncStorage.clear();
      }
    });
  });

  it("honours an explicit maxAttempts passed to enqueue", async () => {
    goOffline();
    const q = OfflineQueue;
    expect((await q.enqueue({ endpoint: "/api/flags", method: "POST", body: {}, priority: "normal", maxAttempts: 2 })).queued).toBe(true);
    await flush();
    goOnline();
    expect(JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]")[0].maxAttempts).toBe(2);
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    await drainAt(0);
    await drainAt(BACKOFF_MAX_MS * 2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(pending()).toBe(0);
  });

  it("a permanent 4xx does not block later items", async () => {
    await enqueueOffline({ n: 1 });
    await enqueueOffline({ n: 2 });
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 422 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    await drain();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(pending()).toBe(0);
  });

  it("counts a server error against maxAttempts and backs off", async () => {
    await enqueueOffline({ n: 1 });
    await enqueueOffline({ n: 2 });
    fetchMock.mockResolvedValue({ ok: false, status: 503 });
    await drain();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(OfflineQueue.getItems()[0].attempts).toBe(1);
    expect(pending()).toBe(2);
  });

  it("treats 429 as retryable, not permanent", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 429 });
    await drain();
    expect(pending()).toBe(1);
  });
});

describe("clear() racing with an in-flight enqueue", () => {
  it("does not re-persist an item after the user signed out", async () => {
    goOffline();
    let release!: () => void;
    const gate = new Promise<void>((r) => { release = r; });
    const sessionProfile = jest.requireMock("../src/lib/sessionProfile");
    sessionProfile.getSavedSessionProfile.mockImplementationOnce(async () => {
      await gate;
      return { id: "user-a" };
    });

    const inFlight = offlineWrite("/api/flags", "POST", { n: 1 });
    await flush();
    await OfflineQueue.clear(); // sign-out while enqueue is resolving the owner
    release();
    const result = await inFlight;
    await flush();

    expect(result.queued).toBe(false);
    expect(pending()).toBe(0);
    expect(await AsyncStorage.getItem("sifter_offline_queue")).toBeNull();
  });
});

describe("tokenSubject", () => {
  it("reads the sub claim and tolerates malformed tokens", () => {
    expect(tokenSubject(jwt("abc"))).toBe("abc");
    expect(tokenSubject("not-a-jwt")).toBeNull();
    expect(tokenSubject("a.b.c")).toBeNull();
  });
});

describe("sign-out clearing", () => {
  it("removes the queue, read cache and admin drafts/resume", async () => {
    await enqueueOffline({ n: 1 });
    await AsyncStorage.setItem("sifter_cache_programmes", "{}");
    await saveAdminProvisioningDrafts([{ id: "local-draft-1" } as any], "user-a");
    await saveAdminResume({ href: "/(admin)/home", label: "Home" } as any, "user-a");
    expect(await getAdminProvisioningDrafts("user-a")).toHaveLength(1);

    await clearAllDeviceUserData("user-a");

    expect(pending()).toBe(0);
    expect(await AsyncStorage.getItem("sifter_offline_queue")).toBeNull();
    expect(await AsyncStorage.getItem("sifter_cache_programmes")).toBeNull();
    expect(await getAdminProvisioningDrafts("user-a")).toEqual([]);
    expect(await getAdminResume("user-a")).toBeNull();
  });

  it("clearOfflineData leaves unrelated keys alone", async () => {
    await AsyncStorage.setItem("unrelated", "1");
    await clearOfflineData();
    expect(await AsyncStorage.getItem("unrelated")).toBe("1");
  });
});

describe("owner id comparison", () => {
  it("dropForeign and dropOwner treat a numeric stored ownerId like its string form", async () => {
    await AsyncStorage.setItem(
      "sifter_offline_queue",
      JSON.stringify([
        { id: "a", ownerId: 7, endpoint: "/x", method: "POST", body: {}, priority: "normal", attempts: 0, maxAttempts: 5, createdAt: new Date().toISOString() },
        { id: "b", ownerId: "8", endpoint: "/x", method: "POST", body: {}, priority: "normal", attempts: 0, maxAttempts: 5, createdAt: new Date().toISOString() },
      ]),
    );
    const q = new OfflineQueueManager();
    goOffline();
    await q.init();
    await q.dropForeign("7");
    expect(q.getItems().map((i) => i.id)).toEqual(["a"]);
    await q.dropOwner("7");
    expect(q.pendingCount).toBe(0);
    q.destroy();
  });
});
