/**
 * Shared building blocks for the auth flow (Welcome / Login / Signup / Forgot).
 *
 * Visual grammar (BRIEF-wins-on-chrome):
 *   - CompassFonts (Hanken Grotesk) for all text
 *   - Semantic tokens: surface.raised, textRole.*, borderRole.*, accentRole.*
 *   - Hairline borders, one accent per screen (Brand.primary for CTA only)
 *   - 4px grid spacing
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
  Modal,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  webContainer,
  CompassFonts,
} from "../../theme";
import { LevelUpLogo } from "../../components/brand/LevelUpLogo";
import TermsScreen from "../TermsScreen";

// ─── Terms Modal ────────────────────────────────────────────
export function TermsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <TermsScreen onClose={onClose} />
    </Modal>
  );
}

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
    : [colors.surface.base, colors.surface.subtle];
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
    <View style={[styles.screen, { backgroundColor: colors.surface.base }]}>
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
              {showLogo ? (
                <View style={styles.logoWrap}>
                  <LevelUpLogo size={64} />
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
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoFocus?: boolean;
  hint?: string;
  /** Explicit browser/native autofill policy for each auth form. */
  autoComplete?: TextInputProps["autoComplete"];
}) {
  const { colors } = useTheme();
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={styles.fieldGroup}>
      <Text
        style={[
          styles.label,
          { color: colors.textRole.secondary },
          CompassFonts.bodyBold,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface.subtle,
            borderColor: colors.borderRole.subtle,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.textRole.primary },
            CompassFonts.body,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textRole.placeholder}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
           autoCorrect={false}
           autoFocus={autoFocus}
           autoComplete={autoComplete}
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
        <Text
          style={[
            styles.hint,
            { color: colors.textRole.muted },
            CompassFonts.body,
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Legal footer — tappable Terms & Privacy ──────────────────
export function LegalFooter({
  action,
  onShowTerms,
}: {
  action: string;
  onShowTerms?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.legal,
        { color: colors.textRole.muted },
        CompassFonts.body,
      ]}
    >
      By {action}, you agree to our{" "}
      <Text
        style={[
          { color: colors.textRole.secondary, fontWeight: "700" },
          CompassFonts.bodyBold,
        ]}
        onPress={onShowTerms}
      >
        Terms of Service
      </Text>{" "}
      and{" "}
      <Text
        style={[
          { color: colors.textRole.secondary, fontWeight: "700" },
          CompassFonts.bodyBold,
        ]}
        onPress={onShowTerms}
      >
        Privacy Policy
      </Text>
      .
    </Text>
  );
}

// ─── Inline banners ──────────────────────────────────────────
export function ErrorNote({ message }: { message?: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      style={[styles.errorBox, { backgroundColor: colors.accentRole.danger + "14" }]}
    >
      <Text
        style={[
          styles.errorText,
          { color: colors.accentRole.danger },
          CompassFonts.bodyMedium,
        ]}
      >
        {message}
      </Text>
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
        {
          backgroundColor: colors.accentRole.action + "0D",
          borderColor: colors.accentRole.action + "30",
        },
      ]}
    >
      <Text
        style={[
          styles.infoText,
          { color: colors.accentRole.action },
          CompassFonts.bodyMedium,
        ]}
      >
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
  card: {
    width: "100%",
    maxWidth: 440,
    padding: Spacing.xl,
    gap: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  logoWrap: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  brand: { fontSize: FontSize.xxl, fontWeight: "900" },
  fieldGroup: { gap: 6 },
  label: { fontSize: FontSize.sm, fontWeight: "700" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: FontSize.md },
  eyeBtn: { paddingLeft: Spacing.sm, paddingVertical: 8 },
  eye: { fontSize: 18 },
  hint: { fontSize: FontSize.xs, marginTop: 2 },
  legal: {
    fontSize: FontSize.xs,
    lineHeight: 17,
    textAlign: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  errorBox: { borderRadius: Radius.md, padding: Spacing.md },
  errorText: { fontSize: FontSize.sm, fontWeight: "600", textAlign: "center" },
  infoBox: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  infoText: { fontSize: FontSize.sm, fontWeight: "600", textAlign: "center" },
});
