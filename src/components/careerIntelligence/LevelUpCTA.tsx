/**
 * Shared call-to-action into My World.
 *
 * My World is the gated learning space. Keep this copy neutral until the
 * guided skill tracks are fully live.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SifterButton } from "../ui";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";

export interface LevelUpCTAProps {
  title?: string;
  body?: string;
  label?: string;
  onPress?: () => void;
}

export function LevelUpCTA({
  title = "Continue in My World",
  body = "Save this path and return to the learning space when guided skill tracks are ready.",
  label = "Open My World",
  onPress,
}: LevelUpCTAProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useTheme();

  // Defence in depth: even if a future Career Intelligence screen imports
  // this component, the learning CTA cannot render outside My World.
  if (!pathname?.includes("/myworld")) return null;

  return (
    <View
      style={[
        styles.cta,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
      ]}
    >
      <Text style={[styles.ctaTitle, { color: colors.textRole.primary }]}>
        {title}
      </Text>
      <Text style={[styles.ctaBody, { color: colors.textRole.secondary }]}>
        {body}
      </Text>
      <SifterButton
        label={label}
        variant="track"
        color={colors.accentRole.action}
        onPress={onPress ?? (() => router.push("/(tabs)/myworld"))}
      />
    </View>
  );
}

export default LevelUpCTA;

const styles = StyleSheet.create({
  cta: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  ctaTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  ctaBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.xs,
  },
});
