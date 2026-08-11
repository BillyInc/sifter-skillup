import { Stack, Redirect, usePathname } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';
import { consumePendingPostAuthRedirect } from '../../src/lib/postAuthRedirect';
import { useEffectiveAccountType, isAdminAccount } from '../../src/lib/accountType';
import { useEffect, useState } from 'react';
import { getEducatorProfile } from '../../src/lib/educatorProfile';
import { adminHomeForProfile } from '../../src/lib/adminAudience';
import { resolvePostAuthHref } from '../../src/lib/resumeNavigation';
import type { EducatorProfile } from '../../src/types/institution';
import { LevelUpLogo } from '../../src/components/brand/LevelUpLogo';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);

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

  if (loading || (user && (!hydrated || !profileHydrated))) {
    return (
      <View style={styles.loading}>
        <LevelUpLogo size={88} animated />
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  // Guests skip onboarding entirely and land in Explore "browse everything" mode.
  // Redirect replaces the entire auth stack, so there is no back-button return to auth.
  if (user && user.auth_provider === 'guest') {
    return <Redirect href="/(tabs)/explore" />;
  }

  // Signed-up users who haven't finished onboarding go to onboarding.
  // The Redirect component replaces the Stack, so there is nothing to go
  // back to, preventing the broken back-to-signup loop.
  const isOnboardingRoute = pathname === '/onboarding' || pathname?.endsWith('/onboarding');
  if (user && !user.onboarding_completed && !isOnboardingRoute) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  const pendingRedirect =
    user && user.onboarding_completed
      ? consumePendingPostAuthRedirect()
      : null;

  // Educators / institution admins land on the administrator side; students
  // land on the learning app. account_type is resolved from the backend value
  // when present, else the local override set during educator onboarding.
  if (user && user.onboarding_completed && isAdminAccount(accountType)) {
    return <Redirect href={adminHomeForProfile(educatorProfile) as any} />;
  }

  if (user && user.onboarding_completed) {
    return <Redirect href={(pendingRedirect ?? resolvePostAuthHref(user)) as any} />;
  }

  // No user: show the auth stack (welcome / login / signup / forgot).
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 20 },
});

