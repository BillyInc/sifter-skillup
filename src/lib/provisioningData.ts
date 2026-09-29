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
 * account-creation mapping. An admin-guided student's selected subjects may
 * additionally be retained in that student's private resume checkpoint so
 * the administrator can reopen the same unfinished flow.
 */
import { request } from "./api";
import { API_BASE } from "./config";
import { getOrCreateDeviceId } from "./deviceId";
import * as SecureStore from "expo-secure-store";
import * as FileSystem from "expo-file-system/legacy";
import { Platform, Share } from "react-native";
import type {
  ProvisionDraft,
  ProvisioningStream,
  ProvisioningStudentType,
  ChosenDirection,
  GeneratedStudent,
  ProvisioningMergeCandidate,
  RosterStudent,
  RosterSummary,
  StudentConsentRequest,
} from "../types/institution";

const TOKEN_KEY = "sifter_auth_token_v2";

async function authToken(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }
  try { return await SecureStore.getItemAsync(TOKEN_KEY); } catch { return null; }
}

let deviceIdPromise: Promise<string> | null = null;

async function authHeaders(): Promise<Record<string, string>> {
  const token = await authToken();
  if (!deviceIdPromise) deviceIdPromise = getOrCreateDeviceId();
  const deviceId = await deviceIdPromise;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(deviceId ? { "X-Device-Id": deviceId } : {}),
  };
}

