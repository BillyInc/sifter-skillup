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
import { getClusterColor } from "@/data/clusterMaps";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
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

export interface DomainDetailScreenProps {
  /** Stable domain key (e.g. "D001"). */
  domainId?: string;
}

export function DomainDetailScreen(props: DomainDetailScreenProps) {
  const params = useLocalSearchParams<{ id: string; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[]; match_type?: string | string[] }>();
  const domainKey = props.domainId ?? String(params.id ?? "");
  const router = useRouter();
  const exploreNav = useExploreNav();
  const scrollRef = useRef<ScrollView>(null);
  const targetStudentId = Array.isArray(params.guidance_student_id)
    ? params.guidance_student_id[0]
    : params.guidance_student_id;
  const focusedGuidance = (Array.isArray(params.focus) ? params.focus[0] : params.focus) === "guidance";
  const matchType = Array.isArray(params.match_type) ? params.match_type[0] : params.match_type;
  const guidanceContext: GuidanceRouteContext = {
    programmeId: Array.isArray(params.programme_id) ? params.programme_id[0] : params.programme_id,
    jambProgrammeId: Array.isArray(params.jamb_programme_id) ? params.jamb_programme_id[0] : params.jamb_programme_id,
    schoolId: Array.isArray(params.school_id) ? params.school_id[0] : params.school_id,
    userType: Array.isArray(params.user_type) ? params.user_type[0] : params.user_type,
    journeyMode: Array.isArray(params.journey_mode) ? params.journey_mode[0] : params.journey_mode,
    guidanceTarget: Array.isArray(params.guidance_target) ? params.guidance_target[0] : params.guidance_target,
    guidanceStudentId: targetStudentId,
    entryPath: Array.isArray(params.guidance_entry) ? params.guidance_entry[0] : params.guidance_entry,
    focused: focusedGuidance,
  };

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

  const onBack = useCallback(() => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (canGoBack) router.back();
    else router.replace(`${exploreNav.base}/domains` as never);
  }, [exploreNav.base, router]);

  return (
    <DetailScaffold
      eyebrow="DOMAIN"
      title={state.data?.name ?? "Domain"}
      backLabel={targetStudentId ? "Back to student guidance" : "Back to programme"}
      onBack={onBack}
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
      {(domain) => <DomainBody domain={domain} domainKey={domainKey} targetStudentId={targetStudentId} focusedGuidance={focusedGuidance} guidanceContext={guidanceContext} matchType={matchType} scrollRef={scrollRef} />}
    </DetailScaffold>
  );
}

