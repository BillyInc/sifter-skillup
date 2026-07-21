/**
 * RoleDetailScreen — the deep view for a single role in the v2 taxonomy.
 *
 * Consumes careerData.getRoleV2(roleKey) → DataState<DomainRoleV2>. Teaches the
 * student what the role needs (essential vs optional skills) and that a role is
 * a destination reachable from MULTIPLE fields (appearsIn). Loading / coming_soon
 * / error are handled by DetailScaffold's DataStateView.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  DetailScaffold,
  TierBadgeView,
  NotesWidget,
  LevelUpCTA,
  SkillsBridge,
  MappingFeedbackButton,
  SectionLabel,
} from "@/components/careerIntelligence";
import { DemandMetricsBlock } from "@/components/careerIntelligence/DemandMetricsBlock";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type DomainRoleV2,
  type DomainRoleV2Enriched,
} from "@/types/career";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "@/theme";
import type { ColorPalette } from "@/theme";

export interface RoleDetailScreenProps {
  /** Stable role key (e.g. "D011|securities trader"). */
  roleId?: string;
}

export function RoleDetailScreen(props: RoleDetailScreenProps) {
  const params = useLocalSearchParams<{ id: string }>();
  const roleKey = props.roleId ?? String(params.id ?? "");

  const [state, setState] = useState<DataState<DomainRoleV2>>(() =>
    comingSoon<DomainRoleV2>("Role detail is being populated."),
  );

  useEffect(() => {
    let alive = true;
    careerData.getRoleV2(roleKey).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [roleKey]);

  return (
    <DetailScaffold
      eyebrow="ROLE"
      title={state.data?.name ?? "Role"}
      save={{ entityType: "role", entityId: roleKey }}
      pdf
      state={state}
    >
      {(role) => <RoleBody role={role} roleKey={roleKey} />}
    </DetailScaffold>
  );
}

function RoleBody({ role, roleKey }: { role: DomainRoleV2; roleKey: string }) {
  const { colors } = useTheme();
  const router = useRouter();

  const aka = role.alsoKnownAs?.length ? role.alsoKnownAs.join(", ") : null;
  const essential = role.essentialSkills ?? [];
  const optional = role.optionalSkills ?? [];
  const appearsIn = role.appearsIn ?? [];
  const enriched = role as DomainRoleV2Enriched;
  const currency = enriched.currencyStatus;

  return (
    <View style={{ gap: Spacing.lg }}>
      {/* 1 — identity: aka, tier, elite, currency */}
      {aka || role.tier || isElite(role.eliteStatus) || currency ? (
        <View style={{ gap: Spacing.sm }}>
          {aka ? (
            <Text style={[styles.aka, { color: colors.textMuted }]}>
              Also known as: {aka}
            </Text>
          ) : null}
          {role.tier || isElite(role.eliteStatus) || currency ? (
            <View style={styles.badgeRow}>
              {currency ? (
                <CurrencyBadge
                  status={currency}
                  source={enriched.currencySource}
                />
              ) : null}
              <TierBadgeView tier={role.tier} />
              {isElite(role.eliteStatus) ? (
                <View
                  style={[
                    styles.eliteChip,
                    { backgroundColor: colors.eliteSoft, borderColor: colors.elite },
                  ]}
                >
                  <Text style={styles.eliteGlyph}>★</Text>
                  <Text style={[styles.eliteText, { color: colors.gold }]}>
                    Elite role
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
          {currency && enriched.currencySource ? (
            <Text style={[styles.currencySource, { color: colors.textMuted }]}>
              Verified via {formatCurrencySource(enriched.currencySource)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* 2 — what you'd need: essential + optional skills */}
      {essential.length || optional.length ? (
        <View style={{ gap: Spacing.md }}>
          {essential.length ? (
            <View style={{ gap: Spacing.sm }}>
              <SectionLabel>Essential skills</SectionLabel>
              <ChipCloud items={essential} colors={colors} prominent />
            </View>
          ) : null}
          {optional.length ? (
            <View style={{ gap: Spacing.sm }}>
              <SectionLabel>Optional / edge skills</SectionLabel>
              <ChipCloud items={optional} colors={colors} prominent={false} />
            </View>
          ) : null}
        </View>
      ) : null}

      {/* 2b — skills bridge: the role's essentials framed as what to build. */}
      {essential.length ? (
        <SkillsBridge
          domainBridgeSkills={essential.map((name) => ({ name }))}
          roleBridgeSkills={optional.map((name) => ({ name }))}
        />
      ) : null}

      {/* 3 — reachable from: role is a destination from multiple fields */}
      {appearsIn.length ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Reachable from</SectionLabel>
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            This role is a destination from {appearsIn.length}{" "}
            {appearsIn.length === 1 ? "field" : "fields"}.
          </Text>
          <View style={styles.appearsWrap}>
            {appearsIn.map((a) => (
              <Text
                key={a.domainId}
                onPress={() => exploreNav.domain(router, a.domainId)}
                style={[
                  styles.domainChip,
                  {
                    backgroundColor: colors.surface.subtle,
                    borderColor: colors.borderRole.subtle,
                    color: colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {a.domainName}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* 4 — notes + level-up CTA */}
      <DemandMetricsBlock metrics={role.demandMetrics?.ng_local} title="Local demand" />
      <MappingFeedbackButton
        edgeType="domain_role"
        sourceId={appearsIn[0]?.domainId ?? roleKey}
        sourceLabel={appearsIn[0]?.domainName ?? "This field"}
        targetId={roleKey}
        targetLabel={role.name}
        compact
      />
      <NotesWidget entityType="role" entityId={roleKey} />
      <LevelUpCTA
        title="Build toward this role"
        body="Close the skill gap one level at a time — your path starts in your world."
      />
    </View>
  );
}

/** A wrapping cloud of skill chips, consistent with ToolGroupsBlock's chips. */
function ChipCloud({
  items,
  colors,
  prominent,
}: {
  items: string[];
  colors: ColorPalette;
  prominent: boolean;
}) {
  const bg = prominent ? colors.surface.subtle : colors.surface.raised;
  const border = colors.borderRole.subtle;
  const textColor = prominent ? colors.textRole.primary : colors.textRole.secondary;
  return (
    <View style={styles.chipWrap}>
      {items.map((s, i) => (
        <View
          key={`${s}-${i}`}
          style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
        >
          <Text
            style={[
              styles.chipText,
              {
                color: textColor,
                fontWeight: prominent ? FontWeight.bold : FontWeight.semibold,
              },
            ]}
            numberOfLines={1}
          >
            {s}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Elite unless the status is empty or explicitly deferred. */
function isElite(status?: string): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s.length > 0 && s !== "deferred" && s !== "none";
}

/** A role's WEF/O*NET currency status — current (neutral/green), emerging (blue),
 *  legacy (muted). Only "emerging"/"legacy" are worth surfacing prominently, but
 *  we show all three so the signal is honest. */
function CurrencyBadge({
  status,
  source: _source,
}: {
  status: NonNullable<DomainRoleV2Enriched["currencyStatus"]>;
  source?: DomainRoleV2Enriched["currencySource"];
}) {
  const { colors } = useTheme();
  const config: Record<
    typeof status,
    { label: string; bg: string; text: string; border: string }
  > = {
    current: {
      label: "Current",
      bg: colors.greenSoft,
      text: colors.green,
      border: colors.green,
    },
    emerging: {
      label: "Emerging",
      bg: colors.infoSoft,
      text: colors.info,
      border: colors.borderRole.subtle,
    },
    legacy: {
      label: "Legacy",
      bg: colors.surface.subtle,
      text: colors.textRole.muted,
      border: colors.borderRole.subtle,
    },
  };
  const c = config[status];
  return (
    <View
      style={[
        styles.currencyChip,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <Text style={[styles.currencyText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

/** Human-readable label for the currency provenance source. */
function formatCurrencySource(
  source: NonNullable<DomainRoleV2Enriched["currencySource"]>,
): string {
  const map: Record<typeof source, string> = {
    wef_foj_2025: "WEF Future of Jobs 2025",
    onet_emerging: "O*NET Emerging",
    lightcast: "Lightcast",
    curated: "curated review",
  };
  return map[source] ?? source;
}

export default RoleDetailScreen;

const styles = StyleSheet.create({
  aka: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.4,
  },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  currencyChip: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  currencyText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  currencySource: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  eliteChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  eliteGlyph: { fontSize: FontSize.xs },
  eliteText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  chipText: { fontSize: FontSize.sm },
  appearsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  domainChip: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
