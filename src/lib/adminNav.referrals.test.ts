import { getAdminNavGroups } from "./adminNav";
import type { OrgRole, OrganizationType } from "../types/institution";

function referralItem(groups: ReturnType<typeof getAdminNavGroups>) {
  return groups.flatMap((g) => g.items).find((i) => i.key === "affiliation");
}

const ORG_TYPES: OrganizationType[] = ["secondary_school", "tutorial_centre", "jamb_cafe", "university"];
const ROLES: OrgRole[] = ["owner", "admin", "institution_admin", "counsellor", "data_viewer"] as OrgRole[];

describe("referrals navigation", () => {
  it.each(ORG_TYPES)("is shown to %s admins of every role", (organizationType) => {
    for (const role of ROLES) {
      const item = referralItem(getAdminNavGroups({ organizationType, role }));
      expect(item?.label).toBe("Referrals");
    }
  });

  it("opens the existing aggregate school-code route", () => {
    const item = referralItem(getAdminNavGroups({ organizationType: "tutorial_centre", role: "owner" }));
    const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
    item?.go(router);
    expect(router.push).toHaveBeenCalledWith("/(admin)/affiliation");
  });
});
