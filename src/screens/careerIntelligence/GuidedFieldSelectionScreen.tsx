import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { DetailScaffold, RouteLine } from "@/components/careerIntelligence";
import { hasGuidanceReportContextForRoute, isGuidanceReportReadyForRoute } from "@/components/careerIntelligence/GuidanceReportButton";
import { careerData, type GuidanceDomainSelection, type GuidanceReportPath } from "@/lib/careerData";
import { provisioningData } from "@/lib/provisioningData";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { careerRoleTierLabel, compareCareerRoles } from "@/lib/careerRoleOrdering";
import { studentSummary } from "@/lib/careerLabels";
import { comingSoon, pending, real, type DataState, type DomainMatchType, type DomainV2, type GuidanceEvidence, type GuidanceEvidenceState } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, type ColorPalette } from "@/theme";

type Step = "domains" | "subgroups" | "roles" | "review";
type Snapshot = Record<string, unknown>;
type RoleEntry = { domain: DomainV2; subgroup?: DomainV2["subgroups"][number]; directOnly?: boolean };

function item(id: string, name: string, extra: Snapshot = {}): Snapshot {
  return { id, name, ...extra };
}

function domainItem(id: string, name: string, extra: Partial<GuidanceDomainSelection> = {}): GuidanceDomainSelection {
  return { id, name, ...extra };
}

function relationLabel(matchType?: DomainMatchType): string {
  if (matchType === "functional") return "Related application";
  if (matchType === "adjacent") return "Nearby direction";
  if (matchType === "direct") return "Primary connection";
  return "Connected field";
}

function evidenceLabel(state: GuidanceEvidenceState): string {
  if (state === "source_backed") return "Based on a named source";
  if (state === "context_only") return "Context available";
  if (state === "limited") return "Limited information";
  if (state === "pending") return "Being reviewed";
  return "Not available";
}

