/**
 * shuffleOptions.ts
 *
 * Shuffles MCQ options at render time without modifying lesson data.
 * Tracks where the correct answer lands after shuffle so scoring still works.
 *
 * Usage:
 *   const { shuffledOptions, newCorrectIndex } = useShuffledOptions(options, correctIndex);
 *
 * Call once per question mount. Store result in state to prevent re-shuffle on re-render.
 * Check selectedIndex against newCorrectIndex, NOT the original data `correct` value.
 *
 * Applies to:
 *   — All guidedPractice questions (5 per lesson, all 3 tracks)
 *   — Boss Phase 1 MCQ task pools
 *   — Aggregate simulation MCQ types
 *
 * Does NOT apply to:
 *   — Lesson simulation open-response (judgment types)
 *   — Numerical input simulations
 */

import { useState, useMemo } from 'react';

export interface ShuffledOptions {
  shuffledOptions: string[];
  newCorrectIndex: number;
}

/**
 * Fisher-Yates shuffle with correct answer tracking.
 *
 * Stable: given the same correctIndex, the correct TEXT is tracked
 * through the shuffle by string identity — not by original index.
 * This means even if options have duplicates, the exact correct text
 * is found via Array.findIndex after shuffle.
 */
export function shuffleOptionsWithCorrectTracking(
  options: string[],
  correctIndex: number,
): ShuffledOptions {
  // Record the text of the correct option before shuffling
  const correctText = options[correctIndex];

  // Deep copy to avoid mutating lesson data
  const shuffled = [...options];

  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Find where the correct text landed after the shuffle
  const newCorrectIndex = shuffled.findIndex(opt => opt === correctText);

  return { shuffledOptions: shuffled, newCorrectIndex };
}

/**
 * React hook — shuffles once on mount and memoises the result.
 * Re-shuffles only if the options array reference changes (new question).
 *
 * @param options      The original options array from lesson data
 * @param correctIndex The original correct index from lesson data
 *
 * @returns { shuffledOptions, newCorrectIndex }
 *   Use shuffledOptions to render buttons.
 *   Use newCorrectIndex to check if selectedIndex === correct.
 */
export function useShuffledOptions(
  options: string[],
  correctIndex: number,
): ShuffledOptions {
  // useMemo with options.join() as key so it re-shuffles when question changes
  // but NOT on every render.
  const [shuffleKey] = useState(() => Math.random());

  return useMemo(
    () => shuffleOptionsWithCorrectTracking(options, correctIndex),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.join('||'), correctIndex, shuffleKey],
  );
}

/**
 * For class components or imperative code (boss phase task pools):
 * Call once, store result in component state.
 *
 * @example
 * // In a class component or before rendering:
 * const [shuffledState, setShuffled] = useState(() =>
 *   shuffleOptionsWithCorrectTracking(question.options, question.correct)
 * );
 * // Render shuffledState.shuffledOptions
 * // Check selectedIndex === shuffledState.newCorrectIndex
 */

/**
 * Shuffle a batch of questions at once (for boss phase task pools).
 * Each question gets its own shuffled options.
 *
 * @param questions  Array of { options: string[], correct: number, ...rest }
 * @returns          Array of { ...rest, options: string[], correct: number }
 *                   with shuffled options and updated correct indices
 */
export function shuffleQuestionBatch<T extends { options: string[]; correct: number }>(
  questions: T[],
): T[] {
  return questions.map(q => {
    const { shuffledOptions, newCorrectIndex } = shuffleOptionsWithCorrectTracking(
      q.options,
      q.correct,
    );
    return { ...q, options: shuffledOptions, correct: newCorrectIndex };
  });
}
