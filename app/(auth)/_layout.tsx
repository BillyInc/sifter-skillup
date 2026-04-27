import { Stack } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../src/theme';
import { Redirect } from 'expo-router';
import { consumePendingPostAuthRedirect } from '../../src/lib/postAuthRedirect';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const pendingRedirect = user?.onboarding_completed ? consumePendingPostAuthRedirect() : null;

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (user && !user.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (user && pendingRedirect) {
    return <Redirect href={pendingRedirect as any} />;
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
