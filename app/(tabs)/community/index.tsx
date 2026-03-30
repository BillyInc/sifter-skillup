import CommunityScreen from '@/screens/CommunityScreen';
import { useLocalSearchParams } from 'expo-router';

export default function CommunityTabScreen() {
  const params = useLocalSearchParams();
  return <CommunityScreen route={{ params }} navigation={{}} />;
}