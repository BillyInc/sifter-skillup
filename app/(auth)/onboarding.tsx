import { useRouter } from 'expo-router';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { API } from '../../src/lib/api';
import { useAuth } from '../../src/hooks/useAuth';

export default function OnboardingPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();

  return (
    <OnboardingScreen
      onComplete={async (trackId) => {
        await API.completeOnboarding({ active_track: trackId });
        await refreshUser();
        router.replace('/(tabs)/home');
      }}
      onBrowse={async () => {
        await API.completeOnboarding({});
        await refreshUser();
        router.replace('/(tabs)/fields');
      }}
    />
  );
}
