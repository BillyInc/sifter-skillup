/**
 * StudentStageTable: a plain count table of affiliated students by the stage
 * they recorded, split by how they joined (signed up themselves under the
 * school code vs. provisioned by the admin). Counts only; the server never
 * returns an individual record. Replaces the template "snapshot + trend" idea.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize } from "../../theme";
import type { StudentIntelligenceStage } from "../../types/institution";

const STAGE_LABEL: Record<string, string> = {
  senior_secondary: "Senior secondary (SS1/SS2)",
  ss3_secondary: "Senior secondary (SS3)",
  jamb: "JAMB / UTME candidate",
  student: "In a programme",
  skilled_worker: "Skilled worker / artisan",
  professional: "Working professional",
  graduate: "Graduate",
  not_recorded: "Stage not recorded yet",
};

export function stageLabel(stage: string): string {
  return STAGE_LABEL[stage] ?? stage.replace(/_/g, " ");
}

export function StudentStageTable({ rows }: { rows: StudentIntelligenceStage[] }) {
  const { colors } = useTheme();
  if (!rows.length) return null;
  const cell = { color: colors.text } as const;
  return (
    <View accessibilityRole="summary" accessibilityLabel="Students by stage">
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={[styles.stage, styles.head, { color: colors.textMuted }]}>Stage</Text>
        <Text style={[styles.num, styles.head, { color: colors.textMuted }]}>Total</Text>
        <Text style={[styles.num, styles.head, { color: colors.textMuted }]}>Self-signed-up</Text>
        <Text style={[styles.num, styles.head, { color: colors.textMuted }]}>Added by you</Text>
      </View>
      {rows.map((r) => (
        <View key={r.stage} style={[styles.row, { borderColor: colors.border }]}>
          <Text style={[styles.stage, cell]}>{stageLabel(r.stage)}</Text>
          <Text style={[styles.num, cell]}>{r.total.toLocaleString()}</Text>
          <Text style={[styles.num, cell]}>{r.selfSignedUp.toLocaleString()}</Text>
          <Text style={[styles.num, cell]}>{r.provisionedByYou.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}

export default StudentStageTable;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  head: { fontWeight: "600" },
  stage: { flex: 2, fontSize: FontSize.sm },
  num: { flex: 1, fontSize: FontSize.sm, textAlign: "right" },
});
