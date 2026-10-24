import {
  INITIAL_D078_SELECTION,
  d078AreaLabel,
  d078ApplicableLayerItems,
  d078CombinationLabel,
  d078GraphDataForTests,
  projectD078Route,
  selectD078Area,
  selectD078Role,
  toggleD078Combination,
  toggleD078ComponentMethod,
  toggleD078AddedItem,
  toggleD078Method,
  selectableD078ItemIds,
} from "./d078RouteProjection";

const INTERVIEWS = "domain-item:d078-interviews";
const SPATIAL = "domain-item:d078-spatial-social-analysis";
const PARTICIPATORY = "combo:participatory-method-choice";
const SURVEY = "domain-item:d078-survey-method";
const INTERVIEW_OBSERVATION = "combo:interview-and-observation";
const QUANTITATIVE = "domain-item:d078-quantitative-approach";
const SENSITIVITY = "domain-item:d078-sensitivity-and-robustness-analysis";
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
const selectDesign = (comboId: string) => {
  const combo = d078GraphDataForTests().combination_designs.find((row) => row.id === comboId)!;
  const methods = combo.combination_mode === "design_frame_with_selectable_methods"
    ? [...combo.required_method_ids, combo.selectable_component_method_ids[0]]
    : combo.required_method_ids;
  return toggleD078Combination(methods.reduce((state, id) => toggleD078Method(state, id), INITIAL_D078_SELECTION), comboId);
};

describe("D078 method-aware route projection", () => {
  it("resolves saved area and combination labels from the route contract", () => {
    expect(d078AreaLabel("D078:social-research-evaluation")).toBe("Social Research and Evaluation");
    expect(d078CombinationLabel("combo:exploratory-sequential")).toBe("Explore first, measure next");
  });

  it("returns foundations and picker catalogues but no downstream rows before a choice", () => {
    const projection = projectD078Route(INITIAL_D078_SELECTION);
    expect(projection.foundations).toHaveLength(3);
    expect(projection.methods).toHaveLength(22);
    expect(projection.combinations).toHaveLength(9);
    expect(projection.visibleAreas).toEqual([]);
    expect(projection.visibleRoles).toEqual([]);
    expect(projection.hiddenBecause).toBe("no_method_selected");
  });

  it("makes verified optional sensitivity analysis selectable after quantitative methods", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, QUANTITATIVE);
    const projection = projectD078Route(selection);
    expect(projection.domainItemIds).toContain(SENSITIVITY);
    expect(projectD078Route(toggleD078AddedItem(selection, SENSITIVITY)).orphanedItemIds).toEqual([]);
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
    expect(projection.domainItemIds).toContain("domain-item:d078-statsmodels");
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
          ...(route.domain_downstream_item_ids ?? []),
        ];
        for (const itemId of declaredItemIds) {
          const itemNode = graph.nodes_by_id[itemId];
          if (itemNode?.item_type === "tool" || itemNode?.kind === "area_tool_option" || itemNode?.kind === "area_tool_application_reference") {
            expect(projection.toolIds).toContain(itemId);
          } else if (itemId.startsWith("area_enrichment_item:") || itemId.startsWith("area_learning_item:")) {
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
    expect(graph.method_node_ids).toHaveLength(22);
    for (const methodId of graph.method_node_ids) {
      const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, methodId));
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
        expect(projection.taskFamilyIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(route.task_family_ids ?? []));
        expect(projection.areaItemIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(route.area_item_ids ?? []));
        expect(projection.explanatoryItemIdsByArea[route.area_id] ?? []).toEqual(expect.arrayContaining(route.explanatory_item_ids ?? []));
        const declared = [
          ...(route.task_linked_domain_item_ids ?? []),
          ...(route.available_item_ids ?? []),
          ...(route.domain_downstream_item_ids ?? []),
        ];
        for (const id of declared) {
          const node = graph.nodes_by_id[id];
          if (node?.item_type === "tool" || node?.kind === "area_tool_option" || node?.kind === "area_tool_application_reference") {
            expect(projection.toolIds).toContain(id);
          } else if (id.startsWith("area_enrichment_item:") || id.startsWith("area_learning_item:")) {
            expect(projection.areaItemIdsByArea[route.area_id] ?? []).toContain(id);
          } else {
            expect(projection.domainItemIds).toContain(id);
          }
        }
        for (const id of [...(route.tool_ids ?? []), ...(route.domain_tool_ids ?? [])]) expect(projection.toolIds).toContain(id);
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
  });

  it("includes method-specific role items in the same add/remove eligibility set", () => {
    const projection = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS));
    const methodSpecificItem = "role-method-item:test-method-specific-item";
    const withMethodItem = { ...projection, methodSpecificRoleItemIds: [methodSpecificItem] };

    expect(selectableD078ItemIds(withMethodItem, "D078:sociology-social-anthropology")).toContain(methodSpecificItem);
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
    expect(graph.method_area_routes).toHaveLength(116);
    expect(graph.method_area_role_routes).toHaveLength(421);
  });
});
