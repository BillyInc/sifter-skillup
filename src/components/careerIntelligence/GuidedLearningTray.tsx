import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
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
import { FlowCue } from "../guidance/FlowCue";
import { TRAY_CUE, TRAY_EMPTY_CUE } from "../../lib/studentFlowCopy";
import type {
  LearningPlanCandidate,
  LearningPlanLayer,
  LearningPlanLayerChoices,
  LearningPlanRoute,
  LearningPlanStack,
  LearningPlanStackSet,
} from "../../lib/guidedLearningPlan";
import { learningPlanRelationshipScopeMatches, learningPlanRouteKey } from "../../lib/guidedLearningPlan";
import { studentContextSections, studentFacingCopy, studentItemLimitations, studentOutputCopy, studentReasonCopy } from "../../lib/studentExplanation";
import { studentSafeUrl } from "../../lib/studentCareerBoundary";
import { AlternativeComparisonSheet } from "./AlternativeComparisonSheet";
import { sequenceGuidanceText, type StudentRelationship } from "./ContextRelationshipSheet";
import { RouteButton } from "./RouteButton";
import { ExternalLinkGuard } from "./ExternalLinkGuard";

export type GuidedLearningTrayMode = "icon" | "compact" | "mid" | "full";

export interface GuidedLearningTrayRouteLabels {
  programme?: string;
  domain?: string;
  area?: string;
  role?: string;
}

export interface D078TrayChoice {
  id: string;
  label: string;
  kind: "method" | "combination" | "component_method";
  combinationId?: string;
}

export interface D078TrayItem {
  id: string;
  label: string;
  lane: string;
  contextLevel: "domain" | "area" | "role";
}

/** Graph-projected content kept separate from generic approved-plan candidates. */
export interface D078TrayContext {
  stackId?: string;
  active?: boolean;
  routeLabel: string;
  programmeLabel?: string;
  institutionContextLabel?: string;
  domainLabel?: string;
  choices: D078TrayChoice[];
  foundations: string[];
  selectedItems: D078TrayItem[];
  areaLabel?: string;
  roleLabel?: string;
  onRemoveChoice: (choice: D078TrayChoice) => void;
  onRemoveItem: (itemId: string) => void;
  onActivate?: () => void;
  onRemoveStack?: () => void;
}

