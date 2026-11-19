/**
 * O-level grade helpers (SS3 / UTME). Grades are self-reported, optional, and
 * only ever ANNOTATE the subject-match result; they never remove a programme.
 * The standard WAEC/NECO bands are applied by the backend; the institution's
 * own rule still applies. No UTME score is captured (no thresholds exist).
 */
import type { GradeCheck, GradeCheckStatus } from "./careerData";

export const OLEVEL_GRADES = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"] as const;
export type OlevelGrade = (typeof OLEVEL_GRADES)[number];

export const OLEVEL_EXAM_BODIES = [
  { value: "waec", label: "WAEC" },
  { value: "neco", label: "NECO" },
  { value: "other", label: "Other" },
] as const;
export type OlevelExamBody = (typeof OLEVEL_EXAM_BODIES)[number]["value"];

export const MAX_GRADE_ENTRIES = 12;

export const GRADE_BANDS_COPY =
  "Grades are optional. If you add them, we check them against the standard WAEC/NECO bands " +
  "(credit is A1 to C6, pass is A1 to E8). The university's own rule still applies, " +
  "and we only use the grades you enter.";
export const UTME_SCORE_COPY =
  "Programme cut-off marks are not published in this app. Needs confirmation with JAMB/the institution.";

export function isOlevelGrade(value: unknown): value is OlevelGrade {
  return typeof value === "string" && (OLEVEL_GRADES as readonly string[]).includes(value);
}

/** Keep only valid grades for subjects that are still selected (case-insensitive subject match). */
export function pruneGrades(
  grades: Record<string, string> | undefined,
  subjects: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!grades) return out;
  const wanted = new Map(subjects.map((s) => [s.trim().toLowerCase(), s]));
  for (const [key, value] of Object.entries(grades)) {
    const subject = wanted.get(key.trim().toLowerCase());
    if (subject && isOlevelGrade(value)) out[subject] = value;
  }
  return out;
}

export function sameGrades(a: Record<string, string>, b: Record<string, string>): boolean {
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  return ak.length === bk.length && ak.every((k, i) => k === bk[i] && a[k] === b[k]);
}

export interface GradeLabel {
  status: GradeCheckStatus;
  label: string;
  /** Short reason taken from the first relevant condition note. */
  reason: string | null;
}

const LABELS: Record<GradeCheckStatus, string> = {
  met: "Grades meet this requirement",
  not_met: "Grades may not meet this requirement",
  unknown: "Add your grade to check",
};

/** Result label for a programme/offering. Never claims admission eligibility. */
export function gradeCheckLabel(check: GradeCheck | null | undefined): GradeLabel | null {
  if (!check) return null;
  const status: GradeCheckStatus =
    check.status === "met" || check.status === "not_met" ? check.status : "unknown";
  const conditions = check.conditions ?? [];
  const pick =
    conditions.find((c) => c.status === status && c.note) ??
    conditions.find((c) => c.note);
  return { status, label: LABELS[status], reason: pick?.note ?? null };
}

export const GRADE_RESULT_FOOTNOTE =
  "Possible match based on the grades you entered. Confirm with JAMB or the institution.";
