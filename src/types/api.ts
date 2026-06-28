/**
 * Sifter LevelUp — Backend API type definitions
 *
 * Mirror of backend/models.py Pydantic models. Keeping these in one
 * place lets us drop `any` from src/lib/api.ts return types and gives
 * call sites real autocomplete + compile-time safety.
 *
 * Naming convention: snake_case fields match the wire format. JSDoc
 * comments mark which backend route the type maps to.
 */

// ─── Branded primitive types (newtype pattern) ────────────────────────────────
// Make IDs that look the same not interchangeable.

export type Brand<K, T> = K & { readonly __brand: T };
export type UserId = Brand<string, 'UserId'>;
export type DeviceId = Brand<string, 'DeviceId'>;
export type LevelId = Brand<number, 'LevelId'>;
export type LabId = Brand<string, 'LabId'>;
export type LessonId = Brand<string, 'LessonId'>;
export type TrackId = Brand<string, 'TrackId'>;
export type FieldId = Brand<string, 'FieldId'>;
export type BadgeId = Brand<string, 'BadgeId'>;
export type ChallengeId = Brand<string, 'ChallengeId'>;
export type FeedItemId = Brand<string, 'FeedItemId'>;
export type MerchItemId = Brand<string, 'MerchItemId'>;
export type StarknetAddress = Brand<string, 'StarknetAddress'>;
export type StarknetTxHash = Brand<string, 'StarknetTxHash'>;
export type ISODateString = Brand<string, 'ISODateString'>;

// Helper to brand at call site
export const brand = <T extends Brand<unknown, unknown>>(v: T extends Brand<infer K, unknown> ? K : never): T => v as T;

// ─── Enums (matches backend Literals) ─────────────────────────────────────────

export type TrackType =
  | 'crypto'
  | 'quant-trading'
  | 'quant-research'
  | 'quant-developer'
  | 'python'
  | 'starknet-defi-navigator'
  | 'supply-chain'
  | 'defi-research-analyst';

export type QueuePriority = 'critical' | 'high' | 'normal';

export type SyncStatus = 'pending' | 'applied' | 'conflict' | 'rejected';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type AuthProvider = 'guest' | 'telegram' | 'base-wallet' | 'email' | 'starknet';

export type Network = 'sepolia' | 'mainnet';

export type FeedReaction = 'like' | 'bookmark' | 'share';

export type SocialPlatform =
  | 'twitter' | 'linkedin' | 'github' | 'medium' | 'reddit'
  | 'instagram' | 'facebook' | 'behance' | 'dribbble' | 'youtube';

export type DevicePlatform = 'ios' | 'android' | 'web' | 'unknown';

// ─── Response envelope ────────────────────────────────────────────────────────

/** Wire-level wrapper used by every backend response (models.ResponseModel). */
export interface ResponseEnvelope<T> {
  success: boolean;
  message?: string | null;
  data?: T | null;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: UserId;
  email?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  auth_provider: AuthProvider;
  points: number;
  streak: number;
  current_level: number;
  completed_levels: string[];
  perfect_levels: string[];
  python_chapters_completed: string[];
  active_track: TrackType;
  active_field_id?: FieldId | null;
  active_field_color?: string | null;
  current_track_id?: TrackId | null;
  current_track_name?: string | null;
  starknet_address?: StarknetAddress | null;
  starknet_wallet_id?: string | null;
  starknet_public_key?: string | null;
  starknet_auth: boolean;
  is_verified: boolean;
  is_admin: boolean;
  merch_credits: number;
  xp_stage: number;
  referral_code?: string | null;
  onboarding_completed: boolean;
  last_position?: Record<string, unknown> | null;
  created_at: ISODateString;
  last_login?: ISODateString;
  // Theme/UI extensions
  settings?: UserSettings;
  achievements?: string[];
  guild_id?: string | null;
  guild_role?: string | null;
}

