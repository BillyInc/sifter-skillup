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
 *
 * ─── Why the lesson bodies are loaded lazily ─────────────────────────────────
 *
 * Those three files are ~4MB of lesson content. This registry used to import
 * them statically and spread them into module-level tables, and five screens
 * import this registry, so every one of them dragged the entire lesson corpus
 * into the web entry chunk whether or not a lesson was ever opened.
 *
 * Almost nothing needs the lesson bodies. WorldScreen, the two track screens
 * and the map route only ever read how MANY lessons a lab has. So a lab's
 * metadata -- including `lessonCount` -- stays synchronous, and only the
 * lesson objects themselves move behind `loadLessons()`.
 *
 * `lessonCount` is a literal rather than `lessons.length` precisely because
 * reading the length would defeat the whole exercise: it would have to touch
 * the array. That makes the counts drift-able, so
 * __tests__/starknetLessonCounts.test.ts imports the real modules (tests are
 * not bundled) and asserts every count matches. Drift fails CI rather than
 * silently mis-rendering a lab.
 */

// Each module is imported exactly once, so metro emits one chunk per lesson
// file and the labs within a track share it.
const navigatorModule = () => import('./navigator/navigatorLessons');
const ecosystemModule = () => import('./ecosystem/ecosystemAllLessons');
const builderModule = () => import('./builder/builderLessons');

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
  lessonCount: number; // number of lessons, WITHOUT loading them (see file header)
  /** Resolves the lab's ordered lesson objects (no boss). Loads the chunk on first call. */
  loadLessons: () => Promise<any[]>;
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
    lessonCount: 8,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB1_LESSONS_1_TO_4, ...m.LAB1_LESSONS_5_TO_8];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab2',
    labNumber: 2,
    bossLevelId: 3002,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB2_LESSONS_1_TO_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab3',
    labNumber: 3,
    bossLevelId: 3003,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB3_LESSONS_1_TO_3, ...m.LAB3_LESSONS_4_TO_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab4',
    labNumber: 4,
    bossLevelId: 3004,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB4_LESSONS_1_TO_4, m.LAB4_LESSON_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab5',
    labNumber: 5,
    bossLevelId: 3005,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB5_LESSONS_1_TO_4, m.LAB5_LESSON_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab6',
    labNumber: 6,
    bossLevelId: 3006,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB6_LESSONS_1_TO_4, m.LAB6_LESSON_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab7',
    labNumber: 7,
    bossLevelId: 3007,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB7_LESSONS_1_TO_3, m.LAB7_LESSON_4, m.LAB7_LESSON_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab8',
    labNumber: 8,
    bossLevelId: 3008,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB8_LESSONS_1_TO_3, ...m.LAB8_LESSONS_4_TO_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab9',
    labNumber: 9,
    bossLevelId: 3009,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB9_LESSONS_1_TO_3, ...m.LAB9_LESSONS_4_TO_5];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab10',
    labNumber: 10,
    bossLevelId: 3010,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB10_ALL_LESSONS];
    },
  },
  {
    trackId: 'starknet-defi-navigator',
    labId: 'lab11',
    labNumber: 11,
    bossLevelId: 3011,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await navigatorModule();
      return [...m.LAB11_ALL_LESSONS];
    },
  },
];

