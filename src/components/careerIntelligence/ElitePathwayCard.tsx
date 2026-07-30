/**
 * ElitePathwayCard — a premium-feeling card for elite career pathways.
 *
 * Carries a "⭐ Elite" badge, a truncated firms line, compensation and
 * selectivity rows, and an optional "🇳🇬 Nigerian advantage" pill. Styled with
 * the gold accent so it reads as aspirational without breaking house style.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
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

export interface ElitePathwayCardProps {
  name: string;
  firms?: string[];
  compensationLabel?: string;
  selectivityLabel?: string;
  nigerianAdvantage?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ElitePathwayCard({
  name,
  firms,
  compensationLabel,
  selectivityLabel,
  nigerianAdvantage,
  onPress,
  style,
}: ElitePathwayCardProps) {
  const { colors } = useTheme();

  const firmsLine = firms?.length ? firms.join(" · ") : null;

  return (
    <PressLift
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.gold,
        },
        Shadow.glowGold,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>
        <View style={[styles.eliteBadge, { backgroundColor: colors.goldSoft }]}>
          <Text style={[styles.eliteText, { color: colors.gold }]}>
            ⭐ Elite
          </Text>
        </View>
      </View>

      {firmsLine ? (
        <Text
          style={[styles.firms, { color: colors.textSoft }]}
          numberOfLines={1}
        >
          {firmsLine}
        </Text>
      ) : null}

      <View style={styles.rows}>
        {compensationLabel ? (
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
              💰 Compensation
            </Text>
            <Text
              style={[styles.rowValue, { color: colors.text }]}
              numberOfLines={1}
            >
              {compensationLabel}
            </Text>
          </View>
        ) : null}
        {selectivityLabel ? (
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
              🎯 Selectivity
            </Text>
            <Text
              style={[styles.rowValue, { color: colors.text }]}
              numberOfLines={1}
            >
              {selectivityLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {nigerianAdvantage ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: colors.greenSoft, borderColor: colors.green },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.green }]}>
            🇳🇬 Nigerian advantage
          </Text>
        </View>
      ) : null}
    </PressLift>
  );
}

export default ElitePathwayCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  name: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.xl * 1.2,
  },
  eliteBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  eliteText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.3,
  },
  firms: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  rows: { gap: Spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  rowLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    width: 130,
  },
  rowValue: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
