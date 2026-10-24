import React, { useMemo, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import {
  d078GraphDataForTests,
  d078Node,
  projectD078Route,
  type D078Selection,
  type CombinationCard,
} from "@/lib/d078RouteProjection";
import { RouteButton } from "./RouteButton";
import { explainTechnicalTerms, studentFacingCopy } from "@/lib/studentExplanation";

const data = d078GraphDataForTests();
const PARTICIPATORY_ID = "combo:participatory-method-choice";
const QUANTITATIVE_METHOD_ID = "domain-item:d078-quantitative-approach";
const QUALITATIVE_METHOD_ID = "domain-item:d078-qualitative-approach";
const MIXED_METHOD_ID = "domain-item:d078-mixed-methods";

function learnerCopy(value: string): string {
  return explainTechnicalTerms(value
    .replace(/D078/g, "this field")
    .replace(/shared domain foundations/gi, "foundations for this field")
    .replace(/useful edges/gi, "useful options")
    .replace(/domain sequence/gi, "learning sequence")
    .trim());
}

function methodLine(id: string): string {
  const node = d078Node(id);
  const meaning = node?.meaning ?? node?.plain_language_meaning ?? node?.meaning_in_domain;
  return explainTechnicalTerms(studentFacingCopy(typeof meaning === "string" ? meaning : ""));
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
  const hasDetails = Boolean(methodLine(id) || programmeContext || skip.chip || skip.line);
  return (
    <View testID={`d078-method-card-${id}`} style={[styles.card, expanded && styles.cardExpanded, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text numberOfLines={3} ellipsizeMode="tail" style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text>
      <View style={styles.cardActions}>
        {hasDetails ? <RouteButton
          label={expanded ? "See less" : "See more"}
          accessibilityLabel={`${expanded ? "See less about" : "See more about"} ${label}`}
          onPress={() => setExpanded((value) => !value)}
          variant="secondary"
          style={styles.action}
        /> : <View />}
        <RouteButton
          label={selected ? "Selected" : "Select"}
          accessibilityLabel={`${selected ? "Deselect" : "Select"} ${label}`}
          onPress={onToggle}
          variant={selected ? "selected" : "quiet"}
          style={styles.action}
        />
      </View>
      {expanded ? <View style={styles.expandedDetails}>
        {methodLine(id) ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>{methodLine(id)}</Text> : null}
        {programmeContext ? <View style={[styles.programmeContext, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>How this fits your programme</Text>
          <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{explainTechnicalTerms(programmeContext.student_note)}</Text>
        </View> : null}
        {skip.chip ? <Text style={[styles.chip, { color: colors.textRole.muted }]}>{skip.chip}</Text> : null}
        {skip.line ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{skip.line}</Text> : null}
      </View> : null}
    </View>
  );
}

function CombinationDetails({ combo }: { combo: CombinationCard }) {
  const { colors } = useTheme();
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
            <Text key={item.id} style={[styles.meta, { color: colors.textRole.secondary }]}>• {item.label}</Text>
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
  return (
    <View style={[styles.card, { width: "100%", borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{combo.label}</Text>
      {combo.matchStatus === "partial" ? (
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>
          This is a possible design, but it is not ready to guide your route. Also select: {combo.missingMethodIds.map((id) => d078Node(id)?.label ?? id).join(", ")}.
        </Text>
      ) : null}
      {combo.matchStatus === "exact" ? (
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{isParticipatory ? "This selection fits the participatory frame. Choose it to review the methods, then select the evidence methods you plan to use." : "This exact selection fits this named design. Choose it to see only its supported downstream route."}</Text>
      ) : null}
      {combo.matchStatus === "exact" && !combo.selected ? <CombinationDetails combo={combo} /> : null}
      {combo.selected ? <Text style={[styles.meta, { color: colors.accentRole.action }]}>{isParticipatory ? "The participatory frame is active. Choose one or more evidence methods below; the areas and roles will update to the routes supported by all your choices." : "This named design now controls the route below. Its sequence, method contributions, matching preparation and supported areas appear together there."}</Text> : null}
      {combo.matchStatus === "exact" && !combo.selected && combo.methodContributions.length ? (
        <View style={styles.detailSections}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>What each method contributes</Text>
          {combo.methodContributions.map((item) => (
            <View key={item.methodId} style={styles.detailSection}>
              <Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>{d078Node(item.methodId)?.label ?? item.methodId}</Text>
              <Text style={[styles.body, { color: colors.textRole.secondary }]}>{learnerCopy(item.contribution)}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {isParticipatory && combo.selected ? (
        <View style={styles.components}>
          <Text style={[styles.subheading, { color: colors.textRole.primary }]}>Choose evidence methods inside this design</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>Participatory research is the way decisions are shared with people affected by the issue; interviews, focus groups, surveys and observation are ways to gather evidence within that approach. One evidence method may be enough, or you can combine several when your question and community agreement call for it. The next step keeps only areas and roles supported by every method you selected and explains each method's contribution. This route comparison does not mean every combination suits every study.</Text>
          {combo.requiredMethodIds.map((id) => (
            <View key={id} style={[styles.requiredMethod, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
              <Text style={[styles.body, { color: colors.textRole.primary }]}>{d078Node(id)?.label ?? id}</Text>
              <Text style={[styles.chip, { color: colors.textRole.muted }]}>Included in this combination</Text>
            </View>
          ))}
          {combo.selectableComponentMethodIds.map((id) => {
            const label = d078Node(id)?.label ?? id;
            const selected = combo.selectedComponentMethodIds.includes(id);
            return (
              <View key={id} style={styles.componentOption}>
                <MethodCard id={id} label={label} selected={selected} onToggle={() => onToggleComponent(id)} />
              </View>
            );
          })}
        </View>
      ) : null}
      {combo.matchStatus === "exact" || combo.selected ? (
        <RouteButton
          label={combo.selected ? "Selected design" : "Use this design"}
          accessibilityLabel={`${combo.selected ? "Deselect" : "Select"} ${combo.label}`}
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
  // The method panel now occupies the complete reading surface. Use a compact
  // 4-up grid on desktop, 3-up on tablets, and two-up on wider phones.
  const cardWidth = viewportWidth >= 1100 ? "24%" : viewportWidth >= 760 ? "32%" : viewportWidth >= 420 ? "48.5%" : "100%";
  const mixedMethodsReady = selection.methodIds.includes(QUANTITATIVE_METHOD_ID)
    && selection.methodIds.includes(QUALITATIVE_METHOD_ID);
  const methods = useMemo(() => {
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
  const hasMultiSelection = selection.methodIds.length >= 2;
  const hasExactCombination = combinations.some((combo) => combo.matchStatus === "exact" || combo.matchStatus === "selected");
  const hasPartialCombination = combinations.some((combo) => combo.matchStatus === "partial");

  return (
    <View style={styles.panel}>
      <Text ref={headingRef} accessibilityRole="header" style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Methods of research</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>A method of research is a planned way of gathering and making sense of evidence. Different questions need different kinds of evidence, so you choose the method that fits the question you want to answer.</Text>
      <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Choose a method</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>Choose one method to follow its own route, or select more than one when your question needs different kinds of evidence. Mixed methods appears after you select both quantitative and qualitative methods; other combined designs appear only when the graph supports that exact selection.</Text>
      <View style={styles.list}>
        {methods.map((method) => (
          <View key={method.id} style={{ width: cardWidth }}>
            <MethodCard id={method.id} label={method.label} selected={selection.methodIds.includes(method.id)} onToggle={() => onToggleMethod(method.id)} />
          </View>
        ))}
      </View>
      {hasMultiSelection || selection.combinationIds.length > 0 ? (
        <View style={styles.combinationSection}>
          <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Ways these methods can work together</Text>
          {!hasExactCombination && !hasPartialCombination && selection.combinationIds.length === 0 ? (
            <Text style={[styles.body, { color: colors.textRole.secondary }]}>There is no reviewed combined design for this exact selection, so the app will not merge the separate routes. Remove a method to continue with one route, or choose a supported combination.</Text>
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
      <RouteButton
        label="Clear selected methods"
        accessibilityLabel="Clear selected methods"
        onPress={onClear}
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
  card: { height: 148, padding: 10, gap: 8, borderWidth: 1, borderRadius: Radius.md, alignSelf: "stretch" },
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
  requiredMethod: { gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
  componentOption: { paddingLeft: Spacing.md },
  clear: { alignSelf: "flex-start" },
});

export default MethodChoicePanel;
