import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CompassFonts,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
} from "../../theme";

// ── ApplicationWindowTimeline ──────────────────────────────────
// Horizontal timeline: months across, window bars, today-line.
// Shows application windows (JAMB reg, Post-UTME, scholarships) on a
// month-based timeline with bars indicating open/closed/upcoming periods.

export interface TimelineWindow {
  id: string;
  label: string;
  /** 1-indexed month (1 = Jan, 12 = Dec). */
  startMonth: number;
  /** 1-indexed month (inclusive). */
  endMonth: number;
  status: "open" | "upcoming" | "closed";
  /** Optional accent colour override. */
  color?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ApplicationWindowTimeline({
  windows,
  currentMonth,
  style,
}: {
  windows: TimelineWindow[];
  currentMonth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const month = currentMonth ?? new Date().getMonth() + 1;

  return (
    <View style={[styles.container, style]}>
      {/* Month labels */}
      <View style={styles.monthRow}>
        {MONTHS.map((m, i) => (
          <View key={m} style={styles.monthCell}>
            <Text
              style={[
                styles.monthLabel,
                CompassFonts.data,
                {
                  color: i + 1 === month ? colors.accentRole.action : colors.textRole.muted,
                  fontWeight: i + 1 === month ? FontWeight.bold : FontWeight.regular,
                },
              ]}
            >
              {m}
            </Text>
          </View>
        ))}
      </View>

      {/* Today line */}
      <View style={styles.timelineRow}>
        {MONTHS.map((_, i) => (
          <View key={i} style={styles.monthCell}>
            {i + 1 === month ? (
              <View style={[styles.todayDot, { backgroundColor: colors.accentRole.action }]} />
            ) : (
              <View style={[styles.tick, { backgroundColor: colors.borderRole.subtle }]} />
            )}
          </View>
        ))}
      </View>

      {/* Window bars */}
      <View style={styles.barsContainer}>
        {windows.map((w) => {
          const statusColor =
            w.status === "open"
              ? (w.color ?? colors.accentRole.success)
              : w.status === "upcoming"
                ? (w.color ?? colors.accentRole.action)
                : colors.state.locked;

          const leftPercent = ((w.startMonth - 1) / 12) * 100;
          const widthPercent = ((w.endMonth - w.startMonth + 1) / 12) * 100;

          return (
            <View key={w.id} style={styles.barRow}>
              <View style={[styles.barTrack, { backgroundColor: colors.surface.subtle }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: statusColor,
                      opacity: w.status === "closed" ? 0.4 : 1,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.barLabel, { color: colors.textRole.secondary }]}
                numberOfLines={1}
              >
                {w.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendDot color={colors.accentRole.success} label="Open" />
        <LegendDot color={colors.accentRole.action} label="Upcoming" />
        <LegendDot color={colors.state.locked} label="Closed" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendLabel, { color: colors.textRole.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  monthRow: {
    flexDirection: "row",
  },
  monthCell: {
    flex: 1,
    alignItems: "center",
  },
  monthLabel: {
    fontSize: 9,
  },
  timelineRow: {
    flexDirection: "row",
    height: 8,
    alignItems: "center",
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tick: {
    width: 1,
    height: 4,
    borderRadius: 0.5,
    alignSelf: "center",
  },
  barsContainer: {
    gap: Spacing.sm,
  },
  barRow: {
    gap: 4,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    position: "relative",
    overflow: "hidden",
  },
  barFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    borderRadius: 5,
  },
  todayLine: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 1.5,
    borderRadius: 0.75,
  },
  barLabel: {
    fontSize: FontSize.xs,
    paddingLeft: 2,
  },
  legend: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 9,
  },
});
