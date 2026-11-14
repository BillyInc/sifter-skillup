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

describe("programme preview and university downstream", () => {
  beforeEach(() => mockExploreNav.domain.mockReset());

  it("shows the general programme preview without domain cards before university selection", () => {
    renderBody(baseProps);

    expect(screen.getByText("Before you choose a university")).toBeTruthy();
    expect(screen.getByText("General UTME subjects")).toBeTruthy();
    expect(screen.getByText("View universities")).toBeTruthy();
    expect(screen.queryByText("What this programme can lead to")).toBeNull();
    expect(screen.queryByText("See how Sociology continues in this field")).toBeNull();
    fireEvent.press(screen.getByText("View universities"));
    expect(baseProps.onChooseSchool).toHaveBeenCalled();
  });

  it("places the compact Books entry after the programme overview", () => {
    const rendered = renderBody({ ...baseProps, undergraduateContext: true, universitySelectionAllowed: false });
    expect(screen.getByTestId("programme-books-link")).toBeTruthy();
    const renderedTree = JSON.stringify(rendered.toJSON());
    expect(renderedTree.indexOf("Programme overview")).toBeGreaterThanOrEqual(0);
    expect(renderedTree.indexOf("Programme overview")).toBeLessThan(renderedTree.indexOf("Books"));
  });

  it("starts undergraduate tray with the programme and does not invent university context when none was selected", () => {
    renderBody({
      ...baseProps,
      secondaryUniversityFlow: false,
      undergraduateContext: true,
      universitySelectionAllowed: false,
      selectedSchool: null,
    });

    fireEvent.press(screen.getByRole("button", { name: /Open learning plan tray/ }));
    expect(screen.getByTestId("guided-learning-tray")).toBeTruthy();
    expect(screen.getByText(/Programme: Sociology/)).toBeTruthy();
    expect(screen.queryByText(/Institution:/)).toBeNull();
  });

  it("carries an earlier selected university into an undergraduate programme tray", () => {
    const selectedSchool = {
      schoolId: "unilag",
      schoolName: "University of Lagos",
      universityOlevelRequirement: "Five credits including English and Mathematics.",
      universityUtmeSubjects: "English, Government, and Sociology.",
      universityStructuredSubjectRules: [],
      universityRequirementExceptions: [],
    };
    renderBody({
      ...baseProps,
      secondaryUniversityFlow: false,
      undergraduateContext: true,
      universitySelectionAllowed: false,
      selectedSchool: null,
      trayInstitution: selectedSchool,
    });

    fireEvent.press(screen.getByRole("button", { name: /Open learning plan tray/ }));
    expect(screen.getByTestId("guided-learning-tray")).toBeTruthy();
    expect(screen.getByText(/Programme: Sociology/)).toBeTruthy();
    expect(screen.getByText(/Institution: University of Lagos/)).toBeTruthy();
  });

  it("carries the selected/comparison institution into the programme-first tray on secondary routes", () => {
    const selectedSchool = {
      schoolId: "unilag",
      schoolName: "University of Lagos",
      universityOlevelRequirement: "Five credits including English and Mathematics.",
      universityUtmeSubjects: "English, Government, and Sociology.",
      universityStructuredSubjectRules: [],
      universityRequirementExceptions: [],
    };
    renderBody({ ...baseProps, selectedSchool, selectedSchoolId: "unilag" });

    fireEvent.press(screen.getByRole("button", { name: /Open learning plan tray/ }));
    expect(screen.getByTestId("guided-learning-tray")).toBeTruthy();
    expect(screen.getByText(/Programme: Sociology/)).toBeTruthy();
    expect(screen.getByText(/Institution: University of Lagos/)).toBeTruthy();
  });

  it("shows this university's requirements before D078 and carries route context", () => {
    const selectedSchool = {
      schoolId: "unilag",
      schoolName: "University of Lagos",
      universityOlevelRequirement: "Five credits including English and Mathematics.",
      universityUtmeSubjects: "English, Government, and another social science subject.",
      universityStructuredSubjectRules: [],
      universityRequirementExceptions: [],
    };
    renderBody({ ...baseProps, selectedSchool, selectedSchoolId: "unilag" });

    expect(screen.getByText("This university's O-level requirements")).toBeTruthy();
    expect(screen.getByText("Five credits including English and Mathematics.")).toBeTruthy();
    expect(screen.getByText("This university's UTME subjects")).toBeTruthy();
    expect(screen.getByText("English, Government, and another social science subject.")).toBeTruthy();
    expect(screen.getByText("General programme subjects, before this university's own conditions")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "See how Sociology continues in this field" }));

    expect(mockExploreNav.domain).toHaveBeenCalledWith(expect.anything(), "D078", expect.objectContaining({
      programmeId: "jamb-sociology",
      jambProgrammeId: "jamb-sociology",
      schoolId: "unilag",
      userType: "jamb",
      className: "ss3_secondary",
      stream: "science",
    }));
  });

  it("does not show D078 when the selected programme has no reviewed D078 link", () => {
    const selectedSchool = {
      schoolId: "unilag",
      schoolName: "University of Lagos",
      universityOlevelRequirement: "Five credits including English and Mathematics.",
      universityUtmeSubjects: "English, Government, and another social science subject.",
      universityStructuredSubjectRules: [],
      universityRequirementExceptions: [],
    };
    renderBody({
      ...baseProps,
      data: { ...baseProps.data, domains: [] },
      selectedSchool,
      selectedSchoolId: "unilag",
    });

    expect(screen.getByText("What this programme can lead to")).toBeTruthy();
    expect(screen.queryByText("See how Sociology continues in this field")).toBeNull();
  });

  it("compares two universities side by side with their own requirement text", () => {
    const universities = [
      {
        schoolId: "unilag",
        schoolName: "University of Lagos",
        universityOlevelRequirement: "UNILAG: five credits including English and Mathematics.",
        universityUtmeSubjects: "UNILAG: English, Government, and Sociology.",
        universityStructuredSubjectRules: [],
        universityRequirementExceptions: [],
      },
      {
        schoolId: "ui",
        schoolName: "University of Ibadan",
        universityOlevelRequirement: "UI: five credits including English and three Arts subjects.",
        universityUtmeSubjects: "UI: English, Government, and Economics.",
        universityStructuredSubjectRules: [],
        universityRequirementExceptions: [],
      },
    ];
    renderBody({
      ...baseProps,
      tab: "schools",
      earlySecondary: true,
      schools: universities,
      universitySearchResults: universities,
      comparisonSchools: universities,
      comparisonSchoolIds: ["unilag", "ui"],
      comparisonOpen: true,
    });

    expect(screen.getByText("Compare selected universities")).toBeTruthy();
    expect(screen.getByText("UNILAG: English, Government, and Sociology.")).toBeTruthy();
    expect(screen.getByText("UNILAG: five credits including English and Mathematics.")).toBeTruthy();
    expect(screen.getByText("UI: English, Government, and Economics.")).toBeTruthy();
    expect(screen.getByText("UI: five credits including English and three Arts subjects.")).toBeTruthy();
  });
});
