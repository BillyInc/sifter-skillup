import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { adminData } from "@/lib/adminData";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { getAdminResume, getAdminTask } from "@/lib/adminResume";
import { SchoolGuidanceDashboardScreen } from "./SchoolGuidanceDashboardScreen";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
jest.mock("./AdminShell", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/lib/educatorProfile", () => ({ getEducatorProfile: jest.fn() }));
jest.mock("@/lib/adminResume", () => ({ getAdminResume: jest.fn(), getAdminTask: jest.fn() }));
jest.mock("@/lib/adminData", () => ({
  adminData: {
    getInstitutionSummary: jest.fn(),
    getIntelligenceAlerts: jest.fn(),
    getStudentIntelligenceSummary: jest.fn(),
  },
}));

const students = {
  organizationId: "org-1",
  totalAffiliated: 12,
  selfSignedUp: 5,
  provisionedByYou: 7,
  unclaimedCodes: 3,
  stageCounts: [{ stage: "not_recorded", total: 2, selfSignedUp: 1, provisionedByYou: 1 }],
  topDomains: [{ domainKey: "D078", label: "Social Sciences", pct: 40 }],
};

beforeEach(() => {
  mockPush.mockClear();
  (getEducatorProfile as jest.Mock).mockResolvedValue({
    organizationName: "Test School",
    organizationType: "secondary_school",
    role: "owner",
  });
  (adminData.getInstitutionSummary as jest.Mock).mockResolvedValue({ status: "coming_soon", data: null });
  (adminData.getIntelligenceAlerts as jest.Mock).mockResolvedValue({ status: "real", data: [] });
  (adminData.getStudentIntelligenceSummary as jest.Mock).mockResolvedValue({ status: "real", data: students });
  (getAdminTask as jest.Mock).mockResolvedValue(null);
  (getAdminResume as jest.Mock).mockResolvedValue({
    href: "/(admin)/verify",
    label: "Verification",
    updatedAt: "2026-11-20T12:00:00.000Z",
  });
});

describe("SchoolGuidanceDashboardScreen workbench", () => {
  it("renders attention items and a resume card from the loaded payload", async () => {
    render(
      <ThemeProvider>
        <SchoolGuidanceDashboardScreen />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("Attention needed")).toBeTruthy());
    expect(screen.getByText("3 claim codes have not been used yet")).toBeTruthy();
    expect(screen.getByText("2 students have not recorded a stage yet")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Pick up where you left off")).toBeTruthy());
    // The real payload field names now reach the existing cards and list.
    expect(screen.getByText("Social Sciences")).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Continue: Verification/));
    expect(mockPush).toHaveBeenCalledWith("/(admin)/verify");
  });

  it("shows no attention module while the student payload is unavailable", async () => {
    (adminData.getStudentIntelligenceSummary as jest.Mock).mockResolvedValue({ status: "coming_soon", data: null });
    render(
      <ThemeProvider>
        <SchoolGuidanceDashboardScreen />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("Pick up where you left off")).toBeTruthy());
    expect(screen.queryByText("Attention needed")).toBeNull();
  });
});
