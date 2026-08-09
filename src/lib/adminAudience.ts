import type { EducatorProfile, OrganizationType } from "../types/institution";

/**
 * Two audiences with genuinely different jobs:
 *
 *  - "university" — PORTFOLIO work. Which domains does our programme mix
 *    reach, where do we rank, where are the gaps. Institution-scoped, and the
 *    answer changes on the scale of a curriculum review.
 *  - "school" — ADVISORY work. Secondary schools, tutorial centres and JAMB
 *    cafés sit with a student and answer "which programme, which university,
 *    what cut-off". National-scoped, and the answer changes per conversation.
 *
 * That split is why they do not share a landing page — see adminHomeForProfile.
 */
export type AdminAudience = "university" | "school";

export function adminAudienceForOrg(
  organizationType?: OrganizationType | null,
): AdminAudience {
  // Positive test on "university", NOT a blocklist of the school types. The
  // blocklist form resolved an ABSENT organizationType to "university", which
  // handed an unverified or untyped account the university-only surfaces (peer
  // benchmarks §0.6, domain reach audit §5.1) — and disagreed with
  // adminNav.audienceFor, which defaulted the same profile to "school". The
  // sidebar and the shell could therefore describe the same account
  // differently. One definition, and the default is the lower-privilege one.
  return organizationType === "university" ? "university" : "school";
}

export function adminAudienceForProfile(
  profile?: EducatorProfile | null,
): AdminAudience {
  return adminAudienceForOrg(profile?.organizationType);
}

/**
 * The landing route, per audience.
 *
 * Universities land on the General Dashboard (§5.0): a summary of their
 * institutional position, each block handing off to the real view.
 *
 * Advisory organisations land on EXPLORE, not on a dashboard. A tutorial
 * centre has no programme mix to summarise, so a "general dashboard" for them
 * was mostly re-presenting the national catalogue that Explore already is —
 * two surfaces doing one job. Their cohort aggregates (learner counts,
 * unclaimed codes, alerts) are real but they are not a landing page; they live
 * on /(admin)/guidance, reachable from the sidebar.
 */
export function adminHomeForProfile(profile?: EducatorProfile | null): string {
  return adminAudienceForProfile(profile) === "university"
    ? "/(admin)/dashboard"
    : "/(admin)/workspace-explore";
}

export function adminAudienceLabel(audience: AdminAudience): string {
  return audience === "university" ? "University admin" : "School guidance";
}
