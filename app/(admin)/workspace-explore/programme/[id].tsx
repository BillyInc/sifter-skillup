import { useLocalSearchParams } from "expo-router";
import AdminCareerDetailScreen from "@/screens/admin/AdminCareerDetailScreen";

export default function AdminProgrammeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminCareerDetailScreen entity="programme" id={String(id)} />;
}
