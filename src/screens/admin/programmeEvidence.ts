import type { ProgrammeResourceEvidence } from "@/types/institution";

const EXPECTATION_KINDS = new Set(["skill", "competency", "tool", "certification"]);
const CONFIRMED_DATA_STATES = new Set(["source_backed", "verified", "approved"]);

function hasRetainedLocator(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasRetainedLocator);
  if (value && typeof value === "object") return Object.values(value).some(hasRetainedLocator);
  return false;
}

/** Fail closed: taxonomy reach or a generic link is not enough to call an item an expectation. */
export function hasItemSpecificExpectationEvidence(resource: ProgrammeResourceEvidence): boolean {
  return resource.marketState === "market_practice_evidence"
    && (resource.evidenceState === "verified" || resource.evidenceState === "approved")
    && CONFIRMED_DATA_STATES.has((resource.dataState ?? "").toLocaleLowerCase())
    && (
      hasRetainedLocator(resource.sourceLocator)
      || hasRetainedLocator(resource.sourceLocators)
      || hasRetainedLocator(resource.sourceReferences)
    );
}

export function isConfirmedExpectationGap(resource: ProgrammeResourceEvidence): boolean {
  return resource.state === "bridge"
    && EXPECTATION_KINDS.has(resource.kind)
    && hasItemSpecificExpectationEvidence(resource);
}
