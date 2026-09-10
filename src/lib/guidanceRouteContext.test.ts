import {
  guidanceContextQuery,
  isGuidanceContextCompatible,
  guidanceRouteTelemetry,
  withGuidanceContext,
} from "./guidanceRouteContext";

describe("guidance route context telemetry", () => {
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
  });
});
