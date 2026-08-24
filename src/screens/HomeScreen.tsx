import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
import Animated, { useSharedValue, withTiming, useAnimatedStyle, withDelay } from 'react-native-reanimated';
import { RouteLine, StatTile, SectionLabel } from '@/components/careerIntelligence';
import {
  CompassFonts,
  FontSize,
  Radius,
  Spacing,
  XP_DAILY_GOALS,
  useTheme,
} from '@/theme';
import { Badge, SifterButton, SifterCard } from '@/components/ui';
import TrackScene from '@/components/artwork/TrackIsometricScene';
import IslandGlobe, { DEFAULT_ISLAND_PINS } from '@/components/artwork/IslandGlobe';
import { useResponsive } from '@/hooks/useResponsive';
import { xpEngine, type XPSnapshot } from '@/lib/XPEngine';
import { resolveTrackContext } from '@/lib/trackContext';
// Home links to the fourth destination; it must call it whatever the nav calls it.
import { WORLD_NAV } from '@/lib/worldNav';
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
} from '@/components/web/WebGrid';

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
  const fillAnim = useSharedValue(0);
  const dailyFillAnim = useSharedValue(0);

  useEffect(() => {
    fillAnim.value = withTiming(progress, { duration: 650 });
    dailyFillAnim.value = withTiming(Math.min(1, dailyXp / Math.max(1, dailyGoalTarget)), { duration: 650 });
  }, [dailyFillAnim, dailyGoalTarget, dailyXp, fillAnim, progress]);

  const fillWidthStyle = useAnimatedStyle(() => ({
    width: `${fillAnim.value * 100}%`,
  }));
  const dailyFillWidthStyle = useAnimatedStyle(() => ({
    width: `${dailyFillAnim.value * 100}%`,
  }));

  return (
    <View style={{ gap: 6 }}>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textRole.secondary }, CompassFonts.bodySemibold]}>Stage Progress</Text>
        <Text style={[styles.progressValue, { color }, CompassFonts.bodyBold]}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surface.subtle }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: color }, fillWidthStyle]} />
      </View>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textRole.secondary }, CompassFonts.bodySemibold]}>Daily Goal</Text>
        <Text style={[styles.progressValue, { color: colors.accentRole.success }, CompassFonts.bodyBold]}>{dailyXp} / {dailyGoalTarget} XP</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surface.subtle }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.accentRole.success }, dailyFillWidthStyle]} />
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
          <Text style={[styles.heroPanelTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text>
          <Text style={[styles.heroPanelSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>{summary}</Text>
          <View style={styles.heroPanelTags}>
            {focusAreas.map((item) => (
              <View key={item} style={[styles.heroTag, { backgroundColor: colors.surface.subtle }]}>
                <Text style={[styles.heroTagText, { color: colors.textRole.secondary }, CompassFonts.data]}>{item}</Text>
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
            <Text style={[styles.heroPanelMiniLabel, { color: colors.textRole.muted }, CompassFonts.data]}>Momentum</Text>
            <WebMiniChart color={accentColor} values={chartValues} />
          </View>
        </View>
      </View>
    </WebCard>
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
        <Text style={[styles.quickActionIconText, { color }, CompassFonts.data]}>{iconLabel}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.quickActionLabel, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{label}</Text>
        <Text style={[styles.quickActionSub, { color: colors.textRole.muted }, CompassFonts.body]}>{sub}</Text>
      </View>
      <Text style={[styles.quickActionArrow, { color: colors.textRole.muted }, CompassFonts.data]}>{'>'}</Text>
    </SifterCard>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const resp = useResponsive();
  const go = useCallback((href: string) => router.push(href as any), [router]);
  const trackContext = useMemo(() => resolveTrackContext(null), []);
  const resumeSummary = null;

  const [xp, setXp] = useState<XPSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim = useSharedValue(0);
  const contentAnim = useSharedValue(0);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerAnim.value,
    transform: [{ translateY: -20 + headerAnim.value * 20 }],
  }));
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentAnim.value,
    transform: [{ translateY: 16 - contentAnim.value * 16 }],
  }));

  const loadData = useCallback(async () => {
    const xpSnap = await xpEngine.snapshot();
    setXp(xpSnap);
  }, []);

  useFocusEffect(useCallback(() => {
    void loadData();
    headerAnim.value = 0;
    contentAnim.value = 0;
    headerAnim.value = withTiming(1, { duration: 420 });
    contentAnim.value = withDelay(420, withTiming(1, { duration: 320 }));
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
    trackContext.mode === 'overview' ||
    trackContext.artFieldId === 'crypto' ||
    !trackContext.trackId;
  const heroVisual = isCryptoOrIsland ? 'globe' : 'isometric';
  const trackAwarePins = useMemo(() => buildTrackAwarePins(trackContext), [trackContext]);
  const continueHref = '/(tabs)/explore';
  const continueLabel = trackContext.mode === 'track'
    ? (resumeSummary ? 'Continue where you left off' : trackContext.continueLabel)
    : 'Explore guidance';
  const heroSummary = trackContext.mode === 'track' && resumeSummary
    ? `${trackContext.heroSummary} ${resumeSummary}.`
    : trackContext.heroSummary;

  const isDesktopWeb = resp.isDesktop && resp.isWeb;

  if (isDesktopWeb) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <WebShell>
          <WebPageHeader
            title={trackContext.mode === 'track' ? `${trackContext.trackName} Dashboard` : `${getGreeting()}, your dashboard is ready.`}
            subtitle={trackContext.mode === 'track' ? trackContext.tagline : 'Your guidance, XP, and next move in one compact workspace.'}
            accentColor={accentColor}
            right={(
              <TouchableOpacity
                onPress={() => go('/(tabs)/profile')}
                style={[styles.webActionBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
              >
                <Text style={[styles.webBoltLabel, { color: accentColor }, CompassFonts.bodyBold]}>{trackContext.mode === 'track' ? trackContext.trackName : (xp?.stage.name ?? 'Raw Recruit')}</Text>
              </TouchableOpacity>
            )}
          />

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
                      <Text style={[styles.webStageName, { color: colors.accentRole.action }, CompassFonts.displayBold]}>{xp?.stage.name ?? 'Raw Recruit'}</Text>
                      <Text style={[styles.webStageDesc, { color: colors.textRole.secondary }, CompassFonts.body]}>
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
                <WebStatTile emoji="NEXT" label="Next action" value={resumeSummary ? 'Resume' : 'Explore'} sub={resumeSummary ?? 'Choose a programme, domain, or route'} color={colors.accentRole.status} />
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
              <WebSectionLabel label="Continue your guidance" action="Open Explore >" onAction={() => go('/(tabs)/explore')} />
              <WebRow>
                <WebCol weight={2}>
                  <WebCard accentBar accentColor={accentColor}>
                    <Text style={[styles.trackFeatureTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{trackContext.challengeTitle}</Text>
                    <Text style={[styles.trackFeatureSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>{trackContext.challengeSummary}</Text>
                    <View style={styles.trackFeatureGrid}>
                      {trackContext.focusAreas.map((item, index) => (
                        <View key={item} style={[styles.trackFeatureItem, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                          <Text style={[styles.trackFeatureIndex, { color: accentColor }, CompassFonts.data]}>{`0${index + 1}`}</Text>
                          <Text style={[styles.trackFeatureItemText, { color: colors.textRole.secondary }, CompassFonts.body]}>{item}</Text>
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
            <WebCard title="Continue your guidance" accentBar accentColor={colors.accentRole.action}>
              <Text style={[styles.trackFeatureSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>
                Explore programmes, universities, domains, roles, and admission requirements from one place.
              </Text>
              <SifterButton
                label="Open Explore"
                onPress={() => go('/(tabs)/explore')}
                variant="track"
                color={colors.accentRole.action}
                size="sm"
                style={styles.primaryActionBtn}
              />
            </WebCard>
          )}

          <WebRow>
            <WebCol weight={2}>
              <WebCard title="Saved guidance" accentBar accentColor={colors.accentRole.action}>
                <WebListRow icon="WORLD" title={WORLD_NAV.label} sub="Saved programmes, domains, roles, and notes" onPress={() => go('/(tabs)/myworld')} />
                <View style={[styles.webDiscussionCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.webDiscTitle, { color: colors.textRole.muted }, CompassFonts.data]}>NEXT GUIDANCE STEP</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textRole.secondary }, CompassFonts.body]}>Compare programmes, universities, and admission requirements in Explore.</Text>
                </View>
                <WebListRow icon="MAP" title="Explore" sub="Continue your programme and career guidance" onPress={() => go('/(tabs)/explore')} />
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard accentBar accentColor={colors.accentRole.status} style={{ marginBottom: GRID_GAP }}>
                <Text style={[styles.webStreakLabel, { color: colors.textRole.muted }, CompassFonts.data]}>CAREER CONTEXT</Text>
                <Text style={[styles.webStreakNum, { color: colors.accentRole.status }, CompassFonts.data]}>{resumeSummary ? 'In progress' : 'Ready'}</Text>
                <Text style={[styles.webStreakSub, { color: colors.textRole.secondary }, CompassFonts.body]}>
                  {resumeSummary ?? 'Start from Explore to compare programmes, schools, and pathways.'}
                </Text>
              </WebCard>
              <WebCard title="Signals" accentBar accentColor={colors.accentRole.success}>
                <WebListRow icon="MAP" title="Explore guidance" sub="Programmes, universities, domains, and roles" onPress={() => go('/(tabs)/explore')} />
                <WebListRow icon="WORLD" title={WORLD_NAV.label} sub="Saved programmes, domains, roles, and notes" badge={WORLD_NAV.label === 'Saved' ? undefined : 'Saved'} badgeColor={accentColor} onPress={() => go('/(tabs)/myworld')} />
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
                    <Text style={[styles.webMetricVal, { color: colors.textRole.primary }, CompassFonts.data]}>{xp?.totalXp ?? 0} XP</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textRole.muted }, CompassFonts.data]}>Total XP</Text>
                  </View>
                  <View>
                    <Text style={[styles.webMetricVal, { color: accentColor }, CompassFonts.data]}>{trackContext.trackName}</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textRole.muted }, CompassFonts.data]}>Current Track</Text>
                  </View>
                </View>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Quick Actions" accentBar accentColor={trackContext.mode === 'track' ? accentColor : colors.accentRole.action}>
                {[
                  { emoji: 'MAP', label: 'Explore Pathways', sub: 'Browse programmes, roles, and pathways', route: '/(tabs)/explore' },
                  { emoji: 'WORLD', label: WORLD_NAV.label, sub: 'Your saved items, notes, and Feed', route: '/(tabs)/myworld' },
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

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />}
      >
        {/* ── Editorial header ── */}
        <Animated.View style={[styles.editorialHeader, headerAnimatedStyle]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>
              {trackContext.mode === 'track' ? trackContext.heroEyebrow : getGreeting()}
            </Text>
            <Text style={[styles.headline, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
              {trackContext.mode === 'track' ? trackContext.trackName : 'Your dashboard'}
            </Text>
            <Text style={[styles.mobileHeaderSub, CompassFonts.body, { color: colors.textRole.secondary }]}>
              {trackContext.mode === 'track' ? trackContext.tagline : 'Guidance, XP, and next actions in one place.'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => go('/(tabs)/profile')}
            activeOpacity={0.85}
            style={[styles.mobileActionBtn, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.webBoltLabel, { color: accentColor }, CompassFonts.bodyBold]}>
              {trackContext.mode === 'track' ? trackContext.trackName : (xp?.stage.name ?? 'Raw Recruit')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Hero: Your Route card ── */}
        <Animated.View style={[styles.heroRouteCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, contentAnimatedStyle]}>
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
            label="Open Explore"
            onPress={() => go(continueHref)}
            variant="track"
            color={accentColor}
            size="md"
            style={styles.mobilePrimaryBtn}
          />
        </Animated.View>

        {/* ── Stats: asymmetric 2-column grid with StatTile ── */}
        <Animated.View style={contentAnimatedStyle}>
          <SectionLabel>Your numbers</SectionLabel>
          <View style={styles.statTileGrid}>
            <StatTile
              value={resumeSummary ? 'Resume' : 'Explore'}
              label="Next action"
              delta={resumeSummary ? { trend: 'up', text: resumeSummary } : { trend: 'up', text: 'Choose a route' }}
              tone={colors.accentRole.status}
              stamp="Guidance"
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
        <Animated.View style={[styles.actionsSection, contentAnimatedStyle]}>
          <SectionLabel>{trackContext.mode === 'track' ? 'Next actions' : 'Quick actions'}</SectionLabel>
          <QuickAction iconLabel="MAP" label="Explore guidance" sub="Browse programmes, universities, domains, and roles" color={accentColor} onPress={() => go(continueHref)} />
          <QuickAction iconLabel="MAP" label="Explore Pathways" sub="Browse programmes, roles, and pathways" color={colors.accentRole.success} onPress={() => go('/(tabs)/explore')} />
          <QuickAction iconLabel="WORLD" label={WORLD_NAV.label} sub="Saved items, notes, and Feed" color={colors.accentRole.status} onPress={() => go('/(tabs)/myworld')} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: Spacing.xxxl, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FontSize.sm, marginBottom: 2 },
  headline: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.15 },
  mobileHeaderSub: { fontSize: FontSize.sm, lineHeight: 18, marginTop: 6, maxWidth: 280 },
  mobileActionBtn: { borderWidth: 1, borderRadius: Radius.md, paddingVertical: 8, paddingHorizontal: 14 },

  editorialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  heroRouteCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.lg, gap: Spacing.md },
  heroRouteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroRouteVisual: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  heroRouteCopy: { flex: 1, gap: 4 },
  routeSection: { marginVertical: Spacing.sm },
  statTileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  statTile: { minWidth: 140 },

  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: FontSize.xs },
  progressValue: { fontSize: FontSize.xs },
  progressTrack: { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.full },

  miniChart: { height: 58, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: 92 },
  miniChartBarWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  miniChartBar: { width: '100%', borderRadius: 2, minHeight: 3 },

  referenceBadgeWrap: { alignSelf: 'flex-start', marginBottom: 10 },

  webActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1 },
  webBoltLabel: { fontSize: 11, maxWidth: 180 },

  webProgressCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  overviewGlobeWrap: { width: 148, aspectRatio: 1, flexShrink: 0 },
  webStageName: { fontSize: FontSize.lg, marginBottom: 3 },
  webStageDesc: { fontSize: FontSize.xs, lineHeight: 17, marginBottom: 10 },

  heroPanel: { flexDirection: 'row', minHeight: 236 },
  heroPanelCopy: { flex: 1, padding: 18, justifyContent: 'center' },
  heroPanelTitle: { fontSize: 17, letterSpacing: -0.5, marginBottom: 8 },
  heroPanelSummary: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: 12, maxWidth: 420 },
  heroPanelTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  heroTag: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  heroTagText: { fontSize: 9 },
  heroPanelBtn: { alignSelf: 'flex-start' },
  heroPanelVisual: { width: 270, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18 },
  heroArtworkGlobe: { width: '100%', maxWidth: 208, aspectRatio: 1 },
  heroArtworkScene: { width: '100%', maxWidth: 220, aspectRatio: 560 / 300 },
  heroPanelMiniCard: { borderWidth: 1, borderRadius: Radius.xl, padding: Platform.OS === 'web' ? 12 : 14, width: '100%' },
  heroPanelMiniLabel: { fontSize: FontSize.xs, marginBottom: 8 },

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
  trackIconBadgeText: { fontSize: 9, letterSpacing: 0.4 },
  webTrackName: { fontSize: FontSize.md, flex: 1 },
  webTrackArrow: { fontSize: 18 },
  overviewTrackSummary: { fontSize: FontSize.xs, lineHeight: 18, marginBottom: 8 },
  webTrackKey: { fontSize: FontSize.xs },
  webTrackBtn: { marginTop: 10 },

  trackFeatureTitle: { fontSize: 13, marginBottom: 10 },
  trackFeatureSummary: { fontSize: FontSize.sm, lineHeight: 20, marginBottom: 14 },
  trackFeatureGrid: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  trackFeatureItem: { width: '31%', minWidth: 160, borderRadius: 11, borderWidth: 1, padding: Platform.OS === 'web' ? 12 : 12, gap: 8 },
  trackFeatureIndex: { fontSize: FontSize.md },
  trackFeatureItemText: { fontSize: FontSize.sm, lineHeight: 18 },
  primaryActionBtn: { marginTop: 12 },

  webDiscussionCard: { borderRadius: 11, padding: Platform.OS === 'web' ? 12 : 12, borderWidth: 1, marginVertical: 6 },
  webDiscTitle: { fontSize: 10, letterSpacing: 0.8, marginBottom: 6 },
  webDiscItem: { fontSize: FontSize.sm, marginBottom: 4 },
  webStreakLabel: { fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  webStreakNum: { fontSize: 18, lineHeight: 22, marginBottom: 6 },
  webStreakSub: { fontSize: FontSize.sm },

  webChartArea: { height: 84, borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', marginBottom: 10, padding: 10, alignItems: 'center', justifyContent: 'center' },
  webChartMetrics: { flexDirection: 'row', gap: 32 },
  webMetricVal: { fontSize: FontSize.xl },
  webMetricLbl: { fontSize: FontSize.xs },

  mobileHeroTrackPill: { fontSize: FontSize.xs },
  mobileArtworkGlobe: { width: 120, aspectRatio: 1, flexShrink: 0 },
  mobileArtworkScene: { width: 132, aspectRatio: 560 / 300, flexShrink: 0 },
  mobileHeroTitle: { fontSize: FontSize.lg, marginBottom: 4 },
  mobileHeroSummary: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.md },
  mobilePrimaryBtn: {},

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
  statBadgeText: { fontSize: 9, letterSpacing: 0.6 },
  statValue: { fontSize: FontSize.xl },
  statLabel: { fontSize: FontSize.xs },
  statSub: { fontSize: 10, textAlign: 'left' },

  actionsSection: { gap: Spacing.sm },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.xl, padding: Platform.OS === 'web' ? 16 : 14, borderWidth: 1 },
  quickActionIcon: { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickActionIconText: { fontSize: 10, letterSpacing: 0.7 },
  quickActionLabel: { fontSize: FontSize.md },
  quickActionSub: { fontSize: FontSize.xs, marginTop: 2 },
  quickActionArrow: { fontSize: FontSize.lg },
});
