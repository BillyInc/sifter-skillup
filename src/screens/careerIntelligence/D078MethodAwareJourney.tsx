import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, findNodeHandle, Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import { useReducedMotion } from "@/theme/motion";
import { MethodChoicePanel } from "@/components/careerIntelligence/MethodChoicePanel";
import { RouteButton } from "@/components/careerIntelligence/RouteButton";
import { ExternalLinkGuard } from "@/components/careerIntelligence/ExternalLinkGuard";
import { GuidedLearningTray, type D078TrayChoice, type D078TrayContext, type GuidedLearningTrayMode } from "@/components/careerIntelligence/GuidedLearningTray";
import { careerData, type GuidanceReportPath } from "@/lib/careerData";
import { provisioningData, openStudentDocument, shareTextSummary } from "@/lib/provisioningData";
import { buildLearningPlanStackSet } from "@/lib/guidedLearningPlan";
import type { GuidanceRouteContext } from "@/lib/guidanceRouteContext";
import { guidanceContextQuery } from "@/lib/guidanceRouteContext";
import { useExploreNav } from "@/lib/exploreNav";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { DomainRoleSummary } from "@/types/career";
import type { ProgrammeDomainConnection } from "@/types/career";
import type { CareerLearningResource, DataState } from "@/types/career";
import { CompactResourceRow } from "@/components/careerIntelligence/CompactResourceRow";
import { D078RelationshipPanel } from "@/components/careerIntelligence/D078RelationshipPanel";
import { resourcesForItem } from "@/components/careerIntelligence/resourceLinks";
import { d078RouteStacksFromSnapshot, d078SelectionFromSnapshot } from "@/lib/d078Snapshot";
import {
  createD078SeparateRoute,
  nextD078RouteId,
  normalizeD078RouteStacks,
  parseD078RouteStacks,
  removeD078RouteStack,
  selectD078RouteStack,
  serializeD078RouteStacks,
  updateD078RouteStackSelection,
  type D078RouteStackState,
} from "@/lib/d078RouteStacks";
import { useDetailScroll, useDetailViewportOverlay } from "@/components/careerIntelligence/DetailScrollContext";
import { usePersistentLearningPlanDock } from "@/components/careerIntelligence/PersistentLearningPlanDock";
import {
  INITIAL_D078_SELECTION,
  d078ApplicableLayerItems,
  d078GraphDataForTests,
  d078Node,
  d078TypedRelationshipEdges,
  projectD078Route,
  selectD078Area,
  toggleD078AddedItem,
  toggleD078Combination,
  toggleD078ComponentMethod,
  toggleD078Method,
  type D078Selection,
  type D078Projection,
} from "@/lib/d078RouteProjection";

const graph = d078GraphDataForTests();
const FIELD_TITLE = "Social Sciences & Behavioural Research";
const D078_WIDE_LAYOUT_MIN_WIDTH = 1280;

type D078RelationshipNavigation = {
  targetId: string | null;
  sourceId: string | null;
  register: (id: string, card?: View | null, title?: Text | null) => void;
  openTarget: (sourceId: string, targetId: string) => void;
  returnToSource: () => void;
};

const D078RelationshipNavigationContext = createContext<D078RelationshipNavigation | null>(null);

function useD078RelationshipNavigation() {
  return useContext(D078RelationshipNavigationContext);
}

function focusItemTitle(title: Text | null) {
  if (!title) return;
  const webTitle = title as unknown as { focus?: () => void };
  if (typeof webTitle.focus === "function") {
    webTitle.focus();
    return;
  }
  const tag = findNodeHandle(title);
  if (tag != null) void AccessibilityInfo.setAccessibilityFocus(tag);
}

function useD078StageEntry(direction: "vertical" | "horizontal", focusHeading = true) {
  const reducedMotion = useReducedMotion();
  const titleRef = useRef<Text | null>(null);
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const offset = useRef(new Animated.Value(reducedMotion ? 0 : direction === "vertical" ? 12 : 16)).current;

  useEffect(() => {
    const duration = reducedMotion ? 0 : 240;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(offset, { toValue: 0, duration, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished && focusHeading) focusItemTitle(titleRef.current);
    });
  }, [focusHeading, offset, opacity, reducedMotion]);

  return {
    titleRef,
    entryStyle: {
      opacity,
      transform: direction === "vertical" ? [{ translateY: offset }] : [{ translateX: offset }],
    },
  };
}

export function D078RelationshipNavigationProvider({ children }: { children: ReactNode }) {
  const detailScroll = useDetailScroll();
  const cardRefs = useRef(new Map<string, View>());
  const titleRefs = useRef(new Map<string, Text>());
  const returnState = useRef<{ sourceId: string; offset: number } | null>(null);
  const pendingFocus = useRef<{ id: string; offset?: number } | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const focusAtCard = (id: string, offset?: number) => {
    const card = cardRefs.current.get(id);
    const title = titleRefs.current.get(id) ?? null;
    const scroll = detailScroll?.scrollRef.current as unknown as {
      measureInWindow?: (callback: (x: number, y: number) => void) => void;
      scrollTo?: (options: { y: number; animated?: boolean }) => void;
    } | null;
    if (!card || !scroll?.scrollTo) {
      focusItemTitle(title);
      return;
    }

    const animate = !reducedMotion;
    const focusAfterScroll = () => setTimeout(() => focusItemTitle(title), animate ? 240 : 0);
    if (offset !== undefined) {
      scroll.scrollTo({ y: Math.max(0, offset), animated: animate });
      focusAfterScroll();
      return;
    }

    const cardMeasurable = card as unknown as { measureInWindow?: (callback: (x: number, y: number) => void) => void };
    if (!cardMeasurable.measureInWindow || !scroll.measureInWindow) {
      focusItemTitle(title);
      return;
    }
    cardMeasurable.measureInWindow((_cardX, cardY) => {
      scroll.measureInWindow?.((_scrollX, scrollY) => {
        const currentOffset = detailScroll?.scrollOffsetRef.current ?? 0;
        const nextOffset = d078RelationshipScrollOffset(currentOffset, cardY, scrollY);
        scroll.scrollTo?.({ y: Math.max(0, nextOffset), animated: animate });
        focusAfterScroll();
      });
    });
  };

  useEffect(() => {
    if (!targetId) return;
    const request = pendingFocus.current ?? { id: targetId };
    pendingFocus.current = null;
    const frame = requestAnimationFrame(() => focusAtCard(request.id, request.offset));
    return () => cancelAnimationFrame(frame);
  }, [targetId]);

  const value = useMemo<D078RelationshipNavigation>(() => ({
    targetId,
    sourceId,
    register: (id, card, title) => {
      if (card !== undefined) {
        if (card) cardRefs.current.set(id, card);
        else cardRefs.current.delete(id);
      }
      if (title !== undefined) {
        if (title) titleRefs.current.set(id, title);
        else titleRefs.current.delete(id);
      }
    },
    openTarget: (fromId, toId) => {
      returnState.current = { sourceId: fromId, offset: detailScroll?.scrollOffsetRef.current ?? 0 };
      pendingFocus.current = { id: toId };
      setSourceId(fromId);
      setTargetId(toId);
    },
    returnToSource: () => {
      const prior = returnState.current;
      if (!prior) return;
      pendingFocus.current = { id: prior.sourceId, offset: prior.offset };
      setTargetId(prior.sourceId);
      setSourceId(null);
      returnState.current = null;
    },
  }), [detailScroll, sourceId, targetId]);

  return <D078RelationshipNavigationContext.Provider value={value}>{children}</D078RelationshipNavigationContext.Provider>;
}

export function d078RelationshipScrollOffset(currentOffset: number, cardWindowY: number, scrollWindowY: number): number {
  return Math.max(0, currentOffset + cardWindowY - scrollWindowY - 20);
}

export function D078JourneyPage({ stage, tray, trayRevision, children }: { stage: "field" | "area" | "role"; tray: React.ReactNode; trayRevision?: string | number; children: React.ReactNode }) {
  const viewportOverlay = useDetailViewportOverlay();
  const persistentDock = usePersistentLearningPlanDock();
  const trayRef = useRef(tray);
  trayRef.current = tray;
  // The overlay is rendered by DetailScaffold, outside this subtree. A ref
  // keeps the latest tray content; the semantic revision asks the owner to
  // rerender only when the actual route selection changes (not every render).
  const renderViewportDock = React.useCallback(() => trayRef.current, [trayRevision]);
  useLayoutEffect(() => {
    if (persistentDock) {
      // Keep the same activation identity as the learner moves from field to
      // area to role. Dismissing the tray must remain effective across those
      // screens; a changed route selection (trayRevision) can reopen it.
      persistentDock.register(renderViewportDock, `${trayRevision ?? "initial"}`);
      return;
    }
    if (viewportOverlay) {
      viewportOverlay.setOverlay(() => <View pointerEvents="box-none" style={Platform.OS === "web" ? styles.learningPlanDockWeb : styles.learningPlanDockNative}>{renderViewportDock()}</View>);
      return () => viewportOverlay.setOverlay(null);
    }
  }, [persistentDock?.register, viewportOverlay?.setOverlay, renderViewportDock, stage, trayRevision]);
  return <View style={styles.journeyLayout} testID={`d078-full-screen-${stage}-stage`}>
    <View style={styles.readingColumn}>
      {children}
      {!viewportOverlay && !persistentDock ? <View style={styles.learningPlanFallbackDock}>{tray}</View> : null}
    </View>
  </View>;
}

export function isWideD078Layout(width: number, platform: string): boolean {
  return platform === "web" && width >= D078_WIDE_LAYOUT_MIN_WIDTH;
}

export function d078DefaultTrayMode(width: number, platform: string): GuidedLearningTrayMode {
  // Keep the plan dock compact on every viewport; the learner opens it when
  // they need to inspect or manage the selected route.
  void width;
  void platform;
  return "icon";
}

export function d078PrimaryActionStyle(width: number, platform: string): ViewStyle {
  return isWideD078Layout(width, platform)
    ? { minWidth: 160, alignSelf: "flex-start" }
    : { width: "100%" };
}

export function d078TraySheetStyle(width: number, mode: GuidedLearningTrayMode = "mid"): ViewStyle | undefined {
  if (mode === "full") return {
    width: "100%",
    height: "100%" as any,
    maxWidth: "100%" as any,
    maxHeight: "100%" as any,
    flex: 1,
    alignSelf: "stretch",
    margin: 0,
    borderWidth: 0,
    borderRadius: 0,
  };
  return width >= 768 ? {
    width: "100%",
    maxWidth: 560,
    alignSelf: "flex-end",
    marginRight: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  } : undefined;
}

export function shouldUseD078ViewportTrayDock(width: number, platform: string, hasViewportOverlay: boolean): boolean {
  return hasViewportOverlay;
}

function displayText(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/D078/g, "this field").replace(/\bESCO\b/g, "occupation classification").trim()
    : "";
}

function itemKind(node: ReturnType<typeof d078Node>): string {
  if (!node) return "Learning item";
  const raw = String(node.item_type ?? node.kind ?? "").toLowerCase();
  if (raw.includes("tool")) return "Tool";
  if (raw.includes("method")) return "Method";
  if (raw.includes("knowledge")) return "Knowledge";
  if (raw.includes("competenc")) return "Competency";
  if (raw.includes("skill")) return "Skill";
  if (raw.includes("cert")) return "Certification";
  return "Learning item";
}

function requirementLane(node: ReturnType<typeof d078Node>): "needed" | "useful" | "optional" | "conditional" {
  const lane = String(node?.requirement_lane ?? node?.requirement_level ?? "").toLowerCase();
  if (lane === "needed" || lane === "required") return "needed";
  if (lane === "optional") return "optional";
  if (lane === "conditional") return "conditional";
  return "useful";
}

