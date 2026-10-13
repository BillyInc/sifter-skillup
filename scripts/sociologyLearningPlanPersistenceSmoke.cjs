/*
 * Pure persistence/reopen smoke for the D078 guided learning path.
 *
 * This does not claim live Supabase or browser coverage. It verifies that the
 * route model and saved report snapshot preserve independent route stacks,
 * route-local removals, learner ordering, and prerequisite-safe sequencing.
 */
const assert = require("node:assert/strict");
const tsNode = require("ts-node");

tsNode.register({
  transpileOnly: true,
  compilerOptions: {
    module: "NodeNext",
    moduleResolution: "NodeNext",
    customConditions: [],
  },
});

const {
  buildLearningPlanStackSet,
  createLearningPlanReportSnapshot,
  learningPlanRouteKey,
} = require("../src/lib/guidedLearningPlan.ts");

const programme = {
  id: "programme:sociology",
  name: "Sociology",
  layer: "programme",
  category: "shared_foundation",
  visibility: "fixed",
  claimReviewState: "approved",
  linkState: "linked",
  guidanceOwner: "programme",
  linkUrl: "https://example.test/programme/sociology",
};

const domainFoundation = {
  id: "domain:D078:research-foundation",
  name: "Research foundations",
  layer: "domain",
  category: "shared_foundation",
  visibility: "selectable",
  claimReviewState: "approved",
  linkState: "linked",
  guidanceOwner: "domain",
  linkUrl: "https://example.test/domain/research-foundation",
  routeScope: { programmeIds: ["programme:sociology"], domainIds: ["D078"] },
};

const areaQuantitative = {
  id: "area:D078:quantitative",
  name: "Quantitative social research",
  layer: "area",
  category: "area_addition",
  visibility: "selectable",
  claimReviewState: "approved",
  linkState: "linked",
  guidanceOwner: "area",
  linkUrl: "https://example.test/area/quantitative",
  routeScope: { programmeIds: ["programme:sociology"], domainIds: ["D078"], areaIds: ["quantitative"] },
  prerequisiteIds: ["domain:D078:research-foundation"],
};

const roleAnalysis = {
  id: "role:D078:research-analyst",
  name: "Social research analyst",
  layer: "role",
  category: "role_addition",
  visibility: "selectable",
  claimReviewState: "approved",
  linkState: "linked",
  guidanceOwner: "role",
  linkUrl: "https://example.test/role/research-analyst",
  routeScope: {
    programmeIds: ["programme:sociology"],
    domainIds: ["D078"],
    areaIds: ["quantitative"],
    roleIds: ["research-analyst"],
  },
  prerequisiteIds: ["area:D078:quantitative"],
};

const routeA = {
  programmeId: "programme:sociology",
  domainId: "D078",
  areaId: "quantitative",
  roleId: "research-analyst",
};
const routeB = {
  programmeId: "programme:sociology",
  domainId: "D078",
  areaId: "quantitative",
};
const keyA = learningPlanRouteKey(routeA);
const keyB = learningPlanRouteKey(routeB);

const selections = [
  {
    route: routeA,
    selectedIds: [domainFoundation.id, areaQuantitative.id, roleAnalysis.id],
    removedIds: ["area:D078:old-item"],
    order: [roleAnalysis.id, areaQuantitative.id, domainFoundation.id],
  },
  {
    route: routeB,
    selectedIds: [domainFoundation.id, areaQuantitative.id],
    removedIds: [],
    order: [areaQuantitative.id, domainFoundation.id],
  },
];

const input = {
  routes: selections,
  programmeItems: [programme],
  domainItems: [domainFoundation],
  areaItems: [areaQuantitative],
  roleItems: [roleAnalysis],
};

const first = buildLearningPlanStackSet(input);
assert.equal(first.stacks.length, 2);
// Programme context is fixed context, not a granular selected item.
assert.deepEqual(first.stacks[0].selectedIds, [domainFoundation.id, areaQuantitative.id, roleAnalysis.id]);
assert.deepEqual(first.stacks[1].selectedIds, [domainFoundation.id, areaQuantitative.id]);
assert.equal(first.warnings.some((warning) => warning.code === "multiple_routes"), true);

const snapshot = createLearningPlanReportSnapshot({
  snapshotId: "d078-persistence-smoke",
  selections,
  ordersByRoute: {
    [keyA]: selections[0].order,
    [keyB]: selections[1].order,
  },
  items: [programme, domainFoundation, areaQuantitative, roleAnalysis],
  dataVersion: "guided-experience-d078-v1",
  now: "2026-10-10T12:00:00.000Z",
});

assert.deepEqual(snapshot.stacks[0].order, [domainFoundation.id, areaQuantitative.id, roleAnalysis.id]);
assert.deepEqual(snapshot.stacks[1].order, [domainFoundation.id, areaQuantitative.id]);
assert.deepEqual(snapshot.stacks[0].removedIds, ["area:D078:old-item"]);
assert.equal(snapshot.stacks[0].route.roleId, "research-analyst");
assert.equal(snapshot.stacks[1].route.roleId, undefined);

// Reopen by rebuilding from the persisted route selections and orders.
const reopened = buildLearningPlanStackSet({
  ...input,
  routes: snapshot.stacks.map((stack) => ({
    route: stack.route,
    selectedIds: stack.selectedIds,
    removedIds: stack.removedIds,
    order: stack.order,
  })),
});
assert.deepEqual(reopened.stacks.map((stack) => stack.selectedIds), first.stacks.map((stack) => stack.selectedIds));
assert.deepEqual(reopened.stacks.map((stack) => stack.route), [routeA, routeB]);

console.log("Sociology learning-plan persistence smoke passed: two independent stacks, local removals, saved order, prerequisite-safe snapshot and reopen.");
