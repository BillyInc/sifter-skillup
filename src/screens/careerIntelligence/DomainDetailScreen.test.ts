import { visibleDomainAreas } from "@/lib/d078RoutePresentation";

describe("visibleDomainAreas", () => {
  it("keeps only current canonical areas in the D078 learner view", () => {
    const areas = visibleDomainAreas({
      id: "D078",
      subgroups: [
        { id: "current-area", name: "Sociology and Social Anthropology", isCurrentAreaOfSpecialization: true },
        { id: "legacy-area", name: "Computational and Quantitative Social Research", isCurrentAreaOfSpecialization: false },
      ],
    } as never);

    expect(areas.map((area) => area.id)).toEqual(["current-area"]);
  });

  it("does not apply the D078 canonical-area filter to other domains", () => {
    const areas = visibleDomainAreas({
      id: "D001",
      subgroups: [
        { id: "area-a", name: "Area A" },
        { id: "area-b", name: "Area B" },
      ],
    } as never);

    expect(areas.map((area) => area.id)).toEqual(["area-a", "area-b"]);
  });
});
