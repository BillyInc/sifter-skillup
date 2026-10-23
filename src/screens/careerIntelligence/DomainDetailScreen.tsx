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
import { formatCareerLabel, studentSummary } from "@/lib/careerLabels";
import { visibleDomainAreas } from "@/lib/d078RoutePresentation";
import { useExploreNav } from "@/lib/exploreNav";
import { D078MethodAwareJourney, parseD078Selection } from "@/screens/careerIntelligence/D078MethodAwareJourney";
import { parseD078RouteStacks } from "@/lib/d078RouteStacks";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import {
  pending,
  type DataState,
  type DomainStudentOrientation,
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
  LearningResourcesBlock,
  ExternalLinkGuard,
  ProgrammeCurriculumCarryForward,
  GuidanceContinuation,
} from "@/components/careerIntelligence";
import { isStudentResource } from "@/components/careerIntelligence/resourceLinks";

export interface DomainDetailScreenProps {
  /** Stable domain key (e.g. "D001"). */
  domainId?: string;
}

export function DomainDetailScreen(props: DomainDetailScreenProps) {
  const params = useLocalSearchParams<{ id: string; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[]; d078_selection?: string | string[]; d078_route_stacks?: string | string[]; d078_undo_selection?: string | string[] }>();
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
    void careerData.getDomainV2ForStudent(domainKey, guidanceContext.programmeId).then((res) => {
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
      wideContent={state.data?.id === "D078"}
      hideScreenTitle={state.data?.id === "D078"}
      hideEyebrow={state.data?.id === "D078"}
      requiresAccountForDetails
      guestDescription={state.data?.description}
    >
      {(domain) => <DomainBody domain={domain} domainKey={domainKey} targetStudentId={targetStudentId} focusedGuidance={focusedGuidance} guidanceContext={guidanceContext} scrollRef={scrollRef} initialD078Selection={parseD078Selection(params.d078_selection)} initialD078RouteStacks={parseD078RouteStacks(params.d078_route_stacks, parseD078Selection(params.d078_selection))} initialD078UndoSelection={params.d078_undo_selection ? parseD078Selection(params.d078_undo_selection) : undefined} />}
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
              {domain.descriptionSources?.map((source) => <ExternalLinkGuard key={`${source.title}:${source.locator}`} url={source.url} label={source.shortLabel || source.title} description={`This opens the source used to explain ${domain.name}.`} textStyle={[styles.heroDesc, { color: colors.accentRole.action }]} />)}
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
                  {anchor.title}
                </Text>
              ))}
              {programmeConnection.courseAnchors.length > 4 ? <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>More supporting curriculum is recorded for this connection.</Text> : null}
            </View>
          ) : null}
          {programmeConnection?.curriculumOutcomes?.length ? (
            <View style={styles.connectionEvidence}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Already covered for this field</Text>
              {programmeConnection.curriculumOutcomes.map((outcome, index) => (
                <View key={outcome.outcomeId ?? `${outcome.courseCode ?? outcome.courseTitle ?? "outcome"}-${index}`} style={styles.orientationPart}>
                  {outcome.courseTitle ? <Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>{outcome.courseTitle}</Text> : null}
                  <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{outcome.studentText}</Text>
                </View>
              ))}
            </View>
          ) : programmeConnection?.transferableEvidence?.length ? (
            <View style={styles.connectionEvidence}>
              <Text style={[styles.orientationHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Programme evidence for this field</Text>
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
          contextItems={domain.contextItems}
          title="Start here: foundation skills"
          learningFocus
          targetStudentId={targetStudentId}
        />
        <ContextualItemList items={domain.contextItems} itemTypes={["skill", "competency", "method", "knowledge"]} resources={domain.resources} title="Skills, methods and knowledge for this field" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} learningFocus targetStudentId={targetStudentId} />
        <ToolGroupsBlock
          tools={domain.tools}
          resources={domain.resources}
          title="Tools you may use"
          contextItems={domain.contextItems}
          contextLevel="domain"
          learningFocus
          targetStudentId={targetStudentId}
          learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }}
          commonLabel="Useful throughout this domain"
          distinctiveLabel="Used in particular areas"
          explanation="These tools support work across the domain. The area you choose later will show which ones matter most there."
        />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Credentials to understand</SectionLabel>
          <CertPlacementList gateway={domain.gatewayCertifications} roleHint={domain.roleHintCertifications} contextItems={domain.contextItems} contextLevel="domain" learningFocus targetStudentId={targetStudentId} />
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

    </>
  );

  // The guidance page is intentionally one narrative flow. The cards below
  // are the page's progressive sections; hierarchy is navigated by the cards,
  // not by switching between disconnected tabs.
  return <View style={{ gap: Spacing.lg }}>{content}</View>;
}

