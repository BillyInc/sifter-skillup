/**
 * exploreNav — typed navigation helpers for the Explore stack.
 *
 * Centralises the route strings so screens don't hand-build hrefs. Each helper
 * takes the expo-router `router` (from useRouter()).
 */
import type { Router } from "expo-router";

type Nav = Pick<Router, "push" | "replace" | "back">;

export const exploreNav = {
  programme(router: Nav, programmeId: string) {
    router.push(`/(tabs)/explore/programme/${programmeId}` as never);
  },
  role(router: Nav, roleId: string) {
    router.push(`/(tabs)/explore/role/${roleId}` as never);
  },
  domains(router: Nav) {
    router.push("/(tabs)/explore/domains" as never);
  },
  domain(router: Nav, domainId: string) {
    router.push(`/(tabs)/explore/domain/${domainId}` as never);
  },

  // ─── Phase 7: elite pathways & special flows ────────────────
  elitePathways(router: Nav) {
    router.push("/(tabs)/explore/elite" as never);
  },
  elitePathway(router: Nav, pathwayId: string) {
    router.push(`/(tabs)/explore/elite/${pathwayId}` as never);
  },
  /** The special-flows hub (PhD, career-change, upgrades, credentials). */
  pathways(router: Nav) {
    router.push("/(tabs)/explore/pathways" as never);
  },
  phd(router: Nav) {
    router.push("/(tabs)/explore/pathways/phd" as never);
  },
  careerChange(router: Nav) {
    router.push("/(tabs)/explore/pathways/career-change" as never);
  },
  qualificationUpgrades(router: Nav) {
    router.push("/(tabs)/explore/pathways/upgrades" as never);
  },
  charterships(router: Nav) {
    router.push("/(tabs)/explore/pathways/credentials" as never);
  },

  // ─── Phase 8: admission intelligence ─────────────────────────
  /** Full admission-insight screen for a JAMB name or programme. */
  admission(router: Nav, jambNameOrProgrammeId: string) {
    router.push(
      `/(tabs)/explore/admission/${encodeURIComponent(jambNameOrProgrammeId)}` as never,
    );
  },
};
