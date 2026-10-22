import { nextHrefForStartingPoint } from "./OnboardingFlow";

jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

describe("onboarding admission route selection", () => {
  it.each(["jamb", "ss3_secondary"] as const)(
    "%s opens the selected programme at its selected university without the national preview",
    (userType) => {
      const href = nextHrefForStartingPoint({
        userType,
        ssDoor: "know_where",
        ssClass: userType === "ss3_secondary" ? "ss3_secondary" : undefined,
        intendedProgramme: "Sociology",
        intendedJambProgrammeId: "jamb-sociology",
        preferredSchool: "University of Lagos",
        preferredSchoolId: "unilag",
        stream: "science",
        olevelSubjects: ["English Language", "Mathematics", "Government", "Economics", "History"],
        jambSubjects: ["Use of English", "Government", "Economics", "History"],
      } as any);

      expect(href).toContain("/(tabs)/explore/programme/jamb-sociology?");
      expect(href).toContain("school_id=unilag");
      expect(href).toContain(`user_type=${userType}`);
      expect(href).toContain("journey_mode=programme_to_role");
      expect(href).toContain("resume=university_context");
      expect(href).toContain("olevel_subjects=English%20Language%2CMathematics%2CGovernment%2CEconomics%2CHistory");
      expect(href).toContain("subjects=Use%20of%20English%2CGovernment%2CEconomics%2CHistory");
      expect(href).not.toContain("/admission");
    },
  );

  it("opens the national O-level subject matcher for SS1/SS2 subject-only discovery", () => {
    const href = nextHrefForStartingPoint({
      userType: "senior_secondary",
      ssClass: "ss1",
      stream: "science",
      olevelSubjects: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    } as any);

    expect(href).toContain("/admission?mode=subjects&exam_type=olevel");
    expect(href).toContain("journey_mode=guided_subject_discovery");
    expect(href).toContain("class_name=ss1");
  });

  it.each(["jamb", "ss3_secondary"] as const)(
    "%s unsure door opens the combined O-level and UTME subject matcher",
    (userType) => {
      const href = nextHrefForStartingPoint({
        userType,
        ssDoor: "unsure",
        ssClass: userType === "ss3_secondary" ? "ss3_secondary" : undefined,
        stream: "science",
        olevelSubjects: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
        jambSubjects: ["Use of English", "Biology", "Chemistry", "Physics"],
      } as any);

      expect(href).toContain("/admission?mode=subjects");
      expect(href).toContain(`user_type=${userType}`);
      expect(href).toContain("journey_mode=guided_subject_discovery");
      expect(href).toContain("olevel_subjects=English%20Language%2CMathematics%2CBiology%2CChemistry%2CPhysics");
      expect(href).toContain("subjects=Use%20of%20English%2CBiology%2CChemistry%2CPhysics");
      expect(href).not.toContain("/programme/");
    },
  );

  it.each(["jamb", "ss3_secondary"] as const)(
    "%s know-programme door opens its national programme preview without a university",
    (userType) => {
      const href = nextHrefForStartingPoint({
        userType,
        ssDoor: "know_what",
        intendedProgramme: "Sociology",
        intendedJambProgrammeId: "jamb-sociology",
      } as any);

      expect(href).toContain("/programme/jamb-sociology?");
      expect(href).toContain("journey_mode=programme_preview");
      expect(href).toContain("resume=programme_preview");
      expect(href).not.toContain("school_id=");
      expect(href).not.toContain("/admission");
    },
  );
});
