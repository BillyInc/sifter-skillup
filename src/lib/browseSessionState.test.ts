import {
  BROWSE_STATE_TTL_MS,
  browseStateKey,
  clearBrowseState,
  readBrowseState,
  resetBrowseStateMemory,
  writeBrowseState,
} from "./browseSessionState";

describe("browseSessionState", () => {
  beforeEach(() => resetBrowseStateMemory());

  it("returns nothing for an unseen key", () => {
    expect(readBrowseState("missing")).toBeNull();
  });

  it("merges field and scroll updates independently", () => {
    const key = browseStateKey("explore", "u1");
    writeBrowseState(key, { fields: { query: "nursing" } });
    writeBrowseState(key, { fields: { filter: "roles" } });
    writeBrowseState(key, { scrollY: 412.6 });
    const saved = readBrowseState(key);
    expect(saved?.fields).toEqual({ query: "nursing", filter: "roles" });
    expect(saved?.scrollY).toBe(413);
  });

  it("scopes by screen, account and variant", () => {
    writeBrowseState(browseStateKey("explore", "u1"), { fields: { query: "a" } });
    expect(readBrowseState(browseStateKey("explore", "u2"))).toBeNull();
    expect(readBrowseState(browseStateKey("admission", "u1"))).toBeNull();
    expect(readBrowseState(browseStateKey("explore", "u1", "v"))).toBeNull();
  });

  it("never stores a negative scroll offset", () => {
    const key = browseStateKey("explore", null);
    writeBrowseState(key, { scrollY: -20 });
    expect(readBrowseState(key)?.scrollY).toBe(0);
  });

  it("expires old entries and clears on request", () => {
    const key = browseStateKey("explore", "u1");
    writeBrowseState(key, { fields: { query: "law" } }, 1000);
    expect(readBrowseState(key, 1000 + BROWSE_STATE_TTL_MS - 1)?.fields.query).toBe("law");
    expect(readBrowseState(key, 1000 + BROWSE_STATE_TTL_MS + 1)).toBeNull();
    writeBrowseState(key, { fields: { query: "law" } });
    clearBrowseState(key);
    expect(readBrowseState(key)).toBeNull();
  });
});
