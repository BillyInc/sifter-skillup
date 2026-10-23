import type { SearchScope } from "@/types/career";

export type ExploreScope = SearchScope | "areas";

export interface ExploreQuery {
  text: string;
  scope: ExploreScope;
}

const VALID_SCOPES: readonly ExploreScope[] = [
  "all", "programmes", "universities", "domains", "areas", "subgroups", "roles", "skills", "tools", "certifications", "opportunities",
];

export function parseExploreQuery(params: Record<string, unknown> | null | undefined): ExploreQuery {
  const read = (value: unknown) => Array.isArray(value) ? value[0] : value;
  const rawScope = read(params?.scope);
  const scope = typeof rawScope === "string" && VALID_SCOPES.includes(rawScope as ExploreScope)
    ? rawScope as ExploreScope
    : "all";
  const rawText = read(params?.q);
  return { text: typeof rawText === "string" ? rawText : "", scope };
}

export function searchScopeForExplore(scope: ExploreScope): SearchScope {
  return scope === "areas" ? "subgroups" : scope;
}

export function serializeExploreQuery(query: ExploreQuery): string {
  const params = new URLSearchParams();
  const text = query.text.trim();
  if (text) params.set("q", text);
  if (query.scope !== "all") params.set("scope", query.scope);
  return params.toString();
}

export function exploreQueryHref(base: string, query: ExploreQuery): string {
  const serialized = serializeExploreQuery(query);
  return serialized ? `${base}?${serialized}` : base;
}
