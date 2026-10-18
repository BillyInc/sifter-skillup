/**
 * readThrough must actually behave like a cache.
 *
 * It used to read the cache and then call fetcher() unconditionally, using the
 * cached value only as a fallback when the request failed. So REFERENCE_TTL_MS
 * and SEARCH_TTL_MS decided how long the *fallback* stayed valid during an
 * outage, and never prevented a request: every career screen hit the network on
 * every mount, after paying for two AsyncStorage reads and two AES decrypts of
 * the same key.
 *
 * These tests pin the three properties that make it a cache: a fresh entry
 * short-circuits the request, concurrent callers for one key share a single
 * request, and the outage fallbacks still work.
 *
 * careerData is exercised through its public surface rather than by reaching
 * for the private readThrough, so the tests describe the contract callers rely
 * on. searchJambProgrammes is the simplest path — one key, one request.
 */
const mockRequest = jest.fn();
const mockGetCached = jest.fn();
const mockGetCachedStale = jest.fn();
const mockSetCached = jest.fn();

jest.mock('../src/lib/api', () => ({
  request: (...a: unknown[]) => mockRequest(...a),
  API_BASE: 'http://test',
  API: {},
}));

jest.mock('../src/lib/careerCache', () => ({
  getCached: (...a: unknown[]) => mockGetCached(...a),
  getCachedStale: (...a: unknown[]) => mockGetCachedStale(...a),
  setCached: (...a: unknown[]) => mockSetCached(...a),
  queueWrite: jest.fn(),
  cancelQueuedSave: jest.fn(),
  flushQueue: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { careerData } = require('../src/lib/careerData');

const real = (data: unknown[]) => ({ status: 'real', data });

describe('readThrough caching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCached.mockResolvedValue(null);
    mockGetCachedStale.mockResolvedValue(null);
    mockSetCached.mockResolvedValue(undefined);
  });

  it('does not call the network when a fresh entry exists', async () => {
    mockGetCached.mockResolvedValue(real([{ id: 'cached' }]));

    const result = await careerData.searchJambProgrammes('soc');

    // The load-bearing assertion. Before the fix this was 1.
    expect(mockRequest).not.toHaveBeenCalled();
    expect(result).toEqual(real([{ id: 'cached' }]));
  });

  it('fetches when the entry is absent or past its TTL, and stores the result', async () => {
    // getCached returns null past the TTL (careerCache.ts:174), which is what
    // makes "absent" and "expired" the same case here.
    mockGetCached.mockResolvedValue(null);
    mockRequest.mockResolvedValue(real([{ id: 'fresh' }]));

    const result = await careerData.searchJambProgrammes('soc');

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockSetCached).toHaveBeenCalledTimes(1);
    expect(result).toEqual(real([{ id: 'fresh' }]));
  });

  it('does not read the stale copy on the happy path', async () => {
    mockRequest.mockResolvedValue(real([{ id: 'fresh' }]));

    await careerData.searchJambProgrammes('stale-check');

    // The stale read is a second AsyncStorage hit and a second AES decrypt of a
    // key we already looked at; it belongs only in the failure paths.
    expect(mockGetCachedStale).not.toHaveBeenCalled();
  });

  it('coalesces concurrent callers for the same key into one request', async () => {
    let release: (v: unknown) => void = () => {};
    mockRequest.mockReturnValue(new Promise((r) => { release = r; }));

    const a = careerData.searchJambProgrammes('dup');
    const b = careerData.searchJambProgrammes('dup');
    const c = careerData.searchJambProgrammes('dup');
    release(real([{ id: 'shared' }]));
    const [ra, rb, rc] = await Promise.all([a, b, c]);

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(ra).toEqual(real([{ id: 'shared' }]));
    expect(rb).toEqual(ra);
    expect(rc).toEqual(ra);
  });

  it('does not coalesce different keys', async () => {
    mockRequest.mockResolvedValue(real([]));

    await Promise.all([
      careerData.searchJambProgrammes('one'),
      careerData.searchJambProgrammes('two'),
    ]);

    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('releases the in-flight slot so a later call can fetch again', async () => {
    mockRequest.mockResolvedValue(real([{ id: 'x' }]));

    await careerData.searchJambProgrammes('again');
    await careerData.searchJambProgrammes('again');

    // getCached still returns null in this test, so the second call must issue
    // its own request — proving the coalescing map is not leaking entries.
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('falls back to the stale copy when the request throws', async () => {
    mockRequest.mockRejectedValue(new Error('offline'));
    mockGetCachedStale.mockResolvedValue(real([{ id: 'stale' }]));

    const result = await careerData.searchJambProgrammes('outage');

    expect(result).toEqual(real([{ id: 'stale' }]));
  });

  it('falls back to the stale copy when the backend returns a non-real state', async () => {
    mockRequest.mockResolvedValue({ status: 'coming_soon', data: null });
    mockGetCachedStale.mockResolvedValue(real([{ id: 'stale' }]));

    const result = await careerData.searchJambProgrammes('stub');

    // A developer-facing stub must never replace a previously verified result.
    expect(result).toEqual(real([{ id: 'stale' }]));
    expect(mockSetCached).not.toHaveBeenCalled();
  });

  it('surfaces an error state when the request throws and nothing is cached', async () => {
    mockRequest.mockRejectedValue(new Error('offline'));
    mockGetCachedStale.mockResolvedValue(null);

    const result = await careerData.searchJambProgrammes('nothing');

    expect(result.status).not.toBe('real');
  });
});
