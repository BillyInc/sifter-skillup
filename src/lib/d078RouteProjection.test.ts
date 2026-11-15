import {
  INITIAL_D078_SELECTION,
  d078AreaLabel,
  d078ApplicableLayerItems,
  d078CombinationLabel,
  d078GraphDataForTests,
  isD078SelectableAlternativeEdge,
  orderD078RequirementLanesBySequence,
  projectD078Route,
  selectableD078ItemIds,
  selectedD078ItemsForTray,
  selectD078Area,
  selectD078Role,
  toggleD078Combination,
  toggleD078ComponentMethod,
  toggleD078AddedItem,
  toggleD078AddedItemWithinRoute,
  toggleD078Method,
  toggleD078TaskFamily,
} from "./d078RouteProjection";

const INTERVIEWS = "domain-item:d078-interviews";
const SPATIAL = "domain-item:d078-spatial-social-analysis";
const PARTICIPATORY = "combo:participatory-method-choice";
const SURVEY = "domain-item:d078-survey-method";
const INTERVIEW_OBSERVATION = "combo:interview-and-observation";
const QUANTITATIVE = "domain-item:d078-quantitative-approach";
const THEMATIC_CODEBOOK = "area_enrichment_item:d078-soc-thematic-analysis";
const CHI_SQUARE = "domain-item:d078-chi-square-tests";
const T_TESTS = "domain-item:d078-t-tests";
const ANOVA = "domain-item:d078-anova-and-repeated-measures";
const LOGISTIC = "domain-item:d078-logistic-regression";
const CDA = "domain-item:d078-critical-discourse-analysis";
const IPA = "domain-item:d078-interpretative-phenomenological-analysis";
const NLP = "domain-item:d078-nlp-and-text-mining";
const SUPERVISED_ML = "domain-item:d078-supervised-machine-learning";
const EXPLORATORY = "combo:exploratory-sequential";

const sortedAreas = (ids: string[]) => [...ids].sort();
const isToolNode = (node?: { item_type?: string; kind?: string }) =>
  ["tool", "programming_language", "python_library", "computational_environment"].includes(node?.item_type ?? "")
  || node?.kind === "area_tool_option" || node?.kind === "area_tool_application_reference";

function expectRouteItemProjected(
  graph: ReturnType<typeof d078GraphDataForTests>,
  projection: ReturnType<typeof projectD078Route>,
  selection: typeof INITIAL_D078_SELECTION,
  areaId: string,
  itemId: string,
): boolean {
  const item = graph.nodes_by_id[itemId];
  expect(item).toBeTruthy();
  if (!item || item.student_visible !== true || item.student_selectable === false || item.approval === "unapproved") return false;
  const required = item.required_selected_domain_item_ids;
  if (Array.isArray(required) && !required.every((id) => selection.addedItemIds.includes(String(id)))) return false;

  const selectable = selectableD078ItemIds(projection, areaId, selection);
  expect(selectable).toContain(itemId);
  if (isToolNode(item)) {
    expect(projection.toolIdsByArea[areaId] ?? []).toContain(itemId);
    if (item.display_stage !== "area") expect(projection.toolIds).toContain(itemId);
  } else if (itemId.startsWith("area-item:") || itemId.startsWith("area_enrichment_item:") || itemId.startsWith("area_learning_item:")) {
    expect(projection.areaItemIdsByArea[areaId] ?? []).toContain(itemId);
  } else {
    expect(projection.domainItemIds).toContain(itemId);
  }
  return true;
}
const selectDesign = (comboId: string) => {
  const combo = d078GraphDataForTests().combination_designs.find((row) => row.id === comboId)!;
  const methods = combo.combination_mode === "design_frame_with_selectable_methods"
    ? [...combo.required_method_ids, combo.selectable_component_method_ids[0]]
    : combo.required_method_ids;
  return toggleD078Combination(methods.reduce((state, id) => toggleD078Method(state, id), INITIAL_D078_SELECTION), comboId);
};
const selectDesignVariant = (comboId: string, componentMethodIds: string[]) => {
  const combo = d078GraphDataForTests().combination_designs.find((row) => row.id === comboId)!;
  const methods = [...combo.required_method_ids, ...componentMethodIds]
    .reduce((state, id) => toggleD078Method(state, id), INITIAL_D078_SELECTION);
  return toggleD078Combination(methods, comboId);
};

