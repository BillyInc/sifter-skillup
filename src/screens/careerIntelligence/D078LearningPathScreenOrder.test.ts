import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assertInOrder(sourceFile: string, markers: string[]) {
  const source = readFileSync(resolve(__dirname, sourceFile), "utf8");
  const positions = markers.map((marker) => source.indexOf(marker));
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
  });

  it("shows the selected area before inherited domain context, area additions and roles", () => {
    assertInOrder("SubgroupDetailScreen.tsx", [
      'level="area"',
      "<ProgrammeOutcomeBridge connection={studentConnection} nextLayer=\"area\"",
      "What carries forward from ${domain?.name ?? \"the field\"}",
      "What this area adds",
      "Roles inside this area",
    ]);
  });

  it("shows role overview and area fit before programme carry-forward and role learning", () => {
    assertInOrder("RoleDetailScreen.tsx", [
      "<HierarchyOrientationCard",
      "Areas this role can connect to",
      "<ProgrammeOutcomeBridge connection={programmeConnection} nextLayer=\"role\"",
      "Earlier-stage learning and choices for this role",
      "Capabilities needed for relevant role tasks",
      "Options for particular tasks in this role",
    ]);
    const source = readFileSync(resolve(__dirname, "RoleDetailScreen.tsx"), "utf8");
    expect(source).not.toContain(">ROLE</Text>");
    expect(source).toContain("summary={role.studentOrientation?.shortIntro || role.studentOrientation?.whatPeopleDo");
  });
});
