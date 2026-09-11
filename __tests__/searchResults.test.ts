/**
 * The app-wide search overlay rendered but could never return a result.
 *
 * ReferenceShell declared its state without setters:
 *
 *     const [overlayResults] = useState([]);   // no setter -> permanently []
 *     const [overlayLoading] = useState(false);
 *
 * `searchQuery` fed only the input's own `value`, and selecting a row discarded
 * it and pushed `/explore` regardless of type. `GET /api/career/search` and
 * `careerData.searchCareer()` both already existed and return routable data, so
 * the gap was purely this mapping plus the wiring.
 *
 * These cover the mapping and routing as pure functions; mounting the shell
 * would drag in navigation, auth and the offline stack for no extra coverage.
 */

import {
  toSearchGroups,
  resolveSearchHref,
  countResults,
} from "../src/lib/searchResults";
import type { CareerSearchResult, SearchResult } from "../src/types/career";

const PAYLOAD: CareerSearchResult = {
  domains: [{ id: "D024", name: "Nursing", cluster: "Health & Biomedical" }],
  roles: [
    {
      name: "nursing lecturer",
      tier: "mid",
      domains: [
        { domainId: "D039", domainName: "Higher Education", roleKey: "D039|nursing lecturer" },
        { domainId: "D024", domainName: "Nursing", roleKey: "D024|nursing lecturer" },
      ],
    },
  ],
  programmes: [
    { id: "P100", name: "Nursing Science", institutionType: "university", discipline: "Health" },
  ],
};

describe("toSearchGroups", () => {
  it("maps every section of a real payload", () => {
    const groups = toSearchGroups(PAYLOAD, "all");
    expect(groups.map((g) => g.label)).toEqual(["Programmes", "Domains", "Roles"]);
    expect(countResults(groups)).toBe(1 + 1 + 2);
  });

  it("emits one routable row per role-domain pair", () => {
    // roleKey embeds the domain, so a role spanning two fields yields two
    // distinct destinations. Collapsing them would leave the row unroutable.
    const roles = toSearchGroups(PAYLOAD, "roles")[0].items;
    expect(roles.map((r) => r.id)).toEqual([
      "D039|nursing lecturer",
      "D024|nursing lecturer",
    ]);
    expect(roles.map((r) => r.subtitle)).toEqual(["Higher Education", "Nursing"]);
  });

  it("drops a role with no domain context", () => {
    // Without a domain there is no roleKey, so the row could not navigate.
    const groups = toSearchGroups(
      { domains: [], programmes: [], roles: [{ name: "orphan", domains: [] }] },
      "all",
    );
    expect(groups).toEqual([]);
  });

  it("honours the scope control", () => {
    expect(toSearchGroups(PAYLOAD, "domains").map((g) => g.label)).toEqual(["Domains"]);
    expect(toSearchGroups(PAYLOAD, "programmes").map((g) => g.label)).toEqual(["Programmes"]);
  });

  it("drops empty groups rather than rendering a bare heading", () => {
    const groups = toSearchGroups(
      { domains: [], roles: [], programmes: PAYLOAD.programmes },
      "all",
    );
    expect(groups.map((g) => g.label)).toEqual(["Programmes"]);
  });

  it("survives a null or partial payload", () => {
    expect(toSearchGroups(null)).toEqual([]);
    expect(toSearchGroups({} as CareerSearchResult)).toEqual([]);
  });

  it("sends an undergraduate programme search into career guidance", () => {
    const groups = toSearchGroups({
      ...PAYLOAD,
      userType: "student",
      schoolId: "U1",
    }, "all", "programme_guidance");
    const programme = groups[0].items[0];
    expect(programme.actionLabel).toBe("Open programme-to-career guidance");
    expect(programme.contextHint).toContain("domains");
    expect(programme.href).toContain("user_type=student");
    expect(programme.href).toContain("journey_mode=undergraduate_career");
    expect(programme.href).toContain("school_id=U1");
  });

  it("keeps admission requirements for non-undergraduate university searches", () => {
    const jamb = toSearchGroups({
      ...PAYLOAD,
      universities: [{ id: "U1", name: "University of Lagos", institutionType: "university" }],
      userType: "jamb",
    }, "all", "university_requirements");
    expect(jamb[0].items[0].actionLabel).toBe("Check university requirements");
    expect(jamb[0].items[0].contextHint).toContain("admission requirements");

    const undergraduate = toSearchGroups({
      ...PAYLOAD,
      universities: [{ id: "U1", name: "University of Lagos", institutionType: "university" }],
      userType: "student",
    }, "all", "university_requirements");
    expect(undergraduate[0].items[0].actionLabel).toBe("Explore university programmes");
    expect(undergraduate[0].items[0].contextHint).toContain("domains");
    expect(undergraduate[0].items[0].href).toContain("journey=undergraduate_programmes");
    expect(undergraduate[0].items[0].href).not.toContain("requirements");
  });
});

