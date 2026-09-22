import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, FoundationSkill, ProgrammeDomainConnection } from "@/types/career";
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

function names(items?: CareerContextItem[]): string[] {
  return [...new Set((items ?? [])
    .filter((item) => item.dataState === "source_backed" && item.sourceConfidence !== "unsourced" && item.guidanceOwner === item.contextLevel)
    .map((item) => item.name)
    .filter(Boolean))].slice(0, 4);
}

function Stage({ title, text, items }: { title: string; text: string; items?: string[] }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stage, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text style={[styles.stageTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>
      <Text style={[styles.stageText, { color: colors.textRole.secondary }]}>{text}</Text>
      {items?.length ? <Text style={[styles.items, { color: colors.textRole.muted }]}>{items.join(" · ")}</Text> : null}
    </View>
  );
}

/** Shows the inherited-to-added route without duplicating a flat skills list. */
export function GuidanceContinuation({ programmeName, connection, domainName, subgroupName, roleName, domainFoundation, domainItems, subgroupItems, roleItems }: Props) {
  const { colors } = useTheme();
  const programmeEvidence = connection?.transferableEvidence?.slice(0, 3) ?? connection?.courseAnchors?.slice(0, 3).map((item) => item.title);
  const domainNames = names(domainItems);
  const foundationNames = [...new Set((domainFoundation ?? []).map((item) => item.skill).filter(Boolean))].slice(0, 4);
  const subgroupNames = names(subgroupItems);
  const roleNames = names(roleItems);
  const hasAny = Boolean(programmeName || connection || domainNames.length || foundationNames.length || subgroupNames.length || roleNames.length);
  if (!hasAny) return null;
  return (
    <View style={styles.container}>
      <SectionLabel>How this path builds</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>Each step keeps what came before and adds a more focused way to use it. The names below come from the programme and field information.</Text>
      <View style={styles.grid}>
        {programmeName ? <Stage title={`From ${programmeName}`} text={connection?.explanation || "The programme is the starting point for this route."} items={programmeEvidence} /> : null}
        <Stage title={`Shared foundation in ${domainName}`} text="Start with the foundation shared across this field." items={foundationNames.length ? foundationNames : domainNames} />
        {subgroupName ? <Stage title={`${subgroupName} adds`} text="This focused area adds methods and capabilities for a narrower kind of work." items={subgroupNames} /> : null}
        {roleName ? <Stage title={`${roleName} focuses`} text="This role applies the path to a particular kind of work and output." items={roleNames} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  stage: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, flex: 1, minWidth: 230 },
  stageTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.3 },
  stageText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  items: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
});

export default GuidanceContinuation;
