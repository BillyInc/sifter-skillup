/**
 * CurrentStudentSetupForm — Step-2 body for the `student` front door.
 *
 * Captures where a currently-enrolled student is: institution type, school,
 * discipline, programme and year of study. School/discipline/programme depend
 * on CCMAS/NCE/IBASS data that isn't imported yet, so those selectors render an
 * honest "Live soon" state via the primitives' `comingSoon` flag rather than a
 * fake list. Controlled entirely from `value`; patches via `onChange`.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import {
  ChoiceChips,
  SearchField,
  SelectField,
  type ChoiceOption,
} from "./primitives";
import type { SetupFormProps } from "../../types/onboarding";

const INSTITUTION_TYPES: ChoiceOption[] = [
  { label: "University (degree)", value: "university" },
  { label: "College of Education (NCE)", value: "college_of_education" },
  { label: "Polytechnic (ND/HND)", value: "polytechnic" },
  { label: "Monotechnic (ND — specialist)", value: "monotechnic" },
  { label: "College of Health Sciences", value: "college_of_health" },
  { label: "Technical College", value: "technical_college" },
];

const YEARS: ChoiceOption[] = [
  { label: "Year 1", value: "year_1" },
  { label: "Year 2", value: "year_2" },
  { label: "Year 3", value: "year_3" },
  { label: "Year 4", value: "year_4" },
  { label: "Year 5", value: "year_5" },
  { label: "Year 6", value: "year_6" },
  { label: "Final year", value: "final_year" },
];

export function CurrentStudentSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.form}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>
          Your current programme
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Tell us where you are so we can map your programme to domains, roles
          and jobs.
        </Text>
      </View>

      <ChoiceChips
        label="What kind of institution?"
        options={INSTITUTION_TYPES}
        value={value.institutionType}
        onChange={(v) => onChange({ institutionType: v })}
      />

      <SearchField
        label="Your school"
        value={value.schoolName ?? ""}
        onChangeText={(v) => onChange({ schoolName: v })}
        placeholder="Search your institution…"
        comingSoon
      />

      <SelectField
        label="Discipline / faculty"
        value={value.discipline}
        placeholder="Select your discipline…"
        comingSoon
      />

      <SelectField
        label="Programme"
        value={value.programmeName}
        placeholder="Select your programme…"
        comingSoon
      />

      <ChoiceChips
        label="Year of study"
        options={YEARS}
        value={value.yearOfStudy}
        onChange={(v) => onChange({ yearOfStudy: v })}
      />

      <Text style={[styles.note, { color: colors.textMuted }]}>
        We’ll show your school’s exact programme names once your institution’s
        data is added.
      </Text>

      <SifterButton
        label="Continue"
        onPress={onContinue}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.xl },
  heading: { gap: Spacing.xs },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});

export default CurrentStudentSetupForm;
