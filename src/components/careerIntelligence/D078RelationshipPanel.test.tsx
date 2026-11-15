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
  const roleAlternative = relationship === "tool_alternative_for_role_task";
  const alternative = roleAlternative || relationship === "alternative_to" || relationship === "alternative_tool_option";
  return {
    id: `edge:${relationship}`,
    sourceId: current.id,
    targetId: option.id,
    relationship,
    status: alternative ? "resolved_ready_for_use" : "source_backed",
    sourceResolved: true,
    targetResolved: true,
    explanation: "Graph-backed explanation for this connection.",
    ...(alternative ? {
      evidenceBasis: roleAlternative ? "source_backed_role_task_tool_alternative" : "source_backed_alternative_relationship",
      sourceReferences: [{ source_role: roleAlternative ? "role_task_tool_alternative_evidence" : "alternative_relationship_evidence", url: "https://example.org/reviewed" }],
      alternativeReviewDisposition: "approved" as const,
      selectable: true,
    } : {}),
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

  it("shows a reviewed non-blocking prerequisite in both directions and preserves its condition", () => {
    const prerequisite = edge("prerequisite_for", {
      sourceId: method.id,
      targetId: option.id,
      blockingPolicy: "never",
      sequencePolicy: "conditional_prerequisite",
      sequenceApproved: true,
      condition: "Only when estimating causal effects.",
    });
    panel([prerequisite], { currentItem: method, projectedItems: [method, option] });
    expect(screen.getByText("Review before the connected step when it applies")).toBeTruthy();
    expect(screen.getByText(/Only when estimating causal effects\. Review this before Surveys/)).toBeTruthy();
    expect(screen.queryByText("Learn this first")).toBeNull();
  });

  it("explains an approved workflow edge as recommended and non-blocking", () => {
    const workflow = edge("builds_on", {
      sourceId: method.id,
      targetId: option.id,
      sequencePolicy: "workflow",
      sequenceApproved: true,
      blockingPolicy: "never",
      condition: "When interpreting a survey dataset.",
    });
    panel([workflow], { currentItem: option, projectedItems: [method, option] });
    expect(screen.getByText("Recommended earlier in this route")).toBeTruthy();
    expect(screen.getByText(/When interpreting a survey dataset\. review Research design before this one/i)).toBeTruthy();
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

  it("shows a tool-specific NVivo versus Taguette comparison before the learner chooses one", () => {
    const nvivo: D078RelationshipItem = { id: "area_tool_option:d078-a04-tool-nvivo", label: "NVivo" };
    const taguette: D078RelationshipItem = { id: "area_tool_option:d078-a04-tool-taguette", label: "Taguette" };
    const comparison = edge("alternative_tool_option", {
      sourceId: nvivo.id,
      targetId: taguette.id,
      explanation: "Both support qualitative coding, but their workflows differ: Taguette focuses on highlighting and tagging text documents, while NVivo provides a broader set of coding workflows, including manual and automatic coding into thematic nodes. Choose by the material you need to handle, project scale, collaboration needs, access and licensing; neither tool decides what a code means or replaces interpretation.",
    });
    const onUseTarget = jest.fn();
    panel([comparison], { currentItem: nvivo, projectedItems: [nvivo, taguette], onUseTarget });
    fireEvent.press(screen.getByRole("button", { name: "Compare NVivo with Taguette" }));
    expect(screen.getAllByText(/Taguette focuses on highlighting and tagging text documents/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/NVivo provides a broader set of coding workflows/).length).toBeGreaterThan(0);
    fireEvent.press(screen.getByRole("button", { name: "Use Taguette" }));
    expect(onUseTarget).toHaveBeenCalledWith(taguette, comparison);
  });

  it("shows an area-scoped tool comparison only in its selected area", () => {
    const nvivo: D078RelationshipItem = { id: "domain-item:d078-nvivo-tool", label: "NVivo" };
    const taguette: D078RelationshipItem = { id: "domain-item:d078-qualitative-coding-tool", label: "Taguette" };
    const comparison = edge("alternative_tool_option", {
      sourceId: nvivo.id,
      targetId: taguette.id,
      areaId: "D078:sociology-social-anthropology",
      explanation: "Choose by the material, project scale, collaboration needs, access and licensing.",
    });
    const view = panel([comparison], {
      currentItem: nvivo,
      projectedItems: [nvivo, taguette],
      activeAreaId: "D078:social-research-evaluation",
    });
    expect(screen.queryByRole("button", { name: "Compare NVivo with Taguette" })).toBeNull();

    view.rerender(<ThemeProvider><D078RelationshipPanel
      currentItem={nvivo}
      projectedItems={[nvivo, taguette]}
      typedEdges={[comparison]}
      onUseTarget={jest.fn()}
      onOpenTarget={jest.fn()}
      activeAreaId="D078:sociology-social-anthropology"
    /></ThemeProvider>);
    expect(screen.getByRole("button", { name: "Compare NVivo with Taguette" })).toBeTruthy();
  });

  it("keeps role-task tool alternatives scoped to the selected role and task and removes reciprocal duplicates", () => {
    const nvivo: D078RelationshipItem = { id: "tool:nvivo", label: "NVivo" };
    const taguette: D078RelationshipItem = { id: "tool:taguette", label: "Taguette" };
    const context = { roleAreaIds: ["D078:sociology-social-anthropology"] };
    const matching = edge("tool_alternative_for_role_task", {
      sourceId: nvivo.id, targetId: taguette.id, roleId: "role:D078:3:sociologist", roleTaskId: "role-task:d078:sociologist", ...context,
      explanation: "For this sociologist task, choose the tool whose coding and retrieval workflow fits the material and project.",
    });
    const reciprocal = edge("tool_alternative_for_role_task", {
      sourceId: taguette.id, targetId: nvivo.id, roleId: "role:D078:3:sociologist", roleTaskId: "role-task:d078:sociologist", ...context,
    });
    const otherRole = edge("tool_alternative_for_role_task", {
      sourceId: nvivo.id, targetId: taguette.id, roleId: "role:D078:19:anthropologist", roleTaskId: "role-task:d078:anthropologist", ...context,
    });
    panel([matching, reciprocal, otherRole], {
      currentItem: nvivo,
      projectedItems: [nvivo, taguette],
      activeRoleId: "role:D078:3:sociologist",
      activeRoleTaskId: "role-task:d078:sociologist",
      activeAreaId: "D078:sociology-social-anthropology",
    });
    expect(screen.getAllByRole("button", { name: "Compare NVivo with Taguette" })).toHaveLength(1);
    expect(screen.getByText(/For this sociologist task/)).toBeTruthy();
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
