/**
 * MyWorldScreen — the student's My World tab.
 *
 * Two faces, gated by a single feature flag (`featureFlags.myWorldLive`):
 *
 *  • OFF (pre-launch): the PERSONAL PAGE (career-mapping hub). It surfaces the
 *    things tied to the discipline → domain/role mapping that the user has
 *    personally collected — saved domains & roles, and personal notes grouped by
 *    category — plus a single LOCKED "Learning Tracks & Portfolio" card. The
 *    gamified learning world is never the whole tab, only a card inside the page.
 *
 *  • ON (live): the LEARNING-WORLD GATEWAY. My World becomes the doorway into the
 *    existing learning game (the game logic is preserved — this only wires
 *    navigation + restyle). It shows a compact character/XP/streak snapshot, the
 *    three primary sections (Tracks · Portfolio · Guild), the SAME personal
 *    saved/notes blocks as the OFF branch, and a "More" grid for everything else.
 *
 * All personal data comes from careerData read methods, which currently return
 * `coming_soon` envelopes; every data block renders through DataStateView so the
 * empty/coming-soon states are graceful and honest — never mock rows.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, type Href } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  webContainer,
} from "../theme";
import { DataStateView, LockedPill } from "../components/careerIntelligence";
import { careerData } from "../lib/careerData";
import {
  type DataState,
  type SavedItem,
  type Note,
  type SavedEntityType,
} from "../types/career";
import { useAuth } from "../hooks/useAuth";
import { featureFlags } from "../lib/featureFlags";
import { xpEngine, type XPSnapshot } from "../lib/XPEngine";
import { streakEngine, type StreakStatus } from "../lib/StreakEngine";

/** Human-friendly glyphs / labels per saved entity type. */
const ENTITY_META: Record<SavedEntityType, { icon: string; label: string }> = {
  programme: { icon: "🎓", label: "Programme" },
  domain: { icon: "🧭", label: "Domain" },
  role: { icon: "💼", label: "Role" },
  opportunity: { icon: "📌", label: "Opportunity" },
  organisation: { icon: "🏢", label: "Employer" },
  elite_pathway: { icon: "⭐", label: "Pathway" },
};

const UNCATEGORISED = "Uncategorised";

/** Shared hook: load the personal saved/notes envelopes once, active-guarded. */
function usePersonalData() {
  const [saved, setSaved] = useState<DataState<SavedItem[]> | null>(null);
  const [notes, setNotes] = useState<DataState<Note[]> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [savedState, notesState] = await Promise.all([
        careerData.getSavedItems(),
        careerData.getAllNotes(),
      ]);
      if (!active) return;
      setSaved(savedState);
      setNotes(notesState);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { saved, notes };
}

