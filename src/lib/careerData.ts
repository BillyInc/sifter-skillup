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
  type ProgrammeCurriculumContract,
  type Domain,
  type Role,
  type Opportunity,
  type OpportunityFilter,
  type Organisation,
  type Scholarship,
  type ApplicationWindow,
  type SavedItem,
  type Note,
  type NoteEntityType,
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
  type SearchIntent,
  type SkillDiscoveryResult,
  type JambDomainResult,
  type PivotResult,
  type DomainMatchType,
  type NationalJambFloor,
  type ProgrammeSchoolCutoff,
  type SchoolAggregateFormula,
  type CourseCompetitiveness,
  type AdmissionSnapshotVersion,
  comingSoon,
  error,
  pending,
  type MappingFeedback,
  type FeedbackType,
} from "../types/career";
import { request } from "./api";
import { getCached, getCachedStale, setCached, queueWrite, cancelQueuedSave, flushQueue } from "./careerCache";
import type { StartingPointProfile } from "../types/onboarding";
import {
  sanitizeStudentDataState,
  sanitizeStudentDomain,
  sanitizeStudentProgramme,
  sanitizeStudentRole,
} from "./studentCareerBoundary";

/** Reference data is refreshed daily; writes and account data never use this cache. */
const REFERENCE_TTL_MS = 24 * 60 * 60 * 1000;
const SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DETAIL_TTL_MS = REFERENCE_TTL_MS;

async function readThrough<T>(
  key: string,
  fetcher: () => Promise<DataState<T>>,
  unavailableMessage: string,
  ttlMs: number = REFERENCE_TTL_MS,
): Promise<DataState<T>> {
  const cached = await getCached<DataState<T>>(key);
  const stale = await getCachedStale<DataState<T>>(key);
  try {
    const result = await fetcher();
    if (result.status === "real") {
      await setCached(key, result, ttlMs);
      return result;
    }
    // Keep a previously verified reference result usable during a transient
    // backend/Supabase outage; never replace it with a developer-facing stub.
    return cached ?? stale ?? result;
  } catch {
    return stale ?? cached ?? error<T>(unavailableMessage);
  }
}

async function updateSavedItemsCache(next: SavedItem[]): Promise<void> {
  await setCached(
    "saved_items",
    {
      status: "real",
      data: next,
      meta: {
        verification: "pending",
        notice: "This list includes device-pending changes until you reconnect.",
      },
    } satisfies DataState<SavedItem[]>,
    DETAIL_TTL_MS,
  );
}

/** A cluster of domains for the context-free Domain Explorer (no programme). */
export interface DomainClusterGroup {
  cluster: string;
  domains: {
    id: string;
    name: string;
    eliteFlag?: boolean;
  }[];
}

export interface GuidanceReportPath {
  id?: string;
  studentId?: string;
  source?: string;
  path: {
    academicContext?: Record<string, unknown>;
    subjects?: { olevel?: string[]; utme?: string[] };
    discoveryDoor?: string;
    programme?: Record<string, unknown>;
    /** Saved programme/university choices; `programme` remains the active one. */
    programmes?: Record<string, unknown>[];
    university?: Record<string, unknown>;
    /** Evidence state for the subject check used to reach the programme. */
    subjectMatch?: {
      status?: "verified" | "partial" | "unavailable" | "not_checked" | string;
      examType?: "utme" | "olevel" | "combined" | string;
      notice?: string;
    };
    universityRequirements?: Record<string, unknown>;
    requirements?: Record<string, unknown>;
    domains?: GuidanceDomainSelection[];
    subgroups?: Record<string, unknown>[];
    roles?: Record<string, unknown>[];
    notes?: string[];
    /** Account-scoped checkpoint for reopening an unfinished guidance flow. */
    resume?: Record<string, unknown>;
  };
  updatedAt?: string;
}

/** Persisted student intent for a programme-linked domain. Internal ordering
 * is used to resume the route; it is never rendered as a raw rank. */
