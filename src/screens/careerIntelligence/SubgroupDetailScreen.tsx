import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DetailScaffold, GuidanceReportButton, SectionLabel } from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import { comingSoon, type DataState, type DomainV2 } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";

export default function SubgroupDetailScreen() {
  const params = useLocalSearchParams<{ id: string; subgroupId: string; guidance_student_id?: string | string[]; focus?: string | string[] }>();
  const domainId = String(params.id ?? "");
  const subgroupId = String(params.subgroupId ?? "");
  const targetStudentId = Array.isArray(params.guidance_student_id) ? params.guidance_student_id[0] : params.guidance_student_id;
  const focusedGuidance = (Array.isArray(params.focus) ? params.focus[0] : params.focus) === "guidance";
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<DomainV2>>(() => comingSoon("Loading subgroup details..."));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    careerData.getDomainV2(domainId).then((value) => { if (active) setState(value); });
    return () => { active = false; };
  }, [domainId]);

  const subgroup = state.data?.subgroups.find((item) => item.id === subgroupId);
  const roles = state.data?.roles.filter((role) => role.subgroupId === subgroupId) ?? [];

  return <DetailScaffold eyebrow="SMALLER AREA" title={subgroup?.name ?? "Smaller area"} backLabel={`Back to ${state.data?.name ?? "field"}`} save={focusedGuidance ? undefined : { entityType: "subgroup", entityId: subgroupId }} reportSelection={{ kind: "subgroups", id: subgroupId, name: subgroup?.name ?? "Smaller area", domainId, domainName: state.data?.name }} targetStudentId={targetStudentId} pdf pdfPath={targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html"} state={state}>
    {() => subgroup ? <View style={styles.body}>
      <SectionLabel>Overview</SectionLabel>
      <Text style={[styles.heading, { color: colors.textRole.primary }]}>What people do in this area</Text>
      <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{subgroup.description || "This is a smaller area within the field. Explore its skills, resources and roles before adding it to your guidance."}</Text>
      <TouchableOpacity onPress={() => setExpanded((value) => !value)} style={[styles.more, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{expanded ? "Show less" : "View more"}</Text></TouchableOpacity>
      {expanded ? <View style={[styles.detail, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Skills connected to this area: {subgroup.clusterSkills.length ? subgroup.clusterSkills.join(", ") : "Not available yet."}</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Resources and certifications are shown when the source-backed records are available.</Text></View> : null}
      <SectionLabel>Roles in this area</SectionLabel>
      <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are organised under this smaller area. Open one to understand what it involves.</Text>
      {roles.length ? roles.map((role) => <TouchableOpacity key={role.key} onPress={() => exploreNav.role(router, role.key, targetStudentId, focusedGuidance)} style={[styles.role, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><View style={{ flex: 1 }}><Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.copy, { color: colors.textRole.muted }]}>View role details and connected skills.</Text></View><Text style={[styles.moreText, { color: colors.accentRole.action }]}>Open</Text></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}
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
  role: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  roleTitle: { fontSize: FontSize.md },
});
