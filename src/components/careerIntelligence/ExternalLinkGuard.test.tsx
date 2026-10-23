import React from "react";
import { Linking, StyleSheet } from "react-native";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { ExternalLinkGuard } from "./ExternalLinkGuard";

describe("ExternalLinkGuard", () => {
  afterEach(() => jest.restoreAllMocks());

  it("uses a 44px link control and asks before leaving the learning path", async () => {
    const openUrl = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    render(<ThemeProvider><ExternalLinkGuard url="https://example.org/methods" label="Read methods guide" accessibilityLabel="Open methods guide" description="This guide explains the selected method." /></ThemeProvider>);

    const link = screen.getByRole("link", { name: "Open methods guide" });
    expect(StyleSheet.flatten(link.props.style).minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(link);
    expect(screen.getByText("This guide explains the selected method.")).toBeTruthy();

    const stay = screen.getByRole("button", { name: "Stay here" });
    expect(StyleSheet.flatten(stay.props.style).minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(stay);
    expect(screen.queryByRole("button", { name: "Open site" })).toBeNull();

    fireEvent.press(link);
    const open = screen.getByRole("button", { name: "Open site" });
    expect(StyleSheet.flatten(open.props.style).minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(open);
    await waitFor(() => expect(openUrl).toHaveBeenCalledWith("https://example.org/methods"));
  });

  it("can omit unavailable resources from the student view", () => {
    render(<ThemeProvider><ExternalLinkGuard url="http://example.org/methods" label="Read methods guide" hideUnavailable /></ThemeProvider>);
    expect(screen.queryByText("No verified link is available yet.")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
