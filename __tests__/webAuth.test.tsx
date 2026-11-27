/**
 * The Vite web shell aliases `@/hooks/useAuth` to web/src/webAuth.tsx, so it is
 * the primary build. It must share the native provider's sign-in/out logic:
 * sign-out/delete clear device data, login reconciles the owner and saves the
 * profile before the token, and a queued write works after login.
 */
import React from "react";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { render, waitFor, act } from "@testing-library/react-native";

import { WebAuthProvider, useAuth } from "../web/src/webAuth";
import { OfflineQueue, offlineWrite } from "../src/lib/offlineQueue";
import { DEVICE_OWNER_KEY } from "../src/lib/localUserState";
import { getSavedSessionProfile } from "../src/lib/sessionProfile";

const mockCalls: string[] = [];
let mockTokenValue: string | null = null;
let mockProfileAtTokenTime: string | null = null;
let mockReadProfile: () => Promise<string | null> = async () => null;
const mockAuthLogin = jest.fn();
const mockGetMe = jest.fn();

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
    authLogin: (...a: unknown[]) => mockAuthLogin(...a),
    authGuest: (...a: unknown[]) => mockAuthLogin(...a),
    saveToken: jest.fn(async (t: string) => {
      mockCalls.push("saveToken");
      // What was already persisted at the moment the token goes live.
      mockProfileAtTokenTime = await mockReadProfile();
      mockTokenValue = t;
    }),
    clearToken: jest.fn(async () => { mockCalls.push("clearToken"); mockTokenValue = null; }),
    getToken: jest.fn(async () => mockTokenValue),
    hasStoredToken: jest.fn(() => mockTokenValue !== null),
    getMe: (...a: unknown[]) => mockGetMe(...a),
    deleteMe: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock("../src/lib/offlineStorage", () => ({
  switchLocalUser: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../src/lib/careerCache", () => ({
  setCareerCacheIdentity: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../src/lib/deviceId", () => ({
  getOrCreateDeviceId: jest.fn(async () => "device-1"),
}));

let auth: any;
function Probe() {
  auth = useAuth();
  return <Text>{auth.user ? auth.user.id : "anon"}</Text>;
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const PROFILE_KEY = "@levelup_session_profile_v1";

async function mount() {
  render(<WebAuthProvider><Probe /></WebAuthProvider>);
  await waitFor(() => expect(auth?.loading).toBe(false));
}
async function login(id: string, provider = "email") {
  mockAuthLogin.mockResolvedValue({ token: `tok-${id}`, user: { id, email: `${id}@x.y`, auth_provider: provider } });
  await act(async () => { await auth.signInEmail("e", "p"); });
  await waitFor(() => expect(auth.user?.id).toBe(id));
}

beforeEach(async () => {
  mockReadProfile = () => AsyncStorage.getItem(PROFILE_KEY);
  mockCalls.length = 0;
  mockTokenValue = null;
  mockProfileAtTokenTime = null;
  auth = null;
  mockGetMe.mockReset();
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });
  await AsyncStorage.clear();
  await OfflineQueue.clear();
});

describe("web sign-in", () => {
  it("saves the session profile before the token and records the device owner", async () => {
    await mount();
    await login("u1");
    expect(mockCalls).toContain("saveToken");
    // Profile first, token second.
    expect(JSON.parse(mockProfileAtTokenTime as string).id).toBe("u1");
    expect((await getSavedSessionProfile<{ id: string }>())?.id).toBe("u1");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("u1");
  });

  it("a write made after login is queued (it was refused with no profile)", async () => {
    await mount();
    expect(await offlineWrite("/api/flags", "POST", { n: 0 })).toEqual({ queued: false, reason: "no_profile" });
    await login("u1");
    const result = await offlineWrite("/api/flags", "POST", { n: 1 });
    expect(result.queued).toBe(true);
    expect(OfflineQueue.getItems()[0].ownerId).toBe("u1");
  });

  it("restoring a saved session saves the profile, so writes queue without a fresh login", async () => {
    mockTokenValue = "stored-token";
    mockGetMe.mockResolvedValue({ id: "u7", email: "u7@x.y" });
    await mount();
    await waitFor(() => expect(auth.user?.id).toBe("u7"));
    expect((await getSavedSessionProfile<{ id: string }>())?.id).toBe("u7");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("u7");
    expect((await offlineWrite("/api/flags", "POST", { n: 1 })).queued).toBe(true);
  });

  it("a different account signing in after continue-later does not inherit the first one's data", async () => {
    await mount();
    await login("u1");
    await offlineWrite("/api/flags", "POST", { n: 1 });
    await AsyncStorage.setItem("@sifter_xp_v1", "u1-xp");
    await act(async () => { await auth.signOut({ preserveLocalUserState: true }); });
    // continue later keeps it all
    expect(OfflineQueue.pendingCount).toBe(1);
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBe("u1-xp");

    await login("u2");
    expect(OfflineQueue.pendingCount).toBe(0);
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBeNull();
  });
});

