import React from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { LearningPlanCandidate } from "@/lib/guidedLearningPlan";
import { ContextRelationshipChips, relationshipLabel } from "./ContextRelationshipSheet";

const ITEM_TYPE_LABELS = {
  skill: "Skill",
  tool: "Tool",
  competency: "Competency",
  certification: "Certification or qualification",
  method: "Method",
  knowledge: "Knowledge",
  resource: "Learning resource",
} as const;

const CATEGORY_LABELS = {
  shared_foundation: "Shared foundation",
  useful_edge: "Useful additional edge",
  conditional: "Use when this task applies",
  area_addition: "Adds depth for this area",
  role_addition: "Adds depth for this role",
  complement: "Optional complement",
  alternative: "Alternative choice — choose one, not both",
  unclassified: "Additional learning option",
} as const;

function readableKey(value?: string): string | undefined {
  return value?.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function ComparisonOptionDetails({ option }: { option: LearningPlanCandidate }) {
  const { colors } = useTheme();
  const relationships = (option.relationships ?? [])
    .filter((relationship) => relationship.status === "source_backed"
      && Boolean(relationship.explanation?.trim())
      && relationship.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url)))
    .map((relationship) => ({
      type: relationship.type,
      label: relationshipLabel(relationship.type),
      target: relationship.targetName || relationship.targetId,
      explanation: relationship.explanation,
      status: relationship.status,
      sourceReferences: relationship.sourceReferences?.filter((reference) => /^https:\/\//i.test(reference.url)),
    }));
  const detailStyle = [styles.optionDetail, { color: colors.textRole.secondary }];
  return <View style={styles.optionDetails}>
    {option.itemType ? <Text style={detailStyle}>Type: {ITEM_TYPE_LABELS[option.itemType]}</Text> : null}
    {option.themeLabel ? <Text style={detailStyle}>Theme: {option.themeLabel}</Text> : null}
    {option.useCaseKey ? <Text style={detailStyle}>Use case: {readableKey(option.useCaseKey)}</Text> : null}
    {option.requirementLevel ? <Text style={detailStyle}>Why it is shown: {readableKey(option.requirementLevel)}</Text> : null}
    {option.plainMeaning ? <Text style={detailStyle}>What it is: {option.plainMeaning}</Text> : null}
    {option.contextualUse ? <Text style={detailStyle}>In this route: {option.contextualUse}</Text> : null}
    {option.expectedOutput ? <Text style={detailStyle}>What you can produce: {option.expectedOutput}</Text> : null}
    {option.prerequisiteNames?.length ? <Text style={detailStyle}>Learn or review first: {option.prerequisiteNames.join(", ")}</Text> : null}
    {option.limitations?.length ? <Text style={detailStyle}>Limits: {option.limitations.join("; ")}</Text> : null}
    {option.linkUrl && /^https:\/\//i.test(option.linkUrl) ? <TouchableOpacity
      accessibilityRole="link"
      accessibilityLabel={`Open learning resource for ${option.name}`}
      onPress={() => { void Linking.openURL(option.linkUrl!); }}
      style={styles.resourceLink}
    >
      <Text style={[styles.resourceLinkText, { color: colors.accentRole.action }]}>Open learning resource</Text>
    </TouchableOpacity> : null}
    <ContextRelationshipChips itemName={option.name} relationships={relationships} />
  </View>;
}

export function AlternativeComparisonSheet({
  group,
  options,
  selectedId,
  visible,
  onClose,
  onSelect,
}: {
  group: string;
  options: LearningPlanCandidate[];
  selectedId?: string;
  visible: boolean;
  onClose: () => void;
  onSelect: (candidate: LearningPlanCandidate) => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>Compare options</Text>
              <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>{group}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close comparison" onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textRole.muted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.intro, { color: colors.textRole.secondary }]}>These options serve a similar purpose. Comparing them does not change your plan. Select one option only when you want it included.</Text>
          <View style={styles.options}>
            {options.map((option) => (
              <View key={option.id} style={[styles.option, { borderColor: option.id === selectedId ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: option.id === selectedId ? colors.surface.subtle : colors.surface.raised }]}>
                <Text style={[styles.optionName, { color: colors.textRole.primary }]}>{option.name}</Text>
                {option.explanation ? <Text style={[styles.optionExplanation, { color: colors.textRole.secondary }]}>{option.explanation}</Text> : null}
                {option.category ? <Text style={[styles.optionMeta, { color: colors.textRole.muted }]}>How it fits: {CATEGORY_LABELS[option.category]}</Text> : null}
                <ComparisonOptionDetails option={option} />
                <TouchableOpacity accessibilityRole="button" onPress={() => { onSelect(option); onClose(); }} style={[styles.selectButton, { backgroundColor: option.id === selectedId ? colors.borderRole.subtle : colors.accentRole.action }]}>
                  <Text style={[styles.selectText, { color: option.id === selectedId ? colors.textRole.primary : "#fff" }]}>{option.id === selectedId ? "Selected option" : "Select this option"}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={[styles.closeAction, { borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.closeActionText, { color: colors.textRole.primary }]}>Keep comparing</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.42)" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  titleBlock: { flex: 1, gap: 4 },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  title: { fontSize: FontSize.lg },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  options: { gap: Spacing.sm },
  option: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  optionName: { fontSize: FontSize.md, fontWeight: "800" },
  optionExplanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  optionMeta: { fontSize: FontSize.xs },
  optionDetails: { gap: Spacing.xs, paddingTop: Spacing.xs },
  optionDetail: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.35 },
  resourceLink: { minHeight: 40, alignSelf: "flex-start", justifyContent: "center" },
  resourceLinkText: { fontSize: FontSize.sm, fontWeight: "800" },
  selectButton: { minHeight: 40, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md, marginTop: Spacing.xs },
  selectText: { fontSize: FontSize.sm, fontWeight: "800" },
  closeAction: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  closeActionText: { fontSize: FontSize.sm, fontWeight: "800" },
});
