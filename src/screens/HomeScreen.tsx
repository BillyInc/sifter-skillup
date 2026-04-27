import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
  XP_DAILY_GOALS,
  useTheme,
  webContainer,
} from '../theme';
import { Badge, SifterButton, SifterCard } from '../components/ui';
import { WorkerCharacter, TheBolt } from '../components/CharacterSystem';
import { FieldArtwork, fieldColor } from '../components/artwork/FieldArtwork';
import { useAuth } from '../hooks/useAuth';
import { useResume } from '../hooks/useResume';
import { xpEngine, type XPSnapshot } from '../lib/XPEngine';
import { streakEngine, type StreakStatus } from '../lib/StreakEngine';
import { findTrackById, getTrackHref, resolveTrackContext } from '../lib/trackContext';
import { buildResumeHref, getResumeSummary, normaliseResumePosition } from '../lib/resumeNavigation';
import {
  GRID_GAP,
  WebCard,
  WebCol,
  WebListRow,
  WebPageHeader,
  WebRow,
  WebSectionLabel,
  WebShell,
  WebStatTile,
  useIsWebWide,
} from '../components/web/WebGrid';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StreakBanner({ status }: { status: StreakStatus }) {
  const { colors } = useTheme();
  const atRisk = (status as any).isAtRisk;
  if (!atRisk && status.streak < 2) return null;

  const backgroundColor = atRisk ? `${colors.orange}18` : `${colors.xpGreen}18`;
  const color = atRisk ? colors.orange : colors.xpGreen;
  const msg = atRisk
    ? `Streak at risk. ${(((status as any).hoursUntilLoss ?? 0) as number).toFixed(0)}h left to save it.`
    : `${status.streak}-day streak active. Keep it moving.`;

  return (
    <View style={[styles.streakBanner, { backgroundColor }]}>
      <Text style={[styles.streakBannerText, { color }]}>{msg}</Text>
    </View>
  );
}

function XPProgressBar({
  progress,
  color,
  dailyXp,
  dailyGoalTarget,
}: {
  progress: number;
  color: string;
  dailyXp: number;
  dailyGoalTarget: number;
}) {
  const { colors } = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;
  const dailyFillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: progress, duration: 650, useNativeDriver: false }).start();
    Animated.timing(dailyFillAnim, {
      toValue: Math.min(1, dailyXp / Math.max(1, dailyGoalTarget)),
      duration: 650,
      useNativeDriver: false,
    }).start();
  }, [dailyFillAnim, dailyGoalTarget, dailyXp, fillAnim, progress]);

  const width = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const dailyWidth = dailyFillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={{ gap: 6 }}>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textSoft }]}>Stage Progress</Text>
        <Text style={[styles.progressValue, { color }]}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.bgSecondary }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: color, width }]} />
      </View>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textSoft }]}>Daily Goal</Text>
        <Text style={[styles.progressValue, { color: colors.xpGreen }]}>{dailyXp} / {dailyGoalTarget} XP</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.bgSecondary }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.xpGreen, width: dailyWidth }]} />
      </View>
    </View>
  );
}

