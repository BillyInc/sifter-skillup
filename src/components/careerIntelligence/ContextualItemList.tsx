import React, { useMemo, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, CareerLearningResource } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";

const PRIORITY_LABEL: Record<CareerContextItem["priority"], string> = {
  start_here: "Start here",
  build_next: "Build next",
  useful_later: "Useful later",
  optional: "Optional",
};

export function ContextualItemList({
  items,
  title = "What these capabilities mean here",
  resources,
  style,
}: { items?: CareerContextItem[]; title?: string; resources?: CareerLearningResource[]; style?: ViewStyle }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const ordered = useMemo(() => [...(items ?? [])].sort((a, b) => {
    const order = { start_here: 0, build_next: 1, useful_later: 2, optional: 3 };
    return order[a.priority] - order[b.priority] || a.name.localeCompare(b.name);
  }), [items]);
  if (!ordered.length) return null;
  const visible = expanded ? ordered : ordered.slice(0, 5);
  return (
    <View style={[styles.container, style]}>
      <SectionLabel>{title}</SectionLabel>
      <Text style={[styles.caption, { color: colors.textRole.muted }]}>You do not need to learn everything at once. Start with the items marked first, then open each item to understand why it matters.</Text>
      {visible.map((item) => {
        const key = `${item.contextKey}:${item.itemType}:${item.itemKey}`;
        const isOpen = openKey === key;
        return <View key={key} style={[styles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <View style={styles.header}>
            <View style={{ flex: 1, gap: Spacing.xs }}>
              <Text style={[styles.name, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{item.name}</Text>
              <Text style={[styles.priority, { color: colors.accentRole.action }]}>{PRIORITY_LABEL[item.priority]}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpenKey(isOpen ? null : key)}>
              <Text style={[styles.more, { color: colors.accentRole.action }]}>{isOpen ? "Show less" : "See more"}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{item.plainMeaning}</Text>
          <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{item.contextualUse}</Text>
          {isOpen ? <View style={[styles.detail, { borderTopColor: colors.borderRole.subtle }]}>
            {item.expectedOutput ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}><Text style={CompassFonts.bodySemibold}>What it helps you produce: </Text>{item.expectedOutput}</Text> : null}
            <Text style={[styles.copy, { color: colors.textRole.secondary }]}><Text style={CompassFonts.bodySemibold}>Why this position: </Text>{item.priorityReason}</Text>
            {item.prerequisites.length ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}><Text style={CompassFonts.bodySemibold}>Builds on: </Text>{item.prerequisites.join(", ")}</Text> : null}
            {item.relatedItems.length ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}><Text style={CompassFonts.bodySemibold}>Connects to: </Text>{item.relatedItems.join(", ")}</Text> : null}
            <View style={{ gap: Spacing.xs }}><Text style={[styles.sourceLabel, { color: colors.textRole.muted }]}>Sources</Text>{item.sourceReferences.map((source, index) => <Text key={`${source.url}-${index}`} accessibilityRole="link" onPress={() => void Linking.openURL(source.url)} style={[styles.source, { color: colors.accentRole.action }]}>{source.title ?? source.url}</Text>)}</View>
            {(() => {
              const supportedTypes: CareerLearningResource["resourceType"][] = item.itemType === "skill"
                ? ["skill_learning", "skill_reference"]
                : item.itemType === "tool"
                  ? ["tool_learning"]
                  : item.itemType === "competency"
                    ? ["competency_reference"]
                    : ["certification_exam", "professional_body"];
              const resource = resources?.find((candidate) => candidate.url && supportedTypes.includes(candidate.resourceType) && candidate.targetName.trim().toLowerCase() === item.name.trim().toLowerCase() && candidate.reviewStatus !== "review_only" && candidate.ownershipScope !== "audit_only");
              return resource ? (
                <View style={[styles.resourceHint, { borderTopColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.sourceLabel, { color: colors.textRole.muted }]}>Verified learning link</Text>
                  <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{resource.description || `${resource.provider} resource for ${item.name}.`}</Text>
                  <Text accessibilityRole="link" onPress={() => void Linking.openURL(resource.url)} style={[styles.source, { color: colors.accentRole.action }]}>{resource.provider} · Open resource</Text>
                </View>
              ) : <Text style={[styles.caption, { color: colors.textRole.muted }]}>No verified learning link is attached to this item yet.</Text>;
            })()}
            {item.evidenceLimitations.map((limitation) => <Text key={limitation} style={[styles.caption, { color: colors.textRole.muted }]}>Limit: {limitation}</Text>)}
          </View> : null}
        </View>;
      })}
      {ordered.length > 5 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)}><Text style={[styles.more, { color: colors.accentRole.action }]}>{expanded ? "Show fewer items" : `See all ${ordered.length} items`}</Text></TouchableOpacity> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  caption: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  name: { fontSize: FontSize.md },
  priority: { fontSize: FontSize.xs, fontWeight: "800" },
  copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  more: { fontSize: FontSize.sm, fontWeight: "800" },
  detail: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.sm },
  resourceHint: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.xs },
  sourceLabel: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase" },
  source: { fontSize: FontSize.sm, textDecorationLine: "underline" },
});

export default ContextualItemList;
