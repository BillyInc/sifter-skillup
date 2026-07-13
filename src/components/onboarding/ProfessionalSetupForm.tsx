/**
 * ProfessionalSetupForm — Step-2 body for the `professional` front door
 * (working / changing direction).
 *
 * Captures background, current field of work, intent, and prior/highest
 * qualifications so gap analysis can compare an experienced professional against
 * a fresh entrant. All option lists here are fixed conceptual sets (not
 * institution data), so they're hardcoded; current field is free text. Fully
 * controlled from `value`; patches via `onChange`.
 *
 * Prior-field search is live: users search their field of study/work and select a
 * domain, which is persisted to the backend on Continue via savePriorField().
 */
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { ChoiceChips, SearchField, type ChoiceOption } from "./primitives";
import { careerData } from "../../lib/careerData";
import { comingSoon, type DataState, type CareerSearchResult } from "../../types/career";
import type { SetupFormProps } from "../../types/onboarding";
import { DataStateView } from "../careerIntelligence";

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
  const [priorFieldQuery, setPriorFieldQuery] = useState("");
  const [priorFieldResults, setPriorFieldResults] = useState<
    DataState<CareerSearchResult>
  >({ status: "real", data: { domains: [], roles: [], programmes: [] } });
  const [priorFieldSearchActive, setPriorFieldSearchActive] = useState(false);

  const handlePriorFieldSearch = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setPriorFieldResults({
          status: "real",
          data: { domains: [], roles: [], programmes: [] },
        });
        setPriorFieldSearchActive(false);
        return;
      }

      setPriorFieldSearchActive(true);
      try {
        const result = await careerData.searchCareer(query);
        setPriorFieldResults(result);
      } catch (_error) {
        setPriorFieldResults(
          comingSoon<CareerSearchResult>("Search is temporarily unavailable."),
        );
      } finally {
        setPriorFieldSearchActive(false);
      }
    },
    [],
  );

  const handlePriorFieldSelect = (domain: any) => {
    onChange({ priorFieldDomainKey: domain.id });
    setPriorFieldQuery("");
    setPriorFieldResults({
      status: "real",
      data: { domains: [], roles: [], programmes: [] },
    });
  };

  const handleContinue = () => {
    if (value.priorFieldDomainKey) {
      // Fire-and-forget persistence -- the user sees no error if it fails
      careerData.savePriorField(value.priorFieldDomainKey);
    }
    onContinue();
  };

  return (
    <View style={styles.form}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>
          Your background
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Tell us where you're coming from so we can show the right next steps.
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
        placeholder="e.g. Banking, Accounting, Logistics..."
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

      {/* Prior field search for career changers */}
      <View style={{ gap: Spacing.md }}>
        <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>
          What did you study or do before? (optional)
        </Text>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.inputBg,
              borderColor: priorFieldSearchActive
                ? colors.accent
                : colors.inputBorder,
            },
          ]}
        >
          <Text style={styles.searchIcon}>&#x1F50D;</Text>
          <TextInput
            value={priorFieldQuery}
            onChangeText={(text) => {
              setPriorFieldQuery(text);
              handlePriorFieldSearch(text);
            }}
            placeholder="e.g. Economics, Nursing, Software Engineering"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {priorFieldQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => {
                setPriorFieldQuery("");
                setPriorFieldResults({
                  status: "real",
                  data: { domains: [], roles: [], programmes: [] },
                });
              }}
              hitSlop={8}
            >
              <Text style={[styles.clear, { color: colors.textMuted }]}>X</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {priorFieldSearchActive ? (
          <View style={styles.searchSpinner}>
            <Text style={[styles.searchSpinnerText, { color: colors.textSoft }]}>
              Searching...
            </Text>
          </View>
        ) : priorFieldQuery.length >= 2 ? (
          <DataStateView
            state={priorFieldResults}
            empty={() =>
              priorFieldResults.status !== "real" ||
              !priorFieldResults.data ||
              priorFieldResults.data.domains.length === 0
            }
            emptyTitle="No matches found"
            emptyBody="Try a different field of study or work"
          >
            {(data: any) => (
              <View style={styles.resultsContainer}>
                {data.domains.map((domain: any) => (
                  <TouchableOpacity
                    key={domain.id}
                    onPress={() => handlePriorFieldSelect(domain)}
                    activeOpacity={0.7}
                    style={[
                      styles.resultItem,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultTitle, { color: colors.text }]}>
                        {domain.name}
                      </Text>
                      {domain.cluster && (
                        <Text style={[styles.resultSubtitle, { color: colors.textMuted }]}>
                          {domain.cluster}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.resultArrow, { color: colors.text }]}>&rarr;</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </DataStateView>
        ) : null}
      </View>

      <SifterButton
        label="Continue"
        onPress={handleContinue}
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
  fieldLabel: { fontSize: FontSize.sm, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },
  clear: { fontSize: FontSize.md, fontWeight: "700" },
  searchSpinner: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.md,
  },
  searchSpinnerText: { fontSize: FontSize.sm },
  resultsContainer: { marginTop: Spacing.sm },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  resultInfo: { flex: 1 },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  resultSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  resultArrow: { fontSize: FontSize.lg, fontWeight: "900" },
});

export default ProfessionalSetupForm;