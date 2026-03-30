import LessonScreen from '@/screens/LessonScreen';
import { useLocalSearchParams } from 'expo-router';

export default function SkillsLessonScreen() {
  const params = useLocalSearchParams();
  return <LessonScreen route={{ params }} navigation={{}} />;
}