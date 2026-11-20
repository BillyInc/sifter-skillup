/**
 * Screen-level test: the roster filter bar, filtering and the honest empty
 * state must appear in the real StudentProvisioningScreen, not just in the
 * RosterFilterBar component.
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { resetRememberedRosterFilters } from "@/lib/rosterFilters";

const mockGetRoster = jest.fn();

jest.mock("expo-router", () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock("expo-image-picker", () => ({}));
jest.mock("expo-clipboard", () => ({}));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "admin-1" } }) }));
jest.mock("@/lib/educatorProfile", () => ({
  getEducatorProfile: jest.fn().mockResolvedValue({ organizationType: "secondary_school", organizationId: "org-1" }),
}));
jest.mock("@/lib/adminResume", () => ({
  getAdminProvisioningDrafts: jest.fn().mockResolvedValue([]),
  saveAdminProvisioningDrafts: jest.fn(),
  saveAdminTask: jest.fn(),
}));
jest.mock("./AdminShell", () => ({ AdminShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock("@/components/LocalLegalNotice", () => () => null);
jest.mock("@/lib/provisioningData", () => ({
  provisioningData: {
    getRoster: (...a: unknown[]) => mockGetRoster(...a),
    listMergeCandidates: jest.fn().mockResolvedValue([]),
  },
}));

// eslint-disable-next-line import/first
import { StudentProvisioningScreen } from "./StudentProvisioningScreen";

const student = (id: string, over: Record<string, unknown> = {}) => ({
  userId: id,
  fullName: `Student ${id}`,
  provenance: "provisioned",
  claimState: "unclaimed",
  visible: true,
  hasConsent: false,
  studentClass: "SS3",
  guidanceComplete: false,
  ...over,
});

const roster = {
  students: [
    student("a"),
    student("b", { claimState: "claimed" }),
    student("c", { provenance: "self", claimState: null, hasConsent: true, studentClass: "SS2" }),
  ],
  totalAffiliated: 3,
  aggregateOnly: 0,
  sharedWithYou: 1,
};

const renderScreen = () =>
  render(
    <ThemeProvider>
      <StudentProvisioningScreen initialTab="roster" />
    </ThemeProvider>,
  );

describe("StudentProvisioningScreen roster filters", () => {
  beforeEach(() => {
    resetRememberedRosterFilters();
    mockGetRoster.mockReset();
    mockGetRoster.mockResolvedValue(roster);
  });

  it("shows the filter bar with real counts and filters the rows", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText("Student a")).toBeTruthy());
    expect(screen.getByText("Stage")).toBeTruthy();
    expect(screen.getByText("SS3 (2)")).toBeTruthy();
    expect(screen.getByText("Self-signed-up (1)")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("How they joined: Self-signed-up, 1 student"));
    expect(screen.queryByText("Student a")).toBeNull();
    expect(screen.getByText("Student c")).toBeTruthy();
    expect(screen.getByText("Showing 1 of 3 students")).toBeTruthy();
  });

  it("combines filters, shows an honest empty state and resets", async () => {
    renderScreen();
    await waitFor(() => expect(screen.getByText("Student a")).toBeTruthy());
    fireEvent.press(screen.getByLabelText("Stage: SS2, 1 student"));
    fireEvent.press(screen.getByLabelText("Account: Not claimed yet, 0 students"));
    expect(screen.getByText("No students match these filters")).toBeTruthy();
    expect(screen.queryByText("Student c")).toBeNull();

    fireEvent.press(screen.getAllByLabelText("Reset filters")[0]);
    expect(screen.queryByText("No students match these filters")).toBeNull();
    expect(screen.getByText("Student a")).toBeTruthy();
    expect(screen.getByText("Student c")).toBeTruthy();
  });

  it("keeps the choice when the roster tab is opened again in the same session", async () => {
    const first = renderScreen();
    await waitFor(() => expect(screen.getByText("Student a")).toBeTruthy());
    fireEvent.press(screen.getByLabelText("Stage: SS2, 1 student"));
    expect(screen.queryByText("Student a")).toBeNull();
    first.unmount();

    renderScreen();
    await waitFor(() => expect(screen.getByText("Student c")).toBeTruthy());
    expect(screen.queryByText("Student a")).toBeNull();
    expect(screen.getByText("Showing 1 of 3 students")).toBeTruthy();
  });

  it("keeps the original empty state when there are no visible students at all", async () => {
    mockGetRoster.mockResolvedValue({ students: [], totalAffiliated: 0, aggregateOnly: 0, sharedWithYou: 0 });
    renderScreen();
    await waitFor(() => expect(screen.getByText("No individually-visible students yet")).toBeTruthy());
    expect(screen.queryByText("Stage")).toBeNull();
    expect(screen.queryByText("No students match these filters")).toBeNull();
  });
});
