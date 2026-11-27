/** Auth fields and links need names, roles and 44px targets. */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AuthField } from "../src/screens/auth/authShared";
import { TOUCH_TARGET_MIN } from "../src/components/ui";
import { ThemeProvider } from "../src/theme";

function flatten(style: unknown): Record<string, any> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return (style as Record<string, any>) ?? {};
}

const renderField = (props = {}) =>
  render(
    <ThemeProvider>
      <AuthField label="Password" value="secret" onChangeText={() => undefined} secure {...props} />
    </ThemeProvider>,
  );

describe("AuthField accessibility", () => {
  it("labels the input with its visible label", () => {
    renderField();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("exposes a labelled, stateful show/hide password button", () => {
    renderField();
    const toggle = screen.getByRole("button", { name: "Show password" });
    expect(flatten(toggle.props.style).minHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
    expect(flatten(toggle.props.style).minWidth).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
    fireEvent.press(toggle);
    expect(screen.getByRole("button", { name: "Hide password" })).toBeTruthy();
  });

  it("keeps the clear button at 44px", () => {
    renderField({ secure: false });
    const clear = screen.getByRole("button", { name: "Clear password" });
    expect(flatten(clear.props.style).minHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });
});
