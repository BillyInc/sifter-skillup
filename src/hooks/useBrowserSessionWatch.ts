/**
 * Browser-only: a Back/Forward navigation can restore an authenticated React
 * tree from the bfcache after sign-out, and another tab can sign out. The
 * stored token, not the in-memory profile, is authoritative. Shared by both
 * auth providers.
 */
import { useEffect, useRef } from 'react';
import { API } from '../lib/api';
import { hasExplicitLogout, hasPreserveLocalState } from '../lib/logoutState';
import { tokenSubject } from '../lib/tokenSubject';
import { getSavedSessionProfile } from '../lib/sessionProfile';
import { completeSignOut } from '../lib/sessionLifecycle';

type WatchedUser = { id: string; auth_provider?: string | null };

/** Delay before adopting a session another tab is in the middle of creating. */
const FOREIGN_SESSION_ADOPT_MS = 1000;

export function useBrowserSessionWatch(
  user: WatchedUser | null,
  handlers: {
    /** Clear React state: this tab's user is gone. */
    onSignedOut: () => void;
    /** Another account is signing in from another tab; re-read the session. */
    onForeignSession: () => void;
  },
) {
  // Read through a ref so the listeners are not re-registered on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    // Feature-detect, don't infer from `typeof window`. React Native defines a
    // `window` global WITHOUT addEventListener, so a bare existence check
    // passes on native and then throws
    // "window.addEventListener is not a function" for every signed-in user.
    // The same is true under the jest react-native environment.
    if (
      !user ||
      typeof window === 'undefined' ||
      typeof window.addEventListener !== 'function' ||
      typeof document === 'undefined' ||
      typeof document.addEventListener !== 'function'
    ) {
      return;
    }

    let active = true;
    let reconciling = false;
    let adoptTimer: ReturnType<typeof setTimeout> | null = null;

    /** React state is stale: clear it, then re-read whatever session is stored. */
    const adoptStoredSession = () => {
      handlersRef.current.onSignedOut();
      if (!adoptTimer) {
        adoptTimer = setTimeout(() => {
          adoptTimer = null;
          handlersRef.current.onForeignSession();
        }, FOREIGN_SESSION_ADOPT_MS);
      }
    };

    const reconcileBrowserRestore = async () => {
      if (!active || reconciling) return;
      const stored = API.hasStoredToken();
      const token = stored === false ? null : await API.getToken();
      if (!active) return;
      if (token) {
        // A token is present, but is it this tab's user's? A tab that missed
        // the removal event (frozen, bfcache) while another account signed in
        // would otherwise keep showing account A's UI over B's token. Only the
        // React state is replaced; B's stored data is B's to keep.
        const subject = tokenSubject(token);
        if (subject && subject !== String(user.id)) adoptStoredSession();
        return;
      }

      // Offline guest mode intentionally has no token. It is only invalidated
      // here when the user explicitly signed out; real guest sessions have a
      // token and therefore still pass the authoritative check above.
      if (user.auth_provider === 'guest' && !(await hasExplicitLogout())) return;

      reconciling = true;
      const userId = user.id;
      try {
        // The token is gone, but another tab may be partway through signing a
        // DIFFERENT account in (it saves that account's profile and owner
        // before its token). Clearing now would wipe the queue, drafts and
        // owner key it just wrote. Re-check that the token is still gone and
        // that the saved session is still this user's (or absent).
        const again = await API.getToken();
        const saved = await getSavedSessionProfile<{ id?: string | number }>();
        const otherAccount = saved?.id != null && String(saved.id) !== String(userId);
        if (!active) return;
        if (again || otherAccount) {
          adoptStoredSession();
          return;
        }
        // Clear React state before awaiting storage cleanup so a restored
        // screen cannot remain visible during the browser-history transition.
        handlersRef.current.onSignedOut();
        // A "continue later" sign-out in another tab (or before a bfcache
        // restore) left the preserve marker: the queue, drafts and device
        // owner are the learner's unsent work and are not this tab's to wipe.
        // That tab already cleared the profile and recorded the sign-out.
        // Without the marker the token vanished for another reason (expiry,
        // another device, deletion) and everything is cleared as before.
        if (await hasPreserveLocalState()) return;
        await completeSignOut({ userId });
      } finally {
        reconciling = false;
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'sifter_auth_token_v2') void reconcileBrowserRestore();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reconcileBrowserRestore();
    };

    window.addEventListener('pageshow', reconcileBrowserRestore);
    window.addEventListener('popstate', reconcileBrowserRestore);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      active = false;
      if (adoptTimer) clearTimeout(adoptTimer);
      window.removeEventListener('pageshow', reconcileBrowserRestore);
      window.removeEventListener('popstate', reconcileBrowserRestore);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user]);
}
