/**
 * Sifter LevelUp — useLessonMechanics
 * Single hook that manages all Phase 4 state for LessonScreen.
 * Drop this into LessonScreen and connect to the existing answer flow.
 *
 * What it tracks:
 *   - Current mood for CharacterReaction + LessonXPBar
 *   - Session XP earned so far
 *   - Consecutive correct streak in this session
 *   - Whether to show CelebrationOverlay (lesson/lab/stage-up)
 *   - Streak status (for StreakUrgencyBanner)
 *   - Guild rank gap (for GuildLeaderboardPrompt inline)
 *
 * How to wire into LessonScreen:
 *
 *   const mechanics = useLessonMechanics({
 *     lessonType: 'lesson',       // 'lesson' | 'lab' | 'boss'
 *     totalQuestions: lesson.questions.length,
 *   });
 *
 *   // Call on every answer submission:
 *   mechanics.onAnswer(isCorrect);
 *
 *   // Call when lesson is complete (last question answered correctly):
 *   mechanics.onLessonComplete();
 *
 *   // In JSX:
 *   <LessonXPBar
 *     totalXp={mechanics.baseXp}
 *     sessionXp={mechanics.sessionXp}
 *     correctStreak={mechanics.correctStreak}
 *     mood={mechanics.xpBarMood}
 *   />
 *   <CharacterReaction
 *     mood={mechanics.characterMood}
 *     stage={mechanics.stage}
 *     trackId={user.currentTrackId}
 *   />
 *   <CelebrationOverlay
 *     visible={mechanics.showCelebration}
 *     type={mechanics.celebrationType}
 *     xpEarned={mechanics.sessionXp}
 *     stageUp={mechanics.stageUp}
 *     stageName={mechanics.newStageName}
 *     streak={streakStatus.streak}
 *     onDismiss={mechanics.onCelebrationDismiss}
 *   />
 *   <StreakUrgencyBanner
 *     status={mechanics.streakStatus}
 *     variant="compact"
 *     onPress={() => {}}
 *   />
 *   <GuildLeaderboardPrompt
 *     userXp={mechanics.baseXp + mechanics.sessionXp}
 *     userRank={mechanics.guildRank}
 *     aboveEntry={mechanics.guildAbove}
 *     belowEntry={mechanics.guildBelow}
 *     variant="inline"
 *   />
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { xpEngine }     from '../lib/XPEngine';
import { streakEngine } from '../lib/StreakEngine';
import { getStageForXp } from '../theme';
import type { StreakStatus }  from '../lib/StreakEngine';
import type { XPSnapshot }    from '../lib/XPEngine';
import type { CelebrationEventType } from '../components/CelebrationOverlay';
import type { CharacterMood }        from '../components/CharacterReaction';
import type { LessonMood }           from '../components/LessonXPBar';
import type { LeaderboardEntry }     from '../components/GuildLeaderboardPrompt';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type LessonType = 'lesson' | 'lab' | 'boss';

export interface UseLessonMechanicsOptions {
  lessonType?: LessonType;
  totalQuestions?: number;
  /** Pass guild data from your Supabase query */
  guildRank?: number;
  guildAbove?: LeaderboardEntry | null;
  guildBelow?: LeaderboardEntry | null;
}

export interface LessonMechanicsState {
  // XP
  baseXp: number;
  sessionXp: number;
  stage: number;
  stageUp: boolean;
  newStageName: string;

  // Streak
  streakStatus: StreakStatus;

  // Moods
  characterMood: CharacterMood;
  xpBarMood: LessonMood;
  correctStreak: number;          // consecutive correct answers this session

  // Celebration
  showCelebration: boolean;
  celebrationType: CelebrationEventType;

  // Guild
  guildRank: number;
  guildAbove: LeaderboardEntry | null;
  guildBelow: LeaderboardEntry | null;

  // Actions
  onAnswer: (isCorrect: boolean) => void;
  onLessonComplete: () => void;
  onCelebrationDismiss: () => void;
}

// ─── Mood reset delay ─────────────────────────────────────────────────────────