export interface GuidanceDomainSelection {
  [key: string]: unknown;
  id: string;
  name: string;
  matchType?: DomainMatchType;
  intent?: "primary" | "secondary";
  sequence?: number;
}

export interface SubjectCatalogItem {
  id: string;
  code?: string | null;
  name: string;
  aliases: string[];
  category?: string | null;
  streamTags: string[];
}

export interface UniversityRequirementException {
  examType?: "utme" | "olevel" | "direct_entry" | "general" | string;
  text?: string | null;
  sourceFile?: string | null;
  sourceLabel?: string | null;
  parseStatus?: "parsed" | "needs_review" | "not_subject_rule" | string;
}

export type RequirementEvidenceStatus = "complete" | "review_only" | "source_missing" | string;

export interface RequirementSourceEvidence {
  layer?: "utme" | "olevel" | "direct_entry" | string;
  sourceFile?: string | null;
  page?: number | null;
  tableRow?: number | null;
  sourceStatus?: "exact" | "inherited_shared" | "source_blank" | "source_row_not_found" | string;
  resolution?: string | null;
  text?: string | null;
  sourceLabel?: string | null;
}

export interface UniversityStructuredSubjectRule {
  examType?: "utme" | "olevel" | string;
  scope?: "full" | "partial" | string;
  text?: string | null;
  minimumRequired?: number | null;
  conditionText?: string | null;
  subjectPool?: string[];
  subjectItems?: Array<{
    name: string;
    code?: string | null;
    requirementRole?: string | null;
    groupKey?: string | null;
    minimumFromGroup?: number | null;
  }>;
}

export interface JambProgrammeSuggestion {
  id: string;
  jambProgrammeId: string;
  jambName: string;
  /** Exact source/JAMB name used as the student-facing identity. */
  studentName?: string | null;
  jambFaculty?: string | null;
  degreeType?: string | null;
  /** Canonical programme award fields, when the reviewed programme registry supplies them. */
  qualification?: string | null;
  durationYears?: number | null;
  isBlend?: boolean;
  programmeId?: string | null;
  institutionType?: string | null;
  /** Clean CCMAS course/ability contract; absent until its programme rows are seeded. */
  curriculumContract?: ProgrammeCurriculumContract;
  schoolNames?: string[];
  schoolCount?: number;
  schoolOfferings?: {
    schoolId?: string | null;
    schoolName: string;
    officialName?: string | null;
    shortName?: string | null;
    programmeName: string;
    /** Exact JAMB/source name for this offering; never inferred from CCMAS. */
    studentName?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    universityUtmeSubjects?: string | null;
    universityOlevelRequirement?: string | null;
    universityDirectEntry?: string | null;
    universityNote?: string | null;
    universityRequirementExceptions?: UniversityRequirementException[];
    universityStructuredSubjectRules?: UniversityStructuredSubjectRule[];
    universityExceptionStatus?: "none" | "structured" | "needs_confirmation" | string;
    universityEligibilityStatus?: string;
    universityRequirementStatus?: RequirementEvidenceStatus;
    universityRequirementNotice?: string | null;
    hasUniversityException?: boolean;
  }[];
  /**
   * What this degree teaches — derived from the CCMAS course learning
   * outcomes. `skillsTechnical` is the differentiating set ("explain the
   * concept of random variables…"), `skillsTransferable` the cross-cutting one
   * ("collaboration", "information literacy").
   *
   * The CCMAS presentation fields that used to sit here
   * (canonicalProgrammeName, displayName, discipline, mappingType,
   * mappingNote, confidence) are gone. CCMAS is how a JAMB name resolves to
   * domains and roles; it is not a curriculum fact a student reads. They see
   * the JAMB name their school uses, and what it teaches.
   */
  skillsTechnical?: string[] | null;
  skillsTransferable?: string[] | null;
  skillsCount?: number | null;
  /** Programme-owned explanations attached through the canonical CCMAS row. */
  contextItems?: import("@/types/career").CareerContextItem[];
  /** Programme-owned reviewed reading and learning links. */
  resources?: import("@/types/career").CareerLearningResource[];
}

