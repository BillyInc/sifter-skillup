/**
 * Shared student/admin programme detail surface.
 *
 * The academic choice is resolved first. Admission information belongs to the
 * requirements/university context; career guidance is the programme-to-domain
 * hand-off. Employment and a standalone Admission tab are deliberately not
 * user-facing concepts here.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  DataSourceBadge,
  DegreeSkills,
  DetailScaffold,
  SectionLabel,
  TextTabs,
  invalidateGuidancePathCache,
} from "@/components/careerIntelligence";
import { careerData, type GuidanceReportPath, type JambProgrammeRequirements, type JambProgrammeSchool } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import { guidanceContextQuery, type GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { provisioningData } from "@/lib/provisioningData";
import { awardLine } from "@/lib/programmeAward";
import { requirementFallbackText, sanitizeRequirementText, type RequirementField } from "@/lib/sanitizeRequirementText";
import { comingSoon, pending, real, type DataState, type DomainLink, type Programme } from "@/types/career";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, type ColorPalette } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export interface ProgrammeDetailRefinedScreenProps {
  programmeId: string;
  /** A JAMB identity selected from admission matching. When present, do not
   * resolve through the broader canonical programme because that can merge
   * several distinct JAMB names and their teaching profiles. */
  jambProgrammeId?: string;
  initialSchoolId?: string;
  userType?: string;
  guidanceStudentId?: string;
  guidanceTarget?: string;
  guidanceEntry?: string;
  viewOnly?: boolean;
  journeyMode?: string;
}

type ProgrammeTab = "overview" | "requirements" | "schools";

function displayRequirement(field: RequirementField, value?: string | null): string {
  const result = sanitizeRequirementText(value ?? null);
  return result.displayable ? result.cleaned : requirementFallbackText(field);
}

function universityRequirementText(school: JambProgrammeSchool, field: RequirementField): string {
  const direct = field === "utme_subjects"
    ? school.universityUtmeSubjects
    : school.universityOlevelRequirement;
  if (direct) return displayRequirement(field, direct);
  const examType = field === "utme_subjects" ? "utme" : "olevel";
  const structured = (school.universityStructuredSubjectRules ?? [])
    .filter((rule) => rule.examType === examType)
    .map((rule) => rule.text || rule.conditionText || (rule.minimumRequired ? "At least " + rule.minimumRequired + " subject option(s)." : null))
    .filter((text): text is string => Boolean(text));
  if (structured.length) return structured.join(" ");
  const exceptions = (school.universityRequirementExceptions ?? [])
    .filter((row) => {
      if (!row.text) return false;
      if (row.examType === examType) return true;
      if (row.examType !== "general") return false;
      const text = row.text.toUpperCase();
      return examType === "utme"
        ? text.includes("UTME")
        : text.includes("O LEVEL") || text.includes("O'LEVEL") || text.includes("SSCE");
    })
    .map((row) => row.text as string);
  if (exceptions.length) return exceptions.join(" ");
  return "No additional university-specific requirement is recorded.";
}

function relationshipCopy(matchType: DomainLink["matchType"]): string {
  switch (matchType) {
    case "direct":
      return "This programme shares core subjects and training foundations with this domain.";
    case "functional":
      return "This programme builds knowledge and skills that can be used in this domain, even when the work is different.";
    case "adjacent":
      return "This is a possible direction outside the programme. Review the domain details to see what further learning may be needed.";
    default:
      return "This domain is connected to the programme through the mapped learning content.";
  }
}

function relationshipLabel(matchType: DomainLink["matchType"]): string {
  return matchType.charAt(0).toUpperCase() + matchType.slice(1) + " connection";
}

function relationshipOrder(matchType: DomainLink["matchType"]): number {
  return matchType === "direct" ? 0 : matchType === "functional" ? 1 : 2;
}

function requirementStatusLabel(status?: string | null): string {
  if (status === "complete") return "Requirements available"
  if (status === "source_missing") return "No additional requirements recorded"
  return "Some requirement details are unavailable"
}

const DOMAIN_CONNECTIONS: DomainLink["matchType"][] = ["direct", "functional", "adjacent"];

function connectionHeading(matchType: DomainLink["matchType"]): string {
  if (matchType === "direct") return "Direct domains";
  if (matchType === "functional") return "Functional domains";
  return "Adjacent domains";
}

