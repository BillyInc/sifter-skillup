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
