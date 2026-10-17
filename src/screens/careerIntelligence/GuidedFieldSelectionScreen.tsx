import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { DetailScaffold, RouteLine } from "@/components/careerIntelligence";
import { hasGuidanceReportContextForRoute, isGuidanceReportReadyForRoute } from "@/components/careerIntelligence/GuidanceReportButton";
import { careerData, type GuidanceDomainSelection, type GuidanceReportPath } from "@/lib/careerData";
import { openStudentDocument, provisioningData, shareTextSummary } from "@/lib/provisioningData";
import { useExploreNav } from "@/lib/exploreNav";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { careerRoleTierLabel, compareCareerRoles } from "@/lib/careerRoleOrdering";
import { rolesForArea, type AreaRoleOption } from "@/lib/areaRoleOptions";
import { currentAreaRoleSelections, studentDomainAreas } from "@/lib/studentDomainAreas";
import { studentSummary } from "@/lib/careerLabels";
import { contextItemsToLearningCandidates } from "@/lib/guidedLearningPlanAdapter";
import { addToLearningPlan, buildLearningPlanStackSet, createLearningPlanReportSnapshot, learningPlanRouteKey, reorderLearningPlan, replaceAlternativeChoice, type LearningPlanCandidate, type LearningPlanRoute, type LearningPlanRouteSelection } from "@/lib/guidedLearningPlan";
import type { LearningPlanShareCopy, LearningPlanShareInput } from "@/lib/learningPlanShare";
import { GuidedLearningTray } from "@/components/careerIntelligence/GuidedLearningTray";
import { LearningPlanShareSheet } from "@/components/careerIntelligence/LearningPlanShareSheet";
import { comingSoon, pending, real, type DataState, type DomainMatchType, type DomainRoleSummary, type DomainRoleV2, type DomainV2, type GuidanceEvidence, type GuidanceEvidenceState } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, type ColorPalette } from "@/theme";

type Step = "domains" | "subgroups" | "roles" | "review";
type Snapshot = Record<string, unknown>;
type RoleEntry = { domain: DomainV2; subgroup?: DomainV2["subgroups"][number]; directOnly?: boolean };

function learningFocusId(entry: NonNullable<GuidanceReportPath["path"]["learningFocus"]>[number]): string {
  const layer = entry.contextLevel === "subgroup" ? "area" : entry.contextLevel;
  return `${layer}:${entry.contextKey}:${entry.itemType}:${entry.itemKey}`;
}

type LearningFocusEntry = NonNullable<GuidanceReportPath["path"]["learningFocus"]>[number];

function entryRouteKeys(entry: LearningFocusEntry): string[] {
  return Array.isArray(entry.routeKeys) ? [...new Set(entry.routeKeys.filter(Boolean))] : [];
}

function removeEntryFromRoute(entry: LearningFocusEntry, routeKey: string, allRouteKeys: string[]): LearningFocusEntry | null {
  const keys = entryRouteKeys(entry);
  // Entries created before route-local membership existed were global. Convert
  // them to explicit membership before removing only the current route.
  const remaining = (keys.length ? keys : allRouteKeys).filter((key) => key !== routeKey);
  return remaining.length ? { ...entry, routeKeys: [...new Set(remaining)] } : null;
}

function addEntryToRoute(entry: LearningFocusEntry, routeKey: string): LearningFocusEntry {
  const keys = entryRouteKeys(entry);
  // A legacy/global choice remains global when it is selected again.
  return keys.length ? { ...entry, routeKeys: [...new Set([...keys, routeKey])] } : entry;
}

