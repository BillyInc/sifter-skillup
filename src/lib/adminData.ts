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
  ProgrammeFilter,
  DomainRankItem,
  RankScope,
  IntelligenceAlert,
  SkillGapRow,
  RoleDemandRow,
  PeerInstitutionRow,
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
// branch without importing backend details). All false in this phase.
export const ADMIN_DATA_LIVE = {
  institutionSummary: true,
  programmeDemand: true,
  domainRanking: true,
  intelligenceAlerts: true,
  skillsGap: true,
  roleDemand: true,
  peerComparison: true,
  affiliation: true,
} as const;

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

  /** Submit / refresh a verification claim (email domain, document, CAC…). */
  async submitVerification(
    payload: Partial<EducatorProfile>,
  ): Promise<DataState<Organization>> {
    try {
      return fromApi(await request<Organization | DataState<Organization>>(`/api/institutions/verify`, {
        method: "POST",
        body: JSON.stringify(payload),
      }));
    } catch {
      return comingSoon<Organization>("Verification submission is temporarily unavailable.");
    }
  },

  /** Validate the owner-issued code required before entering admin mode. */
  async validateAdminAccessCode(payload: {
    code: string;
    organizationType?: string;
    organizationName?: string;
  }): Promise<{ accepted: boolean; accessTier: "owner_code"; notice?: string }> {
    return request<{ accepted: boolean; accessTier: "owner_code"; notice?: string }>(
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

  /** Cross-programme skills-gap report. */
  async getSkillsGapReport(): Promise<DataState<SkillGapRow[]>> {
    try {
      return fromApi(await request<SkillGapRow[] | DataState<SkillGapRow[]>>(`/api/institutions/me/skills-gap`));
    } catch {
      return comingSoon<SkillGapRow[]>("The skills-gap report is being populated.");
    }
  },

  /** Role-level demand plus value/selectivity signal. */
  async getRoleDemand(): Promise<DataState<RoleDemandRow[]>> {
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
