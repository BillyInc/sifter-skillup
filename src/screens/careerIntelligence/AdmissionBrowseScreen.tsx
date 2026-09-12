/**
 * AdmissionBrowseScreen — the admission hub (§Phase 8): search by programme
 * name, or enter your strongest subjects and see what you qualify for.
 *
 * Lifted out of app/(tabs)/explore/admission/index.tsx so the admin Explore
 * stack can mount the same screen. It was 383 lines living in a route file,
 * which is why it could not be reused; every other Explore route is a thin
 * wrapper over a screen in src/screens.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { careerData } from "@/lib/careerData";
import { API } from "@/lib/api";
import { getStartingPoint, saveStartingPoint } from "@/lib/startingPoint";
import { clearOnboardingDraft } from "@/lib/onboardingDraft";
import { useAuth } from "@/hooks/useAuth";
import { invalidateGuidancePathCache } from "@/components/careerIntelligence";
import { LiveSubjectMultiSelect, MAX_OLEVEL_SUBJECTS } from "@/components/onboarding/LiveSubjectMultiSelect";
import { useExploreNav } from "@/lib/exploreNav";
import { isGuidanceContextCompatible } from "@/lib/guidanceRouteContext";
import { adminLearnerAudienceForOrg, type AdminLearnerAudience } from "@/lib/adminLearnerAudience";
import { CareerDisclaimer } from "@/components/careerIntelligence/CareerDisclaimer";
import { provisioningData } from "@/lib/provisioningData";
import type {
  AdmissionSchool,
  JambProgrammeDetail,
  JambProgrammeSchool,
  JambProgrammeSuggestion,
  SchoolProgrammeOffering,
  SubjectProgrammeMatch,
  GuidanceReportPath,
} from "@/lib/careerData";
import type { JambDomainResult } from "@/types/career";
import {
  Brand,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
  webContainer,
} from "@/theme";

/**
 * Three entry points, matching the three real situations:
 *
 *  - "school"    — ALREADY ENROLLED. You know your university, so name it and
 *                  pick your course off its own list. No national picker, no
 *                  name disambiguation: your school's list uses your school's
 *                  names.
 *  - "programme" — ENROLLING and you know the course. Search the name and see
 *                  universities offering that exact programme identity. A
 *                  genuinely different JAMB identity is a separate result,
 *                  not a variant nested under this one.
 *  - "subjects"  — ENROLLING and you don't. Enter your strongest subjects.
 */
type Mode = "school" | "programme" | "subjects";
type Candidate = JambProgrammeSuggestion | SubjectProgrammeMatch;
type SubjectMatchStatus = "idle" | "loading" | "real" | "unavailable";

type GuidanceResumeSnapshot = {
  status?: "in_progress" | "complete";
  // `fields` is retained only as a legacy value while older saved paths are
  // migrated in memory. New writes must use the canonical `domains` stage.
  stage?: "context" | "subjects" | "programmes" | "university" | "domains" | "fields";
  mode?: Mode;
  query?: string;
  schoolQuery?: string;
  subjectText?: string;
  olevelSubjectText?: string;
  subjectExamType?: "utme" | "olevel" | "combined";
  contextClass?: string;
  stream?: string;
  candidates?: Candidate[];
  selected?: Candidate | null;
  schools?: JambProgrammeSchool[];
  selectedAdmissionSchool?: JambProgrammeSchool | null;
  domains?: JambDomainResult | null;
  programmeDetail?: JambProgrammeDetail | null;
  selectedSubjectMatch?: SubjectProgrammeMatch | null;
  chosenSchool?: AdmissionSchool | null;
  offerings?: SchoolProgrammeOffering[];
};

function candidateDisplayName(candidate: Candidate): string {
  return candidate.studentName || candidate.jambName || "Programme";
}

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function normalizeGuidanceStage(stage: GuidanceResumeSnapshot["stage"]): GuidanceResumeSnapshot["stage"] {
  return stage === "fields" ? "domains" : stage;
}

function matchSummary(item: SubjectProgrammeMatch): string {
  if (item.matchBasis === "combined") {
    if (item.eligibilityStatus === "eligible") {
      return "UTME gate matches and O-level requirement is satisfied.";
    }
    if (item.eligibilityStatus === "utme_match_olevel_gap") {
      return "UTME gate matches, but the O-level requirement still has gaps.";
    }
    return "UTME gate matches, but the O-level details are incomplete, so eligibility cannot be confirmed yet.";
  }
  if (item.matchBasis === "olevel") {
    return "O-level requirement matches your selected subjects. Check the UTME subjects before applying.";
  }
  return "UTME subjects match where requirements are parsed. Check O-level subjects before deciding.";
}

function appendProgrammeChoice(
  path: GuidanceReportPath["path"],
  selection: Partial<GuidanceReportPath["path"]>,
): GuidanceReportPath["path"] {
  const previous = path.programmes?.length
    ? path.programmes
    : path.programme
      ? [{
          programme: path.programme,
          university: path.university,
          requirements: path.requirements,
          universityRequirements: path.universityRequirements,
        }]
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
    programmes: [...next, {
      programme,
      university,
      requirements: selection.requirements ?? {},
      universityRequirements: selection.universityRequirements ?? {},
    }],
  };
}