/** General requirements block from programme_subject_requirements (brochure
 *  text). `variesByInstitution` is true when parse_status = needs_review —
 *  the requirement is institution-variant prose, not a data gap. */
export interface JambProgrammeRequirements {
  utmeSubjects: string | null;
  olevelRequirement: string | null;
  directEntry: string | null;
  parseStatus: "parsed" | "unparsed" | "needs_review" | null;
  variesByInstitution: boolean;
  requirementStatus?: RequirementEvidenceStatus;
  parsedAt?: string | null;
  sourceEvidence?: RequirementSourceEvidence[];
}

/** Full detail payload of GET /api/student/jamb-programmes/{id}. The
 *  `requirements` block is absent when no requirements row exists. */
export interface JambProgrammeDetail extends JambProgrammeSuggestion {
  requirements?: JambProgrammeRequirements;
}

export interface SubjectProgrammeMatch extends JambProgrammeSuggestion {
  matchedSubjectCount: number;
  matchedSubjects: string[];
  missingSubjects?: string[];
  minimumRequired?: number;
  minimumGap?: number;
  olevelMatchedSubjectCount?: number;
  olevelMatchedSubjects?: string[];
  olevelMissingSubjects?: string[];
  olevelRequirementText?: string | null;
  eligibilityStatus?:
    | "eligible"
    | "utme_match_olevel_gap"
    | "utme_match_olevel_unparsed"
    | string;
  requirementText?: string | null;
  matchBasis: "structured" | "text" | "utme" | "olevel" | "combined";
}

export interface JambProgrammeSchool {
  id?: string | null;
  schoolId: string;
  schoolName: string;
  officialName?: string | null;
  shortName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  institutionType?: string | null;
  jambProgrammeId?: string | null;
  jambName?: string | null;
  studentName?: string | null;
  programmeId?: string | null;
  programmeName?: string | null;
  universityUtmeSubjects?: string | null;
  universityOlevelRequirement?: string | null;
  universityDirectEntry?: string | null;
  universityNote?: string | null;
  universityRequirementExceptions?: UniversityRequirementException[];
  universityStructuredSubjectRules?: UniversityStructuredSubjectRule[];
  universityExceptionStatus?: "none" | "structured" | "needs_confirmation" | string;
  universityEligibilityStatus?: string;
  universityRequirementStatus?: RequirementEvidenceStatus;
  universityRequirementNotice?: string | null;
  hasUniversityException?: boolean;
}

/** A university in the admission registry (school typeahead result). */
export interface AdmissionSchool {
  id: string;
  name: string;
  institutionType: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface SchoolFaculty {
  name: string;
  value: string;
}

/**
 * A course as a specific university lists it — the enrolled student's entry
 * point. `jambName` is the exact source identity for the university offering;
 * a genuinely different JAMB name is a separate result.
 */
export interface SchoolProgrammeOffering {
  schoolId: string;
  schoolName: string;
  officialName?: string | null;
  shortName?: string | null;
  institutionType?: string | null;
  jambProgrammeId: string;
  jambName: string;
  studentName?: string | null;
  utmeSubjects?: string | null;
  olevelRequirement?: string | null;
  directEntry?: string | null;
  universityUtmeSubjects?: string | null;
  universityOlevelRequirement?: string | null;
  universityDirectEntry?: string | null;
  universityNote?: string | null;
  universityRequirementExceptions?: UniversityRequirementException[];
  universityStructuredSubjectRules?: UniversityStructuredSubjectRule[];
  universityExceptionStatus?: "none" | "structured" | "needs_confirmation" | string;
  universityEligibilityStatus?: string;
  universityRequirementStatus?: RequirementEvidenceStatus;
  universityRequirementNotice?: string | null;
  hasUniversityException?: boolean;
  skillsTechnical?: string[] | null;
  skillsTransferable?: string[] | null;
  skillsCount?: number | null;
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
    examType?: "utme" | "olevel",
  ): Promise<DataState<SubjectCatalogItem[]>> {
    const key = `subjects:${(q ?? "").trim().toLowerCase()}:${stream ?? ""}:${examType ?? ""}`;
    const state = await readThrough(
      key,
      async () => {
        const qs = new URLSearchParams();
        if (q) qs.set("q", q);
        if (stream) qs.set("stream", stream);
        if (examType) qs.set("exam_type", examType);
        return request<DataState<SubjectCatalogItem[]>>(
          `/api/student/subjects${qs.toString() ? `?${qs.toString()}` : ""}`,
        );
      },
      "Subject choices are temporarily unavailable. Please try again.",
      q?.trim() ? SEARCH_TTL_MS : REFERENCE_TTL_MS,
    );
    return state;
  },

