/**
 * NationalBenchmarkPanel — shows "your institution vs national average" cards.
 * Used in VsNationalScreen to give a quick visual comparison of key metrics
 * (domains accessible, postings per month, skills gaps, remote eligibility).
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from "../../theme";

export interface NationalBenchmarkPanelProps {
  myValue: number;
  nationalAvg: number;
  metric: string;
}

export function NationalBenchmarkPanel({
  myValue,
  nationalAvg,
  metric,
}: NationalBenchmarkPanelProps) {
  const { colors } = useTheme();
  const diff = myValue - nationalAvg;
  const pctOfAvg = nationalAvg > 0 ? Math.round((myValue / nationalAvg) * 100) : 0;
  const isAbove = diff >= 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.metric, { color: colors.textSoft }]}>
        {metric}
      </Text>

      <View style={styles.valuesRow}>
        <View style={styles.valueCol}>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>
            Your institution
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {myValue.toLocaleString()}
          </Text>
        </View>

        <View style={styles.vsCol}>
          <Text style={[styles.vsBadge, { color: colors.textMuted }]}>vs</Text>
        </View>

        <View style={styles.valueCol}>
          <Text style={[styles.valueLabel, { color: colors.textMuted }]}>
            National avg
          </Text>
          <Text style={[styles.value, { color: colors.textSoft }]}>
            {nationalAvg.toLocaleString()}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.diffBadge,
          {
            backgroundColor: isAbove ? colors.greenSoft : colors.redSoft,
            alignSelf: "flex-start",
          },
        ]}
      >
        <Text
          style={[
            styles.diffText,
            { color: isAbove ? colors.green : colors.red },
          ]}
        >
          {isAbove ? "↑" : "↓"} {Math.abs(diff).toLocaleString()}{" "}
          ({pctOfAvg}% of national)
        </Text>
      </View>
    </View>
  );
}

export default NationalBenchmarkPanel;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  metric: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valuesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  valueCol: {
    flex: 1,
    gap: 2,
  },
  valueLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
  },
  vsCol: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
  },
  vsBadge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
  },
  diffBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  diffText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});