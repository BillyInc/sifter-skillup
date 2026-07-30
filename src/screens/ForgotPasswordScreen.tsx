/**
 * ForgotPasswordScreen — request a reset link.
 *
 * Backend reset isn't wired yet (TODO(levelup-oauth)/reset). This screen owns
 * the full UX — email entry → confirmation state → 60s resend cooldown — and
 * will call the real Supabase/backend reset endpoint once available. For now it
 * optimistically shows the confirmation so the flow is testable end-to-end.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, Brand, CompassFonts } from "@/theme";
import { SifterButton } from "@/components/ui";
import { AuthScaffold, AuthField, ErrorNote } from "./auth/authShared";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async () => {
    setError("");
    if (!email) {
      setError("Enter your email address.");
      return;
    }
    setBusy(true);
    try {
      // TODO(levelup-reset): call Supabase resetPasswordForEmail / backend endpoint.
      await new Promise((r) => setTimeout(r, 400));
      setSent(true);
      setCooldown(60);
    } catch (e: any) {
      setError(e?.message || "Could not send the reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold showLogo={!sent}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>← Back</Text>
      </TouchableOpacity>

      {!sent ? (
        <>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
            Reset your password
          </Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Enter your email and we&apos;ll send you a reset link.
          </Text>
          <ErrorNote message={error} />
          <AuthField
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="you@example.com"
            autoFocus
          />
          <SifterButton
            label="Send Reset Link →"
            onPress={submit}
            loading={busy}
            variant="track"
            color={Brand.primary}
            size="lg"
            fullWidth
          />
        </>
      ) : (
        <>
          <Text style={styles.check}>✅</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
            Check your inbox
          </Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }, CompassFonts.body]}>
            We sent a reset link to {email}. It expires in 30 minutes.
          </Text>
          <SifterButton
            label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
            onPress={submit}
            disabled={cooldown > 0 || busy}
            variant="ghost"
            size="lg"
            fullWidth
          />
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.replace("/(auth)")}
            hitSlop={8}
          >
            <Text style={[styles.link, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
              Back to sign in
            </Text>
          </TouchableOpacity>
        </>
      )}
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
  body: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  check: { fontSize: 48, textAlign: "center" },
  row: { alignSelf: "center", paddingVertical: Spacing.sm },
  link: { fontSize: FontSize.md },
});
