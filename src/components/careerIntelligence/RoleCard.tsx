import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import {
  CompassFonts,
  useTheme,
  Spacing,
  Radius,
  FontSize,
  type TierType,
} from "@/theme";
import type { RoleMatchType, Readiness } from "@/types/career";
import { PressableCard, SifterCard } from "../ui";
import { RoleMatchBadge } from "./RoleMatchBadge";
import { ReadinessBadgeView } from "./ReadinessBadgeView";
import { TierBadgeView } from "./TierBadgeView";
import { DomainIcon } from "./DomainIcon";

export interface RoleCardProps {
  id: string;
  name: string;
  alsoKnownAs?: string[];
  /**
   * ESCO skill-coverage label. OPTIONAL: omit it where coverage has not been
   * computed. It was required, so callers with no coverage data passed
   * `match="match" coverageRatio={0}` to satisfy the type — which rendered
   * "Match · 0%" on every role of every domain, asserting >=50% coverage and
   * 0% coverage in the same badge.
   */
  match?: RoleMatchType;
  /** 0..1 ESCO coverage. Omit when unknown; 0 means "measured, and it is 0". */
  coverageRatio?: number;
  readiness?: Readiness;
  tier?: TierType;
  eliteFlag?: boolean;
  salaryNgnMin?: number;
  salaryNgnMax?: number;
  companiesHiring?: string[];
  domainId?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

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
  eliteFlag,
  salaryNgnMin,
  salaryNgnMax,
  companiesHiring,
  domainId,
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
        {domainId ? <DomainIcon domainId={domainId} size={14} /> : null}
        <View style={styles.titleCol}>
          <Text
            style={[styles.title, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}
            numberOfLines={2}
          >
            {name}
          </Text>
          {aka ? (
            <Text
              style={[styles.aka, { color: colors.textRole.muted }, CompassFonts.body]}
              numberOfLines={1}
            >
              {aka}
            </Text>
          ) : null}
        </View>
        {match || eliteFlag ? (
          <RoleMatchBadge
            match={match}
            coverageRatio={coverageRatio}
            elite={eliteFlag}
          />
        ) : null}
      </View>

      {(readiness || tier) ? (
        <View style={styles.badgeRow}>
          {readiness ? <ReadinessBadgeView readiness={readiness} size="sm" /> : null}
          {tier ? <TierBadgeView tier={tier} /> : null}
        </View>
      ) : null}

      {eliteFlag ? (
        <View style={styles.chipRow}>
          {eliteFlag ? (
            <View
              style={[
                styles.chip,
                { backgroundColor: colors.accentRole.warning + "18", borderColor: colors.accentRole.warning },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.accentRole.warning }, CompassFonts.data]}>Elite</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {salary ? (
        <View style={styles.metaRow}>
          <DomainIcon domainId={domainId} size={12} />
          <Text style={[styles.metaText, CompassFonts.data, { color: colors.textRole.secondary }]}>
            {salary}
          </Text>
        </View>
      ) : null}

      {companies ? (
        <View style={styles.metaRow}>
          <DomainIcon domainId={domainId} size={12} />
          <Text
            style={[styles.metaText, { color: colors.textRole.muted }, CompassFonts.body]}
            numberOfLines={1}
          >
            <Text style={CompassFonts.bodySemibold}>Companies: </Text>
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
    gap: Spacing.sm,
  },
  titleCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.25,
  },
  aka: {
    fontSize: FontSize.sm,
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
  },
  metaText: {
    flex: 1,
    fontSize: FontSize.xs,
  },
});
