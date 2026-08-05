/**
 * Display guard for scraped admission-requirement text.
 *
 * Garbled source data (run-together words, mojibake, literal escape
 * sequences) must never reach the UI; callers should swap in the
 * matching `requirementFallbackText` placeholder instead. Text that is
 * merely HTML-entity-encoded is fine — it gets decoded before display.
 */

export type RequirementField =
  | "utme_subjects"
  | "olevel_requirement"
  | "direct_entry"
  | "cutoff";

export interface SanitizedRequirementText {
  displayable: boolean;
  cleaned: string;
  issue?: "empty" | "garbled";
}

/** Lowercase letter immediately followed by uppercase, or a 25+ letter run. */
const RUN_TOGETHER_PATTERN = /[a-z][A-Z]|[a-zA-Z]{25,}/;

/** Mojibake fragments and literal \u00 escape sequences from bad scrapes. */
const ENCODING_ARTIFACT_PATTERN = /â€|Ã¢|Ã©|\\u00/;

const HTML_ENTITY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/&amp;/g, "&"],
  [/&rsquo;/g, "'"],
  [/&lsquo;/g, "'"],
  [/&#39;/g, "'"],
  [/&ldquo;/g, '"'],
  [/&rdquo;/g, '"'],
  [/&quot;/g, '"'],
  [/&ndash;/g, "–"],
  [/&mdash;/g, "—"],
  [/&nbsp;/g, " "],
];

/** Numeric character references: &#8217; (decimal) and &#x2019; (hex). */
const NUMERIC_ENTITY_PATTERN = /&#([xX][0-9a-fA-F]+|\d+);/g;

function decodeNumericEntities(text: string): string {
  return text.replace(NUMERIC_ENTITY_PATTERN, (match, ref: string) => {
    const codePoint =
      ref[0] === "x" || ref[0] === "X"
        ? parseInt(ref.slice(1), 16)
        : parseInt(ref, 10);
    if (!Number.isFinite(codePoint) || codePoint > 0x10ffff) return match;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return match;
    }
  });
}

const REQUIREMENT_FALLBACK_TEXT: Record<RequirementField, string> = {
  utme_subjects:
    "Check JAMB IBASS brochure for subject combinations for this programme.",
  olevel_requirement:
    "Check JAMB IBASS brochure for O'Level credit requirements for this programme.",
  direct_entry:
    "Check individual university for Direct Entry requirements for this programme.",
  cutoff: "Check university website for current cut-off mark.",
};

export function sanitizeRequirementText(
  text: string | null,
): SanitizedRequirementText {
  if (text === null || text.trim() === "") {
    return { displayable: false, cleaned: "", issue: "empty" };
  }

  if (ENCODING_ARTIFACT_PATTERN.test(text) || RUN_TOGETHER_PATTERN.test(text)) {
    return { displayable: false, cleaned: "", issue: "garbled" };
  }

  let cleaned = text;
  for (const [pattern, replacement] of HTML_ENTITY_REPLACEMENTS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  cleaned = decodeNumericEntities(cleaned);

  return { displayable: true, cleaned: cleaned.trim() };
}

export function requirementFallbackText(field: RequirementField): string {
  return REQUIREMENT_FALLBACK_TEXT[field];
}
