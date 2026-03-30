import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import { API } from '../../src/lib/api';
import { useAuth } from '../../src/hooks/useAuth';

export default function OnboardingPage() {
  const { refreshUser } = useAuth();

  // Web platform skips onboarding — handled same as current app
  if (Platform.OS === 'web') {
    // Auto-complete and redirect
    API.completeOnboarding({}).then(() => refreshUser()).catch(() => refreshUser());
    return <Redirect href="/(tabs)" />;
  }

  return (
    <OnboardingScreen
      onComplete={async (trackId) => {
        await API.completeOnboarding({ active_track: trackId });
        refreshUser();
      }}
      onBrowse={() => {
        API.completeOnboarding({}).then(() => refreshUser());
      }}
    />
  );
}
