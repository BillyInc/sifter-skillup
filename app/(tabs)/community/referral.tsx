import ReferralScreen from '@/screens/ReferralScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ReferralTabScreen() {
  const params = useLocalSearchParams();
  return <ReferralScreen route={{ params }} navigation={{}} />;
}