describe("skill rows", () => {
  // `otherDomainCount` had ZERO coverage: the PAYLOAD above has no `skills`
  // key, so `skillRows()` was never executed by any test at all.
  const skills = (
    rows: NonNullable<CareerSearchResult["skills"]>,
  ): SearchResult[] => toSearchGroups({ ...PAYLOAD, skills: rows }, "skills")[0].items;

  it("says only the domain when no other field carries the skill", () => {
    expect(
      skills([{ id: "s1", name: "triage", domainName: "Nursing", domainId: "D024" }])[0].subtitle,
    ).toBe("Used in Nursing");
    expect(
      skills([
        { id: "s1", name: "triage", domainName: "Nursing", domainId: "D024", otherDomainCount: 0 },
      ])[0].subtitle,
    ).toBe("Used in Nursing");
  });

  it("uses the singular for exactly one other field", () => {
    expect(
      skills([
        { id: "s1", name: "triage", domainName: "Nursing", domainId: "D024", otherDomainCount: 1 },
      ])[0].subtitle,
    ).toBe("Used in Nursing and 1 other field");
  });

  it("uses the plural for more than one other field", () => {
    expect(
      skills([
        { id: "s1", name: "triage", domainName: "Nursing", domainId: "D024", otherDomainCount: 4 },
      ])[0].subtitle,
    ).toBe("Used in Nursing and 4 other fields");
  });

  it("does not double-count a skill the API emitted once per domain", () => {
    // The API caps a name at two domains and reports the rest on EACH row, so
    // `financial markets (+20)` arrives twice. Rendering both verbatim reads
    // as 42 fields for a skill that is in 22.
    const rows = skills([
      { id: "a", name: "financial markets", domainName: "Finance", domainId: "D010", otherDomainCount: 20 },
      { id: "b", name: "financial markets", domainName: "Insurance", domainId: "D011", otherDomainCount: 20 },
    ]);
    expect(rows.map((r) => r.subtitle)).toEqual([
      "Used in Finance and 21 other fields",
      "Used in Insurance and 21 other fields",
    ]);
  });

  it("treats two casings of one name as the same skill, as the backend does", () => {
    // The backend keys `per_name` on the CASEFOLDED name
    // (`career_routes.py:2800`, and `_build_skill_index` keys on
    // `(folded, domain_id)`), so "Python" in one domain and "python" in
    // another are ONE name server-side: the cap of two applies across both
    // and `otherDomainCount` is `total - 2`. Keyed on the raw name here they
    // were TWO names, `siblings` was 0 for each, and both rows read
    // "and 20 other fields" for a skill in 22 — the exact double-count the
    // sibling adjustment exists to remove, reintroduced by a case difference.
    const rows = skills([
      { id: "a", name: "Python", domainName: "Software", domainId: "D001", otherDomainCount: 20 },
      { id: "b", name: "python", domainName: "Data Science", domainId: "D002", otherDomainCount: 20 },
    ]);
    expect(rows.map((r) => r.subtitle)).toEqual([
      "Used in Software and 21 other fields",
      "Used in Data Science and 21 other fields",
    ]);
  });

  it("keeps the count when the domain did not resolve", () => {
    // "Career skill" alone discarded the count in the one case where it
    // carries the most signal: the row has nothing else to say.
    const [withCount] = skills([{ id: "s1", name: "triage", otherDomainCount: 6 }]);
    expect(withCount.subtitle).toBe("Career skill used in 7 fields");
    const [without] = skills([{ id: "s2", name: "triage" }]);
    expect(without.subtitle).toBe("Career skill");
  });
});

