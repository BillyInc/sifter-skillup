/**
 * Review round 3: single in-flight drain, clock skew, request timeout, poison
 * items, status handling, and two tabs sharing one queue.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import {
  OfflineQueue,
  OfflineQueueManager,
  BACKOFF_MAX_MS,
  NETWORK_FAILURE_CAP,
  REQUEST_TIMEOUT_MS,
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

const QUEUE_KEY = "sifter_offline_queue";
const netFetch = NetInfo.fetch as jest.Mock;
const fetchMock = jest.fn();
const flush = () => new Promise((r) => setTimeout(r, 0));
const goOffline = () => netFetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
const goOnline = () => netFetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
const OK = { ok: true, status: 200 };

async function enqueueOffline(q: OfflineQueueManager, body: unknown, extra: Partial<QueueItem> = {}) {
  goOffline();
  const r = await q.enqueue({ endpoint: "/api/flags", method: "POST", body, priority: "normal", maxAttempts: 5, ...extra });
  await flush();
  goOnline();
  return r;
}
const storedQueue = async (): Promise<QueueItem[]> => JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) ?? "[]");
const sentBodies = () => fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).n);

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

/** Gives the queue a browser-like localStorage (it is absent in the RN jest env). */
function installWebStorage() {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  return store;
}

const managers: OfflineQueueManager[] = [];
const make = () => { const q = new OfflineQueueManager(); managers.push(q); return q; };

beforeEach(async () => {
  mockProfile = { id: "user-a" };
  mockToken = "token-a";
  fetchMock.mockReset();
  goOnline();
  (global as any).fetch = fetchMock;
  await AsyncStorage.clear();
  await OfflineQueue.clear();
});
afterEach(() => {
  while (managers.length) managers.pop()!.destroy();
  jest.useRealTimers();
  delete (global.navigator as any).locks;
  delete (globalThis as any).localStorage;
});

describe("1. one in-flight drain", () => {
  it("one queued write plus two concurrent sync() calls sends it once", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    const gate = deferred<typeof OK>();
    fetchMock.mockImplementation(() => gate.promise);

    const a = q.sync();
    const b = q.sync();
    await flush();
    gate.resolve(OK);
    await Promise.all([a, b]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(q.pendingCount).toBe(0);
  });

  it("flags the drain as in progress synchronously, before the first await", () => {
    const q = make();
    expect(q.isSyncing).toBe(false);
    void q.sync();
    expect(q.isSyncing).toBe(true);
  });

  it("enqueue, init and NetInfo triggers racing a sync() still send each write once", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    const gate = deferred<typeof OK>();
    fetchMock.mockImplementation(() => gate.promise);
    const drains = [q.sync(), q.init(), q.sync()];
    await flush();
    gate.resolve(OK);
    await Promise.all(drains);
    expect(sentBodies()).toEqual([1]);
  });

  it("a write enqueued while a drain runs is sent by that drain's follow-up, once", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    const gate = deferred<typeof OK>();
    fetchMock.mockImplementationOnce(() => gate.promise).mockResolvedValue(OK);
    const first = q.sync();
    await flush();
    await q.enqueue({ endpoint: "/api/flags", method: "POST", body: { n: 2 }, priority: "normal", maxAttempts: 5 });
    gate.resolve(OK);
    await first;
    await flush();
    expect(sentBodies().sort()).toEqual([1, 2]);
    expect(q.pendingCount).toBe(0);
  });

  it("does not send an item that is in flight again after a late trigger", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    const gate = deferred<typeof OK>();
    fetchMock.mockImplementation(() => gate.promise);
    const first = q.sync();
    await flush();
    void q.sync();
    void q.sync();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    gate.resolve(OK);
    await first;
  });
});

describe("4. a wrong clock cannot park the queue", () => {
  it("ignores a nextAttemptAt years in the future once the clock is corrected", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    const real = Date.now;
    const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
    try {
      Date.now = () => real() + fiveYears; // fast clock
      fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
      await q.sync();
      expect(q.getItems()[0].nextAttemptAt).toBeDefined();
      expect(Date.parse(q.getItems()[0].nextAttemptAt!)).toBeGreaterThan(real() + BACKOFF_MAX_MS);
    } finally {
      Date.now = real; // clock corrected
    }
    fetchMock.mockResolvedValue(OK);
    await q.sync();
    expect(q.pendingCount).toBe(0);
    expect(sentBodies()).toEqual([1, 1]);
  });

  it("still honours a normal backoff", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    await q.sync();
    fetchMock.mockResolvedValue(OK);
    await q.sync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(q.pendingCount).toBe(1);
  });
});

