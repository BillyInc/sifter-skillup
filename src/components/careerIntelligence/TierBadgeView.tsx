/**
 * TierBadgeView — a role's seniority tier (Entry / Mid / Senior) as a subtle
 * pill. Tier is context, not a primary signal, so this stays quieter than the
 * readiness/domain badges. Renders nothing when the tier is missing.
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { useTheme, Radius, FontSize, getTierBadge } from "../../theme";
import type { TierType } from "../../theme";

export interface TierBadgeViewProps {
  tier?: TierType;
  style?: ViewStyle;
}

export function TierBadgeView({ tier, style }: TierBadgeViewProps) {
  const { isDark } = useTheme();
  if (!tier) return null;
  const badge = getTierBadge(tier, isDark);

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: badge.bg, borderColor: badge.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: badge.text }]} numberOfLines={1}>
        {badge.label}
      </Text>
    </View>
  );
}

export default TierBadgeView;

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
