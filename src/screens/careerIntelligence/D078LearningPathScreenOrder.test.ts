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
      "Your shared starting point",
      'title="Foundations for this field"',
      "<GuidanceContinuation",
      "Build further across the field",
      "Choose a focused area",
    ]);
    assertInOrder("../../components/careerIntelligence/GuidanceContinuation.tsx", [
      "Compulsory domain foundations",
      "Optional useful edges",
    ]);
    assertInOrder("D078MethodAwareJourney.tsx", [
      "const FIELD_TITLE = \"Social Sciences & Behavioural Research\"",
      "Why your Sociology studies connect",
      'ItemLane title="Compulsory foundations"',
      'ItemLane title="Knowledge of society and the social world"',
      "<MethodChoicePanel",
      "Your selected method route",
      'ItemLane title="Use when this condition applies"',
      "<D078AreaResults projection={projection}",
    ]);
  });

  it("shows the selected area before inherited domain context, area additions and roles", () => {
    assertInOrder("SubgroupDetailScreen.tsx", [
      '<ProgrammeOutcomeBridge connection={studentConnection} nextLayer="area"',
      'What carries forward from ${domain?.name ?? "the field"}',
      'title="Compulsory domain foundations carried forward"',
      "What this area adds",
      'title="Area learning sequence"',
      "Roles inside this area",
    ]);
    assertInOrder("D078MethodAwareJourney.tsx", [
      '<D078JourneyPage stage="area"',
      'Shown because you selected ${supports.join(" and ")}.',
      "{orderedAreaLaneKeys.map((key) =>",
      "<ItemLane key={key} title={lane.title}",
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
      "Work contexts connected to this role",
      "Learning linked to this role task",
      "Other useful and conditional learning for this role task",
      "</D078JourneyPage>",
    ]);
  });
});
