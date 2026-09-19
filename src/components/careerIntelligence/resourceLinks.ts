import type { CareerContextItem, CareerLearningResource } from "@/types/career";

const RESOURCE_TYPES: Record<CareerContextItem["itemType"], CareerLearningResource["resourceType"][]> = {
  skill: ["skill_learning", "skill_reference"],
  tool: ["tool_learning"],
  competency: ["competency_reference"],
  certification: ["certification_exam", "professional_body"],
};

/** Student resources must be approved, source-backed and owned by a visible context. */
export function isStudentResource(resource: CareerLearningResource): boolean {
  return resource.reviewStatus !== "review_only"
    && resource.reviewStatus !== "unverified"
    && resource.ownershipScope !== "audit_only"
    && resource.dataState !== "unsourced"
    && resource.sourceConfidence !== "unsourced";
}

/** Resolve only an explicitly attached item resource. Descriptive resource
 * names may begin with the canonical item name; arbitrary word overlap is
 * never treated as a match. */
export function resourceForItem(
  resources: CareerLearningResource[] | undefined,
  itemType: CareerContextItem["itemType"],
  itemName: string,
): CareerLearningResource | undefined {
  const name = itemName.trim().toLowerCase();
  if (!name) return undefined;
  const allowed = RESOURCE_TYPES[itemType];
  return resources?.find((resource) => {
    if (!resource.url || !allowed.includes(resource.resourceType)) return false;
    if (!isStudentResource(resource)) return false;
    const target = resource.targetName.trim().toLowerCase();
    return target === name || target.startsWith(`${name} `) || target.startsWith(`${name}:`);
  });
}
