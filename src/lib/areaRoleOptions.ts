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

/**
 * Pathways hub role options. D078 has no direct domain-to-role routes, so its
 * roles must remain absent until a canonical area is explicitly selected.
 * Other domains preserve their existing direct/domain and subgroup behavior.
 */
export function rolesForPathwaySelection(
  domain: Pick<DomainV2, "id" | "subgroups" | "roles"> | undefined,
  selectedSubgroupId: string | null,
): DomainRoleSummary[] {
  if (!domain) return [];
  if (domain.id === "D078") {
    if (!selectedSubgroupId) return [];
    const selectedArea = domain.subgroups.find((area) => area.id === selectedSubgroupId);
    return rolesForArea("D078", selectedArea, domain.roles);
  }
  return [...domain.roles]
    .filter((role) => role.guidanceAvailable !== false
      && (!selectedSubgroupId || role.subgroupId === selectedSubgroupId))
    .sort(compareCareerRoles);
}
