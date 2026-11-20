import { readFileSync } from "fs";
import { join } from "path";

// Owner feedback (docs/design-feedback/2026-11-18): "Remove evidence from skills
// matcher" and "Remove faculty for now since we don't have faculty information yet".
// These checks pin the removals so a later merge cannot silently restore them.
const read = (relative: string) => readFileSync(join(__dirname, "..", relative), "utf8");

describe("removed UI from the redesign feedback", () => {
  it("the Skills Matcher panel has no Evidence block or evidence-source links", () => {
    const source = read("src/components/careerIntelligence/SkillDiscoveryPanel.tsx");
    expect(source).not.toMatch(/>\s*Evidence\s*</);
    expect(source).not.toContain("Open evidence source");
    expect(source).not.toContain("recorded for ${item.name}");
  });

  it("the programme page no longer shows a JAMB faculty as the programme discipline", () => {
    const source = read("src/screens/careerIntelligence/ProgrammeDetailRefinedScreen.tsx");
    expect(source).not.toMatch(/discipline:\s*variant\.jambFaculty/);
  });

  it("the admission search field has no faculty input", () => {
    const source = read("src/components/onboarding/LiveAdmissionSearchField.tsx");
    expect(source).not.toMatch(/\bfaculty\b/);
  });
});
