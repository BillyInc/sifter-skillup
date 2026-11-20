/**
 * Stage / claimed / source filter bar for the admin student roster.
 *
 * Each group is a single-choice radio group ("All" plus the real options found
 * in the loaded rows), with the count of rows that option would leave. Stacked
 * wrapping chips keep it usable on a phone; every chip is at least 44px tall.
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import {
  type RosterFilterGroups,
  type RosterFilterOption,
  type RosterFilters,
  hasActiveRosterFilters,
} from "@/lib/rosterFilters";

interface Props {
  groups: RosterFilterGroups;
  filters: RosterFilters;
  total: number;
  shown: number;
  onChange: (next: RosterFilters) => void;
  onReset: () => void;
}

const GROUP_TITLES: { key: keyof RosterFilters; title: string }[] = [
  { key: "stage", title: "Stage" },
  { key: "claimed", title: "Account" },
  { key: "source", title: "How they joined" },
];

export function RosterFilterBar({ groups, filters, total, shown, onChange, onReset }: Props) {
  const { colors } = useTheme();
  const visible = GROUP_TITLES.filter((g) => groups[g.key].length > 0);
  if (!visible.length) return null;
  const active = hasActiveRosterFilters(filters);

  const chip = (group: keyof RosterFilters, title: string, option: RosterFilterOption) => {
    const selected = filters[group] === option.key;
    return (
      <TouchableOpacity
        key={option.key}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${title}: ${option.label}, ${option.count} student${option.count === 1 ? "" : "s"}`}
        onPress={() => onChange({ ...filters, [group]: option.key })}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.accentRole.action : colors.surface.raised,
            borderColor: selected ? colors.accentRole.action : colors.borderRole.control,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            CompassFonts.bodyBold,
            { color: selected ? colors.textRole.inverse : colors.textRole.secondary },
          ]}
        >
          {option.label} ({option.count})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap} accessibilityLabel="Filter students">
      {visible.map(({ key, title }) => (
        <View key={key} style={styles.group}>
          <Text style={[styles.groupTitle, CompassFonts.bodyBold, { color: colors.textMuted }]}>{title}</Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={title}>
            {groups[key].map((option) => chip(key, title, option))}
          </View>
        </View>
      ))}
      <View style={styles.summaryRow}>
        <Text style={[styles.summary, { color: colors.textMuted }]} accessibilityLiveRegion="polite">
          {active ? `Showing ${shown} of ${total} students` : `${total} student${total === 1 ? "" : "s"}`}
        </Text>
        {active ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
            onPress={onReset}
            style={[styles.reset, { borderColor: colors.borderRole.control }]}
          >
            <Text style={[styles.resetText, CompassFonts.bodyBold, { color: colors.text }]}>Reset filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  group: { gap: Spacing.xs },
  groupTitle: { fontSize: FontSize.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  chipText: { fontSize: FontSize.sm },
  summaryRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: Spacing.md },
  summary: { fontSize: FontSize.sm },
  reset: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  resetText: { fontSize: FontSize.sm },
});
