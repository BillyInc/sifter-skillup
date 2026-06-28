/**
 * ProfessionalSetupForm — Step-2 body for the `professional` front door
 * (working / changing direction).
 *
 * Captures background, current field of work, intent, and prior/highest
 * qualifications so gap analysis can compare an experienced professional against
 * a fresh entrant. All option lists here are fixed conceptual sets (not
 * institution data), so they're hardcoded; current field is free text. Fully
 * controlled from `value`; patches via `onChange`.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { ChoiceChips, SearchField, type ChoiceOption } from "./primitives";
import type { SetupFormProps } from "../../types/onboarding";

const BACKGROUND: ChoiceOption[] = [
  { label: "Professional (degree-level)", value: "professional" },
  { label: "White-collar (office)", value: "white_collar" },
  { label: "Blue-collar (trades/field)", value: "blue_collar" },
  { label: "Artisan / skilled trade", value: "artisan" },
  { label: "Semi-skilled worker", value: "semi_skilled" },
  { label: "Just starting out", value: "starting_out" },
];

const INTENT: ChoiceOption[] = [
  { label: "Understand my current field", value: "understand_field" },
  { label: "Explore a new field", value: "explore_new" },
  { label: "Start a business", value: "start_business" },
  { label: "Find global opportunities", value: "global" },
  { label: "All of the above", value: "all" },
];

const HIGHEST_QUALIFICATION: ChoiceOption[] = [
  { label: "WAEC/NECO only", value: "waec_neco" },
  { label: "NCE/ND/HND", value: "nce_nd_hnd" },
  { label: "B.Sc/B.A/B.Eng", value: "bachelors" },
  { label: "Postgraduate (MSc/PhD)", value: "postgraduate" },
  { label: "Professional certification", value: "professional_cert" },
  { label: "No formal qualification", value: "none" },
];

const PRIOR_QUALIFICATIONS: ChoiceOption[] = [
  { label: "None yet", value: "none" },
  { label: "CFA", value: "cfa" },
  { label: "ACCA", value: "acca" },
  { label: "ICAN", value: "ican" },
  { label: "COREN", value: "coren" },
  { label: "PMP", value: "pmp" },
  { label: "CIPM", value: "cipm" },
  { label: "Other", value: "other" },
];

export function ProfessionalSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.form}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>
          Your background
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Tell us where you’re coming from so we can show the right next steps.
        </Text>
      </View>

      <ChoiceChips
        label="What describes you best?"
        options={BACKGROUND}
        value={value.background}
        onChange={(v) => onChange({ background: v })}
      />

      <SearchField
        label="Current / most recent field of work"
        value={value.currentField ?? ""}
        onChangeText={(v) => onChange({ currentField: v })}
        placeholder="e.g. Banking, Accounting, Logistics…"
      />

      <ChoiceChips
        label="What do you want to do? (select all that apply)"
        options={INTENT}
        value={value.intent}
        onChange={(v) => onChange({ intent: v })}
        multi
      />

      <ChoiceChips
        label="Highest qualification"
        options={HIGHEST_QUALIFICATION}
        value={value.highestQualification}
        onChange={(v) => onChange({ highestQualification: v })}
      />

      <ChoiceChips
        label="Prior professional qualifications (select all that apply)"
        options={PRIOR_QUALIFICATIONS}
        value={value.priorQualifications}
        onChange={(v) => onChange({ priorQualifications: v })}
        multi
      />

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
});

export default ProfessionalSetupForm;