function WebMiniChart({ color, values }: { color: string; values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <View style={styles.miniChart}>
      {values.map((v, i) => (
        <View key={`${color}-${i}`} style={styles.miniChartBarWrap}>
          <View
            style={[
              styles.miniChartBar,
              {
                height: `${(v / max) * 100}%` as const,
                backgroundColor: i === values.length - 1 ? color : `${color}66`,
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function ReferenceBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.referenceBadgeWrap}>
      <Badge label={label} variant="track" color={color} size="sm" />
    </View>
  );
}

function OverviewTrackCard({
  iconLabel,
  name,
  accentColor,
  summary,
  points,
  onPress,
}: {
  iconLabel: string;
  name: string;
  accentColor: string;
  summary: string;
  points: string[];
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <WebCard accentBar accentColor={accentColor} onPress={onPress} style={styles.overviewTrackCard}>
      <View style={styles.webTrackHeader}>
        <View style={[styles.trackIconBadge, { backgroundColor: `${accentColor}14`, borderColor: `${accentColor}26` }]}>
          <Text style={[styles.trackIconBadgeText, { color: accentColor }]}>{iconLabel}</Text>
        </View>
        <Text style={[styles.webTrackName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.webTrackArrow, { color: colors.textMuted }]}>{'>'}</Text>
      </View>
      <Text style={[styles.overviewTrackSummary, { color: colors.textSoft }]}>{summary}</Text>
      <WebMiniChart color={accentColor} values={[12, 24, 21, 38, 44, 57, 63]} />
      <View style={{ marginTop: 10, gap: 4 }}>
        {points.map((point) => (
          <Text key={point} style={[styles.webTrackKey, { color: colors.textSoft }]}>{`- ${point}`}</Text>
        ))}
      </View>
      <SifterButton
        label="View Track"
        onPress={onPress}
        variant="track"
        color={accentColor}
        size="sm"
        style={styles.webTrackBtn}
      />
    </WebCard>
  );
}

function TrackHeroCard({
  accentColor,
  artFieldId,
  eyebrow,
  title,
  summary,
  focusAreas,
  continueLabel,
  chartValues,
  onContinue,
}: {
  accentColor: string;
  artFieldId: string;
  eyebrow: string;
  title: string;
  summary: string;
  focusAreas: string[];
  continueLabel: string;
  chartValues: number[];
  onContinue: () => void;
}) {
  const { colors } = useTheme();

  return (
    <WebCard noPad style={{ overflow: 'hidden' }}>
      <View style={[styles.heroPanel, { backgroundColor: colors.card }]}>
        <View style={styles.heroPanelCopy}>
          <ReferenceBadge label={eyebrow} color={accentColor} />
          <Text style={[styles.heroPanelTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.heroPanelSummary, { color: colors.textSoft }]}>{summary}</Text>
          <View style={styles.heroPanelTags}>
            {focusAreas.map((item) => (
              <View key={item} style={[styles.heroTag, { backgroundColor: colors.bgSecondary }]}>
                <Text style={[styles.heroTagText, { color: colors.textSoft }]}>{item}</Text>
              </View>
            ))}
          </View>
          <SifterButton
            label={continueLabel}
            onPress={onContinue}
            variant="track"
            color={accentColor}
            size="sm"
            fullWidth={false}
            style={styles.heroPanelBtn}
          />
        </View>

        <View style={[styles.heroPanelVisual, { backgroundColor: `${accentColor}0D` }]}>
          <FieldArtwork fieldId={artFieldId} size={154} />
          <View style={[styles.heroPanelMiniCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[styles.heroPanelMiniLabel, { color: colors.textMuted }]}>Momentum</Text>
            <WebMiniChart color={accentColor} values={chartValues} />
          </View>
        </View>
      </View>
    </WebCard>
  );
}

function StatCard({
  iconLabel,
  label,
  value,
  sub,
  color,
}: {
  iconLabel: string;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const { colors } = useTheme();
  return (
    <SifterCard style={[styles.statCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={[styles.statBadge, { backgroundColor: `${color}14`, borderColor: `${color}22` }]}>
        <Text style={[styles.statBadgeText, { color }]}>{iconLabel}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSoft }]}>{label}</Text>
      {sub ? <Text style={[styles.statSub, { color: colors.textMuted }]}>{sub}</Text> : null}
    </SifterCard>
  );
}

function QuickAction({
  iconLabel,
  label,
  sub,
  color,
  onPress,
}: {
  iconLabel: string;
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <SifterCard onPress={onPress} style={[styles.quickAction, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}14`, borderColor: `${color}22` }]}>
        <Text style={[styles.quickActionIconText, { color }]}>{iconLabel}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.quickActionSub, { color: colors.textMuted }]}>{sub}</Text>
      </View>
      <Text style={[styles.quickActionArrow, { color: colors.textMuted }]}>{'>'}</Text>
    </SifterCard>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, updateActiveField } = useAuth();
  const { lastPosition } = useResume();
  const isWebWide = useIsWebWide();
  const go = useCallback((href: string) => router.push(href as any), [router]);
  const resumePosition = useMemo(
    () => lastPosition ?? normaliseResumePosition(user?.last_position),
    [lastPosition, user?.last_position],
  );
  const trackContext = useMemo(() => resolveTrackContext(user, {
    trackId: resumePosition?.trackId,
    trackName: resumePosition?.trackName,
  }), [resumePosition?.trackId, resumePosition?.trackName, user]);
  const resumeHref = useMemo(() => buildResumeHref(resumePosition), [resumePosition]);
  const resumeSummary = useMemo(() => getResumeSummary(resumePosition), [resumePosition]);

  const [xp, setXp] = useState<XPSnapshot | null>(null);
  const [streak, setStreak] = useState<StreakStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    const [xpSnap, streakSnap] = await Promise.all([xpEngine.snapshot(), streakEngine.status()]);
    setXp(xpSnap);
    setStreak(streakSnap);
  }, []);

  useFocusEffect(useCallback(() => {
    void loadData();
    headerAnim.setValue(0);
    contentAnim.setValue(0);
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [contentAnim, headerAnim, loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const stage = xp?.stage.stage ?? 1;
  const dailyGoal = XP_DAILY_GOALS[xp?.dailyGoalKey ?? 'regular']?.xp ?? 20;
  const accentColor = trackContext.color || colors.accent;
  const continueHref = resumeHref || trackContext.continueHref || '/(tabs)/fields';
  const continueLabel = trackContext.mode === 'track'
    ? (resumeSummary ? 'Continue where you left off' : trackContext.continueLabel)
    : 'Explore tracks';
  const continueSub = resumeSummary ?? (trackContext.mode === 'track' ? `Resume ${trackContext.trackName}` : 'Resume island journey');
  const heroSummary = trackContext.mode === 'track' && resumeSummary
    ? `${trackContext.heroSummary} ${resumeSummary}.`
    : trackContext.heroSummary;

  const openTrack = useCallback(async (trackId: string) => {
    const track = findTrackById(trackId);
    if (!track) {
      go('/(tabs)/fields');
      return;
    }

    try {
      await updateActiveField(track.fieldId, fieldColor(track.fieldId), track.id, track.name);
    } catch {
      // Best effort only.
    }

    go(getTrackHref(track));
  }, [go, updateActiveField]);

  if (isWebWide) {
    const overviewTracks = [
      {
        id: 'quant-trader',
        iconLabel: 'QT',
        name: 'Quant Track',
        color: '#6366f1',
        summary: 'Math-heavy trading, research, and execution infrastructure.',
        points: ['Strategy labs', 'Backtests', 'Market microstructure'],
      },
      {
        id: 'supply-chain-analyst',
        iconLabel: 'SC',
        name: 'Supply Chain Track',
        color: '#10b981',
        summary: 'Forecasting, inventory, logistics, and operations decision-making.',
        points: ['Planning', 'Flow control', 'Operations analytics'],
      },
      {
        id: 'onchain-analyst',
        iconLabel: 'ON',
        name: 'Onchain Track',
        color: '#3b82f6',
        summary: 'Protocol intelligence, smart-money analysis, and wallet tracing.',
        points: ['Wallet flows', 'Protocol maps', 'On-chain signals'],
      },
      {
        id: 'starknet-defi-navigator',
        iconLabel: 'SN',
        name: 'Starknet Track',
        color: '#ec4899',
        summary: 'Live Starknet wallet actions, labs, and on-chain execution practice.',
        points: ['Sepolia practice', 'Wallet actions', 'Live labs'],
      },
    ];

    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title={trackContext.mode === 'track' ? `${trackContext.trackName} Dashboard` : `${getGreeting()}, your dashboard is ready.`}
            subtitle={trackContext.mode === 'track' ? trackContext.tagline : 'Keep your streak, XP, and next move in one compact workspace.'}
            accentColor={accentColor}
            right={(
              <TouchableOpacity
                onPress={() => go('/(tabs)/profile')}
                style={[styles.webBoltBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <TheBolt size={32} animate />
                <Text style={[styles.webBoltLabel, { color: accentColor }]}>{trackContext.mode === 'track' ? trackContext.trackName : (xp?.stage.name ?? 'Raw Recruit')}</Text>
              </TouchableOpacity>
            )}
          />

          {streak ? <StreakBanner status={streak} /> : null}

          <WebRow>
            <WebCol weight={2}>
              {trackContext.mode === 'track' ? (
                <TrackHeroCard
                  accentColor={accentColor}
                  artFieldId={trackContext.artFieldId}
                  eyebrow={trackContext.heroEyebrow}
                  title={trackContext.heroTitle}
                  summary={heroSummary}
                  focusAreas={trackContext.focusAreas}
                  continueLabel={continueLabel}
                  chartValues={trackContext.chartValues}
                  onContinue={() => go(continueHref)}
                />
              ) : (
                <WebCard accentBar accentColor={colors.accent} title="Progress Overview">
                  <View style={styles.webProgressCard}>
                    <WorkerCharacter stage={stage} trackId="crypto" size={88} animate mood="neutral" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.webStageName, { color: colors.accent }]}>{xp?.stage.name ?? 'Raw Recruit'}</Text>
                      <Text style={[styles.webStageDesc, { color: colors.textSoft }]}>
                        {xp?.stage.description ?? 'Just starting out. Empty desk, full potential.'}
                      </Text>
                      {xp ? (
                        <XPProgressBar
                          progress={xp.progress}
                          color={colors.accent}
                          dailyXp={xp.dailyXp}
                          dailyGoalTarget={dailyGoal}
                        />
                      ) : null}
                    </View>
                    <WebMiniChart color={colors.accent} values={[20, 35, 28, 50, 45, 60, 72]} />
                  </View>
                </WebCard>
              )}
            </WebCol>

            <WebCol weight={1}>
              <WebCard title={trackContext.mode === 'track' ? 'Track Snapshot' : 'Today'} accentBar accentColor={colors.xpGreen}>
                <WebStatTile emoji="DAY" label="Streak" value={`${streak?.streak ?? 0}`} sub={streak?.completedToday ? 'Checked in today' : 'Complete one lesson'} color={colors.orange} />
                <WebStatTile emoji="XP" label="Total XP" value={`${xp?.totalXp ?? 0}`} sub={`${xp?.xpToNextStage ?? '-'} to next stage`} color={accentColor} />
                <WebStatTile
                  emoji="GOAL"
                  label={trackContext.mode === 'track' ? (trackContext.stats[0]?.label ?? 'Focus') : 'Daily XP'}
                  value={trackContext.mode === 'track' ? (trackContext.stats[0]?.value ?? 'Ready') : `${xp?.dailyXp ?? 0}`}
                  sub={trackContext.mode === 'track' ? (trackContext.stats[1]?.value ?? trackContext.tagline) : `Goal: ${dailyGoal} XP`}
                  color={trackContext.mode === 'track' ? accentColor : colors.xpGreen}
                />
                <WebStatTile
                  emoji="LVL"
                  label={trackContext.mode === 'track' ? (trackContext.stats[2]?.label ?? 'Mode') : 'Stage'}
                  value={trackContext.mode === 'track' ? (trackContext.stats[2]?.value ?? 'Track view') : `${stage} / 8`}
                  sub={trackContext.mode === 'track' ? (trackContext.stats[3]?.value ?? trackContext.worldName) : xp?.stage.name}
                  color={colors.gold}
                />
              </WebCard>
            </WebCol>
          </WebRow>

          {trackContext.mode === 'track' ? (
            <>
              <WebSectionLabel label={trackContext.challengeTitle} action="Switch track >" onAction={() => go('/(tabs)/fields')} />
              <WebRow>
                <WebCol weight={2}>
                  <WebCard accentBar accentColor={accentColor}>
                    <Text style={[styles.trackFeatureTitle, { color: colors.text }]}>{trackContext.challengeTitle}</Text>
                    <Text style={[styles.trackFeatureSummary, { color: colors.textSoft }]}>{trackContext.challengeSummary}</Text>
                    <View style={styles.trackFeatureGrid}>
                      {trackContext.focusAreas.map((item, index) => (
                        <View key={item} style={[styles.trackFeatureItem, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                          <Text style={[styles.trackFeatureIndex, { color: accentColor }]}>{`0${index + 1}`}</Text>
                          <Text style={[styles.trackFeatureItemText, { color: colors.textSoft }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </WebCard>
                </WebCol>
                <WebCol weight={1}>
                  <WebCard title="Next Up" accentBar accentColor={accentColor}>
                    <WebListRow icon={trackContext.emoji} title={trackContext.trackName} sub={trackContext.tagline} onPress={() => go(continueHref)} />
                    <WebListRow icon="MAP" title={trackContext.worldName} sub={trackContext.shellSubtitle} onPress={() => go(continueHref)} />
                    <SifterButton
                      label="Resume"
                      onPress={() => go(continueHref)}
                      variant="track"
                      color={accentColor}
                      size="sm"
                      style={styles.primaryActionBtn}
                    />
                  </WebCard>
                </WebCol>
              </WebRow>
            </>
          ) : (
            <>
              <WebSectionLabel label="Career Tracks" action="Explore all >" onAction={() => go('/(tabs)/fields')} />
              <WebRow cols={2}>
                {overviewTracks.map((track) => (
                  <OverviewTrackCard
                    key={track.id}
                    iconLabel={track.iconLabel}
                    name={track.name}
                    accentColor={track.color}
                    summary={track.summary}
                    points={track.points}
                    onPress={() => void openTrack(track.id)}
                  />
                ))}
              </WebRow>
            </>
          )}

          <WebRow>
            <WebCol weight={2}>
              <WebCard title={trackContext.mode === 'track' ? `${trackContext.trackName} Guild` : 'Guild'} accentBar accentColor={trackContext.mode === 'track' ? accentColor : colors.accent}>
                <WebListRow icon="GUILD" title={trackContext.mode === 'track' ? `${trackContext.trackName} Circle` : 'Alpha Seekers Guild'} sub="Active - 1h ago" onPress={() => go('/(tabs)/guild')} />
                <View style={[styles.webDiscussionCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.webDiscTitle, { color: colors.textMuted }]}>ACTIVE THREADS</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textSoft }]}>{`Chat: ${trackContext.mode === 'track' ? `${trackContext.trackName} tactics and next steps` : 'Machine learning in alpha generation'}`}</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textSoft }]}>{`Chat: ${trackContext.mode === 'track' ? `How to progress faster inside ${trackContext.trackName}` : 'Optimal artifact packaging for interviews'}`}</Text>
                </View>
                <WebListRow icon="TASK" title="Challenge Queue" sub="Track prompts and guild tasks" badge={3} badgeColor={colors.orange} onPress={() => go('/(tabs)/guild')} />
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard accentBar accentColor={colors.orange} style={{ marginBottom: GRID_GAP }}>
                <Text style={[styles.webStreakLabel, { color: colors.textMuted }]}>ACTIVE STREAK</Text>
                <Text style={[styles.webStreakNum, { color: colors.orange }]}>{streak?.streak ?? 0} days</Text>
                <Text style={[styles.webStreakSub, { color: colors.textSoft }]}>
                  {streak?.completedToday ? 'Lesson completed today.' : 'Complete a lesson to extend it.'}
                </Text>
              </WebCard>
              <WebCard title="Signals" accentBar accentColor={colors.xpGreen}>
                <WebListRow icon="LAB" title={trackContext.mode === 'track' ? `${trackContext.trackName} board` : 'Vol Arb Challenge'} sub={trackContext.mode === 'track' ? trackContext.challengeSummary : 'Trading competition'} onPress={() => go('/(tabs)/guild')} />
                <WebListRow icon="LIVE" title="Feed + Guild Signals" sub="Track news, jobs, and collaboration" badge="Live" badgeColor={accentColor} onPress={() => go('/(tabs)/feed')} />
              </WebCard>
            </WebCol>
          </WebRow>

          <WebRow>
            <WebCol weight={2}>
              <WebCard
                title={trackContext.mode === 'track' ? `${trackContext.trackName} Artifacts + XP` : 'Artifacts + XP'}
                titleRight={<ReferenceBadge label={`${Math.max(1, Math.floor((xp?.totalXp ?? 0) / 120))} artifacts earned`} color={colors.xpGreen} />}
                accentBar
                accentColor={colors.xpGreen}
              >
                <View style={[styles.webChartArea, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <WebMiniChart
                    color={trackContext.mode === 'track' ? accentColor : colors.xpGreen}
                    values={trackContext.mode === 'track' ? trackContext.chartValues : [500, 700, 650, 900, 850, 1100, 1050, 1300, 1250, 1500, 1450, 1700]}
                  />
                </View>
                <View style={styles.webChartMetrics}>
                  <View>
                    <Text style={[styles.webMetricVal, { color: colors.text }]}>{xp?.totalXp ?? 0} XP</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textMuted }]}>Total XP</Text>
                  </View>
                  <View>
                    <Text style={[styles.webMetricVal, { color: accentColor }]}>{trackContext.trackName}</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textMuted }]}>Current Track</Text>
                  </View>
                </View>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Quick Actions" accentBar accentColor={trackContext.mode === 'track' ? accentColor : colors.accent}>
                {[
                  {
                    emoji: 'GO',
                    label: trackContext.mode === 'track' ? 'Resume Track' : 'Resume Learning',
                    sub: continueSub,
                    route: continueHref,
                  },
                  { emoji: 'MAP', label: 'Explore Tracks', sub: 'Browse career fields', route: '/(tabs)/fields' },
                  { emoji: 'NEWS', label: 'Open Feed', sub: 'News, data, jobs', route: '/(tabs)/feed' },
                  { emoji: 'XP', label: 'Artifacts + XP', sub: 'Tasks, artifacts, pushes', route: '/(tabs)/portfolio' },
                ].map((item) => (
                  <WebListRow
                    key={item.label}
                    icon={item.emoji}
                    title={item.label}
                    sub={item.sub}
                    onPress={() => go(item.route)}
                    right={<Text style={{ color: colors.textMuted, fontSize: 16 }}>{'>'}</Text>}
                  />
                ))}
              </WebCard>
            </WebCol>
          </WebRow>
        </WebShell>
      </SafeAreaView>
    );
  }

  const headerStyle = {
    opacity: headerAnim,
    transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
  };
  const contentStyle = {
    opacity: contentAnim,
    transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>{trackContext.mode === 'track' ? trackContext.heroEyebrow : getGreeting()}</Text>
            <Text style={[styles.headline, { color: colors.text }]}>{trackContext.mode === 'track' ? trackContext.trackName : 'Your dashboard'}</Text>
            <Text style={[styles.mobileHeaderSub, { color: colors.textSoft }]}>
              {trackContext.mode === 'track' ? trackContext.tagline : 'Streak, XP, and next actions in one place.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => go('/(tabs)/profile')}
            activeOpacity={0.85}
            style={[styles.mobileBoltBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <TheBolt size={44} animate />
          </TouchableOpacity>
        </Animated.View>

        {streak ? <StreakBanner status={streak} /> : null}

        <Animated.View style={[styles.mobileHeroCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.md, contentStyle]}>
          <View style={styles.mobileHeroHeader}>
            <ReferenceBadge label={trackContext.heroEyebrow} color={accentColor} />
            {trackContext.mode === 'track' ? (
              <Text style={[styles.mobileHeroTrackPill, { color: accentColor }]}>{trackContext.trackName}</Text>
            ) : null}
          </View>
          <View style={styles.mobileHeroBody}>
            {trackContext.mode === 'track' ? (
              <FieldArtwork fieldId={trackContext.artFieldId} size={124} />
            ) : (
              <WorkerCharacter stage={stage} trackId="crypto" size={100} animate mood="neutral" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.mobileHeroTitle, { color: colors.text }]}>{trackContext.mode === 'track' ? trackContext.trackName : (xp?.stage.name ?? 'Raw Recruit')}</Text>
              <Text style={[styles.mobileHeroSummary, { color: colors.textSoft }]}>
                {trackContext.mode === 'track' ? heroSummary : (xp?.stage.description ?? 'Just starting out. Empty desk, full potential.')}
              </Text>
              {xp ? (
                <XPProgressBar
                  progress={xp.progress}
                  color={accentColor}
                  dailyXp={xp.dailyXp}
                  dailyGoalTarget={dailyGoal}
                />
              ) : null}
            </View>
          </View>
          <SifterButton
            label={trackContext.mode === 'track' ? 'Resume track' : 'Explore tracks'}
            onPress={() => go(continueHref)}
            variant="track"
            color={accentColor}
            size="md"
            style={styles.mobilePrimaryBtn}
          />
        </Animated.View>

        <Animated.View style={[styles.statsGrid, contentStyle]}>
          <View style={styles.statsRow}>
            <StatCard iconLabel="DAY" label="Streak" color={colors.orange} value={`${streak?.streak ?? 0}`} sub={streak?.completedToday ? 'Checked in today' : 'Complete one lesson'} />
            <StatCard iconLabel="XP" label="Total XP" color={accentColor} value={`${xp?.totalXp ?? 0}`} sub={`${xp?.xpToNextStage ?? '-'} to next stage`} />
          </View>
          <View style={styles.statsRow}>
            <StatCard iconLabel="GOAL" label={trackContext.mode === 'track' ? (trackContext.stats[0]?.label ?? 'Focus') : 'Daily XP'} color={trackContext.mode === 'track' ? accentColor : colors.xpGreen} value={trackContext.mode === 'track' ? (trackContext.stats[0]?.value ?? 'Ready') : `${xp?.dailyXp ?? 0}`} sub={trackContext.mode === 'track' ? (trackContext.stats[1]?.value ?? trackContext.tagline) : `Goal: ${dailyGoal} XP`} />
            <StatCard iconLabel="LVL" label={trackContext.mode === 'track' ? (trackContext.stats[2]?.label ?? 'Mode') : 'Stage'} color={colors.gold} value={trackContext.mode === 'track' ? (trackContext.stats[2]?.value ?? 'Track view') : `${stage} / 8`} sub={trackContext.mode === 'track' ? (trackContext.stats[3]?.value ?? trackContext.worldName) : (xp?.stage.name ?? '-')} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.actionsSection, contentStyle]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{trackContext.mode === 'track' ? 'NEXT ACTIONS' : 'QUICK ACTIONS'}</Text>
          <QuickAction iconLabel="GO" label={trackContext.mode === 'track' ? 'Resume Track' : 'Explore Tracks'} sub={trackContext.mode === 'track' ? continueSub : 'Choose a live track to enter'} color={accentColor} onPress={() => go(continueHref)} />
          <QuickAction iconLabel="MAP" label="Explore Tracks" sub="Browse career fields" color={colors.green} onPress={() => go('/(tabs)/fields')} />
          <QuickAction iconLabel="NEWS" label="Open Feed" sub="News, data, jobs for your track" color={colors.orange} onPress={() => go('/(tabs)/feed')} />
          <QuickAction iconLabel="XP" label="Artifacts + XP" sub="View tasks, artifacts, and pushes" color={colors.gold} onPress={() => go('/(tabs)/portfolio')} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { ...webContainer, paddingBottom: Spacing.xxxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: 2 },
  headline: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  mobileHeaderSub: { fontSize: FontSize.sm, lineHeight: 18, marginTop: 6, maxWidth: 280 },
  mobileBoltBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },

  streakBanner: { borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12, marginBottom: Spacing.lg },
  streakBannerText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'center' },

  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  progressValue: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  progressTrack: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.full },

  miniChart: { height: 58, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: 92 },
  miniChartBarWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  miniChartBar: { width: '100%', borderRadius: 2, minHeight: 3 },

  referenceBadgeWrap: { alignSelf: 'flex-start', marginBottom: 10 },

  webBoltBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1 },
  webBoltLabel: { fontSize: 11, fontWeight: '700', maxWidth: 180 },

  webProgressCard: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  webStageName: { fontSize: FontSize.xl, fontWeight: FontWeight.black, marginBottom: 4 },
  webStageDesc: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: 12 },

  heroPanel: { flexDirection: 'row', minHeight: 260 },
  heroPanelCopy: { flex: 1, padding: 24, justifyContent: 'center' },
  heroPanelTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.7, marginBottom: 10 },
  heroPanelSummary: { fontSize: FontSize.md, lineHeight: 22, marginBottom: 16, maxWidth: 520 },
  heroPanelTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  heroTag: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  heroTagText: { fontSize: 9, fontWeight: '700' },
  heroPanelBtn: { alignSelf: 'flex-start' },
  heroPanelVisual: { width: 290, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  heroPanelMiniCard: { borderWidth: 1, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, width: '100%' },
  heroPanelMiniLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginBottom: 8 },

  overviewTrackCard: { height: '100%' },
  webTrackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  trackIconBadge: {
    minWidth: 40,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  trackIconBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4 },
  webTrackName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, flex: 1 },
  webTrackArrow: { fontSize: 18 },
  overviewTrackSummary: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: 10 },
  webTrackKey: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  webTrackBtn: { marginTop: 12 },

  trackFeatureTitle: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  trackFeatureSummary: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: 14 },
  trackFeatureGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  trackFeatureItem: { width: '31%', minWidth: 160, borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12, gap: 8 },
  trackFeatureIndex: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  trackFeatureItemText: { fontSize: FontSize.sm, lineHeight: 18 },
  primaryActionBtn: { marginTop: 12 },

  webDiscussionCard: { borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1, marginVertical: 8 },
  webDiscTitle: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: 6 },
  webDiscItem: { fontSize: FontSize.sm, marginBottom: 4 },
  webStreakLabel: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.2, marginBottom: 4 },
  webStreakNum: { fontSize: 34, fontWeight: FontWeight.black, lineHeight: 38, marginBottom: 6 },
  webStreakSub: { fontSize: FontSize.sm },

  webChartArea: { height: 90, borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', marginBottom: 14, padding: 10, alignItems: 'center', justifyContent: 'center' },
  webChartMetrics: { flexDirection: 'row', gap: 32 },
  webMetricVal: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  webMetricLbl: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  mobileHeroCard: { borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 14 : 12, marginBottom: Spacing.lg, gap: Spacing.md },
  mobileHeroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileHeroTrackPill: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  mobileHeroBody: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  mobileHeroTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: 4 },
  mobileHeroSummary: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.md },
  mobilePrimaryBtn: {},

  statsGrid: { gap: Spacing.sm, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, alignItems: 'flex-start', gap: 4, borderWidth: 1 },
  statBadge: {
    minWidth: 38,
    height: 26,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    marginBottom: 4,
  },
  statBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  statSub: { fontSize: 10, fontWeight: FontWeight.medium, textAlign: 'left' },

  actionsSection: { gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: Spacing.xs },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: 11, padding: Platform.OS === 'web' ? 14 : 12, borderWidth: 1 },
  quickActionIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickActionIconText: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.7 },
  quickActionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickActionSub: { fontSize: FontSize.xs, marginTop: 2 },
  quickActionArrow: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
});
