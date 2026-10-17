import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
  useReducedMotion,
  useTheme,
} from "../../theme";
import type {
  LearningPlanCandidate,
  LearningPlanLayer,
  LearningPlanLayerChoices,
  LearningPlanRoute,
  LearningPlanStack,
  LearningPlanStackSet,
} from "../../lib/guidedLearningPlan";
import { learningPlanRelationshipScopeMatches, learningPlanRouteKey } from "../../lib/guidedLearningPlan";
import { studentContextSections, studentFacingCopy, studentGeographicContext, studentItemLimitations, studentOutputCopy, studentReasonCopy, studentResourceRationale } from "../../lib/studentExplanation";
import { AlternativeComparisonSheet } from "./AlternativeComparisonSheet";
import { ContextRelationshipChips, relationshipLabel, type StudentRelationship } from "./ContextRelationshipSheet";

export type GuidedLearningTrayMode = "icon" | "compact" | "mid" | "full";

export interface GuidedLearningTrayRouteLabels {
  programme?: string;
  domain?: string;
  area?: string;
  role?: string;
}

export interface GuidedLearningTrayProps {
  stackSet: LearningPlanStackSet;
  initialMode?: GuidedLearningTrayMode;
  /** A stable item id or selection count. Change it whenever an item is added. */
  dropKey?: string | number;
  pendingDropLabel?: string | null;
  routeLabels?: Record<string, GuidedLearningTrayRouteLabels>;
  /** Area names may be shown as advisory options before an area is selected. */
  advisoryAreaLabels?: Record<string, string[]>;
  onModeChange?: (mode: GuidedLearningTrayMode) => void;
  onRemove?: (routeKey: string, itemId: string) => void;
  onReorder?: (routeKey: string, itemId: string, beforeId?: string) => void;
  onSelectCandidate?: (routeKey: string, candidate: LearningPlanCandidate) => void;
  onSelectAlternative?: (routeKey: string, group: string, candidate: LearningPlanCandidate) => void;
  onSave?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  style?: ViewStyle;
}

const MODE_LABELS: Record<GuidedLearningTrayMode, string> = {
  icon: "Icon",
  compact: "Small",
  mid: "Mid",
  full: "Full",
};

const LAYER_LABELS: Record<LearningPlanLayer, string> = {
  programme: "Programme",
  domain: "Domain learning",
  area: "Area of specialization",
  role: "Role route",
};

const ITEM_TYPE_LABELS: Record<NonNullable<LearningPlanCandidate["itemType"]>, string> = {
  skill: "Skill",
  tool: "Tool",
  competency: "Competency",
  certification: "Certification or qualification",
  method: "Method",
  knowledge: "Knowledge",
  resource: "Learning resource",
};

function routeLabel(route: LearningPlanRoute, labels?: GuidedLearningTrayRouteLabels): string {
  return [labels?.programme || route.programmeId, labels?.domain || route.domainId, labels?.area || route.areaId, labels?.role || route.roleId]
    .filter(Boolean)
    .join("  ·  ") || "Selected route";
}

