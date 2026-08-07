import ExploreScreen from "../../src/screens/ExploreScreen";
import { AdminShell } from "../../src/screens/admin/AdminShell";

/**
 * Explore (§5.4) — the full pathways catalogue inside the admin shell.
 *
 * Per the spec: "do not build new screens. Reuse the existing student-facing
 * Explore detail screens inside the admin shell." This route is exactly that —
 * the student ExploreScreen, unmodified, wrapped in AdminShell so admins keep
 * the institutional nav. Every detail screen it links to (programme, school /
 * admission, domain, subgroup, role, pathway) is the student one too.
 *
 * This is the structural catalogue, NOT market intelligence (§0.9).
 */
export default function AdminExploreRoute() {
  return (
    <AdminShell title="Explore" eyebrow="Full pathways catalogue">
      <ExploreScreen />
    </AdminShell>
  );
}
