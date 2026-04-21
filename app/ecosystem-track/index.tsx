import { useLocalSearchParams } from 'expo-router';
let EcosystemTrackScreen: any;
try { EcosystemTrackScreen = require('@/screens/EcosystemTrackScreen').default; } catch {}
export default function EcosystemTrackRoute() {
  const params = useLocalSearchParams();
  if (!EcosystemTrackScreen) return null;
  return <EcosystemTrackScreen route={{ params }} navigation={{}} />;
}
