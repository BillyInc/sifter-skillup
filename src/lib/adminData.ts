/**
 * adminData — the single read API for the institutional / administrator side.
 *
 * Mirrors src/lib/careerData.ts exactly: ships the CONTRACT and the SEAM, not
 * the data. Every method returns a `coming_soon` (or `locked`) {@link DataState}
 * so the admin dashboard renders graceful states. When the institutional
 * Supabase tables + FastAPI routes land, only these method bodies change.
 *
 * Privacy invariants encoded here:
 * - Intelligence reads are AGGREGATE, no student PII.
 * - Individual student reads return `locked` (consent-gated) by design — they
 *   do not become `coming_soon`; they stay locked until consent exists.
 */
import { type DataState, comingSoon, locked, real } from "../types/career";
import { request } from "./api";
import type {
  InstitutionSummary,
  ProgrammeDemandRow,
  ProgrammeIntelligenceRow,
  ProgrammeFilter,
  DomainRankItem,
  RankScope,
  IntelligenceAlert,
  SkillGapRow,
  ProgrammeSkillCoverage,
  JambProgrammeOption,
  RoleDemandRow,
  PeerInstitutionRow,
  PeerProgrammeComparison,
  Organization,
  EducatorProfile,
  AffiliationStats,
  OrganizationTeam,
  OrganizationInvite,
  OrgRole,
  // v2 admin side: §5.1 domain reach, §5.5 student intelligence, §6A feedback.
  DomainReachAudit,
  DomainReachLeaderboardRow,
  InstitutionControlFilter,
  StudentIntelligenceSummary,
  StudentFeedbackCategory,
  MappingEdgeType,
} from "../types/institution";

