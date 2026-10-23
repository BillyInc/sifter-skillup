import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assertInOrder(sourceFile: string, markers: string[]) {
  const source = readFileSync(resolve(__dirname, sourceFile), "utf8");
  let cursor = 0;
  const positions = markers.map((marker) => {
    const position = source.indexOf(marker, cursor);
    cursor = position + marker.length;
    return position;
  });
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((left, right) => left - right));
}

describe("D078 layer presentation order", () => {
  it("shows the domain overview before programme carry-forward and domain learning", () => {
    assertInOrder("DomainDetailScreen.tsx", [
      "Understand {domain.name} before choosing an area",
      "Why your Sociology programme connects to this field",
      "Compulsory domain foundations for ${domain.name}",
      "Optional useful edges",
      "Choose a focused area",
    ]);
    assertInOrder("D078MethodAwareJourney.tsx", [
      "const FIELD_TITLE = \"Social Sciences & Behavioural Research\"",
      "Why your Sociology studies connect",
      'ItemLane title="Already on your route"',
      "<MethodChoicePanel",
      "For the methods you selected",
      "<D078AreaResults projection={projection}",
    ]);
  });

  it("shows the selected area before inherited domain context, area additions and roles", () => {
    assertInOrder("SubgroupDetailScreen.tsx", [
      'level="area"',
      '<ProgrammeOutcomeBridge connection={studentConnection} nextLayer="area"',
      'What carries forward from ${domain?.name ?? "the field"}',
      "What this area adds",
      "Roles inside this area",
    ]);
    assertInOrder("D078MethodAwareJourney.tsx", [
      '<D078JourneyPage stage="area"',
      'Shown because you selected ${supports.join(" and ")}',
      'ItemLane title="Needed for what you selected" ids={needed}',
      'ItemLane title="Useful. You can skip it" ids={useful}',
      "Roles in this area for your selected methods",
    ]);
  });

  it("shows role overview and area fit before programme carry-forward and role learning", () => {
    assertInOrder("RoleDetailScreen.tsx", [
      "<HierarchyOrientationCard",
      "Areas this role can connect to",
      '<ProgrammeOutcomeBridge connection={programmeConnection} nextLayer="role"',
      "Earlier-stage learning and choices for this role",
      "Role learning sequence for relevant work",
      "Options for particular tasks in this role",
    ]);
    const roleSource = readFileSync(resolve(__dirname, "RoleDetailScreen.tsx"), "utf8");
    expect(roleSource).not.toContain(">ROLE</Text>");
    expect(roleSource).toContain("summary={role.studentOrientation?.shortIntro || role.studentOrientation?.whatPeopleDo");
    assertInOrder("D078MethodAwareJourney.tsx", [
      '<D078JourneyPage stage="role"',
      "Available with the method you selected. This does not make the method a requirement of the role.",
      "How your learning may apply in this role",
      "Specific to the method you selected",
      "</D078JourneyPage>",
    ]);
  });
});
