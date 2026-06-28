/**
 * careerData — the single read API every career-intelligence screen calls.
 *
 * Phase 1 ships the CONTRACT and the SEAM, not the data. Every method returns a
 * `coming_soon` (or `locked`) {@link DataState} envelope so screens render their
 * graceful states. When the FastAPI routes + Supabase data land, only the bodies
 * of these methods change (swap the stub for a `request(...)` call) — screens,
 * which consume `DataState<T>`, do not change at all.
 *
 * Strategy reminder: University + NCE come online first; everything else stays
 * `coming_soon`. No mock rows are returned here by design.
 */
import {
  type DataState,
  type Programme,
  type Domain,
  type Role,
  type Opportunity,
  type OpportunityFilter,
  type Organisation,
  type Scholarship,
  type ApplicationWindow,
  type SavedItem,
  type Note,
  type Subscription,
  type ProgrammeSearchResult,
  type InstitutionType,
  type SavedEntityType,
  type SubscriptionTarget,
  type ElitePathwaySummary,
  type ElitePathway,
  type EliteReadinessQuestion,
  type BridgePlan,
  type PhdRoute,
  type CareerChangerPath,
  type QualificationUpgrade,
  type Chartership,
  comingSoon,
} from "../types/career";

/** A cluster of domains for the context-free Domain Explorer (no programme). */
export interface DomainClusterGroup {
  cluster: string;
  domains: { id: string; name: string }[];
}

// Flip to true per-area as real data is wired (kept here so screens can branch
// without importing backend details). All false in this phase.
export const CAREER_DATA_LIVE = {
  universityMapping: false,
  nceMapping: false,
  opportunities: false,
  elitePathways: false,
  scholarships: false,
} as const;

