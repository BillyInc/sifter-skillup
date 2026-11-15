import { getAdminNavGroups } from "./adminNav";

function learningInterestItem(groups: ReturnType<typeof getAdminNavGroups>) {
  return groups.flatMap((group) => group.items).find((item) => item.key === "learning-interest");
}

describe("learner-interest dashboard navigation", () => {
  it("is available to internal product staff and opens the analytics route", () => {
    const item = learningInterestItem(getAdminNavGroups({ isInternalStaff: true }));
    expect(item).toBeDefined();
    expect(item?.label).toBe("Learner interest");
    const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
    item?.go(router);
    expect(router.push).toHaveBeenCalledWith("/(admin)/analytics");
  });

  it("is available to authorized school owners but not ordinary student accounts", () => {
    expect(learningInterestItem(getAdminNavGroups({ organizationType: "secondary_school", role: "owner" }))).toBeDefined();
    expect(learningInterestItem(getAdminNavGroups({ organizationType: "secondary_school", role: "counsellor" }))).toBeDefined();
    expect(learningInterestItem(getAdminNavGroups({ organizationType: "secondary_school" }))).toBeUndefined();
  });
});
