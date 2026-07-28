/**
 * DemandMetricsBlock — labour-market intelligence rendered as StatTile grid.
 *
 * Shows the key demand metrics for a role's local/global scope as a 2×2 tile
 * layout with count-up animation, delta, and freshness stamps. Falls back to
 * a single muted line when metrics are absent.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight } from "@/theme";
import { StatTile } from "./StatTile";
import { SectionLabel } from "./RedesignPrimitives";

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

  const hasSalary = metrics.entrySalaryLocalNGN != null;
  const hasPostings = metrics.postingsPerMonth != null;
  const hasYoY = metrics.postingsYoY != undefined;
  const hasRemote = metrics.remotePct != undefined;

  if (!hasSalary && !hasPostings && !hasYoY && !hasRemote) {
    return null;
  }

  const yoyDelta = hasYoY
    ? {
        trend: (metrics.postingsYoY! >= 0 ? "up" : "down") as "up" | "down",
        text: `${metrics.postingsYoY! > 0 ? "+" : ""}${metrics.postingsYoY!}% vs last year`,
      }
    : undefined;

  return (
    <View style={styles.container}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <View style={styles.grid}>
        {hasSalary ? (
          <StatTile
            value={metrics.entrySalaryLocalNGN!}
            label="Median salary"
            prefix="₦"
            suffix="/yr"
            stamp="Entry level"
            style={styles.tile}
          />
        ) : null}
        {hasPostings ? (
          <StatTile
            value={metrics.postingsPerMonth!}
            label="Job postings"
            suffix="/mo"
            delta={yoyDelta}
            stamp="Nigeria"
            style={styles.tile}
          />
        ) : null}
        {hasRemote ? (
          <StatTile
            value={metrics.remotePct!}
            label="Remote share"
            suffix="%"
            stamp="Of postings"
            style={styles.tile}
          />
        ) : null}
        {metrics.topEmployers?.length ? (
          <View style={[styles.tile, styles.employersTile]}>
            <Text
              style={[styles.employerLabel, { color: colors.textRole.secondary }]}
              numberOfLines={1}
            >
              Top employers
            </Text>
            <Text
              style={[styles.employerText, { color: colors.textRole.primary }]}
              numberOfLines={2}
            >
              {metrics.topEmployers.slice(0, 3).join(", ")}
            </Text>
          </View>
        ) : null}
      </View>
      {metrics.plainLabel ? (
        <Text style={[styles.caption, { color: colors.textRole.muted }]}>
          {metrics.plainLabel}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  tile: {
    minWidth: 140,
  },
  employersTile: {
    gap: 4,
    justifyContent: "center",
  },
  employerLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  employerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  caption: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
