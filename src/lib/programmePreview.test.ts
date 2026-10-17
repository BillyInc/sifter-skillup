import { programmePreviewExplanation } from "./programmePreview";
import { sociologyCurriculumPreview } from "./sociologyCurriculumPreview";
import type { Programme, ProgrammeCurriculumContract } from "@/types/career";

describe("programmePreviewExplanation", () => {
  it("loads the reviewed Sociology curriculum by its exact student-facing programme name", () => {
    const programme = {
      id: "sociology",
      name: "Sociology",
      institutionType: "university",
      discipline: "Social Sciences",
      domains: [],
    } as Programme;
    const preview = sociologyCurriculumPreview(programme);

    expect(preview?.status).toBe("available");
    expect(preview?.outcomes.length).toBeGreaterThan(200);
    expect(preview?.abilities).toHaveLength(7);
  });

  it("does not apply the Sociology-only curriculum to the distinct Sociology and Anthropology JAMB programme", () => {
    const programme = {
      id: "sociology",
      name: "Sociology and Social Anthropology",
      studentName: "Sociology",
      institutionType: "university",
      discipline: "Social Sciences",
      domains: [],
    } as Programme;

    expect(sociologyCurriculumPreview(programme)).toBeUndefined();
  });

  it("uses the displayed local reviewed curriculum when the API contract is not seeded", () => {
    const programme = {
      id: "sociology",
      name: "Sociology",
      institutionType: "university",
      discipline: "Social Sciences",
      domains: [],
    } as Programme;
    const reviewedPreview: ProgrammeCurriculumContract = {
      status: "available",
      localSourcePreview: true,
      outcomes: [{
        outcomeId: "outcome-1",
        courseCode: "SOC 301",
        courseTitle: "Methods of Social Research and Statistics",
        outcomeIndex: 1,
        sourceText: "Use research methods.",
        studentText: "Choose a suitable research method.",
        sourceLocator: { page: 334 },
        dataState: "source_backed",
      }],
      abilities: [],
    };

    expect(programmePreviewExplanation(programme, reviewedPreview)).toContain(
      "Methods of Social Research and Statistics",
    );
  });
});
