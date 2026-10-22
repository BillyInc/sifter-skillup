import {
  d078AreaLabel,
  d078CombinationLabel,
  d078Node,
  d078GraphDataForTests,
  d078ApplicableLayerItems,
  projectD078Route,
  type D078Selection,
} from "@/lib/d078RouteProjection";
import { DEFAULT_D078_STACK_ID, normalizeD078RouteStacks, serializeD078RouteStacks, type D078RouteStackState } from "@/lib/d078RouteStacks";

export type D078Snapshot = Record<string, unknown>;

/** Keep saved selections usable only while their route still supports them. */
export function supportedD078Selection(value: unknown): D078Selection {
  const raw = value && typeof value === "object" ? value as Partial<D078Selection> : {};
  const componentMethodIds = raw.componentMethodIds && typeof raw.componentMethodIds === "object"
    ? Object.fromEntries(Object.entries(raw.componentMethodIds).map(([key, ids]) => [
      key,
      Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [],
    ]))
    : {};
  const base: D078Selection = {
    methodIds: Array.isArray(raw.methodIds) ? raw.methodIds.filter((id): id is string => typeof id === "string") : [],
    combinationIds: Array.isArray(raw.combinationIds) ? raw.combinationIds.filter((id): id is string => typeof id === "string") : [],
    componentMethodIds,
    areaId: typeof raw.areaId === "string" ? raw.areaId : undefined,
    roleId: typeof raw.roleId === "string" ? raw.roleId : undefined,
    addedItemIds: Array.isArray(raw.addedItemIds) ? raw.addedItemIds.filter((id): id is string => typeof id === "string") : [],
  };
  const projection = projectD078Route(base);
  const areaId = projection.visibleAreas.some((area) => area.areaId === base.areaId) ? base.areaId : undefined;
  const roleId = areaId && projection.visibleRoles.some((role) => role.roleId === base.roleId && role.areaId === areaId)
    ? base.roleId
    : undefined;
  const data = d078GraphDataForTests();
  const supportedItems = new Set<string>();
  const foundations = new Set(data.foundation_item_ids);
  const addRouteItems = (route: Record<string, unknown>) => {
    for (const key of ["area_item_ids", "task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids", "tool_ids", "domain_tool_ids"]) {
      const ids = route[key];
      if (Array.isArray(ids)) ids.forEach((id) => { if (typeof id === "string" && !foundations.has(id)) supportedItems.add(id); });
    }
  };
  const allowedRoleIds = new Set<string>();
  const methodIds = projection.methods.filter((method) => method.selected).map((method) => method.id);
  const activeMethodIds = new Set<string>();
  const addMethodRoutes = (methodId: string) => {
    activeMethodIds.add(methodId);
    for (const route of data.method_area_routes) {
      if (route.method_id === methodId && (!areaId || route.area_id === areaId)) addRouteItems(route);
    }
  };
  methodIds.forEach(addMethodRoutes);
  for (const combination of projection.combinations.filter((entry) => entry.selected)) {
    const design = data.combination_designs.find((entry) => entry.id === combination.id);
    if (!design) continue;
    const explicitRoutes = data.combination_area_routes.filter((route) => route.combination_id === combination.id);
    if (explicitRoutes.length) {
      explicitRoutes.filter((route) => !areaId || route.area_id === areaId).forEach(addRouteItems);
      for (const route of data.combination_area_role_routes) {
        if (route.combination_id === combination.id && (!areaId || route.area_id === areaId)) allowedRoleIds.add(route.role_id);
      }
      explicitRoutes.filter((route) => !areaId || route.area_id === areaId).forEach((route) => route.role_ids.forEach((id) => allowedRoleIds.add(id)));
    } else {
      const methods = [...design.required_method_ids, ...(base.componentMethodIds[combination.id] ?? [])];
      methods.forEach(addMethodRoutes);
    }
  }
  for (const route of data.method_area_role_routes) {
    if (activeMethodIds.has(route.method_id) && (!areaId || route.area_id === areaId)) allowedRoleIds.add(route.role_id);
  }
  if (roleId && allowedRoleIds.has(roleId)) {
    for (const route of data.method_area_role_routes) {
      if (activeMethodIds.has(route.method_id) && route.role_id === roleId && (!areaId || route.area_id === areaId)) {
        route.role_item_ids.forEach((id) => { if (!foundations.has(id)) supportedItems.add(id); });
        route.method_specific_role_item_ids.forEach((id) => { if (!foundations.has(id)) supportedItems.add(id); });
      }
    }
    for (const route of data.combination_area_role_routes) {
      if (projection.combinations.some((entry) => entry.selected && entry.id === route.combination_id)
        && route.role_id === roleId && (!areaId || route.area_id === areaId)) {
        route.role_item_ids.forEach((id) => { if (!foundations.has(id)) supportedItems.add(id); });
        route.method_specific_role_item_ids.forEach((id) => { if (!foundations.has(id)) supportedItems.add(id); });
      }
    }
  }
  if (base.areaId && !areaId) supportedItems.clear();
  if (!base.areaId || areaId) {
    d078ApplicableLayerItems(2, base).forEach((id) => supportedItems.add(id));
    d078ApplicableLayerItems(3, base).forEach((id) => supportedItems.add(id));
  }
  return {
    ...base,
    methodIds: projection.methods.filter((method) => method.selected).map((method) => method.id),
    combinationIds: projection.combinations.filter((combination) => combination.selected).map((combination) => combination.id),
    componentMethodIds: Object.fromEntries(projection.combinations
      .filter((combination) => combination.selected && combination.selectedComponentMethodIds.length)
      .map((combination) => [combination.id, combination.selectedComponentMethodIds])),
    areaId,
    roleId,
    addedItemIds: [...new Set(base.addedItemIds)].filter((id) => supportedItems.has(id)),
  };
}

