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

/** Remove known staff-only placement language before narration is displayed.
 * This is a presentation safeguard, not a replacement for reviewed source copy.
 */
export function studentFacingCopy(value?: string | null): string {
  if (!value) return "";
  return value
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
    .trim();
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
