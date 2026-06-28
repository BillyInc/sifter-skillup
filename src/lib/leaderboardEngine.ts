/**
 * Sifter LevelUp — Leaderboard Engine
 * 3-tier: global / field / track, weekly reset every Sunday.
 */

import { API } from './api';
import type { Leaderboard, LeaderboardEntry } from '../types/social';

export type LeaderboardScope = 'global' | 'field' | 'track';

export const leaderboardEngine = {

  async fetch(
    scope: LeaderboardScope,
    fieldId?: string,
    trackId?: string,
    _weekOffset = 0,
  ): Promise<Leaderboard | null> {
    try {
      return await API.leaderboardGet(scope, fieldId, trackId);
    } catch {
      return null;
    }
  },

  /** Get the user's position slice (3 above + user + 3 below). */
  getUserSlice(board: Leaderboard, userId: string): {
    above: LeaderboardEntry[];
    user:  LeaderboardEntry | null;
    below: LeaderboardEntry[];
  } {
    const userIdx = board.entries.findIndex(e => e.user_id === userId);
    if (userIdx < 0) return { above: [], user: board.user_entry ?? null, below: [] };

    const above = board.entries.slice(Math.max(0, userIdx - 3), userIdx);
    const user  = board.entries[userIdx];
    const below = board.entries.slice(userIdx + 1, userIdx + 4);
    return { above, user, below };
  },

  formatWeekLabel(weekStart: string): string {
    const d = new Date(weekStart);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  /** Colour for rank delta (moved up = green, down = red, same = grey). */
  deltaColor(delta: number, colors: { green: string; red: string; textMuted: string }): string {
    if (delta > 0) return colors.green;
    if (delta < 0) return colors.red;
    return colors.textMuted;
  },

  deltaLabel(delta: number): string {
    if (delta > 0) return `▲${delta}`;
    if (delta < 0) return `▼${Math.abs(delta)}`;
    return '–';
  },
};
