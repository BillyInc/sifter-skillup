import routeData from "@/data/d078MethodAwareUiData.json";

type RouteNode = {
  id: string;
  kind: string;
  item_type?: string;
  label: string;
  area_id?: string;
  role_id?: string;
  requirement_lane?: string;
  requirement_level?: string;
  requirement_reason?: string;
  requirement_scope?: { area_ids?: string[]; [key: string]: unknown };
  student_visible?: boolean;
  meaning?: string;
  plain_language_meaning?: string;
  meaning_in_domain?: string;
  learner_output?: string | string[];
  limitations?: string[];
  programme_learning_context?: {
    coverage?: string;
    student_note?: string;
    course_refs?: Array<{
      course_code: string;
      course_title: string;
      source_locator: string;
      outcome_id?: string;
      evidence: string;
    }>;
  };
  relationships?: Array<Record<string, unknown>>;
  learning_links?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

type MethodAreaRoute = {
  method_id: string;
  area_id: string;
  route_node_id: string;
  task_family_ids: string[];
  area_item_ids: string[];
  task_linked_domain_item_ids: string[];
  available_item_ids: string[];
  tool_ids: string[];
  domain_downstream_item_ids: string[];
  domain_tool_ids: string[];
  explanatory_item_ids?: string[];
  [key: string]: unknown;
};

type MethodRoleRoute = {
  method_id: string;
  area_id: string;
  role_id: string;
  role_item_ids: string[];
  method_specific_role_item_ids: string[];
  method_to_role_fit_claim: "not_inferred_from_area_membership";
};

type CombinationAreaRoute = {
  combination_id: string;
  area_id: string;
  task_family_ids: string[];
  area_item_ids: string[];
  task_linked_domain_item_ids: string[];
  available_item_ids: string[];
  tool_ids: string[];
  domain_downstream_item_ids: string[];
  domain_tool_ids: string[];
  role_ids: string[];
  role_route_ids: string[];
  explanatory_item_ids?: string[];
  method_contributions?: CombinationMethodContribution[];
};

type CombinationMethodContribution = {
  method_id: string;
  contribution: string;
  task_family_ids?: string[];
  area_item_ids?: string[];
  task_linked_domain_item_ids?: string[];
  available_item_ids?: string[];
  explanatory_item_ids?: string[];
  domain_downstream_item_ids?: string[];
  tool_ids?: string[];
  domain_tool_ids?: string[];
};

type CombinationRoleRoute = {
  combination_id: string;
  area_id: string;
  role_id: string;
  role_item_ids: string[];
  method_specific_role_item_ids: string[];
};

type CombinationDesign = {
  id: string;
  design: string;
  combination_mode: string;
  required_method_ids: string[];
  selectable_component_method_ids: string[];
  area_routes: Array<{ area_id: string; task_family_ids: string[]; role_ids: string[]; method_contributions?: CombinationMethodContribution[] }>;
  integration_contract?: Record<string, unknown>;
  component_route_variants?: Array<{
    id: string;
    selected_component_method_ids: string[];
    active_method_ids: string[];
    area_routes: Array<{
      area_id: string;
      method_contributions: CombinationMethodContribution[];
      role_ids: string[];
      role_contributions_by_id?: Record<string, Array<{
        method_id: string;
        role_item_ids: string[];
        method_specific_role_item_ids: string[];
      }>>;
    }>;
  }>;
  method_contributions?: CombinationMethodContribution[];
  foundation_links?: string[];
  match_rule?: string;
  ambiguous_match_rule?: string;
};

type RoleToolRoute = {
  role_id: string;
  tool_node_id: string;
  task_node_id?: string;
  contextualToSelection?: boolean;
  area_ids: string[];
  contextual_use: string;
  expected_output: string;
  requirement_level: "optional";
  requirement_lane: "useful_optional_edge";
  name: string;
  learning_resource?: {
    title?: string;
    url?: string;
    access?: string;
    why_this_resource?: string;
  };
  official_reference?: { title?: string; url?: string };
  source_references?: Array<Record<string, unknown>>;
};

type UiRouteData = {
  source_schema_version: string;
  student_visible: boolean;
  programme_transition: Record<string, unknown>;
  domain_learning_layers: Array<{
    layer: number;
    sequence_order: number;
    name: string;
    node_id?: string;
    item_ids?: string[];
    route_applicability_by_item?: Record<string, string[]>;
    route_applicability_by_combination?: Record<string, Record<string, Array<{ method_id: string; condition?: string; rationale?: string; evidence_basis?: string }>>>;
    [key: string]: unknown;
  }>;
  programme_method_context?: Record<string, {
    coverage: string;
    course_refs: Array<{ course_code: string; course_title: string; source_locator: string; outcome_id?: string; evidence: string }>;
    student_note: string;
  }>;
  method_item_fit_audit?: {
    candidate_item_count: number;
    method_count: number;
    pair_count: number;
    dispositions: Array<{ item_id: string; method_id: string; disposition: string; external_search_status: string; external_sources?: string[]; condition?: string | null; no_fit_allowed?: boolean | null }>;
  };
  external_source_registry?: Record<string, { title: string; url: string; supports: string; locator?: string; accessed?: string; limits?: string }>;
  foundation_item_ids: string[];
  method_choice_node_id: string;
  method_node_ids: string[];
  combination_designs: CombinationDesign[];
  method_area_routes: MethodAreaRoute[];
  method_area_role_routes: MethodRoleRoute[];
  role_tool_routes: RoleToolRoute[];
  combination_area_routes: CombinationAreaRoute[];
  combination_area_role_routes: CombinationRoleRoute[];
  typed_relationship_edges: D078TypedRelationshipEdge[];
  area_sequence_reconciliation?: Record<string, unknown>;
  area_foundation_contract?: {
    display_order?: string;
    foundation_count?: number;
    foundations_are_progression_blockers?: boolean;
    foundation_nodes?: string[];
    foundation_ids_by_area?: Record<string, string[]>;
    decisions_by_area?: Record<string, {
      disposition?: string;
      reason?: string;
      foundation_ids?: string[];
      foundation_is_progression_blocker?: boolean;
    }>;
    no_additional_foundation_areas?: string[];
    every_supported_area_route_carries_its_foundation_ids?: boolean;
  };
  role_learning_sequence_contract?: Record<string, unknown>;
  selection_progression_contract?: {
    version?: string;
    counts?: Record<string, number>;
  };
  context_enrichment_summary?: Record<string, unknown>;
  nodes_by_id: Record<string, RouteNode>;
};

export type D078TypedRelationshipEdge = {
  id?: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  status?: string;
  blockingPolicy?: string;
  sequencePolicy?: string;
  sequenceApproved?: boolean;
  sequenceScope?: string;
  explanation?: string;
  condition?: string;
  areaId?: string;
  roleId?: string;
  roleTaskId?: string;
  roleAreaIds?: string[];
  fitClaimLimit?: string;
  evidenceBasis?: string;
  evidenceSourceIds?: string[];
  sourceReferences?: Array<Record<string, unknown>>;
  recommendationOnly?: boolean;
  explanationBasis?: "reviewed_relationship_type_and_endpoint_context" | string;
  sourceResolved?: boolean;
  targetResolved: boolean;
  alternativeReviewDisposition?: "approved" | "unapproved" | string;
  selectable?: boolean;
  routeAvailability?: "available_in_declared_routes" | "unavailable_destination";
  routeAvailabilityReason?: string;
};

/** A resolved label is not enough to make an alternative affect selection. */
export function isD078SelectableAlternativeEdge(edge: D078TypedRelationshipEdge): boolean {
  const expectedBasis = edge.relationship === "tool_alternative_for_role_task"
    ? "source_backed_role_task_tool_alternative"
    : "source_backed_alternative_relationship";
  const expectedSourceRole = edge.relationship === "tool_alternative_for_role_task"
    ? "role_task_tool_alternative_evidence"
    : "alternative_relationship_evidence";
  if (edge.status !== "resolved_ready_for_use"
    || !["alternative_to", "alternative_tool_option", "tool_alternative_for_role_task"].includes(edge.relationship)
    || edge.sourceResolved === false
    || edge.targetResolved === false
    || edge.selectable === false
    || (edge.alternativeReviewDisposition !== undefined && edge.alternativeReviewDisposition !== "approved")
    || edge.routeAvailability === "unavailable_destination"
    || edge.evidenceBasis !== expectedBasis) return false;
  return (edge.sourceReferences ?? []).some((reference) => {
    if (reference.source_role !== expectedSourceRole) return false;
    const url = String(reference.url ?? reference.source_url ?? "").trim();
    const locator = String(reference.locator ?? "").trim();
    return url.startsWith("https://") || Boolean(locator);
  });
}

const data = routeData as unknown as UiRouteData;
export const D078_SOCIETY_KNOWLEDGE_ITEM_ID = "runtime-item:domain:d078:d078-society-and-social-world-knowledge";

function hasReviewedEvidence(edge: D078TypedRelationshipEdge, evidenceBasis: string, sourceRoles: string[]): boolean {
  if (edge.status !== "resolved_ready_for_use" || edge.evidenceBasis !== evidenceBasis) return false;
  return (edge.sourceReferences ?? []).some((reference) => {
    const role = String(reference.source_role ?? "");
    return sourceRoles.includes(role)
      && Boolean(String(reference.url ?? "").trim() || String(reference.locator ?? "").trim());
  });
}

function hasReviewedAreaTaskItemEvidence(edge: D078TypedRelationshipEdge): boolean {
  const accepted: Record<string, string[]> = {
    reviewed_area_task_item_synthesis: ["area_task_evidence", "area_item_evidence"],
    official_casevo_project_and_paper_plus_existing_abm_area_route: ["tool_capability_evidence", "area_task_route_context"],
    reviewed_peer_method_paper_and_project_learning_material: ["area_item_evidence", "task_specific_learning_resource"],
    reviewed_canonical_domain_tool_area_context: ["domain_item_evidence", "area_task_evidence"],
  };
  const roles = accepted[edge.evidenceBasis ?? ""];
  return Boolean(roles && hasReviewedEvidence(edge, edge.evidenceBasis ?? "", roles));
}

function hasReviewedRoleTaskItemEvidence(edge: D078TypedRelationshipEdge): boolean {
  return hasReviewedEvidence(edge, "locally_verified_bounded_role_task_output_plus_item_and_role_sources", [
    "role_item_task_reconciliation", "role_item_evidence", "authoritative_role_task_evidence",
  ]);
}

function areaItemEdgesForTaskFamilies(familyIds: Set<string>, areaId: string): D078TypedRelationshipEdge[] {
  return data.typed_relationship_edges.filter((edge) => {
    if (edge.relationship !== "task_has_area_learning_item"
      || edge.status !== "resolved_ready_for_use"
      || !familyIds.has(edge.sourceId)
      || !hasReviewedAreaTaskItemEvidence(edge)) return false;
    const item = data.nodes_by_id[edge.targetId];
    return Boolean(item && (item.area_id === areaId || edge.areaId === areaId) && item.student_visible === true
      && item.student_selectable !== false && item.approval !== "unapproved");
  });
}

function hasReviewedAreaFamilyToRoleTaskEvidence(edge: D078TypedRelationshipEdge): boolean {
  const references = edge.sourceReferences ?? [];
  return hasReviewedEvidence(edge, "reviewed_cross_source_task_scope_synthesis", [
    "authoritative_work_sources", "evidence", "explanatory_sources", "authoritative_work_source_ids", "explanatory_source_ids",
  ])
    && references.some((reference) => reference.source_role === "authoritative_work_sources" && String(reference.url ?? "").trim())
    && references.some((reference) => ["evidence", "explanatory_sources", "authoritative_work_source_ids", "explanatory_source_ids"].includes(String(reference.source_role ?? "")));
}

export type D078Selection = {
  methodIds: string[];
  combinationIds: string[];
  componentMethodIds: Record<string, string[]>;
  areaId?: string;
  roleId?: string;
  addedItemIds: string[];
  /** Field checkbox on the domain page. Independent of merely opening the page. */
  domainInPlan?: boolean;
  /** Area kept in the learning plan. Independent of the area currently open. */
  planAreaId?: string;
  /** Role kept in the learning plan. Independent of the role currently open. */
  planRoleId?: string;
  /** Optional, multi-select work-focus choices scoped to each supported area. */
  taskFamilyIdsByArea?: Record<string, string[]>;
};

export type CombinationCard = {
  id: string;
  label: string;
  mode: string;
  selected: boolean;
  requiredMethodIds: string[];
  selectableComponentMethodIds: string[];
  selectedComponentMethodIds: string[];
  whyCombine: string;
  howUsed: string;
  condition: string;
  limits: string;
  selectionRule: string;
  matchStatus: "hidden" | "partial" | "exact" | "selected";
  missingMethodIds: string[];
  methodContributions: Array<{ methodId: string; contribution: string }>;
  foundationLinks: Array<{ id: string; label: string }>;
};

export type VisibleArea = {
  areaId: string;
  nodeId: string;
  label: string;
  supportingMethodIds: string[];
  supportingCombinationIds: string[];
  taskFamilyIds: string[];
  /** Non-blocking area-owned context shown before task-family choices. */
  areaFoundationIds: string[];
  /** Route families linked to domain items the learner actually selected. Informational only. */
  selectedDomainContextFamilyIds: string[];
  /** Route families linked to area items the learner actually selected. */
  selectedAreaContextFamilyIds: string[];
  /** Reviewed area-owned cards belonging to each selectable work context. */
  areaItemIdsByTaskFamily: Record<string, string[]>;
  routeCount: number;
  methodContributions: Array<{
    methodId: string;
    contribution: string;
    taskFamilyIds: string[];
    itemIds: string[];
    toolIds: string[];
  }>;
};

export type VisibleRole = {
  roleId: string;
  label: string;
  areaId: string;
  supportingMethodIds: string[];
  supportingCombinationIds: string[];
  fitClaim: "not_inferred_from_area_membership";
  taskContexts: Array<{
    familyId: string;
    familyLabel: string;
    taskId: string;
    taskLabel: string;
    explanation: string;
    learnerOutput?: string | string[];
    limitations?: string[];
    taskConditions?: string[];
    condition?: string;
    fitClaimLimit?: string;
    roleItemIds: string[];
    selectionBasis: "selected_work_focus" | "selected_domain_learning" | "selected_area_learning" | "method_route";
  }>;
  /** Role items with reviewed evidence links to a selected non-method-only task context. */
  contextualRoleItemIds: string[];
};

export type D078Projection = {
  foundations: { id: string; label: string }[];
  methods: { id: string; label: string; selected: boolean }[];
  combinations: CombinationCard[];
  visibleAreas: VisibleArea[];
  visibleRoles: VisibleRole[];
  domainItemIds: string[];
  toolIds: string[];
  domainItemIdsByArea: Record<string, string[]>;
  toolIdsByArea: Record<string, string[]>;
  areaItemIdsByArea: Record<string, string[]>;
  explanatoryItemIdsByArea: Record<string, string[]>;
  roleItemIds: string[];
  methodSpecificRoleItemIds: string[];
  roleToolIds: string[];
  roleToolRoutes: RoleToolRoute[];
  hiddenBecause: "no_method_selected" | "choose_combination_design" | "complete_combination_design" | "unsupported_method_combination" | null;
  requestedAreaHidden: boolean;
  requestedRoleHidden: boolean;
  orphanedItemIds: string[];
  taskFamilyIdsByArea: Record<string, string[]>;
};

export const INITIAL_D078_SELECTION: D078Selection = {
  methodIds: [],
  combinationIds: [],
  componentMethodIds: {},
  addedItemIds: [],
};

const unique = <T,>(values: T[]): T[] => [...new Set(values)];

/** Apply only reviewed prerequisites/workflows; keep stable route order for ties. */
export function orderD078ItemsByReviewedSequence(ids: string[]): string[] {
  const orderedIds = unique(ids);
  const inputOrder = new Map(orderedIds.map((id, index) => [id, index]));
  const candidates = new Set(orderedIds);
  const adjacency = new Map(orderedIds.map((id) => [id, new Set<string>()]));
  const indegree = new Map(orderedIds.map((id) => [id, 0]));
  for (const edge of data.typed_relationship_edges ?? []) {
    if (edge.sequenceApproved !== true
      || !["conditional_prerequisite", "workflow"].includes(edge.sequencePolicy ?? "")
      || !candidates.has(edge.sourceId) || !candidates.has(edge.targetId)) continue;
    const targets = adjacency.get(edge.sourceId)!;
    if (targets.has(edge.targetId)) continue;
    targets.add(edge.targetId);
    indegree.set(edge.targetId, (indegree.get(edge.targetId) ?? 0) + 1);
  }
  const ready = orderedIds.filter((id) => indegree.get(id) === 0);
  const result: string[] = [];
  while (ready.length) {
    ready.sort((left, right) => inputOrder.get(left)! - inputOrder.get(right)!);
    const current = ready.shift()!;
    result.push(current);
    for (const target of adjacency.get(current) ?? []) {
      const nextDegree = (indegree.get(target) ?? 0) - 1;
      indegree.set(target, nextDegree);
      if (nextDegree === 0) ready.push(target);
    }
  }
  // The graph generator has its own cycle gate; fail safe to stable route
  // order if malformed runtime data nevertheless contains a cycle.
  return result.length === orderedIds.length ? result : orderedIds;
}

/**
 * Keep requirement lanes distinct while ordering the lanes themselves when a
 * reviewed route edge crosses them. This prevents a fixed "conditional before
 * useful" presentation from visually reversing a source-backed workflow.
 * Ties remain in the supplied lane order; a lane-level cycle falls back to
 * that stable order, while item-level relationship details remain available.
 */
export function orderD078RequirementLanesBySequence(
  itemIds: string[],
  laneForItem: (itemId: string) => string,
  preferredLaneOrder: string[],
): string[] {
  const presentLanes = [...new Set(itemIds.map(laneForItem))];
  const preferredRank = new Map(preferredLaneOrder.map((lane, index) => [lane, index]));
  const inputRank = new Map(presentLanes.map((lane, index) => [lane, index]));
  const lanes = [...presentLanes].sort((left, right) =>
    (preferredRank.get(left) ?? Number.MAX_SAFE_INTEGER) - (preferredRank.get(right) ?? Number.MAX_SAFE_INTEGER)
    || inputRank.get(left)! - inputRank.get(right)!,
  );
  const laneByItem = new Map(itemIds.map((id) => [id, laneForItem(id)]));
  const laneSet = new Set(lanes);
  const adjacency = new Map(lanes.map((lane) => [lane, new Set<string>()]));
  const indegree = new Map(lanes.map((lane) => [lane, 0]));

  for (const edge of data.typed_relationship_edges ?? []) {
    if (edge.sequenceApproved !== true
      || !["conditional_prerequisite", "workflow"].includes(edge.sequencePolicy ?? "")
      || !laneByItem.has(edge.sourceId) || !laneByItem.has(edge.targetId)) continue;
    const sourceLane = laneByItem.get(edge.sourceId)!;
    const targetLane = laneByItem.get(edge.targetId)!;
    if (sourceLane === targetLane || !laneSet.has(sourceLane) || !laneSet.has(targetLane)) continue;
    const targets = adjacency.get(sourceLane)!;
    if (targets.has(targetLane)) continue;
    targets.add(targetLane);
    indegree.set(targetLane, (indegree.get(targetLane) ?? 0) + 1);
  }

  const result: string[] = [];
  const ready = lanes.filter((lane) => indegree.get(lane) === 0);
  while (ready.length) {
    ready.sort((left, right) =>
      (preferredRank.get(left) ?? Number.MAX_SAFE_INTEGER) - (preferredRank.get(right) ?? Number.MAX_SAFE_INTEGER)
      || inputRank.get(left)! - inputRank.get(right)!,
    );
    const lane = ready.shift()!;
    result.push(lane);
    for (const target of adjacency.get(lane) ?? []) {
      indegree.set(target, (indegree.get(target) ?? 0) - 1);
      if (indegree.get(target) === 0) ready.push(target);
    }
  }
  return result.length === lanes.length ? result : lanes;
}

function routeItemIds(route: Record<string, unknown>, isAvailable: (id: string) => boolean = () => true) {
  return [
    ...(route.area_item_ids as string[] | undefined ?? []),
    ...(route.task_linked_domain_item_ids as string[] | undefined ?? []),
    ...(route.available_item_ids as string[] | undefined ?? []),
    ...(route.domain_downstream_item_ids as string[] | undefined ?? []),
  ].filter(isAvailable);
}

function routeToolIds(route: Record<string, unknown>) {
  return [
    ...(route.tool_ids as string[] | undefined ?? []),
    ...(route.domain_tool_ids as string[] | undefined ?? []),
  ];
}

function isToolId(id: string): boolean {
  const node = data.nodes_by_id[id];
  return ["tool", "programming_language", "python_library", "computational_environment"].includes(String(node?.item_type ?? ""))
    || node?.kind === "area_tool_option" || node?.kind === "area_tool_application_reference";
}

function isAreaStageTool(id: string): boolean {
  return data.nodes_by_id[id]?.display_stage === "area";
}

function areaNode(areaId: string): RouteNode | undefined {
  return Object.values(data.nodes_by_id).find((node) => node.kind === "area_of_specialization" && node.area_id === areaId);
}

export function d078AreaLabel(areaId?: string): string | undefined {
  return areaId ? areaNode(areaId)?.label : undefined;
}

export function d078CombinationLabel(combinationId: string): string | undefined {
  const combination = data.combination_designs.find((candidate) => candidate.id === combinationId);
  if (!combination) return undefined;
  const node = data.nodes_by_id[combinationId];
  return node?.label ?? combination.design.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Resolve either canonical area_id or graph-node id to the route join key. */
export function resolveD078AreaId(value?: string): string | undefined {
  if (!value) return undefined;
  const node = Object.values(data.nodes_by_id).find((candidate) =>
    candidate.kind === "area_of_specialization" && (candidate.id === value || candidate.area_id === value),
  );
  return typeof node?.area_id === "string" ? node.area_id : undefined;
}

function methodIdsForSelection(selection: D078Selection, combo: CombinationDesign): string[] {
  const required = combo.required_method_ids ?? [];
  const selectable = new Set(combo.selectable_component_method_ids ?? []);
  const chosenComponents = (selection.componentMethodIds[combo.id] ?? []).filter((id) => selectable.has(id));
  return unique([...required, ...chosenComponents]);
}

export function projectD078Route(selection: D078Selection): D078Projection {
  const selectedItemIds = new Set(selection.addedItemIds);
  const isNodeAvailable = (id: string) => {
    const node = data.nodes_by_id[id];
    if (!node || node.student_visible !== true || node.student_selectable === false || node.approval === "unapproved") {
      return false;
    }
    const required = node.required_selected_domain_item_ids;
    return !Array.isArray(required) || required.every((requiredId) => selectedItemIds.has(String(requiredId)));
  };
  const availableIds = (ids: string[] | undefined) => (ids ?? []).filter(isNodeAvailable);
  const knownMethods = new Set(data.method_node_ids);
  const knownCombos = new Map(data.combination_designs.map((combo) => [combo.id, combo]));
  const selectedCombos = unique(selection.combinationIds.filter((id) => knownCombos.has(id))).slice(0, 1);
  // A named combination owns the combined route. Keep an additional standalone
  // method only when the learner explicitly selected a method that belongs to
  // that design; unrelated stale selections cannot broaden the route.
  const requestedMethods = unique(selection.methodIds.filter((id) => knownMethods.has(id)));
  const selectedCombo = selectedCombos.length ? knownCombos.get(selectedCombos[0]) : undefined;
  const selectedComboMethods = selectedCombo
    ? new Set([
      ...selectedCombo.required_method_ids,
      ...(selection.componentMethodIds[selectedCombo.id] ?? []).filter((id) => selectedCombo.selectable_component_method_ids.includes(id)),
    ])
    : undefined;
  const selectedMethods = selectedComboMethods
    ? requestedMethods.filter((id) => selectedComboMethods.has(id))
    : requestedMethods;

  const areaSupports = new Map<string, { methods: Set<string>; combos: Set<string>; tasks: Set<string>; routes: Set<string>; methodContributions: Map<string, CombinationMethodContribution> }>();
  const roleSupports = new Map<string, { roleId: string; areaId: string; methods: Set<string>; combos: Set<string> }>();
  const areaItems = new Map<string, Set<string>>();
  const explanatoryItems = new Map<string, Set<string>>();
  const taskFamilies = new Map<string, Set<string>>();
  const domainItems = new Set<string>();
  const tools = new Set<string>();
  const domainItemsByArea = new Map<string, Set<string>>();
  const toolsByArea = new Map<string, Set<string>>();
  const roleItemsByRole = new Map<string, { items: Set<string>; methodItems: Set<string> }>();
  const roleItemKey = (roleId: string, areaId: string) => `${areaId}\u0000${roleId}`;

  const ensureArea = (areaId: string) => {
    if (!areaSupports.has(areaId)) areaSupports.set(areaId, { methods: new Set(), combos: new Set(), tasks: new Set(), routes: new Set(), methodContributions: new Map() });
    if (!areaItems.has(areaId)) areaItems.set(areaId, new Set());
    if (!explanatoryItems.has(areaId)) explanatoryItems.set(areaId, new Set());
    if (!taskFamilies.has(areaId)) taskFamilies.set(areaId, new Set());
    if (!domainItemsByArea.has(areaId)) domainItemsByArea.set(areaId, new Set());
    if (!toolsByArea.has(areaId)) toolsByArea.set(areaId, new Set());
    return areaSupports.get(areaId)!;
  };
  const addRole = (roleId: string, areaId: string, methodId?: string, combinationId?: string) => {
    if (!areaSupports.has(areaId)) return;
    const key = `${areaId}\u0000${roleId}`;
    const current = roleSupports.get(key) ?? { roleId, areaId, methods: new Set<string>(), combos: new Set<string>() };
    if (methodId) current.methods.add(methodId);
    if (combinationId) current.combos.add(combinationId);
    roleSupports.set(key, current);
  };
  const addMethodRoute = (methodId: string, route: Record<string, unknown>, combinationId?: string) => {
    const areaId = String(route.area_id ?? "");
    if (!areaId || !areaNode(areaId)) return;
    const support = ensureArea(areaId);
    if (combinationId) support.combos.add(combinationId);
    else support.methods.add(methodId);
    support.routes.add(`${combinationId ?? methodId}:${areaId}`);
    const routeNode = data.nodes_by_id[String(route.route_node_id ?? "")];
    const contribution = {
      method_id: methodId,
      contribution: String((route as Record<string, unknown>).contribution ?? routeNode?.student_explanation ?? "This method connects to the area work shown for this route."),
      task_family_ids: availableIds(route.task_family_ids as string[] | undefined),
      area_item_ids: availableIds(route.area_item_ids as string[] | undefined),
      task_linked_domain_item_ids: availableIds(route.task_linked_domain_item_ids as string[] | undefined),
      available_item_ids: availableIds(route.available_item_ids as string[] | undefined),
        explanatory_item_ids: [...((route.explanatory_item_ids as string[] | undefined) ?? [])],
      domain_downstream_item_ids: availableIds(route.domain_downstream_item_ids as string[] | undefined),
      tool_ids: availableIds(route.tool_ids as string[] | undefined),
      domain_tool_ids: availableIds(route.domain_tool_ids as string[] | undefined),
    };
    support.methodContributions.set(methodId, contribution);
    for (const id of contribution.task_family_ids) {
      support.tasks.add(id);
      taskFamilies.get(areaId)!.add(id);
    }
    for (const edge of areaItemEdgesForTaskFamilies(new Set(contribution.task_family_ids), areaId)) {
      if (isNodeAvailable(edge.targetId)) areaItems.get(areaId)!.add(edge.targetId);
    }
    for (const id of availableIds(route.area_item_ids as string[] | undefined)) areaItems.get(areaId)!.add(id);
    for (const id of availableIds(route.explanatory_item_ids as string[] | undefined)) explanatoryItems.get(areaId)!.add(id);
    const downstreamIds = combinationId
      ? [
        ...availableIds(route.area_item_ids as string[] | undefined),
        ...availableIds(route.task_linked_domain_item_ids as string[] | undefined),
      ]
      : routeItemIds(route, isNodeAvailable);
    for (const id of downstreamIds) {
      if (isToolId(id)) {
        if (!isAreaStageTool(id)) tools.add(id);
        toolsByArea.get(areaId)!.add(id);
      }
      else if (String(id).startsWith("area-item:") || String(id).startsWith("area_enrichment_item:") || String(id).startsWith("area_learning_item:")) areaItems.get(areaId)!.add(id);
      else { domainItems.add(id); domainItemsByArea.get(areaId)!.add(id); }
    }
    for (const id of routeToolIds(route).filter(isNodeAvailable)) {
      if (!isAreaStageTool(id)) tools.add(id);
      toolsByArea.get(areaId)!.add(id);
    }
  };

  // A single method is a complete individual route. Multi-selects do not
  // inherit the union of individual downstream routes: they wait for a named
  // design choice below.
  if (selectedMethods.length === 1 && selectedCombos.length === 0 || selectedCombos.length > 0 && selectedMethods.length > 0) {
    for (const methodId of selectedMethods) {
    for (const route of data.method_area_routes.filter((row) => row.method_id === methodId)) addMethodRoute(methodId, route);
    for (const route of data.method_area_role_routes.filter((row) => row.method_id === methodId)) {
      addRole(route.role_id, route.area_id, methodId);
      const key = roleItemKey(route.role_id, route.area_id);
      const items = roleItemsByRole.get(key) ?? { items: new Set<string>(), methodItems: new Set<string>() };
      route.role_item_ids.forEach((id) => items.items.add(id));
      route.method_specific_role_item_ids.forEach((id) => items.methodItems.add(id));
      roleItemsByRole.set(key, items);
    }
    }
  }

  const addFrameCombinationRoutes = (combinationId: string, activeMethodIds: string[]) => {
    const combo = knownCombos.get(combinationId);
    const selectedComponents = activeMethodIds.filter((id) => !combo?.required_method_ids.includes(id)).sort();
    const exactVariant = combo?.component_route_variants?.find((variant) =>
      [...variant.selected_component_method_ids].sort().join("\u0000") === selectedComponents.join("\u0000"),
    );
    if (!exactVariant) return;
    for (const route of exactVariant.area_routes) {
      const areaId = route.area_id;
      if (!areaNode(areaId)) continue;
      const support = ensureArea(areaId);
      support.combos.add(combinationId);
      support.routes.add(`${exactVariant.id}:${areaId}`);
      for (const contribution of route.method_contributions) {
        support.methodContributions.set(contribution.method_id, contribution);
        for (const id of availableIds(contribution.task_family_ids)) {
          support.tasks.add(id);
          taskFamilies.get(areaId)!.add(id);
        }
        for (const edge of areaItemEdgesForTaskFamilies(new Set(contribution.task_family_ids ?? []), areaId)) {
          if (isNodeAvailable(edge.targetId)) areaItems.get(areaId)!.add(edge.targetId);
        }
        for (const id of availableIds(contribution.area_item_ids)) areaItems.get(areaId)!.add(id);
        // A selected exact design owns these method-attributed choices too.
        // Keep them attached to their contributing method in the area detail,
        // while making them selectable in the domain lane. Omitting these
        // arrays made valid technique/extension choices disappear on combined
        // routes even though the reviewed graph carried them on the exact
        // route contribution.
        for (const id of availableIds([
          ...(contribution.available_item_ids ?? []),
          ...(contribution.domain_downstream_item_ids ?? []),
        ])) {
          if (isToolId(id)) {
            if (!isAreaStageTool(id)) tools.add(id);
            toolsByArea.get(areaId)!.add(id);
          } else if (id.startsWith("area-item:") || id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) {
            areaItems.get(areaId)!.add(id);
          } else {
            domainItems.add(id);
            domainItemsByArea.get(areaId)!.add(id);
          }
        }
        for (const id of availableIds(contribution.explanatory_item_ids)) explanatoryItems.get(areaId)!.add(id);
        for (const id of availableIds(contribution.task_linked_domain_item_ids)) {
          if (isToolId(id)) {
            if (!isAreaStageTool(id)) tools.add(id);
            toolsByArea.get(areaId)!.add(id);
          }
          else if (id.startsWith("area-item:") || id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) areaItems.get(areaId)!.add(id);
          else { domainItems.add(id); domainItemsByArea.get(areaId)!.add(id); }
        }
        for (const id of availableIds([...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])])) {
          if (!isAreaStageTool(id)) tools.add(id);
          toolsByArea.get(areaId)!.add(id);
        }
      }
      for (const roleId of route.role_ids) {
        for (const methodId of activeMethodIds) addRole(roleId, areaId, methodId, combinationId);
        const key = roleItemKey(roleId, areaId);
        const items = roleItemsByRole.get(key) ?? { items: new Set<string>(), methodItems: new Set<string>() };
        for (const contribution of route.role_contributions_by_id?.[roleId] ?? []) {
          contribution.role_item_ids.forEach((id) => items.items.add(id));
          contribution.method_specific_role_item_ids.forEach((id) => items.methodItems.add(id));
        }
        roleItemsByRole.set(key, items);
      }
    }
  };

  for (const combinationId of selectedCombos) {
    const combo = knownCombos.get(combinationId)!;
    if (combo.area_routes.length) {
      for (const route of data.combination_area_routes.filter((row) => row.combination_id === combinationId)) {
        const areaId = route.area_id;
        if (!areaNode(areaId)) continue;
        const support = ensureArea(areaId);
        support.combos.add(combinationId);
        support.routes.add(`${combinationId}:${areaId}`);
        for (const contribution of route.method_contributions ?? []) {
          support.methodContributions.set(contribution.method_id, contribution);
          for (const id of availableIds(contribution.task_family_ids)) taskFamilies.get(areaId)!.add(id);
          for (const id of availableIds(contribution.area_item_ids)) areaItems.get(areaId)!.add(id);
        for (const id of availableIds(contribution.task_linked_domain_item_ids)) {
            if (isToolId(id)) {
              if (!isAreaStageTool(id)) tools.add(id);
              toolsByArea.get(areaId)!.add(id);
            }
            else if (id.startsWith("area-item:") || id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) areaItems.get(areaId)!.add(id);
            else { domainItems.add(id); domainItemsByArea.get(areaId)!.add(id); }
          }
          // Preserve the exact design's method-attributed downstream choices.
          // These are not the legacy design-wide aggregate: each contribution
          // is scoped to this selected design and its evidenced area route.
          for (const id of availableIds([
            ...(contribution.available_item_ids ?? []),
            ...(contribution.domain_downstream_item_ids ?? []),
          ])) {
            if (isToolId(id)) {
              if (!isAreaStageTool(id)) tools.add(id);
              toolsByArea.get(areaId)!.add(id);
            } else if (id.startsWith("area-item:") || id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) {
              areaItems.get(areaId)!.add(id);
            } else {
              domainItems.add(id);
              domainItemsByArea.get(areaId)!.add(id);
            }
          }
          for (const id of availableIds([...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])])) {
            if (!isAreaStageTool(id)) tools.add(id);
            toolsByArea.get(areaId)!.add(id);
          }
        }
        for (const id of route.explanatory_item_ids ?? []) explanatoryItems.get(areaId)!.add(id);
        for (const roleId of route.role_ids ?? []) addRole(roleId, areaId, undefined, combinationId);

      }
      for (const route of data.combination_area_role_routes.filter((row) => row.combination_id === combinationId)) {
        addRole(route.role_id, route.area_id, undefined, combinationId);
        const key = roleItemKey(route.role_id, route.area_id);
        const items = roleItemsByRole.get(key) ?? { items: new Set<string>(), methodItems: new Set<string>() };
        route.role_item_ids.forEach((id) => items.items.add(id));
        route.method_specific_role_item_ids.forEach((id) => items.methodItems.add(id));
        roleItemsByRole.set(key, items);
      }
    } else {
      addFrameCombinationRoutes(combinationId, methodIdsForSelection(selection, combo));
    }
  }

  // A reviewed, route-scoped prerequisite/workflow source must be present in
  // the same selected area path as its target, even when the two items are
  // attached to different sibling task families. This does not create a new
  // family link or a blocker; it makes the earlier learning visible so the
  // learner can review/select it before the target when the condition fits.
  for (const [areaId, targetItems] of areaItems) {
    const areaTargets = new Set([
      ...targetItems,
      ...(toolsByArea.get(areaId) ?? []),
      ...(domainItemsByArea.get(areaId) ?? []),
    ]);
    for (const edge of data.typed_relationship_edges ?? []) {
      if (edge.sequenceApproved !== true
        || !["conditional_prerequisite", "workflow"].includes(edge.sequencePolicy ?? "")
        || !areaTargets.has(edge.targetId)
        || !isNodeAvailable(edge.sourceId)) continue;
      const source = data.nodes_by_id[edge.sourceId];
      if (!source || knownMethods.has(edge.sourceId)) continue;
      if (isToolId(edge.sourceId)) {
        if (!isAreaStageTool(edge.sourceId)) tools.add(edge.sourceId);
        toolsByArea.get(areaId)!.add(edge.sourceId);
      } else if (edge.sourceId.startsWith("area-item:")
        || edge.sourceId.startsWith("area_enrichment_item:")
        || edge.sourceId.startsWith("area_learning_item:")) {
        targetItems.add(edge.sourceId);
      } else {
        domainItems.add(edge.sourceId);
        domainItemsByArea.get(areaId)!.add(edge.sourceId);
      }
    }
  }

  const domainRouteOptionIds = new Set([...domainItems, ...tools]);
  const selectedDomainItemIds = new Set(selection.addedItemIds.filter((id) => domainRouteOptionIds.has(id)));
  const selectedDomainContextFamiliesByArea = new Map<string, Set<string>>();
  for (const edge of data.typed_relationship_edges) {
    const isReviewedDomainTaskLink = edge.relationship === "domain_item_supports_area_task"
      && hasReviewedEvidence(edge, "reviewed_domain_item_area_task_synthesis", ["domain_item_evidence", "area_task_evidence"]);
    const isReviewedDomainOptionGate = edge.relationship === "task_family_available_after_selected_domain_option"
      && edge.blockingPolicy === "never"
      && edge.sequencePolicy === "none"
      && hasReviewedEvidence(edge, "reviewed_specialist_extension_condition", ["authoritative_work_sources"]);
    if ((!isReviewedDomainTaskLink && !isReviewedDomainOptionGate)
      || !selectedDomainItemIds.has(edge.sourceId)) continue;
    for (const [areaId, routeFamilyIds] of taskFamilies) {
      if (!routeFamilyIds.has(edge.targetId)) continue;
      const matches = selectedDomainContextFamiliesByArea.get(areaId) ?? new Set<string>();
      matches.add(edge.targetId);
      selectedDomainContextFamiliesByArea.set(areaId, matches);
    }
  }
  const selectedAreaContextFamiliesByArea = new Map<string, Set<string>>();
  const selectedAreaItemIds = new Set(selection.addedItemIds.filter((id) =>
    [...areaItems.values(), ...toolsByArea.values()].some((items) => items.has(id))));
  for (const edge of data.typed_relationship_edges) {
    if (edge.relationship !== "task_has_area_learning_item"
      || !hasReviewedAreaTaskItemEvidence(edge)
      || !selectedAreaItemIds.has(edge.targetId)) continue;
    for (const [areaId, routeFamilyIds] of taskFamilies) {
      if (!routeFamilyIds.has(edge.sourceId)) continue;
      const matches = selectedAreaContextFamiliesByArea.get(areaId) ?? new Set<string>();
      matches.add(edge.sourceId);
      selectedAreaContextFamiliesByArea.set(areaId, matches);
    }
  }

  const visibleAreas: VisibleArea[] = [...areaSupports.entries()].flatMap(([areaId, support]) => {
    const node = areaNode(areaId);
    return node ? [{
      areaId,
      nodeId: node.id,
      label: node.label,
        supportingMethodIds: [...new Set([...support.methods, ...[...support.methodContributions.keys()]])],
      supportingCombinationIds: [...support.combos],
      taskFamilyIds: [...support.tasks],
      areaFoundationIds: unique((
        data.area_foundation_contract?.foundation_ids_by_area?.[areaId]
        ?? Object.values(data.nodes_by_id)
          .filter((candidate) => candidate.kind === "area_foundation" && candidate.area_id === areaId)
          .map((candidate) => candidate.id)
      ).filter((id) => {
        const candidate = data.nodes_by_id[id];
        return candidate?.area_id === areaId && isNodeAvailable(id);
      })),
      selectedDomainContextFamilyIds: [...(selectedDomainContextFamiliesByArea.get(areaId) ?? [])],
      selectedAreaContextFamilyIds: [...(selectedAreaContextFamiliesByArea.get(areaId) ?? [])],
      areaItemIdsByTaskFamily: Object.fromEntries([...support.tasks].map((familyId) => [
        familyId,
        unique(areaItemEdgesForTaskFamilies(new Set([familyId]), areaId)
          .map((edge) => edge.targetId)
          .filter((itemId) => areaItems.get(areaId)?.has(itemId))),
      ])),
      routeCount: support.routes.size,
      methodContributions: [...support.methodContributions.values()].map((contribution) => {
        const contributionIsActive = support.methods.has(contribution.method_id) || [...support.combos].some((comboId) => {
          const combo = knownCombos.get(comboId);
          return [...(combo?.required_method_ids ?? []), ...(selection.componentMethodIds[comboId] ?? [])].includes(contribution.method_id);
        });
        return {
          methodId: contribution.method_id,
          contribution: contribution.contribution,
          taskFamilyIds: contribution.task_family_ids ?? [],
          itemIds: unique([
            ...(contribution.area_item_ids ?? []),
            ...(contribution.task_linked_domain_item_ids ?? []),
            ...(contributionIsActive ? contribution.available_item_ids ?? [] : []),
          // A selected combination exposes only the domain items attached to
          // its active method contributions. Never import the combination
          // route's broad aggregate list as if every standalone method item
          // belonged to that exact design.
          ...(contributionIsActive ? contribution.domain_downstream_item_ids ?? [] : []),
          ]),
          toolIds: unique([...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])]),
        };
      }),
    }] : [];
  }).sort((a, b) =>
    // Domain-item links are non-blocking relevance signals. When the learner
    // selected such an item, put matching areas first; otherwise use the
    // selected method/design's task-family coverage. Neither is a prerequisite
    // or a claim of occupational importance.
    b.selectedDomainContextFamilyIds.length - a.selectedDomainContextFamilyIds.length
    || b.taskFamilyIds.length - a.taskFamilyIds.length
    || b.routeCount - a.routeCount
    || a.label.localeCompare(b.label),
  );
  const visibleAreaIds = new Set(visibleAreas.map((area) => area.areaId));
  const selectedTaskFamiliesByArea = Object.fromEntries([...taskFamilies.entries()].map(([areaId, eligibleIds]) => {
    const eligible = new Set(eligibleIds);
    return [areaId, unique((selection.taskFamilyIdsByArea?.[areaId] ?? []).filter((id) => eligible.has(id)))];
  }));
  const visibleRoles: VisibleRole[] = [...roleSupports.values()].flatMap((support) => {
    const roleId = support.roleId;
    const node = data.nodes_by_id[roleId];
    const selectedFamilies = new Set(selectedTaskFamiliesByArea[support.areaId] ?? []);
    const domainContextFamilies = selectedDomainContextFamiliesByArea.get(support.areaId) ?? new Set<string>();
    const selectedAreaItems = new Set(selection.addedItemIds.filter((id) =>
      areaItems.get(support.areaId)?.has(id) || toolsByArea.get(support.areaId)?.has(id)));
    const areaContextFamilies = new Set(data.typed_relationship_edges
      .filter((edge) => edge.relationship === "task_has_area_learning_item"
        && hasReviewedAreaTaskItemEvidence(edge)
        && selectedAreaItems.has(edge.targetId)
        && taskFamilies.get(support.areaId)?.has(edge.sourceId))
      .map((edge) => edge.sourceId));
    // Every role shown on this method/design route keeps its baseline route.
    // Once the learner selects a work focus, narrow the role's task narrative
    // to that focus; role visibility and the role's general learning items do
    // not become task-specific without a reviewed link.
    const routeFamilies = taskFamilies.get(support.areaId) ?? new Set<string>();
    const explicitContextFamilies = new Set([
      ...selectedFamilies,
      ...domainContextFamilies,
      ...areaContextFamilies,
    ]);
    // With no optional focus, preserve every task context on the baseline
    // method/design route. Once the learner chooses domain/area learning or a
    // task family, carry only those explicitly supported contexts forward.
    const relevantFamilies = explicitContextFamilies.size ? explicitContextFamilies : routeFamilies;
    const taskContexts: VisibleRole["taskContexts"] = [];
    for (const familyEdge of data.typed_relationship_edges.filter((edge) =>
      edge.relationship === "area_task_family_supports_role_task"
      && hasReviewedAreaFamilyToRoleTaskEvidence(edge)
      && relevantFamilies.has(edge.sourceId),
    )) {
      const task = data.nodes_by_id[familyEdge.targetId];
      if (!task || task.kind !== "role_task_family" || task.role_id !== roleId
        || !Array.isArray(task.area_ids) || !task.area_ids.includes(support.areaId)) continue;
      const roleEdge = data.typed_relationship_edges.find((edge) =>
        edge.relationship === "role_task_family_of_role"
        && edge.sourceId === task.id
        && edge.targetId === roleId
        && hasReviewedEvidence(edge, "role_task_set_source_profile", ["authoritative_work_sources"]),
      );
      if (!roleEdge) continue;
      const family = data.nodes_by_id[familyEdge.sourceId];
      const roleItemIds = unique(data.typed_relationship_edges
        .filter((edge) => edge.relationship === "role_task_supports_role_item"
          && edge.sourceId === task.id
          && hasReviewedRoleTaskItemEvidence(edge))
        .map((edge) => edge.targetId)
        .filter((itemId) => {
          const item = data.nodes_by_id[itemId];
          return item?.kind === "role_item_candidate"
            && item.student_visible === true
            && item.student_selectable !== false
            && item.approval === "approved";
        }));
      taskContexts.push({
        familyId: familyEdge.sourceId,
        familyLabel: family?.label ?? familyEdge.sourceId,
        taskId: task.id,
        taskLabel: task.label,
        explanation: familyEdge.explanation,
        ...(typeof task.learner_output === "string" || Array.isArray(task.learner_output) ? { learnerOutput: task.learner_output as string | string[] } : {}),
        ...(Array.isArray(task.limitations) ? { limitations: task.limitations as string[] } : {}),
        ...(Array.isArray(task.task_conditions) ? {
          taskConditions: (task.task_conditions as string[])
            .map((condition) => condition.replace(/^Task conditions:\s*/i, "").trim())
            .filter(Boolean),
        } : {}),
        ...(typeof familyEdge.condition === "string" ? { condition: familyEdge.condition } : {}),
        ...(typeof familyEdge.fitClaimLimit === "string" ? { fitClaimLimit: familyEdge.fitClaimLimit } : {}),
        roleItemIds,
        selectionBasis: selectedFamilies.has(familyEdge.sourceId)
          ? "selected_work_focus"
          : domainContextFamilies.has(familyEdge.sourceId)
            ? "selected_domain_learning"
            : areaContextFamilies.has(familyEdge.sourceId)
              ? "selected_area_learning"
              : "method_route",
      });
    }
    const contextualRoleItemIds = unique(taskContexts
      .filter((context) => context.selectionBasis !== "method_route")
      .flatMap((context) => context.roleItemIds));
    return visibleAreaIds.has(support.areaId) && node ? [{
      roleId,
      label: node.label,
      areaId: support.areaId,
      supportingMethodIds: [...support.methods],
      supportingCombinationIds: [...support.combos],
      fitClaim: "not_inferred_from_area_membership" as const,
      taskContexts,
      contextualRoleItemIds,
    }] : [];
  }).sort((a, b) => {
    // First reflect a selected area work focus or a selected domain item that
    // connects to that role through the reviewed family/task/role path. Then
    // use method/design route coverage. This is route fit, not job readiness.
    const aContextSupport = a.taskContexts.filter((context) => context.selectionBasis !== "method_route").length;
    const bContextSupport = b.taskContexts.filter((context) => context.selectionBasis !== "method_route").length;
    const aRouteSupport = a.supportingMethodIds.length + a.supportingCombinationIds.length;
    const bRouteSupport = b.supportingMethodIds.length + b.supportingCombinationIds.length;
    return bContextSupport - aContextSupport || bRouteSupport - aRouteSupport || a.label.localeCompare(b.label);
  });
  const selectedRole = visibleRoles.find((role) => role.roleId === selection.roleId && role.areaId === selection.areaId);
  const selectedRoleTaskIds = new Set(selectedRole?.taskContexts
    .filter((context) => context.selectionBasis !== "method_route")
    .map((context) => context.taskId) ?? []);
  const selectedRoleToolRoutes = selectedRole
    ? data.role_tool_routes.filter((route) => route.role_id === selectedRole.roleId && route.area_ids.includes(selectedRole.areaId))
    : [];
  const roleToolRoutes = selectedRoleToolRoutes.map((route) => ({
    ...route,
    contextualToSelection: selectedRoleTaskIds.size > 0 && Boolean(route.task_node_id && selectedRoleTaskIds.has(route.task_node_id)),
  }));
  const roleToolIds = unique(selectedRoleToolRoutes.map((route) => route.tool_node_id));
  const activeItemIds = new Set([
    ...domainItems,
    ...tools,
    ...(data.nodes_by_id[D078_SOCIETY_KNOWLEDGE_ITEM_ID]?.student_visible === true ? [D078_SOCIETY_KNOWLEDGE_ITEM_ID] : []),
    ...(selection.areaId ? areaItems.get(selection.areaId) ?? [] : []),
    ...(selection.areaId ? visibleAreas.find((area) => area.areaId === selection.areaId)?.areaFoundationIds ?? [] : []),
    ...(selectedRole ? roleItemsByRole.get(selectedRole.roleId)?.items ?? [] : []),
    ...(selectedRole ? roleItemsByRole.get(selectedRole.roleId)?.methodItems ?? [] : []),
    ...roleToolIds,
  ]);
  const foundations = data.foundation_item_ids.map((id) => ({ id, label: data.nodes_by_id[id]?.label ?? id }));
  const methods = data.method_node_ids.map((id) => ({ id, label: data.nodes_by_id[id]?.label ?? id, selected: selectedMethods.includes(id) }));
  const combinations = data.combination_designs.map((combo) => {
    const node = data.nodes_by_id[combo.id];
    const components = (selection.componentMethodIds[combo.id] ?? []).filter((id) => combo.selectable_component_method_ids.includes(id));
    const required = new Set(combo.required_method_ids);
    const selectable = new Set(combo.selectable_component_method_ids);
    let matchStatus: CombinationCard["matchStatus"] = "hidden";
    let missingMethodIds: string[] = [];
    if (selectedCombos.includes(combo.id)) matchStatus = "selected";
    else if (selectedMethods.length > 0 && combo.combination_mode === "design_frame_with_selectable_methods") {
      const selectedRequired = combo.required_method_ids.every((id) => selectedMethods.includes(id));
      const selectedComponents = selectedMethods.filter((id) => selectable.has(id));
      const onlyAllowed = selectedMethods.every((id) => required.has(id) || selectable.has(id));
      if (selectedRequired && selectedComponents.length > 0 && onlyAllowed) matchStatus = "exact";
      else if (onlyAllowed && selectedMethods.some((id) => required.has(id) || selectable.has(id))) {
        matchStatus = "partial";
        missingMethodIds = [
          ...combo.required_method_ids.filter((id) => !selectedMethods.includes(id)),
          ...(selectedRequired && selectedComponents.length === 0 ? combo.selectable_component_method_ids : []),
        ];
      }
    } else if (selectedMethods.length > 0 && combo.combination_mode !== "design_frame_with_selectable_methods") {
      const selectedSet = new Set(selectedMethods);
      const requiredSet = new Set(combo.required_method_ids);
      if (selectedMethods.every((id) => requiredSet.has(id))) {
        if (selectedSet.size === requiredSet.size) matchStatus = "exact";
        else {
          matchStatus = "partial";
          missingMethodIds = [...requiredSet].filter((id) => !selectedSet.has(id));
        }
      }
    }
    return {
      id: combo.id,
      label: node?.label ?? combo.design,
      mode: combo.combination_mode,
      selected: selectedCombos.includes(combo.id),
      requiredMethodIds: combo.required_method_ids,
      selectableComponentMethodIds: combo.selectable_component_method_ids,
      selectedComponentMethodIds: components,
      whyCombine: String(node?.why_combine ?? ""),
      howUsed: String(node?.how_used ?? ""),
      condition: String(node?.condition ?? ""),
      limits: String(node?.limits ?? ""),
      selectionRule: String(node?.selection_rule ?? ""),
      matchStatus,
      missingMethodIds,
      methodContributions: ((node?.method_contributions as CombinationMethodContribution[] | undefined) ?? combo.method_contributions ?? []).map((contribution) => ({
        methodId: String((contribution as Record<string, unknown>).method_id ?? ""),
        contribution: String((contribution as Record<string, unknown>).contribution ?? ""),
      })),
      foundationLinks: ((node?.foundation_links as string[] | undefined) ?? combo.foundation_links ?? []).map((id) => ({
        id: String(id),
        label: data.nodes_by_id[String(id)]?.label ?? String(id),
      })),
    };
  });
  const roleItems = selectedRole ? roleItemsByRole.get(roleItemKey(selectedRole.roleId, selectedRole.areaId)) : undefined;
  const exactUnselected = combinations.some((combo) => combo.matchStatus === "exact");
  const partialUnselected = combinations.some((combo) => combo.matchStatus === "partial");
  const hiddenBecause: D078Projection["hiddenBecause"] = selectedCombos.length > 0 ? null
    : selectedMethods.length === 0 ? "no_method_selected"
      : selectedMethods.length === 1 ? null
        : exactUnselected ? "choose_combination_design"
          : partialUnselected ? "complete_combination_design"
            : "unsupported_method_combination";

  return {
    foundations,
    methods,
    combinations,
    visibleAreas,
    visibleRoles,
    domainItemIds: [...domainItems],
    toolIds: [...tools],
    domainItemIdsByArea: Object.fromEntries([...domainItemsByArea.entries()].map(([key, values]) => [key, [...values]])),
    toolIdsByArea: Object.fromEntries([...toolsByArea.entries()].map(([key, values]) => [key, [...values]])),
    areaItemIdsByArea: Object.fromEntries([...areaItems.entries()].map(([areaId, values]) => {
      const selectedFamilies = new Set(selectedTaskFamiliesByArea[areaId] ?? []);
      if (!selectedFamilies.size) return [areaId, [...values]];
      const routeFamilies = new Set(taskFamilies.get(areaId) ?? []);
      const allLinkedEdges = areaItemEdgesForTaskFamilies(routeFamilies, areaId);
      const selectedLinkedEdges = areaItemEdgesForTaskFamilies(selectedFamilies, areaId);
      const allLinkedIds = new Set(allLinkedEdges.map((edge) => edge.targetId));
      const selectedLinkedIds = selectedLinkedEdges.map((edge) => edge.targetId).filter(isNodeAvailable);
      const generalUnlinkedIds = [...values].filter((id) => !allLinkedIds.has(id));
      return [areaId, unique([...selectedLinkedIds, ...generalUnlinkedIds])];
    })),
    explanatoryItemIdsByArea: Object.fromEntries([...explanatoryItems.entries()].map(([key, values]) => [key, [...values]])),
    roleItemIds: selectedRole ? [...(roleItems?.items ?? [])] : [],
    methodSpecificRoleItemIds: selectedRole ? [...(roleItems?.methodItems ?? [])] : [],
    roleToolIds,
    roleToolRoutes,
    hiddenBecause,
    requestedAreaHidden: Boolean(selection.areaId && !visibleAreaIds.has(selection.areaId)),
    requestedRoleHidden: Boolean(selection.roleId && !selectedRole),
    orphanedItemIds: selection.addedItemIds.filter((id) => !activeItemIds.has(id)),
    taskFamilyIdsByArea: Object.fromEntries([...taskFamilies.entries()].map(([key, values]) => [key, [...values]])),
  };
}

