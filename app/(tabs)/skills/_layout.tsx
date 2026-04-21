import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

export default function SkillsStack() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Skills" onGoHome={() => router.replace('/skills')}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
