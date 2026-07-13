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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  webContainer,
} from "../../theme";
import { AdminShell } from "./AdminShell";
import {
  provisioningData,
  type DraftImage,
} from "../../lib/provisioningData";
import type {
  ProvisionDraft,
  GeneratedStudent,
  RosterSummary,
} from "../../types/institution";

type Tab = "roster" | "add";
type AddStage = "import" | "review" | "done";

export function StudentProvisioningScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("roster");

  return (
    <AdminShell title="Students" eyebrow="Roster & provisioning">
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        {/* Tab switch */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {(["roster", "add"] as Tab[]).map((t) => (
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
                  { color: tab === t ? colors.text : colors.textMuted },
                ]}
              >
                {t === "roster" ? "Roster" : "Add students"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {tab === "roster" ? <RosterTab /> : <AddStudentsTab />}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RosterSummary | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    provisioningData
      .getRoster()
      .then((r) => setData(r))
      .catch((e) => setError(e?.message ?? "Could not load the roster."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => load(), [load]);

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
            <Text style={[styles.countValue, { color: colors.text }]}>{c.value}</Text>
            <Text style={[styles.countLabel, { color: colors.textMuted }]}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* Privacy framing */}
      <Text style={[styles.privacyNote, { color: colors.textMuted }]}>
        You only see students who are provisioned by your school (until they claim
        their account) or who have chosen to share their progress. Everyone else
        is counted in aggregate but stays private.
      </Text>

      {/* Visible students */}
      {summary.students.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={styles.emptyGlyph}>🔒</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
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
              <View style={{ flex: 1 }}>
                <Text style={[styles.rosterName, { color: colors.text }]}>
                  {s.fullName || "Unnamed student"}
                </Text>
                {!!s.studentClass && (
                  <Text style={[styles.rosterMeta, { color: colors.textMuted }]}>
                    {s.studentClass}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.badge,
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
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Add students tab — import → review/select → done
// ─────────────────────────────────────────────────────────────

function AddStudentsTab() {
  const { colors } = useTheme();
  const [stage, setStage] = useState<AddStage>("import");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ProvisionDraft[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [generated, setGenerated] = useState<GeneratedStudent[]>([]);

  // Load any existing (previously staged) drafts on entry.
  useEffect(() => {
    provisioningData
      .listDrafts()
      .then((d) => {
        if (d.length) {
          setDrafts(d);
          setStage("review");
        }
      })
      .catch(() => {});
  }, []);

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
    try {
      const staged = await provisioningData.createDrafts({ images });
      setDrafts((prev) => [...prev, ...staged]);
      setStage("review");
    } catch (e) {
      setError((e as Error)?.message ?? "Extraction failed. Add students manually.");
    } finally {
      setBusy(false);
    }
  }, []);

  const addManualRow = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const staged = await provisioningData.createDrafts({
        manualRows: [{ fullName: "" }],
      });
      setDrafts((prev) => [...prev, ...staged]);
      setStage("review");
    } catch (e) {
      setError((e as Error)?.message ?? "Could not add a row.");
    } finally {
      setBusy(false);
    }
  }, []);

  const patchDraft = useCallback(
    (id: string, patch: Partial<ProvisionDraft>) => {
      setDrafts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const commitDraft = useCallback(
    async (d: ProvisionDraft) => {
      try {
        const updated = await provisioningData.updateDraft(d.id, {
          fullName: d.fullName ?? "",
          studentClass: d.studentClass ?? undefined,
          guardianConsent: d.guardianConsent,
          guardianName: d.guardianName ?? undefined,
        });
        patchDraft(d.id, updated);
      } catch {
        /* keep local edit; will retry on generate */
      }
    },
    [patchDraft],
  );

  const generate = useCallback(async () => {
    const items = drafts
      .filter((d) => selected[d.id] && (d.fullName ?? "").trim())
      .map((d) => ({ draftId: d.id }));
    if (!items.length) {
      setError("Select at least one named student to create accounts.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Persist any in-grid edits first, then mint.
      await Promise.all(
        drafts
          .filter((d) => selected[d.id])
          .map((d) => commitDraft(d)),
      );
      const result = await provisioningData.generate(items);
      setGenerated(result);
      setDrafts((prev) => prev.filter((d) => !selected[d.id]));
      setSelected({});
      setStage("done");
    } catch (e) {
      setError((e as Error)?.message ?? "Account creation failed.");
    } finally {
      setBusy(false);
    }
  }, [drafts, selected, commitDraft]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      )}

      {stage === "import" && (
        <View style={{ gap: Spacing.md }}>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Upload a photo of your attendance sheet, result sheet, or class list.
            We read the names into a grid you can correct — nothing is created
            until you review and confirm. The document itself is never stored.
          </Text>
          <PrimaryButton label="Upload class list / results" onPress={pickAndExtract} busy={busy} />
          <SecondaryButton label="Add students manually instead" onPress={addManualRow} />
        </View>
      )}

      {stage === "review" && (
        <View style={{ gap: Spacing.md }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Review &amp; select
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Correct any unclear names, tick the students you want to create
            accounts for, then create. Ticked rows with a name become accounts.
          </Text>

          {drafts.map((d) => (
            <View
              key={d.id}
              style={[
                styles.gridRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                d.needsReview && { borderColor: colors.warning ?? "#e0a106" },
              ]}
            >
              <TouchableOpacity
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
                {selected[d.id] && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={{ flex: 1, gap: Spacing.xs }}>
                <TextInput
                  value={d.fullName ?? ""}
                  onChangeText={(t) => patchDraft(d.id, { fullName: t })}
                  onBlur={() => commitDraft(d)}
                  placeholder="Student name"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg },
                  ]}
                />
                <TextInput
                  value={d.studentClass ?? ""}
                  onChangeText={(t) => patchDraft(d.id, { studentClass: t })}
                  onBlur={() => commitDraft(d)}
                  placeholder="Class (e.g. SS2)"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.inputSmall,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg },
                  ]}
                />
              </View>
              {d.needsReview && (
                <Text style={[styles.reviewFlag, { color: colors.warning ?? "#e0a106" }]}>
                  Check
                </Text>
              )}
            </View>
          ))}

          <View style={{ flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" }}>
            <SecondaryButton label="+ Add another" onPress={addManualRow} />
            <SecondaryButton label="Upload more" onPress={pickAndExtract} />
          </View>

          <PrimaryButton
            label={
              selectedCount
                ? `Create ${selectedCount} account${selectedCount > 1 ? "s" : ""}`
                : "Create accounts"
            }
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
  const [copied, setCopied] = useState<string | null>(null);

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
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {generated.length} account{generated.length > 1 ? "s" : ""} created
      </Text>
      <Text style={[styles.lede, { color: colors.textMuted }]}>
        Give each student their claim code — printed on a card, or shared by email
        or WhatsApp. They redeem it in the app to own their account. Codes are
        single-use; you can reissue a lost one from the roster.
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
          <Text style={[styles.cardName, { color: colors.text }]}>
            {g.fullName}
            {g.studentClass ? `  ·  ${g.studentClass}` : ""}
          </Text>
          <Text style={[styles.cardCodeLabel, { color: colors.textMuted }]}>
            CLAIM CODE
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(g.claimCode);
              setCopied(g.userId);
              setTimeout(() => setCopied(null), 1500);
            }}
          >
            <Text style={[styles.cardCode, { color: colors.text }]}>
              {g.claimCode}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.cardHint, { color: colors.textMuted }]}>
            {copied === g.userId ? "Copied!" : "Tap the code to copy"}
          </Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => provisioningData.openLoginCard(g.userId)}
              style={[styles.miniBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.miniBtnText, { color: colors.text }]}>Print card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                provisioningData.downloadReportDocx(
                  g.userId,
                  `career_report_${g.fullName.replace(/\s+/g, "_")}.docx`,
                )
              }
              style={[styles.miniBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.miniBtnText, { color: colors.text }]}>Report (Word)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => provisioningData.openReportHtml(g.userId)}
              style={[styles.miniBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.miniBtnText, { color: colors.text }]}>Report (PDF)</Text>
            </TouchableOpacity>
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
        <Text style={[styles.btnPrimaryText, { color: colors.bg }]}>{label}</Text>
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
      <Text style={[styles.btnSecondaryText, { color: colors.text }]}>{label}</Text>
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
  tabLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },

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
  countValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
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
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, textAlign: "center" },
  emptyBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.6, textAlign: "center", maxWidth: 440 },

  rosterRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rosterName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  rosterMeta: { fontSize: FontSize.sm },
  badge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    overflow: "hidden",
  },

  lede: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  errorText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

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
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "900" },
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
  reviewFlag: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  cardOut: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.xs,
  },
  cardName: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cardCodeLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, letterSpacing: 1.2, marginTop: Spacing.sm },
  cardCode: { fontSize: FontSize.hero, fontWeight: FontWeight.black, letterSpacing: 4 },
  cardHint: { fontSize: FontSize.xs },

  btnPrimary: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  btnSecondary: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  btnSecondaryText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
