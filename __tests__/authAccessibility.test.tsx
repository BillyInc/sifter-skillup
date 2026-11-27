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
  it("names the input with its label", () => {
    renderField();
    expect(screen.getByLabelText("Password")).toBeTruthy();
  });

  it("hides the visible label from assistive technology so it is not read twice", () => {
    renderField();
    const label = screen.getByText("Password", { includeHiddenElements: true });
    expect(label.props.accessibilityElementsHidden).toBe(true);
    expect(label.props.importantForAccessibility).toBe("no-hide-descendants");
    // react-native-web ignores the native props and reads the aria-* ones.
    expect(label.props["aria-hidden"]).toBe(true);
    // Only the input is exposed under that name.
    expect(screen.getAllByLabelText("Password")).toHaveLength(1);
    expect(screen.queryAllByText("Password")).toHaveLength(0);
  });

  it("exposes show password as a switch with a constant name and a checked state", () => {
    renderField();
    const toggle = screen.getByRole("switch", { name: "Show password" });
    expect(flatten(toggle.props.style).minHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
    expect(flatten(toggle.props.style).minWidth).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
    expect(toggle.props.accessibilityState).toMatchObject({ checked: false });
    // react-native-web does not map accessibilityState.checked, so the
    // component must also pass aria-checked (TouchableOpacity consumes it
    // natively, so it is asserted on the element, not the host view).
    expect(screen.UNSAFE_getByProps({ "aria-checked": false })).toBeTruthy();

    fireEvent.press(toggle);
    const after = screen.getByRole("switch", { name: "Show password" }); // name does not flip
    expect(after.props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.UNSAFE_getByProps({ "aria-checked": true })).toBeTruthy();
    expect(after.props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.queryByRole("switch", { name: "Hide password" })).toBeNull();
  });

  it("hides the decorative eye emoji from assistive technology on web too", () => {
    renderField();
    const eye = screen.getByText("👁️", { includeHiddenElements: true });
    expect(eye.props.accessibilityElementsHidden).toBe(true);
    expect(eye.props["aria-hidden"]).toBe(true);
  });

  it("never lets Clear or the eye grow wide enough to squeeze the input", () => {
    renderField({ secure: true });
    const clear = screen.getByRole("button", { name: "Clear password" });
    const eye = screen.getByRole("switch", { name: "Show password" });
    for (const el of [clear, eye]) expect(flatten(el.props.style).flexShrink).toBe(0);
    expect(flatten(eye.props.style).minWidth).toBe(TOUCH_TARGET_MIN);
    expect(flatten(eye.props.style).paddingLeft).toBeUndefined();
    expect(flatten(screen.getByLabelText("Password").props.style).minWidth).toBe(0);
  });

  it("keeps the clear button at 44px", () => {
    renderField({ secure: false });
    const clear = screen.getByRole("button", { name: "Clear password" });
    expect(flatten(clear.props.style).minHeight).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN);
  });
});
