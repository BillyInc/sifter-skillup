import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SkillsLessonScreen() {
  const params = useLocalSearchParams<{ levelId: string }>();
  const router = useRouter();

  return (
    <LessonScreen
      levelId={Number(params.levelId) || 1}
      onExit={() => router.back()}
      onComplete={() => router.back()}
    />
  );
}
