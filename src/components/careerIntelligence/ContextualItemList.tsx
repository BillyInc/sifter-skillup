import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, CareerLearningResource, ComputationalMethodEvidence } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { isStudentResource, resourceForItem, studentItemLinkUrl } from "./resourceLinks";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { ContextSourceLinks } from "./ContextSourceLinks";
import { GuidanceReportButton } from "./GuidanceReportButton";
import { ContextRelationshipChips, relationshipRecords } from "./ContextRelationshipSheet";
import { learningPlanRouteKey, type LearningPlanRoute } from "@/lib/guidedLearningPlan";
import { studentContextSections, studentFacingCopy, studentGeographicContext, studentItemLimitations, studentOutputCopy, studentReasonCopy, studentResourceRationale } from "@/lib/studentExplanation";
import { useExploreNav } from "@/lib/exploreNav";

const ITEM_TYPE_LABEL: Record<CareerContextItem["itemType"], string> = {
  skill: "Skill", tool: "Tool", competency: "Competency", certification: "Certification or qualification",
  method: "Method", knowledge: "Knowledge", resource: "Learning resource",
};
const ITEM_ICON: Record<CareerContextItem["itemType"], "check-circle" | "layers" | "tool" | "award" | "activity" | "book-open" | "external-link"> = {
  skill: "check-circle", competency: "layers", tool: "tool", certification: "award",
  method: "activity", knowledge: "book-open", resource: "external-link",
};

function studentCopy(value?: string | null): string {
  return studentFacingCopy(value);
}

function studentReason(value?: string | null): string {
  return studentReasonCopy(value);
}

function contextLabel(level: CareerContextItem["contextLevel"]): string {
  if (level === "programme") return "this programme";
  if (level === "subgroup") return "this area";
  if (level === "role") return "this role";
  return "this field";
}

function requirementLabel(item: CareerContextItem): string {
  if (item.requirementLevel === "needed") return "Needed for this chosen route";
  // Use-case grouping and requirement status answer different questions. A
  // missing use-case key must never turn an optional item into a foundation.
  if (item.contextLevel === "domain" && item.requirementLevel === "useful" && !item.useCaseKey) return "Useful across several routes";
  if (item.requirementLevel === "useful") return "Useful option for this work";
  if (item.requirementLevel === "optional") return "Optional learning focus";
  return "Learning option for this route";
}

