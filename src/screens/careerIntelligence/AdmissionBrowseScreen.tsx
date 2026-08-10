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
import { useAuth } from "@/hooks/useAuth";
import { DegreeSkills } from "@/components/careerIntelligence";
import { useExploreNav } from "@/lib/exploreNav";
import type {
  AdmissionSchool,
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

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function AdmissionBrowseScreen() {
  const params = useLocalSearchParams<{
    mode?: string | string[];
    q?: string | string[];
    subjects?: string | string[];
    stream?: string | string[];
  }>();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const { refreshUser } = useAuth();
  const { colors } = useTheme();
  const rawMode = readParam(params.mode);
  const initialMode: Mode =
    rawMode === "subjects" ? "subjects" : rawMode === "school" ? "school" : "programme";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [query, setQuery] = useState(readParam(params.q));
  const [subjectText, setSubjectText] = useState(
    decodeURIComponent(readParam(params.subjects)).replace(/,/g, ", "),
  );
  const [stream] = useState(readParam(params.stream));
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [schools, setSchools] = useState<JambProgrammeSchool[]>([]);
  const [selectedAdmissionSchool, setSelectedAdmissionSchool] = useState<JambProgrammeSchool | null>(null);
  const [domains, setDomains] = useState<JambDomainResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // School-first (enrolled) state.
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolMatches, setSchoolMatches] = useState<AdmissionSchool[]>([]);
  const [chosenSchool, setChosenSchool] = useState<AdmissionSchool | null>(null);
  const [offerings, setOfferings] = useState<SchoolProgrammeOffering[]>([]);
  const [courseFilter, setCourseFilter] = useState("");

  const subjects = useMemo(
    () => subjectText.split(",").map((s) => s.trim()).filter(Boolean),
    [subjectText],
  );

  const runProgrammeSearch = async (term = query) => {
    const q = term.trim();
    if (q.length < 2) return;
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
    if (!subjects.length) return;
    setLoading(true);
    setNotice(null);
    setSelected(null);
    try {
      const state = await careerData.getProgrammesBySubjects(subjects, stream || undefined);
      setCandidates((state.status === "real" || state.status === "fallback") && state.data ? state.data : []);
      setNotice(state.meta?.notice ?? null);
    } finally {
      setLoading(false);
    }
  };

  const runSchoolSearch = async () => {
    const q = schoolQuery.trim();
    if (q.length < 2) return;
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
    const id = candidate.jambProgrammeId || candidate.id;
    if (!id) return;
    const schoolState = await careerData.getJambProgrammeSchools(id);
    setSchools(
      (schoolState.status === "real" || schoolState.status === "fallback") && schoolState.data
        ? schoolState.data
        : [],
    );
    if (chosenSchool) {
      await finalizeAdmissionChoice(candidate, {
        schoolId: chosenSchool.id,
        schoolName: chosenSchool.name,
        institutionType: chosenSchool.institutionType,
        jambProgrammeId: id,
        jambName: candidate.jambName,
        programmeId: null,
        programmeName: candidate.jambName,
        year: undefined,
        aggregateCutoff: null,
        jambCutoff: null,
        form: null,
        sourceUrl: null,
      });
    }
  };

  const finalizeAdmissionChoice = async (candidate: Candidate, school: JambProgrammeSchool) => {
    const id = candidate.jambProgrammeId || candidate.id;
    if (!id) return;
    setSelectedAdmissionSchool(school);
    const domainState = await careerData.getJambProgrammeDomains(id);
    setDomains(domainState.status === "real" && domainState.data ? domainState.data : null);
    try {
      const existing = await getStartingPoint();
      const updated = {
        userType: existing?.userType ?? "jamb",
        ...(existing ?? {}),
        preferredSchoolId: school.schoolId,
        preferredSchool: school.schoolName,
        schoolName: school.schoolName,
        intendedJambProgrammeId: id,
        intendedProgramme: candidate.jambName,
        programmeName: candidate.jambName,
        completedAt: new Date().toISOString(),
      };
      await saveStartingPoint(updated);
      await API.completeOnboarding({});
      await refreshUser();
    } catch {
      // Do not block browsing if profile finalization is temporarily unavailable.
    }
  };

  useEffect(() => {
    if (initialMode === "subjects" && subjects.length) {
      void runSubjectMatch();
    } else if (initialMode === "programme" && query.trim().length >= 2) {
      void runProgrammeSearch(query);
    }
    // Initial route hydration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              onChangeText={setSchoolQuery}
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
              onChangeText={setQuery}
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
        </View>
      ) : (
        <View style={styles.panel}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Subjects</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              value={subjectText}
              onChangeText={setSubjectText}
              placeholder="English, Mathematics, Economics"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              returnKeyType="search"
              onSubmitEditing={runSubjectMatch}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={runSubjectMatch}
              style={[styles.actionBtn, { backgroundColor: Brand.primary }]}
            >
              <Text style={styles.actionText}>Match</Text>
            </TouchableOpacity>
          </View>
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
                {item.jambName}
              </Text>
              {/* Was the CCMAS canonical name. A student searching "Computer
                  Engineering" does not need to be told the CCMAS programme is
                  "Computer Engineering" — CCMAS is the mapping substrate, not
                  a fact about their course. What they want to know is what it
                  teaches. */}
              <DegreeSkills
                technical={item.skillsTechnical}
                transferable={item.skillsTransferable}
                variant="teaser"
                color={active ? colors.textInverse : undefined}
              />
              {item.jambFaculty ? (
                <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                  {item.jambFaculty}
                </Text>
              ) : null}
              {"matchedSubjectCount" in item ? (
                <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                  Matches your selected subjects where requirements are parsed · {item.matchBasis}
                </Text>
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

          <Text style={[styles.section, { color: colors.textSoft }]}>Schools & admission</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Choose a university before career-domain mapping starts.
          </Text>
          {schools.length ? (
            schools.slice(0, 12).map((school) => (
              <TouchableOpacity
                key={`${school.schoolId}-${school.form ?? "offer"}`}
                activeOpacity={0.8}
                onPress={() => finalizeAdmissionChoice(selected, school)}
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
              <TouchableOpacity
                key={domain.domainId}
                activeOpacity={0.8}
                onPress={() => exploreNav.domain(router, domain.domainId)}
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
