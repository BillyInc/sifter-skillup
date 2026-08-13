/** Email/code/password reset flow for the login screen. */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, Brand, CompassFonts } from "@/theme";
import { SifterButton } from "@/components/ui";
import { API } from "@/lib/api";
import { AuthScaffold, AuthField, ErrorNote } from "./auth/authShared";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const requestCode = async () => {
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setBusy(true);
    try {
      const result = await API.requestPasswordResetCode(email.trim());
      setDevCode(result.devCode ?? "");
      setSent(true);
      setCooldown(60);
    } catch (e: any) {
      setError(e?.message || "Could not send a reset code.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setError("");
    if (!code.trim()) {
      setError("Enter the reset code.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await API.confirmPasswordReset(email.trim(), code.trim(), password);
      router.replace("/(auth)/sign-in");
    } catch (e: any) {
      const message = String(e?.message || "");
      setError(/invalid reset code/i.test(message) ? "That code is not correct. Check it and try again." : message || "Could not reset your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScaffold showLogo={!sent}>
      <TouchableOpacity style={styles.back} onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8}>
        <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>Back</Text>
      </TouchableOpacity>

      {!sent ? (
        <>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Reset your password</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }, CompassFonts.body]}>Enter your email and we will send you a reset code.</Text>
          <ErrorNote message={error} />
          <AuthField label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" autoFocus />
          <SifterButton label="Send reset code" onPress={requestCode} loading={busy} variant="track" color={Brand.primary} size="lg" fullWidth />
        </>
      ) : (
        <>
          <Text style={styles.check}>OK</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Choose a new password</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }, CompassFonts.body]}>Enter the code sent to {email}.</Text>
          <ErrorNote message={error} />
          <AuthField label="Reset code" value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="123456" hint={devCode ? `Development code: ${devCode}` : "Enter the code from your email"} />
          <AuthField label="New password" value={password} onChangeText={setPassword} secure placeholder="At least 6 characters" />
          <AuthField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secure placeholder="Repeat your password" />
          <SifterButton label="Set new password" onPress={confirm} loading={busy} variant="track" color={Brand.primary} size="lg" fullWidth />
          <SifterButton label={cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"} onPress={requestCode} disabled={cooldown > 0 || busy} variant="ghost" size="lg" fullWidth />
        </>
      )}

      {sent ? (
        <TouchableOpacity style={styles.row} onPress={() => router.replace("/(auth)/sign-in")} hitSlop={8}>
          <Text style={[styles.link, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>Back to sign in</Text>
        </TouchableOpacity>
      ) : null}
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { fontSize: FontSize.md },
  title: { fontSize: FontSize.xxl, textAlign: "center", marginBottom: Spacing.xs },
  body: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5, textAlign: "center", marginBottom: Spacing.sm },
  check: { fontSize: FontSize.lg, textAlign: "center", fontWeight: "900" },
  row: { alignSelf: "center", paddingVertical: Spacing.sm },
  link: { fontSize: FontSize.md },
});
