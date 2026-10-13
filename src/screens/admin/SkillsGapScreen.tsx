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
import { useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  JambProgrammeOption,
} from "@/types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { AdminGuidanceEvidencePanel } from "@/components/admin/AdminGuidanceEvidencePanel";
import { ExternalLinkGuard } from "@/components/careerIntelligence/ExternalLinkGuard";
import { normaliseAdminGuidanceEvidence, type AdminGuidanceEvidenceRecord } from "./adminGuidanceEvidence";
import { programmeCoverageCsv } from "@/lib/programmeIntelligenceExport";
import { hasItemSpecificExpectationEvidence, isConfirmedExpectationGap } from "./programmeEvidence";

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
      body: "Use source-backed curriculum and downstream comparisons to plan JAMB learner preparation. Start with the direct domain, then functional and adjacent connections. The current report API is institution-scoped and does not yet provide a national report for every JAMB programme.",
    };
  }
  return {
    eyebrow: "Student guidance intelligence",
    title: "Programme guidance",
    body: "Use this to explain what a programme teaches and what students may need to build next. Start with the direct domain; functional and adjacent connections are later options, not gaps in your school. The current report API does not yet provide the national JAMB programme catalogue here.",
  };
}

function relationshipLabel(matchType: MatchType): string {
  if (matchType === "direct") return "Direct connection";
  if (matchType === "functional") return "Functional connection";
  if (matchType === "adjacent") return "Adjacent connection";
  return "Mapped connection";
}

function isSourceReview(resource: ProgrammeResourceEvidence): boolean {
  return resource.curriculumState === "source_review" || resource.marketState === "source_review";
}

function evidenceRecordsForReport(report: ProgrammeSkillCoverage): AdminGuidanceEvidenceRecord[] {
  const records: AdminGuidanceEvidenceRecord[] = [];
  const programmeRows = [...(report.programmeEvidence ?? []), ...(report.programmeAbilities ?? [])];
  for (const [index, resource] of programmeRows.entries()) {
    const raw = resource as ProgrammeResourceEvidence & Record<string, unknown>;
    records.push(normaliseAdminGuidanceEvidence(raw, {
      id: `${report.programmeId}-programme-${resource.kind}-${resource.name}-${index}`,
      name: resource.name,
      level: "programme",
      itemType: resource.kind,
      programmeName: report.programmeName,
      contextName: report.programmeName,
      sourceUrl: resource.url ?? null,
      sourceAccessedAt: resource.sourceAccessedAt ?? resource.observedAt ?? null,
      evidenceNote: "Programme-owned evidence is visible to administrators for traceability and review.",
    }));
  }
  for (const domain of report.domains) {
    for (const [index, resource] of domain.resources.entries()) {
      const raw = resource as ProgrammeResourceEvidence & Record<string, unknown>;
      records.push(normaliseAdminGuidanceEvidence(raw, {
        id: `${report.programmeId}-${domain.domainId}-${resource.source}-${resource.name}-${index}`,
        name: resource.name,
        level: resource.source,
        itemType: resource.kind,
        programmeName: report.programmeName,
        contextName: resource.roleName ?? resource.scopeName ?? domain.domainName,
        sourceUrl: resource.url ?? null,
        sourceAccessedAt: resource.sourceAccessedAt ?? resource.observedAt ?? null,
        evidenceNote: isSourceReview(resource) ? "The API marked this row for source review." : "The API has not supplied an explicit approval state.",
      }));
    }
  }
  return records;
}

