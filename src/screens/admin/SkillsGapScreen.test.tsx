import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { adminData } from "@/lib/adminData";
import { getEducatorProfile } from "@/lib/educatorProfile";
import type { ProgrammeSkillCoverage } from "@/types/institution";
import { SkillsGapScreen } from "./SkillsGapScreen";

jest.mock("expo-router", () => ({ useLocalSearchParams: () => ({}) }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "uni-user" } }) }));
jest.mock("@/lib/educatorProfile", () => ({ getEducatorProfile: jest.fn() }));
jest.mock("@/lib/adminData", () => ({ adminData: { getProgrammeSkillCoverage: jest.fn(), getJambProgrammeOptions: jest.fn() } }));
jest.mock("./AdminShell", () => ({ AdminShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
jest.mock("./ComingSoonPanel", () => ({ ComingSoonPanel: ({ state, children }: { state: { status: string; data?: unknown }; children: (rows: ProgrammeSkillCoverage[]) => React.ReactNode }) => state.status === "real" ? <>{children((state.data ?? []) as ProgrammeSkillCoverage[])}</> : null }));
jest.mock("@/components/admin/AdminGuidanceEvidencePanel", () => ({ AdminGuidanceEvidencePanel: () => null }));
jest.mock("@/components/careerIntelligence/ExternalLinkGuard", () => ({ ExternalLinkGuard: () => null }));

describe("university Programme Intelligence reports", () => {
  it("lists institution offerings and drills into the selected JAMB offering without claiming external or institution-specific curriculum", async () => {
    (getEducatorProfile as jest.Mock).mockResolvedValue({ organizationType: "university", organizationId: "uni-1" });
    (adminData.getJambProgrammeOptions as jest.Mock).mockResolvedValue({ status: "real", data: [] });
    (adminData.getProgrammeSkillCoverage as jest.Mock).mockResolvedValue({
      status: "real",
      data: [{
        programmeId: "offering:17:jamb-3",
        programmeName: "Accounting and Finance",
        jambProgrammeId: "jamb-3",
        jambProgrammeName: "Accounting and Finance",
        jambFaculty: "Social Sciences",
        offeringId: "17",
        jambAnchorState: "mapped",
        comparisonScope: "jamb_ccmas_baseline",
        curriculumContractState: "available",
        curriculumSkills: ["Financial reporting"],
        curriculumTechnical: [],
        curriculumTransferable: [],
        curriculumStatus: "complete",
        curriculumEvidence: [{ courseCode: "FIN101", courseTitle: "Foundations", studentText: "Understand financial reporting", studentDisplay: true, dataState: "source_backed", sourceLocator: "page 3" }],
        domains: [],
      } as ProgrammeSkillCoverage],
    });

    render(<ThemeProvider><SkillsGapScreen /></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("Your offering reports (1)")).toBeTruthy());
    fireEvent.press(screen.getByText("Accounting and Finance"));
    await waitFor(() => expect(screen.getByText(/Back to offering reports/)).toBeTruthy());
    expect(screen.getByText("Mapped CCMAS curriculum baseline")).toBeTruthy();
    expect(screen.getByText(/not verified teaching delivery at this specific university/)).toBeTruthy();
    expect(screen.getByText(/separate external-curriculum comparison is not supplied/)).toBeTruthy();
    expect(screen.getByText("FIN101 · Foundations")).toBeTruthy();
    expect(screen.getByText(/Understand financial reporting/)).toBeTruthy();
  });
});
