/**
 * Signup route.
 *
 * Wraps the existing SignUpScreen with a one-time legal gate (Phase 13):
 *  - a REQUIRED Terms & Conditions + Privacy Policy checkbox the user must tick
 *    before the account-creation form is reachable, and
 *  - an OPTIONAL analytics/privacy consent toggle (defaults off) whose choice is
 *    persisted so analytics can be gated on explicit consent.
 *
 * The pre-account acceptance is stored locally until signup records it against
 * the new account; later legal-version changes are enforced account-side.
 */
import React, { useCallback, useState } from "react";
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
import {
  clearLegalAcceptance,
  saveLegalAcceptance,
  TERMS_VERSION,
  PRIVACY_VERSION,
} from "../../src/lib/legal";
import { useFocusEffect } from "@react-navigation/native";

// Storage keys — analytics stays opt-IN and is read by the analytics layer.
// Acceptance is stored as versioned JSON and on the authenticated account.
export const TERMS_ACCEPTED_KEY = "@sifter_legal_acceptance_v2";

function CheckRow({
  checked,
  onToggle,
  disabled = false,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={styles.checkRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
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
      <Text style={[styles.checkLabel, { color: colors.textSoft, opacity: disabled ? 0.55 : 1 }]}>
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
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [legalPage, setLegalPage] = useState<"terms" | "privacy" | null>(null);

  useFocusEffect(
    useCallback(() => {
      // A pre-account acceptance belongs only to the current signup attempt.
      // Never let a prior user, browser session, refresh or abandoned attempt
      // bypass this gate for a new account.
      setAccepted(false);
      setTerms(false);
      setAnalytics(false);
      setTermsRead(false);
      setPrivacyRead(false);
      setLegalPage(null);
      setLoading(true);
      let active = true;
      void clearLegalAcceptance().finally(() => {
        if (active) setLoading(false);
      });

      return () => {
        active = false;
        // Consent not yet attached to an account must not survive leaving
        // signup and become implicit acceptance for another person.
        void clearLegalAcceptance();
      };
    }, []),
  );

  const onContinue = async () => {
    if (!terms || !termsRead || !privacyRead) return;
    await saveLegalAcceptance(analytics).catch(() => {});
    setAccepted(true);
  };

  const openOrAcceptAgreement = () => {
    if (!termsRead) {
      setLegalPage("terms");
      return;
    }
    if (!privacyRead) {
      setLegalPage("privacy");
      return;
    }
    setTerms((value) => !value);
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
        Review the current terms and privacy policy before creating an account.
        You can change optional analytics consent later.
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <CheckRow checked={terms} onToggle={openOrAcceptAgreement}>
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

        {terms ? (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <CheckRow
              checked={analytics}
              onToggle={() => setAnalytics((v) => !v)}
            >
              Help improve Sifter by sharing anonymous usage analytics.{" "}
              <Text style={{ color: colors.textMuted }}>(optional)</Text>
            </CheckRow>
            <Text style={[styles.analyticsHint, { color: colors.textMuted }]}>
              This helps us understand which screens are useful and where people get stuck. It is kept separate from your required account consent and is optional.
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.legalLinks}>
        <TouchableOpacity onPress={() => setLegalPage("terms")}>
          <Text style={[styles.legalLink, { color: Brand.primaryDeep }]}>
            {termsRead ? "✓ Terms read" : "Read Terms & Conditions"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLegalPage("privacy")}>
          <Text style={[styles.legalLink, { color: Brand.primaryDeep }]}>
            {privacyRead ? "✓ Privacy Policy read" : "Read Privacy Policy"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.readHint, { color: colors.textMuted }]}>
        {terms
          ? "Required terms accepted. Analytics is optional."
          : termsRead && privacyRead
            ? "Both documents read. Tap the agreement line to accept."
            : "Tap the agreement line to read the Terms and Privacy Policy."}
      </Text>

      <SifterButton
        label="Continue →"
        onPress={onContinue}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
        disabled={!terms || !termsRead || !privacyRead}
      />

      <Text style={[styles.fine, { color: colors.textMuted }]}>
        Terms {TERMS_VERSION} · Privacy {PRIVACY_VERSION}. You can change your analytics choice any time in Settings.
      </Text>
      <Modal visible={legalPage !== null} animationType="slide" onRequestClose={() => setLegalPage(null)}>
        {legalPage === "terms" ? (
          <TermsScreen
            onClose={() => setLegalPage(null)}
            onReadToEnd={() => {
              setTermsRead(true);
              setLegalPage("privacy");
            }}
          />
        ) : (
          <PrivacyScreen
            onClose={() => setLegalPage(null)}
            onReadToEnd={() => {
              setPrivacyRead(true);
              setLegalPage(null);
            }}
          />
        )}
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
  readHint: { fontSize: FontSize.xs, textAlign: "center", lineHeight: FontSize.xs * 1.5 },
});