export interface GuidedLearningTrayProps {
  stackSet: LearningPlanStackSet;
  d078Route?: D078TrayContext;
  d078Routes?: D078TrayContext[];
  onCreateD078Route?: () => void;
  initialMode?: GuidedLearningTrayMode;
  /** Keep a docked trigger collapsed while its parent opens the sheet. */
  forceIcon?: boolean;
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

function sentenceLowercase(value: string): string {
  return value ? value.charAt(0).toLocaleLowerCase() + value.slice(1) : value;
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
      && (relationship.type !== "works_with" || item.layer === "domain")
      && learningPlanRelationshipScopeMatches(relationship.sequenceScope, route))
    .map((relationship) => ({
      type: relationship.type,
      label: relationship.type === "alternative" || relationship.type === "alternative_to" ? "Alternative" : relationship.type === "works_with" || relationship.type === "complements" ? "Useful alongside" : relationship.type === "builds_on" ? "Builds on" : "Related learning",
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
  const candidateResourceLinks = item.learningLinks?.length
    ? item.learningLinks
    : item.linkUrl ? [{ title: item.linkTitle || `Learning resource for ${item.name}`, url: item.linkUrl, rationale: item.linkRationale, access: item.linkAccess, kind: item.linkKind }] : [];
  const resourceLinks = candidateResourceLinks.filter((link) => studentSafeUrl(link.url));
  const evidenceReferences = item.sourceReferences?.filter((reference) => studentSafeUrl(reference.url)) ?? [];
  const useMeaning = studentFacingCopy(useSections.meaning);
  const exampleTask = studentFacingCopy(useSections.task);
  const possibleOutput = studentOutputCopy(item.expectedOutput, item.contextualUse);
  const keepInMind = [
    studentFacingCopy(useSections.guardrail),
    ...studentItemLimitations(item.limitations).map(studentFacingCopy),
  ].filter(Boolean).join("\n\n");
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
    <View style={[styles.explanationSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <Text accessibilityRole="header" style={[styles.explanationHeading, { color: colors.textRole.primary }]}>How you might use it</Text>
      <Text style={[styles.detailText, { color: colors.textRole.secondary }]}>{useMeaning || "Use it when it fits the work described for this route."}</Text>
      {exampleTask ? <View style={styles.taskExample}>
        <Text accessibilityRole="header" style={[styles.detailLabel, { color: colors.textRole.secondary }]}>Example task</Text>
        <Text style={[styles.detailText, { color: colors.textRole.secondary }]}>{exampleTask}</Text>
      </View> : null}
      {possibleOutput ? <View style={styles.taskExample}>
        <Text accessibilityRole="header" style={[styles.detailLabel, { color: colors.textRole.secondary }]}>Possible result</Text>
        <Text style={[styles.detailText, { color: colors.textRole.secondary }]}>{possibleOutput}</Text>
      </View> : null}
    </View>
    {section("What to keep in mind", keepInMind)}
    {item.prerequisiteNames?.length ? section("Learn or review first", item.prerequisiteNames.join(", ")) : null}
    {evidenceReferences.length ? <View style={styles.sourceEvidence}>
      <Text style={[styles.detailText, styles.detailLabel, { color: colors.textRole.secondary }]}>Evidence for this item</Text>
      {evidenceReferences.map((reference, index) => {
        const locator = item.sourceLocators?.find((candidate) => candidate.sourceId === reference.id);
        const locatorLabel = locator ? sourceLocatorLabel(locator) : undefined;
        const title = reference.title || "Supporting source";
        return <View key={`${reference.url}-${index}`}>
          <ExternalLinkGuard url={reference.url} label={title} accessibilityLabel={`Open evidence source ${title}`} description={`This is a source used to explain or verify ${item.name}.`} hideUnavailable icon={<Feather name="external-link" size={14} color={colors.accentRole.action} />} style={styles.resourceLink} textStyle={styles.resourceLinkText} />
          {locatorLabel ? <Text style={[styles.detailText, { color: colors.textRole.muted }]}>Where to look: {locatorLabel}</Text> : null}
        </View>;
      })}
    </View> : null}
    {resourceLinks.length ? <View style={styles.resourceEvidence}>
      <Text accessibilityRole="header" style={[styles.explanationHeading, { color: colors.textRole.primary }]}>Learning resources</Text>
      {resourceLinks.map((link, index) => {
        const media = `${link.kind ?? ""} ${link.title}`.toLowerCase();
        const isVideo = /video|youtube|watch/.test(media);
        const isDownload = /pdf|download|guide/.test(media);
        const action = isVideo ? "Watch" : isDownload ? "Open guide" : "Open";
        const label = `${action}: ${link.title} for ${item.name}`;
        return <ExternalLinkGuard key={`${link.url}:${index}`} url={link.url} label={label} accessibilityLabel={label} description={link.rationale || `This resource helps you learn ${item.name} in the context of the selected route.`} hideUnavailable icon={<Feather name={isVideo ? "play-circle" : isDownload ? "download" : "external-link"} size={16} color={colors.accentRole.action} />} style={[styles.resourceLink, styles.resourceButton, { borderColor: colors.accentRole.action, backgroundColor: colors.surface.subtle }]} textStyle={styles.resourceLinkText} />;
      })}
    </View> : null}
    {studentRelationships(item, route).length ? <View style={styles.resourceEvidence}>
      <Text accessibilityRole="header" style={[styles.explanationHeading, { color: colors.textRole.primary }]}>How it connects to other learning</Text>
      {studentRelationships(item, route).map((relationship, index) => <View key={`${relationship.type}:${relationship.target}:${index}`} style={[styles.explanationSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <Text style={[styles.detailMeta, { color: colors.accentRole.action }]}>{relationship.label}</Text>
        <Text style={[styles.detailText, { color: colors.textRole.secondary }]}>{relationship.target}: {relationship.explanation} {sequenceGuidanceText(item.name, relationship)}</Text>
      </View>)}
    </View> : null}
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
        <RouteButton
          expanded={expandedCandidateId === item.id}
          accessibilityLabel={`${expandedCandidateId === item.id ? "Hide" : "Show"} explanation for ${item.name}`}
          onPress={() => setExpandedCandidateId(expandedCandidateId === item.id ? null : item.id)}
          variant="quiet"
          style={[styles.itemCopy, styles.expanderButton]}
        >
          <Text style={[styles.itemLayer, { color: colors.textRole.muted }]}>{lane === "context"
            ? `${LAYER_LABELS[item.layer]} · programme context`
            : lane === "compulsory"
              ? `Required step ${index + 1} · ${LAYER_LABELS[item.layer]} · ${candidatePlacementLabel(item)}`
              : `Optional choice · ${LAYER_LABELS[item.layer]} · ${candidatePlacementLabel(item)}`}</Text>
          <Text style={[styles.itemName, { color: colors.textRole.primary }]}>{item.name}</Text>
        </RouteButton>
        {(onRemove || onReorder) && isRemovable(stack, item) ? (
          <View style={styles.itemActions}>
            {onReorder ? <>
              <RouteButton
                accessibilityLabel={`Move ${item.name} earlier in this plan`}
                disabled={!previousId}
                onPress={() => onReorder(routeKey, item.id, previousId)}
                variant="quiet"
                icon={<Feather name="arrow-up" size={14} color={previousId ? colors.accentRole.action : colors.textRole.muted} />}
                style={styles.reorderButton}
              >
              </RouteButton>
              <RouteButton
                accessibilityLabel={`Move ${item.name} later in this plan`}
                disabled={!nextId}
                onPress={() => onReorder(routeKey, item.id, afterNextId)}
                variant="quiet"
                icon={<Feather name="arrow-down" size={14} color={nextId ? colors.accentRole.action : colors.textRole.muted} />}
                style={styles.reorderButton}
              >
              </RouteButton>
            </> : null}
            {onRemove ? <RouteButton
              accessibilityLabel={`Remove ${item.name} from this plan`}
              onPress={() => onRemove(routeKey, item.id)}
              variant="quiet"
              icon={<Feather name="x" size={16} color={colors.textRole.muted} />}
              style={styles.removeButton}
            >
            </RouteButton> : null}
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
              <RouteButton
                label="Compare options"
                accessibilityLabel={`Compare ${alternative.group} options`}
                onPress={() => setComparison({ group: alternative.group, options: alternative.options, selectedId: alternative.selectedId })}
                variant="secondary"
                style={styles.compareLink}
              >
              </RouteButton>
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
              <RouteButton
                expanded={expanded}
                accessibilityLabel={`${expanded ? "Hide" : "Show"} explanation for ${candidate.name}`}
                onPress={() => setExpandedCandidateId(expanded ? null : candidate.id)}
                variant="quiet"
                icon={<Feather name={expanded ? "chevron-up" : "chevron-down"} size={17} color={colors.textRole.muted} />}
                style={[styles.availableHeader, styles.expanderButton]}
              >
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemLayer, { color: colors.textRole.muted }]}>{LAYER_LABELS[candidate.layer]} · {candidatePlacementLabel(candidate)}</Text>
                  <Text style={[styles.itemName, { color: colors.textRole.primary }]}>{candidate.name}</Text>
                </View>
              </RouteButton>
              {expanded ? <View style={styles.availableDetails}>
                <LearningItemDetails item={candidate} route={stack.route} />
                <RouteButton
                  label="Add to this route"
                  accessibilityLabel={`Add ${candidate.name} to this learning plan`}
                  onPress={() => onSelectCandidate?.(routeKey, candidate)}
                  variant="quiet"
                  icon={<Feather name="plus" size={15} color={colors.accentRole.action} />}
                  style={[styles.addButton, { borderColor: colors.accentRole.action }]}
                >
                </RouteButton>
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
  d078Route,
  d078Routes,
  onCreateD078Route,
  initialMode = "compact",
  forceIcon = false,
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
  const d078RouteList = d078Routes?.length ? d078Routes : d078Route ? [d078Route] : [];
  const totalSelected = useMemo(() => stackSet.stacks.reduce((sum, stack) => sum + stack.selectedIds.length
    + Number(Boolean(stack.route.programmeId)) + Number(Boolean(stack.route.domainId))
    + Number(Boolean(stack.route.areaId)) + Number(Boolean(stack.route.roleId)), 0)
    + d078RouteList.reduce((sum, route) => sum + route.choices.length + route.selectedItems.length
      + Number(Boolean(route.programmeLabel)) + Number(Boolean(route.institutionContextLabel))
      + Number(Boolean(route.domainLabel)) + Number(Boolean(route.areaLabel)) + Number(Boolean(route.roleLabel)), 0), [d078RouteList, stackSet.stacks]);
  const routeCount = stackSet.stacks.length + d078RouteList.length;

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
    if (!forceIcon) setMode(next);
    onModeChange?.(next);
  };

  if (!routeCount && mode !== "icon") {
    return (
      <RouteButton
        accessibilityLabel="Open learning plan tray"
        onPress={() => changeMode("compact")}
        variant="quiet"
        icon={<Feather name="folder" size={18} color={colors.accentRole.action} />}
        style={[styles.emptyTray, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, style]}
      >
        <Text style={[styles.emptyTrayText, { color: colors.textRole.primary }]}>Your learning plan is empty</Text>
        <Text style={[styles.emptyTrayHint, { color: colors.textRole.secondary }]}>{TRAY_EMPTY_CUE.next}</Text>
      </RouteButton>
    );
  }

  const firstStack = stackSet.stacks[0];
  const routeKey = firstStack ? learningPlanRouteKey(firstStack.route) : "empty";
  const labels = routeLabels?.[routeKey];
  const activeD078Route = d078RouteList.find((route) => route.active) ?? d078RouteList[0];
  const firstRouteLabel = firstStack ? routeLabel(firstStack.route, labels) : activeD078Route?.routeLabel ?? "Your learning plan";

  if (mode === "icon") {
    return (
      <View style={[styles.iconWrap, style]}>
        <RouteButton
          accessibilityLabel={`Open learning plan tray with ${totalSelected} selected route detail${totalSelected === 1 ? "" : "s"} or learning choice${totalSelected === 1 ? "" : "s"}`}
          onPress={() => changeMode("compact")}
          variant="quiet"
          style={[styles.iconTray, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.strong }]}
        >
          <Feather name="folder" size={21} color={colors.accentRole.action} />
          <View style={[styles.countBadge, { backgroundColor: colors.accentRole.fill }]}><Text style={[styles.countBadgeText, { color: colors.accentRole.onFill }]}>{totalSelected}</Text></View>
        </RouteButton>
        <Animated.View pointerEvents="none" style={[styles.dropPill, { opacity: dropOpacity, transform: [{ translateY: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [-22, 0] }) }, { scale: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }], backgroundColor: colors.accentRole.fill }]}>
          <Text style={[styles.dropPillText, { color: colors.accentRole.onFill }]}>{pendingDropLabel || "Added"}</Text>
        </Animated.View>
      </View>
    );
  }

  const compact = mode === "compact";
  const mid = mode === "mid";
  return (
    <View testID="guided-learning-tray" style={[styles.tray, mode === "full" && styles.trayFull, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.strong }, style]}>
      <Animated.View pointerEvents="none" style={[styles.dropPill, { opacity: dropOpacity, transform: [{ translateY: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) }, { scale: dropProgress.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }], backgroundColor: colors.accentRole.fill }]}>
        <Text style={[styles.dropPillText, { color: colors.accentRole.onFill }]}>{pendingDropLabel || "Added to your plan"}</Text>
      </Animated.View>
      <View style={styles.trayHeader}>
        <View style={styles.trayTitleBlock}>
          <Text style={[styles.trayEyebrow, { color: colors.textRole.muted }]}>Learning plan</Text>
          <Text style={[styles.trayTitle, { color: colors.textRole.primary }]} numberOfLines={compact ? 1 : 2}>{firstRouteLabel}</Text>
          <Text style={[styles.trayMeta, { color: colors.textRole.secondary }]}>{totalSelected} selected route detail{totalSelected === 1 ? "" : "s"} or learning choice{totalSelected === 1 ? "" : "s"} · {routeCount} route{routeCount === 1 ? "" : "s"}</Text>
          {compact ? <Text style={[styles.trayHint, { color: colors.textRole.secondary }]}>{TRAY_CUE.next}</Text> : null}
        </View>
        <RouteButton accessibilityLabel="Collapse learning plan tray to icon" onPress={() => changeMode("icon")} variant="quiet" icon={<Feather name="minimize-2" size={18} color={colors.textRole.muted} />} style={styles.headerIconButton} />
      </View>
      {compact ? null : <FlowCue {...TRAY_CUE} />}
      {stackSet.warnings.length || d078RouteList.length > 1 ? <View style={[styles.warningBox, { backgroundColor: colors.warningSoft, borderColor: colors.accentRole.warning }]}>
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
      {compact ? d078RouteList.map((route, routeIndex) => <View key={`compact-d078-${route.stackId ?? routeIndex}`} style={styles.compactD078Summary}>
        {route.programmeLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>Programme: {route.programmeLabel}</Text> : null}
        {route.institutionContextLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>{route.institutionContextLabel}</Text> : null}
        {route.domainLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>Domain: {route.domainLabel}</Text> : null}
        {route.areaLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>Area: {route.areaLabel}</Text> : null}
        {route.roleLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>Role: {route.roleLabel}</Text> : null}
        {route.choices.length ? <View style={styles.d078Section}>
          <Text style={[styles.d078Heading, { color: colors.textRole.primary }]}>Your selected approaches</Text>
          {route.choices.map((choice) => <Text key={`${choice.kind}:${choice.id}`} style={[styles.d078Copy, { color: colors.textRole.secondary }]}>{choice.label}</Text>)}
        </View> : null}
        {(["domain", "area", "role"] as const).map((level) => {
          const items = route.selectedItems.filter((item) => item.contextLevel === level);
          if (!items.length) return null;
          const title = level === "domain" ? "Domain learning" : level === "area" ? "Area learning" : "Role learning";
          return <View key={level} style={styles.d078Section}>
            <Text style={[styles.d078Heading, { color: colors.textRole.primary }]}>{title}</Text>
            {items.map((item) => <Text key={item.id} style={[styles.d078Copy, { color: colors.textRole.secondary }]}>{item.label} · {item.lane}</Text>)}
          </View>;
        })}
        <Text style={[styles.d078Meta, { color: colors.textRole.muted }]}>{route.choices.length} selected method/design{route.choices.length === 1 ? "" : "s"} · {route.selectedItems.length} added item{route.selectedItems.length === 1 ? "" : "s"}</Text>
      </View>) : null}
      {!compact ? <ScrollView style={[styles.routeScroll, mode === "full" && styles.routeScrollFull]} contentContainerStyle={styles.routeScrollContent} nestedScrollEnabled>
        {d078RouteList.map((route, routeIndex) => {
          // A legacy/single-route caller has no active flag. Keep its route
          // editable; in a multi-route tray only the explicitly active route
          // may be changed until the learner switches to it.
          const routeIsActive = route.active ?? d078RouteList.length === 1;
          const d078ItemGroups = [
            { key: "domain", title: "Domain learning you added" },
            { key: "area", title: "Area learning you added" },
            { key: "role", title: "Role learning you added" },
          ].map((group) => ({ ...group, items: route.selectedItems.filter((item) => item.contextLevel === group.key) }))
            .filter((group) => group.items.length > 0);
          return <View key={route.stackId ?? `d078-${routeIndex}`} style={[styles.routeCard, { borderColor: routeIsActive ? colors.accentRole.action : colors.borderRole.subtle }]}>
          <View style={styles.d078RouteHeader}>
            <View style={styles.d078RouteHeading}>
              <Text style={[styles.routeTitle, { color: colors.textRole.primary }]}>{route.routeLabel}{route.stackId ? ` · Route ${routeIndex + 1}` : ""}</Text>
              {route.programmeLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>Programme: {route.programmeLabel}</Text> : null}
              {route.institutionContextLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>{route.institutionContextLabel}</Text> : null}
              {route.domainLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>Domain: {route.domainLabel}</Text> : null}
              <Text style={[styles.d078Meta, { color: colors.textRole.secondary }]}>{route.choices.length} selected method/design{route.choices.length === 1 ? "" : "s"} {"\u00b7"} {route.selectedItems.length} added item{route.selectedItems.length === 1 ? "" : "s"}</Text>
            </View>
            {route.onActivate && !routeIsActive ? <RouteButton label="Use this route" onPress={route.onActivate} variant="secondary" style={styles.d078RouteButton} /> : null}
            {route.onRemoveStack ? <RouteButton accessibilityLabel={`Remove route ${routeIndex + 1}`} onPress={route.onRemoveStack} variant="quiet" icon={<Feather name="x" size={16} color={colors.textRole.muted} />} style={styles.d078RouteButton} /> : null}
          </View>
          {route.choices.length ? <View style={styles.d078Section}>
            <Text style={[styles.d078Heading, { color: colors.textRole.primary }]}>Your selected approaches</Text>
            {route.choices.map((choice) => <View key={`${choice.kind}:${choice.id}`} style={styles.d078Row}>
              <Text style={[styles.d078Copy, { color: colors.textRole.secondary }]}>{choice.label}</Text>
              {routeIsActive ? <RouteButton accessibilityLabel={`Remove ${choice.label} from your selected approaches`} onPress={() => route.onRemoveChoice(choice)} variant="quiet" icon={<Feather name="x" size={16} color={colors.textRole.muted} />} style={styles.d078Remove} /> : null}
            </View>)}
          </View> : null}
          {route.foundations.length ? <View style={styles.d078Section}>
            <Text style={[styles.d078Heading, { color: colors.textRole.primary }]}>Foundations carried on this route</Text>
            {route.foundations.map((label, index) => <Text key={`${index}:${label}`} style={[styles.d078Copy, { color: colors.textRole.secondary }]}>{index + 1}. {label}</Text>)}
          </View> : null}
          {route.areaLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary, marginTop: Spacing.sm }]}>Area selected: {route.areaLabel}</Text> : null}
          {route.roleLabel ? <Text style={[styles.d078Copy, { color: colors.textRole.secondary, marginTop: Spacing.xs }]}>Role selected: {route.roleLabel}</Text> : null}
          <View style={styles.d078Section}>
            <Text style={[styles.d078Heading, { color: colors.textRole.primary }]}>Your selected learning, by route level</Text>
            {d078ItemGroups.length ? d078ItemGroups.map((group) => <View key={group.key} style={styles.d078Section}>
              <Text style={[styles.d078Meta, { color: colors.textRole.secondary }]}>{group.title}</Text>
              {group.items.map((item) => <View key={item.id} style={styles.d078Row}>
                <View style={styles.d078ItemCopy}><Text style={[styles.d078Copy, { color: colors.textRole.primary }]}>{item.label}</Text><Text style={[styles.d078Meta, { color: colors.textRole.muted }]}>{item.lane}</Text></View>
                {routeIsActive ? <RouteButton accessibilityLabel={`Remove ${item.label} from your learning`} onPress={() => route.onRemoveItem(item.id)} variant="quiet" icon={<Feather name="x" size={16} color={colors.textRole.muted} />} style={styles.d078Remove} /> : null}
              </View>)}
            </View>) : <Text style={[styles.d078Meta, { color: colors.textRole.muted }]}>No additional items selected. The foundations and selected methods remain part of this route.</Text>}
          </View>
        </View>;
        })}
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
          <RouteButton key={value} label={MODE_LABELS[value]} accessibilityLabel={`Show learning plan ${MODE_LABELS[value].toLowerCase()} size`} selected={mode === value} variant={mode === value ? "selected" : "quiet"} onPress={() => changeMode(value)} style={styles.modeButton} />
        ))}
      </View>
      {mid || mode === "full" ? <View style={styles.actionRow}>
        {onCreateD078Route ? <RouteButton label="Build a separate route" onPress={onCreateD078Route} variant="secondary" style={styles.actionButton} /> : null}
        {onSave ? <RouteButton label="Save" onPress={onSave} variant="quiet" style={styles.actionButton} /> : null}
        {onPrint ? <RouteButton label="Print / download" onPress={onPrint} variant="quiet" style={styles.actionButton} /> : null}
        {onShare ? <RouteButton label="Share summary" onPress={onShare} variant="quiet" style={styles.actionButton} /> : null}
      </View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: "flex-end", minHeight: 56 },
  iconTray: { width: 52, height: 52, borderWidth: 1, borderRadius: Radius.full, alignItems: "center", justifyContent: "center", ...Shadow.md },
  countBadge: { position: "absolute", right: -3, top: -3, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  countBadgeText: { fontSize: FontSize.md, lineHeight: 16, fontWeight: FontWeight.heavy },
  tray: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.md, overflow: "visible" },
  trayFull: { flex: 1, height: "100%" as any, minHeight: 0 },
  trayHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  trayTitleBlock: { flex: 1 },
  trayEyebrow: { fontSize: FontSize.md, lineHeight: 18, fontWeight: FontWeight.bold },
  trayTitle: { marginTop: 3, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  trayMeta: { marginTop: 4, fontSize: FontSize.md, lineHeight: 18 },
  headerIconButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  warningBox: { flexDirection: "row", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  warningCopy: { flex: 1, gap: Spacing.xs },
  warningText: { flex: 1, fontSize: 14, lineHeight: 20 },
  routeScroll: { maxHeight: 360, marginTop: Spacing.md },
  routeScrollFull: { flex: 1, minHeight: 0, maxHeight: undefined as any },
  routeScrollContent: { gap: Spacing.md, paddingBottom: Spacing.xs },
  d078Section: { gap: Spacing.xs, marginTop: Spacing.md },
  compactD078Summary: { paddingHorizontal: Spacing.sm, paddingBottom: Spacing.xs },
  d078RouteHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.sm },
  d078RouteHeading: { flex: 1, gap: 2 },
  d078RouteButton: { minHeight: 40 },
  d078Heading: { fontSize: 16, lineHeight: 22, fontWeight: FontWeight.bold },
  d078Row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(127,127,127,0.25)" },
  d078Copy: { flex: 1, fontSize: 16, lineHeight: 22 },
  d078ItemCopy: { flex: 1, gap: 2 },
  d078Meta: { fontSize: 14, lineHeight: 20 },
  d078Remove: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  routeCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  routeTitle: { fontSize: 18, lineHeight: 25, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  routeBody: { gap: Spacing.sm },
  selectedLane: { gap: Spacing.sm },
  optionalLane: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  selectedItem: { borderBottomWidth: 1 },
  itemRow: { minHeight: 44, borderBottomWidth: 1, flexDirection: "row", alignItems: "center", paddingVertical: Spacing.sm },
  itemCopy: { flex: 1, minHeight: 44, justifyContent: "center" },
  expanderButton: { alignItems: "stretch", justifyContent: "center", borderWidth: 0, borderRadius: 0, paddingHorizontal: 0, paddingVertical: 0 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 2 },
  itemLayer: { fontSize: FontSize.md, lineHeight: 18, fontWeight: FontWeight.semibold },
  itemName: { fontSize: 16, lineHeight: 23, marginTop: 2 },
  removeButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  reorderButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
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
  taskExample: { gap: Spacing.xs, paddingTop: Spacing.xs },
  explanationHeading: { fontSize: 18, lineHeight: 25, fontWeight: FontWeight.bold },
  detailText: { fontSize: 16, lineHeight: 25 },
  detailMeta: { fontSize: 16, lineHeight: 24 },
  detailLabel: { fontWeight: FontWeight.bold },
  resourceLink: { minHeight: 44, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingVertical: Spacing.xs },
  resourceButton: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  resourceLinkText: { fontSize: 16, lineHeight: 23, fontWeight: FontWeight.semibold },
  sourceEvidence: { gap: Spacing.xs, paddingTop: Spacing.xs },
  resourceEvidence: { gap: Spacing.sm, paddingTop: Spacing.xs },
  resourceWhy: { gap: Spacing.xs },
  addButton: { minHeight: 44, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, alignSelf: "flex-start" },
  compareLink: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginTop: Spacing.xs },
  advisoryBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xs },
  emptyText: { fontSize: 16, lineHeight: 24, paddingVertical: Spacing.md },
  modeRow: { flexDirection: "row", gap: Spacing.xs, marginTop: Spacing.md },
  modeButton: { minHeight: 44, minWidth: 56, paddingHorizontal: Spacing.md, borderRadius: Radius.full, justifyContent: "center" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.md },
  actionButton: { minHeight: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  dropPill: { position: "absolute", right: Spacing.lg, top: -18, zIndex: 5, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, ...Shadow.sm },
  dropPillText: { fontSize: 14, lineHeight: 20, fontWeight: FontWeight.bold },
  emptyTray: { minHeight: 56, borderWidth: 1, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, flexDirection: "row", alignItems: "center", gap: Spacing.sm, ...Shadow.sm },
  emptyTrayText: { fontSize: 16, lineHeight: 24, fontWeight: FontWeight.semibold },
  emptyTrayHint: { fontSize: 14, lineHeight: 20 },
  trayHint: { fontSize: 14, lineHeight: 20 },
});
