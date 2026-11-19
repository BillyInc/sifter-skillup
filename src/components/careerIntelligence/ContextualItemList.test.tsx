import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import type { CareerContextItem } from "@/types/career";
import { plainText } from "./testGloss";
import { ContextualItemList, explainResourceRationale, matchesItemScope } from "./ContextualItemList";

jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

const mockGuided = jest.fn();
const mockSubgroup = jest.fn();
const mockRole = jest.fn();
jest.mock("@/lib/exploreNav", () => ({ useExploreNav: () => ({ guided: mockGuided, subgroup: mockSubgroup, role: mockRole }) }));
jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("./GuidanceReportButton", () => ({
  GuidanceReportButton: ({ onOpenPlan }: { onOpenPlan?: () => void }) => {
    const ReactNative = jest.requireActual<typeof import("react-native")>("react-native");
    return onOpenPlan
      ? <ReactNative.TouchableOpacity accessibilityRole="button" accessibilityLabel="Open learning tray after saving" onPress={onOpenPlan}><ReactNative.Text>Open learning tray</ReactNative.Text></ReactNative.TouchableOpacity>
      : null;
  },
}));

const item: CareerContextItem = {
  contextLevel: "domain",
  contextKey: "D078",
  domainId: "D078",
  itemType: "skill",
  itemKey: "research-design",
  name: "Research design",
  plainMeaning: "Research design is the plan that links a research question to the information and methods needed to answer it.",
  contextualUse: "Social science research uses different methods to study people and society. Route note: Show only within the selected route. Task: Compare a question with the information needed to answer it. Guardrail: A design cannot correct weak or biased evidence.",
  expectedOutput: "For a sample question, name the information needed and explain why a method could help.",
  priority: "optional",
  priorityReason: "Useful on research paths, not a universal requirement.",
  requirementLevel: "optional",
  requirementReason: "Optional across the domain; useful for the linked areas.",
  themeKey: "research",
  themeLabel: "Research and evidence",
  useCaseKey: "designing-social-research",
  prerequisites: [],
  relatedItems: [],
  sourceIds: ["esrc"],
  sourceReferences: [{ title: "ESRC guidelines", url: "https://example.org/esrc" }],
  sourceLocators: [{ page: 24 }],
  geographicScope: "global",
  evidenceLimitations: ["Not a universal employment requirement."],
  evidenceType: "source_supported_synthesis",
  sourceConfidence: "high",
  dataState: "source_backed",
  claimReviewState: "approved",
  claimEvidence: { claims: { item_identity: { source_references: ["esrc"], source_locators: [{ page: 24 }] } } },
  linkState: "linked",
  linkUrl: "https://learn.example.org/methodology",
  linkTitle: "Read the OpenLearn guide to research methodology",
  linkSourceReference: { title: "OpenLearn", url: "https://learn.example.org/methodology" },
  linkAccessedAt: "2026-10-08",
  linkEvidence: { checked: true },
  guidanceOwner: "domain",
  verifiedAt: "2026-10-08",
  pathTargets: [{
    targetLevel: "subgroup",
    targetKey: "D078|sg:21",
    targetLabel: "Computational and Digital Social Science",
    useCaseKey: "designing-social-research",
    requirementLevel: "useful",
    pathReason: "A planned design helps match a social question to suitable methods.",
    relationshipStatus: "source_backed",
    sourceIds: ["esrc"],
    sourceReferences: [{ title: "ESRC guidelines", url: "https://example.org/esrc" }],
    evidenceLimitations: ["Does not require programming or a single method."],
  }],
};

