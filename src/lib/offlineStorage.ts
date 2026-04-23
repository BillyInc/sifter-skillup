import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const PROGRESS_KEY = 'ss_progress_v2';
const POSITION_KEY = 'ss_last_position_v2';
const QUEUE_KEY = 'ss_sync_queue_v2';
const MANIFEST_KEY = 'ss_content_manifest_v2';
const TRACK_CONTENT_PREFIX = 'ss_track_content_v2:';
const DEVICE_ID_KEY = 'sifter_device_id_v2';

const PRIORITY_ORDER = {
  critical: 0,
  high: 1,
  normal: 2,
} as const;

let syncing = false;
let netUnsub: (() => void) | null = null;
let syncListeners: Array<(pending: number) => void> = [];

interface StoredProgress {
  userId: string;
  completedLevels: string[];
  currentTrack: string;
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
  lastPosition: LastPosition | null;
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

export interface LastPosition {
  trackId: string;
  trackName: string;
  level: string;
  labId: string;
  labTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonIndex: number;
  labIndex: number;
  simulatorState?: { type: string; phase: string; attemptNumber: number } | null;
  savedAt: string;
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

function isWebStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

async function getStoredString(key: string): Promise<string | null> {
  if (isWebStorageAvailable()) {
    try {
      return window.localStorage.getItem(key);
    } catch {}
  }

  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function setStoredString(key: string, value: string): Promise<void> {
  if (isWebStorageAvailable()) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {}
  }

  try {
    await AsyncStorage.setItem(key, value);
  } catch {}
}

async function removeStoredString(key: string): Promise<void> {
  if (isWebStorageAvailable()) {
    try {
      window.localStorage.removeItem(key);
      return;
    } catch {}
  }

  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

async function getStoredJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getStoredString(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setStoredJson(key: string, value: unknown): Promise<void> {
  await setStoredString(key, JSON.stringify(value));
}

function unwrapData(payload: any) {
  return payload?.data ?? payload;
}

function isNetworkAvailable(state: { isConnected?: boolean | null; isInternetReachable?: boolean | null }) {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

function trackContentKey(trackId: string) {
  return `${TRACK_CONTENT_PREFIX}${trackId}`;
}

function emptyStoredProgress(): StoredProgress {
  return {
    userId: '',
    completedLevels: [],
    currentTrack: '',
    xp: 0,
    streak: 0,
    lastActiveDate: new Date().toISOString(),
    achievements: [],
    portfolioArtifacts: [],
    guildId: null,
    referralCode: null,
    settings: {},
    updatedAt: new Date().toISOString(),
  };
}

function emptyProgress(): LocalProgress {
  return {
    ...emptyStoredProgress(),
    lastPosition: null,
  };
}

async function getStoredProgress(): Promise<StoredProgress> {
  const stored = await getStoredJson<Partial<StoredProgress> | null>(PROGRESS_KEY, null);
  if (!stored) return emptyStoredProgress();

  return {
    ...emptyStoredProgress(),
    ...stored,
    completedLevels: Array.isArray(stored.completedLevels) ? stored.completedLevels : [],
    achievements: Array.isArray(stored.achievements) ? stored.achievements : [],
    portfolioArtifacts: Array.isArray(stored.portfolioArtifacts) ? stored.portfolioArtifacts : [],
    settings: stored.settings ?? {},
  };
}

function normaliseLastPosition(raw: any): LastPosition | null {
  if (!raw || typeof raw !== 'object') return null;

  return {
    trackId: String(raw.trackId ?? raw.track_id ?? ''),
    trackName: String(raw.trackName ?? raw.track_name ?? ''),
    level: String(raw.level ?? ''),
    labId: String(raw.labId ?? raw.lab_id ?? ''),
    labTitle: String(raw.labTitle ?? raw.lab_title ?? ''),
    lessonId: String(raw.lessonId ?? raw.lesson_id ?? ''),
    lessonTitle: String(raw.lessonTitle ?? raw.lesson_title ?? ''),
    lessonIndex: Number(raw.lessonIndex ?? raw.lesson_index ?? 0),
    labIndex: Number(raw.labIndex ?? raw.lab_index ?? 0),
    simulatorState: raw.simulatorState ?? raw.simulator_state ?? null,
    savedAt: String(raw.savedAt ?? raw.saved_at ?? new Date().toISOString()),
  };
}

function normaliseServerProgress(userId: string, raw: any): LocalProgress {
  const position = normaliseLastPosition(raw?.lastPosition ?? raw?.last_position);

  return {
    ...emptyProgress(),
    userId,
    completedLevels: Array.isArray(raw?.completedLevels)
      ? raw.completedLevels
      : Array.isArray(raw?.completed_levels)
        ? raw.completed_levels
        : [],
    currentTrack: String(
      raw?.currentTrack ??
      raw?.current_track ??
      raw?.current_track_id ??
      raw?.active_track ??
      '',
    ),
    lastPosition: position,
    xp: Number(raw?.xp ?? raw?.points ?? 0),
    streak: Number(raw?.streak ?? 0),
    lastActiveDate: String(raw?.lastActiveDate ?? raw?.last_active_date ?? new Date().toISOString()),
    achievements: Array.isArray(raw?.achievements) ? raw.achievements : [],
    portfolioArtifacts: Array.isArray(raw?.portfolioArtifacts)
      ? raw.portfolioArtifacts
      : Array.isArray(raw?.portfolio_artifacts)
        ? raw.portfolio_artifacts
        : [],
    guildId: raw?.guildId ?? raw?.guild_id ?? null,
    referralCode: raw?.referralCode ?? raw?.referral_code ?? null,
    settings: raw?.settings ?? {},
    updatedAt: String(raw?.updatedAt ?? raw?.updated_at ?? new Date().toISOString()),
  };
}

function sortQueue(items: SyncQueueItem[]) {
  return [...items].sort((a, b) => {
    const priorityDelta = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDelta !== 0) return priorityDelta;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function trimQueue(items: SyncQueueItem[]) {
  const normalItems = items
    .filter(item => item.priority === 'normal')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (normalItems.length <= 1500) return items;

  const toDrop = new Set(normalItems.slice(0, normalItems.length - 1500).map(item => item.id));
  return items.filter(item => !toDrop.has(item.id));
}

async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const queue = await getStoredJson<SyncQueueItem[]>(QUEUE_KEY, []);
  return Array.isArray(queue) ? queue : [];
}

async function setSyncQueue(queue: SyncQueueItem[]): Promise<void> {
  await setStoredJson(QUEUE_KEY, queue);
  notifyListeners(queue.length);
}

function notifyListeners(pending?: number) {
  if (typeof pending === 'number') {
    syncListeners.forEach(listener => listener(pending));
    return;
  }

  getPendingSyncCount().then(count => {
    syncListeners.forEach(listener => listener(count));
  });
}

async function parseJsonResponse(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function buildHeaders(getToken: () => Promise<string | null>) {
  const token = await getToken();
  const deviceId = await getOrCreateDeviceId();

  return {
    deviceId,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as Record<string, string>,
  };
}

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    if (!isWebStorageAvailable()) {
      const secureId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (secureId) return secureId;
    }
  } catch {}

  const storedId = await getStoredString(DEVICE_ID_KEY);
  if (storedId) return storedId;

  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}_${Math.random()}`,
  );
  const prefix = isWebStorageAvailable() ? 'web' : 'dev';
  const nextId = `${prefix}_${digest.slice(0, 24)}`;

  try {
    if (!isWebStorageAvailable()) {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, nextId);
    }
  } catch {}

  await setStoredString(DEVICE_ID_KEY, nextId);
  return nextId;
}

export async function saveProgressLocally(progress: Partial<LocalProgress>): Promise<void> {
  const existing = await getStoredProgress();

  const next: StoredProgress = {
    ...existing,
    userId: progress.userId ?? existing.userId,
    completedLevels: progress.completedLevels ?? existing.completedLevels,
    currentTrack: progress.currentTrack ?? existing.currentTrack,
    xp: progress.xp ?? existing.xp,
    streak: progress.streak ?? existing.streak,
    lastActiveDate: progress.lastActiveDate ?? existing.lastActiveDate,
    achievements: progress.achievements ?? existing.achievements,
    portfolioArtifacts: progress.portfolioArtifacts ?? existing.portfolioArtifacts,
    guildId: progress.guildId !== undefined ? progress.guildId : existing.guildId,
    referralCode: progress.referralCode !== undefined ? progress.referralCode : existing.referralCode,
    settings: progress.settings ? { ...existing.settings, ...progress.settings } : existing.settings,
    updatedAt: new Date().toISOString(),
  };

  await setStoredJson(PROGRESS_KEY, next);

  if ('lastPosition' in progress) {
    await saveLastPosition(progress.lastPosition ?? null);
  }
}

export async function getLocalProgress(): Promise<LocalProgress> {
  const stored = await getStoredProgress();
  const lastPosition = await getLastPosition();

  return {
    ...emptyProgress(),
    ...stored,
    lastPosition,
  };
}

export async function restoreProgressFromServer(serverProgress: LocalProgress): Promise<void> {
  await saveProgressLocally(serverProgress);
  if ('lastPosition' in serverProgress) {
    await saveLastPosition(serverProgress.lastPosition ?? null);
  }
}

export async function saveLastPosition(position: LastPosition | null): Promise<void> {
  if (!position) {
    await removeStoredString(POSITION_KEY);
    return;
  }

  const next = normaliseLastPosition(position);
  if (!next) return;
  await setStoredJson(POSITION_KEY, next);
}

export async function getLastPosition(): Promise<LastPosition | null> {
  const stored = await getStoredJson<any | null>(POSITION_KEY, null);
  return normaliseLastPosition(stored);
}

export async function getContentManifest(): Promise<ContentManifest | null> {
  const manifest = await getStoredJson<ContentManifest | null>(MANIFEST_KEY, null);
  if (!manifest || typeof manifest !== 'object' || !manifest.tracks) return null;
  return manifest;
}

export async function saveTrackContent(trackId: string, content: any, version: number): Promise<void> {
  const downloadedAt = new Date().toISOString();
  const raw = JSON.stringify(content);
  const sizeKb = Math.max(1, Math.round(raw.length / 1024));
  const currentManifest = (await getContentManifest()) ?? {
    version: 0,
    downloadedAt,
    tracks: {},
    totalSizeKb: 0,
  };

  const tracks = {
    ...currentManifest.tracks,
    [trackId]: {
      version,
      downloadedAt,
      sizeKb,
    },
  };

  const entries = Object.values(tracks);
  const totalSizeKb = entries.reduce((sum, entry) => sum + entry.sizeKb, 0);
  const latestVersion = entries.reduce((max, entry) => Math.max(max, entry.version), 0);
  const latestDownloadedAt = entries
    .slice()
    .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())[0]?.downloadedAt ?? downloadedAt;

  await setStoredJson(trackContentKey(trackId), content);
  await setStoredJson(MANIFEST_KEY, {
    version: latestVersion,
    downloadedAt: latestDownloadedAt,
    tracks,
    totalSizeKb,
  } satisfies ContentManifest);
}

export async function getTrackContent(trackId: string): Promise<any | null> {
  return getStoredJson<any | null>(trackContentKey(trackId), null);
}

export async function isTrackDownloaded(trackId: string): Promise<boolean> {
  const manifest = await getContentManifest();
  return Boolean(manifest?.tracks?.[trackId]);
}

export async function isTrackUpdateAvailable(trackId: string, serverVersion: number): Promise<boolean> {
  const manifest = await getContentManifest();
  const localVersion = manifest?.tracks?.[trackId]?.version;
  return typeof localVersion !== 'number' || localVersion < serverVersion;
}

export function onSyncUpdate(cb: (pending: number) => void) {
  syncListeners.push(cb);
  return () => {
    syncListeners = syncListeners.filter(listener => listener !== cb);
  };
}

export async function enqueueWrite(
  endpoint: string,
  method: SyncQueueItem['method'],
  body: any,
  priority: SyncQueueItem['priority'] = 'normal',
): Promise<void> {
  const queue = await getSyncQueue();
  const item: SyncQueueItem = {
    id: `sq_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    endpoint,
    method,
    body,
    priority,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  await setSyncQueue(trimQueue([...queue, item]));
}

export async function getPendingSyncCount(): Promise<number> {
  return (await getSyncQueue()).length;
}

export async function initOfflineStorage(
  apiBase: string,
  getToken: () => Promise<string | null>,
) {
  destroyOfflineStorage();

  netUnsub = NetInfo.addEventListener(async state => {
    if (isNetworkAvailable(state)) {
      await drainSyncQueue(apiBase, getToken);
    }
  });

  const net = await NetInfo.fetch();
  if (isNetworkAvailable(net)) {
    drainSyncQueue(apiBase, getToken).catch(() => {});
  }
}

async function drainQueueToServer(
  apiBase: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  if (syncing) return;
  syncing = true;

  try {
    const queue = sortQueue(await getSyncQueue());
    if (!queue.length) return;

    const { deviceId, headers } = await buildHeaders(getToken);
    const res = await fetch(`${apiBase}/api/sync/drain`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        device_id: deviceId,
        client_time: new Date().toISOString(),
        items: queue.map(item => ({
          id: item.id,
          priority: item.priority,
          endpoint: item.endpoint,
          method: item.method,
          body: item.body,
          created_at: item.createdAt,
          attempts: item.attempts,
          device_id: deviceId,
        })),
      }),
    });

    if (!res.ok) return;

    const payload = unwrapData(await parseJsonResponse(res));
    const results = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload)
        ? payload
        : [];

