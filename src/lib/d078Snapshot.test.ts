import {
  d078ProgrammeIdFromSnapshot,
  d078RouteStacksFromSnapshot,
  d078SavedRouteHref,
  d078SelectionFromSnapshot,
  d078ShareInputForAllRoutesFromSnapshot,
  d078ShareInputFromSnapshot,
  isD078Snapshot,
  selectSavedSnapshot,
} from "./d078Snapshot";
import { d078GraphDataForTests, projectD078Route, type D078Selection } from "./d078RouteProjection";

const PROGRAMME_ID = "programme:social-sciences:sociology";
const ROUTE_KEY = `${PROGRAMME_ID}::D078`;
const PARTICIPATORY = "combo:participatory-method-choice";
const INTERVIEWS = "domain-item:d078-interviews";

function validFullSelection(): D078Selection {
  const selection: D078Selection = {
    methodIds: ["domain-item:d078-spatial-social-analysis"],
    combinationIds: [PARTICIPATORY],
    componentMethodIds: { [PARTICIPATORY]: [INTERVIEWS] },
    addedItemIds: [],
  };
  const projection = projectD078Route(selection);
  const role = projection.visibleRoles[0];
  if (!role) throw new Error("Expected a role supported by the selected D078 methods.");
  const area = projection.visibleAreas.find((entry) => entry.areaId === role.areaId);
  if (!area) throw new Error("Expected the selected role's supporting area.");
  const data = d078GraphDataForTests();
  const foundationIds = new Set(data.foundation_item_ids);
  const routes = [
    ...data.method_area_routes.filter((route) => route.method_id === selection.methodIds[0] && route.area_id === area.areaId),
    ...data.method_area_routes.filter((route) => route.method_id === "domain-item:participatory-and-action-research" && route.area_id === area.areaId),
    ...data.method_area_routes.filter((route) => route.method_id === INTERVIEWS && route.area_id === area.areaId),
  ];
  const routeItems = routes.flatMap((route) => [
    ...route.area_item_ids,
    ...route.task_linked_domain_item_ids,
    ...route.available_item_ids,
    ...route.domain_downstream_item_ids,
    ...route.tool_ids,
    ...route.domain_tool_ids,
  ]);
  const roleRouteItems = data.method_area_role_routes
    .filter((route) => route.area_id === area.areaId && route.role_id === role.roleId)
    .flatMap((route) => route.role_item_ids);
  const addedItem = [...routeItems, ...roleRouteItems].find((id) => !foundationIds.has(id) && Boolean(data.nodes_by_id[id]));
  if (!addedItem) throw new Error("Expected a non-foundation item supported by the selected route.");
  return { ...selection, areaId: area.areaId, roleId: role.roleId, addedItemIds: [addedItem] };
}

const saved = (snapshotId: string, selection: D078Selection) => ({
  snapshotId,
  stacks: [],
  dataVersion: "guided-experience-d078-v1",
  d078SelectionsByRoute: { [ROUTE_KEY]: selection },
});

test("round-trips a valid full saved D078 selection through archive reopen", () => {
  const selection = validFullSelection();
  const older = saved("d078-older", { ...selection, roleId: undefined });
  const latest = saved("d078-latest", selection);
  const path = { learningPlanSnapshots: [older, latest], learningPlanSnapshot: latest };

  expect(isD078Snapshot(latest)).toBe(true);
  const reopened = selectSavedSnapshot(path, "d078-older");
  expect(reopened?.snapshotId).toBe("d078-older");
  expect(d078SelectionFromSnapshot(reopened, PROGRAMME_ID)).toEqual({ ...selection, roleId: undefined });
  expect(d078SelectionFromSnapshot(selectSavedSnapshot(path, "d078-latest"), PROGRAMME_ID)).toEqual(selection);
  expect(selection.addedItemIds).not.toEqual(expect.arrayContaining(d078GraphDataForTests().foundation_item_ids));
});

