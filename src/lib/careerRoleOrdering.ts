/**
 * Shared role ordering for guidance and detail lists.
 *
 * Entry roles are intentionally surfaced first so a learner can see a
 * realistic starting point before roles that normally require experience.
 * Unknown tiers remain at the end and are never silently treated as entry.
 */
export type CareerRoleTier = "entry" | "mid" | "senior";

export interface CareerRoleListItem {
  name: string;
  tier?: CareerRoleTier;
}

export const CAREER_ROLE_TIER_ORDER: Record<CareerRoleTier, number> = {
  entry: 0,
  mid: 1,
  senior: 2,
};

export function careerRoleTierOrder(tier?: CareerRoleTier): number {
  return tier ? CAREER_ROLE_TIER_ORDER[tier] : 3;
}

export function compareCareerRoles(a: CareerRoleListItem, b: CareerRoleListItem): number {
  const byTier = careerRoleTierOrder(a.tier) - careerRoleTierOrder(b.tier);
  if (byTier !== 0) return byTier;
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

export function careerRoleTierLabel(tier?: CareerRoleTier): string {
  if (tier === "entry") return "Starting roles";
  if (tier === "mid") return "Roles usually reached after experience";
  if (tier === "senior") return "Advanced and leadership roles";
  return "Seniority not yet verified";
}
