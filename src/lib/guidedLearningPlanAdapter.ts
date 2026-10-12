/**
 * Adapter from the reviewed contextual-item contract to the pure learning-plan
 * model.  It deliberately reads only CareerContextItem fields: legacy skill,
 * tool and certification arrays cannot create candidates or relationships.
 */

import type { CareerContextItem, CareerContextItemRelationship } from "@/types/career";
import type {
  LearningPlanCandidate,
  LearningPlanCategory,
  LearningPlanLayer,
  LearningPlanRelationship,
  LearningPlanRouteScope,
  LearningPlanVisibility,
} from "./guidedLearningPlan";

function layerFor(item: CareerContextItem): LearningPlanLayer {
  return item.contextLevel === "subgroup" ? "area" : item.contextLevel;
}

function stableId(item: CareerContextItem): string {
  return `${layerFor(item)}:${item.contextKey}:${item.itemType}:${item.itemKey}`;
}

function itemNameKey(itemType: CareerContextItem["itemType"], value: string): string {
  return `${itemType}:${value.trim().toLowerCase()}`;
}

function categoryFor(item: CareerContextItem): LearningPlanCategory {
  if (item.contextLevel === "domain") {
    if (item.requirementLevel === "needed") return "shared_foundation";
    if (item.requirementLevel === "useful") return "useful_edge";
    return "shared_foundation";
  }
  if (item.contextLevel === "subgroup") return "area_addition";
  if (item.contextLevel === "role") return "role_addition";
  return "unclassified";
}

function routeScopeFor(item: CareerContextItem): LearningPlanRouteScope {
  if (item.contextLevel === "programme") return { programmeIds: [item.contextKey] };
  if (item.contextLevel === "domain") return { domainIds: [item.domainId] };
  if (item.contextLevel === "subgroup") return { domainIds: [item.domainId], areaIds: [item.contextKey] };
  return { domainIds: [item.domainId], roleIds: [item.contextKey] };
}

function ownerFor(item: CareerContextItem): LearningPlanCandidate["guidanceOwner"] {
  if (item.guidanceOwner === "subgroup") return "area";
  if (item.guidanceOwner === "role_aggregated") return "audit_only";
  return item.guidanceOwner;
}

function visibilityFor(item: CareerContextItem): LearningPlanVisibility {
  if (item.contextLevel === "programme") return "fixed";
  const layer = layerFor(item);
  const approved = item.dataState === "source_backed"
    && item.claimReviewState === "approved"
    && item.linkState === "linked"
    && ownerFor(item) === layer
    && /^https:\/\//i.test(item.linkUrl ?? "");
  return approved ? "selectable" : "hidden";
}

function relationshipTypeFor(
  relation: CareerContextItemRelationship,
): LearningPlanRelationship["type"] {
  if (relation.relationshipType === "builds_on") return "builds_on";
  if (relation.relationshipType === "complements" || relation.relationshipType === "works_with") return "complements";
  if (relation.relationshipType === "alternative") return "alternative_to";
  if (relation.relationshipType === "qualifies_for" || relation.relationshipType === "supports") return "supports";
  return "requires";
}

function relatedItemId(
  relation: CareerContextItemRelationship,
  itemIndex: Map<string, CareerContextItem>,
): string | undefined {
  if (!relation.toItemKey || !relation.toItemType) return undefined;
  const target = itemIndex.get(itemNameKey(relation.toItemType, relation.toItemKey));
  return target ? stableId(target) : undefined;
}

function makeItemIndex(items: CareerContextItem[]): Map<string, CareerContextItem> {
  const index = new Map<string, CareerContextItem>();
  for (const item of items) {
    index.set(itemNameKey(item.itemType, item.itemKey), item);
    index.set(itemNameKey(item.itemType, item.name), item);
  }
  return index;
}

