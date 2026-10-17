import { currentAreaRoleSelections, studentDomainAreas } from "./studentDomainAreas";
import type { DomainV2 } from "@/types/career";

describe("studentDomainAreas", () => {
  it("shows only canonical D078 areas and never substitutes retired subgroup names", () => {
    const domain = {
      id: "D078",
      subgroups: [
        { id: "A01", name: "Sociology and Social Anthropology", isCurrentAreaOfSpecialization: true },
        { id: "legacy-1", name: "Computational and Quantitative Social Research", isCurrentAreaOfSpecialization: false },
        { id: "legacy-2", name: "Social, Cultural & Economic Research", isCurrentAreaOfSpecialization: false },
      ],
    } as DomainV2;

    expect(studentDomainAreas(domain).map((area) => area.id)).toEqual(["A01"]);
  });

  it("preserves the area list for other domains", () => {
    const domain = { id: "D001", subgroups: [{ id: "A01" }, { id: "A02" }] } as DomainV2;
    expect(studentDomainAreas(domain).map((area) => area.id)).toEqual(["A01", "A02"]);
  });

  it("removes saved D078 role routes that point to retired areas before student display", () => {
    const domain = {
      id: "D078",
      subgroups: [{ id: "A01", name: "Current area", isCurrentAreaOfSpecialization: true }],
    } as DomainV2;
    const selections = [
      { id: "D078|sociologist", name: "Sociologist", domainId: "D078", subgroupId: "A01" },
      { id: "D078|old", name: "Old route", domainId: "D078", subgroupId: "legacy" },
      { id: "D001|other", name: "Other domain role", domainId: "D001", subgroupId: "old" },
    ];

    expect(currentAreaRoleSelections(selections, [domain]).map((entry) => entry.id))
      .toEqual(["D078|sociologist", "D001|other"]);
  });
});
