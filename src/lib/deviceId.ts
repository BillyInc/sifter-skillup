/**
 * deviceId — the stable per-install identifier sent as `X-Device-Id`.
 *
 * Lives in its own module rather than in offlineStorage because `api.ts` needs
 * it on every authenticated request, and offlineStorage pulls in
 * `@react-native-community/netinfo` and the whole sync/queue stack. Importing
 * that from the core request path would put a native module on the critical
 * path of the very first API call (and it immediately broke the api tests,
 * which is how the coupling showed up).
 *
 * Dependencies here are limited to storage and crypto — no netinfo, no queue.
 * offlineStorage re-exports this so there is exactly one device id per install.
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

export const DEVICE_ID_KEY = 'sifter_device_id_v2';

const IS_WEB = Platform.OS === 'web';

function isWebStorageAvailable() {
  return (
    IS_WEB &&
    typeof window !== 'undefined' &&
    typeof window.localStorage !== 'undefined'
  );
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

/**
 * Returns the device id, creating and persisting one on first call.
 *
 * SecureStore is preferred on native (survives app data clears less easily and
 * is not readable by other apps); web falls back to localStorage/AsyncStorage,
 * since SecureStore has no web implementation.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  try {
    if (!IS_WEB) {
      const secureId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      if (secureId) return secureId;
    }
  } catch {}

  const storedId = await getStoredString(DEVICE_ID_KEY);
  if (storedId) return storedId;

  let digest: string;
  try {
    digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}_${Math.random()}`,
    );
  } catch {
    digest = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }
  const prefix = IS_WEB ? 'web' : 'dev';
  const nextId = `${prefix}_${digest.slice(0, 24)}`;

  try {
    if (!IS_WEB) {
      await SecureStore.setItemAsync(DEVICE_ID_KEY, nextId);
    }
  } catch {}

  await setStoredString(DEVICE_ID_KEY, nextId);
  return nextId;
}
