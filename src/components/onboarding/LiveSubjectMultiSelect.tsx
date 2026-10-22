import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { careerData, type SubjectCatalogItem } from "@/lib/careerData";
import {
  normalizeSubjectStream,
  orderSubjectCatalogItems,
  subjectCategoryLabel,
  subjectStreamLabels,
} from "@/lib/subjectCatalogOrdering";
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
  streamScoped = false,
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
  /** Show only stream-tagged subjects until the learner opts into the full catalogue. */
  streamScoped?: boolean;
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
  const [catalogueLoaded, setCatalogueLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [showOutsideStream, setShowOutsideStream] = useState(false);
  const streamTagsByName = React.useRef<Record<string, string[]>>({});
  const previousStream = React.useRef(stream);
  const pendingStreamValidation = React.useRef<string | undefined>(undefined);
  const fixedSet = useMemo(
    () => new Set(fixedSubjects.map((s) => s.toLowerCase())),
    [fixedSubjects],
  );
  const filteredSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return subjects;
    return subjects.filter((subject) => [subject.name, subject.code, ...(subject.aliases ?? [])]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)));
  }, [query, subjects]);
  const inStreamSubjects = useMemo(
    () => {
      const fixedRows = filteredSubjects.filter((subject) => fixedSet.has(subject.name.toLocaleLowerCase()));
      const orderedRows = orderSubjectCatalogItems(filteredSubjects, stream, fixedSubjects);
      return [
        ...fixedRows,
        ...orderedRows.filter((subject) => !fixedSet.has(subject.name.toLocaleLowerCase())),
      ];
    },
    [filteredSubjects, fixedSet, fixedSubjects, stream],
  );
  const outsideStreamSubjects = useMemo(() => {
    if (!streamScoped || !stream || !showOutsideStream) return [];
    const visibleNames = new Set(inStreamSubjects.map((subject) => subject.name.toLocaleLowerCase()));
    return filteredSubjects
      .filter((subject) => !fixedSet.has(subject.name.toLocaleLowerCase()) && !visibleNames.has(subject.name.toLocaleLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredSubjects, fixedSet, inStreamSubjects, showOutsideStream, stream, streamScoped]);
  const visibleSubjects = streamScoped && stream && showOutsideStream
    ? [...inStreamSubjects, ...outsideStreamSubjects]
    : streamScoped && stream
      ? inStreamSubjects
      : orderSubjectCatalogItems(filteredSubjects, stream, fixedSubjects);
  const requestQuery = streamScoped ? "" : showSearch ? query.trim() : "";
  const requestStream = streamScoped ? undefined : stream;
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
    if (!streamScoped || previousStream.current === stream) return;
    setShowOutsideStream(false);
    const nextTag = normalizeSubjectStream(stream);
    if (nextTag) {
      const nextSelection = selected.filter((subject) => {
        if (fixedSet.has(subject.toLocaleLowerCase())) return true;
        const tags = streamTagsByName.current[subject.toLocaleLowerCase()] ?? [];
        return tags.length
          ? tags.some((tag) => normalizeSubjectStream(tag) === nextTag)
          : !catalogueLoaded;
      });
      if (nextSelection.length !== selected.length) onChange(nextSelection);
      pendingStreamValidation.current = !catalogueLoaded && selected.some((subject) =>
        !fixedSet.has(subject.toLocaleLowerCase())
        && streamTagsByName.current[subject.toLocaleLowerCase()] === undefined,
      ) ? stream : undefined;
    }
    previousStream.current = stream;
  }, [catalogueLoaded, fixedSet, onChange, selected, stream, streamScoped]);

  useEffect(() => {
    if (!streamScoped || !stream || !catalogueLoaded || pendingStreamValidation.current !== stream) return;
    const nextTag = normalizeSubjectStream(stream);
    const nextSelection = selected.filter((subject) => {
      if (fixedSet.has(subject.toLocaleLowerCase())) return true;
      const tags = streamTagsByName.current[subject.toLocaleLowerCase()] ?? [];
      return Boolean(nextTag && tags.some((tag) => normalizeSubjectStream(tag) === nextTag));
    });
    pendingStreamValidation.current = undefined;
    if (nextSelection.length !== selected.length) onChange(nextSelection);
  }, [catalogueLoaded, fixedSet, onChange, selected, stream, streamScoped, subjects]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      const state = await careerData.getSubjects(
        requestQuery,
        requestStream,
        examType,
      );
      if (!active) return;
      setLoading(false);
      const nextSubjects = state.data ?? [];
      if (state.status === "real" || state.status === "fallback") setCatalogueLoaded(true);
      nextSubjects.forEach((subject) => {
        streamTagsByName.current[subject.name.toLocaleLowerCase()] = subject.streamTags ?? [];
      });
      setSubjects(nextSubjects);
      setNotice(state.meta?.notice ?? null);
    }, 120);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [examType, requestQuery, requestStream]);

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

  const isOutsideCurrentStream = (subjectName: string) => {
    if (!streamScoped || !stream) return false;
    const tags = streamTagsByName.current[subjectName.toLocaleLowerCase()];
    const selectedTag = normalizeSubjectStream(stream);
    return Boolean(tags && selectedTag && !tags.some((tag) => normalizeSubjectStream(tag) === selectedTag));
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

      {streamScoped && stream ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: showOutsideStream }}
          onPress={() => setShowOutsideStream((current) => !current)}
          style={[styles.outsideToggle, { borderColor: colors.borderRole.subtle }]}
        >
          <Text style={[styles.outsideToggleText, { color: colors.accentRole.action }]}>
            {showOutsideStream ? "Hide subjects outside my stream" : "Show subjects outside my stream"}
          </Text>
        </TouchableOpacity>
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
              {streamScoped && stream && !fixedSet.has(subject.toLowerCase()) && isOutsideCurrentStream(subject) ? (
                  <Text style={[styles.outsideLabel, { color: colors.textRole.inverse }]}>Outside your stream</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {loading ? <ActivityIndicator size="small" color={Brand.primary} /> : null}

      {streamScoped && stream ? <Text style={[styles.listHeading, { color: colors.textRole.secondary }]}>Subjects in {streamLabel(stream)}</Text> : null}
      <View style={styles.wrap}>
        {(streamScoped && stream ? inStreamSubjects : visibleSubjects).map((subject) => {
          const active = selected.some(
            (s) => s.toLowerCase() === subject.name.toLowerCase(),
          );
          const categoryLabel = subjectCategoryLabel(subject.category);
          const streamLabels = subjectStreamLabels(subject.streamTags);
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
              {categoryLabel || streamLabels.length ? (
                <Text
                  style={[
                    styles.optionMeta,
                    { color: active ? colors.textRole.inverse : colors.textMuted },
                  ]}
                >
                  {categoryLabel ? `Subject group: ${categoryLabel}` : ""}
                  {categoryLabel && streamLabels.length ? " · " : ""}
                  {streamLabels.length ? `Stream tags: ${streamLabels.join(", ")}` : ""}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
        {!loading && showSearch && query.trim().length >= 2 && filteredSubjects.length === 0 ? (
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            We could not find that subject. Try another name.
          </Text>
        ) : null}
      </View>

      {streamScoped && stream && showOutsideStream ? (
        <>
          <Text style={[styles.listHeading, { color: colors.textRole.secondary }]}>Outside your stream</Text>
          <View style={styles.wrap}>
            {outsideStreamSubjects.map((subject) => {
              const active = selected.some((s) => s.toLowerCase() === subject.name.toLowerCase());
              return <TouchableOpacity
                key={subject.id}
                activeOpacity={0.8}
                onPress={() => toggle(subject.name)}
                style={[styles.option, { backgroundColor: active ? colors.accentRole.action : colors.surface.raised, borderColor: active ? colors.accentRole.action : colors.borderRole.subtle }]}
              >
                <Text style={[styles.optionText, { color: active ? colors.textRole.inverse : colors.textRole.primary }]}>{subject.name}</Text>
                <Text style={[styles.optionMeta, { color: active ? colors.textRole.inverse : colors.textMuted }]}>Outside your stream</Text>
              </TouchableOpacity>;
            })}
          </View>
        </>
      ) : null}

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
  listHeading: { fontSize: FontSize.xs, fontWeight: "800", marginTop: Spacing.xs },
  outsideToggle: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md },
  outsideToggleText: { fontSize: FontSize.sm, fontWeight: "800" },
  outsideLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
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
  optionMeta: { fontSize: 10, fontWeight: "600", marginTop: 2 },
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

function streamLabel(stream: string): string {
  if (stream === "art" || stream === "arts") return "Arts";
  if (stream === "technical" || stream === "technical/vocational") return "Technical / vocational";
  return stream[0].toUpperCase() + stream.slice(1);
}
