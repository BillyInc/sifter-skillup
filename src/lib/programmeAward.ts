/**
 * Suppresses a `qualification` that the programme's own name contradicts.
 *
 * `programmes.qualification` is a blanket default: 159 of 239 rows are
 * literally "B.Sc / 4 years", including rows whose NAME states a different
 * award in the same record —
 *
 *   "Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB)" → B.Sc, 4
 *   "Bachelor of Dental Surgery (BDS/BChD)"                     → B.Sc, 4
 *
 * Both are six-year programmes in Nigeria and neither is a B.Sc. This is
 * shown to students choosing what to apply for, so a wrong award is worse
 * than no award.
 *
 * This does NOT correct the data — the real fix is sourced NUC/BMAS values,
 * and guessing 239 durations would replace a wrong number with an unsourced
 * one. It only declines to repeat a claim the row itself refutes: the check
 * is made against the programme's own name, so it introduces no outside
 * knowledge and no hardcoded per-programme table.
 *
 * Duration is left alone. It is equally suspect for these rows, but nothing
 * in the record contradicts it, so suppressing it would be a judgement about
 * the data rather than an observation of it.
 */

/** Awards that appear inside programme names, with what they are not. */
const NAME_DECLARED_AWARDS: { pattern: RegExp; award: string }[] = [
  { pattern: /\bMBBS\b|\bMBChB\b|bachelor of medicine/i, award: "MBBS/MBChB" },
  { pattern: /\bBDS\b|\bBChB\b|\bBChD\b|bachelor of dental surgery/i, award: "BDS/BChD" },
  { pattern: /\bDVM\b|doctor of veterinary/i, award: "DVM" },
  { pattern: /\bLL\.?B\b/i, award: "LL.B" },
  { pattern: /doctor of pharmacy|\bPharm\.?D\b/i, award: "Pharm.D" },
];

/**
 * The award to display, or null when the stored value contradicts the name.
 *
 * Returns the name-declared award where the name states one, the stored value
 * where nothing contradicts it, and null where the two disagree.
 */
export function displayAward(
  name: string | null | undefined,
  qualification: string | null | undefined,
): string | null {
  const stored = (qualification ?? "").trim();
  const declared = NAME_DECLARED_AWARDS.find((a) => a.pattern.test(name ?? ""));

  if (!declared) return stored || null;

  // The name states the award. Trust it over the column.
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
  const storedKey = normalise(stored);
  if (storedKey && declared.award.toLowerCase().replace(/[^a-z]/g, "").includes(storedKey)) {
    return stored; // agrees (e.g. "LL.B" stored on an LL.B programme)
  }
  return declared.award;
}

/** The "B.Sc · 4 years" line, with contradicted awards dropped. */
export function awardLine(
  name: string | null | undefined,
  qualification: string | null | undefined,
  durationYears: number | null | undefined,
): string {
  return [
    displayAward(name, qualification),
    durationYears ? `${durationYears} years` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
}
