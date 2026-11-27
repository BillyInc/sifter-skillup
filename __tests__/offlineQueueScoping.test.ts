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
async function enqueueOffline(body: unknown, priority: "normal" | "high" | "critical" = "normal") {
  goOffline();
  const result = await offlineWrite("/api/flags", "POST", body, priority);
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

  it("retries a 403 (consent guards answer it temporarily) with backoff instead of dropping it", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValueOnce({ ok: false, status: 403 });
    await drain();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(pending()).toBe(1);
    const [item] = JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]");
    expect(item.attempts).toBe(1);
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

  it("gives up on a 403 that never clears once maxAttempts is reached", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 403 });
    const realNow = Date.now;
    try {
      for (let i = 0; i < 10 && pending() > 0; i++) {
        Date.now = () => realNow() + (i + 1) * BACKOFF_MAX_MS * 2;
        await drain();
      }
    } finally {
      Date.now = realNow;
    }
    expect(pending()).toBe(0);
    expect(fetchMock.mock.calls.length).toBe(5); // maxAttempts of the item
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
