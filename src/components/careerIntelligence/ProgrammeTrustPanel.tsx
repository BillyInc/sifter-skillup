import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FontSize, Radius, Spacing, useTheme } from "@/theme";
import { MappingFeedbackButton } from "./MappingFeedbackButton";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import type { ProgrammeTrust } from "@/lib/programmeTrust";

export interface ProgrammeTrustPanelProps {
  trust: ProgrammeTrust;
  programmeId: string;
  programmeLabel: string;
  schoolId?: string | null;
  schoolLabel?: string | null;
}

export function ProgrammeTrustPanel({ trust, programmeId, programmeLabel, schoolId, schoolLabel }: ProgrammeTrustPanelProps) {
  const { colors } = useTheme();
  const tone =
    trust.status === "verified" ? colors.accentRole.success
    : trust.status === "needs_confirmation" ? colors.accentRole.warning
    : colors.textRole.muted;
  return (
    <View
      accessibilityLabel={`Information status: ${trust.statusLabel}`}
      style={[styles.box, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textRole.muted }]}>Information status</Text>
        <Text style={[styles.status, { color: tone, borderColor: tone }]}>{trust.statusLabel}</Text>
      </View>
      {trust.sourceLabel ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>Source: {trust.sourceLabel}</Text> : null}
      {trust.recordedOn ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>Record processed: {trust.recordedOn}</Text> : null}
      {trust.status === "needs_confirmation" ? (
        <Text style={[styles.meta, { color: colors.textRole.muted }]}>Confirm these details with the university before you apply.</Text>
      ) : null}
      {trust.status === "not_available" ? (
        <Text style={[styles.meta, { color: colors.textRole.muted }]}>No verified record is available for this yet.</Text>
      ) : null}
      <View style={styles.actions}>
        {trust.officialSourceUrl ? (
          <ExternalLinkGuard
            audience="student"
            url={trust.officialSourceUrl}
            label="Check official source"
            description={`Open the source recorded for ${programmeLabel}.`}
            textStyle={[styles.link, { color: colors.accentRole.action }]}
          />
        ) : null}
        <MappingFeedbackButton
          compact
          variant="outline"
          icon="flag"
          edgeType="programme_requirement"
          sourceId={programmeId}
          sourceLabel={programmeLabel}
          targetId={schoolId ?? programmeId}
          targetLabel={schoolLabel ?? "Requirements"}
          label="Report incorrect information"
          title="Report incorrect information"
          allowedTypes={["flag", "suggest"]}
          optionLabels={{ flag: "Something is incorrect", suggest: "Suggest a correction" }}
          placeholder="Tell us what looks wrong (do not include personal details)…"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, alignSelf: "stretch" },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, flexWrap: "wrap" },
  label: { fontSize: FontSize.sm, fontWeight: "700" },
  status: { fontSize: FontSize.sm, fontWeight: "800", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  meta: { fontSize: FontSize.sm, lineHeight: 18 },
  actions: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flexWrap: "wrap", marginTop: Spacing.xs },
  link: { fontSize: FontSize.sm, fontWeight: "800" },
});
