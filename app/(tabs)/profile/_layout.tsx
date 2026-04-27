import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

export default function ProfileStack() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Profile" onGoHome={() => router.replace('/(tabs)/profile')}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
