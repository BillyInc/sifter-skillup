/**
 * Sifter Skill_Up — Profile Screen (Phase 2)
 * Worker character + XP stage ring + DeskScene.
 * Learning path, Portfolio link, Account section.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight, Shadow,
  AnimPreset, XP_STAGES,
} from '../theme';
import { WorkerCharacter, DeskScene } from '../components/CharacterSystem';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebStatTile, WebListRow, WebDivider, useIsWebWide,
} from '../components/web/WebGrid';
import { xpEngine, type XPSnapshot }      from '../lib/XPEngine';
import { streakEngine, type StreakStatus } from '../lib/StreakEngine';
import { useAuth } from '../hooks/useAuth';

// ─── XP stage ring ─────────────────────────────────────────────────────────────

function StageRing({ progress, color, size = 140 }: { progress: number; color: string; size?: number }) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [progress]);

  // Simple progress arc via border trick
  const borderWidth = 5;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={[styles.ringBg, {
        width: size, height: size, borderRadius: size / 2,
        borderWidth,
        borderColor: color + '25',
      }]} />
      {/* Progress arc — approximated with a colored overlay */}
      <Animated.View
        style={[
          styles.ringFg,
          {
            width: size - borderWidth * 2,
            height: size - borderWidth * 2,
            borderRadius: (size - borderWidth * 2) / 2,
            borderWidth,
            borderColor: color,
            borderTopColor: fillAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: ['transparent', color, color, color, color],
            }) as any,
            borderRightColor: fillAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: ['transparent', 'transparent', color, color, color],
            }) as any,
            borderBottomColor: fillAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: ['transparent', 'transparent', 'transparent', color, color],
            }) as any,
            borderLeftColor: fillAnim.interpolate({
              inputRange: [0, 0.25, 0.5, 0.75, 1],
              outputRange: ['transparent', 'transparent', 'transparent', 'transparent', color],
            }) as any,
            transform: [{ rotate: '-90deg' }],
            position: 'absolute',
          },
        ]}
      />
    </View>
  );
}