describe("resolveSearchHref", () => {
  const row = (type: SearchResult["type"], id: string): SearchResult => ({
    id,
    type,
    title: "x",
  });

  it("routes each supported type to its own detail screen", () => {
    expect(resolveSearchHref(row("domain", "D024"))).toBe("/(tabs)/explore/domain/D024");
    expect(resolveSearchHref(row("programme", "P100"))).toBe("/(tabs)/explore/programme/P100");
    expect(resolveSearchHref(row("opportunity", "O1"))).toBe(
      "/(tabs)/opportunities/opportunity/O1",
    );
  });

  it("encodes a roleKey containing a pipe", () => {
    // "D039|nursing lecturer" must survive as a single path segment.
    expect(resolveSearchHref(row("role", "D039|nursing lecturer"))).toBe(
      "/(tabs)/explore/role/D039%7Cnursing%20lecturer",
    );
  });

  it("returns null for types with no public detail route", () => {
    // The caller declines to navigate. Previously every type pushed /explore,
    // so picking a specific result landed the user somewhere unrelated.
    expect(resolveSearchHref(row("university", "U1"))).toBeNull();
    expect(resolveSearchHref(row("scholarship", "S1"))).toBeNull();
    expect(resolveSearchHref(row("admin", "A1"))).toBeNull();
  });

  it("returns null when the row has no id", () => {
    expect(resolveSearchHref({ id: "", type: "domain", title: "x" })).toBeNull();
  });
});

/**
 * `skillsNotice` was declared in `src/types/career.ts` and read NOWHERE:
 * `grep -rn skillsNotice src/ app/ web/ __tests__/` returned exactly that one
 * declaration. The backend distinguishes "the skill layer was skipped, failed,
 * or answered from a known-incomplete index" from a genuine no-match, and the
 * mapping threw the distinction away -- so end to end the fix did nothing.
 */
describe("skillsNotice reaches the overlay", () => {
  const withNotice = (skillsNotice: string | null, skills: CareerSearchResult["skills"] = []) =>
    toSearchGroups({ ...PAYLOAD, skills, skillsNotice } as CareerSearchResult, "all");

  it("keeps an empty Skills group alive when the API explains why", () => {
    const groups = withNotice("Skill matching failed for this query, so the skills group is missing rather than empty.");
    const skills = groups.find((g) => g.label === "Skills");
    expect(skills).toBeDefined();
    expect(skills!.items).toEqual([]);
    // Substring, not truthiness: replacing the copy with "Something went wrong."
    // must not pass.
    expect(skills!.notice).toContain("missing rather than empty");
  });

  it("still drops an empty Skills group when there is nothing to say", () => {
    expect(withNotice(null).map((g) => g.label)).not.toContain("Skills");
    expect(
      toSearchGroups(PAYLOAD, "all").map((g) => g.label),
    ).not.toContain("Skills");
  });

  it("carries the notice alongside rows when the group is merely incomplete", () => {
    const groups = withNotice(
      "The skill index is incomplete right now, so the skills group may be missing matches.",
      [{ id: "sk1", name: "risk analysis", domainId: "D024", domainName: "Nursing" }],
    );
    const skills = groups.find((g) => g.label === "Skills")!;
    expect(skills.items.map((i) => i.title)).toEqual(["risk analysis"]);
    expect(skills.notice).toContain("incomplete");
  });

  it("honours the scope control — a notice cannot resurrect a filtered-out group", () => {
    const groups = toSearchGroups(
      { ...PAYLOAD, skills: [], skillsNotice: "anything at all" } as CareerSearchResult,
      "programmes",
    );
    expect(groups.map((g) => g.label)).toEqual(["Programmes"]);
  });

  it("does not count a notice-only group as a result row", () => {
    const groups = withNotice("Skill matching failed for this query.");
    expect(countResults(groups)).toBe(
      countResults(toSearchGroups(PAYLOAD, "all")),
    );
  });
});
