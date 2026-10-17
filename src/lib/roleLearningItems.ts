import { isApprovedStudentContextItem } from "@/lib/studentCareerBoundary";
import type { CareerContextItem } from "@/types/career";

/**
 * Keep the role page bound to reviewed, role-owned learning contracts. Legacy
 * role skill/tool arrays can help staff reconcile records, but are not a
 * substitute for the learner-facing explanation and verified resource.
 */
export function studentRoleLearningItems(items?: CareerContextItem[] | null): CareerContextItem[] {
  const seen = new Set<string>();
  return (items ?? []).filter((item) => {
    if (
      item.contextLevel !== "role"
      || item.guidanceOwner !== "role"
      || item.dataState !== "source_backed"
      || item.sourceConfidence === "unsourced"
      || !isApprovedStudentContextItem(item)
    ) return false;
    const key = `${item.itemType}:${item.itemKey.trim().toLocaleLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Optional role guidance is determined by the reviewed requirement level,
 * never by whether a task-group key happens to be present. */
export function studentOptionalRoleLearningItems(items?: CareerContextItem[] | null): CareerContextItem[] {
  return studentRoleLearningItems(items).filter((item) => item.requirementLevel !== "needed");
}
