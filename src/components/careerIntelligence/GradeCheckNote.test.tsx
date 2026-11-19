import React from "react";
import { render } from "@testing-library/react-native";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("../../theme", () => ({
  Spacing: { xs: 3, sm: 6 },
  FontSize: { sm: 12 },
  useTheme: () => ({ colors: { success: "#0a0", warning: "#a60", textMuted: "#666" } }),
}));

import { GradeCheckNote } from "./GradeCheckNote";

const base = { id: "p", matchedSubjectCount: 5, matchedSubjects: [], matchBasis: "olevel" } as any;

describe("GradeCheckNote", () => {
  it("renders nothing without a gradeCheck (no-grade behaviour unchanged)", () => {
    expect(render(<GradeCheckNote item={base} />).toJSON()).toBeNull();
  });

  it.each([
    ["met", "Grades meet this requirement"],
    ["not_met", "Grades may not meet this requirement"],
    ["unknown", "Add your grade to check"],
  ])("labels %s with a reason and a confirm-with-JAMB footnote", (status, label) => {
    const ui = render(<GradeCheckNote item={{ ...base, gradeCheck: { status, conditions: [{ kind: "credit_subject", status, required: "r", note: "Short reason." }] } }} />);
    expect(ui.getByText(label)).toBeTruthy();
    expect(ui.getByText("Short reason.")).toBeTruthy();
    expect(ui.getByText(/Confirm with JAMB or the institution/)).toBeTruthy();
    expect(ui.queryByText(/admitted|eligible for admission|qualif/i)).toBeNull();
  });

  it("labels university-specific rules by school name", () => {
    const ui = render(<GradeCheckNote item={{
      ...base,
      schoolOfferings: [{ schoolId: "u1", schoolName: "Local University", programmeName: "X" }],
      universitySpecificMatches: [{ schoolId: "u1", examType: "olevel", matchedSubjects: [], gradeCheck: { status: "not_met", conditions: [] } }],
    }} />);
    expect(ui.getByText("Local University: Grades may not meet this requirement")).toBeTruthy();
  });
});
