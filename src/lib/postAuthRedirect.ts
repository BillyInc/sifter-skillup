let pendingPostAuthRedirect: string | null = null;

const STORAGE_KEY = 'sifter_post_auth_redirect_v1';
const USER_STORAGE_KEY = 'sifter_post_auth_redirect_user_v1';

const BLOCKED_POST_AUTH_SEGMENTS = [
  '/community',
  '/guild',
  '/streaks',
  '/skills',
  '/fields',
  '/map',
  '/lesson',
  '/track',
  '/feed',
  '/portfolio',
];

function canUseWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isAllowedPostAuthPath(path: string | null | undefined) {
  if (!path) return false;
  if (!path.startsWith('/')) return false;
  return !BLOCKED_POST_AUTH_SEGMENTS.some((segment) => path.includes(segment));
}

export function setPendingPostAuthRedirect(path: string | null, userId?: string | null) {
  pendingPostAuthRedirect = isAllowedPostAuthPath(path) ? path : null;

  if (!canUseWebStorage()) {
    return;
  }

  try {
    if (pendingPostAuthRedirect) {
      window.localStorage.setItem(STORAGE_KEY, pendingPostAuthRedirect);
      if (userId) {
        window.localStorage.setItem(USER_STORAGE_KEY, userId);
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch {
    // Best effort only.
  }
}

export function consumePendingPostAuthRedirect(userId?: string | null): string | null {
  let path = pendingPostAuthRedirect;

  if (!path && canUseWebStorage()) {
    try {
      const storedUserId = window.localStorage.getItem(USER_STORAGE_KEY);
      if (userId && storedUserId && storedUserId !== userId) {
        setPendingPostAuthRedirect(null);
        return null;
      }
      path = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      path = null;
    }
  }

  setPendingPostAuthRedirect(null);
  return isAllowedPostAuthPath(path) ? path : null;
}
