/**
 * DomainDetailScreen — the heart of the v2 taxonomy: a single field, its common
 * skills, the tools/certs that gate it, and the roles within it grouped by
 * sub-cluster.
 *
 * Consumes the v2 contract via careerData.getDomainV2(domainKey) → DataState<DomainV2>.
 *
 * The detail view keeps domain-owned guidance together: priority skills,
 * domain tools, domain certifications, sub-groups, and career roles.
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
import { careerRoleTierLabel, compareCareerRoles } from "@/lib/careerRoleOrdering";
import {
  pending,
  type DataState,
  type DomainV2,
} from "@/types/career";
import {
  DetailScaffold,
  DomainIcon,
  FoundationSkillsBlock,
  GuidanceEvidenceBlock,
  NigerianContextBlock,
  ToolGroupsBlock,
  CertPlacementList,
  LearningResourcesBlock,
  NotesWidget,
  RouteLine,
  MappingFeedbackButton,
  SectionLabel,
  ContextualItemList,
} from "@/components/careerIntelligence";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "skills", label: "Skills" },
  { key: "build", label: "Build / Entrepreneurship" },
  { key: "tools", label: "Tools" },
  { key: "certs", label: "Certifications" },
  { key: "subgroups", label: "Subgroups" },
] as const;

/** Estimated chrome offset from scroll top to body content start. */
const CHROME_OFFSET = 104;

export interface DomainDetailScreenProps {
  /** Stable domain key (e.g. "D001"). */
  domainId?: string;
}

