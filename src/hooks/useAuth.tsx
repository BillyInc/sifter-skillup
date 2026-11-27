/**
 * Sifter LevelUp - useAuth
 *
 * Full UserProfile with all upgrade fields.
 * Adds: starknet auth, active field, track context,
 * device registration, xp_stage, merch_credits.
 */

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API, API_BASE } from '../lib/api';
import { getOrCreateDeviceId, onLoginSync } from '../lib/offlineStorage';
import { flushQueue, setCareerCacheIdentity } from '../lib/careerCache';
import { logger } from '../lib/logger';
import { setPendingPostAuthRedirect } from '../lib/postAuthRedirect';
import { resolvePostAuthHref } from '../lib/resumeNavigation';
import { OfflineQueue } from '../lib/offlineQueue';
import { reconcileDeviceOwner, clearLocalUserState } from '../lib/localUserState';
import { clearSessionProfile, getSavedSessionProfile, saveSessionProfile } from '../lib/sessionProfile';
import { recordDeviceOwner } from '../lib/deviceOwner';
import { completeSignIn, completeSignOut, prepareSignIn } from '../lib/sessionLifecycle';
import { useBrowserSessionWatch } from './useBrowserSessionWatch';
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
  /** Given name captured at sign-up; used only as a display-name fallback. */
  first_name?: string | null;
  /** Optional name the user chose to be shown; absent when the backend predates it. */
  display_name?: string | null;
  avatar_url: string | null;
  /** Short-lived signed URL for the owner's uploaded photo; absent for presets/none. */
  avatar_display_url?: string | null;
  auth_provider: string;
  /** Discriminates the student app from the institutional/admin side. Legacy
   *  completed accounts may omit it until they choose a persona. */
  account_type?: 'pending' | 'student' | 'educator' | 'institution_admin';
  account_type_selected_at?: string | null;
  /** Read-only server-provided flag; the API remains the authorization authority. */
  is_internal_staff?: boolean;
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
    display_name?: string;
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
  // Bumped by every sign-in, sign-out and deletion. A restore or refresh that
  // was already waiting on getMe() when one of those happened must not save
  // its (now stale) profile or publish its user afterwards.
  const sessionEpoch = useRef(0);

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
    // Hydrate the offline write queue and start its connectivity watcher once a
    // profile is available (init is idempotent; enqueue also hydrates lazily).
    if (user?.id) void OfflineQueue.init().catch(() => {});
  }, [user?.id]);

  useBrowserSessionWatch(user, {
    onSignedOut: () => {
      sessionEpoch.current++;
      setUser(null);
    },
    onForeignSession: () => {
      void _tryLoadSavedSession();
    },
  });

  async function _tryLoadSavedSession() {
    const epoch = sessionEpoch.current;
    const token = await API.getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await API.getMe() as UserProfile;
      // Signed out, deleted or signed in as someone else while getMe() was in
      // flight: this profile is stale.
      if (epoch !== sessionEpoch.current) return;
      const normalized = _normalise(profile);
      await saveSessionProfile(normalized); // also records the device owner
      if (epoch !== sessionEpoch.current) return;
      await setCareerCacheIdentity(normalized.id);
      if (epoch !== sessionEpoch.current) return;
      setUser(normalized);
      API.checkStreak().catch(() => {});
      onLoginSync(profile.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
    } catch (e) {
      if (epoch !== sessionEpoch.current) return;
      const message = (e as Error)?.message ?? "";
      if (message === "device_mismatch" || message === "device_required") {
        // The session was taken over by another device: this is a forced
        // logout like any other, so the previous learner's data goes too.
        const stale = await getSavedSessionProfile<UserProfile>();
        await API.clearToken();
        await completeSignOut({ userId: stale?.id });
      } else if (e instanceof TypeError || /failed to fetch|network request failed|network error|request took too long|timed out/i.test(message)) {
        // Keep the current route and local onboarding draft available during a
        // temporary API outage. A real 401 still falls through to sign-in.
        const cached = await getSavedSessionProfile<UserProfile>();
        if (cached?.id && epoch === sessionEpoch.current) {
          // Sessions saved before the owner key existed get one now.
          await recordDeviceOwner(cached.id);
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
    sessionEpoch.current++;
    const profile = _normalise(data.user);
    // Profile first, token second: queued writes are owned by the stored
    // profile's id, so the new token must never be live while the previous
    // account's profile is still stored (the drain also checks the token's
    // subject against the item owner). prepareSignIn also reconciles the
    // device owner (see reconcileDeviceOwner for the guest rule).
    await prepareSignIn(profile);
    await API.saveToken(data.token);
    await completeSignIn(profile);
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
    // The previous account's session (an expired token, or a "continue later"
    // profile) must not become the guest's: its profile would own the guest's
    // queued writes (later sent with that account's token) and its cached
    // data would stay on screen. Reconcile as a guest (clears the unscoped
    // data, keeps that account's unsent writes), drop the old token and
    // profile, and save no profile for the guest: with no owner, writes are
    // refused instead of being queued where nothing could ever send them.
    sessionEpoch.current++;
    await clearLocalUserState();
    await reconcileDeviceOwner(guestProfile.id, { guest: true });
    await API.clearToken();
    await clearSessionProfile();
    await completeSignIn(guestProfile);
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
    display_name?: string;
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
    // Profile first, as in _handleAuthResponse: the token is not stored while
    // the previous account's profile still is.
    await prepareSignIn(_normalise(data.user));
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
    sessionEpoch.current++;
    await API.clearToken();
    await completeSignOut({
      userId: user?.id,
      preserveLocalUserState: options.preserveLocalUserState,
    });
    setUser(null);
  }

  async function deleteAccount() {
    try {
      await API.deleteMe();
    } finally {
      sessionEpoch.current++;
      await API.clearToken();
      await completeSignOut({ userId: user?.id });
      setUser(null);
    }
  }

  async function refreshUser() {
    const epoch = sessionEpoch.current;
    try {
      const profile = await API.getMe() as UserProfile;
      // A sign-out/sign-in finished while this was in flight: do not bring
      // the old account's profile back.
      if (epoch !== sessionEpoch.current) return;
      const normalized = _normalise(profile);
      await saveSessionProfile(normalized); // also records the device owner
      if (epoch !== sessionEpoch.current) return;
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

    // _normalise emits BOTH key shapes for these fields — active_field_id and
    // activeFieldId, current_track_id and currentTrackId — and consumers read
    // the camelCase mirrors. The three track screens guard on
    // user.currentTrackId before calling this, so merging only the snake_case
    // keys left that mirror stale: the guard never became true, and because
    // updateActiveField is a fresh identity on every render and sits in those
    // effects' dependency arrays, setUser re-rendered and re-fired the effect.
    // Two requests per iteration, for as long as the screen stayed mounted.
    // Keep this in step with the camelCase fields _normalise returns.
    const mirrors: Partial<UserProfile> = {
      activeFieldId: fieldId,
      activeFieldColor: color,
      ...(trackId ? { currentTrackId: trackId } : {}),
      ...(trackName ? { currentTrackName: trackName } : {}),
    };

    setUser((prev) => (prev ? { ...prev, ...updates, ...mirrors } : prev));

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
    first_name: raw.first_name ?? null,
    // Keep `undefined` when the API omits it so the UI can feature-detect support.
    ...(raw.display_name !== undefined ? { display_name: raw.display_name ?? null } : {}),
    avatar_url: raw.avatar_url ?? null,
    ...(raw.avatar_display_url ? { avatar_display_url: String(raw.avatar_display_url) } : {}),
    auth_provider: raw.auth_provider ?? 'guest',
    account_type: raw.account_type,
    account_type_selected_at: raw.account_type_selected_at ?? null,
    is_internal_staff: raw.is_internal_staff === true,
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

