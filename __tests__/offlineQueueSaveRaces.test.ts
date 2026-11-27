/**
 * Review round 4: a save that is still writing must not corrupt the
 * persisted/removed bookkeeping (slow setItem interleavings), copies of one
 * write merge per field, storage failures are reported, the queue wakes itself
 * after a backoff and on foreground, and a failed drain pass is not an
 * unhandled rejection.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { AppState } from "react-native";

import { OfflineQueue, OfflineQueueManager, type QueueItem } from "../src/lib/offlineQueue";

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
const flush = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const goOffline = () => netFetch.mockResolvedValue({ isConnected: false, isInternetReachable: false });
const goOnline = () => netFetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
const OK = { ok: true, status: 200 };
const storedQueue = async (): Promise<QueueItem[]> => JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) ?? "[]");
const storedBodies = async () => (await storedQueue()).map((i) => i.body.n).sort();
const memBodies = (q: OfflineQueueManager) => q.getItems().map((i) => i.body.n).sort();
const sentBodies = () => fetchMock.mock.calls.map((c) => JSON.parse(c[1].body).n);
const write = (q: OfflineQueueManager, n: number) =>
  q.enqueue({ endpoint: "/api/flags", method: "POST", body: { n }, priority: "normal", maxAttempts: 5 });

function deferred<T = void>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

const restores: (() => void)[] = [];
/** Replaces AsyncStorage.setItem for this test (restored in afterEach). */
function patchSetItem(impl: (orig: typeof AsyncStorage.setItem, k: string, v: string) => Promise<void>) {
  const orig = AsyncStorage.setItem;
  (AsyncStorage as any).setItem = (k: string, v: string) => impl(orig.bind(AsyncStorage), k, v);
  restores.push(() => { (AsyncStorage as any).setItem = orig; });
}

/** Makes the next write of the queue key wait until `gate` is released. */
function slowNextQueueWrite(gate: Promise<void>) {
  let slowed = false;
  patchSetItem(async (orig, k, v) => {
    if (k === QUEUE_KEY && !slowed) {
      slowed = true;
      await gate;
    }
    return orig(k, v);
  });
}

const managers: OfflineQueueManager[] = [];
const make = () => { const q = new OfflineQueueManager(); managers.push(q); return q; };

const spies: jest.SpyInstance[] = [];
const spy = <T extends jest.SpyInstance>(s: T): T => { spies.push(s); return s; };

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
  while (spies.length) spies.pop()!.mockRestore();
  while (restores.length) restores.pop()!();
  while (managers.length) managers.pop()!.destroy();
});

describe("save in flight (slow setItem)", () => {
  it("an item enqueued while a save is writing is not dropped by the next save", async () => {
    goOffline();
    const q = make();
    await write(q, 1);
    const gate = deferred();
    slowNextQueueWrite(gate.promise);

    const p2 = write(q, 2); // save#1 snapshot [1, 2] blocks in setItem
    await flush(5);
    const p3 = write(q, 3); // pushed while save#1 is mid-write
    await flush(5);
    gate.resolve();
    const [r2, r3] = await Promise.all([p2, p3]);

    expect(r2.queued).toBe(true);
    expect(r3.queued).toBe(true);
    expect(memBodies(q)).toEqual([1, 2, 3]);
    expect(await storedBodies()).toEqual([1, 2, 3]);
  });

  it("a drain that merges from storage while a save is pending keeps the unsaved item", async () => {
    goOffline();
    const q = make();
    await write(q, 1);
    const gate = deferred();
    slowNextQueueWrite(gate.promise);

    const p2 = write(q, 2); // unsaved until the gate opens
    await flush(5);
    goOnline();
    fetchMock.mockResolvedValue(OK);
    const drain = q.sync(); // merges from storage (which has only item 1)
    await flush(5);
    gate.resolve();
    await Promise.all([p2, drain]);

    expect(sentBodies().sort()).toEqual([1, 2]); // item 2 was sent, not forgotten
    expect(q.pendingCount).toBe(0);
    expect(await storedBodies()).toEqual([]);
  });

  it("an item removed while a save holding it is writing is not re-merged and sent twice", async () => {
    goOffline();
    const q = make();
    await write(q, 1); // X, persisted
    goOnline();
    fetchMock.mockResolvedValue(OK);
    const gate = deferred();
    slowNextQueueWrite(gate.promise);

    const p2 = write(q, 2); // save#1 snapshot [X, 2] blocks
    await flush(5);
    const drain = q.sync(); // sends X (200) and removes it while save#1 is writing
    await flush(5);
    gate.resolve();
    await Promise.all([p2, drain]);
    await q.sync();

    expect(sentBodies().filter((n) => n === 1)).toHaveLength(1);
    expect(sentBodies().filter((n) => n === 2)).toHaveLength(1);
    expect(q.pendingCount).toBe(0);
    expect(await storedBodies()).toEqual([]);
  });
});

