/**
 * Account/device-scoped offline storage for career intelligence.
 *
 * Career payloads and pending mutations are encrypted with AES-256-GCM. The
 * key is kept in SecureStore on native and the account/install namespace is
 * part of both the storage key and authenticated data, so one account cannot
 * read another account's cached path or replay its queue on this install.
 */
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  AESEncryptionKey,
  AESKeySize,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync,
} from "expo-crypto";
import { Buffer } from "@craftzdog/react-native-buffer";
import { API_BASE, API } from "./api";
import { getOrCreateDeviceId } from "./deviceId";

const CACHE_PREFIX = "@sifter_career_cache_v2_";
const QUEUE_PREFIX = "@sifter_career_write_queue_v2_";
const KEY_PREFIX = "sifter_career_aes_v2_";
const MAX_QUEUE_SIZE = 1000;
const IS_WEB = Platform.OS === "web";

let activeUserId: string | null = null;
let activeDeviceId: string | null = null;
let encryptionKeyPromise: Promise<AESEncryptionKey | null> | null = null;

interface CacheEntry<T> {
  value: T;
  ts: number;
  ttl: number;
}

function storagePart(value: string): string {
  return encodeURIComponent(value).replace(/%/g, "_");
}

function activeNamespace(): string | null {
  if (!activeUserId || !activeDeviceId) return null;
  return `${storagePart(activeUserId)}_${storagePart(activeDeviceId)}`;
}

function cacheStorageKey(key: string): string | null {
  const namespace = activeNamespace();
  return namespace ? `${CACHE_PREFIX}${namespace}_${storagePart(key)}` : null;
}

function queueStorageKey(): string | null {
  const namespace = activeNamespace();
  return namespace ? `${QUEUE_PREFIX}${namespace}` : null;
}

function encryptionKeyStorageKey(): string | null {
  const namespace = activeNamespace();
  return namespace ? `${KEY_PREFIX}${namespace}` : null;
}

async function getEncryptionKey(): Promise<AESEncryptionKey | null> {
  if (!activeNamespace()) return null;
  if (!encryptionKeyPromise) {
    encryptionKeyPromise = (async () => {
      const storageKey = encryptionKeyStorageKey();
      if (!storageKey) return null;
      try {
        const encoded = IS_WEB
          ? await AsyncStorage.getItem(storageKey)
          : await SecureStore.getItemAsync(storageKey);
        if (encoded) return AESEncryptionKey.import(encoded, "base64");

        const key = await AESEncryptionKey.generate(AESKeySize.AES256);
        const exported = await key.encoded("base64");
        if (IS_WEB) await AsyncStorage.setItem(storageKey, exported);
        else await SecureStore.setItemAsync(storageKey, exported);
        return key;
      } catch {
        // Never fall back to plaintext career storage.
        return null;
      }
    })();
  }
  return encryptionKeyPromise;
}

async function encryptJson(value: unknown, associatedData: string): Promise<string | null> {
  const key = await getEncryptionKey();
  if (!key) return null;
  try {
    const sealed = await aesEncryptAsync(
      Buffer.from(JSON.stringify(value), "utf8"),
      key,
      { additionalData: Buffer.from(associatedData, "utf8") },
    );
    return JSON.stringify({ version: 1, combined: await sealed.combined("base64") });
  } catch {
    return null;
  }
}

async function decryptJson<T>(raw: string, associatedData: string): Promise<T | null> {
  const key = await getEncryptionKey();
  if (!key) return null;
  try {
    const envelope = JSON.parse(raw) as { version?: number; combined?: string };
    if (envelope.version !== 1 || !envelope.combined) return null;
    const sealed = AESSealedData.fromCombined(envelope.combined);
    const plaintext = await aesDecryptAsync(sealed, key, {
      output: "bytes",
      additionalData: Buffer.from(associatedData, "utf8"),
    });
    return JSON.parse(Buffer.from(plaintext).toString("utf8")) as T;
  } catch {
    return null;
  }
}

/** Select the account and installation namespace used by career offline data. */
export async function setCareerCacheIdentity(userId: string | null): Promise<void> {
  const nextUserId = userId?.trim() || null;
  if (nextUserId && activeUserId === nextUserId && activeDeviceId) return;
  if (activeUserId) await clearCareerCacheUserState();
  activeUserId = nextUserId;
  activeDeviceId = nextUserId ? await getOrCreateDeviceId().catch(() => null) : null;
  encryptionKeyPromise = null;
}

/** Remove encrypted career cache, queued mutations and the account key. */
export async function clearCareerCacheUserState(): Promise<void> {
  const namespace = activeNamespace();
  const keyStorageKey = encryptionKeyStorageKey();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const remove = keys.filter((key) =>
      Boolean(namespace && (key.startsWith(`${CACHE_PREFIX}${namespace}_`) || key === `${QUEUE_PREFIX}${namespace}`)),
    );
    if (remove.length) await AsyncStorage.multiRemove(remove);
  } catch {}
  if (keyStorageKey) {
    try {
      if (IS_WEB) await AsyncStorage.removeItem(keyStorageKey);
      else await SecureStore.deleteItemAsync(keyStorageKey);
    } catch {}
  }
  activeUserId = null;
  activeDeviceId = null;
  encryptionKeyPromise = null;
}

