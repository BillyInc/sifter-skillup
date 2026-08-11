/**
 * CareerHomeScreen - the personalised returning-user Home (Mockup Part 7).
 *
 * Editorial magazine layout: greeting + persona context, hero "Your Route"
 * card, asymmetric grid of market intelligence, saved domains, and quick
 * actions. Every data-backed section reads through `careerData`, which returns
 * `coming_soon` envelopes for now - rendered gracefully via <DataStateView>.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  CompassFonts,
  webContainer,
} from "../theme";
import { useAuth } from "../hooks/useAuth";
import { LevelUpLogo } from "../components/brand/LevelUpLogo";
import { DataStateView } from "../components/careerIntelligence";
import { StaggerReveal } from "../components/animations/StaggerReveal";
import { careerData } from "../lib/careerData";
import { getStartingPoint } from "../lib/startingPoint";
import {
  comingSoon,
  type DataState,
  type SavedItem,
} from "../types/career";
import type { StartingPointProfile, UserType } from "../types/onboarding";

const QUICK = [
  {
    icon: "Search",
    title: "Explore programmes",
    body: "Domains, roles and skills your programme unlocks",
    href: "/(tabs)/explore" as const,
    locked: false,
  },
  {
    icon: "Star",
    title: "Elite & special pathways",
    body: "Aspirational routes & every starting point",
    href: "/(tabs)/explore/elite" as const,
    locked: false,
  },
  {
    icon: "Lock",
    title: "My World",
    body: "Locked tracks, portfolio proof and guild progress",
    href: "/(tabs)/myworld" as const,
    locked: true,
  },
  {
    icon: "User",
    title: "Profile",
    body: "Your account, saved items and notes",
    href: "/(tabs)/profile" as const,
    locked: false,
  },
];

const USER_TYPE_LABEL: Record<UserType, string> = {
  senior_secondary: "Senior secondary explorer",
  jamb: "JAMB / UTME candidate",
  student: "Student",
  skilled_worker: "Skilled worker",
  professional: "Professional",
  graduate: "Graduate",
};

/** Human-readable, one-line-ish summary of where the user is starting from. */
function summariseStartingPoint(p: StartingPointProfile): string {
  const bits: string[] = [];
  switch (p.userType) {
    case "senior_secondary": {
      const cls = p.ssClass ? p.ssClass.toUpperCase() : "Senior secondary";
      bits.push(cls);
      if (p.jambSubjects?.length) bits.push(p.jambSubjects.join(", "));
      break;
    }
    case "jamb": {
      const target = p.intendedProgramme ?? p.preferredSchool;
      if (target) bits.push(target);
      if (p.jambSubjects?.length) bits.push(p.jambSubjects.join(", "));
      break;
    }
    case "student": {
      if (p.programmeName ?? p.discipline)
        bits.push((p.programmeName ?? p.discipline) as string);
      if (p.schoolName) bits.push(p.schoolName);
      if (p.classification) bits.push(p.classification);
      break;
    }
    case "graduate": {
      if (p.programmeName ?? p.discipline)
        bits.push((p.programmeName ?? p.discipline) as string);
      if (p.classification) bits.push(p.classification);
      if (p.schoolName) bits.push(p.schoolName);
      break;
    }
    case "professional": {
      if (p.currentField) bits.push(p.currentField);
      if (p.yearsExperience) bits.push(`${p.yearsExperience} experience`);
      break;
    }
    case "skilled_worker": {
      if (p.trade) bits.push(p.trade);
      if (p.yearsExperience) bits.push(`${p.yearsExperience} experience`);
      break;
    }
  }
  return bits.length ? bits.join(" / ") : "Profile saved";
}

