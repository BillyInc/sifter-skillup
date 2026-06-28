import { useLocalSearchParams } from "expo-router";
import OrganisationProfileScreen from "@/screens/careerIntelligence/OrganisationProfileScreen";

export default function OrganisationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrganisationProfileScreen organisationId={String(id)} />;
}
