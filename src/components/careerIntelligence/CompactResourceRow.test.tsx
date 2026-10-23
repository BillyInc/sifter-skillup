import React from "react";
import { StyleSheet, View } from "react-native";
import { fireEvent, render, screen, within } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import type { CareerLearningResource } from "@/types/career";
import { CompactResourceRow } from "./CompactResourceRow";

function resource(overrides: Partial<CareerLearningResource> = {}): CareerLearningResource {
  return {
    id: "resource-1",
    domainId: "D078",
    ownershipScope: "domain",
    reviewStatus: "approved_guidance_v1",
    resourceType: "skill_learning",
    targetName: "Interview guide for social research",
    provider: "Open Research Library",
    region: "global",
    accessType: "free",
    url: "https://example.org/interviews",
    sourceUrl: "https://example.org/source",
    dataState: "source_backed",
    ...overrides,
  };
}

describe("D078 compact resource row", () => {
  it("places the type chip before a one-line title and gives Open a 44px button target", () => {
    render(<ThemeProvider><CompactResourceRow resource={resource()} contextLevel="domain" /></ThemeProvider>);
    const chip = screen.getByText("Learning resource");
    const title = screen.getByText("Interview guide for social research");
    expect(chip).toBeTruthy();
    expect(title.props.numberOfLines).toBe(1);
    let row = chip.parent;
    while (row && !(row.type === View && StyleSheet.flatten(row.props.style).flexDirection === "row")) row = row.parent;
    expect(row).toBeTruthy();
    const rowStyle = StyleSheet.flatten(row!.props.style);
    expect(rowStyle).toMatchObject({ width: "100%", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, paddingVertical: 6 });
    const open = screen.getByRole("button", { name: "Learning resource. Interview guide for social research. Open Research Library. Free to access. Open." });
    expect(StyleSheet.flatten(open.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(StyleSheet.flatten(open.props.style).paddingHorizontal).toBe(16);
    expect(StyleSheet.flatten(title.props.style)).toMatchObject({ fontSize: 14, lineHeight: 18, minWidth: 20 });
    const textInOrder = screen.getAllByText(/Learning resource|Interview guide for social research|Open/).map((node) => node.props.children);
    expect(textInOrder.slice(0, 3)).toEqual(["Learning resource", "Interview guide for social research", "Open"]);
  });

  it("omits unapproved, wrong-owner, and missing-link resources without an empty Open button", () => {
    const { rerender } = render(<ThemeProvider><CompactResourceRow resource={resource({ reviewStatus: "review_only" })} contextLevel="domain" /></ThemeProvider>);
    expect(screen.queryByRole("button", { name: /Open/ })).toBeNull();
    rerender(<ThemeProvider><CompactResourceRow resource={resource({ ownershipScope: "role" })} contextLevel="domain" /></ThemeProvider>);
    expect(screen.queryByRole("button", { name: /Open/ })).toBeNull();
    rerender(<ThemeProvider><CompactResourceRow resource={resource({ url: "" })} contextLevel="domain" /></ThemeProvider>);
    expect(screen.queryByRole("button", { name: /Open/ })).toBeNull();
  });

  it("moves Save below the row when narrow and keeps it inline when the column has room", () => {
    const narrowRender = render(<ThemeProvider><CompactResourceRow resource={resource()} contextLevel="domain" onSave={() => undefined} /></ThemeProvider>);
    const container = screen.getByTestId("compact-resource-row-container");
    const row = screen.getByTestId("compact-resource-row-line");
    const narrowTitle = screen.getByText("Interview guide for social research");
    fireEvent(narrowTitle, "layout", { nativeEvent: { layout: { width: 100, height: 18, x: 0, y: 0 } } });
    expect(StyleSheet.flatten(narrowTitle.props.style).minWidth).toBe(20);
    expect(within(row).queryByRole("button", { name: "Save Interview guide for social research" })).toBeNull();
    const narrowSave = screen.getByRole("button", { name: "Save Interview guide for social research" });
    expect(StyleSheet.flatten(narrowSave.props.style).minHeight).toBeGreaterThanOrEqual(44);

    narrowRender.unmount();
    render(<ThemeProvider><CompactResourceRow resource={resource()} contextLevel="domain" onSave={() => undefined} /></ThemeProvider>);
    const wideTitle = screen.getByText("Interview guide for social research");
    fireEvent(wideTitle, "layout", { nativeEvent: { layout: { width: 180, height: 18, x: 0, y: 0 } } });
    expect(StyleSheet.flatten(wideTitle.props.style).minWidth).toBe(120);
    const wideRow = screen.getByTestId("compact-resource-row-line");
    expect(within(wideRow).getByRole("button", { name: "Save Interview guide for social research" })).toBeTruthy();
  });
});
