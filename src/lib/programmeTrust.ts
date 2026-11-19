/**
 * Trust summary for a programme/university requirement record.
 *
 * Reads only what the existing payload already carries: the requirement
 * evidence status, the parse status, the source label/file and the parse
 * timestamp. Nothing here invents a date or a source URL.
 */
import type { JambProgrammeRequirements, JambProgrammeSchool } from "./careerData";
import { studentSafeUrl } from "./studentCareerBoundary";

export type TrustStatus = "verified" | "needs_confirmation" | "not_available";

export interface ProgrammeTrust {
  status: TrustStatus;
  statusLabel: "Verified" | "Needs confirmation" | "Not available";
  /** Source recorded on the payload (label, else file name). */
  sourceLabel?: string;
  /** Formatted date from the payload's parse timestamp, when present. */
  recordedOn?: string;
  /** https URL carried by the payload's source evidence, when present. */
  officialSourceUrl?: string;
}

const LABEL: Record<TrustStatus, ProgrammeTrust["statusLabel"]> = {
  verified: "Verified",
  needs_confirmation: "Needs confirmation",
  not_available: "Not available",
};

function formatDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

export function programmeTrust(
  requirements?: JambProgrammeRequirements | null,
  school?: JambProgrammeSchool | null,
): ProgrammeTrust {
  const evidence = (requirements?.sourceEvidence ?? []).filter((row) => row.layer !== "direct_entry");
  const statuses = [school?.universityRequirementStatus, requirements?.requirementStatus].filter(Boolean) as string[];
  const needsReview =
    requirements?.parseStatus === "needs_review" ||
    school?.universityExceptionStatus === "needs_confirmation" ||
    statuses.includes("review_only");

  let status: TrustStatus;
  if (!requirements && !school) status = "not_available";
  else if (needsReview) status = "needs_confirmation";
  else if (statuses.length && statuses.every((value) => value === "source_missing")) status = "not_available";
  else if (statuses.includes("complete")) status = "verified";
  else status = "not_available";

  const first = evidence.find((row) => row.sourceLabel || row.sourceFile);
  const urlRow = evidence
    .map((row) => studentSafeUrl((row as { sourceUrl?: string | null }).sourceUrl))
    .find(Boolean);

  return {
    status,
    statusLabel: LABEL[status],
    sourceLabel: first?.sourceLabel || first?.sourceFile || undefined,
    recordedOn: formatDate(requirements?.parsedAt),
    officialSourceUrl: urlRow,
  };
}
