/**
 * Sifter LevelUp - useAuth
 *
 * Full UserProfile with all upgrade fields.
 * Adds: starknet auth, active field, track context,
 * device registration, xp_stage, merch_credits.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API, API_BASE } from '../lib/api';
import { getOrCreateDeviceId, onLoginSync, switchLocalUser } from '../lib/offlineStorage';
import { flushQueue, setCareerCacheIdentity } from '../lib/careerCache';
import { logger } from '../lib/logger';
import { setPendingPostAuthRedirect } from '../lib/postAuthRedirect';
import { resolvePostAuthHref } from '../lib/resumeNavigation';
import { clearExplicitLogout, hasExplicitLogout, markExplicitLogout } from '../lib/logoutState';
import { clearLocalUserState } from '../lib/localUserState';
import { clearSessionProfile, getSavedSessionProfile, saveSessionProfile } from '../lib/sessionProfile';
import type { StarkzapWallet } from '../lib/starkzap';
import {
  StarknetWalletBridgeProvider,
  useStarknetWalletBridge,
} from '../components/auth/StarknetWalletBridge';
import { PrivyStarknetBootstrap } from '../components/auth/PrivyStarknetBootstrap';
import { PRIVY_ENABLED } from '../lib/config';
import { getLegalAcceptance, LEGAL_ACCEPTANCE_KEY } from '../lib/legal';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  auth_provider: string;
  /** Discriminates the student app from the institutional/admin side. Legacy
   *  completed accounts may omit it until they choose a persona. */
  account_type?: 'pending' | 'student' | 'educator' | 'institution_admin';
  account_type_selected_at?: string | null;
  email: string;
  points: number;
  streak: number;
  current_level: number;
  completed_levels: string[];
  perfect_levels: string[];
  python_chapters_completed: string[];
  active_track: string;
  active_field_id?: string;
  active_field_color?: string;
  current_track_id?: string;
  current_track_name?: string;
  activeFieldId: string;
  activeFieldColor?: string;
  currentTrackId: string;
  currentTrackName: string;
  currentFieldId: string;
  xp_stage: number;
  starknet_address?: string;
  starknet_wallet_id?: string;
  starknet_public_key?: string;
  starknet_auth?: boolean;
  starknet_email?: string;
  guild_id: string | null;
  guild_role?: string;
  achievements: string[];
  merch_credits: number;
  token_balance: number;
  token_currency: string;
  cash_balance_cents: number;
  badges: any[];
  boosters: Record<string, number>;
  is_verified: boolean;
  settings: Record<string, any>;
  onboarding_completed?: boolean;
  last_position?: any;
  created_at?: string;
  last_login?: string;
  last_played?: string;
  totalXp?: number;
  completedLevels?: string[];
  active_challenge_id?: string;
  challenge_room_ids?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  authTelegram: (initData: string) => Promise<void>;
  authBaseWallet: (address: string, signature: string, message: string) => Promise<void>;
  authGuest: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, profile?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    date_of_birth?: string;
    email_code?: string;
  }) => Promise<void>;
  authStarknet: (email: string, starknetAddress?: string, privyAccessToken?: string) => Promise<{
    isNewUser: boolean;
    nextPath: string;
  }>;
  starknetLoading: boolean;
  starknetWallet: StarkzapWallet | null;
  starknetReady: boolean;
  starknetWalletAddress: string | null;
  starknetWalletStatus: string;
  signOut: (options?: { preserveLocalUserState?: boolean }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateActiveField: (fieldId: string, color: string, trackId?: string, trackName?: string) => Promise<void>;
  quantTraderUnlocked: boolean;
  quantResearcherUnlocked: boolean;
  quantDeveloperUnlocked: boolean;
}

type BridgeState = {
  wallet: StarkzapWallet | null;
  address: string | null;
  status: string;
  connectionMode: 'sponsored' | 'self-paid' | null;
  ready: boolean;
};

const EMPTY_BRIDGE_STATE: BridgeState = {
  wallet: null,
  address: null,
  status: 'unavailable',
  connectionMode: null,
  ready: false,
};

const AuthContext = createContext<AuthContextType | null>(null);

