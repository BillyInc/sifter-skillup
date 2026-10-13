import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, CareerLearningResource, ComputationalMethodEvidence } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { resourceForItem, studentItemLinkUrl } from "./resourceLinks";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { ContextSourceLinks } from "./ContextSourceLinks";
import { relationshipTargets as resolveRelationshipTargets } from "./contextRelations";
import { GuidanceReportButton } from "./GuidanceReportButton";
import { ContextRelationshipChips, relationshipRecords } from "./ContextRelationshipSheet";
import type { LearningPlanRoute } from "@/lib/guidedLearningPlan";

const PRIORITY_LABEL: Record<NonNullable<CareerContextItem["learningOrder"]>, string> = {
  start_here: "Start here", build_next: "Build next", useful_later: "Useful later", optional: "Optional",
};
const ITEM_TYPE_LABEL: Record<CareerContextItem["itemType"], string> = {
  skill: "Skill", tool: "Tool", competency: "Competency", certification: "Certification or qualification",
  method: "Method", knowledge: "Knowledge", resource: "Learning resource",
};
const ITEM_ICON: Record<CareerContextItem["itemType"], "check-circle" | "layers" | "tool" | "award" | "activity" | "book-open" | "external-link"> = {
  skill: "check-circle", competency: "layers", tool: "tool", certification: "award",
  method: "activity", knowledge: "book-open", resource: "external-link",
};

function relationshipTargets(
  item: CareerContextItem | undefined,
  relationshipType: Parameters<typeof resolveRelationshipTargets>[1],
  items?: CareerContextItem[],
) {
  if (!item) return [];
  // Once the normalized relationship field is present it is authoritative,
  // including when it contains only review-only/not-established coverage.
  // Falling back in that case would turn an audit state into student guidance.
  if (item.relationships !== undefined) {
    return item.relationships
      .filter((edge) => edge.relationshipStatus === "source_backed" && edge.relationshipType === relationshipType)
      .map((edge) => edge.toName || edge.toItemKey || "")
      .filter(Boolean);
  }
  return resolveRelationshipTargets(item, relationshipType, items);
}

function isStudentItem(item: CareerContextItem, resources?: CareerLearningResource[]): boolean {
  const resource = resourceForItem(resources, item.itemType, item.name);
  return item.dataState === "source_backed"
    && item.sourceConfidence !== "unsourced"
    && item.guidanceOwner === item.contextLevel
    && item.claimReviewState === "approved"
    && item.linkState === "linked"
    && Boolean(studentItemLinkUrl(item, resource));
}

/**
 * Renders the owned preparation contract. Unlike the legacy skill/tool arrays,
 * each entry explains its job in this exact domain, subgroup or role and has
 * at most one verified destination attached to the item itself.
 */
