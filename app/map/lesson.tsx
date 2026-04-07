import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams } from 'expo-router';
export default function LessonRoute() {
  const params = useLocalSearchParams();
  return <LessonScreen levelId={Number(params.levelId) || 1} onExit={() => {}} onComplete={() => {}} />;
}
