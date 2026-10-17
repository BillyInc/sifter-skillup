import React, { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CertPlacementList,
  ContextualItemList,
  DetailScaffold,
  SectionLabel,
  ToolGroupsBlock,
  GuidanceContinuation,
  EntityUnavailableCard,
  HierarchyOrientationCard,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { formatCareerLabel, studentSummary } from "@/lib/careerLabels";
import { areaRoleOptions, type AreaRoleOption } from "@/lib/d078RoutePresentation";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { pending, type DataState, type DomainV2 } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { studentFacingCopy } from "@/lib/studentExplanation";
import { isStudentResource } from "@/components/careerIntelligence/resourceLinks";
import { ProgrammeOutcomeBridge } from "@/components/careerIntelligence/ProgrammeCurriculumCarryForward";

export default function SubgroupDetailScreen() {
  const params = useLocalSearchParams<{ id?: string; subgroupId?: string; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[] }>();
  const nestedRoute = Boolean(params.subgroupId);
  const domainId = nestedRoute ? String(params.id ?? "") : "";
  const subgroupId = String(params.subgroupId ?? params.id ?? "");
  const targetStudentId = Array.isArray(params.guidance_student_id) ? params.guidance_student_id[0] : params.guidance_student_id;
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
  const router = useRouter();
  const exploreNav = useExploreNav();
  const [state, setState] = useState<DataState<DomainV2>>(() => pending("Loading area details..."));

  const onBack = useCallback(() => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (canGoBack) router.back();
    else if (domainId) router.replace(`${exploreNav.base}/domain/${encodeURIComponent(domainId)}` as never);
    else router.replace(`${exploreNav.base}/domains` as never);
  }, [domainId, exploreNav.base, router]);

  const loadDomain = useCallback(() => {
    setState(pending("Loading area details..."));
    let active = true;
    const request = nestedRoute
      ? careerData.getDomainV2ForStudent(domainId, guidanceContext.programmeId)
      : careerData.getSubgroupV2ForStudent(subgroupId, guidanceContext.programmeId);
    void request.then((value) => { if (active) setState(value); });
    return () => { active = false; };
  }, [domainId, guidanceContext.programmeId, nestedRoute, subgroupId]);

  useEffect(() => loadDomain(), [loadDomain]);

  const subgroup = state.data?.subgroups.find((item) => item.id === subgroupId);
  const resolvedDomainId = state.data?.id ?? domainId;
  const roles = areaRoleOptions(state.data?.id ?? "", subgroup, state.data?.roles ?? []);
  const programmeConnection = state.data?.programmeConnection;

  return (
    <DetailScaffold
      eyebrow="AREA"
      title={formatCareerLabel(subgroup?.name ?? "Area")}
      backLabel={`Back to ${state.data?.name ?? "domain"}`}
      onBack={onBack}
      save={focusedGuidance ? undefined : { entityType: "subgroup", entityId: subgroupId }}
      reportSelection={{ kind: "subgroups", id: subgroupId, name: subgroup?.name ?? "Area", domainId: resolvedDomainId, domainName: state.data?.name }}
      targetStudentId={targetStudentId}
      state={state}
      onRetry={loadDomain}
      requiresAccountForDetails
      guestDescription={subgroup?.whatPeopleDo || subgroup?.description}
    >
      {() => subgroup ? <SubgroupBody subgroup={subgroup} domain={state.data} roles={roles} programmeConnection={programmeConnection} guidanceContext={guidanceContext} router={router} exploreNav={exploreNav} targetStudentId={targetStudentId} /> : (
        <EntityUnavailableCard
          entityLabel="focused area"
          parentLabel={state.data?.name ?? "the domain"}
          onBack={onBack}
          onRetry={loadDomain}
        />
      )}
      {/* {() => false && subgroup ? (
        <View style={styles.body}>
           <View style={styles.pathPill}>
             <Text style={[styles.pathText, { color: colors.textRole.muted }]}>{state.data?.name ?? "Domain"} / {subgroup.name}</Text>
           </View>
           {programmeConnection ? (
             <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
               <SectionLabel>Why this area is in your programme route</SectionLabel>
               <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{programmeConnection.explanation}</Text>
               {programmeConnection.courseAnchors?.length ? (
                 <Text style={[styles.copy, { color: colors.textRole.muted }]}>Based on learning in: {programmeConnection.courseAnchors.slice(0, 3).map((anchor) => anchor.title).join("; ")}</Text>
               ) : null}
             </View>
           ) : null}
          <View style={styles.section}>
              <SectionLabel>Area overview</SectionLabel>
              <Text style={[styles.heading, { color: colors.textRole.primary }]}>What people do in this area</Text>
              <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{subgroup.whatPeopleDo || subgroup.description || "A plain-language description for this area is not available yet. Explore the attached capabilities, tools, evidence and roles to understand the area."}</Text>
              <Text style={[styles.copy, { color: colors.textRole.muted }]}>This is one focused area inside the wider domain. Understand the area first, then compare the roles organised here.</Text>
              <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <SectionLabel>What carries over from the domain</SectionLabel>
                <Text style={[styles.copy, { color: colors.textRole.secondary }]}>This area adds a focused set of capabilities; it does not replace the wider domain foundation.</Text>
                {inheritedFoundation.length ? <View style={styles.skillList}>{inheritedFoundation.map((item) => <Text key={item.skill} style={[styles.skill, { color: colors.textRole.secondary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>{item.skill}</Text>)}</View> : <Text style={[styles.copy, { color: colors.textRole.muted }]}>The domain foundation is not available in this response yet.</Text>}
              </View>
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={[styles.more, { borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{expanded ? "Show less work context" : "See typical work context"}</Text>
              </TouchableOpacity>
              {expanded ? (
                <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                  <SectionLabel>Typical work context</SectionLabel>
                  {subgroup.workContext?.length ? subgroup.workContext.map((context) => <Text key={`${context.name}-${context.frequency ?? ""}`} style={[styles.copy, { color: colors.textRole.secondary }]}>• {context.name}{context.frequency ? ` — ${context.frequency}` : ""}</Text>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No additional work context is recorded for this area yet.</Text>}
                </View>
              ) : null}
            </View>
          <View style={styles.section}>
              <SectionLabel>Learn and prepare for this area</SectionLabel>
              {subgroup.clusterSkills.length ? <View style={styles.detail}><SectionLabel>Capabilities to build in this area</SectionLabel><Text style={[styles.copy, { color: colors.textRole.muted }]}>Start with the capabilities shown first. The remaining ones are available when you want the full picture.</Text><View style={styles.skillList}>{(skillsExpanded ? subgroup.clusterSkills : subgroup.clusterSkills.slice(0, 3)).map((skill) => <Text key={skill} style={[styles.skill, { color: colors.textRole.secondary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>{skill}</Text>)}</View>{subgroup.clusterSkills.length > 3 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: skillsExpanded }} onPress={() => setSkillsExpanded((value) => !value)} style={[styles.more, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{skillsExpanded ? "Show fewer capabilities" : `See all ${subgroup.clusterSkills.length} capabilities`}</Text></TouchableOpacity> : null}</View> : null}
               <ContextualItemList items={subgroup.contextItems} itemTypes={["skill", "competency", "method", "knowledge"]} resources={subgroup.resources} title="Skills, methods and knowledge for this area" contextLevel="subgroup" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} learningFocus targetStudentId={targetStudentId} />
               <ToolGroupsBlock tools={subgroup.tools} resources={subgroup.resources} contextItems={subgroup.contextItems} contextLevel="subgroup" title="Tools used in this area" commonLabel="Useful across this area" distinctiveLabel="More specialised tools in this area" explanation="These tools are attached to this area of work. They are options to understand and practise, not a requirement to learn every tool." learningFocus targetStudentId={targetStudentId} learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} />
        {subgroup.methodEvidence?.length ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>The method records are shown inside the skills and competency guidance because they explain how the capabilities are applied, not a separate qualification.</Text> : null}
              <View style={styles.detail}><SectionLabel>Credentials to understand</SectionLabel><CertPlacementList subgroup={subgroup.certifications} contextItems={subgroup.contextItems} /></View>
             </View>

          <View style={styles.section}>
              <SectionLabel>Roles in this area</SectionLabel>
              <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are organised under this area. Open one after you understand the area to see what the work involves.</Text>
              {roles.length ? <View style={styles.roleGrid}>{roles.map((role) => <TouchableOpacity key={role.key} accessibilityRole="button" onPress={() => exploreNav.role(router, role.key, guidanceContext)} style={[styles.role, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><View style={{ flex: 1, gap: Spacing.xs }}><Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.copy, { color: colors.textRole.muted }]}>{role.description || "Open this role to see its work summary and connected learning guidance."}</Text></View><Text style={[styles.moreText, { color: colors.accentRole.action }]}>Open</Text></TouchableOpacity>)}</View> : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}
            </View>
        </View>
      ) : null} */}
    </DetailScaffold>
  );
}

