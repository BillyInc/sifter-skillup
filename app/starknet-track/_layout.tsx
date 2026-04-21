import { useLocalSearchParams } from 'expo-router';
let StarknetTrackScreen: any;
try { StarknetTrackScreen = require('@/screens/StarknetTrackScreen').default; } catch {}
export default function StarknetTrackRoute() {
  const params = useLocalSearchParams();
  if (!StarknetTrackScreen) return null;
  return <StarknetTrackScreen route={{ params }} navigation={{}} />;
}
