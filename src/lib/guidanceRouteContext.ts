/**
 * Context carried by every guided programme/career transition.
 *
 * Keeping this shape in one place prevents a route from silently dropping the
 * exact JAMB identity, selected university, journey, or admin target student.
 * It is deliberately URL-safe and contains no private student profile data.
 */
export type GuidanceResumeStage =
  | "setup"
  | "programme_preview"
  | "university_offerings"
  | "university_context"
  | "domains"
  | "subgroups"
  | "roles"
  | "review";

export type GuidanceTarget =
  | "self"
  | "anonymous"
  | "provider_session"
  | "authorised_student";

export type GuidanceRouteContext = {
  userType?: string;
  className?: string;
  stream?: string;
  programmeId?: string;
  jambProgrammeId?: string;
  schoolId?: string;
  journeyMode?: string;
  guidanceTarget?: GuidanceTarget | string;
  guidanceStudentId?: string;
  resumeStage?: GuidanceResumeStage | string;
  /** Route to return to when a focused guidance session is exited. */
  entryPath?: string;
  focused?: boolean;
  viewOnly?: boolean;
};

/**
 * Checks the identity-bearing parts of a route before a restored/deep-linked
 * route is allowed to reuse a checkpoint. Empty expected values mean that the
 * caller has no constraint for that field; a present value must match exactly.
 */
export function isGuidanceContextCompatible(
  actual: GuidanceRouteContext,
  expected: Partial<GuidanceRouteContext>,
): boolean {
  const fields: Array<keyof GuidanceRouteContext> = [
    "userType",
    "className",
    "stream",
    "programmeId",
    "jambProgrammeId",
    "schoolId",
    "journeyMode",
    "guidanceTarget",
    "guidanceStudentId",
  ];
  return fields.every((field) => {
    const expectedValue = expected[field];
    if (expectedValue === undefined || expectedValue === "") return true;
    return actual[field] === expectedValue;
  });
}

export type GuidanceRouteTelemetry = {
  route: string;
  stage?: GuidanceResumeStage | string;
  userType?: string;
  journeyMode?: string;
  guidanceTarget?: GuidanceTarget | string;
  focused: boolean;
  viewOnly: boolean;
  hasProgramme: boolean;
  hasJambProgramme: boolean;
  hasUniversity: boolean;
  hasTargetStudent: boolean;
};

/**
 * Reduce route context to non-personal diagnostics. Student IDs and programme
 * or university IDs are intentionally omitted from telemetry.
 */
export function guidanceRouteTelemetry(
  route: string,
  context: GuidanceRouteContext = {},
  stage?: GuidanceResumeStage | string,
): GuidanceRouteTelemetry {
  return {
    route,
    stage: stage ?? context.resumeStage,
    userType: context.userType,
    journeyMode: context.journeyMode,
    guidanceTarget: context.guidanceTarget,
    focused: Boolean(context.focused),
    viewOnly: Boolean(context.viewOnly),
    hasProgramme: Boolean(context.programmeId),
    hasJambProgramme: Boolean(context.jambProgrammeId),
    hasUniversity: Boolean(context.schoolId),
    hasTargetStudent: Boolean(context.guidanceStudentId),
  };
}

/** Development-only route diagnostics; never logs IDs or student data. */
export function logGuidanceRoute(
  route: string,
  context: GuidanceRouteContext = {},
  stage?: GuidanceResumeStage | string,
): void {
  const runtime = globalThis as typeof globalThis & { __DEV__?: boolean };
  if (runtime.__DEV__ !== true || typeof console === "undefined") return;
  console.debug("[guidance-route]", guidanceRouteTelemetry(route, context, stage));
}

export function guidanceContextQuery(
  context: GuidanceRouteContext = {},
  options: { includeProgrammeId?: boolean } = {},
): string {
  const pairs: string[] = [];
  const add = (key: string, value?: string) => {
    if (value?.trim()) pairs.push(`${key}=${encodeURIComponent(value.trim())}`);
  };

  if (options.includeProgrammeId) add("programme_id", context.programmeId);
  add("jamb_programme_id", context.jambProgrammeId);
  add("school_id", context.schoolId);
  add("user_type", context.userType);
  add("class_name", context.className);
  add("stream", context.stream);
  add("journey_mode", context.journeyMode);
  add("guidance_target", context.guidanceTarget);
  add("guidance_student_id", context.guidanceStudentId);
  add("resume", context.resumeStage);
  add("guidance_entry", context.entryPath);
  if (context.focused) pairs.push("focus=guidance");
  if (context.viewOnly) pairs.push("view_only=1");
  return pairs.join("&");
}

export function withGuidanceContext(path: string, context?: GuidanceRouteContext): string {
  const query = guidanceContextQuery(context);
  if (!query) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}
