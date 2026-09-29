import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react-native";
import { adminData } from "@/lib/adminData";
import { ThemeProvider } from "@/theme";
import type { EducatorProfile, InstitutionPortfolioReach, InstitutionSummary, PeerInstitutionRow, PeerProgrammeComparison, ProgrammeSkillCoverage } from "@/types/institution";
import { UniversityExploreSurface } from "./AdminExploreSurfaces";

jest.mock("@/screens/ExploreScreen", () => () => null);

jest.mock("@/lib/adminData", () => ({
  adminData: {
    getInstitutionSummary: jest.fn(),
    getProgrammeSkillCoverage: jest.fn(),
    getPeerComparison: jest.fn(),
    getPeerProgrammeComparison: jest.fn(),
  },
}));

describe("University Explore", () => {
  it("shows institution-scoped stats, distinct JAMB offering context, and peer comparison", async () => {
    (adminData.getInstitutionSummary as jest.Mock).mockResolvedValue({
      status: "real",
      data: { activeProgrammes: 3, domainsAccessible: 8, facultyCount: 2 } as InstitutionSummary,
    });
    (adminData.getProgrammeSkillCoverage as jest.Mock).mockResolvedValue({
      status: "real",
      data: [{
        programmeId: "offering:of-17:jamb-1",
        programmeName: "Accounting and Finance",
        jambProgrammeId: "jamb-1",
        jambProgrammeName: "Accounting and Finance",
        jambFaculty: "Social Sciences",
        offeringId: "of-17",
        jambAnchorState: "mapped",
        curriculumContractState: "available",
        curriculumSkills: [],
        curriculumTechnical: [],
        curriculumTransferable: [],
        curriculumStatus: "complete",
        domains: [],
      } as ProgrammeSkillCoverage],
    });
    (adminData.getPeerComparison as jest.Mock).mockResolvedValue({
      status: "real",
      data: [
        { institutionId: "school-self", institutionName: "Example University", isSelf: true, programmesAccessible: 2, domainsAccessible: 2, specializationsAccessible: 2, rolesAccessible: 4 } as PeerInstitutionRow,
        { institutionId: "school-peer", institutionName: "Example Peer University", programmesAccessible: 3, domainsAccessible: 7, specializationsAccessible: 9, rolesAccessible: 12 } as PeerInstitutionRow,
      ],
    });
    const current = { institutionId: "school-self", institutionName: "Example University", programmesAccessible: 2, domainsAccessible: 2, specializationsAccessible: 2, rolesAccessible: 4, offerings: [], demandStatus: "coming_soon" } as InstitutionPortfolioReach;
    const peer = { institutionId: "school-peer", institutionName: "Example Peer University", programmesAccessible: 3, domainsAccessible: 7, specializationsAccessible: 9, rolesAccessible: 12, offerings: [], demandStatus: "coming_soon" } as InstitutionPortfolioReach;
    (adminData.getPeerProgrammeComparison as jest.Mock).mockResolvedValue({
      status: "real",
      data: {
        current,
        peer,
        programmesPeerTeachesNotCurrent: [{ offeringId: "offer-1", jambProgrammeId: "jamb-3", programmeName: "Public Health", curriculumAnchor: "mapped", domainsAccessible: 2, specializationsAccessible: 3, rolesAccessible: 8 }],
        programmesCurrentTeachesNotPeer: [],
        programmesBothTeach: [{
          current: { offeringId: "common-accounting-current", jambProgrammeId: "jamb-accounting", programmeName: "Accounting", jambFaculty: "Administration", curriculumAnchor: "mapped", domainsAccessible: 1, specializationsAccessible: 2, rolesAccessible: 3 },
          peer: { offeringId: "common-accounting-peer", jambProgrammeId: "jamb-accounting", programmeName: "Accounting", jambFaculty: "Administration", curriculumAnchor: "mapped", domainsAccessible: 1, specializationsAccessible: 2, rolesAccessible: 3 },
        }],
        demandNote: "Demand counts are unavailable until source-backed labour-market ingestion is active.",
      } as PeerProgrammeComparison,
    });

    const profile = { organizationType: "university", organizationName: "Example University" } as EducatorProfile;
    render(<ThemeProvider><UniversityExploreSurface profile={profile} /></ThemeProvider>);
    await act(async () => {
      // Let the initial parallel fetches settle; choosing the first peer then
      // triggers the second comparison request inside a follow-up effect.
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => expect(screen.getByText("Your JAMB programme offerings")).toBeTruthy());
    expect(screen.getByText("Example University view: institution-scoped offerings, curriculum coverage and aggregate peer context. This workspace is for university planning, not student guidance.")).toBeTruthy();
    expect(screen.getByText("Accounting and Finance")).toBeTruthy();
    expect(screen.getByText(/Social Sciences/)).toBeTruthy();
    expect(screen.getByText("Compare programme portfolios")).toBeTruthy();
    expect(screen.getAllByText("Example Peer University").length).toBeGreaterThan(1);
    await waitFor(() => expect(screen.getByText(/1 programme is listed/)).toBeTruthy());
    expect(screen.getByText("Public Health")).toBeTruthy();
    expect(screen.getByText("Market demand: Coming soon")).toBeTruthy();
    expect(adminData.getPeerProgrammeComparison).toHaveBeenCalledWith("school-peer");
    expect(adminData.getProgrammeSkillCoverage).toHaveBeenCalledWith();
  });
});
