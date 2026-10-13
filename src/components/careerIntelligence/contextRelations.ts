import type { CareerContextItem, CareerContextItemRelationship } from "@/types/career";
import { isApprovedStudentContextItem } from "@/lib/studentCareerBoundary";

const TYPE_LABEL: Record<CareerContextItem["itemType"], string> = {
  skill: "Skill",
  tool: "Tool",
  competency: "Competency",
  certification: "Certification or qualification",
  method: "Method",
  knowledge: "Knowledge",
  resource: "Learning resource",
};

export function contextItemFor(
  items: CareerContextItem[] | undefined,
  itemType: CareerContextItem["itemType"],
  name: string,
): CareerContextItem | undefined {
  const key = name.trim().toLowerCase();
  return (items ?? []).find((item) => item.itemType === itemType && item.name.trim().toLowerCase() === key);
}

/** Client-side backstop for the API's exact-checkpoint student visibility gate.
 * A legacy skill/tool/cert row cannot become visible merely because it has a
 * plausible name, a nearby resource, or a URL of its own. */
export function isStudentApprovedContextItem(item: CareerContextItem | undefined): boolean {
  return isApprovedStudentContextItem(item);
}

export function relationNames(
  names: string[] | undefined,
  items: CareerContextItem[] | undefined,
): string[] {
  const byName = new Map((items ?? []).map((item) => [item.name.trim().toLowerCase(), item]));
  return (names ?? []).map((name) => {
    const item = byName.get(name.trim().toLowerCase());
    return item ? `${TYPE_LABEL[item.itemType]}: ${item.name}` : name;
  });
}

export function relationshipTargets(
  item: CareerContextItem | undefined,
  relationshipType: CareerContextItemRelationship["relationshipType"],
  items: CareerContextItem[] | undefined,
): string[] {
  if (!item) return [];
  const edges = (item.relationships ?? []).filter(
    (edge: CareerContextItemRelationship) => edge.relationshipStatus === "source_backed" && edge.relationshipType === relationshipType,
  );
  if (edges.length) {
    return edges.map((edge) => {
      const type = edge.toItemType ? TYPE_LABEL[edge.toItemType] : "";
      return type && edge.toName ? `${type}: ${edge.toName}` : edge.toName || edge.toItemKey || "";
    }).filter(Boolean);
  }
  if (relationshipType === "builds_on") return relationNames(item.prerequisites, items);
  if (relationshipType === "works_with" || relationshipType === "complements") return relationNames(item.relatedItems, items);
  return [];
}
