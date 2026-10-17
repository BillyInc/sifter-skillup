import type { CareerContextItem } from "@/types/career";
import { domainStageItems } from "./cumulativeLearningPath";

function approvedItem(overrides: Partial<CareerContextItem> = {}): CareerContextItem {
  const reference = { title: "Source", url: "https://example.org/source" };
  const locator = { section: "reviewed section" };
  const claims = Object.fromEntries(["item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"].map((key) => [key, {
    source_references: [reference],
    source_locators: [locator],
  }]));
  return {
    contextLevel: "domain",
    contextKey: "D078",
    domainId: "D078",
    itemType: "skill",
    itemKey: "evaluate-evidence",
    name: "Evaluate evidence",
    plainMeaning: "Check what evidence supports.",
    contextualUse: "Use this when interpreting social research.",
    prerequisites: [],
    relatedItems: [],
    sourceIds: ["source-1"],
    sourceReferences: [reference],
    sourceLocators: [locator],
    geographicScope: "global",
    evidenceLimitations: [],
    evidenceType: "source_supported_synthesis",
    sourceConfidence: "high",
    dataState: "source_backed",
    claimReviewState: "approved",
    claimEvidence: { claims },
    linkState: "linked",
    linkUrl: "https://example.org/learn",
    linkTitle: "Learning guide",
    linkSourceReference: reference,
    linkAccessedAt: "2026-10-14",
    linkEvidence: { verified: true },
    guidanceOwner: "domain",
    requirementLevel: "needed",
    verifiedAt: "2026-10-14",
    ...overrides,
  };
}

describe("domainStageItems", () => {
  it("keeps use-case-specific domain options out of the shared foundation", () => {
    const shared = approvedItem();
    const focused = approvedItem({
      itemKey: "digital-trace-ethics",
      name: "Digital trace ethics",
      useCaseKey: "digital-trace-research",
      requirementLevel: "useful",
    });
    const optionalWithoutUseCase = approvedItem({
      itemKey: "optional-without-use-case",
      name: "Optional item without a task key",
      requirementLevel: "optional",
    });

    expect(domainStageItems([], [shared, focused, optionalWithoutUseCase])).toEqual([
      { itemType: "skill", name: "Evaluate evidence" },
    ]);
  });

  it("does not promote unreviewed domain items into the shared foundation", () => {
    const unreviewed = approvedItem({ claimReviewState: "review_required" });
    expect(domainStageItems([], [unreviewed])).toEqual([]);
  });
});