const MOOD_RESET_MS = 1200;   // how long correct/wrong mood shows before returning to idle
const STREAK_MOOD_THRESHOLD = 3; // correct streak needed to trigger streak glow

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLessonMechanics({
  lessonType   = 'lesson',
  totalQuestions = 1,
  guildRank    = 0,
  guildAbove   = null,
  guildBelow   = null,
}: UseLessonMechanicsOptions = {}): LessonMechanicsState {

  // ── Snapshot state ────────────────────────────────────────────────────────
  const [baseXp,    setBaseXp]    = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [stage,     setStage]     = useState(1);
  const [stageUp,   setStageUp]   = useState(false);
  const [newStageName, setNewStageName] = useState('');

  // ── Mood state ────────────────────────────────────────────────────────────
  const [characterMood, setCharacterMood] = useState<CharacterMood>('idle');
  const [xpBarMood,     setXpBarMood]     = useState<LessonMood>('idle');
  const [correctStreak, setCorrectStreak] = useState(0);
  // Mirror of correctStreak for synchronous reads: several onAnswer() calls can
  // fire in the same render tick (rapid answers), and onLessonComplete() needs
  // the up-to-date streak immediately — reading the state var would be stale.
  const correctStreakRef = useRef(0);

  // ── Celebration ───────────────────────────────────────────────────────────
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<CelebrationEventType>('lesson');

  // ── Streak ────────────────────────────────────────────────────────────────
  const [streakStatus, setStreakStatus] = useState<StreakStatus>({
    streak: 0, longestStreak: 0,
    isAtRisk: false, isLost: false,
    hoursLeft: 24, minutesLeft: 1440,
    freezesAvailable: 0, completedToday: false, totalDaysActive: 0,
  });

  // Mood reset timer ref
  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Bootstrap: load current XP + streak status ────────────────────────────

  useEffect(() => {
    (async () => {
      const [xpSnap, streakSnap] = await Promise.all([
        xpEngine.snapshot(),
        streakEngine.status(),
      ]);
      setBaseXp(xpSnap.totalXp);
      setStage(xpSnap.stage.stage);
      setStreakStatus(streakSnap);
    })();
  }, []);

  // ── Answer handler ────────────────────────────────────────────────────────

  const onAnswer = useCallback((isCorrect: boolean) => {
    // Clear any pending mood reset
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);

    if (isCorrect) {
      const newStreak = correctStreakRef.current + 1;
      correctStreakRef.current = newStreak;
      setCorrectStreak(newStreak);

      // Determine mood
      const mood: LessonMood = newStreak >= STREAK_MOOD_THRESHOLD ? 'streak' : 'correct';
      setXpBarMood(mood);
      setCharacterMood(newStreak >= STREAK_MOOD_THRESHOLD ? 'celebrating' : 'correct');

      // Increment session XP (done per correct answer for visual feedback)
      // Full XP awarded on lesson complete — here we show partial (+2) per answer
      setSessionXp(prev => prev + 2);
    } else {
      correctStreakRef.current = 0;
      setCorrectStreak(0);
      setXpBarMood('wrong');
      setCharacterMood('wrong');
    }

    // Reset mood to idle after delay
    moodTimerRef.current = setTimeout(() => {
      setXpBarMood('idle');
      setCharacterMood('idle');
    }, MOOD_RESET_MS);
  }, []);

  // ── Lesson complete handler ───────────────────────────────────────────────

  const onLessonComplete = useCallback(async () => {
    // Clear mood timers
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    setCharacterMood('celebrating');

    // Earn XP via engine
    const eventType = lessonType === 'boss'   ? 'bossLevel'
                    : lessonType === 'lab'    ? 'labComplete'
                    : 'lessonComplete';

    const result = await xpEngine.earn(eventType);

    // Update session XP to the real earned amount
    setSessionXp(result.earned);
    setBaseXp(result.totalXp - result.earned);
    setStage(result.newStage);

    if (result.stageUp) {
      setStageUp(true);
      setNewStageName(result.stageName);
    }

    // Record activity for streak
    await streakEngine.recordActivity();
    const freshStreak = await streakEngine.status();
    setStreakStatus(freshStreak);

    // Show celebration
    const celebType: CelebrationEventType =
      result.stageUp            ? 'stage_up'
      : lessonType === 'boss'   ? 'boss'
      : lessonType === 'lab'    ? 'lab'
      : freshStreak.completedToday && freshStreak.streak > 1 && correctStreakRef.current >= 3
        ? 'daily_goal'
        : 'lesson';

    setCelebrationType(celebType);
    setShowCelebration(true);
  }, [lessonType]);

  // ── Celebration dismiss ───────────────────────────────────────────────────

  const onCelebrationDismiss = useCallback(() => {
    setShowCelebration(false);
    setCharacterMood('idle');
    setStageUp(false);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => () => {
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
  }, []);

  return {
    baseXp,
    sessionXp,
    stage,
    stageUp,
    newStageName,
    streakStatus,
    characterMood,
    xpBarMood,
    correctStreak,
    showCelebration,
    celebrationType,
    guildRank,
    guildAbove,
    guildBelow,
    onAnswer,
    onLessonComplete,
    onCelebrationDismiss,
  };
}