// Ecosystem: primer (lab 0) + labs 1-9. Boss ID = 4000 + N.
const ECOSYSTEM_LABS_REF: StarknetLabRef[] = [
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'primer',
    labNumber: 0,
    bossLevelId: 4000,
    lessonCount: 3,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.PRIMER_L0_1, m.PRIMER_L0_2, m.PRIMER_L0_3];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-1',
    labNumber: 1,
    bossLevelId: 4001,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB1_LESSON_1, m.LAB1_LESSON_2, m.LAB1_LESSON_3, m.LAB1_LESSON_4, m.LAB1_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-2',
    labNumber: 2,
    bossLevelId: 4002,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB2_LESSON_1, m.LAB2_LESSON_2, m.LAB2_LESSON_3, m.LAB2_LESSON_4, m.LAB2_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-3',
    labNumber: 3,
    bossLevelId: 4003,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB3_LESSON_1, m.LAB3_LESSON_2, m.LAB3_LESSON_3, m.LAB3_LESSON_4, m.LAB3_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-4',
    labNumber: 4,
    bossLevelId: 4004,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB4_LESSON_1, m.LAB4_LESSON_2, m.LAB4_LESSON_3, m.LAB4_LESSON_4, m.LAB4_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-5',
    labNumber: 5,
    bossLevelId: 4005,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB5_LESSON_1, m.LAB5_LESSON_2, m.LAB5_LESSON_3, m.LAB5_LESSON_4, m.LAB5_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-6',
    labNumber: 6,
    bossLevelId: 4006,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB6_LESSON_1, m.LAB6_LESSON_2, m.LAB6_LESSON_3, m.LAB6_LESSON_4, m.LAB6_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-7',
    labNumber: 7,
    bossLevelId: 4007,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB7_LESSON_1, m.LAB7_LESSON_2, m.LAB7_LESSON_3, m.LAB7_LESSON_4, m.LAB7_LESSON_5];
    },
  },
  {
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-8',
    labNumber: 8,
    bossLevelId: 4008,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [m.LAB8_LESSON_1, m.LAB8_LESSON_2, m.LAB8_LESSON_3, m.LAB8_LESSON_4, m.LAB8_LESSON_5];
    },
  },
  {
    // Lab 9 opens with four SQL primer lessons before its five regular ones.
    trackId: 'starknet-ecosystem-deep-dive',
    labId: 'ecosystem-lab-9',
    labNumber: 9,
    bossLevelId: 4009,
    lessonCount: 9,
    loadLessons: async () => {
      const m = await ecosystemModule();
      return [
        m.LAB9_SQL_PRIMER_1,
        m.LAB9_SQL_PRIMER_2,
        m.LAB9_SQL_PRIMER_3,
        m.LAB9_SQL_PRIMER_4,
        m.LAB9_LESSON_1,
        m.LAB9_LESSON_2,
        m.LAB9_LESSON_3,
        m.LAB9_LESSON_4,
        m.LAB9_LESSON_5,
      ];
    },
  },
];

// Cairo Builder: labs 0-12. Boss ID = 5000 + N (lab 0 → 5000).
const BUILDER_LABS: StarknetLabRef[] = [
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-0',
    labNumber: 0,
    bossLevelId: 5000,
    lessonCount: 12,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_SETUP_LAB_LESSONS, ...m.CAIRO_LAB0_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-1',
    labNumber: 1,
    bossLevelId: 5001,
    lessonCount: 8,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB1_PART_A, ...m.CAIRO_LAB1_PART_B];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-2',
    labNumber: 2,
    bossLevelId: 5002,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB2_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-3',
    labNumber: 3,
    bossLevelId: 5003,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB3_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-4',
    labNumber: 4,
    bossLevelId: 5004,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB4_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-5',
    labNumber: 5,
    bossLevelId: 5005,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB5_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-6',
    labNumber: 6,
    bossLevelId: 5006,
    lessonCount: 8,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB6_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-7',
    labNumber: 7,
    bossLevelId: 5007,
    lessonCount: 8,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB7_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-8',
    labNumber: 8,
    bossLevelId: 5008,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB8_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-9',
    labNumber: 9,
    bossLevelId: 5009,
    lessonCount: 8,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB9_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-10',
    labNumber: 10,
    bossLevelId: 5010,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB10_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-11',
    labNumber: 11,
    bossLevelId: 5011,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB11_LESSONS];
    },
  },
  {
    trackId: 'cairo-builder',
    labId: 'cairo-lab-12',
    labNumber: 12,
    bossLevelId: 5012,
    lessonCount: 5,
    loadLessons: async () => {
      const m = await builderModule();
      return [...m.CAIRO_LAB12_LESSONS];
    },
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

/**
 * Async because the lesson bodies live in a lazily-loaded chunk. The bounds
 * check uses `lessonCount`, so an out-of-range index still costs nothing.
 */
export async function getStarknetLesson(
  trackId: StarknetTrackId,
  labNumber: number,
  lessonIndex: number,
): Promise<any | null> {
  const lab = getStarknetLab(trackId, labNumber);
  if (!lab) return null;
  if (lessonIndex < 0 || lessonIndex >= lab.lessonCount) return null;
  const lessons = await lab.loadLessons();
  return lessons[lessonIndex] ?? null;
}

export function getStarknetLessonCount(
  trackId: StarknetTrackId,
  labNumber: number,
): number {
  return getStarknetLab(trackId, labNumber)?.lessonCount ?? 0;
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
