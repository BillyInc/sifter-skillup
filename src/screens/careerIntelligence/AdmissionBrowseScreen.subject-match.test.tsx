import React from "react";
import { Text } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
const mockExploreNav = { programme: jest.fn() };
const mockGetProgrammesBySubjects = jest.fn();
const mockParams = {
  mode: "subjects",
  exam_type: "olevel",
  user_type: "senior_secondary",
  class_name: "ss1",
  stream: "science",
  journey_mode: "guided_subject_discovery",
  subjects: "",
  olevel_subjects: "English Language,Mathematics,Biology,Chemistry,Physics",
};

jest.mock("expo-router", () => ({ useLocalSearchParams: () => mockParams, useRouter: () => mockRouter }));
jest.mock("@/lib/careerData", () => ({ careerData: { getProgrammesBySubjects: (...args: unknown[]) => mockGetProgrammesBySubjects(...args) } }));
jest.mock("@/lib/api", () => ({ API: {} }));
jest.mock("@/lib/startingPoint", () => ({ getStartingPoint: jest.fn(), saveStartingPoint: jest.fn() }));
jest.mock("@/lib/onboardingDraft", () => ({ clearOnboardingDraft: jest.fn() }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null, refreshUser: jest.fn() }) }));
jest.mock("@/components/careerIntelligence", () => ({ invalidateGuidancePathCache: jest.fn() }));
jest.mock("@/components/careerIntelligence/CareerDisclaimer", () => ({ CareerDisclaimer: () => null }));
jest.mock("@/components/onboarding/LiveSubjectMultiSelect", () => ({ LiveSubjectMultiSelect: () => null, MAX_OLEVEL_SUBJECTS: 6 }));
jest.mock("@/lib/exploreNav", () => ({ useExploreNav: () => mockExploreNav }));
jest.mock("@/lib/adminLearnerAudience", () => ({ adminLearnerAudienceForOrg: () => null }));
jest.mock("@/lib/provisioningData", () => ({ provisioningData: {} }));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("@/theme", () => ({
  Brand: { primary: "#f80", primaryDeep: "#a50" },
  FontSize: { xs: 10, sm: 12, md: 14, lg: 16 },
  FontWeight: { bold: "700", heavy: "800" },
  Radius: { sm: 6, md: 8 },
  Spacing: { xs: 3, sm: 6, md: 10, lg: 14, xl: 18 },
  webContainer: () => ({}),
  useTheme: () => ({ colors: {
    accent: "#f80", bg: "#fff", border: "#ddd", card: "#fff", goldSoft: "#fcf3dd",
    surface: { subtle: "#eee" }, text: "#111", textInverse: "#fff", textMuted: "#666", textSoft: "#333",
  } }),
}));

import AdmissionBrowseScreen from "./AdmissionBrowseScreen";

describe("AdmissionBrowseScreen subject-match programme rows", () => {
  beforeEach(() => {
    mockGetProgrammesBySubjects.mockReset();
    mockExploreNav.programme.mockReset();
    mockGetProgrammesBySubjects.mockResolvedValue({
      status: "real",
      data: [{
        id: "jamb-sociology",
        jambProgrammeId: "jamb-sociology",
        jambName: "Sociology",
        matchedSubjectCount: 5,
        matchedSubjects: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
        matchBasis: "national_and_university_specific",
        universitySpecificMatchSchoolIds: ["uni-local-match"],
        schoolOfferings: [
          { schoolId: "uni-national-match", schoolName: "National University", programmeName: "Sociology", universityEligibilityStatus: "none" },
          { schoolId: "uni-local-match", schoolName: "Local University", programmeName: "Sociology", universityEligibilityStatus: "eligible_local_rule" },
          { schoolId: "uni-local-gap", schoolName: "Gap University", programmeName: "Sociology", universityEligibilityStatus: "local_rule_gap" },
        ],
      }],
      meta: {},
    });
  });

  it("shows a programme action and carries the matching national/local university set into the preview", async () => {
    const ui = render(<AdmissionBrowseScreen />);

    await waitFor(() => expect(ui.getByText("Sociology")).toBeTruthy());
    expect(ui.getByRole("button", { name: "See this programme Sociology" })).toBeTruthy();
    expect(ui.queryByText("National University")).toBeNull();

    fireEvent.press(ui.getByRole("button", { name: "See this programme Sociology" }));

    await waitFor(() => expect(mockExploreNav.programme).toHaveBeenCalled());
    const [, programmeId, context] = mockExploreNav.programme.mock.calls[0];
    expect(programmeId).toBe("jamb-sociology");
    expect(context).toEqual(expect.objectContaining({
      userType: "senior_secondary",
      className: "ss1",
      stream: "science",
      subjectMatchOlevel: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
      subjectMatchScopeApplied: true,
      subjectMatchSchoolIds: ["uni-national-match", "uni-local-match"],
      subjectMatchBasis: "national_and_university_specific",
    }));
  });

  it("uses the exact offered programme name for a university-only match row", async () => {
    mockGetProgrammesBySubjects.mockResolvedValueOnce({
      status: "real",
      data: [{
        id: "jamb-sociology",
        jambProgrammeId: "jamb-sociology",
        jambName: null,
        studentName: null,
        matchedSubjectCount: 5,
        matchedSubjects: [],
        matchBasis: "university_specific",
        universitySpecificMatchSchoolIds: ["uni-ilorin"],
        schoolOfferings: [{
          schoolId: "uni-ilorin",
          schoolName: "ILORIN",
          programmeName: "Sociology",
          studentName: "Sociology",
          universityEligibilityStatus: "eligible_local_rule",
        }],
      }],
      meta: {},
    });

    const ui = render(<AdmissionBrowseScreen />);
    await waitFor(() => expect(ui.getByText("Sociology")).toBeTruthy());
    expect(ui.getByRole("button", { name: "See this programme Sociology" })).toBeTruthy();
    expect(ui.queryByText("Programme")).toBeNull();

    fireEvent.press(ui.getByRole("button", { name: "See this programme Sociology" }));
    await waitFor(() => expect(mockExploreNav.programme).toHaveBeenCalled());
    expect(mockExploreNav.programme).toHaveBeenCalledWith(expect.anything(), "jamb-sociology", expect.objectContaining({
      subjectMatchBasis: "university_specific",
      subjectMatchScopeApplied: true,
      subjectMatchSchoolIds: ["uni-ilorin"],
    }));
  });
});
