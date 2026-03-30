import InterviewModeScreen from '@/screens/InterviewModeScreen';
import { useLocalSearchParams } from 'expo-router';

export default function InterviewTabScreen() {
  const params = useLocalSearchParams();
  return <InterviewModeScreen route={{ params }} navigation={{}} />;
}