export function isD078Snapshot(snapshot: unknown): snapshot is D078Snapshot {
  if (!snapshot || typeof snapshot !== "object") return false;
  const value = snapshot as D078Snapshot;
  const selections = value.d078SelectionsByRoute;
  return value.dataVersion === "guided-experience-d078-v1"
    && Boolean(selections && typeof selections === "object"
      && Object.entries(selections as Record<string, unknown>).some(([key, selection]) => isD078RouteKey(key) && selection && typeof selection === "object"));
}

export function d078SelectionFromSnapshot(snapshot: unknown, programmeId?: string, stackId?: string): Record<string, unknown> | null {
  if (!isD078Snapshot(snapshot)) return null;
  const selections = snapshot.d078SelectionsByRoute as Record<string, unknown>;
  const baseKey = `${programmeId || "programme-not-selected"}::D078`;
  const selectedStackId = stackId ?? (typeof snapshot.d078ActiveStackId === "string" ? snapshot.d078ActiveStackId : undefined);
  const exactKey = selectedStackId && selectedStackId !== DEFAULT_D078_STACK_ID ? `${baseKey}::${selectedStackId}` : baseKey;
  const matches = Object.entries(selections).filter(([key, value]) => isD078RouteKey(key) && value && typeof value === "object");
  const selected = selections[exactKey] ?? (matches.length === 1 ? matches[0][1] : undefined);
  return selected && typeof selected === "object" ? supportedD078Selection(selected) : null;
}

