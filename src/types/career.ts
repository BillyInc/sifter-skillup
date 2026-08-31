/**
 * Career Intelligence — canonical data contract.
 *
 * This file is the single source of truth for the shape of every
 * career-intelligence entity. The Supabase schema (backend migration) and the
 * FastAPI read routes mirror these names and fields exactly, and the frontend
 * `careerData` client returns them wrapped in {@link DataState}.
 *
 * Modelling rules (CCMAS v3.0 — do not reintroduce "Primary/Secondary"):
 *  - A programme→domain link carries a DOMAIN match type: direct | functional |
 *    adjacent. Ordering is structural; no live labour-market demand signal is
 *    attached until source-backed ingestion is available.
 *  - A role within a matched domain carries a ROLE match: match (>=50% ESCO
 *    coverage) | adjacent (20-49%). Below 20% is not shown.
 *  - Skills are TWO layers: domain-level bridge skills (size scales with the
 *    domain match type) then role-level bridge skills. Adjacent domains add a
 *    conceptual-prerequisite sub-layer that must be learned first.
 *
 * No data ships in this phase — the client returns `coming_soon`/`locked`
 * envelopes. Real NCE/CCMAS rows are imported later with zero UI changes.
 */

import type { DomainMatchType, RoleMatchType } from "../theme";

export type { DomainMatchType, RoleMatchType };
import type {
  EliteVerificationCheckKey,
  NigerianUserTypeKey,
} from "../lib/elitePathwayPolicy";

// ─── Data state envelope ──────────────────────────────────────
// Every data-driven surface handles these uniformly so unbuilt areas render a
// graceful "Coming Soon"/"Locked"/"Pending" state instead of a blank or a fake.
export type DataStatus =
  | "real" // IBASS/CCMAS/NCE-sourced, fully populated
  | "fallback" // standard/national data shown while real data is pending
  | "pending" // being populated; show a "data pending" state
  | "coming_soon" // feature designed but not yet populated at all
  | "locked" // gated (e.g. requires an account / not yet released)
  | "error";

export interface DataMeta {
  /** Provenance, shown via the data-freshness badge. */
  verification?: "verified" | "inferred" | "pending";
  /** ISO date the underlying data was last verified. */
  dataDate?: string;
  /** Cited source(s) for the data point. */
  sources?: string[];
  /** Editorial release gates passed for source-backed elite pathway content. */
  verificationChecks?: EliteVerificationCheckKey[];
  /** Human-readable note for fallback/pending/coming_soon states. */
  notice?: string;
}

export type SourceConfidence = "high" | "medium" | "low" | "unsourced";
export type SourceDataState = "source_backed" | "partial" | "unsourced";

/** Evidence scope used by guidance copy. These are semantic states, not a
 * demand ranking and must not be rendered as scores or ordinal bands. */
export type GuidanceEvidenceState =
  | "source_backed"
  | "context_only"
  | "limited"
  | "not_available"
  | "pending";

export interface GuidanceEvidenceSource {
  id: string;
  label: string;
  url: string;
}

export interface GuidanceEvidenceLens {
  state: GuidanceEvidenceState;
  explanation: string;
  sourceCount?: number;
  sources?: GuidanceEvidenceSource[];
}

export interface GuidanceEvidence {
  /** Nigerian bodies, standards and checked local professional context. */
  nigeria: GuidanceEvidenceLens;
  /** A separate remote-work signal; never inferred from global evidence. */
  remote: GuidanceEvidenceLens;
  /** International occupational or professional evidence. */
  global: GuidanceEvidenceLens;
  limitations?: string[];
}

export interface SourceBackedFields {
  sourceConfidence?: SourceConfidence;
  dataState?: SourceDataState;
  sourceProvenance?: Record<string, unknown>;
  nigerianContext?: Record<string, unknown>;
  guidanceEvidence?: GuidanceEvidence;
}

export interface DataState<T> {
  status: DataStatus;
  data: T | null;
  meta?: DataMeta;
}