function EvidenceSummary({ colors, evidence }: { colors: ColorPalette; evidence?: GuidanceEvidence }) {
  if (!evidence) return null;
  return <View accessibilityLabel="Guidance coverage" style={styles.evidenceSummary}>
    <Text style={[styles.evidenceTitle, { color: colors.textRole.muted }]}>Where this guidance applies</Text>
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
    journey_mode?: string;
    guidance_student_id?: string;
    focus?: string;
    guidance_target?: string;
  }>();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const targetStudentId = params.guidance_student_id ? String(params.guidance_student_id) : undefined;
  const programmeId = params.jamb_programme_id ? String(params.jamb_programme_id) : params.programme_id ? String(params.programme_id) : undefined;
  const guidanceContext: GuidanceRouteContext = {
    programmeId,
    jambProgrammeId: params.jamb_programme_id ? String(params.jamb_programme_id) : undefined,
    schoolId: params.school_id ? String(params.school_id) : undefined,
    userType: params.user_type ? String(params.user_type) : undefined,
    journeyMode: params.journey_mode ? String(params.journey_mode) : undefined,
    guidanceTarget: params.guidance_target ? String(params.guidance_target) : undefined,
    guidanceStudentId: targetStudentId,
    focused: params.focus === "guidance",
  };
  const sessionOnlyGuidance = Boolean(
    guidanceContext.guidanceTarget && guidanceContext.guidanceTarget !== "authorised_student",
  );
  const [state, setState] = useState<DataState<DomainV2[]>>(() => pending("Loading the domains connected to this programme..."));
  const [path, setPath] = useState<GuidanceReportPath["path"]>({});
  const [step, setStep] = useState<Step>("domains");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const saveSequence = useRef(0);
  const pathRef = useRef<GuidanceReportPath["path"]>({});
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    setState(pending("Loading the domains connected to this programme..."));
    void (async () => {
       let savedPath: GuidanceReportPath["path"] = {};
       if (targetStudentId) {
         const saved = await provisioningData.getGuidancePath(targetStudentId);
         savedPath = (saved?.path ?? {}) as GuidanceReportPath["path"];
       } else if (!sessionOnlyGuidance) {
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
        const loaded = await Promise.all(links.map((link) => careerData.getDomainV2ForStudent(link.domainId)));
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
          const programme = await careerData.getProgrammeForStudent(programmeId);
          if (programme.status !== "real") {
            if (active) setState({ status: programme.status, data: null, meta: programme.meta });
            return;
          }
          const links = programme.status === "real" && programme.data ? programme.data.domains ?? [] : [];
          domains = await loadLinkedDomains(links);
        }
        // A programme route must remain programme-scoped. Do not replace an
        // empty or partially unavailable mapping with the entire domain
        // catalogue: that would present unrelated domains as valid guidance.
        if (active) {
          setState(domains.length ? real(domains) : comingSoon("No mapped domains are available for this programme yet."));
        }
        return;
      }
      if (!domains.length) {
        const clusters = await careerData.getDomainClusters();
        if (clusters.status !== "real") {
          if (active) setState({ status: clusters.status, data: null, meta: clusters.meta });
          return;
        }
        const links = clusters.status === "real" && clusters.data ? clusters.data.flatMap((group) => group.domains) : [];
        const loaded = await Promise.all(links.map((link) => careerData.getDomainV2ForStudent(link.id)));
        domains = loaded.filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data)).map((entry) => entry.data);
      }
      if (active) {
        setState(domains.length ? real(domains) : comingSoon("No domains are available yet."));
      }
    })();
    return () => { active = false; };
  }, [params.jamb_programme_id, programmeId, targetStudentId, retryKey]);

  const domains = state.data ?? [];
  const selectedDomainIds = useMemo(() => new Set((path.domains ?? []).map((entry) => String(entry.id ?? ""))), [path.domains]);
  const selectedSubgroupIds = useMemo(() => new Set((path.subgroups ?? []).map((entry) => String(entry.id ?? ""))), [path.subgroups]);
  const selectedRoleIds = useMemo(() => new Set((path.roles ?? []).map((entry) => String(entry.id ?? ""))), [path.roles]);
  const primaryDomainId = String(path.domains?.find((entry) => entry.intent === "primary")?.id ?? path.domains?.[0]?.id ?? "");
  const selectedDomains = domains.filter((domain) => selectedDomainIds.has(domain.id));
  const selectedSubgroups = selectedDomains.flatMap((domain) => domain.subgroups.filter((subgroup) => selectedSubgroupIds.has(subgroup.id)).map((subgroup) => ({ domain, subgroup })));
  const directRoleDomains = selectedDomains.filter((domain) => domain.roles.some((role) => role.guidanceAvailable !== false && !role.subgroupId));
  const showSubgroupStep = selectedDomains.length === 0 || selectedDomains.some((domain) => domain.subgroups.length > 0);
  const displayedStep: Step = !showSubgroupStep && step === "subgroups" ? "roles" : step;
  const reportContextReady = hasGuidanceReportContextForRoute(path as Record<string, unknown>, {
    programmeId: guidanceContext.programmeId,
    schoolId: guidanceContext.schoolId,
  });
  const reviewComplete = isGuidanceReportReadyForRoute(path as Record<string, unknown>, {
    programmeId: guidanceContext.programmeId,
    schoolId: guidanceContext.schoolId,
  });
  const roleEntries: RoleEntry[] = [
    ...selectedSubgroups,
    ...directRoleDomains.map((domain) => ({ domain, directOnly: domain.subgroups.length > 0 })),
  ];
  const visibleSteps: Step[] = showSubgroupStep ? ["domains", "subgroups", "roles", "review"] : ["domains", "roles", "review"];

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
      } else if (sessionOnlyGuidance) {
        if (sequence === saveSequence.current) setNotice("Held for this guidance session.");
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

  // Ticking a domain, area or role is only a local selection. Save the current
  // draft when the learner explicitly continues or completes Review.
  const updateDraft = (nextPath: GuidanceReportPath["path"]) => {
    pathRef.current = nextPath;
    setPath(nextPath);
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
    updateDraft({ ...currentPath, domains: normalizedDomains, subgroups: removedSubgroups, roles: removedRoles, resume: { ...(currentPath.resume ?? {}), stage: "domains", status: "in_progress" } });
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
    updateDraft({ ...currentPath, domains: nextDomains, resume: { ...(currentPath.resume ?? {}), stage: "domains", status: "in_progress" } });
  };

  const toggleSubgroup = (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => {
    const currentPath = pathRef.current;
    const selected = (currentPath.subgroups ?? []).some((entry) => String(entry.id ?? "") === subgroup.id);
    const nextSubgroups = selected
      ? (currentPath.subgroups ?? []).filter((entry) => String(entry.id ?? "") !== subgroup.id)
      : [...(currentPath.subgroups ?? []), item(subgroup.id, subgroup.name, { domainId: domain.id, domainName: domain.name })];
    const nextRoles = selected ? (currentPath.roles ?? []).filter((entry) => String(entry.subgroupId ?? "") !== subgroup.id) : currentPath.roles ?? [];
    const nextDomains = (currentPath.domains ?? []).some((entry) => String(entry.id ?? "") === domain.id) ? currentPath.domains ?? [] : [...(currentPath.domains ?? []), domainItem(domain.id, domain.name, { matchType: domain.programmeMatchType, intent: (currentPath.domains ?? []).length ? "secondary" : "primary", sequence: (currentPath.domains ?? []).length + 1 })];
    updateDraft({ ...currentPath, domains: nextDomains, subgroups: nextSubgroups, roles: nextRoles, resume: { ...(currentPath.resume ?? {}), stage: "subgroups", status: "in_progress" } });
  };

  const toggleRole = (domain: DomainV2, subgroup: DomainV2["subgroups"][number] | undefined, role: DomainV2["roles"][number]) => {
    const currentPath = pathRef.current;
    const selected = (currentPath.roles ?? []).some((entry) => String(entry.id ?? "") === role.key);
    const nextRoles = selected
      ? (currentPath.roles ?? []).filter((entry) => String(entry.id ?? "") !== role.key)
      : [...(currentPath.roles ?? []), item(role.key, role.name, {
        domainId: domain.id,
        domainName: domain.name,
        ...(subgroup ? { subgroupId: subgroup.id, subgroupName: subgroup.name } : {}),
      })];
    updateDraft({ ...currentPath, roles: nextRoles, resume: { ...(currentPath.resume ?? {}), stage: "roles", status: "in_progress" } });
  };

  const completeReview = () => {
    if (!reportContextReady) {
      setNotice("Choose a programme and university before completing Review.");
      return;
    }
    const currentPath = pathRef.current;
    void persist({
      ...currentPath,
      resume: { ...(currentPath.resume ?? {}), stage: "review", status: "complete" },
    });
  };

  return (
    <DetailScaffold
      eyebrow="GUIDANCE"
      title="Build your guidance route"
      backLabel="Back to programme"
      pdf={reviewComplete && !saving}
      pdfPath={reviewComplete && !saving ? (targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html") : undefined}
      reportActionsEnabled={reviewComplete && !saving}
      state={state}
      onRetry={() => setRetryKey((value) => value + 1)}
      disclaimer={false}
    >
      {() => (
        <View style={styles.body}>
           <Text style={[styles.lead, { color: colors.textRole.secondary }]}>Start with the domains connected to your programme. Choose one primary route; add a secondary domain only when you want to compare or plan a pivot. Ticks change your selections on this screen. Your route is saved when you continue or complete Review.</Text>
           <RouteLine variant="spine" stations={showSubgroupStep ? [{ state: displayedStep === "domains" ? "you" : "bridge", label: "Domains" }, { state: displayedStep === "subgroups" ? "you" : displayedStep === "domains" ? "target" : "bridge", label: "Areas" }, { state: displayedStep === "roles" ? "you" : displayedStep === "review" ? "bridge" : "target", label: "Roles" }, { state: displayedStep === "review" ? "you" : "target", label: "Review" }] : [{ state: displayedStep === "domains" ? "you" : "bridge", label: "Domains" }, { state: displayedStep === "roles" ? "you" : displayedStep === "review" ? "bridge" : "target", label: "Roles" }, { state: displayedStep === "review" ? "you" : "target", label: "Review" }]} edges={showSubgroupStep ? ["solid", "dashed", "dashed"] : ["solid", "dashed"]} style={styles.route} />
           <View style={styles.steps}>{visibleSteps.map((name, index) => <TouchableOpacity key={name} accessibilityRole="button" accessibilityState={{ selected: displayedStep === name }} onPress={() => index === 0 || selectedDomainIds.size > 0 ? updateStep(name) : undefined} style={[styles.step, { borderColor: displayedStep === name ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: displayedStep === name ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.stepNumber, { color: colors.accentRole.action }]}>{index + 1}</Text><Text style={[styles.stepText, { color: colors.textRole.primary }]}>{name === "domains" ? "Domains" : name === "subgroups" ? "Areas" : name === "roles" ? "Roles" : "Review"}</Text></TouchableOpacity>)}</View>
            {displayedStep === "domains" ? <DomainStepRefined colors={colors} domains={domains} selected={selectedDomainIds} primaryId={primaryDomainId} onToggle={toggleDomain} onSetPrimary={setPrimaryDomain} onView={(domain) => exploreNav.domain(router, domain.id, { ...guidanceContext, focused: true }, domain.programmeMatchType)} onNext={() => updateStep(showSubgroupStep ? "subgroups" : "roles")} onBack={() => { if (router.canGoBack()) router.back(); else router.replace("/(tabs)/explore" as never); }} nextLabel={showSubgroupStep ? "Review areas" : "Choose roles"} /> : null}
           {displayedStep === "subgroups" ? <SubgroupStepRefined colors={colors} domains={selectedDomains} primaryId={primaryDomainId} selected={selectedSubgroupIds} onToggle={toggleSubgroup} onView={(domain, subgroup) => exploreNav.subgroup(router, domain.id, subgroup.id, { ...guidanceContext, focused: true })} onNext={() => updateStep("roles")} onBack={() => updateStep("domains")} /> : null}
             {displayedStep === "roles" ? <RoleStepRefined colors={colors} entries={roleEntries} selected={selectedRoleIds} onToggle={toggleRole} onView={(role) => exploreNav.role(router, role.key, { ...guidanceContext, focused: true })} onNext={() => updateStep("review")} onBack={() => updateStep(showSubgroupStep ? "subgroups" : "domains")} /> : null}
            {displayedStep === "review" ? <ReviewStep colors={colors} domains={selectedDomains} primaryId={primaryDomainId} programmeName={String((path.programme as Snapshot | undefined)?.name ?? "")} universityName={String((path.university as Snapshot | undefined)?.name ?? "")} subgroups={selectedSubgroups} roles={path.roles ?? []} saving={saving} notice={notice} reviewComplete={reviewComplete} canComplete={reportContextReady} onComplete={completeReview} onBack={() => updateStep("roles")} /> : null}
           {displayedStep !== "review" && notice ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>{notice}</Text> : null}
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
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>First, understand the domains</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Each domain is a broad area of work. Open a domain’s details before deciding whether it belongs in your route.</Text><View style={styles.cards}>{domains.map((domain) => <TouchableOpacity key={domain.id} onPress={() => onToggle(domain)} style={[styles.card, { borderColor: selected.has(domain.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(domain.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{domain.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{domain.description || "See what people do in this domain, the skills it uses, and the areas inside it."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(domain.id) ? "Selected · View domain" : "View domain and select"}</Text></View><Feather name={selected.has(domain.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>)}</View><ActionRow colors={colors} onBack={() => undefined} onNext={onNext} nextLabel="Review areas" disabled={!selected.size} /></View>;
}

  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Now review the areas</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>A domain can contain several areas of work. Choose one or more that you want to understand better.</Text>{domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name}</Text>{domain.subgroups.length ? domain.subgroups.map((subgroup) => <TouchableOpacity key={subgroup.id} onPress={() => onToggle(domain, subgroup)} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{subgroup.description || "View the capabilities, resources and roles connected to this area."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Selected · View area" : "View area and select"}</Text></View><Feather name={selected.has(subgroup.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No areas are available for this domain yet.</Text>}</View>)}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" disabled={!selected.size} /></View>;
}

  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles within your selected areas</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are grouped under their area. Choose one or more roles for your report.</Text>{entries.map(({ domain, subgroup }) => { const roles = domain.roles.filter((role) => role.guidanceAvailable !== false && role.subgroupId === subgroup.id); return <View key={subgroup.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup.name}</Text>{roles.length ? roles.map((role) => <TouchableOpacity key={role.key} onPress={() => onToggle(domain, subgroup, role)} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>View what this role involves and the skills connected to it.</Text></View><Feather name={selected.has(role.key) ? "check" : "plus"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}</View>; })}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Review my selections" disabled={!selected.size} /></View>;
}

*/
function DomainStepRefined({ colors, domains, selected, primaryId, onToggle, onSetPrimary, onView, onNext, onBack, nextLabel }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; primaryId: string; onToggle: (domain: DomainV2) => void; onSetPrimary: (domain: DomainV2) => void; onView: (domain: DomainV2) => void; onNext: () => void; onBack: () => void; nextLabel: string }) {
  const groups: { label: string; items: DomainV2[] }[] = [
    { label: "Closest matches", items: domains.filter((domain) => domain.programmeMatchType === "direct") },
    { label: "Useful foundations", items: domains.filter((domain) => domain.programmeMatchType === "functional") },
    { label: "Possible next directions", items: domains.filter((domain) => domain.programmeMatchType === "adjacent") },
    { label: "Other available fields", items: domains.filter((domain) => !domain.programmeMatchType) },
  ].filter((group) => group.items.length);
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>First, understand the domains</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Open a domain to understand what it covers. Choose one primary route for active guidance, then add secondary domains if you want to compare or plan a future pivot.</Text>
    {primaryId && selected.has(primaryId) && domains.find((domain) => domain.id === primaryId)?.programmeMatchType === "direct" ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Your programme has a close connection to this domain. Read the domain details to see what it covers and what you may want to build next.</Text> : null}
    {groups.map((group) => <View key={group.label} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{group.label}</Text>{group.items.map((domain) => <View key={domain.id} style={[styles.card, { borderColor: selected.has(domain.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(domain.id) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><View style={styles.cardHeading}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{domain.name}</Text><Text style={[styles.relation, { color: colors.textRole.muted }]}>{relationLabel(domain.programmeMatchType)}</Text></View><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: domain.studentOrientation?.shortIntro, short_intro: domain.studentOrientation?.short_intro, whatPeopleDo: domain.studentOrientation?.whatPeopleDo, what_people_do: domain.studentOrientation?.what_people_do, whatItStudies: domain.studentOrientation?.whatItStudies, what_it_studies: domain.studentOrientation?.what_it_studies, description: domain.description, fallback: "A student-friendly summary is not available yet." })}</Text>{domain.programmeConnection?.explanation ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>Programme connection: {domain.programmeConnection.explanation}</Text> : null}<EvidenceSummary colors={colors} evidence={domain.guidanceEvidence} /><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View domain</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(domain.id) ? "Remove" : "Add secondary"}</Text></TouchableOpacity>{selected.has(domain.id) && primaryId !== domain.id ? <TouchableOpacity onPress={() => onSetPrimary(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>Make primary</Text></TouchableOpacity> : null}{primaryId === domain.id ? <Text style={[styles.primaryLabel, { color: colors.accentRole.action }]}>Primary route</Text> : null}</View></View><Feather name={selected.has(domain.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>)}</View>)}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel={nextLabel} disabled={!selected.size} />
  </View>;
}

function SubgroupStepRefined({ colors, domains, primaryId, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; domains: DomainV2[]; primaryId: string; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onView: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Now choose areas of work</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Your domain foundation stays portable. These are the additional capabilities to build as you narrow into an area of work.</Text>
    {domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name} <Text style={[styles.relation, { color: colors.textRole.muted }]}>{domain.id === primaryId ? "· Primary route" : "· Secondary route"}</Text></Text>{domain.id !== primaryId && (domain.programmeMatchType === "functional" || domain.programmeMatchType === "adjacent") ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{domain.programmeMatchType === "adjacent" ? "This is a possible direction outside your programme. Read the domain details to see what further learning may be needed." : "This domain uses some ideas from your programme in a different setting. Read the details to see the connection."}</Text> : null}{domain.subgroups.length ? domain.subgroups.map((subgroup) => <View key={subgroup.id} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}>
        <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: subgroup.studentOrientation?.shortIntro, short_intro: subgroup.studentOrientation?.short_intro, whatPeopleDo: subgroup.studentOrientation?.whatPeopleDo || subgroup.studentOrientation?.what_people_do || subgroup.whatPeopleDo, what_people_do: subgroup.studentOrientation?.what_people_do, whatItStudies: subgroup.studentOrientation?.whatItStudies, what_it_studies: subgroup.studentOrientation?.what_it_studies, description: subgroup.description, fallback: "A student-friendly summary is not available yet." })}</Text><EvidenceSummary colors={colors} evidence={subgroup.guidanceEvidence} /><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View area</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Remove" : "Select area"}</Text></TouchableOpacity></View></View><Feather name={selected.has(subgroup.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
      </View>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>This domain does not use a separate area structure here, so we’ll take you directly to its roles.</Text>}</View>)}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" />
  </View>;
}

function RoleStepRefined({ colors, entries, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; entries: RoleEntry[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number] | undefined, role: DomainV2["roles"][number]) => void; onView: (role: DomainV2["roles"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles along your route</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Choose a role to see the skills, tools, credentials and proof that matter for that route. Select one or more roles for your report. Entry-level roles appear first so you can see a realistic starting point.</Text>
    {!entries.length ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>No area or direct-domain route is selected yet. You can review the portable domain foundation now and return to add an area later.</Text> : null}
    {entries.map(({ domain, subgroup, directOnly }) => {
      const roles = domain.roles.filter((role) => role.guidanceAvailable !== false && (subgroup ? role.subgroupId === subgroup.id : directOnly ? !role.subgroupId : true)).sort(compareCareerRoles);
      const tiers = ["entry", "mid", "senior", "unknown"] as const;
      const areaKey = subgroup?.id ?? domain.id;
      return <View key={areaKey} style={styles.group}>
        <Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup?.name ?? (directOnly ? `${domain.name} direct roles` : `${domain.name} roles`)}</Text>
        {roles.length ? tiers.map((tier) => {
          const tierRoles = roles.filter((role) => tier === "unknown" ? !role.tier : role.tier === tier);
          if (!tierRoles.length) return null;
           return <View key={`${areaKey}-${tier}`} style={styles.group}>
            <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>{careerRoleTierLabel(tier === "unknown" ? undefined : tier)}</Text>
            {tierRoles.map((role) => <View key={role.key} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}>
               <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: role.studentOrientation?.shortIntro, short_intro: role.studentOrientation?.short_intro, whatPeopleDo: role.studentOrientation?.whatPeopleDo, what_people_do: role.studentOrientation?.what_people_do, whatItStudies: role.studentOrientation?.whatItStudies, what_it_studies: role.studentOrientation?.what_it_studies, description: role.description, fallback: "A student-friendly summary is not available yet." })}</Text><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View more</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup, role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(role.key) ? "Remove" : "Select role"}</Text></TouchableOpacity></View></View><Feather name={selected.has(role.key) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
            </View>)}
          </View>;
        }) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}
      </View>;
    })}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel={selected.size ? "Review my selections" : "Review domain route"} />
  </View>;
}

function ReviewStep({ colors, domains, primaryId, programmeName, universityName, subgroups, roles, saving, notice, reviewComplete, canComplete, onComplete, onBack }: { colors: ColorPalette; domains: DomainV2[]; primaryId: string; programmeName: string; universityName: string; subgroups: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; roles: Snapshot[]; saving: boolean; notice: string | null; reviewComplete: boolean; canComplete: boolean; onComplete: () => void; onBack: () => void }) {
  const primary = domains.find((domain) => domain.id === primaryId);
  const secondary = domains.filter((domain) => domain.id !== primaryId);
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Review your guidance route</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{reviewComplete ? "Your completed route is ready to become a report. The report keeps the academic context and selected downstream path together." : roles.length ? "Check your primary route, selected areas and roles. Complete this Review step when the route is correct." : "Check your domain route. You can add areas and roles now or complete the review with the domain foundation."}</Text><PrioritySummary colors={colors} /><SummaryList colors={colors} title="Programme" values={programmeName ? [programmeName] : []} /><SummaryList colors={colors} title="University" values={universityName ? [universityName] : []} /><SummaryList colors={colors} title="Primary domain" values={primary ? [primary.name] : []} /><SummaryList colors={colors} title="Secondary domains" values={secondary.map((domain) => `${domain.name} · ${relationLabel(domain.programmeMatchType)}`)} /><SummaryList colors={colors} title="Areas" values={subgroups.map(({ subgroup }) => subgroup.name)} /><SummaryList colors={colors} title="Roles" values={roles.map((role) => String(role.name ?? "Role"))} /><Text style={[styles.copy, { color: colors.textRole.muted }]}>{saving ? "Saving your draft…" : notice || (reviewComplete ? "Review complete. Print, download and share are now available above." : canComplete ? "Complete Review to unlock the report actions." : "Choose a programme and university before completing Review.")}</Text><ActionRow colors={colors} onBack={onBack} onNext={onComplete} nextLabel={reviewComplete ? "Review complete" : "Complete review"} disabled={reviewComplete || saving || !canComplete} /></View>;
}

function PrioritySummary({ colors }: { colors: ColorPalette }) {
  return <View style={[styles.summary, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
    <Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>What comes first</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>1. Learn the portable domain foundation that supports more than one role.</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>2. Build the additional capabilities introduced by your selected area.</Text>
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
