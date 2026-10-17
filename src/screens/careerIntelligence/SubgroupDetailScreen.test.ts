import { areaRoleOptions } from "@/lib/d078RoutePresentation";

describe("areaRoleOptions", () => {
  it("uses reconciled D078 area routes and never falls back to broad role areaIds", () => {
    const selectedRouteRole = { key: "D078|supported", name: "Supported role" };
    const staleBroadRole = { key: "D078|stale", name: "Stale role", areaIds: ["area-1"] };
    const subgroup = { id: "area-1", areaRoleOptions: [selectedRouteRole] };

    expect(areaRoleOptions("D078", subgroup as never, [staleBroadRole] as never).map((role) => role.key))
      .toEqual(["D078|supported"]);
  });

  it("keeps only explicitly available legacy area routes outside D078", () => {
    const subgroup = { id: "area-1" };
    const roles = [
      { key: "D001|available", name: "Available", subgroupId: "area-1", guidanceAvailable: true },
      { key: "D001|unavailable", name: "Unavailable", subgroupId: "area-1", guidanceAvailable: false },
      { key: "D001|other", name: "Other area", subgroupId: "area-2", guidanceAvailable: true },
    ];

    expect(areaRoleOptions("D001", subgroup as never, roles as never).map((role) => role.key))
      .toEqual(["D001|available"]);
  });
});