/** The Saved domains & roles + My notes blocks — shared by both branches. */
function PersonalCareerBlocks({
  saved,
  notes,
}: {
  saved: DataState<SavedItem[]> | null;
  notes: DataState<Note[]> | null;
}) {
  const { colors } = useTheme();
  return (
    <>
      {/* ── Saved domains & roles (and any other bookmarks) ───────── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>
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
            <View style={styles.list}>
              {items.map((item) => (
                <SavedItemRow key={item.id} item={item} />
              ))}
            </View>
          )}
        </DataStateView>
      ) : null}

      {/* ── My notes, grouped by category ─────────────────────────── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>My notes</Text>
      {notes ? (
        <DataStateView
          state={notes}
          empty={(rows) => rows.length === 0}
          emptyTitle="No notes yet"
          emptyBody="Notes you write on a domain or role appear here, grouped by category."
        >
          {(rows) => (
            <View style={styles.noteGroups}>
              {groupNotesByCategory(rows).map((group) => (
                <View key={group.category} style={styles.noteGroup}>
                  <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
                    {group.category.toUpperCase()}
                  </Text>
                  {group.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </View>
              ))}
            </View>
          )}
        </DataStateView>
      ) : null}
    </>
  );
}

export default function MyWorldScreen() {
  // Pre-launch the flag is OFF → personal page. Live → learning-world gateway.
  return featureFlags.myWorldLive ? <LiveWorldHub /> : <PersonalPage />;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * OFF branch — the pre-launch personal page (unchanged behaviour).
 * ──────────────────────────────────────────────────────────────────────────── */
function PersonalPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = user?.auth_provider === "guest";
  const { saved, notes } = usePersonalData();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>MY WORLD</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Your saved careers,{"\n"}bookmarks & notes
      </Text>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.goldSoft,
              borderColor: `${Brand.primary}40`,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: Brand.primaryDeep }]}>
            You're browsing as a guest. Create an account to save domains, roles
            and notes here.
          </Text>
        </View>
      ) : null}

      <PersonalCareerBlocks saved={saved} notes={notes} />

      {/* ── LOCKED: Learning Tracks & Portfolio (single card) ─────── */}
      <View
        style={[
          styles.lockedCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.lockedHead}>
          <Text style={styles.lockedIcon}>🎮</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.lockedHeadRow}>
              <Text style={[styles.lockedTitle, { color: colors.text }]}>
                Learning Tracks & Portfolio
              </Text>
              <LockedPill />
            </View>
            <Text style={[styles.lockedBody, { color: colors.textSoft }]}>
              The gamified tracks for your domain — levels, XP and a verifiable
              Portfolio of what you've built — are coming soon. Master your
              field, learn alongside your guild, and show employers your work.
            </Text>
          </View>
        </View>

        <View style={styles.lockedBullets}>
          {LOCKED_BULLETS.map((b) => (
            <View key={b.title} style={styles.lockedBullet}>
              <Text style={styles.lockedBulletIcon}>{b.icon}</Text>
              <Text style={[styles.lockedBulletText, { color: colors.textSoft }]}>
                <Text style={{ fontWeight: "800", color: colors.text }}>
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
            <Text style={[styles.linkText, { color: Brand.primaryDeep }]}>
              Explore programmes & roles →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/opportunities")}
            style={styles.linkBtn}
          >
            <Text style={[styles.linkText, { color: Brand.primaryDeep }]}>
              See opportunities →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ON branch — the live learning-world gateway.
 * Wires navigation into the existing game routes; logic is preserved elsewhere.
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
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.primaryHead}>
        <View style={[styles.primaryIconWrap, { backgroundColor: `${accent}1A` }]}>
          <Text style={styles.primaryIcon}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.primaryTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.primaryBody, { color: colors.textSoft }]}>
            {body}
          </Text>
        </View>
      </View>
      <View style={styles.primaryLinks}>
        {links.map((l) => (
          <TouchableOpacity
            key={l.label}
            activeOpacity={0.7}
            onPress={() => router.push(l.href)}
            style={[styles.chip, { borderColor: `${accent}55` }]}
          >
            <Text style={[styles.chipText, { color: accent }]}>{l.label}</Text>
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
  const { saved, notes } = usePersonalData();

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
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>MY WORLD</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Welcome back —{"\n"}let's level up
      </Text>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.goldSoft,
              borderColor: `${Brand.primary}40`,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: Brand.primaryDeep }]}>
            You're browsing as a guest. Create an account to keep your XP, streak
            and portfolio.
          </Text>
        </View>
      ) : null}

      {/* ── Character / XP / streak snapshot → full game profile ──── */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push("/(tabs)/myworld/game-profile")}
        style={[
          styles.snapshot,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.snapshotAvatar}>
          <Text style={styles.snapshotEmoji}>🧑‍💻</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.snapshotStage, { color: colors.text }]}>
            {stageName}
          </Text>
          <View style={styles.snapshotStats}>
            <Text style={[styles.snapshotStat, { color: colors.accent }]}>
              {xp?.totalXp ?? 0} XP
            </Text>
            <Text style={[styles.snapshotDot, { color: colors.textMuted }]}>
              ·
            </Text>
            <Text style={[styles.snapshotStat, { color: colors.orange }]}>
              {streak?.streak ?? 0}🔥
            </Text>
            <Text style={[styles.snapshotDot, { color: colors.textMuted }]}>
              ·
            </Text>
            <Text style={[styles.snapshotStat, { color: colors.gold }]}>
              Stage {stage}/8
            </Text>
          </View>
        </View>
        <Text style={[styles.snapshotArrow, { color: colors.textMuted }]}>›</Text>
      </TouchableOpacity>

      {/* ── Three primary live sections ──────────────────────────── */}
      {PRIMARY_SECTIONS.map((s) => (
        <PrimaryCard key={s.title} {...s} accent={resolveAccent(s.accent, colors)} />
      ))}

      {/* ── Personal career-mapping blocks (shared with OFF branch) ─ */}
      <PersonalCareerBlocks saved={saved} notes={notes} />

      {/* ── More: the rest of the learning world ─────────────────── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>More</Text>
      <View style={styles.moreGrid}>
        {MORE_LINKS.map((m) => (
          <TouchableOpacity
            key={m.label}
            activeOpacity={0.7}
            onPress={() => router.push(m.href)}
            style={[
              styles.moreTile,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.moreIcon}>{m.icon}</Text>
            <Text
              style={[styles.moreLabel, { color: colors.text }]}
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

/** Accent key → theme colour (kept data-driven so sections stay declarative). */
function resolveAccent(
  key: "accent" | "green" | "gold",
  colors: ReturnType<typeof useTheme>["colors"],
): string {
  return colors[key];
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
    body: "Your learning world — islands, fields and levels. Master your domain step by step.",
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
      { label: "Community", href: "/(tabs)/community" },
      { label: "Leaderboard", href: "/(tabs)/community/leaderboard" },
      { label: "Feed", href: "/(tabs)/feed" },
    ],
  },
];

