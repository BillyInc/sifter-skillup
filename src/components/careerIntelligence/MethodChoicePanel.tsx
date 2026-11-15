import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import { useReducedMotion } from "@/theme/motion";
import {
  d078GraphDataForTests,
  d078Node,
  projectD078Route,
  type D078Selection,
  type CombinationCard,
} from "@/lib/d078RouteProjection";
import { RouteButton } from "./RouteButton";
import { studentFacingCopy } from "@/lib/studentExplanation";

const data = d078GraphDataForTests();
const PARTICIPATORY_ID = "combo:participatory-method-choice";
const QUANTITATIVE_METHOD_ID = "domain-item:d078-quantitative-approach";
const QUALITATIVE_METHOD_ID = "domain-item:d078-qualitative-approach";
const MIXED_METHOD_ID = "domain-item:d078-mixed-methods";

function learnerCopy(value?: string | null, previouslyExplained?: Set<string>): string {
  return studentFacingCopy((value ?? "")
    .replace(/D078/g, "this field")
    .replace(/shared domain foundations/gi, "foundations for this field")
    .replace(/useful edges/gi, "useful options")
    .replace(/domain sequence/gi, "learning sequence")
    .trim(), previouslyExplained);
}

/** Keep choice headings concise; explain the method in its always-visible body. */
function learnerLabel(value?: string | null): string {
  return (value ?? "")
    .replace(/D078/g, "this field")
    .replace(/shared domain foundations/gi, "foundations for this field")
    .replace(/useful edges/gi, "useful options")
    .replace(/domain sequence/gi, "learning sequence")
    .trim();
}

function methodLine(id: string, previouslyExplained?: Set<string>): string {
  const node = d078Node(id);
  const meaning = node?.meaning ?? node?.plain_language_meaning ?? node?.meaning_in_domain;
  return learnerCopy(typeof meaning === "string" ? meaning : "", previouslyExplained);
}

function methodSkipCopy(reason?: string): { chip?: string; line?: string } {
  if (reason?.startsWith("This is a useful recommended learning option")) return {
    chip: "Useful. You can skip it",
    line: "This is a useful option for the work it describes. It is not required for every Social Sciences student. You can continue without it and come back if you need it.",
  };
  if (reason?.startsWith("This is an optional focus")) return {
    chip: "Optional. Open it if this question fits",
    line: "This is an optional focus for a narrower question. You can continue through Social Sciences without it. Select it when that work fits what you want to learn.",
  };
  return {};
}

