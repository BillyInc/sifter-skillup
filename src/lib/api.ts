/**
 * Sifter Skill_Up — API Client
 * All calls go through the FastAPI backend.
 * Set EXPO_PUBLIC_API_URL in your .env
 *
 * SECURITY:
 *  - Auth tokens stored in expo-secure-store (encrypted, OS keychain-backed)
 *    NOT in AsyncStorage (unencrypted, readable by any process with storage access)
 *  - AI scoring calls go through /api/ai/score on the backend
 *    NOT directly to api.anthropic.com (would require exposing API key in client)
 */
import * as SecureStore from 'expo-secure-store';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
/** @deprecated use API_BASE */
const BASE_URL = API_BASE;

const TOKEN_KEY = 'sifter_auth_token_v2';

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error ?? res.statusText);
  return json.data;
}

export const API = {
  // Auth
  authTelegram: (initData: string) =>
    request<{ token: string; user: any }>('/api/auth/telegram', {
      method: 'POST', body: JSON.stringify({ initData }),
    }),

  authBaseWallet: (walletAddress: string, signature: string, message: string) =>
    request<{ token: string; user: any }>('/api/auth/base-wallet', {
      method: 'POST', body: JSON.stringify({ walletAddress, signature, message }),
    }),

  authGuest: () =>
    request<{ token: string; user: any }>('/api/auth/guest', { method: 'POST' }),

  saveToken: (token: string) => SecureStore.setItemAsync('sifter_auth_token_v2', token),
  clearToken: () => SecureStore.deleteItemAsync('sifter_auth_token_v2'),
  getToken,  // exported for offline sync engines

  // AI Scoring — routes through backend so API key never lives in client
  scoreSimulator: (body: { scenario: string; criteria: string[]; userResponse: string; context?: string }) =>
    request<{ criteriaResults: Array<{ criterion: string; passed: boolean; feedback: string }>; overallFeedback: string; score: number; total: number; xpEarned: number }>('/api/ai/score', { method: 'POST', body: JSON.stringify(body) }),

  // User
  getMe: () => request<any>('/api/users/me'),
  updateMe: (updates: any) => request<any>('/api/users/me', { method: 'PUT', body: JSON.stringify(updates) }),
  checkStreak: () => request<any>('/api/users/streak', { method: 'POST' }),

  // Game
  completeLevel: (payload: any) =>
    request<any>('/api/game/complete-level', { method: 'POST', body: JSON.stringify(payload) }),
  getGameState: () => request<any>('/api/game/state'),
  saveGameState: (state: any) =>
    request<any>('/api/game/state', { method: 'POST', body: JSON.stringify({ state }) }),
  getQuantGate: () => request<any>('/api/game/quant-gate'),

  // Leaderboard
  getLeaderboard: (limit = 100) => request<any[]>(`/api/leaderboard/users?limit=${limit}`),
  getGuildLeaderboard: () => request<any[]>('/api/leaderboard/guilds'),

  // Guilds
  getGuilds: (search?: string) => request<any[]>(`/api/guilds${search ? `?search=${search}` : ''}`),
  createGuild: (data: any) => request<any>('/api/guilds', { method: 'POST', body: JSON.stringify(data) }),
  joinGuild: (id: string) => request<any>(`/api/guilds/${id}/join`, { method: 'POST' }),

  // Withdrawals
  getWithdrawals: () => request<any[]>('/api/withdrawals'),
  requestWithdrawal: (data: any) =>
    request<any>('/api/withdrawals', { method: 'POST', body: JSON.stringify(data) }),

  // GitHub
  githubAuthUrl: () =>
    request<{ url: string; state: string }>('/api/github/auth-url'),

  githubStatus: () =>
    request<{ connected: boolean; username: string | null; avatar: string | null }>('/api/github/status'),

  githubDisconnect: () =>
    request<void>('/api/github/disconnect', { method: 'POST' }),

  githubRepos: () =>
    request<Array<{ name: string; url: string; description: string | null; stars: number; updated: string }>>('/api/github/repos'),

  pushPortfolio: (repo_name: string, files: Array<{ path: string; content: string }>) =>
    request<{ repo_url: string; files_pushed: string[]; message: string }>('/api/github/push-portfolio', {
      method: 'POST',
      body: JSON.stringify({ repo_name, files }),
    }),

  createRepo: (name: string, description?: string, isPrivate?: boolean) =>
    request<{ url: string; name: string; clone_url: string }>('/api/github/create-repo', {
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
    request<any>('/api/users/onboarding-complete', {
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
  submitFeedback: (data: any) =>
    request<any>('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  trackEvent: (event_type: string, event_data: any, session_id?: string) =>
    request<any>('/api/analytics/event', {
      method: 'POST', body: JSON.stringify({ event_type, event_data, session_id }),
    }),

  // ─── Portfolio Hub ────────────────────────────────────────────────────────

  // Connected Accounts
  portfolioGetConnectedAccounts: () =>
    request<any[]>('/api/portfolio/accounts'),

  portfolioLinkAccount: (data: { platformId: string; username: string; profileUrl?: string }) =>
    request<any>('/api/portfolio/accounts/link', {
      method: 'POST', body: JSON.stringify(data),
    }),

  portfolioDisconnectAccount: (platformId: string) =>
    request<any>(`/api/portfolio/accounts/${platformId}`, { method: 'DELETE' }),

  portfolioCreateAccount: (data: {
    platformId: string;
    username: string;
    email: string;
    password?: string;
    displayName?: string;
    sourcedFrom?: string;
  }) =>
    request<any>('/api/portfolio/accounts/create', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // OAuth
  portfolioGetOAuthUrl: (platformId: string) =>
    request<{ url: string }>(`/api/portfolio/oauth/${platformId}/url`)
      .then(r => r?.data?.url ?? null),

  // Portfolio Items
  portfolioGetItems: () =>
    request<any[]>('/api/portfolio/items').then(r => r?.data ?? []),

  portfolioAddItem: (data: {
    title: string;
    description: string;
    fieldId: string;
    type: string;
    tags?: string[];
    fileUrl?: string;
  }) =>
    request<any>('/api/portfolio/items', {
      method: 'POST', body: JSON.stringify(data),
    }),

  portfolioDeleteItem: (itemId: string) =>
    request<any>(`/api/portfolio/items/${itemId}`, { method: 'DELETE' }),

  // Push to platforms
  portfolioPushItem: (data: {
    itemId: string;
    platformIds: string[];
    caption: string;
    sourceAttribution?: string;
  }) =>
    request<any[]>('/api/portfolio/items/push', {
      method: 'POST', body: JSON.stringify(data),
    }).then(r => r?.data ?? []),

  // Submission package (for manual-upload platforms)
  portfolioGeneratePackage: (data: { itemId: string; platformId: string }) =>
    request<any>('/api/portfolio/items/package', {
      method: 'POST', body: JSON.stringify(data),
    }).then(r => r?.data ?? null),
};