function connectionExplanation(matchType: DomainLink["matchType"]): string {
  if (matchType === "direct") return "These are the closest matches to what this programme teaches.";
  if (matchType === "functional") return "These use part of your programme foundation in a different kind of work.";
  return "These are possible directions outside the programme. Review the domain details to see what further learning may be needed.";
}

function ProgrammeDomainTransition({
  domains,
  colors,
  onOpenDomain,
  onContinue,
}: {
  domains: DomainLink[];
  colors: ColorPalette;
  onOpenDomain: (domain: DomainLink) => void;
  onContinue?: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groups = DOMAIN_CONNECTIONS.map((matchType) => ({
    matchType,
    links: domains.filter((link) => link.matchType === matchType),
  })).filter((group) => group.links.length);

  return <View style={styles.block}>
    <SectionLabel>How this programme connects to areas of work</SectionLabel>
    <Text style={[styles.body, { color: colors.textRole.secondary }]}>Start with the closest connections, then explore other directions when you understand the bridge from your programme.</Text>
    {groups.length ? groups.map(({ matchType, links }) => {
      const isExpanded = Boolean(expanded[matchType]);
      const visible = isExpanded ? links : links.slice(0, 3);
      return <View key={matchType} style={styles.connectionGroup}>
        <Text style={[styles.connectionTitle, { color: colors.textRole.primary }]}>{connectionHeading(matchType)} <Text style={[styles.connectionCount, { color: colors.textRole.muted }]}>({links.length})</Text></Text>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{connectionExplanation(matchType)}</Text>
        {visible.map((link) => <TouchableOpacity accessibilityRole="button" key={link.domainId} onPress={() => onOpenDomain(link)} style={[styles.preview, { borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.previewName, { color: colors.textRole.primary }]}>{link.domainName}</Text>
          <Text style={[styles.previewType, { color: colors.accentRole.action }]}>{relationshipLabel(link.matchType)}</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{relationshipCopy(link.matchType)}</Text>
          <Text style={[styles.link, { color: colors.accentRole.action }]}>View domain guidance</Text>
        </TouchableOpacity>)}
        {links.length > 3 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: isExpanded }} onPress={() => setExpanded((current) => ({ ...current, [matchType]: !isExpanded }))} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreButtonText, { color: colors.accentRole.action }]}>{isExpanded ? `Show fewer ${matchType} domains` : `See all ${links.length} ${matchType} domains`}</Text></TouchableOpacity> : null}
      </View>;
    }) : <Text style={[styles.body, { color: colors.textRole.muted }]}>Career connections are not available for this programme yet.</Text>}
    {onContinue && domains.length ? <TouchableOpacity accessibilityRole="button" onPress={onContinue} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}><Text style={styles.primaryText}>Continue</Text></TouchableOpacity> : null}
  </View>;
}

function appendProgrammeChoice(
  path: GuidanceReportPath["path"],
  selection: Partial<GuidanceReportPath["path"]>,
): GuidanceReportPath["path"] {
  const previous = path.programmes?.length
    ? path.programmes
    : path.programme
      ? [{ programme: path.programme, university: path.university, requirements: path.requirements, universityRequirements: path.universityRequirements }]
      : [];
  const programme = selection.programme ?? {};
  const university = selection.university ?? {};
  const programmeId = String(programme.id ?? "");
  const universityId = String(university.id ?? "");
  const next = previous.filter((choice) => {
    const savedProgramme = (choice.programme ?? {}) as Record<string, unknown>;
    const savedUniversity = (choice.university ?? {}) as Record<string, unknown>;
    return String(savedProgramme.id ?? "") !== programmeId || String(savedUniversity.id ?? "") !== universityId;
  });
  return {
    ...path,
    ...selection,
    programmes: [...next, { programme, university, requirements: selection.requirements ?? {}, universityRequirements: selection.universityRequirements ?? {} }],
  };
}

