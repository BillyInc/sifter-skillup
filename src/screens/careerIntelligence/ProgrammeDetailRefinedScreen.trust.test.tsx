import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { LightColors, ThemeProvider } from "@/theme";

const mockExploreNav = { domain: jest.fn() };

jest.mock("@/lib/exploreNav", () => ({
  ADMIN_EXPLORE_BASE: "/(admin)/workspace-explore",
  useExploreNav: () => mockExploreNav,
}));
jest.mock("@/hooks/useResponsive", () => ({ useResponsive: () => ({ isMobile: true }) }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
jest.mock("@/lib/careerData", () => ({ careerData: {} }));
jest.mock("@/lib/provisioningData", () => ({ provisioningData: {} }));
jest.mock("@/lib/startingPoint", () => ({ getStartingPoint: jest.fn() }));
jest.mock("@/components/careerIntelligence", () => ({
  DataSourceBadge: () => null,
  ContextualItemList: () => null,
  DegreeSkills: () => null,
  ProgrammeBooksLink: () => {
    const ReactActual = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return ReactActual.createElement(Text, { testID: "programme-books-link" }, "Books");
  },
  DetailScaffold: () => null,
  SectionLabel: ({ children }: any) => {
    const ReactActual = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return ReactActual.createElement(Text, null, children);
  },
  TextTabs: () => null,
  invalidateGuidancePathCache: jest.fn(),
  ExternalLinkGuard: () => null,
  ProgrammeTrustPanel: jest.requireActual("@/components/careerIntelligence/ProgrammeTrustPanel").ProgrammeTrustPanel,
}));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

import { ProgrammeDetailBody } from "./ProgrammeDetailRefinedScreen";

const baseProps: any = {
  programmeTrayMode: "icon",
  data: {
    id: "jamb-sociology",
    name: "Sociology",
    studentName: "Sociology",
    institutionType: "university",
    domains: [{
      domainId: "D078",
      domainName: "Social Sciences & Behavioural Research",
      matchType: "direct",
      explanation: "Sociology has a reviewed connection to this field.",
      courseAnchors: [],
    }],
  },
  tab: "overview",
  programmeName: "Sociology",
  programmeSelected: true,
  requirements: {
    olevelRequirement: "Five O-level credits.",
    utmeSubjects: "English and two other subjects.",
  },
  schools: [],
  universitySearchResults: [],
  universityQuery: "",
  onUniversityQueryChange: jest.fn(),
  selectedSchool: null,
  comparisonSchools: [],
  comparisonSchoolIds: [],
  onToggleComparison: jest.fn(),
  comparisonOpen: false,
  onOpenComparison: jest.fn(),
  onCloseComparison: jest.fn(),
  selectedSchoolId: null,
  earlySecondary: false,
  secondaryUniversityFlow: true,
  undergraduateContext: false,
  subjectMatchScopeApplied: false,
  studentYearOfStudy: null,
  universitySelectionAllowed: true,
  notice: null,
  savingSchool: null,
  onSelectSchool: jest.fn(),
  onChooseSchool: jest.fn(),
  guidanceStudentId: undefined,
  guidanceContext: {
    programmeId: "jamb-sociology",
    jambProgrammeId: "jamb-sociology",
    schoolId: "unilag",
    userType: "jamb",
    className: "ss3_secondary",
    stream: "science",
  },
  router: {} as any,
  focusedGuidance: false,
  viewOnly: false,
  showCareerGuidance: true,
  guidedAdmissionJourney: true,
  colors: LightColors,
};

function renderBody(props: any) {
  return render(<ThemeProvider><ProgrammeDetailBody {...props} /></ThemeProvider>);
}

const selectedSchool = {
  schoolId: "unilag",
  schoolName: "University of Lagos",
  jambProgrammeId: "jamb-sociology",
  universityOlevelRequirement: "Five credits including English and Mathematics.",
  universityUtmeSubjects: "English, Government, and Sociology.",
  universityStructuredSubjectRules: [],
  universityRequirementExceptions: [],
};

// Regression: the trust panel used to render only inside the "requirements" tab,
// which the tab bar never offers, so students never saw it. The component test
// could not catch that, so this renders the real screen body on the reachable tab.
describe("programme page trust panel is reachable", () => {
  it("shows the information status and the report action once a university is selected (overview tab)", () => {
    renderBody({ ...baseProps, tab: "overview", selectedSchool, selectedSchoolId: "unilag" });
    expect(screen.getByText("Information status")).toBeTruthy();
    expect(screen.getByText("Report incorrect information")).toBeTruthy();
    expect(screen.getByLabelText(/^Information status: /)).toBeTruthy();
  });

  it("does not show the panel before a university is chosen", () => {
    renderBody({ ...baseProps, tab: "overview", selectedSchool: null });
    expect(screen.queryByText("Information status")).toBeNull();
    expect(screen.queryByText("Report incorrect information")).toBeNull();
  });

  it("shows the panel once, not twice, on the overview tab", () => {
    renderBody({ ...baseProps, tab: "overview", selectedSchool, selectedSchoolId: "unilag" });
    expect(screen.getAllByText("Information status")).toHaveLength(1);
  });
});
