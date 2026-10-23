/**
 * Sifter LevelUp — API Client
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
import { API_BASE } from './config';
import { getOrCreateDeviceId } from './deviceId';
import type {
  UserProfile, AuthResponse, LevelCompletePayload, LevelCompleteResult,
  GameState, UserProgress, LastPosition, Badge, UserBadge,
  XPEventPayload, XPEvent, Challenge, MerchandiseItem, MerchandiseOrder,
  FeedItem, FeedSubscription, StarknetTransaction, StarknetStatus,
  DeviceSession, PortfolioAccount, PortfolioItem, PortfolioPushResult,
  OfflineQueueItem, OfflineSyncResponse, SocialShare, ReferralStats,
  LeaderboardEntry, Guild, InterviewSession, InterviewResult,
  Phase2GateStatus, AggregateSimStatus, RemediationSet, EndOfLevelRetry,
  AIScoreRequest, AIScoreResult, GitHubStatus, GitHubRepo, GitHubPushResult,
  CreateRepoResult, TrackType, FeedReaction, SocialPlatform, BadgeRarity, BadgeId,
} from '../types/api';
import { resolveRequestTimeout } from './requestTimeout';

// Re-export types for call sites that import { UserProfile, Badge, FeedItem } from './api'
export type { UserProfile, Badge, FeedItem } from '../types/api';

export { API_BASE } from './config';

const TOKEN_KEY = 'sifter_auth_token_v2';

/**
 * Loose "cross-module compat" return type. Used for a handful of endpoints
 * where screens/stores declare their own local types (e.g. `Guild`,
 * `PortfolioArtifact`, `InterviewResult`) that differ slightly from the
 * canonical wire shapes in src/types/api.ts. Rather than forcing edits to
 * every call site in this refactor pass, these endpoints are typed as
 * `CompatAny` so they remain assignable to the screen-local types.
 *
 * Each usage has a comment pointing at the canonical type in types/api.ts.
 */
 
type CompatAny = any;

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

/**
 * The device id every authenticated request must carry.
 *
 * The backend runs DeviceSessionMiddleware with SINGLE_DEVICE_ENFORCEMENT=true,
 * which 401s any authenticated request lacking a valid `X-Device-Id`. Only
 * offlineStorage's sync-drain ever sent it, so on a deployed server every other
 * authenticated call failed — sign-in succeeded and then everything after it
 * returned "This account is active on another device."
 *
 * Resolved once and cached: getOrCreateDeviceId touches SecureStore/AsyncStorage
 * and this sits in the hot path of every request.
 */
let deviceIdPromise: Promise<string | null> | null = null;
function getDeviceIdCached(): Promise<string | null> {
  if (!deviceIdPromise) {
    deviceIdPromise = getOrCreateDeviceId().catch((e) => {
      // Never block a request on this: an unauthenticated call does not need
      // the header at all, and a failure here should surface as the server's
      // own 401 rather than an opaque client crash.
      logger.warn('Failed to resolve device id', { error: e });
      return null;
    });
  }
  return deviceIdPromise;
}

type RequestOptions = RequestInit & { timeoutMs?: number };

