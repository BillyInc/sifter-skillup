/**
 * AdmissionBrowseScreen — the admission hub (§Phase 8): search by programme
 * name, or enter your strongest subjects and see what you qualify for.
 *
 * Lifted out of app/(tabs)/explore/admission/index.tsx so the admin Explore
 * stack can mount the same screen. It was 383 lines living in a route file,
 * which is why it could not be reused; every other Explore route is a thin
 * wrapper over a screen in src/screens.
 */
import React, { useEffect, useMemo, useState } from "react";
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
import { DegreeSkills, GuidanceReportButton, invalidateGuidancePathCache } from "@/components/careerIntelligence";
import { LiveSubjectMultiSelect } from "@/components/onboarding/LiveSubjectMultiSelect";
import { useExploreNav } from "@/lib/exploreNav";
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
 *                  every variation of it, because universities list the same
 *                  course under different names.
 *  - "subjects"  — ENROLLING and you don't. Enter your strongest subjects.
 */
type Mode = "school" | "programme" | "subjects";
type Candidate = JambProgrammeSuggestion | SubjectProgrammeMatch;
type SubjectMatchStatus = "idle" | "loading" | "real" | "unavailable";

function candidateDisplayName(candidate: Candidate): string {
  return candidate.studentName || candidate.jambName || "Programme";
}

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function matchSummary(item: SubjectProgrammeMatch): string {
  if (item.matchBasis === "combined") {
    if (item.eligibilityStatus === "eligible") {
      return "UTME gate matches and O-level requirement is satisfied.";
    }
    if (item.eligibilityStatus === "utme_match_olevel_gap") {
      return "UTME gate matches, but the O-level requirement still has gaps.";
    }
    return "UTME gate matches. O-level requirement needs review before this is treated as eligible.";
  }
  if (item.matchBasis === "olevel") {
    return "O-level requirement matches your selected subjects. Check the UTME subjects before applying.";
  }
  return "UTME subjects match where requirements are parsed. Check O-level subjects before deciding.";
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
  }>();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { refreshUser, user } = useAuth();
  const { colors } = useTheme();
  const rawMode = readParam(params.mode);
  const initialMode: Mode =
    rawMode === "subjects" ? "subjects" : rawMode === "school" ? "school" : "programme";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [query, setQuery] = useState(readParam(params.q));
  const [subjectText, setSubjectText] = useState(
    decodeURIComponent(readParam(params.subjects)).replace(/,/g, ", "),
  );
  const [olevelSubjectText, setOlevelSubjectText] = useState(
    decodeURIComponent(readParam(params.olevel_subjects)).replace(/,/g, ", "),
  );
  const rawExamType = readParam(params.exam_type);
  const [subjectExamType] = useState<"olevel" | "combined">(
    rawExamType === "olevel" ? "olevel" : "combined",
  );
  const isAdminExplore = readParam(params.admin) === "1";
  const adminType = readParam(params.admin_type);
  const guidanceStudentId = readParam(params.guidance_student_id);
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
  const [programmeDetail, setProgrammeDetail] = useState<JambProgrammeDetail | null>(null);

  // School-first (enrolled) state.
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolMatches, setSchoolMatches] = useState<AdmissionSchool[]>([]);
  const [chosenSchool, setChosenSchool] = useState<AdmissionSchool | null>(null);
  const initialSchoolId = readParam(params.school_id);
  const initialSchoolName = readParam(params.school_name);
  const [offerings, setOfferings] = useState<SchoolProgrammeOffering[]>([]);
  const [courseFilter, setCourseFilter] = useState("");

  const subjects = useMemo(
    () => subjectText.split(",").map((s) => s.trim()).filter(Boolean),
    [subjectText],
  );
  const olevelSubjects = useMemo(
    () => olevelSubjectText.split(",").map((s) => s.trim()).filter(Boolean),
    [olevelSubjectText],
  );
  const hasSubjectContext = subjects.length >= 4 && olevelSubjects.length >= 5;
  const canMatchSubjects =
    subjectExamType === "olevel"
      ? olevelSubjects.length >= 5
      : subjects.length >= 4 && olevelSubjects.length >= 5;

  const updateSubjectSelection = (next: string[], kind: "utme" | "olevel") => {
    if (kind === "utme") setSubjectText(next.join(", "));
    else setOlevelSubjectText(next.join(", "));
    // A previous match is no longer valid after the subject set changes.
    // Requiring a fresh click also prevents stale results from appearing while
    // the selection is below the minimum gate.
    setCandidates([]);
    setSelected(null);
    setNotice(null);
  };

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

  useEffect(() => {
    if (initialMode === "subjects" && canMatchSubjects) {
      void runSubjectMatch();
    } else if (initialMode === "programme" && query.trim().length >= 2) {
      void runProgrammeSearch(query);
    }
    // Initial route hydration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (subjectExamType === "olevel" && olevelSubjects.length < 5) {
      setCandidates([]);
      setNotice("Choose at least five O-level subjects before checking programme fit.");
      return;
    }
    if (subjectExamType === "combined" && subjects.length < 4) {
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
      setCandidates((state.status === "real" || state.status === "fallback") && state.data ? state.data : []);
      setNotice(
        state.status === "fallback"
          ? "We found possible programmes from the published requirement text. Confirm each university's current requirements before deciding."
          : state.meta?.notice ?? null,
      );
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

  if (isAdminExplore && !learnerAudience && !guidanceStudentId) {
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

  if (isAdminExplore && learnerAudience && !guidanceStudentId && (!learnerTypeSelected || (learnerAudience.streamRequired && learnerAudience.streams.length > 0 && !streamSelected))) {
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

  const chooseSchool = async (school: AdmissionSchool) => {
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
  };

  const selectCandidate = async (candidate: Candidate) => {
    setSelected(candidate);
    setSchools([]);
    setSelectedAdmissionSchool(null);
    setDomains(null);
    setProgrammeDetail(null);
    setSelectedSubjectMatch(null);
    setSubjectMatchStatus(hasSubjectContext ? "loading" : "idle");
    const id = candidate.jambProgrammeId || candidate.id;
    if (!id) return;
    const [schoolState, detailState, subjectState] = await Promise.all([
      careerData.getJambProgrammeSchools(id),
      careerData.getJambProgramme(id),
      hasSubjectContext
        ? careerData.getProgrammesBySubjects(subjects, stream || undefined, {
            examType: "combined",
            olevelSubjects,
          })
        : Promise.resolve(null),
    ]);
    setProgrammeDetail(
      detailState.status === "real" && detailState.data ? detailState.data : null,
    );
    let nextSubjectMatch: SubjectProgrammeMatch | null = null;
    let nextSubjectMatchStatus: SubjectMatchStatus = hasSubjectContext ? "unavailable" : "idle";
    if (hasSubjectContext) {
      if (subjectState?.status === "real" || subjectState?.status === "fallback") {
        nextSubjectMatch = (subjectState.data ?? []).find(
          (item) => (item.jambProgrammeId || item.id) === id,
        ) ?? null;
        nextSubjectMatchStatus = "real";
      } else {
        nextSubjectMatchStatus = "unavailable";
      }
    }
    setSelectedSubjectMatch(nextSubjectMatch);
    setSubjectMatchStatus(nextSubjectMatchStatus);
    const availableSchools =
      (schoolState.status === "real" || schoolState.status === "fallback") && schoolState.data
        ? schoolState.data
        : [];
    setSchools(availableSchools);
    const onboardingSchool = initialSchoolId
      ? availableSchools.find((school) => school.schoolId === initialSchoolId)
      : null;
    if (chosenSchool || onboardingSchool) {
      await finalizeAdmissionChoice(candidate, {
        schoolId: chosenSchool?.id ?? onboardingSchool?.schoolId ?? "",
        schoolName: chosenSchool?.name ?? onboardingSchool?.schoolName ?? initialSchoolName,
        institutionType: chosenSchool?.institutionType ?? onboardingSchool?.institutionType,
        jambProgrammeId: id,
        jambName: candidate.jambName,
        studentName: candidateDisplayName(candidate),
        programmeId: null,
        programmeName: candidateDisplayName(candidate),
        year: undefined,
        aggregateCutoff: null,
        jambCutoff: null,
        form: null,
        sourceUrl: null,
      }, { status: nextSubjectMatchStatus, match: nextSubjectMatch });
    }
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
        validationMatch.eligibilityStatus === "utme_match_olevel_gap")
    ) {
      setNotice(
        validationStatus === "unavailable"
          ? "We could not verify this programme against your subjects yet. Please try again before choosing a university."
          : !validationMatch
            ? "This programme does not match the UTME subjects you selected. Choose another programme or change your subjects."
            : "Your UTME subjects fit this programme, but your O-level subjects still have gaps. Check the missing requirements before choosing a university.",
      );
      return;
    }
    setSelectedAdmissionSchool(school);
    const domainState = await careerData.getJambProgrammeDomains(id);
    setDomains(domainState.status === "real" && domainState.data ? domainState.data : null);
    try {
      const selectedPath = {
        discoveryDoor: mode,
        subjects: { olevel: olevelSubjects, utme: subjects },
        programme: {
          id,
          name: candidateDisplayName(candidate),
          sourceName: candidate.jambName,
        },
        university: {
          id: school.schoolId,
          name: school.schoolName,
        },
        requirements: programmeDetail?.requirements ?? {},
      };
      if (guidanceStudentId) {
        const currentPath = await provisioningData.getGuidancePath(guidanceStudentId);
        await provisioningData.saveGuidancePath(guidanceStudentId, {
          ...(currentPath?.path ?? {}),
          ...selectedPath,
        });
        invalidateGuidancePathCache();
      } else {
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
          path: { ...existingPath, ...selectedPath },
        });
        invalidateGuidancePathCache();
        await API.completeOnboarding({ account_type: "student" });
        await refreshUser();
        await clearOnboardingDraft(user?.id);
      }
    } catch {
      // Do not block browsing if profile finalization is temporarily unavailable.
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>ADMISSION PATH</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Find programmes, universities, requirements and career paths
      </Text>

      <View style={styles.modeRow}>
        <ModeButton label="My university" active={mode === "school"} onPress={() => setMode("school")} />
        <ModeButton label="Programme" active={mode === "programme"} onPress={() => setMode("programme")} />
        <ModeButton label="Subjects" active={mode === "subjects"} onPress={() => setMode("subjects")} />
      </View>

      {mode === "school" ? (
        <View style={styles.panel}>
          <Text style={[styles.label, { color: colors.textSoft }]}>
            Your university
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={schoolQuery}
              onChangeText={(value) => {
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
            Already studying? Pick your university and choose your course from
            its own list — under the name your school uses.
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
                    .slice(0, 40)
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
                          <DegreeSkills
                            technical={o.skillsTechnical}
                            transferable={o.skillsTransferable}
                            total={o.skillsCount}
                            variant="teaser"
                            color={active ? colors.textInverse : undefined}
                          />
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
            Programme search is based on the programme name. Open a result to
            review its UTME and O-level requirements, or use Subjects when you
            want subject-based matching.
          </Text>
        </View>
      ) : (
        <View style={styles.panel}>
          {subjectExamType === "combined" ? (
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
            maxSelected={9}
            showSearch={false}
            helperText={
              subjectExamType === "olevel"
                ? "Choose at least 5 O-level subjects for early programme guidance. UTME requirements appear after you open a programme."
                : "Choose at least 5 O-level subjects so the result can show whether the programme requirement is satisfied or has gaps."
            }
          />
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
            <Text style={styles.actionText}>Match programmes</Text>
          </TouchableOpacity>
          {stream ? (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Stream: {stream}. Stream sorts suggestions; subjects decide eligibility.
            </Text>
          ) : null}
        </View>
      )}

      {notice ? (
        <View style={[styles.notice, { backgroundColor: colors.goldSoft, borderColor: `${Brand.primary}44` }]}>
          <Text style={[styles.noticeText, { color: Brand.primaryDeep }]}>{notice}</Text>
        </View>
      ) : null}

      {loading ? <ActivityIndicator color={Brand.primary} /> : null}

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
              {item.schoolOfferings?.length ? (
                <View style={styles.matchLines}>
                  <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>University offerings</Text>
                  {item.schoolOfferings.slice(0, 2).map((offering) => (
                    <Text
                      key={`${offering.schoolName}-${offering.programmeName}`}
                      style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}
                    >
                      {offering.schoolName}: {offering.studentName ?? offering.programmeName}
                    </Text>
                  ))}
                  {(item.schoolCount ?? 0) > 2 ? (
                    <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>+ {(item.schoolCount ?? 0) - 2} more universities</Text>
                  ) : null}
                </View>
              ) : item.schoolNames?.length || item.schoolCount ? (
                <Text
                  style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}
                >
                  {item.schoolNames?.length
                    ? `Offered by ${item.schoolNames.slice(0, 3).join(", ")}${
                        (item.schoolCount ?? 0) > 3 ? ` + ${(item.schoolCount ?? 0) - 3} more` : ""
                      }`
                    : `Listed by ${item.schoolCount} universities`}
                </Text>
              ) : null}
              {/* Was the CCMAS canonical name. A student searching "Computer
                  Engineering" does not need to be told the CCMAS programme is
                  "Computer Engineering" — CCMAS is the mapping substrate, not
                  a fact about their course. What they want to know is what it
                  teaches. */}
              <DegreeSkills
                technical={item.skillsTechnical}
                transferable={item.skillsTransferable}
                total={item.skillsCount}
                variant="teaser"
                color={active ? colors.textInverse : undefined}
              />
              {item.jambFaculty ? (
                <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                  {item.jambFaculty}
                </Text>
              ) : null}
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
          <DegreeSkills
            technical={selected.skillsTechnical}
            transferable={selected.skillsTransferable}
          />

          <Text style={[styles.section, { color: colors.textSoft }]}>Published entry requirements</Text>
          {programmeDetail?.requirements ? (
            <View style={[styles.requirements, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
              <Text style={[styles.requirementLabel, { color: colors.text }]}>UTME subjects</Text>
              <Text style={[styles.requirementText, { color: colors.textSoft }]}>
                {programmeDetail.requirements.utmeSubjects || "Not listed in the available brochure data."}
              </Text>
              <Text style={[styles.requirementLabel, { color: colors.text }]}>O-level credits</Text>
              <Text style={[styles.requirementText, { color: colors.textSoft }]}>
                {programmeDetail.requirements.olevelRequirement || "Not listed in the available brochure data."}
              </Text>
              {programmeDetail.requirements.variesByInstitution ? (
                <Text style={[styles.requirementText, { color: colors.textMuted }]}>
                  Universities may add or phrase requirements differently. Review the selected university&apos;s current admission notice before applying.
                </Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.hint, { color: colors.textMuted }]}>The published requirement text is not available for this programme yet. We will still show the universities that list it.</Text>
          )}

          <Text style={[styles.section, { color: colors.textSoft }]}>Schools & admission</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Choose a university before career-domain mapping starts.
          </Text>
          {hasSubjectContext ? (
            <View style={[styles.notice, { backgroundColor: colors.surface.subtle, borderColor: colors.border }]}>
              <Text style={[styles.noticeText, { color: colors.text }]}>
                {subjectMatchStatus === "loading"
                  ? "Checking this programme against your UTME and O-level subjects..."
                  : subjectMatchStatus === "unavailable"
                    ? "We could not verify the subject requirements right now. University selection is paused until the check succeeds."
                    : selectedSubjectMatch
                      ? matchSummary(selectedSubjectMatch)
                      : "This programme does not match the selected UTME subjects."}
              </Text>
            </View>
          ) : null}
          {schools.length ? (
            schools.slice(0, 12).map((school) => (
              <TouchableOpacity
                key={`${school.schoolId}-${school.form ?? "offer"}`}
                activeOpacity={0.8}
                onPress={() => finalizeAdmissionChoice(selected, school)}
                disabled={
                  hasSubjectContext &&
                  (subjectMatchStatus !== "real" ||
                    !selectedSubjectMatch ||
                    selectedSubjectMatch.eligibilityStatus === "utme_match_olevel_gap")
                }
                style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: colors.text }]}>{school.schoolName}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                    {school.year ? `${school.year} cycle` : "Offering listed"}
                  </Text>
                </View>
                <Text style={[styles.score, { color: colors.text }]}>
                  {selectedAdmissionSchool?.schoolId === school.schoolId ? "Selected" : "Choose"}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.hint, { color: colors.textMuted }]}>No university admission rows are available yet.</Text>
          )}

          <Text style={[styles.section, { color: colors.textSoft }]}>Domains and roles</Text>
          {domains?.domains?.length ? (
            domains.domains.map((domain) => (
              <View key={domain.domainId} style={{ gap: Spacing.xs }}>
                <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => exploreNav.domain(router, domain.domainId, guidanceStudentId)}
                style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: colors.text }]}>{domain.domainName}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                    {domain.cluster} · {domain.matchType}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textMuted }]}>→</Text>
              </TouchableOpacity>
                <GuidanceReportButton
                selection={{
                  kind: "domains",
                  id: domain.domainId,
                  name: domain.domainName,
                  matchType: domain.matchType,
                }}
                targetStudentId={guidanceStudentId || undefined}
                />
              </View>
            ))
          ) : (
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              {selectedAdmissionSchool
                ? "No domain paths yet."
                : "Choose a university above to unlock programme-to-domain mapping."}
            </Text>
          )}
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
  actionText: { color: "#fff", fontSize: FontSize.sm, fontWeight: FontWeight.black },
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
