/**
 * Tests that feedAggregator unwraps the {success, data} envelope returned by
 * the backend before handing the items back to the caller.
 *
 * `_envelope` is private, so we exercise it through `fetchSifterSkills` which
 * is the smallest public surface that uses it (single GET, no helpers).
 */

import { fetchSifterSkills } from '../src/lib/feedAggregator';

describe('feedAggregator envelope unwrapping', () => {
  const realFetch = global.fetch;
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    // @ts-expect-error - assigning mock
    global.fetch = fetchMock;
  });

  afterAll(() => {
    global.fetch = realFetch;
  });

  it('unwraps {success: true, data: [...]} into the inner array', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: 'a' }, { id: 'b' }],
      }),
    });

    const items = await fetchSifterSkills('quant-trader');
    expect(items).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('returns [] when the envelope reports success: false', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, error: 'fail' }),
    });

    const items = await fetchSifterSkills('quant-trader');
    expect(items).toEqual([]);
  });

  it('returns [] when the HTTP response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, error: 'boom' }),
    });

    const items = await fetchSifterSkills('quant-trader');
    expect(items).toEqual([]);
  });
});
