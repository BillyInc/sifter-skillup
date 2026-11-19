import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "../src/theme";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush, replace: jest.fn() }) }));
jest.mock("@/hooks/useResponsive", () => ({ useResponsive: () => ({ isMobile: true }) }));
// The real barrel pulls in large data-backed components; Home only needs this one.
jest.mock("../src/components/careerIntelligence", () => ({
  DataStateView: ({ state, children }: any) => (state.data ? children(state.data) : null),
}));
jest.mock("../src/components/brand/LevelUpLogo", () => ({ LevelUpLogo: () => null }));
jest.mock("../src/components/animations/StaggerReveal", () => {
  const { View } = require("react-native");
  return { StaggerReveal: ({ children }: any) => <View>{children}</View> };
});

let mockUser: any = { id: "u1", username: "Ada Obi", auth_provider: "email" };
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: mockUser }) }));

let mockStarting: any = null;
jest.mock("../src/lib/startingPoint", () => ({ getStartingPoint: jest.fn(() => Promise.resolve(mockStarting)) }));
jest.mock("../src/lib/onboardingDraft", () => ({ getOnboardingDraft: jest.fn(() => Promise.resolve(null)) }));

let mockGuidance: any = { status: "real", data: null };
jest.mock("../src/lib/careerData", () => ({
  careerData: {
    getSavedItems: jest.fn(() => Promise.resolve({ status: "real", data: [] })),
    getGuidancePath: jest.fn(() => Promise.resolve(mockGuidance)),
  },
}));

import CareerHomeScreen from "../src/screens/CareerHomeScreen";

const renderHome = () =>
  render(
    <ThemeProvider>
      <CareerHomeScreen />
    </ThemeProvider>,
  );

beforeEach(() => {
  mockPush.mockClear();
  mockUser = { id: "u1", username: "Ada Obi", auth_provider: "email" };
  mockGuidance = { status: "real", data: null };
});

describe("CareerHomeScreen stage-aware Home", () => {
  it("SS1 shows two routes, the stage label and a data-backed reason", async () => {
    mockStarting = { userType: "senior_secondary", ssClass: "ss1", olevelSubjects: ["Biology", "Chemistry"] };
    renderHome();
    await screen.findByTestId("stage-home");
    expect(screen.getByText("My learning stage")).toBeTruthy();
    expect(screen.getByTestId("stage-label").props.children).toBe("SS1");
    expect(screen.getByTestId("home-route-subjects")).toBeTruthy();
    expect(screen.getByTestId("home-route-programme_in_mind")).toBeTruthy();
    expect(screen.queryByTestId("home-route-not_sure")).toBeNull();
    expect(screen.getByText("Because you selected Biology and Chemistry")).toBeTruthy();
    fireEvent.press(screen.getByTestId("home-route-programme_in_mind"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/admission?mode=programme&entry=programme_search"));
    fireEvent.press(screen.getByTestId("stage-edit"));
    expect(mockPush).toHaveBeenCalledWith("/(auth)/onboarding?restart=1");
  });

  it("UTME shows three parallel routes and no percentages", async () => {
    mockStarting = { userType: "jamb" };
    renderHome();
    await screen.findByTestId("stage-home");
    expect(screen.getByTestId("stage-label").props.children).toBe("UTME applicant");
    ["know_both", "know_programme", "not_sure"].forEach((k) => expect(screen.getByTestId(`home-route-${k}`)).toBeTruthy());
    expect(screen.queryByText(/Because you selected/)).toBeNull();
    expect(screen.queryByText(/%/)).toBeNull();
    fireEvent.press(screen.getByTestId("home-route-not_sure"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("mode=subjects&entry=subject_match&user_type=jamb&exam_type=combined"));
  });

  it("Undergraduate shows university and programme without faculty or year", async () => {
    mockStarting = {
      userType: "student", schoolName: "UNILAG", programmeName: "Sociology", intendedProgrammeId: "p1",
      discipline: "Social Sciences", yearOfStudy: "3",
    };
    renderHome();
    await screen.findByTestId("home-programme");
    expect(screen.getByTestId("home-programme").props.children).toBe("UNILAG · Sociology");
    expect(screen.queryByText(/Social Sciences/)).toBeNull();
    expect(screen.queryByText(/year/i)).toBeNull();
    fireEvent.press(screen.getByTestId("home-open-programme"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("/(tabs)/explore/programme/p1"));
  });

  it("shows Continue where you left off only when a real saved state exists", async () => {
    mockStarting = { userType: "jamb" };
    const { unmount } = renderHome();
    await screen.findByTestId("stage-home");
    expect(screen.queryByText("Continue where you left off")).toBeNull();
    unmount();
    mockGuidance = { status: "real", data: { path: { resume: { status: "in_progress" }, subjects: { utme: ["Physics"] } } } };
    renderHome();
    expect(await screen.findByText("Continue where you left off")).toBeTruthy();
  });

  it("keeps today's Home for users without a recognised stage", async () => {
    mockStarting = { userType: "graduate", programmeName: "Law" };
    renderHome();
    await screen.findByText("Your starting point");
    expect(screen.queryByTestId("stage-home")).toBeNull();
  });

  it("keeps today's Home for guests", async () => {
    mockUser = { id: "g", username: "Guest", auth_provider: "guest" };
    mockStarting = { userType: "jamb" };
    renderHome();
    await waitFor(() => expect(screen.getByText("Build your starting point")).toBeTruthy());
    expect(screen.queryByTestId("stage-home")).toBeNull();
  });
});
