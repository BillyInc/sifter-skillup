/**
 * Sifter LevelUp — Badge Definitions
 * All badge archetypes. Instances (with earned_at, track_id) are stored in Supabase.
 */

import type { Badge } from '../types/social';

type BadgeDef = Omit<Badge, 'earned_at' | 'field_id' | 'track_id'> & {
  metadata?: Record<string, unknown>;
};

export const badgeDefinitions: BadgeDef[] = [
  // ── First steps ────────────────────────────────────────────────────────────
  { id: 'first_lesson',      name: 'First Step',            emoji: '👣', category: 'first_lesson',   rarity: 'common',    description: 'Completed your first lesson' },
  { id: 'perfect_lab',       name: 'Perfect Lab',           emoji: '✨', category: 'perfect_lab',    rarity: 'rare',      description: 'Completed a lab with zero mistakes' },

  // ── Track completions ──────────────────────────────────────────────────────
  { id: 'track_complete',    name: 'Track Graduate',        emoji: '🎓', category: 'track_complete', rarity: 'rare',      description: 'Completed a full skill track' },
  { id: 'field_mastery',     name: 'Field Master',          emoji: '🏆', category: 'field_mastery',  rarity: 'epic',      description: 'Mastered every track in a field' },

  // ── Streak ─────────────────────────────────────────────────────────────────
  { id: 'streak_7',          name: '7-Day Streak',          emoji: '🔥', category: 'streak',         rarity: 'common',    description: '7 days in a row',            metadata: { days: 7   } },
  { id: 'streak_30',         name: '30-Day Streak',         emoji: '🔥', category: 'streak',         rarity: 'rare',      description: '30 days in a row',           metadata: { days: 30  } },
  { id: 'streak_100',        name: 'Century Streak',        emoji: '💯', category: 'streak',         rarity: 'epic',      description: '100 days in a row',          metadata: { days: 100 } },

  // ── Level milestones ───────────────────────────────────────────────────────
  { id: 'stage_3',           name: 'Associate',             emoji: '⭐', category: 'level_milestone', rarity: 'common',   description: 'Reached Stage 3',            metadata: { stage: 3 } },
  { id: 'stage_5',           name: 'Senior Analyst',        emoji: '⭐', category: 'level_milestone', rarity: 'rare',     description: 'Reached Stage 5',            metadata: { stage: 5 } },
  { id: 'stage_8',           name: 'Industry Expert',       emoji: '💎', category: 'level_milestone', rarity: 'legendary',description: 'Reached Stage 8',            metadata: { stage: 8 } },

  // ── Challenges ─────────────────────────────────────────────────────────────
  { id: 'challenge_participant', name: 'Challenge Taker',   emoji: '⚡', category: 'challenge_winner', rarity: 'common',  description: 'Submitted to a monthly challenge' },
  { id: 'challenge_winner',  name: 'Challenge Winner',      emoji: '🏅', category: 'challenge_winner', rarity: 'epic',    description: 'Placed top 3 in a monthly challenge' },

  // ── Guild ──────────────────────────────────────────────────────────────────
  { id: 'guild_champion',    name: 'Guild Champion',        emoji: '🛡️', category: 'guild_champion',  rarity: 'rare',     description: 'Guild won the weekly competition' },

  // ── Weekly leaderboard ─────────────────────────────────────────────────────
  { id: 'weekly_champion',   name: 'Weekly #1',             emoji: '👑', category: 'challenge_winner', rarity: 'epic',    description: 'Finished #1 on weekly leaderboard' },
  { id: 'weekly_runner_up',  name: 'Weekly #2',             emoji: '🥈', category: 'challenge_winner', rarity: 'rare',    description: 'Finished #2 on weekly leaderboard' },
  { id: 'weekly_third',      name: 'Weekly #3',             emoji: '🥉', category: 'challenge_winner', rarity: 'rare',    description: 'Finished #3 on weekly leaderboard' },

  // ── Community ──────────────────────────────────────────────────────────────
  { id: 'community_post',    name: 'Community Voice',       emoji: '💬', category: 'community',       rarity: 'common',   description: 'Posted in a track room' },

  // ── Merchandise ────────────────────────────────────────────────────────────
  { id: 'merch_buyer',       name: 'Sifter Collective',     emoji: '👕', category: 'merchandise',     rarity: 'rare',     description: 'Bought a Sifter merchandise item' },
];
