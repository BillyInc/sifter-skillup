import { useLocalSearchParams } from "expo-router";
import PathwaysHubScreen from "@/screens/careerIntelligence/PathwaysHubScreen";

export default function EntrepreneurshipPathwayRoute() {
  const { programme_name, domain_id } = useLocalSearchParams<{ programme_name?: string; domain_id?: string }>();
  return <PathwaysHubScreen initialSection="build" entrepreneurshipContext={{ programmeName: Array.isArray(programme_name) ? programme_name[0] : programme_name, domainId: Array.isArray(domain_id) ? domain_id[0] : domain_id }} />;
}
