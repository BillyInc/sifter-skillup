import {
  resolveHomeStage,
  homeRoutesFor,
  subjectReason,
  undergraduateProgramme,
  undergraduateJambProgrammeId,
  groupProgrammeConnections,
} from "../src/lib/homeStage";
import type { StartingPointProfile } from "../src/types/onboarding";

const p = (v: Partial<StartingPointProfile>): StartingPointProfile =>
  ({ userType: "student", ...v }) as StartingPointProfile;

describe("resolveHomeStage", () => {
  it("maps each student stage to its key and label", () => {
    expect(resolveHomeStage(p({ userType: "senior_secondary", ssClass: "ss1" }))).toEqual({ key: "early_secondary", label: "SS1" });
    expect(resolveHomeStage(p({ userType: "senior_secondary", ssClass: "ss2" }))).toEqual({ key: "early_secondary", label: "SS2" });
    expect(resolveHomeStage(p({ userType: "senior_secondary", ssClass: "ss3" }))).toEqual({ key: "admission", label: "SS3" });
    expect(resolveHomeStage(p({ userType: "ss3_secondary" }))).toEqual({ key: "admission", label: "SS3" });
    expect(resolveHomeStage(p({ userType: "jamb" }))).toEqual({ key: "admission", label: "UTME applicant" });
    expect(resolveHomeStage(p({ userType: "student" }))).toEqual({ key: "undergraduate", label: "Undergraduate" });
  });

  it("returns null so Home keeps today's behaviour", () => {
    expect(resolveHomeStage(null)).toBeNull();
    expect(resolveHomeStage(undefined)).toBeNull();
    expect(resolveHomeStage(p({ userType: "senior_secondary" }))).toBeNull();
    expect(resolveHomeStage(p({ userType: "graduate" }))).toBeNull();
    expect(resolveHomeStage(p({ userType: "professional" }))).toBeNull();
    expect(resolveHomeStage(p({ userType: "skilled_worker" }))).toBeNull();
  });
});

describe("homeRoutesFor", () => {
  it("gives SS1/SS2 two routes", () => {
    const routes = homeRoutesFor("early_secondary", p({ userType: "senior_secondary", ssClass: "ss1", stream: "science" }));
    expect(routes.map((r) => r.key)).toEqual(["subjects", "programme_in_mind"]);
    expect(routes[0]).toMatchObject({ mode: "subjects", options: { entry: "subject_match", examType: "olevel", className: "ss1", stream: "science" } });
    expect(routes[1]).toMatchObject({ mode: "programme", options: { entry: "programme_search" } });
  });

  it("gives SS3/UTME three parallel routes on the existing Explore flows", () => {
    const routes = homeRoutesFor("admission", p({ userType: "jamb" }));
    expect(routes.map((r) => r.options.entry)).toEqual(["programme_and_university", "programme_search", "subject_match"]);
    expect(routes[2].options.examType).toBe("combined");
    const ss3 = homeRoutesFor("admission", p({ userType: "senior_secondary", ssClass: "ss3" }));
    expect(ss3[2].options.examType).toBe("olevel");
  });

  it("has no route cards for the undergraduate stage", () => {
    expect(homeRoutesFor("undergraduate", p({}))).toEqual([]);
  });
});

describe("subjectReason", () => {
  it("is null when no subjects were selected", () => {
    expect(subjectReason(p({}))).toBeNull();
    expect(subjectReason(p({ olevelSubjects: [] }))).toBeNull();
    expect(subjectReason(null)).toBeNull();
  });
  it("names the student's own subjects", () => {
    expect(subjectReason(p({ olevelSubjects: ["Biology", "Chemistry"] }))).toBe("Because you selected Biology and Chemistry");
    expect(subjectReason(p({ olevelSubjects: ["A", "B", "C", "D", "E"] }))).toBe("Because you selected A, B, C and 2 more");
    expect(subjectReason(p({ jambSubjects: ["Physics"] }))).toBe("Because you selected Physics for UTME");
    expect(subjectReason(p({ olevelSubjects: ["A"], jambSubjects: ["B", "C"] }))).toBe("Because you selected 1 O-level and 2 UTME subjects");
  });
});

describe("undergraduateProgramme", () => {
  it("returns university and programme only, never faculty or year", () => {
    const out = undergraduateProgramme(p({ schoolName: " UNILAG ", programmeName: "Sociology", discipline: "Social Sciences", yearOfStudy: "3" }));
    expect(out).toEqual({ university: "UNILAG", programme: "Sociology" });
  });
  it("is empty when nothing is saved", () => {
    expect(undergraduateProgramme(p({}))).toEqual({ university: null, programme: null });
  });
});

describe("groupProgrammeConnections", () => {
  const link = (domainId: string, domainName: string, matchType: string) => ({ domainId, domainName, matchType });

  it("groups the stored match types in Direct, Functional, Adjacent order", () => {
    const out = groupProgrammeConnections([
      link("d3", "Public Policy", "adjacent"),
      link("d1", "Research", "direct"),
      link("d2", "Data", "functional"),
      link("d4", "Education", "direct"),
    ]);
    expect(out.map((g) => g.key)).toEqual(["direct", "functional", "adjacent"]);
    expect(out[0].domains.map((d) => d.domainName)).toEqual(["Research", "Education"]);
    expect(out[1].domains.map((d) => d.domainName)).toEqual(["Data"]);
    expect(out[2].domains.map((d) => d.domainName)).toEqual(["Public Policy"]);
    out.forEach((g) => expect(g.hint.length).toBeGreaterThan(20));
  });

  it("drops empty tiers instead of inventing entries", () => {
    const out = groupProgrammeConnections([link("d1", "Research", "direct")]);
    expect(out.map((g) => g.key)).toEqual(["direct"]);
  });

  it("ignores links with an unknown match type, a missing id or a missing name", () => {
    const out = groupProgrammeConnections([
      link("d1", "Research", "elite"),
      link("", "No id", "direct"),
      { domainId: "d2", domainName: "  ", matchType: "direct" },
      { domainId: "d3", domainName: "Kept" },
    ]);
    expect(out).toEqual([]);
  });

  it("shows a domain once, under its strongest tier", () => {
    const out = groupProgrammeConnections([
      link("d1", "Research", "adjacent"),
      link("d1", "Research", "direct"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].key).toBe("direct");
  });

  it("returns nothing when there are no links", () => {
    expect(groupProgrammeConnections(null)).toEqual([]);
    expect(groupProgrammeConnections(undefined)).toEqual([]);
    expect(groupProgrammeConnections([])).toEqual([]);
  });
});

describe("undergraduateJambProgrammeId", () => {
  it("uses only an explicit JAMB programme id", () => {
    expect(undergraduateJambProgrammeId(p({ intendedJambProgrammeId: " J1 " }))).toBe("J1");
    expect(undergraduateJambProgrammeId(p({}), "J2")).toBe("J2");
    expect(undergraduateJambProgrammeId(p({ intendedJambProgrammeId: "J1" }), "J2")).toBe("J1");
  });
  it("never substitutes another programme id", () => {
    expect(undergraduateJambProgrammeId(p({ intendedProgrammeId: "ccmas-1" }))).toBeNull();
    expect(undergraduateJambProgrammeId(null)).toBeNull();
    expect(undergraduateJambProgrammeId(p({}), "  ")).toBeNull();
  });
});
