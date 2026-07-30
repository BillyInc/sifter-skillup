/**
 * OrganisationCard — an employer/organisation summary.
 *
 * Shows name, sector, country, an optional "🇳🇬 Nigeria office" pill, and a
 * likelihood badge (high / medium / low) coloured via theme tokens.
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
import type { Organisation, Likelihood } from "../../types/career";
import { PressLift } from "../animations/PressLift";

export interface OrganisationCardProps {
  organisation: Organisation;
  onPress?: () => void;
  style?: ViewStyle;
}

const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  high: "High likelihood",
  medium: "Medium likelihood",
  low: "Low likelihood",
};

export function OrganisationCard({
  organisation,
  onPress,
  style,
}: OrganisationCardProps) {
  const { colors } = useTheme();
  const org = organisation;

  const likelihoodStyle = (
    l?: Likelihood,
  ): { bg: string; text: string } | null => {
    if (l === "high") return { bg: colors.greenSoft, text: colors.green };
    if (l === "medium") return { bg: colors.goldSoft, text: colors.gold };
    if (l === "low") return { bg: colors.bgSecondary, text: colors.textMuted };
    return null;
  };

  const ll = likelihoodStyle(org.likelihood);
  const subline = [org.sector, org.country].filter(Boolean).join(" · ");

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
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {org.name}
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
        {ll ? (
          <View style={[styles.badge, { backgroundColor: ll.bg }]}>
            <Text style={[styles.badgeText, { color: ll.text }]}>
              {LIKELIHOOD_LABEL[org.likelihood as Likelihood]}
            </Text>
          </View>
        ) : null}
      </View>

      {org.nigeriaOffice ? (
        <View
          style={[
            styles.pill,
            { backgroundColor: colors.greenSoft, borderColor: colors.green },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.green }]}>
            🇳🇬 Nigeria office
          </Text>
        </View>
      ) : null}
    </PressLift>
  );
}

export default OrganisationCard;

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
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    lineHeight: FontSize.lg * 1.25,
  },
  subline: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
