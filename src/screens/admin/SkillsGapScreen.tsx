/**
 * Programme intelligence — the institution's recorded programme teaching
 * versus sourced downstream domain/subgroup/role capability evidence.
 *
 * The API currently supplies curriculum evidence and domain/subgroup/role
 * evidence. The latter is the downstream comparison layer for this view: an
 * item is a gap candidate when it is present in that layer but is not evidenced
 * in the institution's programme teaching record. Employment-posting metrics
 * are a separate signal and are not required for this comparison.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  CompassFonts,
  FontSize,
  Radius,
  Spacing,
  useTheme,
  webContainer,
} from "@/theme";
import { Badge } from "@/components/ui";
import { adminData } from "@/lib/adminData";
import { adminWorkspaceAudienceForProfile, type AdminWorkspaceAudience } from "@/lib/adminAudience";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import type { DataState } from "@/types/career";
import type {
  ProgrammeDomainSkillCoverage,
  ProgrammeResourceEvidence,
  ProgrammeSkillCoverage,
} from "@/types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

type MatchType = "direct" | "functional" | "adjacent" | string;

const PRIORITY: { matchType: MatchType; title: string; description: string }[] = [
  {
    matchType: "direct",
    title: "Priority 1 — Direct domain preparation",
    description: "Start here. These domains are most closely connected to the programme curriculum and its mapped career structure.",
  },
  {
    matchType: "functional",
    title: "Priority 2 — Functional extensions",
    description: "Review these after the direct route. They show capabilities that can transfer into a different field.",
  },
  {
    matchType: "adjacent",
    title: "Priority 3 — Adjacent exploration",
    description: "These are optional related directions. They may require a larger bridge of additional learning.",
  },
];

function audienceCopy(audience: AdminWorkspaceAudience): { eyebrow: string; title: string; body: string } {
  if (audience === "university") {
    return {
      eyebrow: "Curriculum intelligence",
      title: "Programme intelligence",
      body: "Compare the institution's recorded programme teaching with sourced skills, tools, competencies and certifications in its direct, functional and adjacent domain connections. Direct connections come first for curriculum review.",
    };
  }
  if (audience === "tutorial_centre") {
    return {
      eyebrow: "Student preparation intelligence",
      title: "Programme preparation",
      body: "Use the same programme-to-career evidence to plan student preparation. Start with the direct domain, then use functional and adjacent connections only when they help a student explore further.",
    };
  }
  return {
    eyebrow: "Student guidance intelligence",
    title: "Programme guidance",
    body: "Use this to explain what a programme teaches and what students may need to build next. Start with the direct domain; functional and adjacent connections are later options, not gaps in your school.",
  };
}

function relationshipLabel(matchType: MatchType): string {
  if (matchType === "direct") return "Direct connection";
  if (matchType === "functional") return "Functional connection";
  if (matchType === "adjacent") return "Adjacent connection";
  return "Mapped connection";
}

function resourceState(resource: ProgrammeResourceEvidence): { label: string; variant: "success" | "warning" } {
  if (resource.curriculumState === "taught" || resource.state === "covered") {
    return { label: "Taught in programme record", variant: "success" };
  }
  if (resource.curriculumState === "partly_evidenced") {
    return { label: "Partly evidenced in CCMAS", variant: "warning" };
  }
  if (resource.curriculumState === "source_review" || resource.marketState === "source_review") {
    return { label: "Source review", variant: "warning" };
  }
  return { label: "Not evidenced in teaching record", variant: "warning" };
}

function ResourceRow({ resource }: { resource: ProgrammeResourceEvidence }) {
  const { colors } = useTheme();
  const state = resourceState(resource);
  const scope = [
    resource.source,
    resource.scopeName,
    resource.roleName ? `Role: ${resource.roleName}` : null,
  ].filter(Boolean).join(" · ");

  return (
    <View style={[styles.resourceRow, { borderTopColor: colors.border }]}>
      <View style={styles.resourceCopy}>
        <View style={styles.resourceTitleRow}>
          <Text style={[styles.resourceName, CompassFonts.bodySemibold, { color: colors.text }]}>{resource.name}</Text>
          <Badge label={state.label} variant={state.variant} size="sm" />
        </View>
        {resource.description ? <Text style={[styles.meta, { color: colors.textMuted }]}>{resource.description}</Text> : null}
        <Text style={[styles.meta, { color: colors.textSoft }]}>{resource.kind} · {scope}</Text>
        {resource.explanation ? <Text style={[styles.meta, { color: colors.textMuted }]}>{resource.explanation}</Text> : null}
        {resource.marketState === "market_practice_evidence" ? <Text style={[styles.meta, { color: colors.textMuted }]}>Sourced downstream practice evidence · not employment demand</Text> : null}
        {resource.sourceConfidence || resource.dataState ? (
          <Text style={[styles.meta, { color: colors.textMuted }]}>Evidence: {[resource.sourceConfidence, resource.dataState].filter(Boolean).join(" · ")}</Text>
        ) : null}
        {resource.evidenceSource || resource.observedAt || resource.geography ? (
          <Text style={[styles.meta, { color: colors.textSoft }]}>Source context: {[resource.evidenceSource, resource.geography, resource.observedAt].filter(Boolean).join(" · ")}</Text>
        ) : null}
      </View>
      {resource.url ? (
        <TouchableOpacity accessibilityRole="link" onPress={() => void Linking.openURL(resource.url!).catch(() => undefined)}>
          <Text style={[styles.openLink, { color: colors.accent }]}>Open source</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function ResourceGroup({ title, resources }: { title: string; resources: ProgrammeResourceEvidence[] }) {
  const { colors } = useTheme();
  if (!resources.length) return null;
  return (
    <View style={styles.resourceGroup}>
      <Text style={[styles.groupLabel, CompassFonts.bodySemibold, { color: colors.textMuted }]}>{title}</Text>
      <View>{resources.map((resource, index) => <ResourceRow key={`${resource.kind}-${resource.name}-${index}`} resource={resource} />)}</View>
    </View>
  );
}

function ResourceGroupsByScope({
  title,
  resources,
  includeRole,
}: {
  title: string;
  resources: ProgrammeResourceEvidence[];
  includeRole?: boolean;
}) {
  const groups = new Map<string, ProgrammeResourceEvidence[]>();
  for (const resource of resources) {
    const scope = [resource.scopeName, includeRole ? resource.roleName : null]
      .filter(Boolean)
      .join(" · ") || "Unspecified scope";
    groups.set(scope, [...(groups.get(scope) ?? []), resource]);
  }
  return (
    <View style={styles.resourceGroupStack}>
      {[...groups.entries()].map(([scope, items]) => (
        <ResourceGroup key={`${title}-${scope}`} title={`${title} · ${scope}`} resources={items} />
      ))}
    </View>
  );
}

function DomainCoverageCard({ domain, priority }: { domain: ProgrammeDomainSkillCoverage; priority: number }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const covered = domain.resources.filter((resource) => resource.state === "covered");
  const gapCandidates = domain.resources.filter((resource) => resource.state === "bridge");
  const domainResources = domain.resources.filter((resource) => resource.source === "domain");
  const subgroupResources = domain.resources.filter((resource) => resource.source === "subgroup");
  const roleResources = domain.resources.filter((resource) => resource.source === "role");

  return (
    <View style={[styles.domainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => setOpen((value) => !value)}
        style={styles.domainHeader}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={styles.domainHeading}>
          <Text style={[styles.domainTitle, CompassFonts.bodyBold, { color: colors.text }]}>{domain.domainName}</Text>
          <Text style={[styles.meta, { color: colors.accent }]}>{relationshipLabel(domain.matchType)}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{domain.explanation}</Text>
        </View>
        <View style={styles.domainBadgeStack}>
          <Badge label={`Priority ${priority}`} variant={priority === 1 ? "success" : "warning"} size="sm" />
          <Text style={[styles.expand, { color: colors.accent }]}>{open ? "Hide" : "Review"}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.countRow}>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Institution-taught records: {covered.length}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Downstream items not in teaching record: {gapCandidates.length}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Skills {domain.resources.filter((r) => r.kind === "skill").length} · Tools {domain.resources.filter((r) => r.kind === "tool").length} · Certifications {domain.resources.filter((r) => r.kind === "certification").length}</Text>
      </View>

      {open ? (
        <View style={styles.resourceList}>
          <Text style={[styles.explanation, { color: colors.textMuted }]}>A candidate is shown because a sourced downstream domain, subgroup or role record contains it and the institution's programme teaching record does not currently evidence it by name. Review the source and curriculum context before changing teaching plans; this is not an accreditation or employment-demand finding.</Text>
          <ResourceGroup title="Domain-owned downstream records" resources={domainResources} />
          <ResourceGroupsByScope title="Subgroup-owned downstream records" resources={subgroupResources} />
          <ResourceGroupsByScope title="Role-owned downstream records" resources={roleResources} includeRole />
          {!domain.resources.length ? <Text style={[styles.meta, { color: colors.textMuted }]}>No sourced downstream skills, tools or certifications are recorded for this connection.</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

function CurriculumBaseline({ report }: { report: ProgrammeSkillCoverage }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const items = report.curriculumSkills;
  const visible = open ? items : items.slice(0, 8);
  return (
    <View style={[styles.baseline, { backgroundColor: colors.surface.raised, borderColor: colors.border }]}>
      <View style={styles.baselineHeader}>
        <View style={styles.baselineCopy}>
          <Text style={[styles.cardTitle, CompassFonts.bodyBold, { color: colors.text }]}>What this programme teaches</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Institution teaching record · {items.length} CCMAS learning items</Text>
        </View>
        <Badge label={report.curriculumStatus === "complete" ? "Teaching record complete" : "Teaching record incomplete"} variant={report.curriculumStatus === "complete" ? "success" : "warning"} size="sm" />
      </View>
      <View style={styles.curriculumColumns}>
        <CurriculumColumn title="Technical / subject capabilities" items={report.curriculumTechnical} />
        <CurriculumColumn title="Transferable capabilities" items={report.curriculumTransferable} />
      </View>
      {visible.length ? <View style={styles.curriculumList}>{visible.map((item, index) => <Text key={`${item}-${index}`} style={[styles.curriculumItem, { color: colors.text }]}>{item}</Text>)}</View> : <Text style={[styles.meta, { color: colors.textMuted }]}>No curriculum outcomes are available for this programme yet.</Text>}
      {items.length > 8 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((value) => !value)}><Text style={[styles.openLink, { color: colors.accent }]}>{open ? "Show fewer curriculum items" : `See all ${items.length} curriculum items`}</Text></TouchableOpacity> : null}
    </View>
  );
}

function CurriculumColumn({ title, items }: { title: string; items: string[] }) {
  const { colors } = useTheme();
  return (
    <View style={styles.curriculumColumn}>
      <Text style={[styles.groupLabel, CompassFonts.bodySemibold, { color: colors.textMuted }]}>{title}</Text>
      <Text style={[styles.meta, { color: colors.textSoft }]}>{items.length ? `${items.length} recorded` : "No separate items recorded"}</Text>
    </View>
  );
}

function ProgrammeCoverageCard({ report }: { report: ProgrammeSkillCoverage }) {
  const { colors } = useTheme();
  const orderedDomains = [...report.domains].sort((a, b) => {
    const order = (value: string) => value === "direct" ? 0 : value === "functional" ? 1 : value === "adjacent" ? 2 : 3;
    return order(a.matchType) - order(b.matchType) || a.domainName.localeCompare(b.domainName);
  });
  return (
    <View style={[styles.programmeCard, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
      <View style={styles.programmeHeader}>
        <View style={styles.baselineCopy}>
          <Text style={[styles.programmeTitle, CompassFonts.bodyBold, { color: colors.text }]}>{report.programmeName}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>Institution teaching record versus sourced downstream evidence</Text>
        </View>
      </View>
      <CurriculumBaseline report={report} />
      {PRIORITY.map((group, index) => {
        const domains = orderedDomains.filter((domain) => domain.matchType === group.matchType);
        if (!domains.length) return null;
        return (
          <View key={group.matchType} style={styles.priorityGroup}>
            <Text style={[styles.priorityTitle, CompassFonts.bodyBold, { color: colors.text }]}>{group.title}</Text>
            <Text style={[styles.explanation, { color: colors.textMuted }]}>{group.description}</Text>
            {domains.map((domain) => <DomainCoverageCard key={`${report.programmeId}-${domain.domainId}`} domain={domain} priority={index + 1} />)}
          </View>
        );
      })}
      {!orderedDomains.length ? <Text style={[styles.meta, { color: colors.textMuted }]}>No mapped domain is recorded for this programme.</Text> : null}
    </View>
  );
}

export function SkillsGapScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [audience, setAudience] = useState<AdminWorkspaceAudience>("secondary_school");
  const [coverage, setCoverage] = useState<DataState<ProgrammeSkillCoverage[]>>({ status: "pending", data: null });
  const copy = audienceCopy(audience);

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) setAudience(adminWorkspaceAudienceForProfile(profile));
    });
    adminData.getProgrammeSkillCoverage().then((result) => {
      if (active) setCoverage(result);
    });
    return () => { active = false; };
  }, [user?.id]);

  return (
    <AdminShell title={copy.title} eyebrow={copy.eyebrow}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[styles.scroll, webContainer as object]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>{copy.title}</Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>{copy.body}</Text>
          <View style={[styles.marketNotice, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
            <Text style={[styles.marketNoticeTitle, CompassFonts.bodyBold, { color: colors.text }]}>How to read this view</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>The institution's recorded programme teaching is the baseline. Sourced domain, subgroup and role records are the downstream comparison layer. A candidate gap means the downstream layer contains an item that the teaching record does not currently evidence; it is not an accreditation requirement, an employment-demand signal or a recommendation.</Text>
          </View>
          <ComingSoonPanel state={coverage} empty={(rows) => rows.length === 0} emptyTitle="No programme intelligence yet" emptyBody="Programme intelligence appears when the programme curriculum and mapped market/practice evidence are available.">
            {(rows) => <View style={styles.programmeList}>{rows.map((report) => <ProgrammeCoverageCard key={report.programmeId} report={report} />)}</View>}
          </ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default SkillsGapScreen;

const styles = StyleSheet.create({
  scroll: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, gap: Spacing.xl, flexGrow: 1 },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  programmeList: { gap: Spacing.lg },
  programmeCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.lg },
  programmeHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  programmeTitle: { fontSize: FontSize.md },
  baseline: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  baselineHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  baselineCopy: { flex: 1, gap: 4 },
  cardTitle: { fontSize: FontSize.md },
  curriculumColumns: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.lg },
  curriculumColumn: { minWidth: 190, flex: 1, gap: 3 },
  curriculumList: { gap: Spacing.xs },
  curriculumItem: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  priorityGroup: { gap: Spacing.sm },
  priorityTitle: { fontSize: FontSize.md },
  domainCard: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md, gap: Spacing.sm },
  domainHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  domainHeading: { flex: 1, gap: 4 },
  domainTitle: { fontSize: FontSize.sm },
  domainBadgeStack: { alignItems: "flex-end", gap: Spacing.xs },
  expand: { fontSize: FontSize.xs, fontWeight: "700" },
  countRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  resourceList: { gap: Spacing.md },
  resourceGroup: { gap: Spacing.xs },
  resourceGroupStack: { gap: Spacing.sm },
  resourceRow: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.sm, flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  resourceCopy: { flex: 1, gap: 3 },
  resourceTitleRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flexWrap: "wrap" },
  resourceName: { fontSize: FontSize.sm },
  groupLabel: { fontSize: FontSize.xs, letterSpacing: 0.4, textTransform: "uppercase" },
  explanation: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  openLink: { fontSize: FontSize.xs, fontWeight: "700", textDecorationLine: "underline" },
  lede: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  marketNotice: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  marketNoticeTitle: { fontSize: FontSize.sm },
});
