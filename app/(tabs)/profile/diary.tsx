import DiaryScreen from '@/screens/DiaryScreen';
import { useLocalSearchParams } from 'expo-router';

export default function DiaryTabScreen() {
  const params = useLocalSearchParams();
  return <DiaryScreen route={{ params }} navigation={{}} />;
}