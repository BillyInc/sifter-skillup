import { useLocalSearchParams } from "expo-router";
import OpportunityDetailScreen from "@/screens/careerIntelligence/OpportunityDetailScreen";

export default function OpportunityRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OpportunityDetailScreen opportunityId={String(id)} />;
}