export function d078Node(id: string): RouteNode | undefined {
  return data.nodes_by_id[id];
}

export function d078GraphDataForTests(): UiRouteData {
  return data;
}

/**
 * Return only Layer 2/3 items whose IDs are explicitly present in the selected
 * method routes. For a named design, a component-method route link is retained;
 * it is never inferred from a broad union of unrelated downstream items.
 */
export function d078ApplicableLayerItems(layer: number, selection: D078Selection): string[] {
  const layerContract = data.domain_learning_layers.find((entry) => entry.layer === layer);
  if (!layerContract?.item_ids?.length) return [];

  const selectedCombinationId = selection.combinationIds[0];
  if (selectedCombinationId) {
    const design = data.combination_designs.find((entry) => entry.id === selectedCombinationId);
    if (!design) return [];
    const activeMethodIds = new Set([
      ...design.required_method_ids,
      ...(selection.componentMethodIds[selectedCombinationId] ?? []).filter((id) => design.selectable_component_method_ids.includes(id)),
    ]);
    const byCombination = layerContract.route_applicability_by_combination ?? {};
    return layerContract.item_ids.filter((itemId) =>
      !isAreaStageTool(itemId)
      && (byCombination[itemId]?.[selectedCombinationId] ?? []).some((evidence) => activeMethodIds.has(evidence.method_id)),
    );
  }

  const selectedMethodIds = new Set<string>();
  if (selection.methodIds.length === 1 && data.method_node_ids.includes(selection.methodIds[0])) {
    selectedMethodIds.add(selection.methodIds[0]);
  } else {
    // Multi-selects must resolve to an exact named design before any combined
    // route-specific preparation is projected; never union independent routes.
    return [];
  }
  if (!selectedMethodIds.size) return [];

  const routesByItem = layerContract.route_applicability_by_item ?? {};
  return layerContract.item_ids.filter((id) =>
    !isAreaStageTool(id) && (routesByItem[id] ?? []).some((methodId) => selectedMethodIds.has(methodId)),
  );
}

