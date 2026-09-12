import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CertPlacementList, ContextualItemList, DetailScaffold, GuidanceEvidenceBlock, LearningResourcesBlock, MethodEvidenceBlock, NigerianContextBlock, SectionLabel, TierBadgeView, ToolGroupsBlock } from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { careerRoleTierLabel, compareCareerRoles } from "@/lib/careerRoleOrdering";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { pending, type DataState, type DomainV2 } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";

export default function SubgroupDetailScreen() {
const params = useLocalSearchParams<{ id: string; subgroupId: string; programme_id?: string | string[]; jamb_programme_id?: string | string[]; school_id?: string | string[]; user_type?: string | string[]; journey_mode?: string | string[]; guidance_student_id?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; focus?: string | string[] }>();
  const domainId = String(params.id ?? "");
  const subgroupId = String(params.subgroupId ?? "");
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
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<DomainV2>>(() => pending("Loading area details..."));
  const [expanded, setExpanded] = useState(false);
  const [skillsExpanded, setSkillsExpanded] = useState(false);

  const onBack = useCallback(() => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (canGoBack) router.back();
    else router.replace(`${exploreNav.base}/domain/${encodeURIComponent(domainId)}` as never);
  }, [domainId, exploreNav.base, router]);

  const loadDomain = useCallback(() => {
    setState(pending("Loading area details..."));
    let active = true;
    void careerData.getDomainV2(domainId).then((value) => { if (active) setState(value); });
    return () => { active = false; };
  }, [domainId]);

  useEffect(() => loadDomain(), [loadDomain]);

  const subgroup = state.data?.subgroups.find((item) => item.id === subgroupId);
  const roles = (state.data?.roles.filter((role) => role.subgroupId === subgroupId) ?? []).sort(compareCareerRoles);
  const inheritedFoundation = (state.data?.foundationSkills ?? []).slice(0, 3);

  return <DetailScaffold eyebrow="AREA" title={subgroup?.name ?? "Area"} backLabel={`Back to ${state.data?.name ?? "domain"}`} onBack={onBack} save={focusedGuidance ? undefined : { entityType: "subgroup", entityId: subgroupId }} pdf pdfPath={targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html"} reportSelection={{ kind: "subgroups", id: subgroupId, name: subgroup?.name ?? "Area", domainId, domainName: state.data?.name }} targetStudentId={targetStudentId} state={state} onRetry={loadDomain} requiresAccountForDetails guestDescription={subgroup?.whatPeopleDo || subgroup?.description}>
    {() => subgroup ? <View style={styles.body}>
       <SectionLabel>Area overview</SectionLabel>
       <Text style={[styles.heading, { color: colors.textRole.primary }]}>What people do in this area</Text>
       <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{subgroup.whatPeopleDo || subgroup.description || "A plain-language description for this area is not available yet. Explore the attached capabilities, tools, evidence and roles to understand the area."}</Text>
       <Text style={[styles.copy, { color: colors.textRole.muted }]}>This is one focused area inside the wider domain. Understand the area first, then compare the roles organised here.</Text>
       <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={[styles.more, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{expanded ? "Show less area context" : "See more area context"}</Text></TouchableOpacity>
      {expanded ? <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
         <SectionLabel>What carries over from the domain</SectionLabel>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>These are examples of the portable domain foundation. This area adds a more focused set of capabilities; it does not replace the foundation.</Text>
        {inheritedFoundation.length ? <View style={styles.skillList}>{inheritedFoundation.map((item) => <Text key={item.skill} style={[styles.skill, { color: colors.textRole.secondary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>{item.skill}</Text>)}</View> : <Text style={[styles.copy, { color: colors.textRole.muted }]}>The domain foundation is not available in this response yet.</Text>}
      </View> : null}
      {subgroup.workContext?.length ? <View style={styles.detail}><SectionLabel>Typical work context</SectionLabel><Text style={[styles.copy, { color: colors.textRole.muted }]}>These context signals come from the attached occupational evidence. They describe the work setting, not a promise about every employer.</Text>{subgroup.workContext.map((context) => <Text key={`${context.name}-${context.frequency ?? ""}`} style={[styles.copy, { color: colors.textRole.secondary }]}>• {context.name}{context.frequency ? ` — ${context.frequency}` : ""}</Text>)}</View> : null}
       {subgroup.clusterSkills.length ? <View style={styles.detail}><SectionLabel>Capabilities to build in this area</SectionLabel><Text style={[styles.copy, { color: colors.textRole.muted }]}>Start with the capabilities shown first. The remaining ones are available when you want the full picture.</Text><View style={styles.skillList}>{(skillsExpanded ? subgroup.clusterSkills : subgroup.clusterSkills.slice(0, 3)).map((skill) => <Text key={skill} style={[styles.skill, { color: colors.textRole.secondary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>{skill}</Text>)}</View>{subgroup.clusterSkills.length > 3 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: skillsExpanded }} onPress={() => setSkillsExpanded((value) => !value)} style={[styles.more, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{skillsExpanded ? "Show fewer capabilities" : `See all ${subgroup.clusterSkills.length} capabilities`}</Text></TouchableOpacity> : null}</View> : null}
      <ContextualItemList items={subgroup.contextItems} title="What each capability and tool does in this area" />
       <ToolGroupsBlock tools={subgroup.tools} resources={subgroup.resources} title="Tools used in this area" commonLabel="Useful across this area" distinctiveLabel="More specialised tools in this area" explanation="These tools are attached to this area of work. The roles below show where the tools become useful in practice." />
      <MethodEvidenceBlock methods={subgroup.methodEvidence} title="Methods connected to this area" />
      <GuidanceEvidenceBlock evidence={subgroup.guidanceEvidence} />
      <NigerianContextBlock context={subgroup.nigerianContext} level="subgroup" />
       <View style={styles.detail}><SectionLabel>Credentials to understand</SectionLabel><CertPlacementList subgroup={subgroup.certifications} /></View>
       <LearningResourcesBlock resources={subgroup.resources} />
       <SectionLabel>Roles in this area</SectionLabel>
       <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are organised under this area. Open one after you understand the area to see what the work involves.</Text>
      {roles.length ? roles.map((role, index) => <React.Fragment key={role.key}>{(index === 0 || careerRoleTierLabel(role.tier) !== careerRoleTierLabel(roles[index - 1]?.tier)) ? <Text style={[styles.tierLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>{careerRoleTierLabel(role.tier)}</Text> : null}<TouchableOpacity accessibilityRole="button" onPress={() => exploreNav.role(router, role.key, guidanceContext)} style={[styles.role, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><View style={{ flex: 1, gap: Spacing.xs }}><Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><View style={styles.badgeRow}><TierBadgeView tier={role.tier} /></View><Text style={[styles.copy, { color: colors.textRole.muted }]}>View role details and connected skills.</Text></View><Text style={[styles.moreText, { color: colors.accentRole.action }]}>Open</Text></TouchableOpacity></React.Fragment>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}
    </View> : null}
  </DetailScaffold>;
}

const styles = StyleSheet.create({
  body: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  heading: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.25, ...CompassFonts.displayBold },
  copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  more: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: FontSize.sm, fontWeight: "800" },
  detail: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  skillList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  skill: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, fontSize: FontSize.xs },
  tierLabel: { fontSize: FontSize.xs, letterSpacing: 0.4, textTransform: "uppercase" },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, flexWrap: "wrap" },
  role: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  roleTitle: { fontSize: FontSize.md },
});