// Convenience constructors used by the client and (conceptually) the API.
export function comingSoon<T>(notice?: string): DataState<T> {
  return {
    status: "coming_soon",
    data: null,
    meta: notice ? { notice } : undefined,
  };
}
export function locked<T>(notice?: string): DataState<T> {
  return {
    status: "locked",
    data: null,
    meta: notice ? { notice } : undefined,
  };
}
export function pending<T>(notice?: string): DataState<T> {
  return {
    status: "pending",
    data: null,
    meta: notice ? { notice } : undefined,
  };
}
export function error<T>(notice?: string): DataState<T> {
  return {
    status: "error",
    data: null,
    meta: notice ? { notice } : undefined,
  };
}
export function real<T>(data: T, meta?: DataMeta): DataState<T> {
  return { status: "real", data, meta };
}

// ─── Institution & programme ──────────────────────────────────
export type InstitutionType =
  | "university" // CCMAS / NUC
  | "college_of_education" // NCE / NCCE
  | "polytechnic" // ND / HND / NBTE
  | "monotechnic"
  | "college_of_health" // nursing & allied health
  | "technical_college"; // NABTEB

export interface School {
  id: string;
  name: string;
  institutionType: InstitutionType;
  /** True once IBASS-sourced detail exists for this school (drives the
   *  Data-State-B fallback disclaimer when false). */
  ibassVerified: boolean;
}

export interface Programme {
  id: string;
  /** Standard CCMAS/NCE name. Never shown with the word "CCMAS" in the UI. */
  name: string;
  /** Institution-specific (IBASS) name once available; falls back to `name`. */
  displayName?: string;
  /** Source-backed JAMB name for student-facing headings. */
  studentName?: string | null;
  studentNames?: string[];
  institutionType: InstitutionType;
  discipline: string;
  qualification?: string; // B.Sc, NCE, ND, HND, ...
  durationYears?: number;
  /** Source-backed plain-language programme overview, when the catalogue has one. */
  overview?: string | null;
  /**
   * What this degree teaches. Resolved server-side by following
   * programme_mapping to the JAMB names' CCMAS skills profile, and unioned when
   * several names map to this one programme. Empty means genuinely unmapped —
   * 106 of 239 programmes are.
   */
  skillsTechnical?: string[] | null;
  skillsTransferable?: string[] | null;
  skillsCount?: number | null;
  /** Domain links, each with its match type. */
  domains: DomainLink[];
}

// ─── Domain (Step 1: programme → domain) ──────────────────────
export interface DomainLink {
  domainId: string;
  domainName: string;
  matchType: DomainMatchType; // direct | functional | adjacent
  eliteFlag?: boolean;
}

export interface Domain {
  id: string;
  name: string;
  cluster: string;
  description?: string;
  /** Domain-level bridge skills — entry conditions for the domain. The set
   *  size scales with the match type (direct: small … adjacent: large). */
  domainBridgeSkills: BridgeSkill[];
  /** Adjacent-only: foundational concepts to acquire before role-level bridge
   *  skills become relevant. Empty for direct/functional links. */
  conceptualPrerequisites?: BridgeSkill[];
  roles: RoleSummary[];
}

// ─── Role (Step 2: domain → role) ─────────────────────────────
export interface RoleSummary {
  id: string;
  name: string;
  alsoKnownAs?: string[];
  match: RoleMatchType; // match (>=50%) | adjacent (20-49%)
  coverageRatio: number; // 0..1, ESCO essential-skill coverage
  eliteFlag?: boolean;
}

export interface Role extends RoleSummary {
  domainId: string;
  description?: string;
  escoCode?: string;
  iscoGroup?: string;
  /** Exact O*NET detailed occupation codes used for tool and competency joins. */
  onetOccupationCodes?: string[];
  /** O*NET Essential Skills records, kept separate from ESCO skills. */
  onetEssentialSkills?: Array<{
    elementId: string;
    elementName: string;
    importance?: number | null;
    source?: string;
    sourceConfidence?: SourceConfidence;
    dataState?: SourceDataState;
  }>;
  /** Role-level bridge skills — ESCO essentials the programme doesn't cover. */
  roleBridgeSkills: BridgeSkill[];
  coveredSkills?: string[];
  careerLadder?: string[];
}

export interface BridgeSkill {
  name: string;
  /** Optional grouping/category from ESCO. */
  category?: string;
  /** Whether the programme already covers this (covered) or it's a gap. */
  covered?: boolean;
}

// ─── Opportunity (employment) ─────────────────────────────────
// Trimmed per scope: no NYSC/PPA, IT placement, or apprenticeship types.
export type OpportunityType =
  | "internship"
  | "graduate_trainee"
  | "entry_level"
  | "fellowship"
  | "contract";

