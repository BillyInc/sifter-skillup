import { gradeCheckLabel, pruneGrades, sameGrades, isOlevelGrade, OLEVEL_GRADES } from "./olevelGrades";

describe("olevelGrades helpers", () => {
  it("knows the A1-F9 scale", () => {
    expect(OLEVEL_GRADES).toEqual(["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"]);
    expect(isOlevelGrade("C4")).toBe(true);
    expect(isOlevelGrade("G1")).toBe(false);
    expect(isOlevelGrade(undefined)).toBe(false);
  });

  it("drops grades for removed subjects and invalid values", () => {
    expect(
      pruneGrades({ Mathematics: "C4", Biology: "A1", English: "Z9" }, ["mathematics", "English"]),
    ).toEqual({ mathematics: "C4" });
    expect(pruneGrades(undefined, ["Mathematics"])).toEqual({});
  });

  it("compares grade sets irrespective of key order", () => {
    expect(sameGrades({ a: "A1", b: "C4" }, { b: "C4", a: "A1" })).toBe(true);
    expect(sameGrades({ a: "A1" }, { a: "B2" })).toBe(false);
  });

  it("labels each status without claiming admission", () => {
    const met = gradeCheckLabel({ status: "met", conditions: [{ kind: "credit_subject", status: "met", required: "r", note: "Your Mathematics grade (C4) meets the credit requirement." }] });
    const notMet = gradeCheckLabel({ status: "not_met", conditions: [{ kind: "credit_subject", status: "not_met", required: "r", note: "Your Mathematics grade (D7) is below a credit (C6)." }] });
    const unknown = gradeCheckLabel({ status: "unknown", conditions: [] });
    expect(met).toMatchObject({ label: "Grades meet this requirement" });
    expect(met?.reason).toContain("meets the credit requirement");
    expect(notMet).toMatchObject({ label: "Grades may not meet this requirement" });
    expect(unknown).toMatchObject({ label: "Add your grade to check", reason: null });
    for (const l of [met, notMet, unknown]) {
      expect(`${l?.label} ${l?.reason ?? ""}`).not.toMatch(/admit|admission|eligible|qualif/i);
    }
    expect(gradeCheckLabel(undefined)).toBeNull();
  });
});
