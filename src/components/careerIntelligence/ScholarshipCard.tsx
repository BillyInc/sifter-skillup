/**
 * ScholarshipCard — a scholarship/funding opportunity (a SECONDARY feature).
 *
 * Rendered with a quieter, secondary surface so it never competes with the
 * primary employment opportunities. Shows funding level, study level,
 * destination and an opens label, plus a "Set reminder" affordance.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";

export interface ScholarshipCardProps {
  name: string;
  funded?: "full" | "partial";
  level?: string;
  destination?: string;
  opensLabel?: string;
  onPress?: () => void;
  onRemind?: () => void;
  style?: ViewStyle;
}

export function ScholarshipCard({
  name,
  funded,
  level,
  destination,
  opensLabel,
  onPress,
  onRemind,
  style,
}: ScholarshipCardProps) {
  const { colors } = useTheme();

  const fundedLabel =
    funded === "full"
      ? "Fully funded"
      : funded === "partial"
        ? "Partially funded"
        : null;

  const subline = [level, destination].filter(Boolean).join(" · ");

  const Container: any = onPress ? TouchableOpacity : View;

  return (
    <Container
      {...(onPress ? { onPress, activeOpacity: 0.85 } : {})}
      style={[
        styles.card,
        { backgroundColor: colors.bgSecondary, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.glyph}>🎓</Text>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {name}
          </Text>
          {subline ? (
            <Text
              style={[styles.subline, { color: colors.textSoft }]}
              numberOfLines={1}
            >
              {subline}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.metaRow}>
        {fundedLabel ? (
          <View
            style={[
              styles.pill,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.pillText, { color: colors.textSoft }]}>
              {fundedLabel}
            </Text>
          </View>
        ) : null}
        {opensLabel ? (
          <View
            style={[
              styles.pill,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.pillText, { color: colors.textMuted }]}>
              🗓️ {opensLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {onRemind ? (
        <TouchableOpacity
          onPress={onRemind}
          activeOpacity={0.7}
          style={[styles.remind, { borderColor: colors.border }]}
        >
          <Text style={[styles.remindText, { color: colors.text }]}>
            🔔 Set reminder
          </Text>
        </TouchableOpacity>
      ) : null}
    </Container>
  );
}

export default ScholarshipCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  glyph: { fontSize: 22, lineHeight: 26 },
  headerText: { flex: 1, gap: 2 },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    lineHeight: FontSize.lg * 1.25,
  },
  subline: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  pill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  remind: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  remindText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
