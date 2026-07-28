/**
 * TierBadgeView — a role's seniority tier (Entry / Mid / Senior) as a subtle
 * pill. Tier is context, not a primary signal, so this stays quieter than the
 * readiness/domain badges. Renders nothing when the tier is missing.
 *
 * Supports an optional freshness stamp showing when the tier data was last
 * verified or updated, per the design prompt freshness indicator spec.
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Radius, FontSize, FontWeight, Spacing, getTierBadge } from "../../theme";
import type { TierType } from "../../theme";

export interface TierBadgeViewProps {
  tier?: TierType;
  lastUpdated?: string | Date;
  style?: ViewStyle;
}

function formatFreshness(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function TierBadgeView({ tier, lastUpdated, style }: TierBadgeViewProps) {
  const { isDark, colors } = useTheme();
  if (!tier) return null;
  const badge = getTierBadge(tier, isDark);

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.pill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
        <Text style={[styles.label, { color: badge.text }]} numberOfLines={1}>
          {badge.label}
        </Text>
      </View>
      {lastUpdated ? (
        <View style={styles.freshness}>
          <Feather name="clock" size={10} color={colors.textRole.muted} />
          <Text style={[styles.freshnessText, { color: colors.textRole.muted }]}>
            {formatFreshness(lastUpdated)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default TierBadgeView;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "flex-start",
  },
  pill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  freshness: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  freshnessText: {
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.medium,
  },
});
