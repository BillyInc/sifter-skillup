import FieldsScreen from '@/screens/FieldsScreen';
import { useLocalSearchParams } from 'expo-router';
export default function FieldsTab() {
  const params = useLocalSearchParams();
  return <FieldsScreen route={{ params }} navigation={{}} />;
}
