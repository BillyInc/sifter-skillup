import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
export default function LessonRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const levelId = Number(params.levelId) || 1;

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
