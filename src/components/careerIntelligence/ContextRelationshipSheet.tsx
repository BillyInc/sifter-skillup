import React from "react";
import { Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItemRelationship, CareerContextItemPathTarget } from "@/types/career";
import type { LearningPlanRoute } from "@/lib/guidedLearningPlan";
import { learningPlanRelationshipScopeMatches } from "@/lib/guidedLearningPlan";

export type StudentRelationship = {
  type: CareerContextItemRelationship["relationshipType"] | CareerContextItemPathTarget["targetLevel"] | "requires" | "alternative_to";
  label: string;
  target: string;
  explanation?: string;
  status?: string;
  requirementLevel?: string;
  sequenceApproved?: boolean;
  sequencePolicy?: CareerContextItemRelationship["sequencePolicy"];
  sequenceCondition?: string;
  sequenceScope?: CareerContextItemRelationship["sequenceScope"];
  sourceReferences?: Array<{ title?: string; url: string }>;
};

export function relationshipLabel(type: StudentRelationship["type"]): string {
  if (type === "requires") return "Prerequisite";
  if (type === "alternative_to") return "Alternative";
  if (type === "builds_on") return "Builds on";
  if (type === "works_with") return "Works with";
  if (type === "complements") return "Complements";
  if (type === "alternative") return "Alternative";
  if (type === "qualifies_for") return "Qualification route";
  if (type === "supports") return "Supports";
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
      && edge.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url)))
    .map((edge) => ({
      type: edge.relationshipType,
      label: relationshipLabel(edge.relationshipType),
      target: edge.toName || edge.toItemKey || "Related item",
      explanation: edge.learnerExplanation!.trim(),
      status: edge.relationshipStatus,
      sequenceApproved: edge.sequenceApproved === true,
      sequencePolicy: edge.sequencePolicy,
      sequenceCondition: edge.sequenceCondition?.trim() || undefined,
      sequenceScope: edge.sequenceScope ?? undefined,
      sourceReferences: edge.sourceReferences?.map(({ title, url }) => ({ title, url })),
    }));
  const paths = (item.pathTargets ?? [])
    .filter((target) => target.relationshipStatus === "source_backed")
    .map((target) => ({
      type: target.targetLevel,
      label: target.targetLevel === "subgroup" ? "Supports area" : "Supports role",
      target: target.targetLabel,
      explanation: target.pathReason,
      status: target.relationshipStatus,
      requirementLevel: target.requirementLevel,
      sourceReferences: target.sourceReferences.map(({ title, url }) => ({ title, url })),
    }));
  return [...relationships, ...paths];
}

export function sequenceGuidanceText(itemName: string, relationship: StudentRelationship): string {
  if (relationship.sequenceApproved && relationship.sequencePolicy === "hard_prerequisite") {
    return `Approved order for this route: review ${relationship.target} before ${itemName}.`;
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "conditional_prerequisite") {
    return relationship.sequenceCondition
      ? `When this applies: ${relationship.sequenceCondition} This is conditional guidance, not a general requirement.`
      : "This order applies only under a reviewed route condition; it is not a general requirement.";
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "workflow") {
    return "Task order: follow this connection within the stated workflow; it is not a prerequisite for choosing this subject.";
  }
  if (relationship.sequenceApproved && relationship.sequencePolicy === "none") {
    return "No learning order is attached to this connection.";
  }
  return "This connection explains how the items relate; it does not set a required learning order.";
}

