import InterviewModeScreen from '@/screens/InterviewModeScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function InterviewTabScreen() {
  const params = useLocalSearchParams<{ trackId: string; trackName: string }>();
  const router = useRouter();

  // InterviewModeScreen requires specific props; provide defaults for route usage
  return (
    <InterviewModeScreen
      trackId={params.trackId ?? ''}
      trackName={params.trackName ?? ''}
      level={{ id: '', title: '', questions: [] } as any}
      onBack={() => router.back()}
    />
  );
}
