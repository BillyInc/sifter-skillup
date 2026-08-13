/**
 * CareerProfileScreen - the LevelUp Profile tab (career intelligence).
 *
 * This is the career-side profile: the user's starting point, everything they
 * have saved/bookmarked, their notes (grouped by category), their opportunity
 * subscriptions, notification preferences, account actions, and an "About"
 * blurb. The gamified learning profile (worker character / XP / portfolio) is
 * the legacy ProfileScreen and folds into My World in a later phase - it is
 * intentionally preserved and NOT shown here.
 *
 * All data-driven blocks read careerData (currently `coming_soon`) through
 * DataStateView, so they degrade gracefully - never mock rows.
 */
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  Brand,
  webContainer,
} from "@/theme";
import { DataStateView, LockedPill } from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { getStartingPoint, saveStartingPoint } from "@/lib/startingPoint";
import {
  type DataState,
  type SavedItem,
  type Note,
  type Subscription,
  type SavedEntityType,
  type SubscriptionTarget,
} from "../types/career";
import type {
  StartingPointProfile,
  UserType,
} from "../types/onboarding";
import { useAuth } from "@/hooks/useAuth";

const USER_TYPE_LABEL: Record<UserType, string> = {
  senior_secondary: "Senior secondary (SS1/SS2)",
  ss3_secondary: "Senior secondary (SS3)",
  jamb: "JAMB / UTME candidate",
  student: "In a programme",
  skilled_worker: "Skilled worker / artisan",
  professional: "Working professional",
  graduate: "Graduate",
};

const ENTITY_META: Record<SavedEntityType, { icon: string; label: string }> = {
  programme: { icon: "PRG", label: "Programme" },
  school: { icon: "SCH", label: "School" },
  domain: { icon: "DOM", label: "Domain" },
  subgroup: { icon: "SUB", label: "Subgroup" },
  role: { icon: "ROL", label: "Role" },
  comparison: { icon: "CMP", label: "Comparison" },
  opportunity: { icon: "OPP", label: "Opportunity" },
  organisation: { icon: "ORG", label: "Employer" },
  elite_pathway: { icon: "ELT", label: "Pathway" },
};
const SUBSCRIPTION_META: Record<SubscriptionTarget, { icon: string; label: string }> = {
  opportunity: { icon: "OPP", label: "Opportunity" },
  organisation: { icon: "ORG", label: "Employer" },
  application_window: { icon: "WIN", label: "Application window" },
};
const NOTIF_LABELS: { key: string; label: string; fallback: boolean }[] = [
  { key: "internships", label: "Internship openings", fallback: true },
  { key: "graduate_deadlines", label: "Graduate programme deadlines", fallback: true },
  { key: "scholarships", label: "Scholarship alerts", fallback: true },
  { key: "weekly_tips", label: "Weekly career tips", fallback: false },
];

const UNCATEGORISED = "Uncategorised";

