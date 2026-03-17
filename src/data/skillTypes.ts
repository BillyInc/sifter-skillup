// ⚡ Sifter Skill_Up — Career Track Type Definitions
// Shared types for both Coming Soon stubs and fully built live tracks.

import { SkillCategory, SkillDifficulty } from './skills';

// ── Practice scaffolding tier ─────────────────────────────────────────────────
//
// Within a single lab, lessons progress through scaffolding tiers.
// First ~40% of lessons = guided, middle ~40% = independent, last ~20% = freestyle.
//
//   guided:      Platform assigns the task, shows structure, pre-fills skeleton.
//   independent: Platform presents the task with less context. Clear goal, no scaffold.
//   freestyle:   Platform states the OUTCOME needed. User picks the approach entirely.
//
// This is SEPARATE from Phase 1 / Phase 2 boss battle phases (see BossMode below).

export type PracticeScaffoldTier = 'guided' | 'independent' | 'freestyle';

// ── Simulator definition ──────────────────────────────────────────────────────
export interface LessonSimulation {
  type:             string;
  scenario:         string;
  scoringCriteria:  string[];
  scaffoldTier?:    PracticeScaffoldTier; // defaults to 'guided' if not set
}

// ── Guided practice question ─────────────────────────────────────────────────
export interface GuidedPracticeQuestion {
  question:    string;
  options:     string[];
  correct:     number;
  hint:        string;
  explanation: string;
}

// ── Example ──────────────────────────────────────────────────────────────────
export interface TrackExample {
  contextTag: string;
  context:    string;
  scenario:   string;
  outcome:    string;
}

// ── Lesson ───────────────────────────────────────────────────────────────────
export interface TrackLesson {
  id:               string;
  title:            string;
  explanation:      string;
  visualPrompt?:    string;
  visualType?:      string;
  visualUrl?:       string;
  examples:         TrackExample[];
  keyTakeaway:      string;
  guidedPractice:   GuidedPracticeQuestion[];
  lessonSimulations: LessonSimulation[];
  /**
   * Scaffolding tier for this lesson's practice sessions.
   * Set by the generator based on lesson position within the lab.
   * Renderer adjusts how much structure/hints to show the user.
   */
  practiceScaffold?: PracticeScaffoldTier;
}

// ── Aggregate simulations (lab-level) ────────────────────────────────────────
export interface AggregateSimulations {
  count:                          number;
  simulatorTypes:                 string[];
  description:                    string;
  scoringMode:                    'full-rubric' | 'pass-fail';
  unlockCondition:                'all-lessons-complete' | string;
  scenarioDifficultyProgression?: 'guided-to-freestyle';
  attemptRules: {
    maxAttemptsPerSim:  number;
    failedSimRecovery:  string;
    passThreshold:      number;
  };
}

// ── Boss mode ─────────────────────────────────────────────────────────────────
//
// Two phases — both FIXED in structure regardless of lab difficulty:
//
// PHASE 1 — Learning Loop — ALWAYS assisted:
//   hintsEnabled = true, showLessonPointers = true, portfolioPush = false.
//   Always present. Unlimited attempts. User proves they understood the lab.
//   Scenarios use MCQ format (1 correct + 3 wrong with explanations).
//   What DOES change: scenario difficulty increases as labs progress in the level.
//
// PHASE 2 — Certification — ALWAYS unassisted:
//   hintsEnabled = false, showLessonPointers = false, portfolioPush = true on 100% pass.
//   Only on qualifying labs. Open-response format (user writes freely).
//   Fresh unseen scenario each attempt via {template_variable} injection.
//   What DOES change: scenario complexity increases as labs progress.

export interface BossScenario {
  id:                   string;
  situation:            string;       // may contain {template_variables}
  question:             string;
  scoringCriteria:      string[];
  conceptsSynthesised?: string[];
  options?: Array<{                   // Phase 1 only — omit for Phase 2 open-response
    text:        string;
    correct:     boolean;
    explanation: string;
  }>;
}

export interface BossMode {
  title: string;

  // Phase 1 — Learning Loop — ALWAYS assisted, ALWAYS present
  phase1: {
    hintsEnabled:   true;
    portfolioPush:  false;
    feedbackFormat: {
      showCriteriaResults: boolean;
      showLessonPointers:  boolean;
      message:             string;
    };
    scenarios: BossScenario[];
  };

  // Phase 2 — Certification — ALWAYS unassisted, only on qualifying labs
  phase2?: {
    hintsEnabled:   false;
    portfolioPush:  true;
    confirmationScreen: string;
    feedbackFormat: {
      showCriteriaResults: boolean;
      showLessonPointers:  false;
      message:             string;
    };
    prerequisiteFloor: {
      guidedPracticeAverage:         number;
      lessonSimulationAverage:       number;
      aggregateSimulationsCompleted: number;
    };
    scenarios: BossScenario[];
    onPass: {
      xpAwarded:   number;
      badgeEarned: string;
      message:     string;
    };
  };
}

// ── Lab section ───────────────────────────────────────────────────────────────
export interface TrackSection {
  id:         string;
  title:      string;
  subtitle:   string;
  difficulty: SkillDifficulty | 'beginner_to_expert';
  lessons:    TrackLesson[];
  aggregateSimulations: AggregateSimulations;
  bossMode:   BossMode;
}

// ── World theme ───────────────────────────────────────────────────────────────
export interface WorldTheme {
  name:           string;
  description:    string;
  progressLabels: string[];
  accentColor:    string;
  bgGradient:     string[];
}

// ── SkillTrack ────────────────────────────────────────────────────────────────
export type SkillTrack =
  | {
      id: string; category: SkillCategory; icon: string; name: string;
      tagline: string; description: string;
      difficulty: SkillDifficulty | 'beginner_to_expert';
      color: string; estimatedHours: number; earningPotential: string;
      realWorldOutcomes: string[];
      modules: Array<{ id: string; title: string; description: string }>;
      comingSoon: true;
    }
  | {
      id: string; category: SkillCategory; icon: string; name: string;
      tagline: string; description: string;
      difficulty: SkillDifficulty | 'beginner_to_expert';
      color: string; estimatedHours: number; earningPotential: string;
      realWorldOutcomes: string[];
      worldTheme?:    WorldTheme;
      comingSoon:     false;
      sections:       TrackSection[];
      trackComplete?: boolean;
      noFinalBoss?:   boolean;
      noPlacementTest?: boolean;
      noPortfolioPush?: boolean;
      completionBadge?: string;
      completionXP?:  number;
      totalLabs?:     number;
    };
