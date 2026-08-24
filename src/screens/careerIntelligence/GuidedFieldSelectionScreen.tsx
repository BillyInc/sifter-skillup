import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { DetailScaffold } from "@/components/careerIntelligence";
import { careerData, type GuidanceReportPath } from "@/lib/careerData";
import { provisioningData } from "@/lib/provisioningData";
import { useAuth } from "@/hooks/useAuth";
import { useExploreNav } from "@/lib/exploreNav";
import { comingSoon, real, type DataState, type DomainV2 } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, type ColorPalette } from "@/theme";

type Step = "domains" | "subgroups" | "roles" | "review";
type Snapshot = Record<string, unknown>;

function item(id: string, name: string, extra: Snapshot = {}): Snapshot {
  return { id, name, ...extra };
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
  const { user } = useAuth();
  const targetStudentId = params.guidance_student_id ? String(params.guidance_student_id) : undefined;
  const programmeId = params.jamb_programme_id ? String(params.jamb_programme_id) : params.programme_id ? String(params.programme_id) : undefined;
  const [state, setState] = useState<DataState<DomainV2[]>>(() => comingSoon("Loading the fields connected to this programme..."));
  const [path, setPath] = useState<GuidanceReportPath["path"]>({});
  const [step, setStep] = useState<Step>("domains");
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
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
      if (programmeId) {
        if (params.jamb_programme_id) {
          const linked = await careerData.getJambProgrammeDomains(programmeId);
          const links = linked.status === "real" && linked.data ? linked.data.domains : [];
          const loaded = await Promise.all(links.map((link) => careerData.getDomainV2(link.domainId)));
          domains = loaded.filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data)).map((entry) => entry.data);
        } else {
          const programme = await careerData.getProgramme(programmeId);
          const links = programme.status === "real" && programme.data ? programme.data.domains ?? [] : [];
          const loaded = await Promise.all(links.map((link) => careerData.getDomainV2(link.domainId)));
          domains = loaded.filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data)).map((entry) => entry.data);
        }
      }
      if (!domains.length) {
        const clusters = await careerData.getDomainClusters();
        const links = clusters.status === "real" && clusters.data ? clusters.data.flatMap((group) => group.domains) : [];
        const loaded = await Promise.all(links.map((link) => careerData.getDomainV2(link.id)));
        domains = loaded.filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data)).map((entry) => entry.data);
      }
      if (active) {
        setState(domains.length ? real(domains) : comingSoon("No mapped fields are available for this programme yet."));
        setActiveDomainId(domains[0]?.id ?? null);
      }
    })();
    return () => { active = false; };
  }, [params.jamb_programme_id, programmeId, targetStudentId]);

  const domains = state.data ?? [];
  const selectedDomainIds = useMemo(() => new Set((path.domains ?? []).map((entry) => String(entry.id ?? ""))), [path.domains]);
  const selectedSubgroupIds = useMemo(() => new Set((path.subgroups ?? []).map((entry) => String(entry.id ?? ""))), [path.subgroups]);
  const selectedRoleIds = useMemo(() => new Set((path.roles ?? []).map((entry) => String(entry.id ?? ""))), [path.roles]);
  const activeDomain = domains.find((domain) => domain.id === activeDomainId) ?? domains[0];
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
      : [...(currentPath.domains ?? []), item(domain.id, domain.name)];
    const removedSubgroups = selected ? (currentPath.subgroups ?? []).filter((entry) => String(entry.domainId ?? "") !== domain.id) : currentPath.subgroups ?? [];
    const removedRoles = selected ? (currentPath.roles ?? []).filter((entry) => String(entry.domainId ?? "") !== domain.id) : currentPath.roles ?? [];
    void persist({ ...currentPath, domains: nextDomains, subgroups: removedSubgroups, roles: removedRoles, resume: { ...(currentPath.resume ?? {}), stage: "domains", status: "in_progress" } });
  };

  const toggleSubgroup = (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => {
    const currentPath = pathRef.current;
    const selected = (currentPath.subgroups ?? []).some((entry) => String(entry.id ?? "") === subgroup.id);
    const nextSubgroups = selected
      ? (currentPath.subgroups ?? []).filter((entry) => String(entry.id ?? "") !== subgroup.id)
      : [...(currentPath.subgroups ?? []), item(subgroup.id, subgroup.name, { domainId: domain.id, domainName: domain.name })];
    const nextRoles = selected ? (currentPath.roles ?? []).filter((entry) => String(entry.subgroupId ?? "") !== subgroup.id) : currentPath.roles ?? [];
    const nextDomains = (currentPath.domains ?? []).some((entry) => String(entry.id ?? "") === domain.id) ? currentPath.domains ?? [] : [...(currentPath.domains ?? []), item(domain.id, domain.name)];
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

  return (
    <DetailScaffold
      eyebrow="GUIDANCE"
      title="Choose the fields you want to explore"
      backLabel="Back to programme"
      pdf={step === "review"}
      pdfPath={step === "review" ? (targetStudentId ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html` : "/api/student/report.html") : undefined}
      state={state}
      disclaimer={false}
    >
      {() => (
        <View style={styles.body}>
           <Text style={[styles.lead, { color: colors.textRole.secondary }]}>Read each field first, then choose one or more. Your choices are saved as a draft automatically, so you do not need to bookmark every item. After that, review the smaller areas inside your chosen fields and the roles connected to them.</Text>
          <View style={styles.steps}>{(["domains", "subgroups", "roles", "review"] as Step[]).map((name, index) => <TouchableOpacity key={name} onPress={() => index === 0 || (index === 1 && selectedDomainIds.size > 0) || (index === 2 && selectedSubgroupIds.size > 0) || (index === 3 && selectedRoleIds.size > 0) ? updateStep(name) : undefined} style={[styles.step, { borderColor: step === name ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: step === name ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.stepNumber, { color: colors.accentRole.action }]}>{index + 1}</Text><Text style={[styles.stepText, { color: colors.textRole.primary }]}>{name === "domains" ? "Fields" : name === "subgroups" ? "Smaller areas" : name === "roles" ? "Roles" : "Review"}</Text></TouchableOpacity>)}</View>
            {step === "domains" ? <DomainStepRefined colors={colors} domains={domains} selected={selectedDomainIds} onToggle={toggleDomain} onView={(domain) => exploreNav.domain(router, domain.id, targetStudentId, true)} onNext={() => updateStep("subgroups")} /> : null}
            {step === "subgroups" ? <SubgroupStepRefined colors={colors} domains={selectedDomains} selected={selectedSubgroupIds} onToggle={toggleSubgroup} onView={(domain, subgroup) => exploreNav.subgroup(router, domain.id, subgroup.id, targetStudentId, true)} onNext={() => updateStep("roles")} onBack={() => updateStep("domains")} /> : null}
            {step === "roles" ? <RoleStepRefined colors={colors} entries={selectedSubgroups} selected={selectedRoleIds} onToggle={toggleRole} onView={(role) => exploreNav.role(router, role.key, targetStudentId, true)} onNext={() => updateStep("review")} onBack={() => updateStep("subgroups")} /> : null}
          {step === "review" ? <ReviewStep colors={colors} domains={selectedDomains} subgroups={selectedSubgroups} roles={path.roles ?? []} saving={saving} notice={notice} onBack={() => updateStep("roles")} /> : null}
          {step !== "review" && notice ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>{notice}</Text> : null}
          {saving ? <ActivityIndicator size="small" color={colors.accentRole.action} /> : null}
        </View>
      )}
    </DetailScaffold>
  );
}

function DomainStep({ colors, domains, selected, onToggle, onNext }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; onToggle: (domain: DomainV2) => void; onNext: () => void }) {
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>First, understand the fields</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Each field is a broad area of work. Open a field’s details before deciding whether it belongs in your report.</Text><View style={styles.cards}>{domains.map((domain) => <TouchableOpacity key={domain.id} onPress={() => onToggle(domain)} style={[styles.card, { borderColor: selected.has(domain.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(domain.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{domain.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{domain.description || "See what people do in this field, the skills it uses, and the smaller areas inside it."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(domain.id) ? "Selected · View details" : "View details and select"}</Text></View><Feather name={selected.has(domain.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>)}</View><ActionRow colors={colors} onBack={() => undefined} onNext={onNext} nextLabel="Review smaller areas" disabled={!selected.size} /></View>;
}

function SubgroupStep({ colors, domains, selected, onToggle, onNext, onBack }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Now review the smaller areas</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>A field can contain several smaller areas. Choose one or more that you want to understand better.</Text>{domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name}</Text>{domain.subgroups.length ? domain.subgroups.map((subgroup) => <TouchableOpacity key={subgroup.id} onPress={() => onToggle(domain, subgroup)} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{subgroup.description || "View the skills, resources and roles connected to this area."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Selected · View details" : "View details and select"}</Text></View><Feather name={selected.has(subgroup.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No smaller areas are available for this field yet.</Text>}</View>)}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" disabled={!selected.size} /></View>;
}

function RoleStep({ colors, entries, selected, onToggle, onNext, onBack }: { colors: ColorPalette; entries: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number], role: DomainV2["roles"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles within your selected areas</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are grouped under their smaller area. Choose one or more roles for your report.</Text>{entries.map(({ domain, subgroup }) => { const roles = domain.roles.filter((role) => role.subgroupId === subgroup.id); return <View key={subgroup.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup.name}</Text>{roles.length ? roles.map((role) => <TouchableOpacity key={role.key} onPress={() => onToggle(domain, subgroup, role)} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>View what this role involves and the skills connected to it.</Text></View><Feather name={selected.has(role.key) ? "check" : "plus"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}</View>; })}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Review my selections" disabled={!selected.size} /></View>;
}

function DomainStepRefined({ colors, domains, selected, onToggle, onView, onNext }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; onToggle: (domain: DomainV2) => void; onView: (domain: DomainV2) => void; onNext: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>First, understand the fields</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Open a field to understand what it covers. Then select one or more fields for your guidance.</Text>
    <View style={styles.cards}>{domains.map((domain) => <View key={domain.id} style={[styles.card, { borderColor: selected.has(domain.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(domain.id) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{domain.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{domain.description || "See what people do in this field, the skills it uses, and the smaller areas inside it."}</Text><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View more</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(domain.id) ? "Remove" : "Select field"}</Text></TouchableOpacity></View></View><Feather name={selected.has(domain.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>)}</View>
    <ActionRow colors={colors} onBack={() => undefined} onNext={onNext} nextLabel="Review smaller areas" disabled={!selected.size} />
  </View>;
}

function SubgroupStepRefined({ colors, domains, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; domains: DomainV2[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onView: (domain: DomainV2, subgroup: DomainV2["subgroups"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Now review the smaller areas</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>These areas sit inside the fields you chose. Open their details, then select one or more to continue to the roles arranged under them.</Text>
    {domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name}</Text>{domain.subgroups.length ? domain.subgroups.map((subgroup) => <View key={subgroup.id} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{subgroup.description || "View the skills, resources and roles connected to this area."}</Text><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View more</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Remove" : "Select area"}</Text></TouchableOpacity></View></View><Feather name={selected.has(subgroup.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No smaller areas are available for this field yet.</Text>}</View>)}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" disabled={!selected.size} />
  </View>;
}

function RoleStepRefined({ colors, entries, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; entries: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number], role: DomainV2["roles"][number]) => void; onView: (role: DomainV2["roles"][number]) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles within your selected areas</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Roles are grouped under the smaller area they belong to. Open a role to understand it, then select one or more for your report.</Text>
    {entries.map(({ domain, subgroup }) => { const roles = domain.roles.filter((role) => role.subgroupId === subgroup.id); return <View key={subgroup.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup.name}</Text>{roles.length ? roles.map((role) => <View key={role.key} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}>
      <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>See what this role involves and the skills connected to it.</Text><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View more</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup, role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(role.key) ? "Remove" : "Select role"}</Text></TouchableOpacity></View></View><Feather name={selected.has(role.key) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
    </View>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>Roles for this area are not available yet.</Text>}</View>; })}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Review my selections" disabled={!selected.size} />
  </View>;
}

function ReviewStep({ colors, domains, subgroups, roles, saving, notice, onBack }: { colors: ColorPalette; domains: DomainV2[]; subgroups: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; roles: Snapshot[]; saving: boolean; notice: string | null; onBack: () => void }) {
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Review your guidance</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>Your selected programme and university remain at the start of the report. These fields, smaller areas and roles will be added underneath.</Text><SummaryList colors={colors} title="Fields" values={domains.map((domain) => domain.name)} /><SummaryList colors={colors} title="Smaller areas" values={subgroups.map(({ subgroup }) => subgroup.name)} /><SummaryList colors={colors} title="Roles" values={roles.map((role) => String(role.name ?? "Role"))} /><Text style={[styles.copy, { color: colors.textRole.muted }]}>{saving ? "Saving your draft…" : notice || "Your draft is saved automatically. Review it once, then use the report action when you are ready."}</Text><ActionRow colors={colors} onBack={onBack} onNext={() => undefined} nextLabel="Report ready" disabled /></View>;
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
  cardActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginTop: Spacing.xs },
  cardTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.25 },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  link: { fontSize: FontSize.xs, fontWeight: "700" },
  group: { gap: Spacing.sm },
  groupTitle: { fontSize: FontSize.md, fontWeight: "800" },
  actions: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.sm, marginTop: Spacing.sm },
  secondary: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  primary: { borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  actionText: { fontSize: FontSize.sm, fontWeight: "700" },
  primaryText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "800" },
  summary: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  notice: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});
