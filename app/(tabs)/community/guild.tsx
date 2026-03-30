import GuildScreen from '@/screens/GuildScreen';
import { useLocalSearchParams } from 'expo-router';

export default function GuildTabScreen() {
  const params = useLocalSearchParams();
  return <GuildScreen route={{ params }} navigation={{}} />;
}