export type WorkMode = "onsite" | "hybrid" | "remote" | "field" | "shift";
export type OpportunityScope = "local" | "global" | "remote";
export type Likelihood = "high" | "medium" | "low";

export interface Organisation {
  id: string;
  name: string;
  sector?: string;
  country?: string;
  nigeriaOffice?: boolean;
  likelihood?: Likelihood;
}

export interface Opportunity {
  id: string;
  title: string;
  organisation: Organisation;
  type: OpportunityType;
  scope: OpportunityScope;
  workMode?: WorkMode;
  /** Which of the six institution types are eligible. */
  eligibleInstitutionTypes: InstitutionType[];
  domainIds?: string[];
  roleIds?: string[];
  country?: string;
  salaryNgnMin?: number;
  salaryNgnMax?: number;
  applicationWindow?: string;
  applicationDeadline?: string;
  careersUrl?: string;
  visaRoute?: string;
  likelihood?: Likelihood;
  /** Long-form detail for the opportunity detail screen. */
  description?: string;
  skills?: string[];
  certifications?: string[];
  meta?: DataMeta;
}

/** Filters for the Opportunities hub. Undefined / empty = no filter. */
export interface OpportunityFilter {
  scope?: OpportunityScope;
  type?: OpportunityType;
  workMode?: WorkMode;
  likelihood?: Likelihood;
  institutionType?: InstitutionType;
  /** Region grouping (e.g. 'nigeria' | 'uk' | 'ireland' | 'remote' | ...). */
  region?: string;
  /** Free-text search query (title/role matching). */
  query?: string;
}

// ─── Scholarships (secondary) ─────────────────────────────────
export interface Scholarship {
  id: string;
  name: string;
  funded?: "full" | "partial";
  level?: string; // Undergrad / Postgrad / PhD ...
  destination?: string;
  disciplines?: string[];
  opensLabel?: string;
  url?: string;
  meta?: DataMeta;
}

// ─── Application windows ──────────────────────────────────────
export type ApplicationWindowStatusValue =
  | "open"
  | "opening_soon"
  | "closing_soon"
  | "closed";

export interface ApplicationWindow {
  id: string;
  title: string;
  organisationName?: string;
  status: ApplicationWindowStatusValue;
  whenLabel: string;
  opportunityId?: string;
  meta?: DataMeta;
}

// ─── User-owned entities (saved / notes / subscriptions) ──────
export type SavedEntityType =
  | "programme"
  | "school"
  | "domain"
  | "subgroup"
  | "role"
  | "comparison"
  | "opportunity"
  | "organisation"
  | "elite_pathway"
  | "resource";

/** What a note can be attached to: any saveable entity, or a global quick note
 *  written from the NotesFab with no entity context. */
export type NoteEntityType = SavedEntityType | "global";

