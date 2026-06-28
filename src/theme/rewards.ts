/**
 * Sifter LevelUp — Rewards Theme Tokens
 * Badge rarity, submission types, reward table, and merch credit helpers.
 * Consumed by: rewardsEngine, RewardsBadge, ChallengeCard, MerchandiseScreen,
 *              challengeTemplates, types/social.
 */

// ─── Badge rarity ─────────────────────────────────────────────────────────────

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common:    '#9CA3AF',
  rare:      '#3B82F6',
  epic:      '#8B5CF6',
  legendary: '#F59E0B',
};

export const BADGE_RARITY_LABELS: Record<BadgeRarity, string> = {
  common:    'Common',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary',
};

// ─── Submission types ─────────────────────────────────────────────────────────

export type SubmissionType =
  | 'written_plus_link'
  | 'portfolio_artifact'
  | 'trade_writeup'
  | 'data_analysis'
  | 'code_repo'
  | 'audit_report'
  | 'live_demo'
  | 'video_presentation'
  | 'research_paper'
  | 'design_file'
  | 'written';

export const SUBMISSION_TYPE_LABELS: Record<SubmissionType, string> = {
  written_plus_link:   'Written + Link',
  portfolio_artifact:  'Portfolio Artifact',
  trade_writeup:       'Trade Write-up',
  data_analysis:       'Data Analysis',
  code_repo:           'Code Repo',
  audit_report:        'Audit Report',
  live_demo:           'Live Demo',
  video_presentation:  'Video Presentation',
  research_paper:      'Research Paper',
  design_file:         'Design File',
  written:             'Written',
};

// ─── Reward events & table ────────────────────────────────────────────────────

export type RewardEvent =
  | 'lesson_complete'
  | 'lesson_perfect'
  | 'lab_complete'
  | 'boss_level'
  | 'track_complete'
  | 'streak_milestone'
  | 'challenge_win'
  | 'guild_champion'
  | 'first_lesson'
  | 'community_post'
  | 'starknet_transaction';

export interface RewardTableEntry {
  xp:            number;
  merch_credits: number;
  badge_ids:     string[];
}

export const REWARD_TABLE: Record<RewardEvent, RewardTableEntry> = {
  lesson_complete:      { xp: 10,  merch_credits: 1,  badge_ids: [] },
  lesson_perfect:       { xp: 15,  merch_credits: 2,  badge_ids: [] },
  lab_complete:         { xp: 20,  merch_credits: 3,  badge_ids: [] },
  boss_level:           { xp: 30,  merch_credits: 5,  badge_ids: [] },
  track_complete:       { xp: 100, merch_credits: 25, badge_ids: ['track_grad'] },
  streak_milestone:     { xp: 50,  merch_credits: 10, badge_ids: [] },
  challenge_win:        { xp: 75,  merch_credits: 20, badge_ids: ['challenge_champ'] },
  guild_champion:       { xp: 50,  merch_credits: 15, badge_ids: ['guild_champ'] },
  first_lesson:         { xp: 5,   merch_credits: 0,  badge_ids: ['first_steps'] },
  community_post:       { xp: 3,   merch_credits: 0,  badge_ids: [] },
  starknet_transaction: { xp: 20,  merch_credits: 5,  badge_ids: [] },
};

// ─── Merch credits ────────────────────────────────────────────────────────────

/** How many merch credits equal $1 USD */
export const MERCH_CREDITS_PER_DOLLAR = 100;

/** Convert merch credits to approximate USD value */
export function creditsToUSD(credits: number): number {
  return credits / MERCH_CREDITS_PER_DOLLAR;
}
