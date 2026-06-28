import { DomainIntelligenceScreen } from "../../src/screens/admin/DomainIntelligenceScreen";

// Aggregate domain-level demand intelligence. Chrome + state-branching live in
// the screen; adminData returns coming_soon envelopes until data lands.
export default function DomainIntelligenceRoute() {
  return <DomainIntelligenceScreen />;
}
