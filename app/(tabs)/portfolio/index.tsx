import PortfolioScreen from '@/screens/PortfolioScreen';
import { useLocalSearchParams } from 'expo-router';

export default function PortfolioTabScreen() {
  const params = useLocalSearchParams();
  return <PortfolioScreen route={{ params }} navigation={{}} />;
}