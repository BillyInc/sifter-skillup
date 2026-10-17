import React from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItemRelationship, CareerContextItemPathTarget } from "@/types/career";
import type { LearningPlanRoute } from "@/lib/guidedLearningPlan";
import { learningPlanRelationshipScopeMatches } from "@/lib/guidedLearningPlan";
import { studentFacingCopy } from "@/lib/studentExplanation";

export type StudentRelationship = {
  type: CareerContextItemRelationship["relationshipType"] | CareerContextItemPathTarget["targetLevel"] | "requires" | "alternative_to";
  label: string;
  target: string;
  targetItemKey?: string;
  targetItemType?: CareerContextItemRelationship["toItemType"];
  targetRouteLevel?: CareerContextItemPathTarget["targetLevel"];
  targetRouteKey?: string;
  explanation?: string;
  status?: string;
  requirementLevel?: string;
  sequenceApproved?: boolean;
  sequencePolicy?: CareerContextItemRelationship["sequencePolicy"];
  sequenceCondition?: string;
  sequenceScope?: CareerContextItemRelationship["sequenceScope"];
  sourceReferences?: Array<{ title?: string; url: string }>;
};

function learnerRelationship(relationship: StudentRelationship): StudentRelationship {
  return {
    ...relationship,
    explanation: studentFacingCopy(relationship.explanation),
    sequenceCondition: studentFacingCopy(relationship.sequenceCondition) || undefined,
  };
}

export function relationshipLabel(
  type: StudentRelationship["type"],
  sequenceApproved = false,
  sequencePolicy?: StudentRelationship["sequencePolicy"],
): string {
  if (type === "alternative" || type === "alternative_to") return "Choose one";
  if (type === "complements" || type === "works_with") return "Useful alongside";
  if (type === "supports") return "Supports this task or route";
  if (sequenceApproved && sequencePolicy === "hard_prerequisite" && (type === "requires" || type === "builds_on")) return "Learn first";
  if (sequenceApproved && sequencePolicy === "conditional_prerequisite" && (type === "requires" || type === "builds_on")) return "Learn first if this applies";
  if (type === "requires") {
    return "Related learning";
  }
  if (type === "builds_on") return "Builds on";
  if (type === "qualifies_for") return "Qualification route";
  return "Downstream route";
}

