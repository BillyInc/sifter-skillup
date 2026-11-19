import type { OrganizationType } from "../types/institution";

export type AdminLearnerType = "ss1" | "ss2" | "ss3" | "jamb" | "undergraduate";
export type AdminLearnerStream = "science" | "commercial" | "art" | "technical";

export interface AdminLearnerAudience {
  learnerTypes: AdminLearnerType[];
  streams: AdminLearnerStream[];
  streamRequired: boolean;
  label: string;
  description: string;
}

const SECONDARY: AdminLearnerAudience = {
  learnerTypes: ["ss1", "ss2", "ss3"],
  streams: ["science", "commercial", "art", "technical"],
  streamRequired: true,
  label: "Secondary students",
  description: "Choose SS1, SS2 or SS3, then the student's stream.",
};

const PROVIDER: AdminLearnerAudience = {
  // Tutorial centres prepare learners for both O-level and UTME, so both
  // starting points are offered. "ss3" is the existing O-level starting point.
  learnerTypes: ["ss3", "jamb"],
  streams: [],
  streamRequired: true,
  label: "O-level and UTME students",
  description: "Choose O-level or UTME. Tutorial-centre guidance does not use a secondary-school stream.",
};

const UNIVERSITY: AdminLearnerAudience = {
  learnerTypes: ["undergraduate"],
  streams: [],
  streamRequired: false,
  label: "Undergraduate students",
  description: "University guidance is for undergraduates and has no stream.",
};

/** The single student-context contract shared by admin guidance surfaces. */
export function adminLearnerAudienceForOrg(
  organizationType?: OrganizationType | string | null,
): AdminLearnerAudience | null {
  switch (organizationType) {
    case "tutorial_centre":
    case "jamb_cafe":
      return PROVIDER;
    case "secondary_school":
      return SECONDARY;
    case "university":
      return UNIVERSITY;
    default:
      return null;
  }
}

export function isAdminLearnerTypeAllowed(
  organizationType: OrganizationType | string | null | undefined,
  learnerType: string | null | undefined,
): boolean {
  return Boolean(
    learnerType &&
      adminLearnerAudienceForOrg(organizationType)?.learnerTypes.includes(
        learnerType as AdminLearnerType,
      ),
  );
}


/**
 * Display label for a learner stage in an organisation's own vocabulary.
 * Tutorial centres and JAMB cafes call the existing "ss3" starting point
 * "O-level" and the "jamb" starting point "UTME"; the stored values do not
 * change.
 */
export function learnerStageLabel(
  value: string,
  organizationType?: OrganizationType | string | null,
): string {
  if (value === "undergraduate") return "Undergraduate";
  if (organizationType === "tutorial_centre" || organizationType === "jamb_cafe") {
    if (value === "ss3") return "O-level";
    if (value === "jamb") return "UTME (JAMB)";
  }
  return value.toUpperCase();
}
