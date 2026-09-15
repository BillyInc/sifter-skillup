/**
 * Institutional / administrator data contract.
 *
 * The institutional side delivers labour-market *intelligence* (aggregate
 * programme -> domain -> demand for an institution's programme mix) and a gated
 * *management* capability. Two hard rules baked into these types:
 *  - Institutional Intelligence is AGGREGATE and carries NO student PII.
 *  - Individual student visibility is consent-gated (aggregate-only until a
 *    guardian consents) - see {@link StudentConsent}.
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

//  Accounts & organisations 
export type AccountType = "pending" | "student" | "educator" | "institution_admin";

/** The kind of organisation an educator represents. */
export type OrganizationType =
  | "secondary_school"
  | "university"
  | "tutorial_centre" // tutorial centre / JAMB lesson provider (provider/session only)
  | "jamb_cafe";

/** Role of a member within an organisation; drives the admin workspace scope. */
export type OrgRole =
  | "owner"
  | "institution_admin"
  | "admin"
  | "counsellor" // secondary-school guidance & counselling officer
  | "course_advisor"
  | "hod"
  | "dean"
  | "admissions_officer"
  | "provisioning_manager"
  | "data_viewer";

/** Tiered identity assurance. Real verification logic lands with data/ops. */
export type VerificationStatus =
  | "unverified" // T0 - self-declared; national aggregate only
  | "claimed" // T1 - claimed an institution; awaiting proof
  | "pending" // proof submitted; under review
  | "verified" // T2 - verified org member
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
  cacNo?: string; // CAC business registration (centres/cafes)
  state?: string;
  /** Full physical/postal address used to disambiguate institutions. */
  address?: string;
  city?: string;
  country?: string;
  /** Stable public affiliation/referral code scoped to this school record. */
  schoolCode?: string;
  verificationStatus: VerificationStatus;
  verificationMethod?: VerificationMethod;
  /** Set only after a proof file has been stored and submitted for review. */
  verificationProofSubmittedAt?: string;
  /** True for tutorial_centre/jamb_cafe: provider/session only, never a roster. */
  providerSessionOnly?: boolean;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrgRole;
  seatStatus: "invited" | "active" | "suspended";
  displayName?: string;
  email?: string;
  title?: string;
  invitedBy?: string;
  acceptedAt?: string;
  lastActiveAt?: string;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  invitedEmail: string;
  role: OrgRole;
  status: "pending" | "accepted" | "revoked" | "expired";
  invitedBy?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface OrganizationTeam {
  organization: Organization | null;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
  canInvite: boolean;
}

/** The educator's own onboarding/profile (persisted locally for now). */
export interface EducatorProfile {
  accountType: Exclude<AccountType, "pending" | "student">;
  organizationType: OrganizationType;
  organizationName?: string;
  organizationAddress: string;
  organizationCity?: string;
  organizationState?: string;
  organizationCountry?: string;
  /** Set once an org record exists; before that the claim is free-text. */
  organizationId?: string;
  role: OrgRole;
  workEmail?: string;
  /** Registry anchor entered at onboarding (JAMB/NUC/MoE/CAC, per org type). */
  registryCode?: string;
  /** True for tutorial_centre/jamb_cafe - provider/session only, no roster. */
  providerSessionOnly?: boolean;
  /** Owner-issued code gate state. This is admin access, not proof/verification. */
  adminAccessStatus?: "owner_code";
  /** Sent only during the development access flow; never displayed as proof. */
  accessCode?: string;
  adminAccessGrantedAt?: string;
  verificationStatus: VerificationStatus;
  verificationMethod?: VerificationMethod;
  /** Set only when proof was actually submitted for review. */
  verificationProofSubmittedAt?: string;
  completedAt?: string;
}

//  Student affiliation & consent (the gate) 
/** A SELF-REPORTED link from a student to an org via the school code. Powers
 *  attribution + aggregate analytics only - never individual visibility. */
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

/** A school invitation that still needs the student's explicit decision. */
export interface StudentConsentRequest {
  id: string;
  schoolId: string;
  schoolName?: string | null;
  schoolAddress?: string | null;
  scope: "progress" | "contact" | "full";
  message?: string | null;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  createdAt?: string | null;
  respondedAt?: string | null;
}

//  Provisioning: drafts -> review grid -> generate -> roster 
export type ProvisioningStream = "science" | "art" | "commercial";
export type ProvisioningStudentType = "ss1" | "ss2" | "ss3" | "jamb";

/** A staged student row in the assisted-import review grid, before any account
 *  is minted. Extracted (vision) or manually entered; the educator corrects it. */
