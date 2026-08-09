/**
 * DomainDetailScreen — the heart of the v2 taxonomy: a single field, its common
 * skills, the tools/certs that gate it, and the roles within it grouped by
 * sub-cluster.
 *
 * Consumes the v2 contract via careerData.getDomainV2(domainKey) → DataState<DomainV2>.
 *
 * Phase 10 redesign: hero icon with cluster color, StatTile demand row,
 * responsive 2-column desktop layout, section nav (clickable), data-source
 * badge footer, all legacy tokens migrated to semantic equivalents.
 *
 * Sticky section nav with auto-scroll-tracking deferred (needs DetailScaffold
 * refactor for scroll-event passthrough on web).
 *
 * Loading / coming_soon / error are handled by DetailScaffold's DataStateView.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { getClusterColor } from "@/data/clusterMaps";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type DomainV2,
  type DomainRoleSummary,
} from "@/types/career";
import {
  DetailScaffold,
  DomainIcon,
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
  SectionLabel,
  StatTile,
  DataSourceBadge,
} from "@/components/careerIntelligence";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "demand", label: "Demand" },
  { key: "skills", label: "Skills" },
  { key: "tools", label: "Tools" },
  { key: "certs", label: "Certifications" },
  { key: "roles", label: "Roles" },
] as const;

/** Estimated chrome offset from scroll top to body content start. */
const CHROME_OFFSET = 104;

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

