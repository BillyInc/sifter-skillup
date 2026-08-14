/**
 * "Recent searches" must be the user's own.
 *
 * ReferenceShell passed a hardcoded list to the overlay:
 *
 *     recentSearches={["Medicine & Surgery", "UNILAG", "Computer Science"]}
 *
 * That is a claim about this user's history. A student who had never searched
 * was shown three searches they never made, including a named university --
 * fabricated user information presented as real, which the product's data rule
 * forbids outright. The list must start empty and only ever contain terms the
 * user actually submitted.
 */

const mockStore = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (k: string) => (mockStore.has(k) ? mockStore.get(k)! : null)),
  setItem: jest.fn(async (k: string, v: string) => {
    mockStore.set(k, v);
  }),
  removeItem: jest.fn(async (k: string) => {
    mockStore.delete(k);
  }),
}));

import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  MAX_RECENT_SEARCHES,
} from "../src/lib/recentSearches";

beforeEach(() => mockStore.clear());

describe("recent searches", () => {
  it("starts empty for a user who has never searched", async () => {
    expect(await getRecentSearches()).toEqual([]);
  });

  it("records a submitted term", async () => {
    await addRecentSearch("Nursing");
    expect(await getRecentSearches()).toEqual(["Nursing"]);
  });

  it("orders most-recent first", async () => {
    await addRecentSearch("Law");
    await addRecentSearch("Nursing");
    expect(await getRecentSearches()).toEqual(["Nursing", "Law"]);
  });

  it("promotes a repeated term instead of duplicating it", async () => {
    await addRecentSearch("Law");
    await addRecentSearch("Nursing");
    await addRecentSearch("law"); // different case, same search
    expect(await getRecentSearches()).toEqual(["law", "Nursing"]);
  });

  it("caps the list", async () => {
    for (let i = 0; i < MAX_RECENT_SEARCHES + 4; i++) {
      await addRecentSearch(`term-${i}`);
    }
    const terms = await getRecentSearches();
    expect(terms).toHaveLength(MAX_RECENT_SEARCHES);
    expect(terms[0]).toBe(`term-${MAX_RECENT_SEARCHES + 3}`);
  });

  it("ignores in-flight typing noise", async () => {
    await addRecentSearch("a");
    await addRecentSearch("  ");
    expect(await getRecentSearches()).toEqual([]);
  });

  it("clears", async () => {
    await addRecentSearch("Nursing");
    await clearRecentSearches();
    expect(await getRecentSearches()).toEqual([]);
  });

  it("returns [] rather than throwing on corrupt storage", async () => {
    mockStore.set("@levelup_recent_searches_v1", "{not json");
    expect(await getRecentSearches()).toEqual([]);
  });

  it("discards non-string entries", async () => {
    mockStore.set("@levelup_recent_searches_v1", JSON.stringify(["ok", 42, null]));
    expect(await getRecentSearches()).toEqual(["ok"]);
  });
});
