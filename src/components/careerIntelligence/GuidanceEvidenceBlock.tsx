import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import { CompassFonts, useTheme, Spacing, FontSize, FontWeight, Radius } from "../../theme";
import type { GuidanceEvidence, GuidanceEvidenceLens } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";

export interface GuidanceEvidenceBlockProps {
  evidence?: GuidanceEvidence;
  style?: ViewStyle;
}

const LENSES: Array<{ key: "nigeria" | "remote" | "global"; label: string }> = [
  { key: "nigeria", label: "Nigeria" },
  { key: "remote", label: "Remote" },
  { key: "global", label: "Global" },
];

function LensRow({ label, lens }: { label: string; lens: GuidanceEvidenceLens }) {
  const { colors } = useTheme();
  const stateLabel =
    lens.state === "source_backed"
      ? "Source-backed"
      : lens.state === "context_only"
        ? "Context available"
        : lens.state === "limited"
          ? "Limited evidence"
          : lens.state === "pending"
            ? "Pending"
            : "Not attached";

  return (
    <View style={[styles.row, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={styles.rowHeading}>
        <Text style={[styles.label, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text>
        <Text style={[styles.state, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>{stateLabel}</Text>
      </View>
      <Text style={[styles.explanation, { color: colors.textRole.secondary }, CompassFonts.body]}>{lens.explanation}</Text>
    </View>
  );
}

/** Makes evidence scope visible without exposing internal scores or ranks. */
export function GuidanceEvidenceBlock({ evidence, style }: GuidanceEvidenceBlockProps) {
  const { colors } = useTheme();
  if (!evidence) return null;

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>How this guidance is supported</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.muted }, CompassFonts.body]}>
        Nigerian, remote and global signals are kept separate. A missing local signal does not make a portable skill less useful, and global evidence does not establish a Nigerian licence.
      </Text>
      <View style={styles.rows}>
        {LENSES.map(({ key, label }) => <LensRow key={key} label={label} lens={evidence[key]} />)}
      </View>
      {evidence.limitations?.map((limitation, index) => (
        <Text key={`${limitation}-${index}`} style={[styles.limit, { color: colors.textRole.muted }, CompassFonts.body]}>
          {limitation}
        </Text>
      ))}
    </View>
  );
}

export default GuidanceEvidenceBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  rows: { gap: Spacing.sm },
  row: { gap: 4, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md },
  rowHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: Spacing.sm },
  label: { fontSize: FontSize.md },
  state: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  explanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  limit: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
});
