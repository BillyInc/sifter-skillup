jest.mock("@/theme/motion", () => ({ useReducedMotion: () => true }));
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import {
  D078RelationshipPanel,
  type D078RelationshipItem,
  type D078TypedRelationshipEdge,
} from "./D078RelationshipPanel";

const current: D078RelationshipItem = { id: "item:interviews", label: "Interviews" };
const method: D078RelationshipItem = { id: "item:research-design", label: "Research design" };
const option: D078RelationshipItem = { id: "item:survey", label: "Surveys" };
const tool: D078RelationshipItem = { id: "item:coding-tool", label: "Qualitative coding tool" };
const projected = [current, method, option, tool];

function edge(relationship: string, overrides: Partial<D078TypedRelationshipEdge> = {}): D078TypedRelationshipEdge {
  return {
    id: `edge:${relationship}`,
    sourceId: current.id,
    targetId: option.id,
    relationship,
    status: "source_backed",
    sourceResolved: true,
    targetResolved: true,
    explanation: "Graph-backed explanation for this connection.",
    ...overrides,
  };
}

function panel(typedEdges: D078TypedRelationshipEdge[], overrides: Partial<React.ComponentProps<typeof D078RelationshipPanel>> = {}) {
  return render(<ThemeProvider><D078RelationshipPanel
    currentItem={current}
    projectedItems={projected}
    typedEdges={typedEdges}
    onUseTarget={jest.fn()}
    onOpenTarget={jest.fn()}
    {...overrides}
  /></ThemeProvider>);
}

function resolvedStyle(button: any) {
  const style = button.props.style;
  return StyleSheet.flatten(typeof style === "function" ? style({ pressed: false }) : style);
}

