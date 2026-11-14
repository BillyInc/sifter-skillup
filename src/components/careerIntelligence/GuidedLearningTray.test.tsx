import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ScrollView, StyleSheet } from "react-native";
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
  requirementLevel: "needed",
});
const secondSelected = candidate({
  id: "evidence-basics",
  name: "Evidence basics",
  layer: "domain",
  category: "useful_edge",
  requirementLevel: "useful",
});

const available = candidate({
  id: "survey-design",
  name: "Survey design",
  layer: "domain",
  category: "useful_edge",
  itemType: "tool",
  explanation: "A survey is useful when a study needs answers from many people in a consistent form. The shared questions make it possible to compare responses, while the study design still determines who should be asked and what conclusions the answers can support.",
  plainMeaning: "A survey is a planned way to collect information by asking people a set of questions. Researchers decide what each question is meant to measure, how people will answer, and how responses will be recorded so the information can be checked and analysed.",
  contextualUse: "In Sociology, a learner could use a survey to compare how different groups experience access to education, work, or public services. The questions and sample must fit the research question; a survey alone cannot explain why a difference exists or prove that one factor caused it.",
  expectedOutput: "The work can produce a documented set of responses, together with a record of who was asked and how the questions were administered. That record can then be checked and analysed, while its coverage and limits are stated clearly.",
  requirementLevel: "useful",
  geographicScope: "global",
  requirementReason: "This optional edge is useful when the study needs comparable answers from many people. It is not required for interview-based or archival routes.",
  programmeContext: "The Sociology programme introduces questions about social life and research evidence. This method is a possible extension, not a claim that the programme requires every learner to use it.",
  domainContext: "Across the social sciences, a survey can collect comparable answers, while the question and sample determine what those answers can support.",
  areaContext: "In Sociology, it can help examine how access to education or work differs between groups, provided the sample and wording fit the question.",
  roleContext: "A social researcher may use it to gather comparable responses and report who was included; the method alone does not establish why group differences occur.",
  linkTitle: "Survey design: official learning guide",
  linkRationale: "This guide walks through question design and sampling decisions that support the example task; it is more directly relevant than a generic statistics course.",
  learningLinks: [{ title: "Survey design: official learning guide", url: "https://example.org/survey-guide", locator: "Question design and sampling", kind: "Official guide", access: "Free" , rationale: "It teaches the same survey-planning steps described in this route." }],
  sourceReferences: [{ id: "survey-guide", title: "Survey design guide", url: "https://example.org/survey-guide" }],
  sourceLocators: [{ sourceId: "survey-guide", locator: "Chapter 3, section 2" }],
  relationships: [{
    type: "builds_on",
    targetId: "research-foundations",
    targetName: "Research foundations",
    status: "source_backed",
    explanation: "A research question states what the study is trying to find out and sets a boundary for the survey. It guides which information to collect, which people or cases to include, and what the resulting answers can reasonably tell the researcher.",
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
  it("gives Full a viewport-filling scroll area while Mid remains bounded", () => {
    const d078Route = {
      routeLabel: "Sociology · Social Sciences",
      choices: [{ id: "interviews", label: "Interviews", kind: "method" as const }],
      foundations: ["Frame a researchable social question"],
      selectedItems: [],
      onRemoveChoice: jest.fn(),
      onRemoveItem: jest.fn(),
    };
    const rendered = render(<ThemeProvider><GuidedLearningTray
      stackSet={buildLearningPlanStackSet({ routes: [], domainItems: [] })}
      d078Route={d078Route}
      initialMode="mid"
    /></ThemeProvider>);
    const routeScroll = () => rendered.UNSAFE_getByType(ScrollView);
    expect(StyleSheet.flatten(routeScroll().props.style).maxHeight).toBe(360);

    fireEvent.press(screen.getByRole("button", { name: "Show learning plan full size" }));
    const fullStyle = StyleSheet.flatten(routeScroll().props.style);
    expect(fullStyle.flex).toBe(1);
    expect(fullStyle.minHeight).toBe(0);
    expect(fullStyle.maxHeight).toBeUndefined();
  });

  it("keeps tray collapse, remove, reorder, and add controls at 44px or larger", () => {
    const d078Route = {
      routeLabel: "Sociology · Social Sciences",
      choices: [{ id: "interviews", label: "Interviews", kind: "method" as const }],
      foundations: ["Frame a researchable question"],
      selectedItems: [{ id: "interview-guide", label: "Prepare an interview guide", lane: "Useful for interviews", contextLevel: "domain" as const }],
      onRemoveChoice: jest.fn(),
      onRemoveItem: jest.fn(),
    };
    render(<ThemeProvider><GuidedLearningTray
      stackSet={stackSet()}
      d078Route={d078Route}
      initialMode="full"
      onDismiss={jest.fn()}
      onRemove={jest.fn()}
      onReorder={jest.fn()}
      onSelectCandidate={jest.fn()}
    /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Survey design" }));

    const controls = [
      screen.getByRole("button", { name: "Collapse learning plan tray to icon" }),
      screen.getByRole("button", { name: "Dismiss learning plan tray" }),
      screen.getByRole("button", { name: "Remove Interviews from your selected approaches" }),
      screen.getByRole("button", { name: "Remove Prepare an interview guide from your learning" }),
      screen.getByRole("button", { name: "Move Research foundations later in this plan" }),
      screen.getByRole("button", { name: "Add Survey design to this learning plan" }),
    ];
    controls.forEach((control) => {
      const style = StyleSheet.flatten(control.props.style);
      expect(style.minHeight ?? style.height).toBeGreaterThanOrEqual(44);
    });
    controls.slice(0, 4).forEach((control) => {
      const style = StyleSheet.flatten(control.props.style);
      expect(style.minWidth ?? style.width).toBeGreaterThanOrEqual(44);
    });
  });

  it("summarizes the D078 route and renders only the supplied route items", () => {
    const d078Route = {
      routeLabel: "Sociology · Social Sciences",
      choices: [
        { id: "interviews", label: "Interviews", kind: "method" as const },
        { id: "interview-observation", label: "Interviews + observation", kind: "combination" as const, combinationId: "interview-observation" },
      ],
      foundations: [
        "Frame a researchable social question",
        "Evaluate evidence and its limits",
        "Communicate findings for the intended audience",
      ],
      areaLabel: "Sociology and Social Anthropology",
      roleLabel: "Social Researcher",
      // These are the route-projection-filtered selections supplied by the journey.
      selectedItems: [
        { id: "interview-guide", label: "Prepare an interview guide", lane: "Useful for interviews", contextLevel: "domain" as const },
        { id: "field-notes", label: "Keep structured field notes", lane: "Useful with observation", contextLevel: "area" as const },
      ],
      onRemoveChoice: jest.fn(),
      onRemoveItem: jest.fn(),
    };
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [],
    });

    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} d078Route={d078Route} initialMode="full" /></ThemeProvider>);

    expect(screen.getByText("Sociology · Social Sciences")).toBeTruthy();
    expect(screen.getByText("2 selected method/designs · 2 added items")).toBeTruthy();
    expect(screen.getByText("Your selected approaches")).toBeTruthy();
    expect(screen.getByText("Interviews")).toBeTruthy();
    expect(screen.getByText("Interviews + observation")).toBeTruthy();
    expect(screen.getByText("Foundations carried on this route")).toBeTruthy();
    expect(screen.getByText("1. Frame a researchable social question")).toBeTruthy();
    expect(screen.getByText("2. Evaluate evidence and its limits")).toBeTruthy();
    expect(screen.getByText("3. Communicate findings for the intended audience")).toBeTruthy();
    expect(screen.getByText("Area: Sociology and Social Anthropology")).toBeTruthy();
    expect(screen.getByText("Role: Social Researcher")).toBeTruthy();
    expect(screen.getByText("Prepare an interview guide")).toBeTruthy();
    expect(screen.getByText("Keep structured field notes")).toBeTruthy();
    expect(screen.queryByText("Unselected survey questionnaire")).toBeNull();
    expect(screen.queryByText(/approved|student-approved/i)).toBeNull();
  });

  it("calls D078 remove-choice and remove-item callbacks with their selected values", () => {
    const choice = { id: "interviews", label: "Interviews", kind: "method" as const };
    const item = { id: "interview-guide", label: "Prepare an interview guide", lane: "Useful for interviews", contextLevel: "domain" as const };
    const onRemoveChoice = jest.fn();
    const onRemoveItem = jest.fn();
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [],
    });
    render(<ThemeProvider><GuidedLearningTray
      stackSet={stacks}
      d078Route={{
        routeLabel: "Sociology · Social Sciences",
        choices: [choice],
        foundations: ["Frame a researchable social question"],
        selectedItems: [item],
        onRemoveChoice,
        onRemoveItem,
      }}
      initialMode="full"
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Remove Interviews from your selected approaches" }));
    fireEvent.press(screen.getByRole("button", { name: "Remove Prepare an interview guide from your learning" }));

    expect(onRemoveChoice).toHaveBeenCalledTimes(1);
    expect(onRemoveChoice).toHaveBeenCalledWith(choice);
    expect(onRemoveItem).toHaveBeenCalledTimes(1);
    expect(onRemoveItem).toHaveBeenCalledWith("interview-guide");
  });

  it("keeps D078 route stacks independently labeled and only edits the active stack", () => {
    const activate = jest.fn();
    const removeStack = jest.fn();
    const route = (stackId: string, active: boolean, method: string): any => ({
      stackId,
      active,
      routeLabel: "Sociology · Social Sciences",
      choices: [{ id: method, label: method, kind: "method" as const }],
      foundations: ["Frame a researchable social question"],
      selectedItems: [],
      onRemoveChoice: jest.fn(),
      onRemoveItem: jest.fn(),
      onActivate: activate,
      onRemoveStack: removeStack,
    });
    render(<ThemeProvider><GuidedLearningTray
      stackSet={buildLearningPlanStackSet({ routes: [], domainItems: [] })}
      d078Routes={[route("d078-route-1", true, "Interviews"), route("d078-route-2", false, "Spatial analysis")]}
      initialMode="full"
    /></ThemeProvider>);

    expect(screen.getByText(/Route 1/)).toBeTruthy();
    expect(screen.getByText(/Route 2/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Use this route" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove Interviews from your selected approaches" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Remove Spatial analysis from your selected approaches" })).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Use this route" }));
    expect(activate).toHaveBeenCalledTimes(1);
  });

  it("keeps foundations visible without selected methods and shows safe empty added-items copy", () => {
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [],
    });
    render(<ThemeProvider><GuidedLearningTray
      stackSet={stacks}
      d078Route={{
        routeLabel: "Sociology · Social Sciences",
        choices: [],
        foundations: ["Frame a researchable social question", "Evaluate evidence and its limits"],
        selectedItems: [],
        onRemoveChoice: jest.fn(),
        onRemoveItem: jest.fn(),
      }}
      initialMode="full"
    /></ThemeProvider>);

    expect(screen.getByText("Foundations carried on this route")).toBeTruthy();
    expect(screen.getByText("1. Frame a researchable social question")).toBeTruthy();
    expect(screen.getByText("2. Evaluate evidence and its limits")).toBeTruthy();
    expect(screen.getByText("Your selected learning, by route level")).toBeTruthy();
    expect(screen.getByText("No additional items selected. The foundations and selected methods remain part of this route.")).toBeTruthy();
    expect(screen.queryByText("Your selected approaches")).toBeNull();
  });

  it("uses the available height in full tray mode instead of the mid-size scroll cap", () => {
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} d078Route={{
      routeLabel: "Sociology · Social Sciences",
      choices: [],
      foundations: ["Frame a researchable question"],
      selectedItems: [],
      onRemoveChoice: jest.fn(),
      onRemoveItem: jest.fn(),
    }} initialMode="full" /></ThemeProvider>);

    const tray = screen.getByTestId("guided-learning-tray");
    const trayStyle = StyleSheet.flatten(tray.props.style);
    const routeScroll = screen.UNSAFE_getAllByType(ScrollView).find((view) => {
      const style = StyleSheet.flatten(view.props.style);
      return style.flex === 1 && style.maxHeight === undefined;
    });
    expect(trayStyle).toMatchObject({ flex: 1, height: "100%", minHeight: 0 });
    expect(routeScroll).toBeTruthy();
  });

  it("counts D078 methods/designs and added items in the collapsed tray icon", () => {
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [],
    });
    render(<ThemeProvider><GuidedLearningTray
      stackSet={stacks}
      d078Route={{
        routeLabel: "Sociology · Social Sciences",
        choices: [
          { id: "interviews", label: "Interviews", kind: "method" },
          { id: "interview-observation", label: "Interviews + observation", kind: "combination", combinationId: "interview-observation" },
        ],
        foundations: ["Frame a researchable social question"],
        selectedItems: [
          { id: "interview-guide", label: "Prepare an interview guide", lane: "Useful for interviews", contextLevel: "domain" as const },
          { id: "field-notes", label: "Keep structured field notes", lane: "Useful with observation", contextLevel: "role" as const },
        ],
        onRemoveChoice: jest.fn(),
        onRemoveItem: jest.fn(),
      }}
      initialMode="icon"
    /></ThemeProvider>);

    expect(screen.getByRole("button", { name: /Open learning plan tray.*6 selected route details or learning choices/ })).toBeTruthy();
  });

  it("separates the task example and likely output within the learner explanation", () => {
    const embedded = candidate({
      ...available,
      id: "embedded-output",
      contextualUse: "Use this method for the selected question. Task: Compare two sources. Output: A cited comparison that states one limitation. Guardrail: Do not infer causes from a single association.",
      expectedOutput: undefined,
    });
    const stackSetWithEmbedded = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [embedded],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stackSetWithEmbedded} initialMode="full" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Survey design" }));
    expect(screen.getByText("How you might use it")).toBeTruthy();
    expect(screen.getByText("Example task")).toBeTruthy();
    expect(screen.getByText("Compare two sources.")).toBeTruthy();
    expect(screen.getByText("Possible result")).toBeTruthy();
    expect(screen.getByText("A cited comparison that states one limitation.")).toBeTruthy();
    expect(screen.queryByText("What you may produce")).toBeNull();
    expect(screen.getByText("What to keep in mind")).toBeTruthy();
    expect(screen.queryByText("A cited comparison that states one limitation. Guardrail: Do not infer causes from a single association.")).toBeNull();
    expect(screen.queryByText(/Output:|Task:|Guardrail:/)).toBeNull();
  });

  it("does not repeat definition and route-use text as extra context", () => {
    const plainMeaning = "A method is a planned way to investigate a question.";
    const contextualUse = "In Sociology, it helps compare how groups experience access to public services.";
    const combined = candidate({
      ...available,
      id: "combined-explanation",
      name: "Research method",
      plainMeaning,
      contextualUse,
      explanation: `${plainMeaning} ${contextualUse}`,
    });
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [combined],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="full" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Research method" }));

    expect(screen.getByText("What it is")).toBeTruthy();
    expect(screen.getByText(plainMeaning)).toBeTruthy();
    expect(screen.getByText("How you might use it")).toBeTruthy();
    expect(screen.getByText(contextualUse)).toBeTruthy();
    expect(screen.queryByText("A little more context")).toBeNull();
  });

  it("filters staff-only placement notes from tray explanations and uses a neutral route reason", () => {
    const staffCopy = candidate({
      ...available,
      id: "staff-copy",
      name: "Evidence review",
      requirementLevel: "needed",
      requirementReason: "Shared foundation candidate for evidence routes. Route note: show only within the selected area.",
      plainMeaning: "Evidence review is a way to check a claim. Route note: staff display instruction.",
      contextualUse: "Use it to assess a claim. Task: Compare the claim with its source. Guardrail: One source may be incomplete.",
    });
    const stackSetWithStaffCopy = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [staffCopy],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stackSetWithStaffCopy} initialMode="full" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Evidence review" }));

    expect(screen.getByText(/This item is part of the recommended learning for the selected route/)).toBeTruthy();
    expect(screen.getByText("Evidence review is a way to check a claim.")).toBeTruthy();
    expect(screen.getByText("Example task")).toBeTruthy();
    expect(screen.getByText("Compare the claim with its source.")).toBeTruthy();
    expect(screen.queryByText(/candidate|Route note:/i)).toBeNull();
  });

  it("shows relationships inline without opening a generic relationship sheet", () => {
    render(<ThemeProvider><GuidedLearningTray stackSet={stackSet()} initialMode="icon" /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: /Open learning plan tray.*4 selected route details or learning choices/ }));
    fireEvent.press(screen.getByRole("button", { name: "Small" }));
    expect(screen.queryByText("Choose learning focus")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Mid" }));
    expect(screen.getByText("Choose learning focus")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Full" }));
    expect(screen.getByText("Compulsory learning path")).toBeTruthy();
    expect(screen.getByText("Required step 1 · Domain learning · Compulsory domain foundation")).toBeTruthy();
    expect(screen.getByText("Optional useful edges you chose")).toBeTruthy();
    expect(screen.getByText("Optional choice · Domain learning · Optional useful edge")).toBeTruthy();
    expect(screen.getByText(/items at the same level are not automatically prerequisites for one another/)).toBeTruthy();
    expect(screen.getByText(/They sit alongside—not inside—the compulsory path/)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Survey design" }));

    expect(screen.getByText("What it is")).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText("What it is").props.style).fontSize).toBeGreaterThanOrEqual(18);
    expect(StyleSheet.flatten(screen.getByText(/A survey is a planned way to collect information/).props.style).fontSize).toBeGreaterThanOrEqual(16);
    expect(screen.getByText("How it connects to your programme")).toBeTruthy();
    expect(screen.getByText(/The Sociology programme introduces questions about social life and research evidence/)).toBeTruthy();
    expect(screen.getByText("What it means in this domain")).toBeTruthy();
    expect(screen.getByText("What it adds in this area")).toBeTruthy();
    expect(screen.getByText("How it applies to this role")).toBeTruthy();
    expect(screen.getByText("Why this optional item may help")).toBeTruthy();
    expect(screen.getByText(/you can add it alongside the compulsory learning for an additional advantage/)).toBeTruthy();
    expect(screen.queryByText("What you may produce")).toBeNull();
    expect(screen.queryByText("Evidence context")).toBeNull();
    expect(screen.getByText("Learning resources")).toBeTruthy();
    expect(screen.getByText("A little more context")).toBeTruthy();
    expect(screen.getAllByText(available.explanation!).length).toBe(1);
    expect(screen.getByRole("link", { name: "Open guide: Survey design: official learning guide for Survey design" })).toBeTruthy();
    expect(screen.queryByText("Why this resource is attached")).toBeNull();
    expect(screen.getByRole("link", { name: "Open evidence source Survey design guide" })).toBeTruthy();
    expect(screen.getByText("Where to look: Chapter 3, section 2")).toBeTruthy();
    expect(screen.getByText("How it connects to other learning")).toBeTruthy();
    expect(screen.getByText(/A research question states what the study is trying to find out and sets a boundary for the survey\./)).toBeTruthy();
    expect(screen.getByText(/Research foundations:.*helpful background/i)).toBeTruthy();
    expect(screen.queryByText("How the connection works")).toBeNull();
  });

  it("opens a mounted collapsed tray when an item card requests tray visibility", () => {
    const stacks = stackSet();
    const { rerender } = render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="icon" /></ThemeProvider>);

    expect(screen.getByRole("button", { name: /Open learning plan tray.*4 selected route details or learning choices/ })).toBeTruthy();
    rerender(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="mid" /></ThemeProvider>);

    expect(screen.getByText("Choose learning focus")).toBeTruthy();
    expect(screen.getByText(/4 selected route details or learning choices/)).toBeTruthy();
  });

  it("shows direct resource buttons without exposing internal resource-rationale copy", () => {
    const withoutRationale = candidate({
      ...available,
      id: "survey-guide-without-rationale",
      learningLinks: [{ title: "Survey planning guide", url: "https://example.org/survey", rationale: undefined }],
    });
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [withoutRationale],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="full" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Survey design" }));

    expect(screen.getByRole("link", { name: "Open guide: Survey planning guide for Survey design" })).toBeTruthy();
    expect(screen.queryByText("Why this resource is attached")).toBeNull();
  });

  it("leaves the resource area blank when every destination is unsafe for the student view", () => {
    const noStudentDestination = candidate({
      ...available,
      id: "unsafe-resource-only",
      name: "Unsafe resource example",
      learningLinks: [{ title: "Unencrypted guide", url: "http://example.org/guide" }],
      sourceReferences: [{ id: "unsafe-source", title: "Unencrypted source", url: "http://example.org/source" }],
    });
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [noStudentDestination.id] }],
      domainItems: [noStudentDestination],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="full" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Unsafe resource example" }));

    expect(screen.queryByText("Learning resources")).toBeNull();
    expect(screen.queryByText("Evidence for this item")).toBeNull();
    expect(screen.queryByText("No verified link is available yet.")).toBeNull();
  });

  it("keeps definition and route-use headings visible instead of leaving blank explanation sections", () => {
    const incomplete = candidate({
      ...available,
      id: "incomplete-explanation",
      name: "Incomplete explanation item",
      plainMeaning: undefined,
      explanation: undefined,
      contextualUse: undefined,
      limitations: [],
    });
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [] }],
      domainItems: [incomplete],
    });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="full" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Show explanation for Incomplete explanation item" }));

    expect(screen.getByText("What it is")).toBeTruthy();
    expect(screen.getByText("A plain-language explanation has not been provided for this item yet.")).toBeTruthy();
    expect(screen.getByText("How you might use it")).toBeTruthy();
    expect(screen.getByText(/Use it when it fits the work described for this route/)).toBeTruthy();
    expect(screen.queryByText("What it cannot prove or replace")).toBeNull();
    expect(screen.getByText(/No item-specific limitation is recorded.*does not show that you have mastered it/)).toBeTruthy();
  });

  it("wires add, remove, reorder, save, print, and share actions to their callbacks", () => {
    const secondRequired = candidate({
      id: "second-required",
      name: "Study design",
      layer: "domain",
      category: "shared_foundation",
      requirementLevel: "needed",
    });
    const actionStackSet = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [selected.id, secondRequired.id, secondSelected.id] }],
      domainItems: [selected, secondRequired, secondSelected, available],
    });
    const onSelectCandidate = jest.fn();
    const onRemove = jest.fn();
    const onReorder = jest.fn();
    const onSave = jest.fn();
    const onPrint = jest.fn();
    const onShare = jest.fn();
    render(<ThemeProvider><GuidedLearningTray
      stackSet={actionStackSet}
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

    fireEvent.press(screen.getByRole("button", { name: "Move Research foundations later in this plan" }));
    expect(onReorder).toHaveBeenCalledWith(routeKey, "foundation", undefined);
    fireEvent.press(screen.getByRole("button", { name: "Remove Research foundations from this plan" }));
    expect(onRemove).toHaveBeenCalledWith(routeKey, "foundation");

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

  it("keeps role additions out until the learner selects a role route", () => {
    const roleItem = candidate({
      id: "sociologist-role-method",
      name: "Interview coding for this role",
      layer: "role",
      category: "role_addition",
      routeScope: { roleIds: ["D078|sociologist"] },
    });
    const noRoleRoute = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078", areaId: "A01" }, selectedIds: [roleItem.id] }],
      roleItems: [roleItem],
    });
    const selectedRoleRoute = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078", areaId: "A01", roleId: "D078|sociologist" }, selectedIds: [roleItem.id] }],
      roleItems: [roleItem],
    });

    expect(noRoleRoute.stacks[0].roleAdditions).toHaveLength(0);
    expect(noRoleRoute.stacks[0].guardIssues.some((issue) => issue.candidateId === roleItem.id)).toBe(true);
    expect(selectedRoleRoute.stacks[0].roleAdditions.map((entry) => entry.id)).toContain(roleItem.id);
  });

  it("compares alternatives with contextual details before adding a choice", () => {
    const python = candidate({
      id: "python",
      name: "Python",
      layer: "domain",
      category: "alternative",
      alternativeGroup: "analysis-tool",
      itemType: "tool",
      explanation: "Python lets a researcher write repeatable instructions for working with data. It can support several stages of a research workflow, but the research question, method and evidence still determine whether the work is appropriate.",
      plainMeaning: "Python is a programming language: a way to write instructions that tell a computer how to work with information and repeat steps consistently. Learning Python can support research tasks, but knowing the language does not by itself make someone a researcher or show that their conclusions are reliable.",
      contextualUse: "In Sociology, a learner might use Python to organise survey responses, check for missing values, and summarise patterns across a dataset. The research question and design determine which steps are appropriate; Python carries out the instructions but does not decide whether a result is fair, representative, or causal.",
      prerequisiteNames: ["Research methods: understand how a question, evidence and study design fit together before choosing computational steps."],
      limitations: ["Python can carry out instructions consistently, but it cannot choose a suitable study design or repair biased or incomplete data on its own. A researcher must check assumptions, document decisions and explain what the results cannot establish."],
      relationships: [{
        type: "builds_on",
        targetId: "research-foundations",
        targetName: "Research foundations",
        status: "source_backed",
        explanation: "A research question states what the study is trying to find out and sets a boundary for the analysis. It helps the learner decide which data and calculations are relevant, and prevents code output from being treated as meaningful without reference to the study's aim.",
        sourceReferences: [{ title: "Methods reference", url: "https://example.org/methods" }],
      }],
    });
    const r = candidate({
      id: "r",
      name: "R",
      layer: "domain",
      category: "alternative",
      alternativeGroup: "analysis-tool",
      explanation: "R provides a programming environment with tools commonly used for statistical analysis and data visualisation. It can support a research workflow, but the learner still needs to understand the method and check whether the data support the conclusion.",
      plainMeaning: "R is a programming language and working environment used to organise data, carry out statistical calculations and create visual summaries. A learner can use it to make analysis steps repeatable, but the software does not decide whether a statistical method fits the question.",
    });
    const onSelectAlternative = jest.fn();
    const stacks = buildLearningPlanStackSet({
      routes: [{ route: { programmeId: "sociology", domainId: "D078" }, selectedIds: [selected.id] }],
      domainItems: [selected, python, r],
    });
    const routeKey = learningPlanRouteKey({ programmeId: "sociology", domainId: "D078" });
    render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="full" onSelectAlternative={onSelectAlternative} /></ThemeProvider>);

    const compareButton = screen.getByRole("button", { name: "Compare analysis-tool options" });
    expect(StyleSheet.flatten(compareButton.props.style).minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(compareButton);
    expect(screen.getAllByText(/Alternative choice/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Python is a programming language: a way to write instructions that tell a computer how to work with information and repeat steps consistently\./)).toBeTruthy();
    expect(screen.getAllByText(/In Sociology, a learner might use Python to organise survey responses, check for missing values, and summarise patterns across a dataset\./).length).toBeGreaterThan(0);
    expect(screen.getByText(/Research methods: understand how a question, evidence and study design fit together before choosing computational.*steps\./)).toBeTruthy();
    expect(screen.getByText(/Python can carry out instructions consistently, but it cannot choose a suitable study design or repair biased or incomplete data on its own\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open learning destination for Python" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Choose Python" }));
    expect(onSelectAlternative).toHaveBeenCalledWith(routeKey, "analysis-tool", python);
  });
});
