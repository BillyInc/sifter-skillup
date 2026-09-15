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
  SearchIntent,
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
        actionLabel: "Open role guidance",
        contextHint: "See the work, preparation, and next steps in this domain.",
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
    actionLabel: "Open domain guidance",
    contextHint: "Understand the field before choosing a specialisation.",
    icon: "grid",
  }));
}

function subgroupRows(result: CareerSearchResult): SearchResult[] {
  return (result.subgroups ?? []).map((item) => ({
    id: item.id,
    type: "subgroup" as const,
    title: item.name,
    subtitle: item.domainName ? `In ${item.domainName}` : undefined,
    actionLabel: "Open subgroup guidance",
    contextHint: "See what this specialisation adds to the domain foundation.",
    href: item.domainId
      ? `/(tabs)/explore/domain/${encodeURIComponent(item.domainId)}/subgroup/${encodeURIComponent(item.id)}`
      : undefined,
    icon: "layers",
  }));
}

function universityRows(result: CareerSearchResult): SearchResult[] {
  return (result.universities ?? []).map((item) => ({
    id: item.id,
    type: "university" as const,
    title: item.name,
    subtitle: [item.city, item.state].filter(Boolean).join(", ") || "University",
    meta: result.userType === "student" ? "Explore programmes" : "View programmes and requirements",
    actionLabel: result.userType === "student" ? "Explore university programmes" : "Check university requirements",
    contextHint: result.userType === "student"
      ? "Open a programme to follow its domains, subgroups, roles, and next skills."
      : "Review this university's programmes and admission requirements.",
    href: result.userType === "student"
      ? `/(tabs)/explore/admission?mode=school&school_id=${encodeURIComponent(item.id)}&user_type=student&journey=undergraduate_programmes`
      : `/(tabs)/explore/admission?mode=school&school_id=${encodeURIComponent(item.id)}`,
    icon: "building",
  }));
}

function skillRows(result: CareerSearchResult): SearchResult[] {
  return (result.skills ?? []).map((item) => ({
    id: item.id,
    type: "skill" as const,
    title: item.name,
    subtitle: item.domainName ? `Used in ${item.domainName}` : "Career skill",
    meta: item.context,
    actionLabel: "See this skill in context",
    contextHint: "See what this skill is used for and where to learn it next.",
    href: item.domainId ? `/(tabs)/explore/domain/${encodeURIComponent(item.domainId)}` : undefined,
    icon: "zap",
  }));
}

function toolRows(result: CareerSearchResult): SearchResult[] {
  return (result.tools ?? []).map((item) => ({
    id: item.id,
    type: "tool" as const,
    title: item.name,
    subtitle: item.domainName ? `Used in ${item.domainName}` : "Career tool",
    meta: item.group,
    actionLabel: "See this tool in context",
    contextHint: "See what this tool is used to produce in the domain.",
    href: item.domainId ? `/(tabs)/explore/domain/${encodeURIComponent(item.domainId)}` : undefined,
    icon: "tool",
  }));
}

function certificationRows(result: CareerSearchResult): SearchResult[] {
  return (result.certifications ?? []).map((item) => ({
    id: item.id,
    type: "certification" as const,
    title: item.name,
    subtitle: item.domainName ? `Relevant to ${item.domainName}` : "Career credential",
    meta: [item.region, item.level].filter(Boolean).join(" · ") || undefined,
    href: item.domainId ? `/(tabs)/explore/domain/${encodeURIComponent(item.domainId)}` : undefined,
    actionLabel: "See credential context",
    contextHint: "Check why this credential matters and where it fits.",
    icon: "award",
  }));
}

function opportunityRows(result: CareerSearchResult): SearchResult[] {
  return (result.opportunities ?? []).map((item) => ({
    id: item.id,
    type: "opportunity" as const,
    title: item.title,
    subtitle: [item.type, item.scope].filter(Boolean).join(" · ") || "Opportunity",
    meta: item.region ?? undefined,
    actionLabel: "View opportunity",
    contextHint: "Review the opportunity details and eligibility.",
    href: `/(tabs)/opportunities/opportunity/${encodeURIComponent(item.id)}`,
    icon: "star",
  }));
}

function programmeRows(result: CareerSearchResult): SearchResult[] {
  return (result.programmes ?? []).map((p) => ({
    id: p.id,
    type: "programme" as const,
    title: p.name,
    subtitle: p.discipline,
    meta: p.institutionType,
    actionLabel: result.userType === "student" ? "Open programme-to-career guidance" : "Open programme preview",
    contextHint: result.userType === "student"
      ? "Follow what your programme teaches into domains, subgroups, roles, and what to learn next."
      : "Start with the programme preview, then choose a university.",
    href: result.userType === "student"
      ? `/(tabs)/explore/programme/${encodeURIComponent(p.id)}?user_type=student&journey_mode=undergraduate_career${result.schoolId ? `&school_id=${encodeURIComponent(result.schoolId)}` : ""}`
      : undefined,
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
  intent?: SearchIntent | null,
): SearchGroup[] {
  if (!result) return [];

  const groups: SearchGroup[] = [];
  const intentScopes: Record<SearchIntent, SearchScope[]> = {
    programme_guidance: ["programmes"],
    university_requirements: ["universities"],
    career_exploration: ["domains", "subgroups", "roles"],
    skills_and_tools: ["skills", "tools", "certifications"],
    opportunities: ["opportunities"],
  };
  const wants = (s: SearchScope) =>
    (scope === "all" || scope === s) && (!intent || intentScopes[intent].includes(s));

  if (wants("programmes")) {
    groups.push({ label: "Programmes", items: programmeRows(result) });
  }
  if (wants("universities")) {
    groups.push({ label: "Universities", items: universityRows(result) });
  }
  if (wants("domains")) {
    groups.push({ label: "Domains", items: domainRows(result) });
  }
  if (wants("subgroups")) {
    groups.push({ label: "Subgroups", items: subgroupRows(result) });
  }
  if (wants("roles")) {
    groups.push({ label: "Roles", items: roleRows(result) });
  }
  if (wants("skills")) {
    groups.push({ label: "Skills", items: skillRows(result) });
  }
  if (wants("tools")) {
    groups.push({ label: "Tools", items: toolRows(result) });
  }
  if (wants("certifications")) {
    groups.push({ label: "Credentials", items: certificationRows(result) });
  }
  if (wants("opportunities")) {
    groups.push({ label: "Opportunities", items: opportunityRows(result) });
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
  if (item.href) return item.href;
  const id = encodeURIComponent(item.id);
  switch (item.type) {
    case "domain":
      return `/(tabs)/explore/domain/${id}`;
    case "subgroup":
      return `/(tabs)/explore/subgroup/${id}`;
    case "role":
      return `/(tabs)/explore/role/${id}`;
    case "programme":
      return `/(tabs)/explore/programme/${id}`;
    case "opportunity":
      return `/(tabs)/opportunities/opportunity/${id}`;
    default:
      return null;
  }
}

/** Total rows across groups, for empty-state decisions. */
export function countResults(groups: SearchGroup[]): number {
  return groups.reduce((n, g) => n + g.items.length, 0);
}
