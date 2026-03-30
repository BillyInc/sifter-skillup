import ProfileScreen from '@/screens/ProfileScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ProfileTabScreen() {
  const params = useLocalSearchParams();
  return <ProfileScreen route={{ params }} navigation={{}} />;
}