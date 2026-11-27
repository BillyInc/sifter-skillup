/**
 * The offline write queue must never send one account's writes with another
 * account's token, must keep writes when the session has expired, and must be
 * emptied (with the read cache and admin drafts) on sign-out / deletion.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

let mockProfile: { id: string } | null = { id: "user-a" };
let mockToken: string | null = "token-a";

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
    addEventListener: jest.fn(() => () => undefined),
  },
}));
jest.mock("../src/lib/sessionProfile", () => ({
  getSavedSessionProfile: jest.fn(async () => mockProfile),
}));
jest.mock("../src/lib/api", () => ({
  API_BASE: "http://api.test",
  API: { getToken: jest.fn(async () => mockToken) },
}));

import NetInfo from "@react-native-community/netinfo";
import { OfflineQueue, offlineWrite, clearOfflineData } from "../src/lib/offlineQueue";
import { clearAllDeviceUserData } from "../src/lib/localUserState";
import {
  saveAdminProvisioningDrafts,
  getAdminProvisioningDrafts,
  saveAdminResume,
  getAdminResume,
} from "../src/lib/adminResume";

const netFetch = NetInfo.fetch as jest.Mock;
const fetchMock = jest.fn();
const flush = () => new Promise((r) => setTimeout(r, 0));
const pending = () => (OfflineQueue as any).queue.length;

async function enqueueOffline(body: unknown) {
  // Network down so enqueue does not drain immediately.
  netFetch.mockResolvedValueOnce({ isConnected: false, isInternetReachable: false });
  await offlineWrite("/api/flags", "POST", body);
  await flush();
}

async function drain() {
  await (OfflineQueue as any)._trySync();
}

beforeEach(async () => {
  mockProfile = { id: "user-a" };
  mockToken = "token-a";
  fetchMock.mockReset();
  netFetch.mockReset().mockResolvedValue({ isConnected: true, isInternetReachable: true });
  (global as any).fetch = fetchMock;
  await AsyncStorage.clear();
  await OfflineQueue.clear();
  (OfflineQueue as any).syncing = false;
});

describe("offline queue ownership", () => {
  it("does not drain user A's writes with user B's token", async () => {
    await enqueueOffline({ n: 1 });
    expect(pending()).toBe(1);

    mockProfile = { id: "user-b" };
    mockToken = "token-b";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(pending()).toBe(1);
  });

  it("drains the owner's writes with the owner's token", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: true, status: 200 });
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer token-a");
    expect(pending()).toBe(0);
  });

  it("does not queue a write when nobody is signed in", async () => {
    mockProfile = null;
    await enqueueOffline({ n: 1 });
    expect(pending()).toBe(0);
  });
});

describe("offline queue error handling", () => {
  it.each([401, 403])("keeps the item and stops draining on %s", async (status) => {
    await enqueueOffline({ n: 1 });
    await enqueueOffline({ n: 2 });
    fetchMock.mockResolvedValue({ ok: false, status });
    await drain();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(pending()).toBe(2);
  });

  it("still drops other permanent 4xx errors", async () => {
    await enqueueOffline({ n: 1 });
    fetchMock.mockResolvedValue({ ok: false, status: 422 });
    await drain();
    expect(pending()).toBe(0);
  });
});

describe("sign-out clearing", () => {
  it("removes the queue, read cache and admin drafts/resume", async () => {
    await enqueueOffline({ n: 1 });
    await AsyncStorage.setItem("sifter_cache_programmes", "{}");
    await saveAdminProvisioningDrafts([{ id: "local-draft-1" } as any], "user-a");
    await saveAdminResume({ href: "/(admin)/home", label: "Home" } as any, "user-a");
    expect(await getAdminProvisioningDrafts("user-a")).toHaveLength(1);

    await clearAllDeviceUserData("user-a");

    expect(pending()).toBe(0);
    expect(await AsyncStorage.getItem("sifter_offline_queue")).toBeNull();
    expect(await AsyncStorage.getItem("sifter_cache_programmes")).toBeNull();
    expect(await getAdminProvisioningDrafts("user-a")).toEqual([]);
    expect(await getAdminResume("user-a")).toBeNull();
  });

  it("clearOfflineData leaves unrelated keys alone", async () => {
    await AsyncStorage.setItem("unrelated", "1");
    await clearOfflineData();
    expect(await AsyncStorage.getItem("unrelated")).toBe("1");
  });
});
