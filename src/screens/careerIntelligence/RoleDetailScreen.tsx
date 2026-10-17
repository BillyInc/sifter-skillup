/**
 * RoleDetailScreen — the deep view for a single role in the v2 taxonomy.
 *
 * The detail view keeps role-owned competencies, tools, and certifications
 * separate from its parent domain and subgroup.
 * Uses the careerIntelligence component library for all design-system tokens.
 *
 * Phase 10b: responsive 2-column desktop layout with "On this page" section nav,
 * CompassFonts migration (FontWeight removed), vertical route-line diagram.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  DetailScaffold,
  NotesWidget,
  MappingFeedbackButton,
  SectionLabel,
  RouteLine,
  RoleWorkEvidenceBlock,
  ContextualItemList,
  MethodEvidenceBlock,
  GuidanceContinuation,
  ExternalLinkGuard,
  ContextSourceLinks,
  HierarchyOrientationCard,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import {
  pending,
  type DataState,
  type DomainRoleV2,
  type DomainRoleV2Enriched,
  type RoleToolV2,
  type CertificationV2Enriched,
  type CareerContextItem,
  type CareerContextItemRelationship,
  type CareerLearningResource,
} from "@/types/career";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import type { ColorPalette } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { studentContextSections, studentFacingCopy, studentOutputCopy } from "@/lib/studentExplanation";
import { contextItemFor, relationshipTargets as resolveRelationshipTargets } from "@/components/careerIntelligence/contextRelations";
import { isStudentResource, studentItemLinkUrl, studentSafeUrl } from "@/components/careerIntelligence/resourceLinks";
import { formatCareerLabel } from "@/lib/careerLabels";
import { studentOptionalRoleLearningItems, studentRoleLearningItems } from "@/lib/roleLearningItems";
import { ProgrammeOutcomeBridge } from "@/components/careerIntelligence/ProgrammeCurriculumCarryForward";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "skills", label: "Learning path" },
  { key: "routes", label: "Routes" },
  { key: "related", label: "Related" },
] as const;

/** Estimated chrome offset from scroll top to body content start. */
const CHROME_OFFSET = 104;

export interface RoleDetailScreenProps {
  /** Stable role key (e.g. "D011|securities trader"). */
  roleId?: string;
}

