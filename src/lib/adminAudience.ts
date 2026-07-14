import type { EducatorProfile, OrganizationType } from "../types/institution";

export type AdminAudience = "university" | "school";

export function adminAudienceForOrg(
  organizationType?: OrganizationType | null,
): AdminAudience {
  return organizationType === "secondary_school" ||
    organizationType === "tutorial_centre" ||
    organizationType === "jamb_cafe"
    ? "school"
    : "university";
}

export function adminAudienceForProfile(
  profile?: EducatorProfile | null,
): AdminAudience {
  return adminAudienceForOrg(profile?.organizationType);
}

export function adminHomeForProfile(profile?: EducatorProfile | null): string {
  return adminAudienceForProfile(profile) === "university"
    ? "/(admin)/dashboard"
    : "/(admin)/students";
}

export function adminAudienceLabel(audience: AdminAudience): string {
  return audience === "university" ? "University admin" : "School guidance";
}
