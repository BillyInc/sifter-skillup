/**
 * Starknet Lesson Registry
 *
 * Central mapping from (trackId, labNumber, lessonIndex) → lesson object.
 * Used by WorldScreen to open the first lesson in a lab and by LessonScreen /
 * useLessonEngine to load lab-scoped lessons that are NOT in the flat
 * numeric-ID LEVELS array.
 *
 * Boss level IDs (must stay in sync with backend + WorldScreen + track screens):
 *   starknet-defi-navigator      : lab N boss = 3000 + N      (labs 1-11 → 3001-3011)
 *   starknet-ecosystem-deep-dive : primer = 4000, lab N boss = 4000 + N (labs 1-9 → 4001-4009)
 *   cairo-builder                : lab N boss = 5000 + N      (labs 0-12 → 5000-5012)
 *
 * Lessons are sourced from the existing data files (no duplication):
 *   src/data/tracks/starknet_ecosystem/navigator/navigatorLessons.ts
 *   src/data/tracks/starknet_ecosystem/ecosystem/ecosystemAllLessons.ts
 *   src/data/tracks/starknet_ecosystem/builder/builderLessons.ts
 */

// ─── Navigator lessons ────────────────────────────────────────────────────────
import {
  LAB1_LESSONS_1_TO_4 as NAV_LAB1_A,
  LAB1_LESSONS_5_TO_8 as NAV_LAB1_B,
  LAB2_LESSONS_1_TO_5 as NAV_LAB2,
  LAB3_LESSONS_1_TO_3 as NAV_LAB3_A,
  LAB3_LESSONS_4_TO_5 as NAV_LAB3_B,
  LAB4_LESSONS_1_TO_4 as NAV_LAB4_A,
  LAB4_LESSON_5 as NAV_LAB4_5,
  LAB5_LESSONS_1_TO_4 as NAV_LAB5_A,
  LAB5_LESSON_5 as NAV_LAB5_5,
  LAB6_LESSONS_1_TO_4 as NAV_LAB6_A,
  LAB6_LESSON_5 as NAV_LAB6_5,
  LAB7_LESSONS_1_TO_3 as NAV_LAB7_A,
  LAB7_LESSON_4 as NAV_LAB7_4,
  LAB7_LESSON_5 as NAV_LAB7_5,
  LAB8_LESSONS_1_TO_3 as NAV_LAB8_A,
  LAB8_LESSONS_4_TO_5 as NAV_LAB8_B,
  LAB9_LESSONS_1_TO_3 as NAV_LAB9_A,
  LAB9_LESSONS_4_TO_5 as NAV_LAB9_B,
  LAB10_ALL_LESSONS as NAV_LAB10,
  LAB11_ALL_LESSONS as NAV_LAB11,
} from './navigator/navigatorLessons';

// ─── Ecosystem lessons ────────────────────────────────────────────────────────
import {
  PRIMER_L0_1,
  PRIMER_L0_2,
  PRIMER_L0_3,
  LAB9_SQL_PRIMER_1,
  LAB9_SQL_PRIMER_2,
  LAB9_SQL_PRIMER_3,
  LAB9_SQL_PRIMER_4,
  LAB1_LESSON_1 as ECO_L1_1,
  LAB1_LESSON_2 as ECO_L1_2,
  LAB1_LESSON_3 as ECO_L1_3,
  LAB1_LESSON_4 as ECO_L1_4,
  LAB1_LESSON_5 as ECO_L1_5,
  LAB2_LESSON_1 as ECO_L2_1,
  LAB2_LESSON_2 as ECO_L2_2,
  LAB2_LESSON_3 as ECO_L2_3,
  LAB2_LESSON_4 as ECO_L2_4,
  LAB2_LESSON_5 as ECO_L2_5,
  LAB3_LESSON_1 as ECO_L3_1,
  LAB3_LESSON_2 as ECO_L3_2,
  LAB3_LESSON_3 as ECO_L3_3,
  LAB3_LESSON_4 as ECO_L3_4,
  LAB3_LESSON_5 as ECO_L3_5,
  LAB4_LESSON_1 as ECO_L4_1,
  LAB4_LESSON_2 as ECO_L4_2,
  LAB4_LESSON_3 as ECO_L4_3,
  LAB4_LESSON_4 as ECO_L4_4,
  LAB4_LESSON_5 as ECO_L4_5,
  LAB5_LESSON_1 as ECO_L5_1,
  LAB5_LESSON_2 as ECO_L5_2,
  LAB5_LESSON_3 as ECO_L5_3,
  LAB5_LESSON_4 as ECO_L5_4,
  LAB5_LESSON_5 as ECO_L5_5,
  LAB6_LESSON_1 as ECO_L6_1,
  LAB6_LESSON_2 as ECO_L6_2,
  LAB6_LESSON_3 as ECO_L6_3,
  LAB6_LESSON_4 as ECO_L6_4,
  LAB6_LESSON_5 as ECO_L6_5,
  LAB7_LESSON_1 as ECO_L7_1,
  LAB7_LESSON_2 as ECO_L7_2,
  LAB7_LESSON_3 as ECO_L7_3,
  LAB7_LESSON_4 as ECO_L7_4,
  LAB7_LESSON_5 as ECO_L7_5,
  LAB8_LESSON_1 as ECO_L8_1,
  LAB8_LESSON_2 as ECO_L8_2,
  LAB8_LESSON_3 as ECO_L8_3,
  LAB8_LESSON_4 as ECO_L8_4,
  LAB8_LESSON_5 as ECO_L8_5,
  LAB9_LESSON_1 as ECO_L9_1,
  LAB9_LESSON_2 as ECO_L9_2,
  LAB9_LESSON_3 as ECO_L9_3,
  LAB9_LESSON_4 as ECO_L9_4,
  LAB9_LESSON_5 as ECO_L9_5,
} from './ecosystem/ecosystemAllLessons';

