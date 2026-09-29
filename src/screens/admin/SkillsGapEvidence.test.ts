import type { ProgrammeResourceEvidence } from "@/types/institution";
import { hasItemSpecificExpectationEvidence, isConfirmedExpectationGap } from "./programmeEvidence";

function record(overrides: Partial<ProgrammeResourceEvidence> = {}): ProgrammeResourceEvidence {
  return {
    name: "Example skill",
    kind: "skill",
    source: "role",
    state: "bridge",
    marketState: "market_practice_evidence",
    dataState: "source_backed",
    evidenceState: "verified",
    sourceLocator: { document: "official-role-standard.pdf", page: 4 },
    ...overrides,
  };
}

describe("Programme Intelligence expectation evidence", () => {
  it("only counts a gap when item-specific evidence, an approved evidence state and a retained locator exist", () => {
    expect(isConfirmedExpectationGap(record())).toBe(true);
    expect(isConfirmedExpectationGap(record({ sourceLocator: {} }))).toBe(false);
    expect(isConfirmedExpectationGap(record({ dataState: undefined }))).toBe(false);
    expect(isConfirmedExpectationGap(record({ evidenceState: "review_required" }))).toBe(false);
  });

  it("does not turn taxonomy reach, optional context or non-capability rows into market expectations", () => {
    expect(hasItemSpecificExpectationEvidence(record({ marketState: "source_review" }))).toBe(false);
    expect(isConfirmedExpectationGap(record({ kind: "relationship" }))).toBe(false);
    expect(isConfirmedExpectationGap(record({ kind: "resource" }))).toBe(false);
    expect(isConfirmedExpectationGap(record({ state: "covered" }))).toBe(false);
  });
});
