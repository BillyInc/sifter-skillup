/**
 * Institutional / administrator data contract.
 *
 * The institutional side delivers labour-market *intelligence* (aggregate
 * programme → domain → demand for an institution's programme mix) and a gated
 * *management* capability. Two hard rules baked into these types:
 *  - Institutional Intelligence is AGGREGATE and carries NO student PII.
 *  - Individual student visibility is consent-gated (aggregate-only until a
 *    guardian consents) — see {@link StudentConsent}.
 *
 * Like the student-side contract (src/types/career.ts), no data ships yet:
 * adminData returns `coming_soon` envelopes and screens render gracefully.
 */
import type {
  DataMeta,
  DomainMatchType,
  InstitutionType as AcademicInstitutionType,
} from "./career";

export type { DataMeta };

// ─── Accounts & organisations ─────────────────────────────────
export type AccountType = "student" | "educator" | "institution_admin";

/** The kind of organisation an educator represents. */
export type OrganizationType =
  | "secondary_school"
  | "university"
  | "tutorial_centre" // tutorial centre / JAMB lesson provider (provider/session only)
  | "jamb_cafe";

/** Role of a member within an organisation (drives scope, not built out yet). */
export type OrgRole =
  | "owner"
  | "counsellor" // secondary-school guidance & counselling officer
  | "course_advisor"
  | "hod"
  | "dean";

/** Tiered identity assurance. Real verification logic lands with data/ops. */
export type VerificationStatus =
  | "unverified" // T0 — self-declared; national aggregate only
  | "claimed" // T1 — claimed an institution; awaiting proof
  | "pending" // proof submitted; under review
  | "verified" // T2 — verified org member
  | "rejected";

export type VerificationMethod =
  | "email_domain"
  | "document_upload"
  | "cac_registration"
  | "registry_match"
  | "manual";

export interface Organization {
  id: string;
  type: OrganizationType;
  name: string;
  /** Registry anchors (which apply depends on type). */
  jambCode?: string; // JAMB/CAPS institution code (universities)
  nucCode?: string; // NUC accreditation (universities)
  moeApprovalNo?: string; // state Ministry of Education approval (sec. schools)
  cacNo?: string; // CAC business registration (centres/cafés)
  state?: string;
  verificationStatus: VerificationStatus;
  verificationMethod?: VerificationMethod;
  /** True for tutorial_centre/jamb_cafe: provider/session only, never a roster. */
  providerSessionOnly?: boolean;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  seatStatus: "invited" | "active" | "suspended";
}

/** The educator's own onboarding/profile (persisted locally for now). */
export interface EducatorProfile {
  accountType: Exclude<AccountType, "student">;
  organizationType: OrganizationType;
  organizationName?: string;
  /** Set once an org record exists; before that the claim is free-text. */
  organizationId?: string;
  role: OrgRole;
  workEmail?: string;
  /** Registry anchor entered at onboarding (JAMB/NUC/MoE/CAC, per org type). */
  registryCode?: string;
  /** True for tutorial_centre/jamb_cafe — provider/session only, no roster. */
  providerSessionOnly?: boolean;
  verificationStatus: VerificationStatus;
  verificationMethod?: VerificationMethod;
  completedAt?: string;
}

// ─── Student affiliation & consent (the gate) ─────────────────
/** A SELF-REPORTED link from a student to an org via the school code. Powers
 *  attribution + aggregate analytics only — never individual visibility. */
export interface StudentAffiliation {
  id: string;
  studentId: string;
  organizationId: string;
  source: "school_code";
  selfReported: true;
  createdAt: string;
}

/** The consent that would unlock individual visibility. Built but kept gated:
 *  aggregate-only until `grantedBy: 'guardian'` (minors) is recorded. */
export interface StudentConsent {
  id: string;
  studentId: string;
  organizationId: string;
  scope: "progress" | "contact" | "full";
  grantedBy: "self" | "guardian";
  grantedAt?: string;
  revokedAt?: string;
}

// ─── Provisioning: drafts → review grid → generate → roster ───
export type ProvisioningStream = "science" | "art" | "commercial";

/** A staged student row in the assisted-import review grid, before any account
 *  is minted. Extracted (vision) or manually entered; the educator corrects it. */
export interface ProvisionDraft {
  id: string;
  fullName?: string | null;
  studentClass?: string | null;
  stream?: ProvisioningStream | null;
  needsReview: boolean;
  guardianConsent: boolean;
  guardianName?: string | null;
  status: "draft" | "generated" | "discarded";
}

/** The career direction picked from the (in-memory) mapping — the only derived
 *  data that persists. Subjects/grades that produced it are never stored. */
export interface ChosenDirection {
  domainKey?: string;
  roleKey?: string;
  programmeId?: string;
}

/** A minted provisioned account + its printable claim code. */
export interface GeneratedStudent {
  userId: string;
  fullName: string;
  studentClass?: string | null;
  stream?: ProvisioningStream | null;
  claimCode: string;
  claimExpiresAt?: string | null;
}

/** One individually-visible row in the consent-aware roster. */
export interface RosterStudent {
  userId: string;
  fullName?: string | null;
  studentClass?: string | null;
  stream?: ProvisioningStream | null;
  provenance: "self" | "provisioned";
  claimState?: "unclaimed" | "claimed" | null;
  visible: boolean;
  hasConsent: boolean;
}

