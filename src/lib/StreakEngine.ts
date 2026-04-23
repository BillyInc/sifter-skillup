/**
 * Sifter Skill_Up — Streak Engine
 * Singleton. Persists to AsyncStorage.
 *
 * Usage:
 *   await streakEngine.recordActivity();
 *   const { streak, isAtRisk, hoursLeft } = await streakEngine.status();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STREAK } from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;    // 'YYYY-MM-DD'
  lastActivityTs: number;      // Unix ms — exact timestamp of last lesson
  freezesAvailable: number;
  totalDaysActive: number;
}

export interface StreakStatus {
  streak: number;
  longestStreak: number;
  isAtRisk: boolean;          // < 4h remaining in window
  atRisk?: boolean;
  isLost: boolean;            // window expired with no activity
  hoursLeft: number;          // hours until midnight deadline
  hoursUntilLoss?: number;
  minutesLeft: number;
  freezesAvailable: number;
  completedToday: boolean;
  totalDaysActive: number;
}

export interface StreakRecordResult {
  streak: number;
  wasRestored: boolean;       // streak was 0 and just restarted
  continuedStreak: boolean;   // already had streak, extended it
  alreadyDoneToday: boolean;  // no-op, already recorded today
}

// ─── Storage key ───────────────────────────────────────────────────────────────

const STORAGE_KEY = STREAK.storageKey; // '@sifter_streak_v1'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Hours remaining until midnight in user's local timezone */
function hoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return (midnight.getTime() - now.getTime()) / 3_600_000;
}

function defaultState(): StreakState {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    lastActivityTs: 0,
    freezesAvailable: 0,
    totalDaysActive: 0,
  };
}

// ─── Engine ────────────────────────────────────────────────────────────────────

class StreakEngineClass {
  private state: StreakState | null = null;
  private loading: Promise<void> | null = null;

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  private async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      this.state = raw ? (JSON.parse(raw) as StreakState) : defaultState();
    } catch {
      this.state = defaultState();
    }
  }

  async ready(): Promise<void> {
    if (this.state) return;
    if (!this.loading) this.loading = this.load();
    await this.loading;
    this.loading = null;
  }

  private async save(): Promise<void> {
    if (!this.state) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {}
  }

  // ── Core: record activity ─────────────────────────────────────────────────

  async recordActivity(): Promise<StreakRecordResult> {
    await this.ready();
    const state = this.state!;
    const today = todayISO();

    // Already recorded today → no-op
    if (state.lastActivityDate === today) {
      return {
        streak: state.currentStreak,
        wasRestored: false,
        continuedStreak: false,
        alreadyDoneToday: true,
      };
    }

    const yesterday = yesterdayISO();
    const continuedStreak = state.lastActivityDate === yesterday;
    const wasRestored = !continuedStreak && state.currentStreak === 0;

    if (continuedStreak) {
      // Perfect — extending streak
      state.currentStreak += 1;
    } else {
      // Gap detected — reset to 1 (or use freeze)
      if (state.freezesAvailable > 0 && state.currentStreak > 0) {
        // Freeze consumed — streak preserved
        state.freezesAvailable -= 1;
      } else {
        state.currentStreak = 1;
      }
    }

    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastActivityDate = today;
    state.lastActivityTs = Date.now();
    state.totalDaysActive += 1;

    await this.save();

    return {
      streak: state.currentStreak,
      wasRestored,
      continuedStreak,
      alreadyDoneToday: false,
    };
  }

  // ── Read: status ───────────────────────────────────────────────────────────

  async status(): Promise<StreakStatus> {
    await this.ready();
    const state = this.state!;
    const today = todayISO();
    const hoursLeft = hoursUntilMidnight();
    const minutesLeft = Math.floor(hoursLeft * 60);

    // Window has expired if last activity wasn't today or yesterday
    const yesterday = yesterdayISO();
    const completedToday = state.lastActivityDate === today;
    const completedYesterday = state.lastActivityDate === yesterday;

    // Streak is lost if: not done today AND yesterday's window has expired
    // i.e. lastActivityDate is neither today nor yesterday
    const isLost =
      !completedToday &&
      !completedYesterday &&
      state.currentStreak > 0;

    // At risk: today not done yet, AND fewer than warningHours remain
    const isAtRisk =
      !completedToday &&
      hoursLeft <= STREAK.warningHours &&
      !isLost;

    return {
      streak: isLost ? 0 : state.currentStreak,
      longestStreak: state.longestStreak,
      isAtRisk,
      atRisk: isAtRisk,
      isLost,
      hoursLeft,
      hoursUntilLoss: hoursLeft,
      minutesLeft,
      freezesAvailable: state.freezesAvailable,
      completedToday,
      totalDaysActive: state.totalDaysActive,
    };
  }

  // ── Freeze ─────────────────────────────────────────────────────────────────

  async addFreeze(count = 1): Promise<void> {
    await this.ready();
    this.state!.freezesAvailable += count;
    await this.save();
  }

  // ── Debug / Admin ──────────────────────────────────────────────────────────

  async reset(): Promise<void> {
    this.state = defaultState();
    await this.save();
  }

  /** Manually set streak — for testing / onboarding restore */
  async setStreak(n: number): Promise<void> {
    await this.ready();
    const today = todayISO();
    this.state!.currentStreak = Math.max(0, n);
    this.state!.longestStreak = Math.max(this.state!.longestStreak, n);
    this.state!.lastActivityDate = today;
    this.state!.lastActivityTs = Date.now();
    await this.save();
  }
}

export const streakEngine = new StreakEngineClass();