export default function AdmissionBrowseScreen() {
  const params = useLocalSearchParams<{
    mode?: string | string[];
    q?: string | string[];
    subjects?: string | string[];
    olevel_subjects?: string | string[];
    exam_type?: string | string[];
    stream?: string | string[];
    class_name?: string | string[];
    school_id?: string | string[];
    school_name?: string | string[];
    admin?: string | string[];
    admin_type?: string | string[];
    guidance_student_id?: string | string[];
    guidance_target?: string | string[];
    guidance_entry?: string | string[];
    user_type?: string | string[];
    programme?: string | string[];
    journey?: string | string[];
    journey_mode?: string | string[];
    focus?: string | string[];
    resume?: string | string[];
  }>();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { refreshUser, user } = useAuth();
  const { colors } = useTheme();
  const rawMode = readParam(params.mode);
  const userType = readParam(params.user_type);
  const earlySecondary = userType === "senior_secondary";
  const showSchoolMode = !userType || userType === "student";
  const initialMode: Mode =
    rawMode === "subjects" ? "subjects" : rawMode === "school" && showSchoolMode ? "school" : "programme";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [query, setQuery] = useState(readParam(params.q));
  const [subjectText, setSubjectText] = useState(
    decodeURIComponent(readParam(params.subjects)).replace(/,/g, ", "),
  );
  const [olevelSubjectText, setOlevelSubjectText] = useState(
    decodeURIComponent(readParam(params.olevel_subjects)).replace(/,/g, ", "),
  );
  const rawExamType = readParam(params.exam_type);
  const [subjectExamType, setSubjectExamType] = useState<"utme" | "olevel" | "combined">(
    earlySecondary ? "olevel" : rawExamType === "olevel" ? "olevel" : rawExamType === "utme" ? "utme" : "combined",
  );
  const isAdminExplore = readParam(params.admin) === "1";
  const adminType = readParam(params.admin_type);
  const guidanceStudentId = readParam(params.guidance_student_id);
  const requestedGuidanceTarget = readParam(params.guidance_target);
  // Older admin links did not carry a target marker. Infer only from the
  // presence of a student ID; an explicit contradictory marker is stale and
  // must not hydrate another account's checkpoint.
  const guidanceTarget = requestedGuidanceTarget || (guidanceStudentId ? "authorised_student" : "");
  const guidanceEntry = readParam(params.guidance_entry);
  const sessionOnlyGuidance = isAdminExplore && !guidanceStudentId;
  const guidanceContextShape = { guidanceTarget, guidanceStudentId };
  const staleGuidanceRoute = isAdminExplore && (
    guidanceTarget === "authorised_student"
      ? !guidanceStudentId || !isGuidanceContextCompatible(guidanceContextShape, { guidanceTarget: "authorised_student" })
      : Boolean(guidanceStudentId)
  );
  const journeyMode = readParam(params.journey_mode) || readParam(params.journey);
  const isFocusedGuidance = readParam(params.focus) === "guidance" || journeyMode === "guided_subject_discovery";
  const undergraduateContext = userType === "student" || journeyMode === "undergraduate_programmes";
  const learnerAudience: AdminLearnerAudience | null = adminLearnerAudienceForOrg(adminType);
  const [contextClass, setContextClass] = useState(readParam(params.class_name));
  const [stream, setStream] = useState(readParam(params.stream));
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [schools, setSchools] = useState<JambProgrammeSchool[]>([]);
  const [selectedAdmissionSchool, setSelectedAdmissionSchool] = useState<JambProgrammeSchool | null>(null);
  const [domains, setDomains] = useState<JambDomainResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedSubjectMatch, setSelectedSubjectMatch] = useState<SubjectProgrammeMatch | null>(null);
  const [subjectMatchStatus, setSubjectMatchStatus] = useState<SubjectMatchStatus>("idle");
  const [subjectMatchAttempted, setSubjectMatchAttempted] = useState(false);
  const [programmeDetail, setProgrammeDetail] = useState<JambProgrammeDetail | null>(null);
  const selectedSubjectDetails: SubjectProgrammeMatch | null = selected && "matchedSubjectCount" in selected ? selected : null;

  // School-first (enrolled) state.
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolMatches, setSchoolMatches] = useState<AdmissionSchool[]>([]);
  const [chosenSchool, setChosenSchool] = useState<AdmissionSchool | null>(null);
  const initialSchoolId = readParam(params.school_id);
  const initialSchoolName = readParam(params.school_name);
  const [offerings, setOfferings] = useState<SchoolProgrammeOffering[]>([]);
  const [courseFilter, setCourseFilter] = useState(readParam(params.programme));
  const [resumeHydrated, setResumeHydrated] = useState(!guidanceStudentId);
  const [guidanceComplete, setGuidanceComplete] = useState(false);
  const guidanceCompleteRef = useRef(false);
  const finalizingGuidanceRef = useRef(false);

  useEffect(() => {
    if (earlySecondary && subjectExamType !== "olevel") setSubjectExamType("olevel");
  }, [earlySecondary, subjectExamType]);

  const subjects = useMemo(
    () => subjectText.split(",").map((s) => s.trim()).filter(Boolean),
    [subjectText],
  );
  const olevelSubjects = useMemo(
    () => olevelSubjectText.split(",").map((s) => s.trim()).filter(Boolean),
    [olevelSubjectText],
  );
  const subjectLimitExceeded =
    subjectExamType === "utme"
      ? subjects.length > 4
      : subjectExamType === "olevel"
        ? olevelSubjects.length > MAX_OLEVEL_SUBJECTS
        : subjects.length > 4 || olevelSubjects.length > MAX_OLEVEL_SUBJECTS;
  const hasSubjectContext =
    subjectExamType === "utme"
      ? subjects.length === 4
      : subjectExamType === "olevel"
        ? olevelSubjects.length >= 5 && olevelSubjects.length <= MAX_OLEVEL_SUBJECTS
        : subjects.length === 4 && olevelSubjects.length >= 5 && olevelSubjects.length <= MAX_OLEVEL_SUBJECTS;
  const canMatchSubjects = hasSubjectContext && !subjectLimitExceeded;
  const guidedSubjectDiscovery =
    journeyMode === "guided_subject_discovery" &&
    initialMode === "subjects" &&
    hasSubjectContext;
  const [showSubjectEditor, setShowSubjectEditor] = useState(!guidedSubjectDiscovery);
  const showAdmissionEditor = !guidedSubjectDiscovery || showSubjectEditor;

  const markAdminGuidanceInProgress = () => {
    if (!guidanceStudentId) return;
    guidanceCompleteRef.current = false;
    setGuidanceComplete(false);
  };

  const updateSubjectSelection = (next: string[], kind: "utme" | "olevel") => {
    if (guidanceStudentId) {
      guidanceCompleteRef.current = false;
      setGuidanceComplete(false);
    }
    if (kind === "utme") setSubjectText(next.join(", "));
    else setOlevelSubjectText(next.join(", "));
    // A previous match is no longer valid after the subject set changes.
    // Requiring a fresh click also prevents stale results from appearing while
    // the selection is below the minimum gate.
    setCandidates([]);
    setSelected(null);
    setSubjectMatchAttempted(false);
    setNotice(null);
  };

  useEffect(() => {
    if (!subjectLimitExceeded) return;
    setCandidates([]);
    setSelected(null);
    setSubjectMatchAttempted(false);
    setNotice(
      subjectExamType === "utme"
        ? "UTME uses exactly 4 subjects. Remove the extra subject before continuing."
        : `Choose no more than ${MAX_OLEVEL_SUBJECTS} O-level subjects for this check. Remove the extras before continuing.`,
    );
  }, [olevelSubjects.length, subjectExamType, subjectLimitExceeded, subjects.length]);

  // The organisation type owns the student context. Providers are JAMB-only,
  // universities are undergraduate-only, and only secondary schools have
  // streams; stale URL values must not widen that contract. Do not silently
  // choose the first class or stream: an admin must make that choice before
  // guidance is shown.
  useEffect(() => {
    if (!isAdminExplore || !learnerAudience) return;
    const normalizedClass = contextClass.trim().toLowerCase();
    if (!learnerAudience.learnerTypes.includes(normalizedClass as never)) {
      if (contextClass) setContextClass("");
    }
    if (learnerAudience.streams.length > 0) {
      if (!learnerAudience.streams.includes(stream as never) && stream) {
        setStream("");
      }
    } else if (stream) {
      setStream("");
    }
  }, [adminType, isAdminExplore, learnerAudience, contextClass, stream]);

  // Administrator guidance is account-scoped. Rehydrate the last checkpoint
  // for this specific student before running any initial search so returning to
  // a roster row restores the same stage, subjects and selected records.
  useEffect(() => {
    if (!guidanceStudentId || staleGuidanceRoute) {
      setResumeHydrated(true);
      return;
    }
    let active = true;
    provisioningData.getGuidancePath(guidanceStudentId).then((saved) => {
      if (!active) return;
      const path = saved?.path ?? {};
      const resume = (path.resume ?? {}) as GuidanceResumeSnapshot;
      // Older checkpoints called this stage “fields”. Preserve those saved
      // routes while presenting and resaving them with canonical terminology.
      resume.stage = normalizeGuidanceStage(resume.stage);
      const hasCompletedPath = Boolean(
        (path.programme as Record<string, unknown> | undefined)?.name &&
        (path.university as Record<string, unknown> | undefined)?.name,
      );
      if (resume.mode) setMode(resume.mode);
      if (resume.query !== undefined) setQuery(resume.query);
      if (resume.schoolQuery !== undefined) setSchoolQuery(resume.schoolQuery);
      if (resume.subjectText !== undefined) setSubjectText(resume.subjectText);
      if (resume.olevelSubjectText !== undefined) setOlevelSubjectText(resume.olevelSubjectText);
      if (resume.subjectExamType) setSubjectExamType(resume.subjectExamType);
      if (resume.contextClass !== undefined) setContextClass(resume.contextClass);
      if (resume.stream !== undefined) setStream(resume.stream);
      if (resume.candidates) setCandidates(resume.candidates);
      if (resume.selected !== undefined) setSelected(resume.selected);
      if (resume.schools) setSchools(resume.schools);
      if (resume.selectedAdmissionSchool !== undefined) setSelectedAdmissionSchool(resume.selectedAdmissionSchool);
      if (resume.domains !== undefined) setDomains(resume.domains);
      if (resume.programmeDetail !== undefined) setProgrammeDetail(resume.programmeDetail);
      if (resume.selectedSubjectMatch !== undefined) setSelectedSubjectMatch(resume.selectedSubjectMatch);
      if (resume.chosenSchool !== undefined) setChosenSchool(resume.chosenSchool);
      if (resume.offerings) setOfferings(resume.offerings);
      guidanceCompleteRef.current = hasCompletedPath;
      setGuidanceComplete(hasCompletedPath);
    }).catch(() => undefined).finally(() => {
      if (active) setResumeHydrated(true);
    });
    return () => { active = false; };
  }, [guidanceStudentId, staleGuidanceRoute]);

  useEffect(() => {
    if (!staleGuidanceRoute) return;
    router.replace(isAdminExplore ? "/(admin)/guidance-start" as never : "/(tabs)/explore" as never);
  }, [isAdminExplore, router, staleGuidanceRoute]);

  useEffect(() => {
    if (!resumeHydrated) return;
    if (candidates.length || selected) return;
    if (mode === "subjects" && canMatchSubjects) {
      void runSubjectMatch();
    } else if (mode === "programme" && query.trim().length >= 2) {
      void runProgrammeSearch(query);
    }
    // Initial route/checkpoint hydration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeHydrated]);

  const runProgrammeSearch = async (term = query) => {
    const q = term.trim();
    if (q.length < 2) {
      setCandidates([]);
      setNotice(null);
      return;
    }
    setLoading(true);
    setNotice(null);
    setSelected(null);
    try {
      const state = await careerData.searchJambProgrammes(q);
      setCandidates(state.status === "real" && state.data ? state.data : []);
      setNotice(state.meta?.notice ?? null);
    } finally {
      setLoading(false);
    }
  };

  const runSubjectMatch = async () => {
    if (subjectLimitExceeded) {
      setCandidates([]);
      setSubjectMatchAttempted(false);
      setNotice(
        subjectExamType === "utme"
          ? "UTME uses exactly 4 subjects. Remove the extra subject before continuing."
          : `Choose no more than ${MAX_OLEVEL_SUBJECTS} O-level subjects for this check. Remove the extras before continuing.`,
      );
      return;
    }
    if (subjectExamType === "olevel" && olevelSubjects.length < 5) {
      setCandidates([]);
      setNotice("Choose at least five O-level subjects before checking programme fit.");
      return;
    }
    if ((subjectExamType === "utme" || subjectExamType === "combined") && subjects.length < 4) {
      setCandidates([]);
      setNotice("Choose Use of English and three other UTME subjects before matching programmes.");
      return;
    }
    if (subjectExamType === "combined" && olevelSubjects.length < 5) {
      setCandidates([]);
      setNotice("Choose at least five O-level subjects so we can check the programme requirement, not only the UTME gate.");
      return;
    }
    setLoading(true);
    setSubjectMatchAttempted(true);
    setNotice(null);
    setSelected(null);
    try {
      const state = await careerData.getProgrammesBySubjects(
        subjectExamType === "olevel" ? olevelSubjects : subjects,
        stream || undefined,
        {
            examType: subjectExamType,
          olevelSubjects,
        },
      );
      const nextCandidates = (state.status === "real" || state.status === "fallback") && state.data ? state.data : [];
      const matcherAvailable = state.status === "real" || state.status === "fallback";
      setSubjectMatchStatus(matcherAvailable ? "real" : "unavailable");
      setCandidates(nextCandidates);
      setNotice(
        nextCandidates.length === 0 && matcherAvailable
          ? "No programmes match this subject combination yet. Try a different valid combination, or use programme search if you already have a programme in mind."
          : state.status === "fallback"
          ? "We found possible programmes from the published requirement text. Confirm each university's current requirements before deciding."
          : state.meta?.notice ?? null,
      );
      if (guidedSubjectDiscovery) setShowSubjectEditor(false);
    } finally {
      setLoading(false);
    }
  };

  const runSchoolSearch = async () => {
    const q = schoolQuery.trim();
    // Start the school typeahead on the first character so a user can choose
    // from the registry immediately instead of completing the full name.
    if (q.length < 1) {
      setSchoolMatches([]);
      setNotice(null);
      return;
    }
    setLoading(true);
    setNotice(null);
    setChosenSchool(null);
    setOfferings([]);
    try {
      const state = await careerData.searchAdmissionSchools(q);
      setSchoolMatches(state.status === "real" && state.data ? state.data : []);
      setNotice(state.meta?.notice ?? null);
    } finally {
      setLoading(false);
    }
  };

  // Both Explore search fields are typeaheads. Keep the explicit buttons for
  // keyboard/accessibility users, but do not make people finish typing a full
  // institution or programme name before results become selectable.
  useEffect(() => {
    if (mode !== "programme" && mode !== "school") return;
    const term = mode === "programme" ? query.trim() : schoolQuery.trim();
    if (mode === "school" ? term.length < 1 : term.length < 2) {
      if (mode === "programme") setCandidates([]);
      else setSchoolMatches([]);
      return;
    }
    const timer = setTimeout(() => {
      if (mode === "programme") void runProgrammeSearch(term);
      else void runSchoolSearch();
    }, 150);
    return () => clearTimeout(timer);
    // These functions are render-local actions; the state values above are the
    // actual trigger and the timer prevents one request per keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, query, schoolQuery]);

  const chooseSchool = async (school: AdmissionSchool) => {
    markAdminGuidanceInProgress();
    setChosenSchool(school);
    setSelected(null);
    setOfferings([]);
    setLoading(true);
    try {
      const state = await careerData.getSchoolProgrammes(school.id);
      setOfferings(state.status === "real" && state.data ? state.data : []);
      setNotice(state.meta?.notice ?? null);
    } finally {
      setLoading(false);
    }
  };

  // Undergraduate onboarding already resolved the university. Reopen that
  // context directly instead of sending the student back to a generic Home or
  // requiring the university search a second time.
  useEffect(() => {
    if (initialMode !== "school" || !initialSchoolId || chosenSchool) return;
    void chooseSchool({
      id: initialSchoolId,
      name: initialSchoolName || "Selected university",
      institutionType: "university",
    });
    // The route parameters are the persisted onboarding checkpoint here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save the unfinished state to this student's account, not only to the
  // administrator's device. The debounce keeps typing/searching responsive
  // while still making a refresh or a later roster visit resumable.
  useEffect(() => {
    if (
      !guidanceStudentId ||
      !resumeHydrated ||
      guidanceComplete ||
      guidanceCompleteRef.current ||
      finalizingGuidanceRef.current
    ) return;
    const timer = setTimeout(() => {
      const stage: GuidanceResumeSnapshot["stage"] = selectedAdmissionSchool || domains
        ? "domains"
        : selected
          ? "university"
          : candidates.length
            ? "programmes"
            : mode === "subjects"
              ? "subjects"
              : "context";
      const resume: GuidanceResumeSnapshot = {
        status: "in_progress",
        stage,
        mode,
        query,
        schoolQuery,
        subjectText,
        olevelSubjectText,
        subjectExamType,
        contextClass,
        stream,
        candidates: candidates.slice(0, 80),
        selected,
        schools,
        selectedAdmissionSchool,
        domains,
        programmeDetail,
        selectedSubjectMatch,
        chosenSchool,
        offerings,
      };
      void provisioningData.saveGuidancePath(guidanceStudentId, {
        academicContext: {
          class: contextClass || undefined,
          stream: stream || undefined,
        },
        subjects: { olevel: olevelSubjects, utme: subjects },
        discoveryDoor: mode,
        resume,
      }).catch(() => undefined);
    }, 350);
    return () => clearTimeout(timer);
  }, [
    guidanceStudentId,
    resumeHydrated,
    guidanceComplete,
    mode,
    query,
    schoolQuery,
    subjectText,
    olevelSubjectText,
    subjectExamType,
    contextClass,
    stream,
    candidates,
    selected,
    schools,
    selectedAdmissionSchool,
    domains,
    programmeDetail,
    selectedSubjectMatch,
    chosenSchool,
    offerings,
    olevelSubjects,
    subjects,
  ]);

  if (isAdminExplore && !learnerAudience) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
      >
        <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>GUIDANCE CONTEXT</Text>
        <Text style={[styles.title, { color: colors.text }]}>Organisation context unavailable</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>We need the administrator organisation type before showing student guidance. Return to Explore and start again.</Text>
       <CareerDisclaimer variant="footer" />
     </ScrollView>
    );
  }

  const normalizedContextClass = contextClass.trim().toLowerCase();
  const learnerTypeSelected = Boolean(
    learnerAudience?.learnerTypes.includes(normalizedContextClass as never),
  );
  const streamSelected = Boolean(learnerAudience?.streams.includes(stream as never));

  if (isAdminExplore && learnerAudience && (!learnerTypeSelected || (learnerAudience.streamRequired && learnerAudience.streams.length > 0 && !streamSelected))) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
      >
        <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>GUIDANCE CONTEXT</Text>
        <Text style={[styles.title, { color: colors.text }]}>Who are you guiding?</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>{learnerAudience.description} Choose this context before we show admission subjects or programme guidance.</Text>
        <Text style={[styles.label, { color: colors.textSoft }]}>Student type</Text>
        <View style={styles.modeRow}>
          {learnerAudience.learnerTypes.map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setContextClass(value)}
              style={[styles.modeBtn, { backgroundColor: normalizedContextClass === value ? Brand.primary : colors.card, borderColor: colors.border }]}
            >
              <Text style={{ color: normalizedContextClass === value ? colors.textInverse : colors.text }}>{value === "undergraduate" ? "Undergraduate" : value.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {learnerAudience.streams.length ? <>
          <Text style={[styles.label, { color: colors.textSoft }]}>Stream</Text>
          <View style={styles.modeRow}>
            {learnerAudience.streams.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => setStream(value)}
                style={[styles.modeBtn, { backgroundColor: stream === value ? Brand.primary : colors.card, borderColor: colors.border }]}
              >
                <Text style={{ color: stream === value ? colors.textInverse : colors.text }}>{value[0].toUpperCase() + value.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </> : null}
        <Text style={[styles.hint, { color: colors.textMuted }]}>Your choices will determine the admission guidance shown next.</Text>
      </ScrollView>
    );
  }

  /** An offering from your own school routes into the same detail flow. */
  const chooseOffering = async (offering: SchoolProgrammeOffering) => {
    await selectCandidate({
      id: offering.jambProgrammeId,
      jambProgrammeId: offering.jambProgrammeId,
      jambName: offering.jambName,
      studentName: offering.studentName ?? offering.jambName,
      institutionType: offering.institutionType,
      skillsTechnical: offering.skillsTechnical,
      skillsTransferable: offering.skillsTransferable,
      skillsCount: offering.skillsCount,
    });
    // Undergraduate students have already selected the university. Open the
    // university-aware programme page directly; the generic admission browser
    // is for choosing a school or comparing offerings, not for this route.
    if (undergraduateContext && chosenSchool) {
      exploreNav.programme(router, offering.jambProgrammeId, {
        jambProgrammeId: offering.jambProgrammeId,
        schoolId: chosenSchool.id,
        userType: userType || "student",
        focused: isFocusedGuidance,
        guidanceStudentId: guidanceStudentId || undefined,
        guidanceTarget: guidanceTarget || undefined,
        entryPath: guidanceEntry || undefined,
        replaceHistory: isFocusedGuidance,
        journeyMode: "undergraduate_career",
        resumeStage: "programme_preview",
      });
    }
  };

  const selectCandidate = async (candidate: Candidate) => {
    markAdminGuidanceInProgress();
    setSelected(candidate);
    setSchools([]);
    setSelectedAdmissionSchool(null);
    setDomains(null);
    setProgrammeDetail(null);
    setSelectedSubjectMatch(null);
    setSubjectMatchStatus(hasSubjectContext ? "loading" : "idle");
    const id = candidate.jambProgrammeId || candidate.id;
    if (!id) return;
    // A programme result is the user's selection. Open its single programme
    // preview immediately; that screen owns the next decision (which
    // university offers it). Keeping the university list out of this result
    // panel prevents programme identity, university offering, and requirements
    // from competing on one screen. A preselected undergraduate school is
    // carried into the preview as the only exception.
    exploreNav.programme(router, id, {
      jambProgrammeId: id,
      schoolId: undergraduateContext ? chosenSchool?.id : undefined,
      userType: userType || undefined,
      className: contextClass || readParam(params.class_name) || undefined,
      stream: stream || undefined,
      guidanceStudentId: guidanceStudentId || undefined,
      guidanceTarget: guidanceTarget || undefined,
      entryPath: guidanceEntry || undefined,
      replaceHistory: isFocusedGuidance,
      focused: isFocusedGuidance,
      journeyMode: journeyMode || (isFocusedGuidance ? "programme_preview" : undefined),
      resumeStage: "programme_preview",
    });
    return;
  };

  const finalizeAdmissionChoice = async (
    candidate: Candidate,
    school: JambProgrammeSchool,
    validation?: { status: SubjectMatchStatus; match: SubjectProgrammeMatch | null },
  ) => {
    const id = candidate.jambProgrammeId || candidate.id;
    if (!id) return;
    const validationStatus = validation?.status ?? subjectMatchStatus;
    const validationMatch = validation?.match ?? selectedSubjectMatch;
    if (
      hasSubjectContext &&
      (validationStatus === "loading" ||
        validationStatus === "unavailable" ||
        !validationMatch ||
        (validationMatch.eligibilityStatus === "utme_match_olevel_gap" ||
          validationMatch.eligibilityStatus === "utme_match_olevel_unparsed"))
    ) {
      // A subject gap changes eligibility, not the learner's right to inspect
      // the university offering. Mark the selection as view-only; the detail
      // screen can show the exact requirement before the learner changes path.
      setSelectedAdmissionSchool(school);
      setNotice(
        validationStatus === "unavailable"
          ? "Subject fit could not be verified yet. You can inspect this university, but do not treat the route as confirmed."
          : !validationMatch
            ? "This programme does not match the selected subjects. You can inspect the university details, but choose another programme or update the subjects before committing."
            : "Your UTME subjects fit, but your O-level subjects still have gaps. You can inspect the university details, but resolve the gaps before committing.",
      );
      return;
    }
    if (guidanceStudentId) finalizingGuidanceRef.current = true;
    setSelectedAdmissionSchool(school);
    // SS1/SS2 users are browsing a university offering, not committing to a
    // university or completing onboarding. They can still open the same
    // university-specific detail surface and continue into domain guidance.
    if (earlySecondary && !guidanceStudentId) {
      setNotice(`${school.schoolName} is selected for viewing. You can change this before opening programme details.`);
      return;
    }
    try {
      const domainState = await careerData.getJambProgrammeDomains(id);
      setDomains(domainState.status === "real" && domainState.data ? domainState.data : null);
      const selectedPath = {
        academicContext: {
          userType: userType || (isAdminExplore
            ? contextClass === "undergraduate"
              ? "student"
              : contextClass === "jamb"
                ? "jamb"
                : contextClass === "ss3"
                  ? "ss3_secondary"
                  : contextClass
                    ? "senior_secondary"
                    : undefined
            : undefined),
          class: isAdminExplore ? contextClass || undefined : readParam(params.class_name) || undefined,
          stream: stream || undefined,
        },
        discoveryDoor: mode,
        subjects: { olevel: olevelSubjects, utme: subjects },
        subjectMatch: {
          status: subjectMatchStatus === "real" && selectedSubjectMatch &&
            selectedSubjectMatch.eligibilityStatus !== "utme_match_olevel_gap" &&
            selectedSubjectMatch.eligibilityStatus !== "utme_match_olevel_unparsed"
            ? "verified"
            : subjectMatchStatus === "idle"
              ? "not_checked"
              : subjectMatchStatus === "unavailable"
                ? "unavailable"
                : "partial",
          examType: subjectExamType,
          notice: subjectMatchStatus === "unavailable"
            ? "The structured subject requirement check is not available for this path yet."
            : undefined,
        },
        programme: {
          id,
          name: candidateDisplayName(candidate),
          sourceName: candidate.jambName,
        },
        university: {
          id: school.schoolId,
          name: school.schoolName,
          address: school.address ?? null,
        },
        requirements: programmeDetail?.requirements ?? {},
        universityRequirements: {
          utmeSubjects: school.universityUtmeSubjects ?? null,
          olevelRequirement: school.universityOlevelRequirement ?? null,
          note: school.universityNote ?? null,
          requiresReview: Boolean(school.hasUniversityException),
        },
      };
      if (guidanceStudentId) {
        const currentPath = await provisioningData.getGuidancePath(guidanceStudentId);
        const nextPath = appendProgrammeChoice(currentPath?.path ?? {}, selectedPath);
        nextPath.resume = {
          ...(nextPath.resume ?? {}),
          status: "complete",
          stage: "domains",
        };
        await provisioningData.saveGuidancePath(
          guidanceStudentId,
          nextPath,
        );
        invalidateGuidancePathCache();
      } else if (!sessionOnlyGuidance) {
        const existing = await getStartingPoint(user?.id);
        const updated = {
          userType: existing?.userType ?? "jamb",
          ...(existing ?? {}),
          preferredSchoolId: school.schoolId,
          preferredSchool: school.schoolName,
          schoolName: school.schoolName,
          intendedJambProgrammeId: id,
          intendedProgramme: candidateDisplayName(candidate),
          programmeName: candidateDisplayName(candidate),
          jambSubjects: subjects,
          olevelSubjects,
          completedAt: new Date().toISOString(),
        };
        await saveStartingPoint(updated, user?.id);
        const currentPath = await careerData.getGuidancePath();
        const existingPath = currentPath.status === "real" && currentPath.data
          ? currentPath.data.path
          : {};
        await careerData.saveGuidancePath({
          source: "onboarding",
          path: appendProgrammeChoice(existingPath, selectedPath),
        });
        invalidateGuidancePathCache();
        await API.completeOnboarding({ account_type: "student" });
        await refreshUser();
        await clearOnboardingDraft(user?.id);
      }
      if (guidanceStudentId) {
        guidanceCompleteRef.current = true;
        setGuidanceComplete(true);
      }
    } catch {
      // Do not block browsing if profile finalization is temporarily unavailable.
    } finally {
      if (guidanceStudentId) finalizingGuidanceRef.current = false;
    }
  };

  // A university offering is the next decision after the single national
  // JAMB programme result. Open its programme detail immediately so the
  // student sees the school-aware overview and requirements in one flow.
  const openUniversityDetails = async (school: JambProgrammeSchool) => {
    if (!selected) return;
    await finalizeAdmissionChoice(selected, school);
    exploreNav.programme(router, selected.jambProgrammeId || selected.id, {
      jambProgrammeId: selected.jambProgrammeId || selected.id,
      schoolId: school.schoolId,
      userType: userType || undefined,
      guidanceTarget: guidanceTarget || undefined,
      entryPath: guidanceEntry || undefined,
      replaceHistory: isFocusedGuidance,
      focused: isFocusedGuidance,
      viewOnly: Boolean(hasSubjectContext && (subjectMatchStatus !== "real" || !selectedSubjectMatch || selectedSubjectMatch.eligibilityStatus === "utme_match_olevel_gap" || selectedSubjectMatch.eligibilityStatus === "utme_match_olevel_unparsed")),
      journeyMode: journeyMode || undefined,
    });
  };

  if (staleGuidanceRoute) {
    return (
      <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.section, { color: colors.text }]}>This guidance link has expired</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>We did not reopen a checkpoint belonging to a different guidance target.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>
        {guidedSubjectDiscovery ? "GUIDED DISCOVERY" : undergraduateContext ? "MY UNIVERSITY" : "PROGRAMME DISCOVERY"}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        {guidedSubjectDiscovery
          ? earlySecondary
            ? "Programmes to explore from your subjects"
            : "Options from your subject plan"
          : earlySecondary
            ? "Plan subjects and programmes"
            : undergraduateContext
              ? "Explore your university programmes"
            : "Find a programme, university or subject plan"}
      </Text>

      {guidedSubjectDiscovery ? (
        <View style={[styles.subjectPlanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.subjectPlanHeader}>
            <View style={{ flex: 1, gap: Spacing.xs }}>
              <Text style={[styles.section, { color: colors.text }]}>Your subject plan</Text>
              <Text style={[styles.hint, { color: colors.textMuted }]}>These subjects are a starting point for exploring programmes. They are not an admission decision.</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSubjectEditor(true)}
              accessibilityRole="button"
              style={styles.changeSubjectsButton}
            >
              <Text style={[styles.cardMeta, { color: Brand.primaryDeep }]}>Change</Text>
            </TouchableOpacity>
          </View>
          {olevelSubjects.length ? (
            <Text style={[styles.subjectPlanText, { color: colors.text }]}>
              O-level: {olevelSubjects.join(", ")}
            </Text>
          ) : null}
          {subjects.length ? (
            <Text style={[styles.subjectPlanText, { color: colors.text }]}>
              UTME: {subjects.join(", ")}
            </Text>
          ) : null}
        </View>
      ) : null}

       {showAdmissionEditor ? <View style={styles.modeRow}>
         {showSchoolMode ? <ModeButton label={undergraduateContext ? "My university programmes" : "My university"} active={mode === "school"} onPress={() => { markAdminGuidanceInProgress(); setMode("school"); }} /> : null}
        <ModeButton label={undergraduateContext ? "Find a programme" : "Programme"} active={mode === "programme"} onPress={() => { markAdminGuidanceInProgress(); setMode("programme"); }} />
        {!undergraduateContext ? <ModeButton label="Subjects" active={mode === "subjects"} onPress={() => { markAdminGuidanceInProgress(); setMode("subjects"); }} /> : null}
      </View> : null}

      {showAdmissionEditor ? (
        mode === "school" ? (
        <View style={styles.panel}>
          <Text style={[styles.label, { color: colors.textSoft }]}>
            Your university
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={schoolQuery}
              onChangeText={(value) => {
                markAdminGuidanceInProgress();
                setSchoolQuery(value);
                setChosenSchool(null);
                setOfferings([]);
                setSelected(null);
              }}
              placeholder="e.g. University of Lagos, Covenant"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              returnKeyType="search"
              onSubmitEditing={runSchoolSearch}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={runSchoolSearch}
              style={[styles.actionBtn, { backgroundColor: Brand.primary }]}
            >
              <Text style={styles.actionText}>Find</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {undergraduateContext
              ? "Pick your university and choose a programme from its own list. Open the programme to follow what it teaches into domains, subgroups and roles."
              : "Already studying? Pick your university and choose your course from its own list — under the name your school uses."}
          </Text>

          {!chosenSchool && schoolMatches.length ? (
            <View style={styles.results}>
              {schoolMatches.slice(0, 12).map((school) => (
                <TouchableOpacity
                  key={school.id}
                  activeOpacity={0.82}
                  onPress={() => chooseSchool(school)}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{school.name}</Text>
                  {school.institutionType ? (
                    <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                      {school.institutionType}
                    </Text>
                  ) : null}
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                    {[school.address, school.city, school.state, school.country]
                      .filter(Boolean)
                      .join(", ") || "Address not listed"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {chosenSchool ? (
            <View style={styles.panel}>
              <View style={styles.chosenRow}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  {chosenSchool.name}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setChosenSchool(null);
                    setOfferings([]);
                    setSelected(null);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.cardMeta, { color: Brand.primaryDeep }]}>Change</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  value={courseFilter}
                  onChangeText={setCourseFilter}
                  placeholder="Filter your course"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text }]}
                />
              </View>
              {offerings.length ? (
                <View style={styles.results}>
                  {offerings
                    .filter((o) =>
                      courseFilter.trim()
                        ? o.jambName
                            .toLowerCase()
                            .includes(courseFilter.trim().toLowerCase())
                        : true,
                    )
                    .map((o) => {
                      const active = selected?.jambProgrammeId === o.jambProgrammeId;
                      return (
                        <TouchableOpacity
                          key={o.jambProgrammeId}
                          activeOpacity={0.82}
                          onPress={() => chooseOffering(o)}
                          style={[
                            styles.card,
                            {
                              backgroundColor: active ? colors.accent : colors.card,
                              borderColor: active ? colors.accent : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[styles.cardTitle, { color: active ? colors.textInverse : colors.text }]}
                          >
                            {o.jambName}
                          </Text>
                          {!undergraduateContext && o.hasUniversityException ? (
                            <Text style={[styles.cardMeta, { color: active ? colors.textInverse : Brand.primaryDeep }]}>
                              University-specific admission note available
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ) : !loading ? (
                <Text style={[styles.hint, { color: colors.textMuted }]}>
                  No course list recorded for this institution yet.
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      ) : mode === "programme" ? (
        <View style={styles.panel}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Programme name</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={query}
              onChangeText={(value) => {
                markAdminGuidanceInProgress();
                setQuery(value);
                setSelected(null);
              }}
              placeholder="e.g. Computer Science, Nursing, Economics"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              returnKeyType="search"
              onSubmitEditing={() => runProgrammeSearch()}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => runProgrammeSearch()}
              style={[styles.actionBtn, { backgroundColor: Brand.primary }]}
            >
              <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
             {undergraduateContext
               ? "Search by programme name, open the programme learning profile, and follow its connected domains, subgroups, roles and next skills."
               : "Programme search is based on the programme name. Open a result to understand the programme first, then inspect university-specific requirements. Use Subjects when you want subject-based matching."}
          </Text>
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={[styles.label, { color: colors.textSoft }]}>What do you want to check?</Text>
          {!earlySecondary ? <View style={styles.modeRow}>
            <ModeButton label="UTME subjects" active={subjectExamType === "utme"} onPress={() => {
              markAdminGuidanceInProgress();
              setSubjectExamType("utme");
              setCandidates([]);
              setSelected(null);
              setNotice(null);
            }} />
            <ModeButton label="O-level subjects" active={subjectExamType === "olevel"} onPress={() => {
              markAdminGuidanceInProgress();
              setSubjectExamType("olevel");
              setCandidates([]);
              setSelected(null);
              setNotice(null);
            }} />
            <ModeButton label="Both" active={subjectExamType === "combined"} onPress={() => {
              markAdminGuidanceInProgress();
              setSubjectExamType("combined");
              setCandidates([]);
              setSelected(null);
              setNotice(null);
            }} />
          </View> : <Text style={[styles.hint, { color: colors.textMuted }]}>Choose your O-level subjects for early programme guidance. UTME subjects will be shown later as preparation for JAMB.</Text>}
          {subjectExamType !== "olevel" ? (
            <LiveSubjectMultiSelect
              label="Your UTME subjects"
              examType="utme"
              stream={stream || undefined}
              value={subjects}
              onChange={(next) => updateSubjectSelection(next, "utme")}
              minSelected={4}
              maxSelected={4}
              showSearch={false}
              fixedSubjects={["English Language"]}
              helperText="Use of English is fixed. Choose 3 other UTME subjects for the JAMB gate."
            />
          ) : null}
          {subjectExamType !== "utme" ? (
            <LiveSubjectMultiSelect
              label={
                subjectExamType === "olevel"
                  ? "O-level subjects you are taking or considering"
                  : "Your O-level subjects"
              }
              stream={stream || undefined}
              examType="olevel"
              value={olevelSubjects}
              onChange={(next) => updateSubjectSelection(next, "olevel")}
              minSelected={5}
               maxSelected={MAX_OLEVEL_SUBJECTS}
              showSearch={false}
              helperText={
                subjectExamType === "olevel"
                   ? `Choose 5 to ${MAX_OLEVEL_SUBJECTS} O-level subjects for early programme guidance. UTME requirements appear after you open a programme.`
                   : `Choose 5 to ${MAX_OLEVEL_SUBJECTS} O-level subjects so the result can show whether the programme requirement is satisfied or has gaps.`
              }
            />
          ) : null}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={runSubjectMatch}
            disabled={!canMatchSubjects || loading}
            accessibilityState={{ disabled: !canMatchSubjects || loading }}
            style={[
              styles.actionBtn,
              {
                backgroundColor: canMatchSubjects ? Brand.primary : colors.border,
                alignSelf: "flex-start",
              },
            ]}
          >
            <Text style={styles.actionText}>Continue</Text>
          </TouchableOpacity>
          {stream ? (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Stream: {stream}. Stream sorts suggestions; subjects decide eligibility.
            </Text>
          ) : null}
        </View>
      )
      ) : null}

      {notice ? (
        <View style={[styles.notice, { backgroundColor: colors.goldSoft, borderColor: `${Brand.primary}44` }]}>
          <Text style={[styles.noticeText, { color: Brand.primaryDeep }]}>{notice}</Text>
        </View>
      ) : null}

      {loading ? <ActivityIndicator color={Brand.primary} /> : null}

      {mode === "subjects" && !loading && subjectMatchAttempted && subjectMatchStatus === "unavailable" ? (
        <View style={[styles.notice, { backgroundColor: colors.goldSoft, borderColor: `${Brand.primary}66` }]}>
          <Text style={[styles.section, { color: Brand.primaryDeep, marginTop: 0 }]}>Subject matching is unavailable</Text>
          <Text style={[styles.noticeText, { color: colors.text }]}>We could not turn your subjects into a programme match because the structured requirement data is not complete yet.</Text>
          <Text style={[styles.noticeText, { color: colors.text }]}>You can still search for a programme by name, compare the universities with it, and open each university&apos;s published requirements. Your subject choices remain available when the matcher is ready.</Text>
        </View>
      ) : null}

      {mode === "subjects" && !loading && subjectMatchAttempted && subjectMatchStatus !== "unavailable" && !candidates.length && !subjectLimitExceeded ? (
        <View style={[styles.notice, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
          <Text style={[styles.noticeText, { color: colors.text }]}>No programme matches were found for these subjects. You can adjust the subjects and try again.</Text>
        </View>
      ) : null}

      <View style={styles.results}>
        {candidates.map((item) => {
          const active = (selected?.jambProgrammeId || selected?.id) === (item.jambProgrammeId || item.id);
          return (
            <TouchableOpacity
              key={item.jambProgrammeId || item.id}
              activeOpacity={0.82}
              onPress={() => selectCandidate(item)}
              style={[
                styles.card,
                {
                  backgroundColor: active ? colors.accent : colors.card,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: active ? colors.textInverse : colors.text }]}>
                {candidateDisplayName(item)}
              </Text>
              {/* University options intentionally appear only after the user
                  opens the programme preview below. */}
              {/* Was the CCMAS canonical name. A student searching "Computer
                  Engineering" does not need to be told the CCMAS programme is
                  "Computer Engineering" — CCMAS is the mapping substrate, not
                  a fact about their course. What they want to know is what it
                  teaches. */}
              {"matchedSubjectCount" in item ? (
                <View style={styles.matchLines}>
                  <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                    {matchSummary(item)}
                  </Text>
                  {item.olevelMissingSubjects?.length ? (
                    <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                      O-level gaps: {item.olevelMissingSubjects.slice(0, 2).join("; ")}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

       {selected ? (
         <View style={styles.detail}>
           <View style={[styles.requirements, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
             <Text style={[styles.section, { color: colors.text }]}>Programme selected</Text>
             <Text style={[styles.requirementText, { color: colors.textSoft }]}>Open the programme preview to choose a university. University names, addresses, requirements and the full learning profile belong to the next screen, not this search list.</Text>
             {hasSubjectContext ? <Text style={[styles.requirementText, { color: colors.textSoft }]}>{subjectMatchStatus === "loading" ? "Checking your subjects..." : selectedSubjectMatch ? matchSummary(selectedSubjectMatch) : "Subject fit is not confirmed yet."}</Text> : null}
           </View>
           <TouchableOpacity
           onPress={() => exploreNav.programme(router, selected.jambProgrammeId || selected.id, {
               jambProgrammeId: selected.jambProgrammeId || selected.id,
               userType: userType || undefined,
               guidanceTarget: guidanceTarget || undefined,
               entryPath: guidanceEntry || undefined,
               replaceHistory: isFocusedGuidance,
               focused: isFocusedGuidance,
               viewOnly: Boolean(hasSubjectContext && (subjectMatchStatus !== "real" || !selectedSubjectMatch || selectedSubjectMatch.eligibilityStatus === "utme_match_olevel_gap" || selectedSubjectMatch.eligibilityStatus === "utme_match_olevel_unparsed")),
               journeyMode: journeyMode || (isFocusedGuidance ? "programme_preview" : undefined),
               resumeStage: "programme_preview",
             })}
             style={[styles.actionBtn, { backgroundColor: Brand.primary, alignSelf: "flex-start" }]}
           >
             <Text style={styles.actionText}>Open programme preview</Text>
           </TouchableOpacity>
         </View>
       ) : null}
       <CareerDisclaimer variant="footer" />
     </ScrollView>
   );
 }

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.modeBtn,
        {
          backgroundColor: active ? colors.text : colors.card,
          borderColor: active ? colors.text : colors.border,
        },
      ]}
    >
      <Text style={[styles.modeText, { color: active ? colors.textInverse : colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.xxxl * 1.18,
  },
  modeRow: { flexDirection: "row", gap: Spacing.sm },
  modeBtn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  subjectPlanCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  subjectPlanHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  changeSubjectsButton: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  subjectPlanText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  modeText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  panel: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  inputRow: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  input: { flex: 1, fontSize: FontSize.md, minWidth: 0 },
  actionBtn: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionText: { color: "#FFFFFF", fontSize: FontSize.sm, fontWeight: FontWeight.black },
  hint: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  notice: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md },
  noticeText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  matchLines: { gap: 3 },
  chosenRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  results: { gap: Spacing.sm },
  card: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: 3,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  cardMeta: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.35 },
  detail: { gap: Spacing.sm },
  requirements: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md, gap: Spacing.xs },
  requirementLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.black, marginTop: Spacing.xs },
  requirementText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  link: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  section: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    marginTop: Spacing.md,
    textTransform: "uppercase",
  },
  infoRow: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  score: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  chevron: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
});
