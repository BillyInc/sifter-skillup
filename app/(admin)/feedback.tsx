import { AdminFeedbackScreen } from "../../src/screens/admin/AdminFeedbackScreen";

// Admin feedback (§5.6 / PART 6A) — SUBMIT ONLY. Feedback is outbound to the
// Sifter team; GET /api/feedback is internal-staff-only, so there is no inbox
// or browse view in admin mode.
export default function AdminFeedbackRoute() {
  return <AdminFeedbackScreen />;
}
