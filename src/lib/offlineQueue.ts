/**
 * Sifter LevelUp — Offline Queue & Sync Engine
 *
 * Strategy: offline-first, sync-when-available.
 * Mirrors how Candy Crush and similar games handle connectivity:
 *   - All user actions work immediately, stored locally
 *   - App scans for ANY internet signal opportunistically
 *   - On signal: drains queue silently in background, no interruption
 *   - No "you're offline" blocking screens — ever
 *
 * Queue is persisted to AsyncStorage so it survives app kills.
 * Each item has a priority (critical > high > normal) so progress
 * and certification data always syncs before analytics.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getSavedSessionProfile } from './sessionProfile';

const QUEUE_KEY = 'sifter_offline_queue';
const AUTH_HOLD_KEY = 'sifter_offline_queue_auth_hold';
const MAX_QUEUE_SIZE = 2000;
const DRAIN_LOCK = 'sifter_offline_queue_drain';
const STORE_LOCK = 'sifter_offline_queue_store';
const LEASE_KEY = 'sifter_offline_queue_lease';
const LEASE_TTL_MS = 60 * 1000;
const LOCK_RETRY_MS = 5 * 1000;

export type QueuePriority = 'critical' | 'high' | 'normal';

export interface QueueItem {
  id: string;
  priority: QueuePriority;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: any;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
  /** Account that made the write. Only that account's token may send it. */
  ownerId?: string;
  /** When the server first rejected the item with 401 (session expired). */
  authHeldSince?: string;
  /**
   * Fingerprint (not the token) of the last token the server rejected this
   * item with 401. The item is skipped until the token changes, so a restart
   * does not re-send it, and it does not block later items.
   */
  authFailedFor?: string;
  /** Do not send before this time (ISO). Set by backoff / Retry-After. */
  nextAttemptAt?: string;
  /** Transport failures (no response). Counted apart from maxAttempts. */
  networkFailures?: number;
  /** A 409 was already retried once; a second one settles the item. */
  conflictRetried?: boolean;
}

async function currentOwnerId(): Promise<string | null> {
  try {
    const profile = await getSavedSessionProfile<{ id?: string | number }>();
    return profile?.id != null ? String(profile.id) : null;
  } catch {
    return null;
  }
}

type SyncListener = (status: 'syncing' | 'idle' | 'failed') => void;

export type EnqueueResult =
  | { queued: true; id: string }
  | { queued: false; reason: 'no_profile' | 'invalid_body' };

/** How long a write may sit waiting for a fresh sign-in after a 401. */
export const AUTH_HOLD_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Writes owned by another account are discarded after this long. */
export const FOREIGN_OWNER_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** Backoff for retryable failures: 30s, 60s, 120s ... capped at 15 minutes. */
export const BACKOFF_BASE_MS = 30 * 1000;
export const BACKOFF_MAX_MS = 15 * 60 * 1000;

/** Consecutive 401s (different items, same token) after which the token is held. */
const AUTH_HOLD_AFTER_CONSECUTIVE_401 = 2;

/**
 * Statuses worth retrying later even though they are 4xx. 404 is here because
 * a deploy that has not finished (or a client ahead of the API) answers 404 for
 * a route that exists a minute later; it is bounded by maxAttempts.
 */
const RETRYABLE_STATUS = new Set([404, 408, 425, 429]);

/** A request that has not answered by now is abandoned (and counted). */
export const REQUEST_TIMEOUT_MS = 30 * 1000;

/** Transport failures after which a write that never gets through is dropped. */
export const NETWORK_FAILURE_CAP = 50;

type LocksApi = { request: (...args: any[]) => Promise<any> };

function webLocks(): LocksApi | null {
  const locks = (globalThis as any).navigator?.locks;
  return locks && typeof locks.request === 'function' ? (locks as LocksApi) : null;
}

function webStorage(): Storage | null {
  try {
    const ls = (globalThis as any).window?.localStorage ?? (globalThis as any).localStorage;
    return ls && typeof ls.getItem === 'function' ? (ls as Storage) : null;
  } catch {
    return null;
  }
}

