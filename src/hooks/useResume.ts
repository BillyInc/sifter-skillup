/**
 * Sifter LevelUp — useResume (v2, WatermelonDB)
 *
 * REPLACES: src/hooks/useResume.ts
 *
 * Same external API. Writes go to WatermelonDB first (instant,
 * survives crashes), then enqueued to server.
 *
 * The WatermelonDB write is synchronous from the caller's perspective
 * — no await needed for navigation. The queue drain is fire-and-forget.
 */

import { useCallback, useEffect, useState } from 'react';
import { enqueueWrite, saveLastPosition, getLastPosition } from '../lib/offlineStorage';

export interface LastPosition {
  trackId:        string;
  trackName:      string;
  level:          'junior' | 'intermediate' | 'senior';
  labId:          string;
  labTitle:       string;
  lessonId:       string;
  lessonTitle:    string;
  lessonIndex:    number;
  labIndex:       number;
  simulatorState?: {
    type:          string;
    phase:         'learning-loop' | 'certification-attempt' | 'aggregate' | 'remediation';
    attemptNumber: number;
  } | null;
  savedAt:        string;
}

export function useResume() {
  const [lastPosition,       setLastPosition]       = useState<LastPosition | null>(null);
  const [loadedFromStorage,  setLoadedFromStorage]  = useState(false);

  useEffect(() => {
    getLastPosition()
      .then(pos => { if (pos) setLastPosition(pos as LastPosition); })
      .finally(() => setLoadedFromStorage(true));
  }, []);

  /**
   * Call on EVERY navigation event — lesson open, sim start, etc.
   * WatermelonDB write is transactional — crash-safe.
   * Server sync is queued with 'high' priority, fire-and-forget.
   */
  const savePosition = useCallback(async (position: Omit<LastPosition, 'savedAt'>) => {
    const full: LastPosition = { ...position, savedAt: new Date().toISOString() };
    setLastPosition(full);

    // 1. Write to WatermelonDB (instant, crash-safe)
    await saveLastPosition(full);

    // 2. Enqueue server sync (non-blocking)
    enqueueWrite('/api/users/last-position', 'POST', { position: full }, 'high').catch(() => {});
  }, []);

  /**
   * Clear position when starting fresh or completing a full track.
   */
  const clearPosition = useCallback(async () => {
    setLastPosition(null);
    await saveLastPosition(null);
    enqueueWrite('/api/users/last-position', 'DELETE', {}, 'normal').catch(() => {});
  }, []);

  const hasPosition = loadedFromStorage && lastPosition !== null;

  return { lastPosition, hasPosition, savePosition, clearPosition, loadedFromStorage };
}