describe("ContextualItemList", () => {
  it("explains terse resource rationales with the item's route use and exact locator", () => {
    const rationale = explainResourceRationale("question-writing learning", {
      ...item,
      contextualUse: "How it is used: Use this when designing a questionnaire so respondents can understand each question and answer it consistently.",
      linkSourceReference: { title: "Survey guide", locator: "Writing clear survey questions, section 2" },
    });

    expect(rationale).toContain("learn or review question-writing learning");
    expect(rationale).toContain("supports the work explained above");
    expect(rationale).toContain("Writing clear survey questions, section 2");
    expect(rationale).toContain("not proof of competence");
    expect(explainResourceRationale("This is already a sufficiently detailed explanation with the source's purpose, route connection and a clear distinction from professional qualification.", item))
      .toBe("This is already a sufficiently detailed explanation with the source's purpose, route connection and a clear distinction from professional qualification.");
  });

  it("gives an attached resource a cautious explanation when its evidence has no rationale text", () => {
    const rationale = explainResourceRationale("", {
      ...item,
      contextualUse: "Use research design to match a social question to suitable information and methods.",
    });
    expect(rationale).toContain("This resource is attached as a place to learn or read more about Research design.");
    expect(rationale).toContain("supports the work explained above");
    expect(rationale).toContain("not proof that you can already do the work");
  });

  it("uses the reviewed requirement level, not use-case presence, for every level", () => {
    const needed = { ...item, contextLevel: "role" as const, requirementLevel: "needed" as const, useCaseKey: "role-task" };
    const optional = { ...item, contextLevel: "role" as const, requirementLevel: "optional" as const, useCaseKey: "role-task" };
    expect(matchesItemScope(needed, "role", "shared-foundation")).toBe(true);
    expect(matchesItemScope(needed, "role", "learning-options")).toBe(false);
    expect(matchesItemScope(optional, "role", "shared-foundation")).toBe(false);
    expect(matchesItemScope(optional, "role", "learning-options")).toBe(true);
    expect(matchesItemScope({ ...item, requirementLevel: "needed", useCaseKey: "route-task" }, "domain", "shared-foundation")).toBe(true);
    expect(matchesItemScope({ ...item, requirementLevel: "needed", useCaseKey: null }, "domain", "learning-options")).toBe(false);
    expect(matchesItemScope({ ...item, requirementLevel: "useful", useCaseKey: null }, "domain", "learning-options")).toBe(true);
    expect(matchesItemScope({ ...item, requirementLevel: null, useCaseKey: null }, "subgroup", "learning-options")).toBe(true);
    expect(matchesItemScope({ ...item, requirementLevel: null, useCaseKey: null }, "subgroup", "shared-foundation")).toBe(false);
  });

  it("describes the domain compulsory branch by requirement, not as a generic shared-foundation list", () => {
    render(<ThemeProvider><ContextualItemList items={[{ ...item, requirementLevel: "needed" }]} contextLevel="domain" itemScope="shared-foundation" title="Compulsory domain foundations" /></ThemeProvider>);

    expect(screen.getByText("These foundations give you a common base for exploring different areas of the field.")).toBeTruthy();
    expect(screen.queryByText(/shared starting points/)).toBeNull();
    expect(screen.queryByText(/Choose from these additional options/)).toBeNull();
  });

  it("does not turn missing role-owned records into a claim that the role has no learning needs", () => {
    render(<ThemeProvider><ContextualItemList items={[]} contextLevel="role" itemScope="learning-options" title="Role-specific learning options" /></ThemeProvider>);

    expect(screen.getByText("No reviewed task-specific options were returned for this role.")).toBeTruthy();
    expect(screen.getByText(/This response may be incomplete; it does not mean the role has no relevant skills, methods, tools or knowledge\./)).toBeTruthy();
  });

  it("shows a domain use-case option and its supported downstream area", () => {
    render(<ThemeProvider><ContextualItemList items={[item]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);

    expect(screen.getByText("Skill")).toBeTruthy();
    expect(screen.getByText("Optional learning focus")).toBeTruthy();
    expect(screen.queryByText("How you might use it")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.getByText("How you might use it")).toBeTruthy();
    expect(screen.getByText("Why it may help on this direction")).toBeTruthy();
    expect(screen.getByText(/Computational and Digital Social Science · Useful for this route/)).toBeTruthy();
    expect(screen.getByText(plainText("A planned design helps match a social question to suitable methods."))).toBeTruthy();
    // Task and output now read as sentences inside the single "How you might use it" section.
    expect(screen.getByText(/For example, Compare a question with the information needed to answer it\./)).toBeTruthy();
    expect(screen.getByText(/This work may result in: For a sample/)).toBeTruthy();
    expect(screen.getByText("What to keep in mind")).toBeTruthy();
    expect(screen.getByText(plainText("A design cannot correct weak or biased evidence."))).toBeTruthy();
    expect(screen.queryByText(/Route note|Task:|Guardrail:|Show only within/)).toBeNull();
    expect(screen.getByRole("link", { name: /OpenLearn guide to research methodology/ })).toBeTruthy();
  });

  it("shows an explanatory item summary before expansion, then replaces it with separately labelled details", () => {
    render(<ThemeProvider><ContextualItemList items={[item]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);

    const summary = screen.getByText(plainText(item.plainMeaning));
    expect(summary).toBeTruthy();
    expect(StyleSheet.flatten(summary.props.style).fontSize).toBeGreaterThanOrEqual(16);
    expect(StyleSheet.flatten(summary.props.style).lineHeight).toBeGreaterThanOrEqual(24);
    expect(screen.queryByText("What it is")).toBeNull();

    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.getByText("What it is")).toBeTruthy();
    expect(screen.getAllByText(plainText(item.plainMeaning))).toHaveLength(1);
    expect(screen.getByText("How you might use it")).toBeTruthy();
  });

  it("never renders empty definition or route-use sections when an approved payload is incomplete", () => {
    const incomplete = { ...item, plainMeaning: undefined, contextualUse: undefined, evidenceLimitations: [] } as unknown as CareerContextItem;
    render(<ThemeProvider><ContextualItemList items={[incomplete]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);

    expect(screen.getByText("A plain-language explanation has not been provided for this item yet.")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.getByText("What it is")).toBeTruthy();
    expect(screen.getByText("How you might use it")).toBeTruthy();
    // The fallback sentence shares the "How you might use it" section with any recorded task and output.
    expect(screen.getByText(/^A description of how this item is used at this level has not been provided yet\./)).toBeTruthy();
    expect(screen.queryByText(/undefined|null/)).toBeNull();
  });

  it("shows the programme connection as its own labelled section, separate from the item's use", () => {
    const locallyAnchored = {
      ...item,
      geographicScope: "nigeria_to_global" as const,
      programmeContext: "The programme gives a starting point; this evidence context explains where this item's supporting evidence comes from.",
    };
    render(<ThemeProvider><ContextualItemList items={[locallyAnchored]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));

    expect(screen.getByText("How this builds on your programme")).toBeTruthy();
    expect(screen.getByText(/The programme gives a starting point/)).toBeTruthy();
    expect(screen.getByText("How you might use it")).toBeTruthy();
  });

  it("separates an embedded output from task narration instead of displaying a jumbled label", () => {
    const itemWithOutput: CareerContextItem = {
      ...item,
      expectedOutput: "Task: Compare a question with available evidence. Output: A short evidence plan naming the source, method and one limitation.",
    };
    render(<ThemeProvider><ContextualItemList items={[itemWithOutput]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.getByText(/This work may result in: A short evidence/)).toBeTruthy();
    expect(screen.queryByText(/Task: Compare a question/)).toBeNull();
    expect(screen.queryByText(/Output:/)).toBeNull();
  });

  it("uses the same embedded output and guardrail sections as the learning tray", () => {
    const itemWithEmbeddedOutput: CareerContextItem = {
      ...item,
      contextualUse: "Use this method for the selected question. Task: Compare two sources. Output: A cited comparison that states one limitation. Guardrail: Do not infer causes from a single association.",
      expectedOutput: null,
    };
    render(<ThemeProvider><ContextualItemList items={[itemWithEmbeddedOutput]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.getByText("How you might use it")).toBeTruthy();
    // Meaning, task and output are separated by the shared parser and read as sentences in one section.
    expect(screen.getByText(/^Use this method \(.*\) for the selected question\.\s+For example, Compare two sources\.\s+This work may result in: A cited comparison that states one limitation\.$/s)).toBeTruthy();
    expect(screen.getByText("What to keep in mind")).toBeTruthy();
    expect(screen.getByText("Do not infer causes from a single association.")).toBeTruthy();
    expect(screen.queryByText(/Output:|Task:|Guardrail:/)).toBeNull();
  });

  it("carries distinct role-specific meaning into a selected role route without duplicating general use", () => {
    const routeItem: CareerContextItem = {
      ...item,
      roleContext: "For a social researcher, the design helps defend why the selected evidence can answer the project's question and what it cannot establish.",
      pathTargets: [{
        targetLevel: "role",
        targetKey: "D078|social-researcher",
        targetLabel: "Social researcher",
        requirementLevel: "useful",
        pathReason: "It helps the researcher justify the evidence plan for a defined task.",
        relationshipStatus: "source_backed",
        sourceIds: ["esrc"],
        sourceReferences: [{ title: "ESRC guidelines", url: "https://example.org/esrc" }],
        evidenceLimitations: [],
      }],
    };
    const { rerender } = render(<ThemeProvider><ContextualItemList
      items={[routeItem]}
      contextLevel="domain"
      itemScope="learning-options"
      roleName="Social researcher"
      learningRoute={{ programmeId: "sociology", domainId: "D078", roleId: "D078|social-researcher" }}
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.getByText("How it connects to this role")).toBeTruthy();
    expect(screen.getByText(plainText(routeItem.roleContext!))).toBeTruthy();
    expect(screen.getByText("How you might use it")).toBeTruthy();

    rerender(<ThemeProvider><ContextualItemList
      items={[routeItem]}
      contextLevel="domain"
      itemScope="learning-options"
      learningRoute={{ programmeId: "sociology", domainId: "D078" }}
    /></ThemeProvider>);
    expect(screen.queryByText("How it connects to this role")).toBeNull();

    const duplicateRoleItem = { ...routeItem, roleContext: item.contextualUse };
    rerender(<ThemeProvider><ContextualItemList
      items={[duplicateRoleItem]}
      contextLevel="domain"
      itemScope="learning-options"
      roleName="Social researcher"
      learningRoute={{ programmeId: "sociology", domainId: "D078", roleId: "D078|social-researcher" }}
    /></ThemeProvider>);
    expect(screen.queryByText("How it connects to this role")).toBeNull();
  });

  it("does not show role-specific meaning until a role route is selected and suppresses duplicate copy", () => {
    const routeItem: CareerContextItem = {
      ...item,
      roleContext: item.contextualUse,
    };
    const { unmount } = render(<ThemeProvider><ContextualItemList
      items={[{ ...routeItem, roleContext: "Role-specific explanation not selected yet." }]}
      contextLevel="domain"
      roleName="Social researcher"
      learningRoute={{ programmeId: "sociology", domainId: "D078" }}
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.queryByText("How it connects to this role")).toBeNull();

    unmount();
    render(<ThemeProvider><ContextualItemList
      items={[routeItem]}
      contextLevel="domain"
      roleName="Social researcher"
      learningRoute={{ programmeId: "sociology", domainId: "D078", roleId: "D078|social-researcher" }}
    /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.queryByText("How it connects to this role")).toBeNull();
  });

  it("keeps item types together inside shared and route-option bands", () => {
    const tool = { ...item, itemType: "tool" as const, itemKey: "field-tool", name: "Field tool", useCaseKey: null, requirementLevel: "needed" as const };
    const credential = { ...item, itemType: "certification" as const, itemKey: "route-credential", name: "Route credential", requirementLevel: "useful" as const };
    render(<ThemeProvider><ContextualItemList items={[tool, credential]} contextLevel="domain" itemScope="shared-foundation" /></ThemeProvider>);
    expect(screen.getByText("Tool")).toBeTruthy();
    expect(screen.getByText("Needed for this chosen route")).toBeTruthy();
    expect(screen.queryByText("Certification or qualification")).toBeNull();
  });

  it.each(["skill", "tool", "competency", "certification", "method", "knowledge", "resource"] as const)(
    "gives each %s card a separate definition and domain-use explanation",
    (itemType) => {
      const typedItem: CareerContextItem = {
        ...item,
        itemType,
        itemKey: `explained-${itemType}`,
        name: `Reviewed ${itemType}`,
        plainMeaning: "This capability means planning how a social question can be answered with appropriate evidence. The plan makes clear what information is needed and what it can reasonably show.",
        contextualUse: "In Social Sciences, a learner can use this when investigating how people or institutions experience a public issue. The question and evidence determine the method; the item itself does not prove a conclusion.",
      };
      render(<ThemeProvider><ContextualItemList items={[typedItem]} contextLevel="domain" /></ThemeProvider>);
      fireEvent.press(screen.getByRole("button", { name: `Open details for Reviewed ${itemType}` }));

      expect(screen.getByText("What it is")).toBeTruthy();
      expect(screen.getByText(plainText(typedItem.plainMeaning))).toBeTruthy();
      expect(screen.getByText("How you might use it")).toBeTruthy();
      expect(screen.getByText(plainText(typedItem.contextualUse, { exact: false }))).toBeTruthy();
    },
  );

  it("places an explicitly approved hard prerequisite before the item that needs it", () => {
    const prerequisite = { ...item, itemKey: "foundation", name: "Foundation", useCaseKey: "route" };
    const advanced = {
      ...item,
      itemKey: "advanced",
      name: "Advanced method",
      priority: "start_here" as const,
      relationships: [{
        relationshipType: "builds_on" as const,
        relationshipStatus: "source_backed" as const,
        sequenceApproved: true,
        sequencePolicy: "hard_prerequisite" as const,
        fromItemType: "skill" as const,
        fromItemKey: "advanced",
        toItemType: "skill" as const,
        toItemKey: "foundation",
        toName: "Foundation",
      }],
    };
    const { UNSAFE_getAllByType } = render(<ThemeProvider><ContextualItemList items={[advanced, prerequisite]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);
    const texts = UNSAFE_getAllByType(Text).map((node) => String(node.props.children ?? ""));
    expect(texts.indexOf("Foundation")).toBeLessThan(texts.indexOf("Advanced method"));
  });

  it("shows a role-owned tool as separate, readable sections with its own route context and resource rationale", () => {
    const tool: CareerContextItem = {
      ...item,
      contextLevel: "role",
      contextKey: "D078|sociologist",
      guidanceOwner: "role",
      itemType: "tool",
      itemKey: "nvivo",
      name: "NVivo",
      plainMeaning: "NVivo is software for organising and analysing qualitative research material.",
      contextualUse: "For a sociologist, it can help organise interview transcripts and compare patterns across participants. Task: Code a set of interview extracts and keep a traceable record of the themes. Guardrail: Software can help organise interpretation but cannot decide whether an interpretation is fair.",
      expectedOutput: "A coded set of extracts with a documented theme structure.",
      useCaseKey: "analysing-interview-material",
      prerequisites: ["A clear research question and a documented coding plan"],
      complements: ["A codebook that explains how the themes were applied"],
      validAlternatives: ["Manual coding may fit a small set of documents."],
      requirementLevel: "useful",
      linkEvidence: { why_this_resource: "This guide teaches the software's qualitative coding workflow used in the example above." },
      additionalLearningLinks: [{
        title: "NVivo practice walkthrough",
        url: "https://learn.example.org/nvivo-walkthrough",
        kind: "video_learning",
        locator: "Coding interview transcripts",
      }],
      relationships: [{
        relationshipType: "builds_on",
        relationshipStatus: "source_backed",
        reviewedContractRelationship: true,
        learnerExplanation: "A clear research question helps the learner decide what to code and compare.",
        sequenceApproved: false,
        sequencePolicy: "advisory",
        fromItemType: "tool",
        fromItemKey: "nvivo",
        toItemType: "method",
        toItemKey: "qualitative-analysis",
        toName: "Qualitative analysis",
      }],
    };
    render(<ThemeProvider><ContextualItemList
      items={[tool]}
      resources={[
        { id: "nvivo-docs", targetName: "NVivo", provider: "NVivo official documentation", resourceType: "tool_learning", region: "global", accessType: "free", delivery: "documentation", url: "https://official.example.org/nvivo", ownershipScope: "role", reviewStatus: "approved_guidance_v1", description: "Official product documentation for the coding workflow." },
        { id: "nvivo-video", targetName: "NVivo", provider: "Research Skills Video", resourceType: "tool_learning", region: "global", accessType: "free", delivery: "video course", url: "https://learn.example.org/nvivo-video", ownershipScope: "role", reviewStatus: "approved_guidance_v1", description: "A video lesson that demonstrates coding interview material." },
        { id: "nvivo-paid", targetName: "NVivo", provider: "NVivo Training", resourceType: "tool_learning", region: "global", accessType: "paid", delivery: "course", url: "https://learn.example.org/nvivo-paid", ownershipScope: "role", reviewStatus: "approved_guidance_v1", description: "A paid alternative for guided practice with qualitative coding." },
        { id: "nvivo-no-description", targetName: "NVivo", provider: "NVivo learning page", resourceType: "tool_learning", region: "global", accessType: "free", delivery: "online guide", url: "https://learn.example.org/nvivo-unspecified", ownershipScope: "role", reviewStatus: "approved_guidance_v1" },
      ]}
      contextLevel="role"
      itemScope="learning-options"
      learningFocus
      learningRoute={{ programmeId: "sociology", domainId: "D078", areaId: "A01", roleId: "D078|sociologist" }}
      roleName="Sociologist"
      domainName="Social Sciences and Behavioural Studies"
      areaName="Sociology and Social Anthropology"
    /></ThemeProvider>);

    expect(screen.getByText("Tool")).toBeTruthy();
    expect(screen.getByText("Useful option for this work")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open details for NVivo" }));
    const labels = ["What it is", "How you might use it", "Why it may help on this direction", "What to keep in mind", "What may help you prepare", "What can work alongside it", "Other approaches to consider", "How it connects to other learning", "Learn more about NVivo"];
    // Headings whose children are split (e.g. "Learn more about " + name) are compared as one string.
    const rendered = screen.UNSAFE_getAllByType(Text).map((node) => [node.props.children].flat().join(""));
    const positions = labels.map((label) => rendered.findIndex((value) => value === label));
    expect(positions.map((position, index) => position < 0 ? labels[index] : null).filter(Boolean)).toEqual([]);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    // Section headings are 15px semibold (reduced from 18px in d7dda1f); body copy stays at 16px or more.
    expect(StyleSheet.flatten(screen.getByText("What it is").props.style).fontSize).toBeGreaterThanOrEqual(15);
    expect(StyleSheet.flatten(screen.getByText(plainText(tool.plainMeaning)).props.style).fontSize).toBeGreaterThanOrEqual(16);
    expect(screen.getByText(/^A clear research question \(.*\) and a documented coding/)).toBeTruthy();
    expect(screen.getByText(/^A codebook \(.*\) that explains how the themes were applied/)).toBeTruthy();
    expect(screen.getByText(/^Manual coding \(.*\) may fit a small set of documents\./)).toBeTruthy();
    expect(screen.getByText(/This work may result in: A coded set of extracts/)).toBeTruthy();
    // Each resource keeps its own description (as plain text, not as a "where to start" locator) and an exact locator where one exists.
    expect(screen.getByText("Official product documentation for the coding workflow.")).toBeTruthy();
    expect(screen.getByText("A video lesson that demonstrates coding interview material.")).toBeTruthy();
    expect(screen.getByText("Where to start: Coding interview transcripts")).toBeTruthy();
    expect(screen.queryByText(/Where to start: (Official|A video|A paid)/)).toBeNull();
    expect(screen.getByRole("button", { name: "See related learning: Qualitative analysis" })).toBeTruthy();
    expect(screen.getAllByText("Free to access").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Paid; check provider")).toBeTruthy();
    // Resources named after the item itself are told apart by provider, so link names are distinct.
    expect(screen.getByRole("link", { name: "Open NVivo official documentation" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Watch Research Skills Video" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open NVivo Training" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open NVivo learning page" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Watch NVivo practice walkthrough" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open learning tray after saving" }));
    expect(mockGuided).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({
      programmeId: "sociology",
      domainId: "D078",
      areaId: "A01",
      roleId: "D078|sociologist",
      focused: true,
      openTray: true,
    }));
  });

  it("opens a linked alternative tool and lets the learner return to the original card", () => {
    const sourceTool: CareerContextItem = {
      ...item,
      contextLevel: "role", contextKey: "D078|sociologist", guidanceOwner: "role",
      itemType: "tool", itemKey: "tool-a", name: "Tool A", requirementLevel: "optional",
      relationships: [{
        relationshipType: "alternative", relationshipStatus: "source_backed",
        fromItemType: "tool", fromItemKey: "tool-a", toItemType: "tool", toItemKey: "tool-b",
        toName: "Tool B", learnerExplanation: "Choose Tool B when its workflow or access fits this task better.",
        sequenceApproved: false, sequencePolicy: "none",
        sourceReferences: [{ title: "Tool A and B documentation", url: "https://example.org/tools" }],
      }],
    };
    const targetTool: CareerContextItem = {
      ...sourceTool, itemKey: "tool-b", name: "Tool B", relationships: [],
    };
    render(<ThemeProvider><ContextualItemList items={[sourceTool, targetTool]} contextLevel="role" itemScope="learning-options" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open details for Tool A" }));
    // The relationship is explained inline; its target opens with one press.
    expect(screen.getByText(/Tool B is another approach to consider\./)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "See related learning: Tool B" }));
    expect(screen.getByRole("button", { name: "Hide details for Tool B" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Return to Tool A" }));
    expect(screen.getByRole("button", { name: "Hide details for Tool A" })).toBeTruthy();
  });

  it("opens an approved related role route with full context and preserves history", () => {
    const roleTarget: CareerContextItem = {
      ...item,
      relationships: [],
      pathTargets: [{
        targetLevel: "role",
        targetKey: "D078|sociologist",
        targetLabel: "Sociologist",
        requirementLevel: "useful",
        pathReason: "This tool can support a sociologist who is organizing interview material.",
        relationshipStatus: "source_backed",
        sourceIds: ["esrc"],
        sourceReferences: [{ title: "ESRC guidelines", url: "https://example.org/esrc" }],
        evidenceLimitations: [],
      }],
    };
    const learningRoute = { programmeId: "sociology", domainId: "D078", areaId: "A01" };
    render(<ThemeProvider><ContextualItemList
      items={[roleTarget]}
      contextLevel="domain"
      itemScope="learning-options"
      learningRoute={learningRoute}
      routeRoleIds={["D078|sociologist"]}
      learningFocus
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    fireEvent.press(screen.getByRole("button", { name: "Open role: Sociologist" }));

    expect(mockRole).toHaveBeenCalledWith(expect.any(Object), "D078|sociologist", expect.objectContaining({
      programmeId: "sociology",
      domainId: "D078",
      areaId: "A01",
      roleId: "D078|sociologist",
      focused: true,
      preserveHistory: true,
    }));
  });

  it("opens an approved related area route with its context and preserves history", () => {
    const areaTarget: CareerContextItem = { ...item, relationships: [] };
    render(<ThemeProvider><ContextualItemList
      items={[areaTarget]}
      contextLevel="domain"
      itemScope="learning-options"
      learningRoute={{ programmeId: "sociology", domainId: "D078" }}
      learningFocus
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    fireEvent.press(screen.getByRole("button", { name: "Open area: Computational and Digital Social Science" }));

    expect(mockSubgroup).toHaveBeenCalledWith(expect.any(Object), "D078", "D078|sg:21", expect.objectContaining({
      programmeId: "sociology",
      domainId: "D078",
      areaId: "D078|sg:21",
      focused: true,
      preserveHistory: true,
    }));
  });

  it("offers no route navigation when there is no selected domain route to carry", () => {
    render(<ThemeProvider><ContextualItemList items={[item]} contextLevel="domain" itemScope="learning-options" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open details for Research design" }));
    expect(screen.queryByRole("button", { name: /^Open (area|role):/ })).toBeNull();
  });
});
