import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import type { LearningPlanCandidate } from "@/lib/guidedLearningPlan";
import { AlternativeComparisonSheet } from "./AlternativeComparisonSheet";

function option(id: string, name: string, contextualUse: string): LearningPlanCandidate {
  return {
    id,
    name,
    layer: "area",
    category: "alternative",
    visibility: "selectable",
    claimReviewState: "approved",
    linkState: "linked",
    linkUrl: `https://example.org/${id}`,
    alternativeGroup: "analysis-tool",
    itemType: "tool",
    plainMeaning: `${name} is a tool used for data analysis.`,
    contextualUse,
    requirementReason: `${name} suits this selected analysis route because its workflow can be repeated and documented.`,
    programmeContext: "The programme establishes the research question; this tool is a further option for carrying out the analysis.",
    domainContext: "In the social-science domain, it can support transparent analysis of collected evidence.",
    linkTitle: `${name} task-specific guide`,
    linkRationale: `This guide teaches the ${name} workflow described for this route, rather than generic computing alone.`,
    expectedOutput: `${name} produces a reproducible analysis summary.`,
    prerequisiteNames: ["Research question design"],
    limitations: [`${name} does not replace research design.`],
    sourceReferences: [{ title: `${name} official guide`, url: `https://example.org/${id}/guide` }],
  };
}

const python: LearningPlanCandidate = {
  ...option("python", "Python", "Analyse and document social research data in a reproducible workflow."),
  geographicScope: "global",
  relationships: [
    {
      type: "builds_on",
      targetId: "research-design",
      targetName: "Research design",
      status: "source_backed",
      sequenceApproved: true,
      sequencePolicy: "hard_prerequisite",
      explanation: "The research design identifies what the analysis should answer and which data are relevant before code is written.",
    },
    {
      type: "complements",
      targetId: "data-visualisation",
      targetName: "Data visualisation",
      status: "source_backed",
      explanation: "Visual summaries can help communicate the patterns found, but they do not replace checking the analysis.",
    },
  ],
};
const r = option("r", "R", "Analyse social research data with statistical packages and scripts.");
r.geographicScope = "nigeria_to_global";

describe("AlternativeComparisonSheet", () => {
  it("filters internal disposition and route-note wording from comparison explanations", () => {
    const internal = option("internal", "Alternative A", "Compare two source types for the selected question.");
    internal.plainMeaning = "Shared foundation candidate for evidence routes. Route note: show only within this area.";
    internal.requirementReason = "Area-specific enrichment candidate. Route note: staff display instruction.";
    render(<ThemeProvider><AlternativeComparisonSheet
      group="Evidence approaches"
      options={[internal, r]}
      visible
      onClose={jest.fn()}
      onSelect={jest.fn()}
    /></ThemeProvider>);

    expect(screen.getByText("A learner-facing explanation is not available for this choice.")).toBeTruthy();
    expect(screen.queryByText(/candidate|Route note:/i)).toBeNull();
  });

  it("separates embedded task, output and guardrail notes into learner-facing comparison sections", () => {
    const embedded = option(
      "survey-design",
      "Survey design",
      "Use it when a question needs comparable answers from a defined group. Task: Draft and test a short questionnaire. Output: A tested questionnaire and a note on who its answers represent. Guardrail: A survey does not explain causes by itself.",
    );
    embedded.expectedOutput = undefined;

    render(<ThemeProvider><AlternativeComparisonSheet
      group="Survey approaches"
      options={[embedded, python]}
      visible
      onClose={jest.fn()}
      onSelect={jest.fn()}
    /></ThemeProvider>);

    expect(screen.getByText(/How it is used: Use it when a question needs comparable answers/)).toBeTruthy();
    expect(screen.getByText(/Example of the work: Draft and test a short questionnaire/)).toBeTruthy();
    expect(screen.getByText(/A tested questionnaire and a note on who its answers represent/)).toBeTruthy();
    expect(screen.getByText(/What to keep in mind: A survey does not explain causes by itself/)).toBeTruthy();
    expect(screen.queryByText(/Task:|Output:|Guardrail:/)).toBeNull();
  });

  it("compares alternatives by task, output, preparation and limits without changing the current choice", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(<ThemeProvider><AlternativeComparisonSheet
      group="Data analysis tools"
      options={[python, r]}
      selectedId="python"
      visible
      onClose={onClose}
      onSelect={onSelect}
    /></ThemeProvider>);

    expect(screen.getByText("Best suited task")).toBeTruthy();
    expect(screen.getByText("Possible output")).toBeTruthy();
    expect(screen.getByText("Learn first")).toBeTruthy();
    expect(screen.getByText("Access or cost")).toBeTruthy();
    expect(screen.getByText("Limits")).toBeTruthy();
    expect(screen.getByText("Evidence context")).toBeTruthy();
    expect(screen.getByText("Source coverage")).toBeTruthy();
    expect(screen.getByText(/The evidence is international/)).toBeTruthy();
    expect(screen.getByText(/The evidence includes a Nigerian connection/)).toBeTruthy();
    expect(screen.getByText("Learning destination")).toBeTruthy();
    expect(screen.getByText("Why it fits this route")).toBeTruthy();
    expect(screen.getAllByText(/suits this selected analysis route/)).toHaveLength(2);
    expect(screen.getByText(/This guide teaches the Python workflow described for this route/)).toBeTruthy();
    expect(screen.getByText(/The research design identifies what the analysis should answer/)).toBeTruthy();
    expect(screen.getByText(/Visual summaries can help communicate the patterns found/)).toBeTruthy();
    expect(screen.getByText("How it is used: Analyse and document social research data in a reproducible workflow.")).toBeTruthy();
    expect(screen.getByText("R produces a reproducible analysis summary.")).toBeTruthy();
    expect(screen.getByText("Currently selected")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("explains the learning purpose of a linked resource even when no rationale was recorded", () => {
    const noRationale = option("plain-link", "Plain link", "Use this guide when learning to interpret research data.");
    noRationale.linkRationale = undefined;
    noRationale.limitations = [];
    render(<ThemeProvider><AlternativeComparisonSheet
      group="Analysis tools"
      options={[noRationale, python]}
      visible
      onClose={jest.fn()}
      onSelect={jest.fn()}
    /></ThemeProvider>);

    expect(screen.getByText(/Why attached: This resource is attached as a place to learn or read more about Plain link/)).toBeTruthy();
    expect(screen.getAllByText(/may cover only part of that work/).length).toBeGreaterThan(0);
    expect(screen.getByText(/No item-specific limitation is recorded.*does not show that you have mastered it/)).toBeTruthy();
  });

  it("requires explicit confirmation before replacing the selected alternative", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(<ThemeProvider><AlternativeComparisonSheet
      group="Data analysis tools"
      options={[python, r]}
      selectedId="python"
      visible
      onClose={onClose}
      onSelect={onSelect}
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Choose R instead of Python" }));
    expect(screen.getByText("Replace “Python” with “R” in this route?")).toBeTruthy();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole("button", { name: "Confirm replacing Python with R" }));
    expect(onSelect).toHaveBeenCalledWith(r);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("adds a first choice directly when the route has no existing selection", () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    render(<ThemeProvider><AlternativeComparisonSheet
      group="Data analysis tools"
      options={[python, r]}
      visible
      onClose={onClose}
      onSelect={onSelect}
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Choose R" }));
    expect(onSelect).toHaveBeenCalledWith(r);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/Replace/)).toBeNull();
  });
});
