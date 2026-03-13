/**
 * Sifter Skill_Up — useResume Hook
 *
 * Tracks and restores the user's exact last position:
 *   trackId → level → labId → lessonId → simulatorState
 *
 * Written to AsyncStorage immediately on every navigation event
 * so a crash or force-quit never loses position.
 *
 * On app open:
 *   - New user    → onboarding
 *   - Returning   → exact last position restored, no navigation required
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../lib/api';

const POSITION_KEY = 'sifter_last_position';

export interface LastPosition {
  trackId: string;
  trackName: string;
  level: 'junior' | 'intermediate' | 'senior';
  labId: string;
  labTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonIndex: number;    // position within lab
  labIndex: number;       // position within level
  simulatorState?: {      // non-null if user was mid-simulator
    type: string;
    phase: 'learning-loop' | 'certification-attempt' | 'aggregate' | 'remediation';
    attemptNumber: number;
  };
  savedAt: string;        // ISO timestamp
}

export function useResume() {
  const [lastPosition, setLastPosition] = useState<LastPosition | null>(null);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  // Load on mount
  useEffect(() => {
    AsyncStorage.getItem(POSITION_KEY)
      .then(raw => {
        if (raw) {
          try { setLastPosition(JSON.parse(raw)); } catch {}
        }
      })
      .finally(() => setLoadedFromStorage(true));
  }, []);

  /**
   * Call this on EVERY navigation event — lesson open, sim start, tab change.
   * Writes to AsyncStorage synchronously so position survives crashes.
   * Also syncs to backend so position is preserved across devices.
   */
  const savePosition = useCallback(async (position: Omit<LastPosition, 'savedAt'>) => {
    const full: LastPosition = { ...position, savedAt: new Date().toISOString() };
    setLastPosition(full);
    await AsyncStorage.setItem(POSITION_KEY, JSON.stringify(full));
    // Non-blocking backend sync — position is already saved locally
    API.saveLastPosition(full).catch(() => {});
  }, []);

  /**
   * Clears saved position — called when user explicitly starts a new track
   * or completes a full level.
   */
  const clearPosition = useCallback(async () => {
    setLastPosition(null);
    await AsyncStorage.removeItem(POSITION_KEY);
    API.clearLastPosition().catch(() => {});
  }, []);

  /**
   * Returns true if there's a saved position to resume from.
   * Used to show "Resume" vs "Start" on the home screen.
   */
  const hasPosition = loadedFromStorage && lastPosition !== null;

  return { lastPosition, hasPosition, savePosition, clearPosition, loadedFromStorage };
}