function stackItems(stack: LearningPlanStack): LearningPlanCandidate[] {
  const groups = [
    stack.fixedProgramme,
    stack.sharedFoundation,
    stack.usefulEdges,
    stack.areaAdditions,
    stack.roleAdditions,
    stack.complements,
  ];
  const byId = new Map(groups.flat().map((item) => [item.id, item]));
  const fixed = stack.fixedProgramme.filter((item) => byId.has(item.id));
  const selected = stack.selectedIds
    .map((id) => byId.get(id))
    .filter((item): item is LearningPlanCandidate => Boolean(item));
  const seen = new Set<string>();
  return [...fixed, ...selected].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function isRemovable(stack: LearningPlanStack, item: LearningPlanCandidate): boolean {
  return !stack.fixedProgramme.some((fixed) => fixed.id === item.id);
}

function studentRelationships(item: LearningPlanCandidate, route: LearningPlanRoute): StudentRelationship[] {
  return (item.relationships ?? [])
    .filter((relationship) => relationship.status === "source_backed"
      && Boolean(relationship.explanation?.trim())
      && learningPlanRelationshipScopeMatches(relationship.sequenceScope, route))
    .map((relationship) => ({
      type: relationship.type,
      label: relationshipLabel(relationship.type, relationship.sequenceApproved === true, relationship.sequencePolicy),
      target: relationship.targetName || relationship.targetId,
      explanation: relationship.explanation,
      status: relationship.status,
      sequenceApproved: relationship.sequenceApproved,
      sequencePolicy: relationship.sequencePolicy,
      sequenceCondition: relationship.sequenceCondition,
      sequenceScope: relationship.sequenceScope,
      sourceReferences: relationship.sourceReferences?.filter((reference) => /^https:\/\//i.test(reference.url)),
    }));
}

function layerChoiceTitle(choice: LearningPlanLayerChoices): string {
  return LAYER_LABELS[choice.layer];
}

function candidatePlacementLabel(candidate: LearningPlanCandidate): string {
  if (candidate.category === "useful_edge") return "Optional useful edge";
  if (candidate.category === "alternative") return "Alternative choice";
  if (candidate.category === "conditional") return "Use when it fits the task";
  if (candidate.category === "shared_foundation") return "Compulsory domain foundation";
  if (candidate.category === "area_addition") return "Compulsory area addition";
  if (candidate.category === "role_addition") return "Compulsory role addition";
  return "Route option";
}

function sourceLocatorLabel(locator: Record<string, unknown>): string | undefined {
  const label = [locator.locator, locator.section, locator.page, locator.pages, locator.chapter, locator.table, locator.row]
    .filter((value) => typeof value === "string" || typeof value === "number")
    .map(String)
    .filter(Boolean)
    .join(" · ");
  return label || undefined;
}

function LearningItemDetails({ item, route }: { item: LearningPlanCandidate; route: LearningPlanRoute }) {
  const { colors } = useTheme();
  const type = item.itemType ? ITEM_TYPE_LABELS[item.itemType] : undefined;
  const sameCopy = (left?: string | null, right?: string | null) =>
    Boolean(left?.trim() && right?.trim() && left.trim().replace(/\s+/g, " ").toLocaleLowerCase() === right.trim().replace(/\s+/g, " ").toLocaleLowerCase());
  const baseRequirementCopy = studentReasonCopy(item.requirementReason) || (item.requirementLevel === "needed"
    ? "This item is part of the recommended learning for the selected route. The explanation below shows the work it supports; it does not mean every learner in the wider field needs the same preparation."
    : "This item can help with particular work or interests on this route, but it is not a compulsory step. You can continue along the main learning path without choosing it.");
  const requirementCopy = item.requirementLevel === "needed"
    ? baseRequirementCopy
    : `${baseRequirementCopy} If it fits the direction you want to pursue, you can add it alongside the compulsory learning for an additional advantage. It does not replace or block the main path.`;
  const useSections = studentContextSections(item.contextualUse);
  const meaning = studentFacingCopy(item.plainMeaning || item.explanation)
    || "A plain-language explanation has not been provided for this item yet.";
  const explanationCopy = studentFacingCopy(item.explanation);
  const baseMeaning = studentFacingCopy(item.plainMeaning);
  const routeUseMeaning = studentFacingCopy(useSections.meaning);
  const explanationRepeatsSeparatedCopy = Boolean(baseMeaning && routeUseMeaning
    && sameCopy(explanationCopy, `${baseMeaning} ${routeUseMeaning}`));
  const distinctExtraExplanation = explanationCopy
    && !sameCopy(explanationCopy, item.plainMeaning)
    && !sameCopy(explanationCopy, useSections.meaning)
    && !explanationRepeatsSeparatedCopy
    ? explanationCopy
    : "";
  const resourceLinks = item.learningLinks?.length
    ? item.learningLinks
    : item.linkUrl ? [{ title: item.linkTitle || `Learning resource for ${item.name}`, url: item.linkUrl, rationale: item.linkRationale, access: item.linkAccess, kind: item.linkKind }] : [];
  const section = (title: string, body?: string | null) => {
    const learnerCopy = studentFacingCopy(body);
    return learnerCopy ? <View key={title} style={[styles.explanationSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
    <Text accessibilityRole="header" style={[styles.explanationHeading, { color: colors.textRole.primary }]}>{title}</Text>
    <Text style={[styles.detailText, { color: colors.textRole.secondary }]}>{learnerCopy}</Text>
  </View> : null;
  };
  return <View style={styles.detailPanel}>
    {type ? <Text style={[styles.detailMeta, { color: colors.textRole.muted }]}>{type}{item.themeLabel ? ` · ${item.themeLabel}` : ""}</Text> : null}
    {item.requirementLevel ? section(item.requirementLevel === "needed" ? "Why this is part of the route" : "Why this optional item may help", requirementCopy) : null}
    {item.category === "alternative" ? section("How this choice works", "This is an alternative in a choose-one group. Select it instead of another option in the group; the alternatives are not a set of items you must all learn.") : null}
    {section("What it is", meaning)}
    {item.plainMeaning ? section("A little more context", distinctExtraExplanation) : null}
    {section("How it connects to your programme", item.programmeContext)}
    {section("What it means in this domain", item.domainContext)}
    {section("What it adds in this area", item.areaContext)}
    {!sameCopy(item.roleContext, item.contextualUse) ? section("How it applies to this role", item.roleContext) : null}
    {section("How it is used in this route", useSections.meaning || "A description of how this item is used on this route has not been provided yet.")}
    {section("Example of the work", useSections.task)}
    {item.geographicScope ? section("Evidence context", studentGeographicContext(item.geographicScope)) : null}
    {section("What to keep in mind", useSections.guardrail)}
    {section("What you may produce", studentOutputCopy(item.expectedOutput, item.contextualUse))}
    {item.prerequisiteNames?.length ? section("Learn or review first", item.prerequisiteNames.join(", ")) : null}
    {section("What it cannot prove or replace", studentItemLimitations(item.limitations).join("\n\n"))}
    {item.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url)) ? <View style={styles.sourceEvidence}>
      <Text style={[styles.detailText, styles.detailLabel, { color: colors.textRole.secondary }]}>Evidence for this item</Text>
      {item.sourceReferences.filter((reference) => /^https:\/\//i.test(reference.url)).map((reference, index) => {
        const locator = item.sourceLocators?.find((candidate) => candidate.sourceId === reference.id);
        const locatorLabel = locator ? sourceLocatorLabel(locator) : undefined;
        const title = reference.title || "Supporting source";
        return <View key={`${reference.url}-${index}`}>
          <TouchableOpacity accessibilityRole="link" accessibilityLabel={`Open evidence source ${title}`} onPress={() => void Linking.openURL(reference.url)} style={styles.resourceLink}>
            <Feather name="external-link" size={14} color={colors.accentRole.action} />
            <Text style={[styles.resourceLinkText, { color: colors.accentRole.action }]}>{title}</Text>
          </TouchableOpacity>
          {locatorLabel ? <Text style={[styles.detailText, { color: colors.textRole.muted }]}>Where to look: {locatorLabel}</Text> : null}
        </View>;
      })}
    </View> : null}
    {resourceLinks.length ? <View style={styles.resourceEvidence}>
      <Text accessibilityRole="header" style={[styles.explanationHeading, { color: colors.textRole.primary }]}>Learning and reference links</Text>
      {resourceLinks.map((link, index) => <View key={`${link.url}:${index}`} style={[styles.explanationSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <TouchableOpacity accessibilityRole="link" accessibilityLabel={`Open ${link.title}`} onPress={() => { if (/^https:\/\//i.test(link.url)) void Linking.openURL(link.url); }} style={styles.resourceLink}>
          <Feather name="external-link" size={14} color={colors.accentRole.action} />
          <Text style={[styles.resourceLinkText, { color: colors.accentRole.action }]}>{link.title}</Text>
        </TouchableOpacity>
        <View style={styles.resourceWhy}>
          <Text style={[styles.detailLabel, { color: colors.textRole.primary }]}>Why this resource is attached</Text>
          <Text style={[styles.detailText, { color: colors.textRole.secondary }]}>{studentResourceRationale(link.rationale, item.name, item.contextualUse, link.locator)}</Text>
        </View>
        {link.locator ? <Text style={[styles.detailMeta, { color: colors.textRole.muted }]}>Start at: {link.locator}</Text> : null}
        {link.kind || link.access ? <Text style={[styles.detailMeta, { color: colors.textRole.muted }]}>{[link.kind, link.access].filter(Boolean).join(" · ")}</Text> : null}
      </View>)}
    </View> : null}
    <ContextRelationshipChips itemName={item.name} relationships={studentRelationships(item, route)} />
  </View>;
}

function RouteLayers({
  stack,
  routeKey,
  onRemove,
  onReorder,
  onSelectCandidate,
  advisoryAreaLabels,
  onSelectAlternative,
}: {
  stack: LearningPlanStack;
  routeKey: string;
  onRemove?: (routeKey: string, itemId: string) => void;
  onReorder?: (routeKey: string, itemId: string, beforeId?: string) => void;
  onSelectCandidate?: (routeKey: string, candidate: LearningPlanCandidate) => void;
  advisoryAreaLabels?: string[];
  onSelectAlternative?: (routeKey: string, group: string, candidate: LearningPlanCandidate) => void;
}) {
  const { colors } = useTheme();
  const [comparison, setComparison] = useState<{ group: string; options: LearningPlanCandidate[]; selectedId?: string } | null>(null);
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const items = stackItems(stack);
  const choices = stack.layerChoices;
  const selectedIds = new Set(stack.selectedIds);
  const fixedProgrammeIds = new Set(stack.fixedProgramme.map((item) => item.id));
  const programmeContextItems = items.filter((item) => fixedProgrammeIds.has(item.id));
  const selectedItems = items.filter((item) => !fixedProgrammeIds.has(item.id));
  const compulsoryItems = selectedItems.filter((item) => item.requirementLevel === "needed");
  const optionalItems = selectedItems.filter((item) => item.requirementLevel !== "needed");
  const availableItems = stack.selectableItems.filter((candidate) => !selectedIds.has(candidate.id) && !candidate.alternativeGroup);
  const renderSelectedItem = (item: LearningPlanCandidate, laneItems: LearningPlanCandidate[], index: number, lane: "context" | "compulsory" | "optional") => {
    const laneIndex = laneItems.findIndex((candidate) => candidate.id === item.id);
    const previousId = laneIndex > 0 ? laneItems[laneIndex - 1].id : undefined;
    const nextId = laneIndex >= 0 && laneIndex < laneItems.length - 1 ? laneItems[laneIndex + 1].id : undefined;
    const afterNextId = laneIndex >= 0 && laneIndex < laneItems.length - 2 ? laneItems[laneIndex + 2].id : undefined;
    return <View key={item.id} style={styles.selectedItem}>
      <View style={[styles.itemRow, { borderBottomColor: colors.borderRole.subtle }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: expandedCandidateId === item.id }}
          accessibilityLabel={`${expandedCandidateId === item.id ? "Hide" : "Show"} explanation for ${item.name}`}
          onPress={() => setExpandedCandidateId(expandedCandidateId === item.id ? null : item.id)}
          style={styles.itemCopy}
        >
          <Text style={[styles.itemLayer, { color: colors.textRole.muted }]}>{lane === "context"
            ? `${LAYER_LABELS[item.layer]} · programme context`
            : lane === "compulsory"
              ? `Required step ${index + 1} · ${LAYER_LABELS[item.layer]} · ${candidatePlacementLabel(item)}`
              : `Optional choice · ${LAYER_LABELS[item.layer]} · ${candidatePlacementLabel(item)}`}</Text>
          <Text style={[styles.itemName, { color: colors.textRole.primary }]}>{item.name}</Text>
        </TouchableOpacity>
        {(onRemove || onReorder) && isRemovable(stack, item) ? (
          <View style={styles.itemActions}>
            {onReorder ? <>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Move ${item.name} earlier in this plan`}
                disabled={!previousId}
                onPress={() => onReorder(routeKey, item.id, previousId)}
                style={styles.reorderButton}
              >
                <Feather name="arrow-up" size={14} color={previousId ? colors.accentRole.action : colors.textRole.muted} />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Move ${item.name} later in this plan`}
                disabled={!nextId}
                onPress={() => onReorder(routeKey, item.id, afterNextId)}
                style={styles.reorderButton}
              >
                <Feather name="arrow-down" size={14} color={nextId ? colors.accentRole.action : colors.textRole.muted} />
              </TouchableOpacity>
            </> : null}
            {onRemove ? <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name} from this plan`}
              onPress={() => onRemove(routeKey, item.id)}
              style={styles.removeButton}
            >
              <Feather name="x" size={16} color={colors.textRole.muted} />
            </TouchableOpacity> : null}
          </View>
        ) : null}
      </View>
      {expandedCandidateId === item.id ? <View style={styles.selectedDetails}>
        <LearningItemDetails item={item} route={stack.route} />
      </View> : null}
    </View>;
  };
  return (
    <View style={styles.routeBody}>
      {programmeContextItems.length ? <View style={styles.selectedLane}>
        <Text style={[styles.choiceTitle, { color: colors.textRole.primary }]}>Programme learning already covered</Text>
        <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>This is the programme context carried into your plan; it is not an extra domain, area or role requirement.</Text>
        {programmeContextItems.map((item, index) => renderSelectedItem(item, programmeContextItems, index, "context"))}
      </View> : null}
      {compulsoryItems.length ? <View style={styles.selectedLane}>
        <Text style={[styles.choiceTitle, { color: colors.textRole.primary }]}>Compulsory learning path</Text>
        <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>These selected items are marked as needed for this route. Their order follows supported learning dependencies; items at the same level are not automatically prerequisites for one another.</Text>
        {compulsoryItems.map((item, index) => renderSelectedItem(item, compulsoryItems, index, "compulsory"))}
      </View> : null}
      {optionalItems.length ? <View style={[styles.selectedLane, styles.optionalLane, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <Text style={[styles.choiceTitle, { color: colors.textRole.primary }]}>Optional useful edges you chose</Text>
        <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>These can give you additional preparation for particular tasks or directions. They sit alongside—not inside—the compulsory path. You may skip or remove them and still continue; any order shown here is only for supported links among these optional choices.</Text>
        {optionalItems.map((item, index) => renderSelectedItem(item, optionalItems, index, "optional"))}
      </View> : null}
      {choices.map((choice) => (
        <View key={choice.layer} style={[styles.choiceBox, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.choiceTitle, { color: colors.textRole.primary }]}>{layerChoiceTitle(choice)}</Text>
          {choice.alternatives.map((alternative) => (
            <View key={alternative.group} style={styles.choiceGroup}>
              <Text style={[styles.choiceLabel, { color: colors.textRole.muted }]}>Choose one when you are ready · {alternative.group}</Text>
              <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>
                {alternative.options.map((option) => `${option.name}${option.id === alternative.selectedId ? " (selected)" : ""}`).join("  /  ")}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Compare ${alternative.group} options`}
                onPress={() => setComparison({ group: alternative.group, options: alternative.options, selectedId: alternative.selectedId })}
                style={styles.compareLink}
              >
                <Text style={[styles.compareLinkText, { color: colors.accentRole.action }]}>Compare options</Text>
              </TouchableOpacity>
            </View>
          ))}
          {choice.complements.length ? (
            <View style={styles.choiceGroup}>
              <Text style={[styles.choiceLabel, { color: colors.textRole.muted }]}>Complements selected at this layer</Text>
              <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>{choice.complements.map((item) => item.name).join("  ·  ")}</Text>
            </View>
          ) : null}
        </View>
      ))}
      {availableItems.length ? (
        <View style={[styles.availableBox, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.choiceTitle, { color: colors.textRole.primary }]}>Choose learning focus</Text>
          <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>Select only the items you want included in this route. Open an item to see what it helps you do and how it connects.</Text>
          {availableItems.map((candidate) => {
            const expanded = expandedCandidateId === candidate.id;
            return <View key={candidate.id} style={[styles.availableItem, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                accessibilityLabel={`${expanded ? "Hide" : "Show"} explanation for ${candidate.name}`}
                onPress={() => setExpandedCandidateId(expanded ? null : candidate.id)}
                style={styles.availableHeader}
              >
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemLayer, { color: colors.textRole.muted }]}>{LAYER_LABELS[candidate.layer]} · {candidatePlacementLabel(candidate)}</Text>
                  <Text style={[styles.itemName, { color: colors.textRole.primary }]}>{candidate.name}</Text>
                </View>
                <Feather name={expanded ? "chevron-up" : "chevron-down"} size={17} color={colors.textRole.muted} />
              </TouchableOpacity>
              {expanded ? <View style={styles.availableDetails}>
                <LearningItemDetails item={candidate} route={stack.route} />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Add ${candidate.name} to this learning plan`}
                  onPress={() => onSelectCandidate?.(routeKey, candidate)}
                  style={[styles.addButton, { borderColor: colors.accentRole.action }]}
                >
                  <Feather name="plus" size={15} color={colors.accentRole.action} />
                  <Text style={[styles.actionText, { color: colors.accentRole.action }]}>Add to this route</Text>
                </TouchableOpacity>
              </View> : null}
            </View>;
          })}
        </View>
      ) : null}
      {(stack.advisoryAreas.length || advisoryAreaLabels?.length) ? <View style={[styles.advisoryBox, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.choiceTitle, { color: colors.textRole.primary }]}>Areas to explore next</Text>
        <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>These are advisory options, not selected requirements. Choose an area before its learning items are added to your plan.</Text>
        <Text style={[styles.choiceText, { color: colors.textRole.muted }]}>{[...stack.advisoryAreas.map((item) => item.name), ...(advisoryAreaLabels ?? [])].filter((value, index, values) => values.indexOf(value) === index).join("  ·  ")}</Text>
      </View> : null}
      {!items.length && !choices.length && !availableItems.length && !stack.advisoryAreas.length && !advisoryAreaLabels?.length ? (
        <Text style={[styles.emptyText, { color: colors.textRole.muted }]}>Nothing selected on this route yet.</Text>
      ) : null}
      {comparison ? <AlternativeComparisonSheet
        group={comparison.group}
        options={comparison.options}
        selectedId={comparison.selectedId}
        visible
        onClose={() => setComparison(null)}
        onSelect={(candidate) => {
          onSelectAlternative?.(routeKey, comparison.group, candidate);
          setComparison(null);
        }}
      /> : null}
    </View>
  );
}

export function GuidedLearningTray({
  stackSet,
  initialMode = "compact",
  dropKey,
  pendingDropLabel,
  routeLabels,
  advisoryAreaLabels,
  onModeChange,
  onRemove,
  onReorder,
  onSelectCandidate,
  onSelectAlternative,
  onSave,
  onPrint,
  onShare,
  style,
}: GuidedLearningTrayProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = useState<GuidedLearningTrayMode>(initialMode);
  const previousDropKey = useRef(dropKey);
  const dropProgress = useRef(new Animated.Value(1)).current;
  const dropOpacity = useRef(new Animated.Value(0)).current;
  const totalSelected = useMemo(() => stackSet.stacks.reduce((sum, stack) => sum + stack.selectedIds.length, 0), [stackSet.stacks]);
  const routeCount = stackSet.stacks.length;

  // `initialMode` is also an open command from item cards. The guided route
  // can remain mounted while navigation updates its query, so applying it
  // only through useState's initializer leaves a collapsed tray invisible.
  // Treat compact/mid/full as explicit open requests; an icon value never
  // overrides a learner's later manual collapse.
  useEffect(() => {
    if (initialMode !== "icon") setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (dropKey === undefined || dropKey === previousDropKey.current) return;
    previousDropKey.current = dropKey;
    dropProgress.setValue(0);
    dropOpacity.setValue(1);
    const drop = reducedMotion
      ? Animated.timing(dropProgress, { toValue: 1, duration: 120, useNativeDriver: true })
      : Animated.spring(dropProgress, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true });
    Animated.sequence([
      drop,
      Animated.timing(dropOpacity, { toValue: 0, duration: reducedMotion ? 120 : 240, useNativeDriver: true }),
    ]).start();
  }, [dropKey, dropOpacity, dropProgress, reducedMotion]);

  const changeMode = (next: GuidedLearningTrayMode) => {
    setMode(next);
    onModeChange?.(next);
  };

  if (!routeCount && mode !== "icon") {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Open learning plan tray"
        onPress={() => changeMode("compact")}
        style={[styles.emptyTray, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, style]}
      >
        <Feather name="folder" size={18} color={colors.accentRole.action} />
        <Text style={[styles.emptyTrayText, { color: colors.textRole.primary }]}>Your learning plan is empty</Text>
      </TouchableOpacity>
    );
  }

  const routeKey = routeCount ? learningPlanRouteKey(stackSet.stacks[0].route) : "empty";
  const labels = routeLabels?.[routeKey];
  const firstRouteLabel = routeCount ? routeLabel(stackSet.stacks[0].route, labels) : "Your learning plan";

  if (mode === "icon") {
    return (
      <View style={[styles.iconWrap, style]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Open learning plan tray with ${totalSelected} selected item${totalSelected === 1 ? "" : "s"}`}
          onPress={() => changeMode("compact")}
          style={[styles.iconTray, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.strong }]}
        >
          <Feather name="folder" size={21} color={colors.accentRole.action} />
          <View style={[styles.countBadge, { backgroundColor: colors.accentRole.fill }]}><Text style={[styles.countBadgeText, { color: colors.accentRole.onFill }]}>{totalSelected}</Text></View>
        </TouchableOpacity>
        <Animated.View pointerEvents="none" style={[styles.dropPill, { opacity: dropOpacity, transform: [{ translateY: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [-22, 0] }) }, { scale: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }], backgroundColor: colors.accentRole.fill }]}>
          <Text style={[styles.dropPillText, { color: colors.accentRole.onFill }]}>{pendingDropLabel || "Added"}</Text>
        </Animated.View>
      </View>
    );
  }

  const compact = mode === "compact";
  const mid = mode === "mid";
  return (
    <View style={[styles.tray, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.strong }, style]}>
      <Animated.View pointerEvents="none" style={[styles.dropPill, { opacity: dropOpacity, transform: [{ translateY: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }, { scale: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }], backgroundColor: colors.accentRole.fill }]}>
        <Text style={[styles.dropPillText, { color: colors.accentRole.onFill }]}>{pendingDropLabel || "Added to your plan"}</Text>
      </Animated.View>
      <View style={styles.trayHeader}>
        <View style={styles.trayTitleBlock}>
          <Text style={[styles.trayEyebrow, { color: colors.textRole.muted }]}>Learning plan</Text>
          <Text style={[styles.trayTitle, { color: colors.textRole.primary }]} numberOfLines={compact ? 1 : 2}>{firstRouteLabel}</Text>
          <Text style={[styles.trayMeta, { color: colors.textRole.secondary }]}>{totalSelected} selected item{totalSelected === 1 ? "" : "s"} · {routeCount} route{routeCount === 1 ? "" : "s"}</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Collapse learning plan tray to icon" onPress={() => changeMode("icon")} style={styles.headerIconButton}>
          <Feather name="minimize-2" size={18} color={colors.textRole.muted} />
        </TouchableOpacity>
      </View>
      {stackSet.warnings.length ? <View style={[styles.warningBox, { backgroundColor: colors.warningSoft, borderColor: colors.accentRole.warning }]}>
        <Feather name="info" size={16} color={colors.accentRole.warning} />
        <Text style={[styles.warningText, { color: colors.textRole.secondary }]}>You are adding multiple routes. They will stay separate in your saved report; items are not treated as one combined qualification path.</Text>
      </View> : null}
      {stackSet.stacks.some((stack) => stack.guardIssues.length) ? <View style={[styles.warningBox, { backgroundColor: colors.warningSoft, borderColor: colors.accentRole.warning }]}>
        <Feather name="alert-circle" size={16} color={colors.accentRole.warning} />
        <View style={styles.warningCopy}>
          <Text style={[styles.warningText, { color: colors.textRole.secondary }]}>Some saved choices need attention before they can remain in this route.</Text>
          {stackSet.stacks.flatMap((stack) => stack.guardIssues).slice(0, 3).map((issue) => (
            <Text key={`${issue.candidateId}:${issue.code}`} style={[styles.warningText, { color: colors.textRole.muted }]}>{issue.message}</Text>
          ))}
        </View>
      </View> : null}
      {!compact ? <ScrollView style={styles.routeScroll} contentContainerStyle={styles.routeScrollContent} nestedScrollEnabled>
        {stackSet.stacks.map((stack) => {
          const key = learningPlanRouteKey(stack.route);
          return <View key={key} style={[styles.routeCard, { borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.routeTitle, { color: colors.textRole.primary }]}>{routeLabel(stack.route, routeLabels?.[key])}</Text>
            <RouteLayers stack={stack} routeKey={key} onRemove={onRemove} onReorder={onReorder} onSelectCandidate={onSelectCandidate} onSelectAlternative={onSelectAlternative} advisoryAreaLabels={advisoryAreaLabels?.[key]} />
          </View>;
        })}
      </ScrollView> : null}
      <View style={styles.modeRow}>
        {(["compact", "mid", "full"] as GuidedLearningTrayMode[]).map((value) => (
          <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: mode === value }} onPress={() => changeMode(value)} style={[styles.modeButton, mode === value && { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.strong }]}>
            <Text style={[styles.modeButtonText, { color: mode === value ? colors.textRole.primary : colors.textRole.muted }]}>{MODE_LABELS[value]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {mid || mode === "full" ? <View style={styles.actionRow}>
        {onSave ? <TouchableOpacity accessibilityRole="button" onPress={onSave} style={[styles.actionButton, { borderColor: colors.borderRole.subtle }]}><Feather name="save" size={15} color={colors.accentRole.action} /><Text style={[styles.actionText, { color: colors.accentRole.action }]}>Save</Text></TouchableOpacity> : null}
        {onPrint ? <TouchableOpacity accessibilityRole="button" onPress={onPrint} style={[styles.actionButton, { borderColor: colors.borderRole.subtle }]}><Feather name="download" size={15} color={colors.accentRole.action} /><Text style={[styles.actionText, { color: colors.accentRole.action }]}>Print / download</Text></TouchableOpacity> : null}
        {onShare ? <TouchableOpacity accessibilityRole="button" onPress={onShare} style={[styles.actionButton, { borderColor: colors.borderRole.subtle }]}><Feather name="share-2" size={15} color={colors.accentRole.action} /><Text style={[styles.actionText, { color: colors.accentRole.action }]}>Share summary</Text></TouchableOpacity> : null}
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: "flex-end", minHeight: 56 },
  iconTray: { width: 52, height: 52, borderWidth: 1, borderRadius: Radius.full, alignItems: "center", justifyContent: "center", ...Shadow.md },
  countBadge: { position: "absolute", right: -3, top: -3, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  countBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy },
  tray: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.md, overflow: "visible" },
  trayHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  trayTitleBlock: { flex: 1 },
  trayEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, textTransform: "uppercase", letterSpacing: 0.6 },
  trayTitle: { marginTop: 3, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  trayMeta: { marginTop: 4, fontSize: FontSize.sm },
  headerIconButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  warningBox: { flexDirection: "row", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  warningCopy: { flex: 1, gap: Spacing.xs },
  warningText: { flex: 1, fontSize: FontSize.sm, lineHeight: 17 },
  routeScroll: { maxHeight: 360, marginTop: Spacing.md },
  routeScrollContent: { gap: Spacing.md, paddingBottom: Spacing.xs },
  routeCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  routeTitle: { fontSize: 18, lineHeight: 25, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  routeBody: { gap: Spacing.sm },
  selectedLane: { gap: Spacing.sm },
  optionalLane: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  selectedItem: { borderBottomWidth: 1 },
  itemRow: { minHeight: 44, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm },
  itemCopy: { flex: 1 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  itemLayer: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  itemName: { fontSize: 16, lineHeight: 23, marginTop: 2 },
  removeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  reorderButton: { minWidth: 32, minHeight: 36, alignItems: "center", justifyContent: "center" },
  choiceBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xs },
  choiceTitle: { fontSize: 18, lineHeight: 25, fontWeight: FontWeight.bold },
  choiceGroup: { marginTop: Spacing.sm },
  choiceLabel: { fontSize: 16, lineHeight: 23, fontWeight: FontWeight.semibold },
  choiceText: { fontSize: 16, lineHeight: 24, marginTop: 2 },
  availableBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
  availableItem: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.sm },
  availableHeader: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  availableDetails: { paddingTop: Spacing.xs, gap: Spacing.sm },
  selectedDetails: { paddingBottom: Spacing.sm, gap: Spacing.xs },
  detailPanel: { gap: Spacing.sm, paddingTop: Spacing.sm },
  explanationSection: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  explanationHeading: { fontSize: 18, lineHeight: 25, fontWeight: FontWeight.bold },
  detailText: { fontSize: 16, lineHeight: 25 },
  detailMeta: { fontSize: 16, lineHeight: 24 },
  detailLabel: { fontWeight: FontWeight.bold },
  resourceLink: { minHeight: 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingVertical: Spacing.xs },
  resourceLinkText: { fontSize: 16, lineHeight: 23, fontWeight: FontWeight.semibold },
  sourceEvidence: { gap: Spacing.xs, paddingTop: Spacing.xs },
  resourceEvidence: { gap: Spacing.sm, paddingTop: Spacing.xs },
  resourceWhy: { gap: Spacing.xs },
  addButton: { minHeight: 40, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, alignSelf: "flex-start" },
  compareLink: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center", marginTop: Spacing.xs },
  compareLinkText: { fontSize: FontSize.xs, fontWeight: "800" },
  advisoryBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xs },
  emptyText: { fontSize: 16, lineHeight: 24, paddingVertical: Spacing.md },
  modeRow: { flexDirection: "row", gap: Spacing.xs, marginTop: Spacing.md },
  modeButton: { minHeight: 36, paddingHorizontal: Spacing.md, borderRadius: Radius.full, borderWidth: 1, borderColor: "transparent", justifyContent: "center" },
  modeButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.md },
  actionButton: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  actionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  dropPill: { position: "absolute", right: Spacing.lg, top: -18, zIndex: 5, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, ...Shadow.sm },
  dropPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  emptyTray: { minHeight: 56, borderWidth: 1, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.sm, ...Shadow.sm },
  emptyTrayText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
