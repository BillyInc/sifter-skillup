/**
 * CareerHomeScreen — the personalised returning-user Home (Mockup Part 7).
 *
 * A snapshot of where the user is starting from, their subscribed opportunity
 * alerts, the domains/roles they've saved, and quick actions into the live
 * areas. Every data-backed section reads through `careerData`, which returns
 * `coming_soon` envelopes for now — rendered gracefully via <DataStateView>.
 * No mock rows are invented; sections degrade to friendly prompts.
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
  webContainer,
} from "../theme";
import { useAuth } from "../hooks/useAuth";
import { LevelUpLogo } from "../components/brand/LevelUpLogo";
import { DataStateView } from "../components/careerIntelligence";
import { careerData } from "../lib/careerData";
import { getStartingPoint } from "../lib/startingPoint";
import {
  comingSoon,
  type DataState,
  type SavedItem,
  type Subscription,
} from "../types/career";
import type { StartingPointProfile, UserType } from "../types/onboarding";

const QUICK = [
  {
    icon: "🔍",
    title: "Explore programmes",
    body: "Domains, roles and skills your programme unlocks",
    href: "/(tabs)/explore" as const,
    locked: false,
  },
  {
    icon: "🌍",
    title: "Opportunities",
    body: "Internships & jobs — local, global, remote",
    href: "/(tabs)/opportunities" as const,
    locked: false,
  },
  {
    icon: "⭐",
    title: "Elite & special pathways",
    body: "Aspirational routes & every starting point",
    href: "/(tabs)/explore/elite" as const,
    locked: false,
  },
  {
    icon: "🔒",
    title: "My World",
    body: "Tracks & portfolio — coming soon",
    href: "/(tabs)/myworld" as const,
    locked: true,
  },
  {
    icon: "👤",
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
  return bits.length ? bits.join(" · ") : "Profile saved";
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
  const [alerts, setAlerts] = useState<DataState<Subscription[]>>(() =>
    comingSoon<Subscription[]>(),
  );
  const [saved, setSaved] = useState<DataState<SavedItem[]>>(() =>
    comingSoon<SavedItem[]>(),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const [sp, subs, items] = await Promise.all([
        getStartingPoint(),
        careerData.getSubscriptions(),
        careerData.getSavedItems(),
      ]);
      if (!active) return;
      setStarting(sp);
      setStartingLoaded(true);
      setAlerts(subs);
      setSaved(items);
    })();
    return () => {
      active = false;
    };
  }, []);

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
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <LevelUpLogo size={48} />
        <View style={{ flex: 1 }}>
          {name ? (
            <>
              <Text style={[styles.hi, { color: colors.textMuted }]}>
                Welcome back,
              </Text>
              <Text style={[styles.brand, { color: colors.text }]}>{name}</Text>
            </>
          ) : (
            <>
              <Text style={[styles.hi, { color: colors.textMuted }]}>
                Welcome to
              </Text>
              <Text style={[styles.brand, { color: colors.text }]}>
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
              backgroundColor: colors.goldSoft,
              borderColor: `${Brand.primary}40`,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: Brand.primaryDeep }]}>
            You're browsing as a guest. Create an account to save matches and
            get opportunity alerts.
          </Text>
        </View>
      ) : null}

      {/* ── Your starting point ── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>
        Your starting point
      </Text>
      {!startingLoaded ? null : starting ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardEyebrow, { color: Brand.primaryDeep }]}>
            {USER_TYPE_LABEL[starting.userType]}
          </Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            {summariseStartingPoint(starting)}
          </Text>
          {starting.regions?.length || starting.workTypes?.length ? (
            <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
              {[
                starting.regions?.length
                  ? starting.regions.join(", ")
                  : undefined,
                starting.workTypes?.length
                  ? starting.workTypes.join(", ")
                  : undefined,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.cardLink}
            onPress={() => router.push("/(auth)/onboarding")}
          >
            <Text style={[styles.cardLinkText, { color: Brand.primaryDeep }]}>
              Update →
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/(auth)/onboarding")}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={styles.promptIcon}>🧭</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Tell us where you're starting from
          </Text>
          <Text style={[styles.cardMeta, { color: colors.textSoft }]}>
            Complete a quick onboarding so we can tailor programmes, domains and
            opportunities to you.
          </Text>
          <Text style={[styles.cardLinkText, { color: Brand.primaryDeep }]}>
            Start onboarding →
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Opportunity alerts ── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>
        Opportunity alerts
      </Text>
      <DataStateView
        state={alerts}
        empty={(rows) => rows.length === 0}
        emptyTitle="No alerts yet"
        emptyBody="Subscribe to opportunities to get alerts here."
      >
        {(rows) => (
          <View style={styles.list}>
            {rows.map((s) => (
              <View
                key={s.id}
                style={[
                  styles.row,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={styles.rowIcon}>🔔</Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.rowTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {s.target.replace(/_/g, " ")}
                  </Text>
                  <Text
                    style={[styles.rowMeta, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {s.targetId}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </DataStateView>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.linkRow}
        onPress={() => router.push("/(tabs)/opportunities")}
      >
        <Text style={[styles.linkText, { color: Brand.primaryDeep }]}>
          Browse opportunities →
        </Text>
      </TouchableOpacity>

      {/* ── Your domains ── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>
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
            {rows.map((it) => (
              <View
                key={it.id}
                style={[
                  styles.row,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={styles.rowIcon}>
                  {it.entityType === "role" ? "🧩" : "🗺️"}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.rowTitle, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {it.label ?? it.entityId}
                  </Text>
                  <Text
                    style={[styles.rowMeta, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {it.entityType === "role" ? "Role" : "Domain"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </DataStateView>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.linkRow}
        onPress={() => router.push("/(tabs)/explore")}
      >
        <Text style={[styles.linkText, { color: Brand.primaryDeep }]}>
          Explore & save domains →
        </Text>
      </TouchableOpacity>

      {/* ── Quick actions ── */}
      <Text style={[styles.section, { color: colors.textSoft }]}>
        Quick actions
      </Text>
      <View style={styles.grid}>
        {QUICK.map((q) => (
          <TouchableOpacity
            key={q.title}
            activeOpacity={0.85}
            onPress={() => router.push(q.href)}
            style={[
              styles.tile,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={styles.tileIcon}>{q.icon}</Text>
            <Text style={[styles.tileTitle, { color: colors.text }]}>
              {q.title}
            </Text>
            <Text style={[styles.tileBody, { color: colors.textMuted }]}>
              {q.body}
            </Text>
          </TouchableOpacity>
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
  hi: { fontSize: FontSize.sm, fontWeight: "600" },
  brand: { fontSize: FontSize.xxl, fontWeight: "900" },
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
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  cardMeta: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  promptIcon: { fontSize: 28 },
  cardLink: {
    minHeight: 44,
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  cardLinkText: {
    fontSize: FontSize.sm,
    fontWeight: "800",
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
  rowTitle: { fontSize: FontSize.md, fontWeight: "700" },
  rowMeta: { fontSize: FontSize.xs, marginTop: 2 },
  linkRow: {
    minHeight: 44,
    justifyContent: "center",
  },
  linkText: { fontSize: FontSize.sm, fontWeight: "800" },
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
    fontWeight: "800",
    marginTop: Spacing.xs,
  },
  tileBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});
