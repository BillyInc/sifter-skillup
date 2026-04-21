/**
 * Sifter Skill_Up — Social Rewards Types
 * Single source of truth for all Social + Rewards types.
 * Import from here everywhere in the social rewards system.
 */

import type { BadgeRarity, SubmissionType } from '../theme/rewards';

// ─── Badge ─────────────────────────────────────────────────────────────────────

export type BadgeCategory =
  | 'track_complete' | 'field_mastery' | 'streak' | 'challenge_winner'
  | 'guild_champion' | 'level_milestone' | 'first_lesson' | 'perfect_lab'
  | 'community' | 'merchandise';

export interface Badge {
  id:          string;
  name:        string;
  emoji:       string;
  description: string;
  field_id?:   string;
  track_id?:   string;
  category:    BadgeCategory;
  earned_at:   string;
  rarity:      BadgeRarity;
  metadata?:   Record<string, unknown>;
}

// ─── User profile extensions ──────────────────────────────────────────────────

export interface SocialUserExtensions {
  merch_credits:        number;
  token_balance:        number;
  token_currency:       string;
  cash_balance_cents:   number;
  badges:               Badge[];
  guild_id:             string | null;
  active_challenge_id:  string | null;
  challenge_room_ids:   string[];
  xp_stage:             number;
  streak:               number;
}

// ─── Challenge ────────────────────────────────────────────────────────────────

export interface ChallengeReward {
  xp:               number;
  badge_id:         string;
  winner_badge_id:  string;
  merch_credits:    number;
  token_amount:     number;
  token_currency:   string;
  cash_cents:       number;
  cash_currency:    string;
  sponsor_provided: boolean;
}

export interface Challenge {
  id:               string;
  title:            string;
  field_id:         string;
  track_ids:        string[];
  brief:            string;
  submission_type:  SubmissionType;
  start_date:       string;
  end_date:         string;
  max_team_size:    number;
  reward:           ChallengeReward;
  status:           'open' | 'active' | 'voting' | 'complete' | 'archived';
  sponsor_name?:    string;
  sponsor_logo_url?:string;
}

export interface ChallengeTeamMember {
  user_id:   string;
  username:  string;
  xp_stage:  number;
  role:      'member' | 'lead';
  joined_at: string;
  accepted:  boolean;
}

export interface ChallengeSubmission {
  type:               SubmissionType;
  content:            string;
  url?:               string;
  portfolio_item_id?: string;
  submitted_at:       string;
  submitted_by?:      string;
}

export interface ChallengeTeam {
  id:                  string;
  challenge_id:        string;
  room_id:             string;
  members:             ChallengeTeamMember[];
  submission?:         ChallengeSubmission;
  votes_received:      number;
  rank?:               number;
  partially_balanced?: boolean;
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export type RoomType = 'track_discussion' | 'field_discussion' | 'challenge_private' | 'guild_chat';
export type MessageType = 'text' | 'lesson_share' | 'portfolio_share' | 'challenge_update' | 'reward_celebrate';

export interface Room {
  id:              string;
  type:            RoomType;
  name:            string;
  field_id?:       string;
  track_id?:       string;
  challenge_id?:   string;
  team_id?:        string;
  member_ids:      string[];
  is_private:      boolean;
  created_at:      string;
  last_message_at: string;
}

export interface RoomMessage {
  id:                    string;
  room_id:               string;
  author_id:             string;
  author_username:       string;
  author_stage:          number;
  message_type:          MessageType;
  content:               string;
  attached_lesson_id?:   number;
  attached_lesson_title?:string;
  reactions:             Record<string, number>;
  created_at:            string;
  edited_at?:            string;
}

// ─── Guild ─────────────────────────────────────────────────────────────────────

export interface Guild {
  id:          string;
  name:        string;
  field_id:    string;
  icon:        string;
  description: string;
  member_ids:  string[];
  max_members: number;
  weekly_xp:   number;
  total_xp:    number;
  rank:        number;
  room_id:     string;
  created_at:  string;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank:         number;
  user_id:      string;
  username:     string;
  avatar_emoji: string;
  xp_stage:     number;
  weekly_xp:    number;
  total_xp:     number;
  field_id?:    string;
  track_id?:    string;
  delta_rank:   number;
}

export interface Leaderboard {
  scope:       'global' | 'field' | 'track';
  field_id?:   string;
  track_id?:   string;
  week_start:  string;
  week_end:    string;
  entries:     LeaderboardEntry[];
  user_entry?: LeaderboardEntry;
}

// ─── Merchandise ──────────────────────────────────────────────────────────────

export interface UnlockCondition {
  type:         'track_complete' | 'field_mastery' | 'xp_stage' | 'challenge_winner' | 'open';
  track_id?:    string;
  field_id?:    string;
  xp_stage?:    number;
  description:  string;
}

export interface MerchandiseItem {
  id:                   string;
  name:                 string;
  field_id:             string;
  track_id?:            string;
  category:             'tee' | 'hoodie' | 'jacket' | 'cap' | 'footwear' | 'accessory';
  tier:                 'foundation' | 'core' | 'expert' | 'staff_plus';
  price_usd:            number;
  merch_credits_cost:   number;
  unlock_condition:     UnlockCondition;
  image_url:            string;
  description:          string;
  technical_embedding:  string;
  shopify_product_id?:  string;
  available:            boolean;
}

// ─── UserProfile (full extended) ─────────────────────────────────────────────

export interface UserProfile extends SocialUserExtensions {
  id:               string;
  username:         string;
  email:            string;
  points:           number;
  currentTrackId:   string;
  currentFieldId:   string;
  completed_levels: number[];
  streak:           number;
}
