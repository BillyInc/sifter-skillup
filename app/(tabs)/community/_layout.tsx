import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

export default function CommunityStack() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Community" onGoHome={() => router.replace('/community')}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
