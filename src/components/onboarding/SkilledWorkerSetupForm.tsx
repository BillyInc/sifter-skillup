/**
 * SkilledWorkerSetupForm — Step-2 body for the `skilled_worker` front door
 * (artisan / skilled trade).
 *
 * Captures the user's trade, highest qualification and intent. The trade list is
 * a fixed conceptual set (not institution data), so it's hardcoded as a
 * SelectField. Fully controlled from `value`; patches via `onChange`.
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight, Brand } from "../../theme";
import { SifterButton } from "../ui";
import {
  ChoiceChips,
  SelectField,
  type ChoiceOption,
} from "./primitives";
import { careerData } from "../../lib/careerData";
import { comingSoon, type DataState, type CareerSearchResult } from "../../types/career";
import { DataStateView } from "../careerIntelligence";
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
      } catch (error) {
        setPriorFieldResults(
          comingSoon<CareerSearchResult>("Search is temporarily unavailable."),
        );
      } finally {
        setPriorFieldSearchActive(false);
      }
    },
    [],
  );

  // Handle selection of a domain from search results
  const handlePriorFieldSelect = (domain: any) => {
    // Store the selected domain key in the user's profile
    onChange({ priorFieldDomainKey: domain.id });
    // Clear the search
    setPriorFieldQuery("");
    setPriorFieldResults({
      status: "real",
      data: { domains: [], roles: [], programmes: [] },
    });
  };

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

      {/* Prior field search for skilled workers */}
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
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={priorFieldQuery}
            onChangeText={(text) => {
              setPriorFieldQuery(text);
              handlePriorFieldSearch(text);
            }}
            placeholder="e.g. Carpentry, Plumbing, Electrical Work"
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
              <Text style={[styles.clear, { color: colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {priorFieldSearchActive ? (
          <View style={styles.searchSpinner}>
            <Text style={styles.searchSpinnerText}>Searching...</Text>
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
            {(data: CareerSearchResult) => (
              <View style={styles.resultsContainer}>
                {data.domains.map((domain) => (
                  <TouchableOpacity
                    key={domain.id}
                    onPress={() => handlePriorFieldSelect(domain)}
                    activeOpacity={0.7}
                    style={[
                      styles.resultItem,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultTitle}>{domain.name}</Text>
                      {domain.cluster && (
                        <Text style={styles.resultSubtitle}>
                          {domain.cluster}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.resultArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </DataStateView>
        ) : null}
      </View>

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
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
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
  clear: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
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
    fontWeight: FontWeight.bold,
  },
  resultSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  resultArrow: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
});

export default SkilledWorkerSetupForm;
