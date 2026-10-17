import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { HierarchyOrientationCard } from "./HierarchyOrientationCard";

test("shows a repeated overview sentence once while retaining distinct role explanations", () => {
  const sharedSentence = "Researchers examine how people interact and how institutions shape social life.";
  render(
    <ThemeProvider>
      <HierarchyOrientationCard
        level="role"
        title="Social Researcher"
        parentLabel="Sociology and Social Anthropology"
        summary={sharedSentence}
        description={sharedSentence}
        orientation={{
          whatPeopleDo: sharedSentence,
          whatItStudies: "This role studies patterns in people's experiences, relationships and institutions. It uses a defined question and suitable evidence to explain those patterns without assuming that one case represents everyone.",
          questions: ["How do access to services and local conditions shape people's experiences?"],
          outputs: ["A research report that explains the evidence, findings and limits."],
        }}
      />
    </ThemeProvider>,
  );

  expect(screen.getByText(sharedSentence)).toBeTruthy();
  expect(screen.getAllByText(sharedSentence)).toHaveLength(1);
  expect(screen.getByText(/This role studies patterns in people's experiences/)).toBeTruthy();
  expect(screen.getByText("Questions this path can help answer")).toBeTruthy();
  expect(screen.getByText("What the work can produce")).toBeTruthy();
});

test("shows supplied role work context as settings and conditions without relabeling it as collaborators", () => {
  render(
    <ThemeProvider>
      <HierarchyOrientationCard
        level="role"
        title="Social Researcher"
        parentLabel="Sociology and Social Anthropology"
        workContext={[
          { name: "Contact with others", frequency: "Very frequent" },
          { name: "Contact with others", frequency: "Very frequent" },
        ]}
      />
    </ThemeProvider>,
  );

  expect(screen.getByText("Work settings and conditions")).toBeTruthy();
  expect(screen.getByText("Contact with others — Very frequent")).toBeTruthy();
  expect(screen.queryByText(/Who this role works with/i)).toBeNull();
  expect(screen.getAllByText("Contact with others — Very frequent")).toHaveLength(1);
});
