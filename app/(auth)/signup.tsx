/**
 * Signup route.
 *
 * Wraps the existing SignUpScreen with a one-time legal gate (Phase 13):
 *  - a REQUIRED Terms & Conditions + Privacy Policy checkbox the user must tick
 *    before the account-creation form is reachable, and
 *  - an OPTIONAL analytics/privacy consent toggle (defaults off) whose choice is
 *    persisted so analytics can be gated on explicit consent.
 *
 * Acceptance is stored in AsyncStorage, so returning users who already accepted
 * go straight to the form.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUpScreen from "../../src/screens/SignUpScreen";
import {
  useTheme,
  Spacing,
  FontSize,
  Radius,
  Brand,
  webContainer,
} from "../../src/theme";
import { SifterButton } from "../../src/components/ui";
import TermsScreen from "../../src/screens/TermsScreen";
import PrivacyScreen from "../../src/screens/PrivacyScreen";

// Storage keys — analytics stays opt-IN and is read by the analytics layer.
export const TERMS_ACCEPTED_KEY = "@sifter_terms_accepted_v1";
export const ANALYTICS_CONSENT_KEY = "@sifter_analytics_consent_v1";

function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? Brand.primary : colors.border,
            backgroundColor: checked ? Brand.primary : "transparent",
          },
        ]}
      >
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </View>
      <Text style={[styles.checkLabel, { color: colors.textSoft }]}>
        {children}
      </Text>
    </Pressable>
  );
}

export default function SignUpPage() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [terms, setTerms] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [legalPage, setLegalPage] = useState<"terms" | "privacy" | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(TERMS_ACCEPTED_KEY)
      .then((v) => {
        if (active) {
          setAccepted(v === "1");
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
  }, []);

  const onContinue = async () => {
    if (!terms) return;
    await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "1").catch(() => {});
    await AsyncStorage.setItem(
      ANALYTICS_CONSENT_KEY,
      analytics ? "1" : "0",
    ).catch(() => {});
    setAccepted(true);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={Brand.primary} />
      </View>

    );
  }

  // Already accepted (or just accepted) → the real signup form.
  if (accepted) return <SignUpScreen />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Before you begin
      </Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>
        A couple of quick agreements so you know how your data is used.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <CheckRow checked={terms} onToggle={() => setTerms((v) => !v)}>
          I agree to the{" "}
          <Text style={{ color: Brand.primaryDeep, fontWeight: "800" }}>
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text style={{ color: Brand.primaryDeep, fontWeight: "800" }}>
            Privacy Policy
          </Text>
          . <Text style={{ color: colors.red }}>(required)</Text>
        </CheckRow>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <CheckRow
          checked={analytics}
          onToggle={() => setAnalytics((v) => !v)}
        >
          Help improve Sifter by sharing anonymous usage analytics.{" "}
          <Text style={{ color: colors.textMuted }}>(optional)</Text>
        </CheckRow>
      </View>

      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => setLegalPage("terms")}>
          <Text style={[styles.legalLink, { color: Brand.primaryDeep }]}>Read Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLegalPage("privacy")}>
          <Text style={[styles.legalLink, { color: Brand.primaryDeep }]}>Read Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <SifterButton
        label="Continue →"
        onPress={onContinue}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
        disabled={!terms}
      />

      <Text style={[styles.fine, { color: colors.textMuted }]}>
        You can change your analytics choice any time in Settings.
      </Text>
      <Modal visible={legalPage !== null} animationType="slide" onRequestClose={() => setLegalPage(null)}>
        {legalPage === "terms" ? <TermsScreen onClose={() => setLegalPage(null)} /> : <PrivacyScreen onClose={() => setLegalPage(null)} />}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
    justifyContent: "center",
  },
  title: { fontSize: FontSize.xxl, fontWeight: "900", textAlign: "center" },
  lede: {
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  tick: { color: "#FFFFFF", fontSize: FontSize.sm, fontWeight: "900" },
  checkLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  divider: { height: 1, width: "100%" },
  fine: {
    fontSize: FontSize.xs,
    textAlign: "center",
    lineHeight: FontSize.xs * 1.5,
  },
  legalLinks: { flexDirection: "row", justifyContent: "center", gap: Spacing.lg, flexWrap: "wrap" },
  legalLink: { fontSize: FontSize.xs, fontWeight: "800" },
});
