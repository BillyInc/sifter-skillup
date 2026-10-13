import type { CareerContextItem } from "@/types/career";
import { relationshipRecords, sequenceGuidanceText } from "./ContextRelationshipSheet";

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
    label: "Alternative",
    target: "R",
    explanation: "Both tools support reproducible analysis, but their workflows and ecosystems differ.",
    sequenceCondition: "Only for the advanced causal-estimation route.",
    sourceReferences: [{ title: "Methods comparison", url: "https://example.org/methods" }],
  })]);
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
  expect(sequenceGuidanceText("Python", relationship)).toContain("review Statistics foundations before Python");
});

test("does not turn a conditional sequence note into a universal prerequisite", () => {
  expect(sequenceGuidanceText("Python", {
    type: "builds_on",
    label: "Builds on",
    target: "Statistics foundations",
    sequenceApproved: true,
    sequencePolicy: "conditional_prerequisite",
    sequenceCondition: "Only for the advanced causal-estimation route.",
  })).toBe("When this applies: Only for the advanced causal-estimation route. This is conditional guidance, not a general requirement.");
});