export interface ProvisionDraft {
  id: string;
  fullName?: string | null;
  studentClass?: string | null;
  stream?: ProvisioningStream | null;
  studentType?: ProvisioningStudentType | null;
  needsReview: boolean;
  guardianConsent: boolean;
  guardianName?: string | null;
  status: "draft" | "generated" | "discarded";
}

/** The career direction picked from the (in-memory) mapping - the only derived
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
  studentType?: ProvisioningStudentType | null;
  claimCode: string;
  claimExpiresAt?: string | null;
  guidanceComplete?: boolean;
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
  guidanceComplete?: boolean;
  studentType?: ProvisioningStudentType | null;
}

/** The roster payload: visible rows + the counts that make the aggregate-only
 *  cohort legible ("142 affiliated / 118 aggregate-only / 24 shared"). */
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

//  Aggregate dashboard (the 5 stat cards) 
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

//  Programme x Domain x Demand table 
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
  qualification?: string; // B.Sc, LL.B...
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

export interface ProgrammeIntelligenceRow {
  id: string;
  programmeName: string;
  discipline?: string;
  qualification?: string;
  mappingSource: MappingSource;
  domains: ProgrammeDomainBadge[];
  domainOverflow?: number;
  directDomains: number;
  functionalDomains: number;
  adjacentDomains: number;
  sourceStatus: "recorded" | "no_mapping_recorded" | string;
}

export interface ProgrammeFilter {
  discipline?: string;
  hasGaps?: boolean;
  highDemand?: boolean;
  customMapping?: boolean;
  query?: string;
}

//  Domain demand ranking (right panel) 
export type RankScope = "nigerian" | "global" | "remote";
export type MarketValueBand = "high" | "medium" | "low" | "unknown";
export type MarketQuadrant =
  | "high_demand_high_value"
  | "high_demand_lower_value"
  | "low_demand_high_value"
  | "low_demand_low_value"
  | "emerging_high_growth"
  | "insufficient_data";

export interface DomainRankItem {
  rank: number;
  domainId: string;
  domainName: string;
  /** e.g. "Direct: CS, IT, CE" - which of the institution's programmes route in. */
  routeNote?: string;
  postingsPerMonth: number;
  /** 0..1 relative bar fill within the current ranking. */
  barRatio?: number;
  trendPct?: number;
  trendDirection?: TrendDirection;
  valueBand?: MarketValueBand;
  quadrant?: MarketQuadrant;
  interpretation?: string;
}

//  Intelligence alerts 
export type AlertSeverity = "info" | "opportunity" | "warning" | "critical";

export interface IntelligenceAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  body: string;
}

//  Skills gap report / role demand / peer comparison 
export interface SkillGapRow {
  programmeName: string;
  domainName: string;
  skill: string;
  demandPct?: number; // share of postings demanding it
  inCurriculum: boolean;
}

export type CurriculumCoverageStatus = "complete" | "source_missing" | "review_only";

/** One sourced market/practice item compared with the CCMAS programme record. */
export interface ProgrammeResourceEvidence {
  name: string;
  kind: "skill" | "tool" | "certification";
  source: "domain" | "subgroup" | "role";
  scopeName?: string;
  roleName?: string;
  /** Stable comparison identity; aliases are source-provided only. */
  canonicalKey?: string;
  aliases?: string[];
  /** ``bridge`` means present in mapped market/practice evidence but not
   * evidenced in the programme profile; it is not an accreditation mandate. */
  state: "covered" | "bridge";
  curriculumState?: "taught" | "partly_evidenced" | "not_evidenced" | "source_review";
  /** The sourced domain/subgroup/role record is the market/practice layer. */
  marketState?: "market_practice_evidence" | "insufficient_evidence" | "source_review";
  url?: string;
  provider?: string;
  description?: string;
  explanation?: string;
  resourceType?: string;
  sourceConfidence?: string;
  dataState?: string;
  evidenceSource?: string;
  observedAt?: string;
  geography?: string;
}

export interface ProgrammeDomainSkillCoverage {
  domainId: string;
  domainName: string;
  matchType: string;
  curriculumSkills: string[];
  resources: ProgrammeResourceEvidence[];
  coveredCount: number;
  bridgeCount: number;
  coverageStatus: CurriculumCoverageStatus;
  explanation: string;
  /** Display order: direct first, then functional, then adjacent. */
  priority?: 1 | 2 | 3;
  marketState?: "market_practice_evidence" | "insufficient_evidence" | "source_review";
}

