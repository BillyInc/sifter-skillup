import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import { adminHomeForProfile } from "@/lib/adminAudience";
import { isAdminAccount, useEffectiveAccountType } from "@/lib/accountType";
import { getEducatorProfile } from "@/lib/educatorProfile";
import type { EducatorProfile } from "@/types/institution";

export function LegacyRouteRedirect() {
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(
    user?.account_type,
    user?.id,
  );
  const [profile, setProfile] = React.useState<EducatorProfile | null>(null);
  const [profileReady, setProfileReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((next) => {
      if (!active) return;
      setProfile(next);
      setProfileReady(true);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  if (loading || (user && (!hydrated || !profileReady))) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (user.auth_provider === "guest") {
    return <Redirect href="/(tabs)/explore" />;
  }

  if (!user.onboarding_completed || accountType === "pending") {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (isAdminAccount(accountType)) {
    return <Redirect href={adminHomeForProfile(profile) as any} />;
  }

  return <Redirect href="/(tabs)/home" />;
}

export default LegacyRouteRedirect;
