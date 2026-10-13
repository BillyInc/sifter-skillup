export type ProgrammeThemeKey =
  | "core"
  | "shared_communication"
  | "shared_nigerian_culture"
  | "shared_philosophy"
  | "shared_peace_conflict"
  | "shared_enterprise"
  | "people"
  | "ideas"
  | "research"
  | "technology"
  | "application"
  | "african_societies"
  | "social_change"
  | "social_issues"
  | "governance"
  | "applied_practice";

export interface ProgrammeThemeCourse {
  code?: string;
  title: string;
  displayGroup?: string;
  courseSummary?: string | null;
  outcomes: Array<{ studentText: string }>;
}

/**
 * Sociology's primary course-to-theme map was reviewed against the Sociology
 * course titles, contents and outcomes in the NUC Social Sciences CCMAS 2023.
 * The code is a stable source identity, not learner-facing text. Each course
 * appears once in the overview; source outcomes remain grouped under their
 * course within the selected theme. Theme assignment is presentation only.
 */
export const SOCIOLOGY_REVIEWED_THEME_BY_CODE: Readonly<Record<string, ProgrammeThemeKey>> = {
  "SOC 101": "ideas",
  "SOC 102": "people",
  "SOC 103": "african_societies",
  "SOC 104": "people",
  "SOC 105": "ideas",
  "SOC 106": "ideas",
  "SOC 201": "ideas",
  "SOC 202": "social_change",
  "SOC 203": "people",
  "SOC 205": "applied_practice",
  "SOC 206": "african_societies",
  "SOC 209": "people",
  "SOC 210": "social_issues",
  "SOC 301": "research",
  "SOC 302": "social_issues",
  "SOC 303": "social_issues",
  "SOC 305": "governance",
  "SOC 306": "governance",
  "SOC 401": "ideas",
  "SOC 403": "african_societies",
  "SOC 406": "research",
  "SOC 407": "social_change",
  "SOC 408": "research",
  "SSC 202": "technology",
  "SSC 301": "applied_practice",
  "SSC 302": "research",
  "SSC 401": "research",
  "PSY 204": "people",
  "GST 111": "shared_communication",
  "GST 112": "shared_nigerian_culture",
  "GST 212": "shared_philosophy",
  "GST 312": "shared_peace_conflict",
  "ENT 211": "shared_enterprise",
  "ENT 312": "shared_enterprise",
};

/**
 * Sociology assignments use the explicit source-reviewed map above. Other
 * programmes are not assigned Sociology themes by keyword similarity; their
 * records stay in the neutral core bucket until they have their own review.
 */
export function programmeThemeForCourse(course: ProgrammeThemeCourse): ProgrammeThemeKey {
  const code = String(course.code ?? "").trim().toUpperCase();
  if (course.displayGroup === "shared_university") return SOCIOLOGY_REVIEWED_THEME_BY_CODE[code] ?? "core";
  if (!["sociology_programme", "supporting_social_sciences"].includes(course.displayGroup ?? "")) return "core";
  return SOCIOLOGY_REVIEWED_THEME_BY_CODE[code] ?? "core";
}