function StarknetBridgeStateSync({
  onChange,
}: {
  onChange: (state: BridgeState) => void;
}) {
  const bridge = useStarknetWalletBridge();

  useEffect(() => {
    onChange({
      wallet: bridge.wallet,
      address: bridge.address,
      status: bridge.status,
      connectionMode: bridge.connectionMode,
      ready: bridge.ready,
    });
  }, [bridge.address, bridge.connectionMode, bridge.ready, bridge.status, bridge.wallet, onChange]);

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [starknetLoading, setStarknetLoading] = useState(false);
  const [bridgeState, setBridgeState] = useState<BridgeState>(EMPTY_BRIDGE_STATE);

  useEffect(() => {
    void _tryLoadSavedSession();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    const flushWhenOnline = (state: { isConnected?: boolean | null; isInternetReachable?: boolean | null }) => {
      if (!active || state.isConnected === false || state.isInternetReachable === false) return;
      void flushQueue().catch(() => {
        // The queue deliberately remains encrypted and pending for the next
        // reconnect or foreground opportunity.
      });
    };
    const unsubscribe = NetInfo.addEventListener(flushWhenOnline);
    void NetInfo.fetch().then(flushWhenOnline).catch(() => {});
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.id]);

  useEffect(() => {
    // Feature-detect, don't infer from `typeof window`. React Native defines a
    // `window` global WITHOUT addEventListener, so a bare existence check
    // passes on native and then throws
    // "window.addEventListener is not a function" for every signed-in user.
    // The same is true under the jest react-native environment.
    if (
      !user ||
      typeof window === "undefined" ||
      typeof window.addEventListener !== "function" ||
      typeof document === "undefined" ||
      typeof document.addEventListener !== "function"
    ) {
      return;
    }

    let active = true;
    let reconciling = false;
    const reconcileBrowserRestore = async () => {
      // A Back/Forward navigation can restore an authenticated React tree
      // from browser cache after sign-out. Re-check storage whenever that
      // happens; the token, not the restored in-memory profile, is authoritative.
      if (!active || reconciling) return;
      const stored = API.hasStoredToken();
      const token = stored === false ? null : await API.getToken();
      if (!active || token) return;

      // Offline guest mode intentionally has no token. It is only invalidated
      // here when the user explicitly signed out; real guest sessions have a
      // token and therefore still pass the authoritative check above.
      if (user.auth_provider === "guest" && !(await hasExplicitLogout())) return;

      reconciling = true;
      const userId = user.id;
      // Clear React state before awaiting storage cleanup so a restored screen
      // cannot remain visible during the browser-history transition.
      setUser(null);
      try {
        await Promise.all([
          clearSessionProfile(),
          markExplicitLogout(),
          clearLocalUserState(userId),
        ]);
        await switchLocalUser('__signed_out__');
      } finally {
        reconciling = false;
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === "sifter_auth_token_v2") void reconcileBrowserRestore();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void reconcileBrowserRestore();
    };

    window.addEventListener("pageshow", reconcileBrowserRestore);
    window.addEventListener("popstate", reconcileBrowserRestore);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.removeEventListener("pageshow", reconcileBrowserRestore);
      window.removeEventListener("popstate", reconcileBrowserRestore);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user]);

  async function _tryLoadSavedSession() {
    const token = await API.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await API.getMe() as UserProfile;
      const normalized = _normalise(profile);
      await saveSessionProfile(normalized);
      await setCareerCacheIdentity(normalized.id);
      setUser(normalized);
      API.checkStreak().catch(() => {});
      onLoginSync(profile.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
    } catch (e) {
      const message = (e as Error)?.message ?? "";
      if (message === "device_mismatch" || message === "device_required") {
        await API.clearToken();
        await markExplicitLogout();
      } else if (e instanceof TypeError || /failed to fetch|network request failed|network error|request took too long|timed out/i.test(message)) {
        // Keep the current route and local onboarding draft available during a
        // temporary API outage. A real 401 still falls through to sign-in.
        const cached = await getSavedSessionProfile<UserProfile>();
        if (cached?.id) {
          await setCareerCacheIdentity(cached.id);
          setUser(_normalise(cached));
          onLoginSync(cached.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
        }
      }
      // No saved session, expired token, or device session was transferred.
    } finally {
      setLoading(false);
    }
  }

  async function _handleAuthResponse(data: { token: string; user: any }) {
    await API.saveToken(data.token);
    await clearLocalUserState();
    await clearExplicitLogout();
    const profile = _normalise(data.user);
    await saveSessionProfile(profile);
    await switchLocalUser(profile.id);
    await setCareerCacheIdentity(profile.id);
    setPendingPostAuthRedirect(
      profile.onboarding_completed ? resolvePostAuthHref(profile) : null,
      profile.id,
    );
    setUser(profile);
    API.checkStreak().catch(() => {});

    const deviceId = await getOrCreateDeviceId();
    API.updateMe({ device_id: deviceId }).catch(() => {});

    const token = await API.getToken();
    onLoginSync(profile.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
  }

  async function authTelegram(initData: string) {
    const data = await API.authTelegram(initData);
    await _handleAuthResponse(data);
  }

  async function authBaseWallet(address: string, signature: string, message: string) {
    const data = await API.authBaseWallet(address, signature, message);
    await _handleAuthResponse(data);
  }

  /**
   * Guest sign-in.
   *
   * Calls POST /api/auth/guest so the session is REAL: a users row, a JWT, and
   * an active_sessions row for this device. This used to fabricate a profile
   * client-side ("local-first guest: no backend required") and stop there: no
   * token was ever issued, so every request went out unauthenticated. Guest is
   * the web app's main entry point, so in practice that meant /api/users/me
   * 401'd on every boot, anything behind auth was dead, and only the handful of
   * public endpoints (career search) worked at all.
   *
   * The local profile survives as a FALLBACK, not the happy path: if the
   * network is unreachable the app still opens in a browsable state, which is
   * what the original local-first intent was actually protecting. It just can't
   * be the normal case, because it silently downgrades every logged-in feature.
   */
  async function authGuest() {
    try {
      const data = await API.authGuest();
      await _handleAuthResponse(data);
      return;
    } catch (e) {
      logger.warn('Guest session could not be created on the server; opening offline guest', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
    const guestProfile = _normalise({
      id: `guest_${Date.now()}`,
      username: 'Guest',
      auth_provider: 'guest',
      email: '',
      onboarding_completed: true,
    });
    setUser(guestProfile);
  }

  async function signInEmail(email: string, password: string) {
    const data = await API.authLogin(email, password);
    await _handleAuthResponse(data);
  }

  async function signUpEmail(email: string, password: string, profile?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    date_of_birth?: string;
    email_code?: string;
    terms_version?: string;
    privacy_version?: string;
    analytics_consent?: boolean;
  }) {
    const acceptance = await getLegalAcceptance();
    if (!acceptance) {
      throw new Error('Review and accept the current Terms and Privacy Policy before creating an account.');
    }
    const data = await API.authSignup(email, password, {
      ...profile,
      terms_version: acceptance.termsVersion,
      privacy_version: acceptance.privacyVersion,
      analytics_consent: acceptance.analyticsConsent,
    });
    // Record the acceptance before publishing the new user to React state. That
    // prevents the authenticated legal gate from flashing over a just-created
    // account while the server record is still being written.
    try {
      await API.saveToken(data.token);
      await API.recordLegalAcceptance(acceptance);
      data.user = {
        ...data.user,
        settings: {
          ...(data.user?.settings ?? {}),
          legalAcceptance: acceptance,
        },
      };
      await AsyncStorage.removeItem(LEGAL_ACCEPTANCE_KEY);
    } catch {
      // Keep the versioned device record for a later retry.
    }
    await _handleAuthResponse(data);
  }

  async function authStarknet(email: string, starknetAddress?: string, privyAccessToken?: string) {
    if (!privyAccessToken) {
      throw new Error('Privy Starknet auth requires a live Privy session.');
    }

    setStarknetLoading(true);
    try {
      const currentToken = user?.id ? await API.getToken() : null;
      const res = await fetch(`${API_BASE}/api/starknet/auth/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
        body: JSON.stringify({
          email,
          privy_token: privyAccessToken,
          ...(starknetAddress ? { starknet_address: starknetAddress } : {}),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Starknet auth failed (${res.status}): ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      const payload = data.data ?? data;
      if (!payload?.token || !payload?.user) {
        throw new Error('Starknet auth response was missing the Sifter session payload.');
      }

      const isNewUser = Boolean(payload.is_new_user);
      const nextPath = resolvePostAuthHref(payload.user);
      await _handleAuthResponse({ token: payload.token, user: payload.user });
      return { isNewUser, nextPath };
    } catch (error) {
      setPendingPostAuthRedirect(null);
      throw error;
    } finally {
      setStarknetLoading(false);
    }
  }

  async function signOut(options: { preserveLocalUserState?: boolean } = {}) {
    await API.clearToken();
    await clearSessionProfile();
    await markExplicitLogout();
    if (!options.preserveLocalUserState) {
      await clearLocalUserState(user?.id);
    }
    await setCareerCacheIdentity(null);
    await switchLocalUser('__signed_out__');
    setUser(null);
  }

  async function deleteAccount() {
    try {
      await API.deleteMe();
    } finally {
      await API.clearToken();
      await clearSessionProfile();
      await markExplicitLogout();
      await clearLocalUserState(user?.id);
      await setCareerCacheIdentity(null);
      setUser(null);
    }
  }

  async function refreshUser() {
    try {
      const profile = await API.getMe() as UserProfile;
      const normalized = _normalise(profile);
      await saveSessionProfile(normalized);
      setUser(normalized);
    } catch {
      // Ignore transient refresh failures.
    }
  }

  async function updateActiveField(
    fieldId: string,
    color: string,
    trackId?: string,
    trackName?: string,
  ) {
    const updates: Partial<UserProfile> = {
      active_field_id: fieldId,
      active_field_color: color,
    };
    if (trackId) {
      updates.current_track_id = trackId;
    }
    if (trackName) {
      updates.current_track_name = trackName;
    }

    await API.updateMe(updates);
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));

    try {
      await (API as any).post('/api/users/active-field', updates);
    } catch {
      // Best effort only.
    }
  }

  const quantTraderUnlocked = true;
  const quantResearcherUnlocked = true;
  const quantDeveloperUnlocked = (user?.python_chapters_completed?.length ?? 0) >= 5;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authTelegram,
        authBaseWallet,
        authGuest,
        signInGuest: authGuest,
        signInEmail,
        signUpEmail,
        authStarknet,
        signOut,
        deleteAccount,
        refreshUser,
        updateActiveField,
        starknetLoading,
        starknetWallet: bridgeState.wallet,
        starknetReady: bridgeState.ready,
        starknetWalletAddress: bridgeState.address,
        starknetWalletStatus: bridgeState.status,
        quantTraderUnlocked,
        quantResearcherUnlocked,
        quantDeveloperUnlocked,
      }}
    >
      <StarknetWalletBridgeProvider
        preferredAddress={user?.starknet_address ?? null}
        preferredWalletId={user?.starknet_wallet_id ?? null}
        preferredPublicKey={user?.starknet_public_key ?? null}
      >
        <StarknetBridgeStateSync onChange={setBridgeState} />
        {PRIVY_ENABLED ? <PrivyStarknetBootstrap user={user} refreshUser={refreshUser} /> : null}
        {children}
      </StarknetWalletBridgeProvider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

function _normalise(raw: any): UserProfile {
  const currentTrackId = String(
    raw.current_track_id ?? raw.currentTrackId ?? raw.active_track ?? raw.activeTrack ?? 'crypto',
  );
  const currentTrackName = String(raw.current_track_name ?? raw.currentTrackName ?? currentTrackId);
  const activeFieldId = String(
    raw.active_field_id
      ?? raw.activeFieldId
      ?? raw.current_field_id
      ?? raw.currentFieldId
      ?? (currentTrackId.split('-').slice(0, -1).join('-') || currentTrackId)
      ?? currentTrackId,
  );
  const activeFieldColor = raw.active_field_color ?? raw.activeFieldColor;

  return {
    id: raw.id ?? '',
    username: raw.username ?? 'Student',
    avatar_url: raw.avatar_url ?? null,
    auth_provider: raw.auth_provider ?? 'guest',
    account_type: raw.account_type,
    account_type_selected_at: raw.account_type_selected_at ?? null,
    email: raw.email ?? '',
    points: raw.points ?? 0,
    streak: raw.streak ?? 0,
    current_level: raw.current_level ?? 1,
    completed_levels: raw.completed_levels ?? [],
    perfect_levels: raw.perfect_levels ?? [],
    python_chapters_completed: raw.python_chapters_completed ?? [],
    active_track: raw.active_track ?? currentTrackId ?? 'crypto',
    active_field_id: activeFieldId,
    active_field_color: activeFieldColor,
    current_track_id: currentTrackId,
    current_track_name: currentTrackName,
    activeFieldId,
    activeFieldColor,
    currentTrackId,
    currentTrackName,
    currentFieldId: activeFieldId,
    xp_stage: raw.xp_stage ?? 1,
    starknet_address: raw.starknet_address,
    starknet_wallet_id: raw.starknet_wallet_id,
    starknet_public_key: raw.starknet_public_key,
    starknet_auth: raw.starknet_auth ?? false,
    starknet_email: raw.starknet_email,
    guild_id: raw.guild_id ?? null,
    guild_role: raw.guild_role,
    achievements: raw.achievements ?? [],
    merch_credits: raw.merch_credits ?? 0,
    token_balance: raw.token_balance ?? 0,
    token_currency: raw.token_currency ?? 'USD',
    cash_balance_cents: raw.cash_balance_cents ?? 0,
    badges: raw.badges ?? [],
    boosters: raw.boosters ?? {},
    is_verified: raw.is_verified ?? false,
    settings: raw.settings ?? {},
    onboarding_completed: raw.onboarding_completed ?? false,
    last_position: raw.last_position,
    created_at: raw.created_at,
    last_login: raw.last_login,
    last_played: raw.last_played,
    totalXp: raw.points ?? 0,
    completedLevels: raw.completed_levels ?? [],
    active_challenge_id: raw.active_challenge_id,
    challenge_room_ids: raw.challenge_room_ids ?? [],
  };
}

