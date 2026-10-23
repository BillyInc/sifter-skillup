/** Return only a distinct learner deliverable from combined task/output copy.
 * When the source does not distinguish an output from the task, do not repeat
 * the task as if it were a second deliverable.
 */
export function studentOutputCopy(expectedOutput?: string | null, contextualUse?: string | null): string {
  let expected = String(expectedOutput ?? "").replace(/\s+/g, " ").trim();
  const contextual = String(contextualUse ?? "").replace(/\s+/g, " ").trim();
  const outputMarker = /\b(?:A defensible output is|Output(?:\s+(?:includes?|should|is|may|would))?)\s*:?\s*/i;
  const initialMarker = outputMarker.exec(expected);
  if (initialMarker?.index !== undefined) {
    const outputStart = initialMarker.index + initialMarker[0].length;
    const trailingNotes = expected.slice(outputStart).search(/\b(?:Task|Guardrail|Route note)\s*:/i);
    if (trailingNotes >= 0) expected = expected.slice(0, outputStart + trailingNotes);
  }
  const marker = outputMarker.exec(expected);
  if (marker && marker.index !== undefined) {
    return expected.slice(marker.index + marker[0].length).replace(/^[\s:;,.\-–—]+/, "").trim();
  }
  if (expected && expected.toLocaleLowerCase() !== contextual.toLocaleLowerCase()) {
    if (/\b(?:Task|Guardrail|Route note)\s*:/i.test(expected)) return "";
    return expected;
  }
  const contextualMarker = /\bOutput(?:,\s*if evidenced later)?\s*:\s*/i.exec(contextual);
  if (contextualMarker?.index !== undefined) {
    return contextual
      .slice(contextualMarker.index + contextualMarker[0].length)
      .split(/\b(?:Task|Guardrail|Route note)\s*:/i, 1)[0]
      .replace(/^[\s:;,.-]+/, "")
      .trim();
  }
  return "";
}

export function studentContextSections(value?: string | null) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  const markers = [...text.matchAll(/\b(Route note|Task|Output|Guardrail)\s*:/gi)];
  const meaning = markers.length ? text.slice(0, markers[0].index).trim() : text;
  const sections: Record<string, string> = {};
  markers.forEach((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = markers[index + 1]?.index ?? text.length;
    const kind = match[1].toLowerCase();
    if (kind !== "route note") sections[kind] = text.slice(contentStart, contentEnd).trim();
  });
  return { meaning, task: sections.task, output: sections.output, guardrail: sections.guardrail };
}

const TECHNICAL_GLOSSES: Array<[RegExp, string]> = [
  [/\bcomputational and digital social science\b/i, "computational and digital social science (using computers to study how people live, talk and organise)"],
  [/\bnatural language processing\b/i, "natural language processing (a computer reading and sorting human language)"],
  [/\bmachine learning\b/i, "machine learning (a computer finding patterns in examples, then using those patterns on new cases)"],
  [/\blogistic regression\b/i, "logistic regression (a way to estimate the chance of a yes-or-no result)"],
  [/\bparticipant observation\b/i, "participant observation (learning by joining the setting and watching what people do)"],
  [/\bdiscourse analysis\b/i, "discourse analysis (studying how people use language in a particular setting)"],
  [/\bstatistical significance\b/i, "statistical significance (a result that is unlikely to be only chance)"],
  [/\bmixed methods\b/i, "mixed methods (using both numbers and people's accounts in one study)"],
  [/\bfocus groups?\b/i, "focus group (a guided discussion with a small group)"],
  [/\btriangulation\b/i, "triangulation (checking a finding with more than one kind of evidence)"],
  [/\bchi-square\b/i, "chi-square (a check on whether counts in categories fit a pattern, or whether two groupings go together)"],
  [/\bregression\b/i, "regression (a way to see how one measure moves when another measure changes)"],
  [/\bethnography\b/i, "ethnography (learning about a group by spending time with them and watching everyday life)"],
  [/\bcorrelation\b/i, "correlation (two things changing together, which does not by itself prove that one causes the other)"],
  [/\bhypothesis\b/i, "hypothesis (a clear idea you can test)"],
  [/\balgorithms?\b/i, "algorithm (a set of steps a computer follows)"],
  [/\bANOVA\b/, "ANOVA (a check on whether the averages of several groups differ)"],
  [/\bt-tests?\b/i, "t-test (a check on whether two group averages differ)"],
  [/\bSPSS\b/, "SPSS (a computer program used to calculate statistics)"],
  [/\bbig data\b/i, "big data (very large sets of digital records)"],
  [/\bquantitative\b/i, "quantitative (working with numbers and counts)"],
  [/\bqualitative\b/i, "qualitative (working with words, experiences and meaning)"],
  [/\bcomputational\b/i, "computational (using a computer to study people and society)"],
];

