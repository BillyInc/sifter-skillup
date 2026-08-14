import {
  isLegacyLearningPath,
  withMyWorldLearningGate,
} from "../src/lib/learningGate";

describe("learning route gate", () => {
  it("recognises legacy learning routes with or without the tabs group", () => {
    expect(isLegacyLearningPath("/fields")).toBe(true);
    expect(isLegacyLearningPath("/(tabs)/skills/quant-map")).toBe(true);
    expect(isLegacyLearningPath("/profile/diary")).toBe(true);
    expect(isLegacyLearningPath("/explore")).toBe(false);
    expect(isLegacyLearningPath("/myworld")).toBe(false);
  });

  it("marks learning links opened from My World", () => {
    expect(withMyWorldLearningGate("/(tabs)/map")).toBe("/(tabs)/map?from=myworld");
    expect(withMyWorldLearningGate("/skills/quant-map?trackId=quant")).toBe(
      "/skills/quant-map?trackId=quant&from=myworld",
    );
    expect(withMyWorldLearningGate("/(tabs)/explore")).toBe("/(tabs)/explore");
  });
});
