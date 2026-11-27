/**
 * Another tab's "continue later" sign-out removes the token too. The watcher in
 * the other tab must tell it from a forced logout: with the preserve marker it
 * clears React state only; without it (expiry, another device) it wipes as
 * before. It also replaces a stale tab's user when the stored token belongs to
 * a different account.
 */
import React, { useState } from "react";
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
/** When set, getToken answers from this script first (one entry per call). */
let mockTokenScript: (string | null)[] = [];

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
    getToken: jest.fn(async () => (mockTokenScript.length ? mockTokenScript.shift()! : mockToken)),
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
  mockTokenScript = [];
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

/** A real provider-like owner: onSignedOut clears the user, as both providers do. */
function StatefulWatcher({ initial, onSignedOut, onForeignSession }: any) {
  const [user, setUser] = useState<any>(initial);
  useBrowserSessionWatch(user, {
    onSignedOut: () => { onSignedOut(); setUser(null); },
    onForeignSession,
  });
  return null;
}
async function mountStateful(initial: any) {
  const onSignedOut = jest.fn();
  const onForeignSession = jest.fn();
  render(<StatefulWatcher initial={initial} onSignedOut={onSignedOut} onForeignSession={onForeignSession} />);
  await waitFor(() => expect(handlers.storage).toBeDefined());
  return { onSignedOut, onForeignSession };
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("adopting another tab's session (stateful user)", () => {
  it("a stale tab re-reads the session even though onSignedOut cleared its user", async () => {
    const { onSignedOut, onForeignSession } = await mountStateful({ id: "dave", auth_provider: "email" });
    mockToken = fakeJwt("erin"); // erin signed in in another tab
    await saveSessionProfile({ id: "erin" });
    await act(async () => { handlers.storage({ key: "sifter_auth_token_v2" }); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    await act(async () => { await sleep(1300); });
    expect(onForeignSession).toHaveBeenCalledTimes(1);
  });

  it("a signed-out tab adopts a session that appears in storage", async () => {
    const { onSignedOut, onForeignSession } = await mountStateful(null);
    mockToken = fakeJwt("erin");
    await saveSessionProfile({ id: "erin" });
    await act(async () => { handlers.storage({ key: "sifter_auth_token_v2" }); });
    await act(async () => { await sleep(1300); });
    expect(onForeignSession).toHaveBeenCalledTimes(1);
    expect(onSignedOut).not.toHaveBeenCalled();
  });

  it("a signed-out tab does not adopt while its own explicit sign-out marker is set", async () => {
    const { onForeignSession } = await mountStateful(null);
    await beginSignOut();
    mockToken = fakeJwt("erin");
    await saveSessionProfile({ id: "erin" });
    await act(async () => { handlers.storage({ key: "sifter_auth_token_v2" }); });
    await act(async () => { await sleep(1300); });
    expect(onForeignSession).not.toHaveBeenCalled();
  });

  it("a signed-out tab does not adopt a token that has no saved profile", async () => {
    const { onForeignSession } = await mountStateful(null);
    await AsyncStorage.clear();
    mockToken = fakeJwt("erin");
    await act(async () => { handlers.pageshow(); });
    await act(async () => { await sleep(1300); });
    expect(onForeignSession).not.toHaveBeenCalled();
  });
});

describe("a sign-in landing during another tab's clean-up", () => {
  it("does not wipe the new account's profile, queue owner or marker", async () => {
    const { onSignedOut } = await mountWatcher("dave");
    // reconcile: stored token check (null), `again` (null), then the guard
    // before the first destructive step sees erin's fresh token.
    mockTokenScript = [null, null, fakeJwt("erin")];
    mockToken = fakeJwt("erin");
    await saveSessionProfile({ id: "erin" });
    await AsyncStorage.setItem(DEVICE_OWNER_KEY, "erin");
    await act(async () => { handlers.pageshow(); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
    await act(async () => { await sleep(50); });
    expect((await getSavedSessionProfile<{ id: string }>())?.id).toBe("erin");
    expect(await AsyncStorage.getItem(DEVICE_OWNER_KEY)).toBe("erin");
    expect(await hasExplicitLogout()).toBe(false);
  });
});

describe("guest tab and the explicit sign-out flag", () => {
  it("a guest tab reacts to the token's removal once beginSignOut has written the flag", async () => {
    const onSignedOut = jest.fn();
    render(<Watcher user={{ id: "g1", auth_provider: "guest" }} onSignedOut={onSignedOut} onForeignSession={jest.fn()} />);
    await waitFor(() => expect(handlers.storage).toBeDefined());
    mockToken = null;
    await act(async () => { handlers.pageshow(); });
    await act(async () => { await sleep(50); });
    expect(onSignedOut).not.toHaveBeenCalled(); // no flag yet: an offline guest

    await beginSignOut(); // tab 1: flag first, then the token is cleared
    await act(async () => { handlers.storage({ key: "sifter_auth_token_v2" }); });
    await waitFor(() => expect(onSignedOut).toHaveBeenCalled());
  });

  it("beginSignOut writes the explicit-logout flag (and the preserve marker when asked)", async () => {
    await beginSignOut();
    expect(await hasExplicitLogout()).toBe(true);
    expect(await hasPreserveLocalState()).toBe(false);
    await beginSignOut({ preserveLocalUserState: true });
    expect(await hasPreserveLocalState()).toBe(true);
  });
});
