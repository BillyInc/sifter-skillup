import { makeExploreNav } from "./exploreNav";

describe("guided programme navigation", () => {
  function router() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
  }

  it("keeps preview, university selection and university context in history", () => {
    const nav = makeExploreNav("/(tabs)/explore");
    const first = router();
    const context = {
      programmeId: "sociology-id",
      jambProgrammeId: "sociology-jamb-id",
      userType: "senior_secondary",
      journeyMode: "programme_to_role",
      focused: true,
      preserveHistory: true,
    } as const;

    nav.programme(first, "sociology-id", { ...context, resumeStage: "university_offerings" });
    expect(first.push).toHaveBeenCalledWith(expect.stringContaining("resume=university_offerings"));
    expect(first.replace).not.toHaveBeenCalled();

    const second = router();
    nav.programme(second, "sociology-id", { ...context, schoolId: "university-id", resumeStage: "university_context" });
    expect(second.push).toHaveBeenCalledWith(expect.stringContaining("school_id=university-id"));
    expect(second.push).toHaveBeenCalledWith(expect.stringContaining("resume=university_context"));
    expect(second.replace).not.toHaveBeenCalled();
  });

  it("carries the selected programme into downstream domain and subgroup routes", () => {
    const nav = makeExploreNav("/(tabs)/explore");
    const target = router();
    const context = {
      programmeId: "sociology-id",
      jambProgrammeId: "sociology-jamb-id",
      schoolId: "university-id",
      userType: "senior_secondary",
      focused: true,
      resumeStage: "university_context",
    } as const;

    nav.domain(target, "D078", context);
    nav.subgroup(target, "D078", "D078|sg:21", context);

    expect(target.push).toHaveBeenNthCalledWith(1, expect.stringContaining("programme_id=sociology-id"));
    expect(target.push).toHaveBeenNthCalledWith(1, expect.stringContaining("school_id=university-id"));
    expect(target.push).toHaveBeenNthCalledWith(2, expect.stringContaining("programme_id=sociology-id"));
    expect(target.push).toHaveBeenNthCalledWith(2, expect.stringContaining("jamb_programme_id=sociology-jamb-id"));
  });

  it("keeps the Explore doors context-specific", () => {
    const nav = makeExploreNav("/(tabs)/explore");
    const knownWhere = router();
    nav.admissionHub(knownWhere, "programme", null, { entry: "programme_and_university" });
    expect(knownWhere.push).toHaveBeenCalledWith(expect.stringContaining("entry=programme_and_university"));

    const programme = router();
    nav.admissionHub(programme, "programme", null, {
      entry: "programme_search",
      userType: "senior_secondary",
      className: "ss1",
      stream: "science",
    });
    expect(programme.push).toHaveBeenCalledWith(
      expect.stringContaining("entry=programme_search&user_type=senior_secondary&class_name=ss1&stream=science"),
    );

    const subjects = router();
    nav.admissionHub(subjects, "subjects", null, {
      entry: "subject_match",
      userType: "jamb",
      examType: "combined",
    });
    expect(subjects.push).toHaveBeenCalledWith(
      expect.stringContaining("mode=subjects&entry=subject_match&user_type=jamb&exam_type=combined"),
    );

    const studying = router();
    nav.admissionHub(studying, "school", null, {
      userType: "student",
      journey: "undergraduate_programmes",
    });
    expect(studying.push).toHaveBeenCalledWith(
      "/(tabs)/explore/admission?mode=school&user_type=student&journey=undergraduate_programmes",
    );
  });
});
