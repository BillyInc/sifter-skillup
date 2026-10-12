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
import { compareCareerRoles } from "@/lib/careerRoleOrdering";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { pending, type DataState, type DomainV2 } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { isStudentResource } from "@/components/careerIntelligence/resourceLinks";

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
  const roles = (state.data?.roles.filter((role) =>
    (state.data?.id === "D078" ? role.areaIds?.includes(subgroupId) : role.subgroupId === subgroupId)
    && role.guidanceAvailable === true
  ) ?? []).sort(compareCareerRoles);
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
              <ContextualItemList items={subgroup.contextItems} resources={subgroup.resources} title="What each capability and tool does in this area" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} learningFocus />
              <ToolGroupsBlock tools={subgroup.tools} resources={subgroup.resources} contextItems={subgroup.contextItems} title="Tools used in this area" commonLabel="Useful across this area" distinctiveLabel="More specialised tools in this area" explanation="These tools are attached to this area of work. They are options to understand and practise, not a requirement to learn every tool." />
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
    && item.linkState !== "review_required",
  );
  const subgroupItems = (subgroup.contextItems ?? []).filter((item) =>
    item.contextLevel === "subgroup"
    && item.guidanceOwner === "subgroup"
    && item.dataState === "source_backed"
    && item.sourceConfidence !== "unsourced"
    && item.linkState !== "review_required",
  );
  const subgroupResources = (subgroup.resources ?? []).filter((resource) =>
    isStudentResource(resource, "subgroup"),
  );
  return (
    <View style={styles.body}>
      <View style={[styles.detail, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <View style={styles.badgeRow}><Feather name="grid" size={18} color={colors.accentRole.action} /><Text style={[styles.pathText, { color: colors.textRole.muted }]}>{domain?.name ?? "Domain"} / {subgroup.name}</Text></View>
        <Text style={[styles.heading, { color: colors.textRole.primary }]}>{formatCareerLabel(subgroup.name)}</Text>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: subgroup.studentOrientation?.shortIntro, whatPeopleDo: subgroup.studentOrientation?.whatPeopleDo || subgroup.whatPeopleDo, whatItStudies: subgroup.studentOrientation?.whatItStudies, description: subgroup.description, fallback: "A plain-language explanation of this focused area is not available yet." })}</Text>
      </View>
      <GuidanceContinuation programmeName={studentConnection?.programmeName} connection={studentConnection} domainName={domain?.name ?? "Domain"} subgroupName={subgroup.name} domainFoundation={domain?.foundationSkills} domainItems={domainItems} subgroupItems={subgroupItems} />
      {programmeConnection && !studentConnection ? <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}><SectionLabel>Programme connection not available yet</SectionLabel><Text style={[styles.copy, { color: colors.textRole.secondary }]}>We do not have enough verified information to explain this programme-to-area connection safely.</Text></View> : null}
      <View style={styles.section}>
        <HierarchyOrientationCard
          level="area"
          title={subgroup.name}
          parentLabel={domain?.name ?? "the wider domain"}
          summary={subgroup.studentOrientation?.whatItStudies || subgroup.studentOrientation?.whatPeopleDo || subgroup.whatPeopleDo || subgroup.description}
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
      <View style={styles.section}>
        <View style={styles.badgeRow}><Feather name="layers" size={18} color={colors.accentRole.action} /><SectionLabel>What this area adds</SectionLabel></View>
        <ContextualItemList items={subgroupItems} itemTypes={["skill", "competency"]} resources={subgroupResources} methods={subgroup.methodEvidence} contextLevel="subgroup" title="Skills and competencies this area adds" learningRoute={{ programmeId: guidanceContext.programmeId, domainId: domain?.id, areaId: subgroup.id }} learningFocus />
        <ToolGroupsBlock tools={subgroup.tools} resources={subgroupResources} contextItems={subgroupItems} contextLevel="subgroup" title="Tool options" commonLabel="Useful across this area" distinctiveLabel="More specialised options" explanation="These are options in the available guidance. Each tool supports particular work; no single tool is the whole area." learningFocus targetStudentId={targetStudentId} />
        <View style={styles.detail}><SectionLabel>Qualifications and routes to understand</SectionLabel><CertPlacementList subgroup={subgroup.certifications} contextItems={subgroupItems} resources={subgroupResources} contextLevel="subgroup" learningFocus targetStudentId={targetStudentId} emptyMessage="No formal certification or qualification route is recorded for this area yet." /></View>
      </View>
      <View style={styles.section}>
        <View style={styles.badgeRow}><Feather name="users" size={18} color={colors.accentRole.action} /><SectionLabel>Roles inside this area</SectionLabel></View>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles belong inside an area because they use the area’s foundation in different ways. Open a role after you understand this area.</Text>
        {roles.length ? <View style={styles.roleGrid}>{roles.map((role) => <TouchableOpacity key={role.key} accessibilityRole="button" onPress={() => exploreNav.role(router, role.key, { ...guidanceContext, areaId: subgroup.id })} style={[styles.role, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Feather name="user" size={20} color={colors.accentRole.action} /><View style={{ flex: 1, gap: Spacing.xs }}><Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{formatCareerLabel(role.name)}</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: role.studentOrientation?.shortIntro, whatPeopleDo: role.studentOrientation?.whatPeopleDo, whatItStudies: role.studentOrientation?.whatItStudies, description: role.description, fallback: "A plain-language explanation of this role is not available yet." })}</Text><Text style={[styles.moreText, { color: colors.accentRole.action }]}>Explore role →</Text></View></TouchableOpacity>)}</View> : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No roles are available for this area yet.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  pathPill: { paddingVertical: Spacing.xs },
  pathText: { fontSize: FontSize.xs, letterSpacing: 0.35 },
  section: { gap: Spacing.md },
  heading: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.25, ...CompassFonts.displayBold },
  copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  more: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: FontSize.sm, fontWeight: "800" },
  detail: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  skillList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  skill: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, fontSize: FontSize.xs },
  tierLabel: { fontSize: FontSize.xs, letterSpacing: 0.4, textTransform: "uppercase" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, flexWrap: "wrap" },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  role: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, flex: 1, minWidth: 260 },
  roleTitle: { fontSize: FontSize.md },
  buildButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
});
