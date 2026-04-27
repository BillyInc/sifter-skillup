import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SkillsLessonScreen() {
  const params = useLocalSearchParams<{ levelId: string }>();
  const router = useRouter();
  const handleDone = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/skills' as any);
  };

  return (
    <LessonScreen
      levelId={Number(params.levelId) || 1}
      onExit={handleDone}
      onComplete={handleDone}
    />
  );
}