function MethodCard({ id, label, selected, onToggle }: {
  id: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const node = d078Node(id);
  const skip = methodSkipCopy(typeof node?.requirement_reason === "string" ? node.requirement_reason : undefined);
  const programmeContext = data.programme_method_context?.[id];
  const displayLabel = learnerLabel(label);
  const meaning = methodLine(id);
  const programmeNote = programmeContext ? learnerCopy(programmeContext.student_note) : "";
  const hasDetails = Boolean(programmeContext || skip.chip || skip.line);
  return (
    <View testID={`d078-method-card-${id}`} style={[styles.card, expanded && styles.cardExpanded, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text numberOfLines={3} ellipsizeMode="tail" style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{displayLabel}</Text>
      {meaning ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>{meaning}</Text> : null}
      <View style={styles.cardActions}>
        {hasDetails ? <RouteButton
          label={expanded ? "See less" : "See more"}
          accessibilityLabel={`${expanded ? "See less about" : "See more about"} ${displayLabel}`}
          onPress={() => setExpanded((value) => !value)}
          variant="secondary"
          style={styles.action}
        /> : <View />}
        <RouteButton
          label={selected ? "Selected" : "Select"}
          accessibilityLabel={`${selected ? "Deselect" : "Select"} ${displayLabel}`}
          onPress={onToggle}
          variant={selected ? "selected" : "quiet"}
          style={styles.action}
        />
      </View>
      {expanded ? <View style={styles.expandedDetails}>
        {programmeContext ? <View style={[styles.programmeContext, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>How this fits your programme</Text>
          <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{programmeNote}</Text>
        </View> : null}
        {skip.chip ? <Text style={[styles.chip, { color: colors.textRole.muted }]}>{skip.chip}</Text> : null}
        {skip.line ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{skip.line}</Text> : null}
      </View> : null}
    </View>
  );
}

function CombinationDetails({ combo }: { combo: CombinationCard }) {
  const { colors } = useTheme();
  const explainedTerms = new Set<string>();
  const sections = [
    ["Why these belong together", combo.whyCombine],
    ["How the work proceeds", combo.howUsed],
    ["Use it when", combo.condition],
    ["Keep in mind", combo.limits],
  ].filter(([, text]) => Boolean(text));
  return (
    <View style={styles.detailSections}>
      {sections.map(([title, text]) => (
        <View key={title} style={styles.detailSection}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{learnerCopy(text as string)}</Text>
        </View>
      ))}
      {combo.foundationLinks.length ? (
        <View style={styles.detailSection}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>What prepares these methods</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>These foundations come first and support the selected research design; they are not extra methods to select.</Text>
          {combo.foundationLinks.map((item) => (
            <Text key={item.id} style={[styles.meta, { color: colors.textRole.secondary }]}>• {learnerCopy(item.label, explainedTerms)}</Text>
          ))}
        </View>
      ) : null}
      {combo.selectionRule ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>{learnerCopy(combo.selectionRule)}</Text> : null}
    </View>
  );
}

function CombinationCardView({
  combo,
  selection,
  onToggle,
  onToggleComponent,
}: {
  combo: CombinationCard;
  selection: D078Selection;
  onToggle: () => void;
  onToggleComponent: (methodId: string) => void;
}) {
  const { colors } = useTheme();
  const isParticipatory = combo.id === PARTICIPATORY_ID;
  const displayComboLabel = learnerLabel(combo.label);
  const selectedComponentKey = combo.selectedComponentMethodIds.join("|");
  const [showAdditionalComponents, setShowAdditionalComponents] = useState(combo.selectedComponentMethodIds.length === 0);
  const previousComponentKey = useRef(selectedComponentKey);
  useEffect(() => {
    if (previousComponentKey.current === selectedComponentKey) return;
    previousComponentKey.current = selectedComponentKey;
    // After every evidence-method choice, return to the focused view. The
    // learner can deliberately reveal another compatible choice again.
    setShowAdditionalComponents(combo.selectedComponentMethodIds.length === 0);
  }, [combo.selectedComponentMethodIds.length, selectedComponentKey]);
  const visibleComponentIds = combo.selectedComponentMethodIds.length > 0 && !showAdditionalComponents
    ? combo.selectedComponentMethodIds
    : combo.selectableComponentMethodIds;
  return (
    <View style={[styles.card, { width: "100%", borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{displayComboLabel}</Text>
      {combo.matchStatus === "partial" ? (
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>
          This is a possible design, but it is not ready to guide your route. Also select: {combo.missingMethodIds.map((id) => learnerCopy(d078Node(id)?.label ?? id)).join(", ")}.
        </Text>
      ) : null}
      {combo.matchStatus === "exact" ? (
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{isParticipatory ? "This selection fits the participatory frame. Choose it to review the methods, then select the evidence methods you plan to use." : "This exact selection fits this named design. Choose it to see only its supported downstream route."}</Text>
      ) : null}
      {(combo.matchStatus === "partial" || combo.matchStatus === "exact" && !combo.selected) ? <CombinationDetails combo={combo} /> : null}
      {combo.selected ? <Text style={[styles.meta, { color: colors.accentRole.action }]}>{isParticipatory ? "The participatory frame is active. Choose one or more evidence methods below; the areas and roles will update to the routes supported by all your choices." : "This named design now controls the route below. Its sequence, method contributions, matching preparation and supported areas appear together there."}</Text> : null}
      {combo.matchStatus === "exact" && !combo.selected && combo.methodContributions.length ? (
        <View style={styles.detailSections}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>What each method contributes</Text>
          {combo.methodContributions.map((item) => (
            <View key={item.methodId} style={styles.detailSection}>
              <Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>{learnerLabel(d078Node(item.methodId)?.label ?? item.methodId)}</Text>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{learnerCopy(item.contribution)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {isParticipatory && combo.selected ? (
        <View style={styles.components}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>Choose evidence methods inside this design</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>Participatory research involves people affected by an issue in some research decisions. Interviews, focus groups, surveys and observation can gather evidence within this approach. The question and participants&apos; agreement help determine whether one method or several fit. The next step shows only areas and roles supported by every method you select. Even then, a combination may not suit a particular study.</Text>
          {combo.requiredMethodIds.map((id) => (
            <View key={id} style={[styles.requiredMethod, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
              <Text style={[styles.body, { color: colors.textRole.primary }]}>{learnerCopy(d078Node(id)?.label ?? id)}</Text>
              <Text style={[styles.chip, { color: colors.textRole.muted }]}>Included in this combination</Text>
            </View>
          ))}
          {visibleComponentIds.map((id) => {
            const label = d078Node(id)?.label ?? id;
            const selected = combo.selectedComponentMethodIds.includes(id);
            return (
              <View key={id} style={styles.componentOption}>
                <MethodCard id={id} label={label} selected={selected} onToggle={() => onToggleComponent(id)} />
              </View>
            );
          })}
          {combo.selectedComponentMethodIds.length > 0 && !showAdditionalComponents ? <RouteButton
            label="Add another evidence method"
            accessibilityLabel="Add another evidence method"
            onPress={() => setShowAdditionalComponents(true)}
            variant="secondary"
            style={styles.action}
          /> : null}
        </View>
      ) : null}
      {combo.matchStatus === "exact" || combo.selected ? (
        <RouteButton
          label={combo.selected ? "Selected design" : "Use this design"}
          accessibilityLabel={`${combo.selected ? "Deselect" : "Select"} ${displayComboLabel}`}
          onPress={onToggle}
          variant={combo.selected ? "selected" : "quiet"}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

export function MethodChoicePanel({ selection, onToggleMethod, onToggleCombination, onToggleComponentMethod, onClear, headingRef }: {
  selection: D078Selection;
  onToggleMethod: (methodId: string) => void;
  onToggleCombination: (combinationId: string) => void;
  onToggleComponentMethod: (combinationId: string, methodId: string) => void;
  onClear: () => void;
  headingRef?: React.RefObject<Text | null>;
}) {
  const { colors } = useTheme();
  const { width: viewportWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const transitionOpacity = useRef(new Animated.Value(1)).current;
  const transitionOffset = useRef(new Animated.Value(0)).current;
  const transitionKey = `${selection.methodIds.join("|")}:${selection.combinationIds.join("|")}:${JSON.stringify(selection.componentMethodIds)}`;
  const previousTransitionKey = useRef(transitionKey);
  const [showCompatibleMethods, setShowCompatibleMethods] = useState(false);
  const [editingSelectedMethods, setEditingSelectedMethods] = useState(false);
  useEffect(() => {
    if (previousTransitionKey.current === transitionKey) return;
    previousTransitionKey.current = transitionKey;
    setShowCompatibleMethods(false);
    setEditingSelectedMethods(false);
    transitionOpacity.setValue(reducedMotion ? 1 : 0);
    transitionOffset.setValue(reducedMotion ? 0 : 8);
    Animated.parallel([
      Animated.timing(transitionOpacity, { toValue: 1, duration: reducedMotion ? 0 : 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(transitionOffset, { toValue: 0, duration: reducedMotion ? 0 : 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [reducedMotion, transitionKey, transitionOffset, transitionOpacity]);
  // The method panel now occupies the complete reading surface. Use a compact
  // 4-up grid on desktop, 3-up on tablets, and two-up on wider phones.
  const cardWidth = viewportWidth >= 1100 ? "24%" : viewportWidth >= 760 ? "32%" : viewportWidth >= 420 ? "48.5%" : "100%";
  const mixedMethodsReady = selection.methodIds.includes(QUANTITATIVE_METHOD_ID)
    && selection.methodIds.includes(QUALITATIVE_METHOD_ID);
  const allMethods = useMemo(() => {
    const preferred = [QUANTITATIVE_METHOD_ID, QUALITATIVE_METHOD_ID];
    return data.method_node_ids
    .filter((id) => id !== MIXED_METHOD_ID || mixedMethodsReady)
    .sort((left, right) => {
      const leftRank = preferred.indexOf(left);
      const rightRank = preferred.indexOf(right);
      return (leftRank < 0 ? preferred.length : leftRank) - (rightRank < 0 ? preferred.length : rightRank);
    })
    .map((id) => ({ id, label: d078Node(id)?.label ?? id }));
  }, [mixedMethodsReady]);
  const projection = useMemo(() => projectD078Route(selection), [selection]);
  const combinations = useMemo(() => projection.combinations.filter((combo) => combo.matchStatus !== "hidden"), [projection]);
  const selectedCombination = combinations.find((combo) => combo.selected);
  const selectedMethods = selection.methodIds;
  const compatibleMethodIds = useMemo(() => {
    if (!selectedMethods.length || selectedCombination) return new Set<string>();
    const candidates = new Set<string>();
    for (const combo of combinations) {
      if (combo.matchStatus !== "partial" && combo.matchStatus !== "exact") continue;
      [...combo.requiredMethodIds, ...combo.selectableComponentMethodIds].forEach((id) => candidates.add(id));
    }
    return candidates;
  }, [combinations, selectedCombination, selectedMethods]);
  const hasMultiSelection = selectedMethods.length >= 2;
  const hasExactCombination = combinations.some((combo) => combo.matchStatus === "exact" || combo.matchStatus === "selected");
  const hasPartialCombination = combinations.some((combo) => combo.matchStatus === "partial");
  const showCombinationChoices = !selectedCombination && hasMultiSelection && !editingSelectedMethods;
  const showMethodCards = !selectedCombination && (
    selectedMethods.length === 0
    || selectedMethods.length === 1
    || hasMultiSelection && editingSelectedMethods
  );
  const visibleMethodCards = selectedMethods.length === 0
    ? allMethods
    : selectedMethods.length === 1 && !showCompatibleMethods
      ? allMethods.filter(({ id }) => selectedMethods.includes(id))
    : allMethods.filter(({ id }) => selectedMethods.includes(id) || compatibleMethodIds.has(id));
  const selectedMethodLabels = selectedMethods.map((id) => d078Node(id)?.label ?? id);
  const changeMethods = () => {
    if (selectedCombination) onToggleCombination(selectedCombination.id);
  };
  const clearSelection = () => onClear();

  return (
    <View style={styles.panel}>
      <Text ref={headingRef} accessibilityRole="header" style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Methods of research</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>A method of research is a planned way of gathering and making sense of evidence. Different questions need different kinds of evidence, so you choose the method that fits the question you want to answer.</Text>
      <Animated.View style={{ opacity: transitionOpacity, transform: [{ translateY: transitionOffset }] }}>
      {selectedCombination ? (
        <View style={[styles.selectedRoute, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]} testID="d078-combination-replaces-methods">
          <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Combined design selected</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>The component methods are now represented by this named design. Its own explanation and supported downstream route are shown below. Use the design control if you want to change your choice.</Text>
          <CombinationCardView
            combo={selectedCombination}
            selection={selection}
            onToggle={changeMethods}
            onToggleComponent={(methodId) => onToggleComponentMethod(selectedCombination.id, methodId)}
          />
        </View>
      ) : (
        <>
          <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{selectedMethods.length ? selectedMethods.length === 1 ? "Your selected method" : "Methods you selected" : "Choose a method"}</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{selectedMethods.length
            ? selectedMethods.length === 1
              ? "This method has its own route. You can continue with it alone, or add another method if your question needs a different kind of evidence. Only combinations supported by the learning map can be selected."
              : "These methods are not a route by themselves. Choose the named combined design that fits how you will use their evidence; the app will not merge separate routes."
            : "Choose a method to follow its own route. After that, you can keep the single-method route or deliberately add another method to see only supported combined designs."}</Text>
          {hasMultiSelection && !editingSelectedMethods ? <View style={styles.selectedRoute} testID="d078-selected-method-summary">
            {selectedMethodLabels.map((label) => <Text key={label} style={[styles.chip, { color: colors.textRole.primary }]}>{label}</Text>)}
            <RouteButton label="Change selected methods" accessibilityLabel="Change selected methods" onPress={() => setEditingSelectedMethods(true)} variant="secondary" style={styles.action} />
          </View> : null}
          {showCompatibleMethods ? <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Methods that can combine with {selectedMethodLabels[0]}</Text> : null}
          {editingSelectedMethods ? <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Choose compatible methods or remove a selected method</Text> : null}
          {showMethodCards ? <View style={styles.list}>
            {visibleMethodCards.map((method) => (
              <View key={method.id} style={{ width: cardWidth }}>
                <MethodCard id={method.id} label={method.label} selected={selection.methodIds.includes(method.id)} onToggle={() => onToggleMethod(method.id)} />
              </View>
            ))}
          </View> : null}
          {selectedMethods.length === 1 && compatibleMethodIds.size > 1 && !showCompatibleMethods ? <RouteButton
            label={`Add another method to ${selectedMethodLabels[0]}`}
            accessibilityLabel={`Add another method to ${selectedMethodLabels[0]}`}
            onPress={() => setShowCompatibleMethods(true)}
            variant="secondary"
            style={styles.action}
          /> : null}
          {selectedMethods.length === 1 && compatibleMethodIds.size <= 1 ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>The graph has no reviewed combined design for this method. Keep its individual route or deselect it to choose a different method.</Text> : null}
          {hasMultiSelection && editingSelectedMethods ? <RouteButton
            label="Show designs for these methods"
            accessibilityLabel="Show designs for these methods"
            onPress={() => setEditingSelectedMethods(false)}
            variant="secondary"
            style={styles.action}
          /> : null}
        </>
      )}
      {showCombinationChoices ? (
        <View style={styles.combinationSection}>
          <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Combined designs that fit these choices</Text>
          {!hasExactCombination && !hasPartialCombination && selection.combinationIds.length === 0 ? (
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>There is no reviewed combined design for this selection. The app will not merge separate routes. Remove a method to continue with one route, or change the selection.</Text>
          ) : null}
          <View style={styles.grid}>
            {combinations.map((combo) => (
              <View key={combo.id} style={{ width: "100%" }}>
                <CombinationCardView
                  combo={combo}
                  selection={selection}
                  onToggle={() => onToggleCombination(combo.id)}
                  onToggleComponent={(methodId) => onToggleComponentMethod(combo.id, methodId)}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}
      </Animated.View>
      <RouteButton
        label={selectedCombination ? "Clear selected design" : "Clear selected methods"}
        accessibilityLabel={selectedCombination ? "Clear selected combined design" : "Clear selected methods"}
        onPress={clearSelection}
        disabled={!selection.methodIds.length && !selection.combinationIds.length}
        style={styles.clear}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { width: "100%", alignSelf: "stretch", gap: Spacing.md },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
  groupTitle: { fontSize: 18, lineHeight: 24, marginTop: Spacing.sm },
  list: { width: "100%", gap: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", alignItems: "stretch" },
  grid: { gap: Spacing.sm },
  combinationSection: { gap: Spacing.sm },
  card: { minHeight: 148, padding: 10, gap: 8, borderWidth: 1, borderRadius: Radius.md, alignSelf: "stretch" },
  cardExpanded: { height: "auto" as any, minHeight: 148 },
  cardActions: { marginTop: "auto", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.xs },
  expandedDetails: { gap: Spacing.sm, paddingTop: Spacing.xs },
  programmeContext: { gap: Spacing.xs, marginTop: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
  cardTitle: { fontSize: 15, lineHeight: 20 },
  body: { fontSize: 14, lineHeight: 20 },
  chip: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  meta: { fontSize: 14, lineHeight: 20 },
  action: { alignSelf: "flex-start", minHeight: 44, minWidth: 0, paddingHorizontal: Spacing.sm },
  detailSections: { gap: Spacing.sm },
  detailSection: { gap: 4, paddingTop: Spacing.xs },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  components: { gap: Spacing.sm, paddingTop: Spacing.sm },
  selectedRoute: { gap: Spacing.xs, padding: Spacing.sm, borderWidth: 1, borderRadius: Radius.md },
  requiredMethod: { gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
  componentOption: { paddingLeft: Spacing.md },
  clear: { alignSelf: "flex-start" },
});

export default MethodChoicePanel;