export default function ProgrammeDetailRefinedScreen({ programmeId, jambProgrammeId, initialSchoolId, userType, guidanceStudentId, guidanceTarget, guidanceEntry, viewOnly, journeyMode }: ProgrammeDetailRefinedScreenProps) {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ focus?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; view_only?: string | string[]; journey_mode?: string | string[] }>();
  const focusedGuidance = (Array.isArray(routeParams.focus) ? routeParams.focus[0] : routeParams.focus) === "guidance";
  const routeViewOnly = (Array.isArray(routeParams.view_only) ? routeParams.view_only[0] : routeParams.view_only) === "1";
  const isViewOnly = Boolean(viewOnly || routeViewOnly);
  const activeJourneyMode = journeyMode || (Array.isArray(routeParams.journey_mode) ? routeParams.journey_mode[0] : routeParams.journey_mode) || "";
  const activeGuidanceTarget = guidanceTarget || (Array.isArray(routeParams.guidance_target) ? routeParams.guidance_target[0] : routeParams.guidance_target) || undefined;
  const activeGuidanceEntry = guidanceEntry || (Array.isArray(routeParams.guidance_entry) ? routeParams.guidance_entry[0] : routeParams.guidance_entry) || undefined;
  const universityOptionsOnly = activeJourneyMode === "universities_only";
  const undergraduateContext = userType === "student" || activeJourneyMode === "undergraduate_career" || activeJourneyMode === "undergraduate_programmes";
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const [tab, setTab] = useState<ProgrammeTab>("overview");
  const [state, setState] = useState<DataState<Programme>>(() => pending("Loading programme details..."));
  const [schools, setSchools] = useState<JambProgrammeSchool[]>([]);
  const [requirements, setRequirements] = useState<JambProgrammeRequirements | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingSchool, setSavingSchool] = useState<string | null>(null);

  const loadProgramme = useCallback(() => {
    setState(pending("Loading programme details..."));
    let active = true;
    void (async () => {
      if (jambProgrammeId) {
        const [detail, domainState, schoolRows] = await Promise.all([
          careerData.getJambProgramme(jambProgrammeId),
          careerData.getJambProgrammeDomains(jambProgrammeId),
          careerData.getJambProgrammeSchools(jambProgrammeId),
        ]);
        if (!active) return;
        if (detail.status !== "real" || !detail.data) {
          setState(comingSoon(detail.meta?.notice ?? "Programme details are not available yet."));
          return;
        }
        const variant = detail.data;
        const variantDomains = domainState.status === "real" && domainState.data
          ? domainState.data.domains
          : [];
        const variantProgramme: Programme = {
          id: jambProgrammeId,
          name: variant.jambName || variant.studentName || "Programme",
          displayName: variant.studentName || variant.jambName,
          studentName: variant.studentName || variant.jambName,
          studentNames: [variant.studentName || variant.jambName].filter(Boolean) as string[],
          institutionType: "university",
          discipline: variant.jambFaculty || "",
          qualification: variant.degreeType || undefined,
          // A JAMB variant must use its own source-backed skills profile. Do
          // not borrow the canonical programme description, which may be an
          // aggregate of several JAMB identities.
          overview: null,
          skillsTechnical: variant.skillsTechnical,
          skillsTransferable: variant.skillsTransferable,
          skillsCount: variant.skillsCount,
          domains: variantDomains,
        };
        setState(real(variantProgramme, detail.meta));
        setRequirements(variant.requirements ?? null);
        const nextSchools = schoolRows.status === "real" || schoolRows.status === "fallback"
          ? schoolRows.data ?? []
          : [];
        setSchools(nextSchools);
        if (initialSchoolId && nextSchools.some((school) => school.schoolId === initialSchoolId)) {
          setSelectedSchoolId(initialSchoolId);
        }
        return;
      }

      const result = await careerData.getProgramme(programmeId);
      if (!active) return;
      setState(result);
      if (result.status !== "real" || !result.data) return;
      const search = await careerData.searchJambProgrammes(result.data.name);
      const first = search.status === "real" ? search.data?.[0] : undefined;
      if (!first) return;
      const [detail, schoolRows] = await Promise.all([
        careerData.getJambProgramme(first.jambProgrammeId),
        careerData.getJambProgrammeSchools(first.jambProgrammeId),
      ]);
      if (!active) return;
      setRequirements(detail.status === "real" ? detail.data?.requirements ?? null : null);
      const nextSchools = schoolRows.status === "real" || schoolRows.status === "fallback" ? schoolRows.data ?? [] : [];
      setSchools(nextSchools);
      if (initialSchoolId && nextSchools.some((school) => school.schoolId === initialSchoolId)) {
        setSelectedSchoolId(initialSchoolId);
      }
    })();
    return () => { active = false; };
  }, [initialSchoolId, jambProgrammeId, programmeId]);

  useEffect(() => loadProgramme(), [loadProgramme]);

  const programme = state.data;
  const activeProgrammeId = jambProgrammeId || programmeId;
  const programmeName = programme?.studentName
    ?? programme?.studentNames?.[0]
    ?? programme?.name
    ?? (state.status === "pending" ? "Loading programme…" : "Programme");
  const visibleSchools = useMemo(
    () => schools,
    [schools],
  );
  const selectedSchool = visibleSchools.find((school) => school.schoolId === selectedSchoolId) ?? null;
  const guidanceContext: GuidanceRouteContext = {
    programmeId: activeProgrammeId,
    jambProgrammeId,
    schoolId: selectedSchoolId ?? undefined,
    userType,
    journeyMode: activeJourneyMode || undefined,
    guidanceTarget: activeGuidanceTarget,
    guidanceStudentId,
    entryPath: activeGuidanceEntry,
    focused: focusedGuidance,
  };
  const sessionOnlyGuidance = Boolean(
    activeGuidanceTarget && activeGuidanceTarget !== "authorised_student",
  );

  const backToProgrammeChoices = () => {
    if (!focusedGuidance) {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/explore" as never);
      return;
    }
    const backContext = guidanceContextQuery({
      ...guidanceContext,
      schoolId: undefined,
      resumeStage: "programme_preview",
      focused: true,
    });
    const base = activeGuidanceTarget
      ? "/(admin)/workspace-explore/admission"
      : "/(tabs)/explore/admission";
    const admin = activeGuidanceTarget ? "&admin=1" : "";
    router.replace(
      `${base}?mode=programme&q=${encodeURIComponent(programmeName)}${admin}${backContext ? `&${backContext}` : ""}` as never,
    );
  };

  const selectSchool = async (school: JambProgrammeSchool) => {
    if (!programme || savingSchool) return;
    setSavingSchool(school.schoolId);
    setNotice(null);
    // The university details came from the live offering response. Show them
    // immediately; saving a guidance checkpoint must never hide requirements
    // that the student has already selected to inspect.
    setSelectedSchoolId(school.schoolId);
    // The university-aware programme overview is the next step. Requirements
    // become available from that view only after a university is opened.
    setTab("overview");
    // Early-secondary users are exploring university offerings. Do not turn
    // opening a school card into a saved commitment or onboarding completion.
    if (isViewOnly || (userType === "senior_secondary" && !guidanceStudentId)) {
      setNotice(`${school.schoolName} is being viewed. This choice is not saved until the relevant requirements are confirmed.`);
      setSavingSchool(null);
      return;
    }
    try {
      let existingPath: GuidanceReportPath["path"] = {};
      if (guidanceStudentId) {
        existingPath = (await provisioningData.getGuidancePath(guidanceStudentId))?.path ?? {};
      } else {
        const current = await careerData.getGuidancePath();
        existingPath = current.status === "real" && current.data ? current.data.path : {};
      }
      const nextPath = appendProgrammeChoice(existingPath, {
        programme: { id: activeProgrammeId, name: school.studentName ?? school.jambName ?? programmeName, sourceName: school.jambName ?? programmeName },
        university: { id: school.schoolId, name: school.schoolName, address: school.address ?? null },
        requirements: (requirements ?? {}) as Record<string, unknown>,
        universityRequirements: {
          utmeSubjects: school.universityUtmeSubjects ?? null,
          olevelRequirement: school.universityOlevelRequirement ?? null,
          note: school.universityNote ?? null,
          requiresReview: Boolean(school.hasUniversityException),
        },
      });
      let saved = false;
      let saveNotice: string | undefined;
      if (guidanceStudentId) {
        await provisioningData.saveGuidancePath(guidanceStudentId, nextPath);
        saved = true;
      } else if (!sessionOnlyGuidance) {
        const response = await careerData.saveGuidancePath({ source: "explore", path: nextPath });
        saved = response.status === "real";
        saveNotice = response.meta?.notice;
      }
      if (saved) {
        invalidateGuidancePathCache();
      const exceptionText = school.universityNote
        || school.universityRequirementExceptions?.find((row) => row.text)?.text;
      setNotice(exceptionText
          ? `${school.schoolName}: ${exceptionText}`
          : `${school.schoolName} is saved in your guidance path.`);
      } else {
        setNotice(saveNotice ?? "Create an account to save this guidance path.");
      }
    } catch {
      setNotice("We could not save this university right now. You can still review its details.");
    } finally {
      setSavingSchool(null);
    }
  };

  const header = (
      <TextTabs
      value={tab}
      onChange={setTab}
       tabs={[
         { value: "overview", label: "Overview" },
         ...(selectedSchoolId ? [{ value: "requirements" as ProgrammeTab, label: "Requirements" }] : []),
         { value: "schools", label: "Universities" },
       ]}
      style={styles.tabs}
    />
  );

  return (
    <DetailScaffold
      eyebrow="PROGRAMME"
    title={programmeName}
      backLabel="Back to programme choices"
      onBack={backToProgrammeChoices}
       save={focusedGuidance || isViewOnly ? undefined : { entityType: "programme", entityId: activeProgrammeId }}
      pdf
      pdfPath={guidanceStudentId ? `/api/provisioning/students/${encodeURIComponent(guidanceStudentId)}/report.html` : "/api/student/report.html"}
       state={state}
      onRetry={loadProgramme}
      header={header}
      requiresAccountForDetails
      guestDescription={programme?.overview}
    >
      {(data) => (
        <ProgrammeDetailBody
          data={data}
          tab={tab}
          programmeName={programmeName}
          requirements={requirements}
          schools={visibleSchools}
          selectedSchool={selectedSchool}
          selectedSchoolId={selectedSchoolId}
          onSetTab={setTab}
           earlySecondary={userType === "senior_secondary"}
           undergraduateContext={undergraduateContext}
          notice={notice}
          savingSchool={savingSchool}
          onSelectSchool={selectSchool}
           onContinueCareer={() => {
            exploreNav.domainGuidance(router, {
              programmeId: activeProgrammeId,
              jambProgrammeId,
              schoolId: selectedSchoolId ?? undefined,
              userType,
              guidanceStudentId,
              journeyMode: activeJourneyMode || undefined,
              entryPath: activeGuidanceEntry,
              resumeStage: "domains",
              focused: focusedGuidance,
            });
          }}
          onChooseSchool={() => setTab("schools")}
           guidanceStudentId={guidanceStudentId}
           guidanceContext={guidanceContext}
           router={router}
            colors={colors}
            focusedGuidance={focusedGuidance}
            viewOnly={isViewOnly}
            showCareerGuidance={!universityOptionsOnly}
          />
      )}
    </DetailScaffold>
  );
}

