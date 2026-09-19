/**
 * Admin-only evidence and student-exposure contract.
 *
 * This is deliberately stricter than the student renderer. Admins may inspect
 * incomplete evidence, but a record is student-backed only after an explicit
 * approval state, a source URL or locator, and an access date are present.
 * No name similarity or aggregate relationship is enough to pass this gate.
 */

export type AdminEvidenceState =
  | "verified"
  | "approved"
  | "review_required"
  | "no_link"
  | "not_established"
  | "audit_only"
  | "unavailable";

export type AdminGuidanceLevel = "programme" | "domain" | "subgroup" | "role";
export type AdminGuidanceOwner =
  | AdminGuidanceLevel
  | "role_aggregated"
  | "review_only"
  | "audit_only";
export type AdminGuidanceItemType =
  | "skill"
  | "tool"
  | "competency"
  | "certification"
  | "resource"
  | "relationship";

export interface AdminGuidanceEvidenceRecord {
  id: string;
  name: string;
  level: AdminGuidanceLevel;
  itemType: AdminGuidanceItemType;
  /** Stable context identity from the API/SQL contract; never infer this from a display name. */
  contextKey?: string | null;
  /** Programme identity for downstream admin views and stale-route detection. */
  programmeKey?: string | null;
  guidanceOwner?: AdminGuidanceOwner | null;
  programmeName?: string;
  contextName?: string;
  sourceUrl?: string | null;
  sourceLocator?: string | null;
  sourceAccessedAt?: string | null;
  evidenceState: AdminEvidenceState;
  evidenceNote?: string | null;
}

export interface AdminEvidenceDecision {
  allowed: boolean;
  reason: string;
}

export type AdminEvidenceQueueState =
  | "student_ready"
  | "awaiting_approval"
  | "review_required"
  | "no_link"
  | "not_established"
  | "audit_only"
  | "unavailable"
  | "identity_incomplete"
  | "provenance_incomplete";

const NEVER_STUDENT_BACKED = new Set<AdminEvidenceState>([
  "review_required",
  "no_link",
  "not_established",
  "audit_only",
  "unavailable",
]);

function hasSourceTrace(record: AdminGuidanceEvidenceRecord): boolean {
  return Boolean(record.sourceUrl?.trim() || record.sourceLocator?.trim());
}

function hasStableContextIdentity(record: AdminGuidanceEvidenceRecord): boolean {
  return Boolean(record.contextKey?.trim());
}

function hasMatchingOwner(record: AdminGuidanceEvidenceRecord): boolean {
  return record.guidanceOwner === record.level;
}

function identityDecision(record: AdminGuidanceEvidenceRecord): AdminEvidenceDecision {
  if (!hasStableContextIdentity(record)) {
    return {
      allowed: false,
      reason: "A stable context key is required before evidence can enter student review.",
    };
  }
  if (!record.guidanceOwner) {
    return {
      allowed: false,
      reason: "An explicit guidance owner is required before evidence can enter student review.",
    };
  }
  if (!hasMatchingOwner(record)) {
    return {
      allowed: false,
      reason: `The ${record.guidanceOwner} row cannot be approved for the ${record.level} context.`,
    };
  }
  return { allowed: true, reason: "Stable context identity and matching ownership recorded." };
}

/**
 * Returns the durable admin queue state without promoting or hiding a row.
 * This is intentionally usable by an admin queue and by tests without a
 * database write. Missing identity/provenance is a visible blocked state.
 */
export function adminEvidenceQueueState(
  record: AdminGuidanceEvidenceRecord,
): AdminEvidenceQueueState {
  if (record.evidenceState === "review_required") return "review_required";
  if (record.evidenceState === "no_link") return "no_link";
  if (record.evidenceState === "not_established") return "not_established";
  if (record.evidenceState === "audit_only") return "audit_only";
  if (record.evidenceState === "unavailable") return "unavailable";
  if (!identityDecision(record).allowed) return "identity_incomplete";
  if (!hasSourceTrace(record) || !record.sourceAccessedAt?.trim()) {
    return "provenance_incomplete";
  }
  return record.evidenceState === "approved" ? "student_ready" : "awaiting_approval";
}

/**
 * A reviewer may approve only a verified record with traceable evidence.
 * Review-required/no-link/not-established/audit-only states are intentionally
 * blocked rather than silently promoted.
 */
export function canApproveForStudent(
  record: AdminGuidanceEvidenceRecord,
): AdminEvidenceDecision {
  if (NEVER_STUDENT_BACKED.has(record.evidenceState)) {
    return {
      allowed: false,
      reason: `${record.evidenceState} records cannot be approved as student-backed evidence.`,
    };
  }
  const identity = identityDecision(record);
  if (!identity.allowed) return identity;
  if (record.evidenceState !== "verified") {
    return {
      allowed: false,
      reason: "Only explicitly verified records can enter approval review.",
    };
  }
  if (!hasSourceTrace(record)) {
    return {
      allowed: false,
      reason: "A source URL or locator is required before approval.",
    };
  }
  if (!record.sourceAccessedAt?.trim()) {
    return {
      allowed: false,
      reason: "Record the source access date before approval.",
    };
  }
  return { allowed: true, reason: "Ready for an authorised reviewer to approve." };
}