export function RoleDetailScreen(props: RoleDetailScreenProps) {
const params = useLocalSearchParams<{ id: string; area_id?: string | string[]; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[] }>();
  const router = useRouter();
  const outerScrollRef = useRef<ScrollView>(null);
  const roleKey = props.roleId ?? String(params.id ?? "");
  const targetStudentId = Array.isArray(params.guidance_student_id)
    ? params.guidance_student_id[0]
    : params.guidance_student_id;
  const focusedGuidance = (Array.isArray(params.focus) ? params.focus[0] : params.focus) === "guidance";
  const exploreNav = useExploreNav();
const guidanceContext: GuidanceRouteContext = {
    areaId: Array.isArray(params.area_id) ? params.area_id[0] : params.area_id,
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

  const [state, setState] = useState<DataState<DomainRoleV2>>(() =>
    pending<DomainRoleV2>("Loading role details..."),
  );

  const loadRole = useCallback(() => {
    setState(pending<DomainRoleV2>("Loading role details..."));
    let alive = true;
      void careerData.getRoleV2ForStudent(roleKey, guidanceContext.programmeId, guidanceContext.areaId).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [guidanceContext.areaId, guidanceContext.programmeId, roleKey]);

  useEffect(() => loadRole(), [loadRole]);

  const onBack = useCallback(() => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (canGoBack) {
      router.back();
      return;
    }
    const parentDomain = state.data?.appearsIn?.[0]?.domainId;
    const parentSubgroup = guidanceContext.areaId ?? (state.data?.appearsIn?.[0]?.domainId === "D078" ? undefined : state.data?.subgroupId);
    if (parentDomain && parentSubgroup) {
      router.replace(`${exploreNav.base}/domain/${encodeURIComponent(parentDomain)}/subgroup/${encodeURIComponent(parentSubgroup)}` as never);
    } else {
      router.replace(`${exploreNav.base}/domains` as never);
    }
  }, [exploreNav.base, guidanceContext.areaId, router, state.data]);

  return (
    <DetailScaffold
      eyebrow="ROLE"
      title={formatCareerLabel(state.data?.name ?? "Role")}
      backLabel={targetStudentId ? "Back to student guidance" : "Back to subgroup"}
      onBack={onBack}
      save={focusedGuidance ? undefined : { entityType: "role", entityId: roleKey }}
      reportSelection={{
        kind: "roles",
        id: roleKey,
        name: formatCareerLabel(state.data?.name ?? "Role"),
        domainId: state.data?.appearsIn?.[0]?.domainId,
        domainName: state.data?.appearsIn?.[0]?.domainName,
        subgroupId: guidanceContext.areaId ?? (state.data?.appearsIn?.[0]?.domainId === "D078" ? undefined : state.data?.subgroupId ?? undefined),
      }}
      targetStudentId={targetStudentId}
      state={state}
      onRetry={loadRole}
      scrollRef={outerScrollRef}
      requiresAccountForDetails
      guestDescription={state.data?.description}
    >
      {(role) => <RoleBody role={role} roleKey={roleKey} guidanceContext={guidanceContext} />}
    </DetailScaffold>
  );
}

function LegacyRoleBody({
  role,
  roleKey,
  targetStudentId,
  focusedGuidance,
  guidanceContext,
  outerScrollRef,
}: {
  role: DomainRoleV2;
  roleKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
  outerScrollRef: React.RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const resp = useResponsive();

  const aka = role.alsoKnownAs?.length ? role.alsoKnownAs.join(", ") : null;
  const essential = stringList(role.essentialSkills);
  const optional = stringList(role.optionalSkills);
  const roleTools = Array.isArray(role.tools) ? role.tools : [];
  const roleCertifications: CertificationV2Enriched[] = Array.isArray(role.certifications)
    ? (role.certifications as CertificationV2Enriched[]).filter((cert) => cert.marketScope !== "not_established")
    : [];
  const appearsIn = role.appearsIn ?? [];
  const enriched = role as DomainRoleV2Enriched;
  const currency = enriched.currencyStatus;
  const sourceUrl = studentSafeUrl(role.escoOccupationUris?.find((uri) => Boolean(studentSafeUrl(uri))));
  const sourceLabel = sourceUrl ? "Open the occupation source" : undefined;
  const isDesktop = resp.isDesktop && resp.isWeb;

  // Section positions for nav scrolling
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [certificationsExpanded, setCertificationsExpanded] = useState(false);
  const [sourceNotice, setSourceNotice] = useState<string | null>(null);
  const desktopScrollRef = useRef<ScrollView>(null);

  const commonRoleTools = roleTools.filter((tool) => tool.group === "common");
  const specificRoleTools = roleTools.filter((tool) => tool.group !== "common");
  const visibleEssential = skillsExpanded ? essential : essential.slice(0, 5);
  const visibleOptional = skillsExpanded ? optional : optional.slice(0, 5);
  const visibleCommonTools = toolsExpanded ? commonRoleTools : commonRoleTools.slice(0, 4);
  const visibleSpecificTools = toolsExpanded ? specificRoleTools : specificRoleTools.slice(0, 4);
  const visibleCertifications = certificationsExpanded ? roleCertifications : roleCertifications.slice(0, 4);
  const hiddenSkillCount = Math.max(0, essential.length + optional.length - visibleEssential.length - visibleOptional.length);
  const hiddenToolCount = Math.max(0, roleTools.length - visibleCommonTools.length - visibleSpecificTools.length);
  const skillLinks = new Map<string, string>();
  for (const item of role.contextItems ?? []) {
    if (item.itemType !== "skill") continue;
    const resource = role.resources?.find((candidate) =>
      candidate.url
      && ["skill_learning", "skill_reference"].includes(candidate.resourceType)
      && candidate.targetName.trim().toLowerCase() === item.name.trim().toLowerCase()
      && candidate.reviewStatus !== "review_only"
      && candidate.ownershipScope !== "audit_only",
    );
    const sourceUrl = resource?.url;
    if (sourceUrl) skillLinks.set(item.name.trim().toLowerCase(), sourceUrl);
  }
  const enrichedRole = role as DomainRoleV2Enriched;
  const programmeConnection = enrichedRole.programmeConnection;
  essential.forEach((name, index) => {
    const uri = enrichedRole.essentialSkillUris?.[index];
    if (uri && !skillLinks.has(name.trim().toLowerCase())) skillLinks.set(name.trim().toLowerCase(), uri);
  });
  optional.forEach((name, index) => {
    const uri = enrichedRole.optionalSkillUris?.[index];
    if (uri && !skillLinks.has(name.trim().toLowerCase())) skillLinks.set(name.trim().toLowerCase(), uri);
  });

  const openRoleSource = () => undefined;

  const onSectionLayout = useCallback((key: string, y: number) => {
    if (sectionY.current[key] === undefined) {
      sectionY.current[key] = CHROME_OFFSET + y;
    }
  }, []);

  const scrollTo = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
       (isDesktop ? desktopScrollRef.current : outerScrollRef.current)?.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
    setActiveSection(key);
  }, []);

  const content = (
    <>
      {/* 1 — Overview: identity badges */}
      <View onLayout={(e) => onSectionLayout("overview", e.nativeEvent.layout.y)} />
      {(aka || isElite(role.eliteStatus) || currency) ? (
        <View style={styles.identitySection}>
          {aka ? (
            <Text style={[styles.aka, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
              Also known as: {aka}
            </Text>
          ) : null}
          {isElite(role.eliteStatus) || currency ? (
            <View style={styles.badgeRow}>
              {currency ? (
                <CurrencyBadge status={currency} source={enriched.currencySource} />
              ) : null}
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
                  <Text style={[styles.eliteText, { color: colors.accentRole.status }, CompassFonts.bodySemibold]}>
                    Elite role
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
          {currency && enriched.currencySource ? (
            <Text style={[styles.currencySource, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
              Verified via {formatCurrencySource(enriched.currencySource)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {programmeConnection ? (
        <View style={[styles.connectionCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <SectionLabel>Why this role is in your programme route</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{programmeConnection.explanation}</Text>
          {programmeConnection.courseAnchors?.length ? (
            <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>Based on: {programmeConnection.courseAnchors.slice(0, 3).map((anchor: { code?: string | null; title: string }) => anchor.code ? `${anchor.code} · ${anchor.title}` : anchor.title).join("; ")}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Skills to build for this role */}
      <View onLayout={(e) => onSectionLayout("skills", e.nativeEvent.layout.y)} />
      <View style={styles.roleMeaning}>
        <SectionLabel>What this role means</SectionLabel>
        <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{role.description || "A plain-language occupation explanation is not attached to this role record yet. Use the preparation and evidence below without treating the title alone as a complete job description."}</Text>
          <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>This role belongs to the area you opened. The guidance moves from the work itself to what to build, practise and explore next.</Text>
        {sourceUrl ? <TouchableOpacity accessibilityRole="link" onPress={() => { void openRoleSource(); }}><Text style={[styles.sourceLink, { color: colors.accentRole.action }]}>{sourceLabel} for a fuller explanation ↗</Text></TouchableOpacity> : null}
        {sourceNotice ? <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>{sourceNotice}</Text> : null}
      </View>
      {(essential.length || optional.length) ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Skills to build for this role</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>Start with the essential skills, then add the supplementary ones as you progress.</Text>
          {essential.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                Needed for this route
              </Text>
               <ChipCloud items={visibleEssential} links={skillLinks} colors={colors} prominent />
            </View>
          ) : null}
          {optional.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                May strengthen this route
              </Text>
               <ChipCloud items={visibleOptional} links={skillLinks} colors={colors} prominent={false} />
             </View>
           ) : null}
           {(hiddenSkillCount > 0 || skillsExpanded) ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: skillsExpanded }} onPress={() => setSkillsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{skillsExpanded ? "Show fewer role skills" : `See all ${essential.length + optional.length} role skills`}</Text></TouchableOpacity> : null}
        </View>
      ) : <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>A skill list is not available for this role yet. This does not mean no preparation is needed.</Text>}
      <ContextualItemList items={role.contextItems} resources={role.resources} title="What each skill and tool does in this role" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: role.appearsIn[0]?.domainId, areaId: role.subgroupId ?? undefined, roleId: roleKey }} roleName={formatCareerLabel(role.name)} learningFocus />

      <MethodEvidenceBlock methods={role.computationalMethods} title="Methods that support these skills" />
      <RoleWorkEvidenceBlock profile={role.workProfile} />

      {(roleTools.length || roleCertifications.length) ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>What this role needs</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>Start with the role essentials, then add tools and credentials as your route becomes clearer. More supporting information appears below when it helps explain the route.</Text>
          {roleTools.length ? (
            <View style={{ gap: Spacing.xs }}>
              {(roleTools.filter((tool) => tool.group === "common").length) ? <>
                <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Tools to practise early</Text>
                <RoleToolCloud tools={visibleCommonTools} colors={colors} prominent />
              </> : null}
              {(roleTools.filter((tool) => tool.group !== "common").length) ? <>
                <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Role-specific tools</Text>
                <RoleToolCloud tools={visibleSpecificTools} colors={colors} prominent={false} />
              </> : null}
            </View>
          ) : null}
          {roleCertifications.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Credentials that may help</Text>
              <ChipCloud items={visibleCertifications.map((cert) => cert.name)} links={new Map(visibleCertifications.filter((cert) => cert.officialUrl).map((cert) => [cert.name.trim().toLowerCase(), cert.officialUrl as string]))} colors={colors} prominent={false} />
            </View>
          ) : null}
          {(hiddenToolCount > 0 || toolsExpanded) ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: toolsExpanded }} onPress={() => setToolsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{toolsExpanded ? "Show fewer role tools" : `See all ${roleTools.length} role tools`}</Text></TouchableOpacity> : null}
          {roleCertifications.length > 4 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: certificationsExpanded }} onPress={() => setCertificationsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{certificationsExpanded ? "Show fewer credentials" : `See all ${roleCertifications.length} credentials`}</Text></TouchableOpacity> : null}
        </View>
      ) : null}


      {/* 4 — Routes into this role */}
      <View onLayout={(e) => onSectionLayout("routes", e.nativeEvent.layout.y)} />
      <RouteIntoSection appearsIn={appearsIn} careerLadder={role.careerLadder} router={router} colors={colors} targetStudentId={targetStudentId} focusedGuidance={focusedGuidance} guidanceContext={guidanceContext} />

      {/* 5 — Related roles from career ladder */}
      <View onLayout={(e) => onSectionLayout("related", e.nativeEvent.layout.y)} />
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
                  exploreNav.role(router, slug, guidanceContext);
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* 6 — Footer actions */}
      <MappingFeedbackButton
        edgeType="domain_role"
        sourceId={appearsIn[0]?.domainId ?? roleKey}
        sourceLabel={appearsIn[0]?.domainName ?? "This domain"}
        targetId={roleKey}
        targetLabel={role.name}
        compact
      />
      <NotesWidget entityType="role" entityId={roleKey} />
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

  // Mobile / tablet: the role is one continuous narrative; the user scrolls
  // through the learning path instead of switching between content tabs.
  return (
    <View style={{ gap: Spacing.lg }}>
      {content}
    </View>
  );
}

function RolePreparationChain({
  skills,
  competencies,
  tools,
  certifications,
}: {
  skills: string[];
  competencies: string[];
  tools: string[];
  certifications: string[];
}) {
  const { colors } = useTheme();
  const cards = [
    { icon: "check-circle" as const, title: "Build the abilities", text: "Start with the essential abilities recorded for this role, then add the optional ones as the work becomes clearer.", items: skills.slice(0, 4) },
    { icon: "layers" as const, title: "Combine skills, methods and judgement", text: "A competency is the outcome produced when knowledge, skills, methods and judgement work together. The methods recorded for this role describe how the work is carried out; they are part of the ability, not a separate qualification.", items: competencies.slice(0, 4) },
    { icon: "tool" as const, title: "Choose tools for the task", text: "Tools support particular steps in the work. They are options and alternatives, not a requirement to learn every named tool.", items: tools.slice(0, 4) },
    { icon: "award" as const, title: "Check the qualification route", text: "Review the recorded qualification or certification information only where the route applies to your intended context.", items: certifications.slice(0, 4) },
  ].filter((card) => card.items.length);
  if (!cards.length) return null;
  return (
      <View style={[roleRefinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <View style={roleRefinedStyles.cardHeading}><Feather name="git-merge" size={17} color={colors.accentRole.action} /><Text style={[roleRefinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How the preparation fits together</Text></View>
      <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>The role path is a sequence, not a checklist: programme learning, shared field foundations, area additions, then role practice.</Text>
      <Text style={[roleRefinedStyles.meta, { color: colors.textRole.muted }]}>Understand the work first, build the abilities, then choose the tools and routes that fit the work you want to do.</Text>
      <View style={roleRefinedStyles.grid}>{cards.map((card) => <View key={card.title} style={[roleRefinedStyles.prepCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Feather name={card.icon} size={17} color={colors.accentRole.action} /><Text style={[roleRefinedStyles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{card.title}</Text><Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>{card.text}</Text><Text style={[roleRefinedStyles.prepItems, { color: colors.textRole.muted }]}>{card.items.join(" · ")}</Text></View>)}</View>
      </View>
  );
}

const ROLE_NON_ACTIONABLE_TOOLS = new Set([
  "microsoft office software",
  "office suite software",
  "spreadsheet software",
  "analytical or scientific software",
  "development environment software",
  "data base management system software",
  "data base user interface and query software",
  "business intelligence and data analysis software",
  "project management software",
  "web platform development software",
  "facebook",
  "instagram",
  "whatsapp",
  "mozilla firefox",
  "google chrome",
  "safari",
]);

function isStudentRoleTool(tool: RoleToolV2, contextItems: CareerContextItem[]): boolean {
  const name = tool.name.trim().toLowerCase();
  return Boolean(name)
    && !ROLE_NON_ACTIONABLE_TOOLS.has(name)
    && (!tool.dataState || tool.dataState === "source_backed")
    && tool.sourceConfidence !== "unsourced"
    && Boolean(contextItemFor(contextItems, "tool", tool.name));
}

function isStudentRoleCertification(cert: CertificationV2Enriched, contextItems: CareerContextItem[]): boolean {
  return cert.marketScope !== "not_established"
    && (!cert.dataState || cert.dataState === "source_backed")
    && cert.sourceConfidence !== "unsourced"
    && cert.guidanceOwner !== "role_aggregated"
    && cert.guidanceOwner !== "review_only"
    && cert.guidanceOwner !== "audit_only"
    && cert.reviewStatus !== "review_only"
    && cert.reviewStatus !== "unverified"
    && cert.ownershipScope !== "audit_only"
    && Boolean(contextItemFor(contextItems, "certification", cert.name));
}

function RoleBody({ role: rawRole, roleKey, guidanceContext }: {
  role: DomainRoleV2;
  roleKey: string;
  guidanceContext: GuidanceRouteContext;
}) {
  const { colors } = useTheme();
  const role: DomainRoleV2 = {
    ...rawRole,
    contextItems: studentRoleLearningItems(rawRole.contextItems),
  };
  const parent = role.parentContext;
  // A role can belong to more than one area of specialization. Keep every
  // reviewed route visible here; the route opened by the learner is marked,
  // while conditional routes retain their own condition rather than being
  // presented as universally applicable.
  const visibleAreaRoutes = (role.areaRoutes ?? []).filter((route) =>
    route.status === "reviewed_supported" || route.status === "reviewed_conditional",
  );
  const programmeConnection = role.programmeConnection && !role.programmeConnection.reviewRequired && !role.programmeConnection.sourceReviewRequired
    ? role.programmeConnection
    : null;
  const roleResources = (role.resources ?? []).filter((resource) => isStudentResource(resource, "role"));
  const studentContextItems = role.contextItems ?? [];
  const roleTaskOptions = studentOptionalRoleLearningItems(studentContextItems);
  const learningAreaId = guidanceContext.areaId ?? (role.appearsIn[0]?.domainId === "D078" ? undefined : role.subgroupId ?? undefined);
  const selectedAreaToolOptions = learningAreaId
    ? (role.areaToolOptions ?? []).filter((item) => item.contextKey === learningAreaId)
    : [];
  const selectedRouteTaskOptions = [...roleTaskOptions, ...selectedAreaToolOptions];
  const essentialSkills = [...new Set((role.essentialSkills ?? []).map((item) => item.trim()).filter(Boolean))]
    .filter((name) => Boolean(contextItemFor(studentContextItems, "skill", name)))
    .slice(0, 12);
  const essentialNames = new Set(essentialSkills.map((item) => item.toLowerCase()));
  const optionalSkills = [...new Set((role.optionalSkills ?? []).map((item) => item.trim()).filter(Boolean))]
    .filter((name) => !essentialNames.has(name.toLowerCase()) && Boolean(contextItemFor(studentContextItems, "skill", name)))
    .slice(0, 5);
  const skills = [...essentialSkills, ...optionalSkills];
  const tools = (Array.isArray(role.tools) ? role.tools : []).filter((tool) => isStudentRoleTool(tool, studentContextItems));
  const certifications = Array.isArray(role.certifications)
    ? (role.certifications as CertificationV2Enriched[]).filter((cert) => isStudentRoleCertification(cert, studentContextItems))
    : [];
  const competencies = [...new Set(studentContextItems.filter((item) => item.itemType === "competency").map((item) => item.name).filter(Boolean))];
  const roleMethods = (role.computationalMethods ?? []).filter((method) =>
    (!method.dataState || method.dataState === "source_backed")
    && Boolean(method.evidenceRoles?.some((candidate) => candidate.trim().toLowerCase() === role.name.trim().toLowerCase() || candidate.trim().toLowerCase() === role.key.trim().toLowerCase())),
  );
  const skillUrl = (name: string) => {
    return studentItemLinkUrl(contextItemFor(studentContextItems, "skill", name), roleResourceFor(roleResources, "skill", name));
  };
  return (
    <View style={roleRefinedStyles.page}>
      <HierarchyOrientationCard
        level="role"
        title={formatCareerLabel(role.name)}
        parentLabel={parent?.subgroupName || parent?.domainName || "its parent area"}
        summary={role.studentOrientation?.shortIntro || role.studentOrientation?.whatPeopleDo || role.studentOrientation?.whatItStudies || role.description}
        description={role.description}
        workContext={role.workProfile?.workContext}
        orientation={role.studentOrientation}
        activities={[
          ...(role.workProfile?.activities ?? []),
          ...(role.workProfile?.workActivities ?? []).map((item) => item.name ?? ""),
        ]}
      />
      {visibleAreaRoutes.length ? <View style={[roleRefinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <View style={roleRefinedStyles.cardHeading}><Feather name="layers" size={17} color={colors.accentRole.action} /><Text style={[roleRefinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Areas this role can connect to</Text></View>
        <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>A role may fit more than one area. Each route below has its own evidence and, where needed, its own conditions.</Text>
        {visibleAreaRoutes.map((route) => {
          const isSelected = route.areaId === guidanceContext.areaId;
          const routeReason = studentFacingCopy(route.positiveTaskEvidence || route.rationale);
          return <View key={route.areaId} style={[roleRefinedStyles.areaRoute, { borderColor: colors.borderRole.subtle, backgroundColor: isSelected ? colors.surface.raised : colors.surface.subtle }]}>
            <View style={roleRefinedStyles.cardHeading}>
              <Text style={[roleRefinedStyles.subheading, { color: colors.textRole.primary }]}>{route.areaName || "Area of specialization"}</Text>
              {isSelected ? <Text style={[roleRefinedStyles.badge, { color: colors.accentRole.action }]}>Selected route</Text> : null}
            </View>
            <Text style={[roleRefinedStyles.badge, { color: colors.textRole.muted }]}>{route.status === "reviewed_conditional" ? "Fits in a specific context" : "Reviewed fit for this area"}</Text>
            {routeReason ? <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>{routeReason}</Text> : null}
            {route.status === "reviewed_conditional" && route.condition ? <View style={roleRefinedStyles.routeCondition}>
              <Text style={[roleRefinedStyles.detailLabel, { color: colors.textRole.primary }]}>When this route applies</Text>
              <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>{studentFacingCopy(route.condition)}</Text>
            </View> : null}
          </View>;
        })}
      </View> : null}
      <View style={[roleRefinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <RoleWorkEvidenceBlock profile={role.workProfile} />
      </View>
      {programmeConnection ? <ProgrammeOutcomeBridge connection={programmeConnection} nextLayer="role" /> : null}
      <GuidanceContinuation programmeName={programmeConnection?.programmeName} connection={programmeConnection} domainId={role.appearsIn[0]?.domainId} domainHasAreas={visibleAreaRoutes.length > 0} domainName={parent?.domainName ?? "Domain"} subgroupName={parent?.subgroupName} roleName={formatCareerLabel(role.name)} domainFoundation={parent?.domainFoundation} domainItems={parent?.domainItems} subgroupItems={parent?.subgroupItems} roleItems={studentContextItems} />
      {(parent?.domainItems?.length || parent?.subgroupItems?.length) ? <View style={[roleRefinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <View style={roleRefinedStyles.cardHeading}><Feather name="corner-down-right" size={17} color={colors.accentRole.action} /><Text style={[roleRefinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Earlier-stage learning and choices for this role</Text></View>
        <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>Required domain and area learning carries forward in its original context; it is not a new role requirement. The optional choices below are available because they can support this role, but they enter your plan only if you select them.</Text>
        {parent?.domainItems?.some((item) => item.requirementLevel === "needed") ? <ContextualItemList items={parent.domainItems} resources={role.resources} contextLevel="domain" itemScope="shared-foundation" title="Compulsory domain foundations carried forward" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: parent.domainId ?? role.appearsIn[0]?.domainId, areaId: learningAreaId, roleId: roleKey }} domainName={parent.domainName ?? undefined} areaName={parent.subgroupName ?? undefined} roleName={formatCareerLabel(role.name)} learningFocus /> : null}
        {parent?.domainItems?.some((item) => item.requirementLevel !== "needed" && (item.pathTargets ?? []).some((target) => target.targetLevel === "role" && target.targetKey === roleKey)) ? <ContextualItemList items={parent.domainItems} resources={role.resources} contextLevel="domain" itemScope="learning-options" title="Optional domain choices for this role" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: parent.domainId ?? role.appearsIn[0]?.domainId, areaId: learningAreaId, roleId: roleKey }} domainName={parent.domainName ?? undefined} areaName={parent.subgroupName ?? undefined} roleName={formatCareerLabel(role.name)} routeRoleIds={[roleKey]} learningFocus /> : null}
        {parent?.subgroupItems?.some((item) => item.requirementLevel === "needed") ? <ContextualItemList items={parent.subgroupItems} resources={role.resources} contextLevel="subgroup" itemScope="shared-foundation" title="Compulsory area additions carried forward" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: parent.domainId ?? role.appearsIn[0]?.domainId, areaId: learningAreaId, roleId: roleKey }} domainName={parent.domainName ?? undefined} areaName={parent.subgroupName ?? undefined} roleName={formatCareerLabel(role.name)} learningFocus /> : null}
        {parent?.subgroupItems?.some((item) => item.requirementLevel !== "needed") ? <ContextualItemList items={parent.subgroupItems} resources={role.resources} contextLevel="subgroup" itemScope="learning-options" title="Optional area choices for this role route" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: parent.domainId ?? role.appearsIn[0]?.domainId, areaId: learningAreaId, roleId: roleKey }} domainName={parent.domainName ?? undefined} areaName={parent.subgroupName ?? undefined} roleName={formatCareerLabel(role.name)} learningFocus /> : null}
      </View> : null}
         <View style={[roleRefinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
         <View style={roleRefinedStyles.cardHeading}><Feather name="layers" size={17} color={colors.accentRole.action} /><Text style={[roleRefinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Role learning sequence for relevant work</Text></View>
         <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>These reviewed role-owned items are recommended for the bounded work described in each card. They are useful route additions, not universal role blockers or a job-readiness claim.</Text>
         <ContextualItemList items={studentContextItems} resources={role.resources} contextLevel="role" itemScope="learning-options" methods={roleMethods} title="Recommended role capabilities" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: role.appearsIn[0]?.domainId, areaId: learningAreaId, roleId: roleKey }} domainName={parent?.domainName ?? undefined} areaName={parent?.subgroupName ?? undefined} roleName={formatCareerLabel(role.name)} learningFocus />
       </View>
         <View style={[roleRefinedStyles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
         <View style={roleRefinedStyles.cardHeading}><Feather name="compass" size={17} color={colors.accentRole.action} /><Text style={[roleRefinedStyles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Options for particular tasks in this role</Text></View>
         <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}>These cards keep all useful choices for the selected work together: methods, capabilities, tools, knowledge and credentials. Alternatives are choices, while complementary items can be learned together. Tools owned by an area appear here only for the selected area route and remain area-owned.</Text>
         {visibleAreaRoutes.length > 1 && !learningAreaId ? <Text style={[roleRefinedStyles.routeCondition, { color: colors.textRole.muted }]}>Choose an area route above to include that area’s task-linked tools in this role view. Tools from unselected areas are not implied.</Text> : null}
         <ContextualItemList
           items={selectedRouteTaskOptions}
           itemTypes={["skill", "competency", "method", "knowledge", "tool", "certification"]}
           resources={role.resources}
           itemScope="learning-options"
           methods={roleMethods}
           title="Role learning options for the selected work"
           learningRoute={{ programmeId: guidanceContext.programmeId, domainId: role.appearsIn[0]?.domainId, areaId: learningAreaId, roleId: roleKey }}
           domainName={parent?.domainName ?? undefined}
           areaName={role.areaRoutes?.find((route) => route.areaId === learningAreaId)?.areaName ?? parent?.subgroupName ?? undefined}
           roleName={formatCareerLabel(role.name)}
           learningFocus
         />
       </View>
    </View>
  );
}

const roleRefinedStyles = StyleSheet.create({
  page: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  areaRoute: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  routeCondition: { gap: Spacing.xs, paddingTop: Spacing.xs },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  cardTitle: { flex: 1, fontSize: 18, lineHeight: 25 },
  copy: { fontSize: 16, lineHeight: 24 },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  badge: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.7, fontWeight: "800" },
  subsection: { gap: Spacing.xs, paddingTop: Spacing.sm },
  subheading: { fontSize: 18, lineHeight: 25, ...CompassFonts.bodySemibold },
  section: { gap: Spacing.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  itemCard: { flex: 1, minWidth: 230, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  prepCard: { flex: 1, minWidth: 220, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  itemTitle: { fontSize: 16, lineHeight: 23 },
  relationships: { gap: 2, paddingTop: Spacing.xs },
  detailLabel: { fontWeight: "800" },
  methodCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  prepItems: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
});

function roleResourceFor(
  resources: CareerLearningResource[],
  itemType: CareerContextItem["itemType"],
  name: string,
): CareerLearningResource | undefined {
  const allowed = itemType === "skill"
    ? ["skill_learning", "skill_reference"]
    : itemType === "tool"
      ? ["tool_learning"]
      : itemType === "certification"
        ? ["certification_exam", "professional_body"]
        : ["competency_reference"];
  const key = name.trim().toLowerCase();
  return resources.find((resource) =>
    resource.url
    && allowed.includes(resource.resourceType)
    && resource.targetName.trim().toLowerCase() === key
    && isStudentResource(resource),
  );
}

function methodSourceUrl(sourceProvenance?: Record<string, unknown>): string | undefined {
  if (!sourceProvenance) return undefined;
  for (const key of ["url", "sourceUrl", "source_url"]) {
    const value = sourceProvenance[key];
    if (typeof value === "string" && value.trim()) return studentSafeUrl(value);
  }
  return undefined;
}

function RoleItemDetails({ item, resource }: { item?: CareerContextItem; resource?: CareerLearningResource }) {
  const { colors } = useTheme();
  if (!item && !resource?.description) return null;
  const meaning = studentFacingCopy(item?.plainMeaning || resource?.description);
  const contextualUse = studentFacingCopy(studentContextSections(item?.contextualUse).meaning);
  const output = studentOutputCopy(item?.expectedOutput, item?.contextualUse);
  return <View style={roleRefinedStyles.relationships}>
    {meaning ? <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}><Text style={roleRefinedStyles.detailLabel}>What it is: </Text>{meaning}</Text> : null}
    {contextualUse ? <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}><Text style={roleRefinedStyles.detailLabel}>How it is used here: </Text>{contextualUse}</Text> : null}
    {output ? <Text style={[roleRefinedStyles.copy, { color: colors.textRole.secondary }]}><Text style={roleRefinedStyles.detailLabel}>What it can help you produce: </Text>{output}</Text> : null}
  </View>;
}

function studentRelationshipTargets(item: CareerContextItem | undefined, type: CareerContextItemRelationship["relationshipType"], contextItems?: CareerContextItem[]) {
  if (!item) return [];
  if (item.relationships !== undefined) {
    return item.relationships
      .filter((edge) => edge.relationshipStatus === "source_backed" && edge.relationshipType === type)
      .map((edge) => edge.toName || edge.toItemKey)
      .filter((name): name is string => Boolean(name));
  }
  return resolveRelationshipTargets(item, type, contextItems);
}

function RelationshipLines({ item, resource, contextItems }: { item?: CareerContextItem; resource?: CareerLearningResource; contextItems?: CareerContextItem[] }) {
  const { colors } = useTheme();
  const hasRelationship = (["builds_on", "works_with", "complements", "alternative", "supports", "qualifies_for"] as const).some((type) => studentRelationshipTargets(item, type, contextItems).length > 0);
  if (!hasRelationship && !item?.sourceReferences?.length && !resource?.sourceUrl) return null;
  return <View style={roleRefinedStyles.relationships}>
    {studentRelationshipTargets(item, "builds_on", contextItems).length ? <Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>Builds on: {studentRelationshipTargets(item, "builds_on", contextItems).join(" · ")}</Text> : null}
    {studentRelationshipTargets(item, "works_with", contextItems).length ? <Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>Works with: {studentRelationshipTargets(item, "works_with", contextItems).join(" · ")}</Text> : null}
    {studentRelationshipTargets(item, "complements", contextItems).length ? <Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>Complements: {studentRelationshipTargets(item, "complements", contextItems).join(" · ")}</Text> : null}
    {studentRelationshipTargets(item, "alternative", contextItems).length ? <Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>Alternatives: {studentRelationshipTargets(item, "alternative", contextItems).join(" · ")}</Text> : null}
    {studentRelationshipTargets(item, "supports", contextItems).length ? <Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>Supports: {studentRelationshipTargets(item, "supports", contextItems).join(" · ")}</Text> : null}
    {studentRelationshipTargets(item, "qualifies_for", contextItems).length ? <Text style={[roleRefinedStyles.meta, { color: colors.textRole.secondary }]}>May support: {studentRelationshipTargets(item, "qualifies_for", contextItems).join(" · ")}</Text> : null}
    <ContextSourceLinks item={item} resource={resource} />
  </View>;
}

// ─── Sub-components ───────────────────────────────────────────

/** "Routes into this role" — shows career ladder as a journey diagram. */
function RouteIntoSection({
  appearsIn,
  careerLadder,
  router,
  colors,
  targetStudentId,
  focusedGuidance,
  guidanceContext,
}: {
  appearsIn: DomainRoleV2["appearsIn"];
  careerLadder?: string[];
  router: ReturnType<typeof useRouter>;
  colors: ColorPalette;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
}) {
  const exploreNav = useExploreNav();
  const hasLadder = careerLadder?.length;
  const hasDomains = appearsIn.length;

  if (!hasLadder && !hasDomains) return null;

  return (
    <View style={{ gap: Spacing.sm }}>
      <SectionLabel>Routes into this role</SectionLabel>

      {hasDomains ? (
        <Text style={[styles.routeCaption, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
          Reachable from {appearsIn.length} {appearsIn.length === 1 ? "domain" : "domains"}
        </Text>
      ) : null}

      {/* Domain entry points as a spine */}
      {hasDomains ? (
        <View style={styles.domainChips}>
          {appearsIn.map((a) => (
            <TouchableOpacity
              key={a.domainId}
              onPress={() => exploreNav.domain(router, a.domainId, guidanceContext)}
              style={[
                styles.domainChip,
                {
                  backgroundColor: colors.surface.subtle,
                  borderColor: colors.borderRole.subtle,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.domainChipText, { color: colors.textRole.primary }, CompassFonts.bodySemibold]} numberOfLines={1}>
                {a.domainName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {/* Career ladder as a vertical route-line diagram */}
      {hasLadder ? (
        <RouteLine
          variant="vertical"
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
      <Text style={[styles.relatedChipText, { color: colors.textRole.primary }, CompassFonts.bodySemibold]} numberOfLines={1}>
        {name}
      </Text>
      <Text style={[styles.relatedArrow, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>→</Text>
    </TouchableOpacity>
  );
}

/** A wrapping cloud of skill chips. */
function ChipCloud({
  items,
  links,
  colors,
  prominent,
}: {
  items: string[];
  links?: Map<string, string>;
  colors: ColorPalette;
  prominent: boolean;
}) {
  const bg = prominent ? colors.surface.subtle : colors.surface.raised;
  const border = colors.borderRole.subtle;
  const textColor = prominent ? colors.textRole.primary : colors.textRole.secondary;
  return (
    <View style={styles.chipWrap}>
      {items.map((s, i) => {
        const url = links?.get(s.trim().toLowerCase());
        const content = (
          <Text
            style={[
              styles.chipText,
              { color: textColor },
              prominent ? CompassFonts.bodyBold : CompassFonts.bodySemibold,
              url ? styles.chipLink : null,
            ]}
            numberOfLines={1}
          >
            {s}{url ? " · open source" : ""}
          </Text>
        );
        return url ? (
          <TouchableOpacity
            key={`${s}-${i}`}
            accessibilityRole="link"
            accessibilityLabel={`Open source for ${s}`}
            onPress={undefined}
            style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
          >
            {content}
          </TouchableOpacity>
        ) : (
          <View
          key={`${s}-${i}`}
          style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
          >
            {content}
          </View>
        );
      })}
    </View>
  );
}

function RoleToolCloud({ tools, colors, prominent }: { tools: RoleToolV2[]; colors: ColorPalette; prominent: boolean }) {
  const bg = prominent ? colors.surface.subtle : colors.surface.raised;
  const textColor = prominent ? colors.textRole.primary : colors.textRole.secondary;
  return (
    <View style={styles.chipWrap}>
      {tools.map((tool, index) => (
        <TouchableOpacity
          key={`${tool.name}-${index}`}
          disabled={!tool.toolUrl}
          onPress={undefined}
          accessibilityRole={tool.toolUrl ? "link" : undefined}
          style={[styles.chip, { backgroundColor: bg, borderColor: colors.borderRole.subtle }]}
        >
          <Text style={[styles.chipText, { color: textColor }, tool.toolUrl ? styles.chipLink : null]} numberOfLines={1}>
            {tool.name}{tool.toolUrl ? " · open learning link" : ""}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (typeof value === "string") return value.split("|").map((item) => item.trim()).filter(Boolean);
  return [];
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
      <Text style={[styles.currencyText, { color: c.text }, CompassFonts.bodySemibold]}>{c.label}</Text>
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
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  currencySource: {
    fontSize: FontSize.xs,
  },

  // routes
  routeCaption: {
    fontSize: FontSize.sm,
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
  },

  guidanceNote: {
    fontSize: 16,
    lineHeight: 24,
  },
  connectionCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  roleMeaning: { gap: Spacing.sm },
  sourceLink: {
    fontSize: 16,
    lineHeight: 23,
    textDecorationLine: "underline",
  },
  // chips
  chipLabel: {
    fontSize: FontSize.xs,
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
  chipLink: { textDecorationLine: "underline" },
  moreButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  moreText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },

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
  },
  relatedArrow: {
    fontSize: FontSize.sm,
  },

  // Desktop layout
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
