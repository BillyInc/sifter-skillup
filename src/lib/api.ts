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
import { logger, logApiCall } from './logger';

export const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
/** @deprecated use API_BASE */
const BASE_URL = API_BASE;

const TOKEN_KEY = 'sifter_auth_token_v2';

async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Web: use localStorage directly (SecureStore hangs on web)
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) {
      logger.warn('Failed to get token from localStorage', { error: e });
    }
    return null;
  }
  // Native: use SecureStore
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) return token;
  } catch (e) {
    logger.warn('Failed to get token from SecureStore', { error: e });
  }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const startTime = Date.now();
  const token = await getToken();

  logger.debug('API request started', {
    endpoint: path,
    method: options.method || 'GET',
    hasAuthorization: !!token,
  });

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const duration = Date.now() - startTime;
    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error ?? res.statusText);
    }

    logger.info('API request completed', {
      endpoint: path,
      method: options.method || 'GET',
      duration,
      status: res.status,
      success: true,
    });

    return json.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('API request failed', error as Error);
    logger.info('API request completed with error', {
      endpoint: path,
      method: options.method || 'GET',
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
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

  authSignup: (email: string, password: string, username?: string) =>
    request<{ token: string; user: any }>('/api/auth/signup', {
      method: 'POST', body: JSON.stringify({ email, password, username }),
    }),

  authLogin: (email: string, password: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),

  saveToken: async (token: string) => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try { localStorage.setItem('sifter_auth_token_v2', token); } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync('sifter_auth_token_v2', token);
    } catch {
    }
  },
  clearToken: async () => {
    try {
      await SecureStore.deleteItemAsync('sifter_auth_token_v2');
    } catch {
      try { localStorage.removeItem('sifter_auth_token_v2'); } catch {}
    }
  },
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
    request<{ interview_id: string; answers_count: number; complete?: boolean; nextQuestion?: any }>('/api/interview/answer', {
      method: 'POST', body: JSON.stringify({ interview_id: interviewId, question_index: questionIndex, answer }),
    }),
  getInterviewResult: (interviewId: string) =>
    request<any>(`/api/interview/${interviewId}/result`),

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
      .then(r => (r as any)?.url ?? null),

  // Portfolio Items
  portfolioGetItems: () =>
    request<any>('/api/portfolio/items').then(r => r?.items ?? r ?? []),

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
    }),

  // Submission package (for manual-upload platforms)
  portfolioGeneratePackage: (data: { itemId: string; platformId: string }) =>
    request<any>('/api/portfolio/items/package', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // ── Starknet DeFi Navigator ──────────────────────────────────────────────────
  navigatorLabComplete: (labNumber: number) =>
    request<any>('/api/game/navigator-lab-complete', {
      method: 'POST', body: JSON.stringify({ lab_number: labNumber }),
    }),

  starknetTxLog: (tx: { hash: string; network: string; type: string; lessonId?: string; labId?: string; amount?: string; token?: string }) =>
    request<any>('/api/starknet/transactions', {
      method: 'POST', body: JSON.stringify(tx),
    }),

  starknetStatus: () => request<any>('/api/starknet/status'),

  syncDrain: (items: any[], deviceId: string) =>
    request<any>('/api/sync/drain', {
      method: 'POST', body: JSON.stringify({ device_id: deviceId, items, client_time: new Date().toISOString() }),
    }),

  syncStatus: () => request<any>('/api/sync/status'),

  // ── Starknet RPC ────────────────────────────────────────────────────────────
  starknetRpc: (method: string, params: any[]) =>
    request<any>('/api/starknet/rpc', {
      method: 'POST', body: JSON.stringify({ method, params }),
    }),

  starknetAuthEmail: (email: string, privy_token: string) =>
    request<any>('/api/starknet/auth/email', {
      method: 'POST', body: JSON.stringify({ email, privy_token }),
    }),

  // ── Feed ────────────────────────────────────────────────────────────────────
  feedSubscribe: (tracks: string[]) =>
    request<any>('/api/feed/subscribe', {
      method: 'POST', body: JSON.stringify({ tracks }),
    }),

  feedGetSubscriptions: () => request<any>('/api/feed/subscriptions'),

  feedGetItems: (trackId?: string) =>
    request<any[]>(`/api/feed/${trackId ? `?track_id=${trackId}` : ''}`),

  feedGetItem: (itemId: string) => request<any>(`/api/feed/${itemId}`),

  feedReact: (itemId: string, reaction: string) =>
    request<any>('/api/feed/react', {
      method: 'POST', body: JSON.stringify({ item_id: itemId, reaction }),
    }),

  // ── Phase 5 (XP, Badges, Challenges, Merch) ────────────────────────────────
  xpRecordEvent: (data: { event_type: string; xp: number; source?: string; metadata?: any }) =>
    request<any>('/api/v2/xp/event', {
      method: 'POST', body: JSON.stringify(data),
    }),

  xpGetHistory: () => request<any[]>('/api/v2/xp/history'),

  getBadges: () => request<any[]>('/api/v2/badges'),
  getMyBadges: () => request<any[]>('/api/v2/badges/me'),

  getChallenges: (status?: string) =>
    request<any[]>(`/api/v2/challenges${status ? `?status=${status}` : ''}`),

  joinChallenge: (challengeId: string) =>
    request<any>('/api/v2/challenges/join', {
      method: 'POST', body: JSON.stringify({ challenge_id: challengeId }),
    }),

  submitChallenge: (challengeId: string, proof?: any) =>
    request<any>('/api/v2/challenges/submit', {
      method: 'POST', body: JSON.stringify({ challenge_id: challengeId, proof }),
    }),

  getMerchandise: () => request<any[]>('/api/v2/merch'),

  redeemMerchandise: (itemId: string, shippingAddress?: any) =>
    request<any>('/api/v2/merch/redeem', {
      method: 'POST', body: JSON.stringify({ item_id: itemId, shipping_address: shippingAddress }),
    }),

  // ── Social Rewards ──────────────────────────────────────────────────────────
  socialShare: (data: { platform: string; content_type: string; content_id?: string; url?: string }) =>
    request<any>('/api/social/share', {
      method: 'POST', body: JSON.stringify(data),
    }),

  socialGetShares: () => request<any[]>('/api/social/shares/me'),

  socialPortfolioAttribution: (data: { item_id: string; platform: string; url: string }) =>
    request<any>('/api/social/portfolio/attribution', {
      method: 'POST', body: JSON.stringify(data),
    }),

  socialBlast: (data: { platforms: string[]; content_type: string; content_id: string; caption: string }) =>
    request<any>('/api/social/blast', {
      method: 'POST', body: JSON.stringify(data),
    }),

  socialApplyReferral: (code: string) =>
    request<any>('/api/social/referral/apply', {
      method: 'POST', body: JSON.stringify({ code }),
    }),

  // ── Content (Offline) ───────────────────────────────────────────────────────
  contentGetManifest: () => request<any>('/api/content/manifest'),

  contentGetTrackVersion: (trackId: string) =>
    request<any>(`/api/content/${trackId}/version`),

  contentGetTrack: (trackId: string) => request<any>(`/api/content/${trackId}`),

  // ── Device Sessions ─────────────────────────────────────────────────────────
  deviceRegister: (data: { device_id: string; device_name?: string; platform?: string; push_token?: string }) =>
    request<any>('/api/devices/register', {
      method: 'POST', body: JSON.stringify(data),
    }),

  deviceGetMe: () => request<any>('/api/devices/me'),

  deviceRevokeAll: () =>
    request<any>('/api/devices/revoke', { method: 'POST' }),

  deviceUpdatePushToken: (pushToken: string) =>
    request<any>('/api/devices/push-token', {
      method: 'PUT', body: JSON.stringify({ push_token: pushToken }),
    }),

  // ── Game Extra ──────────────────────────────────────────────────────────────
  getLastPosition: () => request<any>('/api/game/last-position'),

  getUserProgress: () => request<any>('/api/users/progress'),

  setActiveField: (fieldId: string, fieldColor?: string) =>
    request<any>('/api/users/active-field', {
      method: 'POST', body: JSON.stringify({ field_id: fieldId, field_color: fieldColor }),
    }),

  // ── Portfolio Hub (extended) ────────────────────────────────────────────────
  portfolioGetAccounts: () => request<any>('/api/portfolio/accounts'),

  getPortfolioArtifacts: () => request<any[]>('/api/portfolio/items'),

  getPortfolioPlatformStatuses: () =>
    request<any[]>('/api/portfolio/accounts'),

  pushPortfolioArtifact: (data: { itemId?: string; artifactId?: string; platformId?: string; platformIds?: string[]; caption?: string }) =>
    request<any[]>('/api/portfolio/items/push', {
      method: 'POST', body: JSON.stringify({
        item_id: data.itemId ?? data.artifactId,
        platform_ids: data.platformIds ?? (data.platformId ? [data.platformId] : []),
        caption: data.caption ?? '',
      }),
    }),

  getPlatformAuthUrl: (platformId: string) =>
    request<{ url: string }>(`/api/portfolio/oauth/${platformId}/url`),

  disconnectPlatform: (platformId: string) =>
    request<any>(`/api/portfolio/accounts/${platformId}`, { method: 'DELETE' }),

  // ── Gate / Progression ──────────────────────────────────────────────────────
  getPhase2GateStatus: () => request<any>('/api/game/quant-gate'),

  getAggregateSimStatus: () => request<any>('/api/game/state'),

  getRemediationSets: () => request<any[]>('/api/v2/challenges?status=remediation'),

  getEndOfLevelRetries: () => request<any[]>('/api/v2/xp/history'),

  submitEndOfLevelRetry: (data: { levelId?: number; trackId?: string; simId?: string; answer?: any; answers?: any }) =>
    request<any>('/api/game/complete-level', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // ── Admin ───────────────────────────────────────────────────────────────────
  adminSyncAirtable: () =>
    request<any>('/api/admin/sync/airtable', { method: 'POST' }),

  adminSyncAirtableStatus: () => request<any>('/api/admin/sync/airtable/status'),

  // ── Rooms ──────────────────────────────────────────────────────────────────
  roomGetMessages: (roomId: string, limit = 50) =>
    request<any[]>(`/api/rooms/${roomId}/messages?limit=${limit}`),

  roomPostMessage: (roomId: string, data: Record<string, unknown>) =>
    request<any>(`/api/rooms/${roomId}/messages`, {
      method: 'POST', body: JSON.stringify(data),
    }),

  roomReactToMessage: (messageId: string, emoji: string) =>
    request<any>(`/api/rooms/messages/${messageId}/react`, {
      method: 'POST', body: JSON.stringify({ emoji }),
    }),

  // ── Referrals ──────────────────────────────────────────────────────────────
  getReferralStats: () => request<any>('/api/referrals/stats'),

  // ── Rewards / Badges ───────────────────────────────────────────────────────
  rewardsAward: (data: Record<string, unknown>) =>
    request<any>('/api/rewards/award', {
      method: 'POST', body: JSON.stringify(data),
    }),

  rewardsBadgesGrant: (userId: string, badges: unknown[]) =>
    request<any>('/api/rewards/badges/grant', {
      method: 'POST', body: JSON.stringify({ userId, badges }),
    }),

  // ── Challenges ─────────────────────────────────────────────────────────────
  challengesList: (filters?: Record<string, unknown>) =>
    request<any>('/api/challenges'),

  challengeGetTeam: (challengeId: string) =>
    request<any>(`/api/challenges/${challengeId}/team`),

  challengeAcceptInvite: (challengeId: string, inviteCode: string) =>
    request<any>(`/api/challenges/${challengeId}/accept-invite`, {
      method: 'POST', body: JSON.stringify({ invite_code: inviteCode }),
    }),

  challengeSubmit: (challengeId: string, data: Record<string, unknown>) =>
    request<any>(`/api/challenges/${challengeId}/submit`, {
      method: 'POST', body: JSON.stringify(data),
    }),

  // ── Leaderboard ────────────────────────────────────────────────────────────
  leaderboardGet: (scope: string, fieldId?: string, trackId?: string) =>
    request<any>(`/api/leaderboard?scope=${scope}${fieldId ? `&field_id=${fieldId}` : ''}${trackId ? `&track_id=${trackId}` : ''}`),
};
