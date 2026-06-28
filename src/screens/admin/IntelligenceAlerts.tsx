/**
 * IntelligenceAlerts — auto-surfaced aggregate signals (skills drift, emerging
 * domains, demand spikes). Aggregate-only by construction: an alert describes a
 * cohort/market pattern, never an individual student.
 *
 * Data-gated through <ComingSoonPanel>; the severity drives the tint via theme
 * tokens only (no bespoke colours). Empty real data → a calm "all clear" state.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  type ColorPalette,
} from "../../theme";
import { ComingSoonPanel } from "./ComingSoonPanel";
import type { DataState } from "../../types/career";
import type {
  IntelligenceAlert,
  AlertSeverity,
} from "../../types/institution";

function severityStyle(
  severity: AlertSeverity,
  colors: ColorPalette,
): { tint: string; soft: string; icon: string } {
  switch (severity) {
    case "critical":
      return { tint: colors.red, soft: colors.redSoft, icon: "🔴" };
    case "warning":
      return { tint: colors.gold, soft: colors.goldSoft, icon: "⚠️" };
    case "opportunity":
      return { tint: colors.green, soft: colors.greenSoft, icon: "📈" };
    case "info":
    default:
      return { tint: colors.accent, soft: colors.accentSoft, icon: "ℹ️" };
  }
}

export function IntelligenceAlerts({
  state,
}: {
  state: DataState<IntelligenceAlert[]>;
}) {
  const { colors } = useTheme();

  return (
    <ComingSoonPanel
      state={state}
      empty={(alerts) => alerts.length === 0}
      emptyTitle="No alerts right now"
      emptyBody="We'll surface skills drift, emerging domains and demand spikes here as they appear."
    >
      {(alerts) => (
        <View style={{ gap: Spacing.sm }}>
          {alerts.map((alert) => {
            const s = severityStyle(alert.severity, colors);
            return (
              <View
                key={alert.id}
                style={[
                  styles.alert,
                  { backgroundColor: s.soft, borderColor: s.tint },
                ]}
              >
                <Text style={styles.icon}>{s.icon}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {alert.title}
                  </Text>
                  <Text style={[styles.body, { color: colors.textSoft }]}>
                    {alert.body}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ComingSoonPanel>
  );
}

export default IntelligenceAlerts;

const styles = StyleSheet.create({
  alert: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
    borderWidth: 1,
    borderLeftWidth: 3,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  icon: { fontSize: 16 },
  title: { fontSize: FontSize.sm, fontWeight: FontWeight.heavy },
  body: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
});
