import React from "react";
import { Platform } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { SkipToContent, focusMainContent } from "./SkipToContent";

describe("SkipToContent", () => {
  const original = Platform.OS;
  afterEach(() => {
    (Platform as { OS: string }).OS = original;
    delete (globalThis as unknown as { document?: unknown }).document;
  });

  it("renders nothing on native", () => {
    (Platform as { OS: string }).OS = "ios";
    render(<ThemeProvider><SkipToContent /></ThemeProvider>);
    expect(screen.queryByLabelText("Skip to content")).toBeNull();
  });

  it("is a link on web and moves focus to the main region when pressed", () => {
    (Platform as { OS: string }).OS = "web";
    const target = { focus: jest.fn(), scrollIntoView: jest.fn() };
    (globalThis as unknown as { document: unknown }).document = { getElementById: jest.fn((id: string) => (id === "main-content" ? target : null)) };
    render(<ThemeProvider><SkipToContent /></ThemeProvider>);
    const link = screen.getByLabelText("Skip to content");
    expect(link.props.accessibilityRole).toBe("link");
    fireEvent.press(link);
    expect(target.focus).toHaveBeenCalledTimes(1);
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the main region is missing or there is no DOM", () => {
    expect(() => focusMainContent()).not.toThrow();
    (globalThis as unknown as { document: unknown }).document = { getElementById: () => null };
    expect(() => focusMainContent()).not.toThrow();
  });
});
