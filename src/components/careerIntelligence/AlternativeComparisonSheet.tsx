import React from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import type { LearningPlanCandidate } from "@/lib/guidedLearningPlan";
import { studentContextSections, studentFacingCopy, studentGeographicContext, studentItemLimitations, studentOutputCopy, studentReasonCopy, studentResourceRationale } from "@/lib/studentExplanation";

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
  alternative: "Alternative choice",
  unclassified: "Additional learning option",
} as const;

type CompareRow = {
  label: string;
  value: (option: LearningPlanCandidate) => string;
};

function readableKey(value?: string): string | undefined {
  return value?.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function comparisonTaskCopy(option: LearningPlanCandidate): string {
  const sections = studentContextSections(option.contextualUse);
  return [
    sections.meaning ? `How it is used: ${studentFacingCopy(sections.meaning)}` : "",
    sections.task ? `Example of the work: ${studentFacingCopy(sections.task)}` : "",
  ].filter(Boolean).join("\n\n") || readableKey(option.useCaseKey) || "No task description recorded.";
}

function comparisonLimitCopy(option: LearningPlanCandidate): string {
  const guardrail = studentContextSections(option.contextualUse).guardrail;
  const limitations = studentItemLimitations(option.limitations);
  return [
    guardrail ? `What to keep in mind: ${studentFacingCopy(guardrail)}` : "",
    limitations.length ? `What it cannot replace or prove: ${limitations.map(studentFacingCopy).filter(Boolean).join("; ")}` : "",
  ].filter(Boolean).join("\n\n");
}

const COMPARE_ROWS: CompareRow[] = [
  { label: "What it is", value: (option) => studentFacingCopy(option.plainMeaning || option.explanation) || "A learner-facing explanation is not available for this choice." },
  { label: "Best suited task", value: comparisonTaskCopy },
  { label: "Why it fits this route", value: (option) => [option.requirementReason, option.roleContext, option.areaContext, option.domainContext, option.programmeContext].map(studentReasonCopy).find(Boolean) || "No route-specific explanation is attached." },
  { label: "Evidence context", value: (option) => studentGeographicContext(option.geographicScope) },
  { label: "Possible output", value: (option) => studentOutputCopy(option.expectedOutput, option.contextualUse) || "No separate output recorded." },
  { label: "Learn first", value: (option) => {
    const prerequisites = option.relationships?.filter((relation) => relation.status === "source_backed"
      && relation.sequenceApproved === true
      && relation.sequencePolicy === "hard_prerequisite");
    if (prerequisites?.length) return prerequisites.map((relation) =>
      `${relation.targetName || relation.targetId}: ${studentFacingCopy(relation.explanation) || "This is an approved prerequisite for this route."}`,
    ).join("\n\n");
    return option.prerequisiteNames?.length
      ? `${option.prerequisiteNames.map(studentFacingCopy).filter(Boolean).join(", ")}. These are preparation items recorded for this route.`
      : "No required learning-before relationship is recorded for this choice.";
  } },
  {
    label: "Useful alongside",
    value: (option) => option.relationships?.filter((relation) => relation.status === "source_backed" && (relation.type === "complements" || relation.type === "supports"))
      .map((relation) => `${relation.targetName || relation.targetId}: ${studentFacingCopy(relation.explanation) || "A reviewed connection is recorded, but its explanation is not attached."}`).join("\n\n") || "No complementary item recorded.",
  },
  { label: "Limits", value: comparisonLimitCopy },
  { label: "Access or cost", value: (option) => {
    const notes = [option.linkAccess, ...((option.learningLinks ?? []).map((link) => link.access))].filter((value): value is string => Boolean(value?.trim()));
    return notes.length ? [...new Set(notes)].join("\n\n") : "No access or cost information is attached to this item.";
  } },
  {
    label: "Source coverage",
    value: (option) => {
      const regions = Array.from(new Set((option.sourceReferences ?? []).map((reference) => reference.region).filter(Boolean)));
      return regions.length ? regions.map((region) => region === "nigeria" ? "Nigeria" : region === "global" ? "Global" : region).join(" · ") : "Source context is not recorded.";
    },
  },
  { label: "Learning destination", value: (option) => {
    const link = option.learningLinks?.[0];
    if (!link && !option.linkUrl) return "No learning destination attached.";
    const title = link?.title || option.linkTitle || "Verified learning resource";
    const rationale = link?.rationale || option.linkRationale;
    const locator = link?.locator;
    return `${title}. Why attached: ${studentResourceRationale(rationale, option.name, option.contextualUse, locator)}`;
  } },
];

function ComparisonCell({ option, row, selected }: {
  option: LearningPlanCandidate;
  row: CompareRow;
  selected: boolean;
}) {
  const { colors } = useTheme();
  const currentValue = studentFacingCopy(row.value(option)) || "A learner-facing explanation is not available for this comparison.";
  return (
    <View style={[styles.optionColumn, { borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected ? colors.surface.subtle : colors.surface.raised }]}>
      <Text style={[styles.optionName, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>{option.name}</Text>
      {option.itemType ? <Text style={[styles.optionMeta, { color: colors.textRole.muted }]}>{ITEM_TYPE_LABELS[option.itemType]}{option.category ? ` · ${CATEGORY_LABELS[option.category]}` : ""}</Text> : null}
      {option.themeLabel ? <Text style={[styles.optionMeta, { color: colors.textRole.muted }]}>{option.themeLabel}</Text> : null}
      <Text style={[styles.cellText, { color: colors.textRole.secondary }]}>{currentValue}</Text>
      {row.label === "Learning destination" && option.linkUrl && /^https:\/\//i.test(option.linkUrl) ? (
        <TouchableOpacity accessibilityRole="link" accessibilityLabel={`Open learning destination for ${option.name}`} onPress={() => { void Linking.openURL(option.linkUrl!); }} style={styles.linkAction}>
          <Text style={[styles.linkText, { color: colors.accentRole.action }]}>{option.linkTitle || option.learningLinks?.[0]?.title || "Open learning destination"}</Text>
        </TouchableOpacity>
      ) : null}
      {row.label === "Source coverage" ? option.sourceReferences?.filter((reference) => /^https:\/\//i.test(reference.url)).map((reference) => (
        <TouchableOpacity key={`${option.id}:${reference.url}`} accessibilityRole="link" accessibilityLabel={`Open reference for ${option.name}: ${reference.title || reference.url}`} onPress={() => { void Linking.openURL(reference.url); }} style={styles.linkAction}>
          <Text style={[styles.linkText, { color: colors.accentRole.action }]}>{reference.title || "Open reference"}</Text>
        </TouchableOpacity>
      )) : null}
    </View>
  );
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
  const { width } = useWindowDimensions();
  const [pendingChoiceId, setPendingChoiceId] = React.useState<string | null>(null);
  const [replacing, setReplacing] = React.useState(false);
  const wide = width >= 760;
  const selected = options.find((option) => option.id === selectedId);
  const pending = options.find((option) => option.id === pendingChoiceId);

  React.useEffect(() => {
    if (!visible) {
      setPendingChoiceId(null);
      setReplacing(false);
    }
  }, [visible]);

  const choose = (candidate: LearningPlanCandidate) => {
    if (candidate.id === selectedId) return;
    if (selectedId) {
      setPendingChoiceId(candidate.id);
      setReplacing(true);
      return;
    }
    onSelect(candidate);
    onClose();
  };

  const confirmReplacement = () => {
    if (!pending) return;
    onSelect(pending);
    setPendingChoiceId(null);
    setReplacing(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { justifyContent: wide ? "center" : "flex-end" }]} onPress={onClose}>
        <Pressable style={[styles.sheet, wide ? styles.desktopSheet : styles.mobileSheet, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>Compare choices for this task</Text>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>{group}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close comparison" onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textRole.muted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.intro, { color: colors.textRole.secondary }]}>These are alternatives for the same learning choice. Comparing them does not change your plan. Choose one only if you want it in this route; complementary items remain separate.</Text>
          {options.length < 2 ? (
            <Text style={[styles.empty, { color: colors.textRole.secondary }]}>There is not another supported option to compare in this group.</Text>
          ) : (
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
              <ScrollView horizontal showsHorizontalScrollIndicator accessibilityLabel="Swipe horizontally to compare all options" contentContainerStyle={styles.matrix}>
                <View>
                  <View style={styles.compareRow}>
                    <View style={[styles.labelHeader, styles.rowLabelCell]}><Text style={[styles.rowHeaderText, { color: colors.textRole.muted }]}>COMPARE</Text></View>
                    {options.map((option) => <View key={`${option.id}:heading`} style={[styles.labelHeader, styles.optionHeader, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                      <Text style={[styles.columnTitle, { color: colors.textRole.primary }]}>{option.name}</Text>
                      {option.requirementLevel ? <Text style={[styles.optionMeta, { color: colors.textRole.muted }]}>{option.requirementLevel === "needed" ? "Needed in this route" : option.requirementLevel === "useful" ? "Useful for this route" : "Optional"}</Text> : null}
                    </View>)}
                  </View>
                  {COMPARE_ROWS.map((row) => (
                    <View key={row.label} style={styles.compareRow}>
                      <View style={[styles.rowLabel, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.rowLabelText, { color: colors.textRole.primary }]}>{row.label}</Text></View>
                      {options.map((option) => <ComparisonCell key={`${option.id}:${row.label}`} option={option} row={row} selected={option.id === selectedId} />)}
                    </View>
                  ))}
                  <View style={styles.compareRow}>
                    <View style={[styles.choiceRowLabel, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.rowLabelText, { color: colors.textRole.primary }]}>Your choice</Text></View>
                    {options.map((option) => <View key={`${option.id}:choice`} style={[styles.choiceCell, { borderColor: selectedId === option.id ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selectedId === option.id ? colors.surface.subtle : colors.surface.raised }]}>
                      {selectedId === option.id ? (
                        <View accessibilityRole="text" accessibilityLabel={`${option.name} is currently selected`} style={[styles.selectedBadge, { borderColor: colors.accentRole.action }]}>
                          <Text style={[styles.selectedText, { color: colors.accentRole.action }]}>Currently selected</Text>
                        </View>
                      ) : (
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel={selectedId ? `Choose ${option.name} instead of ${selected?.name}` : `Choose ${option.name}`} onPress={() => choose(option)} style={[styles.selectButton, { backgroundColor: colors.accentRole.action }]}>
                          <Text style={styles.selectText}>{selectedId ? `Choose ${option.name} instead` : `Choose ${option.name}`}</Text>
                        </TouchableOpacity>
                      )}
                    </View>)}
                  </View>
                </View>
              </ScrollView>
            </ScrollView>
          )}
          {replacing && pending && selected ? (
            <View accessibilityLiveRegion="polite" style={[styles.confirmation, { borderColor: colors.accentRole.action, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.confirmationText, { color: colors.textRole.primary }]}>Replace “{selected.name}” with “{pending.name}” in this route?</Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Confirm replacing ${selected.name} with ${pending.name}`} onPress={confirmReplacement} style={[styles.selectButton, { backgroundColor: colors.accentRole.action }]}>
                  <Text style={styles.selectText}>Replace with {pending.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" onPress={() => { setPendingChoiceId(null); setReplacing(false); }} style={[styles.replaceButton, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.replaceText, { color: colors.textRole.primary }]}>Keep current choice</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <View style={styles.footerActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => { setPendingChoiceId(null); setReplacing(false); }} style={[styles.closeAction, { borderColor: colors.borderRole.subtle }]}>
              <Text style={[styles.closeActionText, { color: colors.textRole.primary }]}>Keep comparing</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close comparison and keep the current choice" onPress={onClose} style={[styles.closeAction, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.closeActionText, { color: colors.textRole.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: "center", backgroundColor: "rgba(0,0,0,0.42)" },
  sheet: { width: "100%", borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  mobileSheet: { height: "100%", maxHeight: "100%", borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  desktopSheet: { width: "96%", maxWidth: 1080, maxHeight: "92%", borderRadius: Radius.xl },
  header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  titleBlock: { flex: 1, gap: 4 },
  eyebrow: { fontSize: 13, lineHeight: 19, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  title: { fontSize: 22, lineHeight: 29 },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  intro: { fontSize: 16, lineHeight: 24 },
  scrollArea: { flexGrow: 0, flexShrink: 1 },
  scrollContent: { paddingBottom: Spacing.sm },
  matrix: { paddingBottom: Spacing.sm },
  compareRow: { flexDirection: "row", alignItems: "stretch", gap: Spacing.xs, marginBottom: Spacing.xs },
  rowLabelCell: { width: 144 },
  labelHeader: { minHeight: 72, justifyContent: "center", padding: Spacing.sm },
  optionHeader: { borderWidth: 1, borderRadius: Radius.md, gap: Spacing.xs, alignItems: "flex-start" },
  rowHeaderText: { fontSize: 13, lineHeight: 19, fontWeight: "800", letterSpacing: 0.5 },
  columnTitle: { fontSize: 18, lineHeight: 25, fontWeight: "800" },
  rowLabel: { minHeight: 104, justifyContent: "flex-start", paddingVertical: Spacing.md, paddingRight: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth },
  rowLabelText: { fontSize: 16, lineHeight: 23, fontWeight: "700" },
  choiceRowLabel: { minHeight: 88, justifyContent: "center", paddingVertical: Spacing.md, paddingRight: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth },
  optionColumn: { minHeight: 104, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.xs },
  optionName: { fontSize: 19, lineHeight: 26 },
  optionMeta: { fontSize: 13, lineHeight: 19 },
  cellText: { fontSize: 16, lineHeight: 24 },
  linkAction: { minHeight: 40, justifyContent: "center", alignSelf: "flex-start" },
  linkText: { fontSize: 16, lineHeight: 23, fontWeight: "700", textDecorationLine: "underline" },
  choiceCell: { minHeight: 88, justifyContent: "center", borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
  selectedBadge: { minHeight: 44, justifyContent: "center", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.sm },
  selectedText: { fontSize: 16, lineHeight: 23, fontWeight: "800" },
  selectButton: { minHeight: 44, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  selectText: { color: "#fff", fontSize: 16, lineHeight: 23, fontWeight: "800", textAlign: "center" },
  replaceButton: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  replaceText: { fontSize: 16, lineHeight: 23, fontWeight: "700", textAlign: "center" },
  confirmation: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  confirmationText: { fontSize: 16, lineHeight: 24, fontWeight: "700" },
  confirmActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  footerActions: { flexDirection: "row", justifyContent: "flex-end", flexWrap: "wrap", gap: Spacing.sm },
  empty: { fontSize: 16, lineHeight: 24 },
  closeAction: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  closeActionText: { fontSize: 16, lineHeight: 23, fontWeight: "800" },
});
