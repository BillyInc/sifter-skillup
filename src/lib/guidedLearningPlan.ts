/**
 * Pure route/selection model for the programme → domain → area → role guide.
 *
 * This module deliberately has no API, storage or UI dependency. It is the
 * deterministic boundary between reviewed contextual records and the learner's
 * personal plan. Unapproved records never enter a student plan.
 */

export type LearningPlanLayer = "programme" | "domain" | "area" | "role";

export type LearningPlanCategory =
  | "shared_foundation"
  | "useful_edge"
  | "conditional"
  | "area_addition"
  | "role_addition"
  | "complement"
  | "alternative"
  | "unclassified";

export type LearningPlanVisibility = "fixed" | "selectable" | "hidden";

export type LearningPlanItemType =
  | "skill"
  | "competency"
  | "tool"
  | "certification"
  | "method"
  | "knowledge"
  | "resource";

export type LearningPlanRelationshipType =
  | "requires"
  | "builds_on"
  | "complements"
  | "alternative_to"
  | "supports";

export type LearningPlanRelationshipStatus = "source_backed" | "review_required" | "not_established";

export interface LearningPlanRelationship {
  type: LearningPlanRelationshipType;
  targetId: string;
  targetName?: string;
  status: LearningPlanRelationshipStatus;
  explanation?: string;
  sourceReferences?: Array<{ title?: string; url: string }>;
  /** Defaults to advisory: relationship type alone never establishes learning order. */
  sequenceApproved?: boolean;
  sequencePolicy?: "hard_prerequisite" | "conditional_prerequisite" | "workflow" | "advisory" | "none";
  sequenceCondition?: string;
  sequenceScope?: LearningPlanRouteScope;
}

export interface LearningPlanRouteScope {
  programmeIds?: string[];
  domainIds?: string[];
  areaIds?: string[];
  roleIds?: string[];
}

export interface LearningPlanSourceReference {
  id?: string;
  title?: string;
  url: string;
  region?: string | null;
  evidenceType?: string | null;
}

export interface LearningPlanResourceLink {
  title: string;
  url: string;
  locator?: string | null;
  access?: string | null;
  kind?: string | null;
  rationale?: string | null;
}

export interface LearningPlanCandidate {
  id: string;
  name: string;
  layer: LearningPlanLayer;
  category?: LearningPlanCategory;
  visibility: LearningPlanVisibility;
  claimReviewState: "approved" | "review_required" | "excluded";
  linkState: "linked" | "no_link" | "review_required";
  linkUrl?: string | null;
  guidanceOwner?: LearningPlanLayer | "review_only" | "audit_only" | null;
  /** Same group means “choose one”; it is not a cumulative requirement. */
  alternativeGroup?: string | null;
  /** Explicitly selected complements are retained separately in the result. */
  complementOf?: string[];
  prerequisiteIds?: string[];
  /** Display order within the layer, not a claim of universal learning order. */
  displayOrder?: number;
  /** More specific explanations win when the same stable item is repeated. */
  explanation?: string;
  /** A scoped item cannot leak into an unrelated selected branch. */
  routeScope?: LearningPlanRouteScope;
  /** Relationship evidence is kept with the item for the preview and admin audit. */
  relationships?: LearningPlanRelationship[];
  /** Source-backed context retained for the learner and admin report. */
  itemType?: LearningPlanItemType;
  themeLabel?: string;
  useCaseKey?: string;
  requirementLevel?: "needed" | "useful" | "optional";
  requirementReason?: string;
  plainMeaning?: string;
  contextualUse?: string;
  programmeContext?: string;
  domainContext?: string;
  areaContext?: string;
  roleContext?: string;
  expectedOutput?: string;
  limitations?: string[];
  geographicScope?: "nigeria" | "global" | "nigeria_to_global";
  prerequisiteNames?: string[];
  /** Item-level evidence is distinct from its learning link and relationship evidence. */
  sourceReferences?: LearningPlanSourceReference[];
  linkTitle?: string;
  linkRationale?: string;
  learningLinks?: LearningPlanResourceLink[];
  linkAccess?: string;
  linkKind?: string;
  sourceLocators?: Array<Record<string, unknown>>;
  sourceConfidence?: string;
  evidenceType?: string;
  verifiedAt?: string;
}

export interface LearningPlanRoute {
  programmeId?: string;
  domainId?: string;
  areaId?: string;
  roleId?: string;
}

export interface LearningPlanSelection {
  selectedIds: string[];
  route: LearningPlanRoute;
  /** Personal removal only; it never changes the canonical candidate. */
  removedIds?: string[];
}

/** One independent route inside a learner's multi-route report. */
export interface LearningPlanRouteSelection {
  route: LearningPlanRoute;
  selectedIds: string[];
  removedIds?: string[];
  /** Learner presentation order, still constrained by prerequisite sequencing. */
  order?: string[];
}

