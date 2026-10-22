import type { CareerContextItem } from "@/types/career";
import { studentOptionalRoleLearningItems, studentRoleLearningItems } from "./roleLearningItems";

function approvedRoleItem(itemType: CareerContextItem["itemType"], itemKey: string): CareerContextItem {
  return {
    contextLevel: "role",
    contextKey: "D078|sociologist",
    domainId: "D078",
    itemType,
    itemKey,
    name: itemKey,
    plainMeaning: `What ${itemKey} means.`,
    contextualUse: `How ${itemKey} is used in sociological work.`,
    prerequisites: [],
    relatedItems: [],
    sourceIds: ["source-1"],
    sourceReferences: [{ title: "Role source", url: "https://example.org/role-source" }],
    sourceLocators: [{ sourceId: "source-1", locator: "section 1" }],
    geographicScope: "global",
    evidenceLimitations: ["Not proof of competence."],
    evidenceType: "source_supported_synthesis",
    sourceConfidence: "high",
    dataState: "source_backed",
    claimReviewState: "approved",
    claimEvidence: { claims: Object.fromEntries(
      ["item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"].map((claim) => [claim, {
        source_references: ["source-1"], source_locators: ["section 1"],
      }]),
    ) },
    linkState: "linked",
    linkUrl: "https://example.org/learn",
    linkTitle: `Learn ${itemKey}`,
    linkSourceReference: { title: "Learning guide", url: "https://example.org/learn" },
    linkEvidence: { destination_checked: true },
    linkAccessedAt: "2026-10-14",
    guidanceOwner: "role",
    verifiedAt: "2026-10-14",
  };
}

describe("studentRoleLearningItems", () => {
  it("keeps every approved role-owned item category, including tools and methods", () => {
    const rows = ["tool", "method", "knowledge", "skill", "competency", "certification"].map((type) =>
      approvedRoleItem(type as CareerContextItem["itemType"], type),
    );

    expect(studentRoleLearningItems(rows).map((item) => item.itemType)).toEqual([
      "tool", "method", "knowledge", "skill", "competency", "certification",
    ]);
  });

  it("does not promote legacy, unapproved, unlinked or differently owned rows", () => {
    const valid = approvedRoleItem("tool", "NVivo");
    const wrongOwner = { ...approvedRoleItem("tool", "SPSS"), guidanceOwner: "domain" as const };
    const unapproved = { ...approvedRoleItem("method", "interviews"), claimReviewState: "review_required" as const };
    const missingLink = { ...approvedRoleItem("knowledge", "social theory"), linkState: "no_link" as const, linkUrl: null };
    const legacyOnly = { ...approvedRoleItem("tool", "legacy spreadsheet"), dataState: "review_only" as const } as unknown as CareerContextItem;

    expect(studentRoleLearningItems([valid, wrongOwner, unapproved, missingLink, legacyOnly])).toEqual([valid]);
  });

  it("deduplicates duplicate typed item keys without merging distinct categories", () => {
    const tool = approvedRoleItem("tool", "Python");
    const duplicate = { ...tool, name: "Python (duplicate)" };
    const knowledge = approvedRoleItem("knowledge", "Python");

    expect(studentRoleLearningItems([tool, duplicate, knowledge])).toEqual([tool, knowledge]);
  });
});

describe("studentOptionalRoleLearningItems", () => {
  it("keeps reviewed optional items even when no task-group key is supplied", () => {
    const withoutUseCase = { ...approvedRoleItem("tool", "R"), requirementLevel: "useful" as const, useCaseKey: null };
    const withUseCase = { ...approvedRoleItem("method", "interviewing"), requirementLevel: "optional" as const, useCaseKey: "interview-study" };
    const needed = { ...approvedRoleItem("skill", "sampling"), requirementLevel: "needed" as const };

    expect(studentOptionalRoleLearningItems([withoutUseCase, withUseCase, needed])).toEqual([withoutUseCase, withUseCase]);
  });
});
