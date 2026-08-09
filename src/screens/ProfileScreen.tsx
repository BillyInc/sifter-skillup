/**
 * Sifter LevelUp — Profile Screen (Phase 2)
 * Worker character + XP stage ring + DeskScene.
 * Learning path, Portfolio link, Account section.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  useTheme, Spacing, Radius, FontSize, Shadow,
  AnimPreset, XP_STAGES, webContainer, CompassFonts,
} from '@/theme';
import { WorkerCharacter, DeskScene } from '@/components/CharacterSystem';
import {
  WebShell, WebPageHeader, WebRow, WebCol, WebCard,
  WebStatTile, WebDivider, useIsWebWide,
} from '@/components/web/WebGrid';
import { xpEngine, type XPSnapshot }      from '@/lib/XPEngine';
import { streakEngine, type StreakStatus } from '@/lib/StreakEngine';
import { useAuth } from '@/hooks/useAuth';
import { resolveTrackContext } from '@/lib/trackContext';
import { isAdminAccount } from '@/lib/accountType';
import { getEducatorProfile } from '@/lib/educatorProfile';
import { adminHomeForProfile } from '@/lib/adminAudience';

// ─── XP stage ring ─────────────────────────────────────────────────────────────

function StageRing({ progress, color, size = 140 }: { progress: number; color: string; size?: number }) {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: progress, duration: 800, useNativeDriver: false }).start();
  }, [fillAnim, progress]);

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
  }, [value, widthAnim]);

  return (
    <View style={styles.skillBarRow}>
      <Text style={[styles.skillBarLabel, { color: colors.textRole.secondary }, CompassFonts.bodySemibold]}>{label}</Text>
      <View style={styles.skillBarTrack}>
        <View style={[styles.skillBarBg, { backgroundColor: colors.surface.subtle }]} />
        <Animated.View style={[
          styles.skillBarFill,
          { backgroundColor: color, width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]} />
      </View>
      <Text style={[styles.skillBarPct, { color }, CompassFonts.displayBold]}>{value}%</Text>
    </View>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
      <Text style={[styles.sectionCardTitle, { color: colors.textRole.muted }, CompassFonts.displayBold]}>{title}</Text>
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
        <Text style={[styles.accountRowLabel, { color: color ?? colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text>
        {sub && <Text style={[styles.accountRowSub, { color: colors.textRole.muted }]}>{sub}</Text>}
      </View>
      <Text style={[styles.accountRowArrow, { color: colors.textRole.muted }]}>›</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const navigation = useRouter();
  const { colors } = useTheme();
  const { signOut, user } = useAuth();
  const go = useCallback((href: string) => navigation.push(href as any), [navigation]);
  const trackContext = React.useMemo(() => resolveTrackContext(user), [user]);
  const isGuest = user?.auth_provider === 'guest';
  const isAdmin = isAdminAccount(user?.account_type);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } finally {
      navigation.replace('/(auth)/sign-in');
    }
  }, [signOut, navigation]);

  const handleAdminWorkspace = useCallback(async () => {
    const profile = await getEducatorProfile();
    go(adminHomeForProfile(profile));
  }, [go]);

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
  }, [entranceAnim]));

  const stage     = xp?.stage.stage ?? 1;
  const stageName = xp?.stage.name  ?? 'Raw Recruit';
  const progress  = xp?.progress    ?? 0;
  const workspaceHref = trackContext.mode === 'track' ? trackContext.continueHref : '/(tabs)/fields';
  const workspaceLabel = trackContext.mode === 'track' ? trackContext.trackName : 'Choose a workspace';
  const workspaceBody = trackContext.mode === 'track'
    ? trackContext.description
    : 'Select an active track so your profile, streaks, and portfolio all stay aligned.';
  const trackId = trackContext.fieldId ?? user?.activeFieldId ?? user?.active_field_id ?? 'crypto';

  // Mock skill bars — replace with real data from user profile
  const skillBars = [
    { label: 'DeFi Fundamentals',    value: 82, color: colors.accentRole.success },
    { label: 'On-Chain Analysis',    value: 65, color: colors.accentRole.action },
    { label: 'Smart Contracts',      value: 48, color: colors.accentRole.warning },
    { label: 'Quant Finance',        value: 30, color: colors.accentRole.status },
  ];

  const allStages  = XP_STAGES;
  const isWebWide  = useIsWebWide();

  // ── WEB LAYOUT ──────────────────────────────────────────────────────────────
  if (isWebWide) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
        <WebShell>
          <WebPageHeader title="Profile" subtitle={`${workspaceLabel} · ${stageName} · Stage ${stage}/8`} accentColor={colors.accentRole.action}
            right={
              <TouchableOpacity onPress={() => go('/(tabs)/settings')}
                style={{ padding: 8, borderRadius: Radius.md, backgroundColor: colors.surface.raised }}>
                <Text style={{ fontSize: 20 }}>⚙️</Text>
              </TouchableOpacity>
            }
          />

          {/* Row 1: Character hero (1/3) + Stats + Skills (2/3) */}
          <WebRow>
            <WebCol weight={1}>
              <WebCard accentBar accentColor={colors.accentRole.action}>
                <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <View style={{ position: 'relative', width: 150, height: 150, alignItems: 'center', justifyContent: 'center' }}>
                    <StageRing progress={progress} color={colors.accentRole.action} size={150} />
                    <View style={{ position: 'absolute' }}>
                      <WorkerCharacter stage={stage} trackId={trackId} size={110} mood="neutral" />
                    </View>
                  </View>
                  <Text style={[styles.stageName, { color: colors.textRole.primary, textAlign: 'center', marginTop: 12 }, CompassFonts.displayBold]}>{stageName}</Text>
                  <Text style={[styles.stageDesc, { color: colors.textRole.secondary, textAlign: 'center', marginTop: 4 }]}>
                    {xp?.stage.description ?? 'Building the foundation.'}
                  </Text>
                </View>
                <WebDivider />
                <AccountRow
                  emoji="M"
                  label="Merchandise"
                  sub="Spend merch credits on apparel and shoes"
                  onPress={() => go('/merchandise')}
                />
                <WebStatTile emoji="⚡" label="Total XP"  value={`${xp?.totalXp ?? 0}`}           sub={`${xp?.xpToNextStage ?? '—'} to Stage ${stage + 1}`} color={colors.accentRole.action} />
                <WebStatTile emoji="🔥" label="Streak"    value={`${streak?.streak ?? 0} days`} sub={streak?.completedToday ? 'Done today ✓' : 'Do a lesson'} color={colors.accentRole.warning} />
                <WebStatTile emoji="🏝️" label="Levels"    value={`${(xp?.totalXp ?? 0) > 0 ? Math.floor((xp?.totalXp ?? 0) / 10) : 0}`} sub="Total lessons completed" color={colors.accentRole.success} />
              </WebCard>
            </WebCol>

            <WebCol weight={2}>
              <WebCard title="Career Stages" accentBar accentColor={colors.accentRole.status} style={{ marginBottom: 20 }}>
                {allStages.map(s => {
                  const isActive   = s.stage === stage;
                  const isComplete = s.stage < stage;
                  return (
                    <View key={s.stage} style={[styles.stageRow, isActive && { backgroundColor: `${colors.accentRole.action}14`, borderRadius: Radius.md }]}>
                      <View style={[styles.stageDot, { backgroundColor: isComplete ? colors.accentRole.success : isActive ? colors.accentRole.action : colors.surface.sunken, borderColor: isActive ? colors.accentRole.action : colors.borderRole.subtle }]}>
                        <Text style={[{ fontSize: 10, color: isComplete || isActive ? colors.surface.inverse : colors.textRole.muted }, CompassFonts.displayBold]}>{isComplete ? '✓' : s.stage}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.stageRowName, { color: isActive ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodyBold]}>{s.name}</Text>
                        <Text style={[styles.stageRowRange, { color: colors.textRole.muted }]}>{s.minXp}–{s.maxXp} XP</Text>
                      </View>
                      {isActive && <View style={[styles.activeTag, { backgroundColor: colors.accentRole.action }]}><Text style={[styles.activeTagText, CompassFonts.displayBold]}>NOW</Text></View>}
                    </View>
                  );
                })}
              </WebCard>

              <WebCard title="Current Focus" accentBar accentColor={colors.accentRole.success}>
                <Text style={[styles.supportingCopy, { color: colors.textRole.secondary }]}>
                  These focus areas show what this workspace is currently emphasizing.
                </Text>
                {skillBars.map(s => <SkillBar key={s.label} {...s} />)}
              </WebCard>
            </WebCol>
          </WebRow>

          {/* Row 2: Desk scene (2/3) + Account actions (1/3) */}
          <WebRow>
            <WebCol weight={2}>
              <WebCard title="Your Workstation" accentBar accentColor={colors.accentRole.action}>
                <DeskScene stage={stage} trackId={trackId} width={480} height={200} />
                <Text style={[styles.deskLabel, { color: colors.textRole.muted, marginTop: 10 }]}>
                  Stage {stage} · {stageName}. {xp?.xpToNextStage ?? '—'} XP to the next upgrade.
                </Text>
              </WebCard>
            </WebCol>

            <WebCol weight={1}>
              <WebCard title="Workspace + Account" accentBar accentColor={colors.accentRole.status}>
                <Text style={[styles.workspaceLabel, { color: colors.textRole.muted }, CompassFonts.displayBold]}>ACTIVE WORKSPACE</Text>
                <Text style={[styles.workspaceTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{workspaceLabel}</Text>
                <Text style={[styles.workspaceBody, { color: colors.textRole.secondary }]}>{workspaceBody}</Text>
                <WebDivider />
                {isGuest ? (
                  <AccountRow
                    emoji="G"
                    label="Guest session"
                    sub="Explore is open; saves, notes and alerts require an account"
                    onPress={() => go('/(auth)/signup')}
                  />
                ) : null}
                {isAdmin ? (
                  <AccountRow
                    emoji="A"
                    label="Admin workspace"
                    sub="Organisation profile, team access, and guidance intelligence"
                    onPress={handleAdminWorkspace}
                  />
                ) : null}
                <AccountRow
                  emoji="P"
                  label="Portfolio"
                  sub="Artifacts, linked platforms, and XP"
                  onPress={() => go('/(tabs)/portfolio')}
                />
                <AccountRow
                  emoji="W"
                  label="Open Workspace"
                  sub="Continue from your active learning surface"
                  onPress={() => go(workspaceHref)}
                />
                <AccountRow
                  emoji="G"
                  label="Guilds + Community"
                  sub="Group progress, rankings, and chat"
                  onPress={() => go('/(tabs)/guild')}
                />
                <AccountRow
                  emoji="S"
                  label="Settings"
                  sub="Theme, notifications, and account state"
                  onPress={() => go('/(tabs)/settings')}
                />
                <WebDivider />
                <AccountRow
                  emoji="O"
                  label="Sign Out"
                  onPress={handleSignOut}
                  color={colors.accentRole.danger}
                />
              </WebCard>
            </WebCol>
          </WebRow>
        </WebShell>
      </SafeAreaView>
    );
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
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
            <Text style={[styles.settingsBtnText, { color: colors.textRole.muted }]}>⚙</Text>
          </TouchableOpacity>

          {/* Character with stage ring overlay */}
          <View style={styles.characterWrap}>
            <StageRing progress={progress} color={colors.accentRole.action} size={150} />
            <View style={styles.characterOverlay}>
              <WorkerCharacter stage={stage} trackId={trackId} size={110} mood="neutral" />
            </View>
          </View>

          <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.displayBold]}>{workspaceLabel.toUpperCase()}</Text>
          <Text style={[styles.stageName, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{stageName}</Text>
          <Text style={[styles.stageDesc, { color: colors.textRole.secondary }]}>
            {xp?.stage.description ?? workspaceBody}
          </Text>

          {/* XP + streak row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: colors.accentRole.action }, CompassFonts.displayBold]}>{xp?.totalXp ?? 0}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Total XP</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.borderRole.subtle }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: colors.accentRole.warning }, CompassFonts.displayBold]}>{streak?.streak ?? 0}🔥</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Day Streak</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.borderRole.subtle }]} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: colors.accentRole.status }, CompassFonts.displayBold]}>{stage} / 8</Text>
              <Text style={[styles.heroStatLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Stage</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Desk scene ── */}
        <Animated.View style={{ opacity: entranceAnim }}>
          <SectionCard title="YOUR WORKSTATION">
            <DeskScene stage={stage} trackId={trackId} width={320} height={160} />
            <Text style={[styles.deskLabel, { color: colors.textRole.muted }]}>
              Stage {stage} · {stageName}. {xp?.xpToNextStage ?? '—'} XP to the next upgrade.
            </Text>
          </SectionCard>
        </Animated.View>

        {/* ── Stage progress ── */}
        <SectionCard title="CAREER STAGES">
          {allStages.map((s) => {
            const isActive   = s.stage === stage;
            const isComplete = s.stage < stage;
            return (
              <View key={s.stage} style={[styles.stageRow, isActive && { backgroundColor: `${colors.accentRole.action}14`, borderRadius: Radius.md }]}>
                <View style={[styles.stageDot, {
                  backgroundColor: isComplete ? colors.accentRole.success : isActive ? colors.accentRole.action : colors.surface.sunken,
                  borderColor: isActive ? colors.accentRole.action : colors.borderRole.subtle,
                }]}>
                  <Text style={[{ fontSize: 10, color: isComplete || isActive ? colors.surface.inverse : colors.textRole.muted }, CompassFonts.displayBold]}>
                    {isComplete ? '✓' : s.stage}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stageRowName, { color: isActive ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodyBold]}>{s.name}</Text>
                  <Text style={[styles.stageRowRange, { color: colors.textRole.muted }]}>{s.minXp}–{s.maxXp} XP</Text>
                </View>
                {isActive && (
                  <View style={[styles.activeTag, { backgroundColor: colors.accentRole.action }]}>
                    <Text style={[styles.activeTagText, CompassFonts.displayBold]}>NOW</Text>
                  </View>
                )}
              </View>
            );
          })}
        </SectionCard>

        {/* ── Skills ── */}
        <SectionCard title="CURRENT FOCUS">
          <Text style={[styles.supportingCopy, { color: colors.textRole.secondary }]}>
            These focus areas reflect the direction of your current workspace.
          </Text>
          {skillBars.map(s => <SkillBar key={s.label} {...s} />)}
        </SectionCard>

        {/* ── Portfolio + Account ── */}
        <SectionCard title="WORKSPACE + ACCOUNT">
          {isGuest ? (
            <AccountRow
              emoji="G"
              label="Guest session"
              sub="Explore is open; saves, notes and alerts require an account"
              onPress={() => go('/(auth)/signup')}
            />
          ) : null}
          {isAdmin ? (
            <AccountRow
              emoji="A"
              label="Admin workspace"
              sub="Organisation profile, team access, and guidance intelligence"
              onPress={handleAdminWorkspace}
            />
          ) : null}
          <AccountRow
            emoji="💼" label="Portfolio"
            sub="Artifacts, linked platforms, and proof of work"
            onPress={() => go('/(tabs)/portfolio')}
          />
          <AccountRow
            emoji="🏝️" label="Open Workspace"
            sub={trackContext.mode === 'track' ? `Continue inside ${workspaceLabel}` : 'Choose the track you want to continue'}
            onPress={() => go(workspaceHref)}
          />
          <AccountRow
            emoji="👥" label="Guilds + Community"
            sub="Team progress, rankings, and guild chat"
            onPress={() => go('/(tabs)/guild')}
          />
          <AccountRow
            emoji="⚙" label="Settings"
            sub="Theme, notifications, and account state"
            onPress={() => go('/(tabs)/settings')}
          />
          <AccountRow
            emoji="●" label="Sign Out"
            onPress={handleSignOut}
            color={colors.accentRole.danger}
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
  scroll:           { ...webContainer, paddingBottom: Spacing.xxxl, gap: Spacing.md },

  heroSection:      { alignItems: 'center', paddingTop: Spacing.md, paddingBottom: Spacing.sm, position: 'relative' },
  settingsBtn:      { position: 'absolute', top: Spacing.md, right: 0 },
  settingsBtnText:  { fontSize: 18 },
  eyebrow:          { fontSize: FontSize.xs, letterSpacing: 0.8, marginTop: Spacing.md },
  characterWrap:    { position: 'relative', alignItems: 'center', justifyContent: 'center', width: 150, height: 150 },
  characterOverlay: { position: 'absolute' },
  ringBg:           { position: 'absolute' },
  ringFg:           {},
  stageName:        { fontSize: FontSize.lg, marginTop: Spacing.md },
  stageDesc:        { fontSize: FontSize.sm, textAlign: 'center', maxWidth: 280, marginTop: 4, lineHeight: 18 },
  heroStats:        { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: 0 },
  heroStat:         { flex: 1, alignItems: 'center' },
  heroStatValue:    { fontSize: FontSize.lg },
  heroStatLabel:    { fontSize: FontSize.xs, marginTop: 2 },
  heroStatDivider:  { width: 1, height: 32 },

  sectionCard:      { borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, gap: Spacing.md },
  sectionCardTitle: { fontSize: FontSize.xs, letterSpacing: 0.8, marginBottom: Spacing.xs },
  supportingCopy:   { fontSize: FontSize.xs, lineHeight: 18 },

  deskLabel:        { fontSize: FontSize.xs, textAlign: 'center', marginTop: Spacing.sm },

  stageRow:         { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 10, paddingHorizontal: Spacing.sm },
  stageDot:         { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stageRowName:     { fontSize: FontSize.sm },
  stageRowRange:    { fontSize: FontSize.xs, marginTop: 1 },
  activeTag:        { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  activeTagText:    { fontSize: 9, color: '#fff' },

  skillBarRow:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  skillBarLabel:    { fontSize: FontSize.xs, width: 130 },
  skillBarTrack:    { flex: 1, height: 7, borderRadius: Radius.full, position: 'relative', overflow: 'hidden' },
  skillBarBg:       { ...StyleSheet.absoluteFillObject },
  skillBarFill:     { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: Radius.full },
  skillBarPct:      { fontSize: FontSize.xs, width: 34, textAlign: 'right' },

  accountRow:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  accountRowEmoji:  { fontSize: 18 },
  accountRowLabel:  { fontSize: FontSize.sm },
  accountRowSub:    { fontSize: FontSize.xs, marginTop: 2 },
  accountRowArrow:  { fontSize: FontSize.lg },
  workspaceLabel:   { fontSize: FontSize.xs, letterSpacing: 0.8 },
  workspaceTitle:   { fontSize: FontSize.md },
  workspaceBody:    { fontSize: FontSize.sm, lineHeight: 20 },
});
