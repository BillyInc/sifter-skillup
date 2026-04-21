// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// ALL LESSONS MERGED: Labs 1–11
// Do not edit manually — generated from lab files

import { LAB1_LESSONS_1_TO_4 } from './lab1/navigatorLab1_lessons1to4';
import { LAB1_LESSONS_5_TO_8 } from './lab1/navigatorLab1_lessons5to8';
import { LAB1_AGGREGATE_SIMS, LAB1_BUILD_TASK, LAB1_BOSS, NAVIGATOR_LAB_1_META } from './lab1/navigatorLab1_boss';
import { LAB2_LESSONS_1_TO_5 } from './lab2/navigatorLab2_lessons1to5';
import { LAB2_AGGREGATE_SIMS, LAB2_BUILD_TASK, LAB2_BOSS, NAVIGATOR_LAB_2_META } from './lab2/navigatorLab2_boss';
import { LAB3_LESSONS_1_TO_3 } from './lab3/navigatorLab3_lessons1to3';
import { LAB3_LESSONS_4_TO_5 } from './lab3/navigatorLab3_part2';
import { LAB3_AGGREGATE_SIMS, LAB3_BUILD_TASK, LAB3_BOSS, NAVIGATOR_LAB_3_META } from './lab3/navigatorLab3_part2';
import { LAB4_LESSONS_1_TO_4 } from './lab4/navigatorLab4_lessons1to4';
import { LAB4_LESSON_5 } from './lab4/navigatorLab4_part2';
import { LAB4_AGGREGATE_SIMS, LAB4_BUILD_TASK, LAB4_BOSS, NAVIGATOR_LAB_4_META } from './lab4/navigatorLab4_part2';
import { LAB5_LESSONS_1_TO_4 } from './lab5/navigatorLab5_lessons1to4';
import { LAB5_LESSON_5 } from './lab5/navigatorLab5_part2';
import { LAB5_AGGREGATE_SIMS, LAB5_BUILD_TASK, LAB5_BOSS, NAVIGATOR_LAB_5_META } from './lab5/navigatorLab5_part2';
import { LAB6_LESSONS_1_TO_4 } from './lab6/navigatorLab6_lessons1to4';
import { LAB6_LESSON_5 } from './lab6/navigatorLab6_part2';
import { LAB6_AGGREGATE_SIMS, LAB6_BUILD_TASK, LAB6_BOSS, NAVIGATOR_LAB_6_META } from './lab6/navigatorLab6_part2';
import { LAB7_LESSONS_1_TO_3 } from './lab7/navigatorLab7_lessons1to3';
import { LAB7_LESSONS_4_TO_5 } from './lab7/navigatorLab7_part2';
import { LAB7_AGGREGATE_SIMS, LAB7_BUILD_TASK, LAB7_BOSS, NAVIGATOR_LAB_7_META } from './lab7/navigatorLab7_part2';
import { LAB8_LESSONS_1_TO_3 } from './lab8/navigatorLab8_lessons1to3';
import { LAB8_LESSONS_4_TO_5 } from './lab8/navigatorLab8_part2';
import { LAB8_AGGREGATE_SIMS, LAB8_BUILD_TASK, LAB8_BOSS, NAVIGATOR_LAB_8_META } from './lab8/navigatorLab8_part2';
import { LAB9_LESSONS_1_TO_3 } from './lab9/navigatorLab9_lessons1to3';
import { LAB9_LESSONS_4_TO_5 } from './lab9/navigatorLab9_part2';
import { LAB9_AGGREGATE_SIMS, LAB9_BUILD_TASK, LAB9_BOSS, NAVIGATOR_LAB_9_META } from './lab9/navigatorLab9_part2';
import { LAB10_ALL_LESSONS, LAB10_AGGREGATE_SIMULATIONS, LAB10_BUILD_TASK, LAB10_BOSS_MODE, NAVIGATOR_LAB_10_META } from './lab10/navigatorLab10_complete';
import { LAB11_ALL_LESSONS, LAB11_AGGREGATE_SIMULATIONS, LAB11_BUILD_TASK, LAB11_BOSS_MODE, DEFI_NAVIGATOR_FINAL_BOSS, NAVIGATOR_LAB_11_META } from './lab11/navigatorLab11_complete';