  async searchJambProgrammes(
    q: string,
  ): Promise<DataState<JambProgrammeSuggestion[]>> {
    const key = `jamb-programmes:${q.trim().toLowerCase()}`;
    return readThrough(
      key,
      () => request<DataState<JambProgrammeSuggestion[]>>(
        `/api/student/jamb-programmes?q=${encodeURIComponent(q)}`,
      ),
      "Programme search is temporarily unavailable. Please try again.",
      SEARCH_TTL_MS,
    );
  },

  async getProgrammesBySubjects(
    subjects: string[],
    stream?: string,
    options?: {
      examType?: "utme" | "olevel" | "combined";
      olevelSubjects?: string[];
      schoolId?: string;
    },
  ): Promise<DataState<SubjectProgrammeMatch[]>> {
    const key = [
      "programme-matches",
      [...subjects].sort().join(",").toLowerCase(),
      stream ?? "",
      options?.examType ?? "",
      [...(options?.olevelSubjects ?? [])].sort().join(",").toLowerCase(),
      options?.schoolId ?? "",
    ].join(":");
    return readThrough(
      key,
      async () => {
        const qs = new URLSearchParams();
        qs.set("subjects", subjects.join(","));
        if (stream) qs.set("stream", stream);
        if (options?.examType) qs.set("exam_type", options.examType);
        if (options?.olevelSubjects?.length) {
          qs.set("olevel_subjects", options.olevelSubjects.join(","));
        }
        if (options?.schoolId) qs.set("school_id", options.schoolId);
        return request<DataState<SubjectProgrammeMatch[]>>(
          `/api/student/programmes/by-subjects?${qs.toString()}`,
        );
      },
      "Subject-to-programme matching is temporarily unavailable. Please try again.",
    );
  },

  async getJambProgramme(
    jambProgrammeId: string,
  ): Promise<DataState<JambProgrammeDetail | null>> {
    return readThrough(
      `jamb-programme:${jambProgrammeId}`,
      () => request<DataState<JambProgrammeDetail | null>>(
        `/api/student/jamb-programmes/${encodeURIComponent(jambProgrammeId)}`,
      ),
      "Programme requirements are unavailable.",
      DETAIL_TTL_MS,
    );
  },

  async getJambProgrammeSchools(
    jambProgrammeId: string,
  ): Promise<DataState<JambProgrammeSchool[]>> {
    return readThrough(
      `jamb-programme-schools:${jambProgrammeId}`,
      () => request<DataState<JambProgrammeSchool[]>>(
        `/api/student/jamb-programmes/${encodeURIComponent(jambProgrammeId)}/schools`,
      ),
      "The university list for this programme is unavailable.",
      DETAIL_TTL_MS,
    );
  },

