import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme, Brand, CompassFonts, FontSize, Radius, Spacing } from "../theme";
import { useAuth } from "../hooks/useAuth";
import { API } from "../lib/api";
import { isCurrentLegalAcceptance, PRIVACY_VERSION, TERMS_VERSION } from "../lib/legal";
import { SifterButton } from "./ui";
import TermsScreen from "../screens/TermsScreen";
import PrivacyScreen from "../screens/PrivacyScreen";

/** Blocks authenticated non-guest accounts until a changed legal version is reviewed. */
export default function LegalAcceptanceGate() {
  const { colors } = useTheme();
  const { user, refreshUser, signOut } = useAuth();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<"terms" | "privacy" | null>(null);

  useEffect(() => {
    const shouldCheck = Boolean(user?.id && user.auth_provider !== "guest");
    if (!shouldCheck) {
      setVisible(false);
      setTermsRead(false);
      setPrivacyRead(false);
      return;
    }
    setTermsRead(false);
    setPrivacyRead(false);
    setAnalytics(Boolean(user?.settings?.legalAcceptance?.analyticsConsent));
    setVisible(!isCurrentLegalAcceptance(user?.settings?.legalAcceptance));
  }, [user?.auth_provider, user?.id, user?.settings]);

  const accept = async () => {
    if (!checked || busy) return;
    setBusy(true);
    setError(null);
    try {
      await API.recordLegalAcceptance({
        termsVersion: TERMS_VERSION,
        privacyVersion: PRIVACY_VERSION,
        analyticsConsent: analytics,
      });
      // Close the blocking layer as soon as the server confirms the write.
      // Refreshing the profile is still useful, but must not leave the user
      // staring at a modal while a secondary profile request is in flight.
      setVisible(false);
      await refreshUser();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your legal acceptance. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    try {
      // This is the only safe dismissal: the account remains protected, but
      // the user can always return to sign-in instead of being trapped behind
      // a non-dismissible modal.
      await signOut();
      setVisible(false);
    } finally {
      setLeaving(false);
    }
  };

  if (!visible) return null;

  const documentsRead = termsRead && privacyRead;
  const openOrAcceptAgreement = () => {
    if (!termsRead) {
      setPage("terms");
      return;
    }
    if (!privacyRead) {
      setPage("privacy");
      return;
    }
    setChecked((value) => !value);
  };

  return (
    <>
      <Modal visible transparent animationType="fade" onRequestClose={leave}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <ScrollView contentContainerStyle={styles.body}>
            <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>UPDATED LEGAL TERMS</Text>
            <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Review before continuing</Text>
            <Text style={[styles.copy, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Our Terms and Privacy Policy have changed. Review the current versions before using account features. Optional analytics remains off unless you choose it.
            </Text>
            <View style={styles.links}>
              <Pressable onPress={() => setPage("terms")}><Text style={[styles.link, { color: colors.accentRole.action }]}>{termsRead ? "✓ Terms read" : "Read Terms"}</Text></Pressable>
              <Pressable onPress={() => setPage("privacy")}><Text style={[styles.link, { color: colors.accentRole.action }]}>{privacyRead ? "✓ Privacy Policy read" : "Read Privacy Policy"}</Text></Pressable>
            </View>
            <Text style={[styles.readHint, { color: colors.textRole.muted }, CompassFonts.body]}>
              {checked
                ? "Required terms accepted. Analytics is optional."
                : documentsRead
                  ? "Both documents read. Tap the agreement line to accept."
                  : "Tap the agreement line to read the Terms and Privacy Policy."}
            </Text>
            <Pressable onPress={openOrAcceptAgreement} style={[styles.checkRow, { opacity: documentsRead ? 1 : 0.75 }]} accessibilityRole="checkbox" accessibilityState={{ checked }}>
              <View style={[styles.checkbox, { borderColor: checked ? Brand.primary : colors.borderRole.subtle, backgroundColor: checked ? Brand.primary : "transparent" }]}>
                {checked ? <Text style={styles.tick}>✓</Text> : null}
              </View>
              <Text style={[styles.copy, { color: colors.textRole.secondary }, CompassFonts.body]}>I have read and agree to the current Terms and Privacy Policy.</Text>
            </Pressable>
            {checked ? (
              <View>
              <Pressable onPress={() => setAnalytics((value) => !value)} style={styles.checkRow} accessibilityRole="checkbox" accessibilityState={{ checked: analytics }}>
              <View style={[styles.checkbox, { borderColor: analytics ? Brand.primary : colors.borderRole.subtle, backgroundColor: analytics ? Brand.primary : "transparent" }]}>
                {analytics ? <Text style={styles.tick}>✓</Text> : null}
                </View>
                <Text style={[styles.copy, { color: colors.textRole.secondary }, CompassFonts.body]}>Allow anonymous product analytics (optional).</Text>
                <Text style={[styles.analyticsHint, { color: colors.textRole.muted }, CompassFonts.body]}>This helps us understand which screens are useful and where people get stuck. It is optional and separate from the required legal agreement.</Text>
              </Pressable>
              </View>
            ) : null}
            {error ? <Text style={[styles.copy, { color: colors.accentRole.danger }, CompassFonts.body]}>{error}</Text> : null}
            <SifterButton label={busy ? "Saving..." : "Accept and continue"} onPress={accept} disabled={!checked || !documentsRead || busy || leaving} loading={busy} variant="track" color={Brand.primary} size="lg" fullWidth />
            <Pressable
              onPress={leave}
              // Signing out must remain available even if the acceptance
              // request is stalled or the backend is unavailable.
              disabled={leaving}
              accessibilityRole="button"
              style={[styles.exitButton, { borderColor: colors.borderRole.subtle, opacity: leaving ? 0.55 : 1 }]}
            >
              <Text style={[styles.exitText, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>
                {leaving ? "Returning to sign in..." : "Sign out and return to sign in"}
              </Text>
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={page !== null} animationType="slide" onRequestClose={() => {}}>
        {page === "terms" ? (
          <TermsScreen
            requireExplicitConfirmation
            confirmLabel="I have read the Terms & Conditions"
            onClose={() => setPage(null)}
            onReadToEnd={() => {
              setTermsRead(true);
              setPage("privacy");
            }}
          />
        ) : (
          <PrivacyScreen
            requireExplicitConfirmation
            confirmLabel="I have read the Privacy Policy"
            onClose={() => setPage(null)}
            onReadToEnd={() => {
              setPrivacyRead(true);
              setPage(null);
            }}
          />
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center", padding: Spacing.lg },
  card: { width: "100%", maxWidth: 520, maxHeight: "88%", borderWidth: 1, borderRadius: Radius.xl, overflow: "hidden" },
  body: { padding: Spacing.xl, gap: Spacing.md },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 1 },
  title: { fontSize: FontSize.xl },
  copy: { fontSize: FontSize.sm, lineHeight: 20, flex: 1 },
  links: { flexDirection: "row", gap: Spacing.lg, flexWrap: "wrap" },
  link: { fontSize: FontSize.sm, fontWeight: "800", textDecorationLine: "underline" },
  readHint: { fontSize: FontSize.xs, lineHeight: 18 },
  analyticsHint: { fontSize: FontSize.xs, lineHeight: 18, marginLeft: 34 },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: Radius.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tick: { color: "#fff", fontWeight: "900" },
  exitButton: { minHeight: 48, borderWidth: 1, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  exitText: { fontSize: FontSize.sm },
});
