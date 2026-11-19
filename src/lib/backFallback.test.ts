import { domainIdFromRoleKey, parentRouteFor } from "./backFallback";

describe("parentRouteFor (Back on a cold entry)", () => {
  it("sends a programme to Explore", () => {
    expect(parentRouteFor("/explore/programme/123")).toBe("/explore");
    expect(parentRouteFor("/(tabs)/explore/programme/123")).toBe("/explore");
  });

  it("sends a role to the domain embedded in its key, else the domain list", () => {
    expect(parentRouteFor("/explore/role/D039%7Cnursing")).toBe("/explore/domain/D039");
    expect(parentRouteFor("/explore/role/nursing")).toBe("/explore/domains");
    expect(parentRouteFor("/explore/role/nursing", { domainId: "D012" })).toBe("/explore/domain/D012");
  });

  it("sends an area to its domain and a domain to the domain list", () => {
    expect(parentRouteFor("/explore/domain/D039/subgroup/S1")).toBe("/explore/domain/D039");
    expect(parentRouteFor("/explore/subgroup/S1", { domainId: "D039" })).toBe("/explore/domain/D039");
    expect(parentRouteFor("/explore/subgroup/S1")).toBe("/explore/domains");
    expect(parentRouteFor("/explore/domain/D039")).toBe("/explore/domains");
  });

  it("keeps an admin stack prefix", () => {
    expect(parentRouteFor("/admin/explore/programme/9")).toBe("/admin/explore");
    expect(parentRouteFor("/(admin)/workspace-explore/role/D001%7Cx")).toBe("/workspace-explore/domain/D001");
  });

  it("handles opportunities, admission and unknown routes", () => {
    expect(parentRouteFor("/opportunities/opportunity/5")).toBe("/opportunities");
    expect(parentRouteFor("/opportunities/scholarships")).toBe("/opportunities");
    expect(parentRouteFor("/explore/admission/MEDICINE")).toBe("/explore");
    expect(parentRouteFor("/profile/settings")).toBe("/profile");
    expect(parentRouteFor("/whatever")).toBe("/home");
  });

  it("reads a domain id from a role key only when present", () => {
    expect(domainIdFromRoleKey("D078|sociologist")).toBe("D078");
    expect(domainIdFromRoleKey("sociologist")).toBeNull();
  });
});
