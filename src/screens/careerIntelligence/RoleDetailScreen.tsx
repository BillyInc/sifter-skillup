/**
 * RoleDetailScreen — the deep view for a single role in the v2 taxonomy.
 *
 * Flagship redesign (Phase 10): hero with badges, stat-tile demand row,
 * "routes into this role" journey, skills bridge, and related roles rail.
 * Uses the careerIntelligence component library for all design-system tokens.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  DetailScaffold,
  TierBadgeView,
  NotesWidget,
  LevelUpCTA,
  SkillsBridge,
  MappingFeedbackButton,
  SectionLabel,
  StatTile,
  RouteLine,
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
import { useTheme, Spacing, Radius, FontSize, FontWeight, CompassFonts } from "@/theme";
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
  const metrics = role.demandMetrics?.ng_local;

  return (
    <View style={styles.body}>
      {/* 1 — identity badges */}
      {(aka || role.tier || isElite(role.eliteStatus) || currency) ? (
        <View style={styles.identitySection}>
          {aka ? (
            <Text style={[styles.aka, { color: colors.textRole.muted }]}>
              Also known as: {aka}
            </Text>
          ) : null}
          {role.tier || isElite(role.eliteStatus) || currency ? (
            <View style={styles.badgeRow}>
              {currency ? (
                <CurrencyBadge status={currency} source={enriched.currencySource} />
              ) : null}
              <TierBadgeView tier={role.tier} />
              {isElite(role.eliteStatus) ? (
                <View
                  style={[
                    styles.eliteChip,
                    {
                      backgroundColor: colors.accentRole.status + "14",
                      borderColor: colors.accentRole.status,
                    },
                  ]}
                >
                  <Text style={styles.eliteGlyph}>★</Text>
                  <Text style={[styles.eliteText, { color: colors.accentRole.status }]}>
                    Elite role
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
          {currency && enriched.currencySource ? (
            <Text style={[styles.currencySource, { color: colors.textRole.muted }]}>
              Verified via {formatCurrencySource(enriched.currencySource)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* 2 — demand stats row */}
      <DemandMetricsBlock metrics={metrics} title="Demand snapshot" />

      {/* 3 — routes into this role */}
      <RouteIntoSection appearsIn={appearsIn} careerLadder={role.careerLadder} router={router} colors={colors} />

      {/* 4 — skills bridge: what to build */}
      {essential.length ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Skills gap</SectionLabel>
          <SkillsBridge
            domainBridgeSkills={essential.map((name) => ({ name }))}
            roleBridgeSkills={optional.map((name) => ({ name }))}
          />
        </View>
      ) : null}

      {/* 5 — essential / optional skill chips (compact reference) */}
      {(essential.length || optional.length) ? (
        <View style={{ gap: Spacing.sm }}>
          {essential.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }]}>
                Essential
              </Text>
              <ChipCloud items={essential} colors={colors} prominent />
            </View>
          ) : null}
          {optional.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }]}>
                Optional / edge
              </Text>
              <ChipCloud items={optional} colors={colors} prominent={false} />
            </View>
          ) : null}
        </View>
      ) : null}

      {/* 6 — related roles from career ladder */}
      {role.careerLadder?.length ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Related roles</SectionLabel>
          <View style={styles.relatedWrap}>
            {role.careerLadder.map((name, i) => (
              <RelatedRoleChip
                key={`${name}-${i}`}
                name={name}
                colors={colors}
                onPress={() => {
                  const slug = `${roleKey.split("|")[0]}|${name.toLowerCase()}`;
                  exploreNav.role(router, slug);
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* 7 — footer actions */}
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

// ─── Sub-components ───────────────────────────────────────────

/** "Routes into this role" — shows career ladder as a journey diagram. */
function RouteIntoSection({
  appearsIn,
  careerLadder,
  router,
  colors,
}: {
  appearsIn: DomainRoleV2["appearsIn"];
  careerLadder?: string[];
  router: ReturnType<typeof useRouter>;
  colors: ColorPalette;
}) {
  const hasLadder = careerLadder?.length;
  const hasDomains = appearsIn.length;

  if (!hasLadder && !hasDomains) return null;

  return (
    <View style={{ gap: Spacing.sm }}>
      <SectionLabel>Routes into this role</SectionLabel>

      {hasDomains ? (
        <Text style={[styles.routeCaption, { color: colors.textRole.muted }]}>
          Reachable from {appearsIn.length} {appearsIn.length === 1 ? "field" : "fields"}
        </Text>
      ) : null}

      {/* Domain entry points as a spine */}
      {hasDomains ? (
        <View style={styles.domainChips}>
          {appearsIn.map((a) => (
            <TouchableOpacity
              key={a.domainId}
              onPress={() => exploreNav.domain(router, a.domainId)}
              style={[
                styles.domainChip,
                {
                  backgroundColor: colors.surface.subtle,
                  borderColor: colors.borderRole.subtle,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.domainChipText, { color: colors.textRole.primary }]} numberOfLines={1}>
                {a.domainName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Career ladder as a journey route-line */}
      {hasLadder ? (
        <RouteLine
          variant="journey"
          stations={[
            { state: "you", label: "You are here" },
            ...careerLadder!.map((step, i) => ({
              state: (i === careerLadder!.length - 1 ? "target" : "bridge") as "target" | "bridge",
              label: step,
            })),
          ]}
          edges={[
            "solid",
            ...careerLadder!.slice(1).map(() => "solid" as const),
          ]}
        />
      ) : null}
    </View>
  );
}

/** A tappable chip for a related role. */
function RelatedRoleChip({
  name,
  colors,
  onPress,
}: {
  name: string;
  colors: ColorPalette;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.relatedChip,
        {
          backgroundColor: colors.surface.subtle,
          borderColor: colors.borderRole.subtle,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.relatedChipText, { color: colors.textRole.primary }]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.relatedArrow, { color: colors.textRole.muted }]}>→</Text>
    </TouchableOpacity>
  );
}

/** A wrapping cloud of skill chips. */
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
              { color: textColor },
              prominent ? CompassFonts.bodyBold : CompassFonts.bodySemibold,
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

/** A role's WEF/O*NET currency status badge. */
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
      bg: colors.accentRole.success + "18",
      text: colors.accentRole.success,
      border: colors.accentRole.success,
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
  body: {
    gap: Spacing.lg,
  },

  // identity
  identitySection: { gap: Spacing.sm },
  aka: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.4,
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

  // routes
  routeCaption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  domainChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  domainChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  domainChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // chips
  chipLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
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

  // related roles
  relatedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  relatedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  relatedChipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  relatedArrow: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
