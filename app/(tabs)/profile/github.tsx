import GitHubScreen from '@/screens/GitHubScreen';
import { useLocalSearchParams } from 'expo-router';

export default function GitHubTabScreen() {
  const params = useLocalSearchParams();
  return <GitHubScreen route={{ params }} navigation={{}} />;
}