export interface LearningPlanRouteWarning {
  code: "multiple_routes" | "multiple_programmes" | "multiple_domains" | "multiple_areas" | "multiple_roles";
  message: string;
  routeKeys: string[];
}

/** Stable, non-personal item details carried by a saved report snapshot. */
export interface LearningPlanSnapshotItem {
  id: string;
  name: string;
  layer: LearningPlanLayer;
  category?: LearningPlanCategory;
  explanation?: string;
  linkUrl?: string;
  itemType?: LearningPlanItemType;
  themeLabel?: string;
  useCaseKey?: string;
  requirementLevel?: "needed" | "useful" | "optional";
  requirementReason?: string;
  plainMeaning?: string;
  contextualUse?: string;
  programmeContext?: string;
  domainContext?: string;
  areaContext?: string;
  roleContext?: string;
  expectedOutput?: string;
  limitations?: string[];
  geographicScope?: "nigeria" | "global" | "nigeria_to_global";
  prerequisites?: string[];
  relationships?: LearningPlanRelationship[];
  sourceReferences?: LearningPlanSourceReference[];
  linkTitle?: string;
  linkRationale?: string;
  learningLinks?: LearningPlanResourceLink[];
  linkAccess?: string;
  linkKind?: string;
  sourceLocators?: Array<Record<string, unknown>>;
  sourceConfidence?: string;
  evidenceType?: string;
  verifiedAt?: string;
}

export interface LearningPlanStackSet {
  stacks: LearningPlanStack[];
  warnings: LearningPlanRouteWarning[];
}

export type LearningPlanGuardCode =
  | "not_selectable"
  | "route_mismatch"
  | "missing_prerequisite"
  | "alternative_conflict";

export interface LearningPlanGuardIssue {
  candidateId: string;
  code: LearningPlanGuardCode;
  message: string;
  relatedIds?: string[];
}

export interface LearningPlanLayerChoices {
  layer: LearningPlanLayer;
  alternatives: {
    group: string;
    options: LearningPlanCandidate[];
    selectedId?: string;
  }[];
  complements: LearningPlanCandidate[];
}

export interface LearningPlanStack {
  route: LearningPlanRoute;
  fixedProgramme: LearningPlanCandidate[];
  sharedFoundation: LearningPlanCandidate[];
  usefulEdges: LearningPlanCandidate[];
  areaAdditions: LearningPlanCandidate[];
  roleAdditions: LearningPlanCandidate[];
  complements: LearningPlanCandidate[];
  alternatives: {
    group: string;
    options: LearningPlanCandidate[];
    selectedId?: string;
  }[];
  /** Alternatives and complements remain attached to the layer where chosen. */
  layerChoices: LearningPlanLayerChoices[];
  /**
   * Area names shown when the learner stops at programme/domain. These are
   * advisory choices only: their learning items, relationships and role data
   * are not imported until an area route is explicitly selected.
   */
  advisoryAreas: LearningPlanCandidate[];
  hidden: LearningPlanCandidate[];
  selectedIds: string[];
  /** Reasons an attempted selection cannot enter the confirmed stack. */
  guardIssues: LearningPlanGuardIssue[];
  /** Approved, route-matched items that the learner may add explicitly. */
  selectableItems: LearningPlanCandidate[];
}

export interface LearningPlanSnapshot {
  snapshotId: string;
  route: LearningPlanRoute;
  /** Present when the saved report contains more than one independent route. */
  routes?: LearningPlanRoute[];
  selectedIdsByRoute?: Record<string, string[]>;
  routeWarnings?: LearningPlanRouteWarning[];
  selectedIds: string[];
  order: string[];
  removedIds: string[];
  /** Enough reviewed item context to render a saved report after rehydration. */
  itemSummaries?: LearningPlanSnapshotItem[];
  /** Unchosen options from alternative groups where this route has a selection. */
  alternativeSummaries?: Array<{
    group: string;
    selectedId: string;
    options: LearningPlanSnapshotItem[];
  }>;
  dataVersion: string;
  createdAt: string;
  updatedAt: string;
  share: {
    visibility: "private" | "shared";
    token?: string;
    expiresAt?: string;
  };
}

export interface LearningPlanReportSnapshot {
  snapshotId: string;
  stacks: LearningPlanSnapshot[];
  routeWarnings: LearningPlanRouteWarning[];
  dataVersion: string;
  createdAt: string;
  updatedAt: string;
  share: {
    visibility: "private" | "shared";
    token?: string;
    expiresAt?: string;
  };
}

export interface LearningPlanSequenceResult {
  order: string[];
  cycleIds: string[];
}

const LAYER_WEIGHT: Record<LearningPlanLayer, number> = {
  programme: 0,
  domain: 1,
  area: 2,
  role: 3,
};

export function learningPlanRouteKey(route: LearningPlanRoute): string {
  return [route.programmeId, route.domainId, route.areaId, route.roleId]
    .map((value) => value ?? "*")
    .join("/");
}

