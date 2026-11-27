import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordDeviceOwner } from './deviceOwner';

const KEY = '@levelup_session_profile_v1';

export async function getSavedSessionProfile<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function saveSessionProfile(profile: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
    // The saved profile is the signed-in account: record it as the device
    // owner too, so a session restored without a fresh sign-in has one.
    await recordDeviceOwner((profile as { id?: string | number } | null)?.id);
  } catch {
    // Session persistence is best-effort; the server remains authoritative.
  }
}

export async function clearSessionProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
