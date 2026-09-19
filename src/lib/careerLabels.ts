/** Student-facing labels for source taxonomy names. Keep the raw value in the
 * API for staff evidence, but make display names readable in cards and routes.
 */
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
      if (lower === "spss") return "SPSS";
      if (lower === "sql") return "SQL";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
  return trailingSchool ? `${formatted} (${trailingSchool[1].replace(/\b\w/g, (letter) => letter.toUpperCase())})` : formatted;
}