    if (!results.length) return;

    const byId = new Map(results.map((result: any) => [String(result.id), result]));
    const remaining: SyncQueueItem[] = [];

    for (const item of queue) {
      const result = byId.get(item.id);
      if (!result) {
        remaining.push(item);
        continue;
      }

      if (result.status === 'conflict' || result.status === 'retry') {
        remaining.push({
          ...item,
          attempts: item.attempts + 1,
        });
      }
    }

    await setSyncQueue(remaining);
  } finally {
    syncing = false;
  }
}

export async function drainSyncQueue(
  apiBase: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await drainQueueToServer(apiBase, getToken);
}

export function destroyOfflineStorage() {
  netUnsub?.();
  netUnsub = null;
}

export async function downloadTrackContent(
  trackId: string,
  apiBase: string,
  getToken: () => Promise<string | null>,
  onProgress?: (pct: number) => void,
): Promise<boolean> {
  try {
    const net = await NetInfo.fetch();
    if (!isNetworkAvailable(net)) return false;

    const { headers } = await buildHeaders(getToken);

    const versionRes = await fetch(`${apiBase}/api/content/${trackId}/version`, { headers });
    if (!versionRes.ok) return false;

    const versionPayload = unwrapData(await parseJsonResponse(versionRes));
    const version = Number(versionPayload?.version ?? 0);
    if (!Number.isFinite(version)) return false;

    if (!(await isTrackUpdateAvailable(trackId, version))) return true;

    onProgress?.(10);

    const contentRes = await fetch(`${apiBase}/api/content/${trackId}`, { headers });
    if (!contentRes.ok) return false;

    const contentPayload = unwrapData(await parseJsonResponse(contentRes));
    onProgress?.(60);

    await saveTrackContent(trackId, contentPayload, version);
    onProgress?.(100);
    return true;
  } catch {
    return false;
  }
}

export async function onLoginSync(
  userId: string,
  apiBase: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  try {
    const net = await NetInfo.fetch();
    if (!isNetworkAvailable(net)) return;

    const { headers } = await buildHeaders(getToken);

    const progressRes = await fetch(`${apiBase}/api/users/progress`, { headers });
    if (progressRes.ok) {
      const payload = unwrapData(await parseJsonResponse(progressRes));
      await restoreProgressFromServer(normaliseServerProgress(userId, payload));
    }

    const progress = await getLocalProgress();
    if (progress.currentTrack) {
      downloadTrackContent(progress.currentTrack, apiBase, getToken).catch(() => {});
    }

    await drainQueueToServer(apiBase, getToken);
  } catch {}
}
