import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight } from "@/theme";

export interface DemandMetricsBlockProps {
  /** Demand metrics scoped by label (e.g., "ng_local", "global", "ng_remote"). */
  metrics?: {
    postingsPerMonth?: number;
    postingsYoY?: number;
    remotePct?: number;
    entrySalaryLocalNGN?: number;
    entrySalaryRemoteUSD?: number;
    plainLabel?: string;
    topEmployers?: string[];
    topCertifications?: string[];
  };
  title?: string;
}

export function DemandMetricsBlock({ metrics, title }: DemandMetricsBlockProps) {
  const { colors } = useTheme();
  if (!metrics) return null;
  return (
    <View style={styles.container}>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      ) : null}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSoft }]}>Postings / mo:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{metrics.postingsPerMonth ?? "-"}</Text>
      </View>
      {metrics.postingsYoY !== undefined && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSoft }]}>YoY Growth:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{metrics.postingsYoY}%</Text>
        </View>
      )}
      {metrics.remotePct !== undefined && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Remote %:</Text>
          <Text style={[styles.value, { color: colors.text }]}>{metrics.remotePct}%</Text>
        </View>
      )}
      {metrics.entrySalaryLocalNGN !== undefined && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Entry Salary (NGN):</Text>
          <Text style={[styles.value, { color: colors.text }]}>{metrics.entrySalaryLocalNGN}</Text>
        </View>
      )}
      {metrics.entrySalaryRemoteUSD !== undefined && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Entry Salary (USD):</Text>
          <Text style={[styles.value, { color: colors.text }]}>{metrics.entrySalaryRemoteUSD}</Text>
        </View>
      )}
      {metrics.plainLabel && (
        <Text style={[styles.caption, { color: colors.textMuted }]}>{metrics.plainLabel}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm, marginVertical: Spacing.md },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: FontSize.sm },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  caption: { fontSize: FontSize.xs, marginTop: 4 },
});
