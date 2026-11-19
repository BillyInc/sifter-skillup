/**
 * Optional O-level grade entry (SS3 / UTME).
 *
 * One skippable row per selected O-level subject. A grade is optional; "I don't
 * know yet" clears it. Grades only add a "grades meet / may not meet" label to
 * programme results; they never hide a programme. No UTME score is captured.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize } from "../../theme";
import { ChoiceChips, type ChoiceOption } from "./primitives";
import {
  GRADE_BANDS_COPY,
  OLEVEL_EXAM_BODIES,
  OLEVEL_GRADES,
  isOlevelGrade,
  pruneGrades,
  type OlevelExamBody,
} from "../../lib/olevelGrades";

const UNKNOWN = "unknown";
const GRADE_OPTIONS: ChoiceOption[] = [
  ...OLEVEL_GRADES.map((g) => ({ label: g, value: g })),
  { label: "I don't know yet", value: UNKNOWN },
];
const BODY_OPTIONS: ChoiceOption[] = OLEVEL_EXAM_BODIES.map((b) => ({ label: b.label, value: b.value }));

export interface OlevelGradePickerProps {
  /** The student's selected O-level subjects (names). */
  subjects: string[];
  grades: Record<string, string> | undefined;
  examBody: OlevelExamBody | undefined;
  onChange: (next: { grades: Record<string, string>; examBody: OlevelExamBody }) => void;
}

export function OlevelGradePicker({ subjects, grades, examBody, onChange }: OlevelGradePickerProps) {
  const { colors } = useTheme();
  if (!subjects.length) return null;
  const body: OlevelExamBody = examBody ?? "waec";
  const current = pruneGrades(grades, subjects);

  const setGrade = (subject: string, value: string) => {
    const next = { ...current };
    if (isOlevelGrade(value)) next[subject] = value;
    else delete next[subject];
    onChange({ grades: next, examBody: body });
  };

  return (
    <View
      style={[styles.panel, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
      accessibilityLabel="Optional O-level grades"
    >
      <Text style={[styles.title, { color: colors.text }]}>Your O-level grades (optional)</Text>
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        You can skip this. {GRADE_BANDS_COPY}
      </Text>
      <ChoiceChips
        label="Which exam are these grades from?"
        options={BODY_OPTIONS}
        value={body}
        onChange={(v) => onChange({ grades: current, examBody: v as OlevelExamBody })}
      />
      {subjects.map((subject) => (
        <ChoiceChips
          key={subject}
          label={subject}
          options={GRADE_OPTIONS}
          value={current[subject] ?? UNKNOWN}
          onChange={(v) => setGrade(subject, v as string)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 12, padding: Spacing.md, gap: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: "800" },
  caption: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});

export default OlevelGradePicker;