function laneLabel(lane: "needed" | "useful" | "optional" | "conditional", condition?: string, methodSelected = true): string {
  if (lane === "needed") return !methodSelected && condition ? `Needed only when: ${displayText(condition)}` : "Needed for what you selected";
  if (lane === "optional") return "Optional. Open it if this question fits";
  if (lane === "conditional") return condition ? `Use when: ${displayText(condition)}` : "Use only when this condition applies";
  return "Useful. You can skip it";
}

export function ItemCard({ id, selection, onToggle, foundation = false, stepIndex, roleItem = false, resources, contextLevel }: {
  id: string;
  selection: D078Selection;
  onToggle?: (id: string) => void;
  foundation?: boolean;
  stepIndex?: number;
  roleItem?: boolean;
  resources?: CareerLearningResource[];
  contextLevel: "domain" | "subgroup" | "role";
}) {
  const { colors } = useTheme();
  const relationshipNavigation = useD078RelationshipNavigation();
  const [expanded, setExpanded] = useState(false);
  const [relatedTargetId, setRelatedTargetId] = useState<string | null>(null);
  const isExpanded = expanded || relationshipNavigation?.targetId === id;
  const node = d078Node(id);
  if (!node) return null;
  const routeProjection = projectD078Route(selection);
  const projectedIds = new Set([
    ...routeProjection.foundations.map((item) => item.id),
    ...selection.methodIds,
    ...Object.values(selection.componentMethodIds).flat(),
    ...selection.combinationIds.flatMap((combinationId) => {
      const design = graph.combination_designs.find((candidate) => candidate.id === combinationId);
      return design ? [...design.required_method_ids, ...(selection.componentMethodIds[combinationId] ?? [])] : [];
    }),
    ...routeProjection.domainItemIds,
    ...(contextLevel === "domain"
      ? routeProjection.toolIds
      : routeProjection.toolIds.filter((itemId) => itemId.startsWith("domain-item:") || itemId.startsWith("domain-method:"))),
    ...(contextLevel !== "domain" && selection.areaId ? routeProjection.areaItemIdsByArea[selection.areaId] ?? [] : []),
    ...(contextLevel === "role" ? routeProjection.roleItemIds : []),
    ...(contextLevel === "role" ? routeProjection.methodSpecificRoleItemIds : []),
  ]);
  const projectedRelationshipItems = [...projectedIds].flatMap((itemId) => {
    const item = d078Node(itemId);
    return item ? [{ id: itemId, label: item.label }] : [];
  });
  const routeContextLabel = [
    "Sociology",
    selection.areaId ? routeProjection.visibleAreas.find((area) => area.areaId === selection.areaId)?.label : undefined,
    contextLevel === "role" && selection.roleId
      ? routeProjection.visibleRoles.find((role) => role.roleId === selection.roleId)?.label
      : undefined,
  ].filter((part): part is string => Boolean(part)).join(" · ");
  const relatedTarget = relatedTargetId ? d078Node(relatedTargetId) : undefined;
  const lane = requirementLane(node);
  const scope = node.requirement_scope && typeof node.requirement_scope === "object"
    ? node.requirement_scope as { condition?: string }
    : undefined;
  const hasMethodChoice = selection.methodIds.length + selection.combinationIds.length
    + Object.values(selection.componentMethodIds).reduce((count, values) => count + values.length, 0) > 0;
  const meaning = displayText(node.meaning ?? node.plain_language_meaning ?? node.meaning_in_domain);
  const details = [
    ["What it is", meaning],
    ["Why it matters in this field", displayText(node.why_it_matters ?? node.field_context ?? node.meaning_in_domain)],
    ["How you might use it", displayText(node.contextual_use ?? node.how_used ?? node.use_case)],
    ["What you might produce", displayText(node.learner_output)],
  ].filter((entry) => Boolean(entry[1]));
  const limitations = Array.isArray(node.limitations) ? node.limitations.map(displayText).filter(Boolean) : [];
  const rawItemType = String(node.item_type ?? "resource");
  const itemTypes: import("@/types/career").CareerContextItem["itemType"][] = ["skill", "competency", "tool", "certification", "method", "knowledge", "resource"];
  const itemType = itemTypes.includes(rawItemType as typeof itemTypes[number]) ? rawItemType as typeof itemTypes[number] : "resource";
  const allowedOwners: CareerLearningResource["ownershipScope"][] = contextLevel === "domain"
    ? ["domain"]
    : contextLevel === "subgroup" ? ["domain", "subgroup"] : ["domain", "subgroup", "role"];
  const itemResources = resourcesForItem(resources?.filter((entry) => allowedOwners.includes(entry.ownershipScope)), itemType, node.label);
  const programmeLearningContext = node.programme_learning_context as {
    student_note?: string;
    course_refs?: Array<{ course_code: string; course_title: string; evidence: string }>;
  } | undefined;
  const added = selection.addedItemIds.includes(id);
  return (
    <View
      ref={(card) => relationshipNavigation?.register(id, card, undefined)}
      style={[styles.itemCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
    >
      <Text style={[styles.type, { color: colors.textRole.muted }]}>{itemKind(node)}</Text>
      <Text
        ref={(title) => relationshipNavigation?.register(id, undefined, title)}
        accessible
        accessibilityRole="header"
        numberOfLines={2}
        style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}
      >{roleItem ? titleCase(node.label) : node.label}</Text>
      {stepIndex ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{`Step ${stepIndex} of 3`}</Text> : null}
      <Text style={[styles.lane, { color: lane === "needed" ? colors.accentRole.action : colors.textRole.muted }]}>{foundation ? "Compulsory foundation" : laneLabel(lane, scope?.condition, hasMethodChoice)}</Text>
      {!foundation && hasMethodChoice && projectedIds.has(id) ? <Text style={[styles.meta, { color: colors.accentRole.action }]}>Connected to the method or design you selected</Text> : null}
      {meaning ? <Text numberOfLines={2} style={[styles.summary, { color: colors.textRole.secondary }]}>{meaning}</Text> : null}
      <View style={styles.actions}>
        <RouteButton label={isExpanded ? "Hide" : "See more"} accessibilityLabel={`${isExpanded ? "Hide details for" : "See more about"} ${node.label}`} variant="secondary" onPress={() => setExpanded((value) => !value)} />
        {!foundation && onToggle ? <RouteButton label={added ? "Added" : "Add this"} accessibilityLabel={`${added ? "Remove" : "Add"} ${node.label} ${added ? "from" : "to"} your learning`} variant={added ? "selected" : "quiet"} onPress={() => onToggle(id)} /> : null}
      </View>
      {isExpanded ? <View style={styles.detailSections}>
        {relationshipNavigation?.targetId === id && relationshipNavigation.sourceId ? <RouteButton
          label={`Back to ${d078Node(relationshipNavigation.sourceId)?.label ?? "the previous item"}`}
          onPress={relationshipNavigation.returnToSource}
          variant="secondary"
          style={styles.hugSecondaryAction}
        /> : null}
        {details.map(([heading, body]) => <View key={heading} style={[styles.detailSection, { borderTopColor: colors.borderRole.subtle }]}>
          <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{heading}</Text>
          <Text style={[styles.detailBody, { color: colors.textRole.secondary }]}>{body}</Text>
        </View>)}
        {programmeLearningContext?.student_note ? <View style={[styles.detailSection, { borderTopColor: colors.borderRole.subtle }]} testID={`d078-curriculum-context-${id}`}>
            <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How this relates to your Sociology curriculum</Text>
            <Text style={[styles.detailBody, { color: colors.textRole.secondary }]}>{displayText(programmeLearningContext.student_note)}</Text>
            {programmeLearningContext.course_refs?.map((course, index) => <View key={`${course.course_code}-${index}`} style={styles.contributionRow}>
              <Text style={[styles.meta, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{course.course_code} · {course.course_title}</Text>
              <Text style={[styles.detailBody, { color: colors.textRole.secondary }]}>{displayText(course.evidence)}</Text>
            </View>)}
          </View> : null}
        {limitations.length ? <View style={[styles.detailSection, { borderTopColor: colors.borderRole.subtle }]}><Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Keep in mind</Text>{limitations.map((line, index) => <Text key={`${id}-limit-${index}`} style={[styles.detailBody, { color: colors.textRole.secondary }]}>{line}</Text>)}</View> : null}
        <D078RelationshipPanel
          currentItem={{ id, label: node.label }}
          projectedItems={projectedRelationshipItems}
          typedEdges={d078TypedRelationshipEdges()}
          routeContextLabel={routeContextLabel}
          onUseTarget={(target) => {
            if (!foundation && onToggle && projectedIds.has(target.id)) onToggle(target.id);
          }}
          onOpenTarget={(target) => relationshipNavigation
            ? relationshipNavigation.openTarget(id, target.id)
            : setRelatedTargetId(target.id)}
        />
        {!relationshipNavigation && relatedTarget ? <View style={styles.relatedPreview}>
          <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Connected option</Text>
          <Text style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{relatedTarget.label}</Text>
          {typeof relatedTarget.meaning === "string" ? <View style={styles.detailSection}>
            <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What it is</Text>
            <Text style={[styles.detailBody, { color: colors.textRole.secondary }]}>{displayText(relatedTarget.meaning)}</Text>
          </View> : null}
          {typeof relatedTarget.contextual_use === "string" ? <View style={styles.detailSection}>
            <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How it may be used</Text>
            <Text style={[styles.detailBody, { color: colors.textRole.secondary }]}>{displayText(relatedTarget.contextual_use)}</Text>
          </View> : null}
          <RouteButton label={`Back to ${roleItem ? titleCase(node.label) : node.label}`} onPress={() => setRelatedTargetId(null)} variant="secondary" style={styles.hugSecondaryAction} />
        </View> : null}
        {itemResources.length ? <View style={styles.detailSection}>
          <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Learning resources</Text>
          <View style={styles.resourceList}>
            {itemResources.map((itemResource) => <CompactResourceRow
              key={`${itemResource.url}:${itemResource.targetName}`}
              resource={itemResource}
              contextLevel={itemResource.ownershipScope === "audit_only" ? contextLevel : itemResource.ownershipScope ?? contextLevel}
            />)}
          </View>
        </View> : null}
        {!meaning ? <Text style={[styles.detailBody, { color: colors.textRole.muted }]}>A plain-language explanation has not been provided for this item yet.</Text> : null}
      </View> : null}
    </View>
  );
}

function ItemLane({ title, ids, selection, onToggle, foundations = false, roleItems = false, resources, contextLevel = "domain" }: {
  title: string;
  ids: string[];
  selection: D078Selection;
  onToggle?: (id: string) => void;
  foundations?: boolean;
  roleItems?: boolean;
  resources?: CareerLearningResource[];
  contextLevel?: "domain" | "subgroup" | "role";
}) {
  const { colors } = useTheme();
  if (!ids.length) return null;
  return <View style={styles.itemLane}>
    <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text>
    {ids.map((id, index) => <ItemCard key={id} id={id} selection={selection} onToggle={onToggle} foundation={foundations} stepIndex={foundations ? index + 1 : undefined} roleItem={roleItems} resources={resources} contextLevel={contextLevel} />)}
  </View>;
}

export function d078MotionOffset(reducedMotion: boolean, distance: number): number {
  return reducedMotion ? 0 : distance;
}

export function D078AreaResults({ projection, onOpenArea, headingRef }: {
  projection: D078Projection;
  onOpenArea: (areaId: string) => void;
  headingRef?: React.RefObject<Text | null>;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const primaryActionStyle = d078PrimaryActionStyle(width, Platform.OS);
  const reducedMotion = useReducedMotion();
  const [renderedAreas, setRenderedAreas] = useState<D078Projection["visibleAreas"]>([]);
  const renderedAreasRef = useRef(renderedAreas);
  renderedAreasRef.current = renderedAreas;
  const latestVisibleIds = useRef(new Set<string>());
  const areaAnimations = useRef(new Map<string, { opacity: Animated.Value; offset: Animated.Value; exiting: boolean; animation?: Animated.CompositeAnimation }>());

  useEffect(() => {
    const nextAreas = projection.visibleAreas;
    const nextIds = new Set(nextAreas.map((area) => area.areaId));
    latestVisibleIds.current = nextIds;
    const existing = new Map(renderedAreasRef.current.map((area) => [area.areaId, area]));
    const entering: Array<{ id: string; state: NonNullable<ReturnType<typeof areaAnimations.current.get>> }> = [];
    const returning: Array<{ id: string; state: NonNullable<ReturnType<typeof areaAnimations.current.get>> }> = [];
    const nextRendered = nextAreas.map((area) => {
      const prior = existing.get(area.areaId);
      const state = areaAnimations.current.get(area.areaId);
      if (prior && state?.exiting) {
        state.animation?.stop();
        state.exiting = false;
        returning.push({ id: area.areaId, state });
      }
      if (prior) return area;
      const entry = state ?? {
        opacity: new Animated.Value(0),
        offset: new Animated.Value(d078MotionOffset(reducedMotion, 8)),
        exiting: false,
      };
      entry.exiting = false;
      areaAnimations.current.set(area.areaId, entry);
      entering.push({ id: area.areaId, state: entry });
      return area;
    });
    const exitingAreas = renderedAreasRef.current.filter((area) => !nextIds.has(area.areaId));
    const leaving: Array<{ area: typeof exitingAreas[number]; state: NonNullable<ReturnType<typeof areaAnimations.current.get>> }> = [];
    for (const area of exitingAreas) {
      const state = areaAnimations.current.get(area.areaId);
      if (!state || state.exiting) continue;
      state.exiting = true;
      state.animation?.stop();
      state.animation = Animated.parallel([
        Animated.timing(state.opacity, { toValue: 0, duration: reducedMotion ? 0 : 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(state.offset, { toValue: d078MotionOffset(reducedMotion, 8), duration: reducedMotion ? 0 : 160, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]);
      leaving.push({ area, state });
    }
    setRenderedAreas([...nextRendered, ...exitingAreas]);
    leaving.forEach(({ area, state }) => state.animation?.start(({ finished }) => {
      if (!finished || latestVisibleIds.current.has(area.areaId)) return;
      areaAnimations.current.delete(area.areaId);
      setRenderedAreas((current) => current.filter((entry) => entry.areaId !== area.areaId));
    }));

    const animateIn = (state: NonNullable<ReturnType<typeof areaAnimations.current.get>>, delay: number) => {
      state.animation?.stop();
      state.animation = Animated.sequence([
        Animated.delay(reducedMotion ? 0 : delay),
        Animated.parallel([
          Animated.timing(state.opacity, { toValue: 1, duration: reducedMotion ? 0 : 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(state.offset, { toValue: 0, duration: reducedMotion ? 0 : 220, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        ]),
      ]);
      state.animation.start();
    };
    entering.forEach(({ state }, index) => animateIn(state, index * (reducedMotion ? 0 : 30)));
    returning.forEach(({ state }) => animateIn(state, 0));
  }, [projection.visibleAreas, reducedMotion]);

  useEffect(() => () => {
    areaAnimations.current.forEach((state) => state.animation?.stop());
  }, []);

  return <View style={styles.section}>
    <Text ref={headingRef} accessibilityRole="header" style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Areas for what you selected</Text>
    <Text style={[styles.body, { color: colors.textRole.secondary }]}>Only areas connected to your selected method or named combined research design appear here. The order reflects the reviewed route evidence for your selection.</Text>
    <View style={styles.areaCardList}>{renderedAreas.map((area) => {
      const transition = areaAnimations.current.get(area.areaId);
      const exiting = Boolean(transition?.exiting);
      return <Animated.View key={area.areaId} style={[styles.areaCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }, transition ? { opacity: transition.opacity, transform: [{ translateY: transition.offset }] } : null]}>
      <Text style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{area.label}</Text>
      <Text style={[styles.summary, { color: colors.textRole.secondary }]}>{supportReason(area, projection)}</Text>
      {area.taskFamilyIds.map((id) => {
        const label = d078Node(id)?.label;
        return label ? <Text key={id} style={[styles.body, { color: colors.textRole.secondary }]}>{label}</Text> : null;
      })}
      <Text style={[styles.meta, { color: colors.textRole.muted }]}>Selecting this area opens its full-screen details and the roles connected to your chosen method.</Text>
      <RouteButton label="Select area" accessibilityLabel={`Select area ${area.label}`} variant="primary" style={primaryActionStyle} disabled={exiting} onPress={() => onOpenArea(area.areaId)} />
    </Animated.View>;
    })}</View>
  </View>;
}

function routeSelectionQuery(selection: D078Selection, context: GuidanceRouteContext, routeStacks?: D078RouteStackState): string {
  const base = guidanceContextQuery(context, { includeProgrammeId: true });
  const d078 = `d078_selection=${encodeURIComponent(JSON.stringify(selection))}`;
  const stacks = routeStacks ? `d078_route_stacks=${encodeURIComponent(serializeD078RouteStacks(routeStacks))}` : "";
  return [base, d078, stacks].filter(Boolean).join("&");
}

function initialD078RouteStackState(selection: D078Selection, initial?: D078RouteStackState): D078RouteStackState {
  const state = normalizeD078RouteStacks(initial?.stacks, selection, initial?.activeStackId);
  return updateD078RouteStackSelection(state, state.activeStackId, selection);
}

function updateActiveD078Selection(
  setState: React.Dispatch<React.SetStateAction<D078RouteStackState>>,
  nextSelection: D078Selection | ((current: D078Selection) => D078Selection),
): void {
  setState((current) => {
    const active = current.stacks.find((stack) => stack.id === current.activeStackId);
    if (!active) return current;
    const next = typeof nextSelection === "function" ? nextSelection(active.selection) : nextSelection;
    return updateD078RouteStackSelection(current, current.activeStackId, next);
  });
}

function d078SnapshotKey(programmeId?: string): string {
  return `${programmeId || "programme-not-selected"}::D078`;
}

function d078TrayContext(selection: D078Selection, projection: D078Projection, programmeName?: string, context: GuidanceRouteContext = {}, stackId?: string, active?: boolean): D078TrayContext {
  const choices: D078TrayChoice[] = [
    ...projection.methods.filter((method) => selection.methodIds.includes(method.id)).map((method) => ({ id: method.id, label: method.label, kind: "method" as const })),
    ...projection.combinations.filter((combo) => selection.combinationIds.includes(combo.id)).map((combo) => ({ id: combo.id, label: combo.label, kind: "combination" as const })),
    ...Object.entries(selection.componentMethodIds).flatMap(([comboId, methodIds]) => methodIds.map((id) => ({
      id,
      label: projection.methods.find((method) => method.id === id)?.label ?? id,
      kind: "component_method" as const,
      combinationId: comboId,
    }))),
  ];
  const itemIds = new Set([
    ...projection.domainItemIds,
    ...projection.toolIds,
    ...d078ApplicableLayerItems(2, selection),
    ...d078ApplicableLayerItems(3, selection),
    ...(selection.areaId ? projection.areaItemIdsByArea[selection.areaId] ?? [] : []),
    ...projection.roleItemIds,
  ]);
  const areaItemIds = new Set(selection.areaId ? projection.areaItemIdsByArea[selection.areaId] ?? [] : []);
  const roleItemIds = new Set(projection.roleItemIds);
  const selectedItems = selection.addedItemIds.filter((id) => itemIds.has(id)).map((id) => ({
    id,
    label: d078Node(id)?.label ?? id,
    lane: laneLabel(requirementLane(d078Node(id))),
    contextLevel: roleItemIds.has(id) ? "role" as const : areaItemIds.has(id) ? "area" as const : "domain" as const,
  }));
  return {
    stackId,
    active,
    routeLabel: [programmeName, "Social Sciences"].filter(Boolean).join(" · "),
    programmeLabel: programmeName,
    programmeId: context.programmeId,
    institutionContextLabel: context.schoolId ? "Institution context selected" : undefined,
    institutionId: context.schoolId,
    domainLabel: "Social Sciences",
    domainId: context.domainId,
    choices,
    foundations: projection.foundations.map((foundation) => foundation.label),
    selectedItems,
    areaLabel: projection.visibleAreas.find((area) => area.areaId === selection.areaId)?.label,
    areaId: selection.areaId,
    roleLabel: projection.visibleRoles.find((role) => role.roleId === selection.roleId)?.label,
    roleId: selection.roleId,
    onRemoveChoice: () => undefined,
    onRemoveItem: () => undefined,
  };
}

export function d078ShareMessage(route: D078TrayContext, programmeName?: string): string {
  return [
    `My Sociology learning route${programmeName ? ` from ${programmeName}` : ""}`,
    route.institutionContextLabel,
    "Field: Social Sciences",
    `Foundations carried forward: ${route.foundations.length ? route.foundations.join("; ") : "not loaded"}`,
    route.choices.length ? `Methods and designs selected: ${route.choices.map((choice) => choice.label).join(", ")}` : "No investigation method or design selected yet.",
    route.areaLabel ? `Area of specialization: ${route.areaLabel}` : "No area of specialization selected yet.",
    route.roleLabel ? `Role explored: ${route.roleLabel}` : "No role selected; this route stops at the selected level.",
    route.selectedItems.length ? `Additional learning choices (${route.selectedItems.length}): ${route.selectedItems.map((item) => `${item.label} — ${item.lane}`).join("; ")}` : "No additional learning items selected.",
  ].join("\n");
}

function D078JourneyTray({ selection, setSelection, projection, context, programmeName, onRemoveChoice, routeStackState, setRouteStackState, onActivateRoute }: {
  selection: D078Selection;
  setSelection: (next: D078Selection) => void;
  projection: D078Projection;
  context: GuidanceRouteContext;
  programmeName?: string;
  onRemoveChoice?: (next: D078Selection) => void;
  routeStackState: D078RouteStackState;
  setRouteStackState: (next: D078RouteStackState) => void;
  onActivateRoute?: (selection: D078Selection, routeState: D078RouteStackState) => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const persistentDock = usePersistentLearningPlanDock();
  // The same small bottom dock is used on desktop and mobile. A permanent
  // right rail consumed page width while the plan was collapsed.
  const desktopRail = false;
  const [mode, setMode] = useState<GuidedLearningTrayMode>(() => context.areaId || context.roleId ? "compact" : "icon");
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const draftSaveSequence = useRef(0);
  const draftSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const routeContexts = routeStackState.stacks.map((stack) => {
    const stackProjection = projectD078Route(stack.selection);
    const route = d078TrayContext(stack.selection, stackProjection, programmeName, context, stack.id, stack.id === routeStackState.activeStackId);
    route.onActivate = () => {
      const next = selectD078RouteStack(routeStackState, stack.id);
      setRouteStackState(next);
      onActivateRoute?.(stack.selection, next);
    };
    route.onRemoveStack = routeStackState.stacks.length > 1
      ? () => {
        const next = removeD078RouteStack(routeStackState, stack.id);
        setRouteStackState(next);
      }
      : undefined;
    route.onRemoveChoice = (choice) => {
      const nextSelection = choice.kind === "method"
        ? toggleD078Method(stack.selection, choice.id)
        : choice.kind === "combination"
          ? toggleD078Combination(stack.selection, choice.id)
          : choice.combinationId ? toggleD078ComponentMethod(stack.selection, choice.combinationId, choice.id) : stack.selection;
      const next = updateD078RouteStackSelection(routeStackState, stack.id, nextSelection);
      setRouteStackState(next);
      if (stack.id === routeStackState.activeStackId) (onRemoveChoice ?? setSelection)(nextSelection);
    };
    route.onRemoveItem = (id) => {
      const nextSelection = toggleD078AddedItem(stack.selection, id);
      const next = updateD078RouteStackSelection(routeStackState, stack.id, nextSelection);
      setRouteStackState(next);
      if (stack.id === routeStackState.activeStackId) setSelection(nextSelection);
    };
    return route;
  });
  const choiceCount = selection.methodIds.length + selection.combinationIds.length + Object.values(selection.componentMethodIds).reduce((sum, methods) => sum + methods.length, 0);
  const dropKey = `${choiceCount}:${selection.addedItemIds.length}`;
  const routeRevision = JSON.stringify(routeStackState);
  const lastDraftRevision = useRef("");
  useEffect(() => {
    if (lastDraftRevision.current === routeRevision) return;
    lastDraftRevision.current = routeRevision;
    const hasSelection = routeStackState.stacks.some((stack) => {
      const value = stack.selection;
      return value.methodIds.length > 0 || value.combinationIds.length > 0
        || Object.values(value.componentMethodIds).some((ids) => ids.length > 0)
        || value.addedItemIds.length > 0 || Boolean(value.areaId || value.roleId);
    });
    if (!hasSelection) return;
    const sequence = ++draftSaveSequence.current;
    setNotice(null);
    // Saving is deliberately detached from the selection render. The tray and
    // check state are already visible before this queued write can begin.
    draftSaveQueue.current = draftSaveQueue.current.catch(() => undefined).then(async () => {
      try {
        const result = await saveD078Selection(selection, context, programmeName, routeStackState);
        if (sequence === draftSaveSequence.current && result !== "saved") {
          setNotice("Held on this device. It will save when you are online.");
        }
      } catch {
        if (sequence === draftSaveSequence.current) setNotice("Held on this device. It will save when you are online.");
      }
    });
  }, [routeRevision, routeStackState, selection, context, programmeName]);
  const previousDropKey = useRef(dropKey);
  const displayMode = previousDropKey.current !== dropKey ? "compact" : mode;
  useEffect(() => {
    if (previousDropKey.current === dropKey) return;
    previousDropKey.current = dropKey;
    setMode("compact");
  }, [dropKey]);
  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const saved = await saveD078Selection(selection, context, programmeName, routeStackState);
      setNotice(saved === "saved" ? "Saved this route to My World." : "Held on this device. It will save when you are online.");
    } catch {
      setNotice("Held on this device. It will save when you are online.");
    } finally {
      setSaving(false);
    }
  };
  const onPrint = async () => {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const saved = await saveD078Selection(selection, context, programmeName, routeStackState);
      if (saved !== "saved") {
        setNotice("Your route is saved on this device and will sync later. Download its report after it has synced.");
        return;
      }
      const opened = await openStudentDocument("/api/student/report.docx", { download: "sifter-sociology-learning-route.docx" });
      setNotice(opened
        ? "Your Sociology learning-route report was downloaded."
        : "Your route was saved, but its report is unavailable right now. Try again when online.");
    } catch {
      setNotice("Could not prepare the report right now. Try again when you are online.");
    } finally {
      setSaving(false);
    }
  };
  const onShare = () => {
    const message = routeContexts.map((route, index) => `${routeContexts.length > 1 ? `Route ${index + 1}\n` : ""}${d078ShareMessage(route, programmeName)}`).join("\n\n");
    void shareTextSummary("My LevelUp learning route", message).then((shared) => setNotice(shared ? "Your route summary is ready to share." : "Sharing is unavailable right now. Save the route and try again."));
  };
  const renderTray = (initialMode: GuidedLearningTrayMode, forceIcon = false) => <GuidedLearningTray
      stackSet={buildLearningPlanStackSet({ routes: [] })}
      d078Routes={routeContexts}
      onCreateD078Route={() => {
        const next = createD078SeparateRoute(routeStackState, nextD078RouteId(routeStackState));
        setRouteStackState(next);
      }}
      initialMode={initialMode}
      forceIcon={forceIcon}
      dropKey={dropKey}
      pendingDropLabel="Added to your route"
      onModeChange={setMode}
      onDismiss={persistentDock?.dismiss}
      style={initialMode === "full" ? styles.trayFull : initialMode === "mid" ? [styles.trayPanelMid, { width: Math.max(200, Math.min(420, width - 32)) }] : initialMode === "compact" ? [styles.trayPanelCompact, { width: Math.max(200, Math.min(340, width - 32)) }] : undefined}
      onSave={onSave}
      onPrint={onPrint}
      onShare={onShare}
    />;
  if (!desktopRail) return <>
    <View style={[styles.mobileTrayDock, Platform.OS === "web" ? styles.mobileTrayDockWeb : styles.mobileTrayDockNative]}>
      {renderTray(displayMode === "full" ? "icon" : displayMode, displayMode === "full")}
    </View>
    <Modal transparent visible={displayMode === "full"} animationType={reducedMotion ? "none" : "slide"} onRequestClose={() => setMode("icon")}>
      <View style={styles.mobileTrayBackdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close learning plan tray" onPress={() => setMode("icon")} style={StyleSheet.absoluteFill} />
        <View style={[styles.mobileTraySheet, d078TraySheetStyle(width, "full"), {
          borderTopWidth: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          paddingTop: Math.max(insets.top, Spacing.md),
          paddingBottom: Math.max(insets.bottom, Spacing.md),
          paddingLeft: Math.max(insets.left, Spacing.md),
          paddingRight: Math.max(insets.right, Spacing.md),
        }, { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle }]}>
          {renderTray("full")}
          {saving || notice ? <Text accessibilityLiveRegion="polite" style={styles.trayNotice}>{saving ? "Saving your route…" : notice}</Text> : null}
        </View>
      </View>
    </Modal>
  </>;
  return <>
    <View style={[styles.trayWrap, mode === "full" && styles.trayWrapFull]}>
      {renderTray(mode === "full" ? "icon" : mode, mode === "full")}
      {mode !== "full" && (saving || notice) ? <Text accessibilityLiveRegion="polite" style={styles.trayNotice}>{saving ? "Saving your route…" : notice}</Text> : null}
    </View>
    <Modal transparent visible={mode === "full"} animationType={reducedMotion ? "none" : "fade"} onRequestClose={() => setMode("icon")}>
      <View style={styles.desktopFullTrayBackdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close full-size learning plan tray" onPress={() => setMode("icon")} style={StyleSheet.absoluteFill} />
        <View style={[styles.desktopFullTraySurface, { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle }, {
          marginTop: Math.max(insets.top, 12),
          marginBottom: Math.max(insets.bottom, 12),
          marginLeft: Math.max(insets.left, 12),
          marginRight: Math.max(insets.right, 12),
        }]}>
          {renderTray("full")}
          {saving || notice ? <Text accessibilityLiveRegion="polite" style={styles.trayNotice}>{saving ? "Saving your route…" : notice}</Text> : null}
        </View>
      </View>
    </Modal>
  </>;
}

async function saveD078Selection(selection: D078Selection, context: GuidanceRouteContext, programmeName?: string, routeStackState?: D078RouteStackState): Promise<"saved" | "pending"> {
  const existing = context.guidanceStudentId
    ? await provisioningData.getGuidancePath(context.guidanceStudentId)
    : await careerData.getGuidancePath();
  const currentPath = guidancePathPayload(existing);
  const now = new Date().toISOString();
  const snapshotId = `guided-d078-${Date.now()}`;
  const nextSnapshot = buildD078SnapshotForSave(
    currentPath,
    selection,
    context.programmeId,
    programmeName,
    routeStackState,
    snapshotId,
    now,
  );
  const routeEntries = routeStackState?.stacks ?? [{ id: "d078-route-1", selection }];
  const activeStackId = routeStackState?.activeStackId ?? "d078-route-1";
  const activeSelection = routeEntries.find((stack) => stack.id === activeStackId)?.selection ?? selection;
  const nextPath = {
    ...currentPath,
    learningPlanSnapshot: nextSnapshot,
    learningPlanSnapshots: [...(Array.isArray(currentPath.learningPlanSnapshots) ? currentPath.learningPlanSnapshots : []).filter((entry: any) => entry?.snapshotId !== snapshotId), nextSnapshot].slice(-20),
    resume: { ...(currentPath.resume && typeof currentPath.resume === "object" ? currentPath.resume as Record<string, unknown> : {}), status: "in_progress", stage: activeSelection.roleId ? "roles" : activeSelection.areaId ? "subgroups" : "domains" },
  };
  if (context.guidanceStudentId) {
    await provisioningData.saveGuidancePath(context.guidanceStudentId, nextPath);
    return "saved";
  }
  const result = await careerData.saveGuidancePath({ source: "explore", path: nextPath });
  return result.status === "real" ? "saved" : "pending";
}

export function buildD078SnapshotForSave(
  currentPath: Record<string, any>,
  selection: D078Selection,
  programmeId: string | undefined,
  programmeName: string | undefined,
  routeStackState: D078RouteStackState | undefined,
  snapshotId: string,
  now: string,
) {
  const oldSnapshot = currentPath.learningPlanSnapshot && typeof currentPath.learningPlanSnapshot === "object"
    ? currentPath.learningPlanSnapshot as Record<string, unknown>
    : {};
  const routeKey = d078SnapshotKey(programmeId);
  const previousSelections = oldSnapshot.d078SelectionsByRoute && typeof oldSnapshot.d078SelectionsByRoute === "object"
    ? oldSnapshot.d078SelectionsByRoute as Record<string, unknown>
    : {};
  const routePrefix = `${routeKey}::`;
  const retainedSelections = Object.fromEntries(Object.entries(previousSelections).filter(([key]) => key !== routeKey && !key.startsWith(routePrefix)));
  const routeEntries = routeStackState?.stacks ?? [{ id: "d078-route-1", selection }];
  const activeStackId = routeStackState?.activeStackId ?? "d078-route-1";
  const keyedSelections = Object.fromEntries(routeEntries.map((stack) => [
    stack.id === "d078-route-1" ? routeKey : `${routeKey}::${stack.id}`,
    stack.selection,
  ]));
  const nextSnapshot = {
    ...oldSnapshot,
    snapshotId,
    stacks: Array.isArray(oldSnapshot.stacks) ? oldSnapshot.stacks : [],
    routeWarnings: Array.isArray(oldSnapshot.routeWarnings) ? oldSnapshot.routeWarnings : [],
    d078SelectionsByRoute: { ...retainedSelections, ...keyedSelections },
    d078RouteStackIds: routeEntries.map((stack) => stack.id),
    d078ActiveStackId: activeStackId,
    dataVersion: "guided-experience-d078-v1",
    // Each Save creates a new immutable archive version, so its timestamp
    // must describe this version rather than inherit the version it copied.
    createdAt: now,
    updatedAt: now,
    share: oldSnapshot.share && typeof oldSnapshot.share === "object" ? oldSnapshot.share : { visibility: "private" },
    reportPathContext: {
      ...(oldSnapshot.reportPathContext && typeof oldSnapshot.reportPathContext === "object" ? oldSnapshot.reportPathContext as Record<string, unknown> : {}),
      programme: currentPath.programme ?? (programmeName ? { name: programmeName, id: programmeId } : undefined),
      domains: currentPath.domains ?? [{ id: "D078", name: "Social Sciences" }],
    },
  };
  return nextSnapshot;
}

async function loadSavedD078RouteStacks(context: GuidanceRouteContext): Promise<D078RouteStackState | null> {
  const existing = context.guidanceStudentId
    ? await provisioningData.getGuidancePath(context.guidanceStudentId)
    : await careerData.getGuidancePath();
  const path = guidancePathPayload(existing);
  const snapshot = path.learningPlanSnapshot;
  if (!snapshot || typeof snapshot !== "object") return null;
  return d078RouteStacksFromSnapshot(snapshot, context.programmeId);
}

export function savedD078Selection(path: Record<string, any>, programmeId?: string): D078Selection | null {
  const snapshot = path.learningPlanSnapshot;
  if (!snapshot || typeof snapshot !== "object") return null;
  return d078SelectionFromSnapshot(snapshot, programmeId) as D078Selection | null;
}

export function d078RoleStillVisible(selection: D078Selection, roleId?: string, areaId?: string): boolean {
  if (!roleId || !areaId) return false;
  return projectD078Route(selection).visibleRoles.some((role) => role.roleId === roleId && role.areaId === areaId);
}

export function resolveD078RoleRouteId(selection: D078Selection, areaId: string | undefined, roleId?: string, roleName?: string): string | undefined {
  if (!areaId) return undefined;
  const visibleRole = projectD078Route(selection).visibleRoles.find((role) => role.areaId === areaId
    && (roleId ? role.roleId === roleId : roleName ? normalizeLabel(role.label) === normalizeLabel(roleName) : false));
  return visibleRole?.roleId;
}

export function d078PickerSelection(selection: D078Selection): D078Selection {
  return { ...selection, areaId: undefined, roleId: undefined };
}

type ProvisionedGuidancePath = { path: Record<string, any> } | null;
type SelfServiceGuidancePath = DataState<GuidanceReportPath | null>;

/** Keep the provisioned-student and self-service API envelopes distinct. */
export function guidancePathPayload(response: ProvisionedGuidancePath | SelfServiceGuidancePath | undefined): GuidanceReportPath["path"] {
  if (!response) return {};
  if ("status" in response) {
    return response.status === "real" ? response.data?.path ?? {} : {};
  }
  return response.path ?? {};
}

export function parseD078Selection(value?: string | string[]): D078Selection {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return INITIAL_D078_SELECTION;
  try {
    const parsed = JSON.parse(raw) as Partial<D078Selection>;
    return {
      methodIds: Array.isArray(parsed.methodIds) ? parsed.methodIds.filter((id): id is string => typeof id === "string") : [],
      combinationIds: Array.isArray(parsed.combinationIds) ? parsed.combinationIds.filter((id): id is string => typeof id === "string") : [],
      componentMethodIds: parsed.componentMethodIds && typeof parsed.componentMethodIds === "object" ? parsed.componentMethodIds as Record<string, string[]> : {},
      areaId: typeof parsed.areaId === "string" ? parsed.areaId : undefined,
      roleId: typeof parsed.roleId === "string" ? parsed.roleId : undefined,
      addedItemIds: Array.isArray(parsed.addedItemIds) ? parsed.addedItemIds.filter((id): id is string => typeof id === "string") : [],
    };
  } catch {
    return INITIAL_D078_SELECTION;
  }
}

export function D078MethodAwareJourney({ domainKey, programmeName, programmeConnection, guidanceContext, initialSelection, initialUndoSelection, initialRouteStacks, domainRoles = [], domainResources = [] }: {
  domainKey: string;
  programmeName?: string;
  programmeConnection?: ProgrammeDomainConnection | null;
  guidanceContext: GuidanceRouteContext;
  initialSelection?: D078Selection;
  initialUndoSelection?: D078Selection;
  initialRouteStacks?: D078RouteStackState;
  domainRoles?: DomainRoleSummary[];
  domainResources?: CareerLearningResource[];
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const [routeStackState, setRouteStackState] = useState<D078RouteStackState>(() => initialD078RouteStackState(initialSelection ?? INITIAL_D078_SELECTION, initialRouteStacks));
  const selection = routeStackState.stacks.find((stack) => stack.id === routeStackState.activeStackId)?.selection ?? INITIAL_D078_SELECTION;
  const setSelection = (next: D078Selection | ((current: D078Selection) => D078Selection)) => updateActiveD078Selection(setRouteStackState, next);
  const selectionTouched = useRef(false);
  const methodChangePending = useRef(false);
  const clearMethodChangePending = useRef(false);
  const previousChoiceCount = useRef(0);
  const areaResultsHeadingRef = useRef<Text | null>(null);
  const methodPickerHeadingRef = useRef<Text | null>(null);
  const detailScroll = useDetailScroll();
  const d078ScrollRef = detailScroll?.scrollRef;
  const [undoSelection, setUndoSelection] = useState<D078Selection | undefined>(initialUndoSelection);
  // Use the actual route payload as the synchronization key. A boolean key
  // misses replacement of one undo snapshot by another, and leaving state
  // untouched when the query disappears can preserve a stale Undo notice.
  const initialUndoSelectionKey = initialUndoSelection ? JSON.stringify(initialUndoSelection) : "";
  const reducedMotion = useReducedMotion();
  const stageEntry = useD078StageEntry("vertical", !initialUndoSelection);
  const resultOpacity = useRef(new Animated.Value(1)).current;
  const resultOffset = useRef(new Animated.Value(0)).current;
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [outcomesExpanded, setOutcomesExpanded] = useState(false);
  const projection = useMemo(() => projectD078Route(selection), [selection]);
  useEffect(() => {
    if (!methodChangePending.current) {
      previousChoiceCount.current = selection.methodIds.length + selection.combinationIds.length
        + Object.values(selection.componentMethodIds).reduce((count, ids) => count + ids.length, 0);
      return;
    }
    methodChangePending.current = false;
    const cleared = clearMethodChangePending.current;
    clearMethodChangePending.current = false;
    const count = projection.visibleAreas.length;
    const labels = [
      ...projection.methods.filter((method) => selection.methodIds.includes(method.id)).map((method) => method.label),
      ...projection.combinations.filter((combo) => selection.combinationIds.includes(combo.id)).map((combo) => combo.label),
      ...Object.values(selection.componentMethodIds).flatMap((ids) => ids.map((id) => d078Node(id)?.label).filter((label): label is string => Boolean(label))),
    ];
    const removedChoice = labels.length < previousChoiceCount.current;
    const message = count === 0
      ? "No areas are shown. Choose one or more ways to investigate."
      : removedChoice
        ? `Areas updated. Showing ${count} areas.`
        : `Showing ${count} areas for ${labels.join(", ")}.`;
    AccessibilityInfo.announceForAccessibility(message);
    previousChoiceCount.current = labels.length;
    if (count > 0 && !cleared) {
      const timeout = setTimeout(() => focusItemTitle(areaResultsHeadingRef.current), reducedMotion ? 0 : 220);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [projection.visibleAreas, projection.methods, projection.combinations, selection.methodIds, selection.combinationIds, selection.componentMethodIds, reducedMotion]);
  useEffect(() => {
    const hasChoices = selection.methodIds.length + selection.combinationIds.length + Object.values(selection.componentMethodIds).reduce((total, values) => total + values.length, 0) > 0;
    const duration = reducedMotion ? 0 : hasChoices ? 220 : 160;
    Animated.parallel([
      Animated.timing(resultOpacity, { toValue: hasChoices ? 1 : 0, duration, useNativeDriver: true }),
      Animated.timing(resultOffset, { toValue: hasChoices ? 0 : d078MotionOffset(reducedMotion, 8), duration, useNativeDriver: true }),
    ]).start();
  }, [selection.methodIds, selection.combinationIds, selection.componentMethodIds, reducedMotion, resultOpacity, resultOffset]);
  useEffect(() => {
    if (!undoSelection) return undefined;
    const timeout = setTimeout(() => setUndoSelection(undefined), 6000);
    return () => clearTimeout(timeout);
  }, [undoSelection]);
  useEffect(() => {
    if (!initialUndoSelectionKey) {
      setUndoSelection(undefined);
      return undefined;
    }
    // The web router can reuse this field component while replacing the URL
    // from an open area/role. Keep the live Undo state synchronized with the
    // exact route-provided prior selection; initializing useState alone misses
    // that navigation and can leave the Undo announcement without an action.
    setUndoSelection(JSON.parse(initialUndoSelectionKey) as D078Selection);
    AccessibilityInfo.announceForAccessibility("Updated the route to match the methods you selected. Undo is available.");
    const timeout = setTimeout(() => {
      const scroll = d078ScrollRef?.current as unknown as { scrollTo?: (options: { y: number; animated?: boolean }) => void } | null;
      scroll?.scrollTo?.({ y: 0, animated: !reducedMotion });
      focusItemTitle(methodPickerHeadingRef.current);
    }, reducedMotion ? 0 : 160);
    return () => clearTimeout(timeout);
  }, [initialUndoSelectionKey, d078ScrollRef, reducedMotion]);
  useEffect(() => {
    const initial = initialSelection ?? INITIAL_D078_SELECTION;
    if (initial.methodIds.length || initial.combinationIds.length || initial.areaId || initial.roleId || initial.addedItemIds.length) return;
    let active = true;
    void loadSavedD078RouteStacks({ ...guidanceContext, domainId: domainKey }).then((saved) => {
      if (active && !selectionTouched.current && saved) setRouteStackState(saved);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [domainKey, guidanceContext.guidanceStudentId, guidanceContext.programmeId, initialSelection]);
  const overviewNode = d078Node("domain:D078");
  const societyKnowledge = d078Node("runtime-item:domain:d078:d078-society-and-social-world-knowledge");
  const programmeThemes = programmeConnection?.programmeCurriculumThemes ?? [];
  const matchedThemeIds = new Set((graph.programme_transition.evidence_matched_theme_ids as string[] | undefined) ?? []);
  const matchedThemeKeys = new Set([...matchedThemeIds].map((id) => id.split(":").at(-1)?.toLocaleLowerCase()).filter((id): id is string => Boolean(id)));
  const graphMatchedOutcomeKeys = new Set(((graph.programme_transition.matched_transfer_outcome_ids as string[] | undefined) ?? [])
    .map((id) => id.replace(/^programme-outcome:sociology:/i, "").toLocaleLowerCase()));
  const outcomeKey = (id?: string | null) => String(id ?? "").replace(/^programme-outcome:sociology:/i, "").toLocaleLowerCase();
  const courseTitleByCode = new Map(programmeThemes.flatMap((theme) => theme.matchedCourseAnchors ?? [])
    .filter((course) => course.courseCode && course.courseTitle)
    .map((course) => [course.courseCode!.trim().toLocaleLowerCase(), course.courseTitle!]));
  const matchedOutcomes = programmeThemes.flatMap((theme) => {
    if (!matchedThemeKeys.has(theme.themeKey.toLocaleLowerCase())) return [];
    const matchedIds = new Set(theme.matchedOutcomeIds ?? []);
    return theme.programmeOutcomes.filter((outcome) => outcome.outcomeId
      && matchedIds.has(outcome.outcomeId)
      && graphMatchedOutcomeKeys.has(outcomeKey(outcome.outcomeId)))
      .map((outcome) => ({
        ...outcome,
        courseTitle: outcome.courseTitle || courseTitleByCode.get(String(outcome.courseCode ?? "").trim().toLocaleLowerCase()),
        themeTitle: theme.title,
      }));
  }).filter((outcome, index, all) => all.findIndex((candidate) => candidate.outcomeId === outcome.outcomeId) === index);
  const foundations = projection.foundations.map((item) => item.id);
  const layer2 = graph.domain_learning_layers.find((layer) => layer.layer === 2);
  const layer3 = graph.domain_learning_layers.find((layer) => layer.layer === 3);
  const layerItemIds = new Set([...(layer2?.item_ids ?? []), ...(layer3?.item_ids ?? [])]);
  const societyKnowledgeId = "runtime-item:domain:d078:d078-society-and-social-world-knowledge";
  // Society/social-world knowledge is field orientation, not a method-gated
  // preparation item. Show it before the method choice and keep the remaining
  // Layer 2 items gated to the selected method/design.
  const layer2Ids = d078ApplicableLayerItems(2, selection)
    .filter((id) => id !== societyKnowledgeId && Boolean(d078Node(id)));
  const layer3Ids = d078ApplicableLayerItems(3, selection).filter((id) => Boolean(d078Node(id)));
  const allDomainIds = [...new Set([...projection.domainItemIds, ...projection.toolIds])].filter((id) => !layerItemIds.has(id));
  const neededDomainIds = allDomainIds.filter((id) => requirementLane(d078Node(id)) === "needed");
  const conditionalDomainIds = allDomainIds.filter((id) => requirementLane(d078Node(id)) === "conditional");
  const usefulDomainIds = allDomainIds.filter((id) => !["needed", "conditional"].includes(requirementLane(d078Node(id))));
  const selectedDesign = projection.combinations.find((combo) => combo.selected);
  const hasSelectedMethod = selection.methodIds.length === 1 || selection.combinationIds.length > 0;
  const emptyText = projection.hiddenBecause === "choose_combination_design"
    ? "Your methods match more than one named combined research design. Choose the design that fits your question before the app shows areas, roles or downstream learning."
    : projection.hiddenBecause === "complete_combination_design"
      ? "Your method selection is part of a larger named design. Add the missing method or remove a selection; the app will not merge incomplete routes."
      : projection.hiddenBecause === "unsupported_method_combination"
        ? "There is no reviewed combined research design for this exact set of methods yet. Remove a method to continue with one supported route."
        : "Choose one or more ways to investigate. Areas and roles appear only for the methods or named design you select.";
  const updateSelection = (next: D078Selection) => {
    selectionTouched.current = true;
    setSelection(next);
  };
  const toggleItem = (id: string) => updateSelection(toggleD078AddedItem(selection, id));
  const navigateArea = (areaId: string) => {
    const next = selectD078Area(selection, areaId);
    const query = routeSelectionQuery({ ...next, areaId }, { ...guidanceContext, domainId: domainKey, areaId }, routeStackState);
    router.push(`${exploreNav.base}/domain/${encodeURIComponent(domainKey)}/subgroup/${encodeURIComponent(areaId)}?${query}&d078_from_field=1` as never);
  };
  const undoRoute = () => {
    if (!undoSelection) return;
    const previous = { ...undoSelection };
    setUndoSelection(undefined);
    const restored = projectD078Route(previous);
    const role = restored.visibleRoles.find((entry) => entry.roleId === previous.roleId && entry.areaId === previous.areaId);
    const apiRole = role && domainRoles.find((entry) => normalizeLabel(entry.name) === normalizeLabel(role.label));
    if (role && apiRole) {
      const query = `${routeSelectionQuery(previous, { ...guidanceContext, domainId: domainKey, areaId: role.areaId }, routeStackState)}&d078_role_id=${encodeURIComponent(role.roleId)}`;
      router.replace(`${exploreNav.base}/role/${encodeURIComponent(apiRole.key)}?${query}` as never);
    } else if (previous.areaId) {
      const query = routeSelectionQuery({ ...previous, roleId: undefined }, { ...guidanceContext, domainId: domainKey, areaId: previous.areaId }, routeStackState);
      router.replace(`${exploreNav.base}/domain/${encodeURIComponent(domainKey)}/subgroup/${encodeURIComponent(previous.areaId)}?${query}` as never);
    }
  };
  const methodsChanged = (next: D078Selection) => {
    methodChangePending.current = true;
    updateSelection(next);
  };
  const clearMethods = () => {
    methodChangePending.current = true;
    clearMethodChangePending.current = true;
    updateSelection({ ...INITIAL_D078_SELECTION, addedItemIds: selection.addedItemIds });
  };

  return <D078RelationshipNavigationProvider><Animated.View style={[styles.page, stageEntry.entryStyle]}>
    <D078JourneyPage stage="field" trayRevision={JSON.stringify(routeStackState)} tray={<D078JourneyTray selection={selection} setSelection={updateSelection} projection={projection} context={{ ...guidanceContext, domainId: domainKey }} programmeName={programmeName} routeStackState={routeStackState} setRouteStackState={setRouteStackState} />}>
    <View style={[styles.fieldEntryRow, width >= 700 && styles.fieldEntryRowWide]}>
      <View style={[styles.hero, styles.fieldOverviewCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }, width >= 700 && styles.fieldEntryCardWide]}>
        <Text ref={stageEntry.titleRef} accessibilityRole="header" style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{FIELD_TITLE}</Text>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(graph.programme_transition.domain_overview ?? overviewNode?.overview)}</Text>
      </View>
    </View>
    <View style={[styles.handoff, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Why your Sociology studies connect</Text>
      {programmeName ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{programmeName} → Social Sciences</Text> : null}
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(graph.programme_transition.transfer_summary).replace("shared domain foundations, optional useful edges", "three foundations already on your route, useful options you can skip")}</Text>
      <View style={styles.detailSection}>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What your programme covers</Text>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>Your programme brings together themes from its courses. They remain part of your degree context; they are not extra field requirements.</Text>
        {programmeThemes.length ? <RouteButton accessibilityLabel={themesExpanded ? "Hide programme themes" : `See all ${programmeThemes.length} programme themes`} label={themesExpanded ? "Hide programme themes" : `See all ${programmeThemes.length} programme themes`} expanded={themesExpanded} onPress={() => setThemesExpanded((value) => !value)} variant="secondary" style={styles.accordionButton} /> : null}
        {themesExpanded ? programmeThemes.map((theme) => <View key={theme.themeKey} style={[styles.themeRow, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{theme.title}</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{theme.summary || theme.narration}</Text>
        </View>) : null}
      </View>
      <View style={styles.detailSection}>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What carries into this field</Text>
        <Text style={[styles.compactContextCopy, { color: colors.textRole.secondary }]}>{matchedOutcomes.length
          ? `${matchedOutcomes.length} reviewed course outcomes connect selected Sociology themes to this field. Open them to see the course and outcome wording; they are starting points, not proof that every later skill has already been taught.`
          : "No individual course outcomes are available to show how your programme connects to this field."}</Text>
        {matchedOutcomes.length ? <RouteButton accessibilityLabel={outcomesExpanded ? "Hide matched course outcomes" : `See ${matchedOutcomes.length} matched course outcomes`} label={outcomesExpanded ? "Hide course outcomes" : `See ${matchedOutcomes.length} matched course outcomes`} expanded={outcomesExpanded} onPress={() => setOutcomesExpanded((value) => !value)} variant="secondary" style={styles.accordionButton} /> : null}
        {outcomesExpanded ? matchedOutcomes.map((outcome) => <View key={outcome.outcomeId} style={[styles.themeRow, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.meta, { color: colors.textRole.muted }]}>{outcome.themeTitle}</Text>
          {outcome.courseTitle ? <Text style={[styles.courseHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{outcome.courseTitle}</Text> : null}
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{outcome.studentText}</Text>
        </View>) : null}
      </View>
    </View>
    <ItemLane title="Compulsory foundations" ids={foundations} selection={selection} foundations resources={domainResources} />
    <ItemLane title="Knowledge of society and the social world" ids={societyKnowledge?.label ? [societyKnowledgeId] : []} selection={selection} onToggle={toggleItem} resources={domainResources} />
    <MethodChoicePanel
      selection={selection}
      onToggleMethod={(id) => methodsChanged(toggleD078Method(selection, id))}
      onToggleCombination={(id) => methodsChanged(toggleD078Combination(selection, id))}
      onToggleComponentMethod={(combo, method) => methodsChanged(toggleD078ComponentMethod(selection, combo, method))}
      onClear={clearMethods}
      headingRef={methodPickerHeadingRef}
    />
    {hasSelectedMethod ? <View style={styles.section} testID="d078-intermediate-learning-layers">
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Preparation for your selected method</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>These field-wide knowledge and research-practice options appear here only when the evidence connects them to your selected method or named design. They are shown in that route’s context—not as a checklist for every student. You can continue without selecting a useful option unless its stated condition applies to your project.</Text>
      {layer2Ids.length ? <View style={styles.learningLayer}>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Field-wide knowledge and useful learning</Text>
        <ItemLane title={selectedDesign ? `Useful for ${selectedDesign.label}` : "Useful for the method you selected"} ids={layer2Ids} selection={selection} onToggle={toggleItem} resources={domainResources} />
      </View> : null}
      {layer3Ids.length ? <View style={styles.learningLayer}>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Research practices and conditional preparation</Text>
        <ItemLane title={selectedDesign ? `Use when the condition applies within ${selectedDesign.label}` : "Use when the condition applies to your selected method"} ids={layer3Ids} selection={selection} onToggle={toggleItem} resources={domainResources} />
      </View> : null}
      {!layer2Ids.length && !layer3Ids.length ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>No additional preparation is supported for this selected route. You can continue without inventing a prerequisite.</Text> : null}
    </View> : null}
    {undoSelection ? <View accessibilityLiveRegion="polite" style={[styles.undoNotice, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>Updated the route to match the methods you selected.</Text>
      <RouteButton label="Undo" accessibilityLabel="Undo route change" variant="secondary" style={styles.hugSecondaryAction} onPress={undoRoute} />
    </View> : null}
    {projection.hiddenBecause ? <Text accessibilityLiveRegion="polite" style={[styles.empty, { color: colors.textRole.secondary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>{emptyText}</Text> : <Animated.View style={{ opacity: resultOpacity, transform: [{ translateY: d078MotionOffset(reducedMotion, 8) ? resultOffset : 0 }] }}>
      <View accessibilityLiveRegion="polite" style={styles.section}>
        {selectedDesign ? <View style={[styles.combinedDesignCard, { borderColor: colors.accentRole.action, backgroundColor: colors.surface.subtle }]} testID="d078-selected-combined-design">
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Your combined research design</Text>
          <Text accessibilityRole="header" style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{selectedDesign.label}</Text>
          {selectedDesign.whyCombine ? <View style={styles.detailSection}><Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why these methods fit together</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(selectedDesign.whyCombine)}</Text></View> : null}
          {selectedDesign.howUsed ? <View style={styles.detailSection}><Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How the work proceeds</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(selectedDesign.howUsed)}</Text></View> : null}
          {selectedDesign.methodContributions.length ? <View style={styles.detailSection}><Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What each method contributes</Text>{selectedDesign.methodContributions.map((contribution) => <View key={contribution.methodId} style={styles.contributionRow}><Text style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{d078Node(contribution.methodId)?.label ?? contribution.methodId}</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(contribution.contribution)}</Text></View>)}</View> : null}
          {selectedDesign.condition ? <View style={styles.detailSection}><Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Use this design when</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(selectedDesign.condition)}</Text></View> : null}
          {selectedDesign.limits ? <View style={styles.detailSection}><Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Keep in mind</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>{displayText(selectedDesign.limits)}</Text></View> : null}
        </View> : <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Your selected method route</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>Your method choice determines which areas, roles and further learning are supported. If you selected more than one method, choose the named design above before a combined route can appear.</Text>
        </View>}
        <ItemLane title="Needed for what you selected" ids={neededDomainIds} selection={selection} onToggle={toggleItem} resources={domainResources} />
        <ItemLane title="Use when this condition applies" ids={conditionalDomainIds} selection={selection} onToggle={toggleItem} resources={domainResources} />
        <ItemLane title="Useful. You can skip it" ids={usefulDomainIds} selection={selection} onToggle={toggleItem} resources={domainResources} />
      </View>
      <D078AreaResults projection={projection} onOpenArea={navigateArea} headingRef={areaResultsHeadingRef} />
    </Animated.View>}
    </D078JourneyPage>
  </Animated.View></D078RelationshipNavigationProvider>;
}

export function D078AreaRoute({ domainKey, areaId, initialSelection, initialRouteStacks, roles, guidanceContext, returnToFieldOnBack = false, areaResources = [], domainResources = [] }: {
  domainKey: string;
  areaId: string;
  initialSelection: D078Selection;
  initialRouteStacks?: D078RouteStackState;
  roles: DomainRoleSummary[];
  guidanceContext: GuidanceRouteContext;
  returnToFieldOnBack?: boolean;
  areaResources?: CareerLearningResource[];
  domainResources?: CareerLearningResource[];
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const primaryActionStyle = d078PrimaryActionStyle(width, Platform.OS);
  const router = useRouter();
  const exploreNav = useExploreNav();
  const stageEntry = useD078StageEntry("horizontal");
  const [routeContextOpen, setRouteContextOpen] = useState(false);
  const [routeStackState, setRouteStackState] = useState<D078RouteStackState>(() => initialD078RouteStackState({ ...initialSelection, areaId, roleId: undefined }, initialRouteStacks));
  const selection = routeStackState.stacks.find((stack) => stack.id === routeStackState.activeStackId)?.selection ?? { ...initialSelection, areaId, roleId: undefined };
  const setSelection = (next: D078Selection | ((current: D078Selection) => D078Selection)) => updateActiveD078Selection(setRouteStackState, next);
  const projection = useMemo(() => projectD078Route(selection), [selection]);
  const area = projection.visibleAreas.find((entry) => entry.areaId === areaId || entry.nodeId === areaId);
  const normalizedAreaId = area?.areaId ?? areaId;
  const graphRoles = projection.visibleRoles.filter((role) => role.areaId === normalizedAreaId);
  const roleByGraphId = new Map<string, DomainRoleSummary>();
  graphRoles.forEach((role) => {
    const apiRole = roles.find((entry) => normalizeLabel(entry.name) === normalizeLabel(role.label));
    if (apiRole) roleByGraphId.set(role.roleId, apiRole);
  });
  const returnToField = () => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (returnToFieldOnBack && canGoBack) {
      router.back();
      return;
    }
    const next = { ...selection, areaId: undefined, roleId: undefined };
    const query = routeSelectionQuery(next, { ...guidanceContext, domainId: domainKey, areaId: undefined }, routeStackState);
    router.replace(`${exploreNav.base}/domain/${encodeURIComponent(domainKey)}?${query}` as never);
  };
  if (!area) return <D078RelationshipNavigationProvider><Animated.View style={[styles.page, stageEntry.entryStyle]}>
    <Text ref={stageEntry.titleRef} accessibilityRole="header" style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>This area is not in your selected route</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>Choose a method or named combined research design on the field page to see the areas it supports.</Text>
    <RouteButton label="Back to Social Sciences domain" onPress={returnToField} variant="primary" style={primaryActionStyle} />
  </Animated.View></D078RelationshipNavigationProvider>;
  const areaItemIds = projection.areaItemIdsByArea[normalizedAreaId] ?? [];
  const needed = areaItemIds.filter((id) => requirementLane(d078Node(id)) === "needed");
  const useful = areaItemIds.filter((id) => requirementLane(d078Node(id)) !== "needed");
  const supports = [...area.supportingMethodIds.map((id) => projection.methods.find((method) => method.id === id)?.label), ...area.supportingCombinationIds.map((id) => projection.combinations.find((combo) => combo.id === id)?.label)].filter((label): label is string => Boolean(label));
  const addItem = (id: string) => setSelection((current) => toggleD078AddedItem(current, id));
  const removeAreaChoice = (next: D078Selection) => {
    const remains = projectD078Route(next).visibleAreas.some((entry) => entry.areaId === normalizedAreaId);
    if (remains) {
      setSelection(next);
      return;
    }
    const fieldSelection = d078PickerSelection(next);
    const context = { ...guidanceContext, domainId: domainKey, areaId: undefined };
    const query = `${routeSelectionQuery(fieldSelection, context, routeStackState)}&d078_undo_selection=${encodeURIComponent(JSON.stringify(selection))}`;
    router.replace(`${exploreNav.base}/domain/${encodeURIComponent(domainKey)}?${query}` as never);
  };
  const openRole = (roleId: string) => {
    const next = { ...selection, areaId: normalizedAreaId, roleId };
    const role = projection.visibleRoles.find((entry) => entry.roleId === roleId && entry.areaId === normalizedAreaId);
    const apiRole = roleByGraphId.get(roleId);
    if (!role || !apiRole) return;
    const query = `${routeSelectionQuery(next, { ...guidanceContext, domainId: domainKey, areaId: normalizedAreaId }, routeStackState)}&d078_role_id=${encodeURIComponent(roleId)}&d078_from_area=1`;
    router.push(`${exploreNav.base}/role/${encodeURIComponent(apiRole.key)}?${query}` as never);
  };

  return <D078RelationshipNavigationProvider><Animated.View style={[styles.page, stageEntry.entryStyle]}>
    <D078JourneyPage stage="area" trayRevision={JSON.stringify(routeStackState)} tray={<D078JourneyTray selection={selection} setSelection={setSelection} onRemoveChoice={removeAreaChoice} projection={projection} context={{ ...guidanceContext, domainId: domainKey, areaId: normalizedAreaId }} routeStackState={routeStackState} setRouteStackState={setRouteStackState} onActivateRoute={(next, state) => router.replace(`${exploreNav.base}/domain/D078?${routeSelectionQuery(next, { ...guidanceContext, domainId: domainKey }, state)}` as never)} />}>
    <RouteButton label="Back to Social Sciences domain" onPress={returnToField} variant="secondary" style={styles.hugSecondaryAction} />
    <View style={styles.hero}>
      <Text ref={stageEntry.titleRef} accessibilityRole="header" style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{area.label}</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>{`Shown because you selected ${supports.join(" and ")}.`}</Text>
    </View>
    {area.taskFamilyIds.length || area.methodContributions.length ? <View style={[styles.areaContext, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <Text accessibilityRole="header" style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What this area covers</Text>
      {area.taskFamilyIds.map((id) => {
        const label = d078Node(id)?.label;
        return label ? <Text key={id} style={[styles.taskFamily, { color: colors.textRole.secondary }]}>{label}</Text> : null;
      })}
      {area.methodContributions.length ? <View style={styles.detailSections}>
        <Text accessibilityRole="header" style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How each method contributes to this route</Text>
        {area.methodContributions.map((contribution) => <View key={contribution.methodId} style={[styles.themeRow, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{d078Node(contribution.methodId)?.label ?? "Selected method"}</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{contribution.contribution}</Text>
          {contribution.taskFamilyIds.map((id) => d078Node(id)?.label ? <Text key={id} style={[styles.meta, { color: colors.textRole.secondary }]}>Work in this area: {d078Node(id)?.label}</Text> : null)}
          {contribution.itemIds.length ? <View style={styles.detailSection}>
            <Text style={[styles.meta, { color: colors.textRole.muted }]}>Learning connected to this method in this area</Text>
            {contribution.itemIds.map((id) => d078Node(id)?.label ? <Text key={id} style={[styles.meta, { color: colors.textRole.secondary }]}>• {d078Node(id)?.label}</Text> : null)}
          </View> : null}
          {contribution.toolIds.length ? <View style={styles.detailSection}>
            <Text style={[styles.meta, { color: colors.textRole.muted }]}>Tools that support this method here</Text>
            {contribution.toolIds.map((id) => d078Node(id)?.label ? <Text key={id} style={[styles.meta, { color: colors.textRole.secondary }]}>• {d078Node(id)?.label}</Text> : null)}
          </View> : null}
        </View>)}
        <Text style={[styles.meta, { color: colors.textRole.muted }]}>The learning items below stay attached to the method and work they support; they are not treated as one undifferentiated checklist.</Text>
      </View> : null}
    </View> : null}
    <View style={[styles.handoff, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <RouteButton label="From your route" accessibilityLabel={`${routeContextOpen ? "Hide" : "Show"} what carries into ${area.label}`} expanded={routeContextOpen} onPress={() => setRouteContextOpen((open) => !open)} variant="secondary" style={styles.hugSecondaryAction} />
      {routeContextOpen ? <View style={styles.detailSections}>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>The three field foundations stay on your route. Your selected methods explain why this area and its connected roles are shown; selecting a method does not make a method a job requirement.</Text>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Foundations carried forward</Text>
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{projection.foundations.map((item) => item.label).join(" · ")}</Text>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Methods and designs you selected</Text>
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{supports.join(" · ")}</Text>
      </View> : null}
    </View>
    <ItemLane title="Needed for what you selected" ids={needed} selection={selection} onToggle={addItem} resources={[...domainResources, ...areaResources]} contextLevel="subgroup" />
    <ItemLane title="Useful. You can skip it" ids={useful} selection={selection} onToggle={addItem} resources={[...domainResources, ...areaResources]} contextLevel="subgroup" />
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Roles in this area for your selected methods</Text>
      {graphRoles.length ? <View style={styles.areaCardList}>{graphRoles.map((role) => {
        if (!roleByGraphId.has(role.roleId)) return null;
        return <View key={role.roleId} style={[styles.areaCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.itemTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{titleCase(role.label)}</Text>
          <Text style={[styles.summary, { color: colors.textRole.secondary }]}>Available with the method you selected. This does not make the method a requirement of the role.</Text>
          <Text style={[styles.meta, { color: colors.textRole.muted }]}>Selecting a role opens its full-screen details and the learning context for this route.</Text>
          <RouteButton label="Select role" accessibilityLabel={`Select role ${titleCase(role.label)}`} variant="primary" style={primaryActionStyle} onPress={() => openRole(role.roleId)} />
        </View>;
      })}</View> : <Text style={[styles.body, { color: colors.textRole.secondary }]}>No role here is linked to the methods you selected.</Text>}
    </View>
    </D078JourneyPage>
  </Animated.View></D078RelationshipNavigationProvider>;
}

export function D078RoleRoute({ areaId, roleId, roleName, roleKey, initialSelection, initialRouteStacks, roles, guidanceContext, returnToAreaOnBack = false, roleResources = [], domainResources = [] }: {
  areaId?: string;
  roleId?: string;
  roleName: string;
  roleKey: string;
  initialSelection: D078Selection;
  initialRouteStacks?: D078RouteStackState;
  roles: DomainRoleSummary[];
  guidanceContext: GuidanceRouteContext;
  returnToAreaOnBack?: boolean;
  roleResources?: CareerLearningResource[];
  domainResources?: CareerLearningResource[];
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const primaryActionStyle = d078PrimaryActionStyle(width, Platform.OS);
  const router = useRouter();
  const exploreNav = useExploreNav();
  const stageEntry = useD078StageEntry("vertical");
  const [routeContextOpen, setRouteContextOpen] = useState(false);
  const normalizedRoleName = normalizeLabel(roleName);
  const resolvedRoleId = resolveD078RoleRouteId(initialSelection, areaId, roleId, normalizedRoleName);
  const [routeStackState, setRouteStackState] = useState<D078RouteStackState>(() => initialD078RouteStackState({ ...initialSelection, areaId, roleId: resolvedRoleId }, initialRouteStacks));
  const selection = routeStackState.stacks.find((stack) => stack.id === routeStackState.activeStackId)?.selection ?? { ...initialSelection, areaId, roleId: resolvedRoleId };
  const setSelection = (next: D078Selection | ((current: D078Selection) => D078Selection)) => updateActiveD078Selection(setRouteStackState, next);
  const projection = useMemo(() => projectD078Route(selection), [selection]);
  const routeRole = projection.visibleRoles.find((role) => role.roleId === resolvedRoleId && role.areaId === areaId);
  const visible = routeRole !== undefined && !projection.requestedRoleHidden;
  const returnToArea = (nextSelection = selection) => {
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (areaId && returnToAreaOnBack && canGoBack && nextSelection === selection) {
      router.back();
      return;
    }
    const next = { ...nextSelection, areaId: areaId || undefined, roleId: undefined };
    const context = { ...guidanceContext, domainId: "D078", areaId: areaId || undefined, roleId: undefined };
    const query = routeSelectionQuery(next, context, routeStackState);
    const destination = areaId
      ? `${exploreNav.base}/domain/D078/subgroup/${encodeURIComponent(areaId)}`
      : `${exploreNav.base}/domain/D078`;
    router.replace(`${destination}?${query}` as never);
  };
  const returnToDomain = () => {
    const next = { ...d078PickerSelection(selection), areaId: undefined, roleId: undefined };
    const context = { ...guidanceContext, domainId: "D078", areaId: undefined, roleId: undefined };
    const query = routeSelectionQuery(next, context, routeStackState);
    router.replace(`${exploreNav.base}/domain/D078?${query}` as never);
  };
  if (!visible || !resolvedRoleId || !areaId) return <D078RelationshipNavigationProvider><Animated.View style={[styles.page, stageEntry.entryStyle]}>
    <Text ref={stageEntry.titleRef} accessibilityRole="header" style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>This role is not in your selected route</Text>
    <Text style={[styles.body, { color: colors.textRole.secondary }]}>{areaId
      ? "Return to the area and choose a role connected to your selected method or named combined research design."
      : "Roles appear after you choose a method, open one of its areas, and select a role connected to that area."}</Text>
    <RouteButton label={areaId ? "Back to area" : "Back to Social Sciences domain"} onPress={() => returnToArea()} variant="primary" style={primaryActionStyle} />
  </Animated.View></D078RelationshipNavigationProvider>;
  const roleItems = projection.roleItemIds;
  const methodItems = projection.methodSpecificRoleItemIds.filter((id) => !roleItems.includes(id));
  const needed = roleItems.filter((id) => requirementLane(d078Node(id)) === "needed");
  const useful = roleItems.filter((id) => requirementLane(d078Node(id)) !== "needed");
  const methodNeeded = methodItems.filter((id) => requirementLane(d078Node(id)) === "needed");
  const methodUseful = methodItems.filter((id) => requirementLane(d078Node(id)) !== "needed");
  const addItem = (id: string) => setSelection((current) => toggleD078AddedItem(current, id));
  const otherAreas = projection.visibleAreas.filter((area) => area.areaId !== areaId && projection.visibleRoles.some((role) => role.roleId === resolvedRoleId && role.areaId === area.areaId));
  const apiRole = roles.find((role) => normalizeLabel(role.name) === normalizedRoleName);
  const openOtherArea = (nextAreaId: string) => {
    const next = { ...selection, areaId: nextAreaId, roleId: resolvedRoleId };
    const query = `${routeSelectionQuery(next, { ...guidanceContext, areaId: nextAreaId, roleId }, routeStackState)}&d078_role_id=${encodeURIComponent(resolvedRoleId)}`;
    router.push(`${exploreNav.base}/role/${encodeURIComponent(apiRole?.key ?? roleKey)}?${query}` as never);
  };
  const removeChoice = (next: D078Selection) => {
    const roleStillVisible = d078RoleStillVisible(next, resolvedRoleId, areaId);
    if (roleStillVisible) {
      setSelection(next);
      return;
    }
    const fieldSelection = d078PickerSelection(next);
    const context = { ...guidanceContext, domainId: "D078", areaId: undefined, roleId: undefined };
    const query = `${routeSelectionQuery(fieldSelection, context, routeStackState)}&d078_undo_selection=${encodeURIComponent(JSON.stringify(selection))}`;
    router.replace(`${exploreNav.base}/domain/D078?${query}` as never);
  };

  return <D078RelationshipNavigationProvider><Animated.View style={[styles.page, stageEntry.entryStyle]}>
    <D078JourneyPage stage="role" trayRevision={JSON.stringify(routeStackState)} tray={<D078JourneyTray selection={selection} setSelection={setSelection} onRemoveChoice={removeChoice} projection={projection} context={{ ...guidanceContext, domainId: "D078", areaId, roleId: resolvedRoleId }} routeStackState={routeStackState} setRouteStackState={setRouteStackState} onActivateRoute={(next, state) => router.replace(`${exploreNav.base}/domain/D078?${routeSelectionQuery(next, { ...guidanceContext, domainId: "D078" }, state)}` as never)} />}>
    <View style={styles.backActions}>
      <RouteButton label={`Back to ${projection.visibleAreas.find((area) => area.areaId === areaId)?.label ?? "area"}`} onPress={() => returnToArea()} variant="secondary" style={styles.hugSecondaryAction} />
      <RouteButton label="Back to Social Sciences domain" onPress={returnToDomain} variant="secondary" style={styles.hugSecondaryAction} />
    </View>
    <View style={styles.hero}>
      <Text ref={stageEntry.titleRef} accessibilityRole="header" style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{titleCase(routeRole.label)}</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>Available with the method you selected. This does not make the method a requirement of the role.</Text>
    </View>
    <View style={[styles.handoff, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
      <RouteButton label="From your route" accessibilityLabel={`${routeContextOpen ? "Hide" : "Show"} what carries into ${titleCase(routeRole.label)}`} expanded={routeContextOpen} onPress={() => setRouteContextOpen((open) => !open)} variant="secondary" style={styles.hugSecondaryAction} />
      {routeContextOpen ? <View style={styles.detailSections}>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>This role appears within {projection.visibleAreas.find((area) => area.areaId === areaId)?.label ?? "the selected area"} because it connects to the method or combination you chose. The method is a way to explore the work, not a claim that every person in the role uses it.</Text>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Foundations carried forward</Text>
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{projection.foundations.map((item) => item.label).join(" · ")}</Text>
        <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Methods and designs you selected</Text>
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{projection.methods.filter((method) => selection.methodIds.includes(method.id)).map((method) => method.label).concat(projection.combinations.filter((combo) => selection.combinationIds.includes(combo.id)).map((combo) => combo.label)).join(" · ")}</Text>
      </View> : null}
    </View>
    {needed.length || useful.length ? <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>How your learning may apply in this role</Text>
      <Text style={[styles.summary, { color: colors.textRole.secondary }]}>These items show ways your selected learning may support work associated with this role. Actual duties vary by employer and position; this is not a checklist of tasks every employer assigns or proof that you are job-ready. “Needed” and “Useful” describe this learning route, not a universal job requirement.</Text>
      <ItemLane title="Needed for what you selected" ids={needed} selection={selection} onToggle={addItem} roleItems resources={[...domainResources, ...roleResources]} contextLevel="role" />
      <ItemLane title="Useful. You can skip it" ids={useful} selection={selection} onToggle={addItem} roleItems resources={[...domainResources, ...roleResources]} contextLevel="role" />
    </View> : null}
    {methodItems.length ? <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Specific to the method you selected</Text>
      <Text style={[styles.summary, { color: colors.textRole.secondary }]}>These additional items appear only when the reviewed evidence connects this method to this role. They are options for that task context, not requirements for everyone in the role.</Text>
      <ItemLane title="Needed for what you selected" ids={methodNeeded} selection={selection} onToggle={addItem} roleItems resources={[...domainResources, ...roleResources]} contextLevel="role" />
      <ItemLane title="Useful. You can skip it" ids={methodUseful} selection={selection} onToggle={addItem} roleItems resources={[...domainResources, ...roleResources]} contextLevel="role" />
    </View> : null}
    {otherAreas.map((area) => <RouteButton key={area.areaId} label={`Also in ${area.label}`} onPress={() => openOtherArea(area.areaId)} variant="secondary" style={styles.hugSecondaryAction} />)}
    </D078JourneyPage>
  </Animated.View></D078RelationshipNavigationProvider>;
}

export function normalizeLabel(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function titleCase(value: string): string {
  return value.replace(/\b[\p{L}][\p{L}\p{M}'’-]*/gu, (part) => part.charAt(0).toLocaleUpperCase() + part.slice(1));
}

function supportReason(area: D078Projection["visibleAreas"][number], projection: D078Projection): string {
  const labels = [
    ...area.supportingMethodIds.map((id) => projection.methods.find((method) => method.id === id)?.label),
    ...area.supportingCombinationIds.map((id) => projection.combinations.find((combo) => combo.id === id)?.label),
  ].filter((label): label is string => Boolean(label));
  return `Shown because you selected ${labels.join(" and ")}.`;
}

const styles = StyleSheet.create({
  page: { width: "100%", alignSelf: "stretch", gap: 22, paddingBottom: Spacing.xxl },
  journeyLayout: { width: "100%", gap: 22 },
  readingColumn: { width: "100%", maxWidth: "100%", minWidth: 0, gap: 22 },
  backActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  learningPlanDockWeb: { position: "fixed" as any, right: 16, bottom: 16, zIndex: 50, alignItems: "flex-end" },
  learningPlanDockNative: { position: "absolute", right: 16, bottom: 16, zIndex: 50, alignItems: "flex-end" },
  learningPlanFallbackDock: { alignItems: "flex-end", paddingVertical: Spacing.sm },
  mobileTrayDock: { zIndex: 50, alignSelf: "flex-end" },
  mobileTrayDockWeb: { alignSelf: "flex-end" },
  mobileTrayDockNative: { alignSelf: "flex-end", zIndex: 50 },
  trayPanelCompact: { maxHeight: 280, padding: Spacing.md },
  trayPanelMid: { maxHeight: "65vh" as any, padding: Spacing.md },
  mobileTrayBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(5, 12, 28, 0.52)" },
  mobileTraySheet: { width: "100%", maxHeight: "85%" as any, padding: Spacing.md, paddingBottom: Spacing.xl, borderTopWidth: 1, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl },
  hero: { gap: Spacing.sm },
  fieldEntryRow: { gap: Spacing.md },
  fieldEntryRowWide: { flexDirection: "row", alignItems: "stretch" },
  fieldEntryCardWide: { flex: 1, minWidth: 0 },
  fieldOverviewCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  buildEntryCard: { gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  buildEntryAction: { alignSelf: "flex-start" },
  domainKnowledgeNote: { gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.xs },
  overviewSources: { gap: Spacing.xs, paddingTop: Spacing.xs },
  title: { fontSize: 26, lineHeight: 32 },
  section: { gap: Spacing.sm },
  learningLayer: { gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  itemLane: { gap: 8 },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 24 },
  compactContextCopy: { fontSize: 13, lineHeight: 19 },
  meta: { fontSize: 13, lineHeight: 18 },
  sourceLink: { fontSize: 14, lineHeight: 20 },
  orderNote: { fontSize: 14, lineHeight: 20 },
  handoff: { gap: Spacing.md, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md },
  detailHeading: { fontSize: 16, lineHeight: 22 },
  hugSecondaryAction: { alignSelf: "flex-start" },
  accordionButton: { alignSelf: "flex-start" },
  themeRow: { gap: Spacing.xs, padding: Spacing.sm, borderWidth: 1, borderRadius: Radius.md },
  courseHeading: { fontSize: 16, lineHeight: 22 },
  itemCard: { gap: Spacing.sm, padding: 12, borderWidth: 1, borderRadius: Radius.md },
  type: { fontSize: 13, lineHeight: 18 },
  itemTitle: { fontSize: 16, lineHeight: 22 },
  lane: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  summary: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, paddingTop: Spacing.xs },
  detailSections: { gap: 8, paddingTop: Spacing.sm },
  detailSection: { gap: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm },
  resourceList: { gap: 8 },
  relatedPreview: { gap: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md, borderColor: "#64748b" },
  detailBody: { fontSize: 16, lineHeight: 24 },
  empty: { padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md, fontSize: 16, lineHeight: 24 },
  areaCardList: { gap: 8 },
  areaCard: { gap: Spacing.sm, padding: 12, borderWidth: 1, borderRadius: Radius.md },
  areaContext: { gap: Spacing.sm, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md },
  taskFamily: { fontSize: 16, lineHeight: 24, paddingLeft: Spacing.sm, borderLeftWidth: 2, borderLeftColor: "rgba(100,116,139,0.4)" },
  trayWrap: { zIndex: 10 },
  trayWrapFull: { height: 56, maxHeight: 56 },
  desktopFullTrayBackdrop: { flex: 1, justifyContent: "center", alignItems: "stretch", backgroundColor: "rgba(5, 12, 28, 0.56)" },
  desktopFullTraySurface: { flex: 1, borderWidth: 1, borderRadius: Radius.lg, overflow: "hidden", minHeight: 0 },
  combinedDesignCard: { gap: Spacing.sm, padding: Spacing.md, borderWidth: 2, borderRadius: Radius.lg },
  contributionRow: { gap: Spacing.xs, paddingVertical: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(127,127,127,0.25)" },
  trayFull: { flex: 1, height: "100%" as any, minHeight: 0 },
  trayNotice: { marginTop: Spacing.xs, fontSize: 14, lineHeight: 20 },
  undoNotice: { gap: Spacing.xs, padding: Spacing.md, borderWidth: 1, borderRadius: Radius.md },
});

