/**
 * SkilledWorkerSetupForm — Step-2 body for the `skilled_worker` front door
 * (artisan / skilled trade).
 *
 * Captures the user's trade, highest qualification and intent. The trade list is
 * a fixed conceptual set (not institution data), so it's hardcoded as a
 * SelectField. Fully controlled from `value`; patches via `onChange`.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { ChoiceChips, SelectField, type ChoiceOption } from "./primitives";
import type { SetupFormProps } from "../../types/onboarding";

const TRADES: ChoiceOption[] = [
  { label: "Electrical Installation", value: "electrical" },
  { label: "Plumbing & Pipefitting", value: "plumbing" },
  { label: "Welding & Fabrication", value: "welding" },
  { label: "Carpentry & Joinery", value: "carpentry" },
  { label: "Automobile Mechanics", value: "auto_mechanics" },
  { label: "Bricklaying/Masonry", value: "masonry" },
  { label: "Painting & Decoration", value: "painting" },
  { label: "HVAC", value: "hvac" },
  { label: "ICT/Computer Repairs", value: "ict_repairs" },
  { label: "Fashion Design/Tailoring", value: "fashion" },
  { label: "Hair & Beauty", value: "hair_beauty" },
  { label: "Catering & Food", value: "catering" },
  { label: "Agriculture (practical)", value: "agriculture" },
  { label: "Other", value: "other" },
];

const HIGHEST_QUALIFICATION: ChoiceOption[] = [
  { label: "No formal qualification", value: "none" },
  { label: "WAEC/NECO", value: "waec_neco" },
  { label: "Trade Test", value: "trade_test" },
  { label: "NABTEB/NTC", value: "nabteb_ntc" },
  { label: "ND/HND", value: "nd_hnd" },
  { label: "Other", value: "other" },
];

const INTENT: ChoiceOption[] = [
  { label: "Understand my domain", value: "understand_domain" },
  { label: "Grow my income", value: "grow_income" },
  { label: "Start/grow a business", value: "business" },
  { label: "Find global opportunities", value: "global" },
  { label: "Get certified", value: "get_certified" },
];

export function SkilledWorkerSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.form}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>Your trade</Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Tell us your trade so we can show the domains, certifications and jobs
          it unlocks.
        </Text>
      </View>

      <SelectField
        label="Your trade"
        value={value.trade}
        placeholder="Select your trade…"
        options={TRADES}
        onSelect={(v) => onChange({ trade: v })}
      />

      <ChoiceChips
        label="Highest qualification"
        options={HIGHEST_QUALIFICATION}
        value={value.highestQualification}
        onChange={(v) => onChange({ highestQualification: v })}
      />

      <ChoiceChips
        label="What do you want to do? (select all that apply)"
        options={INTENT}
        value={value.intent}
        onChange={(v) => onChange({ intent: v })}
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

export default SkilledWorkerSetupForm;
