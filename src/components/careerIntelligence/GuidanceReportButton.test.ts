import {
  hasGuidanceReportContext,
  isGuidanceReportReady,
  toggleGuidanceSelectionPath,
  type GuidancePathRecord,
  type GuidanceReportSelection,
} from "./GuidanceReportButton";

const completedPath: GuidancePathRecord = {
  programme: { id: "jamb-sociology", name: "Sociology" },
  university: { id: "university-ibadan", name: "University of Ibadan (UI)" },
  domains: [{ id: "D078", name: "Social Sciences", matchType: "direct" }],
  subgroups: [{ id: "D078|sg:quant", name: "Computational Social Science", domainId: "D078", domainName: "Social Sciences" }],
  roles: [{ id: "statistician", name: "Statistician", domainId: "D078", domainName: "Social Sciences", subgroupId: "D078|sg:quant", subgroupName: "Computational Social Science" }],
  resume: { stage: "review", status: "complete" },
};

describe("guidance report selection gate", () => {
  it("requires both academic context and an explicitly completed Review", () => {
    expect(hasGuidanceReportContext(completedPath)).toBe(true);
    expect(isGuidanceReportReady(completedPath)).toBe(true);
    expect(isGuidanceReportReady({ ...completedPath, resume: { stage: "review", status: "in_progress" } })).toBe(false);
    expect(isGuidanceReportReady({ ...completedPath, university: undefined })).toBe(false);
    expect(isGuidanceReportReady({ ...completedPath, programme: { name: "Sociology" } })).toBe(false);
  });

  it("preserves the full path and invalidates Review when a tick changes it", () => {
    const selection: GuidanceReportSelection = {
      kind: "roles",
      id: "researcher",
      name: "Social Researcher",
      domainId: "D078",
      domainName: "Social Sciences",
      subgroupId: "D078|sg:research",
      subgroupName: "Social and Economic Research",
    };

    const next = toggleGuidanceSelectionPath(completedPath, selection);

    expect(next.programme).toEqual(completedPath.programme);
    expect(next.university).toEqual(completedPath.university);
    expect(next.domains).toEqual(completedPath.domains);
    expect(next.subgroups).toEqual(completedPath.subgroups);
    expect(next.roles).toEqual([
      ...((completedPath.roles ?? []) as unknown[]),
      expect.objectContaining({
        id: "researcher",
        name: "Social Researcher",
        domainId: "D078",
        domainName: "Social Sciences",
        subgroupId: "D078|sg:research",
        subgroupName: "Social and Economic Research",
      }),
    ]);
    expect(next.resume).toEqual({ stage: "in_progress", status: "in_progress" });
    expect(isGuidanceReportReady(next)).toBe(false);

    const removed = toggleGuidanceSelectionPath(next, selection);
    expect(removed.roles).toEqual(completedPath.roles);
    expect(removed.programme).toEqual(completedPath.programme);
    expect(removed.university).toEqual(completedPath.university);
    expect(removed.resume).toEqual({ stage: "in_progress", status: "in_progress" });
  });

  it("stores granular learning-focus choices separately from route and mastery state", () => {
    const selection: GuidanceReportSelection = {
      kind: "learningFocus",
      id: "domain:D078:skill:research-design",
      name: "Research design",
      contextLevel: "domain",
      contextKey: "D078",
      itemType: "skill",
      itemKey: "research-design",
      domainId: "D078",
    };

    const next = toggleGuidanceSelectionPath(completedPath, selection);

    expect(next.learningFocus).toEqual([
      expect.objectContaining({
        id: selection.id,
        name: selection.name,
        contextLevel: "domain",
        contextKey: "D078",
        itemType: "skill",
        itemKey: "research-design",
      }),
    ]);
    expect(next.domains).toEqual(completedPath.domains);
    expect(next.subgroups).toEqual(completedPath.subgroups);
    expect(next.roles).toEqual(completedPath.roles);
    expect(next.resume).toEqual({ stage: "in_progress", status: "in_progress" });
    expect(isGuidanceReportReady(next)).toBe(false);

    const removed = toggleGuidanceSelectionPath(next, selection);
    expect(removed.learningFocus).toEqual([]);
  });
});
