import { findTrackById, getTrackHref } from './trackContext';

export type ResumePosition = {
  trackId: string;
  trackName: string;
  level: string;
  labId: string;
  labTitle: string;
  lessonId: string;
  lessonTitle: string;
  lessonIndex: number;
  labIndex: number;
  simulatorState?: {
    type: string;
    phase: string;
    attemptNumber: number;
  } | null;
  savedAt: string;
};

type UserResumeLike = {
  last_position?: any;
  lastPosition?: any;
  current_track_id?: string | null;
  currentTrackId?: string | null;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normaliseResumePosition(raw: any): ResumePosition | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const trackId = String(raw.trackId ?? raw.track_id ?? '').trim();
  const lessonId = String(raw.lessonId ?? raw.lesson_id ?? '').trim();
  if (!trackId && !lessonId) {
    return null;
  }

  return {
    trackId,
    trackName: String(raw.trackName ?? raw.track_name ?? '').trim(),
    level: String(raw.level ?? '').trim(),
    labId: String(raw.labId ?? raw.lab_id ?? '').trim(),
    labTitle: String(raw.labTitle ?? raw.lab_title ?? '').trim(),
    lessonId,
    lessonTitle: String(raw.lessonTitle ?? raw.lesson_title ?? '').trim(),
    lessonIndex: toNumber(raw.lessonIndex ?? raw.lesson_index),
    labIndex: toNumber(raw.labIndex ?? raw.lab_index),
    simulatorState: raw.simulatorState ?? raw.simulator_state ?? null,
    savedAt: String(raw.savedAt ?? raw.saved_at ?? ''),
  };
}

function buildLessonHref(position: ResumePosition): string | null {
  if (!position.lessonId) {
    return null;
  }

  const params = new URLSearchParams({
    levelId: position.lessonId,
  });

  if (
    position.trackId &&
    ['starknet-defi-navigator', 'starknet-ecosystem-deep-dive', 'cairo-builder'].includes(position.trackId)
  ) {
    params.set('trackId', position.trackId);
    if (position.labId) {
      params.set('labId', position.labId);
    }
    if (position.labIndex > 0) {
      params.set('labNumber', String(position.labIndex));
    }
    params.set('lessonIndex', String(Math.max(0, position.lessonIndex)));
  }

  return `/(tabs)/map/lesson?${params.toString()}`;
}

export function buildResumeHref(position: ResumePosition | null | undefined): string | null {
  if (!position) {
    return null;
  }

  const lessonHref = buildLessonHref(position);
  if (lessonHref) {
    return lessonHref;
  }

  if (position.trackId === 'starknet-islands') {
    return '/(tabs)/map/island?initialIsland=18';
  }

  const track = findTrackById(position.trackId);
  return track ? getTrackHref(track) : null;
}

export function buildTrackResumeHref(trackId: string | null | undefined): string | null {
  if (!trackId) {
    return null;
  }

  const track = findTrackById(trackId);
  return track ? getTrackHref(track) : null;
}

export function resolveUserResumeHref(user: UserResumeLike | null | undefined): string | null {
  if (!user) {
    return null;
  }

  const exactResumeHref = buildResumeHref(
    normaliseResumePosition(user.last_position ?? user.lastPosition),
  );
  if (exactResumeHref) {
    return exactResumeHref;
  }

  return buildTrackResumeHref(user.current_track_id ?? user.currentTrackId);
}

export function resolvePostAuthHref(
  user: UserResumeLike | null | undefined,
  fallbackTrackId = 'starknet-islands',
): string {
  return (
    resolveUserResumeHref(user)
    ?? buildTrackResumeHref(fallbackTrackId)
    ?? '/(tabs)/home'
  );
}

export function getResumeSummary(position: ResumePosition | null | undefined): string | null {
  if (!position) {
    return null;
  }

  const parts = [
    position.trackName || position.trackId,
    position.labTitle || undefined,
    position.lessonTitle || undefined,
  ].filter(Boolean);

  if (!parts.length) {
    return null;
  }

  return `Last stop: ${parts.join(' · ')}`;
}
