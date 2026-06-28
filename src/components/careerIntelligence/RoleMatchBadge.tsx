/**
 * RoleMatchBadge — a role's fit within a matched domain.
 *
 * Per CCMAS v3.0 Step 2: roles are scored by ESCO essential-skill coverage and
 * labelled "Match" (>=50%) or "Adjacent" (20-49%). This badge optionally shows
 * the coverage percentage. (Note: this is the ROLE label — distinct from the
 * DOMAIN match type shown by DomainChip.)
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { useTheme, Radius, FontSize, getRoleBadge } from "../../theme";
import type { RoleMatchType } from "../../types/career";

export interface RoleMatchBadgeProps {
  match: RoleMatchType;
  /** 0..1 ESCO coverage ratio; shown as a percentage when provided. */
  coverageRatio?: number;
  elite?: boolean;
  style?: ViewStyle;
}

export function RoleMatchBadge({
  match,
  coverageRatio,
  elite,
  style,
}: RoleMatchBadgeProps) {
  const { isDark } = useTheme();
  const badge = getRoleBadge(match, isDark);
  const pct =
    typeof coverageRatio === "number"
      ? `${Math.round(coverageRatio * 100)}%`
      : null;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badge.bg, borderColor: badge.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: badge.text }]}>
        {elite ? "⭐ " : ""}
        {badge.label}
        {pct ? ` · ${pct}` : ""}
      </Text>
    </View>
  );
}

export default RoleMatchBadge;

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  text: { fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 0.3 },
});
