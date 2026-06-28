/**
 * Sifter LevelUp — XP Engine
 * Singleton. Persists to AsyncStorage.
 * Import { xpEngine } and call methods directly.
 *
 * Usage:
 *   const result = await xpEngine.earn('lessonComplete');
 *   if (result.levelUp) triggerCelebration(result);
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  XP_VALUES,
  XP_STAGES,
  XP_DAILY_GOALS,
  getStageForXp,
  getXpProgress,
  getXpToNextStage,
} from '../theme';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type XPEventType = keyof typeof XP_VALUES;

export interface XPEarnResult {
  earned: number;
  totalXp: number;
  previousXp: number;
  levelUp: boolean;
  stageUp: boolean;
  previousStage: number;
  newStage: number;
  stageName: string;
  dailyGoalHit: boolean;
  dailyXp: number;
  dailyGoalTarget: number;
  progress: number;        // 0–1 within current stage
  xpToNextStage: number;
}

export interface XPState {
  totalXp: number;
  dailyXp: number;
  lastActivityDate: string;   // 'YYYY-MM-DD'
  dailyGoalKey: keyof typeof XP_DAILY_GOALS;
  levelHistory: Array<{ date: string; xp: number; event: XPEventType }>;
}

export interface XPSnapshot {
  totalXp: number;
  stage: typeof XP_STAGES[number];
  progress: number;
  xpToNextStage: number;
  dailyXp: number;
  dailyGoalTarget: number;
  dailyGoalKey: keyof typeof XP_DAILY_GOALS;
  dailyGoalHit: boolean;
}

// ─── Storage key ───────────────────────────────────────────────────────────────

const STORAGE_KEY = '@sifter_xp_v1';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(): XPState {
  return {
    totalXp: 0,
    dailyXp: 0,
    lastActivityDate: todayISO(),
    dailyGoalKey: 'regular',
    levelHistory: [],
  };
}

// ─── Engine ────────────────────────────────────────────────────────────────────

class XPEngineClass {
  private state: XPState | null = null;
  private loading: Promise<void> | null = null;

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  private async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      this.state = raw ? (JSON.parse(raw) as XPState) : defaultState();
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

  // ── Daily reset ───────────────────────────────────────────────────────────

  private resetDailyIfNeeded(): void {
    if (!this.state) return;
    const today = todayISO();
    if (this.state.lastActivityDate !== today) {
      this.state.dailyXp = 0;
      this.state.lastActivityDate = today;
    }
  }

  // ── Core: earn XP ─────────────────────────────────────────────────────────

  async earn(event: XPEventType): Promise<XPEarnResult> {
    await this.ready();
    this.resetDailyIfNeeded();

    const state = this.state!;
    const earned  = XP_VALUES[event];
    const prevXp  = state.totalXp;
    const prevStage = getStageForXp(prevXp);

    state.totalXp += earned;
    state.dailyXp += earned;
    state.levelHistory.push({ date: new Date().toISOString(), xp: earned, event });

    // Keep history bounded (last 200 entries)
    if (state.levelHistory.length > 200) {
      state.levelHistory = state.levelHistory.slice(-200);
    }

    const newStage = getStageForXp(state.totalXp);
    const stageUp  = newStage.stage > prevStage.stage;

    // Level-up = crossing a full stage boundary
    const goalTarget = XP_DAILY_GOALS[state.dailyGoalKey].xp;
    const dailyGoalHit =
      state.dailyXp >= goalTarget &&
      state.dailyXp - earned < goalTarget; // crossed the line on this earn

    await this.save();

    return {
      earned,
      totalXp: state.totalXp,
      previousXp: prevXp,
      levelUp: stageUp,
      stageUp,
      previousStage: prevStage.stage,
      newStage: newStage.stage,
      stageName: newStage.name,
      dailyGoalHit,
      dailyXp: state.dailyXp,
      dailyGoalTarget: goalTarget,
      progress: getXpProgress(state.totalXp),
      xpToNextStage: getXpToNextStage(state.totalXp),
    };
  }

  // ── Read: current snapshot ─────────────────────────────────────────────────

  async snapshot(): Promise<XPSnapshot> {
    await this.ready();
    this.resetDailyIfNeeded();
    const state = this.state!;
    const stage = getStageForXp(state.totalXp);
    const goalTarget = XP_DAILY_GOALS[state.dailyGoalKey].xp;

    return {
      totalXp: state.totalXp,
      stage,
      progress: getXpProgress(state.totalXp),
      xpToNextStage: getXpToNextStage(state.totalXp),
      dailyXp: state.dailyXp,
      dailyGoalTarget: goalTarget,
      dailyGoalKey: state.dailyGoalKey,
      dailyGoalHit: state.dailyXp >= goalTarget,
    };
  }

  // ── Settings: change daily goal ────────────────────────────────────────────

  async setDailyGoal(key: keyof typeof XP_DAILY_GOALS): Promise<void> {
    await this.ready();
    this.state!.dailyGoalKey = key;
    await this.save();
  }

  // ── Debug / Admin ──────────────────────────────────────────────────────────

  async reset(): Promise<void> {
    this.state = defaultState();
    await this.save();
  }

  /** Set XP directly — for testing / onboarding restore */
  async setXp(xp: number): Promise<void> {
    await this.ready();
    this.state!.totalXp = Math.max(0, xp);
    await this.save();
  }
}

export const xpEngine = new XPEngineClass();
