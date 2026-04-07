/**
 * Tests the web vs native branching of API.clearToken().
 *
 * Each test isolates module state with jest.isolateModules so that the
 * `typeof window` / `typeof document` check inside api.ts is re-evaluated.
 */

describe('API.clearToken — web path', () => {
  const removeItemMock = jest.fn();

  beforeAll(() => {
    // Define window + document so the web branch is taken.
    // @ts-expect-error - JSDOM-style globals
    global.window = {};
    // @ts-expect-error
    global.document = {};
    // @ts-expect-error
    global.localStorage = { removeItem: removeItemMock, getItem: jest.fn(), setItem: jest.fn() };
  });

  afterAll(() => {
    // @ts-expect-error
    delete global.window;
    // @ts-expect-error
    delete global.document;
    // @ts-expect-error
    delete global.localStorage;
  });

  beforeEach(() => {
    removeItemMock.mockClear();
    jest.resetModules();
  });

  it('clears the token from localStorage', async () => {
    jest.doMock('expo-secure-store', () => ({
      getItemAsync: jest.fn(),
      setItemAsync: jest.fn(),
      deleteItemAsync: jest.fn(),
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { API } = require('../src/lib/api');
    await API.clearToken();
    expect(removeItemMock).toHaveBeenCalledWith('sifter_auth_token_v2');
  });
});

describe('API.clearToken — native path', () => {
  const deleteItemAsync = jest.fn().mockResolvedValue(undefined);

  beforeAll(() => {
    // Ensure no window/document so native branch is taken
    // @ts-expect-error
    delete global.window;
    // @ts-expect-error
    delete global.document;
  });

  beforeEach(() => {
    deleteItemAsync.mockClear();
    jest.resetModules();
  });

  it('uses SecureStore.deleteItemAsync', async () => {
    jest.doMock('expo-secure-store', () => ({
      getItemAsync: jest.fn().mockResolvedValue(null),
      setItemAsync: jest.fn().mockResolvedValue(undefined),
      deleteItemAsync,
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { API } = require('../src/lib/api');
    await API.clearToken();
    expect(deleteItemAsync).toHaveBeenCalledWith('sifter_auth_token_v2');
  });
});