function routeFor(domainId: string, subgroupId?: string, roleId?: string, programmeId?: string): LearningPlanRoute {
  return { programmeId, domainId, ...(subgroupId ? { areaId: subgroupId } : {}), ...(roleId ? { roleId } : {}) };
}

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
    domain_id?: string;
    area_id?: string;
    role_id?: string;
    jamb_programme_id?: string;
    school_id?: string;
    user_type?: string;
    journey_mode?: string;
    guidance_student_id?: string;
    focus?: string;
    open_tray?: string;
    guidance_target?: string;
    snapshot_id?: string;
  }>();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const targetStudentId = params.guidance_student_id ? String(params.guidance_student_id) : undefined;
  const programmeId = params.jamb_programme_id ? String(params.jamb_programme_id) : params.programme_id ? String(params.programme_id) : undefined;
  const guidanceContext: GuidanceRouteContext = {
    programmeId,
    domainId: params.domain_id ? String(params.domain_id) : undefined,
    areaId: params.area_id ? String(params.area_id) : undefined,
    roleId: params.role_id ? String(params.role_id) : undefined,
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
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [shareInput, setShareInput] = useState<LearningPlanShareInput>({});
  const [roleDetails, setRoleDetails] = useState<Record<string, DomainRoleV2>>({});
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
      const requestedSnapshotId = params.snapshot_id ? String(params.snapshot_id) : "";
      if (requestedSnapshotId && Array.isArray(savedPath.learningPlanSnapshots)) {
        const selectedSnapshot = savedPath.learningPlanSnapshots.find((entry) => entry.snapshotId === requestedSnapshotId);
        const savedContext = selectedSnapshot?.reportPathContext;
        if (savedContext && typeof savedContext === "object") {
          savedPath = {
            ...savedPath,
            ...(savedContext as Partial<GuidanceReportPath["path"]>),
            learningPlanSnapshots: savedPath.learningPlanSnapshots,
            learningPlanSnapshot: selectedSnapshot,
            resume: { ...(savedPath.resume ?? {}), stage: "review", status: "in_progress", mode: "guided" },
          };
        }
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
        domains = (await loadLinkedDomains(links)).map((domain) => ({ ...domain, subgroups: studentDomainAreas(domain) }));
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
        domains = loaded.filter((entry): entry is DataState<DomainV2> & { data: DomainV2 } => Boolean(entry.data)).map((entry) => ({ ...entry.data, subgroups: studentDomainAreas(entry.data) }));
      }
      if (active) {
        setState(domains.length ? real(domains) : comingSoon("No domains are available yet."));
      }
    })();
    return () => { active = false; };
  }, [params.jamb_programme_id, params.snapshot_id, programmeId, targetStudentId, retryKey]);

  const domains = state.data ?? [];
  useEffect(() => {
    let active = true;
    const selectedRoleEntries = currentAreaRoleSelections(path.roles ?? [], domains);
    const roleKeys = [...new Set(selectedRoleEntries.map((entry) => String(entry.id ?? "")).filter(Boolean))];
    if (!roleKeys.length) {
      setRoleDetails({});
      return () => { active = false; };
    }
    void Promise.all(roleKeys.map(async (roleKey) => {
      const selection = selectedRoleEntries.find((entry) => String(entry.id ?? "") === roleKey);
      const areaId = selection?.subgroupId ? String(selection.subgroupId) : undefined;
      const loaded = await careerData.getRoleV2ForStudent(roleKey, programmeId, areaId);
      return loaded.status === "real" && loaded.data ? [roleKey, loaded.data] as const : null;
    })).then((entries) => {
      if (!active) return;
      setRoleDetails(Object.fromEntries(entries.filter((entry): entry is readonly [string, DomainRoleV2] => Boolean(entry))));
    });
    return () => { active = false; };
  }, [domains, path.roles, programmeId]);
  const selectedDomainIds = useMemo(() => new Set((path.domains ?? []).map((entry) => String(entry.id ?? ""))), [path.domains]);
  const selectedSubgroupIds = useMemo(() => new Set((path.subgroups ?? []).map((entry) => String(entry.id ?? ""))), [path.subgroups]);
  const selectedRoleSelections = useMemo(() => currentAreaRoleSelections(path.roles ?? [], domains), [domains, path.roles]);
  const selectedRoleIds = useMemo(() => new Set(selectedRoleSelections.map((entry) => String(entry.id ?? ""))), [selectedRoleSelections]);
  const primaryDomainId = String(path.domains?.find((entry) => entry.intent === "primary")?.id ?? path.domains?.[0]?.id ?? "");
  const selectedDomains = domains.filter((domain) => selectedDomainIds.has(domain.id));
  const selectedSubgroups = selectedDomains.flatMap((domain) => studentDomainAreas(domain).filter((subgroup) => selectedSubgroupIds.has(subgroup.id)).map((subgroup) => ({ domain, subgroup })));
  const directRoleDomains = selectedDomains.filter((domain) => domain.id !== "D078" && domain.roles.some((role) =>
    role.guidanceAvailable !== false && (domain.id === "D078" ? !(role.areaIds?.length) : !role.subgroupId)
  ));
  const showSubgroupStep = selectedDomains.length === 0 || selectedDomains.some((domain) => studentDomainAreas(domain).length > 0);
  const displayedStep: Step = !showSubgroupStep && step === "subgroups" ? "roles" : step;
  const reportContextReady = hasGuidanceReportContextForRoute(path as Record<string, unknown>, {
    programmeId: guidanceContext.programmeId,
    schoolId: guidanceContext.schoolId,
  });
  const reviewComplete = isGuidanceReportReadyForRoute(path as Record<string, unknown>, {
    programmeId: guidanceContext.programmeId,
    schoolId: guidanceContext.schoolId,
  });
  const reportDocumentPath = targetStudentId
    ? `/api/provisioning/students/${encodeURIComponent(targetStudentId)}/report.html`
    : "/api/student/report.html";
  const roleEntries: RoleEntry[] = [
    ...selectedSubgroups,
    ...directRoleDomains.map((domain) => ({ domain, directOnly: studentDomainAreas(domain).length > 0 })),
  ];
  const visibleSteps: Step[] = showSubgroupStep ? ["domains", "subgroups", "roles", "review"] : ["domains", "roles", "review"];

  /**
   * Build the live route preview from reviewed contextual records already
   * returned by the domain API. Empty/review-only records stay out of the
   * stack; the tray may still show area names as advisory options at the
   * domain stop point.
   */
  const guidedPlan = useMemo(() => {
    const contextItems = [
      ...selectedDomains.flatMap((domain) => domain.contextItems ?? []),
      ...selectedSubgroups.flatMap(({ subgroup }) => subgroup.contextItems ?? []),
      ...Object.values(roleDetails).flatMap((role) => role.contextItems ?? []),
    ];
    const candidates = contextItemsToLearningCandidates(contextItems);
    const selectedIds = (path.learningFocus ?? []).map(learningFocusId);
    const focusEntries = path.learningFocus ?? [];
    const routes: LearningPlanRouteSelection[] = [];
    const routeLabels: Record<string, { programme?: string; domain?: string; area?: string; role?: string }> = {};
    const advisoryAreaLabels: Record<string, string[]> = {};
    const addRoute = (route: LearningPlanRoute, labels: { domain: string; area?: string; role?: string }, advisoryAreas: string[] = []) => {
      const key = learningPlanRouteKey(route);
      const routeSelectedIds = focusEntries
        .filter((entry) => {
          const keys = entryRouteKeys(entry);
          return !keys.length || keys.includes(key);
        })
        .map(learningFocusId);
      routes.push({
        route,
        selectedIds: routeSelectedIds,
        removedIds: path.learningPlanRemovedIdsByRoute?.[key] ?? [],
        order: path.learningPlanOrderByRoute?.[key] ?? routeSelectedIds,
      });
      routeLabels[key] = { programme: String((path.programme as Snapshot | undefined)?.name ?? "Programme"), ...labels };
      if (advisoryAreas.length) advisoryAreaLabels[key] = advisoryAreas;
    };

    selectedDomains.forEach((domain) => {
      const areas = selectedSubgroups.filter(({ domain: selectedDomain }) => selectedDomain.id === domain.id);
      const domainRoles = selectedRoleSelections.filter((entry) => String(entry.domainId ?? "") === domain.id);
      if (areas.length) {
        areas.forEach(({ subgroup }) => {
          const areaRoles = domainRoles.filter((entry) => String(entry.subgroupId ?? "") === subgroup.id);
          if (areaRoles.length) {
            areaRoles.forEach((entry) => addRoute(routeFor(domain.id, subgroup.id, String(entry.id ?? ""), programmeId), { domain: domain.name, area: subgroup.name, role: String(entry.name ?? "Role") }));
          } else {
            addRoute(routeFor(domain.id, subgroup.id, undefined, programmeId), { domain: domain.name, area: subgroup.name });
          }
        });
      } else {
        const directRoles = domainRoles.filter((entry) => !entry.subgroupId);
        if (directRoles.length) {
          directRoles.forEach((entry) => addRoute(routeFor(domain.id, undefined, String(entry.id ?? ""), programmeId), { domain: domain.name, role: String(entry.name ?? "Role") }));
        } else {
          addRoute(routeFor(domain.id, undefined, undefined, programmeId), { domain: domain.name }, domain.subgroups.map((subgroup) => subgroup.name));
        }
      }
    });

    return {
      stackSet: buildLearningPlanStackSet({
        routes,
        domainItems: candidates.filter((candidate) => candidate.layer === "domain"),
        areaItems: candidates.filter((candidate) => candidate.layer === "area"),
        roleItems: candidates.filter((candidate) => candidate.layer === "role"),
      }),
      routeLabels,
      advisoryAreaLabels,
      routeSelections: routes,
      selectedIds,
      candidates,
      candidateSources: Object.fromEntries(candidates.flatMap((candidate) => {
        const source = contextItems.find((contextItem) => {
          const layer = contextItem.contextLevel === "subgroup" ? "area" : contextItem.contextLevel;
          return `${layer}:${contextItem.contextKey}:${contextItem.itemType}:${contextItem.itemKey}` === candidate.id;
        });
        return source ? [[candidate.id, source] as const] : [];
      })),
    };
  }, [path.learningFocus, path.learningPlanOrderByRoute, path.learningPlanRemovedIdsByRoute, path.programme, path.roles, programmeId, roleDetails, selectedDomains, selectedRoleSelections, selectedSubgroups]);

  const removeLearningFocus = (routeKey: string, itemId: string) => {
    const currentPath = pathRef.current;
    const allRouteKeys = guidedPlan.stackSet.stacks.map((stack) => learningPlanRouteKey(stack.route));
    const nextFocus = (currentPath.learningFocus ?? []).flatMap((entry) => {
      if (learningFocusId(entry) !== itemId) return [entry];
      const remaining = removeEntryFromRoute(entry, routeKey, allRouteKeys);
      return remaining ? [remaining] : [];
    });
    const removedIds = [...new Set([...(currentPath.learningPlanRemovedIds ?? []), itemId])];
    const removedByRoute = { ...(currentPath.learningPlanRemovedIdsByRoute ?? {}) };
    removedByRoute[routeKey] = [...new Set([...(removedByRoute[routeKey] ?? []), itemId])];
    updateDraft({ ...currentPath, learningFocus: nextFocus, learningPlanRemovedIds: removedIds, learningPlanRemovedIdsByRoute: removedByRoute });
    setNotice(`Removed from the ${routeKey} learning focus.`);
  };

  const selectLearningFocus = (routeKey: string, candidate: LearningPlanCandidate) => {
    const stack = guidedPlan.stackSet.stacks.find((entry) => learningPlanRouteKey(entry.route) === routeKey);
    const source = guidedPlan.candidateSources[candidate.id];
    if (!stack || !source) {
      setNotice("This learning item is not available in the current reviewed route.");
      return;
    }
    const result = addToLearningPlan({ route: stack.route, selectedIds: stack.selectedIds }, candidate, guidedPlan.candidates);
    if (result.conflicts.length) {
      setNotice(`${candidate.name} is an alternative to another selected item. Use Compare options to choose one.`);
      return;
    }
    if (result.blockedByPrerequisites.length) {
      const prerequisiteNames = result.blockedByPrerequisites
        .map((id) => guidedPlan.candidates.find((item) => item.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      setNotice(`Choose the prerequisite first${prerequisiteNames ? `: ${prerequisiteNames}` : ""}.`);
      return;
    }
    const currentPath = pathRef.current;
    const currentFocus = currentPath.learningFocus ?? [];
    const existing = currentFocus.find((entry) => learningFocusId(entry) === candidate.id);
    const nextEntry: LearningFocusEntry = existing ?? {
      id: candidate.id,
      name: source.name,
      contextLevel: source.contextLevel,
      contextKey: source.contextKey,
      itemType: source.itemType,
      itemKey: source.itemKey,
      domainId: source.domainId,
      routeKeys: [routeKey],
      ...(source.contextLevel === "subgroup" ? { subgroupId: source.contextKey } : {}),
    };
    const nextFocus = existing
      ? currentFocus.map((entry) => learningFocusId(entry) === candidate.id ? addEntryToRoute(entry, routeKey) : entry)
      : [...currentFocus, nextEntry];
    const removedByRoute = { ...(currentPath.learningPlanRemovedIdsByRoute ?? {}) };
    removedByRoute[routeKey] = (removedByRoute[routeKey] ?? []).filter((id) => id !== candidate.id);
    updateDraft({
      ...currentPath,
      learningFocus: nextFocus,
      learningPlanRemovedIds: (currentPath.learningPlanRemovedIds ?? []).filter((id) => id !== candidate.id),
      learningPlanRemovedIdsByRoute: removedByRoute,
    });
    setNotice(`Added ${source.name} to this route.`);
  };

  const selectAlternative = (routeKey: string, group: string, candidate: LearningPlanCandidate) => {
    const stack = guidedPlan.stackSet.stacks.find((entry) => learningPlanRouteKey(entry.route) === routeKey);
    const comparison = stack?.alternatives.find((entry) => entry.group === group);
    const source = guidedPlan.candidateSources[candidate.id];
    if (!stack || !comparison || candidate.alternativeGroup !== group
      || !comparison.options.some((option) => option.id === candidate.id) || !source) {
      setNotice("This option is not available in the current reviewed route.");
      return;
    }
    const currentPath = pathRef.current;
    const currentFocus = currentPath.learningFocus ?? [];
    const competingIds = new Set(comparison.options.map((option) => option.id).filter((id) => id !== candidate.id));
    const replacement = replaceAlternativeChoice(
      { route: stack.route, selectedIds: stack.selectedIds },
      candidate,
      guidedPlan.candidates,
    );
    if (!replacement.selection.selectedIds.includes(candidate.id)) {
      const prerequisiteNames = replacement.blockedByPrerequisites
        .map((id) => guidedPlan.candidates.find((item) => item.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      setNotice(replacement.blockedByPrerequisites.length
        ? `Choose the prerequisite first${prerequisiteNames ? `: ${prerequisiteNames}` : ""}. Your current option is unchanged.`
        : "This option is not available for personal selection on the current route.");
      return;
    }
    const allRouteKeys = guidedPlan.stackSet.stacks.map((stack) => learningPlanRouteKey(stack.route));
    const nextFocusWithoutCompeting = currentFocus.flatMap((entry) => {
      if (!competingIds.has(learningFocusId(entry))) return [entry];
      const remaining = removeEntryFromRoute(entry, routeKey, allRouteKeys);
      return remaining ? [remaining] : [];
    });
    const existing = currentFocus.find((entry) => learningFocusId(entry) === candidate.id);
    const nextEntry: LearningFocusEntry = existing ?? {
      id: candidate.id,
      name: source.name,
      contextLevel: source.contextLevel,
      contextKey: source.contextKey,
      itemType: source.itemType,
      itemKey: source.itemKey,
      domainId: source.domainId,
      routeKeys: [routeKey],
      ...(source.contextLevel === "subgroup" ? { subgroupId: source.contextKey } : {}),
    };
    const nextFocus = existing
      ? nextFocusWithoutCompeting.map((entry) => learningFocusId(entry) === candidate.id ? addEntryToRoute(entry, routeKey) : entry)
      : [...nextFocusWithoutCompeting, nextEntry];
    const removedByRoute = { ...(currentPath.learningPlanRemovedIdsByRoute ?? {}) };
    removedByRoute[routeKey] = (removedByRoute[routeKey] ?? []).filter((id) => id !== candidate.id && !competingIds.has(id));
    updateDraft({
      ...currentPath,
      learningFocus: nextFocus,
      learningPlanRemovedIds: (currentPath.learningPlanRemovedIds ?? []).filter((id) => id !== candidate.id && !competingIds.has(id)),
      learningPlanRemovedIdsByRoute: removedByRoute,
    });
    setNotice(`Selected ${source.name} in the ${group} comparison. The other options remain available to compare.`);
  };

  const reorderLearningFocus = (routeKey: string, itemId: string, beforeId?: string) => {
    const stack = guidedPlan.stackSet.stacks.find((entry) => learningPlanRouteKey(entry.route) === routeKey);
    if (!stack) return;
    const currentOrder = stack.selectedIds;
    const result = reorderLearningPlan(
      { route: stack.route, selectedIds: currentOrder },
      currentOrder,
      itemId,
      beforeId,
      guidedPlan.candidates,
    );
    if (result.blockedByPrerequisites.length) {
      const names = result.blockedByPrerequisites
        .map((id) => guidedPlan.candidates.find((candidate) => candidate.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      setNotice(`That order would put a prerequisite after the item that needs it${names ? `: ${names}` : ""}.`);
      return;
    }
    updateDraft({
      ...pathRef.current,
      learningPlanOrderByRoute: {
        ...(pathRef.current.learningPlanOrderByRoute ?? {}),
        [routeKey]: result.order,
      },
      resume: { ...(pathRef.current.resume ?? {}), status: "in_progress" },
    });
    setNotice("Updated the order for this route. Prerequisites remain first.");
  };

  const persist = async (nextPath: GuidanceReportPath["path"], options: { completeSnapshot?: boolean } = {}) => {
    const sequence = ++saveSequence.current;
    setSaving(true);
    setNotice(null);
    const stackByRoute = new Map(
      guidedPlan.stackSet.stacks.map((stack) => [learningPlanRouteKey(stack.route), stack]),
    );
    // Persist only the same approved, route-matched items that the tray can
    // actually display. A stale or newly unapproved focus record must not be
    // copied into a saved report merely because it was present in an older
    // resume payload.
    const approvedFocusIds = new Set(guidedPlan.stackSet.stacks.flatMap((stack) => stack.selectedIds));
    const sanitizedFocus = (nextPath.learningFocus ?? []).filter((entry) => approvedFocusIds.has(learningFocusId(entry)));
    const approvedRouteSelections = guidedPlan.routeSelections.map((selection) => {
      const key = learningPlanRouteKey(selection.route);
      const stack = stackByRoute.get(key);
      return {
        ...selection,
        selectedIds: stack?.selectedIds ?? [],
        order: stack?.selectedIds ?? [],
        removedIds: nextPath.learningPlanRemovedIdsByRoute?.[key] ?? selection.removedIds ?? [],
      };
    });
    const snapshotId = `guided-${programmeId ?? "route"}-${Date.now()}`;
    const reportSnapshot = approvedRouteSelections.length
      ? createLearningPlanReportSnapshot({
        snapshotId,
        selections: approvedRouteSelections,
        ordersByRoute: nextPath.learningPlanOrderByRoute,
        items: guidedPlan.candidates,
        dataVersion: "guided-experience-d078-v1",
      }) as unknown as Record<string, unknown>
      : undefined;
    const reportWithContext = reportSnapshot ? {
      ...reportSnapshot,
      reportPathContext: {
        academicContext: nextPath.academicContext,
        subjects: nextPath.subjects,
        programme: nextPath.programme,
        programmes: nextPath.programmes,
        university: nextPath.university,
        requirements: nextPath.requirements,
        subjectMatch: nextPath.subjectMatch,
        domains: nextPath.domains,
        subgroups: nextPath.subgroups,
        roles: nextPath.roles,
        learningFocus: sanitizedFocus,
        learningPlanRemovedIds: nextPath.learningPlanRemovedIds,
        learningPlanRemovedIdsByRoute: nextPath.learningPlanRemovedIdsByRoute,
        learningPlanOrderByRoute: nextPath.learningPlanOrderByRoute,
        notes: nextPath.notes,
      },
    } : undefined;
    const history = Array.isArray(nextPath.learningPlanSnapshots) ? nextPath.learningPlanSnapshots : [];
    const pathWithPlan = reportWithContext
      ? {
        ...nextPath,
        learningFocus: sanitizedFocus,
        // The latest editable draft is always available for resuming. Only an
        // explicit Review completion creates an immutable report-history row.
        learningPlanSnapshot: reportWithContext,
        ...(options.completeSnapshot ? {
          learningPlanSnapshots: [...history.filter((entry) => entry.snapshotId !== snapshotId), reportWithContext].slice(-20),
        } : {}),
      }
      : nextPath;
    pathRef.current = pathWithPlan;
    setPath(pathWithPlan);
    // Serialize draft writes so an older network response cannot overwrite a
    // newer multi-selection made immediately afterwards.
    saveQueue.current = saveQueue.current.catch(() => undefined).then(async () => {
      try {
      if (targetStudentId) {
        await provisioningData.saveGuidancePath(targetStudentId, pathWithPlan as Record<string, unknown>);
        if (sequence === saveSequence.current) setNotice("Saved to this student’s guidance path.");
      } else if (sessionOnlyGuidance) {
        if (sequence === saveSequence.current) setNotice("Held for this guidance session.");
      } else {
        const saved = await careerData.saveGuidancePath({ source: "explore", path: pathWithPlan });
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

  const toggleRole = (domain: DomainV2, subgroup: DomainV2["subgroups"][number] | undefined, role: DomainRoleSummary) => {
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
      roles: currentAreaRoleSelections(currentPath.roles ?? [], domains),
      resume: { ...(currentPath.resume ?? {}), stage: "review", status: "complete" },
    }, { completeSnapshot: true });
  };

  const printLearningPlan = () => {
    if (!reviewComplete || saving) {
      setNotice("Complete Review before printing or downloading the learning plan.");
      return;
    }
    void openStudentDocument(reportDocumentPath).then((opened) => {
      if (!opened) setNotice("The report could not be opened. Check your connection and sign-in, then try again.");
    });
  };

  const shareLearningPlan = () => {
    if (!reviewComplete || saving) {
      setNotice("Complete Review before sharing the learning plan.");
      return;
    }
    const routeLabels = guidedPlan.stackSet.stacks.map((stack) => {
        const key = learningPlanRouteKey(stack.route);
        const routeLabel = guidedPlan.routeLabels[key];
        return [routeLabel?.programme, routeLabel?.domain, routeLabel?.area, routeLabel?.role]
          .filter(Boolean)
          .join(" → ");
      }).filter(Boolean).join(" / ");
    const focusNames = guidedPlan.stackSet.stacks.flatMap((stack) => stack.selectedIds
      .map((id) => guidedPlan.candidates.find((candidate) => candidate.id === id)?.name)
      .filter((name): name is string => Boolean(name)));
    setShareInput({ routeLabel: routeLabels, focusNames });
    setShareSheetVisible(true);
  };

  const shareSelectedCopy = (copy: LearningPlanShareCopy) => {
    setShareSheetVisible(false);
    void shareTextSummary(copy.title, copy.message).then((shared) => {
      if (!shared) setNotice("The report could not be shared. You can still print or download it.");
      else setNotice("Your platform-specific message is ready in the share options.");
    });
  };

  const copySelectedShareCopy = (copy: LearningPlanShareCopy) => {
    setShareSheetVisible(false);
    void Clipboard.setStringAsync(copy.message).then(() => {
      setNotice("Platform-specific message copied. Paste it into your social post or email.");
    }).catch(() => {
      setNotice("Could not copy the message. Reopen share options to try again.");
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
           {guidedPlan.stackSet.stacks.length ? <GuidedLearningTray
             stackSet={guidedPlan.stackSet}
              initialMode={params.open_tray === "1" ? "mid" : "icon"}
             dropKey={guidedPlan.selectedIds.join("|")}
             pendingDropLabel={guidedPlan.selectedIds.length ? "Updated learning plan" : null}
             routeLabels={guidedPlan.routeLabels}
             advisoryAreaLabels={guidedPlan.advisoryAreaLabels}
             onRemove={removeLearningFocus}
             onReorder={reorderLearningFocus}
              onSelectCandidate={selectLearningFocus}
             onSelectAlternative={selectAlternative}
             onSave={reportContextReady ? completeReview : undefined}
             onPrint={reviewComplete && !saving ? printLearningPlan : undefined}
             onShare={reviewComplete && !saving ? shareLearningPlan : undefined}
           /> : null}
           <LearningPlanShareSheet
             visible={shareSheetVisible}
             input={shareInput}
             onClose={() => setShareSheetVisible(false)}
             onShare={shareSelectedCopy}
             onCopy={copySelectedShareCopy}
           />
            {displayedStep === "domains" ? <DomainStepRefined colors={colors} domains={domains} selected={selectedDomainIds} primaryId={primaryDomainId} onToggle={toggleDomain} onSetPrimary={setPrimaryDomain} onView={(domain) => exploreNav.domain(router, domain.id, { ...guidanceContext, focused: true }, domain.programmeMatchType)} onNext={() => updateStep(showSubgroupStep ? "subgroups" : "roles")} onBack={() => { if (router.canGoBack()) router.back(); else router.replace("/(tabs)/explore" as never); }} nextLabel={showSubgroupStep ? "Review areas" : "Choose roles"} /> : null}
           {displayedStep === "subgroups" ? <SubgroupStepRefined colors={colors} domains={selectedDomains} primaryId={primaryDomainId} selected={selectedSubgroupIds} onToggle={toggleSubgroup} onView={(domain, subgroup) => exploreNav.subgroup(router, domain.id, subgroup.id, { ...guidanceContext, focused: true })} onNext={() => updateStep("roles")} onBack={() => updateStep("domains")} /> : null}
             {displayedStep === "roles" ? <RoleStepRefined colors={colors} entries={roleEntries} selected={selectedRoleIds} onToggle={toggleRole} onView={(role, areaId) => exploreNav.role(router, role.key, { ...guidanceContext, ...(areaId ? { areaId } : {}), focused: true })} onNext={() => updateStep("review")} onBack={() => updateStep(showSubgroupStep ? "subgroups" : "domains")} /> : null}
            {displayedStep === "review" ? <ReviewStep colors={colors} domains={selectedDomains} primaryId={primaryDomainId} programmeName={String((path.programme as Snapshot | undefined)?.name ?? "")} universityName={String((path.university as Snapshot | undefined)?.name ?? "")} subgroups={selectedSubgroups} roles={selectedRoleSelections} saving={saving} notice={notice} reviewComplete={reviewComplete} canComplete={reportContextReady} onComplete={completeReview} onBack={() => updateStep("roles")} /> : null}
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

  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Now review the areas</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>A domain can contain several areas of work. Choose one or more that you want to understand better.</Text>{domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name}</Text>{domain.subgroups.length ? domain.subgroups.map((subgroup) => <TouchableOpacity key={subgroup.id} onPress={() => onToggle(domain, subgroup)} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{subgroup.description || "View the capabilities, resources and roles connected to this area."}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Selected · View area" : "View area and select"}</Text></View><Feather name={selected.has(subgroup.id) ? "check" : "chevron-right"} size={18} color={colors.accentRole.action} /></TouchableOpacity>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>{domain.id === "D078" ? "No current areas were returned for this field. This response may be incomplete; it does not mean the field has no areas." : "No areas were returned for this field. The available response may be incomplete."}</Text>}</View>)}<ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" disabled={!selected.size} /></View>;
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
    {!selected.size ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>You can continue without choosing an area. We will keep these areas as suggestions, and add area-specific learning only after you choose one.</Text> : null}
    {domains.map((domain) => <View key={domain.id} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{domain.name} <Text style={[styles.relation, { color: colors.textRole.muted }]}>{domain.id === primaryId ? "· Primary route" : "· Secondary route"}</Text></Text>{domain.id !== primaryId && (domain.programmeMatchType === "functional" || domain.programmeMatchType === "adjacent") ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{domain.programmeMatchType === "adjacent" ? "This is a possible direction outside your programme. Read the domain details to see what further learning may be needed." : "This domain uses some ideas from your programme in a different setting. Read the details to see the connection."}</Text> : null}{domain.subgroups.length ? domain.subgroups.map((subgroup) => <View key={subgroup.id} style={[styles.card, { borderColor: selected.has(subgroup.id) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(subgroup.id) ? colors.surface.subtle : colors.surface.raised }]}>
        <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{subgroup.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: subgroup.studentOrientation?.shortIntro, short_intro: subgroup.studentOrientation?.short_intro, whatPeopleDo: subgroup.studentOrientation?.whatPeopleDo || subgroup.studentOrientation?.what_people_do || subgroup.whatPeopleDo, what_people_do: subgroup.studentOrientation?.what_people_do, whatItStudies: subgroup.studentOrientation?.whatItStudies, what_it_studies: subgroup.studentOrientation?.what_it_studies, description: subgroup.description, fallback: "A student-friendly summary is not available yet." })}</Text><EvidenceSummary colors={colors} evidence={subgroup.guidanceEvidence} /><View style={styles.cardActions}><TouchableOpacity onPress={() => onView(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View area</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(subgroup.id) ? "Remove" : "Select area"}</Text></TouchableOpacity></View></View><Feather name={selected.has(subgroup.id) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
      </View>) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>This domain does not use a separate area structure here, so we’ll take you directly to its roles.</Text>}</View>)}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel="Choose roles" />
  </View>;
}

function RoleStepRefined({ colors, entries, selected, onToggle, onView, onNext, onBack }: { colors: ColorPalette; entries: RoleEntry[]; selected: Set<string>; onToggle: (domain: DomainV2, subgroup: DomainV2["subgroups"][number] | undefined, role: DomainRoleSummary) => void; onView: (role: DomainRoleSummary, areaId?: string) => void; onNext: () => void; onBack: () => void }) {
  return <View style={styles.section}>
    <Text style={[styles.heading, { color: colors.textRole.primary }]}>Choose roles along your route</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Choose a role to see the skills, tools, credentials and proof that matter for that route. Select one or more roles for your report. Entry-level roles appear first so you can see a realistic starting point.</Text>
    {!entries.length ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>No area or direct-domain route is selected yet. You can review the portable domain foundation now and return to add an area later.</Text> : null}
    {entries.map(({ domain, subgroup, directOnly }) => {
      const roles: AreaRoleOption[] = subgroup
        ? rolesForArea(domain.id, subgroup, domain.roles)
        : domain.roles.filter((role) => role.guidanceAvailable !== false
          && (directOnly ? domain.id === "D078" ? !(role.areaIds?.length) : !role.subgroupId : true)).sort(compareCareerRoles);
      const tiers = ["entry", "mid", "senior", "unknown"] as const;
      const areaKey = subgroup?.id ?? domain.id;
      return <View key={areaKey} style={styles.group}>
        <Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>{subgroup?.name ?? (directOnly ? `${domain.name} direct roles` : `${domain.name} roles`)}</Text>
        {roles.length ? tiers.map((tier) => {
          const tierRoles = roles.filter((role) => tier === "unknown" ? !role.tier : role.tier === tier);
          if (!tierRoles.length) return null;
           return <View key={`${areaKey}-${tier}`} style={styles.group}>
            <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>{careerRoleTierLabel(tier === "unknown" ? undefined : tier)}</Text>
            {tierRoles.map((role) => {
              const areaRoute = subgroup ? (role.areaRoutes?.find((route) => route.areaId === subgroup.id) ?? (role.areaRouteStatus ? {
                status: role.areaRouteStatus,
                condition: role.areaRouteCondition,
                positiveTaskEvidence: role.areaTaskEvidence,
              } : undefined)) : undefined;
              return <View key={role.key} style={[styles.card, { borderColor: selected.has(role.key) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected.has(role.key) ? colors.surface.subtle : colors.surface.raised }]}>
               <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{role.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: role.studentOrientation?.shortIntro, short_intro: role.studentOrientation?.short_intro, whatPeopleDo: role.studentOrientation?.whatPeopleDo, what_people_do: role.studentOrientation?.what_people_do, whatItStudies: role.studentOrientation?.whatItStudies, what_it_studies: role.studentOrientation?.what_it_studies, description: role.description, fallback: "A student-friendly summary is not available yet." })}</Text>
               {areaRoute?.status === "reviewed_conditional" ? <Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>This role fits this area in a specific context{areaRoute.condition ? `: ${areaRoute.condition}` : "."}</Text> : null}
               <View style={styles.cardActions}><TouchableOpacity onPress={() => onView(role, subgroup?.id)}><Text style={[styles.link, { color: colors.accentRole.action }]}>View more</Text></TouchableOpacity><TouchableOpacity onPress={() => onToggle(domain, subgroup, role)}><Text style={[styles.link, { color: colors.accentRole.action }]}>{selected.has(role.key) ? "Remove" : "Select role"}</Text></TouchableOpacity></View></View><Feather name={selected.has(role.key) ? "check" : "circle"} size={18} color={colors.accentRole.action} />
            </View>;
            })}
          </View>;
        }) : <Text accessibilityLabel={`Role routes not returned for ${subgroup?.name ?? domain.name}`} style={[styles.copy, { color: colors.textRole.muted }]}>No reviewed role routes were returned for this area. This response may be incomplete; it does not mean that no roles fit. You can continue with your selected area and return to roles later.</Text>}
      </View>;
    })}
    <ActionRow colors={colors} onBack={onBack} onNext={onNext} nextLabel={selected.size ? "Review my selections" : "Review domain route"} />
  </View>;
}

function ReviewStep({ colors, domains, primaryId, programmeName, universityName, subgroups, roles, saving, notice, reviewComplete, canComplete, onComplete, onBack }: { colors: ColorPalette; domains: DomainV2[]; primaryId: string; programmeName: string; universityName: string; subgroups: { domain: DomainV2; subgroup: DomainV2["subgroups"][number] }[]; roles: Snapshot[]; saving: boolean; notice: string | null; reviewComplete: boolean; canComplete: boolean; onComplete: () => void; onBack: () => void }) {
  const primary = domains.find((domain) => domain.id === primaryId);
  const secondary = domains.filter((domain) => domain.id !== primaryId);
  const advisoryAreas = subgroups.length ? [] : domains.flatMap((domain) => domain.subgroups.map((subgroup) => `${domain.name} · ${subgroup.name}`));
  return <View style={styles.section}><Text style={[styles.heading, { color: colors.textRole.primary }]}>Review your guidance route</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{reviewComplete ? "Your completed route is ready to become a report. The report keeps the academic context and selected downstream path together." : roles.length ? "Check your primary route, selected areas and roles. Complete this Review step when the route is correct." : "Check your domain route. You can add areas and roles now or complete the review with the domain foundation."}</Text><PrioritySummary colors={colors} /><SummaryList colors={colors} title="Programme" values={programmeName ? [programmeName] : []} /><SummaryList colors={colors} title="University" values={universityName ? [universityName] : []} /><SummaryList colors={colors} title="Primary domain" values={primary ? [primary.name] : []} /><SummaryList colors={colors} title="Secondary domains" values={secondary.map((domain) => `${domain.name} · ${relationLabel(domain.programmeMatchType)}`)} /><SummaryList colors={colors} title="Areas" values={subgroups.map(({ subgroup }) => subgroup.name)} />{advisoryAreas.length ? <View style={[styles.summary, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>Areas you can explore later</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>These are advisory options, not selected requirements. Choose an area before its learning items are added to your plan.</Text>{advisoryAreas.map((area) => <Text key={area} style={[styles.copy, { color: colors.textRole.muted }]}>· {area}</Text>)}</View> : null}<SummaryList colors={colors} title="Roles" values={roles.map((role) => String(role.name ?? "Role"))} /><Text style={[styles.copy, { color: colors.textRole.muted }]}>{saving ? "Saving your draft…" : notice || (reviewComplete ? "Review complete. Print, download and share are now available above." : canComplete ? "Complete Review to unlock the report actions." : "Choose a programme and university before completing Review.")}</Text><ActionRow colors={colors} onBack={onBack} onNext={onComplete} nextLabel={reviewComplete ? "Review complete" : "Complete review"} disabled={reviewComplete || saving || !canComplete} /></View>;
}

function PrioritySummary({ colors }: { colors: ColorPalette }) {
  return <View style={[styles.summary, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
    <Text style={[styles.groupTitle, { color: colors.textRole.primary }]}>How your route is organized</Text>
    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>Your guide connects the programme context to the domain foundation, then to any area or role routes you choose. Each selected area adds its own focus; a role adds optional, role-specific learning.</Text>
    <Text style={[styles.copy, { color: colors.textRole.muted }]}>This broad-to-specific layout does not make every item in an earlier layer a prerequisite for every later one. Only an explicitly reviewed prerequisite for your selected route can constrain the learning order.</Text>
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
