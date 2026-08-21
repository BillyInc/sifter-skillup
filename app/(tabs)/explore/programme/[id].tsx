import { useLocalSearchParams } from "expo-router";
import ProgrammeDetailRefinedScreen from "@/screens/careerIntelligence/ProgrammeDetailRefinedScreen";

export default function ProgrammeRoute() {
  const { id, school_id, user_type } = useLocalSearchParams<{ id: string; school_id?: string; user_type?: string }>();
  return <ProgrammeDetailRefinedScreen programmeId={String(id)} initialSchoolId={school_id ? String(school_id) : undefined} userType={user_type ? String(user_type) : undefined} />;
}
