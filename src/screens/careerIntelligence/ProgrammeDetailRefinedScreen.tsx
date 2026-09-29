/**
 * Shared student/admin programme detail surface.
 *
 * The academic choice is resolved first. Admission information belongs to the
 * requirements/university context; career guidance is the programme-to-domain
 * hand-off. Employment and a standalone Admission tab are deliberately not
 * user-facing concepts here.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  DataSourceBadge,
  ContextualItemList,
  DegreeSkills,
  DetailScaffold,
  SectionLabel,
  TextTabs,
  invalidateGuidancePathCache,
} from "@/components/careerIntelligence";
import { careerData, type GuidanceReportPath, type JambProgrammeRequirements, type JambProgrammeSchool } from "@/lib/careerData";
import { ADMIN_EXPLORE_BASE, useExploreNav } from "@/lib/exploreNav";
import { type GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { provisioningData } from "@/lib/provisioningData";
import { awardLine } from "@/lib/programmeAward";
import { studentSummary } from "@/lib/careerLabels";
import { hasStudentDisplayableProgrammeLearning, programmePreviewExplanation, programmePreviewUnavailableMessage } from "@/lib/programmePreview";
import { sanitizeRequirementText, type RequirementField } from "@/lib/sanitizeRequirementText";
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
  if (result.displayable) return result.cleaned;
  if (field === "utme_subjects") return "No verified UTME subject requirement is recorded for this programme yet.";
  if (field === "olevel_requirement") return "No verified O-Level requirement is recorded for this programme yet.";
  return "No verified Direct Entry requirement is recorded for this programme yet.";
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

function universitySubjectPoolText(school: JambProgrammeSchool, examType: "utme" | "olevel"): string | null {
  const pools = (school.universityStructuredSubjectRules ?? [])
    .filter((rule) => rule.examType === examType && rule.subjectPool?.length)
    .map((rule) => rule.subjectPool ?? [])
    .flat();
  const uniquePools = Array.from(new Set(pools.map((subject) => subject.trim()).filter(Boolean)));
  return uniquePools.length ? `When the rule says choose from a subject group, the recorded options are: ${uniquePools.join(", ")}.` : null;
}

function relationshipCopy(link: DomainLink): string {
  if (link.explanation?.trim()) return link.explanation.trim();
  const anchorNames = (link.courseAnchors ?? []).slice(0, 2).map((anchor) => anchor.title).filter(Boolean);
  const anchorText = anchorNames.length ? ` Your programme records this through ${anchorNames.join(" and ")}.` : "";
  switch (link.matchType) {
    case "direct":
      return `This programme teaches ideas and ways of working that are closely used in ${link.domainName}.${anchorText}`;
    case "functional":
      return `Some of what you learn here can be used in ${link.domainName}, even though the work is different.${anchorText}`;
    case "adjacent":
      return `This is a related direction near ${link.domainName}, but you may need extra learning before moving into it.${anchorText}`;
    default:
      return `This area is connected to the programme through its recorded learning content.${anchorText}`;
  }
}

function institutionLabel(school: JambProgrammeSchool): string {
  const full = school.officialName?.trim();
  const short = school.shortName?.trim();
  const stored = school.schoolName?.trim() || "University";
  if (full && short && full.toLowerCase() !== short.toLowerCase()) return `${full} (${short})`;
  return full || stored;
}

function institutionLocation(school: JambProgrammeSchool): string | null {
  return school.address?.trim() || [school.city, school.state, school.country].filter(Boolean).join(", ").trim() || null;
}

function relationshipLabel(matchType: DomainLink["matchType"]): string {
  if (matchType === "direct") return "Primary connection";
  if (matchType === "functional") return "Related application";
  return "Nearby direction";
}

function relationshipOrder(matchType: DomainLink["matchType"]): number {
  return matchType === "direct" ? 0 : matchType === "functional" ? 1 : 2;
}

const DOMAIN_CONNECTIONS: DomainLink["matchType"][] = ["direct", "functional", "adjacent"];

function connectionHeading(matchType: DomainLink["matchType"]): string {
  if (matchType === "direct") return "Closest matches";
  if (matchType === "functional") return "Useful foundations";
  return "Possible next directions";
}

function connectionGroupLabel(matchType: DomainLink["matchType"]): string {
  if (matchType === "direct") return "closest matches";
  if (matchType === "functional") return "related applications";
  return "nearby directions";
}

function connectionExplanation(matchType: DomainLink["matchType"]): string {
  if (matchType === "direct") return "The programme covers a substantial part of the foundation used in this area.";
  if (matchType === "functional") return "Some knowledge and ways of working transfer here, but the field has its own foundation to learn.";
  return "The programme gives you a starting point, but a larger bridge may be needed before specialising.";
}

function ProgrammeDomainTransition({
  domains,
  colors,
  onOpenDomain,
}: {
  domains: DomainLink[];
  colors: ColorPalette;
  onOpenDomain: (domain: DomainLink) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groups = DOMAIN_CONNECTIONS.map((matchType) => ({
    matchType,
    links: domains.filter((link) => link.matchType === matchType),
  })).filter((group) => group.links.length);

  return <View style={styles.block}>
    <SectionLabel>Where this programme can lead</SectionLabel>
    <Text style={[styles.body, { color: colors.textRole.secondary }]}>These groups show how your programme relates to each field. They describe the curriculum link; they do not mean you already have every skill or are ready for a role.</Text>
    {groups.length ? groups.map(({ matchType, links }) => {
      const isExpanded = Boolean(expanded[matchType]);
      const visible = isExpanded ? links : links.slice(0, 3);
      return <View key={matchType} style={styles.connectionGroup}>
        <Text style={[styles.connectionTitle, { color: colors.textRole.primary }]}>{connectionHeading(matchType)} <Text style={[styles.connectionCount, { color: colors.textRole.muted }]}>({links.length})</Text></Text>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{connectionExplanation(matchType)}</Text>
        <View style={styles.connectionGrid}>
          {visible.map((link) => <TouchableOpacity accessibilityRole="button" key={link.domainId} onPress={() => onOpenDomain(link)} style={[styles.preview, { borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.previewName, { color: colors.textRole.primary }]}>{link.domainName}</Text>
            <Text style={[styles.previewType, { color: colors.accentRole.action }]}>{relationshipLabel(link.matchType)}</Text>
            {link.domainDescription ? <Text numberOfLines={3} style={[styles.body, { color: colors.textRole.secondary }]}>{link.domainDescription}</Text> : null}
            <Text style={[styles.meta, { color: colors.textRole.muted }]}>How your programme connects</Text>
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>{studentSummary({ shortIntro: link.explanation, fallback: relationshipCopy(link) })}</Text>
            {link.courseAnchors?.length ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>Recorded through {link.courseAnchors.slice(0, 2).map((anchor) => anchor.title).join(" and ")}{link.courseAnchors.length > 2 ? " and other course evidence" : ""}.</Text> : null}
            <Text style={[styles.link, { color: colors.accentRole.action }]}>Open domain</Text>
          </TouchableOpacity>)}
        </View>
        {links.length > 3 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: isExpanded }} onPress={() => setExpanded((current) => ({ ...current, [matchType]: !isExpanded }))} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreButtonText, { color: colors.accentRole.action }]}>{isExpanded ? `Show fewer ${connectionGroupLabel(matchType)}` : `See all ${links.length} ${connectionGroupLabel(matchType)}`}</Text></TouchableOpacity> : null}
      </View>;
    }) : <Text style={[styles.body, { color: colors.textRole.muted }]}>Career connections are not available for this programme yet.</Text>}
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
    const sameProgramme = String(savedProgramme.id ?? "") === programmeId;
    const sameUniversity = String(savedUniversity.id ?? "") === universityId;
    const savedIsPlaceholder = !String(savedUniversity.id ?? "");
    return !(sameProgramme && (sameUniversity || (savedIsPlaceholder && universityId)));
  });
  return {
    ...path,
    ...selection,
    programmes: [...next, { programme, university, requirements: selection.requirements ?? {}, universityRequirements: selection.universityRequirements ?? {} }],
  };
}

export default function ProgrammeDetailRefinedScreen({ programmeId, jambProgrammeId, initialSchoolId, userType, guidanceStudentId, guidanceTarget, guidanceEntry, viewOnly, journeyMode }: ProgrammeDetailRefinedScreenProps) {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ focus?: string | string[]; guidance_target?: string | string[]; guidance_entry?: string | string[]; view_only?: string | string[]; journey_mode?: string | string[]; resume?: string | string[]; user_type?: string | string[]; class_name?: string | string[]; stream?: string | string[] }>();
  const routeUserType = Array.isArray(routeParams.user_type) ? routeParams.user_type[0] : routeParams.user_type;
  const activeUserType = userType || routeUserType;
  const routeClassName = Array.isArray(routeParams.class_name) ? routeParams.class_name[0] : routeParams.class_name;
  const routeStream = Array.isArray(routeParams.stream) ? routeParams.stream[0] : routeParams.stream;
  const earlySecondary = activeUserType === "senior_secondary" && (!routeClassName || routeClassName === "ss1" || routeClassName === "ss2");
  const focusedGuidance = (Array.isArray(routeParams.focus) ? routeParams.focus[0] : routeParams.focus) === "guidance";
  const routeViewOnly = (Array.isArray(routeParams.view_only) ? routeParams.view_only[0] : routeParams.view_only) === "1";
  const isViewOnly = Boolean(viewOnly || routeViewOnly);
  const activeJourneyMode = journeyMode || (Array.isArray(routeParams.journey_mode) ? routeParams.journey_mode[0] : routeParams.journey_mode) || "";
  const activeGuidanceTarget = guidanceTarget || (Array.isArray(routeParams.guidance_target) ? routeParams.guidance_target[0] : routeParams.guidance_target) || undefined;
  const activeGuidanceEntry = guidanceEntry || (Array.isArray(routeParams.guidance_entry) ? routeParams.guidance_entry[0] : routeParams.guidance_entry) || undefined;
  const activeResumeStage = Array.isArray(routeParams.resume) ? routeParams.resume[0] : routeParams.resume;
  const universityOptionsOnly = activeJourneyMode === "universities_only";
  const undergraduateContext = activeUserType === "student" || activeJourneyMode === "undergraduate_career" || activeJourneyMode === "undergraduate_programmes";
  const guidedAdmissionJourney = Boolean(
    guidanceStudentId
    || earlySecondary
    || (
      ["programme_preview", "guided_subject_discovery", "programme_to_role", "admin_created_student_guidance"].includes(activeJourneyMode)
      && (activeUserType === "ss3_secondary" || activeUserType === "jamb")
    ),
  );
  const exploreNav = useExploreNav();
  const { colors } = useTheme();
  const universitySelectionRoute = activeResumeStage === "university_offerings";
  const [tab, setTab] = useState<ProgrammeTab>(universitySelectionRoute ? "schools" : "overview");
  const [state, setState] = useState<DataState<Programme>>(() => pending("Loading programme details..."));
  const [schools, setSchools] = useState<JambProgrammeSchool[]>([]);
  const [requirements, setRequirements] = useState<JambProgrammeRequirements | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  // Selecting a university is the active guidance choice. Comparison is a
  // separate, explicitly opted-in action and must never be pre-populated by
  // the university carried in from an earlier route.
  const [comparisonSchoolIds, setComparisonSchoolIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [universityQuery, setUniversityQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [savingSchool, setSavingSchool] = useState<string | null>(null);

  useEffect(() => {
    if (universitySelectionRoute) setTab("schools");
    else if (activeResumeStage === "university_context") setTab("overview");
  }, [activeResumeStage, universitySelectionRoute]);

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
          qualification: variant.qualification || variant.degreeType || undefined,
          durationYears: variant.durationYears ?? undefined,
          // A JAMB variant must use its own source-backed skills profile. Do
          // not borrow the canonical programme description, which may be an
          // aggregate of several JAMB identities.
          overview: null,
          curriculumContract: variant.curriculumContract,
          contextItems: variant.contextItems,
          resources: variant.resources,
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
        } else if (initialSchoolId) {
          setNotice("The saved university is not recorded for this programme. Choose a university from the list below.");
        }
        return;
      }

      const result = await careerData.getProgrammeForStudent(programmeId);
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
      } else if (initialSchoolId) {
        setNotice("The saved university is not recorded for this programme. Choose a university from the list below.");
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
  const universitySearchResults = useMemo(() => {
    const query = universityQuery.trim().toLowerCase();
    if (!query) return visibleSchools;
    return visibleSchools.filter((school) => [school.officialName, school.shortName, school.schoolName, school.address, school.city, school.state]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)));
  }, [universityQuery, visibleSchools]);
  const selectedSchool = visibleSchools.find((school) => school.schoolId === selectedSchoolId) ?? null;
  const comparisonSchools = visibleSchools.filter((school) => comparisonSchoolIds.includes(school.schoolId));
  const guidanceContext: GuidanceRouteContext = {
    programmeId: activeProgrammeId,
    jambProgrammeId,
    schoolId: selectedSchoolId ?? undefined,
    userType: activeUserType,
    className: routeClassName,
    stream: routeStream,
    journeyMode: activeJourneyMode || undefined,
    guidanceTarget: activeGuidanceTarget,
    guidanceStudentId,
    entryPath: activeGuidanceEntry,
    focused: focusedGuidance,
    resumeStage: activeResumeStage,
  };
  const sessionOnlyGuidance = Boolean(
    activeGuidanceTarget && activeGuidanceTarget !== "authorised_student",
  );

  const backToProgrammeChoices = () => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (universitySelectionRoute) {
      if (canGoBack) router.back();
      else exploreNav.programme(router, activeProgrammeId, { ...guidanceContext, resumeStage: "programme_preview", schoolId: undefined, replaceHistory: true });
      return;
    }
    if (activeResumeStage === "university_context") {
      // A university was opened from the programme preview. Back should
      // return to that preview, not strand the learner on the university list.
      exploreNav.programme(router, activeProgrammeId, { ...guidanceContext, resumeStage: "programme_preview", schoolId: undefined, replaceHistory: true });
      return;
    }
    if (!focusedGuidance) {
      if (canGoBack) router.back();
      else router.replace("/(tabs)/explore" as never);
      return;
    }
    // A focused programme page is a detail step inside the saved-guidance
    // workspace. Return to that workspace home, never to the admission search
    // URL that happened to create the detail page. This also repairs legacy
    // links carrying `resume=programme_preview` or a stale guidance_entry.
    router.replace(
      (exploreNav.base === ADMIN_EXPLORE_BASE
        ? "/(admin)/workspace-explore"
        : "/(tabs)/home") as never,
    );
  };

  const openUniversitySelection = () => {
    setUniversityQuery("");
    if (!guidedAdmissionJourney) {
      setTab("schools");
      return;
    }
    exploreNav.programme(router, activeProgrammeId, {
      ...guidanceContext,
      schoolId: undefined,
      resumeStage: "university_offerings",
      preserveHistory: true,
    });
  };

  const openUniversityOverview = (schoolId: string) => {
    if (!guidedAdmissionJourney) return;
    exploreNav.programme(router, activeProgrammeId, {
      ...guidanceContext,
      schoolId,
      resumeStage: "university_context",
      preserveHistory: true,
    });
  };

  const selectSchool = async (school: JambProgrammeSchool) => {
    if (!programme || savingSchool) return;
    setSavingSchool(school.schoolId);
    setNotice(null);
    // The university details came from the live offering response. Show them
    // immediately; saving a guidance checkpoint must never hide requirements
    // that the student has already selected to inspect.
    setSelectedSchoolId(school.schoolId);
    // Inspecting an offering must not switch the student into requirements.
    // Selecting an offering returns to the programme overview first.
    setTab("overview");
    // Early-secondary users are exploring university offerings. Do not turn
    // opening a school card into a saved commitment or onboarding completion.
    if (isViewOnly || (activeUserType === "senior_secondary" && !guidanceStudentId)) {
      setNotice(`${institutionLabel(school)} is being viewed. This choice is not saved until the relevant requirements are confirmed.`);
      setSavingSchool(null);
      openUniversityOverview(school.schoolId);
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
        university: { id: school.schoolId, name: institutionLabel(school), address: institutionLocation(school) },
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
          ? `${institutionLabel(school)}: ${exceptionText}`
          : `${institutionLabel(school)} is saved in your guidance path.`);
      } else {
        setNotice(saveNotice ?? "Create an account to save this guidance path.");
      }
    } catch {
      setNotice("We could not save this university right now. You can still review its details.");
    } finally {
      setSavingSchool(null);
    }
    openUniversityOverview(school.schoolId);
  };

  const header = universitySelectionRoute ? null : (
      <TextTabs
      value={tab}
      onChange={setTab}
       tabs={[
         { value: "overview", label: "Overview" },
         ...(!guidedAdmissionJourney ? [{ value: "schools" as ProgrammeTab, label: "Universities" }] : []),
       ]}
      style={styles.tabs}
    />
  );

  return (
    <DetailScaffold
      eyebrow="PROGRAMME"
    title={programmeName}
      backLabel={universitySelectionRoute
        ? "Back to programme preview"
        : activeResumeStage === "university_context"
          ? "Back to universities"
          : focusedGuidance ? "Back to home" : "Back to programme choices"}
      onBack={backToProgrammeChoices}
      save={focusedGuidance || isViewOnly ? undefined : { entityType: "programme", entityId: activeProgrammeId }}
      reportSelection={!selectedSchoolId ? { kind: "programmes", id: activeProgrammeId, name: programmeName } : undefined}
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
           universitySearchResults={universitySearchResults}
           universityQuery={universityQuery}
           onUniversityQueryChange={setUniversityQuery}
           selectedSchool={selectedSchool}
           comparisonSchools={comparisonSchools}
           comparisonSchoolIds={comparisonSchoolIds}
           onToggleComparison={(schoolId) => setComparisonSchoolIds((current) => current.includes(schoolId) ? current.filter((id) => id !== schoolId) : [...current, schoolId])}
           comparisonOpen={comparisonOpen}
           onOpenComparison={() => setComparisonOpen(true)}
           onCloseComparison={() => setComparisonOpen(false)}
           selectedSchoolId={selectedSchoolId}
           earlySecondary={earlySecondary}
           undergraduateContext={undergraduateContext}
          notice={notice}
          savingSchool={savingSchool}
          onSelectSchool={selectSchool}
            guidedAdmissionJourney={guidedAdmissionJourney}
            onChooseSchool={openUniversitySelection}
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
  universitySearchResults,
  universityQuery,
  onUniversityQueryChange,
  selectedSchool,
  comparisonSchools,
  comparisonSchoolIds,
  onToggleComparison,
  comparisonOpen,
  onOpenComparison,
  onCloseComparison,
  selectedSchoolId,
  earlySecondary,
  undergraduateContext,
  notice,
  savingSchool,
  onSelectSchool,
  onChooseSchool,
  guidanceStudentId,
  guidanceContext,
  router,
  colors,
  focusedGuidance,
  viewOnly,
  showCareerGuidance,
  guidedAdmissionJourney,
}: {
  data: Programme;
  tab: ProgrammeTab;
  programmeName: string;
  requirements: JambProgrammeRequirements | null;
  schools: JambProgrammeSchool[];
  universitySearchResults: JambProgrammeSchool[];
  universityQuery: string;
  onUniversityQueryChange: (value: string) => void;
  selectedSchool: JambProgrammeSchool | null;
  comparisonSchools: JambProgrammeSchool[];
  comparisonSchoolIds: string[];
  onToggleComparison: (schoolId: string) => void;
  comparisonOpen: boolean;
  onOpenComparison: () => void;
  onCloseComparison: () => void;
  selectedSchoolId: string | null;
  earlySecondary: boolean;
  undergraduateContext: boolean;
  notice: string | null;
  savingSchool: string | null;
  onSelectSchool: (school: JambProgrammeSchool) => void;
  onChooseSchool: () => void;
  guidanceStudentId?: string;
  guidanceContext: GuidanceRouteContext;
  router: Router;
  colors: ColorPalette;
  focusedGuidance: boolean;
  viewOnly: boolean;
  showCareerGuidance: boolean;
  guidedAdmissionJourney: boolean;
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
  const hasProgrammeLearningPreview = hasStudentDisplayableProgrammeLearning(data.curriculumContract);

  return (
    <View style={styles.content}>
      {tab === "overview" ? (
        <View style={styles.section}>
          {awardLine(programmeName, data.qualification, data.durationYears) ? (
            <Text style={[styles.award, { color: colors.textRole.secondary }]}>{awardLine(programmeName, data.qualification, data.durationYears)}</Text>
          ) : null}
          {!selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <SectionLabel>{earlySecondary ? "Programme preview" : "Programme overview"}</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>
                {earlySecondary
                  ? "Start by understanding what this programme covers. When you are ready, choose a university to see its requirements."
                  : "This is the programme identity. Choose a university to see this programme at that university, what you will study, and its requirements."}
              </Text>
            </View>
          ) : null}
          {selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.contextLabel, { color: colors.textRole.muted }]}>Programme at this university</Text>
              <Text style={[styles.contextName, { color: colors.textRole.primary }]}>{institutionLabel(selectedSchool)}</Text>
              {institutionLocation(selectedSchool) ? <Text style={[styles.contextAddress, { color: colors.textRole.secondary }]}>{institutionLocation(selectedSchool)}</Text> : null}
              <View style={styles.contextActions}>
                 <TouchableOpacity accessibilityRole="button" onPress={onChooseSchool} style={styles.inlineAction}>
                  <Text style={[styles.link, { color: colors.textRole.muted }]}>Change university</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: comparisonSchoolIds.includes(selectedSchool.schoolId) }}
                  onPress={() => onToggleComparison(selectedSchool.schoolId)}
                  style={styles.inlineAction}
                >
                  <Text style={[styles.link, { color: colors.accentRole.action }]}>{comparisonSchoolIds.includes(selectedSchool.schoolId) ? "Selected for comparison" : "Select for comparison"}</Text>
                </TouchableOpacity>
                {comparisonSchoolIds.length > 1 ? <TouchableOpacity accessibilityRole="button" onPress={onOpenComparison} style={styles.inlineAction}>
                  <Text style={[styles.link, { color: colors.accentRole.action }]}>Compare selected universities</Text>
                </TouchableOpacity> : null}
              </View>
            </View>
          ) : null}
          {!selectedSchool ? (
            <>
              {earlySecondary && hasProgrammeLearningPreview ? (
                <DegreeSkills curriculumContract={data.curriculumContract} resources={data.resources} variant="teaser" />
              ) : null}
              {earlySecondary && programmePreviewExplanation(data) ? (
                <View style={styles.block}>
                  <SectionLabel>What this programme is about</SectionLabel>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{programmePreviewExplanation(data)}</Text>
                </View>
              ) : null}
              {earlySecondary && !programmePreviewExplanation(data) && !hasProgrammeLearningPreview && !data.contextItems?.length ? (
                <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                  <SectionLabel>Programme learning preview unavailable</SectionLabel>
                  <Text style={[styles.body, { color: colors.textRole.muted }]}>{programmePreviewUnavailableMessage(data.curriculumContract?.status)}</Text>
                </View>
              ) : null}
              {earlySecondary && data.contextItems?.length ? <ContextualItemList
                items={data.contextItems}
                resources={data.resources}
                title="Learning capabilities for this programme"
              /> : null}
              <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                <SectionLabel>{earlySecondary ? "Choose a university when you are ready" : "Choose a university to continue"}</SectionLabel>
                <Text style={[styles.body, { color: colors.textRole.secondary }]}>The same JAMB programme may be offered by several universities. Choose one to see its address and the requirements recorded for that university before continuing to the programme details.</Text>
                <TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
                  <Text style={styles.primaryText}>View universities</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
               {selectedSchool ? (
                <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                  <SectionLabel>Admission information for this university</SectionLabel>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>The programme name is the same national JAMB identity. The first section below shows the general subjects used to understand the programme; the second shows any different rule recorded by {institutionLabel(selectedSchool)}.</Text>
                  <View style={styles.requirement}>
                    <Text style={[styles.label, { color: colors.textRole.primary }]}>General programme guidance</Text>
                    <Text style={[styles.body, { color: colors.textRole.secondary }]}>These are the common UTME and O-level subjects recorded for this programme before a university adds its own conditions.</Text>
                    {requirementCards.map((card) => (
                      <View key={`inline-national-${card.field}`} style={styles.requirementItem}>
                        <Text style={[styles.requirementLabel, { color: colors.textRole.muted }]}>{card.label}</Text>
                        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayRequirement(card.field, card.value)}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.requirement}>
                    <Text style={[styles.label, { color: colors.textRole.primary }]}>Requirements recorded for {institutionLabel(selectedSchool)}</Text>
                    <Text style={[styles.body, { color: colors.textRole.secondary }]}>Use these university-specific details when you compare your subjects with this offering.</Text>
                    {universityRequirementCards.map((card) => (
                      <View key={`inline-university-${card.field}`} style={styles.requirementItem}>
                        <Text style={[styles.requirementLabel, { color: colors.textRole.muted }]}>{card.label}</Text>
                        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{card.value}</Text>
                        {universitySubjectPoolText(selectedSchool, card.field === "utme_subjects" ? "utme" : "olevel") ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{universitySubjectPoolText(selectedSchool, card.field === "utme_subjects" ? "utme" : "olevel")}</Text> : null}
                      </View>
                    ))}
                    {selectedSchool.universityNote ? <View style={styles.requirementItem}>
                      <Text style={[styles.requirementLabel, { color: colors.textRole.muted }]}>Additional note</Text>
                      <Text style={[styles.body, { color: colors.textRole.secondary }]}>{selectedSchool.universityNote}</Text>
                    </View> : null}
                  </View>
                </View>
              ) : null}
               {programmePreviewExplanation(data) ? (
                <View style={styles.block}>
                  <SectionLabel>What this programme is about</SectionLabel>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>{programmePreviewExplanation(data)}</Text>
                </View>
              ) : null}
              <DegreeSkills curriculumContract={data.curriculumContract} resources={data.resources} />
              <ContextualItemList
                items={data.contextItems}
                resources={data.resources}
                title="What the programme capabilities mean"
              />
              {data.curriculumContract?.status === "available" ? <DataSourceBadge verification="verified" source="CCMAS/JAMB curriculum records" /> : null}
              <View style={styles.block}>
                {undergraduateContext ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>This is your current programme. Follow what it teaches into the domains, subgroups, roles, skills, tools, and certifications that can help you plan what to learn next.</Text> : null}
                {viewOnly ? <Text style={[styles.body, { color: colors.textRole.muted }]}>This is a read-only route because subject fit has not been confirmed. You can inspect the programme and requirements while keeping your current choices unchanged.</Text> : null}
                {showCareerGuidance ? <ProgrammeDomainTransition domains={orderedDomains} colors={colors} onOpenDomain={(link) => exploreNav.domain(router, link.domainId, guidanceContext)} /> : <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><SectionLabel>University options review</SectionLabel><Text style={[styles.body, { color: colors.textRole.secondary }]}>You have reviewed this university&apos;s programme details and requirements. Career guidance is not part of this session mode.</Text><TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}><Text style={styles.primaryText}>Change university</Text></TouchableOpacity></View>}
              </View>
            </>
          )}
        </View>
      ) : null}

      {tab === "requirements" ? (
        <View style={styles.section}>
          {!selectedSchool ? (
            <View style={[styles.context, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <SectionLabel>Choose a university first</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>The national and university-specific requirements appear after you choose a university. This prevents one university&apos;s requirements from being confused with another&apos;s.</Text>
              <TouchableOpacity onPress={onChooseSchool} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
                <Text style={styles.primaryText}>Choose a university</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.block, { marginTop: Spacing.md }]}>
              <SectionLabel>National programme requirements</SectionLabel>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>These requirements belong to the selected JAMB programme. The university details below are specific to {institutionLabel(selectedSchool)}.</Text>
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
                These details belong only to {institutionLabel(selectedSchool)}. They do not replace the national programme requirements above.
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
                        {rule.text || rule.conditionText || (rule.minimumRequired ? `At least ${rule.minimumRequired} subject option(s).` : "A structured rule is recorded for this university's programme.")}
                      </Text>
                      {rule.subjectPool?.length ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>Choose from: {rule.subjectPool.join(", ")}</Text> : null}
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
              {(requirements?.sourceEvidence?.some((source) => source.layer !== "direct_entry" && (source as { parseStatus?: string }).parseStatus !== "needs_review") || selectedSchool.universityRequirementExceptions?.some((row) => row.text && row.parseStatus !== "needs_review")) ? (
                <View style={[styles.requirement, { borderColor: colors.borderRole.subtle }]}>
                  <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: evidenceOpen }} onPress={() => setEvidenceOpen((open) => !open)}>
                    <Text style={[styles.label, { color: colors.accentRole.action }]}>{evidenceOpen ? "Hide source evidence" : "View source evidence"}</Text>
                  </TouchableOpacity>
                  {evidenceOpen ? (
                    <View style={{ gap: Spacing.sm }}>
                      {(requirements?.sourceEvidence ?? []).filter((source) => source.layer !== "direct_entry" && (source as { parseStatus?: string }).parseStatus !== "needs_review").map((source, index) => (
                        <View key={`${source.layer ?? "source"}-${source.page ?? ""}-${index}`}>
                          <Text style={[styles.meta, { color: colors.textRole.muted }]}>
                            {(source.layer ?? "source").toUpperCase()} · {source.sourceFile ?? "Source file not recorded"}{source.page ? ` · page ${source.page}` : ""}
                          </Text>
                          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{source.text || source.resolution || "The source location is recorded, but its text is not available."}</Text>
                        </View>
                      ))}
                      {(selectedSchool.universityRequirementExceptions ?? []).filter((row) => row.text && row.parseStatus !== "needs_review").map((row, index) => (
                        <View key={`university-source-${index}`}>
                           <Text style={[styles.meta, { color: colors.textRole.muted }]}>{(row.examType ?? "university").toUpperCase()} source note</Text>
                          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{row.text}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
              {selectedSchool.hasUniversityException && !selectedSchool.universityNote && !selectedSchool.universityRequirementExceptions?.some((row) => row.text) ? (
                <Text style={[styles.body, { color: colors.textRole.muted }]}>Check the university&apos;s current admission notice before applying.</Text>
              ) : null}
              {comparisonSchools.length > 1 ? (
                <View style={[styles.compareBlock, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                  <SectionLabel>Compare the universities you selected</SectionLabel>
                  <Text style={[styles.body, { color: colors.textRole.secondary }]}>The programme stays the same. This comparison shows how the recorded requirements and notes differ by university.</Text>
                  <View style={styles.compareGrid}>
                    {comparisonSchools.map((school) => (
                      <View key={school.schoolId} style={[styles.compareCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                        <Text style={[styles.schoolName, { color: colors.textRole.primary }]}>{institutionLabel(school)}</Text>
                        {school.address ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{school.address}</Text> : null}
                        <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>UTME subjects</Text>
                        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{universityRequirementText(school, "utme_subjects")}</Text>
                        <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>O-level requirements</Text>
                        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{universityRequirementText(school, "olevel_requirement")}</Text>
                        {school.universityNote ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>Note: {school.universityNote}</Text> : null}
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {tab === "schools" ? (
        <View style={styles.section}>
          <SectionLabel>{`${earlySecondary ? "Explore universities with this programme" : "Universities with this programme"}${schools.length ? ` (${schools.length})` : ""}`}</SectionLabel>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{earlySecondary ? "Open one university to view its requirements. Add others to compare their requirements before you decide." : "Choose one university to keep its programme name, address and requirements in your guidance path."}</Text>
          <View style={[styles.universitySearch, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
            <Feather name="search" size={16} color={colors.textRole.muted} />
            <TextInput
              value={universityQuery}
              onChangeText={onUniversityQueryChange}
              placeholder="Type a university name or location"
              placeholderTextColor={colors.textRole.muted}
              accessibilityLabel="Search universities"
              style={[styles.universitySearchInput, { color: colors.textRole.primary }]}
            />
          </View>
          <View style={resp.isDesktop ? styles.schoolGrid : styles.schoolList}>
            {universitySearchResults.map((school) => (
              <View key={school.schoolId} style={[styles.school, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                <View style={styles.schoolCopy}>
                  <View style={styles.schoolHeading}>
                    <Feather name="home" size={17} color={colors.accentRole.action} />
                    <Text style={[styles.schoolName, { color: colors.textRole.primary }]}>{institutionLabel(school)}</Text>
                  </View>
            {school.studentName || school.jambName ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{school.studentName ?? school.jambName}</Text> : null}
                  {awardLine(programmeName, data.qualification, data.durationYears) ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{awardLine(programmeName, data.qualification, data.durationYears)}</Text> : null}
                  {institutionLocation(school) ? <View style={styles.locationLine}>
                    <Feather name="map-pin" size={13} color={colors.textRole.muted} />
                    <Text style={[styles.meta, { color: colors.textRole.muted }]}>{institutionLocation(school)}</Text>
                  </View> : null}
                </View>
                <View style={styles.schoolActions}>
                  <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: selectedSchoolId === school.schoolId }} onPress={() => onSelectSchool(school)} style={[styles.secondaryButton, { borderColor: selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.accentRole.action }]}>
                    <Feather name={selectedSchoolId === school.schoolId ? "check-circle" : "circle"} size={15} color={selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.accentRole.action} />
                    <Text style={[styles.secondaryText, { color: selectedSchoolId === school.schoolId ? colors.accentRole.success : colors.accentRole.action }]}>{savingSchool === school.schoolId ? "Selecting..." : selectedSchoolId === school.schoolId ? "Selected" : "Select university"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: comparisonSchoolIds.includes(school.schoolId) }} onPress={() => onToggleComparison(school.schoolId)} style={[styles.compareButton, { borderColor: comparisonSchoolIds.includes(school.schoolId) ? colors.accentRole.success : colors.borderRole.subtle }]}>
                    <Feather name={comparisonSchoolIds.includes(school.schoolId) ? "check-square" : "square"} size={15} color={comparisonSchoolIds.includes(school.schoolId) ? colors.accentRole.success : colors.textRole.muted} />
                    <Text style={[styles.secondaryText, { color: comparisonSchoolIds.includes(school.schoolId) ? colors.accentRole.success : colors.textRole.primary }]}>{comparisonSchoolIds.includes(school.schoolId) ? "Selected for comparison" : "Select for comparison"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          {!universitySearchResults.length && schools.length ? <Text style={[styles.body, { color: colors.textRole.muted }]}>No recorded university matches that search. Try the full name, abbreviation or location.</Text> : null}
          {comparisonSchoolIds.length > 1 ? (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onOpenComparison}
              style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}
            >
              <Text style={styles.primaryText}>Compare selected universities ({comparisonSchoolIds.length})</Text>
            </TouchableOpacity>
          ) : null}
          {!schools.length ? <Text style={[styles.body, { color: colors.textRole.muted }]}>No university is recorded for this programme yet.</Text> : null}
          {notice ? <Text style={[styles.notice, { color: colors.textRole.secondary }]}>{notice}</Text> : null}
        </View>
      ) : null}

      {comparisonOpen && comparisonSchools.length > 1 ? (
        <Modal transparent visible animationType="slide" onRequestClose={onCloseComparison}>
          <View style={styles.compareModalBackdrop}>
            <View style={[styles.compareModal, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <View style={styles.compareModalHeader}>
                <SectionLabel>Compare selected universities</SectionLabel>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close comparison" onPress={onCloseComparison} style={styles.closeButton}>
                  <Feather name="x" size={18} color={colors.textRole.primary} />
                </TouchableOpacity>
              </View>
              <UniversityComparisonPanel
                schools={comparisonSchools}
                onSelect={(school) => { onCloseComparison(); onSelectSchool(school); }}
                selectedSchoolId={selectedSchoolId}
                colors={colors}
                awardLineText={awardLine(programmeName, data.qualification, data.durationYears)}
                onClose={onCloseComparison}
              />
            </View>
          </View>
        </Modal>
      ) : null}

    </View>
  );
}

function UniversityComparisonPanel({
  schools,
  onSelect,
  selectedSchoolId,
  colors,
  awardLineText,
  onClose,
}: {
  schools: JambProgrammeSchool[];
  onSelect: (school: JambProgrammeSchool) => void;
  selectedSchoolId: string | null;
  colors: ColorPalette;
  awardLineText: string | null;
  onClose: () => void;
}) {
  const programmeIdentity = schools.find((school) => school.studentName || school.jambName)?.studentName
    ?? schools.find((school) => school.jambName)?.jambName
    ?? "This JAMB programme";
  return (
    <View style={[styles.compareBlock, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <SectionLabel>Compare universities</SectionLabel>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>You are comparing the same JAMB programme — {programmeIdentity} — at different universities. The programme identity stays the same; the university, address, requirements and exceptions may differ.</Text>
      <View style={styles.compareGrid}>
        {schools.map((school) => (
          <View key={school.schoolId} style={[styles.compareCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
            <View style={styles.compareHeading}>
              <Feather name="home" size={17} color={colors.accentRole.action} />
              <Text style={[styles.schoolName, { color: colors.textRole.primary }]}>{institutionLabel(school)}</Text>
            </View>
            {institutionLocation(school) ? <>
              <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>University address</Text>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{institutionLocation(school)}</Text>
            </> : null}
            {awardLineText ? <>
              <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>Programme award</Text>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{awardLineText}</Text>
            </> : null}
            <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>Offering</Text>
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>{school.studentName ?? school.jambName ?? programmeIdentity}</Text>
            <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>Requirement record</Text>
            <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>UTME subjects</Text>
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>{universityRequirementText(school, "utme_subjects")}</Text>
            <Text style={[styles.compareLabel, { color: colors.textRole.muted }]}>O-Level requirements</Text>
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>{universityRequirementText(school, "olevel_requirement")}</Text>
            {school.universityStructuredSubjectRules?.map((rule, index) => (
              <View key={`${school.schoolId}-rule-${index}`} style={styles.compareRule}>
                <Text style={[styles.meta, { color: colors.accentRole.action }]}>{(rule.examType ?? "admission").toUpperCase()} {rule.scope === "partial" ? "subject group" : "rule"}</Text>
                {rule.text || rule.conditionText ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{rule.text || rule.conditionText}</Text> : null}
                {rule.subjectPool?.length ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>Subject options: {rule.subjectPool.join(", ")}</Text> : null}
              </View>
            ))}
            {school.universityNote ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>Note: {school.universityNote}</Text> : null}
            <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: selectedSchoolId === school.schoolId }} onPress={() => onSelect(school)} style={[styles.primaryButton, { backgroundColor: colors.accentRole.action }]}>
              <Feather name={selectedSchoolId === school.schoolId ? "check-circle" : "circle"} size={16} color="#FFFFFF" />
              <Text style={styles.primaryText}>{selectedSchoolId === school.schoolId ? "Selected" : "Select this university"}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onClose} style={[styles.secondaryButton, { borderColor: colors.borderRole.subtle, alignSelf: "flex-start" }]}>
        <Text style={[styles.secondaryText, { color: colors.textRole.primary }]}>Close comparison</Text>
      </TouchableOpacity>
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
  schoolActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, alignItems: "center" },
  compareBlock: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  compareModalBackdrop: { flex: 1, justifyContent: "center", padding: Spacing.lg, backgroundColor: "rgba(11, 18, 32, 0.52)" },
  compareModal: { width: "100%", maxWidth: 980, maxHeight: "92%", alignSelf: "center", borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  compareModalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  closeButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: Radius.full },
  compareGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  compareCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, flex: 1, minWidth: 230 },
  compareHeading: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  compareRule: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(100,100,100,0.2)", paddingTop: Spacing.xs, marginTop: Spacing.xs, gap: 2 },
  compareLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.6, marginTop: Spacing.xs },
  connectionGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  preview: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: 4, flex: 1, minWidth: 240 },
  previewName: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  previewType: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  connectionGroup: { gap: Spacing.sm },
  connectionTitle: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  connectionCount: { fontSize: FontSize.sm },
  moreButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreButtonText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  primaryButton: { alignSelf: "flex-start", borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  primaryText: { color: "#fff", fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  requirement: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  requirementItem: { gap: 2, marginTop: Spacing.xs },
  requirementLabel: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  requirementTitle: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  label: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  schoolList: { gap: Spacing.sm },
  schoolGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  universitySearch: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  universitySearchInput: { flex: 1, minHeight: 42, fontSize: FontSize.sm },
  school: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, flex: 1, minWidth: 260 },
  schoolCopy: { flex: 1, gap: 3 },
  schoolHeading: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  locationLine: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  schoolName: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  schoolChoice: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  schoolSelectState: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  secondaryButton: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  compareButton: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  secondaryText: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  notice: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  link: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
});
