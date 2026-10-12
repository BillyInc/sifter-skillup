import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, FoundationSkill, ProgrammeDomainConnection } from "@/types/career";
import { additiveStageItems, domainStageItems, formatPathItem } from "@/lib/cumulativeLearningPath";
import { SectionLabel } from "./RedesignPrimitives";

type Props = {
  programmeName?: string | null;
  connection?: ProgrammeDomainConnection | null;
  domainName: string;
  subgroupName?: string | null;
  roleName?: string | null;
  domainFoundation?: FoundationSkill[];
  domainItems?: CareerContextItem[];
  subgroupItems?: CareerContextItem[];
  roleItems?: CareerContextItem[];
};

function Stage({ title, text, items }: { title: string; text?: string; items?: string[] }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stage, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text style={[styles.stageTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>
      {text ? <Text style={[styles.stageText, { color: colors.textRole.secondary }]}>{text}</Text> : null}
      {items?.length ? <Text style={[styles.items, { color: colors.textRole.muted }]}>{items.join(" · ")}</Text> : null}
    </View>
  );
}

/** Shows the inherited-to-added route without duplicating a flat skills list. */
export function GuidanceContinuation({ programmeName, connection, domainName, subgroupName, roleName, domainFoundation, domainItems, subgroupItems, roleItems }: Props) {
  const { colors } = useTheme();
  // Course codes remain provenance/API data; the learner-facing route uses
  // the course title only, because codes are not consistent across universities.
  const programmeCourses = (connection?.courseAnchors ?? []).slice(0, 3).map((item) => item.title);
  const programmeOutcomes = [...new Set((connection?.transferableEvidence ?? []).slice(0, 3))];
  const programmeEvidence = [...programmeCourses, ...programmeOutcomes];
  const domainStage = domainStageItems(domainFoundation, domainItems);
  const subgroupStage = subgroupName ? additiveStageItems(subgroupItems, domainStage) : [];
  const roleStage = additiveStageItems(roleItems, [...domainStage, ...subgroupStage]);
  const domainLabels = domainStage.slice(0, 4).map(formatPathItem);
  const subgroupLabels = subgroupStage.slice(0, 4).map(formatPathItem);
  const roleLabels = roleStage.slice(0, 4).map(formatPathItem);
  const hasProgrammeStage = Boolean(programmeName && (connection?.explanation?.trim() || programmeEvidence.length));
  const hasDomainStage = domainStage.length > 0;
  const hasSubgroupStage = Boolean(subgroupName && subgroupStage.length);
  const hasRoleStage = Boolean(roleName && roleStage.length);
  const hasAny = hasProgrammeStage || hasDomainStage || hasSubgroupStage || hasRoleStage;
  if (!hasAny) return null;
  return (
    <View style={styles.container}>
      <SectionLabel>How this path builds</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>Only the stages supported by the selected programme, field, subgroup and role records are shown.</Text>
      <View style={styles.grid}>
        {hasProgrammeStage ? (
          <View style={styles.programmeStage}>
            <Stage title={`Already covered in ${programmeName} for this field`} text={connection?.explanation?.trim() || "This is fixed programme learning, not selectable extra learning."} />
            {programmeCourses.length ? <Stage title="Relevant curriculum already covered" text="These course anchors are the programme evidence carried into this field." items={programmeCourses} /> : null}
            {programmeOutcomes.length ? <Stage title="Relevant outcome evidence already covered" text="These capabilities are carried forward from the programme record; the domain additions appear next." items={programmeOutcomes} /> : null}
          </View>
        ) : null}
        {hasDomainStage ? <Stage title={`Shared foundation in ${domainName}`} text="Start with the knowledge and abilities shared across this field. The next stage adds the learning needed for a more focused direction." items={domainLabels} /> : null}
        {hasSubgroupStage ? <Stage title={`This focused area adds capabilities in ${subgroupName}`} text="This stage shows only what this area adds. The shared domain foundation carries forward without being repeated." items={subgroupLabels} /> : null}
        {hasRoleStage ? <Stage title={subgroupName ? `This role applies the path: ${roleName}` : `This role applies the foundation: ${roleName}`} text={subgroupName ? "This stage adds the work-specific learning for the role after the domain and focused-area foundations." : "This domain has no subgroup on this route, so the role builds directly on the domain foundation."} items={roleLabels} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  programmeStage: { flex: 1, minWidth: 230, gap: Spacing.sm },
  stage: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, flex: 1, minWidth: 230 },
  stageTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.3 },
  stageText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  items: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
});

export default GuidanceContinuation;
