/**
 * RoleCard — a single role within a matched domain (CCMAS v3.0 Step 2).
 *
 * Surfaces a role's identity, its ESCO-coverage fit (via RoleMatchBadge — the
 * "Match"/"Adjacent" label is owned there and never relabelled here), and any
 * optional signals: a compact ₦ salary range and the companies hiring for it.
 * Presentational only — pass `onPress` to make it a tappable card.
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CompassFonts,
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  type TierType,
} from "../../theme";
import type { RoleMatchType, Readiness } from "../../types/career";
import { PressableCard, SifterCard } from "../ui";
import { RoleMatchBadge } from "./RoleMatchBadge";
import { ReadinessBadgeView } from "./ReadinessBadgeView";
import { TierBadgeView } from "./TierBadgeView";

export interface RoleCardProps {
  /** Role id (from RoleSummary). */
  id: string;
  name: string;
  alsoKnownAs?: string[];
  match: RoleMatchType;
  /** 0..1 ESCO essential-skill coverage. */
  coverageRatio: number;
  /** Readiness label (ready/bridge/stretch) from programme context. */
  readiness?: Readiness;
  /** Career stage (entry/mid/senior). */
  tier?: TierType;
  inDemandScore?: number;
  eliteFlag?: boolean;
  /** Optional monthly salary band (NGN). */
  salaryNgnMin?: number;
  salaryNgnMax?: number;
  /** Optional sample of organisations hiring for this role. */
  companiesHiring?: string[];
  onPress?: () => void;
  style?: ViewStyle;
}

/** Compact naira formatter: 180000 → "₦180K", 1_200_000 → "₦1.2M". */
function formatNgn(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    const s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `₦${s}M`;
  }
  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}K`;
  }
  return `₦${value}`;
}

function formatSalary(min?: number, max?: number): string | null {
  if (typeof min === "number" && typeof max === "number") {
    return `${formatNgn(min)}–${formatNgn(max)}/mo`;
  }
  if (typeof min === "number") return `From ${formatNgn(min)}/mo`;
  if (typeof max === "number") return `Up to ${formatNgn(max)}/mo`;
  return null;
}

export function RoleCard({
  name,
  alsoKnownAs,
  match,
  coverageRatio,
  readiness,
  tier,
  inDemandScore,
  eliteFlag,
  salaryNgnMin,
  salaryNgnMax,
  companiesHiring,
  onPress,
  style,
}: RoleCardProps) {
  const { colors } = useTheme();
  const salary = formatSalary(salaryNgnMin, salaryNgnMax);
  const aka = alsoKnownAs?.length ? alsoKnownAs.join(", ") : null;
  const companies = companiesHiring?.length
    ? companiesHiring.join(" · ")
    : null;

  const body = (
    <View style={styles.body}>
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text
            style={[styles.title, { color: colors.textRole.primary }]}
            numberOfLines={2}
          >
            {name}
          </Text>
          {aka ? (
            <Text
              style={[styles.aka, { color: colors.textRole.muted }]}
              numberOfLines={1}
            >
              {aka}
            </Text>
          ) : null}
        </View>
        <RoleMatchBadge
          match={match}
          coverageRatio={coverageRatio}
          elite={eliteFlag}
        />
      </View>

      {/* Readiness + career-stage badges (from programme context). */}
      {(readiness || tier) ? (
        <View style={styles.badgeRow}>
          {readiness ? <ReadinessBadgeView readiness={readiness} size="sm" /> : null}
          {tier ? <TierBadgeView tier={tier} /> : null}
        </View>
      ) : null}

      {/* Compact demand/elite chips */}
      {(inDemandScore != null || eliteFlag) ? (
        <View style={styles.chipRow}>
          {eliteFlag ? (
            <View
              style={[
                styles.chip,
                { backgroundColor: colors.eliteSoft, borderColor: colors.elite },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.elite }]}>Elite</Text>
            </View>
          ) : null}
          {inDemandScore != null && inDemandScore > 0 ? (
            <View
              style={[
                styles.chip,
                { backgroundColor: colors.demandSoft, borderColor: colors.demand },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.demand }]}>
                {inDemandScore >= 80 ? "High demand" : inDemandScore >= 50 ? "In demand" : "Growing"}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {salary ? (
        <View style={styles.metaRow}>
          <Feather name="credit-card" size={14} color={colors.textRole.muted} />
          <Text style={[styles.metaText, CompassFonts.data, { color: colors.textRole.secondary }]}>
            {salary}
          </Text>
        </View>
      ) : null}

      {companies ? (
        <View style={styles.metaRow}>
          <Feather name="briefcase" size={14} color={colors.textRole.muted} />
          <Text
            style={[styles.metaText, { color: colors.textRole.muted }]}
            numberOfLines={1}
          >
            <Text style={{ fontWeight: FontWeight.semibold }}>Companies: </Text>
            {companies}
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableCard onPress={onPress} style={[styles.card, style]}>
        {body}
      </PressableCard>
    );
  }

  return <SifterCard style={[styles.card, style]}>{body}</SifterCard>;
}

export default RoleCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.sm,
  },
  body: {
    gap: Spacing.sm,
    padding: Spacing.sm,
    minHeight: 44,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.md * 1.25,
  },
  aka: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  metaText: {
    flex: 1,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
