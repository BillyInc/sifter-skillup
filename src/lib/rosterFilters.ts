/**
 * Client-side filters for the admin student roster.
 *
 * Works only on fields the roster payload already returns (provenance,
 * claimState, studentClass / studentType). It never changes what the server
 * decides is visible: it narrows the rows already loaded. Counts shown next to
 * each option come from those same rows, so they are always real.
 */
import type { RosterStudent } from "../types/institution";

export const ALL = "all";

export type RosterSourceKey = "provisioned" | "self";
export type RosterClaimKey = "unclaimed" | "claimed";

export interface RosterFilters {
  /** "all" or a stage label (a class like "SS3", or a starting-point label). */
  stage: string;
  /** "all" | "unclaimed" | "claimed" */
  claimed: string;
  /** "all" | "provisioned" | "self" */
  source: string;
}

export const EMPTY_ROSTER_FILTERS: RosterFilters = { stage: ALL, claimed: ALL, source: ALL };

/** Shown for rows whose payload carries no stage at all. */
export const STAGE_NOT_SET = "Stage not recorded yet";

export const SOURCE_LABELS: Record<RosterSourceKey, string> = {
  provisioned: "Added by you",
  self: "Self-signed-up",
};

export const CLAIM_LABELS: Record<RosterClaimKey, string> = {
  unclaimed: "Not claimed yet",
  claimed: "Claimed",
};

/**
 * Same rule as the roster row badge: a provisioned account whose claim state is
 * still "unclaimed" is school-managed (not claimed); every other row belongs to
 * a student who owns their account.
 */
export function claimKeyOf(student: RosterStudent): RosterClaimKey {
  return student.provenance === "provisioned" && student.claimState === "unclaimed" ? "unclaimed" : "claimed";
}

export function sourceKeyOf(student: RosterStudent): RosterSourceKey {
  return student.provenance === "provisioned" ? "provisioned" : "self";
}

export function hasActiveRosterFilters(filters: RosterFilters): boolean {
  return filters.stage !== ALL || filters.claimed !== ALL || filters.source !== ALL;
}

type StageOf = (student: RosterStudent) => string | null | undefined;

const stageKeyOf = (student: RosterStudent, stageOf: StageOf): string => stageOf(student) || STAGE_NOT_SET;

function matches(student: RosterStudent, filters: RosterFilters, stageOf: StageOf, skip?: keyof RosterFilters): boolean {
  if (skip !== "stage" && filters.stage !== ALL && stageKeyOf(student, stageOf) !== filters.stage) return false;
  if (skip !== "claimed" && filters.claimed !== ALL && claimKeyOf(student) !== filters.claimed) return false;
  if (skip !== "source" && filters.source !== ALL && sourceKeyOf(student) !== filters.source) return false;
  return true;
}

export function applyRosterFilters(students: RosterStudent[], filters: RosterFilters, stageOf: StageOf): RosterStudent[] {
  return students.filter((student) => matches(student, filters, stageOf));
}

export interface RosterFilterOption {
  key: string;
  label: string;
  count: number;
}

export interface RosterFilterGroups {
  stage: RosterFilterOption[];
  claimed: RosterFilterOption[];
  source: RosterFilterOption[];
}

/**
 * Options for each group with the count of rows that would remain if that
 * option were picked, given the filters chosen in the OTHER groups. A group
 * with only one real option (or none) is returned empty so the UI can hide a
 * filter that cannot narrow anything.
 */
export function buildRosterFilterGroups(
  students: RosterStudent[],
  filters: RosterFilters,
  stageOf: StageOf,
): RosterFilterGroups {
  const count = (group: keyof RosterFilters, predicate: (s: RosterStudent) => boolean) =>
    students.filter((s) => matches(s, filters, stageOf, group) && predicate(s)).length;

  const stageLabels = Array.from(new Set(students.map((s) => stageKeyOf(s, stageOf))));
  stageLabels.sort((a, b) => {
    if (a === STAGE_NOT_SET) return 1;
    if (b === STAGE_NOT_SET) return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const present = <K extends string>(keys: K[], keyOf: (s: RosterStudent) => K) =>
    keys.filter((key) => students.some((s) => keyOf(s) === key));

  const claimKeys = present<RosterClaimKey>(["unclaimed", "claimed"], claimKeyOf);
  const sourceKeys = present<RosterSourceKey>(["provisioned", "self"], sourceKeyOf);

  const withAll = (group: keyof RosterFilters, options: RosterFilterOption[]): RosterFilterOption[] =>
    options.length < 2 ? [] : [{ key: ALL, label: "All", count: count(group, () => true) }, ...options];

  return {
    stage: withAll(
      "stage",
      stageLabels.map((label) => ({ key: label, label, count: count("stage", (s) => stageKeyOf(s, stageOf) === label) })),
    ),
    claimed: withAll(
      "claimed",
      claimKeys.map((key) => ({ key, label: CLAIM_LABELS[key], count: count("claimed", (s) => claimKeyOf(s) === key) })),
    ),
    source: withAll(
      "source",
      sourceKeys.map((key) => ({ key, label: SOURCE_LABELS[key], count: count("source", (s) => sourceKeyOf(s) === key) })),
    ),
  };
}

/** Drops a selection that no longer exists in the loaded rows (e.g. after a delete). */
export function sanitizeRosterFilters(filters: RosterFilters, groups: RosterFilterGroups): RosterFilters {
  const keep = (value: string, options: RosterFilterOption[]) =>
    value === ALL || options.some((o) => o.key === value) ? value : ALL;
  return {
    stage: keep(filters.stage, groups.stage),
    claimed: keep(filters.claimed, groups.claimed),
    source: keep(filters.source, groups.source),
  };
}

// Session-only memory so the choice survives opening a student and coming back.
// Deliberately in memory, never persisted: it holds no personal data and resets
// on reload.
let remembered: RosterFilters = { ...EMPTY_ROSTER_FILTERS };

export function getRememberedRosterFilters(): RosterFilters {
  return { ...remembered };
}

export function rememberRosterFilters(filters: RosterFilters): void {
  remembered = { ...filters };
}

export function resetRememberedRosterFilters(): void {
  remembered = { ...EMPTY_ROSTER_FILTERS };
}