export function d078RouteStacksFromSnapshot(snapshot: unknown, programmeId?: string): D078RouteStackState | null {
  if (!isD078Snapshot(snapshot)) return null;
  const selections = snapshot.d078SelectionsByRoute as Record<string, unknown>;
  const baseKey = `${programmeId || "programme-not-selected"}::D078`;
  const explicitIds = Array.isArray(snapshot.d078RouteStackIds)
    ? (snapshot.d078RouteStackIds as unknown[]).filter((id): id is string => typeof id === "string" && Boolean(id.trim()))
    : [];
  const rows = explicitIds.flatMap((id) => {
    const key = id === DEFAULT_D078_STACK_ID ? baseKey : `${baseKey}::${id}`;
    const selection = selections[key];
    return selection && typeof selection === "object" ? [{ id, selection: supportedD078Selection(selection) }] : [];
  });
  if (!rows.length) {
    const legacy = selections[baseKey];
    if (legacy && typeof legacy === "object") rows.push({ id: DEFAULT_D078_STACK_ID, selection: supportedD078Selection(legacy) });
    for (const [key, selection] of Object.entries(selections)) {
      const prefix = `${baseKey}::`;
      if (key.startsWith(prefix) && selection && typeof selection === "object") {
        const id = key.slice(prefix.length);
        if (id && id !== DEFAULT_D078_STACK_ID && !rows.some((row) => row.id === id)) rows.push({ id, selection: supportedD078Selection(selection) });
      }
    }
  }
  if (!rows.length) return null;
  const activeId = typeof snapshot.d078ActiveStackId === "string" ? snapshot.d078ActiveStackId : undefined;
  return normalizeD078RouteStacks(rows, rows[0].selection, activeId);
}

/** Build a student Explore URL that resumes the selected D078 archive route. */
export function d078SavedRouteHref(snapshot: unknown, options: {
  snapshotProgrammeId?: string;
  programmeId?: string;
  jambProgrammeId?: string;
  schoolId?: string;
  snapshotId?: string;
} = {}): string | null {
  const routeStacks = d078RouteStacksFromSnapshot(snapshot, options.snapshotProgrammeId ?? options.programmeId ?? options.jambProgrammeId);
  if (!routeStacks) return null;
  const activeStack = routeStacks.stacks.find((stack) => stack.id === routeStacks.activeStackId);
  if (!activeStack) return null;
  const selection = supportedD078Selection(activeStack.selection);
  const roleNode = selection.roleId ? d078Node(selection.roleId) : undefined;
  const roleSlug = roleNode?.kind === "role" && selection.roleId
    ? selection.roleId.split(":").at(-1)
    : undefined;
  // D078 roles are area-owned. A stale/invalid role without a supported area
  // must not reopen as a direct role route.
  const roleKey = selection.areaId && roleSlug ? `D078|${roleSlug}` : undefined;
  const base = "/(tabs)/explore";
  const destination = roleKey
    ? `${base}/role/${encodeURIComponent(roleKey)}`
    : selection.areaId
      ? `${base}/domain/D078/subgroup/${encodeURIComponent(selection.areaId)}`
      : `${base}/domain/D078`;
  const query: Array<[string, string | undefined]> = [
    ["programme_id", options.programmeId],
    ["jamb_programme_id", options.jambProgrammeId],
    ["school_id", options.schoolId],
    ["user_type", "student"],
    ["journey_mode", "undergraduate_career"],
    ["focus", "guidance"],
    ["snapshot_id", options.snapshotId],
    ["domain_id", "D078"],
    ["area_id", selection.areaId],
    ["d078_selection", JSON.stringify(selection)],
    ["d078_route_stacks", serializeD078RouteStacks(routeStacks)],
    ["d078_role_id", roleKey ? selection.roleId : undefined],
    ["d078_from_field", !roleKey && selection.areaId ? "1" : undefined],
    ["d078_from_area", roleKey ? "1" : undefined],
  ];
  const encoded = query.filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `${destination}?${encoded}`;
}

function isD078RouteKey(key: string): boolean {
  return /::D078(?:$|::[^:]+$)/.test(key);
}

/** Resolve the programme key saved with this archive version before consulting the current path. */
export function d078ProgrammeIdFromSnapshot(snapshot: unknown): string | undefined {
  if (!snapshot || typeof snapshot !== "object") return undefined;
  const context = (snapshot as Record<string, unknown>).reportPathContext;
  if (!context || typeof context !== "object") return undefined;
  const programme = (context as Record<string, unknown>).programme;
  if (!programme || typeof programme !== "object") return undefined;
  const value = programme as Record<string, unknown>;
  for (const key of ["jambProgrammeId", "jamb_programme_id", "id"]) {
    if (typeof value[key] === "string" && value[key]) return value[key] as string;
  }
  return undefined;
}

