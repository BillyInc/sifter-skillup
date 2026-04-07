/**
 * Sifter Skill_Up — Home Screen
 * Mobile: single-column scroll.
 * Web ≥768px: 3-panel dashboard grid matching the Sifter design mockup.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, RefreshControl,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, Shadow,
  AnimPreset, XP_DAILY_GOALS,
} from '../theme';
import { WorkerCharacter, TheBolt } from '../components/CharacterSystem';
import { xpEngine, type XPSnapshot }       from '../lib/XPEngine';
import { streakEngine, type StreakStatus }  from '../lib/StreakEngine';
import { FieldArtwork, fieldColor, fieldEmoji } from '../components/artwork/FieldArtwork';
import { useAuth } from '../hooks/useAuth';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebSectionLabel, WebStatTile, WebListRow, useIsWebWide, GRID_GAP,
} from '../components/web/WebGrid';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Active Track Hero ─────────────────────────────────────────────────────────
// Shown when user has an active track — the living animated object of their field.
// "Harry Potter painting" — always in motion. Replaces the static character section.

function ActiveTrackHero({
  fieldId, trackName, onPress,
}: {
  fieldId: string; trackName: string; onPress: () => void;
}) {
  const { colors }  = useTheme();
  const C           = fieldColor(fieldId);
  const emoji       = fieldEmoji(fieldId);
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;
  const entranceY   = useRef(new Animated.Value(20)).current;
  const entranceO   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.spring(entranceY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(entranceO, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    // Glow pulse on the frame
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0.25, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
    ])).start();
  }, [fieldId]);

  const handlePressIn  = () => Animated.spring(pulseAnim, { toValue: 0.97, tension: 80, friction: 5, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(pulseAnim, { toValue: 1.0,  tension: 80, friction: 5, useNativeDriver: true }).start();

  return (
    <Animated.View style={[
      activeHero.wrap,
      { opacity: entranceO, transform: [{ translateY: entranceY }, { scale: pulseAnim }] },
    ]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        {/* Animated glow border */}
        <Animated.View style={[activeHero.glowBorder, {
          borderColor: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [C + '30', C + '90'],
          }) as any,
        }]} />

        {/* Background gradient */}
        <View style={[activeHero.card, { backgroundColor: colors.card }]}>

          {/* Field label pill */}
          <View style={[activeHero.fieldPill, { backgroundColor: C + '20', borderColor: C + '50' }]}>
            <Text style={activeHero.fieldPillEmoji}>{emoji}</Text>
            <Text style={[activeHero.fieldPillText, { color: C }]}>Your Active Field</Text>
            <View style={[activeHero.liveIndicator, { backgroundColor: C }]} />
          </View>

          {/* Artwork fills the majority of the card */}
          <View style={activeHero.artworkContainer}>
            <FieldArtwork fieldId={fieldId} size={180} />
          </View>

          {/* Track identity */}
          <View style={activeHero.identity}>
            <View style={{ flex: 1 }}>
              <Text style={[activeHero.trackName, { color: '#FFF' }]} numberOfLines={1}>{trackName}</Text>
              <Text style={[activeHero.tapHint, { color: C + '99' }]}>Tap to continue →</Text>
            </View>
            <View style={[activeHero.resumeBtn, { backgroundColor: C }]}>
              <Text style={activeHero.resumeBtnText}>Resume</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatCard({ label, value, sub, color, emoji, onPress }: {
  label: string; value: string; sub?: string; color: string; emoji: string; onPress?: () => void;
}) {
  const { colors } = useTheme();
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        onPressIn={() => Animated.timing(scaleAnim, { toValue: 0.96, ...AnimPreset.tap }).start()}
        onPressOut={() => Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start()}
        onPress={onPress} activeOpacity={1}
        style={[styles.statCard, { backgroundColor: colors.card, borderColor: color + '30' }, Shadow.sm]}
      >
        <Text style={styles.statEmoji}>{emoji}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.textSoft }]}>{label}</Text>
        {sub && <Text style={[styles.statSub, { color: colors.textMuted }]}>{sub}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

function XPProgressBar({ progress, color, dailyXp, dailyGoalTarget }: {
  progress: number; color: string; dailyXp: number; dailyGoalTarget: number;
}) {
  const { colors } = useTheme();
  const fillAnim      = useRef(new Animated.Value(0)).current;
  const dailyFillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim,      { toValue: progress,                               duration: 700, useNativeDriver: false }).start();
    Animated.timing(dailyFillAnim, { toValue: Math.min(1, dailyXp / dailyGoalTarget), duration: 600, useNativeDriver: false }).start();
  }, [progress, dailyXp]);
  const w  = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const dw = dailyFillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ gap: 6 }}>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textSoft }]}>Stage Progress</Text>
        <Text style={[styles.progressValue, { color }]}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.bgSecondary }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: color, width: w }]} />
      </View>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.progressLabel, { color: colors.textSoft }]}>Daily Goal</Text>
        <Text style={[styles.progressValue, { color: colors.xpGreen }]}>{dailyXp} / {dailyGoalTarget} XP</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.bgSecondary }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.xpGreen, width: dw }]} />
      </View>
    </View>
  );
}

