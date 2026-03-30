import IslandMapScreen from '@/screens/IslandMapScreen';
import { useLocalSearchParams } from 'expo-router';

export default function MapScreen() {
  const params = useLocalSearchParams();
  return <IslandMapScreen route={{ params }} navigation={{}} />;
}