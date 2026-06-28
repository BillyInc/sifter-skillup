/**
 * Sifter LevelUp — Island Level Type Definitions
 * NEW FILE: src/data/levels/bitcoinBayLevels-part-a.ts
 *
 * This file provides the shared type interface used by all island level files.
 * All 18 island level files import IslandLevel, GuidedPracticeItem, WorkedExample from here.
 *
 * The actual Bitcoin Bay (Island 1) levels L1-L15 live in src/data/levels.ts
 * (the main monolithic levels file). This file is TYPE DEFINITIONS ONLY so that
 * the new island level files (I9-I17) can import from it.
 */

import type { Level } from '../levels';

export interface GuidedPracticeItem {
  question:    string;
  options:     string[];
  correct:     number;
  hint:        string;
  explanation: string;
}

export interface WorkedExample {
  contextTag: string;
  scenario:   string;
  outcome:    string;
}

export interface IslandLevel {
  // Core Level fields (compatible with Level from levels.ts)
  id:               number;
  mechanic?:        string;
  tier?:            'beginner' | 'intermediate' | 'pro';
  topic:            string;
  explanation:      string;
  fact?:            string;
  plain?:           string;
  isBoss?:          boolean;
  stars?:           number[];
  target?:          number;
  coins?:           number;

  // Simulator
  simulatorLesson?: string;
  lessonSimulations?: any[];

  // Rich lesson content
  examples?:        WorkedExample[];
  guidedPractice?:  GuidedPracticeItem[];
  keyTakeaway?:     string;
  visualPrompt?:    string;
  visualType?:      string;
  visualUrl?:       string;
  links?:           Array<{ label: string; url: string }>;
  contextTag?:      string;

  // Island-specific
  islandId?:        number;
  chain?:           string;
}
