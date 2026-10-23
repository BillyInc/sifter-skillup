import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";
import { ThemeProvider } from "@/theme";
import type { ProgrammeDomainConnection } from "@/types/career";
import { ProgrammeCurriculumCarryForward, ProgrammeOutcomeBridge } from "./ProgrammeCurriculumCarryForward";

const connection = {
  programmeId: "sociology",
  programmeName: "Sociology",
  relationship: "direct",
  explanation: "Sociology connects to the domain.",
  curriculumAvailable: true,
  programmeCurriculumThemes: [{
    themeKey: "research",
    title: "Research and evidence",
    summary: "Learn how social evidence is gathered and interpreted.",
    narration: "Research methods connect questions about social life to evidence.",
    connectionExplanation: "This gives a useful starting point for the field, while the domain adds wider methods and tools.",
    directTransferEvidenceStatus: "matched",
    matchedCourseCodes: ["SOC 301"],
    matchedOutcomeIds: ["outcome-1"],
    courseAnchors: [],
    matchedCourseAnchors: [],
    programmeOutcomes: [{
      outcomeId: "outcome-1",
      courseCode: "SOC 301",
      courseTitle: "Methods of Social Research and Statistics",
      studentText: "Choose suitable ways to collect and analyse evidence about social life.",
      sourceLocator: {},
    }],
    transferableEvidence: [],
  }, {
    themeKey: "theory",
    title: "Social theory and institutions",
    summary: "Explore how ideas help explain institutions and social change.",
    narration: "Compare explanations of how institutions shape social life.",
    connectionExplanation: "No exact course-outcome link is recorded for this theme.",
    directTransferEvidenceStatus: "no_exact_match_in_current_transfer_record",
    matchedCourseCodes: [],
    matchedOutcomeIds: [],
    courseAnchors: [],
    matchedCourseAnchors: [],
    programmeOutcomes: [{
      outcomeId: "outcome-2",
      courseTitle: "Classical Sociological Theory",
      studentText: "Compare sociological explanations of institutions and social change.",
      sourceLocator: {},
    }, {
      outcomeId: "outcome-3",
      courseTitle: "Contemporary Social Theory",
      studentText: "Apply social theory to interpret contemporary social issues.",
      sourceLocator: {},
    }],
    transferableEvidence: [],
  }],
} satisfies ProgrammeDomainConnection;

test("explains programme-to-domain transfer by theme and expands outcomes independently without showing course codes", () => {
  render(<ThemeProvider><ProgrammeCurriculumCarryForward connection={connection} fieldName="Social Sciences" /></ThemeProvider>);

  expect(StyleSheet.flatten(screen.getByText("Programme learning carried into this field").props.style)).toMatchObject({ fontSize: 20, lineHeight: 26 });
  const themeTitle = screen.getByText("Research and evidence");
  expect(StyleSheet.flatten(themeTitle.props.style)).toMatchObject({ fontSize: 16, lineHeight: 22 });
  let ancestor = themeTitle.parent;
  const cardGaps: number[] = [];
  while (ancestor) {
    if (ancestor.type === View) {
      const gap = StyleSheet.flatten(ancestor.props.style).gap;
      if (typeof gap === "number") cardGaps.push(gap);
    }
    ancestor = ancestor.parent;
  }
  expect(cardGaps.filter((gap) => gap === 8).length).toBeGreaterThanOrEqual(2);
  expect(screen.getByText(/They describe learning you have covered or are studying/)).toBeTruthy();
  expect(screen.getByText(/This part of your programme gives you a starting point for learning about Social Sciences/)).toBeTruthy();
  const matchedOutcome = screen.getByText("Choose suitable ways to collect and analyse evidence about social life.");
  expect(StyleSheet.flatten(matchedOutcome.props.style)).toMatchObject({ fontSize: 16, lineHeight: 24 });
  expect(screen.getByText("No other course outcomes are listed for this theme.")).toBeTruthy();
  expect(screen.getByText("Social theory and institutions")).toBeTruthy();
  expect(screen.getByText(/No particular course outcome is listed here to explain how this theme connects/)).toBeTruthy();
  expect(screen.getByText(/Treat it as programme context, not proof that you already have a particular field skill/)).toBeTruthy();
  expect(screen.queryByText(/reviewed evidence|route records/i)).toBeNull();
  expect(screen.queryByText("Compare sociological explanations of institutions and social change.")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "See 2 other outcomes in Social theory and institutions" }));
  expect(screen.getByText("Compare sociological explanations of institutions and social change.")).toBeTruthy();
  expect(screen.getByText("Choose suitable ways to collect and analyse evidence about social life.")).toBeTruthy();
  expect(screen.getByText("Methods of Social Research and Statistics")).toBeTruthy();
  expect(screen.queryByText("SOC 301")).toBeNull();
});

test("carries relevant programme outcomes into area and role explanations without implying direct job preparation", () => {
  const routeConnection: ProgrammeDomainConnection = {
    ...connection,
    transferableLearningNarrative: "Your programme introduces ways to frame social questions and examine evidence. That learning helps you understand the field, while this area or role may call for additional preparation.",
    curriculumOutcomes: [
      { outcomeId: "one", courseTitle: "Methods of Social Research", courseCode: "SOC 301", studentText: "Choose ways to gather evidence for a social question." },
      { outcomeId: "two", courseTitle: "Sociological Theory", courseCode: "SOC 302", studentText: "Use sociological ideas to interpret social patterns." },
      { outcomeId: "three", courseTitle: "Statistics", courseCode: "STA 201", studentText: "Summarise data and explain what it can show." },
      { outcomeId: "four", courseTitle: "Social Policy", courseCode: "SOC 401", studentText: "Examine how policy responds to social needs." },
    ],
  };
  render(<ThemeProvider><ProgrammeOutcomeBridge connection={routeConnection} nextLayer="area" /></ThemeProvider>);

  const sectionHeading = screen.getByText("Programme learning context for this area");
  expect(StyleSheet.flatten(sectionHeading.props.style)).toMatchObject({ fontSize: 20, lineHeight: 26 });
  expect(screen.getByText(/does not mean the programme teaches every area or role task/)).toBeTruthy();
  expect(screen.getByText("Choose ways to gather evidence for a social question.")).toBeTruthy();
  expect(screen.queryByText("Examine how policy responds to social needs.")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "See all 4 connected outcomes" }));
  expect(screen.getByText("Examine how policy responds to social needs.")).toBeTruthy();
  expect(screen.queryByText("SOC 301")).toBeNull();
});