export function relationshipRecords(item: {
  relationships?: CareerContextItemRelationship[];
  pathTargets?: CareerContextItemPathTarget[];
}, route?: LearningPlanRoute): StudentRelationship[] {
  const relationships = (item.relationships ?? [])
    .filter((edge) => edge.relationshipStatus === "source_backed"
      && (edge.toName || edge.toItemKey)
      && Boolean(edge.learnerExplanation?.trim())
      && learningPlanRelationshipScopeMatches(edge.sequenceScope ?? undefined, route)
      && (edge.reviewedContractRelationship === true
        || edge.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url))))
    .map((edge) => ({
      type: edge.relationshipType,
      label: relationshipLabel(edge.relationshipType, edge.sequenceApproved === true, edge.sequencePolicy),
      target: edge.toName || edge.toItemKey || "Related item",
      targetItemKey: edge.toItemKey ?? undefined,
      targetItemType: edge.toItemType ?? undefined,
      explanation: studentFacingCopy(edge.learnerExplanation!.trim()),
      status: edge.relationshipStatus,
      sequenceApproved: edge.sequenceApproved === true,
      sequencePolicy: edge.sequencePolicy,
      sequenceCondition: studentFacingCopy(edge.sequenceCondition?.trim()) || undefined,
      sequenceScope: edge.sequenceScope ?? undefined,
      sourceReferences: edge.sourceReferences?.map(({ title, url }) => ({ title, url })),
    }))
    .filter((relationship) => Boolean(relationship.explanation));
  const paths = (item.pathTargets ?? [])
    .filter((target) => target.relationshipStatus === "source_backed"
      && Boolean(target.pathReason?.trim())
      && target.sourceReferences.some((reference) => /^https:\/\//i.test(reference.url)))
    .map((target) => ({
      type: target.targetLevel,
      label: target.targetLevel === "subgroup" ? "Supports area" : "Supports role",
      target: target.targetLabel,
      targetRouteLevel: target.targetLevel,
      targetRouteKey: target.targetKey,
      explanation: studentFacingCopy(target.pathReason),
      status: target.relationshipStatus,
      requirementLevel: target.requirementLevel,
      sourceReferences: target.sourceReferences.map(({ title, url }) => ({ title, url })),
    }))
    .filter((relationship) => Boolean(relationship.explanation));
  return [...relationships, ...paths];
}

export function sequenceGuidanceText(itemName: string, relationship: StudentRelationship): string {
  if (relationship.type === "alternative" || relationship.type === "alternative_to") {
    return `These are different options for a similar task. Choose ${relationship.target} only if it fits your question; you do not need to learn both as steps.`;
  }
  if (relationship.type === "complements" || relationship.type === "works_with") {
    return `These can be useful together when the task needs both ${itemName} and ${relationship.target}. Adding one does not automatically add the other or make it compulsory.`;
  }
  if (relationship.type === "supports") {
    return `${itemName} can support work connected to ${relationship.target}. This link explains relevance; it does not by itself make either item required or set their order.`;
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "hard_prerequisite"
    && (relationship.type === "requires" || relationship.type === "builds_on")) {
    return `Learn ${relationship.target} first. It is needed before you work on ${itemName} in this route.`;
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "conditional_prerequisite"
    && (relationship.type === "requires" || relationship.type === "builds_on")) {
    if (relationship.sequenceCondition) {
      const condition = studentFacingCopy(relationship.sequenceCondition).trim().replace(/[.!?]+$/, "");
      const routeOnly = condition.match(/^only for\s+(.+)$/i);
      const whenOnly = condition.match(/^only when\s+(.+)$/i);
      const lead = routeOnly
        ? `When ${routeOnly[1]} is selected`
        : whenOnly
          ? `When ${whenOnly[1]}`
          : `If ${condition}`;
      return `${lead}, learn ${relationship.target} before ${itemName}. Otherwise, it is not a required first step.`;
    }
    return `Learn ${relationship.target} before ${itemName} only when the stated route condition applies; it is not a general requirement.`;
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "workflow") {
    return "For this task, follow the connected steps in the order shown. This is not a general requirement for the whole subject.";
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "none") {
    return "This connection does not set a learning order.";
  }
  if (relationship.type === "builds_on") {
    return `${relationship.target} can provide helpful background for ${itemName}. Learn it first only when the selected route marks it as a required or conditional prerequisite.`;
  }
  if (relationship.type === "requires") {
    return `These items are connected, but this link is not an enforced learning gate. It does not block your route unless the relationship is explicitly marked as a required first step.`;
  }
  if (relationship.type === "qualifies_for") {
    return `This describes a qualification connection to ${relationship.target}; it does not mean that choosing this learning item awards that qualification.`;
  }
  return `${itemName} has a supported connection to ${relationship.target}. This explains relevance, not a compulsory step or automatic selection.`;
}

function routeContributionText(level?: string): string | undefined {
  if (level === "needed" || level === "required") return "Needed for this direction";
  if (level === "conditional") return "Useful when the stated situation applies";
  if (level === "useful") return "Useful for this direction";
  if (level === "optional") return "An optional connection";
  return undefined;
}

export function ContextRelationshipChips({
  itemName,
  relationships,
  onOpenTarget,
}: {
  itemName: string;
  relationships: StudentRelationship[];
  onOpenTarget?: (relationship: StudentRelationship) => boolean | void;
}) {
  const { colors } = useTheme();
  const [activeRelationship, setActiveRelationship] = React.useState<StudentRelationship | null>(null);
  const learnerRelationships = relationships.map(learnerRelationship).filter((relationship) => Boolean(relationship.explanation));
  if (!learnerRelationships.length) return null;
  return (
    <>
      <View style={styles.chipRow} accessibilityLabel={`Reviewed relationships for ${itemName}`}>
        {learnerRelationships.map((relationship, index) => (
          <TouchableOpacity
            key={`${relationship.type}:${relationship.target}:${index}`}
            accessibilityRole="button"
            accessibilityLabel={`${relationship.label}: ${relationship.target}`}
            accessibilityState={{ expanded: activeRelationship === relationship }}
            onPress={() => setActiveRelationship(relationship)}
            style={[styles.chip, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
          >
            <Text style={[styles.chipText, { color: colors.accentRole.action }]}>{relationship.label}</Text>
            <Text style={[styles.chipTarget, { color: colors.textRole.secondary }]} numberOfLines={1}>{relationship.target}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ContextRelationshipSheet
        itemName={itemName}
        relationships={learnerRelationships}
        initialRelationship={activeRelationship ?? undefined}
        visible={Boolean(activeRelationship)}
        onOpenTarget={onOpenTarget}
        onClose={() => setActiveRelationship(null)}
      />
    </>
  );
}

export function ContextRelationshipSheet({
  itemName,
  relationships,
  initialRelationship,
  visible,
  onClose,
  onOpenTarget,
}: {
  itemName: string;
  relationships: StudentRelationship[];
  initialRelationship?: StudentRelationship;
  visible: boolean;
  onClose: () => void;
  onOpenTarget?: (relationship: StudentRelationship) => boolean | void;
}) {
  const { colors } = useTheme();
  const [targetOpen, setTargetOpen] = React.useState(false);
  const learnerRelationships = relationships.map(learnerRelationship).filter((relationship) => Boolean(relationship.explanation));
  const learnerInitialRelationship = initialRelationship ? learnerRelationship(initialRelationship) : undefined;
  const [focusedRelationship, setFocusedRelationship] = React.useState<StudentRelationship | undefined>(learnerInitialRelationship);
  React.useEffect(() => {
    setTargetOpen(false);
    setFocusedRelationship(learnerInitialRelationship);
  }, [initialRelationship, visible]);
  const activeRelationship = focusedRelationship ?? learnerInitialRelationship ?? learnerRelationships[0];

  const openTarget = (relationship: StudentRelationship) => {
    if (onOpenTarget) {
      const handled = onOpenTarget(relationship);
      if (handled !== false) {
        onClose();
        return;
      }
    }
    setFocusedRelationship(relationship);
    setTargetOpen(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => {
      if (targetOpen) {
        setTargetOpen(false);
        setFocusedRelationship(initialRelationship);
      } else onClose();
    }}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>How the connection works</Text>
              <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>{itemName}</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close relationship details" onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textRole.muted} />
            </TouchableOpacity>
          </View>
          {targetOpen && activeRelationship ? (
            <View accessibilityViewIsModal style={[styles.targetPanel, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.relationshipLabel, { color: colors.accentRole.action }]}>Related {activeRelationship.targetRouteLevel === "subgroup" ? "area" : activeRelationship.targetRouteLevel ?? (activeRelationship.targetItemType ? "learning item" : "route")}</Text>
              <Text accessibilityRole="header" style={[styles.relationshipTarget, { color: colors.textRole.primary }]}>{activeRelationship.target}</Text>
              {activeRelationship.explanation ? <View style={styles.detailSection}>
                <Text style={[styles.detailHeading, { color: colors.textRole.primary }]}>Why it connects</Text>
                <Text style={[styles.relationshipExplanation, { color: colors.textRole.secondary }]}>{activeRelationship.explanation}</Text>
              </View> : null}
              <View style={styles.detailSection}>
                <Text style={[styles.detailHeading, { color: colors.textRole.primary }]}>What this means for your learning</Text>
                <Text style={[styles.relationshipMeta, { color: colors.textRole.secondary }]}>{sequenceGuidanceText(itemName, activeRelationship)}</Text>
              </View>
              {activeRelationship.targetItemType ? <Text style={[styles.relationshipMeta, { color: colors.textRole.muted }]}>{activeRelationship.targetItemType[0].toUpperCase() + activeRelationship.targetItemType.slice(1)} · related learning item</Text> : null}
              {activeRelationship.targetRouteLevel ? <Text style={[styles.relationshipMeta, { color: colors.textRole.muted }]}>{routeContributionText(activeRelationship.requirementLevel) ?? "A supported route option"}</Text> : null}
              {activeRelationship.sourceReferences?.filter((reference) => /^https:\/\//i.test(reference.url)).map((reference, sourceIndex) => (
                <TouchableOpacity key={`${reference.url}:${sourceIndex}`} accessibilityRole="link" accessibilityLabel={`Open relationship evidence: ${reference.title || reference.url}`} onPress={() => { void Linking.openURL(reference.url); }}>
                  <Text style={[styles.relationshipSource, { color: colors.accentRole.action }]}>Open evidence: {reference.title || "Source"}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.sheetActions}>
                <TouchableOpacity accessibilityRole="button" onPress={() => { setTargetOpen(false); setFocusedRelationship(initialRelationship); }} style={[styles.secondaryAction, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.secondaryActionText, { color: colors.textRole.primary }]}>Back to connection</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Return to ${itemName}`} onPress={onClose} style={[styles.closeAction, { backgroundColor: colors.accentRole.action }]}>
                  <Text style={styles.closeActionText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.intro, { color: colors.textRole.secondary }]}>This connection is about how {itemName} relates to another item or route. Opening the target does not add it to your plan.</Text>
              <ScrollView style={styles.relationshipScroll} contentContainerStyle={styles.relationshipList}>
                {learnerRelationships.map((relationship, index) => (
                  <View key={`${relationship.type}:${relationship.target}:${index}`} style={[styles.relationshipCard, { borderColor: relationship === activeRelationship ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                    <Text style={[styles.relationshipLabel, { color: colors.accentRole.action }]}>{relationship.label}</Text>
                    <Text style={[styles.relationshipTarget, { color: colors.textRole.primary }]}>{relationship.target}</Text>
                    {relationship.explanation ? <Text style={[styles.relationshipExplanation, { color: colors.textRole.secondary }]}>{relationship.explanation}</Text> : null}
                    <Text style={[styles.relationshipMeta, { color: colors.textRole.secondary }]}>{sequenceGuidanceText(itemName, relationship)}</Text>
                    {routeContributionText(relationship.requirementLevel) ? <Text style={[styles.relationshipMeta, { color: colors.textRole.muted }]}>{routeContributionText(relationship.requirementLevel)}</Text> : null}
                    {relationship.sourceReferences?.filter((reference) => /^https:\/\//i.test(reference.url)).map((reference, sourceIndex) => (
                      <TouchableOpacity key={`${reference.url}:${sourceIndex}`} accessibilityRole="link" accessibilityLabel={`Open relationship evidence: ${reference.title || reference.url}`} onPress={() => { void Linking.openURL(reference.url); }}>
                        <Text style={[styles.relationshipSource, { color: colors.accentRole.action }]}>Open evidence: {reference.title || "Source"}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open target ${relationship.target}`} onPress={() => openTarget(relationship)} style={[styles.openTarget, { borderColor: colors.accentRole.action }]}>
                      <Text style={[styles.openTargetText, { color: colors.accentRole.action }]}>Open target</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Return to ${itemName}`} onPress={onClose} style={[styles.closeAction, { backgroundColor: colors.accentRole.action }]}>
                <Text style={styles.closeActionText}>Back to {itemName}</Text>
              </TouchableOpacity>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginTop: Spacing.xs },
  chip: { minHeight: 34, maxWidth: "100%", flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  chipText: { fontSize: 13, lineHeight: 18, fontWeight: "800" },
  chipTarget: { maxWidth: 180, fontSize: 14, lineHeight: 20 },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.42)" },
  sheet: { maxHeight: "86%", borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  sheetTitleBlock: { flex: 1, gap: 4 },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  title: { fontSize: 20, lineHeight: 27 },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  intro: { fontSize: 16, lineHeight: 24 },
  relationshipScroll: { flexShrink: 1, maxHeight: "58%" },
  relationshipList: { gap: Spacing.sm, paddingBottom: Spacing.xs },
  relationshipCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: 4 },
  relationshipLabel: { fontSize: 13, lineHeight: 19, fontWeight: "800", textTransform: "uppercase" },
  relationshipTarget: { fontSize: 18, lineHeight: 25, fontWeight: "700" },
  relationshipExplanation: { fontSize: 16, lineHeight: 24 },
  relationshipSource: { fontSize: 16, lineHeight: 23, fontWeight: "700", textDecorationLine: "underline" },
  relationshipMeta: { fontSize: 16, lineHeight: 24 },
  targetPanel: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
  detailSection: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(128,128,128,0.35)", paddingTop: Spacing.sm, gap: Spacing.xs },
  detailHeading: { fontSize: 18, lineHeight: 25, fontWeight: "700" },
  openTarget: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, marginTop: Spacing.xs },
  openTargetText: { fontSize: 16, lineHeight: 22, fontWeight: "700" },
  sheetActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  secondaryAction: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md },
  secondaryActionText: { fontSize: 15, lineHeight: 21, fontWeight: "700" },
  closeAction: { minHeight: 44, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.lg },
  closeActionText: { color: "#fff", fontSize: 16, lineHeight: 22, fontWeight: "800" },
});