export function d078TypedRelationshipEdges(): D078TypedRelationshipEdge[] {
  return data.typed_relationship_edges ?? [];
}

export function toggleD078Method(selection: D078Selection, methodId: string): D078Selection {
  if (!data.method_node_ids.includes(methodId)) return selection;
  const methodIds = selection.methodIds.includes(methodId)
    ? selection.methodIds.filter((id) => id !== methodId)
    : [...selection.methodIds, methodId];
  return cascadeD078Selection({ ...selection, methodIds });
}

export function toggleD078Combination(selection: D078Selection, combinationId: string): D078Selection {
  const combo = data.combination_designs.find((row) => row.id === combinationId);
  if (!combo) return selection;
  if (selection.combinationIds.includes(combinationId)) {
    const componentMethodIds = { ...selection.componentMethodIds };
    const restoredMethods = unique([
      ...combo.required_method_ids,
      ...(componentMethodIds[combinationId] ?? []),
    ]);
    delete componentMethodIds[combinationId];
    return cascadeD078Selection({ ...selection, methodIds: restoredMethods, combinationIds: [], componentMethodIds });
  }

  const selected = unique(selection.methodIds.filter((id) => data.method_node_ids.includes(id)));
  let components: string[] = [];
  if (combo.combination_mode === "design_frame_with_selectable_methods") {
    const requiredPresent = combo.required_method_ids.every((id) => selected.includes(id));
    const allowed = new Set([...combo.required_method_ids, ...combo.selectable_component_method_ids]);
    components = selected.filter((id) => combo.selectable_component_method_ids.includes(id));
    if (!requiredPresent || components.length === 0 || selected.some((id) => !allowed.has(id))) return selection;
  } else {
    const required = new Set(combo.required_method_ids);
    if (selected.length !== required.size || selected.some((id) => !required.has(id))) return selection;
  }
  return cascadeD078Selection({
    ...selection,
    methodIds: [],
    combinationIds: [combinationId],
    componentMethodIds: components.length ? { ...selection.componentMethodIds, [combinationId]: components } : {},
  });
}

