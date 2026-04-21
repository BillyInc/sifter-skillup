import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
export default function LessonRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const levelId = Number(params.levelId) || 1;

  // On lesson/boss completion, navigate back to the island map.
  // IslandMapScreen will then show the 3-track banner if boss 310 is done,
  // or the next island in sequence for any other completion.
  const handleDone = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/map' as any);
    }
  };

  return (
    <LessonScreen
      levelId={levelId}
      onExit={handleDone}
      onComplete={handleDone}
    />
  );
}
