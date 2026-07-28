/**
 * JambSetupForm — Step-2 body for SS3 / UTME candidates.
 *
 * Mirrors the admission mechanism with three doors (no personality test):
 *   know_where → programme + institution type + school
 *   know_what  → programme only (institutions & cut-offs are "Live soon")
 *   unsure     → strongest subjects → eligible programmes once data is live
 *
 * Selectors that need CCMAS/IBASS data render `comingSoon`; subject lists are
 * standard public WAEC/UTME subjects, so they are safe to hardcode.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme, Spacing, FontSize, Radius, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { careerData } from "../../lib/careerData";
import {
  OptionCard,
  ChoiceChips,
  SearchField,
  type ChoiceOption,
} from "./primitives";
import type {
  SetupFormProps,
  SsDoor,
  InstitutionType,
} from "../../types/onboarding";

const DOORS: {
  value: SsDoor;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "know_where",
    icon: "🎯",
    title: "I know what I want to study and where",
    subtitle: "Programme + preferred school",
  },
  {
    value: "know_what",
    icon: "📖",
    title: "I know what to study, not where",
    subtitle: "We'll surface schools and cut-offs for it",
  },
  {
    value: "unsure",
    icon: "🧭",
    title: "I don't know yet",
    subtitle: "Pick your strongest subjects and explore",
  },
];

const INSTITUTION_TYPES: { label: string; value: InstitutionType }[] = [
  { label: "University", value: "university" },
  { label: "College of Education", value: "college_of_education" },
  { label: "Polytechnic", value: "polytechnic" },
  { label: "Monotechnic", value: "monotechnic" },
  { label: "College of Health", value: "college_of_health" },
  { label: "Technical College", value: "technical_college" },
];

const SUBJECTS: ChoiceOption[] = [
  "English Language",
  "Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
  "Literature in English",
  "Geography",
  "Agricultural Science",
  "Commerce",
  "Accounting/Financial Accounting",
  "Further Mathematics",
  "Civic Education",
  "CRS/IRS",
  "History",
  "Computer Studies",
  "Technical Drawing",
  "Visual Arts",
  "Yoruba/Hausa/Igbo",
].map((s) => ({ label: s, value: s }));

const STREAMS: ChoiceOption[] = [
  { label: "Science", value: "science" },
  { label: "Commercial", value: "commercial" },
  { label: "Art", value: "art" },
];

const SCORE_BANDS: ChoiceOption[] = [
  "Below 180",
  "180–219",
  "220–249",
  "250–279",
  "280+",
].map((b) => ({ label: b, value: b }));

type Suggestion = { id: string; name: string };

/**
 * Live typeahead over admission programmes/schools. Debounced; taps a
 * suggestion to fill `value`. Falls back silently if the endpoint is empty.
 */
function LiveSearchField({
  label,
  value,
  onSelect,
  placeholder,
  kind,
}: {
  label: string;
  value: string;
  onSelect: (item: Suggestion) => void;
  placeholder: string;
  kind: "programme" | "school";
}) {
  const { colors } = useTheme();
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const state =
        kind === "programme"
          ? await careerData.searchJambProgrammes(q)
          : await careerData.searchAdmissionSchools(q);
      if (!active) return;
      setLoading(false);
      setResults(
        state.status === "real" && Array.isArray(state.data)
          ? state.data.map((r) => ({
              id: r.id,
              name: "jambName" in r ? r.jambName : r.name,
            }))
          : [],
      );
    }, 275);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, kind]);

  return (
    <View style={{ gap: 6 }}>
      <SearchField
        label={label}
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setOpen(true);
          onSelect({ id: "", name: v });
        }}
        placeholder={placeholder}
      />
      {loading ? (
        <ActivityIndicator size="small" color={Brand.primary} />
      ) : null}
      {open && results.length ? (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {results.slice(0, 6).map((r) => (
            <TouchableOpacity
              key={r.id}
              activeOpacity={0.7}
              onPress={() => {
                setQuery(r.name);
                onSelect(r);
                setOpen(false);
                setResults([]);
              }}
              style={styles.suggestion}
            >
              <Text style={[styles.suggestionText, { color: colors.text }]}>
                {r.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function JambSetupForm({ value, onChange, onContinue }: SetupFormProps) {
  const { colors } = useTheme();
  const door = value.ssDoor;

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          JAMB / SS3 setup
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Which best describes where you are with your choice?
        </Text>
      </View>

      <View style={{ gap: Spacing.md }}>
        {DOORS.map((d) => (
          <OptionCard
            key={d.value}
            icon={d.icon}
            title={d.title}
            subtitle={d.subtitle}
            selected={door === d.value}
            onPress={() => onChange({ ssDoor: d.value })}
          />
        ))}
      </View>

      <ChoiceChips
        label="Your school stream (guidance hint)"
        options={STREAMS}
        value={value.stream}
        onChange={(v) => onChange({ stream: v as "science" | "commercial" | "art" })}
      />
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        Stream helps sort suggestions, but selected subjects decide eligibility.
      </Text>

      {door === "know_where" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveSearchField
            label="Intended programme"
            value={value.intendedProgramme ?? ""}
            onSelect={(item) => onChange({
              intendedProgramme: item.name,
              intendedJambProgrammeId: item.id || undefined,
            })}
            placeholder="e.g. Mechanical Engineering"
            kind="programme"
          />
          <ChoiceChips
            label="Preferred institution type"
            options={INSTITUTION_TYPES}
            value={value.preferredInstitutionType}
            onChange={(v) =>
              onChange({ preferredInstitutionType: v as InstitutionType })
            }
          />
          <LiveSearchField
            label="Preferred school"
            value={value.preferredSchool ?? ""}
            onSelect={(item) => onChange({
              preferredSchool: item.name,
              preferredSchoolId: item.id || undefined,
            })}
            placeholder="Search universities"
            kind="school"
          />
        </View>
      ) : null}

      {door === "know_what" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveSearchField
            label="Intended programme"
            value={value.intendedProgramme ?? ""}
            onSelect={(item) => onChange({
              intendedProgramme: item.name,
              intendedJambProgrammeId: item.id || undefined,
            })}
            placeholder="e.g. Economics"
            kind="programme"
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            🎓 We&apos;ll surface the universities offering this programme and their
            JAMB / Post-UTME cut-offs from the latest admission snapshot.
          </Text>
        </View>
      ) : null}

      {door === "unsure" ? (
        <View style={{ gap: Spacing.lg }}>
          <ChoiceChips
            label="Select your strongest subjects"
            options={SUBJECTS}
            value={value.jambSubjects}
            onChange={(v) => onChange({ jambSubjects: v as string[] })}
            multi
          />
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            We&apos;ll match these to programmes you qualify for once programme data
            is live.
          </Text>
          <ChoiceChips
            label="Your JAMB score band (optional)"
            options={SCORE_BANDS}
            value={value.jambScoreBand}
            onChange={(v) => onChange({ jambScoreBand: v as string })}
          />
        </View>
      ) : null}

      <SifterButton
        label="Continue →"
        onPress={onContinue}
        disabled={!door}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  note: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  caption: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  suggestions: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  suggestion: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  suggestionText: { fontSize: FontSize.sm },
});

export default JambSetupForm;
