import { useLocalSearchParams } from "expo-router";
import DomainDetailScreen from "@/screens/careerIntelligence/DomainDetailScreen";

export default function AdminDomainRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DomainDetailScreen domainId={String(id)} />;
}
