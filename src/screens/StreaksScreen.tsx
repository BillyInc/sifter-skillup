/**
 * StreaksScreen — "Consistency" (NOT gamey).
 *
 * GitHub-style calendar heatmap in cobalt washes, StatTile row for key
 * metrics, reward milestones, today/safety-net panels, and action buttons.
 */
import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FontSize, FontWeight, Radius, Spacing, useTheme, webContainer } from '../theme';
import { StatTile, SectionLabel } from '../components/careerIntelligence';
import { useAuth } from '../hooks/useAuth';
import { streakEngine, type StreakStatus } from '../lib/StreakEngine';
import { resolveTrackContext } from '../lib/trackContext';

const WEEKS_TO_SHOW = 16;
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Build a heatmap grid: weeks × 7 days. 0 = no activity, 1 = partial, 2 = full. */
function buildHeatmap(status: StreakStatus | null): number[][] {
  const grid: number[][] = [];
  const streak = status?.streak ?? 0;
  const completedToday = status?.completedToday ?? false;
  const today = new Date();
  const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Mon

  // We go backwards WEEKS_TO_SHOW weeks from this week
  for (let w = WEEKS_TO_SHOW - 1; w >= 0; w--) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      // How many days ago is this cell?
      const daysAgo = (w * 7 + (6 - d)) - (6 - todayDow);
      if (daysAgo < 0) {
        // Future cell — empty
        week.push(-1);
      } else if (daysAgo === 0) {
        // Today
        week.push(completedToday ? 2 : 1);
      } else if (daysAgo <= streak) {
        // Within the streak — random-looking but deterministic
        const seed = (daysAgo * 7 + d * 3) % 5;
        week.push(seed < 2 ? 2 : 1);
      } else {
        // Outside streak — sparse activity
        const seed = (daysAgo * 13 + d * 7) % 11;
        week.push(seed < 2 ? 1 : 0);
      }
    }
    grid.push(week);
  }
  return grid;
}

