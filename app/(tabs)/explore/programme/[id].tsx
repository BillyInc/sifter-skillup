import { useLocalSearchParams } from "expo-router";
import ProgrammeDetailRefinedScreen from "@/screens/careerIntelligence/ProgrammeDetailRefinedScreen";

export default function ProgrammeRoute() {
  const { id, jamb_programme_id, school_id, user_type, guidance_student_id } = useLocalSearchParams<{ id: string; jamb_programme_id?: string; school_id?: string; user_type?: string; guidance_student_id?: string }>();
  return <ProgrammeDetailRefinedScreen programmeId={String(id)} jambProgrammeId={jamb_programme_id ? String(jamb_programme_id) : undefined} initialSchoolId={school_id ? String(school_id) : undefined} userType={user_type ? String(user_type) : undefined} guidanceStudentId={guidance_student_id ? String(guidance_student_id) : undefined} />;
}
