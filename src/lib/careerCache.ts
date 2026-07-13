/**
 * careerCache — a dependency-light, AsyncStorage-backed cache + offline write
 * queue for the career-intelligence surfaces.
 *
 * Two responsibilities:
 *
 *  1. READ CACHE (TTL): getCached / setCached persist domain/role payloads so
 *     screens can hydrate instantly and survive brief offline windows. Each
 *     entry stores a timestamp + ttl; reads past their ttl return null.
 *
 *  2. WRITE QUEUE: queueWrite enqueues a save/note mutation made while offline
 *     (or optimistically), persisted so it survives an app kill. flushQueue
 *     replays queued ops against the backend when connectivity returns and
 *     drops the ones that succeed (or that fail with a 4xx — they won't ever
 *     succeed on retry).
 *
 * Intentionally standalone: it only depends on AsyncStorage + the app's API
 * base/token so it can be reused without pulling in the heavier offlineQueue
 * engine. Overlaps in spirit with src/lib/offlineQueue.ts but is scoped to the
 * career module's cache keys.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE, API } from "./api";

const CACHE_PREFIX = "@sifter_career_cache_";
const QUEUE_KEY = "@sifter_career_write_queue_v1";

// ─── Read cache (TTL) ─────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  ts: number;
  ttl: number;
}

/** Read a cached value; returns null if missing, unparseable, or expired. */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (typeof entry.ts !== "number" || typeof entry.ttl !== "number") {
      return null;
    }
    if (Date.now() - entry.ts > entry.ttl) {
      // Expired — clean it up opportunistically.
      AsyncStorage.removeItem(CACHE_PREFIX + key).catch(() => {});
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

/** Cache a value under `key` with a time-to-live in milliseconds. */
export async function setCached<T>(
  key: string,
  value: T,
  ttlMs: number,
): Promise<void> {
  try {
    const entry: CacheEntry<T> = { value, ts: Date.now(), ttl: ttlMs };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Cache writes are best-effort — never throw into the caller.
  }
}

// ─── Write queue (offline save/note mutations) ────────────────

export interface WriteOp {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  createdAt: number;
}

export type QueuableOp = Omit<WriteOp, "id" | "createdAt">;

async function _loadQueue(): Promise<WriteOp[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WriteOp[]) : [];
  } catch {
    return [];
  }
}

async function _saveQueue(queue: WriteOp[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // best-effort
  }
}

/** Enqueue a write to replay later. Returns immediately; never blocks the UI. */
export async function queueWrite(op: QueuableOp): Promise<WriteOp> {
  const entry: WriteOp = {
    ...op,
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  const queue = await _loadQueue();
  queue.push(entry);
  await _saveQueue(queue);
  return entry;
}

/** Number of writes currently waiting to sync. */
export async function pendingWrites(): Promise<number> {
  return (await _loadQueue()).length;
}

/**
 * Replay queued writes against the backend. Successful ops (and 4xx failures,
 * which won't succeed on retry) are dropped; ops that fail on network / 5xx are
 * kept for the next flush. Returns the count of ops flushed (removed).
 */
export async function flushQueue(): Promise<number> {
  const queue = await _loadQueue();
  if (queue.length === 0) return 0;

  const token = await API.getToken().catch(() => null);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const remaining: WriteOp[] = [];
  let flushed = 0;

  for (const op of queue) {
    try {
      const res = await fetch(`${API_BASE}${op.endpoint}`, {
        method: op.method,
        headers,
        body: op.body != null ? JSON.stringify(op.body) : undefined,
      });
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        // Success, or a permanent client error — drop it either way.
        flushed += 1;
      } else {
        // Server error — keep for a later flush.
        remaining.push(op);
      }
    } catch {
      // Network error — keep the rest of the queue and stop early.
      remaining.push(op);
    }
  }

  await _saveQueue(remaining);
  return flushed;
}

/** Clear the entire write queue (e.g. on sign-out). */
export async function clearQueue(): Promise<void> {
  await _saveQueue([]);
}
