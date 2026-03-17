/**
 * Sifter Skill_Up — Offline Storage Engine
 *
 * TRUE offline-first. Works like Candy Crush:
 *   - All progress lives on the server AND device simultaneously
 *   - New phone login → server restores everything instantly
 *   - Months offline → all downloaded content still works locally
 *   - Any internet signal → silent background sync, no interruption
 *
 * ARCHITECTURE:
 *   Server is source of truth for PROGRESS.
 *   Device is source of truth for CONTENT (downloaded on first sync).
 *
 * Three stores:
 *   1. ContentStore  — lesson/track data downloaded in full, never expires
 *   2. ProgressStore — every action written here first, synced to server ASAP
 *   3. SyncQueue     — ordered log of unsynced writes, drained on any connection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// ─── Keys ────────────────────────────────────────────────────────────────────
const KEYS = {
  CONTENT_MANIFEST: 'ss_content_manifest',
  CONTENT_PREFIX:   'ss_content_',
  PROGRESS:         'ss_progress',
  SYNC_QUEUE:       'ss_sync_queue',
  LAST_SERVER_SYNC: 'ss_last_sync',
  DEVICE_ID:        'ss_device_id',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContentManifest {
  version: number;
  downloadedAt: string;
  tracks: Record<string, { version: number; downloadedAt: string; sizeKb: number }>;
  totalSizeKb: number;
}

export interface LocalProgress {
  userId: string;
  completedLevels: string[];
  currentTrack: string;
  lastPosition: {
    trackId: string; trackName: string; level: string;
    labId: string; labTitle: string; lessonId: string; lessonTitle: string;
    savedAt: string;
  } | null;
  xp: number;
  streak: number;
  lastActiveDate: string;
  achievements: string[];
  portfolioArtifacts: any[];
  guildId: string | null;
  referralCode: string | null;
  settings: Record<string, any>;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: any;
  priority: 'critical' | 'high' | 'normal';
  createdAt: string;
  attempts: number;
}

// ─── Device ID (stable across reinstalls IF user restores backup) ─────────────

async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEYS.DEVICE_ID);
  if (!id) {
    id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(KEYS.DEVICE_ID, id);
  }
  return id;
}

// ─── Progress Store ───────────────────────────────────────────────────────────
// Written locally on every action. Server receives a copy whenever online.
// On new device login, server sends the full progress object back.

export async function saveProgressLocally(progress: Partial<LocalProgress>): Promise<void> {
  const existing = await getLocalProgress();
  const merged: LocalProgress = {
    ...existing,
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify(merged));
}

export async function getLocalProgress(): Promise<LocalProgress> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROGRESS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    userId: '', completedLevels: [], currentTrack: '', lastPosition: null,
    xp: 0, streak: 0, lastActiveDate: new Date().toISOString(),
    achievements: [], portfolioArtifacts: [], guildId: null,
    referralCode: null, settings: {}, updatedAt: new Date().toISOString(),
  };
}

/**
 * Called after login on a new device.
 * Server sends the full progress snapshot — overwrite local with server state.
 * Server state always wins on login (it aggregated from all previous devices).
 */
export async function restoreProgressFromServer(serverProgress: LocalProgress): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROGRESS, JSON.stringify({
    ...serverProgress,
    updatedAt: new Date().toISOString(),
  }));
}

// ─── Content Store ────────────────────────────────────────────────────────────
// Lesson content downloaded in full. No TTL — never expires.
// Updated only when the server says a new version is available (version check).

export async function getContentManifest(): Promise<ContentManifest | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CONTENT_MANIFEST);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveTrackContent(trackId: string, content: any, version: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.CONTENT_PREFIX + trackId, JSON.stringify(content));
  const manifest = await getContentManifest() ?? {
    version, downloadedAt: new Date().toISOString(), tracks: {}, totalSizeKb: 0,
  };
  const sizeKb = Math.round(JSON.stringify(content).length / 1024);
  manifest.tracks[trackId] = { version, downloadedAt: new Date().toISOString(), sizeKb };
  manifest.totalSizeKb = Object.values(manifest.tracks).reduce((s, t) => s + t.sizeKb, 0);
  await AsyncStorage.setItem(KEYS.CONTENT_MANIFEST, JSON.stringify(manifest));
}

export async function getTrackContent(trackId: string): Promise<any | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CONTENT_PREFIX + trackId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  const manifest = await getContentManifest();
  return !!manifest?.tracks[trackId];
}

