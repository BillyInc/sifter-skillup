/**
 * The shared button must be tappable.
 *
 * SifterButton set `paddingVertical: 9` with `FontSize.md` (13) and no minimum
 * height, which renders roughly a 34px target — under Apple's 44pt figure and
 * Material's 48dp. It is the shared primary CTA, so all of its call sites
 * inherited that.
 *
 * What made it clearly a defect rather than a house style: 54 other places in
 * this codebase already set a 44px-or-greater minimum. The one component that
 * should have got it right was the one that did not.
 *
 * These assert on the rendered style rather than reading the source, so they
 * still hold if the padding or font scale is retuned later.
 */
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SifterButton, TOUCH_TARGET_MIN } from "../src/components/ui";
import { ThemeProvider } from "../src/theme";

const renderButton = (props: Partial<React.ComponentProps<typeof SifterButton>> = {}) =>
  render(
    <ThemeProvider>
      <SifterButton label="Continue" onPress={() => undefined} {...props} />
    </ThemeProvider>,
  );

// RN styles arrive as an object or an array of them; flatten before asserting.
function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten));
  return (style && typeof style === "object" ? style : {}) as Record<string, unknown>;
}

describe("SifterButton touch target", () => {
  it("exposes the minimum as a shared constant, not a literal", () => {
    // Other controls need the same number; a magic 44 in one file is how the
    // tab bar ended up at 42.
    expect(TOUCH_TARGET_MIN).toBeGreaterThanOrEqual(44);
  });

  it.each(["sm", "md", "lg"] as const)(
    "meets the minimum at size %s",
    size => {
      renderButton({ size });
      const touchable = screen.root.find(
        (n: any) => typeof n.type !== "string" && typeof n.props?.onPress === "function",
      );
      const style = flatten(touchable.props.style);
      // A small button is visually smaller — less horizontal padding, smaller
      // text — but the area a finger has to hit does not shrink with it.
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    },
  );

  it("keeps the minimum when disabled", () => {
    // Disabled controls are exempt from contrast rules but not from being
    // laid out; a collapsing disabled button would shift everything under it.
    renderButton({ disabled: true });
    const touchable = screen.root.find(
      (n: any) => typeof n.type !== "string" && typeof n.props?.onPress === "function",
    );
    expect(flatten(touchable.props.style).minHeight).toBeGreaterThanOrEqual(44);
  });
});
