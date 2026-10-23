import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  AccessibilityInfo,
  Easing,
  findNodeHandle,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import { useReducedMotion } from "@/theme/motion";
import type { D078TypedRelationshipEdge } from "@/lib/d078RouteProjection";
import { RouteButton } from "./RouteButton";

export type { D078TypedRelationshipEdge } from "@/lib/d078RouteProjection";

export type D078RelationshipItem = {
  id: string;
  label: string;
};

type RelationshipMeaning = {
  label: string;
  explanation: string;
  comparison?: boolean;
};

const GENERIC_GRAPH_EXPLANATION = "Canonical learning item(s) exist for this relationship; offer them only when projected by the selected D078 route. This connection never blocks progression.";

const HIDDEN_TARGET_COPY = "That item is hidden until you select a method that uses it.";
const READY_EDGE_STATUSES = new Set([
  "source_backed",
  "approved",
  "contract_relationship_review",
  "resolved_ready_for_use",
]);

function edgeKey(edge: D078TypedRelationshipEdge, index: number): string {
  return edge.id ?? `${edge.relationship}:${edge.sourceId}:${edge.targetId}:${index}`;
}

function relationshipMeaning(type: string, currentIsSource: boolean, blockingPolicy?: string): RelationshipMeaning | null {
  switch (type) {
    case "prerequisite_for":
      return blockingPolicy === "blocks"
        ? {
          label: "Learn this first",
          explanation: currentIsSource
            ? "Learn this item before the connected learning."
            : "Learn the connected item before this learning.",
        }
        : null;
    case "builds_on":
      return {
        label: "Builds on",
        explanation: currentIsSource
          ? "The connected item can provide useful background before this one."
          : "This item can provide useful background before the connected learning. Learn it first only when the route marks it as required.",
      };
    case "requires":
      return {
        label: "Uses as background",
        explanation: currentIsSource
          ? "The connected learning is linked as background for this item. The relationship does not block your route."
          : "This item is linked as background for the connected learning. The relationship does not block your route.",
      };
    case "works_with":
    case "complements":
      return { label: "Useful alongside", explanation: "These can be useful together when the work calls for both. Choosing one does not add the other." };
    case "supports":
    case "useful_for":
      return { label: "Supports this work", explanation: "This connection describes where the item may be useful; it does not make either item compulsory." };
    case "tool_for":
    case "optional_analysis_tool":
    case "optional_tool_option":
    case "optional_collection_tool":
    case "conditional_library":
    case "visual_network_tool":
    case "computational_network_tool":
    case "simulation_framework":
    case "specialist_simulation_tool":
      return { label: "Tool for this method", explanation: "Use a tool only when it fits the selected method and task." };
    case "specialist_extension_of":
      return { label: "Specialist extension", explanation: "This is a narrower extension of the connected learning; it is optional unless a route explicitly says otherwise." };
    case "alternative_to":
    case "alternative_tool_option":
      return { label: "Another way", explanation: "These are alternative options. Choose the one that fits your question; they are not steps you need to learn together.", comparison: true };
    default:
      return null;
  }
}

function focus(ref: React.RefObject<any>) {
  const node = ref.current;
  if (!node) return;
  if (typeof node.focus === "function") node.focus();
  // React Native uses an accessibility tag; native host refs do not expose a
  // DOM focus method. The try also keeps non-native renderers from failing on
  // a ref object that has no native view tag.
  try {
  const handle = findNodeHandle(node);
  if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
  } catch {
    // A renderer without native view handles cannot move native focus.
  }
}