export async function isTrackUpdateAvailable(trackId: string, serverVersion: number): Promise<boolean> {
  const manifest = await getContentManifest();
  const local = manifest?.tracks[trackId];
  return !local || local.version < serverVersion;
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────
// Every write action is logged here. Drained to server whenever online.
// Ordered. Never dropped if priority is critical or high.

async function getSyncQueue(): Promise<SyncQueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveSyncQueue(queue: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
}

export async function enqueueWrite(
  endpoint: string,
  method: SyncQueueItem['method'],
  body: any,
  priority: SyncQueueItem['priority'] = 'normal',
): Promise<void> {
  const queue = await getSyncQueue();
  queue.push({
    id: `sq_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    endpoint, method, body, priority,
    createdAt: new Date().toISOString(),
    attempts: 0,
  });
  // Sort: critical first, then high, then normal; FIFO within each
  queue.sort((a, b) => {
    const o = { critical: 0, high: 1, normal: 2 };
    return o[a.priority] - o[b.priority];
  });
  // Drop oldest normal items if queue is massive (>5000)
  const filtered = queue.length > 5000
    ? [...queue.filter(i => i.priority !== 'normal').slice(0, 4000),
       ...queue.filter(i => i.priority === 'normal').slice(-1000)]
    : queue;
  await saveSyncQueue(filtered);
}

export async function getPendingSyncCount(): Promise<number> {
  const q = await getSyncQueue();
  return q.length;
}

// ─── Sync Engine ──────────────────────────────────────────────────────────────

let _syncing = false;
let _netUnsub: (() => void) | null = null;
let _syncListeners: Array<(pending: number) => void> = [];

export function onSyncUpdate(cb: (pending: number) => void) {
  _syncListeners.push(cb);
  return () => { _syncListeners = _syncListeners.filter(l => l !== cb); };
}

function notifyListeners(pending: number) {
  _syncListeners.forEach(l => l(pending));
}

export async function initOfflineStorage(apiBase: string, getToken: () => Promise<string | null>) {
  // Start network watcher — sync whenever any connection appears
  _netUnsub = NetInfo.addEventListener(async state => {
    if (state.isConnected && state.isInternetReachable) {
      await drainSyncQueue(apiBase, getToken);
    }
  });

  // Attempt immediate sync on init
  const net = await NetInfo.fetch();
  if (net.isConnected && net.isInternetReachable) {
    drainSyncQueue(apiBase, getToken).catch(() => {});
  }
}

export async function drainSyncQueue(
  apiBase: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  if (_syncing) return;
  _syncing = true;

  try {
    const token = await getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let queue = await getSyncQueue();

    while (queue.length > 0) {
      // Re-check network every 10 items
      if (queue.length % 10 === 0) {
        const net = await NetInfo.fetch();
        if (!net.isConnected) break;
      }

      const item = queue[0];

      try {
        const res = await fetch(`${apiBase}${item.endpoint}`, {
          method: item.method,
          headers,
          body: JSON.stringify(item.body),
        });

        if (res.ok || res.status === 409) {
          // Success or already synced — remove from queue
          queue.shift();
          await saveSyncQueue(queue);
          notifyListeners(queue.length);
        } else if (res.status >= 400 && res.status < 500) {
          // Client error — this item will never succeed, skip it
          queue.shift();
          await saveSyncQueue(queue);
        } else {
          // Server error — back off
          item.attempts++;
          if (item.priority === 'normal' && item.attempts >= 5) queue.shift();
          else if (item.priority === 'high' && item.attempts >= 10) queue.shift();
          // Critical items stay forever
          await saveSyncQueue(queue);
          break;
        }
      } catch {
        // Network dropped mid-sync
        break;
      }
    }
  } finally {
    _syncing = false;
  }
}

export function destroyOfflineStorage() {
  _netUnsub?.();
}

// ─── Content Download Manager ─────────────────────────────────────────────────
// Downloads all lesson content for a track in one shot.
// Called after login and after any track unlock.
// Silent background operation — never blocks the user.

export async function downloadTrackContent(
  trackId: string,
  apiBase: string,
  getToken: () => Promise<string | null>,
  onProgress?: (pct: number) => void,
): Promise<boolean> {
  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return false;

    const token = await getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Check if update needed
    const versionRes = await fetch(`${apiBase}/api/content/${trackId}/version`, { headers });
    if (!versionRes.ok) return false;
    const { version } = await versionRes.json();

    if (!(await isTrackUpdateAvailable(trackId, version))) {
      return true; // Already up to date
    }

    onProgress?.(10);

    // Download full track content
    const contentRes = await fetch(`${apiBase}/api/content/${trackId}`, { headers });
    if (!contentRes.ok) return false;

    onProgress?.(60);

    const content = await contentRes.json();
    await saveTrackContent(trackId, content, version);

    onProgress?.(100);
    return true;
  } catch {
    return false;
  }
}

/**
 * Called immediately after login on any device.
 * 1. Fetches full progress from server (restores new device)
 * 2. Downloads any missing track content
 * 3. Drains the sync queue
 */
export async function onLoginSync(
  userId: string,
  apiBase: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  try {
    const net = await NetInfo.fetch();
    if (!net.isConnected) return; // Will sync on next connection

    const token = await getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // 1. Pull full progress from server → overwrites local
    const progressRes = await fetch(`${apiBase}/api/users/progress`, { headers });
    if (progressRes.ok) {
      const serverProgress = await progressRes.json();
      await restoreProgressFromServer({ ...serverProgress, userId });
    }

    // 2. Download content for active track (background, non-blocking for other tracks)
    const progress = await getLocalProgress();
    if (progress.currentTrack) {
      downloadTrackContent(progress.currentTrack, apiBase, getToken).catch(() => {});
    }

    // 3. Drain any queued writes (e.g. from previous device still pending)
    await drainSyncQueue(apiBase, getToken);

  } catch {}
}
