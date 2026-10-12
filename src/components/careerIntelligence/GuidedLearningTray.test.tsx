import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { buildLearningPlanStackSet, learningPlanRouteKey, type LearningPlanCandidate } from "@/lib/guidedLearningPlan";
import { GuidedLearningTray } from "./GuidedLearningTray";

function candidate(overrides: Partial<LearningPlanCandidate> & Pick<LearningPlanCandidate, "id" | "name" | "layer">): LearningPlanCandidate {
  return {
    visibility: "selectable",
    claimReviewState: "approved",
    linkState: "linked",
    linkUrl: "https://learn.example.org/resource",
    guidanceOwner: overrides.layer,
    ...overrides,
  };
}

const selected = candidate({
  id: "foundation",
  name: "Research foundations",
  layer: "domain",
  category: "shared_foundation",
});
const secondSelected = candidate({
  id: "evidence-basics",
  name: "Evidence basics",
  layer: "domain",
  category: "useful_edge",
});

const available = candidate({
  id: "survey-design",
  name: "Survey design",
  layer: "domain",
  category: "useful_edge",
  itemType: "tool",
  explanation: "Use this when collecting comparable answers from many people.",
  plainMeaning: "A survey asks people the same planned questions.",
  contextualUse: "In sociology, it can help compare experiences across groups.",
  expectedOutput: "A documented set of responses ready for analysis.",
  sourceReferences: [{ id: "survey-guide", title: "Survey design guide", url: "https://example.org/survey-guide" }],
  sourceLocators: [{ sourceId: "survey-guide", locator: "Chapter 3, section 2" }],
  relationships: [{
    type: "builds_on",
    targetId: "research-foundations",
    targetName: "Research foundations",
    status: "source_backed",
    explanation: "A clear research question helps determine what the survey should ask.",
    sourceReferences: [
      { title: "Research methods guide", url: "https://example.org/research-methods" },
      { title: "Insecure reference", url: "http://example.org/not-allowed" },
    ],
  }],
});

function stackSet() {
  return buildLearningPlanStackSet({
    routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [selected.id, secondSelected.id] }],
    domainItems: [selected, secondSelected, available],
  });
}