export function d078ShareInputFromSnapshot(snapshot: unknown, programmeId?: string) {
  const selection = d078SelectionFromSnapshot(snapshot, programmeId) as D078Selection | null;
  if (!selection) return null;
  const methods = selection.methodIds.map((id) => d078Node(id)?.label ?? id);
  const combinations = selection.combinationIds.map((id) => d078CombinationLabel(id) ?? id);
  const components = Object.values(selection.componentMethodIds).flat().map((id) => d078Node(id)?.label ?? id);
  const choices = [...methods, ...combinations, ...components];
  const area = d078AreaLabel(selection.areaId);
  const roleLabel = selection.roleId ? d078Node(selection.roleId)?.label ?? selection.roleId : undefined;
  const role = roleLabel?.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
  const stopPoint = role ? `Stop point: ${role}` : area ? `Stop point: ${area}` : "Stop point: Field only";
  const added = selection.addedItemIds.map((id) => d078Node(id)?.label ?? id);
  return {
    routeLabel: "Sociology · Social Sciences & Behavioural Research",
    focusNames: [...choices, ...added].slice(0, 3),
    routeDetails: [
      choices.length ? `Methods and designs: ${choices.join(", ")}` : "No method or design selected yet",
      area ? `Area: ${area}` : "",
      role ? `Role: ${role}` : "",
      added.length ? `Items added: ${added.join(", ")}` : "",
      stopPoint,
    ],
  };
}

export function d078ShareInputForAllRoutesFromSnapshot(snapshot: unknown, programmeId?: string) {
  const routeStacks = d078RouteStacksFromSnapshot(snapshot, programmeId);
  if (!routeStacks) return null;
  const routes = routeStacks.stacks.map((stack, index) => {
    const selection = stack.selection;
    const choices = [
      ...selection.methodIds.map((id) => d078Node(id)?.label ?? id),
      ...selection.combinationIds.map((id) => d078CombinationLabel(id) ?? id),
      ...Object.values(selection.componentMethodIds).flat().map((id) => d078Node(id)?.label ?? id),
    ];
    const area = d078AreaLabel(selection.areaId);
    const roleName = selection.roleId ? d078Node(selection.roleId)?.label ?? selection.roleId : "";
    const role = roleName.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
    const stopPoint = role ? `Stop point: ${role}` : area ? `Stop point: ${area}` : "Stop point: Field only";
    const added = selection.addedItemIds.map((id) => d078Node(id)?.label ?? id);
    const details = [
      choices.length ? `Methods and designs: ${choices.join(", ")}` : "No method or design selected yet",
      area ? `Area: ${area}` : "",
      role ? `Role: ${role}` : "",
      added.length ? `Items added: ${added.join(", ")}` : "",
      stopPoint,
    ].filter(Boolean);
    return { number: index + 1, choices, added, details };
  });
  return {
    routeLabel: `Sociology · Social Sciences & Behavioural Research${routes.length > 1 ? ` · ${routes.length} separate routes` : ""}`,
    focusNames: routes.flatMap((route) => [...route.choices, ...route.added]).slice(0, 3),
    routeDetails: routes.length === 1
      ? routes[0].details
      : routes.flatMap((route) => route.details.map((detail, index) => index === 0 ? `Route ${route.number} — ${detail}` : `Route ${route.number}: ${detail}`)),
  };
}

export function selectSavedSnapshot(path: Record<string, unknown>, snapshotId?: string | null): Record<string, unknown> | null {
  const history = Array.isArray(path.learningPlanSnapshots) ? path.learningPlanSnapshots : [];
  const selected = snapshotId ? history.find((entry) => entry && typeof entry === "object" && (entry as Record<string, unknown>).snapshotId === snapshotId) : undefined;
  if (selected && typeof selected === "object") return selected as Record<string, unknown>;
  // An explicit archive choice must never silently preview/export the current
  // version if that archived id has been removed or is no longer available.
  if (snapshotId) return null;
  const current = path.learningPlanSnapshot;
  return current && typeof current === "object" ? current as Record<string, unknown> : null;
}
