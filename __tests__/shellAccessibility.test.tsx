/**
 * The app shell's controls must have accessible names.
 *
 * ReferenceShell wraps every screen, and five of its controls are icon-only:
 * the menu button, the compact search button, the theme toggle, the avatar,
 * and the drawer's close button. A Feather glyph contributes no text to the
 * accessibility tree, so each of these announced as a bare "button" — the
 * primary navigation of the app was unusable with a screen reader.
 *
 * The nav items are a different failure. They DO have visible text, so they
 * always had a name; what they lacked was state. Which item is active was
 * encoded purely as a colour swap (background -> textRole.primary), which is
 * both invisible to a screen reader and a WCAG 1.4.1 "colour alone" failure.
 * They now carry accessibilityState.selected.
 *
 * These assert on the rendered accessibility tree rather than scanning the
 * JSX, so they fail if a control is renamed, re-wrapped, or moved behind a
 * different breakpoint — not merely if the prop text disappears.
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";

const mockPush = jest.fn();
// Extends the global stub in jest.setup.ts rather than replacing it: this
// test needs a real pathname so exactly one nav item resolves to active.
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  usePathname: () => "/(tabs)/home",
  useLocalSearchParams: () => ({}),
  // The shell resolves its track context from global params; without this it
  // throws before rendering and every assertion below fails for the wrong
  // reason. This file's mock shadows the one in jest.setup.ts, so it needs
  // its own copy.
  useGlobalSearchParams: () => ({}),
  useFocusEffect: () => undefined,
  Link: ({ children }: any) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// The shell uses exactly one field off useAuth. Importing the real hook pulls
// in the Privy/Starknet bridge and its native deps, none of which this test
// exercises.
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u1", username: "tester" } }),
}));

// Pin the launch flag OFF so the fourth destination is deterministically
// "Saved". WORLD_NAV reads featureFlags.myWorldLive at module load, and that
// reads process.env.EXPO_PUBLIC_MY_WORLD_LIVE — so without this mock the tab
// label depends on the developer's shell environment. Anyone with the flag
// exported (and CI after go-live) would see this suite fail claiming the app
// shell's accessibility broke, when all that changed is a launch toggle.
//
// Mocking the flag rather than WORLD_NAV keeps the real label/icon/eyebrow
// mapping under test; only its input is fixed.
jest.mock("@/lib/featureFlags", () => ({
  featureFlags: { myWorldLive: false },
}));

import { ReferenceShell } from "../src/components/shell/ReferenceShell";
import { ThemeProvider } from "../src/theme";

// ThemeProvider hydrates the persisted mode asynchronously, so let that
// settle before asserting or React warns about an un-acted update.
const renderShell = async () => {
  const view = render(
    <ThemeProvider>
      <ReferenceShell>{null}</ReferenceShell>
    </ThemeProvider>,
  );
  await act(async () => undefined);
  return view;
};

describe("ReferenceShell accessibility", () => {
  beforeEach(() => mockPush.mockClear());

  it("names the icon-only topbar controls", async () => {
    await renderShell();
    // Present at every width: theme toggle and avatar.
    expect(screen.getByLabelText("Switch to dark theme")).toBeTruthy();
    // The topbar avatar and the sidebar card both route to /profile and both
    // announce "Profile" — same name for the same destination, so getAllBy.
    expect(screen.getAllByLabelText("Profile").length).toBeGreaterThan(0);
  });

  it("labels the theme toggle by what it does, not what it shows", async () => {
    await renderShell();
    // The glyph is a moon in light mode; the label must promise the result,
    // so the control keeps the same name through the flow.
    const toggle = screen.getByLabelText("Switch to dark theme");
    fireEvent.press(toggle);
    expect(screen.getByLabelText("Switch to light theme")).toBeTruthy();
    expect(screen.queryByLabelText("Switch to dark theme")).toBeNull();
  });

  it("conveys the active nav item as state, not only as colour", async () => {
    await renderShell();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(0);

    const selected = tabs.filter(
      t => t.props.accessibilityState?.selected === true,
    );
    // Exactly one destination is current; the rest must say they are not.
    expect(selected).toHaveLength(1);
    for (const tab of tabs) {
      expect(tab.props.accessibilityState).toHaveProperty("selected");
      expect(typeof tab.props.accessibilityLabel).toBe("string");
      expect(tab.props.accessibilityLabel.length).toBeGreaterThan(0);
    }
  });

  it("exposes the final-concepts mobile destinations, named as they read", async () => {
    await renderShell();
    // Below the 1100px web breakpoint the shell renders only the mobile tab
    // bar, so every tab in the tree is a bottom-bar destination.
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t: any) => t.props.accessibilityLabel)).toEqual([
      "Home",
      "Explore",
      // d7dda1f added a deliberate sixth destination, /(tabs)/build.
      "Build",
      // Renamed from "Jobs" in 237d074. The shell is self-consistent on
      // "Opportunities": both MOBILE_NAV and PRIMARY_NAV use that label, the
      // route is /(tabs)/opportunities, and the sub-copy reads "Opportunities,
      // scholarships & windows" -- the destination covers scholarships and
      // application windows, not just jobs. The app was updated and this
      // expectation was not, which left main's frontend pipeline red.
      "Opportunities",
      // The fourth destination is /(tabs)/myworld, which pre-launch IS the
      // saved-items page. Named "Saved" per the final UI concepts sheet.
      "Saved",
      "Profile",
    ]);

    // WCAG 2.5.3 Label in Name: the spoken name must contain the visible text.
    for (const tab of tabs) {
      const visible = tab
        .findAll((n: any) => typeof n.children?.[0] === "string")
        .map((n: any) => n.children[0])
        .join(" ");
      expect(visible).toContain(tab.props.accessibilityLabel);
    }
  });

  it("leaves no touchable without an accessible name", async () => {
    await renderShell();

    // A control is named if it carries a label, or if its subtree renders text
    // a screen reader would read out instead.
    //
    // @expo/vector-icons renders every glyph as a <Text>, so "has a Text
    // descendant" is true even for a bare icon button and would make this
    // check vacuous. Icon glyphs sit in the Unicode private-use area
    // (U+E000-U+F8FF) and carry no meaning when spoken, so they don't count.
    const speakable = (s: string) =>
      s.replace(/[\uE000-\uF8FF]/g, "").trim().length > 0;
    const hasTextDescendant = (node: any): boolean =>
      node.findAll(
        (n: any) =>
          typeof n.children?.[0] === "string" && speakable(n.children[0]),
      ).length > 0;

    const unnamed = screen.root
      .findAll(
        (n: any) =>
          typeof n.type !== "string" && typeof n.props?.onPress === "function",
      )
      .filter(
        (n: any) =>
          !n.props.accessibilityLabel &&
          n.props.importantForAccessibility !== "no" &&
          !hasTextDescendant(n),
      );

    // Report which control is bare, not just that some control is.
    expect(unnamed.map((n: any) => n.type?.displayName ?? n.type?.name ?? "?"))
      .toEqual([]);
  });
});
