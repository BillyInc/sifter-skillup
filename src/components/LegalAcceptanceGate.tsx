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
  const { user, refreshUser } = useAuth();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<"terms" | "privacy" | null>(null);

  useEffect(() => {
    const shouldCheck = Boolean(user?.id && user.auth_provider !== "guest");
    if (!shouldCheck) {
      setVisible(false);
      return;
    }
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
      await refreshUser();
      setVisible(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your legal acceptance. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <ScrollView contentContainerStyle={styles.body}>
            <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>UPDATED LEGAL TERMS</Text>
            <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Review before continuing</Text>
            <Text style={[styles.copy, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Our Terms and Privacy Policy have changed. Review the current versions before using account features. Optional analytics remains off unless you choose it.
            </Text>
            <View style={styles.links}>
              <Pressable onPress={() => setPage("terms")}><Text style={[styles.link, { color: colors.accentRole.action }]}>Read Terms</Text></Pressable>
              <Pressable onPress={() => setPage("privacy")}><Text style={[styles.link, { color: colors.accentRole.action }]}>Read Privacy Policy</Text></Pressable>
            </View>
            <Pressable onPress={() => setChecked((value) => !value)} style={styles.checkRow} accessibilityRole="checkbox" accessibilityState={{ checked }}>
              <View style={[styles.checkbox, { borderColor: checked ? Brand.primary : colors.borderRole.subtle, backgroundColor: checked ? Brand.primary : "transparent" }]}>
                {checked ? <Text style={styles.tick}>✓</Text> : null}
              </View>
              <Text style={[styles.copy, { color: colors.textRole.secondary }, CompassFonts.body]}>I have read and agree to the current Terms and Privacy Policy.</Text>
            </Pressable>
            <Pressable onPress={() => setAnalytics((value) => !value)} style={styles.checkRow} accessibilityRole="checkbox" accessibilityState={{ checked: analytics }}>
              <View style={[styles.checkbox, { borderColor: analytics ? Brand.primary : colors.borderRole.subtle, backgroundColor: analytics ? Brand.primary : "transparent" }]}>
                {analytics ? <Text style={styles.tick}>✓</Text> : null}
              </View>
              <Text style={[styles.copy, { color: colors.textRole.secondary }, CompassFonts.body]}>Allow anonymous product analytics (optional).</Text>
            </Pressable>
            {error ? <Text style={[styles.copy, { color: colors.accentRole.danger }, CompassFonts.body]}>{error}</Text> : null}
            <SifterButton label={busy ? "Saving..." : "Accept and continue"} onPress={accept} disabled={!checked || busy} loading={busy} variant="track" color={Brand.primary} size="lg" fullWidth />
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={page !== null} animationType="slide" onRequestClose={() => setPage(null)}>
        {page === "terms" ? <TermsScreen onClose={() => setPage(null)} /> : <PrivacyScreen onClose={() => setPage(null)} />}
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
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: Radius.sm, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  tick: { color: "#fff", fontWeight: "900" },
});
