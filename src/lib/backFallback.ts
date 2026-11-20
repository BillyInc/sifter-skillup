/**
 * Where "Back" goes when there is no in-app history to return to (a deep link,
 * a refreshed tab, a shared URL). In-app navigation that has history keeps
 * using the real history stack; this only picks the parent for the cold case.
 *
 * Works on a pathname with or without route groups and an admin prefix, e.g.
 * `/explore/role/D039%7Cnursing`, `/(tabs)/explore/domain/D039`,
 * `/admin/workspace-explore/programme/12`.
 */

function stripGroups(pathname: string): string {
  return pathname.split("?")[0].split("#")[0].replace(/\/\([^/)]+\)/g, "").replace(/\/+$/, "") || "/";
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Domain id embedded in a role key such as "D039|nursing" (null if absent). */
export function domainIdFromRoleKey(roleKey: string): string | null {
  const match = /^(D\d+)\|/.exec(decode(roleKey));
  return match ? match[1] : null;
}

export interface BackFallbackHints {
  /** A domain id known from the route's own params (e.g. `domain_id`). */
  domainId?: string | null;
}

export function parentRouteFor(pathname: string, hints: BackFallbackHints = {}): string {
  const path = stripGroups(pathname);
  const segments = path.split("/").filter(Boolean);

  const exploreAt = segments.findIndex((segment) => segment === "explore" || segment === "workspace-explore");
  if (exploreAt >= 0) {
    // Keep any prefix (e.g. /admin) so an admin never lands in the student tab.
    const base = `/${segments.slice(0, exploreAt + 1).join("/")}`;
    const [kind, id, sub, subId] = segments.slice(exploreAt + 1);
    const domainsHome = `${base}/domains`;

    if (kind === "domain" && id && sub === "subgroup" && subId) return `${base}/domain/${id}`;
    if (kind === "domain" && id) return domainsHome;
    if (kind === "subgroup") {
      return hints.domainId ? `${base}/domain/${encodeURIComponent(hints.domainId)}` : domainsHome;
    }
    if (kind === "role" && id) {
      const domainId = hints.domainId ?? domainIdFromRoleKey(id);
      return domainId ? `${base}/domain/${encodeURIComponent(domainId)}` : domainsHome;
    }
    if (kind === "elite" && id) return `${base}/elite`;
    if (kind === "pathways" && id) return `${base}/pathways`;
    // programme, admission, compare, domains, domain-guidance, hubs: Explore.
    return base;
  }

  const oppAt = segments.indexOf("opportunities");
  if (oppAt >= 0) return `/${segments.slice(0, oppAt + 1).join("/")}`;
  if (segments[0] === "profile" && segments.length > 1) return "/profile";
  if ((segments[0] === "myworld" && segments.length > 1) || segments[0] === "portfolio") return "/myworld";
  return "/home";
}