/** Elite unless the status is empty or explicitly deferred. */
function isElite(status?: string): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s.length > 0 && s !== "deferred" && s !== "none";
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
  const exploreNav = useExploreNav();
  const resp = useResponsive();

  const cluster = domain.cluster ?? domain.clusters?.[0];
  const roles = domain.roles ?? [];
  const subgroups = domain.subgroups ?? [];
  const metrics = domain.demandMetrics?.ng_local;
  const clusterColor = getClusterColor(cluster ?? "");

  const isDesktop = resp.isDesktop && resp.isWeb;

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

  let otherRoles: DomainRoleSummary[] = [];
  if (subgroups.length) {
    otherRoles = roles.filter(
      (r) => !subgroups.some((sg) => sg.id === r.subgroupId),
    );
  }

  // ── Section positions for nav scrolling ──────────────────────
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const scrollRef = useRef<ScrollView>(null);

  const onSectionLayout = useCallback((key: string, y: number) => {
    if (sectionY.current[key] === undefined) {
      sectionY.current[key] = CHROME_OFFSET + y;
    }
  }, []);

  const scrollTo = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
    setActiveSection(key);
  }, []);

  // ── Desktop layout: section nav + content side-by-side ───────
  const content = (
    <>
      {/* Hero section */}
      <View style={[styles.hero, { borderBottomColor: colors.borderRole.subtle }]}>
        <View style={[styles.heroIconWrap, clusterColor ? { backgroundColor: clusterColor + "15" } : undefined]}>
          <DomainIcon cluster={cluster} size={36} />
        </View>
        <View style={styles.heroText}>
          {cluster ? (
            <Text style={[styles.heroCluster, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              {cluster}
            </Text>
          ) : null}
          <Text style={[styles.heroTitle, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
            {domain.name}
          </Text>
          {domain.description ? (
            <Text style={[styles.heroDesc, { color: colors.textRole.secondary }]}>
              {domain.description}
            </Text>
          ) : null}
          <View style={styles.heroChips}>
            {domain.eliteDomain ? (
              <View style={[styles.eliteChip, { backgroundColor: colors.accentRole.status + "14", borderColor: colors.accentRole.status }]}>
                <Text style={styles.eliteGlyph}>★</Text>
                <Text style={[styles.eliteText, { color: colors.accentRole.status }, CompassFonts.bodySemibold]}>
                  Elite field
                </Text>
              </View>
            ) : null}
            <DataSourceBadge
              verification={domain.demandMetrics ? "inferred" : "pending"}
              source="WEF · O*NET · Lightcast"
            />
          </View>
        </View>
      </View>

      {/* Wayfinding — this field's place on the journey */}
      <RouteLine
        variant="spine"
        stations={[
          { state: "you", label: "Foundations" },
          { state: "bridge", label: cluster ?? "This field" },
          { state: "target", label: `${roles.length || ""} roles`.trim() },
        ]}
        edges={["solid", "dashed"]}
      />

      {/* Demand metrics stat tiles */}
      {metrics ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Local demand</SectionLabel>
          <View style={resp.isTablet || resp.isDesktop ? styles.statGrid : styles.statRow}>
            <StatTile
              value={metrics.postingsPerMonth}
              label="Monthly postings"
              stamp="Nigeria · indicative"
            />
            {metrics.postingsYoY !== undefined ? (
              <StatTile
                value={Math.abs(metrics.postingsYoY)}
                label="Year-on-year"
                suffix="%"
                delta={{
                  trend: metrics.postingsYoY >= 0 ? "up" : "down",
                  text: `${Math.abs(metrics.postingsYoY)}% vs last year`,
                }}
                stamp="YoY change"
              />
            ) : null}
            {metrics.remotePct !== undefined ? (
              <StatTile
                value={metrics.remotePct}
                suffix="%"
                label="Remote-friendly"
                stamp="of postings"
              />
            ) : null}
            {metrics.entrySalaryLocalNGN !== undefined ? (
              <StatTile
                value={metrics.entrySalaryLocalNGN}
                prefix="₦"
                label="Entry salary (local)"
                stamp="per annum · indicative"
              />
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Demand metrics block (falls back gracefully) */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("demand", e.nativeEvent.layout.y)} />
      </View>

      {/* Foundation skills */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("skills", e.nativeEvent.layout.y)} />
        <FoundationSkillsBlock
          skills={domain.foundationSkills ?? []}
          title="Common skills in this field"
        />
      </View>

      {/* Skills bridge */}
      {(domain.foundationSkills?.length ?? 0) > 0 ? (
        <SkillsBridge
          domainBridgeSkills={(domain.foundationSkills ?? []).map((s) => ({
            name: s.skill,
          }))}
        />
      ) : null}

      {/* Tools */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("tools", e.nativeEvent.layout.y)} />
        <ToolGroupsBlock tools={domain.tools} title="Tools used in this field" />
      </View>

      {/* Certifications */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("certs", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Certifications</SectionLabel>
          <CertPlacementList
            gateway={domain.gatewayCertifications}
            roleHint={domain.roleHintCertifications}
          />
        </View>
      </View>

      {/* Per-edge mapping feedback */}
      <MappingFeedbackButton
        edgeType="programme_domain"
        sourceId={domain.id}
        sourceLabel={domain.name}
        targetId={domain.id}
        targetLabel={domain.name}
        compact
      />

      {/* Roles, grouped by sub-cluster */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("roles", e.nativeEvent.layout.y)} />
        {roles.length ? (
          subgroups.length ? (
            <View style={{ gap: Spacing.md }}>
              <SectionLabel>Roles in this field</SectionLabel>
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
                  <Text style={[styles.otherLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
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
              <SectionLabel>Roles</SectionLabel>
              <View style={styles.roleList}>{roles.map(renderRoleCard)}</View>
            </View>
          )
        ) : null}
      </View>

      {/* Notes + level-up CTA */}
      <NotesWidget entityType="domain" entityId={domainKey} />
      <LevelUpCTA />

      {/* Data source provenance footer */}
      <DataSourceBadge
        verification="inferred"
        source="WEF Future of Jobs 2025 · O*NET · Lightcast"
        date="2025"
      />
    </>
  );

  // Desktop layout: section nav on left, content on right
  if (isDesktop) {
    return (
      <View style={styles.desktopRow}>
        <View style={styles.navColumn}>
          <View style={[styles.navSticky, { borderColor: colors.borderRole.subtle, position: "sticky" as any, top: 0 }]}>
            <Text style={[styles.navTitle, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              On this page
            </Text>
            {SECTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => scrollTo(s.key)}
                style={[
                  styles.navItem,
                  activeSection === s.key && { backgroundColor: colors.surface.subtle },
                ]}
                activeOpacity={0.6}
              >
                <View
                  style={[
                    styles.navDot,
                    {
                      backgroundColor:
                        activeSection === s.key ? colors.accentRole.action : colors.borderRole.subtle,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: activeSection === s.key ? colors.textRole.primary : colors.textRole.secondary },
                    CompassFonts.bodyMedium,
                  ]}
                  numberOfLines={1}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ScrollView
          ref={scrollRef}
          style={styles.mainScroll}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          <View style={{ gap: Spacing.lg }}>
            {content}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Mobile / tablet: single column
  return (
    <View style={{ gap: Spacing.lg }}>
      {content}
    </View>
  );
}

export default DomainDetailScreen;

const styles = StyleSheet.create({
  // ── Hero ──────────────────────────────────────────────────
  hero: {
    flexDirection: "row",
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  heroCluster: {
    fontSize: FontSize.xs,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: FontSize.hero,
    lineHeight: FontSize.hero * 1.1,
  },
  heroDesc: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    marginTop: 2,
  },
  heroChips: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
  },

  // ── Stat tiles ────────────────────────────────────────────
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },

  // ── Sections ──────────────────────────────────────────────
  sectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.lg,
  },
  roleList: { gap: Spacing.sm },
  otherLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── Desktop layout ────────────────────────────────────────
  desktopRow: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xxl,
  },
  navColumn: {
    width: 180,
    flexShrink: 0,
  },
  navSticky: {
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.lg,
    gap: Spacing.xs,
  },
  navTitle: {
    fontSize: FontSize.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  navLabel: {
    fontSize: FontSize.sm,
  },
  mainScroll: {
    flex: 1,
  },
});