// ─── Skill bar ────────────────────────────────────────────────────────────────

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const { colors } = useTheme();
  const widthAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: value / 100, duration: 700, useNativeDriver: false }).start();
  }, [value]);

  return (
    <View style={styles.skillBarRow}>
      <Text style={[styles.skillBarLabel, { color: colors.textSoft }]}>{label}</Text>
      <View style={styles.skillBarTrack}>
        <View style={[styles.skillBarBg, { backgroundColor: colors.bgSecondary }]} />
        <Animated.View style={[
          styles.skillBarFill,
          { backgroundColor: color, width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]} />
      </View>
      <Text style={[styles.skillBarPct, { color }]}>{value}%</Text>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadow.sm]}>
      <Text style={[styles.sectionCardTitle, { color: colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Account row ─────────────────────────────────────────────────────────────

function AccountRow({ emoji, label, sub, onPress, color }: {
  emoji: string; label: string; sub?: string; onPress: () => void; color?: string;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.accountRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.accountRowEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.accountRowLabel, { color: color ?? colors.text }]}>{label}</Text>
        {sub && <Text style={[styles.accountRowSub, { color: colors.textMuted }]}>{sub}</Text>}
      </View>
      <Text style={[styles.accountRowArrow, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const navigation = useRouter();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const go = useCallback((href: string) => navigation.push(href as any), [navigation]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } finally {
      navigation.replace('/(auth)');
    }
  }, [signOut, navigation]);

  const [xp, setXp]         = useState<XPSnapshot | null>(null);
  const [streak, setStreak] = useState<StreakStatus | null>(null);

  const entranceAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    (async () => {
      const [xpSnap, streakSnap] = await Promise.all([
        xpEngine.snapshot(),
        streakEngine.status(),
      ]);
      setXp(xpSnap);
      setStreak(streakSnap);
    })();

    entranceAnim.setValue(0);
    Animated.timing(entranceAnim, { toValue: 1, ...AnimPreset.enter }).start();
  }, []));

  const stage     = xp?.stage.stage ?? 1;
  const stageName = xp?.stage.name  ?? 'Raw Recruit';
  const progress  = xp?.progress    ?? 0;

  // Mock skill bars — replace with real data from user profile
  const skillBars = [
    { label: 'DeFi Fundamentals',    value: 82, color: colors.green },
    { label: 'On-Chain Analysis',    value: 65, color: colors.accent },
    { label: 'Smart Contracts',      value: 48, color: colors.orange },
    { label: 'Quant Finance',        value: 30, color: colors.gold },
  ];

  const allStages  = XP_STAGES;
  const isWebWide  = useIsWebWide();

  // ── WEB LAYOUT ──────────────────────────────────────────────────────────────
  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
        <WebShell>
          <WebPageHeader title="Your Profile" subtitle={`${stageName} · Stage ${stage}/8`} accentColor={colors.accent}
            right={
              <TouchableOpacity onPress={() => go('/(tabs)/settings')}
                style={{ padding: 8, borderRadius: Radius.md, backgroundColor: colors.card }}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
              </TouchableOpacity>
            }
          />

          {/* Row 1: Character hero (1/3) + Stats + Skills (2/3) */}
          <WebRow>
            <WebCol weight={1}>
              <WebCard accentBar accentColor={colors.accent}>
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <View style={{ position: 'relative', width: 150, height: 150, alignItems: 'center', justifyContent: 'center' }}>
                    <StageRing progress={progress} color={colors.accent} size={150} />
                    <View style={{ position: 'absolute' }}>
                      <WorkerCharacter stage={stage} trackId="crypto" size={110} animate mood="neutral" />
                    </View>
                  </View>
                  <Text style={[styles.stageName, { color: colors.text, textAlign: 'center', marginTop: 12 }]}>{stageName}</Text>
                  <Text style={[styles.stageDesc, { color: colors.textSoft, textAlign: 'center', marginTop: 4 }]}>
                    {xp?.stage.description ?? 'Building the foundation.'}
                  </Text>
                </View>
                <WebDivider />
                <WebStatTile emoji="⚡" label="Total XP"  value={`${xp?.totalXp ?? 0}`}           sub={`${xp?.xpToNextStage ?? '—'} to Stage ${stage + 1}`} color={colors.accent} />
                <WebStatTile emoji="🔥" label="Streak"    value={`${streak?.streak ?? 0} days`} sub={streak?.completedToday ? 'Done today ✓' : 'Do a lesson'} color={colors.orange} />
                <WebStatTile emoji="🏝️" label="Levels"    value={`${(xp?.totalXp ?? 0) > 0 ? Math.floor((xp?.totalXp ?? 0) / 10) : 0}`} sub="Total lessons completed" color={colors.green} />
              </WebCard>
            </WebCol>

            <WebCol weight={2}>
              <WebCard title="Career Stages" accentBar accentColor={colors.gold} style={{ marginBottom: 20 }}>
                {allStages.map(s => {
                  const isActive   = s.stage === stage;
                  const isComplete = s.stage < stage;
                  return (
                    <View key={s.stage} style={[styles.stageRow, isActive && { backgroundColor: colors.accentSoft, borderRadius: Radius.md }]}>
                      <View style={[styles.stageDot, { backgroundColor: isComplete ? colors.green : isActive ? colors.accent : colors.bgTertiary, borderColor: isActive ? colors.accent : colors.border }]}>
                        <Text style={{ fontSize: 10, color: isComplete || isActive ? '#fff' : colors.textMuted, fontWeight: FontWeight.black }}>{isComplete ? '✓' : s.stage}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.stageRowName, { color: isActive ? colors.accent : colors.textSoft }]}>{s.name}</Text>
                        <Text style={[styles.stageRowRange, { color: colors.textMuted }]}>{s.minXp}–{s.maxXp} XP</Text>
                      </View>
                      {isActive && <View style={[styles.activeTag, { backgroundColor: colors.accent }]}><Text style={styles.activeTagText}>NOW</Text></View>}
                    </View>
                  );
                })}
              </WebCard>

              <WebCard title="Skill Progress" accentBar accentColor={colors.green}>
                {skillBars.map(s => <SkillBar key={s.label} {...s} />)}
              </WebCard>
            </WebCol>
          </WebRow>

          {/* Row 2: Desk scene (2/3) + Account actions (1/3) */}
          <WebRow>
            <WebCol weight={2}>
              <WebCard title="Your Workstation" accentBar accentColor={colors.accent}>
                <DeskScene stage={stage} trackId="crypto" width={480} height={200} />
                <Text style={[styles.deskLabel, { color: colors.textMuted, marginTop: 10 }]}>
                  Stage {stage} — {stageName}. {xp?.xpToNextStage ?? '—'} XP to next upgrade.
                </Text>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Portfolio & Account" accentBar accentColor={colors.gold}>
                <WebListRow icon="💼" title="View Portfolio" sub="Work samples, achievements" onPress={() => go('/(tabs)/portfolio')} right={<Text style={{ color: colors.textMuted }}>›</Text>} />
                <WebListRow icon="🏅" title="Badges & Rewards" sub="Your earned badges" onPress={() => go('/(tabs)/guild')} right={<Text style={{ color: colors.textMuted }}>›</Text>} />
                <WebListRow icon="🛍️" title="Merchandise" sub="Redeem merch credits" onPress={() => go('/merchandise')} right={<Text style={{ color: colors.textMuted }}>›</Text>} />
                <WebListRow icon="🏝️" title="Continue Learning" sub="Resume island journey" onPress={() => go('/(tabs)/map')} right={<Text style={{ color: colors.textMuted }}>›</Text>} />
                <WebListRow icon="⚙️" title="Settings" sub="Theme, notifications, wallet" onPress={() => go('/(tabs)/settings')} right={<Text style={{ color: colors.textMuted }}>›</Text>} />
                <WebDivider />
                <WebListRow icon="🔴" title="Sign Out" sub="" onPress={handleSignOut}
                  right={<Text style={{ color: colors.red }}>›</Text>} />
              </WebCard>
            </WebCol>
          </WebRow>
        </WebShell>
      </SafeAreaView>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero: worker character ── */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: entranceAnim,
              transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
            },
          ]}
        >
          {/* Settings gear */}
          <TouchableOpacity style={styles.settingsBtn} onPress={() => go('/(tabs)/settings')}>
            <Text style={[styles.settingsBtnText, { color: colors.textMuted }]}>⚙️</Text>
          </TouchableOpacity>

          {/* Character with stage ring overlay */}
          <View style={styles.characterWrap}>
            <StageRing progress={progress} color={colors.accent} size={150} />
            <View style={styles.characterOverlay}>
              <WorkerCharacter stage={stage} trackId="crypto" size={110} animate mood="neutral" />
            </View>
          </View>

          <Text style={[styles.stageName, { color: colors.text }]}>{stageName}</Text>
          <Text style={[styles.stageDesc, { color: colors.textSoft }]}>
            {xp?.stage.description ?? ''}
          </Text>

          {/* XP + streak row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: colors.accent }]}>{xp?.totalXp ?? 0}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Total XP</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: colors.orange }]}>{streak?.streak ?? 0}🔥</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Day Streak</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: colors.gold }]}>{stage} / 8</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textMuted }]}>Stage</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Desk scene ── */}
        <Animated.View style={{ opacity: entranceAnim }}>
          <SectionCard title="YOUR WORKSTATION">
            <DeskScene stage={stage} trackId="crypto" width={320} height={160} />
            <Text style={[styles.deskLabel, { color: colors.textMuted }]}>
              Stage {stage} — {stageName}. {xp?.xpToNextStage ?? '—'} XP to next upgrade.
            </Text>
          </SectionCard>
        </Animated.View>

        {/* ── Stage progress ── */}
        <SectionCard title="CAREER STAGES">
          {allStages.map((s) => {
            const isActive   = s.stage === stage;
            const isComplete = s.stage < stage;
            return (
              <View key={s.stage} style={[styles.stageRow, isActive && { backgroundColor: colors.accentSoft, borderRadius: Radius.md }]}>
                <View style={[styles.stageDot, {
                  backgroundColor: isComplete ? colors.green : isActive ? colors.accent : colors.bgTertiary,
                  borderColor: isActive ? colors.accent : colors.border,
                }]}>
                  <Text style={{ fontSize: 10, color: isComplete || isActive ? '#fff' : colors.textMuted, fontWeight: FontWeight.black }}>
                    {isComplete ? '✓' : s.stage}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stageRowName, { color: isActive ? colors.accent : colors.textSoft }]}>{s.name}</Text>
                  <Text style={[styles.stageRowRange, { color: colors.textMuted }]}>{s.minXp}–{s.maxXp} XP</Text>
                </View>
                {isActive && (
                  <View style={[styles.activeTag, { backgroundColor: colors.accent }]}>
                    <Text style={styles.activeTagText}>NOW</Text>
                  </View>
                )}
              </View>
            );
          })}
        </SectionCard>

        {/* ── Skills ── */}
        <SectionCard title="SKILL PROGRESS">
          {skillBars.map(s => <SkillBar key={s.label} {...s} />)}
        </SectionCard>

        {/* ── Portfolio + Account ── */}
        <SectionCard title="PORTFOLIO & ACCOUNT">
          <AccountRow
            emoji="💼" label="View Portfolio"
            sub="Work samples, achievements, resume"
            onPress={() => go('/(tabs)/portfolio')}
          />
          <AccountRow
            emoji="🏝️" label="Continue Learning"
            sub="Resume your island journey"
            onPress={() => go('/(tabs)/map')}
          />
          <AccountRow
            emoji="⚙️" label="Settings"
            sub="Theme, notifications, wallet"
            onPress={() => go('/(tabs)/settings')}
          />
          <AccountRow
            emoji="🔴" label="Sign Out"
            onPress={handleSignOut}
            color={colors.red}
          />
        </SectionCard>

        <View style={{ height: Spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:           { flex: 1 },
  scroll:           { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.lg },

  heroSection:      { alignItems: 'center', paddingTop: Spacing.lg, paddingBottom: Spacing.sm, position: 'relative' },
  settingsBtn:      { position: 'absolute', top: Spacing.lg, right: 0 },
  settingsBtnText:  { fontSize: 22 },
  characterWrap:    { position: 'relative', alignItems: 'center', justifyContent: 'center', width: 150, height: 150 },
  characterOverlay: { position: 'absolute' },
  ringBg:           { position: 'absolute' },
  ringFg:           {},
  stageName:        { fontSize: FontSize.xl, fontWeight: FontWeight.black, marginTop: Spacing.md },
  stageDesc:        { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 280, marginTop: 4, lineHeight: 18 },
  heroStats:        { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, gap: 0 },
  heroStat:         { flex: 1, alignItems: 'center' },
  heroStatValue:    { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  heroStatLabel:    { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, marginTop: 2 },
  heroStatDivider:  { width: 1, height: 32 },

  sectionCard:      { borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, gap: Spacing.md },
  sectionCardTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.black, letterSpacing: 0.8, marginBottom: Spacing.xs },

  deskLabel:        { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.sm },

  stageRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm },
  stageDot:         { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stageRowName:     { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  stageRowRange:    { fontSize: FontSize.xs, marginTop: 1 },
  activeTag:        { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  activeTagText:    { fontSize: 9, fontWeight: FontWeight.black, color: '#fff' },

  skillBarRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  skillBarLabel:    { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, width: 130 },
  skillBarTrack:    { flex: 1, height: 7, borderRadius: Radius.full, position: 'relative', overflow: 'hidden' },
  skillBarBg:       { ...StyleSheet.absoluteFillObject },
  skillBarFill:     { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: Radius.full },
  skillBarPct:      { fontSize: FontSize.xs, fontWeight: FontWeight.black, width: 34, textAlign: 'right' },

  accountRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  accountRowEmoji:  { fontSize: 22 },
  accountRowLabel:  { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  accountRowSub:    { fontSize: FontSize.xs, marginTop: 2 },
  accountRowArrow:  { fontSize: FontSize.xl },
});
