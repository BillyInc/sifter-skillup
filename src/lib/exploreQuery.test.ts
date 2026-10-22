import { exploreQueryHref, parseExploreQuery, searchScopeForExplore, serializeExploreQuery } from "./exploreQuery";

describe("Explore query contract", () => {
  it("parses array route parameters and rejects unsupported scopes", () => {
    expect(parseExploreQuery({ q: ["Sociology", "ignored"], scope: ["areas"] })).toEqual({ text: "Sociology", scope: "areas" });
    expect(parseExploreQuery({ q: 2, scope: "task_family" })).toEqual({ text: "", scope: "all" });
  });

  it("maps student-facing areas onto the internal compatibility scope", () => {
    expect(searchScopeForExplore("areas")).toBe("subgroups");
  });

  it("round-trips query and scope through links", () => {
    const query = { text: "Social science & research", scope: "roles" as const };
    expect(serializeExploreQuery(query)).toBe("q=Social+science+%26+research&scope=roles");
    expect(exploreQueryHref("/(tabs)/explore", query)).toBe("/(tabs)/explore?q=Social+science+%26+research&scope=roles");
  });
});
