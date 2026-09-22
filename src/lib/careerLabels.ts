/** Student-facing labels for source taxonomy names. Keep the raw value in the
 * API for staff evidence, but make display names readable in cards and routes.
 */
const DISPLAY_ACRONYMS: Record<string, string> = {
  ai: "AI",
  api: "API",
  gis: "GIS",
  hr: "HR",
  ict: "ICT",
  pr: "PR",
  sql: "SQL",
  spss: "SPSS",
  stem: "STEM",
  ui: "UI",
  ux: "UX",
};

export function formatCareerLabel(value: string | null | undefined): string {
  const raw = String(value ?? "").trim().replace(/[\u005f-]+/g, " ").replace(/\s+/g, " ");
  if (!raw) return "";
  const trailingSchool = /\b(secondary school|primary school|tertiary institution)$/i.exec(raw);
  const base = trailingSchool ? raw.slice(0, trailingSchool.index).trim() : raw;
  const formatted = base
    .split(" ")
    .map((word) => {
      const lower = word.toLowerCase();
      if (["and", "of", "the", "in", "for"].includes(lower)) return lower;
      if (DISPLAY_ACRONYMS[lower]) return DISPLAY_ACRONYMS[lower];
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
  return trailingSchool ? `${formatted} (${trailingSchool[1].replace(/\b\w/g, (letter) => letter.toUpperCase())})` : formatted;
}

export type StudentSummaryInput = {
  shortIntro?: string | null;
  whatPeopleDo?: string | null;
  whatItStudies?: string | null;
  description?: string | null;
  fallback: string;
};

/**
 * Entry-card copy is deliberately short and data-derived. It may clarify a
 * technical title, but it never changes the canonical ID or invents a richer
 * explanation when the API has not supplied one.
 */
export function studentSummary(input: StudentSummaryInput, maxLength = 190): string {
  const candidate = [input.shortIntro, input.whatPeopleDo, input.whatItStudies, input.description]
    .map((value) => String(value ?? "").replace(/\s+/g, " ").trim())
    .find(Boolean);
  if (!candidate) return input.fallback;
  if (candidate.length <= maxLength) return candidate;
  const sentence = candidate.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${sentence || candidate.slice(0, maxLength).trim()}…`;
}
