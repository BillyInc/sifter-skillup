import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import {
  d078GraphDataForTests,
  d078Node,
  projectD078Route,
  type D078Selection,
  type CombinationCard,
} from "@/lib/d078RouteProjection";
import { RouteButton } from "./RouteButton";

const data = d078GraphDataForTests();
const PARTICIPATORY_ID = "combo:participatory-method-choice";

function learnerCopy(value: string): string {
  return value
    .replace(/D078/g, "this field")
    .replace(/shared domain foundations/gi, "foundations for this field")
    .replace(/useful edges/gi, "useful options")
    .replace(/domain sequence/gi, "learning sequence")
    .trim();
}

function firstSentence(value: unknown): string {
  if (typeof value !== "string") return "";
  const clean = learnerCopy(value);
  const boundary = clean.search(/[.!?](?:\s|$)/);
  return boundary >= 0 ? clean.slice(0, boundary + 1) : clean;
}

function methodLine(id: string): string {
  const node = d078Node(id);
  return firstSentence(node?.meaning ?? node?.plain_language_meaning ?? node?.meaning_in_domain);
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
  const node = d078Node(id);
  const skip = methodSkipCopy(typeof node?.requirement_reason === "string" ? node.requirement_reason : undefined);
  const programmeContext = data.programme_method_context?.[id];
  return (
    <View style={[styles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text>
      {methodLine(id) ? <Text style={[styles.body, { color: colors.textRole.secondary }]}>{methodLine(id)}</Text> : null}
      {programmeContext ? <View style={[styles.programmeContext, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <Text style={[styles.subheading, { color: colors.textRole.primary }]}>How this connects to your programme</Text>
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{programmeContext.student_note}</Text>
        <Text style={[styles.meta, { color: colors.textRole.muted }]}>Curriculum evidence: {programmeContext.course_refs.map((course) => `${course.course_code} · ${course.course_title}`).filter((course, index, all) => all.indexOf(course) === index).join("; ")}</Text>
      </View> : null}
      {skip.chip ? <Text style={[styles.chip, { color: colors.textRole.muted }]}>{skip.chip}</Text> : null}
      {skip.line ? <Text style={[styles.meta, { color: colors.textRole.secondary }]}>{skip.line}</Text> : null}
      <RouteButton
        label={selected ? "Selected" : "Select"}
        accessibilityLabel={`${selected ? "Deselect" : "Select"} ${label}`}
        onPress={onToggle}
        variant={selected ? "selected" : "quiet"}
        style={styles.action}
      />
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
        <Text style={[styles.meta, { color: colors.textRole.secondary }]}>This exact selection fits this named design. Choose it to see only its supported downstream route.</Text>
      ) : null}
      {combo.matchStatus === "exact" && !combo.selected ? <CombinationDetails combo={combo} /> : null}
      {combo.selected ? <Text style={[styles.meta, { color: colors.accentRole.action }]}>This named design now controls the route below. Its sequence, method contributions, matching preparation and supported areas appear together there.</Text> : null}
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
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>Interviews, focus groups, surveys, and observation are options inside this combination. You do not have to use all of them.</Text>
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
  const cardWidth = viewportWidth >= 980 ? "48%" : viewportWidth >= 640 ? "48%" : "100%";
  const [search, setSearch] = useState("");
  const methods = useMemo(() => data.method_node_ids.map((id) => ({ id, label: d078Node(id)?.label ?? id }))
    .filter((item) => item.label.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [search]);
  const projection = useMemo(() => projectD078Route(selection), [selection]);
  const combinations = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return projection.combinations.filter((combo) => combo.matchStatus !== "hidden" && (!q || combo.label.toLocaleLowerCase().includes(q)));
  }, [search, projection]);
  const hasMultiSelection = selection.methodIds.length >= 2;
  const hasExactCombination = combinations.some((combo) => combo.matchStatus === "exact" || combo.matchStatus === "selected");
  const hasPartialCombination = combinations.some((combo) => combo.matchStatus === "partial");

  return (
    <View style={styles.panel}>
      <Text ref={headingRef} accessibilityRole="header" style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Methods of investigation/research</Text>
      <TextInput
        accessibilityLabel="Search methods and combined designs"
        placeholder="Search methods and designs"
        placeholderTextColor={colors.textRole.muted}
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
      />
      <Text style={[styles.groupTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Choose a method</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>You can select one method and follow its own route. If your question needs more than one method, select the additional method too; we will show a combined route only when a reviewed design explains how they work together.</Text>
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
  panel: { gap: Spacing.md },
  sectionTitle: { fontSize: 20, lineHeight: 26 },
  groupTitle: { fontSize: 18, lineHeight: 24, marginTop: Spacing.sm },
  search: { minHeight: 44, paddingHorizontal: Spacing.md, borderWidth: 1, borderRadius: Radius.md, fontSize: 16, lineHeight: 22 },
  list: { gap: Spacing.sm, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  grid: { gap: Spacing.sm },
  combinationSection: { gap: Spacing.sm },
  card: { padding: 12, gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md },
  programmeContext: { gap: Spacing.xs, marginTop: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
  cardTitle: { fontSize: 16, lineHeight: 22 },
  body: { fontSize: 16, lineHeight: 24 },
  chip: { fontSize: 13, lineHeight: 18, fontWeight: "600" },
  meta: { fontSize: 14, lineHeight: 20 },
  action: { alignSelf: "flex-start" },
  detailSections: { gap: Spacing.sm },
  detailSection: { gap: 4, paddingTop: Spacing.xs },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  components: { gap: Spacing.sm, paddingTop: Spacing.sm },
  requiredMethod: { gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm },
  componentOption: { paddingLeft: Spacing.md },
  clear: { alignSelf: "flex-start" },
});

export default MethodChoicePanel;
