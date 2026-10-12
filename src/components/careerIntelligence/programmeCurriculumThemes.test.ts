import {
  programmeThemeForCourse,
  SOCIOLOGY_REVIEWED_THEME_BY_CODE,
} from "./programmeCurriculumThemes";

describe("reviewed Sociology programme themes", () => {
  it("assigns all 34 CCMAS course identities to explicit, source-grounded themes", () => {
    const expectedCounts = {
      shared_communication: 1,
      shared_nigerian_culture: 1,
      shared_philosophy: 1,
      shared_peace_conflict: 1,
      shared_enterprise: 2,
      ideas: 5,
      people: 5,
      african_societies: 3,
      social_change: 2,
      social_issues: 3,
      research: 5,
      governance: 2,
      applied_practice: 2,
      technology: 1,
    };

    expect(Object.keys(SOCIOLOGY_REVIEWED_THEME_BY_CODE)).toHaveLength(34);
    const counts = Object.values(SOCIOLOGY_REVIEWED_THEME_BY_CODE).reduce<Record<string, number>>((result, key) => {
      result[key] = (result[key] ?? 0) + 1;
      return result;
    }, {});
    expect(counts).toEqual(expectedCounts);
  });

  it("does not place an unreviewed Sociology course by keyword", () => {
    expect(programmeThemeForCourse({
      code: "SOC 999",
      title: "Research project with data analysis",
      displayGroup: "sociology_programme",
      outcomes: [{ studentText: "You will collect evidence and analyse data." }],
    })).toBe("core");
  });

  it("keeps non-Sociology programme courses out of Sociology themes", () => {
    expect(programmeThemeForCourse({
      code: "SOC 301",
      title: "Methods for Social Research",
      displayGroup: "programme_core",
      outcomes: [{ studentText: "You will compare research methods." }],
    })).toBe("core");
  });
});
