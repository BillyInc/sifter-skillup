/**
 * SkillsGapScreen — per-programme curriculum skill coverage. Demand belongs to
 * Market Intelligence and is deliberately not used to label curriculum gaps.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { Badge } from "@/components/ui";
import type { DataState } from "../../types/career";
import type { ProgrammeSkillCoverage, ProgrammeDomainSkillCoverage } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { adminAudienceForProfile } from "@/lib/adminAudience";
import { useAuth } from "@/hooks/useAuth";

function DomainCoverageCard({ domain }: { domain: ProgrammeDomainSkillCoverage }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const bridge = domain.resources.filter((resource) => resource.state === "bridge");
  const covered = domain.resources.filter((resource) => resource.state === "covered");
  const kindCount = (kind: string, state?: string) => domain.resources.filter((resource) => resource.kind === kind && (!state || resource.state === state)).length;
  const openResource = (url?: string) => {
    if (url) void Linking.openURL(url).catch(() => undefined);
  };
  return (
    <View style={[styles.domainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity onPress={() => setOpen((value) => !value)} style={styles.domainHeader} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.domainTitle, CompassFonts.bodyBold, { color: colors.text }]}>{domain.domainName}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{domain.matchType} connection · {domain.explanation}</Text>
        </View>
        <Badge label={domain.coverageStatus === "complete" ? `${bridge.length} bridge` : "Needs source"} variant={bridge.length ? "warning" : "success"} size="sm" />
      </TouchableOpacity>
      <View style={styles.countRow}>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Covered: {covered.length}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Bridge: {bridge.length}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Skills {kindCount("skill")} · Tools {kindCount("tool")} · Certifications {kindCount("certification")}</Text>
      </View>
      {open ? (
        <View style={styles.resourceList}>
          {domain.resources.map((resource, index) => (
            <View key={`${resource.kind}-${resource.name}-${resource.source}-${index}`} style={[styles.resourceRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.resourceName, { color: colors.text }]}>{resource.name}</Text>
                {resource.provider ? <Text style={[styles.meta, { color: colors.textMuted }]}>{resource.provider}</Text> : null}
                {resource.description ? <Text style={[styles.meta, { color: colors.textSoft }]} numberOfLines={2}>{resource.description}</Text> : null}
                <Text style={[styles.meta, { color: colors.textMuted }]}>{resource.kind} · {resource.source}{resource.scopeName ? ` · ${resource.scopeName}` : ""}{resource.roleName ? ` · ${resource.roleName}` : ""}</Text>
              </View>
              <View style={styles.resourceActions}>
                <Badge label={resource.state === "covered" ? "Covered" : "Bridge"} variant={resource.state === "covered" ? "success" : "warning"} size="sm" />
                {resource.url ? <TouchableOpacity accessibilityRole="link" onPress={() => openResource(resource.url)}><Text style={[styles.openLink, { color: colors.accent }]}>Open resource</Text></TouchableOpacity> : null}
              </View>
            </View>
          ))}
          {!domain.resources.length ? <Text style={[styles.meta, { color: colors.textMuted }]}>No domain, subgroup or role resources are recorded for comparison.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function ProgrammeCoverageCard({ report }: { report: ProgrammeSkillCoverage }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(true);
  const bridgeCount = report.domains.reduce((sum, domain) => sum + domain.bridgeCount, 0);
  return (
    <View style={[styles.programmeCard, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
      <TouchableOpacity onPress={() => setOpen((value) => !value)} style={styles.programmeHeader} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.programmeTitle, CompassFonts.bodyBold, { color: colors.text }]}>{report.programmeName}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Curriculum outcomes: {report.curriculumSkills.length} · mapped domains: {report.domains.length} · bridge resources: {bridgeCount}</Text>
        </View>
        <Badge label={report.curriculumStatus === "complete" ? "Curriculum recorded" : "Curriculum missing"} variant={report.curriculumStatus === "complete" ? "success" : "warning"} size="sm" />
      </TouchableOpacity>
      {open ? (
        <View style={styles.domainList}>
          {report.domains.map((domain) => <DomainCoverageCard key={`${report.programmeId}-${domain.domainId}`} domain={domain} />)}
          {!report.domains.length ? <Text style={[styles.meta, { color: colors.textMuted }]}>No mapped domain is recorded for this programme.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

export function SkillsGapScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isUniversity, setIsUniversity] = useState(false);
  const [coverage, setCoverage] = useState<DataState<ProgrammeSkillCoverage[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) setIsUniversity(adminAudienceForProfile(profile) === "university");
    });
    adminData.getProgrammeSkillCoverage().then((d) => {
      if (active) setCoverage(d);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <AdminShell title="Programme skill coverage" eyebrow="Curriculum intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Programme skill coverage
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Review each programme first, then the domain, subgroup and role
            resources that sit beyond its recorded curriculum outcomes. This
            is curriculum evidence only; market demand is reviewed separately
            in Market Intelligence.
          </Text>
          {!isUniversity ? (
            <ComingSoonPanel
              state={{ status: "coming_soon", data: null, meta: { notice: "Programme skill coverage is for university curriculum teams." } }}
              empty={() => true}
              emptyTitle="Not part of this workspace"
              emptyBody="School and tutorial teams should use student guidance and teaching workflows instead."
            >
              {() => null}
            </ComingSoonPanel>
          ) : (
            <ComingSoonPanel
              state={coverage}
              empty={(rows) => rows.length === 0}
              emptyTitle="No programme coverage data yet"
              emptyBody="Coverage appears after programme curriculum and domain-resource evidence is loaded."
            >
              {(rows) => <View style={styles.programmeList}>{rows.map((report) => <ProgrammeCoverageCard key={report.programmeId} report={report} />)}</View>}
            </ComingSoonPanel>
          )}
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default SkillsGapScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  programmeList: { gap: Spacing.md },
  programmeCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  programmeHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  programmeTitle: { fontSize: FontSize.md },
  domainList: { gap: Spacing.sm },
  domainCard: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.sm },
  domainHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  domainTitle: { fontSize: FontSize.sm },
  countRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  resourceList: { gap: 0 },
  resourceRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.sm, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resourceActions: { alignItems: "flex-end", gap: Spacing.xs },
  openLink: { fontSize: FontSize.xs, fontWeight: "700", textDecorationLine: "underline" },
  resourceName: { fontSize: FontSize.sm },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