export function ContextRelationshipChips({
  itemName,
  relationships,
}: {
  itemName: string;
  relationships: StudentRelationship[];
}) {
  const { colors } = useTheme();
  const [open, setOpen] = React.useState(false);
  if (!relationships.length) return null;
  return (
    <>
      <View style={styles.chipRow} accessibilityLabel={`Source-backed relationships for ${itemName}`}>
        {relationships.map((relationship, index) => (
          <TouchableOpacity
            key={`${relationship.type}:${relationship.target}:${index}`}
            accessibilityRole="button"
            accessibilityLabel={`${relationship.label}: ${relationship.target}`}
            onPress={() => setOpen(true)}
            style={[styles.chip, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
          >
            <Text style={[styles.chipText, { color: colors.accentRole.action }]}>{relationship.label}</Text>
            <Text style={[styles.chipTarget, { color: colors.textRole.secondary }]} numberOfLines={1}>{relationship.target}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ContextRelationshipSheet itemName={itemName} relationships={relationships} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ContextRelationshipSheet({
  itemName,
  relationships,
  visible,
  onClose,
}: {
  itemName: string;
  relationships: StudentRelationship[];
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
          <Text style={[styles.intro, { color: colors.textRole.secondary }]}>These source-backed connections explain how learning items relate. Only an explicitly approved prerequisite sets learning order; other connections do not silently add requirements.</Text>
          <View style={styles.relationshipList}>
            {relationships.map((relationship, index) => (
              <View key={`${relationship.type}:${relationship.target}:${index}`} style={[styles.relationshipCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                <Text style={[styles.relationshipLabel, { color: colors.accentRole.action }]}>{relationship.label}</Text>
                <Text style={[styles.relationshipTarget, { color: colors.textRole.primary }]}>{relationship.target}</Text>
                {relationship.explanation ? (
                  <Text style={[styles.relationshipExplanation, { color: colors.textRole.secondary }]}>
                    {relationship.explanation}
                  </Text>
                ) : null}
                <Text style={[styles.relationshipMeta, { color: colors.textRole.secondary }]}>{sequenceGuidanceText(itemName, relationship)}</Text>
                {relationship.sourceReferences?.filter((reference) => /^https:\/\//i.test(reference.url)).map((reference, sourceIndex) => (
                  <TouchableOpacity
                    key={`${reference.url}:${sourceIndex}`}
                    accessibilityRole="link"
                    accessibilityLabel={`Open relationship evidence: ${reference.title || reference.url}`}
                    onPress={() => { void Linking.openURL(reference.url); }}
                  >
                    <Text style={[styles.relationshipSource, { color: colors.accentRole.action }]}>
                      Open evidence: {reference.title || "Source"}
                    </Text>
                  </TouchableOpacity>
                ))}
                {relationship.requirementLevel ? <Text style={[styles.relationshipMeta, { color: colors.textRole.muted }]}>Route place: {relationship.requirementLevel}</Text> : null}
                <Text style={[styles.relationshipMeta, { color: colors.textRole.muted }]}>{relationship.sequenceApproved && relationship.sequencePolicy === "hard_prerequisite" ? "Status: source-backed · approved prerequisite for this route." : "Status: source-backed connection · not an approved hard prerequisite."}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={onClose} style={[styles.closeAction, { backgroundColor: colors.accentRole.action }]}>
            <Text style={styles.closeActionText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginTop: Spacing.xs },
  chip: { minHeight: 34, maxWidth: "100%", flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 5 },
  chipText: { fontSize: FontSize.xs, fontWeight: "800" },
  chipTarget: { maxWidth: 160, fontSize: FontSize.xs },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.42)" },
  sheet: { maxHeight: "86%", borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  sheetHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  sheetTitleBlock: { flex: 1, gap: 4 },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  title: { fontSize: FontSize.lg },
  closeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  relationshipList: { gap: Spacing.sm },
  relationshipCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: 4 },
  relationshipLabel: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase" },
  relationshipTarget: { fontSize: FontSize.md, fontWeight: "700" },
  relationshipExplanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  relationshipSource: { fontSize: FontSize.xs, fontWeight: "700", textDecorationLine: "underline" },
  relationshipMeta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  closeAction: { minHeight: 44, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.lg },
  closeActionText: { color: "#fff", fontSize: FontSize.sm, fontWeight: "800" },
});
