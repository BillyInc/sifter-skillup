/**
 * A restore/adopt/refresh that was waiting on getMe() must write nothing when
 * another tab signed out meanwhile: the stored token is no longer the one the
 * request used and the explicit-logout marker is set. The in-tab epoch cannot
 * see that, so the stored token and marker are re-checked after the await.
 */
import React from "react";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor, act, cleanup } from "@testing-library/react-native";

import { WebAuthProvider, useAuth } from "../web/src/webAuth";
import { DEVICE_OWNER_KEY } from "../src/lib/localUserState";
import { getSavedSessionProfile } from "../src/lib/sessionProfile";
import { beginSignOut } from "../src/lib/sessionLifecycle";
import { hasExplicitLogout } from "../src/lib/logoutState";

let mockTokenValue: string | null = null;
let mockGetMe: jest.Mock;

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn().mockResolvedValue({ isConnected: false, isInternetReachable: false }),
    addEventListener: jest.fn(() => () => undefined),
  },
}));
jest.mock("../src/lib/api", () => ({
  API_BASE: "http://api.test",
  API: {
    saveToken: jest.fn(async (t: string) => { mockTokenValue = t; }),
    clearToken: jest.fn(async () => { mockTokenValue = null; }),
    getToken: jest.fn(async () => mockTokenValue),
    hasStoredToken: jest.fn(() => mockTokenValue !== null),
    getMe: (...a: unknown[]) => mockGetMe(...a),
  },
}));
jest.mock("../src/lib/offlineStorage", () => ({ switchLocalUser: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../src/lib/careerCache", () => ({ setCareerCacheIdentity: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../src/lib/deviceId", () => ({ getOrCreateDeviceId: jest.fn(async () => "device-1") }));

let auth: any;
function Probe() {
  auth = useAuth();
  return <Text>{auth.user ? auth.user.id : "anon"}</Text>;
}
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  mockTokenValue = null;
  mockGetMe = jest.fn();
  await AsyncStorage.clear();
});
afterEach(() => cleanup());

/** Another tab signs out: marker, then token removal, then the wipe. */
async function otherTabSignsOut() {
  await beginSignOut();
  mockTokenValue = null;
  await AsyncStorage.removeItem("@levelup_session_profile_v1");
  await AsyncStorage.removeItem(DEVICE_OWNER_KEY);
}

it("restore: a sign-out in another tab during getMe() leaves nothing written and no user", async () => {
  mockTokenValue = "tok-bob";
  let release!: (u: unknown) => void;
  mockGetMe.mockImplementation(() => new Promise((r) => { release = r; }));
  render(<WebAuthProvider><Probe /></WebAuthProvider>);
  await act(async () => { await flush(); });

  await act(async () => { await otherTabSignsOut(); });
  await act(async () => { release({ id: "bob" }); await flush(); await flush(); });
  await waitFor(() => expect(auth.loading).toBe(false));

  expect(auth.user).toBeNull();
  expect(await getSavedSessionProfile()).toBeNull();
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
  expect(await hasExplicitLogout()).toBe(true);
  expect(mockTokenValue).toBeNull();
});

it("restore: still saves and shows the user when nothing changed during getMe()", async () => {
  mockTokenValue = "tok-bob";
  mockGetMe.mockResolvedValue({ id: "bob" });
  render(<WebAuthProvider><Probe /></WebAuthProvider>);
  await waitFor(() => expect(auth.user?.id).toBe("bob"));
  expect((await getSavedSessionProfile<{ id: string }>())?.id).toBe("bob");
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("bob");
});

it("refreshUser: a sign-out in another tab during getMe() writes nothing", async () => {
  mockTokenValue = "tok-bob";
  mockGetMe.mockResolvedValueOnce({ id: "bob" });
  render(<WebAuthProvider><Probe /></WebAuthProvider>);
  await waitFor(() => expect(auth.user?.id).toBe("bob"));

  let release!: (u: unknown) => void;
  mockGetMe.mockImplementation(() => new Promise((r) => { release = r; }));
  let refreshing!: Promise<void>;
  await act(async () => { refreshing = auth.refreshUser(); await flush(); });
  await act(async () => { await otherTabSignsOut(); });
  await act(async () => { release({ id: "bob", display_name: "late" }); await refreshing; });

  expect(await getSavedSessionProfile()).toBeNull();
  expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
  expect(auth.user?.display_name).toBeUndefined();
});