export interface SavedItem {
  id: string;
  entityType: SavedEntityType;
  entityId: string;
  label?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  entityType: SavedEntityType;
  entityId: string;
  body: string;
  /** User-assigned category for grouping in My World (e.g. "Admissions",
   *  "To research"). Optional; ungrouped notes fall under "Uncategorised". */
  category?: string;
  /** Denormalised label of the entity the note is attached to, so the
   *  My World notes list can render without a second lookup. */
  entityLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionTarget =
  | "opportunity"
  | "organisation"
  | "application_window";

export interface Subscription {
  id: string;
  target: SubscriptionTarget;
  targetId: string;
  createdAt: string;
}

// ─── Search ───────────────────────────────────────────────────
export interface ProgrammeSearchResult {
  id: string;
  name: string;
  institutionType: InstitutionType;
  discipline?: string;
}

// ══════════════════════════════════════════════════════════════
// PHASE 7 — Elite pathways · bridge architecture · special flows
// All data-gated: careerData returns `coming_soon` envelopes for now and the
// screens render structure (fixed model labels) with graceful pending bodies.
// No mock rows are introduced here.
// ══════════════════════════════════════════════════════════════

// ─── Elite pathways (see ELITE_DOMAIN_COUNT) ──────────────────
export interface ElitePathwaySummary {
  id: string;
  name: string;
  /** Grouping among the elite domains (e.g. "Finance", "Tech", "Law"). */
  cluster?: string;
  firms?: string[];
  compensationLabel?: string;
  selectivityLabel?: string;
  /** True when Nigerians have a structural edge into this path. */
  nigerianAdvantage?: boolean;
  eliteFlag?: true;
}

/** A stage in the Formation → Pinnacle progression for an elite path. */
export interface EliteStage {
  title: string;
  body?: string;
  milestones?: string[];
}

export interface ElitePathway extends ElitePathwaySummary {
  description?: string;
  /** "Formation" — how you build toward the path from a Nigerian start. */
  formation?: EliteStage[];
  /** "Pinnacle" — what the top of this path looks like. */
  pinnacle?: EliteStage[];
  /** Links to the per-domain 6-layer bridge plan (Model 5). */
  bridgePlanId?: string;
  meta?: DataMeta;
}

/** "Is Elite Right For Me" — a short self-check, NOT a personality test. */
export interface EliteReadinessQuestion {
  id: string;
  prompt: string;
  options: { value: string; label: string; weight?: number }[];
}

export interface EliteReadinessResult {
  fit: "strong" | "possible" | "explore_first";
  summary: string;
  suggestions?: string[];
}

// ─── Bridge architecture (Model 5 — the honest 6-layer engine) ─
export type BridgeLayerKey =
  | "global_standard" // the global benchmark for the destination
  | "nigerian_qualification_map" // honest NG-equivalence (no over-claiming)
  | "bridge_inventory" // top-ups, Direct Entry, ELR, CFA/ACCA, PLAB, SQE…
  | "timeline_cost" // realistic time + money
  | "employer_entry" // the Nigerian employer entry point
  // Layer 6 — "Proof of Concept": real, named people who have actually walked
  // this route. The wire key stays `ownership_path` for backend compatibility;
  // the user-facing title is the authority on what the layer means.
  | "ownership_path";

/** The fixed, ordered set of bridge layers — the model's spine, not data. */
export const BRIDGE_LAYER_ORDER: {
  key: BridgeLayerKey;
  title: string;
}[] = [
  { key: "global_standard", title: "Global standard" },
  { key: "nigerian_qualification_map", title: "Nigerian qualification map" },
  { key: "bridge_inventory", title: "Bridge inventory" },
  { key: "timeline_cost", title: "Timeline & cost" },
  { key: "employer_entry", title: "Nigerian employer entry point" },
  { key: "ownership_path", title: "Proof of Concept" },
];

export interface BridgeLayer {
  key: BridgeLayerKey;
  title: string;
  body?: string;
  items?: string[];
}

export interface BridgePlan {
  id: string;
  from: string; // starting point
  to: string; // destination
  layers: BridgeLayer[];
  coveredUserTypes?: NigerianUserTypeKey[];
  meta?: DataMeta;
}

// ─── Special flows (dedicated starting-point / pivot screens) ──
export interface PhdRoute {
  id: string;
  /** e.g. "Quant finance & data science", "IO direct research". */
  title: string;
  body?: string;
  /** What actually selects you (e.g. "technical interview, not CV"). */
  signals?: string[];
  bridgePlanId?: string;
}

export type CareerChangeType =
  | "job_switch" // same field, new employer/role
  | "adjacent_pivot" // neighbouring field
  | "significant_change" // a real domain change
  | "forced_change"; // redundancy / sector collapse

export interface SkillsTranslation {
  id: string;
  from: string; // "Banking"
  to: string; // "Tech / fintech"
  bridgeCredential?: string; // "CFA", "PMP", "CIPD"…
  notes?: string;
}

export interface CareerChangerPath {
  type: CareerChangeType;
  title: string;
  body?: string;
  /** Priority Nigerian pivots for this change type. */
  translations?: SkillsTranslation[];
}

export interface QualificationUpgrade {
  id: string;
  /** e.g. "OND → Direct Entry → 200L → B.Sc (3 yrs)". */
  title: string;
  body?: string;
  steps?: string[];
  requirements?: string[];
}

export interface Chartership {
  id: string;
  name: string; // "CFA", "COREN / CEng (ELR)", "ICAN/ACCA"…
  field?: string;
  body?: string;
  exemptions?: string[];
  meta?: DataMeta;
}

// ══════════════════════════════════════════════════════════════
// v2 CONTRACT (post-sweep taxonomy — matches migration_career_v2.sql
// + backend/routes/career_routes.py). The API returns these shapes wrapped
// in DataState. Wired into screens in Phase 6; additive so existing types
// keep compiling. Domain/role ids here are the STABLE keys (D001 / "D001|role").
// ══════════════════════════════════════════════════════════════

/** Readiness = agent-verified domain match_type × role tier (NOT token coverage). */
export type Readiness = "ready" | "bridge" | "stretch";

export interface CertificationV2 {
  name: string;
  body?: string;
  region?: "global" | "nigeria";
  level?: "foundation" | "professional" | "advanced";
  /** Why it gates at its placement level (gateway/subgroup/role_hint). */
  gateReason?: string;
}

export interface ToolV2 extends SourceBackedFields {
  tool: string;
  /** distinctive = characterises the field; common = widely-used, also expected. */
  group: "distinctive" | "common";
  roleFreq?: number | null;
  source?: string; // onet | curated_creative
  elementName?: string | null;
  elementId?: string | null;
}

export interface ToolGroups {
  distinctive: ToolV2[];
  common: ToolV2[];
}

/** A source-backed method or concept. This is not proof that a student has
 * demonstrated competence in it. */
export interface ComputationalMethodEvidence {
  name: string;
  classification: "knowledge" | "skill" | "competence" | "tool" | "unknown";
  competenceStatus: "not_demonstrated" | "demonstrated" | "unknown";
  escoId?: string | null;
  description?: string | null;
  evidenceRoles?: string[];
  sourceProvenance?: Record<string, unknown>;
  dataState?: SourceDataState;
}

export interface SubgroupV2 extends SourceBackedFields {
  id: string;
  iscoSubmajor?: string;
  /** Student-friendly cluster name (e.g. "Traders & Brokers"). */
  name: string;
  description?: string;
  roleCount?: number;
  clusterSkills: string[];
  skillSources?: Record<string, unknown>;
  methodEvidence?: ComputationalMethodEvidence[];
  tools: ToolGroups;
  certifications: CertificationV2[]; // specialization certs
  resources?: CareerLearningResource[];
}

export interface DomainRoleSummary {
  key: string; // "D011|securities trader"
  name: string;
  description?: string;
  tier?: "entry" | "mid" | "senior";
  alsoKnownAs?: string[];
  subgroupId?: string | null;
  eliteStatus?: string;
  resources?: CareerLearningResource[];
}

/** Source-backed work evidence joined from an occupation profile. */
export interface RoleWorkProfile {
  sourceRecordStatus: "source_backed" | "source_role_only" | "not_available";
  onetOccupationCodes: string[];
  activities: string[];
  workActivities: Array<{ name: string; importance?: number }>;
  jobZones: Array<{
    zone?: number | null;
    name?: string;
    experience?: string;
    education?: string;
    job_training?: string;
  }>;
  educationSignals: Array<{ label: string; share?: number }>;
  workContext: Array<{ name: string; frequency: string; share?: number }>;
  relatedOccupations: string[];
  sourceLinks: Array<{ label?: string; url: string; source_id?: string }>;
  sourceProvenance?: Record<string, unknown>;
  limitations: string[];
  dataState?: SourceDataState;
}

/** A domain's common ("foundation") skill, shown with how prevalent it is across the
 *  field's roles. Threshold ≥30% (adaptive floor for diverse domains) — a 34% skill
 *  appears AND is labelled 34%, so common-but-not-universal skills aren't hidden. */
export interface FoundationSkill {
  skill: string;
  /** Fraction of the domain's roles whose essential skills include this (0..1). */
  prevalence: number;
  /** Absolute role count (numerator behind prevalence). */
  n: number;
}

export interface DomainV2 extends SourceBackedFields {
  id: string; // domain_key e.g. "D001"
  name: string;
  /** Programme context added by the guided selector; absent in context-free exploration. */
  programmeMatchType?: DomainMatchType;
  cluster?: string;
  clusters: string[];
  description?: string;
  institutionType: string[];
  eliteDomain: boolean;
  /** L1 common skills, prevalence-ranked (≥30% + adaptive floor). */
  foundationSkills: FoundationSkill[];
  foundationSkillSources?: Record<string, unknown>;
  roleCount?: number;
  /** Domain-wide tools (distinctive + also-expected common). */
  tools: ToolGroups;
  /** Field-wide licence-to-practise certs only (may be empty for unlicensed fields). */
  gatewayCertifications: CertificationV2[];
  roleHintCertifications: CertificationV2[];
  /** Domain-level bridge skills (cover/bridge split). */
  domainBridgeSkills?: { name: string; covered?: boolean }[];
  subgroups: SubgroupV2[];
  roles: DomainRoleSummary[];
  resources?: CareerLearningResource[];
}

export interface DomainRoleV2 extends SourceBackedFields {
  key: string;
  name: string;
  /** Source-backed occupation explanation, when the role source provides one. */
  description?: string;
  subgroupId?: string | null;
  tier?: "entry" | "mid" | "senior";
  alsoKnownAs?: string[];
  iscoGroup?: string;
  escoCode?: string;
  eliteStatus?: string;
  essentialSkills: string[];
  optionalSkills: string[];
  /** O*NET task, activity and preparation evidence, when a code is mapped. */
  workProfile?: RoleWorkProfile | null;
  computationalMethods?: (ComputationalMethodEvidence & { subgroupId?: string | null })[];
  escoOccupationUris?: string[];
  onetOccupationCodes?: string[];
  onetEssentialSkills?: Array<{
    elementId: string;
    elementName: string;
    importance?: number | null;
    source?: string;
    sourceConfidence?: SourceConfidence;
    dataState?: SourceDataState;
  }>;
  /** Tools owned by this role, distinct from domain/subgroup tools. */
  tools?: RoleToolV2[];
  /** Certifications owned by this role, distinct from domain/subgroup certs. */
  certifications?: CertificationV2[];
  /** Every domain this role is reachable from (multi-domain by design). */
  appearsIn: { domainId: string; domainName: string; roleKey: string }[];
  /** Role-level bridge skills (covered/missing split). */
  coveredSkills?: string[];
  roleBridgeSkills?: { name: string; covered?: boolean }[];
  careerLadder?: string[];
  resources?: CareerLearningResource[];
}

/** A programme→domain→role readiness row (from programme_role_score). */
export interface RoleReadiness {
  roleKey: string;
  roleName: string;
  label: Readiness;
  coverage?: number;
  tier?: string;
  subgroupLabel?: string;
  bridgeSkills: string[]; // the gap = LevelUp target
}

// ─── Disambiguation search (grouped) ──────────────────────────
export interface CareerSearchResult {
  domains: { id: string; name: string; cluster?: string }[];
  roles: {
    name: string;
    tier?: string;
    /** The role resolves to these domains — user picks which context. */
    domains: { domainId: string; domainName: string; roleKey: string }[];
  }[];
  programmes: ProgrammeSearchResult[];
}

export interface RoleToolV2 extends SourceBackedFields {
  name: string;
  group?: "distinctive" | "common";
  description?: string;
  source?: string;
  elementName?: string | null;
  elementId?: string | null;
}

export interface SkillDiscoveryResult {
  terms: string[];
  matchMode: "both" | "either";
  userType?: string | null;
  adminType?: string | null;
  allowedUserTypes?: string[];
  streamOptions?: string[];
  streamRequired?: boolean;
  audience: "student" | "school_guidance" | "provider_guidance" | "university_curriculum";
  categories: string[];
  domains: {
    id: string;
    name: string;
    cluster?: string | null;
    description?: string | null;
    matchedSkills: string[];
    unmatchedSkills: string[];
    gaps: string[];
    matchScore: number;
    matchLabel: string;
    matchExplanation: string;
  }[];
  subgroups: {
    id: string;
    name?: string | null;
    domainId?: string | null;
    domainName?: string | null;
    matchedSkills: string[];
    unmatchedSkills: string[];
    gaps: string[];
    matchScore: number;
    matchLabel: string;
    matchExplanation: string;
  }[];
  roles: {
    key?: string | null;
    name?: string | null;
    domainId?: string | null;
    domainName?: string | null;
    tier?: string | null;
    matchedSkills: string[];
    unmatchedSkills: string[];
    gaps: string[];
    matchScore: number;
    matchLabel: string;
    matchExplanation: string;
  }[];
  tools: { name?: string | null; group?: string | null; domainId?: string | null; domainName?: string | null; matchedSkills: string[]; matchScore: number; matchLabel: string }[];
  certifications: { name?: string | null; body?: string | null; level?: string | null; domainId?: string | null; domainName?: string | null; matchedSkills: string[]; matchScore: number; matchLabel: string }[];
}

// ─── JAMB name → domains (student entry) ──────────────────────
export interface JambDomainResult {
  jambName: string;
  domains: {
    domainId: string;
    domainName: string;
    cluster?: string;
    matchType: DomainMatchType;
    eliteFlag?: boolean;
  }[];
}

// ─── Career-changer pivot (Scenario A: "fields you can move into") ──
export interface PivotResult {
  fromDomain: { id: string; name: string };
  moves: {
    domainId: string;
    domainName: string;
    cluster?: string;
    eliteFlag?: boolean;
    /** Transferable-skill overlap 0..1 (how much of the target you already have). */
    overlapScore: number;
    sharedSkills: string[];
  }[];
}

// ══════════════════════════════════════════════════════════════
// PHASE 8 — Admission Intelligence (SS → University)
// ══════════════════════════════════════════════════════════════

/** National JAMB minimum floor score (university). */
export interface NationalJambFloor {
  year: number;
  floorScore: number;
  contextNote?: string;
  sourceUrl?: string;
  dataDate: string;
}

/** Per-school × programme cut-off row. */
/** Per-institution requirement delta for a school×programme pair, extracted
 *  from the JAMB brochure's waiver lists. Not currently attached to any
 *  payload (source columns are unpopulated); kept for future admin work on
 *  per-school requirement overrides. */
export interface SchoolRequirements {
  utmeSubjects?: string | null;
  olevelRequirement?: string | null;
  directEntry?: string | null;
  /** The school-specific waiver note ("AAU requires Mathematics…"). */
  institutionNote?: string | null;
  hasInstitutionNote: boolean;
}

export interface ProgrammeSchoolCutoff {
  id: string;
  schoolId: string;
  schoolName: string;
  programmeId: string;
  programmeName: string;
  year: number;
  aggregateCutoff?: number;
  jambCutoff?: number;
  form: "UTME" | "DE";
  sourceUrl: string;
  verifiedAt?: string;
  dataDate: string;
}

/** How a university calculates aggregate (JAMB% + O'level%). */
export interface SchoolAggregateFormula {
  id: string;
  schoolId: string;
  schoolName: string;
  year: number;
  jambWeight: number;       // 0.50 = 50%
  olevelWeight: number;
  description?: string;
  sourceUrl?: string;
  dataDate: string;
}

/** National broad-course competitiveness (faculty-level, not programme-level). */
export interface CourseCompetitiveness {
  id: string;
  broadCourse: string;
  year: number;
  applied?: number;
  admitted?: number;
  ratio?: number;           // admitted/applied
  source?: string;
  note?: string;            // "approximate, faculty-level only"
  dataDate: string;
}

/** Admission snapshot version (what cycle the user is seeing). */
export interface AdmissionSnapshotVersion {
  id: string;
  label: string;            // "2025/26 Cycle — compiled Jan 2025"
  year: number;
  compiledAt: string;
  compiler?: string;
  notes?: string;
  isActive: boolean;
  meta?: DataMeta;
}

/** Admission insight badge for JAMB-name → domains flow. */
export interface AdmissionInsight {
  hasCutoffData: boolean;
  year: number;
  label: string;
  programmeCount: number;
}

// ══════════════════════════════════════════════════════════════
// PHASE 9 — Enrichment & Refresh (ongoing)
// ══════════════════════════════════════════════════════════════

/** Certification enrichment fields (Phase 4b). */
export interface CertificationEnrichment {
  officialUrl?: string;          // deep link to register/verify
  seniorityTier?: number;        // 1=entry, 2=mid, 3=senior (scoped to family)
  tierType?: "ladder" | "stages"; // Cisco/AWS/PMI = ladder; CFA/ICAN = stages
  price?: number;
  currency?: "USD" | "NGN" | "GBP" | "EUR";
  priceAsOf?: string;            // ISO date
  priceSource?: string;
}

/** Skill URI map (parallel to skill arrays, keyed by skill name). */
export interface SkillUriMap {
  uris: Record<string, string>;  // "skill name" -> "https://data.europa.eu/esco/skill/..."
}

/** Role currency status (Phase 9 L4). */
export interface RoleCurrencyStatus {
  currencyStatus: "current" | "legacy" | "emerging";
  currencyVerifiedAt?: string;
  currencySource?: "wef_foj_2025" | "onet_emerging" | "lightcast" | "curated";
}

/** Enrichment version stamp (tracks seed runs). */
export interface EnrichmentVersion {
  id: string;
  appliedAt: string;
  sourceCommitHash?: string;
  seedName: string;
  rowsUpserted: number;
}

// ─── Extended v2 types with enrichment fields ────────────────

export interface CertificationV2Enriched extends CertificationV2 {
  officialUrl?: string;
  seniorityTier?: number;
  tierType?: "ladder" | "stages";
  price?: number;
  currency?: "USD" | "NGN" | "GBP" | "EUR";
  priceAsOf?: string;
  priceSource?: string;
}

export interface FoundationSkillEnriched extends FoundationSkill {
  uri?: string;
}

export interface ToolV2Enriched extends ToolV2 {
  toolUrl?: string;
}

export interface DomainRoleV2Enriched extends DomainRoleV2 {
  currencyStatus?: "current" | "legacy" | "emerging";
  currencyVerifiedAt?: string;
  currencySource?: "wef_foj_2025" | "onet_emerging" | "lightcast" | "curated";
  essentialSkillUris?: string[];
  optionalSkillUris?: string[];
}

export interface DomainV2Enriched extends DomainV2 {
  foundationSkillUris?: Record<string, string>;
  gatewayCertifications: CertificationV2Enriched[];
  roleHintCertifications: CertificationV2Enriched[];
  subgroups: SubgroupV2Enriched[];
  resources?: CareerLearningResource[];
}

export interface SubgroupV2Enriched extends SubgroupV2 {
  clusterSkillUris?: Record<string, string>;
  certifications: CertificationV2Enriched[];
  tools: ToolGroupsEnriched;
  resources?: CareerLearningResource[];
}

export interface ToolGroupsEnriched {
  distinctive: ToolV2Enriched[];
  common: ToolV2Enriched[];
}

/** Clickable learning, competency, professional-body, tool and exam resource. */
export interface CareerLearningResource {
  id: string;
  domainId?: string | null;
  subgroupId?: string | null;
  roleId?: string | null;
  resourceType:
    | "domain_overview"
    | "role_reference"
    | "skill_reference"
    | "skill_learning"
    | "competency_reference"
    | "certification_exam"
    | "professional_body"
    | "tool_learning";
  targetName: string;
  provider: string;
  region: "nigeria" | "global" | "global_proxy";
  accessType: "free" | "paid" | "mixed" | "dynamic";
  delivery?: string | null;
  url: string;
  price?: number | null;
  currency?: string | null;
  pricePeriod?: string | null;
  priceAsOf?: string | null;
  priceSource?: string | null;
  sourceUrl?: string | null;
  description?: string | null;
  sourceConfidence?: SourceConfidence;
  dataState?: SourceDataState | "limited" | "dynamic";
  sourceProvenance?: Record<string, unknown>;
}

// ── Mapping feedback (expert review) ──────────────────────────
// Values must match the backend/DB check constraint (confirm|flag|suggest).
export type FeedbackType = "confirm" | "flag" | "suggest";

export interface MappingFeedback {
  id: string;
  edgeType: string; // "programme_domain" | "domain_role" | "role_skill"
  sourceId: string;
  targetId: string;
  feedbackType: FeedbackType;
  notes?: string;
  trustWeight: number; // 1.0 standard, 3.0 educator/institution_admin
  expertVerified?: boolean;
  createdAt: string;
  resolvedAt?: string | null;
}

// ─── Search UI types ────────────────────────────────────────────

export type SearchResultType =
  | "programme"
  | "domain"
  | "role"
  | "university"
  | "scholarship"
  | "opportunity"
  | "admin";

export type SearchScope = "all" | "programmes" | "domains" | "roles";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  /** Mono metadata line (e.g. salary range, cut-off, role count). */
  meta?: string;
  /** Feather icon name for the left icon slot. */
  icon?: string;
  /** Source attribution (e.g. "JAMB 2025", "NUC CCMAS"). */
  source?: string;
  /** ISO date string for freshness display. */
  freshness?: string;
  /** When true, render with lock icon and reduced opacity. */
  locked?: boolean;
  /** When true, the row is not navigable. */
  disabled?: boolean;
}
