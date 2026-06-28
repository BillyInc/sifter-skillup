import { Stack } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';
import { Redirect } from 'expo-router';
import { consumePendingPostAuthRedirect } from '../../src/lib/postAuthRedirect';
import { useEffectiveAccountType, isAdminAccount } from '../../src/lib/accountType';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type);
  const pendingRedirect = user?.onboarding_completed ? consumePendingPostAuthRedirect() : null;

  if (loading || (user && !hydrated)) {
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

  if (user && pendingRedirect) {
    return <Redirect href={pendingRedirect as any} />;
  }

  // Educators / institution admins land on the administrator side; students
  // land on the learning app. account_type is resolved from the backend value
  // when present, else the local override set during educator onboarding.
  if (user && user.onboarding_completed && isAdminAccount(accountType)) {
    return <Redirect href={"/(admin)" as any} />;
  }

  if (user && user.onboarding_completed) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingEmoji: { fontSize: 64 },
});