// ─── Builder (Cairo) lessons ──────────────────────────────────────────────────
import {
  CAIRO_SETUP_LAB_LESSONS,
  CAIRO_LAB0_LESSONS,
  CAIRO_LAB1_PART_A,
  CAIRO_LAB1_PART_B,
  CAIRO_LAB2_LESSONS,
  CAIRO_LAB3_LESSONS,
  CAIRO_LAB4_LESSONS,
  CAIRO_LAB5_LESSONS,
  CAIRO_LAB6_LESSONS,
  CAIRO_LAB7_LESSONS,
  CAIRO_LAB8_LESSONS,
  CAIRO_LAB9_LESSONS,
  CAIRO_LAB10_LESSONS,
  CAIRO_LAB11_LESSONS,
  CAIRO_LAB12_LESSONS,
} from './builder/builderLessons';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StarknetTrackId =
  | 'starknet-defi-navigator'
  | 'starknet-ecosystem-deep-dive'
  | 'cairo-builder';

export interface StarknetLabRef {
  trackId: StarknetTrackId;
  labId: string;       // stable string id, e.g. 'lab1', 'primer', '0'
  labNumber: number;   // 1-based for navigator/ecosystem labs; 0 for Cairo setup / Ecosystem primer
  bossLevelId: number; // e.g. 3001 for navigator lab 1
  lessons: any[];      // flat ordered list of lesson objects (no boss)
  title?: string;      // optional human-readable lab title
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STARKNET_TRACK_IDS: StarknetTrackId[] = [
  'starknet-defi-navigator',
  'starknet-ecosystem-deep-dive',
  'cairo-builder',
];

export function isStarknetTrack(trackId: string): trackId is StarknetTrackId {
  return (STARKNET_TRACK_IDS as string[]).includes(trackId);
}

// ─── Assembled lab tables ─────────────────────────────────────────────────────

// Navigator: labs 1-11. Boss ID = 3000 + N.
const NAVIGATOR_LABS: StarknetLabRef[] = [
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab1',
    labNumber: 1,
    bossLevelId: 3001,
    lessons: [...NAV_LAB1_A, ...NAV_LAB1_B],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab2',
    labNumber: 2,
    bossLevelId: 3002,
    lessons: [...NAV_LAB2],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab3',
    labNumber: 3,
    bossLevelId: 3003,
    lessons: [...NAV_LAB3_A, ...NAV_LAB3_B],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab4',
    labNumber: 4,
    bossLevelId: 3004,
    lessons: [...NAV_LAB4_A, NAV_LAB4_5],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab5',
    labNumber: 5,
    bossLevelId: 3005,
    lessons: [...NAV_LAB5_A, NAV_LAB5_5],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab6',
    labNumber: 6,
    bossLevelId: 3006,
    lessons: [...NAV_LAB6_A, NAV_LAB6_5],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab7',
    labNumber: 7,
    bossLevelId: 3007,
    lessons: [...NAV_LAB7_A, NAV_LAB7_4, NAV_LAB7_5],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab8',
    labNumber: 8,
    bossLevelId: 3008,
    lessons: [...NAV_LAB8_A, ...NAV_LAB8_B],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab9',
    labNumber: 9,
    bossLevelId: 3009,
    lessons: [...NAV_LAB9_A, ...NAV_LAB9_B],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab10',
    labNumber: 10,
    bossLevelId: 3010,
    lessons: [...NAV_LAB10],
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab11',
    labNumber: 11,
    bossLevelId: 3011,
    lessons: [...NAV_LAB11],
  },
];

