import { useCallback } from 'react';
import { API } from '../lib/api';
import { useAuth } from './useAuth';

export function useProgress() {
  const { user, refreshUser } = useAuth();

  const completeLevel = useCallback(async (
    levelId: number,
    track: string,
    score: number,
    perfect: boolean
  ) => {
    if (!user) return;
    const result = await API.completeLevel({
      level_id: levelId,
      track,
      score,
      is_perfect: perfect,
    });
    await refreshUser();
    return result;
  }, [user, refreshUser]);

  const isLevelCompleted = useCallback((levelId: number) => {
    return user?.completed_levels?.includes(String(levelId)) ?? false;
  }, [user]);

  const progressPercent = useCallback((start: number, end: number) => {
    if (!user) return 0;
    const total = end - start + 1;
    const done = user.completed_levels?.filter(
      l => Number(l) >= start && Number(l) <= end
    ).length ?? 0;
    return Math.round((done / total) * 100);
  }, [user]);

  return { completeLevel, isLevelCompleted, progressPercent };
}