function normalizedItemKey(value?: string | null): string {
  return String(value ?? "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

const ITEM_RESOURCE_TYPES: Record<CareerContextItem["itemType"], CareerLearningResource["resourceType"][]> = {
  skill: ["skill_learning", "skill_reference"],
  tool: ["tool_learning"],
  competency: ["competency_reference"],
  certification: ["certification_exam", "professional_body"],
  method: ["skill_learning", "tool_learning", "competency_reference"],
  knowledge: ["programme_reading", "domain_overview", "skill_learning"],
  resource: ["programme_reading", "domain_overview", "role_reference", "skill_learning"],
};

function itemResources(resources: CareerLearningResource[] | undefined, item: CareerContextItem): CareerLearningResource[] {
  const name = item.name.trim().toLowerCase();
  if (!name) return [];
  return (resources ?? []).filter((resource) => {
    const target = resource.targetName.trim().toLowerCase();
    return ITEM_RESOURCE_TYPES[item.itemType].includes(resource.resourceType)
      && isStudentResource(resource, item.contextLevel)
      && (target === name || target.startsWith(`${name} `) || target.startsWith(`${name}:`));
  });
}

function learningResourceKind(resource: CareerLearningResource): string {
  if (["skill_reference", "competency_reference", "role_reference", "professional_body", "certification_exam", "domain_overview", "programme_reading"].includes(resource.resourceType)) {
    return "Official or reference information";
  }
  if (/official|documentation|reference/i.test(`${resource.provider} ${resource.delivery ?? ""}`)) return "Product documentation/reference";
  if (/video/i.test(resource.delivery ?? "")) return resource.accessType === "paid" ? "Paid video learning" : "Video learning";
  if (resource.accessType === "paid") return "Paid learning alternative";
  if (resource.accessType === "free") return "Free learning";
  return "Additional learning option";
}

/** Apply only sequence edges explicitly approved as hard prerequisites. Ordinary
 * builds-on, workflow, complementary and alternative relationships remain
 * visible guidance; they must not be converted into blocking order. */
function sequenceByDependencies(items: CareerContextItem[], route?: { programmeId?: string; domainId?: string; areaId?: string; roleId?: string }): CareerContextItem[] {
  const base = [...items];
  const order = new Map(base.map((item, index) => [item, index]));
  const byIdentity = new Map<string, CareerContextItem>();
  for (const item of base) {
    byIdentity.set(normalizedItemKey(item.name), item);
    byIdentity.set(normalizedItemKey(item.itemKey), item);
  }
  const dependencies = new Map<CareerContextItem, Set<CareerContextItem>>();
  for (const item of base) {
    const edges = (item.relationships ?? []).filter((edge) => {
      if (edge.relationshipStatus !== "source_backed"
        || edge.sequenceApproved !== true
        || !["hard_prerequisite", "conditional_prerequisite"].includes(edge.sequencePolicy ?? "")
        || !["builds_on", "prerequisite", "requires"].includes(edge.relationshipType)) return false;
      if (edge.sequencePolicy !== "conditional_prerequisite" || !edge.sequenceScope) return true;
      const scope = edge.sequenceScope;
      return (!scope.programmeIds?.length || Boolean(route?.programmeId && scope.programmeIds.includes(route.programmeId)))
        && (!scope.domainIds?.length || Boolean(route?.domainId && scope.domainIds.includes(route.domainId)))
        && (!scope.areaIds?.length || Boolean(route?.areaId && scope.areaIds.includes(route.areaId)))
        && (!scope.roleIds?.length || Boolean(route?.roleId && scope.roleIds.includes(route.roleId)));
    });
    const targets = new Set<CareerContextItem>();
    for (const edge of edges) {
      const target = byIdentity.get(normalizedItemKey(edge.toName)) ?? byIdentity.get(normalizedItemKey(edge.toItemKey));
      if (target && target !== item) targets.add(target);
    }
    dependencies.set(item, targets);
  }
  const remaining = new Set(base);
  const output: CareerContextItem[] = [];
  while (remaining.size) {
    const ready = [...remaining].filter((item) => [...(dependencies.get(item) ?? [])].every((dependency) => !remaining.has(dependency)));
    // A malformed/cyclic edge set must not drop items or hang the learner view.
    const next = ready.length ? ready : [...remaining].sort((a, b) => order.get(a)! - order.get(b)!);
    const chosen = next[0];
    remaining.delete(chosen);
    output.push(chosen);
  }
  return output;
}

function routeContributionLabel(level?: string): string {
  if (level === "needed" || level === "required") return "Needed for this route";
  if (level === "conditional") return "Useful when this situation applies";
  if (level === "useful") return "Useful for this route";
  if (level === "optional") return "Optional connection";
  return "Connected direction";
}

function studentSections(value?: string | null) {
  const sections = studentContextSections(value);
  return {
    meaning: studentCopy(sections.meaning),
    task: studentCopy(sections.task),
    output: studentCopy(sections.output),
    guardrail: studentCopy(sections.guardrail),
  };
}

/** Expand terse source-checked link rationales using only this item's reviewed
 * route context and the exact locator already attached to the resource. */
export function explainResourceRationale(
  reason: string,
  item: Pick<CareerContextItem, "name" | "contextualUse" | "linkSourceReference">,
): string {
  const cleanReason = studentCopy(reason);
  if (!cleanReason) return studentResourceRationale(reason, item.name, item.contextualUse);
  if (cleanReason.split(/\s+/).length >= 18) return cleanReason;

  const use = studentSections(item.contextualUse).meaning || studentCopy(item.contextualUse);
  const locatorValue = item.linkSourceReference?.locator;
  const locator = typeof locatorValue === "string" ? studentCopy(locatorValue) : "";
  const rationale = `This resource is included to help you learn or review ${cleanReason.replace(/[.!?]+$/, "")}.`;
  const routeContext = use
    ? "It supports the work explained above, but may cover only part of that work."
    : `It relates to the learning item “${item.name}”.`;
  const startHere = locator ? `Start with “${locator}”.` : "";
  return [rationale, routeContext, startHere, "It is a learning aid, not proof of competence."]
    .filter(Boolean)
    .join(" ");
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
export function ContextualItemList({ items, itemTypes, title = "Your preparation path", resources, style, excludeNames, methods, contextLevel, itemScope, sequenceBand, learningFocus, learningRoute, domainName, areaName, roleName, routeRoleIds, targetStudentId }: {
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
  /** Keep shared field foundations separate from domain-specific additions. */
  itemScope?: "shared-foundation" | "learning-options";
  /** Restrict this card to one reviewed display band in the sequence contract. */
  sequenceBand?: string;
  /** Let an authenticated learner include this item in the focused report. */
  learningFocus?: boolean;
  /** Current programme/domain/area/role route for scoped relationship display. */
  learningRoute?: LearningPlanRoute;
  domainName?: string;
  areaName?: string;
  roleName?: string;
  /** Role keys in the selected area, for route-scoped inherited options. */
  routeRoleIds?: string[];
  /** Admin-guided save target, when the list is rendered for an administrator. */
  targetStudentId?: string;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [relationshipReturn, setRelationshipReturn] = useState<{ key: string; name: string } | null>(null);
  const excluded = useMemo(() => new Set((excludeNames ?? []).map((name) => name.trim().toLowerCase()).filter(Boolean)), [excludeNames]);
  const ordered = useMemo(() => {
    const seen = new Set<string>();
      const filtered = [...(items ?? [])]
      .filter((item) => isStudentItem(item, resources)
        && (!contextLevel || (item.contextLevel === contextLevel && item.guidanceOwner === contextLevel))
        && (!itemScope || matchesItemScope(item, contextLevel, itemScope))
        && (!sequenceBand || item.sequenceBand === sequenceBand)
        && (!(item.contextLevel === "domain" && itemScope === "learning-options" && learningRoute?.areaId)
          || (item.pathTargets ?? []).some((target) => (target.targetLevel === "subgroup" && target.targetKey === learningRoute.areaId) || (target.targetLevel === "role" && (routeRoleIds ?? []).includes(target.targetKey))))
        && (!(item.contextLevel === "domain" && itemScope === "learning-options" && learningRoute?.roleId)
          || (item.pathTargets ?? []).some((target) => target.targetLevel === "role" && target.targetKey === learningRoute.roleId))
        && (!itemTypes?.length || itemTypes.includes(item.itemType))
        && !excluded.has(item.name.trim().toLowerCase()))
      .filter((item) => {
        const key = `${item.itemType}:${item.itemKey.trim().toLowerCase() || item.name.trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const requirement = { needed: 0, useful: 1, optional: 2 };
        const requirementOrder = requirement[a.requirementLevel ?? "optional"] - requirement[b.requirementLevel ?? "optional"];
        if (requirementOrder) return requirementOrder;
        const sequenceOrder = (a.sequenceOrder ?? Number.MAX_SAFE_INTEGER) - (b.sequenceOrder ?? Number.MAX_SAFE_INTEGER);
        if (sequenceOrder) return sequenceOrder;
        const order = { start_here: 0, build_next: 1, useful_later: 2, optional: 3 };
        const aOrder = order[a.learningOrder ?? a.priority ?? "optional"];
        const bOrder = order[b.learningOrder ?? b.priority ?? "optional"];
        return aOrder - bOrder || a.name.localeCompare(b.name);
      });
    return sequenceByDependencies(filtered, learningRoute);
  }, [contextLevel, excluded, itemScope, itemTypes, items, learningRoute?.areaId, learningRoute?.roleId, resources, routeRoleIds, sequenceBand]);
  if (!ordered.length) return <View style={[styles.container, style]}>
    <SectionLabel>{title}</SectionLabel>
    <View style={[styles.emptyCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Feather name="inbox" size={17} color={colors.textRole.muted} />
      <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{contextLevel === "role"
        ? itemScope === "shared-foundation" ? "No reviewed shared capabilities were returned for this role." : "No reviewed task-specific options were returned for this role."
        : itemScope === "learning-options" && learningRoute?.areaId ? "No domain options with a verified link to this area are recorded yet." : "No connected learning items are available for this level yet."}</Text>
      <Text style={[styles.limit, { color: colors.textRole.muted }]}>{contextLevel === "role"
        ? "This response may be incomplete; it does not mean the role has no relevant skills, methods, tools or knowledge. Unreviewed items are not shown as recommendations."
        : itemScope === "learning-options" && learningRoute?.areaId ? "Other domain options remain available on the domain page; this area view shows only options with a reviewed route connection." : "Items appear here only after their explanation is checked for this level and a relevant learning link is verified."}</Text>
    </View>
  </View>;
  const visible = expanded ? ordered : ordered.slice(0, 5);
  return <View style={[styles.container, style]}>
    <SectionLabel>{title}</SectionLabel>
    <Text style={[styles.caption, { color: colors.textRole.muted }]}>{contextLevel === "domain"
      ? itemScope === "shared-foundation"
        ? "These items are needed for this field route. Follow the displayed order before continuing. The useful edges section contains optional choices that support particular routes and can be skipped."
        : itemScope === "learning-options"
          ? "This card shows the next displayed learning sequence. Alternatives are choices, while complementary items can be studied together; later additions remain skippable."
          : "These named items can support specific work in this field. Open one to see how it fits, what it connects to and its verified learning link."
      : "Open an item to see what it means, how it is used in this direction, what it connects to and its verified learning link."}</Text>
    {learningFocus ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>The order on these cards is the recommended learning flow. Use the relationship notes to see what comes next, what can be learned together and which options are alternatives.</Text> : null}
    {visible.map((item) => {
      const key = `${item.contextKey}:${item.itemType}:${item.itemKey}`;
      const isOpen = openKey === key;
      const resource = resourceForItem(resources, item.itemType, item.name);
      const url = studentItemLinkUrl(item, resource);
      const relatedResources = itemResources(resources, item).filter((candidate) =>
        candidate.url !== url && candidate.url !== item.linkUrl,
      );
      // Source references prove where the statement came from, but they are
      // not automatically item-specific learning links. Only an explicitly
      // attached resource may become a student link; otherwise the card must
      // show the honest no-link state.
      const orderLabel = requirementLabel(item);
      const itemMeaning = studentCopy(item.plainMeaning)
        || "A plain-language explanation has not been provided for this item yet.";
      const itemUseMeaning = studentSections(item.contextualUse).meaning
        || "A description of how this item is used at this level has not been provided yet.";
      const expectedOutputCopy = studentCopy(studentOutputCopy(item.expectedOutput, item.contextualUse));
       const roleContext = studentCopy(item.roleContext);
       const contextualUse = studentSections(item.contextualUse).meaning;
      const itemLimitations = studentItemLimitations(item.evidenceLimitations);
       const hasDistinctRoleContext = Boolean(learningRoute?.roleId && roleName && roleContext && roleContext.toLocaleLowerCase() !== contextualUse.toLocaleLowerCase());
        const inclusionReason = studentReason(item.requirementReason);
       const linkEvidence = item.linkSourceReference as Record<string, unknown> | undefined;
       const linkClaim = item.linkEvidence as Record<string, unknown> | undefined;
       const linkKindNotice = item.linkKind === "reference_only"
         ? "Reference page · useful to read about the topic, but not a complete course or qualification."
         : item.linkKind === "verified_resource_with_access_caveat"
           ? "Verified guide · direct access may vary; check the provider's access note."
           : undefined;
       const rawResourceReason = studentCopy((typeof linkClaim?.why_this_resource === "string" ? linkClaim.why_this_resource : undefined)
         || (typeof linkClaim?.whyThisResource === "string" ? linkClaim.whyThisResource : undefined)
         || (typeof linkEvidence?.evidence_use === "string" ? linkEvidence.evidence_use : undefined)
         || (typeof linkEvidence?.evidenceUse === "string" ? linkEvidence.evidenceUse : undefined)
         || (typeof linkEvidence?.supports === "string" ? linkEvidence.supports : undefined));
       const resourceReason = explainResourceRationale(rawResourceReason, item);
       const label = item.linkTitle?.trim() || (resource ? `Open ${resource.provider}` : `Open verified information for ${item.name}`);
      return <View key={key} style={[styles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
        {relationshipReturn && isOpen ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Return to ${relationshipReturn.name}`} onPress={() => { setOpenKey(relationshipReturn.key); setRelationshipReturn(null); }} style={[styles.returnToRelationship, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <Feather name="corner-up-left" size={15} color={colors.accentRole.action} />
          <Text style={[styles.returnToRelationshipText, { color: colors.accentRole.action }]}>Back to {relationshipReturn.name}</Text>
        </TouchableOpacity> : null}
        <View style={styles.header}>
          <View style={styles.cardHeading}>
            <View style={styles.badges}>
              <View style={styles.typeBadge}>
                <Feather name={ITEM_ICON[item.itemType]} size={14} color={colors.accentRole.action} />
                <Text style={[styles.type, { color: colors.textRole.secondary }]}>{ITEM_TYPE_LABEL[item.itemType]}</Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.levelText, { color: colors.textRole.secondary }]}>{orderLabel}</Text>
              </View>
              {item.sequenceKind && item.sequenceKind !== "compulsory" ? <View style={[styles.levelBadge, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.levelText, { color: colors.textRole.secondary }]}>{item.sequenceKind === "alternative" ? "Alternative route" : item.sequenceKind === "complementary" ? "Can be learned together" : item.sequenceKind === "tool_support" ? "Supporting tool" : item.sequenceKind === "specialist" ? "Specialist extension" : "Next in sequence"}</Text>
              </View> : null}
              {learningRoute?.roleId && item.contextLevel === "subgroup" ? <View style={[styles.levelBadge, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.levelText, { color: colors.textRole.secondary }]}>From selected area</Text>
              </View> : null}
            </View>
            <Text style={[styles.name, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{item.name}</Text>
          </View>
        </View>
        {!isOpen ? <View style={[styles.cardSummary, { borderLeftColor: colors.accentRole.action }]}>
          <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{itemMeaning}</Text>
          {item.displayWhyNext ? <Text style={[styles.limit, { color: colors.textRole.muted }]}>{studentCopy(item.displayWhyNext)}</Text> : null}
        </View> : null}
        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${isOpen ? "Hide" : "Open"} details for ${item.name}`} accessibilityState={{ expanded: isOpen }} onPress={() => setOpenKey(isOpen ? null : key)} style={styles.actionButton}>
            <Text style={[styles.more, { color: colors.accentRole.action }]}>{isOpen ? "Hide details" : "What this means and how it connects"}</Text>
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
              routeKey: learningRoute ? learningPlanRouteKey(learningRoute) : undefined,
              domainId: item.domainId ?? learningRoute?.domainId,
              programmeId: learningRoute?.programmeId,
              domainName,
              subgroupId: learningRoute?.areaId,
              subgroupName: areaName,
              roleId: learningRoute?.roleId,
              roleName: roleName ?? learningRoute?.roleId,
            }}
             onOpenPlan={() => exploreNav.guided(router, { programmeId: learningRoute?.programmeId, domainId: learningRoute?.domainId, areaId: learningRoute?.areaId, roleId: learningRoute?.roleId, focused: true, openTray: true })}
          /> : null}
        </View>
        {isOpen ? <View style={styles.expandedContent}>
          <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What it is</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{itemMeaning}</Text></View>
          {item.programmeContext ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How it relates to your programme</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentCopy(item.programmeContext)}</Text></View> : null}
          {item.domainContext ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why it matters in this field</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentCopy(item.domainContext)}</Text></View> : null}
          {item.areaContext ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How it connects to the selected area</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentCopy(item.areaContext)}</Text></View> : null}
          {hasDistinctRoleContext ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How it connects to this role</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{roleContext}</Text></View> : null}
          <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{`How it is used in ${contextLabel(item.contextLevel)}`}</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{itemUseMeaning}</Text></View>
          {itemScope === "learning-options" && item.pathTargets?.length ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why it may help on this direction</Text>{item.pathTargets.map((target) => <View key={`${target.targetLevel}:${target.targetKey}:${target.useCaseKey ?? ""}`} style={styles.routeReason}><Text style={[styles.routeLabel, { color: colors.accentRole.action }]}>{target.targetLabel} · {routeContributionLabel(target.requirementLevel)}</Text>{studentCopy(target.pathReason) ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentCopy(target.pathReason)}</Text> : null}{target.evidenceLimitations.map(studentCopy).filter(Boolean).map((limitation) => <Text key={limitation} style={[styles.limit, { color: colors.textRole.muted }]}>{limitation}</Text>)}</View>)}</View> : null}
          {inclusionReason ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why it is included</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{inclusionReason}</Text></View> : null}
          {studentSections(item.contextualUse).task ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Example of the work</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentSections(item.contextualUse).task}</Text></View> : null}
          {item.geographicScope ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Evidence context</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentGeographicContext(item.geographicScope)}</Text></View> : null}
          {studentSections(item.contextualUse).guardrail ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What to keep in mind</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{studentSections(item.contextualUse).guardrail}</Text></View> : null}
          {item.prerequisites?.length ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What may help you prepare</Text><Text style={[styles.caption, { color: colors.textRole.muted }]}>These preparation notes do not create an automatic block or fixed learning order.</Text>{item.prerequisites.map(studentCopy).filter(Boolean).map((note) => <Text key={note} style={[styles.copy, { color: colors.textRole.secondary }]}>{note}</Text>)}</View> : null}
          {item.complements?.length ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What can work alongside it</Text>{item.complements.map(studentCopy).filter(Boolean).map((note) => <Text key={note} style={[styles.copy, { color: colors.textRole.secondary }]}>{note}</Text>)}</View> : null}
          {item.validAlternatives?.length ? <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Other approaches to consider</Text><Text style={[styles.caption, { color: colors.textRole.muted }]}>Choose based on the task; alternatives are not always equivalent or additional steps.</Text>{item.validAlternatives.map(studentCopy).filter(Boolean).map((note) => <Text key={note} style={[styles.copy, { color: colors.textRole.secondary }]}>{note}</Text>)}</View> : null}
          <ContextRelationshipChips itemName={item.name} relationships={relationshipRecords(item, learningRoute)} onOpenTarget={(relationship) => {
            if (relationship.targetItemKey) {
              const target = ordered.find((candidate) => candidate.itemKey === relationship.targetItemKey);
              if (target) {
                setRelationshipReturn({ key, name: item.name });
                setExpanded(true);
                setOpenKey(`${target.contextKey}:${target.itemType}:${target.itemKey}`);
                return true;
              }
            }
            if (!relationship.targetRouteKey || !relationship.targetRouteLevel || !learningRoute?.domainId) return false;
            const routeContext = {
              programmeId: learningRoute.programmeId,
              domainId: learningRoute.domainId,
              ...(relationship.targetRouteLevel === "subgroup"
                ? { areaId: relationship.targetRouteKey }
                : { areaId: learningRoute.areaId, roleId: relationship.targetRouteKey }),
              focused: true,
              preserveHistory: true,
            };
            if (relationship.targetRouteLevel === "subgroup") {
              exploreNav.subgroup(router, learningRoute.domainId, relationship.targetRouteKey, routeContext);
              return true;
            }
            if (relationship.targetRouteLevel === "role") {
              exploreNav.role(router, relationship.targetRouteKey, routeContext);
              return true;
            }
            return false;
          }} />
          {learningFocus && relationshipRecords(item, learningRoute).some((relationship) => relationship.label === "Choose one") ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Compare alternatives for ${item.name}`} onPress={() => exploreNav.guided(router, { programmeId: learningRoute?.programmeId, domainId: learningRoute?.domainId, areaId: learningRoute?.areaId, roleId: learningRoute?.roleId, focused: true, openTray: true })} style={styles.actionButton}>
            <Text style={[styles.more, { color: colors.accentRole.action }]}>Compare valid alternatives in my learning tray</Text>
          </TouchableOpacity> : null}
        </View> : null}
        {isOpen ? <View style={[styles.detail, { borderTopColor: colors.borderRole.subtle }]}>
          {expectedOutputCopy ? <Detail label="What you may produce" value={expectedOutputCopy} /> : null}
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
            {resourceReason ? <View style={styles.summaryBlock}><Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why this resource is here</Text><Text style={[styles.caption, { color: colors.textRole.secondary }]}>{resourceReason}</Text></View> : null}
            {linkKindNotice ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>{linkKindNotice}</Text> : null}
            {typeof item.linkSourceReference?.locator === "string" ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>Look for: {String(item.linkSourceReference.locator)}</Text> : null}
             {url ? <ExternalLinkGuard url={url} label={label} description={resourceReason || `This opens the verified learning or reference page for ${item.name}.`} /> : <Text style={[styles.caption, { color: colors.textRole.muted }]}>No verified link is available yet.</Text>}
            {relatedResources.length ? <View style={styles.resourceOptions}>
              <Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Other verified ways to learn or read</Text>
              {relatedResources.map((candidate) => <View key={candidate.id} style={styles.resourceOption}>
                <Text style={[styles.resourceKind, { color: colors.accentRole.action }]}>{learningResourceKind(candidate)}</Text>
                <Text style={[styles.detailLabel, { color: colors.textRole.primary }]}>Why this link may help</Text>
                <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{studentResourceRationale(candidate.description, item.name, item.contextualUse)}</Text>
                <ExternalLinkGuard
                  url={candidate.url}
                  label={`Open ${candidate.provider} for ${item.name}`}
                  description={studentResourceRationale(candidate.description, item.name, item.contextualUse)}
                />
              </View>)}
            </View> : null}
            {item.additionalLearningLinks?.length ? <View style={styles.resourceOptions}>
              <Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Other checked guides for this item</Text>
              {item.additionalLearningLinks.map((candidate) => <View key={`${candidate.url}:${candidate.locator ?? ""}`} style={styles.resourceOption}>
                <Text style={[styles.resourceKind, { color: colors.accentRole.action }]}>{candidate.kind === "reference_only" ? "Reference" : "Additional learning link"}</Text>
                <Text style={[styles.detailLabel, { color: colors.textRole.primary }]}>Why this link may help</Text>
                <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{studentResourceRationale(candidate.rationale, item.name, item.contextualUse)}</Text>
                {candidate.locator ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>Start at: {studentCopy(candidate.locator)}</Text> : null}
                <ExternalLinkGuard url={candidate.url} label={`Open ${candidate.title} for ${item.name}`} description={studentResourceRationale(candidate.rationale, item.name, item.contextualUse)} />
                {candidate.access ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>{studentCopy(candidate.access)}</Text> : null}
              </View>)}
            </View> : null}
          </View>
          <ContextSourceLinks item={item} resource={resource} />
          <View style={[styles.itemSection, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
            <Text style={[styles.detailLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What it cannot prove or replace</Text>
            {itemLimitations.map((limitation) => <Text key={limitation} style={[styles.limit, { color: colors.textRole.muted }]}>{limitation}</Text>)}
          </View>
        </View> : null}
      </View>;
    })}
    {ordered.length > 5 ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)}><Text style={[styles.more, { color: colors.accentRole.action }]}>{expanded ? "Show fewer items" : `See all ${ordered.length} items`}</Text></TouchableOpacity> : null}
  </View>;
}

/** Compulsory versus optional is decided by the reviewed requirement level at
 * every checkpoint. A use-case key groups work; it does not establish that an
 * item is compulsory or optional. Unspecified levels remain visible in the
 * non-blocking options branch instead of being promoted or hidden. */
export function matchesItemScope(
  item: CareerContextItem,
  contextLevel: CareerContextItem["contextLevel"] | undefined,
  itemScope: "shared-foundation" | "learning-options",
): boolean {
  return itemScope === "shared-foundation"
    ? item.requirementLevel === "needed"
    : item.requirementLevel !== "needed";
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
  container: { gap: Spacing.md }, caption: { fontSize: 16, lineHeight: 24 }, summaryBlock: { gap: Spacing.xs }, itemSection: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm }, expandedContent: { gap: Spacing.md }, routeReason: { gap: Spacing.xs }, routeLabel: { fontSize: 16, lineHeight: 23, fontWeight: "700" }, resourceOptions: { gap: Spacing.sm, paddingTop: Spacing.sm }, resourceOption: { gap: Spacing.xs, paddingVertical: Spacing.xs }, resourceKind: { fontSize: FontSize.sm, fontWeight: "700" },
  emptyCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md }, cardSummary: { borderLeftWidth: 3, paddingLeft: Spacing.md, paddingVertical: Spacing.xs }, returnToRelationship: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: Spacing.xs, borderBottomWidth: 1, paddingHorizontal: Spacing.md, marginHorizontal: -Spacing.md, marginTop: -Spacing.md, marginBottom: Spacing.xs }, returnToRelationshipText: { fontSize: 16, lineHeight: 23, fontWeight: "700" }, header: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm }, cardHeading: { flex: 1, gap: Spacing.sm }, badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: Spacing.xs }, typeBadge: { flexDirection: "row", alignItems: "center", gap: Spacing.xs }, levelBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 }, levelText: { fontSize: FontSize.sm, fontWeight: "700" }, actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: Spacing.sm }, actionButton: { minHeight: 44, justifyContent: "center", paddingVertical: Spacing.xs }, name: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.25 }, type: { fontSize: FontSize.sm, fontWeight: "700" }, copy: { fontSize: 16, lineHeight: 25 }, more: { fontSize: 16, lineHeight: 23, fontWeight: "800" }, detail: { borderTopWidth: 1, paddingTop: Spacing.md, gap: Spacing.md }, detailLine: { gap: Spacing.xs }, detailLabel: { fontSize: 18, lineHeight: 25 }, resource: { borderTopWidth: 1, paddingTop: Spacing.md, gap: Spacing.md }, limit: { fontSize: 16, lineHeight: 24 }, methodsInline: { gap: Spacing.sm, paddingTop: Spacing.sm }, methodName: { fontSize: 16, lineHeight: 23 }, methodCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
});

export default ContextualItemList;