describe("storage failure", () => {
  it("enqueue reports storage_failed (and keeps nothing in memory) when the write is rejected", async () => {
    goOffline();
    const q = make();
    patchSetItem(async () => { throw new Error("QuotaExceededError"); });
    const result = await write(q, 1);
    expect(result).toEqual({ queued: false, reason: "storage_failed" });
    expect(q.pendingCount).toBe(0);
  });
});

describe("per-field merge of two copies of one write", () => {
  it("a stale copy with equal attempts cannot reset flags, counters or the wait", async () => {
    goOffline();
    const q = make();
    const r = await write(q, 1);
    const id = (r as { id: string }).id;
    const later = new Date(Date.now() + 120_000).toISOString();
    // Another tab recorded these on the stored copy.
    const stored = await storedQueue();
    stored[0] = { ...stored[0], attempts: 2, conflictRetried: true, networkFailures: 4, nextAttemptAt: later, authFailedFor: "fp" };
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(stored));
    // This tab has an older copy with the same attempt count.
    const mem = (q as any).queue[0] as QueueItem;
    mem.attempts = 2;
    mem.networkFailures = 1;
    (q as any).persistedIds = new Set([id]);

    await (q as any)._mergeFromStorage();
    const merged = q.getItems()[0];
    expect(merged.attempts).toBe(2);
    expect(merged.conflictRetried).toBe(true);
    expect(merged.networkFailures).toBe(4);
    expect(merged.nextAttemptAt).toBe(later);
    expect(merged.authFailedFor).toBe("fp");
  });
});

describe("wake-ups", () => {
  it("retries a backed-off write by itself when the wait expires, with one timer", async () => {
    const q = make();
    goOffline();
    await write(q, 1);
    goOnline();
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    await q.sync();
    expect(q.pendingCount).toBe(1);
    expect((q as any).wakeTimer).not.toBeNull();

    // Shorten the wait to 80 ms and re-arm (what a real backoff would reach later).
    const soon = new Date(Date.now() + 80).toISOString();
    (q as any).queue[0].nextAttemptAt = soon;
    const stored = await storedQueue();
    stored[0].nextAttemptAt = soon; // the stored copy must agree (merge keeps the later wait)
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(stored));
    const before = (q as any).wakeTimer;
    (q as any)._scheduleWake();
    expect((q as any).wakeTimer).not.toBe(before); // replaced, never doubled
    fetchMock.mockResolvedValue(OK);
    await flush(300);

    expect(q.pendingCount).toBe(0);
    expect((q as any).wakeTimer).toBeNull();
  });

  it("does not re-arm for a wait that already passed (no spin without a signed-in owner)", async () => {
    const q = make();
    goOffline();
    await write(q, 1);
    goOnline();
    (q as any).queue[0].nextAttemptAt = new Date(Date.now() - 1000).toISOString();
    mockProfile = null; // nothing can be sent
    await q.sync();
    expect((q as any).wakeTimer).toBeNull();
  });

  it("clear() and destroy() cancel the wake timer", async () => {
    const q = make();
    goOffline();
    await write(q, 1);
    goOnline();
    fetchMock.mockResolvedValue({ ok: false, status: 503 });
    await q.sync();
    expect((q as any).wakeTimer).not.toBeNull();
    await q.clear();
    expect((q as any).wakeTimer).toBeNull();

    goOffline();
    await write(q, 2);
    goOnline();
    await q.sync();
    expect((q as any).wakeTimer).not.toBeNull();
    q.destroy();
    expect((q as any).wakeTimer).toBeNull();
  });

  it("drains when the app returns to the foreground, and stops listening on destroy", async () => {
    let onChange: ((s: string) => void) | null = null;
    const remove = jest.fn();
    spy(jest.spyOn(AppState, "addEventListener")).mockImplementation(((_t: string, cb: (s: string) => void) => {
      onChange = cb;
      return { remove };
    }) as any);
    const q = make();
    goOffline();
    await write(q, 1);
    await q.init(); // offline: nothing sent
    await flush(20);
    expect(fetchMock).not.toHaveBeenCalled();

    goOnline();
    fetchMock.mockResolvedValue(OK);
    onChange!("background");
    await flush(20);
    expect(fetchMock).not.toHaveBeenCalled();
    onChange!("active");
    await flush(50);
    expect(sentBodies()).toEqual([1]);

    q.destroy();
    expect(remove).toHaveBeenCalled();
  });
});

describe("failed drain pass", () => {
  it("does not reject sync() and still runs the resync pass", async () => {
    const q = make();
    goOffline();
    await write(q, 1);
    goOnline();
    fetchMock.mockResolvedValue(OK);
    const real = (q as any)._drainOnce.bind(q);
    let calls = 0;
    spy(jest.spyOn(q as any, "_drainOnce")).mockImplementation(async () => {
      calls++;
      if (calls === 1) {
        (q as any).resyncRequested = true; // a trigger arrived mid-drain
        throw new Error("Loading chunk failed");
      }
      return real();
    });

    await expect(q.sync()).resolves.toBeUndefined();
    expect(calls).toBe(2);
    expect(sentBodies()).toEqual([1]);
    expect(q.isSyncing).toBe(false);
  });
});
