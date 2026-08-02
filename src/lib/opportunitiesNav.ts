/**
 * opportunitiesNav — typed navigation helpers for the Opportunities stack.
 */
import type { Router } from "expo-router";

type Nav = Pick<Router, "push" | "replace" | "back">;

export const opportunitiesNav = {
  /** The Opportunities tab root — the parent every Opportunities screen falls
   *  back to when there is no navigation history to pop. */
  hub(router: Nav) {
    router.replace("/(tabs)/opportunities" as never);
  },
  opportunity(router: Nav, opportunityId: string) {
    router.push(`/(tabs)/opportunities/opportunity/${opportunityId}` as never);
  },
  organisation(router: Nav, organisationId: string) {
    router.push(
      `/(tabs)/opportunities/organisation/${organisationId}` as never,
    );
  },
  scholarships(router: Nav) {
    router.push("/(tabs)/opportunities/scholarships" as never);
  },
  windows(router: Nav) {
    router.push("/(tabs)/opportunities/windows" as never);
  },
};
