import { Stack } from "expo-router";
import { ADMIN_EXPLORE_BASE, ExploreBaseProvider } from "@/lib/exploreNav";
import { AdminShell } from "@/screens/admin/AdminShell";

/**
 * The admin Explore stack (§5.4).
 *
 * Mounts the SAME screens as `app/(tabs)/explore` — the spec is explicit that
 * we do not build new ones — but binds exploreNav to the `(admin)` base so a
 * tap on a domain, role or programme pushes onto THIS stack. Before this
 * layout existed, `/(admin)/workspace-explore` was a single leaf route and every card on
 * it pushed `/(tabs)/explore/...`: the sidebar disappeared and the adviser was
 * dropped into the student app mid-lookup.
 *
 * AdminShell wraps the Stack rather than each screen, so the sidebar persists
 * across pushes (search → domain → role) instead of unmounting and remounting
 * at every step.
 */
export default function AdminExploreStack() {
  return (
    <ExploreBaseProvider base={ADMIN_EXPLORE_BASE}>
      <AdminShell title="Explore" eyebrow="Programmes · domains · roles">
        <Stack screenOptions={{ headerShown: false }} />
      </AdminShell>
    </ExploreBaseProvider>
  );
}
