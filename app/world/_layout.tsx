import WorldScreen from '@/screens/WorldScreen';
import { useLocalSearchParams } from 'expo-router';
export default function WorldRoute() {
  const params = useLocalSearchParams();
  return <WorldScreen route={{ params }} navigation={{}} />;
}
