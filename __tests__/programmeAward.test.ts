/**
 * `programmes.qualification` is a blanket default — 159 of 239 rows are
 * literally "B.Sc / 4 years" — and for two programmes it contradicts the name
 * stored in the same row. The app was showing students:
 *
 *   Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)
 *   B.Sc  ·  4 years
 *
 * These pin the rule: believe the name over the column, and never invent.
 */
import { displayAward, awardLine } from "../src/lib/programmeAward";

describe("displayAward", () => {
  it("believes the programme name over a contradicting column", () => {
    expect(
      displayAward("Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "B.Sc"),
    ).toBe("MBBS/MBChB");
    expect(displayAward("Bachelor of Dental Surgery (BDS/BChD)", "B.Sc")).toBe(
      "BDS/BChD",
    );
  });

  it("keeps the stored award when the name declares nothing", () => {
    expect(displayAward("CIVIL ENGINEERING", "B.Sc")).toBe("B.Sc");
    expect(displayAward("Economics", "B.Sc")).toBe("B.Sc");
  });

  it("keeps the stored award when the two agree", () => {
    expect(displayAward("Common and Islamic Law", "LL.B")).toBe("LL.B");
  });

  it("uses the name's award when the column is empty", () => {
    expect(displayAward("Doctor of Veterinary Medicine (DVM)", null)).toBe("DVM");
  });

  it("returns null rather than an empty string when there is nothing to show", () => {
    expect(displayAward("Economics", null)).toBeNull();
    expect(displayAward("Economics", "   ")).toBeNull();
  });

  it("does not match award letters inside ordinary words", () => {
    // "Public Administration" must not trip the LL.B or BDS patterns.
    expect(displayAward("Public Administration", "B.Sc")).toBe("B.Sc");
    expect(displayAward("Building Technology", "B.Sc")).toBe("B.Sc");
  });
});

describe("awardLine", () => {
  it("renders award and duration together", () => {
    expect(awardLine("Economics", "B.Sc", 4)).toBe("B.Sc  ·  4 years");
  });

  it("keeps duration even when the award is corrected", () => {
    // Duration is left alone deliberately: nothing in the row contradicts it,
    // so dropping it would be a judgement about the data, not an observation.
    expect(
      awardLine("Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)", "B.Sc", 4),
    ).toBe("MBBS/MBChB  ·  4 years");
  });

  it("is empty when the row carries neither", () => {
    expect(awardLine("Economics", null, null)).toBe("");
  });

  it("renders a lone duration", () => {
    expect(awardLine("Dental Technology", null, 5)).toBe("5 years");
  });
});