function ProgrammeDetailBody({
  data,
  tab,
  programmeName,
  requirements,
  schools,
  selectedSchool,
  selectedSchoolId,
  onSetTab,
  earlySecondary,
  undergraduateContext,
  notice,
  savingSchool,
  onSelectSchool,
  onContinueCareer,
  onChooseSchool,
  guidanceStudentId,
  guidanceContext,
  router,
  colors,
  focusedGuidance,
  viewOnly,
  showCareerGuidance,
}: {
  data: Programme;
  tab: ProgrammeTab;
  programmeName: string;
  requirements: JambProgrammeRequirements | null;
  schools: JambProgrammeSchool[];
  selectedSchool: JambProgrammeSchool | null;
  selectedSchoolId: string | null;
  onSetTab: (tab: ProgrammeTab) => void;
  earlySecondary: boolean;
  undergraduateContext: boolean;
  notice: string | null;
  savingSchool: string | null;
  onSelectSchool: (school: JambProgrammeSchool) => void;
  onContinueCareer: () => void;
  onChooseSchool: () => void;
  guidanceStudentId?: string;
  guidanceContext: GuidanceRouteContext;
  router: Router;
  colors: ColorPalette;
  focusedGuidance: boolean;
  viewOnly: boolean;
  showCareerGuidance: boolean;
}) {
  const exploreNav = useExploreNav();
  const resp = useResponsive();
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const requirementCards = [
    { label: "UTME subjects", icon: "edit-3" as const, field: "utme_subjects" as RequirementField, value: requirements?.utmeSubjects },
    { label: "O-Level requirements", icon: "book" as const, field: "olevel_requirement" as RequirementField, value: requirements?.olevelRequirement },
  ];
  const universityRequirementCards = selectedSchool ? [
    { label: "This university's UTME subjects", icon: "edit-3" as const, field: "utme_subjects" as RequirementField, value: universityRequirementText(selectedSchool, "utme_subjects") },
    { label: "This university's O-level requirements", icon: "book" as const, field: "olevel_requirement" as RequirementField, value: universityRequirementText(selectedSchool, "olevel_requirement") },
  ] : [];
  const orderedDomains = [...(data.domains ?? [])].sort(
    (a, b) => relationshipOrder(a.matchType) - relationshipOrder(b.matchType),
  );

  return (
    <View style={styles.content}>
      {tab === "overview" ? (
        <View style={styles.section}>
          {awardLine(programmeName, data.qualification, data.durationYears) ? (
            <Text style={[styles.award, { color: colors.textRole.secondary }]}>{awardLine(programmeName, data.qualification, data.durationYears)}</Text>
          ) : null}
          {!selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <SectionLabel>Programme preview</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>This is the national programme identity. Choose a university below to see the version offered there, what you will study, its requirements and the connected career guidance.</Text>
            </View>
          ) : null}
          {selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.contextLabel, { color: colors.textRole.muted }]}>University offering</Text>
              <Text style={[styles.contextName, { color: colors.textRole.primary }]}>{selectedSchool.schoolName}</Text>
              {selectedSchool.address ? <Text style={[styles.contextAddress, { color: colors.textRole.secondary }]}>{selectedSchool.address}</Text> : null}
              <View style={styles.contextActions}>
                <TouchableOpacity accessibilityRole="button" onPress={() => onSetTab("requirements")} style={styles.inlineAction}>
                  <Text style={[styles.link, { color: colors.accentRole.action }]}>View this university&apos;s requirements</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={onChooseSchool} style={styles.inlineAction}>
                  <Text style={[styles.link, { color: colors.textRole.muted }]}>Change university</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {!selectedSchool && schools.length ? (
            <View style={styles.block}>
              <SectionLabel>Universities offering this programme</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>Choose a university to open its address, programme details and requirements. The programme stays the same; the university-specific information changes.</Text>
              <View style={resp.isDesktop ? styles.schoolGrid : styles.schoolList}>
                {schools.slice(0, 6).map((school) => (
                  <View key={school.schoolId} style={[styles.school, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                    <View style={styles.schoolCopy}>
                      <Text style={[styles.schoolName, { color: colors.textRole.primary }]}>{school.schoolName}</Text>
                      {school.address ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{school.address}</Text> : <Text style={[styles.meta, { color: colors.textRole.muted }]}>Address not recorded</Text>}
                    </View>
                    <TouchableOpacity onPress={() => onSelectSchool(school)} style={[styles.secondaryButton, { borderColor: colors.borderRole.subtle }]}>
                      <Text style={[styles.secondaryText, { color: colors.textRole.primary }]}>{savingSchool === school.schoolId ? "Opening..." : "View university"}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              {schools.length > 6 ? <TouchableOpacity accessibilityRole="button" onPress={() => onSetTab("schools")} style={styles.inlineAction}><Text style={[styles.link, { color: colors.accentRole.action }]}>See all {schools.length} universities</Text></TouchableOpacity> : null}
            </View>
          ) : null}
          {selectedSchool && data.overview ? (
            <View style={styles.block}>
              <SectionLabel>What this programme is about</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{data.overview}</Text>
            </View>
          ) : null}
          {selectedSchool ? <>
            <DegreeSkills technical={data.skillsTechnical} transferable={data.skillsTransferable} total={data.skillsCount} />
            {data.skillsCount ? <DataSourceBadge verification="verified" source="CCMAS/JAMB learning outcomes" /> : null}
          </> : null}
           {selectedSchool ? (
              <View style={styles.block}>
                 {undergraduateContext ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>This is your current programme. Follow what it teaches into the domains, subgroups, roles, skills, tools, and certifications that can help you plan what to learn next.</Text> : null}
                {viewOnly ? <Text style={[styles.body, { color: colors.textRole.muted }]}>This is a review-only route because subject fit has not been confirmed. You can inspect the programme and requirements while keeping your current choices unchanged.</Text> : null}
              {showCareerGuidance ? <ProgrammeDomainTransition domains={orderedDomains} colors={colors} onOpenDomain={(link) => exploreNav.domain(router, link.domainId, guidanceContext)} onContinue={onContinueCareer} /> : <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><SectionLabel>University options review</SectionLabel><Text style={[styles.body, { color: colors.textRole.secondary }]}>You have reviewed this university offering and its requirements. Career guidance is not part of this session mode.</Text><TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}><Text style={styles.primaryText}>Change university</Text></TouchableOpacity></View>}
             </View>
           ) : (
             <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
               <SectionLabel>Choose a university before domain guidance</SectionLabel>
               <Text style={[styles.body, { color: colors.textRole.secondary }]}>Review the universities offering this programme, choose one, and then continue to the domains, subgroups and roles connected to that university-aware programme.</Text>
               <TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
                 <Text style={styles.primaryText}>Choose a university</Text>
               </TouchableOpacity>
             </View>
           )}
        </View>
      ) : null}

      {tab === "requirements" ? (
        <View style={styles.section}>
          {!selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <SectionLabel>Choose a university first</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>The national and university-specific requirements will appear after you choose and open a university offering. This prevents requirements from one university being confused with another.</Text>
              <TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
                <Text style={styles.primaryText}>Choose a university</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.block, { marginTop: Spacing.md }]}>
              <SectionLabel>National programme requirements</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>These requirements belong to the selected JAMB programme. The university details below are specific to {selectedSchool.schoolName}.</Text>
              <Text style={[styles.meta, { color: requirements?.requirementStatus === "complete" ? colors.accentRole.success : colors.accentRole.action }]}>
                {requirementStatusLabel(requirements?.requirementStatus)}{requirements?.requirementStatus === "review_only" ? " — shown for reference, not used as a confirmed eligibility rule" : ""}
              </Text>
              {requirementCards.map((card) => (
                <View key={card.field} style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <View style={styles.requirementTitle}>
                    <Feather name={card.icon} size={14} color={colors.accentRole.action} />
                    <Text style={[styles.label, { color: colors.textRole.primary }]}>{card.label}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayRequirement(card.field, card.value)}</Text>
                </View>
              ))}
              <DataSourceBadge verification="inferred" source="JAMB brochure" style={{ alignSelf: "flex-start" }} />
              <SectionLabel>This university&apos;s requirements</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>
                These details belong only to {selectedSchool.schoolName}. They do not replace the national programme requirements above.
              </Text>
              <Text style={[styles.meta, { color: selectedSchool.universityRequirementStatus === "complete" ? colors.accentRole.success : colors.accentRole.action }]}>
                {requirementStatusLabel(selectedSchool.universityRequirementStatus)}{selectedSchool.universityRequirementNotice ? ` — ${selectedSchool.universityRequirementNotice}` : ""}
              </Text>
              {universityRequirementCards.map((card) => (
                <View key={card.field} style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <View style={styles.requirementTitle}>
                    <Feather name={card.icon} size={14} color={colors.accentRole.action} />
                    <Text style={[styles.label, { color: colors.textRole.primary }]}>{card.label}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>
                    {card.value}
                  </Text>
                </View>
              ))}
              {selectedSchool.universityStructuredSubjectRules?.length ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.label, { color: colors.textRole.primary }]}>Structured university subject rules</Text>
                  {selectedSchool.universityStructuredSubjectRules.map((rule, index) => (
                    <View key={`${rule.examType ?? "rule"}-${index}`} style={{ marginTop: Spacing.sm }}>
                      <Text style={[styles.meta, { color: colors.accentRole.action }]}>
                        {(rule.examType ?? "Admission").toUpperCase()}{rule.scope ? ` · ${rule.scope}` : ""}
                      </Text>
                      <Text style={[styles.body, { color: colors.textRole.secondary }]}>
                        {rule.text || rule.conditionText || (rule.minimumRequired ? `At least ${rule.minimumRequired} subject option(s).` : "A structured rule is recorded for this offering.")}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {selectedSchool.universityNote ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.label, { color: colors.textRole.primary }]}>Additional university note</Text>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{selectedSchool.universityNote}</Text>
                </View>
              ) : null}
              {selectedSchool.address ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.label, { color: colors.textRole.primary }]}>University address</Text>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{selectedSchool.address}</Text>
                </View>
              ) : null}
              {(requirements?.sourceEvidence?.some((source) => source.layer !== "direct_entry") || selectedSchool.universityRequirementExceptions?.some((row) => row.text)) ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: evidenceOpen }} onPress={() => setEvidenceOpen((open) => !open)}>
                    <Text style={[styles.label, { color: colors.accentRole.action }]}>{evidenceOpen ? "Hide source evidence" : "View source evidence"}</Text>
                  </TouchableOpacity>
                  {evidenceOpen ? (
                    <View style={{ gap: Spacing.sm }}>
                      {(requirements?.sourceEvidence ?? []).filter((source) => source.layer !== "direct_entry").map((source, index) => (
                        <View key={`${source.layer ?? "source"}-${source.page ?? ""}-${index}`}>
                          <Text style={[styles.meta, { color: colors.textRole.muted }]}>
                            {(source.layer ?? "source").toUpperCase()} · {source.sourceFile ?? "Source file not recorded"}{source.page ? ` · page ${source.page}` : ""}
                          </Text>
                          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{source.text || source.resolution || "The source location is recorded, but its text is not available."}</Text>
                        </View>
                      ))}
                      {(selectedSchool.universityRequirementExceptions ?? []).filter((row) => row.text).map((row, index) => (
                        <View key={`university-source-${index}`}>
                          <Text style={[styles.meta, { color: colors.textRole.muted }]}>{(row.examType ?? "university").toUpperCase()} source note{row.parseStatus === "needs_review" ? " · needs confirmation" : ""}</Text>
                          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{row.text}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
              {selectedSchool.hasUniversityException && !selectedSchool.universityNote && !selectedSchool.universityRequirementExceptions?.some((row) => row.text) ? (
                <Text style={[styles.body, { color: colors.textRole.muted }]}>Some university-specific wording may still need confirmation. Check the university&apos;s current admission notice before applying.</Text>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {tab === "schools" ? (
        <View style={styles.section}>
          <SectionLabel>{`${earlySecondary ? "Explore universities offering this programme" : "Universities offering this programme"}${schools.length ? ` (${schools.length})` : ""}`}</SectionLabel>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{earlySecondary ? "Open a university to view its requirements and admission notes. This is exploratory and does not commit you to that university." : "Choose one university to keep its programme name, address and requirements in your guidance path."}</Text>
          <View style={resp.isDesktop ? styles.schoolGrid : styles.schoolList}>
            {schools.map((school) => (
              <View key={school.schoolId} style={[styles.school, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                <View style={styles.schoolCopy}>
                  <Text style={[styles.schoolName, { color: colors.textRole.primary }]}>{school.schoolName}</Text>
                  {school.studentName || school.jambName ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{school.studentName ?? school.jambName}</Text> : null}
                  {school.address ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{school.address}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => onSelectSchool(school)} style={[styles.secondaryButton, { borderColor: selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.borderRole.subtle }]}>
                  <Text style={[styles.secondaryText, { color: selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.textRole.primary }]}>{savingSchool === school.schoolId ? "Opening..." : selectedSchoolId === school.schoolId ? (earlySecondary ? "Viewing" : "Selected") : (earlySecondary ? "View details" : "Choose")}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          {!schools.length ? <Text style={[styles.body, { color: colors.textRole.muted }]}>No university offering is available for this programme yet.</Text> : null}
          {notice ? <Text style={[styles.notice, { color: colors.textRole.secondary }]}>{notice}</Text> : null}
        </View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { marginTop: Spacing.md },
  content: { gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.md },
  block: { gap: Spacing.sm },
  award: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  context: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: 3 },
  contextLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.7 },
  contextName: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  contextAddress: { fontSize: FontSize.sm },
  inlineAction: { alignSelf: "flex-start", marginTop: Spacing.xs },
  contextActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  preview: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: 4 },
  previewName: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  previewType: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  connectionGroup: { gap: Spacing.sm },
  connectionTitle: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  connectionCount: { fontSize: FontSize.sm },
  moreButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreButtonText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  primaryButton: { alignSelf: "flex-start", borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  primaryText: { color: "#fff", fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  requirement: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  requirementTitle: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  label: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  schoolList: { gap: Spacing.sm },
  schoolGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  school: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, flex: 1, minWidth: 260 },
  schoolCopy: { flex: 1, gap: 3 },
  schoolName: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  secondaryButton: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 7 },
  secondaryText: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  notice: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  link: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
});