export interface VerificationProofMeta {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  verificationMethod: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

function toVerificationProof(raw: any): VerificationProofMeta | null {
  if (!raw) return null;
  return {
    id: String(raw.id ?? ""),
    fileName: String(raw.fileName ?? raw.file_name ?? "proof"),
    contentType: String(raw.contentType ?? raw.content_type ?? "application/octet-stream"),
    fileSize: Number(raw.fileSize ?? raw.file_size ?? 0),
    verificationMethod: String(raw.verificationMethod ?? raw.verification_method ?? "document_upload"),
    status: raw.status === "approved" || raw.status === "rejected" ? raw.status : "pending",
    submittedAt: String(raw.submittedAt ?? raw.submitted_at ?? ""),
    reviewedAt: raw.reviewedAt ?? raw.reviewed_at ?? null,
    reviewNote: raw.reviewNote ?? raw.review_note ?? null,
  };
}

function fromApi<T>(value: T | DataState<T>): DataState<T> {
  if (
    value &&
    typeof value === "object" &&
    "status" in value &&
    "data" in value
  ) {
    return value as DataState<T>;
  }
  return real(value as T);
}

// Flip per-area as real institutional data is wired (kept here so screens can
// branch without importing backend details). Demand-only areas remain gated.
export const ADMIN_DATA_LIVE = {
  institutionSummary: true,
  programmeDemand: false,
  domainRanking: false,
  intelligenceAlerts: true,
  // This route compares CCMAS with sourced market/practice evidence; it does
  // not require employment-posting metrics to render.
  skillsGap: true,
  roleDemand: false,
  peerComparison: true,
  affiliation: true,
} as const;

/**
 * Labour-market ingestion is not source-backed yet. Keep every demand-only
 * read unavailable at the client boundary as well as on the API: this avoids
 * rendering zero-default or taxonomy-derived baseline rows if an older server
 * process is still running.
 */
export const MARKET_DEMAND_AVAILABLE = false;

export const adminData = {
  // ─── Institution context ─────────────────────────────────────
  /** The current educator's organisation (claim + verification status). */
  async getMyOrganization(): Promise<DataState<Organization>> {
    try {
      return fromApi(await request<Organization | DataState<Organization>>(`/api/institutions/me`));
    } catch {
      return comingSoon<Organization>("Your institution profile is being loaded.");
    }
  },

  /** Metadata only for the current organisation's latest private proof. */
  async getVerificationProof(): Promise<VerificationProofMeta | null> {
    try {
      return toVerificationProof(await request<unknown>("/api/institutions/verification-proof"));
    } catch {
      // A missing migration is an unavailable proof workflow, not a pending
      // submission. The screen keeps the truthful "not submitted" state.
      return null;
    }
  },

  /** Upload a proof file; the server changes status only after it is stored. */
  async uploadVerificationProof(input: {
    file: Blob;
    fileName: string;
    contentType: string;
    verificationMethod?: string;
  }): Promise<VerificationProofMeta> {
    const body = new FormData();
    body.append("proof", input.file, input.fileName);
    body.append("verification_method", input.verificationMethod ?? "document_upload");
    return toVerificationProof(await request<unknown>("/api/institutions/verification-proof", {
      method: "POST",
      body,
    })) as VerificationProofMeta;
  },

  /** Submit / refresh a verification claim (email domain, document, CAC…). */
  async submitVerification(
    payload: Partial<EducatorProfile>,
  ): Promise<DataState<Organization>> {
    try {
      return fromApi(await request<Organization | DataState<Organization>>(`/api/institutions/verify`, {
        method: "POST",
        body: JSON.stringify({
          ...payload,
          address: payload.organizationAddress,
          city: payload.organizationCity,
          state: payload.organizationState,
          country: payload.organizationCountry,
        }),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create the admin workspace.";
      return comingSoon<Organization>(
        /failed to fetch|fetch failed|network request failed|network error|timed out|request took too long|abort/i.test(message)
          ? "The admin service could not be reached. Check that the backend is running, then try again."
          : message,
      );
    }
  },

  /** Validate the owner-issued code required before entering admin mode. */
  async validateAdminAccessCode(payload: {
    code: string;
    organizationType?: string;
    organizationName?: string;
  }): Promise<{ accepted: boolean; accessTier: "owner_code"; notice?: string }> {
    try {
      return await request<{ accepted: boolean; accessTier: "owner_code"; notice?: string }>(
        `/api/institutions/access-code/validate`,
        {
          method: "POST",
          body: JSON.stringify({
            code: payload.code,
            organization_type: payload.organizationType,
            organization_name: payload.organizationName,
          }),
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/failed to fetch|fetch failed|network request failed|network error|timed out|request took too long|abort/i.test(message)) {
        throw new Error("The admin service could not be reached. Check that the backend is running, then try again.");
      }
      throw error;
    }
  },

  /** Organisation profile + staff seats for the current admin context. */
  async getOrganizationTeam(): Promise<DataState<OrganizationTeam>> {
    try {
      return fromApi(await request<OrganizationTeam | DataState<OrganizationTeam>>(`/api/institutions/me/team`));
    } catch {
      return comingSoon<OrganizationTeam>(
        "Organisation team access comes online with the verification rollout.",
      );
    }
  },

  /** Invite another official into the same institution/school/tutorial workspace. */
  async inviteOrganizationMember(payload: {
    invitedEmail: string;
    role: OrgRole;
  }): Promise<DataState<OrganizationInvite>> {
    try {
      return fromApi(await request<OrganizationInvite | DataState<OrganizationInvite>>(`/api/institutions/me/invites`, {
        method: "POST",
        body: JSON.stringify(payload),
      }));
    } catch {
      return comingSoon<OrganizationInvite>(
        "Team invitations come online with the verification rollout.",
      );
    }
  },

  // ─── Aggregate intelligence (no PII) ─────────────────────────
  /** The five boardroom stat-card numbers for the institution. */
  async getInstitutionSummary(): Promise<DataState<InstitutionSummary>> {
    try {
      return fromApi(await request<InstitutionSummary | DataState<InstitutionSummary>>(`/api/institutions/me/summary`));
    } catch {
      return comingSoon<InstitutionSummary>("Institution intelligence is being populated.");
    }
  },

  /** The Programme × Domain × Demand table rows (eligibility-aggregate). */
  async getProgrammeDemand(
    filter: ProgrammeFilter = {},
  ): Promise<DataState<ProgrammeDemandRow[]>> {
    if (!MARKET_DEMAND_AVAILABLE) {
      return comingSoon<ProgrammeDemandRow[]>(
        "Programme demand is unavailable until source-backed labour-market ingestion is added.",
      );
    }
    try {
      const qs = new URLSearchParams(filter as any).toString();
      return fromApi(await request<ProgrammeDemandRow[] | DataState<ProgrammeDemandRow[]>>(
        `/api/institutions/me/programme-demand${qs ? `?${qs}` : ""}`,
      ));
    } catch {
      return comingSoon<ProgrammeDemandRow[]>(
        "Programme-domain-demand data is being populated.",
      );
    }
  },

  /** Domains ranked by the selected market lens (Nigerian / Global / Remote). */
  async getDomainRanking(
    scope: RankScope = "nigerian",
  ): Promise<DataState<DomainRankItem[]>> {
    if (!MARKET_DEMAND_AVAILABLE) {
      return comingSoon<DomainRankItem[]>(
        "Domain demand rankings are unavailable until source-backed labour-market ingestion is added.",
      );
    }
    try {
      return fromApi(await request<DomainRankItem[] | DataState<DomainRankItem[]>>(
        `/api/institutions/me/domain-ranking?scope=${scope}`,
      ));
    } catch {
      return comingSoon<DomainRankItem[]>("Domain demand rankings are being populated.");
    }
  },

  /** Auto-surfaced signals (gaps, drift, opportunities). */
  async getIntelligenceAlerts(): Promise<DataState<IntelligenceAlert[]>> {
    try {
      return fromApi(await request<IntelligenceAlert[] | DataState<IntelligenceAlert[]>>(`/api/institutions/me/alerts`));
    } catch {
      return comingSoon<IntelligenceAlert[]>("Intelligence alerts are being populated.");
    }
  },

  /** Legacy labour-market-posting gap compatibility route. The live
   * programme-intelligence view uses getProgrammeSkillCoverage(), which
   * compares CCMAS with sourced domain/subgroup/role practice evidence. */
  async getSkillsGapReport(): Promise<DataState<SkillGapRow[]>> {
    if (!MARKET_DEMAND_AVAILABLE) {
      return comingSoon<SkillGapRow[]>(
        "Posting-based skill gaps are unavailable until labour-market demand ingestion is added.",
      );
    }
    try {
      return fromApi(await request<SkillGapRow[] | DataState<SkillGapRow[]>>(`/api/institutions/me/skills-gap`));
    } catch {
      return comingSoon<SkillGapRow[]>("The skills-gap report is being populated.");
    }
  },

  /** Institution-scoped programme/domain structure; never demand data. */
  async getProgrammeIntelligence(
    filter: Pick<ProgrammeFilter, "discipline" | "query"> = {},
  ): Promise<DataState<ProgrammeIntelligenceRow[]>> {
    try {
      const qs = new URLSearchParams(filter as any).toString();
      return fromApi(await request<ProgrammeIntelligenceRow[] | DataState<ProgrammeIntelligenceRow[]>>(
        `/api/institutions/me/programme-intelligence${qs ? `?${qs}` : ""}`,
      ));
    } catch {
      return comingSoon<ProgrammeIntelligenceRow[]>("Programme intelligence is temporarily unavailable.");
    }
  },

  /** Programme → mapped domain → source-backed curriculum bridge. */
  async getProgrammeSkillCoverage(jambProgrammeId?: string): Promise<DataState<ProgrammeSkillCoverage[]>> {
    try {
      const query = jambProgrammeId ? `?jamb_programme_id=${encodeURIComponent(jambProgrammeId)}` : "";
      return fromApi(await request<ProgrammeSkillCoverage[] | DataState<ProgrammeSkillCoverage[]>>(`/api/institutions/me/programme-skill-coverage${query}`));
    } catch {
      return comingSoon<ProgrammeSkillCoverage[]>("Programme skill coverage is being populated.");
    }
  },

  /** National JAMB picker; includes identities without a CCMAS anchor. */
  async getJambProgrammeOptions(): Promise<DataState<JambProgrammeOption[]>> {
    try {
      return fromApi(await request<JambProgrammeOption[] | DataState<JambProgrammeOption[]>>("/api/institutions/me/jamb-programme-options"));
    } catch {
      return comingSoon<JambProgrammeOption[]>("JAMB programme options are temporarily unavailable.");
    }
  },

  /** Role-level demand plus value/selectivity signal. */
  async getRoleDemand(): Promise<DataState<RoleDemandRow[]>> {
    if (!MARKET_DEMAND_AVAILABLE) {
      return comingSoon<RoleDemandRow[]>(
        "Role demand is unavailable until source-backed labour-market ingestion is added.",
      );
    }
    try {
      return fromApi(await request<RoleDemandRow[] | DataState<RoleDemandRow[]>>(`/api/institutions/me/role-demand`));
    } catch {
      return comingSoon<RoleDemandRow[]>("Role demand is being populated.");
    }
  },

  /** Peer-institution domain-coverage comparison. */
  async getPeerComparison(): Promise<DataState<PeerInstitutionRow[]>> {
    try {
      return fromApi(await request<PeerInstitutionRow[] | DataState<PeerInstitutionRow[]>>(`/api/institutions/me/peers`));
    } catch {
      return comingSoon<PeerInstitutionRow[]>("Peer-institution benchmarks are being populated.");
    }
  },

  /** Offering-level comparison; structural curriculum reach, never inferred demand. */
  async getPeerProgrammeComparison(
    peerSchoolId: string,
    compareSchoolId?: string,
  ): Promise<DataState<PeerProgrammeComparison>> {
    try {
      const query = new URLSearchParams({ peer_school_id: peerSchoolId });
      if (compareSchoolId) query.set("compare_school_id", compareSchoolId);
      return fromApi(await request<PeerProgrammeComparison | DataState<PeerProgrammeComparison>>(
        `/api/institutions/me/peer-programme-comparison?${query.toString()}`,
      ));
    } catch {
      return comingSoon<PeerProgrammeComparison>("University programme comparison is temporarily unavailable.");
    }
  },

  // ─── Affiliation (aggregate attribution, self-reported) ──────
  /** Aggregate count of students self-affiliated via the school code. */
  async getAffiliationStats(): Promise<DataState<AffiliationStats>> {
    try {
      return fromApi(await request<AffiliationStats | DataState<AffiliationStats>>(`/api/institutions/me/affiliation`));
    } catch {
      return comingSoon<AffiliationStats>("Affiliation analytics come online with the school-code rollout.");
    }
  },

  // ─── Domain Reach Audit — View A (spec §5.1) ─────────────────
  /**
   * Curriculum portfolio reach: how many of the 168 domains this institution's
   * programme mix touches, split direct / functional / adjacent, plus the
   * unreached remainder, a national rank and a per-programme breakdown.
   *
   * STRUCTURAL DATA ONLY — CCMAS mapping, never market demand (§5.1). The
   * screen carries that warning; it is restated here so a future caller cannot
   * mistake this for Market Intelligence.
   */
  async getDomainReachAudit(): Promise<DataState<DomainReachAudit>> {
    try {
      return fromApi(
        await request<DomainReachAudit | DataState<DomainReachAudit>>(
          `/api/institutions/me/domain-reach`,
        ),
      );
    } catch {
      return comingSoon<DomainReachAudit>("Your domain reach audit is being compiled.");
    }
  },

  /** National leaderboard by domain reach, optionally filtered by control. */
  async getDomainReachLeaderboard(
    filter: InstitutionControlFilter = "all",
  ): Promise<DataState<DomainReachLeaderboardRow[]>> {
    try {
      return fromApi(
        await request<
          DomainReachLeaderboardRow[] | DataState<DomainReachLeaderboardRow[]>
        >(`/api/institutions/me/domain-reach/leaderboard?filter=${filter}`),
      );
    } catch {
      return comingSoon<DomainReachLeaderboardRow[]>(
        "The national domain-reach leaderboard is being compiled.",
      );
    }
  },

  // ─── Student intelligence rollup (AGGREGATE — §5.5/§7.14) ────
  /**
   * Headline rollup over the existing roster read, grouped by the `provenance`
   * field that every RosterStudent already carries but which nothing
   * aggregated. Aggregate and k-anonymised: this deliberately does NOT become
   * a route to individuals, which stays consent-gated below.
   */
  async getStudentIntelligenceSummary(): Promise<
    DataState<StudentIntelligenceSummary>
  > {
    try {
      return fromApi(
        await request<
          StudentIntelligenceSummary | DataState<StudentIntelligenceSummary>
        >(`/api/institutions/me/student-intelligence`),
      );
    } catch {
      return comingSoon<StudentIntelligenceSummary>(
        "Student intelligence is being compiled.",
      );
    }
  },

  // ─── Outbound feedback (§6A.1 — never an inbox) ──────────────
  /**
   * Send feedback to the Sifter team. Outbound ONLY: there is intentionally no
   * read method on this client. The platform-wide inbox is internal-staff
   * tooling (§6A.4) and institution admins must not reach it — enforced by the
   * require_internal_staff gate on GET /api/feedback.
   */
  async submitFeedback(payload: {
    category: StudentFeedbackCategory;
    message: string;
    entityType?: string;
    entityId?: string;
  }): Promise<{ ok: boolean; message?: string }> {
    try {
      await request(`/api/feedback`, {
        method: "POST",
        body: JSON.stringify({
          type: "general",
          studentCategory: payload.category,
          message: payload.message,
          entityType: payload.entityType,
          entityId: payload.entityId,
        }),
      });
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Could not send your feedback.",
      };
    }
  },

  /** Flag a mapping edge as wrong (§6A.2). Submit-only, same as above. */
  async submitMappingFlag(payload: {
    edgeType: MappingEdgeType;
    sourceId: string;
    targetId: string;
    notes: string;
    suggestedCorrection?: string;
  }): Promise<{ ok: boolean; message?: string }> {
    try {
      await request(`/api/career/feedback`, {
        method: "POST",
        body: JSON.stringify({
          edgeType: payload.edgeType,
          sourceId: payload.sourceId,
          targetId: payload.targetId,
          feedbackType: "incorrect",
          notes: payload.suggestedCorrection
            ? `${payload.notes}\n\nSuggested correction: ${payload.suggestedCorrection}`
            : payload.notes,
        }),
      });
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Could not send your report.",
      };
    }
  },

  // ─── Individual student management (CONSENT-GATED) ───────────
  /** Individual student visibility is locked by design — aggregate-only until a
   * (guardian) consent exists. Returns `locked`, never `coming_soon`. */
  async getStudentRoster(): Promise<DataState<never[]>> {
    // Intentionally locked: requires verified org + student/guardian consent.
    return locked<never[]>(
      "Individual student data stays private. Aggregate insights only — " +
        "individual access requires verified consent.",
    );
  },
};

export type AdminDataClient = typeof adminData;