export function D078RelationshipPanel({
  currentItem,
  projectedItems,
  typedEdges,
  onUseTarget,
  onOpenTarget,
  routeContextLabel,
  focusElement,
  style,
}: {
  currentItem: D078RelationshipItem;
  projectedItems: readonly D078RelationshipItem[];
  typedEdges: readonly D078TypedRelationshipEdge[];
  onUseTarget: (target: D078RelationshipItem, edge: D078TypedRelationshipEdge) => void;
  onOpenTarget: (target: D078RelationshipItem, edge: D078TypedRelationshipEdge) => void;
  /** The learner's current D078 domain/area/role stop, when one is selected. */
  routeContextLabel?: string;
  /** Optional platform focus adapter; defaults to native/web focus handling. */
  focusElement?: (element: unknown) => void;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState<{ edge: D078TypedRelationshipEdge; target: D078RelationshipItem } | null>(null);
  const [closing, setClosing] = useState(false);
  const sheetOpacity = useRef(new Animated.Value(0)).current;
  const sheetOffset = useRef(new Animated.Value(24)).current;
  const triggerRef = useRef<any>(null);
  const comparisonTriggerRefs = useRef(new Map<string, unknown>());
  const sheetTitleRef = useRef<any>(null);
  const sheetWasOpen = useRef(false);
  const projectedById = useMemo(() => new Map(projectedItems.map((item) => [item.id, item])), [projectedItems]);

  const visible = useMemo(() => {
    const rows: Array<{ edge: D078TypedRelationshipEdge; target: D078RelationshipItem; meaning: RelationshipMeaning; key: string }> = [];
    let hasHiddenResolvedTarget = false;
    for (const [index, edge] of typedEdges.entries()) {
      if (edge.sourceId === edge.targetId) continue;
      const status = edge.status?.toLowerCase();
      if (!status || !READY_EDGE_STATUSES.has(status)) continue;
      if (edge.targetResolved !== true || edge.sourceResolved !== true) continue;
      const source = projectedById.get(edge.sourceId);
      const target = projectedById.get(edge.targetId);
      const currentIsSource = edge.sourceId === currentItem.id;
      const currentIsTarget = edge.targetId === currentItem.id;
      if (!currentIsSource && !currentIsTarget) continue;
      if (edge.routeAvailability === "unavailable_destination") {
        if (currentIsSource || currentIsTarget) hasHiddenResolvedTarget = true;
        continue;
      }
      if (!source || !target) {
        if (currentIsSource || currentIsTarget) hasHiddenResolvedTarget = true;
        continue;
      }
      const other = currentIsSource ? target : source;
      const meaning = relationshipMeaning(edge.relationship, currentIsSource, edge.blockingPolicy);
      if (meaning) rows.push({ edge, target: other, meaning, key: edgeKey(edge, index) });
    }
    return { rows, hasHiddenResolvedTarget };
  }, [currentItem.id, projectedById, typedEdges]);

  useEffect(() => {
    if (active) {
      sheetWasOpen.current = true;
      setClosing(false);
      sheetOpacity.setValue(reducedMotion ? 1 : 0);
      sheetOffset.setValue(reducedMotion ? 0 : 24);
      Animated.parallel([
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: reducedMotion ? 0 : 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOffset, {
          toValue: 0,
          duration: reducedMotion ? 0 : 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      if (focusElement) focusElement(sheetTitleRef.current);
      else focus(sheetTitleRef);
    } else if (sheetWasOpen.current) {
      sheetWasOpen.current = false;
      if (focusElement) focusElement(triggerRef.current);
      else focus(triggerRef);
    }
  }, [active, focusElement, reducedMotion, sheetOffset, sheetOpacity]);

  const closeSheet = () => {
    if (!active || closing) return;
    setClosing(true);
    Animated.parallel([
      Animated.timing(sheetOpacity, {
        toValue: 0,
        duration: reducedMotion ? 0 : 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetOffset, {
        toValue: 24,
        duration: reducedMotion ? 0 : 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setActive(null);
    });
  };

  if (!visible.rows.length && !visible.hasHiddenResolvedTarget) return null;

  return (
    <View style={[styles.panel, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }, style]}>
      <Text style={[styles.heading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How this connects</Text>
      {visible.rows.map(({ edge, target, meaning, key }) => (
        <View key={key} style={[styles.row, { borderTopColor: colors.borderRole.subtle }]}>
          <Text style={[styles.rowLabel, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>{meaning.label}</Text>
          <Text style={[styles.connectionPair, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{currentItem.label} · {target.label}</Text>
          {routeContextLabel ? <Text style={[styles.routeContext, { color: colors.textRole.muted }]}>{`In your ${routeContextLabel} route`}</Text> : null}
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{meaning.explanation}</Text>
          {edge.explanation?.trim() && edge.explanation.trim() !== GENERIC_GRAPH_EXPLANATION
            ? <View style={[styles.graphExplanation, { borderLeftColor: colors.accentRole.action, backgroundColor: colors.surface.raised }]}>
              <Text style={[styles.graphExplanationLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why this connection matters</Text>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{edge.explanation.trim()}</Text>
            </View>
            : null}
          {meaning.comparison ? (
            <RouteButton
              ref={(node) => {
                if (node) comparisonTriggerRefs.current.set(key, node);
                else comparisonTriggerRefs.current.delete(key);
              }}
              accessibilityLabel={`Compare ${currentItem.label} with ${target.label}`}
              onPress={() => {
                triggerRef.current = comparisonTriggerRefs.current.get(key) ?? null;
                setActive({ edge, target });
              }}
              label="Compare options"
              variant="secondary"
              style={styles.compareButton}
            />
          ) : (
            <RouteButton
              accessibilityLabel={`See ${target.label}`}
              onPress={() => onOpenTarget(target, edge)}
              label={`See ${target.label}`}
              variant="secondary"
              style={styles.linkButton}
            />
          )}
        </View>
      ))}
      {visible.hasHiddenResolvedTarget ? <Text accessibilityRole="text" style={[styles.hiddenCopy, { color: colors.textRole.muted }]}>{HIDDEN_TARGET_COPY}</Text> : null}

      <Modal visible={Boolean(active)} transparent animationType="none" onRequestClose={closeSheet}>
        <View style={styles.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close comparison" onPress={closeSheet} disabled={closing} style={styles.backdrop} />
          <Animated.View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle, opacity: sheetOpacity, transform: [{ translateY: sheetOffset }] }]}>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              <Text ref={sheetTitleRef} accessible accessibilityRole="header" accessibilityLabel="Compare learning options" style={[styles.sheetTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>Compare learning options</Text>
              {active ? <>
                <Text style={[styles.compareName, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{currentItem.label}</Text>
                <Text style={[styles.body, { color: colors.textRole.secondary }]}>or</Text>
                <Text style={[styles.compareName, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{active.target.label}</Text>
                {active.edge.explanation?.trim() && active.edge.explanation.trim() !== GENERIC_GRAPH_EXPLANATION
                  ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>{active.edge.explanation.trim()}</Text>
                  : <Text style={[styles.body, { color: colors.textRole.secondary }]}>{meaningFor(active.edge).explanation}</Text>}
                <Text style={[styles.body, { color: colors.textRole.secondary }]}>Choose the option that fits your question. You do not need to learn both as steps.</Text>
                <View style={styles.sheetActions}>
                  <RouteButton label="Use this" accessibilityLabel={`Use ${active.target.label}`} variant="primary" disabled={closing} onPress={() => { onUseTarget(active.target, active.edge); closeSheet(); }} style={styles.action} />
                  <RouteButton label="Close" disabled={closing} onPress={closeSheet} style={styles.action} />
                </View>
              </> : null}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function meaningFor(edge: D078TypedRelationshipEdge): RelationshipMeaning {
  return relationshipMeaning(edge.relationship, true, edge.blockingPolicy) ?? { label: "Related learning", explanation: "This is a connected learning option." };
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  heading: { fontSize: FontSize.lg, lineHeight: 26 },
  row: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.xs },
  rowLabel: { fontSize: 16, lineHeight: 23 },
  body: { fontSize: 16, lineHeight: 24 },
  connectionPair: { fontSize: 16, lineHeight: 23 },
  routeContext: { fontSize: 14, lineHeight: 20 },
  graphExplanation: { borderLeftWidth: 3, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  graphExplanationLabel: { fontSize: 15, lineHeight: 21 },
  linkButton: { alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: Spacing.sm },
  action: { alignSelf: "flex-start", minHeight: 44 },
  hiddenCopy: { fontSize: 15, lineHeight: 22, paddingTop: Spacing.xs },
  modalRoot: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { maxHeight: "82%", borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, borderWidth: 1, padding: Spacing.lg },
  sheetContent: { gap: Spacing.md, paddingBottom: Spacing.xl },
  sheetTitle: { fontSize: 22, lineHeight: 29 },
  compareName: { fontSize: 18, lineHeight: 25 },
  compareButton: { alignSelf: "flex-start", justifyContent: "center" },
  sheetActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, paddingTop: Spacing.sm },
});

export default D078RelationshipPanel;
