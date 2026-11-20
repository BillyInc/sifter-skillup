import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { RosterFilterBar } from "./RosterFilters";
import { EMPTY_ROSTER_FILTERS, type RosterFilterGroups } from "@/lib/rosterFilters";

const groups: RosterFilterGroups = {
  stage: [
    { key: "all", label: "All", count: 3 },
    { key: "SS3", label: "SS3", count: 2 },
    { key: "SS2", label: "SS2", count: 1 },
  ],
  claimed: [
    { key: "all", label: "All", count: 3 },
    { key: "unclaimed", label: "Not claimed yet", count: 1 },
    { key: "claimed", label: "Claimed", count: 2 },
  ],
  source: [],
};

const renderBar = (over: Partial<React.ComponentProps<typeof RosterFilterBar>> = {}) => {
  const onChange = jest.fn();
  const onReset = jest.fn();
  render(
    <ThemeProvider>
      <RosterFilterBar groups={groups} filters={EMPTY_ROSTER_FILTERS} total={3} shown={3} onChange={onChange} onReset={onReset} {...over} />
    </ThemeProvider>,
  );
  return { onChange, onReset };
};

describe("RosterFilterBar", () => {
  it("shows each group with counts and hides a group with no options", () => {
    renderBar();
    expect(screen.getByText("Stage")).toBeTruthy();
    expect(screen.getByText("Account")).toBeTruthy();
    expect(screen.queryByText("How they joined")).toBeNull();
    expect(screen.getByText("SS3 (2)")).toBeTruthy();
    expect(screen.getByText("Not claimed yet (1)")).toBeTruthy();
    expect(screen.getByText("3 students")).toBeTruthy();
    expect(screen.queryByText("Reset filters")).toBeNull();
  });

  it("exposes radio semantics with a checked state and a descriptive label", () => {
    renderBar({ filters: { ...EMPTY_ROSTER_FILTERS, stage: "SS3" } });
    const ss3 = screen.getByLabelText("Stage: SS3, 2 students");
    expect(ss3.props.accessibilityRole).toBe("radio");
    expect(ss3.props.accessibilityState).toEqual({ checked: true });
    expect(screen.getByLabelText("Stage: SS2, 1 student").props.accessibilityState).toEqual({ checked: false });
  });

  it("reports a choice without losing the other groups' selections", () => {
    const { onChange } = renderBar({ filters: { ...EMPTY_ROSTER_FILTERS, claimed: "claimed" } });
    fireEvent.press(screen.getByLabelText("Stage: SS2, 1 student"));
    expect(onChange).toHaveBeenCalledWith({ stage: "SS2", claimed: "claimed", source: "all" });
  });

  it("shows 'Showing x of y' and a reset button only while a filter is active", () => {
    const { onReset } = renderBar({ filters: { ...EMPTY_ROSTER_FILTERS, stage: "SS3" }, shown: 2 });
    expect(screen.getByText("Showing 2 of 3 students")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Reset filters"));
    expect(onReset).toHaveBeenCalled();
  });

  it("renders nothing when no group can narrow the list", () => {
    const { toJSON } = render(
      <ThemeProvider>
        <RosterFilterBar groups={{ stage: [], claimed: [], source: [] }} filters={EMPTY_ROSTER_FILTERS} total={1} shown={1} onChange={jest.fn()} onReset={jest.fn()} />
      </ThemeProvider>,
    );
    expect(toJSON()).toBeNull();
  });
});
