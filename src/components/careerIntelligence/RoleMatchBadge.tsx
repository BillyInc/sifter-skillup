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
  /** Omit where coverage has not been computed — see RoleCard.match. */
  match?: RoleMatchType;
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
  const { isDark, colors } = useTheme();
  // Nothing to say about fit, and not elite either: say nothing. A default
  // label here is how "Match · 0%" ended up on roles with no coverage data.
  if (!match && !elite) return null;
  const badge = match ? getRoleBadge(match, isDark) : null;
  const pct =
    typeof coverageRatio === "number"
      ? `${Math.round(coverageRatio * 100)}%`
      : null;

  // Elite with no coverage label still deserves its star, on neutral chrome.
  const bg = badge?.bg ?? "transparent";
  const border = badge?.border ?? colors.borderRole.subtle;
  const text = badge?.text ?? colors.textRole.secondary;

  return (
    <View
      style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}
    >
      <Text style={[styles.text, { color: text }]}>
        {elite ? "⭐ " : ""}
        {badge?.label ?? (elite ? "Elite" : "")}
        {badge && pct ? ` · ${pct}` : ""}
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
