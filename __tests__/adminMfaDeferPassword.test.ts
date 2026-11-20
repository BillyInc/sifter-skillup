/**
 * Deferring admin security is a downgrade, so the server now requires the
 * account password (POST /api/auth/mfa/defer). The client must send it, and the
 * Settings screen must offer a field for it.
 */
import * as fs from 'fs';
import * as path from 'path';

describe('API.deferAdminMfa', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('sends the password in the request body', async () => {
    jest.doMock('expo-secure-store', () => ({
      getItemAsync: jest.fn().mockResolvedValue('tok-123'),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
    jest.doMock('../src/lib/deviceId', () => ({
      DEVICE_ID_KEY: 'sifter_device_id_v2',
      getOrCreateDeviceId: jest.fn().mockResolvedValue('device-abc'),
    }));
    const body = { success: true, data: { status: 'deferred' } };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => body,
      text: async () => JSON.stringify(body),
    });
    // @ts-expect-error test double
    global.fetch = fetchMock;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { API } = require('../src/lib/api');
    await API.deferAdminMfa('correct horse').catch(() => undefined);

    const call = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/api/auth/mfa/defer'));
    expect(call).toBeDefined();
    expect(JSON.parse((call![1] as { body: string }).body)).toEqual({ password: 'correct horse' });
  });
});

describe('Settings screen', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'screens', 'SettingsScreen.tsx'),
    'utf8',
  );

  it('asks for the password before deferring and never echoes it', () => {
    expect(source).toContain('deferAdminMfa(deferPassword)');
    expect(source).toContain('secureTextEntry');
    expect(source).toContain("setDeferPassword('')");
  });
});
