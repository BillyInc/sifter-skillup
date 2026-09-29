/**
 * StudentProvisioningScreen — replaces the locked roster with the real,
 * consent-aware student area for verified institutions.
 *
 * Two tabs:
 *   - Roster: the individually-visible students (provisioned-unclaimed OR
 *     consented), plus the honest counts — "142 affiliated · 118 aggregate-only
 *     · 24 shared with you". The visibility rule is enforced server-side; this
 *     screen only renders what it's given.
 *   - Add students: the assisted-import funnel — upload photos of an attendance
 *     / result sheet (vision pre-fill) or add rows manually → correct in the
 *     review grid → select → generate accounts → print/share login cards.
 *
 * Privacy: uploaded images are sent for transient extraction and never stored;
 * the grid never carries academic data.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  Shadow,
  webContainer,
} from "@/theme";
import { AdminShell } from "./AdminShell";
import LocalLegalNotice from "@/components/LocalLegalNotice";
import { getEducatorProfile } from "@/lib/educatorProfile";
import {
  getAdminProvisioningDrafts,
  saveAdminProvisioningDrafts,
  saveAdminTask,
} from "@/lib/adminResume";
import { useAuth } from "@/hooks/useAuth";
import { provisioningDraftsNeedTicks, provisioningModeFor, selectedProvisioningDraftIds } from "@/lib/provisioningFlow";
import {
  provisioningData,
  type DraftImage,
} from "@/lib/provisioningData";
import type {
  ProvisionDraft,
  GeneratedStudent,
  ProvisioningMergeCandidate,
  ProvisioningStream,
  ProvisioningStudentType,
  RosterSummary,
} from "../../types/institution";

type Tab = "roster" | "add";
type AddStage = "import" | "review" | "done";
type MergeAction = "confirm" | "dismiss";

const STREAMS: { value: ProvisioningStream; label: string }[] = [
  { value: "science", label: "Science" },
  { value: "art", label: "Art" },
  { value: "commercial", label: "Commercial" },
];

const SECONDARY_STAGES: { value: ProvisioningStudentType; label: string }[] = [
  { value: "ss1", label: "SS1" },
  { value: "ss2", label: "SS2" },
  { value: "ss3", label: "SS3" },
];

const JAMB_STAGES: { value: ProvisioningStudentType; label: string }[] = [
  { value: "jamb", label: "JAMB" },
];

function streamLabel(stream?: ProvisioningStream | null) {
  return STREAMS.find((s) => s.value === stream)?.label ?? "";
}

function savedPathRecordName(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key]) return record[key] as string;
  }
  return null;
}

function savedGuidancePathLabel(path: Record<string, any>) {
  const programme = savedPathRecordName(path.programme, ["name", "programmeName", "jambName"]);
  const university = savedPathRecordName(path.university, ["name", "universityName", "schoolName"]);
  const domains = (Array.isArray(path.domains) ? path.domains : [])
    .map((item: unknown) => savedPathRecordName(item, ["name", "domainName", "label"]))
    .filter(Boolean);
  const subgroups = (Array.isArray(path.subgroups) ? path.subgroups : [])
    .map((item: unknown) => savedPathRecordName(item, ["name", "subgroupName", "label"]))
    .filter(Boolean);
  const roles = (Array.isArray(path.roles) ? path.roles : [])
    .map((item: unknown) => savedPathRecordName(item, ["name", "roleName", "label"]))
    .filter(Boolean);
  return [
    programme ? `Programme: ${programme}` : null,
    university ? `University: ${university}` : null,
    domains.length ? `Domains: ${domains.join(", ")}` : null,
    subgroups.length ? `Subgroups: ${subgroups.join(", ")}` : null,
    roles.length ? `Roles: ${roles.join(", ")}` : null,
  ].filter(Boolean).join(" → ");
}

function isLocalDraftId(id: string) {
  return id.startsWith("local-draft-");
}

function makeLocalDraft(
  studentType: ProvisioningStudentType | null,
): ProvisionDraft {
  return {
    id: `local-draft-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    fullName: "",
    studentClass: null,
    stream: null,
    studentType,
    needsReview: true,
    guardianConsent: false,
    guardianName: null,
    status: "draft",
  };
}

export function StudentProvisioningScreen({
  initialMode = "school",
  initialTab = "add",
}: {
  initialMode?: "school" | "jamb";
  initialTab?: Tab;
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [organizationType, setOrganizationType] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [organizationContextReady, setOrganizationContextReady] = useState(false);

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) {
        setOrganizationType(profile?.organizationType ?? null);
        setOrganizationId(profile?.organizationId ?? undefined);
      }
    }).finally(() => { if (active) setOrganizationContextReady(true); });
    return () => { active = false; };
  }, [user?.id]);

  // The URL mode is only a navigation hint. The persisted organisation type is
  // authoritative, so a provider cannot widen itself into school stages.
  const effectiveMode = provisioningModeFor(organizationType, initialMode);
  const isUniversity = organizationType === "university";

  return (
    <AdminShell title={effectiveMode === "jamb" ? "JAMB accounts" : "Students"} eyebrow={effectiveMode === "jamb" ? "Provider guidance" : "Students & provisioning"}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {!organizationContextReady ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.sm }}>
            <ActivityIndicator color={colors.accentRole.action} />
            <Text style={[styles.cardHint, { color: colors.textMuted }]}>Loading your organisation’s account options…</Text>
          </View>
        ) : null}
        {organizationContextReady && isUniversity ? (
          <View style={{ padding: Spacing.xl, gap: Spacing.sm }}>
            <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>Student accounts are not created here</Text>
            <Text style={[styles.lede, { color: colors.textMuted }]}>University administrators use programme and curriculum intelligence. Student account provisioning is available to secondary schools and JAMB guidance providers only.</Text>
          </View>
        ) : null}
        {organizationContextReady && !isUniversity ? <>
        {/* Tab switch */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {(["add", "roster"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tab,
                tab === t && { borderBottomColor: colors.text, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  CompassFonts.bodyBold,
                  { color: tab === t ? colors.text : colors.textMuted },
                ]}
              >
                {t === "roster" ? "Students" : "Add students"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {tab === "roster" ? <RosterTab /> : <AddStudentsTab initialMode={effectiveMode} organizationId={organizationId} organizationContextReady={organizationContextReady} />}
        </> : null}
      </View>
    </AdminShell>
  );
}

