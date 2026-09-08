/**
 * Sifter LevelUp - Shared Configuration
 * Single source of truth for app-wide constants.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

type RuntimeEnv = Record<string, string | undefined>;

// Metro provides process.env for native builds, while a browser does not have
// a process global. Keep the shared config safe in both runtimes; Vite can
// still inject EXPO_PUBLIC_* values when they are present.
const runtimeEnv: RuntimeEnv =
  typeof process !== 'undefined' && process.env
    ? (process.env as RuntimeEnv)
    : {};

// Uvicorn is started on IPv4 (0.0.0.0) in the local workflow. On Windows,
// `localhost` can resolve to ::1 first, producing an opaque Failed to fetch
// even while 127.0.0.1:8000 is healthy. An explicit env URL still wins.
const configuredApiUrl = runtimeEnv.EXPO_PUBLIC_API_URL?.trim() || 'http://127.0.0.1:8000';

function deployedWebApiUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname.toLowerCase();
  if (host === 'dev.levelup.com.ng') return 'https://api.dev.levelup.com.ng';
  if (host === 'levelup.com.ng' || host === 'www.levelup.com.ng') {
    return 'https://api.levelup.com.ng';
  }
  return null;
}

/**
 * A native app cannot reach the host machine through its own localhost. Expo
 * exposes the Metro host while developing, so use that host when the default
 * local API URL is configured. Web keeps localhost because the browser and
 * backend normally run on the same machine in local development.
 */
function resolveApiBase(): string {
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiUrl);
  // A static web build may retain the local development default when it is
  // deployed without the CI environment variable. In that case, localhost
  // means the visitor's computer, which produces the misleading "failed to
  // fetch" error on admin onboarding. Use the documented API host for the
  // current LevelUp domain, while preserving localhost for local web testing.
  if (Platform.OS === 'web') {
    return (deployedWebApiUrl() ?? configuredApiUrl).replace(/\/$/, '');
  }
  if (!isLocalhost) return configuredApiUrl.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null)?.extra?.expoGo?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return host ? `http://${host}:8000` : configuredApiUrl.replace(/\/$/, '');
}

export const API_BASE = resolveApiBase();

export const PRIVY_APP_ID = runtimeEnv.EXPO_PUBLIC_PRIVY_APP_ID || '';
export const PRIVY_CLIENT_ID = runtimeEnv.EXPO_PUBLIC_PRIVY_CLIENT_ID || '';
export const PRIVY_WEB_CLIENT_ID =
  runtimeEnv.EXPO_PUBLIC_PRIVY_WEB_CLIENT_ID || PRIVY_CLIENT_ID;
export const PRIVY_NATIVE_CLIENT_ID =
  runtimeEnv.EXPO_PUBLIC_PRIVY_NATIVE_CLIENT_ID || PRIVY_CLIENT_ID;

export const PRIVY_CONFIGURED =
  PRIVY_APP_ID.length > 0 && PRIVY_APP_ID !== 'your_privy_app_id_here';
export const PRIVY_ENABLED = PRIVY_CONFIGURED;
export const PRIVY_NATIVE_ENABLED = PRIVY_CONFIGURED && Platform.OS !== 'web';
export const PRIVY_WEB_ENABLED = PRIVY_CONFIGURED && Platform.OS === 'web';

if (!PRIVY_CONFIGURED) {
  console.warn('Privy not configured - set EXPO_PUBLIC_PRIVY_APP_ID to enable live Starknet auth.');
}