/** The first time a technical word appears, add a short plain-English meaning. */
export function explainTechnicalTerms(value: string): string {
  let text = value;
  for (const [pattern, gloss] of TECHNICAL_GLOSSES) {
    text = text.replace(pattern, (match, offset: number, whole: string) => {
      const after = whole.slice(offset + match.length);
      if (/^\s*\(/.test(after) || /^\s+\S+\s*,\s*which\b/i.test(after)) return match;
      return gloss;
    });
  }
  return text;
}

/** Remove known staff-only placement language before narration is displayed.
 * This is a presentation safeguard, not a replacement for reviewed source copy.
 */
export function studentFacingCopy(value?: string | null): string {
  if (!value) return "";
  return explainTechnicalTerms(value
    .split(/\s*(?:Route note|Task|Guardrail|No programme mapping claimed|Not claimed as programme outcome|Programme mapping is not asserted|No programme-specific transfer is asserted)\s*:/i)[0]
    .replace(/(?:No programme mapping claimed|Not claimed as programme outcome|Programme mapping is not asserted|No programme-specific transfer is asserted)[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/\b(?:shared foundation candidate|area[- ]specific enrichment candidate|domain learning option|deferred emerging conditional extension)\b[^.!?]*(?:[.!?]|$)/gi, "")
    // These words may appear as an internal status prefix in legacy records.
    // Strip only that leading label, not learner-facing prose explaining why an
    // optional edge may help. Unicode escapes keep this reliable across editors.
    .replace(/^\s*(?:useful additional edge\s*(?:[:\u00B7|\u2014\u2013-]\s*)?)+/i, "")
    .replace(/\b(?:conditional foundation when a route handles research data|conditional responsibility for research or sensitive data)\b/gi, "")
    .replace(/\b(?:route note|task|guardrail)\s*:/gi, "")
    .replace(/\b(?:show within|show only within|show only in)\b[^.!?]*(?:[.!?]|$)/gi, "")
    .replace(/^[\s\u00B7|\u2014\u2013-]+|[\s\u00B7|\u2014\u2013-]+$/g, "")
    .replace(/[\uFFFD\u00C2\u00E2]+/g, "")
    .replace(/\s+/g, " ")
    .trim());
}

/** Suppress an internal disposition explanation rather than showing it as
 * learner rationale. The caller can then use its ordinary, neutral fallback.
 */
export function studentReasonCopy(value?: string | null): string {
  const copy = studentFacingCopy(value);
  return /\b(candidate|enrichment|deferred|display scope|route note|student scope|placement|taxonomy)\b/i.test(copy)
    ? ""
    : copy;
}

/** Give each attached learning link a learner-facing reason without claiming
 * that the resource teaches more than its reviewed attachment supports. */
export function studentResourceRationale(
  rationale: string | null | undefined,
  itemName: string,
  contextualUse?: string | null,
  locator?: string | null,
): string {
  const cleanReason = studentFacingCopy(rationale);
  if (cleanReason && cleanReason.split(/\s+/).length >= 18) return cleanReason;

  const use = studentFacingCopy(studentContextSections(contextualUse).meaning);
  const cleanLocator = studentFacingCopy(locator);
  const attachedFor = cleanReason
    ? `This resource is attached to help you learn or review ${cleanReason.replace(/[.!?]+$/, "")}.`
    : `This resource is attached as a place to learn or read more about ${itemName}.`;
  const routeFit = use
    ? "It supports the work explained above, but it may cover only part of that work."
    : `Use it alongside the explanation for ${itemName}; it may cover only part of the work.`;
  const startAt = cleanLocator ? `A useful place to start is ${cleanLocator}.` : "";
  return [attachedFor, routeFit, startAt, "A learning link is not proof that you can already do the work or a substitute for practice."]
    .filter(Boolean)
    .join(" ");
}

/** Explain the scope of the evidence without implying that local rules or
 * working conditions are identical across places. */
export function studentGeographicContext(scope?: "nigeria" | "global" | "nigeria_to_global" | null): string {
  if (scope === "nigeria") {
    return "The evidence is grounded in Nigerian sources or application. Details may still differ across states, institutions and employers.";
  }
  if (scope === "global") {
    return "The evidence is international. Apply it in Nigeria only where local rules, data and working conditions fit.";
  }
  if (scope === "nigeria_to_global") {
    return "The evidence includes a Nigerian connection and places it in a wider field context. Practices and rules can still differ by place.";
  }
  return "The geographic scope of the evidence has not been specified.";
}

/** Keep the learner-facing limit section present without inventing a
 * task-specific restriction when the reviewed record has no limit text. */
export function studentItemLimitations(
  limitations?: readonly (string | null | undefined)[] | null,
): string[] {
  const reviewed = (limitations ?? []).map(studentFacingCopy).filter(Boolean);
  if (reviewed.length) return reviewed;
  return [
    "No item-specific limitation is recorded. Seeing this item in your learning path does not show that you have mastered it. Where the work requires a qualification, permission or supervision, this learning item does not replace it.",
  ];
}
