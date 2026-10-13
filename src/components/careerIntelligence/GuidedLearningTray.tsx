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
  domain: "Domain foundation",
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
      label: relationshipLabel(relationship.type),
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

function readableKey(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
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
  const useCase = readableKey(item.useCaseKey);
  return <View style={styles.detailPanel}>
    {type ? <Text style={[styles.detailText, { color: colors.textRole.muted }]}><Text style={styles.detailLabel}>Type: </Text>{type}</Text> : null}
    {item.themeLabel ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>Theme: </Text>{item.themeLabel}</Text> : null}
    {useCase ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>Use case: </Text>{useCase}</Text> : null}
    {item.requirementLevel ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>Why it is shown: </Text>{readableKey(item.requirementLevel)}</Text> : null}
    {item.plainMeaning ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>What it is: </Text>{item.plainMeaning}</Text> : null}
    {item.contextualUse ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>In this route: </Text>{item.contextualUse}</Text> : null}
    {item.expectedOutput ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>What you can produce: </Text>{item.expectedOutput}</Text> : null}
    {item.prerequisiteNames?.length ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>Learn or review first: </Text>{item.prerequisiteNames.join(", ")}</Text> : null}
    {item.limitations?.length ? <Text style={[styles.detailText, { color: colors.textRole.secondary }]}><Text style={styles.detailLabel}>Limits: </Text>{item.limitations.join("; ")}</Text> : null}
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
    {item.linkUrl ? <TouchableOpacity
      accessibilityRole="link"
      accessibilityLabel={`Open learning resource for ${item.name}`}
      onPress={() => { if (/^https:\/\//i.test(item.linkUrl ?? "")) void Linking.openURL(item.linkUrl!); }}
      style={styles.resourceLink}
    >
      <Feather name="external-link" size={14} color={colors.accentRole.action} />
      <Text style={[styles.resourceLinkText, { color: colors.accentRole.action }]}>Open learning resource</Text>
    </TouchableOpacity> : null}
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
  const selectedStepById = new Map(stack.selectedIds.map((id, index) => [id, index + 1]));
  const availableItems = stack.selectableItems.filter((candidate) => !selectedIds.has(candidate.id) && !candidate.alternativeGroup);
  return (
    <View style={styles.routeBody}>
      {items.length ? <Text style={[styles.choiceText, { color: colors.textRole.muted }]}>
        Your chosen items are shown in route order. Layer labels show where each item belongs; they do not make every item in one layer a prerequisite for the next.
      </Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.selectedItem}>
          <View style={[styles.itemRow, { borderBottomColor: colors.borderRole.subtle }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded: expandedCandidateId === item.id }}
              accessibilityLabel={`${expandedCandidateId === item.id ? "Hide" : "Show"} explanation for ${item.name}`}
              onPress={() => setExpandedCandidateId(expandedCandidateId === item.id ? null : item.id)}
              style={styles.itemCopy}
            >
              <Text style={[styles.itemLayer, { color: colors.textRole.muted }]}>{selectedStepById.has(item.id)
                ? `Step ${selectedStepById.get(item.id)} · ${LAYER_LABELS[item.layer]}`
                : `${LAYER_LABELS[item.layer]} · programme context`}</Text>
              <Text style={[styles.itemName, { color: colors.textRole.primary }]}>{item.name}</Text>
            </TouchableOpacity>
            {(onRemove || onReorder) && isRemovable(stack, item) ? (
              <View style={styles.itemActions}>
                {onReorder ? (() => {
                  const index = stack.selectedIds.indexOf(item.id);
                  const previousId = index > 0 ? stack.selectedIds[index - 1] : undefined;
                  const nextId = index >= 0 && index < stack.selectedIds.length - 1 ? stack.selectedIds[index + 1] : undefined;
                  const afterNextId = index >= 0 && index < stack.selectedIds.length - 2 ? stack.selectedIds[index + 2] : undefined;
                  return <>
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
                  </>;
                })() : null}
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
              {item.explanation ? <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>{item.explanation}</Text> : null}
              <LearningItemDetails item={item} route={stack.route} />
            </View> : null}
        </View>
      ))}
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
                  <Text style={[styles.itemLayer, { color: colors.textRole.muted }]}>{LAYER_LABELS[candidate.layer]} · {candidate.category === "useful_edge" ? "Useful additional edge" : candidate.category === "conditional" ? "Use when it fits the task" : "Route option"}</Text>
                  <Text style={[styles.itemName, { color: colors.textRole.primary }]}>{candidate.name}</Text>
                </View>
                <Feather name={expanded ? "chevron-up" : "chevron-down"} size={17} color={colors.textRole.muted} />
              </TouchableOpacity>
              {expanded ? <View style={styles.availableDetails}>
                {candidate.explanation ? <Text style={[styles.choiceText, { color: colors.textRole.secondary }]}>{candidate.explanation}</Text> : <Text style={[styles.choiceText, { color: colors.textRole.muted }]}>A reviewed explanation is not available for this item yet.</Text>}
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
  routeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  routeBody: { gap: Spacing.sm },
  selectedItem: { borderBottomWidth: 1 },
  itemRow: { minHeight: 44, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm },
  itemCopy: { flex: 1 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  itemLayer: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  itemName: { fontSize: FontSize.md, marginTop: 2 },
  removeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  reorderButton: { minWidth: 32, minHeight: 36, alignItems: "center", justifyContent: "center" },
  choiceBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xs },
  choiceTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  choiceGroup: { marginTop: Spacing.sm },
  choiceLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  choiceText: { fontSize: FontSize.sm, lineHeight: 17, marginTop: 2 },
  availableBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm },
  availableItem: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, marginTop: Spacing.sm },
  availableHeader: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  availableDetails: { paddingTop: Spacing.xs, gap: Spacing.sm },
  selectedDetails: { paddingBottom: Spacing.sm, gap: Spacing.xs },
  detailPanel: { gap: Spacing.xs, paddingTop: Spacing.xs },
  detailText: { fontSize: FontSize.sm, lineHeight: 18 },
  detailLabel: { fontWeight: FontWeight.bold },
  resourceLink: { minHeight: 40, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingVertical: Spacing.xs },
  resourceLinkText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  sourceEvidence: { gap: Spacing.xs, paddingTop: Spacing.xs },
  addButton: { minHeight: 40, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, alignSelf: "flex-start" },
  compareLink: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center", marginTop: Spacing.xs },
  compareLinkText: { fontSize: FontSize.xs, fontWeight: "800" },
  advisoryBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xs },
  emptyText: { fontSize: FontSize.sm, paddingVertical: Spacing.md },
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
