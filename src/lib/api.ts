/**
 * Sifter Skill_Up — API Client
 * All calls go through the FastAPI backend.
 * Set EXPO_PUBLIC_API_URL in your .env
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'sifter_token';
const LEGACY_TOKEN_KEY = 'sifter_token'; // AsyncStorage key for migration
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 3;

// ── Error types ──────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

// ── Token management ─────────────────────────────────────────

let migrationDone = false;
async function migrateTokenIfNeeded(): Promise<void> {
  if (migrationDone) return;
  migrationDone = true;
  try {
    const existing = await SecureStore.getItemAsync(TOKEN_KEY);
    if (existing) return;
    const legacy = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy) {
      await SecureStore.setItemAsync(TOKEN_KEY, legacy);
      await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  } catch {
    // Migration is best-effort
  }
}

async function getToken(): Promise<string | null> {
  await migrateTokenIfNeeded();
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// ── Core request with retry + timeout ────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 1s, 2s, 4s
      await sleep(Math.min(1000 * 2 ** (attempt - 1), 4000));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Don't retry client errors (except 408/429)
      if (!res.ok && !isRetryable(res.status)) {
        let errorMsg = res.statusText;
        try {
          const json = await res.json();
          errorMsg = json.error ?? json.detail ?? res.statusText;
        } catch {}
        throw new ApiError(errorMsg, res.status);
      }

      if (!res.ok && isRetryable(res.status) && attempt < MAX_RETRIES - 1) {
        lastError = new ApiError(res.statusText, res.status);
        continue;
      }

      const json = await res.json();
      if (!json.success) {
        throw new ApiError(json.error ?? 'Request failed', res.status);
      }
      return json.data as T;
    } catch (err) {
      clearTimeout(timeout);

      if (err instanceof ApiError) throw err;

      if (err instanceof DOMException && err.name === 'AbortError') {
        lastError = new NetworkError('Request timed out');
      } else if (err instanceof TypeError) {
        // fetch throws TypeError on network failure
        lastError = new NetworkError(String(err));
      } else {
        throw err;
      }

      if (attempt === MAX_RETRIES - 1) throw lastError;
    }
  }

  throw lastError ?? new NetworkError();
}

// ── Auth response type ───────────────────────────────────────

interface AuthResponse {
  token: string;
  user: UserProfile;
}

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

interface StreakResponse {
  streak: number;
  bonus_earned: number;
}

interface LevelCompletePayload {
  level_id: number;
  track: string;
  score: number;
  time_seconds?: number;
  is_perfect?: boolean;
  boosters_used?: Record<string, number>;
}

interface LevelCompleteResponse {
  xp_earned: number;
  new_points: number;
  next_level: number;
  python_chapters_completed: string[];
  quant_unlocked: boolean;
}

interface QuantGateResponse {
  quant_trader_unlocked: boolean;
  quant_researcher_unlocked: boolean;
  quant_developer_unlocked: boolean;
  python_chapters_completed: number;
  python_chapters_required_for_dev: number;
  chapters_done: string[];
}

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  points: number;
  streak: number;
  current_level: number;
  avatar_url: string | null;
}

interface Guild {
  id: string;
  name: string;
  description: string | null;
  total_points: number;
  member_count: number;
}

interface GuildCreatePayload {
  name: string;
  description?: string;
  icon?: string;
  is_private?: boolean;
  requires_approval?: boolean;
  min_level?: number;
}

interface WithdrawalPayload {
  points_used: number;
  method: string;
  destination: string;
}

interface GitHubRepo {
  name: string;
  url: string;
  description: string | null;
  stars: number;
  updated: string;
}

interface PushPortfolioResponse {
  repo_url: string;
  files_pushed: string[];
  message: string;
}

interface CreateRepoResponse {
  url: string;
  name: string;
  clone_url: string;
}

interface PortfolioFile {
  path: string;
  content: string;
}

interface PortfolioPushPayload {
  itemId: string;
  platformIds: string[];
  caption: string;
  sourceAttribution?: string;
}

// ── API methods ──────────────────────────────────────────────

export const API = {
  // Auth
  authTelegram: (initData: string) =>
    request<AuthResponse>('/api/auth/telegram', {
      method: 'POST', body: JSON.stringify({ initData }),
    }),

  authBaseWallet: (walletAddress: string, signature: string, message: string) =>
    request<AuthResponse>('/api/auth/base-wallet', {
      method: 'POST', body: JSON.stringify({ walletAddress, signature, message }),
    }),

  authGuest: () =>
    request<AuthResponse>('/api/auth/guest', { method: 'POST' }),

  saveToken: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clearToken: () => SecureStore.deleteItemAsync(TOKEN_KEY),

  // User
  getMe: () => request<UserProfile>('/api/users/me'),
  updateMe: (updates: Partial<Pick<UserProfile, 'username' | 'avatar_url' | 'settings'>>) =>
    request<UserProfile>('/api/users/me', { method: 'PUT', body: JSON.stringify(updates) }),
  checkStreak: () => request<StreakResponse>('/api/users/streak', { method: 'POST' }),

  // Game
  completeLevel: (payload: LevelCompletePayload) =>
    request<LevelCompleteResponse>('/api/game/complete-level', {
      method: 'POST', body: JSON.stringify(payload),
    }),
  getGameState: () => request<Record<string, unknown>>('/api/game/state'),
  saveGameState: (state: Record<string, unknown>) =>
    request<void>('/api/game/state', { method: 'POST', body: JSON.stringify({ state }) }),
  getQuantGate: () => request<QuantGateResponse>('/api/game/quant-gate'),

  // Leaderboard
  getLeaderboard: (limit = 100) => request<LeaderboardUser[]>(`/api/leaderboard/users?limit=${limit}`),
  getGuildLeaderboard: () => request<Guild[]>('/api/leaderboard/guilds'),

  // Guilds
  getGuilds: (search?: string) =>
    request<Guild[]>(`/api/guilds${search ? `?search=${search}` : ''}`),
  createGuild: (data: GuildCreatePayload) =>
    request<Guild>('/api/guilds', { method: 'POST', body: JSON.stringify(data) }),
  joinGuild: (id: string) =>
    request<void>(`/api/guilds/${id}/join`, { method: 'POST' }),

  // Withdrawals
  getWithdrawals: () => request<unknown[]>('/api/withdrawals'),
  requestWithdrawal: (data: WithdrawalPayload) =>
    request<unknown>('/api/withdrawals', { method: 'POST', body: JSON.stringify(data) }),

  // GitHub
  githubAuthUrl: () =>
    request<{ url: string; state: string }>('/api/github/auth-url'),

  githubStatus: () =>
    request<{ connected: boolean; username: string | null; avatar: string | null }>('/api/github/status'),

  githubDisconnect: () =>
    request<void>('/api/github/disconnect', { method: 'POST' }),

  githubRepos: () => request<GitHubRepo[]>('/api/github/repos'),

  pushPortfolio: (repo_name: string, files: PortfolioFile[]) =>
    request<PushPortfolioResponse>('/api/github/push-portfolio', {
      method: 'POST', body: JSON.stringify({ repo_name, files }),
    }),

  createRepo: (name: string, description?: string, isPrivate?: boolean) =>
    request<CreateRepoResponse>('/api/github/create-repo', {
      method: 'POST',
      body: JSON.stringify({ name, description, private: isPrivate ?? false }),
    }),

  // Resume position
  saveLastPosition: (position: Record<string, unknown>) =>
    request<void>('/api/game/last-position', {
      method: 'POST', body: JSON.stringify({ position }),
    }),
  clearLastPosition: () =>
    request<void>('/api/game/last-position', { method: 'DELETE' }),

  // Onboarding
  completeOnboarding: (data: { active_track?: string; recommended_tracks?: string[] }) =>
    request<UserProfile>('/api/users/onboarding-complete', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // Interview Mode
  startInterview: (trackId: string, level: string) =>
    request<{ id: string; track_id: string; level: string; status: string }>('/api/interview/start', {
      method: 'POST', body: JSON.stringify({ track_id: trackId, level }),
    }),
  submitInterviewAnswer: (interviewId: string, questionIndex: number, answer: string) =>
    request<{ interview_id: string; answers_count: number }>('/api/interview/answer', {
      method: 'POST', body: JSON.stringify({ interview_id: interviewId, question_index: questionIndex, answer }),
    }),
  getInterviewResult: (interviewId: string) =>
    request<unknown>(`/api/interview/${interviewId}/result`),

  // Push notifications
  savePushToken: (token: string) =>
    request<void>('/api/users/push-token', {
      method: 'POST', body: JSON.stringify({ token }),
    }),

  // Feedback & analytics
  submitFeedback: (data: { type: string; message: string; level_id?: number }) =>
    request<unknown>('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  trackEvent: (event_type: string, event_data: Record<string, unknown>, session_id?: string) =>
    request<void>('/api/analytics/event', {
      method: 'POST', body: JSON.stringify({ event_type, event_data, session_id }),
    }),

  // ─── Portfolio Hub ────────────────────────────────────────────────────────

  // Connected Accounts
  portfolioGetConnectedAccounts: () =>
    request<unknown[]>('/api/portfolio/accounts'),

  portfolioLinkAccount: (data: { platformId: string; username: string; profileUrl?: string }) =>
    request<unknown>('/api/portfolio/accounts/link', {
      method: 'POST', body: JSON.stringify(data),
    }),

  portfolioDisconnectAccount: (platformId: string) =>
    request<void>(`/api/portfolio/accounts/${platformId}`, { method: 'DELETE' }),

  portfolioCreateAccount: (data: {
    platformId: string;
    username: string;
    email: string;
    password?: string;
    displayName?: string;
    sourcedFrom?: string;
  }) =>
    request<unknown>('/api/portfolio/accounts/create', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // OAuth
  portfolioGetOAuthUrl: (platformId: string) =>
    request<{ url: string }>(`/api/portfolio/oauth/${platformId}/url`)
      .then(r => r?.url ?? null),

  // Portfolio Items
  portfolioGetItems: () =>
    request<unknown[]>('/api/portfolio/items'),

  portfolioAddItem: (data: {
    title: string;
    description: string;
    fieldId: string;
    type: string;
    tags?: string[];
    fileUrl?: string;
  }) =>
    request<unknown>('/api/portfolio/items', {
      method: 'POST', body: JSON.stringify(data),
    }),

  portfolioDeleteItem: (itemId: string) =>
    request<void>(`/api/portfolio/items/${itemId}`, { method: 'DELETE' }),

  // Push to platforms
  portfolioPushItem: (data: PortfolioPushPayload) =>
    request<unknown[]>('/api/portfolio/items/push', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // Submission package (for manual-upload platforms)
  portfolioGeneratePackage: (data: { itemId: string; platformId: string }) =>
    request<unknown>('/api/portfolio/items/package', {
      method: 'POST', body: JSON.stringify(data),
    }),
};

export type { UserProfile, AuthResponse, LevelCompletePayload, LevelCompleteResponse, QuantGateResponse };