export default function CareerProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const isGuest = user?.auth_provider === "guest";

  const [profile, setProfile] = useState<StartingPointProfile | null>(null);
  const [saved, setSaved] = useState<DataState<SavedItem[]> | null>(null);
  const [notes, setNotes] = useState<DataState<Note[]> | null>(null);
  const [subs, setSubs] = useState<DataState<Subscription[]> | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [sp, savedState, notesState, subsState] = await Promise.all([
          getStartingPoint(user?.id),
          careerData.getSavedItems(),
          careerData.getAllNotes(),
          careerData.getSubscriptions(),
        ]);
        if (!active) return;
        setProfile(sp);
        setSaved(savedState);
        setNotes(notesState);
        setSubs(subsState);
      })();
      return () => {
        active = false;
      };
    }, [user?.id]),
  );

  const displayName =
    user?.username && user.username !== "Learner" ? user.username : null;

  // Notifications: edit the local profile copy and persist it (only when a
  // starting-point profile already exists - we don't fabricate one here).
  const notifValue = (key: string) =>
    profile?.notifications?.[key] ??
    NOTIF_LABELS.find((n) => n.key === key)?.fallback ??
    false;

  const onToggleNotif = (key: string, val: boolean) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next: StartingPointProfile = {
        ...prev,
        notifications: { ...(prev.notifications ?? {}), [key]: val },
      };
      void saveStartingPoint(next, user?.id);
      return next;
    });
  };

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } finally {
      router.replace("/(auth)/sign-in");
    }
  }, [signOut, router]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
          PROFILE
        </Text>
        <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
          {displayName ?? "Your profile"}
        </Text>
        {user?.email ? (
          <Text style={[styles.subtle, { color: colors.textRole.muted }]}>
            {user.email}
          </Text>
        ) : null}

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
              {"You\u2019re browsing as a guest. Create an account to keep your saved items, notes and alerts."}
            </Text>
          </View>
        ) : null}

        {/*  Starting point  */}
        <Section title="Your starting point">
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            {profile ? (
              <>
                <Text style={[styles.cardEyebrow, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
                  {USER_TYPE_LABEL[profile.userType] ?? "Profile"}
                </Text>
                <Text style={[styles.cardBody, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>
                  {summariseStartingPoint(profile)}
                </Text>
              </>
            ) : (
              <Text style={[styles.cardBody, CompassFonts.bodyBold, { color: colors.textRole.secondary }]}>
                {"Tell us where you\u2019re starting from so we can tailor the domains, roles and jobs we show you."}
              </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(isGuest ? "/(auth)/signup" : "/(auth)/onboarding")}
              style={styles.linkBtn}
            >
              <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
                {isGuest ? "Create account" : profile ? "Update your starting point" : "Start onboarding"}
              </Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/*  Saved & bookmarked  */}
        <Section title="Saved & bookmarked">
          {saved ? (
            <DataStateView
              state={saved}
              empty={(items) => items.length === 0}
              emptyTitle="Nothing saved yet"
              emptyBody="Items you save across the app show up here."
            >
              {(items) => (
                <View style={styles.list}>
                  {items.map((item) => (
                    <SavedRow key={item.id} item={item} />
                  ))}
                </View>
              )}
            </DataStateView>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/explore")}
            style={styles.linkBtn}
          >
            <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
              Explore & save domains 
            </Text>
          </TouchableOpacity>
        </Section>

        {/*  My notes  */}
        <Section title="My notes">
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
                      <Text style={[styles.groupLabel, CompassFonts.bodyBold, { color: colors.textRole.muted }]}>
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
        </Section>

        {/*  My subscriptions  */}
        <Section title="My subscriptions">
          {subs ? (
            <DataStateView
              state={subs}
              empty={(items) => items.length === 0}
              emptyTitle="No subscriptions yet"
              emptyBody="Subscribe to an opportunity or employer to get alerts here."
            >
              {(items) => (
                <View style={styles.list}>
                  {items.map((s) => (
                    <SubscriptionRow key={s.id} sub={s} />
                  ))}
                </View>
              )}
            </DataStateView>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/opportunities")}
            style={styles.linkBtn}
          >
            <Text style={[styles.linkText, CompassFonts.bodyBold, { color: colors.accentRole.action }]}>
              Browse opportunities 
            </Text>
          </TouchableOpacity>
        </Section>

        {/*  Notifications  */}
        <Section title="Notifications">
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            {!profile ? (
              <Text style={[styles.subtle, { color: colors.textRole.muted }]}>
                Complete onboarding to save your notification preferences.
              </Text>
            ) : null}
            {NOTIF_LABELS.map((n) => (
              <View key={n.key} style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>
                  {n.label}
                </Text>
                <Switch
                  value={notifValue(n.key)}
                  disabled={!profile}
                  onValueChange={(val) => onToggleNotif(n.key, val)}
                  trackColor={{ true: colors.accentRole.action, false: colors.borderRole.subtle }}
                  thumbColor={
                    Platform.OS === "android"
                      ? notifValue(n.key)
                        ? colors.textRole.inverse
                        : "#f4f3f4"
                      : undefined
                  }
                />
              </View>
            ))}
          </View>
        </Section>

        {/*  My World (locked)  */}
        <Section title="My World">
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/myworld")}
            style={[
              styles.card,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            <View style={styles.lockedHead}>
              <Text style={[styles.cardBody, CompassFonts.bodyBold, { color: colors.textRole.primary, flex: 1 }]}>Learning Tracks and Portfolio</Text>
              <LockedPill />
            </View>
            <Text style={[styles.subtle, { color: colors.textRole.secondary }]}>
              Your gamified domain tracks, levels and verifiable portfolio are
              locked until the learning layer opens.
            </Text>
          </TouchableOpacity>
        </Section>

        {/*  Account  */}
        <Section title="Account">
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle, gap: 0 },
            ]}
          >
            <AccountRow
              icon="SET"
              label="Settings"
              sub="Theme, account and app preferences"
              onPress={() => router.push("/(tabs)/settings")}
            />
            <AccountRow
              icon="OUT"
              label="Sign out"
              danger
              onPress={handleSignOut}
            />
          </View>
        </Section>

        {/*  About  */}
        <Section title={`About ${Brand.name}`}>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            <Text style={[styles.cardBody, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>
              {Brand.promise}
            </Text>
            <Text style={[styles.subtle, { color: colors.textRole.muted }]}>
              {Brand.name} maps your discipline to the domains, roles and jobs it
              unlocks - local, global and remote - and shows the honest bridge to
              get there. {Brand.tagline}
            </Text>
          </View>
        </Section>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** Build a concise, honest one-line summary from whatever the profile has. */
function summariseStartingPoint(p: StartingPointProfile): string {
  const parts: string[] = [];
  switch (p.userType) {
    case "senior_secondary":
      if (p.ssClass) parts.push(p.ssClass.toUpperCase());
      if (p.jambSubjects?.length)
        parts.push(`${p.jambSubjects.length} strong subjects`);
      break;
    case "jamb":
      if (p.intendedProgramme) parts.push(p.intendedProgramme);
      if (p.preferredSchool) parts.push(p.preferredSchool);
      if (p.jambSubjects?.length)
        parts.push(`${p.jambSubjects.length} subjects`);
      break;
    case "student":
      if (p.programmeName || p.discipline)
        parts.push(p.programmeName ?? p.discipline ?? "");
      if (p.schoolName) parts.push(p.schoolName);
      if (p.classification) parts.push(p.classification);
      break;
    case "graduate":
      if (p.programmeName || p.discipline)
        parts.push(p.programmeName ?? p.discipline ?? "");
      if (p.classification) parts.push(p.classification);
      if (p.schoolName) parts.push(p.schoolName);
      break;
    case "professional":
      if (p.currentField) parts.push(p.currentField);
      if (p.yearsExperience) parts.push(`${p.yearsExperience} experience`);
      break;
    case "skilled_worker":
      if (p.trade) parts.push(p.trade);
      if (p.yearsExperience) parts.push(`${p.yearsExperience} experience`);
      break;
  }
  return parts.filter(Boolean).join(" / ") || "Profile saved";
}

/** Group notes by category; ungrouped fall under "Uncategorised" (always last). */
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.section, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>{title}</Text>
      {children}
    </View>
  );
}

function SavedRow({ item }: { item: SavedItem }) {
  const { colors } = useTheme();
  const meta = ENTITY_META[item.entityType];
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={styles.rowIcon}>{meta.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, CompassFonts.bodyBold, { color: colors.textRole.primary }]} numberOfLines={1}>
          {item.label ?? meta.label}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.textRole.muted }]}>
          {meta.label}
        </Text>
      </View>
    </View>
  );
}

function SubscriptionRow({ sub }: { sub: Subscription }) {
  const { colors } = useTheme();
  const meta = SUBSCRIPTION_META[sub.target];
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={styles.rowIcon}>{meta.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, CompassFonts.bodyBold, { color: colors.textRole.primary }]} numberOfLines={1}>
          {meta.label}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.textRole.muted }]} numberOfLines={1}>
          {sub.targetId}
        </Text>
      </View>
      <Text style={[styles.rowMeta, { color: colors.accentRole.success }]}>On</Text>
    </View>
  );
}

