/**
 * CareerHomeScreen - the personalised returning-user Home (Mockup Part 7).
 *
 * Editorial magazine layout: greeting + persona context, hero "Your Route"
 * card, saved guidance paths, and quick actions. Every data-backed section
 * reads through `careerData`, which returns
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
import type { GuidanceReportPath } from "../lib/careerData";
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
    body: "Find programmes, universities and connected domains",
    href: "/(tabs)/explore" as const,
    locked: false,
  },
  {
    icon: "Build",
    title: "Entrepreneurship",
    body: "Business paths connected to your domain",
    href: "/(tabs)/explore/pathways/entrepreneurship" as const,
    locked: false,
  },
  {
    icon: "Brief",
    title: "Opportunities",
    body: "Internships, entry roles and application windows",
    href: "/(tabs)/opportunities" as const,
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
  ss3_secondary: "SS3 student (final year)",
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
      if (p.stream) bits.push(`${p.stream} stream`);
      if (p.olevelSubjects?.length) bits.push(p.olevelSubjects.join(", "));
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

function nextStartingPointAction(
  p: StartingPointProfile,
  guidance: GuidanceReportPath | null,
): {
  label: string;
  href: string;
} {
  const isAdmissionUser = p.userType === "jamb" || p.userType === "ss3_secondary" || p.userType === "senior_secondary";
  const savedProgramme = guidance?.path.programme;
  const savedUniversity = guidance?.path.university;
  const programmeId = p.intendedJambProgrammeId
    ?? p.intendedProgrammeId
    ?? recordText(savedProgramme, "id", "programmeId", "jambProgrammeId");
  const programmeName = p.intendedProgramme
    ?? p.programmeName
    ?? recordText(savedProgramme, "name", "programmeName", "jambName");
  const hasProgramme = Boolean(programmeId || programmeName);
  const schoolId = p.preferredSchoolId ?? recordText(savedUniversity, "id", "schoolId", "universityId");
  const schoolName = p.preferredSchool ?? p.schoolName ?? recordText(savedUniversity, "name", "universityName", "schoolName");
  const hasSchool = Boolean(schoolId || schoolName);

  if ((p.userType === "student" || p.userType === "graduate") && programmeId) {
    return {
      label: "Continue",
      href: `/(tabs)/explore/programme/${encodeURIComponent(programmeId)}?focus=guidance`,
    };
  }

  if (isAdmissionUser && hasProgramme && hasSchool && programmeId) {
    return {
      label: "Continue",
      href: `/(tabs)/explore/programme/${encodeURIComponent(programmeId)}?focus=guidance&school_id=${encodeURIComponent(schoolId)}&user_type=${encodeURIComponent(p.userType)}&class_name=${encodeURIComponent(p.ssClass ?? "")}${p.stream ? `&stream=${encodeURIComponent(p.stream)}` : ""}`,
    };
  }

  if (isAdmissionUser && hasProgramme) {
    return {
      label: "Choose university",
      href: `/(tabs)/explore/admission?mode=programme&focus=guidance&q=${encodeURIComponent(programmeName || programmeId || "")}&user_type=${encodeURIComponent(p.userType)}${p.ssClass ? `&class_name=${encodeURIComponent(p.ssClass)}` : ""}${p.stream ? `&stream=${encodeURIComponent(p.stream)}` : ""}`,
    };
  }

  const subjects = p.userType === "senior_secondary"
    ? p.olevelSubjects
    : p.jambSubjects?.length ? p.jambSubjects : p.olevelSubjects;
  const subjectExamType = p.userType === "senior_secondary" || !p.jambSubjects?.length ? "olevel" : "utme";
  if (isAdmissionUser && subjects?.length) {
    const subjectParam = subjectExamType === "olevel" ? "olevel_subjects" : "subjects";
    return {
      label: "Continue",
      href: `/(tabs)/explore/admission?mode=subjects&journey=guided_subject_discovery&${subjectParam}=${encodeURIComponent(subjects.join(","))}&exam_type=${subjectExamType}&user_type=${encodeURIComponent(p.userType)}${p.ssClass ? `&class_name=${encodeURIComponent(p.ssClass)}` : ""}${p.stream ? `&stream=${encodeURIComponent(p.stream)}` : ""}`,
    };
  }

  const savedRole = guidance?.path.roles?.[0];
  const savedDomain = guidance?.path.domains?.[0];
  const roleId = recordText(savedRole, "key", "id", "roleKey");
  const domainId = recordText(savedDomain, "id", "domainId", "domainKey");
  if (roleId) {
    return { label: "Open saved guidance", href: `/(tabs)/explore/role/${encodeURIComponent(roleId)}?focus=guidance` };
  }
  if (domainId) {
    return { label: "Open saved guidance", href: `/(tabs)/explore/domain/${encodeURIComponent(domainId)}?focus=guidance` };
  }

  return {
    label: "Explore career intelligence",
    href: "/(tabs)/explore",
  };
}

function recordText(record: Record<string, unknown> | undefined, ...keys: string[]) {
  if (!record) return "";
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

export default function CareerHomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const isGuest = user?.auth_provider === "guest";
  const name =
    user?.username && user.username !== "Student"
      ? user.username.split(" ")[0]
      : null;

  const [starting, setStarting] = useState<StartingPointProfile | null>(null);
  const [startingLoaded, setStartingLoaded] = useState(false);
  const [guidance, setGuidance] = useState<DataState<GuidanceReportPath | null>>(() =>
    comingSoon<GuidanceReportPath | null>(),
  );
  const [saved, setSaved] = useState<DataState<SavedItem[]>>(() =>
    comingSoon<SavedItem[]>(),
  );
  const realGuidance = guidance.status === "real" ? guidance.data : null;
  const guidanceUserType = recordText(realGuidance?.path.academicContext, "userType") as UserType | "";
  const resumeProfile = starting ?? (realGuidance ? {
    userType: guidanceUserType || "student",
    ssClass: recordText(realGuidance.path.academicContext, "class") as StartingPointProfile["ssClass"],
    stream: recordText(realGuidance.path.academicContext, "stream") as StartingPointProfile["stream"],
  } : null);
  const nextAction = resumeProfile ? nextStartingPointAction(resumeProfile, realGuidance) : null;

  useEffect(() => {
    let active = true;
    (async () => {
      const [sp, items] = await Promise.all([
        getStartingPoint(user?.id),
        careerData.getSavedItems(),
      ]);
      const path = await careerData.getGuidancePath();
      if (!active) return;
      setStarting(sp);
      setStartingLoaded(true);
      setSaved(items);
      setGuidance(path);
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
  const earlySecondary = starting?.userType === "senior_secondary" &&
    (starting.ssClass === "ss1" || starting.ssClass === "ss2");
  const activeProgrammes = realGuidance?.path.programmes?.length
    ? realGuidance.path.programmes
    : realGuidance?.path.programme
      ? [realGuidance.path.programme]
      : [];
  const activeProgrammeNames = activeProgrammes
    .map((programme) => recordText(programme, "name", "programmeName", "jambName"))
    .filter(Boolean);
  const activeUniversityName = recordText(realGuidance?.path.university, "name", "universityName", "schoolName");
  const activeUniversityAddress = recordText(realGuidance?.path.university, "address", "schoolAddress", "location");
  const activeDomainNames = (realGuidance?.path.domains ?? [])
    .map((domain) => recordText(domain, "name", "domainName", "label"))
    .filter(Boolean);
  const activeSubgroupNames = (realGuidance?.path.subgroups ?? [])
    .map((subgroup) => recordText(subgroup, "name", "subgroupName", "label"))
    .filter(Boolean);
  const activeRoleNames = (realGuidance?.path.roles ?? [])
    .map((role) => recordText(role, "name", "roleName", "label"))
    .filter(Boolean);
  const activeSubjects = [
    ...(realGuidance?.path.subjects?.olevel ?? []),
    ...(realGuidance?.path.subjects?.utme ?? []),
  ];
  const homeQuickActions = earlySecondary
    ? QUICK.filter((item) => item.title !== "Entrepreneurship" && item.title !== "Opportunities")
    : QUICK;

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

      {realGuidance && (
        activeProgrammeNames.length || activeUniversityName || activeDomainNames.length ||
        activeSubgroupNames.length || activeRoleNames.length || activeSubjects.length
      ) ? (
        <View style={[styles.contextCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.contextTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
            Your saved guidance
          </Text>
          {activeProgrammeNames.length ? (
            <Text style={[styles.contextMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Programme{activeProgrammeNames.length > 1 ? "s" : ""}: {activeProgrammeNames.join(", ")}
            </Text>
          ) : null}
          {activeUniversityName ? (
            <Text style={[styles.contextMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
              University: {activeUniversityName}{activeUniversityAddress ? ` · ${activeUniversityAddress}` : ""}
            </Text>
          ) : null}
          {activeSubjects.length ? (
            <Text style={[styles.contextMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Subjects: {activeSubjects.join(", ")}
            </Text>
          ) : null}
          {activeDomainNames.length ? (
            <Text style={[styles.contextMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Domains: {activeDomainNames.join(", ")}
            </Text>
          ) : null}
          {activeSubgroupNames.length ? (
            <Text style={[styles.contextMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Subgroups: {activeSubgroupNames.join(", ")}
            </Text>
          ) : null}
          {activeRoleNames.length ? (
            <Text style={[styles.contextMeta, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Roles: {activeRoleNames.join(", ")}
            </Text>
          ) : null}
          <TouchableOpacity activeOpacity={0.7} onPress={() => nextAction && router.push(nextAction.href as any)}>
            <Text style={[styles.cardLinkText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
              {earlySecondary ? "Continue" : "Open saved guidance"}
            </Text>
          </TouchableOpacity>
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
              onPress={() => router.push(isGuest ? "/(auth)/signup" : "/(auth)/onboarding?restart=1")}
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
          onPress={() => router.push(isGuest ? "/(auth)/signup" : "/(auth)/onboarding?restart=1")}
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
              : "Complete a quick onboarding so we can tailor programmes, subjects and guidance to you."}
          </Text>
          <Text style={[styles.cardLinkText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
            {isGuest ? "Create account" : "Start onboarding"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Your saved paths */}
      <Text style={[styles.section, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        Saved paths
      </Text>
      <DataStateView
        state={saved.data ? filterDomainsRoles(saved.data) : saved}
        empty={(rows) => rows.length === 0}
        emptyTitle="Nothing saved yet"
        emptyBody="Save programmes, domains or roles to return to them here."
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
        {homeQuickActions.map((q, i) => (
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
  contextCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  contextTitle: { fontSize: FontSize.md },
  contextMeta: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
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

