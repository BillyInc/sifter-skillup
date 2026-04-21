import CairoBuilderTrackScreen from '@/screens/CairoBuilderTrackScreen';
import { useLocalSearchParams } from 'expo-router';
export default function CairoBuilderTrackRoute() {
  const params = useLocalSearchParams();
  return <CairoBuilderTrackScreen />;
}
