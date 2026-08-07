import { DomainReachAuditScreen } from "../../src/screens/admin/DomainReachAuditScreen";

// Domain Reach Audit (§5.1) — structural CCMAS reach, not market demand.
// The screen owns chrome + graceful states.
export default function DomainReachRoute() {
  return <DomainReachAuditScreen />;
}
