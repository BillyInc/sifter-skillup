import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, useTheme, Spacing, FontSize, FontWeight, Radius } from "../../theme";
import type { CareerContextItem, CareerLearningResource, FoundationSkillEnriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { ContextSourceLinks } from "./ContextSourceLinks";
import { GuidanceReportButton } from "./GuidanceReportButton";
import { contextItemFor, isStudentApprovedContextItem, relationshipTargets as resolveRelationshipTargets } from "./contextRelations";
import { isStudentResource, studentItemLinkUrl } from "./resourceLinks";
import { ContextRelationshipChips, relationshipRecords } from "./ContextRelationshipSheet";
import { studentContextSections, studentFacingCopy, studentOutputCopy } from "../../lib/studentExplanation";

export interface FoundationSkillsBlockProps {
  skills: FoundationSkillEnriched[];
  resources?: CareerLearningResource[];
  contextItems?: CareerContextItem[];
  title?: string;
  learningFocus?: boolean;
  targetStudentId?: string;
  style?: ViewStyle;
}

function studentRelationshipTargets(item: CareerContextItem | undefined, type: "builds_on" | "works_with", contextItems?: CareerContextItem[]) {
  if (!item) return [];
  if (item.relationships !== undefined) {
    return item.relationships
      .filter((edge) => edge.relationshipStatus === "source_backed" && edge.relationshipType === type)
      .map((edge) => edge.toName || edge.toItemKey)
      .filter((name): name is string => Boolean(name));
  }
  return resolveRelationshipTargets(item, type, contextItems);
}

/** Shows only the explicit domain-owned learning sequence. Legacy prevalence
 * fields are audit data and must never become student foundation guidance. */
export function FoundationSkillsBlock({
  skills,
  resources,
  contextItems,
  title = "Common skills in this domain",
  learningFocus = false,
  targetStudentId,
  style,
}: FoundationSkillsBlockProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const reviewedSkills = [...(skills ?? [])]
    .filter((skill) => skill.stage && skill.stage !== "prepare_for_role")
    .filter((skill) => isStudentApprovedContextItem(contextItemFor(contextItems, "skill", skill.skill)))
    .filter((skill, index, values) => values.findIndex((candidate) => candidate.skill.trim().toLowerCase() === skill.skill.trim().toLowerCase()) === index);

  if (!reviewedSkills.length) return <View style={[styles.container, style]}>
    <SectionLabel>{title === "Common skills in this domain" ? "What to build first" : title}</SectionLabel>
    <View style={styles.emptyCard}>
      <Text style={[styles.note, { color: colors.textRole.muted }]}>These are the reviewed foundations currently available for this field. Open an item to see its explanation, connections and learning links.</Text>
    </View>
  </View>;

  const order = { start_here: 0, build_next: 1, choose_area: 2, prepare_for_role: 3 } as const;
  const rows = reviewedSkills.sort((a, b) => {
    return order[a.stage!] - order[b.stage!] || a.skill.localeCompare(b.skill);
  });
  const startHere = rows.filter((item) => item.stage === "start_here");
  const buildNext = rows.filter((item) => item.stage === "build_next");
  const chooseArea = rows.filter((item) => item.stage === "choose_area");

  const SkillRows = ({ items }: { items: FoundationSkillEnriched[] }) => (
    <View style={styles.rows}>
      {items.map((skill, index) => {
        const resource = resources?.find((item) =>
          (item.resourceType === "skill_learning" || item.resourceType === "skill_reference")
          && isStudentResource(item)
          && item.targetName.trim().toLowerCase() === skill.skill.trim().toLowerCase(),
        );
        const contextItem = contextItemFor(contextItems, "skill", skill.skill);
        const url = studentItemLinkUrl(contextItem, resource, skill.uri);
        const buildOn = studentRelationshipTargets(contextItem, "builds_on", contextItems);
        const worksWith = studentRelationshipTargets(contextItem, "works_with", contextItems);
        return (
          <View key={`${skill.skill}-${index}`} style={[styles.row, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
            <View style={styles.skillHeading}>
              <Feather name="check-circle" size={16} color={colors.accentRole.action} />
              <Text
                style={[styles.skill, { color: colors.textRole.secondary }]}
                numberOfLines={2}
              >
                {skill.skill}
              </Text>
              {learningFocus && contextItem ? <GuidanceReportButton
                targetStudentId={targetStudentId}
                selection={{
                  kind: "learningFocus",
                  id: `${contextItem.contextLevel}:${contextItem.contextKey}:skill:${contextItem.itemKey}`,
                  name: contextItem.name,
                  contextLevel: contextItem.contextLevel,
                  contextKey: contextItem.contextKey,
                  itemType: "skill",
                  itemKey: contextItem.itemKey,
                  domainId: contextItem.domainId,
                }}
              /> : null}
            </View>
            <Text style={[styles.note, { color: colors.textRole.muted }]}>
              What it is: {studentFacingCopy(contextItem?.plainMeaning || resource?.description || skill.priorityReason) || "This is one of the foundations for the field."}
            </Text>
            {contextItem?.contextualUse ? <Text style={[styles.note, { color: colors.textRole.secondary }]}>How it is used here: {studentFacingCopy(studentContextSections(contextItem.contextualUse).meaning)}</Text> : null}
            {contextItem?.expectedOutput ? <Text style={[styles.note, { color: colors.textRole.secondary }]}>What it helps you do: {studentOutputCopy(contextItem.expectedOutput, contextItem.contextualUse)}</Text> : null}
            {contextItem ? <ContextRelationshipChips itemName={contextItem.name} relationships={relationshipRecords(contextItem)} /> : null}
            {buildOn.length ? <Text style={[styles.note, { color: colors.textRole.muted }]}>What this builds on: {buildOn.join(" · ")}</Text> : null}
            {worksWith.length ? <Text style={[styles.note, { color: colors.textRole.muted }]}>What it works with: {worksWith.join(" · ")}</Text> : null}
            {skill.evidenceNote ? <Text style={[styles.note, { color: colors.textRole.muted }]}>Why it appears here: {studentFacingCopy(skill.evidenceNote)}</Text> : null}
            <ExternalLinkGuard url={url} label={`Learn about ${skill.skill}`} description={resource?.description || `This opens a verified learning or reference page for ${skill.skill}.`} textStyle={[styles.link, { color: colors.accentRole.action }]} />
            <ContextSourceLinks item={contextItem} resource={resource} />
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>{title === "Common skills in this domain" ? "What to build first" : title}</SectionLabel>
      <Text style={[styles.caption, { color: colors.textRole.muted }]}>
        Start with the suggested foundation, then add the other capabilities as your direction becomes clearer. This is guidance, not a checklist.
      </Text>
      {startHere.length ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Start here</Text><SkillRows items={startHere} /></View> : null}
      {buildNext.length && expanded ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Build next</Text><SkillRows items={buildNext} /></View> : null}
      {chooseArea.length && expanded ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Choose an area</Text><SkillRows items={chooseArea} /></View> : null}
      {buildNext.length || chooseArea.length ? (
        <TouchableOpacity
          onPress={() => setExpanded((value) => !value)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={styles.moreButton}
        >
          <Text style={[styles.moreText, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
            {expanded ? "Show fewer learning stages" : `See the full learning sequence`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default FoundationSkillsBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  skillHeading: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.45,
    marginTop: -Spacing.xs,
  },
  rows: { gap: Spacing.sm, marginTop: Spacing.xs },
  row: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  group: { gap: Spacing.xs },
  groupLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.8 },
  skill: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.sm * 1.35,
  },
  link: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textDecorationLine: "underline",
  },
  moreButton: {
    alignSelf: "flex-start",
    minHeight: 34,
    justifyContent: "center",
    paddingTop: Spacing.xs,
  },
  moreText: { fontSize: FontSize.sm },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  emptyCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB", borderRadius: Radius.md, padding: Spacing.md },
});
