import {
  addToLearningPlan,
  buildLearningPlanStack,
  buildLearningPlanStackSet,
  createLearningPlanReportSnapshot,
  createLearningPlanSnapshot,
  removeFromLearningPlan,
  replaceAlternativeChoice,
  reorderLearningPlan,
  sequenceLearningPlanIds,
  type LearningPlanCandidate,
} from "./guidedLearningPlan";

function candidate(overrides: Partial<LearningPlanCandidate> & Pick<LearningPlanCandidate, "id" | "name" | "layer">): LearningPlanCandidate {
  return {
    visibility: "selectable",
    claimReviewState: "approved",
    linkState: "linked",
    linkUrl: "https://example.test/learn",
    guidanceOwner: overrides.layer,
    ...overrides,
  };
}

describe("guided learning plan stack", () => {
  it("keeps fixed programme context and groups selected additions by layer/category", () => {
    const result = buildLearningPlanStack({
      programmeItems: [candidate({ id: "p1", name: "Programme theme", layer: "programme", visibility: "fixed" })],
      domainItems: [candidate({ id: "d1", name: "Shared foundation", layer: "domain", category: "shared_foundation" })],
      areaItems: [candidate({ id: "a1", name: "Area addition", layer: "area", category: "area_addition" })],
      roleItems: [candidate({ id: "r1", name: "Role addition", layer: "role", category: "role_addition" })],
      route: { programmeId: "p1", domainId: "d1", areaId: "a1", roleId: "r1" },
      selectedIds: ["d1", "a1", "r1"],
    });

    expect(result.fixedProgramme.map((item) => item.id)).toEqual(["p1"]);
    expect(result.sharedFoundation.map((item) => item.id)).toEqual(["d1"]);
    expect(result.areaAdditions.map((item) => item.id)).toEqual(["a1"]);
    expect(result.roleAdditions.map((item) => item.id)).toEqual(["r1"]);
  });

  it("allows saving a domain or area route without selecting a role", () => {
    const result = buildLearningPlanStack({
      route: { programmeId: "sociology", domainId: "D078", areaId: "research" },
      domainItems: [candidate({ id: "foundation", name: "Shared foundation", layer: "domain", category: "shared_foundation" })],
      areaItems: [candidate({ id: "research", name: "Research addition", layer: "area", category: "area_addition", routeScope: { areaIds: ["research"] } })],
      selectedIds: ["foundation", "research"],
    });
    expect(result.route.roleId).toBeUndefined();
    expect(result.selectedIds).toEqual(["foundation", "research"]);
    expect(result.roleAdditions).toEqual([]);
  });

  it("lets a learner add a useful edge alongside the compulsory path without replacing it", () => {
    const foundation = candidate({
      id: "domain-foundation",
      name: "Domain foundation",
      layer: "domain",
      category: "shared_foundation",
      requirementLevel: "needed",
    });
    const useful = candidate({
      id: "route-edge",
      name: "Optional route edge",
      layer: "domain",
      category: "useful_edge",
      requirementLevel: "useful",
      requirementReason: "It supports a selected kind of work but is not needed to continue.",
    });
    const route = { programmeId: "sociology", domainId: "D078" };
    const selected = addToLearningPlan({ route, selectedIds: [foundation.id] }, useful, [foundation, useful]);
    const stack = buildLearningPlanStack({
      route,
      domainItems: [foundation, useful],
      selectedIds: selected.selection.selectedIds,
    });

    expect(selected.conflicts).toEqual([]);
    expect(selected.blockedByPrerequisites).toEqual([]);
    expect(stack.selectedIds).toEqual([foundation.id, useful.id]);
    expect(stack.sharedFoundation.map((item) => item.id)).toEqual([foundation.id]);
    expect(stack.usefulEdges.map((item) => item.id)).toEqual([useful.id]);
  });

  it("keeps a downstream area useful edge selectable alongside compulsory domain and area learning", () => {
    const domainFoundation = candidate({
      id: "domain-foundation",
      name: "Domain foundation",
      layer: "domain",
      category: "shared_foundation",
      requirementLevel: "needed",
    });
    const areaRequirement = candidate({
      id: "area-requirement",
      name: "Area requirement",
      layer: "area",
      category: "area_addition",
      requirementLevel: "needed",
      routeScope: { domainIds: ["D078"], areaIds: ["sociology"] },
    });
    const areaEdge = candidate({
      id: "area-edge",
      name: "Optional area advantage",
      layer: "area",
      category: "useful_edge",
      requirementLevel: "useful",
      requirementReason: "It can strengthen one direction within the area, but is not needed to continue.",
      routeScope: { domainIds: ["D078"], areaIds: ["sociology"] },
    });
    const route = { programmeId: "sociology-programme", domainId: "D078", areaId: "sociology" };
    const available = [domainFoundation, areaRequirement, areaEdge];
    const selected = addToLearningPlan(
      { route, selectedIds: [domainFoundation.id, areaRequirement.id] },
      areaEdge,
      available,
    );
    const stack = buildLearningPlanStack({
      route,
      domainItems: [domainFoundation],
      areaItems: [areaRequirement, areaEdge],
      selectedIds: selected.selection.selectedIds,
    });

    expect(selected.conflicts).toEqual([]);
    expect(selected.blockedByPrerequisites).toEqual([]);
    expect(stack.sharedFoundation.map((item) => item.id)).toEqual([domainFoundation.id]);
    expect(stack.areaAdditions.map((item) => item.id)).toEqual([areaRequirement.id]);
    expect(stack.usefulEdges.map((item) => item.id)).toEqual([areaEdge.id]);
  });

  it("keeps the area layer advisory when the learner stops at the domain", () => {
    const result = buildLearningPlanStack({
      route: { programmeId: "sociology", domainId: "D078" },
      domainItems: [candidate({ id: "foundation", name: "Shared foundation", layer: "domain", category: "shared_foundation" })],
      areaItems: [
        candidate({ id: "research", name: "Social research", layer: "area", category: "area_addition", routeScope: { domainIds: ["D078"] } }),
        candidate({ id: "policy", name: "Social policy", layer: "area", category: "area_addition", routeScope: { domainIds: ["D078"] } }),
      ],
      roleItems: [candidate({ id: "sociologist", name: "Sociologist", layer: "role", category: "role_addition" })],
      selectedIds: ["foundation", "research", "sociologist"],
    });

    expect(result.selectedIds).toEqual(["foundation"]);
    expect(result.roleAdditions).toEqual([]);
    expect(result.advisoryAreas.map((item) => item.id)).toEqual(["policy", "research"]);
    expect(result.hidden.map((item) => item.id)).toEqual(expect.arrayContaining(["research", "sociologist"]));
  });

  it("does not expose review-only or unlinked candidates in the selected stack", () => {
    const result = buildLearningPlanStack({
      domainItems: [
        candidate({ id: "ok", name: "Approved", layer: "domain", category: "shared_foundation" }),
        candidate({ id: "review", name: "Review", layer: "domain", claimReviewState: "review_required" }),
        candidate({ id: "no-link", name: "No link", layer: "domain", linkState: "no_link" }),
      ],
      route: { domainId: "D078" },
      selectedIds: ["ok", "review", "no-link"],
    });

    expect(result.selectedIds).toEqual(["ok"]);
    expect(result.hidden.map((item) => item.id)).toEqual(["review", "no-link"]);
  });

  it("keeps alternatives visible as a choice instead of merging them", () => {
    const result = buildLearningPlanStack({
      domainItems: [
        candidate({ id: "r", name: "R", layer: "domain", category: "alternative", alternativeGroup: "quant-tool" }),
        candidate({ id: "spss", name: "SPSS", layer: "domain", category: "alternative", alternativeGroup: "quant-tool" }),
      ],
      route: { domainId: "D078" },
      selectedIds: ["r"],
    });

    expect(result.alternatives).toEqual([{ group: "quant-tool", options: expect.any(Array), selectedId: "r" }]);
    expect(result.alternatives[0].options).toHaveLength(2);
    expect(result.layerChoices).toEqual(expect.arrayContaining([
      expect.objectContaining({ layer: "domain", alternatives: expect.any(Array) }),
    ]));
  });

  it("requires explicit confirmation before replacing an alternative", () => {
    const selection = { route: { domainId: "D078" }, selectedIds: ["r"] };
    const result = addToLearningPlan(
      selection,
      candidate({ id: "spss", name: "SPSS", layer: "domain", alternativeGroup: "quant-tool" }),
      [candidate({ id: "r", name: "R", layer: "domain", alternativeGroup: "quant-tool" })],
    );
    expect(result.conflicts).toEqual(["r"]);
    expect(result.selection.selectedIds).toEqual(["r"]);
    const replaced = replaceAlternativeChoice(
      selection,
      candidate({ id: "spss", name: "SPSS", layer: "domain", alternativeGroup: "quant-tool" }),
      [candidate({ id: "r", name: "R", layer: "domain", alternativeGroup: "quant-tool" })],
    );
    expect(replaced.selection.selectedIds).toEqual(["spss"]);
  });

  it("preserves the current alternative when its replacement prerequisite is missing", () => {
    const selection = { route: { domainId: "D078" }, selectedIds: ["r"] };
    const r = candidate({ id: "r", name: "R", layer: "domain", alternativeGroup: "quant-tool" });
    const spss = candidate({
      id: "spss",
      name: "SPSS",
      layer: "domain",
      alternativeGroup: "quant-tool",
      prerequisiteIds: ["statistics"],
    });
    const result = replaceAlternativeChoice(selection, spss, [r, spss]);

    expect(result.selection.selectedIds).toEqual(["r"]);
    expect(result.blockedByPrerequisites).toEqual(["statistics"]);
  });

  it("preserves the current alternative when a replacement is no longer selectable", () => {
    const selection = { route: { domainId: "D078" }, selectedIds: ["r"] };
    const r = candidate({ id: "r", name: "R", layer: "domain", alternativeGroup: "quant-tool" });
    const stale = candidate({
      id: "spss",
      name: "SPSS",
      layer: "domain",
      alternativeGroup: "quant-tool",
      claimReviewState: "review_required",
    });
    const result = replaceAlternativeChoice(selection, stale, [r, stale]);

    expect(result.selection.selectedIds).toEqual(["r"]);
    expect(result.blockedByPrerequisites).toEqual([]);
  });

  it("blocks a selected item until its prerequisite is selected", () => {
    const result = buildLearningPlanStack({
      domainItems: [
        candidate({ id: "design", name: "Research design", layer: "domain", category: "shared_foundation" }),
        candidate({ id: "model", name: "Modelling", layer: "domain", category: "useful_edge", prerequisiteIds: ["design"] }),
      ],
      route: { domainId: "D078" },
      selectedIds: ["model"],
    });
    expect(result.selectedIds).toEqual([]);
    expect(result.guardIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ candidateId: "model", code: "missing_prerequisite", relatedIds: ["design"] }),
    ]));
  });

  it("applies an explicitly approved hard prerequisite only inside its route scope", () => {
    const foundation = candidate({ id: "foundation", name: "Quantitative foundations", layer: "domain" });
    const econometrics = candidate({
      id: "econometrics",
      name: "Applied econometrics",
      layer: "area",
      routeScope: { domainIds: ["D078"] },
      prerequisiteIds: ["foundation"],
      relationships: [{
        type: "builds_on",
        targetId: "foundation",
        status: "source_backed",
        explanation: "Use statistical foundations to understand the model assumptions.",
        sourceReferences: [{ title: "Source", url: "https://example.org/econometrics" }],
        sequenceApproved: true,
        sequencePolicy: "hard_prerequisite",
        sequenceScope: { domainIds: ["D078"], areaIds: ["economics"] },
      }],
    });

    expect(sequenceLearningPlanIds(
      ["econometrics", "foundation"],
      [econometrics, foundation],
      ["econometrics", "foundation"],
      { domainId: "D078", areaId: "economics" },
    ).order).toEqual(["foundation", "econometrics"]);
    expect(sequenceLearningPlanIds(
      ["econometrics", "foundation"],
      [econometrics, foundation],
      ["econometrics", "foundation"],
      { domainId: "D078", areaId: "sociology" },
    ).order).toEqual(["econometrics", "foundation"]);
  });

  it("orders selected conditional prerequisites within their route without blocking selection", () => {
    const foundation = candidate({ id: "statistics", name: "Statistics foundations", layer: "domain" });
    const econometrics = candidate({
      id: "econometrics", name: "Applied econometrics", layer: "area",
      relationships: [{
        type: "builds_on", targetId: "statistics", targetName: "Statistics foundations",
        status: "source_backed", explanation: "Review statistics first if it is new to you.",
        sourceReferences: [{ title: "Course prerequisite example", url: "https://example.org/statistics" }],
        sequenceApproved: true, sequencePolicy: "conditional_prerequisite",
        sequenceCondition: "Only if prior statistics preparation is absent.",
        sequenceScope: { domainIds: ["D078"], areaIds: ["economics"] },
      }],
    });
    const route = { domainId: "D078", areaId: "economics" };
    const added = addToLearningPlan({ route, selectedIds: [] }, econometrics, [foundation, econometrics]);
    expect(added.blockedByPrerequisites).toEqual([]);
    expect(added.selection.selectedIds).toEqual(["econometrics"]);
    expect(sequenceLearningPlanIds(["econometrics", "statistics"], [foundation, econometrics], ["econometrics", "statistics"], route).order)
      .toEqual(["statistics", "econometrics"]);
    expect(sequenceLearningPlanIds(["econometrics", "statistics"], [foundation, econometrics], ["econometrics", "statistics"], { ...route, areaId: "sociology" }).order)
      .toEqual(["econometrics", "statistics"]);
  });

  it("does not carry an item outside the selected route", () => {
    const result = buildLearningPlanStack({
      route: { domainId: "D078", areaId: "research" },
      areaItems: [candidate({
        id: "wrong-area",
        name: "Wrong area item",
        layer: "area",
        category: "area_addition",
        routeScope: { areaIds: ["other-area"] },
      })],
      selectedIds: ["wrong-area"],
    });
    expect(result.selectedIds).toEqual([]);
    expect(result.guardIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ candidateId: "wrong-area", code: "route_mismatch" }),
    ]));
  });

  it("does not allow reordering a dependent before its prerequisite", () => {
    const selection = { route: { domainId: "D078" }, selectedIds: ["design", "model"] };
    const items = [
      candidate({ id: "design", name: "Research design", layer: "domain" }),
      candidate({ id: "model", name: "Modelling", layer: "domain", prerequisiteIds: ["design"] }),
    ];
    const result = reorderLearningPlan(selection, ["design", "model"], "model", "design", items);
    expect(result.order).toEqual(["design", "model"]);
    expect(result.blockedByPrerequisites).toEqual(["design"]);
  });

  it("does not allow moving a prerequisite behind its selected dependent", () => {
    const selection = { route: { domainId: "D078" }, selectedIds: ["design", "model"] };
    const items = [
      candidate({ id: "design", name: "Research design", layer: "domain" }),
      candidate({ id: "model", name: "Modelling", layer: "domain", prerequisiteIds: ["design"] }),
    ];
    const result = reorderLearningPlan(selection, ["design", "model"], "design", undefined, items);
    expect(result.order).toEqual(["design", "model"]);
    expect(result.blockedByPrerequisites).toEqual(["design"]);
  });

  it("sequences saved items after their prerequisites even when selection order differs", () => {
    const items = [
      candidate({ id: "role", name: "Role output", layer: "role", prerequisiteIds: ["area"] }),
      candidate({ id: "area", name: "Area practice", layer: "area", prerequisiteIds: ["foundation"] }),
      candidate({ id: "foundation", name: "Shared foundation", layer: "domain" }),
    ];
    expect(sequenceLearningPlanIds(["role", "area", "foundation"], items, ["role", "area", "foundation"]).order)
      .toEqual(["foundation", "area", "role"]);
  });

  it("keeps a learner's allowed presentation order in the route stack", () => {
    const items = [
      candidate({ id: "first", name: "First choice", layer: "domain" }),
      candidate({ id: "second", name: "Second choice", layer: "domain" }),
      candidate({ id: "dependent", name: "Dependent", layer: "area", prerequisiteIds: ["first"] }),
    ];
    const result = buildLearningPlanStack({
      route: { domainId: "D078", areaId: "research" },
      domainItems: items.slice(0, 2),
      areaItems: [items[2]],
      selectedIds: ["first", "second", "dependent"],
      preferredOrder: ["second", "dependent", "first"],
    });
    expect(result.selectedIds).toEqual(["second", "first", "dependent"]);
  });

  it("removes only the personal selection and creates a versioned private snapshot", () => {
    const selection = removeFromLearningPlan({ route: { programmeId: "p", domainId: "D078" }, selectedIds: ["a", "b"] }, "a");
    const snapshot = createLearningPlanSnapshot({
      snapshotId: "snap-1",
      selection,
      order: ["a", "b"],
      dataVersion: "2026-10-09",
      now: "2026-10-09T00:00:00.000Z",
    });
    expect(selection.selectedIds).toEqual(["b"]);
    expect(selection.removedIds).toEqual(["a"]);
    expect(snapshot.order).toEqual(["b"]);
    expect(snapshot.removedIds).toEqual(["a"]);
    expect(snapshot.share).toEqual({ visibility: "private" });
  });

  it("enforces prerequisite order in the persisted report snapshot", () => {
    const items = [
      candidate({ id: "dependent", name: "Dependent", layer: "role", prerequisiteIds: ["base"] }),
      candidate({ id: "base", name: "Base", layer: "domain" }),
    ];
    const report = createLearningPlanReportSnapshot({
      snapshotId: "ordered-report",
      selections: [{ route: { domainId: "D078", roleId: "role" }, selectedIds: ["dependent", "base"] }],
      items,
      dataVersion: "2026-10-09",
      now: "2026-10-09T00:00:00.000Z",
    });
    expect(report.stacks[0].order).toEqual(["base", "dependent"]);
    expect(report.stacks[0].itemSummaries?.map((item) => item.id)).toEqual(["base", "dependent"]);
  });

  it("preserves item context and relationships in the saved report snapshot", () => {
    const items = [candidate({
      id: "research-tool",
      name: "Research tool",
      layer: "domain",
      itemType: "tool",
      themeLabel: "Collect and understand evidence",
      useCaseKey: "survey_analysis",
      requirementLevel: "useful",
      requirementReason: "It helps on routes that analyse survey responses, but is not needed for interview-only work.",
      geographicScope: "nigeria_to_global",
      plainMeaning: "A tool for organising research data.",
      contextualUse: "Use it to review survey responses in this domain.",
      programmeContext: "The programme introduces research evidence; this tool is an additional practice option.",
      domainContext: "The domain uses it to inspect patterns in collected data.",
      areaContext: "This area applies it when comparing group responses.",
      roleContext: "A researcher can use it to create a checked summary, not to choose the research question.",
      expectedOutput: "A clear summary of the evidence.",
      linkTitle: "Survey-analysis guide",
      linkRationale: "This guide demonstrates the workflow named in the task.",
      learningLinks: [{ title: "Survey-analysis guide", url: "https://example.org/guide", rationale: "It demonstrates the workflow named in the task.", locator: "Analysis section" }],
      limitations: ["It does not replace research design."],
      sourceReferences: [{ id: "esrc", title: "ESRC guidance", url: "https://example.org/esrc", region: "global" }],
      sourceLocators: [{ sourceId: "esrc", locator: "Section 2.1, pages 4–5" }],
      sourceConfidence: "high",
      evidenceType: "source_supported_synthesis",
      verifiedAt: "2026-10-12",
      prerequisiteNames: ["Research methods"],
      relationships: [{
        type: "complements",
        targetId: "domain:D078:method:research-methods",
        status: "source_backed",
        explanation: "Use the method to decide what the data means.",
      }],
    })];
    const snapshot = createLearningPlanSnapshot({
      snapshotId: "context-snapshot",
      selection: { route: { domainId: "D078" }, selectedIds: ["research-tool"] },
      order: ["research-tool"],
      items,
      dataVersion: "2026-10-10",
    });
    expect(snapshot.itemSummaries?.[0]).toMatchObject({
      itemType: "tool",
      themeLabel: "Collect and understand evidence",
      useCaseKey: "survey_analysis",
      requirementLevel: "useful",
      requirementReason: "It helps on routes that analyse survey responses, but is not needed for interview-only work.",
      geographicScope: "nigeria_to_global",
      plainMeaning: "A tool for organising research data.",
      contextualUse: "Use it to review survey responses in this domain.",
      programmeContext: "The programme introduces research evidence; this tool is an additional practice option.",
      domainContext: "The domain uses it to inspect patterns in collected data.",
      areaContext: "This area applies it when comparing group responses.",
      roleContext: "A researcher can use it to create a checked summary, not to choose the research question.",
      expectedOutput: "A clear summary of the evidence.",
      linkTitle: "Survey-analysis guide",
      linkRationale: "This guide demonstrates the workflow named in the task.",
      learningLinks: [expect.objectContaining({ title: "Survey-analysis guide", rationale: "It demonstrates the workflow named in the task.", locator: "Analysis section" })],
      limitations: ["It does not replace research design."],
      prerequisites: ["Research methods"],
      relationships: [expect.objectContaining({ type: "complements" })],
      sourceReferences: [expect.objectContaining({ id: "esrc", title: "ESRC guidance", url: "https://example.org/esrc" })],
      sourceLocators: [{ sourceId: "esrc", locator: "Section 2.1, pages 4–5" }],
      sourceConfidence: "high",
      evidenceType: "source_supported_synthesis",
      verifiedAt: "2026-10-12",
    });
  });

  it("saves unselected alternatives separately without adding them to selected focus", () => {
    const items = [
      candidate({ id: "python", name: "Python", layer: "area", alternativeGroup: "analysis-language", itemType: "tool" }),
      candidate({ id: "r", name: "R", layer: "area", alternativeGroup: "analysis-language", itemType: "tool" }),
      candidate({ id: "stata", name: "Stata", layer: "area", alternativeGroup: "analysis-language", itemType: "tool" }),
    ];
    const snapshot = createLearningPlanSnapshot({
      snapshotId: "alternative-snapshot",
      selection: { route: { domainId: "D078", areaId: "research" }, selectedIds: ["python"] },
      order: ["python"],
      items,
      dataVersion: "2026-10-12",
    });

    expect(snapshot.selectedIds).toEqual(["python"]);
    expect(snapshot.itemSummaries?.map((item) => item.id)).toEqual(["python"]);
    expect(snapshot.alternativeSummaries).toEqual([{
      group: "analysis-language",
      selectedId: "python",
      options: [expect.objectContaining({ id: "r", name: "R" }), expect.objectContaining({ id: "stata", name: "Stata" })],
    }]);
  });

  it("does not persist a stale or unapproved selected candidate into the snapshot", () => {
    const items = [
      candidate({ id: "approved", name: "Approved item", layer: "domain", explanation: "A reviewed explanation." }),
      candidate({ id: "stale", name: "Stale item", layer: "domain", claimReviewState: "review_required" }),
    ];
    const report = createLearningPlanReportSnapshot({
      snapshotId: "stale-selection",
      selections: [{ route: { domainId: "D078" }, selectedIds: ["approved", "stale"] }],
      items,
      dataVersion: "2026-10-10",
    });
    expect(report.stacks[0].selectedIds).toEqual(["approved"]);
    expect(report.stacks[0].itemSummaries?.map((item) => item.id)).toEqual(["approved"]);
  });

  it("keeps multiple downstream routes in separate stacks and warns clearly", () => {
    const routes = [
      { route: { programmeId: "sociology", domainId: "D078", areaId: "research" }, selectedIds: ["research-item"] },
      { route: { programmeId: "sociology", domainId: "D078", areaId: "policy" }, selectedIds: ["policy-item"] },
    ];
    const result = buildLearningPlanStackSet({
      routes,
      areaItems: [
        candidate({ id: "research-item", name: "Research route item", layer: "area", category: "area_addition", routeScope: { areaIds: ["research"] } }),
        candidate({ id: "policy-item", name: "Policy route item", layer: "area", category: "area_addition", routeScope: { areaIds: ["policy"] } }),
      ],
    });

    expect(result.stacks).toHaveLength(2);
    expect(result.stacks[0].route.areaId).toBe("research");
    expect(result.stacks[0].selectedIds).toEqual(["research-item"]);
    expect(result.stacks[1].route.areaId).toBe("policy");
    expect(result.stacks[1].selectedIds).toEqual(["policy-item"]);
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "multiple_routes" }),
      expect.objectContaining({ code: "multiple_areas" }),
    ]));

    const report = createLearningPlanReportSnapshot({
      snapshotId: "report-1",
      selections: routes,
      dataVersion: "2026-10-09",
      now: "2026-10-09T00:00:00.000Z",
    });
    expect(report.stacks.map((stack) => stack.route.areaId)).toEqual(["research", "policy"]);
    expect(report.routeWarnings.map((warning) => warning.code)).toEqual(expect.arrayContaining(["multiple_routes", "multiple_areas"]));
  });
});