// A common policy prevents one screen's default timeout from expiring before
// a slow but successful backend read. Writes can specify a route-specific
// timeout where appropriate.
export { API_READ_TIMEOUT_MS } from './requestTimeout';

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const startTime = Date.now();
  const { timeoutMs: requestedTimeoutMs, ...fetchOptions } = options;
  const method = (fetchOptions.method ?? "GET").toUpperCase();
  const timeoutMs = resolveRequestTimeout(method, requestedTimeoutMs);
  const token = await getToken();
  // Sent on EVERY request, not just authenticated ones. The auth endpoints
  // are where the session is created: _post_auth_device_register reads
  // `X-Device-Id` (or a body device_id) after a successful login and only
  // registers a session when one is present. Gating this on `token` would mean
  // login never registers a device, and then every later request fails
  // validate_device_header with "no active session" — trading a
  // `device_required` 401 for a `device_mismatch` 401.
  const deviceId = await getDeviceIdCached();
  const isFormDataBody =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  logger.debug('API request started', {
    endpoint: path,
    method,
    hasAuthorization: !!token,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const upstreamSignal = fetchOptions.signal;
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal?.aborted) abortFromUpstream();
  else upstreamSignal?.addEventListener('abort', abortFromUpstream, { once: true });

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        ...(isFormDataBody ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(deviceId ? { 'X-Device-Id': deviceId } : {}),
        ...options.headers,
      },
    });
    const duration = Date.now() - startTime;
    // Error responses are not guaranteed to be JSON (a stopped backend or a
    // proxy can return HTML/plain text). Parse defensively so the caller gets
    // the real transport/status failure instead of a JSON parser exception.
    const responseText = await res.text();
    let json: any = null;
    try {
      json = responseText ? JSON.parse(responseText) : null;
    } catch {
      json = null;
    }

    if (!res.ok || !json?.success) {
      const detail = typeof json?.detail === "string" ? json.detail : undefined;
      const detailMessage = typeof json?.detail?.message === "string" ? json.detail.message : undefined;
      const error = typeof json?.error === "string" ? json.error : undefined;
      const message = typeof json?.message === "string" ? json.message : undefined;
      throw new Error(
        error ?? detail ?? detailMessage ?? message ??
        (responseText.trim() ? responseText.trim().slice(0, 240) : `Request failed (${res.status})`),
      );
    }

    logger.info('API request completed', {
      endpoint: path,
      method,
      duration,
      status: res.status,
      success: true,
    });

    return json.data;
  } catch (error) {
    if ((error as Error)?.name === "AbortError") {
      throw new Error("The request took too long. Please try again.");
    }
    const duration = Date.now() - startTime;
    logger.error('API request failed', error as Error);
    logger.info('API request completed with error', {
      endpoint: path,
      method,
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    clearTimeout(timeout);
    upstreamSignal?.removeEventListener('abort', abortFromUpstream);
  }
}

export const API = {
  // Auth
  // NOTE: auth methods return `{ token; user: any }` so call sites in stores
  // (which define their own slightly-stricter UserProfile with fields like
  // `boosters`) stay compatible without edits. The canonical shape is
  // `AuthResponse` from src/types/api.ts.
  authTelegram: (initData: string) =>
    // type assertion: call sites extend UserProfile with store-local fields
    request<AuthResponse>('/api/auth/telegram', {
      method: 'POST', body: JSON.stringify({ initData }),
    }) as Promise<{ token: string; user: CompatAny }>,

  authBaseWallet: (walletAddress: string, signature: string, message: string) =>
    // type assertion: call sites extend UserProfile with store-local fields
    request<AuthResponse>('/api/auth/base-wallet', {
      method: 'POST', body: JSON.stringify({ walletAddress, signature, message }),
    }) as Promise<{ token: string; user: CompatAny }>,

  authGuest: () =>
    // type assertion: call sites extend UserProfile with store-local fields
    request<AuthResponse>('/api/auth/guest', { method: 'POST' }) as Promise<{ token: string; user: CompatAny }>,

  authSignup: (email: string, password: string, profile?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    date_of_birth?: string;
    email_code?: string;
    terms_version?: string;
    privacy_version?: string;
    analytics_consent?: boolean;
  }) =>
    // type assertion: call sites extend UserProfile with store-local fields
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST', body: JSON.stringify({ email, password, ...profile }),
    }) as Promise<{ token: string; user: CompatAny }>,

  requestEmailVerificationCode: (email: string) =>
    request<{ sent: boolean; expiresInMinutes: number; devCode?: string }>('/api/auth/email-code/request', {
      method: 'POST', body: JSON.stringify({ email }),
    }),

  requestPasswordResetCode: (email: string) =>
    request<{ sent: boolean; expiresInMinutes: number; devCode?: string }>('/api/auth/password-reset/request', {
      method: 'POST', body: JSON.stringify({ email }),
    }),

  getAdminMfa: () => request<{ status: string; method: string; last_verified_at?: string | null; deferred_until?: string | null }>('/api/auth/mfa'),

  requestAdminMfa: () =>
    request<{ sent: boolean; expiresInMinutes: number; devCode?: string }>('/api/auth/mfa/request', {
      method: 'POST', body: JSON.stringify({}),
    }),

  verifyAdminMfa: (code: string) =>
    request<{ token: string; status: string }>('/api/auth/mfa/verify', {
      method: 'POST', body: JSON.stringify({ code }),
    }),

  deferAdminMfa: () =>
    request<{ status: string }>('/api/auth/mfa/defer', {
      method: 'POST', body: JSON.stringify({}),
    }),

  confirmPasswordReset: (email: string, code: string, password: string) =>
    request<{ updated: boolean }>('/api/auth/password-reset/confirm', {
      method: 'POST', body: JSON.stringify({ email, code, password }),
    }),

  authLogin: (email: string, password: string) =>
    // type assertion: call sites extend UserProfile with store-local fields
    request<AuthResponse>('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }) as Promise<{ token: string; user: CompatAny }>,

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
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Web: clear localStorage directly (SecureStore is shimmed and may no-op)
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) {
        logger.warn('Failed to clear token from localStorage', { error: e });
      }
      return;
    }
    // Native: use SecureStore
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      logger.warn('Failed to clear token from SecureStore', { error: e });
    }
  },
  /** Synchronous web check used when a browser restores a cached React tree. */
  hasStoredToken: (): boolean | null => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try { return Boolean(localStorage.getItem(TOKEN_KEY)); } catch { return false; }
    }
    // Native storage is asynchronous; callers should use getToken there.
    return null;
  },
  getToken,  // exported for offline sync engines
  deleteMe: (): Promise<void> =>
    request<void>('/api/users/me', { method: 'DELETE' }),

  // AI Scoring — routes through backend so API key never lives in client
  scoreSimulator: (body: AIScoreRequest) =>
    request<AIScoreResult>('/api/ai/score', { method: 'POST', body: JSON.stringify(body) }),

  // User
  // NOTE: getMe/updateMe/checkStreak return `any` so multiple stores that
  // extend the canonical UserProfile with local-only fields (like `boosters`,
  // `settings`, etc.) stay source-compatible. Canonical shape: UserProfile.
  // type assertion: cross-module compat with stores that extend UserProfile
  getMe: (): Promise<CompatAny> => request<UserProfile>('/api/users/me'),
  updateMe: (updates: Partial<UserProfile> | Record<string, unknown>): Promise<CompatAny> =>
    request<UserProfile>('/api/users/me', { method: 'PUT', body: JSON.stringify(updates) }),
  recordLegalAcceptance: (acceptance: {
    termsVersion: string;
    privacyVersion: string;
    analyticsConsent: boolean;
  }) => request<{ accepted: boolean; user: UserProfile }>('/api/users/legal-acceptance', {
    method: 'POST',
    body: JSON.stringify({
      terms_version: acceptance.termsVersion,
      privacy_version: acceptance.privacyVersion,
      analytics_consent: acceptance.analyticsConsent,
    }),
  }),
  checkStreak: (): Promise<CompatAny> => request<UserProfile>('/api/users/streak', { method: 'POST' }),

  // Game
  // completeLevel accepts a loose payload — screens pass `track: string` and
  // various extra fields. Canonical shape is LevelCompletePayload.
  completeLevel: (payload: Omit<LevelCompletePayload, 'track'> & { track: TrackType | string } & Record<string, unknown>) =>
    request<LevelCompleteResult & Record<string, unknown>>('/api/game/complete-level', { method: 'POST', body: JSON.stringify(payload) }),
  getGameState: () => request<GameState>('/api/game/state'),
  saveGameState: (state: Record<string, unknown>) =>
    request<GameState>('/api/game/state', { method: 'POST', body: JSON.stringify({ state }) }),
  getQuantGate: () => request<Phase2GateStatus>('/api/game/quant-gate'),

  // Leaderboard
  getLeaderboard: (limit = 100) => request<LeaderboardEntry[]>(`/api/leaderboard/users?limit=${limit}`),
  getGuildLeaderboard: () => request<Guild[]>('/api/leaderboard/guilds'),

  // Guilds
  // NOTE: GuildScreen declares its own Guild shape — return a loose record
  // so the screen's useState<Guild[]> stays assignable.
  getGuilds: (search?: string) =>
    // type assertion: screens use local Guild type
    request<Guild[]>(`/api/guilds${search ? `?search=${search}` : ''}`) as Promise<CompatAny[]>,
  createGuild: (data: Partial<Guild> & Record<string, unknown>) =>
    // type assertion: screens use local Guild type
    request<Guild>('/api/guilds', { method: 'POST', body: JSON.stringify(data) }) as Promise<CompatAny>,
  joinGuild: (id: string) =>
    // type assertion: screens use local Guild type
    request<Guild>(`/api/guilds/${id}/join`, { method: 'POST' }) as Promise<CompatAny>,

  // Withdrawals
  getWithdrawals: () => request<Record<string, unknown>[]>('/api/withdrawals'),
  requestWithdrawal: (data: Record<string, unknown>) =>
    request<Record<string, unknown>>('/api/withdrawals', { method: 'POST', body: JSON.stringify(data) }),

  // GitHub
  githubAuthUrl: () =>
    request<{ url: string; state: string }>('/api/github/auth-url'),

  githubStatus: () =>
    request<GitHubStatus>('/api/github/status'),

  githubDisconnect: () =>
    request<void>('/api/github/disconnect', { method: 'POST' }),

  githubRepos: () =>
    request<GitHubRepo[]>('/api/github/repos'),

  pushPortfolio: (repo_name: string, files: { path: string; content: string }[]) =>
    request<GitHubPushResult>('/api/github/push-portfolio', {
      method: 'POST',
      body: JSON.stringify({ repo_name, files }),
    }),

  createRepo: (name: string, description?: string, isPrivate?: boolean) =>
    request<CreateRepoResult>('/api/github/create-repo', {
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
  completeOnboarding: (data: { active_track?: string; recommended_tracks?: string[]; account_type?: 'student' | 'educator' | 'institution_admin' }) =>
    request<UserProfile>('/api/users/onboarding-complete', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // Interview Mode
  startInterview: (trackId: string, level: string) =>
    request<InterviewSession>('/api/interview/start', {
      method: 'POST', body: JSON.stringify({ track_id: trackId, level }),
    }),
  submitInterviewAnswer: (interviewId: string, questionIndex: number, answer: string) =>
    request<{ interview_id: string; answers_count: number; complete?: boolean; nextQuestion?: unknown }>('/api/interview/answer', {
      method: 'POST', body: JSON.stringify({ interview_id: interviewId, question_index: questionIndex, answer }),
    }),
  // type assertion: screens declare their own InterviewResult
  getInterviewResult: (interviewId: string) =>
    request<InterviewResult>(`/api/interview/${interviewId}/result`) as Promise<CompatAny>,

  // Push notifications
  savePushToken: (token: string) =>
    request<void>('/api/users/push-token', {
      method: 'POST', body: JSON.stringify({ token }),
    }),

  // Feedback & analytics
  submitFeedback: (data: Record<string, unknown>) =>
    request<{ id: string }>('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
  trackEvent: (event_type: string, event_data: Record<string, unknown>, session_id?: string) =>
    request<{ id: string }>('/api/analytics/event', {
      method: 'POST', body: JSON.stringify({ event_type, event_data, session_id }),
    }),

  // ─── Portfolio Hub ────────────────────────────────────────────────────────

  // Connected Accounts
  portfolioGetConnectedAccounts: () =>
    request<PortfolioAccount[]>('/api/portfolio/accounts'),

  portfolioLinkAccount: (data: { platformId: string; username: string; profileUrl?: string }) =>
    request<PortfolioAccount>('/api/portfolio/accounts/link', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // type assertion: PortfolioScreen reads envelope fields
  portfolioDisconnectAccount: (platformId: string) =>
    request<{ success: boolean }>(`/api/portfolio/accounts/${platformId}`, { method: 'DELETE' }) as Promise<CompatAny>,

  // type assertion: PortfolioScreen reads envelope { success, data, message }
  portfolioCreateAccount: (data: {
    platformId: string;
    username: string;
    email: string;
    password?: string;
    displayName?: string;
    sourcedFrom?: string;
  }) =>
    request<PortfolioAccount>('/api/portfolio/accounts/create', {
      method: 'POST', body: JSON.stringify(data),
    }) as Promise<CompatAny>,

  // OAuth
  portfolioGetOAuthUrl: (platformId: string) =>
    request<{ url: string }>(`/api/portfolio/oauth/${platformId}/url`)
      .then(r => r?.url ?? null),

  // Portfolio Items
  // type assertion: PortfolioScreen expects wrapped envelope
  portfolioGetItems: (): Promise<CompatAny> =>
    request<{ items?: PortfolioItem[] } | PortfolioItem[]>('/api/portfolio/items').then(
      (r) => {
        if (Array.isArray(r)) return r;
        return r?.items ?? [];
      },
    ),

  portfolioAddItem: (data: {
    title: string;
    description: string;
    fieldId: string;
    type: string;
    tags?: string[];
    fileUrl?: string;
  }) =>
    request<PortfolioItem>('/api/portfolio/items', {
      method: 'POST', body: JSON.stringify(data),
    }),

  portfolioDeleteItem: (itemId: string) =>
    request<{ success: boolean }>(`/api/portfolio/items/${itemId}`, { method: 'DELETE' }),

  // Push to platforms
  // type assertion: screens read loose { platformId, postUrl } shape
  portfolioPushItem: (data: {
    itemId: string;
    platformIds: string[];
    caption: string;
    sourceAttribution?: string;
  }) =>
    request<PortfolioPushResult[]>('/api/portfolio/items/push', {
      method: 'POST', body: JSON.stringify(data),
    }) as Promise<CompatAny[]>,

  // Submission package (for manual-upload platforms)
  // type assertion: PortfolioScreen reads extra fields
  portfolioGeneratePackage: (data: { itemId: string; platformId: string }) =>
    request<{ url: string; content: string; instructions?: string }>('/api/portfolio/items/package', {
      method: 'POST', body: JSON.stringify(data),
    }) as Promise<CompatAny>,

  // ── Starknet DeFi Navigator ──────────────────────────────────────────────────
  navigatorLabComplete: (labNumber: number) =>
    request<LevelCompleteResult>('/api/game/navigator-lab-complete', {
      method: 'POST', body: JSON.stringify({ lab_number: labNumber }),
    }),

  starknetTxLog: (tx: { hash: string; network: string; type: string; lessonId?: string; labId?: string; amount?: string; token?: string }) =>
    request<StarknetTransaction>('/api/starknet/transactions', {
      method: 'POST', body: JSON.stringify(tx),
    }),

  starknetStatus: () => request<StarknetStatus>('/api/starknet/status'),

  syncDrain: (items: OfflineQueueItem[], deviceId: string) =>
    request<OfflineSyncResponse>('/api/sync/drain', {
      method: 'POST', body: JSON.stringify({ device_id: deviceId, items, client_time: new Date().toISOString() }),
    }),

  syncStatus: () => request<{ server_time: string; pending: number }>('/api/sync/status'),

  // ── Starknet RPC ────────────────────────────────────────────────────────────
  starknetRpc: (method: string, params: unknown[]) =>
    request<unknown>('/api/starknet/rpc', {
      method: 'POST', body: JSON.stringify({ method, params }),
    }),

  starknetAuthEmail: (email: string, privy_token: string) =>
    request<StarknetStatus>('/api/starknet/auth/email', {
      method: 'POST', body: JSON.stringify({ email, privy_token }),
    }),

  // ── Feed ────────────────────────────────────────────────────────────────────
  feedSubscribe: (tracks: string[]) =>
    request<FeedSubscription>('/api/feed/subscribe', {
      method: 'POST', body: JSON.stringify({ tracks }),
    }),

  feedGetSubscriptions: () => request<FeedSubscription>('/api/feed/subscriptions'),

  feedGetItems: (trackId?: string) =>
    request<FeedItem[]>(`/api/feed/${trackId ? `?track_id=${trackId}` : ''}`),

  feedGetItem: (itemId: string) => request<FeedItem>(`/api/feed/${itemId}`),

  feedReact: (itemId: string, reaction: FeedReaction | string) =>
    request<{ success: boolean; like_count?: number; bookmark_count?: number; share_count?: number }>('/api/feed/react', {
      method: 'POST', body: JSON.stringify({ item_id: itemId, reaction }),
    }),

  feedAddComment: (postId: string, content: string) =>
    request<Record<string, unknown>>('/api/posts/comment', {
      method: 'POST',
      body: JSON.stringify({ postId, content }),
    }),

  feedToggleBookmark: (postId: string, folderId = 'default') =>
    request<{ bookmarked: boolean }>('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ postId, folderId }),
    }),

  feedGetBookmarks: () =>
    request<Record<string, unknown>[]>('/api/bookmarks') as Promise<CompatAny[]>,

  // ── Phase 5 (XP, Badges, Challenges, Merch) ────────────────────────────────
  xpRecordEvent: (data: { event_type: string; xp: number; source?: string; metadata?: Record<string, unknown> }) =>
    request<XPEvent>('/api/v2/xp/event', {
      method: 'POST', body: JSON.stringify(data),
    }),

  xpGetHistory: () => request<XPEvent[]>('/api/v2/xp/history'),

  getBadges: () => request<Badge[]>('/api/v2/badges'),
  getMyBadges: () => request<Badge[]>('/api/v2/badges/me'),

  getChallenges: (status?: string) =>
    request<Challenge[]>(`/api/v2/challenges${status ? `?status=${status}` : ''}`),

  joinChallenge: (challengeId: string) =>
    request<Challenge>('/api/v2/challenges/join', {
      method: 'POST', body: JSON.stringify({ challenge_id: challengeId }),
    }),

  submitChallenge: (challengeId: string, proof?: Record<string, unknown>) =>
    request<Challenge>('/api/v2/challenges/submit', {
      method: 'POST', body: JSON.stringify({ challenge_id: challengeId, proof }),
    }),

  getMerchandise: () => request<MerchandiseItem[]>('/api/v2/merch'),

  redeemMerchandise: (itemId: string, shippingAddress?: Record<string, unknown>) =>
    request<MerchandiseOrder>('/api/v2/merch/redeem', {
      method: 'POST', body: JSON.stringify({ item_id: itemId, shipping_address: shippingAddress }),
    }),

  // ── Social Rewards ──────────────────────────────────────────────────────────
  socialShare: (data: { platform: SocialPlatform | string; content_type: string; content_id?: string; url?: string }) =>
    request<SocialShare>('/api/social/share', {
      method: 'POST', body: JSON.stringify(data),
    }),

  socialGetShares: () => request<SocialShare[]>('/api/social/shares/me'),

  socialPortfolioAttribution: (data: { item_id: string; platform: SocialPlatform | string; url: string }) =>
    request<SocialShare>('/api/social/portfolio/attribution', {
      method: 'POST', body: JSON.stringify(data),
    }),

  socialBlast: (data: { platforms: (SocialPlatform | string)[]; content_type: string; content_id: string; caption: string }) =>
    request<SocialShare[]>('/api/social/blast', {
      method: 'POST', body: JSON.stringify(data),
    }),

  socialApplyReferral: (code: string) =>
    request<ReferralStats>('/api/social/referral/apply', {
      method: 'POST', body: JSON.stringify({ code }),
    }),

  // ── Content (Offline) ───────────────────────────────────────────────────────
  contentGetManifest: () => request<Record<string, unknown>>('/api/content/manifest'),

  contentGetTrackVersion: (trackId: string) =>
    request<{ version: string; updated_at: string }>(`/api/content/${trackId}/version`),

  contentGetTrack: (trackId: string) => request<Record<string, unknown>>(`/api/content/${trackId}`),

  // ── Device Sessions ─────────────────────────────────────────────────────────
  deviceRegister: (data: { device_id: string; device_name?: string; platform?: string; push_token?: string }) =>
    request<DeviceSession>('/api/devices/register', {
      method: 'POST', body: JSON.stringify(data),
    }),

  deviceGetMe: () => request<DeviceSession[]>('/api/devices/me'),

  deviceRevokeAll: () =>
    request<{ success: boolean; revoked: number }>('/api/devices/revoke', { method: 'POST' }),

  deviceUpdatePushToken: (pushToken: string) =>
    request<DeviceSession>('/api/devices/push-token', {
      method: 'PUT', body: JSON.stringify({ push_token: pushToken }),
    }),

  // ── Game Extra ──────────────────────────────────────────────────────────────
  getLastPosition: () => request<LastPosition | null>('/api/game/last-position'),

  getUserProgress: () => request<UserProgress>('/api/users/progress'),

  setActiveField: (fieldId: string, fieldColor?: string) =>
    request<UserProfile>('/api/users/active-field', {
      method: 'POST', body: JSON.stringify({ field_id: fieldId, field_color: fieldColor }),
    }),

  // ── Portfolio Hub (extended) ────────────────────────────────────────────────
  // type assertion: PortfolioScreen reads envelope { accounts, items }
  portfolioGetAccounts: () =>
    request<PortfolioAccount[]>('/api/portfolio/accounts') as Promise<CompatAny>,

  // type assertion: screens declare their own PortfolioArtifact
  getPortfolioArtifacts: () =>
    request<PortfolioItem[]>('/api/portfolio/items') as Promise<CompatAny[]>,

  // type assertion: screens declare their own PlatformStatus
  getPortfolioPlatformStatuses: () =>
    request<PortfolioAccount[]>('/api/portfolio/accounts') as Promise<CompatAny[]>,

  pushPortfolioArtifact: (
    data:
      | { itemId: string; platformIds: string[]; caption?: string }
      | { artifactId: string; platformId: string; caption?: string },
  ) => {
    let item_id: string;
    let platform_ids: string[];
    if ('itemId' in data && Array.isArray(data.platformIds)) {
      item_id = data.itemId;
      platform_ids = data.platformIds;
    } else if ('artifactId' in data && typeof data.platformId === 'string') {
      item_id = data.artifactId;
      platform_ids = [data.platformId];
    } else {
      throw new Error('invalid pushPortfolioArtifact payload');
    }
    // type assertion: screens read loose { platformId, postUrl } shape
    return request<PortfolioPushResult[]>('/api/portfolio/items/push', {
      method: 'POST',
      body: JSON.stringify({
        item_id,
        platform_ids,
        caption: data.caption ?? '',
      }),
    }) as Promise<CompatAny[]>;
  },

  getPlatformAuthUrl: (platformId: string) =>
    request<{ url: string }>(`/api/portfolio/oauth/${platformId}/url`),

  disconnectPlatform: (platformId: string) =>
    request<{ success: boolean }>(`/api/portfolio/accounts/${platformId}`, { method: 'DELETE' }),

  // ── Gate / Progression ──────────────────────────────────────────────────────
  // type assertion: screens useState<Phase2GateStatus | null>
  getPhase2GateStatus: () =>
    request<Phase2GateStatus>('/api/game/quant-gate') as Promise<CompatAny>,

  // type assertion: screens declare their own AggSimStatus
  getAggregateSimStatus: () =>
    request<AggregateSimStatus>('/api/game/state') as Promise<CompatAny>,

  getRemediationSets: () => request<RemediationSet[]>('/api/v2/challenges?status=remediation'),

  getEndOfLevelRetries: () => request<EndOfLevelRetry[]>('/api/v2/xp/history'),

  // type assertion: PortfolioHubScreen reads { passed, phase2NowUnlocked }
  submitEndOfLevelRetry: (data: { levelId?: number; trackId?: string; simId?: string; answer?: unknown; answers?: unknown }) =>
    request<LevelCompleteResult>('/api/game/complete-level', {
      method: 'POST', body: JSON.stringify(data),
    }) as Promise<CompatAny>,

  // ── Admin ───────────────────────────────────────────────────────────────────
  adminSyncAirtable: () =>
    request<{ job_id: string; status: string }>('/api/admin/sync/airtable', { method: 'POST' }),

  adminSyncAirtableStatus: () =>
    request<{ status: string; last_run?: string; error?: string }>('/api/admin/sync/airtable/status'),

  // ── Rooms ──────────────────────────────────────────────────────────────────
  // type assertion: TrackRoomScreen declares its own RoomMessage
  roomGetMessages: (roomId: string, limit = 50) =>
    request<Record<string, unknown>[]>(`/api/rooms/${roomId}/messages?limit=${limit}`) as Promise<CompatAny[]>,

  roomPostMessage: (roomId: string, data: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/api/rooms/${roomId}/messages`, {
      method: 'POST', body: JSON.stringify(data),
    }),

  roomReactToMessage: (messageId: string, emoji: string) =>
    request<{ success: boolean }>(`/api/rooms/messages/${messageId}/react`, {
      method: 'POST', body: JSON.stringify({ emoji }),
    }),

  // ── Referrals ──────────────────────────────────────────────────────────────
  // type assertion: ReferralScreen declares its own ReferralStats
  getReferralStats: () => request<ReferralStats>('/api/referrals/stats') as Promise<CompatAny>,

  // ── Rewards / Badges ───────────────────────────────────────────────────────
  rewardsAward: (data: Record<string, unknown>) =>
    request<{ success: boolean; xp_awarded?: number }>('/api/rewards/award', {
      method: 'POST', body: JSON.stringify(data),
    }),

  rewardsBadgesGrant: (userId: string, badges: unknown[]) =>
    request<{ success: boolean; granted: BadgeId[] | string[] }>('/api/rewards/badges/grant', {
      method: 'POST', body: JSON.stringify({ userId, badges }),
    }),

  // ── Challenges ─────────────────────────────────────────────────────────────
  // type assertion: challengeEngine declares its own Challenge/ChallengeTeam
  challengesList: (filters?: Record<string, unknown>): Promise<CompatAny> => {
    const qs = filters
      ? new URLSearchParams(
          Object.entries(filters)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)]),
        ).toString()
      : '';
    return request<Challenge[]>(`/api/challenges${qs ? `?${qs}` : ''}`);
  },

  // type assertion: challengeEngine declares its own ChallengeTeam
  challengeGetTeam: (challengeId: string): Promise<CompatAny> =>
    request<Record<string, unknown>>(`/api/challenges/${challengeId}/team`),

  // type assertion: challengeEngine reads { room_id }
  challengeAcceptInvite: (challengeId: string, inviteCode: string): Promise<CompatAny> =>
    request<{ success: boolean; team_id?: string }>(`/api/challenges/${challengeId}/accept-invite`, {
      method: 'POST', body: JSON.stringify({ invite_code: inviteCode }),
    }),

  challengeSubmit: (challengeId: string, data: Record<string, unknown>) =>
    request<{ success: boolean; score?: number }>(`/api/challenges/${challengeId}/submit`, {
      method: 'POST', body: JSON.stringify(data),
    }),

  // ── Leaderboard ────────────────────────────────────────────────────────────
  // type assertion: leaderboardEngine declares its own Leaderboard envelope
  leaderboardGet: (scope: string, fieldId?: string, trackId?: string): Promise<CompatAny> => {
    const params = new URLSearchParams({ scope });
    if (fieldId) params.set('field_id', fieldId);
    if (trackId) params.set('track_id', trackId);
    return request<LeaderboardEntry[]>(`/api/leaderboard?${params.toString()}`);
  },
};
