/**
 * SignUpScreen — create a Sifter LevelUp account.
 * Email/password live via useAuth.signUpEmail.
 * On success → onboarding (AccountTypeGate → persona setup).
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, Spacing, FontSize, Brand, CompassFonts } from "@/theme";
import { SifterButton } from "@/components/ui";
import {
  AuthScaffold,
  AuthField,
  LegalFooter,
  ErrorNote,
  TermsModal,
} from "./auth/authShared";

export default function SignUpScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signUpEmail } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);

  const handleCreate = async () => {
    setError("");
    if (!email || !password) {
      setError("Enter your email and a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const username =
        [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;
      await signUpEmail(email, password, username);
      router.replace("/(auth)/onboarding");
    } catch (e: any) {
      setError(e?.message || "Could not create your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold>
      <TouchableOpacity
        style={styles.back}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Create your account
      </Text>

      <ErrorNote message={error} />

      <View style={styles.nameRow}>
        <View style={{ flex: 1 }}>
          <AuthField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Chidi"
            autoFocus
          />
        </View>
        <View style={{ flex: 1 }}>
          <AuthField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Okafor"
          />
        </View>
      </View>

      <AuthField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <AuthField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secure
        placeholder="••••••••"
        hint="At least 8 characters"
      />

      <SifterButton
        label="Create Account →"
        onPress={handleCreate}
        loading={busy}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
      />

      <View style={styles.row}>
        <Text style={[styles.muted, { color: colors.textRole.muted }, CompassFonts.body]}>
          Already have an account?
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)")} hitSlop={8}>
          <Text style={[styles.link, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
            Sign in
          </Text>
        </TouchableOpacity>
      </View>

      <LegalFooter action="creating an account" onShowTerms={() => setShowTerms(true)} />

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { fontSize: FontSize.md },
  title: {
    fontSize: FontSize.xxl,
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  nameRow: { flexDirection: "row", gap: Spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  muted: { fontSize: FontSize.sm },
  link: { fontSize: FontSize.sm },
});
