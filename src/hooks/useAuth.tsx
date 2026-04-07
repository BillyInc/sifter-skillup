/**
 * Sifter Skill_Up — useAuth (v2)
 * REPLACES: src/hooks/useAuth.tsx
 *
 * Full UserProfile with all upgrade fields.
 * Adds: starknet auth, active field, track context,
 *       device registration, xp_stage, merch_credits.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API } from '../lib/api';
import { getOrCreateDeviceId, onLoginSync } from '../lib/offlineStorage';
import { API_BASE } from '../lib/api';

// ─── UserProfile ─────────────────────────────────────────────

export interface UserProfile {
  // Core
  id:                       string;
  username:                 string;
  avatar_url:               string | null;
  auth_provider:            string;
  email?:                   string;

  // Progress
  points:                   number;
  streak:                   number;
  current_level:            number;
  completed_levels:         string[];
  perfect_levels:           string[];
  python_chapters_completed: string[];
  active_track:             string;

  // New: Track/field context (drives HomeScreen artwork)
  active_field_id?:         string;
  active_field_color?:      string;
  current_track_id?:        string;
  current_track_name?:      string;
  xp_stage:                 number;

  // New: Starknet
  starknet_address?:        string;
  starknet_auth?:           boolean;
  starknet_email?:          string;

  // Social / community
  guild_id:                 string | null;
  guild_role?:              string;
  achievements:             string[];

  // Monetisation
  merch_credits:            number;
  boosters:                 Record<string, number>;
  is_verified:              boolean;

  // Settings
  settings:                 Record<string, any>;
  onboarding_completed?:    boolean;

  // Resume
  last_position?:           any;

  // Meta
  created_at?:              string;
  last_login?:              string;
  last_played?:             string;

  // Compatibility aliases (some screens use these)
  totalXp?:                 number;
  completedLevels?:         string[];
  active_challenge_id?:     string;
  challenge_room_ids?:      string[];
}

// ─── Auth context ─────────────────────────────────────────────

interface AuthContextType {
  user:                     UserProfile | null;
  loading:                  boolean;
  authTelegram:             (initData: string) => Promise<void>;
  authBaseWallet:           (address: string, signature: string, message: string) => Promise<void>;
  authGuest:                () => Promise<void>;
  signInGuest:              () => Promise<void>;
  signInEmail:              (email: string, password: string) => Promise<void>;
  signUpEmail:              (email: string, password: string, username?: string) => Promise<void>;
  authStarknet:             (email: string, starknetAddress?: string) => Promise<void>;
  starknetLoading:          boolean;
  starknetWallet?:          string | null;
  signOut:                  () => Promise<void>;
  refreshUser:              () => Promise<void>;
  updateActiveField:        (fieldId: string, color: string, trackId?: string, trackName?: string) => Promise<void>;

  // Track gates
  quantTraderUnlocked:      boolean;
  quantResearcherUnlocked:  boolean;
  quantDeveloperUnlocked:   boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<UserProfile | null>(null);
  const [loading, setLoading]         = useState(true);
  const [starknetLoading, setStarknetLoading] = useState(false);

  useEffect(() => { _tryLoadSavedSession(); }, []);

  async function _tryLoadSavedSession() {
    try {
      const profile = await API.getMe() as UserProfile;
      setUser(_normalise(profile));
      API.checkStreak().catch(() => {});
      // Offline sync: restore progress from server on app open
      const token = await API.getToken();
      onLoginSync(profile.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
    } catch {
      // No saved session — user needs to log in
    } finally {
      setLoading(false);
    }
  }

  async function _handleAuthResponse(data: { token: string; user: any }) {
    await API.saveToken(data.token);
    const profile = _normalise(data.user);
    setUser(profile);
    API.checkStreak().catch(() => {});

    // Register device for session enforcement
    const deviceId = await getOrCreateDeviceId();
    API.updateMe({ device_id: deviceId }).catch(() => {});

    // Start offline sync
    const token = await API.getToken();
    onLoginSync(profile.id, API_BASE, () => Promise.resolve(token)).catch(() => {});
  }

  // ── Auth methods ────────────────────────────────────────────

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

  async function authStarknet(email: string, starknetAddress?: string) {
    setStarknetLoading(true);
    try {
      // Step 1: Sign up or log in with email (creates account if needed)
      let authData: any;
      try {
        authData = await API.authSignup(email, `stark_${Date.now()}`, email.split('@')[0]);
      } catch {
        // Account exists — log in with stored credentials instead
        // In production Privy handles this — for now email flow suffices
        throw new Error('Email already registered. Use "Sign In" instead, or log in with email/password.');
      }
      await API.saveToken(authData.token);
      const profile = _normalise(authData.user);
      setUser(profile);

      // Step 2: Generate a demo Starknet address (Privy would do this in production)
      // In production: const { address } = await privy.createWallet({ type: 'starknet' });
      const demoAddr = starknetAddress || `0x0${Array.from({length: 63}, () =>
        '0123456789abcdef'[Math.floor(Math.random()*16)]).join('')}`;

      // Step 3: Register the Starknet address on the backend
      await fetch(`${API_BASE}/api/starknet/auth/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
        body: JSON.stringify({ email, privy_token: demoAddr }),
      });

      await refreshUser();
      API.checkStreak().catch(() => {});
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
    } catch {}
  }

  async function updateActiveField(
    fieldId: string,
    color: string,
    trackId?: string,
    trackName?: string,
  ) {
    const updates: Partial<UserProfile> = {
      active_field_id:    fieldId,
      active_field_color: color,
    };
    if (trackId)   updates.current_track_id   = trackId;
    if (trackName) updates.current_track_name = trackName;

    await API.updateMe(updates);
    setUser(prev => prev ? { ...prev, ...updates } : prev);

    // Also hit the dedicated endpoint
    try {
      await (API as any).post('/api/users/active-field', updates);
    } catch {}
  }

  // ── Gates ────────────────────────────────────────────────────

  const quantTraderUnlocked    = true;
  const quantResearcherUnlocked = true;
  const quantDeveloperUnlocked  = (user?.python_chapters_completed?.length ?? 0) >= 5;

  return (
    <AuthContext.Provider value={{
      user, loading,
      authTelegram, authBaseWallet, authGuest,
      signInGuest: authGuest,
      signInEmail, signUpEmail, authStarknet,
      signOut, refreshUser, updateActiveField, starknetLoading,
      starknetWallet: user?.starknet_address ?? null,
      quantTraderUnlocked, quantResearcherUnlocked, quantDeveloperUnlocked,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ─── Normalise server response ─────────────────────────────────
// Maps server field names to the canonical UserProfile shape

function _normalise(raw: any): UserProfile {
  return {
    id:                       raw.id ?? '',
    username:                 raw.username ?? 'Learner',
    avatar_url:               raw.avatar_url ?? null,
    auth_provider:            raw.auth_provider ?? 'guest',
    email:                    raw.email,
    points:                   raw.points ?? 0,
    streak:                   raw.streak ?? 0,
    current_level:            raw.current_level ?? 1,
    completed_levels:         raw.completed_levels ?? [],
    perfect_levels:           raw.perfect_levels ?? [],
    python_chapters_completed: raw.python_chapters_completed ?? [],
    active_track:             raw.active_track ?? 'crypto',
    active_field_id:          raw.active_field_id,
    active_field_color:       raw.active_field_color,
    current_track_id:         raw.current_track_id,
    current_track_name:       raw.current_track_name,
    xp_stage:                 raw.xp_stage ?? 1,
    starknet_address:         raw.starknet_address,
    starknet_auth:            raw.starknet_auth ?? false,
    starknet_email:           raw.starknet_email,
    guild_id:                 raw.guild_id ?? null,
    guild_role:               raw.guild_role,
    achievements:             raw.achievements ?? [],
    merch_credits:            raw.merch_credits ?? 0,
    boosters:                 raw.boosters ?? {},
    is_verified:              raw.is_verified ?? false,
    settings:                 raw.settings ?? {},
    onboarding_completed:     raw.onboarding_completed ?? false,
    last_position:            raw.last_position,
    created_at:               raw.created_at,
    last_login:               raw.last_login,
    last_played:              raw.last_played,
    // Compatibility aliases
    totalXp:                  raw.points ?? 0,
    completedLevels:          raw.completed_levels ?? [],
    active_challenge_id:      raw.active_challenge_id,
    challenge_room_ids:       raw.challenge_room_ids ?? [],
  };
}
