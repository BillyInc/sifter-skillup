import { useLocalSearchParams } from "expo-router";
import AdminCareerDetailScreen from "@/screens/admin/AdminCareerDetailScreen";

export default function AdminDomainRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminCareerDetailScreen entity="domain" id={String(id)} />;
}
