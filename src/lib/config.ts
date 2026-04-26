/**
 * Sifter Skill_Up - Shared Configuration
 * Single source of truth for app-wide constants.
 */

import { Platform } from 'react-native';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

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