export function toggleD078ComponentMethod(selection: D078Selection, combinationId: string, methodId: string): D078Selection {
  const combo = data.combination_designs.find((row) => row.id === combinationId);
  if (!combo || combo.combination_mode !== "design_frame_with_selectable_methods" || !combo.selectable_component_method_ids.includes(methodId)) return selection;
  const current = selection.componentMethodIds[combinationId] ?? [];
  const next = current.includes(methodId) ? current.filter((id) => id !== methodId) : [...current, methodId];
  if (next.length === 0) return selection;
  return cascadeD078Selection({ ...selection, componentMethodIds: { ...selection.componentMethodIds, [combinationId]: next } });
}

export function cascadeD078Selection(selection: D078Selection): D078Selection {
  const projection = projectD078Route(selection);
  const taskFamilyIdsByArea = Object.fromEntries(Object.entries(selection.taskFamilyIdsByArea ?? {}).flatMap(([areaId, selectedIds]) => {
    const eligible = new Set(projection.taskFamilyIdsByArea[areaId] ?? []);
    const retained = unique(selectedIds.filter((id) => eligible.has(id)));
    return retained.length ? [[areaId, retained]] : [];
  }));
  return {
    ...selection,
    taskFamilyIdsByArea,
    ...(projection.requestedAreaHidden ? { areaId: undefined, roleId: undefined } : {}),
    ...(!projection.requestedAreaHidden && projection.requestedRoleHidden ? { roleId: undefined } : {}),
  };
}

