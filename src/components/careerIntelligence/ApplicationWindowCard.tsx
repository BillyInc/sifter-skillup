/**
 * ApplicationWindowCard — the status of an application window.
 *
 * Status is colour-coded via theme: open (green), opening_soon (amber),
 * closing_soon (red), closed (muted). Shows a "🔔 Remind me" affordance when
 * `onRemind` is provided.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../theme";
import { PressLift } from "../animations/PressLift";

export type ApplicationWindowStatus =
  | "open"
  | "opening_soon"
  | "closing_soon"
  | "closed";

export interface ApplicationWindowCardProps {
  title: string;
  status: ApplicationWindowStatus;
  whenLabel: string;
  onPress?: () => void;
  onRemind?: () => void;
  style?: ViewStyle;
}

const STATUS_LABEL: Record<ApplicationWindowStatus, string> = {
  open: "Open",
  opening_soon: "Opening soon",
  closing_soon: "Closing soon",
  closed: "Closed",
};

export function ApplicationWindowCard({
  title,
  status,
  whenLabel,
  onPress,
  onRemind,
  style,
}: ApplicationWindowCardProps) {
  const { colors } = useTheme();

  const statusColors = (): { bg: string; text: string } => {
    switch (status) {
      case "open":
        return { bg: colors.greenSoft, text: colors.green };
      case "opening_soon":
        return { bg: colors.goldSoft, text: colors.gold };
      case "closing_soon":
        return { bg: colors.redSoft, text: colors.red };
      case "closed":
      default:
        return { bg: colors.bgSecondary, text: colors.textMuted };
    }
  };

  const sc = statusColors();

  return (
    <PressLift
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={[styles.when, { color: colors.textSoft }]}
            numberOfLines={1}
          >
            {whenLabel}
          </Text>
        </View>
        <View style={styles.statusWrap}>
          <View style={[styles.statusDot, { backgroundColor: sc.text }]} />
          <View style={[styles.badge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.badgeText, { color: sc.text }]}>
              {STATUS_LABEL[status]}
            </Text>
          </View>
        </View>
      </View>

      {onRemind ? (
        <TouchableOpacity
          onPress={onRemind}
          activeOpacity={0.7}
          style={[styles.remind, { borderColor: colors.border }]}
        >
          <Text style={[styles.remindText, { color: colors.text }]}>
            🔔 Remind me
          </Text>
        </TouchableOpacity>
      ) : null}
    </PressLift>
  );
}

export default ApplicationWindowCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  headerText: { flex: 1, gap: 2 },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    lineHeight: FontSize.lg * 1.25,
  },
  when: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  statusWrap: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: Radius.full },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
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
