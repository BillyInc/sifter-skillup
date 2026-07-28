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
import { RouteLine, StatTile, SectionLabel } from '../components/careerIntelligence';
import {
  CompassFonts,
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
import { TheBolt } from '../components/CharacterSystem';
import { fieldColor } from '../components/artwork/FieldArtwork';
import TrackScene from '../components/artwork/TrackIsometricScene';
import IslandGlobe, { DEFAULT_ISLAND_PINS } from '../components/artwork/IslandGlobe';
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

function buildTrackAwarePins(trackContext: ReturnType<typeof resolveTrackContext>) {
  if (trackContext.mode !== 'track') {
    return DEFAULT_ISLAND_PINS;
  }

  if (trackContext.fieldId === 'quant') {
    return [
      { x: 138, y: 193, color: '#6366F1', name: 'Vol Surface', done: 8, total: 10 },
      { x: 215, y: 148, color: '#3B82F6', name: 'Derivatives', done: 7, total: 10 },
      { x: 258, y: 188, color: '#A855F7', name: 'HFT Desk', done: 5, total: 10 },
      { x: 232, y: 225, color: '#10B981', name: 'Risk Models', done: 6, total: 10 },
    ];
  }

  if (trackContext.fieldId === 'supply-chain') {
    return [
      { x: 138, y: 193, color: '#10B981', name: 'Planning', done: 6, total: 10 },
      { x: 215, y: 148, color: '#14B8A6', name: 'Procurement', done: 5, total: 10 },
      { x: 258, y: 188, color: '#F59E0B', name: 'Warehousing', done: 4, total: 10 },
      { x: 232, y: 225, color: '#3B82F6', name: 'Logistics', done: 7, total: 10 },
    ];
  }

  if (trackContext.fieldId === 'starknet') {
    return [
      { x: 138, y: 193, color: '#F4B74A', name: 'Wallet Ops', done: 5, total: 10 },
      { x: 215, y: 148, color: '#F97316', name: 'Bridge Flow', done: 4, total: 10 },
      { x: 258, y: 188, color: '#22C55E', name: 'DeFi Labs', done: 7, total: 10 },
      { x: 232, y: 225, color: '#8B5CF6', name: 'Cairo Build', done: 3, total: 10 },
    ];
  }

  if (trackContext.fieldId === 'crypto') {
    return [
      { x: 138, y: 193, color: '#0EA5E9', name: 'Wallet Flows', done: 4, total: 10 },
      { x: 215, y: 148, color: '#8B5CF6', name: 'Protocol Maps', done: 6, total: 10 },
      { x: 258, y: 188, color: '#F43F5E', name: 'Smart Money', done: 3, total: 10 },
      { x: 232, y: 225, color: '#10B981', name: 'Yield Systems', done: 5, total: 10 },
    ];
  }

  return DEFAULT_ISLAND_PINS.map((pin, index) => ({
    ...pin,
    name: trackContext.focusAreas[index] ?? pin.name,
    color: index === 0 ? trackContext.color : pin.color,
  }));
}

function StreakBanner({ status }: { status: StreakStatus }) {
  const { colors } = useTheme();
  const atRisk = (status as any).isAtRisk;
  if (!atRisk && status.streak < 2) return null;

  const backgroundColor = atRisk ? `${colors.accentRole.status}18` : `${colors.accentRole.success}18`;
  const color = atRisk ? colors.accentRole.status : colors.accentRole.success;
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
        <Text style={[styles.progressLabel, { color: colors.textRole.secondary }]}>Stage Progress</Text>
        <Text style={[styles.progressValue, { color }]}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surface.subtle }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: color, width }]} />
      </View>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textRole.secondary }]}>Daily Goal</Text>
        <Text style={[styles.progressValue, { color: colors.accentRole.success }]}>{dailyXp} / {dailyGoalTarget} XP</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surface.subtle }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.accentRole.success, width: dailyWidth }]} />
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
        <Text style={[styles.webTrackName, { color: colors.textRole.primary }]}>{name}</Text>
        <Text style={[styles.webTrackArrow, { color: colors.textRole.muted }]}>{'>'}</Text>
      </View>
      <Text style={[styles.overviewTrackSummary, { color: colors.textRole.secondary }]}>{summary}</Text>
      <WebMiniChart color={accentColor} values={[12, 24, 21, 38, 44, 57, 63]} />
      <View style={{ marginTop: 10, gap: 4 }}>
        {points.map((point) => (
          <Text key={point} style={[styles.webTrackKey, { color: colors.textRole.secondary }]}>{`- ${point}`}</Text>
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
  trackId,
  heroVisual,
  globePins,
  eyebrow,
  title,
  summary,
  focusAreas,
  continueLabel,
  chartValues,
  onContinue,
}: {
  accentColor: string;
  trackId?: string;
  heroVisual: 'globe' | 'isometric';
  globePins: typeof DEFAULT_ISLAND_PINS;
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
      <View style={[styles.heroPanel, { backgroundColor: colors.surface.raised }]}>
        <View style={styles.heroPanelCopy}>
          <ReferenceBadge label={eyebrow} color={accentColor} />
          <Text style={[styles.heroPanelTitle, { color: colors.textRole.primary }]}>{title}</Text>
          <Text style={[styles.heroPanelSummary, { color: colors.textRole.secondary }]}>{summary}</Text>
          <View style={styles.heroPanelTags}>
            {focusAreas.map((item) => (
              <View key={item} style={[styles.heroTag, { backgroundColor: colors.surface.subtle }]}>
                <Text style={[styles.heroTagText, { color: colors.textRole.secondary }]}>{item}</Text>
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
          <View style={heroVisual === 'globe' ? styles.heroArtworkGlobe : styles.heroArtworkScene}>
            {heroVisual === 'globe' ? (
              <IslandGlobe
                pins={globePins}
                width="100%"
                height="100%"
              />
            ) : (
              <TrackScene
                trackId={trackId ?? 'default'}
                accentColor={accentColor}
                width="100%"
                height="100%"
              />
            )}
          </View>
          <View style={[styles.heroPanelMiniCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.heroPanelMiniLabel, { color: colors.textRole.muted }]}>Momentum</Text>
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
    <SifterCard style={[styles.statCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={[styles.statBadge, { backgroundColor: `${color}14`, borderColor: `${color}22` }]}>
        <Text style={[styles.statBadgeText, { color }]}>{iconLabel}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textRole.secondary }]}>{label}</Text>
      {sub ? <Text style={[styles.statSub, { color: colors.textRole.muted }]}>{sub}</Text> : null}
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
    <SifterCard onPress={onPress} style={[styles.quickAction, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}14`, borderColor: `${color}22` }]}>
        <Text style={[styles.quickActionIconText, { color }]}>{iconLabel}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.quickActionLabel, { color: colors.textRole.primary }]}>{label}</Text>
        <Text style={[styles.quickActionSub, { color: colors.textRole.muted }]}>{sub}</Text>
      </View>
      <Text style={[styles.quickActionArrow, { color: colors.textRole.muted }]}>{'>'}</Text>
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
  const accentColor = trackContext.color || colors.accentRole.action;
  const isCryptoOrIsland =
    trackContext.mode === 'island' ||
    trackContext.artFieldId === 'crypto' ||
    !trackContext.trackId;
  const heroVisual = isCryptoOrIsland ? 'globe' : 'isometric';
  const trackAwarePins = useMemo(() => buildTrackAwarePins(trackContext), [trackContext]);
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
        color: '#f59e0b',
        summary: 'Live Starknet wallet actions, labs, and on-chain execution practice.',
        points: ['Sepolia practice', 'Wallet actions', 'Live labs'],
      },
    ];

    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <WebShell>
          <WebPageHeader
            title={trackContext.mode === 'track' ? `${trackContext.trackName} Dashboard` : `${getGreeting()}, your dashboard is ready.`}
            subtitle={trackContext.mode === 'track' ? trackContext.tagline : 'Keep your streak, XP, and next move in one compact workspace.'}
            accentColor={accentColor}
            right={(
              <TouchableOpacity
                onPress={() => go('/(tabs)/profile')}
                style={[styles.webBoltBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
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
                  trackId={trackContext.trackId ?? trackContext.artFieldId}
                  heroVisual={heroVisual}
                  globePins={trackAwarePins}
                  eyebrow={trackContext.heroEyebrow}
                  title={trackContext.heroTitle}
                  summary={heroSummary}
                  focusAreas={trackContext.focusAreas}
                  continueLabel={continueLabel}
                  chartValues={trackContext.chartValues}
                  onContinue={() => go(continueHref)}
                />
              ) : (
                <WebCard accentBar accentColor={colors.accentRole.action} title="Progress Overview">
                  <View style={styles.webProgressCard}>
                    <View style={styles.overviewGlobeWrap}>
                      <IslandGlobe pins={trackAwarePins} width="100%" height="100%" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.webStageName, { color: colors.accentRole.action }]}>{xp?.stage.name ?? 'Raw Recruit'}</Text>
                      <Text style={[styles.webStageDesc, { color: colors.textRole.secondary }]}>
                        {xp?.stage.description ?? 'Just starting out. Empty desk, full potential.'}
                      </Text>
                      {xp ? (
                        <XPProgressBar
                          progress={xp.progress}
                          color={colors.accentRole.action}
                          dailyXp={xp.dailyXp}
                          dailyGoalTarget={dailyGoal}
                        />
                      ) : null}
                    </View>
                    <WebMiniChart color={colors.accentRole.action} values={[20, 35, 28, 50, 45, 60, 72]} />
                  </View>
                </WebCard>
              )}
            </WebCol>

            <WebCol weight={1}>
              <WebCard title={trackContext.mode === 'track' ? 'Track Snapshot' : 'Today'} accentBar accentColor={colors.accentRole.success}>
                <WebStatTile emoji="DAY" label="Streak" value={`${streak?.streak ?? 0}`} sub={streak?.completedToday ? 'Checked in today' : 'Complete one lesson'} color={colors.accentRole.status} />
                <WebStatTile emoji="XP" label="Total XP" value={`${xp?.totalXp ?? 0}`} sub={`${xp?.xpToNextStage ?? '-'} to next stage`} color={accentColor} />
                <WebStatTile
                  emoji="GOAL"
                  label={trackContext.mode === 'track' ? (trackContext.stats[0]?.label ?? 'Focus') : 'Daily XP'}
                  value={trackContext.mode === 'track' ? (trackContext.stats[0]?.value ?? 'Ready') : `${xp?.dailyXp ?? 0}`}
                  sub={trackContext.mode === 'track' ? (trackContext.stats[1]?.value ?? trackContext.tagline) : `Goal: ${dailyGoal} XP`}
                  color={trackContext.mode === 'track' ? accentColor : colors.accentRole.success}
                />
                <WebStatTile
                  emoji="LVL"
                  label={trackContext.mode === 'track' ? (trackContext.stats[2]?.label ?? 'Mode') : 'Stage'}
                  value={trackContext.mode === 'track' ? (trackContext.stats[2]?.value ?? 'Track view') : `${stage} / 8`}
                  sub={trackContext.mode === 'track' ? (trackContext.stats[3]?.value ?? trackContext.worldName) : xp?.stage.name}
                  color={colors.accentRole.status}
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
                    <Text style={[styles.trackFeatureTitle, { color: colors.textRole.primary }]}>{trackContext.challengeTitle}</Text>
                    <Text style={[styles.trackFeatureSummary, { color: colors.textRole.secondary }]}>{trackContext.challengeSummary}</Text>
                    <View style={styles.trackFeatureGrid}>
                      {trackContext.focusAreas.map((item, index) => (
                        <View key={item} style={[styles.trackFeatureItem, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                          <Text style={[styles.trackFeatureIndex, { color: accentColor }]}>{`0${index + 1}`}</Text>
                          <Text style={[styles.trackFeatureItemText, { color: colors.textRole.secondary }]}>{item}</Text>
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
              <WebCard title={trackContext.mode === 'track' ? `${trackContext.trackName} Guild` : 'Guild'} accentBar accentColor={trackContext.mode === 'track' ? accentColor : colors.accentRole.action}>
                <WebListRow icon="GUILD" title={trackContext.mode === 'track' ? `${trackContext.trackName} Circle` : 'Alpha Seekers Guild'} sub="Active - 1h ago" onPress={() => go('/(tabs)/guild')} />
                <View style={[styles.webDiscussionCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.webDiscTitle, { color: colors.textRole.muted }]}>ACTIVE THREADS</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textRole.secondary }]}>{`Chat: ${trackContext.mode === 'track' ? `${trackContext.trackName} tactics and next steps` : 'Machine learning in alpha generation'}`}</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textRole.secondary }]}>{`Chat: ${trackContext.mode === 'track' ? `How to progress faster inside ${trackContext.trackName}` : 'Optimal artifact packaging for interviews'}`}</Text>
                </View>
                <WebListRow icon="TASK" title="Challenge Queue" sub="Track prompts and guild tasks" badge={3} badgeColor={colors.accentRole.status} onPress={() => go('/(tabs)/guild')} />
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard accentBar accentColor={colors.accentRole.status} style={{ marginBottom: GRID_GAP }}>
                <Text style={[styles.webStreakLabel, { color: colors.textRole.muted }]}>ACTIVE STREAK</Text>
                <Text style={[styles.webStreakNum, { color: colors.accentRole.status }]}>{streak?.streak ?? 0} days</Text>
                <Text style={[styles.webStreakSub, { color: colors.textRole.secondary }]}>
                  {streak?.completedToday ? 'Lesson completed today.' : 'Complete a lesson to extend it.'}
                </Text>
              </WebCard>
              <WebCard title="Signals" accentBar accentColor={colors.accentRole.success}>
                <WebListRow icon="LAB" title={trackContext.mode === 'track' ? `${trackContext.trackName} board` : 'Vol Arb Challenge'} sub={trackContext.mode === 'track' ? trackContext.challengeSummary : 'Trading competition'} onPress={() => go('/(tabs)/guild')} />
                <WebListRow icon="LIVE" title="Feed + Guild Signals" sub="Track news, jobs, and collaboration" badge="Live" badgeColor={accentColor} onPress={() => go('/(tabs)/feed')} />
              </WebCard>
            </WebCol>
          </WebRow>

          <WebRow>
            <WebCol weight={2}>
              <WebCard
                title={trackContext.mode === 'track' ? `${trackContext.trackName} Artifacts + XP` : 'Artifacts + XP'}
                titleRight={<ReferenceBadge label={`${Math.max(1, Math.floor((xp?.totalXp ?? 0) / 120))} artifacts earned`} color={colors.accentRole.success} />}
                accentBar
                accentColor={colors.accentRole.success}
              >
                <View style={[styles.webChartArea, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                  <WebMiniChart
                    color={trackContext.mode === 'track' ? accentColor : colors.accentRole.success}
                    values={trackContext.mode === 'track' ? trackContext.chartValues : [500, 700, 650, 900, 850, 1100, 1050, 1300, 1250, 1500, 1450, 1700]}
                  />
                </View>
                <View style={styles.webChartMetrics}>
                  <View>
                    <Text style={[styles.webMetricVal, { color: colors.textRole.primary }]}>{xp?.totalXp ?? 0} XP</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textRole.muted }]}>Total XP</Text>
                  </View>
                  <View>
                    <Text style={[styles.webMetricVal, { color: accentColor }]}>{trackContext.trackName}</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textRole.muted }]}>Current Track</Text>
                  </View>
                </View>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Quick Actions" accentBar accentColor={trackContext.mode === 'track' ? accentColor : colors.accentRole.action}>
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
                    right={<Text style={{ color: colors.textRole.muted, fontSize: 16 }}>{'>'}</Text>}
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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />}
      >
        {/* ── Editorial header ── */}
        <Animated.View style={[styles.editorialHeader, headerStyle]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>
              {trackContext.mode === 'track' ? trackContext.heroEyebrow : getGreeting()}
            </Text>
            <Text style={[styles.headline, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
              {trackContext.mode === 'track' ? trackContext.trackName : 'Your dashboard'}
            </Text>
            <Text style={[styles.mobileHeaderSub, CompassFonts.body, { color: colors.textRole.secondary }]}>
              {trackContext.mode === 'track' ? trackContext.tagline : 'Streak, XP, and next actions in one place.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => go('/(tabs)/profile')}
            activeOpacity={0.85}
            style={[styles.mobileBoltBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          >
            <TheBolt size={40} animate />
          </TouchableOpacity>
        </Animated.View>

        {streak ? <StreakBanner status={streak} /> : null}

        {/* ── Hero: Your Route card ── */}
        <Animated.View style={[styles.heroRouteCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, contentStyle]}>
          <View style={styles.heroRouteHeader}>
            <ReferenceBadge label={trackContext.heroEyebrow} color={accentColor} />
            {trackContext.mode === 'track' ? (
              <Text style={[styles.mobileHeroTrackPill, CompassFonts.bodyBold, { color: accentColor }]}>{trackContext.trackName}</Text>
            ) : null}
          </View>

          <View style={styles.heroRouteVisual}>
            {heroVisual === 'globe' ? (
              <View style={styles.mobileArtworkGlobe}>
                <IslandGlobe pins={trackAwarePins} width="100%" height="100%" />
              </View>
            ) : (
              <View style={styles.mobileArtworkScene}>
                <TrackScene
                  trackId={trackContext.trackId ?? trackContext.artFieldId}
                  accentColor={accentColor}
                  width="100%"
                  height="100%"
                />
              </View>
            )}
            <View style={styles.heroRouteCopy}>
              <Text style={[styles.mobileHeroTitle, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
                {trackContext.mode === 'track' ? trackContext.trackName : (xp?.stage.name ?? 'Raw Recruit')}
              </Text>
              <Text style={[styles.mobileHeroSummary, CompassFonts.body, { color: colors.textRole.secondary }]}>
                {trackContext.mode === 'track' ? heroSummary : (xp?.stage.description ?? 'Just starting out. Empty desk, full potential.')}
              </Text>
            </View>
          </View>

          {/* Route-line journey */}
          {trackContext.mode === 'track' ? (
            <View style={styles.routeSection}>
              <RouteLine
                variant="journey"
                static
                stations={[
                  { state: 'you', label: 'You are here', caption: xp?.stage.name ?? 'Stage 1' },
                  { state: 'bridge', label: trackContext.focusAreas[0] ?? 'Next milestone' },
                  { state: 'target', label: trackContext.focusAreas[1] ?? 'Track goal' },
                ]}
              />
            </View>
          ) : null}

          {xp ? (
            <XPProgressBar
              progress={xp.progress}
              color={accentColor}
              dailyXp={xp.dailyXp}
              dailyGoalTarget={dailyGoal}
            />
          ) : null}

          <SifterButton
            label={trackContext.mode === 'track' ? 'Resume track' : 'Explore tracks'}
            onPress={() => go(continueHref)}
            variant="track"
            color={accentColor}
            size="md"
            style={styles.mobilePrimaryBtn}
          />
        </Animated.View>

        {/* ── Stats: asymmetric 2-column grid with StatTile ── */}
        <Animated.View style={contentStyle}>
          <SectionLabel>Your numbers</SectionLabel>
          <View style={styles.statTileGrid}>
            <StatTile
              value={streak?.streak ?? 0}
              label="Day streak"
              delta={streak?.completedToday ? { trend: 'up', text: 'Checked in today' } : undefined}
              tone={colors.accentRole.status}
              stamp="Active"
              style={styles.statTile}
            />
            <StatTile
              value={xp?.totalXp ?? 0}
              label="Total XP"
              delta={xp?.xpToNextStage != null ? { trend: 'up', text: `${xp.xpToNextStage} to next stage` } : undefined}
              tone={accentColor}
              stamp={`Stage ${stage}`}
              style={styles.statTile}
            />
            <StatTile
              value={xp?.dailyXp ?? 0}
              label="Daily XP"
              suffix={` / ${dailyGoal}`}
              tone={colors.accentRole.success}
              stamp="Today"
              style={styles.statTile}
            />
            <StatTile
              value={`${stage} / 8`}
              label={xp?.stage.name ?? 'Stage'}
              tone={colors.accentRole.status}
              stamp="Level"
              style={styles.statTile}
            />
          </View>
        </Animated.View>

        {/* ── Quick actions ── */}
        <Animated.View style={[styles.actionsSection, contentStyle]}>
          <SectionLabel>{trackContext.mode === 'track' ? 'Next actions' : 'Quick actions'}</SectionLabel>
          <QuickAction iconLabel="GO" label={trackContext.mode === 'track' ? 'Resume Track' : 'Explore Tracks'} sub={trackContext.mode === 'track' ? continueSub : 'Choose a live track to enter'} color={accentColor} onPress={() => go(continueHref)} />
          <QuickAction iconLabel="MAP" label="Explore Tracks" sub="Browse career fields" color={colors.accentRole.success} onPress={() => go('/(tabs)/fields')} />
          <QuickAction iconLabel="NEWS" label="Open Feed" sub="News, data, jobs for your track" color={colors.accentRole.status} onPress={() => go('/(tabs)/feed')} />
          <QuickAction iconLabel="XP" label="Artifacts + XP" sub="View tasks, artifacts, and pushes" color={colors.accentRole.status} onPress={() => go('/(tabs)/portfolio')} />
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
  greeting: { fontSize: FontSize.sm, marginBottom: 2 },
  headline: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.15 },
  mobileHeaderSub: { fontSize: FontSize.sm, lineHeight: 18, marginTop: 6, maxWidth: 280 },
  mobileBoltBtn: { borderWidth: 1, borderRadius: Radius.md, paddingVertical: 8, paddingHorizontal: 14 },

  editorialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  heroRouteCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  heroRouteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroRouteVisual: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  heroRouteCopy: { flex: 1, gap: 4 },
  routeSection: { marginVertical: Spacing.sm },
  statTileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  statTile: { minWidth: 140 },

  streakBanner: { borderRadius: 10, borderWidth: 1, padding: Platform.OS === 'web' ? 10 : 12, marginBottom: Spacing.md },
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

  webBoltBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1 },
  webBoltLabel: { fontSize: 11, fontWeight: '700', maxWidth: 180 },

  webProgressCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  overviewGlobeWrap: { width: 148, aspectRatio: 1, flexShrink: 0 },
  webStageName: { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: 3 },
  webStageDesc: { fontSize: FontSize.xs, lineHeight: 17, marginBottom: 10 },

  heroPanel: { flexDirection: 'row', minHeight: 236 },
  heroPanelCopy: { flex: 1, padding: 18, justifyContent: 'center' },
  heroPanelTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 },
  heroPanelSummary: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: 12, maxWidth: 420 },
  heroPanelTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  heroTag: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  heroTagText: { fontSize: 9, fontWeight: '700' },
  heroPanelBtn: { alignSelf: 'flex-start' },
  heroPanelVisual: { width: 270, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18 },
  heroArtworkGlobe: { width: '100%', maxWidth: 208, aspectRatio: 1 },
  heroArtworkScene: { width: '100%', maxWidth: 220, aspectRatio: 560 / 300 },
  heroPanelMiniCard: { borderWidth: 1, borderRadius: Radius.xl, padding: Platform.OS === 'web' ? 12 : 14, width: '100%' },
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
  overviewTrackSummary: { fontSize: FontSize.xs, lineHeight: 18, marginBottom: 8 },
  webTrackKey: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  webTrackBtn: { marginTop: 10 },

  trackFeatureTitle: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
  trackFeatureSummary: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: 14 },
  trackFeatureGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  trackFeatureItem: { width: '31%', minWidth: 160, borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 12 : 12, gap: 8 },
  trackFeatureIndex: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  trackFeatureItemText: { fontSize: FontSize.sm, lineHeight: 18 },
  primaryActionBtn: { marginTop: 12 },

  webDiscussionCard: { borderRadius: 11, padding: Platform.OS === 'web' ? 12 : 12, borderWidth: 1, marginVertical: 6 },
  webDiscTitle: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: 6 },
  webDiscItem: { fontSize: FontSize.sm, marginBottom: 4 },
  webStreakLabel: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.2, marginBottom: 4 },
  webStreakNum: { fontSize: 18, fontWeight: FontWeight.black, lineHeight: 22, marginBottom: 6 },
  webStreakSub: { fontSize: FontSize.sm },

  webChartArea: { height: 84, borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', marginBottom: 10, padding: 10, alignItems: 'center', justifyContent: 'center' },
  webChartMetrics: { flexDirection: 'row', gap: 32 },
  webMetricVal: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  webMetricLbl: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  mobileHeroCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Platform.OS === 'web' ? 16 : 14, marginBottom: Spacing.lg, gap: Spacing.md },
  mobileHeroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mobileHeroTrackPill: { fontSize: FontSize.xs },
  mobileHeroBody: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  mobileArtworkGlobe: { width: 120, aspectRatio: 1, flexShrink: 0 },
  mobileArtworkScene: { width: 132, aspectRatio: 560 / 300, flexShrink: 0 },
  mobileHeroTitle: { fontSize: FontSize.lg, marginBottom: 4 },
  mobileHeroSummary: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.md },
  mobilePrimaryBtn: {},

  statsGrid: { gap: Spacing.sm, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: { flex: 1, borderRadius: Radius.xl, padding: Platform.OS === 'web' ? 16 : 14, alignItems: 'flex-start', gap: 6, borderWidth: 1 },
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
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.xl, padding: Platform.OS === 'web' ? 16 : 14, borderWidth: 1 },
  quickActionIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickActionIconText: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.7 },
  quickActionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickActionSub: { fontSize: FontSize.xs, marginTop: 2 },
  quickActionArrow: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
});
