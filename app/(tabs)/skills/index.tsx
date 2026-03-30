import SkillsScreen from '@/screens/SkillsScreen';
import { useLocalSearchParams } from 'expo-router';

export default function SkillsTabScreen() {
  const params = useLocalSearchParams();
  return <SkillsScreen route={{ params }} navigation={{}} />;
}