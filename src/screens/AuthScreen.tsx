/**
 * AuthScreen - Sifter LevelUp sign-in and auth landing.
 *
 * Account creation lives only at /(auth)/signup so every signup path uses the
 * full profile, date-of-birth, legal, and email-code flow.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Brand,
  CompassFonts,
  FontSize,
  Radius,
  Spacing,
  useTheme,
} from "@/theme";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";
import { SifterButton } from "@/components/ui";
import { LevelUpLogo } from "@/components/brand/LevelUpLogo";
import {
  AuthField,
  ErrorNote,
  LegalFooter,
  TermsModal,
} from "@/screens/auth/authShared";

type Mode = "welcome" | "login" | "connecting";

function friendlyAuthError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (!message) return fallback;
  if (/unauthorized/i.test(message)) return "Invalid email or password.";
  if (/bad request/i.test(message)) return fallback;
  return message;
}

export default function AuthScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { signInEmail, signInGuest } = useAuth();
  const resp = useResponsive();
  const isDesktop = resp.isDesktop && resp.isWeb;

  const [mode, setMode] = useState<Mode>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSignupGuard, setShowSignupGuard] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

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

  const resetLoginFields = () => {
    setEmail("");
    setPassword("");
  };

  // Login credentials are intentionally ephemeral. This also handles browser
  // back/forward and native navigation where the route may remain mounted.
  useFocusEffect(
    useCallback(() => {
      return () => resetLoginFields();
    }, []),
  );

  const goToSignup = () => {
    setError("");
    resetLoginFields();
    setShowSignupGuard(false);
    // Replace the auth state so an old reset URL cannot remain in the browser
    // history when the user switches to account creation.
    router.replace("/(auth)/signup" as any);
  };

  const requestSignup = () => {
    if (mode === "login" && (email.trim() || password.trim())) {
      setShowSignupGuard(true);
      return;
    }
    goToSignup();
  };

  const goToWelcome = () => {
    setError("");
    resetLoginFields();
    setShowSignupGuard(false);
    setMode("welcome");
  };

  const handleGuest = async () => {
    setError("");
    setGuestLoading(true);
    try {
      await signInGuest();
    } catch (e) {
      setError(friendlyAuthError(e, "Could not continue as guest."));
    } finally {
      setGuestLoading(false);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setEmailLoading(true);
    try {
      await signInEmail(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e) {
      setError(friendlyAuthError(e, "Could not sign you in."));
    } finally {
      setEmailLoading(false);
    }
  };

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

  const gradient: [string, string] = isDark
    ? ["#0B0B10", "#13100A"]
    : [colors.surface.base, colors.surface.subtle];

  if (mode === "welcome") {
    return (
      <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
        <View style={[styles.splitContainer, isDesktop && styles.splitWide]}>
          {isDesktop ? (
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

          <ScrollView
            contentContainerStyle={[
              styles.welcomeContent,
              isDesktop && styles.welcomeContentWide,
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
              {!isDesktop ? (
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
                CAREER INTELLIGENCE
              </Text>
              <Text
                style={[
                  styles.tagline,
                  { color: colors.textRole.secondary },
                  CompassFonts.bodyMedium,
                ]}
              >
                Every programme has a route. See yours.
              </Text>

              <View style={styles.featureList}>
                {[
                  "Map your programme to real career routes",
                  "Explore before you set up a profile",
                  "Return to your progress when you are ready",
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
                  onPress={goToSignup}
                  variant="primary"
                  color={Brand.primary}
                  size="lg"
                  fullWidth
                />
                <SifterButton
                  label="Log in"
                  onPress={() => {
                    setError("");
                    resetLoginFields();
                    setMode("login");
                  }}
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

              <ErrorNote message={error} />
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

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
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
                  Back
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  styles.formTitle,
                  { color: colors.textRole.primary },
                  CompassFonts.displayBold,
                ]}
              >
                Welcome back
              </Text>
              <Text
                style={[
                  styles.formSub,
                  { color: colors.textRole.secondary },
                  CompassFonts.body,
                ]}
              >
                Return to your saved guidance, maps, and learning progress.
              </Text>

              <ErrorNote message={error} />

              <AuthField
                label="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="you@example.com"
                autoFocus
                autoComplete="username"
              />

              <AuthField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secure
                placeholder="Password"
                autoComplete="current-password"
              />

              <TouchableOpacity
                style={{ alignSelf: "flex-end", paddingVertical: Spacing.xs }}
                onPress={() =>
                  router.replace("/(auth)/forgot-password?intent=reset" as any)
                }
                hitSlop={8}
              >
                <Text
                  style={[
                    {
                      fontSize: FontSize.sm,
                      color: colors.accentRole.action,
                    },
                    CompassFonts.bodyBold,
                  ]}
                >
                  Forgot password?
                </Text>
              </TouchableOpacity>

              <SifterButton
                label="Log in"
                onPress={handleLogin}
                loading={emailLoading}
                variant="track"
                color={Brand.primary}
                size="lg"
                fullWidth
              />

              <TouchableOpacity
                style={{ alignSelf: "center", paddingVertical: Spacing.sm }}
                onPress={requestSignup}
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
                  Don't have an account? Create one
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
      <Modal
        visible={showSignupGuard}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignupGuard(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface.raised,
                borderColor: colors.borderRole.subtle,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colors.textRole.primary },
                CompassFonts.displayBold,
              ]}
            >
              Create an account instead?
            </Text>
            <Text
              style={[
                styles.modalBody,
                { color: colors.textRole.secondary },
                CompassFonts.body,
              ]}
            >
              For your privacy, account creation starts on a fresh form.
            </Text>
            <View style={styles.modalActions}>
              <SifterButton
                label="Stay on login"
                onPress={() => setShowSignupGuard(false)}
                variant="ghost"
                size="md"
              />
              <SifterButton
                label="Continue to create account"
                onPress={goToSignup}
                variant="track"
                color={Brand.primary}
                size="md"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  welcomeContentWide: { width: "50%" },
  formContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  logoWrap: { alignItems: "center", gap: Spacing.sm },
  brand: { fontSize: FontSize.xxl, fontWeight: "900" },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  tagline: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  featureList: { gap: Spacing.sm },
  featureItem: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  featureText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  btnGroup: { gap: Spacing.sm },
  authDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    marginVertical: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  authDividerText: { fontSize: FontSize.xs },
  connectingText: { marginTop: Spacing.md, fontSize: FontSize.md },
  backBtn: { alignSelf: "flex-start", paddingVertical: Spacing.xs },
  backText: { fontSize: FontSize.sm },
  formTitle: { fontSize: FontSize.xxl, lineHeight: FontSize.xxl * 1.15 },
  formSub: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  modalTitle: { fontSize: FontSize.xl },
  modalBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
