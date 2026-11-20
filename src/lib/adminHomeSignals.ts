/**
 * Pure helpers behind the admin Home workbench ("Attention needed" and
 * "Pick up where you left off").
 *
 * Everything here is derived from data the admin dashboards ALREADY load
 * (`StudentIntelligenceSummary`) or from the client-side resume store
 * (`adminResume`). Nothing is invented: a signal that the payload does not
 * carry (claim expiry, import rows needing review, incomplete subject
 * profiles, funnel timestamps, an activity log) is simply not produced.
 */
import type { StudentIntelligenceSummary } from "../types/institution";
import type { AdminResumeState, AdminTaskState } from "./adminResume";

export type AttentionDestination = "students" | "jambAccounts";

export interface AttentionItem {
  key: "unclaimed_codes" | "stage_not_recorded";
  /** Plain-language sentence that already contains the real count. */
  label: string;
  count: number;
  /** Name of the existing `adminNav` helper this item opens. */
  destination: AttentionDestination;
  /** Verb phrase for the action, used in the accessible name. */
  actionLabel: string;
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/**
 * Items an admin can act on, in priority order. An empty array means the
 * payload was read and nothing needs attention; callers must not call this
 * with a payload they have not received (that case renders nothing at all).
 *
 * `providerOnly` (tutorial centres and JAMB cafes) opens the JAMB account
 * list, which is where their provisioned accounts live; schools and
 * universities open the student roster. Both are existing admin routes.
 */
export function attentionItems(
  summary: StudentIntelligenceSummary,
  opts: { providerOnly?: boolean } = {},
): AttentionItem[] {
  const destination: AttentionDestination = opts.providerOnly
    ? "jambAccounts"
    : "students";
  const items: AttentionItem[] = [];

  const unclaimed = summary.unclaimedCodes;
  if (typeof unclaimed === "number" && unclaimed > 0) {
    items.push({
      key: "unclaimed_codes",
      count: unclaimed,
      label: `${unclaimed.toLocaleString()} ${plural(
        unclaimed,
        "claim code has",
        "claim codes have",
      )} not been used yet`,
      destination,
      actionLabel: "Open the account list",
    });
  }

  const unrecorded = (summary.stageCounts ?? []).find(
    (row) => row.stage === "not_recorded",
  )?.total;
  if (typeof unrecorded === "number" && unrecorded > 0) {
    items.push({
      key: "stage_not_recorded",
      count: unrecorded,
      label: `${unrecorded.toLocaleString()} ${plural(
        unrecorded,
        "student has",
        "students have",
      )} not recorded a stage yet`,
      destination,
      actionLabel: "Open the roster",
    });
  }

  return items;
}

export interface ResumeCandidate {
  href: string;
  label: string;
  /** ISO timestamp from the resume store; may be empty. */
  updatedAt: string;
  source: "task" | "page";
}

/** The two admin home routes: resuming into the page you are on is pointless. */
function isAdminHome(href: string): boolean {
  const path = href.split("?")[0].replace(/\/+$/, "");
  return /\/(dashboard|guidance)$/.test(path);
}

const time = (iso?: string) => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Chooses what "Pick up where you left off" opens: the most recently saved of
 * the last admin task (e.g. the roster) and the last visited admin page.
 * Returns null when there is nothing worth resuming, in which case the card
 * is not rendered.
 */
export function pickResume(
  task: AdminTaskState | null,
  page: AdminResumeState | null,
): ResumeCandidate | null {
  const candidates: ResumeCandidate[] = [];
  if (task && !isAdminHome(task.href)) {
    candidates.push({
      href: task.href,
      label: task.label,
      updatedAt: task.updatedAt,
      source: "task",
    });
  }
  if (page && !isAdminHome(page.href)) {
    candidates.push({
      href: page.href,
      label: page.label,
      updatedAt: page.updatedAt,
      source: "page",
    });
  }
  if (!candidates.length) return null;
  // Latest wins; on a tie the task (the more specific record) wins.
  return candidates.reduce((best, next) =>
    time(next.updatedAt) > time(best.updatedAt) ? next : best,
  );
}

/** "20 Nov 2026" from a stored timestamp, or "" when it cannot be read. */
export function formatLastOpened(updatedAt: string): string {
  const t = time(updatedAt);
  if (!t) return "";
  return new Date(t).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