// Ecosystem: primer (0) + labs 1-9. Boss ID = 4000 + N.
const ECOSYSTEM_LABS_REF: StarknetLabRef[] = [
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'primer',
    labNumber: 0,
    bossLevelId: 4000,
    lessons: [PRIMER_L0_1, PRIMER_L0_2, PRIMER_L0_3],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-1',
    labNumber: 1,
    bossLevelId: 4001,
    lessons: [ECO_L1_1, ECO_L1_2, ECO_L1_3, ECO_L1_4, ECO_L1_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-2',
    labNumber: 2,
    bossLevelId: 4002,
    lessons: [ECO_L2_1, ECO_L2_2, ECO_L2_3, ECO_L2_4, ECO_L2_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-3',
    labNumber: 3,
    bossLevelId: 4003,
    lessons: [ECO_L3_1, ECO_L3_2, ECO_L3_3, ECO_L3_4, ECO_L3_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-4',
    labNumber: 4,
    bossLevelId: 4004,
    lessons: [ECO_L4_1, ECO_L4_2, ECO_L4_3, ECO_L4_4, ECO_L4_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-5',
    labNumber: 5,
    bossLevelId: 4005,
    lessons: [ECO_L5_1, ECO_L5_2, ECO_L5_3, ECO_L5_4, ECO_L5_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-6',
    labNumber: 6,
    bossLevelId: 4006,
    lessons: [ECO_L6_1, ECO_L6_2, ECO_L6_3, ECO_L6_4, ECO_L6_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-7',
    labNumber: 7,
    bossLevelId: 4007,
    lessons: [ECO_L7_1, ECO_L7_2, ECO_L7_3, ECO_L7_4, ECO_L7_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-8',
    labNumber: 8,
    bossLevelId: 4008,
    lessons: [ECO_L8_1, ECO_L8_2, ECO_L8_3, ECO_L8_4, ECO_L8_5],
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-9',
    labNumber: 9,
    bossLevelId: 4009,
    lessons: [
      LAB9_SQL_PRIMER_1,
      LAB9_SQL_PRIMER_2,
      LAB9_SQL_PRIMER_3,
      LAB9_SQL_PRIMER_4,
      ECO_L9_1,
      ECO_L9_2,
      ECO_L9_3,
      ECO_L9_4,
      ECO_L9_5,
    ],
  },
];

// Cairo Builder: labs 0-12. Boss ID = 5000 + N (lab 0 → 5000).
const BUILDER_LABS: StarknetLabRef[] = [
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-0',
    labNumber: 0,
    bossLevelId: 5000,
    lessons: [...CAIRO_SETUP_LAB_LESSONS, ...CAIRO_LAB0_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-1',
    labNumber: 1,
    bossLevelId: 5001,
    lessons: [...CAIRO_LAB1_PART_A, ...CAIRO_LAB1_PART_B],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-2',
    labNumber: 2,
    bossLevelId: 5002,
    lessons: [...CAIRO_LAB2_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-3',
    labNumber: 3,
    bossLevelId: 5003,
    lessons: [...CAIRO_LAB3_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-4',
    labNumber: 4,
    bossLevelId: 5004,
    lessons: [...CAIRO_LAB4_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-5',
    labNumber: 5,
    bossLevelId: 5005,
    lessons: [...CAIRO_LAB5_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-6',
    labNumber: 6,
    bossLevelId: 5006,
    lessons: [...CAIRO_LAB6_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-7',
    labNumber: 7,
    bossLevelId: 5007,
    lessons: [...CAIRO_LAB7_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-8',
    labNumber: 8,
    bossLevelId: 5008,
    lessons: [...CAIRO_LAB8_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-9',
    labNumber: 9,
    bossLevelId: 5009,
    lessons: [...CAIRO_LAB9_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-10',
    labNumber: 10,
    bossLevelId: 5010,
    lessons: [...CAIRO_LAB10_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-11',
    labNumber: 11,
    bossLevelId: 5011,
    lessons: [...CAIRO_LAB11_LESSONS],
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-12',
    labNumber: 12,
    bossLevelId: 5012,
    lessons: [...CAIRO_LAB12_LESSONS],
  },
];

function getLabsForTrack(trackId: StarknetTrackId): StarknetLabRef[] {
  switch (trackId) {
    case 'starknet-defi-navigator':
      return NAVIGATOR_LABS;
    case 'starknet-ecosystem-deep-dive':
      return ECOSYSTEM_LABS_REF;
    case 'cairo-builder':
      return BUILDER_LABS;
    default:
      return [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getStarknetLab(
  trackId: StarknetTrackId,
  labNumber: number,
): StarknetLabRef | null {
  const labs = getLabsForTrack(trackId);
  const match = labs.find((l) => l.labNumber === labNumber);
  return match ?? null;
}

export function getStarknetLabs(trackId: StarknetTrackId): StarknetLabRef[] {
  return [...getLabsForTrack(trackId)];
}

export function getStarknetLesson(
  trackId: StarknetTrackId,
  labNumber: number,
  lessonIndex: number,
): any | null {
  const lab = getStarknetLab(trackId, labNumber);
  if (!lab) return null;
  if (lessonIndex < 0 || lessonIndex >= lab.lessons.length) return null;
  return lab.lessons[lessonIndex] ?? null;
}

export function getStarknetLessonCount(
  trackId: StarknetTrackId,
  labNumber: number,
): number {
  return getStarknetLab(trackId, labNumber)?.lessons.length ?? 0;
}

export function getStarknetLessonRuntimeId(
  trackId: StarknetTrackId,
  labNumber: number,
  lessonIndex: number,
): number {
  const trackBase =
    trackId === 'starknet-defi-navigator'
      ? 31000
      : trackId === 'starknet-ecosystem-deep-dive'
        ? 41000
        : 51000;

  return trackBase + (labNumber * 100) + lessonIndex;
}
