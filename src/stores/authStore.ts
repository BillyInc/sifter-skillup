import { create } from 'zustand';
import { API } from '../lib/api';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  points: number;
  streak: number;
  current_level: number;
  completed_levels: string[];
  python_chapters_completed: string[];
  active_track: string;
  boosters: Record<string, number>;
  achievements: string[];
  guild_id: string | null;
  is_verified: boolean;
  settings: Record<string, boolean>;
  onboarding_completed?: boolean;
}

function computeGates(user: UserProfile | null) {
  return {
    quantTraderUnlocked: true,
    quantResearcherUnlocked: true,
    quantDeveloperUnlocked: (user?.python_chapters_completed?.length ?? 0) >= 5,
  };
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;

  // Computed gate flags
  quantTraderUnlocked: boolean;
  quantResearcherUnlocked: boolean;
  quantDeveloperUnlocked: boolean;

  // Actions
  loadSession: () => Promise<void>;
  authTelegram: (initData: string) => Promise<void>;
  authBaseWallet: (address: string, signature: string, message: string) => Promise<void>;
  authGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  ...computeGates(null),

  loadSession: async () => {
    try {
      const profile = await API.getMe();
      set({ user: profile, loading: false, ...computeGates(profile) });
      API.checkStreak().catch(() => {});
    } catch {
      set({ user: null, loading: false, ...computeGates(null) });
    }
  },

  authTelegram: async (initData: string) => {
    const data = await API.authTelegram(initData);
    await API.saveToken(data.token);
    set({ user: data.user, ...computeGates(data.user) });
    API.checkStreak().catch(() => {});
  },

  authBaseWallet: async (address: string, signature: string, message: string) => {
    const data = await API.authBaseWallet(address, signature, message);
    await API.saveToken(data.token);
    set({ user: data.user, ...computeGates(data.user) });
    API.checkStreak().catch(() => {});
  },

  authGuest: async () => {
    const data = await API.authGuest();
    await API.saveToken(data.token);
    set({ user: data.user, ...computeGates(data.user) });
    API.checkStreak().catch(() => {});
  },

  signOut: async () => {
    await API.clearToken();
    set({ user: null, ...computeGates(null) });
  },

  refreshUser: async () => {
    try {
      const profile = await API.getMe();
      set({ user: profile, ...computeGates(profile) });
    } catch {}
  },
}));
