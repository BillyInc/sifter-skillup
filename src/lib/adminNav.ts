/**
 * adminNav — typed navigation helpers for the institutional/admin stack.
 * Centralises route strings so admin screens don't hand-build hrefs.
 */
import type { Router } from "expo-router";
import type { OrganizationType } from "../types/institution";
import { adminAudienceForOrg } from "./adminAudience";
import { ADMIN_EXPLORE_SEGMENT } from "./exploreNav";

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
    router.replace("/(admin)/dashboard" as never);
  },
  guidanceDashboard(router: Nav) {
    router.replace("/(admin)/guidance" as never);
  },
  /** Audience-correct home. Universities summarise; advisers look things up. */
  home(router: Nav, audience: AdminAudience) {
    router.replace(
      (audience === "university"
        ? "/(admin)/dashboard"
        : "/(admin)/guidance") as never,
    );
  },
  /**
   * NOT `/(admin)/profile` — that path is the student profile tab. Group names
   * are stripped from the URL, so the two files collided on `/profile` exactly
   * the way the Explore trees collided on `/explore`.
   */
  profile(router: Nav) {
    router.push("/(admin)/workspace-profile" as never);
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
  /**
   * §5.4 — the student Explore catalogue, caps lifted for verified admins.
   * `query` seeds the search box, so a dashboard search field can hand off
   * mid-thought instead of dropping the adviser on an empty landing.
   */
  explore(router: Nav, query?: string) {
    const q = (query ?? "").trim();
    router.push(
      (q
        ? `/(admin)/workspace-explore?q=${encodeURIComponent(q)}`
        : "/(admin)/workspace-explore") as never,
    );
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
  // Delegate the university/school split to adminAudience — the shell reads
  // that module, so a second copy here is how the two drift.
  return adminAudienceForOrg(ctx?.organizationType) === "university"
    ? "university"
    : "school";
}

/**
 * The home row.
 *
 * Universities get the General Dashboard (§5.0). School and provider
 * audiences get the COHORT view at /(admin)/guidance instead: it was already
 * built (SchoolGuidanceDashboardScreen) but nothing routed to it — every
 * audience's home row pointed at /(admin)/dashboard, so secondary schools and
 * tutorial centres were shown the university dashboard, with a Domain Reach
 * Audit preview and a national rank that mean nothing for an organisation
 * with no programme mix.
 *
 * `match` was "(admin)", which is a group segment and never the last path
 * segment of /(admin)/dashboard — so the row could not highlight on its own
 * page. It matches the real leaf now.
 */
function dashboardItem(
  label: string,
  audience: AdminAudience,
): AdminNavItem {
  const university = audience === "university";
  return {
    key: university ? "dashboard" : "guidance",
    label,
    icon: "📊",
    match: university ? "dashboard" : "guidance",
    go: (n) =>
      university ? adminNav.dashboard(n) : adminNav.guidanceDashboard(n),
  };
}

/**
 * §5.4 Explore. First in the list for advisory audiences because it is their
 * landing page and their main working surface — see adminHomeForProfile.
 */
const EXPLORE_ITEM: AdminNavItem = {
  key: "explore",
  label: "Explore",
  icon: "🔎",
  // The URL segment, which is deliberately NOT "explore" — see
  // ADMIN_EXPLORE_BASE. Matching on "explore" here would also light this row up
  // on the student stack, whose segment really is "explore".
  match: ADMIN_EXPLORE_SEGMENT,
  go: (n) => adminNav.explore(n),
};

const PROFILE_ITEM: AdminNavItem = {
  key: "profile",
  label: "Profile + team",
  icon: "◎",
  match: "workspace-profile",
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
  // "Cohort", not "Cohort dashboard": for an advisory organisation this row is
  // not the home page and does not summarise the other views. It is one view —
  // learner aggregates — and naming it a dashboard is what made it read as a
  // duplicate of Explore.
  const dashboardLabel =
    audience === "university" ? "Programme dashboard" : "Cohort";
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

  // §5.0 sidebar, in the spec's order for universities:
  //   General Dashboard · Domain Reach Audit · Market Intelligence ·
  //   Skills Gap · Explore · Students · Feedback
  //   —— Workspace: Profile + team · Affiliation · Verification
  //
  // Advisory audiences work from Guidance; Explore is an intentional catalogue
  // tool opened from that workspace.
  //
  // Replaces the v1 grouping (Domain lens / Role value / Trends / Peer
  // benchmarks). Three of those were separate screens rendering one column of
  // the same two endpoints; §5.2 merges all five into Market Intelligence.
  // Advisory audiences lead with Explore (their landing and their working
  // surface); the cohort view follows. Universities lead with the dashboard.
  const intelligenceItems: AdminNavItem[] =
    audience === "university"
      ? [dashboardItem(dashboardLabel, audience)]
      : [dashboardItem("Guidance", audience), EXPLORE_ITEM];

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
    // Universities meet Explore here, in the middle of the intelligence group;
    // advisory audiences already have it pinned at the top.
    ...(audience === "university" ? [EXPLORE_ITEM] : []),
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
