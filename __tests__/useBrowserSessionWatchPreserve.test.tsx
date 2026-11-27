/**
 * Another tab's "continue later" sign-out removes the token too. The watcher in
 * the other tab must tell it from a forced logout: with the preserve marker it
 * clears React state only; without it (expiry, another device) it wipes as
 * before. It also replaces a stale tab's user when the stored token belongs to
 * a different account.
 */
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { render, waitFor, act } from "@testing-library/react-native";

import { useBrowserSessionWatch } from "../src/hooks/useBrowserSessionWatch";
import { OfflineQueue, offlineWrite } from "../src/lib/offlineQueue";
import { DEVICE_OWNER_KEY } from "../src/lib/localUserState";
import { saveSessionProfile, getSavedSessionProfile } from "../src/lib/sessionProfile";
import {
  beginSignOut,
  completeSignIn,
  completeSignOut,
} from "../src/lib/sessionLifecycle";
import { hasPreserveLocalState, hasExplicitLogout } from "../src/lib/logoutState";

let mockToken: string | null = null;

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
    getToken: jest.fn(async () => mockToken),
    hasStoredToken: jest.fn(() => mockToken !== null),
  },
}));
jest.mock("../src/lib/offlineStorage", () => ({ switchLocalUser: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../src/lib/careerCache", () => ({ setCareerCacheIdentity: jest.fn().mockResolvedValue(undefined) }));

const fakeJwt = (sub: string) =>
  `h.${Buffer.from(JSON.stringify({ sub })).toString("base64").replace(/=/g, "")}.s`;

const handlers: Record<string, (e?: unknown) => void> = {};
const g = globalThis as any;
const w = window as any;
let prev: any;

function Watcher({ user, onSignedOut, onForeignSession }: any) {
  useBrowserSessionWatch(user, { onSignedOut, onForeignSession });
  return null;
}

async function mountWatcher(userId = "dave") {
  const onSignedOut = jest.fn();
  const onForeignSession = jest.fn();
  render(<Watcher user={{ id: userId, auth_provider: "email" }} onSignedOut={onSignedOut} onForeignSession={onForeignSession} />);
  await waitFor(() => expect(handlers.storage).toBeDefined());
  return { onSignedOut, onForeignSession };
}

beforeEach(async () => {
  Object.keys(handlers).forEach((k) => delete handlers[k]);
  prev = { wa: w.addEventListener, wr: w.removeEventListener, doc: g.document, had: "document" in g };
  g.document = { addEventListener: jest.fn(), removeEventListener: jest.fn(), visibilityState: "visible" };
  w.addEventListener = (n: string, h: () => void) => { handlers[n] = h; };
  w.removeEventListener = jest.fn();
  mockToken = fakeJwt("dave");
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });
  await AsyncStorage.clear();
  await OfflineQueue.clear();
  await saveSessionProfile({ id: "dave" });
  expect((await offlineWrite("/api/flags", "POST", { n: 1 })).queued).toBe(true);
});
afterEach(() => {
  w.addEventListener = prev.wa;
  w.removeEventListener = prev.wr;
  if (prev.had) g.document = prev.doc; else delete g.document;
});

/** What tab 1 leaves behind for tab 2 when it signs out with "continue later". */
async function otherTabSignsOut(preserve: boolean) {
  await beginSignOut({ preserveLocalUserState: preserve });
  mockToken = null; // API.clearToken()
  await completeSignOut({ userId: "dave", preserveLocalUserState: preserve });
}

describe("cross-tab preserve marker", () => {
  it("a 'continue later' sign-out in another tab clears React state but keeps the queue, device owner and drafts", async () => {
    const { onSignedOut } = await mountWatcher();
    await otherTabSignsOut(true);
    await act(async () => { handlers.storage({ key: "sifter_auth_token_v2" }); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });

    expect(OfflineQueue.pendingCount).toBe(1);
    const stored = JSON.parse((await AsyncStorage.getItem("sifter_offline_queue")) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].ownerId).toBe("dave");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("dave");
  });

  it("the same applies to a bfcache pageshow after a preserve sign-out", async () => {
    const { onSignedOut } = await mountWatcher();
    await otherTabSignsOut(true);
    await act(async () => { handlers.pageshow(); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(OfflineQueue.pendingCount).toBe(1);
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("dave");
  });

  it("without the marker (token expired / removed elsewhere) the stored data is still wiped", async () => {
    const { onSignedOut } = await mountWatcher();
    mockToken = null; // no beginSignOut, no completeSignOut: just gone
    await act(async () => { handlers.storage({ key: "sifter_auth_token_v2" }); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    await waitFor(() => expect(OfflineQueue.pendingCount).toBe(0));
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBeNull();
    expect(await AsyncStorage.getItem("sifter_offline_queue")).toBeNull();
  });

  it("a full sign-out removes a stale marker, and the next sign-in clears it", async () => {
    await otherTabSignsOut(true);
    expect(await hasPreserveLocalState()).toBe(true);
    expect(await hasExplicitLogout()).toBe(true);
    await completeSignOut({ userId: "dave" }); // later: a real sign-out/deletion
    expect(await hasPreserveLocalState()).toBe(false);

    await otherTabSignsOut(true);
    await completeSignIn({ id: "erin" });
    expect(await hasPreserveLocalState()).toBe(false);
    expect(await hasExplicitLogout()).toBe(false);
  });
});

describe("stale tab whose token now belongs to another account", () => {
  it("replaces the user (state only) and re-reads the session, without wiping the new account's data", async () => {
    const { onSignedOut, onForeignSession } = await mountWatcher("dave");
    mockToken = fakeJwt("erin"); // another tab signed erin in; this tab missed the event
    await saveSessionProfile({ id: "erin" });
    await act(async () => { handlers.pageshow(); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    await waitFor(() => expect(onForeignSession).toHaveBeenCalled(), { timeout: 3000 });
    expect((await getSavedSessionProfile<{ id: string }>())?.id).toBe("erin");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("erin");
  });

  it("leaves a matching token alone", async () => {
    const { onSignedOut } = await mountWatcher("dave");
    await act(async () => { handlers.pageshow(); });
    await act(async () => { await new Promise((r) => setTimeout(r, 30)); });
    expect(onSignedOut).not.toHaveBeenCalled();
  });
});
