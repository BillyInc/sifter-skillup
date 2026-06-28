/**
 * RoleTypeFilter — horizontal filter row for a domain's roles.
 *
 * Lets the user narrow a role list to "All roles" | "Match" | "Adjacent".
 * The active Match/Adjacent chip borrows the canonical role-badge colours
 * (getRoleBadge) so the filter reads as the same system as RoleMatchBadge;
 * "All roles" uses a neutral accent. Non-wrapping, scrollable on small screens.
 */
import React from "react";
import {
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  getRoleBadge,
} from "../../theme";
import type { RoleMatchType } from "../../types/career";

export type RoleTypeFilterValue = "all" | RoleMatchType;

export interface RoleTypeFilterProps {
  value: RoleTypeFilterValue;
  onChange: (value: RoleTypeFilterValue) => void;
  style?: ViewStyle;
}

const OPTIONS: { value: RoleTypeFilterValue; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "match", label: "Match" },
  { value: "adjacent", label: "Adjacent" },
];

export function RoleTypeFilter({
  value,
  onChange,
  style,
}: RoleTypeFilterProps) {
  const { colors, isDark } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.row}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;

        // Role chips use the badge palette; "All" uses neutral accent.
        const badge =
          opt.value === "all" ? null : getRoleBadge(opt.value, isDark);

        const activeBg = badge ? badge.bg : colors.accentSoft;
        const activeBorder = badge ? badge.border : colors.accent;
        const activeText = badge ? badge.text : colors.accent;

        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              {
                backgroundColor: active ? activeBg : colors.bgSecondary,
                borderColor: active ? activeBorder : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? activeText : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default RoleTypeFilter;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
});
