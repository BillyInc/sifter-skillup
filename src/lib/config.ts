/**
 * Sifter Skill_Up — Shared Configuration
 * Single source of truth for app-wide constants.
 */

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";

if (!PRIVY_APP_ID) {
  console.warn('EXPO_PUBLIC_PRIVY_APP_ID not set — Privy wallet features disabled');
}