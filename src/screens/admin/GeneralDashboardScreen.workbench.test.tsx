import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { adminData } from "@/lib/adminData";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { getAdminResume, getAdminTask } from "@/lib/adminResume";
import { GeneralDashboardScreen } from "./GeneralDashboardScreen";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
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
    getProgrammeIntelligence: jest.fn(),
    getIntelligenceAlerts: jest.fn(),
    getDomainRanking: jest.fn(),
    getDomainReachAudit: jest.fn(),
    getStudentIntelligenceSummary: jest.fn(),
  },
}));

const pending = { status: "coming_soon", data: null };

beforeEach(() => {
  (getEducatorProfile as jest.Mock).mockResolvedValue({ organizationName: "Test University", role: "owner" });
  for (const fn of [
    adminData.getInstitutionSummary,
    adminData.getProgrammeIntelligence,
    adminData.getDomainRanking,
    adminData.getDomainReachAudit,
  ]) (fn as jest.Mock).mockResolvedValue(pending);
  (adminData.getIntelligenceAlerts as jest.Mock).mockResolvedValue({ status: "real", data: [] });
  (adminData.getStudentIntelligenceSummary as jest.Mock).mockResolvedValue({
    status: "real",
    data: {
      organizationId: "org-1",
      totalAffiliated: 9,
      selfSignedUp: 4,
      provisionedByYou: 5,
      unclaimedCodes: 1,
      stageCounts: [],
      topDomains: [],
    },
  });
  (getAdminTask as jest.Mock).mockResolvedValue({
    href: "/(admin)/students",
    label: "Student account creation and roster",
    stage: "ss3_secondary",
    tab: "add",
    updatedAt: "2026-11-20T12:00:00.000Z",
  });
  (getAdminResume as jest.Mock).mockResolvedValue(null);
});

describe("GeneralDashboardScreen workbench", () => {
  it("renders attention items and the last task from the loaded payload", async () => {
    render(
      <ThemeProvider>
        <GeneralDashboardScreen />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByText("Attention needed")).toBeTruthy());
    expect(screen.getByText("1 claim code has not been used yet")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Pick up where you left off")).toBeTruthy());
    expect(screen.getByText("Student account creation and roster")).toBeTruthy();
  });
});