/** The roster payload: visible rows + the counts that make the aggregate-only
 *  cohort legible ("142 affiliated · 118 aggregate-only · 24 shared"). */
export interface RosterSummary {
  students: RosterStudent[];
  totalAffiliated: number;
  aggregateOnly: number;
  sharedWithYou: number;
}

/** A possible duplicate between a provisioned account and a claimed/self account
 *  that the admin can confirm or dismiss. */
export interface ProvisioningMergeCandidate {
  id: string;
  provisionedUserId?: string | null;
  provisionedFullName?: string | null;
  provisionedStudentClass?: string | null;
  provisionedStream?: ProvisioningStream | null;
  claimedUserId?: string | null;
  claimedFullName?: string | null;
  claimedContact?: string | null;
  matchScore?: number | null;
  reason?: string | null;
  status?: "pending" | "confirmed" | "dismissed" | string;
  createdAt?: string | null;
}

// ─── Aggregate dashboard (the 5 stat cards) ───────────────────
export interface InstitutionSummary {
  institutionName: string;
  institutionCode: string;
  activeProgrammes: number;
  facultyCount?: number;
  domainsAccessible: number;
  domainsDelta?: number;
  ngPostingsPerMonth: number;
  ngPostingsYoyPct?: number;
  skillsGapsFlagged: number;
  skillsGapProgrammes?: number;
  remoteEligiblePct: number;
  remoteEligiblePrevPct?: number;
  /** When the underlying market data was last refreshed (e.g. "Jun 2026"). */
  dataAsOf?: string;
}

// ─── Programme × Domain × Demand table ────────────────────────
export type MappingSource = "ccmas" | "custom";
export type TrendDirection = "up" | "down" | "flat";

export interface ProgrammeDomainBadge {
  domainId: string;
  shortLabel: string; // e.g. "D001 SW Eng"
  matchType: DomainMatchType; // direct | functional | adjacent
}

export interface DemandSkill {
  name: string;
  /** In the CCMAS curriculum (covered) vs an employer-demanded gap. */
  inCurriculum: boolean;
  /** Optional note, e.g. "Adjacent (D004)". */
  note?: string;
}

/** Row detail revealed on expand. */
export interface ProgrammeDemandDetail {
  topSkills: DemandSkill[];
  topCertifications: DemandSkill[];
  topEmployers: string[];
}

export interface ProgrammeDemandRow {
  id: string;
  programmeName: string;
  jambName: string;
  qualification?: string; // B.Sc, LL.B…
  mappingSource: MappingSource; // ccmas | custom (drives the CCMAS/CUSTOM tag)
  domains: ProgrammeDomainBadge[];
  domainOverflow?: number; // "+N more"
  ngPostingsPerMonth: number;
  sparkline?: number[]; // last N monthly points for the sparkbar
  trendPct?: number;
  trendDirection?: TrendDirection;
  entrySalaryMin?: number;
  entrySalaryMax?: number;
  skillsGapCount: number; // 0 = no gaps
  detail?: ProgrammeDemandDetail; // populated lazily / with data
  meta?: DataMeta;
}

export interface ProgrammeFilter {
  discipline?: string;
  hasGaps?: boolean;
  highDemand?: boolean;
  customMapping?: boolean;
  query?: string;
}

// ─── Domain demand ranking (right panel) ──────────────────────
export type RankScope = "nigerian" | "global" | "remote";

export interface DomainRankItem {
  rank: number;
  domainId: string;
  domainName: string;
  /** e.g. "Direct: CS, IT, CE" — which of the institution's programmes route in. */
  routeNote?: string;
  postingsPerMonth: number;
  /** 0..1 relative bar fill within the current ranking. */
  barRatio?: number;
  trendPct?: number;
  trendDirection?: TrendDirection;
}

// ─── Intelligence alerts ──────────────────────────────────────
export type AlertSeverity = "info" | "opportunity" | "warning" | "critical";

export interface IntelligenceAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
}

// ─── Skills gap report / role demand / peer comparison ────────
export interface SkillGapRow {
  programmeName: string;
  domainName: string;
  skill: string;
  demandPct?: number; // share of postings demanding it
  inCurriculum: boolean;
}

export interface RoleDemandRow {
  roleId: string;
  roleName: string;
  domainName?: string;
  ngPostings?: number;
  globalPostings?: number;
  remotePct?: number;
  salaryMin?: number;
  salaryMax?: number;
  trendPct?: number;
}

export interface PeerInstitutionRow {
  institutionName: string;
  domainsAccessible: number;
  /** Domains this peer reaches that the current institution does not. */
  uniqueDomains?: string[];
}

// ─── Affiliation attribution (aggregate, k-anonymised) ────────
export interface AffiliationStats {
  organizationId: string;
  /** Self-reported affiliations; suppressed below the k-anonymity threshold. */
  affiliatedStudents: number | null;
  belowThreshold: boolean;
  schoolCode: string;
}

/** Re-export the academic institution-type union for convenience. */
export type { AcademicInstitutionType };
