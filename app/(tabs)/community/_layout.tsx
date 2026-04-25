import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

export default function CommunityStack() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Guilds" onGoHome={() => router.replace('/(tabs)/guild')}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
