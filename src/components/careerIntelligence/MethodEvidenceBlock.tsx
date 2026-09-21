import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import type { ComputationalMethodEvidence } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { studentSafeUrl } from "@/lib/studentCareerBoundary";

export interface MethodEvidenceBlockProps {
  methods?: Array<ComputationalMethodEvidence & { subgroupId?: string | null }>;
  title?: string;
}

/** Shows source-backed methods without implying demonstrated student mastery. */
export function MethodEvidenceBlock({ methods, title = "Ways of working that support these skills" }: MethodEvidenceBlockProps) {
  const { colors } = useTheme();
  if (!methods?.length) return null;

  return (
    <View style={styles.container}>
      <SectionLabel>{title}</SectionLabel>
      <Text style={[styles.explanation, { color: colors.textRole.muted }, CompassFonts.body]}>
        These are ways of working that support the skills and competencies above. They show how people carry out the work; they are not a separate checklist and do not mean that you already have the competence.
      </Text>
      <View style={styles.list}>
        {methods.map((method, index) => (
          <View
            key={`${method.name}-${method.subgroupId ?? "method"}-${index}`}
            style={[styles.item, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          >
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                {method.name}
              </Text>
              <Text style={[styles.kind, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
                {method.classification === "knowledge" ? "Method knowledge" : method.classification}
              </Text>
            </View>
            {method.description ? (
              <Text style={[styles.description, { color: colors.textRole.secondary }, CompassFonts.body]}>
                {method.description}
              </Text>
            ) : null}
            <ExternalLinkGuard
              url={method.sourceProvenance && typeof method.sourceProvenance === "object" ? firstSourceUrl(method.sourceProvenance) : undefined}
              label={firstSourceUrl(method.sourceProvenance ?? {}) ? "Open source for this method" : "No verified source for this method yet"}
              description={`This opens the source used to explain ${method.name}.`}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function firstSourceUrl(provenance: Record<string, unknown>): string | undefined {
  for (const key of ["sourceUrl", "source_url", "url"]) {
    const value = provenance[key];
    const safe = studentSafeUrl(typeof value === "string" ? value : undefined);
    if (safe) return safe;
  }
  return undefined;
}

export default MethodEvidenceBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  explanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  list: { gap: Spacing.sm },
  item: { gap: 4, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md },
  titleRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: Spacing.sm, flexWrap: "wrap" },
  name: { fontSize: FontSize.md, flexShrink: 1 },
  kind: { fontSize: FontSize.xs, textTransform: "uppercase" },
  description: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
});
