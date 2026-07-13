/**
 * ReadinessBadgeView — a role's readiness for a programme, as a clean pill.
 *
 * Readiness (v2 taxonomy) = agent-verified domain match_type × role tier, NOT
 * token coverage: "Ready" (green) / "Bridge" (amber) / "Stretch" (blue). Themed
 * via the ReadinessBadge tokens so it stays consistent with the domain/role
 * badges and dark-mode correct.
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { useTheme, Radius, FontSize, getReadinessBadge } from "../../theme";
import type { Readiness } from "../../types/career";

export interface ReadinessBadgeViewProps {
  readiness: Readiness;
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function ReadinessBadgeView({
  readiness,
  size = "md",
  style,
}: ReadinessBadgeViewProps) {
  const { isDark } = useTheme();
  const badge = getReadinessBadge(readiness, isDark);
  const small = size === "sm";

  return (
    <View
      style={[
        styles.pill,
        small ? styles.padSm : styles.padMd,
        { backgroundColor: badge.bg, borderColor: badge.border },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: badge.text, fontSize: small ? FontSize.xs : FontSize.sm },
        ]}
        numberOfLines={1}
      >
        {badge.label}
      </Text>
    </View>
  );
}

export default ReadinessBadgeView;

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
  },
  padSm: { paddingHorizontal: 9, paddingVertical: 2 },
  padMd: { paddingHorizontal: 11, paddingVertical: 4 },
  label: { fontWeight: "800", letterSpacing: 0.3 },
});
