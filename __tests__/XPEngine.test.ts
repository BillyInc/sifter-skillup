/**
 * Tests for XPEngine singleton.
 *
 * NOTE on adapted scope:
 * The test plan referenced a `defaultState()` export and an `earn(amount: number)`
 * signature. The actual XPEngine module exports neither — `defaultState` is
 * private and `earn(event: XPEventType)` takes a string event key from XP_VALUES.
 * Tests below validate the real public API:
 *   - initial snapshot shape (acts as the "default state shape" check)
 *   - earn() adds to dailyXp + totalXp
 *   - earn() is bounded against the levelHistory cap (200 entries)
 *   - dailyGoalHit triggers when crossing the threshold within a single earn
 *   - reset() clears state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { xpEngine } from '../src/lib/XPEngine';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('XPEngine', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    // Force the singleton to reload from (now empty) storage so each test starts clean.
    await xpEngine.reset();
  });

  it('snapshot returns the expected default shape', async () => {
    const snap = await xpEngine.snapshot();
    expect(snap).toEqual(
      expect.objectContaining({
        totalXp: 0,
        dailyXp: 0,
        dailyGoalKey: 'regular',
        dailyGoalHit: false,
      }),
    );
    expect(snap.stage).toBeDefined();
    expect(snap.stage.stage).toBe(1);
    expect(typeof snap.progress).toBe('number');
    expect(typeof snap.xpToNextStage).toBe('number');
    expect(typeof snap.dailyGoalTarget).toBe('number');
  });

  it('earn(event) adds to dailyXp and totalXp', async () => {
    const before = await xpEngine.snapshot();
    const result = await xpEngine.earn('lessonComplete'); // 10 XP

    expect(result.earned).toBe(10);
    expect(result.totalXp).toBe(before.totalXp + 10);
    expect(result.dailyXp).toBe(before.dailyXp + 10);

    const after = await xpEngine.snapshot();
    expect(after.totalXp).toBe(10);
    expect(after.dailyXp).toBe(10);
  });

  it('zero-XP earn is effectively a no-op for totals', async () => {
    // XP_VALUES has no 0-value event; the closest equivalent is verifying
    // that earning a small event does not double-apply on a single call.
    // We assert that calling earn() with the smallest event increments by exactly that amount.
    const result = await xpEngine.earn('communityComment'); // 1 XP
    expect(result.earned).toBe(1);
    expect(result.totalXp).toBe(1);
    expect(result.dailyXp).toBe(1);
  });

  it('dailyGoalHit triggers exactly once when the threshold is crossed', async () => {
    // Default goal is 'regular' (20 XP). Two lessonComplete earns (10 each) crosses it.
    const r1 = await xpEngine.earn('lessonComplete');
    expect(r1.dailyGoalHit).toBe(false);

    const r2 = await xpEngine.earn('lessonComplete');
    expect(r2.dailyGoalHit).toBe(true);

    // Subsequent earns should not re-fire the hit (already at/over goal before earn)
    const r3 = await xpEngine.earn('lessonComplete');
    expect(r3.dailyGoalHit).toBe(false);
  });

  it('levelHistory is bounded at 200 entries', async () => {
    // Earn 205 events. We verify via the storage payload because levelHistory
    // is a private field, but the engine persists the full state to AsyncStorage.
    for (let i = 0; i < 205; i++) {
      // eslint-disable-next-line no-await-in-loop
      await xpEngine.earn('communityComment');
    }
    const raw = await AsyncStorage.getItem('@sifter_xp_v1');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.levelHistory.length).toBeLessThanOrEqual(200);
    expect(parsed.levelHistory.length).toBe(200);
  });

  it('reset() clears state', async () => {
    await xpEngine.earn('bossLevel'); // 30 XP
    let snap = await xpEngine.snapshot();
    expect(snap.totalXp).toBe(30);

    await xpEngine.reset();
    snap = await xpEngine.snapshot();
    expect(snap.totalXp).toBe(0);
    expect(snap.dailyXp).toBe(0);
  });
});