test("builds a D078 My World resume URL at the saved domain, area, or role stop point", () => {
  const roleSelection = validFullSelection();
  const makeSnapshot = (selection: D078Selection) => ({
    snapshotId: "saved-d078-version",
    dataVersion: "guided-experience-d078-v1",
    d078SelectionsByRoute: { [ROUTE_KEY]: selection },
    d078RouteStackIds: ["d078-route-1"],
    d078ActiveStackId: "d078-route-1",
  });
  const options = {
    snapshotProgrammeId: PROGRAMME_ID,
    programmeId: "university-programme-uuid",
    jambProgrammeId: "jamb-sociology",
    schoolId: "unilag",
    snapshotId: "saved-d078-version",
  };
  const roleHref = d078SavedRouteHref(makeSnapshot(roleSelection), options);
  expect(roleHref).not.toBeNull();
  const roleUrl = new URL(roleHref!, "https://levelup.example");
  expect(roleUrl.pathname).toMatch(/^\/\(tabs\)\/explore\/role\/D078%7C/);
  expect(roleUrl.searchParams.get("area_id")).toBe(roleSelection.areaId);
  expect(roleUrl.searchParams.get("d078_role_id")).toBe(roleSelection.roleId);
  expect(roleUrl.searchParams.get("snapshot_id")).toBe("saved-d078-version");
  expect(JSON.parse(roleUrl.searchParams.get("d078_selection") ?? "{}")).toEqual(roleSelection);
  expect(JSON.parse(roleUrl.searchParams.get("d078_route_stacks") ?? "{}").activeStackId).toBe("d078-route-1");

  const areaSelection = { ...roleSelection, roleId: undefined };
  const areaUrl = new URL(d078SavedRouteHref(makeSnapshot(areaSelection), options)!, "https://levelup.example");
  expect(areaUrl.pathname).toContain("/domain/D078/subgroup/");
  expect(areaUrl.searchParams.get("d078_from_field")).toBe("1");

  const domainSelection = { ...areaSelection, areaId: undefined };
  const domainUrl = new URL(d078SavedRouteHref(makeSnapshot(domainSelection), options)!, "https://levelup.example");
  expect(domainUrl.pathname).toBe("/(tabs)/explore/domain/D078");
  expect(domainUrl.searchParams.get("programme_id")).toBe("university-programme-uuid");
  expect(domainUrl.searchParams.get("jamb_programme_id")).toBe("jamb-sociology");
  expect(domainUrl.searchParams.get("school_id")).toBe("unilag");
});

test("does not replace a missing explicit archive selection with the current snapshot", () => {
  const current = saved("current-version", { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] });
  const path = { learningPlanSnapshot: current, learningPlanSnapshots: [current] };
  expect(selectSavedSnapshot(path, "deleted-version")).toBeNull();
  expect(selectSavedSnapshot(path)).toBe(current);
});

