import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { API } from "../../src/lib/api";
import { OfflineQueue } from "../../src/lib/offlineQueue";
import { getSavedSessionProfile, saveSessionProfile } from "../../src/lib/sessionProfile";
import { beginSignOut, completeSignIn, completeSignOut, isNetworkFailure, prepareSignIn, startSessionGuard } from "../../src/lib/sessionLifecycle";
import { recordDeviceOwner } from "../../src/lib/deviceOwner";
import { setCareerCacheIdentity } from "../../src/lib/careerCache";
import { useBrowserSessionWatch } from "../../src/hooks/useBrowserSessionWatch";

export type WebUser = {
  id: string;
  username?: string;
  first_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  email?: string;
  auth_provider?: string;
  account_type?: string;
  onboarding_completed?: boolean;
  settings?: Record<string, unknown>;
  [key: string]: unknown;
};

type WebAuth = {
  user: WebUser | null;
  loading: boolean;
  authGuest: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, profile?: Record<string, unknown>) => Promise<void>;
  signOut: (options?: { preserveLocalUserState?: boolean }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateActiveField: (fieldId: string, color: string) => Promise<void>;
  starknetLoading: boolean;
  starknetWallet: null;
  starknetReady: boolean;
  starknetWalletAddress: null;
  starknetWalletStatus: string;
  authTelegram: () => Promise<void>;
  authBaseWallet: () => Promise<void>;
  authStarknet: () => Promise<{ isNewUser: boolean; nextPath: string }>;
  quantTraderUnlocked: boolean;
  quantResearcherUnlocked: boolean;
  quantDeveloperUnlocked: boolean;
};

const TOKEN_KEY = "sifter_auth_token_v2";
const AuthContext = createContext<WebAuth | null>(null);
let restoreRequest: { token: string; promise: Promise<unknown> } | null = null;

function normalize(user: unknown): WebUser {
  return (user && typeof user === "object" ? user : {}) as WebUser;
}

function restoreProfileOnce(token: string) {
  // React StrictMode mounts the provider twice in development. Share the
  // same restore request so a slow /users/me call cannot hold two sessions
  // open or make the initial route appear to hang. It is shared only between
  // callers holding the SAME token: a restore started after another account
  // signed in must not receive the previous token's still-pending profile.
  if (!restoreRequest || restoreRequest.token !== token) {
    const entry: { token: string; promise: Promise<unknown> } = {
      token,
      promise: API.getMe().finally(() => {
        if (restoreRequest === entry) restoreRequest = null;
      }),
    };
    restoreRequest = entry;
  }
  return restoreRequest.promise;
}

/**
 * Same order as the native provider (src/hooks/useAuth.tsx), through the same
 * shared helpers: reconcile the device owner and save the profile BEFORE the
 * token (queued writes are owned by the saved profile's id), then the token.
 */
async function persistAuth(payload: { token: string; user: unknown }, setUser: (user: WebUser) => void) {
  const profile = normalize(payload.user);
  await prepareSignIn(profile);
  await API.saveToken(payload.token);
  await completeSignIn(profile);
  setUser(profile);
}

