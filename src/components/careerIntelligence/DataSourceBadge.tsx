/**
 * DataSourceBadge — provenance + freshness for any data point.
 * ✅ Verified · ⚠️ Inferred · 🕐 Pending, with an optional date and source.
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  DataFreshness,
} from "../../theme";
import type { DataMeta } from "../../types/career";

export interface DataSourceBadgeProps {
  verification?: DataMeta["verification"];
  date?: string;
  source?: string;
  style?: ViewStyle;
}

export function DataSourceBadge({
  verification = "pending",
  date,
  source,
  style,
}: DataSourceBadgeProps) {
  const { colors } = useTheme();
  const f = DataFreshness[verification];
  const parts: string[] = [f.label];
  if (source) parts.push(source);
  if (date) parts.push(date);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
        style,
      ]}
    >
      <Text style={styles.icon}>{f.icon}</Text>
      <Text
        style={[styles.text, { color: colors.textRole.muted }]}
        numberOfLines={1}
      >
        {parts.join(" · ")}
      </Text>
    </View>
  );
}

export default DataSourceBadge;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  icon: { fontSize: 11 },
  text: { fontSize: FontSize.xs, fontWeight: "600" },
});
