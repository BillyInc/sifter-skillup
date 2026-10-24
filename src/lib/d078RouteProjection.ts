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
  combination_area_routes: CombinationAreaRoute[];
  combination_area_role_routes: CombinationRoleRoute[];
  typed_relationship_edges: D078TypedRelationshipEdge[];
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
  explanation?: string;
  explanationBasis?: "reviewed_relationship_type_and_endpoint_context" | string;
  sourceResolved?: boolean;
  targetResolved: boolean;
  routeAvailability?: "available_in_declared_routes" | "unavailable_destination";
  routeAvailabilityReason?: string;
};

const data = routeData as unknown as UiRouteData;

export type D078Selection = {
  methodIds: string[];
  combinationIds: string[];
  componentMethodIds: Record<string, string[]>;
  areaId?: string;
  roleId?: string;
  addedItemIds: string[];
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

function routeItemIds(route: Record<string, unknown>) {
  return [
    ...(route.area_item_ids as string[] | undefined ?? []),
    ...(route.task_linked_domain_item_ids as string[] | undefined ?? []),
    ...(route.available_item_ids as string[] | undefined ?? []),
    ...(route.domain_downstream_item_ids as string[] | undefined ?? []),
  ];
}

function routeToolIds(route: Record<string, unknown>) {
  return [
    ...(route.tool_ids as string[] | undefined ?? []),
    ...(route.domain_tool_ids as string[] | undefined ?? []),
  ];
}

function isToolId(id: string): boolean {
  const node = data.nodes_by_id[id];
  return node?.item_type === "tool" || node?.kind === "area_tool_option" || node?.kind === "area_tool_application_reference";
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
    const contribution = combinationId ? {
      method_id: methodId,
      contribution: String((route as Record<string, unknown>).contribution ?? "Contributes the route-specific work shown for this method."),
      task_family_ids: [...((route.task_family_ids as string[] | undefined) ?? [])],
      area_item_ids: [...((route.area_item_ids as string[] | undefined) ?? [])],
      task_linked_domain_item_ids: [...((route.task_linked_domain_item_ids as string[] | undefined) ?? [])],
      available_item_ids: [...((route.available_item_ids as string[] | undefined) ?? [])],
        explanatory_item_ids: [...((route.explanatory_item_ids as string[] | undefined) ?? [])],
      domain_downstream_item_ids: [...((route.domain_downstream_item_ids as string[] | undefined) ?? [])],
      tool_ids: [...((route.tool_ids as string[] | undefined) ?? [])],
      domain_tool_ids: [...((route.domain_tool_ids as string[] | undefined) ?? [])],
    } : undefined;
    if (contribution) support.methodContributions.set(methodId, contribution);
    else for (const id of (route.task_family_ids as string[] | undefined) ?? []) {
      support.tasks.add(id);
      taskFamilies.get(areaId)!.add(id);
    }
    for (const id of (route.area_item_ids as string[] | undefined) ?? []) areaItems.get(areaId)!.add(id);
    for (const id of (route.explanatory_item_ids as string[] | undefined) ?? []) explanatoryItems.get(areaId)!.add(id);
    const downstreamIds = combinationId
      ? [
        ...((route.area_item_ids as string[] | undefined) ?? []),
        ...((route.task_linked_domain_item_ids as string[] | undefined) ?? []),
      ]
      : routeItemIds(route);
    for (const id of downstreamIds) {
      if (isToolId(id)) { tools.add(id); toolsByArea.get(areaId)!.add(id); }
      else if (String(id).startsWith("area_enrichment_item:") || String(id).startsWith("area_learning_item:")) areaItems.get(areaId)!.add(id);
      else { domainItems.add(id); domainItemsByArea.get(areaId)!.add(id); }
    }
    for (const id of routeToolIds(route)) { tools.add(id); toolsByArea.get(areaId)!.add(id); }
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
        for (const id of contribution.task_family_ids ?? []) {
          support.tasks.add(id);
          taskFamilies.get(areaId)!.add(id);
        }
        for (const id of contribution.area_item_ids ?? []) areaItems.get(areaId)!.add(id);
        for (const id of contribution.explanatory_item_ids ?? []) explanatoryItems.get(areaId)!.add(id);
        for (const id of [...(contribution.task_linked_domain_item_ids ?? []), ...(contribution.available_item_ids ?? []), ...(contribution.domain_downstream_item_ids ?? [])]) {
          if (isToolId(id)) { tools.add(id); toolsByArea.get(areaId)!.add(id); }
          else if (id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) areaItems.get(areaId)!.add(id);
          else { domainItems.add(id); domainItemsByArea.get(areaId)!.add(id); }
        }
        for (const id of [...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])]) { tools.add(id); toolsByArea.get(areaId)!.add(id); }
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
          for (const id of contribution.task_family_ids ?? []) taskFamilies.get(areaId)!.add(id);
          for (const id of contribution.area_item_ids ?? []) areaItems.get(areaId)!.add(id);
          for (const id of [
            ...(contribution.task_linked_domain_item_ids ?? []),
          ]) {
            if (isToolId(id)) { tools.add(id); toolsByArea.get(areaId)!.add(id); }
            else if (id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) areaItems.get(areaId)!.add(id);
            else { domainItems.add(id); domainItemsByArea.get(areaId)!.add(id); }
          }
          for (const id of [...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])]) { tools.add(id); toolsByArea.get(areaId)!.add(id); }
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

  const visibleAreas: VisibleArea[] = [...areaSupports.entries()].flatMap(([areaId, support]) => {
    const node = areaNode(areaId);
    return node ? [{
      areaId,
      nodeId: node.id,
      label: node.label,
        supportingMethodIds: [...new Set([...support.methods, ...[...support.methodContributions.keys()]])],
      supportingCombinationIds: [...support.combos],
      taskFamilyIds: [...support.tasks],
      routeCount: support.routes.size,
      methodContributions: [...support.methodContributions.values()].map((contribution) => ({
        methodId: contribution.method_id,
        contribution: contribution.contribution,
        taskFamilyIds: contribution.task_family_ids ?? [],
        itemIds: unique([
          ...(contribution.area_item_ids ?? []),
          ...(contribution.task_linked_domain_item_ids ?? []),
          ...(contribution.available_item_ids ?? []),
        ]),
        toolIds: unique([...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])]),
      })),
    }] : [];
  }).sort((a, b) => b.routeCount - a.routeCount || a.label.localeCompare(b.label));
  const visibleAreaIds = new Set(visibleAreas.map((area) => area.areaId));
  const visibleRoles: VisibleRole[] = [...roleSupports.values()].flatMap((support) => {
    const roleId = support.roleId;
    const node = data.nodes_by_id[roleId];
    return visibleAreaIds.has(support.areaId) && node ? [{
      roleId,
      label: node.label,
      areaId: support.areaId,
      supportingMethodIds: [...support.methods],
      supportingCombinationIds: [...support.combos],
      fitClaim: "not_inferred_from_area_membership" as const,
    }] : [];
  }).sort((a, b) => a.label.localeCompare(b.label));
  const selectedRole = visibleRoles.find((role) => role.roleId === selection.roleId && role.areaId === selection.areaId);
  const activeItemIds = new Set([
    ...domainItems,
    ...tools,
    ...(selection.areaId ? areaItems.get(selection.areaId) ?? [] : []),
    ...(selectedRole ? roleItemsByRole.get(selectedRole.roleId)?.items ?? [] : []),
    ...(selectedRole ? roleItemsByRole.get(selectedRole.roleId)?.methodItems ?? [] : []),
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
    else if (selectedMethods.length >= 2 && combo.combination_mode === "design_frame_with_selectable_methods") {
      const selectedRequired = combo.required_method_ids.every((id) => selectedMethods.includes(id));
      const selectedComponents = selectedMethods.filter((id) => selectable.has(id));
      const onlyAllowed = selectedMethods.every((id) => required.has(id) || selectable.has(id));
      if (selectedRequired && selectedComponents.length > 0 && onlyAllowed) matchStatus = "exact";
      else if (onlyAllowed) matchStatus = "partial";
    } else if (selectedMethods.length >= 2 && combo.combination_mode !== "design_frame_with_selectable_methods") {
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
    areaItemIdsByArea: Object.fromEntries([...areaItems.entries()].map(([key, values]) => [key, [...values]])),
    explanatoryItemIdsByArea: Object.fromEntries([...explanatoryItems.entries()].map(([key, values]) => [key, [...values]])),
    roleItemIds: selectedRole ? [...(roleItems?.items ?? [])] : [],
    methodSpecificRoleItemIds: selectedRole ? [...(roleItems?.methodItems ?? [])] : [],
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
      (byCombination[itemId]?.[selectedCombinationId] ?? []).some((evidence) => activeMethodIds.has(evidence.method_id)),
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
  return layerContract.item_ids.filter((id) => (routesByItem[id] ?? []).some((methodId) => selectedMethodIds.has(methodId)));
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
    delete componentMethodIds[combinationId];
    return cascadeD078Selection({ ...selection, combinationIds: [], componentMethodIds });
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
  return {
    ...selection,
    ...(projection.requestedAreaHidden ? { areaId: undefined, roleId: undefined } : {}),
    ...(!projection.requestedAreaHidden && projection.requestedRoleHidden ? { roleId: undefined } : {}),
  };
}

export function selectD078Area(selection: D078Selection, areaId: string): D078Selection {
  const projection = projectD078Route(selection);
  if (!projection.visibleAreas.some((area) => area.areaId === areaId)) return selection;
  return { ...selection, areaId, roleId: undefined };
}

export function selectD078Role(selection: D078Selection, roleId: string): D078Selection {
  const projection = projectD078Route({ ...selection, roleId });
  if (!projection.visibleRoles.some((role) => role.roleId === roleId && role.areaId === selection.areaId)) return selection;
  return { ...selection, roleId };
}

export function selectableD078ItemIds(projection: D078Projection, areaId?: string, selection?: D078Selection): Set<string> {
  return new Set([
    ...projection.domainItemIds,
    ...projection.toolIds,
    ...(areaId ? projection.areaItemIdsByArea[areaId] ?? [] : []),
    ...projection.roleItemIds,
    ...projection.methodSpecificRoleItemIds,
    ...(selection ? d078ApplicableLayerItems(2, selection) : []),
    ...(selection ? d078ApplicableLayerItems(3, selection) : []),
  ]);
}

export function toggleD078AddedItem(selection: D078Selection, itemId: string): D078Selection {
  const projection = projectD078Route(selection);
  const selectable = selectableD078ItemIds(projection, selection.areaId, selection);
  if (!selectable.has(itemId)) return selection;
  return {
    ...selection,
    addedItemIds: selection.addedItemIds.includes(itemId)
      ? selection.addedItemIds.filter((id) => id !== itemId)
      : [...selection.addedItemIds, itemId],
  };
}
