/**
 * Sifter Skill_Up — Rewards Engine
 * Central engine for awarding XP, badges, merch credits, tokens, cash.
 * Every lesson completion, badge unlock, challenge win flows through here.
 *
 * Usage:
 *   const result = await rewardsEngine.award(userId, 'track_complete', { trackId: 'defi-research-analyst' });
 *   // result.notifications → show in CelebrationOverlay
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { REWARD_TABLE, type RewardEvent, BADGE_RARITY_COLORS } from '../theme/rewards';
import type { Badge, UserProfile, MerchandiseItem } from '../types/social';
import { badgeDefinitions } from '../data/badgeDefinitions';
import { API } from './api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RewardResult {
  xp:             number;
  badges:         Badge[];
  merch_credits:  number;
  token_amount:   number;
  token_currency: string;
  cash_cents:     number;
  notifications:  string[];       // human-readable summaries for UI toasts
}

interface AwardContext {
  trackId?:         string;
  fieldId?:         string;
  streakDays?:      number;
  challengeReward?: {
    token_amount:   number;
    token_currency: string;
    cash_cents:     number;
  };
}

// ─── Engine ────────────────────────────────────────────────────────────────────

export const rewardsEngine = {

  /**
   * Award rewards for an event.
   * Calls the backend to persist wallet changes, returns RewardResult for UI.
   */
  async award(
    userId: string,
    event: RewardEvent,
    context: AwardContext = {},
  ): Promise<RewardResult> {
    const base   = REWARD_TABLE[event] ?? { xp: 0, merch_credits: 0, badge_ids: [] };
    const result: RewardResult = {
      xp:             base.xp,
      badges:         [],
      merch_credits:  base.merch_credits,
      token_amount:   context.challengeReward?.token_amount  ?? 0,
      token_currency: context.challengeReward?.token_currency ?? 'platform_points',
      cash_cents:     context.challengeReward?.cash_cents    ?? 0,
      notifications:  [],
    };

    // ── Streak milestone: scale XP by streak length ──────────────────────────
    if (event === 'streak_milestone' && context.streakDays) {
      if (context.streakDays >= 100) result.xp = 200;
      else if (context.streakDays >= 30) result.xp = 100;
      else result.xp = 50;
    }

    // ── Resolve badge definitions ─────────────────────────────────────────────
    for (const badgeId of base.badge_ids) {
      const def = badgeDefinitions.find(b => b.id === badgeId);
      if (!def) continue;

      // Specialize track/field badges
      const badge: Badge = {
        ...def,
        id:        context.trackId ? `${badgeId}-${context.trackId}` : def.id,
        field_id:  context.fieldId,
        track_id:  context.trackId,
        earned_at: new Date().toISOString(),
      };
      result.badges.push(badge);
    }

    // ── Build notification messages ───────────────────────────────────────────
    if (result.xp > 0)
      result.notifications.push(`+${result.xp} XP`);
    if (result.merch_credits > 0)
      result.notifications.push(`+${result.merch_credits} Merch Credits`);
    if (result.token_amount > 0)
      result.notifications.push(`+${formatTokenAmount(result.token_amount, result.token_currency)}`);
    if (result.cash_cents > 0)
      result.notifications.push(`+$${(result.cash_cents / 100).toFixed(2)} pending`);
    for (const b of result.badges)
      result.notifications.push(`🏅 New badge: ${b.name}`);

    // ── Persist to backend ────────────────────────────────────────────────────
    try {
      await API.rewardsAward({
        userId,
        event,
        xp:            result.xp,
        merch_credits: result.merch_credits,
        token_amount:  result.token_amount,
        token_currency:result.token_currency,
        cash_cents:    result.cash_cents,
        badges:        result.badges,
      });
    } catch {
      // Persist locally as fallback — sync on next app open
      const pending = JSON.parse(await AsyncStorage.getItem('pending_rewards') ?? '[]');
      pending.push({ userId, event, result, timestamp: Date.now() });
      await AsyncStorage.setItem('pending_rewards', JSON.stringify(pending));
    }

    return result;
  },

  /**
   * Check if any new badges should be unlocked given current user state.
   * Call after each lesson/lab complete.
   */
  async checkBadgeUnlocks(
    userId: string,
    profile: UserProfile,
  ): Promise<Badge[]> {
    const earned = new Set(profile.badges.map(b => b.id));
    const newBadges: Badge[] = [];

    for (const def of badgeDefinitions) {
      if (earned.has(def.id)) continue;

      let shouldUnlock = false;

      if (def.category === 'first_lesson' && profile.badges.length === 0) {
        shouldUnlock = true;
      } else if (def.category === 'level_milestone') {
        const stage = Number(def.metadata?.stage ?? 0);
        if (profile.xp_stage >= stage) shouldUnlock = true;
      } else if (def.category === 'streak') {
        const days = Number(def.metadata?.days ?? 0);
        if (profile.streak >= days) shouldUnlock = true;
      }

      if (shouldUnlock) {
        newBadges.push({ ...def, earned_at: new Date().toISOString() });
      }
    }

    if (newBadges.length > 0) {
      try {
        await API.rewardsBadgesGrant(userId, newBadges);
      } catch {}
    }

    return newBadges;
  },

  /**
   * Check if a merchandise item is unlocked for this user.
   */
  isMerchandiseUnlocked(item: MerchandiseItem, profile: UserProfile): boolean {
    const cond = item.unlock_condition;
    switch (cond.type) {
      case 'open':
        return true;
      case 'xp_stage':
        return (profile.xp_stage ?? 0) >= (cond.xp_stage ?? 0);
      case 'track_complete':
        return profile.badges.some(
          b => b.category === 'track_complete' && b.track_id === cond.track_id,
        );
      case 'field_mastery':
        return profile.badges.some(
          b => b.category === 'field_mastery' && b.field_id === cond.field_id,
        );
      case 'challenge_winner':
        return profile.badges.some(
          b => b.category === 'challenge_winner' && b.field_id === cond.field_id,
        );
      default:
        return false;
    }
  },

  getMerchCreditsBalance(profile: UserProfile): number {
    return profile.merch_credits ?? 0;
  },
};

// ─── Utility ──────────────────────────────────────────────────────────────────

export function formatTokenAmount(amount: number, currency: string): string {
  const SYMBOLS: Record<string, string> = {
    STRK: 'STRK', USDC: 'USDC', ETH: 'ETH', platform_points: 'pts',
  };
  const sym = SYMBOLS[currency] ?? currency;
  return `${amount.toLocaleString()} ${sym}`;
}
