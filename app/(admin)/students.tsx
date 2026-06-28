import { StudentManagementScreen } from "../../src/screens/admin/StudentManagementScreen";

// The consent gate. getStudentRoster() returns `locked` by design — the screen
// renders a deliberate privacy state, never a roster.
export default function StudentsRoute() {
  return <StudentManagementScreen />;
}
