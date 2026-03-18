import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  settings: Record<string, any>;
  onboarding_completed?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  authTelegram: (initData: string) => Promise<void>;
  authBaseWallet: (address: string, signature: string, message: string) => Promise<void>;
  authGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  quantTraderUnlocked: boolean;
  quantResearcherUnlocked: boolean;
  quantDeveloperUnlocked: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { _tryLoadSavedSession(); }, []);

  async function _tryLoadSavedSession() {
    try {
      const profile = await API.getMe();
      setUser(profile);
      API.checkStreak().catch(() => {});
    } catch {
      // No saved session
    } finally {
      setLoading(false);
    }
  }

  async function _handleAuthResponse(data: { token: string; user: any }) {
    await API.saveToken(data.token);
    setUser(data.user);
    API.checkStreak().catch(() => {});
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

  async function signOut() {
    await API.clearToken();
    setUser(null);
  }

  async function refreshUser() {
    try {
      const profile = await API.getMe();
      setUser(profile);
    } catch {}
  }

  // Quant Trader and Researcher: always unlocked — they start from math (Lab 0)
  // Quant Developer: requires Python chapters 1-5 first
  const quantTraderUnlocked = true;
  const quantResearcherUnlocked = true;
  const quantDeveloperUnlocked = (user?.python_chapters_completed?.length ?? 0) >= 5;

  return (
    <AuthContext.Provider value={{
      user, loading, authTelegram, authBaseWallet, authGuest,
      signOut, refreshUser, quantTraderUnlocked, quantResearcherUnlocked, quantDeveloperUnlocked,
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