export function selectD078Area(selection: D078Selection, areaId: string): D078Selection {
  const projection = projectD078Route(selection);
  if (!projection.visibleAreas.some((area) => area.areaId === areaId)) return selection;
  return { ...selection, areaId, roleId: undefined };
}

export function toggleD078TaskFamily(selection: D078Selection, areaId: string, familyId: string): D078Selection {
  const area = projectD078Route(selection).visibleAreas.find((entry) => entry.areaId === areaId);
  if (!area?.taskFamilyIds.includes(familyId)) return selection;
  const current = selection.taskFamilyIdsByArea?.[areaId] ?? [];
  const next = current.includes(familyId)
    ? current.filter((id) => id !== familyId)
    : [...current, familyId];
  const taskFamilyIdsByArea = { ...(selection.taskFamilyIdsByArea ?? {}) };
  if (next.length) taskFamilyIdsByArea[areaId] = next;
  else delete taskFamilyIdsByArea[areaId];
  return { ...selection, taskFamilyIdsByArea };
}

export function selectD078Role(selection: D078Selection, roleId: string): D078Selection {
  const projection = projectD078Route({ ...selection, roleId });
  if (!projection.visibleRoles.some((role) => role.roleId === roleId && role.areaId === selection.areaId)) return selection;
  return { ...selection, roleId };
}

