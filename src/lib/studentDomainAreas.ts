import type { DomainV2, SubgroupV2 } from "@/types/career";

/** Areas allowed in the student experience. D078 legacy subgroup rows must not
 * leak into any selector, advisory list or downstream route. */
export function studentDomainAreas(domain: Pick<DomainV2, "id" | "subgroups">): SubgroupV2[] {
  const areas = domain.subgroups ?? [];
  return domain.id === "D078"
    ? areas.filter((area) => area.isCurrentAreaOfSpecialization === true)
    : areas;
}

/** Drop stale saved D078 role selections that point outside its current seven
 * areas before showing or completing a learner route. Unknown domains are
 * retained until their domain record is available. */
export function currentAreaRoleSelections<T extends { domainId?: unknown; subgroupId?: unknown }>(
  selections: T[],
  domains: DomainV2[],
): T[] {
  return selections.filter((selection) => {
    const domainId = String(selection.domainId ?? "");
    const domain = domains.find((candidate) => candidate.id === domainId);
    if (!domain || domain.id !== "D078") return true;
    const areaId = String(selection.subgroupId ?? "");
    return Boolean(areaId && studentDomainAreas(domain).some((area) => area.id === areaId));
  });
}