function OrientationEvidenceLinks({
  orientation,
  field,
  colors,
}: {
  orientation?: DomainStudentOrientation;
  field: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const sources = orientation?.evidenceByField?.[field] ?? [];
  if (!sources.length) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs }}>
      {sources.map((source) => (
        <ExternalLinkGuard
          key={`${source.title}:${source.locator}`}
          url={source.url}
          label={source.shortLabel || source.title}
          description={`${source.title}; ${source.locator}`}
          textStyle={{ color: colors.accentRole.action, fontSize: FontSize.xs }}
        />
      ))}
    </View>
  );
}

function DomainBody({
  domain,
  domainKey,
  targetStudentId,
  guidanceContext,
  focusedGuidance,
  initialD078Selection,
  initialD078RouteStacks,
  initialD078UndoSelection,
}: {
  domain: DomainV2;
  domainKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
  scrollRef: React.RefObject<ScrollView | null>;
  initialD078Selection: ReturnType<typeof parseD078Selection>;
  initialD078RouteStacks?: NonNullable<ReturnType<typeof parseD078RouteStacks>>;
  initialD078UndoSelection?: ReturnType<typeof parseD078Selection>;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const subgroups = domain.subgroups ?? [];
  // D078's historical subgroups are retired; expose only its current canonical
  // areas of specialization even if an older API payload still contains them.
  const visibleAreas = visibleDomainAreas(domain);
  const connection = domain.programmeConnection;
  const studentConnection = connection && !connection.reviewRequired && !connection.sourceReviewRequired
    ? connection
    : null;
  const orientation = domain.studentOrientation;
  const domainItems = (domain.contextItems ?? []).filter((item) =>
    item.contextLevel === "domain"
    && item.guidanceOwner === "domain"
    && item.dataState === "source_backed"
    && item.sourceConfidence !== "unsourced"
    && item.claimReviewState === "approved"
    && item.linkState === "linked",
  );
  const domainResources = (domain.resources ?? []).filter((resource) =>
    isStudentResource(resource, "domain"),
  );
  // A route parameter is navigation context, not mapping evidence. If the
  // approved programme connection is absent, do not turn a stale or review-
  // only URL value into a relationship label.
  const relationship = studentConnection?.relationship;
  const orientationResources = domainResources.filter((resource) => resource.resourceType === "domain_overview");
  const relationshipLabel = relationship === "direct"
    ? "Primary connection"
    : relationship === "functional"
      ? "Related application"
      : relationship === "adjacent"
        ? "Nearby direction"
        : "Connected field";

  if (domain.id === "D078") {
    return <D078MethodAwareJourney
      domainKey={domainKey}
      programmeName={connection?.programmeName}
      programmeConnection={connection}
      guidanceContext={guidanceContext}
      initialSelection={initialD078Selection}
      initialRouteStacks={initialD078RouteStacks}
      initialUndoSelection={initialD078UndoSelection}
      domainRoles={domain.roles}
      domainResources={domain.resources}
    />;
  }

  return (
    <View style={refinedStyles.page}>
      <View style={[refinedStyles.hero, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <View style={[refinedStyles.iconBox, { backgroundColor: getClusterColor(domain.cluster ?? "") + "18" }]}>
          <DomainIcon cluster={domain.cluster ?? domain.clusters?.[0]} size={30} />
        </View>
        <View style={refinedStyles.copyBlock}>
          {domain.cluster ? <Text style={[refinedStyles.eyebrow, { color: colors.textRole.muted }]}>{domain.cluster}</Text> : null}
          <Text style={[refinedStyles.heroTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{formatCareerLabel(domain.name)}</Text>
          <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: orientation?.shortIntro, whatPeopleDo: orientation?.whatPeopleDo, whatItStudies: orientation?.whatItStudies, description: domain.description, fallback: "A reviewed plain-language explanation of this field is not available yet." })}</Text>
          {domain.descriptionSources?.map((source) => <ExternalLinkGuard key={`${source.title}:${source.locator}`} url={source.url} label={source.shortLabel || source.title} description={`This opens the source used to explain ${domain.name}.`} textStyle={[refinedStyles.meta, { color: colors.accentRole.action }]} />)}
        </View>
      </View>

      <View style={[refinedStyles.card, refinedStyles.orientationCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <View style={refinedStyles.cardHeading}>
          <Feather name="compass" size={17} color={colors.accentRole.action} />
          <View style={refinedStyles.copyBlock}>
            <Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Understand {domain.name} before choosing an area</Text>
          </View>
        </View>
        {!orientation?.whatItStudies && domain.description ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What this field is about</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{domain.description}</Text>{domain.descriptionSources?.map((source) => <ExternalLinkGuard key={`${source.title}:${source.locator}`} url={source.url} label={source.shortLabel || source.title} description={`This source supports the overview of ${domain.name}.`} textStyle={[refinedStyles.meta, { color: colors.accentRole.action }]} />)}</View> : null}
        {orientation?.whatItStudies ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What this field studies</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.whatItStudies}</Text><OrientationEvidenceLinks orientation={orientation} field="whatItStudies" colors={colors} /></View> : null}
        {orientation?.whatPeopleDo ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What people in it do</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.whatPeopleDo}</Text><OrientationEvidenceLinks orientation={orientation} field="whatPeopleDo" colors={colors} /></View> : null}
        {orientation?.questions?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Questions this field helps answer</Text><View style={refinedStyles.infoGrid}>{orientation.questions.map((question) => <View key={question} style={[refinedStyles.infoCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Feather name="help-circle" size={15} color={colors.accentRole.action} /><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{question}</Text></View>)}</View><OrientationEvidenceLinks orientation={orientation} field="questions" colors={colors} /></View> : null}
        {orientation?.outputs?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>What the work can produce</Text><View style={refinedStyles.infoGrid}>{orientation.outputs.map((output) => <View key={output} style={[refinedStyles.infoCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Feather name="file-text" size={15} color={colors.accentRole.action} /><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{output}</Text></View>)}</View><OrientationEvidenceLinks orientation={orientation} field="outputs" colors={colors} /></View> : null}
        {orientation?.howWorkHappens?.length ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>How the work can happen</Text><View style={refinedStyles.steps}>{orientation.howWorkHappens.map((step, index) => <View key={step} style={refinedStyles.step}><View style={[refinedStyles.stepNumber, { backgroundColor: colors.accentRole.action }]}><Text style={refinedStyles.stepNumberText}>{index + 1}</Text></View><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{step}</Text></View>)}</View><OrientationEvidenceLinks orientation={orientation} field="howWorkHappens" colors={colors} /></View> : null}
        {!studentConnection && orientation?.whereProgrammeFits ? <View style={[refinedStyles.subsection, refinedStyles.highlight]}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Where your programme fits</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.whereProgrammeFits}</Text><OrientationEvidenceLinks orientation={orientation} field="whereProgrammeFits" colors={colors} /></View> : null}
        {orientation?.globalContext ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Global context</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.globalContext}</Text><OrientationEvidenceLinks orientation={orientation} field="globalContext" colors={colors} /></View> : null}
        {orientation?.nigerianContext ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Nigerian context</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.nigerianContext}</Text><OrientationEvidenceLinks orientation={orientation} field="nigerianContext" colors={colors} /></View> : null}
        {orientation?.entryExpectations ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Common ways people enter this field</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.entryExpectations}</Text><OrientationEvidenceLinks orientation={orientation} field="entryExpectations" colors={colors} /></View> : null}
        {orientation?.opportunitiesAndConstraints ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Opportunities and constraints</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{orientation.opportunitiesAndConstraints}</Text><OrientationEvidenceLinks orientation={orientation} field="opportunitiesAndConstraints" colors={colors} /></View> : null}
         {orientation?.sourceNote ? <Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>Reference basis: {orientation.sourceNote}</Text> : null}
      </View>

      {studentConnection ? (
        <View style={refinedStyles.card}>
          <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <View style={refinedStyles.cardHeading}><Feather name="book-open" size={17} color={colors.accentRole.action} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why your Sociology programme connects to this field</Text></View>
          <Text style={[refinedStyles.badge, { color: colors.accentRole.action }]}>{relationshipLabel}</Text>
          <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{studentConnection.explanation}</Text>
          {studentConnection.transferableLearningNarrative ? <View style={refinedStyles.subsection}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>How your learning carries into the field</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{studentConnection.transferableLearningNarrative}</Text></View> : null}
          <Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>Your programme provides a starting point. The compulsory domain path below adds field-wide learning; optional useful edges support particular work. This connection does not claim that your course teaches every later item or that you are job-ready.</Text>
          </View>
          <ProgrammeCurriculumCarryForward connection={studentConnection} fieldName={domain.name} />
        </View>
      ) : connection ? (
        <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <View style={refinedStyles.cardHeading}><Feather name="info" size={17} color={colors.textRole.muted} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Programme connection not available yet</Text></View>
          <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>We do not have enough verified information to explain this programme-to-field connection safely.</Text>
        </View>
      ) : null}

      {orientationResources.length ? <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Understand {domain.name}</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>Read an introductory guide to the field before choosing an area.</Text><LearningResourcesBlock resources={orientationResources} presentation="buttons" title="Field guide" buttonLabel={`Understand ${domain.name}`} /></View> : null}

      <View style={refinedStyles.sectionHeading}>
        <View style={refinedStyles.cardHeading}><Feather name="layers" size={17} color={colors.accentRole.action} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Your shared starting point</Text></View>
        <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>Your Sociology studies are the starting point. These field-wide foundations add ways to investigate social questions and assess evidence, and carry forward as you explore areas and roles.</Text>
      </View>
        <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domainItems} itemTypes={["skill", "competency", "method", "knowledge", "tool", "certification"]} resources={domainResources} contextLevel="domain" itemScope="shared-foundation" title="Foundations for this field" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
      </View>
      {/* Optional useful edges: GuidanceContinuation renders its own
          "Optional useful edges" heading below when domainItems has any
          non-compulsory rows. No separate heading here -- one would
          duplicate GuidanceContinuation's own label on screen. */}
      <GuidanceContinuation programmeName={studentConnection?.programmeName} connection={studentConnection} domainId={domain.id} domainName={domain.name} domainHasAreas={visibleAreas.length > 0} domainFoundation={domain.foundationSkills} domainItems={domainItems} />
      <View style={refinedStyles.sectionHeading}>
        <View style={refinedStyles.cardHeading}><Feather name="compass" size={17} color={colors.accentRole.action} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Build further across the field</Text></View>
        <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>The foundations above give you a shared base. These additional choices can deepen your learning for particular interests or tasks; choose the ones that fit the direction you want to explore.</Text>
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domainItems} itemTypes={["skill", "competency", "method", "knowledge"]} resources={domainResources} contextLevel="domain" itemScope="learning-options" sequenceBand="domain_core" title="Optional field learning choices" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domainItems} itemTypes={["skill", "competency", "method", "knowledge"]} resources={domainResources} contextLevel="domain" itemScope="learning-options" sequenceBand="cross_cutting" title="Research practices that support different routes" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domainItems} itemTypes={["method"]} resources={domainResources} contextLevel="domain" itemScope="learning-options" sequenceBand="method_routes" title="Ways to investigate a social question" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domainItems} itemTypes={["method"]} resources={domainResources} contextLevel="domain" itemScope="learning-options" sequenceBand="advanced_extensions" title="Advanced and specialist approaches" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
        <ContextualItemList items={domainItems} itemTypes={["method"]} resources={domainResources} contextLevel="domain" itemScope="learning-options" sequenceBand="specialist_extensions" title="Computational, spatial and simulation approaches" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
      </View>
      <View style={[refinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <ContextualItemList items={domainItems} itemTypes={["tool"]} resources={domainResources} contextLevel="domain" itemScope="learning-options" sequenceBand="tool_support" title="Tools for the chosen approach" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} domainName={domain.name} learningFocus targetStudentId={targetStudentId} showCaption={false} />
        <ToolGroupsBlock tools={domain.tools} resources={domainResources} contextItems={domainItems} contextLevel="domain" title="Tool groups and alternatives" commonLabel="Used across this field" distinctiveLabel="Useful for particular work" explanation="Tools are embedded after the method choice. Choose one suitable option; complementary libraries can be learned together. No tool is a universal domain blocker." learningFocus targetStudentId={targetStudentId} learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain.id }} />
        <View style={refinedStyles.subsection}>
          <Text style={[refinedStyles.subheading, { color: colors.textRole.primary }]}>Credentials and professional routes</Text>
          <CertPlacementList gateway={domain.gatewayCertifications} roleHint={domain.roleHintCertifications} contextItems={domainItems} resources={domainResources} contextLevel="domain" learningFocus targetStudentId={targetStudentId} emptyMessage="No reviewed domain-level credential is recorded here. A credential may apply only to a particular area or role." />
        </View>
      </View>

      <View style={refinedStyles.sectionHeading}>
        <View style={refinedStyles.cardHeading}><Feather name="grid" size={17} color={colors.accentRole.action} /><Text style={[refinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Choose a focused area</Text></View>
        <Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>Each area keeps the field foundation and adds a more specific way to study or work. Roles appear inside the area, not on this domain page.</Text>
      </View>
      {visibleAreas.length ? <View style={refinedStyles.grid}>{visibleAreas.map((subgroup) => <TouchableOpacity key={subgroup.id} accessibilityRole="button" onPress={() => exploreNav.subgroup(router, domainKey, subgroup.id, guidanceContext)} style={[refinedStyles.tile, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Feather name="grid" size={20} color={colors.accentRole.action} /><Text style={[refinedStyles.tileTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{formatCareerLabel(subgroup.name)}</Text><Text style={[refinedStyles.copy, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: subgroup.studentOrientation?.shortIntro, whatPeopleDo: subgroup.studentOrientation?.whatPeopleDo || subgroup.whatPeopleDo, whatItStudies: subgroup.studentOrientation?.whatItStudies, description: subgroup.description, fallback: "A plain-language explanation of this focused area is not available yet." })}</Text><Text style={[refinedStyles.meta, { color: colors.textRole.muted }]}>{subgroup.roleCount ?? 0} {(subgroup.roleCount ?? 0) === 1 ? "role" : "roles"} in this area</Text><Text style={[refinedStyles.actionText, { color: colors.accentRole.action }]}>Explore area →</Text></TouchableOpacity>)}</View> : <Text style={[refinedStyles.copy, { color: colors.textRole.muted }]}>{domain.id === "D078" ? "No current areas of specialization are available in this response." : "No reviewed areas are available yet."}</Text>}
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
  cardTitle: { fontSize: 18, lineHeight: 25, flex: 1 },
  copy: { fontSize: 16, lineHeight: 25 },
  meta: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  badge: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 },
  subsection: { gap: Spacing.xs, paddingTop: Spacing.sm },
  subheading: { fontSize: 18, lineHeight: 25, ...CompassFonts.bodySemibold },
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
  tileTitle: { fontSize: 18, lineHeight: 25 },
  action: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  trayAction: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  actionText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  tabIntro: { flexDirection: "row", gap: Spacing.md, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg },
});

export default DomainDetailScreen;

/** Keep retired D078 taxonomy nodes out of the student-facing area list. */

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
    fontSize: 16,
    lineHeight: 25,
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
  orientationHeading: { fontSize: 18, lineHeight: 25 },
  orientationList: { gap: Spacing.xs },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  statCard: { flex: 1, minWidth: 150, gap: 2, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md },
  statValue: { fontSize: FontSize.xl, fontWeight: "800" },
  statLabel: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  guidanceNote: { fontSize: 16, lineHeight: 24 },
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
  subgroupTitle: { fontSize: 18, lineHeight: 25 },
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
