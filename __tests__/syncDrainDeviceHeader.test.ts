/**
 * /api/sync/drain now goes through full device validation on the server
 * (DeviceSessionMiddleware no longer exempts it), so every client path that
 * calls it must send a session token and X-Device-Id. This pins both callers.
 */
import * as fs from 'fs';
import * as path from 'path';

describe('API.syncDrain sends the device header', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('adds X-Device-Id and the bearer token to POST /api/sync/drain', async () => {
    jest.doMock('expo-secure-store', () => ({
      getItemAsync: jest.fn().mockResolvedValue('tok-123'),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
    jest.doMock('../src/lib/deviceId', () => ({
      DEVICE_ID_KEY: 'sifter_device_id_v2',
      getOrCreateDeviceId: jest.fn().mockResolvedValue('device-abc'),
    }));
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true, data: { results: [] } }),
      text: async () => JSON.stringify({ success: true, data: { results: [] } }),
    });
    // @ts-expect-error test double
    global.fetch = fetchMock;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { API } = require('../src/lib/api');
    await API.syncDrain([], 'device-abc').catch(() => undefined);

    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/api/sync/drain'));
    expect(call).toBeDefined();
    const headers = (call![1] as { headers: Record<string, string> }).headers;
    expect(headers['X-Device-Id']).toBe('device-abc');
    expect(headers.Authorization).toBe('Bearer tok-123');
  });
});

describe('offline queue drain sends the device header', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'lib', 'offlineStorage.ts'),
    'utf8',
  );

  it('builds its headers with X-Device-Id and the bearer token', () => {
    const build = source.slice(source.indexOf('async function buildHeaders'));
    const body = build.slice(0, build.indexOf('\n}\n'));
    expect(body).toContain("'X-Device-Id': deviceId");
    expect(body).toContain('Authorization: `Bearer ${token}`');
  });

  it('uses those headers for the drain request', () => {
    const drain = source.slice(source.indexOf('async function drainQueueToServer'));
    const fn = drain.slice(0, drain.indexOf('\n}\n'));
    expect(fn).toContain('buildHeaders(getToken)');
    expect(fn).toMatch(/fetch\(`\$\{apiBase\}\/api\/sync\/drain`,\s*\{[\s\S]*headers,/);
  });
});
