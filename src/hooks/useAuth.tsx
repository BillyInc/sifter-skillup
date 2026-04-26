/**
 * Sifter Skill_Up - useAuth
 *
 * Full UserProfile with all upgrade fields.
 * Adds: starknet auth, active field, track context,
 * device registration, xp_stage, merch_credits.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API, API_BASE } from '../lib/api';
import { getOrCreateDeviceId, onLoginSync } from '../lib/offlineStorage';
import type { StarkzapWallet } from '../lib/starkzap';
import {
  StarknetWalletBridgeProvider,
  useStarknetWalletBridge,
} from '../components/auth/StarknetWalletBridge';
import { PrivyStarknetBootstrap } from '../components/auth/PrivyStarknetBootstrap';
import { PRIVY_ENABLED } from '../lib/config';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  auth_provider: string;
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
  signUpEmail: (email: string, password: string, username?: string) => Promise<void>;
  authStarknet: (email: string, starknetAddress?: string, privyAccessToken?: string) => Promise<void>;
  starknetLoading: boolean;
  starknetWallet: StarkzapWallet | null;
  starknetReady: boolean;
  starknetWalletAddress: string | null;
  starknetWalletStatus: string;
  signOut: () => Promise<void>;
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
  ready: boolean;
};

const EMPTY_BRIDGE_STATE: BridgeState = {
  wallet: null,
  address: null,
  status: 'unavailable',
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
      ready: bridge.ready,
    });
  }, [bridge.address, bridge.ready, bridge.status, bridge.wallet, onChange]);

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

  async function _tryLoadSavedSession() {
    try {
      const profile = await API.getMe() as UserProfile;
      setUser(_normalise(profile));
      API.checkStreak().catch(() => {});
      const token = await API.getToken();
      onLoginSync(profile.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
    } catch {
      // No saved session.
    } finally {
      setLoading(false);
    }
  }

  async function _handleAuthResponse(data: { token: string; user: any }) {
    await API.saveToken(data.token);
    const profile = _normalise(data.user);
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

  async function authGuest() {
    const data = await API.authGuest();
    await _handleAuthResponse(data);
  }

  async function signInEmail(email: string, password: string) {
    const data = await API.authLogin(email, password);
    await _handleAuthResponse(data);
  }

  async function signUpEmail(email: string, password: string, username?: string) {
    const data = await API.authSignup(email, password, username);
    await _handleAuthResponse(data);
  }

  async function authStarknet(email: string, starknetAddress?: string, privyAccessToken?: string) {
    if (!privyAccessToken) {
      throw new Error('Privy Starknet auth requires a live Privy session.');
    }

    setStarknetLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/starknet/auth/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      await _handleAuthResponse({ token: payload.token, user: payload.user });
    } finally {
      setStarknetLoading(false);
    }
  }

  async function signOut() {
    await API.clearToken();
    setUser(null);
  }

  async function refreshUser() {
    try {
      const profile = await API.getMe() as UserProfile;
      setUser(_normalise(profile));
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
  const resolvedUser = user && bridgeState.address && user.starknet_address !== bridgeState.address
    ? {
        ...user,
        starknet_address: bridgeState.address,
        starknet_auth: true,
      }
    : user;

  return (
    <AuthContext.Provider
      value={{
        user: resolvedUser,
        loading,
        authTelegram,
        authBaseWallet,
        authGuest,
        signInGuest: authGuest,
        signInEmail,
        signUpEmail,
        authStarknet,
        signOut,
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
      <StarknetWalletBridgeProvider preferredAddress={user?.starknet_address ?? null}>
        <StarknetBridgeStateSync onChange={setBridgeState} />
        {PRIVY_ENABLED ? <PrivyStarknetBootstrap user={resolvedUser} refreshUser={refreshUser} /> : null}
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
    username: raw.username ?? 'Learner',
    avatar_url: raw.avatar_url ?? null,
    auth_provider: raw.auth_provider ?? 'guest',
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
