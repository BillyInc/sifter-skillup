/**
 * AuthScreen — Sifter LevelUp sign-in.
 *
 * Email/password is live (existing useAuth methods). Guest lands in Explore
 * "browse everything" mode — no onboarding required. OAuth is intentionally
 * hidden until backend providers are live so auth has one trustworthy surface.
 *
 * The previous Starknet / Base wallet / Telegram login surfaces were removed
 * per the LevelUp redesign. The underlying useAuth methods remain so embedded
 * wallet features can still run silently elsewhere.
 */
import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useTheme, Spacing, FontSize, Brand } from "../theme";
import { SifterButton } from "../components/ui";
import {
  AuthScaffold,
  AuthField,
  LegalFooter,
  ErrorNote,
} from "./auth/authShared";

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signInEmail, signInGuest } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await signInEmail(email, password);
    } catch (e: any) {
      setError(e?.message || "Could not sign you in.");
    } finally {
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    setError("");
    setGuestBusy(true);
    try {
      await signInGuest();
    } catch (e: any) {
      setError(e?.message || "Could not continue as guest.");
    } finally {
      setGuestBusy(false);
    }
  };

  return (
    <AuthScaffold>
      <TouchableOpacity
        onPress={() => router.replace("/" as any)}
        hitSlop={8}
        style={styles.backLink}
      >
        <Text style={[styles.backText, { color: Brand.primaryDeep }]}>
          Back to landing
        </Text>
      </TouchableOpacity>

      <Text style={[styles.tagline, { color: colors.textSoft }]}>
        Every path. Every role. Clearer choices.
      </Text>

      <ErrorNote message={error} />

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
      />

      <TouchableOpacity
        style={styles.forgot}
        onPress={() => router.push("/(auth)/forgot-password")}
        hitSlop={8}
      >
        <Text style={[styles.forgotText, { color: Brand.primaryDeep }]}>
          Forgot password?
        </Text>
      </TouchableOpacity>

      <SifterButton
        label="Sign In"
        onPress={handleLogin}
        loading={busy}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
      />

      <View style={styles.row}>
        <Text style={[styles.muted, { color: colors.textMuted }]}>
          Don't have an account?
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          hitSlop={8}
        >
          <Text style={[styles.link, { color: Brand.primaryDeep }]}>
            Create account →
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.guest}
        onPress={handleGuest}
        disabled={guestBusy}
        hitSlop={8}
      >
        <Text style={[styles.guestText, { color: colors.textSoft }]}>
          {guestBusy ? "Opening..." : "Browse as guest"}
        </Text>
      </TouchableOpacity>

      <LegalFooter action="continuing" />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontSize: FontSize.md,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  backLink: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { fontSize: FontSize.sm, fontWeight: "800" },
  forgot: { alignSelf: "flex-end", paddingVertical: 4 },
  forgotText: { fontSize: FontSize.sm, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  muted: { fontSize: FontSize.sm },
  link: { fontSize: FontSize.sm, fontWeight: "800" },
  guest: {
    alignSelf: "center",
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  guestText: { fontSize: FontSize.md, fontWeight: "700" },
});
