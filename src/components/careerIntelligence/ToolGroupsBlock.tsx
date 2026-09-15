import React, { useState } from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, type ViewStyle } from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";
import type { CareerLearningResource, ToolGroupsEnriched, ToolV2Enriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";

export interface ToolGroupsBlockProps {
  tools: ToolGroupsEnriched;
  resources?: CareerLearningResource[];
  title?: string;
  explanation?: string;
  commonLabel?: string;
  distinctiveLabel?: string;
  style?: ViewStyle;
}

function ToolChip({ tool, prominent, resource }: { tool: ToolV2Enriched; prominent: boolean; resource?: CareerLearningResource }) {
  const { colors } = useTheme();
  const url = tool.toolUrl || resource?.url;
  const openUrl = () => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.toolItem}>
      <TouchableOpacity
        disabled={!url}
        onPress={url ? openUrl : undefined}
        accessibilityRole={url ? "link" : undefined}
        style={[
          styles.chip,
          {
            backgroundColor: prominent ? colors.surface.subtle : colors.surface.raised,
            borderColor: colors.borderRole.subtle,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: prominent ? colors.textRole.primary : colors.textRole.secondary },
            url ? styles.chipLink : null,
          ]}
          numberOfLines={1}
        >
          {tool.tool}{url ? " · open learning link" : ""}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.toolNote, { color: colors.textRole.muted }]}>
        {resource?.description || (tool.elementName ? `Recorded in source evidence for ${tool.elementName}.` : "No verified learning link is attached to this tool yet.")}
      </Text>
    </View>
  );
}

function isSourceCategory(label: string): boolean {
  return [
    "spreadsheet software",
    "analytical or scientific software",
    "development environment software",
    "data base management system software",
    "data base user interface and query software",
    "enterprise application integration software",
    "office suite software",
    "project management software",
    "web platform development software",
    "business intelligence and data analysis software",
    "object or component oriented development software",
    "content workflow software",
  ].includes(label.trim().toLowerCase());
}

function ToolGroup({
  label,
  tools,
  prominent,
  resources,
}: {
  label: string;
  tools: ToolV2Enriched[];
  prominent: boolean;
  resources?: CareerLearningResource[];
}) {
  const { colors } = useTheme();
  if (!tools.length) return null;
  return (
    <View style={styles.group}>
      <Text style={[styles.subLabel, { color: colors.textRole.muted }]}>{label}</Text>
      <View style={styles.chipWrap}>
        {tools.map((tool, index) => (
          <ToolChip
            key={`${tool.tool}-${index}`}
            tool={tool}
            prominent={prominent}
            resource={resources?.find((item) => item.resourceType === "tool_learning" && item.targetName.trim().toLowerCase() === String(tool.tool ?? "").trim().toLowerCase())}
          />
        ))}
      </View>
    </View>
  );
}

export function ToolGroupsBlock({
  tools,
  resources,
  title,
  explanation = "Start with the tools shown first. The rest become more useful as you choose an area or role.",
  commonLabel = "Useful across this field",
  distinctiveLabel = "Used in particular areas",
  style,
}: ToolGroupsBlockProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  // These labels are source taxonomy categories, not named tools a student
  // can choose to learn. Keep them in audit data but out of guidance.
  const common = (tools?.common ?? []).filter((tool) => !isSourceCategory(tool.tool));
  const distinctive = (tools?.distinctive ?? []).filter((tool) => !isSourceCategory(tool.tool));
  if (!distinctive.length && !common.length) return null;
  const total = common.length + distinctive.length;
  const visibleCommon = expanded ? common : common.slice(0, 4);
  const visibleDistinctive = expanded ? distinctive : distinctive.slice(0, 4);
  const hasHidden = visibleCommon.length < common.length || visibleDistinctive.length < distinctive.length;

  return (
    <View style={[styles.container, style]}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <Text style={styles.explanation}>{explanation}</Text>
      <ToolGroup label={commonLabel} tools={visibleCommon} prominent resources={resources} />
      <ToolGroup label={distinctiveLabel} tools={visibleDistinctive} prominent={false} resources={resources} />
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
  toolItem: { gap: 3 },
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
  toolNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35, maxWidth: 520 },
  moreButton: { alignSelf: "flex-start", minHeight: 34, justifyContent: "center" },
  moreText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