/** Programme-first curriculum bridge: programme → mapped domain → skills. */
export interface ProgrammeSkillCoverage {
  programmeId: string;
  programmeName: string;
  curriculumSkills: string[];
  curriculumTechnical: string[];
  curriculumTransferable: string[];
  curriculumStatus: "complete" | "source_missing";
  domains: ProgrammeDomainSkillCoverage[];
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
  rankLens?: RankScope;
  valueBand?: MarketValueBand;
  quadrant?: MarketQuadrant;
  interpretation?: string;
  topEmployers?: string[];
  topCertifications?: string[];
}

export interface PeerInstitutionRow {
  institutionName: string;
  domainsAccessible: number;
  /** Domains this peer reaches that the current institution does not. */
  uniqueDomains?: string[];
}

//  Affiliation attribution (aggregate, k-anonymised) 
export interface AffiliationStats {
  organizationId: string;
  /** Self-reported affiliations; suppressed below the k-anonymity threshold. */
  affiliatedStudents: number | null;
  belowThreshold: boolean;
  schoolCode: string;
}

//  Domain Reach Audit - View A (spec Section 5.1) 
/**
 * STRUCTURAL DATA ONLY. Everything below is derived from the NUC CCMAS
 * 2022-2023 programme->domain mapping. It describes what an institution's
 * programme mix *can reach*, never what the labour market *wants* - that is
 * Market Intelligence (Section 5.2) and lives in the demand types above.
 */

/** Control filter for the national leaderboard (federal/state/private). */
export type InstitutionControlFilter = "all" | "federal" | "state" | "private";

/** A domain referenced by key + display name (no demand attached). */
export interface DomainRef {
  domainKey: string;
  name: string;
}

/** One row of the per-programme domain-reach breakdown. */
export interface ProgrammeDomainReachRow {
  programmeId: string;
  programmeName: string;
  direct: number;
  functional: number;
  adjacent: number;
  total: number;
}

/** Unreached domains grouped by CCMAS discipline cluster. */
export interface UnreachedClusterRow {
  cluster: string;
  domains: DomainRef[];
}

/** The institution's own curriculum-portfolio reach audit. */
export interface DomainReachAudit {
  institutionId: string;
  programmeCount: number;
  totalDomains: number;
  directDomains: number;
  functionalDomains: number;
  adjacentDomains: number;
  unreachedDomains: number;
  /** Size of the CCMAS domain universe the counts are "out of" (168). */
  domainUniverse: number;
  /** null (never 0 or 1) when the national index could not be built. */
  nationalRank: number | null;
  totalInstitutions: number | null;
  programmeBreakdown: ProgrammeDomainReachRow[];
  unreachedByCluster: UnreachedClusterRow[];
  meta?: DataMeta;
}

/** One institution on the national domain-reach leaderboard. */
export interface DomainReachLeaderboardRow {
  institutionId: string;
  institutionName: string;
  /** federal | state | private - null until an ownership column exists. */
  control?: string | null;
  /** The registry's real column (university | secondary_school | ...). */
  institutionType?: string | null;
  state?: string | null;
  totalDomains: number;
  directDomains: number;
  functionalDomains: number;
  adjacentDomains: number;
  nationalRank: number;
  /** True for the caller's own institution - highlighted in the table. */
  isSelf: boolean;
}

//  Student intelligence rollup (AGGREGATE - Section 5.5) 
/** A domain slice of the affiliated cohort's interest mix. */
export interface StudentIntelligenceDomain {
  domainKey: string;
  label: string;
  pct: number;
}

/** Aggregate, k-anonymised roster rollup. Carries no per-student field. */
export interface StudentIntelligenceSummary {
  organizationId: string;
  totalAffiliated: number;
  selfSignedUp: number;
  provisionedByYou: number;
  unclaimedCodes: number;
  topDomains: StudentIntelligenceDomain[];
  /** True when the cohort is under the k-anonymity threshold (mix suppressed). */
  belowThreshold?: boolean;
}

//  Feedback (Section 6A) 
/** The eight required student-feedback categories (Section 6A.3 / Section 6A.5 CHECK). */
export type StudentFeedbackCategory =
  | "mapping_wrong"
  | "data_outdated"
  | "bug"
  | "confusing"
  | "missing_info"
  | "feature_request"
  | "praise"
  | "other";

/** Which mapping edge a correction report targets (Section 6A.2). */
export type MappingEdgeType =
  | "programme_domain"
  | "domain_role"
  | "role_skill";

/** Re-export the academic institution-type union for convenience. */
export type { AcademicInstitutionType };
