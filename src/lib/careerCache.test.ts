const mockStorage = new Map<string, string>();

jest.mock("react-native", () => ({ Platform: { OS: "web" } }));
jest.mock("@react-native-async-storage/async-storage", () => {
  const backend = {
    getItem: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => { mockStorage.set(key, value); }),
    removeItem: jest.fn(async (key: string) => { mockStorage.delete(key); }),
    getAllKeys: jest.fn(async () => [...mockStorage.keys()]),
    multiRemove: jest.fn(async (keys: string[]) => { keys.forEach((key) => mockStorage.delete(key)); }),
  };
  return { __esModule: true, default: backend };
});
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn(),
}));
jest.mock("expo-crypto", () => {
  class Key {
    static generate = jest.fn(async () => new Key());
    static import = jest.fn(() => new Key());
    encoded = jest.fn(async () => "test-key");
  }
  class Sealed {
    static fromCombined = jest.fn((value: string) => value);
  }
  return {
    AESEncryptionKey: Key,
    AESKeySize: { AES256: 256 },
    AESSealedData: Sealed,
    aesEncryptAsync: jest.fn(async (value: Uint8Array) => ({
      combined: async () => Buffer.from(value).toString("base64"),
    })),
    aesDecryptAsync: jest.fn(async (value: string) => Buffer.from(value, "base64")),
  };
});
jest.mock("@craftzdog/react-native-buffer", () => ({ Buffer: require("buffer").Buffer }));
jest.mock("./api", () => ({
  API_BASE: "https://example.invalid",
  API: { getToken: jest.fn().mockResolvedValue("test-token") },
}));
jest.mock("./deviceId", () => ({ getOrCreateDeviceId: jest.fn().mockResolvedValue("device-1") }));

import { clearQueue, flushQueue, pendingWrites, queueWrite, setCareerCacheIdentity } from "./careerCache";

describe("career offline queue replay concurrency", () => {
  beforeEach(async () => {
    mockStorage.clear();
    await setCareerCacheIdentity("learner-1");
    await clearQueue();
    jest.clearAllMocks();
  });

  it("preserves writes added while an earlier queued request is in flight", async () => {
    await queueWrite({ endpoint: "/api/first", method: "POST", body: { event_id: "first" } });
    let finishRequest!: (response: Response) => void;
    global.fetch = jest.fn(() => new Promise<Response>((resolve) => { finishRequest = resolve; })) as typeof fetch;

    const replay = flushQueue();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await queueWrite({ endpoint: "/api/second", method: "POST", body: { event_id: "second" } });
    finishRequest({ ok: true, status: 200 } as Response);
    await expect(replay).resolves.toBe(1);

    expect(await pendingWrites()).toBe(1);
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 } as Response) as typeof fetch;
    await expect(flushQueue()).resolves.toBe(1);
    expect(await pendingWrites()).toBe(0);
  });
});
