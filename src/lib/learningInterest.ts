import { API } from "@/lib/api";
import { flushQueue, pendingWrites, queueWrite } from "@/lib/careerCache";

const pendingByScope = new Map<string, Promise<void>>();
const LEARNING_INTEREST_ENDPOINT = "/api/analytics/learning-interest/event";

function isTransientTransportFailure(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return [
    "failed to fetch",
    "network request failed",
    "networkerror",
    "load failed",
    "request took too long",
  ].some((needle) => normalized.includes(needle));
}

export type LearningInterestType =
  | "programme" | "institution" | "domain" | "area" | "role" | "method" | "research_design"
  | "skill" | "competency" | "knowledge" | "method_item" | "tool"
  | "certification" | "other_learning_item";
export type LearningInterestAction = "selection_added" | "selection_removed" | "selection_copied";

export interface LearningInterestContext {
  learner_stage?: string;
  programme_id?: string;
  institution_id?: string;
  domain_id?: string;
  area_id?: string;
  role_id?: string;
  route_label?: string;
  selection_scope_id?: string;
  method_ids?: string[];
  design_ids?: string[];
}

export interface LearningInterestRouteItem {
  name: string;
  itemType: string;
  itemKey: string;
  domainId?: string;
  contextLevel?: string;
  contextKey?: string;
  routeKeys?: string[];
}

/** Build removal events for every route-scope membership being discarded. */
export function routeItemRemovalEvents(
  entries: LearningInterestRouteItem[],
  removedRouteKeys: string[],
  contextForRoute: (routeKey: string) => LearningInterestContext,
) {
  const removed = new Set(removedRouteKeys);
  return entries.flatMap((entry) => [...new Set(entry.routeKeys?.length ? entry.routeKeys : removedRouteKeys)]
    .filter((routeKey) => removed.has(routeKey))
    .map((routeKey) => {
      const routeContext = contextForRoute(routeKey);
      return {
        action: "selection_removed" as const,
        entity_type: learningInterestTypeForItem(entry.itemType),
        entity_id: entry.itemKey,
        entity_label: entry.name,
        context: {
          ...routeContext,
          domain_id: entry.domainId || routeContext.domain_id,
          area_id: entry.contextLevel === "subgroup" ? entry.contextKey : routeContext.area_id,
          role_id: entry.contextLevel === "role" ? entry.contextKey : routeContext.role_id,
          selection_scope_id: routeKey,
        },
      };
    }));
}

export function learningInterestTypeForItem(itemType?: string): LearningInterestType {
  const kind = (itemType ?? "").toLowerCase();
  if (kind.includes("tool") || ["programming_language", "python_library", "computational_environment"].includes(kind)) return "tool";
  if (kind.includes("skill")) return "skill";
  if (kind.includes("competenc")) return "competency";
  if (kind.includes("knowledge")) return "knowledge";
  if (kind.includes("method")) return "method_item";
  if (kind.includes("certification")) return "certification";
  return "other_learning_item";
}

/** Best-effort telemetry: selection and saving must never wait on analytics. */
export function recordLearningInterest(
  action: LearningInterestAction,
  entity_type: LearningInterestType,
  entity_id: string,
  entity_label: string,
  context: LearningInterestContext = {},
): void {
  if (!entity_id || !entity_label) return;
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  const selection_scope_id = context.selection_scope_id ?? [
    context.learner_stage, context.programme_id, context.institution_id,
    context.domain_id, context.area_id, context.role_id,
  ].map((part) => part ?? "*").join("/");
  const payload = {
    event_id: uuid,
    action,
    entity_type,
    entity_id,
    entity_label: entity_label.slice(0, 180),
    selection_scope_id,
    ...context,
  };
  // Preserve the learner's add/remove order within a route. The calls remain
  // fire-and-forget from the UI, but concurrent requests could otherwise reach
  // the snapshot trigger out of order and leave a removed choice active.
  const previous = pendingByScope.get(selection_scope_id) ?? Promise.resolve();
  const pending = previous
    .catch(() => undefined)
    .then(async () => {
      try {
        // If another offline mutation is already queued, queue this event too.
        // That keeps replay order stable instead of letting a later removal
        // reach the server ahead of an earlier queued addition.
        if (await pendingWrites()) {
          await queueWrite({ endpoint: LEARNING_INTEREST_ENDPOINT, method: "POST", body: payload });
          void flushQueue().catch(() => undefined);
          return;
        }
        await API.trackLearningInterest(payload);
      } catch (error) {
        // Do not hide permanent API errors in the offline queue. The backend
        // still revalidates analytics consent when a queued event is replayed.
        if (!isTransientTransportFailure(error)) return;
        try {
          await queueWrite({ endpoint: LEARNING_INTEREST_ENDPOINT, method: "POST", body: payload });
          void flushQueue().catch(() => undefined);
        } catch {
          // Keep selection interaction independent of telemetry/storage health.
        }
      }
    })
    .then(() => undefined)
    .catch(() => undefined);
  pendingByScope.set(selection_scope_id, pending);
  void pending.finally(() => {
    if (pendingByScope.get(selection_scope_id) === pending) pendingByScope.delete(selection_scope_id);
  });
}