test("drops invalid method, fixed-combination component, unsupported area/role, and added items", () => {
  const invalidBase = {
    methodIds: ["domain-item:d078-interviews", "method:removed"],
    combinationIds: [],
    componentMethodIds: {},
    addedItemIds: [],
  };
  const allAreaIds = Object.values(d078GraphDataForTests().nodes_by_id)
    .filter((node) => node.kind === "area_of_specialization")
    .map((node) => node.area_id)
    .filter((id): id is string => typeof id === "string");
  const unsupportedAreaId = allAreaIds.find((id) => !projectD078Route(invalidBase).visibleAreas.some((area) => area.areaId === id));
  expect(unsupportedAreaId).toBeTruthy();
  const invalid = {
    ...invalidBase,
    areaId: unsupportedAreaId,
    roleId: "role:D078:18:statistician",
    addedItemIds: ["domain-item:d078-python", "domain-item:d078-research-question-design", "removed:item"],
  };
  const selection = d078SelectionFromSnapshot({
    dataVersion: "guided-experience-d078-v1",
    d078SelectionsByRoute: { [ROUTE_KEY]: invalid },
  }, PROGRAMME_ID) as D078Selection;

  expect(selection.methodIds).toEqual(["domain-item:d078-interviews"]);
  expect(selection.combinationIds).toEqual([]);
  expect(selection.componentMethodIds).toEqual({});
  expect(selection.areaId).toBeUndefined();
  expect(selection.roleId).toBeUndefined();
  expect(selection.addedItemIds).toEqual([]);

  const invalidFixedComponent = d078SelectionFromSnapshot({
    dataVersion: "guided-experience-d078-v1",
    d078SelectionsByRoute: { [ROUTE_KEY]: {
      methodIds: [],
      combinationIds: ["combo:exploratory-sequential"],
      componentMethodIds: { "combo:exploratory-sequential": [INTERVIEWS] },
      addedItemIds: [],
    } },
  }, PROGRAMME_ID) as D078Selection;
  expect(invalidFixedComponent.combinationIds).toEqual(["combo:exploratory-sequential"]);
  expect(invalidFixedComponent.componentMethodIds).toEqual({});
});

test("retains field-only and area stop points without inventing a role", () => {
  const fieldOnly: D078Selection = { methodIds: [], combinationIds: [], componentMethodIds: {}, addedItemIds: [] };
  const route = validFullSelection();
  const areaStop = { ...route, roleId: undefined };
  for (const [id, selection] of [["field", fieldOnly], ["area", areaStop]] as const) {
    const reopened = d078SelectionFromSnapshot(saved(id, selection), PROGRAMME_ID);
    expect(reopened).toEqual(selection);
  }
});

test("My World share input uses the validated snapshot selection", () => {
  const selection: D078Selection = { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] };
  const areaIds = Object.values(d078GraphDataForTests().nodes_by_id)
    .filter((node) => node.kind === "area_of_specialization")
    .map((node) => node.area_id)
    .filter((id): id is string => typeof id === "string");
  const invalidArea = areaIds.find((id) => !projectD078Route(selection).visibleAreas.some((area) => area.areaId === id));
  expect(invalidArea).toBeTruthy();
  const snapshot = saved("share", {
    ...selection,
    areaId: invalidArea,
    roleId: "role:D078:18:statistician",
    addedItemIds: ["domain-item:d078-python"],
  });
  const share = d078ShareInputFromSnapshot(snapshot, PROGRAMME_ID);
  expect(share?.routeLabel).toContain("Sociology");
  expect(share?.routeDetails.join(" ")).not.toContain("Computational and Digital Social Science");
  expect(share?.routeDetails.join(" ")).not.toContain("statistician");
  expect(share?.routeDetails.join(" ")).not.toContain("Python");
});

test("selects the programme route saved with an archive version and fails closed when ambiguous", () => {
  const snapshot = {
    dataVersion: "guided-experience-d078-v1",
    reportPathContext: { programme: { name: "Sociology", jambProgrammeId: "programme-2" } },
    d078SelectionsByRoute: {
      "programme-1::D078": { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] },
      "programme-2::D078": { methodIds: ["domain-item:d078-spatial-social-analysis"], combinationIds: [], componentMethodIds: {}, addedItemIds: [] },
    },
  };

  const programmeId = d078ProgrammeIdFromSnapshot(snapshot);
  expect(programmeId).toBe("programme-2");
  expect(d078SelectionFromSnapshot(snapshot, programmeId)?.methodIds).toEqual(["domain-item:d078-spatial-social-analysis"]);
  expect(d078SelectionFromSnapshot(snapshot, "programme-1")?.methodIds).toEqual([INTERVIEWS]);
  expect(d078SelectionFromSnapshot(snapshot)).toBeNull();
});

