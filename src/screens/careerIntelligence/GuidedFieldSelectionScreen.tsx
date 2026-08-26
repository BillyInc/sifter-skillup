import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { DetailScaffold, RouteLine } from "@/components/careerIntelligence";
import { careerData, type GuidanceDomainSelection, type GuidanceReportPath } from "@/lib/careerData";
import { openStudentDocument, provisioningData } from "@/lib/provisioningData";
import { useExploreNav } from "@/lib/exploreNav";
import { comingSoon, pending, real, type DataState, type DomainMatchType, type DomainV2, type GuidanceEvidence, type GuidanceEvidenceState } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, type ColorPalette } from "@/theme";

type Step = "domains" | "subgroups" | "roles" | "review";
type Snapshot = Record<string, unknown>;

function item(id: string, name: string, extra: Snapshot = {}): Snapshot {
  return { id, name, ...extra };
}

function domainItem(id: string, name: string, extra: Partial<GuidanceDomainSelection> = {}): GuidanceDomainSelection {
  return { id, name, ...extra };
}

function relationLabel(matchType?: DomainMatchType): string {
  if (matchType === "functional") return "Functional connection";
  if (matchType === "adjacent") return "Possible pivot";
  if (matchType === "direct") return "Direct connection";
  return "Domain route";
}

function evidenceLabel(state: GuidanceEvidenceState): string {
  if (state === "source_backed") return "Source-backed";
  if (state === "context_only") return "Context available";
  if (state === "limited") return "Limited";
  if (state === "pending") return "Pending";
  return "Not attached";
}