describe("D078 relationship panel", () => {
  it.each([
    ["prerequisite_for", "Learn this first", { blockingPolicy: "blocks" }],
    ["builds_on", "Builds on", {}],
    ["requires", "Uses as background", {}],
    ["works_with", "Useful alongside", {}],
    ["complements", "Useful alongside", {}],
    ["supports", "Supports this work", {}],
    ["useful_for", "Supports this work", {}],
    ["tool_for", "Tool for this method", {}],
    ["optional_analysis_tool", "Tool for this method", {}],
    ["optional_tool_option", "Tool for this method", {}],
    ["optional_collection_tool", "Tool for this method", {}],
    ["conditional_library", "Tool for this method", {}],
    ["visual_network_tool", "Tool for this method", {}],
    ["computational_network_tool", "Tool for this method", {}],
    ["simulation_framework", "Tool for this method", {}],
    ["specialist_simulation_tool", "Tool for this method", {}],
    ["specialist_extension_of", "Specialist extension", {}],
    ["alternative_to", "Another way", {}],
    ["alternative_tool_option", "Another way", {}],
  ])("gives %s its distinct learner-facing meaning", (relationship, label, overrides) => {
    panel([edge(relationship, overrides)]);
    expect(screen.getByText(label)).toBeTruthy();
    expect(screen.getByText("Graph-backed explanation for this connection.")).toBeTruthy();
  });

  it("only offers a target when both endpoints are in the current projection", () => {
    panel([edge("works_with")]);
    expect(screen.getByRole("button", { name: "See Surveys" })).toBeTruthy();
    expect(screen.getByText("Interviews · Surveys")).toBeTruthy();
  });

  it("keeps relationship detail distinct and names the active route context", () => {
    panel([edge("works_with")], { routeContextLabel: "Sociology · Social Research and Evaluation · Sociologist" });
    expect(screen.getByText("In your Sociology · Social Research and Evaluation · Sociologist route")).toBeTruthy();
    expect(screen.getByText("Why this connection matters")).toBeTruthy();
    expect(screen.getByText("Graph-backed explanation for this connection.")).toBeTruthy();
    expect(screen.getByText("These can be useful together when the work calls for both. Choosing one does not add the other.")).toBeTruthy();
  });

  it("uses the relationship meaning when the supplied edge has only a generic audit explanation", () => {
    panel([edge("requires", { explanation: "Canonical learning item(s) exist for this relationship; offer them only when projected by the selected D078 route. This connection never blocks progression." })]);
    expect(screen.getByText("Uses as background")).toBeTruthy();
    expect(screen.queryByText("Why this connection matters")).toBeNull();
    expect(screen.queryByText(/Canonical learning item/)).toBeNull();
    expect(screen.getByText("The connected learning is linked as background for this item. The relationship does not block your route.")).toBeTruthy();
  });

  it("shows the approved hidden-target explanation without making the target selectable", () => {
    panel([edge("works_with")], { projectedItems: [current] });
    expect(screen.getByText("That item is hidden until you select a method that uses it.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "See Surveys" })).toBeNull();
    expect(screen.queryByText(option.id)).toBeNull();
  });

  it("keeps an explicitly unavailable destination unselectable even if a caller supplies both endpoints", () => {
    panel([edge("alternative_to", { routeAvailability: "unavailable_destination" })]);
    expect(screen.getByText("That item is hidden until you select a method that uses it.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Compare Interviews with Surveys/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "See Surveys" })).toBeNull();
  });

  it("omits unresolved, candidate, and absent relationship data", () => {
    const { rerender } = panel([edge("works_with", { targetResolved: false })]);
    expect(screen.queryByText("How this connects")).toBeNull();
    rerender(<ThemeProvider><D078RelationshipPanel currentItem={current} projectedItems={projected} typedEdges={[edge("works_with", { status: "candidate" })]} onUseTarget={jest.fn()} onOpenTarget={jest.fn()} /></ThemeProvider>);
    expect(screen.queryByText("How this connects")).toBeNull();
    rerender(<ThemeProvider><D078RelationshipPanel currentItem={current} projectedItems={projected} typedEdges={[]} onUseTarget={jest.fn()} onOpenTarget={jest.fn()} /></ThemeProvider>);
    expect(screen.queryByText("How this connects")).toBeNull();
  });

  it("omits self-referential edges instead of offering a comparison with the current item", () => {
    panel([edge("alternative_to", { sourceId: current.id, targetId: current.id })]);
    expect(screen.queryByRole("button", { name: /Compare Interviews with Interviews/ })).toBeNull();
    expect(screen.queryByText("How this connects")).toBeNull();
  });

  it("opens a comparison with accessible Use this and Close actions; Use this calls the supplied callback", async () => {
    const onUseTarget = jest.fn();
    const relationship = edge("alternative_to");
    panel([relationship], { onUseTarget });
    const compare = screen.getByRole("button", { name: "Compare Interviews with Surveys" });
    expect(StyleSheet.flatten(compare.props.style).minHeight).toBeGreaterThanOrEqual(44);
    act(() => screen.UNSAFE_getByType(Pressable).props.onFocus());
    expect(resolvedStyle(screen.UNSAFE_getByType(Pressable)).borderWidth).toBe(2);
    fireEvent.press(compare);
    expect(screen.getByRole("header", { name: "Compare learning options" })).toBeTruthy();
    expect(screen.getByText("Choose the option that fits your question. You do not need to learn both as steps.")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Use Surveys" }));
    expect(onUseTarget).toHaveBeenCalledWith(option, relationship);
    await waitFor(() => expect(screen.queryByRole("header", { name: "Compare learning options" })).toBeNull());
  });

  it("Close returns accessibility focus to the comparison trigger", async () => {
    const focusElement = jest.fn();
    panel([edge("alternative_to")], { focusElement });
    fireEvent.press(screen.getByRole("button", { name: "Compare Interviews with Surveys" }));
    expect(focusElement).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(focusElement).toHaveBeenCalledTimes(2));
    expect(focusElement.mock.calls[1][0]).toBeTruthy();
    expect(screen.queryByRole("header", { name: "Compare learning options" })).toBeNull();
  });

  it("dismisses through the platform back action without changing route selections", async () => {
    const onUseTarget = jest.fn();
    const onOpenTarget = jest.fn();
    panel([edge("alternative_to")], { onUseTarget, onOpenTarget });
    fireEvent.press(screen.getByRole("button", { name: "Compare Interviews with Surveys" }));
    const modal = screen.UNSAFE_getAllByType(require("react-native").Modal)[0];
    act(() => modal.props.onRequestClose());
    await waitFor(() => expect(screen.queryByRole("header", { name: "Compare learning options" })).toBeNull());
    expect(onUseTarget).not.toHaveBeenCalled();
    expect(onOpenTarget).not.toHaveBeenCalled();
  });

  it("does not show a blocking prerequisite unless the graph marks it blocking", () => {
    panel([edge("prerequisite_for", { blockingPolicy: "never" })]);
    expect(screen.queryByText("Learn this first")).toBeNull();
  });

  it("uses a non-animated modal for reduced-motion-safe sheet behavior", () => {
    panel([edge("alternative_to")]);
    fireEvent.press(screen.getByRole("button", { name: "Compare Interviews with Surveys" }));
    const modal = screen.UNSAFE_getAllByType(require("react-native").Modal)[0];
    expect(modal.props.animationType).toBe("none");
  });
});