function QuickAction({ emoji, label, sub, color, onPress }: {
  emoji: string; label: string; sub: string; color: string; onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '18' }]}>
        <Text style={styles.quickActionEmoji}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.quickActionSub, { color: colors.textMuted }]}>{sub}</Text>
      </View>
      <Text style={[styles.quickActionArrow, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

function StreakBanner({ status }: { status: StreakStatus }) {
  const { colors } = useTheme();
  if (!status.isAtRisk && status.streak < 2) return null;
  const bg  = status.isAtRisk ? colors.orange + '18' : colors.xpGreen + '18';
  const fg  = status.isAtRisk ? colors.orange : colors.xpGreen;
  const msg = status.isAtRisk
    ? `⚠️ Streak at risk! ${status.hoursLeft?.toFixed(0)}h left — do a lesson now.`
    : `🔥 ${status.streak}-day streak! Keep it up.`;
  return (
    <View style={[styles.streakBanner, { backgroundColor: bg }]}>
      <Text style={[styles.streakBannerText, { color: fg }]}>{msg}</Text>
    </View>
  );
}

function WebMiniChart({ color, values }: { color: string; values: number[] }) {
  const max = Math.max(...values);
  return (
    <View style={styles.miniChart}>
      {values.map((v, i) => (
        <View key={i} style={styles.miniChartBarWrap}>
          <View style={[
            styles.miniChartBar,
            { height: `${(v / max) * 100}%` as any, backgroundColor: i === values.length - 1 ? color : color + '50' },
          ]} />
        </View>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const navigation  = useRouter();
  const { colors }  = useTheme();
  const { user }    = useAuth();
  const isWebWide   = useIsWebWide();

  // Active track — drives the animated hero on home
  const activeFieldId  = user?.active_field_id  ?? user?.current_track_id?.split('-').slice(0, -1).join('-') ?? null;
  const activeTrackName = user?.current_track_name ?? user?.current_track_id ?? null;

  const [xp,     setXp]     = useState<XPSnapshot | null>(null);
  const [streak, setStreak] = useState<StreakStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const headerAnim  = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    const [xpSnap, streakSnap] = await Promise.all([xpEngine.snapshot(), streakEngine.status()]);
    setXp(xpSnap); setStreak(streakSnap);
  }, []);

  useFocusEffect(useCallback(() => {
    loadData();
    headerAnim.setValue(0); contentAnim.setValue(0);
    Animated.sequence([
      Animated.timing(headerAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []));

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const stage       = xp?.stage.stage ?? 1;
  const accentColor = colors.accent;
  const dailyGoal   = XP_DAILY_GOALS[xp?.dailyGoalKey ?? 'regular']?.xp ?? 20;

  // ── WEB LAYOUT ──────────────────────────────────────────────────────────────

  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader
            title={`${getGreeting()} — Your desk awaits.`}
            subtitle="Master the markets with elite skills and real portfolio work."
            accentColor={accentColor}
            right={
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile')}
                style={[styles.webBoltBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <TheBolt size={32} animate />
                <Text style={[styles.webBoltLabel, { color: colors.accent }]}>{xp?.stage.name ?? 'Raw Recruit'}</Text>
              </TouchableOpacity>
            }
          />

          {streak && <StreakBanner status={streak} />}

          {/* Row 1: Progress (2) + Stats (1) */}
          <WebRow>
            <WebCol weight={2}>
              <WebCard accentBar accentColor={accentColor}
                title="My Progress"
                titleRight={
                  <View style={[styles.webBadge, { backgroundColor: accentColor + '18' }]}>
                    <Text style={[styles.webBadgeText, { color: accentColor }]}>Stage {stage}/8</Text>
                  </View>
                }
              >
                <View style={styles.webCharRow}>
                  {activeFieldId ? (
                    /* Returning user — living field artwork */
                    <View style={{ alignItems: 'center', marginRight: 16 }}>
                      <FieldArtwork fieldId={activeFieldId} size={120} />
                      <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 6, backgroundColor: fieldColor(activeFieldId) + '20', borderWidth: 1, borderColor: fieldColor(activeFieldId) + '50' }]}>
                        <Text style={{ fontSize: 10, color: fieldColor(activeFieldId), fontWeight: '700' }}>
                          {fieldEmoji(activeFieldId)} {activeTrackName ?? 'Active Track'}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <WorkerCharacter stage={stage} trackId="crypto" size={88} animate mood="neutral" />
                  )}
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={[styles.webStageName, { color: accentColor }]}>{xp?.stage.name ?? 'Raw Recruit'}</Text>
                    <Text style={[styles.webStageDesc, { color: colors.textSoft }]}>
                      {xp?.stage.description ?? 'Just starting out. Empty desk, full potential.'}
                    </Text>
                    {xp && <XPProgressBar progress={xp.progress} color={accentColor} dailyXp={xp.dailyXp} dailyGoalTarget={dailyGoal} />}
                  </View>
                  <WebMiniChart color={accentColor} values={[20, 35, 28, 50, 45, 60, xp?.dailyXp ?? 30]} />
                </View>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Today's Stats" accentBar accentColor={colors.xpGreen}>
                <WebStatTile emoji="🔥" label="Day Streak"  value={`${streak?.streak ?? 0}`}        sub={streak?.completedToday ? 'Done today ✓' : 'Needs a lesson'} color={colors.orange} />
                <WebStatTile emoji="⚡" label="Total XP"    value={`${xp?.totalXp ?? 0}`}           sub={`${xp?.xpToNextStage ?? '—'} to next stage`}                color={accentColor} />
                <WebStatTile emoji="🎯" label="Daily XP"    value={`${xp?.dailyXp ?? 0}`}           sub={`Goal: ${dailyGoal} XP`}                                    color={colors.xpGreen} />
                <WebStatTile emoji="🏆" label="Stage"       value={`${stage} / 8`}                  sub={xp?.stage.name}                                             color={colors.gold} />
              </WebCard>
            </WebCol>
          </WebRow>

          {/* Row 2: 3-col career tracks */}
          <WebSectionLabel label="Career Tracks Overview" action="Explore All →" onAction={() => navigation.navigate('Tracks')} />
          <WebRow cols={3}>
            {[
              { id: 'quant',   name: 'Quant Track',        emoji: '📊', color: colors.accent, keys: ['Derivatives Trading', 'Sharpe Ratio Analysis', 'Algo Strategy Building'] },
              { id: 'supply',  name: 'Supply Chain Track',  emoji: '🔗', color: colors.green,  keys: ['Supply Coin Trading', 'Chain Structures', 'Inventory Optimisation'] },
              { id: 'onchain', name: 'Onchain Track',       emoji: '🔍', color: colors.orange, keys: ['Wallet Analytics', 'Protocol Research', 'On-chain Trading Tracks'] },
            ].map(track => (
              <WebCard key={track.id} accentBar accentColor={track.color} onPress={() => navigation.navigate('Tracks')} style={{ height: '100%' }}>
                <View style={styles.webTrackHeader}>
                  <Text style={styles.webTrackEmoji}>{track.emoji}</Text>
                  <Text style={[styles.webTrackName, { color: colors.text }]}>{track.name}</Text>
                  <Text style={[styles.webTrackArrow, { color: colors.textMuted }]}>›</Text>
                </View>
                <WebMiniChart color={track.color} values={[10, 25, 20, 40, 35, 55, 50]} />
                <View style={{ marginTop: 10, gap: 4 }}>
                  {track.keys.map(k => <Text key={k} style={[styles.webTrackKey, { color: colors.textSoft }]}>✓ {k}</Text>)}
                </View>
                <TouchableOpacity
                  onPress={() => navigation.push('/map/island')}
                  style={[styles.webTrackBtn, { backgroundColor: track.color }]}
                >
                  <Text style={styles.webTrackBtnText}>Continue Track ›</Text>
                </TouchableOpacity>
              </WebCard>
            ))}
          </WebRow>

          {/* Row 3: Guilds (2) + Streak & Challenges (1) */}
          <WebRow>
            <WebCol weight={2}>
              <WebCard title="Guilds & Community" accentBar accentColor={colors.accent}>
                <WebListRow icon="🛡️" title="Alpha Seekers Forum" sub="Active · 1 hr ago" onPress={() => navigation.navigate('Community')} />
                <View style={[styles.webDiscussionCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <Text style={[styles.webDiscTitle, { color: colors.textMuted }]}>ACTIVE DISCUSSIONS</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textSoft }]}>💬 Machine Learning in Alpha Generation</Text>
                  <Text style={[styles.webDiscItem, { color: colors.textSoft }]}>💬 Optimal Portfolio Rebalancing Frequency</Text>
                </View>
                <WebListRow icon="⚡" title="Upcoming Challenges" sub="Evaluating HFT latency effects with your guild…"
                  badge={3} badgeColor={colors.orange} onPress={() => navigation.navigate('Community')} />
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard accentBar accentColor={colors.orange} style={{ marginBottom: GRID_GAP }}>
                <Text style={[styles.webStreakLabel, { color: colors.textMuted }]}>ACTIVE STREAK</Text>
                <Text style={[styles.webStreakNum, { color: colors.orange }]}>{streak?.streak ?? 0} Days</Text>
                <Text style={[styles.webStreakSub, { color: colors.textSoft }]}>
                  {streak?.completedToday ? '✅ Lesson done today' : '📚 Complete a lesson to extend'}
                </Text>
              </WebCard>
              <WebCard title="Upcoming Challenges" accentBar accentColor={colors.xpGreen}>
                <WebListRow icon="🏆" title="Vol Arb Challenge"    sub="Trading Competition"    onPress={() => navigation.navigate('Community')} />
                <WebListRow icon="📈" title="HFT Latency Analysis" sub="Research · 3 days left" badge="3d" badgeColor={colors.accent} onPress={() => navigation.navigate('Community')} />
              </WebCard>
            </WebCol>
          </WebRow>

          {/* Row 4: Portfolio chart (2) + Quick Actions (1) */}
          <WebRow>
            <WebCol weight={2}>
              <WebCard
                title="Portfolio & XP"
                titleRight={<View style={[styles.webBadge, { backgroundColor: colors.xpGreen + '18' }]}><Text style={[styles.webBadgeText, { color: colors.xpGreen }]}>+19.3% YTD</Text></View>}
                accentBar accentColor={colors.xpGreen}
              >
                <View style={[styles.webChartArea, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                  <WebMiniChart color={colors.xpGreen} values={[500, 700, 650, 900, 850, 1100, 1050, 1300, 1250, 1500, 1450, 1700]} />
                </View>
                <View style={styles.webChartMetrics}>
                  <View>
                    <Text style={[styles.webMetricVal, { color: colors.text }]}>{xp?.totalXp ?? 43534} XP</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textMuted }]}>Total XP</Text>
                  </View>
                  <View>
                    <Text style={[styles.webMetricVal, { color: colors.xpGreen }]}>$43,534</Text>
                    <Text style={[styles.webMetricLbl, { color: colors.textMuted }]}>Portfolio YTD</Text>
                  </View>
                </View>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Quick Actions" accentBar accentColor={colors.accent}>
                {[
                  { emoji: '🏝️', label: 'Continue Learning', sub: 'Resume island journey', screen: 'Map' },
                  { emoji: '🌐', label: 'Explore Tracks',    sub: 'Browse career fields',  screen: 'Tracks' },
                  { emoji: '📡', label: 'Information Hub',   sub: 'News, data, jobs',       screen: 'Hub' },
                  { emoji: '💼', label: 'Portfolio',         sub: 'Work & achievements',    screen: 'PortfolioHub' },
                ].map(a => (
                  <WebListRow key={a.screen} icon={a.emoji} title={a.label} sub={a.sub}
                    onPress={() => navigation.navigate(a.screen)}
                    right={<Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>} />
                ))}
              </WebCard>
            </WebCol>
          </WebRow>
        </WebShell>
      </SafeAreaView>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────

  const headerStyle  = { opacity: headerAnim,  transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] };
  const contentStyle = { opacity: contentAnim, transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()}</Text>
            <Text style={[styles.headline, { color: colors.text }]}>Your desk awaits.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
            <TheBolt size={64} animate />
          </TouchableOpacity>
        </Animated.View>

        {streak && <StreakBanner status={streak} />}

        <Animated.View style={[styles.characterSection, contentStyle]}>
          {activeFieldId && activeTrackName ? (
            /* Active track — show living animated field artwork */
            <ActiveTrackHero
              fieldId={activeFieldId}
              trackName={activeTrackName}
              onPress={() => navigation.push('/map/island')}
            />
          ) : (
            /* New user — show worker character */
            <View style={[styles.characterCard, { backgroundColor: colors.card }, Shadow.md]}>
              <WorkerCharacter stage={stage} trackId="crypto" size={100} animate mood="neutral" />
              <View style={styles.characterInfo}>
                <Text style={[styles.stageName, { color: colors.accent }]}>{xp?.stage.name ?? 'Raw Recruit'}</Text>
                <Text style={[styles.stageDesc, { color: colors.textSoft }]} numberOfLines={2}>
                  {xp?.stage.description ?? 'Just starting out. Empty desk, full potential.'}
                </Text>
                {xp && <XPProgressBar progress={xp.progress} color={accentColor} dailyXp={xp.dailyXp} dailyGoalTarget={dailyGoal} />}
              </View>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.statsGrid, contentStyle]}>
          <View style={styles.statsRow}>
            <StatCard emoji="🔥" label="Streak"   color={colors.orange}   value={`${streak?.streak ?? 0}`}  sub={streak?.completedToday ? 'Done today ✓' : 'Do a lesson'} />
            <StatCard emoji="⚡" label="Total XP" color={colors.accent}   value={`${xp?.totalXp ?? 0}`}     sub={`${xp?.xpToNextStage ?? '—'} to next stage`} />
          </View>
          <View style={styles.statsRow}>
            <StatCard emoji="🎯" label="Daily XP" color={colors.xpGreen}  value={`${xp?.dailyXp ?? 0}`}     sub={`Goal: ${dailyGoal} XP`} />
            <StatCard emoji="🏆" label="Stage"    color={colors.gold}     value={`${stage} / 8`}            sub={xp?.stage.name ?? '—'} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.actionsSection, contentStyle]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>QUICK ACTIONS</Text>
          <QuickAction emoji="🏝️" label="Continue Learning" sub="Resume your island journey"      color={colors.accent} onPress={() => navigation.push('/map/island')} />
          <QuickAction emoji="🌐" label="Explore Tracks"    sub="Browse career fields"            color={colors.green}  onPress={() => navigation.navigate('Tracks')} />
          <QuickAction emoji="📡" label="Information Hub"   sub="News, data, jobs for your track" color={colors.orange} onPress={() => navigation.navigate('Hub')} />
          <QuickAction emoji="💼" label="Portfolio"         sub="View your work and achievements"  color={colors.gold}   onPress={() => navigation.navigate('PortfolioHub')} />
        </Animated.View>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1 },
  scroll:   { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  headerLeft: { flex: 1 },
  greeting:   { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginBottom: 2 },
  headline:   { fontSize: FontSize.xxl, fontWeight: FontWeight.black },

  streakBanner:     { borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.lg },
  streakBannerText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, textAlign: 'center' },

  characterSection: { marginBottom: Spacing.lg },
  characterCard:    { borderRadius: Radius.xl, padding: Spacing.lg, flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.lg },
  characterInfo:    { flex: 1 },
  stageName:        { fontSize: FontSize.lg, fontWeight: FontWeight.black, marginBottom: 4 },
  stageDesc:        { fontSize: FontSize.sm, lineHeight: 18, marginBottom: Spacing.md },

  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel:    { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  progressValue:    { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  progressTrack:    { height: 6, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill:     { height: '100%', borderRadius: Radius.full },

  statsGrid: { gap: Spacing.sm, marginBottom: Spacing.lg },
  statsRow:  { flexDirection: 'row', gap: Spacing.sm },
  statCard:  { borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 2, borderWidth: 1 },
  statEmoji: { fontSize: 22, marginBottom: 2 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  statLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  statSub:   { fontSize: 10, fontWeight: FontWeight.medium },

  actionsSection:   { gap: Spacing.sm },
  sectionLabel:     { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: Spacing.xs },
  quickAction:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  quickActionIcon:  { width: 44, height: 44, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  quickActionEmoji: { fontSize: 22 },
  quickActionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  quickActionSub:   { fontSize: FontSize.xs, marginTop: 2 },
  quickActionArrow: { fontSize: FontSize.lg, fontWeight: FontWeight.black },

  webBoltBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: Radius.lg, padding: 10, borderWidth: 1 },
  webBoltLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  webBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  webBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  webCharRow:   { flexDirection: 'row', alignItems: 'flex-start' },
  webStageName: { fontSize: FontSize.xl, fontWeight: FontWeight.black, marginBottom: 4 },
  webStageDesc: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: 12 },

  miniChart:        { height: 52, flexDirection: 'row', alignItems: 'flex-end', gap: 2, width: 80, marginLeft: 8 },
  miniChartBarWrap: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  miniChartBar:     { width: '100%', borderRadius: 2, minHeight: 3 },

  webTrackHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  webTrackEmoji:  { fontSize: 22 },
  webTrackName:   { fontSize: FontSize.md, fontWeight: FontWeight.bold, flex: 1 },
  webTrackArrow:  { fontSize: 18 },
  webTrackKey:    { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  webTrackBtn:    { borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center', marginTop: 12 },
  webTrackBtnText:{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff' },

  webDiscussionCard: { borderRadius: Radius.md, padding: 12, borderWidth: 1, marginVertical: 8 },
  webDiscTitle:      { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: 6 },
  webDiscItem:       { fontSize: FontSize.sm, marginBottom: 4 },

  webStreakLabel: { fontSize: 10, fontWeight: FontWeight.black, letterSpacing: 1.2, marginBottom: 4 },
  webStreakNum:   { fontSize: 34, fontWeight: FontWeight.black, lineHeight: 38, marginBottom: 6 },
  webStreakSub:   { fontSize: FontSize.sm },

  webChartArea:    { height: 90, borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden', marginBottom: 14, padding: 10 },
  webChartMetrics: { flexDirection: 'row', gap: 32 },
  webMetricVal:    { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  webMetricLbl:    { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});

const activeHero = StyleSheet.create({
  wrap:            { marginBottom: Spacing.lg },
  glowBorder:      { ...StyleSheet.absoluteFill, borderRadius: Radius.xl, borderWidth: 2, zIndex: 1 },
  card:            { borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: 'transparent' },
  fieldPill:       { flexDirection: 'row', alignItems: 'center', gap: 6, margin: Spacing.md, marginBottom: 0, alignSelf: 'flex-start', borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  fieldPillEmoji:  { fontSize: 14 },
  fieldPillText:   { fontSize: 11, fontWeight: FontWeight.bold },
  liveIndicator:   { width: 6, height: 6, borderRadius: 3 },
  artworkContainer:{ alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, height: 200 },
  identity:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg, paddingTop: 0 },
  trackName:       { fontSize: FontSize.xl, fontWeight: FontWeight.black, marginBottom: 4 },
  tapHint:         { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  resumeBtn:       { borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 10 },
  resumeBtnText:   { fontSize: FontSize.sm, fontWeight: FontWeight.black, color: '#FFF' },
});
