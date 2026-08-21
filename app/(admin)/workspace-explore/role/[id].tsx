import { useLocalSearchParams } from "expo-router";
import AdminCareerDetailScreen from "@/screens/admin/AdminCareerDetailScreen";

export default function AdminRoleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminCareerDetailScreen entity="role" id={String(id)} />;
}
