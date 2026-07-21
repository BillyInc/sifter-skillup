/**
 * ToolGroupsBlock — the tools of a field/cluster, split into two honest groups.
 *
 *  - "Core tools" (distinctive) — what characterises this field; prominent chips.
 *  - "Also expected" (common)   — widely-used, still expected; lighter chips.
 *
 * A high-demand tool gets a subtle demand flag. When a tool has
 * `demandScore` >= 0.8 it shows a "High" flag; a `toolUrl`
 * makes the chip tappable (opens canonical docs). Chips wrap. Renders nothing
 * when both groups are empty.
 */
import React from "react";
import { View, Text, StyleSheet, Linking, type ViewStyle } from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";
import type { ToolGroupsEnriched, ToolV2Enriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";

export interface ToolGroupsBlockProps {
  tools: ToolGroupsEnriched;
  title?: string;
  style?: ViewStyle;
}

const HIGH_DEMAND = 0.8;

function ToolChip({
  tool,
  prominent,
}: {
  tool: ToolV2Enriched;
  prominent: boolean;
}) {
  const { colors } = useTheme();
  const bg = prominent ? colors.surface.subtle : colors.surface.raised;
  const border = colors.borderRole.subtle;
  const textColor = prominent ? colors.textRole.primary : colors.textRole.secondary;
  const hasUrl = !!tool.toolUrl;
  const highDemand =
    typeof tool.demandScore === "number" && tool.demandScore >= HIGH_DEMAND;

  const openUrl = () => {
    if (tool.toolUrl) Linking.openURL(tool.toolUrl).catch(() => {});
  };

  return (
    <View
      style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
    >
      <Text
        onPress={hasUrl ? openUrl : undefined}
        style={[
          styles.chipText,
          {
            color: textColor,
            fontWeight: FontWeight.semibold,
          },
          hasUrl ? styles.chipLink : null,
        ]}
        numberOfLines={1}
      >
        {tool.tool}
        {hasUrl ? " ↗" : ""}
      </Text>
      {highDemand ? (
        <View style={[styles.demand, { backgroundColor: colors.demandSoft }]}>
          <Text style={[styles.demandText, { color: colors.demand }]}>
            High
          </Text>
        </View>
      ) : tool.inDemand ? (
        <View style={[styles.dot, { backgroundColor: colors.demand }]} />
      ) : null}
    </View>
  );
}

function ToolGroup({
  label,
  tools,
  prominent,
}: {
  label: string;
  tools: ToolV2Enriched[];
  prominent: boolean;
}) {
  const { colors } = useTheme();
  if (!tools.length) return null;

  return (
    <View style={styles.group}>
      <Text style={[styles.subLabel, { color: colors.textRole.muted }]}>
        {label}
      </Text>
      <View style={styles.chipWrap}>
        {tools.map((t, i) => (
          <ToolChip key={`${t.tool}-${i}`} tool={t} prominent={prominent} />
        ))}
      </View>
    </View>
  );
}

export function ToolGroupsBlock({ tools, title, style }: ToolGroupsBlockProps) {
  const distinctive = tools?.distinctive ?? [];
  const common = tools?.common ?? [];
  if (!distinctive.length && !common.length) return null;

  return (
    <View style={[styles.container, style]}>
      {title ? (
        <SectionLabel>{title}</SectionLabel>
      ) : null}
      <ToolGroup label="Core tools" tools={distinctive} prominent />
      <ToolGroup label="Also expected" tools={common} prominent={false} />
    </View>
  );
}

export default ToolGroupsBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  group: { gap: Spacing.sm },
  subLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  chipText: { fontSize: FontSize.sm },
  chipLink: { textDecorationLine: "underline" },
  demand: {
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  demandText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
});
