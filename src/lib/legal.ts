import AsyncStorage from "@react-native-async-storage/async-storage";

// Bump this whenever the legal text or a material data-use practice changes.
// Old device-only acceptance values are intentionally not treated as valid.
export const TERMS_VERSION = "2026-08-14";
export const PRIVACY_VERSION = "2026-08-14";
export const LEGAL_ACCEPTANCE_KEY = "@sifter_legal_acceptance_v2";
const LEGACY_ANALYTICS_CONSENT_KEY = "@sifter_analytics_consent_v1";

// Supply these in the production Expo environment. Do not invent a registered
// Nigerian entity or postal address in product copy.
export const LEGAL_OPERATOR_NAME = (process.env.EXPO_PUBLIC_LEGAL_OPERATOR_NAME ?? "Sifter LevelUp").trim();
export const LEGAL_OPERATOR_ADDRESS = (process.env.EXPO_PUBLIC_LEGAL_OPERATOR_ADDRESS ?? "").trim();

export type LegalAcceptance = {
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  analyticsConsent: boolean;
};

export function isCurrentLegalAcceptance(value: Partial<LegalAcceptance> | null | undefined): boolean {
  return value?.termsVersion === TERMS_VERSION && value?.privacyVersion === PRIVACY_VERSION;
}

export async function getLegalAcceptance(): Promise<LegalAcceptance | null> {
  try {
    const raw = await AsyncStorage.getItem(LEGAL_ACCEPTANCE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<LegalAcceptance>;
    if (!isCurrentLegalAcceptance(value)) {
      return null;
    }
    if (typeof value.acceptedAt !== "string" || typeof value.analyticsConsent !== "boolean") {
      return null;
    }
    return value as LegalAcceptance;
  } catch {
    return null;
  }
}

export async function saveLegalAcceptance(analyticsConsent: boolean): Promise<LegalAcceptance> {
  const acceptance: LegalAcceptance = {
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
    acceptedAt: new Date().toISOString(),
    analyticsConsent,
  };
  await AsyncStorage.setItem(LEGAL_ACCEPTANCE_KEY, JSON.stringify(acceptance));
  // The old flag was device-global and could cross account boundaries. The
  // account-scoped server record is now authoritative.
  await AsyncStorage.removeItem(LEGACY_ANALYTICS_CONSENT_KEY).catch(() => {});
  return acceptance;
}

/** Clear an unconsumed pre-account acceptance when signup is abandoned. */
export async function clearLegalAcceptance(): Promise<void> {
  await AsyncStorage.removeItem(LEGAL_ACCEPTANCE_KEY);
  await AsyncStorage.removeItem(LEGACY_ANALYTICS_CONSENT_KEY).catch(() => {});
}
