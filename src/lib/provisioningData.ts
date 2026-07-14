/**
 * provisioningData — the write/read client for the student-provisioning funnel
 * and the consent-aware roster.
 *
 * Distinct from adminData (which is the read-only aggregate-intelligence seam):
 * these endpoints mutate (stage drafts, mint accounts, redeem codes, grant
 * consent) and return plain payloads, so they don't use the DataState envelope.
 * All snake_case backend fields are mapped to the camelCase TS contract here so
 * screens never see wire shapes.
 *
 * PRIVACY: subjects/grades passed to generate() are transient inputs to the
 * mapping — they are sent, used server-side inline, and never stored.
 */
import { request } from "./api";
import { API_BASE } from "./config";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type {
  ProvisionDraft,
  ProvisioningStream,
  ChosenDirection,
  GeneratedStudent,
  ProvisioningMergeCandidate,
  RosterStudent,
  RosterSummary,
} from "../types/institution";

const TOKEN_KEY = "sifter_auth_token_v2";

async function authToken(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch { return null; }
}

/**
 * Open an authenticated document endpoint (report / login card). These are GETs
 * that require the Bearer token, so we can't just Linking.openURL them. On web
 * we fetch the blob and open/download it; on native we return the bytes for a
 * share sheet (caller decides). Returns true on success.
 */
export async function openStudentDocument(
  path: string,
  opts: { download?: string } = {},
): Promise<boolean> {
  const token = await authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return false;
  const blob = await res.blob();
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const url = URL.createObjectURL(blob);
    if (opts.download) {
      const a = document.createElement("a");
      a.href = url;
      a.download = opts.download;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(url, "_blank");
    }
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return true;
  }
  // Native: no file-system dep installed; the web admin dashboard is the primary
  // surface for printing/sharing. Signal unsupported so the caller can hint.
  return false;
}

// ─── Wire shapes (snake_case, as returned by the backend) ─────
interface WireDraft {
  id: string;
  full_name?: string | null;
  student_class?: string | null;
  stream?: ProvisioningStream | null;
  needs_review: boolean;
  guardian_consent: boolean;
  guardian_name?: string | null;
  status: "draft" | "generated" | "discarded";
}
interface WireGenerated {
  user_id: string;
  full_name: string;
  student_class?: string | null;
  stream?: ProvisioningStream | null;
  claim_code: string;
  claim_expires_at?: string | null;
}
interface WireRosterStudent {
  user_id: string;
  full_name?: string | null;
  student_class?: string | null;
  stream?: ProvisioningStream | null;
  provenance: "self" | "provisioned";
  claim_state?: "unclaimed" | "claimed" | null;
  visible: boolean;
  has_consent: boolean;
}
interface WireRoster {
  students: WireRosterStudent[];
  total_affiliated: number;
  aggregate_only: number;
  shared_with_you: number;
}
interface WireMergeCandidate {
  id: string;
  provisioned_user_id?: string | null;
  student_user_id?: string | null;
  provisioned_name?: string | null;
  student_name?: string | null;
  student_class?: string | null;
  stream?: ProvisioningStream | null;
  match_type?: string | null;
  confidence?: number | null;
  evidence?: Record<string, unknown> | null;
  status?: "pending" | "confirmed" | "dismissed" | string;
  created_at?: string | null;
}