function nextStartingPointAction(p: StartingPointProfile): {
  label: string;
  href: string;
} {
  const isAdmissionUser = p.userType === "jamb" || p.userType === "senior_secondary";
  const programmeId = p.intendedJambProgrammeId ?? p.intendedProgrammeId;
  const programmeName = p.intendedProgramme ?? p.programmeName ?? "";
  const hasProgramme = Boolean(programmeId || programmeName);
  const hasSchool = Boolean(p.preferredSchoolId || p.preferredSchool || p.schoolName);

  if ((p.userType === "student" || p.userType === "graduate") && programmeId) {
    return {
      label: "Continue to career mapping",
      href: `/(tabs)/explore/programme/${encodeURIComponent(programmeId)}`,
    };
  }

  if (isAdmissionUser && hasProgramme && hasSchool && programmeId) {
    return {
      label: "Continue to career mapping",
      href: `/(tabs)/explore/programme/${encodeURIComponent(programmeId)}`,
    };
  }

  if (isAdmissionUser && hasProgramme) {
    return {
      label: "Choose university",
      href: `/(tabs)/explore/admission?mode=programme&q=${encodeURIComponent(programmeName || programmeId || "")}`,
    };
  }

  if (isAdmissionUser && p.jambSubjects?.length) {
    return {
      label: "Match programmes",
      href: `/(tabs)/explore/admission?mode=subjects&subjects=${encodeURIComponent(p.jambSubjects.join(","))}${p.stream ? `&stream=${encodeURIComponent(p.stream)}` : ""}`,
    };
  }

  return {
    label: "Explore career intelligence",
    href: "/(tabs)/explore",
  };
}

