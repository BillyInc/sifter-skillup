import type { SavedEntityType, SearchResultType } from "@/types/career";

/**
 * Search result types that map onto an entity the existing saved_items API
 * already stores (the same entity types and ids the detail screens save with).
 * Skills, tools, credentials, universities and scholarships have no saved
 * entity type, so they get no quick-save control.
 */
const SAVEABLE: Partial<Record<SearchResultType, SavedEntityType>> = {
  programme: "programme",
  domain: "domain",
  subgroup: "subgroup",
  role: "role",
  opportunity: "opportunity",
};

export function savedEntityTypeForResult(type: SearchResultType): SavedEntityType | null {
  return SAVEABLE[type] ?? null;
}
