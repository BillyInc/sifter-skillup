/**
 * adminNav — typed navigation helpers for the institutional/admin stack.
 * Centralises route strings so admin screens don't hand-build hrefs.
 */
import type { Router } from "expo-router";
import type { OrganizationType } from "../types/institution";

export type Nav = Pick<Router, "push" | "replace" | "back">;

export interface AdminNavItem {
  key: string;
  label: string;
  icon: string;
  go: (nav: Nav) => void;
  /** Matches the trailing path segment to mark the row active. */
  match: string;
  /** Privacy-locked (consent-gated) — rendered with a lock glyph. */
  locked?: boolean;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export interface AdminNavContext {
  organizationType?: OrganizationType;
  providerSessionOnly?: boolean;
}

type AdminAudience = "university" | "school" | "provider";

export const adminNav = {
  dashboard(router: Nav) {
    router.replace("/(admin)/dashboard" as never);
  },
  programmeDashboard(router: Nav) {
    router.push("/(admin)/dashboard" as never);
  },
  guidanceDashboard(router: Nav) {
    router.push("/(admin)/guidance" as never);
  },
  profile(router: Nav) {
    router.push("/(admin)/profile" as never);
  },
  /**
   * Market Intelligence (§5.2) — the merge point for what used to be five
   * separate screens: domain-intelligence, role-demand, trends, remote and
   * salary. All five read from only two endpoints (getDomainRanking,
   * getRoleDemand) and three of them rendered a single column of the same
   * data, so they are one screen with lenses now.
   */
  marketIntelligence(router: Nav) {
    router.push("/(admin)/market-intelligence" as never);
  },
  /** §5.1 View A — curriculum portfolio reach. Structural, NOT market data. */
  domainReach(router: Nav) {
    router.push("/(admin)/domain-reach" as never);
  },
  skillsGap(router: Nav) {
    router.push("/(admin)/skills-gap" as never);
  },
  /** §5.4 — the student Explore catalogue, caps lifted for verified admins. */
  explore(router: Nav) {
    router.push("/(admin)/explore" as never);
  },
  peers(router: Nav) {
    router.push("/(admin)/peers" as never);
  },
  students(router: Nav) {
    router.push("/(admin)/students" as never);
  },
  session(router: Nav) {
    router.push("/(admin)/session" as never);
  },
  affiliation(router: Nav) {
    router.push("/(admin)/affiliation" as never);
  },
  verify(router: Nav) {
    router.push("/(admin)/verify" as never);
  },
  feedback(router: Nav) {
    router.push("/(admin)/feedback" as never);
  },
  expertDossier(router: Nav) {
    router.push("/(admin)/expert-dossier" as never);
  },
};

function audienceFor(ctx?: AdminNavContext | null): AdminAudience {
  if (
    ctx?.providerSessionOnly === true ||
    ctx?.organizationType === "tutorial_centre" ||
    ctx?.organizationType === "jamb_cafe"
  ) {
    return "provider";
  }
  return ctx?.organizationType === "university" ? "university" : "school";
}

function dashboardItem(label: string): AdminNavItem {
  return {
    key: "dashboard",
    label,
    icon: "📊",
    match: "(admin)",
    go: (n) => adminNav.dashboard(n),
  };
}

const PROFILE_ITEM: AdminNavItem = {
  key: "profile",
  label: "Profile + team",
  icon: "◎",
  match: "profile",
  go: (n) => adminNav.profile(n),
};

const AFFILIATION_ITEM: AdminNavItem = {
  key: "affiliation",
  label: "Affiliation",
  icon: "🔗",
  match: "affiliation",
  go: (n) => adminNav.affiliation(n),
};

const VERIFICATION_ITEM: AdminNavItem = {
  key: "verify",
  label: "Verification",
  icon: "✅",
  match: "verify",
  go: (n) => adminNav.verify(n),
};

export function getAdminNavGroups(
  ctx?: AdminNavContext | null,
): AdminNavGroup[] {
  const audience = audienceFor(ctx);
  const dashboardLabel =
    audience === "university" ? "Programme dashboard" : "Cohort dashboard";
  const setupTitle =
    audience === "university"
      ? "Institution workspace"
      : audience === "provider"
        ? "Provider workspace"
        : "School workspace";
  const learnerItem: AdminNavItem =
    audience === "provider"
      ? {
          key: "session",
          label: "Learner sessions",
          icon: "🎯",
          match: "session",
          go: (n) => adminNav.session(n),
        }
      : {
          key: "students",
          label: audience === "university" ? "Student access" : "Learners",
          icon: "👥",
          match: "students",
          go: (n) => adminNav.students(n),
        };

  // §5.0 sidebar, in the spec's order:
  //   General Dashboard · Domain Reach Audit · Market Intelligence ·
  //   Skills Gap · Explore · Students · Feedback
  //   —— Workspace: Profile + team · Affiliation · Verification
  //
  // Replaces the v1 grouping (Domain lens / Role value / Trends / Peer
  // benchmarks). Three of those were separate screens rendering one column of
  // the same two endpoints; §5.2 merges all five into Market Intelligence.
  const intelligenceItems: AdminNavItem[] = [dashboardItem(dashboardLabel)];

  // Domain Reach Audit is UNIVERSITIES ONLY (§5.1: "University administrators
  // only, institution_type = 'university'"). It is CCMAS curriculum-portfolio
  // planning — meaningless for a secondary school or tutorial centre.
  if (audience === "university") {
    intelligenceItems.push({
      key: "domain-reach",
      label: "Domain reach audit",
      icon: "🧭",
      match: "domain-reach",
      go: (n) => adminNav.domainReach(n),
    });
  }

  intelligenceItems.push(
    {
      key: "market-intelligence",
      label:
        audience === "university"
          ? "Market intelligence"
          : "Guidance intelligence",
      icon: "📊",
      match: "market-intelligence",
      go: (n) => adminNav.marketIntelligence(n),
    },
    {
      key: "skills-gap",
      label: audience === "university" ? "Skills gaps" : "Learning gaps",
      icon: "🧩",
      match: "skills-gap",
      go: (n) => adminNav.skillsGap(n),
    },
    {
      key: "explore",
      label: "Explore",
      icon: "🔎",
      match: "explore",
      go: (n) => adminNav.explore(n),
    },
    learnerItem,
    {
      // §5.6/§6A.1 — SUBMIT only. This is not an inbox: feedback is outbound to
      // the Sifter team and no admin can read anyone else's.
      key: "feedback",
      label: "Feedback",
      icon: "✉️",
      match: "feedback",
      go: (n) => adminNav.feedback(n),
    },
  );

  // Peer benchmarking stays university-only (§0.6): schools must not see other
  // institutions' comparative data.
  if (audience === "university") {
    intelligenceItems.push({
      key: "peers",
      label: "Peer benchmarks",
      icon: "🏛️",
      match: "peers",
      go: (n) => adminNav.peers(n),
    });
  }

  return [
    {
      title: audience === "university" ? "Intelligence" : "Guidance",
      items: intelligenceItems,
    },
    {
      title: setupTitle,
      items: [PROFILE_ITEM, AFFILIATION_ITEM, VERIFICATION_ITEM],
    },
  ];
}
