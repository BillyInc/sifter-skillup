export const PRIVY_APP_ID = process.env.EXPO_PUBLIC_PRIVY_APP_ID || "";

if (!PRIVY_APP_ID) {
  console.warn("EXPO_PUBLIC_PRIVY_APP_ID not set — Privy wallet features disabled");
}

export const privyConfig = {
  appId: PRIVY_APP_ID,
};