function alternativeGroups(items: CareerContextItem[], itemIndex: Map<string, CareerContextItem>): Map<string, string> {
  const graph = new Map<string, Set<string>>();
  const connect = (from: string, to: string) => {
    graph.set(from, new Set([...(graph.get(from) ?? []), to]));
    graph.set(to, new Set([...(graph.get(to) ?? []), from]));
  };
  for (const item of items) {
    const from = stableId(item);
    for (const relation of item.relationships ?? []) {
      if (relation.relationshipStatus !== "source_backed"
        || relation.relationshipType !== "alternative"
        || !relation.learnerExplanation?.trim()
        || !relation.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url))) continue;
      const to = relatedItemId(relation, itemIndex);
      if (to) connect(from, to);
    }
  }
  const groups = new Map<string, string>();
  const visited = new Set<string>();
  for (const start of graph.keys()) {
    if (visited.has(start)) continue;
    const component: string[] = [];
    const queue = [start];
    visited.add(start);
    while (queue.length) {
      const current = queue.shift()!;
      component.push(current);
      for (const next of graph.get(current) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    const group = `alternative:${component.sort().join("|")}`;
    component.forEach((id) => groups.set(id, group));
  }
  return groups;
}

function relationshipRecords(
  item: CareerContextItem,
  itemIndex: Map<string, CareerContextItem>,
): LearningPlanRelationship[] {
  const records: LearningPlanRelationship[] = [];
  for (const relation of item.relationships ?? []) {
    const explanation = relation.learnerExplanation?.trim();
    if (relation.relationshipStatus !== "source_backed"
      || !explanation
      || !relation.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url))) continue;
    const targetId = relatedItemId(relation, itemIndex)
      ?? (relation.toItemKey ? `${relation.toItemType ?? "item"}:${relation.toItemKey}` : undefined);
    if (!targetId) continue;
    const targetItem = relation.toItemKey && relation.toItemType
      ? itemIndex.get(itemNameKey(relation.toItemType, relation.toItemKey))
      : undefined;
    records.push({
      type: relationshipTypeFor(relation),
      targetId,
      ...(relation.toName || targetItem?.name ? { targetName: relation.toName || targetItem?.name } : {}),
      status: relation.relationshipStatus,
      explanation,
      sequenceApproved: relation.sequenceApproved === true,
      ...(relation.sequencePolicy ? { sequencePolicy: relation.sequencePolicy } : {}),
      ...(relation.sequenceCondition?.trim() ? { sequenceCondition: relation.sequenceCondition.trim() } : {}),
      ...(relation.sequenceScope ? { sequenceScope: relation.sequenceScope } : {}),
      ...(relation.sourceReferences?.length ? {
        sourceReferences: relation.sourceReferences.map(({ title, url }) => ({ title, url })),
      } : {}),
    });
  }
  for (const target of item.pathTargets ?? []) {
    records.push({
      type: "supports",
      targetId: `${target.targetLevel}:${target.targetKey}`,
      targetName: target.targetLabel,
      status: target.relationshipStatus,
      explanation: target.pathReason,
      ...(target.sourceReferences?.length ? {
        sourceReferences: target.sourceReferences.map(({ title, url }) => ({ title, url })),
      } : {}),
    });
  }
  return records;
}

/**
 * A source-backed `builds_on` edge is explanatory by default. It becomes a
 * hard dependency only when its sequence decision was explicitly approved as
 * such; the relationship type and legacy/plain-text prerequisite arrays alone
 * cannot block selection or impose order.
 */
function reviewedPrerequisites(
  item: CareerContextItem,
  itemIndex: Map<string, CareerContextItem>,
): Array<{ id: string; name: string }> {
  const resolved = new Map<string, { id: string; name: string }>();
  for (const relation of item.relationships ?? []) {
    if (relation.relationshipStatus !== "source_backed"
      || relation.relationshipType !== "builds_on"
      || relation.sequenceApproved !== true
      || relation.sequencePolicy !== "hard_prerequisite"
      || !relation.learnerExplanation?.trim()
      || !relation.sourceReferences?.some((reference) => /^https:\/\//i.test(reference.url))) continue;
    const targetId = relatedItemId(relation, itemIndex);
    if (!targetId || !relation.toItemType || !relation.toItemKey) continue;
    const target = itemIndex.get(itemNameKey(relation.toItemType, relation.toItemKey));
    if (target) resolved.set(targetId, { id: targetId, name: target.name });
  }
  return [...resolved.values()].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

/** Convert one reviewed item without adding any source, relationship or link. */
export function contextItemToLearningCandidate(
  item: CareerContextItem,
  allItems: CareerContextItem[] = [item],
): LearningPlanCandidate {
  const index = makeItemIndex(allItems);
  const alternativeGroup = alternativeGroups(allItems, index).get(stableId(item));
  const prerequisites = reviewedPrerequisites(item, index);
  return {
    id: stableId(item),
    name: item.name,
    layer: layerFor(item),
    category: categoryFor(item),
    visibility: visibilityFor(item),
    claimReviewState: item.claimReviewState ?? "review_required",
    linkState: item.linkState ?? "review_required",
    linkUrl: item.linkUrl,
    guidanceOwner: ownerFor(item),
    alternativeGroup,
    complementOf: relationshipRecords(item, index).filter((relation) => relation.type === "complements").map((relation) => relation.targetId),
    prerequisiteIds: prerequisites.map(({ id }) => id),
    displayOrder: item.learningOrder === "start_here" ? 0 : item.learningOrder === "build_next" ? 1 : item.learningOrder === "useful_later" ? 2 : 3,
    explanation: `${item.plainMeaning} ${item.contextualUse}`.trim(),
    itemType: item.itemType,
    themeLabel: item.themeLabel ?? undefined,
    useCaseKey: item.useCaseKey ?? undefined,
    requirementLevel: item.requirementLevel ?? undefined,
    plainMeaning: item.plainMeaning,
    contextualUse: item.contextualUse,
    expectedOutput: item.expectedOutput ?? undefined,
    limitations: item.evidenceLimitations?.length ? [...item.evidenceLimitations] : undefined,
    prerequisiteNames: prerequisites.length ? prerequisites.map(({ name }) => name) : undefined,
    sourceReferences: item.sourceReferences
      ?.filter((reference) => /^https:\/\//i.test(reference.url))
      .map(({ id, title, url, region, evidenceType }) => ({ id, title, url, region, evidenceType })),
    sourceLocators: item.sourceLocators?.map((locator) => ({ ...locator })),
    sourceConfidence: item.sourceConfidence,
    evidenceType: item.evidenceType,
    verifiedAt: item.verifiedAt,
    routeScope: routeScopeFor(item),
    relationships: relationshipRecords(item, index),
  };
}

/** Convert a context batch while preserving explicit cross-item relationships. */
export function contextItemsToLearningCandidates(items: CareerContextItem[]): LearningPlanCandidate[] {
  return items.map((item) => contextItemToLearningCandidate(item, items));
}
