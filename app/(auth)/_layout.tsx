import { Stack } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';
import { Redirect } from 'expo-router';
import { consumePendingPostAuthRedirect } from '../../src/lib/postAuthRedirect';
import { useEffectiveAccountType, isAdminAccount } from '../../src/lib/accountType';
import { useEffect, useState } from 'react';
import { getEducatorProfile } from '../../src/lib/educatorProfile';
import { adminHomeForProfile } from '../../src/lib/adminAudience';
import { resolvePostAuthHref } from '../../src/lib/resumeNavigation';
import type { EducatorProfile } from '../../src/types/institution';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type);
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((profile) => {
      if (!active) return;
      setEducatorProfile(profile);
      setProfileHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading || (user && (!hydrated || !profileHydrated))) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  // Guests skip onboarding entirely and land in Explore "browse everything" mode.
  if (user && user.auth_provider === 'guest') {
    return <Redirect href="/(tabs)/explore" />;
  }

  if (user && !user.onboarding_completed) {
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

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingEmoji: { fontSize: 64 },
});
