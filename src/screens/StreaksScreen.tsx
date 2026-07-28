/**
 * StreaksScreen — reframed as "Consistency" (NOT gamey).
 *
 * Calendar heat-map in cobalt washes, current run counter in mono display
 * numerals, gentle urgency banner. Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FontSize, Radius, Shadow, Spacing, useTheme, CompassFonts, webContainer } from '../theme';
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
    <View style={[styles.statCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
      <Text style={[styles.statLabel, { color: colors.textRole.muted }, CompassFonts.body]}>{label}</Text>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={[styles.statSub, { color: colors.textRole.secondary }, CompassFonts.body]}>{sub}</Text>
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

  const stateTone = status?.isLost ? colors.accentRole.danger : status?.isAtRisk ? colors.accentRole.warning : colors.accentRole.success;
  const headline = status?.isLost
    ? 'Your consistency record expired, but your progress is still here.'
    : status?.isAtRisk
      ? `Your consistency is at risk for the next ${Math.max(1, Math.ceil(status.hoursLeft))} hour(s).`
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
          <View style={[styles.heroBadge, { backgroundColor: stateTone + '18' }]}>
            <Text style={[styles.heroBadgeText, { color: stateTone }]}>Consistency</Text>
          </View>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{`Consistency keeps your ${learningSurface} moving.`}</Text>
          <Text style={[styles.subtitle, { color: colors.textRole.secondary }, CompassFonts.body]}>{headline}</Text>
        </View>

        <View style={[styles.topGrid, isWide && styles.topGridWide]}>
          <View style={[styles.topGridMain, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.bigGlyph, { color: colors.accentRole.action }]}>*</Text>
            <Text style={[styles.bigNumber, { color: colors.accentRole.action }]}>{status?.streak ?? 0}</Text>
            <Text style={[styles.bigLabel, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Day Consistency</Text>
            <Text style={[styles.bigSub, { color: colors.textRole.secondary }, CompassFonts.body]}>Longest: {status?.longestStreak ?? 0} days</Text>
          </View>

          <View style={[styles.topGridPanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>This Week</Text>
            <View style={styles.weekRow}>
              {week.map(day => (
                <View key={day.label} style={styles.weekDay}>
                  <View
                    style={[
                      styles.weekDot,
                      {
                        backgroundColor: day.done ? colors.accentRole.action : colors.surface.subtle,
                        borderColor: day.today ? colors.accentRole.action : colors.borderRole.subtle,
                      },
                    ]}
                  >
                    <Text style={[styles.weekDotText, { color: day.done ? colors.textRole.inverse : colors.textRole.muted }]}>
                      {day.done ? '*' : '.'}
                    </Text>
                  </View>
                  <Text style={[styles.weekLabel, { color: day.today ? colors.textRole.primary : colors.textRole.muted }, CompassFonts.body]}>{day.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.weekSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>{weeklyDone}/7 days active this week</Text>
          </View>

          <View style={[styles.topGridPanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Rewards</Text>
            <View style={styles.rewardList}>
              {rewardMilestones.map((reward, index) => (
                <View
                  key={reward.days}
                  style={[
                    styles.rewardRow,
                    { borderBottomColor: index < rewardMilestones.length - 1 ? colors.borderRole.subtle : 'transparent' },
                  ]}
                >
                  <View>
                    <Text style={[styles.rewardName, { color: reward.done ? colors.textRole.primary : colors.textRole.muted }, CompassFonts.body]}>{reward.reward}</Text>
                    <Text style={[styles.rewardSub, { color: colors.textRole.muted }, CompassFonts.body]}>{reward.days} day consistency</Text>
                  </View>
                  <Text style={[styles.rewardStatus, { color: reward.done ? colors.accentRole.success : colors.textRole.muted }]}>
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
            tone={colors.accentRole.action}
          />
          <StatCard
            label="Longest"
            value={`${status?.longestStreak ?? 0} days`}
            sub="Best run so far"
            tone={colors.accentRole.status}
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
            tone={colors.accentRole.success}
          />
        </View>

        <View style={[styles.bottomGrid, isWide && styles.bottomGridWide]}>
          <View style={[styles.panel, styles.flexPanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.panelEyebrow, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>TODAY</Text>
            <Text style={[styles.panelTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
              {status?.completedToday ? "Today's consistency is protected." : 'Today still counts.'}
            </Text>
            <Text style={[styles.panelBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              {status?.completedToday
                ? 'You can keep building XP, but your consistency is already locked in for today.'
                : 'Complete a lesson, lab, or boss-level action before midnight to keep the consistency rolling.'}
            </Text>
          </View>

          <View style={[styles.panel, styles.flexPanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.panelEyebrow, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>SAFETY NETS</Text>
            <Text style={[styles.panelTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Available consistency freezes</Text>
            <Text style={[styles.freezeCount, { color: colors.textRole.primary }]}>{status?.freezesAvailable ?? 0}</Text>
            <Text style={[styles.panelBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Freeze support is tracked live by the consistency engine. If you miss a day without a freeze, the consistency resets but your XP does not.
            </Text>
          </View>

          <View style={[styles.panel, styles.flexPanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.panelEyebrow, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>WORKSPACE</Text>
            <Text style={[styles.panelTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{trackContext.mode === 'track' ? trackContext.trackName : 'General learning'}</Text>
            <Text style={[styles.panelBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              {trackContext.mode === 'track'
                ? `Keep your ${trackContext.trackName} momentum moving and protect the consistency in the same loop.`
                : 'Choose an active track to connect consistency progress with a specific workspace.'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(continueHref as any)}
            style={[styles.primaryBtn, { backgroundColor: colors.accentRole.action }]}
          >
            <Text style={styles.primaryBtnText}>{continueLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/feed')}
            style={[styles.secondaryBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textRole.primary }, CompassFonts.body]}>Open Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/merchandise')}
            style={[styles.secondaryBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.textRole.primary }, CompassFonts.body]}>Redeem Merch</Text>
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSize.xl,
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
    fontSize: 18,
    lineHeight: 22,
  },
  bigNumber: {
    fontSize: 18,
    lineHeight: 22,
  },
  bigLabel: {
    fontSize: FontSize.md,
  },
  bigSub: {
    fontSize: FontSize.sm,
  },
  sectionTitle: {
    fontSize: 13,
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
  },
  weekLabel: {
    fontSize: 10,
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
  },
  rewardSub: {
    fontSize: 10,
    marginTop: 2,
  },
  rewardStatus: {
    fontSize: 11,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: FontSize.xl,
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 13,
    marginBottom: 10,
  },
  panelBody: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  freezeCount: {
    fontSize: 18,
    lineHeight: 22,
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
  },
});
