/**
 * AuthScreen — Sifter LevelUp sign-in.
 *
 * First launch shows the brand intro carousel (once, gated by INTRO_SEEN_KEY),
 * then this login screen. Email/password is live (existing useAuth methods);
 * Google/Apple are stubbed pending backend OAuth (TODO(levelup-oauth)). Guest
 * lands in Explore "browse everything" mode — no onboarding required.
 *
 * The previous Starknet / Base wallet / Telegram login surfaces were removed
 * per the LevelUp redesign. The underlying useAuth methods remain so embedded
 * wallet features can still run silently elsewhere.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/useAuth";
import { useTheme, Spacing, FontSize, Brand, INTRO_SEEN_KEY } from "../theme";
import { SifterButton } from "../components/ui";
import { LevelUpLogo } from "../components/brand/LevelUpLogo";
import { IntroCarousel } from "../components/brand/IntroCarousel";
import {
  AuthScaffold,
  AuthField,
  SocialRow,
  OrDivider,
  LegalFooter,
  ErrorNote,
  InfoNote,
} from "./auth/authShared";

const SOCIAL_SOON =
  "Google & Apple sign-in are coming soon — continue with email for now.";

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signInEmail, signInGuest } = useAuth();

  // 'loading' until we know whether the intro has been seen.
  const [intro, setIntro] = useState<"loading" | "show" | "done">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(INTRO_SEEN_KEY)
      .then((v) => setIntro(v ? "done" : "show"))
      .catch(() => setIntro("done"));
  }, []);

  const handleLogin = async () => {
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      await signInEmail(email, password);
      router.replace("/(tabs)/home");
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
      router.replace("/(tabs)/explore");
    } catch (e: any) {
      setError(e?.message || "Could not continue as guest.");
    } finally {
      setGuestBusy(false);
    }
  };

  if (intro === "loading") {
    return (
      <View style={[styles.splash, { backgroundColor: colors.bg }]}>
        <LevelUpLogo size={104} animated />
        <ActivityIndicator
          color={Brand.primary}
          style={{ marginTop: Spacing.xl }}
        />
      </View>
    );
  }

  if (intro === "show") {
    return <IntroCarousel onDone={() => setIntro("done")} />;
  }

  return (
    <AuthScaffold>
      <Text style={[styles.tagline, { color: colors.textSoft }]}>
        Every path. Every role. Every opportunity.
      </Text>

      <SocialRow onUnavailable={() => setInfo(SOCIAL_SOON)} />
      <OrDivider />

      <ErrorNote message={error} />
      <InfoNote message={info} />

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
          {guestBusy ? "Opening…" : "Explore as guest"}
        </Text>
      </TouchableOpacity>

      <LegalFooter action="continuing" />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: "center", justifyContent: "center" },
  tagline: {
    fontSize: FontSize.md,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
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
