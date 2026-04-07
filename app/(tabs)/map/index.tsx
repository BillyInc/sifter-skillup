import HomeScreen from '@/screens/HomeScreen';
import { useLocalSearchParams } from 'expo-router';
export default function MapScreen() {
  const params = useLocalSearchParams();
  return <HomeScreen />;
}