export default StudentProvisioningScreen;

// ─────────────────────────────────────────────────────────────
// Roster tab
// ─────────────────────────────────────────────────────────────

function RosterTab() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RosterSummary | null>(null);
  const [mergeCandidates, setMergeCandidates] = useState<ProvisioningMergeCandidate[]>([]);
  const [actioningCandidate, setActioningCandidate] = useState<string | null>(null);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Record<string, boolean>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [consentRequestBusy, setConsentRequestBusy] = useState(false);
  const [consentRequestMessage, setConsentRequestMessage] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      provisioningData.getRoster(),
      provisioningData.listMergeCandidates().catch(() => [] as ProvisioningMergeCandidate[]),
    ])
      .then(([r, candidates]) => {
        setData(r);
        setMergeCandidates(candidates.filter((c) => c.status !== "confirmed" && c.status !== "dismissed"));
      })
      .catch((e) => setError(e?.message ?? "Could not load students."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

  const resolveMergeCandidate = useCallback(
    async (candidateId: string, action: MergeAction) => {
      setActioningCandidate(`${action}:${candidateId}`);
      try {
        if (action === "confirm") {
          await provisioningData.confirmMergeCandidate(candidateId);
        } else {
          await provisioningData.dismissMergeCandidate(candidateId);
        }
        const [r, candidates] = await Promise.all([
          provisioningData.getRoster(),
          provisioningData.listMergeCandidates().catch(() => [] as ProvisioningMergeCandidate[]),
        ]);
        setData(r);
        setMergeCandidates(candidates.filter((c) => c.status !== "confirmed" && c.status !== "dismissed"));
      } catch (e) {
        setError((e as Error)?.message ?? "Could not update that merge candidate.");
      } finally {
        setActioningCandidate(null);
      }
    },
    [],
  );

  const deletableStudents = summaryStudents(data);
  const selectedDeleteIds = Object.keys(selectedForDeletion).filter((id) => selectedForDeletion[id]);
  const deleteSelected = async () => {
    if (!selectedDeleteIds.length || deleteBusy) return;
    setDeleteBusy(true);
    setError(null);
    try {
      await provisioningData.deleteStudents(selectedDeleteIds);
      setData((current) => current ? {
        ...current,
        students: current.students.filter((student) => !selectedDeleteIds.includes(student.userId)),
        totalAffiliated: Math.max(0, current.totalAffiliated - selectedDeleteIds.length),
      } : current);
      setSelectedForDeletion({});
      setDeleteConfirmOpen(false);
      load();
    } catch (e) {
      setError((e as Error)?.message ?? "Could not delete the selected student accounts.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const requestConsent = async () => {
    if (consentRequestBusy) return;
    setConsentRequestBusy(true);
    setConsentRequestMessage(null);
    try {
      const result = await provisioningData.requestConsent("progress");
      setConsentRequestMessage(
        result.queued
          ? `Consent request sent to ${result.queued} claimed student${result.queued === 1 ? "" : "s"}. They decide what to share.`
          : "There are no new claimed students to contact. Existing sharing stays unchanged.",
      );
    } catch (e) {
      setConsentRequestMessage((e as Error)?.message ?? "Could not send consent requests.");
    } finally {
      setConsentRequestBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.text} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.emptyBody, { color: colors.textMuted }]}>{error}</Text>
      </View>
    );
  }

  const summary = data ?? {
    students: [],
    totalAffiliated: 0,
    aggregateOnly: 0,
    sharedWithYou: 0,
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      {/* Counts */}
      <View style={styles.countRow}>
        {[
          { label: "Affiliated", value: summary.totalAffiliated },
          { label: "Aggregate-only", value: summary.aggregateOnly },
          { label: "Shared with you", value: summary.sharedWithYou },
        ].map((c) => (
          <View
            key={c.label}
            style={[
              styles.countCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              Shadow.xs,
            ]}
          >
            <Text style={[styles.countValue, CompassFonts.displayBold, { color: colors.text }]}>{c.value}</Text>
            <Text style={[styles.countLabel, { color: colors.textMuted }]}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Privacy framing */}
      <LocalLegalNotice audience="institution" />
      <Text style={[styles.privacyNote, { color: colors.textMuted }]}>
        You only see students who are provisioned by your school (until they claim
        their account) or who have chosen to share their progress. Everyone else
        is counted in aggregate but stays private. For under-18 students, follow
        the guardian/school safeguarding and consent rules applicable in Nigeria
        and your state; only add records you are authorised to handle.
      </Text>
      <TouchableOpacity
        onPress={() => void requestConsent()}
        disabled={consentRequestBusy}
        style={[styles.miniBtn, { borderColor: colors.border, alignSelf: "flex-start", opacity: consentRequestBusy ? 0.6 : 1 }]}
      >
        <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>Request student consent</Text>
      </TouchableOpacity>
      {consentRequestMessage ? (
        <Text style={[styles.privacyNote, { color: colors.textMuted }]}>{consentRequestMessage}</Text>
      ) : null}

      {deletableStudents.length ? (
      <Text style={[styles.privacyNote, { color: colors.textMuted }]}>
          Select a school-managed student to remove a wrong account. Deletion is
          available only before guidance is completed and before the student claims
          the account; claimed or guided accounts are protected by the server.
        </Text>
      ) : null}
      {selectedDeleteIds.length ? (
        <TouchableOpacity
          onPress={() => setDeleteConfirmOpen(true)}
          style={[styles.miniBtn, { borderColor: colors.danger, alignSelf: "flex-start" }]}
        >
          <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.danger }]}>Delete selected ({selectedDeleteIds.length})</Text>
        </TouchableOpacity>
      ) : null}

      <MergeCandidatesPanel
        candidates={mergeCandidates}
        actioningCandidate={actioningCandidate}
        onConfirm={(id) => resolveMergeCandidate(id, "confirm")}
        onDismiss={(id) => resolveMergeCandidate(id, "dismiss")}
      />

      {/* Visible students */}
      {summary.students.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={styles.emptyGlyph}>🔒</Text>
          <Text style={[styles.emptyTitle, CompassFonts.displayBold, { color: colors.text }]}>
            No individually-visible students yet
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
            When you provision students, or a student shares their progress with
            you, they appear here. Add students from the “Add students” tab.
          </Text>
        </View>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {summary.students.map((s) => (
            <View
              key={s.userId}
              style={[
                styles.rosterRow,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {s.provenance === "provisioned" && s.claimState === "unclaimed" && !s.guidanceComplete ? (
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: Boolean(selectedForDeletion[s.userId]) }}
                  onPress={() => setSelectedForDeletion((current) => ({ ...current, [s.userId]: !current[s.userId] }))}
                  style={[styles.checkbox, { borderColor: colors.border, backgroundColor: selectedForDeletion[s.userId] ? colors.text : "transparent" }]}
                >
                  {selectedForDeletion[s.userId] ? <Text style={[styles.checkmark, CompassFonts.displayBold]}>✓</Text> : null}
                </TouchableOpacity>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={[styles.rosterName, CompassFonts.bodyBold, { color: colors.text }]}>
                  {s.fullName || "Unnamed student"}
                </Text>
                {!![s.studentClass, s.stream ? `${streamLabel(s.stream)} stream` : null].filter(Boolean).length && (
                  <Text style={[styles.rosterMeta, { color: colors.textMuted }]}>
                    {[s.studentClass, s.stream ? `${streamLabel(s.stream)} stream` : null].filter(Boolean).join(" · ")}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.badge,
                  CompassFonts.bodyBold,
                  {
                    color: colors.textMuted,
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                {s.provenance === "provisioned" && s.claimState === "unclaimed"
                  ? "School-managed"
                  : s.hasConsent
                    ? "Shared by student"
                    : "Claimed"}
              </Text>
              {s.guidanceComplete ? (
                <>
                  {s.visible && (s.provenance === "provisioned" || s.hasConsent) ? (
                    <>
                      <TouchableOpacity
                        onPress={() => provisioningData.openReportHtml(s.userId)}
                        style={[styles.miniBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>Report</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.push(`/(admin)/students/${encodeURIComponent(s.userId)}/guidance?student_class=${encodeURIComponent(s.studentClass ?? "")}&student_type=${encodeURIComponent(s.studentType ?? "")}&stream=${encodeURIComponent(s.stream ?? "")}` as never)}
                        style={[styles.miniBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>Review guidance</Text>
                      </TouchableOpacity>
                    </>
                  ) : null}
                </>
              ) : s.visible && (s.provenance === "provisioned" || s.hasConsent) ? (
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/students/${encodeURIComponent(s.userId)}/guidance?student_class=${encodeURIComponent(s.studentClass ?? "")}&student_type=${encodeURIComponent(s.studentType ?? "")}&stream=${encodeURIComponent(s.stream ?? "")}` as never)}
                  style={[styles.miniBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>Guide student</Text>
                </TouchableOpacity>
              ) : null}
              {s.provenance === "provisioned" && s.claimState === "unclaimed" ? (
                <TouchableOpacity
                  onPress={() => provisioningData.openLoginCard(s.userId)}
                  style={[styles.miniBtn, { borderColor: colors.border }]}
                >
                <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>Claim card</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      )}
      <Modal visible={deleteConfirmOpen} transparent animationType="fade" onRequestClose={() => setDeleteConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>Delete student accounts?</Text>
            <Text style={[styles.lede, { color: colors.textMuted }]}>This permanently removes {selectedDeleteIds.length} unclaimed, unguided school-created account{selectedDeleteIds.length === 1 ? "" : "s"} and invalidates its claim code. Claimed or guided accounts cannot be deleted.</Text>
            <View style={styles.cardActions}>
              <SecondaryButton label="Cancel" onPress={() => setDeleteConfirmOpen(false)} />
              <PrimaryButton label="Delete permanently" onPress={deleteSelected} busy={deleteBusy} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function summaryStudents(data: RosterSummary | null) {
  return (data?.students ?? []).filter(
    (student) => student.provenance === "provisioned" && student.claimState === "unclaimed" && !student.guidanceComplete,
  );
}

function MergeCandidatesPanel({
  candidates,
  actioningCandidate,
  onConfirm,
  onDismiss,
}: {
  candidates: ProvisioningMergeCandidate[];
  actioningCandidate: string | null;
  onConfirm: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const { colors } = useTheme();
  if (!candidates.length) return null;

  return (
    <View
      style={[
        styles.mergePanel,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
        Merge candidates
      </Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>
        These look like students who claimed or created another account. Confirm
        only when the two records are the same student.
      </Text>

      {candidates.map((candidate) => {
        const score =
          typeof candidate.matchScore === "number"
            ? candidate.matchScore <= 1
              ? `${Math.round(candidate.matchScore * 100)}%`
              : `${Math.round(candidate.matchScore)}%`
            : null;
        const provisionedMeta = [
          candidate.provisionedStudentClass,
          candidate.provisionedStream ? `${streamLabel(candidate.provisionedStream)} stream` : null,
        ].filter(Boolean);

        return (
          <View
            key={candidate.id}
            style={[
              styles.mergeCard,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            <View style={styles.mergeNames}>
              <View style={styles.mergeNameBlock}>
                <Text style={[styles.mergeLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
                  Provisioned
                </Text>
                <Text style={[styles.rosterName, CompassFonts.bodyBold, { color: colors.text }]}>
                  {candidate.provisionedFullName || "Unnamed student"}
                </Text>
                {!!provisionedMeta.length && (
                  <Text style={[styles.rosterMeta, { color: colors.textMuted }]}>
                    {provisionedMeta.join(" · ")}
                  </Text>
                )}
              </View>
              <Text style={[styles.mergeArrow, CompassFonts.bodyBold, { color: colors.textMuted }]}>→</Text>
              <View style={styles.mergeNameBlock}>
                <Text style={[styles.mergeLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
                  Claimed
                </Text>
                <Text style={[styles.rosterName, CompassFonts.bodyBold, { color: colors.text }]}>
                  {candidate.claimedFullName || "Unnamed account"}
                </Text>
                {!!candidate.claimedContact && (
                  <Text style={[styles.rosterMeta, { color: colors.textMuted }]}>
                    {candidate.claimedContact}
                  </Text>
                )}
              </View>
            </View>

            {!!(candidate.reason || score) && (
              <Text style={[styles.mergeReason, { color: colors.textMuted }]}>
                {[score ? `${score} match` : null, candidate.reason].filter(Boolean).join(" · ")}
              </Text>
            )}

            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => onConfirm(candidate.id)}
                disabled={!!actioningCandidate}
                style={[
                  styles.miniBtn,
                  { borderColor: colors.border, opacity: actioningCandidate ? 0.6 : 1 },
                ]}
              >
                <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>
                  {actioningCandidate === `confirm:${candidate.id}` ? "Confirming..." : "Confirm merge"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDismiss(candidate.id)}
                disabled={!!actioningCandidate}
                style={[
                  styles.miniBtn,
                  { borderColor: colors.border, opacity: actioningCandidate ? 0.6 : 1 },
                ]}
              >
                <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>
                  {actioningCandidate === `dismiss:${candidate.id}` ? "Dismissing..." : "Dismiss"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Add students tab — import → review/select → done
// ─────────────────────────────────────────────────────────────

function AddStudentsTab({ initialMode = "school", organizationId, organizationContextReady }: { initialMode?: "school" | "jamb"; organizationId?: string; organizationContextReady: boolean }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [stage, setStage] = useState<AddStage>("import");
  const [busy, setBusy] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [manualEntryOnly, setManualEntryOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ProvisionDraft[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState<GeneratedStudent[]>([]);
  const [resumeHydrated, setResumeHydrated] = useState(false);
  const [localDraftsHydrated, setLocalDraftsHydrated] = useState(false);
  const defaultStudentType: ProvisioningStudentType = initialMode === "jamb" ? "jamb" : "ss1";
  const stageOptions = initialMode === "jamb" ? JAMB_STAGES : SECONDARY_STAGES;
  const showStream = initialMode === "school";

  useEffect(() => {
    // Always open on the two deliberate actions. A saved task may preserve
    // data locally, but must not drop an administrator straight into a
    // pre-created review/account row when they open Students.
    setStage("import");
    setResumeHydrated(true);
  }, []);

  useEffect(() => {
    if (!user?.id || !resumeHydrated) return;
    void saveAdminTask({
      href: "/(admin)/students",
      label: "Student account creation and roster",
      stage,
      tab: "add",
    }, user.id);
  }, [resumeHydrated, stage, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setLocalDraftsHydrated(true);
      return;
    }
    getAdminProvisioningDrafts(user.id).then((localDrafts) => {
      if (!localDrafts.length) return;
      setDrafts((current) => {
        const currentIds = new Set(current.map((draft) => draft.id));
        return [...localDrafts.filter((draft) => !currentIds.has(draft.id)), ...current];
      });
    }).finally(() => setLocalDraftsHydrated(true));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !localDraftsHydrated) return;
    void saveAdminProvisioningDrafts(
      drafts.filter((draft) => isLocalDraftId(draft.id)),
      user.id,
    );
  }, [drafts, localDraftsHydrated, user?.id]);

  // Load any existing (previously staged) drafts on entry.
  useEffect(() => {
    if (!organizationContextReady) return;
    provisioningData
      .listDrafts(organizationId)
      .then((d) => {
        if (d.length) {
          setDrafts(d.map((draft) => ({
            ...draft,
            studentType: draft.studentType ?? (showStream ? null : defaultStudentType),
          })));
        }
      })
      .catch(() => {});
  }, [defaultStudentType, organizationContextReady, organizationId, showStream]);

  const pickAndExtract = useCallback(async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo access is needed to read a class list or result sheet.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (res.canceled) return;
    const images: DraftImage[] = res.assets
      .filter((a) => a.base64)
      .map((a) => ({
        mediaType: a.mimeType ?? "image/jpeg",
        data: a.base64 as string,
      }));
    if (!images.length) {
      setError("Those images couldn't be read. Try again or add students manually.");
      return;
    }
    setBusy(true);
    setManualEntryOnly(false);
    setUploadMenuOpen(false);
    try {
      const staged = await provisioningData.createDrafts({ images, organizationId });
      if (!staged.length) {
        setError("No student names could be read from that file. Try a clearer image or add students manually.");
        return;
      }
      const normalized: ProvisionDraft[] = staged.map((draft) => ({
        ...draft,
        studentType: draft.studentType ?? (showStream ? null : defaultStudentType),
      }));
      const previousServerIds = drafts.filter((draft) => !isLocalDraftId(draft.id)).map((draft) => draft.id);
      if (previousServerIds.length) await provisioningData.clearDrafts(previousServerIds, organizationId);
      setDrafts(normalized);
      setSelected({});
      setStage("review");
    } catch (e) {
      setError((e as Error)?.message ?? "Extraction failed. Add students manually.");
    } finally {
      setBusy(false);
    }
  }, [defaultStudentType, drafts, organizationId, showStream]);

  const pickDocumentAndExtract = useCallback(async () => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      setError("Document upload is available in the web dashboard. On mobile, upload a clear photo instead.");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*";
    input.multiple = true;
    const files = await new Promise<File[]>((resolve) => {
      input.onchange = () => resolve(Array.from(input.files ?? []));
      input.click();
    });
    if (!files.length) return;

    setBusy(true);
    setManualEntryOnly(false);
    setError(null);
    setUploadMenuOpen(false);
    try {
      const images: DraftImage[] = await Promise.all(files.slice(0, 15).map((file) => new Promise<DraftImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const encoded = String(reader.result ?? "");
          const comma = encoded.indexOf(",");
          resolve({
            mediaType: file.type || "application/octet-stream",
            data: comma >= 0 ? encoded.slice(comma + 1) : encoded,
          });
        };
        reader.onerror = () => reject(new Error("The selected document could not be read."));
        reader.readAsDataURL(file);
      })));
      const staged = await provisioningData.createDrafts({ images, organizationId });
      if (!staged.length) {
        setError("No student names could be read from that document. Try another file or add students manually.");
        return;
      }
      const previousServerIds = drafts.filter((draft) => !isLocalDraftId(draft.id)).map((draft) => draft.id);
      if (previousServerIds.length) await provisioningData.clearDrafts(previousServerIds, organizationId);
      setDrafts(staged.map((draft) => ({
        ...draft,
        studentType: draft.studentType ?? (showStream ? null : defaultStudentType),
      })));
      setSelected({});
      setStage("review");
    } catch (e) {
      setError((e as Error)?.message ?? "The document could not be read. Add students manually.");
    } finally {
      setBusy(false);
    }
  }, [defaultStudentType, drafts, organizationId, showStream]);

  const addManualRow = useCallback(async () => {
    setError(null);
    if (stage === "import" && drafts.length) {
      const previousServerIds = drafts.filter((draft) => !isLocalDraftId(draft.id)).map((draft) => draft.id);
      try {
        if (previousServerIds.length) await provisioningData.clearDrafts(previousServerIds, organizationId);
      } catch (e) {
        setError((e as Error)?.message ?? "Could not reset the previous account list.");
        return;
      }
      setDrafts([]);
    }
    setManualEntryOnly(true);
    // Keep manual entry local until the administrator confirms account creation.
    // This prevents an empty row from triggering the slow document-staging path.
    setDrafts((prev) => stage === "import"
      ? [makeLocalDraft(showStream ? null : defaultStudentType)]
      : prev.concat(makeLocalDraft(showStream ? null : defaultStudentType)));
    setSelected({});
    setStage("review");
  }, [defaultStudentType, drafts, organizationId, showStream, stage]);

  const patchDraft = useCallback(
    (id: string, patch: Partial<ProvisionDraft>) => {
      setDrafts((prev) => prev.map((d) => {
        if (d.id !== id) return d;
        const next = { ...d, ...patch };
        return Object.prototype.hasOwnProperty.call(patch, "fullName")
          ? { ...next, needsReview: !(next.fullName ?? "").trim() }
          : next;
      }));
    },
    [],
  );

  const commitDraft = useCallback(
    async (d: ProvisionDraft) => {
      if (isLocalDraftId(d.id)) return;
      try {
        const updated = await provisioningData.updateDraft(d.id, {
          fullName: d.fullName ?? "",
          studentClass: d.studentClass ?? undefined,
          stream: showStream ? d.stream ?? undefined : undefined,
          studentType: d.studentType ?? defaultStudentType,
          guardianConsent: d.guardianConsent,
          guardianName: d.guardianName ?? undefined,
        }, organizationId);
        patchDraft(d.id, updated);
      } catch {
        /* keep local edit; will retry on generate */
      }
    },
    [defaultStudentType, organizationId, patchDraft, showStream],
  );

  const generate = useCallback(async () => {
    const selectedOriginalIds = new Set(selectedProvisioningDraftIds(drafts, selected));

    if (!selectedOriginalIds.size) {
      setError("Select at least one named student to create accounts.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let workingDrafts = drafts;
      let selectedIds = new Set(selectedOriginalIds);
      const localSelected = drafts.filter(
        (d) => selectedOriginalIds.has(d.id) && isLocalDraftId(d.id),
      );
      const selectedDrafts = drafts.filter((d) => selectedOriginalIds.has(d.id));
      if (showStream && selectedDrafts.some((d) => !d.studentType)) {
        throw new Error("Choose SS1, SS2 or SS3 for each selected student.");
      }
      if (showStream && selectedDrafts.some((d) => !d.stream)) {
        throw new Error("Choose a stream for every selected student before creating accounts.");
      }
      if (localSelected.length) {
        const staged = await provisioningData.createDrafts({
          organizationId,
          manualRows: localSelected.map((d) => ({
            fullName: d.fullName ?? "",
            studentClass: d.studentClass ?? undefined,
            stream: showStream ? d.stream ?? undefined : undefined,
            studentType: d.studentType ?? defaultStudentType,
            guardianConsent: d.guardianConsent,
            guardianName: d.guardianName ?? undefined,
          })),
        });
        if (staged.length !== localSelected.length) {
          throw new Error("Could not stage the manually entered students. Please try again.");
        }
        const normalized = staged.map((draft) => ({
          ...draft,
          studentType: draft.studentType ?? defaultStudentType,
        }));
        const replacement = new Map(localSelected.map((d, index) => [d.id, normalized[index]]));
        workingDrafts = drafts.map((d) => replacement.get(d.id) ?? d);
        selectedIds = new Set(
          Array.from(selectedOriginalIds).map((id) => replacement.get(id)?.id ?? id),
        );
        setDrafts(workingDrafts);
      }
      const items = workingDrafts
        .filter((d) => selectedIds.has(d.id) && (d.fullName ?? "").trim())
        .map((d) => ({
          draftId: d.id,
          stream: showStream ? d.stream ?? undefined : undefined,
          studentType: d.studentType ?? defaultStudentType,
        }));
      if (!items.length) {
        throw new Error("Select at least one named student to create accounts.");
      }
      // Persist any in-grid edits first, then mint.
      await Promise.all(
        workingDrafts
          .filter((d) => selectedIds.has(d.id))
          .map((d) => commitDraft(d)),
      );
      const result = await provisioningData.generate(items, organizationId);
      setGenerated(result);
      setDrafts((prev) => prev.filter((d) => !selectedIds.has(d.id)));
      setSelected({});
      setStage("done");
    } catch (e) {
      setError((e as Error)?.message ?? "Account creation failed.");
    } finally {
      setBusy(false);
    }
  }, [defaultStudentType, drafts, organizationId, selected, commitDraft, showStream]);

  const clearSelectedRows = useCallback(async () => {
    const ids = drafts.filter((d) => selected[d.id] && !isLocalDraftId(d.id)).map((d) => d.id);
    const localIds = new Set(drafts.filter((d) => selected[d.id] && isLocalDraftId(d.id)).map((d) => d.id));
    if (!ids.length && !localIds.size) return;
    setBusy(true);
    setManualEntryOnly(false);
    setError(null);
    try {
      if (ids.length) await provisioningData.clearDrafts(ids, organizationId);
      setDrafts((current) => current.filter((d) => !selected[d.id]));
      setSelected({});
      if (!drafts.some((d) => !selected[d.id])) setStage("import");
    } catch (e) {
      setError((e as Error)?.message ?? "Could not clear the selected rows.");
    } finally {
      setBusy(false);
    }
  }, [drafts, organizationId, selected]);

  const removeDraft = useCallback(async (draftId: string) => {
    const target = drafts.find((draft) => draft.id === draftId);
    if (!target) return;
    try {
      if (!isLocalDraftId(target.id)) await provisioningData.clearDrafts([target.id], organizationId);
      setDrafts((current) => current.filter((draft) => draft.id !== draftId));
      setSelected((current) => {
        const next = { ...current };
        delete next[draftId];
        return next;
      });
      if (drafts.length === 1) setStage("import");
      setError(null);
    } catch (e) {
      setError((e as Error)?.message ?? "Could not remove this account row.");
    }
  }, [drafts, organizationId]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {error && (
        <Text style={[styles.errorText, CompassFonts.bodyBold, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      {stage === "import" && (
        <View style={{ gap: Spacing.md }}>
          <LocalLegalNotice audience="institution" />
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Upload a photo of your attendance sheet, result sheet, or class list.
            We read the names into a grid you can correct — nothing is created
            until you review and confirm. The document itself is never stored.
          </Text>
          <PrimaryButton
            label={uploadMenuOpen ? "Close upload options" : "Upload a class list or result"}
            onPress={() => setUploadMenuOpen((open) => !open)}
            busy={busy}
          />
          {uploadMenuOpen ? (
            <View style={{ gap: Spacing.sm }}>
              <SecondaryButton label="Choose photo or image" onPress={pickAndExtract} />
              <SecondaryButton label="Choose PDF or document" onPress={pickDocumentAndExtract} />
              <Text style={[styles.cardHint, { color: colors.textMuted }]}>You can return here before selecting a file.</Text>
            </View>
          ) : null}
          <PrimaryButton label="Create student account" onPress={() => void addManualRow()} />
          {drafts.length ? (
            <SecondaryButton
              label="Resume review"
              onPress={() => {
                setError(null);
                setStage("review");
              }}
            />
          ) : null}
        </View>
      )}

      {stage === "review" && (
        <View style={{ gap: Spacing.md }}>
          <LocalLegalNotice audience="institution" />
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Review &amp; select
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Correct any unclear names, tick the students you want to create
            accounts for, then create. Ticked rows with a name become accounts.
          </Text>
           <Text style={[styles.cardHint, { color: colors.textMuted }]}>{showStream ? "Choose the class and stream separately for each student below." : "JAMB accounts use the JAMB student type and do not have a secondary-school stream."}</Text>

          {drafts.map((d) => (
            <View
              key={d.id}
              style={[
                styles.gridRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                d.needsReview && { borderColor: colors.warning ?? "#e0a106" },
              ]}
            >
              {provisioningDraftsNeedTicks(drafts) ? <TouchableOpacity
                onPress={() =>
                  setSelected((s) => ({ ...s, [d.id]: !s[d.id] }))
                }
                style={[
                  styles.checkbox,
                  {
                    borderColor: colors.border,
                    backgroundColor: selected[d.id] ? colors.text : "transparent",
                  },
                ]}
              >
                {selected[d.id] && <Text style={[styles.checkmark, CompassFonts.displayBold]}>✓</Text>}
              </TouchableOpacity> : null}
              <View style={{ flex: 1, gap: Spacing.xs }}>
                <View style={styles.inputWithClear}>
                  <TextInput
                    value={d.fullName ?? ""}
                    onChangeText={(t) => patchDraft(d.id, { fullName: t })}
                    onBlur={() => commitDraft(d)}
                    placeholder="Student name"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.clearableInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
                  />
                  {d.fullName ? <TouchableOpacity onPress={() => { patchDraft(d.id, { fullName: "" }); void commitDraft({ ...d, fullName: "" }); }} style={styles.clearButton}><Text style={[styles.clearButtonText, { color: colors.textMuted }]}>Clear</Text></TouchableOpacity> : null}
                </View>
                {showStream ? <StagePicker
                  label="Class"
                  value={d.studentType ?? defaultStudentType}
                  options={stageOptions}
                  onChange={(studentType) => {
                    const studentClass = studentType.toUpperCase();
                    const updated = { ...d, studentType, studentClass };
                    patchDraft(d.id, { studentType, studentClass });
                    commitDraft(updated);
                  }}
                /> : null}
                {showStream ? <StreamPicker
                  label="Stream"
                  compact
                  value={d.stream ?? undefined}
                  onChange={(stream) => {
                    const updated = { ...d, stream };
                    patchDraft(d.id, { stream });
                    commitDraft(updated);
                  }}
                /> : null}
                {showStream ? (
                  <View style={{ gap: Spacing.xs }}>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => {
                        const updated = { ...d, guardianConsent: !d.guardianConsent };
                        patchDraft(d.id, { guardianConsent: updated.guardianConsent });
                        void commitDraft(updated);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm, minHeight: 36 }}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: colors.border,
                            backgroundColor: d.guardianConsent ? colors.text : "transparent",
                          },
                        ]}
                      >
                        {d.guardianConsent ? <Text style={[styles.checkmark, CompassFonts.displayBold]}>✓</Text> : null}
                      </View>
                      <Text style={[styles.cardHint, { color: colors.text }]}>Record guardian consent (optional)</Text>
                    </TouchableOpacity>
                    {d.guardianConsent ? (
                      <TextInput
                        value={d.guardianName ?? ""}
                        onChangeText={(guardianName) => patchDraft(d.id, { guardianName })}
                        onBlur={() => void commitDraft({ ...d, guardianName: d.guardianName ?? "" })}
                        placeholder="Guardian name"
                        placeholderTextColor={colors.textMuted}
                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg, maxWidth: undefined }]}
                      />
                    ) : (
                      <Text style={[styles.cardHint, { color: colors.textMuted }]}>Consent is not required to create the account.</Text>
                    )}
                  </View>
                ) : null}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.sm }}>
                {d.needsReview ? <Text style={[styles.reviewFlag, CompassFonts.bodyBold, { color: colors.warning ?? "#e0a106" }]}>Details need confirmation</Text> : <View />}
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${d.fullName || "student"} from this account list`} onPress={() => void removeDraft(d.id)}>
                  <Text style={[styles.cardHint, { color: colors.danger }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" }}>
            {!manualEntryOnly ? <SecondaryButton
              label="Back to upload options"
              onPress={() => {
                setError(null);
                setManualEntryOnly(false);
                setUploadMenuOpen(false);
                setStage("import");
              }}
            /> : null}
            <SecondaryButton label="+ Add another" onPress={addManualRow} />
            {selectedCount ? <SecondaryButton label={`Clear selected (${selectedCount})`} onPress={() => void clearSelectedRows()} /> : null}
            {!manualEntryOnly ? <SecondaryButton
              label={uploadMenuOpen ? "Close upload options" : "Upload more"}
              onPress={() => setUploadMenuOpen((open) => !open)}
            /> : null}
          </View>
           {!manualEntryOnly && uploadMenuOpen ? (
            <View style={{ gap: Spacing.sm }}>
              <SecondaryButton label="Choose photo or image" onPress={pickAndExtract} />
              <SecondaryButton label="Choose PDF or document" onPress={pickDocumentAndExtract} />
            </View>
          ) : null}

          <PrimaryButton
            label={(() => {
              const implicitSingle = drafts.length === 1 && Boolean(drafts[0].fullName?.trim());
              const count = selectedCount || (implicitSingle ? 1 : 0);
              return count
                ? `Create ${count} account${count === 1 ? "" : "s"}`
                : "Create selected accounts";
            })()}
            onPress={generate}
            busy={busy}
          />
        </View>
      )}

      {stage === "done" && (
        <GeneratedCards
          generated={generated}
          onDone={() => {
            setGenerated([]);
            setStage(drafts.length ? "review" : "import");
          }}
        />
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Generated login cards (printable / shareable claim codes)
// ─────────────────────────────────────────────────────────────

function GeneratedCards({
  generated,
  onDone,
}: {
  generated: GeneratedStudent[];
  onDone: () => void;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [savedPathLabels, setSavedPathLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const complete = generated.filter((student) => student.guidanceComplete);
    if (!complete.length) {
      setSavedPathLabels({});
      return () => { active = false; };
    }
    void Promise.all(complete.map(async (student) => {
      try {
        const saved = await provisioningData.getGuidancePath(student.userId);
        return [student.userId, savedGuidancePathLabel(saved?.path ?? {})] as const;
      } catch {
        return [student.userId, ""] as const;
      }
    })).then((entries) => {
      if (active) setSavedPathLabels(Object.fromEntries(entries));
    });
    return () => { active = false; };
  }, [generated]);

  const copyAll = useCallback(async () => {
    const text = generated
      .map(
        (g) =>
          `${g.fullName}${g.studentClass ? ` (${g.studentClass})` : ""} — claim code: ${g.claimCode}`,
      )
      .join("\n");
    await Clipboard.setStringAsync(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 1500);
  }, [generated]);

  return (
    <View style={{ gap: Spacing.md }}>
      <LocalLegalNotice audience="institution" />
      <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
        {generated.length} account{generated.length > 1 ? "s" : ""} created
      </Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>
        Give each student their claim code — printed on a card, or shared by email
        or WhatsApp. They redeem it in the app to own their account. Codes are
        single-use; you can reissue a lost one from the student list.
      </Text>

      {generated.map((g) => (
        <View
          key={g.userId}
          style={[
            styles.cardOut,
            { backgroundColor: colors.card, borderColor: colors.border },
            Shadow.xs,
          ]}
        >
          <Text style={[styles.cardName, CompassFonts.bodyBold, { color: colors.text }]}>
            {g.fullName}
            {g.studentClass ? `  ·  ${g.studentClass}` : ""}
          </Text>
          <Text style={[styles.cardCodeLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
            CLAIM CODE
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(g.claimCode);
              setCopied(g.userId);
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            <Text style={[styles.cardCode, CompassFonts.displayBold, { color: colors.text }]}>
              {g.claimCode}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.cardHint, { color: colors.textMuted }]}>
            {copied === g.userId ? "Copied!" : "Tap the code to copy"}
          </Text>
          {!g.guidanceComplete ? (
            <Text style={[styles.guidancePending, { color: colors.warning ?? colors.textMuted }]}>Guide this student before printing a report.</Text>
          ) : null}
          {g.guidanceComplete ? (
            <Text style={[styles.guidancePath, { color: colors.textMuted }]}>Report context: {savedPathLabels[g.userId] || "Saved guidance path details are loading."}</Text>
          ) : null}
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => provisioningData.openLoginCard(g.userId)}
              style={[styles.miniBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>⎙ Print card</Text>
             </TouchableOpacity>
            <TouchableOpacity
              onPress={() => provisioningData.downloadLoginCard(g.userId, `login_card_${g.fullName.replace(/\s+/g, "_")}.html`)}
              style={[styles.miniBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>⇩ Download card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => provisioningData.shareLoginCard(g.userId, g.fullName, g.claimCode)}
              style={[styles.miniBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>↗ Share card</Text>
            </TouchableOpacity>
            {!g.guidanceComplete ? (
              <TouchableOpacity
                onPress={() => router.push(`/(admin)/students/${encodeURIComponent(g.userId)}/guidance?student_class=${encodeURIComponent(g.studentClass ?? "")}&stream=${encodeURIComponent(g.stream ?? "")}` as never)}
                style={[styles.miniBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>Guide student</Text>
              </TouchableOpacity>
            ) : null}
            {g.guidanceComplete ? (
              <>
                <TouchableOpacity
                  onPress={() =>
                    provisioningData.downloadReportDocx(
                      g.userId,
                      `career_report_${g.fullName.replace(/\s+/g, "_")}.docx`,
                    )
                  }
                  style={[styles.miniBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>⇩ Download Word plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => provisioningData.shareReportDocx(g.userId, g.fullName)}
                  style={[styles.miniBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>↗ Share Word plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => provisioningData.openReportHtml(g.userId)}
                  style={[styles.miniBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>⎙ Print / save PDF plan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => provisioningData.shareReportHtml(g.userId, g.fullName)}
                  style={[styles.miniBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.miniBtnText, CompassFonts.bodyBold, { color: colors.text }]}>↗ Share PDF plan</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      ))}

      <PrimaryButton
        label={copied === "all" ? "Copied all codes!" : "Copy all codes"}
        onPress={copyAll}
      />
      <SecondaryButton label="Done" onPress={onDone} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Small button primitives (match admin chrome tokens)
// ─────────────────────────────────────────────────────────────

function StagePicker({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value?: ProvisioningStudentType | null;
  options: { value: ProvisioningStudentType; label: string }[];
  onChange: (value: ProvisioningStudentType) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.streamPicker}>
      {label ? (
        <Text style={[styles.streamPickerLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
          {label}
        </Text>
      ) : null}
      {!value ? <Text style={[styles.cardHint, { color: colors.textMuted }]}>Choose a class</Text> : null}
      <View style={styles.streamPills}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.streamPill,
                {
                  borderColor: active ? colors.text : colors.border,
                  backgroundColor: active ? colors.text : colors.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.streamPillText,
                  CompassFonts.bodyBold,
                  { color: active ? colors.bg : colors.text },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StreamPicker({
  label,
  value,
  onChange,
  compact,
}: {
  label?: string;
  value?: ProvisioningStream | null;
  onChange: (stream: ProvisioningStream) => void;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.streamPicker, compact && styles.streamPickerCompact]}>
      {!!label && (
        <Text style={[styles.streamPickerLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
          {label}
        </Text>
      )}
      <View style={styles.streamPills}>
        {STREAMS.map((stream) => {
          const active = stream.value === value;
          return (
            <TouchableOpacity
              key={stream.value}
              onPress={() => onChange(stream.value)}
              style={[
                styles.streamPill,
                {
                  borderColor: active ? colors.text : colors.border,
                  backgroundColor: active ? colors.text : colors.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.streamPillText,
                  CompassFonts.bodyBold,
                  { color: active ? colors.bg : colors.text },
                ]}
              >
                {stream.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  busy,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={busy}
      style={[styles.btnPrimary, { backgroundColor: colors.text, opacity: busy ? 0.6 : 1 }]}
    >
      {busy ? (
        <ActivityIndicator color={colors.bg} />
      ) : (
        <Text style={[styles.btnPrimaryText, CompassFonts.bodyBold, { color: colors.bg }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btnSecondary, { borderColor: colors.border }]}
    >
      <Text style={[styles.btnSecondaryText, CompassFonts.bodyBold, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: Spacing.lg },
  tab: { paddingVertical: Spacing.md, marginRight: Spacing.xl },
  tabLabel: { fontSize: FontSize.md },

  countRow: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  countCard: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.xs,
  },
  countValue: { fontSize: FontSize.xxl },
  countLabel: { fontSize: FontSize.xs, textAlign: "center" },
  privacyNote: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },

  emptyCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyGlyph: { fontSize: 30 },
  emptyTitle: { fontSize: FontSize.lg, textAlign: "center" },
  emptyBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.6, textAlign: "center", maxWidth: 440 },

  rosterRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rosterName: { fontSize: FontSize.md },
  rosterMeta: { fontSize: FontSize.sm },
  badge: {
    fontSize: FontSize.xs,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },
  mergePanel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  mergeCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  mergeNames: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  mergeNameBlock: { flex: 1, minWidth: 180, gap: 2 },
  mergeLabel: {
    fontSize: FontSize.xs,
    textTransform: "uppercase",
  },
  mergeArrow: { fontSize: FontSize.lg },
  mergeReason: { fontSize: FontSize.xs },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  miniBtn: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
  },
  miniBtnText: {
    fontSize: FontSize.xs,
    textAlign: "center",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  confirmCard: {
    width: "100%",
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },

  lede: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  sectionTitle: { fontSize: FontSize.lg },
  errorText: { fontSize: FontSize.sm },

  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: "#fff", fontSize: 14 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.sm : Spacing.xs,
    fontSize: FontSize.md,
  },
  inputSmall: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? Spacing.xs : 2,
    fontSize: FontSize.sm,
    maxWidth: 160,
  },
  inputWithClear: {
    position: "relative",
    width: "100%",
  },
  clearableInput: { flex: 1, paddingRight: Spacing.xl * 2 },
  clearButton: {
    position: "absolute",
    right: Spacing.xs,
    top: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xs,
    justifyContent: "center",
  },
  clearButtonText: { fontSize: FontSize.xs, fontWeight: "700" },
  reviewFlag: { fontSize: FontSize.xs },

  cardOut: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.xs,
  },
  cardName: { fontSize: FontSize.md },
  cardCodeLabel: { fontSize: FontSize.xs, letterSpacing: 1.2, marginTop: Spacing.sm },
  cardCode: { fontSize: FontSize.hero, letterSpacing: 4 },
  cardHint: { fontSize: FontSize.xs },
  guidancePending: { fontSize: FontSize.xs, textAlign: "center" },
  guidancePath: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45, textAlign: "center" },
  streamPicker: { gap: Spacing.xs },
  streamPickerCompact: { flex: 1, minWidth: 180 },
  streamPickerLabel: {
    fontSize: FontSize.xs,
    textTransform: "uppercase",
  },
  streamPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  streamPill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  streamPillText: {
    fontSize: FontSize.xs,
  },

  btnPrimary: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: { fontSize: FontSize.md },
  btnSecondary: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: FontSize.sm },
});
