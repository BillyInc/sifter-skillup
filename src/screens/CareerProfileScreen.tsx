/**
 * CareerProfileScreen - the LevelUp Profile tab (career intelligence).
 *
 * This is the career-side profile: the user's starting point, everything they
 * have saved/bookmarked, their notes (grouped by category), account actions,
 * and an "About" blurb. Opportunity subscriptions and notification controls
 * are deliberately absent until delivery is live. The gamified learning profile
 * (worker character / XP / portfolio) is
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
  Modal,
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
import { getStartingPoint } from "@/lib/startingPoint";
import {
  type DataState,
  type SavedItem,
  type Note,
  type SavedEntityType,
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
  resource: { icon: "RES", label: "Resource" },
};
const UNCATEGORISED = "Uncategorised";

export default function CareerProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const [accountAction, setAccountAction] = useState<'sign-out' | 'delete' | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const isGuest = user?.auth_provider === "guest";

  const [profile, setProfile] = useState<StartingPointProfile | null>(null);
  const [saved, setSaved] = useState<DataState<SavedItem[]> | null>(null);
  const [notes, setNotes] = useState<DataState<Note[]> | null>(null);
  // Notifications and opportunity subscriptions stay out of this screen
  // until their delivery and preference contract is live.

  const loadProfileData = useCallback(async (isActive: () => boolean) => {
    if (isGuest) {
      setProfile(null);
      setSaved(null);
      setNotes(null);
      return;
    }
    const [sp, savedState, notesState] = await Promise.all([
      getStartingPoint(user?.id),
      careerData.getSavedItems(),
      careerData.getAllNotes(),
    ]);
    if (!isActive()) return;
    setProfile(sp);
    setSaved(savedState);
    setNotes(notesState);
  }, [isGuest, user?.id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void loadProfileData(() => active);
      return () => {
        active = false;
      };
    }, [loadProfileData]),
  );

  const displayName =
    user?.username && user.username !== "Student" ? user.username : null;

  const runAccountAction = useCallback(async () => {
    if (!accountAction || actionBusy) return;
    setActionBusy(true);
    try {
      if (accountAction === 'delete') await deleteAccount();
      else await signOut();
      setAccountAction(null);
      router.replace("/(auth)/sign-in");
    } finally {
      setActionBusy(false);
    }
  }, [accountAction, actionBusy, deleteAccount, router, signOut]);

  if (isGuest) return <GuestProfileView />;

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
                {"Tell us where you\u2019re starting from so we can tailor the domains, roles and Opportunities we show you."}
              </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(isGuest ? "/(auth)/signup" : "/(auth)/onboarding?restart=1")}
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
              onRetry={() => { void loadProfileData(() => true); }}
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
              onRetry={() => { void loadProfileData(() => true); }}
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
              onPress={() => setAccountAction('sign-out')}
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
              {Brand.name} maps your discipline to the domains, roles and Opportunities it
              unlocks - local, global and remote - and shows the honest bridge to
              get there. {Brand.tagline}
            </Text>
          </View>
        </Section>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
      <Modal visible={accountAction !== null} transparent animationType="fade" onRequestClose={() => setAccountAction(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.modalTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
              {accountAction === 'delete' ? 'Delete your account?' : 'Sign out?'}
            </Text>
            <Text style={[styles.modalBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              {accountAction === 'delete' ? 'Your account will be marked for deletion. A 24-hour recovery cooldown starts immediately, so another account cannot be created from this device until it ends.' : 'You will need to log in again to continue.'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAccountAction(null)} disabled={actionBusy} style={[styles.modalButton, { borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.modalButtonText, { color: colors.textRole.primary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={runAccountAction} disabled={actionBusy} style={[styles.modalButton, { backgroundColor: colors.accentRole.danger, borderColor: colors.accentRole.danger, opacity: actionBusy ? 0.6 : 1 }]}>
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>{accountAction === 'delete' ? 'Delete account' : 'Sign out'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/** Guest Profile is an account entry point, not a partially loaded student profile. */
function GuestProfileView() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>PROFILE</Text>
        <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Guest browsing</Text>
        <Text style={[styles.subtle, { color: colors.textRole.secondary }]}>You are exploring Sifter LevelUp without an account.</Text>

        <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.cardBody, CompassFonts.bodyBold, { color: colors.textRole.primary }]}>Read-only preview</Text>
          <Text style={[styles.subtle, { color: colors.textRole.secondary }]}>Browse programmes, universities, domains, subgroups and roles. Create an account when you want to save guidance, write notes or keep your place.</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)} style={[styles.modalButton, { backgroundColor: colors.accentRole.action, borderColor: colors.accentRole.action }]}>
              <Text style={[styles.modalButtonText, { color: colors.textRole.inverse }]}>Create account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in' as any)} style={[styles.modalButton, { borderColor: colors.borderRole.subtle }]}>
              <Text style={[styles.modalButtonText, { color: colors.textRole.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Section title="Account">
          <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle, gap: 0 }]}>
            <AccountRow
              icon="SET"
              label="Settings"
              sub="Theme, legal and app preferences"
              onPress={() => router.push('/(tabs)/settings' as any)}
            />
          </View>
        </Section>
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
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  modalCard: { width: '100%', maxWidth: 420, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.xl, gap: Spacing.md },
  modalTitle: { fontSize: FontSize.xl },
  modalBody: { fontSize: FontSize.sm, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: Spacing.sm },
  modalButton: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.sm },
  modalButtonText: { fontSize: FontSize.sm, fontWeight: '800' },
});
