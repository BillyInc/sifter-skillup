import { useLocalSearchParams } from "expo-router";
import PathwaysHubScreen from "@/screens/careerIntelligence/PathwaysHubScreen";

export default function ElitePathwayRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PathwaysHubScreen initialSection="target" requirementFocus="elite" pathwayId={String(id)} />;
}