// ─── Read API ─────────────────────────────────────────────────
export const careerData = {
  /** Search programmes by free text, optionally filtered by institution type. */
  async searchProgrammes(
    _query: string,
    _institutionType?: InstitutionType,
  ): Promise<DataState<ProgrammeSearchResult[]>> {
    // TODO(career-data): GET /api/career/programmes?q=&institutionType=
    return comingSoon<ProgrammeSearchResult[]>(
      "Programme search comes online with University & NCE first.",
    );
  },

  /** Full programme detail incl. its domain links (with match types). */
  async getProgramme(_programmeId: string): Promise<DataState<Programme>> {
    // TODO(career-data): GET /api/career/programmes/{id}
    return comingSoon<Programme>("Programme intelligence is being populated.");
  },

  /** All domains grouped by cluster, for the context-free Domain Explorer. */
  async getDomainClusters(): Promise<DataState<DomainClusterGroup[]>> {
    // TODO(career-data): GET /api/career/domains (grouped by cluster)
    return comingSoon<DomainClusterGroup[]>(
      "The full domain map comes online with University & NCE first.",
    );
  },

  /** A domain incl. its domain-level bridge skills and role list. */
  async getDomain(_domainId: string): Promise<DataState<Domain>> {
    // TODO(career-data): GET /api/career/domains/{id}
    return comingSoon<Domain>("Domain detail is being populated.");
  },

  /** A role incl. its role-level bridge skills and coverage. */
  async getRole(_roleId: string): Promise<DataState<Role>> {
    // TODO(career-data): GET /api/career/roles/{id}
    return comingSoon<Role>("Role detail is being populated.");
  },

  /** Opportunities matched to a programme/domain, eligibility-filtered. */
  async getOpportunities(
    _params: {
      programmeId?: string;
      domainId?: string;
      roleId?: string;
    } & OpportunityFilter = {},
  ): Promise<DataState<Opportunity[]>> {
    // TODO(career-data): GET /api/career/opportunities?...
    return comingSoon<Opportunity[]>("Internships & jobs are being populated.");
  },

  /** A single opportunity's full detail. */
  async getOpportunity(
    _opportunityId: string,
  ): Promise<DataState<Opportunity>> {
    // TODO(career-data): GET /api/career/opportunities/{id}
    return comingSoon<Opportunity>("This opportunity is being populated.");
  },

  /** Organisations (employers) list, optionally filtered. */
  async getOrganisations(
    _params: OpportunityFilter = {},
  ): Promise<DataState<Organisation[]>> {
    // TODO(career-data): GET /api/career/organisations?...
    return comingSoon<Organisation[]>("Employer profiles are being populated.");
  },

  /** A single organisation profile. */
  async getOrganisation(
    _organisationId: string,
  ): Promise<DataState<Organisation>> {
    // TODO(career-data): GET /api/career/organisations/{id}
    return comingSoon<Organisation>(
      "This employer profile is being populated.",
    );
  },

  /** Scholarships — a secondary feature. */
  async getScholarships(): Promise<DataState<Scholarship[]>> {
    // TODO(career-data): GET /api/career/scholarships
    return comingSoon<Scholarship[]>("Scholarships are being populated.");
  },

  /** Upcoming application windows / deadlines. */
  async getApplicationWindows(): Promise<DataState<ApplicationWindow[]>> {
    // TODO(career-data): GET /api/career/application-windows
    return comingSoon<ApplicationWindow[]>(
      "Application windows are being populated.",
    );
  },

  // ─── User-owned (require an account; guests get `locked`) ────
  async getSavedItems(): Promise<DataState<SavedItem[]>> {
    // TODO(career-data): GET /api/career/saved
    return comingSoon<SavedItem[]>("Saving comes online with the live search.");
  },

  async saveItem(
    _entityType: SavedEntityType,
    _entityId: string,
    _label?: string,
  ): Promise<DataState<SavedItem>> {
    // TODO(career-data): POST /api/career/saved
    return comingSoon<SavedItem>();
  },

  async removeSavedItem(_savedItemId: string): Promise<DataState<null>> {
    // TODO(career-data): DELETE /api/career/saved/{id}
    return comingSoon<null>();
  },

  async getNotes(
    _entityType: SavedEntityType,
    _entityId: string,
  ): Promise<DataState<Note[]>> {
    // TODO(career-data): GET /api/career/notes?entityType=&entityId=
    return comingSoon<Note[]>(
      "Personal notes come online with the live search.",
    );
  },

  /** Every note the user has written, for the My World notes hub (grouped by
   *  `category` in the UI). Distinct from {@link getNotes}, which is scoped to a
   *  single entity's detail screen. */
  async getAllNotes(): Promise<DataState<Note[]>> {
    // TODO(career-data): GET /api/career/notes (all, current user)
    return comingSoon<Note[]>(
      "Your saved notes appear here once the live search is online.",
    );
  },

  async upsertNote(
    _entityType: SavedEntityType,
    _entityId: string,
    _body: string,
  ): Promise<DataState<Note>> {
    // TODO(career-data): POST /api/career/notes
    return comingSoon<Note>();
  },

  async getSubscriptions(): Promise<DataState<Subscription[]>> {
    // TODO(career-data): GET /api/career/subscriptions
    return comingSoon<Subscription[]>(
      "Opportunity alerts come online with jobs.",
    );
  },

  async subscribe(
    _target: SubscriptionTarget,
    _targetId: string,
  ): Promise<DataState<Subscription>> {
    // TODO(career-data): POST /api/career/subscriptions
    return comingSoon<Subscription>();
  },

  async unsubscribe(_subscriptionId: string): Promise<DataState<null>> {
    // TODO(career-data): DELETE /api/career/subscriptions/{id}
    return comingSoon<null>();
  },

  // ─── Phase 7: elite pathways · bridge · special flows ────────
  /** The 17 elite domains, for the Elite Pathways hub. */
  async getElitePathways(): Promise<DataState<ElitePathwaySummary[]>> {
    // TODO(career-data): GET /api/career/elite-pathways
    return comingSoon<ElitePathwaySummary[]>(
      "Elite pathways are being populated.",
    );
  },

  /** A single elite pathway (Formation / Pinnacle / bridge plan). */
  async getElitePathway(_pathwayId: string): Promise<DataState<ElitePathway>> {
    // TODO(career-data): GET /api/career/elite-pathways/{id}
    return comingSoon<ElitePathway>("This elite pathway is being populated.");
  },

  /** "Is Elite Right For Me" self-check questions (scored client-side). */
  async getEliteReadiness(): Promise<DataState<EliteReadinessQuestion[]>> {
    // TODO(career-data): GET /api/career/elite-pathways/readiness
    return comingSoon<EliteReadinessQuestion[]>(
      "The elite readiness check is being populated.",
    );
  },

  /** A 6-layer bridge plan (Model 5) for a (start → destination) pair. */
  async getBridgePlan(_bridgePlanId: string): Promise<DataState<BridgePlan>> {
    // TODO(career-data): GET /api/career/bridge-plans/{id}
    return comingSoon<BridgePlan>("This bridge plan is being populated.");
  },

  /** PhD non-academic routes (+ the PhD-quant standalone). */
  async getPhdRoutes(): Promise<DataState<PhdRoute[]>> {
    // TODO(career-data): GET /api/career/phd-routes
    return comingSoon<PhdRoute[]>("PhD pathways are being populated.");
  },

  /** Career-changer paths (4 types) + their skills-translation matrices. */
  async getCareerChangerPaths(): Promise<DataState<CareerChangerPath[]>> {
    // TODO(career-data): GET /api/career/career-changer
    return comingSoon<CareerChangerPath[]>(
      "Career-change pathways are being populated.",
    );
  },

  /** Qualification-upgrade routes (e.g. OND → Direct Entry → B.Sc). */
  async getQualificationUpgrades(): Promise<
    DataState<QualificationUpgrade[]>
  > {
    // TODO(career-data): GET /api/career/qualification-upgrades
    return comingSoon<QualificationUpgrade[]>(
      "Qualification-upgrade routes are being populated.",
    );
  },

  /** Chartership / credentials engine (CFA, COREN/ELR, ICAN/ACCA, PLAB…). */
  async getCharterships(): Promise<DataState<Chartership[]>> {
    // TODO(career-data): GET /api/career/charterships
    return comingSoon<Chartership[]>(
      "The chartership & credentials engine is being populated.",
    );
  },
};

export type CareerDataClient = typeof careerData;
