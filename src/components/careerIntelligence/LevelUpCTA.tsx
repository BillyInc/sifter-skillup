/**
 * LevelUpCTA — the persistent "Level Up into the work" call-to-action card.
 *
 * Cross-cutting per the plan: it appears on every career-intelligence surface
 * that maps to buildable skills (programme, role, domain, elite pathway). It
 * routes into My World — the gated learning world — where the user closes the
 * skill gap one level at a time. Copy is overridable so each screen can frame
 * the CTA for its own context; defaults suit a generic detail screen.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SifterButton } from "../ui";
import { useTheme, Spacing, Radius, FontSize, FontWeight, Brand } from "../../theme";

export interface LevelUpCTAProps {
  title?: string;
  body?: string;
  label?: string;
  /** Override the default navigation (into My World). */
  onPress?: () => void;
}

export function LevelUpCTA({
  title = "Ready to close the gap?",
  body = "Build the bridge skills this path needs — one level at a time, in your world.",
  label = "Level Up →",
  onPress,
}: LevelUpCTAProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.cta,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.ctaIcon}>⚡</Text>
      <Text style={[styles.ctaTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.ctaBody, { color: colors.textSoft }]}>{body}</Text>
      <SifterButton
        label={label}
        icon="🚀"
        variant="track"
        color={Brand.primary}
        onPress={onPress ?? (() => router.push("/(tabs)/myworld"))}
      />
    </View>
  );
}

export default LevelUpCTA;

const styles = StyleSheet.create({
  cta: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  ctaIcon: { fontSize: 28 },
  ctaTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  ctaBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.xs,
  },
});
