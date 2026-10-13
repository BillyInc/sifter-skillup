import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import type { CareerContextItem } from "@/types/career";
import { ContextualItemList } from "./ContextualItemList";

jest.mock("./GuidanceReportButton", () => ({ GuidanceReportButton: () => null }));

const item: CareerContextItem = {
  contextLevel: "domain",
  contextKey: "D078",
  domainId: "D078",
  itemType: "skill",
  itemKey: "research-design",
  name: "Research design",
  plainMeaning: "Research design is the plan that links a research question to the information and methods needed to answer it.",
  contextualUse: "Social science research uses different methods to study people and society.",
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
    targetLabel: "Computational and Quantitative Social Research",
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
  it("shows a domain use-case option and its supported downstream area", () => {
    render(<ThemeProvider><ContextualItemList items={[item]} contextLevel="domain" /></ThemeProvider>);

    expect(screen.getByText("Skill · Domain learning option")).toBeTruthy();
    expect(screen.getByText("Optional at this level")).toBeTruthy();
    expect(screen.getByText("Research and evidence · designing social research")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "How it fits" }));
    expect(screen.getByText("Downstream paths this supports")).toBeTruthy();
    expect(screen.getByText(/Computational and Quantitative Social Research · useful/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Read the OpenLearn guide to research methodology" })).toBeTruthy();
  });
});
