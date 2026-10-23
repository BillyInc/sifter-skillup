import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { careerData } from "@/lib/careerData";
import { Brand, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { SearchField } from "./primitives";

export type AdmissionSuggestion = {
  id: string;
  name: string;
  schoolNames?: string[];
  schoolCount?: number;
  institutionType?: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  distinction?: string | null;
};

function programmeSearchTerm(value: string): string {
  return value.trim().replace(/^(?:I\s+want\s+to\s+study|I\s+want\s+to\s+do|I\s+am\s+considering)\s+/i, "").trim();
}

export function LiveAdmissionSearchField({
  label,
  value,
  onSelect,
  placeholder,
  kind,
  institutionType,
  helperText,
  schoolId,
  faculty,
  selectedId,
  allowRegister = false,
  registerAddress,
  registerAddressRequired = false,
}: {
  label: string;
  value: string;
  onSelect: (item: AdmissionSuggestion) => void;
  placeholder: string;
  kind: "programme" | "school";
  institutionType?: string;
  helperText?: string;
  schoolId?: string;
  faculty?: string;
  selectedId?: string;
  allowRegister?: boolean;
  registerAddress?: string;
  registerAddressRequired?: boolean;
}) {
  const { colors } = useTheme();
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<AdmissionSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [searchStatus, setSearchStatus] = React.useState<"real" | "unavailable" | null>(null);
  const [searchNotice, setSearchNotice] = React.useState<string | null>(null);
  const [registering, setRegistering] = React.useState(false);
  const [registerError, setRegisterError] = React.useState<string | null>(null);
  const programmeQueryBeforeSelection = React.useRef("");
  const onSelectRef = React.useRef(onSelect);
  const selected = Boolean(selectedId && value.trim());

  React.useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  React.useEffect(() => {
    const q = kind === "programme" ? programmeSearchTerm(query) : query.trim();
    if (selected) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }
    // Start querying as soon as the user begins typing. The picker is a
    // typeahead, so making users complete a long school name before showing
    // selectable results defeats the purpose of the field.
    if (q.length < 1) {
      setResults([]);
      setLoading(false);
      setSearchStatus(null);
      setSearchNotice(null);
      return;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const state =
        kind === "programme"
            ? schoolId
            ? await careerData.getSchoolProgrammes(schoolId, q, faculty)
            : await careerData.searchJambProgrammes(q)
          : await careerData.searchAdmissionSchools(q, institutionType);
      if (!active) return;
      setLoading(false);
      setSearchStatus(state.status === "real" ? "real" : "unavailable");
      setSearchNotice(state.meta?.notice ?? null);
      const nextResults: AdmissionSuggestion[] =
        state.status === "real" && Array.isArray(state.data)
          ? state.data.map((r: any) => ({
              id: r.id || r.jambProgrammeId || r.schoolId || "",
              name:
                typeof r.jambName === "string"
                  ? r.jambName
                  : typeof r.studentName === "string"
                    ? r.studentName
                    : r.name,
              institutionType: r.institutionType,
              schoolNames: Array.isArray(r.schoolNames) ? r.schoolNames : [],
              schoolCount: Number(r.schoolCount || 0),
              address: r.address ?? null,
              city: r.city ?? null,
              state: r.state ?? null,
              country: r.country ?? null,
              distinction: r.distinction ?? r.overview ?? r.requirementSummary ?? null,
            }))
          : [];
      setResults(nextResults);
      if (kind === "programme" && nextResults.length === 1) {
        const onlyProgramme = nextResults[0];
        programmeQueryBeforeSelection.current = query.trim();
        setQuery(onlyProgramme.name);
        setOpen(false);
        onSelectRef.current(onlyProgramme);
      }
    }, 150);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, kind, institutionType, schoolId, faculty, selected]);

  const registerTypedInstitution = async () => {
    const name = query.trim();
    if (!name || !institutionType || registering) return;
    if (registerAddressRequired && (registerAddress ?? "").trim().length < 8) {
      setRegisterError("Enter the full organisation address before adding it.");
      return;
    }
    setRegistering(true);
    setRegisterError(null);
    const state = await careerData.registerAdmissionSchool(name, institutionType, registerAddress);
    setRegistering(false);
    if (state.status === "real" && state.data) {
      const item = state.data as AdmissionSuggestion;
      setQuery(item.name);
      setResults([]);
      setOpen(false);
      onSelect(item);
      return;
    }
    setRegisterError(state.meta?.notice ?? "We could not add that institution right now.");
  };

  return (
    <View style={{ gap: 6 }}>
      {selected ? (
        <View style={[styles.selectedField, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
          <View style={styles.selectedCopy}>
            <Text style={[styles.selectedLabel, { color: colors.textMuted }]}>{label}</Text>
            <Text style={[styles.selectedValue, { color: colors.text }]}>{value}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Change ${label.toLowerCase()}`}
            onPress={() => {
              const resumeQuery = kind === "programme" ? programmeQueryBeforeSelection.current : "";
              setQuery(resumeQuery);
              setOpen(Boolean(resumeQuery));
              setResults([]);
              onSelect({ id: "", name: resumeQuery });
            }}
            style={styles.changeButton}
          >
            <Text style={[styles.changeText, { color: Brand.primary }]}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}
      {helperText ? (
        <Text style={[styles.helper, { color: colors.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
      {loading ? <ActivityIndicator size="small" color={Brand.primary} /> : null}
      {open && results.length ? (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {kind === "programme" && results.length > 1 ? (
            <View style={styles.variationIntro}>
              <Text style={[styles.variationTitle, { color: colors.text }]}>
                JAMB lists more than one programme under “{programmeSearchTerm(query)}”. Choose the one you mean. Each one has its own subjects and its own universities.
              </Text>
            </View>
          ) : null}
          {results.map((r) => kind === "programme" ? (
            <View key={r.id} style={styles.suggestion}>
              <Text style={[styles.suggestionText, { color: colors.text }]}>{r.name}</Text>
              <Text numberOfLines={2} style={[styles.suggestionMeta, { color: colors.textMuted }]}>
                {r.distinction?.trim() || "This is a separate JAMB programme. Its O-level subjects, UTME subjects, and universities are its own."}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  programmeQueryBeforeSelection.current = query.trim();
                  setQuery(r.name);
                  onSelect(r);
                  setOpen(false);
                  setResults([]);
                }}
                style={styles.chooseButton}
              >
                <Text style={[styles.chooseText, { color: colors.accentRole.action }]}>Choose this programme</Text>
              </TouchableOpacity>
            </View>
          ) : (
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
              <Text style={[styles.suggestionText, { color: colors.text }]}>{r.name}</Text>
              {kind === "school" ? (
                <Text style={[styles.suggestionMeta, { color: colors.textMuted }]}>
                  {[r.address, r.city, r.state, r.country].filter(Boolean).join(", ") || "Address not listed"}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
      {open && !loading && query.trim().length >= 2 && results.length === 0 && searchStatus === "unavailable" ? (
        <View
          style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Text style={[styles.suggestionMeta, { color: colors.textMuted }]}>
          {kind === "programme" ? "Could not load programmes. Try again." : searchNotice ?? "We could not check this right now. Please try again."}
          </Text>
        </View>
      ) : null}
      {open && !loading && query.trim().length >= 2 && results.length === 0 && searchStatus === "real" ? (
        <View style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.suggestionMeta, { color: colors.textMuted }]}>
            {kind === "programme"
              ? "No programme with that name is listed for this university yet. Try another name."
              : allowRegister
                ? "We could not find this institution yet. Add its name so other people can select it later."
                : "We could not find this institution. Choose one from the results above."}
          </Text>
          {kind === "school" && allowRegister ? (
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={registering || (registerAddressRequired && (registerAddress ?? "").trim().length < 8)}
              onPress={registerTypedInstitution}
              style={[styles.registerButton, { backgroundColor: Brand.primary }]}
            >
              <Text style={styles.registerButtonText}>{registering ? "Adding..." : "Add this school"}</Text>
            </TouchableOpacity>
          ) : null}
          {registerError ? <Text style={[styles.suggestionMeta, { color: colors.danger }]}>{registerError}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  suggestionText: { fontSize: 16, fontWeight: "700" },
  variationIntro: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#CBD5E1" },
  variationTitle: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45, fontWeight: "700" },
  chooseButton: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 10, marginTop: Spacing.xs },
  chooseText: { fontSize: FontSize.sm, fontWeight: "800" },
  suggestionMeta: { fontSize: 14, lineHeight: 19, marginTop: 2 },
  helper: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  empty: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  registerButton: { alignSelf: "flex-start", borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  registerButtonText: { color: "#0F172A", fontSize: FontSize.sm, fontWeight: "800" },
  selectedField: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  selectedCopy: { flex: 1, gap: 2 },
  selectedLabel: { fontSize: FontSize.xs, fontWeight: "700" },
  selectedValue: { fontSize: FontSize.sm, fontWeight: "800" },
  changeButton: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.xs },
  changeText: { fontSize: FontSize.sm, fontWeight: "800" },
});

export default LiveAdmissionSearchField;
