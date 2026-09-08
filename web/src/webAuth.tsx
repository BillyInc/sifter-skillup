import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { API } from "../../src/lib/api";

export type WebUser = {
  id: string;
  username?: string;
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
  signOut: () => Promise<void>;
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
let restorePromise: Promise<unknown> | null = null;

function normalize(user: unknown): WebUser {
  return (user && typeof user === "object" ? user : {}) as WebUser;
}

function restoreProfileOnce() {
  // React StrictMode mounts the provider twice in development. Share the
  // same restore request so a slow /users/me call cannot hold two sessions
  // open or make the initial route appear to hang.
  if (!restorePromise) {
    restorePromise = API.getMe().finally(() => {
      restorePromise = null;
    });
  }
  return restorePromise;
}

async function persistAuth(payload: { token: string; user: unknown }, setUser: (user: WebUser) => void) {
  await API.saveToken(payload.token);
  setUser(normalize(payload.user));
}

export function WebAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WebUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    API.getToken().then(async (token) => {
      if (!token) return;
      try {
        const profile = await restoreProfileOnce();
        if (active) setUser(normalize(profile));
      } catch {
        await API.clearToken();
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo<WebAuth>(() => ({
    user,
    loading,
    authGuest: async () => persistAuth(await API.authGuest(), setUser),
    signInGuest: async () => persistAuth(await API.authGuest(), setUser),
    signInEmail: async (email, password) => persistAuth(await API.authLogin(email, password), setUser),
    signUpEmail: async (email, password, profile = {}) => persistAuth(await API.authSignup(email, password, profile), setUser),
    signOut: async () => { await API.clearToken(); setUser(null); },
    deleteAccount: async () => { try { await API.deleteMe(); } finally { await API.clearToken(); setUser(null); } },
    refreshUser: async () => { try { setUser(normalize(await API.getMe())); } catch {} },
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
