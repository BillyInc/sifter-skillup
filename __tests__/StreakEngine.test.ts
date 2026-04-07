/**
 * Tests for StreakEngine singleton.
 *
 * NOTE: The plan referenced `touchToday()` and `getStatus()`. The actual API is
 * `recordActivity()` and `status()`. Tests below validate the real public API
 * with the same intent (yesterday → increment, today → no-op, gap → reset, at-risk).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { streakEngine } from '../src/lib/StreakEngine';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

function isoDay(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function seedState(state: Record<string, unknown>): Promise<void> {
  await AsyncStorage.setItem('@sifter_streak_v1', JSON.stringify({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    lastActivityTs: 0,
    freezesAvailable: 0,
    totalDaysActive: 0,
    ...state,
  }));
  // Force the singleton to drop in-memory cache so it reloads from storage
  await streakEngine.reset();
  // After reset() the storage is overwritten with defaults — re-seed.
  await AsyncStorage.setItem('@sifter_streak_v1', JSON.stringify({
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: '',
    lastActivityTs: 0,
    freezesAvailable: 0,
    totalDaysActive: 0,
    ...state,
  }));
  // Now poke the private state by forcing a fresh load via reflection
  // (the engine caches `state` after first load — we need to invalidate it)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (streakEngine as any).state = null;
}

describe('StreakEngine', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await streakEngine.reset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (streakEngine as any).state = null;
  });

  it('recordActivity() increments streak when last activity was yesterday', async () => {
    await seedState({ currentStreak: 3, lastActivityDate: isoDay(-1) });

    const result = await streakEngine.recordActivity();
    expect(result.continuedStreak).toBe(true);
    expect(result.streak).toBe(4);
    expect(result.alreadyDoneToday).toBe(false);
  });

  it('recordActivity() is a no-op when last activity was today', async () => {
    await seedState({ currentStreak: 5, lastActivityDate: isoDay(0) });

    const result = await streakEngine.recordActivity();
    expect(result.alreadyDoneToday).toBe(true);
    expect(result.streak).toBe(5);
    expect(result.continuedStreak).toBe(false);
  });

  it('recordActivity() resets to 1 when gap > 1 day and no freezes', async () => {
    await seedState({
      currentStreak: 7,
      lastActivityDate: isoDay(-3),
      freezesAvailable: 0,
    });

    const result = await streakEngine.recordActivity();
    expect(result.continuedStreak).toBe(false);
    expect(result.streak).toBe(1);
  });

  it('status() returns isAtRisk=true when in last 4h window with no play today', async () => {
    // Seed a state where last activity was yesterday → still in window, not lost.
    await seedState({
      currentStreak: 2,
      lastActivityDate: isoDay(-1),
    });

    // Mock Date so "now" is 22:30 today → ~1.5h until midnight (< 4h warningHours)
    const RealDate = Date;
    const fakeNow = new RealDate();
    fakeNow.setHours(22, 30, 0, 0);
    const spy = jest.spyOn(global, 'Date').mockImplementation(((...args: unknown[]) => {
      if (args.length === 0) return fakeNow;
      // @ts-expect-error spread to real Date
      return new RealDate(...args);
    }) as unknown as DateConstructor);
    // Restore static methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.Date as any).now = RealDate.now;

    try {
      const status = await streakEngine.status();
      expect(status.completedToday).toBe(false);
      expect(status.hoursLeft).toBeLessThanOrEqual(4);
      expect(status.isLost).toBe(false);
      expect(status.isAtRisk).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});
