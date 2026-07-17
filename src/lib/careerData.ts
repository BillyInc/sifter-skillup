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
  type AdmissionInsight,
  type DomainV2,
  type DomainRoleV2,
  type CareerSearchResult,
  type JambDomainResult,
  type PivotResult,
  type NationalJambFloor,
  type ProgrammeSchoolCutoff,
  type SchoolAggregateFormula,
  type CourseCompetitiveness,
  type AdmissionSnapshotVersion,
  comingSoon,
  type MappingFeedback,
  type FeedbackType,
} from "../types/career";
import { request } from "./api";
import { getCached, setCached } from "./careerCache";
import type { StartingPointProfile } from "../types/onboarding";

/** TTL for cached domain/role detail payloads (15 min). */
const DETAIL_TTL_MS = 15 * 60 * 1000;

/** A cluster of domains for the context-free Domain Explorer (no programme). */
export interface DomainClusterGroup {
  cluster: string;
  domains: { id: string; name: string; inDemandScore?: number; eliteFlag?: boolean }[];
}

export interface SubjectCatalogItem {
  id: string;
  code?: string | null;
  name: string;
  aliases: string[];
  category?: string | null;
  streamTags: string[];
}

export interface JambProgrammeSuggestion {
  id: string;
  jambProgrammeId: string;
  jambName: string;
  jambFaculty?: string | null;
  degreeType?: string | null;
  isBlend?: boolean;
  programmeId?: string | null;
  canonicalProgrammeName?: string | null;
  displayName?: string | null;
  institutionType?: string | null;
  discipline?: string | null;
  mappingType?: string | null;
  mappingNote?: string | null;
  confidence?: string | null;
}

export interface SubjectProgrammeMatch extends JambProgrammeSuggestion {
  matchedSubjectCount: number;
  matchedSubjects: string[];
  requirementText?: string | null;
  matchBasis: "structured" | "text";
}

export interface JambProgrammeSchool {
  id?: string | null;
  schoolId: string;
  schoolName: string;
  institutionType?: string | null;
  jambProgrammeId?: string | null;
  jambName?: string | null;
  programmeId?: string | null;
  programmeName?: string | null;
  year?: number | null;
  aggregateCutoff?: number | null;
  jambCutoff?: number | null;
  postUtmeCutoff?: number | null;
  form?: "UTME" | "DE" | null;
  sourceUrl?: string | null;
}

export interface StudentAffiliation {
  id: string;
  schoolId: string;
  schoolName: string;
  institutionType?: string | null;
  providerSessionOnly?: boolean;
  source?: string;
  verificationLevel: "self_reported" | "code_verified" | "provisioned";
  createdAt?: string;
}

// Flip to true per-area as real data is wired (kept here so screens can branch
// without importing backend details). All false in this phase.
export const CAREER_DATA_LIVE = {
  universityMapping: true,
  nceMapping: false,
  opportunities: false,
  elitePathways: false,
  scholarships: false,
} as const;

