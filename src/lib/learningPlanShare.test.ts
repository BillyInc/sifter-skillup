import { buildLearningPlanShareCopies, buildLearningPlanShareInputFromStacks, buildLearningPlanShareMessage } from "./learningPlanShare";

describe("guided learning-plan share copy", () => {
  const input = {
    referralUrl: "https://levelup.com.ng/r/abc123",
    routeLabel: "Sociology → Social research",
    focusNames: ["Research design", "SPSS", "Research design"],
  };

  it("keeps the canonical share private and includes the configured link", () => {
    const copy = buildLearningPlanShareMessage("generic", input);
    expect(copy.message).toContain("I just got my career mapping from Sifter LevelUp. You should do yours too.");
    expect(copy.message).toContain("Sociology → Social research");
    expect(copy.message).toContain("Research design, SPSS");
    expect(copy.message).toContain("https://levelup.com.ng/r/abc123");
    expect(copy.message).not.toContain("student");
    expect(copy.message).not.toContain("institution");
  });

  it("provides distinct copy for each requested platform", () => {
    const copies = buildLearningPlanShareCopies(input);
    expect(copies.whatsapp.message).not.toEqual(copies.x.message);
    expect(copies.instagram.message).toContain("#SifterLevelUp");
    expect(copies.tiktok.message).toContain("#StudyTok");
    expect(copies.email.title).toContain("try Sifter LevelUp");
  });

  it("uses the public landing page until a referral URL is configured", () => {
    expect(buildLearningPlanShareMessage("x").message).toContain("https://levelup.com.ng");
    expect(buildLearningPlanShareMessage("x", { referralUrl: "http://unsafe.example" }).message).toContain("https://levelup.com.ng");
  });

  it("builds My World share content from saved routes and selected items only", () => {
    const input = buildLearningPlanShareInputFromStacks([
      {
        routeLabel: "Sociology / Social Sciences / Social Research",
        selectedIds: ["skill:research-design"],
        itemSummaries: [
          { id: "skill:research-design", name: "Research design" },
          { id: "tool:unused", name: "Unselected tool" },
        ],
      },
    ], "fallback route");

    expect(input.routeLabel).toBe("Sociology / Social Sciences / Social Research");
    expect(input.focusNames).toEqual(["Research design"]);
    expect(JSON.stringify(input)).not.toContain("Unselected tool");
  });

  it("includes the complete selected D078 route context in share copy", () => {
    const copy = buildLearningPlanShareMessage("generic", {
      routeLabel: "Sociology · Social Sciences & Behavioural Research",
      focusNames: ["Interviews", "Social Research and Evaluation", "Statistician"],
      routeDetails: ["Methods and designs: Interviews, Exploratory Sequential Mixed Methods, Surveys", "Area: Social Research and Evaluation", "Role: Statistician", "Items added: Research question design"],
    });
    expect(copy.message).toContain("Exploratory Sequential Mixed Methods");
    expect(copy.message).toContain("Area: Social Research and Evaluation");
    expect(copy.message).toContain("Role: Statistician");
    expect(copy.message).toContain("Items added: Research question design");
  });
});
