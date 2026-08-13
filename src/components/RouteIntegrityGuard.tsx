import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import {
  useEffectiveAccountType,
  isAdminAccount,
  needsLegacyTypeSelection,
} from "../lib/accountType";
import { adminHomeForProfile } from "../lib/adminAudience";
import { getEducatorProfile } from "../lib/educatorProfile";
import { resolvePostAuthHref } from "../lib/resumeNavigation";
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
  const router = useRouter();
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);
  const [profile, setProfile] = useState<EducatorProfile | null>(null);

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
    }
  }, [accountType, hydrated, loading, pathname, profile, router, user]);

  return null;
}
