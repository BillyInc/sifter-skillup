import type { CareerContextItem } from "@/types/career";
import { contextItemsToLearningCandidates } from "./guidedLearningPlanAdapter";
import { addToLearningPlan } from "./guidedLearningPlan";

function item(overrides: Partial<CareerContextItem>): CareerContextItem {
  return {
    contextLevel: "domain",
    contextKey: "D078",
    domainId: "D078",
    itemType: "tool",
    itemKey: "python",
    name: "Python",
    plainMeaning: "A programming language.",
    contextualUse: "Use it for a reproducible text-analysis workflow.",
    prerequisites: [],
    relatedItems: [],
    sourceIds: ["src-1"],
    sourceReferences: [{ id: "src-1", title: "Official guide", url: "https://example.com/source", region: "global", evidenceType: "official_documentation" }],
    sourceLocators: [{ locator: "section 1" }],
    geographicScope: "nigeria_to_global",
    evidenceLimitations: ["Does not replace research design."],
    evidenceType: "source_supported_synthesis",
    sourceConfidence: "high",
    dataState: "source_backed",
    claimReviewState: "approved",
    linkState: "linked",
    linkUrl: "https://example.com/learn",
    linkTitle: "Task-specific guide",
    guidanceOwner: "domain",
    verifiedAt: "2026-10-09",
    relationships: [],
    ...overrides,
  };
}

test("maps reviewed context items to route-scoped candidates without legacy inference", () => {
  const methods = item({
    itemType: "skill",
    itemKey: "research-methods",
    name: "Research methods",
    plainMeaning: "Ways to plan and carry out a study.",
    contextualUse: "Use them to choose and justify a study design.",
  });
  const python = item({
    prerequisites: ["Research methods"],
    relationships: [
      {
        relationshipType: "alternative",
        relationshipStatus: "source_backed",
        fromItemType: "tool",
        fromItemKey: "python",
        toItemType: "tool",
        toItemKey: "r",
        toName: "R",
        learnerExplanation: "Python and R can both support reproducible analysis; choose between them based on the workflow and libraries you need.",
        sourceReferences: [{ title: "Official comparison", url: "https://example.org/compare" }],
      },
      {
        relationshipType: "builds_on",
        relationshipStatus: "source_backed",
        sequenceApproved: true,
        sequencePolicy: "hard_prerequisite",
        sequenceScope: { domainIds: ["D078"] },
        fromItemType: "tool",
        fromItemKey: "python",
        toItemType: "skill",
        toItemKey: "research-methods",
        toName: "Research methods",
        learnerExplanation: "A research question and method guide what a text-analysis script should measure.",
        sourceReferences: [{ title: "Research workflow guidance", url: "https://example.org/research-workflow" }],
      },
    ],
  });
  const r = item({
    itemKey: "r",
    name: "R",
    relationships: [{
      relationshipType: "alternative",
      relationshipStatus: "source_backed",
      fromItemType: "tool",
      fromItemKey: "r",
      toItemType: "tool",
      toItemKey: "python",
      toName: "Python",
      learnerExplanation: "R and Python can both support reproducible analysis; choose between them based on the workflow and libraries you need.",
    }],
  });
  const unresolved = item({
    itemKey: "nvivo",
    name: "NVivo",
    claimReviewState: "review_required",
    linkState: "review_required",
  });

  const candidates = contextItemsToLearningCandidates([methods, python, r, unresolved]);
  const pythonCandidate = candidates.find((candidate) => candidate.name === "Python")!;
  const rCandidate = candidates.find((candidate) => candidate.name === "R")!;
  const hidden = candidates.find((candidate) => candidate.name === "NVivo")!;

  expect(pythonCandidate.id).toBe("domain:D078:tool:python");
  expect(pythonCandidate.sourceReferences).toEqual([
    { id: "src-1", title: "Official guide", url: "https://example.com/source", region: "global", evidenceType: "official_documentation" },
  ]);
  expect(pythonCandidate.sourceLocators).toEqual([{ locator: "section 1" }]);
  expect(pythonCandidate.sourceConfidence).toBe("high");
  expect(pythonCandidate.verifiedAt).toBe("2026-10-09");
  expect(pythonCandidate.visibility).toBe("selectable");
  expect(pythonCandidate.category).toBe("shared_foundation");
  expect(pythonCandidate.routeScope).toEqual({ domainIds: ["D078"] });
  expect(pythonCandidate.prerequisiteIds).toEqual(["domain:D078:skill:research-methods"]);
  expect(pythonCandidate.prerequisiteNames).toEqual(["Research methods"]);
  expect(pythonCandidate.alternativeGroup).toBe(rCandidate.alternativeGroup);
  expect(pythonCandidate.relationships).toHaveLength(2);
  expect(pythonCandidate.relationships).toEqual(expect.arrayContaining([
    expect.objectContaining({
      targetId: "domain:D078:tool:r",
      targetName: "R",
      sourceReferences: [{ title: "Official comparison", url: "https://example.org/compare" }],
    }),
    expect.objectContaining({
      type: "builds_on",
      targetId: "domain:D078:skill:research-methods",
      targetName: "Research methods",
      sequenceApproved: true,
      sequencePolicy: "hard_prerequisite",
    }),
  ]));
  expect(hidden.visibility).toBe("hidden");
  expect(hidden.claimReviewState).toBe("review_required");
});

