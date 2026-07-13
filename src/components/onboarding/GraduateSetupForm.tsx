/**
 * GraduateSetupForm — Step-2 body for NYSC / job-seeker / early-career graduates.
 *
 * Captures where the graduate actually is — institution type, school, discipline,
 * programme, classification, prior professional qualifications and experience —
 * so gap analysis can be precise. School/programme selectors render `comingSoon`
 * until CCMAS/NCE/IBASS data is imported; discipline is free text for now.
 *
 * Prior-field search is live: users search their field of study/work and select a
 * domain, which is persisted to the backend on Continue via savePriorField().
 */
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { ChoiceChips, SearchField, SelectField, type ChoiceOption } from "./primitives";
import { careerData } from "../../lib/careerData";
import { comingSoon, type DataState, type CareerSearchResult } from "../../types/career";
import type { SetupFormProps, InstitutionType } from "../../types/onboarding";
import { DataStateView } from "../careerIntelligence";

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
  { label: "1-2", value: "1-2" },
  { label: "3-5", value: "3-5" },
  { label: "5+", value: "5+" },
];

export function GraduateSetupForm({
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

      {/* Prior field search for graduates */}
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
  heading: {
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

export default GraduateSetupForm;