function DomainBody({
  domain,
  domainKey,
  targetStudentId,
  focusedGuidance,
  guidanceContext,
  matchType,
  scrollRef: outerScrollRef,
}: {
  domain: DomainV2;
  domainKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
  matchType?: string;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const cluster = domain.cluster ?? domain.clusters?.[0];
  const subgroups = domain.subgroups ?? [];
  const roleCount = domain.roleCount ?? domain.roles?.length ?? 0;
  const clusterColor = getClusterColor(cluster ?? "");

  // No match/coverageRatio passed: the domain endpoint does not return ESCO
  // coverage for these roles. This used to pass `match="match"
  // coverageRatio={0}` to satisfy a required prop, so every role on every
  // domain rendered "Match · 0%" — claiming >=50% coverage and 0% coverage in
  // the same badge. Both props are optional now, and the badge renders nothing
  // when there is nothing to say.
  // ── Section positions for nav scrolling ──────────────────────
  const [subgroupsExpanded, setSubgroupsExpanded] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const visibleSubgroups = subgroupsExpanded ? subgroups : subgroups.slice(0, 6);

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
            <>
              <Text style={[styles.heroDescLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>What this field is about</Text>
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
                  ? "This is a possible direction outside your programme. Review this domain to see what further learning may be needed."
                  : "This domain is available in the wider career catalogue. Review its foundation before deciding whether it belongs in your route."}
          </Text>
        </View>
      ) : null}

      {domain.studentOrientation ? (
        <View style={[styles.orientationBlock, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <SectionLabel>Understand this field first</SectionLabel>
          {domain.studentOrientation.whatItStudies ? (
            <View style={styles.orientationPart}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What it studies</Text>
              <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{domain.studentOrientation.whatItStudies}</Text>
            </View>
          ) : null}
          {domain.studentOrientation.whatPeopleDo ? (
            <View style={styles.orientationPart}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What people do</Text>
              <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{domain.studentOrientation.whatPeopleDo}</Text>
            </View>
          ) : null}
          {domain.studentOrientation.questions?.length ? (
            <View style={styles.orientationPart}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Questions this field asks</Text>
              <View style={styles.orientationList}>
                {domain.studentOrientation.questions.map((question) => (
                  <Text key={question} style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>• {question}</Text>
                ))}
              </View>
            </View>
          ) : null}
          {domain.studentOrientation.whereProgrammeFits ? (
            <View style={styles.orientationPart}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Where your programme fits</Text>
              <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{domain.studentOrientation.whereProgrammeFits}</Text>
            </View>
          ) : null}
          {domain.studentOrientation.relatedProgrammes?.length ? (
            <View style={styles.orientationPart}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Related programmes</Text>
              <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{domain.studentOrientation.relatedProgrammes.join(" • ")}</Text>
            </View>
          ) : null}
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

      <View style={[styles.connectionNote, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <SectionLabel>How this domain is organised</SectionLabel>
        <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>
          Start with the domain overview, then choose an area of work. The {subgroups.length || "available"} area{subgroups.length === 1 ? "" : "s"} below divide this broad field into more focused kinds of work, so you can understand an area before choosing a role.
        </Text>
        <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>Roles belong inside an area because the same broad domain can lead to very different kinds of work. Open an area when you are ready to compare its capabilities, tools, resources and roles.</Text>
      </View>

      <View style={[styles.connectionNote, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <SectionLabel>Your learning path</SectionLabel>
        <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>This domain gives you a shared foundation. Choose an area next when you want to see the extra capabilities, tools and roles attached to that part of the field.</Text>
        {domain.foundationSkills?.length ? <View style={{ gap: Spacing.xs }}>
          {(overviewExpanded ? domain.foundationSkills : domain.foundationSkills.slice(0, 3)).map((skill) => <Text key={skill.skill} style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>• {skill.skill}</Text>)}
          {domain.foundationSkills.length > 3 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: overviewExpanded }} onPress={() => setOverviewExpanded((value) => !value)} style={styles.moreButton}><Text style={[styles.moreButtonText, { color: colors.accentRole.action }]}>{overviewExpanded ? "Show less foundation" : `View ${domain.foundationSkills.length - 3} more foundation items`}</Text></TouchableOpacity> : null}
        </View> : <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>The source records do not include a foundation list for this domain yet.</Text>}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.statValue, { color: colors.textRole.primary }]}>{subgroups.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textRole.muted }]}>areas of work</Text>
        </View>
        <View style={[styles.statCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.statValue, { color: colors.textRole.primary }]}>{roleCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textRole.muted }]}>roles organised inside them</Text>
        </View>
      </View>

      <View style={[styles.buildEntry, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <SectionLabel>Want to build something from this field?</SectionLabel>
        <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>Build is a separate product for exploring projects, services and ventures connected to this domain.</Text>
        <TouchableOpacity onPress={() => exploreNav.entrepreneurship(router, { ...guidanceContext, domainId: domainKey })} style={[styles.buildButton, { borderColor: colors.accentRole.action }]}>
          <Text style={[styles.buildButtonText, { color: colors.accentRole.action }]}>Open Build in this domain</Text>
        </TouchableOpacity>
      </View>

      {/* Foundation skills */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <FoundationSkillsBlock
          skills={domain.foundationSkills ?? []}
          resources={domain.resources}
          title="Start here: foundation skills"
        />
        <ContextualItemList items={domain.contextItems} resources={domain.resources} title="What each skill, tool and certification does in this domain" />
        <ToolGroupsBlock
          tools={domain.tools}
          resources={domain.resources}
          title="Tools you may use"
          commonLabel="Useful throughout this domain"
          distinctiveLabel="Used in particular areas"
          explanation="These tools support work across the domain. The area you choose later will show which ones matter most there."
        />
        {(domain.gatewayCertifications?.length || domain.roleHintCertifications?.length) ? <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Credentials to understand</SectionLabel>
          <CertPlacementList gateway={domain.gatewayCertifications} roleHint={domain.roleHintCertifications} />
        </View> : null}
        {domain.resources?.length ? <LearningResourcesBlock resources={domain.resources} /> : null}
        <GuidanceEvidenceBlock evidence={domain.guidanceEvidence} />
        <NigerianContextBlock context={domain.nigerianContext} level="domain" />
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

      {/* The domain page stops at subgroups. Roles appear after a subgroup is
          selected in the guided route, rather than beside the domain itself. */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View style={{ gap: Spacing.sm }}>
          {subgroups.length ? <>
            <SectionLabel>Explore areas within this field</SectionLabel>
            <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>Choose an area first. Its page will then show the capabilities, tools and roles that belong to that part of the domain.</Text>
            {visibleSubgroups.map((sg) => (
             <TouchableOpacity
              key={sg.id}
              activeOpacity={0.8}
              onPress={() => exploreNav.subgroup(router, domainKey, sg.id, guidanceContext)}
              style={[styles.subgroupCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
            >
              <Text style={[styles.subgroupTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{sg.name}</Text>
              {sg.description ? <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{sg.description}</Text> : null}
              <Text style={[styles.subgroupMeta, { color: colors.textRole.muted }]}>{sg.roleCount ?? 0} {(sg.roleCount ?? 0) === 1 ? "role" : "roles"} in this area</Text>
              <Text style={[styles.linkText, { color: colors.accentRole.action }]}>Explore this area and its roles →</Text>
            </TouchableOpacity>
            ))}
            {subgroups.length > 6 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: subgroupsExpanded }} onPress={() => setSubgroupsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreButtonText, { color: colors.accentRole.action }]}>{subgroupsExpanded ? "Show fewer areas" : `See all ${subgroups.length} areas`}</Text></TouchableOpacity> : null}
          </> : <View style={[styles.emptySubgroups, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
            <SectionLabel>No areas published yet</SectionLabel>
            <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>This domain does not currently have a supported area mapping yet.</Text>
          </View>}
        </View>
      </View>

      {/* Notes stay in Career Intelligence; learning actions belong in My World. */}
      <NotesWidget entityType="domain" entityId={domainKey} />

    </>
  );

  // The guidance page is intentionally one narrative flow. The cards below
  // are the page's progressive sections; hierarchy is navigated by the cards,
  // not by switching between disconnected tabs.
  return <View style={{ gap: Spacing.lg }}>{content}</View>;
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
  buildEntry: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  connectionNote: {
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  orientationBlock: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  orientationPart: { gap: Spacing.xs },
  orientationHeading: { fontSize: FontSize.sm },
  orientationList: { gap: Spacing.xs },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  statCard: { flex: 1, minWidth: 150, gap: 2, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md },
  statValue: { fontSize: FontSize.xl, fontWeight: "800" },
  statLabel: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
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
  subgroupMeta: { fontSize: FontSize.xs },
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
  emptySubgroups: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  mobileSectionNav: { gap: Spacing.xs, paddingVertical: 2 },
  mobileSectionTab: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  mainScroll: {
    flex: 1,
  },
});
