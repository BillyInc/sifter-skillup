import React, { useState } from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, type ViewStyle } from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";
import type { ToolGroupsEnriched, ToolV2Enriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";

export interface ToolGroupsBlockProps {
  tools: ToolGroupsEnriched;
  title?: string;
  explanation?: string;
  commonLabel?: string;
  distinctiveLabel?: string;
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

export function ToolGroupsBlock({
  tools,
  title,
  explanation = "Start with the tools shown first. The rest become more useful as you choose an area or role.",
  commonLabel = "Useful across this field",
  distinctiveLabel = "Used in particular areas",
  style,
}: ToolGroupsBlockProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const common = tools?.common ?? [];
  const distinctive = tools?.distinctive ?? [];
  if (!distinctive.length && !common.length) return null;
  const total = common.length + distinctive.length;
  const visibleCommon = expanded ? common : common.slice(0, 4);
  const visibleDistinctive = expanded ? distinctive : distinctive.slice(0, 4);
  const hasHidden = visibleCommon.length < common.length || visibleDistinctive.length < distinctive.length;

  return (
    <View style={[styles.container, style]}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <Text style={styles.explanation}>{explanation}</Text>
      <ToolGroup label={commonLabel} tools={visibleCommon} prominent />
      <ToolGroup label={distinctiveLabel} tools={visibleDistinctive} prominent={false} />
      {(hasHidden || expanded) ? (
        <TouchableOpacity
          onPress={() => setExpanded((value) => !value)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={styles.moreButton}
        >
          <Text style={[styles.moreText, { color: colors.accentRole.action }]}>
            {expanded ? "Show fewer tools" : `See all ${total} tools`}
          </Text>
        </TouchableOpacity>
      ) : null}
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
  moreButton: { alignSelf: "flex-start", minHeight: 34, justifyContent: "center" },
  moreText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
