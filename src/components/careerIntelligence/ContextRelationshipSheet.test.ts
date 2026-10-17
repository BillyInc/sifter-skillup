import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";
import { ThemeProvider } from "@/theme";
import type { CareerContextItem } from "@/types/career";
import { ContextRelationshipSheet, relationshipLabel, relationshipRecords, sequenceGuidanceText, type StudentRelationship } from "./ContextRelationshipSheet";

const item: CareerContextItem = {
  contextLevel: "domain",
  contextKey: "D078",
  domainId: "D078",
  itemType: "tool",
  itemKey: "python",
  name: "Python",
  plainMeaning: "A programming language.",
  contextualUse: "Use it for a reviewed social-research workflow.",
  prerequisites: [],
  relatedItems: [],
  sourceIds: ["source-1"],
  sourceReferences: [{ title: "Source", url: "https://example.org/source" }],
  sourceLocators: [],
  geographicScope: "global",
  evidenceLimitations: [],
  evidenceType: "source_supported_synthesis",
  sourceConfidence: "high",
  dataState: "source_backed",
  claimReviewState: "approved",
  linkState: "linked",
  linkUrl: "https://example.org/learn",
  guidanceOwner: "domain",
  verifiedAt: "2026-10-12",
  relationships: [{
    relationshipType: "alternative",
    relationshipStatus: "source_backed",
    fromItemType: "tool",
    fromItemKey: "python",
    toItemType: "tool",
    toItemKey: "r",
    toName: "R",
    sourceReferences: [{ title: "Methods comparison", url: "https://example.org/methods" }],
    evidenceLimitations: ["The source does not compare these tools."],
  }],
};

test("does not present evidence limitations as a learner-facing relationship explanation", () => {
  expect(relationshipRecords(item)).toEqual([]);
});

test("shows a typed relationship only when its item-specific explanation exists", () => {
  expect(relationshipRecords({
    ...item,
    relationships: [{
      ...item.relationships![0],
      learnerExplanation: "Both tools support reproducible analysis, but their workflows and ecosystems differ.",
      sequenceApproved: true,
      sequencePolicy: "conditional_prerequisite",
      sequenceCondition: "Only for the advanced causal-estimation route.",
    }],
  })).toEqual([expect.objectContaining({
    label: "Choose one",
    target: "R",
    explanation: "Both tools support reproducible analysis, but their workflows and ecosystems differ.",
    sequenceCondition: "Only for the advanced causal-estimation route.",
    sourceReferences: [{ title: "Methods comparison", url: "https://example.org/methods" }],
  })]);
});

test("removes staff placement notes from relationship explanations without hiding the supported connection", () => {
  const [relationship] = relationshipRecords({
    ...item,
    relationships: [{
      ...item.relationships![0],
      learnerExplanation: "Both tools can support repeatable analysis. Route note: show only in the selected area.",
    }],
  });
  expect(relationship.explanation).toBe("Both tools can support repeatable analysis.");
  expect(relationship.explanation).not.toMatch(/Route note|selected area/);
});

test("keeps a route-scoped sequence off the domain overview and shows it inside its selected area", () => {
  const scoped = {
    ...item,
    relationships: [{
      relationshipType: "builds_on" as const,
      relationshipStatus: "source_backed" as const,
      fromItemType: "tool" as const,
      fromItemKey: "python",
      toItemType: "knowledge" as const,
      toItemKey: "statistics",
      toName: "Statistics foundations",
      learnerExplanation: "Statistics helps learners understand what the model estimates.",
      sequenceApproved: true,
      sequencePolicy: "hard_prerequisite" as const,
      sequenceScope: { domainIds: ["D078"], areaIds: ["economics"] },
      sourceReferences: [{ title: "Methods guide", url: "https://example.org/methods" }],
    }],
  };

  expect(relationshipRecords(scoped, { domainId: "D078" })).toEqual([]);
  const [relationship] = relationshipRecords(scoped, { domainId: "D078", areaId: "economics" });
  expect(relationship).toEqual(expect.objectContaining({
    sequenceApproved: true,
    sequencePolicy: "hard_prerequisite",
    sequenceScope: { domainIds: ["D078"], areaIds: ["economics"] },
  }));
  expect(sequenceGuidanceText("Python", relationship)).toContain("before you work on Python in this route");
});

