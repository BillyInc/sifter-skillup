import {
  filterUniversityOfferingsBySubjectMatch,
  guidanceContextQuery,
  isGuidanceContextCompatible,
  guidanceRouteTelemetry,
  withGuidanceContext,
} from "./guidanceRouteContext";

describe("guidance route context telemetry", () => {
  it("keeps the university list scoped to offerings returned by the subject match", () => {
    const offerings = [{ schoolId: "uni-a" }, { schoolId: "uni-b" }, { schoolId: "uni-c" }];
    expect(filterUniversityOfferingsBySubjectMatch(offerings, true, ["uni-b"])).toEqual([{ schoolId: "uni-b" }]);
    expect(filterUniversityOfferingsBySubjectMatch(offerings, true, [])).toEqual([]);
    expect(filterUniversityOfferingsBySubjectMatch(offerings, false, ["uni-b"])).toBe(offerings);
  });

  it("keeps route diagnostics free of student and catalogue IDs", () => {
    const event = guidanceRouteTelemetry(
      "/(admin)/workspace-explore/programme",
      {
        userType: "ss3_secondary",
        journeyMode: "programme_to_role",
        guidanceTarget: "authorised_student",
        programmeId: "programme-secret",
        jambProgrammeId: "jamb-secret",
        schoolId: "school-secret",
        guidanceStudentId: "student-secret",
        focused: true,
      },
      "programme_preview",
    );

    expect(event).toEqual({
      route: "/(admin)/workspace-explore/programme",
      stage: "programme_preview",
      userType: "ss3_secondary",
      journeyMode: "programme_to_role",
      guidanceTarget: "authorised_student",
      focused: true,
      viewOnly: false,
      hasProgramme: true,
      hasJambProgramme: true,
      hasUniversity: true,
      hasTargetStudent: true,
    });
    expect(JSON.stringify(event)).not.toContain("secret");
  });

  it("keeps self, provider, and authorised-student routes isolated", () => {
    const self = guidanceContextQuery({
      userType: "senior_secondary",
      guidanceTarget: "self",
      focused: true,
    });
    const provider = guidanceContextQuery({
      userType: "jamb",
      guidanceTarget: "provider_session",
      focused: true,
    });
    const student = guidanceContextQuery({
      userType: "ss3_secondary",
      guidanceTarget: "authorised_student",
      guidanceStudentId: "student-secret",
      focused: true,
    });

    expect(self).toContain("guidance_target=self");
    expect(self).not.toContain("guidance_student_id");
    expect(provider).toContain("guidance_target=provider_session");
    expect(provider).not.toContain("guidance_target=self");
    expect(student).toContain("guidance_target=authorised_student");
    expect(student).toContain("guidance_student_id=student-secret");
    expect(self).not.toContain("student-secret");
  });

  it("preserves the route target when appending context to an existing path", () => {
    expect(
      withGuidanceContext("/(admin)/workspace-explore/admission?mode=subjects", {
        userType: "ss1",
        guidanceTarget: "self",
        journeyMode: "full",
        focused: true,
      }),
    ).toBe(
      "/(admin)/workspace-explore/admission?mode=subjects&user_type=ss1&journey_mode=full&guidance_target=self&focus=guidance",
    );
  });

  it("serializes the full programme, domain, area and role route", () => {
    expect(guidanceContextQuery({
      programmeId: "sociology",
      domainId: "D078",
      areaId: "A01",
      roleId: "D078|sociologist",
      focused: true,
      openTray: true,
    }, { includeProgrammeId: true })).toBe(
      "programme_id=sociology&domain_id=D078&area_id=A01&role_id=D078%7Csociologist&focus=guidance&open_tray=1",
    );
  });

  it("carries the selected subjects and verified university match scope into the programme route", () => {
    expect(guidanceContextQuery({
      subjectMatchOlevel: ["English Language", "Mathematics", "Biology"],
      subjectMatchUtme: ["English Language", "Biology", "Chemistry", "Physics"],
      subjectMatchSchoolIds: ["uni-a", "uni-b"],
      subjectMatchScopeApplied: true,
      subjectMatchBasis: "national_and_university_specific",
    })).toBe(
      "olevel_subjects=English%20Language%2CMathematics%2CBiology&subjects=English%20Language%2CBiology%2CChemistry%2CPhysics&university_match_ids=uni-a%2Cuni-b&university_match_filter=1&subject_match_basis=national_and_university_specific",
    );
  });

  it("rejects a stale route when its account target or student changes", () => {
    const current = {
      userType: "ss3_secondary",
      guidanceTarget: "authorised_student",
      guidanceStudentId: "student-current",
    } as const;

    expect(isGuidanceContextCompatible(current, {
      guidanceTarget: "authorised_student",
      guidanceStudentId: "student-current",
    })).toBe(true);
    expect(isGuidanceContextCompatible(current, {
      guidanceTarget: "self",
    })).toBe(false);
    expect(isGuidanceContextCompatible(current, {
      guidanceStudentId: "student-previous",
    })).toBe(false);
    expect(isGuidanceContextCompatible(current, {
      userType: "jamb",
    })).toBe(false);
    expect(isGuidanceContextCompatible({ domainId: "D078", roleId: "role-a" }, {
      domainId: "D078",
      roleId: "role-a",
    })).toBe(true);
    expect(isGuidanceContextCompatible({ domainId: "D078", roleId: "role-a" }, {
      roleId: "role-b",
    })).toBe(false);
  });
});
