import { hasStudentDisplayableProgrammeLearning, programmePreviewUnavailableMessage } from "./programmePreview";
import type { ProgrammeCurriculumContract } from "@/types/career";

describe("programme preview learning availability", () => {
  it("recognizes source-backed abilities when course outcomes are absent", () => {
    const contract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [],
      abilities: [{
        abilityId: "ability-1",
        sourceText: "Apply evidence to a practical problem",
        studentText: "Apply evidence to a practical problem",
        sourceLocator: { page: 12 },
        dataState: "source_backed",
      }],
    };

    expect(hasStudentDisplayableProgrammeLearning(contract)).toBe(true);
  });

  it("does not treat review-only rows as student preview content", () => {
    const contract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "outcome-1",
        courseCode: "ABC101",
        courseTitle: "Introduction to the field",
        outcomeIndex: 1,
        sourceText: "Review-only claim",
        studentText: "Review-only claim",
        sourceLocator: { page: 12 },
        dataState: "review_only",
      }],
      abilities: [],
    };

    expect(hasStudentDisplayableProgrammeLearning(contract)).toBe(false);
  });

  it("distinguishes an empty available contract from one not loaded yet", () => {
    expect(programmePreviewUnavailableMessage("available")).toMatch(/record is available/i);
    expect(programmePreviewUnavailableMessage("not_seeded")).toMatch(/not been loaded/i);
  });
});