  /** Courses offered by one institution (the enrolled-student entry point). */
  async getSchoolProgrammes(
    schoolId: string,
    q?: string,
    faculty?: string,
  ): Promise<DataState<SchoolProgrammeOffering[]>> {
    const key = `school-programmes:${schoolId}:${(faculty ?? "").trim().toLowerCase()}:${(q ?? "").trim().toLowerCase()}`;
    return readThrough(
      key,
      () => {
        const params = new URLSearchParams();
        if (q && q.trim()) params.set("q", q.trim());
        if (faculty && faculty.trim()) params.set("faculty", faculty.trim());
        const encoded = params.toString();
        const qs = encoded ? `?${encoded}` : "";
        return request<DataState<SchoolProgrammeOffering[]>>(
          `/api/student/schools/${encodeURIComponent(schoolId)}/programmes${qs}`,
        );
      },
      "This university's programme list is temporarily unavailable. Please try again.",
      q?.trim() || faculty?.trim() ? SEARCH_TTL_MS : REFERENCE_TTL_MS,
    );
  },

  async registerAdmissionSchool(
    name: string,
    institutionType: string,
    address?: string,
  ): Promise<DataState<AdmissionSchool & { created?: boolean }>> {
    try {
      return await request<DataState<AdmissionSchool & { created?: boolean }>>(
        "/api/student/schools/register",
        {
          method: "POST",
          body: JSON.stringify({ name, institutionType, address: address?.trim() || undefined }),
        },
      );
    } catch {
      return comingSoon("We could not add that institution right now.");
    }
  },

  async getSchoolFaculties(schoolId: string): Promise<DataState<SchoolFaculty[]>> {
    return readThrough(
      `school-faculties:${schoolId}`,
      () => request<DataState<SchoolFaculty[]>>(
        `/api/student/schools/${encodeURIComponent(schoolId)}/faculties`,
      ),
      "Faculty information is temporarily unavailable. You can still choose your programme.",
    );
  },

  async getJambProgrammeDomains(
    jambProgrammeId: string,
  ): Promise<DataState<JambDomainResult>> {
    return readThrough(
      `jamb-programme-domains:${jambProgrammeId}`,
      () => request<DataState<JambDomainResult>>(
        `/api/student/jamb-programmes/${encodeURIComponent(jambProgrammeId)}/domains`,
      ),
      "Domain paths are unavailable.",
      DETAIL_TTL_MS,
    );
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
    return readThrough(
      `programme_${programmeId}`,
      () => request<DataState<Programme>>(`/api/career/programmes/${encodeURIComponent(programmeId)}`),
      "Programme details are temporarily unavailable.",
      DETAIL_TTL_MS,
    );
  },

  /** Student boundary: preserve the raw method above for admin/audit views. */
  async getProgrammeForStudent(programmeId: string): Promise<DataState<Programme>> {
    return sanitizeStudentDataState(await careerData.getProgramme(programmeId), sanitizeStudentProgramme);
  },

  /** All domains grouped by cluster, for the context-free Domain Explorer. */
  async getDomainClusters(): Promise<DataState<DomainClusterGroup[]>> {
    return readThrough(
      "domain_clusters",
      () => request<DataState<DomainClusterGroup[]>>("/api/career/domains"),
      "The domain explorer is temporarily unavailable.",
    );
  },

  /** Context-aware search for a concrete user task, not a flat keyword dump. */
  async searchCareer(query: string, intent?: SearchIntent, userType?: string | null, schoolId?: string | null): Promise<DataState<CareerSearchResult>> {
    const normalizedQuery = query.trim().toLowerCase();
    const cacheIntent = intent ?? "undecided";
    const cacheUserType = userType ?? "unknown";
    const cacheSchool = schoolId ?? "none";
    return readThrough(
      `search_${cacheIntent}_${cacheUserType}_${cacheSchool}_${normalizedQuery}`,
      () => request<DataState<CareerSearchResult>>(
        `/api/career/search?q=${encodeURIComponent(query)}${intent ? `&intent=${encodeURIComponent(intent)}` : ""}${userType ? `&user_type=${encodeURIComponent(userType)}` : ""}${schoolId ? `&school_id=${encodeURIComponent(schoolId)}` : ""}`,
      ),
      "Search is temporarily unavailable.",
      SEARCH_TTL_MS,
    );
  },

