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
import { Feather } from "@expo/vector-icons";
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
  ToolGroupsBlock,
  CertPlacementList,
  NotesWidget,
  RouteLine,
  MappingFeedbackButton,
  SectionLabel,
  ContextualItemList,
  TextTabs,
  LearningResourcesBlock,
} from "@/components/careerIntelligence";

export interface DomainDetailScreenProps {
  /** Stable domain key (e.g. "D001"). */
  domainId?: string;
}

export function DomainDetailScreen(props: DomainDetailScreenProps) {
  const params = useLocalSearchParams<{ id: string; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[] }>();
  const domainKey = props.domainId ?? String(params.id ?? "");
  const router = useRouter();
  const exploreNav = useExploreNav();
  const scrollRef = useRef<ScrollView>(null);
  const targetStudentId = Array.isArray(params.guidance_student_id)
    ? params.guidance_student_id[0]
    : params.guidance_student_id;
  const focusedGuidance = (Array.isArray(params.focus) ? params.focus[0] : params.focus) === "guidance";
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
    void careerData.getDomainV2(domainKey, guidanceContext.programmeId).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [domainKey, guidanceContext.programmeId]);

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
      reportSelection={{ kind: "domains", id: domainKey, name: state.data?.name ?? "Domain" }}
      targetStudentId={targetStudentId}
      state={state}
      onRetry={loadDomain}
      scrollRef={scrollRef}
      requiresAccountForDetails
      guestDescription={state.data?.description}
    >
      {(domain) => <DomainBody domain={domain} domainKey={domainKey} targetStudentId={targetStudentId} focusedGuidance={focusedGuidance} guidanceContext={guidanceContext} scrollRef={scrollRef} />}
    </DetailScaffold>
  );
}

