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
  domainIntelligence(router: Nav) {
    router.push("/(admin)/domain-intelligence" as never);
  },
  roleDemand(router: Nav) {
    router.push("/(admin)/role-demand" as never);
  },
  skillsGap(router: Nav) {
    router.push("/(admin)/skills-gap" as never);
  },
  trends(router: Nav) {
    router.push("/(admin)/trends" as never);
  },
  salary(router: Nav) {
    router.push("/(admin)/salary" as never);
  },
  remote(router: Nav) {
    router.push("/(admin)/remote" as never);
  },
  vsNational(router: Nav) {
    router.push("/(admin)/vs-national" as never);
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
          locked: true,
        };

  return [
    {
      title: "Intelligence",
      items: [
        dashboardItem(dashboardLabel),
        {
          key: "domain-intelligence",
          label: audience === "university" ? "Domain drilldown" : "Career domains",
          icon: "🧭",
          match: "domain-intelligence",
          go: (n) => adminNav.domainIntelligence(n),
        },
        {
          key: "role-demand",
          label: audience === "university" ? "Role demand" : "Career demand",
          icon: "💼",
          match: "role-demand",
          go: (n) => adminNav.roleDemand(n),
        },
        {
          key: "skills-gap",
          label: audience === "university" ? "Skills gaps" : "Learning gaps",
          icon: "🧩",
          match: "skills-gap",
          go: (n) => adminNav.skillsGap(n),
        },
        {
          key: "peers",
          label: audience === "university" ? "Peer benchmarks" : "Benchmarks",
          icon: "🏛️",
          match: "peers",
          go: (n) => adminNav.peers(n),
        },
      ],
    },
    {
      title: setupTitle,
      items: [AFFILIATION_ITEM, VERIFICATION_ITEM, learnerItem],
    },
  ];
}