describe("GuidedLearningTray", () => {
  it("opens from the icon, expands item details, and forwards relationship evidence", () => {
    render(<ThemeProvider><GuidedLearningTray stackSet={stackSet()} initialMode="icon" /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open learning plan tray with 2 selected items" }));
    fireEvent.press(screen.getByRole("button", { name: "Small" }));
    expect(screen.queryByText("Choose learning focus")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Mid" }));
    expect(screen.getByText("Choose learning focus")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Full" }));
    expect(screen.getByText("Step 1 · Domain foundation")).toBeTruthy();
    expect(screen.getByText("Step 2 · Domain foundation")).toBeTruthy();
    expect(screen.getByText(/they do not make every item in one layer a prerequisite/)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Survey design" }));

    expect(screen.getByText(/In this route: In sociology, it can help compare experiences across groups\./)).toBeTruthy();
    expect(screen.getByText(/What you can produce: A documented set of responses ready for analysis\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open evidence source Survey design guide" })).toBeTruthy();
    expect(screen.getByText("Where to look: Chapter 3, section 2")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Builds on: Research foundations" }));
    expect(screen.getByText("A clear research question helps determine what the survey should ask.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open relationship evidence: Research methods guide" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Open relationship evidence: Insecure reference" })).toBeNull();
  });

  it("wires add, remove, reorder, save, print, and share actions to their callbacks", () => {
    const onSelectCandidate = jest.fn();
    const onRemove = jest.fn();
    const onReorder = jest.fn();
    const onSave = jest.fn();
    const onPrint = jest.fn();
    const onShare = jest.fn();
    render(<ThemeProvider><GuidedLearningTray
      stackSet={stackSet()}
      initialMode="full"
      onSelectCandidate={onSelectCandidate}
      onRemove={onRemove}
      onReorder={onReorder}
      onSave={onSave}
      onPrint={onPrint}
      onShare={onShare}
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Survey design" }));
    fireEvent.press(screen.getByRole("button", { name: "Add Survey design to this learning plan" }));
    const routeKey = learningPlanRouteKey({ programmeId: "sociology", domainId: "D078" });
    expect(onSelectCandidate).toHaveBeenCalledWith(routeKey, available);

    fireEvent.press(screen.getByRole("button", { name: "Remove Research foundations from this plan" }));
    expect(onRemove).toHaveBeenCalledWith(routeKey, "foundation");
    fireEvent.press(screen.getByRole("button", { name: "Move Research foundations later in this plan" }));
    expect(onReorder).toHaveBeenCalledWith(routeKey, "foundation", undefined);

    fireEvent.press(screen.getByRole("button", { name: "Save" }));
    fireEvent.press(screen.getByRole("button", { name: "Print / download" }));
    fireEvent.press(screen.getByRole("button", { name: "Share summary" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onPrint).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it("keeps multiple routes visibly separate", () => {
    const stacks = buildLearningPlanStackSet({
      routes: [
        { route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [selected.id] },
        { route: { programmeId: "sociology", domainId: "D079" }, selectedIds: ["other"] },
      ],
      domainItems: [selected, candidate({ id: "other", name: "Other foundation", layer: "domain", category: "shared_foundation" })],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="mid" /></ThemeProvider>);

    expect(screen.getByText(/You are adding multiple routes/)).toBeTruthy();
    expect(screen.getByText(/items are not treated as one combined qualification path/)).toBeTruthy();
    expect(screen.getAllByText("Other foundation")).toHaveLength(2);
  });

  it("compares alternatives with contextual details before adding a choice", () => {
    const python = candidate({
      id: "python",
      name: "Python",
      layer: "domain",
      category: "alternative",
      alternativeGroup: "analysis-tool",
      itemType: "tool",
      explanation: "A flexible language for data workflows.",
      plainMeaning: "Python is a programming language used to give a computer clear instructions.",
      contextualUse: "In sociology, it can help clean and analyse research data.",
      prerequisiteNames: ["Research methods"],
      limitations: ["The tool does not choose a sound study design for you."],
      relationships: [{
        type: "builds_on",
        targetId: "research-foundations",
        targetName: "Research foundations",
        status: "source_backed",
        explanation: "A research question guides what the analysis should answer.",
        sourceReferences: [{ title: "Methods reference", url: "https://example.org/methods" }],
      }],
    });
    const r = candidate({
      id: "r",
      name: "R",
      layer: "domain",
      category: "alternative",
      alternativeGroup: "analysis-tool",
      explanation: "A language with a strong statistics and research ecosystem.",
      plainMeaning: "R is a programming language and environment designed for statistical work.",
    });
    const onSelectAlternative = jest.fn();
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [selected.id] }],
      domainItems: [selected, python, r],
    });
    const routeKey = learningPlanRouteKey({ programmeId: "sociology", domainId: "D078" });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="full" onSelectAlternative={onSelectAlternative} /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Compare analysis-tool options" }));
    expect(screen.getAllByText(/How it fits: Alternative choice — choose one, not both/)).toHaveLength(2);
    expect(screen.getByText(/What it is: Python is a programming language used to give a computer clear instructions\./)).toBeTruthy();
    expect(screen.getByText(/In sociology, it can help clean and analyse research data\./)).toBeTruthy();
    expect(screen.getByText(/Learn or review first: Research methods/)).toBeTruthy();
    expect(screen.getByText(/Limits: The tool does not choose a sound study design for you\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open learning resource for Python" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Builds on: Research foundations" }));
    expect(screen.getByRole("link", { name: "Open relationship evidence: Methods reference" })).toBeTruthy();
    fireEvent.press(screen.getAllByText("Select this option")[0]);
    expect(onSelectAlternative).toHaveBeenCalledWith(routeKey, "analysis-tool", python);
  });
});
