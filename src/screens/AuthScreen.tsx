/**
 * AuthScreen — Sifter LevelUp entry point.
 *
 * Multi-mode flow with redesign visual grammar:
 *   - CompassFonts (Hanken Grotesk) for all text
 *   - Semantic tokens: surface.*, textRole.*, borderRole.*, accentRole.*
 *   - Hairline borders, one accent per screen (Brand.primary for CTA only)
 *   - 4px grid spacing
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  webContainer,
  INTRO_SEEN_KEY,
  CompassFonts,
} from "@/theme";
import { useAuth } from "@/hooks/useAuth";
import { SifterButton } from "@/components/ui";
import { LevelUpLogo } from "@/components/brand/LevelUpLogo";
import { IntroCarousel } from "@/components/brand/IntroCarousel";
import {
  AuthField,
  LegalFooter,
  ErrorNote,
  TermsModal,
} from "@/screens/auth/authShared";

type Mode = "welcome" | "login" | "signup" | "connecting";

const { width: SCREEN_W } = Dimensions.get("window");
const IS_WEB_WIDE = Platform.OS === "web" && SCREEN_W >= 900;

export default function AuthScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { signInEmail, signUpEmail, signInGuest } = useAuth();

  const [intro, setIntro] = useState<"loading" | "show" | "done">("loading");
  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(INTRO_SEEN_KEY)
      .then((v) => setIntro(v ? "done" : "show"))
      .catch(() => setIntro("done"));
  }, []);

  useEffect(() => {
    if (intro === "done") {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }).start();
    }
  }, [intro, cardAnim]);

  if (intro === "loading") {
    return (
      <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <ActivityIndicator color={Brand.primary} size="large" />
      </View>
    );
  }

  if (intro === "show") {
    return <IntroCarousel onDone={() => setIntro("done")} />;
  }

  const routeToHome = () => {
    router.replace("/(tabs)/home");
  };

  const handleGuest = async () => {
    setError("");
    setGuestLoading(true);
    try {
      await signInGuest();
    } catch (e: any) {
      setError(e?.message || "Could not continue as guest.");
    } finally {
      setGuestLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setEmailLoading(true);
    try {
      await signInEmail(email, password);
      routeToHome();
    } catch (e: any) {
      setError(e?.message || "Could not sign you in.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!email || !password) {
      setError("Enter your email and a password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setEmailLoading(true);
    try {
      await signUpEmail(email, password, username || undefined);
      // Auth layout detects user && !onboarding_completed → redirects
    } catch (e: any) {
      setError(e?.message || "Could not create your account.");
    } finally {
      setEmailLoading(false);
    }
  };

  const goToWelcome = () => {
    setError("");
    setEmail("");
    setPassword("");
    setUsername("");
    setMode("welcome");
  };

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  // ─── Connecting spinner ───────────────────────────────────
  if (mode === "connecting") {
    return (
      <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <ActivityIndicator color={Brand.primary} size="large" />
        <Text
          style={[
            styles.connectingText,
            { color: colors.textRole.secondary },
            CompassFonts.bodyMedium,
          ]}
        >
          Signing you in...
        </Text>
      </View>
    );
  }

  // ─── Welcome landing ──────────────────────────────────────
  if (mode === "welcome") {
    const welcomeGradient: [string, string] = isDark
      ? ["#0B0B10", "#13100A"]
      : [colors.surface.base, colors.surface.subtle];

    return (
      <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <LinearGradient
          colors={welcomeGradient}
          style={StyleSheet.absoluteFill}
        />

        {/* Split layout on wide web, stacked on mobile */}
        <View
          style={[
            styles.splitContainer,
            IS_WEB_WIDE && styles.splitWide,
          ]}
        >
          {/* Left panel — brand (wide web only) */}
          {IS_WEB_WIDE ? (
            <View
              style={[
                styles.brandPanel,
                { backgroundColor: colors.surface.sunken },
              ]}
            >
              <View style={styles.brandPanelContent}>
                <LevelUpLogo size={80} />
                <Text
                  style={[
                    styles.brandHeadline,
                    { color: colors.textRole.primary },
                    CompassFonts.displayBold,
                  ]}
                >
                  Every career has{"\n"}a route.{"\n"}See yours.
                </Text>
                <Text
                  style={[
                    styles.brandSub,
                    { color: colors.textRole.muted },
                    CompassFonts.body,
                  ]}
                >
                  Career intelligence for every Nigerian starting point.
                </Text>
              </View>
            </View>
          ) : null}

          {/* Right panel — auth card */}
          <ScrollView
            contentContainerStyle={[
              styles.welcomeContent,
              IS_WEB_WIDE && styles.welcomeContentWide,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface.raised,
                  borderColor: colors.borderRole.subtle,
                },
                cardStyle,
              ]}
            >
              {!IS_WEB_WIDE ? (
                <View style={styles.logoWrap}>
                  <LevelUpLogo size={48} />
                  <Text
                    style={[
                      styles.brand,
                      { color: colors.textRole.primary },
                      CompassFonts.displayBold,
                    ]}
                  >
                    {Brand.name}
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  styles.eyebrow,
                  { color: colors.textRole.muted },
                  CompassFonts.bodyBold,
                ]}
              >
                SKILL PLATFORM
              </Text>
              <Text
                style={[
                  styles.tagline,
                  { color: colors.textRole.secondary },
                  CompassFonts.bodyMedium,
                ]}
              >
                {IS_WEB_WIDE
                  ? "Track-first onboarding. Saved progress. Guest mode."
                  : "Every path. Every role. Clearer choices."}
              </Text>

              <View style={styles.featureList}>
                {[
                  "Track-first onboarding",
                  "Saved progress across devices",
                  "Guest mode if you want to explore first",
                ].map((item) => (
                  <View
                    key={item}
                    style={[
                      styles.featureItem,
                      {
                        backgroundColor: colors.surface.subtle,
                        borderColor: colors.borderRole.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.featureText,
                        { color: colors.textRole.secondary },
                        CompassFonts.body,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.btnGroup}>
                <SifterButton
                  label="Create account"
                  onPress={() => setMode("signup")}
                  variant="primary"
                  color={Brand.primary}
                  size="lg"
                  fullWidth
                />

                <SifterButton
                  label="Log in"
                  onPress={() => setMode("login")}
                  variant="ghost"
                  size="lg"
                  fullWidth
                />

                <View
                  style={[
                    styles.authDivider,
                    { borderTopColor: colors.borderRole.subtle },
                  ]}
                >
                  <Text
                    style={[
                      styles.authDividerText,
                      { color: colors.textRole.muted },
                      CompassFonts.body,
                    ]}
                  >
                    Explore without setup
                  </Text>
                </View>

                <SifterButton
                  label="Continue as Guest"
                  onPress={handleGuest}
                  loading={guestLoading}
                  variant="ghost"
                  size="lg"
                  fullWidth
                />
              </View>

              {error ? <ErrorNote message={error} /> : null}
            </Animated.View>

            <LegalFooter
              action="continuing"
              onShowTerms={() => setShowTerms(true)}
            />
          </ScrollView>
        </View>

        <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
      </View>
    );
  }

  // ─── Login / Signup forms ─────────────────────────────────
  const formGradient: [string, string] = isDark
    ? ["#0B0B10", "#13100A"]
    : [colors.surface.base, colors.surface.subtle];

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <LinearGradient colors={formGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface.raised,
                  borderColor: colors.borderRole.subtle,
                },
                cardStyle,
              ]}
            >
              <TouchableOpacity
                onPress={goToWelcome}
                style={styles.backBtn}
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.backText,
                    { color: colors.accentRole.action },
                    CompassFonts.bodyBold,
                  ]}
                >
                  ← Back
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.formTitle,
                  { color: colors.textRole.primary },
                  CompassFonts.displayBold,
                ]}
              >
                {mode === "login" ? "Welcome back" : "Create your account"}
              </Text>
              <Text
                style={[
                  styles.formSub,
                  { color: colors.textRole.secondary },
                  CompassFonts.body,
                ]}
              >
                {mode === "login"
                  ? "Return to your saved track and continue."
                  : "Create an account to save your track setup and progress."}
              </Text>

              <ErrorNote message={error} />

              {mode === "signup" ? (
                <AuthField
                  label="Username"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Chidi"
                  autoFocus
                />
              ) : null}

              <AuthField
                label="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
                autoFocus={mode === "login"}
              />

              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secure
                placeholder="••••••••"
                hint={mode === "signup" ? "At least 8 characters" : undefined}
              />

              <SifterButton
                label={mode === "login" ? "Log in" : "Create account →"}
                onPress={mode === "login" ? handleLogin : handleSignup}
                loading={emailLoading}
                variant="track"
                color={Brand.primary}
                size="lg"
                fullWidth
              />

              <TouchableOpacity
                style={{ alignSelf: "center", paddingVertical: Spacing.sm }}
                onPress={() => {
                  setError("");
                  setMode(mode === "login" ? "signup" : "login");
                }}
                hitSlop={8}
              >
                <Text
                  style={[
                    {
                      fontSize: FontSize.md,
                      color: colors.accentRole.action,
                    },
                    CompassFonts.bodyBold,
                  ]}
                >
                  {mode === "login"
                    ? "Don't have an account? Create one"
                    : "Already have an account? Log in"}
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.authDivider,
                  { borderTopColor: colors.borderRole.subtle },
                ]}
              >
                <Text
                  style={[
                    styles.authDividerText,
                    { color: colors.textRole.muted },
                    CompassFonts.body,
                  ]}
                >
                  or
                </Text>
              </View>

              <SifterButton
                label="Continue as Guest"
                onPress={handleGuest}
                loading={guestLoading}
                variant="ghost"
                size="lg"
                fullWidth
              />
            </Animated.View>

            <LegalFooter
              action="continuing"
              onShowTerms={() => setShowTerms(true)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  splitContainer: { flex: 1 },
  splitWide: { flexDirection: "row" },
  brandPanel: { width: "50%", justifyContent: "center", alignItems: "center" },
  brandPanelContent: {
    maxWidth: 400,
    padding: Spacing.huge,
    gap: Spacing.xl,
  },
  brandHeadline: {
    fontSize: FontSize.hero,
    fontWeight: "900",
    lineHeight: FontSize.hero * 1.15,
  },
  brandSub: {
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * 1.5,
  },
  welcomeContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  welcomeContentWide: {
    width: "50%",
  },
  formContent: {
    ...(webContainer as object),
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 430,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  logoWrap: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  brand: { fontSize: FontSize.xxl, fontWeight: "900" },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center",
  },
  tagline: {
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  featureList: { gap: Spacing.xs, marginBottom: Spacing.sm },
  featureItem: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  featureText: { fontSize: FontSize.xs, textAlign: "center", fontWeight: "600" },
  btnGroup: { gap: Spacing.sm },
  authDivider: {
    borderTopWidth: 1,
    marginVertical: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  authDividerText: {
    fontSize: FontSize.xs,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  backBtn: { alignSelf: "flex-start", marginBottom: Spacing.md },
  backText: { fontSize: FontSize.md, fontWeight: "700" },
  formTitle: { fontSize: FontSize.xxl, fontWeight: "900" },
  formSub: { fontSize: FontSize.sm, lineHeight: 19 },
  connectingText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
});
