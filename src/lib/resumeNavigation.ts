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
  auth_provider?: string | null;
  authProvider?: string | null;
  is_admin?: boolean | null;
  isAdmin?: boolean | null;
  /** Saved resume state; `deepLink` is an explicit href to return the user to. */
  resume_state?: { deep_link?: string | null; deepLink?: string | null } | null;
  resumeState?: { deep_link?: string | null; deepLink?: string | null } | null;
};

/** Where a guest lands: onboarding, not a lesson. */
export const GUEST_POST_AUTH_HREF = '/(auth)/onboarding';
/** Where an admin/educator lands. */
export const ADMIN_POST_AUTH_HREF = '/(admin)/dashboard';
/** The default landing surface for everyone else. */
export const DEFAULT_POST_AUTH_HREF = '/(tabs)/home';

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
      params.set('labNumber', String(Math.max(0, position.labIndex)));
    }
    params.set('lessonIndex', String(Math.max(0, position.lessonIndex)));
  }

  return `/map/lesson?${params.toString()}`;
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
    return '/map/island?initialIsland=18';
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

/**
 * Where a user lands immediately after authenticating.
 *
 * Order (§12.3):
 *   1. guests   → onboarding
 *   2. admins   → the admin dashboard
 *   3. an explicit saved resume deep link, when present
 *   4. home
 *
 * There is deliberately NO skill-track fallback: sending a returning student
 * into a skill track ('starknet-islands') was a leftover from the other
 * product and is not part of this app's post-auth contract.
 */
export function resolvePostAuthHref(
  user: UserResumeLike | null | undefined,
): string {
  if (!user) {
    return GUEST_POST_AUTH_HREF;
  }

  const provider = user.auth_provider ?? user.authProvider ?? null;
  if (provider === 'guest') {
    return GUEST_POST_AUTH_HREF;
  }

  if (user.is_admin ?? user.isAdmin ?? false) {
    return ADMIN_POST_AUTH_HREF;
  }

  const resumeState = user.resume_state ?? user.resumeState ?? null;
  const deepLink = (resumeState?.deepLink ?? resumeState?.deep_link ?? '').trim();
  if (deepLink) {
    return deepLink;
  }

  return DEFAULT_POST_AUTH_HREF;
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
