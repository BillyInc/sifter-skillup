import React from "react";
import { render, screen } from "@testing-library/react-native";
import { DegreeSkills } from "./DegreeSkills";
import { ThemeProvider } from "@/theme";
import type { ProgrammeCurriculumContract } from "@/types/career";

describe("DegreeSkills programme preview", () => {
  it("shows source-backed programme abilities in the preview when no course outcomes exist", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [],
      abilities: [{
        abilityId: "ability-1",
        displayTitle: "Use evidence",
        sourceText: "You will use evidence to explain a practical issue",
        studentText: "You will use evidence to explain a practical issue",
        sourceLocator: { page: 12 },
        dataState: "source_backed",
      }],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} variant="teaser" /></ThemeProvider>);

    expect(screen.getByText("A quick look at what you will study")).toBeTruthy();
    expect(screen.getByText("You will use evidence to explain a practical issue.")).toBeTruthy();
    expect(screen.queryByText(/checked programme learning preview will appear here/i)).toBeNull();
  });
});