const toDraft = (w: WireDraft): ProvisionDraft => ({
  id: w.id,
  fullName: w.full_name,
  studentClass: w.student_class,
  stream: w.stream,
  needsReview: w.needs_review,
  guardianConsent: w.guardian_consent,
  guardianName: w.guardian_name,
  status: w.status,
});
const toGenerated = (w: WireGenerated): GeneratedStudent => ({
  userId: w.user_id,
  fullName: w.full_name,
  studentClass: w.student_class,
  stream: w.stream,
  claimCode: w.claim_code,
  claimExpiresAt: w.claim_expires_at,
});
const toRosterStudent = (w: WireRosterStudent): RosterStudent => ({
  userId: w.user_id,
  fullName: w.full_name,
  studentClass: w.student_class,
  stream: w.stream,
  provenance: w.provenance,
  claimState: w.claim_state,
  visible: w.visible,
  hasConsent: w.has_consent,
});
const toMergeCandidate = (w: WireMergeCandidate): ProvisioningMergeCandidate => ({
  id: w.id,
  provisionedUserId: w.provisioned_user_id,
  provisionedFullName: w.provisioned_name,
  provisionedStudentClass: w.student_class,
  provisionedStream: w.stream,
  claimedUserId: w.student_user_id,
  claimedFullName: w.student_name,
  claimedContact: null,
  matchScore: w.confidence,
  reason: w.match_type,
  status: w.status,
  createdAt: w.created_at,
});

/** One image page for the vision pre-fill (base64, no newlines). */
export interface DraftImage {
  mediaType: string;
  data: string;
}
/** A manually-entered draft row (the correction-grid fallback). */
export interface ManualDraft {
  fullName?: string;
  studentClass?: string;
  stream?: ProvisioningStream;
  guardianConsent?: boolean;
  guardianName?: string;
}
/** One selected draft to mint. subjects seed the mapping in-memory; not stored. */
export interface GenerateItem {
  draftId: string;
  stream?: ProvisioningStream;
  subjects?: string[];
  chosenDirection?: ChosenDirection;
}

export const provisioningData = {
  /** Stage drafts from uploaded pages (vision pre-fill) and/or manual rows. */
  async createDrafts(input: {
    images?: DraftImage[];
    manualRows?: ManualDraft[];
    stream?: ProvisioningStream;
  }): Promise<ProvisionDraft[]> {
    const rows = await request<WireDraft[]>(`/api/provisioning/drafts`, {
      method: "POST",
      body: JSON.stringify({
        stream: input.stream ?? null,
        images: (input.images ?? []).map((i) => ({ media_type: i.mediaType, data: i.data })),
        manual_rows: (input.manualRows ?? []).map((m) => ({
          full_name: m.fullName ?? null,
          student_class: m.studentClass ?? null,
          stream: m.stream ?? input.stream ?? null,
          guardian_consent: m.guardianConsent ?? false,
          guardian_name: m.guardianName ?? null,
        })),
      }),
    });
    return (rows ?? []).map(toDraft);
  },

  /** The review grid: all still-draft rows for the admin's school. */
  async listDrafts(): Promise<ProvisionDraft[]> {
    const rows = await request<WireDraft[]>(`/api/provisioning/drafts`);
    return (rows ?? []).map(toDraft);
  },

  /** Correct/confirm one draft (the assisted-correction step). */
  async updateDraft(
    draftId: string,
    patch: ManualDraft,
  ): Promise<ProvisionDraft> {
    const row = await request<WireDraft>(`/api/provisioning/drafts/${draftId}`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: patch.fullName ?? null,
        student_class: patch.studentClass ?? null,
        stream: patch.stream ?? null,
        guardian_consent: patch.guardianConsent ?? false,
        guardian_name: patch.guardianName ?? null,
      }),
    });
    return toDraft(row);
  },

  /** Mint accounts + claim codes for the SELECTED drafts. */
  async generate(items: GenerateItem[]): Promise<GeneratedStudent[]> {
    const rows = await request<WireGenerated[]>(`/api/provisioning/generate`, {
      method: "POST",
      body: JSON.stringify({
        items: items.map((i) => ({
          draft_id: i.draftId,
          stream: i.stream ?? null,
          subjects: i.subjects ?? [],
          chosen_direction: i.chosenDirection
            ? {
                domain_key: i.chosenDirection.domainKey,
                role_key: i.chosenDirection.roleKey,
                programme_id: i.chosenDirection.programmeId,
              }
            : null,
        })),
      }),
    });
    return (rows ?? []).map(toGenerated);
  },

  /** Reissue a lost card's claim code (unclaimed accounts only). */
  async regenerateCode(userId: string): Promise<GeneratedStudent> {
    const w = await request<{ user_id: string; claim_code: string; claim_expires_at?: string }>(
      `/api/provisioning/students/${userId}/regenerate-code`,
      { method: "POST" },
    );
    return {
      userId: w.user_id,
      fullName: "",
      stream: undefined,
      claimCode: w.claim_code,
      claimExpiresAt: w.claim_expires_at,
    };
  },

  /** The consent-aware roster (visibility rule applied server-side). */
  async getRoster(): Promise<RosterSummary> {
    const w = await request<WireRoster>(`/api/provisioning/roster`);
    return {
      students: (w?.students ?? []).map(toRosterStudent),
      totalAffiliated: w?.total_affiliated ?? 0,
      aggregateOnly: w?.aggregate_only ?? 0,
      sharedWithYou: w?.shared_with_you ?? 0,
    };
  },

  /** Possible duplicate accounts awaiting an admin merge decision. */
  async listMergeCandidates(): Promise<ProvisioningMergeCandidate[]> {
    const rows = await request<WireMergeCandidate[]>(`/api/provisioning/merge-candidates`);
    return (rows ?? []).map(toMergeCandidate);
  },

  /** Confirm that a provisioned account and claimed/self account are the same student. */
  async confirmMergeCandidate(candidateId: string): Promise<void> {
    await request(`/api/provisioning/merge-candidates/${candidateId}/confirm`, {
      method: "POST",
    });
  },

  /** Dismiss a suggested account merge. */
  async dismissMergeCandidate(candidateId: string): Promise<void> {
    await request(`/api/provisioning/merge-candidates/${candidateId}/dismiss`, {
      method: "POST",
    });
  },

  /** Download the editable .docx career report. */
  downloadReportDocx(userId: string, fileName = "career_report.docx") {
    return openStudentDocument(`/api/provisioning/students/${userId}/report.docx`, {
      download: fileName,
    });
  },

  /** Open the printable HTML report (print-to-PDF). */
  openReportHtml(userId: string) {
    return openStudentDocument(`/api/provisioning/students/${userId}/report.html`);
  },

  /** Open the printable login card carrying the live claim code. */
  openLoginCard(userId: string) {
    return openStudentDocument(`/api/provisioning/students/${userId}/login-card.html`);
  },
};

