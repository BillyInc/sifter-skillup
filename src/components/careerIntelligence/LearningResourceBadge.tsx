import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FontSize, Spacing, useTheme } from "../../theme";
import type { LearningResourceDescriptor } from "./learningResourcePresentation";
import { learningResourceIcon, learningResourceLevelLabel, learningResourceMediaLabel } from "./learningResourcePresentation";

export function LearningResourceBadge({ resource }: { resource: LearningResourceDescriptor }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.type, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <Feather name={learningResourceIcon(resource) as React.ComponentProps<typeof Feather>["name"]} size={14} color={colors.accentRole.action} />
        <Text style={[styles.label, { color: colors.textRole.secondary }]}>{learningResourceMediaLabel(resource)}</Text>
      </View>
      <Text style={[styles.level, { color: colors.textRole.muted }]}>{learningResourceLevelLabel(resource.learningLevel)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: Spacing.xs },
  type: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  label: { fontSize: FontSize.xs, fontWeight: "700" },
  level: { fontSize: FontSize.xs, fontWeight: "600" },
});
