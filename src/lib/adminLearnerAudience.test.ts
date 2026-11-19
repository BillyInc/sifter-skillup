import {
  adminLearnerAudienceForOrg,
  isAdminLearnerTypeAllowed,
  learnerStageLabel,
} from "./adminLearnerAudience";

describe("tutorial-centre starting points", () => {
  it.each(["tutorial_centre", "jamb_cafe"])("%s offers O-level and UTME", (org) => {
    expect(adminLearnerAudienceForOrg(org)?.learnerTypes).toEqual(["ss3", "jamb"]);
    expect(isAdminLearnerTypeAllowed(org, "ss3")).toBe(true);
    expect(isAdminLearnerTypeAllowed(org, "jamb")).toBe(true);
    expect(isAdminLearnerTypeAllowed(org, "ss1")).toBe(false);
    expect(isAdminLearnerTypeAllowed(org, "undergraduate")).toBe(false);
  });

  it("does not widen secondary schools or universities", () => {
    expect(adminLearnerAudienceForOrg("secondary_school")?.learnerTypes).toEqual(["ss1", "ss2", "ss3"]);
    expect(adminLearnerAudienceForOrg("university")?.learnerTypes).toEqual(["undergraduate"]);
  });

  it("labels stages in each organisation's vocabulary", () => {
    expect(learnerStageLabel("ss3", "tutorial_centre")).toBe("O-level");
    expect(learnerStageLabel("jamb", "jamb_cafe")).toBe("UTME (JAMB)");
    expect(learnerStageLabel("ss3", "secondary_school")).toBe("SS3");
    expect(learnerStageLabel("undergraduate", "university")).toBe("Undergraduate");
  });
});