function EvidenceSummary({ colors, evidence }: { colors: ColorPalette; evidence?: GuidanceEvidence }) {
  if (!evidence) return null;
  return <View accessibilityLabel="Evidence scope" style={styles.evidenceSummary}>
    <Text style={[styles.evidenceTitle, { color: colors.textRole.muted }]}>Evidence scope</Text>
    <View style={styles.evidenceItems}>
      {[{ label: "Nigeria", lens: evidence.nigeria }, { label: "Remote", lens: evidence.remote }, { label: "Global", lens: evidence.global }].map(({ label, lens }) => <View key={label} style={[styles.evidenceItem, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <Text style={[styles.evidenceLabel, { color: colors.textRole.primary }]}>{label}</Text>
        <Text style={[styles.evidenceState, { color: colors.textRole.muted }]}>{evidenceLabel(lens.state)}</Text>
      </View>)}
    </View>
  </View>;
}

export default function GuidedFieldSelectionScreen() {
  const params = useLocalSearchParams<{
    programme_id?: string;
    jamb_programme_id?: string;
    school_id?: string;
    user_type?: string;
    guidance_student_id?: string;
  }>();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const targetStudentId = params.guidance_student_id ? String(params.guidance_student_id) : undefined;
  const programmeId = params.jamb_programme_id ? String(params.jamb_programme_id) : params.programme_id ? String(params.programme_id) : undefined;
  const [state, setState] = useState<DataState<DomainV2[]>>(() => pending("Loading the domains connected to this programme..."));
  const [path, setPath] = useState<GuidanceReportPath["path"]>({});
  const [step, setStep] = useState<Step>("domains");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const saveSequence = useRef(0);
  const pathRef = useRef<GuidanceReportPath["path"]>({});
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    void (async () => {
       let savedPath: GuidanceReportPath["path"] = {};
       if (targetStudentId) {
         const saved = await provisioningData.getGuidancePath(targetStudentId);
         savedPath = (saved?.path ?? {}) as GuidanceReportPath["path"];
       } else {
         const saved = await careerData.getGuidancePath();
         savedPath = saved.status === "real" && saved.data ? saved.data.path : {};
       }
      if (active) {
        pathRef.current = savedPath;
        setPath(savedPath);
        const savedStage = String((savedPath.resume as Snapshot | undefined)?.stage ?? "");
        if (["domains", "subgroups", "roles", "review"].includes(savedStage)) setStep(savedStage as Step);
      }

      let domains: DomainV2[] = [];
      const loadLinkedDomains = async (links: { domainId: string; matchType?: DomainMatchType }[]) => {
        const matchById = new Map(links.map((link) => [link.domainId, link.matchType]));
        const loaded = await Promise.all(links.map((link) => careerData.getDomainV2(link.domainId)));
        return loaded
          .filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data))
          .map((entry) => ({ ...entry.data, programmeMatchType: matchById.get(entry.data.id) }));
      };
      if (programmeId) {
        if (params.jamb_programme_id) {
          const linked = await careerData.getJambProgrammeDomains(programmeId);
          if (linked.status !== "real") {
            if (active) setState({ status: linked.status, data: null, meta: linked.meta });
            return;
          }
          const links = linked.status === "real" && linked.data ? linked.data.domains : [];
          domains = await loadLinkedDomains(links);
        } else {
          const programme = await careerData.getProgramme(programmeId);
          if (programme.status !== "real") {
            if (active) setState({ status: programme.status, data: null, meta: programme.meta });
            return;
          }
          const links = programme.status === "real" && programme.data ? programme.data.domains ?? [] : [];
          domains = await loadLinkedDomains(links);
        }
      }
      if (!domains.length) {
        const clusters = await careerData.getDomainClusters();
        if (clusters.status !== "real") {
          if (active) setState({ status: clusters.status, data: null, meta: clusters.meta });
          return;
        }
        const links = clusters.status === "real" && clusters.data ? clusters.data.flatMap((group) => group.domains) : [];
        const loaded = await Promise.all(links.map((link) => careerData.getDomainV2(link.id)));
        domains = loaded.filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data)).map((entry) => entry.data);
      }
      if (active) {
        setState(domains.length ? real(domains) : comingSoon("No mapped domains are available for this programme yet."));
      }
    })();
    return () => { active = false; };
  }, [params.jamb_programme_id, programmeId, targetStudentId]);

  const domains = state.data ?? [];
  const selectedDomainIds = useMemo(() => new Set((path.domains ?? []).map((entry) => String(entry.id ?? ""))), [path.domains]);
  const selectedSubgroupIds = useMemo(() => new Set((path.subgroups ?? []).map((entry) => String(entry.id ?? ""))), [path.subgroups]);
  const selectedRoleIds = useMemo(() => new Set((path.roles ?? []).map((entry) => String(entry.id ?? ""))), [path.roles]);
  const primaryDomainId = String(path.domains?.find((entry) => entry.intent === "primary")?.id ?? path.domains?.[0]?.id ?? "");
  const selectedDomains = domains.filter((domain) => selectedDomainIds.has(domain.id));
  const selectedSubgroups = selectedDomains.flatMap((domain) => domain.subgroups.filter((subgroup) => selectedSubgroupIds.has(subgroup.id)).map((subgroup) => ({ domain, subgroup })));

  const persist = async (nextPath: GuidanceReportPath["path"]) => {
    const sequence = ++saveSequence.current;
    pathRef.current = nextPath;
    setPath(nextPath);
    setSaving(true);
    setNotice(null);
    // Serialize draft writes so an older network response cannot overwrite a
    // newer multi-selection made immediately afterwards.
    saveQueue.current = saveQueue.current.catch(() => undefined).then(async () => {
      try {
      if (targetStudentId) {
        await provisioningData.saveGuidancePath(targetStudentId, nextPath as Record<string, unknown>);
        if (sequence === saveSequence.current) setNotice("Saved to this student’s guidance path.");
      } else {
        const saved = await careerData.saveGuidancePath({ source: "explore", path: nextPath });
        if (sequence !== saveSequence.current) return;
        setNotice(saved.status === "real" ? "Saved to My World." : saved.meta?.notice ?? "Your choices are held here until you sign in.");
      }
    } catch {
      if (sequence === saveSequence.current) setNotice(targetStudentId ? "Could not save this student’s guidance yet." : "Your choices are held here until saving is available.");
    } finally {
      if (sequence === saveSequence.current) setSaving(false);
      }
    });
  };

  const updateStep = (next: Step) => {
    setStep(next);
    const currentPath = pathRef.current;
    void persist({ ...currentPath, resume: { ...(currentPath.resume ?? {}), stage: next, status: "in_progress" } });
  };

  const toggleDomain = (domain: DomainV2) => {
    const currentPath = pathRef.current;
    const selected = (currentPath.domains ?? []).some((entry) => String(entry.id ?? "") === domain.id);
    const nextDomains = selected
      ? (currentPath.domains ?? []).filter((entry) => String(entry.id ?? "") !== domain.id)
      : [...(currentPath.domains ?? []), domainItem(domain.id, domain.name, {
        matchType: domain.programmeMatchType,
        intent: (currentPath.domains ?? []).length ? "secondary" : "primary",
        sequence: (currentPath.domains ?? []).length + 1,
      })];
    const normalizedDomains = nextDomains.map((entry, index) => ({
      ...entry,
      intent: entry.intent ?? (index === 0 ? "primary" as const : "secondary" as const),
      sequence: index + 1,
    }));
    if (selected && !normalizedDomains.some((entry) => entry.intent === "primary")) {
      normalizedDomains[0] = { ...normalizedDomains[0], intent: "primary" };
    }
    const removedSubgroups = selected ? (currentPath.subgroups ?? []).filter((entry) => String(entry.domainId ?? "") !== domain.id) : currentPath.subgroups ?? [];
    const removedRoles = selected ? (currentPath.roles ?? []).filter((entry) => String(entry.domainId ?? "") !== domain.id) : currentPath.roles ?? [];
    void persist({ ...currentPath, domains: normalizedDomains, subgroups: removedSubgroups, roles: removedRoles, resume: { ...(currentPath.resume ?? {}), stage: "domains", status: "in_progress" } });
  };

  const setPrimaryDomain = (domain: DomainV2) => {
    const currentPath = pathRef.current;
    const current = currentPath.domains ?? [];
    const selected = current.some((entry) => String(entry.id ?? "") === domain.id);
    const withDomain = selected ? current : [...current, domainItem(domain.id, domain.name, { matchType: domain.programmeMatchType })];
    const ordered = [withDomain.find((entry) => String(entry.id ?? "") === domain.id)!, ...withDomain.filter((entry) => String(entry.id ?? "") !== domain.id)];
    const nextDomains = ordered.map((entry, index) => ({
      ...entry,
      intent: String(entry.id ?? "") === domain.id ? "primary" as const : "secondary" as const,
      sequence: String(entry.id ?? "") === domain.id ? 1 : index + 2,
    }));
    void persist({ ...currentPath, domains: nextDomains, resume: { ...(currentPath.resume ?? {}), stage: "domains", status: "in_progress" } });
  };

  const toggleSubgroup = (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => {
    const currentPath = pathRef.current;
    const selected = (currentPath.subgroups ?? []).some((entry) => String(entry.id ?? "") === subgroup.id);
    const nextSubgroups = selected
      ? (currentPath.subgroups ?? []).filter((entry) => String(entry.id ?? "") !== subgroup.id)
      : [...(currentPath.subgroups ?? []), item(subgroup.id, subgroup.name, { domainId: domain.id, domainName: domain.name })];
    const nextRoles = selected ? (currentPath.roles ?? []).filter((entry) => String(entry.subgroupId ?? "") !== subgroup.id) : currentPath.roles ?? [];
    const nextDomains = (currentPath.domains ?? []).some((entry) => String(entry.id ?? "") === domain.id) ? currentPath.domains ?? [] : [...(currentPath.domains ?? []), domainItem(domain.id, domain.name, { matchType: domain.programmeMatchType, intent: (currentPath.domains ?? []).length ? "secondary" : "primary", sequence: (currentPath.domains ?? []).length + 1 })];
    void persist({ ...currentPath, domains: nextDomains, subgroups: nextSubgroups, roles: nextRoles, resume: { ...(currentPath.resume ?? {}), stage: "subgroups", status: "in_progress" } });
  };

  const toggleRole = (domain: DomainV2, subgroup: DomainV2["subgroups"][number], role: DomainV2["roles"][number]) => {
    const currentPath = pathRef.current;
    const selected = (currentPath.roles ?? []).some((entry) => String(entry.id ?? "") === role.key);
    const nextRoles = selected
      ? (currentPath.roles ?? []).filter((entry) => String(entry.id ?? "") !== role.key)
      : [...(currentPath.roles ?? []), item(role.key, role.name, { domainId: domain.id, domainName: domain.name, subgroupId: subgroup.id, subgroupName: subgroup.name })];
    void persist({ ...currentPath, roles: nextRoles, resume: { ...(currentPath.resume ?? {}), stage: "roles", status: "in_progress" } });
  };

  const openReport = () => {
    const path = targetStudentId
      ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html`
      : "/api/student/report.html";
    void openStudentDocument(path).then((opened) => {
      if (!opened) setNotice(targetStudentId ? "This student needs a confirmed guidance path before the report can be opened." : "Sign in and confirm your guidance path before opening the report.");
    });
  };

  return (
    <DetailScaffold
      eyebrow="GUIDANCE"
      title="Build your guidance route"
      backLabel="Back to programme"
      pdf={step === "review"}
      pdfPath={step === "review" ? (targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html") : undefined}
      state={state}
      disclaimer={false}
    >
      {() => (
        <View style={styles.body}>
           <Text style={[styles.lead, { color: colors.textRole.secondary }]}>Start with the domains connected to your programme. Choose one primary route; add a secondary domain only when you want to compare or plan a pivot. Your choices save as a draft automatically and you can resume this route later.</Text>
          <RouteLine variant="spine" stations={[{ state: step === "domains" ? "you" : "bridge", label: "Domains" }, { state: step === "subgroups" ? "you" : step === "domains" ? "target" : "bridge", label: "Subgroups" }, { state: step === "roles" ? "you" : step === "review" ? "bridge" : "target", label: "Roles" }, { state: step === "review" ? "you" : "target", label: "Review" }]} edges={["solid", "dashed", "dashed"]} style={styles.route} />
           <View style={styles.steps}>{(["domains", "subgroups", "roles", "review"] as Step[]).map((name, index) => <TouchableOpacity key={name} accessibilityRole="button" accessibilityState={{ selected: step === name }} onPress={() => index === 0 || (index === 1 && selectedDomainIds.size > 0) || (index === 2 && selectedDomainIds.size > 0) || (index === 3 && selectedDomainIds.size > 0) ? updateStep(name) : undefined} style={[styles.step, { borderColor: step === name ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: step === name ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.stepNumber, { color: colors.accentRole.action }]}>{index + 1}</Text><Text style={[styles.stepText, { color: colors.textRole.primary }]}>{name === "domains" ? "Domains" : name === "subgroups" ? "Subgroups" : name === "roles" ? "Roles" : "Review"}</Text></TouchableOpacity>)}</View>
           {step === "domains" ? <DomainStepRefined colors={colors} domains={domains} selected={selectedDomainIds} primaryId={primaryDomainId} onToggle={toggleDomain} onSetPrimary={setPrimaryDomain} onView={(domain) => exploreNav.domain(router, domain.id, targetStudentId, true)} onNext={() => updateStep("subgroups")} /> : null}
          {step === "subgroups" ? <SubgroupStepRefined colors={colors} domains={selectedDomains} primaryId={primaryDomainId} selected={selectedSubgroupIds} onToggle={toggleSubgroup} onView={(domain, subgroup) => exploreNav.subgroup(router, domain.id, subgroup.id, targetStudentId, true)} onNext={() => updateStep("roles")} onBack={() => updateStep("domains")} /> : null}
            {step === "roles" ? <RoleStepRefined colors={colors} entries={selectedSubgroups} selected={selectedRoleIds} onToggle={toggleRole} onView={(role) => exploreNav.role(router, role.key, targetStudentId, true)} onNext={() => updateStep("review")} onBack={() => updateStep("subgroups")} /> : null}
          {step === "review" ? <ReviewStep colors={colors} domains={selectedDomains} primaryId={primaryDomainId} subgroups={selectedSubgroups} roles={path.roles ?? []} saving={saving} notice={notice} onBack={() => updateStep("roles")} onReport={openReport} /> : null}
          {step !== "review" && notice ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>{notice}</Text> : null}
          {saving ? <ActivityIndicator size="small" color={colors.accentRole.action} /> : null}
        </View>
      )}
    </DetailScaffold>
  );
}

/* Legacy step implementations retained in history; the rendered route uses
 * the refined versions below. */
/*
function DomainStep({ colors, domains, selected, onToggle, onNext }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; onToggle: (domain: DomainV2) => void; onNext: () => void }) {
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>First, understand the domains</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Each domain is a broad area of work. Open a domain’s details before deciding whether it belongs in your route.</Text><View style={styles.cards}>{domains.map((domain) => <TouchableOpacity key={domain.id} onPress={() => onToggle(domain)} style={[styles.card, { borderColor: selected.has(domain.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(domain.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{domain.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{domain.description || "See what people do in this domain, the skills it uses, and the subgroups inside it."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(domain.id) ? "Selected · View domain" : "View domain and select"}</Text></View><Feather name={selected.has(domain.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>)}</View><ActionRow colors={colors} onBack={() => undefined} onNext={onNext} nextLabel="Review subgroups" disabled={!selected.size} /></View>;
}

  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Now review the subgroups</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>A domain can contain several subgroups. Choose one or more that you want to understand better.</Text>{domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name}</Text>{domain.subgroups.length ? domain.subgroups.map((subgroup) => <TouchableOpacity key={subgroup.id} onPress={() => onToggle(domain, subgroup)} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{subgroup.description || "View the skills, resources and roles connected to this subgroup."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Selected · View details" : "View details and select"}</Text></View><Feather name={selected.has(subgroup.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No subgroups are available for this domain yet.</Text>}</View>)}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" disabled={!selected.size} /></View>;
}

  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles within your selected subgroups</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are grouped under their subgroup. Choose one or more roles for your report.</Text>{entries.map(({ domain, subgroup }) => { const roles = domain.roles.filter((role) => role.subgroupId === subgroup.id); return <View key={subgroup.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup.name}</Text>{roles.length ? roles.map((role) => <TouchableOpacity key={role.key} onPress={() => onToggle(domain, subgroup, role)} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>View what this role involves and the skills connected to it.</Text></View><Feather name={selected.has(role.key) ? "check" : "plus"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this subgroup are not available yet.</Text>}</View>; })}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Review my selections" disabled={!selected.size} /></View>;
}

*/
function DomainStepRefined({ colors, domains, selected, primaryId, onToggle, onSetPrimary, onView, onNext }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; primaryId: string; onToggle: (domain: DomainV2) => void; onSetPrimary: (domain: DomainV2) => void; onView: (domain: DomainV2) => void; onNext: () => void }) {
  const groups: { label: string; items: DomainV2[] }[] = [
    { label: "Direct connections", items: domains.filter((domain) => domain.programmeMatchType === "direct") },
    { label: "Functional connections", items: domains.filter((domain) => domain.programmeMatchType === "functional") },
    { label: "Possible pivots", items: domains.filter((domain) => domain.programmeMatchType === "adjacent") },
    { label: "Other available domains", items: domains.filter((domain) => !domain.programmeMatchType) },
  ].filter((group) => group.items.length);
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>First, understand the domains</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Open a domain to understand what it covers. Choose one primary route for active guidance, then add secondary domains if you want to compare or plan a future pivot.</Text>
    {primaryId && selected.has(primaryId) && domains.find((domain) => domain.id === primaryId)?.programmeMatchType === "direct" ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>You already have partial preparation from your programme and primary domain. These are the additional skills you need.</Text> : null}
    {groups.map((group) => <View key={group.label} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{group.label}</Text>{group.items.map((domain) => <View key={domain.id} style={[styles.card, { borderColor: selected.has(domain.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(domain.id) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><View style={styles.cardHeading}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{domain.name}</Text><Text style={[styles.relation, { color: colors.textRole.muted }]}>{relationLabel(domain.programmeMatchType)}</Text></View><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{domain.programmeMatchType === "adjacent" || domain.programmeMatchType === "functional" ? "This is a possible pivot. Your current foundation helps, but you need this bridge before specializing." : domain.description || "See what people do in this domain, the skills it uses, and the subgroups inside it."}</Text><EvidenceSummary colors={colors} evidence={domain.guidanceEvidence} /><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View domain</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(domain.id) ? "Remove" : "Add secondary"}</Text></TouchableOpacity>{selected.has(domain.id) && primaryId !== domain.id ? <TouchableOpacity onPress={() => onSetPrimary(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>Make primary</Text></TouchableOpacity> : null}{primaryId === domain.id ? <Text style={[styles.primaryLabel, { color: colors.accentRole.action }]}>Primary route</Text> : null}</View></View><Feather name={selected.has(domain.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>)}</View>)}
    <ActionRow colors={colors} onBack={() => undefined} onNext={onNext} nextLabel="Review subgroups" disabled={!selected.size} />
  </View>;
}

function SubgroupStepRefined({ colors, domains, primaryId, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; domains: DomainV2[]; primaryId: string; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onView: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Now narrow into subgroups</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Your domain foundation stays portable. These are the additional capabilities to build as you narrow into a subgroup.</Text>
    {domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name} <Text style={[styles.relation, { color: colors.textRole.muted }]}>{domain.id === primaryId ? "· Primary route" : "· Secondary route"}</Text></Text>{domain.id !== primaryId && (domain.programmeMatchType === "functional" || domain.programmeMatchType === "adjacent") ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>This is a possible pivot. Your current foundation helps, but you need this bridge before specializing.</Text> : null}{domain.subgroups.length ? domain.subgroups.map((subgroup) => <View key={subgroup.id} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{subgroup.description || "View the skills, tools, resources and roles connected to this subgroup."}</Text><EvidenceSummary colors={colors} evidence={subgroup.guidanceEvidence} /><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View subgroup</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Remove" : "Select subgroup"}</Text></TouchableOpacity></View></View><Feather name={selected.has(subgroup.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No subgroups are available for this domain yet.</Text>}</View>)}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" />
  </View>;
}

function RoleStepRefined({ colors, entries, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; entries: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number], role: DomainV2["roles"][number]) => void; onView: (role: DomainV2["roles"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles inside your subgroups</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Choose a role to see the skills, tools, credentials and proof that matter for that route. Select one or more roles for your report.</Text>
    {!entries.length ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>No subgroup is selected yet. You can review the portable domain foundation now and return to add a specialization later.</Text> : null}
    {entries.map(({ domain, subgroup }) => { const roles = domain.roles.filter((role) => role.subgroupId === subgroup.id); return <View key={subgroup.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup.name}</Text>{roles.length ? roles.map((role) => <View key={role.key} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>See what this role involves and the skills connected to it.</Text><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View more</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup, role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(role.key) ? "Remove" : "Select role"}</Text></TouchableOpacity></View></View><Feather name={selected.has(role.key) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}</View>; })}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel={selected.size ? "Review my selections" : "Review domain route"} />
  </View>;
}

function ReviewStep({ colors, domains, primaryId, subgroups, roles, saving, notice, onBack, onReport }: { colors: ColorPalette; domains: DomainV2[]; primaryId: string; subgroups: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; roles: Snapshot[]; saving: boolean; notice: string | null; onBack: () => void; onReport: () => void }) {
  const primary = domains.find((domain) => domain.id === primaryId);
  const secondary = domains.filter((domain) => domain.id !== primaryId);
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Review your guidance route</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{roles.length ? "Your primary route receives active guidance. Secondary domains remain available for comparison and future pivots without repeating shared foundations." : "Your domain route is ready to review. You can add subgroups and roles now or return to this route later."}</Text><PrioritySummary colors={colors} /><SummaryList colors={colors} title="Primary domain" values={primary ? [primary.name] : []} /><SummaryList colors={colors} title="Secondary domains" values={secondary.map((domain) => `${domain.name} · ${relationLabel(domain.programmeMatchType)}`)} /><SummaryList colors={colors} title="Subgroups" values={subgroups.map(({ subgroup }) => subgroup.name)} /><SummaryList colors={colors} title="Roles" values={roles.map((role) => String(role.name ?? "Role"))} /><Text style={[styles.copy, { color: colors.textRole.muted }]}>{saving ? "Saving your draft…" : notice || "Your draft is saved automatically. Open the report when you are ready to print or share it."}</Text><ActionRow colors={colors} onBack={onBack} onNext={onReport} nextLabel="Open report" disabled={saving || !domains.length} /></View>;
}

function PrioritySummary({ colors }: { colors: ColorPalette }) {
  return <View style={[styles.summary, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
    <Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>What comes first</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>1. Learn the portable domain foundation that supports more than one role.</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>2. Build the additional capabilities introduced by your selected subgroup.</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>3. Add role-specific proof, tools and credentials; optional or advanced items can wait.</Text>
  </View>;
}

function SummaryList({ colors, title, values }: { colors: ColorPalette; title: string; values: string[] }) {
  return <View style={[styles.summary, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{title} ({values.length})</Text>{values.length ? values.map((value) => <Text key={value} style={[styles.copy, { color: colors.textRole.secondary }]}>• {value}</Text>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>None selected</Text>}</View>;
}

function ActionRow({ colors, onBack, onNext, nextLabel, disabled }: { colors: ColorPalette; onBack: () => void; onNext: () => void; nextLabel: string; disabled?: boolean }) {
  return <View style={styles.actions}><TouchableOpacity onPress={onBack} style={[styles.secondary, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.actionText, { color: colors.textRole.primary }]}>Back</Text></TouchableOpacity><TouchableOpacity onPress={onNext} disabled={disabled} style={[styles.primary, { backgroundColor: disabled ? colors.borderRole.subtle : colors.accentRole.action }]}><Text style={styles.primaryText}>{nextLabel}</Text></TouchableOpacity></View>;
}

const styles = StyleSheet.create({
  body: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  lead: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  route: { marginVertical: Spacing.xs },
  steps: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  step: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  stepNumber: { fontSize: FontSize.xs, fontWeight: "800" },
  stepText: { fontSize: FontSize.xs, fontWeight: "700" },
  section: { gap: Spacing.md },
  heading: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.25, ...CompassFonts.displayBold },
  copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  cards: { gap: Spacing.sm },
  card: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md },
  cardText: { flex: 1, gap: 4 },
  cardHeading: { gap: Spacing.xs },
  cardActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginTop: Spacing.xs },
  cardTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.25 },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  link: { fontSize: FontSize.xs, fontWeight: "700" },
  relation: { fontSize: FontSize.xs, fontWeight: "600" },
  primaryLabel: { fontSize: FontSize.xs, fontWeight: "800" },
  group: { gap: Spacing.sm },
  groupTitle: { fontSize: FontSize.md, fontWeight: "800" },
  evidenceSummary: { gap: 4, marginTop: Spacing.xs },
  evidenceTitle: { fontSize: FontSize.xs, fontWeight: "700" },
  evidenceItems: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  evidenceItem: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.xs, paddingVertical: 3, gap: 1 },
  evidenceLabel: { fontSize: FontSize.xs, fontWeight: "700" },
  evidenceState: { fontSize: 10, lineHeight: 12 },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm, marginTop: Spacing.sm },
  secondary: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  primary: { borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  actionText: { fontSize: FontSize.sm, fontWeight: "700" },
  primaryText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "800" },
  summary: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  notice: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});
