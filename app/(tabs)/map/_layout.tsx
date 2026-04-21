import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

export default function MapStack() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Map" onGoHome={() => router.replace('/map')}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