export function ContextualItemList({ items, itemTypes, title = "Your preparation path", resources, style, excludeNames, methods, contextLevel, learningFocus, learningRoute, targetStudentId }: {
  items?: CareerContextItem[];
  itemTypes?: CareerContextItem["itemType"][];
  title?: string;
  resources?: CareerLearningResource[];
  style?: ViewStyle;
  /** Names already rendered by an ordered foundation path at the parent level. */
  excludeNames?: string[];
  /** Methods are shown inside the abilities section because they describe how the work is done, not a separate qualification. */
  methods?: (ComputationalMethodEvidence & { subgroupId?: string | null })[];
  /** Optional explicit ownership boundary for a domain/subgroup/role surface. */
  contextLevel?: CareerContextItem["contextLevel"];
  /** Let an authenticated learner include this item in the focused report. */
  learningFocus?: boolean;
  /** Current programme/domain/area/role route for scoped relationship display. */
  learningRoute?: LearningPlanRoute;
  /** Admin-guided save target, when the list is rendered for an administrator. */
  targetStudentId?: string;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const excluded = useMemo(() => new Set((excludeNames ?? []).map((name) => name.trim().toLowerCase()).filter(Boolean)), [excludeNames]);
  const ordered = useMemo(() => {
    const seen = new Set<string>();
    return [...(items ?? [])]
      .filter((item) => isStudentItem(item, resources)
        && (!contextLevel || (item.contextLevel === contextLevel && item.guidanceOwner === contextLevel))
        && (!itemTypes?.length || itemTypes.includes(item.itemType))
        && !excluded.has(item.name.trim().toLowerCase()))
      .filter((item) => {
        const key = `${item.itemType}:${item.itemKey.trim().toLowerCase() || item.name.trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const order = { start_here: 0, build_next: 1, useful_later: 2, optional: 3 };
        const aOrder = a.contextLevel === "domain" ? 4 : order[a.learningOrder ?? a.priority ?? "optional"];
        const bOrder = b.contextLevel === "domain" ? 4 : order[b.learningOrder ?? b.priority ?? "optional"];
        return aOrder - bOrder || a.name.localeCompare(b.name);
      });
  }, [contextLevel, excluded, itemTypes, items, resources]);
  if (!ordered.length) return <View style={[styles.container, style]}>
    <SectionLabel>{title}</SectionLabel>
    <View style={[styles.emptyCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Feather name="inbox" size={17} color={colors.textRole.muted} />
      <Text style={[styles.copy, { color: colors.textRole.secondary }]}>No connected learning items are available for this level yet.</Text>
      <Text style={[styles.limit, { color: colors.textRole.muted }]}>Items appear here only after their explanation is checked for this level and a relevant learning link is verified.</Text>
    </View>
  </View>;
  const visible = expanded ? ordered : ordered.slice(0, 5);
  return <View style={[styles.container, style]}>
    <SectionLabel>{title}</SectionLabel>
    <Text style={[styles.caption, { color: colors.textRole.muted }]}>{contextLevel === "domain"
      ? "These are shared foundations for the field. Choose an area of specialization to see what it adds and in what order to build those capabilities."
      : "Follow this selected path's sequence instead of treating it as a checklist. Open an item to see what it is for, what it builds on and its verified learning or reference link."}</Text>
    {visible.map((item) => {
      const key = `${item.contextKey}:${item.itemType}:${item.itemKey}`;
      const isOpen = openKey === key;
      const resource = resourceForItem(resources, item.itemType, item.name);
      // Source references prove where the statement came from, but they are
      // not automatically item-specific learning links. Only an explicitly
      // attached resource may become a student link; otherwise the card must
      // show the honest no-link state.
      const url = studentItemLinkUrl(item, resource);
      const orderLabel = item.contextLevel === "domain"
        ? (item.useCaseKey ? "Domain learning option" : "Shared domain foundation")
        : PRIORITY_LABEL[item.learningOrder ?? item.priority ?? "optional"];
       const label = item.linkTitle?.trim() || (resource ? `Open ${resource.provider}` : `Open verified information for ${item.name}`);
      return <View key={key} style={[styles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        <View style={styles.header}>
          <View style={{ flex: 1, gap: Spacing.xs }}>
            <Feather name={ITEM_ICON[item.itemType]} size={14} color={colors.accentRole.action} />
            <Text style={[styles.type, { color: colors.textRole.muted }]}>{ITEM_TYPE_LABEL[item.itemType]} · {orderLabel}</Text>
            <Text style={[styles.name, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{item.name}</Text>
            {item.themeLabel || item.useCaseKey ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>{[item.themeLabel, item.useCaseKey?.replace(/[-_]/g, " ")].filter(Boolean).join(" · ")}</Text> : null}
            {item.requirementLevel ? <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{item.requirementLevel === "needed" ? "Needed at this level" : item.requirementLevel === "useful" ? "Useful at this level" : "Optional at this level"}</Text> : null}
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpenKey(isOpen ? null : key)}>
            <Text style={[styles.more, { color: colors.accentRole.action }]}>{isOpen ? "Show less" : "How it fits"}</Text>
          </TouchableOpacity>
          {learningFocus ? <GuidanceReportButton
            targetStudentId={targetStudentId}
            selection={{
              kind: "learningFocus",
              id: `${item.contextLevel}:${item.contextKey}:${item.itemType}:${item.itemKey}`,
              name: item.name,
              contextLevel: item.contextLevel,
              contextKey: item.contextKey,
              itemType: item.itemType,
              itemKey: item.itemKey,
              domainId: item.domainId,
            }}
          /> : null}
        </View>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>What it is: {item.plainMeaning}</Text>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>How it is used here: {item.contextualUse}</Text>
        <ContextRelationshipChips itemName={item.name} relationships={relationshipRecords(item, learningRoute)} />
        {isOpen ? <View style={[styles.detail, { borderTopColor: colors.borderRole.subtle }]}>
          {item.expectedOutput ? <Detail label="What this helps you do" value={item.expectedOutput} /> : null}
          {item.priorityReason && item.contextLevel !== "domain" ? <Detail label="Why this step comes here" value={item.priorityReason} /> : null}
          {item.requirementReason ? <Detail label="Why this requirement level" value={item.requirementReason} /> : null}
          {item.pathTargets?.length ? <View style={styles.methodsInline}>
            <Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Downstream paths this supports</Text>
            {item.pathTargets.map((target) => <View key={`${target.targetLevel}:${target.targetKey}:${target.useCaseKey ?? ""}`}>
              <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{target.targetLabel} · {target.requirementLevel} · {target.pathReason}</Text>
              {target.evidenceLimitations.map((limitation) => <Text key={limitation} style={[styles.limit, { color: colors.textRole.muted }]}>{limitation}</Text>)}
            </View>)}
          </View> : null}
          {relationshipTargets(item, "builds_on", items).length ? <Detail label="Builds on" value={relationshipTargets(item, "builds_on", items).join(" · ")} /> : null}
          {relationshipTargets(item, "works_with", items).length ? <Detail label={item.itemType === "competency" ? "Uses or connects with" : "Works with"} value={relationshipTargets(item, "works_with", items).join(" · ")} /> : null}
          {relationshipTargets(item, "complements", items).length ? <Detail label="Complements" value={relationshipTargets(item, "complements", items).join(" · ")} /> : null}
          {relationshipTargets(item, "alternative", items).length ? <Detail label="Alternatives" value={relationshipTargets(item, "alternative", items).join(" · ")} /> : null}
          {relationshipTargets(item, "supports", items).length ? <Detail label="Supports" value={relationshipTargets(item, "supports", items).join(" · ")} /> : null}
          {relationshipTargets(item, "qualifies_for", items).length ? <Detail label="May support this route" value={relationshipTargets(item, "qualifies_for", items).join(" · ")} /> : null}
          {methodsForItem(methods, item).length ? <View style={styles.methodsInline}>
            <Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Methods used with this capability</Text>
            {methodsForItem(methods, item).map((method, methodIndex) => <View key={`${method.name}-${methodIndex}`} style={[styles.methodCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.methodName, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{method.name}</Text>
              {method.description ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{method.description}</Text> : null}
              <Text style={[styles.limit, { color: colors.textRole.muted }]}>This is a way of applying the capability, not a separate qualification or proof that you already have it.</Text>
              <ExternalLinkGuard
                url={method.learningUrl || undefined}
                label={method.learningLinkTitle ? `Learn ${method.name}: ${method.learningLinkTitle}` : `Open a learning guide for ${method.name}`}
                description={`This opens a verified learning resource for the method ${method.name}.`}
              />
            </View>)}
          </View> : null}
          <View style={[styles.resource, { borderTopColor: colors.borderRole.subtle }]}>
            {resource?.description ? <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{resource.description}</Text> : null}
             {url ? <ExternalLinkGuard url={url} label={label} description={resource?.description || `This opens the verified learning or reference page for ${item.name}.`} /> : <Text style={[styles.caption, { color: colors.textRole.muted }]}>No verified link is available yet.</Text>}
          </View>
          <ContextSourceLinks item={item} resource={resource} />
          {item.evidenceLimitations.map((limitation) => <Text key={limitation} style={[styles.limit, { color: colors.textRole.muted }]}>{limitation}</Text>)}
        </View> : null}
      </View>;
    })}
    {ordered.length > 5 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)}><Text style={[styles.more, { color: colors.accentRole.action }]}>{expanded ? "Show fewer items" : `See all ${ordered.length} items`}</Text></TouchableOpacity> : null}
  </View>;
}

function methodsForItem(
  methods: (ComputationalMethodEvidence & { subgroupId?: string | null })[] | undefined,
  item: CareerContextItem,
) {
  // Embed a method only when the source uses the same named capability. Do
  // not attach every subgroup method to every item by proximity.
  const itemKey = item.name.trim().toLowerCase();
  return (methods ?? []).filter((method) =>
    (!method.dataState || method.dataState === "source_backed")
    && method.claimReviewState === "approved"
    && Boolean(method.learningUrl && method.learningLinkVerifiedAt)
    && method.name.trim().toLowerCase() === itemKey,
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return <View style={styles.detailLine}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm }, caption: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  emptyCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm }, header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm }, name: { fontSize: FontSize.md }, type: { fontSize: FontSize.xs, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 }, copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 }, more: { fontSize: FontSize.sm, fontWeight: "800" }, detail: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.sm }, detailLine: { gap: 2 }, detailLabel: { fontSize: FontSize.sm }, resource: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.xs }, limit: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 }, methodsInline: { gap: Spacing.xs, paddingTop: Spacing.xs }, methodName: { fontSize: FontSize.sm }, methodCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.xs },
});

export default ContextualItemList;
