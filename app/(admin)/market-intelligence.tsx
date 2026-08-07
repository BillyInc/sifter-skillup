import { MarketIntelligenceScreen } from "../../src/screens/admin/MarketIntelligenceScreen";

// Market Intelligence (§5.2) — the merged View B. Replaces the former
// domain-intelligence / role-demand / trends / remote / salary / vs-national
// routes: one screen, two entry modes. The screen owns chrome + graceful states.
export default function MarketIntelligenceRoute() {
  return <MarketIntelligenceScreen />;
}
