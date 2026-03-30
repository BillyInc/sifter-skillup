import PortfolioHubScreen from '@/screens/PortfolioHubScreen';
import { useLocalSearchParams } from 'expo-router';

export default function PortfolioHubTabScreen() {
  const params = useLocalSearchParams();
  return <PortfolioHubScreen route={{ params }} navigation={{}} />;
}