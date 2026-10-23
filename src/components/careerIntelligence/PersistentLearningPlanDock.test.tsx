import React, { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { PersistentLearningPlanDockProvider, usePersistentLearningPlanDock } from "./PersistentLearningPlanDock";

function RoutePage({ route }: { route: string }) {
  const dock = usePersistentLearningPlanDock();
  useEffect(() => {
    dock?.register(() => <Text>{`Plan for ${route}`}</Text>, route);
  }, [dock?.register, route]);
  return <>
    <Text>{`Page ${route}`}</Text>
    <TouchableOpacity onPress={() => dock?.dismiss()}><Text>Dismiss tray</Text></TouchableOpacity>
  </>;
}

describe("PersistentLearningPlanDock", () => {
  it("keeps the dock visible while routes change, lets the learner dismiss it, and reopens it for a new selection", () => {
    const { rerender } = render(<ThemeProvider><PersistentLearningPlanDockProvider><RoutePage route="programme" /></PersistentLearningPlanDockProvider></ThemeProvider>);
    expect(screen.getByText("Plan for programme")).toBeTruthy();

    rerender(<ThemeProvider><PersistentLearningPlanDockProvider><RoutePage route="domain" /></PersistentLearningPlanDockProvider></ThemeProvider>);
    expect(screen.getByText("Page domain")).toBeTruthy();
    expect(screen.getByText("Plan for domain")).toBeTruthy();

    fireEvent.press(screen.getByText("Dismiss tray"));
    expect(screen.queryByText("Plan for domain")).toBeNull();
    rerender(<ThemeProvider><PersistentLearningPlanDockProvider><RoutePage route="domain" /></PersistentLearningPlanDockProvider></ThemeProvider>);
    expect(screen.queryByText("Plan for domain")).toBeNull();
    rerender(<ThemeProvider><PersistentLearningPlanDockProvider><RoutePage route="area" /></PersistentLearningPlanDockProvider></ThemeProvider>);
    expect(screen.getByText("Plan for area")).toBeTruthy();
  });
});