/**
 * Student exposure is a separate decision from admin review. A verified row
 * is still not student-facing until the persisted state is explicitly
 * `approved` and its provenance remains inspectable.
 */
export function canExposeToStudents(
  record: AdminGuidanceEvidenceRecord,
): AdminEvidenceDecision {
  if (NEVER_STUDENT_BACKED.has(record.evidenceState)) {
    return {
      allowed: false,
      reason: `${record.evidenceState} records must remain admin/source-audit only.`,
    };
  }
  const identity = identityDecision(record);
  if (!identity.allowed) return identity;
  if (record.evidenceState !== "approved") {
    return {
      allowed: false,
      reason: "Student exposure requires an explicit approved evidence state.",
    };
  }
  if (!hasSourceTrace(record)) {
    return {
      allowed: false,
      reason: "Approved student evidence must retain a source URL or locator.",
    };
  }
  if (!record.sourceAccessedAt?.trim()) {
    return {
      allowed: false,
      reason: "Approved student evidence must retain the source access date.",
    };
  }
  return { allowed: true, reason: "Approved student-backed evidence." };
}

function asText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function evidenceStateFrom(value: unknown): AdminEvidenceState {
  const state = String(value ?? "").trim().toLowerCase();
  if (state === "approved" || state === "verified") return state;
  if (state === "no_link" || state === "no-link") return "no_link";
  if (state === "not_established" || state === "not-established") return "not_established";
  if (state === "audit_only" || state === "audit-only") return "audit_only";
  if (state === "unavailable") return "unavailable";
  return "review_required";
}

/**
 * Normalises the future API's snake_case/camelCase variants without making an
 * implicit approval decision. Missing evidence metadata remains review_required.
 */
export function normaliseAdminGuidanceEvidence(
  raw: Record<string, unknown>,
  fallback: Partial<AdminGuidanceEvidenceRecord> = {},
): AdminGuidanceEvidenceRecord {
  const evidenceState = evidenceStateFrom(
    raw.evidenceState ?? raw.evidence_state ?? raw.reviewState ?? raw.review_state ?? raw.dataState,
  );
  const level = String(raw.level ?? raw.contextLevel ?? raw.context_level ?? fallback.level ?? "domain");
  const itemType = String(raw.itemType ?? raw.item_type ?? raw.kind ?? fallback.itemType ?? "resource");
  return {
    id: asText(raw.id ?? raw.itemId ?? raw.item_id) ?? fallback.id ?? "unidentified-guidance-item",
    name: asText(raw.name ?? raw.title ?? raw.label) ?? fallback.name ?? "Unnamed guidance item",
    level: (["programme", "domain", "subgroup", "role"].includes(level) ? level : "domain") as AdminGuidanceLevel,
    itemType: (["skill", "tool", "competency", "certification", "resource", "relationship"].includes(itemType) ? itemType : "resource") as AdminGuidanceItemType,
    contextKey: asText(raw.contextKey ?? raw.context_key ?? raw.contextId ?? raw.context_id) ?? fallback.contextKey ?? null,
    programmeKey: asText(raw.programmeKey ?? raw.programme_key ?? raw.programmeId ?? raw.programme_id) ?? fallback.programmeKey ?? null,
    guidanceOwner: (asText(raw.guidanceOwner ?? raw.guidance_owner ?? raw.owner) ?? fallback.guidanceOwner ?? null) as AdminGuidanceOwner | null,
    programmeName: asText(raw.programmeName ?? raw.programme_name) ?? fallback.programmeName,
    contextName: asText(raw.contextName ?? raw.context_name ?? raw.scopeName ?? raw.scope_name) ?? fallback.contextName,
    sourceUrl: asText(raw.sourceUrl ?? raw.source_url ?? raw.url) ?? fallback.sourceUrl ?? null,
    sourceLocator: asText(raw.sourceLocator ?? raw.source_locator ?? raw.locator) ?? fallback.sourceLocator ?? null,
    sourceAccessedAt: asText(raw.sourceAccessedAt ?? raw.source_accessed_at ?? raw.accessedAt ?? raw.accessed_at ?? raw.observedAt ?? raw.observed_at) ?? fallback.sourceAccessedAt ?? null,
    evidenceState,
    evidenceNote: asText(raw.evidenceNote ?? raw.evidence_note ?? raw.reason) ?? fallback.evidenceNote ?? null,
  };
}
