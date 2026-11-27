/**
 * Shared building blocks for the auth flow (Welcome / Login / Signup / Forgot).
 *
 * Visual grammar (BRIEF-wins-on-chrome):
 *   - CompassFonts (Inter) for all text
 *   - Semantic tokens: surface.raised, textRole.*, borderRole.*, accentRole.*
 *   - Hairline borders, one accent per screen (Brand.primary for CTA only)
 *   - 4px grid spacing
 */
import React, { useEffect, useId, useRef, useState, type ReactNode } from "react";
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
import { TOUCH_TARGET_MIN } from "../../components/ui";
import TermsScreen from "../TermsScreen";
import PrivacyScreen from "../PrivacyScreen";

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

export function PrivacyModal({
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
      <PrivacyScreen onClose={onClose} />
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
    if (Platform.OS === "web") {
      fade.setValue(1);
      return;
    }
    Animated.timing(fade, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const gradient: [string, string] = isDark
    ? ["#0B0B10", "#13100A"]
    : [colors.surface.base, colors.surface.subtle];
  const cardStyle = Platform.OS === "web"
    ? undefined
    : {
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
  const [focused, setFocused] = useState(false);
  const hintId = `${useId()}-hint`;

  return (
    <View style={styles.fieldGroup}>
      <Text
        // The input carries this text as its accessible name; reading the
        // visible label too would announce "Password" twice.
        // react-native-web ignores the native props, so aria-hidden is set too.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        aria-hidden
        style={[
          styles.label,
          { color: focused ? colors.accentRole.action : colors.textRole.secondary },
          CompassFonts.bodyBold,
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: focused ? colors.surface.raised : colors.surface.subtle,
            borderColor: focused ? colors.accentRole.action : colors.borderRole.subtle,
            borderWidth: focused ? 2 : 1,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.textRole.primary },
            CompassFonts.body,
          ]}
          accessibilityLabel={label}
          // The visible hint is the input's description (screen readers read it
          // after the name). react-native-web maps aria-describedby to the hint
          // element's nativeID; native uses accessibilityHint.
          accessibilityHint={hint}
          aria-describedby={hint ? hintId : undefined}
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
           onFocus={() => setFocused(true)}
           onBlur={() => setFocused(false)}
         />
        {value ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label.toLowerCase()}`}
            onPress={() => onChangeText("")}
            hitSlop={8}
            style={styles.clearBtn}
          >
            <Text style={[styles.clearText, { color: colors.textRole.muted }]}>Clear</Text>
          </TouchableOpacity>
        ) : null}
        {secure ? (
          <TouchableOpacity
            // A switch whose name does not flip: the state ("on"/"off") says
            // whether the value is shown. The name carries the field label so
            // Password and Confirm password are told apart.
            accessibilityRole="switch"
            accessibilityLabel={`Show ${label.toLowerCase()}`}
            accessibilityState={{ checked: !hidden }}
            // react-native-web does not map accessibilityState.checked.
            aria-checked={!hidden}
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.eyeBtn}
          >
            <Text style={styles.eye} accessibilityElementsHidden importantForAccessibility="no" aria-hidden>{hidden ? "👁️" : "🙈"}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {hint ? (
        // The hint stays visible while the field is focused: it is the
        // description the input points at, so it is never swapped for filler.
        <Text
          nativeID={hintId}
          style={[
            styles.hint,
            { color: colors.textRole.muted },
            CompassFonts.body,
          ]}
        >
          {hint}
        </Text>
      ) : focused ? (
        <Text style={[styles.readyHint, { color: colors.accentRole.action }, CompassFonts.bodyMedium]}>
          Ready to type
        </Text>
      ) : null}
    </View>
  );
}

// ─── Legal footer — tappable Terms & Privacy ──────────────────
export function LegalFooter({
  action,
  onShowTerms,
  onShowPrivacy,
  agreement = true,
}: {
  action: string;
  onShowTerms?: () => void;
  onShowPrivacy?: () => void;
  agreement?: boolean;
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
      {agreement ? `By ${action}, you agree to our ` : "Review our "}
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
        onPress={onShowPrivacy}
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
  input: { flex: 1, minWidth: 0, paddingVertical: 13, fontSize: FontSize.md },
  eyeBtn: {
    // Fixed 44px square, no extra padding, so the input keeps its width.
    flexShrink: 0,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: "center",
    justifyContent: "center",
  },
  eye: { fontSize: 18 },
  clearBtn: {
    // A true 44px target (not a hitSlop that web ignores); never grows the row.
    flexShrink: 0,
    minWidth: TOUCH_TARGET_MIN,
    minHeight: TOUCH_TARGET_MIN,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: { fontSize: FontSize.xs, fontWeight: "700" },
  hint: { fontSize: FontSize.xs, marginTop: 2 },
  readyHint: { fontSize: FontSize.xs, marginTop: 2, fontWeight: "700" },
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
