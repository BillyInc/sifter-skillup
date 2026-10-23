import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { RouteButton, routeButtonFocusStyle } from "./RouteButton";

function resolvedStyle(button: any) {
  const style = button.props.style;
  return StyleSheet.flatten(typeof style === "function" ? style({ pressed: false }) : style);
}

describe("RouteButton", () => {
  it("exposes an accessible button with a 44px minimum target and selected state", () => {
    const onPress = jest.fn();
    render(<ThemeProvider><RouteButton label="Mid" accessibilityLabel="Show learning plan mid size" selected onPress={onPress} /></ThemeProvider>);
    const button = screen.getByRole("button", { name: "Show learning plan mid size" });
    expect(button.props.accessibilityState.selected).toBe(true);
    const style = StyleSheet.flatten(button.props.style);
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
    expect(style.minWidth).toBeGreaterThanOrEqual(44);
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("shows a stronger outline while keyboard focused", () => {
    const accentColor = "#006B8F";
    const focusedStyle = StyleSheet.flatten(routeButtonFocusStyle(true, accentColor));
    expect(focusedStyle.borderWidth).toBe(2);
    expect(focusedStyle.borderColor).toBe(accentColor);
    expect(routeButtonFocusStyle(false, accentColor)).toBeUndefined();
  });

  it("applies the focus outline through interaction and blocks presses while disabled", () => {
    const onPress = jest.fn();
    render(<ThemeProvider><RouteButton label="Continue" onPress={onPress} /></ThemeProvider>);
    const button = screen.getByRole("button", { name: "Continue" });

    const pressable = screen.UNSAFE_getByType(Pressable);
    act(() => pressable.props.onFocus());
    const focusedStyle = resolvedStyle(screen.UNSAFE_getByType(Pressable));
    expect(focusedStyle.borderWidth).toBe(2);
    act(() => screen.UNSAFE_getByType(Pressable).props.onBlur());
    expect(resolvedStyle(screen.UNSAFE_getByType(Pressable)).borderWidth).not.toBe(2);

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);

    const disabledAction = jest.fn();
    render(<ThemeProvider><RouteButton label="Save" onPress={disabledAction} disabled /></ThemeProvider>);
    const disabled = screen.getByRole("button", { name: "Save" });
    expect(disabled.props.accessibilityState.disabled).toBe(true);
    expect(StyleSheet.flatten(disabled.props.style).opacity).toBe(0.45);
    fireEvent.press(disabled);
    expect(disabledAction).not.toHaveBeenCalled();
  });
});
