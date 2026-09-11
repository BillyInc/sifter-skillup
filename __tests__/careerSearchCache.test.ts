/**
 * Career search's cache read-through, from the user's point of view.
 *
 * `readThrough()` is the single decision that makes the app usable on a bad
 * Nigerian connection: a verified result is kept and re-served when the backend
 * is down, and a developer-facing stub envelope ("coming_soon", "error") must
 * never overwrite it. That policy is four lines of ?? chains with no test, and
 * each arm fails in a way the user feels — an empty search screen for a query
 * that worked a minute ago.
 *
 * The API layer is mocked, so nothing here touches Supabase or the network.
 */
import type { CareerSearchResult, DataState } from "../src/types/career";

const mockRequest = jest.fn();
jest.mock("../src/lib/api", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

const mockGetCached = jest.fn();
const mockGetCachedStale = jest.fn();
const mockSetCached = jest.fn();
jest.mock("../src/lib/careerCache", () => ({
  getCached: (...a: unknown[]) => mockGetCached(...a),
  getCachedStale: (...a: unknown[]) => mockGetCachedStale(...a),
  setCached: (...a: unknown[]) => mockSetCached(...a),
  queueWrite: jest.fn(),
  cancelQueuedSave: jest.fn(),
  flushQueue: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { careerData } = require("../src/lib/careerData");

const payload = (name: string): CareerSearchResult => ({
  domains: [{ id: "D024", name }],
  roles: [],
  programmes: [],
});

const fresh: DataState<CareerSearchResult> = { status: "real", data: payload("Nursing") };
const older: DataState<CareerSearchResult> = { status: "real", data: payload("Nursing (cached)") };

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCached.mockResolvedValue(null);
  mockGetCachedStale.mockResolvedValue(null);
  mockSetCached.mockResolvedValue(undefined);
});

describe("careerData.searchCareer", () => {
  it("returns and caches a verified result", async () => {
    mockRequest.mockResolvedValue(fresh);

    const out = await careerData.searchCareer("Nursing");

    expect(out).toBe(fresh);
    expect(mockSetCached).toHaveBeenCalledTimes(1);
    const [, value, ttl] = mockSetCached.mock.calls[0];
    expect(value).toBe(fresh);
    // Search results are worth a week offline; reference data only a day.
    expect(ttl).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("serves the last verified result when the request throws", async () => {
    // The offline case. Without this the user sees "Search is temporarily
    // unavailable" for a term they searched successfully this morning.
    mockGetCachedStale.mockResolvedValue(older);
    mockRequest.mockRejectedValue(new Error("network down"));

    const out = await careerData.searchCareer("Nursing");

    expect(out).toBe(older);
    expect(mockSetCached).not.toHaveBeenCalled();
  });

  it("reports the failure honestly when there is nothing cached to fall back on", async () => {
    mockRequest.mockRejectedValue(new Error("network down"));

    const out = await careerData.searchCareer("Nursing");

    expect(out.status).toBe("error");
    expect(out.data).toBeNull();
    expect(out.meta?.notice).toBe("Search is temporarily unavailable.");
  });

  it("keeps a verified result rather than replacing it with a stub envelope", async () => {
    // A backend outage answers with a non-"real" envelope instead of throwing.
    // Overwriting good data with a developer-facing placeholder is the bug this
    // guards: the user loses working search without anything having failed.
    mockGetCached.mockResolvedValue(older);
    mockRequest.mockResolvedValue({ status: "coming_soon", data: null } as DataState<CareerSearchResult>);

    const out = await careerData.searchCareer("Nursing");

    expect(out).toBe(older);
    expect(mockSetCached).not.toHaveBeenCalled();
  });

  it("passes the stub through only when there is no better answer on the device", async () => {
    const stub = { status: "coming_soon", data: null } as DataState<CareerSearchResult>;
    mockRequest.mockResolvedValue(stub);

    expect(await careerData.searchCareer("Nursing")).toBe(stub);
  });

  it("normalises the cache key so casing and padding do not fragment the cache", async () => {
    mockRequest.mockResolvedValue(fresh);

    await careerData.searchCareer("  NURSING  ");

    expect(mockGetCached).toHaveBeenCalledWith("search_undecided_unknown_none_nursing");
  });

  it("keys separately per task, persona and school so answers are not crossed", async () => {
    // The same term means different things for "find a programme" vs "check a
    // university", and the destination differs per persona. One shared key
    // would serve a returning user the other journey's results.
    mockRequest.mockResolvedValue(fresh);

    await careerData.searchCareer("Nursing", "programme_guidance", "student", "U1");

    expect(mockGetCached).toHaveBeenCalledWith(
      "search_programme_guidance_student_U1_nursing",
    );
  });

  it("sends the task, persona and school to the endpoint, url-encoded", async () => {
    mockRequest.mockResolvedValue(fresh);

    await careerData.searchCareer("nursing & midwifery", "career_exploration", "student", "U 1");

    expect(mockRequest).toHaveBeenCalledWith(
      "/api/career/search?q=nursing%20%26%20midwifery&intent=career_exploration&user_type=student&school_id=U%201",
    );
  });

  it("omits the optional parameters entirely when they are absent", async () => {
    mockRequest.mockResolvedValue(fresh);

    await careerData.searchCareer("nursing");

    expect(mockRequest).toHaveBeenCalledWith("/api/career/search?q=nursing");
  });
});
