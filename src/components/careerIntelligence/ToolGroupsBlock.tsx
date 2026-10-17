import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";
import type { CareerContextItem, CareerContextItemPathTarget, CareerContextItemRelationship, CareerLearningResource, ToolGroupsEnriched, ToolV2Enriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { resourceForItem, studentItemLinkUrl } from "./resourceLinks";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { ContextSourceLinks } from "./ContextSourceLinks";
import { contextItemFor, isStudentApprovedContextItem, relationshipTargets as resolveRelationshipTargets } from "./contextRelations";
import { GuidanceReportButton } from "./GuidanceReportButton";
import { ContextRelationshipChips, relationshipRecords } from "./ContextRelationshipSheet";
import { useExploreNav } from "@/lib/exploreNav";
import { learningPlanRouteKey, type LearningPlanRoute } from "@/lib/guidedLearningPlan";
import { studentContextSections, studentFacingCopy, studentReasonCopy, studentResourceRationale, studentOutputCopy } from "@/lib/studentExplanation";

export interface ToolGroupsBlockProps {
  tools: ToolGroupsEnriched;
  resources?: CareerLearningResource[];
  title?: string;
  explanation?: string;
  commonLabel?: string;
  distinctiveLabel?: string;
  style?: ViewStyle;
  contextItems?: CareerContextItem[];
  /** Optional explicit ownership boundary for a domain/subgroup/role surface. */
  contextLevel?: CareerContextItem["contextLevel"];
  /** Let an authenticated learner include a reviewed tool in the focused report. */
  learningFocus?: boolean;
  targetStudentId?: string;
  /** Carry the selected route into the learning-plan tray. */
  learningRoute?: LearningPlanRoute;
  areaName?: string;
}

type ToolPurposeKey = "collect" | "organise" | "analyse" | "compute" | "map" | "communicate" | "other";

const TOOL_PURPOSES: Record<ToolPurposeKey, { title: string; explanation: string; order: number }> = {
  collect: { title: "Collect information", explanation: "Gather responses, observations or records before you analyse them.", order: 1 },
  organise: { title: "Organise and query information", explanation: "Prepare, store and find the information you need for a study or decision.", order: 2 },
  analyse: { title: "Analyse evidence", explanation: "Examine data, compare patterns and support conclusions with evidence.", order: 3 },
  compute: { title: "Compute and automate", explanation: "Use code or repeatable workflows when the work needs calculation, modelling or scale.", order: 4 },
  map: { title: "Study place and space", explanation: "Connect questions to locations, communities and geographic patterns.", order: 5 },
  communicate: { title: "Explain and present findings", explanation: "Turn evidence into documents, charts, presentations or material other people can understand.", order: 6 },
  other: { title: "Other options", explanation: "These tools are listed, but there is not yet enough information to group them by a clear kind of work.", order: 7 },
};

// The stored edge type is the canonical singular `alternative`; this explicit
// UI-group label (`alternatives`) keeps the student relationship contract discoverable to the
// static downstream audit while preserving the existing data semantics.
const RELATIONSHIP_GROUP_ALTERNATIVES = "Alternatives";

function purposeIcon(key: ToolPurposeKey): keyof typeof Feather.glyphMap {
  if (key === "analyse") return "bar-chart-2";
  if (key === "collect") return "clipboard";
  if (key === "organise") return "database";
  if (key === "compute") return "code";
  if (key === "map") return "map";
  if (key === "communicate") return "message-square";
  return "tool";
}

function toolIcon(name: string): keyof typeof Feather.glyphMap {
  const value = name.trim().toLowerCase();
  if (/excel|access|sql|mysql|database|redshift|snowflake/.test(value)) return "database";
  if (/spss|sas|stata|r$|power bi|tableau/.test(value)) return "bar-chart-2";
  if (/python|visual studio|vba|spark|scala/.test(value)) return "code";
  if (/arcgis|gis|qgis/.test(value)) return "map";
  if (/qualtrics|redcap|survey/.test(value)) return "clipboard";
  if (/powerpoint|word|office|photoshop|document/.test(value)) return "file-text";
  return "tool";
}

function purposeForTool(tool: ToolV2Enriched): ToolPurposeKey {
  if (tool.purposeKey && TOOL_PURPOSES[tool.purposeKey]) return tool.purposeKey;
  const category = String(tool.elementName || "").toLowerCase();
  const name = String(tool.tool || "").toLowerCase();
  if (/survey|data collection|electronic data capture|questionnaire|interview/.test(category) || /qualtrics|redcap/.test(name)) return "collect";
  if (/spreadsheet|database|data base|query|data management/.test(category) || /excel|access|mysql|sql|redshift|snowflake/.test(name)) return "organise";
  if (/analytical|scientific|statistical|business intelligence|data analysis|data mining/.test(category) || /spss|stata|sas|power bi|tableau/.test(name)) return "analyse";
  if (/development environment|programming|object or component|web platform/.test(category) || /python|r|scala|javascript|java|c\+\+/.test(name)) return "compute";
  if (/geographic|mapping|gis/.test(category) || /arcgis|qgis/.test(name)) return "map";
  if (/presentation|word processing|document management|office suite|desktop publishing|graphics|photo|electronic mail/.test(category) || /powerpoint|word|docs|acrobat|photoshop/.test(name)) return "communicate";
  return "other";
}

function isSourceCategory(label: string): boolean {
  return [
    "spreadsheet software",
    "analytical or scientific software",
    "development environment software",
    "data base management system software",
    "data base user interface and query software",
    "enterprise application integration software",
    "office suite software",
    "project management software",
    "web platform development software",
    "business intelligence and data analysis software",
    "object or component oriented development software",
    "content workflow software",
  ].includes(label.trim().toLowerCase());
}

function isNonActionableTool(tool: ToolV2Enriched): boolean {
  const labels = [tool.tool, tool.elementName].filter(Boolean).map((value) => String(value).trim().toLowerCase());
  return labels.some((label) => isSourceCategory(label) || [
    "microsoft office software",
    "facebook",
    "instagram",
    "whatsapp",
    "mozilla firefox",
    "google chrome",
    "safari",
  ].includes(label));
}

function studentRelationshipTargets(
  item: CareerContextItem | undefined,
  relationshipType: Parameters<typeof resolveRelationshipTargets>[1],
  items?: CareerContextItem[],
) {
  if (!item) return [];
  // A present normalized relationship array is authoritative. This prevents
  // not-established coverage from falling back to legacy guessed arrays.
  if (item.relationships !== undefined) {
    return item.relationships
      .filter((edge) => edge.relationshipStatus === "source_backed" && edge.relationshipType === relationshipType)
      .map((edge) => edge.toName || edge.toItemKey || "")
      .filter(Boolean);
  }
  return resolveRelationshipTargets(item, relationshipType, items);
}

function ToolCard({
  tool,
  prominent,
  resource,
  contextItems,
  scopeLabel,
  learningFocus,
  targetStudentId,
  learningRoute,
  areaName,
}: {
  tool: ToolV2Enriched;
  prominent: boolean;
  resource?: CareerLearningResource;
  contextItems?: CareerContextItem[];
  scopeLabel?: string;
  learningFocus?: boolean;
  targetStudentId?: string;
  learningRoute?: LearningPlanRoute;
  areaName?: string;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const [expanded, setExpanded] = useState(false);
  const relation = contextItemFor(contextItems, "tool", tool.tool);
  const linkEvidence = relation?.linkEvidence;
  const resourceReason = typeof linkEvidence?.why_this_resource === "string"
    ? linkEvidence.why_this_resource
    : typeof linkEvidence?.supports === "string"
      ? linkEvidence.supports
      : resource?.description;
  const resourceLocator = typeof relation?.linkSourceReference?.locator === "string"
    ? relation.linkSourceReference.locator
    : undefined;
  const url = studentItemLinkUrl(relation, resource, tool.toolUrl);
  const purpose = purposeForTool(tool);
  const definition = TOOL_PURPOSES[purpose];
  const meaning = studentFacingCopy(relation?.plainMeaning);
  const contextualUse = studentFacingCopy(studentContextSections(relation?.contextualUse).meaning);
  const output = studentOutputCopy(relation?.expectedOutput, relation?.contextualUse);
  const preview = [meaning, contextualUse].filter(Boolean).join(" ") || definition.explanation;
  const requirement = toolRequirementLabel(relation?.requirementLevel);
  const resourceExplanation = studentResourceRationale(resourceReason, tool.tool, relation?.contextualUse, resourceLocator);
  const backedRelationships = (relation?.relationships ?? []).filter((edge: CareerContextItemRelationship) => edge.relationshipStatus === "source_backed");
  const backedTargets = (relation?.pathTargets ?? []).filter((target: CareerContextItemPathTarget) => target.relationshipStatus === "source_backed");
  const studentRelationships = relation ? relationshipRecords(relation) : [];
  const hasDetails = Boolean(
    relation?.plainMeaning
    || relation?.contextualUse
    || relation?.expectedOutput
    || relation?.prerequisites?.length
    || relation?.evidenceLimitations?.length
    || backedRelationships.length
    || backedTargets.length,
  );
  return (
    <View style={[styles.toolCard, { backgroundColor: prominent ? colors.surface.subtle : colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <View style={styles.toolHeading}>
        <Feather name={toolIcon(String(tool.tool ?? ""))} size={16} color={colors.accentRole.action} />
        <Text style={[styles.toolName, { color: colors.textRole.primary }]} numberOfLines={2}>{tool.tool}</Text>
        {learningFocus && relation ? <GuidanceReportButton
          targetStudentId={targetStudentId}
          selection={{
            kind: "learningFocus",
            id: `${relation.contextLevel}:${relation.contextKey}:tool:${relation.itemKey}`,
            name: relation.name,
            contextLevel: relation.contextLevel,
            contextKey: relation.contextKey,
            itemType: "tool",
            itemKey: relation.itemKey,
            routeKey: learningRoute ? learningPlanRouteKey(learningRoute) : undefined,
            domainId: relation.domainId,
            programmeId: learningRoute?.programmeId,
            subgroupId: learningRoute?.areaId,
            subgroupName: areaName,
            roleId: learningRoute?.roleId,
            roleName: learningRoute?.roleId,
          }}
          onOpenPlan={() => exploreNav.guided(router, { programmeId: learningRoute?.programmeId, domainId: learningRoute?.domainId, areaId: learningRoute?.areaId, roleId: learningRoute?.roleId, focused: true, openTray: true })}
        /> : null}
      </View>
      <Text style={[styles.toolPurpose, { color: colors.textRole.muted }]}>{definition.title} · {requirement}</Text>
      {scopeLabel ? <Text style={[styles.toolScope, { color: colors.textRole.muted }]}>{scopeLabel}</Text> : null}
      <ContextRelationshipChips itemName={tool.tool} relationships={studentRelationships} />
      <Text style={[styles.toolNote, { color: colors.textRole.secondary }]}>{preview}</Text>
      {hasDetails ? <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={[styles.detailButton, { borderColor: colors.borderRole.subtle }]}
      >
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={15} color={colors.accentRole.action} />
        <Text style={[styles.detailButtonText, { color: colors.accentRole.action }]}>{expanded ? "Hide how this tool fits" : "How this tool fits"}</Text>
      </TouchableOpacity> : null}
      {expanded ? <View style={[styles.toolDetails, { borderTopColor: colors.borderRole.subtle }]}>
        {meaning ? <ToolDetail label="What it is" value={meaning} colors={colors} /> : null}
        {contextualUse ? <ToolDetail label="How it is used in this field" value={contextualUse} colors={colors} /> : null}
        {output ? <ToolDetail label="What you may produce" value={output} colors={colors} /> : null}
        {url ? <ToolDetail label="Why this learning link is here" value={resourceExplanation} colors={colors} /> : null}
        {relation?.requirementLevel ? <ToolDetail label="Why it appears in this route" value={`${requirement}.${relation.requirementReason ? ` ${studentReasonCopy(relation.requirementReason)}` : ""}`} colors={colors} /> : null}
        {relation?.prerequisites?.length ? <ToolDetail label="What may help you prepare" value={`${relation.prerequisites.map(studentFacingCopy).filter(Boolean).join(" ")} These notes do not create an automatic block or fixed order.`} colors={colors} /> : null}
        {backedRelationships.length ? <View style={styles.toolDetailGroup}>
          <Text style={[styles.toolDetailLabel, { color: colors.textRole.primary }]}>How this tool connects to other learning</Text>
          {backedRelationships.map((edge: CareerContextItemRelationship, index: number) => <Text key={`${edge.relationshipType}-${edge.toItemKey ?? edge.toName ?? index}`} style={[styles.toolNote, { color: colors.textRole.secondary }]}>
            {relationshipDisplayLabel(edge.relationshipType)}: {edge.toName || edge.toItemKey || "related item"}. {studentFacingCopy(edge.learnerExplanation) || "The reviewed record connects this tool with the related learning for this kind of work."}{edge.evidenceLimitations?.length ? ` Limit: ${edge.evidenceLimitations.map(studentFacingCopy).filter(Boolean).join(" ")}` : ""}
          </Text>)}
        </View> : null}
        {backedTargets.length ? <View style={styles.toolDetailGroup}>
          <Text style={[styles.toolDetailLabel, { color: colors.textRole.primary }]}>Routes this can support</Text>
          {backedTargets.map((target: CareerContextItemPathTarget) => <Text key={`${target.targetLevel}-${target.targetKey}`} style={[styles.toolNote, { color: colors.textRole.secondary }]}>
            {target.targetLabel} · {routeContributionLabel(target.requirementLevel)}. {studentFacingCopy(target.pathReason)}{target.evidenceLimitations.length ? ` Limit: ${target.evidenceLimitations.map(studentFacingCopy).filter(Boolean).join(" ")}` : ""}
          </Text>)}
        </View> : null}
        {relation?.evidenceLimitations?.length ? <View style={styles.toolDetailGroup}>
          <Text style={[styles.toolDetailLabel, { color: colors.textRole.primary }]}>What it cannot prove or replace</Text>
          {relation.evidenceLimitations.map((limitation: string) => <Text key={limitation} style={[styles.toolNote, { color: colors.textRole.muted }]}>{studentFacingCopy(limitation)}</Text>)}
        </View> : null}
        <Text style={[styles.toolNote, { color: colors.textRole.muted }]}>Using this tool does not by itself prove competence, qualification or job readiness.</Text>
      </View> : null}
        <ExternalLinkGuard
        url={url}
        label={url ? `Open ${tool.tool}` : `No verified link for ${tool.tool}`}
          description={resourceExplanation}
        textStyle={{ color: colors.accentRole.action }}
      />
      <ContextSourceLinks item={relation} resource={resource} />
    </View>
  );
}

function relationshipDisplayLabel(type: CareerContextItemRelationship["relationshipType"]): string {
  if (type === "builds_on") return "Builds on";
  if (type === "works_with") return "Works with";
  if (type === "complements") return "Complements";
  if (type === "alternative") return RELATIONSHIP_GROUP_ALTERNATIVES;
  if (type === "qualifies_for") return "Qualification route";
  return "Supports";
}

function routeContributionLabel(level?: string | null): string {
  if (level === "needed") return "Needed for this chosen route";
  if (level === "useful") return "Useful for this route";
  if (level === "optional") return "Optional route connection";
  return "Useful when this situation applies";
}

function toolRequirementLabel(level?: CareerContextItem["requirementLevel"]): string {
  if (level === "needed") return "needed for this chosen route";
  if (level === "useful") return "a useful option for this work";
  if (level === "optional") return "an optional learning focus";
  return "a learning option for this route";
}

function ToolDetail({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  return <View style={styles.toolDetailGroup}>
    <Text style={[styles.toolDetailLabel, { color: colors.textRole.primary }]}>{label}</Text>
    <Text style={[styles.toolNote, { color: colors.textRole.secondary }]}>{value}</Text>
  </View>;
}

function ToolGroup({
  label,
  entries,
  prominent,
  resources,
  contextItems,
  learningFocus,
  targetStudentId,
  learningRoute,
  areaName,
}: {
  label: string;
  entries: { tool: ToolV2Enriched; scopeLabel?: string }[];
  prominent: boolean;
  resources?: CareerLearningResource[];
  contextItems?: CareerContextItem[];
  learningFocus?: boolean;
  targetStudentId?: string;
  learningRoute?: LearningPlanRoute;
  areaName?: string;
}) {
  const { colors } = useTheme();
  if (!entries.length) return null;
  return (
    <View style={styles.group}>
      <Text style={[styles.subLabel, { color: colors.textRole.muted }]}>{label}</Text>
      <View style={styles.toolGrid}>
        {entries.map(({ tool, scopeLabel }, index) => (
          <ToolCard
            key={`${tool.tool}-${index}`}
            tool={tool}
            prominent={prominent}
            resource={resourceForItem(resources, "tool", String(tool.tool ?? ""))}
            contextItems={contextItems}
            scopeLabel={scopeLabel}
            learningFocus={learningFocus}
            targetStudentId={targetStudentId}
            learningRoute={learningRoute}
            areaName={areaName}
          />
        ))}
      </View>
    </View>
  );
}

function PurposePath({
  entries,
  resources,
  contextItems,
  learningFocus,
  targetStudentId,
  learningRoute,
  areaName,
}: {
  entries: { tool: ToolV2Enriched; scopeLabel?: string }[];
  resources?: CareerLearningResource[];
  contextItems?: CareerContextItem[];
  learningFocus?: boolean;
  targetStudentId?: string;
  learningRoute?: LearningPlanRoute;
  areaName?: string;
}) {
  const [expandedPurposes, setExpandedPurposes] = useState<Set<ToolPurposeKey>>(new Set());
  const groups = new Map<ToolPurposeKey, { tool: ToolV2Enriched; scopeLabel?: string }[]>();
  for (const entry of entries) {
    const key = purposeForTool(entry.tool);
    groups.set(key, [...(groups.get(key) || []), entry]);
  }
  return (
    <View style={styles.purposePath}>
      <Text style={styles.pathIntro}>Choose the kind of work first. You do not need every tool in a purpose; choose one starting option, then add another only when your work requires it.</Text>
      {[...groups.entries()].sort(([a], [b]) => TOOL_PURPOSES[a].order - TOOL_PURPOSES[b].order).map(([key, purpose]) => {
        const sourceDefinition = purpose.find(({ tool }) => tool.purposeKey === key && tool.purposeLabel)?.tool;
        const definition = {
          title: sourceDefinition?.purposeLabel || TOOL_PURPOSES[key].title,
          explanation: sourceDefinition?.purposeDescription || TOOL_PURPOSES[key].explanation,
        };
        const isExpanded = expandedPurposes.has(key);
        const displayedPurpose = isExpanded ? purpose : purpose.slice(0, 4);
        return (
          <View key={key} style={styles.purposeCard}>
            <View style={styles.purposeHeading}><Feather name={purposeIcon(key)} size={17} color="#F59E0B" /><Text style={styles.purposeTitle}>{definition.title}</Text></View>
            <Text style={styles.purposeExplanation}>{definition.explanation}</Text>
            <Text style={styles.optionLabel}>Options recorded for this purpose</Text>
            <Text style={styles.purposeNote}>{purpose.length > 1 ? "These are different options for a similar kind of work. Choose one to start; you do not need to learn them all." : "This is one recorded option for this kind of work. It is not a universal requirement."}</Text>
          <ToolGroup label="Named options" entries={displayedPurpose} prominent resources={resources} contextItems={contextItems} learningFocus={learningFocus} targetStudentId={targetStudentId} learningRoute={learningRoute} areaName={areaName} />
            {purpose.length > 4 ? <TouchableOpacity onPress={() => setExpandedPurposes((current) => {
              const next = new Set(current);
              if (next.has(key)) next.delete(key); else next.add(key);
              return next;
            })} accessibilityRole="button" accessibilityState={{ expanded: isExpanded }}>
              <Text style={styles.moreText}>{isExpanded ? "Show fewer options" : `See ${purpose.length - 4} more ${definition.title.toLowerCase()} options`}</Text>
            </TouchableOpacity> : null}
          </View>
        );
      })}
    </View>
  );
}

export function ToolGroupsBlock({
  tools,
  resources,
  title,
  explanation = "Start with the tools shown first. The rest become more useful as you choose an area or role.",
  commonLabel,
  distinctiveLabel,
  style,
  contextItems,
  contextLevel,
  learningFocus,
  targetStudentId,
  learningRoute,
  areaName,
}: ToolGroupsBlockProps) {
  const isStudentVisible = (tool: ToolV2Enriched) =>
    Boolean(tool.tool?.trim())
    && !isNonActionableTool(tool)
    && tool.guidanceOwner !== "role_aggregated"
    && tool.guidanceOwner !== "review_only"
    && tool.guidanceOwner !== "audit_only"
     && (!contextLevel || tool.guidanceOwner === contextLevel)
    && (!tool.dataState || tool.dataState === "source_backed")
    && tool.sourceConfidence !== "unsourced"
    && isStudentApprovedContextItem(contextItemFor(contextItems, "tool", tool.tool))
    && (purposeForTool(tool) !== "other" || Boolean(tool.purposeLabel && tool.purposeDescription));
  const seen = new Set<string>();
  const selectTools = (list: ToolV2Enriched[]) => list.filter(isStudentVisible).filter((tool) => {
    const key = tool.tool.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const common = selectTools(tools?.common ?? []);
  const distinctive = selectTools(tools?.distinctive ?? []);
  const includedNames = new Set([...common, ...distinctive].map((tool) => tool.tool.trim().toLowerCase()));
  // D078's reviewed tool contracts are owned by career_context_items, not the
  // legacy domain-tools array. Use those exact approved records as the source
  // for purpose cards so an empty legacy array cannot hide reviewed tools.
  const contextualTools = (contextItems ?? [])
    .filter((item) => item.itemType === "tool"
      && (!contextLevel || item.contextLevel === contextLevel)
      && item.guidanceOwner === item.contextLevel
      && isStudentApprovedContextItem(item)
      && !includedNames.has(item.name.trim().toLowerCase()))
    .map((item) => {
      const tool = {
        tool: item.name,
        group: "distinctive" as const,
        elementName: item.themeLabel,
        purposeLabel: "Explore this tool",
        purposeDescription: item.plainMeaning || item.contextualUse || "Open the tool card to see how it is used in this field.",
        guidanceOwner: item.guidanceOwner,
        dataState: item.dataState,
        sourceConfidence: item.sourceConfidence,
      } as ToolV2Enriched;
      includedNames.add(item.name.trim().toLowerCase());
      return { tool, scopeLabel: undefined };
    });
  const entries = [
    ...common.map((tool) => ({ tool, scopeLabel: commonLabel || "Useful across this level" })),
    ...distinctive.map((tool) => ({ tool, scopeLabel: distinctiveLabel || "More specialised at this level" })),
    ...contextualTools,
  ];

  return (
    <View style={[styles.container, style]}>
      {title ? <SectionLabel>{title}</SectionLabel> : null}
      <Text style={styles.explanation}>{explanation}</Text>
      {entries.length ? <PurposePath entries={entries} resources={resources} contextItems={contextItems} learningFocus={learningFocus} targetStudentId={targetStudentId} learningRoute={learningRoute} areaName={areaName} /> : <View style={styles.emptyCard}><Feather name="tool" size={17} color="#6B7280" /><Text style={styles.toolNote}>No named tools are available in the reviewed guidance for this level yet.</Text></View>}
    </View>
  );
}

export default ToolGroupsBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  purposePath: { gap: Spacing.sm },
  pathIntro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  purposeCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB", borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  purposeHeading: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  purposeTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  purposeExplanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  purposeNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  optionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: "uppercase", letterSpacing: 0.7 },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  toolCard: { flex: 1, minWidth: 230, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  toolHeading: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  toolName: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: FontSize.sm * 1.35 },
  detailButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, marginTop: Spacing.xs },
  detailButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  toolDetails: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.sm, marginTop: Spacing.xs },
  toolDetailGroup: { gap: 2 },
  toolDetailLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  toolPurpose: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  toolScope: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, lineHeight: FontSize.xs * 1.3 },
  explanation: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  group: { gap: Spacing.sm },
  subLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, letterSpacing: 0.8, textTransform: "uppercase" },
  toolNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35, maxWidth: 520 },
  moreText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: "#D97706" },
  emptyCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#E5E7EB", borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
});