async function fetchStudentDocument(path: string): Promise<Blob | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { headers: await authHeaders() });
    return res.ok ? await res.blob() : null;
  } catch {
    // Reports are online-only. Callers receive a false result and render the
    // same recoverable notice as an authorization or server failure.
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function writeNativeShareFile(blob: Blob, fileName: string): Promise<string | null> {
  const directory = FileSystem.cacheDirectory;
  if (!directory) return null;
  const uri = `${directory}${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  await FileSystem.writeAsStringAsync(uri, arrayBufferToBase64(await blob.arrayBuffer()), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
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
  const blob = await fetchStudentDocument(path);
  if (!blob) return false;
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
  try {
    const fileName = opts.download ?? path.split("/").pop() ?? "sifter-document";
    const uri = await writeNativeShareFile(blob, fileName);
    if (!uri) return false;
    await Share.share({ title: fileName, url: uri });
    setTimeout(() => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}), 300_000);
    return true;
  } catch {
    return false;
  }
}

// ─── Wire shapes (snake_case, as returned by the backend) ─────
interface WireDraft {
  id: string;
  full_name?: string | null;
  student_class?: string | null;
  stream?: ProvisioningStream | null;
  student_type?: ProvisioningStudentType | null;
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
  student_type?: ProvisioningStudentType | null;
  claim_code: string;
  claim_expires_at?: string | null;
  guidance_complete?: boolean;
}

/** Share an authenticated report/card through the device or browser share sheet.
 * The sheet is what exposes installed targets such as email, WhatsApp,
 * WhatsApp Business, Drive and Dropbox without hard-coding app-specific URLs.
 * When a browser has no file-share support, it falls back to a download. */
export async function shareStudentDocument(
  path: string,
  fileName: string,
  message = "Sifter LevelUp document",
): Promise<boolean> {
  const blob = await fetchStudentDocument(path);
  if (!blob) return false;
  if (Platform.OS === "web" && typeof navigator !== "undefined") {
    const file = new File([blob], fileName, { type: blob.type || "application/octet-stream" });
    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({ title: fileName, text: message, files: [file] });
        return true;
      } catch {
        return false;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    return true;
  }
  try {
    const uri = await writeNativeShareFile(blob, fileName);
    if (!uri) return false;
    await Share.share({ title: fileName, message, url: uri });
    setTimeout(() => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}), 300_000);
    return true;
  } catch {
    return false;
  }
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
  guidance_complete?: boolean;
  student_type?: ProvisioningStudentType | null;
}
interface WireRoster {
  students: WireRosterStudent[];
  total_affiliated: number;
  aggregate_only: number;
  shared_with_you: number;
}
interface WireConsentRequest {
  id: string;
  school_id: string;
  school_name?: string | null;
  school_address?: string | null;
  scope: "progress" | "contact" | "full";
  message?: string | null;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  created_at?: string | null;
  responded_at?: string | null;
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
  studentType: w.student_type,
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
  studentType: w.student_type,
  claimCode: w.claim_code,
  claimExpiresAt: w.claim_expires_at,
  guidanceComplete: Boolean(w.guidance_complete),
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
  guidanceComplete: Boolean(w.guidance_complete),
  studentType: w.student_type,
});
const toConsentRequest = (w: WireConsentRequest): StudentConsentRequest => ({
  id: w.id,
  schoolId: w.school_id,
  schoolName: w.school_name,
  schoolAddress: w.school_address,
  scope: w.scope,
  message: w.message,
  status: w.status,
  createdAt: w.created_at,
  respondedAt: w.responded_at,
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
  studentType?: ProvisioningStudentType;
  guardianConsent?: boolean;
  guardianName?: string;
}
/** One selected draft to mint. subjects seed the mapping in-memory; not stored. */
export interface GenerateItem {
  draftId: string;
  stream?: ProvisioningStream;
  studentType?: ProvisioningStudentType;
  subjects?: string[];
  chosenDirection?: ChosenDirection;
}

export const provisioningData = {
  /** Stage drafts from uploaded pages (vision pre-fill) and/or manual rows. */
  async createDrafts(input: {
    images?: DraftImage[];
    manualRows?: ManualDraft[];
    stream?: ProvisioningStream;
    organizationId?: string;
  }): Promise<ProvisionDraft[]> {
    const rows = await request<WireDraft[]>(`/api/provisioning/drafts`, {
      method: "POST",
      body: JSON.stringify({
        stream: input.stream ?? null,
        organization_id: input.organizationId ?? null,
        images: (input.images ?? []).map((i) => ({ media_type: i.mediaType, data: i.data })),
        manual_rows: (input.manualRows ?? []).map((m) => ({
          full_name: m.fullName ?? null,
          student_class: m.studentClass ?? null,
          stream: m.stream ?? input.stream ?? null,
          student_type: m.studentType ?? null,
          guardian_consent: m.guardianConsent ?? false,
          guardian_name: m.guardianName ?? null,
        })),
      }),
    });
    return (rows ?? []).map(toDraft);
  },

  /** The review grid: all still-draft rows for the admin's school. */
  async listDrafts(organizationId?: string): Promise<ProvisionDraft[]> {
    const query = organizationId ? `?organization_id=${encodeURIComponent(organizationId)}` : "";
    const rows = await request<WireDraft[]>(`/api/provisioning/drafts${query}`);
    return (rows ?? []).map(toDraft);
  },

  /** Correct/confirm one draft (the assisted-correction step). */
  async updateDraft(
    draftId: string,
    patch: ManualDraft,
    organizationId?: string,
  ): Promise<ProvisionDraft> {
    const row = await request<WireDraft>(`/api/provisioning/drafts/${draftId}`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: patch.fullName ?? null,
        student_class: patch.studentClass ?? null,
        stream: patch.stream ?? null,
        student_type: patch.studentType ?? null,
        guardian_consent: patch.guardianConsent ?? false,
        guardian_name: patch.guardianName ?? null,
        organization_id: organizationId ?? null,
      }),
    });
    return toDraft(row);
  },

  /** Remove selected review rows before account generation. */
  async clearDrafts(draftIds: string[], organizationId?: string): Promise<number> {
    const w = await request<{ deleted: number }>(`/api/provisioning/drafts`, {
      method: "DELETE",
      body: JSON.stringify({ draft_ids: draftIds, organization_id: organizationId ?? null }),
    });
    return Number(w?.deleted ?? 0);
  },

  /** Mint accounts + claim codes for the SELECTED drafts. */
  async generate(items: GenerateItem[], organizationId?: string): Promise<GeneratedStudent[]> {
    const rows = await request<WireGenerated[]>(`/api/provisioning/generate`, {
      method: "POST",
      // Provisioning creates a real account, affiliation and claim code. The
      // local Supabase development connection can take several round trips;
      // give this one operation time to finish without weakening normal API
      // timeouts elsewhere.
      timeoutMs: 90000,
      body: JSON.stringify({
        organization_id: organizationId ?? null,
        items: items.map((i) => ({
          draft_id: i.draftId,
          stream: i.stream ?? null,
          student_type: i.studentType ?? null,
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

  /** Delete one school-created shell, only before claim and guidance. */
  async deleteStudent(userId: string): Promise<void> {
    await request(`/api/provisioning/students/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
  },

  /** Delete explicitly selected school-created shells as one preflighted batch. */
  async deleteStudents(userIds: string[]): Promise<number> {
    const w = await request<{ deleted: number }>(`/api/provisioning/students`, {
      method: "DELETE",
      body: JSON.stringify({ student_ids: userIds }),
    });
    return Number(w?.deleted ?? 0);
  },

  /** Save the direction selected during an administrator-led guidance session. */
  async saveGuidance(userId: string, chosenDirection: ChosenDirection): Promise<void> {
    await request(`/api/provisioning/students/${encodeURIComponent(userId)}/guidance`, {
      method: "PATCH",
      body: JSON.stringify({
        chosen_direction: {
          domain_key: chosenDirection.domainKey ?? null,
          role_key: chosenDirection.roleKey ?? null,
          programme_id: chosenDirection.programmeId ?? null,
        },
      }),
    });
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

  /** Download the editable .docx career report when online and authorised. */
  downloadReportDocx(userId: string, fileName = "career_report.docx") {
    return openStudentDocument(`/api/provisioning/students/${userId}/report.docx`, {
      download: fileName,
    });
  },

  /** Open the online HTML report for print-to-PDF. */
  openReportHtml(userId: string) {
    return openStudentDocument(`/api/provisioning/students/${userId}/report.html`);
  },

  /** Save the complete selected guidance path for a provisioned student. */
  async saveGuidancePath(userId: string, path: Record<string, unknown>): Promise<void> {
    await request(`/api/provisioning/students/${encodeURIComponent(userId)}/guidance-path`, {
      method: "PUT",
      body: JSON.stringify({ source: "admin_guidance", path }),
    });
  },

  /** Load the complete selected guidance path for an admin-guided student. */
  async getGuidancePath(userId: string): Promise<{ path: Record<string, any> } | null> {
    const payload = await request<{ path?: Record<string, any> }>(
      `/api/provisioning/students/${encodeURIComponent(userId)}/guidance-path`,
    );
    return payload ? { path: payload.path ?? {} } : null;
  },

  /** Ask hidden claimed students for consent without receiving their identities. */
  async requestConsent(scope: "progress" | "contact" | "full" = "progress", message?: string): Promise<{ queued: number }> {
    const w = await request<{ queued: number }>(`/api/provisioning/consent-requests`, {
      method: "POST",
      body: JSON.stringify({ scope, message: message?.trim() || null }),
    });
    return { queued: Number(w?.queued ?? 0) };
  },

  /** Download the online HTML report for an authorised admin. */
  downloadReportHtml(userId: string, fileName = "career_report.html") {
    return openStudentDocument(`/api/provisioning/students/${userId}/report.html`, {
      download: fileName,
    });
  },

  /** Open the printable login card carrying the live claim code. */
  openLoginCard(userId: string) {
    return openStudentDocument(`/api/provisioning/students/${userId}/login-card.html`);
  },

  /** Download the QR-enabled login card HTML. */
  downloadLoginCard(userId: string, fileName = "login_card.html") {
    return openStudentDocument(`/api/provisioning/students/${userId}/login-card.html`, {
      download: fileName,
    });
  },

  shareLoginCard(userId: string, fullName: string, claimCode: string) {
    return shareStudentDocument(
      `/api/provisioning/students/${userId}/login-card.html`,
      `login_card_${fullName.replace(/\s+/g, "_")}.html`,
      `Login card for ${fullName}. Claim code: ${claimCode}`,
    );
  },

  shareReportDocx(userId: string, fullName: string) {
    return shareStudentDocument(
      `/api/provisioning/students/${userId}/report.docx`,
      `career_report_${fullName.replace(/\s+/g, "_")}.docx`,
      `Career pathway report for ${fullName}`,
    );
  },

  shareReportHtml(userId: string, fullName: string) {
    return shareStudentDocument(
      `/api/provisioning/students/${userId}/report.html`,
      `career_report_${fullName.replace(/\s+/g, "_")}.html`,
      `Career pathway report for ${fullName}`,
    );
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

  /**
   * Revoke individual visibility (collapse back to aggregate-only).
   *
   * Scope is deliberately omitted by default: the server then revokes every
   * scope for the school, which is what "turn sharing off" means to a student.
   * Sending "progress" unconditionally — as this used to — left a "full" grant
   * standing, and the roster counts "full" as individual visibility, so the
   * student stayed listed after the app told them sharing was off.
   */
  async revokeConsent(schoolId: string, scope?: "progress" | "contact" | "full"): Promise<void> {
    await request(`/api/provisioning/students/consent`, {
      method: "DELETE",
      body: JSON.stringify(scope ? { school_id: schoolId, scope } : { school_id: schoolId }),
    });
  },

  async listConsentRequests(): Promise<StudentConsentRequest[]> {
    const rows = await request<WireConsentRequest[]>(`/api/provisioning/students/consent-requests`);
    return (rows ?? []).map(toConsentRequest);
  },

  async respondToConsentRequest(requestId: string, decision: "grant" | "decline"): Promise<void> {
    await request(`/api/provisioning/students/consent-requests/${encodeURIComponent(requestId)}/respond`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
  },
};
