import {
  createD078SeparateRoute,
  normalizeD078RouteStacks,
  removeD078RouteStack,
  selectD078RouteStack,
  updateD078RouteStackSelection,
  type D078RouteStackState,
} from "./d078RouteStacks";
import type { D078Selection } from "./d078RouteProjection";

const field: D078Selection = { methodIds: ["interviews"], combinationIds: [], componentMethodIds: {}, addedItemIds: [] };
const area: D078Selection = { ...field, areaId: "area-1", addedItemIds: ["item-a"] };

test("separate route is an independent deep copy and can be edited independently", () => {
  const initial = normalizeD078RouteStacks([], area);
  const forked = createD078SeparateRoute(initial, "d078-route-2");
  const changed = updateD078RouteStackSelection(forked, "d078-route-2", { ...field, methodIds: ["survey"] });
  expect(changed.stacks[0].selection).toEqual(area);
  expect(changed.stacks[1].selection.methodIds).toEqual(["survey"]);
  expect(changed.stacks[0].selection.addedItemIds).not.toBe(changed.stacks[1].selection.addedItemIds);
});

test("route switching and deletion preserve a non-empty stack set", () => {
  const two = createD078SeparateRoute(normalizeD078RouteStacks([], field), "d078-route-2");
  const activeSecond = selectD078RouteStack(two, "d078-route-2");
  const removed = removeD078RouteStack(activeSecond, "d078-route-2");
  expect(removed.stacks).toHaveLength(1);
  expect(removed.activeStackId).toBe(removed.stacks[0].id);
  expect(removeD078RouteStack(removed, removed.activeStackId)).toEqual(removed);
});

test("normalization drops malformed and duplicate IDs and chooses a valid active route", () => {
  const state = normalizeD078RouteStacks([
    { id: "one", selection: field },
    { id: "one", selection: area },
    { id: "bad", selection: null },
  ], area, "missing");
  expect(state.stacks).toHaveLength(1);
  expect(state.stacks[0].selection).toEqual(field);
  expect(state.activeStackId).toBe("one");
});

test("unknown updates do not mutate saved routes", () => {
  const state: D078RouteStackState = normalizeD078RouteStacks([], field);
  expect(updateD078RouteStackSelection(state, "missing", area)).toBe(state);
});
