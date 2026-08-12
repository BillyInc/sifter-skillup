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

export type AdmissionSuggestion = { id: string; name: string };

export function LiveAdmissionSearchField({
  label,
  value,
  onSelect,
  placeholder,
  kind,
  institutionType,
  helperText,
}: {
  label: string;
  value: string;
  onSelect: (item: AdmissionSuggestion) => void;
  placeholder: string;
  kind: "programme" | "school";
  institutionType?: string;
  helperText?: string;
}) {
  const { colors } = useTheme();
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<AdmissionSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const state =
        kind === "programme"
          ? await careerData.searchJambProgrammes(q)
          : await careerData.searchAdmissionSchools(q, institutionType);
      if (!active) return;
      setLoading(false);
      setResults(
        state.status === "real" && Array.isArray(state.data)
          ? state.data.map((r: any) => ({
              id: r.id,
              name: typeof r.jambName === "string" ? r.jambName : r.name,
            }))
          : [],
      );
    }, 275);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, kind, institutionType]);

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

const styles = StyleSheet.create({
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
  helper: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
});

export default LiveAdmissionSearchField;
