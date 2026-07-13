import { StudentProvisioningScreen } from "../../src/screens/admin/StudentProvisioningScreen";

// The consent-aware student area. Individual visibility is still governed by the
// server-side rule (provisioned-unclaimed OR active consent) — this screen only
// renders what the roster endpoint returns, and hosts the provisioning funnel.
export default function StudentsRoute() {
  return <StudentProvisioningScreen />;
}
