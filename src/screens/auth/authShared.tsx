/**
 * Shared building blocks for the redesigned auth flow (Login / Sign up /
 * Forgot password). Keeps the three screens visually identical and reduces
 * duplication: a branded gradient scaffold, labelled inputs with a password
 * reveal toggle, the Google/Apple social row, and the legal footer.
 *
 * Social sign-in is intentionally stubbed for now — there is no backend OAuth
 * token-exchange endpoint yet (see TODO(levelup-oauth)). The buttons render in
 * full brand fidelity but surface an honest "coming soon" notice rather than a
 * fake success. Email/password is fully live via the existing useAuth methods.
 */
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  type KeyboardTypeOptions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  webContainer,
} from "../../theme";
import { LevelUpLogo } from "../../components/brand/LevelUpLogo";

// ─── Scaffold ─────────────────────────────────────────────────
export function AuthScaffold({
  children,
  showLogo = true,
}: {
  children: ReactNode;
  showLogo?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const gradient: [string, string] = isDark
    ? ["#0B0B10", "#13100A"]
    : ["#FFFDF8", "#FFF6E8"];
  const cardStyle = {
    opacity: fade,
    transform: [
      {
        translateY: fade.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.card, cardStyle]}>
              {showLogo ? (
                <View style={styles.logoWrap}>
                  <LevelUpLogo size={64} />
                  <Text style={[styles.brand, { color: colors.text }]}>
                    {Brand.name}
                  </Text>
                </View>
              ) : null}
              {children}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Labelled input (with optional password reveal) ───────────
export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType,
  autoFocus,
  hint,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  hint?: string;
}) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSoft }]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
        />
        {secure ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.eyeBtn}
          >
            <Text style={styles.eye}>{hidden ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

// ─── Social row (Google / Apple) — stubbed, honest ────────────
export function SocialRow({ onUnavailable }: { onUnavailable: () => void }) {
  const { colors } = useTheme();
  const providers: { id: string; label: string; mark: string }[] = [
    { id: "google", label: "Continue with Google", mark: "G" },
    { id: "apple", label: "Continue with Apple", mark: "" },
  ];
  return (
    <View style={{ gap: Spacing.sm }}>
      {providers.map((p) => (
        <TouchableOpacity
          key={p.id}
          style={[
            styles.social,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={onUnavailable}
          activeOpacity={0.85}
          // TODO(levelup-oauth): wire to Supabase OAuth + backend token-exchange.
        >
          <Text style={[styles.socialMark, { color: colors.text }]}>
            {p.mark}
          </Text>
          <Text style={[styles.socialLabel, { color: colors.text }]}>
            {p.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function OrDivider() {
  const { colors } = useTheme();
  return (
    <View style={styles.dividerRow}>
      <View style={[styles.divLine, { backgroundColor: colors.border }]} />
      <Text style={[styles.divText, { color: colors.textMuted }]}>or</Text>
      <View style={[styles.divLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

export function LegalFooter({ action }: { action: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.legal, { color: colors.textMuted }]}>
      By {action}, you agree to our{" "}
      <Text style={{ color: colors.textSoft, fontWeight: "700" }}>
        Terms of Service
      </Text>{" "}
      and{" "}
      <Text style={{ color: colors.textSoft, fontWeight: "700" }}>
        Privacy Policy
      </Text>
      .
    </Text>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={[styles.errorBox, { backgroundColor: colors.redSoft }]}>
      <Text style={[styles.errorText, { color: colors.red }]}>{message}</Text>
    </View>
  );
}

export function InfoNote({ message }: { message?: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      style={[
        styles.infoBox,
        { backgroundColor: colors.goldSoft, borderColor: `${Brand.primary}40` },
      ]}
    >
      <Text style={[styles.infoText, { color: Brand.primaryDeep }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: {
    ...(webContainer as object),
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: Spacing.xxxl,
    alignItems: "center",
  },
  card: { width: "100%", maxWidth: 440, padding: Spacing.xl, gap: Spacing.md },
  logoWrap: { alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.sm },
  brand: { fontSize: FontSize.xxl, fontWeight: "900" },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: "700" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: FontSize.md },
  eyeBtn: { paddingLeft: Spacing.sm, paddingVertical: 8 },
  eye: { fontSize: 18 },
  hint: { fontSize: FontSize.xs, marginTop: 2 },
  social: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingVertical: 13,
  },
  socialMark: {
    fontSize: FontSize.lg,
    fontWeight: "900",
    width: 18,
    textAlign: "center",
  },
  socialLabel: { fontSize: FontSize.md, fontWeight: "700" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  divLine: { flex: 1, height: 1 },
  divText: { fontSize: FontSize.sm },
  legal: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  errorBox: { borderRadius: Radius.md, padding: Spacing.md },
  errorText: { fontSize: FontSize.sm, fontWeight: "600", textAlign: "center" },
  infoBox: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  infoText: { fontSize: FontSize.sm, fontWeight: "600", textAlign: "center" },
});
