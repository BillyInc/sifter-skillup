import { rolesForArea, type AreaRoleOption } from "@/lib/areaRoleOptions";
import { studentDomainAreas } from "@/lib/studentDomainAreas";
import type { DomainV2 } from "@/types/career";

export type { AreaRoleOption };

/** Student-facing area filter, isolated from screen/UI module imports. */
export function visibleDomainAreas(domain: Pick<DomainV2, "id" | "subgroups">) {
  return studentDomainAreas(domain);
}

/** Roles explicitly routed through an area; keeps screen tests free of app barrels. */
export function areaRoleOptions(
  domainId: string,
  subgroup: NonNullable<DomainV2["subgroups"]>[number] | undefined,
  domainRoles: DomainV2["roles"],
): AreaRoleOption[] {
  return rolesForArea(domainId, subgroup, domainRoles);
}