export default function CareerHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = user?.auth_provider === "guest";
  const name =
    user?.username && user.username !== "Learner"
      ? user.username.split(" ")[0]
      : null;

  const [starting, setStarting] = useState<StartingPointProfile | null>(null);
  const [startingLoaded, setStartingLoaded] = useState(false);
  const [saved, setSaved] = useState<DataState<SavedItem[]>>(() =>
    comingSoon<SavedItem[]>(),
  );
  const nextAction = starting ? nextStartingPointAction(starting) : null;

  useEffect(() => {
    let active = true;
    (async () => {
      const [sp, items] = await Promise.all([
        getStartingPoint(user?.id),
        careerData.getSavedItems(),
      ]);
      if (!active) return;
      setStarting(sp);
      setStartingLoaded(true);
      setSaved(items);
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Only saved domains & roles belong in "Your domains".
  const filterDomainsRoles = (items: SavedItem[]): DataState<SavedItem[]> => ({
    ...saved,
    data:
      items.filter(
        (it) => it.entityType === "domain" || it.entityType === "role",
      ) ?? null,
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <LevelUpLogo size={48} />
        <View style={{ flex: 1 }}>
          {name ? (
            <>
              <Text style={[styles.hi, { color: colors.textRole.muted }, CompassFonts.body]}>
                Welcome back,
              </Text>
              <Text style={[styles.brand, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
                {name}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.hi, { color: colors.textRole.muted }, CompassFonts.body]}>
                Welcome to
              </Text>
              <Text style={[styles.brand, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
                {Brand.name}
              </Text>
            </>
          )}
        </View>
      </View>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.accentRole.action + "0D",
              borderColor: colors.accentRole.action + "30",
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: colors.accentRole.action }, CompassFonts.bodyMedium]}>
            You&apos;re browsing as a guest. Create an account to save matches and
            notes.
          </Text>
        </View>
      ) : null}

      {/* Your starting point */}
      <Text style={[styles.section, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        Your starting point
      </Text>
      {!startingLoaded ? null : starting ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Text style={[styles.cardEyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
            {USER_TYPE_LABEL[starting.userType]}
          </Text>
          <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
            {summariseStartingPoint(starting)}
          </Text>
          {starting.regions?.length || starting.workTypes?.length ? (
            <Text style={[styles.cardMeta, { color: colors.textRole.muted }, CompassFonts.body]}>
              {[
                starting.regions?.length
                  ? starting.regions.join(", ")
                  : undefined,
                starting.workTypes?.length
                  ? starting.workTypes.join(", ")
                  : undefined,
              ]
                .filter(Boolean)
                .join(" / ")}
            </Text>
          ) : null}
          <View style={styles.cardActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cardLink}
              onPress={() => nextAction ? router.push(nextAction.href as any) : router.push("/(tabs)/explore")}
            >
              <Text style={[styles.cardLinkText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
                {nextAction?.label ?? "Explore career intelligence"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.cardLink}
              onPress={() => router.push(isGuest ? "/(auth)/signup" : "/(auth)/onboarding")}
            >
              <Text style={[styles.cardLinkText, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
                {isGuest ? "Create account" : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(isGuest ? "/(auth)/signup" : "/(auth)/onboarding")}
          style={[
            styles.card,
            { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Text style={styles.promptIcon}>Start</Text>
          <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
            {isGuest ? "Create an account to personalise LevelUp" : "Tell us where you&apos;re starting from"}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
            {isGuest
              ? "Guest mode can browse Explore. An account lets us save your matches, notes and starting point."
              : "Complete a quick onboarding so we can tailor programmes, domains and demand signals to you."}
          </Text>
          <Text style={[styles.cardLinkText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
            Start onboarding
          </Text>
        </TouchableOpacity>
      )}

      {/* Market intelligence */}
      <Text style={[styles.section, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        Market intelligence
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
        ]}
      >
        <Text style={[styles.cardEyebrow, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
          DEMAND + VALUE
        </Text>
        <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
          Role signals will separate volume, value and access.
        </Text>
        <Text style={[styles.cardMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
          Nigerian local, Nigerian remote and global demand should stay
          separate. Low-volume/high-value roles will be labelled as selective
          pathways, not buried as weak demand.
        </Text>
      </View>

      {/* Your domains */}
      <Text style={[styles.section, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        Your domains
      </Text>
      <DataStateView
        state={saved.data ? filterDomainsRoles(saved.data) : saved}
        empty={(rows) => rows.length === 0}
        emptyTitle="No saved domains yet"
        emptyBody="Save domains & roles to track them here."
      >
        {(rows) => (
          <View style={styles.list}>
            {rows.map((it, i) => (
              <StaggerReveal key={it.id} index={i}>
                <View
                  style={[
                    styles.row,
                    { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
                  ]}
                >
                  <Text style={styles.rowIcon}>
                    {it.entityType === "role" ? "Role" : "Map"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.rowTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}
                      numberOfLines={1}
                    >
                      {it.label ?? it.entityId}
                    </Text>
                    <Text
                      style={[styles.rowMeta, { color: colors.textRole.muted }, CompassFonts.body]}
                      numberOfLines={1}
                    >
                      {it.entityType === "role" ? "Role" : "Domain"}
                    </Text>
                  </View>
                </View>
              </StaggerReveal>
            ))}
          </View>
        )}
      </DataStateView>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.linkRow}
        onPress={() => router.push("/(tabs)/explore")}
      >
        <Text style={[styles.linkText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
          Explore and save domains
        </Text>
      </TouchableOpacity>

      {/* Quick actions */}
      <Text style={[styles.section, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        Quick actions
      </Text>
      <View style={styles.grid}>
        {QUICK.map((q, i) => (
          <StaggerReveal key={q.title} index={i}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(q.href)}
              style={[
                styles.tile,
                { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
              ]}
            >
              <Text style={styles.tileIcon}>{q.icon}</Text>
              <Text style={[styles.tileTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                {q.title}
              </Text>
              <Text style={[styles.tileBody, { color: colors.textRole.muted }, CompassFonts.body]}>
                {q.body}
              </Text>
            </TouchableOpacity>
          </StaggerReveal>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  hi: { fontSize: FontSize.sm },
  brand: { fontSize: FontSize.xxl },
  banner: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  bannerText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  section: {
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 4,
  },
  cardEyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardTitle: { fontSize: FontSize.lg },
  cardMeta: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  promptIcon: { fontSize: 28 },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  cardLink: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  cardLinkText: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
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
  rowTitle: { fontSize: FontSize.md },
  rowMeta: { fontSize: FontSize.xs, marginTop: 2 },
  linkRow: {
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: { fontSize: FontSize.sm },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    minWidth: 150,
    minHeight: 44,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 4,
  },
  tileIcon: { fontSize: 26 },
  tileTitle: {
    fontSize: FontSize.lg,
    marginTop: Spacing.xs,
  },
  tileBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});

