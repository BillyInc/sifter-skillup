import { compareCareerRoles } from "@/lib/careerRoleOrdering";
import type { DomainRoleSummary, DomainV2 } from "@/types/career";

export type AreaRoleOption = DomainRoleSummary & {
  areaRouteStatus?: "reviewed_supported" | "reviewed_conditional";
  areaRouteReason?: string | null;
  areaRouteCondition?: string | null;
  areaTaskEvidence?: string | null;
  areaRouteSources?: Array<{ url: string }>;
};

/**
 * Return roles that the current response explicitly connects to an area.
 * D078 must use its reviewed canonical-area route records; broad legacy areaIds
 * are not a safe substitute. Other domains retain their explicit subgroupId
 * ownership rule.
 */
export function rolesForArea(
  domainId: string,
  area: DomainV2["subgroups"][number] | undefined,
  domainRoles: DomainRoleSummary[],
): AreaRoleOption[] {
  const candidates: AreaRoleOption[] = domainId === "D078"
    ? area?.areaRoleOptions ?? []
    : domainRoles.filter((role) => role.subgroupId === area?.id && role.guidanceAvailable === true);
  return [...candidates].sort(compareCareerRoles);
}