describe("10. request timeout, poison items and statuses", () => {
  it("aborts a request that never answers and frees the drain", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    jest.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_res, rej) => init.signal.addEventListener("abort", () => rej(new Error("aborted")))),
    );
    const drain = q.sync();
    await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 10);
    await drain;
    expect(q.isSyncing).toBe(false);
    expect(q.pendingCount).toBe(1);
    expect(q.getItems()[0].networkFailures).toBe(1);
  });

  it("refuses a body that cannot be serialised instead of poisoning every later save", async () => {
    const q = make();
    const circular: any = {};
    circular.self = circular;
    const result = await enqueueOffline(q, circular);
    expect(result).toEqual({ queued: false, reason: "invalid_body" });
    await enqueueOffline(q, { n: 2 });
    expect(q.pendingCount).toBe(1);
    expect((await storedQueue()).length).toBe(1);
  });

  it("drops a head item whose body turns out not to serialise and sends the writes behind it", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    await enqueueOffline(q, { n: 2 });
    const circular: any = {};
    circular.self = circular;
    (q as any).queue[0].body = circular; // corrupted after it was accepted
    fetchMock.mockResolvedValue(OK);
    await q.sync();
    expect(sentBodies()).toEqual([2]);
    expect(q.pendingCount).toBe(0);
  });

  it("counts network failures apart from attempts and drops after the cap", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    fetchMock.mockRejectedValue(new Error("Network request failed"));
    await q.sync();
    let item = q.getItems()[0];
    expect(item.attempts).toBe(0);
    expect(item.networkFailures).toBe(1);
    expect(item.nextAttemptAt).toBeDefined();

    // Next failure is the one that reaches the cap.
    (q as any).queue[0].networkFailures = NETWORK_FAILURE_CAP - 1;
    const realNow = Date.now;
    Date.now = () => realNow() + BACKOFF_MAX_MS; // the backoff has expired
    try {
      await q.sync();
    } finally {
      Date.now = realNow;
    }
    expect(q.pendingCount).toBe(0);
    item = undefined as any;
  });

  it("treats an opted-in 404 as retryable up to maxAttempts instead of dropping at once", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 }, { retryNotFound: true });
    fetchMock.mockResolvedValue({ ok: false, status: 404 });
    await q.sync();
    expect(q.pendingCount).toBe(1);
    expect(q.getItems()[0].attempts).toBe(1);

    (q as any).queue[0].attempts = 4;
    const realNow = Date.now;
    Date.now = () => realNow() + BACKOFF_MAX_MS; // the backoff has expired
    try {
      await q.sync();
    } finally {
      Date.now = realNow;
    }
    expect(q.pendingCount).toBe(0); // 5th attempt reaches maxAttempts
  });

  it("still drops 405, 410, 413 and 422 at once", async () => {
    for (const status of [405, 410, 413, 422]) {
      const q = make();
      await AsyncStorage.clear();
      await q.clear();
      await enqueueOffline(q, { n: status });
      fetchMock.mockReset();
      fetchMock.mockResolvedValue({ ok: false, status });
      await q.sync();
      expect(q.pendingCount).toBe(0);
    }
  });

  it("retries a 409 once, then settles it so it cannot block the queue", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    await enqueueOffline(q, { n: 2 });
    fetchMock.mockImplementation(async (_u: string, init: { body: string }) =>
      JSON.parse(init.body).n === 1 ? { ok: false, status: 409 } : OK,
    );
    await q.sync();
    expect(sentBodies()).toEqual([1, 1, 2]);
    expect(q.pendingCount).toBe(0);
  });

  it("a 409 that succeeds on the retry is simply sent", async () => {
    const q = make();
    await enqueueOffline(q, { n: 1 });
    fetchMock.mockResolvedValueOnce({ ok: false, status: 409 }).mockResolvedValue(OK);
    await q.sync();
    expect(sentBodies()).toEqual([1, 1]);
    expect(q.pendingCount).toBe(0);
  });
});

describe("5. two tabs sharing one queue", () => {
  it("does not overwrite the other tab's items when saving", async () => {
    const tabA = make();
    const tabB = make();
    await tabA.init();
    await tabB.init();
    await enqueueOffline(tabA, { n: 1 });
    await enqueueOffline(tabB, { n: 2 });
    const bodies = (await storedQueue()).map((i) => i.body.n).sort();
    expect(bodies).toEqual([1, 2]);
    expect(tabB.pendingCount).toBe(2); // adopted A's item on save
  });

  it("does not resurrect an item the other tab already sent", async () => {
    installWebStorage();
    const tabA = make();
    const tabB = make();
    await tabA.init();
    await tabB.init();
    await enqueueOffline(tabA, { n: 1 });
    fetchMock.mockResolvedValue(OK);
    await tabB.sync(); // B merges A's item from storage and sends it
    expect(await storedQueue()).toEqual([]);

    // A still holds item 1 in memory; its next save must not bring it back.
    await enqueueOffline(tabA, { n: 3 });
    expect((await storedQueue()).map((i) => i.body.n)).toEqual([3]);
  });

  it("with Web Locks only one tab drains; the same write is not sent twice", async () => {
    const held = new Set<string>();
    (global.navigator as any).locks = {
      request: async (name: string, opts: any, cb?: any) => {
        const fn = cb ?? opts;
        const options = cb ? opts : {};
        if (options.ifAvailable && held.has(name)) return fn(null);
        while (held.has(name)) await flush();
        held.add(name);
        try { return await fn({ name }); } finally { held.delete(name); }
      },
    };
    const tabA = make();
    const tabB = make();
    await tabA.init();
    await enqueueOffline(tabA, { n: 1 });
    await tabB.init(); // B loads item 1 from storage: both tabs hold it
    fetchMock.mockReset();
    const gate = deferred<typeof OK>();
    fetchMock.mockImplementation(() => gate.promise);
    const aDrain = tabA.sync();
    await flush();
    const bDrain = tabB.sync();
    await flush();
    gate.resolve(OK);
    await Promise.all([aDrain, bDrain]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("without Web Locks a lease in localStorage keeps a second tab from draining", async () => {
    const store = installWebStorage();
    const tab = make();
    await enqueueOffline(tab, { n: 1 });
    fetchMock.mockResolvedValue(OK);

    // Another tab holds a live lease.
    store.set("sifter_offline_queue_lease", JSON.stringify({ owner: "other-tab", until: Date.now() + 30_000 }));
    await tab.sync();
    expect(fetchMock).not.toHaveBeenCalled();

    // Its lease expired (the tab closed): this tab takes over and releases it.
    store.set("sifter_offline_queue_lease", JSON.stringify({ owner: "other-tab", until: Date.now() - 1 }));
    await tab.sync();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(store.has("sifter_offline_queue_lease")).toBe(false);
  });
});