export function selectableD078ItemIds(projection: D078Projection, areaId?: string, selection?: D078Selection): Set<string> {
  const candidates = [
    ...projection.domainItemIds,
    ...projection.toolIds,
    ...(data.nodes_by_id[D078_SOCIETY_KNOWLEDGE_ITEM_ID]?.student_visible === true ? [D078_SOCIETY_KNOWLEDGE_ITEM_ID] : []),
    ...(areaId ? projection.areaItemIdsByArea[areaId] ?? [] : []),
    ...(areaId ? projection.visibleAreas.find((area) => area.areaId === areaId)?.areaFoundationIds ?? [] : []),
    ...(areaId ? projection.toolIdsByArea[areaId] ?? [] : []),
    ...projection.roleItemIds,
    ...projection.methodSpecificRoleItemIds,
    ...projection.roleToolIds,
    ...(selection ? d078ApplicableLayerItems(2, selection) : []),
    ...(selection ? d078ApplicableLayerItems(3, selection) : []),
  ];
  return new Set(candidates.filter((id) => {
    const node = data.nodes_by_id[id];
    return Boolean(node && node.student_visible === true && node.student_selectable !== false && node.approval !== "unapproved");
  }));
}

export function selectedD078ItemsForTray(
  projection: D078Projection,
  selection: D078Selection,
): Array<{ id: string; contextLevel: "domain" | "area" | "role" }> {
  const selectable = selectableD078ItemIds(projection, selection.areaId, selection);
  const roleItems = new Set([
    ...projection.roleItemIds,
    ...projection.methodSpecificRoleItemIds,
    ...projection.roleToolIds,
  ]);
  const areaItems = new Set(selection.areaId ? [
    ...(projection.areaItemIdsByArea[selection.areaId] ?? []),
    ...(projection.visibleAreas.find((area) => area.areaId === selection.areaId)?.areaFoundationIds ?? []),
    ...(projection.toolIdsByArea[selection.areaId] ?? []),
  ] : []);
  return selection.addedItemIds
    .filter((id) => selectable.has(id))
    .map((id) => ({
      id,
      contextLevel: roleItems.has(id) ? "role" as const : areaItems.has(id) ? "area" as const : "domain" as const,
    }));
}

export function toggleD078AddedItem(selection: D078Selection, itemId: string): D078Selection {
  const projection = projectD078Route(selection);
  const selectable = selectableD078ItemIds(projection, selection.areaId, selection);
  return toggleD078AddedItemWithinRoute(selection, itemId, selectable);
}

/** Apply an item checkbox change against a route's already-resolved eligible set. */
export function toggleD078AddedItemWithinRoute(selection: D078Selection, itemId: string, selectable: ReadonlySet<string>): D078Selection {
  // A selected choice must always be removable, even if that choice narrowed
  // the current projection and its refreshed eligibility set no longer lists
  // it. Route eligibility governs additions, never the ability to undo one.
  if (selection.addedItemIds.includes(itemId)) {
    return { ...selection, addedItemIds: selection.addedItemIds.filter((id) => id !== itemId) };
  }
  if (!selectable.has(itemId)) return selection;
  return {
    ...selection,
    addedItemIds: [...selection.addedItemIds, itemId],
  };
}