function resourceState(resource: ProgrammeResourceEvidence): { label: string; variant: "success" | "warning" } {
  if (isSourceReview(resource)) {
    return { label: "Source review", variant: "warning" };
  }
  if (resource.curriculumState === "taught" || resource.state === "covered") {
    return { label: "Present in curriculum baseline", variant: "success" };
  }
  if (resource.curriculumState === "partly_evidenced") {
    return { label: "Partly evidenced in teaching record", variant: "warning" };
  }
  if (resource.state === "bridge" && !isConfirmedExpectationGap(resource)) {
    return { label: "Not a confirmed learning gap", variant: "warning" };
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
        <Text style={[styles.meta, { color: colors.textSoft }]}>{resource.kind === "skill" ? "Skill" : resource.kind === "competency" ? "Competency" : resource.kind === "tool" ? "Tool" : resource.kind === "certification" ? "Certification" : resource.kind} · {scope}</Text>
        {resource.resourceType ? <Text style={[styles.meta, { color: colors.textMuted }]}>Use/category: {resource.resourceType}</Text> : null}
        {resource.kind === "relationship" ? <Text style={[styles.meta, { color: colors.textMuted }]}>Relationship: {[resource.relationshipType, resource.relationshipStatus, resource.fromItemType, resource.toItemType, resource.toName ?? resource.toItemKey].filter(Boolean).join(" · ") || "Details not supplied"}</Text> : <Text style={[styles.meta, { color: colors.textMuted }]}>Required/useful/optional status is not specified in the available evidence.</Text>}
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
        <ExternalLinkGuard
          audience="admin"
          url={resource.url}
          label="Open source"
          description="This opens the retained programme evidence source for staff review."
          textStyle={[styles.openLink, { color: colors.accent }]}
        />
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
  stateFilter,
}: {
  title: string;
  resources: ProgrammeResourceEvidence[];
  includeRole?: boolean;
  stateFilter?: "covered" | "bridge" | "source_review";
}) {
  const groups = new Map<string, ProgrammeResourceEvidence[]>();
  const filtered = resources.filter((resource) => {
    if (!stateFilter) return true;
    if (stateFilter === "source_review") return isSourceReview(resource);
    if (isSourceReview(resource)) return false;
    return resource.state === stateFilter;
  });
  for (const resource of filtered) {
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
  const covered = domain.resources.filter((resource) => !isSourceReview(resource) && resource.state === "covered");
  const gapCandidates = domain.resources.filter(isConfirmedExpectationGap);
  const sourceReview = domain.resources.filter(isSourceReview);
  const unconfirmed = domain.resources.filter((resource) => resource.state === "bridge" && !isSourceReview(resource) && !isConfirmedExpectationGap(resource));
  const expectationEvidence = domain.resources.filter(hasItemSpecificExpectationEvidence);
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
        <Text style={[styles.meta, { color: colors.textSoft }]}>Capabilities present in curriculum baseline: {covered.length}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Verified learning gaps: {gapCandidates.length}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>Skills {domain.resources.filter((r) => r.kind === "skill").length} · Competencies {domain.resources.filter((r) => r.kind === "competency").length} · Tools {domain.resources.filter((r) => r.kind === "tool").length} · Certifications {domain.resources.filter((r) => r.kind === "certification").length} · Source review {sourceReview.length}</Text>
      </View>

      {open ? (
        <View style={styles.resourceList}>
          {!expectationEvidence.length ? <View style={[styles.expectationNotice, { borderColor: colors.border, backgroundColor: colors.surface.raised }]}><Text style={[styles.groupLabel, CompassFonts.bodySemibold, { color: colors.text }]}>Market expectations: Coming soon</Text><Text style={[styles.meta, { color: colors.textMuted }]}>This connection has no verified, item-specific expectation source with a retained locator. We cannot say what the learner still needs to learn from taxonomy reach alone.</Text></View> : <Text style={[styles.explanation, { color: colors.textMuted }]}>The source-backed expectations below are compared with the recorded curriculum. Missing evidence is not labelled a gap; these comparisons do not mean a capability is required for every learner.</Text>}
          <ResourceGroupsByScope title="Capabilities present in curriculum baseline" resources={domainResources} stateFilter="covered" />
          <ResourceGroupsByScope title="Verified learning gaps for curriculum review" resources={domainResources.filter(isConfirmedExpectationGap)} />
          <ResourceGroupsByScope title="Unconfirmed comparisons (not counted as gaps)" resources={domainResources.filter((resource) => resource.state === "bridge" && !isSourceReview(resource) && !isConfirmedExpectationGap(resource))} />
          <ResourceGroupsByScope title="Source-review records (not counted as gaps)" resources={domainResources} stateFilter="source_review" />
          <ResourceGroupsByScope title="Subgroup capabilities present in curriculum baseline" resources={subgroupResources} stateFilter="covered" />
          <ResourceGroupsByScope title="Verified subgroup learning gaps" resources={subgroupResources.filter(isConfirmedExpectationGap)} />
          <ResourceGroupsByScope title="Unconfirmed subgroup comparisons (not gaps)" resources={subgroupResources.filter((resource) => resource.state === "bridge" && !isSourceReview(resource) && !isConfirmedExpectationGap(resource))} />
          <ResourceGroupsByScope title="Subgroup source-review records" resources={subgroupResources} stateFilter="source_review" />
          <ResourceGroupsByScope title="Role capabilities present in curriculum baseline" resources={roleResources} includeRole stateFilter="covered" />
          <ResourceGroupsByScope title="Verified role learning gaps" resources={roleResources.filter(isConfirmedExpectationGap)} includeRole />
          <ResourceGroupsByScope title="Unconfirmed role comparisons (not gaps)" resources={roleResources.filter((resource) => resource.state === "bridge" && !isSourceReview(resource) && !isConfirmedExpectationGap(resource))} includeRole />
          <ResourceGroupsByScope title="Role source-review records" resources={roleResources} includeRole stateFilter="source_review" />
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
  const curriculumEvidence = report.curriculumEvidence ?? [];
  const studentRows = curriculumEvidence.filter((row) => row.studentDisplay && row.dataState === "source_backed");
  const reviewRows = curriculumEvidence.length - studentRows.length;
  const visible = open ? items : items.slice(0, 8);
  const courseGroups = new Map<string, typeof studentRows>();
  for (const row of studentRows) {
    const key = [row.courseCode, row.courseTitle].filter(Boolean).join(" · ") || "Programme learning outcome";
    courseGroups.set(key, [...(courseGroups.get(key) ?? []), row]);
  }
  return (
    <View style={[styles.baseline, { backgroundColor: colors.surface.raised, borderColor: colors.border }]}>
      <View style={styles.baselineHeader}>
        <View style={styles.baselineCopy}>
          <Text style={[styles.cardTitle, CompassFonts.bodyBold, { color: colors.text }]}>{report.comparisonScope === "jamb_ccmas_baseline" ? "Mapped CCMAS curriculum baseline" : "Programme curriculum record"}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{report.comparisonScope === "jamb_ccmas_baseline" ? "This is curriculum evidence mapped to the JAMB identity, not verified teaching delivery at this specific university." : "Institution teaching record"} · {curriculumEvidence.length || items.length} curriculum row(s) · {studentRows.length} student-displayable · {reviewRows} held for review</Text>
        </View>
        <Badge label={report.curriculumContractState === "available" ? "Curriculum contract available" : "Curriculum unavailable"} variant={report.curriculumContractState === "available" ? "success" : "warning"} size="sm" />
      </View>
      <View style={styles.curriculumColumns}>
        <CurriculumColumn title="Technical / subject capabilities" items={report.curriculumTechnical} />
        <CurriculumColumn title="Transferable capabilities" items={report.curriculumTransferable} />
      </View>
      {courseGroups.size ? <View style={styles.curriculumList}>{[...courseGroups.entries()].map(([course, outcomes]) => <View key={course} style={[styles.courseGroup, { borderColor: colors.border }]}><Text style={[styles.courseTitle, CompassFonts.bodySemibold, { color: colors.text }]}>{course}</Text>{outcomes.map((row, index) => <Text key={`${row.outcomeId ?? row.outcomeIndex ?? index}`} style={[styles.curriculumItem, { color: colors.textSoft }]}>• {row.studentText || row.sourceText || "Outcome text not supplied"}</Text>)}</View>)}</View> : visible.length ? <View style={styles.curriculumList}>{visible.map((item, index) => <Text key={`${item}-${index}`} style={[styles.curriculumItem, { color: colors.text }]}>{item}</Text>)}</View> : <Text style={[styles.meta, { color: colors.textMuted }]}>No student-displayable curriculum outcomes are available for this programme yet.</Text>}
      {open && curriculumEvidence.length ? <View style={styles.curriculumEvidenceList}>
        <Text style={[styles.groupLabel, CompassFonts.bodySemibold, { color: colors.textMuted }]}>Admin source traceability</Text>
        {curriculumEvidence.slice(0, 80).map((row, index) => <Text key={`${row.outcomeId ?? row.courseCode ?? "row"}-${index}`} style={[styles.meta, { color: colors.textSoft }]}>{[row.courseCode, row.courseTitle, row.studentDisplay ? "student-displayable" : "review-only", row.dataState].filter(Boolean).join(" · ")}{row.sourceLocator ? ` · locator: ${typeof row.sourceLocator === "string" ? row.sourceLocator : JSON.stringify(row.sourceLocator)}` : ""}</Text>)}
        {curriculumEvidence.length > 80 ? <Text style={[styles.meta, { color: colors.textMuted }]}>Showing the first 80 curriculum rows; the API retains the full admin evidence set.</Text> : null}
      </View> : null}
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
          <Text style={[styles.meta, { color: colors.textMuted }]}>{report.jambProgrammeName ? `JAMB offering${report.jambFaculty ? ` · ${report.jambFaculty}` : ""}${report.offeringId ? ` · Offering ${report.offeringId}` : ""}` : report.comparisonScope === "jamb_ccmas_baseline" ? "JAMB programme with shared CCMAS curriculum evidence (not university-specific teaching)" : "This institution's programme teaching versus sourced downstream evidence"}</Text>
        </View>
      </View>
      {report.jambAnchorState === "unmapped" ? <Text style={[styles.meta, { color: colors.textMuted }]}>This JAMB programme has no CCMAS anchor. It remains selectable, but a CCMAS curriculum comparison cannot be calculated from the current mapping.</Text> : null}
      {report.jambAnchorState === "mapped" && report.curriculumContractState !== "available" ? <Text style={[styles.meta, { color: colors.textMuted }]}>A CCMAS programme anchor exists, but its clean curriculum contract is not available in this data source. No legacy curriculum has been substituted.</Text> : null}
      {report.comparisonScope === "jamb_ccmas_baseline" && report.jambAnchorState === "mapped" ? <Text style={[styles.meta, { color: colors.textMuted }]}>This is the mapped CCMAS curriculum baseline for this JAMB identity. It is not a claim that every university teaches the same additional content.</Text> : null}
      {report.comparisonScope === "jamb_ccmas_baseline" ? <Text style={[styles.meta, { color: colors.textMuted }]}>A separate external-curriculum comparison is not supplied by this report API yet. No conclusion about omitted curriculum components or external coverage is inferred here.</Text> : null}
      <CurriculumBaseline report={report} />
      <View style={[styles.expectationNotice, { borderColor: colors.border, backgroundColor: colors.surface.raised }]}>
        <Text style={[styles.groupLabel, CompassFonts.bodySemibold, { color: colors.text }]}>How to read this report</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Course outcomes above show what the mapped curriculum records. Direct, functional and adjacent sections below show connected field paths and capability evidence; they are not proof that this university teaches those items or that every item is required. Demand is separate in Market Intelligence.</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>Required/useful/optional status appears only when explicitly supplied by evidence. Missing expectation evidence is not counted as a learning gap; an evidence link is not automatically a learning resource.</Text>
      </View>
      <AdminGuidanceEvidencePanel records={evidenceRecordsForReport(report)} />
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
  const routeParams = useLocalSearchParams<{ jamb_programme_id?: string | string[] }>();
  const requestedJambProgrammeId = Array.isArray(routeParams.jamb_programme_id)
    ? routeParams.jamb_programme_id[0]
    : routeParams.jamb_programme_id;
  const [audience, setAudience] = useState<AdminWorkspaceAudience>("secondary_school");
  const [coverage, setCoverage] = useState<DataState<ProgrammeSkillCoverage[]>>({ status: "pending", data: null });
  const [jambOptions, setJambOptions] = useState<DataState<JambProgrammeOption[]>>({ status: "pending", data: null });
  const [jambQuery, setJambQuery] = useState("");
  const [selectedJambProgrammeId, setSelectedJambProgrammeId] = useState<string | null>(null);
  const [selectedReportKey, setSelectedReportKey] = useState<string | null>(null);
  const [universityJambChooserOpen, setUniversityJambChooserOpen] = useState(false);
  const copy = audienceCopy(audience);
  const reports = coverage.status === "real" ? coverage.data ?? [] : [];
  const reportKey = (report: ProgrammeSkillCoverage) => `${report.offeringId ?? ""}:${report.jambProgrammeId ?? ""}:${report.programmeId}`;
  const selectedReport = reports.find((report) => reportKey(report) === selectedReportKey) ?? null;
  const advisoryAudience = audience === "tutorial_centre" || audience === "secondary_school";
  const filteredJambOptions = (jambOptions.status === "real" ? jambOptions.data ?? [] : [])
    .filter((option) => `${option.name} ${option.faculty ?? ""}`.toLocaleLowerCase().includes(jambQuery.trim().toLocaleLowerCase()))
    .slice(0, 10);

  const downloadReport = () => {
    if (Platform.OS !== "web" || typeof document === "undefined" || !reports.length) return;
    const blob = new Blob([programmeCoverageCsv(reports)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "programme-intelligence-current-scope.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) setAudience(adminWorkspaceAudienceForProfile(profile));
    });
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    setSelectedJambProgrammeId(null);
    setSelectedReportKey(null);
    setJambQuery("");
    if (audience === "university") {
      if (requestedJambProgrammeId) {
        setSelectedJambProgrammeId(requestedJambProgrammeId);
        setUniversityJambChooserOpen(true);
        setCoverage({ status: "pending", data: null });
        adminData.getProgrammeSkillCoverage(requestedJambProgrammeId).then((result) => { if (active) setCoverage(result); });
      } else {
        setCoverage({ status: "pending", data: null });
        adminData.getProgrammeSkillCoverage().then((result) => { if (active) setCoverage(result); });
      }
    } else {
      setCoverage({ status: "pending", data: null });
      adminData.getJambProgrammeOptions().then((result) => { if (active) setJambOptions(result); });
    }
    return () => { active = false; };
  }, [audience, requestedJambProgrammeId]);

  const selectJambProgramme = (option: JambProgrammeOption) => {
    setSelectedJambProgrammeId(option.id);
    setJambQuery(option.name);
    setCoverage({ status: "pending", data: null });
    adminData.getProgrammeSkillCoverage(option.id).then(setCoverage);
  };

  return (
    <AdminShell title={copy.title} eyebrow={copy.eyebrow}>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[styles.scroll, webContainer as object]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>{copy.title}</Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>{copy.body}</Text>
          {audience === "university" ? <View style={styles.programmeChooser}>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Showing this university's own programme teaching records by default.</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => {
              const next = !universityJambChooserOpen;
              setUniversityJambChooserOpen(next);
              if (next && jambOptions.status === "pending") adminData.getJambProgrammeOptions().then(setJambOptions);
              if (!next) {
                setSelectedJambProgrammeId(null);
                setJambQuery("");
                setCoverage({ status: "pending", data: null });
                adminData.getProgrammeSkillCoverage().then(setCoverage);
              }
            }} style={[styles.exportButton, { borderColor: colors.border }]}>
              <Text style={[styles.meta, { color: colors.text }]}>{universityJambChooserOpen ? "Return to this university's programmes" : "Compare a JAMB programme from another university"}</Text>
            </TouchableOpacity>
          </View> : null}
          {advisoryAudience || universityJambChooserOpen ? <View style={styles.programmeChooser}>
            <Text style={[styles.meta, CompassFonts.bodyBold, { color: colors.text }]}>
              {audience === "university" ? "Choose a JAMB programme to compare" : "Choose any JAMB programme to advise your learners"}
            </Text>
            <TextInput
              accessibilityLabel="Search all JAMB programmes"
              placeholder="Search all JAMB programme names"
              placeholderTextColor={colors.textMuted}
              value={jambQuery}
              onChangeText={setJambQuery}
              style={[styles.programmeSearch, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface.subtle }]}
            />
            {jambOptions.status !== "real" ? <Text style={[styles.meta, { color: colors.textMuted }]}>{jambOptions.status === "pending" ? "Loading the national JAMB programme list…" : "The national JAMB programme list could not be loaded."}</Text> : null}
            {jambOptions.status === "real" && jambQuery.trim().length < 2 ? <Text style={[styles.meta, { color: colors.textMuted }]}>Type at least two characters to search all {jambOptions.data?.length ?? 0} JAMB programmes.</Text> : null}
            {filteredJambOptions.map((option) => <TouchableOpacity
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${option.name}${option.hasCcmasAnchor ? "" : ", no CCMAS anchor"}`}
              onPress={() => selectJambProgramme(option)}
              style={[styles.programmeOption, { borderColor: colors.border }]}
            >
              <Text style={[styles.meta, CompassFonts.bodyBold, { color: colors.text }]}>{option.name}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{option.faculty ? `${option.faculty} · ` : ""}{option.hasCcmasAnchor ? "CCMAS anchor recorded" : "No CCMAS anchor; still selectable"}</Text>
            </TouchableOpacity>)}
            {jambOptions.status === "real" && jambQuery.trim().length >= 2 && !filteredJambOptions.length ? <Text style={[styles.meta, { color: colors.textMuted }]}>No JAMB programme matches that search.</Text> : null}
          </View> : null}
          <View style={[styles.marketNotice, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
            <Text style={[styles.marketNoticeTitle, CompassFonts.bodyBold, { color: colors.text }]}>How to read this view</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>The institution's recorded programme teaching is the baseline. Sourced domain, subgroup and role records are the downstream comparison layer. A candidate gap means the downstream layer contains an item that the teaching record does not currently evidence; it is not an accreditation requirement, an employment-demand signal or a recommendation.</Text>
          </View>
          {Platform.OS === "web" && reports.length ? <View style={styles.exportActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => window.print()} style={[styles.exportButton, { borderColor: colors.border }]}><Text style={[styles.meta, { color: colors.text }]}>Print current report</Text></TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={downloadReport} style={[styles.exportButton, { borderColor: colors.border }]}><Text style={[styles.meta, { color: colors.text }]}>Download current report (CSV)</Text></TouchableOpacity>
            <Text style={[styles.meta, { color: colors.textMuted }]}>Exports only the programme records returned for this organisation; it does not imply the full 420-JAMB catalogue.</Text>
          </View> : null}
          {advisoryAudience && !selectedJambProgrammeId ? <Text style={[styles.meta, { color: colors.textMuted }]}>Search and choose a JAMB programme to open its available curriculum and downstream comparison.</Text> : null}
          {!advisoryAudience || selectedJambProgrammeId ? <ComingSoonPanel state={coverage} empty={(rows) => rows.length === 0} emptyTitle="No programme intelligence yet" emptyBody="Programme intelligence appears when the programme teaching record and sourced downstream evidence are available.">
            {(rows) => audience === "university" && !selectedJambProgrammeId ? <View style={styles.programmeList}>
              {selectedReport ? <>
                <TouchableOpacity accessibilityRole="button" onPress={() => setSelectedReportKey(null)} style={styles.actionLink}><Text style={[styles.openLink, { color: colors.accent }]}>← Back to offering reports</Text></TouchableOpacity>
                <ProgrammeCoverageCard report={selectedReport} />
              </> : <>
                <Text style={[styles.cardTitle, CompassFonts.bodyBold, { color: colors.text }]}>Your offering reports ({rows.length})</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>Open an offering to review its course outcomes, connected field paths and available evidence. A shared CCMAS curriculum is a baseline, not a claim about institution-specific delivery.</Text>
                {rows.map((report) => <TouchableOpacity key={reportKey(report)} accessibilityRole="button" onPress={() => setSelectedReportKey(reportKey(report))} style={[styles.indexRow, { borderColor: colors.border, backgroundColor: colors.surface.raised }]}>
                  <View style={styles.baselineCopy}>
                    <Text style={[styles.programmeTitle, CompassFonts.bodyBold, { color: colors.text }]}>{report.jambProgrammeName ?? report.programmeName}</Text>
                    <Text style={[styles.meta, { color: colors.textMuted }]}>{[report.jambFaculty, report.offeringId ? `Offering ${report.offeringId}` : null, report.jambAnchorState === "unmapped" ? "No CCMAS anchor" : "CCMAS curriculum baseline"].filter(Boolean).join(" · ")}</Text>
                    <Text style={[styles.meta, { color: colors.textSoft }]}>{report.domains.length} connected domains · {report.curriculumEvidence?.filter((row) => row.studentDisplay && row.dataState === "source_backed").length ?? 0} source-backed outcomes</Text>
                  </View>
                  <Text style={[styles.openLink, { color: colors.accent }]}>Open report →</Text>
                </TouchableOpacity>)}
              </>}
            </View> : <View style={styles.programmeList}>{rows.map((report) => <ProgrammeCoverageCard key={reportKey(report)} report={report} />)}</View>}
          </ComingSoonPanel> : null}
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
  exportActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, alignItems: "center" },
  programmeChooser: { gap: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderColor: "#D8DEE8", borderRadius: Radius.md },
  programmeSearch: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  programmeOption: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: 3 },
  exportButton: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  actionLink: { minHeight: 40, justifyContent: "center", alignSelf: "flex-start" },
  programmeList: { gap: Spacing.lg },
  indexRow: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.md },
  programmeCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.lg },
  programmeHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  programmeTitle: { fontSize: FontSize.md },
  baseline: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  courseGroup: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  courseTitle: { fontSize: FontSize.sm },
  expectationNotice: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md, gap: Spacing.xs },
  baselineHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  baselineCopy: { flex: 1, gap: 4 },
  cardTitle: { fontSize: FontSize.md },
  curriculumColumns: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.lg },
  curriculumColumn: { minWidth: 190, flex: 1, gap: 3 },
  curriculumList: { gap: Spacing.xs },
  curriculumEvidenceList: { gap: Spacing.xs },
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