/** Serialise a read-merge-write of the shared queue key across tabs. */
async function withStoreLock<T>(fn: () => Promise<T>): Promise<T> {
  const locks = webLocks();
  if (!locks) return fn();
  let started = false;
  try {
    return await locks.request(STORE_LOCK, async () => {
      started = true;
      return fn();
    });
  } catch (err) {
    if (started) throw err; // fn itself failed: do not run it twice
    return fn(); // the Locks API refused (e.g. insecure context)
  }
}

/** The user id a JWT was issued for, or null when it cannot be read. */
export function tokenSubject(token: string): string | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const claims = JSON.parse(globalThis.atob(padded));
    return claims?.sub != null ? String(claims.sub) : null;
  } catch {
    return null;
  }
}

/**
 * Short non-reversible fingerprint of a token, so the queue can remember
 * "this token was rejected" in AsyncStorage without persisting the token.
 */
export function tokenFingerprint(token: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${token.length.toString(36)}.${h.toString(16)}`;
}

/** Milliseconds to wait before retrying, honouring Retry-After (seconds or HTTP-date). */
export function retryDelayMs(
  attempts: number,
  retryAfter?: string | null,
  now: number = Date.now(),
): number {
  if (retryAfter) {
    const trimmed = retryAfter.trim();
    let ms = NaN;
    if (/^\d+$/.test(trimmed)) ms = parseInt(trimmed, 10) * 1000;
    else {
      const at = Date.parse(trimmed);
      if (!Number.isNaN(at)) ms = at - now;
    }
    if (!Number.isNaN(ms)) return Math.min(Math.max(ms, 0), BACKOFF_MAX_MS);
  }
  const exp = BACKOFF_BASE_MS * 2 ** Math.max(0, attempts - 1);
  return Math.min(exp, BACKOFF_MAX_MS);
}

export class OfflineQueueManager {
  private queue: QueueItem[] = [];
  /** True from the moment a drain is requested until it has finished. */
  private syncing = false;
  /**
   * The one in-flight drain. Every caller (enqueue, init, NetInfo, sync(),
   * the lock retry timer) joins it instead of starting its own, so the same
   * write can never be sent twice by concurrent drains. The flag is set
   * synchronously, before the first await: checking `syncing` and then awaiting
   * NetInfo before setting it let two callers both pass the guard.
   */
  private drainPromise: Promise<void> | null = null;
  /** A trigger arrived mid-drain: run one more pass when this one ends. */
  private resyncRequested = false;
  /** Ids being sent right now; never picked a second time. */
  private inFlight = new Set<string>();
  private listeners: SyncListener[] = [];
  private unsubscribeNetInfo: (() => void) | null = null;
  private hydration: Promise<void> | null = null;
  private saveChain: Promise<void> = Promise.resolve();
  /** Bumped by clear() so work started before it cannot re-persist anything. */
  private epoch = 0;
  /**
   * Owner -> fingerprint of a token the server rejected on consecutive items.
   * Persisted (AUTH_HOLD_KEY) so a restart does not re-send with that token.
   * Cleared when the token changes.
   */
  private authHold = new Map<string, string>();
  /** Ids this tab last saw in storage; absent later means another tab removed them. */
  private persistedIds = new Set<string>();
  /** Ids this tab removed since its last save; never resurrected by a merge. */
  private removedIds = new Set<string>();
  private lockRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly tabId = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

  /**
   * Hydrate the persisted queue and start the connectivity watcher.
   * Idempotent. enqueue() and the drain also hydrate lazily, so a write made
   * before (or without) init() can never overwrite the persisted queue.
   */
  async init() {
    await this._ensureLoaded();
    if (!this.unsubscribeNetInfo) this._startNetworkWatcher();
    void this._trySync();
  }

  /** Enqueue an action. Returns immediately — never blocks the user. */
  async enqueue(
    item: Omit<QueueItem, 'id' | 'createdAt' | 'attempts' | 'ownerId'>,
  ): Promise<EnqueueResult> {
    await this._ensureLoaded();
    // A body that cannot be serialised can never be sent, and persisting it
    // would make every later save of the whole queue fail.
    try {
      JSON.stringify(item.body);
    } catch {
      return { queued: false, reason: 'invalid_body' };
    }
    const epoch = this.epoch;
    // A write with no signed-in owner can never be sent safely: it would be
    // delivered with whichever account signs in next. Tell the caller.
    const ownerId = await currentOwnerId();
    if (!ownerId) return { queued: false, reason: 'no_profile' };
    // clear() ran while the owner was being resolved: the user signed out.
    if (epoch !== this.epoch) return { queued: false, reason: 'no_profile' };
    const entry: QueueItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
      ownerId,
      maxAttempts: item.priority === 'critical' ? 20 : item.priority === 'high' ? 10 : 5,
    };

    this._pruneForeign(ownerId);
    this.queue.push(entry);

    // Sort: critical first, then high, then normal; within each, FIFO
    this._sortQueue();

    // Cap queue size — drop the oldest normal-priority item if over limit
    // (or, when there are none, the oldest item of any priority).
    while (this.queue.length > MAX_QUEUE_SIZE) {
      const oldest = (items: QueueItem[]) =>
        items.reduce((a, b) => (Date.parse(b.createdAt) < Date.parse(a.createdAt) ? b : a));
      const normalItems = this.queue.filter(i => i.priority === 'normal');
      const victim = oldest(normalItems.length > 0 ? normalItems : this.queue);
      this._remove(victim);
    }

    await this._saveQueue(epoch);
    void this._trySync();
    return { queued: true, id: entry.id };
  }

  /** Subscribe to sync status changes */
  onSyncStatus(listener: SyncListener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  get pendingCount() { return this.queue.length; }
  get isSyncing() { return this.syncing; }

  /** Snapshot of the queued items (read-only copy). */
  getItems(): QueueItem[] {
    return this.queue.map(i => ({ ...i }));
  }

  /** Run one drain pass now (used by tests and by manual retry). */
  async sync() {
    await this._trySync();
  }

  private _notify(status: Parameters<SyncListener>[0]) {
    this.listeners.forEach(l => l(status));
  }

  private _sortQueue() {
    const order = { critical: 0, high: 1, normal: 2 };
    this.queue.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  private _ensureLoaded(): Promise<void> {
    if (!this.hydration) this.hydration = this._loadQueue();
    return this.hydration;
  }

  private _startNetworkWatcher() {
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        void this._trySync();
      }
    });
  }

  /**
   * Start a drain, or join the one already running. Concurrent callers all
   * wait on the same promise; a caller that arrives mid-drain makes the drain
   * run one more pass at the end so a write enqueued late is not stranded.
   */
  private _trySync(): Promise<void> {
    if (this.drainPromise) {
      this.resyncRequested = true;
      return this.drainPromise;
    }
    // Set before any await: this is the guard.
    this.syncing = true;
    const run = (async () => {
      try {
        do {
          this.resyncRequested = false;
          await this._drainOnce();
        } while (this.resyncRequested);
      } finally {
        this.syncing = false;
        this.drainPromise = null;
      }
    })();
    this.drainPromise = run;
    return run;
  }

  private async _drainOnce(): Promise<void> {
    await this._ensureLoaded();
    // On the web another tab may have queued writes this tab has not seen yet
    // (merged below, under the lock), so an empty memory is not "nothing to do".
    if (this.queue.length === 0 && !webStorage()) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) return;

    // Only one tab drains at a time (Web Locks, or a short lease where those
    // are unavailable); the other tab leaves the writes to it. Native has a
    // single process and needs no lock.
    const ran = await this._withDrainLock(lease => this._drainLocked(lease));
    if (!ran && !this.lockRetryTimer) {
      // Another tab holds the drain. If it finishes before it sees this tab's
      // latest write, nothing would trigger a drain here, so look again soon.
      this.lockRetryTimer = setTimeout(() => {
        this.lockRetryTimer = null;
        void this._trySync();
      }, LOCK_RETRY_MS);
    }
  }

  private async _drainLocked(lease: { renew: () => void }): Promise<void> {
    const epoch = this.epoch;
    // Another tab may have enqueued, sent or dropped items since this tab
    // last looked at storage.
    await this._mergeFromStorage(epoch);
    if (this.queue.length === 0) return;
    this._notify('syncing');
    let consecutive401 = 0;

    try {
      const { API_BASE, API } = await import('./api');
      const { getOrCreateDeviceId } = await import('./deviceId');

      let drained = 0;
      while (epoch === this.epoch) {
        lease.renew();
        // Only the signed-in account's own writes are sent, with that account's
        // current token (re-read each item so a refreshed token is used).
        const owner = await currentOwnerId();
        const token = await API.getToken();
        if (!owner || !token) break;
        // The token must belong to the account that wrote the item; during a
        // sign-in the stored profile and token can briefly disagree.
        const subject = tokenSubject(token);
        if (subject && subject !== owner) break;
        const fp = tokenFingerprint(token);
        // Consecutive 401s for this exact token will not change on retry.
        if (this.authHold.get(owner) === fp) break;
        if (this.authHold.delete(owner)) await this._saveAuthHold(epoch);

        // An item this token already failed on is skipped (it does not block
        // the writes behind it) until the token changes.
        const item = this.queue.find(
          i => i.ownerId === owner && i.authFailedFor !== fp && !this.inFlight.has(i.id),
        );
        if (!item) break;
        // Backing off (rate limit / server error): wait without sending and
        // without counting an attempt. Later items wait too, to keep order and
        // not hammer a throttled server.
        if (this._isBackedOff(item)) break;

        // Re-check connectivity every 5 items
        if (drained > 0 && drained % 5 === 0) {
          const net = await NetInfo.fetch();
          if (!net.isConnected) break;
        }

        const deviceId = await getOrCreateDeviceId().catch(() => null);

        // A body that cannot be serialised will never succeed and would block
        // the writes behind it forever.
        let payload: string | undefined;
        try {
          payload = JSON.stringify(item.body);
        } catch {
          this._remove(item);
          await this._saveQueue(epoch);
          continue;
        }

        this.inFlight.add(item.id);
        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
        try {
          // No Idempotency-Key is sent: the API does not honour one on these
          // endpoints, so exactly-once relies on the single in-flight drain
          // above plus the cross-tab lock, not on the server de-duplicating.
          const res = await fetch(`${API_BASE}${item.endpoint}`, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              // SINGLE_DEVICE_ENFORCEMENT 401s authenticated calls without it.
              ...(deviceId ? { 'X-Device-Id': deviceId } : {}),
            },
            body: payload,
            ...(controller ? { signal: controller.signal } : {}),
          });
          // The user signed out while the request was in flight.
          if (epoch !== this.epoch) break;

          if (res.ok) {
            this._remove(item);
            drained++;
            consecutive401 = 0;
            await this._saveQueue(epoch);
          } else if (res.status === 409) {
            // 409 may mean "already applied", but the API gives these writes no
            // idempotency key, so it can also be a real conflict. Retry once
            // and treat a second 409 as settled so it cannot block the queue.
            if (item.conflictRetried) {
              this._remove(item);
              drained++;
            } else {
              item.conflictRetried = true;
            }
            consecutive401 = 0;
            await this._saveQueue(epoch);
          } else if (res.status === 401) {
            // The session is expired or was replaced. The write may still be
            // valid, so hold it for the next sign-in, but not forever.
            item.attempts++;
            item.authHeldSince ??= new Date().toISOString();
            const heldFor = Date.now() - Date.parse(item.authHeldSince);
            if (item.attempts >= item.maxAttempts || heldFor > AUTH_HOLD_MAX_AGE_MS) {
              this._remove(item);
            } else {
              item.authFailedFor = fp;
            }
            // One rejected item is skipped and the next is tried; a second
            // consecutive 401 means the token itself is dead, so hold it.
            consecutive401++;
            const tokenDead = consecutive401 >= AUTH_HOLD_AFTER_CONSECUTIVE_401;
            if (tokenDead) this.authHold.set(owner, fp);
            await this._saveQueue(epoch);
            if (tokenDead) {
              await this._saveAuthHold(epoch);
              break;
            }
          } else if (RETRYABLE_STATUS.has(res.status) || res.status >= 500) {
            item.attempts++;
            if (item.attempts >= item.maxAttempts) {
              this._remove(item); // give up
            } else {
              this._backOff(item, res);
            }
            await this._saveQueue(epoch);
            break; // back off, try next sync window
          } else if (res.status >= 400 && res.status < 500) {
            // Permanent client error (including 403) — it will not succeed on
            // retry, and must not block the writes behind it.
            this._remove(item);
            await this._saveQueue(epoch);
          } else {
            item.attempts++;
            if (item.attempts >= item.maxAttempts) this._remove(item);
            else this._backOff(item, res);
            await this._saveQueue(epoch);
            break;
          }
        } catch {
          // Network error or timeout: stop this drain. It is not the server's
          // verdict on the write, so it does not use up maxAttempts, but a
          // write that can never get through (for example one that resets the
          // connection) is dropped after a generous number of tries.
          if (epoch !== this.epoch) break;
          item.networkFailures = (item.networkFailures ?? 0) + 1;
          if (item.networkFailures >= NETWORK_FAILURE_CAP) {
            this._remove(item);
          } else {
            item.nextAttemptAt = new Date(
              Date.now() + retryDelayMs(item.networkFailures),
            ).toISOString();
          }
          await this._saveQueue(epoch);
          break;
        } finally {
          if (timer) clearTimeout(timer);
          this.inFlight.delete(item.id);
        }
      }
    } finally {
      this._notify(this.queue.length === 0 ? 'idle' : 'failed');
      // clear() ran mid-drain: any enqueue/NetInfo trigger that arrived while
      // this stale drain was still flagged as syncing was skipped.
      if (epoch !== this.epoch) this.resyncRequested = true;
    }
  }

  /**
   * True while the item must not be sent yet. A wait further away than the
   * longest backoff can only come from a clock that was wrong when it was
   * stored (or has since been corrected), so it is ignored rather than
   * blocking the queue for years.
   */
  private _isBackedOff(item: QueueItem): boolean {
    if (!item.nextAttemptAt) return false;
    const at = Date.parse(item.nextAttemptAt);
    if (Number.isNaN(at)) {
      delete item.nextAttemptAt;
      return false;
    }
    const wait = at - Date.now();
    if (wait > BACKOFF_MAX_MS) {
      delete item.nextAttemptAt;
      return false;
    }
    return wait > 0;
  }

  private _backOff(item: QueueItem, res: { headers?: { get?: (n: string) => string | null } }) {
    let retryAfter: string | null = null;
    try {
      retryAfter = res.headers?.get?.('Retry-After') ?? null;
    } catch {
      retryAfter = null;
    }
    item.nextAttemptAt = new Date(Date.now() + retryDelayMs(item.attempts, retryAfter)).toISOString();
  }

  /** Drop writes owned by other accounts that have waited too long. */
  private _pruneForeign(currentOwner: string | null) {
    const cutoff = Date.now() - FOREIGN_OWNER_MAX_AGE_MS;
    const keep: QueueItem[] = [];
    for (const i of this.queue) {
      if (i.ownerId === currentOwner || !(Date.parse(i.createdAt) < cutoff)) keep.push(i);
      else this.removedIds.add(i.id);
    }
    this.queue = keep;
  }

  /** Remove every queued write (and 401 hold) belonging to one account. */
  async dropOwner(ownerId: string) {
    await this._ensureLoaded();
    const epoch = this.epoch;
    const keep: QueueItem[] = [];
    for (const i of this.queue) {
      if (i.ownerId !== ownerId) keep.push(i);
      else this.removedIds.add(i.id);
    }
    this.queue = keep;
    this.authHold.delete(ownerId);
    await this._saveQueue(epoch);
    await this._saveAuthHold(epoch);
  }

  private _saveAuthHold(epoch: number = this.epoch): Promise<void> {
    this.saveChain = this.saveChain.then(async () => {
      if (epoch !== this.epoch) return;
      try {
        if (this.authHold.size === 0) await AsyncStorage.removeItem(AUTH_HOLD_KEY);
        else await AsyncStorage.setItem(AUTH_HOLD_KEY, JSON.stringify(Object.fromEntries(this.authHold)));
      } catch {}
    });
    return this.saveChain;
  }

  private _remove(item: QueueItem) {
    this.removedIds.add(item.id);
    this.queue = this.queue.filter(i => i.id !== item.id);
  }

  private async _readStored(): Promise<QueueItem[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Entries written before owner tagging cannot be attributed to an
    // account, so they are never sent.
    return Array.isArray(parsed) ? parsed.filter((i: QueueItem) => !!i?.ownerId && !!i?.id) : [];
  }

  /**
   * Fold what is in storage into the in-memory queue, by item id. Two tabs
   * share one storage key; each used to overwrite the other's queue with its
   * own whole array. Here:
   *  - an item only in storage was enqueued by another tab: adopt it;
   *  - an item only in memory that this tab already saw in storage was sent or
   *    dropped by another tab: forget it; one this tab never saved is new: keep it;
   *  - an item removed by this tab is never resurrected from a stale read;
   *  - an item in both keeps the copy with more attempts.
   * Must run synchronously with the write that follows it (see _saveQueue).
   */
  private _mergeStored(stored: QueueItem[]) {
    const mem = new Map(this.queue.map(i => [i.id, i] as const));
    const merged: QueueItem[] = [];
    const seen = new Set<string>();
    for (const s of stored) {
      if (this.removedIds.has(s.id) || seen.has(s.id)) continue;
      seen.add(s.id);
      const m = mem.get(s.id);
      merged.push(m ? (s.attempts > m.attempts ? { ...m, ...s } : m) : s);
    }
    for (const m of this.queue) {
      if (seen.has(m.id)) continue;
      if (this.persistedIds.has(m.id)) continue; // removed elsewhere
      merged.push(m);
    }
    this.queue = merged;
    this._sortQueue();
  }

  private async _mergeFromStorage(epoch: number = this.epoch) {
    try {
      const stored = await withStoreLock(() => this._readStored());
      if (epoch !== this.epoch) return;
      this._mergeStored(stored);
      this.persistedIds = new Set(this.queue.map(i => i.id));
    } catch { /* keep the in-memory queue */ }
  }

  private async _loadQueue() {
    const epoch = this.epoch;
    try {
      const stored = await this._readStored();
      // clear() ran while the stored queue was being read.
      if (epoch !== this.epoch) return;
      // Keep anything enqueued while hydration was in flight.
      this._mergeStored(stored);
      this.persistedIds = new Set(stored.map(i => i.id));
      this._pruneForeign(await currentOwnerId());
      const holdRaw = await AsyncStorage.getItem(AUTH_HOLD_KEY);
      if (epoch !== this.epoch) return;
      const hold = holdRaw ? JSON.parse(holdRaw) : {};
      if (hold && typeof hold === 'object') {
        for (const [owner, fp] of Object.entries(hold)) {
          if (typeof fp === 'string' && !this.authHold.has(owner)) this.authHold.set(owner, fp);
        }
      }
    } catch { /* keep the in-memory queue */ }
  }

  /** Forget every queued write (sign-out / account deletion). */
  async clear() {
    this.epoch++;
    this.queue = [];
    this.persistedIds = new Set();
    this.removedIds = new Set();
    this.authHold.clear();
    if (this.lockRetryTimer) {
      clearTimeout(this.lockRetryTimer);
      this.lockRetryTimer = null;
    }
    // Nothing left to hydrate: the stored queue is removed just below.
    this.hydration = Promise.resolve();
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
      await AsyncStorage.removeItem(AUTH_HOLD_KEY);
    } catch {}
  }

  /**
   * Writes are serialised and dropped if clear() ran after they were requested.
   * Each write re-reads storage and merges by item id first (under a Web Lock
   * where available), so two tabs cannot overwrite each other's items. The
   * queue is one JSON value in which every item carries its ownerId, so an
   * item and its owner are always persisted together.
   */
  private _saveQueue(epoch: number = this.epoch): Promise<void> {
    this.saveChain = this.saveChain.then(async () => {
      if (epoch !== this.epoch) return;
      try {
        await withStoreLock(async () => {
          let stored: QueueItem[] | null = null;
          try {
            stored = await this._readStored();
          } catch {
            stored = null; // unreadable: write what this tab has
          }
          if (epoch !== this.epoch) return;
          if (stored) this._mergeStored(stored);
          await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
          this.persistedIds = new Set(this.queue.map(i => i.id));
          this.removedIds.clear();
        });
      } catch {}
    });
    return this.saveChain;
  }

  /**
   * Run `fn` only if no other tab is draining. Resolves to false when another
   * tab holds the drain.
   */
  private async _withDrainLock(fn: (lease: { renew: () => void }) => Promise<void>): Promise<boolean> {
    const locks = webLocks();
    if (locks) {
      let started = false;
      try {
        return await locks.request(DRAIN_LOCK, { ifAvailable: true }, async (lock: unknown) => {
          if (!lock) return false;
          started = true;
          await fn({ renew: () => undefined });
          return true;
        });
      } catch (err) {
        if (started) throw err; // the drain itself failed: do not run it twice
        // The Locks API refused (e.g. insecure context): use the lease.
      }
    }
    const lease = this._acquireLease();
    if (!lease) return false;
    try {
      await fn(lease);
    } finally {
      lease.release();
    }
    return true;
  }

  /**
   * Fallback cross-tab guard for browsers without the Web Locks API: a lease
   * key in localStorage with a short TTL. Not used on native (one process).
   */
  private _acquireLease(): { renew: () => void; release: () => void } | null {
    const none = { renew: () => undefined, release: () => undefined };
    const ls = webStorage();
    if (!ls) return none;
    const write = () => ls.setItem(LEASE_KEY, JSON.stringify({ owner: this.tabId, until: Date.now() + LEASE_TTL_MS }));
    try {
      const now = Date.now();
      const cur = JSON.parse(ls.getItem(LEASE_KEY) ?? 'null');
      // A lease further out than the TTL was written by a wrong clock: ignore it.
      if (cur && cur.owner !== this.tabId && cur.until > now && cur.until - now <= LEASE_TTL_MS) return null;
      write();
      const check = JSON.parse(ls.getItem(LEASE_KEY) ?? 'null');
      if (!check || check.owner !== this.tabId) return null;
    } catch {
      return none;
    }
    return {
      renew: () => { try { write(); } catch {} },
      release: () => {
        try {
          const cur = JSON.parse(ls.getItem(LEASE_KEY) ?? 'null');
          if (cur?.owner === this.tabId) ls.removeItem(LEASE_KEY);
        } catch {}
      },
    };
  }

  destroy() {
    this.unsubscribeNetInfo?.();
    this.unsubscribeNetInfo = null;
    if (this.lockRetryTimer) {
      clearTimeout(this.lockRetryTimer);
      this.lockRetryTimer = null;
    }
  }
}

export const OfflineQueue = new OfflineQueueManager();

// ─── Offline-aware API wrapper ────────────────────────────────────────────────
/**
 * Use this instead of direct API calls for write operations.
 * Reads always attempt live first, fall back to cached data.
 * Writes always enqueue immediately, sync when online.
 */
export async function offlineWrite(
  endpoint: string,
  method: QueueItem['method'],
  body: any,
  priority: QueuePriority = 'normal',
): Promise<EnqueueResult> {
  return OfflineQueue.enqueue({ endpoint, method, body, priority, maxAttempts: 10 });
}

// Cache layer for reads
const READ_CACHE_PREFIX = 'sifter_cache_';

/** Remove every cached read (keys are not scoped per account). */
export async function clearReadCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(READ_CACHE_PREFIX));
    if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
  } catch {}
}

/** Remove the offline write queue and every cached read (sign-out / deletion). */
export async function clearOfflineData(): Promise<void> {
  await OfflineQueue.clear();
  await clearReadCache();
}
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function offlineRead<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl = CACHE_TTL_MS,
): Promise<T> {
  const key = READ_CACHE_PREFIX + cacheKey;

  // Try live first
  try {
    const net = await NetInfo.fetch();
    if (net.isConnected && net.isInternetReachable) {
      const data = await fetcher();
      // Cache the result
      await AsyncStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
      return data;
    }
  } catch {}

  // Fall back to cache
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) {
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts < ttl) return data as T;
    }
  } catch {}

  throw new Error('OFFLINE_NO_CACHE');
}
