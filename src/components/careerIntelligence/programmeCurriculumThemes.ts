export type ProgrammeThemeKey = "core" | "shared" | "people" | "ideas" | "research" | "technology" | "application";

export interface ProgrammeThemeCourse {
  title: string;
  displayGroup?: string;
  courseSummary?: string | null;
  outcomes: Array<{ studentText: string }>;
}

/**
 * Selects a presentation theme without treating the Sociology contract as a
 * programme-wide default. Generic programme_core rows stay source-honest in
 * the core bucket; thematic heuristics are reserved for the explicitly
 * reviewed Sociology display groups.
 */
export function programmeThemeForCourse(course: ProgrammeThemeCourse): ProgrammeThemeKey {
  if (course.displayGroup === "shared_university") return "shared";
  if (!["sociology_programme", "supporting_social_sciences"].includes(course.displayGroup ?? "")) return "core";

  const titleText = `${course.title} ${course.courseSummary ?? ""}`.toLowerCase();
  const outcomeText = course.outcomes.slice(0, 3).map((item) => item.studentText).join(" ").toLowerCase();
  const text = `${titleText} ${outcomeText}`;
  if (/(research|method|survey|statistics|data|project|proposal|fieldwork|investigat|evidence|analysis)/.test(text)) return "research";
  if (/(computer|computing|digital|information|internet|application|software|technology)/.test(text)) return "technology";
  if (/(communication|presentation|report|essay|entrepreneur|peace|conflict|practice|apply|solution|development)/.test(text)) return "application";
  if (/(theor|philosoph|history|concept|thought|foundation|principle)/.test(text)) return "ideas";
  return "people";
}
