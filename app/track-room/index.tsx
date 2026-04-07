import TrackRoomScreen from '@/screens/TrackRoomScreen';
import { useLocalSearchParams } from 'expo-router';
export default function TrackRoomRoute() {
  const params = useLocalSearchParams();
  return <TrackRoomScreen route={{ params }} navigation={{}} />;
}
