import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { Badge } from "@/components/ui";
import {
  canApproveForStudent,
  canExposeToStudents,
  type AdminGuidanceEvidenceRecord,
  type AdminEvidenceState,
} from "@/screens/admin/adminGuidanceEvidence";

export interface AdminGuidanceEvidencePanelProps {
  records: AdminGuidanceEvidenceRecord[];
  onApprove?: (record: AdminGuidanceEvidenceRecord) => void;
}

const stateLabel: Record<AdminEvidenceState, string> = {
  verified: "Verified, awaiting approval",
  approved: "Approved",
  review_required: "Review required",
  no_link: "No verified link",
  not_established: "Relationship not established",
  audit_only: "Audit only",
  unavailable: "Unavailable",
};

function stateVariant(state: AdminEvidenceState): "success" | "warning" | "default" {
  return state === "approved" ? "success" : state === "verified" ? "default" : "warning";
}

function SourceField({ label, value }: { label: string; value?: string | null }) {
  const { colors } = useTheme();
  return (
    <View style={styles.sourceField}>
      <Text style={[styles.sourceLabel, { color: colors.textSoft }]}>{label}</Text>
      <Text style={[styles.sourceValue, { color: colors.text }]}>{value?.trim() || "Not recorded"}</Text>
    </View>
  );
}

function EvidenceRow({ record, onApprove }: { record: AdminGuidanceEvidenceRecord; onApprove?: AdminGuidanceEvidencePanelProps["onApprove"] }) {
  const { colors } = useTheme();
  const approval = canApproveForStudent(record);
  const exposure = canExposeToStudents(record);
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <View style={styles.headingRow}>
        <View style={styles.copy}>
          <Text style={[styles.name, CompassFonts.bodyBold, { color: colors.text }]}>{record.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {record.level} · {record.itemType}{record.contextName ? ` · ${record.contextName}` : ""}
          </Text>
        </View>
        <Badge label={stateLabel[record.evidenceState]} variant={stateVariant(record.evidenceState)} size="sm" />
      </View>
      <View style={styles.sourceGrid}>
        <SourceField label="Source URL" value={record.sourceUrl} />
        <SourceField label="Source locator" value={record.sourceLocator} />
        <SourceField label="Access date" value={record.sourceAccessedAt} />
      </View>
      <View style={[styles.exposure, { backgroundColor: exposure.allowed ? colors.greenSoft : colors.surface.subtle, borderColor: exposure.allowed ? colors.green : colors.border }]}>
        <Text style={[styles.exposureTitle, CompassFonts.bodyBold, { color: exposure.allowed ? colors.green : colors.text }]}>
          Student exposure: {exposure.allowed ? "allowed" : "blocked"}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{exposure.reason}</Text>
      </View>
      {record.evidenceNote ? <Text style={[styles.meta, { color: colors.textMuted }]}>Reviewer note: {record.evidenceNote}</Text> : null}
      {record.sourceUrl ? (
        <TouchableOpacity accessibilityRole="link" onPress={() => void Linking.openURL(record.sourceUrl!).catch(() => undefined)}>
          <Text style={[styles.link, { color: colors.accent }]}>Open source URL</Text>
        </TouchableOpacity>
      ) : null}
      {onApprove && approval.allowed ? (
        <TouchableOpacity accessibilityRole="button" onPress={() => onApprove(record)} style={[styles.approveButton, { borderColor: colors.accent }]}>
          <Text style={[styles.link, CompassFonts.bodyBold, { color: colors.accent }]}>Approve for student review</Text>
        </TouchableOpacity>
      ) : (
        <Text style={[styles.meta, { color: colors.textSoft }]}>Approval unavailable: {approval.reason}</Text>
      )}
    </View>
  );
}

/** Admin evidence ledger for all four guidance levels and relationship rows. */
export function AdminGuidanceEvidencePanel({ records, onApprove }: AdminGuidanceEvidencePanelProps) {
  const { colors } = useTheme();
  const blocked = records.filter((record) => !canExposeToStudents(record)).length;
  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, CompassFonts.bodyBold, { color: colors.text }]}>Evidence review and student-exposure gate</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>Admins can inspect programme, domain, subgroup, role and relationship evidence here. Student guidance accepts only explicitly approved rows with a retained source URL or locator and source access date. Review-required, no-link, not-established and audit-only rows remain blocked.</Text>
      <Text style={[styles.summary, CompassFonts.bodySemibold, { color: colors.text }]}>{records.length} records · {blocked} blocked from student exposure</Text>
      {records.length ? records.map((record) => <EvidenceRow key={record.id} record={record} onApprove={onApprove} />) : <Text style={[styles.meta, { color: colors.textMuted }]}>No evidence rows are available. The admin review is unavailable rather than empty.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  title: { fontSize: FontSize.md },
  description: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.55 },
  summary: { fontSize: FontSize.xs },
  row: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md, gap: Spacing.sm },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  copy: { flex: 1, gap: 3 },
  name: { fontSize: FontSize.sm },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  sourceGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  sourceField: { minWidth: 150, flex: 1, gap: 3 },
  sourceLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.4 },
  sourceValue: { fontSize: FontSize.xs },
  exposure: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: 3 },
  exposureTitle: { fontSize: FontSize.xs },
  link: { fontSize: FontSize.xs, textDecorationLine: "underline" },
  approveButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
});

export default AdminGuidanceEvidencePanel;
