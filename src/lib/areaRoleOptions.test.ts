import { rolesForArea } from "./areaRoleOptions";
import type { DomainRoleSummary, DomainV2 } from "@/types/career";

describe("rolesForArea", () => {
  it("uses reviewed canonical D078 area routes instead of legacy role areaIds", () => {
    const areaRole = { key: "D078|reviewed", name: "Reviewed route", areaRouteStatus: "reviewed_supported" as const };
    const subgroup = { id: "A01", areaRoleOptions: [areaRole] };
    const legacyOnly = { key: "D078|legacy", name: "Legacy-only role", areaIds: ["A01"] };

    expect(rolesForArea("D078", subgroup as never, [legacyOnly] as never).map((role) => role.key))
      .toEqual(["D078|reviewed"]);
  });

  it("uses explicitly available subgroup ownership for other domains", () => {
    const subgroup = { id: "area-1" };
    const roles: DomainRoleSummary[] = [
      { key: "D001|available", name: "Available", subgroupId: "area-1", guidanceAvailable: true },
      { key: "D001|unavailable", name: "Unavailable", subgroupId: "area-1", guidanceAvailable: false },
      { key: "D001|elsewhere", name: "Elsewhere", subgroupId: "area-2", guidanceAvailable: true },
    ];

    expect(rolesForArea("D001", subgroup as DomainV2["subgroups"][number], roles).map((role) => role.key))
      .toEqual(["D001|available"]);
  });
});
