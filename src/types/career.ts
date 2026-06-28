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
 *    adjacent. Ordering within a tier is by an "in-demand" signal, never a label.
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
  /** Human-readable note for fallback/pending/coming_soon states. */
  notice?: string;
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
  institutionType: InstitutionType;
  discipline: string;
  qualification?: string; // B.Sc, NCE, ND, HND, ...
  durationYears?: number;
  /** Domain links, each with its match type. */
  domains: DomainLink[];
}

// ─── Domain (Step 1: programme → domain) ──────────────────────
export interface DomainLink {
  domainId: string;
  domainName: string;
  matchType: DomainMatchType; // direct | functional | adjacent
  /** In-demand signal (O*NET outlook + WEF). Higher sorts first within a tier. */
  inDemandScore?: number;
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
  inDemandScore?: number;
  eliteFlag?: boolean;
}

export interface Role extends RoleSummary {
  domainId: string;
  description?: string;
  escoCode?: string;
  iscoGroup?: string;
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
  | "domain"
  | "role"
  | "opportunity"
  | "organisation"
  | "elite_pathway";

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

// ─── Elite pathways (the 17 elite domains) ────────────────────
export interface ElitePathwaySummary {
  id: string;
  name: string;
  /** Grouping among the 17 elite domains (e.g. "Finance", "Tech", "Law"). */
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
  | "ownership_path"; // the trade/elite ownership endgame

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
  { key: "ownership_path", title: "Ownership path" },
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
