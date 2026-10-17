import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
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
  it("separates embedded task, output and guardrail copy in the tray details", () => {
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
    expect(screen.getByText("How it is used in this route")).toBeTruthy();
    expect(screen.getByText("Example of the work")).toBeTruthy();
    expect(screen.getByText("Compare two sources.")).toBeTruthy();
    expect(screen.getByText("What you may produce")).toBeTruthy();
    expect(screen.getByText("A cited comparison that states one limitation.")).toBeTruthy();
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
    expect(screen.getByText("How it is used in this route")).toBeTruthy();
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
    expect(screen.getByText("Compare the claim with its source.")).toBeTruthy();
    expect(screen.queryByText(/candidate|Route note:/i)).toBeNull();
  });

  it("opens from the icon, expands item details, and forwards relationship evidence", () => {
    render(<ThemeProvider><GuidedLearningTray stackSet={stackSet()} initialMode="icon" /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open learning plan tray with 2 selected items" }));
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
    expect(screen.getByText("What you may produce")).toBeTruthy();
    expect(screen.getByText("Evidence context")).toBeTruthy();
    expect(screen.getByText(/The evidence is international/)).toBeTruthy();
    expect(screen.getByText("Learning and reference links")).toBeTruthy();
    expect(screen.getByText("A little more context")).toBeTruthy();
    expect(screen.getAllByText(available.explanation!).length).toBe(1);
    expect(screen.getByRole("link", { name: "Open Survey design: official learning guide" })).toBeTruthy();
    expect(screen.getByText("Why this resource is attached")).toBeTruthy();
    expect(screen.getByText(/It teaches the same survey-planning steps described in this route/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open evidence source Survey design guide" })).toBeTruthy();
    expect(screen.getByText("Where to look: Chapter 3, section 2")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Builds on: Research foundations" }));
    expect(screen.getByText(/A research question states what the study is trying to find out and sets a boundary for the survey\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open relationship evidence: Research methods guide" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Open relationship evidence: Insecure reference" })).toBeNull();
  });

  it("opens a mounted collapsed tray when an item card requests tray visibility", () => {
    const stacks = stackSet();
    const { rerender } = render(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="icon" /></ThemeProvider>);

    expect(screen.getByRole("button", { name: "Open learning plan tray with 2 selected items" })).toBeTruthy();
    rerender(<ThemeProvider><GuidedLearningTray stackSet={stacks} initialMode="mid" /></ThemeProvider>);

    expect(screen.getByText("Choose learning focus")).toBeTruthy();
    expect(screen.getByText(/2 selected items/)).toBeTruthy();
  });

  it("shows a learner-facing resource reason when the attached link has no rationale field", () => {
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

    expect(screen.getByText("Why this resource is attached")).toBeTruthy();
    expect(screen.getByText(/This resource is attached as a place to learn or read more about Survey design/)).toBeTruthy();
    expect(screen.getByText(/may cover only part of that work/)).toBeTruthy();
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
    expect(screen.getByText("How it is used in this route")).toBeTruthy();
    expect(screen.getByText("A description of how this item is used on this route has not been provided yet.")).toBeTruthy();
    expect(screen.getByText("What it cannot prove or replace")).toBeTruthy();
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

    fireEvent.press(screen.getByRole("button", { name: "Compare analysis-tool options" }));
    expect(screen.getAllByText(/Alternative choice/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Python is a programming language: a way to write instructions that tell a computer how to work with information and repeat steps consistently\./)).toBeTruthy();
    expect(screen.getAllByText(/In Sociology, a learner might use Python to organise survey responses, check for missing values, and summarise patterns across a dataset\./).length).toBeGreaterThan(0);
    expect(screen.getByText(/Research methods: understand how a question, evidence and study design fit together before choosing computational steps\./)).toBeTruthy();
    expect(screen.getByText(/Python can carry out instructions consistently, but it cannot choose a suitable study design or repair biased or incomplete data on its own\./)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open learning destination for Python" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Choose Python" }));
    expect(onSelectAlternative).toHaveBeenCalledWith(routeKey, "analysis-tool", python);
  });
});
