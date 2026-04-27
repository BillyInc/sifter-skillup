import { useRouter } from 'expo-router';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { API } from '../../src/lib/api';
import { useAuth } from '../../src/hooks/useAuth';
import { consumePendingPostAuthRedirect } from '../../src/lib/postAuthRedirect';
import { buildTrackResumeHref } from '../../src/lib/resumeNavigation';

function getOnboardingNextHref(trackId: string) {
  if (trackId === 'island-map') {
    return '/(tabs)/map/island';
  }

  return buildTrackResumeHref(trackId) ?? '/(tabs)/home';
}

export default function OnboardingPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();

  return (
    <OnboardingScreen
      onComplete={async (trackId) => {
        await API.completeOnboarding({ active_track: trackId });
        await refreshUser();
        router.replace((consumePendingPostAuthRedirect() ?? getOnboardingNextHref(trackId)) as any);
      }}
      onBrowse={async () => {
        await API.completeOnboarding({});
        await refreshUser();
        consumePendingPostAuthRedirect();
        router.replace('/(tabs)/fields');
      }}
    />
  );
}
