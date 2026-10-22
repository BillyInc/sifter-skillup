import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { d078GraphDataForTests, d078Node, INITIAL_D078_SELECTION, projectD078Route, toggleD078Combination, toggleD078ComponentMethod, toggleD078Method } from "@/lib/d078RouteProjection";
import { MethodChoicePanel } from "./MethodChoicePanel";

describe("D078 method and combination picker", () => {
  const graph = d078GraphDataForTests();
  const selectDesign = (design: (typeof graph.combination_designs)[number]) => {
    const methods = design.combination_mode === "design_frame_with_selectable_methods"
      ? [...design.required_method_ids, design.selectable_component_method_ids[0]]
      : design.required_method_ids;
    const selected = methods.reduce((state, methodId) => toggleD078Method(state, methodId), INITIAL_D078_SELECTION);
    return toggleD078Combination(selected, design.id);
  };

  it("renders all methods but keeps combinations hidden until a compatible multi-selection exists", () => {
    render(<ThemeProvider><MethodChoicePanel
      selection={INITIAL_D078_SELECTION}
      onToggleMethod={() => undefined}
      onToggleCombination={() => undefined}
      onToggleComponentMethod={() => undefined}
      onClear={() => undefined}
    /></ThemeProvider>);

    expect(graph.method_node_ids).toHaveLength(22);
    expect(graph.combination_designs).toHaveLength(9);
    for (const id of graph.method_node_ids) {
      const label = String(d078Node(id)?.label ?? id);
      expect(screen.getByRole("button", { name: `Select ${label}` })).toBeTruthy();
    }
    expect(screen.getAllByText("How this connects to your programme").length).toBeGreaterThan(0);
    expect(screen.getByText(/introduces quantitative research and expects you to apply appropriate statistics/i)).toBeTruthy();
    expect(screen.getByText(/Curriculum evidence: SOC 301 · Methods of Social Research and Statistics; SSC 401 · Research Method II/)).toBeTruthy();
    expect(screen.getByText("Methods of investigation/research")).toBeTruthy();
    expect(screen.queryByText("Ways these methods can work together")).toBeNull();
    expect(screen.getByRole("button", { name: "Clear selected methods" }).props.accessibilityState.disabled).toBe(true);
  });

  it("keeps a selected design concise in the picker so its full explanation can travel with downstream", () => {
    const design = graph.combination_designs.find((row) => row.id === "combo:exploratory-sequential")!;
    const selection = selectDesign(design);
    render(<ThemeProvider><MethodChoicePanel
      selection={selection}
      onToggleMethod={() => undefined}
      onToggleCombination={() => undefined}
      onToggleComponentMethod={() => undefined}
      onClear={() => undefined}
    /></ThemeProvider>);

    const comboLabel = projectD078Route(selection).combinations.find((combo) => combo.id === "combo:exploratory-sequential")!.label;
    expect(screen.getByRole("button", { name: `Deselect ${comboLabel}` })).toBeTruthy();
    expect(screen.getByText("This named design now controls the route below. Its sequence, method contributions, matching preparation and supported areas appear together there.")).toBeTruthy();
    expect(screen.queryByText("Why these belong together")).toBeNull();
    expect(screen.queryByText("What each method contributes")).toBeNull();
  });

  it("retains complete graph-authored details while keeping each selected-design picker card concise", () => {
    const firstDesign = graph.combination_designs[0];
    const { rerender } = render(<ThemeProvider><MethodChoicePanel
      selection={selectDesign(firstDesign)}
      onToggleMethod={() => undefined}
      onToggleCombination={() => undefined}
      onToggleComponentMethod={() => undefined}
      onClear={() => undefined}
    /></ThemeProvider>);

    expect(graph.combination_designs).toHaveLength(9);
    for (const design of graph.combination_designs) {
      const selection = selectDesign(design);
      const combination = projectD078Route(selection).combinations.find((item) => item.id === design.id)!;
      rerender(<ThemeProvider><MethodChoicePanel
        selection={selection}
        onToggleMethod={() => undefined}
        onToggleCombination={() => undefined}
        onToggleComponentMethod={() => undefined}
        onClear={() => undefined}
      /></ThemeProvider>);

      expect(screen.getByRole("button", { name: `Deselect ${combination.label}` })).toBeTruthy();
      for (const detail of [combination.whyCombine, combination.howUsed, combination.condition, combination.limits, combination.selectionRule]) {
        expect(detail.trim()).not.toBe("");
      }
      expect(screen.getByText("This named design now controls the route below. Its sequence, method contributions, matching preparation and supported areas appear together there.")).toBeTruthy();
      expect(projectD078Route(selection).methods.filter((method) => method.selected)).toEqual([]);
    }
  });

  it("keeps participatory components inside their selected design and reports component changes", () => {
    const comboId = "combo:participatory-method-choice";
    const design = graph.combination_designs.find((row) => row.id === comboId)!;
    const initial = selectDesign(design);
    const componentId = graph.combination_designs.find((design) => design.id === comboId)!.selectable_component_method_ids[1];
    const label = String(d078Node(componentId)?.label ?? componentId);
    const onToggleComponentMethod = jest.fn();
    const selected = toggleD078ComponentMethod(initial, comboId, componentId);
    const { rerender } = render(<ThemeProvider><MethodChoicePanel
      selection={initial}
      onToggleMethod={() => undefined}
      onToggleCombination={() => undefined}
      onToggleComponentMethod={onToggleComponentMethod}
      onClear={() => undefined}
    /></ThemeProvider>);

    expect(screen.getByText("Choose evidence methods inside this design")).toBeTruthy();
    const componentButton = screen.getAllByRole("button", { name: `Select ${label}` }).at(-1);
    expect(componentButton).toBeTruthy();
    fireEvent.press(componentButton!);
    expect(onToggleComponentMethod).toHaveBeenCalledWith(comboId, componentId);
    rerender(<ThemeProvider><MethodChoicePanel
      selection={selected}
      onToggleMethod={() => undefined}
      onToggleCombination={() => undefined}
      onToggleComponentMethod={onToggleComponentMethod}
      onClear={() => undefined}
    /></ThemeProvider>);
    expect(screen.getAllByRole("button", { name: `Deselect ${label}` }).at(-1)).toBeTruthy();
  });

  it("filters both methods and designs using the search field", () => {
    render(<ThemeProvider><MethodChoicePanel
      selection={INITIAL_D078_SELECTION}
      onToggleMethod={() => undefined}
      onToggleCombination={() => undefined}
      onToggleComponentMethod={() => undefined}
      onClear={() => undefined}
    /></ThemeProvider>);
    fireEvent.changeText(screen.getByLabelText("Search methods and combined designs"), "interview");
    expect(screen.getByRole("button", { name: /Select Interviews/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Select Spatial analysis" })).toBeNull();
  });
});
