/**
 * Tests the discriminated-union narrowing in API.pushPortfolioArtifact.
 *
 * Both shapes should normalize to a POST /api/portfolio/items/push call with
 * { item_id, platform_ids, caption } in the body.
 */

import { API } from '../src/lib/api';

// Mock SecureStore to avoid native crashes when api.ts loads.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Silence the deferred logger transport so it doesn't fire timers after tests complete.
jest.mock('../src/lib/logger', () => ({
  logger: {
    debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
  },
  logApiCall: jest.fn(),
}));

describe('API.pushPortfolioArtifact', () => {
  const fetchMock = jest.fn();
  const realFetch = global.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ success: true, data: [{ ok: true }] }),
    });
    // @ts-expect-error - assigning mock
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = realFetch;
  });

  it('accepts the {itemId, platformIds} shape', async () => {
    await API.pushPortfolioArtifact({
      itemId: 'item-1',
      platformIds: ['twitter', 'medium'],
      caption: 'hello world',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/portfolio/items/push');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      item_id: 'item-1',
      platform_ids: ['twitter', 'medium'],
      caption: 'hello world',
    });
  });

  it('accepts the {artifactId, platformId} shape', async () => {
    await API.pushPortfolioArtifact({
      artifactId: 'artifact-9',
      platformId: 'instagram',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      item_id: 'artifact-9',
      platform_ids: ['instagram'],
      caption: '',
    });
  });

  it('throws when given an empty / unrecognized payload', async () => {
    expect(() =>
      // @ts-expect-error - intentionally invalid
      API.pushPortfolioArtifact({}),
    ).toThrow(/invalid pushPortfolioArtifact payload/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('both shapes hit the same endpoint with normalized body keys', async () => {
    await API.pushPortfolioArtifact({ itemId: 'a', platformIds: ['x'] });
    await API.pushPortfolioArtifact({ artifactId: 'b', platformId: 'y' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [url, init] of fetchMock.mock.calls) {
      expect(url).toContain('/api/portfolio/items/push');
      const body = JSON.parse(init.body);
      expect(body).toHaveProperty('item_id');
      expect(body).toHaveProperty('platform_ids');
      expect(Array.isArray(body.platform_ids)).toBe(true);
    }
  });
});
