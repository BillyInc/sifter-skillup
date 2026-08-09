import { useLocalSearchParams } from "expo-router";
import ElitePathwayDetailScreen from "@/screens/careerIntelligence/ElitePathwayDetailScreen";

export default function AdminElitePathwayRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ElitePathwayDetailScreen pathwayId={String(id)} />;
}