// ─── Read API ─────────────────────────────────────────────────
export const careerData = {
  // ─── Student live pipeline ─────────────────────────────────
  async getStartingPoint(): Promise<DataState<StartingPointProfile | null>> {
    try {
      return await request<DataState<StartingPointProfile | null>>(
        `/api/student/starting-point`,
      );
    } catch {
      return comingSoon<StartingPointProfile | null>(
        "Starting point is temporarily unavailable.",
      );
    }
  },

  async saveStartingPoint(
    profile: StartingPointProfile,
  ): Promise<DataState<StartingPointProfile>> {
    try {
      return await request<DataState<StartingPointProfile>>(
        `/api/student/starting-point`,
        { method: "POST", body: JSON.stringify(profile) },
      );
    } catch {
      return comingSoon<StartingPointProfile>(
        "Could not save starting point to the server.",
      );
    }
  },

  async getSubjects(
    q?: string,
    stream?: string,
  ): Promise<DataState<SubjectCatalogItem[]>> {
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (stream) qs.set("stream", stream);
      return await request<DataState<SubjectCatalogItem[]>>(
        `/api/student/subjects${qs.toString() ? `?${qs.toString()}` : ""}`,
      );
    } catch {
      return comingSoon<SubjectCatalogItem[]>("Subject catalog is unavailable.");
    }
  },

  async searchJambProgrammes(
    q: string,
  ): Promise<DataState<JambProgrammeSuggestion[]>> {
    try {
      return await request<DataState<JambProgrammeSuggestion[]>>(
        `/api/student/jamb-programmes?q=${encodeURIComponent(q)}`,
      );
    } catch {
      return comingSoon<JambProgrammeSuggestion[]>(
        "JAMB programme search is unavailable.",
      );
    }
  },

  async getProgrammesBySubjects(
    subjects: string[],
    stream?: string,
  ): Promise<DataState<SubjectProgrammeMatch[]>> {
    try {
      const qs = new URLSearchParams();
      qs.set("subjects", subjects.join(","));
      if (stream) qs.set("stream", stream);
      return await request<DataState<SubjectProgrammeMatch[]>>(
        `/api/student/programmes/by-subjects?${qs.toString()}`,
      );
    } catch {
      return comingSoon<SubjectProgrammeMatch[]>(
        "Subject-to-programme matching is unavailable.",
      );
    }
  },

  async getJambProgrammeSchools(
    jambProgrammeId: string,
  ): Promise<DataState<JambProgrammeSchool[]>> {
    try {
      return await request<DataState<JambProgrammeSchool[]>>(
        `/api/student/jamb-programmes/${encodeURIComponent(jambProgrammeId)}/schools`,
      );
    } catch {
      return comingSoon<JambProgrammeSchool[]>(
        "Schools and cut-offs are unavailable.",
      );
    }
  },

  async getJambProgrammeDomains(
    jambProgrammeId: string,
  ): Promise<DataState<JambDomainResult>> {
    try {
      return await request<DataState<JambDomainResult>>(
        `/api/student/jamb-programmes/${encodeURIComponent(jambProgrammeId)}/domains`,
      );
    } catch {
      return comingSoon<JambDomainResult>(
        "Domain paths are unavailable.",
      );
    }
  },

  async affiliateWithSchoolCode(
    code: string,
  ): Promise<DataState<StudentAffiliation>> {
    try {
      return await request<DataState<StudentAffiliation>>(
        `/api/student/affiliations/school-code`,
        { method: "POST", body: JSON.stringify({ code }) },
      );
    } catch {
      return comingSoon<StudentAffiliation>(
        "Could not verify that school code.",
      );
    }
  },

  async getMyAffiliations(): Promise<DataState<StudentAffiliation[]>> {
    try {
      return await request<DataState<StudentAffiliation[]>>(
        `/api/student/affiliations/me`,
      );
    } catch {
      return comingSoon<StudentAffiliation[]>(
        "Affiliations are temporarily unavailable.",
      );
    }
  },

  /** Search programmes by free text, optionally filtered by institution type. */
  async searchProgrammes(
    query: string,
    institutionType?: InstitutionType,
  ): Promise<DataState<ProgrammeSearchResult[]>> {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (institutionType) params.set("institution_type", institutionType);
    const qs = params.toString();
    try {
      return await request<DataState<ProgrammeSearchResult[]>>(
        `/api/career/programmes${qs ? `?${qs}` : ""}`,
      );
    } catch {
      return comingSoon<ProgrammeSearchResult[]>(
        "Programme search is temporarily unavailable.",
      );
    }
  },

  /** Full programme detail incl. its domain links (with match types). */
  async getProgramme(programmeId: string): Promise<DataState<Programme>> {
    try {
      return await request<DataState<Programme>>(
        `/api/career/programmes/${encodeURIComponent(programmeId)}`,
      );
    } catch {
      return comingSoon<Programme>("Programme intelligence is being populated.");
    }
  },

  /** All domains grouped by cluster, for the context-free Domain Explorer. */
  async getDomainClusters(): Promise<DataState<DomainClusterGroup[]>> {
    // TODO(career-data): GET /api/career/domains (grouped by cluster)
    return comingSoon<DomainClusterGroup[]>(
      "Explore career domains by cluster, then open the paths that match your programme and goals.",
    );
  },

  /** Disambiguation search: domains, roles (+aliases), programmes. */
  async searchCareer(query: string): Promise<DataState<CareerSearchResult>> {
    try {
      return await request<DataState<CareerSearchResult>>(
        `/api/career/search?q=${encodeURIComponent(query)}`,
      );
    } catch {
      return comingSoon<CareerSearchResult>(
        "Search is temporarily unavailable.",
      );
    }
  },

  /** JAMB name → domains (the SS/UTME student entry point). */
  async getJambDomains(jambName: string): Promise<DataState<JambDomainResult>> {
    try {
      return await request<DataState<JambDomainResult>>(
        `/api/career/jamb/${encodeURIComponent(jambName)}/domains`,
      );
    } catch {
      return comingSoon<JambDomainResult>(
        "Domains for this JAMB programme are being populated.",
      );
    }
  },

  /** A domain incl. its domain-level bridge skills and role list. */
  async getDomain(_domainId: string): Promise<DataState<Domain>> {
    // TODO(career-data): GET /api/career/domains/{id}
    return comingSoon<Domain>("See what this field does, the skills it needs, and the roles it can unlock.");
  },

  /** v2 domain detail: foundation skills, subgroups, tools, certs, demand metrics. */
  async getDomainV2(domainKey: string): Promise<DataState<DomainV2>> {
    const cacheKey = `domain_${domainKey}`;
    try {
      const res = await request<DataState<DomainV2>>(
        `/api/career/domains/${encodeURIComponent(domainKey)}`,
      );
      // Cache successful `real` payloads for instant re-hydration / offline.
      if (res.status === "real") setCached(cacheKey, res, DETAIL_TTL_MS);
      return res;
    } catch {
      // Offline / transient: serve a cached copy if we have a fresh one.
      const cached = await getCached<DataState<DomainV2>>(cacheKey);
      if (cached) return cached;
      return comingSoon<DomainV2>("See what this field does, the skills it needs, and the roles it can unlock.");
    }
  },

  /** A role incl. its role-level bridge skills and coverage. */
  async getRole(_roleId: string): Promise<DataState<Role>> {
    // TODO(career-data): GET /api/career/roles/{id}
    return comingSoon<Role>("Understand the role, the bridge skills, and the proof you need to become credible.");
  },

  /** v2 role detail: essential/optional skills, tier, appearsIn, demand metrics. */
  async getRoleV2(roleKey: string): Promise<DataState<DomainRoleV2>> {
    const cacheKey = `role_${roleKey}`;
    try {
      const res = await request<DataState<DomainRoleV2>>(
        `/api/career/roles/${encodeURIComponent(roleKey)}`,
      );
      if (res.status === "real") setCached(cacheKey, res, DETAIL_TTL_MS);
      return res;
    } catch {
      const cached = await getCached<DataState<DomainRoleV2>>(cacheKey);
      if (cached) return cached;
      return comingSoon<DomainRoleV2>("Understand the role, the bridge skills, and the proof you need to become credible.");
    }
  },

  /** Opportunities matched to a programme/domain, eligibility-filtered.
   *  Backed by /api/career/opportunities — returns coming_soon while the
   *  content tables are empty (live data only, no mock rows). */
  async getOpportunities(
    params: {
      programmeId?: string;
      domainId?: string;
      roleId?: string;
    } & OpportunityFilter = {},
  ): Promise<DataState<Opportunity[]>> {
    try {
      const qs = new URLSearchParams();
      if (params.domainId) qs.set("domain_id", params.domainId);
      if (params.institutionType) qs.set("institution_type", params.institutionType);
      if (params.scope) qs.set("scope", params.scope);
      if (params.type) qs.set("opp_type", params.type);
      if (params.workMode) qs.set("work_mode", params.workMode);
      if (params.likelihood) qs.set("likelihood", params.likelihood);
      if (params.region) qs.set("region", params.region);
      return await request<DataState<Opportunity[]>>(
        `/api/career/opportunities${qs.toString() ? `?${qs.toString()}` : ""}`,
      );
    } catch {
      return comingSoon<Opportunity[]>("Find internships, jobs, and entry points that fit your programme, level, and location.");
    }
  },

  /** A single opportunity's full detail. */
  async getOpportunity(
    opportunityId: string,
  ): Promise<DataState<Opportunity>> {
    try {
      return await request<DataState<Opportunity>>(
        `/api/career/opportunities/${encodeURIComponent(opportunityId)}`,
      );
    } catch {
      return comingSoon<Opportunity>("Review the role, eligibility, deadlines, and next action before you apply.");
    }
  },

  /** Organisations (employers) list, optionally filtered. */
  async getOrganisations(
    _params: OpportunityFilter = {},
  ): Promise<DataState<Organisation[]>> {
    // TODO(career-data): GET /api/career/organisations?...
    return comingSoon<Organisation[]>("Discover employers, what they hire for, and where graduates can enter.");
  },

  /** A single organisation profile. */
  async getOrganisation(
    _organisationId: string,
  ): Promise<DataState<Organisation>> {
    // TODO(career-data): GET /api/career/organisations/{id}
    return comingSoon<Organisation>(
      "See what this employer does, the roles it hires for, and the routes into its team.",
    );
  },

  /** Scholarships — a secondary feature. */
  async getScholarships(): Promise<DataState<Scholarship[]>> {
    try {
      return await request<DataState<Scholarship[]>>(`/api/career/scholarships`);
    } catch {
      return comingSoon<Scholarship[]>("Find funded routes, eligibility rules, deadlines, and what each award actually covers.");
    }
  },

  /** Upcoming application windows / deadlines (status derived server-side). */
  async getApplicationWindows(): Promise<DataState<ApplicationWindow[]>> {
    try {
      return await request<DataState<ApplicationWindow[]>>(
        `/api/career/application-windows`,
      );
    } catch {
      return comingSoon<ApplicationWindow[]>(
        "Track scholarship, fellowship, admission, and job windows before they close.",
      );
    }
  },

  // ─── User-owned (require an account; guests get `locked`) ────
  async getSavedItems(): Promise<DataState<SavedItem[]>> {
    try {
      return await request<DataState<SavedItem[]>>(`/api/career/saved`);
    } catch {
      return comingSoon<SavedItem[]>("Saved items are temporarily unavailable.");
    }
  },

  async saveItem(
    entityType: SavedEntityType,
    entityId: string,
    label?: string,
  ): Promise<DataState<SavedItem>> {
    try {
      return await request<DataState<SavedItem>>(`/api/career/saved`, {
        method: "POST",
        body: JSON.stringify({ entityType, entityId, label }),
      });
    } catch {
      return comingSoon<SavedItem>("Couldn't save that right now.");
    }
  },

  async removeSavedItem(savedItemId: string): Promise<DataState<null>> {
    try {
      return await request<DataState<null>>(
        `/api/career/saved/${encodeURIComponent(savedItemId)}`,
        { method: "DELETE" },
      );
    } catch {
      return comingSoon<null>();
    }
  },

  async getNotes(
    entityType: SavedEntityType,
    entityId: string,
  ): Promise<DataState<Note[]>> {
    try {
      const qs = new URLSearchParams({
        entity_type: entityType,
        entity_id: entityId,
      });
      return await request<DataState<Note[]>>(
        `/api/career/notes?${qs.toString()}`,
      );
    } catch {
      return comingSoon<Note[]>("Notes are temporarily unavailable.");
    }
  },

  /** Every note the user has written, for the My World notes hub (grouped by
   *  `category` in the UI). Distinct from {@link getNotes}, which is scoped to a
   *  single entity's detail screen. */
  async getAllNotes(): Promise<DataState<Note[]>> {
    try {
      return await request<DataState<Note[]>>(`/api/career/notes`);
    } catch {
      return comingSoon<Note[]>("Notes are temporarily unavailable.");
    }
  },

  // ─── Phase 7: pivot / bridge / career-changer ────────────────
  /** Career-changer pivot (Scenario A): ranked domains by transferable-skill overlap. */
  async getPivot(fromDomainKey: string): Promise<DataState<PivotResult>> {
    try {
      return await request<DataState<PivotResult>>(
        `/api/career/pivot?from_domain_key=${encodeURIComponent(fromDomainKey)}`,
      );
    } catch {
      return comingSoon<PivotResult>("Pivot suggestions are temporarily unavailable.");
    }
  },

  /** Career-changer gap analysis (Scenario B1/B2): overlap with a target domain or role. */
  async getPivotGap(
    fromDomainKey: string,
    toDomainKey?: string,
    toRoleKey?: string,
  ): Promise<DataState<any>> {
    try {
      const params = new URLSearchParams({ from_domain_key: fromDomainKey });
      if (toDomainKey) params.set("to_domain_key", toDomainKey);
      if (toRoleKey) params.set("to_role_key", toRoleKey);
      return await request<DataState<any>>(
        `/api/career/pivot/gap?${params.toString()}`,
      );
    } catch {
      return comingSoon<any>("Gap analysis is temporarily unavailable.");
    }
  },

  /** Save the user's prior field (domain) selection during onboarding. */
  async savePriorField(domainKey: string): Promise<DataState<{ priorFieldDomainKey: string }>> {
    try {
      return await request<DataState<{ priorFieldDomainKey: string }>>(
        `/api/career/saved/prior-field`,
        { method: "POST", body: JSON.stringify({ domainKey }) },
      );
    } catch {
      return comingSoon<{ priorFieldDomainKey: string }>(
        "Could not save prior field.",
      );
    }
  },

  // ─── Phase 8: admission intelligence ─────────────────────────
  /** Admission insight for a specific programme. */
  async getAdmissionInsight(programmeId: string): Promise<DataState<AdmissionInsight>> {
    try {
      return await request<DataState<AdmissionInsight>>(
        `/api/admission/jamb/${encodeURIComponent(programmeId)}/insight`,
      );
    } catch {
      return comingSoon<AdmissionInsight>(
        "Admission data is being compiled.",
      );
    }
  },

  /** Active admission snapshot version. */
  async getAdmissionSnapshot(): Promise<DataState<AdmissionSnapshotVersion>> {
    try {
      return await request<DataState<AdmissionSnapshotVersion>>(
        `/api/admission/snapshot`,
      );
    } catch {
      return comingSoon<AdmissionSnapshotVersion>(
        "Admission snapshot is being compiled.",
      );
    }
  },

  /** National JAMB minimum floor score. */
  async getJambFloor(year?: number): Promise<DataState<NationalJambFloor>> {
    try {
      const qs = year ? `?year=${year}` : "";
      return await request<DataState<NationalJambFloor>>(
        `/api/admission/floor${qs}`,
      );
    } catch {
      return comingSoon<NationalJambFloor>(
        "JAMB floor is temporarily unavailable.",
      );
    }
  },

  /** Programme × school cut-offs. */
  async getCutoffs(
    params: { schoolId?: string; programmeId?: string; year?: number; form?: "UTME" | "DE" } = {},
  ): Promise<DataState<ProgrammeSchoolCutoff[]>> {
    try {
      const qs = new URLSearchParams();
      if (params.schoolId) qs.set("school_id", params.schoolId);
      if (params.programmeId) qs.set("programme_id", params.programmeId);
      if (params.year) qs.set("year", String(params.year));
      if (params.form) qs.set("form", params.form);
      return await request<DataState<ProgrammeSchoolCutoff[]>>(
        `/api/admission/cutoffs${qs.toString() ? `?${qs.toString()}` : ""}`,
      );
    } catch {
      return comingSoon<ProgrammeSchoolCutoff[]>(
        "Cut-offs are temporarily unavailable.",
      );
    }
  },

  /** School aggregate formula (JAMB% + Post-UTME% + O'level%). */
  async getSchoolFormula(
    schoolId: string,
    year?: number,
  ): Promise<DataState<SchoolAggregateFormula | null>> {
    try {
      const qs = new URLSearchParams({ school_id: schoolId });
      if (year) qs.set("year", String(year));
      return await request<DataState<SchoolAggregateFormula | null>>(
        `/api/admission/formula?${qs.toString()}`,
      );
    } catch {
      return comingSoon<SchoolAggregateFormula | null>(
        "Formula data is temporarily unavailable.",
      );
    }
  },

  /** National broad-course competitiveness. */
  async getCompetitiveness(
    year?: number,
    broadCourse?: string,
  ): Promise<DataState<CourseCompetitiveness[]>> {
    try {
      const qs = new URLSearchParams();
      if (year) qs.set("year", String(year));
      if (broadCourse) qs.set("broad_course", broadCourse);
      const q = qs.toString();
      return await request<DataState<CourseCompetitiveness[]>>(
        `/api/admission/competitiveness${q ? `?${q}` : ""}`,
      );
    } catch {
      return comingSoon<CourseCompetitiveness[]>(
        "Competitiveness data is temporarily unavailable.",
      );
    }
  },

  /** Typeahead over universities with admission data (onboarding picker). */
  async searchAdmissionSchools(
    q: string,
  ): Promise<DataState<{ id: string; name: string; institutionType: string }[]>> {
    try {
      return await request<
        DataState<{ id: string; name: string; institutionType: string }[]>
      >(`/api/admission/schools?q=${encodeURIComponent(q)}`);
    } catch {
      return comingSoon("School search is temporarily unavailable.");
    }
  },

  /** Typeahead over programmes with published cut-offs (onboarding picker). */
  async searchAdmissionProgrammes(
    q: string,
  ): Promise<
    DataState<
      { id: string; name: string; discipline?: string; institutionType: string }[]
    >
  > {
    try {
      return await request<
        DataState<
          {
            id: string;
            name: string;
            discipline?: string;
            institutionType: string;
          }[]
        >
      >(`/api/admission/programmes?q=${encodeURIComponent(q)}`);
    } catch {
      return comingSoon("Programme search is temporarily unavailable.");
    }
  },

  // ─── Note management (used by My World) ───────────────────────
  async upsertNote(
    entityType: SavedEntityType,
    entityId: string,
    body: string,
  ): Promise<DataState<Note>> {
    try {
      return await request<DataState<Note>>(`/api/career/notes`, {
        method: "POST",
        body: JSON.stringify({ entityType, entityId, body }),
      });
    } catch {
      return comingSoon<Note>("Couldn't save that note right now.");
    }
  },

  async updateNote(
    noteId: string,
    body?: string,
    category?: string,
    entityLabel?: string,
  ): Promise<DataState<Note>> {
    try {
      const payload: Record<string, string> = { id: noteId };
      if (body !== undefined) payload.body = body;
      if (category !== undefined) payload.category = category;
      if (entityLabel !== undefined) payload.entityLabel = entityLabel;
      // Backend upserts on POST /notes when an `id` is present.
      return await request<DataState<Note>>(`/api/career/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      return comingSoon<Note>("Updating notes is temporarily unavailable.");
    }
  },

  async deleteNote(noteId: string): Promise<DataState<null>> {
    try {
      return await request<DataState<null>>(
        `/api/career/notes/${encodeURIComponent(noteId)}`,
        { method: "DELETE" },
      );
    } catch {
      return comingSoon<null>("Deleting notes is temporarily unavailable.");
    }
  },

  async getSubscriptions(): Promise<DataState<Subscription[]>> {
    try {
      return await request<DataState<Subscription[]>>(
        `/api/career/subscriptions`,
      );
    } catch {
      return comingSoon<Subscription[]>(
        "Subscriptions are temporarily unavailable.",
      );
    }
  },

  async subscribe(
    target: SubscriptionTarget,
    targetId: string,
  ): Promise<DataState<Subscription>> {
    try {
      return await request<DataState<Subscription>>(
        `/api/career/subscriptions`,
        { method: "POST", body: JSON.stringify({ target, targetId }) },
      );
    } catch {
      return comingSoon<Subscription>("Couldn't subscribe right now.");
    }
  },

  async unsubscribe(subscriptionId: string): Promise<DataState<null>> {
    try {
      return await request<DataState<null>>(
        `/api/career/subscriptions/${encodeURIComponent(subscriptionId)}`,
        { method: "DELETE" },
      );
    } catch {
      return comingSoon<null>();
    }
  },

  // ─── Phase 7: elite pathways · bridge · special flows ────────
  /** The 17 elite domains, for the Elite Pathways hub. */
  async getElitePathways(): Promise<DataState<ElitePathwaySummary[]>> {
    try {
      return await request<DataState<ElitePathwaySummary[]>>(
        `/api/career/elite-pathways`,
      );
    } catch {
      return comingSoon<ElitePathwaySummary[]>(
        "Compare high-selectivity paths and the Nigerian bridge into each one.",
      );
    }
  },

  /** A single elite pathway (Formation / Pinnacle / bridge plan). */
  async getElitePathway(pathwayId: string): Promise<DataState<ElitePathway>> {
    try {
      return await request<DataState<ElitePathway>>(
        `/api/career/elite-pathways/${encodeURIComponent(pathwayId)}`,
      );
    } catch {
      return comingSoon<ElitePathway>("See the global standard, Nigerian gap, bridge steps, costs, entry points, and proof.");
    }
  },

  /** "Is Elite Right For Me" self-check questions (scored client-side). */
  async getEliteReadiness(): Promise<DataState<EliteReadinessQuestion[]>> {
    // TODO(career-data): GET /api/career/elite-pathways/readiness
    return comingSoon<EliteReadinessQuestion[]>(
      "Check fit, trade-offs, and starting point before committing to an elite path.",
    );
  },

  /** A 6-layer bridge plan (Model 5) for a (start → destination) pair. */
  async getBridgePlan(bridgePlanId: string): Promise<DataState<BridgePlan>> {
    try {
      return await request<DataState<BridgePlan>>(
        `/api/career/bridge-plans/${encodeURIComponent(bridgePlanId)}`,
      );
    } catch {
      return comingSoon<BridgePlan>("Follow the six-step bridge from your Nigerian starting point to the target route.");
    }
  },

  /** PhD non-academic routes (+ the PhD-quant standalone). */
  async getPhdRoutes(): Promise<DataState<PhdRoute[]>> {
    // TODO(career-data): GET /api/career/phd-routes
    return comingSoon<PhdRoute[]>("Map a doctorate into research, policy, quant, consulting, R&D, or venture paths.");
  },

  /** Career-changer paths (4 types) + their skills-translation matrices. */
  async getCareerChangerPaths(): Promise<DataState<CareerChangerPath[]>> {
    // TODO(career-data): GET /api/career/career-changer
    return comingSoon<CareerChangerPath[]>(
      "Translate your current experience into adjacent pivots, fast-stability routes, and longer-term paths.",
    );
  },

  /** Qualification-upgrade routes (e.g. OND → Direct Entry → B.Sc). */
  async getQualificationUpgrades(): Promise<
    DataState<QualificationUpgrade[]>
  > {
    // TODO(career-data): GET /api/career/qualification-upgrades
    return comingSoon<QualificationUpgrade[]>(
      "Move from OND, HND, NCE, or field credentials into recognised degree and professional routes.",
    );
  },

  /** Chartership / credentials engine (CFA, COREN/ELR, ICAN/ACCA, PLAB…). */
  async getCharterships(): Promise<DataState<Chartership[]>> {
    // TODO(career-data): GET /api/career/charterships
    return comingSoon<Chartership[]>(
      "Find credentials that travel, the exemptions you can claim, and where recognition is limited.",
    );
  },

  // ── Expert mapping feedback ────────────────────────────────
  /** Get all mapping feedback items (expert review dashboard). */
  async getFeedback(): Promise<DataState<MappingFeedback[]>> {
    try {
      return await request<DataState<MappingFeedback[]>>(`/api/career/feedback`);
    } catch {
      return comingSoon<MappingFeedback[]>("Mapping feedback is being populated.");
    }
  },

  /** Submit a single mapping feedback item. */
  async submitFeedback(
    edgeType: string,
    sourceId: string,
    targetId: string,
    feedbackType: FeedbackType,
    notes?: string,
  ): Promise<DataState<MappingFeedback>> {
    try {
      return await request<DataState<MappingFeedback>>(`/api/career/feedback`, {
        method: "POST",
        body: JSON.stringify({ edgeType, sourceId, targetId, feedbackType, notes }),
      });
    } catch {
      return comingSoon<MappingFeedback>("Feedback submission is temporarily unavailable.");
    }
  },
};

export type CareerDataClient = typeof careerData;
