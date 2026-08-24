import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { API } from "../lib/api";
import {
  useEffectiveAccountType,
  isAdminAccount,
  needsLegacyTypeSelection,
} from "../lib/accountType";
import { adminHomeForProfile } from "../lib/adminAudience";
import { getEducatorProfile } from "../lib/educatorProfile";
import { resolvePostAuthHref } from "../lib/resumeNavigation";
import { isLegacyLearningPath, MY_WORLD_LEARNING_SOURCE } from "../lib/learningGate";
import type { EducatorProfile } from "../types/institution";

const LEGACY_COMMUNITY_PREFIX = "/community";
const PASSWORD_RESET_PREFIX = "/forgot-password";
function isPath(prefix: string, pathname: string | null) {
  return pathname === prefix || Boolean(pathname?.startsWith(`${prefix}/`));
}

/**
 * Repairs browser history entries created by the old learning stack.
 *
 * Expo Router group names do not appear in the browser URL, so an old
 * community entry can sit beside an admin entry and browser Back/Forward can
 * re-enter it after the admin shell has unmounted. The route is still valid
 * for the learning surface; only authenticated admin users are redirected.
 */
export function RouteIntegrityGuard() {
  const pathname = usePathname();
  // The guard is mounted above nested route groups. Global params ensure a
  // restored/deep-linked compatibility route cannot bypass the redirect just
  // because its query string belongs to a child stack.
  const params = useGlobalSearchParams<{ from?: string | string[] }>();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const reconcilingRef = useRef(false);
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let active = true;
    const reconcileRestoredSession = async () => {
      // Chrome can restore a previous authenticated React tree from bfcache
      // after Back/Forward. The in-memory `user` can therefore outlive the
      // token that sign-out removed. Treat the stored token as authoritative
      // for every non-guest account type.
      if (!active || loading || !user || user.auth_provider === "guest" || reconcilingRef.current) {
        return;
      }
      const token = await API.getToken();
      if (token || !active) return;

      reconcilingRef.current = true;
      try {
        await signOut();
        if (active) router.replace("/(auth)/sign-in" as never);
      } finally {
        reconcilingRef.current = false;
      }
    };

    window.addEventListener("pageshow", reconcileRestoredSession);
    window.addEventListener("popstate", reconcileRestoredSession);
    return () => {
      active = false;
      window.removeEventListener("pageshow", reconcileRestoredSession);
      window.removeEventListener("popstate", reconcileRestoredSession);
    };
  }, [loading, router, signOut, user]);

  useEffect(() => {
    let active = true;
    if (!user?.id || !isAdminAccount(accountType)) {
      setProfile(null);
      return () => {
        active = false;
      };
    }
    getEducatorProfile(user.id).then(
      (next) => {
        if (active) setProfile(next);
      },
      () => {
        // Routing must not wait indefinitely for optional profile metadata.
        if (active) setProfile(null);
      },
    );
    return () => {
      active = false;
    };
  }, [accountType, user?.id]);

  useEffect(() => {
    if (loading || (user && !hydrated)) return;

    // Password reset is public only before authentication. A stale browser
    // entry must not show a loading reset screen to an already signed-in user.
    if (user && isPath(PASSWORD_RESET_PREFIX, pathname)) {
      const target = needsLegacyTypeSelection(user)
        ? "/(auth)/onboarding?restart=1"
        : !user.onboarding_completed
          ? "/(auth)/onboarding"
        : isAdminAccount(accountType)
          ? adminHomeForProfile(profile)
          : resolvePostAuthHref(user);
      router.replace(target as never);
      return;
    }

    if (
      user &&
      isAdminAccount(accountType) &&
      isPath(LEGACY_COMMUNITY_PREFIX, pathname)
    ) {
      router.replace(adminHomeForProfile(profile) as never);
      previousPathRef.current = pathname;
      return;
    }

    // SkillUp learning and its adjacent legacy community surfaces are gated
    // behind My World. This also repairs stale browser entries and old deep
    // links instead of reopening them from another product surface.
    const fromMyWorld = Array.isArray(params.from)
      ? params.from.includes(MY_WORLD_LEARNING_SOURCE)
      : params.from === MY_WORLD_LEARNING_SOURCE;
    const previousWasLearning = isLegacyLearningPath(previousPathRef.current);
    if (isLegacyLearningPath(pathname) && !fromMyWorld && !previousWasLearning) {
      router.replace((user ? "/(tabs)/myworld" : "/(auth)/sign-in") as never);
      previousPathRef.current = pathname;
      return;
    }

    previousPathRef.current = pathname;

  }, [accountType, hydrated, loading, params.from, pathname, profile, router, user]);

  return null;
}