test("restores multiple D078 routes independently and selects the recorded active stack", () => {
  const first = { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] };
  const second = { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, areaId: "D078:sociology-social-anthropology", addedItemIds: [] };
  const third = { methodIds: ["domain-item:d078-spatial-social-analysis"], combinationIds: [], componentMethodIds: {}, areaId: "D078:computational-digital-social-science", addedItemIds: [] };
  const snapshot = {
    dataVersion: "guided-experience-d078-v1",
    d078RouteStackIds: ["d078-route-1", "d078-route-2", "d078-route-3"],
    d078ActiveStackId: "d078-route-3",
    d078SelectionsByRoute: {
      [ROUTE_KEY]: first,
      [`${ROUTE_KEY}::d078-route-2`]: second,
      [`${ROUTE_KEY}::d078-route-3`]: third,
    },
  };
  const state = d078RouteStacksFromSnapshot(snapshot, PROGRAMME_ID);
  expect(state?.stacks.map((stack) => stack.id)).toEqual(["d078-route-1", "d078-route-2", "d078-route-3"]);
  expect(state?.activeStackId).toBe("d078-route-3");
  expect(state?.stacks[0].selection.methodIds).toEqual([INTERVIEWS]);
  expect(state?.stacks[0].selection.areaId).toBeUndefined();
  expect(state?.stacks[1].selection.methodIds).toEqual(second.methodIds);
  expect(state?.stacks[1].selection.areaId).toBe("D078:sociology-social-anthropology");
  expect(state?.stacks[2].selection.areaId).toBe("D078:computational-digital-social-science");
  expect(d078SelectionFromSnapshot(snapshot, PROGRAMME_ID)?.methodIds).toEqual(third.methodIds);
  expect(d078SelectionFromSnapshot(snapshot, PROGRAMME_ID, "d078-route-1")?.methodIds).toEqual([INTERVIEWS]);
});

test("share summary preserves each saved D078 route as a separate branch", () => {
  const snapshot = {
    dataVersion: "guided-experience-d078-v1",
    d078RouteStackIds: ["d078-route-1", "d078-route-2", "d078-route-3"],
    d078ActiveStackId: "d078-route-3",
    d078SelectionsByRoute: {
      [ROUTE_KEY]: { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] },
      [`${ROUTE_KEY}::d078-route-2`]: { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, areaId: "D078:sociology-social-anthropology", roleId: "role:D078:3:sociologist", addedItemIds: ["area_enrichment_item:d078-soc-thematic-analysis"] },
      [`${ROUTE_KEY}::d078-route-3`]: { methodIds: ["domain-item:d078-spatial-social-analysis"], combinationIds: [], componentMethodIds: {}, areaId: "D078:computational-digital-social-science", addedItemIds: ["domain-item:d078-python"] },
    },
  };
  const share = d078ShareInputForAllRoutesFromSnapshot(snapshot, PROGRAMME_ID);
  expect(share?.routeLabel).toContain("3 separate routes");
  expect(share?.routeDetails.join(" ")).toContain("Route 1");
  expect(share?.routeDetails.join(" ")).toContain("Route 2");
  expect(share?.routeDetails.join(" ")).toContain("Route 3");
  expect(share?.routeDetails.join(" ")).toContain("Methods and designs: Interviews");
  expect(share?.routeDetails.join(" ")).toContain("Role: Sociologist");
  expect(share?.routeDetails.join(" ")).toContain("Items added: Thematic/framework analysis with an auditable codebook");
  expect(share?.routeDetails.join(" ")).toContain("Items added: Python");
  expect(share?.routeDetails.join(" ")).toContain("Route 1: Stop point: Field only");
  expect(share?.routeDetails.join(" ")).toContain("Route 2: Stop point: Sociologist");
  expect(share?.routeDetails.join(" ")).toContain("Route 3: Stop point: Computational and Digital Social Science");
  expect(share?.routeDetails.join(" ")).not.toContain("Route 1: Area:");
  expect(share?.routeDetails.join(" ")).toContain("Sociology and Social Anthropology");
  expect(share?.routeDetails.join(" ")).toContain("Computational and Digital Social Science");
});