  async getGuidancePath(): Promise<DataState<GuidanceReportPath | null>> {
    return readThrough(
      "guidance_path",
      () => request<DataState<GuidanceReportPath | null>>(`/api/student/guidance-path`),
      "Your saved guidance path is temporarily unavailable.",
      DETAIL_TTL_MS,
    );
  },

  async saveGuidancePath(input: {
    source?: "self" | "onboarding" | "explore";
    path: GuidanceReportPath["path"];
  }): Promise<DataState<GuidanceReportPath>> {
    try {
      const result = await request<DataState<GuidanceReportPath>>(
        `/api/student/guidance-path`,
        { method: "PUT", body: JSON.stringify(input) },
      );
      if (result.status === "real") await setCached("guidance_path", result, DETAIL_TTL_MS);
      return result;
    } catch {
      try {
        const optimistic: GuidanceReportPath = {
          source: input.source,
          path: input.path,
          updatedAt: new Date().toISOString(),
        };
        await setCached(
          "guidance_path",
          {
            status: "real",
            data: optimistic,
            meta: {
              verification: "pending",
              notice: "Saved on this device; reconnect to confirm it on your account.",
            },
          } satisfies DataState<GuidanceReportPath>,
          DETAIL_TTL_MS,
        );
        await queueWrite({
          endpoint: "/api/student/guidance-path",
          method: "PUT",
          body: input,
        });
        await flushQueue().catch(() => 0);
        return pending<GuidanceReportPath>("Saved on this device — it will sync when you reconnect.");
      } catch {
        return comingSoon<GuidanceReportPath>("Could not save this guidance path yet.");
      }
    }
  },

  /** Reverse the career graph from known or intended skills/tools/certs. */
  async discoverBySkills(params: {
    skills?: string[];
    match?: "both" | "either";
    intent?: "learned" | "intended";
    category?: string;
    userType?: string;
    adminType?: string;
  }): Promise<DataState<SkillDiscoveryResult>> {
    try {
      const skills = (params.skills ?? []).map((s) => s.trim()).filter(Boolean);
      return await request<DataState<SkillDiscoveryResult>>(
        "/api/career/skills/discover",
        {
          method: "POST",
          body: JSON.stringify({
            skills,
            match: params.match ?? "both",
            intent: params.intent ?? "learned",
            category: params.category ?? null,
            userType: params.userType ?? null,
            adminType: params.adminType ?? null,
          }),
        },
      );
    } catch {
      return comingSoon<SkillDiscoveryResult>("Skill discovery is temporarily unavailable.");
    }
  },

  /** JAMB name → domains (the SS/UTME student entry point). */
  async getJambDomains(jambName: string): Promise<DataState<JambDomainResult>> {
    return readThrough(
      `jamb_domains_${jambName}`,
      () => request<DataState<JambDomainResult>>(`/api/career/jamb/${encodeURIComponent(jambName)}/domains`),
      "Domains for this JAMB programme are being populated.",
      DETAIL_TTL_MS,
    );
  },

  /** A domain incl. its domain-level bridge skills and role list. */
  async getDomain(_domainId: string): Promise<DataState<Domain>> {
    // TODO(career-data): GET /api/career/domains/{id}
    return comingSoon<Domain>("See what this field does, the skills it needs, and the roles it can unlock.");
  },

  /** v2 domain detail: foundation skills, subgroups, tools, certs, demand metrics. */
  async getDomainV2(domainKey: string, programmeId?: string): Promise<DataState<DomainV2>> {
    const query = programmeId ? `?programme_id=${encodeURIComponent(programmeId)}` : "";
    return readThrough(
      `domain_${domainKey}_${programmeId ?? "none"}`,
      () => request<DataState<DomainV2>>(`/api/career/domains/${encodeURIComponent(domainKey)}${query}`),
      "See what this field does, the skills it needs, and the roles it can unlock.",
      DETAIL_TTL_MS,
    );
  },

