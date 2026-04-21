import LeaderboardScreen from '@/screens/LeaderboardScreen';
import { useLocalSearchParams } from 'expo-router';

export default function LeaderboardTabScreen() {
  const params = useLocalSearchParams();
  return <LeaderboardScreen route={{ params }} navigation={{}} />;
}