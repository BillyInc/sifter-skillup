import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { FlowCueCopy } from "@/lib/studentFlowCopy";

/** A short place-marker: where the student is, and the next useful step. */
export function FlowCue({ here, next }: FlowCueCopy) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="summary"
      style={[styles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
    >
      <Text style={[styles.label, { color: colors.textRole.primary }]}>You are here</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>{here}</Text>
      <Text style={[styles.label, { color: colors.accentRole.action }]}>Next</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>{next}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  label: { fontSize: FontSize.lg, lineHeight: 22, fontWeight: "700" },
  body: { fontSize: FontSize.lg, lineHeight: 22 },
});