export function DomainDetailScreen(props: DomainDetailScreenProps) {
  const params = useLocalSearchParams<{ id: string; guidance_student_id?: string | string[]; focus?: string | string[]; match_type?: string | string[] }>();
  const domainKey = props.domainId ?? String(params.id ?? "");
  const scrollRef = useRef<ScrollView>(null);
  const targetStudentId = Array.isArray(params.guidance_student_id)
    ? params.guidance_student_id[0]
    : params.guidance_student_id;
  const focusedGuidance = (Array.isArray(params.focus) ? params.focus[0] : params.focus) === "guidance";
  const matchType = Array.isArray(params.match_type) ? params.match_type[0] : params.match_type;

  const [state, setState] = useState<DataState<DomainV2>>(() =>
    pending<DomainV2>("Loading domain details..."),
  );

  const loadDomain = useCallback(() => {
    setState(pending<DomainV2>("Loading domain details..."));
    let alive = true;
    void careerData.getDomainV2(domainKey).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [domainKey]);

  useEffect(() => loadDomain(), [loadDomain]);

  return (
    <DetailScaffold
      eyebrow="DOMAIN"
      title={state.data?.name ?? "Domain"}
      backLabel={targetStudentId ? "Back to student guidance" : "Back to programme"}
      save={focusedGuidance ? undefined : { entityType: "domain", entityId: domainKey }}
      pdf
      pdfPath={targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html"}
      reportSelection={{ kind: "domains", id: domainKey, name: state.data?.name ?? "Domain" }}
      targetStudentId={targetStudentId}
      state={state}
      onRetry={loadDomain}
      scrollRef={scrollRef}
      requiresAccountForDetails
      guestDescription={state.data?.description}
    >
      {(domain) => <DomainBody domain={domain} domainKey={domainKey} targetStudentId={targetStudentId} focusedGuidance={focusedGuidance} matchType={matchType} scrollRef={scrollRef} />}
    </DetailScaffold>
  );
}

function DomainBody({
  domain,
  domainKey,
  targetStudentId,
  focusedGuidance,
  matchType,
  scrollRef: outerScrollRef,
}: {
  domain: DomainV2;
  domainKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  matchType?: string;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const resp = useResponsive();

  const cluster = domain.cluster ?? domain.clusters?.[0];
  const subgroups = domain.subgroups ?? [];
  const roleCount = domain.roleCount ?? domain.roles?.length ?? 0;
  const clusterColor = getClusterColor(cluster ?? "");

  const isDesktop = resp.isDesktop && resp.isWeb;

  // No match/coverageRatio passed: the domain endpoint does not return ESCO
  // coverage for these roles. This used to pass `match="match"
  // coverageRatio={0}` to satisfy a required prop, so every role on every
  // domain rendered "Match · 0%" — claiming >=50% coverage and 0% coverage in
  // the same badge. Both props are optional now, and the badge renders nothing
  // when there is nothing to say.
  // ── Section positions for nav scrolling ──────────────────────
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [subgroupsExpanded, setSubgroupsExpanded] = useState(false);
  const [directRolesExpanded, setDirectRolesExpanded] = useState(false);
  const desktopScrollRef = useRef<ScrollView>(null);
  const visibleSubgroups = subgroupsExpanded ? subgroups : subgroups.slice(0, 6);
  const directRoles = (domain.roles ?? []).filter((role) => !role.subgroupId).sort(compareCareerRoles);
  const visibleDirectRoles = directRolesExpanded ? directRoles : directRoles.slice(0, 6);

  const onSectionLayout = useCallback((key: string, y: number) => {
    if (sectionY.current[key] === undefined) {
      sectionY.current[key] = CHROME_OFFSET + y;
    }
  }, []);

  const scrollTo = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      (isDesktop ? desktopScrollRef : outerScrollRef).current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
    setActiveSection(key);
  }, [isDesktop, outerScrollRef]);

  // ── Desktop layout: section nav + content side-by-side ───────
  const content = (
    <>
      {/* Hero section */}
      <View style={[styles.hero, { borderBottomColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("overview", e.nativeEvent.layout.y)} />
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
            <>
              <Text style={[styles.heroDescLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>What this domain is and what people do</Text>
              <Text style={[styles.heroDesc, { color: colors.textRole.secondary }]}>
                {domain.description}
              </Text>
            </>
          ) : null}
          <View style={styles.heroChips}>
            {domain.eliteDomain ? (
              <View style={[styles.eliteChip, { backgroundColor: colors.accentRole.status + "14", borderColor: colors.accentRole.status }]}>
                <Text style={styles.eliteGlyph}>★</Text>
                <Text style={[styles.eliteText, { color: colors.accentRole.status }, CompassFonts.bodySemibold]}>
                  Featured domain
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {matchType ? (
        <View style={[styles.connectionNote, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <SectionLabel>Why this domain is in your route</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>
            {matchType === "direct"
              ? "This is a direct connection: your programme teaches knowledge that is closely related to this domain."
              : matchType === "functional"
                ? "This is a functional connection: some of what your programme teaches can be applied here, but the work is different."
                : matchType === "adjacent"
                  ? "This is a possible pivot. Your current foundation helps, but you may need a bridge before specialising."
                  : "This domain is available in the wider career catalogue. Review its foundation before deciding whether it belongs in your route."}
          </Text>
        </View>
      ) : null}

      {/* Wayfinding — this domain's place on the journey */}
      <RouteLine
        variant="spine"
        stations={[
          { state: "you", label: "Foundations" },
          { state: "bridge", label: cluster ?? "This domain" },
          { state: "target", label: `${roleCount || ""} roles`.trim() },
        ]}
        edges={["solid", "dashed"]}
      />

      {/* Domain-owned build surface. This is separate from programme skills:
          it answers what someone can create or develop within this domain. */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("build", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>What can you build in this domain?</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>
            Explore source-backed build and entrepreneurship guidance for this domain.
          </Text>
          {domain.domainBridgeSkills?.length ? (
            <View style={styles.bridgeList}>
              <Text style={[styles.bridgeLabel, { color: colors.textRole.muted }]}>Domain foundations</Text>
              <View style={styles.bridgeChips}>
                {domain.domainBridgeSkills.map((item) => (
                  <View key={item.name} style={[styles.bridgeChip, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                    <Text style={[styles.bridgeChipText, { color: colors.textRole.secondary }]}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => exploreNav.entrepreneurship(router, { domainId: domainKey, focused: focusedGuidance })}
            style={[styles.buildButton, { borderColor: colors.accentRole.action }]}
          >
            <Text style={[styles.buildButtonText, { color: colors.accentRole.action }]}>Open Build / Entrepreneurship</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Foundation skills */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("skills", e.nativeEvent.layout.y)} />
        <FoundationSkillsBlock
          skills={domain.foundationSkills ?? []}
          title="Portable foundation: what to build first"
        />
        <ContextualItemList items={domain.contextItems} title="What each skill, tool and certification does in this domain" />
        <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>The route keeps Nigerian, remote and global possibilities visible. A local signal does not cancel a portable skill, and a global signal does not establish a Nigerian licence or requirement.</Text>
        <GuidanceEvidenceBlock evidence={domain.guidanceEvidence} />
        <NigerianContextBlock context={domain.nigerianContext} level="domain" />
      </View>

      {/* Tools */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("tools", e.nativeEvent.layout.y)} />
        <ToolGroupsBlock tools={domain.tools} title="Tools used in this domain" />
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

      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <LearningResourcesBlock resources={domain.resources} />
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

      {/* Use domain -> subgroup -> role where a supported subgroup taxonomy
          exists. Roles without a supported subgroup stay directly under the
          domain instead of being forced into an invented grouping. */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("subgroups", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          {subgroups.length ? <>
            <SectionLabel>Subgroups in this domain</SectionLabel>
            {visibleSubgroups.map((sg) => (
             <TouchableOpacity
              key={sg.id}
              activeOpacity={0.8}
              onPress={() => exploreNav.subgroup(router, domainKey, sg.id, targetStudentId, focusedGuidance)}
              style={[styles.subgroupCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
            >
              <Text style={[styles.subgroupTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{sg.name}</Text>
              {sg.description ? <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{sg.description}</Text> : null}
              <Text style={[styles.linkText, { color: colors.accentRole.action }]}>Open subgroup and roles →</Text>
            </TouchableOpacity>
            ))}
            {subgroups.length > 6 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: subgroupsExpanded }} onPress={() => setSubgroupsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreButtonText, { color: colors.accentRole.action }]}>{subgroupsExpanded ? "Show fewer subgroups" : `See all ${subgroups.length} subgroups`}</Text></TouchableOpacity> : null}
          </> : null}
          {directRoles.length ? <View style={{ gap: Spacing.sm, marginTop: subgroups.length ? Spacing.md : 0 }}>
            <SectionLabel>{subgroups.length ? "Roles linked directly to this domain" : "Roles in this domain"}</SectionLabel>
            <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>
              {subgroups.length
                ? "These source-backed roles do not have a supported subgroup mapping, so you can open them directly from the domain."
                : "This domain does not currently have a supported subgroup taxonomy, so roles are shown directly here."}
            </Text>
            {visibleDirectRoles.map((role) => (
              <TouchableOpacity
                key={role.key}
                accessibilityRole="button"
                onPress={() => exploreNav.role(router, role.key, targetStudentId, focusedGuidance)}
                style={[styles.subgroupCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
              >
                <Text style={[styles.subgroupTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{role.name}</Text>
                <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>{careerRoleTierLabel(role.tier)}</Text>
                {role.description ? <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{role.description}</Text> : null}
                <Text style={[styles.linkText, { color: colors.accentRole.action }]}>Open role details →</Text>
              </TouchableOpacity>
            ))}
            {directRoles.length > 6 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: directRolesExpanded }} onPress={() => setDirectRolesExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreButtonText, { color: colors.accentRole.action }]}>{directRolesExpanded ? "Show fewer roles" : `See all ${directRoles.length} roles`}</Text></TouchableOpacity> : null}
          </View> : null}
        </View>
      </View>

      {/* Notes stay in Career Intelligence; learning actions belong in My World. */}
      <NotesWidget entityType="domain" entityId={domainKey} />

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
           ref={desktopScrollRef}
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileSectionNav}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => {
              const y = sectionY.current[s.key];
              if (y !== undefined) outerScrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
              setActiveSection(s.key);
            }}
            style={[styles.mobileSectionTab, { borderColor: activeSection === s.key ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: activeSection === s.key ? colors.surface.subtle : colors.surface.raised }]}
          >
            <Text style={[styles.navLabel, { color: activeSection === s.key ? colors.textRole.primary : colors.textRole.secondary }, CompassFonts.bodyMedium]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  heroDescLabel: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
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
  connectionNote: {
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  guidanceNote: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  bridgeList: { gap: Spacing.xs },
  bridgeLabel: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  bridgeChips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  bridgeChip: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  bridgeChipText: { fontSize: FontSize.xs },
  buildButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  buildButtonText: { fontSize: FontSize.sm, fontWeight: "800" },
  subgroupCard: {
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  subgroupTitle: { fontSize: FontSize.md },
  linkText: { fontSize: FontSize.sm, fontWeight: "800", marginTop: Spacing.xs },
  moreButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreButtonText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
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
  mobileSectionNav: { gap: Spacing.xs, paddingVertical: 2 },
  mobileSectionTab: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  mainScroll: {
    flex: 1,
  },
});
