/**
 * Sifter Skill_Up — Shared Configuration
 * Single source of truth for app-wide constants.
 */

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";
export const PRIVY_CLIENT_ID = process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || "";

// Privy appId is required; clientId is optional per @privy-io/expo SDK.
export const PRIVY_CONFIGURED =
  PRIVY_APP_ID.length > 0 && PRIVY_APP_ID !== 'your_privy_app_id_here';

if (!PRIVY_CONFIGURED) {
  console.warn('Privy not configured — set EXPO_PUBLIC_PRIVY_APP_ID. Starknet auth will fall back to demo path until a real key is in place.');
}