// ─── Student-side (not admin-gated) ───────────────────────────
export const studentAccountApi = {
  /** Redeem a printed claim code → own the account (auto-merges if already a user). */
  async claim(input: { code: string; phone?: string; email?: string }): Promise<{ claimed: boolean; schoolId: string }> {
    const w = await request<{ claimed: boolean; school_id: string }>(`/api/provisioning/students/claim`, {
      method: "POST",
      body: JSON.stringify({ code: input.code, phone: input.phone ?? null, email: input.email ?? null }),
    });
    return { claimed: w.claimed, schoolId: w.school_id };
  },

  /** Self-affiliate via school code (aggregate-only; prompts for consent). */
  async affiliate(schoolCode: string): Promise<{ schoolId: string; schoolName?: string; consentRequired: boolean }> {
    const w = await request<{ school_id: string; school_name?: string; consent_required: boolean }>(
      `/api/provisioning/students/affiliate`,
      { method: "POST", body: JSON.stringify({ school_code: schoolCode }) },
    );
    return { schoolId: w.school_id, schoolName: w.school_name, consentRequired: w.consent_required };
  },

  /** Grant individual visibility to a school (per-school, revocable). */
  async grantConsent(schoolId: string, scope: "progress" | "contact" | "full" = "progress"): Promise<void> {
    await request(`/api/provisioning/students/consent`, {
      method: "POST",
      body: JSON.stringify({ school_id: schoolId, scope }),
    });
  },

  /** Revoke individual visibility (collapse back to aggregate-only). */
  async revokeConsent(schoolId: string, scope: "progress" | "contact" | "full" = "progress"): Promise<void> {
    await request(`/api/provisioning/students/consent`, {
      method: "DELETE",
      body: JSON.stringify({ school_id: schoolId, scope }),
    });
  },
};