export function WebAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WebUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Bumped by every sign-in/out/delete so a restore or refresh that was still
  // waiting on getMe() cannot bring a stale profile back afterwards.
  const sessionEpoch = useRef(0);

  async function restoreSession() {
    const epoch = sessionEpoch.current;
    const token = await API.getToken();
    if (!token) return;
    // Another tab may sign out (or in) while getMe() is in flight; this tab's
    // epoch cannot see that, the stored token and logout marker can.
    const stillCurrent = await startSessionGuard(token, () => API.getToken());
    try {
      const profile = normalize(await restoreProfileOnce(token));
      if (epoch !== sessionEpoch.current || !(await stillCurrent())) return;
      await saveSessionProfile(profile); // also records the device owner
      if (epoch !== sessionEpoch.current || !(await stillCurrent())) return;
      await setCareerCacheIdentity(profile.id);
      if (epoch !== sessionEpoch.current || !(await stillCurrent())) return;
      setUser(profile);
    } catch (e) {
      if (epoch !== sessionEpoch.current) return;
      const message = (e as Error)?.message ?? "";
      if (message === "device_mismatch" || message === "device_required") {
        // The session was taken over by another device: a forced logout, so
        // the previous learner's data goes too (same as native).
        const stale = await getSavedSessionProfile<WebUser>();
        await beginSignOut(); // flag first: other tabs react to the token's removal
        await API.clearToken();
        await completeSignOut({ userId: stale?.id });
      } else if (isNetworkFailure(e)) {
        // Offline or a timeout: keep the token and show the cached session
        // rather than signing the learner out because the network is down.
        const cached = await getSavedSessionProfile<WebUser>();
        if (cached?.id && epoch === sessionEpoch.current && (await stillCurrent())) {
          await recordDeviceOwner(cached.id); // sessions saved before the owner key
          await setCareerCacheIdentity(cached.id);
          setUser(normalize(cached));
        }
      } else if ((e as { status?: number })?.status === 401) {
        // The server rejected the token itself: it is dead. Anything else
        // (5xx, unknown) is transient and must not discard a valid session.
        // The learner's unsent writes are theirs to keep (same as the 7-day
        // AUTH_HOLD in the queue): use the "continue later" path, with the
        // preserve marker written BEFORE the token goes so other tabs, which
        // react to its removal, leave the queue, owner and drafts alone. A
        // token another tab has replaced since is not this restore's to clear.
        const stale = await getSavedSessionProfile<WebUser>();
        if ((await API.getToken()) === token) {
          await beginSignOut({ preserveLocalUserState: true });
          await API.clearToken();
          await completeSignOut({ userId: stale?.id, preserveLocalUserState: true });
        }
      }
    }
  }

  useEffect(() => {
    let active = true;
    restoreSession().finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Hydrate the offline write queue once a profile is available (idempotent;
  // enqueue also hydrates lazily). Without a saved profile every offlineWrite
  // from shared components is refused.
  useEffect(() => {
    if (user?.id) void OfflineQueue.init().catch(() => {});
  }, [user?.id]);

  useBrowserSessionWatch(user, {
    onSignedOut: () => {
      sessionEpoch.current++;
      setUser(null);
    },
    onForeignSession: () => { void restoreSession(); },
  });

  const value = useMemo<WebAuth>(() => ({
    user,
    loading,
    authGuest: async () => { sessionEpoch.current++; await persistAuth(await API.authGuest(), setUser); },
    signInGuest: async () => { sessionEpoch.current++; await persistAuth(await API.authGuest(), setUser); },
    signInEmail: async (email, password) => { const data = await API.authLogin(email, password); sessionEpoch.current++; await persistAuth(data, setUser); },
    signUpEmail: async (email, password, profile = {}) => { const data = await API.authSignup(email, password, profile); sessionEpoch.current++; await persistAuth(data, setUser); },
    signOut: async (options = {}) => {
      sessionEpoch.current++;
      await beginSignOut(options);
      await API.clearToken();
      await completeSignOut({ userId: user?.id, preserveLocalUserState: options.preserveLocalUserState });
      setUser(null);
    },
    deleteAccount: async () => {
      try {
        await API.deleteMe();
      } finally {
        sessionEpoch.current++;
        await beginSignOut();
        await API.clearToken();
        await completeSignOut({ userId: user?.id });
        setUser(null);
      }
    },
    refreshUser: async () => {
      const epoch = sessionEpoch.current;
      try {
        const stillCurrent = await startSessionGuard(await API.getToken(), () => API.getToken());
        const profile = normalize(await API.getMe());
        if (epoch !== sessionEpoch.current || !(await stillCurrent())) return;
        await saveSessionProfile(profile);
        if (epoch !== sessionEpoch.current || !(await stillCurrent())) return;
        setUser(profile);
      } catch {}
    },
    updateActiveField: async (fieldId, color) => { await API.updateMe({ active_field_id: fieldId, active_field_color: color }); setUser((current) => current ? { ...current, active_field_id: fieldId, active_field_color: color } : current); },
    starknetLoading: false,
    starknetWallet: null,
    starknetReady: false,
    starknetWalletAddress: null,
    starknetWalletStatus: "unavailable",
    authTelegram: async () => { throw new Error("Telegram sign-in is not available in the browser adapter yet."); },
    authBaseWallet: async () => { throw new Error("Wallet sign-in is not available in the browser adapter yet."); },
    authStarknet: async () => { throw new Error("Starknet sign-in is not available in the browser adapter yet."); },
    quantTraderUnlocked: true,
    quantResearcherUnlocked: true,
    quantDeveloperUnlocked: false,
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within WebAuthProvider");
  return value;
}

export { TOKEN_KEY };
