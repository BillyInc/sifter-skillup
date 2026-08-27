/**
 * Guards the hardcoded `lessonCount` literals in starknetLessonRegistry.
 *
 * The registry cannot derive its counts from `lessons.length` — reading the
 * length would pull the ~4MB lesson corpus into the bundle, which is the exact
 * thing the lazy loading exists to prevent. So the counts are literals, and
 * this test is what keeps them honest: it actually awaits `loadLessons()` and
 * asserts the real array length matches. Tests are not bundled, so importing
 * the lesson modules here costs nothing at runtime.
 *
 * If this fails, a lesson was added or removed without updating `lessonCount`.
 * Fix the literal in the registry — do not relax the assertion.
 */
import {
  getStarknetLabs,
  getStarknetLessonCount,
  getStarknetLesson,
  StarknetTrackId,
} from '@/data/tracks/starknet_ecosystem/starknetLessonRegistry';

const TRACKS: StarknetTrackId[] = [
  'starknet-defi-navigator',
  'starknet-ecosystem-deep-dive',
  'cairo-builder',
];

describe('starknet lesson registry counts', () => {
  it.each(TRACKS)('every lab in %s reports its real lesson count', async (trackId) => {
    const labs = getStarknetLabs(trackId);
    expect(labs.length).toBeGreaterThan(0);

    for (const lab of labs) {
      const lessons = await lab.loadLessons();
      expect(`${lab.labId}=${lab.lessonCount}`).toBe(`${lab.labId}=${lessons.length}`);
      // no holes — a lab of N must resolve N real lesson objects
      expect(lessons.every((l) => l != null)).toBe(true);
      expect(getStarknetLessonCount(trackId, lab.labNumber)).toBe(lessons.length);
    }
  });

  it('resolves a lesson by index and rejects out-of-range', async () => {
    const [lab] = getStarknetLabs('cairo-builder');
    await expect(getStarknetLesson('cairo-builder', lab.labNumber, 0)).resolves.toBeTruthy();
    await expect(
      getStarknetLesson('cairo-builder', lab.labNumber, lab.lessonCount),
    ).resolves.toBeNull();
    await expect(getStarknetLesson('cairo-builder', lab.labNumber, -1)).resolves.toBeNull();
  });

  it('returns null for an unknown lab rather than throwing', async () => {
    expect(getStarknetLessonCount('starknet-defi-navigator', 999)).toBe(0);
    await expect(getStarknetLesson('starknet-defi-navigator', 999, 0)).resolves.toBeNull();
  });
});