  /** Student boundary: remove staff-only source URLs and review-required items. */
  async getDomainV2ForStudent(domainKey: string, programmeId?: string): Promise<DataState<DomainV2>> {
    return sanitizeStudentDataState(await careerData.getDomainV2(domainKey, programmeId), sanitizeStudentDomain);
  },

  /** A saved subgroup can be opened without its parent domain in the URL. */
  async getSubgroupV2(subgroupId: string, programmeId?: string): Promise<DataState<DomainV2>> {
    const query = programmeId ? `?programme_id=${encodeURIComponent(programmeId)}` : "";
    return readThrough(
      `subgroup_${subgroupId}_${programmeId ?? "none"}`,
      () => request<DataState<DomainV2>>(`/api/career/subgroups/${encodeURIComponent(subgroupId)}${query}`),
      "See what this area does, the skills it needs, and the roles it can unlock.",
      DETAIL_TTL_MS,
    );
  },

  /** Student boundary for the saved/nested subgroup route. */
  async getSubgroupV2ForStudent(subgroupId: string, programmeId?: string): Promise<DataState<DomainV2>> {
    return sanitizeStudentDataState(await careerData.getSubgroupV2(subgroupId, programmeId), sanitizeStudentDomain);
  },

  /** A role incl. its role-level bridge skills and coverage. */
  async getRole(_roleId: string): Promise<DataState<Role>> {
    // TODO(career-data): GET /api/career/roles/{id}
    return comingSoon<Role>("Understand the role, the bridge skills, and the proof you need to become credible.");
  },

  /** v2 role detail: essential/optional skills, tier, appearsIn, demand metrics. */
  async getRoleV2(roleKey: string, programmeId?: string): Promise<DataState<DomainRoleV2>> {
    const query = programmeId ? `?programme_id=${encodeURIComponent(programmeId)}` : "";
    return readThrough(
      `role_${roleKey}_${programmeId ?? "none"}`,
      () => request<DataState<DomainRoleV2>>(`/api/career/roles/${encodeURIComponent(roleKey)}${query}`),
      "Understand the role, the bridge skills, and the proof you need to become credible.",
      DETAIL_TTL_MS,
    );
  },

  /** Student boundary: admin retains the raw occupation evidence method. */
  async getRoleV2ForStudent(roleKey: string, programmeId?: string): Promise<DataState<DomainRoleV2>> {
    return sanitizeStudentDataState(await careerData.getRoleV2(roleKey, programmeId), sanitizeStudentRole);
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
      return comingSoon<Opportunity[]>("Find verified Opportunities and entry points that fit your programme, level, and location when they are available.");
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
    return readThrough(
      "saved_items",
      () => request<DataState<SavedItem[]>>(`/api/career/saved`),
      "Saved items are temporarily unavailable.",
      DETAIL_TTL_MS,
    );
  },

  async saveItem(
    entityType: SavedEntityType,
    entityId: string,
    label?: string,
  ): Promise<DataState<SavedItem>> {
    try {
      const result = await request<DataState<SavedItem>>(`/api/career/saved`, {
        method: "POST",
        body: JSON.stringify({ entityType, entityId, label }),
      });
      if (result.status === "real" && result.data) {
        const cached = await getCachedStale<DataState<SavedItem[]>>("saved_items");
        const previous = cached?.data ?? [];
        await updateSavedItemsCache([
          ...previous.filter((item) => !(item.entityType === entityType && item.entityId === entityId)),
          result.data,
        ]);
      }
      return result;
    } catch {
      try {
        const cached = await getCachedStale<DataState<SavedItem[]>>("saved_items");
        const previous = cached?.data ?? [];
        const optimistic: SavedItem = {
          id: `local_${entityType}_${entityId}`,
          entityType,
          entityId,
          label,
          createdAt: new Date().toISOString(),
        };
        await updateSavedItemsCache([
          ...previous.filter((item) => !(item.entityType === entityType && item.entityId === entityId)),
          optimistic,
        ]);
        await queueWrite({
          endpoint: "/api/career/saved",
          method: "POST",
          body: { entityType, entityId, label },
        });
        await flushQueue().catch(() => 0);
        return pending<SavedItem>("Saved on this device — it will sync when you reconnect.");
      } catch {
        return comingSoon<SavedItem>("Couldn't save that right now.");
      }
    }
  },