function SubgroupBody({ subgroup, domain, roles, programmeConnection, guidanceContext, router, exploreNav, targetStudentId }: {
  subgroup: NonNullable<DomainV2["subgroups"]>[number];
  domain: DomainV2 | null | undefined;
  roles: DomainV2["roles"];
  programmeConnection: DomainV2["programmeConnection"];
  guidanceContext: GuidanceRouteContext;
  router: ReturnType<typeof useRouter>;
  exploreNav: ReturnType<typeof useExploreNav>;
  targetStudentId?: string;
}) {
  const { colors } = useTheme();
  const studentConnection = programmeConnection && !programmeConnection.reviewRequired && !programmeConnection.sourceReviewRequired
    ? programmeConnection
    : null;
  const domainItems = (domain?.contextItems ?? []).filter((item) =>
    item.contextLevel === "domain"
    && item.guidanceOwner === "domain"
    && item.dataState === "source_backed"
    && item.sourceConfidence !== "unsourced"
    && item.claimReviewState === "approved"
    && item.linkState === "linked",
  );
  const subgroupItems = (subgroup.contextItems ?? []).filter((item) =>
    item.contextLevel === "subgroup"
    && item.guidanceOwner === "subgroup"
    && item.dataState === "source_backed"
    && item.sourceConfidence !== "unsourced"
    && item.claimReviewState === "approved"
    && item.linkState === "linked",
  );
  const selectedAreaDomainTools = domainItems.filter((item) =>
    item.itemType === "tool"
    && (item.pathTargets ?? []).some((target) =>
      (target.targetLevel === "subgroup" && target.targetKey === subgroup.id)
      || (target.targetLevel === "role" && roles.some((role) => role.key === target.targetKey)),
    ),
  );
  const inheritedDomainCompulsory = domainItems.some((item) => item.requirementLevel === "needed");
  const inheritedDomainOptions = domainItems.some((item) => item.requirementLevel !== "needed"
    && (item.pathTargets ?? []).some((target) =>
      (target.targetLevel === "subgroup" && target.targetKey === subgroup.id)
      || (target.targetLevel === "role" && roles.some((role) => role.key === target.targetKey)),
    ));
  const subgroupResources = (subgroup.resources ?? []).filter((resource) =>
    isStudentResource(resource, "subgroup"),
  );
  return (
    <View style={styles.body}>
      <Text style={[styles.pathText, { color: colors.textRole.muted }]}>{domain?.name ?? "Domain"} / {formatCareerLabel(subgroup.name)}</Text>
      <View style={styles.section}>
        <HierarchyOrientationCard
          level="area"
          title={subgroup.name}
          parentLabel={domain?.name ?? "the wider domain"}
          summary={subgroup.studentOrientation?.whatItStudies || subgroup.studentOrientation?.whatPeopleDo || subgroup.whatPeopleDo || subgroup.description}
            description={subgroup.description}
          workContext={subgroup.workContext}
          orientation={subgroup.studentOrientation}
        />
        {subgroup.isCurrentAreaOfSpecialization && subgroup.areaSources?.length ? <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
          <SectionLabel>Sources for this area description</SectionLabel>
          {subgroup.areaSources.map((source, index) => <TouchableOpacity key={`${source.id ?? source.url}-${index}`} accessibilityRole="link" onPress={() => { void Linking.openURL(source.url).catch(() => undefined); }}>
            <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{source.title ?? "Open source"} ↗</Text>
          </TouchableOpacity>)}
        </View> : null}
      </View>
      {studentConnection ? <ProgrammeOutcomeBridge connection={studentConnection} nextLayer="area" /> : programmeConnection ? <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}><SectionLabel>Programme connection not available yet</SectionLabel><Text style={[styles.copy, { color: colors.textRole.secondary }]}>We do not have enough verified information to explain this programme-to-area connection safely.</Text></View> : null}
      {domain?.studentOrientation || domain?.description ? <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <SectionLabel>{`What the ${domain?.name ?? "field"} studies`}</SectionLabel>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: domain?.studentOrientation?.shortIntro, whatItStudies: domain?.studentOrientation?.whatItStudies, whatPeopleDo: domain?.studentOrientation?.whatPeopleDo, description: domain?.description, fallback: "This section explains the wider field before showing its shared starting points." })}</Text>
      </View> : null}
      {inheritedDomainCompulsory || inheritedDomainOptions ? <View style={styles.section}>
        <View style={styles.badgeRow}><Feather name="layers" size={18} color={colors.accentRole.action} /><Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{`What carries forward from ${domain?.name ?? "the field"}`}</Text></View>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>The selected area keeps relevant domain learning in view. Compulsory foundations continue as inherited learning; useful edges remain optional choices and are not added unless you select them.</Text>
        {inheritedDomainCompulsory ? <ContextualItemList items={domainItems} itemTypes={["skill", "competency", "method", "knowledge", "tool", "certification"]} resources={domain?.resources} contextLevel="domain" itemScope="shared-foundation" title="Compulsory domain foundations carried forward" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} domainName={domain?.name} areaName={subgroup.name} learningFocus targetStudentId={targetStudentId} /> : null}
        {inheritedDomainOptions ? <>
          <ContextualItemList items={domainItems} itemTypes={["skill", "competency", "method", "knowledge", "tool", "certification"]} resources={domain?.resources} contextLevel="domain" itemScope="learning-options" title="Optional domain edges relevant to this area or its roles" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} domainName={domain?.name} areaName={subgroup.name} routeRoleIds={roles.map((role) => role.key)} learningFocus targetStudentId={targetStudentId} />
          <Text style={[styles.copy, { color: colors.textRole.muted }]}>These field-level options may support this area or one of its roles. They remain optional and are added to your saved route only if you choose them; opening this area does not select them automatically.</Text>
        </> : null}
        {selectedAreaDomainTools.length ? <ToolGroupsBlock tools={{ common: [], distinctive: [] }} resources={domain?.resources} contextItems={selectedAreaDomainTools} contextLevel="domain" title="Field tools connected to this area or its roles" explanation="Only tools with an explicit reviewed connection to this area or one of its roles appear here. Open a tool to understand the work it supports, what it does not replace and how it relates to the selected route." learningFocus targetStudentId={targetStudentId} learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} areaName={subgroup.name} /> : null}
      </View> : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open my learning tray"
        onPress={() => exploreNav.guided(router, { ...guidanceContext, programmeId: guidanceContext.programmeId, areaId: subgroup.id, focused: true, openTray: true })}
        style={[styles.trayAction, { borderColor: colors.accentRole.action, backgroundColor: colors.surface.subtle }]}
      >
        <Feather name="briefcase" size={17} color={colors.accentRole.action} />
        <Text style={[styles.moreText, { color: colors.accentRole.action }]}>View my learning tray</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <View style={styles.badgeRow}><Feather name="layers" size={18} color={colors.accentRole.action} /><SectionLabel>What this area adds</SectionLabel></View>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>The domain learning above carries into this area. These are this area’s own additions, shown in their reviewed order. Skills, tools, methods, knowledge, competencies and credentials stay together; optional useful edges can be skipped when you continue to a role.</Text>
        <ContextualItemList
          items={subgroupItems}
          itemTypes={["skill", "competency", "method", "knowledge", "tool", "certification"]}
          resources={subgroupResources}
          contextLevel="subgroup"
          itemScope="learning-options"
          sequenceBand="area_additions"
          title="Area learning sequence"
          methods={subgroup.methodEvidence}
          learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }}
          domainName={domain?.name}
          areaName={subgroup.name}
          learningFocus
          targetStudentId={targetStudentId}
        />
        <ToolGroupsBlock tools={subgroup.tools} resources={subgroupResources} contextItems={subgroupItems} contextLevel="subgroup" title="Tools for work in this area" commonLabel="Used across this area" distinctiveLabel="Useful for particular work" explanation="These named tools are connected to reviewed work in this area. Open one for its purpose, route, relationships and limits; the list is not a requirement to learn every tool." learningFocus targetStudentId={targetStudentId} learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} areaName={subgroup.name} />
        <View style={styles.detail}><SectionLabel>Credentials and professional routes</SectionLabel><CertPlacementList subgroup={subgroup.certifications} contextItems={subgroupItems} resources={subgroupResources} contextLevel="subgroup" learningFocus targetStudentId={targetStudentId} emptyMessage="No reviewed area-level credential is recorded here. A credential may apply only to a specific role." /></View>
      </View>
      <View style={styles.section}>
        <View style={styles.badgeRow}><Feather name="users" size={18} color={colors.accentRole.action} /><SectionLabel>Roles inside this area</SectionLabel></View>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are shown here only when the reviewed evidence connects their work to this area. A conditional route applies only in the stated work context; it is not a promise of employment or a qualification decision.</Text>
          {roles.length ? <View style={styles.roleGrid}>{roles.map((role) => {
            const areaOption = role as AreaRoleOption;
            const route = role.areaRoutes?.find((candidate) => candidate.areaId === subgroup.id)
              ?? (areaOption.areaRouteStatus ? {
                status: areaOption.areaRouteStatus,
                rationale: areaOption.areaRouteReason,
                condition: areaOption.areaRouteCondition,
                positiveTaskEvidence: areaOption.areaTaskEvidence,
                sourceReferences: areaOption.areaRouteSources,
              } : undefined);
            return <TouchableOpacity key={role.key} accessibilityRole="button" onPress={() => exploreNav.role(router, role.key, { ...guidanceContext, areaId: subgroup.id })} style={[styles.role, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
              <Feather name="user" size={20} color={colors.accentRole.action} />
              <View style={{ flex: 1, gap: Spacing.xs }}>
                <Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{formatCareerLabel(role.name)}</Text>
                {route?.status ? <Text style={[styles.tierLabel, { color: colors.textRole.muted }]}>{route.status === "reviewed_conditional" ? "Connected in a specific work context" : "Connected to this area"}</Text> : null}
                <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: role.studentOrientation?.shortIntro, whatPeopleDo: role.studentOrientation?.whatPeopleDo, whatItStudies: role.studentOrientation?.whatItStudies, description: role.description, fallback: "A plain-language explanation of this role is not available yet." })}</Text>
                {route?.condition ? <View style={styles.routeNote}><Text style={[styles.tierLabel, { color: colors.textRole.primary }]}>When this route applies</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{route.condition}</Text></View> : null}
                {route?.positiveTaskEvidence ? <View style={styles.routeNote}><Text style={[styles.tierLabel, { color: colors.textRole.primary }]}>Why this role connects to the area</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentFacingCopy(route.positiveTaskEvidence)}</Text></View> : null}
                {role.areaRoutes?.filter((candidate) => candidate.areaId !== subgroup.id && ["reviewed_supported", "reviewed_conditional"].includes(candidate.status ?? "") && candidate.areaName).length ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>Also connected to: {role.areaRoutes.filter((candidate) => candidate.areaId !== subgroup.id && ["reviewed_supported", "reviewed_conditional"].includes(candidate.status ?? "") && candidate.areaName).map((candidate) => candidate.areaName).join(", ")}</Text> : null}
                <Text style={[styles.moreText, { color: colors.accentRole.action }]}>Explore role →</Text>
              </View>
            </TouchableOpacity>;
          })}</View> : <Text accessibilityLabel={`Role routes not returned for ${subgroup.name}`} style={[styles.copy, { color: colors.textRole.muted }]}>No reviewed role routes were returned for this area. This response may be incomplete; it does not mean that no roles fit.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  pathPill: { paddingVertical: Spacing.xs },
  pathText: { fontSize: FontSize.xs, letterSpacing: 0.35 },
  section: { gap: Spacing.md },
  heading: { fontSize: 22, lineHeight: 29, ...CompassFonts.displayBold },
  copy: { fontSize: 16, lineHeight: 24 },
  more: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: 16, lineHeight: 23, fontWeight: "800" },
  trayAction: { alignSelf: "flex-start", minHeight: 44, flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  detail: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  skillList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  skill: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, fontSize: FontSize.xs },
  tierLabel: { fontSize: FontSize.xs, letterSpacing: 0.4, textTransform: "uppercase" },
  routeNote: { gap: Spacing.xs, borderLeftWidth: 2, borderLeftColor: "#64748B", paddingLeft: Spacing.sm },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, flexWrap: "wrap" },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  role: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, flex: 1, minWidth: 260 },
  roleTitle: { fontSize: 18, lineHeight: 25 },
  buildButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
});