export const NAVIGATOR_LESSONS = [
  // ─────────────────────────────────────────────────────────────
  // LAB 1 — DeFi Mental Models (Junior)
  // ─────────────────────────────────────────────────────────────
  ...LAB1_LESSONS_1_TO_4,
  ...LAB1_LESSONS_5_TO_8,

  // ─────────────────────────────────────────────────────────────
  // LAB 2 — Token Swaps and AMMs (Junior)
  // ─────────────────────────────────────────────────────────────
  ...LAB2_LESSONS_1_TO_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 3 — Staking and Delegation (Junior)
  // ─────────────────────────────────────────────────────────────
  ...LAB3_LESSONS_1_TO_3,
  LAB3_LESSONS_4_TO_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 4 — Lending and Borrowing (Junior)
  // ─────────────────────────────────────────────────────────────
  ...LAB4_LESSONS_1_TO_4,
  LAB4_LESSON_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 5 — DCA and Automation (Junior)
  // ─────────────────────────────────────────────────────────────
  ...LAB5_LESSONS_1_TO_4,
  LAB5_LESSON_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 6 — Portfolio Strategy and Allocation (Intermediate)
  // ─────────────────────────────────────────────────────────────
  ...LAB6_LESSONS_1_TO_4,
  LAB6_LESSON_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 7 — Advanced Liquidity Provision (Intermediate)
  // ─────────────────────────────────────────────────────────────
  ...LAB7_LESSONS_1_TO_3,
  LAB7_LESSONS_4_TO_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 8 — Bridging and Cross-Chain Capital Movement (Intermediate)
  // ─────────────────────────────────────────────────────────────
  ...LAB8_LESSONS_1_TO_3,
  LAB8_LESSONS_4_TO_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 9 — Advanced DeFi Primitives (Intermediate)
  // ─────────────────────────────────────────────────────────────
  ...LAB9_LESSONS_1_TO_3,
  LAB9_LESSONS_4_TO_5,

  // ─────────────────────────────────────────────────────────────
  // LAB 10 — Institutional DeFi Operations (Senior)
  // ─────────────────────────────────────────────────────────────
  ...LAB10_ALL_LESSONS,

  // ─────────────────────────────────────────────────────────────
  // LAB 11 — Strategy Research and Competitive Analysis (Senior)
  // ─────────────────────────────────────────────────────────────
  ...LAB11_ALL_LESSONS,
];

export {
  LAB1_AGGREGATE_SIMS,
  LAB1_BUILD_TASK,
  LAB1_BOSS,
  NAVIGATOR_LAB_1_META,
  LAB2_AGGREGATE_SIMS,
  LAB2_BUILD_TASK,
  LAB2_BOSS,
  NAVIGATOR_LAB_2_META,
  LAB3_AGGREGATE_SIMS,
  LAB3_BUILD_TASK,
  LAB3_BOSS,
  NAVIGATOR_LAB_3_META,
  LAB4_AGGREGATE_SIMS,
  LAB4_BUILD_TASK,
  LAB4_BOSS,
  NAVIGATOR_LAB_4_META,
  LAB5_AGGREGATE_SIMS,
  LAB5_BUILD_TASK,
  LAB5_BOSS,
  NAVIGATOR_LAB_5_META,
  LAB6_AGGREGATE_SIMS,
  LAB6_BUILD_TASK,
  LAB6_BOSS,
  NAVIGATOR_LAB_6_META,
  LAB8_AGGREGATE_SIMS,
  LAB8_BUILD_TASK,
  LAB8_BOSS,
  NAVIGATOR_LAB_8_META,
  LAB9_AGGREGATE_SIMS,
  LAB9_BUILD_TASK,
  LAB9_BOSS,
  NAVIGATOR_LAB_9_META,
  LAB10_AGGREGATE_SIMULATIONS,
  LAB10_BUILD_TASK,
  LAB10_BOSS_MODE,
  NAVIGATOR_LAB_10_META,
  LAB11_AGGREGATE_SIMULATIONS,
  LAB11_BUILD_TASK,
  LAB11_BOSS_MODE,
  DEFI_NAVIGATOR_FINAL_BOSS,
  NAVIGATOR_LAB_11_META,
};

export const NAVIGATOR_TRACK_META = {
  id: 'starknet-defi-navigator',
  title: 'Starknet DeFi Navigator',
  track: 'quant-trader',
  level: 'junior→intermediate→senior',
  totalLessons: NAVIGATOR_LESSONS.length,
  totalLabs: 11,
  estimatedHours: 44,
  prerequisite: 'Starknet Island (levels 291–310)',
  description: 'From DeFi mental models to strategy research. Covers swaps, staking, lending, DCA, LP, bridging, advanced primitives, institutional ops, and competitive analysis on Starknet.',
};

export type NavigatorLesson = typeof NAVIGATOR_LESSONS[number];
export type NavigatorLabMeta = typeof NAVIGATOR_LAB_11_META;