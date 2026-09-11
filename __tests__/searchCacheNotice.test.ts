/**
 * `readThrough` is NETWORK-FIRST, and a search answer carrying a notice is still
 * worth caching.
 *
 * The premise this file used to be written on was:
 *
 *     `/api/career/search` returns `{ status: "real", data: { …, skillsNotice:
 *     "…Try again shortly." } }` when the skill layer times out. `readThrough`
 *     caches ANY `status === "real"` result for SEVEN DAYS, so one timeout wrote
 *     "try again shortly" to disk and every repeat of that query was served from
 *     the cache — the user retries and no request ever reaches the backend.
 *
 * The last clause is FALSE. `readThrough` awaits the fetcher unconditionally and
 * returns `cached`/`stale` only when the result is not `status: "real"` or the
 * fetcher throws. Proven against the pre-guard code with the stateful cache
 * below: the notice envelope WAS written (`store.size === 1`) and the second
 * identical query still hit the network (`mockRequest` called twice). Caching
 * was never broken.
 *
 * What the `isCacheable` guard added in response actually cost: the skill index
 * sets `skillsNotice` on EVERY search response during a partial-index window, so
 * while that window is open nothing caches at all, and a user who then loses
 * connectivity gets `error("Search is temporarily unavailable.")` instead of the
 * rows they were just looking at. The guard is reverted; these tests pin the
 * behaviour that makes reverting safe, and the offline test fails if the guard
 * comes back.
 */
const mockRequest = jest.fn();
// Typed via generics rather than an inline implementation: the inline overload
// does not infer its parameter list here, and __tests__ sits outside
// tsconfig.json's `include`, so `tsc --noEmit` would not catch the resulting
// "Expected 0 arguments" error. Matches the jest.fn() convention used by the
// other suites in this directory.
const mockSetCached = jest.fn<Promise<void>, [string, unknown, number]>();
const mockGetCached = jest.fn<Promise<unknown>, [string]>();
const mockGetCachedStale = jest.fn<Promise<unknown>, [string]>();

jest.mock("../src/lib/api", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

jest.mock("../src/lib/careerCache", () => ({
  getCached: (key: string) => mockGetCached(key),
  getCachedStale: (key: string) => mockGetCachedStale(key),
  setCached: (key: string, value: unknown, ttlMs: number) =>
    mockSetCached(key, value, ttlMs),
  queueWrite: jest.fn(),
  cancelQueuedSave: jest.fn(),
  flushQueue: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { careerData } = require("../src/lib/careerData");

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const TRANSIENT_NOTICE =
  "Skill matching failed for this query, so the skills group is missing " +
  "rather than empty. Try again shortly.";
const PARTIAL_NOTICE =
  "The skill index is incomplete right now, so the skills group may be " +
  "missing matches.";

const envelope = (skillsNotice: string | null, domains: unknown[] = []) => ({
  status: "real" as const,
  data: {
    domains,
    roles: [],
    programmes: [],
    skills: [],
    skillsNotice,
  },
});

/** A real read-through cache, so "was it written" and "was it served" are
 * separate observable facts rather than the same mock call. */
function useStatefulCache() {
  const store = new Map<string, unknown>();
  mockSetCached.mockImplementation(async (key, value) => {
    store.set(key, value);
  });
  mockGetCached.mockImplementation(async (key) => store.get(key) ?? null);
  mockGetCachedStale.mockImplementation(async (key) => store.get(key) ?? null);
  return store;
}

beforeEach(() => {
  mockRequest.mockReset();
  mockSetCached.mockReset().mockResolvedValue(undefined);
  mockGetCached.mockReset().mockResolvedValue(null);
  mockGetCachedStale.mockReset().mockResolvedValue(null);
});

describe("searchCareer caching", () => {
  it("caches a clean answer, for the full search TTL", () => {
    mockRequest.mockResolvedValue(envelope(null));
    return careerData.searchCareer("risk analysis").then(() => {
      expect(mockSetCached).toHaveBeenCalledTimes(1);
      const [key, value, ttl] = mockSetCached.mock.calls[0];
      expect(key).toContain("risk analysis");
      expect(ttl).toBe(SEVEN_DAYS);
      expect(value).toMatchObject({ status: "real" });
    });
  });

  it.each([
    ["the transient skill-layer notice", TRANSIENT_NOTICE],
    ["the partial-index notice", PARTIAL_NOTICE],
    ["the short-subject notice", "Skill matching needs at least two characters."],
  ])("still caches an answer carrying %s", async (_label, notice) => {
    mockRequest.mockResolvedValue(envelope(notice, [{ id: "D1" }]));
    const result = await careerData.searchCareer("risk analysis");
    expect(result.data.skillsNotice).toBe(notice);
    // The rows in this envelope are real rows. Declining to persist them
    // because a SIDE GROUP is degraded is what left an offline user with
    // nothing — and during a partial-index window that is every response.
    expect(mockSetCached).toHaveBeenCalledTimes(1);
    expect(mockSetCached.mock.calls[0][2]).toBe(SEVEN_DAYS);
  });

  it("never suppresses a request with a cached answer, notice or not", async () => {
    const store = useStatefulCache();
    mockRequest.mockResolvedValue(envelope(TRANSIENT_NOTICE));
    await careerData.searchCareer("risk analysis");
    expect(store.size).toBe(1);

    // The premise behind the reverted guard was that this second call would be
    // served from disk. `readThrough` awaits the fetcher first, so it is not.
    mockRequest.mockResolvedValue(envelope(null, [{ id: "D1" }]));
    const second = await careerData.searchCareer("risk analysis");
    expect(mockRequest).toHaveBeenCalledTimes(2);
    // ...and the FRESH answer is what the caller gets, not the cached notice.
    expect(second.data.skillsNotice).toBeNull();
    expect(second.data.domains).toEqual([{ id: "D1" }]);
  });

  it("serves the last answer offline instead of an error", async () => {
    // THE REGRESSION THE GUARD CAUSED. With caching declined while a notice is
    // present, the store is empty here and `readThrough`'s catch falls through
    // to `error("Search is temporarily unavailable.")` — so a user who had
    // results on screen a moment ago is told the search is unavailable.
    useStatefulCache();
    mockRequest.mockResolvedValue(envelope(PARTIAL_NOTICE, [{ id: "D1" }]));
    await careerData.searchCareer("risk analysis");

    mockRequest.mockRejectedValue(new Error("offline"));
    const offline = await careerData.searchCareer("risk analysis");
    expect(offline.status).toBe("real");
    expect(offline.data.domains).toEqual([{ id: "D1" }]);
  });

  it("falls back to an error only when nothing was ever cached", async () => {
    // The positive control for the test above: the offline path really does
    // produce an error envelope when the store is empty, so that assertion is
    // not passing for an unrelated reason.
    useStatefulCache();
    mockRequest.mockRejectedValue(new Error("offline"));
    const offline = await careerData.searchCareer("never searched before");
    expect(offline.status).toBe("error");
  });

  it("caches a clean answer when `skillsNotice` is absent altogether", async () => {
    mockRequest.mockResolvedValue({
      status: "real" as const,
      data: { domains: [], roles: [], programmes: [] },
    });
    await careerData.searchCareer("nursing");
    expect(mockSetCached).toHaveBeenCalledTimes(1);
  });
});
