import { useLocalSearchParams } from "expo-router";
import ProgrammeOverviewScreen from "@/screens/careerIntelligence/ProgrammeOverviewScreen";

export default function AdminProgrammeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProgrammeOverviewScreen programmeId={String(id)} />;
}