test("does not turn a conditional sequence note into a universal prerequisite", () => {
  expect(sequenceGuidanceText("Python", {
    type: "builds_on",
    label: "Builds on",
    target: "Statistics foundations",
    sequenceApproved: true,
    sequencePolicy: "conditional_prerequisite",
    sequenceCondition: "Only for the advanced causal-estimation route.",
  })).toBe("When the advanced causal-estimation route is selected, learn Statistics foundations before Python. Otherwise, it is not a required first step.");
});

test("uses relationship-specific student guidance for choices, companions and task support", () => {
  expect(relationshipLabel("requires")).toBe("Related learning");
  expect(relationshipLabel("requires", true, "hard_prerequisite")).toBe("Learn first");
  expect(relationshipLabel("builds_on", true, "conditional_prerequisite")).toBe("Learn first if this applies");
  expect(sequenceGuidanceText("Python", {
    type: "alternative",
    label: "Choose one",
    target: "R",
  })).toContain("you do not need to learn both as steps");
  expect(sequenceGuidanceText("Python", {
    type: "complements",
    label: "Useful alongside",
    target: "Jupyter",
    sequenceApproved: true,
    sequencePolicy: "hard_prerequisite",
  })).toContain("Adding one does not automatically add the other");
  expect(sequenceGuidanceText("Python", {
    type: "supports",
    label: "Supports this task or route",
    target: "survey analysis",
  })).toContain("does not by itself make either item required");
});

test("opens the tapped relationship target and returns to the same connection/source item", () => {
  const relationship: StudentRelationship = {
    type: "builds_on",
    label: "Builds on",
    target: "Research question design",
    targetItemKey: "research-design",
    targetItemType: "method",
    explanation: "A clear question helps you choose a method that can answer it.",
    sequenceApproved: true,
    sequencePolicy: "hard_prerequisite",
    sourceReferences: [{ title: "Methods guide", url: "https://example.org/methods" }],
  };
  const onClose = jest.fn();

  render(React.createElement(ThemeProvider, null,
    React.createElement(ContextRelationshipSheet, {
      itemName: "Survey analysis",
      relationships: [relationship],
      initialRelationship: relationship,
      visible: true,
      onClose,
    }),
  ));

  fireEvent.press(screen.getByRole("button", { name: "Open target Research question design" }));
  expect(screen.getByText("Research question design")).toBeTruthy();
  expect(screen.getByText("Why it connects")).toBeTruthy();
  expect(StyleSheet.flatten(screen.getByText("Why it connects").props.style).fontSize).toBeGreaterThanOrEqual(18);
  expect(StyleSheet.flatten(screen.getByText("A clear question helps you choose a method that can answer it.").props.style).fontSize).toBeGreaterThanOrEqual(16);
  expect(screen.getByText("A clear question helps you choose a method that can answer it.")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Open relationship evidence: Methods guide" })).toBeTruthy();

  fireEvent.press(screen.getByRole("button", { name: "Back to connection" }));
  expect(screen.getByRole("button", { name: "Open target Research question design" })).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "Back to Survey analysis" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("uses the supplied open-target action when the route host can navigate to the item", () => {
  const relationship: StudentRelationship = {
    type: "alternative",
    label: "Alternative",
    target: "R",
    targetItemKey: "r",
    targetItemType: "tool",
    explanation: "Both support statistical analysis through different workflows.",
  };
  const onOpenTarget = jest.fn();
  const onClose = jest.fn();

  render(React.createElement(ThemeProvider, null,
    React.createElement(ContextRelationshipSheet, {
      itemName: "Python",
      relationships: [relationship],
      initialRelationship: relationship,
      visible: true,
      onClose,
      onOpenTarget,
    }),
  ));
  fireEvent.press(screen.getByRole("button", { name: "Open target R" }));
  expect(onOpenTarget).toHaveBeenCalledWith(relationship);
  expect(onClose).toHaveBeenCalledTimes(1);
});