  async removeSavedItem(savedItemId: string): Promise<DataState<null>> {
    const cachedItems = await getCachedStale<DataState<SavedItem[]>>("saved_items");
    const cachedData = cachedItems?.data ?? [];
    const localItem = cachedData.find((item) => item.id === savedItemId);
    if (localItem?.id.startsWith("local_")) {
      await cancelQueuedSave(localItem.entityType, localItem.entityId);
      await updateSavedItemsCache(cachedData.filter((item) => item.id !== savedItemId));
      return pending<null>("Removed on this device — it will sync when you reconnect.");
    }
    try {
      const result = await request<DataState<null>>(
        `/api/career/saved/${encodeURIComponent(savedItemId)}`,
        { method: "DELETE" },
      );
      if (result.status === "real") {
        const cached = await getCachedStale<DataState<SavedItem[]>>("saved_items");
        if (cached?.data) {
          await updateSavedItemsCache(cached.data.filter((item) => item.id !== savedItemId));
        }
      }
      return result;
    } catch {
      try {
        const cached = await getCachedStale<DataState<SavedItem[]>>("saved_items");
        if (cached?.data) {
          await updateSavedItemsCache(cached.data.filter((item) => item.id !== savedItemId));
        }
        await queueWrite({
          endpoint: `/api/career/saved/${encodeURIComponent(savedItemId)}`,
          method: "DELETE",
        });
        await flushQueue().catch(() => 0);
        return pending<null>("Removed on this device — it will sync when you reconnect.");
      } catch {
        return comingSoon<null>();
      }
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

  /** School aggregate formula (JAMB% + O'level%). */
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
    institutionType?: string,
  ): Promise<DataState<AdmissionSchool[]>> {
    const key = `admission-schools:${institutionType ?? "university"}:${q.trim().toLowerCase()}`;
    const state = await readThrough(
      key,
      async () => {
        const qs = new URLSearchParams();
        qs.set("q", q);
        if (institutionType) qs.set("institution_type", institutionType);
        return request<DataState<AdmissionSchool[]>>(
          `/api/admission/schools?${qs.toString()}`,
        );
      },
      "University search is temporarily unavailable. Please try again.",
      SEARCH_TTL_MS,
    );
    return state;
  },

  // ─── Note management (used by My World) ───────────────────────
  /**
   * The SINGLE note-save mutation for the whole app. Both the per-entity
   * NotesWidget and the global NotesFab go through here, so one payload shape
   * and one offline behaviour serve every note the user writes.
   *
   * Offline-first: a failed request is queued through careerCache and flushed
   * when connectivity returns, and the caller gets an honest `pending` envelope
   * rather than a false "saved".
   */
  async upsertNote(
    entityType: NoteEntityType,
    entityId: string | undefined,
    body: string,
  ): Promise<DataState<Note>> {
    const payload = { entityType, entityId, body };
    try {
      return await request<DataState<Note>>(`/api/career/notes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      try {
        await queueWrite({
          endpoint: "/api/career/notes",
          method: "POST",
          body: payload,
        });
        await flushQueue().catch(() => 0);
        return pending<Note>(
          "Kept on this device — it'll sync when you're back online.",
        );
      } catch {
        return comingSoon<Note>("Couldn't save that note right now.");
      }
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
  /** Evidence-gated elite routes for the Elite Pathways hub; no fixed count. */
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
