/**
 * SeniorSecondaryExploreSetupForm — Step-2 body for SS1 / SS2 explorers.
 *
 * Separate gateway from the JAMB / SS3 door: focused on career-intelligence
 * exploration and subject-choice guidance, NOT UTME cut-offs or score bands
 * (not relevant this early). We capture the SS class, the subjects they're
 * strongest in / enjoy, and what they want to do, then map
 * subjects → programmes → domains → roles once programme data is live.
 *
 * Subject lists are standard public WAEC/UTME subjects, so they are safe to
 * hardcode; a programme search renders `comingSoon` until that data is added.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { OptionCard, ChoiceChips, SearchField, type ChoiceOption } from "./primitives";
import type { SetupFormProps } from "../../types/onboarding";

const SS_CLASSES: {
  value: "ss1" | "ss2";
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "ss1",
    icon: "🌱",
    title: "I'm in SS1",
    subtitle: "Plenty of time to explore and choose well",
  },
  {
    value: "ss2",
    icon: "🌿",
    title: "I'm in SS2",
    subtitle: "Firming up subjects ahead of SS3 / UTME",
  },
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

const INTENTS: ChoiceOption[] = [
  { label: "Explore careers", value: "explore_careers" },
  { label: "Help me choose subjects", value: "choose_subjects" },
  { label: "I have a programme in mind", value: "have_programme" },
];

export function SeniorSecondaryExploreSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();
  const ssClass = value.ssClass;

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          SS1 / SS2 — let's explore
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Which class are you in right now?
        </Text>
      </View>

      <View style={{ gap: Spacing.md }}>
        {SS_CLASSES.map((c) => (
          <OptionCard
            key={c.value}
            icon={c.icon}
            title={c.title}
            subtitle={c.subtitle}
            selected={ssClass === c.value}
            onPress={() => onChange({ ssClass: c.value })}
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
        Stream helps us pre-sort suggestions, but your actual subjects decide
        eligibility.
      </Text>

      <ChoiceChips
        label="Subjects you're strongest in / enjoy"
        options={SUBJECTS}
        value={value.jambSubjects}
        onChange={(v) => onChange({ jambSubjects: v as string[] })}
        multi
      />
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        We'll map these to programmes they open, then to the schools, domains
        and roles beyond.
      </Text>

      <ChoiceChips
        label="What do you want to do?"
        options={INTENTS}
        value={value.exploreIntent}
        onChange={(v) => onChange({ exploreIntent: v as string[] })}
        multi
      />

      <View style={{ gap: Spacing.lg }}>
        <SearchField
          label="Programme you're curious about (optional)"
          value={value.intendedProgramme ?? ""}
          onChangeText={(v) => onChange({ intendedProgramme: v })}
          placeholder="Search programmes"
        />
        <Text style={[styles.note, { color: colors.textMuted }]}>
          We will use your subjects and interests to start with realistic
          programme paths. Cut-offs become more important when you reach SS3.
        </Text>
      </View>

      <SifterButton
        label="Continue →"
        onPress={onContinue}
        disabled={!ssClass}
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
});

export default SeniorSecondaryExploreSetupForm;
