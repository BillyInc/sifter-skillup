let pendingPostAuthRedirect: string | null = null;

const STORAGE_KEY = 'sifter_post_auth_redirect_v1';

function canUseWebStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function setPendingPostAuthRedirect(path: string | null) {
  pendingPostAuthRedirect = path;

  if (!canUseWebStorage()) {
    return;
  }

  try {
    if (path) {
      window.localStorage.setItem(STORAGE_KEY, path);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Best effort only.
  }
}

export function consumePendingPostAuthRedirect(): string | null {
  let path = pendingPostAuthRedirect;

  if (!path && canUseWebStorage()) {
    try {
      path = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      path = null;
    }
  }

  setPendingPostAuthRedirect(null);
  return path;
}