export interface UserSettings {
  notifications?: boolean;
  sound?: boolean;
  haptics?: boolean;
  [key: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// ─── Game / Levels ────────────────────────────────────────────────────────────

export interface LevelCompletePayload {
  level_id: number;
  track: TrackType;
  score: number;
  time_seconds?: number;
  is_perfect?: boolean;
  boosters_used?: Record<string, number>;
  lab_id?: string;
  lesson_id?: string;
}

export interface LevelCompleteResult {
  user: UserProfile;
  xp_awarded: number;
  badges_unlocked: BadgeId[];
  level_up?: boolean;
}

export interface GameState {
  state: Record<string, unknown>;
  updated_at: ISODateString;
}

export interface UserProgress {
  user_id: UserId;
  completed_levels: string[];
  perfect_levels: string[];
  current_level: number;
  current_track_id?: TrackId | null;
  active_field_id?: FieldId | null;
  points: number;
  streak: number;
  xp_stage: number;
}

export interface LastPosition {
  track_id: string;
  level?: string;
  lab_id: string;
  lesson_id: string;
  lesson_index?: number;
  lab_index?: number;
  saved_at?: ISODateString;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  rarity: BadgeRarity;
  sort_order: number;
  created_at?: ISODateString;
}

export interface UserBadge {
  id: string;
  user_id: UserId;
  badge_id: BadgeId;
  reason?: string | null;
  earned_at: ISODateString;
}

// ─── XP Events ────────────────────────────────────────────────────────────────

export interface XPEventPayload {
  event_type: string;
  xp_amount: number;
  source_id?: string | null;
  metadata?: Record<string, unknown>;
}

export interface XPEvent {
  id: string;
  user_id: UserId;
  event_type: string;
  xp_amount: number;
  source_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: ISODateString;
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export interface Challenge {
  id: ChallengeId;
  title: string;
  description?: string | null;
  track_id?: string | null;
  challenge_type: string;
  xp_reward: number;
  status: 'active' | 'expired' | 'remediation';
  starts_at: ISODateString;
  ends_at?: ISODateString | null;
  created_at: ISODateString;
}

// ─── Merchandise ──────────────────────────────────────────────────────────────

export interface MerchandiseItem {
  id: MerchItemId;
  name: string;
  description?: string | null;
  image_url?: string | null;
  credit_cost: number;
  available: boolean;
  sort_order: number;
}

export interface MerchandiseOrder {
  id: string;
  user_id: UserId;
  item_id: MerchItemId;
  credits_used: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  shipping_info?: Record<string, unknown> | null;
  created_at: ISODateString;
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export interface FeedItem {
  id: FeedItemId;
  track_id: string;
  title: string;
  summary?: string | null;
  url: string;
  source?: string | null;
  image_url?: string | null;
  published_at: ISODateString;
  is_published: boolean;
  like_count: number;
  bookmark_count: number;
  share_count: number;
  // Client-side enrichment (optional)
  myReaction?: FeedReaction | null;
  isBookmarked?: boolean;
  commentCount?: number;
}

export interface FeedSubscription {
  user_id: UserId;
  track_ids: string[];
  field_ids: string[];
  updated_at: ISODateString;
}

// ─── Starknet ─────────────────────────────────────────────────────────────────

export interface StarknetTransaction {
  id: string;
  user_id: UserId;
  tx_hash: StarknetTxHash;
  network: Network;
  tx_type: string;
  lesson_id?: string | null;
  lab_id?: string | null;
  amount?: string | null;
  token?: string | null;
  explorer_url?: string | null;
  created_at: ISODateString;
}

export interface StarknetStatus {
  connected: boolean;
  address?: StarknetAddress | null;
  network?: Network;
  email?: string | null;
}

// ─── Devices ──────────────────────────────────────────────────────────────────

export interface DeviceSession {
  id: string;
  user_id: UserId;
  device_id: DeviceId;
  device_name: string;
  platform: DevicePlatform;
  app_version?: string | null;
  is_active: boolean;
  created_at: ISODateString;
  last_seen: ISODateString;
  revoked_at?: ISODateString | null;
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface PortfolioAccount {
  id: string;
  user_id: UserId;
  platform_id: string;
  username: string;
  profile_url: string;
  auth_method: 'oauth' | 'manual' | 'auto_created' | 'token';
  connected_at: ISODateString;
  updated_at: ISODateString;
}

export interface PortfolioItem {
  id: string;
  user_id: UserId;
  title: string;
  description: string;
  field_id: FieldId;
  type: 'project' | 'writeup' | 'code' | 'design' | 'video' | 'certificate';
  tags: string[];
  file_url?: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PortfolioPushResult {
  id: string;
  item_id: string;
  user_id: UserId;
  platform_id: string;
  post_url: string;
  pushed_at: ISODateString;
}

export interface PortfolioArtifact {
  id: string;
  skill: string;
  framework?: string | null;
  badge_earned: BadgeId;
  user_work: string;
  score: number;
  total: number;
  pushedTo: string[];
  created_at?: ISODateString;
}

export interface PlatformStatus {
  id: string;
  name: string;
  connected: boolean;
  username?: string | null;
}

// ─── Offline Sync ─────────────────────────────────────────────────────────────

export interface OfflineQueueItem {
  id: string;
  priority: QueuePriority;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body: Record<string, unknown>;
  created_at: ISODateString;
  attempts?: number;
  device_id: DeviceId;
}

export interface SyncItemResult {
  id: string;
  status: SyncStatus;
  response?: unknown;
  error?: string | null;
}

export interface OfflineSyncResponse {
  results: SyncItemResult[];
  server_time: ISODateString;
  clock_skew_seconds: number;
}

// ─── Social ───────────────────────────────────────────────────────────────────

export interface SocialShare {
  id: string;
  user_id: UserId;
  platform: SocialPlatform;
  content_type: string;
  content_id: string;
  url?: string | null;
  xp_awarded: number;
  created_at: ISODateString;
}

export interface ReferralStats {
  user_id: UserId;
  referral_code: string;
  referrals_count: number;
  xp_earned: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  user_id: UserId;
  username?: string | null;
  avatar_url?: string | null;
  points: number;
  streak: number;
  current_level: number;
}

// ─── Guilds ───────────────────────────────────────────────────────────────────

export interface Guild {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  owner_id?: UserId | null;
  is_private: boolean;
  requires_approval: boolean;
  min_level: number;
  member_count: number;
  total_points: number;
  rank?: number | null;
  created_at: ISODateString;
}

// ─── Interview ────────────────────────────────────────────────────────────────

export interface InterviewSession {
  id: string;
  user_id: UserId;
  track_id: string;
  level: string;
  questions: InterviewQuestion[];
  answers: string[];
  status: 'in_progress' | 'completed' | 'expired';
  score?: number | null;
  started_at: ISODateString;
  completed_at?: ISODateString | null;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'open' | 'multiple_choice';
  tags?: string[];
}

export interface InterviewResult {
  interview_id: string;
  status: 'completed' | 'expired';
  score: number;
  total: number;
  feedback?: string;
}

// ─── Phase 5 / gating ─────────────────────────────────────────────────────────

export interface Phase2GateStatus {
  user_id: UserId;
  unlocked: boolean;
  required: number;
  current: number;
  blockers?: string[];
}

export interface AggregateSimStatus {
  user_id: UserId;
  total_completed: number;
  perfect_count: number;
  by_track: Record<string, number>;
}

export interface RemediationSet {
  simId: string;
  failedAt: ISODateString;
  retriesLeft: number;
  difficulty: 'junior' | 'intermediate' | 'senior';
}

export interface EndOfLevelRetry {
  simId: string;
  trackId: string;
  attempts: number;
}

// ─── AI scoring ───────────────────────────────────────────────────────────────

export interface AIScoreRequest {
  scenario: string;
  criteria: string[];
  userResponse: string;
  context?: string;
}

export interface AIScoreResult {
  criteriaResults: Array<{
    criterion: string;
    passed: boolean;
    feedback: string;
  }>;
  overallFeedback: string;
  score: number;
  total: number;
  xpEarned: number;
}

// ─── GitHub portfolio ─────────────────────────────────────────────────────────

export interface GitHubStatus {
  connected: boolean;
  username: string | null;
  avatar: string | null;
}

export interface GitHubRepo {
  name: string;
  url: string;
  description: string | null;
  stars: number;
  updated: string;
}

export interface GitHubPushResult {
  repo_url: string;
  files_pushed: string[];
  message: string;
}

export interface CreateRepoResult {
  url: string;
  name: string;
  clone_url: string;
}
