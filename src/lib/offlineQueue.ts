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
const MAX_QUEUE_SIZE = 2000;

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
  | { queued: false; reason: 'no_profile' };

/** How long a write may sit waiting for a fresh sign-in after a 401. */
export const AUTH_HOLD_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Statuses that are worth retrying later even though they are 4xx. */
const TRANSIENT_4XX = new Set([408, 425, 429]);

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

export class OfflineQueueManager {
  private queue: QueueItem[] = [];
  private syncing = false;
  private listeners: SyncListener[] = [];
  private unsubscribeNetInfo: (() => void) | null = null;
  private hydration: Promise<void> | null = null;
  private saveChain: Promise<void> = Promise.resolve();
  /** Bumped by clear() so work started before it cannot re-persist anything. */
  private epoch = 0;
  /** Owner -> token that was rejected with 401; not retried until the token changes. */
  private authHold = new Map<string, string>();

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

    this.queue.push(entry);

    // Sort: critical first, then high, then normal; within each, FIFO
    const order = { critical: 0, high: 1, normal: 2 };
    this.queue.sort((a, b) => order[a.priority] - order[b.priority]);

    // Cap queue size — drop oldest normal-priority items if over limit
    if (this.queue.length > MAX_QUEUE_SIZE) {
      const normalItems = this.queue.filter(i => i.priority === 'normal');
      if (normalItems.length > 0) {
        const toRemove = new Set([normalItems[0].id]);
        this.queue = this.queue.filter(i => !toRemove.has(i.id));
      }
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

  private async _trySync() {
    await this._ensureLoaded();
    if (this.syncing || this.queue.length === 0) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) return;

    this.syncing = true;
    this._notify('syncing');
    const epoch = this.epoch;

    try {
      const { API_BASE, API } = await import('./api');
      const { getOrCreateDeviceId } = await import('./deviceId');

      let drained = 0;
      while (epoch === this.epoch) {
        // Only the signed-in account's own writes are sent, with that account's
        // current token (re-read each item so a refreshed token is used).
        const owner = await currentOwnerId();
        const token = await API.getToken();
        if (!owner || !token) break;
        // The token must belong to the account that wrote the item; during a
        // sign-in the stored profile and token can briefly disagree.
        const subject = tokenSubject(token);
        if (subject && subject !== owner) break;
        // A 401 for this exact token will not change on retry.
        if (this.authHold.get(owner) === token) break;
        this.authHold.delete(owner);

        const item = this.queue.find(i => i.ownerId === owner);
        if (!item) break;

        // Re-check connectivity every 5 items
        if (drained > 0 && drained % 5 === 0) {
          const net = await NetInfo.fetch();
          if (!net.isConnected) break;
        }

        const deviceId = await getOrCreateDeviceId().catch(() => null);

        try {
          const res = await fetch(`${API_BASE}${item.endpoint}`, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              // SINGLE_DEVICE_ENFORCEMENT 401s authenticated calls without it.
              ...(deviceId ? { 'X-Device-Id': deviceId } : {}),
            },
            body: JSON.stringify(item.body),
          });
          // The user signed out while the request was in flight.
          if (epoch !== this.epoch) break;

          if (res.ok || res.status === 409) {
            // 409 = conflict (already synced) — treat as success
            this._remove(item);
            drained++;
            await this._saveQueue(epoch);
          } else if (res.status === 401) {
            // The session is expired or was replaced. The write may still be
            // valid, so hold it for the next sign-in, but not forever.
            item.attempts++;
            item.authHeldSince ??= new Date().toISOString();
            const heldFor = Date.now() - Date.parse(item.authHeldSince);
            if (item.attempts >= item.maxAttempts || heldFor > AUTH_HOLD_MAX_AGE_MS) {
              this._remove(item);
            }
            this.authHold.set(owner, token);
            await this._saveQueue(epoch);
            break;
          } else if (TRANSIENT_4XX.has(res.status) || res.status >= 500) {
            item.attempts++;
            if (item.attempts >= item.maxAttempts) {
              this._remove(item); // give up
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
            await this._saveQueue(epoch);
            break;
          }
        } catch {
          // Network error — stop sync, will retry on next connection
          break;
        }
      }
    } finally {
      this.syncing = false;
      this._notify(this.queue.length === 0 ? 'idle' : 'failed');
    }
  }

  private _remove(item: QueueItem) {
    this.queue = this.queue.filter(i => i.id !== item.id);
  }

  private async _loadQueue() {
    const epoch = this.epoch;
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      // clear() ran while the stored queue was being read.
      if (epoch !== this.epoch) return;
      const parsed = raw ? JSON.parse(raw) : [];
      // Entries written before owner tagging cannot be attributed to an
      // account, so they are never sent.
      const stored: QueueItem[] = Array.isArray(parsed)
        ? parsed.filter((i: QueueItem) => !!i?.ownerId)
        : [];
      // Keep anything enqueued while hydration was in flight.
      const known = new Set(this.queue.map(i => i.id));
      this.queue = [...stored.filter(i => !known.has(i.id)), ...this.queue];
    } catch { /* keep the in-memory queue */ }
  }

  /** Forget every queued write (sign-out / account deletion). */
  async clear() {
    this.epoch++;
    this.queue = [];
    this.authHold.clear();
    // Nothing left to hydrate: the stored queue is removed just below.
    this.hydration = Promise.resolve();
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch {}
  }

  /** Writes are serialised and dropped if clear() ran after they were requested. */
  private _saveQueue(epoch: number = this.epoch): Promise<void> {
    this.saveChain = this.saveChain.then(async () => {
      if (epoch !== this.epoch) return;
      try {
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
      } catch {}
    });
    return this.saveChain;
  }

  destroy() {
    this.unsubscribeNetInfo?.();
    this.unsubscribeNetInfo = null;
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
