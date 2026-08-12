import { Stack, Redirect, useLocalSearchParams, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { useAuth } from "../../src/hooks/useAuth";
import { Colors } from "../../src/theme";
import { consumePendingPostAuthRedirect } from "../../src/lib/postAuthRedirect";
import { useEffectiveAccountType, isAdminAccount } from "../../src/lib/accountType";
import { getEducatorProfile } from "../../src/lib/educatorProfile";
import { adminHomeForProfile } from "../../src/lib/adminAudience";
import { resolvePostAuthHref } from "../../src/lib/resumeNavigation";
import type { EducatorProfile } from "../../src/types/institution";
import { hasExplicitLogout } from "../../src/lib/logoutState";

export const unstable_settings = {
  initialRouteName: "sign-in",
};

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ intent?: string }>();
  const { accountType, hydrated } = useEffectiveAccountType(
    user?.account_type,
    user?.id,
  );
  const [educatorProfile, setEducatorProfile] =
    useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [explicitLogoutHydrated, setExplicitLogoutHydrated] = useState(false);
  const [explicitLogout, setExplicitLogout] = useState(false);

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (!active) return;
      setEducatorProfile(profile);
      setProfileHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    let active = true;
    hasExplicitLogout()
      .then((value) => {
        if (!active) return;
        setExplicitLogout(value);
        setExplicitLogoutHydrated(true);
      })
      .catch(() => {
        if (!active) return;
        setExplicitLogout(false);
        setExplicitLogoutHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (
    loading ||
    (!user && !explicitLogoutHydrated) ||
    (user && (!hydrated || !profileHydrated))
  ) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const isSignInRoute =
    pathname === "/sign-in" || pathname?.endsWith("/sign-in");
  const isSignupRoute = pathname === "/signup" || pathname?.endsWith("/signup");
  const isForgotRoute =
    pathname === "/forgot-password" || pathname?.endsWith("/forgot-password");
  const isOnboardingRoute =
    pathname === "/onboarding" || pathname?.endsWith("/onboarding");
  const isExplicitAuthRoute = isSignInRoute || isSignupRoute || isForgotRoute;

  if (!user && explicitLogout && !isSignInRoute && !isSignupRoute) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!user && isForgotRoute && params.intent !== "reset") {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!user && isOnboardingRoute) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (user && user.auth_provider === "guest" && !isExplicitAuthRoute) {
    return <Redirect href="/(tabs)/explore" />;
  }

  if (
    user &&
    (!user.onboarding_completed || accountType === "pending") &&
    !isOnboardingRoute
  ) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  const pendingRedirect =
    user && user.onboarding_completed
      ? consumePendingPostAuthRedirect(user.id)
      : null;

  if (
    user &&
    user.onboarding_completed &&
    accountType !== "pending" &&
    isAdminAccount(accountType)
  ) {
    return <Redirect href={adminHomeForProfile(educatorProfile) as any} />;
  }

  if (user && user.onboarding_completed && accountType !== "pending") {
    return <Redirect href={(pendingRedirect ?? resolvePostAuthHref(user)) as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="sign-in">
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
});
