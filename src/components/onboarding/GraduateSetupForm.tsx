/**
 * GraduateSetupForm — Step-2 body for NYSC / job-seeker / early-career graduates.
 *
 * Captures where the graduate actually is — institution type, school, discipline,
 * programme, classification, prior professional qualifications and experience —
 * so gap analysis can be precise. School/programme selectors render `comingSoon`
 * until CCMAS/NCE/IBASS data is imported; discipline is free text for now.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { ChoiceChips, SearchField, SelectField } from "./primitives";
import type { SetupFormProps, InstitutionType } from "../../types/onboarding";

const INSTITUTION_TYPES: { label: string; value: InstitutionType }[] = [
  { label: "University", value: "university" },
  { label: "College of Education", value: "college_of_education" },
  { label: "Polytechnic", value: "polytechnic" },
  { label: "Monotechnic", value: "monotechnic" },
  { label: "College of Health", value: "college_of_health" },
  { label: "Technical College", value: "technical_college" },
];

const CLASSIFICATIONS = [
  "First Class",
  "2:1",
  "2:2",
  "Third Class",
  "Pass",
  "Distinction",
  "Upper Credit",
  "Lower Credit",
].map((c) => ({ label: c, value: c }));

const PRIOR_QUALIFICATIONS = [
  "None yet",
  "CFA",
  "ACCA",
  "ICAN",
  "COREN",
  "PMP",
  "CIPM",
  "Other",
].map((q) => ({ label: q, value: q }));

const EXPERIENCE = [
  { label: "0 (NYSC)", value: "0" },
  { label: "<1", value: "<1" },
  { label: "1–2", value: "1-2" },
  { label: "3–5", value: "3-5" },
  { label: "5+", value: "5+" },
];

export function GraduateSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Graduate setup
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Tell us about your studies so we can map your real starting point.
        </Text>
      </View>

      <ChoiceChips
        label="Institution type"
        options={INSTITUTION_TYPES}
        value={value.institutionType}
        onChange={(v) => onChange({ institutionType: v as InstitutionType })}
      />

      <SearchField
        label="School"
        value={value.schoolName ?? ""}
        onChangeText={(v) => onChange({ schoolName: v })}
        placeholder="Search institutions"
        comingSoon
      />

      <SearchField
        label="Discipline / field of study"
        value={value.discipline ?? ""}
        onChangeText={(v) => onChange({ discipline: v })}
        placeholder="e.g. Economics"
      />

      <SelectField
        label="Programme"
        value={value.programmeName}
        onSelect={(v) => onChange({ programmeName: v })}
        comingSoon
      />

      <ChoiceChips
        label="Degree classification"
        options={CLASSIFICATIONS}
        value={value.classification}
        onChange={(v) => onChange({ classification: v as string })}
      />

      <ChoiceChips
        label="Prior professional qualifications"
        options={PRIOR_QUALIFICATIONS}
        value={value.priorQualifications}
        onChange={(v) => onChange({ priorQualifications: v as string[] })}
        multi
      />

      <ChoiceChips
        label="Years of experience"
        options={EXPERIENCE}
        value={value.yearsExperience}
        onChange={(v) => onChange({ yearsExperience: v as string })}
      />

      <SifterButton
        label="Continue →"
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
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
});

export default GraduateSetupForm;
