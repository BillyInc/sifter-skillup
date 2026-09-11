/**
 * What ~25 routes actually render right now.
 *
 * The whole learning layer — lessons, islands, streaks, guild, feed, portfolio,
 * leaderboards, the Starknet and Cairo tracks — is paused for this release, and
 * every one of those routes is a two-line file rendering the same placeholder.
 * That is a deliberate product state, and it has two failure modes nothing
 * checks: the placeholder losing its way back to the live part of the app
 * (leaving the user stranded on a dead end), and a route quietly going back to
 * mounting the real, unmaintained learning screen.
 *
 * These render the route modules themselves, not the placeholder in isolation,
 * so re-pointing a route is what fails the test.
 */
import React from "react";
import { renderWithProviders, fireEvent, screen } from "../test-utils/render";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  usePathname: () => "/",
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
}));

beforeEach(() => jest.clearAllMocks());

const ROUTES: [string, string, () => React.ComponentType][] = [
  ["/map/lesson", "Lessons and challenges", () => require("../app/(tabs)/map/lesson").default],
  ["/map/island", "Learning islands", () => require("../app/(tabs)/map/island").default],
  ["/map", "The learning map", () => require("../app/(tabs)/map/index").default],
  ["/skills", "Learning skills and tracks", () => require("../app/(tabs)/skills/index").default],
  ["/skills/quant-map", "Quant learning labs", () => require("../app/(tabs)/skills/quant-map").default],
  ["/streaks", "Learning streaks", () => require("../app/(tabs)/streaks/index").default],
  ["/leaderboard", "Leaderboards", () => require("../app/(tabs)/leaderboard").default],
  ["/guild", "Guild and community", () => require("../app/(tabs)/guild/index").default],
  ["/feed", "Feed and community learning", () => require("../app/(tabs)/feed/index").default],
  ["/portfolio", "Learning portfolio", () => require("../app/(tabs)/portfolio/index").default],
  ["/fields", "Learning fields", () => require("../app/(tabs)/fields/index").default],
  ["/starknet-track", "Starknet learning", () => require("../app/starknet-track/index").default],
];

describe("the paused learning routes", () => {
  it.each(ROUTES)("%s says the area is paused and names it", (_path, area, load) => {
    const Screen = load();
    renderWithProviders(<Screen />);

    expect(screen.getByText("Learning experiences are paused")).toBeTruthy();
    expect(screen.getByText(new RegExp(`^${area} is not part of the current`))).toBeTruthy();
  });

  it.each(ROUTES)("%s offers a way back into the live app", (_path, _area, load) => {
    // Without this the placeholder is a dead end: the learning tabs are still
    // reachable from history and bookmarks, and there is no other affordance
    // on the screen.
    const Screen = load();
    renderWithProviders(<Screen />);

    fireEvent.press(screen.getByLabelText("Go to Explore"));
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)/explore");
  });

  it("points the user at what IS available, not just at what is not", () => {
    const Screen = require("../app/(tabs)/map/lesson").default;
    renderWithProviders(<Screen />);

    expect(screen.getByText(/career guidance, programmes, domains, roles and Opportunities/)).toBeTruthy();
    expect(screen.getByText("COMING LATER")).toBeTruthy();
  });

  it("labels the escape hatch for a screen reader, not just visually", () => {
    const Screen = require("../app/(tabs)/map/lesson").default;
    renderWithProviders(<Screen />);

    const button = screen.getByLabelText("Go to Explore");
    expect(button.props.accessibilityRole).toBe("button");
  });

  it("names a generic area when a route supplies none", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const DisabledLearningScreen = require("../src/screens/DisabledLearningScreen").default;
    renderWithProviders(<DisabledLearningScreen />);

    expect(screen.getByText(/^This area is not part of the current/)).toBeTruthy();
  });
});
