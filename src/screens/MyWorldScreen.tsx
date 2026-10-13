/**
 * MyWorldScreen — the student's My World tab.
 *
 * Two faces, gated by a single feature flag (`featureFlags.myWorldLive`):
 *
 *  • OFF (pre-launch): the PERSONAL PAGE — the student's OPEN personal hub. It
 *    surfaces the things they've personally collected off the discipline →
 *    domain/role mapping: SAVED domains/roles/programmes (grouped by type, each
 *    tappable into Explore and removable), and PERSONAL NOTES filed into folders
 *    by category (each editable + re-fileable via a bottom-sheet). The
 *    interactive upskilling tracks + Portfolio stay behind a single LOCKED
 *    locked preview card — never the whole tab, only a card inside the page.
 *
 *  • ON (live): the LEARNING-WORLD GATEWAY. My World becomes the doorway into the
 *    interactive upskilling world. It shows a compact character/XP/streak
 *    snapshot, the three primary sections (Tracks · Portfolio · Guild), the SAME
 *    personal saved/notes blocks as the OFF branch, and a "More" grid.
 *
 * All personal data comes from careerData read methods and renders through
 * DataStateView, so empty / coming-soon / locked states are graceful and honest
 * — never mock rows. Data refreshes on focus and after every mutation.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  webContainer,
  CompassFonts,
} from "@/theme";
import { Feather } from "@expo/vector-icons";
import { DataStateView, LockedPill } from "@/components/careerIntelligence";
import { careerData, type GuidanceReportPath } from "@/lib/careerData";
import { openStudentDocument, shareTextSummary } from "@/lib/provisioningData";
import { LearningPlanShareSheet } from "@/components/careerIntelligence/LearningPlanShareSheet";
import { buildLearningPlanShareInputFromStacks, type LearningPlanShareCopy, type LearningPlanShareInput } from "@/lib/learningPlanShare";
import { exploreNav } from "@/lib/exploreNav";
import {
  type DataState,
  type SavedItem,
  type Note,
  type SavedEntityType,
  locked,
} from "@/types/career";
import { useAuth } from "@/hooks/useAuth";
import { withMyWorldLearningGate } from "@/lib/learningGate";
import { featureFlags } from "@/lib/featureFlags";
// Same source of truth as the shell nav: this screen names itself what the
// nav calls it, so "Saved" pre-launch and "My World" once the world is live.
import { WORLD_NAV } from "@/lib/worldNav";
import { xpEngine, type XPSnapshot } from "@/lib/XPEngine";
import { streakEngine, type StreakStatus } from "@/lib/StreakEngine";
import { PdfExportButton } from "@/components/careerIntelligence";

/** Human-friendly glyphs / labels per saved entity type. */
const ENTITY_META: Record<SavedEntityType, { icon: string; label: string }> = {
  resource: { icon: "🔗", label: "Resource" },
  programme: { icon: "🎓", label: "Programme" },
  school: { icon: "🏫", label: "School" },
  domain: { icon: "🧭", label: "Domain" },
  subgroup: { icon: "🧱", label: "Subgroup" },
  role: { icon: "💼", label: "Role" },
  comparison: { icon: "⚖️", label: "Comparison" },
  opportunity: { icon: "📌", label: "Opportunity" },
  organisation: { icon: "🏢", label: "Employer" },
  elite_pathway: { icon: "⭐", label: "Pathway" },
};

/** Plural section titles for the saved-items groups (order = display order). */
const SAVED_GROUP_ORDER: { type: SavedEntityType; title: string }[] = [
  { type: "programme", title: "Programmes" },
  { type: "school", title: "Schools" },
  { type: "domain", title: "Domains" },
  { type: "subgroup", title: "Subgroups" },
  { type: "role", title: "Roles" },
  { type: "comparison", title: "Comparisons" },
  { type: "opportunity", title: "Opportunities" },
  { type: "organisation", title: "Employers" },
  { type: "elite_pathway", title: "Pathways" },
  { type: "resource", title: "Saved learning" },
];

const UNCATEGORISED = "Uncategorised";

/** Read-model returned by the personal-data hook, plus a manual refetch. */
interface PersonalData {
  saved: DataState<SavedItem[]> | null;
  notes: DataState<Note[]> | null;
  refresh: () => void;
}

/** Shared hook: load the personal saved/notes envelopes; refetch on focus and
 *  on demand (after any mutation). Active-guarded so late responses are dropped. */
function usePersonalData(enabled = true): PersonalData {
  const [saved, setSaved] = useState<DataState<SavedItem[]> | null>(null);
  const [notes, setNotes] = useState<DataState<Note[]> | null>(null);

  const load = useCallback(async (isActive: () => boolean) => {
    const [savedState, notesState] = await Promise.all([
      careerData.getSavedItems(),
      careerData.getAllNotes(),
    ]);
    if (!isActive()) return;
    setSaved(savedState);
    setNotes(notesState);
  }, []);

  // Refetch every time the tab regains focus.
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        setSaved(
          locked<SavedItem[]>(
            "Create an account to save programmes, schools, domains, roles and notes.",
          ),
        );
        setNotes(
          locked<Note[]>(
            "Create an account to keep private notes across your career search.",
          ),
        );
        return;
      }
      let active = true;
      void load(() => active);
      return () => {
        active = false;
      };
    }, [enabled, load]),
  );

  // Imperative refetch used after mutations (fire-and-forget, always active).
  const refresh = useCallback(() => {
    if (enabled) void load(() => true);
  }, [enabled, load]);

  return { saved, notes, refresh };
}