describe("web sign-out and deletion", () => {
  async function signedInWithData() {
    await mount();
    await login("u1");
    await offlineWrite("/api/flags", "POST", { n: 1 });
    await AsyncStorage.setItem("@sifter_xp_v1", "u1-xp");
    await AsyncStorage.setItem("sifter_cache_x", "{}");
    expect(OfflineQueue.pendingCount).toBe(1);
  }

  it("signOut clears the queue, cached reads, learner keys, profile and owner", async () => {
    await signedInWithData();
    await act(async () => { await auth.signOut(); });
    expect(auth.user).toBeNull();
    expect(OfflineQueue.pendingCount).toBe(0);
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBeNull();
    expect(await AsyncStorage.getItem("sifter_cache_x")).toBeNull();
    expect(await AsyncStorage.getItem(PROFILE_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
    expect(mockCalls).toContain("clearToken");
  });

  it("signOut with preserveLocalUserState keeps the unsent writes and learner data", async () => {
    await signedInWithData();
    await act(async () => { await auth.signOut({ preserveLocalUserState: true }); });
    expect(OfflineQueue.pendingCount).toBe(1);
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBe("u1-xp");
    expect(await AsyncStorage.getItem(PROFILE_KEY)).toBeNull();
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("u1");
  });

  it("deleteAccount clears them too", async () => {
    await signedInWithData();
    await act(async () => { await auth.deleteAccount(); });
    expect(auth.user).toBeNull();
    expect(OfflineQueue.pendingCount).toBe(0);
    expect(await AsyncStorage.getItem("@sifter_xp_v1")).toBeNull();
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
  });

  it("a refreshUser still in flight cannot bring the profile back after sign-out", async () => {
    await signedInWithData();
    let release!: (p: unknown) => void;
    mockGetMe.mockImplementationOnce(() => new Promise((r) => { release = r; }));
    let refresh!: Promise<void>;
    await act(async () => { refresh = auth.refreshUser(); });
    await act(async () => { await auth.signOut(); });
    await act(async () => { release({ id: "u1" }); await refresh; await flush(); });
    expect(auth.user).toBeNull();
    expect(await AsyncStorage.getItem(PROFILE_KEY)).toBeNull();
  });
});

describe("web forced logout", () => {
  it("clears device data when the token is removed in another tab", async () => {
    const handlers: Record<string, () => void> = {};
    const w = window as any;
    const g = globalThis as any;
    const hadDocument = "document" in g;
    const prevDocument = g.document;
    const prev = { wa: w.addEventListener, wr: w.removeEventListener };
    g.document = { addEventListener: jest.fn(), removeEventListener: jest.fn(), visibilityState: "visible" };
    w.addEventListener = (n: string, h: () => void) => { handlers[n] = h; };
    w.removeEventListener = jest.fn();
    try {
      await mount();
      await login("u1");
      await offlineWrite("/api/flags", "POST", { n: 1 });
      mockTokenValue = null; // another tab signed out
      await act(async () => { handlers.pageshow(); });
      await waitFor(() => expect(auth.user).toBeNull());
      await waitFor(() => expect(OfflineQueue.pendingCount).toBe(0));
      expect(await AsyncStorage.getItem(PROFILE_KEY)).toBeNull();
    } finally {
      w.addEventListener = prev.wa; w.removeEventListener = prev.wr;
      if (hadDocument) g.document = prevDocument; else delete g.document;
    }
  });
});
