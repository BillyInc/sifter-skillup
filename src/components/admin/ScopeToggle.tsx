/**
 * ScopeToggle — a segmented control for selecting a demand-ranking scope
 * (Nigerian / Global / Remote). Mirrors the style of DomainRankPanel's toggle
 * but extracted as a reusable component so other screens (Trends, Salary) can
 * use it without re-declaring scope labels and active styling.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";

export type ScopeOption = "nigerian" | "global" | "remote";

export interface ScopeToggleProps {
  value: ScopeOption;
  onChange: (s: ScopeOption) => void;
}

const SCOPES: { value: ScopeOption; label: string }[] = [
  { value: "nigerian", label: "Nigerian" },
  { value: "global", label: "Global" },
  { value: "remote", label: "Remote" },
];

export function ScopeToggle({ value, onChange }: ScopeToggleProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.toggle, { backgroundColor: colors.bgSecondary }]}>
      {SCOPES.map((s) => {
        const active = s.value === value;
        return (
          <TouchableOpacity
            key={s.value}
            onPress={() => onChange(s.value)}
            activeOpacity={0.8}
            style={[
              styles.toggleBtn,
              active && { backgroundColor: colors.card },
            ]}
          >
            <Text
              style={[
                styles.toggleLabel,
                { color: active ? colors.text : colors.textMuted },
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default ScopeToggle;

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  toggleLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});