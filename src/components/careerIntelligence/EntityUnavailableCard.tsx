import React from "react";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";

/**
 * A visible, honest state for a nested career record that is not present in
 * the current response. This is deliberately different from a locked or
 * coming-soon state: the route exists, but the requested child row was not
 * returned by the current source-backed dataset.
 */
export function EntityUnavailableCard({
  entityLabel,
  parentLabel,
  onBack,
  onRetry,
  style,
}: {
  entityLabel: string;
  parentLabel?: string;
  onBack?: () => void;
  onRetry?: () => void;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, style]}>
      <View style={[styles.icon, { backgroundColor: colors.surface.subtle }]}>
        <Feather name="file-minus" size={22} color={colors.textRole.muted} />
      </View>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
        This {entityLabel.toLowerCase()} is not available yet
      </Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>The page is ready, but the current source-backed data did not return this {entityLabel.toLowerCase()}. We will not fill the gap with guessed skills, tools, roles or relationships.</Text>
      <Text style={[styles.note, { color: colors.textRole.muted }]}>{parentLabel ? `Return to ${parentLabel} to choose another available route, or try loading this page again.` : "Try loading again or return to the previous level."}</Text>
      <View style={styles.actions}>
        {onBack ? <TouchableOpacity accessibilityRole="button" onPress={onBack} style={[styles.secondary, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.actionText, { color: colors.textRole.primary }]}>Go back</Text></TouchableOpacity> : null}
        {onRetry ? <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={[styles.primary, { backgroundColor: colors.accentRole.action }]}><Text style={[styles.actionText, { color: colors.textRole.inverse }]}>Try again</Text></TouchableOpacity> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  icon: { width: 42, height: 42, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  title: { fontSize: FontSize.lg },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.xs },
  secondary: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  primary: { borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  actionText: { fontSize: FontSize.sm, fontWeight: "700" },
});

export default EntityUnavailableCard;
