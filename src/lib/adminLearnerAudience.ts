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
  learnerTypes: ["jamb"],
  streams: [],
  streamRequired: true,
  label: "JAMB students",
  description: "JAMB guidance does not use a secondary-school stream.",
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

