/**
 * Regression test for the stale-closure fix in useLessonMechanics.
 *
 * Five rapid `onAnswer(true)` calls followed by `onLessonComplete()` should
 * see correctStreak === 5 (not a stale value of 0/1) when the celebration
 * type is decided.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock the engines so we don't depend on real persistence in this test.
jest.mock('../src/lib/XPEngine', () => ({
  xpEngine: {
    snapshot: jest.fn().mockResolvedValue({
      totalXp: 0,
      stage: { stage: 1, name: 'Raw Recruit', minXp: 0, maxXp: 50 },
      progress: 0,
      xpToNextStage: 50,
      dailyXp: 0,
      dailyGoalTarget: 20,
      dailyGoalKey: 'regular',
      dailyGoalHit: false,
    }),
    earn: jest.fn().mockResolvedValue({
      earned: 10,
      totalXp: 10,
      previousXp: 0,
      levelUp: false,
      stageUp: false,
      previousStage: 1,
      newStage: 1,
      stageName: 'Raw Recruit',
      dailyGoalHit: false,
      dailyXp: 10,
      dailyGoalTarget: 20,
      progress: 0.2,
      xpToNextStage: 40,
    }),
  },
}));

jest.mock('../src/lib/StreakEngine', () => ({
  streakEngine: {
    status: jest.fn().mockResolvedValue({
      streak: 2,
      longestStreak: 2,
      isAtRisk: false,
      isLost: false,
      hoursLeft: 24,
      minutesLeft: 1440,
      freezesAvailable: 0,
      completedToday: true,
      totalDaysActive: 2,
    }),
    recordActivity: jest.fn().mockResolvedValue({
      streak: 2,
      wasRestored: false,
      continuedStreak: true,
      alreadyDoneToday: false,
    }),
  },
}));

import { useLessonMechanics } from '../src/hooks/useLessonMechanics';

describe('useLessonMechanics — correctStreak persistence across rapid answers', () => {
  it('reflects 5 consecutive correct answers and selects daily_goal celebration', async () => {
    const { result } = renderHook(() => useLessonMechanics({ lessonType: 'lesson' }));

    // Wait for the bootstrap effect (xpEngine.snapshot + streak.status) to settle
    await waitFor(() => {
      expect(result.current.baseXp).toBe(0);
    });

    // Five rapid correct answers
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        result.current.onAnswer(true);
      }
    });

    expect(result.current.correctStreak).toBe(5);

    // Now complete the lesson
    await act(async () => {
      await result.current.onLessonComplete();
    });

    // The celebration should be visible…
    expect(result.current.showCelebration).toBe(true);
    // …and because correctStreak >= 3 + completedToday + streak > 1, the
    // celebration type should be 'daily_goal' (proves correctStreakRef wasn't stale)
    expect(result.current.celebrationType).toBe('daily_goal');
  });
});
