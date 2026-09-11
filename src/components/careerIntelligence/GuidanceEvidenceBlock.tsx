import React, { useState } from "react";
import { Linking, Pressable, View, Text, StyleSheet, type ViewStyle } from "react-native";
import { CompassFonts, useTheme, Spacing, FontSize, FontWeight, Radius } from "../../theme";
import type { GuidanceEvidence, GuidanceEvidenceLens } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { hasInternetConnection, OFFLINE_LINK_NOTICE } from "../../lib/networkState";

export interface GuidanceEvidenceBlockProps {
  evidence?: GuidanceEvidence;
  style?: ViewStyle;
}

function LensRow({ label, lens }: { label: string; lens: GuidanceEvidenceLens }) {
  const { colors } = useTheme();
  const [notice, setNotice] = useState<string | null>(null);
  const stateLabel =
    lens.state === "source_backed"
      ? "Supported by sources"
      : lens.state === "context_only"
        ? "Context only"
        : lens.state === "limited"
          ? "Limited source coverage"
          : lens.state === "pending"
            ? "Being checked"
            : "Not available";

  return (
    <View style={[styles.row, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={styles.rowHeading}>
        <Text style={[styles.label, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text>
        <Text style={[styles.state, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>{stateLabel}</Text>
      </View>
      <Text style={[styles.explanation, { color: colors.textRole.secondary }, CompassFonts.body]}>{lens.explanation}</Text>
      {lens.sources?.length ? (
        <View style={styles.sources}>
          <Text style={[styles.sourcesLabel, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
            Sources for this signal
          </Text>
          {lens.sources.map((source) => (
            <Pressable
              key={`${source.id}|${source.url}`}
              accessibilityRole="link"
              accessibilityLabel={`Open source: ${source.label}`}
              onPress={async () => {
                if (!(await hasInternetConnection())) {
                  setNotice(OFFLINE_LINK_NOTICE);
                  return;
                }
                const opened = await Linking.openURL(source.url).then(() => true).catch(() => false);
                if (!opened) setNotice("This source could not be opened. Try again when your connection is stable.");
              }}
              style={styles.sourceLink}
            >
              <Text style={[styles.sourceText, { color: colors.accentRole.action }, CompassFonts.bodyMedium]}>
                {source.label}
              </Text>
            </Pressable>
          ))}
          {notice ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>{notice}</Text> : null}
        </View>
      ) : null}
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
        This guidance starts with the local context attached to this route. It explains why the connection is shown; it is not a promise of demand, employment or a licence.
      </Text>
      <View style={styles.rows}>
        <LensRow label="Local context" lens={evidence.nigeria} />
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
  sources: { gap: 3, marginTop: Spacing.xs },
  sourcesLabel: { fontSize: FontSize.xs },
  sourceLink: { alignSelf: "flex-start", paddingVertical: 2 },
  sourceText: { fontSize: FontSize.xs, textDecorationLine: "underline" },
  moreButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: FontSize.sm },
  limit: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  notice: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
});
