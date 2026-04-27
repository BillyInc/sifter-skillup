import React, { useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FontSize, FontWeight, Radius, Shadow, Spacing, useTheme } from '../theme';
import { streakEngine, type StreakStatus } from '../lib/StreakEngine';

function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.statSub, { color: colors.textSoft }]}>{sub}</Text>
    </View>
  );
}

export default function StreaksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [status, setStatus] = useState<StreakStatus | null>(null);

  const load = useCallback(async () => {
    setStatus(await streakEngine.status());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const stateTone = status?.isLost ? colors.red : status?.isAtRisk ? colors.orange : colors.xpGreen;
  const headline = status?.isLost
    ? 'Your streak expired, but your progress is still here.'
    : status?.isAtRisk
      ? `Your streak is at risk for the next ${Math.max(1, Math.ceil(status.hoursLeft))} hour(s).`
      : 'Your consistency is compounding into real progress.';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
          <View style={[styles.heroBadge, { backgroundColor: stateTone + '18' }]}>
            <Text style={[styles.heroBadgeText, { color: stateTone }]}>Streaks</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Consistency keeps your islands moving.</Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>{headline}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Current"
            value={`${status?.streak ?? 0} days`}
            sub={status?.completedToday ? 'Lesson done today' : 'A lesson today keeps it alive'}
            tone={colors.orange}
          />
          <StatCard
            label="Longest"
            value={`${status?.longestStreak ?? 0} days`}
            sub="Best run so far"
            tone={colors.accent}
          />
          <StatCard
            label="Hours Left"
            value={`${Math.max(0, Math.ceil(status?.hoursLeft ?? 0))}`}
            sub={status?.completedToday ? 'Already safe today' : 'Until midnight local time'}
            tone={stateTone}
          />
          <StatCard
            label="Active Days"
            value={`${status?.totalDaysActive ?? 0}`}
            sub="Days with recorded learning activity"
            tone={colors.gold}
          />
        </View>

        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
          <Text style={[styles.panelEyebrow, { color: colors.textMuted }]}>TODAY</Text>
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            {status?.completedToday ? 'You already protected today’s streak.' : 'Today still counts.'}
          </Text>
          <Text style={[styles.panelBody, { color: colors.textSoft }]}>
            {status?.completedToday
              ? 'You can still keep building XP, but your streak is already locked in for today.'
              : 'Complete a lesson, lab, or boss-level action before midnight to keep the streak rolling.'}
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
          <Text style={[styles.panelEyebrow, { color: colors.textMuted }]}>SAFETY NETS</Text>
          <Text style={[styles.panelTitle, { color: colors.text }]}>Available streak freezes</Text>
          <Text style={[styles.freezeCount, { color: colors.text }]}>{status?.freezesAvailable ?? 0}</Text>
          <Text style={[styles.panelBody, { color: colors.textSoft }]}>
            Freeze support is tracked live by the streak engine. If you miss a day without a freeze, the streak resets but your XP does not.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/map/island')}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.primaryBtnText}>Continue Learning</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/feed')}
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Open Feed</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  hero: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  heroBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  statsGrid: {
    gap: Spacing.sm,
  },
  statCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 4,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  statSub: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  panel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  panelEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  panelBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  freezeCount: {
    fontSize: 34,
    fontWeight: FontWeight.black,
    lineHeight: 38,
  },
  actions: {
    gap: Spacing.sm,
  },
  primaryBtn: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  secondaryBtn: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
