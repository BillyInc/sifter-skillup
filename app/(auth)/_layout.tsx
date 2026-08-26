import { Stack, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { useAuth } from "../../src/hooks/useAuth";
import { Colors } from "../../src/theme";
import { consumePendingPostAuthRedirect } from "../../src/lib/postAuthRedirect";
import { useEffectiveAccountType, isAdminAccount, needsLegacyTypeSelection } from "../../src/lib/accountType";
import { getEducatorProfile } from "../../src/lib/educatorProfile";
import { adminHomeForProfile } from "../../src/lib/adminAudience";
import { getAdminResume } from "../../src/lib/adminResume";
import { resolvePostAuthHref } from "../../src/lib/resumeNavigation";
import type { EducatorProfile } from "../../src/types/institution";
import { hasExplicitLogout } from "../../src/lib/logoutState";

export const unstable_settings = {
  initialRouteName: "sign-in",
};

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ intent?: string }>();
  const { accountType, hydrated } = useEffectiveAccountType(
    user?.account_type,
    user?.id,
  );
  const [educatorProfile, setEducatorProfile] =
    useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [adminResumeHref, setAdminResumeHref] = useState<string | null>(null);
  const [adminResumeHydrated, setAdminResumeHydrated] = useState(false);
  const [explicitLogoutHydrated, setExplicitLogoutHydrated] = useState(false);
  const [explicitLogout, setExplicitLogout] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setEducatorProfile(null);
      setProfileHydrated(true);
      setAdminResumeHref(null);
      setAdminResumeHydrated(true);
      return;
    }

    let active = true;
    setProfileHydrated(false);
    getEducatorProfile(user.id).then(
      (profile) => {
        if (!active) return;
        setEducatorProfile(profile);
        setProfileHydrated(true);
      },
      () => {
        if (!active) return;
        setEducatorProfile(null);
        setProfileHydrated(true);
      },
    );
    setAdminResumeHydrated(false);
    getAdminResume(user.id).then((resume) => {
      if (active) {
        setAdminResumeHref(resume?.href ?? null);
        setAdminResumeHydrated(true);
      }
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

  const authReady = !(
    loading ||
    (!user && !explicitLogoutHydrated) ||
    (user && (!hydrated || !profileHydrated || !adminResumeHydrated))
  );

  const isSignInRoute =
    pathname === "/sign-in" || pathname?.endsWith("/sign-in");
  const isSignupRoute = pathname === "/signup" || pathname?.endsWith("/signup");
  const isForgotRoute =
    pathname === "/forgot-password" || pathname?.endsWith("/forgot-password");
  const isOnboardingRoute =
    pathname === "/onboarding" || pathname?.endsWith("/onboarding");
  const isExplicitAuthRoute = isSignInRoute || isSignupRoute || isForgotRoute;

  // Public auth screens must not wait for the saved-session/profile lookup.
  // A stale backend connection used to leave forgot-password spinning forever,
  // even though password reset does not need an existing app session.
  const publicAuthRouteReady = !user && isExplicitAuthRoute;

  const pendingRedirect =
    authReady && user && user.onboarding_completed
      ? consumePendingPostAuthRedirect(user.id)
      : null;

  let redirectHref: string | null = null;
  if (
    authReady &&
    !user &&
    explicitLogout &&
    !isSignInRoute &&
    !isSignupRoute &&
    !isForgotRoute
  ) {
    redirectHref = "/(auth)/sign-in";
  } else if (authReady && !user && isOnboardingRoute) {
    redirectHref = "/(auth)/sign-in";
  } else if (authReady && user && user.auth_provider === "guest" && !isExplicitAuthRoute) {
    redirectHref = "/(tabs)/explore";
  } else if (authReady && user && needsLegacyTypeSelection(user) && !isOnboardingRoute) {
    redirectHref = "/(auth)/onboarding?restart=1";
  } else if (
    authReady &&
    user &&
    (!user.onboarding_completed || accountType === "pending") &&
    !isOnboardingRoute
  ) {
    redirectHref = "/(auth)/onboarding";
  } else if (
    authReady &&
    user &&
    user.onboarding_completed &&
    accountType !== "pending" &&
    !isOnboardingRoute &&
    isAdminAccount(accountType)
  ) {
    redirectHref = adminResumeHref ?? adminHomeForProfile(educatorProfile);
  } else if (authReady && user && user.onboarding_completed && accountType !== "pending" && !isOnboardingRoute) {
    redirectHref = pendingRedirect ?? resolvePostAuthHref(user);
  }

  useEffect(() => {
    if (redirectHref) router.replace(redirectHref as never);
  }, [redirectHref, router]);

  if ((!authReady && !publicAuthRouteReady) || redirectHref) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
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
