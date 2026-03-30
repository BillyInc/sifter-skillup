import QuantMapScreen from '@/screens/QuantMapScreen';
import { useLocalSearchParams } from 'expo-router';

export default function QuantMapTabScreen() {
  const params = useLocalSearchParams();
  return <QuantMapScreen route={{ params }} navigation={{}} />;
}