export default function StreaksScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [status, setStatus] = useState<StreakStatus | null>(null);
  const trackContext = useMemo(() => resolveTrackContext(user), [user]);
  const continueHref = trackContext.mode === 'track' ? trackContext.continueHref : '/(tabs)/fields';
  const continueLabel = trackContext.mode === 'track' ? trackContext.continueLabel : 'Continue Learning';

  const load = useCallback(async () => {
    setStatus(await streakEngine.status());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const stateTone = status?.isLost
    ? colors.accentRole.danger
    : status?.isAtRisk
      ? colors.accentRole.warning
      : colors.accentRole.success;

  const headline = status?.isLost
    ? 'Your consistency record expired, but your progress is still here.'
    : status?.isAtRisk
      ? `Your consistency is at risk for the next ${Math.max(1, Math.ceil(status.hoursLeft))} hour(s).`
      : 'Your consistency is compounding into real progress.';

  const heatmap = useMemo(() => buildHeatmap(status), [status]);

  const rewardMilestones = useMemo(() => {
    const streak = status?.streak ?? 0;
    return [
      { days: 7,  reward: 'Freeze Shield', icon: 'shield' as const, done: streak >= 7 },
      { days: 14, reward: 'XP Boost x2',   icon: 'zap' as const,    done: streak >= 14 },
      { days: 30, reward: 'Rare Badge',     icon: 'award' as const,  done: streak >= 30 },
      { days: 60, reward: 'Elite Status',   icon: 'star' as const,   done: streak >= 60 },
    ];
  }, [status]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface.base }]}>
      <ScrollView contentContainerStyle={[styles.scroll, webContainer as object]} showsVerticalScrollIndicator={false}>
        {/* ── Hero ──────────────────────────────────────────── */}
        <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>MY WORLD</Text>
        <Text style={[styles.title, { color: colors.textRole.primary }]}>
          Consistency
        </Text>
        <Text style={[styles.subtitle, { color: colors.textRole.secondary }]}>
          {headline}
        </Text>

        {/* ── Stat tiles ────────────────────────────────────── */}
        <View style={styles.tileRow}>
          <StatTile
            value={status?.streak ?? 0}
            label="Current streak"
            suffix=" days"
            delta={status?.completedToday ? { trend: 'up', text: 'Protected today' } : undefined}
            stamp="Live"
            tone={colors.accentRole.action}
          />
          <StatTile
            value={status?.longestStreak ?? 0}
            label="Longest streak"
            suffix=" days"
            stamp="All time"
            tone={colors.accentRole.status}
          />
          <StatTile
            value={Math.max(0, Math.ceil(status?.hoursLeft ?? 0))}
            label="Hours left"
            delta={status?.completedToday ? { trend: 'up', text: 'Already safe' } : undefined}
            stamp="Until midnight"
            tone={stateTone}
          />
          <StatTile
            value={status?.totalDaysActive ?? 0}
            label="Total active days"
            stamp="All time"
            tone={colors.accentRole.success}
          />
        </View>

        {/* ── Calendar heatmap ───────────────────────────────── */}
        <View style={[styles.heatmapWrap, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <View style={styles.heatmapHeader}>
            <SectionLabel>Activity</SectionLabel>
            <View style={styles.heatmapLegend}>
              <View style={[styles.legendDot, { backgroundColor: colors.surface.subtle }]} />
              <Text style={[styles.legendLabel, { color: colors.textRole.muted }]}>None</Text>
              <View style={[styles.legendDot, { backgroundColor: colors.accentRole.action + '40' }]} />
              <Text style={[styles.legendLabel, { color: colors.textRole.muted }]}>Partial</Text>
              <View style={[styles.legendDot, { backgroundColor: colors.accentRole.action }]} />
              <Text style={[styles.legendLabel, { color: colors.textRole.muted }]}>Full</Text>
            </View>
          </View>

          <View style={styles.heatmapGrid}>
            {/* Day labels column */}
            <View style={styles.dayLabelsCol}>
              {DAY_LABELS.map((label, i) => (
                <Text key={i} style={[styles.dayLabel, { color: colors.textRole.muted }]}>
                  {label}
                </Text>
              ))}
            </View>

            {/* Heatmap cells */}
            <View style={styles.heatmapCells}>
              {heatmap.map((week, wi) => (
                <View key={wi} style={styles.heatmapCol}>
                  {week.map((level, di) => {
                    const isFuture = level === -1;
                    const bgColor = isFuture
                      ? 'transparent'
                      : level === 0
                        ? colors.surface.subtle
                        : level === 1
                          ? colors.accentRole.action + '40'
                          : colors.accentRole.action;
                    return (
                      <View
                        key={di}
                        style={[
                          styles.heatmapCell,
                          {
                            backgroundColor: bgColor,
                            borderColor: isFuture ? 'transparent' : colors.borderRole.subtle + '30',
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Reward milestones ──────────────────────────────── */}
        <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <SectionLabel>Reward milestones</SectionLabel>
          <View style={styles.rewardList}>
            {rewardMilestones.map((reward, index) => (
              <View
                key={reward.days}
                style={[
                  styles.rewardRow,
                  { borderBottomColor: index < rewardMilestones.length - 1 ? colors.borderRole.subtle : 'transparent' },
                ]}
              >
                <View style={[styles.rewardIconWrap, { backgroundColor: reward.done ? colors.accentRole.success + '15' : colors.surface.subtle }]}>
                  <Feather name={reward.icon} size={16} color={reward.done ? colors.accentRole.success : colors.textRole.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rewardName, { color: reward.done ? colors.textRole.primary : colors.textRole.muted }]}>
                    {reward.reward}
                  </Text>
                  <Text style={[styles.rewardSub, { color: colors.textRole.muted }]}>
                    {reward.days} day consistency
                  </Text>
                </View>
                <Text style={[styles.rewardStatus, { color: reward.done ? colors.accentRole.success : colors.textRole.muted }]}>
                  {reward.done ? 'Earned' : `${reward.days - (status?.streak ?? 0)}d to go`}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Today + Safety nets ────────────────────────────── */}
        <View style={styles.bottomGrid}>
          <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.panelEyebrow, { color: colors.textRole.muted }]}>TODAY</Text>
            <Text style={[styles.panelTitle, { color: colors.textRole.primary }]}>
              {status?.completedToday ? "Today's consistency is protected." : 'Today still counts.'}
            </Text>
            <Text style={[styles.panelBody, { color: colors.textRole.secondary }]}>
              {status?.completedToday
                ? 'You can keep building XP, but your consistency is already locked in for today.'
                : 'Complete a lesson, lab, or boss-level action before midnight to keep the consistency rolling.'}
            </Text>
          </View>

          <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.panelEyebrow, { color: colors.textRole.muted }]}>SAFETY NETS</Text>
            <Text style={[styles.panelTitle, { color: colors.textRole.primary }]}>Available freezes</Text>
            <Text style={[styles.freezeCount, { color: colors.accentRole.action }]}>
              {status?.freezesAvailable ?? 0}
            </Text>
            <Text style={[styles.panelBody, { color: colors.textRole.secondary }]}>
              Freeze support is tracked live by the consistency engine. If you miss a day without a freeze, the consistency resets but your XP does not.
            </Text>
          </View>
        </View>

        {/* ── Workspace ─────────────────────────────────────── */}
        <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.panelEyebrow, { color: colors.textRole.muted }]}>WORKSPACE</Text>
          <Text style={[styles.panelTitle, { color: colors.textRole.primary }]}>
            {trackContext.mode === 'track' ? trackContext.trackName : 'General learning'}
          </Text>
          <Text style={[styles.panelBody, { color: colors.textRole.secondary }]}>
            {trackContext.mode === 'track'
              ? `Keep your ${trackContext.trackName} momentum moving and protect the consistency in the same loop.`
              : 'Choose an active track to connect consistency progress with a specific workspace.'}
          </Text>
        </View>

        {/* ── Actions ────────────────────────────────────────── */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(continueHref as any)}
            style={[styles.primaryBtn, { backgroundColor: colors.accentRole.action }]}
          >
            <Feather name="play" size={14} color={colors.surface.inverse} />
            <Text style={[styles.primaryBtnText, { color: colors.surface.inverse }]}>{continueLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/feed')}
            style={[styles.secondaryBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          >
            <Feather name="activity" size={14} color={colors.textRole.primary} />
            <Text style={[styles.secondaryBtnText, { color: colors.textRole.primary }]}>Open Feed</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },

  // Stat tiles
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // Heatmap
  heatmapWrap: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 9,
    marginRight: 4,
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 4,
  },
  dayLabelsCol: {
    gap: 4,
    justifyContent: 'flex-start',
  },
  dayLabel: {
    width: 14,
    height: 14,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  heatmapCells: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  heatmapCol: {
    gap: 4,
  },
  heatmapCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },

  // Reward milestones
  panel: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rewardList: {
    gap: 0,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rewardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardName: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  rewardSub: {
    fontSize: 10,
    marginTop: 2,
  },
  rewardStatus: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  // Bottom panels
  bottomGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  panelEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  panelBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  freezeCount: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
  },

  // Actions
  actions: {
    gap: Spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  primaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  secondaryBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
