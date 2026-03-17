/**
 * Sifter Skill_Up — Offline Queue & Sync Engine
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
}

type SyncListener = (status: 'syncing' | 'idle' | 'failed') => void;

class OfflineQueueManager {
  private queue: QueueItem[] = [];
  private syncing = false;
  private listeners: SyncListener[] = [];
  private unsubscribeNetInfo: (() => void) | null = null;

  async init() {
    await this._loadQueue();
    this._startNetworkWatcher();
  }

  /** Enqueue an action. Returns immediately — never blocks the user. */
  async enqueue(item: Omit<QueueItem, 'id' | 'createdAt' | 'attempts'>) {
    const entry: QueueItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: item.priority === 'critical' ? 20 : item.priority === 'high' ? 10 : 5,
    };

    this.queue.push(entry);

    // Sort: critical first, then high, then normal; within each, FIFO
    this.queue.sort((a, b) => {
      const order = { critical: 0, high: 1, normal: 2 };
      return order[a.priority] - order[b.priority];
    });

    // Cap queue size — drop oldest normal-priority items if over limit
    if (this.queue.length > MAX_QUEUE_SIZE) {
      const normalItems = this.queue.filter(i => i.priority === 'normal');
      if (normalItems.length > 0) {
        const toRemove = new Set([normalItems[0].id]);
        this.queue = this.queue.filter(i => !toRemove.has(i.id));
      }
    }

    await this._saveQueue();
    this._trySync();
  }

  /** Subscribe to sync status changes */
  onSyncStatus(listener: SyncListener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  get pendingCount() { return this.queue.length; }
  get isSyncing() { return this.syncing; }

  private _notify(status: Parameters<SyncListener>[0]) {
    this.listeners.forEach(l => l(status));
  }

  private _startNetworkWatcher() {
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this._trySync();
      }
    });
  }

  private async _trySync() {
    if (this.syncing || this.queue.length === 0) return;

    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) return;

    this.syncing = true;
    this._notify('syncing');

    const { API_BASE, API } = await import('./api');
    const token = await API.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    while (this.queue.length > 0) {
      // Re-check connectivity every 5 items
      if (this.queue.indexOf(this.queue[0]) % 5 === 0) {
        const net = await NetInfo.fetch();
        if (!net.isConnected) break;
      }

      const item = this.queue[0];

      try {
        const res = await fetch(`${API_BASE}${item.endpoint}`, {
          method: item.method,
          headers,
          body: JSON.stringify(item.body),
        });

        if (res.ok || res.status === 409) {
          // 409 = conflict (already synced) — treat as success
          this.queue.shift();
          await this._saveQueue();
        } else if (res.status >= 400 && res.status < 500) {
          // Client error — skip this item, it won't succeed on retry
          this.queue.shift();
          await this._saveQueue();
        } else {
          // Server error — increment attempts and back off
          item.attempts++;
          if (item.attempts >= item.maxAttempts) {
            this.queue.shift(); // give up
          }
          await this._saveQueue();
          break; // back off, try next sync window
        }
      } catch {
        // Network error — stop sync, will retry on next connection
        break;
      }
    }

    this.syncing = false;
    this._notify(this.queue.length === 0 ? 'idle' : 'failed');
  }

  private async _loadQueue() {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      if (raw) this.queue = JSON.parse(raw);
    } catch { this.queue = []; }
  }

  private async _saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch {}
  }

  destroy() {
    this.unsubscribeNetInfo?.();
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
) {
  await OfflineQueue.enqueue({ endpoint, method, body, priority, maxAttempts: 10 });
}

// Cache layer for reads
const READ_CACHE_PREFIX = 'sifter_cache_';
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