function uniqueRouteValues(routes: LearningPlanRoute[], key: keyof LearningPlanRoute): string[] {
  return [...new Set(routes.map((route) => route[key]).filter((value): value is string => Boolean(value)))];
}

function multiRouteWarnings(routes: LearningPlanRoute[]): LearningPlanRouteWarning[] {
  const routeKeys = routes.map(learningPlanRouteKey);
  const warnings: LearningPlanRouteWarning[] = [];
  if (routes.length > 1) warnings.push({
    code: "multiple_routes",
    message: "You are building more than one route. Each route will keep its own foundation, additions and role choices in the final report.",
    routeKeys,
  });
  const dimensions: [keyof LearningPlanRoute, LearningPlanRouteWarning["code"], string][] = [
    ["programmeId", "multiple_programmes", "You selected routes from more than one programme."],
    ["domainId", "multiple_domains", "You selected more than one domain in this programme lane."],
    ["areaId", "multiple_areas", "You selected more than one area of specialization/practice."],
    ["roleId", "multiple_roles", "You selected more than one role route."],
  ];
  for (const [key, code, message] of dimensions) {
    if (uniqueRouteValues(routes, key).length > 1) warnings.push({ code, message, routeKeys });
  }
  return warnings;
}

function isHttps(url?: string | null): boolean {
  return typeof url === "string" && /^https:\/\//i.test(url.trim());
}

function routeScopeMatches(item: LearningPlanCandidate, route?: LearningPlanRoute): boolean {
  if (!item.routeScope || !route) return true;
  const checks: [keyof LearningPlanRouteScope, keyof LearningPlanRoute][] = [
    ["programmeIds", "programmeId"],
    ["domainIds", "domainId"],
    ["areaIds", "areaId"],
    ["roleIds", "roleId"],
  ];
  return checks.every(([scopeKey, routeKey]) => {
    const allowed = item.routeScope?.[scopeKey];
    if (!allowed?.length) return true;
    const routeValue = route[routeKey];
    return Boolean(routeValue && allowed.includes(routeValue));
  });
}

export function learningPlanRelationshipScopeMatches(scope: LearningPlanRouteScope | undefined, route?: LearningPlanRoute): boolean {
  if (!scope) return true;
  const checks: Array<[keyof LearningPlanRouteScope, keyof LearningPlanRoute]> = [
    ["programmeIds", "programmeId"], ["domainIds", "domainId"], ["areaIds", "areaId"], ["roleIds", "roleId"],
  ];
  for (const [scopeKey, routeKey] of checks) {
    const values = scope[scopeKey];
    if (values?.length && (!route?.[routeKey] || !values.includes(route[routeKey]!))) return false;
  }
  return true;
}

function activePrerequisiteIds(item: LearningPlanCandidate, route?: LearningPlanRoute): string[] {
  const approvedEdges = (item.relationships ?? [])
    .filter((relationship) => relationship.sequenceApproved === true
      && relationship.sequencePolicy === "hard_prerequisite");
  const routeScopedTargets = new Set(approvedEdges
    .filter((relationship) => relationship.sequenceScope && Object.values(relationship.sequenceScope).some((values) => values?.length))
    .map((relationship) => relationship.targetId));
  const legacyUnscoped = (item.prerequisiteIds ?? []).filter((id) => !routeScopedTargets.has(id));
  const explicitlyApproved = approvedEdges
    .filter((relationship) => relationship.sequenceApproved === true
      && relationship.sequencePolicy === "hard_prerequisite"
      && learningPlanRelationshipScopeMatches(relationship.sequenceScope, route))
    .map((relationship) => relationship.targetId);
  return [...new Set([...legacyUnscoped, ...explicitlyApproved])];
}

/**
 * Conditional prerequisites guide sequence only when their reviewed route
 * scope applies. They never block adding an item: the learner may already
 * have equivalent preparation or may choose to explore the item first.
 */
function activeOrderingPrerequisiteIds(item: LearningPlanCandidate, route?: LearningPlanRoute): string[] {
  const hard = activePrerequisiteIds(item, route);
  const conditional = (item.relationships ?? [])
    .filter((relationship) => relationship.sequenceApproved === true
      && relationship.sequencePolicy === "conditional_prerequisite"
      && learningPlanRelationshipScopeMatches(relationship.sequenceScope, route))
    .map((relationship) => relationship.targetId);
  return [...new Set([...hard, ...conditional])];
}

function routeLayerIsSelected(item: LearningPlanCandidate, route?: LearningPlanRoute): boolean {
  if (!route) return false;
  if (item.layer === "domain") return Boolean(route.domainId);
  if (item.layer === "area") return Boolean(route.areaId);
  if (item.layer === "role") return Boolean(route.roleId);
  return true;
}

/** A candidate can be selected only after the same fail-closed checks as the UI. */
export function isSelectableLearningCandidate(item: LearningPlanCandidate, route?: LearningPlanRoute): boolean {
  return routeLayerIsSelected(item, route)
    && routeScopeMatches(item, route)
    && item.visibility === "selectable"
    && item.claimReviewState === "approved"
    && item.linkState === "linked"
    && isHttps(item.linkUrl)
    && item.guidanceOwner === item.layer;
}

