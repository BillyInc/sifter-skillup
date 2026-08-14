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

function ToolChip({ tool, prominent }: { tool: ToolV2Enriched; prominent: boolean }) {
  const { colors } = useTheme();
  const openUrl = () => {
    if (tool.toolUrl) Linking.openURL(tool.toolUrl).catch(() => {});
  };

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: prominent ? colors.surface.subtle : colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
      ]}
    >
      <Text
        onPress={tool.toolUrl ? openUrl : undefined}
        style={[
          styles.chipText,
          { color: prominent ? colors.textRole.primary : colors.textRole.secondary },
          tool.toolUrl ? styles.chipLink : null,
        ]}
        numberOfLines={1}
      >
        {tool.tool}
        {tool.toolUrl ? " (open)" : ""}
      </Text>
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
      <Text style={[styles.subLabel, { color: colors.textRole.muted }]}>{label}</Text>
      <View style={styles.chipWrap}>
        {tools.map((tool, index) => (
          <ToolChip key={`${tool.tool}-${index}`} tool={tool} prominent={prominent} />
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
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <Text style={styles.explanation}>
        Learn the core tools first. The others are useful as your chosen direction develops.
      </Text>
      <ToolGroup label="Core tools" tools={distinctive} prominent />
      <ToolGroup label="Also useful" tools={common} prominent={false} />
    </View>
  );
}

export default ToolGroupsBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  explanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  group: { gap: Spacing.sm },
  subLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  chipLink: { textDecorationLine: "underline" },
});
