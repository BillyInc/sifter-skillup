import { useLocalSearchParams } from "expo-router";
import RoleDetailScreen from "@/screens/careerIntelligence/RoleDetailScreen";

export default function AdminRoleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RoleDetailScreen roleId={String(id)} />;
}
