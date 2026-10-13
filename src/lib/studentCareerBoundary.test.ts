import { isApprovedStudentContextItem } from "./studentCareerBoundary";
import type { CareerContextItem } from "@/types/career";

const approvedItem = (overrides: Record<string, unknown> = {}) => ({
  contextLevel: "domain",
  claimReviewState: "approved",
  linkState: "linked",
  linkUrl: "https://example.org/learn",
  linkAccessedAt: "2026-10-08",
  linkSourceReference: { title: "Learning guide" },
  linkEvidence: { destination_checked: true },
  claimEvidence: {
    claims: Object.fromEntries(
      ["item_identity", "checkpoint_fit", "plain_meaning", "contextual_use"].map((key) => [key, {
        source_references: ["source-1"],
        source_locators: ["section 1"],
      }]),
    ),
  },
  ...overrides,
} as unknown as CareerContextItem);

describe("isApprovedStudentContextItem", () => {
  it("allows only an explicitly reviewed item with claim and learning-link evidence", () => {
    expect(isApprovedStudentContextItem(approvedItem())).toBe(true);
  });

  it.each([
    ["missing claim approval", { claimReviewState: "review_required" }],
    ["missing link approval", { linkState: "no_link" }],
    ["unsafe link", { linkUrl: "http://example.org/learn" }],
    ["missing access date", { linkAccessedAt: null }],
    ["missing link source", { linkSourceReference: {} }],
    ["missing claim evidence", { claimEvidence: { claims: {} } }],
  ])("hides an item with %s", (_label, overrides) => {
    expect(isApprovedStudentContextItem(approvedItem(overrides))).toBe(false);
  });
});
