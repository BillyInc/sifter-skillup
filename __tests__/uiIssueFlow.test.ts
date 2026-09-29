import { shouldRestoreEducatorDraft } from "../src/lib/educatorOnboardingFlow";
import { programmePreviewExplanation, programmePreviewUnavailableMessage } from "../src/lib/programmePreview";
import { programmeCoverageCsv } from "../src/lib/programmeIntelligenceExport";
import { adminNav } from "../src/lib/adminNav";

describe("reported admin and programme navigation flows", () => {
  it("does not let a late onboarding restore undo a just-selected organisation", () => {
    expect(shouldRestoreEducatorDraft(false)).toBe(true);
    expect(shouldRestoreEducatorDraft(true)).toBe(false);
  });

  it("previews checked course areas but never promotes review-only rows", () => {
    const programme = {
      id: "p1",
      name: "Example",
      institutionType: "university" as const,
      discipline: "",
      domains: [],
      curriculumContract: {
        status: "available" as const,
        outcomes: [
          { outcomeId: "checked-1", courseCode: "ABC101", courseTitle: "Checked course", outcomeIndex: 1, sourceText: "Checked outcome", studentText: "Checked outcome", sourceLocator: {}, dataState: "source_backed" as const },
          { outcomeId: "held-1", courseCode: "ABC102", courseTitle: "Held course", outcomeIndex: 1, sourceText: "Held outcome", studentText: "Held outcome", sourceLocator: {}, dataState: "review_only" as const },
        ],
        abilities: [],
      },
    };
    expect(programmePreviewExplanation(programme)).toContain("Checked course");
    expect(programmePreviewExplanation(programme)).not.toContain("Held course");
  });

  it("explains a missing programme contract as unavailable seed data, not learner failure", () => {
    expect(programmePreviewUnavailableMessage("not_seeded")).toContain("not been loaded");
    expect(programmePreviewUnavailableMessage("not_seeded")).toContain("will not substitute");
  });

  it("exports only reports actually returned by the programme-intelligence API", () => {
    const csv = programmeCoverageCsv([{
      programmeId: "p1", programmeName: 'Accounting, "example"',
      curriculumSkills: [], curriculumTechnical: [], curriculumTransferable: [],
      curriculumStatus: "complete", domains: [{
        domainId: "d1", domainName: "Finance", matchType: "direct",
        curriculumSkills: [], resources: [{
          name: "Financial analysis", kind: "skill", source: "role", state: "bridge",
        }], coveredCount: 0, bridgeCount: 1, coverageStatus: "review_only",
        explanation: "Source-backed practice evidence.",
      }],
    }]);
    expect(csv).toContain('"Accounting, ""example"""');
    expect(csv).not.toContain("420");
  });

  it("routes the Skip to guidance action to the existing guidance setup screen", () => {
    const pushed: string[] = [];
    adminNav.guidanceStart({ push: (href) => pushed.push(String(href)), replace: () => {}, back: () => {} });
    expect(pushed).toEqual(["/(admin)/guidance-start"]);
  });
});
