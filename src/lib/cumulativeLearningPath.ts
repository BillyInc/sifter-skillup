import type { CareerContextItem, FoundationSkill } from "@/types/career";
import { isApprovedStudentContextItem } from "@/lib/studentCareerBoundary";

export type CumulativePathItem = {
  itemType: CareerContextItem["itemType"];
  name: string;
};

function itemKey(name: string): string {
  return name
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function studentOwned(item: CareerContextItem): boolean {
  return item.dataState === "source_backed"
    && item.sourceConfidence !== "unsourced"
    && item.guidanceOwner === item.contextLevel
    && isApprovedStudentContextItem(item);
}

/** Domain-owned foundation comes first; contextual domain items add to it. */
export function domainStageItems(
  foundation: FoundationSkill[] = [],
  items: CareerContextItem[] = [],
): CumulativePathItem[] {
  const candidates: CumulativePathItem[] = [
    ...foundation.map((item) => ({ itemType: "skill" as const, name: item.skill })),
    ...items.filter(studentOwned).map((item) => ({ itemType: item.itemType, name: item.name })),
  ];
  return uniqueItems(candidates);
}

/**
 * Return only this level's additions. An item already introduced by a lower
 * stage is inherited, not presented again as a newly required capability.
 */
export function additiveStageItems(
  items: CareerContextItem[] = [],
  inherited: CumulativePathItem[] = [],
): CumulativePathItem[] {
  const inheritedKeys = new Set(inherited.map((item) => itemKey(item.name)).filter(Boolean));
  return uniqueItems(items
    .filter(studentOwned)
    .map((item) => ({ itemType: item.itemType, name: item.name }))
    .filter((item) => !inheritedKeys.has(itemKey(item.name))));
}

export function cumulativeItemNames(...stages: CumulativePathItem[][]): Set<string> {
  return new Set(stages.flat().map((item) => itemKey(item.name)).filter(Boolean));
}

export function formatPathItem(item: CumulativePathItem): string {
  const category = item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1);
  return `${category}: ${item.name}`;
}

function uniqueItems(items: CumulativePathItem[]): CumulativePathItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = itemKey(item.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
