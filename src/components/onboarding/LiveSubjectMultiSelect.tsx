import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { careerData, type SubjectCatalogItem } from "@/lib/careerData";
import { Brand, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { SearchField } from "./primitives";

/** Maximum O-level subjects accepted by the early programme matcher. */
export const MAX_OLEVEL_SUBJECTS = 6;

export function LiveSubjectMultiSelect({
  label,
  value,
  onChange,
  stream,
  minSelected,
  maxSelected,
  helperText,
  examType,
  showSearch = true,
  fixedSubjects = [],
}: {
  label: string;
  value: string[] | undefined;
  onChange: (subjects: string[]) => void;
  stream?: string;
  examType?: "utme" | "olevel";
  minSelected: number;
  maxSelected: number;
  helperText?: string;
  showSearch?: boolean;
  fixedSubjects?: string[];
}) {
  const { colors } = useTheme();
  const selected = useMemo(() => {
    const out: string[] = [];
    [...fixedSubjects, ...(value ?? [])].forEach((subject) => {
      if (!out.some((s) => s.toLowerCase() === subject.toLowerCase())) {
        out.push(subject);
      }
    });
    return out;
  }, [fixedSubjects, value]);
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState<SubjectCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const fixedSet = useMemo(
    () => new Set(fixedSubjects.map((s) => s.toLowerCase())),
    [fixedSubjects],
  );
  const visibleSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aFixed = fixedSet.has(a.name.toLowerCase()) ? 0 : 1;
      const bFixed = fixedSet.has(b.name.toLowerCase()) ? 0 : 1;
      if (aFixed !== bFixed) return aFixed - bFixed;
      return a.name.localeCompare(b.name);
    });
  }, [fixedSet, subjects]);
  const countLabel =
    maxSelected <= 4
      ? `${selected.length}/${maxSelected}`
      : `${selected.length}/${maxSelected}`;

  const overLimit = selected.length > maxSelected;

  useEffect(() => {
    if (!fixedSubjects.length) return;
    const current = value ?? [];
    const missing = fixedSubjects.filter(
      (fixed) => !current.some((s) => s.toLowerCase() === fixed.toLowerCase()),
    );
    if (missing.length) {
      onChange([...fixedSubjects, ...current]);
    }
  }, [fixedSubjects, onChange, value]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const state = await careerData.getSubjects(
        showSearch ? query.trim() : "",
        stream,
        examType,
      );
      if (!active) return;
      setLoading(false);
      setSubjects(state.data ?? []);
      setNotice(state.meta?.notice ?? null);
    }, 120);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, stream, examType, showSearch]);

  const toggle = (subjectName: string) => {
    if (fixedSet.has(subjectName.toLowerCase())) return;
    const exists = selected.some(
      (s) => s.toLowerCase() === subjectName.toLowerCase(),
    );
    if (exists) {
      onChange(selected.filter((s) => s.toLowerCase() !== subjectName.toLowerCase()));
      return;
    }
    if (selected.length >= maxSelected) {
      setSelectionNotice(`You can choose up to ${maxSelected} subjects here. Remove one before adding another.`);
      return;
    }
    setSelectionNotice(null);
    onChange([...selected, subjectName]);
  };

  return (
    <View style={{ gap: Spacing.sm }}>
      {showSearch ? (
        <SearchField
          label={`${label} (${countLabel})`}
          value={query}
          onChangeText={setQuery}
          placeholder="Search WAEC / JAMB subjects"
        />
      ) : (
        <Text style={[styles.label, { color: colors.text }]}>
          {label} ({countLabel})
        </Text>
      )}
      <Text style={[styles.helper, { color: colors.textMuted }]}>
        {helperText ??
          `Select at least ${minSelected}. These choices guide programme matching; they do not guarantee admission.`}
      </Text>
      {selectionNotice ? (
        <Text style={[styles.warning, { color: colors.accentRole.warning }]}>{selectionNotice}</Text>
      ) : null}
      {overLimit ? (
        <Text style={[styles.warning, { color: colors.accentRole.warning }]}>Too many subjects selected. Remove {selected.length - maxSelected} before continuing.</Text>
      ) : null}
      {notice ? (
        <Text style={[styles.helper, { color: colors.textMuted }]}>{notice}</Text>
      ) : null}

      {selected.length ? (
        <View style={styles.wrap}>
          {selected.map((subject) => (
            <TouchableOpacity
              key={subject}
              activeOpacity={0.75}
              onPress={() => toggle(subject)}
              disabled={fixedSet.has(subject.toLowerCase())}
              style={[
                styles.selectedChip,
                {
                  backgroundColor: fixedSet.has(subject.toLowerCase())
                    ? colors.surface.subtle
                    : colors.accentRole.action,
                  borderColor: fixedSet.has(subject.toLowerCase())
                    ? colors.borderRole.subtle
                    : colors.accentRole.action,
                },
              ]}
            >
              <Text
                style={[
                  styles.selectedText,
                  {
                    color: fixedSet.has(subject.toLowerCase())
                      ? colors.textRole.primary
                      : colors.textRole.inverse,
                  },
                ]}
              >
                {subject}
                {fixedSet.has(subject.toLowerCase()) ? " (core)" : " x"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {loading ? <ActivityIndicator size="small" color={Brand.primary} /> : null}

      <View style={styles.wrap}>
        {visibleSubjects.map((subject) => {
          const active = selected.some(
            (s) => s.toLowerCase() === subject.name.toLowerCase(),
          );
          return (
            <TouchableOpacity
              key={subject.id}
              activeOpacity={0.8}
              onPress={() => toggle(subject.name)}
              style={[
                styles.option,
                {
                  backgroundColor: active ? colors.accentRole.action : colors.surface.raised,
                  borderColor: active ? colors.accentRole.action : colors.borderRole.subtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: active ? colors.textRole.inverse : colors.textRole.primary },
                ]}
              >
                {subject.name}
              </Text>
            </TouchableOpacity>
          );
        })}
        {!loading && showSearch && query.trim().length >= 2 && subjects.length === 0 ? (
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            We could not find that subject. Try another name.
          </Text>
        ) : null}
      </View>

      {selected.length > 0 && selected.length < minSelected ? (
        <Text style={[styles.warning, { color: colors.accentRole.warning }]}>
          Add {minSelected - selected.length} more subject
          {minSelected - selected.length === 1 ? "" : "s"} before matching.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FontSize.sm, fontWeight: "800" },
  helper: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  warning: { fontSize: FontSize.xs, fontWeight: "700" },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    minHeight: 40,
    justifyContent: "center",
  },
  optionText: { fontSize: FontSize.sm, fontWeight: "700" },
  selectedChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    minHeight: 40,
    justifyContent: "center",
  },
  selectedText: { fontSize: FontSize.sm, fontWeight: "800" },
});

export default LiveSubjectMultiSelect;
