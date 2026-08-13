/**
 * exploreNav — typed navigation helpers for the Explore stack.
 *
 * Centralises the route strings so screens don't hand-build hrefs. Each helper
 * takes the expo-router `router` (from useRouter()).
 *
 * BASE-AWARE. The same Explore screens are mounted twice: under
 * `/(tabs)/explore` for students and under `/(admin)/workspace-explore` for verified
 * admins (§5.4: "do not build new screens. Reuse the existing student-facing
 * Explore detail screens inside the admin shell"). These helpers used to
 * hardcode the `(tabs)` prefix, so every card and every search result on the
 * ADMIN Explore page pushed the student stack — the admin sidebar vanished
 * mid-task and the only way back was the browser's back button.
 *
 * Screens should call {@link useExploreNav}, which resolves the base from
 * context. The bare {@link exploreNav} export stays bound to `(tabs)` for
 * non-React callers and for anything outside an ExploreBaseProvider.
 */
import React from "react";
import type { Router } from "expo-router";

type Nav = Pick<Router, "push" | "replace" | "back">;

export const TABS_EXPLORE_BASE = "/(tabs)/explore";
/**
 * NOT `/(admin)/explore`. Expo-router group names are invisible in the URL, so
 * `(tabs)/explore/domains` and `(admin)/explore/domains` both serialise to
 * `/explore/domains` — the same 15 paths declared twice. On a cold load of that
 * URL the router picked the admin file, so a signed-out guest opening a shared
 * link landed inside the "School guidance workspace" shell (the admin group has
 * no auth guard). A distinct segment is what actually removes the ambiguity;
 * guarding the group would only have changed which wrong thing happened.
 */
export const ADMIN_EXPLORE_BASE = "/(admin)/workspace-explore";
/** URL segment for ADMIN_EXPLORE_BASE — what `useSegments()` reports. */
export const ADMIN_EXPLORE_SEGMENT = "workspace-explore";

export type ExploreNav = ReturnType<typeof makeExploreNav>;

export function makeExploreNav(base: string) {
  return {
    base,
    programme(router: Nav, programmeId: string) {
      router.push(`${base}/programme/${programmeId}` as never);
    },
    compare(router: Nav, programmeIds: string[] = []) {
      const ids = programmeIds.slice(0, 4).map(encodeURIComponent).join(",");
      router.push(`${base}/compare${ids ? `?ids=${ids}` : ""}` as never);
    },
    role(router: Nav, roleId: string) {
      router.push(`${base}/role/${roleId}` as never);
    },
    domains(router: Nav) {
      router.push(`${base}/domains` as never);
    },
    domain(router: Nav, domainId: string) {
      router.push(`${base}/domain/${domainId}` as never);
    },

    // ─── Phase 7: elite pathways & special flows ────────────────
    elitePathways(router: Nav) {
      router.push(`${base}/elite` as never);
    },
    elitePathway(router: Nav, pathwayId: string) {
      router.push(`${base}/elite/${pathwayId}` as never);
    },
    /** The special-flows hub (PhD, career-change, upgrades, credentials). */
    pathways(router: Nav) {
      router.push(`${base}/pathways` as never);
    },
    phd(router: Nav) {
      router.push(`${base}/pathways/phd` as never);
    },
    careerChange(router: Nav) {
      router.push(`${base}/pathways/career-change` as never);
    },
    qualificationUpgrades(router: Nav) {
      router.push(`${base}/pathways/upgrades` as never);
    },
    charterships(router: Nav) {
      router.push(`${base}/pathways/credentials` as never);
    },
    entrepreneurship(router: Nav) {
      router.push(`${base}/pathways/entrepreneurship` as never);
    },

    // ─── Phase 8: admission intelligence ─────────────────────────
    /** The admission hub, optionally in a given picker mode. */
    admissionHub(router: Nav, mode?: "programme" | "subjects") {
      router.push(
        `${base}/admission?${[
          mode ? `mode=${mode}` : "",
          base === ADMIN_EXPLORE_BASE ? "admin=1" : "",
        ].filter(Boolean).join("&")}` as never,
      );
    },
    /** Full admission-insight screen for a JAMB name or programme. */
    admission(router: Nav, jambNameOrProgrammeId: string) {
      router.push(
        `${base}/admission/${encodeURIComponent(jambNameOrProgrammeId)}` as never,
      );
    },
  };
}

/** Default binding: the student tab stack. */
export const exploreNav = makeExploreNav(TABS_EXPLORE_BASE);

const adminExploreNav = makeExploreNav(ADMIN_EXPLORE_BASE);

const ExploreBaseContext = React.createContext<string>(TABS_EXPLORE_BASE);

/**
 * Mounted by `app/(admin)/workspace-explore/_layout.tsx` so every Explore screen beneath
 * it navigates within the admin stack. Absent it, the default is `(tabs)`.
 */
export function ExploreBaseProvider({
  base,
  children,
}: {
  base: string;
  children: React.ReactNode;
}) {
  return React.createElement(
    ExploreBaseContext.Provider,
    { value: base },
    children,
  );
}

/** The Explore navigator bound to whichever stack this screen is mounted in. */
export function useExploreNav(): ExploreNav {
  const base = React.useContext(ExploreBaseContext);
  return base === ADMIN_EXPLORE_BASE ? adminExploreNav : exploreNav;
}