describe("D078 method-aware route projection", () => {
  it("orders requirement sections to preserve reviewed cross-lane area workflows", () => {
    const graph = d078GraphDataForTests();
    const examples = [
      [
        "area_enrichment_item:d078-social-research-evaluation-study-question-design",
        "area_enrichment_item:d078-social-research-evaluation-sampling-and-measurement",
      ],
      [
        "area_enrichment_item:d078-computational-digital-social-science-reproducible-data-cleaning",
        "area_enrichment_item:d078-computational-digital-social-science-interpretable-statistical-modeling",
      ],
    ];
    const laneFor = (id: string) => graph.nodes_by_id[id]?.requirement_lane === "conditional" ? "conditional" : "useful";

    for (const [sourceId, targetId] of examples) {
      const edge = graph.typed_relationship_edges.find((candidate) =>
        candidate.sourceId === sourceId && candidate.targetId === targetId
        && candidate.sequenceApproved === true && candidate.sequencePolicy === "workflow",
      );
      expect(edge).toBeTruthy();
      expect(laneFor(sourceId)).toBe("useful");
      expect(laneFor(targetId)).toBe("conditional");
      expect(orderD078RequirementLanesBySequence(
        [sourceId, targetId], laneFor, ["needed", "conditional", "useful"],
      )).toEqual(["useful", "conditional"]);
    }
  });

  it("resolves saved area and combination labels from the route contract", () => {
    expect(d078AreaLabel("D078:social-research-evaluation")).toBe("Social Research and Evaluation");
    expect(d078CombinationLabel("combo:exploratory-sequential")).toBe("Explore first, measure next");
  });

  it("returns foundations and picker catalogues but no downstream rows before a choice", () => {
    const projection = projectD078Route(INITIAL_D078_SELECTION);
    expect(projection.foundations).toHaveLength(3);
    expect(projection.methods).toHaveLength(23);
    expect(projection.combinations).toHaveLength(9);
    expect(projection.visibleAreas).toEqual([]);
    expect(projection.visibleRoles).toEqual([]);
    expect(projection.hiddenBecause).toBe("no_method_selected");
  });

  it("requires relationship evidence before an alternative can suppress another selectable item", () => {
    const unresolvedEvidence = {
      sourceId: "skill:critical-reading",
      targetId: "competency:evidence-appraisal",
      relationship: "alternative_to",
      status: "resolved_ready_for_use",
      sourceResolved: true,
      targetResolved: true,
    };
    expect(isD078SelectableAlternativeEdge(unresolvedEvidence)).toBe(false);
    expect(isD078SelectableAlternativeEdge({
      ...unresolvedEvidence,
      evidenceBasis: "source_backed_alternative_relationship",
      sourceReferences: [{ source_role: "alternative_relationship_evidence", url: "https://example.org/method-evidence" }],
    })).toBe(true);
    expect(isD078SelectableAlternativeEdge({
      ...unresolvedEvidence,
      relationship: "tool_alternative_for_role_task",
      evidenceBasis: "source_backed_role_task_tool_alternative",
      sourceReferences: [{ source_role: "role_task_tool_alternative_evidence", url: "https://example.org/role-tool-evidence" }],
    })).toBe(true);
    expect(isD078SelectableAlternativeEdge({
      ...unresolvedEvidence,
      evidenceBasis: "source_backed_alternative_relationship",
      sourceReferences: [{ source_role: "relationship_evidence", url: "https://example.org/unclassified" }],
    })).toBe(false);
    expect(isD078SelectableAlternativeEdge({
      ...unresolvedEvidence,
      targetResolved: true,
      evidenceBasis: "source_backed_alternative_relationship",
      sourceReferences: [{ source_role: "alternative_relationship_evidence", url: "https://example.org/reviewed" }],
      alternativeReviewDisposition: "unapproved",
      selectable: false,
    })).toBe(false);
    expect(isD078SelectableAlternativeEdge({
      ...unresolvedEvidence,
      targetResolved: true,
      evidenceBasis: "source_backed_alternative_relationship",
      sourceReferences: [{ source_role: "alternative_relationship_evidence", url: "https://example.org/reviewed" }],
      alternativeReviewDisposition: "approved",
      selectable: true,
      routeAvailability: "unavailable_destination",
    })).toBe(false);
  });

  it("retains evidence-backed alternatives across item kinds, not only tool nodes", () => {
    const graph = d078GraphDataForTests();
    const alternatives = graph.typed_relationship_edges.filter((edge) =>
      ["alternative_to", "alternative_tool_option", "tool_alternative_for_role_task"].includes(edge.relationship),
    );
    const evidenceBacked = alternatives.filter(isD078SelectableAlternativeEdge);
    const nonToolAlternative = evidenceBacked.find((edge) =>
      edge.relationship !== "tool_alternative_for_role_task"
      && !isToolNode(graph.nodes_by_id[edge.sourceId])
      && !isToolNode(graph.nodes_by_id[edge.targetId]),
    );
    expect(alternatives).toHaveLength(164);
    expect(evidenceBacked).toHaveLength(164);
    expect(nonToolAlternative).toBeTruthy();
    const nvivoTaguette = evidenceBacked.find((edge) =>
      edge.sourceId === "area_tool_option:d078-a04-tool-nvivo"
      && edge.targetId === "area_tool_option:d078-a04-tool-taguette",
    );
    expect(nvivoTaguette?.explanation).toContain("Taguette focuses on highlighting and tagging text documents");
    expect(nvivoTaguette?.explanation).toContain("NVivo provides a broader set of coding workflows");
    const areaScopedCanonicalTools = evidenceBacked.filter((edge) =>
      edge.relationship === "alternative_tool_option"
      && new Set([edge.sourceId, edge.targetId]).has("domain-item:d078-nvivo-tool")
      && new Set([edge.sourceId, edge.targetId]).has("domain-item:d078-qualitative-coding-tool"),
    ).map((edge) => edge.areaId).sort();
    expect(areaScopedCanonicalTools).toEqual([
      "D078:social-research-evaluation",
      "D078:sociology-social-anthropology",
    ]);
  });

  it("ranks areas and roles by the selected route evidence, not by assumed occupational importance", () => {
    const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    const areaScores = projection.visibleAreas.map((area) => area.taskFamilyIds.length);
    expect(areaScores).toEqual([...areaScores].sort((left, right) => right - left));
    const roleScores = projection.visibleRoles.map((role) => role.supportingMethodIds.length + role.supportingCombinationIds.length);
    expect(roleScores).toEqual([...roleScores].sort((left, right) => right - left));
  });

  it("offers Mesa and Casevo as area-stage choices without a duplicate domain-stage selection", () => {
    const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, "domain-item:d078-agent-based-modeling");
    const projection = projectD078Route(methodSelection);
    const area = projection.visibleAreas.find((entry) => entry.areaId === "D078:computational-digital-social-science");
    const familyId = "area-task:d078-computational-digital-social-science-core-task-family";
    const areaToolIds = new Set(projection.toolIdsByArea["D078:computational-digital-social-science"] ?? []);

    expect(area?.taskFamilyIds).toContain(familyId);
    expect(areaToolIds.has("domain-item:d078-mesa-tool")).toBe(true);
    expect(areaToolIds.has("domain-item:d078-casevo-tool")).toBe(true);
    expect(d078ApplicableLayerItems(2, methodSelection)).not.toContain("domain-item:d078-mesa-tool");
    expect(d078ApplicableLayerItems(2, methodSelection)).not.toContain("domain-item:d078-casevo-tool");
    expect(d078ApplicableLayerItems(3, methodSelection)).not.toContain("domain-item:d078-mesa-tool");
    expect(d078ApplicableLayerItems(3, methodSelection)).not.toContain("domain-item:d078-casevo-tool");
    expect(projection.toolIds).not.toContain("domain-item:d078-mesa-tool");
    expect(projection.toolIds).not.toContain("domain-item:d078-casevo-tool");
    expect(selectableD078ItemIds(projection).has("domain-item:d078-mesa-tool")).toBe(false);
    expect(selectableD078ItemIds(projection).has("domain-item:d078-casevo-tool")).toBe(false);

    const areaSelection = selectD078Area(methodSelection, "D078:computational-digital-social-science");
    const selectable = selectableD078ItemIds(projectD078Route(areaSelection), areaSelection.areaId, areaSelection);
    expect(selectable.has("domain-item:d078-mesa-tool")).toBe(true);
    expect(selectable.has("domain-item:d078-casevo-tool")).toBe(true);
    expect(selectable.has("area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo")).toBe(false);
    const selectedMesa = toggleD078AddedItem(areaSelection, "domain-item:d078-mesa-tool");
    const selectedArea = projectD078Route(selectedMesa).visibleAreas.find((entry) => entry.areaId === areaSelection.areaId);
    expect(selectedArea?.selectedAreaContextFamilyIds).toContain(familyId);
    expect(selectedD078ItemsForTray(projectD078Route(selectedMesa), selectedMesa)).toContainEqual({
      id: "domain-item:d078-mesa-tool", contextLevel: "area",
    });
  });

  it("always permits deselecting a choice after route narrowing removes it from current eligibility", () => {
    const itemId = "area_enrichment_item:d078-econ-time-series-analysis-and-forecasting";
    const selected = { ...INITIAL_D078_SELECTION, addedItemIds: [itemId] };
    const deselected = toggleD078AddedItemWithinRoute(selected, itemId, new Set());
    expect(deselected.addedItemIds).toEqual([]);

    const unselected = toggleD078AddedItemWithinRoute(INITIAL_D078_SELECTION, itemId, new Set());
    expect(unselected.addedItemIds).toEqual([]);
  });

  it("gates the Economics AI/ML task family on its required domain learning choice", () => {
    const economics = "D078:economics-applied-analysis";
    const emergingAiValidation = "domain-emerging:d078-emerging-ai-use-validation-and-provenance";
    const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const baseline = projectD078Route(methodSelection);
    expect(baseline.visibleAreas.find((area) => area.areaId === economics)?.taskFamilyIds).not.toContain("area-task:econ-04");

    const selectedDomainContext = toggleD078AddedItem(methodSelection, emergingAiValidation);
    const contextualProjection = projectD078Route(selectedDomainContext);
    expect(contextualProjection.visibleAreas.find((area) => area.areaId === economics)?.taskFamilyIds).toContain("area-task:econ-04");
  });

  it("makes the graph-backed chi-square technique selectable after quantitative methods", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const projection = projectD078Route(selection);
    expect(projection.domainItemIds).toContain(CHI_SQUARE);
    expect(projectD078Route(toggleD078AddedItem(selection, CHI_SQUARE)).orphanedItemIds).toEqual([]);
  });

  it("exposes the eight emerging candidates only on their reviewed method/area routes", () => {
    const graph = d078GraphDataForTests();
    const candidates = graph.nodes_by_id;
    const quantitative = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE));
    const interviews = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    const abm = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, "domain-item:d078-agent-based-modeling"));
    const itemIds = [
      "domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation",
      "domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation",
      "domain-emerging:d078-emerging-ai-assisted-social-text-annotation",
      "domain-emerging:d078-emerging-ai-social-impact-assessment",
      "domain-emerging:d078-emerging-ai-use-validation-and-provenance",
      "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing",
      "domain-emerging:d078-power-bi-research-reporting-tool",
      "domain-emerging:d078-tableau-research-visualisation-tool",
    ];
    for (const id of itemIds) {
      expect(candidates[id]?.student_visible).toBe(true);
      expect(candidates[id]?.selectable).toBe(true);
      expect(candidates[id]?.skippable).toBe(true);
      expect(candidates[id]?.blocking_policy).toBe("never");
      expect(candidates[id]?.route_display_condition).toBeTruthy();
    }
    expect(quantitative.domainItemIds).toEqual(expect.arrayContaining([
      itemIds[0], itemIds[1], itemIds[4],
    ]));
    expect(quantitative.toolIds).toEqual(expect.arrayContaining([itemIds[6], itemIds[7]]));
    expect(interviews.domainItemIds).toContain(itemIds[2]);
    expect(interviews.domainItemIds).not.toContain(itemIds[5]);
    expect(abm.domainItemIds).toEqual(expect.arrayContaining([itemIds[4], itemIds[5]]));
    expect(candidates[itemIds[5]]?.requirement_scope?.area_ids).not.toContain("D078:sociology-social-anthropology");

    const selected = toggleD078AddedItem(toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE), itemIds[0]);
    expect(selected.addedItemIds).toContain(itemIds[0]);
    expect(projectD078Route(selected).orphanedItemIds).not.toContain(itemIds[0]);
    expect(toggleD078AddedItem(selected, itemIds[0]).addedItemIds).not.toContain(itemIds[0]);
  });

  it("never projects or accepts a route item whose final graph decision is unapproved or hidden", () => {
    const graph = d078GraphDataForTests();
    const routes = [
      ...graph.method_area_routes,
      ...graph.method_area_role_routes,
      ...graph.combination_area_routes,
      ...graph.combination_area_role_routes,
    ] as Array<Record<string, unknown>>;
    const routeItemIds = new Set<string>();
    for (const route of routes) {
      for (const field of [
        "area_item_ids", "task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids",
        "tool_ids", "domain_tool_ids", "role_item_ids", "method_specific_role_item_ids",
      ]) {
        for (const id of (route[field] as string[] | undefined) ?? []) routeItemIds.add(id);
      }
    }

    for (const id of routeItemIds) {
      const node = graph.nodes_by_id[id];
      expect(node).toBeTruthy();
      expect(node?.student_visible).toBe(true);
      expect(node?.student_selectable).not.toBe(false);
      expect(node?.approval).not.toBe("unapproved");
    }

    const retiredPlaceholder = "area-item:d078-human-geography-population:d078-human-geography-population-core-task-family:4:gis-spatial-analysis-only-when-a-spatial-question-supports-it";
    expect(graph.nodes_by_id[retiredPlaceholder]).toBeUndefined();
    expect(graph.nodes_by_id && Object.values(graph.nodes_by_id).some((node) => node.kind === "area_learning_item")).toBe(false);
    const selection = toggleD078Method(INITIAL_D078_SELECTION, "domain-item:d078-spatial-social-analysis");
    const projection = projectD078Route(selection);
    const selectable = selectableD078ItemIds(projection, "D078:human-geography-population", selection);
    expect(selectable.has(retiredPlaceholder)).toBe(false);
    expect(toggleD078AddedItem(selection, retiredPlaceholder).addedItemIds).not.toContain(retiredPlaceholder);
  });

  it("projects quantitative techniques and software as optional choices, without selecting them", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const projection = projectD078Route(selection);
    for (const id of [CHI_SQUARE, T_TESTS, ANOVA, LOGISTIC]) expect(projection.domainItemIds).toContain(id);
    expect(projection.toolIds).toEqual(expect.arrayContaining([
      "domain-item:d078-jasp-tool",
      "domain-item:d078-sas-stat-tool",
      "domain-item:d078-spss-tool",
    ]));
    expect(projection.toolIds).toContain("domain-item:d078-statsmodels");
    expect(projection.methods.filter((method) => method.selected).map((method) => method.id)).toEqual([QUANTITATIVE]);
    expect(projectD078Route(toggleD078AddedItem(selection, ANOVA)).orphanedItemIds).toEqual([]);
  });

  it("keeps CDA, IPA, NLP and supervised ML distinct and route-linked", () => {
    const discourse = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, "domain-item:discourse-and-conversation-analysis"));
    expect(discourse.domainItemIds).toContain(CDA);
    expect(discourse.domainItemIds).toContain(NLP);
    expect(discourse.domainItemIds).not.toContain(IPA);
    expect(discourse.domainItemIds).not.toContain(SUPERVISED_ML);

    const interviews = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    expect(interviews.domainItemIds).toContain(IPA);
    expect(interviews.domainItemIds).not.toContain(CDA);

    const computational = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, "domain-item:d078-computational-social-research"));
    expect(computational.domainItemIds).toEqual(expect.arrayContaining([NLP, SUPERVISED_ML]));
    expect(computational.methods.filter((method) => method.selected).map((method) => method.id))
      .toEqual(["domain-item:d078-computational-social-research"]);
  });

  it("shows economics time-series as an area-owned optional extension on economic routes", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const projection = projectD078Route(selection);
    const economics = "D078:economics-applied-analysis";
    expect(projection.domainItemIds).not.toContain("area_enrichment_item:d078-econ-time-series-analysis-and-forecasting");
    expect(projection.areaItemIdsByArea[economics]).toContain("area_enrichment_item:d078-econ-time-series-analysis-and-forecasting");
    expect(projection.toolIds).toContain("domain-item:d078-eviews-tool");
    expect(projectD078Route(selectD078Area(selection, economics)).areaItemIdsByArea[economics])
      .toContain("area_enrichment_item:d078-econ-time-series-analysis-and-forecasting");
  });

  it("carries area foundations before task choices and gates specialist Economics work on explicit domain selection", () => {
    const graph = d078GraphDataForTests();
    const economics = "D078:economics-applied-analysis";
    const quantitative = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const withoutContext = projectD078Route(quantitative);
    const gatedFamily = "area-task:econ-04";
    const generatedMeasure = "area_enrichment_item:econ-a1";
    const validationItem = "area_enrichment_item:econ-c2";
    const aiValidation = "domain-emerging:d078-emerging-ai-use-validation-and-provenance";

    expect(withoutContext.visibleAreas.find((area) => area.areaId === economics)?.areaFoundationIds)
      .toContain("area-foundation:d078-economics-economic-concepts-and-indicators");
    expect(withoutContext.taskFamilyIdsByArea[economics]).not.toContain(gatedFamily);
    expect(withoutContext.areaItemIdsByArea[economics]).not.toEqual(expect.arrayContaining([generatedMeasure, validationItem]));

    const withContext = projectD078Route(toggleD078AddedItem(quantitative, aiValidation));
    expect(withContext.taskFamilyIdsByArea[economics]).toContain(gatedFamily);
    expect(withContext.areaItemIdsByArea[economics]).toEqual(expect.arrayContaining([generatedMeasure, validationItem]));
    expect(withContext.visibleRoles
      .filter((role) => role.areaId === economics)
      .some((role) => role.taskContexts.some((context) => context.familyId === gatedFamily
        && context.selectionBasis === "selected_domain_learning"))).toBe(true);
    expect(graph.nodes_by_id[gatedFamily]?.required_selected_domain_item_ids).toEqual([aiValidation]);
    expect(graph.area_foundation_contract?.foundations_are_progression_blockers).toBe(false);
    expect(Object.keys(graph.area_foundation_contract?.foundation_ids_by_area ?? {})).toHaveLength(6);
    expect(projectD078Route(quantitative).visibleAreas
      .find((area) => area.areaId === "D078:social-research-evaluation")?.areaFoundationIds).toEqual([]);
  });

  it("offers policy foresight only through Scenario Analysis and its same-area roles", () => {
    const scenarioAnalysis = "domain-item:d078-scenario-analysis";
    const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, scenarioAnalysis));
    const politics = projection.visibleAreas.find((area) => area.areaId === "D078:politics-governance-public-policy");
    expect(politics?.taskFamilyIds).toContain("area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios");
    expect(projection.visibleRoles.map((role) => role.roleId)).toEqual(expect.arrayContaining([
      "role:D078:10:political-scientist",
      "role:D078:7:economic-policy-officer",
    ]));
  });

  it("projects the named combination's declared items and tools without auto-selecting methods", () => {
    const selection = selectDesign(EXPLORATORY);
    const projection = projectD078Route(selection);
    expect(projection.foundations.map((item) => item.id)).toContain("domain-item:d078-evaluate-evidence-and-limits");
    expect(projection.toolIds).toEqual(expect.arrayContaining([
      "domain-item:d078-nvivo-tool",
    ]));
    // A technique that is merely a selectable extension of a component method
    // is not silently promoted into the named design's core route.
    expect(projection.domainItemIds).not.toContain(CHI_SQUARE);
    expect(projection.methods.every((method) => !method.selected)).toBe(true);
    expect(projection.combinations.find((combo) => combo.id === EXPLORATORY)?.selected).toBe(true);

    const explicitlySelectedMethod = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    expect(projectD078Route(explicitlySelectedMethod).domainItemIds).toContain(CHI_SQUARE);
  });

  it("projects each named design only through its declared downstream routes", () => {
    const graph = d078GraphDataForTests();
    expect(graph.combination_designs).toHaveLength(9);
    for (const combo of graph.combination_designs) {
      const projection = projectD078Route(selectDesign(combo.id));
      expect(projection.combinations.find((item) => item.id === combo.id)?.selected).toBe(true);
      expect(projection.methods.every((method) => !method.selected)).toBe(true);
      const routeRows = graph.combination_area_routes.filter((row) => row.combination_id === combo.id);
      for (const route of routeRows) {
        const projectedArea = projection.visibleAreas.find((area) => area.areaId === route.area_id);
        expect(projectedArea).toBeTruthy();
        const declaredItemIds = [
          ...(route.area_item_ids ?? []),
          ...(route.task_linked_domain_item_ids ?? []),
          ...(route.available_item_ids ?? []),
        ];
        // The combination-level domain_downstream_item_ids field is a legacy
        // aggregate of component routes, not an approved combined-design
        // choice list. Only explicit combination items and method-attributed
        // task-linked choices are projected; this prevents (for example) a
        // survey technique such as chi-square from silently becoming part of
        // every survey-containing combined design.
        for (const itemId of declaredItemIds) {
          const itemNode = graph.nodes_by_id[itemId];
          if (isToolNode(itemNode)) {
            expect(projection.toolIds).toContain(itemId);
          } else if (itemId.startsWith("area-item:") || itemId.startsWith("area_enrichment_item:") || itemId.startsWith("area_learning_item:")) {
            expect(projection.areaItemIdsByArea[route.area_id]).toContain(itemId);
          } else {
            expect(projection.domainItemIds).toContain(itemId);
          }
        }
        for (const itemId of [...(route.tool_ids ?? []), ...(route.domain_tool_ids ?? [])]) expect(projection.toolIds).toContain(itemId);
        for (const itemId of route.area_item_ids ?? []) expect(projection.areaItemIdsByArea[route.area_id]).toContain(itemId);
        for (const contribution of route.method_contributions ?? []) {
          const projected = projectedArea?.methodContributions.find((item) => item.methodId === contribution.method_id);
          expect(projected).toBeTruthy();
          expect(projected?.taskFamilyIds).toEqual(contribution.task_family_ids ?? []);
          expect(projected?.itemIds).toEqual(expect.arrayContaining([
            ...(contribution.area_item_ids ?? []),
            ...(contribution.task_linked_domain_item_ids ?? []),
          ]));
          expect(projected?.itemIds).not.toEqual(expect.arrayContaining(contribution.domain_downstream_item_ids ?? []));
        }
      }
    }
  });

  it("matches every single-method area, role, item, tool, and task route declared by the graph", () => {
    const graph = d078GraphDataForTests();
    expect(graph.method_node_ids).toHaveLength(23);
    for (const methodId of graph.method_node_ids) {
      const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, methodId);
      const projection = projectD078Route(methodSelection);
      const areaRows = graph.method_area_routes.filter((row) => row.method_id === methodId);
      const roleRows = graph.method_area_role_routes.filter((row) => row.method_id === methodId);
      const expectedAreas = new Set(areaRows.map((row) => row.area_id));
      const actualAreas = new Set(projection.visibleAreas.map((area) => area.areaId));
      expect(actualAreas).toEqual(expectedAreas);

      const expectedRoles = new Set(roleRows.map((row) => `${row.area_id}::${row.role_id}`));
      const actualRoles = new Set(projection.visibleRoles.map((role) => `${role.areaId}::${role.roleId}`));
      expect(actualRoles).toEqual(expectedRoles);
      expect(projection.visibleAreas.every((area) => area.supportingMethodIds.includes(methodId))).toBe(true);

      for (const route of areaRows) {
        const isAvailableForSelection = (id: string) =>
          graph.nodes_by_id[id]?.student_visible === true
          && graph.nodes_by_id[id]?.student_selectable !== false
          && graph.nodes_by_id[id]?.approval !== "unapproved"
          && (graph.nodes_by_id[id]?.required_selected_domain_item_ids ?? [])
            .every((requiredId: string) => methodSelection.addedItemIds.includes(requiredId));
        const expectedTaskFamilies = (route.task_family_ids ?? []).filter((familyId) =>
          isAvailableForSelection(familyId),
        );
        expect(projection.taskFamilyIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(expectedTaskFamilies));
        for (const familyId of route.task_family_ids ?? []) {
          if (!expectedTaskFamilies.includes(familyId)) {
            expect(projection.taskFamilyIdsByArea[route.area_id] ?? []).not.toContain(familyId);
          }
        }
        const expectedAreaItems = (route.area_item_ids ?? []).filter(isAvailableForSelection);
        expect(projection.areaItemIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(expectedAreaItems));
        expect(projection.explanatoryItemIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(
          (route.explanatory_item_ids ?? []).filter(isAvailableForSelection),
        ));
        const declared = [
          ...(route.task_linked_domain_item_ids ?? []),
          ...(route.available_item_ids ?? []),
          ...(route.domain_downstream_item_ids ?? []),
        ];
        for (const id of declared) {
          if (!isAvailableForSelection(id)) continue;
          const node = graph.nodes_by_id[id];
          if (isToolNode(node)) {
            expect(projection.toolIds).toContain(id);
          } else if (id.startsWith("area-item:") || id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) {
            expect(projection.areaItemIdsByArea[route.area_id] ?? []).toContain(id);
          } else {
            expect(projection.domainItemIds).toContain(id);
          }
        }
        for (const id of [...(route.tool_ids ?? []), ...(route.domain_tool_ids ?? [])]) {
          if (!isAvailableForSelection(id)) continue;
          if (graph.nodes_by_id[id]?.display_stage === "area") {
            expect(projection.toolIdsByArea[route.area_id] ?? []).toContain(id);
            expect(projection.toolIds).not.toContain(id);
          } else {
            expect(projection.toolIds).toContain(id);
          }
        }
      }

      for (const route of roleRows) {
        const visibleRole = projection.visibleRoles.find((role) => role.areaId === route.area_id && role.roleId === route.role_id);
        expect(visibleRole).toBeTruthy();
        expect(visibleRole?.fitClaim).toBe("not_inferred_from_area_membership");
      }
    }
  });

  it("allows graph-declared area-specific downstream items to be added and removed on their route", () => {
    const graph = d078GraphDataForTests();
    let exercised = 0;
    for (const methodId of graph.method_node_ids) {
      const route = graph.method_area_routes.find((row) => row.method_id === methodId && [
        ...(row.task_linked_domain_item_ids ?? []),
        ...(row.available_item_ids ?? []),
        ...(row.domain_downstream_item_ids ?? []),
      ].some((id) => id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")));
      if (!route) continue;
      const candidate = [
        ...(route.task_linked_domain_item_ids ?? []),
        ...(route.available_item_ids ?? []),
        ...(route.domain_downstream_item_ids ?? []),
      ].find((id) => (id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:"))
        && (projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, methodId)).areaItemIdsByArea[route.area_id] ?? []).includes(id));
      if (!candidate) continue;

      const selection = selectD078Area(toggleD078Method(INITIAL_D078_SELECTION, methodId), route.area_id);
      const added = toggleD078AddedItem(selection, candidate);
      expect(added.addedItemIds).toContain(candidate);
      expect(projectD078Route(added).orphanedItemIds).not.toContain(candidate);
      expect(toggleD078AddedItem(added, candidate).addedItemIds).not.toContain(candidate);
      exercised += 1;
    }
    expect(exercised).toBeGreaterThan(0);
  });

  it("projects every combination's declared area and role routes without crossing unrelated method routes", () => {
    const graph = d078GraphDataForTests();
    expect(graph.combination_designs).toHaveLength(9);
    for (const combo of graph.combination_designs) {
      const projection = projectD078Route(selectDesign(combo.id));
      const explicitAreaRows = graph.combination_area_routes.filter((row) => row.combination_id === combo.id);
      const expectedAreaIds = new Set(explicitAreaRows.length
        ? explicitAreaRows.map((row) => row.area_id)
        : graph.method_area_routes
          .filter((row) => [combo.required_method_ids[0], combo.selectable_component_method_ids[0]].includes(row.method_id))
          .map((row) => row.area_id)
          .filter((areaId) => [combo.required_method_ids[0], combo.selectable_component_method_ids[0]].every((methodId) =>
            graph.method_area_routes.some((row) => row.method_id === methodId && row.area_id === areaId))));
      expect(new Set(projection.visibleAreas.map((area) => area.areaId))).toEqual(expectedAreaIds);

      const explicitRoleRows = graph.combination_area_role_routes.filter((row) => row.combination_id === combo.id);
      const expectedRoleKeys = new Set(explicitAreaRows.length
        ? [
          ...explicitRoleRows.map((row) => `${row.area_id}::${row.role_id}`),
          ...explicitAreaRows.flatMap((row) => (row.role_ids ?? []).map((roleId) => `${row.area_id}::${roleId}`)),
        ]
        : graph.method_area_role_routes
          .filter((row) => [combo.required_method_ids[0], combo.selectable_component_method_ids[0]].includes(row.method_id) && expectedAreaIds.has(row.area_id))
          .map((row) => `${row.area_id}::${row.role_id}`));
      const actualRoleKeys = new Set(projection.visibleRoles.map((role) => `${role.areaId}::${role.roleId}`));
      expect(actualRoleKeys).toEqual(expectedRoleKeys);

      for (const route of explicitAreaRows) {
        expect(projection.taskFamilyIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(route.task_family_ids ?? []));
        expect(projection.areaItemIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(route.area_item_ids ?? []));
        expect(projection.explanatoryItemIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(route.explanatory_item_ids ?? []));
        for (const id of [...(route.tool_ids ?? []), ...(route.domain_tool_ids ?? [])]) expect(projection.toolIds).toContain(id);
        for (const contribution of route.method_contributions ?? []) {
          for (const field of ["area_item_ids", "task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids"] as const) {
            for (const id of contribution[field] ?? []) {
              expectRouteItemProjected(graph, projection, selectDesign(combo.id), route.area_id, id);
            }
          }
          for (const id of [...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])]) {
            expectRouteItemProjected(graph, projection, selectDesign(combo.id), route.area_id, id);
          }
          const contributionCard = projection.visibleAreas.find((area) => area.areaId === route.area_id)
            ?.methodContributions.find((entry) => entry.methodId === contribution.method_id);
          expect(contributionCard).toBeTruthy();
          expect(contributionCard?.itemIds).toEqual(expect.arrayContaining([
            ...(contribution.area_item_ids ?? []),
            ...(contribution.task_linked_domain_item_ids ?? []),
            ...(contribution.available_item_ids ?? []),
            ...(contribution.domain_downstream_item_ids ?? []),
          ].filter((id) => {
            const item = graph.nodes_by_id[id];
            return item?.student_visible === true && item.student_selectable !== false && item.approval !== "unapproved"
              && (!Array.isArray(item.required_selected_domain_item_ids)
                || item.required_selected_domain_item_ids.every((requiredId) => selectDesign(combo.id).addedItemIds.includes(String(requiredId))));
          })));
        }
      }
    }
  });

  it("projects every eligible item and tool declared by every single-method area route", () => {
    const graph = d078GraphDataForTests();
    for (const methodId of graph.method_node_ids) {
      const selection = toggleD078Method(INITIAL_D078_SELECTION, methodId);
      const projection = projectD078Route(selection);
      const methodRoutes = graph.method_area_routes.filter((route) => route.method_id === methodId);
      expect(projection.visibleAreas.map((area) => area.areaId)).toEqual(expect.arrayContaining(methodRoutes.map((route) => route.area_id)));
      for (const route of methodRoutes) {
        for (const field of ["area_item_ids", "task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids"] as const) {
          for (const id of route[field] ?? []) expectRouteItemProjected(graph, projection, selection, route.area_id, id);
        }
        for (const id of [...(route.tool_ids ?? []), ...(route.domain_tool_ids ?? [])]) {
          expectRouteItemProjected(graph, projection, selection, route.area_id, id);
        }
      }
    }
  });

  it("projects all 15 exact Participatory component variants without dropping contribution items or borrowing sibling variants", () => {
    const graph = d078GraphDataForTests();
    const design = graph.combination_designs.find((row) => row.id === PARTICIPATORY)!;
    expect(design.component_route_variants).toHaveLength(15);
    for (const variant of design.component_route_variants ?? []) {
      const selection = selectDesignVariant(design.id, variant.selected_component_method_ids);
      expect(selection.methodIds).toEqual([]);
      expect(new Set(selection.componentMethodIds[design.id])).toEqual(new Set(variant.selected_component_method_ids));
      const projection = projectD078Route(selection);
      expect(new Set(projection.visibleAreas.map((area) => area.areaId)))
        .toEqual(new Set(variant.area_routes.map((route) => route.area_id)));
      for (const route of variant.area_routes) {
        for (const contribution of route.method_contributions) {
          for (const field of ["area_item_ids", "task_linked_domain_item_ids", "available_item_ids", "domain_downstream_item_ids"] as const) {
            for (const id of contribution[field] ?? []) {
              expectRouteItemProjected(graph, projection, selection, route.area_id, id);
            }
          }
          for (const id of [...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? [])]) {
            expectRouteItemProjected(graph, projection, selection, route.area_id, id);
          }
        }
      }
      for (const sibling of design.component_route_variants ?? []) {
        if (sibling.id === variant.id) continue;
        const siblingAreaIds = new Set(sibling.area_routes.map((route) => route.area_id));
        expect(projection.visibleAreas.some((area) => siblingAreaIds.has(area.areaId))).toBe(
          variant.area_routes.some((route) => siblingAreaIds.has(route.area_id)),
        );
      }
    }
  });

  it("exposes the approved thematic/codebook area item on relevant Sociology method routes", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const sociology = selectD078Area(selection, "D078:sociology-social-anthropology");
    const projection = projectD078Route(sociology);
    expect(projection.areaItemIdsByArea[sociology.areaId!]).toContain(THEMATIC_CODEBOOK);
    expect(projectD078Route(toggleD078AddedItem(sociology, THEMATIC_CODEBOOK)).orphanedItemIds).toEqual([]);
  });

  it("uses only an explicit combination route unless a member method is separately selected", () => {
    const combination = selectDesign("combo:document-and-interview-elicitation");
    const selection = selectD078Area(combination, "D078:sociology-social-anthropology");
    const combinationOnly = projectD078Route(selection);
    expect(combinationOnly.methods.every((method) => !method.selected)).toBe(true);
    expect(combinationOnly.foundations.map((item) => item.id)).toContain("domain-item:d078-evaluate-evidence-and-limits");
    expect(combinationOnly.toolIds).toContain("domain-item:d078-nvivo-tool");
    const interviewContribution = combinationOnly.visibleAreas
      .find((area) => area.areaId === selection.areaId)?.methodContributions
      .find((item) => item.methodId === INTERVIEWS);
    expect(interviewContribution?.itemIds).toContain(THEMATIC_CODEBOOK);

    const explicitlySelectedMethod = toggleD078Method(combination, INTERVIEWS);
    const withMethodRoute = projectD078Route(selectD078Area(explicitlySelectedMethod, "D078:sociology-social-anthropology"));
    expect(withMethodRoute.methods.find((method) => method.id === INTERVIEWS)?.selected).toBe(true);
    expect(withMethodRoute.areaItemIdsByArea[selection.areaId!]).toContain(THEMATIC_CODEBOOK);
  });

  it("shows only the four areas evidenced for Interviews", () => {
    const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    expect(sortedAreas(projection.visibleAreas.map((area) => area.areaId))).toEqual(sortedAreas([
      "D078:politics-governance-public-policy",
      "D078:psychology-social-behaviour",
      "D078:social-research-evaluation",
      "D078:sociology-social-anthropology",
    ]));
  });

  it("filters area learning and reveals only graph-linked role context for a selected task family", () => {
    const areaId = "D078:sociology-social-anthropology";
    const familyId = "area-task:d078-social-anthro-qualitative-and-mixed-analysis";
    const generalSelection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const generalProjection = projectD078Route(generalSelection);
    const generalAreaItems = generalProjection.areaItemIdsByArea[areaId];
    expect(generalAreaItems.length).toBeGreaterThan(0);

    const focusedSelection = toggleD078TaskFamily(generalSelection, areaId, familyId);
    expect(focusedSelection.taskFamilyIdsByArea?.[areaId]).toEqual([familyId]);
    const focusedProjection = projectD078Route(focusedSelection);
    const graph = d078GraphDataForTests();
    const linkedAreaItems = graph.typed_relationship_edges
      .filter((edge) => edge.relationship === "task_has_area_learning_item"
        && edge.status === "resolved_ready_for_use"
        && edge.sourceId === familyId)
      .map((edge) => edge.targetId)
      .filter((id) => generalAreaItems.includes(id));
    expect(focusedProjection.areaItemIdsByArea[areaId]).toEqual([...new Set(linkedAreaItems)]);
    expect(focusedProjection.areaItemIdsByArea[areaId].length).toBeGreaterThan(0);

    const anthropologistId = "role:D078:19:anthropologist";
    const anthropologist = focusedProjection.visibleRoles.find((role) => role.roleId === anthropologistId && role.areaId === areaId);
    expect(anthropologist?.taskContexts.map((context) => context.familyId)).toContain(familyId);
    expect(anthropologist?.taskContexts.every((context) => context.familyId === familyId)).toBe(true);
    expect(anthropologist?.taskContexts.every((context) => Boolean(context.explanation))).toBe(true);

    const restoredSelection = toggleD078TaskFamily(focusedSelection, areaId, familyId);
    const restoredProjection = projectD078Route(restoredSelection);
    expect(restoredProjection.areaItemIdsByArea[areaId]).toEqual(generalAreaItems);
    expect(restoredProjection.visibleRoles.find((role) => role.roleId === anthropologistId && role.areaId === areaId)?.taskContexts)
      .toEqual(expect.arrayContaining([expect.objectContaining({ selectionBasis: "method_route" })]));
  });

  it("combines multiple selected task families into one deduplicated area path while preserving each role context", () => {
    const areaId = "D078:sociology-social-anthropology";
    const familyIds = [
      "area-task:d078-social-anthro-qualitative-and-mixed-analysis",
      "area-task:d078-social-anthro-fieldwork-and-community-evidence",
    ];
    const graph = d078GraphDataForTests();
    const base = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const areaSelection = selectD078Area(base, areaId);
    const selected = familyIds.reduce((state, id) => toggleD078TaskFamily(state, areaId, id), areaSelection);
    expect(selected.taskFamilyIdsByArea?.[areaId]).toEqual(familyIds);

    const projection = projectD078Route(selected);
    const generalItems = projectD078Route(areaSelection).areaItemIdsByArea[areaId];
    const acceptedEvidence: Record<string, string[]> = {
      reviewed_area_task_item_synthesis: ["area_task_evidence", "area_item_evidence"],
      official_casevo_project_and_paper_plus_existing_abm_area_route: ["tool_capability_evidence", "area_task_route_context"],
      reviewed_peer_method_paper_and_project_learning_material: ["area_item_evidence", "task_specific_learning_resource"],
      reviewed_canonical_domain_tool_area_context: ["domain_item_evidence", "area_task_evidence"],
    };
    const reviewedAreaEdges = graph.typed_relationship_edges.filter((edge) => {
      const target = graph.nodes_by_id[edge.targetId];
      const sourceRoles = acceptedEvidence[edge.evidenceBasis ?? ""] ?? [];
      return edge.relationship === "task_has_area_learning_item"
        && edge.status === "resolved_ready_for_use"
        && sourceRoles.length > 0
        && target?.area_id === areaId
        && target.student_visible === true
        && target.student_selectable !== false
        && target.approval !== "unapproved"
        && edge.sourceReferences?.some((ref) => sourceRoles.includes(String(ref.source_role ?? ""))
          && Boolean(String(ref.url ?? "").trim() || String(ref.locator ?? "").trim()));
    });
    const linkedItemIds = reviewedAreaEdges
      .filter((edge) => familyIds.includes(edge.sourceId))
      .map((edge) => edge.targetId)
      .filter((id) => generalItems.includes(id));
    const allRouteLinkedIds = new Set(reviewedAreaEdges.map((edge) => edge.targetId));
    const generalUnlinkedIds = generalItems.filter((id) => !allRouteLinkedIds.has(id));
    expect(sortedAreas(projection.areaItemIdsByArea[areaId])).toEqual(sortedAreas([...new Set([...linkedItemIds, ...generalUnlinkedIds])]));

    const anthropologist = projection.visibleRoles.find((role) => role.roleId === "role:D078:19:anthropologist" && role.areaId === areaId);
    expect(anthropologist?.taskContexts.map((context) => context.familyId)).toEqual(expect.arrayContaining(familyIds));
    expect(anthropologist?.taskContexts.every((context) => context.selectionBasis === "selected_work_focus")).toBe(true);
    expect(anthropologist?.contextualRoleItemIds).toEqual([...new Set(anthropologist?.taskContexts.flatMap((context) => context.roleItemIds) ?? [])]);
  });

  it("preserves baseline context and applies only the reconciled domain and area task links", () => {
    const graph = d078GraphDataForTests();
    const relation = graph.typed_relationship_edges;
    const linkedRoleIds = (familyId: string) => relation
      .filter((edge) => edge.relationship === "area_task_family_supports_role_task" && edge.sourceId === familyId)
      .map((edge) => graph.nodes_by_id[edge.targetId]?.role_id)
      .filter((id): id is string => typeof id === "string");
    const route = graph.method_area_routes.find((candidate) =>
      (candidate.task_family_ids ?? []).some((familyId) =>
        linkedRoleIds(familyId).some((roleId) => graph.method_area_role_routes.some((roleRoute) =>
          roleRoute.method_id === candidate.method_id && roleRoute.area_id === candidate.area_id && roleRoute.role_id === roleId,
        ))
        && relation.some((edge) => edge.relationship === "domain_item_supports_area_task"
          && edge.targetId === familyId
          && [...(candidate.domain_downstream_item_ids ?? []), ...(candidate.available_item_ids ?? []), ...(candidate.task_linked_domain_item_ids ?? [])].includes(edge.sourceId)),
      ),
    );
    expect(route).toBeTruthy();
    const familyId = route!.task_family_ids.find((id) =>
      linkedRoleIds(id).some((roleId) => graph.method_area_role_routes.some((roleRoute) =>
        roleRoute.method_id === route!.method_id && roleRoute.area_id === route!.area_id && roleRoute.role_id === roleId,
      ))
      && relation.some((edge) => edge.relationship === "domain_item_supports_area_task" && edge.targetId === id),
    )!;
    const domainEdge = relation.find((edge) => edge.relationship === "domain_item_supports_area_task" && edge.targetId === familyId)!;
    const areaId = route!.area_id;
    const roleId = linkedRoleIds(familyId).find((id) => graph.method_area_role_routes.some((roleRoute) =>
      roleRoute.method_id === route!.method_id && roleRoute.area_id === areaId && roleRoute.role_id === id,
    ))!;

    const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, route!.method_id);
    const baseline = projectD078Route(selectD078Area(methodSelection, areaId));
    const baselineRole = baseline.visibleRoles.find((role) => role.roleId === roleId && role.areaId === areaId);
    expect(baselineRole?.taskContexts).toEqual(expect.arrayContaining([
      expect.objectContaining({ familyId, selectionBasis: "method_route" }),
    ]));

    const domainSelected = projectD078Route(selectD078Area({
      ...methodSelection,
      addedItemIds: [domainEdge.sourceId],
    }, areaId));
    expect(domainSelected.visibleAreas.map((area) => area.areaId).sort()).toEqual(baseline.visibleAreas.map((area) => area.areaId).sort());
    expect(domainSelected.visibleRoles.map((role) => role.roleId).sort()).toEqual(baseline.visibleRoles.map((role) => role.roleId).sort());
    expect(domainSelected.visibleAreas.find((area) => area.areaId === areaId)?.selectedDomainContextFamilyIds).toContain(familyId);
    const selectedArea = domainSelected.visibleAreas.find((area) => area.areaId === areaId)!;
    const areaItemsForSelectedContext = selectedArea.areaItemIdsByTaskFamily[familyId] ?? [];
    expect(areaItemsForSelectedContext.length).toBeGreaterThan(0);
    expect(areaItemsForSelectedContext.every((id) => domainSelected.areaItemIdsByArea[areaId].includes(id))).toBe(true);
    expect(domainSelected.visibleRoles.find((role) => role.roleId === roleId && role.areaId === areaId)?.taskContexts)
      .toEqual(expect.arrayContaining([expect.objectContaining({ familyId, selectionBasis: "selected_domain_learning" })]));

    const areaItemEdge = relation.find((edge) => edge.relationship === "task_has_area_learning_item"
      && edge.sourceId === familyId
      && (route!.area_item_ids ?? []).includes(edge.targetId));
    expect(areaItemEdge).toBeTruthy();
    const areaSelected = projectD078Route(selectD078Area({
      ...methodSelection,
      addedItemIds: [areaItemEdge!.targetId],
    }, areaId));
    expect(areaSelected.visibleRoles.map((role) => role.roleId).sort()).toEqual(baseline.visibleRoles.map((role) => role.roleId).sort());
    expect(areaSelected.visibleRoles.find((role) => role.roleId === roleId && role.areaId === areaId)?.taskContexts)
      .toEqual(expect.arrayContaining([expect.objectContaining({ familyId, selectionBasis: "selected_area_learning" })]));
  });

  it("carries the reviewed Geographical Random Forest area-item link into matching role-task context", () => {
    const areaId = "D078:human-geography-population";
    const familyId = "area-task:d078-human-geography-population-spatial-patterns";
    const itemId = "area_enrichment_item:d078-human-geography-geographical-random-forest";
    const areaSelection = selectD078Area(toggleD078Method(INITIAL_D078_SELECTION, SPATIAL), areaId);
    const baseline = projectD078Route(areaSelection);
    expect(baseline.areaItemIdsByArea[areaId]).toContain(itemId);

    const selected = projectD078Route(toggleD078AddedItem(areaSelection, itemId));
    for (const roleId of ["role:D078:22:geographer", "role:D078:24:demographer"]) {
      const role = selected.visibleRoles.find((candidate) => candidate.roleId === roleId && candidate.areaId === areaId);
      expect(role?.taskContexts).toEqual(expect.arrayContaining([
        expect.objectContaining({ familyId, selectionBasis: "selected_area_learning" }),
      ]));
    }
  });

  it("keeps route-backed role work visible when the learner selects no optional area focus", () => {
    const graph = d078GraphDataForTests();
    const relation = graph.typed_relationship_edges;
    const route = graph.method_area_routes.find((candidate) =>
      (candidate.task_family_ids ?? []).some((familyId) =>
        relation.filter((edge) => edge.relationship === "area_task_family_supports_role_task" && edge.sourceId === familyId)
          .some((edge) => graph.nodes_by_id[edge.targetId]?.role_id && graph.method_area_role_routes.some((roleRoute) =>
            roleRoute.method_id === candidate.method_id && roleRoute.area_id === candidate.area_id
              && roleRoute.role_id === graph.nodes_by_id[edge.targetId]?.role_id,
          )),
      ),
    );
    expect(route).toBeTruthy();
    const familyId = route!.task_family_ids.find((id) =>
      relation.filter((edge) => edge.relationship === "area_task_family_supports_role_task" && edge.sourceId === id)
        .some((edge) => graph.method_area_role_routes.some((roleRoute) =>
          roleRoute.method_id === route!.method_id && roleRoute.area_id === route!.area_id
            && roleRoute.role_id === graph.nodes_by_id[edge.targetId]?.role_id,
        )),
    )!;
    const roleTaskEdge = relation.find((edge) => edge.relationship === "area_task_family_supports_role_task"
      && edge.sourceId === familyId
      && graph.method_area_role_routes.some((roleRoute) => roleRoute.method_id === route!.method_id
        && roleRoute.area_id === route!.area_id
        && roleRoute.role_id === graph.nodes_by_id[edge.targetId]?.role_id));
    const roleId = graph.nodes_by_id[roleTaskEdge!.targetId].role_id;
    const selection = selectD078Area(toggleD078Method(INITIAL_D078_SELECTION, route!.method_id), route!.area_id);
    const projection = projectD078Route(selection);
    const role = projection.visibleRoles.find((entry) => entry.roleId === roleId && entry.areaId === route!.area_id);
    expect(role?.taskContexts).toEqual(expect.arrayContaining([
      expect.objectContaining({ familyId, selectionBasis: "method_route" }),
    ]));
  });

  it("carries source-backed role work contexts through every declared single and named-combination route", () => {
    const graph = d078GraphDataForTests();
    const relation = graph.typed_relationship_edges;
    const isRoleTaskEvidenceBacked = (edge: typeof relation[number]) =>
      edge.relationship === "area_task_family_supports_role_task"
      && edge.status === "resolved_ready_for_use"
      && edge.evidenceBasis === "reviewed_cross_source_task_scope_synthesis"
      && (edge.sourceReferences ?? []).some((reference) => reference.source_role === "authoritative_work_sources" && Boolean(reference.url))
      && (edge.sourceReferences ?? []).some((reference) => ["evidence", "explanatory_sources", "authoritative_work_source_ids", "explanatory_source_ids"].includes(String(reference.source_role ?? "")));
    const verifyRouteContext = (selection: typeof INITIAL_D078_SELECTION, areaId: string, familyIds: string[], roleIds: string[]) => {
      const projection = projectD078Route(selectD078Area(selection, areaId));
      const eligibleFamilyIds = familyIds.filter((familyId) =>
        (graph.nodes_by_id[familyId]?.required_selected_domain_item_ids ?? [])
          .every((requiredId: string) => selection.addedItemIds.includes(requiredId)),
      );
      for (const familyId of eligibleFamilyIds) {
        for (const edge of relation.filter((candidate) => isRoleTaskEvidenceBacked(candidate) && candidate.sourceId === familyId)) {
          const roleTask = graph.nodes_by_id[edge.targetId];
          if (!roleTask?.role_id || !roleIds.includes(roleTask.role_id)) continue;
          expect(projection.visibleRoles.find((role) => role.roleId === roleTask.role_id && role.areaId === areaId)?.taskContexts)
            .toEqual(expect.arrayContaining([expect.objectContaining({ familyId, selectionBasis: "method_route" })]));
        }
      }
    };

    for (const methodId of graph.method_node_ids) {
      const selection = toggleD078Method(INITIAL_D078_SELECTION, methodId);
      for (const route of graph.method_area_routes.filter((candidate) => candidate.method_id === methodId)) {
        const roleIds = graph.method_area_role_routes.filter((candidate) => candidate.method_id === methodId && candidate.area_id === route.area_id).map((candidate) => candidate.role_id);
        verifyRouteContext(selection, route.area_id, route.task_family_ids, roleIds);
      }
    }
    for (const design of graph.combination_designs) {
      const selection = selectDesign(design.id);
      for (const route of graph.combination_area_routes.filter((candidate) => candidate.combination_id === design.id)) {
        const familyIds = (route.method_contributions ?? []).flatMap((contribution) => contribution.task_family_ids ?? []);
        verifyRouteContext(selection, route.area_id, familyIds, route.role_ids ?? []);
      }
    }
  });

  it("shows only Computational and Human Geography for Spatial analysis", () => {
    const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, SPATIAL));
    expect(sortedAreas(projection.visibleAreas.map((area) => area.areaId))).toEqual(sortedAreas([
      "D078:computational-digital-social-science",
      "D078:human-geography-population",
    ]));
  });

  it("holds downstream until a multi-method selection resolves to a named design", () => {
    const selection = toggleD078Method(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS), SPATIAL);
    const projection = projectD078Route(selection);
    expect(projection.visibleAreas).toEqual([]);
    expect(projection.hiddenBecause).toBe("unsupported_method_combination");
    expect(projection.combinations.find((combo) => combo.id === INTERVIEW_OBSERVATION)?.selected).toBe(false);
  });

  it("reveals graph-supported combined designs from a single selected method and restores components when backing out", () => {
    const singleInterview = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    expect(singleInterview.combinations.filter((combo) => combo.matchStatus === "partial").map((combo) => combo.id)).toEqual(expect.arrayContaining([
      "combo:explanatory-sequential",
      "combo:convergent-survey-interview",
      "combo:interview-and-observation",
      "combo:document-and-interview-elicitation",
    ]));

    const pair = toggleD078Method(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS), SURVEY);
    const chosen = toggleD078Combination(pair, "combo:convergent-survey-interview");
    expect(chosen.methodIds).toEqual([]);
    expect(projectD078Route(chosen).visibleAreas.length).toBeGreaterThan(0);
    const changed = toggleD078Combination(chosen, "combo:convergent-survey-interview");
    expect(new Set(changed.methodIds)).toEqual(new Set([INTERVIEWS, SURVEY]));
    expect(changed.combinationIds).toEqual([]);
    expect(projectD078Route(changed).visibleAreas).toEqual([]);
  });

  it("uses the named interview-and-observation design's own five area routes", () => {
    const selection = selectDesign(INTERVIEW_OBSERVATION);
    const projection = projectD078Route(selection);
    expect(projection.visibleAreas).toHaveLength(3);
    expect(projection.visibleAreas.map((area) => area.areaId)).not.toContain("D078:computational-digital-social-science");
    expect(projection.visibleAreas.map((area) => area.areaId)).not.toContain("D078:economics-applied-analysis");
    expect(projection.methods.every((method) => !method.selected)).toBe(true);
  });

  it("expands only the required participatory method until optional components are selected", () => {
    const design = selectDesign(PARTICIPATORY);
    const required = projectD078Route(design);
    expect(required.visibleAreas.length).toBeLessThanOrEqual(
      projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, "domain-item:participatory-and-action-research"))
        .visibleAreas.length,
    );
    expect(required.methods.every((method) => !method.selected)).toBe(true);

    const withSurvey = toggleD078ComponentMethod(design, PARTICIPATORY, SURVEY);
    const expanded = projectD078Route(withSurvey);
    expect(expanded.visibleAreas.map((area) => area.areaId)).not.toContain("D078:computational-digital-social-science");
    expect(expanded.combinations.find((combo) => combo.id === PARTICIPATORY)?.selectedComponentMethodIds).toContain(SURVEY);
    const withoutSurvey = projectD078Route(toggleD078ComponentMethod(withSurvey, PARTICIPATORY, SURVEY));
    expect(withoutSurvey.visibleAreas.map((area) => area.areaId)).not.toContain("D078:computational-digital-social-science");
  });

  it("projects only shared areas/roles for methods explicitly selected in the participatory design", () => {
    const graph = d078GraphDataForTests();
    const design = graph.combination_designs.find((combo) => combo.id === PARTICIPATORY)!;
    const components = design.selectable_component_method_ids;
    expect(components).toHaveLength(4);
    expect(design.component_route_variants).toHaveLength(15);
    for (let mask = 0; mask < 2 ** components.length; mask += 1) {
      const selectedComponents = components.filter((_, index) => (mask & (1 << index)) !== 0);
      if (!selectedComponents.length) continue;
      const selectedMethods = [design.required_method_ids[0], ...selectedComponents]
        .reduce((state, id) => toggleD078Method(state, id), INITIAL_D078_SELECTION);
      let selection = toggleD078Combination(selectedMethods, PARTICIPATORY);
      const projection = projectD078Route(selection);
      const activeMethods = new Set([...design.required_method_ids, ...selectedComponents]);
      const variant = design.component_route_variants!.find((entry) =>
        [...entry.selected_component_method_ids].sort().join("|") === [...selectedComponents].sort().join("|"));
      expect(variant).toBeTruthy();
      const expectedAreaIds = new Set(variant!.area_routes.map((route) => route.area_id));
      const expectedRoleKeys = new Set(variant!.area_routes.flatMap((route) =>
        route.role_ids.map((roleId) => `${route.area_id}::${roleId}`)));
      expect(new Set(projection.visibleAreas.map((area) => area.areaId))).toEqual(expectedAreaIds);
      expect(new Set(projection.visibleRoles.map((role) => `${role.areaId}::${role.roleId}`))).toEqual(expectedRoleKeys);
      for (const route of variant!.area_routes) {
        const projected = projection.visibleAreas.find((area) => area.areaId === route.area_id)!;
        expect(new Set(projected.supportingMethodIds)).toEqual(activeMethods);
        for (const contribution of route.method_contributions) {
          const shown = projected.methodContributions.find((entry) => entry.methodId === contribution.method_id);
          expect(shown).toBeTruthy();
          expect(shown?.itemIds).toEqual(expect.arrayContaining([
            ...(contribution.area_item_ids ?? []),
            ...(contribution.task_linked_domain_item_ids ?? []),
            ...(contribution.available_item_ids ?? []),
          ]));
          expect(shown?.toolIds).toEqual(expect.arrayContaining([
            ...(contribution.tool_ids ?? []), ...(contribution.domain_tool_ids ?? []),
          ]));
        }
      }
      expect(projection.methods.every((method) => !method.selected)).toBe(true);
      expect(projection.combinations.find((combo) => combo.id === PARTICIPATORY)?.selectedComponentMethodIds)
        .toEqual(selectedComponents);
    }
  });

  it("clears an area or role when its last supporting selection is removed", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    selection = selectD078Area(selection, "D078:sociology-social-anthropology");
    const role = projectD078Route(selection).visibleRoles.find((item) => item.areaId === selection.areaId);
    expect(role).toBeTruthy();
    selection = selectD078Role(selection, role!.roleId);
    expect(projectD078Route(selection).roleItemIds.length).toBeGreaterThan(0);
    const deselected = toggleD078Method(selection, INTERVIEWS);
    const projection = projectD078Route(deselected);
    expect(projection.requestedAreaHidden).toBe(false);
    expect(projection.requestedRoleHidden).toBe(false);
    expect(deselected.areaId).toBeUndefined();
    expect(deselected.roleId).toBeUndefined();
  });

  it("keeps roles outside a hidden area out of the projected path", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    selection = selectD078Area(selection, "D078:sociology-social-anthropology");
    const role = projectD078Route(selection).visibleRoles.find((item) => item.areaId === selection.areaId);
    expect(role).toBeTruthy();
    selection = selectD078Role(selection, role!.roleId);
    const hidden = projectD078Route(toggleD078Method(selection, INTERVIEWS));
    expect(hidden.visibleAreas).toEqual([]);
    expect(hidden.visibleRoles.some((entry) => entry.roleId === role!.roleId)).toBe(false);
    expect(hidden.roleItemIds).toEqual([]);
  });

  it("does not expose role items until the learner opens that role", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const projection = projectD078Route(selection);
    expect(projection.roleItemIds).toEqual([]);
    expect(projection.methodSpecificRoleItemIds).toEqual([]);
    expect(projection.roleToolIds).toEqual([]);
  });

  it("integrates individually eligible role-owned items into method and combined role routes", () => {
    const graph = d078GraphDataForTests();
    const allRoleRoutes = [
      ...graph.method_area_role_routes,
      ...graph.combination_area_role_routes,
    ];
    const roleIds = new Set(allRoleRoutes.map((route) => route.role_id));

    expect(roleIds.size).toBe(19);
    expect(allRoleRoutes.length).toBeGreaterThan(500);
    for (const route of allRoleRoutes) {
      expect(route.role_item_ids.length).toBeGreaterThan(0);
      expect(route.method_specific_role_item_ids).toEqual([]);
      for (const id of route.role_item_ids) {
        const item = graph.nodes_by_id[id];
        expect(item).toBeTruthy();
        expect(item?.kind).toBe("role_item_candidate");
        expect(item?.student_visible).toBe(true);
        expect(item?.student_display_approved).toBe(true);
      }
    }

  });

  it("shows the selected role’s optional, area-matched tool options and makes them selectable", () => {
    const graph = d078GraphDataForTests();
    const tested = new Set<string>();
    for (const toolRoute of graph.role_tool_routes) {
      const roleRoute = graph.method_area_role_routes.find((route) =>
        route.role_id === toolRoute.role_id && toolRoute.area_ids.includes(route.area_id),
      );
      expect(roleRoute).toBeTruthy();
      let selection = toggleD078Method(INITIAL_D078_SELECTION, roleRoute!.method_id);
      selection = selectD078Area(selection, roleRoute!.area_id);
      const visibleRole = projectD078Route(selection).visibleRoles.find((role) => role.roleId === toolRoute.role_id);
      expect(visibleRole).toBeTruthy();
      selection = selectD078Role(selection, toolRoute.role_id);
      const projection = projectD078Route(selection);
      expect(projection.roleToolIds).toContain(toolRoute.tool_node_id);
      expect(projection.roleToolRoutes.every((route) => route.requirement_lane === "useful_optional_edge" && route.requirement_level === "optional")).toBe(true);
      expect(toolRoute.area_ids).toContain(selection.areaId);
      expect(projection.roleToolRoutes.every((route) => route.area_ids.includes(selection.areaId!))).toBe(true);
      const selectable = selectableD078ItemIds(projection, selection.areaId, selection);
      expect(selectable).toContain(toolRoute.tool_node_id);
      const selected = toggleD078AddedItem(selection, toolRoute.tool_node_id);
      expect(selectedD078ItemsForTray(projectD078Route(selected), selected)).toContainEqual({ id: toolRoute.tool_node_id, contextLevel: "role" });
      tested.add(`${toolRoute.role_id}:${toolRoute.tool_node_id}`);
    }
    expect(tested.size).toBe(95);
  });

  it("rejects method-specific role-item identifiers that do not resolve to an approved graph node", () => {
    const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    const methodSpecificItem = "role-method-item:test-method-specific-item";
    const withMethodItem = { ...projection, methodSpecificRoleItemIds: [methodSpecificItem] };

    expect(selectableD078ItemIds(withMethodItem, "D078:sociology-social-anthropology")).not.toContain(methodSpecificItem);
  });

  it("proves every route item's selection subset is reachable through independent add/remove choices", () => {
    const graph = d078GraphDataForTests();
    const startingSelections = graph.method_node_ids.map((methodId) => toggleD078Method(INITIAL_D078_SELECTION, methodId));
    for (const design of graph.combination_designs) {
      if (design.combination_mode === "fixed_evidence_combination") {
        const methods = design.required_method_ids.reduce((state, id) => toggleD078Method(state, id), INITIAL_D078_SELECTION);
        startingSelections.push(toggleD078Combination(methods, design.id));
        continue;
      }
      for (const variant of design.component_route_variants ?? []) {
        const methods = [...design.required_method_ids, ...variant.selected_component_method_ids]
          .reduce((state, id) => toggleD078Method(state, id), INITIAL_D078_SELECTION);
        startingSelections.push(toggleD078Combination(methods, design.id));
      }
    }

    const visited = new Set<string>();
    let routeContextsChecked = 0;
    let candidateOccurrencesChecked = 0;
    const verifyChoiceSet = (routeSelection: typeof INITIAL_D078_SELECTION, areaId: string) => {
      const signature = JSON.stringify({ methods: routeSelection.methodIds, combos: routeSelection.combinationIds, components: routeSelection.componentMethodIds, areaId, roleId: routeSelection.roleId });
      if (visited.has(signature)) return;
      visited.add(signature);
      routeContextsChecked += 1;
      const routeProjection = projectD078Route(routeSelection);
      const eligible = selectableD078ItemIds(routeProjection, areaId, routeSelection);
      const originalEligible = [...eligible].sort();
      let state = routeSelection;
      for (const id of originalEligible) {
        state = toggleD078AddedItemWithinRoute(state, id, eligible);
        expect(state.addedItemIds).toContain(id);
        expect([...selectableD078ItemIds(routeProjection, areaId, state)].sort()).toEqual(originalEligible);
        expect(selectedD078ItemsForTray(routeProjection, state).map((item) => item.id)).toContain(id);
        candidateOccurrencesChecked += 1;
      }
      expect(new Set(state.addedItemIds)).toEqual(new Set([...routeSelection.addedItemIds, ...originalEligible]));
      for (const id of [...originalEligible].reverse()) {
        state = toggleD078AddedItemWithinRoute(state, id, eligible);
        expect(state.addedItemIds).not.toContain(id);
        expect(selectedD078ItemsForTray(routeProjection, state).map((item) => item.id)).not.toContain(id);
        expect([...selectableD078ItemIds(routeProjection, areaId, state)].sort()).toEqual(originalEligible);
      }
    };

    for (const start of startingSelections) {
      const firstProjection = projectD078Route(start);
      for (const area of firstProjection.visibleAreas) {
        const areaSelection = selectD078Area(start, area.areaId);
        verifyChoiceSet(areaSelection, area.areaId);
        const areaProjection = projectD078Route(areaSelection);
        for (const role of areaProjection.visibleRoles) {
          verifyChoiceSet(selectD078Role(areaSelection, role.roleId), area.areaId);
        }
      }
    }

    expect(routeContextsChecked).toBeGreaterThan(500);
    expect(candidateOccurrencesChecked).toBeGreaterThan(10000);
  });

  it("lets learners add only the route-matched Layer 2/3 items and keeps them selected", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const projection = projectD078Route(selection);
    const applicable = [...d078ApplicableLayerItems(2, selection), ...d078ApplicableLayerItems(3, selection)];
    expect(applicable.length).toBeGreaterThan(0);
    const firstApplicable = applicable[0];
    expect(selectableD078ItemIds(projection, undefined, selection)).toContain(firstApplicable);
    expect(toggleD078AddedItem(selection, firstApplicable).addedItemIds).toContain(firstApplicable);
  });

  it("normalizes the area join, ignores unknown methods, and omits aggregate counts", () => {
    const graph = d078GraphDataForTests();
    const selection = toggleD078Method({ ...INITIAL_D078_SELECTION, methodIds: ["not-a-method"] }, SPATIAL);
    const projection = projectD078Route(selection);
    expect(projection.visibleAreas.find((area) => area.areaId === "D078:computational-digital-social-science")?.label)
      .toBe("Computational and Digital Social Science");
    expect(projection.methods.some((method) => method.id === "not-a-method")).toBe(false);
    expect(JSON.stringify(projection)).not.toMatch(/\b(19|46)\b/);
    expect(graph.method_area_routes).toHaveLength(117);
    expect(graph.method_area_role_routes).toHaveLength(423);
  });
});