function NoteCard({ note }: { note: Note }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.noteCard,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      {note.entityLabel ? (
        <Text style={[styles.noteEntity, CompassFonts.bodyBold, { color: colors.textRole.muted }]}>
          {note.entityLabel}
        </Text>
      ) : null}
      <Text style={[styles.noteBody, { color: colors.textRole.primary }]}>{note.body}</Text>
    </View>
  );
}

function AccountRow({
  icon,
  label,
  sub,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.accountRow}
    >
      <Text style={styles.accountIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text
            style={[
              styles.accountLabel,
              CompassFonts.bodyBold,
              { color: danger ? colors.accentRole.danger : colors.textRole.primary },
            ]}
        >
          {label}
        </Text>
        {sub ? (
          <Text style={[styles.accountSub, { color: colors.textRole.muted }]}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.accountArrow, { color: colors.textRole.muted }]}>{">"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  subtle: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  banner: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  bannerText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  sectionWrap: { gap: Spacing.sm, marginTop: Spacing.md },
  section: {
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardEyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
  },
  cardBody: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  linkBtn: { minHeight: 44, justifyContent: "center" },
  linkText: { fontSize: FontSize.sm },
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
  rowTitle: { fontSize: FontSize.md },
  rowMeta: { fontSize: FontSize.xs, marginTop: 2 },
  noteGroups: { gap: Spacing.lg },
  noteGroup: { gap: Spacing.sm },
  groupLabel: { fontSize: FontSize.xs, letterSpacing: 1 },
  noteCard: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 2,
  },
  noteEntity: { fontSize: FontSize.xs },
  noteBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  toggleLabel: {
    flex: 1,
    fontSize: FontSize.md,
    paddingRight: Spacing.md,
  },
  lockedHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  accountIcon: { fontSize: 18 },
  accountLabel: { fontSize: FontSize.md },
  accountSub: { fontSize: FontSize.xs, marginTop: 2 },
  accountArrow: { fontSize: FontSize.lg },
});
