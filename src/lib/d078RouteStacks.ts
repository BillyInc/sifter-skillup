import type { D078Selection } from "@/lib/d078RouteProjection";

export interface D078RouteStack {
  id: string;
  selection: D078Selection;
}

export interface D078RouteStackState {
  stacks: D078RouteStack[];
  activeStackId: string;
}

export const DEFAULT_D078_STACK_ID = "d078-route-1";

export function normalizeD078RouteStacks(
  value: unknown,
  fallbackSelection: D078Selection,
  requestedActiveId?: string,
): D078RouteStackState {
  const rows = Array.isArray(value) ? value : [];
  const seen = new Set<string>();
  const stacks: D078RouteStack[] = [];
  for (const value of rows) {
    if (!value || typeof value !== "object") continue;
    const row = value as { id?: unknown; selection?: unknown };
    if (typeof row.id !== "string" || !row.id.trim() || seen.has(row.id)) continue;
    if (!row.selection || typeof row.selection !== "object") continue;
    seen.add(row.id);
    stacks.push({ id: row.id, selection: cloneSelection(row.selection as D078Selection) });
  }
  if (!stacks.length) stacks.push({ id: DEFAULT_D078_STACK_ID, selection: cloneSelection(fallbackSelection) });
  const activeStackId = stacks.some((stack) => stack.id === requestedActiveId)
    ? requestedActiveId as string
    : stacks[0].id;
  return { stacks, activeStackId };
}

export function updateD078RouteStackSelection(state: D078RouteStackState, stackId: string, selection: D078Selection): D078RouteStackState {
  if (!state.stacks.some((stack) => stack.id === stackId)) return state;
  return { ...state, stacks: state.stacks.map((stack) => stack.id === stackId ? { ...stack, selection: cloneSelection(selection) } : stack) };
}

export function createD078SeparateRoute(state: D078RouteStackState, nextId: string): D078RouteStackState {
  const active = state.stacks.find((stack) => stack.id === state.activeStackId);
  if (!active || !nextId.trim() || state.stacks.some((stack) => stack.id === nextId)) return state;
  return { stacks: [...state.stacks, { id: nextId, selection: cloneSelection(active.selection) }], activeStackId: nextId };
}

export function selectD078RouteStack(state: D078RouteStackState, stackId: string): D078RouteStackState {
  return state.stacks.some((stack) => stack.id === stackId) ? { ...state, activeStackId: stackId } : state;
}

export function removeD078RouteStack(state: D078RouteStackState, stackId: string): D078RouteStackState {
  if (state.stacks.length <= 1 || !state.stacks.some((stack) => stack.id === stackId)) return state;
  const stacks = state.stacks.filter((stack) => stack.id !== stackId);
  return { stacks, activeStackId: state.activeStackId === stackId ? stacks[0].id : state.activeStackId };
}

export function parseD078RouteStacks(value?: string | string[], fallback?: D078Selection, activeId?: string | string[]): D078RouteStackState | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const active = Array.isArray(activeId) ? activeId[0] : activeId;
  if (!raw) return fallback ? normalizeD078RouteStacks([], fallback, active) : undefined;
  try {
    const parsed = JSON.parse(raw) as { stacks?: unknown; activeStackId?: unknown };
    return normalizeD078RouteStacks(parsed.stacks, fallback ?? INITIAL_EMPTY_SELECTION, active ?? (typeof parsed.activeStackId === "string" ? parsed.activeStackId : undefined));
  } catch {
    return fallback ? normalizeD078RouteStacks([], fallback, active) : undefined;
  }
}

export function serializeD078RouteStacks(state: D078RouteStackState): string {
  return JSON.stringify({ stacks: state.stacks.map(({ id, selection }) => ({ id, selection })), activeStackId: state.activeStackId });
}

export function nextD078RouteId(state: D078RouteStackState): string {
  const used = new Set(state.stacks.map((stack) => stack.id));
  let suffix = 1;
  while (used.has(`d078-route-${suffix}`)) suffix += 1;
  return `d078-route-${suffix}`;
}

function cloneSelection(selection: D078Selection): D078Selection {
  return {
    methodIds: [...(selection.methodIds ?? [])],
    combinationIds: [...(selection.combinationIds ?? [])],
    componentMethodIds: Object.fromEntries(Object.entries(selection.componentMethodIds ?? {}).map(([id, ids]) => [id, [...ids]])),
    areaId: selection.areaId,
    roleId: selection.roleId,
    addedItemIds: [...(selection.addedItemIds ?? [])],
  };
}

const INITIAL_EMPTY_SELECTION: D078Selection = { methodIds: [], combinationIds: [], componentMethodIds: {}, addedItemIds: [] };
