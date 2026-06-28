// ⚡ Sifter LevelUp — Portfolio OAuth helper
// Branches between native (sifter:// deep link — backend default) and web
// (popup window + polling fallback). The backend redirects to sifter:// at the
// end of every callback, which is unreachable from a browser. Rather than
// touching the backend, on web we open OAuth in a popup and poll
// /api/portfolio/accounts until the account shows up (the backend has
// already written the row before issuing the sifter:// redirect), then close
// the popup.
//
// For demo day, GitHub is the only live-OAuth target. Other `oauth`-integration
// platforms fall through to the manual-link flow in PortfolioScreen.

import { Platform, Linking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { API } from './api';

// Only these platforms have real OAuth credentials wired up for demo day.
// Everything else gets the manual-link / package fallback UI.
export const OAUTH_LIVE_PLATFORMS = new Set<string>(['github']);

export function isOAuthLive(platformId: string): boolean {
  return OAUTH_LIVE_PLATFORMS.has(platformId);
}

/**
 * Best-effort callback URL the app is reachable at.
 *  - Web:    `${window.location.origin}/portfolio/oauth-callback` (browser-safe)
 *  - Native: `sifter://portfolio/oauth-callback` via Linking.createURL
 *
 * The backend doesn't currently accept a client-supplied redirect_uri (it's
 * hardcoded to `${API_BASE_URL}/api/portfolio/oauth/{platform}/callback`), so
 * this URL is only used as a hint for logging and for the web popup's final
 * resting landing page if we ever wire it into the backend.
 */
export function getAppCallbackUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/portfolio/oauth-callback`;
  }
  try {
    return ExpoLinking.createURL('/portfolio/oauth-callback');
  } catch {
    return 'sifter://portfolio/oauth-callback';
  }
}

type StartOAuthArgs = {
  platformId: string;
  onConnected: () => void | Promise<void>;
  onCancel?: () => void;
  /** How long to keep polling /accounts on web before giving up (ms). */
  timeoutMs?: number;
};

/**
 * Kick off OAuth for a platform. Branches by platform (web vs native) and
 * handles the "backend always redirects to sifter://" mismatch by polling
 * /api/portfolio/accounts on web to detect connection completion.
 *
 * Returns a cancel function.
 */
export async function startPortfolioOAuth({
  platformId,
  onConnected,
  onCancel,
  timeoutMs = 180_000,
}: StartOAuthArgs): Promise<() => void> {
  const urlResp = (await API.portfolioGetOAuthUrl(platformId)) as
    | string
    | { url?: string }
    | null;
  const authUrl = typeof urlResp === 'string' ? urlResp : urlResp?.url;
  if (!authUrl) {
    throw new Error('OAuth URL unavailable — platform likely not configured.');
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return startWebOAuth({ platformId, authUrl, onConnected, onCancel, timeoutMs });
  }

  // Native: open the auth URL; backend will redirect to sifter:// which the app
  // handles via existing deep-link wiring.
  await Linking.openURL(authUrl);
  return () => {};
}

function startWebOAuth({
  platformId,
  authUrl,
  onConnected,
  onCancel,
  timeoutMs,
}: {
  platformId: string;
  authUrl: string;
  onConnected: () => void | Promise<void>;
  onCancel?: () => void;
  timeoutMs: number;
}): () => void {
  // Snapshot currently-connected platform ids so we can detect the new one.
  let baseline = new Set<string>();
  let popup: Window | null = null;
  let cancelled = false;

  const cleanup = () => {
    cancelled = true;
    if (pollTimer) clearInterval(pollTimer);
    if (watchdogTimer) clearTimeout(watchdogTimer);
    try {
      popup?.close();
    } catch {
      /* noop */
    }
  };

  // Open the popup synchronously so browsers don't block it.
  popup = window.open(authUrl, 'sifter-portfolio-oauth', 'width=600,height=720');
  if (!popup) {
    throw new Error('Popup blocked — allow popups for this site and retry.');
  }

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

  // Seed baseline, then poll for the new account.
  (async () => {
    try {
      const initial = (await API.portfolioGetAccounts().catch(() => null)) as
        | { accounts?: Array<{ platformId?: string; platform_id?: string }> }
        | Array<{ platformId?: string; platform_id?: string }>
        | null;
      const seedList = Array.isArray(initial) ? initial : initial?.accounts ?? [];
      baseline = new Set(
        seedList.map((a) => a.platformId ?? a.platform_id ?? '').filter(Boolean),
      );
    } catch {
      /* noop */
    }

    pollTimer = setInterval(async () => {
      if (cancelled) return;
      try {
        const resp = (await API.portfolioGetAccounts()) as
          | { accounts?: Array<{ platformId?: string; platform_id?: string }> }
          | Array<{ platformId?: string; platform_id?: string }>;
        const list = Array.isArray(resp) ? resp : resp?.accounts ?? [];
        const hit = list.some((a) => {
          const id = a.platformId ?? a.platform_id ?? '';
          return id === platformId && !baseline.has(id);
        });
        if (hit) {
          cleanup();
          await onConnected();
          return;
        }
      } catch {
        /* ignore transient errors */
      }

      // Popup was closed by user before completion → treat as cancel.
      if (popup?.closed) {
        cleanup();
        onCancel?.();
      }
    }, 2000);

    watchdogTimer = setTimeout(() => {
      if (cancelled) return;
      cleanup();
      onCancel?.();
    }, timeoutMs);
  })();

  return cleanup;
}
