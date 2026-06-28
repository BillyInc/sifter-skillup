import { SessionModeScreen } from "../../src/screens/admin/SessionModeScreen";

// Session / provider mode for tutorial centres & JAMB cafés. The screen reads
// the educator profile and branches; no roster, no stored PII.
export default function SessionRoute() {
  return <SessionModeScreen />;
}
