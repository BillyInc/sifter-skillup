import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { StudentStageTable, stageLabel } from "./StudentStageTable";

describe("StudentStageTable", () => {
  it("renders plain counts per stage, split by signup route", () => {
    render(
      <ThemeProvider>
        <StudentStageTable
          rows={[
            { stage: "ss3_secondary", total: 3, selfSignedUp: 2, provisionedByYou: 1 },
            { stage: "not_recorded", total: 2, selfSignedUp: 1, provisionedByYou: 1 },
          ]}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText("Senior secondary (SS3)")).toBeTruthy();
    expect(screen.getByText("Stage not recorded yet")).toBeTruthy();
    expect(screen.getByText("Self-signed-up")).toBeTruthy();
  });

  it("renders nothing when there are no rows and falls back for unknown stages", () => {
    const { toJSON } = render(
      <ThemeProvider>
        <StudentStageTable rows={[]} />
      </ThemeProvider>,
    );
    expect(toJSON()).toBeNull();
    expect(stageLabel("some_new_stage")).toBe("some new stage");
  });
});
