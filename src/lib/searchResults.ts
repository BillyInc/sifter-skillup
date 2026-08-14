/**
 * Maps the grouped career-search payload onto the shell's SearchOverlay rows,
 * and resolves a row to the route it should open.
 *
 * The app-wide search overlay in ReferenceShell rendered but could never return
 * anything: `overlayResults` was declared as `useState([])` with no setter, and
 * `searchQuery` fed only the input's own `value`. Selecting a row discarded it
 * and pushed `/explore` regardless. `GET /api/career/search` and
 * `careerData.searchCareer()` both already existed and return routable data --
 * only this mapping and the wiring were missing.
 *
 * Kept as pure functions so the mapping is testable without mounting the shell,
 * which pulls in the whole navigation and auth stack.
 */

import type {
  CareerSearchResult,
  SearchResult,
  SearchScope,
} from "../types/career";

export interface SearchGroup {
  label: string;
  items: SearchResult[];
}

/**
 * A role's `roleKey` embeds the domain it was found in ("D039|nursing
 * lecturer"), so a role that resolves to several domains yields a distinct,
 * separately routable key per domain. Emitting one row per (role, domain) pair
 * is therefore both correct and the disambiguation the endpoint is built for --
 * collapsing them would leave the row unroutable whenever a role spans more
 * than one field.
 */
function roleRows(result: CareerSearchResult): SearchResult[] {
  const rows: SearchResult[] = [];
  for (const role of result.roles ?? []) {
    const contexts = role.domains ?? [];
    if (contexts.length === 0) {
      // No domain context means no roleKey, and therefore no destination.
      // Dropping it beats rendering a row that cannot navigate.
      continue;
    }
    for (const ctx of contexts) {
      rows.push({
        id: ctx.roleKey,
        type: "role",
        title: role.name,
        subtitle: ctx.domainName,
        meta: role.tier ?? undefined,
        icon: "briefcase",
      });
    }
  }
  return rows;
}

function domainRows(result: CareerSearchResult): SearchResult[] {
  return (result.domains ?? []).map((d) => ({
    id: d.id,
    type: "domain" as const,
    title: d.name,
    subtitle: d.cluster,
    icon: "grid",
  }));
}

function programmeRows(result: CareerSearchResult): SearchResult[] {
  return (result.programmes ?? []).map((p) => ({
    id: p.id,
    type: "programme" as const,
    title: p.name,
    subtitle: p.discipline,
    meta: p.institutionType,
    icon: "book",
  }));
}

/**
 * Group the payload for display, honouring the overlay's scope control.
 * Empty groups are dropped so the overlay never renders a heading with nothing
 * under it.
 */
export function toSearchGroups(
  result: CareerSearchResult | null | undefined,
  scope: SearchScope = "all",
): SearchGroup[] {
  if (!result) return [];

  const groups: SearchGroup[] = [];
  const wants = (s: SearchScope) => scope === "all" || scope === s;

  if (wants("programmes")) {
    groups.push({ label: "Programmes", items: programmeRows(result) });
  }
  if (wants("domains")) {
    groups.push({ label: "Fields", items: domainRows(result) });
  }
  if (wants("roles")) {
    groups.push({ label: "Roles", items: roleRows(result) });
  }

  return groups.filter((g) => g.items.length > 0);
}

/**
 * Resolve a row to its destination. Returns null when the row has no route, so
 * the caller can decline to navigate rather than silently landing the user
 * somewhere unrelated -- which is what the previous hardcoded push to
 * `/explore` did for every result type.
 */
export function resolveSearchHref(item: SearchResult): string | null {
  if (!item?.id) return null;
  const id = encodeURIComponent(item.id);
  switch (item.type) {
    case "domain":
      return `/(tabs)/explore/domain/${id}`;
    case "role":
      return `/(tabs)/explore/role/${id}`;
    case "programme":
      return `/(tabs)/explore/programme/${id}`;
    case "opportunity":
      return `/(tabs)/opportunities/opportunity/${id}`;
    default:
      // university / scholarship / admin have no public detail route yet.
      return null;
  }
}

/** Total rows across groups, for empty-state decisions. */
export function countResults(groups: SearchGroup[]): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}