function LegacyDomainBody({
  domain,
  domainKey,
  targetStudentId,
  focusedGuidance,
  guidanceContext,
  scrollRef: outerScrollRef,
}: {
  domain: DomainV2;
  domainKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const cluster = domain.cluster ?? domain.clusters?.[0];
  const subgroups = domain.subgroups ?? [];
  const roleCount = domain.roleCount ?? domain.roles?.length ?? 0;
  const clusterColor = getClusterColor(cluster ?? "");
  const programmeConnection = domain.programmeConnection;

  // No match/coverageRatio passed: the domain endpoint does not return ESCO
  // coverage for these roles. This used to pass `match="match"
  // coverageRatio={0}` to satisfy a required prop, so every role on every
  // domain rendered "Match · 0%" — claiming >=50% coverage and 0% coverage in
  // the same badge. Both props are optional now, and the badge renders nothing
  // when there is nothing to say.
  // ── Section positions for nav scrolling ──────────────────────
  const [subgroupsExpanded, setSubgroupsExpanded] = useState(false);
  const [domainTab, setDomainTab] = useState<"overview" | "build">("overview");
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

      <TextTabs
        value={domainTab}
        onChange={setDomainTab}
        tabs={[
          { value: "overview" as const, label: "Overview" },
          { value: "build" as const, label: "Build" },
        ]}
      />

      {domainTab === "build" ? (
        <View style={[styles.buildEntry, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <SectionLabel>What can you build in this field?</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>Build is a separate product for exploring projects, services and ventures connected to this domain. Your domain guidance stays unchanged while you explore it.</Text>
          <TouchableOpacity onPress={() => exploreNav.entrepreneurship(router, { ...guidanceContext, domainId: domainKey })} style={[styles.buildButton, { borderColor: colors.accentRole.action }]}>
            <Text style={[styles.buildButtonText, { color: colors.accentRole.action }]}>Open Build in this domain</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <>

      {programmeConnection ? (
        <View style={[styles.connectionNote, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <SectionLabel>{`Why ${domain.name} is connected to ${programmeConnection.programmeName}`}</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>
            {programmeConnection.explanation}
          </Text>
          {programmeConnection?.courseAnchors?.length ? (
            <View style={styles.connectionEvidence}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Course evidence for this connection</Text>
              {programmeConnection.courseAnchors.slice(0, 4).map((anchor) => (
                <Text key={`${anchor.code ?? "course"}-${anchor.title}`} style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>
                  {anchor.code ? `${anchor.code} · ` : ""}{anchor.title}
                </Text>
              ))}
              {programmeConnection.courseAnchors.length > 4 ? <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>More supporting curriculum is recorded for this connection.</Text> : null}
            </View>
          ) : null}
          {programmeConnection?.transferableEvidence?.length ? (
            <View style={styles.connectionEvidence}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What may carry over</Text>
              {programmeConnection.transferableEvidence.slice(0, 4).map((item) => (
                <Text key={item} style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{item}</Text>
              ))}
            </View>
          ) : null}
          {programmeConnection?.reviewRequired || programmeConnection?.sourceReviewRequired ? (
            <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>This connection is marked for review in the mapping evidence, so use it as a route to inspect rather than a confirmed equivalence.</Text>
          ) : null}
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
          contextItems={domain.contextItems}
          commonLabel="Useful throughout this domain"
          distinctiveLabel="Used in particular areas"
          explanation="These tools support work across the domain. The area you choose later will show which ones matter most there."
        />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Credentials to understand</SectionLabel>
          <CertPlacementList gateway={domain.gatewayCertifications} roleHint={domain.roleHintCertifications} contextItems={domain.contextItems} />
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

      {/* The domain page stops at subgroups. Roles appear after a subgroup is
          selected in the guided route, rather than beside the domain itself. */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View style={{ gap: Spacing.sm }}>
          {subgroups.length ? <>
            <SectionLabel>Explore areas within this field</SectionLabel>
            <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>Choose an area first. Its page will then show the capabilities, tools and roles that belong to that part of the domain.</Text>
            <View style={styles.subgroupGrid}>
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
            </View>
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
      )}

    </>
  );

  // The guidance page is intentionally one narrative flow. The cards below
  // are the page's progressive sections; hierarchy is navigated by the cards,
  // not by switching between disconnected tabs.
  return <View style={{ gap: Spacing.lg }}>{content}</View>;
}

function DomainBody({
  domain,
  domainKey,
  guidanceContext,
  focusedGuidance,
}: {
  domain: DomainV2;
  domainKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
  scrollRef: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const [tab, setTab] = useState<"overview" | "build">("overview");
  const subgroups = domain.subgroups ?? [];
  const connection = domain.programmeConnection;
  const orientation = domain.studentOrientation;
  // A route parameter is navigation context, not mapping evidence. If the
  // approved programme connection is absent, do not turn a stale or review-
  // only URL value into a relationship label.
  const relationship = connection?.relationship;
  const orientationResources = (domain.resources ?? []).filter((resource) => resource.resourceType === "domain_overview");
  const relationshipLabel = relationship === "direct"
    ? "Primary connection"
    : relationship === "functional"
      ? "Related application"
      : relationship === "adjacent"
        ? "Nearby direction"
        : "Connected field";

  if (tab === "build") {
    return (
      <View style={refinedStyles.page}>
        <TextTabs value={tab} onChange={setTab} tabs={[{ value: "overview", label: "Overview" }, { value: "build", label: "Build in this domain" }]} />
        <View style={[refinedStyles.tabIntro, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <Feather name="briefcase" size={22} color={colors.accentRole.action} />
          <View style={refinedStyles.copyBlock}>
            <Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What can you build in {domain.name}?</Text>
            <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>This is a separate Build space for projects, services and ventures connected to this field. It is not a list of courses or a promise that one idea will work.</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => exploreNav.entrepreneurship(router, { ...guidanceContext, domainId: domainKey })} style={[refinedStyles.action, { borderColor: colors.accentRole.action }]}>
              <Feather name="arrow-up-right" size={15} color={colors.accentRole.action} />
              <Text style={[refinedStyles.actionText, { color: colors.accentRole.action }]}>Open Build in this domain</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={refinedStyles.page}>
      <View style={[refinedStyles.hero, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <View style={[refinedStyles.iconBox, { backgroundColor: getClusterColor(domain.cluster ?? "") + "18" }]}>
          <DomainIcon cluster={domain.cluster ?? domain.clusters?.[0]} size={30} />
        </View>
        <View style={refinedStyles.copyBlock}>
          {domain.cluster ? <Text style={[refinedStyles.eyebrow, { color: colors.textRole.muted }]}>{domain.cluster}</Text> : null}
          <Text style={[refinedStyles.heroTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{domain.name}</Text>
          <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation?.shortIntro || orientation?.whatItStudies || `A reviewed explanation of what ${domain.name} studies is not available yet.`}</Text>
        </View>
      </View>

      <TextTabs value={tab} onChange={setTab} tabs={[{ value: "overview", label: "Overview" }, { value: "build", label: "Build in this domain" }]} />

      {connection ? (
        <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <View style={refinedStyles.cardHeading}>
            <Feather name="link" size={17} color={colors.accentRole.action} />
            <Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why {domain.name} is connected to {connection.programmeName}</Text>
          </View>
          <Text style={[refinedStyles.badge, { color: colors.accentRole.action }]}>{relationshipLabel}</Text>
          <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{connection.explanation}</Text>
          {connection.courseAnchors?.length ? <Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>This connection includes learning from {connection.courseAnchors.slice(0, 3).map((item) => item.title).join(", ")}.</Text> : null}
        </View>
      ) : null}

      <View style={[refinedStyles.card, refinedStyles.orientationCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <View style={refinedStyles.cardHeading}>
          <Feather name="compass" size={17} color={colors.accentRole.action} />
          <View style={refinedStyles.copyBlock}>
            <Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Understand {domain.name} before choosing an area</Text>
            <Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>This explanation uses the reviewed programme and field information.</Text>
          </View>
        </View>
        {orientation?.whatItStudies ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What this field studies</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.whatItStudies}</Text></View> : null}
        {orientation?.whatPeopleDo ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What people in it do</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.whatPeopleDo}</Text></View> : null}
        {orientation?.questions?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Questions this field helps answer</Text><View style={refinedStyles.infoGrid}>{orientation.questions.map((question) => <View key={question} style={[refinedStyles.infoCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Feather name="help-circle" size={15} color={colors.accentRole.action} /><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{question}</Text></View>)}</View></View> : null}
        {orientation?.outputs?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What the work can produce</Text><View style={refinedStyles.infoGrid}>{orientation.outputs.map((output) => <View key={output} style={[refinedStyles.infoCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Feather name="file-text" size={15} color={colors.accentRole.action} /><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{output}</Text></View>)}</View></View> : null}
        {orientation?.howWorkHappens?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>How the work usually happens</Text><View style={refinedStyles.steps}>{orientation.howWorkHappens.map((step, index) => <View key={step} style={refinedStyles.step}><View style={[refinedStyles.stepNumber, { backgroundColor: colors.accentRole.action }]}><Text style={refinedStyles.stepNumberText}>{index + 1}</Text></View><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{step}</Text></View>)}</View></View> : null}
        {orientation?.whereProgrammeFits ? <View style={[refinedStyles.subsection, refinedStyles.highlight]}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Where your programme fits</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.whereProgrammeFits}</Text></View> : null}
        {orientation?.decisionGuide ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Could this field suit you?</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.decisionGuide}</Text></View> : null}
         {orientation?.relatedProgrammes?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Related programmes</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.relatedProgrammes.join(", ")}</Text></View> : null}
         {orientation?.sourceNote ? <Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>Reference basis: {orientation.sourceNote}</Text> : null}
      </View>

      {orientationResources.length ? <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><LearningResourcesBlock resources={orientationResources} title={`Read more about ${domain.name}`} /></View> : null}

      <View style={refinedStyles.sectionHeading}>
        <View style={refinedStyles.cardHeading}><Feather name="layers" size={17} color={colors.accentRole.action} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Build the foundation</Text></View>
        <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>These are the field-owned foundations. They come before a focused area, and each item explains what it is used for and what it connects to.</Text>
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <FoundationSkillsBlock skills={domain.foundationSkills ?? []} resources={domain.resources} contextItems={domain.contextItems} title="What to learn first" />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domain.contextItems} itemTypes={["skill", "competency"]} resources={domain.resources} excludeNames={(domain.foundationSkills ?? []).map((item) => item.skill)} title="Skills and competencies added in this field" />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ToolGroupsBlock tools={domain.tools} resources={domain.resources} contextItems={domain.contextItems} title="Tools by purpose" commonLabel="Useful across this field" distinctiveLabel="More specialised in this field" explanation="Choose the kind of work first. These are source-backed options, not a requirement to learn every tool." />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <SectionLabel>Qualifications and professional routes</SectionLabel>
        <CertPlacementList gateway={domain.gatewayCertifications} roleHint={domain.roleHintCertifications} contextItems={domain.contextItems} resources={domain.resources} />
      </View>

      <View style={refinedStyles.sectionHeading}>
        <View style={refinedStyles.cardHeading}><Feather name="grid" size={17} color={colors.accentRole.action} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Choose a focused area</Text></View>
        <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>Each area keeps the field foundation and adds a more specific way to study or work. Roles appear inside the area, not on this domain page.</Text>
      </View>
      {subgroups.length ? <View style={refinedStyles.grid}>{subgroups.map((subgroup) => <TouchableOpacity key={subgroup.id} accessibilityRole="button" onPress={() => exploreNav.subgroup(router, domainKey, subgroup.id, guidanceContext)} style={[refinedStyles.tile, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Feather name="grid" size={20} color={colors.accentRole.action} /><Text style={[refinedStyles.tileTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{subgroup.whatPeopleDo || subgroup.description || "A focused area inside this field."}</Text><Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>{subgroup.roleCount ?? 0} {(subgroup.roleCount ?? 0) === 1 ? "role" : "roles"} in this area</Text><Text style={[refinedStyles.actionText, { color: colors.accentRole.action }]}>Explore area →</Text></TouchableOpacity>)}</View> : <Text style={[refinedStyles.copy, { color: colors.textRole.muted }]}>No reviewed areas are available yet.</Text>}
    </View>
  );
}

const refinedStyles = StyleSheet.create({
  page: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  hero: { flexDirection: "row", gap: Spacing.md, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg },
  iconBox: { width: 54, height: 54, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: FontSize.xxl, lineHeight: FontSize.xxl * 1.12 },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 0.8, textTransform: "uppercase" },
  copyBlock: { flex: 1, gap: Spacing.xs },
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  orientationCard: { gap: Spacing.md },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.3, flex: 1 },
  copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.55 },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  badge: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  subsection: { gap: Spacing.xs, paddingTop: Spacing.sm },
  subheading: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  infoCard: { flex: 1, minWidth: 220, flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  steps: { gap: Spacing.sm },
  step: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  stepNumber: { width: 24, height: 24, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  stepNumberText: { color: "#FFFFFF", fontSize: FontSize.xs, fontWeight: "800" },
  highlight: { borderLeftWidth: 3, paddingLeft: Spacing.md },
  sectionHeading: { gap: Spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  tile: { flex: 1, minWidth: 250, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  tileTitle: { fontSize: FontSize.md },
  action: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  actionText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  tabIntro: { flexDirection: "row", gap: Spacing.md, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg },
});

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
  connectionEvidence: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
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
    flex: 1,
    minWidth: 250,
  },
  subgroupGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
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
