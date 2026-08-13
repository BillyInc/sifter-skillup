import AsyncStorage from '@react-native-async-storage/async-storage';

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
