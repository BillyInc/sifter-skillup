import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import { adminHomeForProfile } from "@/lib/adminAudience";
import { isAdminAccount, useEffectiveAccountType } from "@/lib/accountType";
import { getEducatorProfile } from "@/lib/educatorProfile";
import type { EducatorProfile } from "@/types/institution";

export function LegacyRouteRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(
    user?.account_type,
    user?.id,
  );
  const [profile, setProfile] = React.useState<EducatorProfile | null>(null);
  const [profileReady, setProfileReady] = React.useState(false);

  React.useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setProfileReady(true);
      return;
    }

    let active = true;
    setProfileReady(false);
    getEducatorProfile(user.id).then((next) => {
      if (!active) return;
      setProfile(next);
      setProfileReady(true);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const targetHref = React.useMemo(() => {
    if (loading || (user && (!hydrated || !profileReady))) return null;
    if (!user) return "/(auth)/sign-in";
    if (user.auth_provider === "guest") return "/(tabs)/explore";
    if (!user.onboarding_completed || accountType === "pending") {
      return "/(auth)/onboarding";
    }
    return isAdminAccount(accountType)
      ? adminHomeForProfile(profile)
      : "/(tabs)/home";
  }, [accountType, hydrated, loading, profile, profileReady, user]);

  React.useEffect(() => {
    if (!targetHref) return;
    router.replace(targetHref as any);
  }, [router, targetHref]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

export default LegacyRouteRedirect;
