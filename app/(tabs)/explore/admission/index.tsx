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
import { careerData } from "../../../../src/lib/careerData";
import { exploreNav } from "../../../../src/lib/exploreNav";
import type {
  JambProgrammeSchool,
  JambProgrammeSuggestion,
  SubjectProgrammeMatch,
} from "../../../../src/lib/careerData";
import type { JambDomainResult } from "../../../../src/types/career";
import {
  Brand,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
  webContainer,
} from "../../../../src/theme";

type Mode = "programme" | "subjects";
type Candidate = JambProgrammeSuggestion | SubjectProgrammeMatch;

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default function AdmissionBrowseRoute() {
  const params = useLocalSearchParams<{
    mode?: string | string[];
    q?: string | string[];
    subjects?: string | string[];
    stream?: string | string[];
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const initialMode = readParam(params.mode) === "subjects" ? "subjects" : "programme";
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
  const [domains, setDomains] = useState<JambDomainResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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

  const selectCandidate = async (candidate: Candidate) => {
    setSelected(candidate);
    setSchools([]);
    setDomains(null);
    const id = candidate.jambProgrammeId || candidate.id;
    if (!id) return;
    const [schoolState, domainState] = await Promise.all([
      careerData.getJambProgrammeSchools(id),
      careerData.getJambProgrammeDomains(id),
    ]);
    setSchools(
      (schoolState.status === "real" || schoolState.status === "fallback") && schoolState.data
        ? schoolState.data
        : [],
    );
    setDomains(domainState.status === "real" && domainState.data ? domainState.data : null);
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
        Find programmes, schools, cut-offs and career paths
      </Text>

      <View style={styles.modeRow}>
        <ModeButton label="Programme" active={mode === "programme"} onPress={() => setMode("programme")} />
        <ModeButton label="Subjects" active={mode === "subjects"} onPress={() => setMode("subjects")} />
      </View>

      {mode === "programme" ? (
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
          const active = selected?.jambProgrammeId === item.jambProgrammeId;
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
              <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                {item.canonicalProgrammeName || item.discipline || "JAMB programme"}
              </Text>
              {"matchedSubjectCount" in item ? (
                <Text style={[styles.cardMeta, { color: active ? colors.textInverse : colors.textMuted }]}>
                  {item.matchedSubjectCount} subject match · {item.matchBasis}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.detail}>
          <Text style={[styles.section, { color: colors.textSoft }]}>Schools and cut-offs</Text>
          {schools.length ? (
            schools.slice(0, 12).map((school) => (
              <View
                key={`${school.schoolId}-${school.form ?? "offer"}`}
                style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: colors.text }]}>{school.schoolName}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                    {school.year ? `${school.year} cycle` : "Offering listed"}
                  </Text>
                </View>
                <Text style={[styles.score, { color: colors.text }]}>
                  {school.jambCutoff ?? school.aggregateCutoff ?? "—"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.hint, { color: colors.textMuted }]}>No school/cut-off rows yet.</Text>
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
            <Text style={[styles.hint, { color: colors.textMuted }]}>No domain paths yet.</Text>
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
