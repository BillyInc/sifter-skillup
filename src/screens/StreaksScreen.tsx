import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FontSize, FontWeight, Radius, Shadow, Spacing, useTheme, webContainer } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { streakEngine, type StreakStatus } from '../lib/StreakEngine';
import { resolveTrackContext } from '../lib/trackContext';

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
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [status, setStatus] = useState<StreakStatus | null>(null);
  const trackContext = useMemo(() => resolveTrackContext(user), [user]);
  const continueHref = trackContext.mode === 'track' ? trackContext.continueHref : '/(tabs)/fields';
  const continueLabel = trackContext.mode === 'track' ? trackContext.continueLabel : 'Continue Learning';
  const learningSurface = trackContext.mode === 'track' && !trackContext.continueHref.includes('/map/island')
    ? 'track'
    : 'islands';

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
  const isWide = width >= 920;

  const week = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const doneCount = status?.completedToday
      ? Math.min(status.streak, currentIndex + 1)
      : Math.min(status?.streak ?? 0, currentIndex);

    return labels.map((label, index) => ({
      label,
      done: index < doneCount,
      today: index === currentIndex,
    }));
  }, [status]);

  const rewardMilestones = useMemo(() => {
    const streak = status?.streak ?? 0;
    return [
      { days: 7, reward: 'Freeze Shield', done: streak >= 7 },
      { days: 14, reward: 'XP Boost x2', done: streak >= 14 },
      { days: 30, reward: 'Rare Badge', done: streak >= 30 },
      { days: 60, reward: 'Elite Status', done: streak >= 60 },
    ];
  }, [status]);

  const weeklyDone = week.filter(day => day.done).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
          <View style={[styles.heroBadge, { backgroundColor: stateTone + '18' }]}>
            <Text style={[styles.heroBadgeText, { color: stateTone }]}>Streaks</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{`Consistency keeps your ${learningSurface} moving.`}</Text>
          <Text style={[styles.subtitle, { color: colors.textSoft }]}>{headline}</Text>
        </View>

        <View style={[styles.topGrid, isWide && styles.topGridWide]}>
          <View style={[styles.topGridMain, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <Text style={[styles.bigGlyph, { color: colors.orange }]}>*</Text>
            <Text style={[styles.bigNumber, { color: colors.orange }]}>{status?.streak ?? 0}</Text>
            <Text style={[styles.bigLabel, { color: colors.text }]}>Day Streak</Text>
            <Text style={[styles.bigSub, { color: colors.textSoft }]}>Longest: {status?.longestStreak ?? 0} days</Text>
          </View>

          <View style={[styles.topGridPanel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
            <View style={styles.weekRow}>
              {week.map(day => (
                <View key={day.label} style={styles.weekDay}>
                  <View
                    style={[
                      styles.weekDot,
                      {
                        backgroundColor: day.done ? colors.orange : colors.bgSecondary,
                        borderColor: day.today ? colors.orange : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.weekDotText, { color: day.done ? '#fff' : colors.textMuted }]}>
                      {day.done ? '*' : '.'}
                    </Text>
                  </View>
                  <Text style={[styles.weekLabel, { color: day.today ? colors.text : colors.textMuted }]}>{day.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.weekSummary, { color: colors.textSoft }]}>{weeklyDone}/7 days active this week</Text>
          </View>

          <View style={[styles.topGridPanel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Rewards</Text>
            <View style={styles.rewardList}>
              {rewardMilestones.map((reward, index) => (
                <View
                  key={reward.days}
                  style={[
                    styles.rewardRow,
                    { borderBottomColor: index < rewardMilestones.length - 1 ? colors.border : 'transparent' },
                  ]}
                >
                  <View>
                    <Text style={[styles.rewardName, { color: reward.done ? colors.text : colors.textMuted }]}>{reward.reward}</Text>
                    <Text style={[styles.rewardSub, { color: colors.textMuted }]}>{reward.days} day streak</Text>
                  </View>
                  <Text style={[styles.rewardStatus, { color: reward.done ? colors.xpGreen : colors.textMuted }]}>
                    {reward.done ? 'OK' : 'LOCK'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
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

        <View style={[styles.bottomGrid, isWide && styles.bottomGridWide]}>
          <View style={[styles.panel, styles.flexPanel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <Text style={[styles.panelEyebrow, { color: colors.textMuted }]}>TODAY</Text>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              {status?.completedToday ? "Today's streak is protected." : 'Today still counts.'}
            </Text>
            <Text style={[styles.panelBody, { color: colors.textSoft }]}>
              {status?.completedToday
                ? 'You can keep building XP, but your streak is already locked in for today.'
                : 'Complete a lesson, lab, or boss-level action before midnight to keep the streak rolling.'}
            </Text>
          </View>

          <View style={[styles.panel, styles.flexPanel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <Text style={[styles.panelEyebrow, { color: colors.textMuted }]}>SAFETY NETS</Text>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Available streak freezes</Text>
            <Text style={[styles.freezeCount, { color: colors.text }]}>{status?.freezesAvailable ?? 0}</Text>
            <Text style={[styles.panelBody, { color: colors.textSoft }]}>
              Freeze support is tracked live by the streak engine. If you miss a day without a freeze, the streak resets but your XP does not.
            </Text>
          </View>

          <View style={[styles.panel, styles.flexPanel, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
            <Text style={[styles.panelEyebrow, { color: colors.textMuted }]}>WORKSPACE</Text>
            <Text style={[styles.panelTitle, { color: colors.text }]}>{trackContext.mode === 'track' ? trackContext.trackName : 'General learning'}</Text>
            <Text style={[styles.panelBody, { color: colors.textSoft }]}>
              {trackContext.mode === 'track'
                ? `Keep your ${trackContext.trackName} momentum moving and protect the streak in the same loop.`
                : 'Choose an active track to connect streak progress with a specific workspace.'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(continueHref as any)}
            style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
          >
            <Text style={styles.primaryBtnText}>{continueLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/feed')}
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Open Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/merchandise')}
            style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Redeem Merch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    ...webContainer,
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
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '700',
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
  topGrid: {
    gap: Spacing.sm,
  },
  topGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  topGridMain: {
    flex: 1,
    minHeight: 220,
    borderRadius: 11,
    borderWidth: 1,
    padding: Platform.OS === 'web' ? 14 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  topGridPanel: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    padding: Platform.OS === 'web' ? 14 : 12,
    gap: Spacing.sm,
  },
  bigGlyph: {
    fontSize: 42,
    fontWeight: FontWeight.black,
    lineHeight: 48,
  },
  bigNumber: {
    fontSize: 44,
    fontWeight: FontWeight.black,
    lineHeight: 48,
  },
  bigLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.black,
  },
  bigSub: {
    fontSize: FontSize.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  weekDotText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  weekLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  weekSummary: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  rewardList: {
    gap: 0,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  rewardName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  rewardSub: {
    fontSize: 10,
    marginTop: 2,
  },
  rewardStatus: {
    fontSize: 11,
    fontWeight: FontWeight.black,
  },
  statsGrid: {
    gap: Spacing.sm,
  },
  statCard: {
    borderRadius: 11,
    borderWidth: 1,
    padding: Platform.OS === 'web' ? 14 : 12,
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
  bottomGrid: {
    gap: Spacing.sm,
  },
  bottomGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  panel: {
    borderRadius: 11,
    borderWidth: 1,
    padding: Platform.OS === 'web' ? 14 : 12,
    gap: Spacing.sm,
  },
  flexPanel: {
    flex: 1,
  },
  panelEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