/** The Saved domains & roles + My notes blocks — shared by both branches. */
function PersonalCareerBlocks({ saved, notes, refresh }: PersonalData) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState<Note | null>(null);

  return (
    <>
      {/* ── Saved domains & roles (grouped by entity type) ────────── */}
      <Text style={[styles.section, CompassFonts.bodyBold, { color: colors.textRole.secondary }]}>
        Saved domains & roles
      </Text>
      {saved ? (
        <DataStateView
          state={saved}
          empty={(items) => items.length === 0}
          emptyTitle="Nothing saved yet"
          emptyBody="Bookmark a domain or role from Explore and it shows up here."
        >
          {(items) => (
            <View style={styles.savedGroups}>
              {groupSavedByType(items).map((group) => (
                <View key={group.type} style={styles.savedGroup}>
                  <Text
                    style={[styles.groupLabel, CompassFonts.bodyBold, { color: colors.textRole.muted }]}
                  >
                    {group.title} · {group.items.length}
                  </Text>
                  <View style={styles.list}>
                    {group.items.map((item) => (
                      <SavedItemRow
                        key={item.id}
                        item={item}
                        onRemoved={refresh}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </DataStateView>
      ) : null}

      {/* ── My notes, filed into folders by category ──────────────── */}
      <Text style={[styles.section, CompassFonts.bodyBold, { color: colors.textRole.secondary }]}>My notes</Text>
      {notes ? (
        <DataStateView
          state={notes}
          empty={(rows) => rows.length === 0}
          emptyTitle="No notes yet"
          emptyBody="Jot thoughts on any domain or role and they'll file here by category."
        >
          {(rows) => (
            <View style={styles.noteGroups}>
              {groupNotesByCategory(rows).map((group) => (
                <NoteFolder
                  key={group.category}
                  category={group.category}
                  notes={group.notes}
                  onOpenNote={setEditing}
                />
              ))}
            </View>
          )}
        </DataStateView>
      ) : null}

      {/* ── Bottom-sheet note editor (body + category + delete) ────── */}
      <NoteEditorSheet
        note={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          refresh();
        }}
      />
    </>
  );
}

export default function MyWorldScreen() {
  const { user } = useAuth();
  if (!user || user.auth_provider === "guest") return <GuestMyWorldGate />;
  // Pre-launch the flag is OFF → personal page. Live → learning-world gateway.
  // The learning/game layer is disabled for the current release. My World
  // remains the saved-careers and notes space until it is deliberately enabled.
  return featureFlags.myWorldLive ? <LiveWorldHub /> : <PersonalPage />;
}

function GuestMyWorldGate() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={[styles.guestGate, { backgroundColor: colors.surface.base }]}>
      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>{WORLD_NAV.eyebrow}</Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Your private space</Text>
      <Text style={[styles.bannerText, { color: colors.textRole.secondary }, CompassFonts.body]}>
        Create an account to access saved paths, notes, progress, portfolio, guild and Feed.
      </Text>
      <TouchableOpacity onPress={() => router.push("/(auth)/signup" as any)} style={[styles.guestCta, { backgroundColor: colors.accentRole.action }]}>
        <Text style={[styles.guestCtaText, CompassFonts.bodyBold]}>Create account</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * OFF branch — the pre-launch personal page.
 * ──────────────────────────────────────────────────────────────────────────── */
function PersonalPage() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === "guest";
  const personal = usePersonalData(!isGuest);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>{WORLD_NAV.eyebrow}</Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Your saved careers,{"\n"}bookmarks & notes
      </Text>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.surface.subtle,
              borderColor: `${colors.accentRole.action}30`,
            },
          ]}
        >
          <Text style={[styles.bannerText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
            {"You\u2019re browsing as a guest. Create an account to save domains, roles, programmes, schools, comparisons and notes here."}
          </Text>
        </View>
      ) : null}

      <PersonalCareerBlocks {...personal} />
      <GuidanceReportCard />

      {/* ── LOCKED: Learning Tracks & Portfolio (single card) ─────── */}
    </ScrollView>
  );
}

/** The single locked preview card — interactive upskilling tracks +
 *  Portfolio live behind this and stay locked in this phase. */
function LockedTracksCard({ router }: { router: ReturnType<typeof useRouter> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.lockedCard,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <View style={styles.lockedHead}>
        <Text style={styles.lockedIcon}>🧭</Text>
        <View style={{ flex: 1 }}>
          <View style={styles.lockedHeadRow}>
            <Text style={[styles.lockedTitle, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>
              Skill Tracks & Portfolio
            </Text>
            <LockedPill />
          </View>
          <Text style={[styles.lockedBody, { color: colors.textRole.secondary }]}>
            Interactive upskilling for your domain — guided levels and a
            verifiable Portfolio of what you{"\u2019"}ve built — stays locked until the
            learning layer opens. Master
            your field, learn alongside your guild, and show employers your work.
          </Text>
        </View>
      </View>

      <View style={styles.lockedBullets}>
        {LOCKED_BULLETS.map((b) => (
          <View key={b.title} style={styles.lockedBullet}>
            <Text style={styles.lockedBulletIcon}>{b.icon}</Text>
            <Text style={[styles.lockedBulletText, { color: colors.textRole.secondary }]}>
              <Text style={[CompassFonts.bodyBold, { color: colors.textRole.primary }]}>
                {b.title}.{" "}
              </Text>
              {b.body}
            </Text>
          </View>
        ))}
      </View>

      {/* Secondary links to the live career-mapping areas. */}
      <View style={styles.lockedLinks}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/explore")}
          style={styles.linkBtn}
        >
          <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
            Explore programmes & roles →
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/(tabs)/explore")}
          style={styles.linkBtn}
        >
          <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
            Compare demand signals →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ON branch — the live learning-world gateway.
 * Wires navigation into the existing upskilling routes; logic is preserved.
 * ──────────────────────────────────────────────────────────────────────────── */

/** A primary section card (Tracks · Portfolio · Guild). */
function PrimaryCard({
  icon,
  title,
  body,
  accent,
  links,
}: {
  icon: string;
  title: string;
  body: string;
  accent: string;
  links: { label: string; href: Href }[];
}) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View
      style={[
        styles.primaryCard,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <View style={styles.primaryHead}>
        <View style={[styles.primaryIconWrap, { backgroundColor: `${accent}1A` }]}>
          <Text style={styles.primaryIcon}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.primaryTitle, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
            {title}
          </Text>
          <Text style={[styles.primaryBody, { color: colors.textRole.secondary }]}>
            {body}
          </Text>
        </View>
      </View>
      <View style={styles.primaryLinks}>
        {links.map((l) => (
          <TouchableOpacity
            key={l.label}
            activeOpacity={0.7}
            onPress={() => router.push(withMyWorldLearningGate(String(l.href)) as Href)}
            style={[styles.chip, { borderColor: `${accent}55` }]}
          >
            <Text style={[styles.chipText, CompassFonts.bodyBold, { color: accent }]}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function LiveWorldHub() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = user?.auth_provider === "guest";
  const personal = usePersonalData();

  const [xp, setXp] = useState<XPSnapshot | null>(null);
  const [streak, setStreak] = useState<StreakStatus | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [xpSnap, streakSnap] = await Promise.all([
        xpEngine.snapshot(),
        streakEngine.status(),
      ]);
      if (!active) return;
      setXp(xpSnap);
      setStreak(streakSnap);
    })();
    return () => {
      active = false;
    };
  }, []);

  const stageName = xp?.stage.name ?? "Raw Recruit";
  const stage = xp?.stage.stage ?? 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>{WORLD_NAV.eyebrow}</Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Welcome back —{"\n"}{"let\u2019s level up"}
      </Text>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.surface.subtle,
              borderColor: `${colors.accentRole.action}30`,
            },
          ]}
        >
          <Text style={[styles.bannerText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
            {"You\u2019re browsing as a guest. Create an account to keep your XP, streak and portfolio."}
          </Text>
        </View>
      ) : null}

      {/* ── Character / XP / streak snapshot → full profile ───────── */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/myworld/game-profile")}
        style={[
          styles.snapshot,
          { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
        ]}
      >
        <View style={styles.snapshotAvatar}>
          <Text style={styles.snapshotEmoji}>🧑‍💻</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.snapshotStage, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>
            {stageName}
          </Text>
          <View style={styles.snapshotStats}>
            <Text style={[styles.snapshotStat, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
              {xp?.totalXp ?? 0} XP
            </Text>
            <Text style={[styles.snapshotDot, { color: colors.textRole.muted }]}>
              ·
            </Text>
            <Text style={[styles.snapshotStat, CompassFonts.bodyBold, { color: colors.accentRole.warning }]}>
              {streak?.streak ?? 0}🔥
            </Text>
            <Text style={[styles.snapshotDot, { color: colors.textRole.muted }]}>
              ·
            </Text>
            <Text style={[styles.snapshotStat, CompassFonts.bodyBold, { color: colors.accentRole.status }]}>
              Stage {stage}/8
            </Text>
          </View>
        </View>
        <Text style={[styles.snapshotArrow, CompassFonts.bodyBold, { color: colors.textRole.muted }]}>›</Text>
      </TouchableOpacity>

      {/* ── Three primary live sections ──────────────────────────── */}
      {PRIMARY_SECTIONS.map((s) => (
        <PrimaryCard key={s.title} {...s} accent={resolveAccent(s.accent, colors)} />
      ))}

      {/* ── Personal career-mapping blocks (shared with OFF branch) ─ */}
      <PersonalCareerBlocks {...personal} />
      <GuidanceReportCard />

      {/* ── More: the rest of the learning world ─────────────────── */}
      <Text style={[styles.section, { color: colors.textRole.secondary }]}>More</Text>
      <View style={styles.moreGrid}>
        {MORE_LINKS.map((m) => (
          <TouchableOpacity
            key={m.label}
            activeOpacity={0.7}
            onPress={() => router.push(withMyWorldLearningGate(String(m.href)) as Href)}
            style={[
              styles.moreTile,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            <Text style={styles.moreIcon}>{m.icon}</Text>
            <Text
              style={[styles.moreLabel, { color: colors.textRole.primary }]}
              numberOfLines={2}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: Spacing.xxxl }} />
    </ScrollView>
  );
}

/**
 * The completed guidance report belongs in the student's personal workspace,
 * not only on Explore detail screens. It is intentionally hidden until the
 * saved path contains both a programme and university: an unfinished path is
 * resumable, but it is not presented as a finished report.
 */
function GuidanceReportCard() {
  const { colors } = useTheme();
  const router = useRouter();
  const [state, setState] = useState<DataState<GuidanceReportPath | null> | null>(null);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [shareSheetVisible, setShareSheetVisible] = useState(false);
  const [shareInput, setShareInput] = useState<LearningPlanShareInput>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setState(null);
      void careerData.getGuidancePath().then((next) => {
        if (active) setState(next);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const path = state?.status === "real" ? state.data?.path : null;
  if (!path) return null;

  const programme = path.programme;
  const university = path.university;
  const programmeName = typeof programme?.name === "string" ? programme.name : "your selected programme";
  const universityName = typeof university?.name === "string" ? university.name : "your selected university";
  const ready = Boolean(programme?.name && university?.name);
  const resumeInProgress = path.resume?.status === "in_progress";
  const savedSnapshots = (Array.isArray(path.learningPlanSnapshots) ? path.learningPlanSnapshots : [])
    .filter((entry): entry is Record<string, unknown> => Boolean(entry && typeof entry === "object" && typeof entry.snapshotId === "string"));
  const fallbackSnapshot = path.learningPlanSnapshot;
  const selectedSavedSnapshot = savedSnapshots.find((entry) => entry.snapshotId === selectedSnapshotId)
    ?? savedSnapshots[savedSnapshots.length - 1]
    ?? (fallbackSnapshot && typeof fallbackSnapshot === "object" ? fallbackSnapshot : null);
  const activeSnapshotId = typeof selectedSavedSnapshot?.snapshotId === "string" ? selectedSavedSnapshot.snapshotId : null;
  const learningPlanSnapshot = selectedSavedSnapshot;
  const savedReportContext = selectedSavedSnapshot?.reportPathContext
    && typeof selectedSavedSnapshot.reportPathContext === "object"
    ? selectedSavedSnapshot.reportPathContext as Record<string, unknown>
    : {};
  const learningPlanStacks = learningPlanSnapshot && Array.isArray(learningPlanSnapshot.stacks)
    ? learningPlanSnapshot.stacks
    : [];
  const learningPlanItemCount = learningPlanStacks.reduce((total, stack) => (
    total + (stack && typeof stack === "object" && Array.isArray((stack as { selectedIds?: unknown[] }).selectedIds)
      ? (stack as { selectedIds: unknown[] }).selectedIds.length
      : 0)
  ), 0);
  const learningPlanRouteSummaries = learningPlanStacks.map((stack, index) => {
    const record = stack && typeof stack === "object" ? stack as {
      route?: Record<string, unknown>;
      selectedIds?: unknown[];
      order?: unknown[];
      removedIds?: unknown[];
    } : {};
    const route = record.route ?? {};
    const findName = (entries: Record<string, unknown>[] | undefined, id: unknown) => {
      if (!Array.isArray(entries) || !id) return undefined;
      const match = entries.find((entry) => String(entry.id ?? "") === String(id));
      return typeof match?.name === "string" ? match.name : undefined;
    };
    const domainName = findName(
      Array.isArray(savedReportContext.domains) ? savedReportContext.domains as Record<string, unknown>[] : path.domains,
      route.domainId,
    );
    const areaName = findName(
      Array.isArray(savedReportContext.subgroups) ? savedReportContext.subgroups as Record<string, unknown>[] : path.subgroups,
      route.areaId,
    );
    const roleName = findName(
      Array.isArray(savedReportContext.roles) ? savedReportContext.roles as Record<string, unknown>[] : path.roles,
      route.roleId,
    );
    const savedProgramme = savedReportContext.programme && typeof savedReportContext.programme === "object"
      ? savedReportContext.programme as Record<string, unknown>
      : null;
    const savedProgrammeName = typeof savedProgramme?.name === "string" ? savedProgramme.name : programmeName;
    const routeLabel = [
      typeof savedProgrammeName === "string" ? savedProgrammeName : undefined,
      domainName ?? (typeof route.domainId === "string" ? route.domainId : undefined),
      areaName ?? (typeof route.areaId === "string" ? route.areaId : undefined),
      roleName ?? (typeof route.roleId === "string" ? route.roleId : undefined),
    ].filter(Boolean).join(" · ") || `Saved route ${index + 1}`;
    return {
      key: `${String(route.domainId ?? "route")}-${String(route.areaId ?? "all")}-${String(route.roleId ?? "all")}-${index}`,
      label: routeLabel,
      selected: Array.isArray(record.selectedIds) ? record.selectedIds.length : 0,
      ordered: Array.isArray(record.order) ? record.order.length : 0,
      removed: Array.isArray(record.removedIds) ? record.removedIds.length : 0,
    };
  });
  const savedReportProgramme = savedReportContext.programme && typeof savedReportContext.programme === "object"
    ? savedReportContext.programme as Record<string, unknown>
    : programme;
  const savedReportUniversity = savedReportContext.university && typeof savedReportContext.university === "object"
    ? savedReportContext.university as Record<string, unknown>
    : university;
  const savedProgrammeId = typeof savedReportProgramme?.jambProgrammeId === "string"
    ? savedReportProgramme.jambProgrammeId
    : typeof savedReportProgramme?.jamb_programme_id === "string"
      ? savedReportProgramme.jamb_programme_id
      : typeof savedReportProgramme?.id === "string" ? savedReportProgramme.id : "";
  const savedUniversityId = typeof savedReportUniversity?.id === "string" ? savedReportUniversity.id : "";
  const editLearningPlan = () => {
    const params = [
      "guided=1",
      "focus=guidance",
      ...(savedProgrammeId ? [`jamb_programme_id=${encodeURIComponent(savedProgrammeId)}`] : []),
      ...(savedUniversityId ? [`school_id=${encodeURIComponent(savedUniversityId)}`] : []),
      ...(activeSnapshotId ? [`snapshot_id=${encodeURIComponent(activeSnapshotId)}`] : []),
    ];
    router.push(`/(tabs)/explore/pathways?${params.join("&")}` as never);
  };

  const openLearningPlanShare = () => {
    const shareStacks = learningPlanStacks.map((stack, index) => {
      const record = stack && typeof stack === "object" ? stack as {
        selectedIds?: unknown[];
        itemSummaries?: Array<{ id?: unknown; name?: unknown }>;
      } : {};
      return {
        routeLabel: learningPlanRouteSummaries[index]?.label,
        selectedIds: record.selectedIds,
        itemSummaries: record.itemSummaries,
      };
    });
    const fallbackRoute = [
      programmeName,
      ...(path.domains ?? []).map((domain) => typeof domain.name === "string" ? domain.name : ""),
    ].filter(Boolean).join(" / ");
    setShareInput(buildLearningPlanShareInputFromStacks(shareStacks, fallbackRoute));
    setShareNotice(null);
    setShareSheetVisible(true);
  };

  const shareSelectedCopy = (copy: LearningPlanShareCopy) => {
    setShareSheetVisible(false);
    void shareTextSummary(copy.title, copy.message).then((shared) => {
      setShareNotice(shared
        ? "Your private details were left out. Choose an available sharing option to continue."
        : "Sharing is unavailable right now. You can copy the message instead.");
    });
  };

  const copySelectedShareCopy = (copy: LearningPlanShareCopy) => {
    setShareSheetVisible(false);
    void Clipboard.setStringAsync(copy.message).then(() => {
      setShareNotice("Platform-specific message copied. Paste it into your social post or email.");
    }).catch(() => {
      setShareNotice("Could not copy the message. Reopen share options to try again.");
    });
  };

  const confirmDeleteSnapshot = (snapshotId: string) => {
    Alert.alert("Delete saved version?", "This removes this version from your My World archive. It will not change your other saved versions.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete version", style: "destructive", onPress: () => {
        void careerData.deleteGuidanceSnapshot(snapshotId).then((result) => {
          if (result.status === "real") {
            setState(result);
            if (selectedSnapshotId === snapshotId) setSelectedSnapshotId(null);
            setShareNotice("Saved version deleted.");
          } else {
            setDownloadNotice("This saved version could not be deleted. Try again when you are online.");
          }
        });
      } },
    ]);
  };

  const downloadEditableCopy = async () => {
    setDownloadNotice(null);
    const reportPath = `/api/student/report.docx${activeSnapshotId ? `?snapshot_id=${encodeURIComponent(activeSnapshotId)}` : ""}`;
    const opened = await openStudentDocument(reportPath, {
      download: "sifter-guidance-report.docx",
    });
    if (!opened) setDownloadNotice("The editable copy is unavailable right now. Try again when you are online.");
  };

  return (
    <View style={[styles.reportCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.reportEyebrow, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>YOUR GUIDANCE REPORT</Text>
      <Text style={[styles.reportTitle, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>Keep your guidance together</Text>
      <Text style={[styles.reportBody, CompassFonts.body, { color: colors.textRole.secondary }]}>
        {ready
          ? `Your saved route connects ${programmeName} with ${universityName}. Open the report when you are ready to print, save or share it.`
          : resumeInProgress
            ? "Your choices are saved, but the report is not ready until you select both a programme and a university."
            : "Your saved guidance is not complete enough to create a report yet."}
      </Text>
      {learningPlanStacks.length ? <View style={[styles.reportPlanSummary, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.reportPlanTitle, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>Focused learning plan saved</Text>
        <Text style={[styles.reportPlanBody, CompassFonts.body, { color: colors.textRole.secondary }]}>
          {learningPlanStacks.length} route{learningPlanStacks.length === 1 ? "" : "s"} · {learningPlanItemCount} selected learning item{learningPlanItemCount === 1 ? "" : "s"}. Routes remain separate in the report.
        </Text>
        {savedSnapshots.length > 0 ? <View style={styles.reportRouteList} accessibilityLabel="Saved learning plan versions">
          <Text style={[styles.reportRouteLabel, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>Saved versions</Text>
          {savedSnapshots.map((snapshot, index) => {
            const createdAt = typeof snapshot.createdAt === "string" ? new Date(snapshot.createdAt) : null;
            const dateLabel = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString() : `Saved version ${index + 1}`;
            const isSelected = snapshot.snapshotId === activeSnapshotId;
            return <View key={String(snapshot.snapshotId)} style={[styles.reportRouteRow, { borderColor: isSelected ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: isSelected ? colors.surface.raised : "transparent" }]}>
              <TouchableOpacity onPress={() => setSelectedSnapshotId(String(snapshot.snapshotId))}
                accessibilityRole="button" accessibilityState={{ selected: isSelected }} style={styles.savedVersionSelect}>
                <Text style={[styles.reportRouteLabel, CompassFonts.bodyBold, { color: isSelected ? colors.accentRole.action : colors.textRole.primary }]}>{dateLabel}</Text>
                <Text style={[styles.reportRouteMeta, CompassFonts.body, { color: colors.textRole.muted }]}>{isSelected ? "Selected for preview and export" : "Tap to preview and export"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDeleteSnapshot(String(snapshot.snapshotId))}
                accessibilityRole="button" accessibilityLabel={`Delete saved version ${dateLabel}`} style={styles.deleteVersionButton}>
                <Feather name="trash-2" size={16} color={colors.textRole.muted} />
              </TouchableOpacity>
            </View>;
          })}
        </View> : null}
        <View style={styles.reportRouteList} accessibilityLabel="Saved learning plan route stacks">
          {learningPlanRouteSummaries.map((summary) => <View key={summary.key} style={[styles.reportRouteRow, { borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.reportRouteLabel, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>{summary.label}</Text>
            <Text style={[styles.reportRouteMeta, CompassFonts.body, { color: colors.textRole.muted }]}>
              {summary.selected} selected · {summary.ordered} ordered{summary.removed ? ` · ${summary.removed} not included in this route` : ""}
            </Text>
          </View>)}
        </View>
        <TouchableOpacity onPress={editLearningPlan} style={[styles.reportPlanEdit, { borderColor: colors.borderRole.subtle }]} accessibilityRole="button" accessibilityLabel="Edit saved learning plan">
          <Text style={[styles.reportLinkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>Open this version as an editable copy</Text>
        </TouchableOpacity>
      </View> : null}
      {ready ? (
        <View style={styles.reportActions}>
          <PdfExportButton title="Print / save report" documentPath={`/api/student/report.html${activeSnapshotId ? `?snapshot_id=${encodeURIComponent(activeSnapshotId)}` : ""}`} />
          <TouchableOpacity onPress={openLearningPlanShare} style={[styles.reportLink, { borderColor: colors.borderRole.subtle }]} accessibilityRole="button" accessibilityLabel="Share learning plan summary">
            <Text style={[styles.reportLinkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>Share summary</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { void downloadEditableCopy(); }} style={[styles.reportLink, { borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.reportLinkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>Download editable copy</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => router.push("/(tabs)/explore/admission" as never)} style={[styles.reportLink, { borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.reportLinkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>Continue</Text>
        </TouchableOpacity>
      )}
      {downloadNotice ? <Text style={[styles.reportNotice, CompassFonts.body, { color: colors.textRole.muted }]}>{downloadNotice}</Text> : null}
      {shareNotice ? <Text style={[styles.reportNotice, CompassFonts.body, { color: colors.textRole.muted }]}>{shareNotice}</Text> : null}
      <LearningPlanShareSheet
        visible={shareSheetVisible}
        input={shareInput}
        onClose={() => setShareSheetVisible(false)}
        onShare={shareSelectedCopy}
        onCopy={copySelectedShareCopy}
      />
    </View>
  );
}

/** Accent key → theme colour (kept data-driven so sections stay declarative). */
function resolveAccent(
  key: "accent" | "green" | "gold",
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  if (key === "accent") return colors.accentRole.action;
  if (key === "green") return colors.accentRole.success;
  return colors.accentRole.status;
}

const PRIMARY_SECTIONS: {
  icon: string;
  title: string;
  body: string;
  accent: "accent" | "green" | "gold";
  links: { label: string; href: Href }[];
}[] = [
  {
    icon: "🗺️",
    title: "Tracks",
    body: "Your upskilling world — islands, fields and levels. Master your domain step by step.",
    accent: "accent",
    links: [
      { label: "Map", href: "/(tabs)/map" },
      { label: "Fields", href: "/(tabs)/fields" },
      { label: "World", href: "/world" },
      { label: "Skills", href: "/(tabs)/skills" },
    ],
  },
  {
    icon: "📁",
    title: "Portfolio",
    body: "Verifiable proof of what you've built — artifacts, linked platforms and XP for employers.",
    accent: "green",
    links: [
      { label: "Portfolio", href: "/(tabs)/portfolio" },
      { label: "Hub", href: "/(tabs)/portfolio/hub" },
      { label: "GitHub sync", href: "/(tabs)/profile/github" },
    ],
  },
  {
    icon: "👥",
    title: "Guild",
    body: "Learn alongside your guild — group progress, rankings and community chat.",
    accent: "gold",
    links: [
      { label: "Guild", href: "/(tabs)/guild" },
      { label: "Community", href: "/(tabs)/guild" },
      { label: "Leaderboard", href: "/(tabs)/guild" },
      { label: "Feed", href: "/(tabs)/feed" },
    ],
  },
];

const MORE_LINKS: { icon: string; label: string; href: Href }[] = [
  { icon: "🧠", label: "Skills directory", href: "/(tabs)/skills" },
  { icon: "🎤", label: "Interview mode", href: "/(tabs)/skills/interview" },
  { icon: "🛍️", label: "Merchandise", href: "/merchandise" },
  { icon: "🎁", label: "Referral", href: "/(tabs)/referral" },
  { icon: "📓", label: "Diary", href: "/(tabs)/profile/diary" },
  { icon: "🔥", label: "Streaks", href: "/(tabs)/streaks" },
  { icon: "🐙", label: "GitHub sync", href: "/(tabs)/profile/github" },
  { icon: "⬇️", label: "Downloads", href: "/(tabs)/portfolio" },
];

const LOCKED_BULLETS: { icon: string; title: string; body: string }[] = [
  {
    icon: "🎯",
    title: "Domain Knowledge Track",
    body: "Master your field from the ground up.",
  },
  {
    icon: "🕹️",
    title: "Guided levels",
    body: "Interactive, step-by-step progress through real career skills.",
  },
  {
    icon: "📁",
    title: "Portfolio",
    body: "Verifiable completion records to show employers.",
  },
];

/** Group saved items by entity type, in a stable display order. Empty groups
 *  are dropped so the list only shows types the user actually has. */
function groupSavedByType(
  items: SavedItem[],
): { type: SavedEntityType; title: string; items: SavedItem[] }[] {
  return SAVED_GROUP_ORDER.map(({ type, title }) => ({
    type,
    title,
    items: items.filter((i) => i.entityType === type),
  })).filter((g) => g.items.length > 0);
}

/** Group notes by their `category`; ungrouped notes fall under "Uncategorised".
 *  Categories are sorted alphabetically with "Uncategorised" always last so the
 *  list reads predictably; notes inside a group keep their incoming order. */
function groupNotesByCategory(
  rows: Note[],
): { category: string; notes: Note[] }[] {
  const buckets = new Map<string, Note[]>();
  for (const note of rows) {
    const key = note.category?.trim() || UNCATEGORISED;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(note);
    else buckets.set(key, [note]);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => {
      if (a === UNCATEGORISED) return 1;
      if (b === UNCATEGORISED) return -1;
      return a.localeCompare(b);
    })
    .map(([category, notes]) => ({ category, notes }));
}

/** A single saved/bookmarked entity row — taps into Explore, with a remove ✕. */
function SavedItemRow({
  item,
  onRemoved,
}: {
  item: SavedItem;
  onRemoved: () => void;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [removeNotice, setRemoveNotice] = useState<string | null>(null);
  const meta = ENTITY_META[item.entityType];

  const open = () => {
    if (item.entityType === "domain") exploreNav.domain(router, item.entityId);
    else if (item.entityType === "role") exploreNav.role(router, item.entityId);
    else if (item.entityType === "programme")
      exploreNav.programme(router, item.entityId);
    else if (item.entityType === "elite_pathway")
      exploreNav.elitePathway(router, item.entityId);
    else if (item.entityType === "school")
      router.push("/(tabs)/explore/admission" as never);
    else if (item.entityType === "subgroup")
      exploreNav.subgroupDirect(router, item.entityId);
    else if (item.entityType === "resource")
      void Linking.openURL(item.entityId).catch(() => {});
    // comparison / opportunity / organisation have no live detail route yet.
  };

  const remove = async () => {
    if (removing) return;
    setRemoving(true);
    setRemoveNotice(null);
    try {
      const result = await careerData.removeSavedItem(item.id);
      if (result.status === "real") onRemoved();
      else setRemoveNotice(result.meta?.notice ?? "This item could not be removed yet.");
    } catch {
      setRemoveNotice("This item could not be removed yet. Try again.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
        removing && { opacity: 0.5 },
      ]}
    >
      {removeNotice ? <Text style={[styles.removeNotice, { color: colors.textRole.muted }]}>{removeNotice}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={open}
        style={styles.rowMain}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.label ?? meta.label}`}
      >
        <Text style={styles.rowIcon}>{meta.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.rowTitle, { color: colors.textRole.primary }]}
            numberOfLines={1}
          >
            {item.label ?? item.entityId}
          </Text>
          <View style={[styles.typeChip, { backgroundColor: colors.surface.subtle }]}>
            <Text style={[styles.typeChipText, { color: colors.textRole.muted }]}>
              {meta.label}
            </Text>
          </View>
          <View style={styles.selectedRow}>
            <Feather name="check-circle" size={13} color={colors.accentRole.action} />
            <Text style={[styles.selectedText, { color: colors.accentRole.action }]}>Selected in Saved</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={remove}
        disabled={removing}
        style={styles.removeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.label ?? meta.label}`}
      >
        <Text style={[styles.removeIcon, { color: colors.textRole.muted }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

/** A collapsible category folder holding a set of notes. */
function NoteFolder({
  category,
  notes,
  onOpenNote,
}: {
  category: string;
  notes: Note[];
  onOpenNote: (note: Note) => void;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.noteGroup}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen((v) => !v)}
        style={styles.folderHeader}
        accessibilityRole="button"
        accessibilityLabel={`${category} folder, ${notes.length} notes`}
      >
        <Text style={[styles.folderChevron, { color: colors.textRole.muted }]}>
          {open ? "▾" : "▸"}
        </Text>
        <Text style={styles.folderIcon}>{open ? "📂" : "📁"}</Text>
        <Text style={[styles.folderName, { color: colors.textRole.primary }]} numberOfLines={1}>
          {category}
        </Text>
        <Text style={[styles.folderCount, { color: colors.textRole.muted }]}>
          {notes.length}
        </Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.folderNotes}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onPress={() => onOpenNote(note)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** A single note card within a category folder — tap to edit. */
function NoteCard({ note, onPress }: { note: Note; onPress: () => void }) {
  const { colors } = useTheme();
  const label = note.entityLabel ?? ENTITY_META[note.entityType].label;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.noteCard,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Edit note on ${label}`}
    >
      <View style={styles.noteHead}>
        <Text style={[styles.noteEntity, { color: colors.textRole.muted }]} numberOfLines={1}>
          {ENTITY_META[note.entityType].icon} {label}
        </Text>
        <Text style={[styles.noteTime, { color: colors.textRole.muted }]}>
          {formatWhen(note.updatedAt)}
        </Text>
      </View>
      <Text style={[styles.noteBody, { color: colors.textRole.primary }]} numberOfLines={2}>
        {note.body}
      </Text>
    </TouchableOpacity>
  );
}

/** Bottom-sheet editor for a note: edit body + category, or delete. Presented
 *  when `note` is non-null. All writes go through careerData then refetch. */
function NoteEditorSheet({
  note,
  onClose,
  onSaved,
}: {
  note: Note | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { colors } = useTheme();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Hydrate the fields whenever a new note is opened.
  useEffect(() => {
    setBody(note?.body ?? "");
    setCategory(note?.category ?? "");
    setNotice(null);
  }, [note]);

  const visible = note !== null;

  const save = async () => {
    if (!note || busy) return;
    const trimmedBody = body.trim();
    if (trimmedBody.length === 0) {
      setNotice("A note can't be empty.");
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const result = await careerData.updateNote(
        note.id,
        trimmedBody,
        category.trim() || undefined,
      );
      if (result.status === "real") {
        onSaved();
      } else {
        setNotice(result.meta?.notice ?? "Couldn't save right now — try again.");
      }
    } catch {
      setNotice("Couldn't save right now — try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!note || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const result = await careerData.deleteNote(note.id);
      if (result.status === "real" || result.status === "coming_soon") {
        // A successful delete returns `real`; a failed request degrades to
        // coming_soon. Either way we refetch so the list reflects the truth.
        onSaved();
      } else {
        setNotice(result.meta?.notice ?? "Couldn't delete right now — try again.");
      }
    } catch {
      setNotice("Couldn't delete right now — try again.");
    } finally {
      setBusy(false);
    }
  };

  const label = note?.entityLabel ?? (note ? ENTITY_META[note.entityType].label : "");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.sheetBackdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
        accessibilityLabel="Close editor"
      >
        {/* Stop taps inside the sheet from closing it. */}
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
          ]}
          onPress={() => {}}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.borderRole.subtle }]} />

          <Text style={[styles.sheetTitle, { color: colors.textRole.primary }]}>Edit note</Text>
          {label ? (
            <Text style={[styles.sheetSubtitle, { color: colors.textRole.muted }]}>
              {note ? ENTITY_META[note.entityType].icon : ""} {label}
            </Text>
          ) : null}

          <Text style={[styles.fieldLabel, { color: colors.textRole.secondary }]}>Note</Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle },
            ]}
          >
            <TextInput
              style={[styles.bodyInput, { color: colors.textRole.primary }]}
              value={body}
              onChangeText={setBody}
              placeholder="Jot a thought…"
              placeholderTextColor={colors.textRole.muted}
              multiline
              textAlignVertical="top"
              editable={!busy}
            />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textRole.secondary }]}>
            Folder / category
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle },
            ]}
          >
            <TextInput
              style={[styles.categoryInput, { color: colors.textRole.primary }]}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Admissions, To research (blank = Uncategorised)"
              placeholderTextColor={colors.textRole.muted}
              editable={!busy}
              returnKeyType="done"
            />
          </View>

          {notice ? (
            <Text style={[styles.sheetNotice, { color: colors.accentRole.danger }]}>{notice}</Text>
          ) : null}

          <View style={styles.sheetActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={remove}
              disabled={busy}
              style={[styles.sheetDeleteBtn, { borderColor: colors.borderRole.subtle }]}
              accessibilityRole="button"
              accessibilityLabel="Delete note"
            >
              <Text style={[styles.sheetDeleteText, { color: colors.accentRole.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={save}
              disabled={busy}
              style={[
                styles.sheetSaveBtn,
                { backgroundColor: colors.accentRole.action, opacity: busy ? 0.5 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save note"
            >
              <Text style={[styles.sheetSaveText, { color: colors.textRole.inverse }]}>
                {busy ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Compact relative "when" label for a note's updated time. */
function formatWhen(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const diffMs = Date.now() - t;
  const day = 86_400_000;
  if (diffMs < day) return "today";
  if (diffMs < 2 * day) return "yesterday";
  const days = Math.floor(diffMs / day);
  if (days < 7) return `${days}d ago`;
  return new Date(t).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  guestGate: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
    justifyContent: "center",
  },
  guestCta: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  guestCtaText: { color: "#fff", fontSize: FontSize.sm },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.15,
  },
  banner: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  bannerText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  reportCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  reportEyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 1.1,
  },
  reportTitle: {
    fontSize: FontSize.lg,
  },
  reportBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
  },
  reportPlanSummary: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  reportPlanTitle: {
    fontSize: FontSize.sm,
  },
  reportPlanBody: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
  reportRouteList: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  reportRouteRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 2,
  },
  reportRouteLabel: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.35,
  },
  reportRouteMeta: {
    fontSize: 10,
    lineHeight: 13,
  },
  reportPlanEdit: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  reportActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  reportLink: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  reportLinkText: {
    fontSize: FontSize.xs,
  },
  reportNotice: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
  },
  section: {
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    textTransform: "uppercase",
  },
  list: { gap: Spacing.sm },

  // ── Saved: groups + rows ────────────────────────────────────
  savedGroups: { gap: Spacing.lg },
  savedGroup: { gap: Spacing.sm },
  groupLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 44,
    flexWrap: "wrap",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 44,
  },
  rowIcon: { fontSize: 22 },
  rowTitle: { fontSize: FontSize.md },
  typeChip: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
    marginTop: 3,
  },
  typeChipText: {
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  savedVersionSelect: { flex: 1, minHeight: 40, justifyContent: "center", gap: 2 },
  deleteVersionButton: { minWidth: 40, minHeight: 40, alignItems: "center", justifyContent: "center" },
  selectedRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  selectedText: { fontSize: FontSize.xs, fontWeight: "700" },
  removeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
  },
  removeIcon: { fontSize: FontSize.lg },
  removeNotice: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4, flexBasis: "100%" as const, marginTop: Spacing.xs },

  // ── Notes: folders + cards ──────────────────────────────────
  noteGroups: { gap: Spacing.md },
  noteGroup: { gap: Spacing.sm },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 44,
  },
  folderChevron: { fontSize: FontSize.md, width: 14 },
  folderIcon: { fontSize: 16 },
  folderName: {
    flex: 1,
    fontSize: FontSize.md,
  },
  folderCount: {
    fontSize: FontSize.xs,
  },
  folderNotes: { gap: Spacing.sm, paddingLeft: Spacing.lg },
  noteCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 3,
    minHeight: 44,
  },
  noteHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  noteEntity: { flex: 1, fontSize: FontSize.xs },
  noteTime: { fontSize: FontSize.xs },
  noteBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },

  // ── Note editor bottom-sheet ────────────────────────────────
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  sheetTitle: { fontSize: FontSize.xl },
  sheetSubtitle: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: Spacing.xs,
  },
  inputWrap: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  bodyInput: { minHeight: 96, paddingVertical: 11, fontSize: FontSize.md },
  categoryInput: { minHeight: 44, paddingVertical: 11, fontSize: FontSize.md },
  sheetNotice: {
    fontSize: FontSize.sm,
  },
  sheetActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetDeleteBtn: {
    minHeight: 44,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetDeleteText: { fontSize: FontSize.md },
  sheetSaveBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetSaveText: { fontSize: FontSize.md },

  // ── Live hub: snapshot ──────────────────────────────────────
  snapshot: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 44,
  },
  snapshotAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotEmoji: { fontSize: 30 },
  snapshotStage: { fontSize: FontSize.md },
  snapshotStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: 3,
  },
  snapshotStat: { fontSize: FontSize.sm },
  snapshotDot: { fontSize: FontSize.sm },
  snapshotArrow: { fontSize: FontSize.xxl },

  // ── Live hub: primary cards ─────────────────────────────────
  primaryCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  primaryHead: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  primaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryIcon: { fontSize: 24 },
  primaryTitle: { fontSize: FontSize.lg },
  primaryBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 3,
  },
  primaryLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: FontSize.sm },

  // ── Live hub: more grid ─────────────────────────────────────
  moreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  moreTile: {
    width: "31%",
    flexGrow: 1,
    minHeight: 80,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  moreIcon: { fontSize: 24 },
  moreLabel: {
    fontSize: FontSize.xs,
    textAlign: "center",
  },

  // ── OFF branch: locked card ─────────────────────────────────
  lockedCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  lockedHead: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  lockedIcon: { fontSize: 28 },
  lockedHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  lockedTitle: { fontSize: FontSize.lg },
  lockedBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 4,
  },
  lockedBullets: { gap: Spacing.sm },
  lockedBullet: { flexDirection: "row", gap: Spacing.sm, alignItems: "flex-start" },
  lockedBulletIcon: { fontSize: 16 },
  lockedBulletText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  lockedLinks: { gap: Spacing.xs },
  linkBtn: {
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: { fontSize: FontSize.sm },
});
