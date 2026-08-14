import { useLocalSearchParams } from "expo-router";
import PathwaysHubScreen from "@/screens/careerIntelligence/PathwaysHubScreen";

export default function AdminElitePathwayRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PathwaysHubScreen initialSection="elite" pathwayId={String(id)} />;
}
