/**
 * Annotates a subject-match result with the self-reported O-level grade check.
 * Never hides a row and never states admission eligibility.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize } from "../../theme";
import type { SubjectProgrammeMatch } from "../../lib/careerData";
import { GRADE_RESULT_FOOTNOTE, gradeCheckLabel, type GradeLabel } from "../../lib/olevelGrades";

const ICON: Record<GradeLabel["status"], "check-circle" | "alert-circle" | "help-circle"> = {
  met: "check-circle",
  not_met: "alert-circle",
  unknown: "help-circle",
};

function Line({ label, schoolName }: { label: GradeLabel; schoolName?: string }) {
  const { colors } = useTheme();
  const tone =
    label.status === "met" ? colors.success : label.status === "not_met" ? colors.warning : colors.textMuted;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${schoolName ? schoolName + ": " : ""}${label.label}. ${label.reason ?? ""}`}
    >
      <Feather name={ICON[label.status]} size={14} color={tone} style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: tone }]}>
          {schoolName ? `${schoolName}: ` : ""}
          {label.label}
        </Text>
        {label.reason ? <Text style={[styles.reason, { color: colors.textMuted }]}>{label.reason}</Text> : null}
      </View>
    </View>
  );
}

export function GradeCheckNote({ item }: { item: SubjectProgrammeMatch }) {
  const { colors } = useTheme();
  const programme = gradeCheckLabel(item.gradeCheck);
  const names = new Map(
    (item.schoolOfferings ?? []).map((o) => [String(o.schoolId ?? ""), o.shortName || o.schoolName]),
  );
  const universities = (item.universitySpecificMatches ?? [])
    .map((m) => ({ label: gradeCheckLabel(m.gradeCheck), name: names.get(String(m.schoolId)) || "A university" }))
    .filter((m): m is { label: GradeLabel; name: string } => Boolean(m.label));
  if (!programme && !universities.length) return null;
  return (
    <View style={styles.wrap} testID="grade-check-note">
      {programme ? <Line label={programme} /> : null}
      {universities.map((u, i) => (
        <Line key={`${u.name}-${i}`} label={u.label} schoolName={u.name} />
      ))}
      <Text style={[styles.reason, { color: colors.textMuted }]}>{GRADE_RESULT_FOOTNOTE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs, marginTop: Spacing.xs },
  row: { flexDirection: "row", gap: Spacing.xs, alignItems: "flex-start" },
  icon: { marginTop: 2 },
  label: { fontSize: FontSize.sm, fontWeight: "700" },
  reason: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
});

export default GradeCheckNote;
