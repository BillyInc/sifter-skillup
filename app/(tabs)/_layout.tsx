import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { ScreenErrorBoundary } from "../../src/components/ScreenErrorBoundary";
import { ReferenceShell } from "../../src/components/shell/ReferenceShell";
import { useAuth } from "../../src/hooks/useAuth";
import { useEffectiveAccountType, needsLegacyTypeSelection } from "../../src/lib/accountType";

export const unstable_settings = {
  initialRouteName: "explore",
};

// Navigation chrome (web sidebar + mobile bottom bar) is owned by ReferenceShell,
// so the expo-router Tabs bar is hidden on every platform and every screen is
// registered with `href: null`. The five LevelUp destinations (home, explore,
// opportunities, myworld, profile) plus all preserved legacy learning routes
// live behind the shell.
export default function TabsLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);
  const redirectHref = loading || (user && !hydrated)
    ? null
      : !user
      ? "/(auth)/sign-in"
      : needsLegacyTypeSelection(user)
        ? "/(auth)/onboarding?restart=1"
      : user.auth_provider !== "guest" && (!user.onboarding_completed || accountType === "pending")
        ? "/(auth)/onboarding"
        : null;

  useEffect(() => {
    if (!redirectHref) return;
    router.replace(redirectHref as never);
  }, [redirectHref, router]);

  if (loading || (user && !hydrated) || redirectHref) {
    return null;
  }

  return (
    <ScreenErrorBoundary
      screenName="Tabs"
      onGoHome={() => router.replace("/(tabs)/home")}
    >
      <ReferenceShell>
        <Tabs
          initialRouteName="explore"
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          {/* LevelUp 5-tab IA */}
          <Tabs.Screen name="home" options={{ href: null }} />
          <Tabs.Screen name="explore" options={{ href: null }} />
          <Tabs.Screen name="opportunities" options={{ href: null }} />
          <Tabs.Screen name="myworld" options={{ href: null }} />
          <Tabs.Screen name="profile" options={{ href: null }} />

          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      </ReferenceShell>
    </ScreenErrorBoundary>
  );
}
