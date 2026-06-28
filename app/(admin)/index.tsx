import { ProgrammeDashboardScreen } from "../../src/screens/admin/ProgrammeDashboardScreen";

// The institutional Programme Dashboard is the (admin) group's home route.
// All chrome (responsive sidebar↔drawer) lives in <AdminShell> inside the
// screen; figures come from adminData, which returns coming_soon envelopes
// until the institutional backend lands — so this renders graceful states,
// never mock numbers.
export default function AdminIndexRoute() {
  return <ProgrammeDashboardScreen />;
}
