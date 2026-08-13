/**
 * Sifter LevelUp - Shared Configuration
 * Single source of truth for app-wide constants.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://localhost:8000';

/**
 * A native app cannot reach the host machine through its own localhost. Expo
 * exposes the Metro host while developing, so use that host when the default
 * local API URL is configured. Web keeps localhost because the browser and
 * backend normally run on the same machine in local development.
 */
function resolveApiBase(): string {
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiUrl);
  if (Platform.OS === 'web' || !isLocalhost) return configuredApiUrl.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null)?.extra?.expoGo?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return host ? `http://${host}:8000` : configuredApiUrl.replace(/\/$/, '');
}

export const API_BASE = resolveApiBase();

export const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || '';
export const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';
export const PRIVY_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_PRIVY_WEB_CLIENT_ID || PRIVY_CLIENT_ID;
export const PRIVY_NATIVE_CLIENT_ID =
  process.env.EXPO_PUBLIC_PRIVY_NATIVE_CLIENT_ID || PRIVY_CLIENT_ID;

export const PRIVY_CONFIGURED =
  PRIVY_APP_ID.length > 0 && PRIVY_APP_ID !== 'your_privy_app_id_here';
export const PRIVY_ENABLED = PRIVY_CONFIGURED;
export const PRIVY_NATIVE_ENABLED = PRIVY_CONFIGURED && Platform.OS !== 'web';
export const PRIVY_WEB_ENABLED = PRIVY_CONFIGURED && Platform.OS === 'web';

if (!PRIVY_CONFIGURED) {
  console.warn('Privy not configured - set EXPO_PUBLIC_PRIVY_APP_ID to enable live Starknet auth.');
}