const MORE_LINKS: { icon: string; label: string; href: Href }[] = [
  { icon: "🧠", label: "Skills directory", href: "/(tabs)/skills" },
  { icon: "🎤", label: "Interview mode", href: "/(tabs)/skills/interview" },
  { icon: "🛍️", label: "Merchandise", href: "/merchandise" },
  { icon: "🎁", label: "Referral", href: "/(tabs)/community/referral" },
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
    title: "Levels & XP",
    body: "Gamified progress, like Duolingo for real career skills.",
  },
  {
    icon: "📁",
    title: "Portfolio",
    body: "Verifiable completion records to show employers.",
  },
];

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

/** A single saved/bookmarked entity row. */
function SavedItemRow({ item }: { item: SavedItem }) {
  const { colors } = useTheme();
  const meta = ENTITY_META[item.entityType];
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.rowIcon}>{meta.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rowTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.label ?? meta.label}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
          {meta.label}
        </Text>
      </View>
    </View>
  );
}

/** A single note card within a category group. */
function NoteCard({ note }: { note: Note }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.noteCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {note.entityLabel ? (
        <Text style={[styles.noteEntity, { color: colors.textMuted }]}>
          {note.entityLabel}
        </Text>
      ) : null}
      <Text style={[styles.noteBody, { color: colors.text }]}>{note.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
    lineHeight: FontSize.display * 1.15,
  },
  banner: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    lineHeight: FontSize.sm * 1.4,
  },
  section: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    textTransform: "uppercase",
  },
  list: { gap: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 44,
  },
  rowIcon: { fontSize: 22 },
  rowTitle: { fontSize: FontSize.md, fontWeight: "700" },
  rowMeta: { fontSize: FontSize.xs, marginTop: 2 },
  noteGroups: { gap: Spacing.lg },
  noteGroup: { gap: Spacing.sm },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
  },
  noteCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 2,
  },
  noteEntity: { fontSize: FontSize.xs, fontWeight: "700" },
  noteBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },

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
  snapshotStage: { fontSize: FontSize.md, fontWeight: "800" },
  snapshotStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: 3,
  },
  snapshotStat: { fontSize: FontSize.sm, fontWeight: "800" },
  snapshotDot: { fontSize: FontSize.sm },
  snapshotArrow: { fontSize: FontSize.xxl, fontWeight: "700" },

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
  primaryTitle: { fontSize: FontSize.lg, fontWeight: "900" },
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
  chipText: { fontSize: FontSize.sm, fontWeight: "800" },

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
    fontWeight: "700",
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
  lockedTitle: { fontSize: FontSize.lg, fontWeight: "800" },
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
  linkText: { fontSize: FontSize.sm, fontWeight: "800" },
});
