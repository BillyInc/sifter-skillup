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
import { Linking, View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  DetailScaffold,
  TierBadgeView,
  NotesWidget,
  MappingFeedbackButton,
  SectionLabel,
  RouteLine,
  MethodEvidenceBlock,
  GuidanceEvidenceBlock,
  NigerianContextBlock,
  LearningResourcesBlock,
  RoleWorkEvidenceBlock,
  ContextualItemList,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import {
  pending,
  type DataState,
  type DomainRoleV2,
  type DomainRoleV2Enriched,
} from "@/types/career";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import type { ColorPalette } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { hasInternetConnection, OFFLINE_LINK_NOTICE } from "@/lib/networkState";

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "skills", label: "Skills" },
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
const params = useLocalSearchParams<{ id: string; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[] }>();
  const roleKey = props.roleId ?? String(params.id ?? "");
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

  const [state, setState] = useState<DataState<DomainRoleV2>>(() =>
    pending<DomainRoleV2>("Loading role details..."),
  );

  const loadRole = useCallback(() => {
    setState(pending<DomainRoleV2>("Loading role details..."));
    let alive = true;
    void careerData.getRoleV2(roleKey).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [roleKey]);

  useEffect(() => loadRole(), [loadRole]);

  return (
    <DetailScaffold
      eyebrow="ROLE"
      title={state.data?.name ?? "Role"}
      backLabel={targetStudentId ? "Back to student guidance" : "Back to subgroup"}
      save={focusedGuidance ? undefined : { entityType: "role", entityId: roleKey }}
      pdf
      pdfPath={targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html"}
      reportSelection={{
        kind: "roles",
        id: roleKey,
        name: state.data?.name ?? "Role",
        domainId: state.data?.appearsIn?.[0]?.domainId,
        domainName: state.data?.appearsIn?.[0]?.domainName,
        subgroupId: state.data?.subgroupId ?? undefined,
      }}
      targetStudentId={targetStudentId}
      state={state}
      onRetry={loadRole}
      requiresAccountForDetails
      guestDescription={state.data?.description}
    >
      {(role) => <RoleBody role={role} roleKey={roleKey} targetStudentId={targetStudentId} focusedGuidance={focusedGuidance} guidanceContext={guidanceContext} />}
    </DetailScaffold>
  );
}

function RoleBody({
  role,
  roleKey,
  targetStudentId,
  focusedGuidance,
  guidanceContext,
}: {
  role: DomainRoleV2;
  roleKey: string;
  targetStudentId?: string;
  focusedGuidance: boolean;
  guidanceContext: GuidanceRouteContext;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const resp = useResponsive();

  const aka = role.alsoKnownAs?.length ? role.alsoKnownAs.join(", ") : null;
  const essential = role.essentialSkills ?? [];
  const optional = role.optionalSkills ?? [];
  const roleTools = role.tools ?? [];
  const roleCertifications = role.certifications ?? [];
  const appearsIn = role.appearsIn ?? [];
  const enriched = role as DomainRoleV2Enriched;
  const currency = enriched.currencyStatus;
  const sourceUrl = role.escoOccupationUris?.[0]
    ?? (role.onetOccupationCodes?.[0] ? `https://www.onetonline.org/link/summary/${encodeURIComponent(role.onetOccupationCodes[0])}` : undefined);
  const sourceLabel = role.escoOccupationUris?.[0] ? "Open the ESCO occupation source" : role.onetOccupationCodes?.[0] ? "Open the O*NET occupation source" : undefined;
  const isDesktop = resp.isDesktop && resp.isWeb;

  // Section positions for nav scrolling
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [certificationsExpanded, setCertificationsExpanded] = useState(false);
  const [sourceNotice, setSourceNotice] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const commonRoleTools = roleTools.filter((tool) => tool.group === "common");
  const specificRoleTools = roleTools.filter((tool) => tool.group !== "common");
  const visibleEssential = skillsExpanded ? essential : essential.slice(0, 5);
  const visibleOptional = skillsExpanded ? optional : optional.slice(0, 5);
  const visibleCommonTools = toolsExpanded ? commonRoleTools : commonRoleTools.slice(0, 4);
  const visibleSpecificTools = toolsExpanded ? specificRoleTools : specificRoleTools.slice(0, 4);
  const visibleCertifications = certificationsExpanded ? roleCertifications : roleCertifications.slice(0, 4);
  const hiddenSkillCount = Math.max(0, essential.length + optional.length - visibleEssential.length - visibleOptional.length);
  const hiddenToolCount = Math.max(0, roleTools.length - visibleCommonTools.length - visibleSpecificTools.length);

  const openRoleSource = async () => {
    if (!sourceUrl) return;
    setSourceNotice(null);
    if (!(await hasInternetConnection())) {
      setSourceNotice(OFFLINE_LINK_NOTICE);
      return;
    }
    const opened = await Linking.openURL(sourceUrl).then(() => true).catch(() => false);
    if (!opened) setSourceNotice("This source could not be opened. Try again when your connection is stable.");
  };

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

  const content = (
    <>
      {/* 1 — Overview: identity badges */}
      <View onLayout={(e) => onSectionLayout("overview", e.nativeEvent.layout.y)} />
      {(aka || role.tier || isElite(role.eliteStatus) || currency) ? (
        <View style={styles.identitySection}>
          {aka ? (
            <Text style={[styles.aka, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
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

      {/* Skills to build for this role */}
      <View onLayout={(e) => onSectionLayout("skills", e.nativeEvent.layout.y)} />
      <View style={styles.roleMeaning}>
        <SectionLabel>What this role means</SectionLabel>
        <Text style={[styles.guidanceNote, { color: colors.textRole.secondary }]}>{role.description || "A source-backed occupation explanation is not attached to this role record yet. Review the preparation and evidence below without treating the title alone as a complete job description."}</Text>
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
               <ChipCloud items={visibleEssential} colors={colors} prominent />
            </View>
          ) : null}
          {optional.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                May strengthen this route
              </Text>
               <ChipCloud items={visibleOptional} colors={colors} prominent={false} />
             </View>
           ) : null}
           {(hiddenSkillCount > 0 || skillsExpanded) ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: skillsExpanded }} onPress={() => setSkillsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{skillsExpanded ? "Show fewer role skills" : `See all ${essential.length + optional.length} role skills`}</Text></TouchableOpacity> : null}
        </View>
      ) : <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>No role skill list is attached to this source record yet. Do not treat the absence as proof that no preparation is needed.</Text>}
      <ContextualItemList items={role.contextItems} title="What each skill and tool does in this role" />

      <MethodEvidenceBlock methods={role.computationalMethods} title="Methods connected to this role" />
      <GuidanceEvidenceBlock evidence={role.guidanceEvidence} />
      <NigerianContextBlock context={role.nigerianContext} level="role" />
      <RoleWorkEvidenceBlock profile={role.workProfile} />

      {(roleTools.length || roleCertifications.length) ? (
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>What this role needs</SectionLabel>
          <Text style={[styles.guidanceNote, { color: colors.textRole.muted }]}>Start with the role essentials, then add tools and credentials as your route becomes clearer. Nigerian, remote and global signals remain separate when the source data supports them.</Text>
          {roleTools.length ? (
            <View style={{ gap: Spacing.xs }}>
              {(roleTools.filter((tool) => tool.group === "common").length) ? <>
                <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Tools to practise early</Text>
                <ChipCloud items={visibleCommonTools.map((tool) => tool.name)} colors={colors} prominent />
              </> : null}
              {(roleTools.filter((tool) => tool.group !== "common").length) ? <>
                <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Role-specific tools</Text>
                <ChipCloud items={visibleSpecificTools.map((tool) => tool.name)} colors={colors} prominent={false} />
              </> : null}
            </View>
          ) : null}
          {roleCertifications.length ? (
            <View style={{ gap: Spacing.xs }}>
              <Text style={[styles.chipLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Credentials that may help</Text>
              <ChipCloud items={visibleCertifications.map((cert) => cert.name)} colors={colors} prominent={false} />
            </View>
          ) : null}
          {(hiddenToolCount > 0 || toolsExpanded) ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: toolsExpanded }} onPress={() => setToolsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{toolsExpanded ? "Show fewer role tools" : `See all ${roleTools.length} role tools`}</Text></TouchableOpacity> : null}
          {roleCertifications.length > 4 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: certificationsExpanded }} onPress={() => setCertificationsExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{certificationsExpanded ? "Show fewer credentials" : `See all ${roleCertifications.length} credentials`}</Text></TouchableOpacity> : null}
        </View>
      ) : null}

      <LearningResourcesBlock resources={role.resources} />

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
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
  },
  roleMeaning: { gap: Spacing.sm },
  sourceLink: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
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