/**
 * Area names may be previewed from the domain stop point, but only within the
 * selected programme/domain scope. Area-specific scope is deliberately not
 * required here because the learner has not chosen one area yet.
 */
function advisoryAreaMatches(item: LearningPlanCandidate, route?: LearningPlanRoute): boolean {
  if (item.layer !== "area" || item.visibility === "hidden" || item.claimReviewState !== "approved") return false;
  const scope = item.routeScope;
  if (!scope || !route) return Boolean(route);
  return (!scope.programmeIds?.length || Boolean(route.programmeId && scope.programmeIds.includes(route.programmeId)))
    && (!scope.domainIds?.length || Boolean(route.domainId && scope.domainIds.includes(route.domainId)));
}

function sortItems(items: LearningPlanCandidate[]): LearningPlanCandidate[] {
  return [...items].sort((a, b) =>
    LAYER_WEIGHT[a.layer] - LAYER_WEIGHT[b.layer]
      || (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER)
      || a.name.localeCompare(b.name)
      || a.id.localeCompare(b.id),
  );
}

/**
 * Produces a deterministic learner-facing order while preserving the learner's
 * preferred order wherever dependencies allow it. Every selected prerequisite
 * is emitted before its dependent. Cycles are reported rather than silently
 * flattened; the stack builder should already have blocked those items.
 */
export function sequenceLearningPlanIds(
  selectedIds: string[],
  items: LearningPlanCandidate[],
  preferredOrder: string[] = selectedIds,
  route?: LearningPlanRoute,
): LearningPlanSequenceResult {
  const selected = [...new Set(selectedIds)];
  const selectedSet = new Set(selected);
  const byId = new Map(items.map((item) => [item.id, item]));
  const preferred = new Map(preferredOrder.map((id, index) => [id, index]));
  const state = new Map<string, 0 | 1 | 2>();
  const order: string[] = [];
  const cycleIds = new Set<string>();
  const rank = (id: string) => preferred.get(id) ?? Number.MAX_SAFE_INTEGER;
  const compare = (a: string, b: string) => {
    const aItem = byId.get(a);
    const bItem = byId.get(b);
    return rank(a) - rank(b)
      || (aItem ? LAYER_WEIGHT[aItem.layer] : Number.MAX_SAFE_INTEGER) - (bItem ? LAYER_WEIGHT[bItem.layer] : Number.MAX_SAFE_INTEGER)
      || (aItem?.displayOrder ?? Number.MAX_SAFE_INTEGER) - (bItem?.displayOrder ?? Number.MAX_SAFE_INTEGER)
      || a.localeCompare(b);
  };
  const visit = (id: string, trail: string[]) => {
    const current = state.get(id) ?? 0;
    if (current === 2) return;
    if (current === 1) {
      const start = trail.indexOf(id);
      (start < 0 ? trail : trail.slice(start)).forEach((cycleId) => cycleIds.add(cycleId));
      return;
    }
    state.set(id, 1);
    const prerequisites = (byId.get(id) ? activeOrderingPrerequisiteIds(byId.get(id)!, route) : [])
      .filter((prerequisiteId) => selectedSet.has(prerequisiteId) && byId.has(prerequisiteId))
      .sort(compare);
    prerequisites.forEach((prerequisiteId) => visit(prerequisiteId, [...trail, id]));
    state.set(id, 2);
    if (!order.includes(id)) order.push(id);
  };
  [...selected].sort(compare).forEach((id) => visit(id, []));
  return { order, cycleIds: [...cycleIds].sort(compare) };
}

function specificity(item: LearningPlanCandidate): number {
  return LAYER_WEIGHT[item.layer];
}

function deduplicateByStableId(items: LearningPlanCandidate[]): LearningPlanCandidate[] {
  const best = new Map<string, LearningPlanCandidate>();
  for (const item of items) {
    const previous = best.get(item.id);
    if (!previous || specificity(item) >= specificity(previous)) best.set(item.id, item);
  }
  return sortItems([...best.values()]);
}