/** Read a fresh encrypted cached value; returns null if missing or expired. */
export async function getCached<T>(key: string): Promise<T | null> {
  return readCached<T>(key, false);
}

/** Read an encrypted value after its refresh TTL, for offline review. */
export async function getCachedStale<T>(key: string): Promise<T | null> {
  return readCached<T>(key, true);
}

async function readCached<T>(key: string, allowExpired: boolean): Promise<T | null> {
  const storageKey = cacheStorageKey(key);
  if (!storageKey) return null;
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return null;
    const entry = await decryptJson<CacheEntry<T>>(raw, storageKey);
    if (!entry || typeof entry.ts !== "number" || typeof entry.ttl !== "number") {
      await AsyncStorage.removeItem(storageKey).catch(() => {});
      return null;
    }
    if (!allowExpired && Date.now() - entry.ts > entry.ttl) return null;
    return entry.value;
  } catch {
    return null;
  }
}

/** Cache only an encrypted value; failure never writes plaintext. */
export async function setCached<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const storageKey = cacheStorageKey(key);
  if (!storageKey) return;
  try {
    const encrypted = await encryptJson({ value, ts: Date.now(), ttl: ttlMs }, storageKey);
    if (encrypted) await AsyncStorage.setItem(storageKey, encrypted);
  } catch {}
}

export interface WriteOp {
  id: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  createdAt: number;
}

export type QueuableOp = Omit<WriteOp, "id" | "createdAt">;

async function loadQueue(): Promise<WriteOp[]> {
  const storageKey = queueStorageKey();
  if (!storageKey) return [];
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = await decryptJson<WriteOp[]>(raw, storageKey);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: WriteOp[]): Promise<boolean> {
  const storageKey = queueStorageKey();
  if (!storageKey) return false;
  try {
    const encrypted = await encryptJson(queue, storageKey);
    if (!encrypted) return false;
    await AsyncStorage.setItem(storageKey, encrypted);
    return true;
  } catch {
    return false;
  }
}

/** Enqueue an authenticated-account write to replay later. */
export async function queueWrite(op: QueuableOp): Promise<WriteOp> {
  if (!activeNamespace()) throw new Error("CAREER_CACHE_IDENTITY_REQUIRED");
  const entry: WriteOp = {
    ...op,
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  };
  const queue = await loadQueue();
  queue.push(entry);
  const trimmed = queue.length > MAX_QUEUE_SIZE ? queue.slice(-MAX_QUEUE_SIZE) : queue;
  if (!(await saveQueue(trimmed))) throw new Error("CAREER_QUEUE_STORAGE_UNAVAILABLE");
  return entry;
}

/** Cancel an optimistic save before it has reached the server. */
export async function cancelQueuedSave(entityType: string, entityId: string): Promise<void> {
  const queue = await loadQueue();
  const remaining = queue.filter((op) => {
    if (op.endpoint !== "/api/career/saved" || op.method !== "POST") return true;
    const body = op.body as { entityType?: string; entityId?: string } | undefined;
    return body?.entityType !== entityType || body?.entityId !== entityId;
  });
  if (remaining.length !== queue.length) await saveQueue(remaining);
}

export async function pendingWrites(): Promise<number> {
  return (await loadQueue()).length;
}

/** Replay account-scoped writes when online; preserve auth failures for re-login. */
export async function flushQueue(): Promise<number> {
  if (!activeNamespace() || !activeDeviceId) return 0;
  const queue = await loadQueue();
  if (!queue.length) return 0;

  const token = await API.getToken().catch(() => null);
  if (!token) return 0;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Device-Id": activeDeviceId,
  };
  const remaining: WriteOp[] = [];
  let flushed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const op = queue[index];
    try {
      const res = await fetch(`${API_BASE}${op.endpoint}`, {
        method: op.method,
        headers: { ...headers, "Idempotency-Key": op.id },
        body: op.body != null ? JSON.stringify(op.body) : undefined,
      });
      if (res.ok || res.status === 409 || (res.status >= 400 && res.status < 500 && res.status !== 401 && res.status !== 403)) {
        flushed += 1;
      } else if (res.status === 401 || res.status === 403) {
        remaining.push(...queue.slice(index));
        break;
      } else {
        remaining.push(...queue.slice(index));
        break;
      }
    } catch {
      remaining.push(...queue.slice(index));
      break;
    }
  }
  await saveQueue(remaining);
  return flushed;
}

export async function clearQueue(): Promise<void> {
  const storageKey = queueStorageKey();
  if (!storageKey) return;
  try { await AsyncStorage.removeItem(storageKey); } catch {}
}
