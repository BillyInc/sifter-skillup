import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { AdminWorkbench } from "./AdminWorkbench";
import { getAdminResume, getAdminTask } from "@/lib/adminResume";
import type { StudentIntelligenceSummary } from "../../types/institution";

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: jest.fn() }),
}));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
jest.mock("@/lib/adminResume", () => ({
  getAdminResume: jest.fn(),
  getAdminTask: jest.fn(),
}));

const summary: StudentIntelligenceSummary = {
  organizationId: "org-1",
  totalAffiliated: 12,
  selfSignedUp: 5,
  provisionedByYou: 7,
  unclaimedCodes: 3,
  stageCounts: [{ stage: "not_recorded", total: 2, selfSignedUp: 1, provisionedByYou: 1 }],
  topDomains: [],
};

const wrap = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  (getAdminTask as jest.Mock).mockResolvedValue(null);
  (getAdminResume as jest.Mock).mockResolvedValue(null);
});

describe("AdminWorkbench", () => {
  it("shows real counts and opens the roster", async () => {
    wrap(<AdminWorkbench students={{ status: "real", data: summary }} />);
    expect(screen.getByText("Attention needed")).toBeTruthy();
    expect(screen.getByText("3 claim codes have not been used yet")).toBeTruthy();
    expect(screen.getByText("2 students have not recorded a stage yet")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("3 claim codes have not been used yet. Open the account list"));
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/(admin)/students");
  });

  it("sends tutorial centres and JAMB cafes to the JAMB accounts", () => {
    wrap(<AdminWorkbench students={{ status: "real", data: summary }} providerOnly />);
    fireEvent.press(screen.getByLabelText(/3 claim codes have not been used yet/));
    expect(mockPush).toHaveBeenCalledWith("/(admin)/students?mode=jamb");
  });

  it("says plainly when nothing needs attention", () => {
    wrap(
      <AdminWorkbench
        students={{ status: "real", data: { ...summary, unclaimedCodes: 0, stageCounts: [] } }}
      />,
    );
    expect(screen.getByText("Attention needed")).toBeTruthy();
    expect(screen.getByText("No unused claim codes or unrecorded stages right now.")).toBeTruthy();
  });

  it("renders nothing while the payload is pending, unavailable or locked", () => {
    for (const status of ["pending", "coming_soon", "locked"] as const) {
      const { toJSON, unmount } = wrap(<AdminWorkbench students={{ status, data: null }} />);
      expect(toJSON()).toBeNull();
      unmount();
    }
  });

  it("offers to resume the last admin page and opens its saved href", async () => {
    (getAdminResume as jest.Mock).mockResolvedValue({
      href: "/(admin)/skills-gap?programme_id=P1",
      label: "Programme skills review",
      updatedAt: "2026-11-20T12:00:00.000Z",
    });
    wrap(<AdminWorkbench students={{ status: "pending", data: null }} />);
    await waitFor(() => expect(screen.getByText("Pick up where you left off")).toBeTruthy());
    expect(screen.getByText("Programme skills review")).toBeTruthy();
    expect(screen.getByText(/Last opened/)).toBeTruthy();
    expect(screen.queryByText("Attention needed")).toBeNull();
    fireEvent.press(screen.getByLabelText(/^Continue: Programme skills review/));
    expect(mockPush).toHaveBeenCalledWith("/(admin)/skills-gap?programme_id=P1");
  });

  it("does not offer to resume into the admin home", async () => {
    (getAdminResume as jest.Mock).mockResolvedValue({
      href: "/(admin)/dashboard",
      label: "Admin workspace",
      updatedAt: "2026-11-20T12:00:00.000Z",
    });
    const { toJSON } = wrap(<AdminWorkbench students={{ status: "pending", data: null }} />);
    await waitFor(() => expect(getAdminResume).toHaveBeenCalled());
    expect(screen.queryByText("Pick up where you left off")).toBeNull();
    expect(toJSON()).toBeNull();
  });

  it("keeps targets at least 44px high", () => {
    wrap(<AdminWorkbench students={{ status: "real", data: summary }} />);
    const button = screen.getByLabelText(/3 claim codes have not been used yet/);
    const style = Array.isArray(button.props.style)
      ? Object.assign({}, ...button.props.style.flat())
      : button.props.style;
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
  });
});
