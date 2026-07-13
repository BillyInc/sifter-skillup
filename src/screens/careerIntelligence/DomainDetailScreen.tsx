/**
 * DomainDetailScreen — the heart of the v2 taxonomy: a single field, its common
 * skills, the tools/certs that gate it, and the roles within it grouped by
 * sub-cluster.
 *
 * Consumes the v2 contract via careerData.getDomainV2(domainKey) → DataState<DomainV2>.
 * Readiness is programme-relative and does NOT exist on a bare domain view, so
 * roles show tier + elite only (never a faked match/readiness badge). Loading /
 * coming_soon / error are handled by DetailScaffold's DataStateView.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "@/theme";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type DomainV2,
  type DomainRoleSummary,
} from "@/types/career";
import { DemandMetricsBlock } from "@/components/careerIntelligence/DemandMetricsBlock";
import {
  DetailScaffold,
  FoundationSkillsBlock,
  ToolGroupsBlock,
  CertPlacementList,
  RoleClusterSection,
  RoleCard,
  NotesWidget,
  LevelUpCTA,
  RouteLine,
  SkillsBridge,
  MappingFeedbackButton,
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";

export interface DomainDetailScreenProps {
  /** Stable domain key (e.g. "D001"). */
  domainId?: string;
}

export function DomainDetailScreen(props: DomainDetailScreenProps) {
  const params = useLocalSearchParams<{ id: string }>();
  const domainKey = props.domainId ?? String(params.id ?? "");

  const [state, setState] = useState<DataState<DomainV2>>(() =>
    comingSoon<DomainV2>("Domain detail is being populated."),
  );

  useEffect(() => {
    let alive = true;
    careerData.getDomainV2(domainKey).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [domainKey]);

  return (
    <DetailScaffold
      eyebrow="DOMAIN"
      title={state.data?.name ?? "Domain"}
      save={{ entityType: "domain", entityId: domainKey }}
      pdf
      state={state}
    >
      {(domain) => <DomainBody domain={domain} domainKey={domainKey} />}
    </DetailScaffold>
  );
}

function DomainBody({
  domain,
  domainKey,
}: {
  domain: DomainV2;
  domainKey: string;
}) {
  const { colors } = useTheme();
  const router = useRouter();

  const cluster = domain.cluster ?? domain.clusters?.[0];
  const roles = domain.roles ?? [];
  const subgroups = domain.subgroups ?? [];

  const renderRoleCard = (role: DomainRoleSummary) => (
    <RoleCard
      key={role.key}
      id={role.key}
      name={role.name}
      alsoKnownAs={role.alsoKnownAs}
      match="match"
      coverageRatio={0}
      eliteFlag={isElite(role.eliteStatus)}
      onPress={() => exploreNav.role(router, role.key)}
    />
  );

  // Group roles by subgroup; leftovers → "Other roles".
  let otherRoles: DomainRoleSummary[] = [];
  if (subgroups.length) {
    otherRoles = roles.filter(
      (r) => !subgroups.some((sg) => sg.id === r.subgroupId),
    );
  }

  return (
    <View style={{ gap: Spacing.lg }}>
      {/* 1 — description + cluster chip + elite badge */}
      {domain.description || cluster || domain.eliteDomain ? (
        <View style={{ gap: Spacing.sm }}>
          {domain.description ? (
            <Text style={[styles.body, { color: colors.textSoft }]}>
              {domain.description}
            </Text>
          ) : null}
          {cluster || domain.eliteDomain ? (
            <View style={styles.chipRow}>
              {cluster ? (
                <View
                  style={[
                    styles.clusterChip,
                    {
                      backgroundColor: colors.bgSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.clusterText, { color: colors.textSoft }]}
                    numberOfLines={1}
                  >
                    {cluster}
                  </Text>
                </View>
              ) : null}
              {domain.eliteDomain ? (
                <View
                  style={[
                    styles.eliteChip,
                    { backgroundColor: colors.goldSoft, borderColor: colors.gold },
                  ]}
                >
                  <Text style={styles.eliteGlyph}>★</Text>
                  <Text style={[styles.eliteText, { color: colors.gold }]}>
                    Elite field
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Wayfinding: this field's place on the journey — foundations you build,
          the field itself, the roles it opens. Edges are Direct→solid. */}
      <RouteLine
        variant="spine"
        stations={[
          { state: "you", label: "Foundations" },
          { state: "bridge", label: cluster ?? "This field" },
          { state: "target", label: `${roles.length || ""} roles`.trim() },
        ]}
        edges={["solid", "dashed"]}
      />

      {/* Demand metrics block */}
      <DemandMetricsBlock metrics={domain.demandMetrics?.ng_local} title="Local demand" />

      {/* 2 — common (foundation) skills */}
      <FoundationSkillsBlock
        skills={domain.foundationSkills ?? []}
        title="Common skills in this field"
      />

      {/* 2b — 3-tier skills bridge (domain entry skills → what to build) */}
      {(domain.foundationSkills?.length ?? 0) > 0 ? (
        <SkillsBridge
          domainBridgeSkills={(domain.foundationSkills ?? []).map((s) => ({
            name: s.skill,
          }))}
        />
      ) : null}

      {/* 3 — domain-wide tools */}
      <ToolGroupsBlock tools={domain.tools} title="Tools used in this field" />

      {/* 4 — gateway + role-hint certs (empty gateway is meaningful) */}
      <View style={{ gap: Spacing.sm }}>
        <SectionHeader title="Certifications" icon="🎓" />
        <CertPlacementList
          gateway={domain.gatewayCertifications}
          roleHint={domain.roleHintCertifications}
        />
      </View>

      {/* Per-edge expert/user flag on the domain mapping. */}
      <MappingFeedbackButton
        edgeType="programme_domain"
        sourceId={domain.id}
        sourceLabel={domain.name}
        targetId={domain.id}
        targetLabel={domain.name}
        compact
      />

      {/* 5 — roles, grouped by sub-cluster when subgroups exist */}
      {roles.length ? (
        subgroups.length ? (
          <View style={{ gap: Spacing.md }}>
            <SectionHeader title="Roles in this field" icon="🧭" />
            {subgroups.map((sg, i) => {
              const sgRoles = roles.filter((r) => r.subgroupId === sg.id);
              if (!sgRoles.length) return null;
              return (
                <RoleClusterSection
                  key={sg.id}
                  subgroup={sg}
                  defaultOpen={i === 0}
                >
                  <View style={styles.roleList}>
                    {sgRoles.map(renderRoleCard)}
                  </View>
                </RoleClusterSection>
              );
            })}
            {otherRoles.length ? (
              <View style={{ gap: Spacing.sm }}>
                <Text style={[styles.otherLabel, { color: colors.textMuted }]}>
                  Other roles
                </Text>
                <View style={styles.roleList}>
                  {otherRoles.map(renderRoleCard)}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            <SectionHeader title="Roles" icon="🧭" />
            <View style={styles.roleList}>{roles.map(renderRoleCard)}</View>
          </View>
        )
      ) : null}

      {/* 6 — notes + level-up CTA */}
      <NotesWidget entityType="domain" entityId={domainKey} />
      <LevelUpCTA />
    </View>
  );
}

/** Elite unless the status is empty or explicitly deferred. */
function isElite(status?: string): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s.length > 0 && s !== "deferred" && s !== "none";
}

export default DomainDetailScreen;

const styles = StyleSheet.create({
  body: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  clusterChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  clusterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  eliteChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  eliteGlyph: { fontSize: FontSize.xs },
  eliteText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  roleList: { gap: Spacing.sm },
  otherLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});