import { programmeTrust } from "../src/lib/programmeTrust";

const req = (over: any = {}) => ({
  utmeSubjects: null, olevelRequirement: null, directEntry: null,
  parseStatus: "parsed", variesByInstitution: false, ...over,
});
const school: any = { schoolId: "s1", schoolName: "Uni" };

describe("programmeTrust", () => {
  it("is Not available without any payload", () => {
    expect(programmeTrust(null, null).statusLabel).toBe("Not available");
  });
  it("is Verified only for complete evidence", () => {
    expect(programmeTrust(req({ requirementStatus: "complete" }), school).statusLabel).toBe("Verified");
  });
  it("is Needs confirmation for review-only or flagged records", () => {
    expect(programmeTrust(req({ requirementStatus: "review_only" }), school).status).toBe("needs_confirmation");
    expect(programmeTrust(req({ requirementStatus: "complete" }), { ...school, universityExceptionStatus: "needs_confirmation" }).status).toBe("needs_confirmation");
    expect(programmeTrust(req({ parseStatus: "needs_review" }), school).status).toBe("needs_confirmation");
  });
  it("is Not available for source_missing or unknown status", () => {
    expect(programmeTrust(req({ requirementStatus: "source_missing" }), school).status).toBe("not_available");
    expect(programmeTrust(req(), school).status).toBe("not_available");
  });
  it("never invents a date or URL", () => {
    const t = programmeTrust(req({ requirementStatus: "complete" }), school);
    expect(t.recordedOn).toBeUndefined();
    expect(t.officialSourceUrl).toBeUndefined();
  });
  it("uses payload date, source label and https url only", () => {
    const t = programmeTrust(req({
      requirementStatus: "complete", parsedAt: "2026-09-01T10:00:00Z",
      sourceEvidence: [
        { layer: "direct_entry", sourceLabel: "DE" },
        { layer: "utme", sourceLabel: "JAMB brochure", sourceUrl: "https://example.org/b" },
      ],
    }), school);
    expect(t.recordedOn).toBe("2026-09-01");
    expect(t.sourceLabel).toBe("JAMB brochure");
    expect(t.officialSourceUrl).toBe("https://example.org/b");
    const bad = programmeTrust(req({ sourceEvidence: [{ layer: "utme", sourceUrl: "http://x.org" }] }), school);
    expect(bad.officialSourceUrl).toBeUndefined();
  });
});