test("plain-text or review-required prerequisite labels do not block selection or impose sequence", () => {
  const python = item({
    prerequisites: ["Research methods"],
    relationships: [{
      relationshipType: "builds_on",
      relationshipStatus: "review_required",
      fromItemType: "tool",
      fromItemKey: "python",
      toItemType: "skill",
      toItemKey: "research-methods",
      toName: "Research methods",
      learnerExplanation: "This relationship has not completed review.",
      sourceReferences: [{ title: "Candidate source", url: "https://example.org/candidate" }],
    }],
  });
  const methods = item({
    itemType: "skill",
    itemKey: "research-methods",
    name: "Research methods",
  });
  const candidates = contextItemsToLearningCandidates([python, methods]);
  const pythonCandidate = candidates.find((candidate) => candidate.name === "Python")!;
  const result = addToLearningPlan({ route: { domainId: "D078" }, selectedIds: [] }, pythonCandidate, candidates);

  expect(pythonCandidate.prerequisiteIds).toEqual([]);
  expect(pythonCandidate.prerequisiteNames).toBeUndefined();
  expect(result.blockedByPrerequisites).toEqual([]);
  expect(result.selection.selectedIds).toEqual([pythonCandidate.id]);
});

test("a conditional source-backed relationship remains guidance, not a blocking prerequisite", () => {
  const methods = item({ itemType: "skill", itemKey: "research-methods", name: "Research methods" });
  const python = item({
    relationships: [{
      relationshipType: "builds_on",
      relationshipStatus: "source_backed",
      sequenceApproved: true,
      sequencePolicy: "conditional_prerequisite",
      sequenceCondition: "Only for the causal-estimation route.",
      sequenceScope: { domainIds: ["D078"], areaIds: ["economics"] },
      fromItemType: "tool",
      fromItemKey: "python",
      toItemType: "skill",
      toItemKey: "research-methods",
      toName: "Research methods",
      learnerExplanation: "Use research methods to choose what an analysis should answer.",
      sourceReferences: [{ title: "Source", url: "https://example.org/methods" }],
    }],
  });
  const candidate = contextItemsToLearningCandidates([python, methods]).find((row) => row.name === "Python")!;
  const result = addToLearningPlan({ route: { domainId: "D078", areaId: "economics" }, selectedIds: [] }, candidate, [candidate]);

  expect(candidate.prerequisiteIds).toEqual([]);
  expect(candidate.relationships?.[0]).toEqual(expect.objectContaining({
    sequencePolicy: "conditional_prerequisite",
    sequenceCondition: "Only for the causal-estimation route.",
  }));
  expect(result.blockedByPrerequisites).toEqual([]);
  expect(result.selection.selectedIds).toEqual([candidate.id]);
});

test("does not turn evidence limitations into relationship explanations or selectable alternatives", () => {
  const python = item({
    relationships: [{
      relationshipType: "alternative",
      relationshipStatus: "source_backed",
      fromItemType: "tool",
      fromItemKey: "python",
      toItemType: "tool",
      toItemKey: "r",
      toName: "R",
      evidenceLimitations: ["This source does not compare Python with R."],
      sourceReferences: [{ title: "Source", url: "https://example.com/source" }],
    }],
  });
  const r = item({ itemKey: "r", name: "R" });

  const candidates = contextItemsToLearningCandidates([python, r]);
  const pythonCandidate = candidates.find((candidate) => candidate.name === "Python")!;
  const rCandidate = candidates.find((candidate) => candidate.name === "R")!;

  expect(pythonCandidate.relationships).toEqual([]);
  expect(pythonCandidate.alternativeGroup).toBeUndefined();
  expect(rCandidate.alternativeGroup).toBeUndefined();
});

test("keeps a source-backed relationship out of the plan until its learner explanation is reviewed", () => {
  const python = item({
    relationships: [{
      relationshipType: "complements",
      relationshipStatus: "source_backed",
      fromItemType: "tool",
      fromItemKey: "python",
      toItemType: "method",
      toItemKey: "content-analysis",
      toName: "Content analysis",
      evidenceLimitations: ["The cited source covers only one application."],
      sourceReferences: [{ title: "Source", url: "https://example.com/source" }],
    }],
  });
  const [candidate] = contextItemsToLearningCandidates([python]);

  expect(candidate.relationships).toEqual([]);
  expect(candidate.complementOf).toEqual([]);
});

test("treats the subgroup source owner as the student-facing area owner", () => {
  const areaItem = item({
    contextLevel: "subgroup",
    contextKey: "research-area",
    itemKey: "survey-design",
    name: "Survey design",
    guidanceOwner: "subgroup",
  });
  const [candidate] = contextItemsToLearningCandidates([areaItem]);
  expect(candidate.layer).toBe("area");
  expect(candidate.guidanceOwner).toBe("area");
  expect(candidate.visibility).toBe("selectable");
});
