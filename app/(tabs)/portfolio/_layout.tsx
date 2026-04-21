import { Stack } from 'expo-router';
import { ScreenErrorBoundary } from '../../../src/components/ScreenErrorBoundary';
import { useRouter } from 'expo-router';

export default function PortfolioStack() {
  const router = useRouter();

  return (
    <ScreenErrorBoundary screenName="Portfolio" onGoHome={() => router.replace('/portfolio')}>
      <Stack screenOptions={{ headerShown: false }} />
    </ScreenErrorBoundary>
  );
}
