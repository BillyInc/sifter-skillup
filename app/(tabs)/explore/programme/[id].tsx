import { useLocalSearchParams } from "expo-router";
import ProgrammeDetailRefinedScreen from "@/screens/careerIntelligence/ProgrammeDetailRefinedScreen";

export default function ProgrammeRoute() {
  const { id, jamb_programme_id, school_id, user_type, guidance_student_id, view_only, journey_mode } = useLocalSearchParams<{ id: string; jamb_programme_id?: string; school_id?: string; user_type?: string; guidance_student_id?: string; view_only?: string; journey_mode?: string }>();
  return <ProgrammeDetailRefinedScreen programmeId={String(id)} jambProgrammeId={jamb_programme_id ? String(jamb_programme_id) : undefined} initialSchoolId={school_id ? String(school_id) : undefined} userType={user_type ? String(user_type) : undefined} guidanceStudentId={guidance_student_id ? String(guidance_student_id) : undefined} viewOnly={view_only === "1"} journeyMode={journey_mode ? String(journey_mode) : undefined} />;
}