function groupByAlternative(items: LearningPlanCandidate[]) {
  const groups = new Map<string, LearningPlanCandidate[]>();
  for (const item of items) {
    if (!item.alternativeGroup) continue;
    const values = groups.get(item.alternativeGroup) ?? [];
    values.push(item);
    groups.set(item.alternativeGroup, values);
  }
  return [...groups.entries()]
    .map(([group, options]) => ({
      group,
      options: options.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

function prerequisiteIssues(
  item: LearningPlanCandidate,
  candidates: Map<string, LearningPlanCandidate>,
  selected: Set<string>,
  fixed: Set<string>,
  route?: LearningPlanRoute,
  visiting = new Set<string>(),
): LearningPlanGuardIssue[] {
  const issues: LearningPlanGuardIssue[] = [];
  for (const prerequisiteId of activePrerequisiteIds(item, route)) {
    if (fixed.has(prerequisiteId)) continue;
    if (visiting.has(prerequisiteId)) {
      issues.push({
        candidateId: item.id,
        code: "missing_prerequisite",
        message: `${item.name} has a circular prerequisite chain and cannot be ordered safely.`,
        relatedIds: [prerequisiteId],
      });
      continue;
    }
    const prerequisite = candidates.get(prerequisiteId);
    if (!prerequisite || !routeScopeMatches(prerequisite, route)) {
      issues.push({
        candidateId: item.id,
        code: "missing_prerequisite",
        message: `${item.name} needs another approved item before it can be included.`,
        relatedIds: [prerequisiteId],
      });
      continue;
    }
    if (!selected.has(prerequisiteId)) {
      issues.push({
        candidateId: item.id,
        code: "missing_prerequisite",
        message: `${item.name} needs ${prerequisite.name} before it can be included.`,
        relatedIds: [prerequisiteId],
      });
    }
    const nextVisiting = new Set(visiting);
    nextVisiting.add(prerequisiteId);
    issues.push(...prerequisiteIssues(prerequisite, candidates, selected, fixed, route, nextVisiting));
  }
  return issues;
}

/**
 * Builds the visible stack without mutating the canonical candidates.
 * Programme items are fixed context; only approved supplemental items in the
 * selected set can enter the learner's plan.
 */
export function buildLearningPlanStack(input: {
  programmeItems?: LearningPlanCandidate[];
  domainItems?: LearningPlanCandidate[];
  areaItems?: LearningPlanCandidate[];
  roleItems?: LearningPlanCandidate[];
  selectedIds?: string[];
  route?: LearningPlanRoute;
  preferredOrder?: string[];
}): LearningPlanStack {
  const all = deduplicateByStableId([
    ...(input.programmeItems ?? []),
    ...(input.domainItems ?? []),
    ...(input.areaItems ?? []),
    ...(input.roleItems ?? []),
  ]);
  const route = input.route;
  const advisoryAreas = !route?.areaId
    ? deduplicateByStableId((input.areaItems ?? []).filter((item) => advisoryAreaMatches(item, route)))
    : [];
  const selected = new Set(input.selectedIds ?? []);
  const fixedProgramme = all.filter((item) => item.layer === "programme" && item.visibility === "fixed");
  const fixedIds = new Set(fixedProgramme.map((item) => item.id));
  const candidates = new Map(all.map((item) => [item.id, item]));
  const guardIssues: LearningPlanGuardIssue[] = [];
  const selectable = all.filter((item) => isSelectableLearningCandidate(item, route));
  const hiddenIds = new Set(all.filter((item) => item.layer !== "programme" && !isSelectableLearningCandidate(item, route)).map((item) => item.id));
  const hidden = [
    ...(input.programmeItems ?? []),
    ...(input.domainItems ?? []),
    ...(input.areaItems ?? []),
    ...(input.roleItems ?? []),
  ].filter((item, index, items) => hiddenIds.has(item.id) && items.findIndex((candidate) => candidate.id === item.id) === index);
  const selectedSelectable = selectable.filter((item) => selected.has(item.id));
  const alternativeGroups = new Map<string, LearningPlanCandidate[]>();
  for (const item of selectedSelectable) {
    if (!item.alternativeGroup) continue;
    alternativeGroups.set(item.alternativeGroup, [...(alternativeGroups.get(item.alternativeGroup) ?? []), item]);
  }
  const conflictingAlternativeIds = new Set<string>();
  for (const [group, items] of alternativeGroups) {
    if (items.length < 2) continue;
    const ids = items.map((item) => item.id);
    ids.forEach((id) => conflictingAlternativeIds.add(id));
    items.forEach((item) => guardIssues.push({
      candidateId: item.id,
      code: "alternative_conflict",
      message: `Choose one option in the ${group} comparison before including it.`,
      relatedIds: ids.filter((id) => id !== item.id),
    }));
  }
  const confirmedSelection = selectedSelectable.filter((item) => {
    if (conflictingAlternativeIds.has(item.id)) return false;
    const issues = prerequisiteIssues(item, candidates, selected, fixedIds, route);
    guardIssues.push(...issues);
    return issues.length === 0;
  });
  const selectableIds = new Set(selectable.map((item) => item.id));
  for (const id of selected) {
    if (!selectableIds.has(id) && candidates.has(id)) {
      const item = candidates.get(id)!;
      guardIssues.push({
        candidateId: id,
        code: routeScopeMatches(item, route) ? "not_selectable" : "route_mismatch",
        message: routeScopeMatches(item, route)
          ? `${item.name} is not approved for personal selection yet.`
          : `${item.name} belongs to another route and is not carried into this plan.`,
      });
    }
  }
  const approvedSelected = sortItems(confirmedSelection);
  const approvedSelectedIds = approvedSelected.map((item) => item.id);
  const orderedSelectedIds = sequenceLearningPlanIds(
    approvedSelectedIds,
    all,
    input.preferredOrder ?? input.selectedIds,
    route,
  ).order;
  const alternatives = groupByAlternative(selectable);
  const sharedFoundation = approvedSelected.filter((item) => item.category === "shared_foundation");
  const usefulEdges = approvedSelected.filter((item) => item.category === "useful_edge" || item.category === "conditional");
  // Keep the learner's requirement lanes disjoint: optional edges remain
  // selectable alongside required items, but must never be counted as an area
  // or role requirement merely because they live at that downstream layer.
  const areaAdditions = approvedSelected.filter((item) => item.category === "area_addition");
  const roleAdditions = approvedSelected.filter((item) => item.category === "role_addition");
  const complements = approvedSelected.filter((item) => item.category === "complement" || (item.complementOf?.length ?? 0) > 0);
  const layerChoices = (["programme", "domain", "area", "role"] as LearningPlanLayer[]).map((layer) => {
    const layerOptions = selectable.filter((item) => item.layer === layer);
    const layerSelected = approvedSelected.filter((item) => item.layer === layer);
    const layerAlternatives = groupByAlternative(layerOptions).map((entry) => ({
      ...entry,
      selectedId: entry.options.find((item) => selected.has(item.id))?.id,
    }));
    return {
      layer,
      alternatives: layerAlternatives,
      complements: layerSelected.filter((item) => item.category === "complement" || (item.complementOf?.length ?? 0) > 0),
    };
  }).filter((entry) => entry.alternatives.length > 0 || entry.complements.length > 0);

  return {
    route: route ?? {},
    fixedProgramme,
    sharedFoundation,
    usefulEdges,
    areaAdditions,
    roleAdditions,
    complements,
    alternatives: alternatives.map((entry) => ({
      ...entry,
      selectedId: entry.options.find((item) => selected.has(item.id))?.id,
    })),
    layerChoices,
    advisoryAreas,
    hidden,
    selectedIds: orderedSelectedIds,
    guardIssues,
    selectableItems: sortItems(selectable.filter((item) => item.layer !== "programme")),
  };
}

/**
 * Builds separate stacks for every selected route. Shared candidate inputs are
 * intentionally passed to each route and filtered by route scope; stacks are
 * never merged, so the report can explain exactly which item belongs to which
 * programme/domain/area/role path.
 */
export function buildLearningPlanStackSet(input: {
  routes: LearningPlanRouteSelection[];
  programmeItems?: LearningPlanCandidate[];
  domainItems?: LearningPlanCandidate[];
  areaItems?: LearningPlanCandidate[];
  roleItems?: LearningPlanCandidate[];
}): LearningPlanStackSet {
  const stacks = input.routes.map((selection) => buildLearningPlanStack({
    programmeItems: input.programmeItems,
    domainItems: input.domainItems,
    areaItems: input.areaItems,
    roleItems: input.roleItems,
    route: selection.route,
    selectedIds: selection.selectedIds,
    preferredOrder: selection.order,
  }));
  return { stacks, warnings: multiRouteWarnings(input.routes.map((selection) => selection.route)) };
}

/** Returns a new selection; alternatives require an explicit confirmation. */
export function addToLearningPlan(
  selection: LearningPlanSelection,
  item: LearningPlanCandidate,
  existingItems: LearningPlanCandidate[] = [],
): { selection: LearningPlanSelection; conflicts: string[]; blockedByPrerequisites: string[] } {
  if (!isSelectableLearningCandidate(item, selection.route)) return { selection, conflicts: [], blockedByPrerequisites: [] };
  const conflicts = item.alternativeGroup
    ? selection.selectedIds.filter((id) => id !== item.id && existingItems.some(
      (existing) => existing.id === id && existing.alternativeGroup === item.alternativeGroup,
    ))
    : [];
  const prerequisiteIds = activePrerequisiteIds(item, selection.route);
  const selected = new Set(selection.selectedIds);
  const known = new Map(existingItems.map((candidate) => [candidate.id, candidate]));
  const blockedByPrerequisites = prerequisiteIds.filter((id) => {
    if (selected.has(id)) return false;
    const prerequisite = known.get(id);
    return !(prerequisite?.visibility === "fixed" && routeScopeMatches(prerequisite, selection.route));
  });
  if (conflicts.length || blockedByPrerequisites.length) {
    return { selection, conflicts, blockedByPrerequisites };
  }
  return {
    selection: {
      route: { ...selection.route },
      selectedIds: selection.selectedIds.includes(item.id)
        ? [...selection.selectedIds]
        : [...selection.selectedIds, item.id],
      removedIds: (selection.removedIds ?? []).filter((id) => id !== item.id),
    },
    conflicts,
    blockedByPrerequisites,
  };
}

/** Explicit replacement is the only operation that may resolve an alternative conflict. */
export function replaceAlternativeChoice(
  selection: LearningPlanSelection,
  item: LearningPlanCandidate,
  existingItems: LearningPlanCandidate[] = [],
): { selection: LearningPlanSelection; blockedByPrerequisites: string[] } {
  // Validate before removing the current choice. A stale/unapproved option or
  // an option whose prerequisite is not selected must never erase a valid
  // choice as a side effect of a failed replacement.
  if (!isSelectableLearningCandidate(item, selection.route)) {
    return { selection, blockedByPrerequisites: [] };
  }
  const conflictingIds = item.alternativeGroup
    ? selection.selectedIds.filter((id) => existingItems.some((candidate) => candidate.id === id && candidate.alternativeGroup === item.alternativeGroup))
    : [];
  const base = { ...selection, selectedIds: selection.selectedIds.filter((id) => !conflictingIds.includes(id)) };
  const result = addToLearningPlan(base, item, existingItems);
  if (result.blockedByPrerequisites.length || !result.selection.selectedIds.includes(item.id)) {
    return { selection, blockedByPrerequisites: result.blockedByPrerequisites };
  }
  return { selection: result.selection, blockedByPrerequisites: result.blockedByPrerequisites };
}

export function removeFromLearningPlan(
  selection: LearningPlanSelection,
  itemId: string,
): LearningPlanSelection {
  return {
    route: { ...selection.route },
    selectedIds: selection.selectedIds.filter((id) => id !== itemId),
    removedIds: [...new Set([...(selection.removedIds ?? []), itemId])],
  };
}

/** Reordering changes presentation only and cannot put a prerequisite after its dependent. */
export function reorderLearningPlan(
  selection: LearningPlanSelection,
  order: string[],
  itemId: string,
  beforeId?: string,
  items: LearningPlanCandidate[] = [],
): { order: string[]; blockedByPrerequisites: string[] } {
  const selected = new Set(selection.selectedIds);
  if (!selected.has(itemId)) return { order: order.filter((id) => selected.has(id)), blockedByPrerequisites: [itemId] };
  const next = order.filter((id) => selected.has(id) && id !== itemId);
  const index = beforeId && next.includes(beforeId) ? next.indexOf(beforeId) : next.length;
  next.splice(index, 0, itemId);
  const positions = new Map(next.map((id, position) => [id, position]));
  const byId = new Map(items.map((item) => [item.id, item]));
  // Validate the whole proposed ordering, not only the moved item's own
  // prerequisites. Moving a prerequisite after its dependent must be rejected
  // just as moving the dependent before its prerequisite is.
  const blocked = new Set<string>();
  for (const dependentId of next) {
    const dependent = byId.get(dependentId);
    if (!dependent) continue;
    for (const prerequisiteId of activeOrderingPrerequisiteIds(dependent, selection.route)) {
      if (positions.has(prerequisiteId) && positions.get(prerequisiteId)! > positions.get(dependentId)!) {
        blocked.add(prerequisiteId);
      }
    }
  }
  return blocked.size
    ? { order, blockedByPrerequisites: [...blocked].sort() }
    : { order: next, blockedByPrerequisites: [] };
}

export function createLearningPlanSnapshot(input: {
  snapshotId: string;
  selection: LearningPlanSelection;
  order: string[];
  items?: LearningPlanCandidate[];
  dataVersion: string;
  now?: string;
}): LearningPlanSnapshot {
  const now = input.now ?? new Date().toISOString();
  const itemById = new Map((input.items ?? []).map((item) => [item.id, item]));
  const eligibleSelectedIds = input.items?.length
    ? input.selection.selectedIds.filter((id) => {
      const item = itemById.get(id);
      return Boolean(item && (item.visibility === "fixed" || isSelectableLearningCandidate(item, input.selection.route)));
    })
    : [...input.selection.selectedIds];
  const selected = new Set(eligibleSelectedIds);
  const proposedOrder = input.order.filter((id) => selected.has(id));
  const sequence = input.items?.length
    ? sequenceLearningPlanIds(eligibleSelectedIds, input.items, proposedOrder, input.selection.route)
    : { order: proposedOrder, cycleIds: [] };
  const summarizeItem = (item: LearningPlanCandidate): LearningPlanSnapshotItem => ({
        id: item.id,
        name: item.name,
        layer: item.layer,
        ...(item.category ? { category: item.category } : {}),
        ...(item.explanation ? { explanation: item.explanation } : {}),
        ...(isHttps(item.linkUrl) ? { linkUrl: item.linkUrl!.trim() } : {}),
        ...(item.itemType ? { itemType: item.itemType } : {}),
        ...(item.themeLabel ? { themeLabel: item.themeLabel } : {}),
        ...(item.useCaseKey ? { useCaseKey: item.useCaseKey } : {}),
        ...(item.requirementLevel ? { requirementLevel: item.requirementLevel } : {}),
        ...(item.requirementReason ? { requirementReason: item.requirementReason } : {}),
        ...(item.plainMeaning ? { plainMeaning: item.plainMeaning } : {}),
        ...(item.contextualUse ? { contextualUse: item.contextualUse } : {}),
        ...(item.programmeContext ? { programmeContext: item.programmeContext } : {}),
        ...(item.domainContext ? { domainContext: item.domainContext } : {}),
        ...(item.areaContext ? { areaContext: item.areaContext } : {}),
        ...(item.roleContext ? { roleContext: item.roleContext } : {}),
        ...(item.expectedOutput ? { expectedOutput: item.expectedOutput } : {}),
        ...(item.limitations?.length ? { limitations: [...item.limitations] } : {}),
        ...(item.geographicScope ? { geographicScope: item.geographicScope } : {}),
        ...(item.prerequisiteNames?.length ? { prerequisites: [...item.prerequisiteNames] } : {}),
        ...(item.relationships?.length ? { relationships: item.relationships.map((relation) => ({ ...relation })) } : {}),
        ...(item.sourceReferences?.length ? { sourceReferences: item.sourceReferences.map((reference) => ({ ...reference })) } : {}),
        ...(item.linkTitle ? { linkTitle: item.linkTitle } : {}),
        ...(item.linkRationale ? { linkRationale: item.linkRationale } : {}),
        ...(item.learningLinks?.length ? { learningLinks: item.learningLinks.map((link) => ({ ...link })) } : {}),
        ...(item.linkAccess ? { linkAccess: item.linkAccess } : {}),
        ...(item.linkKind ? { linkKind: item.linkKind } : {}),
        ...(item.sourceLocators?.length ? { sourceLocators: item.sourceLocators.map((locator) => ({ ...locator })) } : {}),
        ...(item.sourceConfidence ? { sourceConfidence: item.sourceConfidence } : {}),
        ...(item.evidenceType ? { evidenceType: item.evidenceType } : {}),
        ...(item.verifiedAt ? { verifiedAt: item.verifiedAt } : {}),
      });
  const itemSummaries = input.items?.length
    ? sequence.order.flatMap((id) => {
      const item = itemById.get(id);
      return item ? [summarizeItem(item)] : [];
    })
    : undefined;
  const selectedAlternativeGroups = new Map<string, string>();
  for (const id of eligibleSelectedIds) {
    const item = itemById.get(id);
    if (item?.alternativeGroup) selectedAlternativeGroups.set(item.alternativeGroup, id);
  }
  const selectableByGroup = new Map<string, LearningPlanCandidate[]>();
  for (const item of input.items ?? []) {
    if (!item.alternativeGroup || !isSelectableLearningCandidate(item, input.selection.route)) continue;
    selectableByGroup.set(item.alternativeGroup, [...(selectableByGroup.get(item.alternativeGroup) ?? []), item]);
  }
  const alternativeSummaries = [...selectedAlternativeGroups.entries()].flatMap(([group, selectedId]) => {
    const options = (selectableByGroup.get(group) ?? []).filter((item) => item.id !== selectedId);
    return options.length ? [{ group, selectedId, options: options.map(summarizeItem) }] : [];
  });
  return {
    snapshotId: input.snapshotId,
    route: { ...input.selection.route },
    selectedIds: [...eligibleSelectedIds],
    order: sequence.order,
    removedIds: [...new Set(input.selection.removedIds ?? [])],
    ...(itemSummaries?.length ? { itemSummaries } : {}),
    ...(alternativeSummaries.length ? { alternativeSummaries } : {}),
    dataVersion: input.dataVersion,
    createdAt: now,
    updatedAt: now,
    share: { visibility: "private" },
  };
}

/** Persist several route stacks as one private report without blending them. */
export function createLearningPlanReportSnapshot(input: {
  snapshotId: string;
  selections: LearningPlanRouteSelection[];
  ordersByRoute?: Record<string, string[]>;
  items?: LearningPlanCandidate[];
  dataVersion: string;
  now?: string;
}): LearningPlanReportSnapshot {
  const now = input.now ?? new Date().toISOString();
  const warnings = multiRouteWarnings(input.selections.map((selection) => selection.route));
  const stacks = input.selections.map((selection) => createLearningPlanSnapshot({
    snapshotId: `${input.snapshotId}:${learningPlanRouteKey(selection.route)}`,
    selection: {
      route: selection.route,
      selectedIds: selection.selectedIds,
      removedIds: selection.removedIds,
    },
    order: input.ordersByRoute?.[learningPlanRouteKey(selection.route)] ?? selection.order ?? selection.selectedIds,
    items: input.items,
    dataVersion: input.dataVersion,
    now,
  })).map((stack) => ({ ...stack, routeWarnings: warnings }));
  return {
    snapshotId: input.snapshotId,
    stacks,
    routeWarnings: warnings,
    dataVersion: input.dataVersion,
    createdAt: now,
    updatedAt: now,
    share: { visibility: "private" },
  };
}
